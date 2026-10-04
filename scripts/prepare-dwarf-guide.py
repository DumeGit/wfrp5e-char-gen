"""Apply individually reviewed conversions to extraction; explicit output directory required."""
import argparse,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--output-dir',type=Path,required=True);a=p.parse_args();a.output_dir.mkdir(parents=True,exist_ok=True)
stage=ROOT.parent/'tmp/pdfs/dwarf-guide-review'
def read(file):return json.loads((stage/file).read_text(encoding='utf-8'))
def write(file,value):(a.output_dir/file).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def slug(s):return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def norm(s):return re.sub(r'\s+',' ',s.replace('ﬂ','fl').replace('ﬁ','fi')).strip()
def canon(s):return norm(s).replace('*','').replace('Resistance (','Resistant (').replace('Strider (','Striding Gait (').replace('Tunnel Rat','Tunnel Fighter').replace('Warleader','War Leader').replace('Any One','Any').replace('Ranged (Thrown)','Ranged (Throwing)').replace('Protective Runes','Protection Runes').replace('Set Traps','Set Trap')
def split(s):return [norm(x) for x in re.split(r',\s*(?![^()]*\))',norm(s))]
pages=read('pages.json')
careers=read('careers.json')
for c in careers:
 for l in c['levels']:
  l['skills']=[canon(x) for x in l['skills']]
  l['talents']=[x.replace('Fearless (All)','Fearless (Any)') for x in l['talents']]
  # Preserve unpriced/unspecified gear, but normalise printed spelling variants.
  l['trappings']=[x.replace('Dwarf Hammer','Dwarf Warhammer').replace('Gromil','Gromril').replace('Oath Stone','Oathstone').replace('W ar','War') for x in l['trappings']]
write('careers.json',careers);write('origins.json',read('origins.json'));write('tables.json',read('tables.json'))
talents=read('talents.raw.json');keys={'Strength':'S','Toughness':'T','Intelligence':'Int','Willpower':'WP','Agility':'Ag','Initiative':'I','Ballistic Skill':'BS'}
for t in talents:
 if t['name']=='Crew Commander':t['text']=re.sub(r'^Flaw\s+','',t['text'])
 if t['name']=='Demolisher':t['text']=re.sub(r'^Hack weapon\s+','',t['text'])
 limit=t.pop('limitPrinted');t['limit']=int(limit) if limit.isdigit() else [keys[x.replace(' Bonus','').replace(' bonus','')] for x in limit.split(' + ')]
 t['speciesOnly']=['Dwarf'];t['conversion']='Approved Fourth Edition adaptation: printed purchase limit and effects retained. No old per-rank Test SL bonus. Situational, combat and campaign effects are references only.'
 t['text']='Adaptation warning — '+t['conversion']+' '+t['text']
 if t['name']=='Crew Commander':
  t['unavailable']='Crew Commander has no agreed Fifth Edition conversion; left unavailable by user decision.'
  t['supersededBy']={'book':'up-in-arms','contentId':'up-in-arms:talent:crew-commander','reason':'The existing unavailable Up in Arms entry retains the user’s decision; the Dwarf Guide does not unlock it.'}
 # Apply only named Test Difficulty conversions. Preserve numeric Test/critical bonuses.
 for label,old,new in [('Hard','-20','−2 SL'),('Difficult','-10','−1 SL'),('Very Hard','-30','−3 SL'),('Easy','+40','+4 SL'),('Challenging','+0','0 SL')]:t['text']=t['text'].replace(label+' ('+old+')',label+' ('+new+')')
write('talents.json',talents)
runes=read('runes.raw.json')
for r in runes:
 r['text']=r['text'].replace('Advantage','Momentum');r['conversion']='Learned rune knowledge only, not an owned enchanted item. Printed numeric modifiers remain in reference text; Advantage references use Momentum. Core Creature Traits/Talents apply. Rune forging and live activation are deferred.'
 if r['form']=='Doom':r['text']='Requires an Anvil of Doom and a Hard (−2 SL) Runesmithing Action (p. 132). '+r['text']
