"""Build Archives I's reviewed creator data from the supplied PDF extraction.

Compatibility decisions are recorded in docs/ARCHIVES-I.md. No source PDF is
copied into the app, and this script never pushes or deploys.
"""
from pathlib import Path
import json
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
STAGED = ROOT.parent/'tmp/pdfs/archives-i-review'
DEST = ROOT/'dist/data/books/archives-i'
DEST.mkdir(parents=True, exist_ok=True)
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).strip('-')


from book_build import prepare_manifest

def write(name, value):
    value = prepare_manifest(name, value, DEST)
    (DEST/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")


core_skills = read(ROOT/'dist/data/skills.json')
config = read(ROOT/'dist/data/books/core/config.json')
careers = read(STAGED/'careers.raw.json')
mapping = {'Fleet Footed': 'Fleet-footed', 'Scale sheer Surface': 'Scale Sheer Surface', 'Strider': 'Striding Gait', 'Trick Riding': 'Trick Rider', 'Tunnel Rat': 'Tunnel Fighter'}
rules = []
extra_skills = {}
for c in careers:
    changes = []
    for level in c['levels']:
        if 'Lip Reading' in level['skills']:
            level['skills'].remove('Lip Reading')
            level['unavailableSkills'] = [{'name': 'Lip Reading', 'reason': 'Unavailable: printed as a Skill on p. 88, but Lip Reading is a Talent in the Fifth Edition core (p. 122). This Career entry cannot grant a Skill Advance or an additional Talent.'}]
            changes.append('Lip Reading Skill entry remains unavailable; no Skill or extra Talent is granted')
        talents = []
        for t in level['talents']:
            before = t
            base = t.split(' (')[0]
            if base in mapping:
                t = mapping[base]+t[len(base):]
            t = t.replace('(any)', '(Any)')
            if t == 'Fearless':
                t = 'Fearless (Any)'
            if t == 'Savant (Moot terrain)':
                t = 'Savant (Moot)'
            if t != before:
                changes.append(before+' → '+t)
            # Both alternatives remain available; this is not a fifth grant.
            talents.extend(t.split(' OR '))
        level['talents'] = talents
        level['skills'] = [t.replace('(any)', '(Any)') for t in level['skills']]
    c['conversion'] = 'Fifth Edition creation allocations, tracker advancement and core Talent definitions apply. The printed eight first-level Skill options are retained. '+('; '.join(changes)+'.' if changes else '')
    c['randomAlternativeFor'] = {'Ghost Strider': 'bounty-hunter', 'Fieldwarden': 'roadwarden', 'Karak Ranger': 'messenger', 'Badger Rider': 'soldier'}[c['name']]
    if c['name'] in ['Fieldwarden', 'Badger Rider']:
        c['requiredOrigins'] = ['archives-i:origin:mootland']
        c['text'] = 'Requires a Mootland Halfling (p. 87).'
    if c['name'] == 'Badger Rider':
        c['text'] += ' At creation, convince your GM that Badger Riders are real and attempt the badger’s terrifying war cry for the other players (p. 87). GM approval is required.'
write('careers.json', careers)

# Clan table verified visually against p. 32. Small is deliberately omitted
# under the user-approved Fifth Edition adaptation; it is not a free Talent.
clans = [
    ('Ashfield', ['Cool', 'Intuition', 'Language (Haffennaff)', 'Ranged (Any)'], ['Acute Sense (Sight)', 'Etiquette (Soldiers)']),
    ('Brambledown', ['Language (Haffennaff)', 'Navigation', 'Outdoor Survival', 'Swim'], ['Gregarious', 'Seasoned Traveller']),
    ('Brandysnap', ['Animal Care', 'Gamble', 'Language (Haffennaff)', 'Lore (Herbs)'], ['Craftsman (Farmer)', 'Sturdy']),
    ('Hayfoot', ['Gamble', 'Haggle', 'Evaluate', 'Language (Haffennaff)'], ['Dealmaker', 'Etiquette (Guilders)']),
    ('Hollyfoot', ['Evaluate', 'Haggle', 'Language (Haffennaff)', 'Trade (Any)'], ['Craftsman (Any)', 'Nimble-fingered']),
    ('Hayfoot-Hollyfoot', ['Bribery', 'Haggle', 'Gossip', 'Language (Haffennaff)'], ['Argumentative', 'Numismatics']),
    ('Lostpockets', ['Endurance', 'Gamble', 'Gossip', 'Intuition'], ['Hardy', 'Stone Soup']),
    ('Lowhaven', ['Bribery', 'Haggle', 'Intimidate', 'Language (Haffennaff)'], ['Criminal', 'Etiquette (Criminals)', 'Etiquette (Guilders)']),
    ('Rumster', ['Endurance', 'Gossip', 'Haggle', 'Language (Haffennaff)'], ['Craftsman (Cook)', 'Dealmaker']),
    ('Skelfsider', ['Endurance', 'Gamble', 'Gossip', 'Language (Haffennaff)'], ['Beneath Notice', 'Etiquette (Servants)']),
    ('Thorncobble', ['Gossip', 'Leadership', 'Lore (Heraldry)', 'Language (Haffennaff)'], ['Etiquette (Nobles)', 'Etiquette (Scholars)', 'Read/Write']),
    ('Tumbleberry', ['Gossip', 'Haggle', 'Lore (Any)', 'Language (Haffennaff)'], ['Etiquette (Burghers)', 'Etiquette (Guilders)', 'Read/Write']),
]
common = ['Charm', 'Consume Alcohol', 'Lore (Reikland)', 'Perception', 'Sleight of Hand', 'Stealth (Any)', 'Trade (Cook)']
origins = []
for name, skills, talents in clans:
    origins.append({'id': 'archives-i:origin:'+slug(name), 'name': name+' clan (Reikland)', 'species': 'Halfling', 'page': 32, 'skills': common+skills, 'talents': [['Acute Sense (Taste)'], ['Night Vision'], ['Resistant (Chaos)'], talents], 'randomTalents': 1, 'conversion': 'User-approved Fifth Edition adaptation: select five distinct Species Skills at +5; retain core native Haffennaff and Reikspiel and core physical attributes. Printed Mootish uses Haffennaff, Resistance uses Resistant, and Small is omitted because core Halfling size is handled separately. One clan Talent replaces one of the core two random Talents; total five Species Talents.'})
    if name == 'Thorncobble':
        origins[-1]['additionalCareers'] = [{'career': 'noble', 'requiredTalent': 'Noble Blood', 'reason': 'Noble requires Noble Blood for a Thorncobble Halfling at creation (Archives I p. 31). Choose it as your free Career Talent or acquire it with XP before exporting.'}]
        origins[-1]['text'] = 'A Thorncobble with Noble Blood may enter Noble at character creation (p. 31). Choose Noble in the Career step; Noble Blood is required before export.'
origins.append({'id': 'archives-i:origin:mootland', 'name': 'Mootland', 'species': 'Halfling', 'page': 87, 'text': 'Mootland Halflings may choose Fieldwarden or, with GM approval and the printed war-cry requirement, Badger Rider. A random Road Warden or Soldier result may optionally be exchanged for the corresponding Career (p. 87).', 'conversion': 'User approved an explicit Mootland origin to enforce the regional Career restrictions. Core Halfling Skills, Talents, native languages and physical attributes remain unchanged; no Reikland clan profile is assumed.'})

# Explicitly named additional specialisations feed the core grouped Skills and
# derived Craftsman/Savant options. Their mechanics remain the core definitions.
for c in careers:
    for level in c['levels']:
        for raw in level['skills']:
            m = re.fullmatch(r'(.+?) \((.+)\)', raw)
            if m and 'Any' not in m[2]:
                group = m[1]
                for choice in re.split(r',\s*| or ', m[2]):
                    if choice not in next(s['options'] for s in core_skills if s['name'] == group):
                        extra_skills.setdefault(group, {})[choice] = c['page']
for group, choice, page in [('Trade', 'Farmer', 32), ('Lore', 'Dwarf Holds and Routes', 90)]:
    if choice not in next(s['options'] for s in core_skills if s['name'] == group):
        extra_skills.setdefault(group, {})[choice] = page
for group, entries in extra_skills.items():
    for page in sorted(set(entries.values())):
        rules.append({'id': 'archives-i:skills:'+slug(group)+'-'+str(page), 'path': ['skillOptions', group], 'operation': 'append', 'value': [name for name, source_page in entries.items() if source_page == page], 'page': page, 'reason': 'Specialisations explicitly named on this printed page in Archives I Careers or clan Talent choices; use current core Skill and Talent definitions. Savant still requires possessing its Lore.'})
for kindred, name in [('forestborn', 'Forestborn (Faniour)'), ('cityborn', 'Cityborn (Toriour)'), ('younger', 'Younger (Harioth)')]:
    o = {'id': 'archives-i:origin:eonir-'+kindred, 'name': 'Eonir — '+name, 'species': 'Wood Elf', 'page': 78, 'sheetSpecies': 'Wood Elf (Eonir)', 'conversion': 'User approved Wood Elf starting attributes, Skills, Talents and physical details for all Eonir kindreds. Career availability and the default core Career table follow High Elf for Cityborn and Wood Elf for the other kindreds. No Species probabilities are changed.'}
    if kindred == 'cityborn':
        o.update({'careerSpecies': 'High Elf', 'classNote': 'Cityborn', 'text': 'Cityborn is a GM option. Use High Elf Careers, while retaining Wood Elf starting attributes. Your sheet identifies you as Wood Elf (Eonir), with Cityborn on the Class line (p. 78).'})
    if kindred == 'younger':
        o.update({'grantedTalents': ['Youngblood'], 'text': 'Younger kindred uses Wood Elf Careers and receives the additional Youngblood Talent. You are considered lower Status than other Eonir unless they also have Youngblood (p. 78). This contextual comparison does not change your normal Career Status.'})
        o['conversion'] += ' Youngblood is an explicitly additional zero-XP kindred grant, maximum 1; its contextual lower-Status rule is reference text, not a campaign status manager.'
    origins.append(o)
rules.append({'id': 'archives-i:talent-limit:youngblood', 'path': ['talentLimits', 'Youngblood'], 'operation': 'add', 'value': 1, 'page': 78, 'reason': 'The printed special kindred Talent has maximum 1. It is an additional creation grant for Younger Eonir; no repeat-Test bonus or ordinary Career access is added.'})
write('talents.json', [{'id': 'archives-i:talent:youngblood', 'name': 'Youngblood', 'page': 78, 'text': 'Max: 1. Tests: Any Social Tests with other Eonir. Your family are considered newcomers to the Laurelorn and are treated with condescension by Eonir of the older birth kindreds. You are always considered of lower Status than other Eonir, unless they also have the Youngblood Talent. Second generation Youngbloods can lose this Talent by passing a trial to join the Forestborn Kindred.', 'conversion': 'User-approved additional Talent for Younger (Harioth) Eonir at creation, maximum 1. It applies to contextual Status comparisons with other Eonir; no global Status reduction or Fourth Edition per-rank Test bonus is added. Joining another kindred during play is outside the creator.'}])
write('rules.json', rules)
write('origins.json', origins)

market, weapons = [], []
groups = {'BASIC': 'Basic', 'POLEARM': 'Polearm', 'TWO-HANDED': 'Two-handed', 'BLACKPOWDER': 'Blackpowder', 'CROSSBOW': 'Crossbow', 'ENGINEERING': 'Engineering', 'EXPLOSIVES': 'Explosives', 'THROWING': 'Throwing'}
for row in read(STAGED/'equipment.raw.json'):
    raw = row['Weapon']
    name = raw.replace('(2H)', '').replace('*', '').strip()
    if raw.startswith('(2H)'):
        name += ' (2H)'
    group = row['group'].replace('*', '')
    ammo = group in ['BLACKPOWDER AND ENGINEERING', 'Bow']
    qualities = row['Qualities'].replace('*', '')
    text = 'Availability assumes a strong local presence of the associated Species (p. 92); some weapons are not sold to outsiders. Confirm access with your GM.'
    if group in ['BLACKPOWDER', 'ENGINEERING']:
        qualities += ', Blackpowder, Damaging'
    if name == 'Drakefire Pistol':
        qualities = qualities.replace('Special', 'Critical hit also inflicts Ablaze')
    if name == 'Blackbriar Javelin':
        qualities = qualities.replace('Special', 'If rested in fertile earth each night, inflicts Poisoned when causing at least 1 Wound; resisted with Challenging (+0 SL) Endurance')
        text += ' The printed Challenging (+0) Test Difficulty is converted to +0 SL under core Appendix I p. 364.'
    if name == 'Drakefire Shot (12)':
        text += ' Intended for Drakefire Pistols. In another Blackpowder weapon it functions once before exploding in the user’s hands; resolve every shot as a Fumble (p. 94).'
    if name == 'Starfire Shafts (12)':
        text += ' Critical hits also inflict an Ablaze condition (p. 93).'
    if name == 'Swiftshiver Shafts (12)':
        text += ' To use Blast 1, expend an additional Swiftshiver arrow per target before making the attack Test (p. 93).'
    entry = {'id': 'archives-i:item:'+slug(name), 'name': name, 'page': row['page'], 'price': row['Price'], 'enc': int(row['Enc']), 'availability': row['Availability'], 'category': 'Ammunition' if ammo else 'Weapons', 'text': text}
    if name == 'Precision Shot and Powder':
        entry['supersededBy'] = {'book': 'up-in-arms', 'contentId': 'up-in-arms:item:precision-shot-and-powder', 'reason': 'User-approved price precedence: when both books are enabled, use Up in Arms p. 102 (3 shillings) instead of Archives I p. 93 (3 pennies). The ammunition modifiers are identical.'}
    if ammo:
        entry['ammunition'] = {'range': row['Range'], 'damage': row['Damage'], 'qualities': qualities}
    else:
        weapons.append({'id': 'archives-i:weapon:'+slug(name), 'name': name, 'page': row['page'], 'group': groups[group], 'kind': 'melee' if row['page'] == 92 else 'ranged', 'enc': int(row['Enc']), 'reach': row.get('Reach', row.get('Range', '')), 'damage': row['Damage'].lstrip('+'), 'qualities': qualities, 'text': text, 'conversion': 'New named equipment only. Printed profiles, prices and weights retained; existing core equipment is unchanged. Situational effects are reference descriptions, not combat automation.'})
    market.append(entry)
write('market.json', market)
write('weapons.json', weapons)

source = read(STAGED/'source-review.json')
manifest = {'schemaVersion': 1, 'id': 'archives-i', 'title': 'Archives of the Empire: Volume I', 'shortTitle': 'Archives I', 'edition': 4, 'version': '1.0.0', 'kind': 'supplement', 'dependsOn': ['core'], 'source': {'file': source['file'], 'sha256': source['sha256']}, 'compatibility': {'reviewed': True, 'notes': ['Current Fifth Edition creation allocations, advancement and core Talent definitions govern.', 'Clan profiles use the user-approved five-Talent adaptation: omit old Small, use Resistant (Chaos), one clan choice and one random Talent; Mootish is recorded as Haffennaff.', 'Fearless without a printed group offers core enemy choices. Savant (Moot terrain) uses Savant (Moot); Savant (Dwarf Holds and Routes) retains the core owned-Lore requirement.', 'User approved all three Eonir kindreds with Wood Elf starting attributes; Cityborn follows High Elf Careers and records its kindred on the Class line. Younger receives the additional Youngblood Talent, maximum 1.', 'Existing core equipment is unchanged. New profiles retain printed properties; contextual combat effects are described. Challenging (+0) becomes +0 SL under core Appendix I p. 364.', 'If Up in Arms is also enabled, its Precision Shot and Powder price (3 shillings, p. 102) takes precedence over this book\'s 3-penny price (p. 93), by user instruction.']}, 'notes': ['Only creator-relevant material is integrated. NPCs, settlements, adventure hooks and campaign activity remain outside this character creator.', 'Descriptive or unpriced Trappings retain their printed names; no missing weights, prices, quantities or animal statistics are invented.'], 'files': {k: k+'.json' for k in ['careers', 'talents', 'origins', 'rules', 'market', 'weapons']}}
write('manifest.json', manifest)
print(json.dumps({'careers': len(careers), 'origins': len(origins), 'weapons': len(weapons), 'market': len(market)}))
