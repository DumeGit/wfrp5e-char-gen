# Old World visual studies

## Unified layout and menus — 22 October 2026

The user selected A with rustic character and then specified wood panelling instead of leather. A defaults to a Weathered finish: original mottled/fibrous parchment, shared tavern-oak panelling, punched binding holes, tarnished brass, a faint heraldic ink stamp and restrained engraved ornament. The Finish selector retains Original A for direct comparison; B/C are unchanged. See [material sources and checks](../design-previews/UNIFIED-MATERIALS.md) and the [implementation contract](UNIFIED-DESIGN-IMPLEMENTATION-PLAN.md). This remains a preview revision, with no live app changes.

The user requested examples before changing the four live workspaces. Run `node scripts/serve-layout-studies.mjs`, then open `http://127.0.0.1:8208/design-previews/unified-layout.html`. This loopback preview serves only the studies and public artwork/fonts. **A · Imperial Desk** (recommended), **B · Guild Register** and **C · War Room** compare wider menus, shared navigation/action groups and editor treatments. The workspace selector shows Player, Bestiary, Marijan and manager examples; Phone shows the compact menu. Study/mode links can be shared locally through query parameters. All actions remain illustrative, with no personal storage, file operations or production changes. Layout, tokens, mode mappings and implementation stages are in [UNIFIED-LAYOUT-PROPOSAL.md](UNIFIED-LAYOUT-PROPOSAL.md).

The 72 study/mode/viewport combinations (320/390/768/1024/1440/1920px) were checked for page/frame overflow. Native drawer open/close, workspace switching, file-group dialogs, Escape/focus return, description switches and search keyboard focus were exercised. Desktop examples and phone/drawer captures were visually inspected. These are preview checks, not certification of production functionality or physical phones. Existing art/font provenance is unchanged; the interface icons are simple original inline SVGs.

## Earlier studies

22 October 2026: removed character/creature folio markup, snapshots, toggles and styles from the studies alongside the production removal. Historical descriptions below record their original proposals. Texture studies now show the menu panel alone.

Current component reference: build the app and open `/design-system.html` from `out/`. The studies below are historical proposals, not the Next application. Some gallery/review scripts still refer to removed `/dist/` assets and require path adaptation before reuse; do not present those legacy servers as current production previews.

## Compact Bestiary card studies — 16 October 2026

`design-previews/bestiary-card-layouts.html` retains three print-layout studies; A is now selected and implemented: A uses a section-label gutter, B groups short combat data while retaining full-width ability descriptions, and C balances content across two text columns. A native selector switches among a customised core Human, Griffon and Varghulf; a second selector compares 9.25, 8 and 7.5 pt body text. Each layout receives identical calculated statistics, attacks, location soak, Skills, canonical Talent/Trait summaries and equipment. Embedded snapshots were produced through the existing GM result and shared all-book catalogue; they are examples, not a new game-data source. The study remains a historical snapshot; production now uses the measured A grid with flexible packing by default and fixed six/four-card alternatives. This historical preview does not mutate saved drafts.

Cards have content-driven height and minimal white-paper/greyscale framing. The page reports browser height estimates against the existing six-card slot, not a promise of PDF fit. C is the densest of these samples at equal text size; B prioritises full-width reading and can be taller. Flexible-height A4 packing is now implemented with measured pagination, earlier-page gap filling and retained six/four fixed cut-line alternatives. The comparison itself does not implement page packing. Desktop and 390px browser checks found no horizontal overflow or script errors; snapshots were visually inspected. No rule text was shortened or omitted to force a fit.

Four small standalone style studies live in `design-previews/`, outside the published `out/` application. They are historical proposals; the user subsequently selected C from the fantasy Muster Roll iterations for implementation. Serve that directory locally and open its `index.html`; the historical local preview used port 8075.

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

Three proposals are in `design-previews/bestiary-colours.html`, outside `public/` and `out/`. Serve the repository root and open `/design-previews/bestiary-colours.html` (the original local preview used port 8095). They draw their palette from the generated skeleton-army banner. The user selected **A — Moonlit Vellum** on 7 October 2026, now implemented through shared theme tokens in the GM creator. The player creator retains its original palette.

| Study | Colour direction |
| --- | --- |
| A — Moonlit Vellum | Navy/storm-blue shell, pale bone parchment, cobalt actions and muted gold |
| B — Midnight Grimoire | Midnight shell, slate-blue working page/fields, ivory text and bone-gold actions |
| C — The Verdigris Crypt | Blue-green shell, grey-green parchment, teal actions and tarnished brass |

