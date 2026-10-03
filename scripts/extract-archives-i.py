"""Stage creator material from the supplied Archives of the Empire I PDF for compatibility review.

This never registers or enables content. Read the MarkItDown extraction first;
use PDF coordinates here to preserve career columns, symbols and table cells.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re

import pdfplumber
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=Path(r'C:\Users\ninod\Downloads\Archives of the Empire - Vol I.pdf'))
parser.add_argument('--output-dir', type=Path, default=ROOT.parent/'tmp/pdfs/archives-i-review')
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
reader = PdfReader(args.source)
pdf = pdfplumber.open(args.source)
KEYS = ['WS', 'BS', 'S', 'T', 'I', 'Ag', 'Dex', 'Int', 'WP', 'Fel']
CAREERS = {88: ('Ghost Strider', 'Ranger'), 89: ('Fieldwarden', 'Ranger'), 90: ('Karak Ranger', 'Ranger'), 91: ('Badger Rider', 'Warrior')}


def norm(s):
    return re.sub(r'\s+', ' ', re.sub(r'([-\/])\s+', r'\1', s.replace('\u00ad', '').replace('ﬂ', 'fl').replace('ﬁ', 'fi'))).strip()


def split_list(s):
    result, start, depth = [], 0, 0
    for i, c in enumerate(s):
        depth += (c == '(') - (c == ')')
        if c == ',' and depth == 0:
            result.append(norm(s[start:i]))
            start = i + 1
    result.append(norm(s[start:]))
    return [x for x in result if x]


def write(name, value):
    (args.output_dir/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')


careers = []
for n, (name, cls) in CAREERS.items():
    page = pdf.pages[n-1]
    text = reader.pages[n-1].extract_text()
    species = 'Halfling' if n == 91 else next(line.strip() for line in text.splitlines() if re.fullmatch(r'\s*(?:(?:Dwarf|Halfling|High Elf|Human|Wood Elf),?\s*)+', line))
    words = page.extract_words()
    ws = next(w for w in words if w['text'] == 'WS')
    y = ws['top']
    columns = [w for w in words if abs(w['top']-y) < 2 and w['text'] in KEYS+['Agi']]
    centers = {('Ag' if w['text'] == 'Agi' else w['text']): (w['x0']+w['x1'])/2 for w in columns}
    assert len(centers) == 10, (n, centers)
    column = lambda x: min(centers, key=lambda k: abs(centers[k]-x))
    advance = {k: None for k in KEYS}
    for c in page.chars:
        if c['text'] == 'h' and 'crossbatstfb' in c['fontname'] and y+8 < c['top'] < y+25:
            advance[column((c['x0']+c['x1'])/2)] = 1
    for c in page.rects+page.curves:
        color = c.get('non_stroking_color')
        if y+8 < c['top'] < y+21 and 15 < c['x1']-c['x0'] < 35 and isinstance(color, (tuple, list)) and len(color) == 3:
            level = 4 if color[0] > .9 and color[2] < .3 else 3 if abs(color[0]-color[1]) < .05 and .7 < color[0] < .85 else 2 if color[0] > color[1] > color[2] and color[0] > .6 else None
            if level:
                advance[column((c['x0']+c['x1'])/2)] = level
    assert sorted(x for x in advance.values() if x) == [1, 1, 1, 2, 3, 4], (n, advance)
    x0, x1 = min(centers.values())-17, max(centers.values())+22
    col = page.crop((x0, y+25, x1, page.height-30))
    # Career blocks use 9pt Caslon; omit quotes and body prose in 10pt.
    col = col.filter(lambda o: o.get('object_type') != 'char' or 8.8 < o.get('size', 0) < 9.2)
    ct = col.extract_text(x_tolerance=2, y_tolerance=3)
    heads = list(re.finditer(r'(?m)^\s*(?:h\s+)?(.+?)\s*(?:[—–-]\s*)?(Brass|Silver|Gold)\s+(\d)\s*$', ct))
    levels = []
    for i, h in enumerate(heads):
        chunk = ct[h.end():heads[i+1].start() if i+1 < len(heads) else len(ct)]
        m = re.search(r'Skills:\s*(.*?)\s*Talents:\s*(.*?)\s*Trappings:\s*(.*)', chunk, re.S)
        assert m, (n, i, chunk)
        levels.append({'level': i+1, 'name': norm(h[1]).rstrip(' –—-'), 'status': h[2], 'standing': int(h[3]), 'skills': split_list(m[1]), 'talents': split_list(m[2]), 'trappings': split_list(m[3])})
    assert len(levels) == 4 and len(levels[0]['skills']) == 8, (n, levels)
    careers.append({'id': 'archives-i:career:'+re.sub(r'[^a-z0-9]+', '-', name.lower()), 'name': name, 'class': cls, 'species': split_list(species), 'page': n, 'advanceScheme': advance, 'levels': levels})
write('careers.raw.json', careers)

# Table extraction: use the printed headers as cell boundaries, not flattened text.
tables = []
for n in [92, 93]:
    page = pdf.pages[n-1]
    words = page.extract_words()
    starts = [w for w in words if w['text'] in ['Weapon', 'Item', 'Ammunition'] and any(abs(q['top']-w['top']) < 3 and q['text'] in ['Cost', 'Price'] for q in words)]
    for start in starts:
        y = start['top']
        header = [w for w in words if abs(w['top']-y) < 3]
        labels = ['Item' if start['text'] == 'Item' else start['text'], 'Cost' if start['text'] == 'Item' else 'Price', 'Enc', 'Availability']
        if start['text'] != 'Item':
            labels += ['Reach' if any(w['text'] == 'Reach' for w in header) else 'Range', 'Damage', 'Qualities']
        anchors = [next(w['x0'] for w in header if w['text'] == k) for k in labels]
        # Outer borders are omitted; horizontal cell rules still preserve them.
        header_rules = [l for l in page.lines if abs(l['top']-l['bottom']) < .1 and y+4 < l['top'] < y+20 and l['x0'] < anchors[-1]+50]
        rule_y = min(l['top'] for l in header_rules)
        header_rules = [l for l in header_rules if abs(l['top']-rule_y) < .2]
        borders = sorted(set(round(x, 1) for l in header_rules for x in [l['x0'], l['x1']]))
        bottom = min([w['top']-10 for w in starts if w['top'] > y+20]+[page.height-30])
        if len(borders) != len(labels)+1:
            raise ValueError(f'Page {n}: inspect table borders: {borders}, {labels}')
        horizontal = sorted(set(round(l['top'], 2) for l in page.lines if abs(l['top']-l['bottom']) < .1 and abs(l['x0']-borders[0]) < 1 and abs(l['x1']-borders[1]) < 1 and rule_y-.1 <= l['top'] <= bottom+.5))
        ends = [l['bottom'] for l in page.lines if abs(l['x0']-l['x1']) < .1 and abs(l['x0']-borders[1]) < 1 and rule_y < l['top'] < bottom]
        if ends and max(ends) > horizontal[-1]+1:
            horizontal.append(max(ends)+.25)
        rows = []
        for a, b in zip(horizontal, horizontal[1:]):
            cells = []
            for left, right in zip(borders, borders[1:]):
                cell = page.filter(lambda o: o.get('object_type') == 'char' and left < (o['x0']+o['x1'])/2 < right and a < (o['top']+o['bottom'])/2 < b)
                cells.append(norm(cell.extract_text() or ''))
            if any(cells): rows.append(dict(zip(labels, cells)))
        tables.append({'page': n, 'columns': labels, 'rows': rows})
write('equipment-tables.raw.json', tables)

# Keep group labels separate from item rows, including ammunition groups.
records = []
for table in tables:
    group = None
    for row in table['rows']:
        label = row.get('Item', row.get('Weapon', row.get('Ammunition', '')))
        if not label:
            group = ''.join(row.values())
            continue
        records.append({'page': table['page'], 'group': group, **row})
write('equipment.raw.json', records)


write('source-review.json', {'title': 'Archives of the Empire: Volume I', 'edition': 4, 'file': args.source.name, 'sha256': hashlib.sha256(args.source.read_bytes()).hexdigest(), 'pdfPages': len(reader.pages), 'pageNumbers': 'Printed pages match PDF page numbers.', 'status': 'Staged source extraction; compatibility decisions pending.', 'careers': len(careers), 'tables': len(tables)})
print(json.dumps({'careers': len(careers), 'tables': len(tables), 'output': str(args.output_dir)}))
