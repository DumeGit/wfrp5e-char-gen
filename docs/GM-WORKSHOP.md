# Bestiary Workshop

This is the fresh NPC & creature creator authorised in October 2026. It shares the Black Banner presentation system with player creation, but has its own entry point (`dist/gm.html`), draft and calculated result. The removed NPC runtime has not been restored. Only reviewed core-book extraction was reused and recompiled. The core is always enabled. Up in Arms is independently opt-in for its reviewed mount profiles and training. Archives I independently enables approved equipment, Skill choices and Youngblood without adding foundations. Archives II independently adds Rhinox and Typical Sister, shared Ogre equipment/Skills/Vice and Great Maw magic. Archives III independently enables reviewed prayers, Hedgecraft and Skill/Talent choices without adding foundations. Other supplements, Career development, hirelings, XP purchases and campaign management remain outside this release.

## Workflow

Workshop status notifications clear after 4.5 seconds. They use the shared empty-text visibility convention, accept no pointer events and sit above the fixed phone action bar with safe-area clearance. Persistent issues remain in the issue panel; they are not hidden by notification expiry.

The creator switch is available in the desktop rail and above the phone page selector. Player and GM drafts remain independent. Creature creation uses the supplied Fifth Edition core and separately enabled, reviewed GM supplements. Enable Up in Arms, Archives I, Archives II or Archives III in the compact Creation books fieldset on Starting profile; player book choices are independent. The masthead reference search is the same all-book library as the player creator, independently of enabled creation books.

The workshop banner uses original generated undead-army artwork inspired by the user's image, with a moonlit gothic fortress and skeleton ranks. Its compact WebP is cached offline; CSS crops it and supplies title contrast without changing shared banner height or interaction. The player creator keeps its own art. Source, generation prompt and encoding details: [design-assets/bestiary](../design-assets/bestiary/README.md).

The user selected **A — Moonlit Vellum** from the standalone [colour studies](../design-previews/bestiary-colours.html). The production workshop now uses its storm-blue shell, bone parchment, cobalt actions and muted gold. `dist/gm.html` selects the centrally maintained theme in `design-tokens.css`; shared dialogs, search and mobile controls inherit it. Player creation keeps its original palette. Historical studies remain static without draft or export effects. See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) and [DESIGN-PREVIEWS.md](DESIGN-PREVIEWS.md).

1. **Starting profile:** search/filter 49 core profiles plus two optional Up in Arms mounts and Archives II’s Rhinox/Typical Sister, sorted alphabetically; preview the complete block, then apply it. Printed scores, absent values, Skills, attacks, Wounds and Toughness Bonus remain intact. Name, appearance, purpose, motivation and manner are optional. Changing the foundation replaces this GM build, with undo available.
2. **Customise:** preview one of seven templates before applying it. Replacements clear template choices and selected extra magic, while retaining explicit GM edits, Traits and equipment. Required alternatives are immediately visible above three compact tabs: Characteristics; Traits; Skills & Talents. Size and derived-value overrides are explicit. Creature Traits use their full core definitions; optional profile suggestions do not grant themselves. Training, Corruption choices and recorded dice appear when relevant. Skill edits are final scores. Talents show ranks and permanent effects; situational effects stay as references.
3. **Equipment & magic:** printed attacks/defences are included, optional kit is explicit, and equipment from enabled GM books can be added without a PC shopping budget. Shield AP stays conditional. Magic follows the chosen Lore or patron; Blessed/Bless permits Blessings, Miracles/Invoke permits Miracles. Spellcaster templates enforce their printed optional spell-count limits. There are no PC free spell allocations or XP prices.
4. **Review & export:** the same calculated result drives review, folio and PDF. Unresolved choices are shown on every page, with links to the exact control and visible focus. Errors block PDF export; source warnings do not. Source discrepancies stay in the app. The PDF is a compact stat block with all current attacks, defences, Skills, Talent ranks, Traits, magic, Trappings, Corruption and personality. Private notes are included only when explicitly enabled. **Print A4 table cards** opens a temporary batch with six cards (two columns/three rows) or four cards (two columns/two rows) per page. Add the current build, import multiple current-format GM drafts locally, duplicate cards, or remove entries. The batch survives closing the dialog within this page session; it is not a campaign roster and is not persisted across reloads. All entries use the same calculated result and must resolve their issues before printing. Cards list scores, attacks, AP, Skills, Talent ranks, Trait ratings/descriptions, spell names/CN, Trappings, Corruption names and optional personality/notes. Actual Traits use their brief printed profile descriptions; added or changed Traits without a matching brief use the full core definition. Unselected optional and removed Traits never appear. Other ability descriptions and spell parameters remain in the app/full sheet. Text is measured before export, stays at least 7.5 pt, and overflow blocks export with a suggestion to use four cards or the full sheet. Empty slots stay blank; larger batches paginate. PDFs use white paper, greyscale ink and cut borders.

