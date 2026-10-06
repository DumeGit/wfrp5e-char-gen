import * as M from "../rules.mjs";
import { esc } from "../workspace.mjs";
import { grantChoices } from "../npc-profile.mjs";
import { legacyTag } from "../legacy.mjs";
import { btn, select, field, value } from "./npc-controls.mjs";
export function createNPCTraining(getContext, ref) {
  function skillsView() {
    const { R, s, d, ui } = getContext(),
      skills = [
        ...new Set(
          R.skills.flatMap((x) =>
            M.options(R, `${x.name}${x.grouped ? " (Any)" : ""}`, "skill"),
          ),
        ),
      ].sort();
    return `<section class="npc-section"><h3>Skills</h3><div class="npc-compact-list">${d.skills.map((x) => `<div class="npc-inline"><strong>${esc(x.name)}</strong><span>${value(x.total)} <small>(bonus ${value(x.advance)}${x.paid ? ` + ${x.paid} paid` : ""})</small></span>${s.skills.some((y) => y.name === x.name) ? btn("remove-skill", "Remove GM bonus", `data-name="${esc(x.name)}"`) : x.origins.some((y) => y.startsWith("Printed")) ? btn("remove-printed-skill", "Remove", `data-name="${esc(x.name)}"`) : ""}</div>`).join("")}</div><div class="npc-toolbar">${field("Skill", select("npc-add-skill", [["", "Choose…"], ...skills], ui.skill, 'data-ui="skill"'))}${field("GM bonus", `<input id="npc-skill-bonus" type="number" min="0" value="${ui.skillBonus}" data-ui="skillBonus">`)}${btn("add-skill", "Add / update bonus", ui.skill ? "" : "disabled", "primary")}</div></section>`;
  }
  function talentsView() {
    const { R, s, d, ui } = getContext(),
      talents = [
        ...new Set(
          R.talents.flatMap((x) =>
            grantChoices(
              R,
              {
                options: [
                  x.name.includes("(") ? `${M.base(x.name)} (Any)` : x.name,
                ],
              },
              "talent",
            ),
          ),
        ),
      ].sort();
    return `<section class="npc-section"><h3>Talents</h3>${d.talents.map((t) => `<div class="npc-item"><details data-detail-key="npc:talent:${esc(t.name)}"><summary>${esc(t.name)}${t.ranks > 1 ? ` ×${t.ranks}` : ""}${legacyTag(R, t)}</summary><p>${esc(M.talentInfo(R, t.name)?.text || "See source")}</p>${ref(M.talentInfo(R, t.name))}</details>${s.talents.some((x) => x.name === t.name) ? btn("remove-talent", "Remove GM ranks", `data-name="${esc(t.name)}"`) : t.origins.includes("Printed") ? btn("remove-printed-talent", "Remove", `data-name="${esc(t.name)}"`) : ""}</div>`).join("")}<div class="npc-toolbar">${field("Talent", select("npc-talent", [["", "Choose…"], ...talents], ui.talent, 'data-ui="talent"'))}${/\(Any(?: Cause)?\)$/.test(ui.talent) ? field("Specify target", `<input id="npc-talent-target" type="text" data-ui="talentTarget" value="${esc(ui.talentTarget || "")}" placeholder="Enter the printed Talent target">`) : ""}${field("Ranks", `<input id="npc-talent-ranks" data-ui="talentRanks" type="number" min="1" value="${ui.talentRanks}">`)}${btn("add-talent", "Add GM Talent", ui.talent ? "" : "disabled", "primary")}</div><p class="small muted">GM additions cost no XP. Use Career development for Career purchases. Permanent supported effects are calculated; situational effects remain in the rule description.</p></section>`;
  }
  return { skillsView, talentsView };
}
