# Shared UI/UX implementation — 10 October 2026

Current maintenance note (Next migration): the dated results below describe their original implementation. React components and mode stores now own the shell, native fields/disclosures, issue presentation and busy states; `interface-kit.mjs` and the mobile-shell controller have been removed. Use `src/components/`, `src/features/`, `src/styles/interface.css` and `src/styles/mobile-shell.css` for current changes.

Skills feedback correction, 19 October 2026: the Species five-choice and Career eight-Advance validation messages now appear below their complete selection sections, rather than inside the first Skill. The React issue connector uses explicit issue-code group destinations; individual choice errors retain their existing local placement. The allocation browser regression checks both messages outside all Skill rows at 320/390/430/1024/1440px and retains the existing field association, overflow and XP-control checks.

## Tablet polish — 17 October 2026

Compact navigation now extends through 1000 CSS pixels across all modes; live tool/history/search nodes restore on crossing 1001px. Search filter layout remains independent at 760px. Marijan Characteristics use an editor container with two/three/five columns and readable 64px number inputs. Coarse-pointer standalone actions and selects retain 44px touch targets, while inline prose links keep their compact appearance. Local tablet cases cover portrait, landscape, larger display settings and reduced height; physical-device behaviour is not certified. Verification: 15 tablet cases, 24 shared interface/shell cases (four intentional skips) and two narrow-screen allocation cases passed. Portrait GM/Player, portrait/landscape Marijan and short-landscape print screenshots were visually inspected; code, formatting and offline checks passed.

## Player Review sheet — 15 October 2026

Replaced the long review tables and export explanations with a compact sheet: identity/rank, current Characteristic cells, resource and XP/money strips, trained Skills with totals, Talent ranks, magic and structured weapons/armour/belongings. Current load effects come from the shared character result. Native disclosures retain breakdowns, descriptions, untrained Basic Skills, PDF options, background/ambitions, notes, XP/dice history and book-specific references. Missing creation choices stay visible and actionable before export; section Edit controls return to existing steps. Scoped `review-sheet.css` inherits the Black Banner tokens, pairs desktop columns and stacks phone sections with 44px targets. Export files and rules are unchanged. Focused review and actual PDF-download checks use desktop/mobile Chromium; physical phones are not claimed.

## Mobile allocation feedback — 15 October 2026

Phone screenshots exposed three sibling-layout failures: Characteristic allocation feedback stretched the first score cell, Career Skill feedback entered the +/- stepper, and 44px touch help buttons overlapped XP actions in a reserved 32px column. The shared issue connector now places those messages at the grid/row level. Responsive point columns keep at least 72px per cell; XP help tracks and buttons share one size. Validation rules, amounts and calculations are unchanged. `tests/browser/mobile-allocation.spec.mjs` checks message placement, control separation and touch bounds at 320/390/430px, plus XP geometry at 790/1440px and coarse-pointer widths. These are emulated checks, not physical-phone certification.

Focused verification passed: 22 interface/layout browser cases (four conditional skips), the extra desktop allocation checks at 1024/1440px, three shared presentation tests, syntax/format and offline inclusion. Mobile and desktop screenshots were reviewed. The broader release gate did not pass; its unrelated outstanding checks are recorded in TESTING.md and were not folded into this UI fix.

## Additional UI guidance — 15 October 2026

Installed the `emil-design-eng`, `mobile-native` and `break-ui` skills from `emilkowalski/skills` in the local Codex skills directory. Use the relevant guide for interaction polish, mobile platform behavior or realistic edge-case reviews respectively, alongside the existing UI/UX Pro Max, Web Design Guidelines and Frontend Design skills. Project instructions retain this preference for future chats. This installation does not add runtime packages or change the app's artwork, theme or animation policy.

Apply their recommendations to observed problems: preserve readable focus/press states and reduced motion, prefer capability queries and existing native controls on mobile, and exercise plausible long names, empty/one-item lists and accepted numeric limits through development fixtures. Load only the relevant skill/reference and run checks proportional to the change. Keep physical-device verification limits explicit; a desktop mobile viewport does not certify iOS/Android behavior.

