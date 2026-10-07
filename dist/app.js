import { createInstallControl } from "./install-control.mjs";
import { createFeature as createWorkspaceShell } from "./features/workspace-shell.mjs";
import { captureDisclosures, restoreDisclosures } from "./disclosures.mjs";
import { createFeature as create_controls } from "./features/controls.mjs";
import { createFeature as create_origins_view } from "./features/origins-view.mjs";
import { createFeature as create_creation_views } from "./features/creation-views.mjs";
import { createFeature as create_experience_view } from "./features/experience-view.mjs";
import { createFeature as create_shop_view } from "./features/shop-view.mjs";
import { createFeature as create_review_view } from "./features/review-view.mjs";
import { createFeature as create_creation_state } from "./features/creation-state.mjs";
import { createFeature as create_dialogs } from "./features/dialogs.mjs";
import { createFeature as create_actions } from "./features/actions.mjs";
import { createResultReader } from "./character-result.mjs";
import { createBookSearch } from "./features/book-search.mjs";

import * as M from "./rules.mjs";
import {
  characteristicNames,
  steps,
  creationStepCount,
  experienceStep,
  reviewStep,
  restoreNavigation,
} from "./ui.mjs";

import { formatMoney } from "./market.mjs";

import { penaltySummary } from "./creator-ui.mjs";
import { setNamePart } from "./background.mjs";
import {
  assembleBooks,
  bookSelection,
  catalogForCharacter,
  randomTable,
} from "./books.mjs";
import { loadBookBundle } from "./book-bundle.mjs";

import { legacyTag } from "./legacy.mjs";
import { legacyContext } from "./legacy-character.mjs";
import { bookSetup } from "./book-ui.mjs";

import { issueTarget } from "./issue-targets.mjs";

import { sheetSpecies } from "./origins.mjs";

import { syncCants } from "./archives-iii.mjs";
import { cantPanel } from "./archives-iii-ui.mjs";

const mountInstallControl = createInstallControl(
  document.getElementById("pwa-install"),
);

const library = await loadBookBundle(async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw Error(`Cannot load book data: ${url.pathname}`);
  return r.json();
});
let R = assembleBooks(library);
const STORAGE =
  "wfrp-fifth-character-ledger-v2" +
  (new URLSearchParams(location.search).has("verify") ? "-verification" : "");
const newCharacter = () => ({
  ...restoreNavigation(M.fresh()),
  version: 2,
  books: bookSelection(R),
  rollTables: {},
});
let s = newCharacter(),
  restoreIssue = "",
  setupOpen = !localStorage.getItem(STORAGE),
  undoChoice = null,
  pendingChange = null,
  choiceReturn = null;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE));
  if (saved) {
    if (saved.version !== 2) throw Error("Start a new WIP character.");
    const next = catalogForCharacter(library, saved);
    if (
      !next.species[saved.species] ||
      !next.careers.some((c) => c.id === saved.career)
    )
      throw Error("Saved character options are unavailable.");
    R = next;
    s = { ...newCharacter(), ...restoreNavigation(saved) };
  }
} catch (error) {
  restoreIssue = error.message;
  R = assembleBooks(library);
  s = newCharacter();
}
let folioOpen = new Set(),
  summaryExpanded = false,
  detailsState = new Map(),
  xpTab = "Characteristics",
  careerFilter = "All classes",
  skillSearch = "",
  openedSkillGroups = new Set(),
  marketSearch = "",
  openedMarketGroups = new Set();
let careerSearch = "",
  careerBook = "all",
  careerPreview = "",
  careerLimit = 12,
  shopBook = "all",
  shopGroup = "all",
  shopAffordable = false,
  shopSort = "name",
  xpCareerOnly = false,
  xpAffordable = false,
  magicFilters = {
    query: "",
    type: "all",
    lore: "all",
    book: "all",
    status: "available",
  },
  fullAppendix = false;
try {
  const prefs = JSON.parse(localStorage.getItem(STORAGE + "-folio"));
  summaryExpanded = prefs?.expanded === true;
  folioOpen = new Set(
    (Array.isArray(prefs?.open) ? prefs.open : []).filter((x) =>
      ["skills", "talents", "magic", "gear"].includes(x),
    ),
  );
} catch {}
function saveFolioPreferences() {
  try {
    localStorage.setItem(
      STORAGE + "-folio",
      JSON.stringify({ expanded: summaryExpanded, open: [...folioOpen] }),
    );
  } catch {}
}
const $ = (q) => document.querySelector(q),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

const locked = () => s.ledger.length > 0;
function save() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(s));
  } catch {
    toast(
      "Draft could not be saved in this browser. Download a character file to keep it.",
    );
  }
}

