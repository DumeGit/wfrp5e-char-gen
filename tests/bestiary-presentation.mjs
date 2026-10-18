// Render the production React presentation for mechanical/escaping assertions.
// The adapter supplies only context and inert event handlers; there is no second UI.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { assembleGMOptions } from "../src/engine/gm/books.mjs";
import { freshGM } from "../src/engine/gm/model.mjs";
import { BestiaryContext } from "../src/features/bestiary/controls.tsx";
import { BestiaryWorkspace } from "../src/features/bestiary/BestiaryCreator.tsx";
import {
  Starting,
  StatBlock,
  TraitParameter,
} from "../src/features/bestiary/Sections.tsx";
import { TemplatePreview } from "../src/features/bestiary/Dialogs.tsx";

const json = (path) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const defaultData = json("../public/gm/data.json");
const defaultRules = assembleGMOptions(
  json("../public/data/book-library.json"),
);
const noop = () => {};
const controls = {
  compact: false,
  portal: null,
  verify: false,
  root: { current: null },
  file: { current: null },
  mounted: { current: false },
  navigate: noop,
  jump: noop,
  fileActions: null,
  folio: false,
  setFolio: noop,
  tools: false,
  setTools: noop,
  message: "",
  status: "",
};
function render(
  component,
  {
    data = defaultData,
    rules = defaultRules,
    draft = freshGM(data),
    result = {},
    ui = {},
    storageMessage = "Saved",
  } = {},
) {
  const context = {
    data,
    rules,
    draft,
    result,
    ui: {
      tab: 0,
      query: ui.profileQuery || ui.query || "",
      category: "",
      profileBook: "",
      browse: false,
      ...ui,
    },
    storageMessage,
    error: "",
    modal: null,
    working: "",
    canUndo: false,
    canRedo: false,
    disclosures: new Map(),
    session: { printEntries: [] },
    store: { breakGroup: noop, travel: noop },
    setUI: noop,
    edit: noop,
    remove: noop,
    picker: noop,
    setModal: noop,
    rollAppearance: noop,
    save: noop,
    exportPDF: noop,
    busy: noop,
  };
  return renderToStaticMarkup(
    React.createElement(
      BestiaryContext.Provider,
      { value: context },
      component,
    ),
  );
}
export function workspace(
  data,
  rules,
  draft,
  result,
  ui = {},
  verify = false,
  _legacyExpanded = false,
  storageMessage = "Saved",
) {
  return render(
    React.createElement(BestiaryWorkspace, {
      controls: { ...controls, verify },
    }),
    { data, rules, draft, result, ui, storageMessage },
  );
}
export function profileResults(data, ui = {}) {
  const draft = freshGM(data);
  draft.books = data.books.map((book) => book.id);
  return render(React.createElement(Starting), {
    data,
    draft,
    result: { profile: null },
    ui,
  });
}
export function statBlock(result, draft, { compact = false } = {}) {
  return render(React.createElement(StatBlock, { compact }), { result, draft });
}
export function templateOverview(template) {
  return render(React.createElement(TemplatePreview, { template }));
}
export function traitParameter(data, rules, trait, profile) {
  const draft = freshGM(data, profile?.id || "");
  return render(React.createElement(TraitParameter, { trait }), {
    data,
    rules,
    draft,
    result: { profile },
  });
}