Implements the approved fourteen-point review using UI/UX Pro Max, Vercel Web Design Guidelines and Frontend Design. The original planning document remains in the parent workspace at UI-UX-REVIEW-PLAN.md. The approved three material-fantasy themes are retained; no art, sound, framework, rules, prices, saved schemas or export payloads are changed.

## Completed changes

| Review item | Implemented result |
| --- | --- |
| 1. Touch targets | Shared 44px phone inputs, tabs, dice and primary actions; compact source chips extend their vertical hit area. |
| 2. Bottom-bar states | Player shows View character while editing and Back to choice while viewing, preserving history/resources, focus and return scroll. |
| 3. Readable text/numbers | Supporting text uses 12–13px, phone fields 16px; folio numbers use aligned body digits. Opaque disabled actions remain legible. Decorative banner captions remain ornamental. |
| 4. Shared controls | Field/select intent, dice SVG, tabs and disclosures use common controls; enhancement, issue association and busy handling live in interface-kit.mjs. Geometry is in interface.css, colours in semantic tokens. Obsolete tracker layout overrides removed. |
| 5. Experience density | Short XP strip, compact level/tracker/promotion card, inline filters and nearby tabs/+1/+5. Longer policy/rules expand on demand. Advance controls no longer form a second sticky layer. |
| 6. Origins/Career density | Tighter introductory/section gaps and metadata, aligned suggestion/dice actions, retained meaningful fields, required supplement choices and roll/chosen/search order. |
| 7. Search/reader | Clean excerpts for every category, selected rows, quieter empty reader hint, bounded prose width, readable hierarchy. Printed reader content, chaining, filters and batches preserved. |
| 8. Disclosure language | Native disclosures share chevron/hit-area conventions and stable persisted UI keys; compact folio/entry chevrons retained as a variant. Only multi-option Skill families expand in Experience. |
| 9. Issues/empty state | Structured control targets produce inline messages and aria-invalid/aria-describedby associations; resolved feedback clears. Fresh GM creation starts with a neutral invitation. Required export gates remain; Marijan stays unrestricted. |
| 10. Long operations | Generation/PDF actions share a painted busy label, preserved width, duplicate guard, restored control and persistent retryable failures. Loading placeholders have accessible status. Completed notices remain transient. |
| 11. Navigation/accessibility | Stable main and skip link in every mode, native numeric input intent, retained roving keyboard tabs/modal Escape/Back, and focused phone fields kept above fixed bars/visual viewport. |
| 12. Visual hierarchy | Clear page/section/disclosure levels, fewer redundant template eyebrows and tighter interior spaces; approved artwork, frames, textures and palettes retained. |
| 13. Folio comparison | Compact Characteristic/resources, tabular numbers and aligned counts; centred emblem and desktop bounded scroll remain, with deliberate phone View/Back flow. Actual Traits and source/calculation access retained. |
| 14. Regression/maintenance | Focused local interface/browser tests, pure excerpt/control regressions, small three-theme screenshot set, measured long lists and same-commit documentation. Lazy loading/offline build preserved. |

## Verification evidence and limits

Isolated desktop 1440×900 and phone 390×844 captures cover Player Origins/Career/Experience, shared search, GM profiles/Griffon Customise and Marijan. None of these samples overflowed horizontally. A 720×450 narrow logical viewport also had no page overflow in all three themes; this approximates 200% desktop layout width rather than certifying physical browser/OS zoom.

Semantic text pairs measured at least 5.00:1 (muted on paper); the lowest sampled paper focus pair was 3.92:1. Composed primary-button screenshots, sampling three interior background points per state, measured text/background minima of 8.46/10.34/10.34/5.88 for Player normal/hover/focus/disabled; 7.72/9.41/9.41/6.44 for GM; and 8.24/10.46/10.46/5.98 for Marijan. These samples support the checked control states, not a claim of exhaustive contrast certification over all artwork, text or settings.

A local desktop measurement inserted 300 actual Rules results and forced layout five times: 7.6–8.4ms. Existing 20-row incremental loading was retained. No containment/windowing was justified by that measurement. Real low-end device performance may differ.

