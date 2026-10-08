# Legacy: actual Fifth Edition adaptations

The user requested persistent **Legacy** tags on rules adapted to Fifth Edition, including High Elf Player’s Guide. The initial implementation incorrectly tagged every Fourth Edition source. The corrected policy is item-specific: **being in a Fourth Edition book is not an adaptation**.

## Boundary

Tag a changed printed rule, such as replacing Advantage with Momentum, converting an old Test Difficulty into SL, changing Fate/Resilience into Fate/Fortune, omitting an old per-rank Talent Test bonus, replacing a Talent/Miracle with a revised core definition, or an approved Fifth Edition grant/cap interpretation. The badge’s tooltip explains the actual change.

Do not tag unchanged profiles, printed specialisations, names/background, printed prices/weights, generic use of core advancement, spelling corrections, table errata, unresolved statistics, unavailable entries without an agreed conversion, or systems merely deferred to the manager. Compatible situational effects remain compatible even when displayed only as descriptions. A printed SL modifier is not automatically a conversion: High Elf Yenlui and Obsession already use SL as printed and remain untagged.

An adapted regional allocation/Career may carry a profile tag, but its unaffected core Talents, native languages, Characteristics and starting equipment do not inherit it. Selected Skills granted through a changed starting allocation identify that allocation; their core definition is unchanged. Ordinary paid Career Skills do not inherit an unrelated converted Talent’s tag. A mixed source list shows tags only on affected entries.

## Reviewed examples

| Book | Actual adaptations | Compatible content without Legacy |
|---|---|---|
| Up in Arms | Tilean starting allocations/native language; replaced older Talent definitions; In Good Order’s Advantage → Momentum | New equipment, unchanged Miracles, ordinary Career Skills, spelling-only aliases |
| Archives I | Clan allocations/Small omission/native language; Eonir creation profiles; Youngblood’s omitted rank Test bonus; changed Talent choices; Blackbriar’s converted resistance Difficulty | Unchanged weapons/ammunition, new Lore/Trade specialisations, Mootland access as printed |
| Archives II | Ogre Fate/Fortune/Size/allocations; carrying/sizing interpretations; converted Great Maw Difficulties; Vice rank Test bonus omission; star-Talent compatibility | Explicit Ogre equipment profiles, traditional names, unchanged printed astrology modifiers |
| Archives III | Altdorf allocations; adapted animal-doctor Career; Old Faith extra-Blessing XP count; individually converted spells | Ordinary Priest Skills/equipment, unchanged new spells, all Cants, Old Faith’s six unchanged Bless-granted prayer effects |
| Winds of Magic | Paid-only Psychometry trade; Alchemist’s capped free grant; Psychometry’s converted Endurance Difficulty; individual spell/ritual Difficulty/resource conversions | Augury, Lore (Alchemy), unchanged spells/rituals such as Create Power Stone, printed robe prices, reference-only staff |
| Rough Nights | Gnome Fate/Fortune/allocations/Small Wounds; Suffuse’s omitted rank Test bonus; specific revised Evawn/Mabyn Miracle grants | Names/appearance, Ghassally, Ringil and unaffected Evawn/Mabyn prayers |
| Dwarf Guide | Regional allocations; Longbeard resources; Talents with omitted printed rank Test bonuses; individual converted rune effects; Skycraft Difficulty | Unchanged Talents such as Forgefire/Harpooner, rune effects without conversions, printed gear, names, equipment swaps |
| High Elf Guide | Regional allocations; ungrouped Animal Care/Sail; Mage 4-spell/individual-point progression; approved Elven Sailor; Elder resources/points; Blood core Psychology/ritual discount; High Magic cap; Elven Arcane price attribution; individual converted effects | Martial Arts, Sword-dancing’s printed system, Lileath’s Blessing, Uncouth Uranai, unchanged techniques/spells/equipment, Yenlui/Dream/Obsession |
| Blood and Bramble | Specific spells containing converted Test Difficulties | Other spells including Badwill, Bonesetter and Godspakt; 5-penny ingredients with unknown weight/amount |

## Implementation

Catalog entries have optional validated `adaptation` text stating the concrete change. Generic `conversion` prose remains review documentation and is not a classifier. Keep explicit metadata when re-extracting a pack; assess new records individually. No runtime keyword detection or blanket book/page/edition tagging is used.

`legacy.mjs` resolves explicit metadata and source references for XP/spell records, supplies exact badge tooltips and text/PDF names, and defines reviewed context-only mechanics. `legacy-character.mjs` applies these narrowly to actual grants/access/discounts, not entire imported inventories. UI, folio, review and exports share these helpers. Selected book titles and compatible random tables are untagged.

The editable sheet prefixes affected names with `[Legacy]`; canonical names/IDs remain unchanged in saved data. Fixed core Skill labels retain their names; the companion record marks any altered allocation. Notes summarise actual active adaptations, and the complete record retains book/page and the specific explanation. No game values, prices, prerequisites, probabilities or existing user decisions change in this correction.

Global search also contains independent, unconverted `referenceEntries` from all supplied books. Printed Fourth Edition records have an edition warning, with no implied compatibility or automatic conversion, and do not receive Legacy. Existing approved adapted profiles keep their specific Legacy explanation and remain distinct from original printed references. Reading deferred systems does not enable them in either creator. Standalone NPC/creature profiles and templates are excluded from shared search; background/flavour-only Rules are excluded as well. See [BOOK-SEARCH.md](BOOK-SEARCH.md) and the generated [SEARCH-COVERAGE.md](SEARCH-COVERAGE.md).

Regression checks include adapted and compatible entries from every installed book, mixed spell/gear/Skill lists, unaffected Talent/native-language grants, core XP/undo, High Elf and Dwarf contextual choices, save/load, invalid metadata, HTML escaping and all 556 PDF fields. Desktop/mobile checks verify readable selective badges.

Deft Steps attaches older Miracle replacements to their appropriate Ranald aspect lists. Core Cheat the Odds remains untagged in other contexts. Explicit missing specialisations/Cause and named Difficulty conversions have their own explanations. Tool-heading corrections, ordinary profiles and standard Fifth Edition allocation/XP do not become Legacy solely because the book is Fourth Edition. NPC-only adaptations were removed with the previous NPC creator and are not active catalogue entries. The fresh core-only Bestiary Workshop does not restore them; core spelling corrections and approved interpretations are documented source notes, not older-edition Legacy conversions.
