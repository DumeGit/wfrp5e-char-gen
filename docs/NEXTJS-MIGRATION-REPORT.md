# Next.js migration report

Implemented locally on 18 October 2026 on `codex/nextjs-migration`. This report accompanies the migration commit; use `git log --oneline -- docs/NEXTJS-MIGRATION-REPORT.md` to identify it. No push, deployment or remote hosting setting has been changed.

## Baseline and scope

The starting checkout was clean at `1a279d4`, with three existing local commits above the cached `origin/main` at `9914af7`. Those commits include the latest tablet improvements and the agreed migration plan. The original authored/public `dist/` tree contained 170 files / 26,102,943 bytes. It was extracted before deletion.

All three existing creators are now React screens on Next.js App Router static routes: Player `/`, Bestiary `/bestiary/` and Marijan `/marijan/`. Public notices use `/legal/`. Old `.html` bookmarks preserve queries and fragments through actual exported compatibility documents. The independent component specimen remains at `/design-system.html`.

New React lifecycle, stores and components use TypeScript. The established game engine remains JavaScript under `src/engine/`. Player's existing command/presentation functions were adapted to compose React elements directly behind a typed store interface; they remain JavaScript. This is deliberately not a wholesale rewrite of every game-rule or command module. There is no legacy page mounted inside React, runtime HTML-template parser, duplicate old creator, application server, analytics or new mode.

## Compatibility checklist

| Contract | Implementation and verification |
| --- | --- |
| Authored source separate from output | Routes/components/styles in `src/`, approved assets/generated payloads in `public/`, disposable deployment in `out/`; replaced `dist/` entry points removed |
| Canonical books and wording | Existing registry, aliases, schemas and source checks remain authoritative; private source loader moved into build tooling; all 28 packs validate; generated public data retains its content |
| Independent current saves | Existing keys and distinct formats retained; actual import/export, reload and cross-mode rejection remain covered |
| Independent session histories | Mode-owned stores survive client navigation; grouped typing, undo/redo branches, no-op navigation, retained dice and Player attempt eligibility have store/browser checks |
| One calculation authority | Existing Player, Bestiary and Marijan calculators feed folios/review/exports; no React-specific rule catalogue |
| Safe asynchronous work | Imports, generation and exports capture document identity/revision; stale work is discarded after departure, replacement or a later edit; immutable published snapshots |
| Existing Player screens | Origins, Career, Characteristics, Skills, Talents, equipment, Experience and Review render React elements with native controls and retained supplement handlers |
| Bestiary | Profile/template pickers, explicit choices, appearance, customisation, equipment/magic, review, compact PDF and table cards use native React sections/dialogs |
| Marijan | Editable lists, custom entries, direct numeric values/overrides, generation, named saves, Player copying and PDF use native React sections/dialogs |
| Shared search | Native React filters/results/reader, canonical descriptions, chaining/Back, Career tables, real module worker and fallback; no main HTML injection |
| Shared interface | Existing themes/materials, responsive breakpoint at 1000/1001px, native disclosures/dialogs, keyboard focus, history controls, public notices and lazy PDF runtime retained |
| Offline and installation | Final-output inventory includes HTML/router payloads/chunks/data/PDF; root lifecycle service, one install control, explicit safe updates, bounded cache retention |
| Hosting | Same project root; local Vercel configuration builds and publishes `out/`, revalidates worker/manifest; no catch-all HTML rewrite |

## Verification evidence

Detailed machine output and screenshots remain local under ignored `test-results/`; tests and compact parity fixtures are committed.

| Check | Result |
| --- | --- |
| Complete Node suite, `npm run test:unit` | 534 tests: 533 passed, one confirmed baseline discrepancy below, no skipped tests |
| Framework types and actual stores, `npm run check:framework` | Passed; 10 store tests, no skipped tests |
| Module syntax/import/identifier validation | Passed for 113 application modules |
| Generated-content validation | Passed for all 28 packs |
| Dependency audit | Zero reported vulnerabilities |
| Production static build and offline inventory | Passed; offline version `f3a52ebd4d3cef8921a7`, all 92 exported assets versioned |
| Complete production desktop/phone browser run | 254 passed, four existing viewport-specific skips, zero failures; 258 cases in 28 files |
| Lenovo tablet matrix | All 15 scenarios passed across portrait, landscape, enlarged settings and short landscape windows |
| Final focused platform/reference/Tribes Node checks | All 23 tests passed |
| Follow-up complete Node suite, 19 October | All 534 passed; the stale cloak assertion is resolved |
| Follow-up React development checks | All 12 desktop/phone cases passed with a clean console |
| Follow-up production Player/review/navigation/exports | All 32 focused desktop/phone cases passed |

All four major generated payloads (`book-library`, `search-library`, `rule-reference-library` and GM data) are identical to the starting commit after line-ending normalization. Seventy-four retained engine files are likewise unchanged; nine adapt imports, public asset loading, formatting or extracted helpers. Calculations remain covered by the existing rule and PDF tests.

The final migration browser and tablet runs used the same completed production output. At that point, the complete release command remained non-zero at its Node stage because of the baseline discrepancy below; the remaining gates were run independently. The 19 October follow-up corrected the stale assertion and passed the complete Node suite (534/534). This does not claim a new complete release-chain run.

