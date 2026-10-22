# Character manager: implemented layout specification

Current as of **22 October 2026**. This replaces the original proposal and its superseded amendments with the implemented design. The user approved the redesign while retaining the shared header, then requested the visible desktop left menu and the compact unified Play sheet. Earlier proposals remain in Git history. [CHARACTER-MANAGER.md](CHARACTER-MANAGER.md) documents data, rules, imports, persistence and verification.

## Purpose and visual hierarchy

The manager is a readable character sheet for play, with advancement and records nearby. Frequent actions stay beside their values; file operations and exceptional corrections live in dialogs.

Use the Imperial field ledger theme: olive navigation, sage frame and supporting headers, warm paper working areas, dark ink and restrained brass. Semantic values live in `src/styles/design-tokens.css`; geometry lives in `src/styles/manager.css`. Static field canvas belongs to the application menu, with no texture behind scores or prose. The generated banner uses the supplied fantasy-sports reference; [provenance and exact prompt](../design-assets/field-ledger/README.md) remain separate from the shipped WebP.

Keep `CreatorFrame` masthead height, emblem, brand/search controls, corner stars, focus roles, safe areas and footer consistent with the other workspaces. The compact header places Menu before Search in visual and keyboard order. There is no manager-specific replacement header, sound or decorative motion.

## Application menu and identity

Above 1000 CSS pixels, a joined 230px left menu contains the shared four-workspace switch, prominent Character library, three grouped dialog launchers, shared Undo/Redo arrows and the install slot. The menu joins the main frame; there is no creator step rail or right resource folio.

| Launcher | Contents |
| --- | --- |
| New & import | Blank character; previewed Player, Marijan and manager JSON imports |
| Save & export | Character JSON/PDF; complete-library backup and previewed restore |
| More | Character actions: profile, Adjust sheet, duplicate, library favourite, archive and confirmed deletion |

At 1000px and below, `CreatorMenu` contains library, grouped actions, history, install and mode links. No duplicate library button appears above the sheet. Nested dialog transitions restore focus to their original launcher. Closing changed profile/journal drafts offers discard protection; deletion and library replacement retain their explicit confirmations.

The character heading contains one readable name, a profile pen directly beside it, compact Species/Career metadata, adjacent Fate/Fortune controls and one save status. Display names use single-line ellipsis with the full name available in titles and editing; stored/exported names remain complete. Recovery failures remain visible with exportable unsaved copies.

## Destinations

| Destination | Role |
| --- | --- |
| Play | Combat, Status & afflictions, Characteristics, Skills, Talents, Magic & Faith, Other abilities and Gear |
| Advance | XP awards, legal +1/+5 and Talent purchases, tracker, Trapping credit, promotion and Career changes |
| Journal | Notes/background/ambitions, filtered persistent history and original attachments |

Desktop uses compact horizontal destination controls; compact layouts use Play/Advance/Journal bottom navigation. Legacy section links map to the relevant destination/card. Back/Forward restores route parameters; browsing, filters and collapse choices do not create edits. There is no separate Abilities or Gear destination, parent Abilities card, owned-ability search, ability favourite section/star or Jump-to control. A contextual Manage gear action opens and focuses Gear. Library favourites remain supported.

## Play sheet

Desktop starts with Combat and Status & afflictions side by side, followed by a compact full-width Characteristics strip, the independent ability sections and Gear. The abilities area gives Skills the larger column and stacks supporting sections alongside it while space permits. Cards have clear boundaries and compact sage headings; action controls look interactive.

