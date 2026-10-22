# Imperial Desk: implementation and continuing design contract

22 October 2026. **Approved design implemented; local acceptance completed with the host limitations below.** The user chose study A with weathered parchment and then specified wood panelling instead of leather. This document fixes that target, the behavior to preserve, the implementation sequence and the evidence required before completion. The tracker below records actual implementation and verification evidence.

Read this before changing the shared shell or adding UI to any of the four workspaces. During this migration it takes precedence over older geometry, material and menu-placement instructions where explicitly changed below. Game rules, source policy, calculations, persistence, confirmation protections and print content remain governed by their existing specifications. Later explicit user instructions take precedence; record any resulting change here rather than quietly creating a second design.

## 1. Approved direction and scope

The reference is **A · Imperial Desk / Weathered**, now using the existing tavern-oak asset. The layout stays clean; materials provide the rustic character. Use one 296px wood-panelled menu, aged parchment, dark ink, tarnished brass, restrained engraving and the existing heraldic emblem. Keep the same design language in desktop navigation, compact menus, dialogs, controls and working pages.

The deliverable is the shared application shell **and** a coherent treatment of the existing editor components. Restyling the sidebar alone is insufficient. Preserve the purpose of each workspace:

| Workspace | Existing route | Purpose that remains |
| --- | --- | --- |
| Player character | `/` | Guided creation, eight pages, six required readiness stages, Experience and Review |
| NPC & creature | `/bestiary/` | Four-page workshop with printed foundations, optional customisation and sheet/card exports |
| Marijan Mode | `/marijan/` | Unrestricted one-page editor with section navigation and manual overrides |
| Character manager | `/manager/` | Independent library and Play / Advance / Journal with recorded resources and advancement |

No folio returns. No new account, cloud sync, library for a creator, game mechanic, save schema, content wording or PDF redesign is included. Keep the existing route compatibility documents, legal links, installation service and offline support. Do not import the prototype's hardcoded characters, scores, claims of readiness or inert button behavior into production.

## 2. Baseline and explicit changes

The baseline is the live code after folio removal (`af386b7`), with the three standalone studies introduced in `4262a4e` and rustic refinement in `e92b278`. Subsequent unrelated work must be preserved. Record the actual starting HEAD in the implementation checklist before editing.

| Area | Current implementation | Target decision |
| --- | --- | --- |
| Menu | Per-mode 230px rail structures and permanent 2×2 mode links | One shared 296px menu with a labelled workspace switcher |
| Materials | Player oak, Bestiary masonry, Marijan vellum, manager canvas | Same dark oak panelling and parchment system across all four; mode accents/art remain |
| Compact boundary | Shared JavaScript query at 1000px | 1100px everywhere the application shell changes; feature breakpoints stay independent |
| File tools | Mixed creator buttons; manager already groups actions | Shared New & import, Save & export, More structure, using real capabilities |
| Manager destinations | Horizontal desktop controls and phone bottom navigation | Desktop destinations in the shared menu; phone destinations stay in the bottom bar |
| Marijan sections | Desktop links and compact Jump selector | Shared desktop section rows; compact native Jump selector retained |
| Main content | Different outer frames, headings and several CSS overrides | Shared page geometry, typography, controls and feedback with content-specific inner layouts |

Keep the existing per-mode masthead titles (The Character Ledger, The Bestiary Workshop, Marijan Mode, The Field Ledger), artwork and Marijan's oxblood title plaque. Standardise their geometry and controls. The prototype's single masthead text is illustrative, not an instruction to remove the existing names.

## 3. Non-negotiable behavior

1. Navigation, menu expansion, search, filters and responsive layout never edit a character, create Undo entries, clear Redo, award XP, roll dice or write manager audit entries.
2. Each creator retains its own store, catalogue context, document identity, save keys and bounded history. Manager records remain independently revision-checked in IndexedDB. No shared mutable character context is introduced by the shell.
3. Typing, blur, purchase, removal, Undo/Redo, import, replacement and export keep their current command boundaries. A visual grouping must not combine two commands or split one edit into several.
4. Preserve deliberate blank numeric buffers and existing validation. Opening a menu must not coerce an empty field to zero, silently discard text, repeat a purchase or apply an unreviewed rule.
5. Existing unsaved profile/journal protection, replacement confirmations, destructive confirmations, conflict recovery and exportable unsaved copies remain. Autosaved ordinary navigation does not acquire new confirmation dialogs.
6. Source/Legacy access stays separate from disclosure toggles. Description switches retain names/ratings/ranks and their existing save/Undo/export behavior, with no On/Off text.
7. Book selection, catalogue eligibility, dependent trapping filters, search reset rules, manager permissions and export gates remain real calculations, not shell-derived guesses.
8. Same-mode route changes and switching modes retain the existing draft/session behavior. No responsive branch remounts an editor, replaces a store or resets its filters.
9. UI material never enters generated PDFs. Preserve all 556 editable sheet fields, complete creation records, all Bestiary Gear and existing measured card packing.

