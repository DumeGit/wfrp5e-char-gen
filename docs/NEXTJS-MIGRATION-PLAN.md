# Next.js migration implementation plan

**Completed migration plan, retained as history.** The app now uses Next.js App Router, React/TypeScript and a static `out/` export. Migration results are in [NEXTJS-MIGRATION-REPORT.md](NEXTJS-MIGRATION-REPORT.md); use [ARCHITECTURE.md](ARCHITECTURE.md) for current ownership and [CHARACTER-MANAGER.md](CHARACTER-MANAGER.md) for the subsequently added fourth workspace. Unchecked proposal items and suggested work sequencing below are historical, not current pending work or authorization.

Prepared: 17 October 2026.

Status: implemented locally on 18 October 2026; final verification and known limitations are recorded in [NEXTJS-MIGRATION-REPORT.md](NEXTJS-MIGRATION-REPORT.md). Deployment remains separately authorized. The plan below records the agreed migration scope and acceptance criteria.

## Objective and user decisions

Migrate the current Player, Bestiary and Marijan creators to Next.js. Use an orchestrator and narrowly scoped implementation agents, with coordinated integration.

This is a behaviour-preserving migration of the current app. Retain its appearance, book content, calculations, saved drafts and exports. Keep the three creator save formats distinct and preserve their current import behaviour. New modes and features are outside this plan's scope.

## Repository and handoff context

- Workspace: `C:/Users/ninod/Documents/ChatGPT/warhammer`.
- Git repository and Vercel project root: `C:/Users/ninod/Documents/ChatGPT/warhammer/character-generator`.
- Read the repository's `AGENTS.md` before working. It contains the authoritative project constraints and approved book adaptations; this plan supplements it.
- Read `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/DESIGN-SYSTEM.md`, `docs/STARTUP-PERFORMANCE.md`, `docs/DESCRIPTIONS.md` and the relevant mode documentation.
- The existing app uses browser JavaScript modules and static hosting. Its three entry points are Player, Bestiary and Marijan.
- `dist/` currently contains authored application code as well as generated/public files. It must not be treated as disposable output until its authored code is extracted.
- GitHub pushes automatically deploy to Vercel. Commit locally and report meaningful hashes. Do not push or change hosting settings without explicit authorisation for that action.
- Keep automated testing local. Do not add GitHub CI.
- No analytics, accounts, backend database or application server are required by this migration.
- This handoff should be reviewed against the actual current checkout. Do not assume that unrelated changes made after its preparation can be discarded.

## Proposed technical direction

Use Next.js App Router, React and TypeScript. Pin compatible stable dependencies and the supported development Node version when implementation starts.

Initially use a static export so the app can retain static hosting and local character storage. Server-rendered static structure and metadata can coexist with browser-side interactive components. Browser APIs must only run in a valid browser lifecycle; adding `use client` alone does not make module-level `window` or `localStorage` access safe during prerendering.

Keep the existing game-rule modules in JavaScript initially. Add typed interfaces and adapters around them, and write new React/state code in TypeScript. Do not combine this work with a wholesale rule-engine rewrite or mandatory conversion of every rule file.

Suggested layout:

```text
src/
  app/                    Next.js routes and layouts
  components/             Shared React controls and shell
  features/
    player/
    bestiary/
    marijan/
    reference-search/
  domain/                 Existing calculations and book mechanics
  state/                  Independent creator stores and commands
  services/               Storage, content loading and downloads
  exports/                Existing PDF and record generators
  styles/                 Existing themes and shared styling

content/                  Canonical wording and private build inputs
public/                   Approved assets and generated public data
scripts/                  Generation, validation and offline build tools
tests/
```

These are proposed boundaries, not permission to move all files simultaneously. Settle module contracts and update dependencies in controlled steps.

## Non-negotiable compatibility

- Preserve all three creators, their separate drafts and their distinct themes.
- Preserve Fifth Edition calculations, explicit supplement handlers, reviewed aliases, source references and selective Legacy tags.
- Preserve the canonical description source under `content/descriptions/`; do not create a React-specific wording catalogue.
- Preserve current JSON save/import behaviour, independent histories, recorded dice and random-creation eligibility.
- Preserve search categories, filters, reference chaining, Career membership tables and reset-on-close behaviour. Rules remain excluded from public search.
- Preserve existing PDF sheets, creation records and Bestiary cards, including actual ability summaries, conditional Desc, Soak formatting and flexible packing as the default.
- Preserve the shared compact navigation through 1000 CSS pixels, desktop behaviour above that boundary, touch targets and readable Marijan numeric fields.
- Preserve installation, offline access, safe updates, public notices and the absence of analytics.
- Do not publish source PDFs, private extraction or credentials.
- Do not silently change game rules while migrating the UI. Record unrelated defects separately unless they directly block migration.

