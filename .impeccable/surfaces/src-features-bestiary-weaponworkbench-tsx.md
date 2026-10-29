---
version: 1
slug: "src-features-bestiary-weaponworkbench-tsx"
primary_target: "src/features/bestiary/WeaponWorkbench.tsx"
related_targets: ["src/styles/gm/weapon.css"]
---

# Weapon builder

Operate surface for a GM preparing owned equipment. Replace the rejected accordion dialog with a search-first builder; preserve rules, complete content, source identity, calculations, atomic save and immediate discard. The user delegated design decisions and requested only focused weapon checks.

## Direction contract

THESIS: Find a real base, then work on one concern at a time. A catalogue replaces the enormous select; navigation replaces the long accordion form.

OWN-WORLD: Use the app’s Imperial Desk tokens: aged parchment, raised paper, brown ink and brass, Bestiary cobalt actions, Ledger Text headings and system UI controls. The user approved the new layout and UX, then explicitly requested the existing app fonts and colours. No local palette overrides.

STORY: Choose a published weapon, name and adjust it, add properties or powers, inspect the actual NPC result, then commit once.

FIRST VIEWPORT: Searchable weapon rows lead. After selection, a compact section rail opens Details, Properties, Power and Review; a fixed lower readout carries Attack, Damage, Reach/Range and Encumbrance beside save/cancel. Phones use top section navigation and stacked readout/actions. No oversized preview card.

FORM: Grounded candidate 5 of 7, search-first catalogue and focused editor, selected under the user's free-hand delegation. seed:d104a650cef2acae. Signature interaction: direct catalogue additions update the persistent calculated attack readout. Changes are immediate; no decorative animation.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Scope is WeaponWorkbench and its styles. No new raster assets, component theme or global design-world changes; compare against existing design documentation and preserve it. Verify base choice, actual add/edit, magical/runic configuration, validation navigation, discard, focus and phone fit through a small weapon-only browser selection.
