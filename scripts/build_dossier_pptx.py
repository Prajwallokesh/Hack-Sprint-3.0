import os
import sys
import json
from PIL import Image, ImageDraw, ImageFont
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

# -------------------------------------------------------------
# FONT INITIALIZATION
# -------------------------------------------------------------
font_dir = "C:/Windows/Fonts"
f_hero = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 68)
f_huge_team = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 60)
f_title = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 32)
f_member_name = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 30)
f_mid_b = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 20)
f_mid = ImageFont.truetype(os.path.join(font_dir, "segoeui.ttf"), 17)
f_mono_b = ImageFont.truetype(os.path.join(font_dir, "consolab.ttf"), 18)
f_phone = ImageFont.truetype(os.path.join(font_dir, "consolab.ttf"), 22)
f_badge = ImageFont.truetype(os.path.join(font_dir, "consolab.ttf"), 13)
f_small = ImageFont.truetype(os.path.join(font_dir, "segoeui.ttf"), 14)
f_sub = ImageFont.truetype(os.path.join(font_dir, "consolab.ttf"), 12)
f_index = ImageFont.truetype(os.path.join(font_dir, "segoeui.ttf"), 15)
f_index_b = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 15)

# -------------------------------------------------------------
# DRAWING HELPERS
# -------------------------------------------------------------
def draw_base_slide():
    width, height = 1920, 1080
    im = Image.new("RGBA", (width, height), "#FAFAF9")
    draw = ImageDraw.Draw(im)

    # Grid Pattern
    for x in range(30, width, 55):
        for y in range(30, height, 55):
            draw.ellipse((x, y, x + 2, y + 2), fill="#E4E4E7")

    # Top Quad-Color Ribbon
    strip_h = 8
    colors = ["#2563EB", "#EF4444", "#F59E0B", "#10B981"]
    seg_w = width // len(colors)
    for i, c in enumerate(colors):
        draw.rectangle((i * seg_w, 0, (i + 1) * seg_w, strip_h), fill=c)

    return im, draw

def draw_header_logos(im, draw, width=1920):
    # HackSprint Logo
    logo_path = "images/hacksprint-logo.png"
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert("RGBA")
        logo.thumbnail((72, 72))
        im.paste(logo, (50, 20), logo)

    draw.text((135, 24), "HACKSPRINT", fill="#09090B", font=f_title)
    draw.text((360, 24), "3.0", fill="#10B981", font=f_title)
    draw.text((135, 66), "24-HOUR OFFLINE HACKATHON  •  NOV 21-22, 2026", fill="#71717A", font=f_badge)

    # Right side: GLUE + Divider + COMPASS
    rx = width - 50
    glue_path = "images/glue-logo.png"
    if os.path.exists(glue_path):
        glogo = Image.open(glue_path).convert("RGBA")
        glogo.thumbnail((62, 62))
        rx -= 70
        im.paste(glogo, (rx, 24), glogo)

    rx -= 18
    draw.line((rx, 32, rx, 84), fill="#D4D4D8", width=2)
    rx -= 18

    comp_path = "images/compass-logo.png"
    if os.path.exists(comp_path):
        clogo = Image.open(comp_path).convert("RGBA")
        clogo.thumbnail((140, 52))
        rx -= 145
        im.paste(clogo, (rx, 30), clogo)

