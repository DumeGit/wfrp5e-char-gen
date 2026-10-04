"""Stage character-creation material from the supplied PDF; never registers it.

Read the full MarkItDown conversion separately. Printed pages trail PDF positions
by one in this file; validate tables against rendered pages before importing.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=Path(r'C:\Users\ninod\Downloads\Rough Nights & Hard Days.pdf'))
parser.add_argument('--output-dir', type=Path, default=ROOT.parent/'tmp/pdfs/rough-nights-review')
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
reader = PdfReader(args.source)
pages = [{'page': i+1, 'printedPage': i, 'text': p.extract_text()} for i, p in enumerate(reader.pages)]
def write(name, value):
    (args.output_dir/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

write('pages.json', pages)
write('source.json', {'file': args.source.name, 'sha256': hashlib.sha256(args.source.read_bytes()).hexdigest(), 'pages': len(pages), 'printedPageOffset': -1})
text = pages[87]['text']
species = []
for m in re.finditer(r'(?m)^(\d{2})(?:[–-](\d{2}))?\s+(Human|Halfling|Dwarf|Gnome|High Elf|Wood Elf)\s*$', text):
    species.append({'min': int(m[1]) or 100, 'max': int(m[2] or m[1]) or 100, 'result': m[3]})
careers = []
section = text.split('Class Career/Species Gnome', 1)[1]
for line in section.splitlines():
    m = re.fullmatch(r'(?:ACADEMICS|BURGHERS|COURTIERS|PEASANTS|RANGERS|RIVERFOLK|ROGUE|WARRIORS)?\s*(.+?)\s+(\d{2})(?:[–-](\d{2}))?', line.strip())
    if m:
        careers.append({'min': int(m[2]) or 100, 'max': int(m[3] or m[2]) or 100, 'result': m[1]})
for rows in [species, careers]:
    assert all(sum(row['min'] <= face <= row['max'] for row in rows) == 1 for face in range(1, 101)), rows
write('tables.raw.json', {'species': species, 'careers': careers})
text = pages[89]['text']
appearance = {}
for kind, heading, end in [('eyes','Eye Colour','Hair Colour'),('hair','Hair Colour','Height')]:
    section = text.split(heading, 1)[1].split(end, 1)[0]
    section = '\n'.join(line for line in section.splitlines() if re.match(r'^\d+(?:[–-]\d+)?\s', line))
    rows = [{'min': int(m[1]), 'max': int(m[2] or m[1]), 'result': m[3].strip()} for m in re.finditer(r'(\d+)(?:[–-](\d+))?\s+([A-Z][A-Za-z ]*?)(?=\s+\d|\n|$)', section)]
    rows.sort(key=lambda row: row['min'])
    assert all(sum(row['min'] <= face <= row['max'] for row in rows) == 1 for face in range(2, 21)), rows
    appearance[kind] = {'name': f'Gnome {kind}', 'page': 89, 'dice': [2,10], 'rows': rows}
write('appearance.raw.json', appearance)
print(json.dumps({'careerRows': len(careers), 'speciesRows': len(species), 'staged': str(args.output_dir), 'registered': False}))
