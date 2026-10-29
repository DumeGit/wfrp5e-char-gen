import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
import { detailKey } from "../../../engine/disclosures.mjs";
import * as M from "../../../engine/rules.mjs";
import {
  esc,
  careerResults,
  careerDifferences,
} from "../../../engine/workspace.mjs";
import { sourceLabel } from "../../../engine/sources.mjs";
import { legacyTag } from "./legacy.mjs";
import { gearSlots, gearOptions } from "../../../engine/equipment.mjs";
import { careerVariantPanel } from "./career-variants.mjs";
import { dwarfCareerPanel } from "./dwarf-guide-ui.mjs";
import { elfCareerPanel } from "./high-elf-ui.mjs";

export function careerBrowser(R, s, filters) {
  const available = careerResults(R, s),
    results = careerResults(R, s, filters),
    preview = R.careers.find((x) => x.id === filters.preview) || M.career(R, s);
  const effective =
      preview.id === s.career
        ? M.career(R, s)
        : M.career(R, {
            ...s,
            career: preview.id,
            dwarfCareerUpdates: {},
            highElf: s.highElf
              ? { ...s.highElf, careerVariant: "standard" }
              : undefined,
          }),
    first = effective.levels[0];
  return element(
    "section",
    { class: "career-browser" },
    element(
      "div",
      { class: "browser-filters" },
      element(
        "div",
        { class: "field" },
        element("label", { for: "career-search" }, "Find a Career"),
        element("input", {
          id: "career-search",
          type: "search",
          "data-search": "career",
          value: esc(filters.query),
          placeholder: "Name, Class or starting Skill",
        }),
      ),
      "\n",
      element(
        "div",
        { class: "field" },
        element("label", { for: "class-filter" }, "Class"),
        element(
          "select",
          { id: "class-filter", "data-bind": "careerFilter" },
          joinNodes(
            [
              "All classes",
              ...[...new Set(available.map((x) => x.class))].sort(),
            ].map((x) =>
              element(
                "option",
                { ...attributes(x === filters.className ? "selected" : "") },
                esc(x),
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
        element("label", { for: "career-book" }, "Source"),
        element(
          "select",
          { id: "career-book", "data-bind": "careerBook" },
          element("option", { value: "all" }, "All selected books"),
          joinNodes(
            R.books
              .filter((b) => available.some((c) => c.source.book === b.id))
              .map((b) =>
                element(
                  "option",
                  {
                    value: esc(b.id),
                    ...attributes(filters.book === b.id ? "selected" : ""),
                  },
                  esc(b.shortTitle || b.title),
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
      "p",
      { class: "small muted", "aria-live": "polite" },
      results.length,
      " matching Careers. Previewing keeps your character unchanged.",
    ),
    "\n",
    element(
      "div",
      { class: "career-results" },
      joinNodes(
        results.slice(0, filters.limit).map((c) =>
          element(
            "button",
            {
              type: "button",
              class: [
                "career-result ",
                c.id === preview.id ? "previewed" : "",
              ].join(""),
              "data-action": "career-preview",
              "data-id": esc(c.id),
              "aria-pressed": c.id === preview.id,
            },
            element("strong", {}, esc(c.name)),
            element(
              "small",
              {},
              esc(c.class),
              " · ",
              esc(sourceLabel(R, c, { legacy: false })),
            ),
            element(
              "span",
              {},
              joinNodes(
                Object.entries(
                  M.career(R, {
                    ...s,
                    career: c.id,
                    dwarfCareerUpdates: {},
                    highElf: s.highElf
                      ? { ...s.highElf, careerVariant: "standard" }
                      : undefined,
                  }).advanceScheme,
                )
                  .filter(([, v]) => v === 1)
                  .map(([k]) => k),
                " · ",
              ),
              c.id === s.career ? " · Current" : "",
            ),
          ),
        ),
        "",
      ),
    ),
    results.length > filters.limit
      ? element(
          "button",
          { type: "button", class: "quiet", "data-action": "career-more" },
          "Show more Careers",
        )
      : "",
    !results.length
      ? element(
          "p",
          { class: "empty" },
          "No matching Careers. Try another search or filter.",
        )
      : "",
    preview.id
      ? element(
          "article",
          { class: "career-preview" },
          element(
            "div",
            { class: "split" },
            element("h3", {}, esc(preview.name), " ", legacyTag(R, effective)),
            "\n",
            element(
              "span",
              { class: "counter" },
              preview.id === s.career ? "Current Career" : "Preview only",
            ),
          ),
          "\n",
          element(
            "p",
            {},
            esc(first.name),
            " · ",
            first.status,
            " ",
            first.standing,
            " · ",
            esc(sourceLabel(R, effective, { legacy: false })),
          ),
          "\n",
          element(
            "p",
            {},
            element("strong", {}, "Starting Skills:"),
            " ",
            esc(joinNodes(first.skills, ", ")),
          ),
          "\n",
          element(
            "p",
            {},
            element("strong", {}, "Starting Talents:"),
            " ",
            esc(joinNodes(first.talents, ", ")),
          ),
          "\n",
          element(
            "p",
            {},
            element("strong", {}, "Starting kit:"),
            " ",
            esc(joinNodes(first.trappings, ", ")),
          ),
          preview.id !== s.career
            ? element(
                "button",
                {
                  type: "button",
                  class: "primary",
                  "data-action": "career-apply",
                  "data-id": esc(preview.id),
                  ...attributes(s.ledger.length ? "disabled" : ""),
                },
                "Choose ",
                esc(preview.name),
              )
            : "",
        )
      : "",
  );
}

export function careerOptions(R, s) {
  const parts = [
    careerVariantPanel(R, s),
    dwarfCareerPanel(R, s),
    elfCareerPanel(R, s),
  ].filter(Boolean);
  return parts.length
    ? element(
        "details",
        {
          "data-detail-key": detailKey("flow-ui:careerOptions:0"),
          class: "career-options section-gap",
          open: "",
        },
        element(
          "summary",
          {},
          "Career options ",
          element(
            "span",
            { class: "minilabel" },
            "Optional profiles, levels & equipment",
          ),
        ),
        element(
          "p",
          { class: "small muted" },
          "Each change shows its effect on training and equipment before you apply it. These choices grant no extra free Advances.",
        ),
        joinNodes(parts, ""),
      )
    : "";
}

export function kitSummary(R, s, { select, button, tag }) {
  const slots = gearSlots(R, s).filter((x) => !x.marketId),
    choices = slots.filter((x) => gearOptions(x.name, R).length > 1),
    fixed = slots.filter((x) => gearOptions(x.name, R).length === 1);
  const rolled = (x) =>
    x.name.replace(
      /\{?(\d+)d10\}?/g,
      (m) => s.gearRolls[interpolate(["", ":", ""], [x.key, m])] ?? m,
    );
  return fragment(
    element("h2", { class: "creation-section-heading" }, "Your starting kit"),
    "\n",
    element(
      "p",
      { class: "small muted" },
      "Class and Career equipment is included automatically, with armour and bags worn and weapons equipped.",
    ),
    "\n",
    element(
      "div",
      { class: "kit-summary" },
      joinNodes(
        fixed.map((x) =>
          element(
            "span",
            { class: "kit-item" },
            element("strong", {}, esc(rolled(x))),
            tag(x),
            element("small", {}, esc(x.origin)),
          ),
        ),
        "",
      ),
    ),
    choices.length
      ? fragment(
          element(
            "h3",
            {},
            "Choose your equipment ",
            element(
              "span",
              { class: "counter" },
              choices.length,
              " choice",
              choices.length === 1 ? "" : "s",
            ),
          ),
          joinNodes(
            choices.map((x) =>
              element(
                "div",
                { class: "field" },
                element(
                  "label",
                  { for: ["gear-", esc(x.key)].join("") },
                  esc(x.origin),
                  " · ",
                  esc(x.name),
                ),
                select(
                  interpolate(
                    ['id="gear-', '" data-bind="gearChoices" data-key="', '"'],
                    [esc(x.key), esc(x.key)],
                  ),
                  gearOptions(x.name, R),
                  s.gearChoices[x.key] || gearOptions(x.name, R)[0],
                ),
              ),
            ),
            "",
          ),
        )
      : "",
    slots.some(
      (x) =>
        /\d+d10/.test(x.name) &&
        !Object.keys(s.gearRolls).some((k) =>
          k.startsWith(combine(x.key, ":")),
        ),
    )
      ? button(
          "gear-quantities",
          "Roll unresolved item quantities",
          "",
          "primary",
        )
      : "",
  );
}

export function comparisonHTML(before, after) {
  const rows = careerDifferences(before, after);
  return rows.length
    ? element(
        "details",
        { "data-detail-key": detailKey("flow-ui:comparisonHTML:0"), open: "" },
        element("summary", {}, "Profile changes"),
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
                element("th", {}, "Choice"),
                element("th", {}, "Current"),
                element("th", {}, "After change"),
              ),
            ),
            element(
              "tbody",
              {},
              joinNodes(
                rows.map((x) =>
                  element(
                    "tr",
                    {},
                    element("th", {}, esc(x.label)),
                    element("td", {}, esc(x.before)),
                    element("td", {}, esc(x.after)),
                  ),
                ),
                "",
              ),
            ),
          ),
          "\n",
        ),
        "\n",
      )
    : element(
        "p",
        { class: "small muted" },
        "The Career profile is unchanged; dependent choices will be recalculated.",
      );
}
