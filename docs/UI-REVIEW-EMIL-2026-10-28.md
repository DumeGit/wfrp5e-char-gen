# Interface audit — 28 October 2026

Reviewed the Player, Bestiary, Marijan and manager screens and their shared shell using `emil-design-eng`. Preserve the approved Imperial Desk materials, mode colours, creator workflows and separate drafts. This pass changes presentation and focus handling only.

| Before | After | Why |
| --- | --- | --- |
| Desktop manager's empty library explains importing/creating but hides those actions in New & import; compact layouts place them in the header. | Import character and New blank character sit beside the empty-state explanation at every width. The header actions remain available for populated compact libraries. | A new user can act where the instructions appear, with consistent placement and 44px targets. Existing import preview and creation handlers remain authoritative. |
| Closing shared book search always focuses the header launcher, even when an editor reference opened it. | Capture the actual opener and restore focus without scrolling; use the launcher if that opener was removed or hidden. | Keyboard readers continue from their place in the editor. Header-initiated search retains its normal return target. |
| Workspace switcher stays open after keyboard focus leaves its links. | Close on focus departure, while permitting Tab between links and retaining Escape/focus return. | Avoid a stale dropdown covering the next navigation controls. |
| Shared hover background replaces the selected destination's background. | Preserve the selected gradient and mode tint on hover, alongside its existing brass accent. | Current location remains visibly distinct from an ordinary hovered destination. |
| Manager's skip-link target is not explicitly focusable. | Main accepts programmatic/anchor focus without joining ordinary Tab order. | Skip to editor has a usable keyboard destination. |

## Motion decisions

No new animation is needed for these tasks. Opening/closing navigation, moving focus, importing and creating remain immediate; no stagger, bounce or page transition delays input. Existing immediate brightness-on-press feedback is retained without scaling text or changing geometry. Existing 160ms colour/border transitions soften pointer state changes and are limited to explicit properties. Existing banner ash/mist remain decorative under the approved design; they do not animate rule text. The shared reduced-motion rule disables transitions/animations and hides atmosphere. Existing hover effects remain restricted to fine pointers with hover support.

## Verification

`tests/browser/emil-audit.spec.mjs` covers all four workspace switchers with Enter/Tab/Escape, manager import preview/cancel/focus return and persisted blank creation, editor-reference focus/scroll restoration, header-search focus return and selected navigation hover. The standard interface suite includes these regressions on desktop and emulated phones; the hover-only case skips phones.

See the corresponding dated entry in [TESTING.md](TESTING.md) for completed checks. Browser emulation does not certify physical touch hardware or assistive technology.