## Phase 1: establish the baseline

1. Record the starting commit, working-tree state and pending local commits.
2. Inventory features, entry points, public assets, content-generation outputs and storage keys.
3. Capture representative Player, Bestiary and Marijan screenshots at desktop, phone and tablet sizes.
4. Prepare representative saved drafts and calculated results for parity comparisons.
5. Record current broader-suite failures separately from migration regressions.
6. Record cold startup, first-use loading and warm navigation measurements using repeatable conditions.
7. Create a migration compatibility checklist and a controlled integration branch/work area.

Acceptance: a reproducible baseline exists, including known failures and the current tablet improvements.

## Phase 2: extract domain code and separate output

1. Identify modules that are independent of the DOM and retain their behaviour.
2. Separate authored source from generated/public files before replacing the existing build structure.
3. Update content-generation and Node-test imports in coordinated steps.
4. Preserve book manifests, content identities, schemas, reviewed aliases and source checksums.
5. Keep large book/search payloads as generated public files rather than embedding duplicate JSON into client bundles.
6. Introduce explicit asset resolution. Existing `new URL(..., import.meta.url)` paths must be reviewed for bundler handling, public URLs and Node build-time reads.
7. Keep original extraction and unreviewed source material outside the public build.

Acceptance: content generation and rule tests work independently of the old page scripts. Generated content has no unexplained mechanical or editorial differences.

## Phase 3: Next.js foundation and early feasibility checks

Set up dependencies, TypeScript, formatting, type checking and production output. Preserve the same repository and hosting project root.

Proposed routes:

| Route | Purpose |
| --- | --- |
| `/` | Player creator |
| `/bestiary/` | NPC and creature creator |
| `/marijan/` | Marijan Mode |
| `/legal/` | Existing public notices |

Keep old addresses such as `gm.html`, `marijan.html` and `legal.html` functional through explicit compatibility handling, preserving applicable query parameters. Do not rely on unsupported static-export server features; implement aliases or hosting configuration deliberately and test them.

Before converting complete screens, demonstrate:

- Client-side navigation between mode routes.
- Direct loading, refreshing and browser Back/Forward.
- Independent draft restoration.
- Correct initial and route-change themes without a wrong-theme flash.
- Local browser API access without prerender/hydration errors.
- Offline refresh and client navigation between two routes.

Acceptance: the production build proves the routing, storage and offline approach. Resolve feasibility problems here before broad feature conversion.

## Phase 4: shared state and lifecycle contracts

Give each mode its own store, commands, revision, calculated result and history. React components render the existing calculation results; existing rule functions remain responsible for prices, eligibility and mechanics.

Example command boundaries:

```text
Player:   chooseSpecies, allocateSkill, purchaseAdvance
Bestiary: applyProfile, applyTemplate, changeTrait
Marijan:  setCharacteristic, addEntry, generateCharacter
```

| State | Examples | Lifetime |
| --- | --- | --- |
| Character data | Scores, gear, purchases and book choices | Saved |
| Mode session | Undo/Redo, current step and disclosures | Current application session |
| Shared services | Loaded source data, search index and PDF runtime | Reused across modes |

Requirements:

- Preserve independent mode state and assembled catalogue context.
- Cache reusable source data without introducing a shared mutable rules catalogue.
- Keep input typing, focus and history grouping stable.
- Navigation and other no-ops must not clear redo or create character edits.
- Preserve dice records and Player roll-attempt counters across history changes and mode switching.
- Never award another first-roll benefit because a screen remounted.
- Keep current save formats readable; do not invent historical purchases or XP records.
- Make subscriptions, event listeners, observers and asynchronous callbacks disposable.
- Development remounts must not duplicate listeners, rolls, saves or commands.
- Dialogs and pending tasks must not mutate another mode after navigation.

Acceptance: focused store tests prove saving, isolation, history and derived-result consistency before feature components depend on the contracts.

## Phase 5: shared React shell and controls

Convert the existing shared interface into components:

