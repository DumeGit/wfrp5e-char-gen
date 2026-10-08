# Book inclusion matrix

Generated from the validated registry and its reviewed coverage inventories. Run `npm run generate:books`; do not hand-edit this file.

**Implemented** means a creator choice/profile is supported, not that live play effects are automated. **Adapted** identifies a concrete changed rule, using reviewed adaptation metadata; Fourth Edition origin alone never qualifies. **Reference-only** retains supplied information without the corresponding ordinary purchase/play action. **Unavailable** is deliberately blocked or unresolved. **Deferred** is future scope. Counts describe source records, not unique gameplay choices: gear/shop/weapon records may describe the same item. Features are counted separately to avoid pretending chapters are individual profiles.

Each source inventory remains visible even when another selected book supersedes it. Active totals account for current precedence; the separately selectable Hedge Witch variant is not an extra simultaneous Career. Book-wide decisions omit a page rather than invent a chapter reference.

| Active catalogue | Count |
|---|---:|
| books | 11 |
| careers | 126 |
| magicProfiles | 536 |
| rituals | 17 |
| cants | 24 |
| techniques | 10 |
| runes | 71 |
| pricedShopEntries | 405 |

| Source pack | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| Warhammer Fantasy Roleplay, Fifth Edition | 840 | 0 | 655 | 0 | 0 |
| Up in Arms | 135 | 12 | 128 | 1 | 9 |
| Archives of the Empire: Volume I | 31 | 22 | 10 | 0 | 13 |
| Archives of the Empire: Volume II | 50 | 7 | 103 | 0 | 15 |
| Archives of the Empire: Volume III | 45 | 14 | 105 | 0 | 12 |
| Archives III — Animal-doctor Hedge Witch (variant) | 0 | 1 | 0 | 0 | 0 |
| Winds of Magic | 120 | 55 | 254 | 0 | 21 |
| Rough Nights & Hard Days | 3 | 5 | 24 | 0 | 80 |
| Dwarf Player’s Guide | 156 | 34 | 120 | 2 | 0 |
| High Elf Player’s Guide | 55 | 55 | 104 | 0 | 0 |
| Blood and Bramble | 15 | 10 | 2 | 0 | 6 |
| Deft Steps, Light Fingers | 39 | 18 | 146 | 0 | 22 |
| Deft Steps — General Ranald Priest (variant) | 1 | 0 | 0 | 0 | 0 |
| Deft Steps — Ranald the Dealer (variant) | 1 | 1 | 0 | 0 | 0 |
| Deft Steps — Taal Priest (variant) | 1 | 0 | 0 | 0 | 0 |
| Deft Steps — White Stag / Hermit (variant) | 1 | 0 | 0 | 0 | 0 |
| Deft Steps — Longshanks Scout (variant) | 1 | 0 | 0 | 0 | 0 |
| Deft Steps — Pickpocket (variant) | 1 | 0 | 0 | 0 | 0 |

The table above counts catalog records. The feature matrix below includes systems, embedded unavailable Career entries and deliberate exclusions that have no catalog record.

## Warhammer Fantasy Roleplay, Fifth Edition

