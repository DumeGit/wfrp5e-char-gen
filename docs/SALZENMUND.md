# Salzenmund: City of Salt and Silver

Supplied source: `Salzenmund - City Of Salt & Silver (1).pdf`, 143 PDF pages matching printed numbering. SHA-256: `a09f59d0c2ccd854987de09be3bdbfd2828e5bfa7b8175c97af5dea11dbc81ea`. MarkItDown reading is retained outside published assets as `../salzenmund.md`; page text/renders are in `../salzenmund-review/`. `scripts/build-salzenmund.py` verifies the supplied hash, extracts bounded stat blocks/tables, publishes packs and freezes search review. Full PDFs are not shipped.

## Player creation

Four optional origins (p. 142): Nordlander and Salzenmunder Humans, Cragforge and Grumsson Dwarfs. Retain printed Skill/Talent choices with approved Fifth Edition five Species Skills at +5 and core limits. Humans keep native Reikspiel; Dwarfs keep Khazalid/Reikspiel. Nordlander Doomed **or** another random Talent is one exclusive slot, reusing the existing regional replacement control. Norscan uses existing Norse; Sail is ungrouped in the core. Add printed Lore (Nordland/Roadways), Trade (Silversmith) and Striding Gait terrains Forests/Mountains. Independently supplied terrain choices deduplicate; derived Talent lists remain protected.

Owler (p. 141) is a separately selectable alternative to Smuggler, using its approved Riverfolk Class. Its distinct printed name appears in the Career browser; it does not overwrite core Smuggler or alter Career rolls. Visual inspection of the advancement diagram confirms **T/Ag/WP at level 1, WS at 2, I at 3, Int at 4**. Keep all ten first-level Skill choices and ordinary Fifth Edition allocations. Strider → Striding Gait carries Legacy; Fearless (Road Wardens) uses canonical Roadwardens spelling. **Seasoned Traveller is already a core Talent**, not a conversion. No extra equipment, subordinate NPCs or hireling systems are invented for source Trappings.

## Bestiary Workshop

Seven opt-in generic foundations: Revenant Agent of the Doom Lord (p. 110), Spite (p. 115), Miner (p. 122), Shiny Moon Goblins, Skulkas and Runts (p. 129), Snotlings (p. 130). Four Spite-only templates: Shrike, Mischief, Terror (p. 115), Despair (p. 116). Existing profile/template book filters, previews, issue routing, save/load, undo and compact PDF exports are reused.

Approved changes have selective Legacy notes:

- Spite Fast → proposed core Sprinter: Run movement ×1.5. This differs from the user-supplied older +1 M/+10 Ag effect; retain printed M 4/Ag 62 without adding bonuses again.
- Runts/Snotlings use core Small, **4 Wounds** rather than printed 6. Broken → Trained (Broken), with recorded 2d10 Fellowship; absent Fellowship becomes the roll total.
- Runts’ printed Ranged (Net) 40 uses core Ranged (Entangling) 40, with the approved Legacy note. The distinct Night Goblin Net equipment statistics remain reference-only; the core Net is unchanged.
- Fury → proposed Frenzy; Tunnel Rat → Tunnel Fighter; Miner Strider → Striding Gait; reuse previously approved Die Hard definition as a reference effect without automated resurrection.
- Mischief/Despair printed Channelling 56/60 become core Spellcaster **WP +10 = 83** on the Spite foundation. Mischief requires a chosen core Wind; Despair uses Ghyran for Life. Language (Magick) uses core Int +10. Existing Talent benefits in baseline profiles are not added twice.

Explicit choices are required before export: Spite Stealth specialisation preserving 70, Venom recovery Difficulty (numeric 2 does not identify it), Goblin Basic/Polearm preserving 35, Mischief Wind, and Despair Ward rating. Template-sourced Trait parameters use the same controls/validation as printed parameters and clear on template replacement. Tiny retains printed Wounds unchanged; changes/templates require manual Wounds, including Shrike Swarm. No Tiny formula is invented.

Other source details remain visible in the app:

- Despair **Charm 47** is below its resulting Fellowship 51. A validated `printedTotal` slot preserves this explicit number rather than inventing negative Advances; later Characteristic changes adjust by their difference. Higher existing Skill totals and explicit GM overrides still take precedence.
- Mischief grants Marsh Lights/Sleep; Despair grants Forest of Thorns and innate Dooming. Its Dooming Trait uses Willpower and references the core Miracle; it does not create worship of Morr, Bless or Invoke.
- Miner retains Melee (Two-Handed) 45, but its printed Hand Weapon (Pick) is Basic; do not transfer its Skill bonus. Leather Jack covers Arms/Body. Other profiles with Armour 1 but no locations retain **Unspecified** coverage rather than invented pieces.
- Spite Claws/Teeth/Sharp Sticks have no printed Damage; add an explicit attack. Optional Consume Alcohol has no printed total. Spites serving Naiads may manually replace Arboreal with Amphibious. Optional old Little uses Tiny/manual Wounds.
- Shrike applies core Swarm’s +10 WS after the printed template adjustments; Skill grants retain the interpreted template bonus, giving WS 60/Melee (Basic) 68. This calculation is explained before export, alongside manual Tiny/Swarm Wounds.
- Eltharin/Reikspeil use core Elthárin/Reikspiel. Flight uses the core Fly heading. Naming corrections alone do not imply Legacy.

Discrepancy/adaptation notes remain in the app, outside compact creature exports. Only actually granted/selected Traits appear in those exports.

## Search and exclusions

Twenty-four bounded mechanical references cover Enchanted Masks, Fulcrum of Azyr, Morning Fury, Chokan’s Fate rewards, Spite Dooming/Naiad swaps/dance resistance, prospecting, strike/equipment/events tables, Night Goblin Net/traps, cargo bribery, settlement ratings and smuggling procedures/tables. Tables are reconstructed as complete labelled rows from PDF geometry. Reference text preserves original Fourth Edition wording; editorial notes do not participate in search matching.

The prospecting table prints inconsistent **Challenging (−20)** Gossip; Size of Strike includes zero in both positive/negative bands. Preserve these with separate warnings; no automated roll or correction. Mine equipment is enterprise reference material, not carried shop stock. Night Goblin Net prints a non-core Group without price/weight; reference-only, leaving core Net unchanged. Mask effects and Chokan rewards are not automatically applied.

Exclude named NPCs (including named Spites), rumour/adventure/setting prose, attendant-Spite hiring and mine-staff hireling generation. Mine ownership, maintenance, downtime, live smuggling, magical rewards and encounter management remain deferred. No new purchasable equipment or learnable spells are invented.

## Verification

`tests/salzenmund.test.mjs` checks origins/exclusive Talent slots, the visual Career scheme, core preservation, book-order terrain deduplication, conversions, required parameters, fixed spells, printed totals, attack Skill choices, saves/template replacement and malformed content. Local browser coverage checks source selection and repairing export-blocking Spite choices on desktop/mobile. Run release checks for this substantial integration; commit locally, never push without explicit authorization.