On desktop the folio stays alongside the page and scrolls internally if needed. Medium screens use two columns and put the folio beneath the editor; phones use page flow, a page selector and a fixed status/stat-block/review strip. Editing/search does not replace the active input. Native dialogs, keyboard tab navigation, explicit labels and reduced-motion styling are retained.

Template previews show Characteristic adjustment chips, separate Skill/Talent rows with aligned bonuses/ranks, explicit choice counts and expandable long alternative lists. Caster previews also show their Petty/Lore spell limits. Sections stack on phones; source, Wounds recalculation and replacement/undo guidance remain visible. The view uses compiled template fields, without changing grants or application behavior.

The template card leads Customise, above the tabs. Choose template sits beneath its heading as a primary action; once selected, the card names the template and offers Change template plus a secondary Remove template. The primary action fills the available row on phones, with 44px touch controls. Template selection remains optional. Desktop and simulated 390×844 browser checks verified opening the picker, applying Soldier, changing/removing it and returning to the prominent empty-state action without horizontal overflow. `npm run check:release` passed all 328 tests and offline coverage; no browser warnings/errors were recorded.

Template-preview and hover follow-up (7 October 2026): inspected Spellcaster and Spellcaster Lord previews on desktop, expandable Channelling choices and the stacked 390×844 layout without horizontal overflow; applied Soldier successfully. Confirmed opaque primary fills in GM/player main flows and the player's dark hover fill/light foreground. Shared active navigation uses the same opaque base. No GM browser warnings/errors were recorded. `npm run check:release` passed all 328 tests and offline coverage. Real phone hardware was not tested.

PDF typography uses selective emphasis: table-card section labels are bold, with values and descriptions in regular type. Actual Trait names/ratings are bold with their descriptions in regular type in both formats; full-sheet attack, spell, Corruption and personality labels are also bold. Both exports measure and draw mixed-weight text with the same embedded fonts; the card fit check accounts for bold widths before export.

Six cards per page is the default each time the print dialog opens. Four cards is an explicit larger-layout choice; it does not become the next session's default.

## Source decisions and calculations