write('runes.json',runes)
skills=[{'id':'dwarf-guide:skill:lore-runes','name':'Lore (Runes)','char':'Int','advanced':True,'grouped':False,'options':[],'page':80,'speciesOnly':['Dwarf'],'text':'Runelore covers rune history, materials, identification and effects. The Runesmiths Guild passes it on orally; it cannot be learned from books.'},{'id':'dwarf-guide:skill:runesmithing','name':'Runesmithing','char':'Dex','advanced':True,'grouped':False,'options':[],'page':80,'speciesOnly':['Dwarf'],'text':'Used to craft, reawaken or deactivate magical runes. Rune forging is deferred to character management; no item is granted by learning a rune.'},{'id':'dwarf-guide:skill:sail-skycraft','name':'Sail (Skycraft)','char':'Ag','advanced':True,'grouped':False,'options':[],'page':80,'speciesOnly':['Dwarf'],'text':'Advanced flying-machine operation. Take-off and landing require Average (+2 SL) Tests. Normal Sail does not unlock Skycraft, and Skycraft does not grant normal Sail. Situational operations are references only.'}]
write('skills.json',skills)
rules=[];coreSkills=json.loads((ROOT/'dist/data/skills.json').read_text())
for group,values,page in [('Lore',['Runes'],80),('Art',['Tattoo','Engraving','Writing'],64),('Melee',['Engineering'],93),('Trade',['Mason'],57),('Secret Signs',['Brotherhood of Grimnir'],60)]:
 current=next(x for x in coreSkills if x['name']==group)['options']
 values=[v for v in values if v not in current]
 if values:rules.append({'id':'dwarf-guide:rule:'+slug(group),'path':['skillOptions',group],'operation':'append','value':values,'page':page,'reason':'Printed Dwarf Career/Skill specialisations; normal Fifth Edition allocations and XP.'})
write('rules.json',rules)
updates=[]
targets={'Guild Engineer':(['engineer','up-in-arms:career:artillerist'],2,None),'Outcast Engineer':(['engineer','up-in-arms:career:artillerist'],3,'Fel'),'Sky Pilot':(['engineer'],3,'Ag'),'Stoneshaper':(['artisan'],2,'I'),'Reckoner':(['lawyer'],2,None),'Grudgemaster':(['lawyer'],3,None),'Karak Miner':(['miner'],2,None),'Lodefinder':(['miner'],3,None),'Runebearer':(['messenger'],2,None),'Brother of Grimnir':(['slayer'],2,None),'Doomseeker':(['slayer'],3,None),'War-mourner':(['slayer'],4,'Fel'),'Axefighter':(['soldier'],2,'S'),'Quarreller':(['soldier'],2,None),'Thunderer':(['soldier','up-in-arms:career:handgunner'],2,None)}
for n in range(56,62):
 text=pages[n-1]['text']
 # Profile text is a bounded block before the next prose/section, checked against the PDF.
 for m in re.finditer(r'(?m)^\s*('+ '|'.join(re.escape(x) for x in targets)+r') — (Brass|Silver|Gold) (\d)\s*\nSkills:\s*(.*?)\s*Talents:\s*(.*?)\s*Trappings:\s*(.*?)(?=\n\s*\n|\n[A-Za-z].{20,}\n(?![A-Za-z].*(?:,|\))))',text,re.S):
  name=m[1];ids,level,char=targets[name];profile={'level':level,'name':name,'status':m[2],'standing':int(m[3]),'skills':split(canon(m[4])),'talents':split(canon(m[5])),'trappings':split(norm(m[6]).replace('Dwarf Hammer','Dwarf Warhammer'))}
  updates.append({'id':'dwarf-guide:update:'+slug(name),'name':name,'careers':ids,'profile':profile,'page':n,'conversion':'Optional Dwarf-only Career level. Core Fifth Edition Characteristic progression retained unless explicitly replaced by this profile; no extra free Advances.',**({'characteristic':char} if char else {}),**({'unavailable':'Unavailable: its Strength replacement duplicates Fifth Edition Soldier’s level-one Strength. User deferred this variant.'} if name=='Axefighter' else {})})
