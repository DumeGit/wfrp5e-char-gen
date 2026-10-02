"""Extract creation reference data from the user-supplied Fifth Edition PDF only."""
from pathlib import Path
import re,json,hashlib,collections
import pdfplumber
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(r'C:\Users\ninod\Downloads\Warhammer Fantasy Roleplay (2).pdf')
DEST=ROOT/'dist/data'
pdf=pdfplumber.open(SOURCE); reader=PdfReader(SOURCE)
def norm(s):
 return re.sub(r'\s+',' ',re.sub(r'([-\/])\s+', r'\1', s.replace('\u00ad','').replace('ﬂ','fl').replace('ﬁ','fi'))).strip()
def split_list(s):
 out=[]; start=depth=0
 for i,c in enumerate(s):
  if c=='(':depth+=1
  elif c==')':depth-=1
  elif c==',' and depth==0:out.append(norm(s[start:i]));start=i+1
 out.append(norm(s[start:]));return [x for x in out if x]
def write(name,data):
 (DEST/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
careers=[]; errors=[]
for n in range(45,109):
 page=pdf.pages[n-1]; text=reader.pages[n-1].extract_text(); words=page.extract_words()
 title=re.search(r'\n([A-Z][A-Z -]+)\n([^\n]+) Class:\s*([^\n]+)',text)
 if not title: errors.append((n,'title'));continue
 name=title[1].title(); cls=title[2].strip(); species=split_list(title[3])
 ws=next(w for w in words if w['text']=='WS'); y=ws['top']
 columns=[w for w in words if abs(w['top']-y)<2 and w['text'] in ['WS','BS','S','T','I','Ag','Dex','Int','WP','Fel']]
 centers={w['text']:(w['x0']+w['x1'])/2 for w in columns}
 def column(x):return min(centers,key=lambda k:abs(centers[k]-x))
 advance={k:None for k in ['WS','BS','S','T','I','Ag','Dex','Int','WP','Fel']}
 for c in page.chars:
  if c['text']=='h' and 'crossbatstfb' in c['fontname'] and y+8<c['top']<y+24: advance[column((c['x0']+c['x1'])/2)]=1
 for c in page.rects+page.curves:
  color=c.get('non_stroking_color')
  if y+8<c['top']<y+21 and 15<c['x1']-c['x0']<35 and isinstance(color,(tuple,list)) and len(color)==3:
   lev=2 if color[1]>.5 and color[0]<.6 else 4 if color[0]>.9 and color[2]<.3 else 3 if .7<color[0]<.85 else None
   if lev:advance[column((c['x0']+c['x1'])/2)]=lev
 x0=min(centers.values())-17;x1=max(centers.values())+22
 crop=page.crop((max(0,x0),y+25,min(page.width,x1),page.height-30))
 ct=crop.extract_text(x_tolerance=2,y_tolerance=3)
 levelheads=list(re.finditer(r'(?m)^\s*(?:h\s+)?(.+?)\s+[—–-]\s+(Brass|Silver|Gold)\s+(\d)\s*$',ct))
 levels=[]
 for i,m in enumerate(levelheads):
  chunk=ct[m.end():levelheads[i+1].start() if i+1<len(levelheads) else len(ct)]
  match=re.search(r'Skills:\s*(.*?)\s*Talents:\s*(.*?)\s*Trappings:\s*(.*)',chunk,re.S)
  if not match:errors.append((n,'level block',i));continue
  gear=match[3]
  # Only 9pt body text belongs to career Skills, Talents and Trappings.
  lines=[]
  for line in gear.splitlines():
   if line.strip() in ['WARHAMMER FANTASY ROLEPLAY',str(n)]:break
   lines.append(line)
  levels.append({'level':i+1,'name':norm(m[1]),'status':m[2],'standing':int(m[3]),'skills':split_list(match[1]),'talents':split_list(match[2]),'trappings':split_list(' '.join(lines))})
 if n==47:advance['I']=1 # Initiative cross is a vector shape; visually checked on p.47.
 if len(levels)!=4 or sorted(x for x in advance.values() if x)!=[1,1,1,2,3,4]:errors.append((n,'counts',len(levels),advance))
 careers.append({'id':re.sub('[^a-z0-9]+','-',name.lower()),'name':name,'class':cls,'species':species,'page':n,'advanceScheme':advance,'levels':levels})
write('careers.json',careers)

# Random career tables, preserving the published species weights.
random_careers=[]
for n in [36,37]:
 text=reader.pages[n-1].extract_text()
 for line in text.splitlines():
  m=re.match(r'^(.+?)\s+([\d–—-]+)\s+([\d–—-]+)\s+([\d–—-]+)\s+([\d–—-]+)\s+([\d–—-]+)\s*$',line)
  if m:
   row={'career':m[1].strip(),'page':n}
   for k,v in zip(['Human','Dwarf','Halfling','High Elf','Wood Elf'],m.groups()[1:]):
    if v in ['-','–','—']: row[k]=None
    else:
     parts=re.split('[–—-]',v);row[k]=[int(parts[0]),int(parts[-1])]
   random_careers.append(row)
write('career-rolls.json',random_careers)

# Talent headings are consistently 12pt bold; parse in printed column order.
talents=[]
for n in range(114,129):
 page=pdf.pages[n-1]
 allwords=page.extract_words(extra_attrs=['fontname','size'])
 starts=[min(w['x0'] for w in allwords if 'ACaslonPro-Bold' in w['fontname'] and 11.7<w['size']<12.3 and (w['x0']<300)==left) for left in [True,False]]
 for bounds in [(x-.4,x+235) for x in starts]:
  col=page.crop((bounds[0],48,bounds[1],740))
  words=col.extract_words(extra_attrs=['fontname','size'])
  headings=collections.defaultdict(list)
  for w in words:
   if 'ACaslonPro-Bold' in w['fontname'] and 11.7<w['size']<12.3: headings[round(w['top'],1)].append(w)
  heads=[]
  for y,parts in sorted(headings.items()):
   label=norm(' '.join(w['text'] for w in sorted(parts,key=lambda w:w['x0'])))
   if label.upper()==label or label in ['Talents','DOOMINGS']:continue
   heads.append((y,label))
  for i,(y,label) in enumerate(heads):
   yend=heads[i+1][0]-1 if i+1<len(heads) else 740
   txt=page.crop((bounds[0],y+13,bounds[1],yend)).extract_text() or ''
   txt=norm(txt)
   if label=='Doomed': txt=txt.split('DOOMINGS')[0].strip()
   if label=='Talent Format' or (n==114 and label in ['Secret Signs (Int)','Set Trap (Dex)','Sleight of Hand (Dex)','Stealth (Ag)','Swim (S)','Track (I)','Trade (Dex)']):continue
   talents.append({'name':label,'page':n,'text':txt})
write('talents.json',talents)
write('source.json',{'title':'Warhammer Fantasy Roleplay, Fifth Edition','sourceFile':SOURCE.name,'sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'pageNumbers':'Printed pages match PDF page numbers','creationPages':[22,23,24,27,29,31,32,33,35,36,37,38,39,40,41,42,43,44],'advancementPages':[191,196],'notes':['Only this supplied book is used.','The full rulebook PDF is not included in this website.']})
print(json.dumps({'careers':len(careers),'careerRolls':len(random_careers),'talents':len(talents),'errors':errors},indent=2))
print('SOLDIER',json.dumps(next(c for c in careers if c['name']=='Soldier'),ensure_ascii=False))
print('TALENT NAMES',', '.join(t['name'] for t in talents))

# Preserve corrections to tables and cross-page descriptions after extraction.
import runpy
runpy.run_path(str(Path(__file__).resolve().with_name("apply-book-corrections.py")))
