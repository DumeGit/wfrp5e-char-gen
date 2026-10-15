# Mode startup — 15 October 2026

Mode changes still use independent pages and draft storage. This change accelerates their startup without adding a single-page router, sharing mutable catalogues between modes or skipping content validation.

The CPU profile identified repeated `canonicalName` scans through the entire static alias inventory as the main catalogue-building cost. An exact kind/name index now narrows lookup to that name's aliases, preserving declaration order, global/scoped matching and unchanged-name fallback. No alias, conversion or game rule changed. A focused regression checks the complete inventory against its original lookup semantics across every installed book scope.

All three entry pages preload the shared JSON bundle while JavaScript dependencies are discovered; Bestiary/Marijan also preload their creature data. Matching anonymous fetch preloads are reused by the existing loaders, so data is requested once rather than fetched twice. The book-bundle module has an early module-preload hint.

`pdf-runtime.mjs` loads the existing local pdf-lib script on first export/print, sharing an in-flight Promise and allowing retry after failure. Player PDF exporters and Bestiary PDF/card-print modules now import on demand; Marijan's already-lazy exporter awaits the same shared runtime. Existing Preparing states cover this first-use load. The temporary GM print batch still persists for the lifetime of that page. All modules and PDF assets remain in the offline worker: background offline preparation may download them, but editor startup no longer executes or waits for PDF tools.

## Measurements

Illustrative local cold runs used fresh desktop Chromium contexts, blocked service workers and 50ms added per request, with usability measured when the rendered creator rail appeared. Request interception disables HTTP caching. This models dependency-discovery delays; it is not a bandwidth simulation or production/physical-phone benchmark.

| Mode | Before | After |
| --- | ---: | ---: |
| Player | 961ms | 583ms |
| Bestiary | 2,311ms | 767ms |
| Marijan | 3,045ms | 769ms |

A separate local Node sample reduced catalogue construction from 449ms to 59ms (core), 2,111ms to 266ms (GM options), and 3,044ms to 287ms (Marijan). These one-run values demonstrate the bottleneck and are not timing guarantees.

To repeat against the existing preview server: `node scripts/measure-startup.mjs http://127.0.0.1:8110/dist/ 50`. A different loopback base URL and delay are accepted. The diagnostic uses independent temporary browser contexts, does not touch personal saves, and writes the latest timings/resource inventory to ignored `test-results/startup-measurement.json`. It does not start or stop preview servers. Use delay 0 for a local unthrottled observation; compare equivalent conditions rather than enforcing flaky timing thresholds.

## Focused checks

Run `node --test tests/architecture.test.mjs tests/books.test.mjs tests/rules.test.mjs` for exact alias behavior and catalogue/rule consistency. `tests/browser/startup.spec.mjs` checks all modes defer PDF tools, reuse their data preloads, recover from a failed PDF runtime request, reuse the successful runtime and support the first PDF export offline. Existing Player, GM/cards and Marijan download tests check actual PDF output. Rebuild/check the offline worker after changing runtime modules. Unrelated book/browser matrices are not required for this behavior-preserving startup optimization.
