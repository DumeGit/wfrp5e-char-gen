# Tribes and Tribulations

The supplied 112-page Fourth Edition PDF has SHA-256 `008c2e08337b15dd6776ae108acae4749d5276fbcff63eb7db74e3b9daf8dc6e`. Printed and PDF page numbers coincide. MarkItDown extraction, original PDF blocks and visual table checks were used. The source PDF is not shipped.

## Included content

- **19 generic profiles:** eleven foundations (pp. 9–15), six mounts (p. 19), generic Night Goblin Chief worked example (p. 16), Purple Skullback Spider (p. 99). Named characters are excluded. Foundations differing from core or Cluster-Eye remain separately sourced.
- **16 templates:** seven warband templates (pp. 16–17), Goblin Artillery Crew (p. 41), four Troll types (p. 88), four combinable Troll modifiers (p. 89).
- **28 shared spells:** twelve Little Waaagh!, twelve Big Waaagh! (pp. 98–101) and Bilebrew, Bloodgruel, Get Some Guts and Toothcracker for The Great Maw (p. 82). The latter four are also available to eligible PC Ogres when this book is selected. No playable Greenskin Species or Career is invented.
- **Acquired equipment:** three war machines and two ammunition profiles (p. 41), six Shaman artefacts (p. 97), Wulfang’s Pelt (p. 63). Prices are not supplied, so none becomes an ordinary shop purchase. Unknown Encumbrance stays unknown. Shared PC weapon/equipment records feed GM choices.
- **Reference scope:** the original extraction covers Waaagh! operation, Lore benefits, Gut Magic, equipment restrictions and related topics, but standalone Rules now remain private. The two genuine miscast tables remain public, alongside eligible shared catalogue options. Actual selected Traits/template abilities retain reviewed summaries in Bestiary. NPC profiles/templates stay outside shared search; [SEARCH-COVERAGE.md](SEARCH-COVERAGE.md) reports current counts.

## Approved conversions

All six choices are recorded in `scripts/tribes-tribulations-decisions.json`.

1. **Die Hard:** retain the user-supplied older-edition definition, with a Legacy warning: all Critical Wounds can heal; for TB Rounds after death, make a Challenging (+0 SL) Endurance Test at the beginning of each Round; success returns the creature to life with 1 Wound. The supplied core has no equivalent. Regeneration (p. 360) is different and Trolls already possess it. Resurrection remains a description, not an automated system.
2. **Swamp-strider:** proposed core Striding Gait (Wetland) replacement, explicitly approved and labelled Legacy.
3. **Waaagh! Channelling:** proposed Channelling (Magick), approved and labelled Legacy. Normal PC Colour Lore choices are unchanged.
4. **’Eadbutt:** Target 1 replaces contradictory printed Target You, with a Legacy explanation.
5. **Snotling:** 4 Wounds under core Small (2 × TB), replacing printed 7, with Legacy explanation.
6. **Ogre Prejudice (Thin People):** retain as a printed reference without inventing a Fifth Edition effect.

Core Size adds one extra SB to Large and Enormous primary melee Damage (two for Monstrous); Free Attacks do not gain it. Source-specific Legacy notes record the actual changes, including Mournfang +9 → +14. Printed Stride uses the already approved core Sprinter replacement. Trained War/Broken benefits are already included in mount profiles and are not applied twice. Printed Armour parentheses include TB; only the first value is AP.

Stone Troll Armour 3 replaces the foundation’s Armour 2. Printed Magic Resistance 2 uses the fixed current core Trait. Strider uses core Striding Gait with explicit home-terrain selection. Hag’s Breath +10 (Poison) becomes core Poison Breath (TB +2); the final Toughness controls it. Its nine printed spells reuse core IDs, including four Petty spells without inventing a Petty Magic Talent. Current Venom, Test Difficulties and individual Momentum replacements apply with selective Legacy notes. Numeric effect bonuses such as Toothcracker’s +20 remain printed under the existing user decision. Fourth Edition miscast tables are reference-only and retain their printed wording.

## Creator behavior

Select the book to expose its profiles/templates. All non-variant shared book options remain available to the GM independently. Pick one Troll type, then combine Old, Hungry, Hulking and Hag in the existing template panel; Hag requires River. Type changes clear modifiers. Modifier changes reset dependent choices and remain undoable. Printed template Characteristics already accompany their Size; a further manual resize applies generic S/T/Ag changes relative to that Size. Core Size still calculates Wounds and primary Damage. Hulking is M −1, S +5, T +5, I −3, Ag −5 (verified against the table columns).

Chaos Troll requires two Physical Corruption selections. Bileful Vomit, Rotten Regeneration, That’s No Mound, Sated, Starving and Water Wise remain descriptions; their conditions are not permanently applied to scores. Hag retains Stupid outside water. Tiny retains its printed 1 Wound until changed, then needs a manual value.

Shamans choose **up to** 3 Petty/3 Lore spells; Lords up to 6/9. Orcs use Big Waaagh!, Goblins Little, Hobgoblins choose either; Lords can choose both with one Lore limited to two spells. Ogres choose Great Maw or Fire; their template Int/T increases swap, and Language (Magick) uses Toughness (p. 73). Hunters use Ranged (Throwing) and three Javelins; Shields use shared Ironfists. Savage Orcs normally wear only Shields and retain warpaint/Ward. Snotlings use only Soldier/Skirmisher and suitable throwing equipment. Black Orcs cannot use missiles or Shaman/Skirmisher templates. Optional mounted Ride +15 does not create a mount sheet.

The Night Goblin Chief example prints Melee +20 while its template gives +15; preserve its printed totals and show the mismatch in the app. PDF sheets show actual abilities and effects, without discrepancy or adaptation notes. Named characters, adventures, purely narrative Nemesis traits, hirelings and live play remain excluded.

## Maintenance and verification

`scripts/build-tribes-tribulations.py` verifies the PDF hash and regenerates curated records and the frozen search review. `src/engine/gm/tribes.mjs` holds source-specific operations; generic template machinery remains shared. The registry builds counts, inclusion/search reports, PC/GM catalogues and offline assets. Focused Node tests cover source counts, eligibility, source fidelity, Tiny/Size, Troll composition, mutation requirements, fixed spells, Lore limits and Ogre equipment. Playwright covers the new controls on desktop and mobile; substantial integrations also run the standard local release checks.
