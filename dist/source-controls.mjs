import { sourceLabel } from "./sources.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function sourceButton(R, entry) {
  const source = entry?.source;
  if (!source?.book || source.page === undefined)
    throw Error("Source controls require explicit book/page metadata.");
  return `<button type="button" class="source source-button book-reference" data-action="source-info" data-book="${esc(source.book)}" data-page="${esc(source.page)}">${esc(sourceLabel(R, entry, { legacy: false }))}</button>`;
}
