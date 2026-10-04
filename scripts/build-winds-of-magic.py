"""Prepare reviewed Winds of Magic creator data; registration is a separate step."""
from pathlib import Path
import argparse,json,re,unicodedata
ROOT=Path(__file__).resolve().parents[1]
STAGED=ROOT.parent/'tmp/pdfs/winds-of-magic-review'
parser=argparse.ArgumentParser()
parser.add_argument('--output-dir',type=Path,default=STAGED/'runtime')
args=parser.parse_args(); args.output_dir.mkdir(parents=True,exist_ok=True)
read=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
slug=lambda s:re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
norm=lambda s:re.sub(r'\s+',' ',s.replace('T est','Test').replace('T oughness','Toughness').replace('W illpower','Willpower')).strip()
def write(n,v):(args.output_dir/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def convert(t):
    t=norm(t)
    for name,number in [('Very Easy',60),('Easy',40),('Average',20),('Challenging',0),('Difficult',-10),('Hard',-20),('Very Hard',-30)]:
        t=re.sub(re.escape(name)+r' \([+−–-]?'+str(abs(number))+r'\)',name+' ('+('+' if number>=0 else '−')+str(abs(number)//10)+' SL)',t)
    return t.replace('Resistance (','Resistant (').replace('Strider (','Striding Gait (').replace('Arcane Lore (','Arcane Magic (').replace('Advantage','Momentum')

careers=read(STAGED/'careers.raw.json'); skills=read(ROOT/'dist/data/skills.json'); config=read(ROOT/'dist/data/books/core/config.json')
extra={}; talents={}
colleges={'Hierophant':'Light','Alchemist':'Metal','Druid':'Life','Astromancer':'Heavens','Shadowmancer':'Shadows','Spiriter':'Death','Pyromancer':'Fire','Shaman':'Beasts'}
for c in careers:
    changes=[]
    for l in c['levels']:
        for i,t in enumerate(l['talents']):
            new=t.replace('Diceman','Dicer').replace('Nimble Fingered','Nimble-fingered').replace('Resistance (','Resistant (').replace('(Lore of ','(').replace('Etiquette (Guilder)','Etiquette (Guilders)')
            if new!=t:changes.append(t+' → '+new)
            l['talents'][i]=new
        l['skills']=[s.replace('(Sing)','(Singing)') for s in l['skills']]
        for raw in l['skills']:
            m=re.fullmatch(r'(.+?) \((.+)\)',raw)
            if m and not re.search('Any|All',m[2]):
                old=next(x['options'] for x in skills if x['name']==m[1])
                for choice in re.split(r',\s*(?:or )?| or ',m[2]):
                    if choice not in old:extra.setdefault(m[1],{}).setdefault(choice,c['page'])
        for raw in l['talents']:
            m=re.fullmatch(r'(Fearless|Etiquette) \((.+)\)',raw)
            if m and 'Any' not in m[2] and m[2] not in config['talentOptions'][m[1]]:talents.setdefault(m[1],{})[m[2]]=c['page']
    c['conversion']='Fifth Edition free allocations, XP, Career trackers and core Talent definitions govern; retain the ten printed starting Skill options. Class follows the p. 35 table. '+('; '.join(sorted(set(changes)))+'.' if changes else 'Use existing core Talent definitions.')
    if c['name'] in colleges:
        c['randomAlternativeFor']='wizard'
        c['text']='Affiliated with the '+colleges[c['name']]+' College tradition. The printed Career remains Human-only; core Wizard stays available. College affiliation and arcane marks are described on p. 35 and in the associated chapter.'
    if c['name']=='Mundane Alchemist':c['text']='Only Humans may learn Petty Magic or Arcane Magic (Metal). This Career is limited to four named Petty spells, Mundane Aura, Ward, Enchant Weapon, Fool’s Gold, Forge of Chamon and Mutable Metal (p. 39). More spells require entering a Wizard Career, outside this creator.'
    if c['name']=='Scryer':c['text']='Only Humans may learn Psychometry. Starting Scryers use normal Career Skill allocation without sacrificing a random Species Talent (p. 48). Augury and Psychometry cannot both be possessed (p. 46).'
extra.setdefault('Lore',{})['Alchemy']=38
for c in careers:
    if c['name']=='Mundane Alchemist':
        c['conversion']+=' User approves Lore (Alchemy) as a selectable specialisation for Savant (Alchemy), requiring a normal Advance under core p. 125. Petty Magic grants min(WP Bonus at acquisition, 4) distinct permitted spells, as approved for this Career only.'
write('careers.json',careers)
rules=[]
for path,entries in [(('skillOptions',k),v) for k,v in extra.items()]+[(('talentOptions',k),v) for k,v in talents.items()]:
    rules.append({'id':'winds-of-magic:rule:'+slug('-'.join(path)),'path':list(path),'operation':'append','value':list(entries),'page':min(entries.values()),'reason':'Additional specialisations explicitly printed in Winds of Magic Careers.'})
write('rules.json',rules)
write('skills.json',[{'id':'winds-of-magic:skill:'+slug(name),'name':name,'char':'Int','advanced':True,'grouped':False,'options':[],'page':page,'text':text} for name,page,text in [('Augury',44,'Interpret signs and portents to receive visions of the future. Only Humans and Elves may learn Augury; it cannot be possessed with Psychometry. See pp. 44–46 for readings and conditional first-level Career access.'),('Psychometry',47,'An innate Human ability to receive visions of recent events or unspoken thoughts while in a related place or touching an associated object or person. Each Test requires an Average (+2 SL) Endurance Test or a Fatigued Condition (p. 48). It cannot be possessed with Augury.')]])
core={x['name'] for x in read(ROOT/'dist/data/spells.json')}
spells=[]; duplicates=[]
for s in read(STAGED/'spells.raw.json'):
    if s['name'] in core or s['name']=='Fat of the Land':
        duplicates.append({'name':s['name'],'core':'Fare of the Land' if s['name']=='Fat of the Land' else s['name'],'page':s['page']});continue
    if s['name']=='Sapphire Arch':
        page=next(x['text'] for x in read(STAGED/'pages.json') if x['page']==101)
        s['text']+=' '+norm(page[page.index('dimension.'):page.index('Starcrossed')])
    s['id']='winds-of-magic:spell:'+slug(s['name']); s['text']=convert(s['text'])
    s['conversion']='New spell; Fifth Edition magic, core Talents/Traits and Appendix I Difficulty-to-SL conversions govern. Other printed numeric modifiers and temporary effects remain descriptions, with no permanent character bonuses. Printed WFRP page references refer to Fourth Edition.'
    spells.append(s)
ritual_names=['Bind Monstrous Beast','Bind Spirit Within Power Stone','Carve Ogham Stone','Create Power Stone','Conjuration of the Bloody Hidesman','Conjuration of the Incarnate Elemental of Death','Conjuration of Jack o’ Cinders','Corrupt Waystone','Create Construct','Create Familiar','Create Waystone Property','Cursecraft','Imbue Staff','Invocate Daemon','Materialise the Living Swamp','Remove Curse','The Crossed Scythes']
ritual_lore={'Bind Monstrous Beast':['Beasts'],'Bind Spirit Within Power Stone':list(colleges.values()),'Create Power Stone':list(colleges.values()),'Conjuration of the Bloody Hidesman':['Beasts'],'Conjuration of the Incarnate Elemental of Death':['Death'],'Conjuration of Jack o’ Cinders':['Fire'],'Corrupt Waystone':['Daemonology','Necromancy','Nurgle','Slaanesh','Tzeentch'],'Imbue Staff':list(colleges.values()),'Invocate Daemon':['Daemonology'],'Materialise the Living Swamp':['Death','Life','Shadows','Hedgecraft','Witchcraft'],'The Crossed Scythes':['Death']}
raw_rituals=read(STAGED/'rituals.raw.json'); assert len(raw_rituals)==len(ritual_names)==17
for name,r in zip(ritual_names,raw_rituals):
    text=r['text']
    if name=='Conjuration of the Bloody Hidesman':text=text[:text.index('c\nonjuraTion')]
    if name=='Create Construct':text+='\nYou create a magical Construct from the supplied body. Its default profile and optional Creature Traits are on p. 30; generating and managing that creature are deferred.'
    if name=='Create Familiar':
        p=next(x['text'] for x in read(STAGED/'pages.json') if x['page']==31)
        text+='\n'+p[p.index('You imbue the vessel'):p.index('FAMILIAR TRAITS')]
        text=text.replace('a Resilience point','a point of maximum Fortune').replace('Resilience Points','points of maximum Fortune')
    if name=='Imbue Staff':text=text.replace('A Fortune or Resolve point','One Fortune point (the printed alternative is Resolve, which Appendix I converts to Fortune)')
    cn=norm(re.search(r'CN:\s*(.*?)\s*Type:',text,re.S)[1]); xp=int(re.search(r'Learning XP:\s*(\d+)',text)[1])
    rule={'lores':ritual_lore.get(name,['*']),'learningXP':xp}
    if name=='Cursecraft':rule.update(discountLores=['Witchcraft','Daemonology','Necromancy','Nurgle','Slaanesh','Tzeentch'],discountXP=100)
    spells.append({'id':'winds-of-magic:ritual:'+slug(name),'name':name,'page':r['page'],'category':'Ritual','cn':cn,'range':'—','target':'—','duration':'—','text':convert(text),'ritual':rule,'conversion':'Memorisation uses the printed fixed Learning XP, without free spell grants, escalating spell prices, tracker boxes, Cant or extra-Lore counts. Ritual performance, generated creatures/items and sacrifices remain deferred. Fifth Edition Difficulty and Fate/Fortune conversions apply; absent ordinary spell fields are shown as unlisted.'})
write('spells.json',spells)
write('duplicates.json',duplicates)
gear=[]
for name,cost,enc,availability,bonus in [('Practical Robes','1 GC',1,'Rare',1),('Standard Robes','8 GC',2,'Exotic',2),('Elaborate Robes','30 GC',4,'Exotic',3)]:
    gear.append({'id':'winds-of-magic:gear:'+slug(name),'name':name,'page':151,'price':cost,'enc':enc,'availability':availability,'category':'Wizard robes','wearable':True,'text':f'Listed second-hand illicit-market price, approved for this creator’s shop. Robes for their associated Wind grant +{bonus} SL to Channelling. Robes associated with a different Lore impose −1 SL to Casting and Channelling. Witch and Hedge Witch Careers do not benefit. Choose the robe’s associated Wind with the GM. Situational magic modifiers remain reference text.','conversion':'Use the printed price/Encumbrance and core worn reduction. User explicitly permits the second-hand illicit-market price with its qualification. Lore-dependent casting effects remain descriptions, not permanent bonuses; no free promotion gifts are assumed.'})
gear.append({'id':'winds-of-magic:gear:portable-alchemical-laboratory','name':'Portable Alchemical Laboratory','page':50,'price':'12 GC','enc':None,'availability':'Not specified','category':'Tools and kits','text':'A travelling trunk with mortar and pestle, crucibles, a small forge, metal-working tools, glassware and ingredient drawers. The kit costs 12 GC; its Encumbrance and Availability are not specified.','conversion':'Use the explicit kit price. Do not invent a weight, capacity or Availability.'})
gear.append({'id':'winds-of-magic:gear:enchanted-staff','name':'Enchanted Staff','page':152,'price':'n/a','enc':None,'availability':'Commission Endeavour','category':'Magical artefacts','text':'A replacement requires a Commission Endeavour costing 15 GC; commissioning is deferred by user choice, so this is not a shop purchase. It can be used as a Quarterstaff in combat (use the core p. 301 combat profile). When borne, reduce CN for its associated Lore and the bearer’s Arcane spells by 1, minimum 0. It extends the body for Touch spells. Dhar-attracting staffs cause Minor Exposure to Corruption once daily. Multi-Wind Elven techniques are guarded. Apprentice Staff Trappings are mundane, not enchanted.','conversion':'User defers commissioning. Retain the named acquired-Trapping reference without an invented weight, free promotion grant, automated casting effect or manufactured item.'})
write('gear.json',gear)
tables=[]
for career,maximum,result in [('apothecary',75,'mundane-alchemist'),('wizard',95,'magister-vigilant'),('mystic',90,'scryer'),('guard',75,'beadle')]:
    tables.append({'id':'winds-of-magic:refinement:'+career,'name':career.title()+' optional Winds of Magic Career','kind':'career-refinement','career':career,'page':35,'sides':100,'rows':[{'min':1,'max':maximum,'result':career},{'min':maximum+1,'max':100,'result':'winds-of-magic:career:'+result}],'conversion':'Optional one-time second roll after the core Career result. Keep the original by choice or if the result is unavailable to the Species, following the existing user-approved policy. Wizard 01–95 retains core Wizard with a choice of the eight printed Human College Careers; no artificial probabilities are assigned to that choice.'})
write('tables.json',tables)
source=read(STAGED/'source.json')
write('manifest.json',{'schemaVersion':1,'id':'winds-of-magic','title':'Winds of Magic','shortTitle':'Winds of Magic','edition':4,'version':'1.0.0','kind':'supplement','dependsOn':['core'],'source':{'file':source['file'],'sha256':source['sha256']},'compatibility':{'reviewed':True,'notes':['Fifth Edition core rules govern; revised Fourth Edition casting, Talent ranks, promotion and the extra Channelling prerequisite for multiple Elf Lores do not replace core rules.','Retain core definitions for 63 exact-name duplicate spells. Fat of the Land (p. 87) has the same effect as core Fare of the Land (p. 250) and does not add a second learnable spell.','Psychometry sacrifice unlocks paid advancement only, with no extra free Skill points, as approved by the user. Starting Scryers retain ordinary Fifth Edition allocations.','Ritual memorisation uses the printed Learning XP; performance, crafting, familiar creation/progression, NPCs, environmental magic, potions and adventures remain campaign material. No ingredient/manufacturing/sales values become invented retail prices.','User approves Lore (Alchemy) as a selectable specialisation with Savant requiring an Advance, and caps Mundane Alchemist free Petty spells at min(WP Bonus at acquisition, 4) without extra XP or banked spells.','User defers Enchanted Staff commissioning; keep only an acquired-Trapping reference, not an ordinary shop purchase.','User approves the three printed second-hand illicit-market robe prices with their qualification. Lore-dependent equipment modifiers remain descriptions; promotion does not automatically grant gifts.']},'files':{'careers':'careers.json','skills':'skills.json','spells':'spells.json','rules':'rules.json','gear':'gear.json','tables':'tables.json'}})
print(json.dumps({'careers':len(careers),'newSpells':len(spells),'duplicates':len(duplicates),'rules':len(rules),'output':str(args.output_dir),'registryChanged':False}))
