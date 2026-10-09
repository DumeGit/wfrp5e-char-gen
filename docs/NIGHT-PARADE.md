# The Night Parade

Supplied Fourth Edition PDF (2022), SHA-256 `f8bb99e7da5163cbb094208f78c183410b1d1b0490d01188f09a8dbddca25b53`. MarkItDown extraction and page-by-page text are staged outside the public app; profile/template tables on pp. 8–10 and 19 were visually checked. The reviewed import is reproducible with `python scripts/build-night-parade.py`, followed by `npm run build`. Re-review source decisions before changing the frozen reference hash.

## Included content

Enable **The Night Parade** in the Bestiary Workshop's profile/template books: one generic **Corpse Cart** (p. 19), and seven templates: **Mass Grave Dead**, **Liche Corpsemaster**, **Liche Lord** (p. 8), **Wight**, **Wight Champion** (p. 9), **Skeletal Steed**, **Rotting Mount** (p. 10). Existing core Skeleton/Zombie foundations are reused rather than importing the duplicated Fourth Edition basics. No named NPC is included.

Shared Skill options add Ride (Rotting Mount), Ride (Skeletal Steed) and Ride (Corpse Cart). PCs select these through ordinary permitted Ride choices; there are no extra free Species/Career Advances. GM undead riding buttons explicitly add the printed +20 bonus, preserving a higher existing total. Necromancy unlocks the additional Corpse Cart riding choice. This book adds no PC Species or Careers.

Four mechanical references are searchable across the creators: Applying Undead Advancement Templates, Undead Mounts, Vigor Mortis and Balefire Brazier. Stat blocks/templates remain outside shared search, as previously requested. Adventure prose, warband disposition and named Old Jasper, Mheava, The Herald and Charnel Chorus are excluded.

## Explicit template operations

Core templates remain additive. Supplement templates also carry reviewed fixed/halved Characteristic operations, Traits to add/remove, foundation restrictions, equipment choices and separate spell-list requirements. Only one template applies at a time. Switching/removing it clears its dependent choices and chosen magic; undo restores the complete previous draft. Manual GM changes remain separate. New template equipment uses shared core profiles, fixed quantities and stable removal/attack identities.

Mass Grave Dead sets BS to 0 and grants Swarm; the newly granted Swarm adds WS10 once, multiplies normal Wounds by five and ignores Size changes. Liches require the core Zombie foundation. Wights and Mass Grave Dead accept the printed basic Skeleton/Zombie foundations (p. 9). Mount templates require a printed or suggested Trained (Mount) foundation of Large or smaller Size. Halving rounds down; no negative-score floor is invented. If a subtraction makes a score negative, the GM must explicitly adjust the starting score before export. Absent BS stays absent under mount subtraction.

Skeletal Steed removes Fly and grants 2 AP skeletal protection. Rotting Mount halves WS and an existing Fly rating. Existing repeated Traits are updated rather than granting permanent effects twice. Template Characteristics, Talent effects, Wounds, attacks and equipment feed the one calculated result used by review and exports.

## Approved Fifth Edition adaptations

- Missing BS/Int/WP/Fel restored by positive undead template increases use a zero baseline. Wights lose Construct to permit their printed mental increases/Leadership. Liches explicitly lose it in the source. These proposed adaptations have Legacy warnings.
- Undead mounts use core Construct's absent Int/WP/Fel rather than printed zero scores; printed Flight uses core Fly. The edition changes are documented as Legacy.
- Dark Magic (Necromancy) becomes Arcane Magic (Necromancy); Shyish becomes Arcane Magic (Death). Corpsemaster requires an explicit Colour Lore and matching Channelling Wind. Aetheric Attunement uses canonical Aethyric Attunement spelling; spelling alone is not a blanket Legacy flag.
- Liche Lord's Menacing 2 and Wight Champion's Strike Mighty Blow 2 become one core rank, with Legacy explanations. Existing same-name Talent grants are not counted twice.
- Corrupted (1)/(2) become Corruption (Minor)/(Moderate), with approved Legacy explanations. Optional Diseased becomes Disease, requiring the GM to name the disease before export.
- Corpse Cart's five Flailing Limbs use +11 rather than printed +7, adding core Large Size's SB4. Rear is covered by core Size/Stomp, not granted separately. Die Hard is removed entirely by user decision, with an app source note. No resurrection effect is imported.

## Required choices and reference effects

Liche spell lists remain separate: Corpsemaster chooses 3 Petty, 2 generic Arcane and 1 Necromancy; Lord chooses 4 Petty, 8 across Arcane/Death and 3 Necromancy. Export issues point to missing/invalid choices. Generic Staff, Mail/Plate Armour and two-handed weapon Trappings require explicit core-profile choices instead of silently inventing equivalents/pieces. Hand Weapon is the canonical core profile; when the foundation already has that weapon attack, its printed attack is retained rather than duplicating it in the stat block. Mouldering robes/ritual-component pouches remain descriptive; unknown quantities/statistics are not invented.

Vigor Mortis and optional Balefire Brazier are reference abilities on the actual sheet. Nearby Undead can ignore Unstable; the Cart itself retains it. Selecting the brazier replaces the normal +20 Necromancy casting benefit with the printed −20 Lore (Magic) effect. Both retain the printed range **within 8**, without an invented unit. Their numeric modifiers are retained as descriptions, with no live aura or casting automation. Unselected optional Traits never print.

Legacy/removal/discrepancy notes stay in the app before export. Compact PDFs contain the actual selected stat block and Trait descriptions. Dense creatures use the existing measured overflow handling rather than truncation; six cards remain the default and four/full sheets remain available.