## 4. Shell geometry and scrolling

| Token / behavior | Target |
| --- | --- |
| Desktop menu width | 296px, including its border and padding; no per-mode override |
| Desktop outer gutter | Existing 16–40px bounded fluid gutter, shared with the masthead |
| Desktop masthead | Shared 80px nominal height; allow deliberate reflow for enlarged text rather than clipping |
| Compact masthead | 70–80px nominal; Menu before Search in visual and keyboard order |
| Menu rows | 44px minimum; labels may wrap and increase row height |
| Main padding | 32px desktop, 24px intermediate, 16px narrow; shared tokens |
| Section rhythm | 8px within related controls, 16px between rows/groups, 24–32px between sections |
| Main surface | Fills the remaining width; no capped workspace or reserved right-hand column |
| Reading measure | Supporting prose approximately 70–75ch; forms, tables and catalogues may use available width |

The desktop rail and editor share a joined boundary, without independent card margins or a floating right summary. Content-specific framed cards remain inside the manager's Play sheet. The main page scrolls normally; do not give the editor an independent viewport-height scrollbar.

The sidebar must not stretch to the height of a long editor and push actions several screens below its navigation. Its own content determines the action placement. On sufficiently tall desktop windows (initial target: height ≥880px) it may stay sticky at 16px; its entire control set must fit. Shorter windows use normal page flow. If enlarged text makes the tall-window layout exceed its available space, fall back to page flow; verify the result before choosing any observer. Do not introduce a nested desktop navigation scrollbar to hide overflow. The wood frame can continue below the menu independently of the control box.

The masthead is not a second fixed toolbar. No new sticky title/tabs compete with it. Define `scroll-margin` for in-page destinations and error targets. Opening a disclosure or menu must not cause an unrelated page jump. Returning from a dialog restores focus without forcing the page to the top.

At 200%/400% zoom, CSS viewport width determines compact behavior. Never calculate layout from physical screen pixels, device type or browser user-agent strings.

## 5. Materials, colours and typography

### Material ownership

Use `public/assets/panel-textures/tavern-wood.svg` (384×768, existing Subtle strength) across all four application menus and compact drawers. Use a common dark oak base; the mode does not select masonry, leather or canvas for the new shell. Carved/bevelled inset rules and small brass details replace leather stitching. Keep the latest aged paper, darkened margins, punched binding seam, faint heraldic ink stamp and restrained engraved ornament.

The current prototype sources are `design-previews/unified-parchment.svg`, `unified-ornament.svg` and `unified-rustic.css`. During implementation, promote the selected assets into a dedicated, documented production asset folder and central tokens. Preserve originals and provenance. Evaluate static rasterisation of deterministic SVG noise if profiling shows expensive repainting; do not add live filters or noise overlays to the whole application. Do not increase wood opacity by accident when combining an already attenuated asset with blending.

Weathering is strongest at the outer margins. Tables, small numbers, input interiors and long descriptions need a quieter raised-paper surface. Decoration must be pointer-inert, excluded from accessibility names and print, remain below content and avoid negative stacking outside a deliberate isolated surface. No rotation of actual text, fields, click targets or tables. No torn-edge clipping of a focus ring or popup.

### Semantic palette

Use the existing semantic-token system rather than copying prototype selectors. Starting values:

| Role | Value / treatment |
| --- | --- |
| Wood base / recess | `#2b251f` / `#201c17` |
| Aged paper / raised paper | `#eddfbf` / `#f7edda` |
| Ink / supporting ink | `#352b20` / `#604b33` |
| Brass / paper line | `#c4a36b` / `#c6b08b` |
| Focus on paper / wood | Dark brown `#754921` / light brass, verified against the actual surface |
| Player primary | Existing oxblood family |
| Bestiary primary | Existing muted cobalt family |
| Marijan primary | Existing ash/oxblood family |
| Manager primary | Existing olive/sage family |

These are design starting values, not a claim of measured contrast on every composited texture. Verify 4.5:1 normal text, 3:1 large text and visible control/focus boundaries on actual rendered backgrounds. Adjust the semantic role centrally if needed. Error, warning, success and Legacy meanings stay independent of the mode's primary colour. Do not use blue errors in Bestiary or green success purely because the manager is olive.

### Type and ornament

Use existing local fonts. Ledger Display belongs in mastheads and one restrained decorative chapter initial; Ledger Text belongs in page/section headings; Segoe UI/system UI belongs in labels, navigation, values and rules. Body 14–16px, supporting text ≥12px, phone text inputs ≥16px. Page title approximately 34–36px desktop / 30–32px phone; section title 23–24px. No viewport-scaled preview typography.

