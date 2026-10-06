"""Prepare sourced Deft Steps data without enabling unresolved conversions.

Run extract-deft-steps.py first. This writes an isolated review directory, never
the registry. Pending choices deliberately prevent a publishable manifest.
"""
from pathlib import Path
import argparse
import json
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--input-dir', type=Path, default=ROOT.parent/'tmp/pdfs/deft-steps-review')
parser.add_argument('--output-dir', type=Path, default=ROOT.parent/'tmp/pdfs/deft-steps-prepared')
args = parser.parse_args()
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).strip('-')
clean = lambda s: re.sub(r'\s+', ' ', s.replace('\u00ad', '')).strip()
pages = read(args.input_dir/'pages.json')
core_skills = read(ROOT/'dist/data/skills.json')
core_talents = read(ROOT/'dist/data/talents.json')
config = read(ROOT/'dist/data/books/core/config.json')
known_talents = {t['name'].split(' (')[0].lower(): t['name'].split(' (')[0] for t in core_talents}

# These equivalent names were explicitly approved for earlier supplied books.
approved = {'Diceman':'Dicer', 'Strider':'Striding Gait', 'Public Speaking':'Public Speaker',
            'Trick-Riding':'Trick Rider', 'Resistance':'Resistant', 'Nimble Fingered':'Nimble-fingered',
            'Nimble-Fingered':'Nimble-fingered', 'Acute Senses':'Acute Sense'}
changed_rules = {'Diceman', 'Strider', 'Public Speaking', 'Trick-Riding'}
def talent_name(raw):
    base = raw.split(' (')[0]
    canonical = approved.get(base, known_talents.get(base.lower(), base))
    return canonical + raw[len(base):]

def difficulty(text):
    # Only explicitly named Test Difficulty modifiers, never all numeric bonuses.
    pattern = r'(Very Easy|Easy|Average|Challenging|Difficult|Hard|Very Hard)\s*\(([+−–-]?\d+)\)'
    def convert(m):
        value = int(m[2].replace('−', '-').replace('–', '-'))
        if value % 10 or abs(value) > 60:
            raise ValueError('Unreviewed Test Difficulty: '+m[0])
        return f'{m[1]} ({value//10:+d} SL)'.replace('-', '−')
    return re.sub(pattern, convert, text)

rules, additions = [], {}
careers = read(args.input_dir/'careers.raw.json')
for career in careers:
    changes = []
    for level in career['levels']:
        for index, raw in enumerate(level['talents']):
            canonical = talent_name(raw)
            level['talents'][index] = canonical
            if raw != canonical and raw.split(' (')[0] in changed_rules:
                changes.append(raw+' → '+canonical)
        for raw in level['skills']:
            match = re.fullmatch(r'(.+?) \((.+)\)', raw)
            if not match or re.search(r'Any|All', match[2]):
                continue
            skill = next((s for s in core_skills if s['name'] == match[1]), None)
            if skill:
                for option in re.split(r',\s*(?:or )?| or ', match[2]):
                    if option not in skill['options'] and option not in config.get('skillOptions', {}).get(match[1], []):
                        additions.setdefault(('skillOptions', match[1]), {})[option] = career['page']
        for raw in level['talents']:
            match = re.fullmatch(r'(Etiquette|Fearless) \((.+)\)', raw)
            if match and 'Any' not in match[2] and match[2] not in config['talentOptions'].get(match[1], []):
                additions.setdefault(('talentOptions', match[1]), {})[match[2]] = career['page']
    if changes:
        career['adaptation'] = 'Uses Fifth Edition core Talent equivalents: '+('; '.join(sorted(set(changes))))+'.'
    career['conversion'] = 'Core Fifth Edition creation allocations and Talent definitions apply. Printed Career levels, Characteristics, Skill/Talent counts and Trapping names are retained. No new random Career probabilities are invented.'
for (setting, group), entries in additions.items():
    rules.append({'id':f'deft-steps:{setting.lower()}:{slug(group)}', 'path':[setting, group],
                  'operation':'append', 'value':list(entries), 'page':min(entries.values()),
                  'reason':'Specialisations explicitly printed in Deft Steps Careers; individual Career pages identify uses.'})

spells = read(args.input_dir/'miracles.raw.json')
for spell in spells:
    aspect = spell['category']
    spell['id'] = 'deft-steps:spell:'+slug(spell['name'])
    spell['category'] = 'Taal' if aspect == 'Taal' else 'Ranald'
    original = spell['text']
    spell['text'] = difficulty(original)
    if spell['text'] != original:
        spell['adaptation'] = 'Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364). Ordinary printed numerical bonuses remain unchanged.'
    spell['conversion'] = 'Miracle effects remain reference text. No temporary Characteristic changes, Conditions, command Tests, travel rerolls or campaign actions are applied to the created character.'

