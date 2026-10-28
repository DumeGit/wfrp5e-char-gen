# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Public WFRP players and GMs are the primary audience, confirmed by the user on 28 October 2026. Player and GM workflows both matter; neither audience has been given blanket priority.

Players create Fifth Edition characters, review choices and totals, export records and use a separate play sheet. GMs prepare NPCs and creatures from reviewed profiles, customise them and export usable reference sheets or cards. Both audiences can read the shared book references.

## Product Purpose

The Character Ledger is an independent, unofficial WFRP Fifth Edition companion. It supports character preparation and record keeping while keeping source rules, deliberate choices, recorded rolls and unresolved information inspectable.

Success means users can complete a supported creation workflow, understand outstanding requirements, save their work and obtain exports consistent with the calculated result. During play, the manager keeps the character's current record accessible without turning deferred systems into invented automation.

## Positioning

The product combines source-reviewed Fifth Edition creation, explicitly reviewed older-book adaptations, an unrestricted editor and a separate local play library. Rule-guided creation and freehand editing are distinct workflows. Source citations, selective Legacy explanations, recorded randomness, honest unknown values and complete exports are part of the product mechanism, not marketing claims of official approval.

## Operating Context

- Browser use on desktop, tablets and phones; the installed PWA and prepared offline assets support offline use after loading.
- Four workspaces share navigation and reference search while retaining their own editing and persistence responsibilities.
- Creators prepare characters; the separate manager handles the local library and everyday play record.
- JSON saves and backups move records between devices. Local browser persistence is not cloud synchronization or a downloaded backup.
- Editable character PDFs, full records and Bestiary sheets/cards connect the browser workflows to tabletop use.
- The existing app uses Next.js App Router, React and TypeScript around shared JavaScript rule modules, with static output in `out/`. Development starts with `npm run dev`.

## Capabilities and Constraints

| Workspace         | Route        | Product role                                                                                                                                                                                                                                                       |
| ----------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Player character  | `/`          | Guided creation with explicit book/Species/Career choices, allocations, optional recorded rolls, legal XP purchases, Review and exports.                                                                                                                           |
| Bestiary Workshop | `/bestiary/` | NPC/creature preparation from reviewed foundations and templates, customisation, equipment/magic, immediate recorded loot and full-sheet/card exports. Its approved weapon workbench creates NPC-local ordinary, magical and runic equipment from published bases. |
| Marijan Mode      | `/marijan/`  | Unrestricted one-page creation, manual values and overrides, optional reviewed random generation, independent saves and exports. It does not enforce ordinary creation, XP or money limits.                                                                        |
| The Field Ledger  | `/manager/`  | Local character library, common Player/Marijan imports, Play/Advance/Journal, current resources, affliction records, gear, reviewed advancement and backups.                                                                                                       |

- Use only user-supplied books for rules and options, plus explicit documented app-authored exceptions. Fifth Edition core rules govern. Conversions require individual review; Legacy labels identify actual adaptations rather than all older-edition content.
- Never invent missing prices, weights, probabilities, prerequisites, rules, historical purchases or verified randomness. Preserve unknown values and report unsupported mechanics explicitly.
- Creator drafts are independent. Importing into the manager creates a separate record and preserves imported totals, manual values and historical attachments. Do not double-apply Talents or reconstruct purchases that were never recorded.
- Calculations, Review and exports consume shared results. Undo/Redo and current save validation must preserve meaningful changes and their provenance.
- The manager uses local IndexedDB with revision checking. There is no account server or cloud synchronization. Browser cache is not a character backup.
- Complex live casting, crafting, automatic affliction effects/recovery and companion/business systems remain manual unless a separately approved handler exists. The approved Bestiary weapon workbench is an owned-equipment tool, not crafting simulation.
- Keep the creators as desktop navigation plus editor and compact full-width editing. Character/creature folio panels and their mobile View/Back controls were explicitly removed.
- No publishing, deployment or push is implied by design work. Follow the repository's local verification and commit policy.

## Brand Commitments

The established identity is the Character Ledger and its four named workspaces. Preserve the user-approved Imperial Desk direction and existing artwork/identity commitments when refining or extending the app; their visual specifications remain in `docs/DESIGN-SYSTEM.md` and `docs/UNIFIED-DESIGN-IMPLEMENTATION-PLAN.md`.

The app is explicitly unofficial and is not affiliated with or endorsed by Games Workshop or Cubicle 7. Preserve notices, asset provenance, licences and canonical game terminology. Interface language should be direct and specific, with clear distinctions between calculated effects, play references and unresolved source information.

## Evidence on Hand

- `AGENTS.md`: current user decisions, rule authority, exclusions and maintenance policy.
- `README.md` and `docs/README.md`: implemented capabilities, routes and documentation ownership.
- `docs/CREATOR-UX.md`, `docs/GM-WORKSHOP.md`, `docs/WEAPON-CREATOR.md`, `docs/MARIJAN-MODE.md` and `docs/CHARACTER-MANAGER.md`: workflow boundaries and implemented behavior.
- `docs/BOOKS.md`, individual book guides and generated coverage inventories: content provenance, reviewed adaptations and unresolved scope. Obtain current counts from generated reports rather than dated prose.
- `src/`, `tests/` and `docs/TESTING.md`: implementation and verification evidence; dated test results do not certify future changes.
- `design-assets/` and `/legal/`: artwork provenance and public notices. Supplied source PDFs and credentials must not be published.

Do not invent adoption figures, testimonials, rights-holder permission or performance claims. This record establishes no commercial or endorsement claims.

## Product Principles

1. Source truth before convenience: show unknowns, cite decisions and automate only reviewed mechanics.
2. Keep work reversible and inspectable: preserve drafts, imports, manual values, history and reliable backups.
3. Support both public player and GM workflows with shared conventions and clear tool boundaries.
4. Keep preparation, everyday play and reference reading connected without silently changing character data.
5. Make saved records, calculated results and exports agree; communicate blockers where users can resolve them.

## Accessibility & Inclusion

Preserve keyboard navigation, visible focus, meaningful labels, native controls and dialog focus return. Compact/coarse-pointer controls retain 44px targets and phone fields retain 16px text. Respect system reduced motion, gate hover effects to hover-capable fine pointers, preserve readable contrast and keep status/errors understandable without colour alone. Layouts must reflow without obscuring fields, actions or validation messages. Do not claim certification from emulated browser checks.
