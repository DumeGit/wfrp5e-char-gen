# Black Banner design system — v1

The user selected **C — The Black Banner** on 5 October 2026 and authorised implementation. This is the creator's active design: painted Old World heraldry, dark leather, parchment, muted antique gold and oxblood. Gothic lettering belongs to the masthead; the working interface stays compact and readable. The W uses the approved softened bevel and centred folio placement. Decorative initials are optically centred. There is no logo glint or sound.

The user selected **A — Moonlit Vellum** for the Bestiary Workshop on 7 October 2026. It uses storm-blue framing, pale bone parchment, cobalt actions and muted old gold, drawn from the workshop's undead banner. Player creation retains the original Black Banner palette. The shared Black Banner component/layout system serves both. Historical palette studies remain in `design-previews/bestiary-colours.html`; see [DESIGN-PREVIEWS.md](DESIGN-PREVIEWS.md).

## Ownership

| File | Responsibility |
| --- | --- |
| `dist/design-tokens.css` | Semantic colours, decorative surfaces, typography, spacing, radii, control heights, layout widths and motion durations; local fonts and the approved Moonlit Vellum theme |
| `dist/design-system.css` | Shared component skin, shell, responsive adaptations, print and reduced motion |
| `dist/design-system.mjs` | Escaped accessible chapter headings and shared emblem markup |
| `dist/install-control.mjs` | Reparents the existing install button into the redrawable rail, preserving its listeners and browser state |
| `dist/styles.css`, `workspace.css`, `book-search.css` | Existing feature structure, density and interactions; loaded before the skin |
| `dist/design-system.html` | Live component reference, independent of character data and rules |
| `dist/assets/black-banner/`, `assets/fonts/` | Canonical production art/emblem and local fonts with their SIL Open Font Licenses |

New features reuse semantic tokens and existing controls. Do not copy preview `cqw` sizing, add book-specific palettes, or hardcode another paper/leather/primary colour. Features own their necessary layout; shared appearance belongs in the design system. The GM entry point opts into its approved palette with `data-theme="moonlit-vellum"` on the root HTML element; defaults preserve the player palette. Theme selection is fixed by the entry point, not a saved character setting. Old short variables (`--ink`, `--paper`, `--muted`, `--line`, `--red`, `--green`, `--brass`, `--focus`) are compatibility aliases. The historical `--color-crimson`/`--color-on-crimson` names represent primary actions and chapter accents; they are cobalt/ivory in Moonlit Vellum. Actual errors, success, warning and Legacy retain their separate semantic roles. Historical feature styles remain before the skin, not as another selectable theme.

Decorative paper gradients, title/search veils, rail/folio glows, crest surfaces and shadows have shared token roles. New components inherit these instead of copying preview colours. Active navigation captions/numbers and chapter initials use explicit foreground roles. Moonlit dialogs, search, native fields and mobile controls inherit the same colour palette; its placeholder text and modal backdrop are defined by shared skin rules. The GM theme-colour meta tag matches its navy shell. The PWA's shared icons/manifest remain the overall application identity.

Use `chapterHeading(title)` for the page-level heading and normal h2/h3 for sections. It escapes user names, preserves graphemes, supplies the complete accessible name and hides decorative fragments from assistive technology. `ledgerEmblem()` is decorative, with labelled text nearby. Never interpolate raw user text into HTML.

## Component contract

| Purpose | Reuse | Treatment |
| --- | --- | --- |
| Main action | `.primary` | Oxblood/ivory for players, cobalt/ivory for GM; persistent hover contrast and nearby disabled reasons |
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
| Rolled scores | `.characteristics-table` | Compact rows with abbreviations, names, inline Career badges and editable assignment selectors |
| Starting increases | `.career-starting-increases` | Budget and three labelled point inputs in one desktop strip; compact wrapping on phones |
| Origins | `.origins-editor`, `.origin-input-roll`, `.origin-resources` | Compact desktop fields with adjacent labelled dice actions, suggestion selects and resource strip; 16px field text and 44px touch controls on phones |
| Chosen Career | `.career-roll-controls`, `.chosen-career` | Roll actions/table first, current Career summary below, then search; primary-colour edge uses the shared palette |

