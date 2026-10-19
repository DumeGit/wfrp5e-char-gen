# Application architecture

The application uses Next.js App Router with a static export, React and TypeScript. The repository and hosting root remain `character-generator`. There is no application server, account database or analytics SDK. The reviewed Fifth Edition rule engine remains JavaScript; migrating the interface does not change game mechanics or source content.

## Source and output boundaries

| Location | Responsibility |
| --- | --- |
| `src/app/` | Static Player `/`, Bestiary `/bestiary/`, Marijan `/marijan/` and `/legal/` routes, metadata and root layout |
| `src/components/` | Shared banner/frame, creator links, native field buffers, React element primitives, history and root PWA controls |
| `src/features/player/` | Player lifecycle, typed store adapter, commands and React presentation |
| `src/features/bestiary/` | Native React workshop, mode store, sections and dialogs |
| `src/features/marijan/` | Native React unrestricted editor, mode store and generation/import dialogs |
| `src/features/reference-search/` | Shared lazy reference service, React search/filter workspace and reader |
| `src/engine/` | Existing calculations, approved supplement handlers, source identities, validation and PDF exporters |
| `src/services/` | Cached public fetches, reference requests, export-operation deduplication and browser PWA lifecycle |
| `src/styles/` | Authored themes and shared CSS, in the established cascade order |
| `src/static/` | Independent component-reference specimen |
| `content/` | Canonical descriptions and private reviewed build inputs; never served |
| `public/` | Approved assets, fonts, sheet template, generated book/search data, generated worker modules and component specimen |
| `out/` | Disposable final static export, compatibility documents and content-versioned offline worker; the only deployment directory |

The former `dist` mixed authored code and output. It has been removed after extracting source and approved assets. Do not recreate authored code there. `npm run build` validates and generates content, emits the search worker and static specimen, exports Next, writes compatibility documents, then inventories the completed output for offline installation.

`/gm.html`, `/marijan.html` and `/legal.html` are actual static compatibility documents preserving query strings and fragments. They do not depend on Next server redirects. The component reference retains `/design-system.html`. Deployment remains an explicit separate action; local changes must not be pushed without authorization.

## State, commands and lifecycle

Each creator owns a browser-session store, catalogue, document identity, calculated result, revision and bounded history. Creation and restoration happen inside browser lifecycles, never during prerendering. Client navigation retains each mode's session; reload restores its own saved draft and starts fresh history. Verification contexts stay isolated from personal storage.

| Mode | Storage and save contract |
| --- | --- |
| Player | `wfrp-fifth-character-ledger-v2`, optional `-verification`; version 2, exact selected book versions |
| Bestiary | `wfrp-gm-workshop-v1`; `wfrp-gm` schema 2; verification never reads or writes the personal draft |
| Marijan | `wfrp-marijan-v1`, optional `-verification`, named snapshots under `-saves`; `wfrp-marijan` schema 1 |

These formats remain distinct. Importing another mode's save is rejected. Imported dice remain history, never newly verified randomness.

`draft-history.mjs` remains the common history implementation. It groups continuous edits, retains 60 session snapshots, excludes navigation/no-ops, preserves redo until an actual edit, and restores related books/choices/purchases together. Same-document history keeps dice occurrences and maximum Player attempt counters; replacing a document gives it an independent audit. Histories are not serialized.

Player retains adapted JavaScript command/presentation functions behind `store.ts` and TypeScript React lifecycle components. Presentation functions now compose React elements directly; they do not construct or inject a large HTML string. This is a typed boundary around retained JavaScript, not a wholesale TypeScript rule/state rewrite. Bestiary and Marijan use TypeScript stores and native React sections. There is one runtime implementation of each screen; former controllers and string renderers have been removed. Node HTML assertions serialize the actual React components through test adapters.

React owns the rendered DOM. Native text/number fields keep an editing buffer so clearing and multi-digit typing do not prematurely change validated values. Stable content keys, disclosure identities and native dialog semantics preserve focus and browsing state. The shared compact shell remains through 1000 CSS pixels, with desktop behavior above that boundary. React portals place controls without legacy DOM reparenting.