- Banner, mode navigation and route-aware themes.
- Desktop rail and compact phone/tablet tools menu.
- Step/section selector and bottom history/View controls.
- Fields, steppers, help controls, dialogs and disclosures.
- Structured issues, focus routing and export blockers.
- Busy/retry states and expiring notifications.
- Installation and update controls.

Preserve the approved artwork, textures, themes and CSS appearance. Maintain CSS order during the initial conversion, then scope styles deliberately as components are extracted.

React must own the DOM inside converted components. Existing controllers must not also replace or rearrange that DOM. Temporary legacy adapters need explicit mount/dispose boundaries.

Keep native dialog semantics, accessible labels, stable disclosure identifiers, keyboard focus, reduced-motion support and the 1000/1001px shell boundary.

Acceptance: shared shell behaviour works across modes and resizing does not duplicate controls or lose listeners/state.

## Phase 6: migrate the three creators

Recommended sequence: Marijan, Bestiary, then Player. Marijan exercises editable forms and lists; Bestiary adds templates and structured choices; Player has the greatest creation/progression dependencies.

For each mode:

1. Connect the existing model through the agreed state contract.
2. Convert sections into React components with stable field and list identities.
3. Preserve transient browsing state, disclosures, caret and focus.
4. Connect the shared calculations, references, save actions and existing exporters.
5. Compare results and workflows with the baseline.
6. Remove replaced controller and renderer code once parity is established.

Marijan scope: unrestricted inputs, custom entries, manual overrides, compact resources, random generation and its original generation record.

Bestiary scope: foundations, books, templates, characteristics, Traits, Skills/Talents, gear/magic, issue repair, review and print-batch controls.

Player scope: Origins, Career, Characteristics, starting Skills, Talents, gear/money, Experience, folio, Review and records. Creation screens and Experience/Review can become separate agent assignments after their common state/action contract is stable.

A temporary wrapper around the old interface is scaffolding. A mode is not complete while its main UI still depends on a large HTML-string renderer inside that wrapper.

Acceptance: each mode works independently and survives repeated cross-mode navigation without lost edits, mixed histories or accumulating listeners. The final app has one authoritative implementation for each feature.

## Phase 7: search, content services and exports

- Use one shared search service with React presentation components.
- Preserve categories, filters, automatic batches, references, Career tables and reset-on-close behaviour.
- Keep search independent of character book selection.
- Keep the wider tablet filter layout independent of compact-shell launcher placement.
- Load search data on first use and avoid duplicate source downloads/assembly.
- Keep PDF tools and exporters lazy, with existing busy/retry feedback.
- Reuse export calculations and PDF layout code rather than rewriting them with the UI.
- Preserve editable character-sheet fields, complete records and Bestiary card layouts.
- Compare PDF fields, text, dimensions and visual layout rather than raw file bytes, which can vary with metadata.

Acceptance: search and exports have equivalent output and behaviour, and initial mode startup does not execute unnecessary export code.

## Phase 8: production PWA and offline integration

Run an early prototype during Phase 3, then complete this work against the actual production output.

The existing worker enumerates `dist` and uses query-insensitive matching. Do not copy it unchanged into Next.js. Account for generated route documents, hashed assets and App Router navigation payloads as well as book data, artwork, fonts and PDF assets.

Requirements:

- Preserve the manifest identity, scope and installed-app behaviour.
- Generate the offline inventory after the final Next.js output exists.
- Handle route-document and router-payload requests correctly; avoid a blanket HTML fallback for unrelated requests.
- Test first installation, offline reload, unopened routes/references and client navigation.
- Test both old-to-new deployment updates and subsequent Next.js-to-Next.js updates.
- Preserve current edits during updates and retain explicit update/reload behaviour.
- Apply service-worker/manifest cache headers through supported hosting configuration.
- Prevent stale caches from mixing incompatible build assets or navigation payloads.

Acceptance: offline soft navigation, hard refresh and safe updates pass against production-shaped output. Successful development-server navigation alone is insufficient.

## Phase 9: verification and performance

Keep tests proportional during implementation. Agents run affected Node/component tests; coordinate browser testing centrally to avoid server collisions and repeated complete runs.

Final acceptance covers:

