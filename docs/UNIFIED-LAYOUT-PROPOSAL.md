# Unified workspace and menu proposal

22 October 2026. The user selected A as the direction to refine, asking for more rustic Old World character. These remain interactive examples; the production layout is unchanged.

## Brief and direction

Make Player, Bestiary, Marijan and the character manager feel like four workspaces in one application. Retain the original heraldic emblem, local artwork, readable parchment, brass and restrained Gothic masthead. Use modern navigation hierarchy, wider labels, clear selected states and consistent action placement. Do not restore folios or alter rules, save formats, PDFs or mode isolation.

The live comparison is `design-previews/unified-layout.html`. Three treatments share the same information architecture and sample all four modes:

| Study | Character | Geometry | Tradeoff |
| --- | --- | --- | --- |
| A · Imperial Desk — selected for refinement | Worn stitched leather, tarnished brass, aged parchment and restrained inkwork; Original finish retained for comparison | 296px sidebar; joined editor; 80px illustrated masthead; 44px navigation rows | Clean information hierarchy with more tactile Old World character |
| B · Guild Register | Light ash parchment menu, ink labels, oxblood selection ribbon and serif navigation | 312px sidebar; inset editor; 88px masthead; 48px navigation rows | Softer and more spacious; lighter division between navigation and working paper |
| C · War Room | Slate framing, chalk parchment and restrained mode accents; compact toolbar | 280px sidebar; flush workspace; 68px masthead; 44px navigation rows | Highest density and clearest application feel; less ornamental |

Initial review rejected a generic dashboard-card approach and the design-search tool's unrelated SaaS/hero palette. These examples reuse the actual app's content, imagery and fonts. Personality lives in the masthead and material; working controls remain quiet and readable.

## Shared structure

```text
Application masthead: emblem + name                   Search the books
┌──────────────────────────┬──────────────────────────────────────────┐
│ Workspace switcher       │ Page context / character identity       │
│                          │ Title + relevant resources/actions      │
│ Local navigation         │                                          │
│                          │ Existing page content in a flexible     │
│                          │ editor; no right-hand folio             │
│ New & import             │                                          │
│ Save & export            │                                          │
│ More                     │                                          │
│ Undo / Redo · Save state │                                          │
└──────────────────────────┴──────────────────────────────────────────┘
```

One workspace switcher replaces the permanent 2×2 button grid. Its expanded list shows all four existing names with short purpose descriptions. The selected workspace stays explicit. Global switching, local navigation and document actions have visibly different roles.

Player keeps eight creation pages and their required-stage readiness; only an actual sequential creator uses step numbers. Bestiary keeps its four pages. Marijan keeps its one-page section links and unrestricted editing. The manager has Character library plus Play, Advance and Journal in the sidebar; it gains no creator steps or progress meter. A production implementation must preserve its existing route/history behavior and in-sheet context actions.

All modes use New & import, Save & export and More in the same order. The dialogs expose only relevant supported actions: Player JSON/PDF/record, Bestiary JSON/full-sheet/A4 cards, Marijan JSON/PDF/player copy, manager character/library imports and backups. No manager-like library is invented for other modes. Install and sources belong in More; deletion stays explicit and confirmed. Undo/Redo use the existing shared controls and retain each mode's history semantics. Autosave status appears once; failures remain prominent and recoverable.

## Visual language

The default Weathered A finish uses charcoal leather `#2b251f`, recessed shell `#201c17`, parchment `#eddfbf`, dark ink `#352b20`, supporting ink `#604b33` and tarnished brass `#c4a36b`. Original A remains available in the Finish selector and through `?study=a&finish=clean`. Mode accents remain contextual: Player oxblood, Bestiary muted cobalt, Marijan ash/oxblood, manager olive. Status colours retain their meanings independently of mode.

Weathering belongs to the materials, without changing the layout or making controls irregular to operate. Original static SVGs provide paper fibres/mottling, worn leather and a small engraved ornament. Margins have darkened edges, a narrow punched binding seam, stitched leather tooling and tiny brass rivets. A very faint existing heraldic emblem reads as archival ink at the lower page edge. Headings use one Gothic initial; source labels resemble softly impressed stamps. Text, controls, hit targets and tables stay straight and readable. Paper focus rings use dark brown, while the dark menu retains its bright focus treatment. No noise animation, moving decoration, new book content or production assets are introduced. The source materials and provenance are documented in `design-previews/UNIFIED-MATERIALS.md`.

Use the existing Ledger Display only for the application name, Ledger Text for page headings, and Segoe UI/system UI for controls and numeric content. Body controls are 14–16px; supporting text at least 12px; phone inputs at least 16px. Navigation icons share a 20px box and one stroke weight. Selected rows use fill, a leading marker and text weight, not colour alone. Hover does not move rows; focus is visible independently. No sound, glint or continuous menu animation.

Spacing follows 4/8/12/16/24/32px. Keep working prose near 70–75 characters; let grids and catalogues use available space. Inputs, secondary buttons, disclosures, tabs, action rows and empty/error states need shared treatments in the implementation, not just a shared sidebar. Retain source/Legacy access and the existing complete names, values and unknowns.

## Compact behavior

Above 1100px the proposed sidebar is visible. Through 1100px it becomes a labelled Menu drawer using the same ordering and content, with Menu before Search. This is a proposal to raise the existing 1000px boundary to accommodate the wider menu; the selected implementation must change all four modes and the shared responsive helper together. The preview's Phone control provides a 390px study; it also works in a real narrow browser.

The drawer closes on selection, Escape or backdrop, traps focus and returns it to its launcher. Its navigation can scroll in short windows without hiding essential actions. No icon-only collapsed desktop rail is proposed. Phone content uses 16px gutters and 44px touch targets. Player retains XP/money and history in the bottom strip; Bestiary keeps history/status; Marijan keeps history/name. Manager retains Play/Advance/Journal at the bottom, with history in its menu. The examples show design behavior, not real character editing or persistence. Physical-device validation remains an implementation requirement.

## Implementation after selection

1. Establish the selected semantic shell/menu tokens and shared row, group, switcher and action primitives. Keep artwork and flavour while standardising geometry.
2. Add one shared workspace shell and menu model to the existing CreatorFrame/CreatorMenu. Adapt the three creators and manager through configuration, retaining their existing stores and callbacks. Avoid a second controller or copied navigation implementations.
3. Migrate navigation, file tools, save state, history, compact drawers and bottom bars. Preserve manager library routing, unsaved-draft guards, recovery, dialogue focus, source access and installation behavior.
4. Align editor headings, section rhythm, tabs, inputs, tables, disclosures and feedback across all four modes. Retain content-specific layouts and manager resource placement.
5. Verify keyboard/focus, long names, empty/complete drafts, all mode transitions, zoom, short windows, 320/390px phones, tablets, 1440/1920/2560px desktop, offline assets, saves/history and exports. Review screenshots before replacing the live layout. Commit locally; publishing remains separately authorised.

The example controls are intentionally limited to switching studies/modes/pages, opening menus and inspecting sample controls. They never read personal drafts or write character data.