Listeners, media queries, observers and modal services clean up on departure. Pending imports and generation previews cannot apply to a newer/inactive document. Player export commands capture one draft/rules/result/options snapshot before awaiting lazy tools; epoch checks cancel stale output. Store snapshots do not expose a draft object subsequently mutated by another command. PWA updates ask mounted stores to persist before activation.

## Content, calculations and exports

`src/services/content.ts` caches retryable wire-data requests. Each mode separately assembles its mutable rules context; fetching once does not create a shared mutable catalogue. `scripts/book-source-library.mjs` is the build-only source loader, including canonical-description hydration, source checksums, alias targets and disabled-pack validation. Its private paths are absent from client modules. Browser startup uses the validated public book bundle.

`content/descriptions/catalogue.json` and `trait-rules.mjs` remain the only authored mechanical wording sources. Generation emits `public/data/`, `public/gm/data.json` and `src/engine/description-rules.mjs`. Stable IDs, sources, selective Legacy decisions, exclusions and editorial checks are unchanged. Standalone Rules and excluded references never enter public assets. See [DESCRIPTIONS.md](DESCRIPTIONS.md), [BOOKS.md](BOOKS.md) and the individual supplement documents.

`character-result.mjs`, `gm/model.mjs` and `marijan/model.mjs` remain authoritative calculators. Folios, review, structured issues and exporters consume their results. Issue destinations come from structured detecting-rule metadata, never English message matching. Rule eligibility, prices, Fifth Edition adaptations, unknown values and manual overrides retain their existing boundaries.

PDF runtime and exporters load on demand. The supplied editable sheet, complete creation/XP record, NPC sheets and fixed/flexible Bestiary cards retain their calculation/layout code. Card measurement and drawing use the same boxes and fonts; flexible packing, conditional Desc and Soak rules remain intact. There is no startup import of PDF tools or a GM catalogue request on Player startup.

## Shared search

The frame mounts the same React search workspace in every creator. `library.ts` loads one immutable all-book corpus on first use, independently of character selections. Native category/book/filter choices, chips, 20-result batches, related-term ambiguity, reader Back/history and Career membership tables remain transient. Closing resets the workspace. Search grants no choices, XP or equipment.

Pure ranking/filter/linker/source modules remain in `src/engine`. `build-search-worker.mjs` copies the canonical worker and its pure dependencies into `public/workers/`; the worker receives searchable projections only. Its explicit root URL works at every route depth and offline. Worker failures use the same synchronous matcher. `ReferenceBody.tsx` renders canonical summaries, tables and source fields as escaped React content. See [BOOK-SEARCH.md](BOOK-SEARCH.md).

## Appearance, offline and verification

The root layout tolerates pre-hydration attribute changes on `html` and `body`. The body exception handles browser-extension attributes such as `cz-shortcut-listen`; it does not suppress hydration checks inside creator components. The development rendering regression injects that attribute before hydration on every creator route and requires a clean console.

The root frame preserves the selected Player, Moonlit Vellum and Ash & Vellum themes. Root CSS matches the server-rendered frame's theme with `:has()` so the initial palette works before hydration and with JavaScript disabled. A layout effect updates root mode/theme attributes and theme-colour metadata during client navigation; the frame never renders an executable script. CSS order, panel materials, local art/fonts, reduced motion, safe areas and public notices remain shared. Styles use public root asset URLs rather than source-module URL assumptions. See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

The root PWA service is independent of creator remounts. The worker inventories the completed static build, distinguishes route HTML from App Router payloads, installs atomically and waits for explicit Update now. One previous cache can supply old immutable hashed chunks to an open tab; current route documents/payloads never mix releases. See [PWA.md](PWA.md) for headers, update verification and rollback.

All testing remains local. Existing Node rules, content validation, real browser fixtures/downloads and production worker tests are retained; React tests exercise store isolation, cancellation and result parity. Browser servers serve only `out/` and use isolated drafts. Emulated desktop/phone/tablet checks are not physical-device certification. The migration baseline, known unrelated failure and final verification are recorded in [NEXTJS-MIGRATION-REPORT.md](NEXTJS-MIGRATION-REPORT.md).
