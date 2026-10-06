"""Prepare reviewed Deft Steps NPC baselines; never infer prior XP or Advances."""
from pathlib import Path
import argparse, json, re, unicodedata

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--input-dir', type=Path, default=ROOT.parent/'tmp/pdfs/deft-steps-review')
parser.add_argument('--output-dir', type=Path, default=ROOT.parent/'tmp/pdfs/deft-steps-prepared')
args = parser.parse_args()
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', s).encode('ascii','ignore').decode().lower()).strip('-')
talents = {t['name'].split(' (')[0].lower():t['name'].split(' (')[0] for t in read(ROOT/'dist/data/talents.json')}
traits = {t['name'] for t in read(ROOT/'dist/data/books/core/traits.json')}
weapons = read(ROOT/'dist/data/books/core/weapons.json')
pages = read(args.input_dir/'pages.json')
def training_options(page):
    family = 'hounds' if page == 133 else 'hawks'
    body = pages[str(page)].split(f'Hunting Traits for {family} are:',1)[1].split('When undertaking a Hunting Endeavour',1)[0]
    headings = list(re.finditer(r'(Dig|Heel|Hunt|Point|Round|Tr ac k|Circle|Return):',body))
    out = []
    for i, match in enumerate(headings):
        name = match[1].replace('Tr ac k','Track')
        original = re.sub(r'\s+',' ',body[match.end():headings[i+1].start() if i+1<len(headings) else len(body)]).strip()
        converted = re.sub(r'(Average|Challenging)\s*\(([+-]\d+)\)',lambda m:f'{m[1]} ({int(m[2])//10:+d} SL)',original)
        out.append({'name':name,'text':converted,'page':page,**({'adaptation':'Named Fourth Edition Test Difficulties use core Appendix I SL modifiers.'} if converted != original else {})})
    return out

def split_list(text):
    parts, start, depth = [], 0, 0
    for i, char in enumerate(text):
        if char == '(': depth += 1
        elif char == ')': depth -= 1
        elif char == ',' and depth == 0:
            parts.append(text[start:i].strip()); start = i+1
    parts.append(text[start:].strip())
    return [p for p in parts if p]

def skills(raw):
    out = []
    for entry in split_list(raw):
        grouped = re.fullmatch(r'(.+?) \((.+)\)', entry)
        if grouped and re.search(r'\d', grouped[2]):
            for item in split_list(grouped[2]):
                m = re.fullmatch(r'(.+?)\s+(\d+)', item)
                if not m: raise ValueError('Unreviewed grouped Skill '+entry)
                out.append({'name':f'{grouped[1]} ({m[1]})', 'total':int(m[2])})
        else:
            m = re.fullmatch(r'(.+?)\s+(\d+)', entry)
            if not m: raise ValueError('Unreviewed Skill '+entry)
            out.append({'name':m[1], 'total':int(m[2])})
    return out

names = ['Black Guard of Morr (Knight)','Fence','Forger','Bawd','Racketeer',
         'Safe House Owner (Townsman)','Charlatan','August Sternwachter',
         'Albrecht “The Fish”','Gunna von Sperren','Father Pedragar',
         'Watchman','Watch Sergeant','Outlaw','Outlaw Chief','Typical Bounty Hunter',
         'Brunner','Hochland Lockhund','Nordlander Bamse','Grootscher Marsh Hound',
         'Dove Hawk','Arabyan Redhawk']
