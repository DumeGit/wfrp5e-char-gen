# Old World visual studies

Four small standalone style studies live in `design-previews/`, outside the published `dist` application. They are historical proposals; the user subsequently selected C from the fantasy Muster Roll iterations for implementation. Serve that directory locally and open its `index.html`; the current development preview is http://127.0.0.1:8075/.

| Study | Direction | Sample motion / sound |
| --- | --- | --- |
| 01 — The Imperial Chronicle | Warm vellum, crimson leather, illuminated capitals, gilded marginalia and a wax seal | Candlelight / page turn |
| 02 — The Muster Roll | Riveted metal, regimental banners, worn brass and muted military colours | Embers / metal strike |
| 03 — The Witch Hunter’s Dossier | Gothic lettering, skull woodcuts, scorched paper and blood-red seals | Lantern glow and stamped ink / quill scratch |
| 04 — The Celestial Grimoire | Midnight blue, verdigris, engraved golden instruments and star charts | Turning astrolabe and starlight / glass chime |

All use the same example Soldier and compact advancement layout. Preview tabs, expandable folio sections and enlargement work; other creator actions are labelled demonstrations and do not read or mutate saved characters. Small cards deliberately crop a desktop composition; the enlarged study reveals the full composition. These are visual studies, not finished mobile creator layouts.

