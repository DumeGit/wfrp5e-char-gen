import { CAUSE_KEY } from "./talent-targets.mjs";
export function causeControl(s, esc, button) {
  return `<div class="field"><label for="impassioned-cause">Impassioned Zeal: Cause</label><div class="budget-form"><input id="impassioned-cause" type="text" maxlength="160" value="${esc(s.talentChoices[CAUSE_KEY] || "")}" placeholder="Enter your political, religious or philosophical cause">${button("set-cause", "Use this Cause")}</div><small>Choosing a Cause grants no Talent or Advances. Normal purchase limits and XP apply.</small></div>`;
}
