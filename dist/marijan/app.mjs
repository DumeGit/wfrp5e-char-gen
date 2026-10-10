import { speciesEntry } from "./catalogue.mjs";
import { loadBookBundle } from "../book-bundle.mjs";
import { createReferenceSearch } from "../reference-search.mjs";
import { captureDisclosures, restoreDisclosures } from "../disclosures.mjs";
import { createInstallControl } from "../install-control.mjs";
import { createMobileShell } from "../mobile-shell.mjs";
import { enhanceInterface, withBusy } from "../interface-kit.mjs";
import { createDraftHistory } from "../draft-history.mjs";
import { esc, button, field, score, select } from "../controls.mjs";
import {
  createMarijanCatalogue,
  findEntries,
  GROUPS,
  entrySource,
  careerLabel,
} from "./catalogue.mjs";
import {
  freshMarijan,
  validateMarijan,
  calculateMarijan,
  addEntry,
  applySpeciesDefaults,
  rollCharacteristics,
  fromPlayer,
} from "./model.mjs";
import { workspace, rowHTML, LABELS } from "./views.mjs";
const mobileShell = createMobileShell();

const root = document.querySelector("#app"),
  dialog = document.querySelector("#creator-dialog"),
  body = document.querySelector("#creator-dialog-body"),
  title = document.querySelector("#creator-dialog-title"),
  verify = new URLSearchParams(location.search).has("verify"),
  storage = "wfrp-marijan-v1" + (verify ? "-verification" : ""),
  savedKey = storage + "-saves",
  disclosures = new Map(),
  searches = Object.fromEntries(
    GROUPS.map((g) => [g, { query: "", book: "", count: 8 }]),
  ),
  install = createInstallControl(document.querySelector("#pwa-install"));
let catalogue,
  history,
  s,
  r,
  references,
  timer,
  message = "",
  saved = [];