Motion can be paused and respects the system reduced-motion setting. Sound is off until a sample is requested, is generated with Web Audio, and stops after a short effect. CSS/SVG motion replaces GIF files for these sketches. All artwork and ornament is drawn in code; no official illustrations or supplied book PDFs are published. Any final theme should keep compact controls and clear text, using elaborate typography mainly for headings and decoration. The user has requested rich, strongly stylised Warhammer Fantasy aesthetics; the earlier minimal visual direction is superseded. C — The Black Banner is now selected and standardised; see [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

The locally bundled Cinzel Decorative, IM Fell English and UnifrakturCook fonts are from the [Google Fonts source repository](https://github.com/google/fonts). Each font's supplied SIL Open Font License is included beside the font in `design-previews/fonts/`. The studies make no external font requests at runtime and use no new plugin.

## Muster Roll: fantasy iteration

The user preferred The Muster Roll but found its riveted steel and military palette too close to Warhammer 40,000. Three further studies are in `design-previews/muster.html`, served at http://127.0.0.1:8075/muster.html. They draw on the supplied classic fantasy box-art reference without reproducing its illustration or logo. The user selected C on 5 October 2026 and authorised its implementation in the creator.

| Variation | Direction |
| --- | --- |
| A — The Battle Standard | Crimson title cartouche, gilded display lettering, painted regimental banners and an ivory working page; closest to the supplied reference's colours |
| B — The Regimental Ledger | Light vellum navigation/folio, a wax seal and oxblood chapter markers; gentler during long creation sessions |
| C — The Black Banner | Dark warm leather, old gold, Gothic display lettering and red heraldic cloth around a parchment centre |

All three share the same original painted banner and example data, allowing comparison of the framing rather than different content. The banner stays above the functional workspace. The recently added global search is represented in the masthead. There are no sound controls or audio code in these new studies. Tabs, enlargement and folio disclosures work; the other controls explicitly demonstrate appearance without connecting to a draft or rules engine. Thumbnails crop a full desktop composition, so use Open for the complete layout. The phone gallery stacks cards; these are not finished mobile creator screens.

The user prefers **C — The Black Banner**. The previous shield/comet emblem has been replaced across these three iterations by `assets/muster-w.svg`: a native vector W with angular serifs, antique-gold faces and a thin oxblood bevel, inspired by the supplied wordmark reference. The reduced masthead emblem matches the aged palette; the folio uses explicit grid centring, even inset space and a quieter leather shield frame. The logo glint has been removed at the user's request. C retains slow rising ash and mist over the painted masthead, warm candlelight at the leather edges, and gentle control colour transitions. The working parchment does not move. Pause/Enable motion controls are available in both the gallery and the enlarged dialog, share one state, and follow the system reduced-motion preference. When reduced motion is requested, decorative animation is removed and the controls explain the setting. C is now implemented through the shared production design system; the preview remains a historical style study. Open C directly at http://127.0.0.1:8075/muster.html#black-banner.

`study-screen.mjs` now holds the common example markup and tab rows used by both galleries, preserving the original four studies without duplicate screen templates. `muster.mjs` adds the new heading/crest treatments and interactions; `muster.css` owns the variant styling. The generated banner is saved as `design-previews/assets/muster-banner-v2.png`; the full prompt and generation provenance are in [assets/README.md](../design-previews/assets/README.md). The built-in imagegen tool was used, not the CLI fallback. No supplied box artwork or book PDF is copied into the project.

Verification for this iteration: inspect the W at thumbnail/enlarged sizes, confirm C's animations progress, pause/resume in the enlarged dialog and check the gallery shares that state, switch tabs, expand the folio, check single-column phone gallery/overflow, confirm the original gallery still opens and renders, and check browser errors. Review the reduced-motion CSS and media-query listener. The production implementation has its own desktop/mobile, component and offline checks described in DESIGN-SYSTEM.md.

Verification: inspect all four thumbnails, enlarge a study, switch preview tabs, expand the folio, toggle motion and request a sound sample. Check the narrow gallery layout and browser errors. The original gallery stays exploratory. C now has a separate production implementation; no push or deployment is performed by the agent.

The decorative S now uses a line-height-one box with an optical correction in the preview; the production `chapterHeading` component generalises this for every page heading.

## Bestiary colour studies — 7 October 2026

Three proposals are in `design-previews/bestiary-colours.html`, outside `dist`. Serve the repository root and open `/design-previews/bestiary-colours.html` (the original local preview used port 8095). They draw their palette from the generated skeleton-army banner. The user selected **A — Moonlit Vellum** on 7 October 2026, now implemented through shared theme tokens in the GM creator. The player creator retains its original palette.

| Study | Colour direction |
| --- | --- |
| A — Moonlit Vellum | Navy/storm-blue shell, pale bone parchment, cobalt actions and muted gold |
| B — Midnight Grimoire | Midnight shell, slate-blue working page/fields, ivory text and bone-gold actions |
| C — The Verdigris Crypt | Blue-green shell, grey-green parchment, teal actions and tarnished brass |

`bestiary-screen.html` captures the actual isolated core Skeleton Customise screen with the shared production styles. Each proposal overrides semantic colour roles through `bestiary-colours.css`; a few preview-only overrides remove warm fixed overlays and retain contrast when primary buttons use light gold. No layout redesign, new artwork, sound or rules are introduced. The gallery scales the same desktop snapshot into three thumbnails. Full-size links expose normal responsive layout and a native Palette selector for comparison. Disclosures work, but creator actions are inert and there is no rules engine, save/load, service worker or local-storage access in these studies. The supplied Skeleton data is unchanged. The galleries remain historical; production A has its own verification in GM-WORKSHOP.md.

Verification: inspected the three thumbnails and full-size palettes, switched the native selector, checked both W images load, and inspected the gallery/full-size phone layouts at 390×844 without horizontal page overflow. Gallery thumbnails are inert and hidden from the accessibility tree; labelled full-size links provide access. Reviewed body, secondary text, shell and primary-button contrast; selected navigation captions retain readable contrast in B. Palette changes are immediate to avoid mixed-colour transitions during comparison. `npm run check:release` passed all 328 tests and offline coverage; the previews stay outside the 254 published/offline assets. Preview module syntax and formatting checks passed. No creator code, rules, save format or published assets changed.


## Marijan Mode colour studies — 9 October 2026

The new gallery is `design-previews/marijan-colours.html`; run `node design-previews/serve.mjs` and open port 8110 at that path. Full-size `marijan-screen.html` supports native style switching and responsive layout. Production remains unchanged pending selection.

| Study | Direction |
| --- | --- |
| A — Ivory Ascendancy | Ivory parchment, storm-blue framing and pale gold; familiar bright editing |
| B — Stormglass | Dark teal working page, moon-silver edging and mint actions; an arcane console |
| C — The Forbidden Grimoire | Midnight violet, ivory text and antique gold; a forbidden spellbook |

All three use one original generated elven battle banner inspired by the supplied reference, with provenance and exact prompt in [design-assets/marijan](../design-assets/marijan/README.md). Preview colour roles remain isolated in `marijan-colours.css`; no live theme picker or save preference is introduced.

The screen reuses the current Marijan `workspace` output and shared controls/fonts/borders, with a shortened static identity display and deliberately unrestricted demo values. Skills, Talents and equipment remain inspectable through native disclosures; creator actions are inert. It imports no runtime, saves nothing and registers no worker. Header Search/Menu symbols on phones are decorative placeholders, not implemented launchers. The gallery scales desktop snapshots; full-size links provide accessible comparison. No new sounds or motion.

Verification: desktop and 390px previews inspected; no broken images, browser exceptions or horizontal page overflow across the three palettes and gallery. No full release suite is needed for isolated design studies.
