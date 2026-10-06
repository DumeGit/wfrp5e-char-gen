import * as M from "../rules.mjs";
import { esc } from "../workspace.mjs";
import { causeTalent, namedCause } from "../talent-targets.mjs";
import { npcMagicChoices, npcQuote, npcCareerTalents } from "../npc-result.mjs";
import { btn, select, field } from "./npc-controls.mjs";
export function createNPCDevelopment(getContext, ref) {
  function xpView() {
    const { R, s, d, ui } = getContext(),
      c = R.careers.find((x) => x.id === s.career);
    let options = [];
    if (c && ui.xpType === "char")
      options = M.KEYS.filter(
        (k) => c.advanceScheme[k] && c.advanceScheme[k] <= s.careerLevel,
      );
    if (c && ui.xpType === "skill")
      options = [
        ...new Set(
          c.levels
            .slice(0, s.careerLevel)
            .flatMap((l) => l.skills.flatMap((n) => M.options(R, n, "skill"))),
        ),
      ].sort();
    if (c && ui.xpType === "talent") options = npcCareerTalents(R, s, d);
    if (c && ui.xpType === "spell")
      options = npcMagicChoices(R, d).map((x) => [
        `${x.entry.contentId}|${x.lore}`,
        `${x.entry.name} (${x.lore})`,
      ]);
    const name = options.some(
        (x) => (Array.isArray(x) ? x[0] : x) === ui.xpName,
      )
        ? ui.xpName
        : "",
      purchaseName =
        ui.xpType === "talent" && causeTalent(name)
          ? namedCause(ui.xpTarget) || name
          : name,
      [id, lore] = (name || "").split("|"),
      quote = name
        ? npcQuote(
            R,
            s,
            ui.xpType,
            purchaseName,
            ui.xpType === "talent" || ui.xpType === "spell"
              ? 1
              : Number(ui.amount),
            { contentId: id, lore },
          )
        : { error: "Choose an advancement." };
    return `<section id="npc-xp" class="npc-section"><div class="xp-balance"><div><span>Available</span><strong>${d.remaining} XP</strong></div><div><span>Spent</span><strong>${d.spent} XP</strong></div></div><details data-detail-key="npc:pricing"><summary>How NPC advancement is priced</summary><p class="notice small">Core p. 318 permits Career-based NPC development. Printed profiles do not give their past XP or Advance counts. Enter existing counts for pricing (including any template contribution); these inputs do not change the scores. Career level is a GM choice, with no player-creation tracker or promotion gate.</p></details><div class="npc-toolbar">${field("Career", select("npc-career", [["", "None"], ...R.careers.map((x) => [x.id, x.name])], s.career, `data-state="career" ${s.ledger.length ? "disabled" : ""}`))}${field("Career level", select("npc-level", [1, 2, 3, 4], s.careerLevel, `data-state="careerLevel" ${s.ledger.length ? "disabled" : ""}`))}${field("XP budget", `<input id="npc-budget" data-state="xpBudget" type="number" min="0" value="${s.xpBudget}">`)}</div><div class="npc-toolbar">${field(
      "Advance type",
      select(
        "npc-xp-type",
        [
          ["char", "Characteristic"],
          ["skill", "Skill"],
          ["talent", "Talent"],
          ["spell", "Spell"],
        ],
        ui.xpType,
        'data-ui="xpType"',
      ),
    )}${field("Advancement", select("npc-xp-name", [["", "Choose…"], ...options], name, 'data-ui="xpName"'))}${ui.xpType === "talent" && causeTalent(name) ? field("Cause", `<input id="npc-xp-target" data-ui="xpTarget" type="text" maxlength="160" value="${esc(ui.xpTarget)}" placeholder="Enter a political, religious or philosophical cause">`) : ""}${
      ["char", "skill"].includes(ui.xpType)
        ? field(
            "Increase",
            select(
              "npc-xp-amount",
              [
                [5, "+5"],
                [1, "+1 (optional p. 364)"],
              ],
              ui.amount,
              'data-ui="amount"',
            ),
          )
        : ""
    }</div>${name && ["char", "skill"].includes(ui.xpType) ? field("Existing Advances before paid development", `<input id="npc-advance-count" data-advance-count="${ui.xpType}" data-name="${esc(name)}" type="number" min="0" value="${s.advanceCounts[ui.xpType][name] ?? ""}" ${s.ledger.some((x) => x.type === ui.xpType && x.name === name) ? "disabled" : ""}>`) : ""}<div class="npc-toolbar">${btn("buy-xp", quote.cost !== undefined ? `${quote.cost} XP` : "Buy advancement", quote.error ? "disabled" : "", "primary")}<span class="small ${quote.error ? "error" : "muted"}">${esc(quote.error || `${d.remaining} XP available`)}</span></div><ol class="npc-xp-ledger">${s.ledger.map((x) => `<li>${esc(x.name)}${["char", "skill"].includes(x.type) ? ` +${x.amount}` : ""} — ${x.cost} XP</li>`).join("")}</ol>${s.ledger.length ? btn("undo-xp", "Undo last XP purchase") : ""}</section>`;
  }
  return { xpView };
}
