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
import { legacyTag, legacyMechanic, legacyName } from "./legacy.mjs";
const legacyFeature = legacyMechanic("longbeard");
import {
  dwarfGuide,
  dwarfReferences,
  knownRunes,
  grudgeSlots,
} from "../../../engine/dwarf-guide.mjs";
import { derive } from "../../../engine/rules.mjs";
import { sourceLabel } from "../../../engine/sources.mjs";
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function dwarfOriginPanel(R, s) {
  if (!dwarfGuide(R) || s.species !== "Dwarf") return "";
  return element(
    "section",
    { class: "notice" },
    element("strong", {}, "Dwarf background · Dwarf Guide pp. 38–42"),
    element(
      "p",
      { class: "small muted" },
      "Names use the printed d1000 table. Surnames use a parent’s name plus sson or sdottir; you can edit either name freely. Clan and birthplace are background, with regional Skills/Talents chosen above.",
    ),
    "\n",
    element(
      "div",
      { class: "cols" },
      element(
        "div",
        { class: "field" },
        element(
          "label",
          { for: "dwarf-name-style" },
          "Forename column / surname ending",
        ),
        element(
          "select",
          { id: "dwarf-name-style", "data-bind": "dwarfNameStyle" },
          joinNodes(
            ["Male", "Female"].map((x) =>
              element(
                "option",
                { ...attributes(s.dwarfNameStyle === x ? "selected" : "") },
                x,
              ),
            ),
            "",
          ),
        ),
      ),
      "\n",
      element(
        "div",
        { class: "field" },
        element(
          "label",
          { for: "dwarf-parent-style" },
          "Parent-name column for surname rolls",
        ),
        element(
          "select",
          { id: "dwarf-parent-style", "data-bind": "dwarfParentStyle" },
          joinNodes(
            ["Male", "Female"].map((x) =>
              element(
                "option",
                { ...attributes(s.dwarfParentStyle === x ? "selected" : "") },
                x,
              ),
            ),
            "",
          ),
        ),
      ),
      "\n",
    ),
    "\n",
    element(
      "div",
      { class: "field" },
      element("label", { for: "dwarf-birthplace" }, "Birthplace"),
      element("input", {
        id: "dwarf-birthplace",
        "data-bind": "background",
        "data-key": "birthplace",
        value: esc(s.background?.birthplace),
      }),
    ),
    "\n",
    element(
      "button",
      { "data-action": "dwarf-birthplace", type: "button" },
      "Roll birthplace · d100",
    ),
    element(
      "label",
      { class: "check-row section-gap" },
      element("input", {
        type: "checkbox",
        "data-bind": "longbeard",
        ...attributes(s.longbeard ? "checked" : ""),
      }),
      "Optional Longbeard · p. 50 ",
      legacyTag(R, legacyFeature),
    ),
    s.longbeard
      ? fragment(
          element(
            "div",
            { class: "field" },
            element(
              "label",
              { for: "longbeard-age" },
              "Longbeard age (120 or older)",
            ),
            element("input", {
              id: "longbeard-age",
              type: "number",
              min: "120",
              step: "1",
              "data-bind": "longbeardAge",
              value: s.longbeardAge ?? "",
            }),
          ),
          "\n",
          element(
            "p",
            { class: "small purchase-error" },
            esc(R.dwarfCreation.longbeard.text),
          ),
        )
      : "",
    element(
      "p",
      { class: "small muted" },
      "The appearance table referenced on p. 42 is missing from this PDF. Core appearance rolls are retained without its regional modifiers.",
    ),
    "\n",
  );
}
export function dwarfCareerPanel(R, s) {
  if (!dwarfGuide(R) || s.species !== "Dwarf") return "";
  const peers = R.careers.filter(
      (c) =>
        c.id === s.career ||
        c.alternativeFor === s.career ||
        R.careers.find((x) => x.id === s.career)?.alternativeFor === c.id,
    ),
    updates = R.careerUpdates.filter((x) => x.careers.includes(s.career));
  return fragment(
    element(
      "section",
      { class: "notice" },
      element(
        "label",
        { class: "check-row" },
        element("input", {
          type: "checkbox",
          "data-bind": "dwarfTrappingSwaps",
          ...attributes(s.dwarfTrappingSwaps ? "checked" : ""),
        }),
        "Optional Dwarf equipment and weapon Skill swaps · p. 55",
      ),
      element(
        "p",
        { class: "small muted" },
        "Adds the printed alternatives to Career gear and matching weapon Skills. Choose the actual equipment in Gear and specialisations in Skills. Class equipment stays as printed. Unspecified ammunition quantities remain unresolved. Changing this option clears Career allocations and gear, and is locked after XP spending.",
      ),
      "\n",
    ),
    peers.length > 1
      ? fragment(
          element(
            "div",
            { class: "field section-gap" },
            element(
              "label",
              { for: "dwarf-career-profile" },
              "Karak Ranger profile",
            ),
            element(
              "select",
              { id: "dwarf-career-profile", "data-bind": "dwarfCareerProfile" },
              joinNodes(
                peers.map((c) =>
                  element(
                    "option",
                    {
                      value: esc(c.id),
                      ...attributes(c.id === s.career ? "selected" : ""),
                    },
                    esc(sourceLabel(R, c)),
                  ),
                ),
                "",
              ),
            ),
          ),
          "\n",
          element(
            "p",
            { class: "small muted" },
            "Each book’s profile remains intact. Archives I is the default when both are enabled.",
          ),
        )
      : "",
    updates.length
      ? element(
          "section",
          { class: "notice" },
          element("strong", {}, "Optional Dwarf Career levels · pp. 54–61"),
          element(
            "p",
            { class: "small muted" },
            "Choose each level separately. Switching clears Career allocations, gear and magic choices and is locked after XP spending.",
          ),
          joinNodes(
            [2, 3, 4].map((level) => {
              const choices = updates.filter((x) => x.profile.level === level);
              return choices.length
                ? fragment(
                    element(
                      "div",
                      { class: "field" },
                      element(
                        "label",
                        { for: ["dwarf-level-", level].join("") },
                        "Level ",
                        level,
                      ),
                      element(
                        "select",
                        {
                          id: ["dwarf-level-", level].join(""),
                          "data-bind": "dwarfCareerUpdate",
                          "data-key": level,
                        },
                        element(
                          "option",
                          { value: "" },
                          "Standard Career level",
                        ),
                        joinNodes(
                          choices.map((x) =>
                            element(
                              "option",
                              {
                                value: esc(x.id),
                                ...attributes(
                                  s.dwarfCareerUpdates?.[level] === x.id
                                    ? "selected"
                                    : "",
                                ),
                                ...attributes(x.unavailable ? "disabled" : ""),
                              },
                              esc(legacyName(R, x)),
                              " · p. ",
                              x.page,
                              x.unavailable ? " · unavailable" : "",
                            ),
                          ),
                          "",
                        ),
                      ),
                    ),
                    joinNodes(
                      choices
                        .filter((x) => x.unavailable)
                        .map((x) =>
                          element(
                            "p",
                            { class: "small muted" },
                            esc(x.name),
                            ": ",
                            esc(x.unavailable),
                          ),
                        ),
                      "",
                    ),
                  )
                : "";
            }),
            "",
          ),
        )
      : "",
  );
}
export function grudgePanel(R, s) {
  const slots = grudgeSlots(s, derive(R, s).talents);
  if (!slots.length) return "";
  return fragment(
    element("h3", {}, "Ancestral Grudges · Dwarf Guide pp. 80–81"),
    "\n",
    element(
      "p",
      { class: "small muted" },
      "Choose a different culture or faction for each rank. Printed examples: Orcs, Goblins, Skaven, Trolls, Daemons of Khorne. Campaign XP awards are deferred.",
    ),
    joinNodes(
      slots.map((_, i) =>
        element(
          "div",
          { class: "field" },
          element(
            "label",
            { for: ["grudge-", i].join("") },
            "Grudge ",
            combine(i, 1),
          ),
          element("input", {
            id: ["grudge-", i].join(""),
            "data-bind": "grudgeTarget",
            "data-key": i,
            value: esc(s.grudgeTargets?.[i]),
            maxlength: "100",
          }),
        ),
      ),
      "",
    ),
  );
}
export function runePanel(R, s) {
  const runes = knownRunes(R, s, derive(R, s).talents);
  if (!runes.length) return "";
  return fragment(
    element("h3", {}, "Learned runes"),
    "\n",
    element(
      "p",
      { class: "small muted" },
      "These are runes you know how to craft, not enchanted items you own. Learning a Master Rune also grants the three Doom Runes. Crafting and live activation are deferred.",
    ),
    joinNodes(
      runes.map((x) =>
        element(
          "div",
          { class: "rule-entry" },
          element(
            RuleName,
            { reference: entryReference("magic", x) },
            fragment(esc(x.name), " · ", esc(x.form)),
          ),
          element("small", {}, esc(sourceLabel(R, x))),
          legacyTag(R, x),
        ),
      ),
      "",
    ),
  );
}
export function runeShopRows(names, row, section) {
  const ordinary = [],
    groups = new Map();
  for (const name of names) {
    const m = name.match(/^(Rune Magic|Master Rune Magic) \(([^:]+): /);
    if (!m) {
      ordinary.push(name);
      continue;
    }
    const key = interpolate(["", " · ", ""], [m[1], m[2]]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(name);
  }
  return combine(
    joinNodes(ordinary.map(row), ""),
    joinNodes(
      [...groups].map(([key, choices]) =>
        choices.length === 1
          ? row(choices[0])
          : element(
              "details",
              {
                "data-detail-key": detailKey(
                  "experience:rune-group",
                  combine(combine(section, ":"), key),
                ),
                class: "talent-catalog-group",
                "data-group": esc(combine(combine(section, ":"), key)),
              },
              element(
                "summary",
                {},
                esc(key),
                " ",
                element("span", { class: "counter" }, choices.length),
              ),
              joinNodes(choices.map(row), ""),
            ),
      ),
      "",
    ),
  );
}
export function runeChoiceDescription(R, name) {
  const rune = R.runes.find(
    (x) =>
      name ===
      interpolate(
        ["", " (", ": ", ")"],
        [x.master ? "Master Rune Magic" : "Rune Magic", x.form, x.name],
      ),
  );
  return rune
    ? fragment(
        element(
          "p",
          {},
          element(
            "strong",
            {},
            esc(rune.name),
            " · ",
            esc(sourceLabel(R, rune)),
          ),
        ),
        "\n",
        element("p", {}, esc(rune.text)),
        "\n",
        element(
          "p",
          { class: "small muted" },
          esc(rune.conversion),
          " Printed crafting SL: ",
          rune.sl,
          " (reference only).",
        ),
      )
    : "";
}
export function dwarfReview(R, s) {
  return combine(
    combine(
      joinNodes(
        dwarfReferences(R, s).map((x) =>
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
      grudgePanel(R, s),
    ),
    runePanel(R, s),
  );
}
