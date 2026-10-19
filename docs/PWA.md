# Offline builds, installation and static hosting

The Next.js App Router application is exported as static files in `out/`. The repository and hosting-project root remain `character-generator`; `public/` holds approved public inputs, while `src/`, `content/`, source PDFs, extraction and build scripts remain outside the published directory. There is no account service, server database or analytics SDK. The character manager stores its own library in browser-local IndexedDB, independently of creator drafts and the offline asset cache.

## Build and hosting contract

Run `npm run build` from the project root. Content validation and generation run before the framework build; compatibility documents and the versioned offline worker are generated only after the final Next export exists. Deploy the resulting `out/` directory as one release. Never copy a worker from another build or generate it before the framework output is complete.

The canonical addresses are `/`, `/bestiary/`, `/marijan/` and `/legal/`. Static compatibility documents at `/gm.html`, `/marijan.html` and `/legal.html` redirect to the corresponding canonical route, preserving the query string and fragment. They require no server redirect support and are included offline. Hosting must serve directory `index.html` files and JavaScript modules with the correct MIME type. App Router `.txt`/`.rsc` payloads must remain their actual bytes; a catch-all HTML rewrite would break client navigation.

Keep `/sw.js` and `/manifest.webmanifest` revalidated with `Cache-Control: no-cache` through the root hosting configuration. Framework chunks have content-derived filenames. The manifest retains its existing `id`, `scope` and `start_url` of `./`, standalone display and independent ledger icons. The React service registers `/sw.js` at root scope, including when the user starts at a nested route. Development mode does not register the production worker.

## Offline inventory and routing

`scripts/build-pwa.mjs` inventories the completed `out/` tree, excluding the worker itself and hosting configuration. The cache version hashes the worker template, every included relative filename and every file's bytes. Generated route documents, App Router full/segment payloads, hashed framework chunks, public worker modules, book/search data, artwork, fonts and the supplied character-sheet PDF are included together.

Installation uses a single complete precache. A failed download deletes the incomplete new cache and leaves the earlier working cache available. Installation does not call `skipWaiting`; a newer worker waits for the user's **Update now** action.

The worker distinguishes route documents from router payloads. Known navigations resolve to that route's exported HTML; known route requests carrying `RSC: 1` or `_rsc` resolve to its exported payload. Explicit exported payload/segment URLs resolve to their own files. Query parameters cannot make a payload receive HTML. Unknown paths, writes and other origins have no blanket fallback. Browser verification queries do not change the underlying static resource.

Activation retains the current complete cache and at most one previous ledger cache. Only absent fingerprinted `/_next/static/` chunks can fall back to that previous cache, so a still-open older tab can finish loading an immutable chunk. Route documents and router payloads always come from the current build. Older ledger caches are removed; unrelated applications' caches remain untouched. The existing `wfrp-ledger-offline-` prefix is retained for the deployment transition.

## React lifecycle and updates

`src/services/pwa.ts` owns registration, installation prompts, online/offline status and waiting-update state. It accesses browser APIs only when connected from a client effect and disposes listeners and late asynchronous callbacks. The singleton `PwaControls` in the root layout keeps these services alive across client navigation. Its one install button is rendered into the active creator's `data-install-slot`; it hides in an installed window. Native installation instructions remain available when a browser supplies no install prompt.

Before activation, **Update now** dispatches `wfrp-before-update`. Each mounted creator persists its current draft. Async stores can register promises through `event.detail.waitUntil`; the manager's application-lifetime guard waits for its serialized writes, including after navigation away. Any unresolved conflict prevents activation and displays recovery guidance. After saves finish, the service sends `APPLY_UPDATE` to the waiting worker. A controller change reloads only after the user chose the update. **Later** dismisses the offer for the current session. Update controls remain above the phone history bar. Character databases, draft keys, save formats and independent histories are unrelated to cache-version changes.

## Local verification

The local static test server serves only `out/` on loopback port 8199, refuses reuse of another listener and shuts down with its test run. Ordinary browser cases block service workers; PWA cases allow isolated real workers and storage. A test-only cookie varies the worker version without changing published files. `test-results/` screenshots, diagnostics and baseline artifacts remain ignored.

Useful checks:

```powershell
npm run build
node scripts/check-offline.mjs
node --import tsx --test tests/pwa.test.mjs tests/pwa-lifecycle.test.mjs tests/offline-build.test.mjs tests/browser-build.test.mjs tests/reference-react.test.mjs
npx playwright test tests/browser/migration-platform.spec.mjs
npm run test:ui:pwa
```

The focused platform cases verify route/payload MIME types, compatibility queries/fragments, absence of private sources, real search-worker initialization/ranking, offline soft navigation and hard refresh, unopened references, Back/Forward, retained drafts and successive explicit updates. The Node checks cover exact final inventory/version bytes, manifest/icons, actual PDF bytes, atomic failure, payload isolation, bounded cache retention and disposable lifecycle behavior. Keep these production-output checks distinct from development-server UI checks.

## Rollback preparation

Retain the last approved static output and its source commit before an authorized deployment. Re-deploying an older directory alone is insufficient if users currently have nested Next routes or a newer worker installed.

For rollback to the pre-Next application, prepare an isolated static directory containing the saved legacy output plus canonical-route compatibility documents: `/bestiary/` must lead to `/gm.html`, `/marijan/` to `/marijan.html`, and `/legal/` to `/legal.html`, preserving queries/fragments. Generate the current route-aware offline worker against that complete rollback directory with `node scripts/build-pwa.mjs <rollback-directory>`. Keep the manifest identity and root worker URL. Test a newer installed build updating to this rollback build, including nested/offline reloads and exact saved-draft preservation, before requesting deployment approval. A cache-version change must not clear local character storage.

Push and deployment still require explicit user authorization. A local build or commit is not a deployment.