- Rules, manifests, aliases, descriptions and generated-content validation.
- Current-format saves, imports, reloads and independent mode storage.
- Calculated-result parity across UI and exports.
- Repeated navigation, session restoration, Undo/Redo and dice eligibility.
- Search/filter/chaining behaviour, stable typing and focus.
- Actual JSON and PDF downloads, plus visual PDF inspection where layout changed.
- Desktop, phone and Lenovo tablet scenarios, including enlarged settings and short landscape windows.
- Offline startup, navigation, installation and updates.
- No application analytics and no private source files in published output.
- Cold startup, first-use loading and warm navigation against the recorded baseline.

Set performance budgets from the baseline before implementation. Investigate regressions; Next.js/React are not themselves proof of faster loading. Control route prefetching so opening Player does not eagerly initialise every creator and catalogue.

The existing local Playwright fixtures and tests should be adapted, not replaced by a second exhaustive test system. Add framework/component checks where they protect meaningful outcomes. Keep development and production-build checks distinct. Run the broad release gate at integration milestones and final acceptance, not after every small agent change.

Acceptance: the compatibility checklist is satisfied, remaining known issues are explicit, and no migration regression is hidden behind a test skip or weakened expectation.

## Phase 10: cutover, documentation and cleanup

1. Keep the same repository and Vercel root.
2. Prepare build/output settings and compatibility routes before deployment.
3. Update `AGENTS.md`, README, architecture, testing, startup, PWA, feature and hosting documentation alongside each affected change.
4. Remove replaced entry points, bridges and duplicate implementations after parity is demonstrated.
5. Record tested commands, results, current limitations and local commit hashes.
6. Prepare a rollback procedure that also considers installed service-worker caches.
7. Obtain explicit push/deployment authorisation at cutover.

Acceptance: all three current creators are complete on the new foundation, the compatibility checklist is satisfied, and the old deployment can be recovered if necessary.

## Multi-agent implementation model

The lead agent acts as orchestrator. With the currently available capacity, use at most three active implementation agents alongside the lead. The roles below run across successive waves; they are not all launched simultaneously. Recheck actual capacity in the implementing chat.

| Role | Bounded responsibility |
| --- | --- |
| Orchestrator | Architecture, contracts, dependency sequencing, shared configuration, integration, review and final acceptance |
| Domain/content agent | Rule-module extraction, generation pipeline, content identities, aliases and calculation parity |
| Shared-interface agent | React controls, shell, dialogs, responsive navigation and accessibility |
| Marijan agent | Editable sections/lists, generation integration and mode-specific state |
| Bestiary agent | Profiles/templates, customisation, equipment/magic, review and print controls |
| Player creation agent | Origins through starting equipment |
| Player advancement agent | Experience, folio and Review after common Player contracts are stable |
| Search specialist | Search service and React reader/filter presentation |
| Platform specialist | Bounded PWA, build-output and deployment integration work |
| Verification agent | Parity fixtures, migration regressions and independent review |

### Wave order

1. Baseline: parallel read-only inventories of domain/content, browser lifecycle/state and platform/test risks. The orchestrator settles contracts.
2. Foundation: domain extraction, shared component groundwork and an offline/routing prototype can proceed within explicitly separated files.
3. First feature: Marijan conversion, shared search work and independent verification.
4. Remaining creators: Bestiary and Player creation; Player advancement joins only when the Player state contract is stable and capacity is available.
5. Integration: PWA/platform completion, parity review and targeted fixes.
6. Cutover: orchestrator-controlled release checks, documentation and reviewable local commits.

### Assignment contract

Every agent receives:

- A concrete deliverable and acceptance criteria.
- Explicit file/directory ownership and shared interfaces.
- The relevant repository instructions and feature documentation.
- The checks appropriate to that assignment.
- A requirement to report changed files, verification results, risks and blockers concisely.

Avoid concurrent edits to shared files. The orchestrator owns package/dependency changes, route/layout configuration, central state contracts and integration changes. Specialists can propose changes to these areas for central application.

Use isolated work areas where practical. Do not overwrite unrelated user changes or another agent's work. Coordinate browser runs through the existing isolated local test server. No implementation agent should independently push, deploy, change game rules or add unrelated dependencies.

Use narrowly scoped agents for parallelism and review, not one agent per tiny component. Avoid repeated whole-suite testing and long duplicate logs. A wrapper, successful build or passing smoke test alone is not evidence that a mode is fully migrated.

## Official technical references

- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js PWA guidance](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [React integration into an existing project](https://react.dev/learn/add-react-to-an-existing-project)

Verify the exact supported features and dependency versions when implementation starts. Framework documentation informs the technical integration; the supplied books and reviewed repository decisions remain the only authority for game mechanics.
