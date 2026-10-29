# Bestiary weapon creator

Implemented from the user-approved ordinary/magical/runic workbench plan. Create weapon belongs beside Add equipment in **Equipment & magic → Attacks & equipment**. It makes equipment an NPC already possesses; it does not simulate manufacturing, spend money or grant magical knowledge. Published options remain unchanged. Custom designs belong to their NPC, not a separate library or shared search catalogue.

## Interaction and design

The user approved the search-first redesign on 29 October 2026 and requested the fonts and colours used by the rest of the app. It reuses the native Bestiary modal and shared Imperial Desk tokens: aged parchment, raised paper, brown ink and brass, Ledger Text headings, system UI controls and Bestiary cobalt actions. The feature stylesheet introduces no local theme-token overrides or hardcoded colours. Desktop uses a centred wide dialog with section navigation beside the editor; phones use the full screen with navigation across the top. The heading, compact calculated footer and Cancel/Add weapon or Save changes actions stay visible while the editor body scrolls. Native buttons, labelled fields and 44px targets retain keyboard/phone access. This remains an owned-weapon editor, not a character folio or separate library.

Choose a published base from searchable source/profile rows first, using Melee/Ranged and dependent group filters. Then native navigation buttons open Details, Properties, Power and Review. Details presents the inherited profile with optional Edit profile fields; Properties offers direct searchable property and craftsmanship additions; Power contains Ordinary/Magical/Runic choices and searchable enchantment or rune catalogues. The persistent footer shows calculated Attack, Damage, Reach/Range and Encumbrance. Review contains the complete finished weapon, effects, notes, source references and recorded dice, with reference disclosures where useful. No new animation is added to this repeated editing task; inherited common-control feedback remains.

Names, quantity, handedness, weapon type/group, Damage, Reach/Range, Encumbrance, properties and printed notes are editable. Replacing the base still requires an inline confirmation, resets its profile/powers and preserves the custom name, notes, quantity and dice history. Changing Power also confirms replacement when effects are selected. Per the user's explicit choice, Cancel, Close and Escape immediately discard the working copy without a confirmation or retained unfinished draft. They leave the NPC unchanged and return focus to the actual Create/Edit opener. Native modality keeps the background inactive; forward/reverse Tab wraps within the editor. Source reading returns to the unfinished design. Add weapon and Save changes commit one history action. An editor opened for another document cannot overwrite the newly loaded NPC; external changes to its original weapon require reopening it.

Validation retains the existing rule checks. Optional structured output from `customWeaponIssues` supplies stable section/control destinations without routing from English messages; the default API still returns the same messages. Missing choices start as guidance, touched fields show their error state, and the footer's choices-to-finish control opens the relevant section and focuses the first unresolved control. Review also provides actionable issue destinations. Quantity uses the existing saved-record bounds of 1–9999. No schema or calculation was changed.

Damage accepts fixed values, SB/TB with an optional signed whole-number modifier, or a dash for no Damage. Ordinary properties and craftsmanship have separate catalogue filters; inherited unknown property wording remains intact, while new unsourced rules belong in printed notes. Rated properties and Inflict parameters remain explicit. Lightweight/Bulky adjust final Encumbrance without guessing unknown values or silently permitting a negative value. The footer and Review use the same calculated NPC result as exports, including normal Skill, Size, Talent and explicit final attack overrides.

## Rules and source review

| Source                           | Implemented use                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| Fifth Edition core pp. 197–199   | Commission, Crafting and Invent! reference access; no downtime simulation                     |
| Core pp. 298–304                 | Base weapons, ordinary properties and craftsmanship                                           |
| Archives II p. 55                | Reconstructed 32-row Random Creature Table for Bane targets                                   |
| Archives II pp. 58–59            | All 28 magical weapon outcomes, individually reviewed canonical summaries                     |
| Dwarf Player’s Guide pp. 125–128 | Three inscriptions, one Master Rune, forms/materials, Weapon Runes and proximity restrictions |
| Dwarf Guide pp. 131–132          | Engineering Runes on explicitly Dwarf-built supported cannon designs                          |

The supplied Archives II PDF SHA-256 is `95944ec217df9982aac83cfa7a6020706f23eb13fda0c8498ee349fba91f132b`. The original p. 58 table overlaps 28. **The user explicitly approved Alight with Flame 25–28 and Dolorous 29–31.** The original private reference table stays unchanged; the new authoring source records this correction. Page 55's multi-column extraction was malformed; the PDF supplies the reviewed creature ranges. Its printed initial `0–19` applies to valid d100 faces 01–19; 00 remains Jabberslythes.

Original ability text/ranges and reviewed mechanical metadata live in `content/sources/data/books/archives-ii/weapon-effects.json`. All public wording is authored in `content/descriptions/catalogue.json`, with exact source hashes and reviewed status. `npm run generate:books` emits `src/engine/gm/weapon-definitions.mjs`, including existing reviewed property definitions from both kinds of source reference. Do not edit that generated module. These definitions stay with the Bestiary calculation path; no new search category or public standalone table is introduced.

## Magical weapons