One page-level `h1` per workspace destination; ordered `h2`/`h3` sections. A decorative initial must not duplicate or remove the accessible name. Long creator Review names wrap completely. The manager keeps its existing ellipsis/full-title/editing behavior for character headings and library rows. Sidebar labels wrap; never silently abbreviate them.

Selected navigation uses fill, a brass leading marker and weight, with `aria-current`; it is not conveyed by colour alone. Icon boxes are 20px, stroke treatment consistent. Every icon-only control has a meaningful accessible label. Ornamental Gothic text is not used for dense controls or numbers.

## 6. Information architecture and command inventory

The menu order is fixed: workspace switcher; local navigation/context; New & import; Save & export; More; history/save state. Character library is the manager's prominent first local destination. Only real sequential creator steps have numbers. Decorative group labels do not become false progress steps.

| Workspace | Local navigation | New & import | Save & export | More / contextual tools |
| --- | --- | --- | --- | --- |
| Player | Existing eight page names; six required readiness stages | New character; load Player JSON with existing validation/replacement behavior | Download Player JSON; sheet PDF; creation/XP record; existing PDF options remain in Review | Choose books; Sources & decisions; Install when eligible |
| Bestiary | Starting profile; Customise; Equipment & magic; Review & export | New NPC/creature; load GM JSON with existing preview/confirmation | Download GM JSON; full sheet; A4 table cards using the existing batch dialog | Profile/template books shortcut to its real controls; source/discrepancy access; Install when eligible |
| Marijan | Existing one-page section names and anchors | New character; load named/current saves; copy Player; existing generation preview | Download JSON backup; existing Save character/named-save behavior; editable PDF | Actual supported editor tools and Install; no invented book-selection screen |
| Manager | Character library, then Play / Advance / Journal when a record is open | Existing blank/import tools; creator imports and library restore remain previewed | Character JSON/PDF; complete-library backup/restore | Existing profile/Adjust sheet/duplicate/favourite/archive/delete tools; Install when eligible |

Resolve the exact inventory from current callbacks before migration; the table describes destinations, not permission to invent handlers. Marijan's current Save character calls the local named-save handler **and** downloads a JSON backup; preserve both behaviors and its storage-failure message. Its separate Download JSON backup remains a download, not a local-library write. Restore library belongs to the existing manager workflow and may be linked from its current grouped dialog without duplicating its transaction implementation.

Absent capabilities are omitted, not shown as dead sample actions. When there is no current character, record-specific manager tools are absent or unavailable with a clear reason; library backup/import remains accessible. Creator export blockers keep links to the actual missing choices. A file action outside Review must navigate to the existing gated destination or use its existing captured snapshot; it cannot bypass validation by calling a raw exporter.

Global Search the books remains in the header for all four modes. Keep the shared lazy reader, filters, source chaining and per-open search behavior. Local Find a Career / profile / equipment controls stay local. Reading a reference never enables a book or grants an option. Install retains the singleton PWA service and only appears when eligible.

## 7. Responsive contract

Use `COMPACT_SHELL_QUERY` as the JavaScript authority, changing it to `(max-width: 1100px)` in the same change as every matching shell media query and consumer. Add regression coverage at **1099 / 1100 / 1101px**. Feature thresholds remain independent: the manager's phone collapse policy, reference reader's filter layout and Marijan's editor-container columns do not all become 1100px.

| Width/state | Navigation and actions |
| --- | --- |
| >1100px | Visible wood menu; one desktop local-navigation tree; history/save in its footer; no compact launcher/bar duplicates |
| ≤1100px | Menu and Search in the header; same ordered menu inside a native modal drawer; editor fills the width |
| Player compact | Existing native page selector below header; bottom history and actual remaining XP/coin |
| Bestiary compact | Existing native workshop-page selector; bottom history and actual readiness/status |
| Marijan compact | Existing native Jump to section; bottom history and character name |
| Manager compact, record open | Existing Play / Advance / Journal bottom destinations; history and library/actions in the menu |
| Manager compact, library | Library remains reachable; no fake selected Play state or meaningless disabled character resources |

Desktop Manager Play/Advance/Journal moves into the sidebar; remove the redundant desktop horizontal destination strip. The compact bottom destinations and menu entries may both provide the same routes, but their active state and callbacks come from one model. Marijan remains a one-page editor: its rows and Jump selector open/focus real sections rather than replacing it with new pages.

Compact menu width is `min(340px, viewport minus 24px)` with safe-area-aware positioning. At least 44px touch controls, 16px narrow editor gutters and 16px phone text inputs. The native dialog may scroll inside a bounded `dvh` height; keep Close reachable. Never lock the page when the menu is closed. No swipe-only behavior or icon-only collapsed desktop rail.

