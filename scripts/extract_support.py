from pathlib import Path
import json,re,collections,pdfplumber
from pypdf import PdfReader
root=Path('character-generator'); dest=root/'dist/data'; reader=PdfReader(r'C:\Users\ninod\Downloads\Warhammer Fantasy Roleplay (2).pdf'); pdf=pdfplumber.open(r'C:\Users\ninod\Downloads\Warhammer Fantasy Roleplay (2).pdf')
def clean(s):return re.sub(r'\s+',' ',s.replace('�',"'").replace('ﬂ','fl').replace('ﬁ','fi').replace('\u00ad','')).strip()
def write(n,v):(dest/n).write_text(json.dumps(v,ensure_ascii=False,indent=2),encoding='utf-8')
species={}
def add(n,p,o,l,f,fo,m,age,height,skills,talents,random):
 species[n]=dict(page=p,offsets=dict(zip(['WS','BS','S','T','I','Ag','Dex','Int','WP','Fel'],o)),languages=l,fate=f,fortune=fo,movement=m,age=age,height=height,skills=skills.split('|'),talents=talents,randomTalents=random)
add('Human',27,[20]*10,['Reikspiel'],4,3,4,[14,2],[57,2],'Animal Care|Charm|Cool|Evaluate|Gossip|Haggle|Language (Bretonnian)|Language (Wastelander)|Leadership|Lore (Reikland)|Melee (Basic)|Ranged (Bow)',[['Doomed']],4)
add('Dwarf',29,[30,20,20,30,10,10,30,20,40,10],['Khazalid','Reikspiel'],2,2,3,[15,10],[51,1],'Consume Alcohol|Cool|Endurance|Entertain (Storytelling)|Evaluate|Intimidate|Lore (Dwarfs)|Lore (Geology)|Lore (Metallurgy)|Melee (Basic)|Trade (Any One)',[['Magic Resistance'],['Night Vision'],['Read/Write','Relentless'],['Resolute','Strong-minded'],['Sturdy']],0)
add('Halfling',31,[10,30,10,10,40,20,30,20,30,30],['Haffennaff','Reikspiel'],2,3,3,[15,5],[37,1],'Charm|Consume Alcohol|Dodge|Gamble|Haggle|Intuition|Lore (Reikland)|Perception|Sleight of Hand|Stealth (Any One)|Trade (Cook)',[['Acute Sense (Taste)'],['Night Vision'],['Resistant (Chaos)']],2)
add('High Elf',33,[30,30,20,20,40,30,30,30,30,20],['Elthárin','Reikspiel'],1,2,5,[30,10],[71,1],'Cool|Entertain (Singing)|Evaluate|Leadership|Melee (Basic)|Navigation|Perception|Play (Any One)|Ranged (Bow)|Sail|Swim',[['Acute Sense (Sight)'],['Coolheaded','Savvy'],['Night Vision'],['Second Sight','Sixth Sense'],['Read/Write']],0)
add('Wood Elf',35,[30,30,20,20,40,30,30,30,30,20],['Elthárin','Reikspiel'],1,2,5,[30,10],[71,1],'Athletics|Climb|Endurance|Entertain (Singing)|Intimidate|Melee (Basic)|Outdoor Survival|Perception|Ranged (Bow)|Stealth (Rural)|Track',[['Acute Sense (Sight)'],['Hardy','Second Sight'],['Night Vision'],['Read/Write','Very Resilient'],['Rover']],0)
write('species.json',species)
# Skill headers and specialisations from pp.111-114; combine named career specialisations.
skills=[]
for n in range(111,115):
 t=reader.pages[n-1].extract_text(); heads=list(re.finditer(r'(?m)^([A-Z][A-Za-z ]+) \((WS|BS|S|T|I|Ag|Dex|Int|WP|Fel)\) (basic|advanced)(, grouped)?',t))
 for i,h in enumerate(heads):
  chunk=t[h.end():heads[i+1].start() if i+1<len(heads) else len(t)]
  sp=re.search(r'Specialisations(?: Include)?: (.*?)\.',chunk,re.S)
  opts=re.split(r',\s*',clean(sp[1])) if sp else []
  skills.append(dict(name=h[1],char=h[2],advanced=h[3]=='advanced',grouped=bool(h[4]),options=opts,page=n))
