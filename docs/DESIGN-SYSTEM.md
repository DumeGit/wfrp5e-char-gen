# Imperial Desk design system

The shared production design is **Imperial Desk A: oak panelling and aged parchment**, selected on 22 October 2026. Read the [continuing implementation contract](UNIFIED-DESIGN-IMPLEMENTATION-PLAN.md) before extending any workspace. Earlier Black Banner, Moonlit Vellum, Ash & Vellum and field-ledger studies are historical material directions; their mode artwork and action accents remain.

## Ownership

| Owner | Responsibility |
| --- | --- |
| `src/styles/design-tokens.css` | Shared colours/materials, fonts, spacing, control sizes, focus and 296px rail width; first-paint mode accents |
| `src/styles/workspace-shell.css` | Joined four-mode geometry, oak menu, switcher/navigation, grouped actions, weathered paper and decoration, compact boundary and print exclusion |
| `src/styles/design-system.css`, `interface.css` | Existing shared controls, editing/validation states and keyboard/touch conventions |
| `src/styles/mobile-shell.css` | Compact masthead and creator history/balance strips |
| `src/components/CreatorFrame.tsx` | One masthead, artwork, Menu-before-Search slots, skip link and project footer |
| `src/components/WorkspaceMenu.tsx` | Typed capability groups, single desktop/compact menu, native action dialogs and transition/focus lifecycle |
| `src/components/ModeNavigation.tsx` | Native workspace disclosure with four real route links and ordinary modified-click behavior |
| `src/components/CreatorMenu.tsx` | Native compact drawer, Close/Escape/backdrop and visible focus fallback |
| Mode adapters/stores | Actual navigation, imports, saves, calculations, history and exports; no rule logic belongs in the shell |
| `src/components/PwaControls.tsx` | Singleton install/update service, visible install portal and parent-dialog restoration |
| `src/static/design-system.html` | Component specimen, built into `/design-system.html` using the real shared styles |

Feature styles own editor content grids, never another shell width, material or menu. Reuse the shared menu model instead of writing a separate mobile action list. Proposed component names in the contract are boundaries, not a requirement to create redundant wrappers.

29 October refinements: mark the intended visible menu-navigation destination with `data-workspace-focus`; the shared resolver ignores non-rendered targets and falls back to a visible h1/main. Paper footer notes use `--color-muted`, while dark menu/public status text retains its own roles. Compact book setup shows its transient setup context instead of a saved creation step. Required recording/creation controls precede optional reference disclosures. These operate surfaces add no animation: frequent navigation, validation and data entry respond immediately.

Player Review places **Open in character manager** first as the primary ready-state action, followed by quiet PDF actions. On phones these share the existing full-width action stack. JSON backup remains in its separate reusable-save area. The readiness message explains completion gates and the supporting note explains the independent manager copy and retained draft. Reuse `AsyncActionButton` for disabled/busy/error/retry behavior; no new dialog, skin or motion is needed.

Player and Bestiary use shared `CreatorStepButton` controls: Back on the left, Next on the right. Through 1100px they flank the native page selector and align to its bottom edge; the selector takes the remaining width. On desktop they flank Player stage metadata or the Bestiary page heading. Reuse the quiet-button skin, 84px desktop minimum width, 68px minimum width when both compact controls appear, a 44px target and destination-specific accessible labels. Navigation remains available with unfinished choices; the new heading receives focus and compact navigation stays visible. Back is absent on the first step, Next on Review, and both during book setup or print. Footer navigation remains available. No added animation.

Mobile bottom-bar Undo/Redo targets are 64px wide and 44px high, separated by 8px, across the three creators. The wider shared controls preserve room for Player balances and workshop status; desktop rail sizing remains independent.

Bestiary derived values show Wounds and Toughness Bonus as read-only totals below Size and the optional Wounds override. Changed builds calculate TB automatically; no TB source selector or manual TB field remains. Tiny keeps its focused manual-Wounds recovery.

Selected rule rows contain names, citations and controls, without repeated rule descriptions, conversion paragraphs or generic calculation/reference-for-play captions beneath help. Read-only casting details belong in the reader and output views. Personal/custom descriptions, actual validation and required choices remain visible; Legacy explanations use a labelled action.

Rule-only descriptions open through the shared `RuleReference` ? button beside a name (`RuleName`); no per-rule expand arrow. Use a 32px desktop control and at least 44px on phones/coarse pointers, with the existing button skin, visible focus and a specific Read-name label. Keep native section/specialisation groups and actual editing panels collapsible. Names/parameters/ranks, sources, Legacy information and output Description switches remain distinct. The shared reader restores the opener and can show a reviewed source-only quote without publishing a new search result. No new animation.