Fixed bottom bars use measured/token-owned height plus safe-area padding. Add an equal content inset so final rows and focused fields remain reachable. Toasts clear that height and do not capture taps. The software keyboard may change viewport height; it must not cover the focused field or trap the page. Do not guess keyboard state from user-agent strings.

On resize with an open drawer: close the drawer without discarding a feature-dialog draft; clear scroll lock; restore focus to the equivalent visible control if the launcher disappeared. A feature dialog remains open and adapts. Resize never replaces the editor or duplicates file inputs, action listeners, history groups, search launchers or install buttons.

## 8. Interaction and focus contract

### Workspace switcher

Use native disclosure semantics with a labelled summary and four real route links in fixed order. Do not set `role=menu` unless its full keyboard contract is implemented. Current workspace has an explicit indicator; links retain normal browser modified-click behavior and verification query handling. Opening it does not navigate. Escape closes only the innermost disclosure and returns focus to its summary. When it is inside the drawer, prevent that same Escape from also dismissing the drawer.

An outside click closes the switcher without changing selection. Choosing the current workspace is a no-op. Navigating to another workspace keeps existing draft persistence and manager update guards. A pending profile/journal draft receives its existing discard protection; ordinary saved navigation does not gain a new warning.

### Drawer and dialog transitions

Native `dialog.showModal()` supplies modal focus containment. Record the real launcher. Initial focus goes to Close or the first purposeful field; do not autofocus a text field in the navigation drawer and summon the phone keyboard. Escape/backdrop uses the dialog's existing cancel policy; busy non-cancellable operations and unsaved drafts keep their protections.

The current CreatorMenu closes after **any** button click. Replace that generic interception with explicit command outcomes. A workspace disclosure, history arrow, Retry or status action must not inadvertently close the menu. Each command specifies `stay`, `close`, `replace-with-dialog`, `navigate` or `native-file-picker` behavior.

| Transition | Required result |
| --- | --- |
| Closed → drawer | One dialog opens; body scroll is locked only while modal; focus enters navigation |
| Drawer → workspace disclosure | Drawer stays open; disclosure expands without triggering navigation |
| Drawer → action group | Parent closes before the action-group dialog opens; focus does not flash into the page |
| Group → feature/import/confirmation | Preserve the original launcher chain and existing feature owner/draft; never keep two competing top-level application dialogs active |
| Back / Cancel from a child | Restore its parent group when applicable, focus the originating row, and preserve the existing preview/dirty-state rules |
| Close group | Focus the visible original group launcher; if compact navigation was replaced, focus the Menu launcher |
| File chooser cancelled | No state edit, no false success; focus returns to the still-valid command; input stays mounted |
| Successful download | No character mutation or Undo entry; retain a useful focus target and honest completion/failure status |
| Async failure | Keep actionable error and Retry near the initiating action; permit recovery without losing fields |

Use close events/controlled transitions, not arbitrary delays, to sequence native dialogs. File chooser activation must happen synchronously inside a trusted click; do not await a drawer animation before calling its file input. Root-owned hidden inputs must not unmount when the menu closes. Cancelled or late file reads cannot overwrite a newer draft or the wrong manager record.

No global blur/render hack. Stable React keys preserve disclosure and field identity. Keyboard-initiated navigation is immediate. Hover exists only under `(hover:hover) and (pointer:fine)`; focus and press feedback remain independent. Colours may transition approximately 140–160ms. No moving rows, spring menus, glints, sound or animated texture. Preserve existing banner reduced-motion behavior; do not add new continuous effects.

### Page navigation and scrolling

Creators use their existing page commands and readiness links. Selecting a new page places/focuses its primary heading without an accidental second scroll. Same-page selection is a no-op. In-page Marijan links open enclosing disclosures, scroll to the section and focus its heading. Manager routes retain real URL/Back/Forward behavior, character identity and view parameters. Do not create a parallel shell history that fights browser history.

Temporary reference search retains its current query/filter/list-position rules. An issue link opens/focuses the real destination and retains field-level validation. Closing any dialog restores focus without losing the user's previous choice position. If a launcher has been removed, use the documented parent/heading fallback; never focus a detached or hidden node.

## 9. Shared component and control vocabulary

Build the smallest common primitives around existing React controls. Names below are proposed implementation boundaries, not existing files or an instruction to create empty abstractions.