- Individual variation (p. 318): printed Characteristic −10 + recorded 2d10; rerolls replace the previous base value. Movement is not rolled. Dice use the shared cryptographic rejection-sampling function. Save files contain imported history, not independently verified randomness.
- Templates (pp. 353–354): one template applies to the baseline. Alternative Skill slots need distinct choices. The user approved using the higher of the printed Skill bonus and template bonus; the app explains this interpretation and the worked-example discrepancies. Explicit GM Skill totals override the result.
- Size (pp. 360–361): each step changes S/T by 10 and Ag by −5. Five defined Wounds formulae are automated; Tiny needs a manual value. Only primary melee Damage receives the Size bonus. Printed profiles already include their bonuses.
- Giant Spider (p. 361): Small → Large gives S35/T45/Ag25, W26, Fangs +8 and Bite +6. The user chose the general Size rule over the worked example's Fangs +5. The conflict is shown in source notes.
- Orc (p. 337): retain printed T30/TB4. Once changing its calculations, require an explicit printed/calculated/manual Toughness Bonus decision. Other reviewed profile conflicts remain in their source notes.
- Dragon (p. 330): the user approved linking printed **Tracking 70** to **Track** for recalculation, retaining the naming mismatch in its source note. This is a scoped spelling correction, not a Legacy conversion.
- Venom (p. 363): the full Trait definition wins over conflicting short profile summaries. Wounds cause Poisoned; the Difficulty applies to recovery.
- Ogre (p. 324): Belligerent, Infected and Tracker appear under a printed Trappings heading; the user approved presenting them as suggested optional Traits.
- Trained (p. 363): Broken adds a recorded 2d10 to Fellowship, starting at zero if the printed value is absent; War adds WS10; Guard grants Territorial. Other training effects are references for play.
- Construct substitutes SB for WP Bonus in Wounds and has absent Int/WP/Fel when newly added. Swarm gains WS10, uses five times the normal creature's Wounds and ignores chosen Size adjustments; the normal creature's underlying profile remains the baseline. Hardy adds TB before the applicable Wounds multiplier.
- Explicit permanent Talent benefits and numeric Corruption table adjustments feed the calculated result. Other printed effects remain visible references; the GM can make an explicit score/Trait adjustment rather than the app inventing a value. Mark of Tzeentch requires a recorded count and alternating Mental/Physical choices. Corruption rolls use pp. 189–190.
- Quick Armour replaces detailed armour; shields remain conditional. Listed natural protection remains separate. Printed optional armour is never equipped without selection. Weapon quantity records ownership, not extra attacks.
- Source spelling/table corrections and documented Fifth Edition core ambiguities do not receive Legacy simply because the user chose an interpretation. Up in Arms mounts have selective Legacy metadata for the actual Size Damage and Stride conversions; unchanged printed scores are not separately tagged.

## Engineering and future books

| File | Responsibility |
| --- | --- |
| `dist/gm/sources/core.json` | Reviewed extraction with PDF checksum, printed page, source sections and explicit notes; source data only |
| `dist/gm/sources/up-in-arms.json` | Two reviewed mount profiles and Shock Cavalry training; explicit conversions and exclusions |
| `dist/gm/books.mjs` | Independent book selection, catalogue filtering, source labels and cached per-draft rules |
| `dist/gm/content.mjs` | Validates and compiles source records, scoped naming corrections, profile-owned row identities and supported template choices |
| `dist/gm/data.json` | Generated runtime catalogue; never edit directly |
| `dist/gm/model.mjs` | Independent draft validation, genuine rolls and one calculated result with structured issues |
| `dist/gm/views.mjs`, `controls.mjs`, `sheet.mjs` | Compact workflow, safe shared controls and stat-block presentation |
| `dist/gm/references.mjs` | Thin adapter for the shared all-book reference reader |
| `dist/gm/pdf.mjs` | Full stat-block PDF using the shared result; excludes source warnings/history |
| `dist/gm/trait-descriptions.mjs` | Source-derived descriptions of actual Traits for the shared calculated result; brief printed summaries with full-definition fallback |
| `dist/gm/pdf-text.mjs` | Shared mixed-weight text wrapping and drawing using exact font measurements |
| `dist/gm/print.mjs`, `printing.mjs` | Measured six/four-per-A4 card layout and local temporary print batch |
| `dist/gm/app.mjs` | Boot, independent storage, undo, dialogs and events; stable text editing |
| `dist/gm/style.css` | Responsive workshop layout using shared semantic design tokens |

PC startup imports only the small shared creator-switch module; it does not fetch or execute GM content/runtime. Entering the GM page loads the generated book bundle and GM catalogue, assembling its independent enabled GM books through a cached rules resolver. GM saves have their own `wfrp-gm` type, schema 2 (`spellLores` and optional `cants`), enabled GM books, core version and generated content fingerprint; player saves, unknown profiles, malformed dice and unsupported selections are rejected. Undo restores a build while retaining recorded dice history. Local storage failure prompts file backup rather than claiming a save succeeded.

