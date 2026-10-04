# WFRP Character Ledger

A browser-based Fifth Edition character generator built from the supplied books. The core book and opt-in **Up in Arms**, **Archives of the Empire I, II and III**, **Winds of Magic**, **Rough Nights & Hard Days**, **High Elf Player’s Guide**, **Dwarf Player’s Guide** and **Blood and Bramble** are installed. All ten books together offer 117 Career profiles, 487 spell/Blessing/Miracle profiles, 17 learnable rituals, 24 optional Cants, ten Sword-dancing techniques and 71 rune knowledge entries. Same-name Career alternatives remain explicit choices. Compatibility decisions and exclusions are documented separately for each supplement.

**Legacy** tags identify Fourth Edition material adapted to this Fifth Edition creator, including both Player’s Guides. Tags follow choices into the folio, review, XP ledger and PDF/creation record. Core definitions remain untagged unless a Legacy option changes their acquisition or use. Details and the full book audit: [docs/LEGACY.md](docs/LEGACY.md).

Enable **Rough Nights & Hard Days** in Origins → Books & options for Gnomes, their complete Career table, names/appearance, Suffuse with Ulgu and Evawn/Mabyn/Ringil. Gnomes use the approved proposed 2 Fate / 2 Fortune adaptation with a visible warning, five Species Skills and core Small Wounds (2 × TB, plus Hardy). Suffuse has a separate warning and situational effects remain references. The optional Species table retains its printed probabilities independently of Archives II. Details: [docs/ROUGH-NIGHTS.md](docs/ROUGH-NIGHTS.md).

Enable **Winds of Magic** in Origins → Books & options to add twelve Careers, Augury/Psychometry, 136 new spell profiles, ritual memorisation, wizard robes and equipment references. Mundane Alchemist includes the approved Lore (Alchemy) specialisation and four-spell Petty Magic grant cap. Staff commissioning, crafting, familiars and live casting remain deferred. Sources, adaptations and scope: [docs/WINDS-OF-MAGIC.md](docs/WINDS-OF-MAGIC.md).

Contributor instructions and the user's project decisions are in [AGENTS.md](AGENTS.md). The book integration format and review workflow are in [docs/BOOKS.md](docs/BOOKS.md).

Enable **Dwarf Player’s Guide** for eleven regional profiles and automatic regional Career tables, ten Careers, optional Career levels and equipment/weapon Skill swaps, weighted names, Longbeard, new Talents and rune knowledge. Guide/Archives I Karak Ranger profiles remain explicit alternatives. Learning runes does not grant enchanted equipment; gromril/heirlooms are references rather than ordinary shop purchases. Approved conversions, unavailable entries and deferred campaign rules: [docs/DWARF-GUIDE.md](docs/DWARF-GUIDE.md).

Enable **Blood and Bramble** for twelve new Hedgecraft and twelve Witchcraft spells with source descriptions, existing Fifth Edition learning rules and a qualified 5-penny ingredient shop entry. Godspakt uses the approved detailed You/You profile; ingredient quantities/weights remain unspecified and live spell effects remain references. Details: [docs/BLOOD-BRAMBLE.md](docs/BLOOD-BRAMBLE.md).

## Use

