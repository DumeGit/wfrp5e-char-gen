import { templateEligibility, templateSummary } from "./templates.mjs";
import { syncGMCants } from "./cants.mjs";
import { loadBookBundle } from "../book-bundle.mjs";
import { KEYS, skillInfo, base } from "../rules.mjs";
import { captureDisclosures, restoreDisclosures } from "../disclosures.mjs";
import { createInstallControl } from "../install-control.mjs";
import { createMobileShell } from "../mobile-shell.mjs";
import { createDraftHistory } from "../draft-history.mjs";
import {
  freshGM,
  validateGMDraft,
  calculateGM,
  individualise,
  applyTemplate,
  gmSpellCatalogue,
  gmRoll,
} from "./model.mjs";
import {
  workspace,
  profileResults,
  pickerEntries,
  searchPickerEntries,
  issuePanel,
  sourceNotes,
  templateOverview,
  TABS,
} from "./views.mjs";
import { statBlock } from "./sheet.mjs";
import { createGMReferences } from "./references.mjs";
import { createGMPDF } from "./pdf.mjs";
import {
  connectIssues,
  enhanceInterface,
  withBusy,
} from "../interface-kit.mjs";
import { createGMPrinting } from "./printing.mjs";
import { createGMRules, gmCatalogue, sourceLabel } from "./books.mjs";
import { esc, button, legacyBadge, select } from "./controls.mjs";

const root = document.querySelector("#app"),
  dialog = document.querySelector("#creator-dialog"),
  dialogBody = document.querySelector("#creator-dialog-body"),
  dialogTitle = document.querySelector("#creator-dialog-title"),
  verify = new URLSearchParams(location.search).has("verify"),
  storageKey = "wfrp-gm-workshop-v1";
const ui = {
    tab: 0,
    profileQuery: "",
    category: "",
    profileBook: "",
    templateBook: "",
    browse: false,
  },
  disclosures = new Map(),
  mountInstall = createInstallControl(document.querySelector("#pwa-install"));
const mobileShell = createMobileShell();
let data,
  history,
  R,
  rulesFor,
  s,
  r,
  references,
  printing,
  picker,
  pendingProfile,
  pendingTemplate,
  saveMessage = "Saved on this device",
  toastTimer,
  textEdit;
