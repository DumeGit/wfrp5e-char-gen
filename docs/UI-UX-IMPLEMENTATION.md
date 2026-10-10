# Shared UI/UX implementation — 10 October 2026

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
