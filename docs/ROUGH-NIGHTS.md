# Rough Nights & Hard Days

Enable **Rough Nights & Hard Days** in Choose books. This adds Gnomes, their printed creation tables, names and appearance, Suffuse with Ulgu, and the patrons Evawn, Mabyn and Ringil. It reuses existing Fifth Edition Careers and prayers; it adds no NPC profiles, adventure loot, pub games or campaign systems.

## Source and extraction

Supplied file: `Rough Nights & Hard Days.pdf`, 97 PDF pages. Printed page = PDF position minus one. SHA-256: `08b4301029408f02f60ad94037a5e07091259a3a05108644d8c4b3f3b534e6f7`.

MarkItDown extraction was checked against the printed tables and rendered PDF pages. Relevant content is Appendix I, pp. 86–90. Appendix II's pub games, the five adventures and their NPCs are outside character-creation scope. Full source PDFs and full-book extraction are not published.

`scripts/extract-rough-nights.py` stages text, tables, appearance and source metadata outside `dist`. `scripts/build-rough-nights.py` builds the reviewed pack; it requires explicit conversion flags and never registers a pack automatically. Current decisions are `--small-talent omit --wounds core --bawd knave --miracles map --suffuse allow`. The installed pack is `rough-nights`, version 1.0.0.

## Approved Fifth Edition adaptations

These decisions came directly from the user. They are recorded in the pack, displayed where relevant and included in the creation record.

- **2 Fate / 2 Fortune**, with no extra points to distribute. The book prints Fourth Edition Fate 2, Resilience 0 and two extra points; it supplies no Fifth Edition starting conversion. Origins, Review and exports explicitly warn that these are **proposed adaptation** values. Normal Fifth Edition random-creation benefits still apply; Fortune is independent of Fate and Luck adds its ordinary extra Fortune.
- **Five Species Skills at +5** and ordinary Fifth Edition creation limits, rather than the old +5/+3 allocation. Retain the five printed Talent slots; omit Small as a sixth Talent and record Small size separately. Reikspiel is automatically native. Ghassally is selectable, not automatically native.
- **Small Wounds = 2 × TB**, plus Hardy's extra TB, from Fifth Edition core pp. 120, 361. The supplement's older `2 × TB + WPB` formula is not used. PDF components show zero for the excluded SB and WPB so they agree with the total.
- Career table **Advisor → Adviser** and **Bawd → Knave**. The latter uses the revised Fifth Edition Rogue Career, not copied Fourth Edition options.
- Evawn's **Rich Man, Poor Man, Beggar Man, Thief → Trickster’s Glamour**; Mabyn's **You Ain’t Seen Me, Right? → You Saw Nothing**. Use the core Fifth Edition effects.
- **Suffuse with Ulgu is allowed**, with an explicit warning that it has no Fifth Edition equivalent. Retain its printed maximum of one. Channelling (Ulgu) can substitute for Stealth on relevant Tests; successful Shadows spells within 8 yards gain +1 SL, claimed only once regardless of nearby possessors. These are situational references: displayed Stealth totals and casting totals are not automatically changed. No old per-rank Test bonus is imported. It is a Species Talent option, with no invented non-Career paid access.

## Gnome creation

Printed profile p. 88:

| WS | BS | S | T | I | Ag | Dex | Int | WP | Fel |
|---|---|---|---|---|---|---|---|---|---|
| 20 | 10 | 10 | 15 | 30 | 30 | 30 | 30 | 40 | 15 |

These are Species modifiers. Movement 3. Physical details on p. 89 give age `20 + 10d10` and height `3 ft 4 in + 1d10 inches`.

The twelve Species Skills and five Talent slots retain the book's choices. Names offer 16 forenames, eight Glimdwarrow clan names and four epithets from pp. 88–89. Uniform rolls over those suggestion lists are not described as printed random tables. Eyes and hair use the actual 2d10 tables on p. 89, retaining each sum's probability. Age-related greying and matrilineal clan naming are explained without invented mechanical cutoffs.

