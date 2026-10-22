# Taverns of the Old World

Source: the supplied 28-page Fourth Edition PDF, SHA-256
`07edfb947c730388c08b2ae15a50bb128fcdb559b1dbfbe08e1353210b19583c`.
PDF and printed page numbers agree. MarkItDown reading and geometric extraction
were checked against rendered staff pages 14–15 and the PDF's actual tables.

## Creator content

Enable the book in the GM workshop for **12 generic Human staff profiles**:
Poor Landlord, Landlord, Quality Landlord, Excellent Landlord, Menial, Servant,
Chef, Quality Chef, Excellent Chef, Doorman, Quality Doorman and Excellent
Doorman. These are complete foundations, not Career advancement templates or
hirelings. They use the existing alphabetic profile browser and source filter.

Printed Characteristics, Wounds, Skill totals, one-rank Talents, attacks and
Trappings remain intact. Permanent Talent benefits already included in printed
scores are not applied twice. Compact grouped Skill notation is expanded into
separate unchanged totals. Nimble Fingered uses core Nimble-fingered spelling.
These are compatible profiles and spelling corrections, so they do not receive
Legacy tags. The doormen's printed Armour 1 is their listed Leather Jerkin,
covering Body only; the parenthesised AP-plus-TB total is not an extra AP grant.
Chefs and doormen remain the printed Human profiles; no invented Halfling or
Dwarf conversion is provided. Printed Status and editorial notes stay in the
app; compact sheets contain the actual character's statistics and belongings.

The PC book selection adds **eight fixed-price consumables** from pp. 16–17:
Rough Spirits (pint bottle, eight shots), Excellent Spirits (pint bottle, eight
shots), Fine Wine (bottle, five glasses), Small Beer (pint), Strong Ale (pint),
Snacks, Stew and Simple Meal (one printed serving). GM/Marijan reuse the same
shared catalogue. No weights or Availability are printed: Encumbrance is null
and Availability is Unlisted, visibly unresolved rather than invented.

Existing core Ale, Dwarf Ale, Spirits, Wine and Meal profiles/prices remain
unchanged. The book's alternate ordinary Wine price is a readable source
reference, not a silent replacement. Legendary Wine supplies minimum prices,
not a fixed price, so it is reference-only. Lodging is also reference-only.
No new player Career, Species, Talent, spell or creation rule is added.

## Shared rules search

The original **49-reference source inventory** covers serving rules, board/illness, privacy, abstract games/hazards and genuine tables. The current public subset contains **28 eligible printed references** plus eight shared equipment entries; all standalone Rules remain private. Tables retain row numbers, column labels and printed abbreviations. Published summaries preserve source values and Fourth Edition warnings; original extraction wording is audit input, not the editable public wording source. See [SEARCH-COVERAGE.md](SEARCH-COVERAGE.md) and [DESCRIPTIONS.md](DESCRIPTIONS.md).

Setting-only introductions, tavern names/descriptions, entertainment flavour,
customer encounter lists with partial NPC statistics, named venues/patrons and
adventure hooks are excluded. The overlapping result 21 in the Quirks table
(p. 9) is not repaired or exposed as an automated random table; only the separate
unambiguous hazard mechanics are included. No hiring, tavern generator, venue
management, service consumption, gambling, illness or ongoing play is automated.

## Maintenance and checks

Read using MarkItDown, then rebuild the hash-checked pack and frozen review:

```text
python -m markitdown "C:/Users/ninod/Downloads/Taverns of the Old World.pdf" -o ../taverns-of-the-old-world.md
python scripts/build-taverns.py
npm run build
node --import tsx --test tests/taverns.test.mjs tests/gm-options.test.mjs
```

Focused desktop/mobile coverage is in `tests/browser/taverns.spec.mjs`. Tests
check every printed baseline, foundation gating, recalculation, armour locations,
export contents, core-price preservation, unknown weights and curated search.
No runtime UI or shared rule handler is changed by this integration.

Verified on 10 October 2026: book validation/build, generated-data consistency,
syntax/format and offline coverage passed. Four focused source/rule checks and
seven shared GM-option checks passed; the new profile/filter/search flow passed
on desktop and mobile. Rendered pages 12, 14, 15 and 19 confirmed table columns,
staff scores and equipment. No full browser regression was repeated for this
data-only integration.
