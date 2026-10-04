"""Prepare reviewed High Elf content; registration is a separate explicit step.

Uses staged PDF extraction. No source PDF or whole-book text enters dist.
"""
from pathlib import Path
import argparse, json, re

ROOT=Path(__file__).resolve().parents[1]
STAGED=ROOT.parent/'tmp/pdfs/high-elf-review'
parser=argparse.ArgumentParser()
parser.add_argument('--output-dir',type=Path,default=STAGED/'prepared')
parser.add_argument('--discount-rituals',required=True,choices=['yes','no'])
args=parser.parse_args()
args.output_dir.mkdir(parents=True,exist_ok=True)
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
slug=lambda s:re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def write(name,value):(args.output_dir/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def norm(s):return re.sub(r'\s+',' ',s).strip()
def convert(s):
    for label,num,sl in [('Very Easy',60,6),('Easy',40,4),('Average',20,2),('Challenging',0,0),('Difficult',-10,-1),('Hard',-20,-2),('Very Hard',-30,-3)]:
        s=re.sub(re.escape(label)+r'\s*\([+–−-]?'+str(abs(num))+r'\)',label+f' ({sl:+} SL)',s)
    return s.replace('Advantage','Momentum')

aliases={'Cat Fall':'Catfall','Detect Artifact':'Detect Artefact','Nimble Fingered':'Nimble-fingered','Sea legs':'Sea Legs','Strike to Injure.':'Strike to Injure','Strider (Coastal)':'Striding Gait (Coastal)','Strider (Woodlands)':'Striding Gait (Woodland)'}
canon=lambda n:aliases.get(n,n)
base=lambda n:n.split(' (')[0]
core_skills=read(ROOT/'dist/data/skills.json')
core_talents=read(ROOT/'dist/data/talents.json')
skills={s['name']:s for s in core_skills}
talents={base(t['name']) for t in core_talents}
extras={};talent_extras={}
def collect(raw,kind,page):
    group=base(raw);m=re.search(r'\((.*)\)',raw)
    if not m or any(x in m[1] for x in ['Any','All','as Trade']):return
    values=[x.strip() for x in re.split(r',\s*(?:or )?| or ',m[1])]
    if kind=='skill':
        assert group in skills,(raw,page)
        if skills[group]['grouped']:
            for v in values:
                if v not in skills[group]['options']:extras.setdefault(group,{})[v]=page
    elif group not in ['Savant','Artistic','Craftsman','Master Tradesman','Arcane Magic']:
        for v in values:talent_extras.setdefault(group,{})[v]=page

careers=read(STAGED/'careers.raw.json')
for c in careers:
    c['id']='high-elf:career:'+slug(c['name'])
    if c['name']=='Mage':
        c['levels']=c['levels'][:4];c['advanceScheme']['I']=None
        c['text']='Mage levels 1–4 are supported. Archmage (level five) and entry into the three Elf priest branches are deferred by user decision. Student Mage requires four of this guide’s six Petty spells. Additional Colour Lores use 10 individual Channelling points and four qualifying spells, up to WP Bonus; High Magic has the further requirements on pp. 79–83.'
    notes=[]
    for l in c['levels']:
        l['talents']=[canon(t) for t in l['talents']]
        for i,s in enumerate(l['skills']):
            if base(s) in ['Animal Care','Sail'] and '(' in s:
                notes.append(f"Level {l['level']}: {s} uses core {base(s)} as an ungrouped Skill.")
                l['skills'][i]=base(s)
        for s in l['skills']:
            if s=='Haggle or Gamble':continue
            collect(s,'skill',c['page'])
        for t in l['talents']:collect(t,'talent',c['page'])
    c['conversion']='Fifth Edition free creation, XP, tracker and promotion rules govern. Use canonical core Talents, including Catfall, Detect Artefact, Nimble-fingered and Striding Gait (Woodland/Coastal); spelling/punctuation variants do not create new Talents. '+ ' '.join(notes)
    if notes:c['text']=(c.get('text','')+' Printed training context: '+' '.join(notes)).strip()
write('careers.json',careers)

table_ids={'Outer Kingdoms':'outer','Nagarythe':'nagarythe','Inner Kingdoms':'inner','Avelorn':'avelorn','Sea Elf':'sea-elf'}
core_careers=read(ROOT/'dist/data/careers.json')
career_ids={c['name']:c['id'] for c in core_careers+careers}
career_aliases={'Advisor':'Adviser','Huffer':'Pilot','Seaman':'Sailor','Bawd':'Knave'}
tables=[]
for name,rows in read(STAGED/'tables.raw.json').items():
    for r in rows:
        if name=='Outer Kingdoms' and r['result']=='Guard':r['max']=90
        if name=='Avelorn' and r['result']=='Scholar':r['max']=17
        r['result']=career_ids[career_aliases.get(r['result'],r['result'])]
    tables.append({'id':'high-elf:table:'+table_ids[name],'name':'High Elf '+name+' Careers','kind':'career','species':'High Elf','page':59,'sides':100,'rows':rows,'conversion':'Use core Career profiles and Fifth Edition random-creation rewards. Advisor → Adviser; Huffer → Pilot (p. 63); Seaman → Sailor; Bawd → Knave. User-approved table corrections: Outer Guard 89–90, Avelorn Scholar 13–17, preserving the following Knight/Artisan ranges.'})
write('tables.json',tables)

origins=read(STAGED/'origins.raw.json')
outer=['Tiranoc','The Shadowlands','Chrace','Cothique','Yvresse']
for o in origins:
    name=o['name'];o['id']='high-elf:origin:'+slug(name);o['species']='High Elf';o['randomTalents']=0
    o['talents']=[[canon(t) for t in slot] for slot in o['talents']]
    for s in o['skills']:collect(s,'skill',o['page'])
    for t in sum(o['talents'],[]):collect(t,'talent',o['page'])
    region='sea-elf' if name=='Sea Elf' else 'nagarythe' if name=='The Shadowlands' else 'avelorn' if name=='Avelorn' else 'outer' if name in outer else 'inner'
    o['careerTable']='high-elf:table:'+region
    o['careers']=[career_ids[n] for n in ['Servant','Villager','Pilot']]+([career_ids['Stevedore']] if name=='Sea Elf' else [])
    o['conversion']='User-approved Fifth Edition adaptation: select five distinct Species Skills at +5; retain core High Elf attributes, native languages, Fate/Fortune and all printed Talent slots (including six where printed). Strider (Woodlands) uses core Striding Gait (Woodland).'
    o['text']='Printed regional Career table is selected by default; the core table remains an explicit alternative. Ulthuan Career adaptations apply to the ten kingdom origins; Sea Elf career context remains its printed enclave background.'
    if name=='Sea Elf':
        o['sheetSpecies']='High Elf (Sea Elf)'
        o['background']={'page':57,'forenames':read(ROOT/'dist/data/background.json')['High Elf']['forenames'],'surnames':['Bluestrait','Cloudspear','Farborn','Greenbreeze','Seablade','Starfoam','Starguided','Wavestrider','Whitecrest']}
        o['text']='Choose an enclave and an Ulthuan kingdom of heritage. These are background choices and do not add the kingdom’s starting Skills/Talents. Uncouth Uranai’s −1 Standing applies only to interactions with Caledor, Ellyrion, Avelorn or Saphery Elves; it does not lower the displayed general Status.'
write('origins.json',origins)
for t in tables:t['origins']=[o['id'] for o in origins if o['careerTable']==t['id']]
write('tables.json',tables)

spells=read(STAGED/'spells.raw.json')
existing={x['name'] for p in (ROOT/'dist/data').rglob('*spells.json') if 'high-elf' not in p.parts for x in read(p)}
duplicates=[];new=[]
wind_lores={'Aqshy':'Fire','Azyr':'Heavens','Chamon':'Metal','Ghur':'Beasts','Ghyran':'Life','Hysh':'Light','Shyish':'Death','Ulgu':'Shadows'}
for s in spells:
    if s['name'] in existing:duplicates.append({'name':s['name'],'page':s['page']});continue
    s['id']='high-elf:spell:'+slug(s['name']);s['text']=convert(s['text'])
    s['conversion']='New guide spell. Fifth Edition core magic, Talents and Creature Traits govern; named Test Difficulties use Appendix I SL conversions. Other numeric bonuses and temporary effects remain reference descriptions. Old WFRP page references refer to Fourth Edition. Casting, sacrifices, crafting and generated creatures are not automated.'
    if s['category']=='Elven Arcane':
        winds=re.search(r'^Winds:\s*(.*?)\s+Your? ',s['text'])[1]
        s['requiredLores']=[wind_lores[w.strip()] for w in winds.split(',')]
        s['conversion']+=' Requires all printed Lores. Learned only once, attributed to the latest acquired Colour Lore for prices and prerequisite counts.'
    if s['page']>=102:s['text']+=' Esoteric faith spell: a Mage needs a tutor or access to pertinent reading materials (p. 99). Sacrifices and referenced external creature/ship profiles remain GM references.'
    new.append(s)
write('spells.json',new);write('duplicates.json',duplicates)

pages=read(STAGED/'pages.json')
talent_entries=[]
for name,page,limit,body in [
 ('Martial Arts',68,['WS'],'Your unarmed attacks lose Undamaging. Each subsequent rank permits one additional printed Quality: Damaging, Defensive, Distract, Fast, Penetrating, Precise or Pummel. At combat start or the start of a turn choose one Quality until the next turn.'),
 ('Sword-dancing',68,1,'Learn Ritual of Cleansing for free. Each additional technique costs 100 XP for each technique currently known. Techniques require a Greatsword of Hoeth to perform, except for the older traditions described by the book. Performance and Yenlui remain references.'),
 ('Blessed by Isha',83,1,'Only Elves. Receive the everqueen’s blessing in Ulthuan or Ariel’s blessing in Athel Loren. Unlocks High Magic; the full training prerequisites are on pp. 79–80.'),
 ('High Magic',83,1,'Requires Blessed by Isha and an Advance in Channelling (Qhaysh). Allows learning High Magic spells at 200 XP per Intelligence Bonus band of currently known spells (200, 400, 600, and so on). Does not state a free spell grant. The printed description adds Talent rank to High Magic Overcasting SL and removes individual Wind access restrictions for Colour spellcasting. Adaptation warning: the book describes ranks but gives no maximum; the user permits one purchase for this creator.'),
 ('Lileath’s Blessing',83,['I'],'Printed maximum: Initiative Bonus. Each rank gives +1 SL to Channelling (Qhaysh) Tests and permits one extra simultaneous aura spell that grants Ward. These situational effects remain descriptions.'),
 ('Uncouth Uranai',57,1,'When interacting with High Elves from Caledor, Ellyrion, Avelorn or Saphery, reduce Standing by one. This prejudice does not apply to Eataine or the Outer Kingdoms. This is a starting cultural Talent, not a permanent global Status reduction.'),
 ('Blood of Aenarion',51,1,'Optional High Elf ancestry. Grants one additional Fate point at creation and Magical Prodigy or Martial Prodigy. A rolled mental-corruption effect is a Psychology rather than a Mutation. Weekly Average (+2 SL) Cool Test or Yenlui (Dark). The creator applies permanent effects and XP discounts; play-time effects remain descriptions.')]:
    talent_entries.append({'id':'high-elf:talent:'+slug(name),'name':name,'page':page,'text':body,'limit':limit,'conversion':'Reviewed creator adaptation: use the printed maximum where supplied and normal Fifth Edition Talent XP prices. High Magic’s one-purchase cap is explicitly user-approved. Situational rank effects are not permanent Characteristic or Skill bonuses.'})
write('talents.json',talent_entries)

rules=[]
config=read(ROOT/'dist/data/books/core/config.json')
# Only actual new choices are appended; duplicated options use existing sources.
for group,entries in extras.items():
    if group=='Channelling':entries.pop('Qhaysh',None)
    values=[v for v in entries if v not in config['skillOptions'].get(group,[])]
    if values:rules.append({'id':'high-elf:rule:skill-'+slug(group),'path':['skillOptions',group],'operation':'append','value':values,'page':min(entries.values()),'reason':'Printed grouped Skill specialisations in regional origins and new Careers; core Skill definitions govern.'})
for group,entries in talent_extras.items():
    values=[v for v in entries if v not in config['talentOptions'].get(group,[])]
    if values:rules.append({'id':'high-elf:rule:talent-'+slug(group),'path':['talentOptions',group],'operation':'append','value':values,'page':min(entries.values()),'reason':'Printed Talent specialisations; canonical Fifth Edition Talent definitions govern.'})
rules.append({'id':'high-elf:rule:qhaysh','path':['skillOptions','Channelling'],'operation':'append','value':['Qhaysh'],'page':83,'reason':'High Magic requires Channelling (Qhaysh); Advances cannot exceed any of the eight Colour Channelling totals.'})
for t in talent_entries:
    if isinstance(t['limit'],list):rules.append({'id':'high-elf:rule:limit-'+slug(t['name']),'path':['talentLimits',t['name']],'operation':'add','value':None,'page':t['page'],'reason':'The printed Characteristic Bonus cap is checked dynamically; this does not permit unlimited purchases.'})
write('rules.json',rules)

techniques=[]
for n in [68,69]:
    text=pages[n-1]['text']
    heads=list(re.finditer(r'(?m)^([^\n]+)\nSL:\s*(\d)\n',text))
    for i,h in enumerate(heads):
        name=h[1];body=norm(text[h.end():heads[i+1].start() if i+1<len(heads) else len(text)])
        techniques.append({'id':'high-elf:technique:'+slug(name),'name':name,'page':n,'sl':int(h[2]),'text':convert(body),'conversion':'Learning uses the printed Sword-dancing cost and grants no tracker box. Combat, Yenlui and temporary effects remain references; use core Talents/Traits. Named Difficulties use Appendix I SL modifiers, and old Advantage becomes Momentum.'})
assert len(techniques)==10,techniques
write('techniques.json',techniques)

creation={'page':53,'discountRituals':args.discount_rituals=='yes','eras':[
 {'id':'ending','name':'Time of Ending','min':40,'max':130,'offset':30,'dice':[10,10],'burden':'No Elder benefits or burdens; default High Elf age.'},
 {'id':'steel','name':'Time of Steel','min':130,'max':210,'offset':120,'dice':[9,10],'burden':'One fewer old extra Fate/Resilience point. Approved Fifth Edition adaptation: reduce starting Fate or Fortune by one, your choice. Weekly Easy (+4 SL) Cool Test or move towards Yenlui (Light).'},
 {'id':'incursion','name':'Time of Incursion','min':210,'max':350,'offset':200,'dice':[15,10],'burden':'Begin with five Corruption points. Weekly Average (+2 SL) Cool Test or move towards Yenlui (Light).'},
 {'id':'voyages','name':'Time of Voyages','min':350,'max':610,'offset':320,'dice':[30,10],'burden':'At most one Endeavour between adventures, excluding Duties & Responsibilities. Weekly Challenging (+0 SL) Cool Test or gain Yenlui (Light).'},
 {'id':'sage','name':'Time of the Sage','min':610,'max':870,'offset':580,'dice':[30,10],'burden':'Prejudice (Humans). Weekly Difficult (−1 SL) Cool Test or move towards Yenlui (Light).'},
 {'id':'shadows','name':'Time of Shadows','min':870,'max':None,'offset':840,'dice':[30,10],'burden':'Starting Fate and Fortune are zero and cannot rise during creation. Blood of Aenarion takes priority (p. 53). Weekly Hard (−2 SL) Cool Test or move towards Yenlui (Light).'}
], 'psychologies':[
 {'min':1,'max':20,'name':'Hollow Heart','adjustments':{'WP':10,'Fel':-10},'text':'+10 Willpower, −10 Fellowship.'},
 {'min':21,'max':40,'name':'Profane Urgency','adjustments':{'Ag':10,'WP':-10},'text':'+10 Agility, −10 Willpower.'},
 {'min':41,'max':60,'name':'Thrill Hunter','adjustments':{'WP':10,'I':-10},'text':'+10 Willpower, −10 Initiative.'},
 {'min':61,'max':74,'name':'Tortured Visions','adjustments':{'I':-10},'text':'−10 Initiative.'},
 {'min':75,'max':89,'name':'Unending Malice','adjustments':{},'text':'+1 SL on Tests to hurt another; −1 SL on other Tests.'},
 {'min':90,'max':100,'name':'Unholy Rage','adjustments':{'WS':10},'text':'+10 Weapon Skill and subject to Frenzy (Psychology).'}
], 'enclaves':['Marienburg','Erengrad','Magritta','Brionne','Luccini','Al-Haikk'],'kingdoms':['Caledor','Ellyrion','Avelorn','Saphery','Eataine','Tiranoc','Nagarythe','Chrace','Cothique','Yvresse'], 'pettySpells':[s['name'] for s in spells if s['category']=='Petty']}
# Printed optional d10 suggestions; retain the accompanying interpretations as references.
for key,page,pattern in [('obsessions',48,r'(?m)^(\d{1,2}) (.+)'),('dreams',50,r'(?m)^(\d{1,2})\s*$')]:
    body=pages[page-1]['text'];heads=[h for h in re.finditer(pattern,body) if 1<=int(h[1])<=10];rows=[]
    for i,h in enumerate(heads):
        end=heads[i+1].start() if i+1<len(heads) else (body.find('OBSESSIONS',h.end()) if key=='obsessions' else len(body))
        rows.append({'face':int(h[1]),'text':norm((h[2]+' ' if key=='obsessions' else '')+body[h.end():end])})
    assert [x['face'] for x in rows]==list(range(1,11)),(key,rows)
    creation[key]={'page':page,'rows':rows}
write('creation.json',creation)
gear=[];weapons=[];armour=[]
def equipment(name,page,enc,price,availability,category,text,unique=False):
    gear.append({'id':'high-elf:gear:'+slug(name),'name':name,'page':page,'enc':enc,'price':'n/a' if unique else price,'availability':availability,'category':category,'text':text+' High Elf market/outpost prices only (p. 32).'+(f' Printed reference value {price}; Unique items are not ordinary shop purchases.' if unique else ''),'conversion':'Keep core equipment profiles and prices. New profiles use printed values; temporary and situational effects remain descriptions.'})
equipment('Greatsword of Hoeth',33,2,'2000GC','Unique','Weapons','Two-handed sword. Durable 3, Fine 3. Made for a specific Swordmaster.',True)
weapons.append({'id':'high-elf:weapon:greatsword-of-hoeth','name':'Greatsword of Hoeth','page':33,'kind':'melee','group':'Two-handed','enc':2,'reach':'Long','damage':'+SB+6','qualities':'Damaging, Durable 3, Fine 3, Hack'})
for family,prices,encs,durable in [('Ithilmar',[1280,256,1024,1280,384],[1,0,1,1,0],2),('Dragon Armour',[10240,2048,8192,10240,3072],[3,1,3,3,2],3)]:
    for part,loc,price,enc in zip(['Breastplate','Open Helm','Bracers','Plate Leggings','Helm'],['Body','Head','Arms','Legs','Head'],prices,encs):
        name=family+' '+part;qualities=f'Durable {durable}, Fine 2, '+('Partial' if part=='Open Helm' else 'Impenetrable, Weakpoints')
        text='Behaves as Plate using core layering and penalties. Printed penalties: −10 Stealth when worn; '+('−10 Perception.' if part=='Open Helm' else '−20 Perception.' if part=='Helm' else 'No additional Perception penalty.')
        text+=(' Minimum Enc 1 if carried rather than worn.' if family=='Ithilmar' else ' Protection blocks Ablaze at the protected location and doubles AP against heat-based attacks; do not double general AP. Full heat/fire rules are on p. 35.')
        equipment(name,34,enc,f'{price}GC','Unique','Armour',text,True)
        armour.append({'id':'high-elf:armour:'+slug(name),'name':name,'page':34,'enc':enc,'locations':loc,'ap':2,'qualities':qualities,'layer':'plate'})
equipment('Ithiltaen Helm',34,0,'1536GC','Unique','Armour','AP cell is blank in the supplied table. Protection and full penalties remain unresolved; do not infer AP. Durable 2, Fine 4, Impenetrable, Weakpoints. Nobility restriction p. 61.',True)
equipment('White Lion Cloak',34,2,'20GC','Exotic','Armour','Fine 2, Partial; Chrace considers wearing one vulgar unless you hunted and slew its White Lion (p. 35).')
armour.append({'id':'high-elf:armour:white-lion-cloak','name':'White Lion Cloak','page':34,'enc':2,'locations':'Body','ap':2,'qualities':'Fine 2, Partial','layer':'leather'})
for name,price,text in [
 ('Heartleaf (1 halm)','1GC','Burning Heartleaf attracts a Dragon’s attention and removes one Fatigued Condition from a Dragon inhaling its fumes. Cooperation is not guaranteed.'),
 ('Narinocha Wine, bottle','6/–','Challenging (+0 SL) Consume Alcohol Test. Failed drinking follows ordinary alcohol rules; Elves use the printed Narinocha d10 table instead of Stinking Drunk. Table effects and Yenlui are play references.'),
 ('Sunroot Extract, vial','2GC','Ten doses. One dose in spring water grants the printed +20 bonus to Tests to resist contracting disease for the following week (p. 37); retained as printed reference.'),
 ('Viridescent Palliative, vial','1GC','One dose lasts 12 hours: no Frenzy, Balanced Yenlui, ignore Dream/Obsession bonuses and penalties, reroll failed Cool versus Fear/Terror, ignore Prejudice/Animosity/Hatred (p. 37).')]:equipment(name,36,0,price,'Exotic' if name.startswith('Heart') else 'Scarce' if name.startswith(('Nar','Sun')) else 'Rare','Herbs & drinks',text)
for name,price,enc,avail,text in [
 ('Aethyrolabe',350,1,'Exotic','Challenging (+0 SL) Lore (Magic) discerns nearby Wind concentrations; Hard (−2 SL) points to the nearest concentration of a particular Wind.'),
 ('Flamespyre Phoenix Feather',300,0,'Exotic','Burns for about a year, illuminating as a lantern and setting things ablaze as a torch. Safe transportation remains your responsibility.'),
 ('Frostheart Phoenix Feather',400,0,'Exotic','Remains cold for about a year, providing candle illumination and refrigeration as a brick of ice. Safe transportation remains your responsibility.'),
 ('Staff of Nightelm',500,1,'Exotic','Bearer counts as having Magic Resistance 3 Creature Trait against Witchcraft, Daemonology, Necromancy, Dark Magic or Chaos Lore spells. Does not grant a Talent or a universal passive bonus.'),
 ('Staff of the Eternal Grove',350,1,'Rare','Crafting with this wood suffers −4 SL; polearms and bows made from it possess Durable 4. This purchase is the raw staff, not a crafted weapon.'),
 ('Wayshard',700,0,'Rare','Challenging (+0 SL) Pray senses the direction of the nearest waystone; aids Yenlui meditation. Sold only to someone trusted to protect it.')]:equipment(name,37,enc,f'{price}GC',avail,'Enchanted items',text)
write('gear.json',gear);write('weapons.json',weapons);write('armour.json',armour)
source=read(STAGED/'source.json')
write('manifest.json',{'schemaVersion':1,'id':'high-elf','title':"High Elf Player’s Guide",'shortTitle':'High Elf Guide','edition':4,'version':'1.0.0','kind':'supplement','dependsOn':['core'],'source':{'file':source['file'],'sha256':source['sha256']},'compatibility':{'reviewed':True,'notes':['Printed pages match PDF positions. Fifth Edition core rules govern creation and XP unless the user explicitly approved a guide-specific adaptation.','Eleven regional profiles retain printed Talent slots and core High Elf physical benefits, with five distinct Species Skills at +5. Ungrouped Animal Care/Sail use core totals and retain printed context.','Career table overlaps are corrected by user approval: Outer Guard 89–90, Avelorn Scholar 13–17. Core Career aliases are documented in each table.','Mage levels 1–4 and all learnable spell profiles are included. Archmage level five and the three advanced Elf priest career branches are deferred until the manager phase by user choice.','Mage uses 10 individual Channelling points and four qualifying spells before the next Colour Lore; other Elf Careers retain the core prerequisite.','Martial Arts and Lileath’s Blessing retain their printed Bonus-based caps; High Magic is permitted once with an explicit adaptation warning. No free High Magic spell is invented.','Core equipment profiles/prices are preserved. New equipment uses printed qualified Elf-market prices; Unique items are acquired-Trapping references. Ithiltaen Helm AP remains unresolved.','Elder creation uses printed individual Skill points alongside normal allocations, with separate per-era caps and no tracker boxes/free Talent/gear. The lost old extra point becomes a user-approved choice of −1 starting Fate or Fortune.','Blood of Aenarion uses the approved noble definition, core mental-corruption effects as Psychology and discounts only legal purchases. Ritual discount: '+('included by user decision.' if args.discount_rituals=='yes' else 'excluded by user decision.'),'Yenlui, Dreams, Obsessions, naval combat, live casting, sacrifices, crafting and intrigues remain reference/background or future manager systems.']},'files':{'careers':'careers.json','origins':'origins.json','tables':'tables.json','spells':'spells.json','talents':'talents.json','rules':'rules.json','techniques':'techniques.json','highElfCreation':'creation.json','gear':'gear.json','weapons':'weapons.json','armour':'armour.json'}})
print(json.dumps({'careers':len(careers),'origins':len(origins),'spells':len(new),'duplicates':len(duplicates),'staged':str(args.output_dir),'registered':False}))
