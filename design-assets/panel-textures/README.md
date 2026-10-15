# Selected panel textures

Approved by the user on 15 October 2026 after the matching-panel studies. These are original code-native SVG/procedural materials, not supplied book artwork, third-party images or imagegen outputs. They make no external resource requests and contain no scripts or motion.

| Mode | Full-strength editable source | Production asset | Tile |
| --- | --- | --- | --- |
| Player | `../../design-previews/textures/tavern-wood.svg` | `../../dist/assets/panel-textures/tavern-wood.svg` | 384 × 768 |
| Bestiary | `../../design-previews/textures/crypt-masonry.svg` | `../../dist/assets/panel-textures/crypt-masonry.svg` | 512 × 640 |
| Marijan | `../../design-previews/textures/vellum.svg` | `../../dist/assets/panel-textures/vellum.svg` | 256 × 256 |

Tavern oak uses seeded grain, worn plank joints, knots and sparse nail heads. Crypt masonry uses staggered irregular blocks, recessed mortar, worn edges and fine pitting; there are no pictorial skeleton motifs. Ash vellum uses fine directional procedural relief.

To update an approved texture, edit its source SVG, copy it to the production path, and wrap its root contents in one `<g opacity="0.15">` (including the final closing `</g>` before `</svg>`). This fixes the selected Subtle strength while allowing all text/controls to remain opaque. Do not dim the containing panel or add a pointer-blocking overlay. Verify each asset loads and that paired panels retain matching backgrounds. Theme base colour/texture/tile/shadow roles belong in `dist/design-tokens.css`; shared painting belongs in `dist/design-system.css`. Rebuild and check the offline worker after changing production assets. Alternative material previews stay outside `dist`.
