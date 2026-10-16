# Local testing

GM appearance: `node --test tests/gm-appearance.test.mjs tests/gm.test.mjs` covers exact Species matching, all seven PC Species tables, printed height formulas, colours selected from recorded results, source-addressed dice, replacement, unchanged character mechanics and current save validation. `npx playwright test tests/browser/gm-appearance.spec.mjs` exercises the dice action, Undo/Redo, rerolls, review text, explicit Elf choice, manual unsupported-creature descriptions and desktop/emulated-phone layout. No new PDF layout or unrelated book checks are needed for this text-generation control.

GM compact cards and catalogue browsing: `node --test tests/gm.test.mjs tests/gm-picker.test.mjs tests/up-in-arms-gm.test.mjs` covers complete grouped browsing, per-location soak/conditional shields, canonical Talent descriptions, one-row attacks/abilities, all core four-card fits and overflow blocking. `npx playwright test tests/browser/gm-pickers.spec.mjs` checks complete Skill/Talent lists, specialisation selection, search/Back, additions and narrow-screen overflow. Check a representative six-card and dense four-card PDF visually after layout changes. These changes passed 41 focused Node cases and six desktop/emulated-mobile browser cases (new pickers, Arcane Lore/Cants and Archives III Skill/magic journeys); no physical-phone verification or unrelated full release run is claimed.

Skill/Talent Career references: `node --test tests/career-references.test.mjs tests/book-search.test.mjs tests/search-library.test.mjs tests/printed-references.test.mjs` covers source levels, all-book lookup, exact/grouped matching, Any Colour/as-Trade restrictions, variants, deduplication, safe rendering and malformed lazy metadata. Run `npx playwright test tests/browser/career-references.spec.mjs` after building for shared Player/GM/Marijan tables, exact Career links, Back, unchanged drafts and desktop/mobile overflow. The 41 affected Node cases passed; six browser mode/navigation cases plus the two variant follow-ups passed. This reference-only feature does not need unrelated character-generation or PDF suites.

Description changes: run `npm run check:descriptions`, `tests/descriptions.test.mjs` and affected rule/render/export tests. Browser preparation includes `content/`, so canonical edits invalidate its cache. Original extraction stays outside the test server's `dist` root; offline tests load the generated book bundle instead of build-time manifests.

The completed editorial pass adds publication gates for imported/unreviewed text, exact reference exclusions, absent standalone Rules in published assets and removed unused GM stat blocks. Attack classification is tested independently of rewritten wording. Search tests check retained mechanical table values and absence of removed Rules; original source hashes and frozen inventories remain enforced. For this cross-catalogue change, run the Node suite once and the focused `@descriptions` desktop/mobile checks, then investigate only failures or changed paths.

October 16 verification: build/source validation (28 packs), generated output, formatting, module checks and offline coverage passed. The initial broad Node run identified old prose expectations plus the previously documented Lustria/Salzenmund creation-fixture failures. Wording assertions were updated to retained mechanical values/triggers. Focused follow-ups cover the affected books/search/publication tests; the final 36-case search/description/Gnome-PDF group passed, as did 41 core GM/description/PDF checks. Browser checks passed 12 reference/navigation cases and the final eight shared-summary/source-conflict/personal-override cases across desktop and simulated mobile. The two creation fixtures were subsequently corrected to supply ten explicit 10-point allocations and select Human for the Nordlander Owler. Both affected test files pass all 18 cases; production defaults and validation remain unchanged. This does not claim a new full release run or physical-phone verification.

The focused local `@descriptions` browser cases cover shared reference-summary labels, GM parameter-aware descriptions/template controls and Marijan personal descriptions through reload on desktop and mobile. Canonical migration also checks real PDF records and all 49 core profiles at four cards per A4; dense cards were visually inspected with the 7.5 pt minimum unchanged.

Browser checks run locally with Playwright. There is no GitHub Actions workflow, deployment hook, or hosted test service. Test code and browser dependencies are development-only; Vercel still serves `dist`.

## First setup

```powershell
npm install
npm run test:ui:install
npm run test:ui:smoke
```

The install command downloads Chromium once for the installed Playwright version. After changing that dependency, install its matching browser again. Optional broader coverage uses `npm run test:ui:install:all` followed by `npm run test:ui:cross-browser`.

## Choose checks by impact

