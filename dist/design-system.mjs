// Presentation only. No character rules, catalogue entries or saved draft fields.
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
  return `<h1 class="chapter-title" aria-label="${escape(title)}"><span class="chapter-initial" aria-hidden="true"><span>${escape(initial || "")}</span></span><span aria-hidden="true">${escape(rest.join(""))}</span></h1>`;
}

export function ledgerEmblem() {
  return '<img class="ledger-emblem" src="assets/black-banner/w.svg" alt="" width="108" height="100">';
}
