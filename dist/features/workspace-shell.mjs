import * as M from "../rules.mjs";
import {
  characteristicNames,
  steps,
  creationStepCount,
  experienceStep,
  reviewStep,
} from "../ui.mjs";
import { formatMoney } from "../market.mjs";
import { penaltySummary } from "../creator-ui.mjs";
import { legacyTag } from "../legacy.mjs";
import { legacyContext } from "../legacy-character.mjs";
import { issueTarget } from "../issue-targets.mjs";
import { sheetSpecies } from "../origins.mjs";
import { cantPanel } from "../archives-iii-ui.mjs";
export function createFeature(getContext) {
  function workspaceShell({ d, eq, c, issues, pending, body, ready }) {
    const {
      setupOpen,
      select,
      s,
      button,
      locked,
      undoChoice,
      esc,
      hasColourMagic,
      R,
      marketShop,
      summaryExpanded,
      result,
      folioMenus,
      characteristicClass,
      characteristicTitle,
    } = getContext();
    return `<div class="workspace ${setupOpen ? "book-setup-workspace" : ""}">
<aside class="rail">
<div class="rail-heading">
<span class="eyebrow">Character creation</span>
<strong>Your next chapter</strong>
<p>${ready} of ${creationStepCount} creation steps ready</p>
<div class="creation-meter" role="img" aria-label="${ready} of ${creationStepCount} creation steps ready">
<span style="width:${(ready / creationStepCount) * 100}%">
</span>
</div>
</div>
<div class="mobile-step field">
<label for="mobile-step">Creation step</label>${select(
      'id="mobile-step" data-bind="stepSwitch"',
      steps.map((name, i) => [i, `${i + 1}. ${name}`]),
      s.step,
    )}</div>
<nav aria-label="Character creation steps">
<ol class="steps">${steps
      .map(
        (name, i) => `<li>
<button class="${i === s.step ? "active" : ""}" ${i === s.step ? 'aria-current="step"' : ""} data-action="step" data-step="${i}">
<span class="step-number">${i < creationStepCount && !pending[i].length ? "✓" : String(i + 1).padStart(2, "0")}</span>
<span>${name}<small>${i < creationStepCount ? (pending[i].length ? `${pending[i].length} choice${pending[i].length === 1 ? "" : "s"} left` : "Ready") : i === experienceStep ? "Optional advances" : "Sheet & creation record"}</small>
</span>
</button>
</li>`,
      )
      .join("")}</ol>
</nav>
<div class="header-actions">${button("save-file", "Save character")}${button("load-file", "Load character")}${button("new", "New character")}<input type="file" id="import-file" accept="application/json,.json" hidden>
</div>
<p class="save-status">Saved automatically on this device</p>${button("sources", "Sources & decisions", "", "text-button")}${button("books", "Choose books", "", "text-button")}</aside>
<main class="panel">
<div class="stage-meta">
<span>Step ${s.step + 1} of ${steps.length}</span>
<span class="${pending[s.step].length ? "pending-status" : "ready-status"}">${s.step < creationStepCount ? (pending[s.step].length ? `${pending[s.step].length} choice${pending[s.step].length === 1 ? "" : "s"} remaining` : "✓ Ready") : issues.length ? `${issues.length} creation choices remaining` : "✓ Creation complete"}</span>
</div>${
      !setupOpen && locked() && s.step < creationStepCount
        ? `<div class="notice">Creation is locked while XP is spent. ${button("unlock", "Clear advancement & edit creation")}</div>
<div class="creation-lock">${body}</div>`
        : body
    }${
      undoChoice && !setupOpen
        ? `<div class="choice-undo">${button("undo-choice", `Undo ${esc(undoChoice.label)}`)}<small>Available until the next character edit or roll.</small>
</div>`
        : ""
    }${!setupOpen && s.step === 4 && hasColourMagic() ? cantPanel(R, s) : ""}${!setupOpen && s.step === 5 ? marketShop() + penaltySummary(R, s) : ""}${!setupOpen ? `<div class="step-footer">${s.step ? button("step", "Back", `data-step="${s.step - 1}"`) : "<span></span>"}<span class="footer-position">${s.step + 1} / ${steps.length}</span>${s.step < reviewStep ? button("step", `Continue to ${steps[s.step + 1]}`, `data-step="${s.step + 1}"`, "primary") : button("step", "Back to Experience", `data-step="${experienceStep}"`)}</div>` : ""}</main>
<aside class="sheet ${summaryExpanded ? "expanded" : ""}" aria-label="Character summary">
<div class="sheet-heading">
<span class="eyebrow">Character folio</span>
<h2>${esc(s.name || "Your character")}</h2>
<p>${esc(sheetSpecies(R, s))} · ${esc(c.name)} ${legacyTag(R, legacyContext(R, s))}</p>
<span class="profile-badge">${esc(c.levels[d.level - 1].name)} · ${d.status}</span>${button("summary-toggle", summaryExpanded ? "Hide details" : "View character", `aria-expanded="${summaryExpanded}" aria-controls="sheet-body"`, "summary-toggle")}</div>
<div class="mobile-totals">
<span>
<strong>${d.remaining.toLocaleString()}</strong> XP left</span>
<span>
<strong>${s.wealth ? formatMoney(result().wallet.remaining) : "—"}</strong> coin</span>
</div>
<div id="sheet-body" class="sheet-body">
<div class="stat-grid">${M.KEYS.map(
      (
        k,
      ) => `<button type="button" class="stat-calculation ${characteristicClass(k)}" data-action="calculation" data-kind="char" data-name="${k}" title="${esc(characteristicNames[k] + ": " + characteristicTitle(k))}" aria-label="Calculate ${esc(characteristicNames[k])}">
<small>${k}${c.advanceScheme[k] ? ` · L${c.advanceScheme[k]}` : ""}</small>
<strong>${k === "Ag" && eq.penalties.complete ? eq.penalties.agility : d.stats[k]}</strong>
</button>`,
    ).join("")}</div>
<div class="derived">${[
      ["Wounds", d.wounds],
      ["Movement", eq.penalties.complete ? eq.penalties.movement : d.movement],
      ["Fate", d.fate],
      ["Fortune", d.fortune],
    ]
      .map(
        ([k, v]) =>
          `<button type="button" class="derived-calculation" data-action="calculation" data-kind="derived" data-name="${k}">
<span title="${k}">${k === "Movement" ? "Move" : k}</span>
<strong>${v}</strong>
</button>`,
      )
      .join("")}</div>
<div class="folio-balances">
<div class="folio-xp">
<span>XP remaining</span>
<strong>${d.remaining.toLocaleString()} <small>XP</small>
</strong>
<p>${d.spent.toLocaleString()} spent of ${d.xpTotal.toLocaleString()}${d.xpBonus ? ` (+${d.xpBonus} star sign)` : ""}</p>
</div>
<div class="folio-coin">
<span>Remaining coin</span>
<strong>${s.wealth ? formatMoney(result().wallet.remaining) : "Not rolled"}</strong>
</div>
</div>
<div class="folio-line">
<span>Current tracker</span>
<strong>${d.ticks} / ${[10, 12, 14, "—"][d.level - 1]}</strong>
</div>
<button type="button" class="folio-line capacity-calculation" data-action="calculation" data-kind="derived" data-name="Capacity" aria-label="How is carrying capacity calculated?">
<span>${eq.unknown.length ? "Known Enc / capacity" : "Enc / capacity"}</span>
<strong>${eq.total} / ${d.capacity} <small>ⓘ</small>
</strong>
</button>${eq.penalties.complete && eq.penalties.band ? `<p class="packing-warning">${eq.penalties.immobile ? "Unable to move" : `Load: Move ${eq.penalties.movement}, Ag ${eq.penalties.agility}`} (p. 299)</p>` : ""}${folioMenus()}<div class="folio-status ${issues.length ? "pending" : "complete"}">
<span>${issues.length ? `${issues.length} choices remaining` : "✓ Creation complete"}</span>${issues.length ? button("issue", "Finish choices", `data-step="${issueTarget(R, s, issues[0]).step}" data-target="${esc(issueTarget(R, s, issues[0]).target)}"`) : button("step", "Review & export", `data-step="${reviewStep}"`)}</div>
</div>
</aside>
</div>
<div class="mobile-workspace-bar">
<span>${d.remaining.toLocaleString()} XP · ${s.wealth ? formatMoney(result().wallet.remaining) : "Coin unrolled"}</span>${button("mobile-folio", "View character")}${button("mobile-choice", "Back to choice")}</div>
<footer class="footer-note">Rules from your selected books · Your draft stays on this device</footer>`;
  }
  return { workspaceShell };
}