| Change | Normal local checks |
| --- | --- |
| Documentation only | Review affected documents, links and stale claims; no browser run |
| Local styling/control | `npm run check:quick` plus the relevant browser suite; inspect new visual design once |
| Search/controller/reader | Quick checks, relevant `node --test tests/<file>.test.mjs`, `npm run test:ui:search` |
| PC purchases/creation | Quick checks, affected rule tests, `npm run test:ui:pc` |
| GM profile/template/issue flow | Quick checks, affected GM tests, `npm run test:ui:gm` |
| Save/load | Relevant model tests and `npm run test:ui:storage` |
| PDF controls/output | Relevant export tests and `npm run test:ui:exports`; visually inspect changed PDF layout |
| Mobile layout/navigation | Relevant feature suite and `npm run test:ui:mobile` |
| PWA/assets/offline | `npm run build`, `node scripts/check-offline.mjs`, `npm run test:ui:pwa` |
| Book source/registry | Review supplied pages; regenerate data, check books/generated outputs and affected book tests; full release checks for substantial integrations |
| Shared rules/data/schema changes, substantial refactor, or formal release candidate | `npm run check:release`; optional cross-browser smoke when browser compatibility is affected |

`check:quick` checks application syntax/imports/identifiers and formatting. It does not prove rule data or PDFs correct. Direct `node --test` runs avoid npm's full build/test prehook; first prepare assets when source data changed. Name the actual affected test files, rather than repeatedly running every book combination. If a focused test passes, broaden only for a new failure, unresolved concern, or wider impact. A routine local commit does not require the full release command. Do not push without the user's authorization.

A routine styling or scoped control push uses the same proportional checks as its implementation; pushing alone does not justify the full book/browser matrix. If a broader run exposes unrelated failures, report them and keep them separate instead of turning the change into a test-maintenance project. Never claim the full release gate passed when it did not.

### Known broad-suite failures — 15 October 2026

The allocation-layout release run reported 496/498 passing Node tests and 193 passing browser cases, nine failures and four intentional skips. The targeted interface/layout checks passed. Its Lustria/Salzenmund complete-character fixture failures are now fixed (October 16, 18 affected cases passing). Other outstanding wider checks from that release include GM Corsairs/Leech Wyrm navigation/reload scenarios, the empty-Career history locator and Salzenmund's former Origins language caption; these have not been reverified by the fixture-only fix. The Tavern search expectation was updated for the deliberately hidden Rules category.

## Browser commands

Startup performance: `npx playwright test tests/browser/startup.spec.mjs` checks deferred PDF tools, single data requests per mode, retry/reuse and the first export offline. Pair it with the existing relevant PDF download cases when changing export loading. The optional `scripts/measure-startup.mjs` diagnostic records local cold-load timings without flaky time-limit assertions or personal saved drafts; see [STARTUP-PERFORMANCE.md](STARTUP-PERFORMANCE.md).

Player review layout: run `node --test tests/review-sheet.test.mjs` and `npx playwright test tests/browser/review.spec.mjs`. These focused checks cover shared current scores, distinct resources, Talent rank counts, unknown data, escaping, descriptions/PDF options, notes editing, section shortcuts, actionable export blockers and 320/390px fit. The existing Player PDF-download case in `storage-exports.spec.mjs` checks both unchanged downloads. Inspect the generated desktop/phone screenshots once for visual changes; this presentation-only work does not require unrelated book suites or a full release run.

| Command suffix (`npm run test:ui:<suffix>`) | Coverage |
| --- | --- |
| `smoke` (also `test:ui`) | Player/GM creators open, navigate, read a rule and fit desktop/mobile widths |
| `search` | Stable typing/caret, categories/book/combined filters and memory, Rune labels, Cants/prayers, loading retry, inactive-book availability, keyboard controls, automatic batches, return position and chained references without changing the draft |
| `notices` | All three modes on desktop/mobile and a production-shaped HTTPS origin: independent emblem, unofficial notices and working legal/privacy/contact links, no analytics requests, Rules absent from the search category/results with other references still available |
| `pc` | Career rolls, recorded dice, advancement/tracker grouping and undo, repeatable Talents, equipment purchase/removal |
| `marijan` | Unrestricted one-page editing, additions, custom entries, overrides, Undo, independent saves/reload, player copying and editable PDF downloads |
| `gm` | Printed profile application, expiring notice, stable edits, template preview/apply/remove/undo, independent GM books, mount training, Tribes Troll composition/Hag spells and Shaman Lore controls, book-removal confirmation/undo, early blocking issue and repair |
| `storage` | Actual JSON downloads/imports, reload persistence, rejection of the wrong save type |
| `exports` | Actual browser PDF downloads, editable player fields, compact NPC PDF, six-card A4 default and mixed-draft batch |
| `mobile` | Scenarios tagged for navigation, narrow layout and search; mobile Chromium only |
| `pwa` | Real worker precache, offline reload and unopened references/GM entry, waiting update and retained purchases |
| `all` | Every scenario, including Marijan Mode, in desktop and mobile Chromium |
| `cross-browser` | Smoke only in Chromium desktop/mobile, Firefox desktop and WebKit mobile |
| `failed` | Rerun only failures from the last local run |
| `report` | Open the latest HTML report |

