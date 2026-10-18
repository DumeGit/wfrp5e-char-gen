import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
import { chapterHeading } from "./design-system.mjs";
import { randomTable } from "../../../engine/books.mjs";
import { sourceLabel } from "../../../engine/sources.mjs";
import { LEGACY_EXPLANATION } from "./legacy.mjs";
import { careerSpecies } from "../../../engine/origins.mjs";
import { isCareerVariant } from "./career-variants.mjs";
import { bookSummary, esc } from "../../../engine/workspace.mjs";

export function bookPanel(library, R) {
  return element(
    "div",
    { class: "selected-books" },
    element(
      "span",
      {},
      element(
        "strong",
        {},
        R.books.filter((b) => !isCareerVariant(b.id)).length,
        " selected books",
      ),
      element(
        "small",
        {},
        joinNodes(
          R.books
            .filter((b) => !isCareerVariant(b.id))
            .map((b) => esc(b.shortTitle || b.title)),
          " · ",
        ),
      ),
    ),
    element(
      "button",
      { type: "button", class: "quiet", "data-action": "books" },
      "Choose books",
    ),
  );
}

export function bookSetup(library, R) {
  const enabled = new Set(R.selection.map((x) => x.id));
  return fragment(
    element("span", { class: "eyebrow" }, "Before you begin"),
    chapterHeading("Choose your books"),
    "\n",
    element(
      "p",
      { class: "muted" },
      "Select the supplied books you want to use for this character. Fifth Edition core rules remain the foundation.",
    ),
    "\n",
    element(
      "div",
      { class: "notice" },
      "Changing books starts a new character. Career variants are chosen later in Career; selecting a supplement does not enable every optional rule.",
    ),
    "\n",
    element(
      "div",
      { class: "book-grid" },
      joinNodes(
        library.packs
          .filter((x) => !isCareerVariant(x.manifest.id))
          .map((pack) => {
            const b = pack.manifest;
            return element(
              "label",
              { class: "book-card" },
              element("input", {
                type: "checkbox",
                "data-book": esc(b.id),
                ...attributes(enabled.has(b.id) ? "checked" : ""),
                ...attributes(b.kind === "core" ? "disabled" : ""),
              }),
              element(
                "span",
                {},
                element("strong", {}, esc(b.title)),
                element(
                  "small",
                  {},
                  b.kind === "core"
                    ? "Required core rules"
                    : "Additional character options",
                ),
                element("p", {}, esc(bookSummary(pack))),
                "\n",
              ),
            );
          }),
        "",
      ),
    ),
    "\n",
    element(
      "p",
      { class: "small muted" },
      esc(LEGACY_EXPLANATION),
      " Each character option keeps its own book and page reference.",
    ),
    "\n",
    element(
      "div",
      { class: "actions" },
      element(
        "button",
        { type: "button", class: "primary", "data-action": "apply-books" },
        "Use selected books",
      ),
      element(
        "button",
        { type: "button", class: "quiet", "data-action": "books-cancel" },
        "Return to character",
      ),
    ),
  );
}

export function tablePicker(R, s, kind) {
  const available = R.tables.filter(
      (x) =>
        x.kind === kind &&
        (kind !== "career" || x.species === careerSpecies(R, s)) &&
        (!x.origin || x.origin === s.origin) &&
        (!x.origins || x.origins.includes(s.origin)),
    ),
    active = randomTable(R, s, kind);
  const reference = active
    ? element(
        "button",
        {
          type: "button",
          class: "source-button",
          "data-action": "source-info",
          "data-book": esc(active.source.book),
          "data-page": esc(active.source.page),
        },
        esc(sourceLabel(R, active)),
      )
    : "";
  if (available.length < 2 && active)
    return element(
      "p",
      { class: "small muted roll-source" },
      "Rolls use ",
      esc(active.name),
      " · ",
      reference,
      ".",
    );
  if (!available.length)
    return element(
      "p",
      { class: "small muted" },
      "No implemented printed roll table for this selection; choose directly.",
    );
  return element(
    "div",
    { class: "field table-picker" },
    element("label", { for: ["table-", kind].join("") }, "Roll using"),
    element(
      "select",
      {
        id: ["table-", kind].join(""),
        "data-bind": "rollTable",
        "data-key": kind,
      },
      !active
        ? element("option", { value: "" }, "Choose a printed table…")
        : "",
      joinNodes(
        available.map((x) =>
          element(
            "option",
            {
              value: esc(x.id),
              ...attributes(x.id === active?.id ? "selected" : ""),
            },
            esc(combine(combine(x.name, " · "), sourceLabel(R, x))),
          ),
        ),
        "",
      ),
    ),
    element(
      "small",
      { class: "muted" },
      "Printed probabilities are retained. This changes the table for future rolls. ",
      reference,
    ),
  );
}
