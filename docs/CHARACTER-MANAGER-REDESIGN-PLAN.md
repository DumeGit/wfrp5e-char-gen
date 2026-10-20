# Character manager: redesign proposal

Status: implemented design, 20 October 2026. The user approved this proposal with one explicit change: retain the same shared header as the other modes. The implementation keeps `CreatorFrame`, its emblem/brand/search/header geometry and `CreatorMenu`, and places the new manager workspace beneath it. The original concept and design rationale below are retained as the specification; `CHARACTER-MANAGER.md` describes the current behavior.

## 1. Product purpose and priorities

Latest ability-section follow-up, 20 October 2026: remove the parent Abilities card, Find an owned ability and Learn or improve with XP. Show Skills, Talents, Magic & Faith and Other abilities as four independent sections with equal heading levels and their own collapse controls; all four start folded on phones. Keep the compact desktop Skill columns and supporting group stack, Basic/Advanced dividers and manual entry controls. Keep XP browsing and actions in Advance. Fate/Fortune placement remains a design recommendation at this stage, rather than an approved layout change.

Latest unified-sheet amendment, 20 October 2026: the user approved merging Abilities and Gear into Play and removing ability favourites. Keep only Play/Advance/Journal destinations. Combine field facts and Conditions into Status & afflictions, with add/edit actions for critical wounds and mutations, recovery notes and healed/inactive records. Reuse existing reviewed core sources and preserve manual effects, imports, backups and PDF history. Keep Fate/Fortune adjacent as plain values with independent small +/- controls; put the pen immediately beside the name. Add a subtle Basic/Advanced Skill divider. Phones keep Combat and active Status first, then folded Abilities, Gear and Characteristics. The user subsequently rejected Jump to; remove it and use normal scrolling/collapses, retaining the contextual Manage gear action. This supersedes the five-destination, Favourites and clickable-resource proposals below.

Latest play-density follow-up, 20 October 2026: compact the character identity, navigation and desktop menu controls beneath the unchanged shared masthead. Use an accessible profile pen and truncate displayed character names with ellipsis while retaining full names in titles, editing and storage. Keep Fate and Fortune adjacent on every destination; put current Wounds and Movement in a Combat card with the ready-attack table and horizontal protection grid. This supersedes the single mixed resource-band proposal. Phones prioritize open Combat and Favourites, with Characteristics, field facts and inactive Conditions initially folded. All Play cards and ability groups can collapse independently without losing their entry/filter state; active Conditions start open. Desktop Abilities use aligned name/Characteristic/score Skill columns beside compact supporting groups. Skill descriptions remain available by opening the row, without a plus marker. These priorities supersede the original mobile first-viewport requirement to show all Characteristics.

Latest sidebar follow-up, 20 October 2026: use the shared HistoryControls arrow buttons in the desktop left menu, with no Undo/Redo or More in the character heading. Reduce individual sidebar actions to New & import, Save & export and More dialog launchers alongside Character library. More contains character management; Save & export contains JSON/PDF and library backups. Compact menus use the same groups and history controls. Keep existing handlers, deletion confirmation and draft protection, and restore focus to the original menu launcher after a nested editor closes.

Latest compactness follow-up, 20 October 2026: Character library now belongs inside the mobile application menu. Keep the two shared corner stars on the main surface and visible bordered Play actions. Skills, Talents and Magic & Faith share one responsive abilities page; Skills expose their linked Characteristic in compact multi-column rows. Equipment uses expandable tiles and bounded filters. The Condition picker reuses the 13 canonical core entries from printed pp. 185–187, including their on-demand summaries/citations; custom entries and manual effects remain supported. These decisions supersede the earlier category-tab and mobile library-button proposals.

Approved amendment, 20 October 2026: the user requested the same visible left application menu as the other modes on desktop, with every menu action accessible. This supersedes the proposal's references to removing all permanent side rails. Use the shared mode switch and file/library actions in a joined 230px sidebar above 1000px; retain the shared collapsible header menu below that breakpoint. Character destinations remain horizontal on desktop and in the phone bottom bar. Do not add a creator step rail or resource folio. Strengthen the surface hierarchy with olive navigation, sage framing/supporting panels and bounded paper content. The shared header geometry remains unchanged, with manager-specific art generated from the user's supplied reference.