`bestiary-screen.html` captures the historical isolated core Skeleton Customise screen with the shared production styles. Each proposal overrides semantic colour roles through `bestiary-colours.css`; a few preview-only overrides remove warm fixed overlays and retain contrast when primary buttons use light gold. No layout redesign, new artwork, sound or rules are introduced. The gallery scales the same desktop snapshot into three thumbnails. Full-size links expose normal responsive layout and a native Palette selector for comparison. Disclosures work, but creator actions are inert and there is no rules engine, save/load, service worker or local-storage access in these studies. The supplied Skeleton data is unchanged. The galleries remain historical; production A has its own verification in GM-WORKSHOP.md.

Verification: inspected the three thumbnails and full-size palettes, switched the native selector, checked both W images load, and inspected the gallery/full-size phone layouts at 390×844 without horizontal page overflow. Gallery thumbnails are inert and hidden from the accessibility tree; labelled full-size links provide access. Reviewed body, secondary text, shell and primary-button contrast; selected navigation captions retain readable contrast in B. Palette changes are immediate to avoid mixed-colour transitions during comparison. `npm run check:release` passed all 328 tests and offline coverage; the previews stay outside the 254 published/offline assets. Preview module syntax and formatting checks passed. No creator code, rules, save format or published assets changed.


## Marijan Mode colour studies — 9 October 2026

The new gallery is `design-previews/marijan-colours.html`; run `node design-previews/serve.mjs` and open port 8110 at that path. Full-size `marijan-screen.html` supports native style switching and responsive layout. The user subsequently selected A; production now uses its central Ash & Vellum theme.

| Study | Direction |
| --- | --- |
| A — Ash & Vellum | Pale grey vellum, black framing, white headings and oxblood actions |
| B — The Black Seal | Charcoal working page, silver edging, white text and restrained red actions |
| C — Crimson Grimoire | Near-black pages, white lettering and prominent crimson accents |

All three use one original generated elven battle banner inspired by the supplied reference, with provenance and exact prompt in [design-assets/marijan](../design-assets/marijan/README.md). Preview colour roles remain isolated in `marijan-colours.css`; no live theme picker or save preference is introduced.

The screen reuses the then-current Marijan `workspace` output and shared controls/fonts/borders, with a shortened static identity display and deliberately unrestricted demo values. Skills, Talents and equipment remain inspectable through native disclosures; creator actions are inert. It imports no runtime, saves nothing and registers no worker. Header Search/Menu symbols on phones are decorative placeholders, not implemented launchers. The gallery scales desktop snapshots; full-size links provide accessible comparison. No new sounds or motion.

Verification: desktop and 390px previews inspected; no broken images, browser exceptions or horizontal page overflow across the three palettes and gallery. No full release suite is needed for isolated design studies.

The user redirected these Marijan proposals to black/grey/white/red on 9 October. These three replace the earlier blue/teal/violet studies at the same URLs. The artwork and native W source remain unchanged; preview CSS desaturates them, with monochrome framing and red controls. No new image generation was needed. A has now been selected and implemented; B/C remain alternatives.

Selected A was implemented on 9 October with a second imagegen edit adding crimson cloth to an otherwise monochrome battle painting. A's preview now uses that final artwork without the desaturation filter; B/C retain the earlier CSS-only treatment. Production reuses semantic tokens and existing layout, not the static preview's shortened Identity or disabled controls.

A later image revision restored blue/ivory/gold to the painting, but the user clarified that colour was intended for the **Marijan Mode title plaque**, not the picture. Selected A and production therefore use the monochrome/crimson artwork again, with an oxblood title plaque on desktop and mobile. The full-colour image remains unselected source history.


## Matching panel textures — 15 October 2026

`design-previews/panel-textures.html` compares one material shared by the left menu and folio within each mode. Run `node design-previews/serve.mjs` and open `http://127.0.0.1:8110/design-previews/panel-textures.html`. Full-size links show each pair with native disclosures. A Texture strength selector compares Off (flat surfaces), Subtle and Tactile; Subtle is the default in both gallery and individual previews. The final three materials are now selected and implemented; alternatives remain preview-only.

| Example | Mode | Shared panel surface |
| --- | --- | --- |
| A — Tavern oak | Player | Dark tavern floorboards, long grain, staggered joints, knots and sparse nail heads; existing old gold and oxblood accents |
| B — Bestiary materials | GM | Crypt masonry (default), Crypt slate, Basilisk hide or Blackened iron; physical stone/mineral/hide/metal grain in storm blue, with existing bone, cobalt and brass accents |
| C — Pressed ash vellum | Marijan | Charcoal fine directional grain; existing silver and crimson accents |

The paired panels use identical base colours and texture images, rather than separate menu/folio materials. Original procedural SVG textures live in `design-previews/textures/`; no source-book images, external textures, new dependencies or generated raster assets are required. Static textures remain visible with reduced motion; no texture is animated. The initial studies left production unchanged; the selected materials now use the production surface roles described below, while alternatives remain isolated.

