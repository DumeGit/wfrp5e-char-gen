# Selected panel textures

Current production ownership is `public/assets/panel-textures/`, with semantic roles in `src/styles/design-tokens.css` and shared painting in `src/styles/design-system.css`. The manager's Imperial field ledger adds original `field-canvas.svg` (240 × 240): a static six-pixel weave with pale 0.055 and dark 0.095 strokes, totalling the selected 0.15 strength. The tile paints its sidebar/compact menu, while the header uses the generated banner and there is no manager folio, with no motion, external requests, pointer overlay or print texture. Its source is the small production SVG itself.

Approved by the user on 15 October 2026 after the matching-panel studies. These are original code-native SVG/procedural materials, not supplied book artwork, third-party images or imagegen outputs. They make no external resource requests and contain no scripts or motion.

| Mode | Full-strength editable source | Production asset | Tile |
| --- | --- | --- | --- |
| Player | `../../design-previews/textures/tavern-wood.svg` | `../../public/assets/panel-textures/tavern-wood.svg` | 384 × 768 |
| Bestiary | `../../design-previews/textures/crypt-masonry.svg` | `../../public/assets/panel-textures/crypt-masonry.svg` | 512 × 640 |
| Marijan | `../../design-previews/textures/vellum.svg` | `../../public/assets/panel-textures/vellum.svg` | 256 × 256 |

Tavern oak uses seeded grain, worn plank joints, knots and sparse nail heads. Crypt masonry uses staggered irregular blocks, recessed mortar, worn edges and fine pitting; there are no pictorial skeleton motifs. Ash vellum uses fine directional procedural relief.

To update an approved texture, edit its source SVG, copy it to the production path, and wrap its root contents in one `<g opacity="0.15">` (including the final closing `</g>` before `</svg>`). This fixes the selected Subtle strength while allowing all text/controls to remain opaque. Do not dim the containing panel or add a pointer-blocking overlay. Verify each asset loads and that paired panels retain matching backgrounds. Theme base colour/texture/tile/shadow roles belong in `src/styles/design-tokens.css`; shared painting belongs in `src/styles/design-system.css`. Rebuild and check the offline worker after changing production assets. Alternative material previews stay outside `public/` and `out/`. The manager field canvas is authored directly as its production SVG; do not add another opacity wrapper to its already explicit 0.15 strokes.