Gnomes are inherently magical: an Advance in Language (Magick) permits Dispelling without a casting Talent (p. 88), shown as reference text. Their permitted training includes Shadows, Dark Magic and Chaos Magic; their people outlaw Necromancy, Daemonology and Chaos Magic. The creator currently offers Shadows among its ordinary Arcane choices. It does not add unsupported Dark/Chaos training or live Dispelling. With Winds of Magic enabled, the generic Wizard's College selector respects this restriction; the Human-only College Careers remain Human-only.

## Random tables

The p. 87 Gnome Career table covers all 100 results and 42 existing Careers. It is automatically used when selecting Gnome, and the same 42 Careers are available manually. Every face and complete creation through every listed Career are tested.

The p. 87 Species table is separately selectable: Human 01–89, Halfling 90–93, Dwarf 94–97, Gnome 98, High Elf 99, Wood Elf 100. Enabling this book does not silently select it or merge its Gnome 98 result with Archives II's Ogre 98. Core remains the default unless Archives II is enabled; the user's standing instruction makes Archives II's table the default then. Explicit selections always override defaults.

## Gnome patrons

Each p. 90 cult supplies exactly its printed six Blessings and three Miracles. Existing core spell records are referenced, not duplicated or rewritten:

| Patron | Miracles using Fifth Edition names |
|---|---|
| Evawn | An Invitation; Trickster’s Glamour; Rhya’s Shelter |
| Mabyn | Death Mask; You Saw Nothing; Sword of Justice |
| Ringil | Blind Justice; Leaping Stag; Ranald’s Grace |

Core Bless/Invoke matching and magical-training incompatibilities still apply. Invoke grants one Miracle; additional Miracles follow the ordinary escalating core Miracle price and give no tracker boxes. Free and purchased choices are validated against the patron's list. The interface and exports identify both the cult's p. 90 grant and the underlying core prayer definition. Strictures are included as references, without ongoing tracking or automatic tithe deductions.

## Verification and scope

Checks cover all 64 combinations of the six existing optional packs, every Gnome Career result, creation in all 42 available Careers, real appearance probabilities, Fate/Fortune bonuses, Small/Hardy Wounds, Lore restrictions, all three prayer lists, invalid imports and purchase/undo. Editable PDF export retains all 556 fields and appends the complete conversion/XP/magic record. Local desktop/mobile checks cover Origins, Talent warnings, Experience prayer purchases and Review/export. The offline build includes the pack and new cult-reference handler.

No new priced equipment, spells, PC Careers, magic-item grants or adventure rewards were inferred from NPCs. Pub games, live dispelling/casting, tracking strictures and campaign progression remain deferred.

## Reviewed reference imports — 7 October 2026

Current scope (8 October): standalone NPC/creature profiles and all templates are retained for possible future use but excluded from shared search, its reader and chaining. The chapter inventory below records reviewed source material; only other rules/options remain searchable. Core GM creation is unchanged.

Original Gnome tables/strictures, all fifteen named pub games and their printed Critical convention, isolated NPC stat blocks and Reveal the Inner Beauty (printed p. 52, PDF p. 53). Adventure scenes/plots and NPC biographies are excluded. The non-NPC rules/options from these imports are readable in both creators regardless of enabled creation books; standalone NPC/creature profiles and templates are excluded from search. Newly imported Fourth Edition rules preserve their source mechanics with an edition warning; they do not automatically receive Legacy or enter creator catalogues. Existing approved adaptations remain unchanged. Full PDFs and staged extraction are not published. See [SEARCH-COVERAGE.md](SEARCH-COVERAGE.md) for generated source ranges/counts and [BOOK-SEARCH.md](BOOK-SEARCH.md) for the shared reader and maintenance rules.

## Search categorisation — 8 October 2026

Beast Among the Tailors (p. 92) and Bull Ring (p. 93) are Rules references rather than Tables. Their supporting difficulty/scoring tables remain in the dialogs without adding gameplay automation.
