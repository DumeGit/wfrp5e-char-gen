"""Prepare review candidates outside dist; publishing is a separate reviewed step.

Only curated gameplay ranges and mechanically isolated NPC stat blocks are
considered. Full-book text, illustrations and adventure biographies stay local.
"""
import argparse
import json
import re
import unicodedata
from pathlib import Path
import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--book', required=True)
parser.add_argument('--pdf-root', type=Path, default=Path.home() / 'Downloads')
parser.add_argument('--stage', type=Path, default=ROOT.parent / 'tmp/pdfs/search-review')
args = parser.parse_args()
if args.stage.resolve().is_relative_to((ROOT / 'dist').resolve()):
    raise ValueError('Stage review candidates outside dist; publishing requires source review')
recipe = json.loads((ROOT/'scripts/search-reference-areas.json').read_text())['books'][args.book]
pack = ROOT/'dist/data/books'/args.book
manifest = json.loads((pack/'manifest.json').read_text(encoding='utf-8'))
layout = json.loads((args.stage/(args.book+'.json')).read_text(encoding='utf-8'))
if layout['sha256'] != manifest['source']['sha256']:
    raise ValueError('Staged source differs from the registered PDF')

def clean(text):
    text = text.replace('\u00ad','').replace('\ufb01','fi').replace('\ufb02','fl')
    return re.sub(r'\s+', ' ', text).strip()

def slug(text):
    return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower()).strip('-')

def heading(line):
    caption=(line['size']>=10 and 'CaslonAntique' in line['font'] and
             'Bold' in line['font'] and line['text'].isupper() and len(line['text'])>7)
    return ((line['size'] >= 12 or caption) and 'Caslon' in line['font'] and
            ('Bold' in line['font'] or line['size'] >= 14) and
            not 'Italic' in line['font'] and
            not re.match(r'^Warriors(?:,|$)',line['text']) and
            not line['text'].isdigit() and len(line['text']) > 2)

def table_markdown(table, source_lines):
    rows = [[clean(cell or '').replace('|','/') for cell in row] for row in table.extract()]
    if not rows: return ''
    first = rows[0][0].casefold()
    is_header = first in ['roll','d100','d10','name','type','armour','weapon','characteristic','result','test','advance','advances','item','symptom','material','increase','species','1d10','1d100','1d20','2d10','ship name','armour type','skill','class']
    headers = rows.pop(0) if is_header else [''] * table.col_count
    recovered=[]
    if not is_header:
        # Recover only labels actually printed immediately above each column.
        # Some source tables leave their header outside the ruled rectangle.
        nearby=[l for l in source_lines if table.bbox[1]-36 < l['bbox'][1] < table.bbox[1] and
                l['bbox'][0]>=table.bbox[0]-3 and l['bbox'][2]<=table.bbox[2]+3 and l['size']<12 and 'Bold' in l['font']]
        cells=table.rows[0].cells
        for i,cell in enumerate(cells):
            if cell:
                labels=[l for l in nearby if cell[0]-3 <= (l['bbox'][0]+l['bbox'][2])/2 < cell[2]+3]
                labels.sort(key=lambda l:(l['bbox'][1],l['bbox'][0]))
                headers[i]=' '.join(clean(l['text']) for l in labels)
                recovered.extend(labels)
        if not all(headers): headers=['']*table.col_count;recovered=[]
    return '\n'.join(['| '+' | '.join(headers)+' |','| '+' | '.join(['---']*table.col_count)+' |']+
                     ['| '+' | '.join(row)+' |' for row in rows]), recovered