The build validates the original book registry first, then compiles GM data and generates [GM-CONTENT.md](GM-CONTENT.md). GM counts are separate from player catalogue counts. The core coverage inventory records the implemented workshop and deferred Career development. Future supplements require explicit GM source records, provenance, availability/precedence decisions, handlers for new mechanics, independent draft/catalogue validation and tests; enabling a PC supplement does not automatically import its NPCs. Do not restore the old runtime or silently reuse old supplement conversions.

Run `npm run generate:books` after source/compiler changes. Use affected GM Node regressions and `npm run test:ui:gm` (plus `test:ui:exports` for export changes); follow [TESTING.md](TESTING.md) for the full release policy. The recursive offline build includes both creator entry points, runtime data, PDFs, local fonts and art. Update this document, README, AGENTS and affected architecture/design/book docs in the same implementation change.

Supplement decisions and review: [UP-IN-ARMS.md](UP-IN-ARMS.md) and [ARCHIVES-I.md](ARCHIVES-I.md). Removing a book required by the current foundation asks explicitly before starting a new GM draft; Undo restores it. Added training is stored separately from locked printed training, so War/Broken cannot apply twice. Print batches validate each imported draft’s own enabled catalogue. New WIP content fingerprints invalidate earlier-format GM drafts; migrations are not required by the project’s agreed policy.

## Verification

Outcome tests cover every untouched profile, source mismatch rejection, Track naming, template alternatives, Size/Tiny/Orc decisions, training, Construct/Swarm/Hardy, equipment/AP, optional kit/removal, compatible magic/count limits, genuine variation, strict saves, escaped markup and compact/multipage PDFs. Table-card tests cover A4 dimensions, six/four slots, pagination, complete mechanical fields, issue blocking and oversized notes. Browser and PDF visual checks are recorded below; do not claim checks that were not performed.


### Release checks — 7 October 2026

- `npm run check:release` passed: 18 book packs, 77 application modules, generated-output/format checks, **315 tests** (including 24 GM outcome tests) and the offline inventory of 242 published files.
- Browser verification used an isolated `?verify=1` draft at 1440×900 and 390×844. Desktop and phone had no horizontal overflow. Checked printed-profile preview/application, stable name editing, Spellcaster alternatives, equipment/AP, compatible magic, review, player/GM switching, saved-draft import/load and undo, reference ambiguity/chaining/Back, and six/four-card batch controls. Tiny's warning appeared before export; both export controls were disabled and its issue link focused the Wounds input.
- Initial verification, before named-example exclusions: all 53 untouched profiles passed preservation checks and six-card fit measurement. Representative mixed six-card and four-card A4 PDFs, a full Spider sheet and a multipage notes case were generated with the same export modules. Poppler renders were visually checked for spacing, legibility and clipping. Four-card body text is normally 11 pt; six-card text is normally 9.25 pt. Oversized custom entries are blocked at the 7.5 pt minimum.
- Browser export controls produced success feedback, but the in-app browser's download observer did not return a file. Download retrieval through that observer is unverified; the actual PDF bytes were verified separately through the shared export modules. No production deployment or push was performed.

### PDF emphasis follow-up — 7 October 2026

- Poppler renders of mixed six-card and four-card pages, a full Dragon sheet and a full caster/Corruption/personality sheet were visually checked after the typography change. Labels are distinct and no clipping or overlap was found. The representative cards retained 9.25 pt (six) and 11 pt (four) body text.
- A mixed-weight wrapping regression checks that long unbroken names and paragraphs retain their content and remain within the measured width at 7.5, 9.25 and 11 pt. The existing all-profile fit, overflow blocking and multipage tests remain required. No browser controls changed in this follow-up.
- `npm run check:release` passed: 18 packs, 78 application modules, generated/format checks, **316 tests** (25 GM tests) and an offline inventory of 243 published files. The default-layout regression also verifies six cards without an explicit layout argument.

### Shared rule search — 7 October 2026

