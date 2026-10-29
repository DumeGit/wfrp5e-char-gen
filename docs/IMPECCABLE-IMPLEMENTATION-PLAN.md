# Whole-project critique: implementation plan

29 October 2026. **Implementation complete.** All F01–F09 findings are implemented and verified; D01/N01 remain deliberate preservation constraints. The [completion report](IMPECCABLE-IMPLEMENTATION.md) records evidence and the independent follow-up critique. The original scope remains all actionable findings from the [whole-project critique](../.impeccable/critique/2026-10-29T08-30-10Z__src-app.md), including its smaller observations.

The baseline is **29/40, Good**, with five P2 priorities and no P0/P1 established in the inspected workflows. The critique was recorded in `8e23539`; source reinspection for this plan found the same causes. The score is an expert-review judgment, not a measured task-success rate. The original snapshot remains historical evidence and must not be rewritten as fixes land.

## Intended result

Keep the approved Imperial Desk identity and make the next task easier to find. A user should be able to complete a choice without traversing optional reference content, leave creation with an editable backup and clear play instructions, navigate to new manager content with the keyboard, read supporting text, and record a Condition before reading its full rule.

This is an application refinement, so implementation is code-first. No new animation is justified: navigation/focus and frequently repeated recording actions stay immediate. Existing reduced-motion, hover gating, press feedback and dialog lifecycles remain authoritative.

## Coverage and disposition

| ID  | Critique finding / Before                                                                                 | Planned After                                                                                                  | Why and disposition                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| F01 | Manager drawer navigation selects a hidden library heading as the focus destination.                      | Resolve the intended visible destination heading, then a visible heading/main fallback.                        | Confirmed keyboard defect; fix first.                                                                                             |
| F02 | Player supporting footer text uses a pale dark-chrome token on parchment.                                 | Use an ink role scoped to notes on paper, retaining dark-chrome status colours.                                | Confirmed readability defect; fix first.                                                                                          |
| F03 | Book setup and completed Career/Gear choices place continuation after long content.                       | Offer existing continuation actions near the decision, retaining bottom actions and optional references.       | Reduce traversal without removing rules or options.                                                                               |
| F04 | Player Review foregrounds PDFs while the reusable JSON save and manager handoff are indirect.             | Add a secondary editable-save action and concise save/import guidance at Review.                               | Make the end of creation useful for reopening and play.                                                                           |
| F05 | Complete Condition rules precede Count, with manual-effects guidance below the fields.                    | Put immediate recording fields and manual scope first; retain complete rules in a labelled disclosure.         | Speed routine play without adding automation.                                                                                     |
| F06 | Compact setup shows 1. Origins while the page shows Choose your books.                                    | Show an accurate setup context until books are applied/cancelled.                                              | Remove a navigation mismatch; do not create a ninth creation page.                                                                |
| F07 | Adjacent Marijan phone initial values and totals are weakly grouped.                                      | Clarify cell boundaries and visibly identify calculated totals; allow within-cell wrapping at narrow sizes.    | Visual grouping refinement, not a claim of established clipping.                                                                  |
| F08 | Bestiary's compact introduction/filter stack pushes profile results below the first viewport.             | Keep search prominent and move optional Category/Book controls into a compact, labelled filter disclosure.     | Make the central profile task arrive sooner while retaining all filters.                                                          |
| F09 | An untouched missing Bestiary profile looks like an input error immediately.                              | Use a neutral required-choice reminder initially; retain explicit validation/error presentation when relevant. | Calmer entry without removing requirements or export blocking.                                                                    |
| D01 | Detector emits 15 styling records across five CSS files, including duplicate sites and semantic markers.  | Preserve meaningful selection/Career/error indicators; keep the triage in the critique.                        | No bulk stripe removal, detector suppression or palette replacement. Reassess only if a changed component creates a real problem. |
| N01 | Shared identity, readable reference/legal pages, current calculations and phone play hierarchy work well. | Preserve these as regression constraints.                                                                      | Positive observations need no speculative redesign.                                                                               |

## Implementation sequence

### 1. Repair focus and supporting-text contrast — F01, F02

**Owners:** `src/components/WorkspaceMenu.tsx`, `src/features/manager/ManagerWorkspace.tsx`, `AdvancementScreen.tsx`, `JournalScreen.tsx`, and shared paper-note rules in `src/styles/design-system.css` / `interface.css` as appropriate.

