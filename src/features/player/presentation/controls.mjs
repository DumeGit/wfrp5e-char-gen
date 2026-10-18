import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
import { displayNumber } from "../../../engine/display-number.mjs";
export const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const score = (value) =>
  value === null || value === undefined
    ? "—"
    : typeof value === "number"
      ? displayNumber(value)
      : value;
export const button = (label, action, attrs = "", style = "quiet") =>
  element(
    "button",
    {
      type: "button",
      class: style,
      "data-action": action,
      ...attributes(attrs),
    },
    label,
  );
export const fieldIntent = (id, type = "text", attrs = "") =>
  interpolate(
    ["", "", "", ""],
    [
      /\bname=/.test(attrs) ? "" : interpolate(['name="', '" '], [esc(id)]),
      /\bautocomplete=/.test(attrs) ? "" : 'autocomplete="off" ',
      type === "number" && !/\binputmode=/.test(attrs)
        ? 'inputmode="decimal" '
        : "",
    ],
  );
export const field = (label, id, value, attrs = "", type = "text") =>
  element(
    "div",
    { class: "field" },
    element("label", { for: id }, esc(label)),
    element("input", {
      id: id,
      type: type,
      value: esc(value),
      ...attributes(fieldIntent(id, type, attrs)),
      ...attributes(attrs),
    }),
  );
export const select = (label, id, values, value, attrs = "") =>
  element(
    "div",
    { class: "field" },
    element("label", { for: id }, esc(label)),
    element(
      "select",
      {
        id: id,
        ...attributes(
          /\bname=/.test(attrs) ? "" : interpolate(['name="', '"'], [esc(id)]),
        ),
        ...attributes(attrs),
      },
      joinNodes(
        values.map((x) => {
          const [v, text] = Array.isArray(x) ? x : [x, x];
          return element(
            "option",
            {
              value: esc(v),
              ...attributes(String(v) === String(value) ? "selected" : ""),
            },
            esc(text),
          );
        }),
        "",
      ),
    ),
  );
export const disclosure = (
  key,
  title,
  body,
  { open = false, className = "", bodyClass = "" } = {},
) =>
  element(
    "details",
    {
      class: ["ui-disclosure ", esc(className)].join(""),
      "data-detail-key": esc(key),
      ...attributes(open ? "open" : ""),
    },
    element("summary", {}, title),
    element("div", { class: esc(bodyClass) }, body),
  );
export const diceIcon = element(
  "svg",
  { class: "ui-dice-icon", "aria-hidden": "true", viewBox: "0 0 24 24" },
  element("rect", { x: "3", y: "3", width: "18", height: "18", rx: "3" }),
  element("circle", { cx: "8", cy: "8", r: "1" }),
  element("circle", { cx: "16", cy: "8", r: "1" }),
  element("circle", { cx: "12", cy: "12", r: "1" }),
  element("circle", { cx: "8", cy: "16", r: "1" }),
  element("circle", { cx: "16", cy: "16", r: "1" }),
);
export const tab = (
  label,
  { id, panel, selected, action, value, short = label },
) =>
  element(
    "button",
    {
      type: "button",
      role: "tab",
      id: esc(id),
      "aria-label": esc(label),
      "aria-controls": esc(panel),
      "aria-selected": Boolean(selected),
      tabindex: selected ? 0 : -1,
      class: ["quiet", selected ? " active" : ""].join(""),
      "data-action": esc(action),
      "data-tab": esc(value),
    },
    element("span", { class: "tab-label-full" }, esc(label)),
    element(
      "span",
      { class: "tab-label-short", "aria-hidden": "true" },
      esc(short),
    ),
  );
