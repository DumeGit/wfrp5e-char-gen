import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../../components/react-elements";
import { detailKey } from "../../../../engine/disclosures.mjs";
import * as M from "../../../../engine/rules.mjs";
import { assembleBooks } from "../../../../engine/books.mjs";
import { calculation } from "../../../../engine/workspace.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function dialog(title, body) {
    getContext().showDialog(title, body);
  }

  function lockCreationControls() {}

  function sourceInfo(bookId, p) {
    let { R, library, esc } = getContext();

    const b =
      R.books.find((b) => b.id === bookId) ||
      library.packs.find((x) => x.manifest.id === bookId)?.manifest;
    dialog(
      "Book reference",
      fragment(
        element("h3", {}, esc(b?.title || bookId)),
        p
          ? element("p", {}, element("strong", {}, "Printed page ", esc(p)))
          : "",
        element(
          "p",
          { class: "small muted" },
          "This is the source of the displayed rule or profile. An older source does not by itself mean an adaptation. Legacy badges explain actual changes separately.",
        ),
        "\n",
        element(
          "details",
          { "data-detail-key": detailKey("dialogs:sourceInfo:0") },
          element("summary", {}, "Supplied source file"),
          element(
            "p",
            { class: "small" },
            esc(b?.source?.file || "Supplied Fifth Edition core book"),
          ),
          "\n",
        ),
      ),
    );
  }

  function showCalculation(kind, name) {
    let { R, s, result, esc, page } = getContext();

    const model = calculation(R, s, kind, name, result());
    dialog(
      model.title,
      fragment(
        element(
          "dl",
          { class: "calculation-breakdown" },
          joinNodes(
            model.rows.map(([label, value]) =>
              element(
                "div",
                {},
                element("dt", {}, esc(label)),
                element("dd", {}, esc(value)),
              ),
            ),
            "",
          ),
        ),
        element("p", { class: "small muted" }, esc(model.note)),
        name === "Capacity" ? page("40, 127, 299") : "",
      ),
    );
  }

  function freeMagicPicker(index) {
    let { R, s, esc, spellDescription, button } = getContext();

    let offset = 0,
      grant;
    for (const g of M.spellGrants(R, s)) {
      if (index >= offset && index < combine(offset, g.count)) {
        grant = g;
        break;
      }
      offset += g.count;
    }
    if (!grant) throw Error("That free magic choice is no longer available.");
    dialog(
      interpolate(
        ["Choose free ", " · ", ""],
        [grant.category === "Old Faith" ? "Blessing" : "magic", grant.talent],
      ),
      fragment(
        element(
          "p",
          { class: "small muted" },
          grant.count,
          " distinct free choices from this grant. This choice costs 0 XP and earns no tracker box.",
        ),
        "\n",
        element(
          "div",
          { class: "field" },
          element(
            "label",
            { for: "free-magic-search" },
            "Search eligible profiles",
          ),
          element("input", {
            id: "free-magic-search",
            type: "search",
            "data-dialog-search": "free",
            placeholder: "Name or effect",
          }),
        ),
        "\n",
        element(
          "div",
          { class: "free-magic-results" },
          joinNodes(
            grant.choices.map((x) => {
              const duplicate = s.spells.some(
                (name, i) =>
                  i !== index &&
                  name === x.name &&
                  (grant.category === "Old Faith" ||
                    (i >= offset && i < combine(offset, grant.count))),
              );
              return element(
                "article",
                {
                  "data-dialog-row": esc(
                    interpolate(["", " ", ""], [x.name, x.text]).toLowerCase(),
                  ),
                },
                spellDescription({
                  ...x,
                  lore: grant.category,
                  talent: grant.talent,
                }),
                button(
                  "choose-free-magic",
                  duplicate ? "Already selected" : "Choose · 0 XP",
                  interpolate(
                    ['data-index="', '" data-name="', '" ', ""],
                    [index, esc(x.name), duplicate ? "disabled" : ""],
                  ),
                  "quiet purchase-button",
                ),
              );
            }),
            "",
          ),
        ),
      ),
    );
  }

  function showImpact(label, apply, comparison = "", bind = "career") {
    let { pendingChange, button, esc } = getContext();

    const broad = ["species", "origin"].includes(bind),
      talentsOnly = bind === "originTalentMode";
    const changes = broad
      ? [
          "Species and Career Skill allocations, selected specialisations and starting Talents are cleared.",
          "Career roll choices, starting increases, equipment, purchases and wealth are reset.",
          "Regional options are recalculated; an unavailable Career is cleared so you can choose or roll again.",
        ]
      : talentsOnly
        ? [
            "Starting Talent choices, random Talent results, the Psychometry trade and free magic choices are cleared.",
          ]
        : [
            "Career Skill allocations, selected specialisations, the free Career Talent and free magic choices are cleared.",
            "Career equipment, purchases and wealth are reset; affected starting increases are recalculated.",
          ];
    setContext("pendingChange", (pendingChange = apply));
    dialog(
      label,
      fragment(
        element("p", {}, "Here is what applying this choice changes:"),
        "\n",
        element(
          "ul",
          { class: "impact-list" },
          joinNodes(
            changes.map((x) => element("li", {}, esc(x))),
            "",
          ),
          element(
            "li",
            {},
            "Existing dice history is kept. ",
            broad
              ? "Other identity text is retained; a Species change clears its name/appearance suggestion fields."
              : "Species grants and identity are retained.",
          ),
        ),
        comparison,
        element(
          "p",
          { class: "small muted" },
          "You can undo this choice until your next character edit or roll.",
        ),
        "\n",
        element(
          "div",
          { class: "actions" },
          button("confirm-change", "Apply change", "", "primary"),
          button("close-dialog", "Keep current choices"),
        ),
      ),
    );
  }

  function proposedCareer(bind, key, value, checked) {
    let { s, R, library } = getContext();

    const next = structuredClone(s);
    let catalog = R;
    if (bind === "career" || bind === "dwarfCareerProfile") {
      next.career = value;
      delete next.dwarfCareerUpdates;
      if (next.highElf) delete next.highElf.careerVariant;
    }
    if (bind === "dwarfCareerUpdate") {
      (next.dwarfCareerUpdates ??= {})[key] = value;
      if (!value) delete next.dwarfCareerUpdates[key];
    }
    if (bind === "dwarfTrappingSwaps") next.dwarfTrappingSwaps = checked;
    if (bind === "elfChoice" && key === "careerVariant")
      (next.highElf ??= {}).careerVariant = value;
    if (bind === "careerVariant")
      catalog = assembleBooks(library, [
        ...R.selection
          .filter((b) => b.id !== "archives-iii-hedge")
          .map((b) => b.id),
        ...(value ? [value] : []),
      ]);
    return M.career(catalog, next);
  }

  function jumpToIssue(step, target) {
    let { setupOpen, s, render } = getContext();

    setContext("setupOpen", (setupOpen = false));
    s.step = Number(step);
    render();
    const epoch = getContext().taskEpoch;
    requestAnimationFrame(() => {
      if (!getContext().isCurrentTask(epoch)) return;
      const ownedRoot = document.querySelector('[data-mode="player"] #app');
      if (!ownedRoot) return;
      const node =
        ownedRoot.querySelector(target) || ownedRoot.querySelector("main h1");
      for (
        let parent = node?.parentElement;
        parent;
        parent = parent.parentElement
      )
        if (parent.tagName === "DETAILS") parent.open = true;
      node?.scrollIntoView({ block: "center", behavior: "instant" });
      if (node) {
        if (!node.matches("input,select,textarea,button,summary"))
          node.tabIndex = -1;
        node.focus({ preventScroll: true });
        node.classList.add("choice-highlight");
        setTimeout(() => node.classList.remove("choice-highlight"), 2400);
      }
    });
  }
  return {
    dialog,
    lockCreationControls,
    sourceInfo,
    showCalculation,
    freeMagicPicker,
    showImpact,
    proposedCareer,
    jumpToIssue,
  };
}