- Replace the first-h1 assumption in `focusEditor`. Give current destination headings an explicit navigation-focus marker where needed; choose only rendered targets. Fall back to a visible h1, then the focusable main. A hidden ancestor must disqualify a target.
- In the manager, select the visible Play/Advance/Journal destination rather than the mounted hidden library. Keep the current single shared menu and child-dialog restoration behavior. Programmatic focus uses `preventScroll`; existing navigation controls keep ownership of intended scrolling.
- Scope the footer colour correction to paper content. Do not change `.pwa-status`, rail status or the public footer just because they share a historical selector. Check every rendered use of `.footer-note` across all modes.

**Acceptance:** From a populated manager at compact widths, Enter on Advance/Journal in the menu closes the menu and focuses the intended visible content heading. The next Tab reaches a sensible content action. Library navigation, Escape, child-dialog cancellation, resize transitions and the three creators retain their focus behavior. The supporting Player note is readable at a normal-text contrast target of at least 4.5:1 against representative rendered paper backgrounds; actual gradients/texture must be inspected as well as token calculations.

**Verification:** Extend focused outcome checks in `tests/browser/emil-audit.spec.mjs` and/or `unified-desk.spec.mjs`; reuse manager fixtures. Run the interface selection and development rendering checks. Visually inspect paper and dark-chrome notes in all four modes. Do not create a test that merely asserts the chosen CSS token string.

### 2. Restore creation momentum and accurate setup context — F03, F06

**Owners:** `src/features/player/presentation/book-ui.mjs`, `features/workspace-shell.mjs`, `features/creation-views.mjs`, `features/origins-view.mjs`, `flow-ui.mjs`, and their scoped workspace/mobile styles.

- Offer **Use selected books** above the book catalogue as well as at the bottom. Both controls invoke the same existing `apply-books` handler and reflect the same live checkbox selection. Preserve the current reset confirmation and Return to character behavior; add no saved book presets.
- While book setup is open, show **Choose books** as the compact context. Hide/replace the normal step selector in that state rather than adding a fake saved step. Applying/cancelling returns to the existing eight-page navigation and its retained step. Six required readiness stages remain unchanged.
- In Career, keep the chosen Career summary, required training/options and a contextual **Continue to Characteristics** action together. Put read-only alternatives and the full four-level path behind clearly labelled Change/Browse and Career-reference paths where they no longer interrupt continuation. Keep Find a Career available and preserve preview-versus-apply semantics.
- In Gear, place the existing forward action near the immediate decisions/status, while leaving kit, money, shopping and full details accessible below. Retain a bottom action for users who read the full page.
- Reuse the existing `step` and book handlers. Do not add stricter completion gates, auto-select Species/Careers, erase allocations or change the existing ability to navigate incomplete drafts. Required supplement controls and actionable warnings must remain visible when relevant.

**Acceptance:** At 390×844, the book-application action is reachable without passing the whole 21-card catalogue. Once a Career is chosen, a contextual Continue is adjacent to that decision rather than beyond the whole Career reference. Gear offers the next task before the full optional browsing content. Both top/bottom actions produce identical state/history. Current Career search/filter synchronization, XP creation locks, incomplete-draft saving and required supplement warnings are unchanged. Focus/scroll destinations stay visible above fixed history/balance strips.

**Verification:** Add focused browser journeys to `interface.spec.mjs` / `pc.spec.mjs`; retain `mobile-allocation.spec.mjs` sibling-overlap regressions. Run relevant Player/interface journeys and the existing review/disclosure Node tests. Inspect empty, chosen and XP-locked states, plus a supplement fixture with required choices. Assert action location relative to its decision, not a brittle whole-page height.

### 3. Explain editable saving and the play handoff — F04

**Owners:** `src/features/player/presentation/review-sheet.mjs`, the existing `save-file` action in `features/actions.mjs`, and reference/link patterns already used by the shared shell. Review Marijan/Bestiary save wording for consistency without claiming their handlers are identical.

- Add a clearly secondary **Save editable character (.json)** action at Player Review. Invoke the existing JSON handler, retaining its filename, schema and success feedback. Do not route it through PDF preparation or add a new export format.
- Keep editable saving available for incomplete drafts; keep the existing PDF blockers. Make that distinction explicit near the action.
- Add short guidance: browser autosave remains on this device; JSON is the downloadable editable backup; the separate Character manager imports a supported character JSON for play. Link to `/manager/`, preserving verification mode in tests.
- Do not promise that an unfinished/unsupported character can be imported into the manager: its existing Species/Career/version validation still applies. Do not add automatic transfer, shared mutable drafts, account sync or automatic historical XP reconstruction.

