"""Extract reviewed Dwarf Guide creator data. Default output stays outside the app."""
from pathlib import Path
import argparse, collections, hashlib, json, re
import pdfplumber
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=Path(r"C:\Users\ninod\Downloads\Dwarf Player's Guide.pdf"))
parser.add_argument('--output-dir', type=Path, default=ROOT.parent/'tmp/pdfs/dwarf-guide-review')
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
pdf = pdfplumber.open(args.source)
reader = PdfReader(args.source)
KEYS = ['WS','BS','S','T','I','Ag','Dex','Int','WP','Fel']
CAREERS = {62:('Brewer','Burgher',['Dwarf']),64:('Doom Priest','Warrior',['Dwarf']),66:('Forge Priest','Academic',['Dwarf']),67:('Hearth Priest','Academic',['Dwarf']),68:('Hammerer','Warrior',['Dwarf']),70:('Ironbreaker','Warrior',['Dwarf']),72:('Karak Ranger','Ranger',['Dwarf']),74:('Runescribe','Academic',['Dwarf']),76:('Runesmith','Academic',['Dwarf']),78:('Thane','Courtier',['Dwarf'])}

def norm(s):
    return re.sub(r'\s+',' ',re.sub(r'([-\/])\s+',r'\1',s.replace('\u00ad','').replace('ﬂ','fl').replace('ﬁ','fi'))).strip()
def split_list(s):
    out, start, depth = [], 0, 0
    for i,c in enumerate(s):
        depth += (c=='(')-(c==')')
        if c==',' and depth==0:
            out.append(norm(s[start:i])); start=i+1
    return [x for x in out+[norm(s[start:])] if x]
