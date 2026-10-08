# Local testing

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
| Shared rules, substantial refactor, test infrastructure, or ready to push/release | `npm run check:release`; optional cross-browser smoke when browser compatibility is affected |

`check:quick` checks application syntax/imports/identifiers and formatting. It does not prove rule data or PDFs correct. Direct `node --test` runs avoid npm's full build/test prehook; first prepare assets when source data changed. Name the actual affected test files, rather than repeatedly running every book combination. If a focused test passes, broaden only for a new failure, unresolved concern, or wider impact. A routine local commit does not require the full release command. Do not push without the user's authorization.

## Browser commands

| Command suffix (`npm run test:ui:<suffix>`) | Coverage |
| --- | --- |
| `smoke` (also `test:ui`) | Both creators open, navigate, read a rule and fit desktop/mobile widths |
| `search` | Stable typing/caret, categories, inactive-book availability, keyboard controls, automatic batches, return position and chained references without changing the draft |
| `pc` | Career rolls, recorded dice, advancement/tracker grouping and undo, repeatable Talents, equipment purchase/removal |
| `gm` | Printed profile application, expiring notice, stable edits, template preview/apply/remove/undo, independent GM books, mount training, book-removal confirmation/undo, early blocking issue and repair |
| `storage` | Actual JSON downloads/imports, reload persistence, rejection of the wrong save type |
| `exports` | Actual browser PDF downloads, editable player fields, compact NPC PDF, six-card A4 default and mixed-draft batch |
| `mobile` | Scenarios tagged for navigation, narrow layout and search; mobile Chromium only |
| `pwa` | Real worker precache, offline reload and unopened references/GM entry, waiting update and retained purchases |
| `all` | Every scenario in desktop and mobile Chromium |
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
