import { RuleName } from "../../../components/RuleReference";
import { entryReference } from "../../../engine/entry-reference.mjs";
import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
import { detailKey } from "../../../engine/disclosures.mjs";

import {
  archivesIII,
  cantGrants,
  knownCants,
  divineReference,
} from "../../../engine/archives-iii.mjs";
import { originProfile } from "../../../engine/origins.mjs";
import { sourceLabel } from "../../../engine/sources.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function originTalentChoice(R, s) {
  const o = originProfile(R, s);
  if (!o?.randomTalentAlternative) return "";
  return element(
    "div",
    { class: "field" },
    element(
      "label",
      { for: "regional-talent-mode" },
      "Eastender’s final Species Talent",
    ),
    element(
      "select",
      { id: "regional-talent-mode", "data-bind": "originTalentMode" },
      element(
        "option",
        {
          value: "fixed",
          ...attributes(s.originTalentMode !== "random" ? "selected" : ""),
        },
        esc(o.randomTalentAlternative),
      ),
      element(
        "option",
        {
          value: "random",
          ...attributes(s.originTalentMode === "random" ? "selected" : ""),
        },
        "Roll one random Talent",
      ),
    ),
    element(
      "small",
      { class: "muted" },
      "One starting slot · ",
      esc(sourceLabel(R, o)),
      ". Changing this clears your starting Talent and magic choices.",
    ),
  );
}
export function divinePanel(R, s) {
  return joinNodes(
    divineReference(R, s).map((x) =>
      element(
        "div",
        { class: "notice" },
        element("strong", {}, esc(sourceLabel(R, x))),
        element("p", {}, esc(x.text)),
        "\n",
      ),
    ),
    "",
  );
}
export function cantReview(R, s) {
  const cants = knownCants(R, s);
  return cants.length
    ? fragment(
        element("h3", {}, "Optional Cants · 0 XP "),
        joinNodes(
          cants.map((x) =>
            element(
              "details",
              {
                "data-detail-key": detailKey("archives-iii-ui:cantReview:0", x),
                class: "spell-description",
              },
              element(
                "summary",
                {},
                esc(x.name),
                " · ",
                esc(x.lore),
                " ",
                esc(sourceLabel(R, x)),
              ),
              element("p", {}, esc(x.text)),
              "\n",
            ),
          ),
          "",
        ),
      )
    : "";
}
export function cantPanel(R, s) {
  if (!archivesIII(R)) return "";
  const grants = cantGrants(R, s);
  return element(
    "section",
    { class: "section-gap", "aria-label": "Optional Cants" },
    element("h3", {}, "Optional Cants "),
    "\n",
    element(
      "label",
      { class: "check" },
      element("input", {
        type: "checkbox",
        "data-bind": "cantsEnabled",
        ...attributes(s.cants?.enabled ? "checked" : ""),
      }),
      " Use Cants from Archives III",
    ),
    element(
      "p",
      { class: "small muted" },
      "Choose a free Cant after learning 1, 3 and 6 spells of a Colour Lore (Archives III p. 86). Each choice costs 0 XP. Casting and power spending are reference rules.",
    ),
    !s.cants?.enabled
      ? ""
      : !grants.length
        ? element(
            "p",
            { class: "empty" },
            "Learn Arcane Magic for a Colour Lore and at least one spell of that Lore to choose your first Cant.",
          )
        : joinNodes(
            grants.map((g) =>
              fragment(
                element(
                  "h3",
                  {},
                  esc(g.lore),
                  " · ",
                  g.spells,
                  " spell",
                  g.spells === 1 ? "" : "s",
                  " · ",
                  g.count,
                  " Cant",
                  g.count === 1 ? "" : "s",
                ),
                joinNodes(
                  Array.from({ length: g.count }, (_, i) => {
                    const selected = s.cants.choices?.[g.lore]?.[i] || "",
                      chosen = g.choices.find((x) => x.id === selected),
                      id = interpolate(["cant-", "-", ""], [g.lore, i]);
                    return fragment(
                      element(
                        "div",
                        { class: "field" },
                        element(
                          "label",
                          { for: id },
                          esc(g.lore),
                          " Cant ",
                          combine(i, 1),
                        ),
                        element(
                          "select",
                          {
                            id: id,
                            "data-bind": "cant",
                            "data-lore": esc(g.lore),
                            "data-key": i,
                          },
                          element("option", { value: "" }, "Choose…"),
                          joinNodes(
                            g.choices.map((x) =>
                              element(
                                "option",
                                {
                                  value: esc(x.id),
                                  ...attributes(
                                    selected === x.id ? "selected" : "",
                                  ),
                                  ...attributes(
                                    selected !== x.id &&
                                      (
                                        s.cants.choices?.[g.lore] || []
                                      ).includes(x.id)
                                      ? "disabled"
                                      : "",
                                  ),
                                },
                                esc(x.name),
                                " · ",
                                esc(sourceLabel(R, x)),
                              ),
                            ),
                            "",
                          ),
                        ),
                      ),
                      chosen
                        ? element(
                            "div",
                            { class: "spell-description" },
                            element(RuleName, {
                              reference: entryReference("cant", chosen),
                            }),
                            element("small", {}, esc(sourceLabel(R, chosen))),
                          )
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