Transient status messages must clear their text when their timer expires: the shared `#toast:not(:empty)` style is content-driven, not class-driven. Workshop notifications expire after 4.5 seconds, do not capture pointer events and clear the fixed mobile action bar plus its safe-area inset. Keep persistent actionable errors in the issue panel.

Use roles such as `--color-paper-raised`, `--color-on-leather`, `--color-crimson`, `--color-on-crimson`, `--color-line` and `--color-focus`. Career-level roles retain L1–L4 text, red/green/grey/gold accents and dashed future availability. Legacy remains selective and separate.

Dense rules/controls use `--font-body`; headings use the readable serif `--font-heading`; `--font-caps` is limited to labels, ornament and folio names; Gothic `--font-banner` is reserved for the masthead. Fonts load locally. Ornament must not inflate purchase rows.

## Layout, motion and assets

Desktop joins a 210px rail, flexible parchment and 310px folio (350px from 1500px) within 1700px. Tablet puts the folio beneath the main leaf. Phone retains the step selector, condensed expandable folio and fixed XP/coin strip. Long names wrap. Preserve essential fields, purchase reasons and source/Legacy access. Clip header art separately so search results can extend over the workspace.

The masthead is shortened, with a smaller title/emblem and search ribbon. Install app lives below New character in the rail, and is hidden when installed. Preserve the same button node across redraws so install prompts, help and installed-state listeners survive navigation. The desktop rail uses 40px step rows, a Save/Load pair, full-width New/Install controls and compact utility links. All steps fit normal desktop heights; navigation alone may scroll on short windows. The rail has no extra footer emblem. The folio keeps its separate scrolling behavior.

At widths 761–1000px the decorative search-ribbon captions hide, and the search uses one centred flexible column. This avoids overflowing a small desktop/tablet window while retaining the shared search controller and phone launcher behavior.

Initials use a fixed line-height-one box, grid centring and a small optical correction; no baseline-dependent padding. The folio crest also uses grid centring with inset space. Characteristic badges reserve equal space.

Origins uses scoped spacing rather than shrinking every creator control. Its brief random-roll explanation expands through native details with a stable key; supplement warnings and required choices stay visible. Eye/hair fields share a phone row; names and ambitions stack. Background and ambitions start at 76px and remain resizable. Career rolls and the chosen summary precede the browser on both desktop and phones. Rolled results update browser state without adding search/filter values to character saves.

Ash/mist stay in the banner; low-opacity candlelight stays at leather edges. The parchment, rules and controls do not move. The user removed the creator's Pause/Enable button; motion now follows the system reduced-motion preference through CSS, without a saved app preference. No sound, glints, entrance animations or continuous button effects. Colour transitions last 160ms; reduced motion disables them. Print removes decorations and uses plain ink/paper.

The player banner is the preview's original imagegen artwork, copied without pixel changes; prompt/provenance remains in `design-previews/assets/README.md`. The Bestiary Workshop uses a separate original skeleton-army painting inspired by the user's supplied reference, encoded as a 375,188-byte WebP at full resolution. Its original, final prompt and encoding settings are preserved in [design-assets/bestiary](../design-assets/bestiary/README.md). Workshop CSS selects its image, crop and cool contrast overlay; shared banner dimensions, title/search controls and reduced-motion behavior remain standard. The W is native vector code. `scripts/generate-icons.py` rasterises its canonical path/gradient and token palette for PWA icons without requiring a Windows font. Regenerate icons after emblem/icon-palette changes. The W remains within the maskable safe area.

## Maintenance and release

Gradient action and active-navigation fills have an opaque primary-colour base. Never leave the base transparent when a hover state removes a gradient: the background-colour transition would briefly expose the pale page. Both creator palettes use the same fix and retain their readable hover foregrounds.