Open [the public Vercel app](https://wfrp5e-char-gen-dist.vercel.app), or serve `dist` locally:

```powershell
python -m http.server 8047 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8047/`. The browser saves the current draft on that device. **Save character** downloads a JSON file for later import with **Load character**. Drafts on the local preview and published app belong to separate browser origins; use Save/Load to transfer them.

The eight creation steps cover Species, all 64 core Careers (117 profiles with all supplements enabled), Characteristics, free Skills, Talents, Gear & money, optional XP spending, and review/export. The default base budget is 1,000 XP, editable by the user; retaining an optional Archives II star-sign roll adds 25 XP separately. Experience offers standard +5 Advances (p. 191) and optional +1 Advances (Appendix II, p. 364) for Characteristics and Skills. After a partial +1 band, the same Characteristic or Skill must reach a multiple of five before a +5 purchase. The most recent ledger entry can be undone from the top of Experience. Spending XP locks foundational choices; undo purchases or clear advancement before changing those choices. Optional Cant selections remain editable.

The Gear & money step includes a searchable shop for 253 fixed-price Trappings from the supplied Consumer Guide (pp. 301, 303, 307–316). Career-granted cash is added to the purse. It converts starting funds using 1 GC = 20 shillings = 240 pennies, blocks overspending, supports removing a purchase, and adds purchases to equipment and PDF export. It assumes purchases are made during character creation, when Availability Tests are waived (p. 296). Items with variable or unlisted prices, including the magical items whose listed figures are black-market buyer prices (p. 315), require the GM and are not offered at an invented purchase price. Bought items do not earn creation tracker boxes (p. 36).

The character folio has compact, collapsible Skills, Talents, Magic and Gear lists, also available under View character on phones. Skills show their current total; Talents include free and purchased ranks; magic shows known names; Gear merges duplicate items and displays quantities. Unrolled quantities show `?`. Explicit containers, ammunition and counted packs are unpacked for display; ambiguous descriptive Trappings remain named bundles. Lists update after purchases and undo. Expanded sections are remembered on the device independently of character saves.

Large desktop screens use a 1,700 px maximum workspace and a 350–380 px folio. XP and coin sit side by side; summary spacing is compact. The desktop folio stays sticky with 24 px top and bottom viewport margins. An internal scrollbar appears only when its contents exceed the available height, allowing comparison alongside the current creation step. Its scroll position is preserved across redraws. Tablet and phone folios use normal page flow. Browser checks cover 1920 × 1080 with collapsed and expanded lists, sticky positioning while the main page scrolls, and a 390 px phone without an internal folio scrollbar.

The character sheet export retains the 556 editable fields in the supplied PDF and appends a complete creation/XP record. The record includes overflow Skills, Talents, gear, and magic. It can also be downloaded separately.

## Rules and source

### Archives III

Adds Priest of Handrich, Priest of Solkan and Priestess of Rhya, 18 Miracles, nine new Hedgecraft spell names, five Altdorf origins and optional Cants. Old Faith offers six chosen Blessings with Bless and one additional with Invoke; extra purchases use core Miracle prices, excluding the six Bless grants from the count by user decision. Eastender chooses Criminal or one random Talent. The animal-doctor Hedge Witch is chosen in Career → Hedge Witch variant, available with Archives III enabled. Switching clears Career-dependent choices while keeping identity, Species choices and rolls; undo or clear XP advancement first. Cants unlock free at 1/3/6 Colour Lore spells and appear in the folio, review and exported record. Alternative armour is skipped; familiars, Enterprises and live magic remain deferred. Full sources and decisions: [docs/ARCHIVES-III.md](docs/ARCHIVES-III.md).

### Book-pack foundation

`dist/books.mjs` loads the registry at `dist/data/books/index.json`, resolves dependencies, assembles selected books and validates content/references. The core pack reuses the existing extracted catalogs, with equipment profiles, shop rows, configuration and explicit roll tables in `dist/data/books/core/`. Talent effects/limits, specialisations, patrons, Arcane Lores, Class kits and carrying capacities feed the actual engine from this configuration.

**Origins → Books & options** lists registered books; supplements and alternate-rule variants are opt-in. Career-specific variants are selected in the Career section. Changing books starts a new character. Added Careers do not alter Career probabilities; extra printed d100 tables remain selectable. By user instruction, enabling Archives II makes its p. 18 Species table the default, allowing Ogre on 98; the core Species table remains selectable. When a Species has no core Career table and only one enabled printed Career table, that table is used automatically; Ogres use Archives II p. 18 without another setup step. Conflicting names, missing references, invalid tables, unreviewed Fourth Edition conversions and unsupported settings are rejected. Rule/content replacements require an explicitly selected variant and a documented target/reason. This foundation does not automatically implement novel mechanics: a supplied book may still require a new handler.

Content receives namespaced identities and book/page sources. UI references and the companion PDF include sources, book versions/hashes, selected tables and conversion/variant decisions. Preprinted PDF page fields remain numeric because they are too small for book titles. Current character files/drafts use version 2 and record the selected book versions. Old WIP characters are not migrated, as requested; the app starts a fresh draft in a new storage key, and rejects unsupported files instead of silently reinterpreting them.

`npm run check:books` validates every registered pack with its dependencies, including disabled packs. `npm run build` runs this check before generating the offline worker; all installed book files are cached for offline selection. Synthetic supplement/variant fixtures live only in tests and are not published.

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
- A recorded acquisition from the **next** Career level earns one box (p. 43); the player must state how it was obtained. This is not a free equipment purchase or automatic coin deduction. An acquisition can link to an existing item, granting the box without duplicating inventory. Removing a linked purchase requires undoing its acquisition first.
- Common consumer-table weights are included. Descriptive, unlisted, or unresolved container contents remain explicit exceptions; final carried Encumbrance is left blank in the sheet when it cannot be established. Worn apparel assumptions are labeled. The folio and exported current Movement, Agility and Agility-based Skills include the starting-load penalties on p. 299 when the load is resolved. Creation and XP tables identify intrinsic scores separately.
- Situational Talent and magic effects remain in their reference descriptions. The generator does not automatically apply temporary combat effects.
- The creator offers the printed Dooming table and book-listed names, eyes, hair and Dwarf clans as optional suggestions. Every random suggestion is logged. Party ambitions, downtime availability, non-career Training/Unusual Learning and Career changes remain GM/campaign decisions outside this creator.

## Verification

The folio interface shows readiness from the existing creation validator, links unresolved choices to their steps, and uses a compact step selector and expandable character summary on phones. XP budgets have an explicit Update action; Career trackers show the existing 10/12/14-box segments. Keyboard tab navigation, focus, scroll position and expanded rules are preserved when purchases redraw the screen. Presentation labels and issue routing live in `dist/ui.mjs`; character rules and the saved-character format are unchanged.

```powershell
npm install
npm test
```

The tests cover all 64 core Careers and all 15 Up in Arms Careers, every d100 Career outcome for every Species, reference resolution, XP prices and limits, a full 1,000 XP Soldier regression, independent Fate/Fortune bonuses, random sampling, the magic catalog, and editable PDF fields including Priest overflow. Browser checks cover the guided creation flow, a real random-roll record, XP purchase, PDF download, responsive layout, and valid/invalid WebMCP calls.

The verification URL query `?verify=1` uses a separate draft key, so browser checks do not replace the user's open draft. It changes no game rules.

Creation has eight navigation steps, with separate Talents and Gear & money screens and six creation readiness indicators. Ability and spell issues route to Talents; wealth, item quantities and purchase issues route to Gear & money. Existing saved drafts and imported character files migrate their old Experience/Review step once using additive navigation metadata; character rules, XP, rolls and equipment remain unchanged. All 41 checks pass, including migration and issue routing. Browser checks cover separate completion states, spell choices, item purchase/removal, repair links, Review/export readiness and mobile navigation.

Characteristic point inputs reserve the same level-badge space in every cell. Experience Talents separate learnable choices from learned Talents and unavailable alternatives. Disabled purchases name the restriction; a rule restriction is retained even if the XP budget is also insufficient. The normal one-Bless and one-Invoke limits cite pp. 116 and 121. Bless and Invoke must match the established patron (pp. 40, 116, 121); the rejection names the required Talent and deity. Browser checks verify aligned inputs on desktop and mobile, no page overflow at 320/390 pixels, and Talent purchase/undo. All 39 automated checks pass, including matching and mismatched Invoke purchases for all ten deities.

All 46 automated checks pass, including folio Skill totals, Talent purchase/undo counts, automatic Blessings, duplicate gear, container quantities and ammunition. Browser checks confirm live Talent updates, persistence after reload, known magic names, rolled gear quantities and the phone View character panel without horizontal overflow. The folio action button uses a dedicated dark hover background and light text to preserve contrast.

## Hosting

The GitHub repository contains this `character-generator` directory and automatically deploys to Vercel. The root `vercel.json` builds the PWA assets with `npm run build` and serves `dist`. A headers-only configuration in `dist` also supports projects configured to serve that folder directly. The manifest and service worker are revalidated so new deployments can be detected. `.openai/hosting.json` records the earlier Sites hosting setup; it is not used for the current Vercel deployment. There is no server database or account system. Do not put the full rulebook PDF or credentials into the published assets.

## Install and use offline

The app is an installable PWA with a home-screen icon and standalone window. On Android Chrome, use **Install app** or the browser's installation menu. On iPhone/iPad, open it in Safari, choose **Share → Add to Home Screen**, and enable **Open as Web App** if offered. The Install app button shows instructions when the browser does not provide a native installation prompt. It disappears when the app is running as an installed app.

Open the app online first and wait for **Available offline · PDF exports included** at the bottom of the page. The initial download includes the supplied character-sheet PDF (about 12.5 MB), all rule data, and the PDF library. Character creation, XP purchases and PDF/record exports then work without a connection. Character drafts remain on the current device; use Save character for backups and Load character to move them between browsers, devices or installation contexts. There is no cloud sync.

Updates download in the background and offer **Update now** or **Later**. Update now saves the draft before refreshing. Offline files are installed together; an incomplete download does not replace the previous working version. Run `npm run build` after changing files in `dist` when preparing a manual deployment. The build generates a content-versioned service worker from `scripts/service-worker.template.js`.

The PWA checks cover offline navigation and asset delivery, the complete PDF template, update activation, cache cleanup and failed-download recovery. A browser check with the local server stopped confirmed that the app reopened, XP purchases and undo worked, and the character PDF was generated. A real service-worker update preserved the test character. Mobile installation instructions were checked at 390 px without horizontal overflow.

Dependency: pdf-lib 1.17.1 (MIT), bundled locally for PDF export.

## Book audit fixes and creator equipment

The October 2026 rules audit is implemented within character-creation scope. Talent repeat limits are explicit, Craftsman and Seasoned Traveller unlock their allowed non-career Skills, and elves can learn additional Arcane Lores after eight spells in the previous Lore, up to WP Bonus. Generic Arcane spells retain separate Lore identities. Missing book-listed Language and Talent specialisations are included, Animal Training extraction fragments are removed, and Mimic, Disarm, Doomed and the Verena Miracle duration are corrected. `scripts/apply-book-corrections.py` runs after either extractor to preserve those PDF-verified corrections.

Career coin Trappings are spendable. Weapon choices, hyphenated aliases, counted weapons, Hook, melee/ranged Net, Bolas restrictions and permanent weapon Talent adjustments resolve to the printed profiles. The PDF fills both left and right armour fields and records the equipment effects. Old invalid Talent purchases are flagged for correction without rewriting the user's XP history.

The shop includes the four missing poisons, optional Quick Armour and small/large instrument and tent variants. New purchases use the printed price in one action. Adding item Qualities or Flaws is deferred; previously saved purchases retain their paid prices and craftsmanship details. No haggling, selling, hireling management or campaign transactions were added.

Equipment uses automatic creation defaults: armour and wearable carrying items are worn, weapons are equipped, and other belongings fill available containers up to capacity. The book's explicitly packed contents are kept together first; larger remaining belongings are packed before smaller ones. Overflow remains carried separately and counts toward personal load. Containers contribute only their worn/carried Enc; their contents are not counted twice. Animals and vehicles remain external Trappings. Coin weight is ignored at the user's request, with this creator convention stated in the UI and export. The Gear screen has a compact read-only summary instead of packing, passenger, weight or craftsmanship controls. Old manual settings remain in save files for compatibility but do not influence the automatic totals. Unknown published weights remain explicit, and leave final Enc blank in the PDF. New purchases have stable identities; legacy purchase IDs migrate without changing XP, money or rolls.

Stealth, helmet Perception, Lore-specific Casting/Channelling and overburdening effects are shown in Gear and Review and recorded in exports. Chamon/Ghur exemptions and Practical/Unreliable are included. Quick Armour is worn automatically and replaces detailed armour protection and penalties. Inherent printed weapon and armour Qualities remain in their profiles. Previously purchased Practical/Unreliable items retain their effects; there is no creator interface for adding these modifiers.

Regression coverage includes the audit cases, complete 1,000 XP Soldier creation, all 64 Careers, editable PDF fields, load thresholds, layered armour, automatic packing/overflow, cash grants, spell-Lore identity, legacy saves, and complete PWA offline assets. Campaign XP awards, career changes, downtime, conditions, spent Fortune and other character-manager features remain deferred.


Origins integrates first name and surname/epithet directly into the main form. Each can be typed, selected from the Species’ printed suggestions, or rolled independently; a full-name roll is also available. Name parts update the folio and saved/exported full name immediately. Old full names remain unchanged until a part is edited, and multiword custom names persist as separate parts. Eye colour, hair colour and Dwarf clan use the same editable book-list and roll controls. Rolls choose uniformly from printed lists and retain their page references; they are suggestions, not invented rulebook roll tables.


## Archives of the Empire I

Enable **Archives of the Empire: Volume I** in Origins → Books & options to add four Careers, twelve Halfling clan profiles, Mootland origin, three Eonir kindreds, fourteen weapons and four ammunition entries. It works with core alone or with Up in Arms. Fifth Edition creation and advancement remain authoritative; reviewed user decisions, source pages, exclusions and limitations are documented in [docs/ARCHIVES-I.md](docs/ARCHIVES-I.md).

Cityborn uses High Elf Careers while retaining Wood Elf starting benefits. Younger receives Youngblood as an additional kindred Talent. Mootland access and Thorncobble Noble Blood requirements are checked before export; Badger Rider's gaming-table approval requirement is explained. Lip Reading's erroneous Skill entry remains visibly unavailable. Existing core equipment is unchanged; when both supplements are enabled the Up in Arms Precision Shot and Powder price takes precedence, as agreed. Exports include the complete source and conversion record.

## Archives of the Empire II

Enable **Archives of the Empire: Volume II** in Origins → Books & options to add Ogres, Maneater, Rhinox Herder and Ogre Butcher, the printed Ogre equipment and seven Great Maw spells. Optional star signs are in Characteristics; ascendant and celestial mansions are background only. The approved Fifth Edition adaptations and deferred campaign material are documented in [docs/ARCHIVES-II.md](docs/ARCHIVES-II.md).

Ogres start with 1 Fate and 2 Fortune, five Skills at +5 and Large size. Wounds and carrying capacity include their size rules; core carrying Talents apply before capacity is doubled. Language (Magick) uses Toughness in the app, folio and sheet. Ordinary equipment uses the approved sizing categories; native Ogre profiles retain their printed values. Unclear prices, weights and non-Ogre use require GM review rather than invented statistics. Restricted Ogre choices require a GM acknowledgement before export.

Names support Imperial lists or the two traditional d100 elements. Eyes and hair use the printed 2d10 probabilities. Retaining the first star-sign roll adds at most 25 XP, consistently across purchases, undo and exports. The detailed Witchling table on p. 39 governs its outcome; duplicate and incompatible Talents follow core limits. The export includes source pages, adaptation notes, the chart and the complete creation/XP record. All 153 automated checks pass, including all book combinations and every Ogre Career die face.


Enable **High Elf Player’s Guide** for eleven regional profiles and automatic Career tables, six Careers (Mage levels 1–4), 59 new spells, Sword-dancing techniques, Elder creation and Blood of Aenarion. Ancestry discounts include ritual memorisation by the explicit labelled interpretation. Printed training prerequisites, core Skill mappings, qualified gear and unresolved Ithiltaen protection are recorded; Archmage and priest branches are deferred. Details: [docs/HIGH-ELF.md](docs/HIGH-ELF.md).