write('career-updates.raw.json',updates)
# Complete wrapped Trappings and the three layout blocks omitted by text-stream extraction.
trappings={
'Guild Engineer':['Trade Tools (Engineer)','Dwarf Warhammer or Dwarf Greathammer','Dwarf Handgun or Dwarf Pistol','Gromril Suit','Telescope'],
'Outcast Engineer':['Dwarf Axe or Dwarf Greataxe','Repeating Dwarf Handgun','Mark of Shame'],
'Sky Pilot':['Pilot’s Licence','Dwarf Pistol','Telescope'],
'Stoneshaper':['Trade Tools (Mason)','Dwarf Warhammer'],
'Reckoner':['Reckoner’s Log','1d10 Shattered Tablets','Runescribing Kit','Dwarf Axe or Dwarf Warhammer','Breastplate','Mail Skirt','Plate Helm (Open)'],
'Grudgemaster':['Research Archive','Beardling Apprentice','Key to the Hall of Remembering'],
'Karak Miner':['Dwarf Pick','Miner’s Helm','Davrich Lamp','Candle','Lamp Oil','Breastplate','Mail Skirt'],
'Lodefinder':['Steam Drill','Blasting Charge','Beardling Apprentice'],
'Runebearer':['Dwarf Axe','Dwarf Crossbow and Ammunition','Leather Jack'],
'Brother of Grimnir':['Wards of Grimnir (protective tattoos)','Dwarf Axe or Dwarf Greataxe'],
'Doomseeker':['2 Whirling blades of death'],
'War-mourner':['2 Runic Chainaxes'],
'Axefighter':['Dwarf Axe or Dwarf Greataxe','Shield','Breastplate','Mail Skirt','Plate Helm (Open)'],
'Quarreller':['Dwarf Crossbow and Ammunition','Breastplate','Mail Skirt','Plate Helm (Open)'],
'Thunderer':['Dwarf Handgun and Ammunition','Breastplate','Mail Skirt','Plate Helm (Open)']}
missing={
'Sky Pilot':(['Charm','Navigation','Outdoor Survival','Sail (Skycraft)'],['Acute Sense (Sight)','Maverick','Seasoned Traveller','Short Fuse'],'Silver',3,56),
'Runebearer':(['Cool','Melee (Basic)','Ranged (Crossbow)','Secret Signs (Ranger)','Stealth (Any)','Swim'],['Orientation','Seasoned Traveller','Striding Gait (Rocky)','Tireless'],'Silver',1,58),
'War-mourner':(['Intuition','Leadership'],['Ancestral Grudge','Berserk Charge','Combat Master','War Leader'],'Brass',2,60),
'Axefighter':(['Consume Alcohol','Gamble','Intimidate','Melee (Two-handed)','Outdoor Survival','Ranged (Throwing)'],['Demolisher','Drilled','Shieldsman','Tireless'],'Silver',3,61)}
for name,(skills,ts,status,standing,page) in missing.items():
 ids,level,char=targets[name]
 updates.append({'id':'dwarf-guide:update:'+slug(name),'name':name,'careers':ids,'profile':{'level':level,'name':name,'status':status,'standing':standing,'skills':skills,'talents':ts,'trappings':[]},'page':page,'conversion':'Optional Dwarf-only Career level. Core Fifth Edition progression retained unless explicitly replaced; no extra free Advances.',**({'characteristic':char} if char else {})})
for u in updates:
 u['profile']['trappings']=trappings[u['name']]
 if u['name']=='Axefighter':u['unavailable']='Unavailable: its Strength replacement duplicates Fifth Edition Soldier’s level-one Strength. User deferred this variant.'
 if u['name']=='Outcast Engineer':
  u['profile']['skills'].remove('Entertain');u['profile']['unavailableSkills']=[{'name':'Entertain','reason':'Printed without a required specialisation; left unresolved rather than invent a choice.'}]
assert len(updates)==15
write('career-updates.json',updates)
names=[]
for m in re.finditer(r'(?m)^(\d{3})-(\d{3}) ([^\n]+)',pages[38]['text']):
 parts=m[3].replace('Ya d r i','Yadri').replace('Vany ra','Vanyra').replace('Y anni','Yanni').replace('Y orri','Yorri').split();assert len(parts)==2,m[0]
 names.append({'min':int(m[1]),'max':int(m[2]) or 1000,'male':parts[0],'female':parts[1]})
