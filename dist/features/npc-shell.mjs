import { NPC_SECTIONS, NPC_REVIEW, npcChecks } from "../npc-flow.mjs";
import { NPC_KEYS } from "../bestiary-content.mjs";
import { ledgerEmblem } from "../design-system.mjs";
import { isLegacy } from "../legacy.mjs";
import { esc } from "../workspace.mjs";
import { btn, select, value } from "./npc-controls.mjs";
import { npcFeedback } from "./npc-feedback.mjs";
export function createNPCShell(getContext, ref) {
  function folio() {
    const { R, s, d, ui } = getContext(),
      checks = npcChecks(d);
    const lists = [
      ["Skills", d.skills.map((x) => `${x.name} ${value(x.total)}`)],
      [
        "Talents",
        d.talents.map(
          (x) =>
            `${x.name}${x.ranks > 1 ? ` ×${x.ranks}` : ""}${isLegacy(R, x) ? " · Legacy" : ""}`,
        ),
      ],
      [
        "Traits",
        d.traits.map(
          (x) =>
            `${x.name}${x.value ? ` (${x.value})` : ""}${isLegacy(R, x) ? " · Legacy" : ""}`,
        ),
      ],
      [
        "Magic",
        d.magic.map((x) => `${x.name}${isLegacy(R, x) ? " · Legacy" : ""}`),
      ],
      [
        "Gear",
        [
          d.profile.sections.Trappings,
          ...d.gear.map((x) => `${x.name} ×${x.quantity}`),
        ].filter(Boolean),
      ],
    ];
    return `<aside id="npc-folio" class="sheet npc-sheet ${ui.folioExpanded ? "expanded" : ""}" aria-label="NPC stat block">
      <div class="sheet-heading"><span class="eyebrow">Creature folio</span><div class="folio-crest">${ledgerEmblem()}</div><h2>${esc(d.name)}</h2><p>${esc(d.profile.name)} · ${esc(d.size)}</p><p class="small">${ref(d.profile)}</p>${btn("folio-toggle", ui.folioExpanded ? "Hide details" : "View stat block", `aria-expanded="${ui.folioExpanded}" aria-controls="npc-folio-body"`, "summary-toggle")}</div>
      <div class="mobile-totals"><span>Wounds <strong>${value(d.stats.W)}</strong></span><span>Move <strong>${value(d.stats.M)}</strong></span><span>${checks.blocked ? `${checks.errors.length} required choices` : "Ready to export"}</span></div>
      <div class="npc-folio-body sheet-body" id="npc-folio-body"><div class="stat-grid npc-folio-stats">${NPC_KEYS.map((k) => `<div><small>${k}</small><strong>${value(d.stats[k])}</strong></div>`).join("")}</div>
      <div class="derived"><div><strong>${value(d.stats.W)}</strong><span>Wounds</span></div><div><strong>${value(d.stats.M)}</strong><span>Move</span></div><div><strong>${value(d.sb)}</strong><span>SB</span></div><div><strong>${value(d.tb)}</strong><span>TB</span></div></div>
      <p class="small">Walk ${value(d.walk)} · Run ${value(d.run)} · Initiative ${value(d.combatInitiative)}</p>
      ${d.attacks.length ? `<h3>Attacks</h3>${d.attacks.map((a) => `<p class="npc-attack"><strong>${esc(a.name)}</strong><span>${value(a.skill)} / ${a.damage === null ? "—" : `+${a.damage}`}</span></p>`).join("")}` : ""}
      <p class="small">${
        Object.entries(d.protection)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k} ${v} AP`)
          .join(" · ") || "No armour"
      }</p>
      ${lists.map(([name, list]) => `<details class="folio-section" data-detail-key="npc:folio:${name}"><summary>${name}<small>${list.length}</small></summary><ul class="folio-list">${list.map((x) => `<li>${esc(x)}</li>`).join("") || '<li class="small">None</li>'}</ul></details>`).join("")}
      ${s.career ? `<p class="folio-line">${d.remaining} XP remaining · ${d.spent} spent</p>` : ""}
      <div class="npc-folio-status">${checks.blocked ? btn("issues", `${checks.errors.length} required choices`, "", "quiet") : '<p class="small">✓ Ready to export</p>'}${btn("step", "Review & export", `data-step="${NPC_REVIEW}"`, "primary")}</div></div></aside>`;
  }
  function shell(body) {
    const { R, s, d, ui, undoAvailable, verify } = getContext(),
      checks = npcChecks(d);
    const pending = NPC_SECTIONS.map(
      (_, i) => checks.errors.filter((x) => x.control.step === i).length,
    );
    return `<div class="workspace npc-workspace"><aside class="rail"><div class="rail-heading"><span class="eyebrow">NPC & monster creation</span><strong>The GM’s bestiary</strong><p>${checks.blocked ? `${checks.errors.length} required choices` : "Printed profile ready to customise"}</p></div>
      <a class="creator-mode-link" href="index.html${verify ? "?verify=1" : ""}">← Player character creator</a>
      <div class="mobile-step field"><label for="npc-mobile-step">Creation section</label>${select(
        "npc-mobile-step",
        NPC_SECTIONS.map((x, i) => [
          i,
          `${i + 1}. ${x.name}${pending[i] ? ` · ${pending[i]} required` : ""}`,
        ]),
        s.step,
        'data-state="step"',
      )}</div>
      <nav aria-label="NPC creation sections"><ol class="steps">${NPC_SECTIONS.map((x, i) => `<li><button type="button" class="${s.step === i ? "active" : ""}" data-npc-action="step" data-step="${i}" ${s.step === i ? 'aria-current="step"' : ""}><span class="step-number">${String(i + 1).padStart(2, "0")}</span><span>${esc(x.name)}<small>${pending[i] ? `${pending[i]} required choices` : esc(x.hint)}</small></span>${pending[i] ? '<span class="npc-nav-alert" aria-hidden="true">!</span>' : ""}</button></li>`).join("")}</ol></nav>
      <div class="header-actions">${btn("save", "Save NPC")}${btn("load", "Load NPC")}${btn("new", "New NPC")}<div class="install-app-slot" data-install-slot></div></div>
      <details class="npc-rail-tools-menu" data-detail-key="npc:draft-tools"><summary>Draft tools & books</summary><div class="npc-rail-tools">${btn("undo", "Undo last edit", undoAvailable ? "" : "disabled", "text-button")}${btn("duplicate", "Duplicate NPC", "", "text-button")}${btn("books", `Choose books (${R.selection.length})`, "", "text-button")}</div></details><p class="save-status">Separate draft · saved on this device</p><input id="npc-import" type="file" accept="application/json,.json" hidden></aside>
      <main class="panel" id="npc-main"><div class="stage-meta"><span>Section ${s.step + 1} of ${NPC_SECTIONS.length}</span><span class="${checks.blocked ? "pending-status" : "ready-status"}">${checks.blocked ? `${checks.errors.length} required choices` : "✓ Ready to export"}</span></div>
      ${npcFeedback(R, d)}${body}<div class="step-footer">${s.step ? btn("step", "Back", `data-step="${s.step - 1}"`) : "<span></span>"}<span class="footer-position">${s.step + 1} / ${NPC_SECTIONS.length}</span>${s.step < NPC_REVIEW ? btn("step", `Continue to ${NPC_SECTIONS[s.step + 1].name}`, `data-step="${s.step + 1}"`, "primary") : ""}</div></main>${folio()}</div>
      <div class="mobile-workspace-bar npc-mobile-bar"><span>W ${value(d.stats.W)} · ${checks.blocked ? `${checks.errors.length} required` : "Ready"}</span>${btn("folio-toggle", ui.folioExpanded ? "Back to editor" : "Stat block", `aria-expanded="${ui.folioExpanded}" aria-controls="npc-folio-body"`)}${btn("step", "Review", `data-step="${NPC_REVIEW}"`)}</div>`;
  }
  return { shell, folio };
}
