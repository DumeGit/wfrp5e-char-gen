import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../../components/react-elements";
import { tab } from "../controls.mjs";
import { chapterHeading } from "../design-system.mjs";
import { detailKey } from "../../../../engine/disclosures.mjs";
import { grudgePanel, runeShopRows } from "../dwarf-guide-ui.mjs";
import * as M from "../../../../engine/rules.mjs";
import { characteristicNames } from "../../../../engine/ui.mjs";
import { acquisitionChoices } from "../creator-ui.mjs";
import { legacyTag, legacyName } from "../legacy.mjs";
import { legacyOption } from "../../../../engine/legacy-character.mjs";
import { magicRows, filterMagic } from "../../../../engine/magic-browser.mjs";
import { cantPanel } from "../archives-iii-ui.mjs";
import { causeControl } from "../talent-targets-ui.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function xpRow(type, name) {
    let {
      s,
      R,
      result,
      xpCareerOnly,
      xpAffordable,
      errors,
      esc,
      talentDescription,
      button,
      characteristicClass,
      characteristicBadge,
    } = getContext();

    const amount =
      ["char", "skill"].includes(type) && s.advanceSize === 1 ? 1 : 5;
    const q = M.quote(R, s, type, name, amount),
      d = result().derived;
    if (
      (xpCareerOnly && !q.inCareer) ||
      (xpAffordable && (q.error || q.cost > d.remaining))
    )
      return "";
    const blocked =
      q.error || (errors().length ? "Finish creation before spending XP." : "");
    const value =
      type === "char"
        ? d.stats[name]
        : type === "skill"
          ? combine(
              d.stats[M.skillInfo(R, name, s)?.char],
              Math.round((d.skills[name] || 0) * 5),
            )
          : 0;
    const filter =
      type === "skill"
        ? interpolate([' data-skill-search="', '"'], [esc(name.toLowerCase())])
        : "";
    const progress = combine(
      d.trackerProgress[interpolate(["", ":", ""], [type, name])] || 0,
      1,
    );
    const trackerLabel = blocked
      ? "Not currently purchasable"
      : q.tick
        ? "Career · +1 tracker box"
        : !q.inCareer
          ? "Non-career · no tracker box"
          : d.earnedBoxes >= 36
            ? "Career · tracker full"
            : amount === 1
              ? interpolate(
                  ["Career · ", "/5 toward a tracker box"],
                  [progress % 5],
                )
              : "Career · no tracker box";
    if (["char", "skill"].includes(type)) {
      const label = type === "char" ? characteristicNames[name] : name;
      const tracker = blocked
        ? "Unavailable"
        : trackerLabel
            .replace("toward a tracker box", "to next box")
            .replace("tracker box", "box");
      const loadNote =
        (type === "char"
          ? name === "Ag"
          : M.skillInfo(R, name, s)?.char === "Ag") &&
        result().equipment.penalties.complete &&
        result().equipment.penalties.band;
      const careerClass =
        type === "char"
          ? interpolate(
              [" xp-characteristic-row ", ""],
              [characteristicClass(name)],
            )
          : "";
      return element(
        "div",
        {
          class: ["xp-row xp-advance-row", careerClass].join(""),
          ...attributes(filter),
        },
        element(
          "div",
          { class: "xp-advance-identity" },
          element(
            "div",
            { class: "xp-advance-name" },
            element("strong", {}, esc(label)),
            type === "char" ? characteristicBadge(name) : "",
            legacyTag(R, {
              ...q,
              legacySources: legacyOption(R, s, type, name).legacySources,
            }),
          ),
          "\n",
          element(
            "span",
            { class: "xp-advance-meta", title: esc(trackerLabel) },
            esc(tracker),
          ),
        ),
        "\n",
        element(
          "div",
          { class: "xp-advance-result" },
          element(
            "span",
            { class: "advance-result" },
            value,
            " ",
            element("span", { "aria-hidden": "true" }, "→"),
            " ",
            combine(value, amount),
            " ",
            element("small", {}, "+", amount),
          ),
        ),
        button(
          "calculation",
          "?",
          interpolate(
            [
              'data-kind="',
              '" data-name="',
              '" aria-label="How is ',
              ' calculated?" title="How is ',
              ' calculated?"',
            ],
            [type, esc(name), esc(label), esc(label)],
          ),
          "advance-calculation-help",
        ),
        element(
          "div",
          { class: "xp-advance-purchase" },
          button(
            "buy",
            interpolate(["", " XP"], [q.cost || "—"]),
            interpolate(
              [
                'data-type="',
                '" data-name="',
                '" data-amount="',
                '" ',
                ' title="',
                '"',
              ],
              [
                type,
                esc(name),
                amount,
                blocked ? "disabled" : "",
                esc(blocked || "Purchase this improvement"),
              ],
            ),
            "primary",
          ),
        ),
        blocked
          ? element(
              "p",
              { class: "purchase-error xp-advance-note" },
              esc(blocked),
            )
          : "",
        loadNote
          ? element(
              "p",
              { class: "minilabel xp-advance-note" },
              "Base score shown; the folio includes load penalties (p. 299).",
            )
          : "",
      );
    }
    if (type === "talent")
      return element(
        "div",
        { class: "xp-row xp-talent-row" },
        element(
          "div",
          {},
          talentDescription(name, {
            quote: q,
            metadata: element(
              "span",
              { class: "xp-talent-meta" },
              element(
                "span",
                {},
                d.talents.filter((t) => t === name).length,
                " ranks owned",
              ),
              element("span", {}, esc(trackerLabel)),
            ),
          }),
        ),
        "\n",
        element(
          "div",
          {},
          button(
            "buy",
            interpolate(["", " XP"], [q.cost || "—"]),
            interpolate(
              ['data-type="talent" data-name="', '" ', ' title="', '"'],
              [
                esc(name),
                blocked ? "disabled" : "",
                esc(blocked || "Purchase this improvement"),
              ],
            ),
            "primary",
          ),
          blocked
            ? element("p", { class: "minilabel purchase-error" }, esc(blocked))
            : "",
        ),
        "\n",
      );
    return "";
  }

  function experienceTalents() {
    let { result, R, s, talentDescription, esc, button } = getContext();

    const d = result().derived,
      available = [],
      known = [],
      unavailable = [];
    for (const name of M.careerTalentOptions(R, s, d.level)) {
      const reason = M.invalidTalent(R, s, name);
      (reason.startsWith("Already known;")
        ? known
        : reason
          ? unavailable
          : available
      ).push(name);
    }
    const cause = M.careerTalentOptions(R, s, d.level).some(
      (n) => M.base(n) === "Impassioned Zeal",
    )
      ? causeControl(s, esc, button)
      : "";
    return fragment(
      cause,
      element(
        "section",
        { class: "talent-group" },
        element(
          "h3",
          {},
          "Career Talents ",
          element("span", { class: "counter" }, available.length),
        ),
        "\n",
        element(
          "p",
          { class: "small muted" },
          "Each purchase costs 100 XP. The button shows why a purchase is unavailable.",
        ),
        available.length
          ? runeShopRows(available, (n) => xpRow("talent", n), "available")
          : element(
              "p",
              { class: "empty" },
              "No new Career Talents can be learned at this level.",
            ),
      ),
      known.length
        ? element(
            "details",
            {
              "data-detail-key": detailKey(
                "experience-view:experienceTalents:0",
              ),
              class: "talent-catalog-group",
              "data-group": "known-talents",
            },
            element(
              "summary",
              {},
              "Already learned ",
              element("span", { class: "counter" }, known.length),
            ),
            element(
              "p",
              { class: "small muted" },
              "These Talents cannot be purchased again under their normal rules.",
            ),
            joinNodes(
              known.map((n) =>
                element(
                  "div",
                  { class: "known-talent" },
                  element(
                    "span",
                    { class: "owned-ranks" },
                    d.talents.filter((t) => t === n).length,
                    " ranks owned",
                  ),
                  talentDescription(n),
                ),
              ),
              "",
            ),
          )
        : "",
      unavailable.length
        ? element(
            "details",
            {
              "data-detail-key": detailKey(
                "experience-view:experienceTalents:1",
              ),
              class: "talent-catalog-group",
              "data-group": "unavailable-talents",
            },
            element(
              "summary",
              {},
              "Unavailable alternatives ",
              element("span", { class: "counter" }, unavailable.length),
            ),
            element(
              "p",
              { class: "small muted" },
              "These choices have a rule restriction. Expand a Talent to read its rules.",
            ),
            runeShopRows(unavailable, (n) => xpRow("talent", n), "unavailable"),
          )
        : "",
    );
  }

  function experienceSkills() {
    let { result, R, s, select, esc, skillSearch } = getContext();

    const d = result().derived,
      unlocks = M.talentSkillUnlocks(R, s);
    const all = [
      ...new Set([
        ...d.currentSkills,
        ...unlocks,
        ...Object.keys(d.skills),
        ...R.skills
          .filter((x) => !x.advanced)
          .flatMap((x) =>
            x.grouped
              ? M.options(R, interpolate(["", " (Any)"], [x.name]), "skill", s)
              : [x.name],
          ),
      ]),
    ].sort((a, b) => a.localeCompare(b));
    const career = all.filter((n) => d.currentSkills.includes(n));
    const trained = all.filter(
      (n) => !d.currentSkills.includes(n) && (d.skills[n] || 0) > 0,
    );
    const other = all.filter(
      (n) => !d.currentSkills.includes(n) && !(d.skills[n] > 0),
    );
    const groups = Object.groupBy
      ? Object.groupBy(other, M.base)
      : other.reduce((out, n) => ((out[M.base(n)] ??= []).push(n), out), {});
    return fragment(
      d.talents.includes("Seasoned Traveller")
        ? element(
            "div",
            { class: "field" },
            element(
              "label",
              { for: "local-region" },
              "Current region for Seasoned Traveller",
            ),
            select(
              'id="local-region" data-bind="localRegion"',
              [
                "Local",
                "Reikland",
                "Empire",
                "Bretonnia",
                "Estalia",
                "Tilea",
                "Kislev",
                "Wasteland",
              ],
              s.localRegion,
              true,
            ),
            element(
              "small",
              { class: "muted" },
              "Confirm with your GM. Only the selected regional Lore is unlocked, while you remain there (p. 125); non-career XP still costs double.",
            ),
          )
        : "",
      element(
        "div",
        { class: "field skill-search" },
        element("label", { for: "xp-skill-search" }, "Find a Skill"),
        element("input", {
          id: "xp-skill-search",
          type: "search",
          placeholder: "Search Skills or specialisations…",
          value: esc(skillSearch),
          autocomplete: "off",
        }),
        element(
          "small",
          { class: "muted" },
          "Your Career Skills come first. Browse other Basic Skills and talent-unlocked Skills below.",
        ),
      ),
      "\n",
      element("p", {
        id: "xp-skill-results",
        class: "minilabel",
        "aria-live": "polite",
      }),
      "\n",
      element(
        "section",
        { class: "skill-group" },
        element(
          "h3",
          {},
          "Current Career Skills ",
          element("span", { class: "counter" }, career.length),
        ),
        joinNodes(
          career.map((n) => xpRow("skill", n)),
          "",
        ),
      ),
      trained.length
        ? element(
            "section",
            { class: "skill-group" },
            element(
              "h3",
              {},
              "Other trained Skills ",
              element("span", { class: "counter" }, trained.length),
            ),
            joinNodes(
              trained.map((n) => xpRow("skill", n)),
              "",
            ),
          )
        : "",
      element(
        "section",
        { class: "skill-group skill-catalog" },
        element(
          "h3",
          {},
          "Other available Skills ",
          element("span", { class: "counter" }, other.length),
        ),
        "\n",
        element(
          "p",
          { class: "small muted" },
          "Skills with several specialisations can be expanded. Non-career Advances cost double.",
        ),
        joinNodes(
          Object.entries(groups).map(([base, names]) =>
            names.length === 1
              ? xpRow("skill", names[0])
              : element(
                  "details",
                  {
                    "data-detail-key": detailKey(
                      "experience:skill-group",
                      base,
                    ),
                    class: "skill-catalog-group",
                    "data-group": esc(base),
                  },
                  element(
                    "summary",
                    {},
                    esc(base),
                    " ",
                    element(
                      "span",
                      { class: "minilabel" },
                      names.length,
                      " options",
                    ),
                  ),
                  joinNodes(
                    names.map((n) => xpRow("skill", n)),
                    "",
                  ),
                ),
          ),
          "",
        ),
      ),
    );
  }

  function filterSkills() {}

  function experience() {
    let {
      result,
      errors,
      R,
      s,
      xpTab,
      characteristicLegend,
      button,
      esc,
      page,
      issuePanel,
      trackerBoxes,
      xpCareerOnly,
      xpAffordable,
      select,
      ledgerTable,
    } = getContext();

    const d = result().derived,
      e = errors(),
      c = M.career(R, s),
      q = M.quote(R, s, "promotion", "");
    let rows = "";
    if (xpTab === "Characteristics")
      rows = combine(
        characteristicLegend({ compact: true }),
        joinNodes(
          M.KEYS.map((k) => xpRow("char", k)),
          "",
        ),
      );
    if (xpTab === "Skills") rows = experienceSkills();
    if (xpTab === "Talents")
      rows = combine(grudgePanel(R, s), experienceTalents());
    if (xpTab === "Magic") rows = spellShop();
    return fragment(
      element("span", { class: "eyebrow" }, "07 / Experience"),
      chapterHeading("Spend experience"),
      "\n",
      element(
        "div",
        { class: "xp-balance xp-sticky-balance" },
        element(
          "div",
          {},
          element("span", {}, "XP budget"),
          element("strong", {}, d.xpTotal.toLocaleString()),
          d.xpBonus
            ? element(
                "small",
                {},
                s.xp.toLocaleString(),
                " base + ",
                d.xpBonus,
                " star-sign XP",
              )
            : "",
        ),
        "\n",
        element(
          "div",
          {},
          element("span", {}, "Spent"),
          element("strong", {}, d.spent.toLocaleString()),
        ),
        "\n",
        element(
          "div",
          { class: "remaining" },
          element("span", {}, "Available to spend"),
          element("strong", {}, d.remaining.toLocaleString()),
        ),
        "\n",
      ),
      "\n",
      element(
        "details",
        {
          "data-detail-key": detailKey("experience-view:experience:0"),
          class: "budget-edit",
        },
        element("summary", {}, "Edit XP budget"),
        element(
          "div",
          { class: "budget-form" },
          element(
            "div",
            { class: "field" },
            element("label", { for: "xp" }, "Base XP budget"),
            element("input", {
              id: "xp",
              type: "number",
              min: Math.max(0, d.spent - d.xpBonus),
              step: "1",
              value: s.xp,
            }),
          ),
          button("set-xp", "Update budget", "", "secondary"),
        ),
        "\n",
        element(
          "p",
          { class: "small muted" },
          "Includes spent XP. Star-sign XP is added separately. Unspent experience can be kept.",
        ),
        "\n",
      ),
      e.length ? issuePanel(e, "Finish creation to spend XP") : "",
      element(
        "div",
        { class: "career-progress" },
        element(
          "div",
          { class: "split" },
          element(
            "strong",
            {},
            esc(c.levels[d.level - 1].name),
            " ",
            legacyTag(R, c),
          ),
          element("span", { class: "level-pill" }, "Career level ", d.level),
        ),
        trackerBoxes(d),
        d.level < 4
          ? fragment(
              element(
                "p",
                { class: "promotion-action" },
                button(
                  "promote",
                  "Advance Career · 100 XP",
                  interpolate(
                    ["", ' aria-describedby="promotion-reason"'],
                    [q.error || e.length ? "disabled" : ""],
                  ),
                  "secondary",
                ),
              ),
              "\n",
              element(
                "details",
                {
                  class: "promotion-help",
                  "data-detail-key": "experience:promotion-help",
                },
                element(
                  "summary",
                  {},
                  "Career advancement",
                  q.error ? " · not ready" : "",
                ),
                element(
                  "p",
                  { id: "promotion-reason" },
                  esc(
                    e.length
                      ? "Finish the highlighted creation choices before advancing the Career."
                      : q.error ||
                          "Your tracker and XP allow this advancement.",
                  ),
                ),
                element(
                  "p",
                  {},
                  "Requires the Advance Career Endeavour (p. 196). Using this button records that requirement as met.",
                ),
              ),
            )
          : "",
      ),
      "\n",
      element(
        "div",
        { class: "xp-browser-controls" },
        element(
          "label",
          { class: "check-row" },
          element("input", {
            type: "checkbox",
            "data-bind": "xpCareerOnly",
            ...attributes(xpCareerOnly ? "checked" : ""),
          }),
          "Career only",
        ),
        element(
          "label",
          { class: "check-row" },
          element("input", {
            type: "checkbox",
            "data-bind": "xpAffordable",
            ...attributes(xpAffordable ? "checked" : ""),
          }),
          "Affordable now",
        ),
        element(
          "details",
          {
            class: "browser-help",
            "data-detail-key": "experience:filter-help",
          },
          element(
            "summary",
            { "aria-label": "About filters" },
            element("span", { "aria-hidden": "true" }, "?"),
          ),
          element(
            "p",
            {},
            "Filters hide rows; prices and eligibility stay the same. Career-only applies to Characteristics, Skills and Talents; magic uses its own access filters.",
          ),
        ),
      ),
      "\n",
      element(
        "div",
        { class: "page-tabs", role: "tablist", "aria-label": "XP purchases" },
        joinNodes(
          ["Characteristics", "Skills", "Talents", "Magic"].map((t) =>
            tab(t, {
              id: interpolate(["xp-tab-", ""], [t]),
              panel: "xp-content",
              selected: t === xpTab,
              action: "xp-tab",
              value: t,
              short: t === "Characteristics" ? "Stats" : t,
            }),
          ),
          "",
        ),
      ),
      ["Characteristics", "Skills"].includes(xpTab)
        ? element(
            "div",
            { class: "advance-choice" },
            element("span", { class: "label" }, "Advance by"),
            element(
              "div",
              {
                class: "inline-choice",
                role: "group",
                "aria-label": "Advance size",
              },
              joinNodes(
                [5, 1].map((n) =>
                  button(
                    "advance-size",
                    interpolate(["+", ""], [n]),
                    interpolate(
                      ['data-size="', '" aria-pressed="', '"'],
                      [n, s.advanceSize === n],
                    ),
                    s.advanceSize === n ? "quiet active" : "quiet",
                  ),
                ),
                "",
              ),
            ),
            "\n",
            element(
              "details",
              {
                class: "advance-help",
                "data-detail-key": "experience:advance-help",
              },
              element("summary", {}, "Advance rules"),
              element(
                "p",
                {},
                "Each purchase shows its price, source and tracker effect. ",
                page("191, 364"),
              ),
              element(
                "p",
                {},
                s.advanceSize === 1
                  ? "Optional individual Advances: Appendix II, p. 364. Five +1 Advances in the same Career Skill or Characteristic earn one tracker box."
                  : "+5 Advances: p. 191. An incomplete +1 band must reach five before returning to +5 on that Skill or Characteristic.",
              ),
              element(
                "p",
                {},
                "✓ marks currently available Career Characteristics. Later levels become Career Characteristics when you reach that level; non-career purchases cost double.",
              ),
            ),
          )
        : "",
      element(
        "div",
        {
          id: "xp-content",
          role: "tabpanel",
          "aria-labelledby": ["xp-tab-", xpTab].join(""),
          ...attributes(e.length ? 'class="unavailable"' : ""),
        },
        rows,
      ),
      "\n",
      element(
        "details",
        {
          "data-detail-key": detailKey("experience-view:experience:1"),
          class: "section-gap",
        },
        element(
          "summary",
          {},
          "Acquire a higher-level Career Trapping ",
          legacyTag(R, c),
        ),
        element(
          "p",
          {},
          "Only record an item from the next Career level, actually obtained with your GM. This does not create free gear or deduct coin. Each different next-level Trapping earns one box (pp. 43–44).",
        ),
        "\n",
        element(
          "div",
          { class: "field" },
          element("label", { for: "new-trapping" }, "Trapping"),
          select(
            'id="new-trapping"',
            c.levels
              .filter((l) => l.level === combine(d.level, 1))
              .flatMap((l) =>
                l.trappings.map((t, i) => [
                  interpolate(["", ":", ""], [l.level, i]),
                  interpolate(
                    ["Level ", ": ", ""],
                    [l.level, legacyName(R, l.source ? l : c, t)],
                  ),
                ]),
              ),
          ),
        ),
        "\n",
        element(
          "div",
          { class: "field" },
          element(
            "label",
            { for: "owned-trapping" },
            "Use an existing owned item?",
          ),
          select(
            'id="owned-trapping"',
            [
              ["", "New item obtained outside the starting shop"],
              ...acquisitionChoices(R, s),
            ],
            "",
          ),
        ),
        "\n",
        element(
          "div",
          { class: "field" },
          element("label", { for: "acquisition" }, "How was it obtained?"),
          element("input", {
            id: "acquisition",
            placeholder: "Gift, campaign reward, or purchase from other funds",
          }),
        ),
        button("acquire", "Record acquisition", e.length ? "disabled" : ""),
      ),
      "\n",
      element(
        "details",
        {
          "data-detail-key": detailKey("experience-view:experience:2"),
          class: "ledger-section",
          open: "",
        },
        element(
          "summary",
          {},
          "XP ledger ",
          element("span", { class: "counter" }, s.ledger.length, " entries"),
        ),
        ledgerTable(),
      ),
      "\n",
      element(
        "p",
        { class: "small muted" },
        "Non-career Characteristics and Basic Skills cost double. Training and Unusual Learning Endeavours, Career changes, and GM awards are outside this creation workflow.",
      ),
    );
  }

  function spellQuote(name, talent) {
    let { R, s } = getContext();

    return M.quoteSpell(R, s, name, talent);
  }

  function spellShop() {
    let {
      R,
      s,
      result,
      errors,
      magicFilters,
      magicSection,
      hasColourMagic,
      button,
      esc,
      xpAffordable,
      select,
      spellDescription,
    } = getContext();

    const rows = magicRows(R, s),
      d = result().derived,
      issues = errors(),
      choices = filterMagic(rows, magicFilters).filter(
        (x) =>
          !xpAffordable ||
          x.owned ||
          (x.quote && !x.quote.error && x.quote.cost <= d.remaining),
      ),
      known = rows.filter((x) => x.owned),
      legal = rows.filter((x) => !x.owned && x.quote && !x.quote.error);
    const fields = [
      [
        "type",
        "Knowledge type",
        [["all", "All types"], ...[...new Set(rows.map((x) => x.type))].sort()],
      ],
      [
        "lore",
        "Lore / tradition",
        [
          ["all", "All traditions"],
          ...[
            ...new Set(
              rows
                .flatMap((x) => x.lores?.filter((l) => l !== "*") || [x.lore])
                .filter(Boolean),
            ),
          ].sort(),
        ],
      ],
      [
        "book",
        "Source",
        [
          ["all", "All selected books"],
          ...R.books
            .filter((b) => rows.some((x) => x.source.book === b.id))
            .map((b) => [b.id, b.shortTitle || b.title]),
        ],
      ],
      [
        "status",
        "Show",
        [
          ["available", "Available to learn now"],
          ["known", "Already known"],
          ["all", "Browse all, including locked"],
        ],
      ],
    ];
    return fragment(
      magicSection(),
      hasColourMagic() ? cantPanel(R, s) : "",
      element(
        "section",
        { class: "magic-browser" },
        element("h3", {}, "Magic & knowledge library"),
        !legal.length
          ? element(
              "div",
              { class: "notice" },
              element(
                "strong",
                {},
                known.length
                  ? "No additional purchases available now."
                  : "No magical training yet.",
              ),
              element(
                "p",
                { class: "small" },
                "Spell learning follows your Talents, Lore and prerequisites. You can browse references without granting yourself any powers.",
              ),
              button("browse-magic", "Browse all magic & knowledge"),
            )
          : "",
        element(
          "div",
          { class: "field" },
          element("label", { for: "magic-search" }, "Find magic or knowledge"),
          element("input", {
            id: "magic-search",
            type: "search",
            "data-search": "magic",
            value: esc(magicFilters.query),
            placeholder: "Name, tradition or effect",
          }),
        ),
        "\n",
        element(
          "div",
          { class: "browser-filters" },
          joinNodes(
            fields.map(([key, label, items]) =>
              element(
                "div",
                { class: "field" },
                element("label", { for: ["magic-", key].join("") }, label),
                select(
                  interpolate(
                    ['id="magic-', '" data-bind="magicFilter" data-key="', '"'],
                    [key, key],
                  ),
                  items,
                  magicFilters[key],
                ),
              ),
            ),
            "",
          ),
        ),
        "\n",
        element(
          "p",
          { class: "small muted", "aria-live": "polite" },
          choices.length,
          " matching profiles. Rituals, spells, prayers, techniques and rune knowledge keep their distinct learning rules.",
        ),
        choices.length
          ? joinNodes(
              choices.map((x) => {
                const q = x.quote,
                  reason = x.owned
                    ? "Already known."
                    : q?.error ||
                      (!q
                        ? x.type === "Cant"
                          ? "Choose Cants above after meeting the appropriate Lore and spell-count threshold."
                          : x.type === "Rune"
                            ? "Requires this rune Talent option in your current Career."
                            : interpolate(
                                [
                                  "Requires an appropriate spell-learning Talent and access to ",
                                  ".",
                                ],
                                [x.lore || x.category],
                              )
                        : issues.length
                          ? "Finish creation before spending XP."
                          : ""),
                  action =
                    x.type === "Technique"
                      ? "buy-technique"
                      : x.type === "Rune"
                        ? "buy"
                        : "buy-spell";
                return element(
                  "article",
                  { class: "xp-row magic-profile" },
                  element(
                    "div",
                    {},
                    spellDescription({ ...x, category: x.type }),
                    element(
                      "small",
                      {},
                      esc(x.lore || ""),
                      " · ",
                      x.cn !== undefined
                        ? interpolate(["CN ", " · "], [esc(x.cn)])
                        : "",
                      x.owned
                        ? "Known"
                        : q
                          ? interpolate(["", " XP"], [q.cost])
                          : "Locked",
                      q?.discount
                        ? interpolate([" · ", ""], [esc(q.discount)])
                        : "",
                    ),
                  ),
                  "\n",
                  element(
                    "div",
                    {},
                    x.owned
                      ? element("span", { class: "counter" }, "Known")
                      : button(
                          action,
                          q
                            ? interpolate(["", " XP"], [q.cost])
                            : "Unavailable",
                          interpolate(
                            [
                              'data-type="talent" data-name="',
                              '" data-talent="',
                              '" ',
                              "",
                            ],
                            [
                              esc(x.type === "Rune" ? x.talent : x.name),
                              esc(q?.talent || x.talent || ""),
                              reason ? "disabled" : "",
                            ],
                          ),
                          "primary",
                        ),
                    reason && !x.owned
                      ? element(
                          "p",
                          { class: "purchase-error minilabel" },
                          esc(reason),
                        )
                      : "",
                  ),
                  "\n",
                );
              }),
              "",
            )
          : element(
              "p",
              { class: "empty" },
              "No profiles match these filters. Try browsing all or changing the search.",
            ),
      ),
    );
  }
  return {
    xpRow,
    experienceTalents,
    experienceSkills,
    filterSkills,
    experience,
    spellQuote,
    spellShop,
  };
}