next(x for x in names if x['min']==738)['max']=745
# Printed origin suggestions, preserving the country/range labels in the record.
birthplaces=[]
raw=pages[40]['text'];write('birthplaces.raw.json',{'text':raw})
for m in re.finditer(r'(?m)^(\d+)\s*-\s*(\d+)\s+(.*)$',raw):birthplaces.append({'min':int(m[1]),'max':int(m[2]),'result':norm(m[3])})
birthplaces.append({'min':100,'max':100,'result':'Norsca — Kraka Ravnsvake'})
next(x for x in birthplaces if x['min']==11)['max']=12;next(x for x in birthplaces if x['min']==19)['max']=25
write('dwarf-creation.json',{'names':{'page':39,'rows':names},'birthplaces':{'page':41,'rows':birthplaces},'longbeard':{'page':50,'text':'Adaptation warning: user-approved creation interpretation, −1 starting Fate and Fortune; age 120 or older, subject to GM discretion. At Brass/Silver count as Gold 1 with other Dwarfs; at Gold count Standing one higher, for social Tests only, not Earnings. Printed +10 on Tests to avoid/remove Conditions is a situational reference. The 0-Fate Resilience/Resolve fallback is deferred to character management.'}})

weapons=[];gear=[];armour=[]
for name,group,enc,reach,damage,q,price in [
('Dwarf Axe','Basic',1,'Average','SB+4','Hack','1 GC'),('Dwarf Warhammer','Basic',1,'Average','SB+4','Pummel','1 GC'),('Whirling blades of death','Flail',2,'Long','SB+5','Distract, Hack, Impact, Tiring, Wrap','5 GC'),('Dwarf Greataxe (2H)','Two-handed',3,'Long','SB+6','Hack, Impact, Tiring','4 GC'),('Dwarf Greathammer (2H)','Two-handed',3,'Average','SB+7','Damaging, Pummel','4 GC'),('Dwarf Pick (2H)','Two-handed',3,'Average','SB+6','Damaging, Impale','1 GC'),('Steam Drill (2H)','Engineering',3,'Average','SB+6','Impact, Impale','12 GC'),('Cog Axe','Engineering',1,'Average','SB+4','Hack, Penetrating, Trap Blade','15 GC'),('Steam Gauntlet','Engineering',1,'Personal','SB+7','Pummel, Shield (1)','40 GC')]:
 weapons.append({'id':'dwarf-guide:weapon:'+slug(name),'name':name,'page':93,'group':group,'kind':'melee','enc':enc,'reach':reach,'damage':damage,'qualities':q})
 gear.append({'id':'dwarf-guide:gear:'+slug(name),'name':name,'page':93,'enc':enc,'price':price,'availability':'Common' if name.startswith('Dwarf') else 'Rare' if name.startswith(('Whirling','Steam Drill')) else 'Exotic','category':'Dwarf weapons'})
