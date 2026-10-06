# Up in Arms integration

This opt-in pack uses the supplied 144-page PDF, SHA-256 `9d0a5cc54b6e2a81076c4e227204540ff14b4916225f2b84c705de37e902fdfd`. Printed page numbers match PDF page positions. Fifth Edition core creation and advancement govern; this is not a Fourth Edition rules mode.

## Included character options

- Fifteen Careers: Archer (10), Greatsword (12), Halberdier (14), Handgunner (16), Artillerist (18), Camp Follower (20), Cartographer (22), Freelance (31), Knight of the Blazing Sun (32), Knight of the White Wolf (34), Knight Panther (36), Light Cavalry (44), Siege Specialist (46), Pikeman (48), Priest of Myrmidia (78). All four levels, Species restrictions, Skills, Talents, Trappings and the visual Characteristic schemes are extracted. For example, Priest of Myrmidia starts with WS, Int and Fel, with no WP advance in its printed scheme.
- The seven conditional military Career tables on p. 9, offered as an optional extra roll after a relevant core Career result. They do not change core Career probabilities. Each rolled offer retains its optional roll when switching between offers or keeping the original Career.
- Tilea and Luccini regional Human creation, Imperial Tilean Skill choices (55), name suggestions (56), and the printed regional Career alternatives. Tilean Flagellant alternatives to Nun/Priest enforce the five printed patron choices.
- Luccini's optional Doomed replacement takes the place of one Species starting Talent; it does not add a sixth Talent or overwrite the original random result.
- Nine additional Myrmidian Miracles (79), with their rules available alongside the core Miracles and included in the sheet/record.
- Seventy additional fixed-price shop entries and 43 new weapon profiles from pp. 88, 91–102, 123–124. Armoury duplicates retain core values. Additional printed Skill/Talent specialisations feed Career choices and the existing Any menus.
- Crew Commander (140) is displayed with its printed description and an explicit unavailable reason. It cannot be granted or purchased.

## Explicit user decisions

These decisions were supplied in this conversation on October 2–3, 2026. They are applied in the pack and included as source/conversion notes in exported records.

| Issue | Agreed behavior |
|---|---|
| Fourth Edition Tilean Skill allocation | Select five Skills at +5 with Fifth Edition limits, using the printed Tilean choices and native Tilean +30. Keep the two printed Talent choices and three random Talents. Human physical Characteristics, Fate, Fortune, age and height use core values. |
| Alternative armoury | Keep core statistics; add only new equipment. No replacement armoury pack is enabled. |
| Crew Commander | Grey it out and explain that its old repeat cap and Talent Test bonus need an agreed Fifth Edition conversion. |
| Numeric bonuses in new references | Keep printed modifiers such as +10 Leadership/WS/BS in descriptions. Do not turn them into permanent Characteristic bonuses or invent a blanket SL conversion. |
| Illegal Species result on p. 9 | Keep the original legal Career, log the rolled unavailable result, and explain it. Do not reroll again. |
| Handgunner's Ranged (Engineer), p. 16 | Use Ranged (Engineering), documenting the naming mismatch. |

Approved older Talent names use core definitions: Diceman → Dicer; Strider → Striding Gait; Tunnel Rat → Tunnel Fighter; Public Speaking → Public Speaker; Trick Riding → Trick Rider; Warleader → War Leader; Unshakable → Unshakeable; Rough Rider → Roughrider. The existing spelling normalization also resolves Nimble Fingered → Nimble-fingered. Original-to-core mappings are recorded per Career.

In Good Order's old Advantage reference is converted to Momentum under core Appendix I (364). Its old Fleeing page reference is labelled as Fourth Edition. Other temporary magic and equipment effects remain reference text. Ammunition modifiers are shown and exported, but no ammunition is assumed loaded and no crew or combat state is simulated. A Pavise retains its deployed Shield 5 description; it does not grant permanent AP 5 to a character.

## Deliberate limits and unresolved items

Some starting Trappings are descriptive rather than named equipment profiles. Pack, Headgear, uncounted Ammunition, unspecified instrument types and similar entries remain unresolved. Proposed Metal/Plate Breastplate, Leather Skullcap, Uniform in Unit Colours and Bed Roll aliases have not been enabled without the user's answer. The earlier approved Leather Breastplate → Leather Jerkin interpretation remains in effect, with the actual Career page cited. Unknown Encumbrance is reported rather than treated as zero.

The review inventory `dist/data/books/up-in-arms/excluded-equipment.json` records 54 excluded rows: existing core items or items without a fixed purchase price. Different printed statistics for the same core item are deliberately not imported. This includes the Grain Flail row whose older table omits the core two-handed label. The new one-handed Warhammer is separate from the existing two-handed core weapon.

Injuries, critical tables, mounted combat, Pursuits, alternative group Advantage, hirelings, siege combat/structure damage, and Warrior Endeavours remain outside the character creator. Costs and equipment references may be read without implementing these campaign systems. No full source PDF is published.

## Reproduction and review

`scripts/extract-up-in-arms.py` extracts staged text/tables, Career schemes from PDF coordinates/colours, and relevant Miracles/names. It does not register unreviewed material. `scripts/build-up-in-arms.py` applies the explicit decisions above to that staged output. The staged extraction defaults to the parent workspace's `tmp/pdfs/up-in-arms-review`; the runtime pack lives in `dist/data/books/up-in-arms`.

The source loader validates all records, references and conditional d100 tables during builds/tests even while the pack is disabled. Browser startup loads the generated library bundle and validates the selected catalogue. New data and modules are included in the offline build. Tests cover all fifteen Careers, preserved core profiles/probabilities, regional allocations/replacements, legal and illegal extra rolls, unavailable Crew Commander, the new shop/magic choices, and editable PDF export. UI verification uses an isolated draft with `?verify=1`.

Integration verification: Browser checks cover book activation, source-labelled Tilean name rolls, the one-time military refinement and keeping its original result, Luccinan replacement display, Myrmidian rules/free choices, and a Bandoleer purchase with purse deduction. Desktop, 390 px and 320 px layouts have no horizontal overflow. A valid advanced Myrmidian fixture exports 556 editable fields and 556 widgets; canonical values, widget values and appearances agree. Rendered sheet and companion pages are legible. The browser automation could not capture its PDF-download event; the export output was independently generated and inspected with the same engine.
