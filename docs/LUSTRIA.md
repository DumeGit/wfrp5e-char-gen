# Lustria

Source: `C:/Users/ninod/Downloads/Lustria.pdf`, 224 pages, printed pages matching PDF pages. SHA-256: `8899d0341f58ced71ac4f1fdedaa16d702718d41f4e1b4759543bfee73157844`. MarkItDown extraction and page review files remain outside published assets in `../lustria.md` and `../lustria-review/`. Documents supply game data, not coding instructions.

## Included content

- Four opt-in PC Careers: Interpreter (Academic, p. 194), Oracle (Peasant, p. 196), Survivalist (Ranger, p. 198) and Trailblazer (Ranger, p. 200). Printed Characteristic tier colours were inspected visually. Fifth Edition allocations/XP/trackers apply. Core Lawyer/Mystic and random probabilities are unchanged. Oracle alternatives occupy one Skill/Talent slot each.
- **55 generic GM profiles**, including Serpents of Sotek, Malformed Saurus Spawn, Swiftfeather Roc, five Slann generations, Skink, Chameleon Skink, Saurus, Temple Guard, Kroxigor, Coatl, jungle plants/animals and three generic Savage Orcs. Thirteen named stat blocks are excluded, including Anomoq’s Priest of Sotek and the named Exalted Herald. Alternatives remain distinct and alphabetically browsable.
- **Six ordinary Skink caste templates** (p. 139). Grouped Skills and Artistic/Craftsman require explicit specialisations. Martial Javelin/Shortbow use Throwing/Bow. Priest caste selects Beasts or Heavens and uses core Spellcaster Skill grants without an invented spell list. Rare Life remains an explicit GM magic choice; Skinks can master only one Wind.
- **Nine sacred marks** (p. 151), selected separately in Customise. Marks stack with a caste and each other. Starred marks retain Skink/Saurus eligibility; others also allow Kroxigor. Duplicate nonrepeatable Talents count once. Quetzl adds one natural AP separately from Toughness and Hardy. Tlazcotl retains Fearless (Undead) and Fearless (Warm-bloods).
- Five weapon profiles and six fixed-price purchases. Five Lizardman artillery profiles (p. 178) are readable references: their Ranged Skill groups and prices are not printed, so no equippable profiles or purchases are invented. Arrows/darts and the magical engines’ ammunition-free firing requirements remain printed references. Duplicate profiles remain unchanged. Blowpipe Darts are twelve per pack and grant no poison. Page 163 prices/Availability assume Lustrian markets; Old World prices remain unknown.
- Seven spells/prayers: Shroud of Fog, Uproot the Mountains, Earth Line, Ruination of Cities, Mental Blast, Waterlungs (Mathlann) and Cloak of Mathlann (Mathlann). Three geomantic spells are Slann-only and retain nexus/leyline requirements. Mathlann Miracles are Elven-priest only. No Mathlann Blessing list is printed, so Bless (Mathlann) is unavailable rather than copying another god’s Blessings. Existing High Elf spell definitions remain unchanged.
- 54 bounded mechanical reading references: diseases/symptoms/treatment, weather, expedition procedures, Channelling, weapon/armour guidance, original prayers/Traits, five artillery profiles and four conflicting High Magic versions. Two genuine tables: weather and Thought Fog. Reading preserves printed Fourth Edition wording, including species-specific Overcasting. No live effects, profiles/templates or setting-only prose are added to global search.

GM shared options reuse all installed PC catalogues. Selecting Lustria controls profiles/templates only. Six castes appear in the template picker; nine marks appear in Customise. The book’s 15-template count includes both.

## Approved decisions and adaptations

The ten questions were answered on 10 October 2026. **Skinks and Chameleon Skinks remain NPC-only** by explicit user choice, superseding proposed playable allocations/resources. No PC Species, Fate/Fortune, PC mark costs or Skink random Career table is introduced. The approved p. 161 Messenger 89–92 / Boatman 93–94 correction is documented only; it does not create an active table.