def passage(page, heading, stop):
    text = pages[str(page)]
    start = text.index(heading)
    return clean(text[start+len(heading):text.index(stop, start)] if stop else text[start+len(heading):])

tool_rows = [
 ('Bag of Tarrabeth Seed','6d',0,'Scarce',32,'Bag of  Tarrabeth Seed','Bag of Soot'),
 ('Bag of Soot','2d',0,'Common',32,'Bag of Soot\n','Caltrops'),
 ('Caltrops (12)','2s',0,'Rare',32,'Caltrops \n','Crampons'),
 ('Crampons (2)','1GC',1,'Exotic',32,'Crampons \n',None),
 ('Glass Cutter','1GC',0,'Exotic',33,'Glass Cutter \n','Periscope'),
 ('Periscope','2GC',1,'Exotic',33,'Periscope\n','Smoke Bomb'),
 ('Smoke Bomb','1GC',0,'Exotic',33,'Smoke Bomb\n','Steel Mummit'),
]
qualification = 'The p. 32 prices and Availability are a rough guide for discreet artisan-made tools; ordinary market purchases may arouse suspicion.'
gear = []
for name, price, enc, availability, description_page, heading, stop in tool_rows:
    original = passage(description_page, heading, stop)
    text = difficulty(original)
    entry = {'id':'deft-steps:gear:'+slug(name), 'name':name, 'page':32, 'price':price, 'enc':enc,
             'availability':availability, 'category':'Thieving tools', 'text':text,
             'conversion':f'Description: p. {description_page}. '+qualification}
    if text != original:
        entry['adaptation'] = 'Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364).'
    gear.append(entry)
gear.append({'id':'deft-steps:gear:hunters-garb', 'name':'Hunter’s Garb', 'page':132,
             'price':'15s', 'enc':2, 'availability':'Rare', 'category':'Clothing',
             'text':passage(132, 'Hunter’s Garb\n', 'Animals and Equipment'),
             'conversion':'The printed +2 SL applies situationally in appropriate terrain; no permanent Stealth bonus is added.'})
for name, price, enc, availability in [('Hochland Lockhund','2GC',None,'Common'), ('Nordlander Bamse','4GC',None,'Scarce'),
                                     ('Grootscher Marsh Hound','5GC',None,'Scarce'), ('Dove Hawk','10GC',1,'Rare'), ('Arabyan Redhawk','25GC',1,'Exotic')]:
    gear.append({'id':'deft-steps:gear:'+slug(name), 'name':name, 'page':132, 'price':price, 'enc':enc,
                 'availability':availability, 'category':'Animals',
                 'text':'Hunting animal listed in the Animals and Equipment table. Profiles and training are on pp. 133–134.',
                 'conversion':'Records acquisition only, without creating or controlling a companion. A printed dash for Encumbrance remains unknown, not zero.'})

pending = [
 {'page':22,'subject':'Public Speaking printed as a Skill','decision':'Awaiting user choice; no move to Talents or replacement Skill assumed.'},
 {'page':25,'subject':'Protector Miracle list headed Trickster-Priests','decision':'Awaiting user choice of intended Career.'},
 {'page':24,'subject':'A Suitable Stooge versus A Suitable Sucker','decision':'Awaiting user approval of name equivalence.'},
 {'page':13,'subject':'Invoke aspect names versus Bless (Ranald)','decision':'Awaiting user choice of Fifth Edition patron handling.'},
 {'page':133,'subject':'Stride Creature Trait has no Fifth Edition equivalent','decision':'Awaiting user choice; not replaced with Striding Gait or a Movement modifier.'},
 {'page':32,'subject':'Thin Jimmy/Steel Mummit and Telescopic Pole/Stick','decision':'Awaiting user approval before pairing table prices with descriptions.'},
 {'page':34,'subject':'Abstract NPC Armour values without locations','decision':'Awaiting user choice before assigning protection locations.'},
 {'page':20,'subject':'Malformed or missing Skill specialisations and Talent targets','decision':'Awaiting user choice to retain unresolved original entries and require explicit Talent targets; related NPC malformed entries are pp. 47 and 111.'},
]
assert len(careers) == 9 and len(spells) == 32 and len(gear) == 13
args.output_dir.mkdir(parents=True, exist_ok=True)
for filename, value in [('careers.json',careers),('spells.json',spells),('gear.json',gear),('rules.json',rules),
                        ('profiles.raw.json',read(args.input_dir/'profiles.raw.json')),('pending.json',pending)]:
    (args.output_dir/filename).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
source = read(args.input_dir/'source-review.json')
source.update(status='Prepared for review only; no manifest or registry entry until pending decisions and NPC conversion are complete.', preparedGear=len(gear))
(args.output_dir/'source-review.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'careers':len(careers),'miracles':len(spells),'independentGear':len(gear),'pending':len(pending),'output':str(args.output_dir)}))
