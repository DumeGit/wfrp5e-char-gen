# Canonical descriptions

`content/descriptions/catalogue.json` is the authoring source for description wording across the installed books. Records contain a stable description ID, book/page, text and editorial status. Exact source bindings retain a SHA-256 of original wording. Equivalent projections share explicit bindings, such as core Creature Trait references and GM definitions. Same-name content from different books is not merged.

`content/descriptions/trait-rules.mjs` owns conditional presentation: actual Size, Swarm, Breath types, Chaos god, training and Fly rating. The build emits `src/engine/description-rules.mjs`; never edit the generated copy. GM and Marijan share it. Static Trait wording lives in the catalogue, not a separate GM word bank. Explicit situational replacements still take precedence.

## Sources and published data

Original structured extractions live in `content/sources/data/` and `content/sources/gm/books/`, outside static hosting. These are audit/rebuild inputs, not the place to edit public wording. Extraction scripts write there; existing PDF hashes and printed-reference reviews remain enforced. Original PDFs are not published. All retained descriptions have now been reviewed. Pure numerical tables, proper names, named grants and terse statistical labels are explicitly marked `reviewType: structured-data`; their values remain as printed. This is not legal clearance or Git history removal.

The source loader hydrates canonical text before validating book packs. Explicit Skill reference targets also populate creator Skills. The generator hydrates GM definitions before compilation, then emits the existing book, search, rule-reference and GM payloads. Views, folios and exports read resolved profiles. Generated copies are expected; there is one editable wording source. No editorial-catalogue fetch is added to browser startup or search. Browser preparation hashes `content/`; the offline worker includes resolved assets and excludes source/catalogue inputs.

Book/page references, structured statistics, purchase limits, calculations, restrictions and Legacy decisions remain authoritative. Editing prose cannot change XP formulas or make unsupported mechanics automated. Adaptation notes remain separate and excluded from search matching. Handler-specific replacements remain explicit.

Reviewed source-conflict notes are displayed separately beside the summary, while adaptation explanations retain their Legacy access. Matching excludes both. Note extraction accepts paragraph-layout changes, and source-specific exclusions recognise the reviewed shorter wording. The Gnome PDF adaptation warning is selected by Species/source identity, never by an English prose prefix.

GM sheets use the same parameter-aware summary as the app. They no longer choose a competing printed blurb because it is shorter or show a second full-wording disclosure. `scripts/public-gm-data.mjs` compiles source-conflict notices before removing unused full stat-block text and duplicate sections from published profiles/templates. Structured scores, attacks, Skills, armour, actual Traits, Trappings and template operations remain. Attack free/ranged classification is captured from the source before editorial hydration, so rewriting a sentence cannot change its calculation. Card fit checks still apply; never truncate mechanics to force a card to fit.

The user-approved Bestiary Description switches optionally omit an individual Trait/Talent summary from the stat block and PDFs. Names, ratings/parameters and ranks remain. All descriptions default to shown, and canonical wording remains intact/readable in the editor and search; this is a per-draft output preference, not an editorial rewrite or calculation change. Preview, both PDF formats and card height measurement share `src/engine/gm/ability-presentation.mjs`.

Standalone category `rule` records are excluded from creator assembly, both public reference payloads and search; they are no longer distributed as hidden source text. Other categories remain, including Conditions, Psychology, Traits, properties, Skills, magic, real tables and Endeavours. Original Rules remain private source/audit material. Explicit exclusions live in the catalogue's `excludedReferences`: six hireling-generation/job-hook entries and the Common Endeavours introduction consolidated into the Endeavours overview. Both hydration and corpus generation honour them; frozen historical reviews retain their original evidence. The [core Endeavour review](CORE-ENDEAVOURS-REVIEW.md) records corrected classifications and recovered table/sidebar continuations.

Marijan source entries save their description ID and an empty personal-description field rather than stale catalogue wording. Display/results/PDF resolve that ID. Explicit personal descriptions and custom entries remain independent; clearing an override restores shared wording. Generated quantity notes stay separate. Old snapshots lacking an ID retain fallback text. Other freehand edits retain their existing behavior.

## Editorial contract

- `imported`: centrally registered existing wording; **not** certified as paraphrased or shortened.
- `reviewed`: complete mechanical summary, labelled in the reader “Mechanical summary — consult the cited book for the full rule.”
- `editorialComplete: true` makes an unreviewed description a publication error. A new registered field starts as `imported` and must be reviewed before building; registration does not approve wording.
- Retain triggers, costs, Tests/Difficulties, ratings, effects, durations, limits, exceptions and prerequisites. Remove flavour/repetition only after checking the supplied source. Preserve structured CN/Range/Target/Duration and citations.
- No automated synonym replacement, character truncation or blanket edition conversion. Never invent missing mechanics. Distinct variants remain distinct.
- [DESCRIPTION-COVERAGE.md](DESCRIPTION-COVERAGE.md) reports registration/review counts. Conditional Trait presentation is authored separately in the same directory. Registration does not imply the entire corpus has been paraphrased.

## Maintenance

1. Add/review original extraction under `content/sources/`, following the existing book/reference review process.
2. Run `npm run descriptions:register` for **new** fields. This never overwrites approved wording or accepts changed existing extraction. For source changes, review the actual difference, then update the exact binding's source hash, source metadata and affected summary together. Do not reset a whole book's review just to pass.
3. Edit the canonical record and set its status after source verification. Link projections explicitly only when they represent the same definition. IDs derive from stable source identities; do not re-key them for wording edits.
4. Run `npm run check:descriptions` and `npm run build`. Generation and `check:generated` enforce coverage, source hashes and output consistency. Missing/orphan bindings, ambiguous IDs, source drift and accidental cross-book links fail.
5. Add focused regressions for changed mechanics, aliases, conditional output and overrides. Run affected UI/export checks when those paths change. Keep feature docs and AGENTS.md current.

The completed editorial pass covers every retained registered `.text` field. Generated coverage distinguishes prose summaries from reviewed structured-data exceptions. [DESCRIPTION-REVIEW.md](DESCRIPTION-REVIEW.md) records source ambiguities and exclusions without creating another wording bank. Source gaps remain explicit; the rewrite does not infer missing effects or make new edition conversions.