profiles = []
for raw, name in zip(read(args.input_dir/'profiles.raw.json'), names, strict=True):
    sections = dict(raw['sections'])
    skill_text = sections.get('Skills','').strip()
    notes, changes = [], []
    if name == 'Forger':
        skill_text = skill_text.replace('Art (Calligraphy 55, Painting) 40)', 'Art (Calligraphy 55, Painting 40)')
        skill_text = skill_text.replace('Melee (Basic) 33 Perception 50', 'Melee (Basic) 33, Perception 50')
        notes.append('User-approved punctuation interpretation: printed “Art (Calligraphy 55, Painting) 40)” means Calligraphy 55 / Painting 40; the missing comma separates Melee (Basic) 33 / Perception 50. Original wording remains in Skills.')
    if name == 'Brunner':
        skill_text = skill_text.replace('Tilea, 50','Tilea 50')
        notes.append('User-approved punctuation interpretation: printed “Tilea, 50” in the Lore list means Lore (Tilea) 50. The original wording remains in Skills.')
    pskills = skills(skill_text) if skill_text else []
    grants = []
    for entry in split_list(sections.get('Talents','')):
        entry = entry.rstrip('.')
        if entry.startswith('Doomed:'):
            grants.append({'name':'Doomed'}); continue
        rank = re.search(r' (\d+)$',entry)
        ranks = int(rank[1]) if rank else 1
        entry = entry[:rank.start()] if rank else entry
        m = re.fullmatch(r'(.+?) \((.+)\)',entry)
        base, spec = (m[1],m[2]) if m else (entry,None)
        canonical = {'Strider':'Striding Gait','Resistance':'Resistant'}.get(base, talents.get(base.lower(),base))
        if canonical not in talents.values(): raise ValueError('Unreviewed Talent '+entry)
        if canonical != base and base == 'Strider': changes.append(f'{entry} uses {canonical} ({spec})')
        for target in split_list(spec) if spec else [None]:
            if base == 'Doomed': target = None
            grants.append({'name':canonical+(f' ({target})' if target else ''),'ranks':ranks,
                           **({'adaptation':f'Printed {base} uses core {canonical} (p. 127).'} if base == 'Strider' else {})})
        if canonical in {'Impassioned Zeal','Artistic'} and spec is None:
            notes.append(f'The printed {canonical} has no specified target. Retain the baseline; the GM must supply a target before applying its situational effect.')
    trait_grants, attacks, armour = [], [], []
    size = 'Average'
    for entry in split_list(sections.get('Traits','')):
        am = re.fullmatch(r'Armour (\d+)(?: \((\d+)\))?',entry)
        if am:
            if name == 'Brunner':
                for location, ap in re.findall(r'(Head|Arms|Body|Legs) (\d+)', sections['Armour by Location']):
                    armour.append({'name':'Printed '+location+' armour','ap':int(ap),'text':location})
                notes.append('Explicit printed Armour by Location takes priority over the abstract Armour Trait and inferred layers.')
            else:
                armour.append({'name':'Printed Armour rating','ap':int(am[1]),'text':'All locations. Printed rating: '+entry+'. Parenthesised total is reference only; assigned armour does not stack.','abstract':True})
                changes.append('The first printed Armour number is abstract protection on all locations; it does not stack with assigned armour. Parenthesised totals remain references')
            continue
        attack = re.fullmatch(r'(Weapon|Ranged)(?: \((.+)\))? \+(\d+)(?: \((\d+)\))?',entry)
        if attack:
            ranged = attack[1] == 'Ranged'
            label = attack[2] or 'Natural weapon'
            label = label.replace('Sworde','Sword')
            if label != (attack[2] or 'Natural weapon'): notes.append('Printed “Sworde” is recorded as Sword; no statistics changed.')
            weapon = next((w for w in weapons if label == w['name'].replace(' (2H)','')),None)
            if label == 'Drakesmalice': weapon = next(w for w in weapons if w['name']=='Sword')
            skill_name = f'{"Ranged" if ranged else "Melee"} ({weapon["group"]})' if weapon else None
            if label == 'Boat Hook':
                notes.append('Boat Hook has no matched core weapon profile or stated Skill group. Its Damage remains printed; the baseline WS is shown until the GM supplies an attack Test value, without inventing reach, Qualities or a Skill group.')
            owned = next((s for s in pskills if s['name'] == skill_name), None)
            total = owned['total'] if owned else raw['stats']['BS' if ranged else 'WS']
            text = entry
            if attack[4]: text += f'. Printed Range {attack[4]} yards.'
            if ranged and not owned: notes.append(f'{label}: no printed Skill total matching the Fifth Edition weapon group. The baseline BS is shown until explicitly adjusted by the GM; old Damage and Range are retained.')
            value = {'name':label,'skill':total,'damage':int(attack[3]),'optional':False,'ranged':ranged,'text':text}
            value['skillName'] = skill_name
            attacks.append(value)
            continue
        m = re.fullmatch(r'(.+?) \((.+)\)',entry) or re.fullmatch(r'(.+?) (\d+)',entry)
        base, param = (m[1],m[2]) if m else (entry,'')
        if base == 'Stride':
            base = 'Sprinter'
            changes.append('Printed Stride uses core Sprinter (p. 361): Run Movement ×1.5 when Running')
        if base not in traits: raise ValueError('Unreviewed Creature Trait '+entry)
        if base == 'Size': size = param
        trait_grants.append({'name':base,**({'value':param} if param else {}),
                             **({'adaptation':'Printed Stride uses user-approved core Sprinter (p. 361): Run Movement ×1.5 when Running.'} if entry == 'Stride' else {})})
    if raw['page'] < 133: notes.append('Size is not printed; Average is the standard baseline for this humanoid profile, with explicit GM resizing available.')
    if name == 'Albrecht “The Fish”': notes.append('The printed p. 64 Wounds value is 196. It is preserved as printed, not silently corrected to 19.')
    if raw['page'] in [133,134]: notes.append('Printed animal Wounds are retained. Explicit recalculation/resizing uses the Fifth Edition Size rules instead of reconstructing the older formula.')
    profile = {'id':'deft-steps:creatures:'+slug(name), 'name':name,'page':raw['page'],
               'category':'Hunting animals' if raw['page']>=133 else 'Deft Steps NPCs',
               'example':False,'stats':raw['stats'],'size':size,'toughnessBonus':None,
               'sections':sections,'skills':pskills,'attacks':attacks,'traitGrants':trait_grants,
               'talentGrants':grants,'armourProfiles':armour,'notes':notes,'text':raw['text'],
               'conversion':'Preserve printed scores, Wounds, Skill totals, Talent ranks, Damage and Range. Core rules govern explicit changes; prior Advance counts and XP are not inferred.'}
    if sections.get('Miracles'):
        profile['magicGrants'] = [{'name':s,'lore':'Taal'} for s in split_list(sections['Miracles'])]
    if raw['page'] in [133,134]: profile['trainingOptions'] = training_options(raw['page'])
    if changes: profile['adaptation'] = '; '.join(dict.fromkeys(changes))+'.'
    profiles.append(profile)
assert len(profiles) == 22
args.output_dir.mkdir(parents=True,exist_ok=True)
(args.output_dir/'creatures.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'profiles':len(profiles),'directory':str(args.output_dir)}))
