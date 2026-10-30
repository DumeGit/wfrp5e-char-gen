import {
  createDraftHistory,
  restoreDraftSnapshot,
} from "../../engine/draft-history.mjs";
import { createFeature as createWorkspaceShell } from "./presentation/features/workspace-shell.mjs";
import { createFeature as create_controls } from "./presentation/features/controls.mjs";
import { createFeature as create_origins_view } from "./presentation/features/origins-view.mjs";
import { createFeature as create_creation_views } from "./presentation/features/creation-views.mjs";
import { createFeature as create_experience_view } from "./presentation/features/experience-view.mjs";
import { createFeature as create_shop_view } from "./presentation/features/shop-view.mjs";
import { createFeature as create_review_view } from "./presentation/features/review-view.mjs";
import { createFeature as create_creation_state } from "./presentation/features/creation-state.mjs";
import { createFeature as create_dialogs } from "./presentation/features/dialogs.mjs";
import { createFeature as create_actions } from "./presentation/features/actions.mjs";
import { createResultReader } from "../../engine/character-result.mjs";

import * as M from "../../engine/rules.mjs";
import {
  steps,
  creationStepCount,
  restoreNavigation,
} from "../../engine/ui.mjs";

import { setNamePart } from "../../engine/background.mjs";
import {
  assembleBooks,
  bookSelection,
  catalogForCharacter,
  randomTable,
} from "../../engine/books.mjs";

import { bookSetup } from "./presentation/book-ui.mjs";

import { issueTarget } from "../../engine/issue-targets.mjs";

import { syncCants } from "../../engine/archives-iii.mjs";

