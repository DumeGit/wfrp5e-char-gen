import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../../components/react-elements";

import { WorkspaceMenu } from "../../../../components/WorkspaceMenu";

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
      element("input", {
        type: "file",
        id: "import-file",
        accept: "application/json,.json",
        hidden: "",
      }),
      element(
        "div",
        {
          class: ["workspace ", setupOpen ? "book-setup-workspace" : ""].join(
            "",
          ),
        },
        "\n",
        element(WorkspaceMenu, {
          mode: "player",
          documentState: JSON.stringify(s),
          verify:
            typeof location !== "undefined" &&
            new URLSearchParams(location.search).has("verify"),
          heading: `${ready} of ${creationStepCount} required stages complete`,
          navigation: element(
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
                        class: !setupOpen && i === s.step ? "active" : "",
                        ...attributes(
                          !setupOpen && i === s.step
                            ? 'aria-current="step"'
                            : "",
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
          selector: setupOpen
            ? element(
                "div",
                { class: "workspace-setup-context" },
                element("span", { class: "small" }, "Character setup"),
                element("strong", {}, "Choose books"),
              )
            : element(
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
          groups: [
            {
              id: "new",
              label: "New & import",
              commands: [
                {
                  id: "new",
                  label: "New character",
                  effect: "navigate",
                  data: { "data-action": "new" },
                },
                {
                  id: "load",
                  label: "Load character",
                  effect: "file",
                  data: { "data-action": "load-file" },
                },
              ],
            },
            {
              id: "save",
              label: "Save & export",
              commands: [
                {
                  id: "save",
                  label: "Save character",
                  effect: "close",
                  data: { "data-action": "save-file" },
                },
                {
                  id: "sheet",
                  label: "Export character sheet PDF",
                  effect: "close",
                  disabled: issues.length > 0,
                  reason: issues.length
                    ? "Finish the required creation choices before exporting."
                    : undefined,
                  data: { "data-action": "sheet" },
                },
                {
                  id: "record",
                  label: "Export creation record PDF",
                  effect: "close",
                  disabled: issues.length > 0,
                  reason: issues.length
                    ? "Finish the required creation choices before exporting."
                    : undefined,
                  data: { "data-action": "record" },
                },
              ],
            },
            {
              id: "more",
              label: "More",
              commands: [
                {
                  id: "books",
                  label: "Choose books",
                  effect: "navigate",
                  data: { "data-action": "books" },
                },
                {
                  id: "sources",
                  label: "Sources & decisions",
                  effect: "dialog",
                  data: { "data-action": "sources" },
                },
              ],
            },
          ],
          history: element("div", { "data-player-history-slot": "" }),
          status: getContext().saveStatus,
        }),
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
