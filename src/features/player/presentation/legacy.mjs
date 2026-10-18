import { element } from "../../../components/react-elements";
import { esc } from "./controls.mjs";
import { legacySources, legacyTitle } from "../../../engine/legacy.mjs";
export * from "../../../engine/legacy.mjs";
export function legacyTag(R, entry) {
  const sources = legacySources(R, entry);
  if (!sources.length) return "";
  const explanations = legacyTitle(R, entry);
  return element(
    "button",
    {
      type: "button",
      class: "legacy-tag",
      "data-action": "legacy-info",
      "data-explanation": esc(explanations),
      title: esc(explanations),
      "aria-label": "Explain Legacy adaptation",
    },
    "Legacy",
  );
}