for name,group,enc,reach,damage,q,price,availability in [
('Dwarf Handgun (2H)','Blackpowder',2,'50','10','Blackpowder, Damaging, Impale, Penetrating, Reload 3','6 GC','Scarce'),('Dwarf Pistol','Blackpowder',0,'20','10','Blackpowder, Damaging, Impale, Penetrating, Pistol, Reload 1','12 GC','Rare'),('Dwarf Crossbow (2H)','Crossbow',2,'60','10','Impale, Reload 1','5 GC','Common'),('Drakegun (2H)','Engineering',3,'30','12','Blackpowder, Damaging, Dangerous, Penetrating, Reload 4','20 GC','Rare'),('Drakefire Pistol','Engineering',1,'20','11','Blackpowder, Damaging, Dangerous, Penetrating, Pistol, Reload 4','25 GC','Exotic'),('Repeating Dwarf Handgun (2H)','Engineering',3,'50','10','Blackpowder, Damaging, Dangerous, Impale, Penetrating, Reload 4, Repeater 3','10 GC','Exotic'),('Grudge-raker (2H)','Engineering',2,'30','10','Blackpowder, Blast 1, Damaging, Dangerous, Impale, Penetrating, Reload 3, Salvo 2','15 GC','Exotic'),('Blasting Charge','Explosives',0,'SB','12','Blast 2, Dangerous, Impact, Penetrating','2 GC','Scarce'),('Cinderblast Bomb','Explosives',0,'SB×2','10','Blast 5, Dangerous, Impact, Penetrating','3 GC','Exotic'),('Dwarf Throwing Axe','Throwing',1,'SB×2','SB+4','Hack','1 GC','Common')]:
 note='Printed profiles already include ammunition modifiers; do not apply those modifiers again.'
 if name in ['Dwarf Handgun (2H)','Dwarf Pistol']:note+=' Misfires only on 00.'
 if name in ['Drakegun (2H)','Drakefire Pistol','Blasting Charge']:note+=' Also inflicts Ablaze on affected targets.'
 if name=='Grudge-raker (2H)':note+=' Salvo 2 (p. 92): fire single or multiple shots before reloading; each shot after the first has cumulative −10 on its Ranged Test. Reload increases remaining Salvo by one, up to two; an 00 Misfire inflicts remaining Salvo hits (minimum one). Printed numeric modifiers are reference only.'
 weapons.append({'id':'dwarf-guide:weapon:'+slug(name),'name':name,'page':94,'group':group,'kind':'ranged','enc':enc,'reach':reach,'damage':damage,'qualities':q,'text':note})
 gear.append({'id':'dwarf-guide:gear:'+slug(name),'name':name,'page':94,'enc':enc,'price':price,'availability':availability,'category':'Dwarf weapons','text':note})
for name,enc,price,avail,page,text in [('Dwarf Bullets and Powder (12)',None,'3/3','Common',93,'Printed pack of twelve.'),('Dwarf Crossbow Bolts (12)',None,'5/-','Common',93,'Printed pack of twelve.'),('Drakefire Shots (12)',None,'1 GC','Rare',93,'The book supplies price/pack size, not Encumbrance.'),('Trollhammer Torpedo (one torpedo)',1,'5 GC','Exotic',94,'Drakegun ammunition: Range 40, Damage +14; Blackpowder, Dangerous, Impact, Reload 6; inflicts Ablaze. These are an alternate loaded weapon profile, not a separately fired handheld weapon.'),('Battle Standard',3,'8 GC','Scarce',96,'Extends Protection Rune range to 12 yards; no rune is granted.'),('Metal Foil Sheets',0,'1/6','Common',96,'Runescribing material.'),('Reckoner’s Log',3,'10 GC','Rare',96,'Stone-tablet log. The parchment version has Enc 1 but no distinct price, so is not invented as a shop profile.'),('Stone Tablet',1,'2/-','Common',96,'For durable records.'),('Candelabra (with a dozen candles)',0,'4/-','Common',95,'Illumination: 15 yards.')]:
 gear.append({'id':'dwarf-guide:gear:'+slug(name),'name':name,'page':page,'enc':enc,'price':price,'availability':avail,'category':'Dwarf trappings','text':text})
for name,enc,loc,ap,q,price in [('Gromril Breastplate',3,'Body',3,'Durable 4, Fine 1, Impenetrable, Weakpoints','1280 GC'),('Gromril Open Helm',1,'Head',3,'Durable 4, Fine 1, Partial','256 GC'),('Gromril Bracers',3,'Arms',3,'Durable 4, Fine 1, Impenetrable, Weakpoints','1024 GC'),('Gromril Plate Leggings',3,'Legs',3,'Durable 4, Fine 1, Impenetrable, Weakpoints','1280 GC'),('Gromril Helm',2,'Head',3,'Durable 4, Fine 1, Impenetrable, Weakpoints','384 GC'),('Mail Skirt',2,'Legs',2,'Flexible, Partial','1 GC'),('Miner’s Helm',1,'Head',2,'Partial','2 GC')]:
 armour.append({'id':'dwarf-guide:armour:'+slug(name),'name':name,'page':95,'enc':enc,'locations':loc,'ap':ap,'qualities':q})
 gear.append({'id':'dwarf-guide:gear:'+slug(name),'name':name,'page':95,'enc':enc,'price':'n/a' if name.startswith('Gromril') else price,'availability':'n/a' if name.startswith('Gromril') else 'Scarce' if name=='Mail Skirt' else 'Common','category':'Dwarf armour','text':('Reference only; Dwarfs do not sell gromril. Printed minimum material value: '+price+'.' if name.startswith('Gromril') else 'Printed Dwarf armour profile.')})
 penalty={'Gromril Open Helm':'−10% Perception','Gromril Helm':'−20% Perception','Gromril Plate Leggings':'−10 Stealth','Miner’s Helm':'−10% Perception'}.get(name)
 if penalty:gear[-1]['text']+=' Printed penalty: '+penalty+'; retained as a reference, not automatically converted to a Test SL modifier.'
