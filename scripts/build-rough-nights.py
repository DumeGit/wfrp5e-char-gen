"""Build the reviewed Gnome supplement after explicit conversion decisions.

Default output is staged outside dist. This script never registers a book.
"""
from pathlib import Path
import argparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]
STAGED = ROOT.parent/'tmp/pdfs/rough-nights-review'
parser = argparse.ArgumentParser()
parser.add_argument('--output-dir', type=Path, default=STAGED/'prepared')
parser.add_argument('--small-talent', required=True, choices=['omit','retain'])
parser.add_argument('--wounds', required=True, choices=['core'])
parser.add_argument('--bawd', required=True, choices=['knave','unavailable'])
parser.add_argument('--miracles', required=True, choices=['map','unavailable'])
parser.add_argument('--suffuse', required=True, choices=['allow','unavailable'])
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
read = lambda path: json.loads(path.read_text(encoding='utf-8-sig'))
slug = lambda text: re.sub(r'[^a-z0-9]+','-',text.lower()).strip('-')
def write(name, value):
    (args.output_dir/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

pages = read(STAGED/'pages.json')
tables = read(STAGED/'tables.raw.json')
core = read(ROOT/'dist/data/careers.json')
aliases = {'Advisor':'Adviser'}
if args.bawd == 'knave': aliases['Bawd']='Knave'
career_rows = []
for row in tables['careers']:
    target = next((c for c in core if c['name'] == aliases.get(row['result'],row['result'])),None)
    if not target:
        if row['result']=='Bawd' and args.bawd=='unavailable': continue
        raise ValueError('Unresolved Career: '+row['result'])
    career_rows.append({**row,'result':target['id']})
careers = list(dict.fromkeys(row['result'] for row in career_rows))
table_notes = 'Fifth Edition Career profiles and normal random-creation bonuses apply, not Fourth Edition creation XP. Advisor → Adviser.'
if args.bawd=='knave':table_notes+=' User-approved Bawd → Knave mapping uses the revised Fifth Edition Rogue Career.'
out_tables = [{'id':'rough-nights:table:species','name':'Rough Nights Species','kind':'species','page':87,'sides':100,'rows':tables['species'],'conversion':'Optional printed Species table: Gnome on 98. Does not merge with Archives II’s Ogre table or change the existing default. Fifth Edition creation rewards replace the old +20 XP.'}]
if args.bawd=='knave':out_tables.append({'id':'rough-nights:table:gnome-careers','name':'Gnome Careers','kind':'career','species':'Gnome','page':87,'sides':100,'rows':career_rows,'conversion':table_notes})
write('tables.json',out_tables)

talents = [['Beneath Notice','Suffuse with Ulgu'],['Luck','Mimic'],['Night Vision'],['Fisherman','Read/Write'],['Second Sight','Sixth Sense']]
if args.small_talent=='retain':talents.append(['Small'])
references = [
    {'page':88,'text':'Proposed Fifth Edition adaptation, approved by the user: Gnomes start with 2 Fate and 2 Fortune, with no extra points to distribute. The supplement instead prints Fate 2, Resilience 0 and two extra points; it does not supply Fifth Edition starting values. Normal Fifth Edition random-creation bonuses still apply.'},
    {'page':88,'text':'Gnomes are inherently magical. With an Advance in Language (Magick), they may attempt Dispelling even without a spellcasting Talent. Gnome wizards can learn Shadows, Dark Magic and Chaos Magic, but Necromancy, Daemonology and all Chaos Magic are outlawed by their people. Only Shadows is supported by this creator’s ordinary Arcane Lore choices; dark/Chaos training and live Dispelling remain outside its current scope.'},
    {'page':89,'text':'Gnome clans are inherited from the mother and do not change on marriage. A Gnome may conceal their clan name behind an epithet. Eyes grow grey with age, typically entirely grey by age 200; hair eventually becomes deep silver. The printed 2d10 appearance tables are used without inventing age cutoffs or reroll rules.'}
]
if args.wounds=='core':references.append({'page':88,'text':'User-approved Fifth Edition Size (Small): Wounds = 2 × Toughness Bonus, plus another Toughness Bonus with Hardy (core pp. 120, 361). The supplement’s older formula, 2 × TB + WPB, is not used. Small is recorded separately from the five Species Talent choices.'})
mechanics = {'size':'Small','careers':careers,'arcaneLores':['Shadows'],'references':references}
species = {'Gnome':{'id':'rough-nights:species:gnome','page':88,'offsets':dict(zip(['WS','BS','S','T','I','Ag','Dex','Int','WP','Fel'],[20,10,10,15,30,30,30,30,40,15])), 'languages':['Reikspiel'],'fate':2,'fortune':2,'movement':3,'age':[20,10],'height':[40,1],'appearancePage':89,'skills':['Channelling (Ulgu)','Charm','Consume Alcohol','Dodge','Entertain (Any)','Gossip','Haggle','Language (Ghassally)','Language (Magick)','Language (Wastelander)','Outdoor Survival','Stealth (Any)'],'talents':talents,'randomTalents':0,'mechanics':mechanics,'conversion':'User-approved Fate/Fortune adaptation: 2 Fate / 2 Fortune, no extra distribution; display the proposal warning. Fifth Edition five Species Skills at +5 and ordinary creation limits replace Fourth Edition +5/+3 allocations. Reikspiel is explicitly native; Ghassally remains selectable. '+('Omit Small as a sixth Species Talent and record Small size separately.' if args.small_talent=='omit' else 'Retain Small as an additional Species Talent by user instruction.')}}
write('species.json',species)

appearance = read(STAGED/'appearance.raw.json')
forenames = ['Elowen','Ia','Kerra','Ladoca','Metheven','Morwen','Steren','Tryfena','Breward','Daveth','Gwinear','Mawnan','Meriasek','Nivet','Talan','Ythel']
surnames = ['Annearil','Frayne','Hawken','Landweth','Peddlar','Scantleburn','Thorne','Trethewey','Mudfoot','Glittereye','Soleheart','Patchcloak']
write('background.json',{'Gnome':{'id':'rough-nights:background:gnome','page':89,'forenames':forenames,'surnames':surnames,'eyes':[r['result'] for r in appearance['eyes']['rows']],'hair':[r['result'] for r in appearance['hair']['rows']],'rollTables':appearance,'namePages':{'forenames':88,'surnames':89},'conversion':'Printed name examples are sampled uniformly as suggestions, not a printed random-name table. Surnames offer eight Glimdwarrow clans and four printed epithets. Eyes/hair use the actual 2d10 distribution (p. 89); age 10d10+20 and height 1d10+3 ft 4 in.'}})

talent_text = pages[88]['text'].split('You are suffuse with the Grey Wind of Magic,',1)[1].split('g Nome',1)[0]
talent_text = re.sub(r'\s+',' ','You are suffuse with the Grey Wind of Magic,'+talent_text).strip()
talent = {'id':'rough-nights:talent:suffuse-with-ulgu','name':'Suffuse with Ulgu','page':88,'text':talent_text+' Adaptation warning: this Fourth Edition Talent has no Fifth Edition equivalent. By user approval, its printed maximum of one and effects are retained as references. The creator does not replace displayed Stealth totals, automatically grant nearby casting SL, or import Fourth Edition per-rank Tests bonuses.','conversion':'Printed maximum 1; no Fourth Edition per-rank Tests bonus is imported. Channelling substitution and nearby Shadows +1 SL remain situational references, not permanent changes to Skill totals or casting bonuses.'}
if args.suffuse=='unavailable':talent['unavailable']='No Fifth Edition equivalent; the user deferred adapting this Talent. Choose Beneath Notice in the Species slot instead (Rough Nights p. 88).'
write('talents.json',[talent])

core_skills=read(ROOT/'dist/data/skills.json')
rules=[]
language=next(x for x in core_skills if x['name']=='Language')
if 'Ghassally' not in language['options']:rules.append({'id':'rough-nights:rule:ghassally','path':['skillOptions','Language'],'operation':'append','value':['Ghassally'],'page':88,'reason':'Printed Gnome language specialisation; core Language definition applies.'})
rules.append({'id':'rough-nights:rule:suffuse-limit','path':['talentLimits','Suffuse with Ulgu'],'operation':'add','value':1,'page':88,'reason':'Printed maximum of one purchase; no old per-rank scaling.'})
rules.append({'id':'rough-nights:rule:gods','path':['gods'],'operation':'append','value':['Evawn','Mabyn','Ringil'],'page':90,'reason':'Gnome patrons use their printed six Blessings and three core Miracle references, with matching Bless/Invoke.'})
blessings={'Evawn':['Charisma','Courage','Fortune','Finesse','Hardiness','Protection'],'Mabyn':['Battle','Hardiness','Protection','Righteousness','Tenacity','Wisdom'],'Ringil':['Breath','Charisma','Conscience','Grace','The Hunt','Wit']}
for god,choices in blessings.items():rules.append({'id':'rough-nights:rule:blessings-'+god.lower(),'path':['blessings',god],'operation':'add','value':choices,'page':90,'reason':'Six Blessings printed in the Gnome Gods table.'})
write('rules.json',rules)

miracles={'Evawn':['An Invitation','Trickster’s Glamour','Rhya’s Shelter'],'Mabyn':['Death Mask','You Saw Nothing','Sword of Justice'],'Ringil':['Blind Justice','Leaping Stag','Ranald’s Grace']}
if args.miracles=='unavailable':
    miracles['Evawn'].remove('Trickster’s Glamour');miracles['Mabyn'].remove('You Saw Nothing')
texts={
 'Evawn':'God of Travel, Trade and Thievery. Strictures: one coin in ten belongs to Evawn; make a profit every day by theft or barter; never be caught in a lie; never stay in one location for over a month; bring useful stolen items back to your clan.',
 'Mabyn':'God of Shadows, Revenge and Magic. Strictures: protect Gnome burrows at any cost; avenge wrongs to yourself, clan or burrow; never reveal your home burrow to outsiders; practise swordplay for at least an hour daily; if seeking to be unseen, do not be spotted.',
 'Ringil':'God of Entertainment, Merriment and Trickery. Strictures: honour reasonable requests to entertain; keep secrets within your clan, cult or cronies; break serious moments with a gag, song or trick; use practical jokes as revenge; learn a useful secret each week.'
}
cults=[]
for god,names in miracles.items():
    note='Reimagine the listed core Miracles for this god (p. 90), retaining their Fifth Edition effects and ordinary learning prices. '
    if god=='Evawn':note+=('User-approved Rich Man, Poor Man, Beggar Man, Thief → Trickster’s Glamour.' if args.miracles=='map' else 'Rich Man, Poor Man, Beggar Man, Thief is unavailable: no approved Fifth Edition mapping.')
    if god=='Mabyn':note+=('User-approved You Ain’t Seen Me, Right? → You Saw Nothing.' if args.miracles=='map' else 'You Ain’t Seen Me, Right? is unavailable: no approved Fifth Edition mapping.')
    cults.append({'id':'rough-nights:cult:'+god.lower(),'name':god,'page':90,'miracles':names,'text':texts[god]+' '+note+' Strictures are references, without ongoing tracking or automatic coin deductions.','conversion':note})
write('cults.json',cults)
source=read(STAGED/'source.json')
write('manifest.json',{'schemaVersion':1,'id':'rough-nights','title':'Rough Nights & Hard Days','shortTitle':'Rough Nights','edition':4,'version':'1.0.0','kind':'supplement','dependsOn':['core'],'source':{'file':source['file'],'sha256':source['sha256']},'compatibility':{'reviewed':True,'notes':['Printed pages are PDF positions minus one. Character-creation material is Appendix I pp. 86–90; adventures/NPCs and pub games are excluded.','Fifth Edition core governs allocations, Talent definitions, XP and creation rewards. User-approved starting Fate/Fortune are explicitly labeled as a proposed adaptation.',table_notes,'Gnome gods reuse existing core Miracle definitions through validated cult references, without duplicating spells or silently replacing core definitions.','Dark/Chaos magic remains outside the creator’s existing scope. Suffuse with Ulgu is reference-only for situational effects.','Random Species probabilities are never merged or silently replaced; selecting Gnome automatically uses its complete sole printed Career table.']},'files':{k:k+'.json' for k in ['species','background','talents','tables','rules','cults']}})
print(json.dumps({'output':str(args.output_dir),'registered':False,'careers':len(careers),'cults':len(cults)}))
