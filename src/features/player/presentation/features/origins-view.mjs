import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../../components/react-elements";
import { chapterHeading } from "../design-system.mjs";
import { sourceButton } from "../source-controls.mjs";
import { elfOriginPanel } from "../high-elf-ui.mjs";
import { dwarfOriginPanel } from "../dwarf-guide-ui.mjs";
import { bookName, nameParts } from "../../../../engine/background.mjs";

import { bookPanel, tablePicker } from "../book-ui.mjs";
import {
  creationSpecies,
  creationBackground,
  originProfile,
} from "../../../../engine/origins.mjs";
import {
  speciesRulePanel,
  nameStylePanel,
  nameElementPanel,
} from "../archives-ui.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function originSuggestionField(label, key, kind, value, isName = false) {
    let { R, s, esc, select, button } = getContext();

    const b = creationBackground(R, s);
    if (isName && key === "forename" && b.nameElements)
      return element(
        "div",
        { class: "field" },
        element("label", { for: "origin-forename" }, "Given name"),
        element("input", {
          id: "origin-forename",
          type: "text",
          "data-bind": "namePart",
          "data-key": "forename",
          value: esc(value || ""),
          placeholder: "Write your own or combine the elements below",
          maxlength: "90",
        }),
      );
    const choices = b[kind].map((x) => [isName ? bookName(x) : x, x]),
      id = interpolate(["origin-", ""], [key]),
      selected = choices.some(([v]) => v === value) ? value : "";
    return element(
      "div",
      { class: "field origin-suggestion" },
      element("label", { for: id }, label),
      element(
        "div",
        { class: "origin-input-roll" },
        element("input", {
          id: id,
          type: "text",
          "data-bind": isName ? "namePart" : "background",
          "data-key": key,
          value: esc(value || ""),
          placeholder: ["Write your own ", label.toLowerCase()].join(""),
          maxlength: isName ? 90 : 80,
        }),
        button(
          isName ? "roll-name-part" : "roll-appearance",
          "⚄",
          interpolate(
            [
              'data-key="',
              '" data-kind="',
              '" aria-label="Roll ',
              '" title="Roll ',
              '"',
            ],
            [key, kind, label.toLowerCase(), label.toLowerCase()],
          ),
        ),
      ),
      element(
        "div",
        { class: "origin-suggestion-tools" },
        select(
          interpolate(
            [
              'id="book-',
              '" data-bind="',
              '" data-key="',
              '" aria-label="Choose ',
              ' from the book"',
            ],
            [
              key,
              isName ? "bookName" : "backgroundChoice",
              key,
              label.toLowerCase(),
            ],
          ),
          choices,
          selected,
          "Book suggestions…",
        ),
      ),
      "\n",
    );
  }

  function regionalOrigins() {
    let { R, s, select, esc, ref } = getContext();

    const choices = R.origins.filter((x) => x.species === s.species),
      o = originProfile(R, s);
    if (!choices.length) return "";
    return fragment(
      element(
        "div",
        { class: "field section-gap" },
        element("label", { for: "regional-origin" }, "Origin / clan"),
        select(
          'id="regional-origin" data-bind="origin"',
          [
            ["", interpolate(["Core ", ""], [s.species])],
            ...choices.map((x) => [x.id, x.name]),
          ],
          s.origin || "",
        ),
      ),
      o
        ? element(
            "p",
            { class: "small muted" },
            esc(o.name),
            " · ",
            ref(o),
            ". Native languages: ",
            esc(joinNodes(creationSpecies(R, s).languages, " and ")),
            ". Regional choices use Fifth Edition creation allocations.",
            o.text ? fragment(element("br", {}), esc(o.text)) : "",
          )
        : "",
    );
  }

  function lucciniTalentChoice() {
    let { R, s, select, ref } = getContext();

    const o = originProfile(R, s),
      sp = creationSpecies(R, s);
    if (!o?.optionalTalent) return "";
    const slots = [
      ...sp.talents.map((opts, i) => [
        interpolate(["species-", ""], [i]),
        s.talentChoices[interpolate(["species-", ""], [i])] || opts[0],
      ]),
      ...s.randomTalents.map((t, i) => [interpolate(["random-", ""], [i]), t]),
    ];
    return fragment(
      element(
        "div",
        { class: "field" },
        element(
          "label",
          { for: "luccini-doomed" },
          "Optional Luccinan Dooming",
        ),
        select(
          'id="luccini-doomed" data-bind="originTalentSlot"',
          [
            ["", "Keep all starting Talents"],
            ...slots.map(([key, name]) => [
              key,
              interpolate(["Replace ", " with Doomed"], [name]),
            ]),
          ],
          s.originTalentSlot || "",
        ),
      ),
      "\n",
      element(
        "p",
        { class: "small muted" },
        "Replace one regional starting Talent, rather than adding a Talent (",
        ref(o),
        "). Original random rolls remain in the record.",
      ),
    );
  }

  function origins() {
    let { R, s, library, select, button, ref, page, esc } = getContext();

    const speciesChoice = fragment(
      element(
        "div",
        { class: "origin-species" },
        element(
          "div",
          { class: "field" },
          element("label", { for: "species" }, "Species"),
          select(
            'id="species" data-bind="species"',
            Object.keys(R.species),
            s.species,
            true,
          ),
        ),
        button(
          "species-roll",
          "Roll · d100",
          'aria-label="Roll Species · d100"',
          "primary",
        ),
      ),
      tablePicker(R, s, "species"),
    );
    if (!s.species)
      return element(
        "section",
        { class: "origins-editor" },
        element("span", { class: "eyebrow" }, "01 / Origins"),
        chapterHeading("Origins & identity"),
        bookPanel(library, R),
        speciesChoice,
        element(
          "p",
          { class: "notice" },
          "Choose or roll your Species to see its starting resources, regional origins, names and appearance options.",
        ),
      );
    const sp = R.species[s.species],
      b = creationBackground(R, s),
      parts = nameParts(s),
      surnameLabel =
        s.species === "Gnome"
          ? "Clan name / epithet"
          : b.nameElements
            ? "Title / clan name"
            : s.species.includes("Elf")
              ? "Epithet"
              : s.species === "Dwarf"
                ? "Surname / clan name"
                : "Surname";
    return element(
      "section",
      { class: "origins-editor" },
      element("span", { class: "eyebrow" }, "01 / Origins"),
      chapterHeading("Origins & identity"),
      bookPanel(library, R),
      "\n",
      speciesChoice,
      element(
        "p",
        { class: "small muted" },
        s.speciesMode === "first"
          ? "+1 Fortune · first roll accepted"
          : s.speciesAttempts
            ? "Later roll / choice · no bonus"
            : "Chosen Species · no random bonus",
      ),
      "\n",
      element(
        "div",
        { class: "origin-resources" },
        element("span", {}, "Starting Fate ", element("strong", {}, sp.fate)),
        element("span", {}, "Fortune ", element("strong", {}, sp.fortune)),
        element("span", {}, "Movement ", element("strong", {}, sp.movement)),
        ref(sp),
      ),
      element(
        "details",
        {
          class: "origin-roll-help",
          "data-detail-key": "origins:roll-bonuses",
        },
        element("summary", {}, "Random creation bonuses"),
        element("p", { class: "small" }, page("23, 40")),
        element(
          "p",
          { class: "small muted" },
          "Fate and Fortune are separate values. Accepting your first Species roll adds 1 Fortune. Accepting the first Species, Career and Characteristics rolls adds 1 Fate.",
        ),
      ),
      speciesRulePanel(R, s),
      regionalOrigins(),
      dwarfOriginPanel(R, s),
      elfOriginPanel(R, s),
      element("h2", {}, "Your name ", sourceButton(R, b)),
      nameStylePanel(R, s, { select }),
      element(
        "p",
        { class: "origin-help muted" },
        "Type, choose a book suggestion or roll.",
      ),
      "\n",
      element(
        "div",
        { class: "cols" },
        originSuggestionField(
          "First name",
          "forename",
          "forenames",
          parts.forename,
          true,
        ),
        originSuggestionField(
          surnameLabel,
          "surname",
          "surnames",
          parts.surname,
          true,
        ),
      ),
      "\n",
      element(
        "div",
        { class: "identity-preview" },
        element(
          "strong",
          { "aria-live": "polite" },
          esc(s.name || "Your character"),
        ),
        button(
          "suggest-name",
          b.nameElements ? "Roll given name & title" : "Roll full name",
        ),
      ),
      nameElementPanel(R, s, { select, button }),
      element(
        "h2",
        {},
        "Appearance ",
        sourceButton(R, R.background[s.species]),
      ),
      "\n",
      element(
        "div",
        { class: "cols origin-appearance" },
        originSuggestionField("Eye colour", "eyes", "eyes", s.background?.eyes),
        originSuggestionField(
          "Hair colour",
          "hair",
          "hair",
          s.background?.hair,
        ),
      ),
      b.clans
        ? originSuggestionField(
            "Dwarf clan",
            "clan",
            "clans",
            s.background?.clan,
          )
        : "",
      element(
        "p",
        { class: "origin-help muted" },
        b.dwarfNames
          ? "Names use the printed d1000 ranges; core appearance and clan suggestions use their printed lists."
          : R.background[s.species].rollTables
            ? "Eye and hair rolls use the printed 2d10 tables."
            : "Random suggestions choose uniformly from the printed lists.",
        " All rolls are recorded.",
      ),
      "\n",
      element(
        "div",
        { class: "field" },
        element(
          "div",
          { class: "origin-field-heading" },
          element("label", { for: "appearance" }, "Age, height & background"),
          button(
            "age",
            s.longbeard
              ? "Roll height · use chosen Longbeard age"
              : "Roll age & height",
          ),
        ),
        element(
          "textarea",
          {
            id: "appearance",
            rows: "2",
            "data-bind": "appearance",
            placeholder:
              "Age, height, distinguishing features, and a few words about your past…",
          },
          esc(s.appearance),
        ),
      ),
      element(
        "div",
        { class: "cols" },
        element(
          "div",
          { class: "field" },
          element("label", { for: "ambition" }, "Personal ambition"),
          element(
            "textarea",
            {
              id: "ambition",
              rows: "2",
              "data-bind": "ambition",
              placeholder: "What are you striving for?",
            },
            esc(s.ambition),
          ),
        ),
        "\n",
        element(
          "div",
          { class: "field" },
          element("label", { for: "partyAmbition" }, "Party ambition"),
          element(
            "textarea",
            {
              id: "partyAmbition",
              rows: "2",
              "data-bind": "partyAmbition",
              placeholder: "Agree this with your group (p. 42).",
            },
            esc(s.partyAmbition),
          ),
        ),
        "\n",
      ),
      "\n",
      element(
        "p",
        { class: "origin-help muted" },
        "Biography is your character’s fiction. Rules and options come only from your selected supplied books.",
      ),
    );
  }
  return {
    originSuggestionField,
    regionalOrigins,
    lucciniTalentChoice,
    origins,
  };
}