Bestiary browser cards use the shared raised paper and one thin border, with 18px Ledger Text names, 12px Size/category/citation metadata and no shadow or ornamental top rule. Use the full card as the Preview button: two compact lines, wrapping complete text, 10px × 12px padding, a 72px desktop baseline and 8px grid gaps; phone rows keep the shared 44px touch minimum while fitting their content. The grid fits 240px-minimum cards into the available editor width; no phone-specific title enlargement. Full mechanics/Legacy stay in Preview.

Bestiary profile search spans the editor width through 1100px, followed by the full-width optional Filters disclosure. Below 600px its Category and Book fields stack; at 600–1100px they share equal columns on one row. Above 1100px all three fields stay alongside one another. Do not place compact filters in a narrow side column beside search.

Starting Talent entries use opaque raised-paper tiles with a uniform 1px dark-brass outline (`--color-paper-raised` / `--color-line-dark`) and semibold names, separating abilities from the textured parchment without borrowing action/status colours. Use a 220px-minimum automatic grid, equal widths and equal track heights, with 8px gaps and the ? aligned on the right. Standard tiles have a 56px minimum, including the outline; native specialisation fields remain visible and expand the whole group’s tracks evenly. Species, rolled, kindred/additional and free Career groups use the same surface and grid. The Career selector and help share one tile; no duplicate name/rule row or all-Talent description disclosure remains. Existing source/Legacy and required choice controls remain available. These static content tiles gain no hover lift or animation.

## Materials and typography

Every mode uses charcoal oak `#2b251f`, recess `#201c17`, parchment `#eddfbf`, raised paper `#f7edda`, ink `#352b20`, muted ink `#604b33`, brass `#c4a36b` and line `#c6b08b`. Mode primary actions remain Player oxblood, Bestiary cobalt, Marijan crimson and manager olive. Errors/success/warnings/Legacy retain separate semantic roles. Historical `--color-leather*` aliases mean shared dark chrome; they do not select a leather material.

The parchment is a seamless 1024px static WebP beneath edge shading. Mottling and age marks must join continuously on both axes, including on wide screens and long pages; no visible rectangular tile boundaries. Use `node scripts/build-parchment.mjs` to preserve the SVG’s stitched noise and validate the encoded edges. Binding holes, watermark, brass rivets and an engraved divider provide character without moving/clipping content. No animated grain, interactive overlay, finish picker or texture in print. Sources, sizes and regeneration: [material provenance](../design-assets/imperial-desk/README.md).

Use local Ledger Display for mastheads and one decorative chapter initial, Ledger Text for page/section headings and system UI text for controls/rules. Page headings are 34–36px desktop / 30–32px phone, section headings around 24px, reading text 14–16px, supporting labels at least 12px, phone inputs 16px. Preserve grapheme-safe accessible chapter headings and complete wrapping Review names; manager names ellipsize with their full title. Use h2/h3 in order.

## Layout and navigation

Shared book search uses the existing native Category/Book selectors and compact filter controls for every reference type. Critical Wounds adds a labelled Hit location selector; Mutations retains Physical/Mental. Their readers use the shared definition fields for location/type and roll range, and book/page citations. Standalone table readers and full-table buttons are removed from search; embedded reference tables such as Skill/Talent Career membership retain their existing format. No new palette, dialog or persistent character setting is introduced.

Injuries uses the same category selector and reference reader, with compact Effects/Healing headings where applicable. Exact severity names in critical wounds open the corresponding injury using normal reference history; all prose and controls retain the shared typography, source links and touch targets.

Diseases reuses the native Reference type filter for Disease, Symptom and Care & treatment. Distinct result labels identify Symptoms and care references. Disease readers use the shared Contraction/Progression headings and compact text fields; exact symptom links use normal reader history, with the disease definition selected ahead of same-name spells only inside disease reading.

Desktop begins at **1101px**; compact includes **1100px**. `COMPACT_SHELL_QUERY` matches CSS. Search's 760px filters, manager's 719px phone sheet and Marijan's container grids are independent feature boundaries. All four use 296px joined rail/editor geometry with fluid 16–40px gutters and no folio. The rail has natural height, with page scrolling and no nested navigation scroller. It pins only on windows at least 880px tall when a measured rail actually fits.

The menu order is workspace switcher → real local navigation/context → **New & import**, **Save & export**, **More** → history/save status. Player keeps eight pages/six readiness stages; Bestiary keeps four; Marijan keeps nine in-page section links and the compact Jump selector; manager keeps Character library and desktop Play/Advance/Journal. Manager compact destinations retain their existing sheet navigation, with a fixed bottom bar on phones.

Compact creators keep their native page selectors outside the drawer and one history group in the bottom strip, including Player XP/coin and Bestiary status. Manager history stays in its menu. Exactly one routine save indicator reads the owning store; manager heading status is removed. Persistent recovery/conflict messages remain in the editor.

## Commands, focus and persistence

