# Imperial Desk materials

Original application artwork, 22 October 2026. The user selected Imperial Desk A, aged parchment and oak panelling. No external artwork, remote requests or new font licences were introduced.

- `public/assets/imperial-desk/parchment.svg` is the deterministic 1024px production source derived from `design-previews/unified-parchment.svg`: fixed-seed fibres, mottling and age marks. On 28 October 2026 the age clouds were wrapped across both axes so they join at tile boundaries. The original study remains historical.
- `parchment.webp` is its static production raster, rendered with Chromium’s SVG engine and encoded with Sharp at quality 90 (11,972 bytes). The server-side SVG rasterizer did not preserve `stitchTiles`, causing visible horizontal/vertical joins; do not render the SVG directly through Sharp. Rasterising once keeps live turbulence filters out of long editors. The seamless tile repeats beneath the existing edge shading and content.
- `ornament.svg` is the original engraved divider from `design-previews/unified-ornament.svg` (622 bytes).
- Shared oak is the existing `public/assets/panel-textures/tavern-wood.svg`, already painted at Subtle strength. Earlier masonry/vellum/canvas assets remain only for historical standalone studies; no mode selects them at runtime.
- The existing Carrion Standard emblem provides the faint paper watermark. Existing four-mode masthead artwork/provenance is unchanged.

`src/styles/design-tokens.css` owns material URLs and colours. `workspace-shell.css` owns binding holes, shadow, watermark, brass rivets and shared menu/leaf geometry. Decorations are pointer-inert, static under reduced motion, behind text and absent in print. There is no production finish selector or persisted material preference. The offline build includes all local assets.

Regenerate the raster from the repository root using the existing Playwright/Sharp development dependencies and installed Chromium (`npm run test:ui:install` if needed):

```sh
node scripts/build-parchment.mjs
```

The authoring script renders at 1024px/1×, then checks the compressed asset’s opposing edges against ordinary neighbouring-pixel variation before writing it. It rejects visible seam jumps. This is a manual asset build, not an application build step or browser-time filter. Inspect a 2×2 repeat and wide/tall ledger surfaces after material changes; increasing the repeat size only hides seams and is not a fix.
