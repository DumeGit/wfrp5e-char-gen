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

The earlier NPC runtime was removed. The newly authorised GM workshop currently supports the Fifth Edition core only; this supplement’s NPC/animal profiles, abstract Armour interpretations, hound Trait replacements, training and named NPC equipment remain deferred and unpublished. Earlier NPC decisions remain in Git history and are not implemented features of the fresh workshop. Animal prices and acquisition references remain in the PC shop.

Contacts, criminal organisations, burglary/fraud, patrols, bounties, pathfinding/camping, live Ranald’s Gamble and ongoing training remain outside character creation. Old-core page references identify Fourth Edition rather than unrelated Fifth Edition pages. Do not infer further conversions from a generic continue message.

Rebuild player data with `scripts/extract-deft-steps.py` and `scripts/prepare-deft-steps.py`, then `scripts/install-deft-steps.py`. The installer requires an empty pending-decision list, retains reviewed coverage and registers the base pack plus six variants; it does not verify or publish. Run `npm run check:release`, with separate desktop/mobile and representative PDF visual checks. Player regressions cover all nine creation paths, Miracle restrictions, Cause limits, variant switching, prices and selective Legacy/search behavior. Commit locally and report the hash; pushing requires explicit approval for that change.
