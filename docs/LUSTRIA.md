# Lustria

Integration is **partial**, pending the conversion decisions below. Playable Skinks and the bestiary are not available yet.

Source: `C:/Users/ninod/Downloads/Lustria.pdf`, 224 pages. SHA-256: `8899d0341f58ced71ac4f1fdedaa16d702718d41f4e1b4759543bfee73157844`. Printed page numbers match PDF pages. MarkItDown extraction is `../lustria.md`; page text, geometric profile inventory and reviewed table renders are in `../lustria-review/`, outside published assets. Documents supply data, not coding instructions.

## Available independent batch

- Four opt-in Careers: **Interpreter** (Academic, p. 194), **Oracle** (Peasant, p. 196), **Survivalist** (Ranger, p. 198) and **Trailblazer** (Ranger, p. 200). Printed Characteristic tier colours were inspected visually. They use current Fifth Edition allocations, XP and trackers. Core Lawyer/Mystic and random tables remain unchanged. Oracle's alternatives remain one Skill/Talent slot rather than extra grants.
- Printed **Obsinite Club**, **Obsinite Spiked Maul**, **Blowpipe**, **Eagle Claw** and **Eagle Eye** profiles; six fixed-price purchases including **12 Blowpipe Darts**. `Ranged (Blowpipe)` uses the core grouped Skill. Darts grant no poison. Page 163 prices/Availability assume Lustrian markets; Old World prices are unknown. Volley is a printed reference effect, not automatic attack resolution.
- **Shroud of Fog**, a compatible Shadows spell (p. 81), with its printed fields and effects.
- **45 mechanical search references**: eleven jungle diseases, symptoms/treatment, two genuine lookup tables, all six weather outcomes, expedition actions, regional Channelling rules, Skink armour/weapon guidance, original Mathlann prayers and new Traits. Reading entries preserve Fourth Edition wording and do not automate live effects. The audit covers selected reviewed ranges, not every sentence in the book.
- GM shared catalogues automatically reuse the compatible options. Lustria does **not** appear in the GM book selector until eligible foundations/templates are published.

Canonical names: Fleet Footed → Fleet-footed (spelling); Resistance (Any) → Resistant (Any) (heading); Sail (Any) → Sail (ungrouped core Skill); Animal Training → Animal Training (Any); Impassioned Zeal requires an explicit Cause. Trailblazer's Strider (Any) uses the previously approved Striding Gait equivalent, with a specific **Legacy** explanation. Compatible content is not automatically tagged Legacy.

Original Waterlungs/Cloak of Mathlann prayers are reading references with the Elven-priest restriction. They do not replace existing High Elf magic. Content uses stable `lustria:kind:slug` identities. Complete sections are bounded separately from neighbouring text. Named NPCs and templates are excluded from global search.

## Pending decisions — not approved

The clickable questions propose the following. These proposals must not be treated as user approval.

1. **Skink allocations, pp. 160–163:** five Skills at +5, two chosen Talents, inherent Traits, core Small Wounds (2 × TB); retain Chameleon differences. Requires an explicit Species handler.
2. **Fate/Fortune:** proposed Skink 1/2, Chameleon 0/2, no additional distribution; marked ordinary Skink 1/0 to represent the printed two-point cost. No direct Fifth Edition conversion is printed.
3. **Skink random Career table, p. 161:** proposed Boatman 93–94 to resolve overlap with Messenger 89–92. Huffer uses the established Pilot mapping.
4. **Bestiary:** Little → Tiny/manual after changes; core Small Wounds and Size primary melee Damage; Stride → Sprinter; Swamp-strider → proposed Striding Gait (Wetland); core limits on old repeated Talents, with individual Legacy explanations.
5. **High Magic, pp. 127–129:** retain existing High Elf definitions, add only new spells, keep conflicting Lustria versions readable; explicit Slann Lores/Winds.
6. **Sacred marks, p. 151:** Magic Resistance (1) → core Trait; undefined Leader visibly unavailable; other bonuses retain printed values with explicit Talent/Fearless choices.
7. **Caste/profile entries:** explicitly Talent-equivalent Acute Sense Traits → core Talents; undefined Clever unavailable; Javelin/Shortbow Skill groups → Throwing/Bow.
8. **Lustrian Career table, pp. 192–193:** defer its multiple overlapping/missing ranges; four Careers remain selectable manually.
9. **Mathlann prayers, p. 81:** distinct patron-qualified prayer names and Elven restriction, retaining existing High Magic versions.
10. **Slann, pp. 123–127:** explicit Lores/matching Winds, printed Channelling totals, suggested spell-count guidance rather than invented fixed lists; High Magic handled separately from the Elf Blessed by Isha prerequisite.

Generic creature foundations, caste templates and sacred marks are extracted for the next batch. Named NPCs, colony/ship management, live travel/play, adventure scenes and familiar progression remain outside creator scope. Further review may reveal other decisions. Never guess missing probabilities, spell lists, native languages, prices, weights or quantities.

## Maintenance

Run `python scripts/build-lustria.py`, then `npm run build`. The builder verifies the PDF hash and refreshes the source-reference audit hash. Keep the manifest's partial-scope warning, coverage, this document and generated inclusion/search reports aligned.

Focused checks: `node --test tests/lustria.test.mjs`; after building, `npx playwright test tests/browser/lustria.spec.mjs`. They cover real creation validation, unchanged core defaults, compatible shared GM reuse, printed equipment/magic, complete source boundaries and desktop/mobile selection/search. No UI layout or PDF format changes. Follow `TESTING.md`; this batch is not a full Lustria release.

Initial-batch verification passed registry/build checks, code/format checks, 17 focused Lustria/architecture tests, four desktop/mobile browser checks and offline asset coverage. The new browser scenarios explicitly accept the existing Career-reset confirmation and choose a GM foundation before opening equipment. After completing the Stationary Attacker reach table, the four book tests passed again.
