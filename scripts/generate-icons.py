"""Rasterise the code-drawn Black Banner W for PWA icons."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageColor

root = Path(__file__).resolve().parents[1]
assets = root / 'dist' / 'assets'
svg = ET.parse(assets / 'black-banner' / 'w.svg').getroot()
ns = {'s': 'http://www.w3.org/2000/svg'}
tokens = (root / 'dist' / 'design-tokens.css').read_text(encoding='utf-8')

def colour(name):
    return re.search(r'--' + name + r':\s*(#[0-9a-f]+)', tokens).group(1)

def points(path):
    # Only our M/H/L/Z path is supported. Incompatible future paths fail clearly.
    parts = re.findall(r'[A-Za-z]|-?\d+(?:\.\d+)?', path)
    result, i, x, y = [], 0, 0, 0
    while i < len(parts):
        command = parts[i]; i += 1
        if command in ('M', 'L'):
            x, y = float(parts[i]), float(parts[i + 1]); i += 2
        elif command == 'H':
            x = float(parts[i]); i += 1
        elif command == 'Z':
            continue
        else:
            raise ValueError(f'Unsupported icon path command: {command}')
        result.append((x, y))
    return result

canvas = Image.new('RGB', (1024, 1024), colour('color-leather-deep'))
draw = ImageDraw.Draw(canvas)
draw.rectangle((175,175,849,849), outline=colour('color-line-dark'), width=4)
shape = points(svg.find('.//s:path[@id="w"]', ns).attrib['d'])
shape = [((x-54)*6+512, (y-50)*6+512) for x,y in shape]
draw.polygon([(x+6,y+12) for x,y in shape], fill='#201714')
draw.line([(x+6,y+6) for x,y in shape] + [(shape[0][0]+6,shape[0][1]+6)], fill='#67262a', width=27, joint='curve')
mask = Image.new('L', canvas.size)
ImageDraw.Draw(mask).polygon(shape, fill=255)
gold = Image.new('RGB', canvas.size)
gold_draw = ImageDraw.Draw(gold)
stops = [(float(s.attrib.get('offset','0')),ImageColor.getrgb(s.attrib['stop-color']))
         for s in svg.find('.//s:linearGradient[@id="gold"]', ns)]
top, bottom = min(y for x,y in shape), max(y for x,y in shape)
for y in range(1024):
    fraction = max(0,min(1,(y-top)/(bottom-top)))
    for (a,ca),(b,cb) in zip(stops,stops[1:]):
        if a <= fraction <= b:
            t = (fraction-a)/(b-a)
            rgb = tuple(round(ca[k]+(cb[k]-ca[k])*t) for k in range(3))
            gold_draw.line((0,y,1023,y), fill=rgb)
            break
canvas.paste(gold, mask=mask)
draw.line(shape+[shape[0]], fill='#5a3812', width=5, joint='curve')
for size in (180, 192, 512):
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(assets / f'icon-{size}.png')
canvas.resize((512, 512), Image.Resampling.LANCZOS).save(assets / 'icon-maskable-512.png')
