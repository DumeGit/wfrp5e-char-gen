# Black Banner design system — v1

The user selected **C — The Black Banner** on 5 October 2026 and authorised implementation. This is the creator's active design: painted Old World heraldry, dark leather, parchment, muted antique gold and oxblood. Gothic lettering belongs to the masthead; the working interface stays compact and readable. The W uses the approved softened bevel and centred folio placement. Decorative initials are optically centred. There is no logo glint or sound.

## Ownership

| File | Responsibility |
| --- | --- |
| `dist/design-tokens.css` | Semantic colours, typography, spacing, radii, control heights, layout widths and motion durations; local font declarations |
| `dist/design-system.css` | Shared component skin, shell, responsive adaptations, print and reduced motion |
| `dist/design-system.mjs` | Escaped accessible chapter headings, shared emblem markup and independent motion preference |
| `dist/styles.css`, `workspace.css`, `book-search.css` | Existing feature structure, density and interactions; loaded before the skin |
| `dist/design-system.html` | Live component reference, independent of character data and rules |
| `dist/assets/black-banner/`, `assets/fonts/` | Canonical production art/emblem and local fonts with their SIL Open Font Licenses |

New features reuse semantic tokens and existing controls. Do not copy preview `cqw` sizing, add book-specific palettes, or hardcode another paper/leather/primary colour. Features own their necessary layout; shared appearance belongs in the design system. Old short variables (`--ink`, `--paper`, `--muted`, `--line`, `--red`, `--green`, `--brass`, `--focus`) are compatibility aliases. Historical feature styles remain before the skin, not as another selectable theme.

Use `chapterHeading(title)` for the page-level heading and normal h2/h3 for sections. It escapes user names, preserves graphemes, supplies the complete accessible name and hides decorative fragments from assistive technology. `ledgerEmblem()` is decorative, with labelled text nearby. Never interpolate raw user text into HTML.

## Component contract

| Purpose | Reuse | Treatment |
| --- | --- | --- |
| Main action | `.primary` | Oxblood/ivory with persistent hover contrast; keep disabled reasons nearby |
| Secondary action | `.secondary` | Leather/warm text |
| Neutral action | `.quiet` | Raised paper on paper; leather variant in the dark shell |
| Fields | `.field`, labelled input/select/textarea | Raised paper, thin warm line, visible focus; 44px normal/36px compact controls |
| Tabs | `.page-tabs` and existing tab handlers | Leather selected tab, paper alternatives; preserve keyboard behaviour |
| Advances | `.xp-row.xp-advance-row` | Compact name/meta, score change, labelled ? and XP price; mobile score below name |
| Disclosures | Existing details/summary + stable `data-detail-key` | One name, optional expansion; no duplicated description heading |
| Feedback | `.notice`, `.error`, `.success` | Distinct semantic colour and text; never colour alone |
| Cards | `.book-card`, `.career-result`, `.kit-item`, `.rule-card` | Raised paper with a warm line |
| Source | `.source-button` | Compact underlined printed reference, using the existing dialog |
| Adaptation | `.legacy-tag` | Plum provenance badge, separate from warning/eligibility states |
| Dialogs | `.creator-dialog`, `.book-search-dialog`, `.dialog-heading` | Raised parchment, gold line, dark backdrop; native focus and existing chaining/history |
| Folio | `.sheet`, `.folio-section`, `.folio-list` | Compact quantities/totals and static centred crest; bounded desktop scroll, phone page flow |
| Tracker | `.tracker-boxes` | Small squares with unchanged XP grouping and limits |

Use roles such as `--color-paper-raised`, `--color-on-leather`, `--color-crimson`, `--color-on-crimson`, `--color-line` and `--color-focus`. Career-level roles retain L1–L4 text, red/green/grey/gold accents and dashed future availability. Legacy remains selective and separate.

Dense rules/controls use `--font-body`; headings use the readable serif `--font-heading`; `--font-caps` is limited to labels, ornament and folio names; Gothic `--font-banner` is reserved for the masthead. Fonts load locally. Ornament must not inflate purchase rows.

## Layout, motion and assets

Desktop joins a 210px rail, flexible parchment and 310px folio (350px from 1500px) within 1700px. Tablet puts the folio beneath the main leaf. Phone retains the step selector, condensed expandable folio and fixed XP/coin strip. Long names wrap. Preserve essential fields, purchase reasons and source/Legacy access. Clip header art separately so search results can extend over the workspace.

Initials use a fixed line-height-one box, grid centring and a small optical correction; no baseline-dependent padding. The folio crest also uses grid centring with inset space. Characteristic badges reserve equal space.

Ash/mist stay in the banner; low-opacity candlelight stays at leather edges. The parchment, rules and controls do not move. Pause/Enable persists a separate presentation preference (`wfrp-ledger-design-motion`), never a character field. System reduced motion overrides it and explains the setting. No sound, glints, entrance animations or continuous button effects. Colour transitions last 160ms; reduced motion disables them. Print removes decorations and uses plain ink/paper.

The banner is the preview's original imagegen artwork, copied without pixel changes; prompt/provenance remains in `design-previews/assets/README.md`. The W is native vector code. `scripts/generate-icons.py` rasterises its canonical path/gradient and token palette for PWA icons without requiring a Windows font. Regenerate icons after emblem/icon-palette changes. The W remains within the maskable safe area.

## Maintenance and release

Update this document and affected feature docs in the same change. Inspect setup, all eight steps and reference dialogs on desktop/phone; verify hover/disabled/focus contrast, no horizontal page overflow, heading accessibility and independent motion state. Run `npm run check:release` after final styles/assets so offline caching covers art, fonts, skin, component module, guide and icons. Preserve PDF/export tests. Commit locally; the user pushes/deploys.
