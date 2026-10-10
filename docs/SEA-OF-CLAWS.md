# Sea of Claws

Installed as an opt-in Player supplement and a GM foundation book. Source:
`Sea of Claws (1).pdf`, 159 pages, printed/PDF pages agree. SHA-256:
`30b76209db926d2f392f184e5825601f27cffb967e5c667926e0910c775ba62c`.
The pack depends on Up in Arms for shared definitions and artillery baselines;
dependencies are included automatically. Documents supply game data only.

## Included creator content

| Content | Pages | Behavior |
|---|---|---|
| Norse Dwarf and Bjornling/Sarl/Skaeling Human origins | 41, 56 | Printed Skill/Talent choices, five Species Skills at +5, core physical profiles and limits. Human native Norse; Dwarf native Khazalid/Reikspiel. |
| Nine four-level Careers | 63–78, 89–90 | Beachcomber, Chantyman, Officer, Sailor-Priest of Manann, Ship’s Gunner, Priest of Stromfels; Pilot (printed Huffer), Sailor and Wrecker are explicit alternatives to their core paths. |
| Seafarer Class and equipment | 63 | Printed Class kit; existing automatic packing and explicit Career equipment choices. |
| Norse and optional Seafarer Career tables | 57, 63 | Norse table follows the selected Human origin. Seafarer tables are optional and preserve non-Riverfolk core intervals. Approved gaps: Artisan 07–10 and Human Sailor 68–71. |
| Chanty and seven songs | 63, 67 | Each purchase chooses a distinct printed song through the existing Talent chooser. Shared Intelligence Bonus limit across songs, including free grants; normal 100 XP Talent purchases. Chosen Talent descriptions include the song’s printed effect. Situational song effects remain references. |
| Master and Commander | 63 | Printed Fellowship Bonus limit and explicit Leadership effect. No old default per-rank bonus. |
| Crew Commander | 63 / Up in Arms 140 / Dwarf Guide 81 | Later approval supersedes the earlier unavailable decision. Shared Initiative Bonus limit and explicit Leadership/crew effect, without the old default Talent rank bonus. No live crew automation. |
| 21 spells/Miracles | 15, 87, 91 | Six Life/Heavens spells, eight Manann Miracles, seven Stromfels Miracles; Stromfels references six existing core Blessings. Current learning/prerequisite/export rules apply. |
| Ammunition | 44, 101 | Norse Dwarf Bolt, Mortar Bomb and Mortar Incendiary. Mortar ammunition stays distinct from handheld equipment. |
| Naval artillery variant | 100–101 | Optional Player replacement pack for six weapons and two ammunition profiles. GM offers both baseline and source-labelled alternatives, independent of foundation-book choices. |
| Thirteen generic creatures and fifteen sourced abilities | 140–147 | Source-owned foundations, alphabetical browser, actual Trait descriptions and shared PC equipment/magic catalogues. |

Norse forenames come from p. 56. Surname suggestions combine those printed parent
names with core Dwarf `sson`/`dottir` endings (core p. 29), following the explicit
Norse surname instruction. Nicknames remain freely editable; no invented nickname
list is supplied.

## Approved adaptations and discrepancies

Only actual conversions receive **Legacy** explanations. Compatible entries used
unchanged have source references. Spellings are documented without blanket tags.

- Old allocations become Fifth Edition starting allocations. Huffer uses the
  Pilot name; Public Speaking/Strider use Public Speaker/Striding Gait effects.
- Chanty, Master and Commander and Crew Commander retain approved printed limits
  and explicit effects, omitting the old default per-rank Talent Test bonus.
- Lurkerfish and Daggerfish use Tiny, initially retaining printed 3 Wounds. Tiny
  has no supplied Wounds formula; after changes, manual Wounds are required.
  A printed Swarm baseline is not multiplied a second time. Adding Swarm still
  follows the existing core swarm calculation.