import { loadLibrary } from "../../services/content";
import { element } from "../../components/react-elements";
import { decoratePlayerTree } from "./tree";
export async function createPlayerStore(verification = false) {
  const subscribers = new Set();
  let revision = 0,
    snapshot,
    modal = null,
    notice = "",
    timer,
    taskEpoch = 0;
  const handlers = new Map();
  const on = (event, callback) => {
    const callbacks = handlers.get(event) || [];
    callbacks.push(callback);
    handlers.set(event, callbacks);
  };
  const library = await loadLibrary();
  let R = assembleBooks(library);
  const STORAGE =
    "wfrp-fifth-character-ledger-v2" + (verification ? "-verification" : "");
  const newCharacter = () => ({
    ...restoreNavigation(M.fresh()),
    version: 2,
    books: bookSelection(R),
    rollTables: {},
  });
  let s = newCharacter(),
    restoreIssue = "",
    setupOpen = !localStorage.getItem(STORAGE),
    pendingChange = null;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE));
    if (saved) {
      if (saved.version !== 2) throw Error("Start a new WIP character.");
      const next = catalogForCharacter(library, saved);
      if (
        (saved.species !== "" && !next.species[saved.species]) ||
        (saved.career !== "" &&
          !next.careers.some((c) => c.id === saved.career))
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
  let detailsState = new Map(),
    xpTab = "Characteristics",
    careerFilter = "All classes",
    skillSearch = "",
    openedSkillGroups = new Set(),
    marketSearch = "",
    openedMarketGroups = new Set();
  let historyDocument = crypto.randomUUID();
  const historySnapshot = () => ({
    draft: s,
    document: historyDocument,
    setupOpen,
  });
  const history = createDraftHistory(historySnapshot(), {
    restore: (target, current) =>
      restoreDraftSnapshot(target, current, { player: true }),
  });
  function startHistoryDocument() {
    taskEpoch++;
    historyDocument = crypto.randomUUID();
  }
  function travelHistory(direction) {
    const next = history.travel(direction);
    if (!next) return;
    taskEpoch++;
    s = next.draft;
    historyDocument = next.document;
    setupOpen = next.setupOpen;
    R = catalogForCharacter(library, s);
    careerPreview = "";
    pendingChange = null;
    render();
    toast(direction === "undo" ? "Change undone." : "Change redone.");
  }
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
  let saveStatus = "Saved on this device";
  function save(group = null) {
    if (history.record(historySnapshot(), { group })) taskEpoch++;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(s));
      saveStatus = "Saved on this device";
    } catch {
      saveStatus = "Could not save · download a character file";
      toast(
        "Draft could not be saved in this browser. Download a character file to keep it.",
      );
    }
  }

  function getContext() {
    return {
      saveStatus,
      marketShop,
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
      pendingChange,
      setupOpen,
      render,
      sourceInfo,
      dialog,
      showCalculation,
      freeMagicPicker,
      jumpToIssue,
      toast,
      newCharacter,
      detailsState,
      resetDependent,
      rolledCareer,
      changeCareer,
      locked,
      proposedCareer,
      showImpact,
      startHistoryDocument,
      showDialog,
      taskEpoch,
      isCurrentTask: (epoch) => epoch === taskEpoch,
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
      case "pendingChange":
        pendingChange = value;
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
  const { ledgerTable, review, issuePanel, trackerBoxes, hasColourMagic } =
    create_review_view(getContext, setContext);
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

  const readResult = createResultReader();
  const result = () => readResult(R, s);
  const errors = () => result().issues.filter((x) => x.severity === "error");
  function publish(node = snapshot?.node) {
    snapshot = {
      revision: ++revision,
      node,
      modal,
      notice,
      history: { canUndo: history.canUndo, canRedo: history.canRedo },
      draft: structuredClone(s),
      catalogue: R,
      calculated: structuredClone(result()),
    };
    subscribers.forEach((listener) => listener());
  }
  function toast(text) {
    notice = text;
    clearTimeout(timer);
    timer = setTimeout(() => {
      notice = "";
      publish();
    }, 6500);
    publish();
  }
  function showDialog(title, body) {
    modal = { title, body };
    publish();
  }
  function render() {
    syncCants(R, s);
    const d = result().derived,
      issues = errors(),
      pending = Array.from({ length: steps.length }, (_, i) =>
        issues.filter((x) => issueTarget(R, s, x).step === i),
      );
    s.step = Math.max(0, Math.min(steps.length - 1, s.step));
    const body = setupOpen
        ? bookSetup(library, R)
        : !s.species && s.step !== 0
          ? element(
              "div",
              {},
              element("h1", {}, "Choose a Species first"),
              element(
                "p",
                { class: "muted" },
                "Your Species determines the available Careers, starting Characteristics and Species training.",
              ),
              button(
                "step",
                "Choose or roll a Species",
                'data-step="0"',
                "quiet",
              ),
            )
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
    save();
    const node = workspaceShell({
      d,
      issues,
      pending,
      body,
      ready,
    });

    publish(
      decoratePlayerTree(node, {
        s,
        skillSearch,
        marketSearch,
        openedSkillGroups,
        detailsState,
        locked: locked() && !setupOpen && s.step < creationStepCount,
        issues,
      }),
    );
  }
  on("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el || el.disabled || el.closest("fieldset[disabled]")) return;
    if (["undo", "redo"].includes(el.dataset.action)) {
      travelHistory(el.dataset.action);
      return;
    }
    if (["legacy-info", "source-info"].includes(el.dataset.action)) {
      e.preventDefault();
      e.stopPropagation();
    }
    action(el).catch((err) => {
      toast(err.message);
      if (!err.uiOperation) render();
    });
  });
  on("keydown", (e) => {
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
  on("input", (e) => {
    if (e.target.dataset.search) {
      const key = e.target.dataset.search;
      if (key === "career") {
        careerSearch = e.target.value;
        careerLimit = 12;
      }
      if (key === "magic") magicFilters.query = e.target.value;
      render();
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
      render();
      return;
    }
    if (e.target.id === "market-search") {
      marketSearch = e.target.value;
      render();
      return;
    }
    const { bind, key } = e.target.dataset;
    if (bind === "namePart") {
      setNamePart(s, key, e.target.value);
      save(e.target);
      render();
      return;
    }
    if (bind === "background") {
      (s.background ??= {})[key] = e.target.value;
      save(e.target);
      render();
      return;
    }
    if (
      ["name", "appearance", "ambition", "partyAmbition", "notes"].includes(
        bind,
      )
    ) {
      s[bind] = e.target.value;
      save(e.target);
      render();
    }
  });

  on("change", handleChange);
  on("focusout", () => history.breakGroup());
  on("change", async (e) => {
    if (e.target.id !== "import-file") return;
    const requestEpoch = ++taskEpoch;
    try {
      const file = e.target.files[0];
      if (!file || file.size > 3000000)
        throw Error("Choose a character JSON file under 3 MB.");
      const text = await file.text();
      if (requestEpoch !== taskEpoch) return;
      const incoming = JSON.parse(text),
        next = catalogForCharacter(library, incoming);
      if (
        incoming.version !== 2 ||
        (incoming.species !== "" && !next.species[incoming.species]) ||
        (incoming.career !== "" &&
          !next.careers.some((c) => c.id === incoming.career)) ||
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
      startHistoryDocument();
      careerPreview = "";
      render();
      toast(
        "Character and selected books loaded. Imported rolls are history, not newly generated dice.",
      );
    } catch (err) {
      if (requestEpoch === taskEpoch) toast(err.message);
    }
  });

  render();
  if (restoreIssue) toast(`Draft could not be restored: ${restoreIssue}`);
  let searchTimer;
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    persist: () => save(),
    dispatch: (event, e) => {
      for (const handler of handlers.get(event) || []) {
        const value = handler(e);
        value?.catch?.((error) => toast(error.message));
      }
    },
    action,
    render,
    closeDialog: () => {
      modal = null;
      pendingChange = null;
      publish();
    },
    dialogInput: (e) => {
      if (e.target.dataset.dialogSearch) {
        const q = e.target.value.trim().toLowerCase();
        modal = { ...modal, query: q };
        publish();
      }
    },
    toggle: (e) => {
      const detail = e.target;
      if (detail.dataset.detailKey)
        detailsState.set(detail.dataset.detailKey, detail.open);
    },
    breakGroup: () => history.breakGroup(),
    cancelPending: () => {
      taskEpoch++;
      pendingChange = null;
      modal = null;
      notice = "";
      clearTimeout(searchTimer);
      clearTimeout(timer);
      publish();
    },
  };
}
const sessions = new Map();
export function getPlayerStore(verification = false) {
  if (!sessions.has(verification))
    sessions.set(
      verification,
      createPlayerStore(verification).catch((error) => {
        sessions.delete(verification);
        throw error;
      }),
    );
  return sessions.get(verification);
}