**Acceptance:** A user can download actual JSON from Review, reload it into the creator, and import a complete supported fixture into the manager through its existing preview. The original draft remains independent, values/attachments remain intact, and no browser navigation implies that data transferred automatically. PDF readiness and output remain unchanged. No PDF runtime is fetched merely to save JSON or follow the manager link.

**Verification:** Extend `review.spec.mjs` / `storage-exports.spec.mjs` with a real JSON download/reload/import journey and one unfinished-draft case. Reuse manager import/totals tests. Scope selectors to the relevant panel/dialog: the documented existing PWA journey has an ambiguous New blank character selector, and new tests must not repeat that pattern. No PDF geometry change is planned.

### 4. Put play-time recording ahead of optional rules — F05

**Owners:** `src/features/manager/ConditionFields.tsx`, its `StatusFields.tsx` integration, and existing manager dialog/disclosure styles.

- Order the content as selection, Count when stackable (or the existing non-stacking statement), notes, and the existing manual-effects scope before the recording action.
- Put the full canonical summary and source action in a native, labelled **Condition rules** disclosure after the immediate entry controls. Preserve the full text, source/page, reference chaining, loading feedback and Retry behavior.
- Keep load failures understandable; collapsing reference text must not make a failed load or recovery path undiscoverable. Recording semantics, default Count, non-stacking limits and custom Conditions remain unchanged. Add no automatic numerical effects or recovery.

**Acceptance:** After selecting Bleeding on a phone, Count and the manual-effects statement are available before the long rule. Complete rules remain keyboard/touch accessible. Non-stacking Conditions still omit Count, custom entries still work, Cancel preserves the sheet, and saving records exactly the same data as before.

**Verification:** Extend the existing sourced-Condition journey in `tests/browser/manager.spec.mjs`, including stackable/non-stacking/custom selection, disclosure access and failure/retry where supported. Run affected manager Node/store checks and inspect the open dialog at 320px/390px with a reduced viewport height. Do not test by copying the implementation's DOM structure.

### 5. Refine the smaller phone presentation issues — F07, F08, F09

**Marijan owners:** `src/features/marijan/MarijanCreator.tsx`, `src/styles/marijan/style.css` and existing field/number helpers.

- Give each Characteristic a clearer visual boundary and visibly identify its calculated Total. Use existing paper/line/ink roles; do not introduce a new card language. Permit a total to occupy its own line within a narrow cell when needed.
- Preserve actual accessible names, native typing buffers, exact saved values, manual overrides and current container-based two/three/five-column behavior. Keep at least 64px numeric inputs, 16px phone field text and 44px targets. Do not impose new numeric caps to solve a layout issue.

**Bestiary owners:** `src/features/bestiary/Sections.tsx` Starting, scoped `src/styles/gm/style.css`, and the structured issue presentation used by `BestiaryCreator.tsx`.

- On compact screens retain Find a profile as the primary control; put optional Category/Book filters in a labelled disclosure whose summary communicates active filtering. Keep native selectors, dependent resets, full catalogue browsing, empty results and alphabetic order. Desktop filtering stays directly available.
- Reduce redundant compact introductory spacing before results. Keep book/profile context and required guidance; do not shrink typography or touch targets to make the first result fit.
- Present the untouched missing-profile state as a neutral instruction. Preserve its structured issue and export gate, and preserve explicit error/focus treatment when an attempted action or Review issue directs the user there. Any interaction-state flag belongs in transient UI state, not the creature save schema; never infer validation routing from English text.

**Acceptance:** Marijan's editable initial and calculated total remain visually distinguishable at 320px/390px and tablet/editor-container widths, including zero, ordinary and multi-digit values. No adjacent-cell or input/output overlap occurs. Bestiary exposes search/results with less initial traversal; active hidden filters are evident and can be changed/reset. No profile is silently chosen and no invalid creature becomes exportable. These refinements preserve values, history and filter behavior through resizing and reload as currently specified.

