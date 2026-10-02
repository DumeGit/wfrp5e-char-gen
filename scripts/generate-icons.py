from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Render the existing gold W and square frame used by the website masthead.
assets = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
font_path = Path('C:/Windows/Fonts/georgia.ttf')
canvas = Image.new('RGB', (1024, 1024), '#202a2c')
draw = ImageDraw.Draw(canvas)
draw.rectangle((190, 190, 834, 834), outline='#d1ad6e', width=9)
font = ImageFont.truetype(str(font_path), 500)
bounds = draw.textbbox((0, 0), 'W', font=font)
draw.text(((1024 - (bounds[2] - bounds[0])) / 2 - bounds[0],
           (1024 - (bounds[3] - bounds[1])) / 2 - bounds[1]),
          'W', font=font, fill='#d1ad6e')
for size in (180, 192, 512):
    canvas.resize((size, size), Image.Resampling.LANCZOS).save(assets / f'icon-{size}.png')
canvas.resize((512, 512), Image.Resampling.LANCZOS).save(assets / 'icon-maskable-512.png')
