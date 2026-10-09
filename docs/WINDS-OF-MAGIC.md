# Winds of Magic

Installed as an opt-in supplement (`winds-of-magic`, 1.0.0). Enable under Choose books. Changing books starts a new WIP character. Core definitions and random probabilities remain unchanged.

Source: supplied `Winds of Magic.pdf`, 224 pages, SHA-256 `28283188fa70d51b8f1efe3e8c3214da7be885d2a444321744ead66d1ea2a150`. Printed pages match PDF positions. MarkItDown extraction, raw page text and verification images remain outside the published app.

## Implemented creator material

| Content | Source and behavior |
|---|---|
| Twelve Careers | Beadle p. 36; Mundane Alchemist p. 38; Magister Vigilant p. 40; Scryer p. 42; Hierophant p. 56; Alchemist p. 68; Druid p. 80; Astromancer p. 92; Shadowmancer p. 104; Spiriter p. 116; Pyromancer p. 128; Shaman p. 140. Four levels, printed schemes, Skills, Talents, Status and Trappings. |
| Optional Career rolls | p. 35: Apothecary → Mundane Alchemist on 76–100; Wizard → Magister Vigilant on 96–100; Mystic → Scryer on 91–100; Guard → Beadle on 76–100. Other results retain the original. Core Wizard remains available alongside the eight College choices. |
| College affiliation | p. 35, Magister Vigilant p. 40: core Wizard and Magister Vigilant choose one of eight Colleges; College Careers have their associated Lore fixed. The first Arcane Magic Talent must match. |
| Augury | Int-based Advanced Skill, pp. 44–46. Humans and Elves only, incompatible with Psychometry. First-level Mystic option; conditional Nun with Morr/Sigmar and Priest/Warrior Priest with Morr. Astromancer has its printed option. No additional free Advances. |
| Psychometry | Int-based Advanced Skill, pp. 47–48. Humans only; a starting Scryer uses ordinary Career choices. Other Humans may sacrifice one random Species Talent to unlock paid advancement in the printed eligible Careers. |
| New spells | 136 distinct new names from pp. 26–27 and the eight College chapters. Appropriate Lore grants, core spell costs, descriptions, folio and export. |
| Ritual learning | 17 ritual descriptions from pp. 28–33, using each printed Learning XP and Lore restrictions. Learning only: no automatic items, creatures or familiar creation. |
| Robes | Practical, Standard and Elaborate Robes p. 151, at 1/8/30 GC respectively. Printed Encumbrance 1/2/4; core worn reduction applies. Prices explicitly identified as second-hand illicit-market prices. |
| Other equipment | Portable Alchemical Laboratory p. 50, explicit 12 GC with unlisted Encumbrance/Availability. Enchanted Staff p. 152 is an acquired-Trapping reference; commissioning is deferred and no shop price is exposed. |

## Approved decisions and compatibility

- **Add Lore (Alchemy) to the selectable specialisations.** Mundane Alchemist p. 38 offers Lore (Any) at level three and Savant (Alchemy) at level four. A normal Advance in Lore (Alchemy) satisfies core Savant's prerequisite (p. 125); no additional free points are granted.
- **Cap Mundane Alchemist free Petty Magic at the smaller of WP Bonus at acquisition or four.** The four permitted spells are Bearings, Open Lock, Shock and Warning (p. 39). This is an explicitly user-approved Fifth Edition adaptation, not a printed cap. A Bonus of three still grants three spells and the remaining fourth can be bought; a Bonus of four or more grants all four. Original acquisition WP Bonus remains in the ledger, with no compensating XP or banked spells. Other Careers retain normal grants.