Choose abilities manually or Roll enchantment. Reroll replaces the current configuration and preserves the base profile; all draws remain in the design's inspectable dice history. Manual changes are not represented as verified random assignments, and imported dice history is not independently verified.

An initial or subsequent 00 schedules two more table rolls, resolving iteratively with at most five distinct abilities. Duplicates add no benefit. A 120-draw guard reports incomplete generation rather than inventing a fallback; the previous configuration is retained. Manually selected combinations also permit at most five abilities including a custom GM-defined effect. Legendary status can be removed manually after reducing its abilities. No checkbox changes the table's probabilities.

Bane has a chosen or rolled creature target. A ranged Hoarfrost result rolls 1d10 pieces of enchanted ammunition, listed separately under Gear, while leaving the launcher ordinary. For Legendary ranged weapons a Hoarfrost draw is ignored without a replacement draw, as for an ignored result, and stays in history. Removing the ammunition removes that effect, preserves the launcher and is undoable. No ammunition is automatically consumed in play.

All relevant weapons gain Magical; an ammunition-only enchantment does not grant the launcher unconditional Magical. Granted properties deduplicate against ordinary selections. Direct property grants are calculated; extra Wounds, armour bypass, Fear/Frenzy, bearer-wide benefits, granted Talents and per-Round choices remain complete special-effect text. In particular, Hoarfrost, Bane and Ceaseless Cleaving do not inflate printed Damage. Actual old Test Difficulty/Advantage conversions in new summaries have explicit Appendix I adaptation notes. Other Fourth Edition references remain identified rather than silently converted.

Custom magical effects have an explicit name and complete printed rules. Free text never executes, changes statistics or invents a price. Temporary enchantment generation, curses, random weapon histories and ritual resolution remain outside this feature.

## Runic weapons

Ordinary duplicates consume inscriptions and stack as printed; Master Runes cannot repeat and only one is allowed. Weapon Runes require a non-Engineering melee weapon, normally axe/hammer/sword; another melee form needs a saved GM form exception. Choose a material suitable for permanent inscription. An already enchanted non-runic base cannot receive runes. Magical and Runic modes cannot be combined.

Engineering Runes are not general Engineering-group upgrades. Current supported bases are the existing small/medium/large cannon profiles and their explicit naval alternatives; the GM must identify the resulting design as Dwarf-built. Pistols, mortars and unsupported artillery profiles are not automatically treated as Dwarf artillery. No new Grudge Thrower or Bolt Thrower profile is invented. Armour/Talisman/Protection/Doom Runes are absent from the weapon selector.

| Automatically included                                          | Kept as special-effect rules                           |
| --------------------------------------------------------------- | ------------------------------------------------------ |
| Cleaving: +1 Damage per inscription                             | Might/Grudge target-dependent bonuses                  |
| Striking/Accuracy: +10 attack score per inscription             | Speed and other bearer/crew Characteristic changes     |
| Engineering Penetrating: +2 Damage per inscription              | Granted Talents, Fear, Conditions and armour bypass    |
| Reloading: −2 Reload per inscription; Salvo minimum 1           | Alternate attacks, flight/return and activation limits |
| Haste: Fast property, with its special defence wording retained | Pride/Jealousy suppression and which item is oldest    |

Weapon-local bonuses never alter permanent Skills or Characteristics. Matching combinations or Master Runes already carried by this NPC produce a reminder, not automatic deactivation. Owning a rune weapon teaches no Rune Magic/Master Rune Magic/Doom Rune entries. Forging progress, Runic Flaws, activation resources and encounter automation remain manual.

## Persistence, export and verification

Schema 2 adds optional `customWeapons`, defaulted only when missing. Explicit malformed arrays/fields, invalid selections, bad provenance, duplicate identities, unsupported formulas and invalid dice records are rejected. Existing core/data-version checks remain. Each record preserves a base snapshot, edits, power, selections/parameters, quantity, dice and notes. Species/equipment restrictions continue to use the original base identity, including after renaming. Linked ammunition identities cannot collide with other rows.

The result supplies one attack and one Gear row per weapon, plus any ammunition. Identically named custom weapons retain separate identities. Selected property sources are stored independently: same-name Dwarf/Up in Arms Crewed and Salvo descriptions remain distinct, and source-specific definitions survive save/load. All changes persist, download and Undo/Redo together. Both full sheets and A4 cards consume the same calculated attacks and complete effects. Gear lists the weapon once, with ammunition separately; a custom name does not erase a distinct printed possession. Existing measured fit/overflow behavior preserves text and font-size limits.

Focused coverage is in `gm-custom-weapons.test.mjs`, Bestiary store tests and `browser/gm-custom-weapons.spec.mjs`. It covers every d100 face, correction boundaries, recursive/capped/duplicate rolls, targets/ammunition, rune rules, derivation/removal, malformed imports, legacy defaults, history, save/load and desktop/phone controls. See [TESTING.md](TESTING.md) for actual run results and PDF inspection.

`browser/gm-weapon-dialog.spec.mjs` additionally verifies the modal's focus loop, header/footer reachability, responsive scrolling, empty results, immediate discard, validation-to-control navigation and source-reader return. Development verification includes these same dialog cases. The 29 October change preserves existing export geometry and mechanics.