The manager should feel like a character sheet that is useful at the table, with a well-organized record behind it. Its first job is to help someone find a score, track a resource, check an attack or read an ability while playing. Its second job is to manage equipment, spend XP and keep notes between sessions. Importing, backups, manual corrections and profile editing must remain easy to find without occupying the play surface.

Design priority, in order:

1. Read current information quickly.
2. Perform frequent play actions with little navigation.
3. Make deliberate character changes with a clear preview.
4. Manage files, backups and exceptional corrections.

The library and the open character are separate places with different layouts. The manager needs its own workspace rather than inheriting a creator's step-by-step editing layout.

## 2. What is wrong with the current interface

Evidence: reviewed the existing desktop and phone screenshots, then opened an isolated Chromium session on `/manager/?verify=1`, imported the Soldier fixture, and inspected the library, Skills & Talents, Combat & Gear, Advancement and Session view. This is a design review, not a claim of user testing on physical hardware.

| Current problem | Effect on the user | Proposed replacement |
| --- | --- | --- |
| Seven navigation buttons plus import, export, backup, duplicate, archive and install occupy one tall rail | Every action looks equally important; the rail needs its own scrolling | Five task destinations; file operations in labeled menus |
| Overview opens with Add portrait, a name input and a large appearance field | The character feels perpetually in setup; useful play information starts too far down | Readable identity header; explicit Edit profile action |
| Wounds/Fortune/Fate appear in the top summary and side panel; Session view adds another copy | Unclear which copy is the main control; space is wasted | One shared resource control band per screen |
| Overview and Session view compete as the starting screen | Users must choose between a sheet and a useful play layout | A single default Play screen combining their useful content |
| A large right folio remains on every desktop section | It narrows Skills/Gear/Advancement while repeating data | Remove the permanent folio; local context appears beside Play only when useful |
| A full-width dropdown is the main section navigation on phones | Destinations are hidden and changing sections takes extra taps | Five visible bottom destinations |
| Mobile bottom actions are Undo, Redo, Resources and Library | Screen switching is less accessible than administration | Bottom navigation switches tasks; Undo/Redo move into the character toolbar |
| Most controls are outlined rectangles with similar emphasis; some primary actions render as native unstyled buttons | The next action is hard to identify and styling appears unfinished | A defined primary/secondary/text/icon control family shared by every screen and dialog |
| Large bordered stat cells repeat Advances under every number | Low information density, excessive vertical space | Compact ten-score strip/grid; detail only on request |
| Attacks use tall prose rows; numeric values are embedded in sentences | Comparing attacks is slow | Aligned weapon, Skill, Damage and property columns |
| Advancement is a generic three-selector form | Users must configure a purchase before they can compare options | Browseable rows showing current value, next value, XP and eligibility |
| Abilities mix reading, pinning, removing and GM editing inside each disclosure | Common and exceptional actions have the same context | Read-first rows; details and clearly separated adjustment actions |
| Thick green framing, pervasive material, decorative type and repeated separators all compete | The military theme overwhelms the actual sheet | Green chrome, clean reading surface and restrained brass detail |
| Repeated save notices and very large footer spacing | Routine system information consumes attention and screen height | One save status and a compact shared footer |

## 3. Visual direction: a disciplined Imperial field ledger

Keep the military-green identity, but use it to frame a legible working document. The distinctive element is a compact field-ledger masthead with the existing emblem. The rest of the interface is quiet enough for scores and actions to stand out.

### Palette and surfaces

| Role | Proposed value | Use |
| --- | --- | --- |
| Deep military green | `#26382D` | App header, selected navigation, main action |
| Olive | `#59684A` | Small supporting accents and inactive themed details |
| Warm paper | `#F4F1E7` | Main reading surface |
| Ink | `#232B25` | Text and numerical values |
| Aged brass | `#AA9056` | Emblem/rule accents; never small essential text on paper |
| Quiet rule | `#D4D8CC` | Dividers and input boundaries |

These are proposed tokens, not verified contrast results. Implementation must check actual foreground/background pairs, including hover, disabled and focus states. Add dedicated error/warning roles with text labels; do not use brass for every alert or green for every status.

