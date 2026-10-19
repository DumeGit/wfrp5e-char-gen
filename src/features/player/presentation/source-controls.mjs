import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
import { sourceLabel } from "../../../engine/sources.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// A disclosure toggle and its reference actions are separate keyboard controls.
export function referenceSummary(title, reference, { legacy = false } = {}) {
  return fragment(
    element(
      "summary",
      {},
      title,
      legacy ? element("span", { class: "legacy-label" }, " · Legacy") : "",
    ),
    reference
      ? element("p", { class: "small disclosure-reference" }, reference)
      : "",
  );
}

export function legacySummary(title, adaptationReference) {
  return referenceSummary(title, adaptationReference, {
    legacy: Boolean(adaptationReference),
  });
}

export function sourceButton(R, entry) {
  const source = entry?.source;
  if (!source?.book || source.page === undefined)
    throw Error("Source controls require explicit book/page metadata.");
  return element(
    "button",
    {
      type: "button",
      class: "source source-button book-reference",
      "data-action": "source-info",
      "data-book": esc(source.book),
      "data-page": esc(source.page),
    },
    esc(sourceLabel(R, entry, { legacy: false })),
  );
}
