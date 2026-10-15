import { reviewSheet } from "../review-sheet.mjs";
import { sourceButton } from "../source-controls.mjs";
import { detailKey } from "../disclosures.mjs";
import { elfReview } from "../high-elf-ui.mjs";
import { dwarfReview } from "../dwarf-guide-ui.mjs";
import * as M from "../rules.mjs";
import { steps } from "../ui.mjs";
import { folioData } from "../folio.mjs";
import { penaltySummary } from "../creator-ui.mjs";
import { LEGACY_EXPLANATION } from "../legacy.mjs";
import { issueTarget } from "../issue-targets.mjs";
import { speciesRulePanel } from "../archives-ui.mjs";
import { cantReview } from "../archives-iii-ui.mjs";
import { womReferencePanel } from "../winds-of-magic-ui.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function ledgerTable() {
    let { result, s, esc, ref } = getContext();

    const d = result().derived;
    return s.ledger.length
      ? `<div class="table-wrap"><table><thead><tr><th># / Improvement</th><th>XP</th><th>Total</th><th>Source</th></tr></thead><tbody>${s.ledger.map((x, i) => `<tr><td>${i + 1}. ${esc(x.name)}${["char", "skill"].includes(x.type) ? ` +${x.amount === 1 ? 1 : 5}` : ""}<br><small>${d.trackerCredits[i] ? "+1 tracker box" : x.type === "promotion" ? "Career advancement" : x.amount === 1 && (x.inCareer ?? x.tick) ? `${d.trackerProgressAt[i]}/5 toward a tracker box` : "No tracker box"}</small></td><td>${x.cost}</td><td>${s.ledger.slice(0, i + 1).reduce((a, b) => a + b.cost, 0)}</td><td>${ref(x)}</td></tr>`).join("")}</tbody></table>
</div>`
      : '<p class="empty">No XP spent yet. Unspent XP can be kept.</p>';
  }

  function review() {
    const {
      result,
      R,
      s,
      errors,
      esc,
      fullAppendix,
      talentDescription,
      spellDescription,
      ref,
    } = getContext();
    const snapshot = result(),
      e = errors();
    const record = (key, title, body) =>
      `<details class="review-detail" data-detail-key="review-sheet:${key}"><summary>${title}</summary><div class="review-detail-body">${body}</div></details>`;
    const recordsHTML = [
      record("ledger", "XP record", ledgerTable()),
      record(
        "rolls",
        `Dice record · ${s.rolls.length}`,
        `<p class="small muted">Each die uses the browser’s cryptographic random generator with rejection sampling. Raw faces, totals and timestamps are recorded. This editable local history is not a tamper-proof certificate.</p>${s.rolls.length ? s.rolls.map((r) => `<div class="roll-entry"><strong>${esc(r.label)}</strong> · ${esc(r.dice)}: ${r.values.map(esc).join(" + ")} = ${esc(r.total)} ${ref(r)}<br><small class="muted">${esc(r.at)}</small></div>`).join("") : '<p class="empty">No dice have been rolled.</p>'}`,
      ),
      record(
        "load",
        "Equipment effects & carrying details",
        penaltySummary(R, s, snapshot),
      ),
      record(
        "book-details",
        "Book-specific abilities & reminders",
        `${speciesRulePanel(R, s)}${cantReview(R, s)}${womReferencePanel(R, s)}${dwarfReview(R, s)}${elfReview(R, s)}${reviewNotices(snapshot.derived, snapshot.equipment)}`,
      ),
      record(
        "sources",
        "Sources & interpretations",
        `<p>${esc(LEGACY_EXPLANATION)}</p><p>${R.books.map((b) => esc(b.title)).join("; ")} are enabled. Each option identifies its book and printed page. Applicable adaptations are always included in the export record.</p><p>Navigation uses Initiative (p. 112); the sheet’s printed “Int” is corrected to I. Leather Breastplate uses Leather Jerkin statistics with the agreed naming note. The +45 Skill Advance costs 850 XP as printed (p. 191). Optional +1 prices follow Appendix II (p. 364). Five +1 Career Advances in the same Skill or Characteristic count as one tracker box, using your interpretation where the appendix is silent.</p><p>Unlisted weights are not invented. Situational Talent effects remain in their reference text. GM decisions still apply.</p>`,
      ),
    ].join("");
    return reviewSheet(R, s, snapshot, {
      issues: e,
      issueHTML: e.length ? issuePanel(e, "Unfinished choices") : "",
      talentDescription,
      spellDescription,
      recordsHTML,
      fullAppendix,
    });
  }

  function issuePanel(issues, title) {
    let { esc, R, s, button } = getContext();

    return `<div class="issue-panel"><strong>${esc(title)}</strong><ul>${issues
      .map((message) => {
        const target = issueTarget(R, s, message);
        return `<li data-issue-code="${esc(message.code)}" data-severity="${esc(message.severity)}">${button("issue", `${esc(message.message)} <span>Open the choice in ${esc(steps[target.step])}</span>`, `data-step="${target.step}" data-target="${esc(target.target)}"`)} ${sourceButton(R, message)}</li>`;
      })
      .join("")}</ul>
</div>`;
  }

  function trackerBoxes(d) {
    const goal = [10, 12, 14, 0][d.level - 1];
    return goal
      ? `<div class="tracker-boxes" role="img" aria-label="${d.ticks} of ${goal} Career tracker boxes">${Array.from({ length: goal }, (_, i) => `<span class="${i < d.ticks ? "filled" : ""}" aria-hidden="true">${i < d.ticks ? "✓" : ""}</span>`).join("")}</div>
<p class="small muted tracker-caption">${d.ticks} / ${goal} boxes toward level ${d.level + 1}</p>`
      : '<p class="small muted">Final Career level reached.</p>';
  }

  function folioMenus() {
    let { R, s, result, folioOpen, button, esc } = getContext();

    const sections = folioData(R, s, result());
    return `<div class="folio-menus">${Object.entries(sections)
      .map(
        ([key, rows]) =>
          `<details data-detail-key="${detailKey("folio", key)}" class="folio-section" data-folio-section="${key}" ${folioOpen.has(key) ? "open" : ""}><summary><span class="folio-toggle" aria-hidden="true"></span><span>${key[0].toUpperCase() + key.slice(1)}</span><span class="folio-count">${rows.length}</span></summary>${rows.length ? `<ul class="folio-list">${rows.map((row) => `<li><span>${key === "skills" ? button("calculation", esc(row.name), `data-kind="skill" data-name="${esc(row.name)}"`, "folio-name-button") : esc(row.name)}${row.legacy ? `<button type="button" class="legacy-tag" data-action="legacy-info" data-explanation="${esc(row.legacyTitle)}" title="${esc(row.legacyTitle)}">Legacy</button>` : ""}</span>${key === "magic" ? "" : `<strong class="folio-value"${row.value === null ? ' title="Quantity not rolled yet"' : ""}>${row.value === null ? "?" : `${key === "skills" ? "" : "×"}${row.value}`}</strong>`}</li>`).join("")}</ul>` : '<p class="folio-empty">None yet.</p>'}</details>`,
      )
      .join("")}</div>`;
  }

  function hasColourMagic() {
    let { result, R } = getContext();

    return result().derived.talents.some(
      (t) =>
        /^Arcane Magic \(/.test(t) &&
        R.config.colours.includes(t.match(/\((.*)\)/)?.[1]),
    );
  }

  function reviewNotices(d, eq) {
    let { esc, result } = getContext();
    const notices = result().notices;
    const data = notices
      .filter((x) => x.severity === "warning")
      .map((x) => x.message);
    const reminders = notices
      .filter((x) => x.severity === "info")
      .map((x) => x.message);
    return `${data.length ? `<details data-detail-key="${detailKey("review-view:reviewNotices:0")}" class="review-warnings" open><summary>Unresolved supplied data · ${data.length}</summary><p class="small muted">These are distinct from unfinished creation choices. The app retains unknown values and records the limitation in your export.</p>${data.map((x) => `<p>${esc(x)}</p>`).join("")}</details>` : ""}<details data-detail-key="${detailKey("review-view:reviewNotices:1")}" class="review-reminders"><summary>Rules & reference reminders · ${reminders.length}</summary>${reminders.map((x) => `<p class="small">${esc(x)}</p>`).join("")}</details>`;
  }
  return {
    ledgerTable,
    review,
    issuePanel,
    trackerBoxes,
    folioMenus,
    hasColourMagic,
    reviewNotices,
  };
}
