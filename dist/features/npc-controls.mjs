import { esc } from "../workspace.mjs";
import { npcSourceLabel } from "../npc-books.mjs";
import { legacyTag } from "../legacy.mjs";
export const value = (v) => (v === null || v === undefined ? "—" : v);
export const btn = (action, label, attrs = "", skin = "quiet") =>
  `<button type="button" class="${skin}" data-npc-action="${action}" ${attrs}>${esc(label)}</button>`;
export const select = (id, options, current, attrs = "") =>
  `<select id="${id}" ${attrs}>${options
    .map((x) => {
      const [v, n] = Array.isArray(x) ? x : [x, x];
      return `<option value="${esc(v)}" ${String(v) === String(current) ? "selected" : ""}>${esc(n)}</option>`;
    })
    .join("")}</select>`;
export const field = (label, control) =>
  `<div class="field"><label>${label}${control}</label></div>`;
export const section = (title, body, description = "") =>
  `<section class="npc-section"><div class="npc-section-heading"><h2>${esc(title)}</h2></div>${description ? `<p class="small muted">${esc(description)}</p>` : ""}${body}</section>`;
export function createNPCReference(getContext) {
  return (x) => {
    if (!x) return "";
    const { R } = getContext();
    return (
      btn(
        "reference",
        npcSourceLabel(R, x),
        `data-id="${esc(x.contentId)}"`,
        "source-button",
      ) + legacyTag(R, x)
    );
  };
}
