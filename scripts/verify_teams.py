import json

with open('scratch/teams_data.json', 'r', encoding='utf-8') as f:
    teams = json.load(f)

print(f"Loaded {len(teams)} teams from scratch/teams_data.json\n")
for idx, t in enumerate(teams, 1):
    college = t.get('college', 'Unknown')
    leader = t.get('leader', {})
    members = t.get('members', [])
    fy = t.get('assignedFirstYears', [])
    tot = 1 + len(members) + len(fy)
    lead_name = leader.get('name', 'N/A')
    lead_mob = leader.get('mobile', 'N/A')
    print(f"#{idx:02d} [{t.get('teamName')}] ({college}) - {tot} builders | Leader: {lead_name} ({lead_mob}) | Core: {1+len(members)} | FY: {len(fy)}")
