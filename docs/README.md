# Documentation index and current application state

Reviewed against repository source on **22 October 2026**. This index covers the current tracked guides and their ownership. Private PDF extractions, temporary review copies, dependencies and build output are not product documentation; third-party licence text is preserved verbatim.

## Current application

| Workspace | Route | Purpose and state |
| --- | --- | --- |
| Player | `/` | Guided Fifth Edition creation, eight pages, six readiness stages, selected-book rules, XP purchases and editable PDF/record exports |
| Bestiary Workshop | `/bestiary/` | Four-page NPC/creature creation, reviewed optional foundations/templates, shared catalogue and full/fixed/flexible PDF exports |
| Marijan Mode | `/marijan/` | Unrestricted one-page creation, manual overrides, optional reviewed random generation and independent saves |
| The Field Ledger | `/manager/` | Local character library; Play/Advance/Journal; creator imports, resources, Conditions/afflictions, equipment, XP/Career progression and backups |

The shared Imperial Desk uses a 296px oak menu, aged parchment, a native four-workspace switcher and New & import / Save & export / More action groups. Compact layout includes 1100px. See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) and the [continuing contract](UNIFIED-DESIGN-IMPLEMENTATION-PLAN.md). The shared masthead, four-workspace switch, Menu-before-Search compact controls, notices and native dialogs are common. The three creators retain their rail/editor workflow and mobile Undo/Redo bar with Player balances or workshop status. The manager uses a joined desktop left menu, grouped action dialogs/history and a compact sheet; its phone bottom bar selects Play/Advance/Journal. Its four ability sections and Gear are part of Play, and Skills are plain noninteractive rows in balanced alphabetical vertical columns. See the [manager specification](CHARACTER-MANAGER-REDESIGN-PLAN.md).

Next.js 16.4.2 App Router, React 19.3.1 and TypeScript 5.9.3 provide the static browser interface around the retained JavaScript rules. Node 24.x is required (`.nvmrc`: 24.14.0); use `npm ci`. Only `out/` is deployed. Legal information is at `/legal/`; old gm/marijan/legal `.html` addresses preserve queries/fragments. No account server, cloud synchronization or analytics SDK is included. Creator drafts remain separate; the manager uses revision-checked Dexie/IndexedDB records. The PWA cache stores app assets, not character backups, and updates await manager saves/conflicts even after navigation away.

The installed registry has 20 supplied books / 28 packs including variants. Current counts come from the generated inventories rather than dated test reports. Shared lazy reference search serves all four workspaces independently of creator book selection. All standalone category Rules and NPC/profile/template references are excluded from public search payloads; retained summaries, actual tables and Endeavours do not enable unsupported mechanics. Conditions/injuries/mutations can be recorded in the manager, but effects, recovery, live casting, crafting and companion/business systems remain manual.

## How to read and maintain these files

Current guides describe implemented behavior. Book documents preserve approved conversions, source ambiguities and exclusions; older extraction inventories are labelled separately from current publication. Generated inventories must be rebuilt with `npm run generate:books`, never edited by hand. Historical reports retain their original observations/counts with explicit status notices; they do not certify the current build or represent unresolved work. Asset documents preserve prompts and provenance; notices do not establish rights clearance.

For prose-only changes, check factual source paths, local links and stale claims. For registry/report work, run `npm run check:books`, `npm run check:descriptions` and `npm run check:generated`; update the renderer when generated explanatory text is stale. UI, rule, export and release checks follow [TESTING.md](TESTING.md). Local commits do not authorize a push.

## Current product and maintenance guides

- [Project instructions](../AGENTS.md) — `AGENTS.md`
- [WFRP Character Ledger](../README.md) — `README.md`
- [Application architecture](ARCHITECTURE.md) — `docs/ARCHITECTURE.md`
- [Search the books](BOOK-SEARCH.md) — `docs/BOOK-SEARCH.md`
- [Adding supplied books](BOOKS.md) — `docs/BOOKS.md`
- [Character manager: implemented layout specification](CHARACTER-MANAGER-REDESIGN-PLAN.md) — `docs/CHARACTER-MANAGER-REDESIGN-PLAN.md`
- [Character manager — Imperial field ledger](CHARACTER-MANAGER.md) — `docs/CHARACTER-MANAGER.md`
- [Creator browsing and explanations](CREATOR-UX.md) — `docs/CREATOR-UX.md`
- [Description editorial review — 16 October 2026](DESCRIPTION-REVIEW.md) — `docs/DESCRIPTION-REVIEW.md`
- [Canonical descriptions](DESCRIPTIONS.md) — `docs/DESCRIPTIONS.md`
- [Black Banner design system — v1](DESIGN-SYSTEM.md) — `docs/DESIGN-SYSTEM.md`
- [Unified design implementation contract](UNIFIED-DESIGN-IMPLEMENTATION-PLAN.md) — approved A with oak and parchment; detailed target, migration tracker and future consistency rules; implemented common shell; continuing design contract
- [Unified layout studies](UNIFIED-LAYOUT-PROPOSAL.md) — initial comparison and selected visual direction
- [Bestiary Workshop](GM-WORKSHOP.md) — `docs/GM-WORKSHOP.md`
- [Legacy: actual Fifth Edition adaptations](LEGACY.md) — `docs/LEGACY.md`
- [Marijan Mode](MARIJAN-MODE.md) — `docs/MARIJAN-MODE.md`
- [Public identity and notices — 15 October 2026](PUBLIC-NOTICES.md) — `docs/PUBLIC-NOTICES.md`
- [Offline builds, installation and static hosting](PWA.md) — `docs/PWA.md`
- [Local testing](TESTING.md) — `docs/TESTING.md`