let pendingGenerated, generationRequest;
let historyDocument = crypto.randomUUID();
const historySnapshot = () => ({ draft: s, document: historyDocument });
async function generationDialog(reusing = false) {
  const { availableGenerationCareers } = await import("./generation.mjs");
  const draft = {
      ...s,
      generationOrigin:
        (reusing
          ? body.querySelector("#mm-generate-origin")?.value
          : undefined) ??
        s.generationOrigin ??
        "",
    },
    choices = availableGenerationCareers(catalogue, draft),
    current =
      (reusing
        ? body.querySelector("#mm-generate-career")?.value
        : undefined) ??
      r.career?.contentId ??
      s.career,
    target =
      (reusing
        ? Number(body.querySelector("#mm-generate-level")?.value)
        : undefined) ?? Math.min(4, Math.max(1, s.level));
  modal(
    "Generate Fifth Edition character",
    `<p>Choose Species in Identity first. Generation replaces all values and entries, keeping the name and selected Species/Career. Review the random result before applying it; Undo restores your draft.</p><div class="mm-fields">${select("Origin rules", "mm-generate-origin", [["", "Base Species profile"], ...catalogue.origins.filter((o) => o.species === s.species).map((o) => [o.id, o.name])], draft.generationOrigin)}${select("Target Career level", "mm-generate-level", [1, 2, 3, 4], target)}${select("Starting Career", "mm-generate-career", [["", "Choose a Career"], ...choices.map((c) => [c.contentId, careerLabel(catalogue, c)])], current)}</div><p class="small">Core creation: five Species Skills, native languages, eight Career Skill Advances, Species Talents, one Career Talent, first-level and Class equipment. Levels 2–4 use the approved 10/12/14 tracker method with core XP prices. Higher-level Trappings are not awarded.</p>${button("Preview random character", "generate-preview", "", "primary")}<div id="mm-generation-preview"></div>`,
  );
}
function toast(text) {
  const el = document.querySelector("#toast");
  el.textContent = text;
  clearTimeout(timer);
  timer = setTimeout(() => (el.textContent = ""), 4500);
}
function modal(label, html) {
  title.textContent = label;
  body.innerHTML = html;
  enhanceInterface(body);
  if (!dialog.open) dialog.showModal();
}
function download(bytes, type, name) {
  const blob = new Blob([bytes], { type }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const fileName = () =>
  (s.name || "character").replace(/[^\p{L}\p{N} _-]/gu, "_").slice(0, 80);
function persist() {
  try {
    localStorage.setItem(storage, JSON.stringify(s));
    message = verify ? "Isolated test draft" : "Autosaved on this device";
  } catch {
    message = "Device storage unavailable; download a JSON backup.";
  }
}
function commit(change, full = false) {
  const previousDraft = s;
  change();
  if (s !== previousDraft) historyDocument = crypto.randomUUID();
  history.record(historySnapshot());
  persist();
  if (full) render();
  else refresh();
}
function render() {
  const focused = document.activeElement,
    historyFocus = focused?.closest(".history-controls")
      ? focused.dataset.action
      : null;
  captureDisclosures(root, disclosures);
  r = calculateMarijan(catalogue, s);
  root.innerHTML = workspace(catalogue, s, r, verify);
  install(root.querySelector("#mm-install"));
  mobileShell.mount(root, history);
  restoreDisclosures(root, disclosures);
  for (const group of GROUPS) {
    root.querySelector(`[data-find="${group}"]`).value = searches[group].query;
    root.querySelector(`[data-book-filter="${group}"]`).value =
      searches[group].book;
  }
  refresh();
  if (historyFocus)
    root
      .querySelector(`.history-controls [data-action="${historyFocus}"]`)
      ?.focus({ preventScroll: true });
}
function refresh() {
  r = calculateMarijan(catalogue, s);
  for (const el of root.querySelectorAll("[data-result]")) {
    const [type, key] = el.dataset.result.split(":");
    el.textContent = score(
      type === "stat"
        ? r.stats[key]
        : type === "derived"
          ? r.values[key]
          : r.xpTotal,
    );
  }
  for (const el of root.querySelectorAll("[data-override]"))
    if (s.overrides[el.dataset.override] === null)
      el.value = r.values[el.dataset.override] ?? "";
  for (const el of root.querySelectorAll("[data-auto-label]"))
    el.textContent = `Calculated ${score(r.auto[el.dataset.autoLabel])}`;
  for (const row of r.skills) {
    const el = document.getElementById(`mm-total-${row.key}`);
    if (
      el &&
      row.total !== null &&
      s.entries.skills.find((x) => x.key === row.key).total === null
    )
      el.value = row.total;
  }
  for (const [id, value] of [
    ["mm-species", s.species],
    ["mm-career", r.career?.contentId || s.career],
  ]) {
    const control = root.querySelector(`#${id}`);
    for (const option of control.querySelectorAll("[data-custom-option]"))
      option.remove();
    if (
      value &&
      ![...control.options].some((option) => option.value === value)
    ) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value + " (custom)";
      option.dataset.customOption = "";
      control.append(option);
    }
    control.value = value;
  }
  for (const k of Object.keys(LABELS)) {
    const mode = root.querySelector(`[data-field="${k}"]`),
      manual = s.overrides[k] !== null;
    mode.textContent = manual ? "Manual" : "Auto";
    mode.setAttribute("aria-pressed", String(manual));
    mode.setAttribute(
      "aria-label",
      `${LABELS[k]}: ${manual ? "return to automatic" : "switch to manual"}`,
    );
  }
  root.querySelector("#mm-folio-name").textContent = s.name || "Your character";
  root.querySelector("#mm-folio-identity").textContent =
    s.species +
    (r.career ? ` · ${r.career.name}` : s.career ? ` · ${s.career}` : "");
  root.querySelector("#mm-career-summary").innerHTML = r.career
    ? `${esc(r.career.class)} · ${esc(r.career.levels.find((l) => l.level === s.level)?.name || "Custom level")} · ${esc(entrySource(catalogue, r.career))} ${r.career.adaptation ? button("Legacy", "career-reference", "", "legacy-tag") : ""} ${button("Read Career", "career-reference", "", "source-button")}`
    : "A Career is a label here; it does not limit your choices.";
  const species = speciesEntry(catalogue, s.species);
  root.querySelector("#mm-species-source").innerHTML = species
    ? `${esc(entrySource(catalogue, species))} ${species.adaptation ? button("Legacy", "species-reference", "", "legacy-tag") : ""} ${button("Species reference", "species-reference", "", "source-button")}`
    : "Custom Species; no printed defaults.";
  root.querySelector("#mm-counts").innerHTML =
    `<dl class="mm-entry-counts">${GROUPS.map((g) => `<dt>${g === "gear" ? "Equipment" : g[0].toUpperCase() + g.slice(1)}</dt><dd>${s.entries[g].length}</dd>`).join("")}</dl>`;
  root.querySelector("#mm-warnings").innerHTML = r.warnings
    .map((w) => `<p>${esc(w)}</p>`)
    .join("");
  root.querySelector("#mm-save-status").textContent = message;
  mobileShell.refreshHistory(history);
  mobileShell.refresh();
  enhanceInterface(root);
}
function renderList(group) {
  captureDisclosures(root, disclosures);
  r = calculateMarijan(catalogue, s);
  root.querySelector(`#mm-list-${group}`).innerHTML = s.entries[group].length
    ? s.entries[group].map((x) => rowHTML(catalogue, s, r, group, x)).join("")
    : '<p class="mm-empty">Nothing added yet.</p>';
  restoreDisclosures(root, disclosures);
  refresh();
}
function results(group) {
  const state = searches[group],
    el = root.querySelector(`#mm-results-${group}`),
    rows = findEntries(catalogue, group, state.query, state.book),
    visible = rows.slice(0, state.count);
  el.hidden = false;
  el.innerHTML =
    visible
      .map(
        (x) =>
          `<div class="mm-search-choice"><div><strong>${esc(x.name)}</strong><small>${esc(entrySource(catalogue, x))}${x.adaptation ? " · Legacy" : ""}${x.kind !== group ? ` · ${esc(x.kind)}` : ""}</small></div>${button("+ Add", "add", `data-id="${esc(x.id)}" data-group="${group}" aria-label="Add ${esc(x.name)}"`)}</div>`,
      )
      .join("") +
    (rows.length > state.count
      ? button(
          `More (${rows.length - state.count})`,
          "more",
          `data-group="${group}"`,
        )
      : "") +
    (!rows.length
      ? '<p class="mm-empty">No matches. Try another name or add a custom entry.</p>'
      : "");
}
function entry(group, key) {
  return s.entries[group]?.find((x) => x.key === key);
}
function input(el, final = false) {
  const d = el.dataset;
  if (d.find) {
    Object.assign(searches[d.find], { query: el.value, count: 8 });
    results(d.find);
    return;
  }
  if (d.bookFilter) {
    Object.assign(searches[d.bookFilter], { book: el.value, count: 8 });
    results(d.bookFilter);
    return;
  }
  if (el.id === "mm-career-search") {
    const select = root.querySelector("#mm-career"),
      q = el.value.toLowerCase();
    select.innerHTML =
      '<option value="">No Career</option>' +
      catalogue.careers
        .filter(
          (c) => c.name.toLowerCase().includes(q) || c.contentId === s.career,
        )
        .map(
          (c) =>
            `<option value="${esc(c.contentId)}" ${c.contentId === s.career ? "selected" : ""}>${esc(careerLabel(catalogue, c))}</option>`,
        )
        .join("");
    return;
  }
  let value = el.type === "checkbox" ? el.checked : el.value;
  if (el.type === "number") {
    if (el.value === "" && !final) return;
    value =
      el.value === ""
        ? d.override ||
          d.entryField === "total" ||
          ["enc", "ap"].includes(d.entryField)
          ? null
          : 0
        : Number(el.value);
    if (value !== null && !Number.isFinite(value)) return;
  }
  if (d.path) {
    const parts = d.path.split("."),
      obj = parts.slice(0, -1).reduce((o, k) => o[k], s),
      key = parts.at(-1);
    if (obj[key] === value) return;
    obj[key] = value;
  } else if (d.entryField) {
    const x = entry(d.group, d.key);
    if (!x || x[d.entryField] === value) return;
    x[d.entryField] = value;
  } else if (d.override) {
    if (s.overrides[d.override] === value) return;
    s.overrides[d.override] = value;
    if (value === null) {
      el.readOnly = true;
      el.previousElementSibling.querySelector("button").textContent = "Auto";
    }
  } else return;
  history.record(historySnapshot(), { group: el });
  persist();
  refresh();
}
function importFile(player = false) {
  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = ".json,application/json";
  picker.addEventListener("change", async () => {
    try {
      const parsed = JSON.parse(await picker.files[0].text());
      if (player) await copyPlayer(parsed);
      else {
        const next = validateMarijan(parsed);
        commit(() => (s = next), true);
        toast("Marijan character loaded.");
      }
    } catch (e) {
      toast(e.message);
    }
  });
  picker.click();
}
async function copyPlayer(pc) {
  if (!pc || pc.type || pc.version !== 2)
    throw Error("Choose a current Player creator JSON save.");
  const [{ catalogForCharacter }, { characterResult }] = await Promise.all([
    import("../books.mjs"),
    import("../character-result.mjs"),
  ]);
  const R = catalogForCharacter(library, pc),
    result = characterResult(R, pc),
    next = fromPlayer(catalogue, pc, result, R);
  validateMarijan(next);
  commit(() => (s = next), true);
  dialog.close();
  toast(
    "Copied player values. The original is unchanged; existing bonuses are already included.",
  );
}
async function action(el) {
  const { action: a, group, key } = el.dataset;
  if (a === "close-dialog") {
    dialog.close();
    return;
  }
  if (a === "generate") {
    pendingGenerated = null;
    await generationDialog();
    return;
  }
  if (a === "generate-preview") {
    await withBusy(el, "Generating…", async () => {
      const { generateCharacter } = await import("./generation.mjs");
      generationRequest = {
        ...s,
        career: body.querySelector("#mm-generate-career").value,
        generationOrigin: body.querySelector("#mm-generate-origin").value,
      };
      pendingGenerated = generateCharacter(
        catalogue,
        generationRequest,
        Number(body.querySelector("#mm-generate-level").value),
      );
      const result = calculateMarijan(catalogue, pendingGenerated);
      body.querySelector("#mm-generation-preview").innerHTML =
        `<div class="notice"><strong>Random result · ${esc(result.career.name)}, level ${pendingGenerated.level}</strong><p>${pendingGenerated.xpSpent} XP spent · ${pendingGenerated.tracker} tracker boxes · ${pendingGenerated.entries.skills.length} Skills · ${pendingGenerated.entries.talents.length} Talents · ${pendingGenerated.entries.gear.length} equipment entries.</p><p>${Object.entries(
          result.stats,
        )
          .map(([k, v]) => `${k} ${v}`)
          .join(
            " · ",
          )}</p>${pendingGenerated.generation.notes.map((n) => `<p class="small">${esc(n)}</p>`).join("")}${button("Use generated character", "generate-apply", "", "primary")}</div>`;
    });
    return;
  }
  if (a === "generate-apply") {
    if (!pendingGenerated) return;
    const next = validateMarijan(pendingGenerated);
    commit(() => (s = next), true);
    pendingGenerated = null;
    dialog.close();
    toast(
      "Random Fifth Edition character applied. Undo restores the previous draft.",
    );
    return;
  }
  if (a === "starting-choices") {
    const { rollStartingChoices, addStartingChoices } = await import(
        "./generation.mjs"
      ),
      rolled = rollStartingChoices(catalogue, s, group);
    commit(() => addStartingChoices(catalogue, s, rolled), true);
    toast(
      "Random starting choices added. Existing entries kept; duplicate values were not stacked.",
    );
    return;
  }
  if (a === "undo" || a === "redo") {
    const next = history.travel(a);
    if (!next) return;
    s = next.draft;
    historyDocument = next.document;
    persist();
    render();
    return;
  }
  if (a === "add") {
    const row = catalogue.byId.get(el.dataset.id);
    if (!row) return;
    commit(() => addEntry(s, group, row));
    renderList(group);
    toast(`${row.name} added.`);
    return;
  }
  if (a === "more") {
    searches[group].count += 8;
    results(group);
    return;
  }
  if (a === "remove") {
    commit(
      () => (s.entries[group] = s.entries[group].filter((x) => x.key !== key)),
    );
    renderList(group);
    return;
  }
  if (a === "mode") {
    const k = el.dataset.field;
    commit(
      () =>
        (s.overrides[k] = s.overrides[k] === null ? (r.auto[k] ?? 0) : null),
      true,
    );
    return;
  }
  if (a === "skill-mode") {
    commit(() => {
      const x = entry(group, key);
      x.total =
        x.total === null ? r.skills.find((t) => t.key === key).total : null;
    });
    renderList(group);
    return;
  }
  if (a === "custom") {
    const kinds =
      group === "extras"
        ? [
            ["trait", "Creature Trait"],
            ["mutation", "Mutation"],
            ["rune", "Rune"],
            ["technique", "Technique"],
          ]
        : group === "gear"
          ? [
              ["gear", "Trapping"],
              ["weapon", "Weapon"],
              ["armour", "Armour"],
            ]
          : group === "magic"
            ? [
                ["spell", "Spell / prayer"],
                ["cant", "Cant"],
              ]
            : [];
    const kindControl = kinds.length
      ? `<div class="field"><label for="mm-custom-kind">Type</label><select id="mm-custom-kind">${kinds.map(([id, label]) => `<option value="${id}">${label}</option>`).join("")}</select></div>`
      : "";
    modal(
      "Add custom entry",
      `${field("Name", "mm-custom-name", "", 'placeholder="Your entry name"')}${kindControl}<p class="small">User-defined values and descriptions; no printed source or automatic effects.</p><div class="mm-modal-actions">${button("Add entry", "add-custom", `data-group="${group}"`, "primary")}</div>`,
    );
    body.querySelector("input").focus();
    return;
  }
  if (a === "add-custom") {
    const name = body.querySelector("#mm-custom-name").value.trim();
    if (!name) {
      body.querySelector("input").focus();
      return;
    }
    commit(() =>
      addEntry(s, group, {
        name,
        custom: true,
        kind: body.querySelector("#mm-custom-kind")?.value,
      }),
    );
    dialog.close();
    renderList(group);
    return;
  }
  if (a === "inspect") {
    const x = entry(group, key);
    modal(
      x.name,
      `<p class="small">${esc(entrySource(catalogue, x))}</p>${x.adaptation ? `<p class="notice"><strong>Legacy</strong> · ${esc(x.adaptation)}</p>` : ""}${x.unavailable ? `<p class="notice">${esc(x.unavailable)}</p>` : ""}<p class="mm-reference-text">${esc(x.text || "Open the shared book search for the complete reference.")}</p>${x.custom ? "" : button("Read book reference", "reference", `data-group="${group}" data-key="${key}"`)}<p class="small">Marijan Mode records this choice without prerequisites or automatic situational effects.</p>`,
    );
    return;
  }
  if (a === "reference") {
    const x = entry(group, key);
    dialog.close();
    await references.open(
      {
        skills: "skill",
        talents: "talent",
        magic: x.kind === "cant" ? "cant" : "spell",
        gear: "gear",
        extras: x.kind,
      }[group],
      x.name,
    );
    return;
  }
  if (a === "species-reference") {
    const sp = speciesEntry(catalogue, s.species);
    modal(
      sp.name,
      `<p>${esc(entrySource(catalogue, sp))}</p>${sp.adaptation ? `<p class="notice"><strong>Legacy</strong> · ${esc(sp.adaptation)}</p>` : ""}<p class="mm-reference-text">${esc(sp.conversion || "Printed Species modifiers and resources are available through Species defaults. Skills and Talents are added separately in this unrestricted editor.")}</p><p class="small">Selecting this Species does not grant starting Skills or Talents. Automatic capacity uses its implemented carrying rule.</p>`,
    );
    return;
  }
  if (a === "career-reference") {
    await references.open("career", r.career.name);
    return;
  }
  if (a === "defaults") {
    const sp = speciesEntry(catalogue, s.species);
    if (!sp) {
      toast("No book defaults exist for this custom Species.");
      return;
    }
    modal(
      "Apply Species defaults",
      `<p>Replace starting Characteristic values with ${esc(sp.name)} modifiers, and set Fate ${sp.fate}, Fortune ${sp.fortune}, base Movement ${sp.movement} and Size ${esc(sp.mechanics?.size || "Average")}.</p><p>Advances, Other, manual overrides and all added entries stay as entered. Skills and Talents are not granted.</p>${sp.adaptation ? `<p class="notice">Legacy · ${esc(sp.adaptation)}</p>` : ""}${button("Apply defaults", "apply-defaults", "", "primary")}`,
    );
    return;
  }
  if (a === "apply-defaults") {
    commit(() => applySpeciesDefaults(catalogue, s), true);
    dialog.close();
    return;
  }
  if (a === "roll") {
    commit(() => rollCharacteristics(s, catalogue), true);
    toast("Ten real 2d10 rolls recorded. Starting values replaced.");
    return;
  }
  if (a === "backup") {
    download(
      JSON.stringify(s, null, 2),
      "application/json",
      fileName() + "-marijan.json",
    );
    return;
  }
  if (a === "save") {
    const existing = saved.find((x) => x.draft.id === s.id),
      record = { at: new Date().toISOString(), draft: structuredClone(s) };
    if (existing) saved[saved.indexOf(existing)] = record;
    else saved.push(record);
    try {
      localStorage.setItem(savedKey, JSON.stringify(saved));
      toast("Character saved to the local Marijan library.");
    } catch {
      toast("Device storage unavailable. Downloading your backup instead.");
    }
    download(
      JSON.stringify(s, null, 2),
      "application/json",
      fileName() + "-marijan.json",
    );
    return;
  }
  if (a === "load") {
    modal(
      "Load Marijan character",
      `${button("Import JSON file", "import")}${saved.length ? saved.map((x, i) => `<div class="mm-saved-row"><div><strong>${esc(x.draft.name || "Unnamed character")}</strong><small> · ${esc(x.draft.species)}</small></div>${button("Load", "load-saved", `data-index="${i}"`)}</div>`).join("") : '<p class="small">No named saves yet. Save character creates a local entry and a JSON backup.</p>'}`,
    );
    return;
  }
  if (a === "load-saved") {
    const next = validateMarijan(saved[Number(el.dataset.index)].draft);
    commit(() => (s = next), true);
    dialog.close();
    return;
  }
  if (a === "import") {
    dialog.close();
    importFile();
    return;
  }
  if (a === "copy-player") {
    modal(
      "Copy player character",
      `<p>Copy its current scores and owned entries into Marijan Mode. Existing bonuses are included and calculated values become manual overrides. Its original save and XP history stay untouched.</p><div class="mm-modal-actions">${button("Copy this device’s player draft", "copy-current", "", "primary")}${button("Choose player JSON file", "import-player")}</div>`,
    );
    return;
  }
  if (a === "copy-current") {
    const raw = localStorage.getItem(
      "wfrp-fifth-character-ledger-v2" + (verify ? "-verification" : ""),
    );
    if (!raw) {
      toast("No player draft on this device. Choose its JSON file instead.");
      return;
    }
    await copyPlayer(JSON.parse(raw));
    return;
  }
  if (a === "import-player") {
    importFile(true);
    return;
  }
  if (a === "new") {
    commit(() => (s = freshMarijan()), true);
    toast("New blank character. Undo restores the previous draft.");
    return;
  }
  if (a === "export") {
    await withBusy(el, "Preparing…", async () => {
      const { exportMarijanSheet } = await import("./pdf.mjs");
      download(
        await exportMarijanSheet(catalogue, s, r),
        "application/pdf",
        fileName() + "-marijan.pdf",
      );
      toast("Editable sheet and complete unrestricted record exported.");
    });
    return;
  }
}
root.addEventListener("input", (e) => input(e.target));
root.addEventListener("focusout", () => history.breakGroup());
root.addEventListener("change", (e) => {
  if (e.target.id === "mm-section-jump") {
    const target = root.querySelector(`#mm-section-${e.target.value}`);
    e.target.value = ""; // Allow another jump to the same section later.
    if (!target) return;
    const details = target.querySelector(".mm-section-disclosure");
    if (details) details.open = true;
    target.scrollIntoView({ block: "start", behavior: "instant" });
    const heading = target.querySelector("summary,h2");
    if (heading?.tagName === "H2") heading.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
    return;
  }
  if (e.target.dataset.find || e.target.id === "mm-career-search") return;
  input(e.target, true);
});
root.addEventListener("focusin", (e) => {
  if (e.target.dataset.find) results(e.target.dataset.find);
});
root.addEventListener("focusout", (e) => {
  // A focus move within the editor is followed by click/input. Collapsing
  // search results here moves the target between pointerdown and click.
  if (e.relatedTarget && root.contains(e.relatedTarget)) return;
  if (
    !e.relatedTarget ||
    !e.relatedTarget.closest(".mm-add-bar,.mm-search-results")
  ) {
    for (const g of GROUPS)
      root.querySelector(`#mm-results-${g}`).hidden = true;
  }
});
root.addEventListener("click", (e) => {
  if (!e.target.closest(".mm-add-bar,.mm-search-results")) {
    for (const g of GROUPS)
      root.querySelector(`#mm-results-${g}`).hidden = true;
  }
  const jump = e.target.closest('a[href^="#mm-section-"]');
  if (jump) {
    const target = root.querySelector(jump.getAttribute("href"));
    const details = target?.querySelector(".mm-section-disclosure");
    if (details) details.open = true;
  }
  const el = e.target.closest("[data-action]");
  if (el) action(el).catch((error) => toast(error.message));
});
dialog.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (el) action(el).catch((error) => toast(error.message));
});
dialog.addEventListener("change", async (e) => {
  if (e.target.id === "mm-generate-origin") {
    pendingGenerated = null;
    await generationDialog(true);
  } else if (
    ["mm-generate-level", "mm-generate-career"].includes(e.target.id)
  ) {
    pendingGenerated = null;
    body.querySelector("#mm-generation-preview").innerHTML = "";
  }
});
dialog.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.id === "mm-custom-name") {
    e.preventDefault();
    body.querySelector('[data-action="add-custom"]').click();
  }
});
window.addEventListener("pagehide", () => s && persist());
window.addEventListener("wfrp-before-update", () => s && persist());
const read = async (url) => {
  const response = await fetch(url);
  if (!response.ok)
    throw Error("Could not load book data. Reload when online.");
  return response.json();
};
let library;
try {
  const [books, creatures] = await Promise.all([
    loadBookBundle(read),
    read(new URL("../gm/data.json", import.meta.url)),
  ]);
  library = books;
  catalogue = createMarijanCatalogue(library, creatures);
  s = freshMarijan();
  try {
    const raw = localStorage.getItem(storage);
    if (raw) s = validateMarijan(JSON.parse(raw));
    const stored = JSON.parse(localStorage.getItem(savedKey) || "[]");
    if (Array.isArray(stored))
      saved = stored.map((x) => ({
        at: x.at,
        draft: validateMarijan(x.draft),
      }));
  } catch (error) {
    message = error.message;
  }
  references = createReferenceSearch(library);
  history = createDraftHistory(historySnapshot());
  render();
} catch (error) {
  root.innerHTML = `<main class="page"><h1>Marijan Mode</h1><p class="error">${esc(error.message)}</p>${button("Reload", "reload")}</main>`;
  root
    .querySelector("button")
    .addEventListener("click", () => location.reload());
}