- Use green for the header, active states and deliberate actions; keep most of the content on paper.
- Restrict the existing canvas texture to the masthead/outer frame, at a strength that does not compete with text. No texture behind tables, controls or prose.
- Use one joined content frame. No disconnected floating side panels or nested frames around every section.
- Use whitespace and alignment before borders. A divider separates sections; a border identifies an input, table boundary or interactive container.
- Keep the layout fluid on large screens. Additional width improves columns and alignment rather than making paragraphs stretch across the monitor.

### Typography and geometry

- Existing Ledger Display: small brand wordmark only.
- Existing Ledger Text: character name and major section headings, used sparingly.
- System sans-serif: labels, descriptions, tables, inputs and all scores; tabular numerals for changing values and aligned columns.
- Working text/input size 16px; secondary text 14px; 12px reserved for compact navigation or nonessential metadata. No tiny decorative subtitle stack.
- Character name approximately 30–32px desktop, 24–28px phone; section headings 20–22px. Long names wrap naturally.
- Spacing scale: 4, 8, 12, 16, 24 and 32px. Standard desktop page inset 24px, phone 16px, narrow phone 12px.
- Controls have a consistent modest 4–6px radius. Tables and stat groups remain visually flatter; avoid rounding every content section.
- Fine-pointer rows can be compact, but every phone/coarse-pointer control has an effective target of at least 44px with separation from neighboring actions.
- One filled main action per local task group. Secondary actions use a quiet outline; tertiary actions are text or labeled icons. Destructive actions appear in their relevant menu/dialog with explicit wording.

## 4. Navigation and shared workspace

Use the same five destinations and names on desktop, tablet and phone:

| Destination | Main question answered | Contents |
| --- | --- | --- |
| Play | What can I do right now? | Characteristics, attacks, protection, Conditions, movement/load, favourite abilities |
| Abilities | What does my character know? | Skills, Talents, magic/prayers and other supported abilities |
| Gear | What do I have and where is it? | Equipment, quantities, placement, load and money |
| Advance | What can I improve? | XP balance, purchases, Career tracker and Career changes |
| Journal | What should I remember? | Notes, character background/ambitions, change history and original attachments |

Abilities has local categories: Skills, Talents, Magic & Faith, Other abilities. Always make Magic & Faith reachable, including for a character with no spells; an empty category explains how to add an entry. Do not change the five primary destinations based on character build.

### Shared chrome

- Shared app header: retain the existing CreatorFrame brand, emblem, Search rules and compact menu exactly as the other modes. Character-library access belongs in the workspace below it. Dedicated menu/search portal slots keep their ordering stable across all modes.
- Character header: portrait if present, name, Species/Career/level, Edit profile, Undo, Redo and More. A missing portrait does not create an empty placeholder block or an Add portrait call to action.
- One save indicator: Saving / Saved on this device / Save failed. A failure expands into actionable recovery; ordinary successful saves stay quiet. Offline availability is a separate status and must never imply a backup or synchronization.
- More contains Export PDF, Export character JSON, Duplicate, Archive and Adjust sheet. Permanent deletion is available only through an explicit management flow. Character import and whole-library backup/restore belong to the library/application menu.
- One shared Wounds/Fortune control band appears beneath the character navigation on desktop and beneath identity on phones. This is the only full resource controller on a rendered page. It replaces the summary strip, permanent folio and duplicate Session resources.
- Wounds: labeled current/maximum, decrement, increment and direct-value editing. Fortune: labeled current/maximum, Spend and Restore. Direct editing must say current value; maximum changes belong in Adjust sheet. Fate is a readable fact on Play, with a deliberate permanent-change action in Adjust sheet rather than a neighboring quick-spend button.
- Undo/Redo stay in a consistent character toolbar, with disabled reasons when unavailable. Reversible actions give concise feedback and an immediate Undo action where useful. Do not rely solely on a disappearing notification.
- The application menu retains shared Close/Escape/backdrop and creator-switch behavior across all modes. Group file actions clearly inside it; do not replace it with a manager-only menu pattern.
- Browser Back/Forward restores character, destination and relevant location. Section switches start at the section heading; returning from detail restores the selected row and scroll position. Search/filter text remains presentation state, not character data.

## 5. Desktop and phone composition

### Desktop, approximately 1100px and wider