Pack `core` · version 1.1.7

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| armour | 19 | 0 | 0 | 0 | 0 |
| background | 5 | 0 | 0 | 0 | 0 |
| careers | 64 | 0 | 0 | 0 | 0 |
| gear | 129 | 0 | 1 | 0 | 0 |
| market | 124 | 0 | 0 | 0 | 0 |
| referenceEntries | 0 | 0 | 224 | 0 | 0 |
| ruleReferences | 0 | 0 | 430 | 0 | 0 |
| skills | 45 | 0 | 0 | 0 | 0 |
| species | 5 | 0 | 0 | 0 | 0 |
| spells | 225 | 0 | 0 | 0 | 0 |
| tables | 7 | 0 | 0 | 0 | 0 |
| talents | 167 | 0 | 0 | 0 | 0 |
| weapons | 50 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Campaign character management | deferred | Book-wide scope decision | Conditions, combat, spent resources, XP awards and ongoing Career changes remain future manager systems. |
| Guided creation, XP, equipment and editable exports | implemented | p. 27 | Core creation is implemented; live play remains outside the creator. |
| NPC Career development | deferred | p. 355 | Explicitly excluded from the new GM workshop by the user. No Career selection or XP progression is applied. |
| NPC and monster creation | implemented | p. 318–363 | Fresh core-only Bestiary Workshop: printed profiles, templates, Traits, GM edits, equipment, magic, independent drafts and compact PDF export. Career development and live play are excluded. |
| Core rule reference search | reference-only | p. 109–364 | Core Skills, Tests, combat, health, Conditions, Psychology, advancement, prayers, magic, equipment rules/properties and Creature Traits are readable references. This does not automate live play or import every book chapter. |
| Optional individual Advances and tracker grouping | adapted | p. 364 | The user-approved grouping awards a box after five eligible points in the same Skill/Characteristic; Appendix II does not specify tracker interaction. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `core:gear:jewellery` — Jewellery | gear | reference-only | p. 308 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `core:reference:129-tests` — Tests | referenceEntries | reference-only | p. 129 | Sourced book rule reference; no live-play automation. |
| `core:reference:130-describe-action` — Describe Action | referenceEntries | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `core:reference:130-roll-dice` — Roll Dice | referenceEntries | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `core:reference:131-difficulty-and-character-modifiers` — Difficulty And Character Modifiers | referenceEntries | reference-only | p. 131 | Sourced book rule reference; no live-play automation. |
| `core:reference:131-difficulty-table` — Difficulty Table | referenceEntries | reference-only | p. 131 | Sourced book rule reference; no live-play automation. |
| `core:reference:131-summary-outcome` — Summary & Outcome | referenceEntries | reference-only | p. 131 | Sourced book rule reference; no live-play automation. |
| `core:reference:132-rolling-with-advantage` — Rolling with Advantage | referenceEntries | reference-only | p. 132 | Sourced book rule reference; no live-play automation. |
| `core:reference:132-typical-test` — Typical Test | referenceEntries | reference-only | p. 132 | Sourced book rule reference; no live-play automation. |
| `core:reference:133-spend-a-fortune-point-to` — Spend a Fortune Point to: | referenceEntries | reference-only | p. 133 | Sourced book rule reference; no live-play automation. |
| `core:reference:134-a-time-for-crime` — A Time For Crime | referenceEntries | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `core:reference:134-common-forms-of-skullduggery` — Common Forms Of Skullduggery | referenceEntries | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `core:reference:134-theft-and-skullduggery` — Theft And Skullduggery | referenceEntries | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `core:reference:135-example-difficulties-of-common-underhanded-tasks` — Example Difficulties Of Common Underhanded Tasks | referenceEntries | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `core:reference:135-example-outcomes` — Worked example — Stealth (Rural) | referenceEntries | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `core:reference:136-example-outcomes` — Worked example — Sleight of Hand | referenceEntries | reference-only | p. 136 | Sourced book rule reference; no live-play automation. |
| `core:reference:137-lock-difficulty` — Lock Difficulty | referenceEntries | reference-only | p. 137 | Sourced book rule reference; no live-play automation. |
| `core:reference:137-selection-of-traps` — Selection of Traps | referenceEntries | reference-only | p. 137 | Sourced book rule reference; no live-play automation. |
| `core:reference:137-trap-spot-difficulty` — Trap Spot Difficulty | referenceEntries | reference-only | p. 137 | Sourced book rule reference; no live-play automation. |
| `core:reference:138-example-outcomes` — Worked example — Secret Signs | referenceEntries | reference-only | p. 138 | Sourced book rule reference; no live-play automation. |
| `core:reference:139-criminal-coinage` — Criminal Coinage | referenceEntries | reference-only | p. 139 | Sourced book rule reference; no live-play automation. |
| `core:reference:139-example-outcomes` — Worked example — Charm | referenceEntries | reference-only | p. 139 | Sourced book rule reference; no live-play automation. |
| `core:reference:140-common-social-tests` — Common Social Tests | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `core:reference:140-difficulty-factors-of-social-tests` — Difficulty Factors of Social Tests | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `core:reference:140-flattery-bribery-and-status` — Flattery, Bribery, And Status | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `core:reference:141-example-difficulties-of-common-social-actions` — Example Difficulties Of Common Social Actions | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `core:reference:141-social-test-difficulty-factors` — Social Test Difficulty Factors | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `core:reference:142-example-outcomes` — Worked example — Charm | referenceEntries | reference-only | p. 142 | Sourced book rule reference; no live-play automation. |
| `core:reference:142-example-outcomes-2` — Worked example — Intimidate | referenceEntries | reference-only | p. 142 | Sourced book rule reference; no live-play automation. |
| `core:reference:143-example-outcomes` — Worked example — Charm | referenceEntries | reference-only | p. 143 | Sourced book rule reference; no live-play automation. |
| `core:reference:143-success-and-consequence` — Success And Consequence | referenceEntries | reference-only | p. 143 | Sourced book rule reference; no live-play automation. |
| `core:reference:144-example-outcomes` — Worked example — Hard (-2 SL) Gossip | referenceEntries | reference-only | p. 144 | Sourced book rule reference; no live-play automation. |
| `core:reference:145-example-outcomes` — Worked example — Hard (-2 SL) Charm | referenceEntries | reference-only | p. 145 | Sourced book rule reference; no live-play automation. |
| `core:reference:145-stinking-drunk` — Stinking Drunk | referenceEntries | reference-only | p. 145 | Sourced book rule reference; no live-play automation. |
| `core:reference:146-common-means-of-investigation-and-research` — Common Means Of Investigation And Research | referenceEntries | reference-only | p. 146 | Sourced book rule reference; no live-play automation. |
| `core:reference:146-hiding-clues` — Hiding Clues | referenceEntries | reference-only | p. 146 | Sourced book rule reference; no live-play automation. |
| `core:reference:147-common-means-of-investigation-and-research` — Common Means Of Investigation And Research | referenceEntries | reference-only | p. 147 | Sourced book rule reference; no live-play automation. |
| `core:reference:147-example-difficulties-of-common-investigative-tasks` — Example Difficulties Of Common Investigative Tasks | referenceEntries | reference-only | p. 147 | Sourced book rule reference; no live-play automation. |
| `core:reference:148-battle-tongue` — Battle Tongue | referenceEntries | reference-only | p. 148 | Sourced book rule reference; no live-play automation. |
| `core:reference:148-common-lore-specialisations` — Common Lore Specialisations | referenceEntries | reference-only | p. 148 | Sourced book rule reference; no live-play automation. |
| `core:reference:149-family` — Languages and language families | referenceEntries | reference-only | p. 149 | Sourced book rule reference; no live-play automation. |
| `core:reference:150-example-outcomes` — Worked example — Average (+2 SL) Gossip | referenceEntries | reference-only | p. 150 | Sourced book rule reference; no live-play automation. |
| `core:reference:150-good-roleplay` — Good Roleplay | referenceEntries | reference-only | p. 150 | Sourced book rule reference; no live-play automation. |
| `core:reference:151-example-outcomes` — Worked example — Challenging (+0 SL) Perception | referenceEntries | reference-only | p. 151 | Sourced book rule reference; no live-play automation. |
| `core:reference:152-example-navigation-difficulties` — Example Navigation Difficulties | referenceEntries | reference-only | p. 152 | Sourced book rule reference; no live-play automation. |
| `core:reference:153-cunning-crafts` — Cunning Crafts | referenceEntries | reference-only | p. 153 | Sourced book rule reference; no live-play automation. |
| `core:reference:153-locating-herbs-for-remedies` — Locating Herbs For Remedies | referenceEntries | reference-only | p. 153 | Sourced book rule reference; no live-play automation. |
| `core:reference:154-remedy-creation-difficulty` — Remedy Creation Difficulty | referenceEntries | reference-only | p. 154 | Sourced book rule reference; no live-play automation. |
| `core:reference:154-remedy-effectiveness` — Remedy Effectiveness | referenceEntries | reference-only | p. 154 | Sourced book rule reference; no live-play automation. |
| `core:reference:155-selection-of-poisons` — Selection Of Poisons | referenceEntries | reference-only | p. 155 | Sourced book rule reference; no live-play automation. |
| `core:reference:156-example-difficulties-of-common-movement-actions` — Example Difficulties Of Common Movement Actions | referenceEntries | reference-only | p. 156 | Sourced book rule reference; no live-play automation. |
| `core:reference:156-getting-around` — Getting Around | referenceEntries | reference-only | p. 156 | Sourced book rule reference; no live-play automation. |
| `core:reference:157-how-far-though` — How Far, Though? | referenceEntries | reference-only | p. 157 | Sourced book rule reference; no live-play automation. |
| `core:reference:158-pursuit-factors` — Pursuit Factors | referenceEntries | reference-only | p. 158 | Sourced book rule reference; no live-play automation. |
| `core:reference:159-obstacle-table` — Obstacle Table | referenceEntries | reference-only | p. 159 | Sourced book rule reference; no live-play automation. |
| `core:reference:161-rounds-outside-combat` — Rounds Outside Combat | referenceEntries | reference-only | p. 161 | Sourced book rule reference; no live-play automation. |
| `core:reference:163-movement-table` — Movement Table | referenceEntries | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `core:reference:164-attacking` — Attacking | referenceEntries | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `core:reference:164-damaging-weapons-and-armour` — Damaging Weapons And Armour | referenceEntries | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `core:reference:164-hit-locations` — Hit Locations | referenceEntries | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `core:reference:165-critical-hits-and-fumbles` — Critical Hits and Fumbles | referenceEntries | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `core:reference:165-misfire-table` — Misfire Table | referenceEntries | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `core:reference:165-oops-table` — Oops! Table | referenceEntries | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `core:reference:166-melee-attack-modifiers` — Melee Attack Modifiers | referenceEntries | reference-only | p. 166 | Sourced book rule reference; no live-play automation. |
| `core:reference:166-ranged-attack-modifiers-add-all-that-apply` — Ranged Attack Modifiers - Add All That Apply | referenceEntries | reference-only | p. 166 | Sourced book rule reference; no live-play automation. |
| `core:reference:168-scatter` — Scatter | referenceEntries | reference-only | p. 168 | Sourced book rule reference; no live-play automation. |
| `core:reference:170-the-heal-skill-and-bleeding-conditions` — The Heal Skill And Bleeding Conditions | referenceEntries | reference-only | p. 170 | Sourced book rule reference; no live-play automation. |
| `core:reference:171-healing-animals` — Healing Animals | referenceEntries | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `core:reference:171-open-wounds` — Open Wounds | referenceEntries | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `core:reference:171-pulling-your-blows` — Pulling Your Blows | referenceEntries | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `core:reference:173-head-critical-wounds` — Head Critical Wounds | referenceEntries | reference-only | p. 173 | Sourced book rule reference; no live-play automation. |
| `core:reference:174-arm-critical-wounds` — Arm Critical Wounds | referenceEntries | reference-only | p. 174 | Sourced book rule reference; no live-play automation. |
| `core:reference:175-body-critical-wounds` — Body Critical Wounds | referenceEntries | reference-only | p. 175 | Sourced book rule reference; no live-play automation. |
| `core:reference:176-injuries` — Injuries | referenceEntries | reference-only | p. 176 | Sourced book rule reference; no live-play automation. |
| `core:reference:176-leg-critical-wounds` — Leg Critical Wounds | referenceEntries | reference-only | p. 176 | Sourced book rule reference; no live-play automation. |
| `core:reference:177-characteristic-loss` — Characteristic Loss | referenceEntries | reference-only | p. 177 | Sourced book rule reference; no live-play automation. |
| `core:reference:177-healing-times-and-downtime` — Healing Times And Downtime | referenceEntries | reference-only | p. 177 | Sourced book rule reference; no live-play automation. |
| `core:reference:178-impressive-scars` — Impressive Scars | referenceEntries | reference-only | p. 178 | Sourced book rule reference; no live-play automation. |
| `core:reference:182-effect-of-pre-prepared-cures` — Effect Of Pre-Prepared Cures | referenceEntries | reference-only | p. 182 | Sourced book rule reference; no live-play automation. |
| `core:reference:183-creature-size-and-dosage` — Creature Size And Dosage | referenceEntries | reference-only | p. 183 | Sourced book rule reference; no live-play automation. |
| `core:reference:184-conditions-and-fortune` — Conditions And Fortune | referenceEntries | reference-only | p. 184 | Sourced book rule reference; no live-play automation. |
| `core:reference:184-multiple-conditions` — Multiple Conditions | referenceEntries | reference-only | p. 184 | Sourced book rule reference; no live-play automation. |
| `core:reference:186-strength-of-materials` — Strength Of Materials | referenceEntries | reference-only | p. 186 | Sourced book rule reference; no live-play automation. |
| `core:reference:189-mental-corruption-table` — Mental Corruption Table | referenceEntries | reference-only | p. 189 | Sourced book rule reference; no live-play automation. |
| `core:reference:189-physical-corruption-table` — Physical Corruption Table | referenceEntries | reference-only | p. 189 | Sourced book rule reference; no live-play automation. |
| `core:reference:190-during-downtime` — During Downtime | referenceEntries | reference-only | p. 190 | Sourced book rule reference; no live-play automation. |
| `core:reference:191-advancement-xp-costs` — Advancement Xp Costs | referenceEntries | reference-only | p. 191 | Sourced book rule reference; no live-play automation. |
| `core:reference:192-regional-events` — Regional Events Table | referenceEntries | reference-only | p. 192–193 | Sourced book rule reference; no live-play automation. |
| `core:reference:194-character-events` — Character Events Table | referenceEntries | reference-only | p. 194–195 | Sourced book rule reference; no live-play automation. |
| `core:reference:195-money-to-burn` — Money To Burn | referenceEntries | reference-only | p. 195 | Sourced book rule reference; no live-play automation. |
| `core:reference:196-advance-career` — Advance Career | referenceEntries | reference-only | p. 196 | Sourced book rule reference; no live-play automation. |
| `core:reference:196-burdens-of-power` — Burdens of Power | referenceEntries | reference-only | p. 196 | Sourced book rule reference; no live-play automation. |
| `core:reference:196-common-endeavours` — Common Endeavours | referenceEntries | reference-only | p. 196 | Sourced book rule reference; no live-play automation. |
| `core:reference:196-duties-responsibilities` — Duties & Responsibilities | referenceEntries | reference-only | p. 196 | Sourced book rule reference; no live-play automation. |
| `core:reference:196-elves-and-yenlui` — Elves and Yenlui | referenceEntries | reference-only | p. 196 | Sourced book rule reference; no live-play automation. |
| `core:reference:196-endeavours` — Endeavours | referenceEntries | reference-only | p. 196 | Sourced book rule reference; no live-play automation. |
| `core:reference:197-banking` — Banking | referenceEntries | reference-only | p. 197 | Sourced book rule reference; no live-play automation. |
| `core:reference:197-change-career` — Change Career | referenceEntries | reference-only | p. 197 | Sourced book rule reference; no live-play automation. |
| `core:reference:197-combat-training` — Combat Training | referenceEntries | reference-only | p. 197 | Sourced book rule reference; no live-play automation. |
| `core:reference:197-commission` — Commission | referenceEntries | reference-only | p. 197 | Sourced book rule reference; no live-play automation. |
| `core:reference:197-consult-an-expert` — Consult an Expert | referenceEntries | reference-only | p. 197–198 | Sourced book rule reference; no live-play automation. |
| `core:reference:198-crafting` — Crafting | referenceEntries | reference-only | p. 198 | Sourced book rule reference; no live-play automation. |
| `core:reference:198-crafting-difficulty` — Crafting Difficulty | referenceEntries | reference-only | p. 198 | Sourced book rule reference; no live-play automation. |
| `core:reference:198-crafting-sl-required` — Crafting Sl Required | referenceEntries | reference-only | p. 198 | Sourced book rule reference; no live-play automation. |
| `core:reference:198-custom-gear` — Custom Gear | referenceEntries | reference-only | p. 198 | Sourced book rule reference; no live-play automation. |
| `core:reference:198-foment-dissent` — Foment Dissent | referenceEntries | reference-only | p. 198 | Sourced book rule reference; no live-play automation. |
| `core:reference:199-earned-income` — Earned Income | referenceEntries | reference-only | p. 199 | Sourced book rule reference; no live-play automation. |
| `core:reference:199-hardly-working` — Hardly Working | referenceEntries | reference-only | p. 199 | Sourced book rule reference; no live-play automation. |
| `core:reference:199-income` — Income | referenceEntries | reference-only | p. 199 | Sourced book rule reference; no live-play automation. |
| `core:reference:199-invent` — Invent! | referenceEntries | reference-only | p. 199 | Sourced book rule reference; no live-play automation. |
| `core:reference:200-do-me-a-favour` — Do Me A Favour! | referenceEntries | reference-only | p. 200 | Sourced book rule reference; no live-play automation. |
| `core:reference:200-research-lore` — Research Lore | referenceEntries | reference-only | p. 200 | Sourced book rule reference; no live-play automation. |
| `core:reference:200-the-latest-news` — The Latest News | referenceEntries | reference-only | p. 200 | Sourced book rule reference; no live-play automation. |
| `core:reference:201-study-a-mark` — Study a Mark | referenceEntries | reference-only | p. 201 | Sourced book rule reference; no live-play automation. |
| `core:reference:201-training` — Training | referenceEntries | reference-only | p. 201 | Sourced book rule reference; no live-play automation. |
| `core:reference:201-unusual-learning` — Unusual Learning | referenceEntries | reference-only | p. 201 | Sourced book rule reference; no live-play automation. |
| `core:reference:205-strictures` — Manann — Strictures | referenceEntries | reference-only | p. 205 | Sourced book rule reference; no live-play automation. |
| `core:reference:206-strictures` — Morr — Strictures | referenceEntries | reference-only | p. 206 | Sourced book rule reference; no live-play automation. |
| `core:reference:207-strictures` — Myrmidia — Strictures | referenceEntries | reference-only | p. 207 | Sourced book rule reference; no live-play automation. |
| `core:reference:208-strictures` — Ranald — Strictures | referenceEntries | reference-only | p. 208 | Sourced book rule reference; no live-play automation. |
| `core:reference:209-strictures` — Rhya — Strictures | referenceEntries | reference-only | p. 209 | Sourced book rule reference; no live-play automation. |
| `core:reference:210-strictures` — Shallya — Strictures | referenceEntries | reference-only | p. 210 | Sourced book rule reference; no live-play automation. |
| `core:reference:211-strictures` — Sigmar — Strictures | referenceEntries | reference-only | p. 211 | Sourced book rule reference; no live-play automation. |
| `core:reference:212-strictures` — Taal — Strictures | referenceEntries | reference-only | p. 212 | Sourced book rule reference; no live-play automation. |
| `core:reference:213-strictures` — Ulric — Strictures | referenceEntries | reference-only | p. 213 | Sourced book rule reference; no live-play automation. |
| `core:reference:214-strictures` — Verena — Strictures | referenceEntries | reference-only | p. 214 | Sourced book rule reference; no live-play automation. |
| `core:reference:218-wrath-of-the-gods` — Wrath of the Gods Table | referenceEntries | reference-only | p. 218–219 | Sourced book rule reference; no live-play automation. |
| `core:reference:220-blessings` — Blessings | referenceEntries | reference-only | p. 220 | Sourced book rule reference; no live-play automation. |
| `core:reference:220-blessings-by-cult` — Blessings By Cult | referenceEntries | reference-only | p. 220 | Sourced book rule reference; no live-play automation. |
| `core:reference:220-divine-manifestations` — Divine Manifestations | referenceEntries | reference-only | p. 220 | Sourced book rule reference; no live-play automation. |
| `core:reference:220-petty-concerns` — Petty Concerns | referenceEntries | reference-only | p. 220 | Sourced book rule reference; no live-play automation. |
| `core:reference:220-prayer-format` — Prayer Format | referenceEntries | reference-only | p. 220 | Sourced book rule reference; no live-play automation. |
| `core:reference:220-success-levels` — Success Levels | referenceEntries | reference-only | p. 220 | Sourced book rule reference; no live-play automation. |
| `core:reference:222-success-levels` — Success Levels | referenceEntries | reference-only | p. 222 | Sourced book rule reference; no live-play automation. |
| `core:reference:222-touch-miracles-in-combat` — Touch Miracles in Combat | referenceEntries | reference-only | p. 222 | Sourced book rule reference; no live-play automation. |
| `core:reference:23-1-species` — Choosing a Species | referenceEntries | reference-only | p. 23 | Sourced book rule reference; no live-play automation. |
| `core:reference:23-random-talents` — Random Talents Table | referenceEntries | reference-only | p. 23–25 | Sourced book rule reference; no live-play automation. |
| `core:reference:236-overcast-table` — Overcast Table | referenceEntries | reference-only | p. 236 | Sourced book rule reference; no live-play automation. |
| `core:reference:236-types-of-magic-in-the-old-world` — Types Of Magic In The Old World | referenceEntries | reference-only | p. 236 | Sourced book rule reference; no live-play automation. |
| `core:reference:238-minor-miscast-table` — Minor Miscast Table | referenceEntries | reference-only | p. 238 | Sourced book rule reference; no live-play automation. |
| `core:reference:239-major-miscast-table` — Major Miscast Table | referenceEntries | reference-only | p. 239 | Sourced book rule reference; no live-play automation. |
| `core:reference:242-arcane-spells` — Arcane Spells | referenceEntries | reference-only | p. 242 | Sourced book rule reference; no live-play automation. |
| `core:reference:247-lore-of-death` — Lore of Death | referenceEntries | reference-only | p. 247 | Sourced book rule reference; no live-play automation. |
| `core:reference:248-lore-of-fire` — Lore of Fire | referenceEntries | reference-only | p. 248 | Sourced book rule reference; no live-play automation. |
| `core:reference:249-lore-of-heavens` — Lore of Heavens | referenceEntries | reference-only | p. 249 | Sourced book rule reference; no live-play automation. |
| `core:reference:250-lore-of-life` — Lore of Life | referenceEntries | reference-only | p. 250 | Sourced book rule reference; no live-play automation. |
| `core:reference:250-mystics` — Mystics | referenceEntries | reference-only | p. 250 | Sourced book rule reference; no live-play automation. |
| `core:reference:251-lore-of-light` — Lore of Light | referenceEntries | reference-only | p. 251 | Sourced book rule reference; no live-play automation. |
| `core:reference:252-lore-of-metal` — Lore of Metal | referenceEntries | reference-only | p. 252 | Sourced book rule reference; no live-play automation. |
| `core:reference:254-lore-of-shadows` — Lore of Shadows | referenceEntries | reference-only | p. 254 | Sourced book rule reference; no live-play automation. |
| `core:reference:255-lore-of-hedgecraft` — Lore of Hedgecraft | referenceEntries | reference-only | p. 255 | Sourced book rule reference; no live-play automation. |
| `core:reference:256-lore-of-witchcraft` — Lore of Witchcraft | referenceEntries | reference-only | p. 256 | Sourced book rule reference; no live-play automation. |
| `core:reference:259-lore-of-nurgle` — Lore of Nurgle | referenceEntries | reference-only | p. 259 | Sourced book rule reference; no live-play automation. |
| `core:reference:260-lore-of-slaanesh` — Lore of Slaanesh | referenceEntries | reference-only | p. 260 | Sourced book rule reference; no live-play automation. |
| `core:reference:260-lore-of-tzeentch` — Lore of Tzeentch | referenceEntries | reference-only | p. 260 | Sourced book rule reference; no live-play automation. |
| `core:reference:266-the-gms-test-toolkit` — The Gm’S Test Toolkit | referenceEntries | reference-only | p. 266 | Sourced book rule reference; no live-play automation. |
| `core:reference:267-awarding-xp` — Awarding XP | referenceEntries | reference-only | p. 267 | Sourced book rule reference; no live-play automation. |
| `core:reference:268-travelling-by-road` — Travelling By Road | referenceEntries | reference-only | p. 268 | Sourced book rule reference; no live-play automation. |
| `core:reference:269-travel-times` — Travel Times | referenceEntries | reference-only | p. 269 | Sourced book rule reference; no live-play automation. |
| `core:reference:269-travelling-by-river` — Travelling By River | referenceEntries | reference-only | p. 269 | Sourced book rule reference; no live-play automation. |
| `core:reference:296-consumer-guide` — Consumer Guide | referenceEntries | reference-only | p. 296 | Sourced book rule reference; no live-play automation. |
| `core:reference:297-availability-2` — Availability | referenceEntries | reference-only | p. 297 | Sourced book rule reference; no live-play automation. |
| `core:reference:299-encumbrance-examples` — Encumbrance Examples | referenceEntries | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:reference:299-overburdened-examples` — Overburdened Examples | referenceEntries | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:reference:300-weapons` — Weapons | referenceEntries | reference-only | p. 300 | Sourced book rule reference; no live-play automation. |
| `core:reference:301-melee-weapons` — Melee Weapons | referenceEntries | reference-only | p. 301 | Sourced book rule reference; no live-play automation. |
| `core:reference:302-ammunition` — Ammunition | referenceEntries | reference-only | p. 302 | Sourced book rule reference; no live-play automation. |
| `core:reference:302-calculating-range-bands` — Calculating Range Bands | referenceEntries | reference-only | p. 302 | Sourced book rule reference; no live-play automation. |
| `core:reference:302-example-weapon-ranges` — Example Weapon Ranges | referenceEntries | reference-only | p. 302 | Sourced book rule reference; no live-play automation. |
| `core:reference:303-ranged-weapons` — Ranged Weapons | referenceEntries | reference-only | p. 303 | Sourced book rule reference; no live-play automation. |
| `core:reference:307-armour` — Armour | referenceEntries | reference-only | p. 307 | Sourced book rule reference; no live-play automation. |
| `core:reference:307-quick-armour` — Quick Armour | referenceEntries | reference-only | p. 307 | Sourced book rule reference; no live-play automation. |
| `core:reference:308-clothing-and-accessories-2` — Clothing And Accessories | referenceEntries | reference-only | p. 308–309 | Sourced book rule reference; no live-play automation. |
| `core:reference:308-packs-and-containers` — Packs And Containers | referenceEntries | reference-only | p. 308 | Sourced book rule reference; no live-play automation. |
| `core:reference:308-packs-and-containers-2` — Packs And Containers | referenceEntries | reference-only | p. 308 | Sourced book rule reference; no live-play automation. |
| `core:reference:309-food-drink-and-lodging` — Food, Drink, And Lodging | referenceEntries | reference-only | p. 309 | Sourced book rule reference; no live-play automation. |
| `core:reference:309-food-drink-and-lodging-2` — Food, Drink, And Lodging | referenceEntries | reference-only | p. 309 | Sourced book rule reference; no live-play automation. |
| `core:reference:310-guilders` — Guilders | referenceEntries | reference-only | p. 310 | Sourced book rule reference; no live-play automation. |
| `core:reference:310-tools-and-kits` — Tools And Kits | referenceEntries | reference-only | p. 310 | Sourced book rule reference; no live-play automation. |
| `core:reference:310-tools-and-kits-2` — Tools And Kits | referenceEntries | reference-only | p. 310 | Sourced book rule reference; no live-play automation. |
| `core:reference:311-books-and-documents-2` — Books And Documents | referenceEntries | reference-only | p. 311 | Sourced book rule reference; no live-play automation. |
| `core:reference:312-animals-and-vehicles-2` — Animals And Vehicles | referenceEntries | reference-only | p. 312–313 | Sourced book rule reference; no live-play automation. |
| `core:reference:312-trade-tools-and-workshops` — Trade Tools And Workshops | referenceEntries | reference-only | p. 312 | Sourced book rule reference; no live-play automation. |
| `core:reference:312-trade-tools-and-workshops-2` — Trade Tools And Workshops | referenceEntries | reference-only | p. 312 | Sourced book rule reference; no live-play automation. |
| `core:reference:313-poisons-2` — Poisons | referenceEntries | reference-only | p. 313 | Sourced book rule reference; no live-play automation. |
| `core:reference:313-travel-prices` — Travel Prices | referenceEntries | reference-only | p. 313 | Sourced book rule reference; no live-play automation. |
| `core:reference:313-travel-prices-2` — Travel Prices | referenceEntries | reference-only | p. 313 | Sourced book rule reference; no live-play automation. |
| `core:reference:314-herbs-and-remedies-2` — Herbs And Remedies | referenceEntries | reference-only | p. 314 | Sourced book rule reference; no live-play automation. |
| `core:reference:314-quack-remedies` — Quack Remedies | referenceEntries | reference-only | p. 314 | Sourced book rule reference; no live-play automation. |
| `core:reference:315-magical-items-2` — Magical Items | referenceEntries | reference-only | p. 315 | Sourced book rule reference; no live-play automation. |
| `core:reference:315-prosthetics-2` — Prosthetics | referenceEntries | reference-only | p. 315 | Sourced book rule reference; no live-play automation. |
| `core:reference:316-miscellaneous-trappings-2` — Miscellaneous Trappings | referenceEntries | reference-only | p. 316 | Sourced book rule reference; no live-play automation. |
| `core:reference:317-henchmen` — Henchmen | referenceEntries | reference-only | p. 317 | Sourced book rule reference; no live-play automation. |
| `core:reference:317-hirelings` — Hirelings | referenceEntries | reference-only | p. 317 | Sourced book rule reference; no live-play automation. |
| `core:reference:318-creature-characteristics` — Creature Characteristics | referenceEntries | reference-only | p. 318 | Sourced book rule reference; no live-play automation. |
| `core:reference:318-creature-hit-locations` — Creature Hit Locations | referenceEntries | reference-only | p. 318 | Sourced book rule reference; no live-play automation. |
| `core:reference:36-2-class-and-career` — Choosing Class and Career | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `core:reference:36-career-level` — Career Level | referenceEntries | reference-only | p. 36–37 | Sourced book rule reference; no live-play automation. |
| `core:reference:36-random-class-and-career-table` — Random Class and Career Table | referenceEntries | reference-only | p. 36–37 | Sourced book rule reference; no live-play automation. |
| `core:reference:361-adjusting-a-creatures-size` — Adjusting A Creature’S Size | referenceEntries | reference-only | p. 361 | Sourced book rule reference; no live-play automation. |
| `core:reference:361-stomp` — Stomp | referenceEntries | reference-only | p. 361 | Sourced book rule reference; no live-play automation. |
| `core:reference:361-wounds` — Wounds | referenceEntries | reference-only | p. 361 | Sourced book rule reference; no live-play automation. |
| `core:reference:364-advancement-xp-costs` — Advancement Xp Costs | referenceEntries | reference-only | p. 364 | Sourced book rule reference; no live-play automation. |
| `core:reference:364-advantage-and-momentum` — Advantage and Momentum | referenceEntries | reference-only | p. 364 | Sourced book rule reference; no live-play automation. |
| `core:reference:364-creature-traits` — Creature Traits | referenceEntries | reference-only | p. 364 | Sourced book rule reference; no live-play automation. |
| `core:reference:364-difficulty-table` — Difficulty Table | referenceEntries | reference-only | p. 364 | Sourced book rule reference; no live-play automation. |
| `core:reference:364-resilience-and-resolve` — Resilience and Resolve | referenceEntries | reference-only | p. 364 | Sourced book rule reference; no live-play automation. |
| `core:reference:364-test-difficulty` — Test Difficulty | referenceEntries | reference-only | p. 364 | Sourced book rule reference; no live-play automation. |
| `core:reference:38-3-characteristics` — Generating Characteristics | referenceEntries | reference-only | p. 38 | Sourced book rule reference; no live-play automation. |
| `core:reference:38-4-skills` — Starting Skill Advances | referenceEntries | reference-only | p. 38–39 | Sourced book rule reference; no live-play automation. |
| `core:reference:38-characteristic-bonuses` — Characteristic Bonuses | referenceEntries | reference-only | p. 38 | Sourced book rule reference; no live-play automation. |
| `core:reference:38-characteristic-table` — Characteristic Table | referenceEntries | reference-only | p. 38 | Sourced book rule reference; no live-play automation. |
| `core:reference:39-5-talents-trappings-and-final-game-details` — Starting Talents and Trappings | referenceEntries | reference-only | p. 39 | Sourced book rule reference; no live-play automation. |
| `core:reference:39-class-trappings` — Class Trappings Table | referenceEntries | reference-only | p. 39 | Sourced book rule reference; no live-play automation. |
| `core:reference:39-starting-wealth` — Starting Wealth | referenceEntries | reference-only | p. 39 | Sourced book rule reference; no live-play automation. |
| `core:reference:39-types-of-skills` — Types Of Skills | referenceEntries | reference-only | p. 39 | Sourced book rule reference; no live-play automation. |
| `core:reference:40-creating-a-magician-or-priest` — Creating A Magician Or Priest | referenceEntries | reference-only | p. 40 | Sourced book rule reference; no live-play automation. |
| `core:reference:40-maximum-encumbrance` — Starting carrying capacity | referenceEntries | reference-only | p. 40 | Sourced book rule reference; no live-play automation. |
| `core:reference:40-movement-distances` — Movement Distances | referenceEntries | reference-only | p. 40 | Sourced book rule reference; no live-play automation. |
| `core:reference:40-movement-m` — Starting Movement | referenceEntries | reference-only | p. 40 | Sourced book rule reference; no live-play automation. |
| `core:reference:40-oh-fickle-fate` — Oh Fickle Fate | referenceEntries | reference-only | p. 40 | Sourced book rule reference; no live-play automation. |
| `core:reference:40-wounds` — Starting Wounds | referenceEntries | reference-only | p. 40 | Sourced book rule reference; no live-play automation. |
| `core:reference:41-achieving-your-ambitions` — Achieving Your Ambitions | referenceEntries | reference-only | p. 41 | Sourced book rule reference; no live-play automation. |
| `core:reference:41-choose-an-ambition` — Choose an Ambition | referenceEntries | reference-only | p. 41 | Sourced book rule reference; no live-play automation. |
| `core:reference:42-party-ambition` — Party Ambition | referenceEntries | reference-only | p. 42 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-185-ablaze` — Ablaze | ruleReferences | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-185-besmirched` — Besmirched | ruleReferences | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-185-bleeding` — Bleeding | ruleReferences | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-185-blinded` — Blinded | ruleReferences | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-185-broken` — Broken | ruleReferences | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-186-deafened` — Deafened | ruleReferences | reference-only | p. 186 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-186-entangled` — Entangled | ruleReferences | reference-only | p. 186 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-186-fatigued` — Fatigued | ruleReferences | reference-only | p. 186 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-186-poisoned` — Poisoned | ruleReferences | reference-only | p. 186 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-186-prone` — Prone | ruleReferences | reference-only | p. 186 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-186-stunned` — Stunned | ruleReferences | reference-only | p. 186 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-187-surprised` — Surprised | ruleReferences | reference-only | p. 187 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:condition-187-unconscious` — Unconscious | ruleReferences | reference-only | p. 187 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-298-durable` — Durable | ruleReferences | reference-only | p. 298 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-298-fine` — Fine | ruleReferences | reference-only | p. 298 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-298-lightweight` — Lightweight | ruleReferences | reference-only | p. 298 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-298-practical` — Practical | ruleReferences | reference-only | p. 298 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-299-bulky` — Bulky | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-299-shoddy` — Shoddy | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-299-ugly` — Ugly | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-299-unreliable` — Unreliable | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-304-blackpowder` — Blackpowder | ruleReferences | reference-only | p. 304 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-304-blast-rating` — Blast (Rating) | ruleReferences | reference-only | p. 304 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-304-damaging` — Damaging | ruleReferences | reference-only | p. 304 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-304-defensive` — Defensive | ruleReferences | reference-only | p. 304 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-304-fast` — Fast | ruleReferences | reference-only | p. 304 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-304-hack` — Hack | ruleReferences | reference-only | p. 304 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-304-impale` — Impale | ruleReferences | reference-only | p. 304 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-304-inflict-condition` — Inflict (Condition) | ruleReferences | reference-only | p. 304 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-304-magical` — Magical | ruleReferences | reference-only | p. 304 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-304-parry` — Parry | ruleReferences | reference-only | p. 304 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-dangerous` — Dangerous | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-imprecise` — Imprecise | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-penetrating` — Penetrating | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-pistol` — Pistol | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-precise` — Precise | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-pummel` — Pummel | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-reload-rating` — Reload (Rating) | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-repeater-rating` — Repeater (Rating) | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-trap-blade` — Trap Blade | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-unbalanced` — Unbalanced | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-unbreakable` — Unbreakable | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-undamaging` — Undamaging | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-305-wrap` — Wrap | ruleReferences | reference-only | p. 305 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-306-flexible` — Flexible | ruleReferences | reference-only | p. 306 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-306-impenetrable` — Impenetrable | ruleReferences | reference-only | p. 306 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-306-partial` — Partial | ruleReferences | reference-only | p. 306 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-306-shield` — Shield | ruleReferences | reference-only | p. 306 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:property-306-weakpoints` — Weakpoints | ruleReferences | reference-only | p. 306 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:psychology-183-animosity-target` — Animosity (Target) | ruleReferences | reference-only | p. 183 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:psychology-183-fear-rating` — Fear (Rating) | ruleReferences | reference-only | p. 183 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:psychology-184-frenzy` — Frenzy | ruleReferences | reference-only | p. 184 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:psychology-184-hatred-target` — Hatred (Target) | ruleReferences | reference-only | p. 184 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:psychology-184-terror-rating` — Terror (Rating) | ruleReferences | reference-only | p. 184 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-130-advantage-and-disadvantage` — Advantage and Disadvantage | ruleReferences | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-130-automatic-success-and-failure` — Automatic Success and Failure | ruleReferences | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-130-criticals-and-fumbles` — Criticals and Fumbles | ruleReferences | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-130-darkness-and-tests` — Darkness and Tests | ruleReferences | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-130-making-a-test` — Making a Test | ruleReferences | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-130-modifiers-and-0-sl` — Modifiers and 0 SL | ruleReferences | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-130-repeating-tests` — Repeating Tests | ruleReferences | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-131-characteristic-tests` — Characteristic Tests | ruleReferences | reference-only | p. 131 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-131-difficulty-and-character-modifiers` — Difficulty and Character Modifiers | ruleReferences | reference-only | p. 131 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-131-extended-tests` — Extended Tests | ruleReferences | reference-only | p. 131 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-131-opposed-tests` — Opposed Tests | ruleReferences | reference-only | p. 131 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-131-test-outcomes` — Test Outcomes | ruleReferences | reference-only | p. 131 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-132-criticals-and-fumbles` — Criticals and Fumbles | ruleReferences | reference-only | p. 132 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-132-getting-help` — Getting Help | ruleReferences | reference-only | p. 132 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-132-opposed-tests` — Opposed Tests | ruleReferences | reference-only | p. 132 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-133-achieving-the-impossible` — Achieving the Impossible | ruleReferences | reference-only | p. 133 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-133-fate` — Fate | ruleReferences | reference-only | p. 133 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-133-fate-and-fortune` — Fate and Fortune | ruleReferences | reference-only | p. 133 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-133-fortune` — Fortune | ruleReferences | reference-only | p. 133 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-133-replenishing-fate` — Replenishing Fate | ruleReferences | reference-only | p. 133 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-133-replenishing-fortune` — Replenishing Fortune | ruleReferences | reference-only | p. 133 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-134-casing-the-joint` — Casing the Joint | ruleReferences | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-134-keeping-an-eye-out` — Keeping an Eye Out | ruleReferences | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-134-sneaking-around` — Sneaking Around | ruleReferences | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-135-gambling-and-cheating` — Gambling and Cheating | ruleReferences | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-135-silent-takedowns` — Silent Takedowns | ruleReferences | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-136-disarming-a-trap` — Disarming a Trap | ruleReferences | reference-only | p. 136 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-136-picking-locks` — Picking Locks | ruleReferences | reference-only | p. 136 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-136-setting-a-trap` — Setting a Trap | ruleReferences | reference-only | p. 136 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-136-spotting-a-trap` — Spotting a Trap | ruleReferences | reference-only | p. 136 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-136-triggering-a-trap` — Triggering a Trap | ruleReferences | reference-only | p. 136 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-138-forced-entry` — Forced Entry | ruleReferences | reference-only | p. 138 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-138-mugging` — Mugging | ruleReferences | reference-only | p. 138 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-138-picking-pockets` — Picking Pockets | ruleReferences | reference-only | p. 138 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-138-secret-signs` — Secret Signs | ruleReferences | reference-only | p. 138 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-139-fraud-and-charlatanry` — Fraud and Charlatanry | ruleReferences | reference-only | p. 139 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-140-status-and-social-standing` — Status and Social Standing | ruleReferences | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-141-changing-status` — Changing Status | ruleReferences | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-141-maintaining-status` — Maintaining Status | ruleReferences | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-141-status-and-social-tests` — Status and Social Tests | ruleReferences | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-142-befriend-someone-useful` — Befriend Someone Useful | ruleReferences | reference-only | p. 142 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-142-make-a-good-impression` — Make a Good Impression | ruleReferences | reference-only | p. 142 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-143-charming-others` — Charming Others | ruleReferences | reference-only | p. 143 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-143-intimidation-tactics` — Intimidation Tactics | ruleReferences | reference-only | p. 143 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-143-negotiating-a-discount` — Negotiating a Discount | ruleReferences | reference-only | p. 143 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-144-carousing` — Carousing | ruleReferences | reference-only | p. 144 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-144-gossip-and-rumours` — Gossip and Rumours | ruleReferences | reference-only | p. 144 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-145-lies-and-deception` — Lies and Deception | ruleReferences | reference-only | p. 145 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-145-mistaken-identity` — Mistaken Identity | ruleReferences | reference-only | p. 145 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-145-public-speaking` — Public Speaking | ruleReferences | reference-only | p. 145 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-148-what-you-already-know` — What You Already Know | ruleReferences | reference-only | p. 148 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-150-asking-around` — Asking Around | ruleReferences | reference-only | p. 150 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-150-gossip` — Gossip | ruleReferences | reference-only | p. 150 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-150-interrogation` — Interrogation | ruleReferences | reference-only | p. 150 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-150-investigating` — Investigating | ruleReferences | reference-only | p. 150 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-150-research` — Research | ruleReferences | reference-only | p. 150 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-150-searching-a-room` — Searching a Room | ruleReferences | reference-only | p. 150 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-151-intuition-and-insights` — Intuition and Insights | ruleReferences | reference-only | p. 151 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-151-tracking` — Tracking | ruleReferences | reference-only | p. 151 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-152-camping` — Camping | ruleReferences | reference-only | p. 152 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-152-foraging` — Foraging | ruleReferences | reference-only | p. 152 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-152-navigation` — Navigation | ruleReferences | reference-only | p. 152 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-153-locating-ingredients` — Locating Ingredients | ruleReferences | reference-only | p. 153 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-153-making-medicine` — Making Medicine | ruleReferences | reference-only | p. 153 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-153-repairing-armour` — Repairing Armour | ruleReferences | reference-only | p. 153 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-153-repairing-weapons` — Repairing Weapons | ruleReferences | reference-only | p. 153 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-154-alchemical-remedies` — Alchemical Remedies | ruleReferences | reference-only | p. 154 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-154-concocting-poison` — Concocting Poison | ruleReferences | reference-only | p. 154 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-154-herbal-remedies` — Herbal Remedies | ruleReferences | reference-only | p. 154 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-156-climbing` — Climbing | ruleReferences | reference-only | p. 156 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-156-leaping` — Leaping | ruleReferences | reference-only | p. 156 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-157-jumping-down` — Jumping Down | ruleReferences | reference-only | p. 157 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-157-riding-a-mount` — Riding a Mount | ruleReferences | reference-only | p. 157 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-157-swimming` — Swimming | ruleReferences | reference-only | p. 157 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-158-drive` — Drive | ruleReferences | reference-only | p. 158 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-158-pursuit-circumstances` — Pursuit Circumstances | ruleReferences | reference-only | p. 158 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-158-pursuits` — Pursuits | ruleReferences | reference-only | p. 158 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-158-row` — Row | ruleReferences | reference-only | p. 158 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-158-sail` — Sail | ruleReferences | reference-only | p. 158 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-159-concluding-the-chase` — Concluding the Chase | ruleReferences | reference-only | p. 159 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-159-obstacles` — Obstacles | ruleReferences | reference-only | p. 159 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-161-combat-initiative-order` — Combat Initiative Order | ruleReferences | reference-only | p. 161 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-161-surprise` — Surprise | ruleReferences | reference-only | p. 161 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-161-timing` — Timing | ruleReferences | reference-only | p. 161 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-162-action` — Action | ruleReferences | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-162-free-actions` — Free Actions | ruleReferences | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-162-move` — Move | ruleReferences | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-162-on-the-defensive` — On the Defensive | ruleReferences | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-162-taking-your-turn` — Taking Your Turn | ruleReferences | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-163-charging` — Charging | ruleReferences | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-163-disengaging` — Disengaging | ruleReferences | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-163-engaged` — Engaged | ruleReferences | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-163-fleeing` — Fleeing | ruleReferences | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-163-moving-in-combat` — Moving in Combat | ruleReferences | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-163-running` — Running | ruleReferences | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-164-1-roll-to-hit` — 1: Roll to Hit | ruleReferences | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-164-2-determine-hit-location` — 2: Determine Hit Location | ruleReferences | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-164-3-determine-damage` — 3: Determine Damage | ruleReferences | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-164-4-apply-damage` — 4: Apply Damage | ruleReferences | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-164-damaged-armour` — Damaged Armour | ruleReferences | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-164-damaged-weapons` — Damaged Weapons | ruleReferences | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-165-critical-hits` — Critical Hits | ruleReferences | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-165-fumbles` — Fumbles | ruleReferences | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-165-misfires` — Misfires! | ruleReferences | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-165-oops-table` — Oops! Table | ruleReferences | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-165-opposed-tests-and-fumbles` — Opposed Tests and Fumbles | ruleReferences | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-165-ranged-combat` — Ranged Combat | ruleReferences | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-166-combat-modifiers` — Combat Modifiers | ruleReferences | reference-only | p. 166 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-166-melee-weapon-group-special-rules` — Melee Weapon Group Special Rules | ruleReferences | reference-only | p. 166 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-166-melee-weapon-reach` — Melee Weapon Reach | ruleReferences | reference-only | p. 166 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-166-weapon-groups` — Weapon Groups | ruleReferences | reference-only | p. 166 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-aimed-shots` — Aimed Shots | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-called-shots` — Called Shots | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-grappling` — Grappling | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-helpless-targets` — Helpless Targets | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-outnumbering` — Outnumbering | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-shooting-into-a-group` — Shooting into a Group | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-shooting-into-melee` — Shooting into Melee | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-surrounded` — Surrounded | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-two-weapon-fighting` — Two-weapon Fighting | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-unarmed-combat` — Unarmed Combat | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-167-undamaging-and-unarmed-attacks` — Undamaging and Unarmed Attacks | ruleReferences | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-168-gaining-momentum` — Gaining Momentum | ruleReferences | reference-only | p. 168 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-168-losing-momentum` — Losing Momentum | ruleReferences | reference-only | p. 168 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-168-momentum` — Momentum | ruleReferences | reference-only | p. 168 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-168-momentum-and-extra-attacks` — Momentum and Extra Attacks | ruleReferences | reference-only | p. 168 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-168-mounted-combat` — Mounted Combat | ruleReferences | reference-only | p. 168 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-168-scatter` — Scatter | ruleReferences | reference-only | p. 168 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-169-drowning-and-suffocation` — Drowning and Suffocation | ruleReferences | reference-only | p. 169 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-169-falling` — Falling | ruleReferences | reference-only | p. 169 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-169-intimidate-in-combat` — Intimidate in Combat | ruleReferences | reference-only | p. 169 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-169-leadership-in-combat` — Leadership in Combat | ruleReferences | reference-only | p. 169 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-170-exposure` — Exposure | ruleReferences | reference-only | p. 170 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-170-healing-wounds` — Healing Wounds | ruleReferences | reference-only | p. 170 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-170-thirst-and-starvation` — Thirst and Starvation | ruleReferences | reference-only | p. 170 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-170-using-the-heal-skill` — Using the Heal Skill | ruleReferences | reference-only | p. 170 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-170-wounds` — Wounds | ruleReferences | reference-only | p. 170 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-171-critical-wounds` — Critical Wounds | ruleReferences | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-171-magic-alchemy-and-healing` — Magic, Alchemy, and Healing | ruleReferences | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-172-death` — Death | ruleReferences | reference-only | p. 172 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-172-healing-critical-wounds` — Healing Critical Wounds | ruleReferences | reference-only | p. 172 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-172-medical-attention` — Medical Attention | ruleReferences | reference-only | p. 172 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-172-surgery` — Surgery | ruleReferences | reference-only | p. 172 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-176-broken-bones` — Broken Bones | ruleReferences | reference-only | p. 176 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-177-amputated-parts` — Amputated Parts | ruleReferences | reference-only | p. 177 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-177-torn-muscles` — Torn Muscles | ruleReferences | reference-only | p. 177 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-178-arm` — Arm | ruleReferences | reference-only | p. 178 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-178-ear` — Ear | ruleReferences | reference-only | p. 178 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-178-eye` — Eye | ruleReferences | reference-only | p. 178 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-178-fingers` — Fingers | ruleReferences | reference-only | p. 178 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-178-foot` — Foot | ruleReferences | reference-only | p. 178 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-178-hand` — Hand | ruleReferences | reference-only | p. 178 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-178-leg` — Leg | ruleReferences | reference-only | p. 178 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-178-nose` — Nose | ruleReferences | reference-only | p. 178 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-178-teeth` — Teeth | ruleReferences | reference-only | p. 178 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-179-black-plague` — Black Plague | ruleReferences | reference-only | p. 179 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-179-blood-rot` — Blood Rot | ruleReferences | reference-only | p. 179 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-179-disease-and-infection` — Disease and Infection | ruleReferences | reference-only | p. 179 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-179-disease-format` — Disease Format | ruleReferences | reference-only | p. 179 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-179-toes` — Toes | ruleReferences | reference-only | p. 179 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-179-tongue` — Tongue | ruleReferences | reference-only | p. 179 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-180-bloody-flux` — Bloody Flux | ruleReferences | reference-only | p. 180 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-180-festering-wound` — Festering Wound | ruleReferences | reference-only | p. 180 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-180-galloping-trots` — Galloping Trots | ruleReferences | reference-only | p. 180 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-180-itching-pox` — Itching Pox | ruleReferences | reference-only | p. 180 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-180-packer-s-pox` — Packer’s Pox | ruleReferences | reference-only | p. 180 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-180-ratte-fever` — Ratte Fever | ruleReferences | reference-only | p. 180 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-181-blight` — Blight | ruleReferences | reference-only | p. 181 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-181-buboes` — Buboes | ruleReferences | reference-only | p. 181 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-181-convulsions` — Convulsions | ruleReferences | reference-only | p. 181 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-181-coughs-and-sneezes` — Coughs and Sneezes | ruleReferences | reference-only | p. 181 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-181-fever` — Fever | ruleReferences | reference-only | p. 181 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-181-flux` — Flux | ruleReferences | reference-only | p. 181 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-181-sea-sickness` — Sea Sickness | ruleReferences | reference-only | p. 181 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-181-weevil-cough` — Weevil Cough | ruleReferences | reference-only | p. 181 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-182-cures-and-tonics` — Cures and Tonics | ruleReferences | reference-only | p. 182 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-182-gangrene` — Gangrene | ruleReferences | reference-only | p. 182 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-182-infection` — Infection | ruleReferences | reference-only | p. 182 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-182-malaise` — Malaise | ruleReferences | reference-only | p. 182 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-182-nausea` — Nausea | ruleReferences | reference-only | p. 182 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-182-pox` — Pox | ruleReferences | reference-only | p. 182 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-182-treatment-of-disease` — Treatment of Disease | ruleReferences | reference-only | p. 182 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-183-dosage` — Dosage | ruleReferences | reference-only | p. 183 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-183-poisons` — Poisons | ruleReferences | reference-only | p. 183 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-183-psychology-test` — Psychology Test | ruleReferences | reference-only | p. 183 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-184-conditions` — Conditions | ruleReferences | reference-only | p. 184 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-187-gaining-corruption-points` — Gaining Corruption Points | ruleReferences | reference-only | p. 187 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-187-minor-corruption` — Minor Corruption | ruleReferences | reference-only | p. 187 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-187-moderate-corruption` — Moderate Corruption | ruleReferences | reference-only | p. 187 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-188-corrupting` — Corrupting | ruleReferences | reference-only | p. 188 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-188-corruption-limits` — Corruption Limits | ruleReferences | reference-only | p. 188 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-188-dissolution-of-body-and-mind` — Dissolution of Body and Mind | ruleReferences | reference-only | p. 188 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-188-major-corruption` — Major Corruption | ruleReferences | reference-only | p. 188 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-188-manifestation-time` — Manifestation Time | ruleReferences | reference-only | p. 188 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-191-advancement-xp-costs` — Advancement XP Costs | ruleReferences | reference-only | p. 191 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-191-characteristic-advances` — Characteristic Advances | ruleReferences | reference-only | p. 191 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-191-purchasing-talents` — Purchasing Talents | ruleReferences | reference-only | p. 191 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-191-skill-advances` — Skill Advances | ruleReferences | reference-only | p. 191 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-191-spending-xp` — Spending XP | ruleReferences | reference-only | p. 191 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-217-blessings-and-miracles` — Blessings and Miracles | ruleReferences | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-217-limitations` — Limitations | ruleReferences | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-217-sin-points` — Sin Points | ruleReferences | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-217-the-blessed` — The Blessed | ruleReferences | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-218-sin-and-wrath` — Sin and Wrath | ruleReferences | reference-only | p. 218 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-218-wrath-of-the-gods` — Wrath of the Gods | ruleReferences | reference-only | p. 218 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-219-absolution` — Absolution | ruleReferences | reference-only | p. 219 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-219-penance` — Penance | ruleReferences | reference-only | p. 219 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-235-casting-test` — Casting Test | ruleReferences | reference-only | p. 235 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-235-critical-casting` — Critical Casting | ruleReferences | reference-only | p. 235 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-235-duration` — Duration | ruleReferences | reference-only | p. 235 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-235-fumbled-casting` — Fumbled Casting | ruleReferences | reference-only | p. 235 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-235-ingredients` — Ingredients | ruleReferences | reference-only | p. 235 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-235-magic-missiles` — Magic Missiles | ruleReferences | reference-only | p. 235 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-235-spellcasting-limitations` — Spellcasting Limitations | ruleReferences | reference-only | p. 235 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-235-touch-spells-in-combat` — Touch Spells in Combat | ruleReferences | reference-only | p. 235 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-236-channelling` — Channelling | ruleReferences | reference-only | p. 236 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-236-critical-and-fumbled-channelling` — Critical and Fumbled Channelling | ruleReferences | reference-only | p. 236 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-236-overcasting` — Overcasting | ruleReferences | reference-only | p. 236 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-236-second-sight` — Second Sight | ruleReferences | reference-only | p. 236 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-237-armour-repels-the-winds` — Armour Repels the Winds | ruleReferences | reference-only | p. 237 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-237-dispelling` — Dispelling | ruleReferences | reference-only | p. 237 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-237-dispelling-persistent-spells` — Dispelling Persistent Spells | ruleReferences | reference-only | p. 237 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-237-grimoires` — Grimoires | ruleReferences | reference-only | p. 237 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-237-malignant-influences` — Malignant Influences | ruleReferences | reference-only | p. 237 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-237-memorising-spells` — Memorising Spells | ruleReferences | reference-only | p. 237 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-237-multiple-arcane-lores` — Multiple Arcane Lores | ruleReferences | reference-only | p. 237 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-237-using-warpstone` — Using Warpstone | ruleReferences | reference-only | p. 237 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-296-coin-and-status` — Coin and Status | ruleReferences | reference-only | p. 296 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-296-money` — Money | ruleReferences | reference-only | p. 296 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-297-availability` — Availability | ruleReferences | reference-only | p. 297 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-297-clipping` — Clipping | ruleReferences | reference-only | p. 297 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-297-counterfeiting` — Counterfeiting | ruleReferences | reference-only | p. 297 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-297-going-to-market` — Going to Market | ruleReferences | reference-only | p. 297 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-298-bargaining-and-trading` — Bargaining and Trading | ruleReferences | reference-only | p. 298 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-298-bartering` — Bartering | ruleReferences | reference-only | p. 298 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-298-craftsmanship` — Craftsmanship | ruleReferences | reference-only | p. 298 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-298-item-qualities` — Item Qualities | ruleReferences | reference-only | p. 298 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-298-lowering-the-price` — Lowering the Price | ruleReferences | reference-only | p. 298 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-298-selling` — Selling | ruleReferences | reference-only | p. 298 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-299-beasts-of-burden` — Beasts of Burden | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-299-encumbrance` — Encumbrance | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-299-encumbrance-and-attributes` — Encumbrance and Attributes | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-299-encumbrance-and-travel-fatigue` — Encumbrance and Travel Fatigue | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-299-item-flaws` — Item Flaws | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-299-overburdened` — Overburdened | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-299-oversized-items` — Oversized Items | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-299-small-items` — Small Items | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-299-worn-items` — Worn Items | ruleReferences | reference-only | p. 299 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-300-cavalry` — Cavalry | ruleReferences | reference-only | p. 300 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-300-fencing` — Fencing | ruleReferences | reference-only | p. 300 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-300-flail` — Flail | ruleReferences | reference-only | p. 300 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-300-melee-weapon-groups` — Melee Weapon Groups | ruleReferences | reference-only | p. 300 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-300-weapon-reach` — Weapon Reach | ruleReferences | reference-only | p. 300 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-300-weapon-reach-and-defence` — Weapon Reach and Defence | ruleReferences | reference-only | p. 300 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-302-blackpowder-and-explosives` — Blackpowder and Explosives | ruleReferences | reference-only | p. 302 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-302-crossbows-and-throwing` — Crossbows and Throwing | ruleReferences | reference-only | p. 302 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-302-engineering` — Engineering | ruleReferences | reference-only | p. 302 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-302-ranged-weapon-groups` — Ranged Weapon Groups | ruleReferences | reference-only | p. 302 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-302-weapon-range` — Weapon Range | ruleReferences | reference-only | p. 302 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-306-armour` — Armour | ruleReferences | reference-only | p. 306 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-306-armour-and-size` — Armour and Size | ruleReferences | reference-only | p. 306 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-318-creatures-and-equipment` — Creatures and Equipment | ruleReferences | reference-only | p. 318 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-318-customising-creatures` — Customising Creatures | ruleReferences | reference-only | p. 318 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:rule-364-individual-characteristic-advances` — Individual Characteristic Advances | ruleReferences | reference-only | p. 364 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-animal-care` — Animal Care | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-animal-training` — Animal Training | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-art` — Art | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-athletics` — Athletics | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-bribery` — Bribery | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-channelling` — Channelling | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-charm` — Charm | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-charm-animal` — Charm Animal | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-climb` — Climb | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-consume-alcohol` — Consume Alcohol | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-cool` — Cool | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-dodge` — Dodge | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-drive` — Drive | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-endurance` — Endurance | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-entertain` — Entertain | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-111-evaluate` — Evaluate | ruleReferences | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-gamble` — Gamble | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-gossip` — Gossip | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-haggle` — Haggle | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-heal` — Heal | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-intimidate` — Intimidate | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-intuition` — Intuition | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-language` — Language | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-leadership` — Leadership | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-lore` — Lore | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-melee` — Melee | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-navigation` — Navigation | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-112-outdoor-survival` — Outdoor Survival | ruleReferences | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-113-perception` — Perception | ruleReferences | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-113-perform` — Perform | ruleReferences | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-113-pick-lock` — Pick Lock | ruleReferences | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-113-play` — Play | ruleReferences | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-113-pray` — Pray | ruleReferences | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-113-ranged` — Ranged | ruleReferences | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-113-research` — Research | ruleReferences | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-113-ride` — Ride | ruleReferences | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-113-row` — Row | ruleReferences | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-113-sail` — Sail | ruleReferences | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-114-secret-signs` — Secret Signs | ruleReferences | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-114-set-trap` — Set Trap | ruleReferences | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-114-sleight-of-hand` — Sleight of Hand | ruleReferences | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-114-stealth` — Stealth | ruleReferences | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-114-swim` — Swim | ruleReferences | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-114-track` — Track | ruleReferences | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:skill-114-trade` — Trade | ruleReferences | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-356-afraid` — Afraid | ruleReferences | reference-only | p. 356 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-356-amphibious` — Amphibious | ruleReferences | reference-only | p. 356 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-356-animosity` — Animosity | ruleReferences | reference-only | p. 356 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-356-belligerent` — Belligerent | ruleReferences | reference-only | p. 356 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-356-bestial` — Bestial | ruleReferences | reference-only | p. 356 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-356-bite` — Bite | ruleReferences | reference-only | p. 356 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-356-blessed` — Blessed | ruleReferences | reference-only | p. 356 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-bounce` — Bounce | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-breath` — Breath | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-champion` — Champion | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-chill-grasp` — Chill Grasp | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-cold-blooded` — Cold-blooded | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-constrictor` — Constrictor | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-construct` — Construct | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-corrosive-blood` — Corrosive Blood | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-corruption` — Corruption | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-daemonic` — Daemonic | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-357-dark-vision` — Dark Vision | ruleReferences | reference-only | p. 357 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-disease` — Disease | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-distracting` — Distracting | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-ethereal` — Ethereal | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-fear` — Fear | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-fly` — Fly | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-frenzy` — Frenzy | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-ghostly-howl` — Ghostly Howl | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-grim` — Grim | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-hatred` — Hatred | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-horns` — Horns | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-hungry` — Hungry | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-immune-to-psychology` — Immune to Psychology | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-358-immunity` — Immunity | ruleReferences | reference-only | p. 358 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-359-infected` — Infected | ruleReferences | reference-only | p. 359 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-359-infestation` — Infestation | ruleReferences | reference-only | p. 359 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-359-magic-resistance` — Magic Resistance | ruleReferences | reference-only | p. 359 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-359-magical` — Magical | ruleReferences | reference-only | p. 359 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-359-many-heads` — Many Heads | ruleReferences | reference-only | p. 359 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-359-mark-of-chaos` — Mark of Chaos | ruleReferences | reference-only | p. 359 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-359-mental-corruption` — Mental Corruption | ruleReferences | reference-only | p. 359 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-359-miracles` — Miracles | ruleReferences | reference-only | p. 359 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-360-mutation` — Mutation | ruleReferences | reference-only | p. 360 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-360-night-vision` — Night Vision | ruleReferences | reference-only | p. 360 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-360-painless` — Painless | ruleReferences | reference-only | p. 360 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-360-petrifying-gaze` — Petrifying Gaze | ruleReferences | reference-only | p. 360 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-360-regeneration` — Regeneration | ruleReferences | reference-only | p. 360 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-360-size` — Size | ruleReferences | reference-only | p. 360 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-361-skittish` — Skittish | ruleReferences | reference-only | p. 361 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-361-spellcaster` — Spellcaster | ruleReferences | reference-only | p. 361 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-361-sprinter` — Sprinter | ruleReferences | reference-only | p. 361 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-361-stealthy` — Stealthy | ruleReferences | reference-only | p. 361 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-361-striding-gait` — Striding Gait | ruleReferences | reference-only | p. 361 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-362-stupid` — Stupid | ruleReferences | reference-only | p. 362 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-362-swarm` — Swarm | ruleReferences | reference-only | p. 362 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-362-tail` — Tail | ruleReferences | reference-only | p. 362 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-362-tentacles` — Tentacles | ruleReferences | reference-only | p. 362 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-362-territorial` — Territorial | ruleReferences | reference-only | p. 362 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-362-terror` — Terror | ruleReferences | reference-only | p. 362 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-362-tongue` — Tongue | ruleReferences | reference-only | p. 362 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-363-tracker` — Tracker | ruleReferences | reference-only | p. 363 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-363-trained` — Trained | ruleReferences | reference-only | p. 363 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-363-undead` — Undead | ruleReferences | reference-only | p. 363 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-363-unstable` — Unstable | ruleReferences | reference-only | p. 363 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-363-vampiric` — Vampiric | ruleReferences | reference-only | p. 363 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-363-venom` — Venom | ruleReferences | reference-only | p. 363 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-363-vomit` — Vomit | ruleReferences | reference-only | p. 363 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-363-wallcrawler` — Wallcrawler | ruleReferences | reference-only | p. 363 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-363-ward` — Ward | ruleReferences | reference-only | p. 363 | Sourced book rule reference; no live-play automation. |
| `core:rule-reference:trait-363-web` — Web | ruleReferences | reference-only | p. 363 | Sourced book rule reference; no live-play automation. |

</details>

## Up in Arms

Pack `up-in-arms` · version 1.0.4

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 7 | 8 | 0 | 0 | 0 |
| market | 70 | 0 | 0 | 0 | 0 |
| origins | 0 | 3 | 0 | 0 | 0 |
| referenceEntries | 0 | 0 | 128 | 0 | 9 |
| spells | 8 | 1 | 0 | 0 | 0 |
| tables | 7 | 0 | 0 | 0 | 0 |
| talents | 0 | 0 | 0 | 1 | 0 |
| weapons | 43 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Replacement profiles for existing core equipment | unavailable | Book-wide scope decision | User chose to retain core statistics and import only new equipment. |
| Injuries, mounted/group combat, hirelings and Warrior Endeavours | deferred | Book-wide scope decision | Outside character-creation scope. |
| GM Destrier profile | unavailable | p. 29 | User explicitly requested skipping the Destrier after reviewing its undefined optional Traits. |
| GM Riding Horse and Demigryph Mount | adapted | Book-wide scope decision | Two opt-in GM foundations; approved Fifth Edition primary Size Damage and Stride → Sprinter. Printed stats and existing training retained. Named NPCs and hirelings excluded. |
| GM Shock Cavalry training | adapted | p. 107 | Requires War; printed effects are references, with Challenging (+0) converted to +0 SL under core Appendix I. |
| Tilean starting allocations | adapted | p. 55–56 | Approved Fifth Edition allocations with printed Tilean choices and native language. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `up-in-arms:career:artillerist` — Artillerist | careers | adapted | p. 18 | Older Talent options replaced with Fifth Edition definitions: Public Speaker. |
| `up-in-arms:career:camp-follower` — Camp Follower | careers | adapted | p. 20 | Older Talent options replaced with Fifth Edition definitions: Dicer, Public Speaker. |
| `up-in-arms:career:cartographer` — Cartographer | careers | adapted | p. 22 | Older Talent options replaced with Fifth Edition definitions: Striding Gait. |
| `up-in-arms:career:greatsword` — Greatsword | careers | adapted | p. 12 | Older Talent options replaced with Fifth Edition definitions: Public Speaker. |
| `up-in-arms:career:halberdier` — Halberdier | careers | adapted | p. 14 | Older Talent options replaced with Fifth Edition definitions: Dicer, Public Speaker. |
| `up-in-arms:career:light-cavalry` — Light Cavalry | careers | adapted | p. 44 | Older Talent options replaced with Fifth Edition definitions: Trick Rider. |
| `up-in-arms:career:pikeman` — Pikeman | careers | adapted | p. 48 | Older Talent options replaced with Fifth Edition definitions: Dicer. |
| `up-in-arms:career:siege-specialist` — Siege Specialist | careers | adapted | p. 46 | Older Talent options replaced with Fifth Edition definitions: Tunnel Fighter. |
| `up-in-arms:origin:imperial-tilean` — Imperial Tilean | origins | adapted | p. 55 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `up-in-arms:origin:luccini` — Luccini (Tilea) | origins | adapted | p. 55 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `up-in-arms:origin:tilea` — Tilea | origins | adapted | p. 55 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `up-in-arms:reference:101-blackpowder-weapons` — Blackpowder Weapons | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:101-gunpowder-weapons-table` — Gunpowder Weapons Table | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:102-blackpowder-ammunition` — Blackpowder Ammunition | referenceEntries | reference-only | p. 102 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:103-blackpowder-ammunition` — Blackpowder Ammunition | referenceEntries | reference-only | p. 103–104 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:103-engineering-weapons` — Engineering Weapons | referenceEntries | reference-only | p. 103 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:105-animal-care` — Animal Care | referenceEntries | reference-only | p. 105 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:105-movement-and-initiative` — Movement and Initiative | referenceEntries | reference-only | p. 105–106 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:105-what-counts-as-a-mount` — What Counts as a Mount? | referenceEntries | reference-only | p. 105 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:106-attacking-and-defending` — Attacking and Defending | referenceEntries | reference-only | p. 106 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:106-fear-and-terror` — Fear and Terror | referenceEntries | reference-only | p. 106 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:106-mount-actions` — Mount Actions | referenceEntries | reference-only | p. 106 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:106-mounts-and-advantage` — Mounts and Advantage | referenceEntries | reference-only | p. 106 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:106-the-skittish-trait` — The Skittish Trait | referenceEntries | reference-only | p. 106 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:106-training` — Training | referenceEntries | reference-only | p. 106–107 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:107-attacks-on-quadrupeds-2` — Attacks On Quadrupeds | referenceEntries | reference-only | p. 107 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:107-new-trait-trained-shock-cavalry` — Trained (Shock Cavalry) | referenceEntries | reference-only | p. 107 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:107-trained-magic` — Trained (Magic) | referenceEntries | reference-only | p. 107 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:107-trained-war` — Trained (War) | referenceEntries | reference-only | p. 107 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:108-conditions-while-mounted` — Conditions While Mounted | referenceEntries | reference-only | p. 108 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:108-falling-from-a-mount` — Falling from a Mount | referenceEntries | reference-only | p. 108 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:109-acquiring-a-demigrpyh` — Acquiring a Demigrpyh | referenceEntries | reference-only | p. 109 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:109-profile-demigryph-mount` — Demigryph Mount | referenceEntries | deferred | p. 109 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `up-in-arms:reference:110-hired-goons` — Hired Goons | referenceEntries | reference-only | p. 110 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:113-hireling-profiles` — Hireling Profiles | referenceEntries | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:113-profile-local-scout-silver-1` — Local Scout — Silver 1 | referenceEntries | deferred | p. 113 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `up-in-arms:reference:113-profile-seasoned-mercenary-silver-3` — Seasoned Mercenary — Silver 3 | referenceEntries | deferred | p. 113 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `up-in-arms:reference:114-profile-doktor-silver-5` — Doktor — Silver 5 | referenceEntries | deferred | p. 114 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `up-in-arms:reference:114-profile-lawyer-silver-3` — Lawyer — Silver 3 | referenceEntries | deferred | p. 114 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `up-in-arms:reference:114-profile-porter-silver-1` — Porter — Silver 1 | referenceEntries | deferred | p. 114 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `up-in-arms:reference:114-profile-scribe-silver-2` — Scribe — Silver 2 | referenceEntries | deferred | p. 114 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `up-in-arms:reference:116-physical-quirks` — Physical Quirks | referenceEntries | reference-only | p. 116 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:116-work-ethic` — Work Ethic | referenceEntries | reference-only | p. 116 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:117-personality-quirks` — Personality Quirks | referenceEntries | reference-only | p. 117 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:118-cover-penalty` — Cover Penalty | referenceEntries | reference-only | p. 118 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:118-enc-and-encumbrance-limit` — ENC and Encumbrance Limit | referenceEntries | reference-only | p. 118 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:118-sample-structures` — Sample Structures | referenceEntries | reference-only | p. 118 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:119-common-structures-table` — Common Structures Table | referenceEntries | reference-only | p. 119 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:119-riverboats` — Riverboats | referenceEntries | reference-only | p. 119 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:119-structures` — Structures | referenceEntries | reference-only | p. 119–120 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:120-attacks-on-structures` — Attacks on Structures | referenceEntries | reference-only | p. 120 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:120-structure-damage` — Structure Damage | referenceEntries | reference-only | p. 120–121 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:121-structure-critical-damage` — Structure Critical Damage | referenceEntries | reference-only | p. 121 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:121-structure-critical-hits` — Structure Critical Hits | referenceEntries | reference-only | p. 121 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:122-repairing-structures` — Repairing Structures | referenceEntries | reference-only | p. 122 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:122-siege-weapons` — Siege Weapons | referenceEntries | reference-only | p. 122–123 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:123-siege-weapons` — Siege Weapons Table | referenceEntries | reference-only | p. 123 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:124-siege-ammunition` — Siege Ammunition | referenceEntries | reference-only | p. 124 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:125-crewed` — Crewed | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:126-salvo` — Salvo | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:126-salvo-artillery-misfire-table` — Salvo Artillery Misfire Table | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:127-breaking-from-combat` — Breaking from Combat | referenceEntries | reference-only | p. 127 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:127-pursuits` — Pursuits | referenceEntries | reference-only | p. 127–128 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:128-complex-pursuits` — Complex Pursuits | referenceEntries | reference-only | p. 128 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:129-character-progress-table` — Character Progress Table | referenceEntries | reference-only | p. 129 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:129-impeded-movement` — Impeded Movement | referenceEntries | reference-only | p. 129 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:130-creating-obstacles` — Creating Obstacles | referenceEntries | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:130-exhaustion` — Exhaustion | referenceEntries | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:130-obstacles` — Obstacles | referenceEntries | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:131-obstacles-table` — Obstacles Table | referenceEntries | reference-only | p. 131 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:132-exhaustion-table` — Exhaustion Table | referenceEntries | reference-only | p. 132 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:132-simple-vs-complex-pursuits` — Simple vs Complex Pursuits | referenceEntries | reference-only | p. 132 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:133-gaining-advantage` — Gaining Advantage | referenceEntries | reference-only | p. 133 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:133-group-advantage` — Group Advantage | referenceEntries | reference-only | p. 133 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:134-benefits-of-advantage` — Benefits Of Advantage | referenceEntries | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:134-losing-advantage` — Losing Advantage | referenceEntries | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:135-initial-advantage` — Initial Advantage | referenceEntries | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:135-seeding-the-advantage-pools` — Seeding the Advantage Pools | referenceEntries | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:135-unstable` — Unstable | referenceEntries | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:136-altered-actions-in-combat` — Altered Actions in Combat | referenceEntries | reference-only | p. 136 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:137-fanmariss-perfect-shot` — Fanmaris’s Perfect Shot | referenceEntries | reference-only | p. 137 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:137-the-leitdorf-defence` — The Leitdorf Defence | referenceEntries | reference-only | p. 137 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:137-warrior-endeavours` — Warrior Endeavours | referenceEntries | reference-only | p. 137 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:138-alcatini-method` — Alcatini Method | referenceEntries | reference-only | p. 138 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:138-count-punchausens-narrative-auction` — Count Punchausen’s Narrative Auction | referenceEntries | reference-only | p. 138 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:138-the-quartermaster-shuffle` — The Quartermaster Shuffle | referenceEntries | reference-only | p. 138 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:139-job-generator` — Job Generator | referenceEntries | reference-only | p. 139 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:139-location-table` — Location Table | referenceEntries | reference-only | p. 139 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:139-objective-table` — Objective Table | referenceEntries | reference-only | p. 139 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:139-personality-table` — Personality Table | referenceEntries | reference-only | p. 139 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:140-beat-blade` — Beat Blade | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:140-distract` — Distract | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:140-drilled` — Drilled | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:140-flee` — Flee! | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:140-gunner` — Gunner | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:140-rapid-reload` — Rapid Reload | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:141-relentless` — Relentless | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:141-reversal` — Reversal | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:141-roughrider` — Roughrider | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:141-shieldsman` — Shieldsman | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:141-strike-to-injure` — Strike to Injure | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:29-profile-destrier-heavy-warhorse` — Destrier — Heavy Warhorse | referenceEntries | deferred | p. 29 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `up-in-arms:reference:29-profile-riding-horse` — Riding Horse | referenceEntries | deferred | p. 29 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `up-in-arms:reference:80-approach-to-injury` — Approach To Injury | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:80-critical-wounds` — Critical Wounds | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:80-inflicting-a-critical-hit-on-an-opponent-with-wounds` — Inflicting a Critical Hit on an Opponent with Wounds | referenceEntries | reference-only | p. 80–81 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:80-updates-to-the-bleeding-condition` — Updates To The Bleeding Condition | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:80-wounds` — Wounds | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:81-additional-wound-loss-from-critical-damage` — Additional Wound Loss from Critical Damage | referenceEntries | reference-only | p. 81 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:81-inflicting-a-critical-hit-on-an-opponent-with-0-wounds` — Inflicting a Critical Hit on an Opponent with 0 Wounds | referenceEntries | reference-only | p. 81 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:82-death` — Death | referenceEntries | reference-only | p. 82 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:82-options-sudden-death` — Options: Sudden Death | referenceEntries | reference-only | p. 82 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:82-pulling-your-blows` — Pulling Your Blows | referenceEntries | reference-only | p. 82 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:82-trivial-injuries` — Trivial Injuries | referenceEntries | reference-only | p. 82 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:83-head-critical-wounds` — Head Critical Wounds | referenceEntries | reference-only | p. 83 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:84-arm-critical-wounds` — Arm Critical Wounds | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:85-body-critical-wounds` — Body Critical Wounds | referenceEntries | reference-only | p. 85 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:86-leg-critical-wounds` — Leg Critical Wounds | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:87-a-soldiers-burden` — A Soldier’S Burden | referenceEntries | reference-only | p. 87–88 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:88-equipment` — Equipment | referenceEntries | reference-only | p. 88–89 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:89-new-qualities-and-flaws` — New Qualities and Flaws | referenceEntries | reference-only | p. 89 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:89-slash-xa` — Slash (XA) | referenceEntries | reference-only | p. 89 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:89-spread-rating` — Spread (Rating) | referenceEntries | reference-only | p. 89 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:89-trip` — Trip | referenceEntries | reference-only | p. 89 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:89-unbalanced` — Unbalanced | referenceEntries | reference-only | p. 89 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:9-10-skills` — 10 Skills? | referenceEntries | reference-only | p. 9 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:9-new-careers` — New Careers | referenceEntries | reference-only | p. 9 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:9-new-careers-2` — New Careers | referenceEntries | reference-only | p. 9 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:90-basic-weapons` — Basic Weapons | referenceEntries | reference-only | p. 90 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:90-the-shield-quality` — The Shield Quality | referenceEntries | reference-only | p. 90 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:91-basic-weapons-table` — Basic Weapons Table | referenceEntries | reference-only | p. 91 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:92-shield-table` — Shield Table | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:92-shields` — Shields | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:93-cavalry-weapons` — Cavalry Weapons | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:93-cavalry-weapons-table` — Cavalry Weapons Table | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:93-fencing-weapons-table` — Fencing Weapons Table | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:94-brawling-weapons` — Brawling Weapons | referenceEntries | reference-only | p. 94 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:94-brawling-weapons-table` — Brawling Weapons Table | referenceEntries | reference-only | p. 94–95 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:95-flail-weapons-table` — Flail Weapons Table | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:95-parrying-weapons` — Parrying Weapons | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:95-parrying-weapons-table` — Parrying Weapons Table | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:96-polearm-weapons-table` — Polearm Weapons Table | referenceEntries | reference-only | p. 96 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:96-polearms` — Polearms | referenceEntries | reference-only | p. 96–97 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:97-two-handed-weapons` — Two-Handed Weapons | referenceEntries | reference-only | p. 97 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:98-ammunition` — Ammunition | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:98-crossbow` — Crossbow | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:98-traditional-ammunition-table` — Traditional Ammunition Table | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:reference:98-two-handed-weapons-table` — Two-Handed Weapons Table | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `up-in-arms:miracle:in-good-order` — In Good Order | spells | adapted | p. 79 | Fourth Edition Advantage references converted to Momentum (core Appendix I). |
| `up-in-arms:talent:crew-commander` — Crew Commander | talents | unavailable | p. 140 | Unavailable: Crew Commander has no Fifth Edition core equivalent. Its Fourth Edition repeat limit and Talent Test bonus need an agreed conversion (Up in Arms p. 140). |