Suites use tags, so one regression can belong to several focused commands without duplicating its code. `tests/browser/helpers.mjs` provides validated core fixtures, navigation helpers, real file uploads/downloads and browser diagnostics. Specs use accessible names/roles and outcome assertions. A few stable structural selectors identify repeated rows or the viewport bounds; assertions do not duplicate all book data or snapshot entire pages.

## Preparation and isolation

The runner builds assets when its recorded SHA-256 fingerprint differs. It hashes source scripts, package metadata and every published file, so a same-length edit or removed asset also invalidates the cache. Unchanged assets reuse the last successfully prepared build. Logs and the cache marker live in ignored `test-results/`. The release command builds via `npm test`, then runs browsers with the internal `--built` flag to avoid rebuilding twice.

Playwright starts and stops its own loopback-only static server on **8199**, serving only `dist`. It refuses to reuse an existing listener. Change the port with `$env:WFRP_TEST_PORT = '8200'` if necessary. It does not attach to or stop the user's preview server or open tabs. Every scenario gets a fresh browser context/storage and uses `?verify=1`. Ordinary suites block service workers to avoid stale caches. PWA scenarios allow them in isolated contexts; a test-only cookie makes the test server serve a second worker cache version without rewriting production assets.

## Failures and manual inspection

Runs print a short pass/fail count and elapsed time. On failure, inspect `playwright-report/index.html` or use `npm run test:ui:report`. Playwright retains a screenshot, trace and error context under `test-results/browser/`; browser JavaScript errors fail the test, and console/network diagnostics attach to failures. Retries are disabled so failures are visible. Fix and rerun the affected scenario or `test:ui:failed`; do not repeatedly rerun unrelated suites. Reports overwrite the previous run and are ignored by Git.

Automated checks replace repetitive interaction testing. They establish outcomes, focus/caret behavior, overflow, downloads and worker behavior; they do not establish visual quality. Use manual inspection for a new design, a changed PDF layout, unusual motion or a browser failure that needs diagnosis. Desktop mobile emulation does not verify physical phone keyboards, OS picker presentation or installation prompts. No screenshot baseline approves a new design automatically.

## Initial verification — 8 October 2026

`npm run check:release` passed 346 Node regressions and 44 browser cases (22 scenarios in desktop/mobile Chromium), alongside book, generated-output, format and offline checks. The Node portion took 204 seconds and the complete browser suite 71 seconds. A focused search run passed 14 cases in 14 seconds. A normal smoke command including its first asset preparation took 50 seconds; the unchanged cached repeat passed four cases in 9 seconds. These are local observations, not timing guarantees. Failure runs also produced screenshots, traces, error contexts and attached diagnostics before the test assumptions were corrected.

Optional broader smoke passed all six Chromium/WebKit cases. Both Firefox cases failed before opening the app because its downloaded executable could not launch on this Windows host (`spawn UNKNOWN`); Firefox coverage is unverified. The command retains that failure rather than skipping it. The test listener on port 8199 was absent after completion, and no production app/data files changed. No real-phone or fresh visual-design inspection was required for this infrastructure-only change.

Marijan Mode's focused Node checks are in `tests/marijan.test.mjs`, and browser scenarios in `tests/browser/marijan.spec.mjs` (`npm run test:ui:marijan`). The mode uses independent verification storage and actual downloaded JSON/PDFs. Shared controls, Wounds or PDF helper changes also require their affected GM tests; they remain re-exported at the existing GM import paths. All checks remain local.

Random Marijan generation is covered by `tests/marijan-generation.test.mjs`: core allocations/caps/native languages, all Species profiles/resources, 10/12/14 tracker development and recorded prices, non-stacking additive grants, invalid automatic profiles and preservation of unrestricted manual editing. Its focused browser suite also checks the shared rail, preview without mutation, apply/Undo, Species additions and a generated PDF. Run these affected checks plus quick/offline checks for Marijan changes; unchanged player/GM flows do not require a repeat of the entire release suite.

Shared phone-shell checks live in `tests/browser/mobile-shell.spec.mjs` (`npx playwright test tests/browser/mobile-shell.spec.mjs` after asset preparation): all three modes, 320/390px header sizing, bottom-only folio access, actual save downloads through the menu, search, mode links, Escape, redraw and desktop resize restoration. Save/import test helpers reveal the mobile menu before using hidden file tools. These remain local and do not verify a physical phone OS.

Shared Undo/Redo checks live in `tests/draft-history.test.mjs` and `tests/browser/history.spec.mjs`. The pure checks cover grouped edits, no-op/navigation behaviour, redo branching, bounded independent snapshots, purchases/variants, duplicate dice occurrences, first-roll attempt protection and replacement-draft audit separation. Browser checks exercise the same icons in all three modes, inline edits/redo/branches, navigation, 320/390px touch sizes and resize restoration, plus Player dice/eligibility. Existing PC purchases, GM templates and Marijan generation tests use the standard Undo name. Run these focused cases first; shared history changes also require the release suite.

