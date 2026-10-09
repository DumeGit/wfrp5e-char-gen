# Creator browsing and explanations

October 2026 UX refresh: audit items 1 and 3–22. Saved book presets (item 2) were explicitly excluded. This is presentation and workflow work; the book registry, printed tables, eligibility and advancement rules remain authoritative. Campaign management remains deferred.

| Item | Implemented behavior |
| --- | --- |
| 1 | Dedicated **Choose books** setup, outside the eight creation steps. Each card summarizes its installed content. Core is required; Career variants stay in Career. |
| 3 | Printed roll-table selectors beside Species, Career and random Talent rolls. Sole/default tables remain automatic; source details are tappable. No probabilities are merged. |
| 4 | Career roll controls appear first, then a compact chosen Career summary and the searchable browser with Class/source filters. Rolled selections populate Find a Career and clear stale Class/Source filters; choosing among three offers synchronises the chosen result. Browser cards preview starting training and kit; manual selection uses **Choose Career → Apply change**. Typing or previewing does not alter the draft. |
| 5 | Career variants, optional levels and equipment swaps share a **Career options** section. A comparison shows changed Characteristics, level names, Status, Skills, Talents and Trappings before application. |
| 6 | **Training choices before Skills** exposes the shared free Career Talent, College affiliation and equipment alternatives. Conditional training responds immediately, including Morr's Augury access. These are the same choices used by Talents and Gear. |
| 7 | Sticky Species/Career allocation counters; Career overlap markers and separate Species, Career and total free points on rows. Native languages and Elder allocations retain their distinct rules. |
| 8 | Magic library searches names/effects and filters type, Lore/tradition, source and availability. Free choices have a searchable eligible-only chooser. Ordinary spell, prayer, ritual, technique and rune quotes still use their original handlers. Multi-Lore rituals appear under each eligible Lore. |
| 9 | Default magic results show learnable profiles. Non-casters get a concise explanation and an explicit reference browser; viewing locked content grants no powers. |
| 10 | Experience retains four tabs. Optional **Career only** and **Affordable now** filters reduce rows without changing purchase rules. Characteristic and Skill purchases share compact rows with name/tracker status, score change, a labelled **?** calculation button and XP price; mobile stacks the score below the name. Characteristic Career-level badges sit beside the name, and all rows reserve equal space for the coloured Career accent. Restrictions and load notes remain visible. Owned Talent ranks are visible, including repeatable purchases. XP balance and +1/+5 controls remain visible while scrolling. |
| 11 | Fixed starting kit is compact and automatic. Selectors are reserved for alternatives; quantity rolls appear only while unresolved. Armour/bags are worn, weapons equipped, other gear packed automatically. |
| 12 | Shared shop categories span all enabled sources. Each profile preserves its printed category and reference. |
| 13 | Shop source/category/budget filters, search and global ascending/descending price order. Disabled buttons explain restrictions or the missing funds. A purchase reports the remaining purse. |
| 14 | Sources and Legacy badges open tap/click dialogs. Legacy remains selective: only actual reviewed adaptations qualify. The Sources & decisions drawer retains the book-wide decisions. |
| 15 | Talent descriptions distinguish **Included in your totals** from **Reference for play**. Gear explains which inherent values feed totals; magic effects remain references. This does not implement situational Test bonuses or live spell effects. |
| 16 | Foundational manual changes explain reset effects before application and offer one-step undo. Undo restores the character and selected variant catalogue. It expires after the next character edit/roll; random history is never rewound for another first-roll reward. XP still locks foundations. Read-only Career browsing and rule explanations stay usable while locked. |
| 17 | Mobile fixed strip shows remaining XP/coin, opens the page-flow folio and returns to the previous choice position. No mobile internal folio scroll. |
| 18 | Compact desktop navigation with stable Save/Load/New controls. Desktop folio retains its sticky position, collapsible lists and bounded internal scroll. |
| 19 | Review separates required choices, unresolved supplied equipment data and play/reference reminders. Unknown values stay unknown and appear in exports. |
| 20 | Review issue links navigate, open enclosing disclosures, focus and briefly highlight the affected choice. Folio **Finish choices** uses the same destination mapping. |
| 21 | Default export contains all actual choices, free/paid benefits, equipment, roll history, ledger, overflow and relevant adaptations. Optional **Complete enabled-book compatibility appendix** adds the unused catalogue's conversion decisions. Both modes retain the 556 editable sheet fields. |
| 22 | Tap folio Characteristics, derived values, trained Skill names or carrying capacity for calculation components. XP rows also offer **How calculated?** Score previews distinguish intrinsic values from known load penalties. |

## Implementation boundaries

