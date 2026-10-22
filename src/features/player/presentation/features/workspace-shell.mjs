import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../../components/react-elements";

import { creatorSwitch } from "../creator-switch.mjs";

import {
  steps,
  creationStepCount,
  experienceStep,
  reviewStep,
} from "../../../../engine/ui.mjs";
import { formatMoney } from "../../../../engine/market.mjs";
import { penaltySummary } from "../creator-ui.mjs";

import { cantPanel } from "../archives-iii-ui.mjs";
export function createFeature(getContext) {
  function workspaceShell({ d, issues, pending, body, ready }) {
    const {
      setupOpen,
      select,
      s,
      button,
      esc,
      R,
      result,
      locked,
      hasColourMagic,
      marketShop,
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
      ),
    );
  }
  return { workspaceShell };
}
