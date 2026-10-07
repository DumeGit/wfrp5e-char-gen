export const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const score = (value) =>
  value === null || value === undefined ? "—" : value;
export const button = (label, action, attrs = "", style = "quiet") =>
  `<button type="button" class="${style}" data-action="${action}" ${attrs}>${label}</button>`;
export const field = (label, id, value, attrs = "", type = "text") =>
  `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" type="${type}" value="${esc(value)}" ${attrs}></div>`;
export const select = (label, id, values, value, attrs = "") =>
  `<div class="field"><label for="${id}">${esc(label)}</label><select id="${id}" ${attrs}>${values
    .map((x) => {
      const [v, text] = Array.isArray(x) ? x : [x, x];
      return `<option value="${esc(v)}" ${String(v) === String(value) ? "selected" : ""}>${esc(text)}</option>`;
    })
    .join("")}</select></div>`;
export const detail = (key, title, body, open = false) =>
  `<details data-detail-key="gm:${esc(key)}" ${open ? "open" : ""}><summary>${title}</summary><div class="gm-detail-body">${body}</div></details>`;
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
