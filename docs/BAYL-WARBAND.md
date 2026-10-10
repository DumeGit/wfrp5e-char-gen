# The Warband of Bayl of Many Eyes

Supplied Fourth Edition PDF (2022), SHA-256 `bf5839ff86537d1d4aee619d4d4095904b58de8d86295383d5695703114b4a6e`. MarkItDown extraction is outside the public app. Profile and template tables on printed pp. 8–9 were checked visually against the PDF, including blank Characteristic columns.

## Reviewed scope and current implementation

The book contains two generic foundations (Chaos Warrior of Nurgle and Chaos Steed), seven Chaos Warrior advancement templates, and the Mark of Nurgle. Four named characters, their unique mutations, setting prose, warband disposition and adventure encounters remain excluded. No new PC Species, Careers, priced equipment or player creation allocations are introduced.

Included: **Chaos Warrior of Nurgle** and **Chaos Steed** (p. 8), plus **Chosen**, **Chaos Knight**, **Forsaken** (p. 8), **Exalted Hero**, **Chaos Lord**, **Chaos Sorcerer** and **Chaos Sorcerer Lord** (p. 9). The book is opt-in for these GM foundations/templates. All Skills, Talents and equipment reuse the installed creator catalogue. Profiles/templates stay outside shared reference search.

Three mechanical references are available in global search: Applying Chaos Warrior Advancement Templates (p. 3), Chaos Sorcerer Spell Lists and Chaos Sorcerers and Armour (p. 9). These retain printed source wording/meaning and the existing Fourth Edition reference warning. No live casting, magic armour protection, magic item statistics or career XP development is invented.

## Core definitions and explicit choices

- Mark of Nurgle is already defined by core Mark of Chaos (Nurgle), p. 359. The profile's T55 includes its +10 Toughness; Etiquette (Followers of Nurgle) is recorded once. No duplicate Trait definition or automatic second Toughness bonus is added.
- The distinct printed Nurgle profile has no separate Skill totals. Its Weapon +8 uses printed WS55; core Chaos Warrior Skill advances are not silently copied into it.
- Current core Animosity, Distracting, Disease and Talent effects replace older summary descriptions on p. 19. Spellings Rough Rider, Warleader and Unshakable resolve to Roughrider, War Leader and Unshakeable. Combat Reflexes, Resolute, Inspiring and War Leader have explicitly different effects in p. 19’s summary and use their current core effects with focused Legacy notes. Animosity’s changed SL scope and Distracting’s −20 → −2 SL conversion also carry Legacy notes. Spelling changes and unchanged statistics do not receive blanket Legacy tags.
- Full Plate Armour uses the existing core Heavy Armour quick profile (5 AP). Shield, Lance and Hand Weapon are shared core profiles. Weapon alternatives require explicit core profiles; no arbitrary Polearm/Two-Handed Weapon is chosen.
- Two Melee choices must be distinct. Skills follow the established GM higher-of-existing/template-bonus interpretation, consistent with the supplement's worked Melee totals, rather than stacking old baseline advances twice.
- Mounted Exalted Hero/Chaos Lord Ride +20 is optional, with an explicit specialisation. The Chaos Steed is a separate creature sheet, not a hidden second profile inside the rider. Selecting No mount removes the grant. Removing/switching a template clears its choices; shared undo restores the complete draft.
- Templates can apply to basic foundations, as stated on p. 3; they do not invent restrictions to only Chaos Warriors. Absent or negative Characteristics still require explicit GM repair under existing validation.

## Approved conversions (10 October 2026)

- Chaos Steed uses core **Sprinter** for printed Stride. Core Large Size changes its primary Hooves and Horns from +8 to **+13**, with a Legacy explanation. It is one primary attack, without an extra Horns Free Attack. WS35 already includes War training. Its printed 24 Wounds remain until an explicit build change; optional Barding provides 3 AP using mount coverage.
- Forsaken retains **Fearless (Everything)**, as an explicit exceptional adaptation approved by the user, with a Legacy explanation. Its negative Characteristic adjustments must not manufacture absent/negative scores. Its unspecified mutations remain explicit GM selections rather than invented random quantities.
- Chaos Sorcerers choose **Fire, Death, Metal or Shadows** and the matching Channelling Wind. Petty spell counts are exactly **3 / 6**; additional Arcane/Lore spell counts are **0–6 / 0–12** for Sorcerer/Lord. A Chaos god's spells need both its matching **Mark of Chaos** and **Chaos Magic** Talent. Selecting a different Colour Lore does not permit spells from all four colours.
- Sorcerer Lord's printed **Instinctive Diction 2** becomes **one core rank**, with a Legacy explanation of the removed second rank. Descriptive robes, armour, Magic Item and optional mount do not acquire invented statistics or hidden casting immunity.

## Engineering and verification

`python scripts/build-bayl.py` rebuilds reviewed source records, the pack manifest and source audit; `npm run build` regenerates the startup/search libraries, registry counts, GM inventory and offline worker. The importer defaults to the complete approved content, without conversion flags. GM compilation discovers the registered source automatically. Template support adds optional Skill slots, grouped weapon alternatives and validated minimum/maximum spell groups; previous exact spell groups remain exact.

Focused Node and local desktop/phone browser tests cover the imported scope, no duplicated Mark/War bonuses, Large Damage, actual Trait descriptions, distinct Skill/gear choices, optional mounting, Forsaken's exceptional Talent, Sorcerer Lore/Wind/Mark requirements, spell-count bounds, core rank limits, reversible removal, source provenance and invalid schema rejection.

Release verification (10 October 2026): the full 436-check Node run and successful affected-file reruns cover the final rules/data. Desktop and phone Chromium scenarios passed (133 total; one installation-gated scenario skipped), including the new parameter, optional-package and Lore flows. Registry generation, syntax/format, offline coverage and whitespace checks passed. Initial failures were stale book-total assertions; these now verify registry identities or relevant book options. The Chaos Steed barding regression also verifies all mount hit locations. No push or deployment was performed.
