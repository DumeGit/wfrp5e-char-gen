# Core Endeavours review — 28 October 2026

Reviewed all named Endeavours on printed pp. 196–201 of the supplied _Warhammer Fantasy Roleplay, Fifth Edition_ PDF against its rendered pages and reused extraction. The PDF SHA-256 remains `f7be14489e4ccbe2d36c0124973cae8b200e42e2818c42d8785d0b104ef6d902`. Core pack 1.1.10 publishes **17 activities and one overview** in the shared search used by all four workspaces. These are reading references; this change adds no downtime automation.

## Complete activity inventory

| Endeavour         | Printed page(s)                |
| ----------------- | ------------------------------ |
| Advance Career    | 196                            |
| Animal Training   | 196                            |
| Banking           | 197                            |
| Change Career     | 197                            |
| Combat Training   | 197                            |
| Commission        | 197–198, including Custom Gear |
| Consult an Expert | 197–198                        |
| Crafting          | 198                            |
| Foment Dissent    | 198                            |
| Income            | 199                            |
| Invent!           | 199                            |
| The Latest News   | 200                            |
| Raise Reputation  | 200                            |
| Research Lore     | 200                            |
| Study a Mark      | 201                            |
| Training          | 201                            |
| Unusual Learning  | 201                            |

## Corrections and boundaries

- Animal Training was incorrectly treated as already represented by the same-name Skill. Restore its separate Endeavour: Average (+2 SL) Animal Training, one trained animal skill on success, with the printed Trained Trait reference to p. 363. The Skill retains its own identity.
- Raise Reputation was incorrectly excluded as a heading fragment. Restore its maximum-Earnings expense and temporary +1 Standing, ending at the next downtime or earlier reputation damage. This increases Standing, not Status Tier.
- Invent! was classified as a standalone Rule and therefore removed by the Rules publication policy. Classify it as an Endeavour, keeping its existing identity. Preserve Plan/Build, Trade (Engineer), the planning SL bonus, required component Skills, Very Hard (-3 SL) Crafting, twice-price materials/rarest Availability and six-price Commission. `Invent` and `Invention` are aliases.
- Crafting stopped at its first table; its later instructions had been appended to the Custom Gear sidebar. Restore both Difficulty/target-SL tables and the correct continuation under Crafting: halve for each Flaw, then add +5 per Quality; one roll per Endeavour; unfinished-work storage. Keep the original lookup tables internal, without standalone search results.
- Income stopped before Earned Income. Include all three Status/Standing earnings values, failed-Test halving/rounding, event modifiers and payment timing in the Endeavour reader. Include the p. 199 no-Income coin fallback. Standalone Earned Income remains an internal table.
- Commission includes the actual Custom Gear sidebar, now cited to pp. 197–198: GM-approved consecutive Endeavours, unspecified exceptional prices, possible Favours and material-gathering adventures. Crafting instructions no longer belong to that source sidebar.
- Common Endeavours was only an availability introduction. Consolidate it into the existing Endeavours overview, retaining its name as an alias and its original private source as an explicit editorial exclusion. The overview also retains weekly/three-per-downtime limits, GM availability, elf yenlui obligations/the detailed-guide exception, and the highest-Career Income/Standing consequences. It is the single overview result, not an eighteenth activity.
- Preserve other books’ distinct Endeavours, stable existing activity/description IDs, the Invent! punctuation, exact Test difficulties, tutor costs and limits. Do not merge different categories or books by name. Consultation does not imply that every Favour can be repaid with Endeavours; its summary refers to the different p. 200 repayment rules. No new general Rules or standalone Tables are restored to search.

Canonical wording lives in `content/descriptions/catalogue.json`; corrected private extraction and exact hashes live in the core source and `scripts/search-reference-review.json`. Generated publication/coverage comes from `npm run generate:books`. The original frozen candidate identities and exclusion evidence remain auditable.

## Verification

`tests/core-endeavours.test.mjs` checks exact activity coverage, citations, reviewed status, overview consolidation/alias, same-name Skill separation, embedded tables, recovered continuation rules, invention costs and stages, Standing duration and unchanged supplement identities. `tests/browser/endeavours.spec.mjs` checks the shared reader in one representative workspace on desktop and simulated phone: category/Book filters, omitted activities, Invent! → Crafting navigation, complete tables, overview alias and page overflow. The reader and catalogue are shared, so this content-only change does not repeat the journey in every mode. Actual run results are recorded in [Local testing](TESTING.md).
