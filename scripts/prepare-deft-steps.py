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
        if career['name'] == 'Trickster-Priest' and level['level'] == 3:
            level['skills'][level['skills'].index('Perform (Acting)')] = 'Entertain (Acting)'
            changes.append('Printed Perform (Acting) uses Entertain (Acting), by user choice')
        if career['name'] == 'Trickster-Priest':
            for index, raw in enumerate(level['skills']):
                if raw in {'Art', 'Stealth'}:
                    level['skills'][index] = raw+' (Any)'
                    changes.append(f'Unspecified {raw} requires a chosen core specialisation')
        if career['name'] == 'Liberator-Priest' and 'Impassioned Zeal' in level['talents']:
            level['talents'][level['talents'].index('Impassioned Zeal')] = 'Impassioned Zeal (Any Cause)'
            changes.append('Impassioned Zeal requires an explicit Cause')
        if career['name'] == 'Liberator-Priest' and level['level'] == 2:
            # User-approved move, not a replacement Skill or extra free grant.
            level['skills'].remove('Public Speaking')
            level['talents'].append('Public Speaking')
            changes.append('Level-two Public Speaking moves from Skills to the Public Speaker Talent options')
        for index, raw in enumerate(level['talents']):
            if raw in {'Invoke (The Night Prowler)', 'Invoke (The Gamester)',
                       'Invoke (The Deceiver)', 'Invoke (The Protector)'}:
                canonical = 'Invoke (Ranald)'
                changes.append(raw+' → '+canonical+'; retains the Career-specific printed Miracle list')
            else:
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
        career['adaptation'] = 'Reviewed Fifth Edition changes: '+('; '.join(sorted(set(changes))))+'.'
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
 ('Thin Jimmy','2GC',0,'Exotic',33,'Steel Mummit\n','GLASS CUTTING SUCCESS TABLE'),
 ('Telescopic Pole','3GC',1,'Exotic',33,'T elescopic Stick\n',None),
]
qualification = 'The p. 32 prices and Availability are a rough guide for discreet artisan-made tools; ordinary market purchases may arouse suspicion.'
gear = []
for name, price, enc, availability, description_page, heading, stop in tool_rows:
    original = passage(description_page, heading, stop)
    text = difficulty(original)
    entry = {'id':'deft-steps:gear:'+slug(name), 'name':name, 'page':32, 'price':price, 'enc':enc,
             'availability':availability, 'category':'Thieving tools', 'text':text,
             'conversion':f'Description: p. {description_page}. '+qualification}
    if name in {'Thin Jimmy', 'Telescopic Pole'}:
        alias = 'Steel Mummit' if name == 'Thin Jimmy' else 'Telescopic Stick'
        entry['conversion'] += f' User-approved printed naming mismatch: table {name} uses the description headed {alias}. The naming correction alone is not a Legacy adaptation.'
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

pending = []
decisions = [
 {'page':22, 'subject':'Public Speaking printed as a Skill', 'decision':'Move it to level-two Talent options as core Public Speaker. It remains a listed level-three option, without an extra free rank.', 'adapted':True},
 {'page':25, 'subject':'Protector list headed Trickster-Priests', 'decision':'Assign the Protector Miracle list to Liberator-Priest; retain the printed heading mismatch note.', 'adapted':False},
 {'page':24, 'subject':'A Suitable Stooge versus A Suitable Sucker', 'decision':'Treat both as the detailed A Suitable Sucker Miracle, retaining the name mismatch note.', 'adapted':False},
 {'page':13, 'subject':'Invoke aspect names', 'decision':'All four aspects use Invoke (Ranald) with their own printed Career-specific Miracle lists.', 'adapted':True},
 {'page':32, 'subject':'Two tool naming pairs', 'decision':'Thin Jimmy uses Steel Mummit description; Telescopic Pole uses Telescopic Stick description. Retain table prices and weights with mismatch notes.', 'adapted':False},
 {'page':34, 'subject':'Abstract NPC Armour', 'decision':'Use the first number as abstract all-location protection, without stacking assigned armour. Parenthesised totals are references only. Brunner p. 111 uses explicit printed locations instead.', 'adapted':True},
 {'page':133, 'subject':'Hounds’ Stride Trait', 'decision':'User-approved Stride → core Sprinter (p. 361): Run Movement ×1.5 when Running. Add a Legacy explanation; do not substitute the Striding Gait Talent.', 'adapted':True},
 {'page':20, 'subject':'Trickster-Priest Perform (Acting)', 'decision':'Use Entertain (Acting), with a Legacy note. This remains the same Skill already listed at level two, without an extra grant.', 'adapted':True},
 {'page':20, 'subject':'Unspecified Art and Stealth', 'decision':'Offer an explicit core specialisation, without additional free Advances.', 'adapted':True},
 {'page':22, 'subject':'Unspecified Impassioned Zeal Cause', 'decision':'Require an explicit Cause when selected; Father Pedragar p. 83 retains an unspecified-Cause warning until supplied by the GM.', 'adapted':True},
 {'page':47, 'subject':'Forger Skill punctuation', 'decision':'Use Art (Calligraphy) 55, Art (Painting) 40, Melee (Basic) 33 and Perception 50; retain the printed punctuation discrepancy.', 'adapted':False},
 {'page':111, 'subject':'Brunner Lore punctuation', 'decision':'Use Lore (Tilea) 50, retaining the printed comma discrepancy.', 'adapted':False},
 {'page':18, 'subject':'Stay Lucky', 'decision':'Use core Cheat the Odds (p. 224) with a Legacy explanation on the affected Miracle lists.', 'adapted':True},
]
profile_overrides = []
for profile in read(args.input_dir/'profiles.raw.json'):
    if profile['page'] == 133 and re.search(r'\bStride\b', profile['sections'].get('Traits', '')):
        profile_overrides.append({
            'page':133, 'heading':profile['heading'],
            'traitReplacements':[{'printed':'Stride', 'canonical':'Sprinter', 'corePage':361}],
            'adaptation':'The printed Fourth Edition Stride Trait uses the user-approved Fifth Edition Sprinter Trait (core p. 361): multiply Run Movement by 1.5 when Running.',
        })
assert len(profile_overrides) == 3
assert len(careers) == 9 and len(spells) == 32 and len(gear) == 15
args.output_dir.mkdir(parents=True, exist_ok=True)
for filename, value in [('careers.json',careers),('spells.json',spells),('gear.json',gear),('rules.json',rules),
                        ('profiles.raw.json',read(args.input_dir/'profiles.raw.json')),('profile-overrides.json',profile_overrides),
                        ('pending.json',pending),('decisions.json',decisions)]:
    (args.output_dir/filename).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
source = read(args.input_dir/'source-review.json')
source.update(status='User source decisions recorded; runtime registration still requires NPC conversion, handlers, coverage and release verification.', preparedGear=len(gear))
(args.output_dir/'source-review.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'careers':len(careers),'miracles':len(spells),'independentGear':len(gear),'pending':len(pending),'output':str(args.output_dir)}))
