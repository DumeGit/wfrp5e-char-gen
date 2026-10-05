"""Build the reviewed Up in Arms pack from extract-up-in-arms.py's staged data.

Conversions are the user's explicit October 2, 2026 decisions in
docs/UP-IN-ARMS.md. This script does not push, deploy, or copy the source PDF.
"""
from pathlib import Path
import json
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
STAGED = ROOT.parent/'tmp/pdfs/up-in-arms-review'
DEST = ROOT/'dist/data/books/up-in-arms'
DEST.mkdir(parents=True, exist_ok=True)
read = lambda path: json.loads(path.read_text(encoding='utf-8-sig'))
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).strip('-')


from book_build import prepare_manifest

def write(name, value):
    value = prepare_manifest(name, value, DEST)
    (DEST/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")


core_skills = read(ROOT/'dist/data/skills.json')
core_talents = read(ROOT/'dist/data/talents.json')
core_shop = read(ROOT/'dist/data/gear.json')+read(ROOT/'dist/data/books/core/market.json')
core_weapons = read(ROOT/'dist/data/books/core/weapons.json')
config = read(ROOT/'dist/data/books/core/config.json')
careers = read(STAGED/'careers.raw.json')
talent_map = {'Diceman': 'Dicer', 'Strider': 'Striding Gait', 'Tunnel Rat': 'Tunnel Fighter', 'Public Speaking': 'Public Speaker', 'Trick Riding': 'Trick Rider', 'Warleader': 'War Leader', 'Unshakable': 'Unshakeable', 'Rough Rider': 'Roughrider', 'Nimble Fingered': 'Nimble-fingered'}
rules = []
extra_skills = {}
extra_talents = {}
for c in careers:
    mappings = set()
    for level in c['levels']:
        if c['name'] == 'Handgunner':
            level['skills'] = [s.replace('Ranged (Engineer)', 'Ranged (Engineering)') for s in level['skills']]
        for i, talent in enumerate(level['talents']):
            base = talent.split(' (')[0]
            if base in talent_map:
                converted = talent_map[base]+talent[len(base):]
                mappings.add(f'{talent} → {converted}')
                level['talents'][i] = converted
        for raw in level['skills']:
            m = re.fullmatch(r'(.+?) \((.+)\)', raw)
            if m and not re.search(r'Any|All', m[2]):
                group, choices = m[1], re.split(r',\s*(?:or )?| or ', m[2])
                existing = next(s['options'] for s in core_skills if s['name'] == group)
                for choice in choices:
                    if choice not in existing:
                        extra_skills.setdefault(group, {})[choice] = c['page']
        for raw in level['talents']:
            m = re.fullmatch(r'(Etiquette|Fearless) \((.+)\)', raw)
            if m and 'Any' not in m[2] and m[2] not in config['talentOptions'][m[1]]:
                extra_talents.setdefault(m[1], {})[m[2]] = c['page']
    c['conversion'] = 'Fifth Edition starting allocation, tracker advancement and core Talent definitions apply. '+('Older printed Talent names: '+('; '.join(sorted(mappings)))+'.' if mappings else 'Existing Talents reference their Fifth Edition core definitions.')
    if c['name'] == 'Handgunner':
        c['conversion'] += ' Printed Ranged (Engineer) uses Ranged (Engineering), as approved by the user; the book otherwise uses Engineering.'
write('careers.json', careers)
for group, entries in extra_skills.items():
    rules.append({'id': 'up-in-arms:skills:'+slug(group), 'path': ['skillOptions', group], 'operation': 'append', 'value': list(entries), 'page': min(entries.values()), 'reason': 'Additional specialisations explicitly printed in the new Careers; individual Career pages identify their uses.'})
for group, entries in extra_talents.items():
    rules.append({'id': 'up-in-arms:talent-options:'+slug(group), 'path': ['talentOptions', group], 'operation': 'append', 'value': list(entries), 'page': min(entries.values()), 'reason': 'Additional specialisations explicitly printed in Up in Arms Careers.'})
# The regional Skill also appears outside the Careers.
extra_skills.setdefault('Lore', {})['Tilea'] = 55
next(r for r in rules if r['path'] == ['skillOptions', 'Lore'])['value'].append('Tilea')
next(r for r in rules if r['path'] == ['skillOptions', 'Lore'])['reason'] += ' Lore (Tilea) is the regional creation option on p. 55.'
write('rules.json', rules)

write('talents.json', [{'id': 'up-in-arms:talent:crew-commander', 'name': 'Crew Commander', 'page': 140, 'text': 'Printed Fourth Edition reference: Max: Initiative Bonus. Tests: Ranged Skill tests when firing a weapon with the Crewed Flaw. A Character with this talent is practised at managing crews of siege weapons and artillery pieces. The Character may make a Challenging (+0) Leadership Test to help a crew manning a weapon with the Crewed Quality within earshot. If the Character passes the Test, the crew members may then use the Character’s Ranged Skill when shooting the weapon.', 'unavailable': 'Unavailable: Crew Commander has no Fifth Edition core equivalent. Its Fourth Edition repeat limit and Talent Test bonus need an agreed conversion (Up in Arms p. 140).', 'conversion': 'User requested that this Talent remain visible but greyed out until its Fifth Edition conversion is agreed. No purchase, free grant or repeat bonus is enabled.'}])

miracles = read(STAGED/'miracles.raw.json')
for m in miracles:
    m['conversion'] = 'Printed numeric modifiers retained in the description by user decision; situational effects are reference text, not automatic character bonuses.'
    if m['name'] == 'In Good Order':
        m['text'] = m['text'].replace('gain advantage', 'gain Momentum').replace('(see Fleeing on WFRP page 165)', '(the printed Fourth Edition cross-reference is Fleeing, WFRP p. 165)')
        m['conversion'] += ' The old Advantage reference becomes Momentum under Fifth Edition Appendix I p. 364; the old page reference is labelled.'
write('spells.json', miracles)

tilea = read(STAGED/'tilean.raw.json')
names = {'forenames': tilea['Female Forenames']+tilea['Male Forenames'], 'surnames': tilea['Surnames'], 'page': 56}
regional = {'flagellant': ['nun', 'priest'], 'cavalryman': ['up-in-arms:career:light-cavalry'], 'soldier': ['up-in-arms:career:pikeman'], 'warrior-priest': ['up-in-arms:career:priest-of-myrmidia']}
origins = []
for key, name in [('tilea', 'Tilea'), ('luccini', 'Luccini (Tilea)'), ('imperial-tilean', 'Imperial Tilean')]:
    o = {'id': 'up-in-arms:origin:'+key, 'name': name, 'species': 'Human', 'page': 55, 'background': names, 'conversion': 'Human Fifth Edition Characteristics, Fate, Fortune, age and height remain unchanged; select five regional Skills at +5 with the core creation limits. Tilean name suggestions are p. 56.'}
    if key != 'imperial-tilean':
        o.update({'skills': tilea['skills'], 'talents': tilea['talents'], 'randomTalents': 3, 'languages': ['Tilean'], 'careerChoices': regional, 'allowedPatrons': ['Myrmidia', 'Morr', 'Verena', 'Shallya', 'Ranald']})
        o['conversion'] += ' User approved native Tilean +30, the two printed Talent choices and three random Talents; Fourth Edition +5/+3 Skill allocations are not used.'
    else:
        human = read(ROOT/'dist/data/species.json')['Human']
        o['skills'] = [s.replace('Language (Wastelander)', 'Language (Tilean)') for s in human['skills']]
        o['conversion'] += ' The printed Wasteland language option corresponds to core Language (Wastelander) and is replaced by Language (Tilean); native Reikspiel and core Human Talents remain.'
    if key == 'luccini':
        o['optionalTalent'] = 'Doomed'
        o['conversion'] += ' One Species starting Talent may optionally be replaced with Doomed (p. 55); the original random roll is preserved in history.'
    origins.append(o)
write('origins.json', origins)

branches = {
    'engineer': [(1,75,'engineer'), (76,100,'Artillerist')],
    'scholar': [(1,85,'scholar'), (86,100,'Cartographer')],
    'pedlar': [(1,75,'pedlar'), (76,100,'Camp Follower')],
    'cavalryman': [(1,75,'cavalryman'), (76,100,'Light Cavalry')],
    'knight': [(1,55,'knight'), (56,65,'Freelance'), (66,70,'Knight of the Blazing Sun'), (71,85,'Knight of the White Wolf'), (86,100,'Knight Panther')],
    'soldier': [(1,40,'soldier'), (41,50,'Archer'), (51,70,'Halberdier'), (71,85,'Handgunner'), (86,90,'Greatsword'), (91,96,'Pikeman'), (97,100,'Siege Specialist')],
    'warrior-priest': [(1,85,'warrior-priest'), (86,100,'Priest of Myrmidia')],
}
tables = []
for base, rows in branches.items():
    tables.append({'id': 'up-in-arms:refinement:'+base, 'name': base.replace('-', ' ').title()+' optional military Career', 'kind': 'career-refinement', 'career': base, 'sides': 100, 'page': 9, 'rows': [{'min': a, 'max': b, 'result': next((c['id'] for c in careers if c['name'] == name), name)} for a,b,name in rows], 'conversion': 'Optional second roll after a core random Career result; never alters the core table. A result unavailable to the Species retains the original legal Career, with the rejected result logged (user interpretation).'} )
write('tables.json', tables)

def equipment_key(name):
    return slug(name.replace('Great Axe', 'Greataxe').replace('Shield (Buckler)', 'Buckler').replace('Shield (Large)', 'Large Shield'))

existing = {equipment_key(x['name']) for x in core_shop+core_weapons}
market, weapons, excluded = [], [], []
records = read(STAGED/'equipment.raw.json')
for row in records:
    raw = row.get('Item', row.get('Weapon', row.get('Ammunition', '')))
    # The traditional Grain Flail is the core two-handed Grain Flail, despite
    # the older table omitting the (2H) marker. Preserve core statistics.
    name = re.sub(r'^\(2H\)\s*', '', raw)
    two_handed = raw.startswith('(2H)')
    if two_handed: name += ' (2H)'
    key = equipment_key('Grain Flail (2H)' if name == 'Grain Flail' else name)
    price = row.get('Cost', row.get('Price', ''))
    if key in existing or price == 'N/A':
        excluded.append({'name': raw, 'page': row['page'], 'reason': 'Existing core item retains its core data.' if key in existing else 'No fixed purchase price.'})
        continue
    category = 'Trappings' if row['page'] == 88 else 'Ammunition' if row['page'] in [98,102,124] and 'Range' in row else 'Siege weapons' if row['page'] == 123 else 'Weapons'
    if row['page'] == 124:
        name += ' ('+row['group'].title()+')'
    if row['page'] == 88 and name in ['Bandoleer', 'Sealskin', 'Silk Underwear']: category = 'Packs and clothing'
    if name in ['Slow Match', 'Fuse']: name += ' (1 yard)'; price = price.replace(' /yard', '')
    entry = {'id': 'up-in-arms:item:'+slug(name), 'name': name, 'page': row['page'], 'price': price, 'enc': int(row['Enc']), 'availability': row['Availability'], 'category': category}
    if row['page'] == 88:
        if name in ['Bandoleer', 'Sealskin', 'Silk Underwear']: entry['wearable'] = True
    elif category == 'Ammunition':
        entry['ammunition'] = {k.lower(): row[k] for k in ['Range','Damage','Qualities']}
        entry['text'] = f"{row['group']}; Range: {row['Range']}; Damage modifier: {row['Damage']}; Qualities and Flaws: {row['Qualities']}. Printed ammunition modifiers are reference data; no ammunition is assumed loaded."
    else:
        groups = {'TWO-HANDED': 'Two-handed', 'BLACKPOWDER': 'Blackpowder', 'ENGINEERING': 'Engineering', 'CROSSBOW': 'Crossbow', 'CATAPULT': 'Catapult', 'BASIC': 'Basic', 'BRAWLING': 'Brawling', 'FENCING': 'Fencing', 'CAVALRY': 'Cavalry', 'FLAIL': 'Flail', 'PARRYING': 'Parry', 'POLEARM': 'Polearm'}
        group = groups[row['group']]
        qualities = row['Qualities'].replace('–', '')
        if name == 'Ballock Knife': qualities += '; Impale and Precise only if target is Surprised or Prone'
        if name == 'Demi-Lance': qualities += '; counts as Improvised Weapon on rounds without a charge'
        if name == 'Pepperbox': qualities += '; Repeater requires a second free hand'
        if name == 'Pavise': qualities += '; deployed cover only; handheld: Shield 3, Defensive, Undamaging, Slow, Tiring (p. 92)'
        weapon = {'id': 'up-in-arms:weapon:'+slug(name), 'name': name, 'page': row['page'], 'group': group, 'kind': 'ranged' if row['page'] in [101,123] else 'melee', 'enc': int(row['Enc']), 'reach': row.get('Reach', row.get('Range', ''))+(' yards' if row.get('Range', '').isdigit() else ''), 'damage': row['Damage'].lstrip('+').replace('*',''), 'qualities': qualities}
        weapon['conversion'] = 'New named equipment only; all existing core profiles, prices and weights remain unchanged. Printed properties are retained; combat mode/crew/ammunition effects are descriptive.'
        weapons.append(weapon)
    market.append(entry)
    existing.add(key)
write('market.json', market)
write('weapons.json', weapons)
write('excluded-equipment.json', excluded)
source = read(STAGED/'source-review.json')
manifest = {'schemaVersion': 1, 'id': 'up-in-arms', 'title': 'Up in Arms', 'shortTitle': 'Up in Arms', 'edition': 4, 'version': '1.0.0', 'kind': 'supplement', 'dependsOn': ['core'], 'source': {'file': source['file'], 'sha256': source['sha256']}, 'compatibility': {'reviewed': True, 'notes': ['Fifth Edition core creation and advancement govern. Existing Talents use core definitions; approved older names are mapped explicitly.', 'User approved Fifth Edition Skill allocations with printed Tilean choices and native Tilean language; core Human physical attributes remain unchanged.', 'Keep core statistics and add only new equipment. No alternative armoury or older Talent replacement is enabled.', 'Crew Commander is visible but unavailable until its repeat limit and Test bonus are converted by agreement.', 'Printed numeric Test modifiers remain in reference descriptions by user decision. Explicit old Advantage references use Momentum under core Appendix I p. 364.', 'An optional Career refinement unavailable to the Species retains the original legal Career and logs the rejected result, per user instruction.']}, 'notes': ['Only character-creation material is integrated. Injury, mounted combat, Pursuits, group Advantage, hireling management, structure damage and Warrior Endeavours remain outside this creator.', 'Unpriced descriptive Trappings and unspecified ammunition quantities remain unresolved rather than invented.'], 'files': {k: k+'.json' for k in ['careers','talents','spells','origins','rules','tables','market','weapons']}}
write('manifest.json', manifest)
print(json.dumps({'careers': len(careers), 'miracles': len(miracles), 'origins': len(origins), 'newShopEntries': len(market), 'newWeaponProfiles': len(weapons), 'excludedEquipmentRows': len(excluded)}))
