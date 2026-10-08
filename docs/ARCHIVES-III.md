# Archives of the Empire: Volume III

Installed as an opt-in supplement (`archives-iii`; current version in its manifest) with a separately selected animal-doctor Hedge Witch variant (`archives-iii-hedge`, 1.0.0). Enable the supplement under Choose books. Choose the animal-doctor variant under Career → Hedge Witch variant when Hedge Witch is selected and Archives III is enabled. Changing books starts a new WIP character; switching the Career variant keeps identity, Species choices and rolls, clears Career-dependent allocations/magic/equipment, and is locked while XP is spent. Neither pack changes random probabilities.

Source: supplied `Archives of the Empire - Volume III.pdf`, 96 pages, SHA-256 `e9762ca00b14029412002b331492e996f7782fb2dde92058157aec5b0dde4788`. Printed pages match PDF positions. The first running header says Volume I while the contents identify Volume III. MarkItDown text and PDF verification images remain outside the published app.

## Implemented material

| Content | Source and behavior |
|---|---|
| Priest of Handrich, Priest of Solkan, Priestess of Rhya | pp. 46, 54, 72: four-level Human Careers with printed Characteristic schemes, Skills, Talents, Status and Trappings. Academic Class inherits Fifth Edition Priest (core p. 83); no new Class kit. |
| Divine powers | Six Handrich Miracles (p. 47), six Solkan Miracles (p. 55), six additional Rhya Miracles (p. 74). Handrich and Solkan receive their printed six fixed Blessings. Rhya retains core Blessings. |
| Old Faith | p. 58: choose six distinct Blessings with Bless, one additional with Invoke, then buy further Blessings. No invented Miracles. Bless/Invoke must match. |
| Hedgecraft | Nine new spell names, pp. 62–64. Fellstave has seven separately learnable targets: Beastmen, Daemons, Orcs and Goblins, Ogres, Fimir, Trolls and Undead. No invented targets. |
| Altdorf origins | South Banker, Eastender, Dwarf Altdorfer (p. 83), Hexxerbezrik and Docklands (p. 84). Printed Skill/Talent choices with Fifth Edition physical profiles, native Languages, five Skills at +5 and normal caps. |
| Optional Cants | pp. 85–88: 24 descriptions, three per Colour Lore. Appropriate Arcane Magic and 1/3/6 known spells unlock 1/2/3 free selections. Available in Talents, Experience → Magic, folio, review and PDF/record. |
| Animal-doctor Hedge Witch | p. 62: separate opt-in Career replacement, compatible swaps and extra first-level Language (Belthani) and Secret Signs (Hedgefolk) choices. No extra free Advances. |

## User-approved decisions

- **Skip alternative armour in creator calculations** (pp. 34–38). No creation variant, new layering, helmets or alternate equipment profiles are enabled; core armour stays unchanged. The later search expansion makes the printed alternative system readable as reference text only.
- **Old Faith purchase XP excludes the six Bless grants**, counting Invoke's additional Blessing and purchases. This interpretation is explicitly user-approved; the supplement delegates prices to the core Miracle table without defining the count. With one Invoke grant, the next five purchases cost 100 XP each; after six counted Blessings, the next costs 200 XP. Prayers grant no tracker boxes. Undo returns XP and removes the prayer. Duplicates across Bless, Invoke and purchases are prohibited.
- Retain core Goodwill, Mirkride, Nepenthe, Nostrum, Part the Branches and Protective Charm rather than replacing their definitions.
- Animal-doctor variant: Lore (Herbs) → Animal Care; Trade (Herbalist) → Animal Training; Craftsman (Herbalist) → Hardy; Master Tradesman (Herbalist) → Robust. Trade (Charms) → Charm Animal remains unavailable because its source Skill is absent from the Fifth Edition Career. Secret Signs (Hedge Witch) uses core Hedgefolk. Extra choices do not increase the eight free Career Advances.
- Cants are optional free creation selections/references, with no XP, tracker boxes or permanent combat bonuses. Live Channelling, gathered power and use are deferred. Undo prunes choices that lose their threshold. Cant choices remain editable after spending XP.
- Defer Animal Familiars (pp. 75–82), including their Species/Career and bonding/progression, to the manager phase.

## Compatibility and references

Eastender Criminal **or** one random Talent is one exclusive Species slot. The printed fixed choice is the default, with an explicit random alternative. Switching clears starting Talent/magic choices. Human regional profiles grant five Species Talents plus the normal free Career Talent. Dwarfs retain native Khazalid/Reikspiel and core physical attributes.

Use core Nimble-fingered for Nimble Fingered, Resistant for Resistance, and Thieves Tongue for Thieves’ Tongue. Correct Inqusitor to Inquisitor. Add only printed new specialisations (Belthani, Torture and Fearless (Magic Users)); reuse existing Politics/Guilder choices.

Core spell XP boundaries are verified: up to five known → 100 XP; six–ten → 200; eleven–fifteen → 300; sixteen–twenty → 400; twenty-one or more → 500. Petty uses half these amounts. The existing `(count - 1)` formula is correct and preserved in the shared purchase helper. Witch! retains its separate prices.