def draw_modern_card(draw, x, y, w, h, bg="#FFFFFF", border="#09090B", shadow_color="#09090B", radius=16, top_accent=None):
    offset = 5
    draw.rounded_rectangle((x + offset, y + offset, x + w + offset, y + h + offset), radius=radius, fill=shadow_color)
    draw.rounded_rectangle((x, y, x + w, y + h), radius=radius, fill=bg, outline=border, width=2)
    if top_accent:
        draw.rounded_rectangle((x + 2, y + 2, x + w - 2, y + 9), radius=radius // 2, fill=top_accent)

def draw_badge(draw, x, y, text, bg, fg, border=None, font=f_badge):
    bbox = font.getbbox(text)
    pw = bbox[2] - bbox[0] + 18
    ph = bbox[3] - bbox[1] + 10
    draw.rounded_rectangle((x, y, x + pw, y + ph), radius=8, fill=bg, outline=border or fg, width=1)
    draw.text((x + 9, y + 5), text, fill=fg, font=font)
    return pw + 10

def get_initials(name):
    if not name or name == "N/A":
        return "??"
    parts = name.strip().split()
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()

# -------------------------------------------------------------
# 1. RENDER TEAM SLIDE (1 TEAM PER SLIDE)
# -------------------------------------------------------------
def render_team_slide(team, slide_num, total_slides, output_path):
    width, height = 1920, 1080
    im, draw = draw_base_slide()
    draw_header_logos(im, draw, width)

    team_name = team.get("teamName", "Team")
    college = team.get("college", "GEC Hassan")
    is_hassan = (college == "GEC Hassan")
    
    leader = team.get("leader", {})
    members = team.get("members", [])
    fy_students = team.get("assignedFirstYears", [])

    # Calculate real builder count
    core_count = 1 + len(members)
    fy_count = len(fy_students)
    total_builders = core_count + fy_count

    # 1. Team Banner (y: 110 to 235)
    tb_x, tb_y, tb_w, tb_h = 50, 110, width - 100, 125
    accent = "#2563EB" if is_hassan else "#EA580C"
    draw_modern_card(draw, tb_x, tb_y, tb_w, tb_h, bg="#FFFFFF", border="#09090B", radius=18, top_accent=accent)

    # Dynamic team name sizing for very long names
    t_font = f_huge_team
    if len(team_name) > 20:
        t_font = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 48)
    draw.text((tb_x + 35, tb_y + 26), team_name, fill="#09090B", font=t_font)

    # Right side: Spacious Badges Block (Cleanly separated from Team Name!)
    right_block_x = tb_x + tb_w - 490
    by1 = tb_y + 28
    
    # Hero Badge: Count
    b_count_txt = f"{total_builders} BUILDERS"
    draw.rounded_rectangle((right_block_x, by1, right_block_x + 180, by1 + 42), radius=10, fill="#FEF08A", outline="#09090B", width=2)
    draw.text((right_block_x + 18, by1 + 10), b_count_txt, fill="#09090B", font=f_mono_b)

    # College Badge
    cx = right_block_x + 195
    col_bg = "#DCFCE7" if is_hassan else "#FFEDD5"
    col_fg = "#166534" if is_hassan else "#9A3412"
    col_txt = college.upper()
    if len(col_txt) > 16:
        col_txt = col_txt.replace("GOVERNMENT ENGINEERING COLLEGE", "GEC")
    draw.rounded_rectangle((cx, by1, tb_x + tb_w - 35, by1 + 42), radius=10, fill=col_bg, outline="#09090B", width=2)
    draw.text((cx + 16, by1 + 10), col_txt, fill=col_fg, font=f_mono_b)

    # Sub-badge row on right
    by2 = tb_y + 78
    if is_hassan:
        cfg_txt = f"SQUAD: {core_count} CORE + {fy_count} ALLOTTED 1ST-YR"
    else:
        cfg_txt = f"VISITING SQUAD • {core_count} CORE BUILDERS"
    draw.text((right_block_x + 5, by2), cfg_txt, fill="#71717A", font=f_badge)
    draw.text((right_block_x + 340, by2), "• VERIFIED", fill="#10B981", font=f_badge)

    # 2. Member Cards (Row 1: 3 cards, Row 2: 2 cards)
    card_gap = 24
    r1_y = 255
    r1_h = 375
    r1_w = (width - 100 - (card_gap * 2)) // 3

    # Helper for Core Member Cards (Top Row)
    def render_core_card(x, y, w, h, role_tag, tag_bg, tag_fg, accent_col, name, mobile, usn, year_branch, email, is_open=False):
        if is_open:
            # Slot Open card (for Thinkup / Teqora slot 3)
            draw_modern_card(draw, x, y, w, h, bg="#FAFAFA", border="#A1A1AA", shadow_color="#D4D4D8", radius=18)
            draw_badge(draw, x + 24, y + 20, "SLOT OPEN", bg="#F4F4F5", fg="#71717A", border="#A1A1AA", font=f_badge)
            draw.text((x + 24, y + 80), "[ SLOT 3 OPEN ]", fill="#71717A", font=f_member_name)
            draw.text((x + 24, y + 140), "Self-addition enabled in team portal.", fill="#52525B", font=f_mid)
            draw.text((x + 24, y + 175), "Team can register their 3rd builder directly.", fill="#71717A", font=f_small)
            return

        draw_modern_card(draw, x, y, w, h, bg="#FFFFFF", border="#09090B", radius=18, top_accent=accent_col)
        draw_badge(draw, x + 24, y + 20, role_tag, bg=tag_bg, fg=tag_fg, border=accent_col, font=f_badge)

        # Monogram
        initials = get_initials(name)
        chip_r = 18
        chip_cx, chip_cy = x + w - 38, y + 30
        draw.ellipse((chip_cx - chip_r, chip_cy - chip_r, chip_cx + chip_r, chip_cy + chip_r), fill=tag_bg, outline=accent_col, width=2)
        ibox = f_badge.getbbox(initials)
        iw = ibox[2] - ibox[0]
        draw.text((chip_cx - iw // 2, chip_cy - 7), initials, fill=tag_fg, font=f_badge)

        # Name
        draw.text((x + 24, y + 68), name[:24], fill="#09090B", font=f_member_name)

        # Phone Pill
        callout_y = y + 130
        callout_w = w - 48
        callout_h = 56
        draw.rounded_rectangle((x + 26, callout_y + 3, x + 24 + callout_w + 2, callout_y + callout_h + 3), radius=10, fill="#09090B")
        draw.rounded_rectangle((x + 24, callout_y, x + 24 + callout_w, callout_y + callout_h), radius=10, fill="#FEF9C3", outline="#09090B", width=2)
        draw.text((x + 36, callout_y + 14), f"MOB: {mobile}", fill="#09090B", font=f_phone)

        # Chips
        chip_y = y + 215
        draw.rounded_rectangle((x + 24, chip_y, x + 180, chip_y + 38), radius=8, fill="#F4F4F5", outline="#D4D4D8", width=1)
        draw.text((x + 36, chip_y + 9), usn or "N/A", fill="#18181B", font=f_mono_b)

        draw.rounded_rectangle((x + 192, chip_y, x + w - 24, chip_y + 38), radius=8, fill="#F4F4F5", outline="#D4D4D8", width=1)
        draw.text((x + 204, chip_y + 9), (year_branch or "Member")[:18], fill="#52525B", font=f_mid)

        # Email
        if email:
            draw.text((x + 26, y + 285), "EMAIL CONTACT", fill="#A1A1AA", font=f_sub)
            draw.text((x + 26, y + 310), email[:35], fill="#3F3F46", font=f_small)

    # 1. Leader (Card 1)
    render_core_card(50, r1_y, r1_w, r1_h,
                     role_tag="★ SQUAD LEADER", tag_bg="#DBEAFE", tag_fg="#1E40AF", accent_col="#2563EB",
                     name=leader.get("name", "Leader"), mobile=leader.get("mobile", "N/A"),
                     usn=leader.get("usn", "N/A"), year_branch=f"{leader.get('year', '')} • CSE" if leader.get('year') else "Leader",
                     email=leader.get("email", ""))

    # 2. Member 2 (Card 2)
    m2 = members[0] if len(members) > 0 else {}
    m2_name = m2.get("name")
    render_core_card(50 + r1_w + card_gap, r1_y, r1_w, r1_h,
                     role_tag="CORE BUILDER 02", tag_bg="#EDE9FE", tag_fg="#5B21B6", accent_col="#7C3AED",
                     name=m2_name or "Slot Open", mobile=m2.get("mobile", "N/A"),
                     usn=m2.get("usn", "N/A"), year_branch=f"{m2.get('year', '')} • Core",
                     email=m2.get("email", ""), is_open=(not m2_name))

    # 3. Member 3 (Card 3)
    m3 = members[1] if len(members) > 1 else {}
    m3_name = m3.get("name")
    render_core_card(50 + (r1_w + card_gap) * 2, r1_y, r1_w, r1_h,
                     role_tag="CORE BUILDER 03", tag_bg="#EDE9FE", tag_fg="#5B21B6", accent_col="#7C3AED",
                     name=m3_name or "Slot Open", mobile=m3.get("mobile", "N/A"),
                     usn=m3.get("usn", "N/A"), year_branch=f"{m3.get('year', '')} • Core",
                     email=m3.get("email", ""), is_open=(not m3_name))

    # Row 2: 2 cards (y: 650 to 1010)
    r2_y = 650
    r2_h = 360
    r2_w = (width - 100 - card_gap) // 2

    # Helper for Bottom Row (1st Years for Hassan, Core 4 & 5 for Visiting)
    def render_bottom_card(x, y, w, h, badge_txt, tag_bg, tag_fg, accent_col, name, mobile, usn, branch, email, is_pool=True):
        draw_modern_card(draw, x, y, w, h, bg="#FFFFFF", border="#09090B", radius=18, top_accent=accent_col)
        draw_badge(draw, x + 24, y + 20, badge_txt, bg=tag_bg, fg=tag_fg, border=accent_col, font=f_badge)

        initials = get_initials(name)
        chip_r = 18
        chip_cx, chip_cy = x + w - 38, y + 30
        draw.ellipse((chip_cx - chip_r, chip_cy - chip_r, chip_cx + chip_r, chip_cy + chip_r), fill=tag_bg, outline=accent_col, width=2)
        ibox = f_badge.getbbox(initials)
        iw = ibox[2] - ibox[0]
        draw.text((chip_cx - iw // 2, chip_cy - 7), initials, fill=tag_fg, font=f_badge)

        draw.text((x + 24, y + 68), name[:28], fill="#09090B", font=f_member_name)

        # Phone Button
        callout_y = y + 130
        callout_w = 400
        callout_h = 56
        draw.rounded_rectangle((x + 26, callout_y + 3, x + 24 + callout_w + 2, callout_y + callout_h + 3), radius=10, fill="#09090B")
        draw.rounded_rectangle((x + 24, callout_y, x + 24 + callout_w, callout_y + callout_h), radius=10, fill=tag_bg, outline="#09090B", width=2)
        draw.text((x + 36, callout_y + 14), f"MOB: {mobile}", fill=tag_fg, font=f_phone)

        # Right side info block
        info_x = x + 445
        draw.rounded_rectangle((info_x, callout_y, info_x + 195, callout_y + 56), radius=8, fill="#F4F4F5", outline="#D4D4D8", width=1)
        draw.text((info_x + 16, callout_y + 10), "USN", fill="#A1A1AA", font=f_sub)
        draw.text((info_x + 16, callout_y + 28), usn or "N/A", fill="#18181B", font=f_mono_b)

        branch_x = info_x + 210
        draw.rounded_rectangle((branch_x, callout_y, x + w - 24, callout_y + 56), radius=8, fill="#F4F4F5", outline="#D4D4D8", width=1)
        draw.text((branch_x + 16, callout_y + 10), "BRANCH / YEAR", fill="#A1A1AA", font=f_sub)
        draw.text((branch_x + 16, callout_y + 28), (branch or "Engineering")[:16], fill="#18181B", font=f_mid_b)

        # Bottom info row
        draw.text((x + 26, y + 225), "EMAIL CONTACT", fill="#A1A1AA", font=f_sub)
        draw.text((x + 26, y + 250), email[:38] if email else "N/A", fill="#3F3F46", font=f_small)

        draw.text((info_x, y + 225), "SQUAD ALLOTMENT CHANNEL", fill="#A1A1AA", font=f_sub)
        pool_txt = "Allotted from Official 1st-Year Talent Pool" if is_pool else "Direct Visiting College Registration"
        draw.text((info_x, y + 250), pool_txt, fill=accent_col, font=f_mono_b)

    if is_hassan:
        # Card 4: First Year 1
        fy1 = fy_students[0] if len(fy_students) > 0 else {}
        render_bottom_card(50, r2_y, r2_w, r2_h,
                           badge_txt="🌱 1ST-YEAR ALLOTTED BUILDER #1", tag_bg="#DCFCE7", tag_fg="#166534", accent_col="#10B981",
                           name=fy1.get("name", "Pending Allotment"), mobile=fy1.get("mobile", "N/A"),
                           usn="4GH26CS000", branch=f"{fy1.get('branch', 'CSE')} • 1st Yr",
                           email=fy1.get("email", ""), is_pool=True)

        # Card 5: First Year 2
        fy2 = fy_students[1] if len(fy_students) > 1 else {}
        render_bottom_card(50 + r2_w + card_gap, r2_y, r2_w, r2_h,
                           badge_txt="🌱 1ST-YEAR ALLOTTED BUILDER #2", tag_bg="#DCFCE7", tag_fg="#166534", accent_col="#10B981",
                           name=fy2.get("name", "Pending Allotment"), mobile=fy2.get("mobile", "N/A"),
                           usn="4GH26CS000", branch=f"{fy2.get('branch', 'CSE')} • 1st Yr",
                           email=fy2.get("email", ""), is_pool=True)
    else:
        # Visiting teams: Core members 4 & 5
        m4 = members[2] if len(members) > 2 else {}
        render_bottom_card(50, r2_y, r2_w, r2_h,
                           badge_txt="CORE BUILDER 04", tag_bg="#FFEDD5", tag_fg="#9A3412", accent_col="#EA580C",
                           name=m4.get("name", "Member 4"), mobile=m4.get("mobile", "N/A"),
                           usn=m4.get("usn", "N/A"), branch=f"{m4.get('year', '')} • Core",
                           email=m4.get("email", ""), is_pool=False)

        m5 = members[3] if len(members) > 3 else {}
        render_bottom_card(50 + r2_w + card_gap, r2_y, r2_w, r2_h,
                           badge_txt="CORE BUILDER 05", tag_bg="#FFEDD5", tag_fg="#9A3412", accent_col="#EA580C",
                           name=m5.get("name", "Member 5"), mobile=m5.get("mobile", "N/A"),
                           usn=m5.get("usn", "N/A"), branch=f"{m5.get('year', '')} • Core",
                           email=m5.get("email", ""), is_pool=False)

    # 3. Footer
    draw.line((50, 1030, width - 50, 1030), fill="#E4E4E7", width=1)
    draw.text((50, 1045), "HackSprint 3.0  •  COMPASS x GLUE  •  Government Engineering College, Hassan", fill="#A1A1AA", font=f_small)
    slide_tag = f"SLIDE {slide_num:02d} OF {total_slides:02d}"
    draw.text((width - 240, 1045), slide_tag, fill="#09090B", font=f_mono_b)

    im.save(output_path, "PNG")

# -------------------------------------------------------------
# 2. RENDER COVER SLIDE
# -------------------------------------------------------------
def render_cover_slide(output_path):
    width, height = 1920, 1080
    im, draw = draw_base_slide()

    # Central Hero Box
    box_w, box_h = 1300, 750
    box_x, box_y = (width - box_w) // 2, (height - box_h) // 2
    draw_modern_card(draw, box_x, box_y, box_w, box_h, bg="#FFFFFF", border="#09090B", radius=24, top_accent="#2563EB")

    # Center Logo
    logo_path = "images/hacksprint-logo.png"
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert("RGBA")
        logo.thumbnail((160, 160))
        im.paste(logo, ((width - 160) // 2, box_y + 60), logo)

    # Hero Title
    draw.text((box_x + 320, box_y + 240), "HACKSPRINT", fill="#09090B", font=f_hero)
    draw.text((box_x + 820, box_y + 240), "3.0", fill="#10B981", font=f_hero)

    # Subtitle
    draw.text((box_x + 360, box_y + 340), "24-HOUR OFFLINE STATE-LEVEL HACKATHON", fill="#475569", font=f_mono_b)
    draw.text((box_x + 380, box_y + 380), "OFFICIAL REGISTERED TEAMS & BUILDERS DOSSIER", fill="#2563EB", font=f_title)

    # Stats Ribbon inside box
    rib_y = box_y + 460
    draw.rounded_rectangle((box_x + 80, rib_y, box_x + box_w - 80, rib_y + 90), radius=14, fill="#FEF08A", outline="#09090B", width=2)
    draw.text((box_x + 130, rib_y + 28), "40 CONFIRMED SQUADS", fill="#09090B", font=f_title)
    draw.text((box_x + 580, rib_y + 28), "|", fill="#A1A1AA", font=f_title)
    draw.text((box_x + 630, rib_y + 28), "198 ACTIVE BUILDERS", fill="#09090B", font=f_title)
    draw.text((box_x + 1060, rib_y + 28), "|", fill="#A1A1AA", font=f_title)
    draw.text((box_x + 1090, rib_y + 28), "NOV 21-22, 2026", fill="#166534", font=f_title)

    # Host logos bottom
    hl_y = box_y + 590
    draw.text((box_x + 120, hl_y + 20), "PRESENTED BY:", fill="#71717A", font=f_badge)
    
    comp_path = "images/compass-logo.png"
    if os.path.exists(comp_path):
        clogo = Image.open(comp_path).convert("RGBA")
        clogo.thumbnail((160, 60))
        im.paste(clogo, (box_x + 280, hl_y + 5), clogo)

    glue_path = "images/glue-logo.png"
    if os.path.exists(glue_path):
        glogo = Image.open(glue_path).convert("RGBA")
        glogo.thumbnail((65, 65))
        im.paste(glogo, (box_x + 500, hl_y), glogo)

    gec_path = "images/geclogo.png"
    if os.path.exists(gec_path):
        geclogo = Image.open(gec_path).convert("RGBA")
        geclogo.thumbnail((65, 65))
        im.paste(geclogo, (box_x + 600, hl_y), geclogo)

    draw.text((box_x + 700, hl_y + 15), "GOVERNMENT ENGINEERING COLLEGE, HASSAN", fill="#09090B", font=f_mid_b)
    draw.text((box_x + 700, hl_y + 42), "Department of Computer Science & Engineering", fill="#71717A", font=f_small)

    im.save(output_path, "PNG")

# -------------------------------------------------------------
# 3. RENDER TABLE OF CONTENTS / DIRECTORY SLIDE
# -------------------------------------------------------------
def render_index_slide(teams, output_path):
    width, height = 1920, 1080
    im, draw = draw_base_slide()
    draw_header_logos(im, draw, width)

    # Title Card
    draw.text((50, 115), "TEAM DIRECTORY & SLIDE INDEX", fill="#09090B", font=f_title)
    draw.text((50, 155), "Quick reference guide for hackathon organizers, track mentors, and evaluators.", fill="#71717A", font=f_small)

    # 3 Columns for 40 teams
    col_w = (width - 100 - 40) // 3
    y_start = 200
    row_h = 58

    for i, t in enumerate(teams):
        col_idx = i // 14
        row_idx = i % 14
        cx = 50 + col_idx * (col_w + 20)
        cy = y_start + row_idx * row_h

        # Small team card
        lead = t.get("leader", {}).get("name", "Leader")
        col = t.get("college", "GEC Hassan")
        b_count = 1 + len(t.get("members", [])) + len(t.get("assignedFirstYears", []))
        slide_target = f"Slide {i + 3:02d}"

        bg = "#FFFFFF" if col == "GEC Hassan" else "#FFFBEB"
        draw.rounded_rectangle((cx, cy, cx + col_w, cy + 50), radius=8, fill=bg, outline="#D4D4D8", width=1)
        
        # Team Name & Lead
        draw.text((cx + 12, cy + 8), f"#{i+1:02d}  {t.get('teamName')[:18]}", fill="#09090B", font=f_index_b)
        draw.text((cx + 12, cy + 28), f"{lead[:16]}  •  {col[:14]}", fill="#71717A", font=f_sub)

        # Slide pill
        draw.rounded_rectangle((cx + col_w - 95, cy + 12, cx + col_w - 10, cy + 38), radius=6, fill="#F4F4F5")
        draw.text((cx + col_w - 85, cy + 16), slide_target, fill="#2563EB", font=f_sub)

    im.save(output_path, "PNG")

# -------------------------------------------------------------
# 4. RENDER SUMMARY / CONTACT SLIDE
# -------------------------------------------------------------
def render_summary_slide(output_path):
    width, height = 1920, 1080
    im, draw = draw_base_slide()
    draw_header_logos(im, draw, width)

    # Container
    box_w, box_h = width - 100, 850
    box_x, box_y = 50, 115
    draw_modern_card(draw, box_x, box_y, box_w, box_h, bg="#FFFFFF", border="#09090B", radius=20, top_accent="#10B981")

    draw.text((box_x + 40, box_y + 30), "EVENT EXECUTION & ORGANIZER CONTACTS", fill="#09090B", font=f_title)
    draw.text((box_x + 40, box_y + 70), "HackSprint 3.0 Operational Command  •  Government Engineering College, Hassan", fill="#71717A", font=f_mid)

    # 3 Large info blocks
    b_w = (box_w - 80 - 40) // 3
    b_h = 660
    b_y = box_y + 120

    # Block 1: Event Schedule
    bx1 = box_x + 40
    draw_modern_card(draw, bx1, b_y, b_w, b_h, bg="#F8FAFC", border="#09090B", radius=16, top_accent="#2563EB")
    draw_badge(draw, bx1 + 20, b_y + 20, "24-HOUR TIMELINE", bg="#DBEAFE", fg="#1E40AF", font=f_badge)
    draw.text((bx1 + 20, b_y + 65), "Schedule of Rounds", fill="#09090B", font=f_mid_b)
    
    timeline_items = [
        ("Nov 21 • 02:00 PM", "Reporting & Registration Kit Pickup"),
        ("Nov 21 • 03:00 PM", "Hackathon Opening Ceremony"),
        ("Nov 21 • 03:30 PM", "Sprint Begins (Continuous 24-Hr Hack)"),
        ("Nov 21 • 08:30 PM", "Round 1 Mentorship & Check-in"),
        ("Nov 22 • 08:00 AM", "Breakfast & Progress Review"),
        ("Nov 22 • 01:00 PM", "Code Freeze & Final PPT Prep"),
        ("Nov 22 • 02:00 PM", "Jury Evaluation & Pitching"),
        ("Nov 22 • 04:00 PM", "Valedictory & Prize Distribution"),
    ]
    ty = b_y + 110
    for dt, desc in timeline_items:
        draw.text((bx1 + 20, ty), dt, fill="#2563EB", font=f_mono_b)
        draw.text((bx1 + 20, ty + 24), desc, fill="#334155", font=f_small)
        ty += 65

    # Block 2: Key Organizer Contacts
    bx2 = bx1 + b_w + 20
    draw_modern_card(draw, bx2, b_y, b_w, b_h, bg="#F8FAFC", border="#09090B", radius=16, top_accent="#EA580C")
    draw_badge(draw, bx2 + 20, b_y + 20, "EMERGENCY CONTACTS", bg="#FFEDD5", fg="#9A3412", font=f_badge)
    draw.text((bx2 + 20, b_y + 65), "Core Coordinators", fill="#09090B", font=f_mid_b)

    contacts = [
        ("Prajwal Lokesh", "Student Lead / Webmaster", "📞 +91 82175 45904"),
        ("Akash C O", "Treasurer / Finance Lead", "📞 +91 70190 73909"),
        ("COMPASS Association", "CS Dept Student Body", "✉ gechassan.compass@gmail.com"),
        ("GLUE Community", "Technical Partner", "✉ glue.gech@gmail.com"),
        ("Faculty In-Charge", "CSE Department, GECH", "📞 +91 81722 40383"),
    ]
    cy = b_y + 120
    for name, role, mob in contacts:
        draw.text((bx2 + 20, cy), name, fill="#09090B", font=f_mid_b)
        draw.text((bx2 + 20, cy + 24), role, fill="#71717A", font=f_small)
        draw.rounded_rectangle((bx2 + 20, cy + 48, bx2 + b_w - 20, cy + 86), radius=8, fill="#FEF9C3", outline="#09090B", width=1)
        draw.text((bx2 + 32, cy + 56), mob, fill="#09090B", font=f_phone)
        cy += 105

    # Block 3: Rules & Guidelines
    bx3 = bx2 + b_w + 20
    draw_modern_card(draw, bx3, b_y, b_w, b_h, bg="#F8FAFC", border="#09090B", radius=16, top_accent="#10B981")
    draw_badge(draw, bx3 + 20, b_y + 20, "VENUE GUIDELINES", bg="#DCFCE7", fg="#166534", font=f_badge)
    draw.text((bx3 + 20, b_y + 65), "Rules & Protocols", fill="#09090B", font=f_mid_b)

    rules = [
        "1. All members must wear HackSprint badges at all times.",
        "2. Wi-Fi and power strips are provided at every team station.",
        "3. Teams must push code commits to their designated GitHub repo.",
        "4. Mentors will conduct 2 mandatory verification checkpoints.",
        "5. 1st-year students must actively participate in design/testing.",
        "6. Food, refreshments, and midnight snacks provided in the hall.",
        "7. For queries or technical support, visit the Help Desk in Lab 2.",
    ]
    ry = b_y + 120
    for r in rules:
        draw.text((bx3 + 20, ry), r, fill="#334155", font=f_mid)
        ry += 60

    im.save(output_path, "PNG")

# -------------------------------------------------------------
# MAIN PPTX GENERATION SCRIPT
# -------------------------------------------------------------
def build_pptx():
    print("Loading scratch/teams_data.json...")
    with open("scratch/teams_data.json", "r", encoding="utf-8") as f:
        teams = json.load(f)

    # Sort: GEC Hassan first (by seatNumber), then Other GECs
    hassan_teams = sorted([t for t in teams if t.get("college") == "GEC Hassan"], key=lambda x: x.get("seatNumber", 999))
    other_teams = sorted([t for t in teams if t.get("college") != "GEC Hassan"], key=lambda x: (x.get("college", ""), x.get("seatNumber", 999)))
    all_teams = hassan_teams + other_teams

    total_teams = len(all_teams)
    print(f"Prepared {len(hassan_teams)} Hassan teams + {len(other_teams)} Other GEC teams = {total_teams} total teams.")

    slides_dir = "scratch/slides"
    os.makedirs(slides_dir, exist_ok=True)

    # 1. Render Cover Slide
    cover_img = os.path.join(slides_dir, "slide_01_cover.png")
    print("Rendering Slide 01: Cover...")
    render_cover_slide(cover_img)

    # 2. Render Index Slide
    index_img = os.path.join(slides_dir, "slide_02_index.png")
    print("Rendering Slide 02: Team Directory & Index...")
    render_index_slide(all_teams, index_img)

    # 3. Render 40 Team Slides
    team_images = []
    for idx, team in enumerate(all_teams, 1):
        slide_img = os.path.join(slides_dir, f"slide_{idx+2:02d}_{team.get('teamName', 'Team')}.png")
        print(f"Rendering Slide {idx+2:02d}: {team.get('teamName')} ({team.get('college')})...")
        render_team_slide(team, idx, total_teams, slide_img)
        team_images.append((idx + 2, team, slide_img))

    # 4. Render Summary Slide
    summary_img = os.path.join(slides_dir, f"slide_{total_teams+3:02d}_summary.png")
    print(f"Rendering Slide {total_teams+3:02d}: Summary & Operations...")
    render_summary_slide(summary_img)

    # ---------------------------------------------------------
    # ASSEMBLE POWERPOINT PRESENTATION (.pptx)
    # ---------------------------------------------------------
    print("\nAssembling PowerPoint Presentation using python-pptx...")
    prs = Presentation()
    prs.slide_width = Inches(13.333) # 16:9 widescreen
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # blank slide

    # Slide 1: Cover
    slide1 = prs.slides.add_slide(blank_layout)
    slide1.shapes.add_picture(cover_img, Inches(0), Inches(0), width=Inches(13.333), height=Inches(7.5))

    # Slide 2: Index
    slide2 = prs.slides.add_slide(blank_layout)
    slide2.shapes.add_picture(index_img, Inches(0), Inches(0), width=Inches(13.333), height=Inches(7.5))

    # Slides 3 to 42: Team Slides
    for slide_idx, team, img_path in team_images:
        slide = prs.slides.add_slide(blank_layout)
        # Background picture
        slide.shapes.add_picture(img_path, Inches(0), Inches(0), width=Inches(13.333), height=Inches(7.5))

        # Add an invisible/transparent searchable text frame with all names & phone numbers
        # This makes the presentation 100% full-text searchable in PowerPoint/Google Slides
        tx_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(12), Inches(1))
        tf = tx_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        
        # Compile searchable text
        lead = team.get("leader", {})
        search_terms = [
            team.get("teamName", ""),
            team.get("college", ""),
            lead.get("name", ""), lead.get("mobile", ""), lead.get("usn", "")
        ]
        for m in team.get("members", []):
            search_terms.extend([m.get("name", ""), m.get("mobile", ""), m.get("usn", "")])
        for fy in team.get("assignedFirstYears", []):
            search_terms.extend([fy.get("name", ""), fy.get("mobile", ""), fy.get("usn", "")])

        p.text = " | ".join([s for s in search_terms if s])
        p.font.size = Pt(1)
        p.font.color.rgb = RGBColor(250, 250, 249) # Matches background color

    # Slide 43: Summary
    slide_sum = prs.slides.add_slide(blank_layout)
    slide_sum.shapes.add_picture(summary_img, Inches(0), Inches(0), width=Inches(13.333), height=Inches(7.5))

    output_pptx = "HackSprint_3.0_Teams_Dossier.pptx"
    prs.save(output_pptx)
    print(f"\nSUCCESS! Created presentation: {output_pptx}")
    print(f"Total slides: {len(prs.slides)}")
    file_size_mb = os.path.getsize(output_pptx) / (1024 * 1024)
    print(f"File size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    build_pptx()
