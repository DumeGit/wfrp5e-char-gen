import { loadBookLibrary } from "./books.mjs";
import {
  assembleNPCBooks,
  catalogForNPC,
  npcBooks,
  npcSourceLabel,
} from "./npc-books.mjs";
import * as M from "./rules.mjs";
import { causeTalent, namedCause } from "./talent-targets.mjs";
import { freshNPC, validateNPCState } from "./npc-state.mjs";
import { npcResult, npcQuote } from "./npc-result.mjs";
import { npcText, npcPDF } from "./npc-export.mjs";
import { createNPCViews, btn } from "./features/npc-views.mjs";
import { createBookSearch } from "./features/book-search.mjs";
import { createInstallControl } from "./install-control.mjs";
import { esc } from "./workspace.mjs";
import { npcChecks } from "./npc-flow.mjs";
import { npcFeedback } from "./features/npc-feedback.mjs";

const root = document.querySelector("#app"),
  verify = new URL(location.href).searchParams.has("verify"),
  storage = `wfrp-fifth-npc-creator-v1${verify ? "-verification" : ""}`;
const library = await loadBookLibrary(async (url) => {
  const response = await fetch(url);
  if (!response.ok)
    throw Error(`Cannot load NPC book content (${response.status}).`);
  return response.json();
}).catch((error) => {
  root.innerHTML = `<main class="panel"><h1>Unable to open the GM creator</h1><p>${esc(error.message)}</p><p><a href="npc.html${verify ? "?verify=1" : ""}">Retry loading</a></p></main>`;
  throw error;
});
const history = [];
let R = assembleNPCBooks(library),
  s = freshNPC(R),
  d,
  search,
  saveProblem = "";