```text
Field Ledger   Characters                  Search rules      App menu
----------------------------------------------------------------------
Walther Schmidt                         Edit profile  Undo Redo  More
Human, Soldier, level 1                                  Saved locally
----------------------------------------------------------------------
Play       Abilities       Gear       Advance       Journal
----------------------------------------------------------------------
Wounds  [−] 12 / 12 [+]  Set value      Fortune 3 / 3  Spend  Restore
----------------------------------------------------------------------
Characteristics                         Conditions         Add
WS  BS  S  T  I  Ag  Dex  Int  WP  Fel   No active Conditions

Ready attacks                           Favourite abilities
Weapon       Skill   Damage             Compact selected rows
...                                     Manage favourites

Protection                              Movement / Enc / Fate
Location     AP      Soak               Corruption / Sin
----------------------------------------------------------------------
Compact shared legal / privacy / offline footer
```

- No permanent left action rail and no permanent right resource folio.
- Play uses an approximately 2:1 split inside the single joined surface. Its narrow column contains useful character context, not a second menu. At shorter widths it moves into page flow.
- Other destinations use their own appropriate full-width list or main-list/detail composition; do not preserve an empty second column just to match Play.
- Keep prose to roughly 65–75 characters per line; tables may use the available width. At very wide viewports, align related lists in columns without enlarging the name or introducing more decorative panels.
- No nested navigation scrollbar. The page owns normal vertical scrolling. Sticky chrome must remain compact and release if it would consume too much height.

### Tablet, approximately 720–1099px

- Keep horizontal navigation when all five labels and targets fit naturally.
- Use one content column, optionally a list/detail arrangement in landscape where both remain readable.
- Preserve visible resource controls and avoid creating a cramped miniature desktop folio.
- Breakpoints follow measured fit; they are starting values, not device identification.

### Phone, below approximately 720px

```text
Characters       Field Ledger       Search / App menu
Walther Schmidt                     Undo  Redo  More
Human, Soldier, level 1                         Edit
----------------------------------------------------
Wounds 12 / 12              Fortune 3 / 3
  −    Set    +              Spend  Restore
----------------------------------------------------
WS   BS    S    T    I
Ag   Dex  Int   WP   Fel
----------------------------------------------------
Conditions                                      Add
Ready attacks
  Halberd       Skill 51       Damage 8
  ...
Protection / Favourites / Other facts follow
----------------------------------------------------
Play      Abilities      Gear      Advance     Journal
```

- Five visible bottom destinations replace both the large section selector and the existing bottom utility bar.
- Use the same labels and order as desktop. Keep selected state clear with shape/weight as well as color.
- Keep the working area full width with small shared gutters. Remove the deep decorative green inset around the paper.
- The resource band is part of normal page flow; the bottom navigation is the single fixed navigation layer. Avoid stacking a sticky header, sticky resource band and fixed bottom actions on a short phone.
- Ten Characteristics form two clean rows of five at 390px. At 320px, reflow by measured fit without reducing values or labels below legibility; full Characteristic names are available on focus/tap. Never leave an empty oversized cell occupying the final column.
- Attacks and equipment become structured rows with values on a second line, preserving labels and rules access. The page itself never scrolls horizontally.
- Short edits use a compact accessible dialog/sheet; long forms use a full-screen editor with an explicit title and completion action. Share field rendering and command handling rather than inventing separate desktop/mobile forms.
- Accommodate safe areas, the software keyboard and enlarged text. The last row/action must scroll above the bottom bar. Physical-device verification remains necessary before claiming phone behavior is verified.

## 6. Screen specifications

### Character library

Purpose: resume play or bring in a character.

- Title Your characters with one prominent Import character action and a quieter New blank character action.
- Existing roster: compact rows with optional small portrait, name, Species, Career/level and last edited. The character name is the primary Open link; do not nest row-wide buttons around other controls.
- Favourite is a small labeled star toggle. Duplicate, Archive and Export belong in each row's More menu.
- Search by character name/Species/Career. Active/Favourites/Archived filters stay visible; sort is a compact secondary control. Hide unnecessary filters when the library has no records, but keep import/create visible.
- Empty state explains Player/Marijan/manager imports and local saving once, close to the import action. No giant decorative empty register.
- No matching results gives Clear search/filter; archived characters give Restore and Open rather than suggesting they are missing.
- Library actions group Back up library and Restore backup. Backup messaging explains that files move characters between devices; no cloud or account is implied.

### Play

