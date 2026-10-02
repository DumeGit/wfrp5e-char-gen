# WFRP Character Ledger

A private, browser-based Fifth Edition character generator built from the supplied rulebook. No rules from another edition or external source are used.

## Use

Open the published private Site, or serve `dist` locally:

```powershell
python -m http.server 8047 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8047/`. The browser saves the current draft on that device. **Save character** downloads a JSON file for later import with **Load character**. Drafts on the local preview and published Site belong to separate browser origins; use Save/Load to transfer them.

The eight creation steps cover Species, all 64 Careers, Characteristics, free Skills, Talents, Gear & money, optional XP spending, and review/export. The default budget is 1,000 XP, editable by the user. Experience offers standard +5 Advances (p. 191) and optional +1 Advances (Appendix II, p. 364) for Characteristics and Skills. After a partial +1 band, the same Characteristic or Skill must reach a multiple of five before a +5 purchase. The most recent ledger entry can be undone from the top of Experience. Spending XP locks foundational choices; undo purchases or clear advancement before changing those choices.

The Gear & money step includes a searchable shop for 242 fixed-price Trappings from the supplied Consumer Guide (pp. 301, 303, 307–316). It converts the rolled purse using 1 GC = 20 shillings = 240 pennies, blocks overspending, supports removing a purchase, and adds purchases to equipment and PDF export. It assumes purchases are made during character creation, when Availability Tests are waived (p. 296). Items with variable or unlisted prices, including the magical items whose listed figures are black-market buyer prices (p. 315), require the GM and are not offered at an invented purchase price. Bought items do not earn creation tracker boxes (p. 36).

The character folio has compact, collapsible Skills, Talents, Magic and Gear lists, also available under View character on phones. Skills show their current total; Talents include free and purchased ranks; magic shows known names; Gear merges duplicate items and displays quantities. Unrolled quantities show `?`. Explicit containers, ammunition and counted packs are unpacked for display; ambiguous descriptive Trappings remain named bundles. Lists update after purchases and undo. Expanded sections are remembered on the device independently of character saves.

Large desktop screens use a 1,700 px maximum workspace and a 350–380 px folio. XP and coin sit side by side; summary spacing is compact. The folio has no internal scrollbar. It stays sticky on desktop only when its full contents fit between the viewport's 24 px top and bottom margins; otherwise it flows with the page. A ResizeObserver updates this after sections expand, character changes redraw the folio, or the viewport changes. Tablet and phone folios always use normal page flow. Browser checks cover 1920 × 1080, a short desktop viewport, 1024 px tablets, and 390 px phones, including expanded lists and the return to sticky positioning after collapse.

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
- The p. 36 random Career bonus is capped at the number of distinct listed level-two Trappings. Seven Careers list only one, so accepting the first roll requires one selection and earns one box. The book has no explicit single-option exception; this resolves the otherwise impossible selection without inventing a second Trapping.
- Leather Breastplate uses Leather Jerkin statistics, as explicitly agreed by the user (pp. 96, 307).
- Navigation uses Initiative; the sheet's preprinted Int label is corrected (p. 112).
- Sturdy's conflicting formulas are selectable: p. 40 doubles SB + TB; p. 127 doubles only SB. They are never stacked.
- Species naming variants Acute Sight, Entertain (Sing), and Resistance are normalized to the corresponding full entries, with notes in the record.
- The printed 850 XP price for the +45 Skill Advance is retained (p. 191).
- Individual +1 Advances use the optional Appendix II table (p. 364). Five +1 Advances in the same eligible Career Skill or Characteristic earn one tracker box; each +5 Career Advance earns one box. Appendix II does not explicitly define the tracker interaction, so the five-point grouping follows the user's chosen interpretation. Existing saved +1 ledgers are recalculated on load. The Linguistics Talent's fixed 50 XP Language Advance price remains fixed (p. 121).
- Status follows the highest Career level with a possessed Trapping (pp. 44, 141). A universal Dagger meets a generic Weapon (Any) requirement; possession does not itself earn another advancement box.
- A recorded acquisition from the **next** Career level earns one box (p. 43); the player must state how it was obtained. This is not a free equipment purchase or automatic coin deduction.
- Common consumer-table weights are included. Descriptive, unlisted, or unresolved container contents remain explicit exceptions; final carried Encumbrance is left blank in the sheet when it cannot be established. Worn apparel assumptions are labeled. The displayed Movement and Agility are intrinsic scores; apply any load penalties from p. 299 at play time.
- Situational Talent and magic effects remain in their reference descriptions. The generator does not automatically apply temporary combat effects.
- Dooming, party ambitions, downtime availability, non-career Training/Unusual Learning, and Career changes require GM/campaign decisions. They are not fabricated by the generator.

## Verification

The folio interface shows readiness from the existing creation validator, links unresolved choices to their steps, and uses a compact step selector and expandable character summary on phones. XP budgets have an explicit Update action; Career trackers show the existing 10/12/14-box segments. Keyboard tab navigation, focus, scroll position and expanded rules are preserved when purchases redraw the screen. Presentation labels and issue routing live in `dist/ui.mjs`; character rules and the saved-character format are unchanged.

```powershell
npm install
npm test
```

The tests cover all 64 Careers, every d100 Career outcome for every Species, reference resolution, XP prices and limits, a full 1,000 XP Soldier regression, independent Fate/Fortune bonuses, random sampling, the magic catalog, and editable PDF fields including Priest overflow. Browser checks cover the guided creation flow, a real random-roll record, XP purchase, PDF download, responsive layout, and valid/invalid WebMCP calls.

The verification URL query `?verify=1` uses a separate draft key, so browser checks do not replace the user's open draft. It changes no game rules.

Creation has eight navigation steps, with separate Talents and Gear & money screens and six creation readiness indicators. Ability and spell issues route to Talents; wealth, item quantities and purchase issues route to Gear & money. Existing saved drafts and imported character files migrate their old Experience/Review step once using additive navigation metadata; character rules, XP, rolls and equipment remain unchanged. All 41 checks pass, including migration and issue routing. Browser checks cover separate completion states, spell choices, item purchase/removal, repair links, Review/export readiness and mobile navigation.

Characteristic point inputs reserve the same level-badge space in every cell. Experience Talents separate learnable choices from learned Talents and unavailable alternatives. Disabled purchases name the restriction; a rule restriction is retained even if the XP budget is also insufficient. The normal one-Bless and one-Invoke limits cite pp. 116 and 121. Bless and Invoke must match the established patron (pp. 40, 116, 121); the rejection names the required Talent and deity. Browser checks verify aligned inputs on desktop and mobile, no page overflow at 320/390 pixels, and Talent purchase/undo. All 39 automated checks pass, including matching and mismatched Invoke purchases for all ten deities.

All 46 automated checks pass, including folio Skill totals, Talent purchase/undo counts, automatic Blessings, duplicate gear, container quantities and ammunition. Browser checks confirm live Talent updates, persistence after reload, known magic names, rolled gear quantities and the phone View character panel without horizontal overflow. The folio action button uses a dedicated dark hover background and light text to preserve contrast.

## Hosting

The existing private Sites project is recorded in `.openai/hosting.json`. Reuse that project ID. There is no server database or account system in the application; Sites controls access. Do not put the full rulebook PDF or credentials into the published assets.

Dependency: pdf-lib 1.17.1 (MIT), bundled locally for PDF export.
