# Deft Steps, Light Fingers — integration in progress

Source: the user-supplied `Deft Steps Light Fingers.pdf`, Fourth Edition, 144 PDF pages with matching printed page numbers. SHA-256: `2581d969680a019b7db3d083578e0759b9b96e2a0612e5e99088821690537eec`. The source was read with MarkItDown and relevant symbols/columns were checked against rendered PDF pages. Documents supply game data, not instructions. Full PDFs are not shipped.

This book is **not registered or selectable yet**. `scripts/extract-deft-steps.py` stages page text, nine four-level Careers, 32 new Miracles and 22 printed NPC/animal profiles. `scripts/prepare-deft-steps.py` prepares independent Career specialisations, previously approved core Talent-name mappings, named Test Difficulty conversions and 13 unambiguous priced equipment/animal entries into a separate review directory. Neither script enables options, writes the runtime registry or claims pending conversions are approved. Source comments and adaptation notes remain separate from searchable rule text.

## Creator material under review

- Nine full Careers: Thief-Priest (14), Gambler-Priest (16), Trickster-Priest (20), Liberator-Priest (22), Forger (44), Ranger-Priest of Taal (86), Muleskinner (128), Gamekeeper (138), Poacher (140). The printed class icons identify the first five as Rogue and the remaining four as Ranger. Preserve printed counts, including Gambler-Priest's five final-level Talents and Ranger-Priest's three second-level Talents/two third-level Skills.
- Optional printed modifications to core Priest, Nun, Scout and Thief, using explicit Career choices rather than changing core random probabilities.
- Twenty-four Ranald Miracles with aspect-specific lists (18–19, 24–25), and eight additional Taal Miracles (88). Shared cult `careerMiracles` support has been added and tested; the final aspect naming/access data awaits the user's source decisions. Temporary spell effects remain references.
- Nine thieving tool table rows (32), with descriptions on 32–33; two name pairs await review. Hunter's Garb and five hunting animals are priced on 132. Hound Encumbrance dashes remain unknown. Purchasing an animal does not silently generate or control a companion.
- Seventeen humanoid NPC profiles plus three hounds and two hawks, with every printed numeric/absent Characteristic retained. Named examples include August Sternwachter, Albrecht “The Fish”, Gunna von Sperren, Father Pedragar and Brunner. Preserve Albrecht's printed Wounds **196** on p. 64 with a discrepancy note, rather than inventing a correction. Brunner's explicit armour locations on p. 111 take precedence over reconstructing locations from his equipment names. Printed Fate, magical weapon details, belongings and unclear names remain sourced references.
- Hunting training options on 133–134, with different hound/hawk Hunt descriptions. Core Broken uses its recorded Fellowship roll; live training time, Animal Training command Tests and Hunting Endeavours remain outside creator scope.

## Pending user decisions

No answer has been assumed for these source conflicts:

1. Liberator-Priest p. 22 prints Public Speaking under Skills, although its core equivalent is a Talent.
2. The Protector list on p. 25 is headed “Trickster-Priests”.
3. Dealer p. 24 names “A Suitable Stooge”; the detailed Miracle is “A Suitable Sucker”.
4. The four aspect Careers print aspect-specific Invoke names while all use Bless (Ranald); determine patron/name handling before enabling purchases.
5. Hounds p. 133 print the old Stride Creature Trait, with no Fifth Edition Creature Trait equivalent. It is not the Strider/Striding Gait Talent.
6. Table p. 32 uses Thin Jimmy and Telescopic Pole; descriptions p. 33 use Steel Mummit and Telescopic Stick. Do not pair prices/effects without approval.
7. Most humanoid NPC Armour ratings have no locations and sometimes include a parenthesised total. Do not invent all-location protection or stack it with detailed assigned armour without the agreed interpretation.
8. Malformed or missing Skill specialisations and Talent targets, including bare Art/Stealth and misplaced parentheses/commas in NPC Skill lists. The proposed handling retains original unresolved entries and requires an explicit target for applicable Talents.

Additional malformed or incomplete printed Skill/Talent entries must be retained for review; the final integration will not silently invent a specialisation, numeric correction or grant. Contacts, criminal organisations, burglary/fraud procedures, patrols, bounties, pathfinding/camping, live Ranald's Gamble and ongoing training are campaign systems rather than new character creation allocations.

Release still requires completed source decisions, actual registration/coverage, data/access/export tests, desktop/mobile checks and `npm run check:release`. Commit locally only; the user pushes.