| Boundary | Responsibility | Must not own |
| --- | --- | --- |
| CreatorFrame | Existing masthead, palette/art context, search slots, skip link and legal footer | Character storage or a second PDF/search runtime |
| WorkspaceShell | Shared rail/editor geometry, compact slots and responsive lifecycle | Per-mode rule decisions |
| WorkspaceSwitcher / WorkspaceNavigation | Real mode routes; shared local navigation row presentation | Store mutations or fabricated completion state |
| WorkspaceActions | Typed capability/action definitions and shared grouped launchers | Copies of import/export logic |
| Menu/dialog transition coordinator | Open state, close sequencing and focus-return chain | Feature form data or global character state |
| HistoryControls / SaveIndicator | Shared presentation of actual mode history/save states | A second history stack or optimistic claims of persistence |
| PageHeader / SectionHeader | Shared title, context, actions and heading hierarchy | A new folio or duplicate resource strip |
| Native fields / AsyncActionButton / disclosures | Existing editing buffers, intent, busy/retry and stable identities | Game rules or repeated DOM event handlers |

Use native links for route navigation, native buttons for actions and proper labels for fields. Real tab interfaces need tablist/tabpanel semantics and arrow-key behavior; do not add tabs merely to mimic the prototype's segmented controls. Native selects remain suitable for bounded choices. Shared disclosure summaries contain only toggle text and noninteractive metadata; put source buttons, switches, rank fields and Remove beside or below them.

One primary action per local task. Secondary and text actions remain visibly subordinate. Empty sections name what is missing and offer a relevant existing action. Destructive actions use a clear label, distinct placement and existing confirmation. An unavailable action explains why; it is not merely a low-opacity mystery.

Use row/grid classes shared across characteristic/Skill advancement, score displays, equipment quantities and ability controls. Do not fix one mode by adding a new global `button` or `input` override. Keep table headers associated, numbers aligned/tabular, unknown values visible and overflow horizontally contained only where a real table needs it. Long names wrap or use the documented manager ellipsis policy; no hidden mechanical text to make a card fit.

Dense mobile controls may look compact inside a 44px touch target. Check actual sibling geometry for overlap; a page without horizontal overflow can still have colliding labels/buttons. Use 8px separation for neighboring standalone controls. Checkboxes/switches support whole-label tapping and have independent accessible names; keep the existing small Bestiary Description tracks.

## 10. State, persistence, loading and recovery

Model menu/view state separately from character data. Do not serialize open drawers, current filters, shell width or prototype Finish choices with a character. Only previously supported document/navigation fields remain in the current formats. There is no production material selector: wood/parchment is the selected application design.

Use the live store's save state: Saving, Saved on this device, Unsaved changes, Could not save. Show one routine save indicator in the visible shell; do not repeat it in the character heading and sidebar. Remove duplicates only after the new indicator reads the correct persistence source. Persistent conflict/recovery notices remain prominent in the working page and keep their export/retry actions; they are not downgraded to a disappearing toast. Do not show Saved before a write succeeds.

One visible history group: desktop menu footer; creator compact bottom strip; manager compact menu. Actual `canUndo/canRedo` drives disabled states. Navigation is never an edit. Existing dice audit retention, grouped typing, per-document/per-character histories and stale-operation epochs remain intact.

Loading shells must not flash the wrong palette or expose nonfunctional menu actions before their store is ready. Keep initial theme CSS server-renderable; do not introduce hydration-dependent width markup that mismatches the server. The compact state may update after mount, but no character content is thrown away during that update. Failure states keep the same surrounding geometry and a purposeful Retry.

Imports and exports retain captured snapshots and validation. Manager multi-tab conflicts remain revision-checked and exportable. PWA update activation still waits on mounted/departed pending stores; the redesign cannot turn a conflict into a reload. Search and PDF modules stay lazy. Install remains the existing singleton service, not one new service per menu instance.

## 11. Implementation sequence and checkpoints

Do not migrate all four editors and rewrite their rules at once. Keep each stage reviewable and update this tracker in its implementation commit. Local commits are required; pushing/deployment remains separately authorised.