- Default destination after opening a character.
- First reading block: all ten Characteristic totals, without permanent editing inputs or a repeated Advances label under every total. Selecting a score opens its base/Advances/manual explanation and a link to the relevant improvement/adjustment.
- Ready attacks: aligned Name, Skill, Damage and Properties. Include only currently relevant/equipped attacks; provide a clear path to Gear. Preserve existing calculation and property wording. Do not add attack rolling or automatic combat resolution.
- Protection: compact location/AP/Soak table. Show shield-specific values only when relevant and keep the conditional opposing requirement explicit. Unknown armour data stays unknown.
- Conditions: compact named entries with count and notes; Add Condition at the heading. Removal/change is deliberate and reversible. Empty state is one line, not a large blank card. Effects/recovery remain manual.
- Favourite abilities: compact owned entries with total/rank and expandable rule summaries. A single empty hint links to Abilities; do not render three empty favourite sections. Pinning is presentation, not an XP or mechanical change.
- Supporting facts: Movement, load/capacity, Fate, Corruption and Sin. Distinguish base from load-adjusted values where needed. Avoid currency and XP duplicating large widgets here; they live in Gear/Advance.
- Appearance, long background and routine administration do not interrupt this screen.

### Abilities

- Local categories: Skills / Talents / Magic & Faith / Other abilities. Support switching without resetting the global destination.
- One search scoped to owned entries; sensible category-specific filters. No unrequested global catalogue dumped into the owned list.
- Skills: Name, total and Advances columns on desktop. Phone row: name and prominent total; secondary Advances line only where useful. Keep specialisations legible and grouped predictably.
- Talents/other abilities: name and rank/count; rule summary expands below the row. Do not repeat inert rank badges for entries without a meaningful rank.
- Each entry has a labeled favourite toggle and Details. Full rules/source references live in that detail surface, never as focusable children of a disclosure summary.
- Paid learning leads to Advance with the selected entry. Manual addition/change is clearly labeled as an adjustment and records its reason. Remove is separated from reading/favouriting.
- Magic/faith uses existing supported distinctions, patron/Lore details and manual records. No fabricated casting automation or implied unavailable rules.

### Gear

- Top summary: clearly labeled money denominations and load/capacity, with Receive money / Spend money. Avoid requiring users to remember that negative pennies mean spending; retain exact underlying currency conversion.
- One equipment list with category/place filters; don't invent new packing locations. Default shows carried/equipped belongings; stored remains one visible filter away, and All is available.
- Desktop columns: item, quantity, placement, Enc and row actions. Unknown weights display Unknown with an explanation, never zero.
- Phone rows preserve name, quantity and placement; details reveal properties, capacity/packing notes and quantity changes.
- Acquire equipment opens one coherent flow: search/select, inspect supported properties, enter quantity/total price, preview money change, confirm. Explicit Gift/loot allows zero; an unknown listed price still requires a deliberate entered transaction amount.
- Show automatic packing behavior where a location is changed or cannot fit, rather than a long permanent explanatory paragraph above all equipment. Respect the existing lack of a manual packing editor or custom Quality/Flaw editor.
- Removal does not imply a sale or refund. Selling uses an explicit money transaction with the entered amount; don't invent prices or bargaining rules.

### Advance

- Header shows available, spent and total XP; Award XP is the main header action. Explain historical totals without claiming unrecorded past purchases.
- Show Career/level and a compact tracker with labeled current/required progress. Preserve the approved tracker grouping and supported +1/+5 behavior.
- Categories: Characteristics / Skills / Talents / Career. Browse options as rows, not a generic purchase-type/target/amount form.
- Each eligible row shows current → proposed value, XP cost and a purchase action. Amount control belongs to the row/detail for +1/+5 where supported. Display why a purchase is unavailable beside it; a disabled button alone is insufficient.
- Cost/details control explains calculation and tracker effect using the existing engine. Recompute immediately before committing so an old quote cannot silently spend the wrong amount.
- Ordinary small reversible purchases use one clear purchase action plus Undo; avoid a confirmation dialog for every +1. Career changes, promotion requirements and other consequential transitions use a review with explicit before/after information.
- Career section groups progress, next-level Trapping credits, specialisations, promotion and Change Career. Distinguish a paid Career transition from a manual correction.
- Purchase history is secondary and expandable, with access to complete Journal history. General manual XP adjustments stay in Adjust sheet, separate from Award XP.