</details>

## Archives of the Empire: Volume I

Pack `archives-i` · version 1.0.3

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 0 | 4 | 0 | 0 | 0 |
| market | 17 | 1 | 0 | 0 | 0 |
| origins | 1 | 15 | 0 | 0 | 0 |
| referenceEntries | 0 | 0 | 10 | 0 | 13 |
| talents | 0 | 1 | 0 | 0 | 0 |
| weapons | 13 | 1 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Bestiary Workshop: weapons, ammunition, Skill choices and Youngblood | implemented | Book-wide scope decision | Reuses approved registered data through independent GM book selection; no named NPCs, animal foundations, Career development or extra starting allocations. Youngblood and Blackbriar preserve their specific existing Legacy metadata. |
| Kindred trials, followers and animal management | deferred | Book-wide scope decision | Starting origins and Career choices are supported; campaign progression is deferred. |
| Ghost Strider: Lip Reading in Skill list | unavailable | p. 88 | Printed under Skills but is a core Talent; user chose to leave this entry unavailable. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `archives-i:career:badger-rider` — Badger Rider | careers | adapted | p. 91 | Older Talent options replaced with Fifth Edition definitions: Trick Rider, Tunnel Fighter. |
| `archives-i:career:fieldwarden` — Fieldwarden | careers | adapted | p. 89 | Unspecified Fearless becomes a core enemy-group choice; Savant (Moot terrain) requires core Lore (Moot). |
| `archives-i:career:ghost-strider` — Ghost Strider | careers | adapted | p. 88 | Older Talent options replaced with Fifth Edition definitions: Striding Gait. |
| `archives-i:career:karak-ranger` — Karak Ranger | careers | adapted | p. 90 | Older Talent options replaced with Fifth Edition definitions: Striding Gait. |
| `archives-i:item:blackbriar-javelin` — Blackbriar Javelin | market | adapted | p. 93 | Creator profile/choice is supported; situational play effects remain reference text. |
| `archives-i:origin:ashfield` — Ashfield clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:brambledown` — Brambledown clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:brandysnap` — Brandysnap clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:eonir-cityborn` — Eonir — Cityborn (Toriour) | origins | adapted | p. 78 | Eonir use the Fifth Edition Wood Elf starting profile and allocations; Cityborn uses Fifth Edition High Elf Career availability without High Elf Species benefits. |
| `archives-i:origin:eonir-forestborn` — Eonir — Forestborn (Faniour) | origins | adapted | p. 78 | Eonir use the Fifth Edition Wood Elf starting profile and allocations; Cityborn uses Fifth Edition High Elf Career availability without High Elf Species benefits. |
| `archives-i:origin:eonir-younger` — Eonir — Younger (Harioth) | origins | adapted | p. 78 | Eonir use the Fifth Edition Wood Elf starting profile and allocations; Cityborn uses Fifth Edition High Elf Career availability without High Elf Species benefits. |
| `archives-i:origin:hayfoot` — Hayfoot clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:hayfoot-hollyfoot` — Hayfoot-Hollyfoot clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:hollyfoot` — Hollyfoot clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:lostpockets` — Lostpockets clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:lowhaven` — Lowhaven clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:rumster` — Rumster clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:skelfsider` — Skelfsider clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:thorncobble` — Thorncobble clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:origin:tumbleberry` — Tumbleberry clan (Reikland) | origins | adapted | p. 32 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-i:reference:23-profile-misodoctakleidist-doc-ashfield-soldier-silver-3` — Misodoctakleidist ‘Doc’ Ashfield Soldier (Silver 3) | referenceEntries | deferred | p. 23 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:24-profile-thomasina-tina-brambledown-bargeswain-silver-3` — Thomasina ‘Tina’ Brambledown Bargeswain (Silver 3) | referenceEntries | deferred | p. 24 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:27-profile-luitpoldstrasse-louis-lostpockets-master-beggar-brass-4` — Luitpoldstrasse ‘Louis’ Lostpockets Master Beggar (Brass 4) | referenceEntries | deferred | p. 27 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:28-profile-belliquotious-bella-lowhaven-iv-racketeer-brass-5` — Belliquotious ‘Bella’ Lowhaven Iv Racketeer (Brass 5) | referenceEntries | deferred | p. 28 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:29-profile-suffonsification-suffy-rumster-lvi-apprentice-artisan-brass-2` — Suffonsification ‘Suffy’ Rumster Lvi Apprentice Artisan (Brass 2) | referenceEntries | deferred | p. 29 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:30-profile-spoondrift-spoony-skelfsider-grave-robber-brass-3` — Spoondrift ‘Spoony’ Skelfsider – Grave Robber (Brass 3) | referenceEntries | deferred | p. 30 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:31-options-halfling-nobles` — Options: Halfling Nobles | referenceEntries | reference-only | p. 31 | Sourced book rule reference; no live-play automation. |
| `archives-i:reference:31-profile-thelonius-hardcastle-monkenbridge-thorncobble-xii-scion-gold-1` — Thelonius Hardcastle Monkenbridge Thorncobble Xii – Scion (Gold 1) | referenceEntries | deferred | p. 31 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:32-options-halfling-clan-skills-and-talents` — Options: Halfling Clan Skills and Talents | referenceEntries | reference-only | p. 32 | Sourced book rule reference; no live-play automation. |
| `archives-i:reference:56-profile-alrik-skagsson-inquisitor-silver-5` — Alrik Skagsson – Inquisitor (Silver 5) | referenceEntries | deferred | p. 56 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:56-profile-karstin-largsdottir-agent-gold-1` — Karstin Largsdottir – Agent (Gold 1) | referenceEntries | deferred | p. 56 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:57-profile-thyk-hurgarsson-fellow-silver-5` — Thyk Hurgarsson – Fellow (Silver 5) | referenceEntries | deferred | p. 57 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:62-profile-volund-sliverscar-chartered-engineer-gold-2` — Volund Sliverscar Chartered Engineer (Gold 2) | referenceEntries | deferred | p. 62 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:63-profile-gurniksson-hammerback-miner-foreman-silver-4` — Gurniksson Hammerback – Miner Foreman (Silver 4) | referenceEntries | deferred | p. 63 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:63-profile-ragni-thorisson-officer-gold-1` — Ragni Thorisson – Officer (Gold 1) | referenceEntries | deferred | p. 63 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-i:reference:78-eonir-player-characters` — Eonir Player Characters | referenceEntries | reference-only | p. 78 | Sourced book rule reference; no live-play automation. |
| `archives-i:reference:92-dwarf-melee-weapons` — Dwarf Melee Weapons | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `archives-i:reference:92-eonir-melee-weapons` — Eonir Melee Weapons | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `archives-i:reference:92-halfling-melee-weapons` — Halfling Melee Weapons | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `archives-i:reference:93-dwarf-ammunition` — Dwarf Ammunition | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `archives-i:reference:93-dwarf-ranged-weapons` — Dwarf Ranged Weapons | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `archives-i:reference:93-eonir-ammunition` — Eonir Ammunition | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `archives-i:reference:93-eonir-ranged-weapons` — Eonir Ranged Weapons | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `archives-i:talent:youngblood` — Youngblood | talents | adapted | p. 78 | Fourth Edition per-rank bonus on the listed Tests omitted; printed limit and effects retained under the approved Fifth Edition adaptation. |
| `archives-i:weapon:blackbriar-javelin` — Blackbriar Javelin | weapons | adapted | p. 93 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |

</details>

## Archives of the Empire: Volume II

Pack `archives-ii` · version 1.0.6

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| armour | 2 | 0 | 0 | 0 | 0 |
| astrology | 20 | 0 | 0 | 0 | 0 |
| background | 1 | 0 | 0 | 0 | 0 |
| careers | 2 | 1 | 0 | 0 | 0 |
| market | 12 | 0 | 0 | 0 | 0 |
| referenceEntries | 0 | 0 | 103 | 0 | 15 |
| species | 0 | 1 | 0 | 0 | 0 |
| spells | 3 | 4 | 0 | 0 | 0 |
| tables | 2 | 0 | 0 | 0 | 0 |
| talents | 0 | 1 | 0 | 0 | 0 |
| weapons | 8 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Big Names, live magic, artifice, mass battles and psychology | deferred | Book-wide scope decision | Outside creator scope; no manufacturing prices become shop prices. |
| Firebelly Wizard modifications | unavailable | p. 31 | No complete printed Career modifications; no invented profile. |
| Typical Orderly standard-profile guidance | reference-only | p. 76 | No fixed printed stat block or quantified template; existing Species foundations and GM Skill adjustments implement the manual workflow. |
| Ogre restrictions / GM permission reminder | reference-only | p. 21 | Informational rule text only; no acknowledgement checkbox or export gate. |
| GM Rhinox foundation and approved Trait conversions | adapted | p. 34 | Weapon +9 → +15 for core Large Size, Stride → Sprinter, proposed Fury → Frenzy, Hardy → one core Talent rank. Optional training stays optional. |
| GM Typical Sister foundation | implemented | p. 76 | Printed profile, Skill totals, core Talents and Trappings retained. No invented equipment or prayers. |
| Rhinox Herder Harpoon statistics | reference-only | p. 36 | Retain the printed Trapping name; do not assume launcher or ammunition-pack statistics. |
| Ogre carrying Talent ordering | adapted | p. 31 | Apply core carrying Talents first, then double capacity, as approved. |
| Typical Ogre equipment sizing categories | adapted | p. 31 | Use user-approved categories; unclear items remain unresolved. |
| Star-sign Talent compatibility and core limits | adapted | p. 39 | Keep Fifth Edition limits and magic compatibility; an already-owned nonrepeatable Talent counts once. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `archives-ii:career:rhinox-herder` — Rhinox Herder | careers | adapted | p. 36 | Older Talent options replaced with Fifth Edition definitions: Striding Gait, Trick Rider. |
| `archives-ii:reference:14-profile-isrogdal-the-urgent-ogre-protagonist-former-pugilist-silver-1` — Isrogdal The Urgent — Ogre Protagonist, Former Pugilist (Silver 1) | referenceEntries | deferred | p. 14 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:14-profile-ugrik-the-lost-ogre-outlaw-brass-2` — Ugrik The Lost — Ogre Outlaw (Brass 2) | referenceEntries | deferred | p. 14 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:18-ogres-and-mutation` — Ogres And Mutation | referenceEntries | reference-only | p. 18–19 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:18-random-class-and-career-table` — Random Class And Career Table | referenceEntries | reference-only | p. 18 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:18-species` — Species | referenceEntries | reference-only | p. 18 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:20-new-psychology-vice` — Vice | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:20-ogre-attributes-table` — Ogre Attributes Table | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:20-ogre-species-skills-and-talents` — Ogre Species Skills and Talents | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:20-skills-and-talents` — Skills and Talents | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:21-age` — Age | referenceEntries | reference-only | p. 21 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:21-eye-colour-table` — Eye Colour Table | referenceEntries | reference-only | p. 21 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:21-hair-colour-table` — Hair Colour Table | referenceEntries | reference-only | p. 21 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:21-height` — Height | referenceEntries | reference-only | p. 21 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:21-not-stupid-just-single-minded` — Not Stupid, Just Single Minded | referenceEntries | reference-only | p. 21 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:22-ogre-element-1-table` — Ogre Element 1 Table | referenceEntries | reference-only | p. 22 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:22-ogre-element-2-table` — Ogre Element 2 Table | referenceEntries | reference-only | p. 22 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:23-big-names` — Big Names | referenceEntries | reference-only | p. 23 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:23-example-big-names` — Example Big Names | referenceEntries | reference-only | p. 23 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:25-advancing-ogre-characters` — Advancing Ogre Characters | referenceEntries | reference-only | p. 25 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:26-artur-hammerfoot-ogre-artisan` — Artur Hammerfoot, Ogre Artisan | referenceEntries | deferred | p. 26 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:26-nazzaalta-talltale-ogre-stevedore` — Nazzaalta Talltale, Ogre Stevedore | referenceEntries | deferred | p. 26 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:28-deathblow` — Deathblow | referenceEntries | reference-only | p. 28 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:28-defending-against-ogres` — Defending Against Ogres | referenceEntries | reference-only | p. 28 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:28-ogre-equipment` — Ogre Equipment | referenceEntries | reference-only | p. 28 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:28-other-notes` — Other Notes | referenceEntries | reference-only | p. 28 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:28-weapon-damage` — Weapon Damage | referenceEntries | reference-only | p. 28 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:29-ogre-ammunition` — Ogre Ammunition | referenceEntries | reference-only | p. 29 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:29-ogre-armour` — Ogre Armour | referenceEntries | reference-only | p. 29 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:29-ogre-melee-weapons` — Ogre Melee Weapons | referenceEntries | reference-only | p. 29 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:29-ogre-ranged-weapons` — Ogre Ranged Weapons | referenceEntries | reference-only | p. 29 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:31-ogre-magic` — Ogre Magic | referenceEntries | reference-only | p. 31 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:31-ogre-spellcasters` — Ogre Spellcasters | referenceEntries | reference-only | p. 31 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:31-people-of-burden` — People Of Burden | referenceEntries | reference-only | p. 31 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:32-the-lore-of-the-great-maw` — The Lore of The Great Maw | referenceEntries | reference-only | p. 32 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:34-rhinox` — Rhinox | referenceEntries | deferred | p. 34 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:39-star-sign-table` — Star Sign Table | referenceEntries | reference-only | p. 39 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:39-star-signs-and-character-creation` — Star Signs And Character Creation | referenceEntries | reference-only | p. 39 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:50-determining-ascendant-sign` — Determining Ascendant Sign | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:50-determining-celestial-mansions` — Determining Celestial Mansions | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:51-magical-artefact-generation-table` — Magical Artefact Generation Table | referenceEntries | reference-only | p. 51 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:52-commissioning-a-magical-artefact` — Commissioning a Magical Artefact | referenceEntries | reference-only | p. 52 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:52-identifying-a-magical-artefact` — Identifying A Magical Artefact | referenceEntries | reference-only | p. 52 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:53-time-and-money` — Time and Money | referenceEntries | reference-only | p. 53 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:54-fine-ill-make-it-myself` — Fine, I’ll Make it Myself! | referenceEntries | reference-only | p. 54 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:54-the-finished-result` — The Finished Result | referenceEntries | reference-only | p. 54 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:55-quietened-mail` — Quietened Mail | referenceEntries | reference-only | p. 55 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:55-random-creature-table` — Random Creature Table | referenceEntries | reference-only | p. 55 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:55-shinsmasher-s-club` — Shinsmasher's Club | referenceEntries | reference-only | p. 55 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:55-throatseeker-s-blade` — Throatseeker's Blade | referenceEntries | reference-only | p. 55 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:56-quirks-and-curses` — Quirks And Curses | referenceEntries | reference-only | p. 56–57 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:57-magical-weapons` — Magical Weapons | referenceEntries | reference-only | p. 57 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:57-magical-weapons-table` — Magical Weapons Table | referenceEntries | reference-only | p. 57 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:58-magical-weapon-qualities` — Magical Weapon Qualities | referenceEntries | reference-only | p. 58–59 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:60-magical-weapon-history-table` — Magical Weapon History Table | referenceEntries | reference-only | p. 60 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:60-the-history-of-magical-weapons` — The History of Magical Weapons | referenceEntries | reference-only | p. 60 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:61-magical-ammunition-table` — Magical Ammunition Table | referenceEntries | reference-only | p. 61 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:61-magical-arrows-and-bolts` — Magical Arrows and Bolts | referenceEntries | reference-only | p. 61 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:61-temporary-enchantments` — Temporary Enchantments | referenceEntries | reference-only | p. 61 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:62-armour-size-table` — Armour Size Table | referenceEntries | reference-only | p. 62 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:62-gromril-and-ithilmar` — Gromril And Ithilmar | referenceEntries | reference-only | p. 62 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:62-magical-armour` — Magical Armour | referenceEntries | reference-only | p. 62 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:62-magical-armour-table` — Magical Armour Table | referenceEntries | reference-only | p. 62 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:63-magical-armour-qualities` — Magical Armour Qualities | referenceEntries | reference-only | p. 63 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:64-magical-shield-table` — Magical Shield Table | referenceEntries | reference-only | p. 64 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:64-magical-shields` — Magical Shields | referenceEntries | reference-only | p. 64 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:64-scroll-table` — Scroll Table | referenceEntries | reference-only | p. 64–65 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:64-scrolls` — Scrolls | referenceEntries | reference-only | p. 64 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:64-shield-quality-table` — Shield Quality Table | referenceEntries | reference-only | p. 64 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:65-staffs` — Staffs | referenceEntries | reference-only | p. 65 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:65-wand-table` — Wand Table | referenceEntries | reference-only | p. 65 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:65-wands` — Wands | referenceEntries | reference-only | p. 65 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:66-magical-rings` — Magical Rings | referenceEntries | reference-only | p. 66 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:66-ring-table` — Ring Table | referenceEntries | reference-only | p. 66 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:66-talisman-table` — Talisman Table | referenceEntries | reference-only | p. 66 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:67-oddities` — Oddities | referenceEntries | reference-only | p. 67 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:74-profile-margaret-von-aschendorf-abbess-shallya-silver-2` — Margaret Von Aschendorf Abbess (Shallya) (Silver 2) | referenceEntries | deferred | p. 74 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:75-profile-anna-lise-levertske-nun-former-apothecary-brass-4` — Anna-Lise Levertske Nun, Former Apothecary (Brass 4) | referenceEntries | deferred | p. 75 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:75-profile-clementine-clausewitz-nun-shallya-brass-4` — Clementine Clausewitz Nun (Shallya) (Brass 4) | referenceEntries | deferred | p. 75 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:75-profile-marie-duvallier-nun-shallya-former-physician-brass-4` — Marie Duvallier Nun (Shallya), Former Physician (Brass 4) | referenceEntries | deferred | p. 75 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:76-profile-hanna-bratsch-attendant-former-sergeant-brass-3` — Hanna Bratsch Attendant, Former Sergeant (Brass 3*) | referenceEntries | deferred | p. 76 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:76-profile-typical-sister-nun-shallya-brass-4` — Typical Sister — Nun (Shallya) (Brass 4) | referenceEntries | deferred | p. 76 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:77-erzbet-wegener-patient-brass-0` — Erzbet Wegener — Patient (Brass 0) | referenceEntries | deferred | p. 77 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:78-profile-adalmann-von-hopfberg-noble-lord-gold-7` — Adalmann Von Hopfberg Noble Lord (Gold 7) | referenceEntries | deferred | p. 78 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:79-profile-isabella-seer-brass-4` — Isabella — Seer (Brass 4) | referenceEntries | deferred | p. 79 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:80-profile-richter-kless-professor-gold-1` — Richter Kless — Professor (Gold 1) | referenceEntries | deferred | p. 80 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-ii:reference:82-power` — Power | referenceEntries | reference-only | p. 82 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:83-battlefield-strength` — Battlefield Strength | referenceEntries | reference-only | p. 83 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:83-options-the-cost-of-war` — Options: The Cost Of War | referenceEntries | reference-only | p. 83 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:83-stand-to-attention` — Battlefield Power Modifiers | referenceEntries | reference-only | p. 83 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:84-battle-endeavours` — Battle Endeavours | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:84-infiltrate` — Infiltrate | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:84-inspiring-speech` — Inspiring Speech | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:84-muster-forces` — Muster Forces | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:84-sabotage` — Sabotage | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:84-scout` — Scout | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:85-other-preparations` — Other Preparations | referenceEntries | reference-only | p. 85 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:85-plan` — Plan | referenceEntries | reference-only | p. 85 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:85-the-battle` — The Battle | referenceEntries | reference-only | p. 85 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:86-bolster` — Bolster | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:86-charge` — Charge | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:86-hold-this-ground` — Hold This Ground | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:86-let-it-rain` — Let it Rain | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:86-protect` — Protect | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:87-cinematic-scene-guidelines` — Cinematic Scene Guidelines | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:87-options-the-horrors-of-war` — Options: The Horrors Of War | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:88-bring-it-down` — Bring It Down | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:88-fly-by` — Fly By | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:88-intruders` — War Machines | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:88-war-machines` — War Machines | referenceEntries | reference-only | p. 88–89 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:89-green-with-envy` — Green With Envy | referenceEntries | reference-only | p. 89 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:89-siege-quality` — Siege Quality | referenceEntries | reference-only | p. 89 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:89-typical-barricades-and-cover` — Typical Barricades And Cover | referenceEntries | reference-only | p. 89 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:90-options-environmental-factors` — Options: Environmental Factors | referenceEntries | reference-only | p. 90 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:92-animosity-and-hatred` — Animosity and Hatred | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:92-fear-of-the-dark` — Fear of the Dark | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:92-new-endeavour-recuperation` — New Endeavour: Recuperation | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:92-things-get-better` — Things Get Better | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `archives-ii:reference:92-trauma` — Trauma | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `archives-ii:species:ogre` — Ogre | species | adapted | p. 20 | User-approved Fifth Edition starting Fate/Fortune, five Skills at +5 and separate Size instead of the old Size Talent. |
| `archives-ii:spell:bullgorger` — Bullgorger | spells | adapted | p. 32 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-ii:spell:feast-of-the-fallen` — Feast of the Fallen | spells | adapted | p. 33 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-ii:spell:the-maw` — The Maw | spells | adapted | p. 33 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-ii:spell:trollguts` — Trollguts | spells | adapted | p. 33 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-ii:talent:vice` — Vice (Target) | talents | adapted | p. 20 | Fourth Edition per-rank bonus on the listed Tests omitted; printed limit and effects retained under the approved Fifth Edition adaptation. |

