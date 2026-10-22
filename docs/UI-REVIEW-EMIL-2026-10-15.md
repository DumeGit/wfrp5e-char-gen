# Focused interface review — 15 October 2026

**Completed historical review.** The eight authorized findings were implemented; the dated observations, fixtures and limits below are retained as evidence. Current component ownership and responsive behavior are in [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), with later follow-ups in [UI-UX-IMPLEMENTATION.md](UI-UX-IMPLEMENTATION.md).

Applied the installed emil-design-eng, mobile-native and break-ui skills to the shared shell, mobile controls and folios of Player, GM and Marijan creation. This is a focused review, not a complete audit of every creation rule, book, export or screen. No production application files were changed during the initial audit. The subsequent implementation is recorded below.

## Data boundaries

Fixtures enter through each creator's real saved-draft boundary on a separate localhost origin. They do not edit rendered markup and do not touch drafts saved on other origins. Review controls and fixtures live outside dist and are not published. All game profiles/values in the baseline come from the existing core registry; custom names/descriptions are display test data, not new game rules.

| Field | Source | Type / limit | Cases |
| --- | --- | --- | --- |
| Player identity | tests/fixture.mjs soldier; Origins first/surname controls | Strings, 90 characters per name part in the controls | Normal, long compound/diacritic name, J, empty Species/identity |
| Player resources | draft.xp and draft.wealth | Base XP editor accepts whole values up to 1,000,000; source money formatter accepts nonnegative integer pennies | 1,000 XP baseline; 1,000,000 XP / gold crowns stress values |
| GM identity/description | freshGM core Griffon, draft.name/description | Strings; no input maxlength found | Normal, compound name, long description, J, empty profile |
| GM source/category/Traits | printed Griffon via existing core data | Registry strings and lists | Existing profile, no profile, descriptions/required source controls |
| Marijan identity | freshMarijan, draft.name | Unrestricted string; no artificial cap added | Normal, compound name, empty, J |
| Marijan Skill names | entries.skills via makeEntry | Custom strings accepted by the existing draft validator | Long label, compound unbroken label, diacritics, CJK and a grapheme-cluster emoji |
| Skill Advances / total | entry.amount and calculated total | Finite numbers; no imposed upper bound in this unrestricted mode | 0, 125 Advances / 160 total |
| Talent ranks / equipment quantity | makeEntry, entry.amount | Finite numbers | One item; two Talent ranks; 1,000 equipment units |
| XP, currency, counts | Marijan resources and entries collections | Finite values / array lengths | Zero, one, millions; all 45 core Skill entries |
| Banners, labels, actions | Existing runtime rendering | Theme-specific text and native controls | Three themes, phone/desktop/wide and larger root font |

## Observed breaks — highest priority first

| # | Severity | Field / worst case | What happens | Proposed fix / location |
| --- | --- | --- | --- | --- |
| 1 | Broken | Marijan Skill Advances 125 / total 160 | Three-digit values clip in the compact desktop numeric fields. Values remain stored, but the complete displayed number is hard to read. | Give numeric columns enough intrinsic digit width and remove/reserve native spinner space; allow compact two-row layout when needed. dist/marijan/style.css:459; dist/marijan/views.mjs:128. |
| 2 | Broken | Long custom Skill names at 320px | Editable names only expose the first few characters. Several distinct entries are difficult to identify without moving the text cursor. The details panel does not repeat a readable full name. | Show a wrapping full name in the expanded row, with renaming there; keep collapsed rows compact. dist/marijan/views.mjs:161. |
| 3 | Ugly | GM long name and description in mobile folio | The name is repeated in the shared mobile heading and stat-block header. The second copy breaks into narrow fragments; the full description pushes actual statistics far down. | Keep one mobile name heading and use the full available stat-block width. Fold prose behind an explicit Description disclosure; keep statistics first in the compact folio. dist/mobile-shell.mjs:139; dist/gm/sheet.mjs:13; dist/gm/style.css:694. |
| 4 | Ugly | GM profile/template book choices at 320px | The many-book fieldset occupies most of the first screen even with a profile already selected; the selected foundation/identity appears after it. | Put selected foundation/identity first and make the book picker a compact disclosure with a selection summary. dist/gm/views.mjs:139. |
| 5 | Ugly | Marijan 2,000,000 total XP; Player 1,000,000 GC | Some totals render as 2000000 or 1000000 GC while nearby Player XP is grouped as 1,000,000. They remain accurate but are harder to scan. | Shared display-only numeric formatting; retain numeric input values and exact saved amounts. dist/controls.mjs:9; dist/market.mjs:29; dist/marijan/app.mjs:143. |

