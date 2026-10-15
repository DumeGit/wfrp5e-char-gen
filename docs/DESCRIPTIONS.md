# Canonical descriptions

`content/descriptions/catalogue.json` is the authoring source for description wording across the installed books. Records contain a stable description ID, book/page, text and editorial status. Exact source bindings retain a SHA-256 of original wording. Equivalent projections share explicit bindings, such as core Creature Trait references and GM definitions. Same-name content from different books is not merged.

`content/descriptions/trait-rules.mjs` owns conditional presentation: actual Size, Swarm, Breath types, Chaos god, training and Fly rating. The build emits `dist/description-rules.mjs`; never edit the generated copy. GM and Marijan share it. Static Trait wording lives in the catalogue, not a separate GM word bank. Explicit situational replacements still take precedence.

## Sources and published data

Original structured extractions live in `content/sources/data/` and `content/sources/gm/books/`, outside static hosting. These are audit/rebuild inputs, not the place to edit public wording. Extraction scripts write there; existing PDF hashes and printed-reference reviews remain enforced. Original PDFs are not published. Moving inputs does not remove every original passage: imported descriptions still retain their existing wording until reviewed. This is not legal clearance or Git history removal.

The source loader hydrates canonical text before validating book packs. Explicit Skill reference targets also populate creator Skills. The generator hydrates GM definitions before compilation, then emits the existing book, search, rule-reference and GM payloads. Views, folios and exports read resolved profiles. Generated copies are expected; there is one editable wording source. No editorial-catalogue fetch is added to browser startup or search. Browser preparation hashes `content/`; the offline worker includes resolved assets and excludes source/catalogue inputs.

Book/page references, structured statistics, purchase limits, calculations, restrictions and Legacy decisions remain authoritative. Editing prose cannot change XP formulas or make unsupported mechanics automated. Adaptation notes remain separate and excluded from search matching. Handler-specific replacements remain explicit.

GM sheets use the same parameter-aware summary as the app. They no longer choose a competing printed blurb because it is shorter or show a second full-wording disclosure. Profile blurbs remain evidence for discrepancy notices. Card fit checks still apply; never truncate mechanics to force a card to fit.

Marijan source entries save their description ID and an empty personal-description field rather than stale catalogue wording. Display/results/PDF resolve that ID. Explicit personal descriptions and custom entries remain independent; clearing an override restores shared wording. Generated quantity notes stay separate. Old snapshots lacking an ID retain fallback text. Other freehand edits retain their existing behavior.

## Editorial contract

- `imported`: centrally registered existing wording; **not** certified as paraphrased or shortened.
- `reviewed`: complete mechanical summary, labelled in the reader “Mechanical summary — consult the cited book for the full rule.”
- Retain triggers, costs, Tests/Difficulties, ratings, effects, durations, limits, exceptions and prerequisites. Remove flavour/repetition only after checking the supplied source. Preserve structured CN/Range/Target/Duration and citations.
- No automated synonym replacement, character truncation or blanket edition conversion. Never invent missing mechanics. Distinct variants remain distinct.
- [DESCRIPTION-COVERAGE.md](DESCRIPTION-COVERAGE.md) reports registration/review counts. Conditional Trait presentation is authored separately in the same directory. Registration does not imply the entire corpus has been paraphrased.

## Maintenance

1. Add/review original extraction under `content/sources/`, following the existing book/reference review process.
2. Run `npm run descriptions:register` for **new** fields. This never overwrites approved wording or accepts changed existing extraction. For source changes, review the actual difference, then update the exact binding's source hash, source metadata and affected summary together. Do not reset a whole book's review just to pass.
3. Edit the canonical record and set its status after source verification. Link projections explicitly only when they represent the same definition. IDs derive from stable source identities; do not re-key them for wording edits.
4. Run `npm run check:descriptions` and `npm run build`. Generation and `check:generated` enforce coverage, source hashes and output consistency. Missing/orphan bindings, ambiguous IDs, source drift and accidental cross-book links fail.
5. Add focused regressions for changed mechanics, aliases, conditional output and overrides. Run affected UI/export checks when those paths change. Keep feature docs and AGENTS.md current.

The initial migration centralises all registered `.text` fields and reuses previously reviewed Trait summaries. Remaining editorial work stays visible instead of being marked complete.
