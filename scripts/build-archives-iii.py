"""Build reviewed creator content from supplied Archives III; no publishing."""
from pathlib import Path
import argparse
import json
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
STAGED = ROOT.parent/'tmp/pdfs/archives-iii-review'
parser = argparse.ArgumentParser()
parser.add_argument('--output-dir', type=Path, default=STAGED/'runtime')
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
read = lambda p: json.loads(p.read_text(encoding='utf-8-sig'))
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).strip('-')
norm = lambda s: re.sub(r'\s+', ' ', s.replace('T wist', 'Twist').replace('T ouch', 'Touch').replace('T est', 'Test').replace('diety', 'deity')).strip()
pages = {p['page']:p['text'] for p in read(STAGED/'pages.json')}
def write(name, value, directory=None):
    directory = directory or args.output_dir
    directory.mkdir(parents=True, exist_ok=True)
    (directory/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

def convert(text):
    for old, new in [('Average (+20)', 'Average (+2 SL)'), ('Difficult (–10)', 'Difficult (−1 SL)'), ('Challenging (+0)', 'Challenging (+0 SL)'), ('Hard (–20)', 'Hard (−2 SL)')]:
        text = text.replace(old, new)
    return norm(text)

careers = read(STAGED/'careers.raw.json')
for career in careers:
    for level in career['levels']:
        level['talents'] = [t.replace('Resistance (', 'Resistant (') for t in level['talents']]
        level['trappings'] = [t.replace('Inqusitor', 'Inquisitor') for t in level['trappings']]
    career['conversion'] = 'Use Fifth Edition allocations and core Talents. Academic Class follows core Priest (p. 83); the supplement gives a specialised Priest Career without a separate Class kit. Printed descriptive Trappings retain unknown weights where no matching profile exists.'
    if career['name'] == 'Priest of Solkan':
        career['conversion'] += ' Resistance (Any) uses core Resistant (Any); Inqusitor’s spelling is corrected to Inquisitor’s.'
        career['text'] = 'The book recommends Solkanites chiefly as NPCs or for a suitable party; a restrained, group-compatible priest is possible (p. 53). Solkan grants no Blessings or Miracles to a priest with any Sin or Corruption points (p. 55).'
    if career['name'] == 'Priestess of Rhya':
        career['text'] = 'Male priests of Rhya are also allowed. Rhya has no Warrior Priests or Witch Hunters (p. 73).'
write('careers.json', careers)

groups = {
 47: ('Handrich', ['A Deal’s a Deal','Carry My Burdens','Shake On It','Supply and Demand','Trickle Down','Twist of Fortune']),
 55: ('Solkan', ['Absolute Purity','Fist of Vengeance','Flaming Blade','Fury of the Righteous Sun','Light of Stasis','Still the Winds']),
 62: ('Hedgecraft', ['Dagger of the Art','Fellstave']),
 63: ('Hedgecraft', ['Goodwill','Invigorate','Lovelock','Mirkride','Nepenthe','Nostrum','Part the Branches','Protection Pouch']),
 64: ('Hedgecraft', ['Protective Charm','Sightstep','Silvertide','The Ousting','Wyrd Ward']),
 74: ('Rhya', ['Rhya’s Abundance','Rhya’s Demand','Rhya’s Dominion','Rhya’s Flock','Rhya’s Taming','Rhya’s Rage']),
}
duplicates = {'Goodwill','Mirkride','Nepenthe','Nostrum','Part the Branches','Protective Charm'}
spells = []
for page, (category, names) in groups.items():
    text = pages[page].replace('T wist', 'Twist')
    starts = [re.search(r'(?m)^'+re.escape(name)+r'\s*$', text).start() for name in names]
    for i, name in enumerate(names):
        if name in duplicates:
            continue
        chunk = text[starts[i]:starts[i+1] if i+1<len(names) else len(text)]
        chunk = re.split(r'\n(?:HANDRICH’S BLESSINGS|THE GODS OF LAW|FROZEN\s*\nASSETS)', chunk)[0]
        match = re.search(r'Range:\s*(.*?)\s*Target:\s*(.*?)\s*Duration:\s*([^\n]+)\n(.*)', chunk, re.S)
        assert match, (page, name, chunk)
        item = {'id':'archives-iii:spell:'+slug(name),'name':name,'category':category,'page':page,'range':norm(match[1]),'target':norm(match[2]),'duration':norm(match[3]),'text':convert(match[4]),'conversion':'Use Fifth Edition magic and core Traits/Talents. Valid old Test Difficulties use Appendix I SL modifiers; ordinary printed numeric bonuses remain reference text. Play effects are not automated.'}
        cn = re.search(r'CN:\s*(\d+)', chunk)
        if cn:
            item['cn'] = int(cn[1])
        if name == 'Fellstave':
            item['specialisations'] = ['Beastmen','Daemons','Orcs and Goblins','Ogres','Fimir','Trolls','Undead']
            item['conversion'] += ' Each printed target is a distinct learnable spell specialisation at normal new-spell XP. Beastmen includes Minotaurs/Centigors but excludes Skaven. No additional GM-created targets are invented.'
        spells.append(item)
assert len(spells) == 27
write('spells.json', spells)

origin_specs = [
 ('South Banker','Human',83,['Animal Care','Charm','Cool','Gossip','Language (Any)','Leadership','Lore (Any)','Melee (Basic)','Melee (Fencing)','Ranged (Blackpowder)','Ranged (Bow)','Ride (Horse)'],[['Doomed'],['Etiquette (Any)'],['Noble Blood','Pure Soul'],['Read/Write','Supportive'],['Savvy','Suave']],0),
 ('Eastender','Human',83,['Cool','Evaluate','Gossip','Haggle','Intimidate','Intuition','Language (Battle or Thieves Tongue)','Lore (Reikland)','Melee (Brawling)','Ranged (Blackpowder)','Sleight of Hand','Stealth (Urban)'],[['Argumentative','Flee!'],['Doomed'],['Nimble-fingered','Read/Write'],['Savvy','Suave']],1),
 ('Dwarf Altdorfer','Dwarf',83,['Consume Alcohol','Cool','Endurance','Evaluate','Intimidate','Intuition','Language (Khazalid)','Lore (Dwarfs)','Lore (Geology)','Lore (Metallurgy)','Melee (Basic)','Trade (Any)'],[['Craftsman (Any)','Resolute'],['Magic Resistance'],['Night Vision'],['Read/Write','Relentless'],['Sturdy']],0),
 ('Hexxerbezrik','Human',84,['Cool','Evaluate','Gossip','Intimidate','Intuition','Language (Classical)','Lore (Reikland)','Lore (Magic)','Melee (Basic)','Perception','Sleight of Hand','Stealth (Urban)'],[['Doomed'],['Beneath Notice','Read/Write'],['Savvy','Suave'],['Second Sight','Sixth Sense']],1),
 ('Docklands','Human',84,['Consume Alcohol','Evaluate','Gossip','Haggle','Intimidate','Intuition','Language (Thieves Tongue)','Lore (Reikland)','Melee (Brawling)','Row','Sail (Barge)','Sleight of Hand'],[['Criminal','Etiquette (Merchants)'],['Dealmaker','Menacing'],['Doomed'],['Savvy','Suave']],1),
]
origins = []
for name, species, page, skills, talents, random in origin_specs:
    item = {'id':'archives-iii:origin:'+slug(name),'name':'Altdorf — '+name,'species':species,'page':page,'skills':skills,'talents':talents,'randomTalents':random,'conversion':'Retain Fifth Edition physical attributes, native Languages, five Skills at +5 and creation limits; use the printed five regional Talent slots. No Career roll probabilities or additional native Languages are invented. Nimble Fingered uses core Nimble-fingered.'}
    if name == 'Eastender':
        item['randomTalentAlternative'] = 'Criminal'
        item['conversion'] += ' Criminal OR one random Talent is a single exclusive starting slot, not an extra sixth Talent.'
    if name in ['Eastender','Docklands']:
        item['conversion'] += ' Thieves’ Tongue uses the core spelling Thieves Tongue.'
    origins.append(item)
write('origins.json', origins)

rules = []
def rule(path, operation, value, page, reason):
    rules.append({'id':'archives-iii:rule:'+slug('-'.join(path)),'path':path,'operation':operation,'value':value,'page':page,'reason':reason})
rule(['gods'],'append',['Handrich','Solkan','Old Faith'],58,'Printed cult patron options (Handrich p. 47, Solkan p. 55, Old Faith p. 58); use matching Bless/Invoke patrons.')
for god, blessings, page in [('Handrich',['Charisma','Fortune','Hardiness','Protection','Wisdom','Wit'],47),('Solkan',['Battle','Conscience','Courage','Hardiness','Might','Tenacity'],55)]:
    rule(['blessings',god],'add',blessings,page,'Six fixed Blessings printed for this cult.')
all_blessings = [x['name'].removeprefix('Blessing of ') for x in read(ROOT/'dist/data/spells.json') if x['category']=='Blessing']
rule(['blessings','Old Faith'],'add',all_blessings,58,'Choose six distinct Blessings with Bless and one additional with Invoke. User-approved cost count excludes the six Bless grants; extra Blessings use core Miracle prices.')
# Only explicitly printed new specialisations, with core grouped Skill definitions.
core_skills = read(ROOT/'dist/data/skills.json')
for group, choices, page in [('Language',['Belthani'],62),('Lore',['Politics','Torture'],54),('Secret Signs',['Guilder'],46)]:
    existing = next(x['options'] for x in core_skills if x['name']==group)
    added = [c for c in choices if c not in existing]
    if added:
        rule(['skillOptions',group],'append',added,page,'Explicitly printed Career specialisations; no extra free Advances.')
config = read(ROOT/'dist/data/books/core/config.json')
if 'Magic Users' not in config['talentOptions']['Fearless']:
    rule(['talentOptions','Fearless'],'append',['Magic Users'],54,'Printed Solkan Fearless target; use the core Talent.')
write('rules.json', rules)

cant_groups = [
 ('Beasts',87,['Face of the Wild','Talons of Ghur','Thick Hide']),('Death',87,['Eyes of Death','Whispers of Doom','Death’s Visage']),('Fire',87,['Brighten Blaze','Set Alight','Fervent Bellow']),('Heavens',87,['Visions of Trauma','Crackling Blade','Visions of Fortune']),
 ('Metal',88,['Reinforcement','Heart of Iron','Quicksilver Blade']),('Life',88,['Staunch','Invigorate','Regenerate']),('Light',88,['Brighteyes','Purging Light','Perfection of the Self']),('Shadows',88,['Ulgu’s Touch','Not Your Problem','A Passing Shadow']),
]
cants = []
for lore, page, names in cant_groups:
    all_names = [n for _,p,ns in cant_groups if p==page for n in ns]
    text = pages[page].replace('T ouch','Touch')
    for name in names:
        start = re.search(r'(?m)^'+re.escape(name)+r'\s*$',text).end()
        after = [m.start() for n in all_names if (m:=re.search(r'(?m)^'+re.escape(n)+r'\s*$',text)) and m.start()>start]
        body = re.split(r'\nt he\s+',text[start:min(after) if after else len(text)])[0]
        body = convert(body).replace('Regenerate Creature Trait (WFRP page 341)','Regeneration Creature Trait (Fifth Edition core)').replace('WFRP page 249','Fifth Edition core Lore of Metal')
        cants.append({'id':'archives-iii:cant:'+slug(lore+'-'+name),'name':name,'lore':lore,'page':page,'text':body,'conversion':'Optional creation selections only: free Cant at one, three and six spells of this Colour Lore (p. 86). Current core Creature Traits apply. Live Channelling/power spending is deferred.'})
assert len(cants)==24
write('cants.json',cants)

manifest={'schemaVersion':1,'id':'archives-iii','title':'Archives of the Empire: Volume III','shortTitle':'Archives III','edition':4,'version':'1.0.0','kind':'supplement','dependsOn':['core'],'source':read(STAGED/'source.json'),'compatibility':{'reviewed':True,'notes':[
 'Fifth Edition core creation allocations, Career trackers and Talent/Creature Trait definitions govern; descriptive play effects remain references.',
 'User-approved Hedgecraft duplicate handling: retain the six core definitions and import nine new spell names. Fellstave has seven printed target specialisations.',
 'Altdorf profiles retain core physical Species/native Languages and five Skills at +5. Eastender Criminal-or-random is one exclusive Talent slot.',
 'User-approved optional Cants: select free abilities after one, three and six spells of a Colour Lore; live Channelling and power tracking are deferred.',
 'Old Faith: six chosen Blessings from Bless, one additional from Invoke; paid extras use core Miracle prices counting only Invoke and purchased Blessings, as approved by the user.',
 'User skips the alternative armour chapter entirely; core armour remains unchanged.',
 'User defers familiars to the character-manager phase. Businesses, ongoing armour repair/looting, NPCs and adventures are deferred.'
 ]},'files':{k:k+'.json' for k in ['careers','spells','origins','rules','cants']}}
manifest['source'].pop('pages',None)
write('manifest.json',manifest)

hedge = read(ROOT/'dist/data/careers.json')
hedge = next(c for c in hedge if c['id']=='hedge-witch')
hedge = json.loads(json.dumps(hedge))
hedge.update({'id':'archives-iii-hedge:career:hedge-witch','runtimeId':'hedge-witch','page':62,'replaces':'core:careers:hedge-witch','reason':'User-approved optional Archives III animal-doctor adaptation.','conversion':'Lore (Herbs) → Animal Care; Trade (Herbalist) → Animal Training; Craftsman (Herbalist) → Hardy; Master Tradesman (Herbalist) → Robust. Secret Signs (Hedge Witch) uses core Hedgefolk. Extra first-level Skill choices give no extra free Advances. Printed Trade (Charms) is absent from core and its swap remains unavailable.'})
for level in hedge['levels']:
    level['skills'] = [s.replace('Lore (Herbs)','Animal Care').replace('Trade (Herbalist)','Animal Training') for s in level['skills']]
    level['talents'] = [t.replace('Master Tradesman (Herbalist)','Robust').replace('Craftsman (Herbalist)','Hardy') for t in level['talents']]
hedge['levels'][0]['skills'] += ['Secret Signs (Hedgefolk)','Language (Belthani)']
hedge['levels'][0]['unavailableSkills'] = [{'name':'Trade (Charms) → Charm Animal','reason':'The printed source Skill is absent from Fifth Edition Hedge Witch; no extra replacement Skill is granted.'}]
variant = args.output_dir.parent/'archives-iii-hedge'
write('careers.json',[hedge],variant)
write('manifest.json',{'schemaVersion':1,'id':'archives-iii-hedge','title':'Archives III — Animal-doctor Hedge Witch','shortTitle':'Hedge Witch variant','edition':4,'version':'1.0.0','kind':'variant','dependsOn':['archives-iii'],'source':manifest['source'],'compatibility':{'reviewed':True,'notes':[hedge['conversion']]},'files':{'careers':'careers.json'}},variant)
print(json.dumps({'careers':len(careers),'spellNames':len(spells),'origins':len(origins),'cants':len(cants),'output':str(args.output_dir)}))
