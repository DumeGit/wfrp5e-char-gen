# Marijan Mode banner study — 9 October 2026

Original artwork generated with the built-in imagegen tool from the user's supplied `Warhammer_High_Elves_Sundering.webp` as a visual reference. The supplied picture is not distributed here. This is an original generated composition, not an extracted book illustration.

- `sundering-original.png`: unchanged generated output, 2172 × 724.
- `sundering-banner.webp`: same artwork encoded with Pillow, WebP quality 85 / method 6; 430,228 bytes. No crop, tint or retouching. Colour veils and banner crops belong to preview CSS.
- `prompt.txt`: exact generation prompt.

The original study assets are outside `dist`. The user selected A — Ash & Vellum; its final edited WebP is now shipped in production. The three proposals live in `design-previews/marijan-colours.html`, with full-size views and a native style selector. They reuse a static snapshot rendered by the actual Marijan views and shared component skin. Demo values are explicitly unrestricted and do not claim legal creation or verified rolls.

Run `node design-previews/serve.mjs` from the repository root, then open http://127.0.0.1:8110/design-previews/marijan-colours.html. This local design server serves only preview/assets/dist paths and rejects PDF requests. The existing app preview remains on port 8104.

## Earlier monochrome/red artwork

- `ash-vellum-original.png`: unchanged built-in imagegen edit of `sundering-original.png`, preserving the scene with black/grey/white and selectively crimson cloth.
- `ash-vellum-banner.webp`: Pillow WebP quality 85 / method 6, 2171 × 724 and 390,482 bytes; previously copied into `dist/assets/marijan/banner.webp`. No post-generation retouching or crop.
- `ash-vellum-prompt.txt`: exact edit prompt.

Production applies only the banner contrast veil and responsive crop; no greyscale filter removes the painted red accents. All generated PNGs are retained non-destructively.

## Current colourful banner

The user asked for more colour in the masthead after selecting the neutral UI. A built-in imagegen edit of `ash-vellum-original.png` restored storm blue, ivory/silver, warm gold and natural landscape colour, preserving crimson cloth. The editor palette remains Ash & Vellum.

- `colour-banner-original.png`: unchanged generated colour edit, 2171 × 724.
- `colour-banner.webp`: Pillow WebP quality 85 / method 6; identical bytes shipped as `dist/assets/marijan/banner.webp`.
- `colour-banner-prompt.txt`: exact edit prompt.

The selected A preview uses this same colourful WebP. Earlier image variants remain available as source history.
