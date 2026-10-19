import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
import { sourceButton, legacySummary } from "./source-controls.mjs";
import { detailKey } from "../../../engine/disclosures.mjs";
import { legacyTag, legacyMechanic } from "./legacy.mjs";
import * as E from "../../../engine/high-elf.mjs";
import * as M from "../../../engine/rules.mjs";
import { careerAvailable, originProfile } from "../../../engine/origins.mjs";
import { sourceLabel } from "../../../engine/sources.mjs";
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const pick = (label, bind, choices, value = "", attrs = "") =>
  element(
    "div",
    { class: "field" },
    element(
      "label",
      {},
      esc(label),
      element(
        "select",
        { "data-bind": bind, ...attributes(attrs) },
        element("option", { value: "" }, "Choose…"),
        joinNodes(
          choices.map((x) => {
            const [v, t] = Array.isArray(x) ? x : [x, x];
            return element(
              "option",
              { value: esc(v), ...attributes(value === v ? "selected" : "") },
              esc(t),
            );
          }),
          "",
        ),
      ),
    ),
  );
const button = (action, text, attrs = "") =>
  element(
    "button",
    {
      type: "button",
      class: "quiet",
      "data-action": action,
      ...attributes(attrs),
    },
    esc(text),
  );
export function elfOriginPanel(R, s) {
  if (!E.asur(R, s)) return "";
  const e = E.elfState(s),
    v = R.highElfCreation,
    era = E.birthEra(R, s),
    psy = E.bloodPsychology(R, s),
    sea = originProfile(R, s)?.name === "Sea Elf";
  return element(
    "section",
    { class: "section-gap" },
    element(
      "h2",
      {},
      "High Elf background ",
      sourceButton(R, { source: { book: "high-elf", page: "47–58" } }),
    ),
    sea
      ? element(
          "div",
          { class: "notice" },
          element("strong", {}, "Sea Elf enclave & heritage"),
          element(
            "p",
            { class: "small muted" },
            "These are background choices; heritage grants no second regional profile.",
          ),
          "\n",
          element(
            "div",
            { class: "field" },
            element("label", { for: "elf-enclave" }, "Home enclave"),
            element("input", {
              id: "elf-enclave",
              "data-bind": "elfText",
              "data-key": "enclave",
              value: esc(e.enclave),
              list: "elf-enclaves",
              maxlength: "100",
            }),
            element(
              "datalist",
              { id: "elf-enclaves" },
              joinNodes(
                v.enclaves.map((x) => element("option", { value: esc(x) })),
                "",
              ),
            ),
          ),
          pick(
            "Ulthuan heritage",
            "elfChoice",
            v.kingdoms,
            e.heritage,
            'data-key="heritage"',
          ),
        )
      : "",
    element(
      "details",
      {
        "data-detail-key": detailKey("high-elf-ui:elfOriginPanel:0"),
        "data-group": "elf-elder",
        ...attributes(era ? "open" : ""),
      },
      legacySummary(
        "Age & optional Elder creation · p. 53",
        legacyTag(R, legacyMechanic("elder")),
      ),
      element(
        "p",
        { class: "small muted" },
        "Choose a printed era, or leave this blank for normal core age creation. Earlier eras add 10 chosen or 15 rolled individual Skill points per past Career, at most five per Skill per era. They grant no free Talents, equipment or tracker boxes. The oldest era’s weekly Yenlui Test applies; other burdens accumulate.",
      ),
      pick(
        "Birth era",
        "elfEra",
        v.eras.map((x) => [
          x.id,
          interpolate(
            ["", " · ", "–", " years"],
            [x.name, x.min, x.max ?? "∞"],
          ),
        ]),
        e.era,
      ),
      era
        ? fragment(
            element(
              "div",
              { class: "field" },
              element("label", { for: "elf-age" }, "Age in years"),
              element("input", {
                id: "elf-age",
                type: "number",
                min: era.min,
                ...attributes(
                  era.max === null
                    ? ""
                    : interpolate(['max="', '"'], [era.max]),
                ),
                "data-bind": "elfAge",
                value: e.elderAge ?? "",
              }),
            ),
            button(
              "elf-age",
              interpolate(["Roll ", " + ", "d10"], [era.offset, era.dice[0]]),
            ),
            element(
              "p",
              { class: "small muted" },
              "Printed dice can extend outside the printed age band; exact rolled results are retained with an explanation.",
            ),
            era.id !== "ending"
              ? fragment(
                  element(
                    "p",
                    { class: "purchase-error small" },
                    "Proposed Fifth Edition adaptation approved by you: reduce starting Fate or Fortune by one. Time of Shadows sets both to zero; Blood of Aenarion takes priority.",
                  ),
                  pick(
                    "Reduce starting resource",
                    "elfChoice",
                    ["Fate", "Fortune"],
                    e.elderResource,
                    'data-key="elderResource"',
                  ),
                  element("p", { class: "small" }, esc(era.burden)),
                  joinNodes(
                    E.elderEras(R, s).map((x) => {
                      const h = e.history.find((h) => h.era === x.id),
                        c = R.careers.find((c) => c.id === h.career);
                      return element(
                        "div",
                        { class: "notice" },
                        element("strong", {}, esc(x.name), " — past Career"),
                        pick(
                          "Past Career",
                          "elfPastCareer",
                          R.careers
                            .filter((c) => careerAvailable(R, s, c))
                            .map((c) => [c.id, c.name]),
                          h.career,
                          interpolate(['data-era="', '"'], [x.id]),
                        ),
                        button(
                          "elf-past-roll",
                          "Roll Career · 15 points",
                          interpolate(
                            ['data-era="', '" ', ""],
                            [x.id, h.roll ? "disabled" : ""],
                          ),
                        ),
                        h.roll
                          ? button(
                              "elf-past-retain",
                              "Retain recorded Career · 15 points",
                              interpolate(['data-era="', '"'], [x.id]),
                            )
                          : "",
                        element(
                          "p",
                          { class: "small muted" },
                          h.mode === "rolled"
                            ? "Rolled Career: 15 individual points."
                            : "Chosen Career: 10 individual points.",
                          " Allocate them in Starting Skills.",
                          h.roll
                            ? interpolate(
                                [" Recorded d100 ", ": ", "."],
                                [
                                  h.roll.face,
                                  esc(
                                    R.careers.find(
                                      (c) => c.id === h.roll.career,
                                    )?.name,
                                  ),
                                ],
                              )
                            : "",
                        ),
                        "\n",
                      );
                    }),
                    "",
                  ),
                )
              : "",
          )
        : "",
    ),
    "\n",
    element(
      "details",
      {
        "data-detail-key": detailKey("high-elf-ui:elfOriginPanel:1"),
        "data-group": "elf-blood",
        ...attributes(E.blood(R, s) ? "open" : ""),
      },
      legacySummary(
        "Blood of Aenarion · p. 51",
        legacyTag(R, legacyMechanic("blood")),
      ),
      element(
        "p",
        { class: "small muted" },
        "Optional ancestry. Rolling gives 5% for the Noble Career or Noble Blood Talent; 1% otherwise. You may choose it with your GM. It grants +1 Fate, one Prodigy benefit, and a rolled Psychology using core effects.",
      ),
      pick(
        "Ancestry",
        "elfChoice",
        [
          ["none", "No Blood of Aenarion"],
          ["chosen", "Choose ancestry with GM"],
          ...(e.bloodRoll
            ? [
                [
                  "rolled",
                  interpolate(
                    ["Use recorded roll ", " · ", ""],
                    [
                      e.bloodRoll.face,
                      e.bloodRoll.success ? "Blood of Aenarion" : "no ancestry",
                    ],
                  ),
                ],
              ]
            : []),
        ],
        e.ancestry,
        'data-key="ancestry"',
      ),
      button(
        "elf-blood",
        "Roll ancestry · d100",
        e.bloodRoll ? "disabled" : "",
      ),
      E.blood(R, s)
        ? fragment(
            pick(
              "Prodigy benefit",
              "elfChoice",
              [
                ["magic", "Magical Prodigy · half spell XP"],
                ["martial", "Martial Prodigy · half seven named Talent prices"],
              ],
              e.prodigy,
              'data-key="prodigy"',
            ),
            element(
              "p",
              { class: "small muted" },
              "Discounts apply only to legal purchases. Ritual memorisation is included in the spell discount by your approved interpretation; Sword-dancing techniques are separate.",
            ),
            button(
              "elf-psychology",
              "Roll Psychology · d100",
              e.psychology ? "disabled" : "",
            ),
            psy
              ? fragment(
                  element(
                    "p",
                    {},
                    element("strong", {}, esc(psy.name)),
                    " · ",
                    esc(psy.text),
                  ),
                  "\n",
                  element(
                    "p",
                    { class: "small muted" },
                    "Core p. 189 effects; this is Psychology, not a Mutation.",
                  ),
                )
              : "",
          )
        : "",
    ),
    "\n",
    element(
      "details",
      {
        "data-detail-key": detailKey("high-elf-ui:elfOriginPanel:2"),
        "data-group": "elf-spirituality",
      },
      element("summary", {}, "Spirituality, Dream & Obsession · pp. 47–50"),
      pick(
        "Starting Yenlui state",
        "elfChoice",
        ["Balanced", "Light", "Dark"],
        e.yenlui,
        'data-key="yenlui"',
      ),
      element(
        "p",
        { class: "small muted" },
        esc(
          E.yenluiReference({
            ...s,
            highElf: { ...e, yenlui: e.yenlui || "Balanced" },
          }),
        ),
      ),
      joinNodes(
        ["dream", "obsession"].map((k) =>
          fragment(
            element(
              "div",
              { class: "field" },
              element(
                "label",
                {},
                k === "dream" ? "Dream" : "Obsession",
                element(
                  "textarea",
                  { "data-bind": "elfText", "data-key": k, maxlength: "1000" },
                  esc(e[k]),
                ),
              ),
            ),
            pick(
              combine(
                combine("Book ", k === "dream" ? "Dream" : "Obsession"),
                " suggestion",
              ),
              "elfSuggestion",
              v[k === "dream" ? "dreams" : "obsessions"].rows.map((x) => [
                String(x.face),
                combine(combine(x.face, ". "), x.text),
              ]),
              "",
              interpolate(['data-key="', '"'], [k]),
            ),
            button(
              "elf-suggestion",
              combine(combine("Roll ", k), " · d10"),
              interpolate(['data-key="', '"'], [k]),
            ),
          ),
        ),
        "",
      ),
    ),
    "\n",
  );
}
export function elfCareerPanel(R, s) {
  if (!E.asur(R, s) || originProfile(R, s)?.source.book !== "high-elf")
    return "";
  if (s.career === "sailor")
    return pick(
      "Optional Elven ship Sailor variant · p. 63",
      "elfChoice",
      [
        ["standard", "Core Sailor"],
        [
          "elven-ship",
          "Elven ship · Legacy · Intuition at L2, remove Alcohol, Brawling → Basic",
        ],
      ],
      E.elfState(s).careerVariant || "standard",
      'data-key="careerVariant"',
    );
  if (s.career === "pit-fighter" && originProfile(R, s)?.name !== "Sea Elf")
    return pick(
      "Optional Ulthuan Pit Fighter variant · p. 60",
      "elfChoice",
      [
        ["standard", "Core Dirty Fighting"],
        ["feint", "Replace Dirty Fighting with Feint"],
      ],
      E.elfState(s).careerVariant || "standard",
      'data-key="careerVariant"',
    );
  return "";
}
export function elfSkillsPanel(R, s) {
  const eras = E.elderEras(R, s);
  if (!eras.length) return "";
  return fragment(
    element(
      "h2",
      {},
      "Elder Skill points ",
      legacyTag(R, legacyMechanic("elder")),
      " ",
      sourceButton(R, { source: { book: "high-elf", page: 53 } }),
    ),
    "\n",
    element(
      "p",
      { class: "small muted" },
      "Individual points are additional to normal creation. Spend the full budget for each past Career; no more than five in the same Skill per era.",
    ),
    joinNodes(
      eras.map((era) => {
        const h = E.elfState(s).history.find((h) => h.era === era.id),
          budget = h.mode === "rolled" ? 15 : 10,
          slots = E.elderSkillSlots(R, s, h);
        return element(
          "details",
          {
            "data-detail-key": detailKey("high-elf-ui:elfSkillsPanel:0", era),
            "data-group": ["elf-skills-", era.id].join(""),
            open: "",
          },
          element(
            "summary",
            {},
            esc(era.name),
            " · ",
            esc(
              R.careers.find((c) => c.id === h.career)?.name ||
                "Choose past Career in Origins",
            ),
            " ",
            element(
              "span",
              { class: "counter" },
              Object.values(h.points || {}).reduce((a, b) => combine(a, b), 0),
              "/",
              budget,
            ),
          ),
          joinNodes(
            slots.map((x) =>
              element(
                "div",
                { class: "skill-row" },
                element(
                  "div",
                  {},
                  x.options.length > 1
                    ? pick(
                        x.raw,
                        "elfPastSkill",
                        x.options,
                        x.name,
                        interpolate(
                          ['data-era="', '" data-key="', '"'],
                          [era.id, x.key],
                        ),
                      )
                    : element("strong", {}, esc(x.name)),
                ),
                "\n",
                element(
                  "label",
                  { class: "small" },
                  "Individual points ",
                  element("input", {
                    type: "number",
                    min: "0",
                    max: "5",
                    step: "1",
                    "data-bind": "elfPastPoints",
                    "data-era": era.id,
                    "data-key": x.key,
                    value: h.points?.[x.key] || 0,
                    "aria-label": [
                      esc(combine(combine(era.name, " "), x.name)),
                      " points",
                    ].join(""),
                  }),
                ),
              ),
            ),
            "",
          ),
        );
      }),
      "",
    ),
  );
}
const description = (R, x) =>
  element(
    "details",
    { "data-detail-key": detailKey("high-elf:profile", x) },
    element("summary", {}, esc(x.name), " · ", esc(sourceLabel(R, x))),
    element("p", { class: "small" }, esc(x.text)),
    x.conversion
      ? element("p", { class: "small muted" }, esc(x.conversion))
      : "",
  );
