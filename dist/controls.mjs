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
export const fieldIntent = (id, type = "text", attrs = "") =>
  `${/\bname=/.test(attrs) ? "" : `name="${esc(id)}" `}${/\bautocomplete=/.test(attrs) ? "" : 'autocomplete="off" '}${type === "number" && !/\binputmode=/.test(attrs) ? 'inputmode="decimal" ' : ""}`;
export const field = (label, id, value, attrs = "", type = "text") =>
  `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" type="${type}" value="${esc(value)}" ${fieldIntent(id, type, attrs)}${attrs}></div>`;
export const select = (label, id, values, value, attrs = "") =>
  `<div class="field"><label for="${id}">${esc(label)}</label><select id="${id}" ${/\bname=/.test(attrs) ? "" : `name="${esc(id)}"`} ${attrs}>${values
    .map((x) => {
      const [v, text] = Array.isArray(x) ? x : [x, x];
      return `<option value="${esc(v)}" ${String(v) === String(value) ? "selected" : ""}>${esc(text)}</option>`;
    })
    .join("")}</select></div>`;
export const disclosure = (
  key,
  title,
  body,
  { open = false, className = "", bodyClass = "" } = {},
) =>
  `<details class="ui-disclosure ${esc(className)}" data-detail-key="${esc(key)}" ${open ? "open" : ""}><summary>${title}</summary><div class="${esc(bodyClass)}">${body}</div></details>`;
export const diceIcon =
  '<svg class="ui-dice-icon" aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>';
export const tab = (
  label,
  { id, panel, selected, action, value, short = label },
) =>
  `<button type="button" role="tab" id="${esc(id)}" aria-label="${esc(label)}" aria-controls="${esc(panel)}" aria-selected="${Boolean(selected)}" tabindex="${selected ? 0 : -1}" class="quiet${selected ? " active" : ""}" data-action="${esc(action)}" data-tab="${esc(value)}"><span class="tab-label-full">${esc(label)}</span><span class="tab-label-short" aria-hidden="true">${esc(short)}</span></button>`;