def write(name,value):
    (args.output_dir/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

careers=[]
for n,(name,cls,species) in CAREERS.items():
    page=pdf.pages[n-1]; words=page.extract_words()
    ws=next(w for w in words if w['text']=='WS'); y=ws['top']
    columns=[w for w in words if abs(w['top']-y)<2 and w['text'] in KEYS+['Agi']]
    centers={('Ag' if w['text']=='Agi' else w['text']):(w['x0']+w['x1'])/2 for w in columns}
    assert len(centers)==10,(n,centers)
    column=lambda x:min(centers,key=lambda k:abs(centers[k]-x))
    advance={k:None for k in KEYS}
    for c in page.chars:
        if c['text']=='h' and 'crossbatstfb' in c['fontname'] and y+8<c['top']<y+25:
            advance[column((c['x0']+c['x1'])/2)]=1
    for c in page.rects+page.curves:
        color=c.get('non_stroking_color')
        if y+8<c['top']<y+21 and 15<c['x1']-c['x0']<35 and isinstance(color,(tuple,list)) and len(color)==3:
            level=4 if color[0]>.9 and color[2]<.3 else 3 if abs(color[0]-color[1])<.05 and .7<color[0]<.85 else 2 if color[0]>color[1]>color[2] and color[0]>.6 else None
            if level:advance[column((c['x0']+c['x1'])/2)]=level
    assert sorted(x for x in advance.values() if x)==[1,1,1,2,3,4],(n,advance)
    x0,x1=min(centers.values())-17,max(centers.values())+22
    col=page.crop((x0,y+25,x1,page.height-30)).filter(lambda o:o.get('object_type')!='char' or 9.8<o.get('size',0)<10.2)
    ct=col.extract_text(x_tolerance=2,y_tolerance=3)
    heads=list(re.finditer(r'(?m)^\s*(?:[h]\s+)?(.+?)\s*(?:[—–-]\s*)?(Brass|Silver|Gold)\s+(\d)\s*$',ct))
    levels=[]
    for i,h in enumerate(heads):
        chunk=ct[h.end():heads[i+1].start() if i+1<len(heads) else len(ct)]
        m=re.search(r'Skills:\s*(.*?)\s*Talents:\s*(.*?)\s*Trappings:\s*(.*)',chunk,re.S)
        assert m,(n,i,chunk)
        levels.append({'level':i+1,'name':norm(h[1]).lstrip('h ').rstrip(' –—-'),'status':h[2],'standing':int(h[3]),'skills':split_list(m[1]),'talents':split_list(m[2]),'trappings':split_list(m[3])})
    assert len(levels)==4 and len(levels[0]['skills'])==10,(n,levels,ct)
    careers.append({'id':'dwarf-guide:career:'+re.sub(r'[^a-z0-9]+','-',name.lower()),'name':name,'class':cls,'species':species,'page':n,'advanceScheme':advance,'levels':levels})
write('careers.raw.json',careers)


print('Staged',len(careers),'careers')

def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def canonical(s):
    s=norm(s).replace('*','').replace('Resistance (','Resistant (').replace('Strider (','Striding Gait (').replace('Tunnel Rat','Tunnel Fighter').replace('Warleader','War Leader').replace('Any One','Any')
    s=re.sub(r'\bSet Trap\b','Set Traps',s).replace('Consume,','Consume Alcohol,');s='Consume Alcohol' if s=='Consume' else s
    s=s.replace('Set Traps','Set Trap')
    return s.replace('Melee (Flail)','Melee (Flail)').replace('Protective Runes','Protection Runes')

for c in careers:
    for l in c['levels']:
        for key in ['skills','talents']: l[key]=[canonical(x) for x in l[key]]
    c['conversion']='Fifth Edition creation allocations and XP; core Talent equivalents replace older names. New Dwarf Talents use approved printed limits with adaptation warnings.'
    if c['name']=='Karak Ranger':c['alternativeFor']='archives-i:career:karak-ranger'
write('careers.json',careers)

origins=[]
for n in range(48,51):
    # Printed order is left column, then right, matching the PDF text stream.
    text=reader.pages[n-1].extract_text()
    blocks=list(re.finditer(r'Skills:\s*(.*?)\s*Talents:\s*([^\n]*(?:\n(?!dWarf|LONGBEARDS)[^\n]*)*)',text,re.S)) if False else []
    for m in re.finditer(r'Skills:\s*(.*?)\s*Talents:\s*(.*?)(?=\n[dD][wW][aA][rR][fF][sS]|\nLONGBEARDS|\Z)',text,re.S):
        skills=split_list(m[1]);ts=split_list(m[2])
        origins.append({'skills':[canonical(x) for x in skills],'talents':[[canonical(v) for v in x.split(' or ')] for x in ts],'page':n})
origins=origins[:3]+origins[6:9]+origins[3:6]+origins[9:]
origin_names=['Karaz-a-Karak','Barak Varr','Karak Azul','Karak Eight Peaks','Karak Kadrin','Zhufbar','Karak Hirn / Black Mountains','Karak Izor / Vaults','Karak Norn / Grey Mountains','Norse','Imperial']
assert len(origins)==11,len(origins)
for o,name in zip(origins,origin_names):
    assert len(o['skills'])==12 and len(o['talents'])==5,(name,o)
    o.update(id='dwarf-guide:origin:'+slug(name),name=name,species='Dwarf',languages=['Khazalid','Reikspiel'],randomTalents=0,conversion='User-approved Fifth Edition adaptation: five different Species Skills at +5; five printed Talent slots; native Khazalid and Reikspiel. Core physical attributes remain unchanged.')
write('origins.json',origins)

tables=[{'id':'dwarf-guide:table:'+slug(name),'name':name+' Dwarf Careers','kind':'career','species':'Dwarf','origin':o['id'],'page':'51–52','sides':100,'rows':[]} for o,name in zip(origins,origin_names)]
core=json.loads((ROOT/'dist/data/careers.json').read_text(encoding='utf-8'))
lookup={c['name']:c['id'] for c in core+careers};lookup.update(Advisor=lookup['Adviser'],Huffer=lookup['Pilot'],Seaman=lookup['Sailor'])
for n in [51,52]:
    page=pdf.pages[n-1];ws=page.extract_words()
    # One row has all eleven initial 01 cells; use their centres as column anchors.
    if n==51:centers=[(w['x0']+w['x1'])/2 for w in ws if w['text']=='01' and 138<w['top']<143]
    # Even page is shifted 17 points left, retaining the printed column widths.
    cs=[v+(3 if n==52 else 0) for v in centers]
    bounds=[(a+b)/2 for a,b in zip(cs,cs[1:])]
    cells=collections.defaultdict(list)
    for w in ws:
        if 125<w['top']<(730 if n==51 else 697) and w['x0']>cs[0]-15 and re.fullmatch(r'\d+(?:-\d*)?',w['text']):
            idx=sum((w['x0']+w['x1'])/2>b for b in bounds);cells[round(w['top'],1)].append((idx,w))
    for y,row in sorted(cells.items()):
        if y<138:continue
        if len(row)<10:continue
        labels=[w for w in ws if abs(w['top']-y)<4 and w['x0']<cs[0]-15 and w['x0']>78-(17 if n==52 else 0)]
        label=norm(' '.join(w['text'] for w in sorted(labels,key=lambda w:w['x0'])))
        label=re.sub(r'\d(?:,\s*\d)*$','',label).strip()
        label=next((k for k in sorted(lookup,key=len,reverse=True) if label==k or label.endswith(' '+k)),label)
        assert label in lookup,(n,y,label)
        for idx,w in row:
            value=w['text'];r=re.match(r'(\d+)(?:-(\d*))?',value);lo=int(r[1]);hi=int(r[2]) if r[2] else (100 if value.endswith('-') else lo)
            tables[idx]['rows'].append({'min':lo,'max':hi,'result':lookup[label]})
# Soldier's final cells wrap across different baselines. Read each column separately.
page=pdf.pages[51]
for idx in range(11):
    left=cs[0]-15 if idx==0 else bounds[idx-1];right=cs[-1]+20 if idx==10 else bounds[idx]
    value=norm(page.crop((left,571,right,600)).extract_text()).replace(' ','')
    r=re.search(r'(\d+)-(\d+)',value);assert r,(idx,value)
    tables[idx]['rows'].append({'min':int(r[1]),'max':100,'result':lookup['Soldier']})
for table in tables:
    for face in range(1,101):assert sum(r['min']<=face<=r['max'] for r in table['rows'])==1,(table['name'],face,table['rows'])
write('tables.json',tables)

def column_heads(n,left,right):
    page=pdf.pages[n-1];ws=page.crop((left,45,right,740)).extract_words(extra_attrs=['fontname','size']);groups=collections.defaultdict(list)
    for w in ws:
        if 'ACaslonPro-Bold' in w['fontname'] and 11.8<w['size']<12.2:groups[round(w['top'],1)].append(w)
    return page,ws,[(y,norm(' '.join(w['text'] for w in sorted(words,key=lambda w:w['x0'])))) for y,words in sorted(groups.items())]

talents=[]
for n in range(80,84):
    for left in ([75,319] if n%2==0 else [58,302]):
        page,ws,heads=column_heads(n,left-.5,left+235)
        for i,(y,name) in enumerate(heads):
            end=heads[i+1][0]-1 if i+1<len(heads) else 740
            raw=page.crop((left-.5,y+12,left+235,end)).extract_text() or ''
            if not raw.startswith('Max:'):continue
            limit=norm(re.search(r'Max:\s*([^\n]+)',raw)[1]);body=re.sub(r'^Max:[^\n]+\n(?:Tests:[^\n]+\n)?','',raw)
            talents.append({'id':'dwarf-guide:talent:'+slug(name),'name':name,'page':n,'text':norm(body),'limitPrinted':limit})
for n,left,target in [(81,58,'Ancestral Grudge'),(81,302,'Dragon Belcher')]:
    page,ws,heads=column_heads(n,left-.5,left+235)
    extra=norm(page.crop((left-.5,50,left+235,heads[0][0]-1)).extract_text())
    next(t for t in talents if t['name']==target)['text']+=' '+extra
write('talents.raw.json',talents)

runes=[];form='Weapon'
for n in range(127,133):
    for left in ([75,319] if n%2==0 else [58,302]):
        page,ws,heads=column_heads(n,left-.5,left+235)
        # Section starts are fixed in the supplied layout, independently checked against the PDF.
        transitions={128:('Armour',480),129:('Talisman',170),130:('Protection',250),131:('Engineering',0),132:('Doom',500)}
        for i,(y,name) in enumerate(heads):
            if n==132 and left>100:form='Doom'
            if n in transitions and ((n in [128,129,130,132] and left<100 and y>transitions[n][1]) or n==131 and left>100):form=transitions[n][0]
            if not ('Rune' in name) or name=='ADDITIONAL RUNES':continue
            end=heads[i+1][0]-1 if i+1<len(heads) else 740
            # Stop at the next section heading or non-rune sidebar.
            sections=[w['top']-5 for w in ws if ('Bold-SC700' in w['fontname'] and w['size']>17 or w['text']=='ADDITIONAL' and w['size']>14) and y+14<w['top']<end]
            if sections:end=min(sections)
            raw=page.crop((left-.5,y+12,left+235,end)).extract_text() or ''
            m=re.search(r'^SLs Required:\s*(\d+)\s*\n',raw)
            if form!='Doom' and not m:continue
            runes.append({'id':'dwarf-guide:rune:'+slug(form+'-'+name),'name':name,'page':n,'form':form,'master':name.startswith('Master Rune'),'text':norm(raw[m.end():] if m else raw),**({'sl':int(m[1])} if m else {})})
write('runes.raw.json',runes)
write('source.json',{'file':args.source.name,'sha256':hashlib.sha256(args.source.read_bytes()).hexdigest(),'pages':len(reader.pages)})
print('Staged origins/tables/talents/runes',len(origins),len(tables),len(talents),len(runes))