Each adapter supplies `WorkspaceActionGroup` / `WorkspaceCommand` capabilities. Command effects are explicit: `stay`, `close` after success, `dialog`, `file` or `navigate`. History and workspace disclosures do not close the drawer. Downloads stay busy until completion, close on success and retain an actionable retry error on failure. File activation happens synchronously in the trusted click with root-owned inputs.

Parent dialogs close before child dialogs open. The coordinator observes only a pending child transition, handles native closure and unmount, and restores the parent command on cancellation. A changed document returns to the editor heading. File cancellation restores its command. Existing manager nested editors/dirty guards keep their own owner and original launcher chain. Install instructions restore their originating group. No arbitrary transition sleeps or global blur/re-render trick.

Escape closes an expanded workspace switcher first, then its drawer. Backdrop dismissal applies only outside actual dialog bounds. Crossing the compact boundary closes the drawer, releases scroll lock and restores a visible desktop fallback; it keeps editor nodes and feature forms. Missing/hidden launchers fall back to Menu or a visible workspace/heading. Shared observers/listeners clean up on departure.

Menu state is ephemeral. It never changes document schemas, enters Undo, combines stores, starts a second search/PDF runtime or replaces the install service. Preserve store guards, grouped typing, numeric editing buffers, dice records, download snapshots, stale-operation checks and manager revisions/conflicts. Marijan Save still both saves locally and downloads JSON; it has no Choose books action. Bestiary books navigate to its real starting-profile disclosure.

## Controls and content

Use native buttons for commands, links for routes, labelled fields and existing tab handlers/semantics. One primary action per local task. Disabled actions have nearby reasons, busy labels retain useful width and retry failures remain visible. Existing cards use raised paper; source links and Legacy badges keep provenance distinct from errors. Unknown values remain explicit.

| Command variant | Action role |
| --- | --- |
| `primary` | Main positive commitment: Save, Apply, Add selected, required starting roll or main ready-state output. |
| `quiet` | Back/Next, Cancel/Close, editor/picker launchers, supporting downloads/retries and repeated Buy/Add row actions. |
| `text-button` | Inline supporting help, clear-filter or history commands. |
| `danger` | Final delete/discard/reset/replacement confirmation. |
| `danger-text` | Compact individual Remove action. |

Use the same roles everywhere. Adapters default to quiet; native submits require an explicit variant. Do not use `secondary` or manager-specific aliases. Shared skins separate role from geometry; use `purchase-button` for purchase layout rather than selecting `.primary`. Disabled variants use opaque neutral paper/muted ink. Tabs, selected navigation, profile/menu choice cards, toggles, reference/source/Legacy controls, history icons and steppers retain dedicated state/shape styles. The [button audit](BUTTON-AUDIT.md) records decisions, exceptions and the generated inventory; `/design-system.html#button-roles` shows command specimens. No additional animation is justified for these frequent actions.

Disclosure summaries contain only their toggle label and noninteractive metadata. Put source/Legacy buttons, ranks, Remove and Description switches beside/below them. Bestiary Description remains a 30×18px track inside a 44px label, with no On/Off text. Optional equipment and Species Skill rows support whole-label tapping. Species Skill selectors and reference buttons sit above the extended label target so they remain independently operable.

Bestiary Skill/Talent/Trait/magic batch pickers use native checkbox labels and fixed selection actions. Skills/Talents retain expandable specialisation groups; Traits retain individual entries, concise rule summaries and parameter editing after addition. Search preserves pending selections; adding commits one history action. Spell/prayer Description switches reuse the Trait/Talent control beside the rule name/help. Magic uses individual checkbox rows with category/source and direct ? help, retaining exact source identities and the existing reader above the pending selection. Spell/prayer editing controls wrap on phones; rules stay in the shared reader.

Dense controls may look small inside 44px targets. Preserve 8px separation for standalone neighbors, readable numeric padding and sibling geometry at 320px/enlarged text. Focus is dark brown on paper and light brass on oak. Hover exists only under `(hover:hover) and (pointer:fine)`; press/focus work independently. No moving rows or new continuous effects. Keep existing reduced-motion mastheads.

Reference search stays lazy, keeps the same query/filter/list-position/chaining rules, and reuses reviewed dependent trapping filters. PDF tools stay lazy and exports keep their existing content/layout. Generated sheets never inherit screen paper textures. The single project footer stays compact.

## Verification and future changes

Use U01–U30 in the continuing contract and the current [testing guide](TESTING.md). `mobile-shell.spec.mjs` covers the exact boundary, single history/menu, nested Escape and downloads; `unified-desk.spec.mjs` covers child cancellation, resize, native file cancellation, stable editor identity, manager empty library, non-mutating menu browsing and print exclusion. Existing domain/browser suites cover calculations, imports, saves, conflicts, history, search and actual PDFs.

Extend the component reference with required default, active, focus, disabled/reason, busy, error, empty, long-name and narrow states. Document deliberate exceptions with their owner and regression. Historical design previews remain examples; they are not production renderers. Chromium emulation is not physical phone certification.