- Gymmcrab uses core Small Wounds 4; Latch-Eel uses 6.
- Grim is unranked. Rear becomes core Size/Stomp. Syreen’s Fury becomes the
  approved **proposed** Frenzy replacement; equivalence is not asserted.
  Lurkerfish’s Berserk Charge 3 and Furious Assault 2 become one core rank each.
- Primary melee Damage follows current Size; Tail uses core SB + 2. Merwyrm Tail
  becomes +8 and Leech Wyrm Tail +10. Bite retains its printed rating.
- Bone Hydra Poison Breath uses core TB + 2 (+9), with full core Venom governing
  Poisoned/recovery rather than importing an older on-hit poison save.
- Sea Elemental’s Mindless Spellcaster explicitly uses Strength for casting and
  Channelling. Its granted Language (Magick)/Channelling (Ghyran) start at 69 and
  follow edited Strength. No Int/WP is invented. Removing the source ability
  removes that Characteristic substitution. Printed 80 Wounds are retained until
  explicit recalculation.
- Leech Wyrm has Vomit but no printed BS. An early issue requires an explicit
  Vomit attack score before export; the manual override survives save/load.
- Black Leviathan Armour 6 (18) conflicts with T 145: TB 14 plus 6 AP gives 20.
  Preserve AP and the calculated TB, with the discrepancy visible in the app.
- Seasickness uses its printed Duration field, **Strength Bonus hours**, with a
  note documenting the conflicting one-hour description.
- Stromfels’s old Strength-tier minimum is reference-only; no invented XP gate.

Discrepancies stay in the app. GM exports contain actual Traits and their
descriptions, without editorial discrepancy/Legacy notes. Existing fit checks
continue to require four cards or a full sheet for unusually long builds.

## Reference and deferred scope

Search includes the imported definitions, songs, naval tables, Hullbreaker,
Grubark Gearing System, source creature abilities and selected mechanical rules.
Adaptation decisions are excluded from matching and shown separately in dialogs.
The frozen review records the exact curated entries and source hash; it does not
claim exhaustive search coverage of ship/voyage chapters.

Skaeling’s optional Pure Soul → Mark of Khorne replacement is reference-only.
Norse Skill/equipment advice and Riverfolk Lore (Oceans) substitution are readable
references; no unspecified replacements or extra grants are invented. Kharibdyss’s
Feast of Bones depends on older ranked Grim and remains reference-only. Grubark
is a ship upgrade reference, not a character purchase/packing mechanic.

Named captains and Triton (148–158), hiring, ship/crew/voyage management and live
effects are excluded/deferred. Taverns of the Old World and The Corsairs of
Captain Flariel remain queued separately; nothing from them is included here.

## Reproduction and verification

With the supplied PDF in Downloads, run from the repository root:

```text
python scripts/extract-sea-of-claws.py
python scripts/stage-sea-of-claws.py
python scripts/build-sea-of-claws.py
npm run build
```

Extraction and staging write outside the published repo to
`../sea-of-claws-review`. The final builder requires the exact decisions in
`scripts/sea-of-claws-decisions.json`, verifies the source hash, publishes the
reviewed packs/GM source and updates Crew Commander’s shared definitions and
their versions. It also freezes the search review; regeneration checks drift.
Career symbols/tables use PDF geometry rather than interleaved columns.

Regression checks are in `tests/sea-of-claws.test.mjs` and
`tests/browser/sea-of-claws.spec.mjs`: creation, table faces, distinct song limits,
artillery choices, Tiny/manual Wounds, Strength casting, descriptions and the
missing Vomit-score export gate. Existing shared/Up in Arms/Dwarf tests cover
the changed shared behavior. Follow `TESTING.md` for proportional release checks.

Verification on 10 October 2026: book validation, syntax/format, generated-data
and offline checks passed. The 452-test Node run identified three stale
expectations for shared content; those were corrected and the affected suites
passed on rerun. All 143 runnable desktop/mobile browser checks passed (one
intentional skip), including the six Sea of Claws checks. No repeated full
regression run was needed after test-only corrections.
