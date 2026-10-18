import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
import { sourceButton } from "./source-controls.mjs";
import { detailKey } from "../../../engine/disclosures.mjs";
import { legacyTag, legacyMechanic } from "./legacy.mjs";
const legacyFeature = legacyMechanic("astrology");
import { speciesReferences } from "../../../engine/species-mechanics.mjs";

import {
  chartState,
  starSign,
  starEffect,
  chartXP,
  chartTalentChoices,
} from "../../../engine/astrology.mjs";
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function speciesRulePanel(R, s) {
  const text = R.species[s.species]?.mechanics?.gmApproval;
  return combine(
    text
      ? element("div", { class: "notice" }, element("p", {}, esc(text)), "\n")
      : "",
    joinNodes(
      speciesReferences(R, s).map((x) =>
        element(
          "div",
          { class: "notice" },
          element("p", {}, esc(x.text), " ", sourceButton(R, x)),
          "\n",
        ),
      ),
      "",
    ),
  );
}
export function nameStylePanel(R, s, { select }) {
  if (!R.background[s.species].imperialNames) return "";
  return element(
    "div",
    { class: "field" },
    element("label", { for: "ogre-name-style" }, "Naming tradition"),
    select(
      'id="ogre-name-style" data-bind="nameStyle"',
      [
        ["imperial", "Imperial names · core p. 27"],
        ["traditional", "Traditional Ogre names · Archives II pp. 22–23"],
      ],
      s.nameStyle || "imperial",
    ),
  );
}
export function nameElementPanel(R, s, { select, button }) {
  const tables =
    s.nameStyle === "traditional" ? R.background[s.species].nameElements : null;
  if (!tables) return "";
  return fragment(
    element(
      "p",
      { class: "small muted" },
      "Combine a root and ending into one given name. Your title/clan name is separate. Archives II pp. 22–23.",
    ),
    "\n",
    element(
      "div",
      { class: "cols" },
      joinNodes(
        tables.map((table, i) =>
          element(
            "div",
            { class: "field" },
            element(
              "label",
              { for: ["name-element-", i].join("") },
              i ? "Name ending" : "Name root",
            ),
            select(
              interpolate(
                [
                  'id="name-element-',
                  '" data-bind="nameElement" data-key="',
                  '"',
                ],
                [i, i],
              ),
              table.rows.map((row) => [String(row.min), row.result]),
              String(s.nameElements?.[i] || ""),
              true,
            ),
          ),
        ),
        "",
      ),
    ),
    button("traditional-name", "Roll traditional given name · 2 × d100"),
  );
}
export function astrologyPanel(R, s, { select, button, options }) {
  if (!R.astrology?.length) return "";
  const chart = chartState(s),
    sign = starSign(R, s),
    effect = starEffect(R, s),
    talents = chartTalentChoices(R, s, options);
  const choices = R.astrology.map((x) => [x.id, x.name]);
  return element(
    "section",
    { class: "section-gap" },
    element(
      "h2",
      {},
      "Star sign ",
      legacyTag(R, legacyFeature),
      " ",
      sourceButton(R, { source: { book: "archives-ii", page: 39 } }),
    ),
    "\n",
    element(
      "label",
      { class: "check-row" },
      element("input", {
        type: "checkbox",
        "data-bind": "chartEnabled",
        ...attributes(chart.enabled ? "checked" : ""),
      }),
      "Use the optional star-sign creation rules",
    ),
    !chart.enabled
      ? ""
      : fragment(
          element(
            "p",
            { class: "small muted" },
            "Apply this after generating Characteristics. Keep your initial d100 result for +25 XP, or choose another sign with no reward. Ascendant and mansion signs are background only.",
          ),
          "\n",
          element(
            "div",
            { class: "actions" },
            button(
              "star-roll",
              chart.rolledSign
                ? "Initial roll recorded"
                : "Roll star sign · d100",
              chart.rolledSign ? "disabled" : "",
              "primary",
            ),
          ),
          chart.rolledSign
            ? element(
                "div",
                { class: "field" },
                element("label", { for: "star-sign" }, "Your star sign"),
                select(
                  'id="star-sign" data-bind="starSign"',
                  choices,
                  chart.sign,
                ),
              )
            : "",
          sign
            ? fragment(
                element(
                  "div",
                  { class: "notice" },
                  element("strong", {}, esc(sign.name)),
                  " ",
                  legacyTag(R, sign),
                  element(
                    "p",
                    {},
                    joinNodes(
                      Object.entries(effect.adjustments || {}).map(
                        ([key, value]) =>
                          interpolate(
                            ["", " ", "", ""],
                            [key, value >= 0 ? "+" : "", value],
                          ),
                      ),
                      " · ",
                    ) || "No Characteristic change for this result.",
                    effect.talent
                      ? interpolate([" · Talent: ", ""], [esc(effect.talent)])
                      : "",
                  ),
                  "\n",
                  element(
                    "p",
                    { class: "small" },
                    chartXP(R, s)
                      ? "+25 creation XP · initial sign retained"
                      : "No bonus XP · sign changed",
                    " · These adjustments are not Advances.",
                  ),
                  sign.witchling
                    ? fragment(
                        element(
                          "p",
                          { class: "small" },
                          "Detailed p. 39 table: 1–3 Sixth Sense, no penalty; 4–6 Second Sight, S −3; 7–9 Petty Magic, S −3; 10 Witch!, S −5. This resolves p. 47’s general −3 penalty as agreed.",
                        ),
                        chart.witchling
                          ? element(
                              "strong",
                              {},
                              "Witchling d10: ",
                              chart.witchling,
                            )
                          : button(
                              "witchling-roll",
                              "Roll Witchling effect · d10",
                            ),
                      )
                    : "",
                ),
                talents.length
                  ? element(
                      "div",
                      { class: "field" },
                      element(
                        "label",
                        { for: "star-talent" },
                        "Craftsman specialisation",
                      ),
                      select(
                        'id="star-talent" data-bind="starTalent"',
                        talents,
                        chart.talent,
                        true,
                      ),
                    )
                  : "",
                element(
                  "details",
                  {
                    "data-detail-key": detailKey(
                      "archives-ui:astrologyPanel:0",
                    ),
                  },
                  element(
                    "summary",
                    {},
                    "Your sign’s description · Archives II p. ",
                    sign.profilePage,
                  ),
                  element("p", {}, esc(sign.text)),
                  "\n",
                  element(
                    "p",
                    { class: "small" },
                    "Classical name: ",
                    esc(sign.classical),
                    " · Ascendant: ",
                    esc(sign.ascendant),
                    " · Dates: ",
                    esc(sign.calendar),
                    " · Associated god: ",
                    esc(sign.god),
                    " · Appearance: ",
                    esc(sign.appearance),
                  ),
                  "\n",
                ),
                "\n",
                element(
                  "details",
                  {
                    "data-detail-key": detailKey(
                      "archives-ui:astrologyPanel:1",
                    ),
                    class: "section-gap",
                  },
                  element(
                    "summary",
                    {},
                    "More about your chart · optional background",
                  ),
                  element(
                    "p",
                    { class: "small muted" },
                    "Archives II p. 50. These signs describe first impressions and areas of your life; they add no Characteristic, Talent or XP bonuses.",
                  ),
                  "\n",
                  element(
                    "p",
                    {},
                    "Ascendant: ",
                    element(
                      "strong",
                      {},
                      esc(
                        R.astrology.find((x) => x.id === chart.ascendant)
                          ?.name || "Not rolled",
                      ),
                    ),
                  ),
                  button("ascendant-roll", "Roll ascendant · d100"),
                  element(
                    "div",
                    { class: "field" },
                    element(
                      "label",
                      { for: "mansion-count" },
                      "Celestial mansions",
                    ),
                    select(
                      'id="mansion-count" data-bind="mansionCount"',
                      Array.from({ length: 6 }, (_, i) => [
                        String(i),
                        i ? String(i) : "None",
                      ]),
                      String(chart.mansions.length),
                    ),
                  ),
                  joinNodes(
                    chart.mansions.map((id, i) =>
                      element(
                        "div",
                        { class: "skill-row" },
                        element(
                          "span",
                          {},
                          ["Sense", "Trials", "Thought", "Love", "Coin"][i],
                          ": ",
                          element(
                            "strong",
                            {},
                            esc(
                              R.astrology.find((x) => x.id === id)?.name ||
                                "Not rolled",
                            ),
                          ),
                        ),
                        button(
                          "mansion-roll",
                          "Roll · d100",
                          interpolate(['data-key="', '"'], [i]),
                        ),
                      ),
                    ),
                    "",
                  ),
                ),
              )
            : "",
        ),
  );
}
