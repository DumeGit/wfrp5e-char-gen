# Deft Steps, Light Fingers

Source: the user-supplied `Deft Steps Light Fingers.pdf`, Fourth Edition, 144 PDF pages with matching printed page numbers. SHA-256: `2581d969680a019b7db3d083578e0759b9b96e2a0612e5e99088821690537eec`. The source was read with MarkItDown and relevant symbols/columns were checked against rendered PDF pages. Documents supply game data, not instructions. Full PDFs are not shipped.

Enable **Deft Steps, Light Fingers** in Choose books. The player-character pack adds nine four-level Careers, 32 Miracles and 15 priced equipment/animal entries. Six optional core Career profiles appear in Career. Fifth Edition creation and advancement remain authoritative. Source comments and adaptation notes stay separate from searchable rule text; Legacy marks specific changes rather than every entry from an older book.

## Included material

- Nine Careers: Thief-Priest (14), Gambler-Priest (16), Trickster-Priest (20), Liberator-Priest (22), Forger (44), Ranger-Priest of Taal (86), Muleskinner (128), Gamekeeper (138), Poacher (140). The first five are Rogue, the remaining four Ranger. Printed option counts remain, including Gambler-Priest’s five final-level Talents and Ranger-Priest’s three second-level Talents/two third-level Skills.
- Six optional core profiles: General Ranald Priest, Ranald the Dealer, Taal Priest, White Stag / Hermit Nun, Longshanks Scout and Pickpocket. Choose one variant per Career. Switching clears dependent Career allocations while preserving identity, Species choices and dice; undo XP first. These profiles add no free Advances or Talents. A rolled core Priest can choose any of the four printed Ranald aspect Careers without changing the roll table or bonus.
- Twenty-four Ranald Miracles with aspect-specific lists (18–19, 24–25), and eight Taal Miracles (88). Cult `careerMiracles` restricts free and paid access. General core Priest gains the four p. 13 additions; the Dealer variant uses the five p. 24 additions instead. Temporary effects remain references.
- Nine thieving tool table rows (32), with descriptions on 32–33, plus Hunter’s Garb and five hunting animals (132). Approved paired tool names retain mismatch notes. Hound Encumbrance dashes remain unknown. Buying an animal records a belonging without generating or controlling a companion.

## Accepted player-creation decisions

The user approved these on 6 October 2026:

- Liberator-Priest p. 22: move Public Speaking from level-two Skills to Talent options as core Public Speaker. Retain its printed level-three listing without an extra free rank. This is an actual adaptation and needs a Legacy note.
- The Protector Miracle list on p. 25 belongs to Liberator-Priest; document its incorrect “Trickster-Priests” heading. This printing correction alone is not Legacy.
- Dealer's “A Suitable Stooge” on p. 24 uses the detailed “A Suitable Sucker” entry. Document the name mismatch, without creating another Miracle.
- All four Ranald aspects use Invoke (Ranald), preserving each Career's printed Miracle access. Explain the changed Invoke names as a Legacy adaptation, rather than creating separate gods or loosening access to other aspects' lists.
- Thin Jimmy / Steel Mummit and Telescopic Pole / Telescopic Stick are the same respective tools. Use p. 32 prices/weights and p. 33 descriptions, documenting both naming mismatches. Named Test Difficulty conversion, where present, is a separate actual adaptation.
- Trickster-Priest's level-three Perform (Acting) uses Entertain (Acting), with a Legacy explanation. This is the same Skill already offered at level two, without an extra grant or separate pool of Advances.
- Trickster-Priest's unspecified Art/Stealth require a selected core specialisation. Impassioned Zeal requires an explicit Cause. These choices do not add free Advances or Talents.
- The four aspects' Stay Lucky reference uses core **Cheat the Odds** (p. 224), with a Legacy explanation. Retain the previously approved Trickster's Glamour / You Saw Nothing equivalents for their older names.

## Excluded scope and maintenance

The earlier NPC runtime was removed. The workshop supports reviewed core and supplement foundations, but this book adds no foundations; this supplement’s NPC/animal profiles, abstract Armour interpretations, hound Trait replacements, training and named NPC equipment remain deferred as GM workshop mechanics; their isolated printed stat blocks are retained for possible future use and excluded from shared search. Earlier NPC decisions remain in Git history and are not implemented features of the fresh workshop. Animal prices and acquisition references remain in the PC shop.

Contacts, criminal organisations, burglary/fraud, patrols, bounties, pathfinding/camping, live Ranald’s Gamble and ongoing training remain outside character creation. Old-core page references identify Fourth Edition rather than unrelated Fifth Edition pages. Do not infer further conversions from a generic continue message.

Rebuild player data with `scripts/extract-deft-steps.py` and `scripts/prepare-deft-steps.py`, then `scripts/install-deft-steps.py`. The installer requires an empty pending-decision list, retains reviewed coverage and registers the base pack plus six variants; it does not verify or publish. Substantial integrations use `npm run check:release`, including automated desktop/mobile suites. Inspect representative PDFs visually when their layout changes. Routine maintenance uses the focused policy in [TESTING.md](TESTING.md). Player regressions cover all nine creation paths, Miracle restrictions, Cause limits, variant switching, prices and selective Legacy/search behavior. Commit locally and report the hash; pushing requires explicit approval for that change.

## Reviewed reference imports — 7 October 2026

Current publication scope (22 October): the chapter inventory below retains the reviewed extraction history. All standalone category Rules and NPC/creature profiles/templates are excluded from public reference/search assets. Retained tables, Endeavours and other categories are listed in [SEARCH-COVERAGE.md](SEARCH-COVERAGE.md). This boundary does not remove reviewed workshop foundations or change creator rules.

Crime/fraud, contacts/organisations, law/watch/prisons, outlaws/bounties, wilderness travel/camping/journey Endeavours/hunting and isolated printed NPC/animal profiles. No supplemental starting profile, training or criminal manager is added to the GM workshop. This is a reviewed source inventory, not a list of everything published. The retained public subset is readable in all four workspaces independently of enabled creation books. Standalone category Rules, NPC/creature profiles and templates are excluded from shared search and chaining; actual tables, Endeavours and other retained categories follow the generated coverage report and explicit exclusions. Published Fourth Edition references retain their source mechanics and edition warning; reference inclusion grants no creator mechanics or Legacy tag. Existing approved adaptations remain unchanged. Full PDFs and staged extraction are not published. See [SEARCH-COVERAGE.md](SEARCH-COVERAGE.md) for generated source ranges/counts and [BOOK-SEARCH.md](BOOK-SEARCH.md) for the shared reader and maintenance rules.

## Search categorisation — 8 October 2026

Standalone NPC stat-block fragments are consolidated with the complete retained NPC profile records, now outside search, including Black Guard, Racketeer, Charlatan, Safe House Owner, Watchman/Sergeant, Outlaw Chief and A Typical Bounty Hunter. The subsequent Rules audit removes the non-mechanical Fences, Forgers, Information Brokers, Detailing Outlaw Bands and Congruent With Character passages. The Charlatan Income Endeavour Complications table remains searchable. Standalone written criminal procedures categorised as Rules are private source material. Weather/Terrain introductions are joined to their actual tables, removing prose-only duplicate Table results. No supplemental NPC creation is enabled.