## Book integration decisions

- [Archives of the Empire: Volume I](ARCHIVES-I.md) — `docs/ARCHIVES-I.md`
- [Archives of the Empire: Volume II — integration review](ARCHIVES-II.md) — `docs/ARCHIVES-II.md`
- [Archives of the Empire: Volume III](ARCHIVES-III.md) — `docs/ARCHIVES-III.md`
- [The Warband of Bayl of Many Eyes](BAYL-WARBAND.md) — `docs/BAYL-WARBAND.md`
- [Blood and Bramble integration](BLOOD-BRAMBLE.md) — `docs/BLOOD-BRAMBLE.md`
- [The Cluster-Eye Tribe](CLUSTER-EYE.md) — `docs/CLUSTER-EYE.md`
- [The Corsairs of Captain Flariel](CORSAIRS.md) — `docs/CORSAIRS.md`
- [Deft Steps, Light Fingers](DEFT-STEPS.md) — `docs/DEFT-STEPS.md`
- [Dwarf Player’s Guide integration](DWARF-GUIDE.md) — `docs/DWARF-GUIDE.md`
- [High Elf Player’s Guide](HIGH-ELF.md) — `docs/HIGH-ELF.md`
- [Lustria](LUSTRIA.md) — `docs/LUSTRIA.md`
- [The Night Parade](NIGHT-PARADE.md) — `docs/NIGHT-PARADE.md`
- [Rough Nights & Hard Days](ROUGH-NIGHTS.md) — `docs/ROUGH-NIGHTS.md`
- [Salzenmund: City of Salt and Silver](SALZENMUND.md) — `docs/SALZENMUND.md`
- [Sea of Claws](SEA-OF-CLAWS.md) — `docs/SEA-OF-CLAWS.md`
- [Taverns of the Old World](TAVERNS.md) — `docs/TAVERNS.md`
- [Tribes and Tribulations](TRIBES-TRIBULATIONS.md) — `docs/TRIBES-TRIBULATIONS.md`
- [Up in Arms integration](UP-IN-ARMS.md) — `docs/UP-IN-ARMS.md`
- [Winds of Magic](WINDS-OF-MAGIC.md) — `docs/WINDS-OF-MAGIC.md`

## Generated inventories

- [Description coverage](DESCRIPTION-COVERAGE.md) — `docs/DESCRIPTION-COVERAGE.md`
- [GM content inventory](GM-CONTENT.md) — `docs/GM-CONTENT.md`
- [Bestiary trapping groups](TRAPPING-GROUPS.md) — `docs/TRAPPING-GROUPS.md`, regenerated with `node scripts/audit-trapping-groups.mjs`
- [Book inclusion matrix](INCLUSION-MATRIX.md) — `docs/INCLUSION-MATRIX.md`
- [Search coverage](SEARCH-COVERAGE.md) — `docs/SEARCH-COVERAGE.md`

## Historical reports and design studies

- [Interface audit — 28 October 2026](UI-REVIEW-EMIL-2026-10-28.md) — empty-library actions, reference focus return and shared navigation polish
- [Old World visual studies](DESIGN-PREVIEWS.md) — `docs/DESIGN-PREVIEWS.md`
- [Next.js migration implementation plan](NEXTJS-MIGRATION-PLAN.md) — `docs/NEXTJS-MIGRATION-PLAN.md`
- [Next.js migration report](NEXTJS-MIGRATION-REPORT.md) — `docs/NEXTJS-MIGRATION-REPORT.md`
- [Visual and UX QA review — 19 October 2026](QA-REVIEW-2026-10-19.md) — `docs/QA-REVIEW-2026-10-19.md`
- [Mode startup and navigation — 18 October 2026](STARTUP-PERFORMANCE.md) — `docs/STARTUP-PERFORMANCE.md`
- [Focused interface review — 15 October 2026](UI-REVIEW-EMIL-2026-10-15.md) — `docs/UI-REVIEW-EMIL-2026-10-15.md`
- [Shared UI/UX implementation — 10 October 2026](UI-UX-IMPLEMENTATION.md) — `docs/UI-UX-IMPLEMENTATION.md`

## Artwork provenance and third-party notice

- [Bestiary Workshop banner](../design-assets/bestiary/README.md) — `design-assets/bestiary/README.md`
- [Field ledger banner](../design-assets/field-ledger/README.md) — `design-assets/field-ledger/README.md`
- [Marijan Mode banner study — 9 October 2026](../design-assets/marijan/README.md) — `design-assets/marijan/README.md`
- [Selected panel textures](../design-assets/panel-textures/README.md) — `design-assets/panel-textures/README.md`
- [Muster Roll painted banner](../design-previews/assets/README.md) — `design-previews/assets/README.md`
- [MIT License](../public/assets/LICENSE-pdf-lib.md) — `public/assets/LICENSE-pdf-lib.md`
