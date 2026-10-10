"""Reviewed Bayl import with the user-approved Fifth Edition conversions."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = Path(r"C:\Users\ninod\Downloads\The Warband of Bayl of Many Eyes.pdf")
SHA = "bf5839ff86537d1d4aee619d4d4095904b58de8d86295383d5695703114b4a6e"
assert hashlib.sha256(PDF.read_bytes()).hexdigest() == SHA
# User decisions, 10 October 2026; rebuilding must preserve the approved full import.
args = argparse.Namespace(steed='core', fearless='everything', diction='one', sorcerers=True)
BOOK = 'bayl-many-eyes'
PACK = ROOT / f'dist/data/books/{BOOK}'
PACK.mkdir(exist_ok=True)

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n',encoding='utf-8',newline='\n')

def identity(kind, slug): return f'{BOOK}:{kind}:{slug}'
def source(page): return {'book':BOOK,'page':page}
def trait(name,value='',**extra): return {'name':name,'value':str(value),**extra}
def skill(options,bonus,count=1,**extra):
    return {'options':options if isinstance(options,list) else [options],'bonus':bonus,'count':count,**extra}
def talent(options,**extra):
    return {'options':options if isinstance(options,list) else [options],'ranks':1,**extra}
def gear(label,names=None,groups=None,choose=False,**extra):
    return {'label':label,'kind':'weapon',**({'names':names} if names else {}),**({'groups':groups} if groups else {}),**({'choose':True} if choose else {}),**extra}
def template(slug,name,page,adjustments,skills,talents,gear,**extra):
    return {'id':identity('template',slug),'name':name,'page':page,'source':source(page),'adjustments':adjustments,'skills':skills,'talents':talents,'traits':[],'optionalTraits':[],'gear':gear,'notes':[],'eligibility':'any',**extra}
plate=gear('Full Plate Armour — core Heavy Armour (5 AP)', ['Heavy Armour'],kind='armour')
hand=gear('Hand Weapon',['Hand Weapon'])
shield=gear('Shield',['Shield'],kind='armour')
longweapon=gear('Polearm or Two-Handed Weapon',groups=['Polearm','Two-Handed'],choose=True)
mounted=skill('Ride (Any)',20,optional=True,emptyLabel='No mount',label='Optional Chaos Steed · Ride specialisation')
mount_note='Chaos Steed is a separate starting profile, not an extra creature silently added to this sheet. Choose its Ride specialisation above when mounted.'
common_note='Full Plate Armour uses the core Heavy Armour quick profile (5 AP); weapon alternatives require explicit shared core profiles.'
melee_two=skill('Melee (Any)',20,count=2)

templates=[
 template('chosen','Chosen',8,{'WS':10,'S':5,'T':5,'I':10},[skill('Cool',10),skill('Dodge',10),skill('Language (Battle)',10),melee_two],[talent('Combat Reflexes'),talent('Resolute')],[plate,gear('Hand Weapon or Flail',['Hand Weapon'],['Flail'],True),gear('Shield, Polearm or Two-Handed Weapon',['Shield'],['Polearm','Two-Handed'],True)],notes=[common_note]),
 template('chaos-knight','Chaos Knight',8,{'WS':10,'S':5,'Ag':5,'Dex':10},[skill('Athletics',10),skill('Animal Care',10),skill('Language (Battle)',10),skill('Melee (Basic)',10),skill('Melee (Cavalry)',10),skill('Ride (Any)',20)],[talent('Roughrider'),talent('Strike Mighty Blow')],[plate,gear('Lance',['Lance']),hand,shield],trappings='Chaos Steed (create its separate mount sheet)',notes=[common_note,'Printed Rough Rider uses core Roughrider spelling. Ride has no printed specialisation; choose it explicitly.']),
]
for lord in [False,True]:
 name='Chaos Lord' if lord else 'Exalted Hero'
 skills=[skill('Cool',25 if lord else 15),skill('Dodge',15),skill('Intimidate',25 if lord else 15),skill('Intuition',25 if lord else 15),skill('Language (Battle)',15 if lord else 10),skill('Leadership',30 if lord else 15),skill('Lore (Warfare)',20 if lord else 10),melee_two,skill('Perception',20 if lord else 10),mounted]
 talents=[talent(x) for x in ['Combat Aware','Combat Master','Combat Reflexes','Inspiring',*(['Luck'] if lord else []),'Resolute',*(['Unshakeable'] if lord else []),'War Leader']]
 templates.append(template('chaos-lord' if lord else 'exalted-hero',name,9,dict(zip(['WS','BS','S','T','I','Ag','Int','WP','Fel'],[35,10,25,30,30,25,15,35,15] if lord else [25,10,15,15,25,20,10,25,10])),skills,talents,[plate,hand,shield,longweapon],notes=[common_note,mount_note,'Printed Warleader / Unshakable use core War Leader / Unshakeable spelling.']))
if args.fearless:
 fearless=talent('Fearless (Any)',label='Fearless · enemy group',adaptation='Legacy: printed Fearless (Everything) becomes an explicit core enemy-group choice, as approved.') if args.fearless=='choice' else talent('Fearless (Everything)', adaptation='Legacy: retain printed Fearless (Everything) as an exceptional adaptation approved by the user, rather than narrowing it to an ordinary enemy group.')
 templates.append(template('forsaken','Forsaken',8,{'WS':-15,'BS':-30,'I':-10,'Ag':-10,'Int':-20,'WP':15,'Fel':-20},[skill('Melee (Brawling)',10)],[fearless,talent('Frenzy'),talent('Implacable')],[plate],notes=[common_note,'Forsaken bear several GM-selected mutations; no mutation count or random distribution is printed. Beweaponed Extremities are common rather than mandatory: add the explicit core mutation/Knuckledusters equivalent if selected.'],**({'adaptation':fearless['adaptation']} if 'adaptation' in fearless else {})))

legacy_talents = {
 'Combat Reflexes': 'Legacy: p. 19 gives a fixed Initiative bonus for turn order; core Combat Reflexes instead rolls Combat Initiative twice and chooses the preferred result.',
 'Resolute': 'Legacy: p. 19 grants extra Strength Bonus when Charging; core Resolute instead permits a Cool Test to retain Momentum when gaining a Condition.',
 'Inspiring': 'Legacy: p. 19 extends Leadership to a number of followers; core Inspiring instead grants Advantage on combat Leadership Tests.',
 'War Leader': 'Legacy: p. 19 grants an ally +1 SL on a Willpower Test; core War Leader instead lets influenced allies use Leadership rather than Cool to resist Fear.'
}
for entry in templates:
 notes=[]
 for slot in entry['talents']:
  if len(slot['options']) == 1 and slot['options'][0] in legacy_talents:
   slot['adaptation'] = legacy_talents[slot['options'][0]]
   notes.append(slot['adaptation'])
 if notes: entry['adaptation'] = ' '.join(notes)

profiles=[]
nurgle={'id':identity('creatures','chaos-warrior-of-nurgle'),'name':'Chaos Warrior of Nurgle','page':8,'source':source(8),'example':False,'category':'Cultists and Mutants','stats':dict(zip(['M','WS','BS','S','T','I','Ag','Dex','Int','WP','Fel','W'],[4,55,30,45,55,45,55,30,35,55,25,19])),'size':'Average','toughnessBonus':5,'skills':[],'talents':[{'name':'Etiquette (Followers of Nurgle)','ranks':1}],'traits':[trait('Animosity','Overt followers of Tzeentch',adaptation='Legacy: the p. 19 summary gives +1 SL to attacks and a passed-Test Fellowship penalty. Core Animosity instead applies +1 SL to Fellowship-based opposition/disparagement; use the full core Psychology rule.'),trait('Champion'),trait('Corruption','Minor'),trait('Disease','Itching Pox'),trait('Distracting',adaptation='Legacy: the printed −20 Test penalty becomes the core −2 SL penalty, following Appendix I p. 364.'),trait('Mark of Chaos','Nurgle')],'optionalTraits':[trait('Mutation')],'attacks':[{'name':'Hand Weapon','skill':55,'damage':8,'optional':False,'text':''}],'armour':[{'name':'Heavy Armour','ap':5,'locations':'Head, Arms, Body, Legs','quick':True,'shield':False,'optional':False}],'spells':[],'sections':{},'notes':['Mark of Nurgle is the existing core Mark of Chaos (Nurgle), core p. 359. Its +10 Toughness is already included in T55, and its Etiquette grant is recorded once.','The supplement prints only a Weapon +8 rating, not separate Skill totals. No extra core Chaos Warrior Skill advances are silently copied into this distinct printed profile.','Core Animosity, Distracting, Disease and Talent descriptions replace the outdated summaries on p. 19.']}
profiles.append(nurgle)
if args.steed:
 core=args.steed=='core'
 note='Legacy: printed Stride uses core Sprinter; Large Size adds SB5 to Hooves and Horns, changing printed +8 to +13.' if core else 'Legacy: printed Stride uses core Sprinter. Printed +8 Damage is retained by user choice rather than applying the additional core Large Size SB5.'
 profiles.append({'id':identity('creatures','chaos-steed'),'name':'Chaos Steed','page':8,'source':source(8),'example':False,'category':'Mounts','stats':dict(zip(['M','WS','BS','S','T','I','Ag','Dex','Int','WP','Fel','W'],[8,35,None,55,35,31,30,None,15,15,10,24])),'size':'Large','toughnessBonus':3,'hitLocations':['Head','Body','Forelegs','Rear Legs'],'skills':[],'talents':[],'traits':[trait('Size','Large'),trait('Sprinter',adaptation=note),trait('Trained','War')],'optionalTraits':[trait('Mutation')],'attacks':[{'name':'Hooves and Horns','skill':35,'damage':13 if core else 8,'printedDamage':8,'optional':False,'text':'Primary melee attack', 'free':False, 'adaptation':note}],'armour':[{'name':'Barding','ap':3,'locations':'Head, Body, Forelegs, Rear Legs','optional':True,'quick':False,'shield':False}],'spells':[],'sections':{},'notes':['Printed WS35 already includes its War training; it is not added twice. Printed 24 Wounds are preserved until an explicit build change. Hooves and Horns are one printed Weapon attack, not an additional Horns Free Attack.'],'adaptation':note})

refs=[{'id':identity('reference',slug),'name':name,'category':'rule','topic':'Chaos Warriors','page':page,'text':text} for slug,name,page,text in [
 ('applying-templates','Applying Chaos Warrior Advancement Templates',3,"Add the indicated Advances to the base creature’s Characteristics and add its listed Skill Advances, Talents and Trappings. Some templates also include customisation options. Recalculate Wounds after adjusting Strength, Toughness and Willpower."),
 ('sorcerer-lores','Chaos Sorcerer Spell Lists',9,'Chaos Sorcerers use one of the Lores of Fire, Death, Metal or Shadow. A Sorcerer bearing a Chaos god’s Mark may also use the Lore of Tzeentch, Slaanesh or Nurgle respectively.'),
 ('sorcerer-armour','Chaos Sorcerers and Armour',9,'Ordinary armour inhibits Chaos Sorcerers’ spellcasting as it does other spellcasters. Chaos Armour gifted by their patrons does not inhibit spellcasting. When designing a Sorcerer, choose no armour, mundane armour or Chaos Armour; the passage supplies no separate armour protection values.')]]

# Sorcerer records are added only after the explicit conversion decision.
if args.sorcerers:
 if not args.diction: raise ValueError('Choose the Sorcerer Lord repeat-rank conversion first.')
 colours=['Fire','Death','Metal','Shadows']
 for lord in [False,True]:
  skills=[skill('Channelling (Any)',20 if lord else 5),skill('Cool',25 if lord else 15),skill('Dodge',20 if lord else 10),skill('Entertain (Storytelling)',25 if lord else 10),skill('Intuition',30 if lord else 15),skill('Language (Magick)',25 if lord else 10),*([skill('Leadership',15)] if lord else []),skill('Lore (Magic)',20 if lord else 10),*([skill('Lore (Theology)',10)] if lord else []),skill(['Melee (Basic)','Melee (Polearm)'],10),skill('Perception',30 if lord else 20),mounted]
  talents=[*([talent('Aethyric Attunement')] if lord else []),talent([f'Arcane Magic ({l})' for l in colours],label='Chaos Sorcerer · Colour Lore'),*([talent('Instinctive Diction',adaptation='Legacy: printed Instinctive Diction 2 is reduced to one core rank; the Fifth Edition Talent is not repeatable.')] if lord and args.diction=='one' else []),*([talent('Luck'),talent('Magical Sense'),talent('Menacing')] if lord else []),talent('Petty Magic'),talent('Second Sight'),*([talent('Sixth Sense')] if lord else [])]
  templates.append(template('chaos-sorcerer-lord' if lord else 'chaos-sorcerer','Chaos Sorcerer Lord' if lord else 'Chaos Sorcerer',9,{'WS':10,'S':5,'T':15,'I':20,'Ag':15,'Dex':20,'Int':35,'WP':30,'Fel':10} if lord else {'T':10,'I':15,'Dex':10,'Int':20,'WP':20,'Fel':10},skills,talents,[hand,gear('Staff — choose its core Polearm profile',groups=['Polearm'],choose=True)],trappings='GM chooses robes or armour and an unspecified Magic Item; none has automatic statistics. Optional Chaos Steed requires its own sheet.',magicGroups=[{'categories':['Petty'],'count':6 if lord else 3},{'categories':['Arcane',*colours,'Tzeentch','Slaanesh','Nurgle'],'minimum':0,'count':12 if lord else 6}],matchWind=True,chaosLores=colours,notes=[mount_note,'Printed Lore of Shadow uses core Shadows. Channelling must match the chosen Colour Lore. A god’s spells require its matching Mark and Chaos Magic Talent.','No robes, Magic Item, armour protection or spellcasting immunity is invented. Add an explicit armour profile and record whether it is mundane or Chaos Armour in GM notes.',*(['Instinctive Diction 2 remains unavailable by user choice.'] if lord and args.diction=='unavailable' else [])],**({'adaptation':'Legacy: Instinctive Diction 2 becomes one nonrepeatable core rank.'} if lord and args.diction=='one' else {})))

write(ROOT/f'dist/gm/sources/{BOOK}.json',{'schemaVersion':1,'id':BOOK,'source':{'file':PDF.name,'sha256':SHA},'summary':'Chaos Warrior profiles and advancement templates','profiles':profiles,'templates':templates,'training':[]})
write(PACK/'manifest.json',{'schemaVersion':1,'id':BOOK,'title':'The Warband of Bayl of Many Eyes','shortTitle':'Bayl’s Warband','edition':4,'version':'1.0.0','kind':'supplement','dependsOn':['core'],'source':{'file':PDF.name,'sha256':SHA},'compatibility':{'reviewed':True,'notes':['Core Fifth Edition Traits, Talents, shared equipment and explicit GM template choices govern. Named characters and adventure content are excluded.','Mark of Nurgle reuses core Mark of Chaos (Nurgle), without applying its Toughness benefit twice.','Reviewed optional mount choices and bounded spell lists are separate from PC creation and campaign play.']},'files':{'coverage':'coverage.json','referenceEntries':'reference-entries.json'}})
write(PACK/'reference-entries.json',refs)
write(PACK/'coverage.json',{'schemaVersion':1,'records':[],'features':[{'id':identity('feature',slug),'name':name,'status':status,'source':source(page),'reason':reason} for slug,name,status,page,reason in [('gm','Chaos Warrior profiles and templates','adapted',8,'Reviewed generic profiles/templates use shared Fifth Edition definitions and explicit alternatives.'),('references','Chaos Warrior template and Sorcerer rules','reference-only',3,'Three mechanical references; no new live casting or XP development.'),('mark','Mark of Nurgle','implemented',10,'Already defined by core Mark of Chaos (Nurgle); reuse without duplicating effects.'),('named','Named characters and adventures','deferred',12,'Bayl, Dónalegur, Ryðklumpur and Tannpína, unique mutations, warband management and adventure scenes excluded.')]]})
index=ROOT/'dist/data/books/index.json'; registry=json.loads(index.read_text(encoding='utf-8'))
if not any(x['id']==BOOK for x in registry['packs']): registry['packs'].append({'id':BOOK,'path':f'{BOOK}/manifest.json'})
write(index,registry)
audit=ROOT/'scripts/search-reference-review.json'; review=json.loads(audit.read_text(encoding='utf-8'))
review['books'][BOOK]={'sourceHash':SHA,'publishedSHA256':hashlib.sha256((PACK/'reference-entries.json').read_bytes()).hexdigest(),'entries':len(refs),'areas':[{'first':3,'last':19,'topic':'Reviewed template procedures and Sorcerer rules; stat blocks/named NPCs excluded from search'}],'records':[*[{'id':r['id'],'name':r['name'],'page':r['page'],'disposition':'included'} for r in refs],*[{'id':x['id'],'name':x['name'],'page':x['page'],'disposition':'included','reason':'GM creator only; excluded from global search.'} for x in profiles+templates],{'id':identity('excluded','mark'),'name':'Mark of Nurgle','page':10,'disposition':'existing','reason':'Core Mark of Chaos (Nurgle), p. 359, already provides this rule.'},{'id':identity('excluded','named'),'name':'Bayl, Dónalegur, Ryðklumpur, Tannpína and their unique mutations','page':'12–15','disposition':'excluded','reason':'Named characters excluded by user scope.'},{'id':identity('excluded','prose'),'name':'Incunabulum, warband disposition and adventure encounters','page':'4–18','disposition':'excluded','reason':'Setting, campaign and adventure content, not standalone creator mechanics.'},{'id':identity('excluded','summary'),'name':'Talent and Trait summary','page':19,'disposition':'existing','reason':'Use current Fifth Edition definitions instead of duplicated older rules.'}]}
write(audit,review)
