# Mode startup and navigation — 18 October 2026

**Dated benchmark, not a current four-workspace performance certification.** The three creator measurements below belong to the stated builds. The manager was added afterwards and is not covered by those timings or asset counts. Use [ARCHITECTURE.md](ARCHITECTURE.md) for current architecture and [TESTING.md](TESTING.md) for rerunning the diagnostic.

All three creators now run on Next.js App Router routes with client navigation. Each creator keeps its own draft, calculations and session history. Immutable book/search wire data is cached by the shared content service; catalogues are assembled independently for each mode. Links disable automatic route prefetching, so opening Player does not initialize every creator.

The earlier exact-alias index remains in the unchanged rule engine. Selected-content and current-save validation still run; full source inventories, source descriptions and dependency-context validation belong in build tooling. Public assets resolve from application-root URLs rather than depending on a bundled module's location.

Search data loads on first use. The React reader preserves native filters, stable input/caret, twenty-result batches, reference chaining and Career membership tables. Its shared validated payload/link index is reused across modes. Normalization/ranking runs in the actual `/workers/search-worker.mjs` module worker, with the existing synchronous fallback when workers are unavailable. Generated worker dependencies are byte-identical to the canonical engine modules. A production test requires real worker initialization and query replies, rather than accepting a silent missing-import fallback.

PDF runtime loading and exporters remain lazy. Editor startup does not execute PDF tools; offline installation intentionally downloads their files in the background so a first export can work without a network. Large book/search JSON stays in generated public files rather than being duplicated inside framework bundles.

## Reproducible measurements

The pre-migration source commit was `1a279d4`. Original static `dist` contained 170 files / 26,102,943 bytes. The tested Next output, offline version `21229ad2a3f0702f4e16`, contains 91 files / 26,471,525 bytes including its worker (about 1.4% more bytes). The worker inventories 90 files; it excludes itself. These output counts describe that tested build, not a permanent release requirement.

Cold startup uses fresh desktop Chromium contexts, blocked service workers, disabled HTTP caching and 50ms added to each request. The usable-editor marker is the creator rail plus visible main panel. This models dependency discovery, not bandwidth, production latency or physical-phone performance. The original baseline is one sample; the Next values are medians of three same-condition samples.

| Mode | Original baseline | Next median | Initial resources: original → Next |
| --- | ---: | ---: | --- |
| Player | 585ms | 449ms | 104 → 20 |
| Bestiary | 676ms | 534ms | 91 → 20–21 |
| Marijan | 737ms | 549ms | 79 → 19–20 |

Warm client navigation with the same 50ms request delay measured 445ms to first Bestiary visit, 431ms to first Marijan visit and 130ms returning to Player (medians of three runs). Each run starts on Player; the first visits still load mode-specific code. These are navigation outcomes, not animation durations.

A separate controlled first-use comparison used three fresh contexts per mode/build, no added latency, no HTTP cache and the same immediate editor-ready marker. It opens search, waits for the category catalogue, types **Trained** and waits for its actual result. The median complete time from opening search to that first result was:

| Mode | Original | Next |
| --- | ---: | ---: |
| Player | 262ms | 217ms |
| Bestiary | 281ms | 286ms |
| Marijan | 262ms | 265ms |

The initial catalogue-ready phase is slower in React; query ranking after that phase is faster. Measuring only category availability would miss this distinction. The 3–5ms complete-result differences in Bestiary/Marijan are within these samples' variation. All measured runs had zero uncaught page errors. The earlier screenshot-based first-search observations used a later stabilization point and are retained only in local diagnostic artifacts, not treated as the controlled comparison.

Use the starting cold-load observations as investigation thresholds for follow-up work: repeated medians above 585/676/737ms under these conditions need explanation. Duplicate book/creature requests, eagerly executed exports, worker failures and first-result regressions also require investigation. Do not enforce single-run millisecond limits in tests or treat the framework itself as proof of speed.

## Repeat the diagnostic

Start the isolated static output server, then run the diagnostic from a second terminal:

```powershell
node scripts/browser-test-server.mjs
node scripts/measure-startup.mjs http://127.0.0.1:8199/ 50
```

Stop that server before running Playwright, which owns the same port. A different loopback URL and a delay from 0–1000ms are accepted. Delay 0 records a local unthrottled observation. The diagnostic does not start/stop servers or read personal saved drafts. It records cold ready time, resource inventory, first search readiness/result and warm navigation in ignored `test-results/startup-measurement.json`.

Migration baseline screenshots (desktop 1440×900, phone 390×844, tablet 800×1180), isolated storage snapshots, raw timing samples and the real legacy-to-Next update result are retained locally in ignored `test-results/nextjs-baseline/`. They contain synthetic/fresh drafts. The documented timings above remain reviewable without committing large screenshots or transient resource logs.

## Focused checks

`node --import tsx --test tests/architecture.test.mjs tests/books.test.mjs tests/rules.test.mjs` checks rule/alias consistency. `tests/browser/startup.spec.mjs` checks one data request per mode, deferred PDF execution, retry/reuse and first export offline. Existing actual JSON/PDF download cases remain the output checks. `tests/browser/migration-platform.spec.mjs` additionally verifies production routes, real worker ranking, offline navigation and updates. See [PWA.md](PWA.md) for static output, cache/update and rollback contracts.

The first production integration passed 15 focused platform/lifecycle/inventory/reference Node tests and 12 production desktop/mobile browser cases (eight migration-platform and four existing PWA cases) against offline version `21229ad2a3f0702f4e16`. The 28 existing search/Career-reference cases passed across the initial run and three affected reruns after transient concurrent development edits cleared. This is scoped evidence, not a full release or physical-device claim.

## Earlier alias optimization

The October 15 pre-Next optimization reduced illustrative 50ms/request cold runs from 961→583ms (Player), 2,311→767ms (Bestiary) and 3,045→769ms (Marijan). A separate one-run Node observation reduced catalogue construction from 449→59ms (core), 2,111→266ms (GM options) and 3,044→287ms (Marijan). Those historical runs used the old independent pages and are separate from the migration comparison above.

## Imperial Desk measurement — 22 October 2026

The optional diagnostic now opens the native workspace disclosure before following real route links and includes manager startup. The final unthrottled loopback run observed 213/362/388/439ms usable for Player/Bestiary/Marijan/manager, 19–22 resources, 88–344ms warm navigation and zero console errors. These are local measurements, not a comparison against an unrecorded cold baseline or a performance guarantee. The existing baseline/final lazy-tool regressions pass, and the new menu leaves PDF/catalogue ownership with existing services. Materials add 9,876 loaded bytes (static WebP plus divider); source SVG is preserved separately. Full evidence/limits: [continuing contract](UNIFIED-DESIGN-IMPLEMENTATION-PLAN.md).