### Journal

- Local views: Notes / Character / History. Default Notes is readable content with New entry as its main action.
- Notes use title, type, date and a concise preview. Reading expands/opens the entry; editing is explicit. Session, downtime, companions/business and other supported types remain notes, not newly automated systems.
- Character is a readable profile: appearance, background and ambitions, with Edit profile opening the same editor used by the character header.
- History is a chronological audit with filters for purchases/resources/equipment/adjustments, clear reversed-action entries and access to original attachments. Keep current-session Undo distinct from persistent history.
- Historical creator drafts and imported roll records are labeled as original records; never present them as new verified randomness or manager purchases.
- Deletion and raw recovery tools do not sit at the foot of ordinary notes.

## 7. Reusable interactions and difficult states

| Flow/state | Required behavior |
| --- | --- |
| Import | Choose file → review identity, key totals and issues → Import. Large details are expandable. Errors identify the entry/field and remedy. Cancel leaves the library untouched. |
| Library restore | Separate from single-character import. Explain Copy / Skip existing / Replace matching; review affected counts and replacements before applying. Preserve atomic validation and revision checks. |
| Edit profile | Labeled name, portrait and narrative fields. Explicit completion/cancel; do not silently discard a changed draft on closing. Retain the local portrait size/type rules. |
| Adjust sheet | Reachable from character More and contextual detail links. Group Identity/Career, Characteristics, Resources, Abilities and balances. Show calculated/manual comparisons and require existing reasons where applicable. Never hide that a change bypasses paid advancement. |
| Change Fate | Explicit permanent-value wording, old/new preview and deliberate apply. Fortune remains a separate value. |
| Save pending | Compact Saving state; preserve the user's operation and disable conflicting submissions only. No full-page spinner for a small local write. |
| Save failed/conflict | Persistent visible banner near the character header, recovery download, Retry, Save as copy and deliberate Reload. Never let a toast be the only warning. Keep dirty data and safe update guards. |
| Empty abilities/gear/notes | One relevant explanation and action. No repeated large blank cards. |
| Filter has no results | Preserve filters and provide an obvious reset. Do not imply that data was deleted. |
| Blank/incomplete character | Explicit missing values and guidance; do not fabricate Species, Career, scores, money or mechanics to make the layout look complete. |
| Above-maximum resource | Preserve the stored value and explain it; never silently clamp/refill while redesigning. |
| Archived character | Clearly labeled archive state, Restore action, retained export/open behavior. |
| Large history/roster | Keep search responsive and page long lists without changing their order or losing position. Only introduce virtualization if measured need justifies its accessibility complexity. |

Dialogs share heading, body, inline validation and footer order. Close/Escape/backdrop behavior is consistent; protect unsaved long-form drafts. After close, focus returns to the opener; after a list mutation, focus moves to a sensible remaining row or heading. Dynamic confirmations are announced without repeatedly reading the entire page.

## 8. Feature placement and data protection

No existing manager capability is discarded merely to simplify the interface:

| Existing feature | New home |
| --- | --- |
| Overview and Session view | Combined Play; narrative/profile fields move to Journal Character/Edit profile |
| Skill/Talent totals, ranks, descriptions, sources, pinning | Abilities; favourites mirrored on Play |
| Combat attacks and protection | Play; equipment details remain in Gear |
| Magic, prayers, Cants, Traits, runes, techniques and custom references | Abilities categories and entry details |
| Current Wounds/Fortune controls | Single shared resource band |
| Fate and permanent/manual resource values | Play facts and Adjust sheet |
| Equipment, quantities, placement, acquisitions and money | Gear |
| XP awards, purchases, tracker, Trapping credits and Career progression | Advance |
| Background, ambitions, typed notes, audit and attachments | Journal |
| Name, portrait, appearance | Edit profile, with readable Character view |
| Import/whole-library backup/restore | Library/application menu |
| Individual exports, duplicate, archive, manual corrections | Character More/contextual links |
| Undo/Redo | Character toolbar, same per-character histories |
| Install/update/creator switching and legal/privacy links | Shared application menu/footer |

Preserve the current schema and store/engine contracts wherever possible. This is a presentation and interaction redesign, not a reason to normalize away manual values, recreate characters, rewrite purchase histories, double-apply bonuses or touch creator drafts. Player and Marijan imports continue to use identical tools without source badges or restrictions. Preserve local-only storage, recovery, offline use and export behavior.

