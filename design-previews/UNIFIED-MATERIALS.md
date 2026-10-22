# Imperial Desk materials

22 October 2026. Original, code-authored static SVG paper/ornament for the user's requested rustic refinement of study A, now paired with the existing approved oak instead of leather. New proposal assets stay outside `public/` and the published app.

| File | Purpose |
| --- | --- |
| `unified-parchment.svg` | Warm paper with deterministic low-frequency mottling, fine fibres and sparse faint marks; seamless noise tiles, no movement |
| `../public/assets/panel-textures/tavern-wood.svg` | Existing approved subtle oak, 384×768, reused without changing the production asset; common to all four A mode samples |
| `unified-ornament.svg` | Small original engraved diamond/scroll line, used beside suitable desktop headings |
| `unified-rustic.css` | The Weathered finish: oak panels with inset rules, margin aging, punched binding seam, brass details, heading initials, stamped labels and faint heraldic watermark |

The watermark/emblem, fonts and four banner images reuse the existing approved `public/assets/` originals and their recorded provenance. No supplied book artwork is extracted or added. No AI raster image or external asset is used. Noise is baked into deterministic SVG filter definitions and rendered as static backgrounds; no filter or opacity affects whole controls or text. Decoration is pointer-inert and remains below content. The finish changes all four A mode samples consistently. Original A, B and C remain available.

The preview server explicitly serves the remaining paper/ornament/style files and existing public oak asset. The superseded leather source is removed. No character storage, game data, saves or PDFs are changed.

Verification: all 48 finish/mode/viewport combinations (Original/Weathered × four modes × 320/390/768/1024/1440/1920px) fit without page/frame overflow. B/C retain their original working backgrounds. Native mobile menu/file-group dialogs, Escape/focus return, workspace switching, description switches and keyboard search were exercised without browser errors or failed requests. Bestiary/manager desktop and phone/menu captures were inspected. No physical-device claim is made.
