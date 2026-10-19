import {
  Children,
  cloneElement,
  createElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { AsyncActionButton } from "./AsyncActionButton";
import { NativeTextField } from "./NativeTextField";

// The old templates have been compiled into element calls. These helpers adapt
// native attribute spelling and existing selection intent to React properties.
const entities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  times: "×",
  middot: "·",
};
function decode(value: string): string {
  return value.replace(
    /&(#x[\da-f]+|#\d+|[a-z]+);/gi,
    (match, entity: string) =>
      entity[0] === "#"
        ? String.fromCodePoint(
            entity[1].toLowerCase() === "x"
              ? parseInt(entity.slice(2), 16)
              : parseInt(entity.slice(1), 10),
          )
        : (entities[entity] ?? match),
  );
}
const names: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  autocomplete: "autoComplete",
  inputmode: "inputMode",
  maxlength: "maxLength",
  colspan: "colSpan",
  rowspan: "rowSpan",
  viewbox: "viewBox",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "aria-label": "aria-label",
};
const bools = new Set([
  "disabled",
  "checked",
  "selected",
  "open",
  "hidden",
  "multiple",
  "readonly",
  "required",
  "autofocus",
]);
export function attributes(value: unknown): Record<string, unknown> {
  if (value == null || value === false) return {};
  if (typeof value === "object") return value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const match of String(value).matchAll(
    /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g,
  )) {
    const key = match[1].toLowerCase();
    if (/^on/.test(key)) continue;
    result[key] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return result;
}
const selection = new WeakMap<object, boolean>();
const text = (node: ReactNode): ReactNode =>
  typeof node === "string"
    ? decode(node)
    : Array.isArray(node)
      ? node.map(text)
      : node;
export function combine(left: any, right: any): any {
  return isValidElement(left) ||
    isValidElement(right) ||
    Array.isArray(left) ||
    Array.isArray(right)
    ? fragment(left, right)
    : left + right;
}
export function interpolate(parts: string[], values: any[]): any {
  return values.some((x) => isValidElement(x) || Array.isArray(x))
    ? fragment(
        ...parts.flatMap((part, i) =>
          i < values.length ? [part, values[i]] : [part],
        ),
      )
    : parts.reduce(
        (result, part, i) =>
          result + part + (i < values.length ? String(values[i]) : ""),
        "",
      );
}
export function joinNodes(values: any[], separator = ","): any {
  return values.every((x) => !isValidElement(x) && !Array.isArray(x))
    ? values.join(separator)
    : values.flatMap((x, i) => (i && separator ? [separator, x] : [x]));
}
export function fragment(...children: ReactNode[]): ReactElement {
  return createElement(Fragment, null, ...children.map(text));
}
export function element(
  tag: string,
  intent: Record<string, any>,
  ...nodes: ReactNode[]
): ReactElement {
  const props: Record<string, any> = {};
  for (const [raw, value] of Object.entries(intent)) {
    const key = names[raw] ?? raw;
    if (raw === "selected") continue;
    if (bools.has(raw)) props[key] = value !== false && value != null;
    else if (raw === "style")
      props.style =
        typeof value === "object"
          ? value
          : Object.fromEntries(
              String(value)
                .split(";")
                .filter((x) => x.includes(":"))
                .map((x) => {
                  const at = x.indexOf(":");
                  return [
                    x.slice(0, at).trim().startsWith("--")
                      ? x.slice(0, at).trim()
                      : x
                          .slice(0, at)
                          .trim()
                          .replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
                    x.slice(at + 1).trim(),
                  ];
                }),
            );
    else props[key] = typeof value === "string" ? decode(value) : value;
  }
  const children = Children.toArray(nodes.map(text));
  if (["input", "select", "textarea"].includes(tag)) {
    props.name ??= props.id ?? props["data-bind"] ?? "choice";
    if (tag !== "select") props.autoComplete ??= "off";
    if (props.type === "number") props.inputMode ??= "decimal";
    // Bound choices stay controlled even when unchecked. Book selection is an
    // uncommitted native form and intentionally has no data-bind.
    if (["checkbox", "radio"].includes(props.type) && props["data-bind"])
      props.checked ??= false;
  }
  if (tag === "button" && children.length === 1 && children[0] === "⚄") {
    props.className = [props.className, "ui-dice-button"]
      .filter(Boolean)
      .join(" ");
    children[0] = createElement(
      "svg",
      { className: "ui-dice-icon", "aria-hidden": true, viewBox: "0 0 24 24" },
      createElement("rect", { x: 3, y: 3, width: 18, height: 18, rx: 3 }),
      ...[
        [8, 8],
        [16, 8],
        [12, 12],
        [8, 16],
        [16, 16],
      ].map(([cx, cy]) =>
        createElement("circle", { key: `${cx}-${cy}`, cx, cy, r: 1 }),
      ),
    );
  }
  if (tag === "select") {
    const options: ReactElement<any>[] = [];
    const walk = (items: ReactNode[]) =>
      items.forEach((child) => {
        if (isValidElement<any>(child)) {
          if (child.type === "option") options.push(child);
          else
            walk(Children.toArray((child as ReactElement<any>).props.children));
        }
      });
    walk(children);
    const chosen = options.find(
      (option) => option.props["data-react-selected"],
    );
    if (chosen)
      props.value =
        chosen.props.value ?? Children.toArray(chosen.props.children).join("");
  }
  if (["input", "select", "textarea"].includes(tag)) {
    props.onChange ??= () => {};
    if (tag === "textarea") {
      props.value ??= children.join("");
      children.length = 0;
    }
    if (props.value === null) props.value = "";
  }
  if (
    tag === "option" &&
    Object.hasOwn(intent, "selected") &&
    intent.selected !== false
  )
    props["data-react-selected"] = true;
  let rendered: any = tag;
  if (tag === "button" && ["sheet", "record"].includes(props["data-action"]))
    rendered = AsyncActionButton;
  if (
    (tag === "textarea" ||
      (tag === "input" &&
        !["file", "checkbox", "radio", "range", "button", "submit"].includes(
          props.type,
        ))) &&
    Object.hasOwn(props, "value")
  ) {
    rendered = NativeTextField;
    props.tag = tag;
  }
  const result = createElement(rendered, props, ...children);
  if (tag === "option")
    selection.set(
      result,
      Object.hasOwn(intent, "selected") && intent.selected !== false,
    );
  return result;
}