careers=json.loads((dest/'careers.json').read_text(encoding='utf-8'))
extra={'Language':['Battle','Bretonnian','Classical','Elthárin','Guilder','Haffennaff','Khazalid','Magick','Reikspiel','Thieves Tongue','Wastelander'],'Lore':['Reikland','Dwarfs'],'Trade':['Cook'],'Channelling':['Aqshy','Azyr','Chamon','Dhar','Ghur','Ghyran','Hysh','Magick','Shyish','Ulgu']}
for s in skills:
 opts=s['options']+extra.get(s['name'],[])
 for c in careers:
  for l in c['levels']:
   for raw in l['skills']:
    for match in re.finditer(re.escape(s['name'])+r' \(([^)]+)\)',raw):opts.extend(re.split(r',\s*(?:or )?| or ',match[1]))
 s['options']=sorted({x.replace('Local*','Local').strip() for x in opts if x and not any(y in x for y in ['Any','All','many more','Guild ('])})
 # Uniform case in printed labels.
 s['options']=[x for x in s['options'] if x not in ['and many more']]
write('skills.json',skills)
# Spell headings and section headings in column reading order.
spells=[]; category='Blessing'
for n in [221]+list(range(222,230))+list(range(240,261)):
 page=pdf.pages[n-1]; starts=[58,221,384] if n==221 else [75,319] if n%2==0 else [58,302]; width=156 if n==221 else 235
 if n==240:category='Petty'
 # Petty spells continue into page 242.
 for left in starts:
  col=page.crop((left-.5,45,left+width,740)); words=col.extract_words(extra_attrs=['fontname','size']); lines=collections.defaultdict(list)
  for w in words:
   if w['size']>10.8:
    group=next((y for y in lines if abs(y-w['top'])<6),w['top']);lines[group].append(w)
  events=[]
  for y,ws in sorted(lines.items()):
   label=clean(' '.join(w['text'] for w in sorted(ws,key=lambda w:w['x0'])))
   if any('ACaslonPro-Bold' in w['fontname'] and 11.7<w['size']<12.3 for w in ws):events.append((min(w['top'] for w in ws),label,'spell'))
   elif 'arcane' in label.lower().replace(' ','') and 'spells' in label.lower().replace(' ',''):events.append((y,'Arcane','category'))
   elif 'lore' in label.lower().replace(' ','') or 'miraclesof' in label.lower().replace(' ',''):
    raw=label.replace(' ','').lower();known=['Manann','Morr','Myrmidia','Ranald','Rhya','Shallya','Sigmar','Taal','Ulric','Verena','Beasts','Death','Fire','Heavens','Life','Light','Metal','Shadows','Hedgecraft','Witchcraft','Daemonology','Necromancy','Nurgle','Slaanesh','Tzeentch']
    found=next((k for k in known if raw.endswith(k.lower())),None)
    if found:events.append((min(w['top'] for w in ws),found,'category'))
  for i,(y,name,kind) in enumerate(events):
   if kind=='category': category=name;continue
   end=events[i+1][0]-1 if i+1<len(events) else 740
   txt=clean(page.crop((left-.5,y+13,left+width,end)).extract_text() or '')
   if not txt.startswith(('CN:', 'Range:')):continue
   rec=dict(name=name,page=n,category=category,text=txt)
   for key in ['CN','Range','Target','Duration']:
    m=re.search(key+r':\s*(.*?)(?=\s+(?:CN|Range|Target|Duration):|$)',txt)
    if m:rec[key.lower()]=m[1]
   # Duration ends at linebreak in source, not at end of description.
   raw=page.crop((left-.5,y+13,left+width,end)).extract_text() or ''
   for key in ['CN','Range','Target','Duration']:
    m=re.search(r'\b'+key+r':\s*([^\n]*?)(?=\s+(?:CN|Range|Target|Duration):|\n|$)',raw)
    if m:rec[key.lower()]=clean(m[1])
   spells.append(rec)
write('spells.json',spells)
# Clean font replacement punctuation, retaining the extracted descriptions.
talents=json.loads((dest/'talents.json').read_text(encoding='utf-8'))
for t in talents:t['text']=clean(t['text'])
write('talents.json',talents)
print('Skills',len(skills));print('Spells',len(spells),dict(collections.Counter(x['category'] for x in spells)));print('Incomplete descriptions:',[(x['name'],x['text'][-80:]) for x in spells if x['text'][-1] not in '.!?'])

# Preserve corrections to tables and cross-page descriptions after extraction.
import runpy
runpy.run_path(str(Path(__file__).resolve().with_name("apply-book-corrections.py")))
