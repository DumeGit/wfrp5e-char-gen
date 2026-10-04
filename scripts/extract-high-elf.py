"""Stage the supplied High Elf guide for review; never register or publish it.

Use MarkItDown for reading, and PDF coordinates for tables and career symbols.
Keep all five printed Mage levels in staging, pending creator-scope decisions.
"""
from pathlib import Path
import argparse, collections, json, re
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=Path(r"C:\Users\ninod\Downloads\High Elf Player's Guide.pdf"))
parser.add_argument('--output-dir', type=Path, default=ROOT.parent/'tmp/pdfs/high-elf-review')
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
pdf = pdfplumber.open(args.source)
KEYS = ['WS','BS','S','T','I','Ag','Dex','Int','WP','Fel']
CAREERS = {64:('Sea Guard','Warrior'),66:('Swordmaster','Warrior'),70:('Shadow Warrior','Warrior'),72:('Merchant Adventurer','Burgher'),74:('Aestheticist','Courtier'),90:('Mage','Academic')}

def norm(s):
    return re.sub(r'\s+',' ',re.sub(r'([-\/])\s+',r'\1',s.replace('\u00ad','').replace('ﬂ','fl').replace('ﬁ','fi'))).strip()

def split_list(s):
    out, start, depth = [], 0, 0
    for i,c in enumerate(s):
        depth += (c=='(')-(c==')')
        if c==',' and depth==0:
            out.append(norm(s[start:i]));start=i+1
    return [x for x in out+[norm(s[start:])] if x]