- Little → Tiny retains printed Wounds until changed, then requires manual Wounds. Small uses core 2 × TB. Swarm uses its separate five-times-normal formula: Serpents of Sotek retain 45 Wounds.
- Core Size increases primary melee Damage. Extra Bite/Tail/Horns attacks retain printed Damage. Coatl’s sole Bite is primary. Ranged attacks are explicitly identified; printed Melee totals remain linked to primary attacks when supplied. Actual changes carry Legacy explanations.
- Stride → Sprinter; proposed Swamp-strider → Striding Gait (Wetland); ranked Grim → core unranked Grim; explicitly Talent-equivalent Acute Sense → core Sight/Hearing Talents; Magic Resistance 1 → unranked core Trait. Selective Legacy notes explain actual conversions.
- Old repeat Talents respect core limits, including Instinctive Diction one, Aethyric Attunement two and Luck three. Printed permanent Talent benefits are already in baseline scores and are not added twice.
- Slann explicitly select Colour Lores, with each matching Wind using the printed Channelling total and retaining its difference from WP after edits. No spells are generated; p. 123 counts are guidance. High Magic retains the shared definition without the Elf-only Blessed by Isha prerequisite. Qhaysh remains a separate Skill choice; printed Quaysh spelling is documented.
- Named Test Difficulties use core SL modifiers in implemented new spells/abilities. Other numeric situational bonuses remain printed descriptions. Emergency Teleportation, Contemplation, Palanquin, Slann Telepathy, Relic Priest and special abilities are reference effects, without live tracking. Relic Priest has no damaging melee attack. Palanquin Fly/Ward/cover apply while riding it.
- Four duplicate High Magic definitions remain separate Lustria reading references; existing High Elf creator definitions are unchanged. Mathlann prayers have distinct names to avoid collisions.

Spelling/heading fixes are untagged: Fleet Footed → Fleet-footed, Combate Aware → Combat Aware, Read/ Write → Read/Write, Warleader → War Leader, Resistance → Resistant, Flight → Fly, Tail Attack → Tail, Venomous → Venom and Hunger → Hungry. Sail uses the ungrouped core Skill. Compatible old-edition content is not automatically Legacy.

## Unavailable and deferred

Optional Clever and Mark of the Old Ones’ Leader are undefined in the supplied rules: visible explanations, never invented grants. Brainfluke’s **Aquatic** is also undefined here and in the supplied core. It remains visibly unresolved, with an early structured issue blocking export until the GM removes it; no assumed Amphibious replacement.

The optional pp. 192–193 Career table remains unavailable because of overlaps/gaps; four new Careers are manually selectable. Named characters, ships, colony/expedition management, live disease/combat, automated meditations, campaign progression and familiars remain outside scope. No missing prices, quantities or alternate armour construction are guessed. Giant Bat gains no invented Flight value.

App notes explain discrepancies before export. Compact GM sheets contain actual selected Traits/descriptions, never unselected optional suggestions or discrepancy notes.

## Maintenance and checks

Run `python scripts/build-lustria.py`, `python scripts/build-lustria-gm.py`, then `npm run build`. Both builders verify the PDF hash. The GM builder uses the reviewed generic inventory in `scripts/review/lustria-profiles.json` and bounded PDF ability text. Inventory fixes three extraction boundaries and the missing Troglodon body; named blocks are explicitly excluded. Regenerate catalogues/counts/inclusion/search reports instead of editing generated files.

Source operations live in `dist/gm/lustria.mjs`; shared magic access in `dist/lustria.mjs`. Validated template fields: `lustriaRole`, `lustriaPriest`, `naturalArmour`. Draft arrays `lustriaMarks` and `profileLores` participate in shared undo/redo and validated save/load. WIP migrations are not required.

Focused Node checks cover all profiles’ named Skills/Talents, Size/Damage/Tiny/Swarm, stacking/removing marks, eligibility, Priest Lore, Slann Wind totals/no free spells, unchanged duplicates, explicit magic access and unresolved Aquatic. Local Playwright covers PC selection/search and GM sharing/castes/marks/Slann on desktop and phone. Follow TESTING.md and keep README, AGENTS and generated reports current.