function getContext() {
  return {
    marketShop,
    folioMenus,
    characteristicTitle,
    R,
    s,
    esc,
    result,
    select,
    button,
    ref,
    library,
    page,
    careerSearch,
    careerFilter,
    careerBook,
    careerPreview,
    careerLimit,
    talentDescription,
    talentDetailsBody,
    characteristicLegend,
    characteristicClass,
    characteristicBadge,
    skillChoice,
    spellDescription,
    spellDetailsBody,
    action,
    lucciniTalentChoice,
    xpCareerOnly,
    xpAffordable,
    errors,
    skillSearch,
    $,
    openedSkillGroups,
    xpTab,
    issuePanel,
    trackerBoxes,
    ledgerTable,
    magicFilters,
    magicSection,
    hasColourMagic,
    shopSort,
    marketSearch,
    shopGroup,
    shopBook,
    shopAffordable,
    openedMarketGroups,
    fullAppendix,
    folioOpen,
    pendingChange,
    setupOpen,
    render,
    undoChoice,
    sourceInfo,
    dialog,
    showCalculation,
    freeMagicPicker,
    jumpToIssue,
    choiceReturn,
    summaryExpanded,
    saveFolioPreferences,
    toast,
    newCharacter,
    detailsState,
    resetDependent,
    rolledCareer,
    changeCareer,
    locked,
    proposedCareer,
    showImpact,
  };
}
function setContext(name, value) {
  switch (name) {
    case "R":
      R = value;
      break;
    case "s":
      s = value;
      break;
    case "restoreIssue":
      restoreIssue = value;
      break;
    case "setupOpen":
      setupOpen = value;
      break;
    case "undoChoice":
      undoChoice = value;
      break;
    case "pendingChange":
      pendingChange = value;
      break;
    case "choiceReturn":
      choiceReturn = value;
      break;
    case "folioOpen":
      folioOpen = value;
      break;
    case "summaryExpanded":
      summaryExpanded = value;
      break;
    case "detailsState":
      detailsState = value;
      break;
    case "xpTab":
      xpTab = value;
      break;
    case "careerFilter":
      careerFilter = value;
      break;
    case "skillSearch":
      skillSearch = value;
      break;
    case "openedSkillGroups":
      openedSkillGroups = value;
      break;
    case "marketSearch":
      marketSearch = value;
      break;
    case "openedMarketGroups":
      openedMarketGroups = value;
      break;
    case "careerSearch":
      careerSearch = value;
      break;
    case "careerBook":
      careerBook = value;
      break;
    case "careerPreview":
      careerPreview = value;
      break;
    case "careerLimit":
      careerLimit = value;
      break;
    case "shopBook":
      shopBook = value;
      break;
    case "shopGroup":
      shopGroup = value;
      break;
    case "shopAffordable":
      shopAffordable = value;
      break;
    case "shopSort":
      shopSort = value;
      break;
    case "xpCareerOnly":
      xpCareerOnly = value;
      break;
    case "xpAffordable":
      xpAffordable = value;
      break;
    case "magicFilters":
      magicFilters = value;
      break;
    case "fullAppendix":
      fullAppendix = value;
      break;
    case "searchTimer":
      searchTimer = value;
      break;
    default:
      throw Error("Unknown UI state " + name);
  }
  return value;
}
const {
  select,
  button,
  page,
  ref,
  skillChoice,
  talentDescription,
  talentDetailsBody,
  characteristicClass,
  characteristicTitle,
  characteristicBadge,
  characteristicLegend,
  spellDescription,
  spellDetailsBody,
} = create_controls(getContext, setContext);
const { lucciniTalentChoice, origins } = create_origins_view(
  getContext,
  setContext,
);
const { careerView, characteristics, skills, magicSection, talents, gear } =
  create_creation_views(getContext, setContext);
const { filterSkills, experience } = create_experience_view(
  getContext,
  setContext,
);
const { marketShop, filterMarket } = create_shop_view(getContext, setContext);
const {
  ledgerTable,
  review,
  issuePanel,
  trackerBoxes,
  folioMenus,
  hasColourMagic,
} = create_review_view(getContext, setContext);
const { resetDependent, changeCareer, rolledCareer } = create_creation_state(
  getContext,
  setContext,
);
const {
  dialog,
  lockCreationControls,
  sourceInfo,
  showCalculation,
  freeMagicPicker,
  showImpact,
  proposedCareer,
  jumpToIssue,
} = create_dialogs(getContext, setContext);
const { action, handleChange } = create_actions(getContext, setContext);

const { workspaceShell } = createWorkspaceShell(getContext);
window.addEventListener("wfrp-before-update", save);
function toast(text) {
  $("#toast").textContent = text;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ($("#toast").textContent = ""), 6500);
}
const readResult = createResultReader();
const result = () => readResult(R, s);
const errors = () => result().issues.filter((x) => x.severity === "error");

