# Creator browsing and explanations

October 2026 UX refresh: audit items 1 and 3–22. Saved book presets (item 2) were explicitly excluded. This is presentation and workflow work; the book registry, printed tables, eligibility and advancement rules remain authoritative. Campaign management remains deferred.

| Item | Implemented behavior |
| --- | --- |
| 1 | Dedicated **Choose books** setup, outside the eight creation steps. Each card summarizes its installed content. Core is required; Career variants stay in Career. |
| 3 | Printed roll-table selectors beside Species, Career and random Talent rolls. Sole/default tables remain automatic; source details are tappable. No probabilities are merged. |
| 4 | Searchable Career browser with Class and source filters. Cards preview starting training and kit; only **Choose Career → Apply change** alters the draft. |
| 5 | Career variants, optional levels and equipment swaps share a **Career options** section. A comparison shows changed Characteristics, level names, Status, Skills, Talents and Trappings before application. |
| 6 | **Training choices before Skills** exposes the shared free Career Talent, College affiliation and equipment alternatives. Conditional training responds immediately, including Morr's Augury access. These are the same choices used by Talents and Gear. |
| 7 | Sticky Species/Career allocation counters; Career overlap markers and separate Species, Career and total free points on rows. Native languages and Elder allocations retain their distinct rules. |
| 8 | Magic library searches names/effects and filters type, Lore/tradition, source and availability. Free choices have a searchable eligible-only chooser. Ordinary spell, prayer, ritual, technique and rune quotes still use their original handlers. Multi-Lore rituals appear under each eligible Lore. |
| 9 | Default magic results show learnable profiles. Non-casters get a concise explanation and an explicit reference browser; viewing locked content grants no powers. |
| 10 | Experience retains four tabs. Optional **Career only** and **Affordable now** filters reduce rows without changing purchase rules. Skill purchases use compact rows with name/tracker status, score change, a labelled **?** calculation button and XP price; mobile stacks the score below the name. Restrictions and load notes remain visible. Owned Talent ranks are visible, including repeatable purchases. XP balance and +1/+5 controls remain visible while scrolling. |
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

`workspace.mjs`, `flow-ui.mjs`, `magic-browser.mjs`, `issue-targets.mjs` and `record-sources.mjs` contain presentation models. Core and supplement modules calculate legal choices, XP prices, grants, money and derived totals. Search/filter state is separate from the saved character. No presets, build planner, draft library or campaign manager were added.

The optional full appendix is an export preference, not a rule option. Omitting it never omits the character's actual choices, source-specific warnings or XP purchases. Record Talent expenditure sums the actual ledger costs, including approved discounts.

Starting Species Skills use a compact two-column desktop list and a single phone column, preserving specialisation selectors, five-choice counters, Career overlap markers and +5 checkboxes. Shop item names open available profile descriptions; items without additional text have no empty disclosure. Category, Availability, weight and source remain visible without a repeated profile heading. Experience Talent names are their description disclosures, with owned ranks and tracker effects underneath. Stable disclosure keys preserve open descriptions after purchases and undo.

## Verification

- Outcome tests cover Career availability/search/preview immutability and variants; shop taxonomy, restrictions and purse feedback; non-caster and caster magic filtering; calculation reconciliation; precise issue destinations; relevant source collection; compact/full exports and editable field values.
- Existing book, rules, XP, tracker, packing, selective Legacy and offline-cache tests remain required.
- Browser checks use an isolated `?verify=1` draft, with desktop and mobile layouts. Verify change confirmation/cancellation/undo, prerequisite sharing, source/Legacy dialogs, locked references, shop filtering/purchases, free magic selection, issue focus and PDF downloads.
- PDF check: with all ten books enabled, the verification Soldier produces a 6-page default record versus a 50-page full appendix record. The default sheet has 8 pages (two supplied sheet pages plus record), with all 556 fields retained. These counts depend on the character's content.

Build before delivery so the content-versioned offline worker includes every new module and stylesheet. Commit locally only; the user pushes to GitHub/Vercel.
