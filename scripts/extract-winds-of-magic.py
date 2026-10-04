"""Stage supplied Winds of Magic creator material; never enable or publish a book."""
from pathlib import Path
import argparse, collections, hashlib, json, re
import pdfplumber
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=Path(r'C:\Users\ninod\Downloads\Winds of Magic.pdf'))
parser.add_argument('--output-dir', type=Path, default=ROOT.parent/'tmp/pdfs/winds-of-magic-review')
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
pdf = pdfplumber.open(args.source)
reader = PdfReader(args.source)
KEYS = ['WS','BS','S','T','I','Ag','Dex','Int','WP','Fel']
CAREERS = {36:('Beadle','Warrior',['Dwarf','Halfling','Human']),38:('Mundane Alchemist','Academic',['Dwarf','Halfling','Human']),40:('Magister Vigilant','Academic',['Human']),42:('Scryer','Peasant',['Human']),56:('Hierophant','Academic',['Human']),68:('Alchemist','Academic',['Human']),80:('Druid','Academic',['Human']),92:('Astromancer','Academic',['Human']),104:('Shadowmancer','Academic',['Human']),116:('Spiriter','Academic',['Human']),128:('Pyromancer','Academic',['Human']),140:('Shaman','Academic',['Human'])}
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
    col=page.crop((x0,y+25,x1,page.height-30)).filter(lambda o:o.get('object_type')!='char' or 8.8<o.get('size',0)<9.2)
    ct=col.extract_text(x_tolerance=2,y_tolerance=3)
    heads=list(re.finditer(r'(?m)^\s*(?:[h]\s+)?(.+?)\s*(?:[—–-]\s*)?(Brass|Silver|Gold)\s+(\d)\s*$',ct))
    levels=[]
    for i,h in enumerate(heads):
        chunk=ct[h.end():heads[i+1].start() if i+1<len(heads) else len(ct)]
        m=re.search(r'Skills:\s*(.*?)\s*Talents:\s*(.*?)\s*Trappings:\s*(.*)',chunk,re.S)
        assert m,(n,i,chunk)
        levels.append({'level':i+1,'name':norm(h[1]).lstrip('h ').rstrip(' –—-'),'status':h[2],'standing':int(h[3]),'skills':split_list(m[1]),'talents':split_list(m[2]),'trappings':split_list(m[3])})
    assert len(levels)==4 and len(levels[0]['skills'])==10,(n,levels,ct)
    careers.append({'id':'winds-of-magic:career:'+re.sub(r'[^a-z0-9]+','-',name.lower()),'name':name,'class':cls,'species':species,'page':n,'advanceScheme':advance,'levels':levels})
write('careers.raw.json',careers)

groups={26:'Arcane',27:'Arcane'}
for start,lore in [(62,'Light'),(74,'Metal'),(86,'Life'),(98,'Heavens'),(110,'Shadows'),(122,'Death'),(134,'Fire'),(146,'Beasts')]:
    for n in range(start,start+4):groups[n]=lore
spells=[]
for n,lore in groups.items():
    page=pdf.pages[n-1]
    for left in ([75,319] if n%2==0 else [58,302]):
        col=page.crop((left-.5,45,left+235,740))
        lines=collections.defaultdict(list)
        for w in col.extract_words(extra_attrs=['fontname','size']):
            if 'ACaslonPro-Bold' in w['fontname'] and 11.7<w['size']<12.3:
                group=next((y for y in lines if abs(y-w['top'])<6),w['top']);lines[group].append(w)
        heads=[(y,norm(' '.join(w['text'] for w in sorted(ws,key=lambda w:w['x0'])))) for y,ws in sorted(lines.items())]
        for i,(y,name) in enumerate(heads):
            end=heads[i+1][0]-1 if i+1<len(heads) else 740
            raw=page.crop((left-.5,y+13,left+235,end)).extract_text() or ''
            if not raw.startswith('CN:'):continue
            vals={k:norm(re.search(r'\b'+k+r':\s*([^\n]*)',raw)[1]) for k in ['CN','Range','Target','Duration']}
            body=raw[re.search(r'Duration:[^\n]*\n',raw).end():]
            spells.append({'name':name,'page':n,'category':lore,'cn':int(vals['CN']),'range':vals['Range'],'target':vals['Target'],'duration':vals['Duration'],'text':norm(body)})
write('spells.raw.json',spells)
rituals=[]
for n in range(28,34):
    page=pdf.pages[n-1]
    for left in ([75,319] if n%2==0 else [58,302]):
        col=page.crop((left-.5,45,left+235,720))
        words=col.extract_words(extra_attrs=['fontname','size'])
        starts=[w for w in words if w['text']=='CN:']
        for i,w in enumerate(starts):
            end=starts[i+1]['top']-25 if i+1<len(starts) else 720
            heading=[v for v in words if 'CaslonAntique-Bold-SC700' in v['fontname'] and w['top']-45<v['top']<w['top']]
            title=norm(' '.join(v['text'] for v in sorted(heading,key=lambda v:(round(v['top']/13),v['x0']))))
            raw=page.crop((left-.5,w['top']-1,left+235,end)).extract_text() or ''
            if 'Learning XP:' in raw:rituals.append({'name':title,'page':n,'text':raw})
write('rituals.raw.json',rituals)
write('pages.json',[{'page':i+1,'text':p.extract_text()} for i,p in enumerate(reader.pages)])
write('source.json',{'file':args.source.name,'sha256':hashlib.sha256(args.source.read_bytes()).hexdigest(),'pages':len(reader.pages)})
print(json.dumps({'careers':len(careers),'spells':len(spells),'staged':str(args.output_dir),'registered':False}))