</details>

## Archives of the Empire: Volume III

Pack `archives-iii` · version 1.0.5

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| cants | 24 | 0 | 0 | 0 | 0 |
| careers | 1 | 2 | 0 | 0 | 0 |
| origins | 0 | 5 | 0 | 0 | 0 |
| referenceEntries | 0 | 0 | 105 | 0 | 12 |
| spells | 20 | 7 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Alternative armour system | unavailable | p. 34–38 | User chose to skip this entire alternative, including its new profiles. |
| Live casting/Cants, armour maintenance and adventures | deferred | Book-wide scope decision | Selections/descriptions are available; play systems are deferred. |
| Optional free Cant selections and export | implemented | p. 85–88 | Choose at 1/3/6 learned Colour Lore spells, without live power tracking. |
| Enterprises, including starting ownership | deferred | p. 6 | User deferred ownership, debt, trade and business management together. |
| Animal Familiar creation and progression | deferred | p. 75–82 | User deferred the whole chapter until the character manager. |
| GM Cant choices | implemented | p. 85–88 | Optional 1/3/6 Colour Lore Cant selections require the matching Talent. User-approved explicit Arcane spell Lore assignments count each spell once. Selections prune on loss and appear in folio/review/exports; live Channelling/power remain deferred. |
| GM prayers, Hedgecraft and printed specialisations | implemented | p. 47–74 | Shared approved profiles, seven explicit Fellstave targets, Old Faith Invoke selects Blessings. No named/familiar foundations, alternative armour or PC Career/XP grants. |
| Old Faith extra Blessing prices | adapted | p. 58 | Exclude six Bless-granted prayers; count Invoke and bought prayers for escalating core Miracle prices. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `archives-iii:career:priest-of-handrich` — Priest of Handrich | careers | adapted | p. 46 | Older Talent options replaced with Fifth Edition definitions: Public Speaker. |
| `archives-iii:career:priestess-of-rhya` — Priestess of Rhya | careers | adapted | p. 72 | Older Talent options replaced with Fifth Edition definitions: Public Speaker. |
| `archives-iii:origin:docklands` — Altdorf — Docklands | origins | adapted | p. 84 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-iii:origin:dwarf-altdorfer` — Altdorf — Dwarf Altdorfer | origins | adapted | p. 83 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-iii:origin:eastender` — Altdorf — Eastender | origins | adapted | p. 83 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-iii:origin:hexxerbezrik` — Altdorf — Hexxerbezrik | origins | adapted | p. 84 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-iii:origin:south-banker` — Altdorf — South Banker | origins | adapted | p. 83 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `archives-iii:reference:12-courier-service` — Courier Service | referenceEntries | reference-only | p. 12–13 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:13-crafting-workshop` — Crafting Workshop | referenceEntries | reference-only | p. 13–14 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:14-example-expansion-table` — Example Expansion Table | referenceEntries | reference-only | p. 14 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:15-criminal-gang` — Criminal Gang | referenceEntries | reference-only | p. 15–16 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:17-holy-temple` — Holy Temple | referenceEntries | reference-only | p. 17–18 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:18-religious-alternatives` — Religious Alternatives | referenceEntries | reference-only | p. 18 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:19-knightly-order` — Knightly Order | referenceEntries | reference-only | p. 19–20 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:20-alternative-options-for-specific-orders` — Alternative Options For Specific Orders | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:21-tavern` — Tavern | referenceEntries | reference-only | p. 21–22 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:23-market-parlour` — Market Parlour | referenceEntries | reference-only | p. 23–24 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:25-noble-estate` — Noble Estate | referenceEntries | reference-only | p. 25–26 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:26-the-reality-of-noble-estates` — The Reality Of Noble Estates | referenceEntries | reference-only | p. 26 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:27-performance-troupe` — Performance Troupe | referenceEntries | reference-only | p. 27–28 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:29-publishing-house` — Publishing House | referenceEntries | reference-only | p. 29–30 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:30-profile-grafina-griselda-human-magnate-gold-5` — Grafina Griselda — Human Magnate Gold 5 | referenceEntries | deferred | p. 30 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:34-armour-and-stealth-tests` — Armour and Stealth Tests | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:34-armour-damage` — Armour Damage | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:34-looting-armour` — Looting Armour | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:34-poor-fit` — Poor Fit | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:34-suitable-fit` — Suitable Fit | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:34-wont-fit` — Won’t Fit | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:35-asking-an-npc-to-repair-armour` — Asking an NPC to Repair Armour | referenceEntries | reference-only | p. 35 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:35-critical-deflection` — Critical Deflection | referenceEntries | reference-only | p. 35 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:35-repairing-armour` — Repairing Armour | referenceEntries | reference-only | p. 35 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:35-repairing-armour-as-an-endeavour` — Repairing Armour as an Endeavour | referenceEntries | reference-only | p. 35 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:35-repairing-armour-with-the-trade-skill` — Repairing Armour With the Trade Skill | referenceEntries | reference-only | p. 35 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:36-armour-rules` — Armour Rules | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:36-combining-armour` — Combining Armour | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:36-impenetrable` — Impenetrable | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:36-overcoat` — Overcoat | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:36-partial` — Partial | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:36-reinforced` — Reinforced | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:36-requires-kit` — Requires Kit | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:36-visor` — Visor | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:36-weakpoints` — Weakpoints | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:37-boiled-leather` — Boiled Leather | referenceEntries | reference-only | p. 37 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:37-brigandine` — Brigandine | referenceEntries | reference-only | p. 37 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:37-chainmail` — Chainmail | referenceEntries | reference-only | p. 37 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:37-plate` — Plate | referenceEntries | reference-only | p. 37 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:37-soft-kits` — Soft Kits | referenceEntries | reference-only | p. 37 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:38-armet` — Armet | referenceEntries | reference-only | p. 38 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:38-armet-damage` — Armet Damage | referenceEntries | reference-only | p. 38 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:42-strictures-of-handrich` — Strictures of Handrich | referenceEntries | reference-only | p. 42–43 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:47-handrichs-blessings` — Handrich’S Blessings | referenceEntries | reference-only | p. 47 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:47-miracles-of-handrich` — Miracles Of Handrich | referenceEntries | reference-only | p. 47 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:51-penances` — Khaine — Penances | referenceEntries | reference-only | p. 51 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:53-penances` — Solkan — Penances | referenceEntries | reference-only | p. 53 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:53-strictures` — Solkan — Strictures | referenceEntries | reference-only | p. 53 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:58-priests-of-the-old-faith` — Priests Of The Old Faith | referenceEntries | reference-only | p. 58 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:58-strictures` — Old Faith — Strictures | referenceEntries | reference-only | p. 58 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:6-starting-an-enterprise` — Starting An Enterprise | referenceEntries | reference-only | p. 6–7 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:62-alternative-skills-and-talents` — Alternative Skills And Talents | referenceEntries | reference-only | p. 62 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:63-goodwill` — Goodwill | referenceEntries | reference-only | p. 63 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:63-mirkride` — Mirkride | referenceEntries | reference-only | p. 63 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:63-nepenthe` — Nepenthe | referenceEntries | reference-only | p. 63 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:63-nostrum` — Nostrum | referenceEntries | reference-only | p. 63 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:63-part-the-branches` — Part the Branches | referenceEntries | reference-only | p. 63 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:64-protective-charm` — Protective Charm | referenceEntries | reference-only | p. 64 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:7-enterprise-format` — Enterprise Format | referenceEntries | reference-only | p. 7 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:76-abilities-limitations` — Abilities & Limitations | referenceEntries | reference-only | p. 76 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:76-profile-badger` — Badger | referenceEntries | deferred | p. 76 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:77-profile-cat` — Cat | referenceEntries | deferred | p. 77 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:77-profile-crow` — Crow | referenceEntries | deferred | p. 77 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:77-profile-fox` — Fox | referenceEntries | deferred | p. 77 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:77-profile-owl` — Owl | referenceEntries | deferred | p. 77 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:78-animal-familiar-characteristics` — Animal Familiar Characteristics | referenceEntries | reference-only | p. 78 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:78-animal-familiar-generation` — Animal Familiar Generation | referenceEntries | reference-only | p. 78 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:78-profile-stoat` — Stoat | referenceEntries | deferred | p. 78 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:79-animal-skills-parent-characteristics` — Animal Skills & Parent Characteristics | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:79-badger` — Badger — familiar starting choices | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:79-cat` — Cat — familiar starting choices | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:79-crow` — Crow — familiar starting choices | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:79-finding-a-gifted-animal` — Finding A Gifted Animal | referenceEntries | reference-only | p. 79–80 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:79-fox` — Fox — familiar starting choices | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:79-option-animal-familiar-size-variations` — Option: Animal Familiar Size Variations | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:79-owl` — Owl — familiar starting choices | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:79-starting-skills-talents-and-traits` — Starting Skills, Talents, and Traits | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:79-stoat` — Stoat — familiar starting choices | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:8-interest-payments` — Interest Payments | referenceEntries | reference-only | p. 8 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:8-repaying-debt` — Repaying Debt | referenceEntries | reference-only | p. 8 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:80-animal-communication` — Animal Communication | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:80-animal-familiar-behaviours` — Animal Familiar Behaviours | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:80-bonding-with-animal-familiars` — Bonding With Animal Familiars | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:80-more-than-one` — More than One? | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:80-spirit-bonding-ritual` — Spirit-Bonding Ritual | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:81-companion-traits-new` — Companion Traits (New) | referenceEntries | reference-only | p. 81–82 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:81-corruption-death` — Corruption & Death | referenceEntries | reference-only | p. 81 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:81-language-barnyard-or-wilds` — Language (Barnyard or Wilds) | referenceEntries | reference-only | p. 81 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:81-new-talents-creature-traits` — New Talents & Creature Traits | referenceEntries | reference-only | p. 81 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:82-new-creature-trait-animal-telepathy` — Animal Telepathy | referenceEntries | reference-only | p. 82 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:82-new-creature-trait-invisibility` — Invisibility | referenceEntries | reference-only | p. 82 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:82-new-creature-trait-messenger` — Messenger | referenceEntries | reference-only | p. 82 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:82-new-creature-trait-sensory-sharing` — Sensory Sharing | referenceEntries | reference-only | p. 82 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:85-channelling` — Channelling | referenceEntries | reference-only | p. 85 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:85-channelling-test` — Channelling Test | referenceEntries | reference-only | p. 85 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:86-cants` — Cants | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:86-critical-channelling` — Critical Channelling | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:86-fumbled-channelling` — Fumbled Channelling | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:86-how-much-is-too-much` — How Much Is Too Much? | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:86-interruptions` — Interruptions | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:86-key-differences` — Key Differences | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:86-warpstone` — Warpstone | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:87-the-lore-of-beasts` — The Lore of Beasts | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:87-the-lore-of-death` — The Lore of Death | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:87-the-lore-of-fire` — The Lore of Fire | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:87-the-lore-of-heavens` — The Lore of Heavens | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:88-the-lore-of-life` — The Lore of Life | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:88-the-lore-of-light` — The Lore of Light | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:88-the-lore-of-metal` — The Lore of Metal | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:88-the-lore-of-shadows` — The Lore of Shadows | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:9-enterprise-events` — Enterprise Events | referenceEntries | reference-only | p. 9–11 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:9-expansion` — Expansion | referenceEntries | reference-only | p. 9 | Sourced book rule reference; no live-play automation. |
| `archives-iii:reference:90-profile-lord-adalbert-knopp-inzel-human-first-knight-and-spy-gold-2` — Lord Adalbert Knopp-Inzel Human First Knight (And Spy) Gold 2 | referenceEntries | deferred | p. 90 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:92-profile-brother-samhel-human-priest-of-morr-silver-1` — Brother Samhel Human Priest Of Morr (Silver 1) | referenceEntries | deferred | p. 92 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:93-profile-ella-terenz-human-con-artist-silver-2` — Ella Terenz Human Con Artist (Silver 2) | referenceEntries | deferred | p. 93 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:94-profile-leonard-human-squire-silver-3` — Leonard Human Squire (Silver 3) | referenceEntries | deferred | p. 94 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:reference:94-profile-ridrek-blackhelm-dwarf-entertainer-and-spy-brass-5` — Ridrek Blackhelm Dwarf Entertainer (And Spy) (Brass 5) | referenceEntries | deferred | p. 94 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `archives-iii:spell:dagger-of-the-art` — Dagger of the Art | spells | adapted | p. 62 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-iii:spell:fellstave` — Fellstave | spells | adapted | p. 62 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-iii:spell:rhyas-taming` — Rhya’s Taming | spells | adapted | p. 74 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-iii:spell:shake-on-it` — Shake On It | spells | adapted | p. 47 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-iii:spell:supply-and-demand` — Supply and Demand | spells | adapted | p. 47 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-iii:spell:the-ousting` — The Ousting | spells | adapted | p. 64 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-iii:spell:twist-of-fortune` — Twist of Fortune | spells | adapted | p. 47 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |

</details>

## Archives III — Animal-doctor Hedge Witch

Pack `archives-iii-hedge` · version 1.0.0

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 0 | 1 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Animal-doctor Trade (Charms) swap | unavailable | p. 62 | Source Skill is absent from the core Career; do not invent a swap. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `archives-iii-hedge:career:hedge-witch` — Hedge Witch | careers | adapted | p. 62 | Older Talent options replaced with Fifth Edition definitions: Striding Gait. Compatible swaps applied to the Fifth Edition Career; obsolete Trade (Charms) swap unavailable; extra Skill options grant no extra free Advances. |

</details>

## Winds of Magic

Pack `winds-of-magic` · version 1.0.3

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 10 | 2 | 0 | 0 | 0 |
| gear | 4 | 0 | 1 | 0 | 0 |
| referenceEntries | 0 | 0 | 253 | 0 | 21 |
| skills | 1 | 1 | 0 | 0 | 0 |
| spells | 101 | 52 | 0 | 0 | 0 |
| tables | 4 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Mundane Alchemist Petty Magic grant | adapted | p. 39 | Approved min(acquisition WP Bonus, 4) distinct free spells. |
| Alternate casting, crafting, potions, familiars and environmental magic | deferred | Book-wide scope decision | Core creator rules remain authoritative; live/downtime systems are deferred. |
| Skin of Bone and Bark ordinary learning | deferred | p. 218 | Adventure-acquired two-caster spell has no ordinary starting grant or learning cost. |
| College Marks | reference-only | p. 24 | College affiliation does not grant starting Arcane Marks. |
| Fimir Marsh Magic as player options | unavailable | p. 217 | No supported player Species/Lore grants these adversary spells. |
| Species Talent trade for Psychometry | adapted | p. 48 | Approved paid-advancement unlock only; no starting Skill points. |
| Ritual memorisation | implemented | p. 28–33 | Uses printed learning XP; performance remains deferred. |
| Enchanted Staff commissioning | deferred | p. 152 | The Commission Endeavour is deferred; acquired staff reference is retained. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `winds-of-magic:career:beadle` — Beadle | careers | adapted | p. 36 | Older Talent options replaced with Fifth Edition definitions: Dicer, Public Speaker. |
| `winds-of-magic:career:mundane-alchemist` — Mundane Alchemist | careers | adapted | p. 38 | Free Petty Magic grant capped at the smaller of acquisition Willpower Bonus or four, by user-approved adaptation. |
| `winds-of-magic:gear:enchanted-staff` — Enchanted Staff | gear | reference-only | p. 152 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `winds-of-magic:reference:101-starcrossed` — Starcrossed | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:101-the-first-portent-of-amul` — The First Portent of Amul | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:101-the-second-portent-of-amul` — The Second Portent of Amul | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:101-the-third-portent-of-amul` — The Third Portent of Amul | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:109-profile-immanuel-ferrand-holswig-schliestein-human-spymaster-gold-4` — Immanuel-Ferrand Holswig-Schliestein Human Spymaster (Gold 4) | referenceEntries | deferred | p. 109 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:110-bewilder` — Bewilder | referenceEntries | reference-only | p. 110 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:110-choking-shadows` — Choking Shadows | referenceEntries | reference-only | p. 110 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:110-the-lore-of-shadows` — The Lore Of Shadows | referenceEntries | reference-only | p. 110 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:111-doppelganger` — Doppelganger | referenceEntries | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:111-illusion` — Illusion | referenceEntries | reference-only | p. 111 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:112-mindslip` — Mindslip | referenceEntries | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:112-mystifying-miasma` — Mystifying Miasma | referenceEntries | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:113-shadowsteed` — Shadowsteed | referenceEntries | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:113-shadowstep` — Shadowstep | referenceEntries | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:113-shroud-of-invisibility` — Shroud of Invisibility | referenceEntries | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:121-profile-elspeth-von-draken-human-wizard-lord-gold-2` — Elspeth Von Draken Human Wizard Lord (Gold 2) | referenceEntries | deferred | p. 121 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:122-the-lore-of-death` — The Lore Of Death | referenceEntries | reference-only | p. 122 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:123-caress-of-laniph` — Caress of Laniph | referenceEntries | reference-only | p. 123 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:123-crystal-maze` — Crystal Maze | referenceEntries | reference-only | p. 123 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:123-dying-words` — Dying Words | referenceEntries | reference-only | p. 123 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:124-purple-pall-of-shyish` — Purple Pall of Shyish | referenceEntries | reference-only | p. 124 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:124-sanctify` — Sanctify | referenceEntries | reference-only | p. 124 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:124-scythe-of-shyish` — Scythe of Shyish | referenceEntries | reference-only | p. 124 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:124-soul-vortex` — Soul Vortex | referenceEntries | reference-only | p. 124 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:125-steal-life` — Steal Life | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:125-swift-passing` — Swift Passing | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:133-profile-sergov-pfeiffer-human-bright-wizard-silver-3` — Sergov Pfeiffer Human Bright Wizard (Silver 3) | referenceEntries | deferred | p. 133 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:134-aqshys-aegis` — Aqshy’s Aegis | referenceEntries | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:134-the-lore-of-fire` — The Lore Of Fire | referenceEntries | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:135-cauterise` — Cauterise | referenceEntries | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:135-crown-of-flame` — Crown of Flame | referenceEntries | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:135-firewall` — Firewall | referenceEntries | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:135-flaming-hearts` — Flaming Hearts | referenceEntries | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:135-flaming-sword-of-rhuin` — Flaming Sword of Rhuin | referenceEntries | reference-only | p. 135 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:136-great-fires-of-uzhul` — Great Fires of U’Zhul | referenceEntries | reference-only | p. 136 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:137-purge` — Purge | referenceEntries | reference-only | p. 137 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:145-profile-gregor-martak-human-shaman-lord-gold-2` — Gregor Martak Human Shaman Lord (Gold 2) | referenceEntries | deferred | p. 145 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:146-amber-talons` — Amber Talons | referenceEntries | reference-only | p. 146 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:146-beast-form` — Beast Form | referenceEntries | reference-only | p. 146 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:146-beast-master` — Beast Master | referenceEntries | reference-only | p. 146 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:146-the-lore-of-beasts` — The Lore Of Beasts | referenceEntries | reference-only | p. 146 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:147-beast-tongue` — Beast Tongue | referenceEntries | reference-only | p. 147 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:147-beast-unbroken` — Beast Unbroken | referenceEntries | reference-only | p. 147 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:147-flock-of-doom` — Flock of Doom | referenceEntries | reference-only | p. 147 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:148-hunters-hide` — Hunter’s Hide | referenceEntries | reference-only | p. 148 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:148-the-amber-spear` — The Amber Spear | referenceEntries | reference-only | p. 148 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:149-wyssans-wildform` — Wyssan’s Wildform | referenceEntries | reference-only | p. 149 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:150-beast-form-and-other-transformation-spells` — Beast Form And Other Transformation Spells | referenceEntries | reference-only | p. 150 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:151-wizards-robes` — Wizard’s Robes | referenceEntries | reference-only | p. 151 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:153-scroll-lores` — Scroll Lores | referenceEntries | reference-only | p. 153 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:153-scrolls` — Scrolls | referenceEntries | reference-only | p. 153 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:153-writing-scrolls` — Writing Scrolls | referenceEntries | reference-only | p. 153–154 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:154-magic-potions` — Magic Potions | referenceEntries | reference-only | p. 154 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:155-potion-characteristics` — Potion Characteristics | referenceEntries | reference-only | p. 155 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:155-using-potions` — Using Potions | referenceEntries | reference-only | p. 155 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:156-potion-spoilage-chance` — Potion Spoilage Chance | referenceEntries | reference-only | p. 156 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:156-potion-spoilage-effects` — Potion Spoilage Effects | referenceEntries | reference-only | p. 156 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:157-potion-spoilage-effects` — Potion Spoilage Effects | referenceEntries | reference-only | p. 157–159 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:159-sensory-loss-table` — Sensory Loss Table | referenceEntries | reference-only | p. 159 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:160-benefits-of-second-sight` — Benefits Of Second Sight | referenceEntries | reference-only | p. 160–161 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:160-brewing` — Brewing | referenceEntries | reference-only | p. 160 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:160-brewing-potions` — Brewing Potions | referenceEntries | reference-only | p. 160 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:160-brewing-skill-test` — Brewing Skill Test | referenceEntries | reference-only | p. 160 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:160-ingredients` — Ingredients | referenceEntries | reference-only | p. 160 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:160-potion-brewers-requirements` — Potion Brewer’S Requirements | referenceEntries | reference-only | p. 160 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:161-boars-musk` — Boar’s Musk | referenceEntries | reference-only | p. 161 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:161-brewing-disasters` — Brewing Disasters | referenceEntries | reference-only | p. 161 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:161-concoct` — Concoct | referenceEntries | reference-only | p. 161 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:162-channelpath-potion` — Channelpath Potion | referenceEntries | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:162-debauchs-friend` — Debauch’s Friend | referenceEntries | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:162-draught-of-power` — Draught of Power | referenceEntries | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:162-hair-tonic` — Hair Tonic | referenceEntries | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:162-lucidity-tonic` — Lucidity Tonic | referenceEntries | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:162-nectar-of-beauty` — Nectar of Beauty | referenceEntries | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:162-nectar-of-veracity` — Nectar of Veracity | referenceEntries | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:162-nectar-of-vitality` — Nectar of Vitality | referenceEntries | reference-only | p. 162 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:163-panacea-universalis` — Panacea Universalis | referenceEntries | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:163-potency-draught` — Potency Draught | referenceEntries | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:163-potion-of-flight` — Potion of Flight | referenceEntries | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:163-potion-of-fortune` — Potion of Fortune | referenceEntries | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:163-potion-of-invisibility` — Potion of Invisibility | referenceEntries | reference-only | p. 163 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:164-grimoires` — Grimoires | referenceEntries | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:164-using-grimoires` — Using Grimoires | referenceEntries | reference-only | p. 164 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:165-grimoire-miscast-table` — Grimoire Miscast Table | referenceEntries | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:165-krampis-tome-of-power` — Krampi’s Tome of Power | referenceEntries | reference-only | p. 165 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:166-random-grimoires` — Random Grimoires | referenceEntries | reference-only | p. 166 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:167-power-stones` — Power Stones | referenceEntries | reference-only | p. 167 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:167-properties-of-power-stones` — Properties of Power Stones | referenceEntries | reference-only | p. 167–169 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:170-axe-of-unrelenting-fury` — Axe of Unrelenting Fury | referenceEntries | reference-only | p. 170 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:170-cursed-items` — Cursed Items | referenceEntries | reference-only | p. 170 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:170-the-cursed-quality` — The Cursed Quality | referenceEntries | reference-only | p. 170 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:171-boots-of-sudden-remorse` — Boots of Sudden Remorse | referenceEntries | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:171-bow-of-bloody-empathy` — Bow of Bloody Empathy | referenceEntries | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:171-brooch-of-unwanted-attraction` — Brooch of Unwanted Attraction | referenceEntries | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:171-dagger-of-stolen-luck` — Dagger of Stolen Luck | referenceEntries | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:171-fellowship-sunderer` — Fellowship Sunderer | referenceEntries | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:171-flail-of-unsolicited-attention` — Flail of Unsolicited Attention | referenceEntries | reference-only | p. 171 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:172-knuckles-of-ignominy` — Knuckles of Ignominy | referenceEntries | reference-only | p. 172 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:172-mail-of-stolen-valour` — Mail of Stolen Valour | referenceEntries | reference-only | p. 172 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:172-pistol-of-involuntary-solitude` — Pistol of Involuntary Solitude | referenceEntries | reference-only | p. 172 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:172-sword-of-holding` — Sword of Holding | referenceEntries | reference-only | p. 172 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:174-profile-incarnate-elemental-of-fire` — Incarnate Elemental Of Fire | referenceEntries | deferred | p. 174 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:175-profile-incarnate-elemental-of-death` — Incarnate Elemental Of Death | referenceEntries | deferred | p. 175 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:176-creature-trait-grim-rating` — Grim (Rating) | referenceEntries | reference-only | p. 176 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:176-profile-incarnate-elemental-of-beasts` — Incarnate Elemental Of Beasts | referenceEntries | deferred | p. 176 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:179-fenbeasts` — Fenbeasts | referenceEntries | reference-only | p. 179 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:179-profile-fenbeast` — Fenbeast | referenceEntries | deferred | p. 179 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:180-lores-and-familiars` — Lores And Familiars | referenceEntries | reference-only | p. 180 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:181-can-they-talk` — Can They Talk? | referenceEntries | reference-only | p. 181 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:181-familiar-personality` — Familiar Personality | referenceEntries | reference-only | p. 181 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:182-improving-familiars` — Improving Familiars | referenceEntries | reference-only | p. 182 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:182-profile-combat-familiar` — Combat Familiar | referenceEntries | deferred | p. 182 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:182-profile-power-familiar` — Power Familiar | referenceEntries | deferred | p. 182 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:182-profile-spell-familiar` — Spell Familiar | referenceEntries | deferred | p. 182 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:184-the-bond-between-spellcasters-and-familiars` — The Bond Between Spellcasters and Familiars | referenceEntries | reference-only | p. 184 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:184-the-challenges-of-playing-familiars` — The Challenges of Playing Familiars | referenceEntries | reference-only | p. 184 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:184-the-wind` — The Wind | referenceEntries | reference-only | p. 184 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:185-characteristics` — Characteristics | referenceEntries | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:185-combat-familiar` — Combat Familiar | referenceEntries | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:185-familiars-and-language` — Familiars and Language | referenceEntries | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:185-familiars-class-and-status` — Familiars, Class and Status | referenceEntries | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:185-power-familiars` — Power Familiars | referenceEntries | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:185-skills-and-talents` — Skills and Talents | referenceEntries | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:185-spell-familiar` — Spell Familiar | referenceEntries | reference-only | p. 185 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:186-new-talent-magical-assistant` — Magical Assistant | referenceEntries | reference-only | p. 186 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:186-new-talent-suffuse-with-wind` — Suffuse With (Wind) | referenceEntries | reference-only | p. 186 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:186-trappings` — Trappings | referenceEntries | reference-only | p. 186 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:187-advancing-familiars` — Advancing Familiars | referenceEntries | reference-only | p. 187 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:187-damage-and-healing-for-familiars` — Damage and Healing for Familiars | referenceEntries | reference-only | p. 187 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:187-familiars-and-conditions` — Familiars and Conditions | referenceEntries | reference-only | p. 187 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:187-familiars-and-corruption` — Familiars and Corruption | referenceEntries | reference-only | p. 187 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:187-familiars-and-disease` — Familiars and Disease | referenceEntries | reference-only | p. 187 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:188-spell-familiar` — Spell Familiar | referenceEntries | reference-only | p. 188 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:19-grimoires` — Grimoires | referenceEntries | reference-only | p. 19 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:19-memorising-spells` — Memorising Spells | referenceEntries | reference-only | p. 19 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:19-second-sight` — Second Sight | referenceEntries | reference-only | p. 19 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:190-environmental-saturation-effects` — Environmental Saturation Effects | referenceEntries | reference-only | p. 190 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:190-spellcasting-rules` — Spellcasting Rules | referenceEntries | reference-only | p. 190 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:191-chaotic-corruption-effects` — Chaotic Corruption Effects | referenceEntries | reference-only | p. 191 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:191-necromantic-corruption-effects` — Necromantic Corruption Effects | referenceEntries | reference-only | p. 191 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:192-environmental-rules` — Environmental Rules | referenceEntries | reference-only | p. 192 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:192-spellcasting-rules` — Spellcasting Rules | referenceEntries | reference-only | p. 192 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:193-natural-and-planned-leylines` — Natural and Planned Leylines | referenceEntries | reference-only | p. 193 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:194-amplification` — Amplification | referenceEntries | reference-only | p. 194 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:194-dampening` — Dampening | referenceEntries | reference-only | p. 194 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:194-refraction` — Refraction | referenceEntries | reference-only | p. 194 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:195-ogham-circles` — Ogham Circles | referenceEntries | reference-only | p. 195 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:197-corruption-of-leylines-and-waystones` — Corruption of Leylines and Waystones | referenceEntries | reference-only | p. 197 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:197-leyline-junctions` — Leyline Junctions | referenceEntries | reference-only | p. 197 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:198-corruption-of-nexuses-and-fulcrums` — Corruption of Nexuses and Fulcrums | referenceEntries | reference-only | p. 198 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:198-saturated-junctions` — Saturated Junctions | referenceEntries | reference-only | p. 198 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:198-warp-rifts` — Warp Rifts | referenceEntries | reference-only | p. 198 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:199-summary-of-arcane-phenomena` — summary of arcane phenomena | referenceEntries | reference-only | p. 199 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:20-anatomy-of-a-spell` — Anatomy Of A Spell | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:20-casting-test` — Casting Test | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:20-critical-casting` — Critical Casting | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:20-duration` — Duration | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:20-fumbled-casting` — Fumbled Casting | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:20-magic-missiles` — Magic Missiles | referenceEntries | reference-only | p. 20 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:20-random-vortices` — Random Vortices | referenceEntries | reference-only | p. 20–21 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:21-advantage-and-magic` — Advantage and Magic | referenceEntries | reference-only | p. 21 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:21-ingredients` — Ingredients | referenceEntries | reference-only | p. 21 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:21-spellcasting-limitations` — Spellcasting Limitations | referenceEntries | reference-only | p. 21 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:21-touch-spells-in-combat` — Touch Spells in Combat | referenceEntries | reference-only | p. 21 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:21-vortex-movement-table` — Vortex Movement Table | referenceEntries | reference-only | p. 21 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:210-profile-egrimm-van-horstmann` — Egrimm Van Horstmann | referenceEntries | deferred | p. 210 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:213-profile-library-disc-of-tzeentch` — Library Disc Of Tzeentch | referenceEntries | deferred | p. 213 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:213-profile-ptarix-the-one-who-writes` — P’Tarix – The One Who Writes | referenceEntries | deferred | p. 213 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:213-profile-xiratp-the-one-who-reads` — Xirat’P – The One Who Reads | referenceEntries | deferred | p. 213 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:216-profile-mona-mimn-fimir-matriarch` — Mòna Mimn — Fimir Matriarch | referenceEntries | deferred | p. 216 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:217-a-bite-of-midges` — A Bite of Midges | referenceEntries | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:217-bale-eye` — Bale Eye | referenceEntries | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:217-despondent-slough` — Despondent Slough | referenceEntries | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:217-inculcate-mizzle` — Inculcate Mizzle | referenceEntries | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:217-mystic-mist` — Mystic Mist | referenceEntries | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:217-o-mere-be-more` — O Mere Be More | referenceEntries | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:217-turned-around` — Turned Around | referenceEntries | reference-only | p. 217 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:218-skin-of-bone-and-bark` — Skin Of Bone And Bark | referenceEntries | reference-only | p. 218 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:22-channelling-test` — Channelling Test | referenceEntries | reference-only | p. 22 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:22-critical-channelling` — Critical Channelling | referenceEntries | reference-only | p. 22 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:22-fumbled-channelling` — Fumbled Channelling | referenceEntries | reference-only | p. 22 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:22-interruptions` — Interruptions | referenceEntries | reference-only | p. 22 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:22-malignant-influences` — Malignant Influences | referenceEntries | reference-only | p. 22 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:22-repelling-the-winds` — Repelling the Winds | referenceEntries | reference-only | p. 22 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:22-warpstone` — Warpstone | referenceEntries | reference-only | p. 22 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:23-dispelling` — Dispelling | referenceEntries | reference-only | p. 23 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:23-dispelling-persistent-spells` — Dispelling Persistent Spells | referenceEntries | reference-only | p. 23 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:23-multiple-arcane-lores` — Multiple Arcane Lores | referenceEntries | reference-only | p. 23 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:23-overcast-table` — Overcast Table | referenceEntries | reference-only | p. 23 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:23-overcasting` — Overcasting | referenceEntries | reference-only | p. 23 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:24-minor-miscast-table` — Minor Miscast Table | referenceEntries | reference-only | p. 24 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:25-major-miscast-table` — Major Miscast Table | referenceEntries | reference-only | p. 25 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:26-new-arcane-spells` — New Arcane Spells | referenceEntries | reference-only | p. 26 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:27-anatomy-of-a-ritual` — Anatomy Of A Ritual | referenceEntries | reference-only | p. 27 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:27-grimoires-and-rituals` — Grimoires and Rituals | referenceEntries | reference-only | p. 27 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:27-rituals` — Rituals | referenceEntries | reference-only | p. 27 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:27-silence` — Silence | referenceEntries | reference-only | p. 27 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:29-controlling-elementals` — Controlling Elementals | referenceEntries | reference-only | p. 29 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:29-the-bloody-hidesman` — the Bloody Hidesman | referenceEntries | reference-only | p. 29 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:30-construct` — Construct | referenceEntries | deferred | p. 30 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:30-construct-traits` — Construct Traits | referenceEntries | reference-only | p. 30 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:31-create-familiar` — Create Familiar | referenceEntries | reference-only | p. 31 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:31-minor-elementals` — Minor Elementals | referenceEntries | reference-only | p. 31 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:34-brew-potion` — Brew Potion | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:34-gather-ingredients` — Gather Ingredients | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:34-improve-familiar` — Improve Familiar | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:34-new-endeavours` — New Endeavours | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:34-perform-ritual` — Perform Ritual | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:35-10-starting-skills` — 10 Starting Skills? | referenceEntries | reference-only | p. 35 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:35-randomly-generating-new-careers` — Randomly Generating New Careers | referenceEntries | reference-only | p. 35 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:39-alchemists-as-spellcasters` — Alchemists As Spellcasters | referenceEntries | reference-only | p. 39 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:44-augury-int` — Augury (Int) | referenceEntries | reference-only | p. 44–45 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:45-augury-table` — Augury Table | referenceEntries | reference-only | p. 45 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:45-symbol-table` — Symbol Table | referenceEntries | reference-only | p. 45 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:46-augury-and-existing-careers` — Augury and Existing Careers | referenceEntries | reference-only | p. 46 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:46-augury-spells-overcast-table` — Augury Spells Overcast Table | referenceEntries | reference-only | p. 46 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:46-dreamwine` — Dreamwine | referenceEntries | reference-only | p. 46–47 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:46-intoxicants-and-augury` — Intoxicants and Augury | referenceEntries | reference-only | p. 46 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:46-portentous-spells` — Portentous Spells | referenceEntries | reference-only | p. 46 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:46-the-thaumodivinator` — The Thaumodivinator | referenceEntries | reference-only | p. 46 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:47-other-intoxicants` — Other Intoxicants | referenceEntries | reference-only | p. 47 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:47-psychometry-int` — Psychometry (Int) | referenceEntries | reference-only | p. 47–48 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:47-weirdroot` — Weirdroot | referenceEntries | reference-only | p. 47 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:48-psychometery-result-table` — Psychometery Result Table | referenceEntries | reference-only | p. 48 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:49-mundane-alchemy` — Mundane Alchemy | referenceEntries | reference-only | p. 49 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:49-what-trade-does-what-job` — What Trade Does What Job? | referenceEntries | reference-only | p. 49 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:50-caustic-or-corrosive-substances` — Caustic or Corrosive Substances | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:50-finding-a-customer` — Finding a Customer | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:50-isolating-basic-elements` — Isolating Basic Elements | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:50-magnetism` — Magnetism | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:50-optics` — Optics | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:50-producing-simple-compounds` — Producing Simple Compounds | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:51-alchemical-products` — Alchemical Products | referenceEntries | reference-only | p. 51 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:51-alchemical-products-2` — Alchemical Products | referenceEntries | reference-only | p. 51–52 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:52-al-kahest` — Al-kahest | referenceEntries | reference-only | p. 52 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:52-high-alchemy` — High Alchemy | referenceEntries | reference-only | p. 52 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:53-compass-of-meteoric-silver` — Compass of Meteoric Silver | referenceEntries | reference-only | p. 53 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:53-leonardos-alchemical-powder` — Leonardo’s Alchemical Powder | referenceEntries | reference-only | p. 53 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:53-prism-of-power` — Prism of Power | referenceEntries | reference-only | p. 53 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:61-profile-ashamira-dib-hierophant-silver-3` — Ashamira Dib Hierophant (Silver 3) | referenceEntries | deferred | p. 61 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:62-banishment` — Banishment | referenceEntries | reference-only | p. 62 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:62-blinding-light` — Blinding Light | referenceEntries | reference-only | p. 62 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:62-clarity-of-thought` — Clarity of Thought | referenceEntries | reference-only | p. 62 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:62-the-lore-of-light` — The Lore Of Light | referenceEntries | reference-only | p. 62 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:63-daemonbane` — Daemonbane | referenceEntries | reference-only | p. 63 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:63-healing-light` — Healing Light | referenceEntries | reference-only | p. 63 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:64-net-of-amyntok` — Net of Amyntok | referenceEntries | reference-only | p. 64 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:65-phas-protection` — Phâ’s Protection | referenceEntries | reference-only | p. 65 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:65-speed-of-thought` — Speed of Thought | referenceEntries | reference-only | p. 65 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:73-profile-balthasar-gelt-alchemist-lord-gold-4` — Balthasar Gelt Alchemist Lord (Gold 4) | referenceEntries | deferred | p. 73 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:74-crucible-of-chamon` — Crucible of Chamon | referenceEntries | reference-only | p. 74 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:74-enchant-weapon` — Enchant Weapon | referenceEntries | reference-only | p. 74 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:74-the-lore-of-metal` — The Lore Of Metal | referenceEntries | reference-only | p. 74 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:75-feather-of-lead` — Feather of Lead | referenceEntries | reference-only | p. 75 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:75-fools-gold` — Fool’s Gold | referenceEntries | reference-only | p. 75 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:75-forge-of-chamon` — Forge of Chamon | referenceEntries | reference-only | p. 75 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:75-glittering-robe` — Glittering Robe | referenceEntries | reference-only | p. 75 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:77-mutable-metal` — Mutable Metal | referenceEntries | reference-only | p. 77 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:77-transmutation-of-chamon` — Transmutation of Chamon | referenceEntries | reference-only | p. 77 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:85-profile-tochter-grunfeld-human-wizard-lord-gold-2` — Tochter Grunfeld Human Wizard Lord (Gold 2) | referenceEntries | deferred | p. 85 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:86-barkskin` — Barkskin | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:86-earthblood` — Earthblood | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:86-earthpool` — Earthpool | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:86-the-lore-of-life` — The Lore Of Life | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:87-fat-of-the-land` — Fat of the Land | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:87-forest-of-thorns` — Forest of Thorns | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:88-lie-of-the-land` — Lie of the Land | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:88-lifebloom` — Lifebloom | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:88-regenerate` — Regenerate | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:97-profile-raphael-julevno-grand-astromancer-gold-1` — Raphael Julevno Grand Astromancer (Gold 1) | referenceEntries | deferred | p. 97 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `winds-of-magic:reference:98-cerulean-shield` — Cerulean Shield | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:98-comet-of-casandora` — Comet of Casandora | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:98-the-lore-of-heavens` — The Lore Of Heavens | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:reference:99-fates-fickle-fingers` — Fate’s Fickle Fingers | referenceEntries | reference-only | p. 99 | Sourced book rule reference; no live-play automation. |
| `winds-of-magic:skill:psychometry` — Psychometry | skills | adapted | p. 47 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:bind-monstrous-beast` — Bind Monstrous Beast | spells | adapted | p. 28 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:carve-ogham-stone` — Carve Ogham Stone | spells | adapted | p. 28 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:conjuration-of-jack-o-cinders` — Conjuration of Jack o’ Cinders | spells | adapted | p. 30 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:conjuration-of-the-bloody-hidesman` — Conjuration of the Bloody Hidesman | spells | adapted | p. 29 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:conjuration-of-the-incarnate-elemental-of-death` — Conjuration of the Incarnate Elemental of Death | spells | adapted | p. 29 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:corrupt-waystone` — Corrupt Waystone | spells | adapted | p. 30 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:create-construct` — Create Construct | spells | adapted | p. 30 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:create-familiar` — Create Familiar | spells | adapted | p. 31 | Permanent Resilience expenditure converted to maximum Fortune (core Appendix I). |
| `winds-of-magic:ritual:create-waystone-property` — Create Waystone Property | spells | adapted | p. 32 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:imbue-staff` — Imbue Staff | spells | adapted | p. 32 | Resolve expenditure converted to Fortune (core Appendix I). |
| `winds-of-magic:ritual:invocate-daemon` — Invocate Daemon | spells | adapted | p. 32 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:materialise-the-living-swamp` — Materialise the Living Swamp | spells | adapted | p. 33 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:remove-curse` — Remove Curse | spells | adapted | p. 33 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:ritual:the-crossed-scythes` — The Crossed Scythes | spells | adapted | p. 33 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:acceptance-of-fate` — Acceptance of Fate | spells | adapted | p. 122 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:amber-trance` — Amber Trance | spells | adapted | p. 146 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:ashes-and-dust` — Ashes and Dust | spells | adapted | p. 122 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:assault-of-stone` — Assault of Stone | spells | adapted | p. 62 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:awakening-of-the-wood` — Awakening of the Wood | spells | adapted | p. 146 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:beast-unbroken` — Beast Unbroken | spells | adapted | p. 147 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:bewilder` — Bewilder | spells | adapted | p. 110 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:body-of-fire` — Body of Fire | spells | adapted | p. 134 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:boiling-blood` — Boiling Blood | spells | adapted | p. 134 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:burning-head` — Burning Head | spells | adapted | p. 134 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:captivating-flame` — Captivating Flame | spells | adapted | p. 134 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:choleric` — Choleric | spells | adapted | p. 135 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:crevasse` — Crevasse | spells | adapted | p. 62 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:curse-of-anraheir` — Curse of Anraheir | spells | adapted | p. 147 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:dance-of-despair` — Dance of Despair | spells | adapted | p. 110 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:deaths-release` — Death’s Release | spells | adapted | p. 123 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:decipher-curse` — Decipher Curse | spells | adapted | p. 26 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:divination` — Divination | spells | adapted | p. 99 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:fate-of-bjuna` — Fate of Bjuna | spells | adapted | p. 123 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:gardeners-warcry` — Gardener’s Warcry | spells | adapted | p. 87 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:gilded-cage` — Gilded Cage | spells | adapted | p. 75 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:golden-touch` — Golden Touch | spells | adapted | p. 75 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:hands-of-karkora` — Hands of Karkora | spells | adapted | p. 64 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:illuminate-the-edifice` — Illuminate the Edifice | spells | adapted | p. 64 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:kindred-of-the-hearth` — Kindred of the Hearth | spells | adapted | p. 136 | Fourth Edition Advantage references converted to Momentum (core Appendix I). |
| `winds-of-magic:spell:mistral-from-the-stratosphere` — Mistral From the Stratosphere | spells | adapted | p. 100 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:pit-of-tarnus` — Pit of Tarnus | spells | adapted | p. 112 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:sanguine-swords` — Sanguine Swords | spells | adapted | p. 137 | Fourth Edition Advantage references converted to Momentum (core Appendix I). |
| `winds-of-magic:spell:spiral-stair` — Spiral Stair | spells | adapted | p. 89 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:taste-of-death` — Taste of Death | spells | adapted | p. 125 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:taste-of-fire` — Taste of Fire | spells | adapted | p. 137 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:telepathy` — Telepathy | spells | adapted | p. 125 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:tide-of-years` — Tide of Years | spells | adapted | p. 125 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:traitor-of-tarn` — Traitor of Tarn | spells | adapted | p. 113 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:vengeful-hood` — Vengeful Hood | spells | adapted | p. 149 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:wild-kin-of-zandox` — Wild Kin of Zandox | spells | adapted | p. 125 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). Fourth Edition Advantage references converted to Momentum (core Appendix I). |
| `winds-of-magic:spell:wood-shape` — Wood Shape | spells | adapted | p. 89 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `winds-of-magic:spell:ygethmors-flaming-blizzard` — Ygethmor’s Flaming Blizzard | spells | adapted | p. 137 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |

</details>

## Rough Nights & Hard Days

Pack `rough-nights` · version 1.0.2

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| background | 1 | 0 | 0 | 0 | 0 |
| cults | 1 | 2 | 0 | 0 | 0 |
| referenceEntries | 0 | 0 | 24 | 0 | 80 |
| species | 0 | 1 | 0 | 0 | 0 |
| tables | 1 | 1 | 0 | 0 | 0 |
| talents | 0 | 1 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Pub games, adventures and patron strictures tracking | deferred | Book-wide scope decision | NPCs and adventure rewards do not become starting profiles or grants. |
| Suffuse with Ulgu situational effects | reference-only | p. 88 | Talent selection is supported; Stealth substitution and nearby casting bonuses are descriptions for play. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `rough-nights:cult:evawn` — Evawn | cults | adapted | p. 90 | One printed Fourth Edition Miracle replaced with its revised Fifth Edition core equivalent. |
| `rough-nights:cult:mabyn` — Mabyn | cults | adapted | p. 90 | One printed Fourth Edition Miracle replaced with its revised Fifth Edition core equivalent. |
| `rough-nights:reference:17-profile-bruno-franke-judicial-champion-gold-3` — Bruno Franke – Judicial Champion (Gold 3) | referenceEntries | deferred | p. 17 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:17-profile-gustaf-rechtshandler-barrister-gold-1` — Gustaf Rechtshandler – Barrister (Gold 1) | referenceEntries | deferred | p. 17 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:17-profile-maria-ulrike-von-liebwitz-noble-lord-gold-7` — Maria-Ulrike Von Liebwitz – Noble Lord (Gold 7) | referenceEntries | deferred | p. 17 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:18-profile-bodyguards-and-men-at-arms-silver-3` — Bodyguards And Men-At-Arms (Silver 3) | referenceEntries | deferred | p. 18 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:18-profile-dominique-herveaux-assassin-gold-1` — Dominique Herveaux – Assassin (Gold 1) | referenceEntries | deferred | p. 18 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:18-profile-gunni-bart-and-hans-frederick-smugglers-brass-3` — Gunni, Bart, And Hans-Frederick – Smugglers (Brass 3) | referenceEntries | deferred | p. 18 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:18-profile-handmaids-and-servants-silver-3` — Handmaids And Servants (Silver 3) | referenceEntries | deferred | p. 18 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:19-profile-josef-aufwiegler-rabble-rouser-brass-3` — Josef Aufwiegler – Rabble Rouser (Brass 3) | referenceEntries | deferred | p. 19 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:19-profile-ursula-kopfgeld-master-bounty-hunter-silver-5` — Ursula Kopfgeld – Master Bounty Hunter (Silver 5) | referenceEntries | deferred | p. 19 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:20-profile-friedrich-von-pfeifraucher-magnate-gold-5` — Friedrich Von Pfeifraucher – Magnate (Gold 5) | referenceEntries | deferred | p. 20 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:20-profile-hanna-lastkahn-townswoman-silver-2` — Hanna Lastkahn – Townswoman (Silver 2) | referenceEntries | deferred | p. 20 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:20-profile-mho-larz-and-curls-thugs-brass-3` — Mho, Larz, And ‘Curls’ – Thugs (Brass 3) | referenceEntries | deferred | p. 20 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:20-profile-thomas-prahmhandler-master-merchant-gold-1` — Thomas Prahmhandler – Master Merchant (Gold 1) | referenceEntries | deferred | p. 20 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:21-profile-allrella-elphoise-and-helga-slaanesh-cultists-silver-1` — Allrella, Elphoise, And Helga – Slaanesh Cultists (Silver 1) | referenceEntries | deferred | p. 21 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:21-profile-boatmen-silver-2` — Boatmen (Silver 2) | referenceEntries | deferred | p. 21 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:21-profile-coachmen-silver-2` — Coachmen (Silver 2) | referenceEntries | deferred | p. 21 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:21-profile-glimbrin-oddsocks-master-thief-brass-5` — Glimbrin Oddsocks – Master Thief (Brass 5) | referenceEntries | deferred | p. 21 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:22-profile-hans-orf-townsman-silver-2` — Hans Orf – Townsman (Silver 2) | referenceEntries | deferred | p. 22 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:22-profile-mercinellin-seedling-thorncobble-xiii-hustler-brass-1` — Mercinellin ‘Seedling’ Thorncobble Xiii – Hustler (Brass 1) | referenceEntries | deferred | p. 22 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:22-profile-ol-bess-artisan-silver-1` — Ol’ Bess – Artisan (Silver 1) | referenceEntries | deferred | p. 22 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:22-profile-servants-cleaners-and-similar-menials-brass-3` — Servants, Cleaners, And Similar – Menials (Brass 3) | referenceEntries | deferred | p. 22 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:33-profile-imperial-viper` — Imperial Viper | referenceEntries | deferred | p. 33 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:33-profile-kappans-racketeers-thugs-brass-3` — Kappan’S Racketeers – Thugs (Brass 3) | referenceEntries | deferred | p. 33 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:33-profile-otto-von-dammenblatz-noble-lord-gold-7` — Otto Von Dammenblatz – Noble Lord (Gold 7) | referenceEntries | deferred | p. 33 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:34-profile-matthias-hubkind-witch-hunter-silver-3` — Matthias Hubkind – Witch Hunter (Silver 3) | referenceEntries | deferred | p. 34 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:34-profile-restless-ghost` — Restless Ghost | referenceEntries | deferred | p. 34 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:35-profile-8-watchmen-khorne-cultists-silver-1` — 8 Watchmen – Khorne Cultists (Silver 1) | referenceEntries | deferred | p. 35 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:35-profile-bloodletters` — Bloodletters | referenceEntries | deferred | p. 35 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:35-profile-magistrates-judges-gold-2` — Magistrates – Judges (Gold 2) | referenceEntries | deferred | p. 35 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:35-profile-petra-steinmetz-high-priestess-gold-1` — Petra Steinmetz – High Priestess (Gold 1) | referenceEntries | deferred | p. 35 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:48-profile-brecht-kavenner-slaanesh-cultist-and-barrister-gold-3` — Brecht Kavenner – Slaanesh Cultist And Barrister (Gold 3) | referenceEntries | deferred | p. 48 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:48-profile-emmanuelle-von-liebwitz-elector-countess-gold-15` — Emmanuelle Von Liebwitz – Elector Countess (Gold 15) | referenceEntries | deferred | p. 48 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:48-profile-noble-servants-gold-2` — Noble Servants (Gold 2) | referenceEntries | deferred | p. 48 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:49-profile-brocks-and-reiner-spies-silver-3` — Brocks And Reiner – Spies (Silver 3) | referenceEntries | deferred | p. 49 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:49-profile-musicians-silver-1` — Musicians (Silver 1) | referenceEntries | deferred | p. 49 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:49-profile-palace-guards-gold-2` — Palace Guards (Gold 2) | referenceEntries | deferred | p. 49 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:49-profile-performers-silver-1` — Performers (Silver 1) | referenceEntries | deferred | p. 49 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:49-profile-servants-silver-1` — Servants (Silver 1) | referenceEntries | deferred | p. 49 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:49-profile-stagehands-silver-1` — Stagehands (Silver 1) | referenceEntries | deferred | p. 49 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:50-profile-cannon-and-mortar-students-student-engineers-brass-4` — Cannon And Mortar Students – Student Engineers (Brass 4) | referenceEntries | deferred | p. 50 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:50-profile-edvard-lowenhertz-wyrd-brass-3` — Edvard Lowenhertz – Wyrd (Brass 3) | referenceEntries | deferred | p. 50 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:50-profile-edwina-lowenhertz-witch-brass-2` — Edwina Lowenhertz – Witch (Brass 2) | referenceEntries | deferred | p. 50 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:50-profile-erwin-pakker-professor-gold-1` — Erwin Pakker – Professor (Gold 1) | referenceEntries | deferred | p. 50 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:51-profile-assassins-silver-1` — Assassins (Silver 1) | referenceEntries | deferred | p. 51 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:51-profile-detlef-sierck-genius-gold-3` — Detlef Sierck – Genius (Gold 3) | referenceEntries | deferred | p. 51 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:52-profile-martyn-ruchen-chaos-cult-leader-and-chaos-sorcerer-silver-3` — Martyn Ruchen – Chaos Cult Leader And Chaos Sorcerer (Silver 3) | referenceEntries | deferred | p. 52 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:52-profile-nurgle-cultists` — Nurgle Cultists | referenceEntries | deferred | p. 52 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:52-reveal-the-inner-beauty` — Reveal the Inner Beauty | referenceEntries | reference-only | p. 52 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:53-profile-hubkinds-mob-brass-4` — Hubkind’S Mob (Brass 4) | referenceEntries | deferred | p. 53 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:53-profile-nulner-watchmen-silver-1` — Nulner Watchmen (Silver 1) | referenceEntries | deferred | p. 53 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:53-profile-operagoer-silver-2` — Operagoer (Silver 2) | referenceEntries | deferred | p. 53 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:53-profile-watch-sergeant-silver-1` — Watch Sergeant (Silver 1) | referenceEntries | deferred | p. 53 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:53-profile-young-noble-gold-1` — Young Noble (Gold 1) | referenceEntries | deferred | p. 53 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:64-profile-wilhelm-von-saponatheim-noble-lord-gold-7` — Wilhelm Von Saponatheim – Noble Lord (Gold 7) | referenceEntries | deferred | p. 64 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:65-profile-inta-dapesht` — Inta-Dapesht | referenceEntries | deferred | p. 65 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:65-profile-joachim-bitterfeld-artisan-silver-1` — Joachim Bitterfeld – Artisan (Silver 1) | referenceEntries | deferred | p. 65 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:65-profile-nastassia-von-saponatheim-scion-gold-1` — Nastassia Von Saponatheim – Scion (Gold 1) | referenceEntries | deferred | p. 65 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:66-profile-cultists-of-the-jade-sceptre-gold-2` — Cultists Of The Jade Sceptre (Gold 2) | referenceEntries | deferred | p. 66 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:66-profile-manfred-von-saponatheim-prisoner-brass-0` — Manfred Von Saponatheim – Prisoner (Brass 0) | referenceEntries | deferred | p. 66 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:67-profile-clothilde-telland-noble-gold-4` — Clothilde Telland – Noble (Gold 4) | referenceEntries | deferred | p. 67 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:67-profile-josef-von-angendorf-cat-burglar-gold-2` — Josef Von Angendorf – Cat Burglar (Gold 2) | referenceEntries | deferred | p. 67 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:67-profile-taggees-spies-gold-2` — Taggees – Spies (Gold 2) | referenceEntries | deferred | p. 67 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:80-profile-erich-von-holzenauer-noble-gold-2` — Erich Von Holzenauer – Noble (Gold 2) | referenceEntries | deferred | p. 80 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:80-profile-siegfried-von-saponatheim-noble-gold-2` — Siegfried Von Saponatheim – Noble (Gold 2) | referenceEntries | deferred | p. 80 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:81-profile-galina-hohengolfrid-noble-gold-2` — Galina Hohengolfrid – Noble (Gold 2) | referenceEntries | deferred | p. 81 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:81-profile-heinrich-von-bruner-magnate-gold-3` — Heinrich Von Bruner – Magnate (Gold 3) | referenceEntries | deferred | p. 81 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:81-profile-maximilian-aschaffenburg-scion-gold-1` — Maximilian Aschaffenburg – Scion (Gold 1) | referenceEntries | deferred | p. 81 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:81-profile-rickard-aschaffenberg-magnate-gold-3` — Rickard Aschaffenberg – Magnate (Gold 3) | referenceEntries | deferred | p. 81 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:82-profile-florian-pfeifraucher-noble-gold-2` — Florian Pfeifraucher – Noble (Gold 2) | referenceEntries | deferred | p. 82 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:82-profile-heinrich-von-falkenhayn-noble-gold-2` — Heinrich Von Falkenhayn – Noble (Gold 2) | referenceEntries | deferred | p. 82 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:82-profile-jean-luc-de-cadent-agent-gold-1` — Jean-Luc De Cadent – Agent (Gold 1) | referenceEntries | deferred | p. 82 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:83-profile-borgan-foambeard-guildmaster-gold-1` — Borgan Foambeard – Guildmaster (Gold 1) | referenceEntries | deferred | p. 83 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:83-profile-ernst-maler-burgomeister-gold-1` — Ernst Maler – Burgomeister (Gold 1) | referenceEntries | deferred | p. 83 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:83-profile-otto-krupp-guildmaster-gold-1` — Otto Krupp – Guildmaster (Gold 1) | referenceEntries | deferred | p. 83 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:84-profile-gunther-emming-high-priest-gold-1` — Gunther Emming – High Priest (Gold 1) | referenceEntries | deferred | p. 84 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:84-profile-heinrich-gutenberg-high-priest-gold-1` — Heinrich Gutenberg – High Priest (Gold 1) | referenceEntries | deferred | p. 84 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:84-profile-lorith-silverleaf-envoy-silver-4` — Lorith Silverleaf – Envoy (Silver 4) | referenceEntries | deferred | p. 84 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:85-profile-andrea-pfeffer-officer-gold-2` — Andrea Pfeffer – Officer (Gold 2) | referenceEntries | deferred | p. 85 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:85-profile-celestine-hoch-priestess-silver-1` — Celestine Hoch – Priestess (Silver 1) | referenceEntries | deferred | p. 85 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:85-profile-erwin-blucher-officer-gold-2` — Erwin Blucher – Officer (Gold 2) | referenceEntries | deferred | p. 85 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:85-profile-jendrik-von-dabernick-officer-gold-1` — Jendrik Von Dabernick – Officer (Gold 1) | referenceEntries | deferred | p. 85 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `rough-nights:reference:87-random-class-and-career-table` — Random Class And Career Table | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:87-random-species-table` — Random Species Table | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:88-attributes-table` — Attributes Table | referenceEntries | reference-only | p. 88 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:90-strictures` — Evawn — Strictures | referenceEntries | reference-only | p. 90 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:90-strictures-2` — Mabyn — Strictures | referenceEntries | reference-only | p. 90 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:90-strictures-3` — Ringil — Strictures | referenceEntries | reference-only | p. 90 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:91-al-zahr` — Al-Zahr | referenceEntries | reference-only | p. 91 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:91-alvatafl` — Alvatafl | referenceEntries | reference-only | p. 91 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:91-options-fast-pub-games` — Options: Fast Pub Games | referenceEntries | reference-only | p. 91 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:91-pub-games-critical-results` — Pub games — Critical results | referenceEntries | reference-only | p. 91 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:92-arm-wrestling` — Arm Wrestling | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:92-beast-among-the-tailors` — Beast Among The Tailors | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:92-bowls` — Bowls | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:93-bull-ring` — Bull Ring | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:93-cerevis` — Cerevis | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:94-darts` — Darts | referenceEntries | reference-only | p. 94 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:94-dominoes` — Dominoes | referenceEntries | reference-only | p. 94 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:94-dwile-flonking` — Dwile Flonking | referenceEntries | reference-only | p. 94 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:94-middenball` — Middenball | referenceEntries | reference-only | p. 94 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:95-muhlen` — Mühlen | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:95-pub-quizzes` — Pub Quizzes | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:95-scarlet-empress` — Scarlet Empress | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `rough-nights:reference:95-stones` — Stones | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `rough-nights:species:gnome` — Gnome | species | adapted | p. 88 | User-approved Fifth Edition starting Fate/Fortune, five Skills at +5 and separate Size instead of the old Size Talent. |
| `rough-nights:table:gnome-careers` — Gnome Careers | tables | adapted | p. 87 | Printed Bawd result uses the revised Fifth Edition Knave Career profile. |
| `rough-nights:talent:suffuse-with-ulgu` — Suffuse with Ulgu | talents | adapted | p. 88 | Fourth Edition per-rank bonus on the listed Tests omitted; printed limit and effects retained under the approved Fifth Edition adaptation. |