GM references use the same all-book index, reader, category controls and source/Legacy dialogs as PC search. Imported supplement choices remain readable independently of the selected GM creation books. Search includes core rules, full Skill descriptions, Conditions, Psychology, equipment properties, Creature Traits, Species and catalogue options, and Corruption. Standalone profiles/templates are excluded from shared search; Rules omit non-mechanical introductions, history/flavour and general storytelling advice. Full text loads on first search from the versioned common asset. Desktop uses the dropdown; phones use the full-screen panel and native category selector. Infinite batches (manual Load more only if automatic loading is unsupported), linked references and Back preserve the list/query/category without changing the GM build. Search does not grant options or add live-play management or XP/Career development. Source warning notes stay outside search matching and PDF sheets.

### Actual Trait descriptions — 7 October 2026

Review/stat-block preview, collapsible folio Traits, full PDFs and A4 cards show actual Trait names/ratings in bold followed by descriptions. Descriptions come from the profile’s Traits heading, excluding its Optional Traits heading. They preserve printed page references and the full effect text. Added Traits or changed ratings without a matching profile summary use their core definition. Size’s page reference remains valid after resizing. Full definitions remain in the editing/reference UI. The approved full Venom rule is retained; a profile summary that still says Advantage uses its core definition with Momentum instead. No discrepancy notes or optional suggestions are appended to PDF sheets. This is presentation only and does not change calculations, saved draft formats or source fingerprints.

Card headers omit the redundant original profile name when it already equals the creature name. Body spacing is measured with the same mixed-weight fonts used to draw it. Six remains the default. With descriptions, 39 untouched core profiles fit six-per-A4; Bog Octopus, Skeleton, Zombie, Dire Wolf, Ghost, Cairn Wraith, Tomb Banshee, Varghulf, Bloodletter of Khorne and Daemonette of Slaanesh need four. All 49 fit four-per-A4 at the 7.5 pt minimum or above. Longer custom builds may require the full sheet. No rule is truncated to make a card fit.

- `npm run check:release` passed: 18 book packs, 85 application modules, generated/format checks, **327 tests** (27 GM tests) and offline asset verification. Regressions cover actual versus optional Traits, removed and added Traits, changed ratings, escaped descriptions, source conflicts and measured six/four-card overflow.
- Browser checks used an isolated draft on desktop and at 390×844: profile preview, review, expanded folio and six-card print dialog. Mobile had no horizontal overflow and the Griffon fit at 9.25 pt. No browser errors or warnings were recorded.
- Latest Poppler renders of mixed six-card and dense four-card pages, a full Griffon and a modified Griffon (Night Vision removed, Bestial added) were visually checked. Bold Trait labels, full descriptions and page boundaries were clean, with no clipping or overlap. Notes and unselected optional Traits stayed out of the PDFs.


### Workshop notification fix — 7 October 2026

The previous timer removed a `show` class while shared CSS displayed any nonempty notification. The workshop now clears the message text on expiry and hides its empty node. Its noninteractive notification sits 17 px above the fixed action bar in the checked 390×844 layout, accounting for the bottom safe-area inset. Browser checks applied a Griffon, clicked Review while the message was visible, then confirmed empty text/zero height after the timeout; desktop notifications also cleared. No browser warnings/errors were recorded. The isolated draft left personal storage unchanged.

Release validation: npm run check:release passed with 18 packs, 85 application modules, all 328 tests and offline coverage. No new game rules or save-format changes were introduced.


### Undead banner — 7 October 2026

Generated the original 2172 × 724 artwork with the built-in imagegen tool from the user’s visual reference. Published only its full-resolution 375,188-byte WebP encoding; the original PNG and prompt stay in design-assets/bestiary outside dist. Browser checks at 1440×900 and 390×844 verified the actual loaded scene, readable title/search, no horizontal overflow and unchanged player-banner selection. No console warnings/errors were recorded. The new WebP is included in the content-versioned offline asset list. No game data, character calculations or saved formats changed.

Release validation: npm run check:release passed with 18 packs, 85 application modules, all 328 tests and 254 offline assets.

### Moonlit Vellum — 7 October 2026

