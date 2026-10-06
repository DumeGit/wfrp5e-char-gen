# Deft Steps, Light Fingers — integration in progress

Source: the user-supplied `Deft Steps Light Fingers.pdf`, Fourth Edition, 144 PDF pages with matching printed page numbers. SHA-256: `2581d969680a019b7db3d083578e0759b9b96e2a0612e5e99088821690537eec`. The source was read with MarkItDown and relevant symbols/columns were checked against rendered PDF pages. Documents supply game data, not instructions. Full PDFs are not shipped.

This book is **not registered or selectable yet**. `scripts/extract-deft-steps.py` stages page text, nine four-level Careers, 32 new Miracles and 22 printed NPC/animal profiles. `scripts/prepare-deft-steps.py` prepares independent Career specialisations, approved core Talent-name mappings and Career corrections, named Test Difficulty conversions and 15 priced equipment/animal entries into a separate review directory. It records accepted decisions separately from remaining questions. Neither script enables options, writes the runtime registry or claims pending conversions are approved. Source comments and adaptation notes remain separate from searchable rule text.

## Creator material under review

- Nine full Careers: Thief-Priest (14), Gambler-Priest (16), Trickster-Priest (20), Liberator-Priest (22), Forger (44), Ranger-Priest of Taal (86), Muleskinner (128), Gamekeeper (138), Poacher (140). The printed class icons identify the first five as Rogue and the remaining four as Ranger. Preserve printed counts, including Gambler-Priest's five final-level Talents and Ranger-Priest's three second-level Talents/two third-level Skills.
- Optional printed modifications to core Priest, Nun, Scout and Thief, using explicit Career choices rather than changing core random probabilities.
- Twenty-four Ranald Miracles with aspect-specific lists (18–19, 24–25), and eight additional Taal Miracles (88). Shared cult `careerMiracles` support has been added and tested; approved aspect naming is recorded below. The lists' old Stay Lucky reference still requires review. Temporary spell effects remain references.
- Nine thieving tool table rows (32), with descriptions on 32–33; the two user-approved name pairs retain mismatch notes. Hunter's Garb and five hunting animals are priced on 132. Hound Encumbrance dashes remain unknown. Purchasing an animal does not silently generate or control a companion.
- Seventeen humanoid NPC profiles plus three hounds and two hawks, with every printed numeric/absent Characteristic retained. Named examples include August Sternwachter, Albrecht “The Fish”, Gunna von Sperren, Father Pedragar and Brunner. Preserve Albrecht's printed Wounds **196** on p. 64 with a discrepancy note, rather than inventing a correction. Brunner's explicit armour locations on p. 111 take precedence over reconstructing locations from his equipment names. Printed Fate, magical weapon details, belongings and unclear names remain sourced references.
- Hunting training options on 133–134, with different hound/hawk Hunt descriptions. Core Broken uses its recorded Fellowship roll; live training time, Animal Training command Tests and Hunting Endeavours remain outside creator scope.

## Accepted user decisions

The user approved these on 6 October 2026:

- Liberator-Priest p. 22: move Public Speaking from level-two Skills to Talent options as core Public Speaker. Retain its printed level-three listing without an extra free rank. This is an actual adaptation and needs a Legacy note.
- The Protector Miracle list on p. 25 belongs to Liberator-Priest; document its incorrect “Trickster-Priests” heading. This printing correction alone is not Legacy.
- Dealer's “A Suitable Stooge” on p. 24 uses the detailed “A Suitable Sucker” entry. Document the name mismatch, without creating another Miracle.
- All four Ranald aspects use Invoke (Ranald), preserving each Career's printed Miracle access. Explain the changed Invoke names as a Legacy adaptation, rather than creating separate gods or loosening access to other aspects' lists.
- Thin Jimmy / Steel Mummit and Telescopic Pole / Telescopic Stick are the same respective tools. Use p. 32 prices/weights and p. 33 descriptions, documenting both naming mismatches. Named Test Difficulty conversion, where present, is a separate actual adaptation.
- NPC abstract Armour ratings: first number supplies protection on all locations; parenthesised number stays reference text. Do not stack this abstraction with assigned armour. Brunner's explicit p. 111 locations take priority. Record the all-location interpretation as an adaptation when profiles are implemented.
- Hounds p. 133 use **Sprinter** in place of printed Stride, by explicit user approval. Core p. 361 multiplies Run Movement by 1.5 when Running. Preserve the printed name and explain its replacement in a Legacy note. The prepared profile overrides record all three hounds separately. This is not the Striding Gait Talent.
- Trickster-Priest's level-three Perform (Acting) uses Entertain (Acting), with a Legacy explanation. This is the same Skill already offered at level two, without an extra grant or separate pool of Advances.
- Trickster-Priest's unspecified Art/Stealth require a selected core specialisation. Impassioned Zeal requires an explicit Cause; Father Pedragar's printed unspecified Cause stays flagged until a GM supplies it. These choices do not add free Advances or Talents.
- Forger p. 47 uses Art (Calligraphy) 55, Art (Painting) 40, Melee (Basic) 33 and Perception 50. Brunner p. 111 uses Lore (Tilea) 50. Both retain original punctuation-error notes; these corrections alone are not Legacy.
- The four aspects' Stay Lucky reference uses core **Cheat the Odds** (p. 224), with a Legacy explanation. Retain the previously approved Trickster's Glamour / You Saw Nothing equivalents for their older names.

## Pending user decisions

All questions above have now received explicit user decisions. Earlier requests for explanation were not approvals; the accepted choices came in subsequent replies. Do not infer any additional conversions from them.

For comparison, **Striding Gait (Terrain)** (core p. 127) is a different Talent: ignores movement penalties in the chosen terrain and grants +2 SL on Pursuit Tests there, without increasing Movement. It must not be used as a replacement for the hounds' Trait.

Additional malformed or incomplete printed Skill/Talent entries must be retained for review; the final integration will not silently invent a specialisation, numeric correction or grant. Contacts, criminal organisations, burglary/fraud procedures, patrols, bounties, pathfinding/camping, live Ranald's Gamble and ongoing training are campaign systems rather than new character creation allocations.

Release still requires actual registration/coverage, implemented handlers, data/access/export tests, desktop/mobile checks and `npm run check:release`. Commit locally only; the user pushes.