</details>

## Dwarf Player’s Guide

Pack `dwarf-guide` · version 1.0.2

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| armour | 2 | 0 | 5 | 0 | 0 |
| careerUpdates | 14 | 0 | 0 | 1 | 0 |
| careers | 6 | 4 | 0 | 0 | 0 |
| gear | 30 | 0 | 8 | 0 | 0 |
| origins | 0 | 11 | 0 | 0 | 0 |
| referenceEntries | 0 | 0 | 107 | 0 | 0 |
| runes | 63 | 8 | 0 | 0 | 0 |
| skills | 2 | 1 | 0 | 0 | 0 |
| tables | 11 | 0 | 0 | 0 | 0 |
| talents | 9 | 10 | 0 | 1 | 0 |
| weapons | 19 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Missing printed appearance table | unavailable | p. 42 | Referenced table is absent in supplied PDF; retain explained core suggestions. |
| Rune forging/activation, machinery crews and campaign grudges | deferred | Book-wide scope decision | Learning runes grants knowledge, not items; no campaign XP awards. |
| Longbeard starting resources | adapted | p. 50 | Approved −1 starting Fate/Fortune, minimum age 120, with warning. |
| Longbeard 0-Fate fallback | deferred | p. 50 | Old Resilience/Resolve fallback has no agreed conversion. |
| Outcast Engineer unspecialised Entertain | unavailable | p. 56 | Retain unavailable entry rather than inventing a specialisation. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `dwarf-guide:armour:gromril-bracers` — Gromril Bracers | armour | reference-only | p. 95 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `dwarf-guide:armour:gromril-breastplate` — Gromril Breastplate | armour | reference-only | p. 95 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `dwarf-guide:armour:gromril-helm` — Gromril Helm | armour | reference-only | p. 95 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `dwarf-guide:armour:gromril-open-helm` — Gromril Open Helm | armour | reference-only | p. 95 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `dwarf-guide:armour:gromril-plate-leggings` — Gromril Plate Leggings | armour | reference-only | p. 95 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `dwarf-guide:career:ironbreaker` — Ironbreaker | careers | adapted | p. 70 | Older Talent options replaced with Fifth Edition definitions: Striding Gait. |
| `dwarf-guide:career:karak-ranger` — Karak Ranger | careers | adapted | p. 72 | Older Talent options replaced with Fifth Edition definitions: Striding Gait. |
| `dwarf-guide:career:runescribe` — Runescribe | careers | adapted | p. 74 | Older Talent options replaced with Fifth Edition definitions: Public Speaker. |
| `dwarf-guide:career:thane` — Thane | careers | adapted | p. 78 | Older Talent options replaced with Fifth Edition definitions: Public Speaker. |
| `dwarf-guide:update:axefighter` — Axefighter | careerUpdates | unavailable | p. 61 | Unavailable: its Strength replacement duplicates Fifth Edition Soldier’s level-one Strength. User deferred this variant. |
| `dwarf-guide:gear:anvil-of-doom` — Anvil of Doom | gear | reference-only | p. 96 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `dwarf-guide:gear:gromril-bracers` — Gromril Bracers | gear | reference-only | p. 95 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `dwarf-guide:gear:gromril-breastplate` — Gromril Breastplate | gear | reference-only | p. 95 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `dwarf-guide:gear:gromril-helm` — Gromril Helm | gear | reference-only | p. 95 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `dwarf-guide:gear:gromril-open-helm` — Gromril Open Helm | gear | reference-only | p. 95 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `dwarf-guide:gear:gromril-plate-leggings` — Gromril Plate Leggings | gear | reference-only | p. 95 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `dwarf-guide:gear:oathstone` — Oathstone | gear | reference-only | p. 96 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `dwarf-guide:gear:shield-platform` — Shield Platform | gear | reference-only | p. 96 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `dwarf-guide:origin:barak-varr` — Barak Varr | origins | adapted | p. 48 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:origin:imperial` — Imperial | origins | adapted | p. 50 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:origin:karak-azul` — Karak Azul | origins | adapted | p. 48 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:origin:karak-eight-peaks` — Karak Eight Peaks | origins | adapted | p. 49 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:origin:karak-hirn-black-mountains` — Karak Hirn / Black Mountains | origins | adapted | p. 49 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:origin:karak-izor-vaults` — Karak Izor / Vaults | origins | adapted | p. 49 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:origin:karak-kadrin` — Karak Kadrin | origins | adapted | p. 49 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:origin:karak-norn-grey-mountains` — Karak Norn / Grey Mountains | origins | adapted | p. 49 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:origin:karaz-a-karak` — Karaz-a-Karak | origins | adapted | p. 48 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:origin:norse` — Norse | origins | adapted | p. 50 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:origin:zhufbar` — Zhufbar | origins | adapted | p. 49 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `dwarf-guide:reference:100-bombard` — Bombard | referenceEntries | reference-only | p. 100 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:100-cannon` — Cannon | referenceEntries | reference-only | p. 100 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:100-mortar` — Mortar | referenceEntries | reference-only | p. 100 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:100-swivel-gun` — Swivel Gun | referenceEntries | reference-only | p. 100 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:101-volley-gun` — Volley Gun | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:102-weapon-installations` — Weapon Installations | referenceEntries | reference-only | p. 102 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:103-installed-weapons` — Installed Weapons | referenceEntries | reference-only | p. 103 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:104-aerial-bombs` — Aerial Bombs | referenceEntries | reference-only | p. 104 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:104-breaker-cannon` — Breaker Cannon | referenceEntries | reference-only | p. 104 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:104-brimstone-gun` — Brimstone Gun | referenceEntries | reference-only | p. 104 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:104-steam-gun` — Steam Gun | referenceEntries | reference-only | p. 104 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:104-tempest-cannon` — Tempest Cannon | referenceEntries | reference-only | p. 104 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:104-thunder-cannon` — Thunder Cannon | referenceEntries | reference-only | p. 104 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:105-steamcraft` — Steamcraft | referenceEntries | reference-only | p. 105 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:105-vehicle-rules` — Vehicle Rules | referenceEntries | reference-only | p. 105 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:106-earth-borer-mining-drill` — Earth Borer Mining Drill | referenceEntries | reference-only | p. 106 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:108-skycraft` — Skycraft | referenceEntries | reference-only | p. 108 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:108-whats-mine-is-mine` — What’S Mine Is Mine | referenceEntries | reference-only | p. 108 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:109-gyrocopter-and-variants` — Gyrocopter and variants | referenceEntries | reference-only | p. 109–110 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:110-aerial-bombs` — Aerial Bombs | referenceEntries | reference-only | p. 110 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:110-war-balloon` — War Balloon | referenceEntries | reference-only | p. 110 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:111-watercraft` — Watercraft | referenceEntries | reference-only | p. 111–112 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:112-watercraft` — Watercraft | referenceEntries | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:113-gunboat` — Gunboat | referenceEntries | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:113-steam-barge` — Steam Barge | referenceEntries | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:114-dreadnought` — Dreadnought | referenceEntries | reference-only | p. 114–115 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:114-ironclad` — Ironclad | referenceEntries | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:114-monitor` — Monitor | referenceEntries | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:115-nautilus-submersible` — Nautilus Submersible | referenceEntries | reference-only | p. 115 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:116-torpedo-2` — Torpedo | referenceEntries | reference-only | p. 116 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:116-torpedo-misfires` — Torpedo Misfires | referenceEntries | reference-only | p. 116 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:117-barrakul` — Barrakul | referenceEntries | reference-only | p. 117 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:118-ghal-maraz` — Ghal Maraz | referenceEntries | reference-only | p. 118 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:119-gnoldron` — Gnoldron | referenceEntries | reference-only | p. 119 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:119-grimmaz` — Grimmaz | referenceEntries | reference-only | p. 119–120 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:125-crafting-runes` — Crafting Runes | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:125-rule-of-three` — Rule of Three | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:126-flawed-creations` — Flawed Creations | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:126-rule-of-form` — Rule of Form | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:126-runic-flaws-table` — Runic Flaws Table | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:127-list-of-runes` — List Of Runes | referenceEntries | reference-only | p. 127 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:128-armour-runes` — Armour Runes | referenceEntries | reference-only | p. 128 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:130-protection-runes` — Protection Runes | referenceEntries | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:132-doom-runes` — Doom Runes | referenceEntries | reference-only | p. 132 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:137-cult-runic-magic` — Grungni — Cult Runic Magic | referenceEntries | reference-only | p. 137 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:137-strictures` — Grungni — Strictures | referenceEntries | reference-only | p. 137 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:138-cult-runic-magic` — Valaya — Cult Runic Magic | referenceEntries | reference-only | p. 138 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:138-strictures` — Valaya — Strictures | referenceEntries | reference-only | p. 138 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:139-cult-runic-magic` — Grimnir — Cult Runic Magic | referenceEntries | reference-only | p. 139 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:139-strictures` — Grimnir — Strictures | referenceEntries | reference-only | p. 139 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:140-cult-runic-magic` — Gazul / Smednir — Cult Runic Magic | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:140-strictures` — Gazul / Smednir — Strictures | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:140-strictures-2` — Gazul / Smednir — Strictures | referenceEntries | reference-only | p. 140 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:141-cult-runic-magic` — Thungni / Morgrim — Cult Runic Magic | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:141-cult-runic-magic-2` — Thungni / Morgrim — Cult Runic Magic | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:141-strictures` — Thungni / Morgrim — Strictures | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:141-strictures-2` — Thungni / Morgrim — Strictures | referenceEntries | reference-only | p. 141 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:142-strictures` — Ancestors — Strictures | referenceEntries | reference-only | p. 142 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:39-forenames` — Forenames | referenceEntries | reference-only | p. 39–40 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:41-place-of-origin` — Place of Origin | referenceEntries | reference-only | p. 41 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:42-physical-attributes` — Physical Attributes | referenceEntries | reference-only | p. 42 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:51-dwarf-random-class-and-career-table` — Dwarf Random Class And Career Table | referenceEntries | reference-only | p. 51 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:52-dwarf-random-class-and-career-table` — Dwarf Random Class And Career Table | referenceEntries | reference-only | p. 52 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:54-dwarf-career-updates` — Dwarf Career Updates | referenceEntries | reference-only | p. 54 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:54-reading-new-careers` — Reading New Careers | referenceEntries | reference-only | p. 54 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:55-dwarf-rogues` — Dwarf Rogues | referenceEntries | reference-only | p. 55 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:55-dwarf-trappings` — Dwarf Trappings | referenceEntries | reference-only | p. 55 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:56-guild-engineer` — Guild Engineer | referenceEntries | reference-only | p. 56 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:56-outcast-engineer` — Outcast Engineer | referenceEntries | reference-only | p. 56 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:56-sky-pilot` — Sky Pilot | referenceEntries | reference-only | p. 56 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:57-grudgemaster` — Grudgemaster | referenceEntries | reference-only | p. 57 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:57-reckoner` — Reckoner | referenceEntries | reference-only | p. 57 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:57-stoneshaper` — Stoneshaper | referenceEntries | reference-only | p. 57 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:58-karak-miner` — Karak Miner | referenceEntries | reference-only | p. 58 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:58-lodefinder` — Lodefinder | referenceEntries | reference-only | p. 58 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:58-runebearer` — Runebearer | referenceEntries | reference-only | p. 58 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:59-slayers-do-not-wear-armour` — Slayers Do Not Wear Armour | referenceEntries | reference-only | p. 59 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:61-axefighter` — Axefighter | referenceEntries | reference-only | p. 61 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:61-quarreller` — Quarreller | referenceEntries | reference-only | p. 61 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:61-thunderer` — Thunderer | referenceEntries | reference-only | p. 61 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:80-new-skills-and-talents` — New Skills And Talents | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:84-blood-grudge` — Blood Grudge | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:84-grudges` — Grudges | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:84-recording-grudges` — Recording Grudges | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:85-interacting-with-perpetrators` — Interacting with Perpetrators | referenceEntries | reference-only | p. 85 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:85-new-grudges` — New Grudges | referenceEntries | reference-only | p. 85 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:85-resolving-grudges` — Resolving Grudges | referenceEntries | reference-only | p. 85 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:86-party-grudges` — Party Grudges | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:86-suggested-restitution-for-grudges` — Suggested Restitution For Grudges | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:86-unresolved-grudges` — Unresolved Grudges | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:91-gromril-armour` — Gromril armour | referenceEntries | reference-only | p. 91 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:91-gromril-weapons` — Gromril weapons | referenceEntries | reference-only | p. 91 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:92-crewed-rating` — Crewed (Rating) | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:92-salvo-rating` — Salvo (Rating) | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:92-spread-rating` — Spread (Rating) | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:93-dwarf-ammunition` — Dwarf Ammunition | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:93-melee-weapons` — Melee Weapons | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:94-ranged-weapons` — Ranged Weapons | referenceEntries | reference-only | p. 94 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:95-dwarf-armour` — Dwarf Armour | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:95-dwarf-armour-2` — Dwarf Armour | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:95-lighting-2` — Lighting | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:96-ancestral-heirlooms-2` — Ancestral Heirlooms | referenceEntries | reference-only | p. 96 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:96-tools-and-materials` — Tools And Materials | referenceEntries | reference-only | p. 96 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:98-dwarf-artillery` — Dwarf Artillery | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:98-misfires` — Misfires | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:98-misfires-2` — Misfires | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:reference:99-siege-weapons` — Siege Weapons | referenceEntries | reference-only | p. 99 | Sourced book rule reference; no live-play automation. |
| `dwarf-guide:rune:doom-rune-of-hearth-and-home` — Rune of Hearth and Home | runes | adapted | p. 132 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `dwarf-guide:rune:doom-rune-of-oath-and-steel` — Rune of Oath and Steel | runes | adapted | p. 132 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `dwarf-guide:rune:doom-rune-of-wrath-and-ruin` — Rune of Wrath and Ruin | runes | adapted | p. 132 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `dwarf-guide:rune:engineering-rune-of-the-stalwart` — Rune of the Stalwart | runes | adapted | p. 131 | Fourth Edition Advantage references converted to Momentum (core Appendix I). |
| `dwarf-guide:rune:protection-master-rune-of-expel-chaos` — Master Rune of Expel Chaos | runes | adapted | p. 131 | Fourth Edition Advantage references converted to Momentum (core Appendix I). |
| `dwarf-guide:rune:protection-master-rune-of-stromni-redbeard` — Master Rune of Stromni Redbeard | runes | adapted | p. 131 | Fourth Edition Advantage references converted to Momentum (core Appendix I). |
| `dwarf-guide:rune:protection-rune-of-battle` — Rune of Battle | runes | adapted | p. 130 | Fourth Edition Advantage references converted to Momentum (core Appendix I). |
| `dwarf-guide:rune:talisman-rune-of-luck` — Rune of Luck | runes | adapted | p. 129 | Permanent Resilience expenditure converted to maximum Fortune (core Appendix I). |
| `dwarf-guide:skill:sail-skycraft` — Sail (Skycraft) | skills | adapted | p. 80 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `dwarf-guide:talent:bludgeoner` — Bludgeoner | talents | adapted | p. 81 | Fourth Edition per-rank bonus on the listed Tests omitted; printed purchase limit and effects retained, by user-approved adaptation. |
| `dwarf-guide:talent:crew-commander` — Crew Commander | talents | unavailable | p. 81 | Crew Commander has no agreed Fifth Edition conversion; left unavailable by user decision. |
| `dwarf-guide:talent:demolisher` — Demolisher | talents | adapted | p. 81 | Fourth Edition per-rank bonus on the listed Tests omitted; printed purchase limit and effects retained, by user-approved adaptation. |
| `dwarf-guide:talent:entrenchment` — Entrenchment | talents | adapted | p. 81 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). Fourth Edition per-rank bonus on the listed Tests omitted; printed purchase limit and effects retained, by user-approved adaptation. |
| `dwarf-guide:talent:liquid-fortification` — Liquid Fortification | talents | adapted | p. 82 | Fourth Edition per-rank bonus on the listed Tests omitted; printed purchase limit and effects retained, by user-approved adaptation. |
| `dwarf-guide:talent:long-memory` — Long Memory | talents | adapted | p. 82 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). Fourth Edition per-rank bonus on the listed Tests omitted; printed purchase limit and effects retained, by user-approved adaptation. |
| `dwarf-guide:talent:magic-defiance` — Magic Defiance | talents | adapted | p. 82 | Fourth Edition per-rank bonus on the listed Tests omitted; printed purchase limit and effects retained, by user-approved adaptation. |
| `dwarf-guide:talent:master-rune-magic` — Master Rune Magic | talents | adapted | p. 82 | Fourth Edition per-rank bonus on the listed Tests omitted; printed purchase limit and effects retained, by user-approved adaptation. |
| `dwarf-guide:talent:maverick` — Maverick | talents | adapted | p. 82 | Fourth Edition per-rank bonus on the listed Tests omitted; printed purchase limit and effects retained, by user-approved adaptation. |
| `dwarf-guide:talent:rune-magic` — Rune Magic | talents | adapted | p. 82 | Fourth Edition per-rank bonus on the listed Tests omitted; printed purchase limit and effects retained, by user-approved adaptation. |
| `dwarf-guide:talent:underminer` — Underminer | talents | adapted | p. 83 | Fourth Edition per-rank bonus on the listed Tests omitted; printed purchase limit and effects retained, by user-approved adaptation. |