Implemented the user-selected A palette as an entry-point theme of the shared design system. The workshop uses centrally defined storm-blue/bone/cobalt/gold roles, decorative surfaces, readable active navigation captions and a navy modal backdrop. Its generated banner, structure, game calculations and PDF colours remain unchanged. The player entry point keeps its original tokens; browser checks confirmed oxblood `#812c31` and parchment `#eee0bd` there. Decorative search captions now hide at 761–1000px in both creators to prevent a narrow-window overflow found during verification.

Inspected the live profile browser/preview, Customise, Equipment & magic, Review & export, and mobile all-book search/rule reader. Checked 1440×900, 821×900 and 390×844 layouts without horizontal page overflow after the fix, plus loaded emblems and readable source/issue panels. Body, secondary, shell, primary and primary-hover role pairs measured at least 4.93:1 text contrast. Shared keyboard focus, reduced-motion rules and monochrome print styles remain in place. The isolated verification draft did not change personal saved characters.

Release validation: npm run check:release passed all 328 tests; final CSS formatting, rebuilt content-versioned worker and offline coverage passed with 18 packs, 85 modules and 254 published assets. No palette preference is saved and no new runtime code or assets are loaded.

### Up in Arms mounts — 8 October 2026

The full local release check passed 353 Node regressions and 48 desktop/mobile Chromium cases, alongside 18-pack validation, 90-module code checks, generated-output/format checks and offline verification. After the final Bite wording, linked Barding removal and gear-issue focus refinements, the affected GM suites passed all 35 Node tests and 14 browser cases. The browser runner stopped its own test server; the user's preview was left running.

Visual checks at 1440×900 and 390×844 showed no horizontal overflow. Rendered full-sheet and mixed four-card PDFs had no clipping or overlap, retained actual Trait descriptions, and omitted discrepancy commentary. Riding Horse fits the default six-per-A4 layout; Demigryph's longer training text requires four. Measured PDF regressions verify the final text still fits four without truncation. Physical-phone behavior was not verified.

## Supplemental reference reading

Archives I is independently enabled for its shared PC-registry weapons, ammunition, grouped Skill choices and Youngblood, with no GM shopping budget. All thirteen printed profiles are named NPCs, so this pack adds no creature foundations/templates. Its creation-book summary and generated GM inventory explicitly distinguish those contributions from Up in Arms mounts/training. Selected adapted Talents/equipment retain source and Legacy access in the app; export sections contain actual choices without discrepancy text. Review and focused verification: [ARCHIVES-I.md](ARCHIVES-I.md).

GM Add-option pickers search names, descriptions and categories. Matching names are ranked first (exact, prefix, then substring); description-only matches follow. Ties use alphabetical names, and an empty query preserves the catalogue's browsing order. This ranking applies to Traits, Skills, Talents, equipment, magic and Corruption without changing availability or the shared reference search.

Picker-ranking verification (8 October 2026): two focused Node regressions and the desktop/mobile Chromium scenario passed. The browser scenario checks partial Trained queries, retained focus/caret, description-only Fetch lookup and adding the chosen Trait. Quick code/format checks passed and the offline worker was rebuilt; no full release rerun or PDF inspection was needed for this ordering change.

The workshop uses Fifth Edition core rules with independently enabled, reviewed Up in Arms mounts and Archives I/II/III options. Shared global search includes gameplay chapters, Tables and Endeavours, but excludes all standalone NPC/creature profiles and templates by the latest 8 October user decision. This does not remove the workshop’s own 49 core starting profiles or seven template choices; two reviewed Up in Arms mounts and the Archives II Rhinox/Typical Sister are available separately, while other supplemental source records remain retained for future review. Edition warnings distinguish unconverted Fourth Edition text from approved adaptations. Opening a reference never selects a starting profile, changes a draft or enables supplemental mechanics. Search coverage is generated separately in SEARCH-COVERAGE.md.

## Archives II — 8 October 2026

Two unnamed foundations are opt-in: Rhinox (p. 34) and Typical Sister (p. 76). Named NPCs are excluded. Typical Orderly gives standard-profile guidance, not a fixed profile or quantified template; use a core Species foundation and explicit Skill totals. No hirelings or Career development are added.