`panel-texture-snapshots.json` contains the then-current rail/folio markup captured from the isolated demo fixtures for all three creators. The static screen loads existing fonts, controls and theme styles but no creator runtime or saved data. Character-changing controls are inert. Preview-only rules keep desktop panel bodies visible within small gallery frames; full-size phone layouts stack the pair. Captions, full-size links and Off/Subtle/Tactile controls are accessible outside the inert thumbnails.

Verification: visually inspected the desktop gallery after adjusting grain contrast, checked the phone gallery and full-size stack for horizontal overflow, identical background/texture styles on both panels in all three modes, strength synchronisation and static texture visibility with reduced motion. No browser errors or missing assets were observed. These isolated studies do not need a production build or full rule suite.


Follow-up direction: the user requested tavern-style wooden panelling for Player and a skeletal treatment for GM, while keeping Marijan’s ash vellum and making every texture subtle. The revised examples use `tavern-wood.svg` and `ossuary.svg` respectively; both are original native vector/procedural surfaces. Marijan’s material is unchanged. The initial leather/hide SVG studies remain unused source history. Subtle defaults to 0.15 opacity on all modes; the optional stronger Tactile comparison remains 0.30. The paired panels still share the exact same material and base colour. Visually checked the revised desktop gallery and verified the default, loaded assets, absence of browser errors and phone gallery overflow. This remains an isolated preview, without production changes.


The user rejected the literal skeletal engravings: Bestiary must have a material texture, rather than illustrated symbols. The ossuary SVG is now unused source history. The historical GM preview card offers three native texture choices through its Surface selector: Crypt slate (mineral strata/chalky pitting), Basilisk hide (irregular pebbled relief) and Blackened iron (matte hammered surface). Each is a new procedural SVG height/lighting texture with no pictorial marks. `bestiary-materials.mjs` owns preview names/descriptions; gallery and full-size screen use the same choices and propagate selection into the full-size link. All default to Subtle; the coarser hide grain has a 0.65 gain to keep it quiet. Both panels share the selected finish. Player’s wood and Marijan’s vellum are unchanged. Verified loading/selection of all three materials, identical paired surfaces, full-size switching, Off behavior, browser errors and phone overflow; visually inspected slate and hide previews. These remain isolated proposals, not production settings.


The next user direction was crypt cobblestone walls. Added **Crypt masonry** as the default Bestiary preview: uneven staggered stone blocks, recessed mortar, rounded worn edges, fine pitting and restrained blue-grey faces. `crypt-masonry.svg` is original procedural/vector material artwork, shared identically on the menu and folio. The three previous material alternatives remain available; Player/Marijan and the Subtle default are unchanged. Gallery default/full-size fallback now choose masonry. Inspected the revised desktop gallery and checked default selection, browser errors and phone gallery overflow. No production assets or settings changed.


The user approved implementation of the final three panel materials. Production now uses Tavern oak, Crypt masonry and Pressed ash vellum at fixed Subtle (0.15) strength through shared theme tokens. Other Bestiary alternatives and the strength selector remain standalone studies. Source SVGs here retain full strength for comparison; production copies wrap the artwork at 0.15 opacity. Off is now labelled **Off / flat surfaces** and explicitly clears the production texture in the preview. Current production no longer has candle pseudo-overlays, so the preview supplies its own static overlay geometry independently. No preview runtime or captured character markup is imported into the creators. See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) and [texture provenance](../design-assets/panel-textures/README.md).


## Ledger logo studies — 15 October 2026

`design-previews/ledger-logos.html` compares four original vector marks: **A — The Scribe’s Ward** (quill and divided shield), **B — Fate’s Seal** (ten-sided die and burning trail), **C — The Illuminated Ledger** (custom angular C/L monogram), and **D — The Carrion Standard** (skull and ragged pennon). Each has a large view, a header-sized sample, 48/32/24px comparisons and a vellum/folio sample. Their source SVGs and saved comparison are in `design-previews/logo-studies/`.

Run the existing `node design-previews/serve.mjs` and open `http://127.0.0.1:8110/design-previews/ledger-logos.html`. The gallery was visually inspected with all assets loaded; SVG XML and local image references were checked. These studies use local fonts, original paths and the existing brass/oxblood/vellum palette; no copied Warhammer wordmark or faction crest is embedded. The user subsequently selected **D — The Carrion Standard** for production on 15 October. Its canonical SVG now lives in `public/assets/ledger-emblem.svg`, shared by all creators and favicons. Generated PNG install icons use that same SVG; the folio no longer adds another shield frame. A/B/C remain standalone alternatives; creator behavior is unchanged. No production build or creator regression suite is needed for these isolated previews.
