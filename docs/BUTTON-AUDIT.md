# Button role audit — 30 October 2026

Implemented across Player, Bestiary, Marijan, the manager and shared search/PWA controls within the existing Imperial Desk design. Fonts, materials, mode accents, handlers, eligibility, saves and exports retain their behaviour. No animation was added: frequent commands need immediate feedback through existing focus, press and pointer-qualified hover states.

## Contract

| Variant | Use for | Examples |
| --- | --- | --- |
| `primary` | Main positive commitment in a local task | Save profile, Apply, Add selected, required starting roll, main ready-state output |
| `quiet` | Navigation, launchers, supporting commands and repeated row actions | Back/Next, Cancel/Close, Add Talent launcher, Buy, alternate download |
| `text-button` | Inline supporting commands | Read source, clear filter, history detail |
| `danger` | Confirmation that deletes, discards or replaces existing work | Permanent delete, discard changes, start over, replace weapon base |
| `danger-text` | Compact individual removal | Remove an item, Trait, Talent or purchase |

One primary per **local task**, rather than per entire long page. Independent sections can have their own positive confirmations. Required starting rolls may be primary; optional rerolls and preview launchers are quiet. Player Review's main output is Open in character manager, with quiet PDF alternatives. Bestiary and Marijan retain their main PDF action. Repeated purchases remain quiet; their row, price, disabled reason and Undo supply context.

Adapters default to quiet. Native submits explicitly choose a variant. Do not reintroduce `secondary`, manager-specific aliases or implicit submit colouring. Manager geometry consumes shared skin variables, so danger red stays distinct from olive primary. Disabled command variants use opaque neutral paper/muted ink with nearby reasons.

## Findings and changes

| Before | After | Why |
| --- | --- | --- |
| Top navigation was quiet while some footer/contextual Next actions were filled. | All Back/Next/Continue navigation uses quiet. | Destination changes have consistent emphasis everywhere. |
| Some Add/Edit/picker launchers resembled final confirmations. | Launchers are quiet; Save/Apply/Add selected stays primary. | Opening a choice and committing it have distinct roles. |
| Player purchases were primary while manager purchases were quiet. | Repeated purchase/choose rows use quiet; `purchase-button` owns layout. | Lists no longer compete with the main task; geometry is independent of emphasis. |
| Three actions used a separate dark secondary skin. | Retired that skin; actual budget/promotion/starting-roll commitments use primary and supporting commands use quiet. | Variant names describe action roles consistently. |
| Manager used private aliases and automatically filled submits. | Explicit canonical classes and shared skins. | Appearance follows purpose across workspaces. |
| Destructive confirmations used mode primary or neutral defaults. | Shared danger for delete/discard/reset/replacement confirmations. | Destruction is recognisable in olive and cobalt modes too. |
| Remove actions mixed neutral and local styles. | Shared danger-text, preserving compact geometry. | Removal has one meaning without filling every row red. |
| Disabled guide specimens inherited faded treatments. | Shared opaque neutral disabled skin in guide and app. | Labels stay readable and specimens reflect production. |
| Manager delete/cancel controls touched. | Existing wrapping group supplies an 8px gap. | Both choices remain distinct on desktop and phone. |

Search clear/retry/load-more commands are quiet. PWA Update now is the local primary commitment; Later and Close are quiet. Source links and Legacy provenance retain their established controls.

## Deliberate specialised controls

Tabs, selected navigation, workspace/menu choice cards, profiles, checkbox rows and toggles express selection/state rather than command priority. They retain dedicated active treatments. Rule-reference question marks, history icons, numeric steppers, source/Legacy badges and close icons retain their shapes, labels, focus and touch sizing. These are intentional roles, not competing primary variants. No description disclosure or duplicated rule prose was added.

## Coverage and verification

[BUTTON-INVENTORY.csv](BUTTON-INVENTORY.csv) records **306 application source sites in 54 files**, plus **12 static specimen sites**: **318 sites in 55 files**. These are authored sites and reusable factories, not runtime button/state counts; repeated catalogue rows count once. Shared wrappers and specialised controls were reviewed alongside callers. Regenerate with `node scripts/audit-buttons.mjs`; do not maintain the CSV by hand.

The focused `tests/browser/button-variants.spec.mjs` covers four desktop/phone Chromium journeys: Player navigation/purchase/Review/specimens, Bestiary launch/batch/reset, manager save/delete/cancel/hover and Marijan launch/add. It checks computed skins, keyboard focus, disabled presentation, purchase/Undo, cancelled destructive changes and horizontal overflow. Screenshots under ignored `test-results/button-variants*` are inspected for hierarchy and wrapping. Eight cases passed after correcting two test-only assumptions about a collapsed budget editor and the dialog Close label. Final shared disabled-skin and manager-spacing changes receive the same focused checks against rebuilt output.

The final rebuilt output passed **all eight cases in one run**. Production build/TypeScript, code checks, targeted formatting and diff checks also passed. No broad rule/book regression suite was needed for this presentation-only change. Chromium emulation does not certify physical devices or OS pickers.

Detector triage: retained existing feedback, Career progression/selection borders and the Marijan generation starter callout, recording file-scoped rule exceptions with reasons. Recorded the source-guide flat-hierarchy warning as a false positive: its generated `/guide.css` is absent under `src/static`, while rendered guide headings use the real shared typography. A scan of the generated guide additionally reports inherited masthead/logo/Legacy small-type, brass shadow/gradient and ribbon-padding findings; these remain standing outside this action-variant change. No new ignore-file or project-wide rule ignore was added.