## 9. Implementation sequence

1. **Validate the design with realistic content.** Review desktop Play/library and 390px phone Play, including a long name, active Conditions, spells and a large equipment list. Agree the navigation and information order before extending the full interface. The accompanying concept illustrates the proposed Play arrangement; it is not an implemented app.
2. **Create the manager's own shared shell.** Compact header, character identity, five destinations, one resource band, save status, toolbar and shared menus. Establish tokens and control variants; stop inheriting the creator's action rail/editor/folio structure.
3. **Rebuild Play and the library.** These establish the quality baseline. Remove duplicate Overview/Session UI only once every useful field/action has an explicit home.
4. **Rebuild Abilities and Gear.** Compact lists, consistent detail surfaces and coherent acquisition/money flows.
5. **Rebuild Advance and Journal.** Browseable purchases, Career review, readable notes and complete history. Reuse engine calculations and store commands.
6. **Complete exceptional flows.** Import/restore, editing, manual adjustments, archive/delete, save failure/conflict and backup recovery.
7. **Review the actual rendering and interaction.** Check content density, first useful viewport, focus/keyboard, touch, enlarged text, empty/worst-case data and cross-browser behavior. Verify imported totals, exports, independent Undo and offline storage still agree with the existing baseline. Update behavior docs to the implemented design only when it exists.

Proposed component boundaries: ManagerShell, CharacterHeader, CharacterNavigation, ResourceBand, SaveStatus, CharacterLibrary, PlaySheet, AbilityList/AbilityDetails, GearList/AcquisitionEditor, AdvancementList/CareerReview, JournalViews, ProfileEditor, AdjustmentEditor and shared dialogs. Keep calculation and persistence out of layout components. Break up the current large Manager component as screens move; avoid a large unrelated engine refactor.

## 10. Acceptance criteria

The redesign is ready only when its rendered interface meets these checks:

- At 1440×900 and 1280×720, opening a typical character shows current resources, all ten Characteristics and useful attack/Condition information without scrolling through profile fields or file controls first.
- At 390×844, opening Play shows identity, usable resource actions and all ten Characteristics; the beginning of attacks or active Conditions is visible before a long scroll. At 320px and 200% text enlargement, preserve readable content and reachable actions even if this first-viewport target must yield to reflow.
- Changing destination takes one action from every character screen. Changing Wounds or spending Fortune takes one deliberate action; direct exact-value editing can take two.
- There is one global navigation system and one full resource controller on each rendered screen. No duplicate Overview/Session destination or permanent file-action wall remains.
- Everyday play has no always-visible name/appearance/GM override form. Explicit editing remains discoverable from a labeled action.
- Tables align values; phone rows retain their labels. Long names, specialised ability names, missing portraits, unknown data and five-digit XP totals neither overlap controls nor create horizontal page overflow.
- No internal scrolling navigation rail, obscured final row, dialog keyboard obstruction or giant empty footer area at phone/tablet/desktop widths.
- Keyboard users can reach every action, see focus, close dialogs and return to their opener. Touch controls fit 44px targets without overlapping neighbors. Meaning is never conveyed by green/brass/red alone.
- Common controls, detail views, dialogs, menus, typography and spacing look and behave the same across all five destinations and the library.
- Imported character totals/manual offsets, paid purchases, per-character Undo, backups/restore, conflict recovery, offline use and PDF/JSON exports retain their existing guarantees.
- Run focused manager domain/store/UI checks and development-rendering verification after implementation. Check shared creator menu/shell screens if shared components change. Inspect screenshots as well as passing automated checks; automated correctness is not proof of good design.
- Describe phone checks as emulated until someone has verified actual iOS/Android hardware, including keyboard, safe area and scroll behavior.

## 11. Scope and recommended decision

Recommended direction: five task destinations, Play as the default, no permanent side rails, one resource band, green framing around a clean paper sheet, and deliberate editing flows. This addresses navigation, task order, density and interaction together rather than applying another layer of decoration.

Scope is the character manager and the minimal shared controls required for consistency. Retain the other creators' established themes and mechanical behavior. Any change to their shared menu must be verified across modes. This proposal does not include cloud accounts/sync, campaign management, new dice automation or unreviewed rules.
