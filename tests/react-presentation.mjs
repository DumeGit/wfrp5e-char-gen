import { createElement, Fragment, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

export function serialize(value) {
  if (
    isValidElement(value) ||
    (Array.isArray(value) && value.some(isValidElement))
  )
    return renderToStaticMarkup(createElement(Fragment, null, value));
  return value;
}
// Existing assertions still inspect HTML, but now exercise the authoritative
// React presentation rather than an unused copy of the former renderer.
export function presentation(fn) {
  return (...args) => {
    if (args[0] instanceof Function && fn.name === "createFeature") {
      const getContext = args[0];
      args[0] = () => {
        const context = getContext();
        return {
          ...context,
          ...(context.dialog
            ? {
                dialog: (title, body) => context.dialog(title, serialize(body)),
              }
            : {}),
        };
      };
    }
    const value = fn(...args);
    if (
      value &&
      typeof value === "object" &&
      !isValidElement(value) &&
      Object.values(value).some((x) => typeof x === "function")
    )
      return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [
          key,
          typeof entry === "function" ? presentation(entry) : entry,
        ]),
      );
    return serialize(value);
  };
}
