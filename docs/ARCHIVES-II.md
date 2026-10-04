# Archives of the Empire: Volume II — integration review

**Status: installed as the opt-in `archives-ii` pack, version 1.0.2.** All creation decisions below are approved. Unspecified profiles remain unresolved; campaign systems are deferred.

Source: the supplied `Archives of the Empire - Vol II.pdf`, 96 pages, SHA-256 `95944ec217df9982aac83cfa7a6020706f23eb13fda0c8498ee349fba91f132b`. Printed pages match PDF positions. Some running headers say Volume I; the contents are the second collection covering Ogres, astrology, magical artifice and mass battles. The source PDF and full text remain outside the published app.

MarkItDown text is in the parent workspace's `tmp/pdfs/archives-ii.md`. `scripts/extract-archives-ii.py` stages Career columns and coloured schemes, raw tables, two complete Ogre d100 name-element tables, weighted 2d10 appearance tables, and source metadata in `tmp/pdfs/archives-ii-review`. Staging does not register a book.

`scripts/build-archives-ii.py` prepares reviewed runtime data outside the app by default; pass `--output-dir dist/data/books/archives-ii` to regenerate the installed pack. Registration is explicit in `dist/data/books/index.json`. The pack adds one Species, three Careers, seven Great Maw spells, twelve priced shop entries and twenty optional star signs. With all four supplied books selected the catalog contains 86 Careers and 241 spells/Blessings/Miracles.

## Creator material identified

- Ogre Species: physical attributes, Skills, Talents and creation restrictions (pp. 18–21); age, height, weighted appearance and traditional names (pp. 21–23).
- Species d100 table and Ogre Career d100 table (p. 18). By user instruction, enabling Archives II makes its Species table the default; the core Species table remains an explicit alternative. The Ogre table is used automatically when Ogre is selected and Archives II is enabled, because it is the only printed Ogre Career table. Core Species defaults remain unchanged. The Ogre table also supplies access to the listed existing Careers; it does not justify exposing every Career to Ogres.
- Three four-level Careers: Maneater (p. 35), Rhinox Herder (p. 36), Ogre Butcher (p. 37). Their ten first-level Skill options are retained with Fifth Edition allocations. Visually checked schemes: Maneater WS/S/T at L1, BS L2, WP L3, Fel L4; Rhinox Herder BS/S/T at L1, Fel L2, WS L3, Ag L4; Ogre Butcher WS/T/WP at L1, **Dex L2**, Fel L3, I L4.
- Eight weapon profiles, three ammunition entries and one Gutplate profile, with fixed prices (p. 29) and special descriptions (p. 30). These explicitly Ogre-sized profiles must not be doubled again. The table calls the armour Ogre Gutplate, while Career entries use Gutplate and descriptive variants; do not silently assign ordinary Gutplate protection to unresolved variants.
- Ogre carrying, ordinary equipment sizing, restricted Arcane Lores and Toughness-based Language (Magick) (p. 31). Ride (Horse) becomes Ride (Rhinox) for Ogres (p. 34).
- Great Maw Lore and seven spells (pp. 32–33), using current core Creature Traits. Combat effects remain sourced references, not combat automation.
- Optional star sign creation, including starting Characteristic adjustments, free Talent outcomes and the printed 25 XP reward for accepting the random sign (p. 39). Ascendant sign and up to five celestial mansions are optional background only (p. 50), with no further mechanical bonuses.

## Explicit decisions received

| Issue | User-approved behavior |
|---|---|
| Ogre Fate/Resilience/extra point, p. 20 | Use **1 Fate and 2 Fortune**, with no extra point to distribute. Retain normal Fifth Edition random-creation bonuses. This is an explicit adaptation, not a conversion formula printed in either book. |
| Ogre starting Skills/Talents, p. 20 | Use five Skills at +5 with Fifth Edition limits. Omit old Large as a Talent and record Large size separately. Retain Dirty Fighting, Resistant (Chaos), Resistant (Poison (Ingested)), Very Resilient or Very Strong, and Vice (Food). |
| Missing Career roll 05, p. 18 | Rat Catcher covers **05–06**. Preserve the printed gap in raw extraction and document the user's correction in the runtime table and export. |
| Witchling Star contradiction, pp. 39/47 | Use the detailed p. 39 d10 table: Sixth Sense has no Strength penalty, Second Sight/Petty Magic −3, Witch! −5. |
| Ogre carrying capacity with Talents, p. 31 | Calculate existing core Talent effects first, then double the final capacity. |
| Ogre-sized ordinary equipment, p. 31 | Double ordinary weapons, armour, clothing and carrying containers. Keep food, ammunition, animals and vehicles at listed unit prices/weights; flag other unclear items for GM review. Explicit p. 29 Ogre profiles keep printed values. |
| Seaman Career, p. 18 | Map to Fifth Edition core Sailor and document the old name. |
| “Difficult (+20)” in Bullgorger/Feast of the Fallen, pp. 32–33 | Use **Difficult (−1 SL)**. Record that the user chose the printed difficulty label over the conflicting numeric modifier. |
| Ogre writing/art/advanced-Lore restriction, p. 21 | Display the printed restriction as an informational reminder; the user removed the acknowledgement checkbox and creator/export gate. Do not invent an exhaustive forbidden-option list. |
| Duplicate or conflicting star-sign Talents, p. 39 | Keep core learning limits; count an already-owned nonrepeatable Talent once. Require compatible choices before export. Sign penalties and retained-roll +25 XP still apply. |
| Rhinox Herder's Harpoon, p. 36 | Keep the named Trapping with unresolved statistics. Do not turn it into a Harpoon Launcher or the six-piece ammunition pack. |