Core p. 237 describes Arcane Spells as additional Lore Spells belonging to their traditions. Generic Arcane spells learned through a Colour Lore therefore count for that Lore's Cants. Petty, Witch!, Hedgecraft and Great Maw do not grant Colour Cants by themselves; an Elf's different Lores count separately.

Valid old Test Difficulties use Appendix I SL equivalents. Ordinary numeric bonuses remain printed references, following the user's previous supplement decision. Regenerate uses core Regeneration; Dark Vision already matches core. Descriptions do not automate alternative play systems.

Solkan suitability (p. 53), his no-Sin/no-Corruption rule (p. 55), and Handrich's profit/Sin rule (p. 47) are displayed/exported references. Ongoing tracking is deferred. Rhya permits male priests but has no Warrior Priests or Witch Hunters (p. 73); these patron/Talent combinations are rejected. Unknown descriptive Trapping weights remain unresolved; no retail prices are invented.

## Deferred scope

Enterprises, including optional starting ownership (p. 6), financing/debt, trading and shop management are deferred together to the manager phase. So are armour looting/fit/damage/repair/critical deflection, familiar creation/progression, live casting/Cants, named NPCs and adventures. These chapters are not claimed as implemented.

## Extraction and verification

`scripts/extract-archives-iii.py` stages text and Career columns/symbols. `scripts/build-archives-iii.py --output-dir dist/data/books/archives-iii` produces the reviewed pack and adjacent optional variant. Source text remains in the parent workspace's `tmp/pdfs/archives-iii-review`; scripts do not push/publish.

Tests cover every supplement combination, unchanged armour/tables, three Careers, five origins, exclusive allocations, Old Faith free/paid/duplicate/undo behavior, XP boundaries, Fellstave, Cant thresholds/Lore restrictions/undo/save validation, variant allocations and editable PDF exports. Browser checks cover desktop/mobile selections and purchases. PDFs retain all 556 editable fields with full magic/Cant references in the appended record.

## Reviewed reference imports — 7 October 2026

Current scope (8 October): standalone NPC/creature profiles and all templates are retained for possible future use but excluded from shared search, its reader and chaining. The chapter inventory below records reviewed source material; other game rules/options remain searchable, with standalone non-mechanical introductions, history/flavour and general storytelling advice removed by the later Rules audit. Qualitative requirements and worked mechanical examples remain. The GM workshop independently enables the reviewed prayer/Hedgecraft options described below.

Enterprises and their consolidated 33-outcome Events table, the alternative armour system, familiar generation/bonding/profiles, alternate Channelling, Cants and cult obligations. Alternative armour remains excluded from creator calculations, and familiar/Enterprise creation remains deferred. The non-NPC rules/options from these imports are readable in both creators regardless of enabled creation books; standalone NPC/creature profiles and templates are excluded from search. Newly imported Fourth Edition rules preserve their source mechanics with an edition warning; they do not automatically receive Legacy or enter creator catalogues. Existing approved adaptations remain unchanged. Full PDFs and staged extraction are not published. See [SEARCH-COVERAGE.md](SEARCH-COVERAGE.md) for generated source ranges/counts and [BOOK-SEARCH.md](BOOK-SEARCH.md) for the shared reader and maintenance rules.

## Search categorisation — 8 October 2026

Stoat’s introductory text and complete stat block (p. 78) are consolidated into one retained profile, now outside search. Animal Familiar Characteristics remains a genuine multi-species comparison Table. Familiar creation remains deferred.

## NPC & creature creator — 8 October 2026

Archives III is independently enabled in GM Creation books. Its twelve stat blocks comprise six named NPCs (pp. 30, 90, 92–94) and six animal familiars (pp. 76–78). Named characters are excluded; familiar creation/profiles remain deferred under the earlier user decision. No unnamed non-familiar foundation or generic template is invented. Alternative armour remains excluded, so enabling this book changes neither weapons nor armour.

The workshop reuses all 27 imported spell profiles: six Handrich Miracles, six Solkan Miracles, six additional Rhya Miracles and nine new Hedgecraft names. Core duplicate Hedgecraft definitions remain authoritative. Fellstave has seven distinct target selections with stable derived identities, preserving each chosen target through save/load, removal, undo and exports; an unspecified root Fellstave is not selectable. New Language (Belthani), Lore (Torture) and Fearless (Magic Users) choices reuse the shared registry.

Handrich/Solkan/Old Faith appear in Bless/Invoke Talent and Blessed/Miracles Trait patron controls. Old Faith Invoke opens additional Blessing choices, rather than invented Old Faith Miracles. NPC prayers are selected explicitly; PC six/one free grants, XP pricing and Career development are not applied. Printed cult obligations and Handrich/Solkan/Old Faith reference explanations appear in the app before export, without live Sin/Corruption tracking. Compact sheets contain actual chosen spells/prayers and no adaptation/discrepancy commentary.

Optional GM Cant selection remains pending the user’s Arcane spell Lore-assignment decision. The 24 printed Cants remain available in global reference search, and existing PC Cant creation is unchanged.

Focused verification: 45 affected Node regressions passed, covering the shared PC handler, GM model and exports. The 24 existing GM browser cases passed; the new Archives III scenario passed separately on desktop and mobile after its fixture supplied the required Channelling choice. Quick code/format, registry generation and offline checks passed. No new PDF layout was introduced.
