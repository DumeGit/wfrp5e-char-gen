import { chapterHeading } from "../design-system.mjs";
import { npcChecks } from "../npc-flow.mjs";
import { npcSheetHTML } from "../npc-sheet.mjs";
import { npcText } from "../npc-export.mjs";
import { esc } from "../workspace.mjs";
import { btn } from "./npc-controls.mjs";
export function createNPCReview(getContext) {
  function reviewView() {
    const { R, s, d } = getContext(),
      checks = npcChecks(d);
    const disabled = checks.blocked
      ? 'disabled aria-describedby="npc-export-status"'
      : "";
    return `${chapterHeading("Review & export")}<p>A compact sheet for use at the table. Source discrepancies and validation explanations stay in this app.</p>
      <section class="npc-export-card"><div id="npc-export-status" class="${checks.blocked ? "error" : "ready-status"}"><strong>${checks.blocked ? `Resolve ${checks.errors.length} required choices to export.` : "✓ Your stat sheet is ready."}</strong></div><div class="npc-toolbar">${btn("pdf", "Export compact PDF", disabled, "primary")}${btn("copy", "Copy stat block", disabled)}${btn("text", "Download text", disabled)}</div><p class="small muted">All final scores, attacks, protection, Skills, Talents, Traits, gear and magic. Long profiles continue onto another page.</p></section>
      ${npcSheetHTML(R, s, d)}
      <details class="npc-section" data-detail-key="npc:creation-record"><summary>Editable draft & creation record</summary><p class="small muted">Keep an editable file with every change, recorded roll and XP purchase. Saving your draft works even while choices remain unresolved.</p><div class="npc-toolbar">${btn("save", "Save editable NPC")}${btn("record-text", "Download creation record")}</div><pre class="npc-rule-text">${esc(npcText(R, s, { record: true, result: d }).split("CREATION RECORD")[1] || "")}</pre></details>`;
  }
  return { reviewView };
}
