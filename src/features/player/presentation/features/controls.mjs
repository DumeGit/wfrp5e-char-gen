import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../../components/react-elements";
import { button as sharedButton } from "../controls.mjs";
import { runeChoiceDescription } from "../dwarf-guide-ui.mjs";
import * as M from "../../../../engine/rules.mjs";
import { characteristicNames } from "../../../../engine/ui.mjs";
import { gearSlots } from "../../../../engine/equipment.mjs";
import { sourceLabel } from "../../../../engine/sources.mjs";
import { legacyTag, legacyName, legacySources } from "../legacy.mjs";
import {
  legacyOption,
  legacyGear,
  legacyMagic,
} from "../../../../engine/legacy-character.mjs";
import { talentCalculation } from "../../../../engine/workspace.mjs";
import { creationSpecies } from "../../../../engine/origins.mjs";
import { RuleName } from "../../../../components/RuleReference";
import { entryReference } from "../../../../engine/entry-reference.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function selectionEntry(attrs, value) {
    let { R, s } = getContext();

    const bind = attrs.match(/data-bind="([^"]+)"/)?.[1],
      key = attrs.match(/data-key="([^"]+)"/)?.[1];
    if (bind === "species") return R.species[value];
    if (bind === "origin") return R.origins.find((x) => x.id === value);
    if (["career", "freeTalent"].includes(bind))
      return bind === "career"
        ? R.careers.find((x) => x.id === value)
        : legacyOption(R, s, "talent", value);
    if (bind === "skillChoices")
      return {
        ...legacyOption(R, s, "skill", value),
        legacySources: [
          ...(legacyOption(R, s, "skill", value).legacySources || []),
          ...(key?.startsWith("s-")
            ? legacySources(R, creationSpecies(R, s))
            : []),
        ].filter(Boolean),
      };
    if (bind === "talentChoices")
      return {
        ...legacyOption(R, s, "talent", value),
        legacySources: legacyOption(R, s, "talent", value).legacySources,
      };
    if (bind === "gearChoices") {
      const slot = gearSlots(R, s).find((x) => x.key === key);
      return slot ? legacyGear(R, s, slot, value) : null;
    }
    return null;
  }

  function select(attrs, items, value, empty = false) {
    let { esc, R } = getContext();
    return element(
      "select",
      { ...attributes(attrs) },
      empty
        ? element(
            "option",
            { value: "" },
            typeof empty === "string" ? empty : "Choose…",
          )
        : "",
      joinNodes(
        items.map((x) => {
          const [v, label, disabled] = Array.isArray(x) ? x : [x, x];
          return element(
            "option",
            {
              value: esc(v),
              ...attributes(disabled ? "disabled" : ""),
              ...attributes(v === value ? "selected" : ""),
            },
            esc(
              String(label).includes("Legacy")
                ? label
                : legacyName(R, selectionEntry(attrs, v), label),
            ),
          );
        }),
        "",
      ),
    );
  }

  function button(action, label, attrs = "", style = "quiet") {
    return sharedButton(label, action, attrs, style);
  }

  function page(p) {
    let { esc } = getContext();
    return element(
      "button",
      {
        type: "button",
        class: "source source-button",
        "data-action": "source-info",
        "data-book": "core",
        "data-page": esc(p),
      },
      "p. ",
      esc(p),
    );
  }

  function ref(x) {
    let { esc, R } = getContext();
    return fragment(
      element(
        "button",
        {
          type: "button",
          class: "source source-button book-reference",
          "data-action": "source-info",
          "data-book": esc(x?.source?.book || "core"),
          "data-page": esc(x?.source?.page || x?.page || ""),
        },
        esc(sourceLabel(R, x, { legacy: false })),
      ),
      legacyTag(R, x),
    );
  }

  function skillChoice(slot) {
    let { R, s, esc } = getContext();

    const opts = M.options(R, slot.raw, "skill", s);
    return opts.length > 1
      ? select(
          interpolate(
            ['data-bind="skillChoices" data-key="', '" aria-label="', '"'],
            [slot.key, esc(slot.raw)],
          ),
          opts,
          slot.name,
        )
      : fragment(
          element("strong", {}, esc(slot.name)),
          legacyTag(R, {
            ...legacyOption(R, s, "skill", slot.name),
            legacySources: [
              ...legacyOption(R, s, "skill", slot.name).legacySources,
              ...(slot.key.startsWith("s-")
                ? legacySources(R, creationSpecies(R, s))
                : []),
            ].filter(Boolean),
          }),
        );
  }

  function talentDescription(name, { quote = null, metadata = "" } = {}) {
    let { R, s, esc } = getContext();

    const t = M.talentInfo(R, name),
      context = legacyOption(R, s, "talent", name),
      sources = [...context.legacySources, ...legacySources(R, quote)];
    return element(
      "div",
      { class: "talent-description" },
      element(
        RuleName,
        { reference: entryReference("talent", { ...t, name }) },
        fragment(esc(name), metadata),
      ),
      element(
        "p",
        { class: "small talent-reference" },
        ref({ ...t, legacySources: sources }),
      ),
      element(
        "p",
        { class: "calculation-status" },
        esc(talentCalculation(R, name)),
      ),
    );
  }

  function talentDetailsBody(name, { text, includeNotes = true } = {}) {
    const { R, esc } = getContext(),
      t = M.talentInfo(R, name);
    return fragment(
      element(
        "p",
        {},
        esc(
          text ?? t?.text ?? "See the supplied Career and Talent descriptions.",
        ),
      ),
      t?.limit
        ? element(
            "p",
            { class: "small muted" },
            includeNotes ? "Printed purchase limit" : "Purchase limit",
            ": ",
            esc(
              Array.isArray(t.limit)
                ? joinNodes(
                    t.limit.map((k) =>
                      combine(characteristicNames[k], " Bonus"),
                    ),
                    " + ",
                  )
                : t.limit,
            ),
            ".",
          )
        : "",
      includeNotes
        ? fragment(
            t?.conversion
              ? element("p", { class: "small muted" }, esc(t.conversion))
              : "",
            element(
              "p",
              { class: "calculation-status" },
              esc(talentCalculation(R, name)),
            ),
          )
        : "",
      runeChoiceDescription(R, name),
      includeNotes && t?.unavailable
        ? element("p", { class: "purchase-error" }, esc(t.unavailable))
        : "",
    );
  }

  function characteristicClass(k) {
    let { R, s, result } = getContext();

    const unlock = M.career(R, s).advanceScheme[k];
    return unlock
      ? interpolate(
          ["career-characteristic career-level-", " ", ""],
          [
            unlock,
            result().derived.level >= unlock
              ? "career-current"
              : "career-future",
          ],
        )
      : "career-none";
  }

  function characteristicTitle(k) {
    let { R, s, result } = getContext();

    const unlock = M.career(R, s).advanceScheme[k];
    return unlock
      ? interpolate(
          ["Career level ", " · ", ""],
          [
            unlock,
            result().derived.level >= unlock
              ? "currently available"
              : "currently non-career",
          ],
        )
      : "Non-career Characteristic";
  }

  function characteristicBadge(k, compact = true) {
    let { R, s, result, esc } = getContext();

    const unlock = M.career(R, s).advanceScheme[k];
    if (!unlock)
      return compact
        ? ""
        : element("span", { class: "characteristic-badge" }, "Non-career");
    const available = result().derived.level >= unlock;
    return element(
      "span",
      { class: "characteristic-badge", title: esc(characteristicTitle(k)) },
      compact
        ? interpolate(["L", "", ""], [unlock, available ? " · ✓" : ""])
        : interpolate(
            ["Career L", " · ", ""],
            [unlock, available ? "✓ available" : "later level"],
          ),
    );
  }

  function characteristicLegend({ compact = false } = {}) {
    return fragment(
      element(
        "div",
        {
          class: "career-legend",
          "aria-label": "Career Characteristic colours",
        },
        joinNodes(
          [1, 2, 3, 4].map((level) =>
            element(
              "span",
              { class: ["career-level-", level].join("") },
              element("i", { "aria-hidden": "true" }),
              "Level ",
              level,
              level === 1 ? " · starting" : "",
            ),
          ),
          "",
        ),
      ),
      "\n",
      compact
        ? ""
        : element(
            "p",
            { class: "small muted" },
            "✓ marks currently available Career Characteristics. Later levels become Career Characteristics when you reach that level; non-career purchases cost double. ",
            page(191),
          ),
    );
  }

  function spellDetailsBody(x, { includeCreatorNote = true } = {}) {
    let { esc } = getContext();

    const fields = [
        ["CN", "cn"],
        ["Range", "range"],
        ["Target", "target"],
        ["Duration", "duration"],
      ].filter(([, key]) => x[key] != null && x[key] !== ""),
      prefix = joinNodes(
        fields.map(([label, key]) =>
          interpolate(["", ": ", ""], [label, x[key]]),
        ),
        " ",
      );
    const effect = x.text.startsWith(prefix)
      ? x.text.slice(prefix.length).trim()
      : x.text;
    return fragment(
      includeCreatorNote
        ? element(
            "p",
            { class: "calculation-status" },
            "Reference for play: casting, targets and situational effects are not applied during creation.",
          )
        : "",
      "\n",
      element(
        "dl",
        { class: "spell-meta" },
        joinNodes(
          fields.map(([label, key]) =>
            element(
              "div",
              {},
              element("dt", {}, label),
              element("dd", {}, esc(x[key])),
            ),
          ),
          "",
        ),
      ),
      element("p", {}, esc(effect)),
    );
  }

  function spellDescription(x) {
    let { R, s, esc } = getContext();

    x = legacyMagic(R, s, x);
    return element(
      "div",
      { class: "spell-description" },
      element(
        RuleName,
        { reference: entryReference("spell", x) },
        fragment(esc(x.displayName || x.name), " · ", esc(x.category)),
      ),
      element("p", { class: "small" }, ref(x)),
      element(
        "p",
        { class: "small" },
        [
          x.cn !== undefined ? `CN ${x.cn}` : "",
          x.range ? `Range ${x.range}` : "",
          x.target ? `Target ${x.target}` : "",
          x.duration ? `Duration ${x.duration}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
      ),
      x.grantSource
        ? element(
            "p",
            { class: "small muted" },
            "Available through ",
            esc(x.lore),
            " · ",
            ref({ source: x.grantSource }),
            ". Reimagined for this patron using the core Miracle’s effects.",
          )
        : "",
      x.conversion
        ? element("p", { class: "small muted" }, esc(x.conversion))
        : "",
    );
  }

  return {
    selectionEntry,
    select,
    button,
    page,
    ref,
    skillChoice,
    talentDescription,
    talentDetailsBody,
    characteristicClass,
    characteristicTitle,
    characteristicBadge,
    characteristicLegend,
    spellDetailsBody,
    spellDescription,
  };
}