export function elfMagicShop(R, s, errors = []) {
  if (!E.highElfGuide(R)) return "";
  const d = M.derive(R, s),
    known = M.knownSpells(R, s),
    tech = E.knownTechniques(R, s);
  const row = (x, q, action) => {
    const error =
      q.error || (errors.length ? "Finish creation before spending XP." : "");
    return element(
      "div",
      { class: "xp-row" },
      description(R, x),
      element(
        "div",
        {},
        button(
          action,
          interpolate(["", " XP"], [q.cost]),
          interpolate(
            ['data-name="', '" data-talent="', '" ', ""],
            [esc(x.name), esc(q.talent || ""), error ? "disabled" : ""],
          ),
        ),
        error
          ? element("p", { class: "purchase-error minilabel" }, esc(error))
          : "",
        q.discount
          ? element("p", { class: "small muted" }, esc(q.discount))
          : "",
      ),
      "\n",
    );
  };
  return interpolate(
    ["", "", ""],
    [
      d.talents.includes("Sword-dancing")
        ? fragment(
            element("h3", {}, "Sword-dancing techniques · pp. 68–69"),
            "\n",
            element(
              "p",
              { class: "small muted" },
              "Ritual of Cleansing is free. Other techniques cost 100 XP per technique already known and earn no tracker boxes.",
            ),
            joinNodes(
              tech.map((x) => description(R, x)),
              "",
            ),
            joinNodes(
              R.techniques
                .filter((x) => !tech.some((k) => k.name === x.name))
                .map((x) =>
                  row(x, E.quoteTechnique(R, s, x.name), "buy-technique"),
                ),
              "",
            ),
          )
        : "",
      E.asur(R, s) || d.talents.some((x) => M.base(x) === "Arcane Magic")
        ? joinNodes(
            ["Elven Arcane", "High Magic"].map((category) =>
              element(
                "details",
                {
                  "data-detail-key": detailKey(
                    "high-elf-ui:elfMagicShop:0",
                    category,
                  ),
                  class: "section-gap",
                  "data-group": ["elf-magic-", category].join(""),
                },
                legacySummary(
                  fragment(
                    esc(category),
                    " · ",
                    R.spells.filter((x) => x.category === category).length,
                    " spells",
                  ),
                  legacyTag(
                    R,
                    category === "High Magic"
                      ? M.talentInfo(R, "High Magic")
                      : legacyMechanic("elvenArcane"),
                  ),
                ),
                element(
                  "p",
                  { class: "small muted" },
                  category === "High Magic"
                    ? "Requires High Magic; no free spell grant. Prices use Intelligence Bonus bands. Fifth Career level and priest branches are deferred."
                    : "Requires both printed Colour Lores; each spell is learned once and belongs to the latest acquired Lore.",
                ),
                joinNodes(
                  R.spells
                    .filter(
                      (x) =>
                        x.category === category &&
                        !known.some((k) => k.name === x.name),
                    )
                    .map((x) =>
                      row(x, E.quoteElfSpell(R, s, x.name), "buy-spell"),
                    ),
                  "",
                ),
              ),
            ),
            "",
          )
        : "",
    ],
  );
}
export function elfReview(R, s) {
  return combine(
    joinNodes(
      E.highElfReferences(R, s).map((x) =>
        element(
          "p",
          { class: "small muted" },
          esc(sourceLabel(R, x)),
          ": ",
          esc(x.text),
        ),
      ),
      "",
    ),
    joinNodes(
      E.knownTechniques(R, s).map((x) => description(R, x)),
      "",
    ),
  );
}
export function elfAction(R, s, el, roll) {
  const a = el.dataset.action;
  if (!a.startsWith("elf-")) return false;
  if (s.ledger.length)
    throw Error("Undo or clear advancement before changing High Elf creation.");
  const e = (s.highElf ??= {});
  if (a === "elf-suggestion") {
    const key = el.dataset.key,
      t = R.highElfCreation[key === "dream" ? "dreams" : "obsessions"];
    const face = roll(
      10,
      t.page,
      combine(key, " suggestion"),
      { book: "high-elf", page: t.page },
      1,
    );
    e[key] = t.rows.find((x) => x.face === face).text;
  } else if (a === "elf-age") {
    const era = E.birthEra(R, s);
    if (!era) throw Error("Choose an era first.");
    e.elderAge = combine(
      era.offset,
      roll(10, 53, "Elder age", { book: "high-elf", page: 53 }, era.dice[0]),
    );
    e.ageRolled = true;
  } else if (a === "elf-blood") E.rollBlood(R, s, roll);
  else if (a === "elf-psychology") {
    if (!E.blood(R, s) || e.psychology)
      throw Error("Psychology already recorded or ancestry not selected.");
    e.psychology = roll(
      100,
      51,
      "Aenarion Psychology",
      { book: "high-elf", page: 51 },
      1,
    );
  } else if (a === "elf-past-roll")
    E.rollElderCareer(R, s, el.dataset.era, roll);
  else if (a === "elf-past-retain") {
    const h = e.history.find((x) => x.era === el.dataset.era);
    if (!h?.roll) throw Error("No past Career roll.");
    Object.assign(h, {
      career: h.roll.career,
      mode: "rolled",
      points: {},
      choices: {},
    });
  } else throw Error("Unknown High Elf action.");
  return true;
}
export function elfChange(R, s, el) {
  const { bind, key, era } = el.dataset;
  if (!bind?.startsWith("elf")) return false;
  if (s.ledger.length)
    throw Error("Undo or clear advancement before changing High Elf creation.");
  const e = (s.highElf ??= {});
  if (bind === "elfEra") E.selectElfEra(R, s, el.value);
  else if (bind === "elfAge") {
    e.elderAge = Number(el.value);
    e.ageRolled = false;
  } else if (bind === "elfText") e[key] = el.value;
  else if (bind === "elfChoice") e[key] = el.value;
  else if (bind === "elfSuggestion") {
    const t = R.highElfCreation[key === "dream" ? "dreams" : "obsessions"];
    if (el.value) e[key] = t.rows.find((x) => String(x.face) === el.value).text;
  } else {
    const h = e.history?.find((x) => x.era === era);
    if (!h) throw Error("Choose the past era first.");
    if (bind === "elfPastCareer") {
      Object.assign(h, {
        career: el.value,
        mode: "chosen",
        points: {},
        choices: {},
      });
    } else if (bind === "elfPastSkill") h.choices[key] = el.value;
    else if (bind === "elfPastPoints") {
      const n = Number(el.value);
      if (!Number.isInteger(n) || n < 0 || n > 5)
        throw Error("Use 0–5 individual points.");
      h.points[key] = n;
    } else throw Error("Unknown High Elf field.");
  }
  return true;
}
