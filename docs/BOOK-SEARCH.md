# Search selected books

The banner has a wide search field centred between the brand and header actions. At phone widths it sits beneath them. There are no global filters. Existing Career, Skill, magic and shop filters remain independent.

Typing produces eight ranked matches, with **Show more matches** adding eight. Exact names, reviewed aliases, prefixes and other name matches precede description/metadata matches. Words can match in different parts of a profile. Normalisation ignores case, punctuation and accents; it never resolves content or invents rule equivalents. Each result shows its name, category, book/page, a matching excerpt where available and selective Legacy status. With an empty field, only a hint appears. Clicking a result or pressing Enter views its reference. Arrow keys choose a result, Escape dismisses the dropdown, and Clear empties the query. The input itself is never replaced during searching, preserving its caret and keyboard composition.

## Scope and sources

The index is built from the assembled selected catalogue, not full PDF text or all installed packs. It includes Careers and their four levels, Skills and supported specialisations, Talents and their supported options, spells/prayers/rituals, rune knowledge, techniques, Cants, and equipment profiles/shop entries. Source precedence and withdrawals apply before indexing. Exact same-name equipment facets within one book are joined, keeping each profile and shop reference; distinct books/content remain distinct. Exact aliases are indexed only when their documented book scope is selected. Unavailable profiles remain searchable as references. Deferred chapters and content absent from the runtime catalogue are not claimed as searchable.

Core Skill records mostly contain type, Characteristic, specialisations and page references rather than full descriptions. Their dialogs explicitly disclose this and refer to the supplied book; no rules are fabricated. Equipment preserves unresolved values. Reference-only gear does not acquire a price or purchase action just because a related profile mentions material value.

## Viewing and actions

By the user's clarification, adaptation/conversion notes and internal app decisions are **excluded from matching**. The index uses an explicit list of content fields rather than serialising records. `book-search-text.mjs` separates reviewed annotations embedded in older imports, preserving those notes for the dialog; it never generically removes words such as “creator”, which also occur in genuine book prose. Future imports should keep commentary in separate metadata rather than append it to rule text. Search still uses the approved imported profiles, including their Fifth Edition adaptations, rather than reconstructing original Fourth Edition versions. Selective Legacy badges identify actual adaptations. The dialog separates its reference body from **Use in the creator**, which contains conversion/adaptation notes, ownership, prices, restrictions and navigation actions. Neither matching nor ranking depends on character-specific eligibility.

References open in a dedicated dialog. Existing source and Legacy dialogs can open above it and return to it. Shared Talent/magic detail renderers keep descriptions and calculation/reference explanations consistent with the main app. Talent names are not repeated in another description disclosure inside the search dialog.

Character-specific status uses current ownership, XP quotes and shop sizing/restrictions/purse. Restrictions and incomplete-creation messages remain visible. A separate action navigates to an existing control, never purchases or selects:

- Careers: preview only, retaining existing change confirmation and XP lock.
- Skills/Talents: eligible existing Experience rows and supported starting-choice controls. Later Career Skills are not presented as starting allocations.
- Magic: the reference/learning browser, or the relevant free-grant chooser where available; ordinary spells, prayers, rituals, runes, techniques and Cants keep existing handlers.
- Equipment: its shop row, with the existing restrictions and coin balance. Non-retail profiles are reference-only.

Navigation clears obstructing local filters, opens enclosing disclosures and focuses/highlights the target. It re-evaluates the route against the current draft before use. The global query remains available when returning to the field; the reference dialog's **Back to search** restores the results. Viewing/typing do not rerender or save the character. Navigation uses the normal persisted step; all choices, XP, money and roll history remain unchanged. Catalogue changes rebuild the index and dismiss stale references. Search state is transient and omitted from save files/exports.

## Maintenance and verification

`dist/book-search.mjs` is the data/ranking/context model; `dist/book-search-text.mjs` isolates reviewed annotation boundaries; `dist/features/book-search.mjs` is the interaction/rendering feature; `dist/book-search.css` isolates the banner/dropdown/dialog styling. The PWA build caches all four.

Outcome tests cover selected-book isolation, withdrawals, facet joins, stable identities, aliases/ranking/pagination, supported specialisations, reference immutability, availability, Career locks and changing ownership/funds. Browser verification uses an isolated `?verify=1` draft: search/keyboard/caret, dialogs and source links, navigation to existing controls, book changes, desktop/mobile overflow and full-screen references. Run the release checks and regenerate the offline worker before committing. Do not push or deploy.

Inactive-book reference search is deferred; adding it requires explicit availability labelling and must never apply content without the corresponding book selection.
