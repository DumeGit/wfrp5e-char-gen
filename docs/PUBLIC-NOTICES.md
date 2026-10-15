# Public identity and notices — 15 October 2026

The public project identity is **The Character Ledger**, an independent, unofficial WFRP Fifth Edition companion. All three creator headers state unofficial status; static footers link to Credits & rights, Privacy and Contact in `dist/legal.html`. The footer works without JavaScript, uses existing theme colours and leaves room for the phone action bar. The information page is also included in offline assets.

`dist/assets/ledger-emblem.svg` is a closed book with a burgundy cover, brass spine, vellum page edge and bookmark. It replaces the Warhammer-inspired W in production mastheads, folios, the design-system specimen and install icons. `scripts/generate-icons.py` derives PNG icons from its canonical polygons; regenerate them after changing the SVG. The old production W is removed. Historical standalone design previews and provenance remain historical, not production branding.

Credits identify Games Workshop, Cubicle 7 and the relevant authors/artists without claiming approval or a licence. In-app source/page citations remain. The credits link to the shipped pdf-lib MIT and font SIL OFL notices. They explicitly distinguish project source from underlying game material and disclose AI banner provenance. The approved contact is the repository issue tracker on GitHub. The user explicitly chose not to publish an email address. Issues are public: ask for a private contact method without posting sensitive information.

There is **no client analytics integration**: the Vercel package, integration module, generated browser SDK, build copier, SDK licence asset and former positive tracking tests were removed together. No Web Analytics dashboard setting was changed remotely. Existing provider-side data/logs are not deleted by a code change. Privacy text describes browser-local drafts/preferences, functional offline storage, local file imports/exports and separate Vercel hosting request/security logs. It does not promise zero network processing or GDPR certification. A complete public launch review still needs the operator's appropriate identity/contact and provider retention/processing arrangements.

Rules are hidden from shared search, All categories, worker matching and related-term chaining. Reviewed records, frozen audits and generated source coverage remain intact; Rules data is **still distributed** in source/index assets. Other categories, creator mechanics and the supplied PDF sheet remain unchanged.

## Clearance remains separate

These changes are presentation/privacy improvements, not permission to distribute the books, collections of game data, the supplied PDF template or generated banner illustrations. No rights holder has been contacted and no licence has been obtained by this change. Review those materials and obtain appropriate advice/permission before treating the app as cleared for a public launch. An unofficial notice, free access, a Legacy label or hiding a search category does not itself provide clearance.

## Focused verification

Use `tests/public-notices.test.mjs`, the affected search regressions and `npm run test:ui:notices` for identity, notice links, absent tracking on a production-shaped HTTPS origin and hidden Rules in all three modes. Existing offline checks cover the new static assets. Do not repeat all rule/book simulations for a presentation-only change.

Verified locally: build/book validation and generated outputs, syntax/format checks, 41 affected Node regressions and offline inclusion passed. Across the initial browser run and targeted follow-ups, all 36 selected desktop/mobile search, notices, smoke and offline cases passed. The search fixtures now use visible references; a stale Lustria test fixture explicitly accepts its book reset and selects Human instead of relying on the removed default. The first footer screenshot exposed low contrast on the dark page; shared notice colours were corrected and the mobile screenshot rechecked. The complete unrelated book/creator test suite was not rerun, and emulated mobile checks do not certify physical-phone behavior.
