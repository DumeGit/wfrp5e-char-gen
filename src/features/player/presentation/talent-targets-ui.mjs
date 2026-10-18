import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
import { CAUSE_KEY } from "../../../engine/talent-targets.mjs";
export function causeControl(s, esc, button) {
  return element(
    "div",
    { class: "field" },
    element("label", { for: "impassioned-cause" }, "Impassioned Zeal: Cause"),
    element(
      "div",
      { class: "budget-form" },
      element("input", {
        id: "impassioned-cause",
        type: "text",
        maxlength: "160",
        value: esc(s.talentChoices[CAUSE_KEY] || ""),
        placeholder: "Enter your political, religious or philosophical cause",
      }),
      button("set-cause", "Use this Cause"),
    ),
    element(
      "small",
      {},
      "Choosing a Cause grants no Talent or Advances. Normal purchase limits and XP apply.",
    ),
  );
}