## Platform / interaction findings from code

These are verified code conditions, not claims that an actual phone reproduced a symptom.

| Before | After (recommended) | Why |
| --- | --- | --- |
| Shared hover styles apply without a hover/pointer capability query, e.g. dist/design-system.css:610 | Restrict mouse-hover treatments to hover: hover / pointer: fine; retain focus-visible independently. | Avoid sticky visual hover states on touch while preserving keyboard feedback. |
| Safe-area CSS uses env() but the three entry points omit viewport-fit=cover, e.g. dist/index.html:5 | Opt into edge-to-edge layout only alongside complete top/side/bottom safe-area padding. Review existing VisualViewport handling before changing keyboard sizing. | Current CSS does not complete the intended edge-to-edge/PWA safe-area contract. Real landscape/notched-device verification is still required. |
| General buttons have hover/focus transitions, but explicit press styling is mostly confined to an old bottom-bar rule, dist/workspace.css:54 | Add restrained shared :active feedback with the existing palette; only suppress native tap highlight once replacement feedback exists. | Touch needs an immediate press cue. Scaling/animation is optional; no extra decorative motion or library is justified. |

## What held up

- No horizontal document overflow was detected across 24 settled-app combinations: all three modes at 320 / 1440 / 2560 CSS pixels with Demo/Worst data, plus Empty/One cases at 320px.
- Long names wrapped in the Player/Marijan folios. Accents, CJK and the emoji grapheme rendered without replacement characters in the tested custom rows.
- Empty Species, no GM profile and empty Marijan entries remained usable. Real values stayed unchanged by the fixture switch, because every state is a distinct saved draft.
- The separate probes rendered the 45-entry core Skill catalogue and raised root font size to 200% in all three modes without document overflow. This is not a claim of complete browser/OS zoom conformance.
- Existing touch-sized controls, dynamic-height layouts, zoom permission, scoped scroll containers, shared Undo/Redo and the chosen theme colours should be retained. The fixed theme-colour per entry point matches the app's explicit themes; introducing OS-driven themes is unnecessary.

## Decisions / recommended order

Fix 1–3 first. For custom Skill names, prefer a full readable name in the expanded row instead of making every compact row taller. For the GM compact folio, show the name once and keep descriptive prose available through a disclosure. Then apply 4–5 and the shared mobile polish together. No new framework, animation library, palette or extensive motion is needed.

## Local preview and verification limits

Run `node scripts/ui-review-preview.mjs`, then open http://127.0.0.1:8211/__ui-review. The bottom controls select Player/GM/Marijan and Demo/Worst/Empty/One/Core Skill catalogue. The URL retains the selection. Catalogue adds all printed core Skill names only in Marijan; it does not mutate the PC/GM mechanics. User drafts on other origins are untouched.

Run `node scripts/ui-review-audit.mjs` while that server runs for the scoped measurements and captures; `node scripts/ui-review-probes.mjs` adds GM mobile folio, large-root-font and catalogue probes. Captures/measurements are ignored under test-results/emil-review. Both audit scripts use settled workspace rendering rather than the startup placeholder.

A physical iOS/Android device, its software keyboard, real safe-area insets, tap highlight and sticky-hover behavior were not tested. The preview is intentionally local; no deployment/push and no production UI changes were made.

## Implementation follow-up — 15 October 2026

The user authorised all eight items, including custom Skill details. Implemented value-sized numeric controls, expanded custom Skill names/renaming, compact GM folio descriptions and a single mobile name, identity-first/collapsible GM books, shared number grouping and grouped-currency parsing, capability-gated hover, safe-area opt-in/padding and immediate non-moving press feedback. The review table above is the historical before-state. Focused regressions and remaining physical-device limits are documented in TESTING.md and UI-UX-IMPLEMENTATION.md. No framework, animation library or new rules were added.
