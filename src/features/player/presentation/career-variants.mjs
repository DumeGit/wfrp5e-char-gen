import {
  element,
  attributes,
  joinNodes,
} from "../../../components/react-elements";
import { sourceButton } from "./source-controls.mjs";
import { legacyTag } from "./legacy.mjs";
import { availableVariants } from "../../../engine/career-variants.mjs";
export {
  isCareerVariant,
  clearCareerSelections,
  switchCareerVariant,
} from "../../../engine/career-variants.mjs";
export function careerVariantPanel(R, s) {
  const choices = availableVariants(R, s);
  if (!choices.length) return "";
  const selected = choices.find((x) => R.selection.some((b) => b.id === x.id));
  const current = selected || choices[0];
  const name = R.careers.find((c) => c.id === s.career).name;
  return element(
    "section",
    { class: "notice", "aria-label": "Career variant" },
    element(
      "div",
      { class: "field" },
      element(
        "label",
        { for: "career-variant" },
        name,
        " variant ",
        sourceButton(R, current),
        legacyTag(R, current),
      ),
      element(
        "select",
        { id: "career-variant", "data-bind": "careerVariant" },
        element(
          "option",
          { value: "", ...attributes(selected ? "" : "selected") },
          "Standard ",
          name,
          " · core",
        ),
        joinNodes(
          choices.map((x) =>
            element(
              "option",
              {
                value: x.id,
                ...attributes(selected?.id === x.id ? "selected" : ""),
              },
              x.name,
              x.adaptation ? " · Legacy" : "",
            ),
          ),
          "",
        ),
      ),
    ),
    element(
      "p",
      { class: "small muted" },
      selected
        ? selected.text
        : "Choose an optional printed profile. Standard retains the core Career; variants grant no extra free Advances.",
    ),
    element(
      "p",
      { class: "small muted" },
      "Changing this choice clears Career Skill allocations, the starting Career Talent, magic and equipment choices. Your identity, Species choices and dice record are kept.",
    ),
  );
}
