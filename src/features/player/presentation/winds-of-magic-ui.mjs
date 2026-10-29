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
import {
  sourceButton,
  legacySummary,
  referenceSummary,
} from "./source-controls.mjs";
import { detailKey } from "../../../engine/disclosures.mjs";
import { legacyTag, legacyMechanic } from "./legacy.mjs";
import { speciesLoreIssue } from "../../../engine/species-mechanics.mjs";
import {
  windsOfMagic,
  affiliatedCareer,
  collegeCareer,
  collegeLore,
  collegeLores,
  startingScryer,
  psychometrySacrifice,
  womReferences,
  quoteRitual,
  mundaneAlchemist,
} from "../../../engine/winds-of-magic.mjs";
import { derive } from "../../../engine/rules.mjs";
import { creationSpecies } from "../../../engine/origins.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function collegePanel(R, s) {
  if (!windsOfMagic(R) || !affiliatedCareer(s)) return "";
  return element(
    "section",
    { class: "notice" },
    element("strong", {}, "College affiliation · Winds of Magic p. 35"),
    collegeCareer(s)
      ? element("p", {}, esc(collegeLore(s)), " · fixed by this Career.")
      : element(
          "div",
          { class: "field" },
          element("label", { for: "college-lore" }, "College Lore"),
          element(
            "select",
            { id: "college-lore", "data-bind": "college" },
            element("option", { value: "" }, "Choose…"),
            joinNodes(
              collegeLores
                .filter((l) => !speciesLoreIssue(R, s, l))
                .map((l) =>
                  element(
                    "option",
                    {
                      value: l,
                      ...attributes(s.college === l ? "selected" : ""),
                    },
                    l,
                  ),
                ),
              "",
            ),
          ),
        ),
    element(
      "p",
      { class: "small" },
      "Your first Arcane Magic Talent must match your College. Follow its traditions and arcane marks; later Elf Lores still follow Fifth Edition’s requirements.",
    ),
    "\n",
  );
}
export function psychometryPanel(R, s) {
  if (!windsOfMagic(R) || s.species !== "Human") return "";
  if (startingScryer(s))
    return element(
      "div",
      { class: "notice" },
      "Starting Scryer: Psychometry is a normal Career Skill option. Allocate your eight free Advances as usual; no Species Talent sacrifice is required (Winds of Magic p. 48).",
    );
  const count = creationSpecies(R, s).randomTalents;
  if (!count)
    return element(
      "p",
      { class: "small muted" },
      "This origin has no random Species Talent to trade for Psychometry (Winds of Magic p. 48).",
    );
  const blocked = derive(R, s).skills.Augury > 0;
  return element(
    "details",
    {
      "data-detail-key": detailKey("winds-of-magic-ui:psychometryPanel:0"),
      class: "section-gap",
      ...attributes(s.psychometrySlot !== undefined ? "open" : ""),
    },
    legacySummary(
      "Optional Psychometry · Winds of Magic p. 48",
      legacyTag(R, legacyMechanic("psychometry")),
    ),
    element(
      "p",
      { class: "small" },
      "Give up one random Species Talent to unlock paid Psychometry advancement. This grants no free points. Advancement requires one of the printed magical or religious Careers; non-career prices apply. Augury and Psychometry are mutually exclusive.",
    ),
    !s.randomTalents.length
      ? element(
          "p",
          { class: "small muted" },
          "Roll your random Species Talents first.",
        )
      : element(
          "div",
          { class: "field" },
          element(
            "label",
            { for: "psychometry-talent" },
            "Species Talent to give up",
          ),
          element(
            "select",
            { id: "psychometry-talent", "data-bind": "psychometrySlot" },
            element("option", { value: "" }, "Keep all random Talents"),
            joinNodes(
              s.randomTalents.map((t, i) =>
                element(
                  "option",
                  {
                    value: i,
                    ...attributes(s.psychometrySlot === i ? "selected" : ""),
                    ...attributes(
                      blocked ||
                        s.originTalentSlot === interpolate(["random-", ""], [i])
                        ? "disabled"
                        : "",
                    ),
                  },
                  esc(t),
                  s.originTalentSlot === interpolate(["random-", ""], [i])
                    ? " · already replaced"
                    : "",
                ),
              ),
              "",
            ),
          ),
          blocked
            ? element(
                "p",
                { class: "purchase-error" },
                "You already have an Augury Advance; you cannot also take Psychometry.",
              )
            : "",
        ),
    psychometrySacrifice(R, s)
      ? element(
          "p",
          { class: "small" },
          esc(s.randomTalents[s.psychometrySlot]),
          " is removed from your Talent grants. Its original roll remains in your dice record.",
        )
      : "",
  );
}
export function psychicSkillPanel(R, s) {
  return !windsOfMagic(R)
    ? ""
    : element(
        "section",
        {
          "data-detail-key": detailKey("winds-of-magic-ui:psychicSkillPanel:0"),
          class: "section-gap",
        },
        element("h3", {}, "Augury & Psychometry · Winds of Magic pp. 44–48"),
        joinNodes(
          R.skills
            .filter((x) => ["Augury", "Psychometry"].includes(x.name))
            .map((x) =>
              element(
                "div",
                { class: "rule-entry" },
                element(
                  RuleName,
                  { reference: entryReference("skill", x) },
                  fragment(x.name, " (", x.char, ")"),
                ),
                sourceButton(R, x),
              ),
            ),
          "",
        ),
        element(
          "p",
          {},
          "Augury becomes a first-level option for Mystic; Nun with Morr or Sigmar; and Priest or Warrior Priest with Morr. Choose the matching Bless/Invoke patron in Talents to expose those conditional options. Starting Astromancers already have Augury in their Career.",
        ),
        "\n",
        element(
          "p",
          {},
          "Other Humans can trade one random Species Talent in Talents for paid Psychometry access. Starting Scryers need no trade.",
        ),
        "\n",
      );
}
export function womReferencePanel(R, s) {
  return joinNodes(
    womReferences(R, s).map((x) =>
      element(
        "div",
        { class: "notice" },
        element(
          "strong",
          {},
          "Winds of Magic p. ",
          x.source.page,
          " ",
          legacyTag(R, x),
        ),
        element("p", { class: "small" }, esc(x.text)),
        "\n",
      ),
    ),
    "",
  );
}
export function pettyGrantNote(R, s, g) {
  return windsOfMagic(R) && mundaneAlchemist(s) && g.talent === "Petty Magic"
    ? element(
        "p",
        { class: "small muted" },
        legacyTag(R, legacyMechanic("alchemist")),
        " Mundane Alchemist: choose only Bearings, Open Lock, Shock and Warning. Your free grant is the smaller of your Willpower Bonus when you learned Petty Magic or four, using the approved Fifth Edition adaptation (Winds of Magic p. 39; core p. 123).",
      )
    : "";
}
export function womGearPanel(R) {
  if (!windsOfMagic(R)) return "";
  return element(
    "details",
    {
      "data-detail-key": detailKey("winds-of-magic-ui:womGearPanel:0"),
      class: "section-gap",
    },
    element(
      "summary",
      {},
      "Wizard robes & enchanted staffs · Winds of Magic pp. 151–152",
    ),
    joinNodes(
      R.gear
        .filter(
          (x) =>
            x.source.book === "winds-of-magic" &&
            ["Wizard robes", "Magical artefacts"].includes(x.category),
        )
        .map((x) =>
          element(
            "p",
            {},
            element("strong", {}, esc(x.name)),
            " · p. ",
            x.page,
            element("br", {}),
            esc(x.text),
          ),
        ),
      "",
    ),
    element(
      "p",
      { class: "small" },
      "Robes can be bought in Gear & money → Shop at their printed second-hand illicit-market prices. Staff commissioning is deferred; learning Imbue Staff does not create an item in this character creator.",
    ),
    "\n",
  );
}
export function ritualShop(R, s, creationErrors = []) {
  if (!windsOfMagic(R)) return "";
  return element(
    "details",
    {
      "data-detail-key": detailKey("winds-of-magic-ui:ritualShop:1"),
      class: "section-gap",
    },
    element("summary", {}, "Learn rituals · Winds of Magic pp. 27–33"),
    element(
      "p",
      { class: "small" },
      "Memorising a ritual uses its own printed XP cost and earns no tracker box. It does not count as a spell toward new-spell prices, extra Elf Lores or Cants. Performing rituals, sacrifices and resulting creatures/items are deferred.",
    ),
    joinNodes(
      R.spells
        .filter((x) => x.ritual)
        .map((x) => {
          const q = quoteRitual(R, s, x.name),
            reason =
              q.error ||
              (creationErrors.length
                ? "Finish creation before spending XP."
                : "");
          return element(
            "div",
            { class: "xp-row" },
            element(
              "div",
              { class: "rule-entry" },
              element(RuleName, { reference: entryReference("spell", x) }),
              element(
                "p",
                { class: "small" },
                fragment(legacyTag(R, x), " ", sourceButton(R, x)),
              ),
            ),
            "\n",
            element(
              "div",
              {},
              element(
                "button",
                {
                  type: "button",
                  class: "primary",
                  "data-action": "buy-spell",
                  "data-name": esc(x.name),
                  "data-talent": esc(q.talent),
                  ...attributes(reason ? "disabled" : ""),
                },
                q.cost,
                " XP",
              ),
              reason
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
    ),
  );
}
