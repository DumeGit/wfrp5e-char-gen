"""Stage isolated printed stat blocks, excluding surrounding story text.

No output is registered automatically. The reviewer must check names, row
lengths and section endings before copying records into a source pack.
"""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT.parent / 'tmp/pdfs/search-review'
recipes = json.loads((ROOT/'scripts/search-reference-areas.json').read_text())['books']

def clean(s):
    return re.sub(r'\s+', ' ', s.replace('\u00ad','').replace('\ufb01','fi').replace('\ufb02','fl')).strip()

def slug(s):
    return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')

for book, recipe in recipes.items():
    if book == 'core': continue  # The reviewed GM compiler supplies core profiles.
    layout = json.loads((STAGE/f'{book}.json').read_text(encoding='utf-8'))
    manifest = json.loads((ROOT/'dist/data/books'/book/'manifest.json').read_text(encoding='utf-8'))
    if layout['sha256'] != manifest['source']['sha256']:
        raise ValueError(f'Staged profile source differs from the registered PDF: {book}')
    records=[]; unresolved=[]
    for page in layout['pages']:
        lines=page['lines']; printed=page['page']-recipe['pdfOffset']
        for marker in lines:
            if not re.search(r'\bWS\b',marker['text']) or not ('Bold' in marker['font']): continue
            y=marker['bbox'][1]
            headers=sorted([l for l in lines if abs(l['bbox'][1]-y)<2 and 'Bold' in l['font'] and
                            all(t in ['M','WS','BS','S','T','I','Ag','Agi','Dex','Int','WP','Wp','Fel','W'] for t in l['text'].split())],
                           key=lambda l:l['bbox'][0])
            groups=[];group=[]
            for l in headers:
                if l['text'].split()[0]=='M' and group:groups.append(group);group=[]
                group.append(l)
            if group:groups.append(group)
            header=next((g for g in groups if marker in g),[])
            labels=' '.join(l['text'] for l in header).split()
            if [t.replace('Agi','Ag').replace('Wp','WP') for t in labels] != ['M','WS','BS','S','T','I','Ag','Dex','Int','WP','Fel','W']: continue
            left=min(l['bbox'][0] for l in header);right=max(l['bbox'][2] for l in header)
            samecol=[l for l in lines if left-40<=l['bbox'][0] and l['bbox'][2]<=right+40]
            values=sorted([l for l in samecol if y+8<l['bbox'][1]<y+22 and
                           left-10<=l['bbox'][0] and l['bbox'][2]<=right+25],key=lambda l:l['bbox'][0])
            cells=' '.join(l['text'] for l in values).split()
            if len(cells)!=12 or any(not re.fullmatch(r'[0-9]+|[–—-]',c) for c in cells):
                # Career schemes are not NPC profiles.
                if any(re.fullmatch(r'\d+',c) for c in cells):unresolved.append({'page':printed,'reason':'Nonstandard stat row','cells':cells})
                continue
            titles=sorted([l for l in samecol if y-70<l['bbox'][1]<y-5 and
                           ('CaslonAntique' in l['font'] or ('Bold' in l['font'] and l['size']==12)) and
                           l['size']<=18 and not ':' in l['text']],key=lambda l:(l['bbox'][1],l['bbox'][0]))
            if not titles:
                unresolved.append({'page':printed,'reason':'No isolated profile caption','cells':cells});continue
            # The caption can have a name and a separate Career/Status line.
            titlelines=[titles[-1]]
            for previous in reversed(titles[:-1]):
                if titlelines[0]['bbox'][1]-previous['bbox'][1]<16:titlelines.insert(0,previous)
                else:break
            caption=clean(' '.join(l['text'] for l in titlelines))
            body=[]; last_y=max(l['bbox'][1] for l in values)
            for l in sorted([l for l in samecol if l['bbox'][1]>last_y+3 and l['bbox'][1]<page['height']-48],
                            key=lambda l:(l['bbox'][1],l['bbox'][0])):
                if l['size']>10 or l['bbox'][1]-last_y>32:break
                if not body and not re.match(r'^(Skills|(?:Creature )?Traits|Talents|Trappings|Spells|Miracles|Armour|Weapons|Psychology|Attacks)\*?:',l['text']):break
                body.append(l);last_y=l['bbox'][1]
            if not body:
                unresolved.append({'page':printed,'reason':'No isolated labelled profile body','caption':caption});continue
            blocks=[];current=[]
            for l in body:
                if re.match(r'^[A-Z][^:]{0,65}:',l['text']) and 'Bold' in l['font']:
                    if current:blocks.append(' '.join(current));current=[]
                current.append(clean(l['text']))
            if current:blocks.append(' '.join(current))
            name=caption.title()
            identifier=f'{book}:reference:{printed}-profile-{slug(caption)}'
            records.append({'id':identifier,'name':name,'category':'profile','topic':'Printed NPC and creature profiles',
                            'page':printed,'text':caption+'\n\n| '+' | '.join(labels)+' |\n| '+' | '.join(['---']*12)+' |\n| '+' | '.join(cells)+' |\n\n'+'\n\n'.join(blocks)})
    (STAGE/f'{book}-profiles.json').write_text(json.dumps({'records':records,'unresolved':unresolved},ensure_ascii=False,indent=2),encoding='utf-8')
    print(book,len(records),'profiles;',len(unresolved),'nonstandard blocks for review')
