# Book inclusion matrix

Generated from the validated registry and its reviewed coverage inventories. Run `npm run generate:books`; do not hand-edit this file.

**Implemented** means a creator choice/profile is supported, not that live play effects are automated. **Adapted** identifies a concrete changed rule, using reviewed adaptation metadata; Fourth Edition origin alone never qualifies. **Reference-only** retains supplied information without the corresponding ordinary purchase/play action. **Unavailable** is deliberately blocked or unresolved. **Deferred** is future scope. Counts describe source records, not unique gameplay choices: gear/shop/weapon records may describe the same item. Features are counted separately to avoid pretending chapters are individual profiles.

Each source inventory remains visible even when another selected book supersedes it. Active totals account for current precedence; the separately selectable Hedge Witch variant is not an extra simultaneous Career. Book-wide decisions omit a page rather than invent a chapter reference.

| Active catalogue | Count |
|---|---:|
| books | 10 |
| careers | 117 |
| magicProfiles | 504 |
| rituals | 17 |
| cants | 24 |
| techniques | 10 |
| runes | 71 |
| pricedShopEntries | 390 |

| Source pack | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| Warhammer Fantasy Roleplay, Fifth Edition | 840 | 0 | 1 | 0 | 0 |
| Up in Arms | 135 | 12 | 0 | 1 | 0 |
| Archives of the Empire: Volume I | 31 | 22 | 0 | 0 | 0 |
| Archives of the Empire: Volume II | 50 | 7 | 0 | 0 | 0 |
| Archives of the Empire: Volume III | 45 | 14 | 0 | 0 | 0 |
| Archives III — Animal-doctor Hedge Witch (variant) | 0 | 1 | 0 | 0 | 0 |
| Winds of Magic | 120 | 55 | 1 | 0 | 0 |
| Rough Nights & Hard Days | 3 | 5 | 0 | 0 | 0 |
| Dwarf Player’s Guide | 156 | 34 | 13 | 2 | 0 |
| High Elf Player’s Guide | 55 | 55 | 23 | 0 | 0 |
| Blood and Bramble | 15 | 10 | 0 | 0 | 0 |

The table above counts catalog records. The feature matrix below includes systems, embedded unavailable Career entries and deliberate exclusions that have no catalog record.

## Warhammer Fantasy Roleplay, Fifth Edition

Pack `core` · version 1.0.0

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| armour | 19 | 0 | 0 | 0 | 0 |
| background | 5 | 0 | 0 | 0 | 0 |
| careers | 64 | 0 | 0 | 0 | 0 |
| gear | 129 | 0 | 1 | 0 | 0 |
| market | 124 | 0 | 0 | 0 | 0 |
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
| Optional individual Advances and tracker grouping | adapted | p. 364 | The user-approved grouping awards a box after five eligible points in the same Skill/Characteristic; Appendix II does not specify tracker interaction. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `core:gear:jewellery` — Jewellery | gear | reference-only | p. 308 | No fixed ordinary shop price; retained as a profile/reference without inventing a purchase price. |

</details>

## Up in Arms

Pack `up-in-arms` · version 1.0.0

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 7 | 8 | 0 | 0 | 0 |
| market | 70 | 0 | 0 | 0 | 0 |
| origins | 0 | 3 | 0 | 0 | 0 |
| spells | 8 | 1 | 0 | 0 | 0 |
| tables | 7 | 0 | 0 | 0 | 0 |
| talents | 0 | 0 | 0 | 1 | 0 |
| weapons | 43 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Replacement profiles for existing core equipment | unavailable | Book-wide scope decision | User chose to retain core statistics and import only new equipment. |
| Injuries, mounted/group combat, hirelings and Warrior Endeavours | deferred | Book-wide scope decision | Outside character-creation scope. |
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
| `up-in-arms:miracle:in-good-order` — In Good Order | spells | adapted | p. 79 | Fourth Edition Advantage references converted to Momentum (core Appendix I). |
| `up-in-arms:talent:crew-commander` — Crew Commander | talents | unavailable | p. 140 | Unavailable: Crew Commander has no Fifth Edition core equivalent. Its Fourth Edition repeat limit and Talent Test bonus need an agreed conversion (Up in Arms p. 140). |

</details>

## Archives of the Empire: Volume I

Pack `archives-i` · version 1.0.0

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 0 | 4 | 0 | 0 | 0 |
| market | 17 | 1 | 0 | 0 | 0 |
| origins | 1 | 15 | 0 | 0 | 0 |
| talents | 0 | 1 | 0 | 0 | 0 |
| weapons | 13 | 1 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
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
| `archives-i:talent:youngblood` — Youngblood | talents | adapted | p. 78 | Fourth Edition per-rank bonus on the listed Tests omitted; printed limit and effects retained under the approved Fifth Edition adaptation. |
| `archives-i:weapon:blackbriar-javelin` — Blackbriar Javelin | weapons | adapted | p. 93 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |

</details>

## Archives of the Empire: Volume II

