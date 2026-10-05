# Old World visual studies

Four small standalone style studies live in `design-previews/`, outside the published `dist` application. They are proposals, not selected production themes. Serve that directory locally and open its `index.html`; the current development preview is http://127.0.0.1:8075/.

| Study | Direction | Sample motion / sound |
| --- | --- | --- |
| 01 — The Imperial Chronicle | Warm vellum, crimson leather, illuminated capitals, gilded marginalia and a wax seal | Candlelight / page turn |
| 02 — The Muster Roll | Riveted metal, regimental banners, worn brass and muted military colours | Embers / metal strike |
| 03 — The Witch Hunter’s Dossier | Gothic lettering, skull woodcuts, scorched paper and blood-red seals | Lantern glow and stamped ink / quill scratch |
| 04 — The Celestial Grimoire | Midnight blue, verdigris, engraved golden instruments and star charts | Turning astrolabe and starlight / glass chime |

All use the same example Soldier and compact advancement layout. Preview tabs, expandable folio sections and enlargement work; other creator actions are labelled demonstrations and do not read or mutate saved characters. Small cards deliberately crop a desktop composition; the enlarged study reveals the full composition. These are visual studies, not finished mobile creator layouts.

Motion can be paused and respects the system reduced-motion setting. Sound is off until a sample is requested, is generated with Web Audio, and stops after a short effect. CSS/SVG motion replaces GIF files for these sketches. All artwork and ornament is drawn in code; no official illustrations or supplied book PDFs are published. Any final theme should keep compact controls and clear text, using elaborate typography mainly for headings and decoration. The user has requested rich, strongly stylised Warhammer Fantasy aesthetics; the earlier minimal visual direction is superseded. No production theme has been chosen yet.

The locally bundled Cinzel Decorative, IM Fell English and UnifrakturCook fonts are from the [Google Fonts source repository](https://github.com/google/fonts). Each font's supplied SIL Open Font License is included beside the font in `design-previews/fonts/`. The studies make no external font requests at runtime and use no new plugin.

## Muster Roll: fantasy iteration

The user preferred The Muster Roll but found its riveted steel and military palette too close to Warhammer 40,000. Three further studies are in `design-previews/muster.html`, served at http://127.0.0.1:8075/muster.html. They draw on the supplied classic fantasy box-art reference without reproducing its illustration or logo. No production theme has been selected or applied.

| Variation | Direction |
| --- | --- |
| A — The Battle Standard | Crimson title cartouche, gilded display lettering, painted regimental banners and an ivory working page; closest to the supplied reference's colours |
| B — The Regimental Ledger | Light vellum navigation/folio, a wax seal and oxblood chapter markers; gentler during long creation sessions |
| C — The Black Banner | Dark warm leather, old gold, Gothic display lettering and red heraldic cloth around a parchment centre |

All three share the same original painted banner and example data, allowing comparison of the framing rather than different content. The banner stays above the functional workspace. The recently added global search is represented in the masthead. There are no sound controls or audio code in these new studies. Tabs, enlargement and folio disclosures work; the other controls explicitly demonstrate appearance without connecting to a draft or rules engine. Thumbnails crop a full desktop composition, so use Open for the complete layout. The phone gallery stacks cards; these are not finished mobile creator screens.

The user prefers **C — The Black Banner**. The previous shield/comet emblem has been replaced across these three iterations by `assets/muster-w.svg`: a native vector W with angular serifs, yellow-gold faces and crimson bevels, inspired by the supplied wordmark reference. C adds slow rising ash and mist over the painted masthead, warm candlelight at the leather edges, an occasional reflection across the W, and gentle control colour transitions. The working parchment does not move. Pause/Enable motion controls are available in both the gallery and the enlarged dialog, share one state, and follow the system reduced-motion preference. When reduced motion is requested, decorative animation is removed and the controls explain the setting. No production redesign has been authorised. Open C directly at http://127.0.0.1:8075/muster.html#black-banner.

`study-screen.mjs` now holds the common example markup and tab rows used by both galleries, preserving the original four studies without duplicate screen templates. `muster.mjs` adds the new heading/crest treatments and interactions; `muster.css` owns the variant styling. The generated banner is saved as `design-previews/assets/muster-banner-v2.png`; the full prompt and generation provenance are in [assets/README.md](../design-previews/assets/README.md). The built-in imagegen tool was used, not the CLI fallback. No supplied box artwork or book PDF is copied into the project.

Verification for this iteration: inspect the W at thumbnail/enlarged sizes, confirm C's animations progress, pause/resume in the enlarged dialog and check the gallery shares that state, switch tabs, expand the folio, check single-column phone gallery/overflow, confirm the original gallery still opens and renders, and check browser errors. Review the reduced-motion CSS and media-query listener. The release checks cover the unchanged published app separately.

Verification: inspect all four thumbnails, enlarge a study, switch preview tabs, expand the folio, toggle motion and request a sound sample. Check the narrow gallery layout and browser errors. No live app redesign, push or deployment is part of this exploratory change.
