# Archives of the Empire: Volume III

Installed as an opt-in supplement (`archives-iii`, 1.0.0) with a separately selected animal-doctor Hedge Witch variant (`archives-iii-hedge`, 1.0.0). Enable under Origins → Books & options. Changing books starts a new WIP character. Neither pack changes random probabilities.

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

- **Skip alternative armour entirely** (pp. 34–38). No variants, new layering, helmets or alternate profiles imported; core armour stays unchanged.
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

Enterprises, including optional starting ownership (p. 6), financing/debt, trading and shop management are deferred together to the manager phase. So are armour looting/fit/damage/repair/critical deflection, familiar creation/progression, live casting/Cants, NPCs and adventures. These chapters are not claimed as implemented.

## Extraction and verification

`scripts/extract-archives-iii.py` stages text and Career columns/symbols. `scripts/build-archives-iii.py --output-dir dist/data/books/archives-iii` produces the reviewed pack and adjacent optional variant. Source text remains in the parent workspace's `tmp/pdfs/archives-iii-review`; scripts do not push/publish.

Tests cover every supplement combination, unchanged armour/tables, three Careers, five origins, exclusive allocations, Old Faith free/paid/duplicate/undo behavior, XP boundaries, Fellstave, Cant thresholds/Lore restrictions/undo/save validation, variant allocations and editable PDF exports. Browser checks cover desktop/mobile selections and purchases. PDFs retain all 556 editable fields with full magic/Cant references in the appended record.