</details>

## High Elf Player’s Guide

Pack `high-elf` · version 1.0.3

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| armour | 1 | 0 | 10 | 0 | 0 |
| careers | 2 | 4 | 0 | 0 | 0 |
| gear | 8 | 3 | 12 | 0 | 0 |
| origins | 0 | 11 | 0 | 0 | 0 |
| referenceEntries | 0 | 0 | 81 | 0 | 0 |
| spells | 32 | 27 | 0 | 0 | 0 |
| tables | 0 | 5 | 0 | 0 | 0 |
| talents | 5 | 2 | 0 | 0 | 0 |
| techniques | 7 | 3 | 0 | 0 | 0 |
| weapons | 0 | 0 | 1 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Archmage fifth level and advanced priest branches | deferred | Book-wide scope decision | Only Mage levels 1–4 supported; user deferred higher/priest Career branches. |
| Blood of Aenarion Psychology and ritual discount | adapted | p. 51 | Core Psychology effects; approved ritual inclusion in Prodigy discount. |
| Yenlui changes, intrigue, crafting and ship/crew combat | deferred | Book-wide scope decision | Starting choices and references supported; ongoing play systems deferred. |
| Elder creation points and resource reductions | adapted | p. 53 | Approved Fifth Edition individual Skill points, caps, and Fate/Fortune interpretation. |
| Elven Arcane learning Lore assignment | adapted | p. 79 | Assign to latest acquired Colour Lore for core learning prices/counts. |
| Ithiltaen AP | reference-only | p. 34 | Printed AP is blank and remains unresolved. |
| Sea Elf Sailor option | adapted | p. 63 | Approved core-compatible Athletics/Basic/Intuition scheme. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `high-elf:armour:dragon-armour-bracers` — Dragon Armour Bracers | armour | reference-only | p. 34 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `high-elf:armour:dragon-armour-breastplate` — Dragon Armour Breastplate | armour | reference-only | p. 34 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `high-elf:armour:dragon-armour-helm` — Dragon Armour Helm | armour | reference-only | p. 34 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `high-elf:armour:dragon-armour-open-helm` — Dragon Armour Open Helm | armour | reference-only | p. 34 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `high-elf:armour:dragon-armour-plate-leggings` — Dragon Armour Plate Leggings | armour | reference-only | p. 34 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `high-elf:armour:ithilmar-bracers` — Ithilmar Bracers | armour | reference-only | p. 34 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `high-elf:armour:ithilmar-breastplate` — Ithilmar Breastplate | armour | reference-only | p. 34 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `high-elf:armour:ithilmar-helm` — Ithilmar Helm | armour | reference-only | p. 34 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `high-elf:armour:ithilmar-open-helm` — Ithilmar Open Helm | armour | reference-only | p. 34 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `high-elf:armour:ithilmar-plate-leggings` — Ithilmar Plate Leggings | armour | reference-only | p. 34 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |
| `high-elf:career:mage` — Mage | careers | adapted | p. 90 | Channelling training uses individual Fifth Edition points and the approved four-spell Career progression. |
| `high-elf:career:merchant-adventurer` — Merchant Adventurer | careers | adapted | p. 72 | Printed Animal Care/Sail specialisations use the single ungrouped Fifth Edition Skill total. |
| `high-elf:career:sea-guard` — Sea Guard | careers | adapted | p. 64 | Older Talent options replaced with Fifth Edition definitions: Striding Gait. Printed Animal Care/Sail specialisations use the single ungrouped Fifth Edition Skill total. |
| `high-elf:career:shadow-warrior` — Shadow Warrior | careers | adapted | p. 70 | Older Talent options replaced with Fifth Edition definitions: Striding Gait. |
| `high-elf:gear:aethyrolabe` — Aethyrolabe | gear | adapted | p. 37 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:gear:dragon-armour-bracers` — Dragon Armour Bracers | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:dragon-armour-breastplate` — Dragon Armour Breastplate | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:dragon-armour-helm` — Dragon Armour Helm | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:dragon-armour-open-helm` — Dragon Armour Open Helm | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:dragon-armour-plate-leggings` — Dragon Armour Plate Leggings | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:greatsword-of-hoeth` — Greatsword of Hoeth | gear | reference-only | p. 33 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:ithilmar-bracers` — Ithilmar Bracers | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:ithilmar-breastplate` — Ithilmar Breastplate | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:ithilmar-helm` — Ithilmar Helm | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:ithilmar-open-helm` — Ithilmar Open Helm | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:ithilmar-plate-leggings` — Ithilmar Plate Leggings | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:ithiltaen-helm` — Ithiltaen Helm | gear | reference-only | p. 34 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |
| `high-elf:gear:narinocha-wine-bottle` — Narinocha Wine, bottle | gear | adapted | p. 36 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:gear:wayshard` — Wayshard | gear | adapted | p. 37 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:origin:avelorn` — Avelorn | origins | adapted | p. 54 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:origin:caledor` — Caledor | origins | adapted | p. 54 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:origin:chrace` — Chrace | origins | adapted | p. 55 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:origin:cothique` — Cothique | origins | adapted | p. 55 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:origin:eataine` — Eataine | origins | adapted | p. 54 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:origin:ellyrion` — Ellyrion | origins | adapted | p. 54 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:origin:saphery` — Saphery | origins | adapted | p. 54 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:origin:sea-elf` — Sea Elf | origins | adapted | p. 57 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:origin:the-shadowlands` — The Shadowlands | origins | adapted | p. 55 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:origin:tiranoc` — Tiranoc | origins | adapted | p. 55 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:origin:yvresse` — Yvresse | origins | adapted | p. 55 | Printed regional starting allocations adapted to Fifth Edition five Skills at +5 and native-language rules. |
| `high-elf:reference:100-smith-priest-of-vaul-printed-career` — Smith-priest of Vaul — printed Career | referenceEntries | reference-only | p. 100 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:101-sacrifices` — Vaul — Sacrifices | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:101-talent-cadai-meditation` — Cadai Meditation | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:101-talent-mind-over-body` — Mind over Body | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:101-tenets-of-vaul` — Tenets Of Vaul | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:104-storm-weaver-printed-career` — Storm Weaver — printed Career | referenceEntries | reference-only | p. 104 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:105-sacrifices` — Mathlann — Sacrifices | referenceEntries | reference-only | p. 105 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:105-talent-eye-of-the-storm` — Eye of the Storm | referenceEntries | reference-only | p. 105 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:105-tenets-of-mathlann` — Tenets Of Mathlann | referenceEntries | reference-only | p. 105 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:108-loremaster-of-hoeth-printed-career` — Loremaster of Hoeth — printed Career | referenceEntries | reference-only | p. 108 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:109-new-talent-sanctuary-of-the-mind` — Sanctuary of the Mind | referenceEntries | reference-only | p. 109 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:109-sacrifices` — Hoeth — Sacrifices | referenceEntries | reference-only | p. 109 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:109-tenets-of-hoeth` — Tenets Of Hoeth | referenceEntries | reference-only | p. 109 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:112-beseeching-atharti` — Beseeching Atharti | referenceEntries | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:112-dark-deals-with-slaanesh` — Dark Deals with Slaanesh | referenceEntries | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:118-instigating-intrigue` — Instigating Intrigue | referenceEntries | reference-only | p. 118 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:118-intriguing-options` — Intriguing Options | referenceEntries | reference-only | p. 118 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:118-players-and-intrigues` — Players And Intrigues | referenceEntries | reference-only | p. 118 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:118-the-process-of-an-intrigue` — The Process of an Intrigue | referenceEntries | reference-only | p. 118 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:119-deciding-existing-agendas` — Deciding Existing Agendas | referenceEntries | reference-only | p. 119 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:119-step-1-decide-the-agenda` — Step 1 — Decide the Agenda | referenceEntries | reference-only | p. 119 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:119-step-2-the-complexity-of-intrigue` — Step 2 — The Complexity of Intrigue | referenceEntries | reference-only | p. 119 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:120-step-3-the-tactics-of-persuasion` — Step 3 — The Tactics of Persuasion | referenceEntries | reference-only | p. 120–121 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:121-common-forms-of-leverage` — Common Forms Of Leverage | referenceEntries | reference-only | p. 121–122 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:122-discovering-leverage-table` — Discovering Leverage Table | referenceEntries | reference-only | p. 122–123 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:123-intrigue-endeavour` — Intrigue Endeavour | referenceEntries | reference-only | p. 123 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:123-step-4-the-persuasion-test` — Step 4 — The Persuasion Test | referenceEntries | reference-only | p. 123 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:124-intrigue-development-table` — Intrigue Development Table | referenceEntries | reference-only | p. 124 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:124-target-suspects-table` — Target Suspects Table | referenceEntries | reference-only | p. 124 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:125-is-the-intrigue-concluded` — Is The Intrigue Concluded? | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:125-step-5-developing-the-intrigue` — Step 5 — Developing the Intrigue | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:33-weapons` — Weapons | referenceEntries | reference-only | p. 33 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:34-armour` — Armour | referenceEntries | reference-only | p. 34–35 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:36-herbs-and-elven-markets` — Herbs and Elven Markets | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:36-narinocha-wine` — Narinocha Wine | referenceEntries | reference-only | p. 36–37 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:37-enchanted-items` — Enchanted Items | referenceEntries | reference-only | p. 37 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:40-dragonblade-ram` — Dragonblade Ram | referenceEntries | reference-only | p. 40 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:40-high-elf-warships` — High Elf Warships | referenceEntries | reference-only | p. 40 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:42-high-elf-merchant-ships` — High Elf Merchant Ships | referenceEntries | reference-only | p. 42 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:46-factors-influencing-yenlui` — Factors Influencing Yenlui | referenceEntries | reference-only | p. 46 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:46-tracking-yenlui` — Tracking Yenlui | referenceEntries | reference-only | p. 46 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:47-effects-of-yenlui` — Effects Of Yenlui | referenceEntries | reference-only | p. 47 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:47-effects-of-yenlui-2` — Effects Of Yenlui | referenceEntries | reference-only | p. 47 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:47-effects-of-yenlui-3` — Effects Of Yenlui | referenceEntries | reference-only | p. 47 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:47-the-effects-of-yenlui` — The Effects of Yenlui | referenceEntries | reference-only | p. 47 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:48-benefits-of-obsession` — Benefits of Obsession | referenceEntries | reference-only | p. 48–49 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:48-example-obsessions` — Example Obsessions | referenceEntries | reference-only | p. 48 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:49-dreams` — Dreams | referenceEntries | reference-only | p. 49 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:49-negative-effects-of-obsession` — Negative Effects of Obsession | referenceEntries | reference-only | p. 49 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:50-example-dreams` — Example Dreams | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:51-the-madness-of-khaine` — The Madness Of Khaine | referenceEntries | reference-only | p. 51 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:52-centuries-of-experience` — Centuries of Experience | referenceEntries | reference-only | p. 52 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:52-elders-of-the-asur` — Elders Of The Asur | referenceEntries | reference-only | p. 52 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:53-experience-of-the-elders` — Experience Of The Elders | referenceEntries | reference-only | p. 53 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:57-species-skills-and-talents` — Species Skills and Talents | referenceEntries | reference-only | p. 57 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:58-high-elf-careers` — High Elf Careers | referenceEntries | reference-only | p. 58 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:59-random-class-and-career-table` — Random Class And Career Table | referenceEntries | reference-only | p. 59 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:60-cavalryman` — Cavalryman | referenceEntries | reference-only | p. 60 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:60-pit-fighter` — Pit Fighter | referenceEntries | reference-only | p. 60 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:60-soldier` — Soldier | referenceEntries | reference-only | p. 60 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:61-noble` — Noble | referenceEntries | reference-only | p. 61 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:62-artisan` — Artisan | referenceEntries | reference-only | p. 62 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:63-seaman` — Seaman | referenceEntries | reference-only | p. 63 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:68-sword-dancing-tests` — Sword-dancing Tests | referenceEntries | reference-only | p. 68 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:71-way-of-the-shadow` — Way of the Shadow | referenceEntries | reference-only | p. 71 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:78-training-of-a-mage` — Training of a Mage | referenceEntries | reference-only | p. 78 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:79-display-basic-proficiency` — Display Basic Proficiency | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:79-learn-the-lores` — Learn the Lores | referenceEntries | reference-only | p. 79 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:80-ready-at-last` — Ready at Last? | referenceEntries | reference-only | p. 80 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:81-elven-arcane-spells` — Elven Arcane Spells | referenceEntries | reference-only | p. 81 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:83-fifth-level-careers` — Fifth Level Careers | referenceEntries | reference-only | p. 83 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:83-skill-channelling-qhaysh-wp-advanced-unique` — Channelling (Qhaysh) (WP) advanced, unique | referenceEntries | reference-only | p. 83 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:84-casting-high-magic` — Casting High Magic | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:84-magical-burnout` — Magical Burnout | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:84-runes-of-the-cadai` — Runes Of The Cadai | referenceEntries | reference-only | p. 84 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:85-high-magic-questions-and-answers` — High Magic Questions And Answers | referenceEntries | reference-only | p. 85 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:86-the-lore-of-high-magic` — The Lore Of High Magic | referenceEntries | reference-only | p. 86 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:90-mage-printed-career` — Mage — printed Career | referenceEntries | reference-only | p. 90 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:99-priest-careers` — Priest Careers | referenceEntries | reference-only | p. 99 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:99-sacrifices` — Elf priests — Sacrifices | referenceEntries | reference-only | p. 99 | Sourced book rule reference; no live-play automation. |
| `high-elf:reference:99-tenets` — Tenets | referenceEntries | reference-only | p. 99 | Sourced book rule reference; no live-play automation. |
| `high-elf:spell:apotheosis` — Apotheosis | spells | adapted | p. 86 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:arcane-insight` — Arcane Insight | spells | adapted | p. 110 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:arcane-unforging` — Arcane Unforging | spells | adapted | p. 86 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:calm` — Calm | spells | adapted | p. 80 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:cloak-of-mathlann` — Cloak of Mathlann | spells | adapted | p. 107 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:crucible-of-light` — Crucible of Light | spells | adapted | p. 110 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:curse-of-arrow-attraction` — Curse of Arrow Attraction | spells | adapted | p. 86 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:divination-of-stones` — Divination of Stones | spells | adapted | p. 103 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:drain-magic` — Drain Magic | spells | adapted | p. 87 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:enchant-plant` — Enchant Plant | spells | adapted | p. 81 | Assigned to the latest acquired Colour Lore for Fifth Edition prices and training counts. |
| `high-elf:spell:fiery-convocation` — Fiery Convocation | spells | adapted | p. 87 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:glamour-of-teclis` — Glamour of Teclis | spells | adapted | p. 88 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:greater-banishment` — Greater Banishment | spells | adapted | p. 88 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:lesser-banishment` — Lesser Banishment | spells | adapted | p. 81 | Assigned to the latest acquired Colour Lore for Fifth Edition prices and training counts. |
| `high-elf:spell:magic-alarm` — Magic Alarm | spells | adapted | p. 82 | Assigned to the latest acquired Colour Lore for Fifth Edition prices and training counts. |
| `high-elf:spell:masking-the-mind` — Masking the Mind | spells | adapted | p. 82 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). Assigned to the latest acquired Colour Lore for Fifth Edition prices and training counts. |
| `high-elf:spell:mistress-of-the-deep` — Mistress of the Deep | spells | adapted | p. 107 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:mnemonic-control` — Mnemonic Control | spells | adapted | p. 110 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:psychic-sending` — Psychic Sending | spells | adapted | p. 111 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:purify-body` — Purify Body | spells | adapted | p. 82 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). Assigned to the latest acquired Colour Lore for Fifth Edition prices and training counts. |
| `high-elf:spell:sacred-wards` — Sacred Wards | spells | adapted | p. 111 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:speak-with-animal` — Speak with Animal | spells | adapted | p. 82 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). Assigned to the latest acquired Colour Lore for Fifth Edition prices and training counts. |
| `high-elf:spell:tempest` — Tempest | spells | adapted | p. 89 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:the-primary-words` — The Primary Words | spells | adapted | p. 111 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:voice-of-iron` — Voice of Iron | spells | adapted | p. 82 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). Assigned to the latest acquired Colour Lore for Fifth Edition prices and training counts. |
| `high-elf:spell:walk-between-worlds` — Walk between Worlds | spells | adapted | p. 89 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:spell:zone-of-comfort` — Zone of Comfort | spells | adapted | p. 82 | Assigned to the latest acquired Colour Lore for Fifth Edition prices and training counts. |
| `high-elf:table:avelorn` — High Elf Avelorn Careers | tables | adapted | p. 59 | Printed Bawd result uses the revised Fifth Edition Knave Career profile. |
| `high-elf:table:inner` — High Elf Inner Kingdoms Careers | tables | adapted | p. 59 | Printed Bawd result uses the revised Fifth Edition Knave Career profile. |
| `high-elf:table:nagarythe` — High Elf Nagarythe Careers | tables | adapted | p. 59 | Printed Bawd result uses the revised Fifth Edition Knave Career profile. |
| `high-elf:table:outer` — High Elf Outer Kingdoms Careers | tables | adapted | p. 59 | Printed Bawd result uses the revised Fifth Edition Knave Career profile. |
| `high-elf:table:sea-elf` — High Elf Sea Elf Careers | tables | adapted | p. 59 | Printed Bawd result uses the revised Fifth Edition Knave Career profile. |
| `high-elf:talent:blood-of-aenarion` — Blood of Aenarion | talents | adapted | p. 51 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:talent:high-magic` — High Magic | talents | adapted | p. 83 | User-approved one-purchase limit; the printed rank-based Talent gives no maximum. |
| `high-elf:technique:final-stroke-of-the-master` — Final Stroke of the Master | techniques | adapted | p. 69 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:technique:path-of-the-hawk` — Path of the Hawk | techniques | adapted | p. 69 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:technique:shadows-of-loec` — Shadows of Loec | techniques | adapted | p. 69 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `high-elf:weapon:greatsword-of-hoeth` — Greatsword of Hoeth | weapons | reference-only | p. 33 | Matching equipment is reference-only, not an ordinary shop purchase. Granted equipment still uses its printed profile. |

</details>

## Blood and Bramble

Pack `blood-bramble` · version 1.0.2

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| gear | 1 | 0 | 0 | 0 | 0 |
| referenceEntries | 0 | 0 | 2 | 0 | 6 |
| spells | 14 | 10 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Foraging, ingredient consumption, pacts/summons and adventures | deferred | Book-wide scope decision | No live effects, companions or NPC Career profiles are granted. |
| Hedgecraft ingredient quantity/weight | reference-only | p. 6 | 5-penny purchase supported, but supplied amount and weight are unspecified. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `blood-bramble:reference:11-bruck-who-babbles` — Brück Who Babbles | referenceEntries | deferred | p. 11 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `blood-bramble:reference:11-morock-the-bonetaker` — Morock the Bonetaker | referenceEntries | deferred | p. 11 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `blood-bramble:reference:11-the-shrike-of-unterdell` — The Shrike of Unterdell | referenceEntries | deferred | p. 11 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `blood-bramble:reference:17-nameless-summons-table` — Nameless Summons Table | referenceEntries | reference-only | p. 17 | Sourced book rule reference; no live-play automation. |
| `blood-bramble:reference:19-profile-old-mar-of-deisdorf-hedge-master-brass-3` — Old Mar Of Deisdorf Hedge Master (Brass 3) | referenceEntries | deferred | p. 19 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `blood-bramble:reference:20-profile-toll-jagerfund-witch-hunter-silver-3` — Toll Jagerfund Witch Hunter (Silver 3) | referenceEntries | deferred | p. 20 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `blood-bramble:reference:21-profile-marius-childers-witch-former-merchant-silver-3` — Marius Childers Witch, Former Merchant (Silver 3) | referenceEntries | deferred | p. 21 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `blood-bramble:reference:6-the-lore-of-hedgecraft` — The Lore of Hedgecraft | referenceEntries | reference-only | p. 6 | Sourced book rule reference; no live-play automation. |
| `blood-bramble:spell:bonesnapper` — Bonesnapper | spells | adapted | p. 12 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `blood-bramble:spell:congeal` — Congeal | spells | adapted | p. 13 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `blood-bramble:spell:curse-of-the-treacherous-tongue` — Curse of the Treacherous Tongue | spells | adapted | p. 13 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `blood-bramble:spell:fatethief` — Fatethief | spells | adapted | p. 13 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `blood-bramble:spell:fetterfetch` — Fetterfetch | spells | adapted | p. 7 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `blood-bramble:spell:geistbane` — Geistbane | spells | adapted | p. 8 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `blood-bramble:spell:mirrored-abyss` — Mirrored Abyss | spells | adapted | p. 14 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `blood-bramble:spell:nameless-summons` — Nameless Summons | spells | adapted | p. 17 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `blood-bramble:spell:outcasts-curse` — Outcast’s Curse | spells | adapted | p. 14 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `blood-bramble:spell:painjar` — Painjar | spells | adapted | p. 16 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |

</details>

## Deft Steps, Light Fingers

Pack `deft-steps` · version 1.0.4

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 1 | 8 | 0 | 0 | 0 |
| cults | 0 | 1 | 0 | 0 | 0 |
| gear | 11 | 4 | 0 | 0 | 0 |
| referenceEntries | 0 | 0 | 146 | 0 | 22 |
| spells | 27 | 5 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Campaign procedures and ongoing play | deferred | p. 15 | Ranald’s Gamble, contacts/organisations, crime/fraud, patrols/bounties, pathfinding/camping, hunting and ongoing training remain outside creation. |
| NPC/animal profiles and hunting training | deferred | p. 34–134 | Supplement NPC integration is deferred: the fresh GM workshop supports the Fifth Edition core only. Animal shop entries remain PC acquisitions; earlier NPC decisions are not active. |
| Ranald aspect Miracle access | adapted | p. 13 | Four Careers retain separate printed Miracle lists with approved core Invoke/Miracle equivalents. |
| Tool naming mismatches | implemented | p. 32 | Thin Jimmy/Steel Mummit and Telescopic Pole/Stick use paired table prices and descriptions. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `deft-steps:career:gambler-priest` — Gambler-Priest | careers | adapted | p. 16 | Reviewed Fifth Edition changes: Diceman → Dicer; Invoke (The Gamester) → Invoke (Ranald); retains the Career-specific printed Miracle list. Printed older Miracles use reviewed core equivalents: Rich Man, Poor Man, Beggar Man, Thief → Trickster’s Glamour, Stay Lucky → Cheat the Odds. |
| `deft-steps:career:gamekeeper` — Gamekeeper | careers | adapted | p. 138 | Reviewed Fifth Edition changes: Strider (Any) → Striding Gait (Any). |
| `deft-steps:career:liberator-priest` — Liberator-Priest | careers | adapted | p. 22 | Reviewed Fifth Edition changes: Impassioned Zeal requires an explicit Cause; Invoke (The Protector) → Invoke (Ranald); retains the Career-specific printed Miracle list; Level-two Public Speaking moves from Skills to the Public Speaker Talent options; Public Speaking → Public Speaker. Printed older Miracles use reviewed core equivalents: Rich Man, Poor Man, Beggar Man, Thief → Trickster’s Glamour, Stay Lucky → Cheat the Odds, You Ain’t Seen Me Right? → You Saw Nothing. |
| `deft-steps:career:muleskinner` — Muleskinner | careers | adapted | p. 128 | Reviewed Fifth Edition changes: Strider (Any) → Striding Gait (Any); Trick-Riding → Trick Rider. |
| `deft-steps:career:poacher` — Poacher | careers | adapted | p. 140 | Reviewed Fifth Edition changes: Strider (Any) → Striding Gait (Any). |
| `deft-steps:career:ranger-priest-of-taal` — Ranger-Priest of Taal | careers | adapted | p. 86 | Reviewed Fifth Edition changes: Strider (Any) → Striding Gait (Any). |
| `deft-steps:career:thief-priest` — Thief-Priest | careers | adapted | p. 14 | Reviewed Fifth Edition changes: Invoke (The Night Prowler) → Invoke (Ranald); retains the Career-specific printed Miracle list. Printed older Miracles use reviewed core equivalents: Stay Lucky → Cheat the Odds, You Ain’t Seen Me Right? → You Saw Nothing. |
| `deft-steps:career:trickster-priest` — Trickster-Priest | careers | adapted | p. 20 | Reviewed Fifth Edition changes: Invoke (The Deceiver) → Invoke (Ranald); retains the Career-specific printed Miracle list; Printed Perform (Acting) uses Entertain (Acting), by user choice; Public Speaking → Public Speaker; Unspecified Art requires a chosen core specialisation; Unspecified Stealth requires a chosen core specialisation. Printed older Miracles use reviewed core equivalents: Rich Man, Poor Man, Beggar Man, Thief → Trickster’s Glamour, Stay Lucky → Cheat the Odds, You Ain’t Seen Me Right? → You Saw Nothing. |
| `deft-steps:cult:ranald` — Ranald | cults | adapted | p. 13 | User-approved core equivalents in aspect lists: Stay Lucky → Cheat the Odds; Rich Man, Poor Man, Beggar Man, Thief → Trickster’s Glamour; You Ain’t Seen Me Right? → You Saw Nothing. All aspects use Invoke (Ranald), with their separate printed access. |
| `deft-steps:gear:bag-of-tarrabeth-seed` — Bag of Tarrabeth Seed | gear | adapted | p. 32 | Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364). |
| `deft-steps:gear:caltrops-12` — Caltrops (12) | gear | adapted | p. 32 | Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364). |
| `deft-steps:gear:glass-cutter` — Glass Cutter | gear | adapted | p. 32 | Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364). |
| `deft-steps:gear:thin-jimmy` — Thin Jimmy | gear | adapted | p. 32 | Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364). |
| `deft-steps:reference:100-ambush` — Ambush | referenceEntries | reference-only | p. 100 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:100-outlaw-income-endeavour-complications` — Outlaw Income Endeavour Complications | referenceEntries | reference-only | p. 100 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:100-robbery` — Robbery | referenceEntries | reference-only | p. 100 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:100-the-income-endeavour` — The Income Endeavour | referenceEntries | reference-only | p. 100 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:101-forming-an-outlaw-band` — Forming an Outlaw Band | referenceEntries | reference-only | p. 101 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:102-detailing-outlaw-bands` — Detailing outlaw bands | referenceEntries | reference-only | p. 102 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:102-outlaw-traits` — Outlaw Traits | referenceEntries | reference-only | p. 102 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:103-outlaw-chief-traits` — Outlaw Chief Traits | referenceEntries | reference-only | p. 103 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:103-profile-outlaw-brass-2` — Outlaw Brass 2 | referenceEntries | deferred | p. 103 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:103-profile-outlaw-chief-brass-4` — Outlaw Chief Brass 4 | referenceEntries | deferred | p. 103 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:106-conflicts-of-jurisdiction` — Conflicts Of Jurisdiction | referenceEntries | reference-only | p. 106 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:106-reward-conditions` — Reward Conditions | referenceEntries | reference-only | p. 106 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:106-warrants-wanted-posters` — Warrants & Wanted Posters | referenceEntries | reference-only | p. 106 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:107-capture` — Capture | referenceEntries | reference-only | p. 107 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:107-kill` — Kill | referenceEntries | reference-only | p. 107–108 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:107-track` — Track | referenceEntries | reference-only | p. 107 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:108-profile-a-typical-bounty-hunter-silver-3` — A Typical Bounty Hunter Silver 3 | referenceEntries | deferred | p. 108 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:109-bounty-hunter-warrants` — Bounty Hunter Warrants | referenceEntries | reference-only | p. 109 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:109-random-warrants` — Random Warrants | referenceEntries | reference-only | p. 109 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:111-profile-brunner-bounty-hunter-general` — Brunner Bounty Hunter General | referenceEntries | deferred | p. 111 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:112-wilderness-travel` — Wilderness Travel | referenceEntries | reference-only | p. 112 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:113-provisions` — Provisions | referenceEntries | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:113-travel` — Travel | referenceEntries | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:113-travel-stages-and-distances` — Travel Stages And Distances | referenceEntries | reference-only | p. 113 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:114-precipitation` — Precipitation | referenceEntries | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:114-temperature` — Temperature | referenceEntries | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:114-weather-table-2` — Weather Table | referenceEntries | reference-only | p. 114 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:115-tents` — Tents | referenceEntries | reference-only | p. 115 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:115-visibility` — Visibility | referenceEntries | reference-only | p. 115 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:116-wilderness-travel-events` — Wilderness Travel Events | referenceEntries | reference-only | p. 116 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:116-wilderness-travel-events-table-1-light-woodland-hills-and-temperate-plains` — Wilderness Travel Events Table 1 - Light Woodland, Hills, And Temperate Plains | referenceEntries | reference-only | p. 116 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:117-wilderness-travel-events-table-2-mountains` — Wilderness Travel Events Table 2 - Mountains | referenceEntries | reference-only | p. 117 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:117-wilderness-travel-events-table-3-deep-forest` — Wilderness Travel Events Table 3 - Deep Forest | referenceEntries | reference-only | p. 117 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:118-wilderness-travel-events-table-4-wetlands` — Wilderness Travel Events Table 4 - Wetlands | referenceEntries | reference-only | p. 118 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:119-ruin-table` — Ruin Table | referenceEntries | reference-only | p. 119 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:120-monolith-table` — Monolith Table | referenceEntries | reference-only | p. 120 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:121-ancient-tomb-table` — Ancient Tomb Table | referenceEntries | reference-only | p. 121 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:122-endeavours` — Endeavours | referenceEntries | reference-only | p. 122 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:122-factors-impacting-endeavours` — Factors Impacting Endeavours | referenceEntries | reference-only | p. 122–123 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:122-journey-endeavours` — Journey Endeavours | referenceEntries | reference-only | p. 122 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:122-planning-endeavour` — Planning Endeavour | referenceEntries | reference-only | p. 122 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:124-list-of-common-shortfalls` — List Of Common Shortfalls | referenceEntries | reference-only | p. 124 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:124-terrain-table-2` — Terrain Table | referenceEntries | reference-only | p. 124 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:125-factors-impacting-navigate-endeavours` — Factors Impacting Navigate Endeavours | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:125-forage-endeavour` — Forage Endeavour | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:125-haste-endeavour` — Haste Endeavour | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:125-hunt-or-fish-endeavour` — Hunt (or Fish) Endeavour | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:125-navigate-endeavour` — Navigate Endeavour | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:125-navigation-endeavour-outcomes` — Navigation Endeavour Outcomes | referenceEntries | reference-only | p. 125 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:126-cook-endeavour` — Cook Endeavour | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:126-cooking-critical-failure-table` — Cooking Critical Failure Table | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:126-map-endeavour` — Map Endeavour | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:126-scout-endeavour` — Scout Endeavour | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:126-track-endeavour` — Track Endeavour | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:126-water-endeavour` — Water Endeavour | referenceEntries | reference-only | p. 126 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:127-journal-endeavour` — Journal Endeavour | referenceEntries | reference-only | p. 127 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:127-make-camp-endeavour` — Make Camp Endeavour | referenceEntries | reference-only | p. 127 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:127-recuperate-endeavour` — Recuperate Endeavour | referenceEntries | reference-only | p. 127 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:127-trap-endeavour` — Trap Endeavour | referenceEntries | reference-only | p. 127 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:127-watch-endeavour` — Watch Endeavour | referenceEntries | reference-only | p. 127 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:13-blessings` — Blessings | referenceEntries | reference-only | p. 13 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:13-luck-out` — Luck Out? | referenceEntries | reference-only | p. 13 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:13-miracles` — Miracles | referenceEntries | reference-only | p. 13 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:130-hunting-as-endeavour` — Hunting As Endeavour | referenceEntries | reference-only | p. 130 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:131-the-value-of-game` — The Value Of Game | referenceEntries | reference-only | p. 131 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:132-animals-and-equipment` — Animals and Equipment | referenceEntries | reference-only | p. 132 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:132-hunting-considerations` — Hunting Considerations | referenceEntries | reference-only | p. 132 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:133-hunting-traits` — Hunting Traits | referenceEntries | reference-only | p. 133 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:133-profile-grootscher-marsh-hound` — Grootscher Marsh Hound | referenceEntries | deferred | p. 133 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:133-profile-hochland-lockhund` — Hochland Lockhund | referenceEntries | deferred | p. 133 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:133-profile-nordlander-bamse` — Nordlander Bamse | referenceEntries | deferred | p. 133 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:134-hunting-traits` — Hunting Traits | referenceEntries | reference-only | p. 134 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:134-profile-arabyan-redhawk` — Arabyan Redhawk | referenceEntries | deferred | p. 134 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:134-profile-dove-hawk` — Dove Hawk | referenceEntries | deferred | p. 134 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:15-ranalds-gamble` — Ranald’S Gamble | referenceEntries | reference-only | p. 15 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:27-expectations-and-complications` — Expectations and Complications | referenceEntries | reference-only | p. 27 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:27-pickpocket-skills-talents-and-trappings` — Pickpocket Skills, Talents, And Trappings | referenceEntries | reference-only | p. 27 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:27-pickpocket-success-table` — Pickpocket Success Table | referenceEntries | reference-only | p. 27 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:27-pilfering-in-the-game` — Pilfering in the Game | referenceEntries | reference-only | p. 27 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:27-spotting-a-pickpocket-at-work` — Spotting a Pickpocket at Work | referenceEntries | reference-only | p. 27 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:28-incriminating-artefact` — Incriminating Artefact | referenceEntries | reference-only | p. 28 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:28-the-contents-of-a-purse` — The Contents Of A Purse | referenceEntries | reference-only | p. 28 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:29-victim-quirk-table` — Victim Quirk Table | referenceEntries | reference-only | p. 29 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:30-burglar-skills-talents-and-trappings` — Burglar Skills, Talents, And Trappings | referenceEntries | reference-only | p. 30 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:31-endeavour-complications` — Endeavour Complications | referenceEntries | reference-only | p. 31 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:31-the-income-endeavour` — The Income Endeavour | referenceEntries | reference-only | p. 31 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:31-thieves-in-downtime` — Thieves In Downtime | referenceEntries | reference-only | p. 31 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:32-caltrops` — Caltrops | referenceEntries | reference-only | p. 32 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:32-crampons` — Crampons | referenceEntries | reference-only | p. 32 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:32-tools-of-the-trade` — Tools Of The Trade | referenceEntries | reference-only | p. 32 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:33-glass-cutting-success-table` — Glass Cutting Success Table | referenceEntries | reference-only | p. 33 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:33-steel-mummit` — Steel Mummit | referenceEntries | reference-only | p. 33 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:33-steel-mummit-success-table` — Steel Mummit Success Table | referenceEntries | reference-only | p. 33 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:33-telescopic-stick` — Telescopic Stick | referenceEntries | reference-only | p. 33 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:34-graverobbery-in-operation` — Graverobbery in Operation | referenceEntries | reference-only | p. 34 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:34-profile-black-guard-of-morr-knight-silver-5` — Black Guard Of Morr (Knight) (Silver 5) | referenceEntries | deferred | p. 34 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:35-crypt-complications` — Crypt Complications | referenceEntries | reference-only | p. 35 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:36-endeavour-complications` — Endeavour Complications | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:36-the-income-endeavour` — The Income Endeavour | referenceEntries | reference-only | p. 36 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:37-creepy-customer-table` — Creepy Customer Table | referenceEntries | reference-only | p. 37 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:38-endeavour-complications` — Endeavour Complications | referenceEntries | reference-only | p. 38 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:38-false-promises` — False Promises | referenceEntries | reference-only | p. 38 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:38-the-income-endeavour` — The Income Endeavour | referenceEntries | reference-only | p. 38 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:39-charlatan-income-endeavour-complications` — Charlatan Income Endeavour Complications | referenceEntries | reference-only | p. 39 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:39-endeavour-complications` — Endeavour Complications | referenceEntries | reference-only | p. 39 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:41-fencing-in-downtime` — Fencing in Downtime | referenceEntries | reference-only | p. 41 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:41-fencing-lessons` — Fencing Lessons | referenceEntries | reference-only | p. 41 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:41-file-off-the-markings` — File Off the Markings | referenceEntries | reference-only | p. 41 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:41-item-recognition` — Item Recognition | referenceEntries | reference-only | p. 41 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:41-safer-to-scrap-it` — Safer to Scrap It | referenceEntries | reference-only | p. 41 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:41-take-a-trip` — Take a Trip | referenceEntries | reference-only | p. 41 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:42-a-careful-kind-of-crime` — A Careful Kind of Crime | referenceEntries | reference-only | p. 42 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:42-random-business-table` — Random Business Table | referenceEntries | reference-only | p. 42 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:42-random-businesses` — Random Businesses | referenceEntries | reference-only | p. 42 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:42-trappings` — Trappings | referenceEntries | reference-only | p. 42 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:43-black-market` — Black Market | referenceEntries | reference-only | p. 43 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:43-criminal-endeavours` — Criminal Endeavours | referenceEntries | reference-only | p. 43 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:43-gambling-den` — Gambling Den | referenceEntries | reference-only | p. 43 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:43-plant-identities` — Plant Identities | referenceEntries | reference-only | p. 43 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:43-whisper-campaign` — Whisper Campaign | referenceEntries | reference-only | p. 43 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:45-bogus-documents-and-seals` — Bogus Documents and Seals | referenceEntries | reference-only | p. 45 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:45-counterfeit-coins` — Counterfeit Coins | referenceEntries | reference-only | p. 45 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:45-fake-it-til-you-make-it` — Fake It ‘Til You Make It | referenceEntries | reference-only | p. 45 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:45-forged-artwork` — Forged Artwork | referenceEntries | reference-only | p. 45 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:46-casual-contacts` — Casual Contacts | referenceEntries | reference-only | p. 46 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:46-contacts` — Contacts | referenceEntries | reference-only | p. 46 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:47-profile-fence-silver-2` — Fence (Silver 2) | referenceEntries | deferred | p. 47 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:47-profile-forger-silver-1` — Forger (Silver 1) | referenceEntries | deferred | p. 47 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:48-profile-bawd-brass-3` — Bawd (Brass 3) | referenceEntries | deferred | p. 48 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:48-profile-racketeer-brass-5` — Racketeer (Brass 5) | referenceEntries | deferred | p. 48 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:49-profile-charlatan-brass-5` — Charlatan (Brass 5) | referenceEntries | deferred | p. 49 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:49-profile-safe-house-owner-townsman-silver-2` — Safe House Owner (Townsman) (Silver 2) | referenceEntries | deferred | p. 49 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:50-define-the-contact` — Define the Contact | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:50-new-endeavour-establishing-a-contact` — New Endeavour: Establishing A Contact | referenceEntries | reference-only | p. 50 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:52-contact-quality-table` — Contact Quality Table | referenceEntries | reference-only | p. 52 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:53-contact-development-table` — Contact Development Table | referenceEntries | reference-only | p. 53 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:55-profile-august-sternwachter-master-fence-ex-noble-silver-3` — August Sternwachter Master Fence, Ex-Noble (Silver 3) | referenceEntries | deferred | p. 55 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:58-assemble-the-gang` — Assemble the Gang | referenceEntries | reference-only | p. 58 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:58-build-gang` — Build Gang | referenceEntries | reference-only | p. 58 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:58-new-endeavours` — New Endeavours | referenceEntries | reference-only | p. 58 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:59-criminal-enterprises` — Criminal Enterprises | referenceEntries | reference-only | p. 59 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:59-maintain-influence` — Maintain Influence | referenceEntries | reference-only | p. 59 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:59-organising-crime` — Organising Crime | referenceEntries | reference-only | p. 59 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:60-criminal-events` — Criminal Events | referenceEntries | reference-only | p. 60–61 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:64-profile-albrecht-the-fish-gang-boss-silver-3-organisation-level-2` — Albrecht ‘The Fish’ — Gang Boss Silver 3 - Organisation Level 2 | referenceEntries | deferred | p. 64 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:65-profile-gunna-von-sperren-smuggler-king-silver-3-organisation-level-3` — Gunna Von Sperren — Smuggler King Silver 3 - Organisation Level 3 | referenceEntries | deferred | p. 65 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:67-criminal-enterprise-perks` — Criminal Enterprise Perks | referenceEntries | reference-only | p. 67 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:81-the-great-horned-helm` — The Great Horned Helm | referenceEntries | reference-only | p. 81 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:83-profile-father-pedragar-priest-of-taal` — Father Pedragar, Priest Of Taal | referenceEntries | deferred | p. 83 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:87-curse-of-taal` — Curse Of Taal | referenceEntries | reference-only | p. 87 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:92-determining-watch-presence` — Determining Watch Presence | referenceEntries | reference-only | p. 92 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:93-crimes-and-the-watch` — Crimes and the Watch | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:93-profile-watch-sergeant-silver-3` — Watch Sergeant (Silver 3) | referenceEntries | deferred | p. 93 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:93-profile-watchman-silver-1` — Watchman (Silver 1) | referenceEntries | deferred | p. 93 | Reviewed NPC/creature source retained for future use; currently excluded from shared search and supplemental GM creation. |
| `deft-steps:reference:93-watch-presence` — Watch Presence | referenceEntries | reference-only | p. 93 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:95-fairer-hearings` — Fairer Hearings | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:95-rough-justice` — Rough Justice | referenceEntries | reference-only | p. 95 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:96-typical-punishments` — Typical Punishments | referenceEntries | reference-only | p. 96 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:97-endeavours-in-gaol` — Endeavours in Gaol | referenceEntries | reference-only | p. 97 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:97-events-in-gaol` — Events in Gaol | referenceEntries | reference-only | p. 97 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:97-passing-the-time` — Passing the Time | referenceEntries | reference-only | p. 97 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:97-the-intervention-of-patrons` — The Intervention of Patrons | referenceEntries | reference-only | p. 97 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:98-bribery` — Bribery | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:98-bribery-skill-test-table` — Bribery Skill Test Table | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:98-new-endeavour-gaol-break` — New Endeavour: Gaol Break | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:98-notorious-prisons` — Notorious Prisons | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:98-willingness-to-take-a-bribe` — Willingness To Take A Bribe | referenceEntries | reference-only | p. 98 | Sourced book rule reference; no live-play automation. |
| `deft-steps:reference:99-life-outside-the-law` — Life Outside the Law | referenceEntries | reference-only | p. 99 | Sourced book rule reference; no live-play automation. |
| `deft-steps:spell:bamboozle` — Bamboozle | spells | adapted | p. 24 | Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364). Ordinary printed numerical bonuses remain unchanged. |
| `deft-steps:spell:earthshudder` — Earthshudder | spells | adapted | p. 88 | Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364). Ordinary printed numerical bonuses remain unchanged. |
| `deft-steps:spell:under-my-protection` — Under my Protection | spells | adapted | p. 25 | Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364). Ordinary printed numerical bonuses remain unchanged. |
| `deft-steps:spell:unremembered-face` — Unremembered Face | spells | adapted | p. 24 | Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364). Ordinary printed numerical bonuses remain unchanged. |
| `deft-steps:spell:wild-wind` — Wild Wind | spells | adapted | p. 88 | Named Fourth Edition Test Difficulties use Fifth Edition SL modifiers (core Appendix I p. 364). Ordinary printed numerical bonuses remain unchanged. |

