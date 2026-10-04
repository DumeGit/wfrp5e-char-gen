"""Stage the supplied Blood and Bramble PDF outside the published app."""
from pathlib import Path
import argparse, hashlib, json
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=Path(r'C:\Users\ninod\Downloads\Blood and Bramble.pdf'))
parser.add_argument('--output-dir', type=Path, default=ROOT.parent / 'tmp/pdfs/blood-bramble-review')
args = parser.parse_args()
args.output_dir.mkdir(parents=True, exist_ok=True)
pages = []
with pdfplumber.open(args.source) as pdf:
    for number, page in enumerate(pdf.pages, 1):
        # Recto/verso text blocks have different margins; a geometric midpoint
        # cuts words out of both columns. Check these bounds against the PDF.
        left, right = (50, 295) if number % 2 else (82, 326)
        columns = [page.crop((x0, 45, x1, page.height - 32)).extract_text(x_tolerance=2, y_tolerance=3)
                   for x0, x1 in [(left, right - 7), (right, right + 237)]]
        pages.append({'page': number, 'text': page.extract_text(), 'columns': columns})
(args.output_dir / 'pages.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
(args.output_dir / 'source.json').write_text(json.dumps({'file': args.source.name, 'sha256': hashlib.sha256(args.source.read_bytes()).hexdigest(), 'pages': len(pages)}, indent=2), encoding='utf-8')
print(f'Staged {len(pages)} pages for review.')
