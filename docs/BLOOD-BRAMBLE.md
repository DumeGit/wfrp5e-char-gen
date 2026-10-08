# Blood and Bramble integration

Source: the user-supplied `Blood and Bramble.pdf`, 30 PDF pages. Printed pp. 1–22 match PDF positions; the unnumbered spell cards occupy PDF pp. 23–28. MarkItDown provides searchable text, and PDF column extraction preserves continued descriptions. The pack records the source SHA-256 and ships structured creator options and separately reviewed reference-only gameplay text.

Enable **Blood and Bramble** in Choose books. It adds twelve Hedgecraft and twelve Witchcraft spells from detailed entries pp. 6–17. None duplicates a spell in the other installed books. It adds no Species, Careers, Talents, starting bonuses, random tables or alternate magic-learning system.

## Spell learning and compatibility

- Existing Fifth Edition Arcane Magic (Hedgecraft) and Arcane Magic (Witchcraft) grants and purchase prices apply. Witch! offers the new Witchcraft spells using its normal learning prices; it does not unlock Hedgecraft. Petty Magic and divine Talents do not grant these spells. Existing Species/Lore restrictions remain.
- All twelve Hedgecraft spells have printed CN 0. Witchcraft CN, Range, Target and Duration remain printed values. Learning is knowledge only: it grants no ingredient, enchanted weapon, potion, spirit or summoned creature, and applies no spell effects to Characteristics, Fate, Fortune, Wounds or equipment.
- Named Fourth Edition Test Difficulties convert using core Appendix I: Difficult (−10) → −1 SL, Hard (−20) → −2 SL, Challenging (+0) → +0 SL. Unlabelled numerical situational modifiers remain printed reference descriptions, following the established supplement policy. Existing Fifth Edition Creature Traits/Talents govern; old core page references are explicitly labelled Fourth Edition.
- **User decision:** Godspakt uses its detailed p. 10 Range **You**, Target **You**. The PDF p. 28 card instead prints Touch/1. Its description records this discrepancy, rather than silently treating the card as errata.
- Nameless Summons p. 17 prints both −4 to −0 and +0 to +4. Both reference rows are retained with an explicit overlap warning; no result-0 correction or live summoning roll is invented. The spell’s continuation about the entity leaving the circle remains included.
- Continued Bonesetter, Fetterfetch, Geistbane, Woecharm and Pactbind effects are included. Quick-reference cards are summaries of existing spells, not additional learnable copies. NPC profiles, boxed fiction and adventure hooks are not player creation options.

## Ingredients

Page 6 requires ingredients for Hedgecraft, states that a successful Lore (Herbalism) foraging roll provides 1 + SL ingredients, and prices purchases at 5 brass pennies. This information is included in the new Hedgecraft descriptions as a campaign reference. It grants no free supplies or free Skill Advances.

**User decision:** offer **Hedgecraft Ingredients** at 5 pennies in the shop. Encumbrance is unknown, Availability is unlisted, and the amount supplied is unspecified. The description makes all three limits clear. The inventory quantity counts purchases, not ingredients or spell uses. The existing money, removal, packing, unresolved-weight and export systems apply. No inferred pack size, Availability rating or weight is assigned.

Foraging, ingredient consumption, live casting, Conditions, curse removal, spirit bargains/pacts and summons remain deferred to campaign management. Godspakt’s example spirits (p. 11) do not become starting companions or automatic benefits. The two NPCs and associated adventure hooks (pp. 18–22) are not imported as Career profiles.

## Maintenance and verification

`scripts/extract-blood-bramble.py` stages PDF pages and column text outside the app. `scripts/prepare-blood-bramble.py` creates the reviewed spell/ingredient pack in `../tmp/pdfs/blood-bramble-prepared`. Run MarkItDown separately as instructed by the skill. Copy only the manifest and its declared files into `dist/data/books/blood-bramble`; never publish raw pages or the source PDF.

Tests cover opt-in behavior and book combinations/load order, all 24 spell profiles, existing grants/prices/access, duplicate learning and undo, complete column continuations, named Difficulty conversions, retained numeric modifiers, Godspakt’s approved profile, the summoning overlap, ingredient price/unknown weight, save/load sources and editable PDF exports. Local browser checks use an isolated `?verify=1` draft.

## Expanded reference search — 7 October 2026

Ingredients, the three Pact Keepers’ tasks/boons, Nameless Summons and isolated NPC stat blocks. Spirits are not automatically summoned/granted. Adventure hooks and biographies remain excluded. These additions are readable in both creators regardless of enabled creation books. Newly imported Fourth Edition rules preserve their source mechanics with an edition warning; they do not automatically receive Legacy or enter creator catalogues. Existing approved adaptations remain unchanged. Full PDFs and staged extraction are not published. See [SEARCH-COVERAGE.md](SEARCH-COVERAGE.md) for generated source ranges/counts and [BOOK-SEARCH.md](BOOK-SEARCH.md) for the shared reader and maintenance rules.
