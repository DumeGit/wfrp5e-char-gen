from pathlib import Path
from pypdf import PdfReader
import json,re
source=Path(r'C:\Users\ninod\Downloads\Warhammer Fantasy Roleplay (2).pdf')
r=PdfReader(source);items=[]
pattern=r'^(.+?)\s+((?:\d+\s+GC(?:\s+[\d–-]+/[\d–-]+)?|[\d–-]+/[\d–-]+|\d+d|Varies))\s+(\d+)\s+(?:(\d+)\s+)?(Common|Scarce|Rare|Exotic)\b'
for n in [308,309,310,311,316]:
 for line in r.pages[n-1].extract_text().splitlines():
  m=re.match(pattern,line.strip())
  if m:
   name={'Stein':'Pewter Stein','Cryptography':'Book, Cryptography'}.get(m[1],m[1])
   items.append(dict(name=name,price=m[2],enc=int(m[3]),capacity=int(m[4]) if m[4] else None,availability=m[5],page=n))
(Path(__file__).resolve().parents[1]/'dist/data/gear.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf8')
print(len(items),'equipment table entries')