function render() {
  syncCants(R, s);
  const folioScroll = document.querySelector(".sheet")?.scrollTop || 0;
  const oldFocus = document.activeElement,
    focusId = oldFocus?.id,
    focusAction = oldFocus?.dataset?.action,
    focusName = oldFocus?.dataset?.name,
    focusTab = oldFocus?.dataset?.tab,
    focusKey = oldFocus?.dataset?.key,
    focusBind = oldFocus?.dataset?.bind,
    focusModifier = oldFocus?.dataset?.modifier,
    scrollPosition = window.scrollY;
  const textSelection = oldFocus?.matches(
    'input[type="search"],input[type="text"],input:not([type]),textarea',
  )
    ? {
        start: oldFocus.selectionStart,
        end: oldFocus.selectionEnd,
        direction: oldFocus.selectionDirection,
        scrollLeft: oldFocus.scrollLeft,
      }
    : null;
  captureDisclosures(document.querySelector("main") || document, detailsState);
  if (document.querySelector("[data-market-group]"))
    openedMarketGroups = new Set(
      [...document.querySelectorAll("[data-market-group][open]")].map(
        (x) => x.dataset.category,
      ),
    );
  if (!skillSearch && document.querySelector(".skill-catalog"))
    openedSkillGroups = new Set(
      [...document.querySelectorAll(".skill-catalog-group[open]")].map(
        (x) => x.dataset.group,
      ),
    );
  const d = result().derived,
    eq = result().equipment,
    c = M.career(R, s),
    issues = errors(),
    pending = Array.from({ length: steps.length }, (_, i) =>
      issues.filter((x) => issueTarget(R, s, x).step === i),
    );
  s.step = Math.max(0, Math.min(steps.length - 1, s.step));
  const body = setupOpen
      ? bookSetup(library, R)
      : [
          origins,
          careerView,
          characteristics,
          skills,
          talents,
          gear,
          experience,
          review,
        ][s.step](),
    ready =
      creationStepCount -
      new Set(
        issues
          .map((x) => issueTarget(R, s, x).step)
          .filter((i) => i < creationStepCount),
      ).size;
  $("#app").innerHTML = workspaceShell({
    d,
    eq,
    c,
    issues,
    pending,
    body,
    ready,
  });
  mountInstallControl($("#app"));
  restoreDisclosures(document.querySelector("main"), detailsState);

  filterMarket();
  lockCreationControls();
  save();
  document.querySelector(".sheet").scrollTop = folioScroll;
  let focused = focusId ? document.getElementById(focusId) : null;
  if (!focused && focusAction && focusAction !== "step")
    focused = [...document.querySelectorAll("[data-action]")].find(
      (x) =>
        x.dataset.action === focusAction &&
        x.dataset.name === focusName &&
        x.dataset.tab === focusTab &&
        x.dataset.key === focusKey,
    );
  if (!focused && focusBind)
    focused = [...document.querySelectorAll("[data-bind]")].find(
      (x) =>
        x.dataset.bind === focusBind &&
        x.dataset.key === focusKey &&
        x.dataset.modifier === focusModifier,
    );
  focused?.focus({ preventScroll: true });
  if (
    textSelection &&
    focused?.setSelectionRange &&
    textSelection.start !== null
  ) {
    focused.setSelectionRange(
      textSelection.start,
      textSelection.end,
      textSelection.direction,
    );
    focused.scrollLeft = textSelection.scrollLeft;
  }
  window.scrollTo({ top: scrollPosition, behavior: "instant" });
  bannerSearch.refresh();
}

