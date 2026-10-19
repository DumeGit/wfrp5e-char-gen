import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../../components/react-elements";
import { ledgerEmblem } from "../design-system.mjs";
import { creatorSwitch } from "../creator-switch.mjs";
import * as M from "../../../../engine/rules.mjs";
import {
  characteristicNames,
  steps,
  creationStepCount,
  experienceStep,
  reviewStep,
} from "../../../../engine/ui.mjs";
import { formatMoney } from "../../../../engine/market.mjs";
import { penaltySummary } from "../creator-ui.mjs";
import { legacyTag } from "../legacy.mjs";
import { legacyContext } from "../../../../engine/legacy-character.mjs";
import { issueTarget } from "../../../../engine/issue-targets.mjs";
import { sheetSpecies } from "../../../../engine/origins.mjs";
import { cantPanel } from "../archives-iii-ui.mjs";
export function createFeature(getContext) {
  function workspaceShell({ d, eq, c, issues, pending, body, ready }) {
    const {
      setupOpen,
      select,
      s,
      button,
      locked,
      esc,
      hasColourMagic,
      R,
      marketShop,
      summaryExpanded,
      result,
      folioMenus,
      characteristicClass,
      characteristicTitle,
    } = getContext();
    return fragment(
      element(
        "div",
        {
          class: ["workspace ", setupOpen ? "book-setup-workspace" : ""].join(
            "",
          ),
        },
        "\n",
        element(
          "aside",
          { class: "rail" },
          "\n",
          creatorSwitch(
            "player",
            typeof location !== "undefined" &&
              new URLSearchParams(location.search).has("verify"),
          ),
          "\n",
          element(
            "div",
            { class: "rail-heading" },
            "\n",
            element("span", { class: "eyebrow" }, "Character creation"),
            "\n",
            element("strong", {}, "Your next chapter"),
            "\n",
            element(
              "p",
              {},
              ready,
              " of ",
              creationStepCount,
              " required stages complete",
            ),
            "\n",
            element(
              "div",
              {
                class: "creation-meter",
                role: "img",
                "aria-label": [
                  ready,
                  " of ",
                  creationStepCount,
                  " required stages complete",
                ].join(""),
              },
              "\n",
              element(
                "span",
                {
                  style: [
                    "width:",
                    (ready / creationStepCount) * 100,
                    "%",
                  ].join(""),
                },
                "\n",
              ),
              "\n",
            ),
            "\n",
          ),
          "\n",
          element(
            "div",
            { class: "mobile-step field" },
            "\n",
            element("label", { for: "mobile-step" }, "Creation step"),
            select(
              'id="mobile-step" data-bind="stepSwitch"',
              steps.map((name, i) => [
                i,
                interpolate(["", ". ", ""], [combine(i, 1), name]),
              ]),
              s.step,
            ),
          ),
          "\n",
          element(
            "nav",
            { "aria-label": "Character creation steps" },
            "\n",
            element(
              "ol",
              { class: "steps" },
              joinNodes(
                steps.map((name, i) =>
                  element(
                    "li",
                    {},
                    "\n",
                    element(
                      "button",
                      {
                        class: i === s.step ? "active" : "",
                        ...attributes(
                          i === s.step ? 'aria-current="step"' : "",
                        ),
                        "data-action": "step",
                        "data-step": i,
                      },
                      "\n",
                      element(
                        "span",
                        { class: "step-number" },
                        i < creationStepCount && !pending[i].length
                          ? "✓"
                          : String(combine(i, 1)).padStart(2, "0"),
                      ),
                      "\n",
                      element(
                        "span",
                        {},
                        name,
                        element(
                          "small",
                          {},
                          i < creationStepCount
                            ? pending[i].length
                              ? interpolate(
                                  ["", " choice", " left"],
                                  [
                                    pending[i].length,
                                    pending[i].length === 1 ? "" : "s",
                                  ],
                                )
                              : "Ready"
                            : i === experienceStep
                              ? "Optional advances"
                              : "Sheet & creation record",
                        ),
                        "\n",
                      ),
                      "\n",
                    ),
                    "\n",
                  ),
                ),
                "",
              ),
            ),
            "\n",
          ),
          "\n",
          element("div", { "data-player-history-slot": "" }),
          element(
            "div",
            { class: "header-actions" },
            button("save-file", "Save character"),
            button("load-file", "Load character"),
            button("new", "New character"),
            element("input", {
              type: "file",
              id: "import-file",
              accept: "application/json,.json",
              hidden: "",
            }),
            "\n",
            element("div", {
              class: "install-app-slot",
              "data-install-slot": "",
            }),
            "\n",
          ),
          "\n",
          element(
            "p",
            { class: "save-status" },
            "Saved automatically on this device",
          ),
          button("sources", "Sources & decisions", "", "text-button"),
          button("books", "Choose books", "", "text-button"),
        ),
        "\n",
        element(
          "main",
          { class: "panel" },
          "\n",
          element(
            "div",
            { class: "stage-meta" },
            "\n",
            element(
              "span",
              {},
              "Step ",
              combine(s.step, 1),
              " of ",
              steps.length,
            ),
            "\n",
            element(
              "span",
              {
                class: pending[s.step].length
                  ? "pending-status"
                  : "ready-status",
              },
              s.step < creationStepCount
                ? pending[s.step].length
                  ? interpolate(
                      ["", " choice", " remaining"],
                      [
                        pending[s.step].length,
                        pending[s.step].length === 1 ? "" : "s",
                      ],
                    )
                  : "✓ Ready"
                : issues.length
                  ? interpolate(
                      ["", " creation choices remaining"],
                      [issues.length],
                    )
                  : "✓ Creation complete",
            ),
            "\n",
          ),
          !setupOpen && locked() && s.step < creationStepCount
            ? fragment(
                element(
                  "div",
                  { class: "notice" },
                  "Creation is locked while XP is spent. ",
                  button("unlock", "Clear advancement & edit creation"),
                ),
                "\n",
                element("div", { class: "creation-lock" }, body),
              )
            : body,
          !setupOpen && s.step === 4 && hasColourMagic() ? cantPanel(R, s) : "",
          !setupOpen && s.step === 5
            ? combine(marketShop(), penaltySummary(R, s))
            : "",
          !setupOpen
            ? element(
                "div",
                { class: "step-footer" },
                s.step
                  ? button(
                      "step",
                      "Back",
                      interpolate(['data-step="', '"'], [s.step - 1]),
                    )
                  : element("span", {}),
                element(
                  "span",
                  { class: "footer-position" },
                  combine(s.step, 1),
                  " / ",
                  steps.length,
                ),
                s.step < reviewStep
                  ? button(
                      "step",
                      interpolate(
                        ["Continue to ", ""],
                        [steps[combine(s.step, 1)]],
                      ),
                      interpolate(['data-step="', '"'], [combine(s.step, 1)]),
                      "primary",
                    )
                  : button(
                      "step",
                      "Back to Experience",
                      interpolate(['data-step="', '"'], [experienceStep]),
                    ),
              )
            : "",
          element(
            "p",
            { class: "footer-note" },
            "Rules from your selected books · Your draft stays on this device",
          ),
        ),
        "\n",
        element(
          "aside",
          {
            class: ["sheet ", summaryExpanded ? "expanded" : ""].join(""),
            "aria-label": "Character summary",
          },
          "\n",
          element(
            "div",
            { class: "sheet-heading" },
            "\n",
            element("span", { class: "eyebrow" }, "Character folio"),
            element(
              "div",
              { class: "folio-crest", "aria-hidden": "true" },
              ledgerEmblem(),
            ),
            "\n",
            element("h2", {}, esc(s.name || "Your character")),
            "\n",
            element(
              "p",
              {},
              esc(sheetSpecies(R, s) || "Choose a Species"),
              s.species
                ? interpolate(
                    [" · ", " ", ""],
                    [esc(c.name), legacyTag(R, legacyContext(R, s))],
                  )
                : "",
            ),
            "\n",
            s.career
              ? element(
                  "span",
                  { class: "profile-badge" },
                  esc(c.levels[d.level - 1].name),
                  " · ",
                  d.status,
                )
              : "",
            button(
              "summary-toggle",
              summaryExpanded ? "Hide details" : "View character",
              interpolate(
                ['aria-expanded="', '" aria-controls="sheet-body"'],
                [summaryExpanded],
              ),
              "summary-toggle",
            ),
          ),
          "\n",
          element(
            "div",
            { class: "mobile-totals" },
            "\n",
            element(
              "span",
              {},
              "\n",
              element("strong", {}, d.remaining.toLocaleString()),
              " XP left",
            ),
            "\n",
            element(
              "span",
              {},
              "\n",
              element(
                "strong",
                {},
                s.wealth ? formatMoney(result().wallet.remaining) : "—",
              ),
              " coin",
            ),
            "\n",
          ),
          "\n",
          element(
            "div",
            { id: "sheet-body", class: "sheet-body" },
            "\n",
            !s.species
              ? element(
                  "p",
                  { class: "empty" },
                  "Choose or roll a Species in Origins to begin.",
                )
              : fragment(
                  element(
                    "div",
                    { class: "stat-grid" },
                    joinNodes(
                      M.KEYS.map((k) =>
                        element(
                          "button",
                          {
                            type: "button",
                            class: [
                              "stat-calculation ",
                              characteristicClass(k),
                            ].join(""),
                            "data-action": "calculation",
                            "data-kind": "char",
                            "data-name": k,
                            title: esc(
                              combine(
                                combine(characteristicNames[k], ": "),
                                characteristicTitle(k),
                              ),
                            ),
                            "aria-label": [
                              "Calculate ",
                              esc(characteristicNames[k]),
                            ].join(""),
                          },
                          "\n",
                          element(
                            "small",
                            {},
                            k,
                            c.advanceScheme[k]
                              ? interpolate([" · L", ""], [c.advanceScheme[k]])
                              : "",
                          ),
                          "\n",
                          element(
                            "strong",
                            {},
                            k === "Ag" && eq.penalties.complete
                              ? eq.penalties.agility
                              : d.stats[k],
                          ),
                          "\n",
                        ),
                      ),
                      "",
                    ),
                  ),
                  "\n",
                  element(
                    "div",
                    { class: "derived" },
                    joinNodes(
                      [
                        ["Wounds", d.wounds],
                        [
                          "Movement",
                          eq.penalties.complete
                            ? eq.penalties.movement
                            : d.movement,
                        ],
                        ["Fate", d.fate],
                        ["Fortune", d.fortune],
                      ].map(([k, v]) =>
                        element(
                          "button",
                          {
                            type: "button",
                            class: "derived-calculation",
                            "data-action": "calculation",
                            "data-kind": "derived",
                            "data-name": k,
                          },
                          "\n",
                          element(
                            "span",
                            { title: k },
                            k === "Movement" ? "Move" : k,
                          ),
                          "\n",
                          element("strong", {}, v),
                          "\n",
                        ),
                      ),
                      "",
                    ),
                  ),
                  "\n",
                  element(
                    "div",
                    { class: "folio-balances" },
                    "\n",
                    element(
                      "div",
                      { class: "folio-xp" },
                      "\n",
                      element("span", {}, "XP remaining"),
                      "\n",
                      element(
                        "strong",
                        {},
                        d.remaining.toLocaleString(),
                        " ",
                        element("small", {}, "XP"),
                        "\n",
                      ),
                      "\n",
                      element(
                        "p",
                        {},
                        d.spent.toLocaleString(),
                        " spent of ",
                        d.xpTotal.toLocaleString(),
                        d.xpBonus
                          ? interpolate([" (+", " star sign)"], [d.xpBonus])
                          : "",
                      ),
                      "\n",
                    ),
                    "\n",
                    element(
                      "div",
                      { class: "folio-coin" },
                      "\n",
                      element("span", {}, "Remaining coin"),
                      "\n",
                      element(
                        "strong",
                        {},
                        s.wealth
                          ? formatMoney(result().wallet.remaining)
                          : "Not rolled",
                      ),
                      "\n",
                    ),
                    "\n",
                  ),
                  "\n",
                  element(
                    "div",
                    { class: "folio-line" },
                    "\n",
                    element("span", {}, "Current tracker"),
                    "\n",
                    element(
                      "strong",
                      {},
                      d.ticks,
                      " / ",
                      [10, 12, 14, "—"][d.level - 1],
                    ),
                    "\n",
                  ),
                  "\n",
                  element(
                    "button",
                    {
                      type: "button",
                      class: "folio-line capacity-calculation",
                      "data-action": "calculation",
                      "data-kind": "derived",
                      "data-name": "Capacity",
                      "aria-label": "How is carrying capacity calculated?",
                    },
                    "\n",
                    element(
                      "span",
                      {},
                      eq.unknown.length
                        ? "Known Enc / capacity"
                        : "Enc / capacity",
                    ),
                    "\n",
                    element(
                      "strong",
                      {},
                      eq.total,
                      " / ",
                      d.capacity,
                      " ",
                      element("small", {}, "ⓘ"),
                      "\n",
                    ),
                    "\n",
                  ),
                  eq.penalties.complete && eq.penalties.band
                    ? element(
                        "p",
                        { class: "packing-warning" },
                        eq.penalties.immobile
                          ? "Unable to move"
                          : interpolate(
                              ["Load: Move ", ", Ag ", ""],
                              [eq.penalties.movement, eq.penalties.agility],
                            ),
                        " (p. 299)",
                      )
                    : "",
                  folioMenus(),
                ),
            element(
              "div",
              {
                class: [
                  "folio-status ",
                  issues.length ? "pending" : "complete",
                ].join(""),
              },
              "\n",
              element(
                "span",
                {},
                issues.length
                  ? interpolate(["", " choices remaining"], [issues.length])
                  : "✓ Creation complete",
              ),
              issues.length
                ? button(
                    "issue",
                    "Finish choices",
                    interpolate(
                      ['data-step="', '" data-target="', '"'],
                      [
                        issueTarget(R, s, issues[0]).step,
                        esc(issueTarget(R, s, issues[0]).target),
                      ],
                    ),
                  )
                : button(
                    "step",
                    "Review & export",
                    interpolate(['data-step="', '"'], [reviewStep]),
                  ),
            ),
            "\n",
          ),
          "\n",
        ),
        "\n",
      ),
      "\n",
      element(
        "div",
        {
          class: "mobile-workspace-bar",
          role: "region",
          "aria-label": "Character actions",
        },
        "\n",
        element(
          "span",
          {
            class: "mobile-balance",
            "aria-label": "Remaining experience and money",
          },
          element("span", {}, d.remaining.toLocaleString(), " XP"),
          element(
            "span",
            {},
            s.wealth ? formatMoney(result().wallet.remaining) : "Coin unrolled",
          ),
        ),
        summaryExpanded
          ? button("mobile-choice", "Back to choice")
          : button("mobile-folio", "View character"),
      ),
    );
  }
  return { workspaceShell };
}
