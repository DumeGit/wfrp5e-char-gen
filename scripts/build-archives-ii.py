"""Prepare reviewed Archives II data; registration is a separate final step.

The default output stays outside the published app until all mechanics, UI and
exports are implemented and verified. See docs/ARCHIVES-II.md for decisions.
"""
from pathlib import Path
import argparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]
STAGED = ROOT.parent/'tmp/pdfs/archives-ii-review'
parser = argparse.ArgumentParser()
parser.add_argument('--output-dir', type=Path, default=STAGED/'prepared')
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
read = lambda path: json.loads(path.read_text(encoding='utf-8-sig'))
slug = lambda text: re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def write(name, value):
    (args.output_dir/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')


core_skills = read(ROOT/'dist/data/skills.json')
core_config = read(ROOT/'dist/data/books/core/config.json')
careers = read(STAGED/'careers.raw.json')
mapping = {'Strider': 'Striding Gait', 'Trick Riding': 'Trick Rider', 'Warleader': 'War Leader'}
extra_skills = {'Language': {'Grumbarth': 20}, 'Lore': {'Ogres': 20}, 'Ride': {'Rhinox': 34}}
for career in careers:
    notes = []
    for level in career['levels']:
        for index, talent in enumerate(level['talents']):
            before = talent
            base = talent.split(' (')[0]
            talent = mapping.get(base, base)+talent[len(base):]
            talent = talent.replace('(Lore of the Great Maw)', '(The Great Maw)')
            if talent != before:
                notes.append(before+' → '+talent)
            level['talents'][index] = talent
        level['skills'] = [skill.replace('(any)', '(Any)').replace('(Lore of the Great Maw)', '(The Great Maw)') for skill in level['skills']]
        for raw in level['skills']:
            match = re.fullmatch(r'(.+?) \((.+)\)', raw)
            if match and 'Any' not in match[2]:
                group, choices = match.groups()
                known = next(skill['options'] for skill in core_skills if skill['name'] == group)
                for choice in re.split(r',\s*| or ', choices):
                    if choice not in known:
                        extra_skills.setdefault(group, {})[choice] = career['page']
    career['conversion'] = 'Fifth Edition creation allocations, XP advancement and core Talent definitions apply; retain all ten printed first-level Skill options. '+('; '.join(notes)+'.' if notes else '')
    if career['name'] == 'Rhinox Herder':
        career['conversion'] += ' Harpoon remains the printed Trapping with unresolved statistics; it is not silently a launcher or a pack of six ammunition pieces.'
write('careers.json', careers)

rules = []
for group, choices in extra_skills.items():
    known = next(skill['options'] for skill in core_skills if skill['name'] == group)
    remaining = {choice: page for choice, page in choices.items() if choice not in known and choice not in core_config['skillOptions'].get(group, [])}
    if remaining:
        rules.append({'id': 'archives-ii:rule:skill-'+slug(group), 'path': ['skillOptions', group], 'operation': 'append', 'value': list(remaining), 'page': str(min(remaining.values()))+'–'+str(max(remaining.values())) if min(remaining.values()) != max(remaining.values()) else min(remaining.values()), 'reason': 'Printed Archives II specialisations; Fifth Edition Skill definitions apply.'})
rules.append({'id': 'archives-ii:rule:great-maw-lore', 'path': ['colours'], 'operation': 'append', 'value': ['The Great Maw'], 'page': 32, 'reason': 'Great Maw Arcane Lore, explicitly Ogre-only. The Species restriction is enforced by the engine.'})
# Offer new printed specialisations in existing Any menus as well as their
# fixed Career entries; core definitions remain authoritative.
for group in ['Etiquette', 'Fearless', 'Striding Gait']:
    printed = {}
    for c in careers:
        for level in c['levels']:
            for talent in level['talents']:
                match = re.fullmatch(re.escape(group)+r' \((.+)\)', talent)
                if match and match[1] not in core_config['talentOptions'].get(group, []):
                    printed[match[1]] = c['page']
    if printed:
        rules.append({'id': 'archives-ii:rule:talent-'+slug(group), 'path': ['talentOptions', group], 'operation': 'append', 'value': list(printed), 'page': min(printed.values()), 'reason': 'Printed Archives II Talent specialisations using the existing core Talent.'})
write('rules.json', rules)

species = {'Ogre': {
    'id': 'archives-ii:species:ogre', 'page': 20,
    'offsets': dict(zip(['WS', 'BS', 'S', 'T', 'I', 'Ag', 'Dex', 'Int', 'WP', 'Fel'], [20, 10, 35, 35, 0, 15, 10, 10, 20, 10])),
    'languages': ['Reikspiel'], 'fate': 1, 'fortune': 2, 'movement': 6,
    'age': [15, 5], 'height': [91, 1], 'appearancePage': 21,
    'skills': ['Athletics', 'Consume Alcohol', 'Endurance', 'Entertain (Storytelling)', 'Intimidate', 'Language (Grumbarth)', 'Lore (Ogres)', 'Melee (Basic)', 'Melee (Brawling)', 'Navigation', 'Outdoor Survival', 'Track'],
    'talents': [['Dirty Fighting'], ['Resistant (Chaos)'], ['Resistant (Poison (Ingested))'], ['Very Resilient', 'Very Strong'], ['Vice (Food)']], 'randomTalents': 0,
    'mechanics': {'size': 'Large', 'capacityMultiplier': 2, 'equipmentSizing': 'ogre', 'gmApproval': 'No Ogre may take writing, complex-artistry or suitably advanced Lore Skills/Talents without GM permission (Archives II p. 21). Confirm with your GM which of your choices need permission and obtain it before finishing creation.', 'careers': ['artisan', 'beggar', 'rat-catcher', 'watchman', 'servant', 'bailiff', 'hunter', 'miner', 'bounty-hunter', 'entertainer', 'pedlar', 'sailor', 'stevedore', 'grave-robber', 'outlaw', 'racketeer', 'guard', 'pit-fighter', 'protagonist', 'soldier'], 'skillCharacteristics': {'Language (Magick)': 'T'}, 'skillReplacements': {'Ride (Horse)': 'Ride (Rhinox)'}, 'arcaneLores': ['The Great Maw', 'Heavens', 'Death', 'Beasts'], 'exclusiveLores': ['The Great Maw']},
    'conversion': 'User-approved adaptation: 1 Fate, 2 Fortune, no extra point to distribute; normal Fifth Edition random-creation bonuses apply. Choose five Skills at +5 with core limits. Retain five printed Species Talents, using Resistant as the core heading; omit old Large Talent and record Large size separately. Native Reikspiel is explicit; Grumbarth remains selectable. Carrying capacity is doubled after core Talent effects. Use current core Size rules, not the old combat summary on p. 28.'
}}
species['Ogre']['mechanics']['magicReferences'] = [
    {'page': 31, 'text': 'Ogre Casting uses Toughness for Language (Magick). Spellcasting requires meat as part of the cost of living; without suitable meat the Ogre loses Wounds equal to the spell’s CN. This ordinary meat does not reduce Miscast risk. Esoteric ingredients can be acquired or bought for 1 shilling per CN. The page also states that casting without a suitable ingredient costs Wounds equal to CN; retain that wording for GM adjudication. These are play references, not automatic Wounds or coin deductions.'},
    {'page': 32, 'lore': 'The Great Maw', 'text': 'Great Maw Lore: after successfully casting a Lore spell, roll 1d10. A 10, or a result at least equal to its unmodified CN, restores Wounds equal to that unmodified CN. Channelling or a Grimoire does not lower the CN used for this benefit. Ingredients are bloody animal parts, unusual bile, marrow or cured fat. This is a play reference, not automatic healing.'}
]
write('species.json', species)
appearance = read(STAGED/'appearance.raw.json')
human = read(ROOT/'dist/data/background.json')['Human']
write('background.json', {'Ogre': {'id': 'archives-ii:background:ogre', 'page': 21,
      'forenames': human['forenames'], 'surnames': ['Goldtooth', 'Ironskin', 'Thundermaw', 'Bloodguzzler', 'Eyebiter', 'Onetusk', 'Bullgorger'],
      'eyes': [row['result'] for row in appearance['eyes']['rows']], 'hair': [row['result'] for row in appearance['hair']['rows']],
      'imperialNames': 'Human', 'namePages': {'forenames': 22, 'surnames': 23}, 'rollTables': appearance, 'nameElements': read(STAGED/'names.raw.json'),
      'conversion': 'Imperial Ogre forename suggestions use the supplied Fifth Edition Human list (core p. 27), permitted by Archives II p. 21. Traditional names join two separate d100 elements (p. 22). Titles/clan names are printed examples (p. 23), sampled uniformly as suggestions. Eyes/hair use printed 2d10 tables (p. 21). Names UI must distinguish these sources.'}})

pages = read(STAGED/'pages.raw.json')
vice_text = pages[19]['text'].split('Vice (Target)', 1)[1].split('OGRE ATTRIBUTES TABLE', 1)[0]
write('talents.json', [{'id': 'archives-ii:talent:vice', 'name': 'Vice (Target)', 'page': 20, 'text': re.sub(r'\s+', ' ', vice_text.replace('T est', 'Test')).strip(), 'conversion': 'Printed Vice Psychology is reference text, not a campaign tracker or permanent Fellowship adjustment. Species grants Vice (Food). No old per-rank SL Talent bonus is imported.'}])

spells = read(STAGED/'spells.raw.json')
for spell in spells:
    spell['id'] = 'archives-ii:spell:'+slug(spell['name'])
    text = spell['text'].replace('V ampiric', 'Vampiric').replace('T est', 'Test')
    conversions = ['Current core Creature Traits apply; old page references identify Fourth Edition. Numeric effect modifiers remain printed unless explicitly converted here.']
    if 'Difficult (+20)' in text:
        text = text.replace('Difficult (+20)', 'Difficult (−1 SL)')
        conversions.append('User resolves conflicting Difficult (+20) by the difficulty label: Difficult (−1 SL).')
    text = text.replace('Average (+20)', 'Average (+2 SL)').replace('Challenging (+0)', 'Challenging (+0 SL)')
    if spell['name'] == 'Trollguts':
        text = text.replace('Regenerate Creature Trait', 'Regeneration Creature Trait')
        conversions.append('Regenerate uses current core Regeneration (p. 360); Average (+20) difficulty uses +2 SL under Appendix I p. 364.')
    if spell['name'] in ['The Maw', 'Feast of the Fallen']:
        conversions.append('Challenging (+0) difficulty uses +0 SL under Appendix I p. 364.')
    spell['text'] = text
    spell['conversion'] = ' '.join(conversions)
write('spells.json', spells)

career_ranges = [(1, 1, 'archives-ii:career:ogre-butcher'), (2, 2, 'artisan'), (3, 4, 'beggar'), (5, 6, 'rat-catcher'), (7, 12, 'watchman'), (13, 13, 'servant'), (14, 14, 'bailiff'), (15, 21, 'hunter'), (22, 23, 'miner'), (24, 26, 'archives-ii:career:rhinox-herder'), (27, 29, 'bounty-hunter'), (30, 32, 'entertainer'), (33, 39, 'pedlar'), (40, 40, 'sailor'), (41, 43, 'stevedore'), (44, 47, 'grave-robber'), (48, 56, 'outlaw'), (57, 61, 'racketeer'), (62, 68, 'guard'), (69, 79, 'pit-fighter'), (80, 84, 'protagonist'), (85, 91, 'archives-ii:career:maneater'), (92, 100, 'soldier')]
write('tables.json', [
    {'id': 'archives-ii:table:species', 'name': 'Archives II Species', 'kind': 'species', 'sides': 100, 'page': 18, 'rows': [{'min': lo, 'max': hi, 'result': name} for lo, hi, name in [(1, 89, 'Human'), (90, 93, 'Halfling'), (94, 97, 'Dwarf'), (98, 98, 'Ogre'), (99, 99, 'High Elf'), (100, 100, 'Wood Elf')]], 'conversion': 'User-approved default when Archives II is enabled: this p. 18 Species table supersedes the core table unless the user explicitly selects another. Fifth Edition random creation bonuses replace the old +20 XP Species reward.'},
    {'id': 'archives-ii:table:ogre-careers', 'name': 'Archives II Ogre Careers', 'kind': 'career', 'species': 'Ogre', 'sides': 100, 'page': 18, 'rows': [{'min': lo, 'max': hi, 'result': name} for lo, hi, name in career_ranges], 'conversion': 'User correction: printed missing 05 is assigned to Rat Catcher, making its range 05–06. Seaman uses Fifth Edition Sailor. Core Career definitions and Class labels apply to existing Careers.'}
])

# Mechanical effects come from the visually checked detailed table on p. 39.
# The descriptive profiles on pp. 40–47 do not override those effects.
signs = [
    ('Wymund the Anchorite', {'Fel': 2, 'I': 2, 'Int': -3}, None),
    ('The Big Cross', {'S': 2, 'WP': 2, 'I': -3}, None),
    ('The Limner’s Line', {'BS': 2, 'Ag': 2, 'WS': -3}, None),
    ('Gnuthus the Ox', {'T': 2, 'WP': 2, 'Int': -3}, None),
    ('Dragomas the Drake', {'WP': 2, 'Fel': 2, 'Dex': -3}, None),
    ('The Gloaming', {'Int': 2, 'I': 2, 'WP': -3}, None),
    ('Grungni’s Baldric', {'WS': 2, 'WP': 2, 'Fel': -3}, None),
    ('Mammit the Wise', {'I': 2, 'Int': 2, 'Fel': -3}, None),
    ('Mummit the Fool', {'WP': -3}, 'Luck'),
    ('The Two Bullocks', {'Int': -3}, 'Craftsman (Any)'),
    ('The Dancer', {'I': -3}, 'Impassioned Zeal'),
    ('The Drummer', {'WP': -3}, 'Carouser'),
    ('The Piper', {'Fel': 2, 'Dex': 2, 'WS': -3}, None),
    ('Vobist the Faint', {'I': -3}, 'Sixth Sense'),
    ('The Broken Cart', {'WP': -3}, 'Resistant (Disease)'),
    ('The Greased Goat', {'T': -3}, 'Animal Affinity'),
    ('Rhya’s Cauldron', {'Ag': -3}, 'Iron Will'),
    ('Cackelfax the Cockerel', {'Fel': -3}, 'Dealmaker'),
    ('The Bonesaw', {'Int': 2, 'Fel': 2, 'WS': -3}, None),
    ('The Witchling Star', {}, None)]
profiles = []
for n in range(40, 48):
    for chunk in pages[n-1]['text'].split('Classical Name:')[1:]:
        match = re.search(r'^\s*(.*?)\nAscendant:\s*(.*?)\nCalendar Dates:\s*(.*?)\nAssociated God:\s*(.*?)\nAppearance:\s*(.*?)\nBonus:\s*(.*?)\nPenalty:\s*([^\n]+)\n(.*)', chunk, re.S)
        assert match, (n, chunk)
        classical, ascendant, calendar, god, appearance_text, bonus, penalty, body = match.groups()
        body = body.split('ASTROLOGY IN THE EMPIRE', 1)[0]
        body = re.sub(r'\n[^\n]*\nSign of[^\n]*\s*$', '', body)
        profiles.append({'profilePage': n, 'classical': re.sub(r'\s+', ' ', classical).strip(), 'ascendant': re.sub(r'\s+', ' ', ascendant).strip(), 'calendar': re.sub(r'\s+', ' ', calendar).strip(), 'god': re.sub(r'\s+', ' ', god).strip(), 'appearance': re.sub(r'\s+', ' ', appearance_text).strip(), 'text': re.sub(r'\s+', ' ', body).strip()})
assert len(profiles) == len(signs) == 20
astrology = []
for index, ((name, adjustments, talent), profile) in enumerate(zip(signs, profiles)):
    sign = {'id': 'archives-ii:sign:'+slug(name), 'name': name, 'page': 39, 'min': index*5+1, 'max': index*5+5, 'adjustments': adjustments, **profile}
    if talent:
        sign['talent'] = talent
    if name == 'The Dancer':
        sign['text'] += ' The focus of Impassioned Zeal can be chosen later in play (p. 43).'
    if name == 'The Witchling Star':
        sign['witchling'] = [{'min': 1, 'max': 3, 'talent': 'Sixth Sense', 'adjustments': {}}, {'min': 4, 'max': 6, 'talent': 'Second Sight', 'adjustments': {'S': -3}}, {'min': 7, 'max': 9, 'talent': 'Petty Magic', 'adjustments': {'S': -3}}, {'min': 10, 'max': 10, 'talent': 'Witch!', 'adjustments': {'S': -5}}]
        sign['conversion'] = 'User resolves p. 47’s blanket −3 Strength by using the detailed p. 39 table: no penalty for Sixth Sense, −3 for Second Sight/Petty Magic, −5 for Witch!.'
    astrology.append(sign)
write('astrology.json', astrology)

weapons = []
market = []
profiles = [
    ('Ogre Club', '1 GC', 2, 'Common', 'Basic', 'Average', 'SB+4', 'Special', 'melee'),
    ('Ironfist', '4 GC', 2, 'Scarce', 'Basic', 'Short', 'SB+3', 'Shield 1, Defensive', 'melee'),
    ('Big Ogre Club (2H)', '5 GC', 6, 'Common', 'Two-handed', 'Long', 'SB+6', 'Damaging, Special', 'melee'),
    ('Great Throwing Spear', '6/–', 2, 'Scarce', 'Throwing', 'SB × 3', 'SB+4', 'Impale', 'ranged'),
    ('Leadbelcher Gun (2H)', '14 GC', 8, 'Exotic', 'Blackpowder', '50', '+10', 'Dangerous, Reload 5, Blackpowder, Damaging', 'ranged'),
    ('Ogre Pistol', '9 GC', 3, 'Exotic', 'Blackpowder', '20', '+8', 'Pistol, Reload 1, Blackpowder, Damaging', 'ranged'),
    ('Harpoon Launcher', '8 GC', 5, 'Exotic', 'Entangling', '20', '+10', 'Entangle, Reload 2', 'ranged'),
    ('Chain Trap', '1 GC', 2, 'Scarce', 'Entangling', 'SB × 2', '+7', 'Entangle', 'ranged')]
weapon_text = {
    'Ogre Club': 'Optional personalisation on p. 30: metal plates add Pummel, rusty spikes add Penetrating, scavenged blades add Hack. Equipment Quality/Flaw editing is deferred in this creator; no option is silently chosen.',
    'Big Ogre Club (2H)': 'Optional personalisation on p. 30: metal plates add Pummel, rusty spikes add Penetrating, scavenged blades add Hack. Equipment Quality/Flaw editing is deferred in this creator; no option is silently chosen.',
    'Ironfist': 'An Ogre cannot be disarmed of an Ironfist. The hand may still hold a weapon or perform simple actions (p. 30).',
    'Great Throwing Spear': 'A large javelin used by Ogre Hunters (p. 30).',
    'Leadbelcher Gun (2H)': 'Ogre cannon-like weapon. Can fire shot or cannonballs (p. 30). Core p. 303 supplies inherent Blackpowder and Damaging Qualities.',
    'Ogre Pistol': 'Uses normal blackpowder shot and powder. May also serve as a Hand Weapon, breaking only on a Fumbled attack (p. 30). No second weapon is granted. Core p. 303 supplies inherent Blackpowder and Damaging Qualities.',
    'Harpoon Launcher': 'Uses Ranged (Crossbow) or Ranged (Entangling) without penalty. Removing the rope increases range to 60 and removes Entangle (p. 30); the listed profile includes its rope.',
    'Chain Trap': 'Spring-loaded jaws on a chain; can be flung at prey and reeled in (p. 30).'}
for name, price, enc, availability, group, reach, damage, qualities, kind in profiles:
    text = weapon_text[name]+' Already Ogre-sized: do not double printed price/Encumbrance. Availability is for the Empire (p. 29). Average creatures find these weapons all but useless; consult the GM (p. 28).'
    weapons.append({'id': 'archives-ii:weapon:'+slug(name), 'name': name, 'page': 29, 'group': group, 'enc': enc, 'reach': reach, 'damage': damage, 'qualities': qualities, 'kind': kind, 'text': text})
    market.append({'id': 'archives-ii:item:'+slug(name), 'name': name, 'page': 29, 'price': price, 'enc': enc, 'availability': availability, 'category': 'Weapons', 'text': text})
for name, price, availability, range_text, damage, qualities in [
        ('Leadbelcher Shot (12)', '4/–', 'Scarce', 'Half weapon', '—', 'Blast 3'),
        ('Leadbelcher Ball (1)', '1 GC', 'Scarce', 'As weapon', '+4', 'Penetrating, Impale, Impact'),
        ('Harpoon (6)', '5/–', 'Exotic', 'As weapon', '—', 'Impale')]:
    text = 'Already Ogre-sized; printed ammunition pack and Encumbrance are retained.'
    if name == 'Leadbelcher Ball (1)':
        text += ' Price includes 2/– of powder for one shot; recovered balls can be fired again for the cost of powder (p. 29).'
    market.append({'id': 'archives-ii:item:'+slug(name), 'name': name, 'page': 29, 'price': price, 'enc': 0, 'availability': availability, 'category': 'Ammunition', 'ammunition': {'range': range_text, 'damage': damage, 'qualities': qualities}, 'text': text})
market.append({'id': 'archives-ii:item:ogre-gutplate', 'name': 'Ogre Gutplate', 'page': 29, 'price': '20 GC', 'enc': 4, 'availability': 'Rare', 'category': 'Armour', 'text': 'Already Ogre-sized. Uniquely suited to Ogre anatomy; even scaled-down versions give incomplete protection to other Species (p. 29). The table lists Plate with no additional penalty; core plate Stealth, Casting and worn-armour Encumbrance rules apply.'})
write('weapons.json', weapons)
write('armour.json', [{'id': 'archives-ii:armour:ogre-gutplate', 'name': 'Ogre Gutplate', 'page': 29, 'enc': 4, 'locations': 'Body', 'ap': 3, 'qualities': 'Impenetrable'}, {'id': 'archives-ii:armour:ironfist-shield', 'name': 'Ironfist', 'page': 29, 'enc': 2, 'locations': 'Shield', 'ap': 1, 'qualities': 'Shield 1, Defensive', 'conversion': 'Printed Shield 1 uses the current core Shield quality (p. 305), providing its Shield AP while equipped. Weapon/armour Encumbrance is counted once.'}])
for item in market:
    item['ogreSized'] = True
write('market.json', market)
write('manifest.json', {'schemaVersion': 1, 'id': 'archives-ii', 'title': 'Archives of the Empire: Volume II', 'shortTitle': 'Archives II', 'edition': 4, 'version': '1.0.1', 'kind': 'supplement', 'dependsOn': ['core'], 'source': {'file': 'Archives of the Empire - Vol II.pdf', 'sha256': read(STAGED/'source-review.json')['sha256']}, 'compatibility': {'reviewed': True, 'notes': [
    'User-approved random-table defaults: Archives II p. 18 Species rolls supersede core while enabled; its Ogre Career table is automatic for Ogres. Explicit table choices remain available.',
    'Fifth Edition core creation, advancement, Talents and Creature Traits govern. Select five Species Skills at +5; omit old Large as a Talent and use Large size.',
    'User-approved Ogre starting adaptation: 1 Fate, 2 Fortune, no extra point; retain normal Fifth Edition random-creation bonuses.',
    'User correction: Rat Catcher covers 05–06 in the p. 18 Career table. Seaman maps to core Sailor; existing Careers retain core Class labels.',
    'User-approved Ogre carrying calculation: apply core Talent effects first, then double final capacity.',
    'User-approved equipment sizing: double ordinary weapons, armour, clothing and carrying containers; retain food/ammunition/animal/vehicle unit values, and flag other items for GM review. Printed p. 29 Ogre equipment is not doubled again.',
    'User-approved GM acknowledgement for Ogres’ writing/complex-artistry/advanced-Lore restriction; no exhaustive forbidden list is invented.',
    'Star signs use core Talent limits. Already-owned nonrepeatable grants count once, and incompatible choices prevent export. Printed penalties and accepted first-roll +25 XP remain.',
    'User resolves Witchling Star p. 39/47 by the detailed d10 table. The initial star-sign result grants at most 25 XP; ascendant/mansions grant no bonuses.',
    'User resolves Difficult (+20) in Bullgorger and Feast of the Fallen as Difficult (−1 SL). Other printed numeric effect modifiers remain; valid old difficulty modifiers use core Appendix I p. 364.',
    'Strider, Trick Riding and Warleader use approved core equivalents. Great Maw Skill/Talent labels use the same canonical Lore name. Harpoon remains unresolved rather than becoming a launcher or pack of six.',
    'Firebelly modifications, magical-item crafting/commissioning, battles and ongoing play systems are deferred. No invented retail prices or club-quality editor.'
]}, 'files': {key: key+'.json' for key in ['species','background','careers','talents','rules','spells','tables','weapons','armour','market','astrology']}})
print(json.dumps({'output': str(args.output_dir), 'careers': len(careers), 'spells': len(spells), 'shopEntries': len(market), 'registered': False}))