| Phase | Work | Exit evidence | Status |
| --- | --- | --- | --- |
| 0 · Baseline | Record starting HEAD, current screenshots, real action inventories, critical flows and test results | Baseline fixtures and genuine existing failures documented; no personal drafts touched | Complete · HEAD 9b15415; 568/568 unit, 336 browser passed / 6 existing skips; isolated verification contexts |
| 1 · Foundations | Promote selected materials, define semantic shell tokens, update component specimen with states | Four-mode visual board at desktop/phone; contrast and asset/print checks | Complete · shared tokens; original SVG sources; static 9,254-byte parchment WebP; real-style component reference |
| 2 · Shared shell | Implement geometry, navigation model, switcher, drawer and transition/focus contract behind mode adapters | All four modes use the same shell; 1100px boundary, no duplicates/remounts | Complete · WorkspaceMenu/ModeNavigation in all four; 296px / 1100px; one active navigation; measured optional sticky rail |
| 3 · Actions and state | Wire real grouped commands, history, status, imports/exports/install and recovery | Capability matrix matches runtime; file-picker/dialog/async-failure cases pass | Complete · typed capability adapters; explicit effects; stable file inputs; child cancellation/file-cancel/resize focus checks; existing stores retained |
| 4 · Editors | Align headers/tabs/rows/inputs/feedback; preserve manager sheet and one-page Marijan semantics | Representative long/empty/complete pages verified; no calculations or rule changes | Complete · shared paper/type/headers/controls; existing content grids retained; no rule/schema/PDF changes |
| 5 · Remove superseded UI | Delete old rails/duplicate navigation/overrides and stale selectors, update docs/specimen | No parallel shell or unused action handlers; current docs describe actual completion state | Complete · copied rails/tool lists and Player switch wrapper removed; legacy menu styling removed; current guides/specimen updated |
| 6 · Acceptance | Complete outcome matrix below, static export/offline checks and final screenshots | All relevant failures resolved or explicitly reported; actual phone review requested if unavailable | Complete · 348 production cases passed / 6 existing skips, 15 tablet, 9 WebKit shell, 20 development; PDF/visual review; Firefox and hardware limits recorded |

The shell adapters may be introduced one mode at a time within a phase, but the 1100px query change and shared controls must not leave a finished build with mutually incompatible layout assumptions. Keep unfinished work in local commits/checkout until the four-mode phase boundary is sound. Do not add a public feature flag or theme chooser merely to hide an incomplete migration.

## 12. Verification and acceptance matrix

Use isolated `?verify=1` contexts and synthetic drafts, never personal storage. Extend existing browser fixtures instead of maintaining a second implementation of production markup. Assertions should check outcomes, focus and geometry, not only class names or screenshots.

| ID | Scenario | Required outcome |
| --- | --- | --- |
| U01 | All four routes, direct load and client navigation | Correct theme/art/menu, one main heading, no hydration/console errors |
| U02 | 1099 / 1100 / 1101px and repeated resize | Exactly one active shell/navigation/history/search/install placement; editor stays mounted |
| U03 | Open switcher inside drawer; press Escape | Only switcher closes first; focus returns to summary; next Escape closes drawer |
| U04 | Group → child → cancel/back/close, keyboard and pointer | Native modal order and original-launcher focus chain are correct; no focus flash or stale overlay |
| U05 | Open drawer/feature dialog then resize/orient/zoom | No scroll-lock leak, hidden focus, lost form or duplicate dialog |
| U06 | Cancel a file chooser; reject malformed/wrong-mode file | Draft/history unchanged; meaningful error and valid focus; picker can reopen |
| U07 | Valid load/replace; async result arrives after edit/navigation/replacement | Existing preview/confirmation applies; stale results cannot overwrite a newer draft/record |
| U08 | New, copy Player, generate, Undo/Redo | Each existing workflow and save format preserved; no cross-mode edits |
| U09 | Buy/edit/remove, grouped typing, Undo/Redo after browsing | Exact values, money, ledger, audit and Redo semantics remain; navigation creates no edit |
| U10 | Blank/multi-digit/negative/very large numeric entry; navigate/open menu | Editing buffers and validation remain; no reset to zero or duplicated purchase |
| U11 | Creator incomplete/empty draft, no Species/Career/profile | Navigation remains usable; structured issue links and export gates remain honest |
| U12 | Manager library without record; archived/favourite/long names | Correct available tools and active navigation; no invented current character/Play state |
| U13 | Manager Play/Advance/Journal and browser Back/Forward | URL/view/character restored; profile/journal draft guards and section state preserved |
| U14 | Manager per-character history, second-tab conflict, rejected write | No optimistic Saved claim or lost changes; recovery/export and update guards remain |
| U15 | Player/GM/Marijan downloads and manager backup/restore | Existing JSON/PDF contents, validation and snapshots preserved; no new print texture |
| U16 | Bestiary full sheet and flexible/four/six A4 cards | Gear/armour/loot, ability description preferences and measured overflow unchanged |
| U17 | Four-mode reference search, dependent trapping filters and chained return | Same corpus and matching, correct resets/list position; no grants or source changes |
| U18 | Marijan Jump and desktop section navigation | Real disclosures open; heading focuses; no artificial page replacement or history edit |
| U19 | 320 / 360 / 390 / 430 / 768 / 1024px; coarse pointers | No horizontal page overflow, sibling collision, cut labels or inaccessible bottom controls |
| U20 | 1280 / 1440 / 1920 / 2560 / 3840px; short desktop windows | Fluid joined geometry; 296px menu; no empty folio column or hidden tools |
| U21 | 200% / 400% zoom and enlarged text | Readable reflow, long numbers/names intact, no focus or popup clipping |
| U22 | Long/unbreakable names, many entries, empty states | Documented wrap/ellipsis policies, unique headings/keys and stable controls |
| U23 | Tab/Shift+Tab/Enter/Space, tab arrows, skip link | Logical order and visible focus; no interactive child inside a disclosure summary |
| U24 | Ordinary/reduced motion; mouse/touch | Static materials; appropriate hover/press/focus; no sticky hover dependency |
| U25 | Actual composited textured backgrounds | Text/focus/control contrast verified; translucent layers do not obscure values |
| U26 | Phone keyboard, orientation, safe areas | Focused field/final content reachable; bottom bar and drawer remain usable |
| U27 | Loading, failure/retry and repeated activation | One operation, stable control width/focus, persistent actionable failure |
| U28 | Offline launch/navigation/search/export and eligible install | All selected assets versioned; singleton services and existing update lifecycle preserved |
| U29 | Ordinary app print and generated PDF review | Wood/aging/decoration absent from print; original PDF fields/layout/content unchanged |
| U30 | New UI contribution after migration | Uses shared tokens/primitives and records a deliberate exception if one is required |