for name,enc,value in [('Shield Platform',4,'15 GC'),('Oathstone',3,'25 GC'),('Anvil of Doom',20,'1000 GC')]:gear.append({'id':'dwarf-guide:gear:'+slug(name),'name':name,'page':96,'enc':enc,'price':'n/a','availability':'n/a','category':'Ancestral heirlooms','text':'Reference only, not sold by Dwarf clans. Printed material value: '+value+'. Live bearer/activation effects are deferred.'})
write('weapons.json',weapons);write('armour.json',armour);write('gear.json',gear)
withdrawals=[]
for name in ['bearded-axe','dwarf-hammer','slayer-s-axe-2h','dwarf-handgun-2h','dwarf-pistol','dwarf-crossbow-2h','drakefire-pistol','cinderblast-bomb']:
 for kind,tag in [('weapons','weapon'),('market','item')]:
  withdrawals.append({'id':'dwarf-guide:withdrawal:'+kind+'-'+name,'book':'archives-i','kind':kind,'target':'archives-i:'+tag+':'+name,'page':92,'reason':'Guide p. 92 supersedes Archives I Dwarf weapon options. The user approved removing these older profiles/shop options without assuming one-to-one replacements.'})
write('withdrawals.json',withdrawals)
source=read('source.json')
manifest={'schemaVersion':1,'id':'dwarf-guide','title':"Dwarf Player’s Guide",'shortTitle':'Dwarf Guide','edition':4,'version':'1.0.0','kind':'supplement','dependsOn':['core'],'source':{k:source[k] for k in ['file','sha256']},'compatibility':{'reviewed':True,'notes':['Printed page equals PDF position. Only supplied-book character-creation material is imported.','Fifth Edition allocations, XP, creation rewards and core Talent equivalents apply. Regional profiles, printed new Talent limits and Longbeard interpretation are explicitly approved adaptations.','Karak Ranger profiles remain separately selectable; Archives I remains the default when both books are enabled.','User-corrected tables: names Morgrim/Nanda 738–745; birthplace Nuln 11–12, Karak Kadrin 19–25. Huffer uses Pilot; Advisor uses Adviser; Seaman uses Sailor.','User-approved Dwarf Hammer wording in Guide Careers uses the Guide Dwarf Warhammer table profile; the naming mismatch is documented.', 'Optional p. 55 Career equipment and matching weapon Skill swaps are user-approved; ammunition quantities remain unresolved. Guide p. 92 removes older Archives I Dwarf weapons when both books are enabled.', 'Axefighter and Crew Commander remain unavailable. Printed situational numeric modifiers stay in descriptions; named Test Difficulties use core SL conversions.','No runic items are granted by learning runes. Campaign grudges/XP rewards, rune forging, machinery crews, vehicles and live combat effects remain deferred.','Appearance table referenced on p. 42 is absent from the supplied PDF; core appearance choices remain. Gromril suits and ammunition quantities stay unresolved where unspecified.']},'files':{k:v for k,v in [('careers','careers.json'),('origins','origins.json'),('tables','tables.json'),('talents','talents.json'),('skills','skills.json'),('rules','rules.json'),('runes','runes.json'),('careerUpdates','career-updates.json'),('dwarfCreation','dwarf-creation.json'),('weapons','weapons.json'),('armour','armour.json'),('gear','gear.json'),('withdrawals','withdrawals.json')]}}
write('manifest.json',manifest)
print('Prepared conversion staging at',a.output_dir)