**Verification:** Use existing Marijan/browser and tablet fixtures, plus focused Bestiary starting/picker journeys. Measure sibling separation and text fit rather than only page overflow. Treat the grouping concern as a visual refinement; do not report an unobserved clipping defect as repaired.

### 6. Consolidate and independently re-critique

Finish with `$impeccable polish` across the touched surfaces, then re-run `$impeccable critique` against the same whole-project target. Compare findings, not just the score. A higher score or fewer generic detector warnings alone is not acceptance.

- Review updated screens once in a batch after each meaningful change; use focused failed cases to iterate rather than repeatedly rerunning unrelated suites.
- Update README, the affected creator/manager/Marijan/Bestiary guides and current verification evidence with each implementation slice. Update this plan's statuses only when evidence proves a slice complete. Keep the original critique unchanged.
- Use small local commits: (1) focus/contrast, (2) creation/setup, (3) save guidance, (4) Condition entry, (5) phone refinements, then any final scoped polish. No push/deploy is included.

## Shared invariants

- Preserve Imperial Desk materials, palettes, typography, source/legal notices and meaningful selection/error/Career cues. Do not blanket-remove the detector's 15 styling records or add broad ignore rules.
- Preserve the separate creator and manager records, schemas, calculations, exported mechanics, randomness/provenance, history and unsaved/revision-conflict protections. This plan imports no new book rules or automation.
- Keep full-width compact editing, the 1100px shell boundary, visible creator history/balances and manager bottom destinations. Do not restore folios, a finish selector, mobile View/Back mode or saved book presets.
- Keep complete reference content available, but do not conflate a read-only reference with required setup. Never conceal required choices/warnings in the name of reducing density.

## Verification and completion contract

1. Read `craft-floor.md` immediately before UI implementation as Impeccable requires; load the relevant layout/clarify/harden/distill/adapt/polish reference for the slice. Current skill instructions and explicit user decisions govern at implementation time.
2. Run `npm run check:quick` and affected checks proportionally. This Windows checkout has a documented baseline line-ending mismatch: if raw formatting flags only CRLF/LF, retain that distinction and run `npm run check:code` plus `npm run check:format -- --end-of-line auto`; do not mass-reformat unrelated files or call the default check green.
3. React rendering changes require `npm run test:ui:dev`. Use the affected Node tests and `test:ui:interface`, `test:ui:pc`, `test:ui:manager`, `test:ui:marijan` or `test:ui:gm` selections per slice; the runner prepares current assets. Keep browser runs isolated by output directory and owned ports when another session is testing.
4. For the final combined patch, complete the production build, type/store/module/format checks, applicable interface/Player/manager/Marijan/Bestiary journeys, `npm run test:ui:tablet`, and `npm run check:offline`. Apply `docs/TESTING.md`'s broader release policy if implementation expands into rules, schemas or a substantial refactor. This plan requires none of those expansions.
5. Inspect representative states at 320/390px phones, 768px tablet, 1100/1101px shell boundary and 1440/2560px desktops. Include 200% zoom/reflow, reduced motion, short viewport/dialog height, keyboard Tab/Enter/Escape and active filter states. Measure control collisions/occlusion as well as document width; validate touch targets and readable labels. Emulation does not certify physical keyboards, phones or assistive technology.
6. Prove real outcomes: visible keyboard destination, readable supporting note, nearby continuation, identical top/bottom actions, actual editable-save round-trip/import, unchanged Condition records, distinguishable Marijan values, and complete Bestiary filter/reset/required-state behavior.
7. After all slices pass, independently re-critique and archive a new snapshot. Report every remaining finding or unverified environment; do not overwrite the baseline or substitute a green detector/score for the listed outcomes.

## Status

| Deliverable                            | State       | Evidence                                                                                      |
| -------------------------------------- | ----------- | --------------------------------------------------------------------------------------------- |
| Whole-project critique                 | Complete    | [Archived report](../.impeccable/critique/2026-10-29T08-30-10Z__src-app.md); commit `8e23539` |
| Finding-by-finding implementation plan | Complete    | This document: F01–F09, D01, N01; owner files, sequence, acceptance and verification          |
| Application fixes                      | Complete | F01–F09; [implementation and verification](IMPECCABLE-IMPLEMENTATION.md) |
| Post-fix review                        | Complete | [Independent follow-up snapshot](../.impeccable/critique/2026-10-29T09-10-36Z__src-app.md), 32/40; new backlog disclosed |