Run checks proportional to each phase, then the complete local release boundary for the final shared refactor: build/content validation, module/type checks, stores and Node suites, generated assets, formatting, production desktop/mobile browser suites, tablet, development React diagnostics and offline checks. Follow `docs/TESTING.md`; the known CRLF checkout may require the documented `--end-of-line auto` formatting invocation. Record actual command results/counts, not historical counts or an assumed pass. No GitHub CI is added.

Automate the behavior regressions above where reliable. Visually inspect the four mode pages, empty/loading/error states, menu groups, drawer and long-data cases. Inspect representative real PDFs even though their layout is not intentionally changed. Chromium emulation is not hardware certification: target a real phone/browser before claiming mobile completion, and use existing cross-browser infrastructure for Safari/WebKit/Firefox-sensitive native dialogs and file activation.

Baseline and final performance checks must confirm that shell/menu activity does not start extra catalogue/PDF downloads, sustained idle work, repeated observers/listeners or expensive continuous texture paints. Record asset weights and first-load differences. Optimise material rendering before weakening text contrast or removing focus feedback. Existing search batches/lazy exports and mode startup behavior remain.

## 13. Keeping the design consistent afterward

1. `src/styles/design-tokens.css` owns semantic colours, materials, typography, spacing, control sizes, radii, focus and the single sidebar width. Shared shell/control styles own appearance. Feature styles own content geometry only. Remove the old conflicting overrides after migration rather than appending another cascade layer.
2. `COMPACT_SHELL_QUERY` and documented CSS boundaries must stay aligned. A component cannot invent a second definition of desktop/compact. Container queries remain appropriate for inner field grids.
3. New navigation and commands join the typed model/capability map. Do not hand-write a fourth copy of the menu or add a special mobile-only action list.
4. Extend the component reference with default, hover/focus, active, disabled, busy, error, empty, long-name and narrow states before introducing a new shared primitive. Keep its actual semantics aligned with production components.
5. Use one icon treatment, naming vocabulary and status pattern. Do not add book-specific visual themes, one-off materials, random control radii or a new font for an isolated feature.
6. A deliberate exception records its reason, owning component, mode/scope and regression check here or in the relevant feature specification. A responsive fix is not justification for weakening another mode's fields or data protections.
7. During implementation update this checklist and the current DESIGN-SYSTEM, ARCHITECTURE, CREATOR-UX, UI-UX-IMPLEMENTATION, manager/Bestiary/Marijan specifications, TESTING and component reference as their behavior changes. Mark historical previews as examples; they are not alternate runtime source files.
8. Future shared-UI reviews must verify affected modes, compact and desktop behavior, focus/resize states and screenshot evidence. The outcome IDs above are the reusable review checklist. Never claim there can be no bugs; use these explicit contracts and regressions to prevent and detect drift.

## 14. Inputs, assumptions and remaining user involvement

The design decision is sufficient to begin implementation when the user requests it: **A + shared oak panelling + the latest aged parchment**, with existing mode accents/art and functional workflows. No new artwork, subscription, external account, book file or extra design approval is needed to complete this plan. All defaults and target changes are specified above; use reasonable implementation judgment within them.

For final mobile verification, the user's actual phone model, browser and any enlarged-text/display setting are useful. If hardware is unavailable locally, provide a short real-device check once the working build exists and record that limitation rather than blocking all implementation or claiming emulation is a physical test. Any preference that changes this target can be supplied later and recorded as an amendment.

The subsequent user instruction “Implement it” authorised the production migration. Local commits are required; no new push/deployment is authorised.

## Implementation notes and evidence

