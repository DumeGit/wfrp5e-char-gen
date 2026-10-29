import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../../components/react-elements";
import { chapterHeading } from "../design-system.mjs";
import { causeControl } from "../talent-targets-ui.mjs";
import { sourceButton, legacySummary } from "../source-controls.mjs";
import { detailKey } from "../../../../engine/disclosures.mjs";
import { elfSkillsPanel } from "../high-elf-ui.mjs";
import { grudgePanel, runePanel } from "../dwarf-guide-ui.mjs";
import * as M from "../../../../engine/rules.mjs";
import { characteristicNames } from "../../../../engine/ui.mjs";
import { randomTable } from "../../../../engine/books.mjs";
import { sourceLabel } from "../../../../engine/sources.mjs";
import { legacyTag } from "../legacy.mjs";
import {
  legacyOption,
  legacyGear,
} from "../../../../engine/legacy-character.mjs";
import { tablePicker } from "../book-ui.mjs";
import {
  careerBrowser,
  careerOptions,
  trainingPrerequisites,
  kitSummary,
} from "../flow-ui.mjs";
import {
  creationSpecies,
  originProfile,
  careerRefinementTable,
  regionalCareerChoices,
  startingTalentReplacement,
  careerAvailable,
} from "../../../../engine/origins.mjs";
import { astrologyPanel } from "../archives-ui.mjs";
import { starSign, starEffect } from "../../../../engine/astrology.mjs";
import { speciesMagicReferences } from "../../../../engine/species-mechanics.mjs";
import { originTalentChoice, divinePanel } from "../archives-iii-ui.mjs";
import {
  psychometryPanel,
  psychicSkillPanel,
  womReferencePanel,
  womGearPanel,
  pettyGrantNote,
} from "../winds-of-magic-ui.mjs";
import { psychometrySacrifice } from "../../../../engine/winds-of-magic.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function optionalCareerChoices() {
    let { s, R, esc, ref, button } = getContext();

    if (s.careerMode === "choose") return "";
    const table = careerRefinementTable(R, s),
      refined = s.careerRefinement,
      choices = regionalCareerChoices(R, s, s.regionalCareerBase || s.career);
    return interpolate(
      ["", "", "", ""],
      [
        table && !refined
          ? element(
              "div",
              { class: "notice" },
              element("strong", {}, "Optional Career roll"),
              element(
                "p",
                { class: "small" },
                "Keep your rolled Career, or roll once on the additional ",
                esc(M.career(R, s).name),
                " table (",
                ref(table),
                "). Species restrictions still apply.",
              ),
              button("career-refine", "Roll optional Career · d100"),
            )
          : "",
        refined
          ? element(
              "div",
              { class: "notice" },
              element(
                "p",
                {},
                esc(refined.message),
                " ",
                legacyTag(R, refined),
              ),
              refined.career !== refined.base
                ? button("career-original", "Keep original Career")
                : "",
            )
          : "",
        choices.length
          ? element(
              "div",
              { class: "notice" },
              element("strong", {}, "Printed Career alternatives"),
              element(
                "p",
                { class: "small" },
                "You may keep the rolled Career or choose a printed alternative.",
              ),
              "\n",
              element(
                "div",
                { class: "actions" },
                s.regionalCareerBase
                  ? button("regional-original", "Keep original regional result")
                  : "",
                joinNodes(
                  choices
                    .filter((id) => id !== s.career)
                    .map((id) =>
                      button(
                        "regional-career",
                        esc(R.careers.find((c) => c.id === id).name),
                        interpolate(['data-id="', '"'], [esc(id)]),
                      ),
                    ),
                  "",
                ),
              ),
              "\n",
            )
          : "",
      ],
    );
  }

  function careerView() {
    let {
      R,
      s,
      esc,
      careerSearch,
      careerFilter,
      careerBook,
      careerPreview,
      careerLimit,
      button,
      select,
      page,
      ref,
      talentDescription,
    } = getContext();

    const c = M.career(R, s),
      available = R.careers.filter((x) => careerAvailable(R, s, x)),
      bonus = M.bonusTrappingLimit(R, s);
    if (!s.career)
      return fragment(
        chapterHeading("Choose your Career"),
        "\n",
        element(
          "section",
          { class: "career-roll-controls", "aria-label": "Roll a Career" },
          element(
            "div",
            { class: "actions" },
            button(
              "career-roll",
              s.careerAttempts ? "Roll another Career" : "Roll Career · d100",
              randomTable(R, s, "career") ? "" : "disabled",
              "primary",
            ),
          ),
          tablePicker(R, s, "career"),
        ),
        "\n",
        element(
          "section",
          { class: "chosen-career", "aria-label": "Chosen Career" },
          element("h2", {}, "No Career selected"),
          element(
            "p",
            { class: "small muted" },
            "Roll a Career above, or preview a Career below and choose it.",
          ),
        ),
        "\n",
        careerBrowser(R, s, {
          query: careerSearch,
          className: careerFilter,
          book: careerBook,
          preview: careerPreview,
          limit: careerLimit,
        }),
      );
    return fragment(
      chapterHeading("Choose your Career"),
      "\n",
      element(
        "section",
        { class: "career-roll-controls", "aria-label": "Roll a Career" },
        element(
          "div",
          { class: "actions" },
          button(
            "career-roll",
            s.careerAttempts ? "Roll another Career" : "Roll Career · d100",
            randomTable(R, s, "career")
              ? ""
              : 'disabled title="Choose a printed Career roll table, or choose a Career directly"',
            "primary",
          ),
          s.careerAttempts === 1 && randomTable(R, s, "career")
            ? button("career-three", "Roll two more")
            : "",
        ),
        tablePicker(R, s, "career"),
      ),
      "\n",
      element(
        "section",
        { class: "chosen-career", "aria-label": "Chosen Career" },
        element("span", { class: "eyebrow" }, "Chosen Career"),
        element("h2", {}, esc(c.name), " ", legacyTag(R, c)),
        element(
          "span",
          { class: "small muted" },
          esc(c.class),
          " · ",
          sourceButton(R, c),
        ),
        element(
          "p",
          {},
          "Begin as ",
          element("strong", {}, esc(c.levels[0].name)),
          " — ",
          c.levels[0].status,
          " ",
          c.levels[0].standing,
          ". Starting Characteristics: ",
          joinNodes(
            Object.entries(c.advanceScheme)
              .filter(([, level]) => level === 1)
              .map(([key]) => key),
            ", ",
          ),
          ".",
        ),
      ),
      s.careerOffers.length === 3
        ? fragment(
            element(
              "p",
              { class: "small" },
              "Choose one result for one bonus Trapping:",
            ),
            "\n",
            element(
              "div",
              { class: "actions" },
              joinNodes(
                s.careerOffers.map((id) =>
                  button(
                    "career-offer",
                    esc(R.careers.find((c) => c.id === id).name),
                    interpolate(['data-id="', '"'], [id]),
                  ),
                ),
                "",
              ),
            ),
          )
        : "",
      optionalCareerChoices(),
      element(
        "p",
        { class: "muted" },
        available.length,
        " of ",
        R.careers.length,
        " enabled Careers are available to ",
        esc(originProfile(R, s)?.name || s.species),
        " characters.",
      ),
      careerOptions(R, s),
      trainingPrerequisites(R, s, { select, button }),
      element(
        "div",
        { class: "notice" },
        bonus
          ? interpolate(
              [
                "Select ",
                " level-two Trapping",
                ". Each earns one tracker box.",
                "",
              ],
              [
                bonus,
                bonus === 1 ? "" : "s",
                s.careerMode === "first" && bonus < 2
                  ? " This Career lists only one option."
                  : "",
              ],
            )
          : "Chosen Career: standard starting Trappings, no bonus tracker boxes.",
        " ",
        page(36),
      ),
      bonus
        ? fragment(
            element(
              "h3",
              {},
              "Bonus Trappings ",
              element(
                "span",
                { class: "counter" },
                s.bonusGear.length,
                "/",
                bonus,
              ),
            ),
            "\n",
            element(
              "div",
              { class: "checklist" },
              joinNodes(
                M.bonusTrappingSlots(R, s).map(({ name: t, i }) =>
                  element(
                    "label",
                    { class: "check-row" },
                    element("input", {
                      type: "checkbox",
                      "data-bind": "bonusGear",
                      value: i,
                      ...attributes(s.bonusGear.includes(i) ? "checked" : ""),
                    }),
                    esc(t),
                  ),
                ),
                "",
              ),
            ),
          )
        : "",
      c.text
        ? element("div", { class: "notice" }, esc(c.text), " ", ref(c))
        : "",
      joinNodes(
        (originProfile(R, s)?.additionalCareers || [])
          .filter((x) => x.career === c.id)
          .map((x) =>
            element(
              "div",
              { class: "notice" },
              esc(x.reason),
              " ",
              ref(originProfile(R, s)),
            ),
          ),
        "",
      ),
      element(
        "div",
        {
          class: "actions contextual-continue",
          "aria-label": "Next creation step",
        },
        button(
          "step",
          "Continue to Characteristics",
          'data-step="2"',
          "primary",
        ),
      ),
      element(
        "details",
        {
          "data-detail-key": detailKey("career:browse", c.contentId || c.id),
          class: "career-browse-disclosure",
        },
        element("summary", {}, "Change Career · Browse alternatives"),
        element(
          "p",
          { class: "muted" },
          available.length,
          " available Careers. Previewing alternatives leaves your current Career unchanged.",
        ),
        careerBrowser(R, s, {
          query: careerSearch,
          className: careerFilter,
          book: careerBook,
          preview: careerPreview,
          limit: careerLimit,
        }),
      ),
      element(
        "details",
        { "data-detail-key": detailKey("career:path", c.contentId || c.id) },
        element("summary", {}, "Read the full Career path"),
        element("h3", {}, "The Career path"),
        joinNodes(
          c.levels.map((l) =>
            element(
              "details",
              {
                "data-detail-key": detailKey(
                  "career:level",
                  combine(combine(c.contentId, ":"), l.level),
                ),
                ...attributes(l.level === 1 ? "open" : ""),
              },
              legacySummary(
                fragment(
                  l.level,
                  ". ",
                  esc(l.name),
                  " · ",
                  l.status,
                  " ",
                  l.standing,
                ),
                legacyTag(R, l.source ? l : c),
              ),
              element(
                "p",
                {},
                element("strong", {}, "Skills:"),
                " ",
                esc(joinNodes(l.skills, ", ")),
              ),
              joinNodes(
                (l.unavailableSkills || []).map((x) =>
                  element(
                    "p",
                    { class: "small muted" },
                    element("strong", {}, esc(x.name), " · unavailable"),
                    element("br", {}),
                    esc(x.reason),
                  ),
                ),
                "",
              ),
              element(
                "p",
                {},
                element("strong", {}, "Talents:"),
                " ",
                joinNodes(
                  l.talents.map((n) =>
                    M.talentInfo(R, n)?.unavailable
                      ? element(
                          "span",
                          { class: "muted" },
                          esc(n),
                          " (unavailable)",
                        )
                      : esc(n),
                  ),
                  ", ",
                ),
              ),
              joinNodes(
                l.talents
                  .filter((n) => M.talentInfo(R, n)?.unavailable)
                  .map((n) => talentDescription(n)),
                "",
              ),
              element(
                "p",
                {},
                element("strong", {}, "Trappings:"),
                " ",
                esc(joinNodes(l.trappings, ", ")),
              ),
              "\n",
            ),
          ),
          "",
        ),
      ),
    );
  }

  function characteristics() {
    let {
      R,
      s,
      page,
      button,
      characteristicLegend,
      select,
      characteristicClass,
      characteristicBadge,
    } = getContext();

    const c = M.career(R, s),
      sp = R.species[s.species],
      budget = s.charMode === "first" ? 6 : s.charMode === "rearrange" ? 3 : 0;
    return fragment(
      element("span", { class: "eyebrow" }, "03 / Characteristics"),
      chapterHeading("Characteristics"),
      legacyTag(R, R.species[s.species]),
      element(
        "p",
        { class: "muted" },
        "Each score starts with your Species modifier and a roll or point allocation. ",
        page(38),
      ),
      "\n",
      element(
        "div",
        { class: "actions" },
        button(
          "char-roll",
          s.charAttempts ? "Reroll 10 × 2d10" : "Roll 10 × 2d10",
          "",
          "primary",
        ),
        button("char-points", "Allocate 100 points"),
        s.charRolls.length
          ? button("char-rearrange", "Rearrange rolled values")
          : "",
      ),
      "\n",
      element(
        "div",
        { class: "notice" },
        s.charMode === "points"
          ? "Distribute exactly 100 points, from 4 to 16 in each Characteristic."
          : s.charMode === "first"
            ? "First rolls retained in order: up to +6 starting points across your three Career Characteristics."
            : s.charMode === "rearrange"
              ? "First results rearranged: up to +3 starting points across your three Career Characteristics."
              : "Rerolled results: assign each result once; no extra starting points.",
      ),
      s.charMode === "points"
        ? fragment(
            element(
              "p",
              {},
              element(
                "span",
                { class: "counter" },
                s.points.reduce((a, b) => combine(a, b), 0),
                " / 100 points allocated",
              ),
            ),
            "\n",
            element(
              "div",
              { class: "points-grid" },
              joinNodes(
                M.KEYS.map((k, i) =>
                  element(
                    "div",
                    {
                      class: [
                        "field characteristic-cell ",
                        characteristicClass(k),
                      ].join(""),
                    },
                    element(
                      "label",
                      {
                        for: ["point-", i].join(""),
                        title: characteristicNames[k],
                      },
                      k,
                    ),
                    element(
                      "div",
                      { class: "characteristic-meta" },
                      characteristicBadge(k),
                    ),
                    "\n",
                    element("input", {
                      type: "number",
                      id: ["point-", i].join(""),
                      "data-bind": "points",
                      "data-key": i,
                      min: "4",
                      max: "16",
                      step: "1",
                      placeholder: "4–16",
                      value: s.points[i] ?? "",
                    }),
                    element(
                      "small",
                      { class: "muted" },
                      "+ ",
                      sp.offsets[k],
                      " Species",
                    ),
                  ),
                ),
                "",
              ),
            ),
          )
        : fragment(
            element(
              "table",
              { class: "characteristics-table" },
              element(
                "thead",
                {},
                element(
                  "tr",
                  {},
                  element("th", {}, "Characteristic"),
                  element("th", {}, "2d10"),
                  element("th", {}, "Species"),
                  element("th", {}, "Initial"),
                ),
              ),
              element(
                "tbody",
                {},
                joinNodes(
                  M.KEYS.map((k, i) =>
                    element(
                      "tr",
                      { class: characteristicClass(k) },
                      element(
                        "td",
                        {},
                        element(
                          "div",
                          { class: "characteristic-identity" },
                          element(
                            "span",
                            { class: "characteristic-label" },
                            element("strong", {}, k),
                            characteristicBadge(k),
                          ),
                          element(
                            "small",
                            { class: "characteristic-name" },
                            characteristicNames[k],
                          ),
                        ),
                      ),
                      element(
                        "td",
                        {},
                        s.charMode === "first"
                          ? s.charRolls[i]
                          : select(
                              interpolate(
                                [
                                  'data-bind="assignment" data-key="',
                                  '" aria-label="Roll for ',
                                  '"',
                                ],
                                [i, k],
                              ),
                              s.charRolls.map((v, j) => [
                                j,
                                interpolate(["", ": ", ""], [combine(j, 1), v]),
                              ]),
                              s.assignment[i],
                            ),
                      ),
                      element("td", {}, "+", sp.offsets[k]),
                      element("td", {}, M.initial(R, s)[k]),
                    ),
                  ),
                  "",
                ),
              ),
            ),
          ),
      characteristicLegend(),
      budget
        ? element(
            "section",
            {
              class: "career-starting-increases",
              "aria-label": "Career starting increases",
            },
            element(
              "div",
              { class: "starting-increases-heading" },
              element(
                "h2",
                { class: "creation-section-heading" },
                "Career starting increases",
              ),
              element(
                "span",
                { class: "counter" },
                Object.values(s.boost).reduce((a, b) => combine(a, b), 0),
                " / ",
                budget,
              ),
            ),
            "\n",
            element(
              "div",
              { class: "starting-increases-controls" },
              joinNodes(
                M.KEYS.filter((k) => c.advanceScheme[k] === 1).map((k) =>
                  element(
                    "label",
                    { class: "starting-increase" },
                    element("span", {}, k),
                    element("input", {
                      type: "number",
                      "data-bind": "boost",
                      "data-key": k,
                      "aria-label": [
                        characteristicNames[k],
                        " starting increase",
                      ].join(""),
                      min: "0",
                      max: budget,
                      value: s.boost[k] || 0,
                    }),
                  ),
                ),
                "",
              ),
            ),
          )
        : "",
      element(
        "p",
        { class: "small muted" },
        "Starting increases and Talent bonuses are not purchased Advances. Each later Characteristic Advance adds +5; costs begin at 125 XP. ",
        page(191),
      ),
      astrologyPanel(R, s, { select, button, options: M.options }),
    );
  }

  function skills() {
    let { R, s, page, ref, skillChoice, esc, button } = getContext();

    const slots = M.careerSkillSlots(R, s),
      total = Object.values(s.careerSkills).reduce((a, b) => combine(a, b), 0);
    return fragment(
      element("span", { class: "eyebrow" }, "04 / Skills"),
      chapterHeading("Starting Skills"),
      "\n",
      element(
        "p",
        { class: "muted" },
        "Every Advance is +5. Ordinary creation Skills may receive at most three Advances in total. ",
        page("38–39"),
      ),
      "\n",
      element(
        "div",
        { class: "allocation-budgets", "aria-label": "Starting Skill budgets" },
        element(
          "span",
          {},
          element("strong", {}, s.speciesSkills.length, "/5"),
          " Species Skills · +5 each",
        ),
        element(
          "span",
          {},
          element("strong", {}, total, "/8"),
          " Career Advances · +5 each",
        ),
        element(
          "small",
          {},
          "Native languages and Elder points are separate grants.",
        ),
      ),
      elfSkillsPanel(R, s),
      element(
        "section",
        {
          class: "species-skill-section",
          "data-ui-issue-group": "skills.species",
        },
        element(
          "h2",
          { class: "creation-section-heading" },
          "Species Skills ",
          element(
            "span",
            { class: "counter" },
            s.speciesSkills.length,
            " / 5 chosen",
          ),
        ),
        "\n",
        element(
          "p",
          { class: "small muted" },
          "Choose five Skills · +5 each. ",
          ref(creationSpecies(R, s)),
        ),
        "\n",
        element(
          "div",
          { class: "species-skills-grid" },
          joinNodes(
            M.speciesSkillSlots(R, s).map((slot) =>
              element(
                "div",
                { class: "species-skill-option" },
                element(
                  "div",
                  { class: "species-skill-info" },
                  skillChoice(slot),
                  M.careerSkillSlots(R, s, 1).some((x) => x.name === slot.name)
                    ? element(
                        "small",
                        {
                          class: "species-career-marker",
                          title: "Also offered by your Career",
                        },
                        "Career",
                      )
                    : "",
                ),
                "\n",
                element(
                  "label",
                  { class: "species-skill-check" },
                  element("input", {
                    type: "checkbox",
                    "data-bind": "speciesSkills",
                    value: slot.key,
                    "aria-label": ["Choose Species ", esc(slot.name)].join(""),
                    ...attributes(
                      s.speciesSkills.includes(slot.key) ? "checked" : "",
                    ),
                  }),
                  element("span", {}, "+5"),
                ),
              ),
            ),
            "",
          ),
        ),
        "\n",
      ),
      "\n",
      element(
        "div",
        { class: "notice" },
        "Fluent in ",
        joinNodes(creationSpecies(R, s).languages, " and "),
        ": +30 in each native Language Skill. This explicit Species benefit is separate from the usual +15 limit.",
      ),
      "\n",
      element(
        "section",
        {
          class: "career-skill-section",
          "data-ui-issue-group": "skills.career",
        },
        element(
          "h2",
          { class: "creation-section-heading" },
          "Career Skills ",
          legacyTag(R, M.career(R, s)),
          " ",
          element("span", { class: "counter" }, total, " / 8 Advances"),
        ),
        psychicSkillPanel(R, s),
        joinNodes(
          slots
            .filter((x) => x.level === 1)
            .map((slot) =>
              element(
                "div",
                { class: "skill-row" },
                element(
                  "div",
                  {},
                  skillChoice(slot),
                  element(
                    "div",
                    { class: "minilabel" },
                    M.skillInfo(R, slot.name, s)?.char,
                    " · Species +",
                    M.speciesSkillSlots(R, s).filter(
                      (x) =>
                        x.name === slot.name && s.speciesSkills.includes(x.key),
                    ).length * 5,
                    " · Career +",
                    (s.careerSkills[slot.key] || 0) * 5,
                    " · total starting +",
                    (M.freeSkills(R, s)[slot.name] || 0) * 5,
                  ),
                  "\n",
                ),
                "\n",
                element(
                  "div",
                  { class: "stepper" },
                  button(
                    "skill-minus",
                    "−",
                    interpolate(
                      ['data-key="', '" aria-label="Decrease ', '"'],
                      [slot.key, esc(slot.name)],
                    ),
                  ),
                  element("strong", {}, s.careerSkills[slot.key] || 0),
                  button(
                    "skill-plus",
                    "+",
                    interpolate(
                      ['data-key="', '" aria-label="Increase ', '"'],
                      [slot.key, esc(slot.name)],
                    ),
                  ),
                ),
                "\n",
              ),
            ),
          "",
        ),
      ),
      element(
        "details",
        {
          "data-detail-key": detailKey("creation-views:skills:0"),
          class: "section-gap",
        },
        element("summary", {}, "Specialisations for later Career levels"),
        element(
          "p",
          {},
          "Choose these now if you plan to advance your Career with XP.",
        ),
        joinNodes(
          slots
            .filter((x) => x.level > 1)
            .map((slot) =>
              element(
                "div",
                { class: "skill-row" },
                element("span", { class: "minilabel" }, "Level ", slot.level),
                skillChoice(slot),
              ),
            ),
          "",
        ),
      ),
    );
  }

  function magicSection() {
    let { R, s, result, esc, button, spellDescription } = getContext();

    let idx = 0;
    return combine(
      combine(
        joinNodes(
          speciesMagicReferences(R, s, result().derived.talents).map((x) =>
            element(
              "details",
              {
                "data-detail-key": detailKey(
                  "creation-views:magicSection:0",
                  x,
                ),
                class: "section-gap",
              },
              element(
                "summary",
                {},
                "Ogre magic reference · ",
                esc(sourceLabel(R, x)),
              ),
              element("p", {}, esc(x.text)),
              "\n",
            ),
          ),
          "",
        ),
        divinePanel(R, s),
      ),
      joinNodes(
        M.spellGrants(R, s).map((g) =>
          fragment(
            element(
              "h3",
              {},
              esc(g.talent),
              " ",
              legacyTag(R, legacyOption(R, s, "talent", g.talent)),
              " — ",
              g.count,
              " free ",
              g.category === "Old Faith"
                ? "Blessing"
                : R.config.gods.includes(g.category)
                  ? "Miracle"
                  : "Spell",
              g.count === 1 ? "" : "s",
            ),
            pettyGrantNote(R, s, g),
            joinNodes(
              Array.from({ length: g.count }, () => {
                const i = idx++,
                  chosen = g.choices.find((x) => x.name === s.spells[i]);
                return fragment(
                  element(
                    "div",
                    { class: "free-magic-choice" },
                    element(
                      "span",
                      {},
                      "Free choice ",
                      combine(i, 1),
                      ": ",
                      element("strong", {}, esc(chosen?.name || "Not chosen")),
                    ),
                    button(
                      "free-magic-picker",
                      chosen ? "Change" : "Choose",
                      interpolate(['data-index="', '"'], [i]),
                    ),
                  ),
                  chosen
                    ? spellDescription({
                        ...chosen,
                        lore: g.category,
                        talent: g.talent,
                      })
                    : "",
                );
              }),
              "",
            ),
          ),
        ),
        "",
      ),
    );
  }

  function talents() {
    let {
      R,
      s,
      result,
      lucciniTalentChoice,
      ref,
      button,
      select,
      talentDescription,
      page,
      esc,
    } = getContext();

    const sp = creationSpecies(R, s),
      d = result().derived,
      replacement = startingTalentReplacement(R, s);
    return fragment(
      element("span", { class: "eyebrow" }, "05 / Talents"),
      chapterHeading("Starting Talents"),
      "\n",
      element(
        "p",
        { class: "muted" },
        "Choose your special abilities and any starting spells or Miracles.",
      ),
      "\n",
      element("h2", { class: "creation-section-heading" }, "Species Talents"),
      originTalentChoice(R, s),
      lucciniTalentChoice(),
      joinNodes(
        sp.talents.map((_, i) => {
          const opts = M.speciesTalentOptions(R, s, i);
          return replacement?.slot === interpolate(["species-", ""], [i])
            ? element(
                "span",
                { class: "chip" },
                esc(replacement.talent),
                " · regional replacement ",
                legacyTag(R, sp),
              )
            : opts.length === 1
              ? element(
                  "span",
                  { class: "chip" },
                  esc(opts[0]),
                  legacyTag(R, legacyOption(R, s, "talent", opts[0])),
                )
              : element(
                  "div",
                  { class: "field" },
                  element(
                    "label",
                    { for: ["talent-", i].join("") },
                    "Species choice",
                  ),
                  select(
                    interpolate(
                      [
                        'id="talent-',
                        '" data-bind="talentChoices" data-key="species-',
                        '"',
                      ],
                      [i, i],
                    ),
                    opts,
                    s.talentChoices[interpolate(["species-", ""], [i])] ||
                      opts[0],
                  ),
                );
        }),
        "",
      ),
      sp.randomTalents
        ? fragment(
            tablePicker(R, s, "talent"),
            element(
              "p",
              { class: "small" },
              sp.randomTalents,
              " random Talents from ",
              ref(randomTable(R, s, "talent")),
              ". Duplicates are rerolled and retained in your roll record.",
            ),
            s.randomTalents.length
              ? joinNodes(
                  s.randomTalents.map((t, i) =>
                    psychometrySacrifice(R, s) && s.psychometrySlot === i
                      ? element(
                          "span",
                          { class: "chip muted" },
                          esc(t),
                          " · given up for Psychometry",
                        )
                      : replacement?.slot === interpolate(["random-", ""], [i])
                        ? element(
                            "span",
                            { class: "chip" },
                            esc(replacement.talent),
                            " · regional replacement ",
                            legacyTag(R, sp),
                          )
                        : t === "Artistic"
                          ? element(
                              "div",
                              { class: "field" },
                              element("label", {}, "Artistic specialisation"),
                              select(
                                interpolate(
                                  [
                                    'data-bind="talentChoices" data-key="random-',
                                    '" aria-label="Artistic specialisation"',
                                  ],
                                  [i],
                                ),
                                M.options(R, "Artistic", "talent"),
                                s.talentChoices[
                                  interpolate(["random-", ""], [i])
                                ] || "Artistic (Drawing)",
                              ),
                            )
                          : element("span", { class: "chip" }, esc(t)),
                  ),
                  "",
                )
              : button(
                  "random-talents",
                  interpolate(["Roll ", " random Talents"], [sp.randomTalents]),
                  "",
                  "primary",
                ),
          )
        : "",
      psychometryPanel(R, s),
      joinNodes(
        (originProfile(R, s)?.grantedTalents || []).map((t) =>
          fragment(
            element("span", { class: "chip" }, esc(t), " · kindred grant"),
            talentDescription(t),
          ),
        ),
        "",
      ),
      element(
        "div",
        { class: "field section-gap" },
        element("label", { for: "freeTalent" }, "One free Career Talent"),
        select(
          'id="freeTalent" data-bind="freeTalent"',
          M.careerTalentOptions(R, s).map((n) => [
            n,
            n,
            M.talentInfo(R, n)?.unavailable,
          ]),
          s.freeTalent,
          true,
        ),
      ),
      M.careerTalentOptions(R, s).some((n) => M.base(n) === "Impassioned Zeal")
        ? causeControl(s, esc, button)
        : "",
      s.freeTalent ? talentDescription(s.freeTalent) : "",
      d.talents.includes("Doomed")
        ? element(
            "details",
            {
              "data-detail-key": detailKey("creation-views:talents:0"),
              class: "section-gap",
              open: "",
            },
            element("summary", {}, "Your Dooming"),
            element("p", { class: "small" }, page(118)),
            element(
              "p",
              { class: "small muted" },
              "Choose or roll a suggestion from the book, then agree its meaning with your GM.",
            ),
            "\n",
            element(
              "div",
              { class: "field" },
              element("label", { for: "dooming" }, "Dooming"),
              select(
                'id="dooming" data-bind="dooming"',
                R.background.doomings.map((x) => [
                  x.text,
                  interpolate(["", "–", ": ", ""], [x.min, x.max, x.text]),
                ]),
                s.dooming,
                true,
              ),
            ),
            button("roll-dooming", "Roll Dooming · d100"),
          )
        : "",
      starSign(R, s)
        ? fragment(
            element(
              "h3",
              {},
              "Star-sign benefit · Archives II p. 39 ",
              legacyTag(R, starSign(R, s)),
            ),
            "\n",
            element(
              "p",
              {},
              esc(starSign(R, s).name),
              starEffect(R, s).talent
                ? interpolate([" · ", ""], [esc(starEffect(R, s).talent)])
                : "",
              ". Core Talent limits apply.",
            ),
          )
        : "",
      womReferencePanel(R, s),
      grudgePanel(R, s),
      runePanel(R, s),
      magicSection(),
      result().spells.some(
        (x) => x.category === "Blessing" && x.lore !== "Old Faith",
      )
        ? element(
            "div",
            { class: "notice" },
            "Your patron grants six Blessings automatically (p. 220). All six appear in the export; overflow goes into the creation record.",
          )
        : "",
      element(
        "details",
        {
          "data-detail-key": detailKey("creation-views:talents:1"),
          class: "section-gap",
        },
        element("summary", {}, "Read all your Talent rules"),
        joinNodes([...new Set(d.talents)].map(talentDescription), ""),
      ),
    );
  }

  function gear() {
    let { result, R, s, select, button, page, esc } = getContext();

    const d = result().derived,
      eq = result().equipment;
    return fragment(
      element("span", { class: "eyebrow" }, "06 / Gear & money"),
      chapterHeading("Gear & money"),
      "\n",
      element(
        "p",
        { class: "muted" },
        "Resolve your starting belongings, roll your purse, and buy extra equipment.",
      ),
      element(
        "div",
        {
          class: "actions contextual-continue",
          "aria-label": "Next creation step",
        },
        button("step", "Continue to Experience", 'data-step="6"', "primary"),
      ),
      kitSummary(R, s, {
        select,
        button,
        tag: (slot) => legacyTag(R, legacyGear(R, s, slot)),
      }),
      joinNodes(
        eq.notes
          .filter((n) => !n.startsWith("Creator defaults:"))
          .map((n) => element("div", { class: "notice" }, esc(n))),
        "",
      ),
      element(
        "h2",
        { class: "creation-section-heading" },
        "Starting wealth ",
        page(39),
      ),
      s.wealth
        ? element(
            "p",
            {},
            element("strong", {}, s.wealth.amount, " ", s.wealth.currency),
          )
        : button("wealth", "Roll starting wealth", "", "primary"),
      element(
        "p",
        { class: "small muted" },
        "Based on ",
        M.career(R, s).levels[0].status,
        " ",
        M.career(R, s).levels[0].standing,
        ". A promotion does not grant another purse.",
      ),
      d.talents.includes("Sturdy") || s.species === "Dwarf"
        ? element(
            "div",
            { class: "field" },
            element(
              "label",
              { for: "sturdyRule" },
              "Book discrepancy: carrying capacity",
            ),
            select(
              'id="sturdyRule" data-bind="sturdyRule"',
              [
                ["creation", "Creation rule, p. 40: 2 × (SB + TB)"],
                ["talent", "Sturdy, p. 127: 2 × SB + TB"],
              ],
              s.sturdyRule,
            ),
            element(
              "small",
              { class: "muted" },
              "Both formulas appear in the book. Your selection is recorded.",
            ),
          )
        : "",
      result().derived.talents.some((x) => /Magic|Witch!/.test(x))
        ? womGearPanel(R)
        : "",
    );
  }
  return {
    optionalCareerChoices,
    careerView,
    characteristics,
    skills,
    magicSection,
    talents,
    gear,
  };
}
