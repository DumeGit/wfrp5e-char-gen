"""Stage creator material from the supplied Archives of the Empire II PDF for compatibility review.

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
parser.add_argument('--source', type=Path, default=Path(r'C:\Users\ninod\Downloads\Archives of the Empire - Vol II.pdf'))
parser.add_argument('--output-dir', type=Path, default=ROOT.parent/'tmp/pdfs/archives-ii-review')
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
reader = PdfReader(args.source)
pdf = pdfplumber.open(args.source)
KEYS = ['WS', 'BS', 'S', 'T', 'I', 'Ag', 'Dex', 'Int', 'WP', 'Fel']
CAREERS = {35: ('Maneater', 'Warrior'), 36: ('Rhinox Herder', 'Peasant'), 37: ('Ogre Butcher', 'Academic')}


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
    species = 'Ogre'
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
    assert len(levels) == 4 and len(levels[0]['skills']) == 10, (n, levels)
    careers.append({'id': 'archives-ii:career:'+re.sub(r'[^a-z0-9]+', '-', name.lower()), 'name': name, 'class': cls, 'species': split_list(species), 'page': n, 'advanceScheme': advance, 'levels': levels})
write('careers.raw.json', careers)

# Keep the two d100 elements distinct. They combine into one given name, not a
# forename and surname. Repeated elements still occupy separate die faces.
name_text = reader.pages[21].extract_text()
name_tables = []
for label, section in zip(['element1', 'element2'], re.split(r'OGRE ELEMENT [12] TABLE', name_text)[1:]):
    rows = []
    for line in section.splitlines():
        if not re.match(r'^\d{2}\s', line.strip()):
            continue
        for match in re.finditer(r'(\d{2})\s+(.+?)(?=\s+\d{2}\s|$)', line.strip()):
            face = int(match[1]) or 100
            # Letterspacing in the display font is not part of the name.
            rows.append({'min': face, 'max': face, 'result': re.sub(r'\s+', '', match[2])})
    rows.sort(key=lambda row: row['min'])
    assert [row['min'] for row in rows] == list(range(1, 101)), (label, rows)
    name_tables.append({'name': label, 'page': 22, 'dice': [1, 100], 'rows': rows})
assert name_tables[1]['rows'][23]['result'] == name_tables[1]['rows'][26]['result'] == 'elg'
write('names.raw.json', name_tables)

# These ranges were checked against the original page, not inferred from the
# unique colour names. In particular, 2d10 is not a uniform colour selection.
eyes = [(2, 2, 'Grey'), (3, 3, 'Green'), (4, 4, 'Amber'), (5, 7, 'Hazel'),
        (8, 11, 'Brown'), (12, 14, 'Dark Brown'), (15, 17, 'Sienna'),
        (18, 18, 'Black'), (19, 19, 'Purple Black'), (20, 20, 'Blue Black')]
hair = [(2, 2, 'Brown'), (3, 3, 'Red Brown'), (4, 4, 'Terracotta'), (5, 7, 'Sienna'),
        (8, 11, 'Burgundy'), (12, 14, 'Dark Brown'), (15, 17, 'Black'),
        (18, 18, 'Charcoal'), (19, 19, 'Jet Black'), (20, 20, 'Blue Black')]
write('appearance.raw.json', {key: {'page': 21, 'dice': [2, 10], 'rows':
      [{'min': lo, 'max': hi, 'result': result} for lo, hi, result in values]}
      for key, values in [('eyes', eyes), ('hair', hair)]})

spell_names = ['Bonecrusher', 'Bullgorger', 'Braingobbler', 'Taste Death',
               'Trollguts', 'The Maw', 'Feast of the Fallen']
next_spell = '|'.join(re.escape(name) for name in spell_names)
spell_pattern = re.compile(r'(' + next_spell + r')\s+CN:\s*(\d+)\s+Range:\s*(.*?)\s+Target:\s*(.*?)\s+Duration:\s*([^\n]+)\n(.*?)(?=\n(?:' + next_spell + r')\s+CN:|\Z)', re.S)
spells = []
for n in [32, 33]:
    for match in spell_pattern.finditer(reader.pages[n-1].extract_text()):
        name, cn, range_text, target, duration, body = match.groups()
        spells.append({'name': name, 'page': n, 'category': 'The Great Maw', 'cn': int(cn),
                       'range': norm(range_text), 'target': norm(target),
                       'duration': norm(duration), 'text': norm(body)})
assert [spell['name'] for spell in spells] == spell_names, spells
assert [spell['cn'] for spell in spells] == [5, 5, 5, 2, 7, 11, 9], spells
write('spells.raw.json', spells)

# Preserve full table cells for visual review, including Armour and footnotes.
tables = []
for n in [18, 20, 21, 22, 29, 39]:
    tables.append({'page': n, 'tables': pdf.pages[n-1].extract_tables()})
write('tables.raw.json', tables)
write('pages.raw.json', [{'page': i+1, 'text': p.extract_text()} for i, p in enumerate(reader.pages)])
write('source-review.json', {'title': 'Archives of the Empire: Volume II', 'edition': 4, 'file': args.source.name, 'sha256': hashlib.sha256(args.source.read_bytes()).hexdigest(), 'pdfPages': len(reader.pages), 'pageNumbers': 'Printed pages match PDF page numbers.', 'status': 'Staged source extraction; compatibility decisions pending.', 'careers': len(careers), 'tables': len(tables), 'notes': ['The printed Ogre Career table skips 05; the user explicitly assigns Rat Catcher to 05–06. Raw source tables preserve the printed gap.', 'The supplied PDF headers say Volume I, but its contents are the second collection: Ogres, astrology and magical artifice.']})
print(json.dumps({'careers': len(careers), 'tables': len(tables), 'output': str(args.output_dir)}))
