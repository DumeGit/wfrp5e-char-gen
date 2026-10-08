"""Stage supplied PDF layout for gameplay-reference review, never in dist.

MarkItDown extractions remain the prose locator. This companion retains source
coordinates/fonts and tables so multi-column prose is not treated as one line.
"""
import argparse
import hashlib
import json
from pathlib import Path
import pymupdf as fitz

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--pdf-root', type=Path, default=Path.home() / 'Downloads')
parser.add_argument('--output', type=Path, default=ROOT.parent / 'tmp/pdfs/search-review')
parser.add_argument('--book')
args = parser.parse_args()
if args.output.resolve().is_relative_to((ROOT / 'dist').resolve()):
    raise ValueError('Stage source extraction outside dist; raw PDFs are not published assets')
args.output.mkdir(parents=True, exist_ok=True)
registry = json.loads((ROOT / 'dist/data/books/index.json').read_text(encoding='utf-8'))
for item in registry['packs']:
    manifest = json.loads((ROOT / 'dist/data/books' / item['path']).read_text(encoding='utf-8'))
    if manifest['kind'] == 'variant' or (args.book and item['id'] != args.book):
        continue
    source = args.pdf_root / manifest['source']['file']
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if digest != manifest['source']['sha256']:
        raise ValueError(f"{item['id']}: supplied PDF hash differs from registered source")
    out = args.output / (item['id'] + '.json')
    if out.exists() and json.loads(out.read_text(encoding='utf-8')).get('extractionVersion') == 2 and json.loads(out.read_text(encoding='utf-8'))['sha256'] == digest:
        print(item['id'], 'cached'); continue
    pages = []
    with fitz.open(source) as doc:
        for page in doc:
            blocks = page.get_text('dict')['blocks']
            lines = []
            for block in blocks:
                for line in block.get('lines', []):
                    spans = line['spans']
                    text = ''.join('•' if s['font']=='onlyskulls' and s['text']=='0' else s['text'] for s in spans).strip()
                    representative=next((s for s in spans if s['font']!='onlyskulls'),spans[0])
                    if text:
                        lines.append({'text': text, 'bbox': line['bbox'],
                                      'font': representative['font'], 'size': round(representative['size'], 2)})
            pages.append({'page': page.number + 1, 'width': page.rect.width,
                          'height': page.rect.height, 'lines': lines})
    out.write_text(json.dumps({'book': item['id'], 'sha256': digest, 'extractionVersion':2, 'pages': pages},
                              ensure_ascii=False), encoding='utf-8')
    print(item['id'], len(pages), 'pages staged')