$("#app").addEventListener(
  "toggle",
  (e) => {
    const detail = e.target;
    if (!detail.isConnected || !detail.dataset.folioSection) return;
    const key = detail.dataset.folioSection;
    if (detail.open) folioOpen.add(key);
    else folioOpen.delete(key);
    saveFolioPreferences();
  },
  true,
);
$("#app").addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el || el.disabled || el.closest("fieldset[disabled]")) return;
  if (["legacy-info", "source-info"].includes(el.dataset.action)) {
    e.preventDefault();
    e.stopPropagation();
  }
  action(el).catch((err) => {
    toast(err.message);
    render();
  });
});
$("#app").addEventListener("keydown", (e) => {
  const tab = e.target.closest('[data-action="xp-tab"]');
  if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
    return;
  e.preventDefault();
  const tabs = ["Characteristics", "Skills", "Talents", "Magic"],
    index = tabs.indexOf(xpTab);
  xpTab =
    tabs[
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? 3
          : (index + (e.key === "ArrowRight" ? 1 : 3)) % 4
    ];
  render();
  document.getElementById("xp-tab-" + xpTab)?.focus({ preventScroll: true });
});
$("#app").addEventListener("input", (e) => {
  if (e.target.dataset.search) {
    const key = e.target.dataset.search;
    if (key === "career") {
      careerSearch = e.target.value;
      careerLimit = 12;
    }
    if (key === "magic") magicFilters.query = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 180);
    return;
  }
  if (e.target.id === "xp-skill-search") {
    if (!skillSearch)
      openedSkillGroups = new Set(
        [...document.querySelectorAll(".skill-catalog-group[open]")].map(
          (x) => x.dataset.group,
        ),
      );
    skillSearch = e.target.value;
    filterSkills();
    return;
  }
  if (e.target.id === "market-search") {
    marketSearch = e.target.value;
    filterMarket();
    return;
  }
  const { bind, key } = e.target.dataset;
  if (bind === "namePart") {
    undoChoice = null;
    setNamePart(s, key, e.target.value);
    save();
    if ($(".sheet h2")) $(".sheet h2").textContent = s.name || "Your character";
    if ($(".identity-preview strong"))
      $(".identity-preview strong").textContent = s.name || "Your character";
    const picker = $("#book-" + key);
    if (picker)
      picker.value = [...picker.options].some((x) => x.value === e.target.value)
        ? e.target.value
        : "";
    return;
  }
  if (bind === "background") {
    undoChoice = null;
    (s.background ??= {})[key] = e.target.value;
    save();
    const picker = $("#book-" + key);
    if (picker)
      picker.value = [...picker.options].some((x) => x.value === e.target.value)
        ? e.target.value
        : "";
    return;
  }
  if (
    ["name", "appearance", "ambition", "partyAmbition", "notes"].includes(bind)
  ) {
    undoChoice = null;
    s[bind] = e.target.value;
    save();
    if (bind === "name" && $(".sheet h2"))
      $(".sheet h2").textContent = s.name || "Your character";
  }
});

$("#app").addEventListener("change", handleChange);
$("#app").addEventListener("change", async (e) => {
  if (e.target.id !== "import-file") return;
  try {
    const file = e.target.files[0];
    if (!file || file.size > 3000000)
      throw Error("Choose a character JSON file under 3 MB.");
    const incoming = JSON.parse(await file.text()),
      next = catalogForCharacter(library, incoming);
    if (
      incoming.version !== 2 ||
      !next.species[incoming.species] ||
      !next.careers.some((c) => c.id === incoming.career) ||
      !Array.isArray(incoming.ledger) ||
      !Array.isArray(incoming.rolls)
    )
      throw Error("Unsupported character file. Start a new WIP character.");
    const old = s,
      oldR = R;
    R = next;
    s = { ...newCharacter(), ...restoreNavigation(incoming) };
    try {
      for (const kind of ["species", "career", "talent"])
        randomTable(R, s, kind);
      result().derived;
      errors();
    } catch {
      s = old;
      R = oldR;
      throw Error("Character file contains invalid values.");
    }
    setupOpen = false;
    undoChoice = null;
    careerPreview = "";
    render();
    toast(
      "Character and selected books loaded. Imported rolls are history, not newly generated dice.",
    );
  } catch (err) {
    toast(err.message);
  }
});
const bannerSearch = createBookSearch(getContext);
render();
if (restoreIssue) toast(`Draft could not be restored: ${restoreIssue}`);
if (document.modelContext?.registerTool) {
  try {
    document.modelContext.registerTool({
      name: "read_character",
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      description:
        "Read the current WFRP character, unresolved choices, XP ledger, and roll history.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              character: s,
              derived: result().derived,
              unresolved: errors(),
            }),
          },
        ],
      }),
    });
    document.modelContext.registerTool({
      name: "show_creation_step",
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      description: "Open a creation step without changing character choices.",
      inputSchema: {
        type: "object",
        properties: {
          step: { type: "integer", minimum: 1, maximum: steps.length },
        },
        required: ["step"],
      },
      execute: async ({ step }) => {
        if (!Number.isInteger(step) || step < 1 || step > steps.length)
          throw Error(`Step must be 1–${steps.length}.`);
        setupOpen = false;
        s.step = step - 1;
        render();
        return { content: [{ type: "text", text: `Opened ${steps[s.step]}` }] };
      },
    });
  } catch {}
}

let searchTimer;
$("#creator-dialog").addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  e.preventDefault();
  action(el).catch((err) => toast(err.message));
});
$("#creator-dialog").addEventListener("input", (e) => {
  if (!e.target.dataset.dialogSearch) return;
  const q = e.target.value.trim().toLowerCase();
  for (const row of $("#creator-dialog").querySelectorAll("[data-dialog-row]"))
    row.hidden = !!q && !row.dataset.dialogRow.includes(q);
});
$("#creator-dialog").addEventListener("close", () => (pendingChange = null));
document.addEventListener("keydown", (e) => {
  if (
    e.target.matches('span.source[role="button"]') &&
    ["Enter", " "].includes(e.key)
  ) {
    e.preventDefault();
    e.target.click();
  }
});
