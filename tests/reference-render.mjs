// Node assertions serialize the actual React presentation, not a second renderer.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { tsImport } from "tsx/esm/api";
const { ReferenceBody, RuleText, CareerReferences } = await tsImport(
  "../src/features/reference-search/ReferenceBody.tsx",
  import.meta.url,
);
export const referenceBodyHTML = (row) =>
  renderToStaticMarkup(
    createElement(ReferenceBody, { row, renderText: (text) => text }),
  );
export const ruleTextHTML = (text) =>
  renderToStaticMarkup(
    createElement(RuleText, { text, renderText: (text) => text }),
  );
export const careerReferencesHTML = (row, matches, books) =>
  renderToStaticMarkup(
    createElement(CareerReferences, {
      row,
      data: { books, rows: [], careerReferences: () => matches },
      onOpen: () => {},
    }),
  );