def write(name,value):
    (args.output_dir/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

careers=[]
for n,(name,cls) in CAREERS.items():
    page=pdf.pages[n-1];words=page.extract_words()
    y=next(w['top'] for w in words if w['text']=='WS')
    centers={w['text']:(w['x0']+w['x1'])/2 for w in words if abs(w['top']-y)<2 and w['text'] in KEYS}
    assert len(centers)==10,(n,centers)
    column=lambda x:min(centers,key=lambda k:abs(centers[k]-x))
    scheme={k:None for k in KEYS}
    for c in page.curves:
        if y+8<c['top']<y+25 and c.get('non_stroking_color')==(0.,0.,0.):
            scheme[column((c['x0']+c['x1'])/2)]=1
    for c in page.rects:
        color=c.get('non_stroking_color')
        if not (y+8<c['top']<y+20 and isinstance(color,(tuple,list)) and len(color)==3):continue
        level=4 if color[0]>.9 and color[2]<.3 else 3 if abs(color[0]-color[1])<.05 and .7<color[0]<.85 else 2 if color[2]>.9 and color[0]<.1 else 5 if color[1]>.6 and color[0]<.4 and color[2]<.4 else None
        if level:scheme[column((c['x0']+c['x1'])/2)]=level
    assert sorted(x for x in scheme.values() if x)==([1,1,1,2,3,4,5] if n==90 else [1,1,1,2,3,4]),(n,scheme)
    x0,x1=min(centers.values())-17,max(centers.values())+22
    col=page.crop((x0,y+25,x1,page.height-25)).filter(lambda o:o.get('object_type')!='char' or 8.8<o.get('size',0)<9.2 and 'HighElf' not in o.get('fontname',''))
    text=col.extract_text(x_tolerance=2,y_tolerance=3)
    heads=list(re.finditer(r'(?m)^\s*(.+?)\s*(?:[—–-]\s*)?(Brass|Silver|Gold)\s+(\d)\s*$',text))
    levels=[]
    for i,h in enumerate(heads):
        chunk=text[h.end():heads[i+1].start() if i+1<len(heads) else len(text)]
        m=re.search(r'Skills:\s*(.*?)\s*Talents:\s*(.*?)\s*Trappings:\s*(.*)',chunk,re.S)
        assert m,(n,chunk)
        levels.append({'level':i+1,'name':norm(h[1]).rstrip(' –—-'),'status':h[2],'standing':int(h[3]),'skills':split_list(m[1]),'talents':split_list(m[2]),'trappings':split_list(m[3])})
    assert len(levels)==(5 if n==90 else 4),(n,text)
    careers.append({'name':name,'class':cls,'species':['High Elf'],'page':n,'advanceScheme':scheme,'levels':levels})
write('careers.raw.json',careers)

# Column crops avoid interleaving two different spell descriptions.
spells=[]
for n in [80,81,82,86,87,88,89,102,103,106,107,110,111]:
    page=pdf.pages[n-1]
    for left in ([75,319] if n%2==0 else [58,302]):
        col=page.crop((left-.5,45,left+235,740))
        lines=collections.defaultdict(list)
        for w in col.extract_words(extra_attrs=['fontname','size']):
            if 'ACaslonPro-Bold' in w['fontname'] and (11.7<w['size']<12.3 or n==110 and left==319 and 135<w['top']<140):
                group=next((y for y in lines if abs(y-w['top'])<6),w['top']);lines[group].append(w)
        heads=[(y,norm(' '.join(w['text'] for w in sorted(ws,key=lambda w:w['x0'])))) for y,ws in sorted(lines.items())]
        if n in [103,106,107,110] and left==([319] if n%2==0 else [302])[0]:
            continuation=norm(page.crop((left-.5,60,left+235,heads[0][0]-1)).extract_text() or '')
            assert spells[-1]['name'] in ['Wisdom of the Skysteel','Spirits of the Waves','Mistress of the Deep','Greater Spirit Bond'],(n,spells[-1]['name'])
            spells[-1]['text']+=' '+continuation
        for i,(y,name) in enumerate(heads):
            end=heads[i+1][0]-1 if i+1<len(heads) else 740
            raw=page.crop((left-.5,y+13,left+235,end)).extract_text() or ''
            if not raw.startswith('CN:'):continue
            vals={k:norm(re.search(r'\b'+k+r':\s*([^\n]*)',raw)[1]) for k in ['CN','Range','Target','Duration']}
            category='Petty' if (n==80 or n==81 and vals['CN']=='0') else 'Elven Arcane' if n in [81,82] else 'High Magic'
            body=raw[re.search(r'Duration:[^\n]*\n',raw).end():]
            spells.append({'name':name,'page':n,'category':category,'cn':int(vals['CN']),'range':vals['Range'],'target':vals['Target'],'duration':vals['Duration'],'text':norm(body)})
write('spells.raw.json',spells)

# Preserve all five columns and their printed overlaps in raw staging.
page=pdf.pages[58];words=page.extract_words()
ranges=[w for w in words if w['top']>98 and re.fullmatch(r'\d{2,3}(?:-\d{2,3})?|–',w['text']) and 210<w['x0']<530]
tables={name:[] for name in ['Outer Kingdoms','Nagarythe','Inner Kingdoms','Avelorn','Sea Elf']}
for y in sorted({round(w['top'],1) for w in ranges}):
    row=[w for w in ranges if abs(w['top']-y)<.2]
    assert len(row)==5,(y,row)
    name=norm(' '.join(w['text'] for w in words if 115<w['x0']<210 and abs(w['top']-y)<.2)).rstrip('*')
    assert name,(y,row)
    for (label,rows),w in zip(tables.items(),sorted(row,key=lambda w:w['x0'])):
        if w['text']=='–':continue
        vals=[int(x) or 100 for x in w['text'].split('-')]
        rows.append({'min':vals[0],'max':vals[-1],'result':name})
write('tables.raw.json',tables)

origins=[]
for n,names in [(54,['Caledor','Ellyrion','Avelorn','Saphery','Eataine']),(55,['Tiranoc','The Shadowlands','Chrace','Cothique','Yvresse'])]:
    page=pdf.pages[n-1]
    text='\n'.join(page.crop((left-.5,60,left+235,735)).extract_text() for left in ([75,319] if n%2==0 else [58,302]))
    heads=[re.search(r'(?m)^'+re.escape(name)+r'\s*$',text) for name in names]
    assert all(heads),(n,text)
    for i,(name,h) in enumerate(zip(names,heads)):
        chunk=text[h.end():heads[i+1].start() if i+1<len(heads) else len(text)]
        m=re.search(r'Skills:\s*(.*?)\s*Talents:\s*(.*)',chunk,re.S)
        assert m,(n,name,chunk)
        origins.append({'name':name,'page':n,'skills':split_list(m[1]),'talents':[re.split(r'\s+or\s+',t) for t in split_list(m[2].strip(' ,'))]})
page=pdf.pages[56]
text='\n'.join(page.crop((left-.5,60,left+235,735)).extract_text() for left in [58,302])
m=re.search(r'Skills:\s*(.*?)\s*Talents:\s*(.*?)\s*NEW talENt',text,re.S)
assert m,text
origins.append({'name':'Sea Elf','page':57,'skills':split_list(m[1]),'talents':[re.split(r'\s+or\s+',t) for t in split_list(m[2])]})
write('origins.raw.json',origins)
print(json.dumps({'careers':len(careers),'spells':len(spells),'staged':str(args.output_dir),'registered':False}))