let historyDocument = crypto.randomUUID();
const historySnapshot = () => ({ draft: s, document: historyDocument });
const uid = () => `gm-${crypto.randomUUID()}`;
function toast(text) {
  const node = document.querySelector("#toast");
  node.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (node.textContent = ""), 4500);
}
function persist() {
  if (verify) {
    saveMessage = "Isolated preview · personal draft unchanged";
    return;
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(s));
    saveMessage = "Saved on this device";
  } catch {
    saveMessage = "Device storage unavailable · use Save draft";
  }
}
function commit(change, message, full = true) {
  const old = structuredClone(s);
  const previousDraft = s;
  textEdit = null;
  change();
  if (
    s.cants.enabled ||
    Object.keys(s.spellLores).length ||
    Object.keys(s.cants.choices).length
  ) {
    const rules = rulesFor(s);
    syncGMCants(rules, s, calculateGM(data, rules, s));
  }
  if (JSON.stringify(old) === JSON.stringify(s)) return;
  if (s !== previousDraft) historyDocument = crypto.randomUUID();
  history.record(historySnapshot());
  persist();
  if (full) render();
  else refreshResult();
  if (message) toast(message);
}
// Editing a text/number field never replaces its DOM node or the next clicked
// control. Blur/change runs before click: a full redraw here would swallow it.
function refreshResult() {
  captureDisclosures(root, disclosures);
  R = rulesFor(s);
  r = calculateGM(data, R, s);
  const folio = root.querySelector("#gm-folio"),
    scroll = folio.scrollTop;
  folio.querySelector(".gm-stat-block").outerHTML = statBlock(r, s, {
    compact: true,
  });
  root.querySelector("#gm-feedback").innerHTML = issuePanel(r) + sourceNotes(r);
  const review = root.querySelector(".gm-panel .gm-stat-block");
  if (review) review.outerHTML = statBlock(r, s);
  for (const node of root.querySelectorAll(".gm-char-row")) {
    const key = node.querySelector("[data-stat]").dataset.stat;
    node.querySelector(".gm-char-final b").textContent = r.stats[key] ?? "—";
  }
  const status = !r.profile
    ? "Choose a profile"
    : r.issues.length
      ? `${r.issues.length} choice${r.issues.length === 1 ? "" : "s"} left`
      : "Ready to export";
  for (const node of root.querySelectorAll(
    ".gm-folio-footer>span,.gm-mobile-bar>span",
  ))
    node.textContent = status;
  root.querySelector(".save-status").textContent = saveMessage;
  mobileShell.refreshHistory(history);
  restoreDisclosures(root, disclosures);
  folio.scrollTop = scroll;
  mobileShell.refresh();
  enhanceInterface(root);
  connectIssues(root, r.issues, { unstarted: !r.profile });
}
function render() {
  if (ui.profileBook && !s.books.includes(ui.profileBook)) ui.profileBook = "";
  const focus = document.activeElement,
    historyFocus = focus?.closest(".history-controls")
      ? focus.dataset.action
      : null,
    focusId = root.contains(focus) ? focus.id : null,
    selection =
      focus?.tagName === "INPUT" && ["text", "search"].includes(focus.type)
        ? [focus.selectionStart, focus.selectionEnd]
        : null;
  captureDisclosures(root, disclosures);
  R = rulesFor(s);
  r = calculateGM(data, R, s);
  const folioScroll = root.querySelector("#gm-folio")?.scrollTop || 0;
  const install = document.querySelector("#pwa-install");
  if (install) document.body.append(install);
  root.innerHTML = workspace(
    gmCatalogue(data, s.books),
    R,
    s,
    r,
    ui,
    verify,
    saveMessage,
  );
  mountInstall(root);
  mobileShell.mount(root, history);
  connectIssues(root, r.issues, { unstarted: !r.profile });
  restoreDisclosures(root, disclosures);
  root.querySelector("#gm-folio").scrollTop = folioScroll;
  if (s.removed.length) {
    const footer = root.querySelector(".gm-page-footer"),
      restore = document.createElement("button");
    restore.type = "button";
    restore.className = "text-button";
    restore.dataset.action = "restore-picker";
    restore.textContent = `Restore removed entries (${s.removed.length})`;
    footer.prepend(restore);
  }
  if (focusId) {
    const next = document.getElementById(focusId);
    next?.focus({ preventScroll: true });
    if (selection && next?.setSelectionRange)
      next.setSelectionRange(...selection);
  }
  if (historyFocus)
    root
      .querySelector(`.history-controls [data-action="${historyFocus}"]`)
      ?.focus({ preventScroll: true });
}
function modal(title, body) {
  dialogTitle.textContent = title;
  dialogBody.innerHTML = body;
  enhanceInterface(dialogBody);
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}
function close() {
  dialog.close();
  pendingProfile = null;
  pendingTemplate = null;
  picker = null;
}
function go(step) {
  s.step = step;
  persist();
  render();
  root.querySelector(".gm-page-heading").scrollIntoView({ block: "start" });
}
function download(bytes, name, type) {
  const blob = new Blob([bytes], { type }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function filename() {
  return (r.name || "NPC").replace(/[<>:"/\\|?*]/g, "-").slice(0, 80);
}
function profilePreview(id) {
  pendingProfile = id;
  const p = data.profiles.find((p) => p.id === id),
    draft = freshGM(data, id, s.books),
    result = calculateGM(data, rulesFor(draft), draft);
  modal(
    p.name,
    `${statBlock(result, draft, { showSource: false })}${result.warnings.length ? `<div class="gm-callout"><strong>Source notes</strong><ul>${result.warnings.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}${s.profile && s.profile !== id ? '<p class="gm-small">Applying a new foundation replaces this NPC’s customisation. Your player character is separate. Undo can restore this draft.</p>' : ""}<div class="gm-dialog-actions">${button("Cancel", "close-dialog")}${button("Use this profile", "apply-profile", "", "primary")}</div>`,
  );
}
function renderTemplateResults() {
  const templates = gmCatalogue(data, s.books).templates.filter(
    (t) => !ui.templateBook || (t.source?.book || "core") === ui.templateBook,
  );
  dialogBody.querySelector("#gm-template-results").innerHTML = templates
    .map(
      (t) =>
        `<div class="gm-picker-row"><div><strong>${esc(t.name)}</strong><p>${esc(templateSummary(t))}</p><small>${esc(sourceLabel(t))} ${t.adaptation ? '<span class="legacy-tag">Legacy</span>' : ""}</small></div>${button("Preview", "preview-template", `data-id="${t.id}"`)}</div>`,
    )
    .join("");
}
function templatePreview(id) {
  pendingTemplate = id;
  const t = data.templates.find((t) => t.id === id);
  modal(
    t.name,
    `${templateOverview(t)}${templateEligibility(t, r.profile) ? `<p class="gm-callout">${esc(templateEligibility(t, r.profile))}</p>` : ""}<div class="gm-dialog-actions">${button("Back to templates", "template-picker", 'data-back="1"')}${button("Apply template", "apply-template", templateEligibility(t, r.profile) ? "disabled" : "", "primary")}</div>`,
  );
}
function showPicker(kind) {
  picker = { kind, rows: pickerEntries(data, R, r, kind), query: "" };
  modal(
    {
      trait: "Add Creature Trait",
      skill: "Add Skill",
      talent: "Add Talent",
      equipment: "Add equipment",
      magic: "Choose magic",
      mutation: "Choose Corruption",
    }[kind],
    `<div class="field"><label for="gm-picker-search">Search ${esc(kind)}</label><input id="gm-picker-search" type="search" autocomplete="off" placeholder="Name or rule text…"></div><div id="gm-picker-results" class="gm-picker-results"></div>`,
  );
  pickerResults();
  document.querySelector("#gm-picker-search").focus();
}
function pickerResults() {
  const rows = searchPickerEntries(picker.rows, picker.query),
    container = document.querySelector("#gm-picker-results");
  container.innerHTML = `<p class="gm-results-count">${rows.length} available entries</p>${rows
    .slice(0, 60)
    .map((x) => {
      const kind = picker.kind,
        owned =
          (kind === "talent" && r.talents.some((t) => t.name === x.name)) ||
          (kind === "magic" && r.spells.some((t) => t.contentId === x.key)) ||
          (kind === "trait" && r.traits.some((t) => t.name === x.name)) ||
          (kind === "mutation" && s.mutations.includes(x.key));
      return `<div class="gm-picker-row"><div><strong>${esc(x.name)}</strong><small> ${esc(x.category || "")} · ${esc(sourceLabel(x))}</small>${legacyBadge(x)}<p>${esc(x.damage !== undefined ? `${x.group} · Damage ${x.damage} · ${x.reach} · ${x.qualities || ""}` : x.ap !== undefined ? `${x.ap} AP · ${x.locations}` : x.text?.slice(0, 180) || `${x.advanced ? "Advanced" : "Basic"} Skill · ${x.char || "Core option"}`)}${x.text?.length > 180 ? "…" : ""}</p>${x.disabled ? `<p class="gm-small">${esc(x.disabled)}</p>` : ""}</div>${button(x.disabled ? "Unavailable" : owned ? "Added" : "Add", "picker-add", `data-id="${esc(x.key)}" ${owned || x.disabled ? "disabled" : ""}`, "primary")}</div>`;
    })
    .join(
      "",
    )}${rows.length > 60 ? '<p class="gm-small">Type a more specific search to narrow this list.</p>' : ""}`;
}
function addEntry(id) {
  const x = picker.rows.find((x) => x.key === id),
    kind = picker.kind;
  if (!x || x.disabled) return;
  close();
  commit(() => {
    if (kind === "trait")
      s.traits.push({
        key: uid(),
        name: x.name,
        value: x.name === "Fear" ? "1" : "",
        ranks: 1,
        origin: "GM",
      });
    if (kind === "skill")
      s.skills.push({
        key: uid(),
        name: x.name,
        total:
          r.skills.find((t) => t.name === x.name)?.total ??
          r.stats[x.char ?? skillInfo(R, x.name)?.char] ??
          0,
        origin: "GM",
      });
    if (kind === "talent")
      s.talents.push({ key: uid(), name: x.name, ranks: 1, origin: "GM" });
    if (kind === "equipment") {
      const existing = s.gear.find((g) => g.id === x.key);
      if (existing) existing.quantity++;
      else s.gear.push({ key: uid(), id: x.key, quantity: 1 });
    }
    if (kind === "magic") {
      s.removed = s.removed.filter((k) => k !== x.key);
      s.spells.push(x.key);
      if (
        R.cants.length &&
        x.category === "Arcane" &&
        r.magicLores.length === 1
      )
        s.spellLores[x.key] = r.magicLores[0];
    }
    if (kind === "mutation") s.mutations.push(x.key);
  }, `${x.name} added.`);
  if (kind === "trait") {
    ui.tab = 1;
    s.step = 1;
    render();
    const last = s.traits.at(-1);
    const field = document.getElementById(`trait-${last.key}`);
    field?.scrollIntoView({ block: "center" });
    field?.focus({ preventScroll: true });
  }
}
async function action(el) {
  const a = el.dataset.action;
  textEdit = null;
  if (a === "legacy") {
    const entries = [
      ...data.profiles,
      ...data.templates,
      ...r.traits,
      ...r.attacks,
      ...r.talents,
      ...(picker?.rows || []),
      ...R.talents,
      ...r.spells,
      ...(r.runes || []),
      ...r.gear.map((g) => g.entry),
    ];
    const x = entries.find(
      (x) => (x.key || x.id || x.name) === el.dataset.entry,
    );
    if (x?.adaptation)
      modal(
        `${x.name} · Legacy`,
        `<p>${esc(x.adaptation)}</p><p class="gm-small">${esc(sourceLabel({ ...x, source: x.adaptationSource || x.source }))}</p>${button("Close", "close-dialog")}`,
      );
    return;
  }
  if (a === "close-dialog") {
    close();
    return;
  }
  if (a === "reference") {
    references.open(el.dataset.kind, el.dataset.name);
    return;
  }
  if (a === "step") {
    go(Number(el.dataset.step));
    return;
  }
  if (a === "tab") {
    ui.tab = Number(el.dataset.tab);
    render();
    document.getElementById(`gm-tab-${ui.tab}`).focus({ preventScroll: true });
    return;
  }
  if (a === "browse") {
    ui.browse = !ui.browse;
    render();
    return;
  }
  if (a === "preview-profile") {
    profilePreview(el.dataset.id);
    return;
  }
  if (a === "apply-profile") {
    const id = pendingProfile;
    close();
    ui.browse = false;
    commit(() => {
      s = freshGM(data, id, s.books);
    }, "Printed profile applied. You can use it immediately or customise it.");
    return;
  }
  if (a === "template-picker") {
    if (!el.dataset.back) ui.templateBook = "";
    const catalogue = gmCatalogue(data, s.books);
    modal(
      "Choose a creature template",
      `<p class="gm-small">Choose one template from the enabled books. Source-specific foundations and required choices are explained in its preview.</p>${select("Book", "gm-template-book", [["", "All enabled books"], ...catalogue.books.filter((b) => catalogue.templates.some((t) => (t.source?.book || "core") === b.id)).map((b) => [b.id, b.shortTitle || b.title])], ui.templateBook, 'data-template-book="1"')}<div id="gm-template-results"></div>`,
    );
    renderTemplateResults();
    return;
  }
  if (a === "preview-template") {
    templatePreview(el.dataset.id);
    return;
  }
  if (a === "apply-template") {
    const id = pendingTemplate;
    const t = data.templates.find((x) => x.id === id);
    if (
      !t ||
      !s.books.includes(t.source?.book || "core") ||
      templateEligibility(t, r.profile)
    )
      return;
    close();
    commit(
      () => applyTemplate(s, id),
      "Template applied. Complete its choices below.",
    );
    return;
  }
  if (a === "clear-template") {
    commit(() => applyTemplate(s, ""));
    return;
  }
  if (a === "picker") {
    showPicker(el.dataset.kind);
    return;
  }
  if (a === "picker-add") {
    addEntry(el.dataset.id);
    return;
  }
  if (a === "undead-ride") {
    const name = el.dataset.name;
    if (!r.undeadRidingOptions.includes(name) || r.stats.Ag === null) return;
    commit(() => {
      const total = Math.max(
        r.stats.Ag + 20,
        r.skills.find((x) => x.name === name)?.total || 0,
      );
      s.removed = s.removed.filter((k) => k !== `skill:${name}`);
      const old = s.skills.find((x) => x.name === name);
      if (old) old.total = total;
      else
        s.skills.push({
          key: uid(),
          name,
          total,
          origin: "GM",
          source: { book: "night-parade", page: 10 },
        });
    }, `${name} added at +20 or its higher existing bonus.`);
    return;
  }
  if (a === "optional-trait") {
    const x = r.optionalTraits[Number(el.dataset.index)];
    if (x.name === "Size") {
      ui.tab = 0;
      render();
      document.querySelector("#gm-size").focus();
      return;
    }
    if (r.traits.some((t) => t.name === x.name)) {
      toast("That Trait is already included.");
      return;
    }
    commit(
      () =>
        s.traits.push({
          ...x,
          key: uid(),
          value: /Any|Various/.test(x.value) ? "" : x.value,
          origin: "GM",
        }),
      `${x.name} added.`,
    );
    return;
  }
  if (a === "remove") {
    const key = el.dataset.key;
    commit(() => {
      let removed = false;
      for (const list of ["traits", "skills", "talents", "gear"]) {
        const index = s[list].findIndex((t) => t.key === key);
        if (index >= 0) {
          s[list].splice(index, 1);
          delete s.attackOverrides[key];
          removed = true;
        }
      }
      if (s.mutations.includes(key)) {
        s.mutations = s.mutations.filter((id) => id !== key);
        removed = true;
      }
      if (s.spells.includes(key)) {
        s.spells = s.spells.filter((id) => id !== key);
        removed = true;
      }
      if (!removed && !s.removed.includes(key)) s.removed.push(key);
    }, "Entry removed. Undo is available.");
    return;
  }
  if (a === "restore-picker") {
    const name = (k) =>
      [
        ...r.profile.traits,
        ...r.profile.skills,
        ...r.profile.talents,
        ...r.profile.attacks,
        ...r.profile.armour,
        ...gmSpellCatalogue(R),
      ].find((x) => (x.key || x.contentId) === k)?.name || k;
    modal(
      "Restore removed entries",
      s.removed
        .map(
          (k) =>
            `<div class="gm-picker-row"><strong>${esc(name(k))}</strong>${button("Restore", "restore", `data-key="${esc(k)}"`)}</div>`,
        )
        .join(""),
    );
    return;
  }
  if (a === "restore") {
    const key = el.dataset.key;
    close();
    commit(() => (s.removed = s.removed.filter((k) => k !== key)));
    return;
  }
  if (a === "roll-stat") {
    commit(
      () => individualise(s, r.profile, el.dataset.key),
      "Recorded 2d10 variation.",
    );
    return;
  }
  if (a === "roll-all") {
    modal(
      "Roll individual variation?",
      `<p>Roll 2d10 for each available Characteristic and replace its starting score with the printed score −10 plus the roll (p. 318). Movement is unchanged. Template and Size effects are added afterwards.</p><div class="gm-dialog-actions">${button("Cancel", "close-dialog")}${button("Roll all Characteristics", "confirm-roll-all", "", "primary")}</div>`,
    );
    return;
  }
  if (a === "confirm-roll-all") {
    close();
    commit(() => {
      for (const k of KEYS)
        if (r.profile.stats[k] !== null) individualise(s, r.profile, k);
    }, "All dice faces recorded.");
    return;
  }
  if (a === "reset-stat") {
    commit(() => delete s.stats[el.dataset.key]);
    return;
  }
  if (a === "broken-roll") {
    commit(
      () =>
        (s.brokenRoll = gmRoll(s, "Broken training Fellowship", 2, 10, 363)),
    );
    return;
  }
  if (a === "mark-roll") {
    commit(
      () => (s.markRoll = gmRoll(s, "Tzeentch mutation count", 1, 10, 359)[0]),
    );
    return;
  }
  if (a === "mutation-roll") {
    commit(() => {
      const roll = gmRoll(
          s,
          `${el.dataset.category} Corruption`,
          1,
          100,
          el.dataset.category === "Physical" ? 189 : 190,
        )[0],
        m = data.mutations.find(
          (m) =>
            m.category === el.dataset.category &&
            roll >= m.min &&
            roll <= m.max,
        );
      if (!m) throw Error("No printed result for this roll.");
      if (!s.mutations.includes(m.id)) s.mutations.push(m.id);
      toast(`Rolled ${roll}: ${m.name}${s.mutations.includes(m.id) ? "" : ""}`);
    });
    return;
  }
  if (a === "undo" || a === "redo") {
    history.record(historySnapshot());
    const next = history.travel(a);
    if (next) {
      s = next.draft;
      historyDocument = next.document;
      textEdit = null;
      persist();
      render();
      toast(a === "undo" ? "Change undone." : "Change redone.");
    }
    return;
  }
  if (a === "new") {
    modal(
      "Start a new NPC or creature?",
      `<p>This replaces the current GM draft. Save it first if you want a file copy. Your player character is unaffected.</p><div class="gm-dialog-actions">${button("Cancel", "close-dialog")}${button("Start new", "confirm-new", "", "primary")}</div>`,
    );
    return;
  }
  if (a === "confirm-new") {
    close();
    commit(() => (s = freshGM(data, "", s.books)));
    return;
  }
  if (a === "save") {
    download(
      JSON.stringify(s, null, 2),
      filename() + ".wfrp-gm.json",
      "application/json",
    );
    toast("Editable GM draft exported.");
    return;
  }
  if (a === "print-cards") {
    await printing.open();
    return;
  }
  if (a === "load") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", async () => {
      try {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 2000000) throw Error("This save is too large.");
        const parsed = JSON.parse(await file.text());
        const draft = validateGMDraft(data, rulesFor(parsed), parsed);
        modal(
          "Load this GM draft?",
          `<p>Replace this draft with <strong>${esc(draft.name || data.profiles.find((p) => p.id === draft.profile)?.name || "a new draft")}</strong>? Saved dice are imported records, not independently verified randomness.</p><div class="gm-dialog-actions">${button("Cancel", "close-dialog")}${button("Load draft", "apply-load", "", "primary")}</div>`,
        );
        dialogBody.querySelector('[data-action="apply-load"]').addEventListener(
          "click",
          () => {
            close();
            commit(() => (s = draft), "Draft loaded.");
          },
          { once: true },
        );
      } catch (e) {
        toast(e.message);
      }
    });
    input.click();
    return;
  }
  if (a === "apply-load") return;
  if (a === "issue") {
    const { step, target } = r.issues[Number(el.dataset.index)].control;
    s.step = step;
    ui.tab =
      target.includes("trait-") ||
      target.includes("mutation") ||
      target.includes("broken")
        ? 1
        : target === "#gm-tab-2"
          ? 2
          : 0;
    persist();
    render();
    const node = root.querySelector(target);
    if (node) {
      for (
        let parent = node.parentElement;
        parent;
        parent = parent.parentElement
      )
        if (parent.tagName === "DETAILS") parent.open = true;
      node.scrollIntoView({ block: "center" });
      if (!node.matches("input,select,textarea,button")) node.tabIndex = -1;
      node.focus({ preventScroll: true });
      node.classList.add("gm-focus-target");
      setTimeout(() => node.classList.remove("gm-focus-target"), 3000);
    }
    return;
  }
  if (a === "folio") {
    mobileShell.expand();
    root.querySelector("#gm-folio").scrollIntoView({ block: "start" });
    return;
  }
  if (a === "pdf") {
    await withBusy(el, "Preparing…", async () => {
      download(
        await createGMPDF(window.PDFLib, r, s),
        filename() + ".pdf",
        "application/pdf",
      );
      toast("Compact stat block exported.");
    });
    return;
  }
}
function change(el) {
  const d = el.dataset,
    val = el.type === "checkbox" ? el.checked : el.value,
    num = el.value === "" ? null : Number(el.value);
  if (d.templateBook !== undefined) {
    ui.templateBook = val;
    renderTemplateResults();
    return;
  }
  if (d.book) {
    if (!val && s.profile?.startsWith(`${d.book}:`)) {
      const book = data.books.find((b) => b.id === d.book);
      el.checked = true;
      modal(
        `Remove ${book.shortTitle || book.title}?`,
        `<p>This starting profile requires ${esc(book.title)}. Removing the book starts a fresh GM draft. Save it first if needed; Undo can restore it.</p><div class="gm-dialog-actions">${button("Keep book", "close-dialog")}${button("Remove book & start new", "remove-book", "", "primary")}</div>`,
      );
      dialogBody.querySelector('[data-action="remove-book"]').addEventListener(
        "click",
        () => {
          close();
          ui.profileQuery = "";
          ui.category = "";
          ui.profileBook = "";
          ui.browse = false;
          commit(() => (s = freshGM(data)));
        },
        { once: true },
      );
      return;
    }
    commit(() => {
      s.books = val
        ? [...s.books, d.book]
        : s.books.filter((id) => id !== d.book);
      if (
        !val &&
        data.templates.some(
          (t) => t.id === s.template && t.source?.book === d.book,
        )
      ) {
        applyTemplate(s, "");
      }
    });
    return;
  }
  if (textEdit && textEdit === d.bind) {
    textEdit = null;
    return;
  }
  if (d.ui) {
    ui[d.ui] = val;
    if (["category", "profileBook"].includes(d.ui))
      document.querySelector("#gm-profile-results").innerHTML = profileResults(
        gmCatalogue(data, s.books),
        ui,
      );
    return;
  }
  if (d.bind === "step") {
    go(Number(val));
    return;
  }
  commit(
    () => {
      if (d.cantsEnabled !== undefined) s.cants.enabled = Boolean(val);
      if (d.spellLore) {
        if (val) s.spellLores[d.spellLore] = val;
        else delete s.spellLores[d.spellLore];
      }
      if (d.cantLore) {
        const choices = s.cants.choices[d.cantLore] || [];
        choices[Number(d.cantIndex)] = val;
        s.cants.choices[d.cantLore] = Array.from(choices, (x) => x || "");
      }
      if (d.bind) s[d.bind] = ["wounds", "tb"].includes(d.bind) ? num : val;
      if (d.stat) s.stats[d.stat] = num;
      if (d.templateSkill !== undefined) {
        const list = s.templateSkills[d.templateSkill] || [];
        list[Number(d.choice)] = val;
        s.templateSkills[d.templateSkill] = Array.from(list, (x) => x || "");
      }
      if (d.templateGear !== undefined) {
        if (val) s.templateGear[d.templateGear] = val;
        else delete s.templateGear[d.templateGear];
      }
      if (d.templateTalent !== undefined) {
        if (val) s.templateTalents[d.templateTalent] = val;
        else delete s.templateTalents[d.templateTalent];
      }
      if (d.trait) s.traits.find((t) => t.key === d.trait).value = String(val);
      if (d.training || d.lore) {
        const t = s.traits.find((t) => t.key === (d.training || d.lore)),
          list = t.value
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
        t.value = (
          val
            ? [...new Set([...list, el.value])]
            : list.filter((n) => n !== el.value)
        ).join(", ");
      }
      if (d.extraTraining)
        s.extraTraining = val
          ? [...s.extraTraining, el.value]
          : s.extraTraining.filter((n) => n !== el.value);
      if (d.skill) {
        let row = s.skills.find((x) => x.name === d.skill);
        if (!row) {
          row = { key: uid(), name: d.skill, total: 0, origin: "GM" };
          s.skills.push(row);
        }
        row.total = num ?? 0;
      }
      if (d.cause) {
        s.talents.find((t) => t.key === d.cause).name =
          `Impassioned Zeal (${val})`;
      }
      if (d.rank) {
        const t = s.talents.find((t) => t.key === d.rank),
          limit =
            R.config.talentLimits[base(t.name)] === null
              ? Infinity
              : (R.config.talentLimits[base(t.name)] ?? 1);
        t.ranks = Math.max(1, Math.min(limit, num || 1));
      }
      if (d.quantity)
        s.gear.find((g) => g.key === d.quantity).quantity = Math.max(
          1,
          num || 1,
        );
      if (d.attack) {
        const map = s.attackOverrides[d.attack] || {};
        if (num === null) delete map[d.property];
        else map[d.property] = num;
        if (Object.keys(map).length) s.attackOverrides[d.attack] = map;
        else delete s.attackOverrides[d.attack];
      }
      for (const [key, list] of [
        ["optionalAttack", "optionalAttacks"],
        ["optionalArmour", "optionalArmour"],
      ])
        if (d[key])
          s[list] = val
            ? [...new Set([...s[list], d[key]])]
            : s[list].filter((k) => k !== d[key]);
    },
    undefined,
    el.tagName !== "TEXTAREA" &&
      !(el.tagName === "INPUT" && el.type !== "checkbox"),
  );
}
root.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (b) action(b).catch((e) => toast(e.message));
});
dialog.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (b) action(b).catch((e) => toast(e.message));
});
dialog.addEventListener("cancel", () => {
  picker = null;
  pendingProfile = null;
  pendingTemplate = null;
});
root.addEventListener("change", (e) => {
  if (e.target.matches("input,select,textarea")) change(e.target);
});
root.addEventListener("input", (e) => {
  const el = e.target,
    key = el.dataset.bind;
  if (el.dataset.ui === "profileQuery") {
    ui.profileQuery = el.value;
    document.querySelector("#gm-profile-results").innerHTML = profileResults(
      gmCatalogue(data, s.books),
      ui,
    );
  } else if (
    [
      "name",
      "description",
      "purpose",
      "motivation",
      "manner",
      "notes",
    ].includes(key)
  ) {
    textEdit = key;
    s[key] = el.value;
    history.record(historySnapshot(), { group: el });
    persist();
    refreshResult();
  }
});
root.addEventListener("focusout", () => history.breakGroup());
dialog.addEventListener("change", (e) => {
  if (e.target.matches("[data-template-book]")) change(e.target);
});
dialog.addEventListener("input", (e) => {
  if (e.target.id === "gm-picker-search") {
    picker.query = e.target.value;
    pickerResults();
  }
});
root.addEventListener("keydown", (e) => {
  if (
    !e.target.matches('[role="tab"]') ||
    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  )
    return;
  e.preventDefault();
  ui.tab =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? TABS.length - 1
        : (ui.tab + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) %
          TABS.length;
  render();
  document.getElementById(`gm-tab-${ui.tab}`).focus({ preventScroll: true });
});
window.addEventListener("wfrp-before-update", persist);
window.addEventListener("pagehide", persist);
async function boot() {
  root.innerHTML =
    '<main class="panel"><h1>Opening the Bestiary…</h1><p>Loading the workshop and reviewed books.</p></main>';
  try {
    const read = async (url) => {
      const response = await fetch(url);
      if (!response.ok)
        throw Error(
          "Could not load core content. Reopen online and allow offline preparation to finish.",
        );
      return response.json();
    };
    const [library, gm] = await Promise.all([
      loadBookBundle(read),
      read(new URL("./data.json", import.meta.url)),
    ]);
    data = gm;
    rulesFor = createGMRules(library, data);
    R = rulesFor(freshGM(data));
    if (
      data.schemaVersion !== 1 ||
      data.coreVersion !== R.books[0].version ||
      data.source.sha256 !== R.books[0].source.sha256
    )
      throw Error(
        "The GM content and core book versions do not match. Reload the updated app.",
      );
    s = freshGM(data);
    if (!verify) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          s = validateGMDraft(data, rulesFor(parsed), parsed);
        }
      } catch (e) {
        saveMessage =
          "Previous GM draft could not be loaded · use a current file";
        toast(e.message);
      }
    } else persist();
    references = createGMReferences(library);
    history = createDraftHistory(historySnapshot());
    printing = createGMPrinting(data, rulesFor, {
      current: () => s,
      download,
      toast,
    });
    render();
  } catch (e) {
    root.innerHTML = `<main class="panel"><h1>The workshop could not open</h1><p>${esc(e.message)}</p><a href="./">Return to player creation</a></main>`;
  }
}
await boot();