The centred masthead search launcher opens the same large reference workspace in both creators, independent of enabled creation books. Desktop places results beside a reading pane; phones switch between full-screen results and references, with Back preserving position. Native Category and Book selects appear everywhere. Only the agreed additional category filters appear, expandable on phones. Removable filter chips, a match count and Clear filters make combined searches visible. Spells, prayers and Cants share a category with Type and Lore/Patron; Runes and Techniques stay separate. Related terms offer hover/focus previews, click/tap navigation and chain Back with restored reading position. No reading action changes a character. The input, icon and padding focus with one click and remain stable while typing. Automatic 20-result batches, keyboard navigation, retry and query/filter memory remain shared. Source/adaptation notes stay outside matching. Existing local creator searches remain independent. Full vocabulary and metadata limits: [BOOK-SEARCH.md](BOOK-SEARCH.md).

`workspace.mjs`, `flow-ui.mjs`, `magic-browser.mjs`, `issue-targets.mjs` and `record-sources.mjs` contain presentation models. Core and supplement modules calculate legal choices, XP prices, grants, money and derived totals. Search/filter state is separate from the saved character. No presets, build planner, draft library or campaign manager were added.

The optional full appendix is an export preference, not a rule option. Omitting it never omits the character's actual choices, source-specific warnings or XP purchases. Record Talent expenditure sums the actual ledger costs, including approved discounts.

Starting Species Skills use a compact two-column desktop list and a single phone column, preserving specialisation selectors, five-choice counters, Career overlap markers and +5 checkboxes. Shop item names open available profile descriptions; items without additional text have no empty disclosure. Category, Availability, weight and source remain visible without a repeated profile heading. Experience Talent names are their description disclosures, with owned ranks and tracker effects underneath. Stable disclosure keys preserve open descriptions after purchases and undo.

Origins groups each name/appearance text field with an accessible dice button and a printed-suggestion select underneath. Starting Fate, Fortune and Movement share a compact strip; the existing random-creation explanation uses a stable disclosure. Names, regional choices, supplement warnings, ambitions and background remain editable in the main form. Reduced spacing and shorter textareas do not change roll probabilities, logs or save/export fields. Eye/hair controls remain paired on phones, with 16px field text and 44px touch heights. Age/height rerolls replace the previous generated values while preserving custom background text.

## Verification

- Outcome tests cover Career availability/search/preview immutability and variants; shop taxonomy, restrictions and purse feedback; non-caster and caster magic filtering; calculation reconciliation; precise issue destinations; relevant source collection; compact/full exports and editable field values.
- Existing book, rules, XP, tracker, packing, selective Legacy and offline-cache tests remain required.
- Career reset tests cover rolled search/preview synchronisation, stale filter removal, manual-search preservation and exclusion from saved character state. Browser checks cover desktop and 390/320px Origins/Career layouts, printed suggestions, independent rolls and age/height replacement.
- Browser checks use an isolated `?verify=1` draft, with desktop and mobile layouts. Verify change confirmation/cancellation/undo, prerequisite sharing, source/Legacy dialogs, locked references, shop filtering/purchases, free magic selection, issue focus and PDF downloads.
- PDF check: with all selected books enabled, the verification Soldier produces a 6-page default record versus a 50-page full appendix record. The default sheet has 8 pages (two supplied sheet pages plus record), with all 556 fields retained. These counts depend on the character's content.

Build before delivery so the content-versioned offline worker includes every new module and stylesheet. Commit locally only; the user pushes to GitHub/Vercel.

## Black Banner styling

C — The Black Banner is the active shared theme. The joined leather/folio and parchment workspace preserve the established creator workflow and compact rows; a tighter Experience overview leaves more room for purchases. Decorative page initials use a fixed centred box. Header search sits in the centred ribbon below the brand, with art clipped independently of the reference workspace. Body text/controls stay readable, source and selective Legacy access remain available, and mobile retains its selector, condensed folio and fixed strip. Presentation standards, local assets, no-glint/no-sound policy and reduced-motion handling are in [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

The banner is shorter and has no motion or install controls. Install app sits below New character and retains its live button node after step changes/redraws. Left navigation uses compact rows and utility controls so it fits normal desktop heights; short windows retain an accessible scroll fallback. Rolled Characteristics use compact named rows with Career badges beside abbreviations, and Career starting increases use a budget plus three inline inputs instead of a large two-column form. Roll/assignment values, point budgets and validation are unchanged.

## Scope boundary

Player creation and the fresh core-only Bestiary Workshop have a shared creator switch, styling and responsive controls, with independent drafts and exports. The GM tool uses four pages, optional customisation tabs, immediately visible issue links and a compact stat-block export; source discrepancy notes stay in the app. Review also offers a local, temporary six/four-per-A4 print batch with copies/imports and visible fit/error feedback. Career development/XP and campaign play are excluded. PC animal purchases remain belongings without automatic companions. See [GM-WORKSHOP.md](GM-WORKSHOP.md).