GM template previews use the compiled grants in separate Characteristics, Skills, Talents and optional Magic sections. Bonuses and ranks align to the right; long alternative lists use native disclosures with stable template/slot keys. The two-column desktop summary stacks on phones. The preview remains read-only until Apply template; no grant, choice or calculation is inferred from prose.

Customise starts with a template card above its tabs. Choose template is a prominent primary action beneath the heading, becoming Change template after selection. Remove template is secondary. On phones the primary action fills the row; both controls retain normal 44px touch heights. Keep template choice visibly optional without relegating the action to a small side button. Starting profile has a compact Creation books fieldset; its opt-in checkbox is independent of PC choices. Profiles sort alphabetically and display source and selective Legacy badges. Printed training shows locked existing choices alongside optional additions, using the same accessible checkbox controls and focused issue links.

Update this document and affected feature docs in the same change. Inspect setup, all eight steps and reference dialogs on desktop/phone; verify hover/disabled/focus contrast, no horizontal page overflow, heading accessibility, reduced-motion CSS and install behavior after redraws. Run `npm run check:release` after final styles/assets so offline caching covers art, fonts, skin, component module, guide and icons. Preserve PDF/export tests. Commit locally; the user pushes/deploys.

## Current product scope

The shared design system serves player creation, the separate GM workshop, Marijan Mode and the component reference. `creator-switch.mjs` and `.creator-switch` provide desktop/mobile navigation between independent tools. The workshop uses the same semantic roles, headings, dialogs and controls, with its approved Moonlit Vellum values supplied centrally; `gm/style.css` owns its compact profile/score/stat-block layout and banner image/crop. Desktop folio scrolling, medium-screen flow and phone page navigation remain distinct. The removed NPC runtime/skin has not been restored. See [GM-WORKSHOP.md](GM-WORKSHOP.md).

## Shared book search surfaces

The masthead ribbon opens one large native dialog at every screen size. Desktop has a result list beside a reading pane, using the creator's existing paper, ink, line and accent tokens. At 760 px and below it becomes full-screen, switching between results and references; a Results button at the top avoids a trip to the end of a long reference. The heading/Close stays above the content, with safe-area padding and VisualViewport sizing. Simulated viewports cannot certify real iOS/Android keyboards or OS select menus.

Keep the same input node and listeners in the workspace. On desktop, the query and native Category/Book selectors share one row; inline labelled category-specific filters sit beneath, using the shared 36 px compact control height and tighter toolbar gaps. Keep results and reference typography unchanged. Additional filters expand on phones. Use 16 px phone fields and 44 px controls, with removable chips and Clear filters. Short viewport controls may scroll separately while leaving room for the result list. Result/reader panes scroll independently; the page behind the modal stays fixed. Returning restores filters, batches and scroll, and chaining restores reading position. Rule tables retain local horizontal scrolling.

Results append without replacing existing rows or the field. Load more appears only when IntersectionObserver is unavailable; keyboard arrows append batches directly. Retry stays visible after a loading failure. Source and selective Legacy information remain distinct from the reference text and matching. Do not add creator actions, sound, a new palette or new motion. See [BOOK-SEARCH.md](BOOK-SEARCH.md) for the filter vocabulary and source metadata boundary.

## Marijan Mode

The unrestricted editor uses the existing Black Banner masthead, `.panel` working parchment, `.sheet` leather summary, chapter heading/emblem, primitive labelled fields/buttons, native disclosures and shared reference dialogs. `marijan/style.css` owns only the one-page layout, compact score table, inline entry searches, editable list rows and Auto/Manual controls; it uses existing semantic palette roles. Source/Legacy access stays next to known entries and Species/Career references. Desktop has section links, main paper and sticky summary; intermediate widths put the summary below; phones stack everything with horizontal section links, 16px fields and 44px touch controls. Collection/notes sections can collapse; section navigation opens the destination. No new palette, artwork, sound or motion is added. Creator navigation wraps for all three tools. See [MARIJAN-MODE.md](MARIJAN-MODE.md).
