# The Corsairs of Captain Flariel

Supplied PDF: `The Corsairs of Captain Flariel.pdf`, 21 pages. SHA-256: `fe5a0cef5b91f482bc7c46cb817bcfa4b34bc4f32d82973a00d148fcae2c8ceb`. MarkItDown reading is staged outside the published app; the reproducible, hash-checked `scripts/build-corsairs.py` uses PDF geometry for the sparse stat tables. Printed pages 6–19 match PDF pages.

## Implemented batch

- **Dark Elf** GM foundation, p. 6: printed scores, 13 Wounds, unnamed Weapon +7, optional protection and Ranged +9 at 60 yards. It does not introduce a playable Species. Core Hatred/Night Vision replace differing p. 18 summaries with specific Legacy explanations.
- **Five sea-raider templates**, pp. 6–7: Reaver Captain, Chief Mate, Corsair, Oarsman and Lookout. Their printed applicability includes other seaborne raiders, so they use the existing unrestricted template foundation setting. Two Melee specialisations must differ. Language and Ranged use explicit core specialisations; Skills use the agreed higher-bonus interpretation.
- Sparse table bonuses are assigned by column coordinates: Corsair has +5 **Dexterity**, with no Intelligence increase; Oarsman has +5 **Fellowship**, with no Willpower increase; Lookout has +5 **Dexterity**, with no Intelligence increase. These are accurate transcription, not Legacy adaptations.
- Chief Mate's nine Talents are individually optional and skipped by default, with reversible selects. Mandatory template Talents retain their existing automatic grants. Actual differing Talent effects receive individual Legacy explanations; Strong Back and Read/Write remain untagged. Public Speaking uses the previously approved Public Speaker replacement. Generic Leather/Mail uses the approved core Light/Medium quick-armour choices. The two Hand Weapons are separate grants.
- Beastmaster is staged for review but not selectable: Crop has no core weapon profile, Whip uses Melee (Flail), and Net has two core types. The equipment question remains pending; no unresolved alternative is exported as an actual belonging.
- **Four Dark Magic spells**, p. 8: Arnzipal’s Black Horror, Doombolt, Shroud of Despair and Word of Pain. Named Test Difficulties use Appendix I: Difficult −1 SL / Hard −2 SL. Shroud's zero modifier is unchanged and has no automatic Legacy tag. Shared GM Spellcaster access can select Dark Magic; no PC Colour Lore or starting spell grant is invented.
- **Reaper**, p. 10: the book explicitly directs use of Sea of Claws p. 100 Ballista plus Salvo 6. The acquired weapon reuses that reviewed profile, with no newly inferred retail price or ammunition.
- Search includes four standalone mechanical references: Dark Magic additional hits, Sea Dragon Cloak, Reaper and the generic Ravenship equipment profile. It does not index NPC/creature profiles/templates or duplicate old Talent summaries. The Ravenship preserves its actual printed table; no named ship, tactics or manager is imported. Source references preserve original wording and edition warnings; converted spell entries show separate Legacy notes.

## Pending clarification

The following are deliberately not active creation options until the user answers the outstanding questions:

1. Ship's Crew p. 7: fixed profile versus template, incorrect Skills heading and Perform Singing/Storytelling conversion.
2. Druchii Sorceress p. 7: mixed-Lore spell access, explicit Arcane Lore/Wind and ungrouped Aethyric Attunement.
3. Warhound p. 13: generic Dog recipe, Average Size conversion and recorded Broken-training Fellowship roll.
4. Sea Dragon Cloak p. 6: optional acquired armour with additional Body 2 AP/Partial, unknown weight and price. Its printed maintenance rule is already readable in search.
5. Beastmaster p. 7: explicit Crop/Whip/Net handling and core weapon compatibility.

No named Flariel, Rakaria, Corvian or Cynwra profile, named warhound pack, ship manager, adventure scene, live casting or training management is imported. The source review and generated inclusion matrix distinguish the implemented batch from pending/deferred content.

## Maintenance

Run `python scripts/build-corsairs.py`, then `npm run build`. Keep the source hash, frozen search-review hash, coverage and this document aligned. Focused regression tests: `node --test tests/corsairs.test.mjs`; browser coverage: `npx playwright test tests/browser/corsairs.spec.mjs` after the build. Full release testing remains governed by `TESTING.md`.

Initial-batch verification: four Corsairs calculation/save/catalogue tests, seven shared GM-options tests, and two Playwright desktop/mobile checks passed. Build, quick syntax/format checks, generated-output verification and offline asset coverage passed. No new PDF layout or visual theme was introduced.