Pack `archives-ii` · version 1.0.2

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| armour | 2 | 0 | 0 | 0 | 0 |
| astrology | 20 | 0 | 0 | 0 | 0 |
| background | 1 | 0 | 0 | 0 | 0 |
| careers | 2 | 1 | 0 | 0 | 0 |
| market | 12 | 0 | 0 | 0 | 0 |
| species | 0 | 1 | 0 | 0 | 0 |
| spells | 3 | 4 | 0 | 0 | 0 |
| tables | 2 | 0 | 0 | 0 | 0 |
| talents | 0 | 1 | 0 | 0 | 0 |
| weapons | 8 | 0 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Big Names, live magic, artifice, mass battles and psychology | deferred | Book-wide scope decision | Outside creator scope; no manufacturing prices become shop prices. |
| Firebelly Wizard modifications | unavailable | p. 31 | No complete printed Career modifications; no invented profile. |
| Ogre restrictions / GM permission reminder | reference-only | p. 21 | Informational rule text only; no acknowledgement checkbox or export gate. |
| Rhinox Herder Harpoon statistics | reference-only | p. 36 | Retain the printed Trapping name; do not assume launcher or ammunition-pack statistics. |
| Ogre carrying Talent ordering | adapted | p. 31 | Apply core carrying Talents first, then double capacity, as approved. |
| Typical Ogre equipment sizing categories | adapted | p. 31 | Use user-approved categories; unclear items remain unresolved. |
| Star-sign Talent compatibility and core limits | adapted | p. 39 | Keep Fifth Edition limits and magic compatibility; an already-owned nonrepeatable Talent counts once. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
| `archives-ii:career:rhinox-herder` — Rhinox Herder | careers | adapted | p. 36 | Older Talent options replaced with Fifth Edition definitions: Striding Gait, Trick Rider. |
| `archives-ii:species:ogre` — Ogre | species | adapted | p. 20 | User-approved Fifth Edition starting Fate/Fortune, five Skills at +5 and separate Size instead of the old Size Talent. |
| `archives-ii:spell:bullgorger` — Bullgorger | spells | adapted | p. 32 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-ii:spell:feast-of-the-fallen` — Feast of the Fallen | spells | adapted | p. 33 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-ii:spell:the-maw` — The Maw | spells | adapted | p. 33 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-ii:spell:trollguts` — Trollguts | spells | adapted | p. 33 | Printed Test Difficulty modifiers converted to Fifth Edition SL modifiers (core Appendix I). |
| `archives-ii:talent:vice` — Vice (Target) | talents | adapted | p. 20 | Fourth Edition per-rank bonus on the listed Tests omitted; printed limit and effects retained under the approved Fifth Edition adaptation. |

</details>

## Archives of the Empire: Volume III

Pack `archives-iii` · version 1.0.0

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| cants | 24 | 0 | 0 | 0 | 0 |
| careers | 1 | 2 | 0 | 0 | 0 |
| origins | 0 | 5 | 0 | 0 | 0 |
| spells | 20 | 7 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Alternative armour system | unavailable | p. 34–38 | User chose to skip this entire alternative, including its new profiles. |
| Live casting/Cants, armour maintenance and adventures | deferred | Book-wide scope decision | Selections/descriptions are available; play systems are deferred. |
| Optional free Cant selections and export | implemented | p. 85–88 | Choose at 1/3/6 learned Colour Lore spells, without live power tracking. |
| Enterprises, including starting ownership | deferred | p. 6 | User deferred ownership, debt, trade and business management together. |
| Animal Familiar creation and progression | deferred | p. 75–82 | User deferred the whole chapter until the character manager. |
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

Pack `winds-of-magic` · version 1.0.0

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| careers | 10 | 2 | 0 | 0 | 0 |
| gear | 4 | 0 | 1 | 0 | 0 |
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

Pack `rough-nights` · version 1.0.0

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| background | 1 | 0 | 0 | 0 | 0 |
| cults | 1 | 2 | 0 | 0 | 0 |
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
| `rough-nights:species:gnome` — Gnome | species | adapted | p. 88 | User-approved Fifth Edition starting Fate/Fortune, five Skills at +5 and separate Size instead of the old Size Talent. |
| `rough-nights:table:gnome-careers` — Gnome Careers | tables | adapted | p. 87 | Printed Bawd result uses the revised Fifth Edition Knave Career profile. |
| `rough-nights:talent:suffuse-with-ulgu` — Suffuse with Ulgu | talents | adapted | p. 88 | Fourth Edition per-rank bonus on the listed Tests omitted; printed limit and effects retained under the approved Fifth Edition adaptation. |

</details>

## Dwarf Player’s Guide

Pack `dwarf-guide` · version 1.0.0

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| armour | 2 | 0 | 5 | 0 | 0 |
| careerUpdates | 14 | 0 | 0 | 1 | 0 |
| careers | 6 | 4 | 0 | 0 | 0 |
| gear | 30 | 0 | 8 | 0 | 0 |
| origins | 0 | 11 | 0 | 0 | 0 |
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

Pack `high-elf` · version 1.0.0

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| armour | 1 | 0 | 10 | 0 | 0 |
| careers | 2 | 4 | 0 | 0 | 0 |
| gear | 8 | 3 | 12 | 0 | 0 |
| origins | 0 | 11 | 0 | 0 | 0 |
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

Pack `blood-bramble` · version 1.0.0

| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |
|---|---:|---:|---:|---:|---:|
| gear | 1 | 0 | 0 | 0 | 0 |
| spells | 14 | 10 | 0 | 0 | 0 |

| Feature / scope | Status | Source | Decision |
|---|---|---|---|
| Foraging, ingredient consumption, pacts/summons and adventures | deferred | Book-wide scope decision | No live effects, companions or NPC Career profiles are granted. |
| Hedgecraft ingredient quantity/weight | reference-only | p. 6 | 5-penny purchase supported, but supplied amount and weight are unspecified. |

<details>
<summary>Profile exceptions and adaptations</summary>

| Content ID / name | Kind | Status | Source | Decision |
|---|---|---|---|---|
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