</details>

## Deft Steps — General Ranald Priest

Pack `deft-steps-ranald-priest` · version 1.0.1

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 1 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|

## Deft Steps — Ranald the Dealer

Pack `deft-steps-dealer` · version 1.0.1

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 1 | 0 | 0 | 0 | 0 |
| cults | 0 | 1 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `deft-steps-dealer:cult:ranald` — Ranald | cults | adapted | p. 24 | User-approved core equivalents in aspect lists: Stay Lucky → Cheat the Odds; Rich Man, Poor Man, Beggar Man, Thief → Trickster’s Glamour; You Ain’t Seen Me Right? → You Saw Nothing. All aspects use Invoke (Ranald), with their separate printed access. |

</details>

## Deft Steps — Taal Priest

Pack `deft-steps-taal-priest` · version 1.0.1

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 1 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|

## Deft Steps — White Stag / Hermit

Pack `deft-steps-white-stag` · version 1.0.1

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 1 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|

## Deft Steps — Longshanks Scout

Pack `deft-steps-longshanks` · version 1.0.1

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 1 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|

## Deft Steps — Pickpocket

Pack `deft-steps-pickpocket` · version 1.0.1

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 1 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Pickpocket Talent swap | reference-only | p. 27 | Core Fifth Edition Thief already has Fast Hands and no level-one Strike to Stun; no further swap or free Talent is added. |

