import { npcChecks } from "../npc-flow.mjs";
import { npcSourceLabel } from "../npc-books.mjs";
import { legacyTitle } from "../legacy.mjs";
import { esc } from "../workspace.mjs";
import { btn } from "./npc-controls.mjs";
export function npcFeedback(R, d, { all = false } = {}) {
  const { errors, warnings, notes } = npcChecks(d);
  const row = (x) =>
    `<li><span>${esc(x.message)}</span><small>${esc(npcSourceLabel(R, x.source))}</small>${x.control.target ? btn("issue", "Go to choice", `data-issue-index="${d.issues.indexOf(x)}"`, "text-button") : ""}</li>`;
  const adaptations = [
    ...new Set(
      [d.profile, ...d.traits, ...d.talents, ...d.magic, ...d.gear]
        .map((x) => legacyTitle(R, x))
        .filter(Boolean),
    ),
  ];
  return `${
    errors.length
      ? `<section class="npc-feedback npc-feedback-error" aria-label="Required choices" role="alert"><div class="npc-section-heading"><h2>${errors.length} required ${errors.length === 1 ? "choice" : "choices"} before export</h2><span class="npc-status-badge">Export blocked</span></div><p>Your draft is saved. Resolve these choices to finish the stat sheet.</p><ul>${errors
          .slice(0, all ? errors.length : 3)
          .map(row)
          .join(
            "",
          )}</ul>${!all && errors.length > 3 ? btn("issues", `View all ${errors.length} required choices`) : ""}</section>`
      : ""
  }
    ${warnings.length || notes.length || adaptations.length ? `<details class="npc-feedback npc-feedback-warning" data-detail-key="npc:source-checks" ${all ? "open" : ""}><summary>Source notes & checks <small>${warnings.length + notes.length + adaptations.length} · do not block export</small></summary><ul>${warnings.map(row).join("")}${notes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${adaptations.length ? `<h3>Legacy adaptations</h3><ul>${adaptations.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}<p class="small muted">These explanations stay in the app. The compact sheet contains the creature’s final values and abilities.</p></details>` : ""}`;
}