| Card | Contents and behavior |
| --- | --- |
| Combat | Current/maximum Wounds with small ± controls, Movement, three-column ready attacks and four-location AP/Soak grid. Conditional shield guidance stays beside protection. |
| Status & afflictions | Enc/capacity, Corruption, Sin, Conditions, critical wounds and mutations. One Add dialog selects type. Records have notes and edit/remove actions; critical wounds add location/side and recovery notes. Healed/inactive entries can be restored. |
| Characteristics | Ten aligned current scores with available calculation context; exceptional adjustments stay in Adjust sheet. |
| Skills | Plain, noninteractive name / linked Characteristic / score rows. Small Basic/Advanced dividers span the section. Each group flows alphabetically top-to-bottom through two balanced columns, three from 1800px, one on phones; repeated Char/Score headings stay aligned. No row buttons, details toggles or tab stops. |
| Talents | Compact owned ranks and expandable reference/manual details. Its own heading, collapse and Add action. |
| Magic & Faith | Owned knowledge and expandable reference/manual details, with its own heading, collapse and Add action. XP advancement remains in Advance. |
| Other abilities | Traits and other retained references, with its own heading, collapse and Add action. Imported mutations appear once in Status. |
| Gear | Expandable equipment tiles, search/location filters, quantity/location/manual details, acquisition and money transactions. Unknown prices/weights remain explicit. |

All four ability sections use level-two headings and independent collapses; Basic/Advanced Skill labels use level three. Each Basic/Advanced group balances rows without duplicating/reordering DOM entries or stretching a final orphan. Opening/closing a card hides mounted content without resetting its fields or browsing state.

## Fate, Fortune and touch controls

Fate and Fortune remain adjacent on every destination as plain values with independent decrement/increment controls. Fate changes its stored value without changing Fortune. Fortune changes its current value between zero and its existing maximum; changing a maximum does not refill it. Above-maximum imported values remain visible and reported. Adjust sheet retains explicit resource corrections.

These values are not clickable buttons. Small visual ± controls retain at least 44px phone/coarse-pointer hit areas; phone field text remains 16px. Wounds stays in Combat rather than duplicating a large heading resource band.

An inset joined Fate/Fortune panel was discussed as a possible visual improvement. It is **not implemented or approved as the current layout**; do not document or build it as an accepted requirement.

## Phone priorities

At 719px and below, Play becomes a single normal-scrolling column: Combat, Status & afflictions, the four ability sections, Gear, then Characteristics. Combat starts open. Status starts open when active entries exist; the ability sections, Gear and Characteristics start folded. Each card can be opened independently and retains an explicit user collapse choice across destination changes. The shared application-menu boundary remains 1000px, independently of this phone sheet breakpoint.

Keep identity/resources short so useful play content starts near the top. Preserve complete accessible names, large hit areas, visible focus and safe-area clearance above the bottom navigation. Long names truncate without hiding nearby controls; unusually long numbers reflow without splitting their digits. Emulated phone checks do not certify real-device keyboards or OS controls.

## Data and rule boundaries

The Condition picker reuses all 13 reviewed core entries, pp. 185–187, and accepts custom entries. Critical wounds reuse 80 reviewed core Head/Arm/Body/Leg table rows, pp. 173–176; mutations reuse the existing core catalogue. Version-checked lazy references offer retry without mutating the character. Source citations remain visible.

Afflictions retain effect snapshots, notes, source identities, timestamps and healed/inactive state in optional schema-1 records. Missing arrays default for older saves; malformed records/duplicate IDs are rejected. Imported mutations stay in their original extras entries and render once. Saves, Undo, persistent audit, JSON/backups and PDF appendices preserve them.

Recording a Condition, injury or mutation does not apply its effects or recover resources automatically. Casting, crafting, companions, hirelings, Enterprises and complex downtime remain manual. Advance reuses reviewed prices, prerequisites, tracker rules and Career handlers. Imports preserve totals, offsets, manual values and original records without manufacturing prior purchases.

## Maintenance and verification

Preserve independent creator drafts and manager characters, revision-checked serialized IndexedDB saves, atomic validated restores, per-character session Undo and a separate persistent audit. Updates await pending manager writes even after navigation away; conflicts remain exportable and block unsafe activation.

Use the focused manager browser suite for layout/dialog/resource journeys, manager domain/store checks for persistence or commands and development rendering checks for hydration changes. Inspect changed desktop/phone layouts; rebuild and validate offline assets after UI/asset changes. Documentation-only changes require factual/link/generated checks, not a new browser run. Dated verification evidence lives in [CHARACTER-MANAGER.md](CHARACTER-MANAGER.md) and [TESTING.md](TESTING.md).