## Reviewed aliases

Aliases are exact and scoped; they are not fuzzy substitutions. The active `contentId` is required to distinguish same-name Career alternatives. No mapping is invented for the withdrawn Archives I Dwarf weapons.

| Kind / scope | Printed name | Canonical name | Source | Decision |
|---|---|---|---|---|
| gear-weight / shared | Large Sack | Sack, Large | core p. 308 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Canvas Tarpaulin | Canvas Tarp | core p. 316 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Charcoal Stick | Charcoal stick | core p. 316 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Pole | Pole (3 yards) | core p. 310 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Rope | Rope, 10 yards | core p. 316 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Flask of Spirits | Flask | core p. 308 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Bandages | Bandage | core p. 316 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Keys | Key | core p. 310 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Hammer and Nails | Hammer | core p. 310 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Hammer and Spikes | Hammer | core p. 310 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Poor Quality Blanket | Blanket | core p. 316 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Storm Lantern with Oil | Storm Lantern | core p. 316 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-weight / shared | Storm Lantern and Oil | Storm Lantern | core p. 316 | Existing creator weight interpretation; no new contents or profile inferred. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Main-gauche | Main Gauche | core p. 301 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Sword-breaker | Swordbreaker | core p. 301 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Great Weapon (Two-handed Pick) | Pick (2H) | core p. 301 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Great Weapon (Military Flail) | Military Flail (2H) | core p. 301 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Great Weapon (Dwarf Greataxe) | Greataxe (2H) | core p. 301 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Large Sack | Sack, Large | core p. 308 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Coach Horn | Instrument | core p. 316 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Mandolin | Instrument | core p. 316 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Lute | Large Instrument | core p. 316 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Harp | Large Instrument | core p. 316 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Flute | Small Instrument | core p. 316 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Recorder | Small Instrument | core p. 316 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Tambourine | Small Instrument | core p. 316 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Small Drum | Instrument | core p. 316 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Large Drum | Large Instrument | core p. 316 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Parchment | Parchment/sheet | core p. 311 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Rations (1 day) | Rations, 1 day | core p. 309 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Rations (one day) | Rations, 1 day | core p. 309 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Lunch | Meal, inn | core p. 309 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Grimoire | Book, Magic | core p. 311 | Existing creator profile/name interpretation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / shared | Leather Breastplate | Leather Jerkin | core p. 307 | User-approved body-only leather statistics; retain the printed Career name. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| rule-name / shared | Nimble Fingered | Nimble-fingered | core p. 123 | Existing Fifth Edition canonical naming correction. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| rule-name / shared | Coolhead | Coolheaded | core p. 117 | Existing Fifth Edition canonical naming correction. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| rule-name / shared | Acute Sight | Acute Sense (Sight) | core p. 114 | Existing Fifth Edition canonical naming correction. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| rule-name / shared | Etiquette (Guilder) | Etiquette (Guilders) | core p. 119 | Existing Fifth Edition canonical naming correction. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| rule-base / shared | Resistance | Resistant | core p. 124 | Existing canonical Talent prefix; preserve its specialisation. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| rule-specialisation / shared | Sing | Singing | core p. 111 | Existing Entertain specialisation correction. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| talents / up-in-arms | Diceman | Dicer | core p. 118 | Approved Fifth Edition equivalent; see UP-IN-ARMS.md. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| talents / up-in-arms | Strider | Striding Gait | core p. 127 | Approved Fifth Edition equivalent; see UP-IN-ARMS.md. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| talents / up-in-arms | Tunnel Rat | Tunnel Fighter | core p. 128 | Approved Fifth Edition equivalent; see UP-IN-ARMS.md. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| talents / up-in-arms | Public Speaking | Public Speaker | core p. 124 | Approved Fifth Edition equivalent; see UP-IN-ARMS.md. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| talents / up-in-arms | Trick Riding | Trick Rider | core p. 128 | Approved Fifth Edition equivalent; see UP-IN-ARMS.md. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| talents / up-in-arms | Warleader | War Leader | core p. 128 | Approved Fifth Edition equivalent; see UP-IN-ARMS.md. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| talents / up-in-arms | Unshakable | Unshakeable | core p. 128 | Approved Fifth Edition equivalent; see UP-IN-ARMS.md. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| talents / up-in-arms | Rough Rider | Roughrider | core p. 125 | Approved Fifth Edition equivalent; see UP-IN-ARMS.md. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| skills / up-in-arms | Ranged (Engineer) | Ranged (Engineering) | core p. 113 | Approved printed naming mismatch. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| careers / archives-ii | Seaman | Sailor | core p. 90 | Approved core Career equivalent. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| careers / rough-nights | Advisor | Adviser | core p. 45 | Approved spelling correction. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| careers / rough-nights | Bawd | Knave | core p. 69 | Approved revised Fifth Edition Career equivalent. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| careers / dwarf-guide | Huffer | Pilot | core p. 81 | Approved core Career equivalent. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| gear-profile / dwarf-guide | Dwarf Hammer | Dwarf Warhammer | dwarf-guide p. 93 | Approved Guide naming mismatch. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| rune-form / dwarf-guide | Protective Runes | Protection Runes | dwarf-guide p. 130 | Approved Hearth Priest naming correction. Source identifies the canonical profile; the equivalence is the recorded interpretation/decision. |
| talents / deft-steps | Public Speaking | Public Speaker | deft-steps p. 22 | Approved core Talent equivalent; level-two Liberator entry moves from Skills to Talent options. |
| talents / deft-steps | Diceman | Dicer | deft-steps p. 16 | Previously approved core Talent equivalent. |
| talents / deft-steps | Strider | Striding Gait | deft-steps p. 83 | Previously approved core Talent equivalent; printed terrains retained. |
| talents / deft-steps | Trick-Riding | Trick Rider | deft-steps p. 128 | Previously approved core Talent equivalent. |
| skills / deft-steps | Perform (Acting) | Entertain (Acting) | deft-steps p. 20 | User-approved Skill replacement, explained as Legacy. |
| spells / deft-steps | Stay Lucky | Cheat the Odds | deft-steps p. 18 | User-approved core Miracle replacement, explained as Legacy in aspect lists. |
| spells / deft-steps | A Suitable Stooge | A Suitable Sucker | deft-steps p. 24 | User-approved printed naming mismatch; detailed entry used. |
| spells / deft-steps | Rich Man, Poor Man, Beggar Man, Thief | Trickster’s Glamour | deft-steps p. 19 | Previously approved Fifth Edition Miracle equivalent. |
| spells / deft-steps | You Ain’t Seen Me Right? | You Saw Nothing | deft-steps p. 18 | Previously approved Fifth Edition Miracle equivalent. |
| gear-profile / deft-steps | Steel Mummit | Thin Jimmy | deft-steps p. 33 | User pairs p. 32 table name/price with this p. 33 description. |
| gear-profile / deft-steps | Telescopic Stick | Telescopic Pole | deft-steps p. 33 | User pairs p. 32 table name/price with this p. 33 description. |
