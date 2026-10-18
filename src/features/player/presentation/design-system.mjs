import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export function chapterHeading(title) {
  const letters = Intl.Segmenter
    ? [
        ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
          String(title),
        ),
      ].map((x) => x.segment)
    : Array.from(String(title));
  const [initial, ...rest] = letters;
  return element(
    "h1",
    { class: "chapter-title", "aria-label": escape(title) },
    element(
      "span",
      { class: "chapter-initial", "aria-hidden": "true" },
      element("span", {}, escape(initial || "")),
    ),
    element("span", { "aria-hidden": "true" }, escape(joinNodes(rest, ""))),
  );
}

export function ledgerEmblem() {
  return element("img", {
    class: "ledger-emblem",
    src: "/assets/ledger-emblem.svg",
    alt: "",
    width: "128",
    height: "144",
  });
}