- **Psychometry unlocks paid advancement only**, with zero extra free points. Remove the chosen random Talent's actual benefit, retaining its original roll/history. Fixed or regionally replaced Talent slots cannot be traded. A starting Scryer uses the usual eight Career Advances with no sacrifice. Non-career Advanced Skill XP applies unless Psychometry is actually a Career Skill; it grants no Career box for those non-career purchases.
- **Use the printed robe prices and explain the market qualification.** The associated-Wind Channelling bonus, wrong-Lore penalty and Witch/Hedge Witch exclusion are descriptions. Selecting or calculating situational magic equipment effects remains outside this creator. No robes or staffs are automatically awarded on promotion.
- **Defer Enchanted Staff commissioning; reference only.** The 15 GC Commission Endeavour is not an ordinary shop purchase. Its weight is not invented, and learning Imbue Staff does not manufacture a staff. The reference identifies core Quarterstaff combat statistics and the printed casting effects without adding an unresolved weapon profile to equipment calculations.
- Retain the ten printed first-level Skill choices, but use Fifth Edition's eight free Career Advances, five Species Skills at +5, creation caps, advancement costs, Talent limits and tracker promotion rules. The old requirement to Advance eight distinct Skills before promotion does not replace the Fifth Edition tracker.
- Use previously approved core aliases: Diceman → Dicer; Nimble Fingered → Nimble-fingered; Resistance → Resistant; Etiquette (Guilder) → Etiquette (Guilders); Entertain (Sing) → Entertain (Singing); Arcane Magic (Lore of ...) → the core Lore name. Animal Training is an existing grouped core Skill.
- Existing random probabilities stay unchanged. WoM supplies optional second rolls only. Illegal Species outcomes retain the original Career and explain why, using the user's established Up in Arms policy. No probability is invented for choosing among College Careers.
- Core definitions remain authoritative for **63 exact-name duplicate spells**. `duplicates.json` records their names/pages. Fat of the Land p. 87 has the same effect as core Fare of the Land p. 250; retain the core entry, not a second learnable spell. T'Essla's Arc p. 101 is distinct from Coruscating Arc and is imported separately. Sapphire Arch's continuation on p. 101 is included.
- Core requirements for additional Elf Lores remain unchanged: eight previous-Lore spells and the WP Bonus limit. Do not import WoM's additional Fourth Edition Channelling-Advance condition.
- Valid printed Test Difficulties use core Appendix I SL equivalents. Other printed numeric modifiers and temporary Talent effects remain reference descriptions; core Talents and Traits govern. Source `WFRP` page references inside effects point to the older Fourth Edition book, not the supplied Fifth Edition core.

## Ritual learning

WoM p. 27 explicitly gives XP to memorise rituals, so this is a creator purchase. Rituals require a possessed Arcane Magic Talent for a permitted Lore. Petty Magic or Witch! alone does not satisfy that requirement. Rituals for currently unsupported Dark Lore Talents remain described with disabled purchases and a visible requirement.

The ritual's printed fixed XP replaces ordinary spell prices. Cursecraft costs 200 XP generally or 100 for its listed witch/dark Lores. Rituals earn no tracker boxes, cannot be free spell grants, and do not count toward spell price bands, Cants or the eight-spell threshold for an Elf's next Lore. Duplicate learning is prohibited across Lores. Undo refunds the XP and removes the ritual. The full description and its XP source are retained in the folio/review/record and the editable sheet's magic rows.

Absent ordinary spell Range/Target/Duration fields are shown as unlisted, rather than invented. Create Familiar's permanent Resilience sacrifice uses maximum Fortune under core Appendix I; Imbue Staff's printed Fortune-or-Resolve alternative becomes Fortune. These performance costs are reference text, never deductions during memorisation. Construct/familiar profiles are not generated.

## Deferred material

Revised Fourth Edition casting/channelling and miscast systems, live Augury readings/Psychometry Tests, potion brewing and ingredients, magical item crafting/commissioning, environmental Winds, ley lines/fulcrums/waystones, magical servants/familiars, NPCs and adventures remain campaign/manager material. Concoct and other existing Talents use Fifth Edition definitions; familiar Talents do not become PC creation options.