records=[]
audit=[]
with fitz.open(args.pdf_root/manifest['source']['file']) as doc:
    for area in recipe['areas']:
        nodes=[]
        for number in range(area['first'],area['last']+1):
            pdf_number=number+recipe['pdfOffset']
            page=doc[pdf_number-1]
            p=layout['pages'][pdf_number-1]
            right_starts=[l['bbox'][0] for l in p['lines'] if
                          p['width']/2-25<l['bbox'][0]<p['width']/2+65 and
                          l['bbox'][2]>p['width']-95 and len(l['text'])>30 and
                          'ACaslonPro' in l['font'] and 'Bold' not in l['font'] and l['size']<=11]
            cut=min(right_starts)-4 if right_starts else p['width']/2-15
            tables=[t for t in page.find_tables().tables if t.row_count>=2 and t.col_count>=2]
            rendered=[(t,*table_markdown(t,p['lines'])) for t in tables]
            recovered=[l for t,md,ls in rendered for l in ls]
            lines=[x for x in p['lines'] if 38 < x['bbox'][1] < p['height']-48 and
                   'DwarvenAxe' not in x['font'] and x['text']!='•' and not(x['text'].isdigit() and x['size']>=10) and
                   x not in recovered and
                   not any(fitz.Rect(t.bbox).contains(fitz.Rect(x['bbox'])) for t in tables)]
            for x in lines:
                nodes.append({'page':number,'x':x['bbox'][0],'y':x['bbox'][1],
                              'column':0 if x['bbox'][0]<cut else 1,
                              'text':clean(x['text']), 'heading':heading(x), 'font':x['font'], 'size':x['size'], 'table':False})
            for t,md,labels in rendered:
                nodes.append({'page':number,'x':t.bbox[0],'y':t.bbox[1],
                              'column':0 if t.bbox[0]<cut else 1,
                              'text':md,'heading':False,'font':'table','table':True})
            # Wide tables are single nodes, never interleaved table-cell prose.
        nodes.sort(key=lambda n:(n['page'],n['column'],n['y'],n['x']))
        chunks=[]
        current=None
        for node in nodes:
            if node['heading']:
                # Wrapped adjacent heading lines describe one source heading.
                if (current and not current['body'] and node['page']==current['page'] and
                    node['font']==current['heading']['font'] and node['size']==current['heading']['size'] and
                    abs(node['x']-current['heading']['x'])<70 and
                    0<node['y']-current['heading']['y']<26 and node['size']>=12):
                    current['name'] += ' '+node['text'];current['heading']=node;continue
                current={'name':node['text'],'page':node['page'],'last':node['page'],'body':[],'heading':node}
                chunks.append(current)
            elif current:
                current['body'].append(node);current['last']=node['page']
        ids=[]
        for chunk in chunks:
            if not chunk['body']:continue
            # Keep source paragraph and table boundaries instead of joining a
            # multi-column row into a misleading sentence.
            blocks=[];paragraph=[];last=None
            for node in chunk['body']:
                if node['table']:
                    if paragraph:blocks.append(' '.join(paragraph));paragraph=[]
                    blocks.append(node['text']);last=None;continue
                if last and (node['page']!=last['page'] or node['x']-last['x']>80 or node['y']-last['y']>19):
                    if paragraph:blocks.append(' '.join(paragraph));paragraph=[]
                paragraph.append(node['text']);last=node
            if paragraph:blocks.append(' '.join(paragraph))
            text='\n\n'.join(blocks)
            name=chunk['name'].title() if chunk['name'].isupper() else chunk['name']
            category='table' if re.search(r'\b(table|critical wounds)\b',name,re.I) else 'rule'
            if re.search(r'endeavour',name,re.I) or re.search(r'\bThis Endeavour\b',text[:300]):category='endeavour'
            identity=f"{args.book}:reference:{chunk['page']}-{slug(name)}"
            base=identity;ordinal=2
            while any(r['id']==identity for r in records):identity=f'{base}-{ordinal}';ordinal+=1
            record={'id':identity,'name':name,'category':category,'topic':area['topic'],
                    'page':chunk['page'] if chunk['last']==chunk['page'] else f"{chunk['page']}–{chunk['last']}",
                    'text':text}
            records.append(record);ids.append(identity)
        audit.append({**area,'status':'pending-review','candidates':ids})
out=args.stage/(args.book+'-candidates.json')
out.write_text(json.dumps({'book':args.book,'sha256':manifest['source']['sha256'],
                          'records':records,'areas':audit},ensure_ascii=False,indent=2),encoding='utf-8')
print(args.book,len(records),'candidates staged for source review')
