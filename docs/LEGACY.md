# Legacy provenance

The user requested a persistent **Legacy** tag for material adapted to Fifth Edition, expressly including the High Elf Player’s Guide integration from the other chat. This is a presentation change. No rule, XP price, starting benefit, name, availability decision or random probability changes.

## Meaning and coverage

**Legacy** identifies Fourth Edition material used through this Fifth Edition creator’s reviewed integration. It includes imported printed profiles that retain their numbers but now use Fifth Edition creation, advancement, Talents or Traits, as well as explicit conversions and approved interpretations. It does not mean that every number in a profile was rewritten, nor that an adaptation is an official Fifth Edition definition. Existing proposed-adaptation warnings and unresolved/unsupported explanations remain.

Tags follow the verified source edition. Every installed Fourth Edition pack and every sourced content category is covered; enabling a supplement alone does not relabel all core definitions. A core Skill or Talent supplied through a Legacy regional allocation or Career is a **Legacy choice**, while its core definition remains Fifth Edition. Core-priced XP records are tagged if their definition, eligibility, grant or discount comes from a Legacy source. Canonical names, saved IDs and rules are unchanged.

The interface labels book choices, native select options, regional/Species/Career profiles, imported feature panels, references, starting choices, XP options/ledger, review and the compact folio. A folio heading identifies active Legacy creation context even with its lists collapsed. Spell definitions, patron grants, techniques, runes and Cants retain their source tags. Shop purchases and starting gear preserve profile/Legacy grant context; Ogre-sized core equipment identifies the adapted sizing context.

PDF name fields use `[Legacy]` before the name so the tag survives abbreviation. Fixed, preprinted core Skill labels cannot be renamed; each affected Skill is tagged in the attached complete Skill table instead. The Notes field identifies active Legacy creation sources, including its shortened overflow form. The complete record preserves individual tags, exact source pages, all compatibility notes and conversion decisions. Saving/loading and undo derive labels again from current sources, never persist modified game names.

## Reviewed book inventory

| Source | Reviewed adaptation areas covered by Legacy |
|---|---|
| Fifth Edition core | No Legacy label for ordinary core options, printed Fifth Edition optional advances or core-only discrepancies. |
| [Up in Arms](UP-IN-ARMS.md) | Tilean Species allocations/native language, imported Careers and Fourth Edition-to-core Talent aliases, Engineering naming, unavailable Crew Commander, equipment and spell-reference conversions. |
| [Archives I](ARCHIVES-I.md) | Halfling clans/Small omission/Haffennaff, Eonir kindreds/core attributes/Youngblood, Mootland conditional access, Fearless/Savant/core Talent mappings, imported Careers, unavailable Lip Reading, equipment profiles and explicit price precedence. |
| [Archives II](ARCHIVES-II.md) | Ogre 1 Fate/2 Fortune, five Skills/separate Large size/core Wounds and Traits, automatic Career table/core names, astrology/core Talent limits, Great Maw Difficult conversions, approved carrying and sizing categories and unresolved Harpoon. |
| [Archives III](ARCHIVES-III.md) | Imported Priest/Altdorf profiles, Old Faith prayer grants and approved extra-Blessing XP count, animal-doctor Hedge Witch variant, core duplicate Hedgecraft definitions retained, new spells and optional Cants. Skipped armour/familiars are not selectable content. |
| [Winds of Magic](WINDS-OF-MAGIC.md) | Imported Colleges/Careers and Skill access, paid-only Psychometry trade, core Lore (Alchemy) addition, Mundane Alchemist’s four-spell Petty grant, source spells/ritual learning, core duplicate Talent/Spell definitions retained, qualified robes and reference-only staff. |
| [Rough Nights & Hard Days](ROUGH-NIGHTS.md) | Proposed Gnome 2 Fate/2 Fortune, five Skills/Small omission/core Small Wounds, core Career names, core prayer mappings and Suffuse with Ulgu’s approved cap/reference warning. |
| [Dwarf Player’s Guide](DWARF-GUIDE.md) | Regional five-Skill allocations/native languages, Longbeard resources, Career profiles/level variants and weapon Skill/equipment swaps, core aliases, printed new Talent limits with omitted old rank bonuses, rune knowledge/Doom grants, source equipment/core penalties and explicit Archives I precedence. |
| [High Elf Player’s Guide](HIGH-ELF.md) | Regional allocations/printed Talent slots/core benefits, core Career aliases and Ulthuan effective profiles, approved Elven Sailor variant, Elder individual points/resource conversion, Blood of Aenarion/core Psychology and approved ritual discount, Mage’s 4-spell/10-point progression, Qhaysh/High Magic one-purchase cap, imported Talents/Sword-dancing, spell Difficulty conversions and equipment/core layering. |
| [Blood and Bramble](BLOOD-BRAMBLE.md) | Source spells under core Lore access/grants/XP, named Difficulty conversions/core Traits, preserved printed numeric references, approved Godspakt profile and qualified unknown-weight ingredient purchase. |

Printed table corrections and naming mismatches remain documented independently; the Legacy label does not describe these as edition rules. Unavailable choices keep their explanations. Deferred manager systems are not made available by tagging them.

## Implementation and maintenance

`dist/legacy.mjs` provides shared source classification, safe badge HTML and text/PDF names. `sources.mjs` includes Legacy in shared textual source labels. `legacy-character.mjs` adds acquisition, contextual Career, patron, optional-rule and XP provenance without mutating the catalog or character. The folio and exports use those same helpers.

New validated Fourth Edition packs inherit tags automatically, including data with no per-record `conversion` field. New character-specific handlers must retain their source/eligibility/grant reference and expose it in the shared context helpers. Do not infer Legacy merely from the word “conversion” in a core correction, or add it to raw game names/IDs.

Tests audit every installed sourced content category, untouched core definitions, regional grants, High Elf core Career modifications/Elder/High Magic, Longbeard, patron grants, discounts, core-priced XP purchase/undo, save/load, minimal folio rows, escaping and all 556 editable PDF fields. Desktop/mobile browser checks and rendered PDF inspection verify readability.
