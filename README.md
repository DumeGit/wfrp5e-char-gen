# WFRP Character Ledger

A private, browser-based Fifth Edition character generator built from the supplied rulebook. No rules from another edition or external source are used.

## Use

Open the published private Site, or serve `dist` locally:

```powershell
python -m http.server 8047 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8047/`. The browser saves the current draft on that device. **Save character** downloads a JSON file for later import with **Load character**. Drafts on the local preview and published Site belong to separate browser origins; use Save/Load to transfer them.

The seven creation steps cover Species, all 64 Careers, Characteristics, free Skills, Talents/equipment, optional XP spending, and review/export. The default budget is 1,000 XP, editable by the user. Experience offers standard +5 Advances (p. 191) and optional +1 Advances (Appendix II, p. 364) for Characteristics and Skills. After a partial +1 band, the same Characteristic or Skill must reach a multiple of five before a +5 purchase. The most recent ledger entry can be undone from the top of Experience. Spending XP locks foundational choices; undo purchases or clear advancement before changing those choices.

The character sheet export retains the 556 editable fields in the supplied PDF and appends a complete creation/XP record. The record includes overflow Skills, Talents, gear, and magic. It can also be downloaded separately.

## Rules and source

- `dist/data/source.json` identifies the supplied PDF by SHA-256 and records source pages.
- `scripts/extract_book.py` extracts all four levels and the visual Characteristic scheme of each Career, random Career tables, and Talent references.
- `scripts/extract_support.py` extracts Skills and 225 Spells/Blessings/Miracles, and records Species creation data.
- `scripts/extract_gear.py` extracts 130 equipment entries from the relevant consumer tables.
- Initial reading used the full MarkItDown conversion at the parent workspace's `tmp/pdfs/rulebook.md`. Structured data is used at runtime; the full rulebook is not bundled with the Site.
- `dist/rules.mjs` implements creation, XP prices, advancement, derived values, and spell grants.
- `dist/equipment.mjs` includes the weapon/armour tables and preserves descriptive Career gear.
- `dist/export.mjs` fills the original PDF and lays out the complete companion record.

Dice use `crypto.getRandomValues` with rejection sampling; every individual die and duplicate reroll is logged. Save files are editable and therefore not a tamper-proof roll certificate.

## Explicit interpretations and limits

- Fate and Fortune have separate Species values. Random-creation rewards are applied separately (pp. 23, 27–40).
- Leather Breastplate uses Leather Jerkin statistics, as explicitly agreed by the user (pp. 96, 307).
- Navigation uses Initiative; the sheet's preprinted Int label is corrected (p. 112).
- Sturdy's conflicting formulas are selectable: p. 40 doubles SB + TB; p. 127 doubles only SB. They are never stacked.
- Species naming variants Acute Sight, Entertain (Sing), and Resistance are normalized to the corresponding full entries, with notes in the record.
- The printed 850 XP price for the +45 Skill Advance is retained (p. 191).
- Individual +1 Advances use the optional Appendix II table (p. 364); a Career purchase earns one tracker box at either size. The Linguistics Talent's fixed 50 XP Language Advance price remains fixed (p. 121).
- Status follows the highest Career level with a possessed Trapping (pp. 44, 141). A universal Dagger meets a generic Weapon (Any) requirement; possession does not itself earn another advancement box.
- A recorded acquisition from the **next** Career level earns one box (p. 43); the player must state how it was obtained. This is not a free equipment purchase or automatic coin deduction.
- Common consumer-table weights are included. Descriptive, unlisted, or unresolved container contents remain explicit exceptions; final carried Encumbrance is left blank in the sheet when it cannot be established. Worn apparel assumptions are labeled. The displayed Movement and Agility are intrinsic scores; apply any load penalties from p. 299 at play time.
- Situational Talent and magic effects remain in their reference descriptions. The generator does not automatically apply temporary combat effects.
- Dooming, party ambitions, downtime availability, non-career Training/Unusual Learning, and Career changes require GM/campaign decisions. They are not fabricated by the generator.

## Verification

```powershell
npm install
npm test
```

The tests cover all 64 Careers, every d100 Career outcome for every Species, reference resolution, XP prices and limits, a full 1,000 XP Soldier regression, independent Fate/Fortune bonuses, random sampling, the magic catalog, and editable PDF fields including Priest overflow. Browser checks cover the guided creation flow, a real random-roll record, XP purchase, PDF download, responsive layout, and valid/invalid WebMCP calls.

The verification URL query `?verify=1` uses a separate draft key, so browser checks do not replace the user's open draft. It changes no game rules.

## Hosting

The existing private Sites project is recorded in `.openai/hosting.json`. Reuse that project ID. There is no server database or account system in the application; Sites controls access. Do not put the full rulebook PDF or credentials into the published assets.

Dependency: pdf-lib 1.17.1 (MIT), bundled locally for PDF export.