The retained baseline includes nine fresh/synthetic desktop, phone and tablet screenshots and storage snapshots. React reference rendering is compared to 18 compact normalized-text hashes from the original reader; tests render the actual `ReferenceBody` component. Existing presentation assertions use adapters that serialize the actual React elements. Boolean attribute ordering assertions were adapted to React serialization without changing the required behavior.

Additional store regressions exercise independent verification/personal sessions, immutable snapshots, grouped undo, no-op redo retention, Player dice eligibility, purchase/result parity and delayed import cancellation. Marijan session cases exercise repeated client navigation, disclosure/search retention and stale generation/import cancellation. Production platform cases require actual search-worker replies, route payload MIME/content, old compatibility addresses, offline soft navigation/hard refresh, retained drafts and successive updates.

A real pre-Next service worker was installed before serving the Next output on the same isolated origin. The legacy-to-Next transition preserved the exact Marijan save, retained only the current and previous ledger caches, reloaded offline and produced no page errors. The synthetic result is retained in `test-results/nextjs-baseline/legacy-to-next-update.json`. Subsequent Next-to-Next updates are reproducible in the committed production browser suite.

Original PDF calculation/layout modules and approved assets were preserved. Existing tests inspect actual downloaded editable sheet fields, creation records, NPC sheets and fixed/flexible A4 card PDFs. There is no intentional PDF layout change.

## Resolved pre-existing discrepancy — 19 October 2026

`tests/corsairs.test.mjs`, “Sea Dragon Cloak is optional acquired additional armour with no inferred price or weight”, already failed at untouched baseline `1a279d4`. It expected the older armour-description row after the later shared print design deliberately changed exports to equipment names and per-location Soak totals. The follow-up now checks the exact cloak Trappings entry and Soak values in both formats, plus the app's Body +2 AP / Partial label and existing stacking/unknown-value rules. All 534 Node tests pass. No calculation, canonical content or PDF output was changed for this correction.

The same follow-up removes the client-rendered theme script and repairs Review's Characteristic table nesting. Root CSS selects the server-rendered palette before hydration, and the layout effect maintains navigation attributes. Bound Player checkboxes keep a defined checked state and commit their React change event before controlled-state restoration. The development regression suite exercises all three palettes without JavaScript, repeated creator navigation, the ten-row Review table and checkbox toggles while requiring a clean console. It uses its own dev server/cache so production output and the normal preview remain independent.

The follow-up production build, module/format/type checks, all 10 store tests and complete 92-asset offline inventory pass against offline version `6fad324286960d28b0cd`. Its browser verification is the focused 32-case run above, separately from the original broad migration run.

A further table audit on 19 October reproduced the reported `tr` directly under `main` in rolled Characteristics. Its rows, Career comparison rows and XP history rows now belong to their existing tables' `tbody` elements. The added store regression checks the actual React ancestry across every Player step, all four Characteristic methods, empty/selected Careers, the comparison dialog and XP history. Browser regressions exercise the affected flows and require a clean development console. All 16 development cases, 28 focused production Player/rendering/Review cases, 11 store tests and 534 Node tests passed. Type/module/format checks, the production build and the complete 92-asset offline inventory passed against offline version `93da2d6e6fa969901466`. This repair changes table structure only; character calculations and saved data formats are unchanged.

Several original browser setups needed correction: opening a book disclosure before a full navigation cannot leave the newly loaded disclosure open; selecting different Player books uses the existing native confirmation and starts a blank character requiring an explicit Species choice and confirmation. Tests now perform those actions explicitly. The empty-Career roll button now labels a later attempt correctly after Undo; dice eligibility itself is unchanged. Mobile creator-link assertions use the canonical Next routes. The former synthetic browser import of removed `interface-kit.mjs` was replaced by a failure/retry/duplicate-activation check against the real React PDF download button. No mechanical outcome assertion was removed or skipped.

## Performance and practical limits

Controlled local startup medians under 50ms added per request were Player 585→449ms, Bestiary 676→534ms and Marijan 737→549ms. Initial resources fell from 104/91/79 to approximately 19–21. Controlled first-search result medians were 262→217ms, 281→286ms and 262→265ms respectively. These observations use the same fresh-context markers and synthetic conditions; they are not production or physical-device guarantees. See [STARTUP-PERFORMANCE.md](STARTUP-PERFORMANCE.md) for sample counts, output size and repeatable measurement details.

Desktop, phone and Lenovo tablet scenarios use Chromium browser emulation, including large settings and short landscape layouts. Physical-device certification remains outside the local evidence. Browser-only storage retains its existing limitations. The adapted Player JavaScript boundary can be converted incrementally in later work without combining it with rule changes.

## Local delivery and rollback

The migration commit is reviewable locally. Pushing would automatically deploy, so push/deployment authorization is still required at cutover. No GitHub CI was added.

Before deployment, preserve the last approved output and source commit. The existing `1a279d4` source retains the old application. A pre-Next rollback must also provide canonical-route aliases, keep manifest/root worker identity and build a fresh route-aware worker against the complete rollback directory; simply restoring an old worker is insufficient for installed Next clients. Test that proposed rollback as an update, including nested/offline routes and exact save retention, before publishing it. Do not clear character storage. Full preparation steps are in [PWA.md](PWA.md).

Maintenance boundaries and commands are documented in [ARCHITECTURE.md](ARCHITECTURE.md), [TESTING.md](TESTING.md), README and AGENTS. The original [migration plan](NEXTJS-MIGRATION-PLAN.md) remains the scope/acceptance record.