Arcane Marks occur through play, including the Minor Miscast table's Marked by Magic result on p. 24. College affiliation does not grant a free starting Mark or require a Mark roll. Marks are referenced through College traditions; no permanent Mark effects are added at creation.

Potion ingredient costs and alchemical market/sales values are not retail prices. No new shop purchase is invented from them. Mòna's six Marsh Magic spells p. 217 belong to the Fimir adversary; no supported player Lore or Species grants them. Skin of Bone and Bark p. 218 is an adventure-acquired combined-Wind spell for two casters; no ordinary single-Lore starting grant or learning cost is specified, so it is deferred with that adventure.

## Extraction and verification

`scripts/extract-winds-of-magic.py` stages text, Career columns and schemes. `scripts/build-winds-of-magic.py --output-dir dist/data/books/winds-of-magic` produces data but does not register the pack. Raw staged files are under the parent workspace's `tmp/pdfs/winds-of-magic-review`.

Tests cover the 32 existing supplement selections, all twelve Career schemes/creation allocations, optional Career roll boundaries, College restrictions, psychic Skill access/Talent sacrifice, printed Alchemist spell choices, ritual XP/duplicates/eligibility/undo/count exclusions, strict learning-rule schema, actual robe money/Encumbrance and all 556 editable PDF fields. Desktop and 390-pixel mobile preview checks verify purchase/refund, visible disabled reasons, no horizontal overflow and ready-to-export state. The actual browser-generated PDF has 556 editable fields and matching XP/ritual values; the sheet and attached record were rendered and visually inspected.

Regression coverage includes the approved Lore prerequisite, Petty grant boundaries, unchanged grants for other Careers, purchase/undo and the subsequent Arcane grant's PDF row placement. Final desktop/mobile checks verify the Alchemist cap explanation and that buying Lore (Alchemy) makes Savant purchasable; undo restores its restriction and refunds XP. Both new character PDFs retain all 556 editable fields and were rendered for inspection.

The complete integration includes the approved Mundane Alchemist conversions and is registered for local use. No push or deployment is performed by the agent; the user controls publishing.

## Reviewed reference imports — 7 October 2026

Current scope (8 October): standalone NPC/creature profiles and all templates are retained for possible future use but excluded from shared search, its reader and chaining. The chapter inventory below records reviewed source material; other game rules/options remain searchable, with standalone non-mechanical introductions, history/flavour and general storytelling advice removed by the later Rules audit. Qualitative requirements and worked mechanical examples remain. Core GM creation is unchanged.

Casting/ritual procedures, miscasts, Endeavours, Augury/Psychometry, alchemy/potions, scrolls/grimoires/artefacts, familiars/constructs/elementals, magical environments and isolated adversary profiles/spells. Reading an adversary or combined-Wind spell does not make it a learnable player spell. The non-NPC rules/options from these imports are readable in both creators regardless of enabled creation books; standalone NPC/creature profiles and templates are excluded from search. Newly imported Fourth Edition rules preserve their source mechanics with an edition warning; they do not automatically receive Legacy or enter creator catalogues. Existing approved adaptations remain unchanged. Full PDFs and staged extraction are not published. See [SEARCH-COVERAGE.md](SEARCH-COVERAGE.md) for generated source ranges/counts and [BOOK-SEARCH.md](BOOK-SEARCH.md) for the shared reader and maintenance rules.

## Search categorisation — 8 October 2026

Construct (p. 30) is a retained creature profile outside search; its separate Construct Traits/CN lookup remains in Tables. Spell Familiar’s p. 188 introduction was removed from shared search on 9 October by user instruction; familiar creation/progression remains deferred. Other familiar gameplay rules remain searchable. Panacea Universalis and Knuckles of Ignominy are Equipment references retaining their supporting tables. Storms of Magic’s Spellcasting Rules is under Rules. None of these changes enables creation or live-play mechanics.