The local interface suite covers skip/main focus, numeric intent and touch sizes, contextual folio navigation, compact Experience/help persistence, keyboard tabs, neutral/inline GM errors, clean snippets/Back selection and duplicate-safe retry behavior. Existing rule, history, save/load, generation, PDF, search and offline suites remain the release boundary. Ignored screenshots/metrics are in test-results/ui-implemented; pass captures are produced by the interface suite.

Physical iOS/Android keyboards, OS native selectors and full screen-reader behavior remain unverified on this Windows host. Native controls and VisualViewport handling are retained, with narrow/short viewport and keyboard navigation checked locally. No broader conformance claim is made.

Verification completed: syntax/import checks, formatting, validated book/generated outputs, all 417 Node regressions and offline inclusion of 303 published assets passed. The release browser run passed 121 cases, with two Marijan density failures and one deliberately phone-only scenario skipped on desktop. After correcting the shared disclosure's placement in compact rows, the focused follow-up passed all 17 applicable cases (the two failed density cases plus the interface regressions); one desktop phone-only case remained skipped. Combined coverage is 123 distinct passing browser cases, one intentional skip. The unchanged rule suite was not repeated for that CSS fix.

The final generated worker includes the corrected interface. Commit locally; do not push without the user's separate authorization.

## Emil review implementation — 15 October 2026

Implemented the eight authorised findings in UI-REVIEW-EMIL-2026-10-15.md:

| Before | After | Purpose |
| --- | --- | --- |
| Fixed narrow Marijan numeric columns | Value-sized fields; spinner decoration removed; second control row at up to 360px | Keep all digits readable while retaining numeric semantics |
| Custom Skill names shown only in narrow inline inputs | Compact name plus full heading and Rename Skill in expanded details | Preserve row density and readable identity |
| Repeated mobile GM name and full description above statistics | One visible phone heading; Description disclosure below statistics | Keep the stat block easy to reach |
| Profile books before selected GM identity | Foundation/identity first, then a native book-selection disclosure | Keep secondary configuration accessible without dominating the screen |
| Raw large display totals | Shared displayNumber/score grouping and round-trip-safe grouped money | Scan totals accurately without changing saved/input numbers |
| Ungated hover styles | Capability-gated hover rules throughout the creator stylesheets | Avoid mouse hover treatment on coarse touch input; preserve keyboard focus |
| Incomplete safe-area contract | viewport-fit=cover and top/side/bottom safe-area spacing on the shared surfaces | Keep edge-to-edge art and inset controls |
| Hover-only general button feedback | Immediate brightness press feedback; tap-highlight suppression scoped to controls | Respond to touch without extra animation |

The context-Career resolver is a hoisted function to keep its existing circular import graph safe when formatting/market helpers are imported independently. This changes no creation mechanics. Existing VisualViewport keyboard handling, per-mode colours, native selectors, shared Undo/Redo and motion restrictions remain. GM full review/PDF descriptions remain complete. Physical notched-device and software-keyboard behavior still needs a real phone; local desktop/mobile checks are not hardware certification.

Verification: focused hover/focus/press and GM folio cases passed on desktop/mobile; the renamed custom Skill and persistence cases passed after correcting a test locator to the open details panel. Existing mobile-shell, resource editing, unrestricted editing and compact-row checks passed, as did the Night Parade book-picker/template flow. All 24 local review-fixture combinations still had no horizontal page overflow. Display/money round-trip tests and the affected rule/Marijan checks passed; the copy test exposed the unfinished-Career snapshot issue and passed after preserving empty Career/neutral Standing. Quick checks and the 375-file offline worker passed. No live deployment was tested or pushed.


15 October approved materials: shared rail/folio backgrounds now use matching Tavern oak (Player), Crypt masonry (Bestiary) and Pressed ash vellum (Marijan) at fixed Subtle strength. Central theme tokens and three local SVGs replace the old flat/differing backgrounds and candle overlays. Texture is painted beneath controls, remains static under reduced motion and is excluded from print. Mobile inherits the shared surface. See DESIGN-SYSTEM.md for ownership, provenance and focused verification.