- Baseline on 22 October: clean starting HEAD `9b15415`; 568 unit cases passed, 336 browser cases passed with 6 existing skips (342 total). No personal drafts were used. Baseline logs remain in local temporary output. The baseline suite included screenshot-producing checks, but no separate baseline screenshot archive was retained. Final visual evidence is captured separately.
- The shared geometry is implemented by one CSS primitive rather than an extra React `WorkspaceShell` wrapper; existing editor nodes stay owned by their mode. `WorkspaceMenu` is the capability adapter boundary. Existing manager action dialogs retain their guarded nested editors instead of being reimplemented inside a second controller.
- Command `close` means close after successful completion, retaining a visible busy state and retryable failure. `stay` retains the drawer for history. Child cancellation restores its parent; replacement returns to the real editor heading. Native install instructions suspend and restore their parent group.
- The static parchment raster avoids continuous SVG-filter painting across very tall pages. Existing historical materials remain available to standalone studies, but no runtime mode selects them.
- Logical desktop sidebar content may exceed a short window; it remains in normal page flow. Sticky placement is enabled only when the measured full menu fits a viewport of at least 880px. No navigation scroller is introduced.
- A physical phone/browser is not available on this host. Automated coarse-pointer, narrow/enlarged/rotated layouts and native-dialog checks do not certify hardware keyboard or OS picker presentation.

### Final acceptance record — 22 October 2026

- Production Chromium: **348 passed, 6 existing skips** (354 cases, desktop/phone). Final selected-row styling was then rechecked with **18 Chromium menu cases**, **9 WebKit menu cases**, **15 tablet cases** and **20 development rendering cases**, all passing. No retries or suppressed assertions were introduced.
- Build validated 28 packs. Syntax/import checks covered 117 application modules; TypeScript, 13 store cases, 568 Node cases, generated output, formatting (`--end-of-line auto`) and all 108 versioned offline files passed. The final exported cache version is `77752fe8ddf5e8bc029f`.
- All four routes were visually inspected on desktop/phone, including empty library, a loaded manager Play sheet, grouped commands, drawer, long identities and selected navigation. An additional isolated review passed **15 logical widths per mode** (320, 360, 390, 430, 720, 768, 1024, 1099, 1100, 1101, 1280, 1440, 1920, 2560, 3840). The 720/360 layouts model reflow from a 1440px desktop at 200/400%; they do not certify browser/OS enlarged-text settings.
- Actual Player sheet/creation record, Bestiary full sheet/flexible A4, Marijan sheet and manager sheet were downloaded, rendered with Poppler and visually inspected. Original supplied sheet artwork/interactive fields stay intact; added screen aging, binding holes, oak and watermark do not enter generated PDFs. Existing export regressions retain armour/Gear/loot and ability-description checks.
- Sampled composited backgrounds gave paper ink/support contrast **9.23 / 5.49**, oak text/support **6.96 / 4.83**, and paper/oak focus **5.13 / 5.53**. These are recorded samples, not a claim of a complete independent accessibility certification.
- Final local cold-context measurement (no artificial latency): Player 213ms, Bestiary 362ms, Marijan 388ms, manager 439ms to the existing usable criterion, with 19–22 resources and zero console errors. Warm route changes measured 88–344ms. These are local observations, not device guarantees. Baseline lazy-tool tests and final startup tests pass; menu browsing does not fetch PDF tools or create character edits. Added material files total 11,336 bytes, including the archived SVG source; loaded raster/divider total 9,876 bytes. No new continuous work is introduced.
- The broader cross-browser smoke command passed six Chromium/WebKit cases. Two Firefox cases could not launch (`spawn UNKNOWN`), matching the documented host limitation. Dedicated WebKit dialog/escape/focus/file-cancel cases passed separately. A concurrent verification attempt hit Windows `ERR_NO_BUFFER_SPACE` for a stylesheet; the isolated full run passed. This was recorded rather than hidden with test retries.
- Bestiary source/Legacy decisions remain contextual in the editor and its existing Source notes disclosure. More opens the real profile-book selector and install capability; no fabricated all-source dialog was added. Existing manager feature dialogs retain their own dirty-form/focus owner; the shared shell delegates to them.
- Final QA screenshots, PDFs, reflow checks and measurements are under ignored `test-results/imperial-desk/`; logs are temporary local evidence. No personal storage was used, no remote push/deployment was performed, and game rules/document schemas remain unchanged.

Before claiming physical-device certification, check a real phone: open Menu → a group → cancel, type with the on-screen keyboard, rotate with a feature dialog open, undo an edit, and save/export through the OS picker. Check enlarged text/zoom and installation in that browser. Firefox needs a host where its browser binary can start. These are verification limits, not unfinished implementation or a request for another design approval.
