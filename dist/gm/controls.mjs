import { esc, button, disclosure } from "../controls.mjs";
export { esc, score, button, field, select } from "../controls.mjs";
export const detail = (key, title, body, open = false) =>
  disclosure(`gm:${key}`, title, body, { open, bodyClass: "gm-detail-body" });
export const reference = (kind, name, page) =>
  button(
    `Core · p. ${page}`,
    "reference",
    `data-kind="${kind}" data-name="${esc(name)}"`,
    "source-button",
  );
export const remove = (key) =>
  button(
    "×",
    "remove",
    `data-key="${esc(key)}" aria-label="Remove this entry"`,
    "gm-remove quiet",
  );
export const empty = (text) => `<p class="gm-empty">${esc(text)}</p>`;
export const listNames = (rows) =>
  rows.map((t) => esc(t.name) + (t.ranks > 1 ? ` ×${t.ranks}` : "")).join(", ");
export const legacyBadge = (entry) =>
  entry.adaptation
    ? button(
        "Legacy",
        "legacy",
        `data-entry="${esc(entry.key || entry.id || entry.name)}" aria-label="Read ${esc(entry.name)} adaptation"`,
        "legacy-tag",
      )
    : "";
