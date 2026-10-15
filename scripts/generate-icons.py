"""Rasterise the original ledger emblem for installable app icons.

The canonical SVG uses only solid M/L/Z polygons, keeping this offline
generator independent of fonts and browser/renderer packages.
"""
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
assets = root / 'dist' / 'assets'
svg = ET.parse(assets / 'ledger-emblem.svg').getroot()
ns = {'s': 'http://www.w3.org/2000/svg'}


def points(path):
    parts = re.findall(r'[A-Za-z]|-?\d+(?:\.\d+)?', path)
    result, i = [], 0
    while i < len(parts):
        command = parts[i]
        i += 1
        if command == 'Z':
            continue
        if command not in ('M', 'L'):
            raise ValueError(f'Unsupported icon command: {command}')
        x, y = float(parts[i]), float(parts[i + 1])
        i += 2
        result.append(((x - 54) * 7 + 512, (y - 50) * 7 + 512))
    return result


canvas = Image.new('RGB', (1024, 1024), '#251c17')
draw = ImageDraw.Draw(canvas)
for path in svg.findall('s:path', ns):
    draw.polygon(points(path.attrib['d']), fill=path.attrib['fill'])
for size in (180, 192, 512):
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(assets / f'icon-{size}.png')
canvas.resize((512, 512), Image.Resampling.LANCZOS).save(assets / 'icon-maskable-512.png')
