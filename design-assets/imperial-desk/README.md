# Imperial Desk materials

Original application artwork, 22 October 2026. The user selected Imperial Desk A, aged parchment and oak panelling. No external artwork, remote requests or new font licences were introduced.

- `public/assets/imperial-desk/parchment.svg` is the deterministic 1024px original from `design-previews/unified-parchment.svg`: fixed-seed fibres, mottling and age marks.
- `parchment.webp` is its static production raster, generated using the existing Sharp dependency at quality 85 (9,254 bytes). Rasterising once avoids a live SVG turbulence filter across long editors. It repeats beneath edge shading and content.
- `ornament.svg` is the original engraved divider from `design-previews/unified-ornament.svg` (622 bytes).
- Shared oak is the existing `public/assets/panel-textures/tavern-wood.svg`, already painted at Subtle strength. Earlier masonry/vellum/canvas assets remain only for historical standalone studies; no mode selects them at runtime.
- The existing Carrion Standard emblem provides the faint paper watermark. Existing four-mode masthead artwork/provenance is unchanged.

`src/styles/design-tokens.css` owns material URLs and colours. `workspace-shell.css` owns binding holes, shadow, watermark, brass rivets and shared menu/leaf geometry. Decorations are pointer-inert, static under reduced motion, behind text and absent in print. There is no production finish selector or persisted material preference. The offline build includes all local assets.

Regenerate the raster from the repository root:

```js
import sharp from "sharp";
await sharp("public/assets/imperial-desk/parchment.svg")
  .webp({ quality: 85 })
  .toFile("public/assets/imperial-desk/parchment.webp");
```