Only Reikspiel fluency is explicitly granted on p. 20. Language (Grumbarth) is a selectable Species Skill; do not grant native Grumbarth +30 without another source/decision. Age uses 15 + 5d10; height uses 91 inches + 1d10. Appearance uses two actual d10, not uniform selection from unique colour names. Traditional given names join one result from each separate d100 table on p. 22; repeated `elg` entries at 24 and 27 retain both faces. The title/clan examples on p. 23 are suggestions, not a printed roll table. Big Names are earned and cannot be automatically granted at creation.

Previously approved older Talent names use their core equivalents, with per-Career notes: Strider → Striding Gait, Trick Riding → Trick Rider, Warleader → War Leader. Use core Talents and Creature Traits under Appendix I (p. 364), rather than importing old per-rank Test bonuses. Core p. 303 explicitly gives all Blackpowder weapons the Blackpowder and Damaging Qualities, so the Ogre Blackpowder profiles must retain those core inherent properties.

## Implemented behavior and remaining limits

The optional star chart lives in Characteristics. Its adjustments alter initial scores rather than purchased Advances. The initial d100 roll and Witchling d10 effect are each recorded once; changing the selected sign adds no reward, and returning to the original retains at most 25 XP. Ascendant and mansions are background only. XP totals, purchasing, undo, folio and exports include the reward. Changing creation choices is locked while advancement is recorded. Saved chart shape and selected content are validated before loading.

Ogre age/height and weighted appearance use actual dice. Naming offers Imperial core lists or two independent traditional d100 elements, with editable title/clan examples. Ogre Skill totals, folio and PDF use Toughness for Language (Magick); its preprinted Intelligence label receives a visible T* correction. The complete record explains doubled Wounds/capacity and the size damage rule. Ironfist Shield AP does not duplicate its weight. Ordinary Hand Weapon variants use their core profile before doubling their weight.

Sizing is calculated before the core worn reduction. Unclear starting items retain unknown Encumbrance; unclear shop prices/weights require GM review and cannot be purchased at an invented price. The p. 28 weapons are described as all but useless to Average creatures, and p. 29 gives no reduced Gutplate protection for other Species: those usable profiles require GM review rather than pretending their Ogre statistics transfer unchanged. The Plate classification still follows core Stealth/Casting rules; the dash in the old table does not introduce an additional penalty. Materials/qualities are not edited here.

General meat/ingredient costs and the Great Maw healing benefit are sourced descriptions beside magic and in the record. No Wounds, ingredient consumption or coin is automatically changed during creation. The two p. 31 ingredient statements are retained for GM adjudication instead of inventing a reconciliation.

## Deferred material and boundaries

Firebelly describes modifying Wizard “with some modifications” without a complete Career profile (p. 31). Do not invent those modifications. Existing user decisions exclude equipment Quality/Flaw editing; optional Ogre Club customisation stays explanatory until explicitly requested.

Big Names, mutation events, starvation/food consumption, live Vice Psychology, spellcasting effects and Rhinox management are campaign systems. Magical artifice, commissioning, secret curses, random artefacts and crafting (pp. 51–67), Great Hospice NPC/adventure material (pp. 68–81), mass battles (pp. 82–91) and psychological disorders (p. 92) are outside the creator's current scope. Manufacturing cost multipliers are not fixed retail prices and must not become invented shop entries.

## Verification

Validated metadata feeds handlers for Large Wounds/damage, carrying capacity, Career access, Ride replacement, casting Characteristic and magic restrictions. Astrology has character state, score/Talent grants, once-only XP, validation, UI, export and saved-chart checks. Every novel data field is validated; reference-only combat effects remain identified as references.

Verify core-only and all-book combinations, every Ogre d100 Career face, weighted appearance/name dice, incompatible and duplicate astrology grants, repeated sign selection without XP farming, XP purchase/undo, Ogre prices/weights and automatic packing, sources and editable PDF output. Inspect desktop and phone layouts. Commit locally with a meaningful message; never push or deploy.

All 153 automated checks pass. The rendered Ogre Butcher PDF retains all 556 editable fields; canonical field values, effective values on all 556 widgets and nonempty normal appearances agree. The sheet and companion record were visually inspected for casting, Large Wounds, armour, magic, sources and XP.

Local browser checks verified enabling the book on a pristine draft, Ogre Career choices, an actual initial star-sign roll, traditional name selection and rolls, weighted appearance rolls, replacement age/height rerolls, removal/restoration of the retained-sign XP reward, chart background controls, loading an Ogre save, spell descriptions, doubled ordinary-weapon prices, native equipment prices, purchase/refund and the GM-review explanation for an unavailable Writing Kit. Layouts were inspected at 1920, 390 and 320 pixels without horizontal page overflow. Some layout checks used isolated development fixtures; test quantities/funds and preselected signs are synthetic, not claimed random history. A browser PDF download notification timed out; PDF generation and editable appearances were independently verified through the same export function. The earlier native-dialog input blockage cleared before these interactive checks.