Rhinox retains printed Characteristics, TB 5 and 50 Wounds. Approved Legacy changes are Weapon +9 → +15 under core Large Size, Stride → Sprinter, Fury → core Frenzy (explicitly proposed: old Fury is undefined here), and Hardy → one core Hardy Talent rank. Hardy is not added twice. Horns remains +10 and is an extra Free Attack when Charging; it derives from the actual Horns Trait and disappears when that Trait is removed. Trained (Broken, Mount, War) and Tracker remain optional. Natural Armour gives 2 AP across its quadruped locations.

Typical Sister retains every printed Skill total, five core Talents and Robes/Silver Dove Cloak-Pin. Research 30 remains below Intelligence 35. No attack, armour, Bless/Invoke or prayer is invented; compatible printed choices receive no Legacy badge merely because they came from an older book.

Archives II equipment, Vice, Skill specialisations and seven Great Maw spells come from the shared PC registry. Enabling the book applies its Ogre Language (Magick) Toughness rule and Lore restrictions to the existing core Ogre foundation. Great Maw is Ogre-only; other permitted Ogre Lores are Heavens, Death and Beasts. Spellcaster grants its ordinary core Skills, with Language (Magick) using Toughness. Invalid Lore choices are explained in controls and structured issues before export. Meat, ingredients, healing and writing/art/Lore permission remain informational references without a checkbox or live-play tracking.

Ogre weapons and Gutplate keep printed values on Ogres. Other foundations receive an early unresolved-use issue: weapons require explicit GM attack score and Damage, or removal; Gutplate must be removed because no alternative AP profile is printed. No automatic smaller-creature armour conversion is invented. No shopping budget or carrying-capacity manager is added.

The source builder is `scripts/build-archives-ii-gm.py`; the compiler verifies its supplied-PDF checksum against the book manifest. Profiles stay alphabetical, drafts record independent book choices, and mixed-book print batches resolve each draft’s own catalogue. Trait descriptions show only actual selections. Legacy/source explanations stay in the app and never enter compact PDF/card text.

## Named worked examples excluded — 8 October 2026

Skrakk, Ungrakk, Swilegrakk and Guzgog (pp. 354–356) are excluded from selectable foundations by user request. Their exact source IDs are maintained in the compiler; reviewed extraction is retained, but compiled profiles cannot restore them. With those four removed, the empty Worked Examples category disappears. There are 49 core foundations and seven unchanged core templates; Up in Arms and Archives II add two foundations each, for 53 with all GM books enabled. Generic templates, Trait definitions and worked mechanical explanations remain available. WIP drafts using a removed foundation are unsupported rather than silently converted to a different creature.

Removal verification: 63 affected GM/source-reference regressions, quick code/format checks and all 24 local GM desktop/mobile browser cases passed. The updated catalogue omits the named characters/category while still offering generic Elite, Commander and Spellcaster templates.


## Archives III — 8 October 2026

The independently enabled book reuses 18 reviewed Handrich/Solkan/Rhya Miracles and nine new Hedgecraft names. Fellstave has seven separately selectable printed targets with stable save/remove/undo identities. Existing core duplicate spells retain their Fifth Edition definitions. Bless/Invoke and Blessed/Miracles controls include Handrich, Solkan and Old Faith; Old Faith Invoke unlocks its printed Blessings rather than an invented Miracle list. These are explicit GM spell selections without PC starting grants or XP. Cult requirements are references in the app; compact exports contain selected content, without discrepancy notes.

The full-book profile review found six named NPCs and six animal familiars, so no new foundations or templates are added. Familiars, alternative armour, Enterprises, Career development and live power/Channelling remain excluded. Optional GM Cants unlock at 1/3/6 known spells of an owned Colour Lore Talent. A generic Arcane spell counts once towards its explicitly assigned Lore; choices prune on spell/Talent/book removal and undo restores them. Folio/table cards list chosen names; review/full sheets include effects, without live bonuses. Sources, scope and decisions are in [ARCHIVES-III.md](ARCHIVES-III.md).