try {
  const saved = localStorage.getItem(storage);
  if (saved) {
    const loaded = JSON.parse(saved);
    const next = catalogForNPC(library, loaded);
    s = validateNPCState(next, loaded);
    R = next;
  }
} catch (e) {
  saveProblem = `The saved NPC could not be opened: ${e.message} A new draft is shown.`;
}
const freshUI = () => ({
  filter: "",
  category: "",
  profileSource: "",
  profileLimit: 12,
  previewProfile: "",
  trainingTab: "skills",
  folioExpanded: false,
  trait: "",
  traitValue: "",
  skill: "",
  skillBonus: 0,
  talent: "",
  talentRanks: 1,
  talentTarget: "",
  mutation: R.mutations[0].contentId,
  markStart: "Mental",
  gear: "",
  quantity: 1,
  spell: "",
  xpType: "char",
  xpName: "",
  xpTarget: "",
  amount: 5,
  gearFilter: "",
  magicFilter: "",
});
const ui = freshUI();
const install = createInstallControl(document.querySelector("#pwa-install"));
const context = () => ({
  R,
  s,
  d,
  ui,
  verify,
  books: npcBooks(library).map((p) => p.manifest),
  undoAvailable: history.length > 0,
});
const views = createNPCViews(context);
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 4000);
}
function save() {
  try {
    localStorage.setItem(storage, JSON.stringify(s));
  } catch {
    toast("Device storage is full or unavailable. Save a JSON backup.");
  }
}
function render() {
  const active = document.activeElement,
    id = active?.id,
    position = [active?.selectionStart, active?.selectionEnd],
    scroll = root.querySelector(".npc-folio-body")?.scrollTop || 0;
  const opened = new Set(
    [...root.querySelectorAll("details[open][data-detail-key]")].map(
      (x) => x.dataset.detailKey,
    ),
  );
  d = npcResult(R, s);
  root.innerHTML = views.render();
  install(root);
  for (const el of root.querySelectorAll("details[data-detail-key]"))
    if (opened.has(el.dataset.detailKey)) el.open = true;
  for (const x of d.issues.filter(
    (x) => x.severity === "error" && x.control.step === s.step,
  )) {
    const target = root.querySelector(x.control.target);
    if (!target) continue;
    target.setAttribute("aria-invalid", "true");
    target.classList.add("npc-invalid");
    const group = target.closest(".field") || target.closest("label");
    if (group) {
      const explanation = document.createElement("p");
      explanation.className = "npc-field-error";
      explanation.id = `npc-inline-error-${d.issues.indexOf(x)}`;
      explanation.textContent = x.message;
      group.append(explanation);
      target.setAttribute("aria-describedby", explanation.id);
    }
  }
  const folio = root.querySelector(".npc-folio-body");
  if (folio) folio.scrollTop = scroll;
  const next = id ? document.getElementById(id) : null;
  if (next) {
    next.focus({ preventScroll: true });
    if (
      position[0] !== null &&
      position[0] !== undefined &&
      (["text", "search"].includes(next.type) || next.tagName === "TEXTAREA")
    )
      next.setSelectionRange(...position);
  }
  search?.refresh();
}
function change(label, fn, coalesce = false) {
  const snapshot = structuredClone(s),
    previousCatalog = R;
  try {
    fn();
    validateNPCState(R, s);
  } catch (e) {
    s = snapshot;
    R = previousCatalog;
    throw e;
  }
  if (!coalesce || history.at(-1)?.label !== label)
    history.push({ snapshot, label });
  if (history.length > 100) history.shift();
  s.changes.push({ at: new Date().toISOString(), label });
  save();
  render();
}
function undo() {
  const item = history.pop();
  if (!item) return;
  const rolls = s.rolls,
    changes = s.changes;
  const previousBooks = JSON.stringify(s.books);
  s = item.snapshot;
  R = catalogForNPC(library, s);
  if (JSON.stringify(s.books) !== previousBooks) Object.assign(ui, freshUI());
  s.rolls = rolls;
  s.changes = [
    ...changes,
    { at: new Date().toISOString(), label: `Undo: ${item.label}` },
  ];
  save();
  render();
}
function dialog(title, body) {
  document.querySelector("#creator-dialog-title").textContent = title;
  document.querySelector("#creator-dialog-body").innerHTML = body;
  const box = document.querySelector("#creator-dialog");
  if (!box.open) box.showModal();
}
function download(bytes, type, ext) {
  const a = document.createElement("a"),
    url = URL.createObjectURL(new Blob([bytes], { type }));
  a.href = url;
  a.download = `${s.name.replace(/[^\p{L}\p{N}-]+/gu, "-") || "npc"}${ext}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
const form = (id) => document.getElementById(id)?.value || "";
const integer = (v, min = 0) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > 1000000)
    throw Error(`Enter a whole number from ${min} to 1000000.`);
  return n;
};
function rollMutation(table, origin = "GM") {
  const n = M.roll(s, `${table} Mutation`, 1, 100, 189)[0],
    m = R.mutations.find(
      (x) => x.category === table && n >= x.min && n <= x.max,
    );
  s.mutations.push({ id: m.contentId, origin, location: "" });
}
function setProfile(id) {
  if (s.ledger.length)
    throw Error("Undo paid development before changing the base profile.");
  change("Choose printed profile", () => {
    const rolls = s.rolls,
      changes = s.changes;
    s = freshNPC(R, id);
    s.rolls = rolls;
    s.changes = changes;
  });
}
async function action(el) {
  const a = el.dataset.npcAction;
  if (a === "preview-profile") {
    ui.previewProfile = el.dataset.id;
    render();
    return;
  }
  if (a === "more-profiles") {
    ui.profileLimit += 12;
    render();
    return;
  }
  if (a === "tab") {
    if (
      el.dataset.key !== "trainingTab" ||
      !["skills", "talents"].includes(el.dataset.value)
    )
      return;
    ui.trainingTab = el.dataset.value;
    render();
    return;
  }
  if (a === "books") {
    s.step = 0;
    render();
    const books = root.querySelector("#npc-books");
    books.open = true;
    books.scrollIntoView({ block: "center" });
    save();
    return;
  }
  if (a === "issues") {
    dialog("Required choices & source notes", npcFeedback(R, d, { all: true }));
    return;
  }
  if (a === "confirm-books") {
    const ids = JSON.parse(el.dataset.books);
    document.querySelector("#creator-dialog").close();
    change("Change selected NPC books; start a new draft", () => {
      R = assembleNPCBooks(library, ids);
      s = freshNPC(R);
      Object.assign(ui, freshUI());
    });
    return;
  }
  if (a === "step") {
    s.step = Number(el.dataset.step);
    if (el.dataset.tab === "talents") ui.trainingTab = "talents";
    save();
    render();
    root.querySelector(".panel").scrollIntoView({ block: "start" });
    return;
  }
  if (a === "reference") {
    search.openEntry(el.dataset.id);
    return;
  }
  if (a === "profile") {
    if (el.dataset.id === s.profile) return;
    if (s.changes.length) {
      dialog(
        "Start from another printed profile?",
        `<p>This replaces the current NPC’s customisations. Undo will restore this draft.</p>${btn("confirm-profile", "Use profile", `data-id="${esc(el.dataset.id)}"`, "primary")}${btn("close", "Keep current NPC")}`,
      );
      return;
    }
    setProfile(el.dataset.id);
    return;
  }
  if (a === "confirm-profile") {
    document.querySelector("#creator-dialog").close();
    setProfile(el.dataset.id);
    return;
  }
  if (a === "close") {
    document.querySelector("#creator-dialog").close();
    return;
  }
  if (a === "save") {
    download(JSON.stringify(s, null, 2), "application/json", ".npc.json");
    return;
  }
  if (a === "load") {
    document.querySelector("#npc-import").click();
    return;
  }
  if (a === "new") {
    dialog(
      "New NPC",
      `<p>Start a fresh draft? Save your current NPC first if you need a file backup. Undo can restore it during this session.</p>${btn("confirm-new", "Start new NPC", "", "primary")}${btn("close", "Keep current NPC")}`,
    );
    return;
  }
  if (a === "confirm-new") {
    document.querySelector("#creator-dialog").close();
    change("New NPC", () => {
      s = freshNPC(R);
    });
    return;
  }
  if (a === "duplicate") {
    change("Duplicate NPC", () => {
      s = structuredClone(s);
      s.name += " (copy)";
    });
    toast(
      "Duplicate draft created. The original remains available through Undo; save each as JSON to keep both.",
    );
    return;
  }
  if (a === "undo") {
    undo();
    return;
  }
  if (a === "folio-toggle") {
    ui.folioExpanded = !ui.folioExpanded;
    render();
    root
      .querySelector(ui.folioExpanded ? "#npc-folio" : "#npc-main")
      .scrollIntoView({ block: "start" });
    return;
  }
  if (a === "template-reference") {
    dialog(
      "NPC development templates · pp. 353–354",
      R.templates
        .map((t) => `<h3>${esc(t.name)}</h3><p>${esc(t.text)}</p>`)
        .join(""),
    );
    return;
  }
  if (a === "calculation") {
    dialog(
      `${el.dataset.key} calculation`,
      `<ol>${d.steps[el.dataset.key].map((x) => `<li>${esc(x.label)}: ${x.value ?? "—"} · p. ${x.source.page}</li>`).join("")}</ol>`,
    );
    return;
  }
  if (a === "issue") {
    const x = d.issues[Number(el.dataset.issueIndex)];
    if (!x) return;
    document.querySelector("#creator-dialog").close();
    s.step = x.control.step;
    if (s.step === 3)
      ui.trainingTab =
        x.control.target === "#npc-talent" ? "talents" : "skills";
    if (x.code === "amphibious.swim-bonus") ui.skill = "Swim";
    if (x.control.target === "#npc-trait-value") {
      const names = {
        "mark.god": "Mark of Chaos",
        "training.option": "Trained",
        "magic.patron": "Miracles",
      };
      const trait = d.traits.find((t) => t.name === names[x.code]);
      if (trait) {
        ui.trait = trait.id;
        ui.traitValue = trait.value;
      }
    }
    render();
    const target =
      root.querySelector(x.control.target) || root.querySelector("#npc-main");
    for (let node = target; node && node !== root; node = node.parentElement)
      if (node.tagName === "DETAILS") node.open = true;
    if (!target.matches("input,select,textarea,button")) target.tabIndex = -1;
    target.classList.add("npc-issue-highlight");
    target?.scrollIntoView({ block: "center" });
    target?.focus({ preventScroll: true });
    save();
    return;
  }
  if (
    ["copy", "text", "pdf", "pdf-record"].includes(a) &&
    npcChecks(d).blocked
  ) {
    dialog(
      "Resolve required choices before export",
      npcFeedback(R, d, { all: true }),
    );
    return;
  }
  if (a === "copy") {
    await navigator.clipboard.writeText(npcText(R, s, { result: d }));
    toast("Stat block copied.");
    return;
  }
  if (a === "text" || a === "record-text") {
    download(
      npcText(R, s, { record: a === "record-text", result: d }),
      "text/plain;charset=utf-8",
      ".txt",
    );
    return;
  }
  if (a === "pdf" || a === "pdf-record") {
    if (d.issues.some((x) => x.severity === "error"))
      throw Error(
        "Resolve the errors in Checks & source discrepancies before exporting a PDF.",
      );
    download(
      await npcPDF(R, s, { record: a === "pdf-record", result: d }),
      "application/pdf",
      a === "pdf-record" ? "-record.pdf" : "-statblock.pdf",
    );
    return;
  }
  if (a === "suggest-trait") {
    ui.trait = el.dataset.id;
    ui.traitValue = "";
    render();
    document
      .querySelector("#npc-trait-select")
      ?.scrollIntoView({ block: "center" });
    return;
  }
  change(el.textContent.trim(), () => {
    if (a === "individualise") {
      for (const k of M.KEYS)
        if (d.stats[k] !== null && d.profile.stats[k] !== null) {
          const values = M.roll(s, `Individualise ${k}`, 2, 10, 318);
          s.characteristicRolls[k] = values;
        }
    } else if (a === "reset-scores") s.overrides = {};
    else if (a === "reset-individualise") s.characteristicRolls = {};
    else if (a === "add-trait") {
      const id = form("npc-trait-select"),
        t = R.traits.find((x) => x.contentId === id);
      if (!t) throw Error("Choose a Trait.");
      const v = form("npc-trait-value");
      if (d.traits.some((x) => x.id === id && x.value === v))
        throw Error("That Trait is already added.");
      if (
        ![
          "Trained",
          "Afraid",
          "Animosity",
          "Hatred",
          "Immunity",
          "Disease",
          "Blessed",
          "Miracles",
          "Spellcaster",
          "Striding Gait",
        ].includes(t.name)
      ) {
        s.traits = s.traits.filter((x) => x.id !== id);
        if (
          d.traits.some((x) => x.id === id && x.printed) &&
          !s.removedTraits.includes(id)
        )
          s.removedTraits.push(id);
      }
      s.traits.push({ id, value: v });
    } else if (a === "remove-trait") {
      if (el.dataset.printed === "true") s.removedTraits.push(el.dataset.id);
      else
        s.traits = s.traits.filter(
          (x) => !(x.id === el.dataset.id && x.value === el.dataset.value),
        );
    } else if (a === "training-roll")
      s.trainingRoll = {
        faces: M.roll(s, "Trained (Broken) Fellowship", 2, 10, 363),
      };
    else if (a === "mark-roll") {
      const n = M.roll(s, "Mark of Tzeentch Mutation count", 1, 10, 359)[0];
      s.markRoll = { faces: [n], start: ui.markStart };
      s.mutations = s.mutations.filter((x) => x.origin !== "mark");
      for (let i = 0; i < Math.ceil(n / 3); i++)
        rollMutation(
          i % 2
            ? ui.markStart === "Mental"
              ? "Physical"
              : "Mental"
            : ui.markStart,
          "mark",
        );
    } else if (a === "add-skill") {
      const name = form("npc-add-skill"),
        n = integer(form("npc-skill-bonus"));
      s.skills = s.skills.filter((x) => x.name !== name);
      s.skills.push({ name, bonus: n });
    } else if (a === "remove-printed-skill")
      s.removedSkills.push(el.dataset.name);
    else if (a === "remove-skill")
      s.skills = s.skills.filter((x) => x.name !== el.dataset.name);
    else if (a === "add-talent") {
      let name = form("npc-talent");
      if (/\(Any(?: Cause)?\)$/.test(name)) {
        const target = form("npc-talent-target").trim();
        if (!target) throw Error("Specify the Talent target.");
        name = causeTalent(name)
          ? namedCause(target)
          : name.replace(/\(Any\)$/, `(${target})`);
        if (!name) throw Error("Specify a Cause, without brackets.");
      }
      if (!M.talentInfo(R, name)) throw Error("Choose a Talent.");
      s.talents = s.talents.filter((x) => x.name !== name);
      s.talents.push({ name, ranks: integer(form("npc-talent-ranks"), 1) });
    } else if (a === "remove-talent")
      s.talents = s.talents.filter((x) => x.name !== el.dataset.name);
    else if (a === "remove-printed-talent")
      s.removedTalents.push(el.dataset.name);
    else if (a === "add-mutation")
      s.mutations.push({
        id: form("npc-mutation"),
        origin: "GM",
        location: "",
      });
    else if (a === "roll-mutation") rollMutation(el.dataset.table);
    else if (a === "remove-mutation")
      s.mutations.splice(Number(el.dataset.index), 1);
    else if (a === "add-gear") {
      const id = form("npc-gear"),
        quantity = integer(form("npc-gear-quantity"), 1),
        old = s.gear.find((x) => x.id === id);
      if (old) old.quantity += quantity;
      else s.gear.push({ id, quantity });
    } else if (a === "remove-gear") {
      s.gear = s.gear.filter((x) => x.id !== el.dataset.id);
      delete s.attackOverrides[el.dataset.id];
    } else if (a === "add-spell") {
      const [id, lore] = form("npc-spell").split("|");
      if (!id) throw Error("Choose a spell.");
      s.removedSpells = s.removedSpells.filter((x) => x !== id);
      s.spells.push({ id, lore });
      ui.spell = "";
    } else if (a === "remove-spell") {
      if (
        s.ledger.some(
          (x) => x.type === "spell" && x.contentId === el.dataset.id,
        )
      )
        throw Error("Undo its XP purchase before removing a paid spell.");
      s.spells = s.spells.filter(
        (x) => x.id !== el.dataset.id || x.lore !== el.dataset.lore,
      );
      s.removedSpells.push(el.dataset.id);
    } else if (a === "buy-xp") {
      const type = ui.xpType,
        selected = form("npc-xp-name"),
        name =
          type === "talent" && causeTalent(selected)
            ? namedCause(form("npc-xp-target")) || selected
            : selected,
        amount = ["talent", "spell"].includes(type) ? 1 : Number(ui.amount),
        [contentId, lore] = name.split("|"),
        q = npcQuote(R, s, type, name, amount, { contentId, lore });
      if (q.error) throw Error(q.error);
      s.ledger.push({
        type,
        name:
          type === "spell"
            ? R.spells.find((x) => x.contentId === contentId).name
            : name,
        amount,
        cost: q.cost,
        startingAdvances: q.advances,
        source: q.source,
        at: new Date().toISOString(),
        ...(type === "spell" ? { contentId, lore } : {}),
      });
    } else if (a === "undo-xp") s.ledger.pop();
    else throw Error("Unknown NPC action.");
  });
}
function input(el) {
  if (el.dataset.ui) {
    ui[el.dataset.ui] = el.value;
    if (["filter", "category", "profileSource"].includes(el.dataset.ui))
      ui.profileLimit = 12;
    if (["trait", "xpType"].includes(el.dataset.ui)) {
      if (el.dataset.ui === "trait") ui.traitValue = "";
      else ui.xpName = "";
    }
    render();
    return;
  }
  if (el.dataset.state) {
    const key = el.dataset.state;
    if (key === "step") {
      s.step = integer(el.value);
      save();
      render();
      root.querySelector("#npc-main").scrollIntoView({ block: "start" });
      return;
    }
    if (s.ledger.length && ["template", "career", "careerLevel"].includes(key))
      throw Error("Undo paid development before changing this choice.");
    change(
      `Set ${key}`,
      () => {
        s[key] = ["step", "careerLevel", "xpBudget", "tbOverride"].includes(key)
          ? el.value === "" && key === "tbOverride"
            ? null
            : integer(el.value)
          : el.value;
        if (key === "template") {
          s.templateSkills = {};
          s.templateTalents = {};
          s.spells = [];
        }
        if (key === "career") s.advanceCounts = { char: {}, skill: {} };
      },
      ["name", "notes"].includes(key),
    );
    return;
  }
  change("Edit GM customisation", () => {
    if (el.dataset.attackId) {
      const id = el.dataset.attackId;
      s.attackOverrides[id] ||= {};
      if (el.value === "") delete s.attackOverrides[id][el.dataset.attackField];
      else s.attackOverrides[id][el.dataset.attackField] = integer(el.value);
    } else if (el.dataset.score) {
      if (el.value === "") delete s.overrides[el.dataset.score];
      else s.overrides[el.dataset.score] = integer(el.value);
    } else if (el.dataset.templateSkill) {
      const k = el.dataset.templateSkill;
      s.templateSkills[k] ||= [];
      s.templateSkills[k][Number(el.dataset.slot)] = el.value;
    } else if (el.dataset.templateTalent)
      s.templateTalents[el.dataset.templateTalent] = el.value;
    else if (el.dataset.advanceCount) {
      if (
        s.ledger.some(
          (x) =>
            x.type === el.dataset.advanceCount && x.name === el.dataset.name,
        )
      )
        throw Error(
          "Undo paid development before changing its starting Advance counts.",
        );
      const group = s.advanceCounts[el.dataset.advanceCount];
      if (el.value === "") delete group[el.dataset.name];
      else group[el.dataset.name] = integer(el.value);
    } else if (el.dataset.mutationLocation)
      s.mutations[Number(el.dataset.mutationLocation)].location = el.value;
    else if (el.dataset.attackToggle) {
      const key =
          el.dataset.optional === "true" ? "optionalAttacks" : "removedAttacks",
        include = el.dataset.optional === "true" ? el.checked : !el.checked;
      s[key] = s[key].filter((x) => x !== el.dataset.attackToggle);
      if (include) s[key].push(el.dataset.attackToggle);
    } else if (el.dataset.baseArmourToggle) {
      s.removedArmour = s.removedArmour.filter(
        (x) => x !== el.dataset.baseArmourToggle,
      );
      if (!el.checked) s.removedArmour.push(el.dataset.baseArmourToggle);
    } else if (el.dataset.armourToggle) {
      s.optionalArmour = s.optionalArmour.filter(
        (x) => x !== el.dataset.armourToggle,
      );
      if (el.checked) s.optionalArmour.push(el.dataset.armourToggle);
    }
  });
}
root.addEventListener("click", (e) => {
  const legacy = e.target.closest('[data-action="legacy-info"]');
  if (legacy) {
    dialog(
      "Legacy adaptation",
      `<p>${esc(legacy.dataset.explanation)}</p>${btn("close", "Close")}`,
    );
    return;
  }
  const el = e.target.closest("[data-npc-action]");
  if (el) action(el).catch((err) => toast(err.message));
});
document.querySelector("#creator-dialog").addEventListener("click", (e) => {
  const el = e.target.closest("[data-npc-action]");
  if (el) action(el).catch((err) => toast(err.message));
  else if (e.target.closest('[data-action="close-dialog"]'))
    document.querySelector("#creator-dialog").close();
});
root.addEventListener("input", (e) => {
  if (
    e.target.matches(
      'input[type="text"], input[type="search"], input[type="number"], textarea',
    ) ||
    e.target.dataset.ui
  ) {
    try {
      input(e.target);
    } catch (err) {
      toast(err.message);
    }
  }
});
root.addEventListener("change", async (e) => {
  if (e.target.dataset.npcBook) {
    const id = e.target.dataset.npcBook;
    const ids = R.selection.filter((b) => b.id !== id).map((b) => b.id);
    if (e.target.checked) ids.push(id);
    render();
    const attributes = `data-books="${esc(JSON.stringify(ids))}"`;
    if (
      s.changes.length ||
      s.ledger.length ||
      s.notes ||
      s.name !== d.profile.name
    ) {
      dialog(
        "Changing books starts a new NPC",
        `<p>The selected books determine available profiles, rules and equipment. This starts a fresh draft; session Undo can restore the current NPC.</p>${btn("confirm-books", "Change books", attributes, "primary")}${btn("close", "Keep current NPC")}`,
      );
    } else {
      await action({
        dataset: { npcAction: "confirm-books", books: JSON.stringify(ids) },
      });
    }
    return;
  }
  if (e.target.id === "npc-import") {
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5000000)
        throw Error("NPC files must be smaller than 5 MB.");
      const fileState = JSON.parse(await file.text());
      const next = catalogForNPC(library, fileState);
      const loaded = validateNPCState(next, fileState);
      change("Load NPC file (imported dice are unverified)", () => {
        R = next;
        s = loaded;
        Object.assign(ui, freshUI());
      });
      toast("NPC loaded.");
    } catch (err) {
      toast(err.message);
    }
    return;
  }
  if (
    !e.target.matches(
      'input[type="text"], input[type="search"], input[type="number"], textarea',
    ) &&
    !e.target.dataset.ui
  ) {
    try {
      input(e.target);
    } catch (err) {
      toast(err.message);
      render();
    }
  }
});
search = createBookSearch(
  () => ({
    R,
    s,
    referenceOnly: true,
    result: () => d,
    ref: (x) =>
      btn(
        "reference",
        npcSourceLabel(R, x),
        `data-id="${esc(x.contentId)}" data-action="npc-reference"`,
        "source-button",
      ),
    talentDetailsBody: (name) =>
      `<p>${esc(M.talentInfo(R, name)?.text || "See source.")}</p>`,
    spellDetailsBody: (x) => `<p>${esc(x.text)}</p>`,
    action: async (el) => {
      if (el.dataset.action === "legacy-info")
        dialog(
          "Legacy adaptation",
          `<p>${esc(el.dataset.explanation)}</p>${btn("close", "Close")}`,
        );
      else if (el.dataset.npcAction) await action(el);
    },
    toast,
  }),
  () => {},
);
render();
if (saveProblem) toast(saveProblem);
window.addEventListener("wfrp:before-update", save);
