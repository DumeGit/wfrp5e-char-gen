# Search selected books

The Black Banner masthead has a wide search field centred in the ribbon below the brand and header actions, on desktop and phone. Its painted artwork is clipped separately so the dropdown can extend over the workspace. There are no global filters. Existing Career, Skill, magic and shop filters remain independent.

Typing produces eight ranked matches, with **Show more matches** adding eight. Exact names, reviewed aliases, prefixes and other name matches precede description/metadata matches. Words can match in different parts of a profile. Normalisation ignores case, punctuation and accents; it never resolves content or invents rule equivalents. Each result shows its name, category, book/page, a matching excerpt where available and selective Legacy status. With an empty field, only a hint appears. Clicking a result or pressing Enter views its reference. Arrow keys choose a result, Escape dismisses the dropdown, and Clear empties the query. The input itself is never replaced during searching, preserving its caret and keyboard composition.

## Scope and sources

The index is built from the assembled selected catalogue, not full PDF text or all installed packs. It includes Careers and their four levels, Skills and supported specialisations, Talents and their supported options, spells/prayers/rituals, rune knowledge, techniques, Cants, and equipment profiles/shop entries. Source precedence and withdrawals apply before indexing. Exact same-name equipment facets within one book are joined, keeping each profile and shop reference; distinct books/content remain distinct. Exact aliases are indexed only when their documented book scope is selected. Unavailable profiles remain searchable as references. Deferred chapters and content absent from the runtime catalogue are not claimed as searchable.

Core Skill records mostly contain type, Characteristic, specialisations and page references rather than full descriptions. Their dialogs explicitly disclose this and refer to the supplied book; no rules are fabricated. Equipment preserves unresolved values. Reference-only gear does not acquire a price or purchase action just because a related profile mentions material value.

## Viewing and actions

By the user's clarification, adaptation/conversion notes and internal app decisions are **excluded from matching**. The index uses an explicit list of content fields rather than serialising records. `book-search-text.mjs` separates reviewed annotations embedded in older imports without deleting their stored text; it never generically removes words such as “creator”, which also occur in genuine book prose. Future imports should keep commentary in separate metadata rather than append it to rule text. Search still uses the approved imported profiles, including their Fifth Edition adaptations, rather than reconstructing original Fourth Edition versions. Selective Legacy badges identify actual adaptations and open their explanations. By the later user instruction, dialogs have no **Use in the creator** section, ownership/quote status, appended creator notes or availability notices. Only book references and separate navigation buttons appear. Existing purchase controls explain eligibility after navigation. Neither matching nor ranking depends on character-specific eligibility.

References open in a dedicated dialog. Existing source and Legacy dialogs can open above it and return to it. Shared Talent/magic detail renderers keep book profiles and descriptions consistent with the main app, suppressing creator-only commentary in search. Talent names are not repeated in another description disclosure inside the search dialog.

Separate actions navigate to an existing control, never purchase or select. Routes use current ownership and existing eligibility handlers without displaying a creator-status panel in the reference:

- Careers: preview only, retaining existing change confirmation and XP lock.
- Skills/Talents: eligible existing Experience rows and supported starting-choice controls. Later Career Skills are not presented as starting allocations.
- Magic: the reference/learning browser, or the relevant free-grant chooser where available; ordinary spells, prayers, rituals, runes, techniques and Cants keep existing handlers.
- Equipment: its shop row, with the existing restrictions and coin balance. Non-retail profiles are reference-only.

Navigation clears obstructing local filters, opens enclosing disclosures and focuses/highlights the target. It re-evaluates the route against the current draft before use. The global query remains available when returning to the field; the reference dialog's **Back to search** restores the results. Viewing/typing do not rerender or save the character. Navigation uses the normal persisted step; all choices, XP, money and roll history remain unchanged. Catalogue changes rebuild the index and dismiss stale references. Search state is transient and omitted from save files/exports.

Exact catalogue names and scoped, reviewed aliases inside the reference body become discreet inline links. Matching preserves the original text, respects word boundaries and prefers the longest complete name; unimported terms and the current reference's own name stay plain. For example, the recorded Leather Breastplate alias links to Leather Jerkin, never to the different Breastplate profile. Alias previews show the target's canonical name. Same-name references from the current book are preferred. If more than one target remains, the dialog asks which reference to read, retaining categories and sources rather than guessing an equivalent. Hover or keyboard focus offers a short reference preview on desktop; click/tap opens the full entry. **Back** retraces the chain within the dialog, while **Back to search** retains the original banner query. Chaining never changes a character. Only selected content can become a link.

The field's icon and padding focus the input on a single click. Result pointer clicks retain input focus until selection so blur cannot dismiss or replace an option mid-click. Focus/click handlers avoid redundant dropdown rendering; Show more preserves its scroll position.

## Maintenance and verification

`dist/book-search.mjs` is the data/ranking/context model; `dist/book-search-text.mjs` isolates reviewed annotation boundaries; `dist/book-search-links.mjs` matches related terms; `dist/features/book-search.mjs` owns interaction/rendering/history; `dist/book-search.css` isolates the banner/dropdown/dialog styling. The PWA build caches all five.

Outcome tests cover selected-book isolation, withdrawals, facet joins, stable identities, aliases/ranking/pagination, supported specialisations, reference immutability, availability, Career locks, changing ownership/funds, exact linked-text preservation, longest-term/alias matching and ambiguous targets. Browser verification uses an isolated `?verify=1` draft: single-click field/result behavior, keyboard/caret, hover/focus previews, chained references/Back/query retention, dialogs and source links, navigation to existing controls, book changes, desktop/mobile overflow and full-screen references. Run the release checks and regenerate the offline worker before committing. Do not push or deploy.

Inactive-book reference search is deferred; adding it requires explicit availability labelling and must never apply content without the corresponding book selection.