Marijan density coverage checks compact Characteristic-grid and selected-row heights, editing expanded Characteristic modifiers, Skill Characteristic/manual totals, Talent ranks, equipment quantity/location and reload persistence. Screenshots are generated for the four affected sections in desktop/mobile Chromium. These checks stay in the focused Marijan suite.

Marijan navigation checks cover the native phone section selector at 320/390px, collapsed destinations, keyboard focus, unchanged Redo availability, and the live Export PDF control moving between banner menu and desktop rail through resize. The focused test downloads a real PDF; character generation and unchanged rule suites need not be repeated for this layout change.

## Shared interface regressions — 10 October 2026

`npm run test:ui:interface` runs tests/browser/interface.spec.mjs locally on desktop/mobile Chromium: skip/main focus, input intent and touch size, contextual Player View/Back, compact Experience and persistent help, roving tabs, GM neutral/inline issues, clean search snippets/selected Back and retryable duplicate-safe operations. Pure formatting/control checks live in tests/interface.test.mjs. The suite produces a small three-theme desktop/phone screenshot set, not a pixel-diff approval baseline. Use this focused command for shared interaction changes; the release policy above still applies to substantial changes.

The October review used isolated drafts, all three themes and populated Player/Griffon layouts. Narrow 720px layout approximates the logical width of 200% desktop zoom; it is not proof of real OS keyboard or screen-reader behavior. Local list measurement used 300 actual Rules results: full insertion plus forced layout took 7.6–8.4ms over five desktop samples. Existing 20-result batching was retained; no unmeasured virtualisation/containment was added. Contrast role pairs and sampled composed primary control states are recorded in ignored test-results/ui-implemented artifacts. See UI-UX-IMPLEMENTATION.md for bounds and release results.

October 10 verification: 417 Node checks passed; 123 distinct browser cases passed across the release run and the focused follow-up, with one intentional desktop skip for phone-only navigation. Two Marijan row-density regressions were caught in the initial run and corrected by preserving the entry disclosure's absolute placement; only the affected density/interface cases were rerun. Syntax/import, formatting, book/generated outputs and the final 303-asset offline worker passed. No hosted tests or physical-device conformance claim was added.

Fluid-shell regression cases in `tests/browser/interface.spec.mjs` check each creator at 1440, 1920, 2560 and 3840 CSS pixels, followed by tablet/phone resizing. They measure editor growth, bounded rail/folio widths, shared header gutters and overflow, capture a wide preview, and include Player book setup. These logical viewport sizes model the extra layout space exposed by zoom-out; they do not simulate browser chrome or physical display scaling. Run the focused `workspace grows` cases for shell-width changes.

The development-only Emil UI review is documented in [UI-REVIEW-EMIL-2026-10-15.md](UI-REVIEW-EMIL-2026-10-15.md). Its opt-in preview server exposes only dist and explicit review routes, with saved-draft fixtures on a separate localhost origin. The Demo/Worst/Empty/One/Catalogue controls and probes stay outside dist; do not add them to production navigation or offline assets.

The focused `tests/browser/emil-polish.spec.mjs` cases cover hover-rule capability guards, independent keyboard focus, press feedback and viewport safe-area opt-in across the three modes; readable multi-digit Marijan values, expanded custom Skill rename/persistence; and GM book disclosure/identity order and compact description. Existing book integration tests explicitly expand the GM book picker before interacting with its choices. Formatting tests in `tests/interface.test.mjs` check large-number rendering, raw numeric input values and grouped-currency parsing round trips. Physical-phone safe areas and software keyboards remain unverified.


GM Trait summaries: `node --test tests/gm-trait-summaries.test.mjs tests/gm.test.mjs` checks editorial coverage for all long integrated definitions, conditional Size/Breath/Mark/training mechanics, preserved full sources, actual-only descriptions and measured card overflow. Template eligibility is exercised across foundation restrictions and nested modifiers/marks. For the paired interaction change, run the GM browser cases matching `GM summaries|Night Parade has opt-in` on desktop/mobile; these cover shared summary descriptions, template/book filtering, preview/back and applying a compatible template. Full source wording is no longer a second disclosure. Book-specific conditional text handlers retain their own tests (notably Night Parade’s brazier replacement).


Panel material changes use the focused `tests/browser/panel-materials.spec.mjs` cases (included by `@interface`): all three modes on desktop/phone, equal menu/folio surfaces, actual local asset decoding, mobile folio opening, no overflow, reduced-motion consistency and plain print backgrounds. Run this file directly for material-only changes instead of unrelated creator/book flows, then rebuild/check offline assets. Native SVG texture strength is baked at 0.15; no character data or PDF layout is involved.
