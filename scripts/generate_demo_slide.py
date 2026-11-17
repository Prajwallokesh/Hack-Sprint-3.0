import os
import sys
from PIL import Image, ImageDraw, ImageFont

def render_refined_slide(output_path):
    width, height = 1920, 1080
    im = Image.new("RGBA", (width, height), "#FAFAF9")
    draw = ImageDraw.Draw(im)

    # Fonts
    font_dir = "C:/Windows/Fonts"
    f_huge_team = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 62) # Big, heroic team name
    f_title = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 32)
    f_member_name = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 32) # Big, attractive member name
    f_mid_b = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 20)
    f_mid = ImageFont.truetype(os.path.join(font_dir, "segoeui.ttf"), 17)
    f_mono_b = ImageFont.truetype(os.path.join(font_dir, "consolab.ttf"), 18)
    f_phone = ImageFont.truetype(os.path.join(font_dir, "consolab.ttf"), 22)
    f_badge = ImageFont.truetype(os.path.join(font_dir, "consolab.ttf"), 13)
    f_badge_lg = ImageFont.truetype(os.path.join(font_dir, "consolab.ttf"), 16)
    f_small = ImageFont.truetype(os.path.join(font_dir, "segoeui.ttf"), 14)
    f_sub = ImageFont.truetype(os.path.join(font_dir, "consolab.ttf"), 12)

    # 1. Subtle Modern Grid Pattern
    for x in range(30, width, 55):
        for y in range(30, height, 55):
            draw.ellipse((x, y, x + 2, y + 2), fill="#E4E4E7")

    # 2. Top Google Quad-Color Accent Strip
    strip_h = 8
    colors = ["#2563EB", "#EF4444", "#F59E0B", "#10B981"]
    seg_w = width // len(colors)
    for i, c in enumerate(colors):
        draw.rectangle((i * seg_w, 0, (i + 1) * seg_w, strip_h), fill=c)

    # 3. Header Bar (y: 20 to 100)
    # Left: HackSprint Logo + Name
    logo_path = "images/hacksprint-logo.png"
    if os.path.exists(logo_path):
        logo = Image.open(logo_path).convert("RGBA")
        logo.thumbnail((72, 72))
        im.paste(logo, (50, 20), logo)

    draw.text((135, 24), "HACKSPRINT", fill="#09090B", font=f_title)
    draw.text((360, 24), "3.0", fill="#10B981", font=f_title)
    draw.text((135, 66), "24-HOUR OFFLINE HACKATHON  •  NOV 21-22, 2026", fill="#71717A", font=f_badge)

    # Right: COMPASS Logo + Divider + GLUE Logo
    rx = width - 50
    # GLUE Logo
    glue_path = "images/glue-logo.png"
    if os.path.exists(glue_path):
        glogo = Image.open(glue_path).convert("RGBA")
        glogo.thumbnail((62, 62))
        rx -= 70
        im.paste(glogo, (rx, 24), glogo)

    # Divider
    rx -= 18
    draw.line((rx, 32, rx, 84), fill="#D4D4D8", width=2)
    rx -= 18

    # COMPASS Logo
    comp_path = "images/compass-logo.png"
    if os.path.exists(comp_path):
        clogo = Image.open(comp_path).convert("RGBA")
        clogo.thumbnail((140, 52))
        rx -= 145
        im.paste(clogo, (rx, 30), clogo)

    # Helper: Draw smooth rounded card with drop shadow
    def draw_modern_card(x, y, w, h, bg="#FFFFFF", border="#09090B", shadow_color="#09090B", radius=16, top_accent=None):
        offset = 5
        draw.rounded_rectangle((x + offset, y + offset, x + w + offset, y + h + offset), radius=radius, fill=shadow_color)
        draw.rounded_rectangle((x, y, x + w, y + h), radius=radius, fill=bg, outline=border, width=2)
        if top_accent:
            draw.rounded_rectangle((x + 2, y + 2, x + w - 2, y + 9), radius=radius // 2, fill=top_accent)

    # Helper: Draw pill badge
    def draw_badge(x, y, text, bg, fg, border=None, font=f_badge):
        bbox = font.getbbox(text)
        pw = bbox[2] - bbox[0] + 18
        ph = bbox[3] - bbox[1] + 10
        draw.rounded_rectangle((x, y, x + pw, y + ph), radius=8, fill=bg, outline=border or fg, width=1)
        draw.text((x + 9, y + 5), text, fill=fg, font=font)
        return pw + 10

    # 4. Team Banner (y: 110 to 235 - Height = 125px with plenty of breathing room!)
    tb_x, tb_y, tb_w, tb_h = 50, 110, width - 100, 125
    draw_modern_card(tb_x, tb_y, tb_w, tb_h, bg="#FFFFFF", border="#09090B", radius=18, top_accent="#2563EB")

    # Team Name (HUGE 62pt, spacious, uncluttered!)
    draw.text((tb_x + 35, tb_y + 25), "VICTORY CREWS", fill="#09090B", font=f_huge_team)

    # Right side: Spacious Badges Block (Cleanly separated from Team Name!)
    right_block_x = tb_x + tb_w - 480
    
    # Top Row of Badges on Right
    bx = right_block_x
    by1 = tb_y + 28
    # Big Hero Badge: "5 BUILDERS"
    draw.rounded_rectangle((bx, by1, bx + 175, by1 + 42), radius=10, fill="#FEF08A", outline="#09090B", width=2)
    draw.text((bx + 18, by1 + 10), "5 BUILDERS", fill="#09090B", font=f_mono_b)

    # College Badge: "GEC HASSAN"
    cx = bx + 190
    draw.rounded_rectangle((cx, by1, tb_x + tb_w - 35, by1 + 42), radius=10, fill="#DCFCE7", outline="#09090B", width=2)
    draw.text((cx + 25, by1 + 10), "GEC HASSAN", fill="#166534", font=f_mono_b)

    # Bottom Row of Badges on Right
    by2 = tb_y + 78
    draw.text((right_block_x + 5, by2), "SQUAD CONFIG: 3 CORE + 2 ALLOTTED 1ST-YEAR", fill="#71717A", font=f_badge)
    draw.text((right_block_x + 335, by2), "• VERIFIED", fill="#10B981", font=f_badge)

    # 5. Row 1: 3 Core Builders (y: 255 to 630 - Height = 375px)
    card_gap = 24
    r1_y = 255
    r1_h = 375
    r1_w = (width - 100 - (card_gap * 2)) // 3

    def draw_member_card(x, y, w, h, role_tag, tag_bg, tag_fg, accent_col, initials, name, mobile, usn, year_branch, email):
        draw_modern_card(x, y, w, h, bg="#FFFFFF", border="#09090B", radius=18, top_accent=accent_col)

        # Header Row: Role Tag (Left) + Initials Chip (Right)
        draw_badge(x + 24, y + 20, role_tag, bg=tag_bg, fg=tag_fg, border=accent_col, font=f_badge)

        # Initials Monogram Avatar (Right)
        chip_r = 18
        chip_cx, chip_cy = x + w - 38, y + 30
        draw.ellipse((chip_cx - chip_r, chip_cy - chip_r, chip_cx + chip_r, chip_cy + chip_r), fill=tag_bg, outline=accent_col, width=2)
        ibox = f_badge.getbbox(initials)
        iw = ibox[2] - ibox[0]
        draw.text((chip_cx - iw // 2, chip_cy - 7), initials, fill=tag_fg, font=f_badge)

        # Member Name (BIG, STYLISH 32pt, ATTRACTIVE!)
        draw.text((x + 24, y + 68), name, fill="#09090B", font=f_member_name)

        # Mobile Callout (Clean, attractive action pill)
        callout_y = y + 130
        callout_w = w - 48
        callout_h = 56
        # Shadow for pill
        draw.rounded_rectangle((x + 26, callout_y + 3, x + 24 + callout_w + 2, callout_y + callout_h + 3), radius=10, fill="#09090B")
        draw.rounded_rectangle((x + 24, callout_y, x + 24 + callout_w, callout_y + callout_h), radius=10, fill="#FEF9C3", outline="#09090B", width=2)
        draw.text((x + 40, callout_y + 14), f"MOB: {mobile}", fill="#09090B", font=f_phone)

        # Metadata Chips Row (USN + Academic Year/Branch)
        chip_y = y + 215
        # USN Chip
        draw.rounded_rectangle((x + 24, chip_y, x + 175, chip_y + 38), radius=8, fill="#F4F4F5", outline="#D4D4D8", width=1)
        draw.text((x + 36, chip_y + 9), usn, fill="#18181B", font=f_mono_b)

        # Branch/Year Chip
        draw.rounded_rectangle((x + 188, chip_y, x + w - 24, chip_y + 38), radius=8, fill="#F4F4F5", outline="#D4D4D8", width=1)
        draw.text((x + 200, chip_y + 9), year_branch, fill="#52525B", font=f_mid)

        # Email at Bottom
        if email:
            draw.text((x + 26, y + 285), "EMAIL CONTACT", fill="#A1A1AA", font=f_sub)
            draw.text((x + 26, y + 310), email, fill="#3F3F46", font=f_small)

    # Member 1: Leader
    m1_x = 50
    draw_member_card(m1_x, r1_y, r1_w, r1_h,
                     role_tag="★ SQUAD LEADER", tag_bg="#DBEAFE", tag_fg="#1E40AF", accent_col="#2563EB",
                     initials="AP", name="Amulya P Y", mobile="7411069659",
                     usn="4GH25CS006", year_branch="2nd Yr • CSE", email="amulyayogeshgowda@gmail.com")

    # Member 2: Core Builder 2
    m2_x = m1_x + r1_w + card_gap
    draw_member_card(m2_x, r1_y, r1_w, r1_h,
                     role_tag="CORE BUILDER 02", tag_bg="#EDE9FE", tag_fg="#5B21B6", accent_col="#7C3AED",
                     initials="KN", name="Kushal N", mobile="7975457499",
                     usn="4GH25CS052", year_branch="2nd Yr • CSE", email="kushal.n@gechassan.ac.in")

    # Member 3: Core Builder 3
    m3_x = m2_x + r1_w + card_gap
    draw_member_card(m3_x, r1_y, r1_w, r1_h,
                     role_tag="CORE BUILDER 03", tag_bg="#EDE9FE", tag_fg="#5B21B6", accent_col="#7C3AED",
                     initials="AP", name="Aneesh Pinto", mobile="7795739680",
                     usn="4GH25CS008", year_branch="2nd Yr • CSE", email="aneesh.pinto@gechassan.ac.in")

    # 6. Row 2: 2 Allotted 1st-Year Students (y: 650 to 1010 - Height = 360px)
    r2_y = 650
    r2_h = 360
    r2_w = (width - 100 - card_gap) // 2

    def draw_first_year_card(x, y, w, h, badge_txt, initials, name, mobile, usn, branch, email):
        draw_modern_card(x, y, w, h, bg="#FFFFFF", border="#09090B", radius=18, top_accent="#10B981")

        # Top Badge + Initials Chip
        draw_badge(x + 24, y + 20, badge_txt, bg="#DCFCE7", fg="#166534", border="#10B981", font=f_badge)

        chip_r = 18
        chip_cx, chip_cy = x + w - 38, y + 30
        draw.ellipse((chip_cx - chip_r, chip_cy - chip_r, chip_cx + chip_r, chip_cy + chip_r), fill="#DCFCE7", outline="#10B981", width=2)
        ibox = f_badge.getbbox(initials)
        iw = ibox[2] - ibox[0]
        draw.text((chip_cx - iw // 2, chip_cy - 7), initials, fill="#166534", font=f_badge)

        # Member Name (BIG 32pt, ATTRACTIVE!)
        draw.text((x + 24, y + 68), name, fill="#09090B", font=f_member_name)

        # Left Column: Phone Button
        callout_y = y + 130
        callout_w = 400
        callout_h = 56
        draw.rounded_rectangle((x + 26, callout_y + 3, x + 24 + callout_w + 2, callout_y + callout_h + 3), radius=10, fill="#09090B")
        draw.rounded_rectangle((x + 24, callout_y, x + 24 + callout_w, callout_y + callout_h), radius=10, fill="#DCFCE7", outline="#09090B", width=2)
        draw.text((x + 40, callout_y + 14), f"MOB: {mobile}", fill="#166534", font=f_phone)

        # Right Column: USN Chip & Branch Chip
        info_x = x + 445
        # USN Chip
        draw.rounded_rectangle((info_x, callout_y, info_x + 195, callout_y + 56), radius=8, fill="#F4F4F5", outline="#D4D4D8", width=1)
        draw.text((info_x + 16, callout_y + 10), "USN (1ST-YEAR)", fill="#A1A1AA", font=f_sub)
        draw.text((info_x + 16, callout_y + 28), usn, fill="#18181B", font=f_mono_b)

        # Branch Chip
        branch_x = info_x + 210
        draw.rounded_rectangle((branch_x, callout_y, x + w - 24, callout_y + 56), radius=8, fill="#F4F4F5", outline="#D4D4D8", width=1)
        draw.text((branch_x + 16, callout_y + 10), "ACADEMIC BRANCH", fill="#A1A1AA", font=f_sub)
        draw.text((branch_x + 16, callout_y + 28), f"{branch} • 1st Year", fill="#18181B", font=f_mid_b)

        # Bottom row
        draw.text((x + 26, y + 225), "EMAIL CONTACT", fill="#A1A1AA", font=f_sub)
        draw.text((x + 26, y + 250), email, fill="#3F3F46", font=f_small)

        draw.text((info_x, y + 225), "ALLOTMENT STATUS", fill="#A1A1AA", font=f_sub)
        draw.text((info_x, y + 250), "Allotted from Official 1st-Year Talent Pool", fill="#10B981", font=f_mono_b)

    # 1st Year 1 (Pratik)
    fy1_x = 50
    draw_first_year_card(fy1_x, r2_y, r2_w, r2_h,
                         badge_txt="🌱 1ST-YEAR ALLOTTED BUILDER #1", initials="PR",
                         name="Pratik", mobile="9036177727", usn="4GH26CS000",
                         branch="CSE", email="pratikswamy05@gmail.com")

    # 1st Year 2 (Shraddha)
    fy2_x = fy1_x + r2_w + card_gap
    draw_first_year_card(fy2_x, r2_y, r2_w, r2_h,
                         badge_txt="🌱 1ST-YEAR ALLOTTED BUILDER #2", initials="SH",
                         name="Shraddha", mobile="7411431119", usn="4GH26CS000",
                         branch="CSE", email="shraddhapawar33959@gmail.com")

    # 7. Sleek Footer
    draw.line((50, 1030, width - 50, 1030), fill="#E4E4E7", width=1)
    draw.text((50, 1045), "HackSprint 3.0  •  COMPASS x GLUE  •  Government Engineering College, Hassan", fill="#A1A1AA", font=f_small)
    draw.text((width - 220, 1045), "SLIDE 01 OF 40", fill="#09090B", font=f_mono_b)

    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    im.save(output_path, "PNG")
    print(f"Rendered refined slide to: {output_path}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "demo_slide_preview.png"
    render_refined_slide(out)
