import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
import { esc, score, button } from "./controls.mjs";
import { characteristicNames } from "../../../engine/ui.mjs";
import { chapterHeading } from "./design-system.mjs";
import { formatMoney } from "../../../engine/market.mjs";
import { sheetSpecies } from "../../../engine/origins.mjs";
import { legacyTag } from "./legacy.mjs";
import { legacyOption, legacyGear } from "../../../engine/legacy-character.mjs";

// Presentation only. All scores, ranks, load effects and inventory come from
// the same calculated result used by the folio and PDF exports.
export function reviewSheet(R, s, snapshot, ui) {
  const { derived: d, equipment: eq, career: c, wallet } = snapshot;
  const {
    issues,
    issueHTML,
    talentDescription,
    spellDescription,
    recordsHTML,
    fullAppendix,
  } = ui;
  const edit = (step, label) =>
    button(
      "Edit",
      "step",
      interpolate(
        ['data-step="', '" aria-label="Edit ', '"'],
        [step, esc(label)],
      ),
      "quiet review-edit",
    );
  const section = (id, title, content, step, count = "") =>
    element(
      "section",
      { class: "review-block", "aria-labelledby": ["review-", id].join("") },
      element(
        "div",
        { class: "review-block-heading" },
        element(
          "h3",
          { id: ["review-", id].join("") },
          title,
          count !== ""
            ? fragment(" ", element("span", { class: "review-count" }, count))
            : "",
        ),
        edit(step, title),
      ),
      content,
    );
  const disclosure = (key, title, body, attrs = "") =>
    element(
      "details",
      {
        class: "review-detail",
        "data-detail-key": ["review-sheet:", key].join(""),
        ...attributes(attrs),
      },
      element("summary", {}, title),
      element("div", { class: "review-detail-body" }, body),
    );
  const empty = (text) => element("p", { class: "review-empty" }, text);
  const metric = (label, value, note = "") =>
    element(
      "div",
      {},
      element("dt", {}, label),
      element("dd", {}, esc(score(value))),
      note ? element("small", {}, esc(note)) : "",
    );
  const current = (key) =>
    key === "Ag" && eq.penalties.complete ? eq.penalties.agility : d.stats[key];
  const skillList = (rows) =>
    rows.length
      ? fragment(
          element(
            "div",
            { class: "review-skill-heading", "aria-hidden": "true" },
            element("span", {}, "Skill"),
            element("span", {}, "Adv."),
            element("span", {}, "Total"),
          ),
          element(
            "ul",
            { class: "review-skills" },
            joinNodes(
              rows.map((row) =>
                element(
                  "li",
                  {},
                  element(
                    "span",
                    {},
                    button(
                      esc(row.name),
                      "calculation",
                      interpolate(
                        ['data-kind="skill" data-name="', '"'],
                        [esc(row.name)],
                      ),
                      "review-skill-name",
                    ),
                    legacyTag(R, legacyOption(R, s, "skill", row.name)),
                    element(
                      "small",
                      {},
                      esc(row.char),
                      row.career ? " · Career" : "",
                    ),
                  ),
                  element("span", {}, "+", esc(score(row.adv))),
                  element("strong", {}, esc(score(row.total))),
                ),
              ),
              "",
            ),
          ),
        )
      : empty("No trained Skills yet.");
  const trained = snapshot.skills.filter((row) => row.adv > 0);
  const basic = snapshot.skills.filter((row) => !row.advanced && !row.adv);
  const ranks = [...new Set(d.talents)].sort().map((name) => ({
    name,
    count: d.talents.filter((t) => t === name).length,
  }));
  const gearTag = (x) => legacyTag(R, legacyGear(R, s, x, x.name));
  const weapons = eq.weapons.length
    ? element(
        "ul",
        { class: "review-weapons" },
        joinNodes(
          eq.weapons.map((x) =>
            element(
              "li",
              {},
              element(
                "div",
                {},
                element("strong", {}, esc(x.label)),
                gearTag(x),
                element(
                  "small",
                  {},
                  esc(
                    joinNodes(
                      [
                        x.group,
                        x.range
                          ? interpolate(["Range ", ""], [x.range])
                          : x.reach,
                      ].filter(Boolean),
                      " · ",
                    ),
                  ),
                ),
                x.qualities?.length
                  ? element(
                      "small",
                      {},
                      esc(
                        Array.isArray(x.qualities)
                          ? joinNodes(x.qualities, ", ")
                          : x.qualities,
                      ),
                    )
                  : "",
              ),
              element(
                "span",
                { class: "review-damage" },
                element("small", {}, "Damage"),
                element(
                  "strong",
                  {},
                  esc(
                    Number.isFinite(x.damage)
                      ? interpolate(["+", ""], [score(x.damage)])
                      : x.damage,
                  ),
                ),
              ),
            ),
          ),
          "",
        ),
      )
    : empty("No weapons.");
  const armour = fragment(
    element(
      "dl",
      { class: "review-armour" },
      joinNodes(
        ["Head", "Arms", "Body", "Legs", "Shield"].map((k) =>
          metric(k, eq.ap[k]),
        ),
        "",
      ),
    ),
    element(
      "p",
      { class: "review-caption" },
      "Armour Points · Toughness Bonus ",
      esc(score(d.tb)),
    ),
    eq.armour.length
      ? element(
          "ul",
          { class: "review-belongings" },
          joinNodes(
            eq.armour.map((x) =>
              element(
                "li",
                {},
                element("span", {}, esc(x.label), gearTag(x)),
                element(
                  "small",
                  {},
                  esc(x.locations),
                  " · ",
                  esc(score(x.ap)),
                  " AP",
                  x.active === false ? " · not active" : "",
                ),
              ),
            ),
            "",
          ),
        )
      : empty("No armour."),
  );
  const belongings = eq.other.length
    ? element(
        "ul",
        { class: "review-belongings" },
        joinNodes(
          eq.other.map((x) =>
            element("li", {}, element("span", {}, esc(x.name), gearTag(x))),
          ),
          "",
        ),
      )
    : empty("No other belongings.");
  const extraMagic = [
    ["Techniques", snapshot.techniques],
    ["Runes", snapshot.runes],
    ["Cants", snapshot.cants],
  ].filter(([, rows]) => rows?.length);
  const magic = combine(
    joinNodes(
      snapshot.spells.map((x) => spellDescription(x)),
      "",
    ),
    joinNodes(
      extraMagic.map(([label, rows]) =>
        fragment(
          element("h4", {}, label),
          element(
            "ul",
            { class: "review-belongings" },
            joinNodes(
              rows.map((x) =>
                element(
                  "li",
                  {},
                  esc(x.displayName || x.name),
                  legacyTag(R, x),
                ),
              ),
              "",
            ),
          ),
        ),
      ),
      "",
    ),
  );
  const level = c.levels?.[d.level - 1];
  return element(
    "div",
    { class: "review-sheet" },
    "\n    ",
    element(
      "header",
      { class: "review-identity" },
      element("span", { class: "eyebrow" }, "08 / Review & export"),
      chapterHeading(s.name || "Your character"),
      "\n      ",
      element(
        "dl",
        { class: "review-identity-grid" },
        element(
          "div",
          {},
          element("dt", {}, "Species"),
          element("dd", {}, esc(sheetSpecies(R, s))),
        ),
        element(
          "div",
          {},
          element("dt", {}, "Class"),
          element("dd", {}, esc(c.class || "Not chosen")),
        ),
        element(
          "div",
          {},
          element("dt", {}, "Career"),
          element("dd", {}, esc(c.id ? c.name : "Not chosen")),
        ),
        element(
          "div",
          {},
          element("dt", {}, "Rank"),
          element(
            "dd",
            {},
            esc(
              c.id
                ? interpolate(
                    ["", " · Level ", ""],
                    [level?.name || c.name, d.level],
                  )
                : "—",
            ),
          ),
        ),
        element(
          "div",
          {},
          element("dt", {}, "Status"),
          element("dd", {}, esc(d.status || "—")),
        ),
      ),
      "\n    ",
    ),
    "\n    ",
    element(
      "div",
      { class: "review-export" },
      element(
        "div",
        {
          class: [
            "review-export-status ",
            issues.length ? "review-incomplete" : "review-ready",
          ].join(""),
        },
        element(
          "strong",
          {},
          issues.length
            ? interpolate(
                ["", " unfinished ", ""],
                [issues.length, issues.length === 1 ? "choice" : "choices"],
              )
            : "Ready to export",
        ),
        element(
          "span",
          {},
          issues.length
            ? "Resolve the choices below to enable PDF downloads."
            : "Editable character sheet and complete creation record.",
        ),
      ),
      element(
        "div",
        { class: "review-export-actions" },
        button(
          "Download character sheet",
          "sheet",
          issues.length ? "disabled" : "",
          "primary",
        ),
        button(
          "Download creation & XP record",
          "record",
          issues.length ? "disabled" : "",
          "quiet",
        ),
      ),
      "\n    ",
      disclosure(
        "pdf-options",
        "PDF options",
        fragment(
          element(
            "label",
            { class: "check-row" },
            element("input", {
              type: "checkbox",
              "data-bind": "fullAppendix",
              checked: Boolean(fullAppendix),
            }),
            "Include the complete enabled-book compatibility appendix",
          ),
          element(
            "p",
            { class: "small muted" },
            "Both downloads always include every actual choice, roll, XP purchase, overflow and relevant adaptation. The appendix adds unused catalogue conversions. The character sheet uses your supplied fillable PDF with the creation record appended.",
          ),
        ),
      ),
    ),
    "\n    ",
    issues.length
      ? disclosure("issues", "Finish choices to export", issueHTML, "open")
      : "",
    "\n    ",
    section(
      "characteristics",
      "Characteristics",
      fragment(
        element(
          "dl",
          { class: "review-stats" },
          joinNodes(
            Object.keys(characteristicNames).map((k) =>
              element(
                "div",
                {},
                element(
                  "dt",
                  {},
                  element("abbr", { title: characteristicNames[k] }, k),
                ),
                element(
                  "dd",
                  {},
                  button(
                    esc(score(current(k))),
                    "calculation",
                    interpolate(
                      [
                        'data-kind="char" data-name="',
                        '" aria-label="',
                        " ",
                        '; calculation"',
                      ],
                      [k, characteristicNames[k], esc(score(current(k)))],
                    ),
                    "review-stat-button",
                  ),
                ),
              ),
            ),
            "",
          ),
        ),
        element(
          "p",
          { class: "review-caption" },
          eq.penalties.complete
            ? "Current scores include known load penalties."
            : "Intrinsic scores shown. Load effects are unresolved.",
        ),
        disclosure(
          "stat-breakdown",
          "Starting scores & Advances",
          fragment(
            element(
              "div",
              { class: "table-wrap" },
              element(
                "table",
                {},
                element(
                  "thead",
                  {},
                  element(
                    "tr",
                    {},
                    element("th", {}, "Characteristic"),
                    element("th", {}, "Initial*"),
                    element("th", {}, "XP added"),
                    element("th", {}, "Intrinsic"),
                    element("th", {}, "Current"),
                  ),
                ),
                element(
                  "tbody",
                  {},
                  joinNodes(
                    Object.entries(characteristicNames).map(([k, name]) =>
                      element(
                        "tr",
                        {},
                        element("th", { scope: "row" }, name),
                        element("td", {}, score(d.stats[k] - d.charAdv[k])),
                        element("td", {}, "+", score(d.charAdv[k])),
                        element("td", {}, score(d.stats[k])),
                        element("td", {}, score(current(k))),
                      ),
                    ),
                    "",
                  ),
                ),
              ),
            ),
            element(
              "p",
              { class: "review-caption" },
              "*Includes Talent bonuses, which do not count as Advances.",
            ),
          ),
        ),
      ),
      2,
    ),
    "\n    ",
    element(
      "dl",
      { class: "review-resources", "aria-label": "Character resources" },
      metric("Wounds", d.wounds),
      metric("Fate", d.fate),
      metric("Fortune", d.fortune),
      metric(
        "Movement",
        eq.penalties.complete ? eq.penalties.movement : d.movement,
      ),
      metric("Size", d.size),
      metric(
        "Enc. / capacity",
        interpolate(["", " / ", ""], [score(eq.total), score(d.capacity)]),
        eq.unknown.length ? "Known weight only" : "",
      ),
    ),
    "\n    ",
    element(
      "div",
      { class: "review-balance" },
      element(
        "span",
        {},
        "XP ",
        element("strong", {}, score(d.remaining)),
        " available ",
        element(
          "small",
          {},
          "· ",
          score(d.spent),
          " spent / ",
          score(d.xpTotal),
          " total",
        ),
      ),
      element(
        "span",
        {},
        "Money ",
        element(
          "strong",
          {},
          s.wealth ? esc(formatMoney(wallet.remaining)) : "Not rolled",
        ),
        " ",
        element("small", {}, "· ", esc(formatMoney(wallet.spent)), " spent"),
      ),
    ),
    "\n    ",
    element(
      "div",
      { class: "review-columns" },
      element(
        "div",
        {},
        section(
          "skills",
          "Skills",
          combine(
            skillList(trained),
            basic.length
              ? disclosure(
                  "basic-skills",
                  interpolate(
                    ["Untrained Basic Skills · ", ""],
                    [basic.length],
                  ),
                  skillList(basic),
                )
              : "",
          ),
          3,
          trained.length,
        ),
      ),
      element(
        "div",
        {},
        section(
          "talents",
          "Talents",
          ranks.length
            ? joinNodes(
                ranks.map(({ name, count }) =>
                  talentDescription(name, {
                    metadata: element(
                      "span",
                      {
                        class: "review-rank",
                        "aria-label": [
                          count,
                          " ",
                          count === 1 ? "rank" : "ranks",
                        ].join(""),
                      },
                      "×",
                      count,
                    ),
                  }),
                ),
                "",
              )
            : empty("No Talents yet."),
          4,
          ranks.length,
        ),
        section(
          "magic",
          "Magic & special abilities",
          magic || empty("No spells, prayers, Runes, Techniques or Cants."),
          4,
        ),
      ),
    ),
    "\n    ",
    section(
      "equipment",
      "Equipment",
      fragment(
        element(
          "div",
          { class: "review-equipment-grid" },
          element("div", {}, element("h4", {}, "Weapons"), weapons),
          element(
            "div",
            {},
            element("h4", {}, "Armour"),
            armour,
            element("h4", {}, "Other belongings"),
            belongings,
          ),
        ),
        eq.unknown.length
          ? element(
              "p",
              { class: "review-weight-warning" },
              "Unlisted weights: ",
              joinNodes(eq.unknown.map(esc), ", "),
              ". Encumbrance shows the known subtotal.",
            )
          : "",
      ),
      5,
    ),
    "\n    ",
    element(
      "div",
      { class: "review-records" },
      disclosure(
        "background",
        "Background & character notes",
        fragment(
          element(
            "dl",
            { class: "review-background" },
            joinNodes(
              [
                ["Appearance & background", s.appearance],
                ["Eyes", s.background?.eyes],
                ["Hair", s.background?.hair],
                ["Clan", s.background?.clan],
                ["Personal ambition", s.ambition],
                ["Party ambition", s.partyAmbition],
                ["Dooming", d.talents.includes("Doomed") ? s.dooming : ""],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) =>
                  element(
                    "div",
                    {},
                    element("dt", {}, label),
                    element("dd", {}, esc(value)),
                  ),
                ),
              "",
            ),
          ),
          element(
            "div",
            { class: "field" },
            element(
              "label",
              { for: "notes" },
              "Character notes / GM decisions",
            ),
            element(
              "textarea",
              { id: "notes", "data-bind": "notes" },
              esc(s.notes),
            ),
          ),
        ),
      ),
      recordsHTML,
    ),
    "\n  ",
  );
}
