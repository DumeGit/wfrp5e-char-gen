import { esc } from "../workspace.mjs";
import { NPC_KEYS, NPC_SIZES } from "../bestiary-content.mjs";
import { grantChoices } from "../npc-profile.mjs";
import { btn, select, field, value } from "./npc-controls.mjs";
export function createNPCCharacteristics(getContext, ref) {
  function templateView() {
    const { R, s, d } = getContext(),
      t = d.template;
    return `<h2>Development template</h2><p class="small muted">Choose one template; its adjustments are added to the printed profile. Worked examples already include their printed template. ${btn("template-reference", "Read templates", "", "text-button")}</p>${field("Template", select("npc-template", [["", "None"], ...R.templates.map((x) => [x.contentId, x.name])], s.template, `data-state="template" ${s.ledger.length ? "disabled" : ""}`))}${s.ledger.length ? '<p class="small">Undo paid development before changing the template.</p>' : ""}${
      t
        ? `<p class="small">${Object.entries(t.adjustments)
            .map(([k, n]) => `${k} +${n}`)
            .join(
              " · ",
            )} ${ref(t)}</p><div class="npc-template-choices">${t.skills
            .map((g, i) => {
              const options = grantChoices(R, g, "skill");
              if (options.length === 1)
                return `<p class="small">${esc(options[0])} +${g.bonus}</p>`;
              return field(
                `${esc(g.options.join(" / "))} +${g.bonus} · choose ${g.count}`,
                Array.from({ length: g.count }, (_, n) =>
                  select(
                    `npc-template-skill-${i}-${n}`,
                    [["", "Choose…"], ...options],
                    s.templateSkills[i]?.[n] || "",
                    `data-template-skill="${i}" data-slot="${n}" aria-label="${esc(g.options.join(" / "))} choice ${n + 1} of ${g.count}"`,
                  ),
                ).join(""),
              );
            })
            .join("")}${t.talents
            .map((g, i) => {
              const options = grantChoices(R, g, "talent");
              return options.length === 1
                ? `<p class="small">${esc(options[0])}${g.ranks > 1 ? ` ×${g.ranks}` : ""}</p>`
                : field(
                    "Talent choice",
                    select(
                      `npc-template-talent-${i}`,
                      [["", "Choose…"], ...options],
                      s.templateTalents[i] || "",
                      `data-template-talent="${i}"`,
                    ),
                  );
            })
            .join(
              "",
            )}</div><p class="notice small">Skill bonuses use the higher existing or template bonus, by the approved interpretation. Template adjustments do not establish the NPC’s earlier XP history.</p>`
        : ""
    }`;
  }
  function statsView() {
    const { R, s, d } = getContext();
    return `<h2>Characteristics & size</h2>${field("Creature anatomy", select("npc-anatomy", ["Standard", "Quadruped", "Bird", "Snake", "Spider", "Other"], s.anatomy, 'data-state="anatomy"'))}<p class="small muted">${esc(d.hitLocations)} Core p. 318.</p><div class="npc-toolbar">${field("Size", select("npc-size", [...NPC_SIZES, "Tiny"], s.size, 'data-state="size"'))}${btn("individualise", "Individualise: −10 + 2d10", "", "primary")}${btn("reset-scores", "Clear GM score overrides")}${Object.keys(s.characteristicRolls).length ? btn("reset-individualise", "Clear individualisation") : ""}</div><p class="small muted">Blank fields retain the calculated value. A number is an explicit final GM score. Individualisation rolls each present Characteristic; Movement and Wounds are excluded. Core p. 318.</p><div class="npc-score-grid">${NPC_KEYS.map((k) => `<label for="npc-score-${k}"><strong>${k}</strong><span>Current ${value(d.stats[k])}</span><input id="npc-score-${k}" data-score="${k}" inputmode="numeric" type="number" min="0" max="1000000" value="${s.overrides[k] ?? ""}" placeholder="${value(d.stats[k])}">${btn("calculation", "?", `data-key="${k}" aria-label="How ${k} is calculated"`, "calculation-help")}</label>`).join("")}</div>
    <div class="npc-toolbar">${field(
      "Toughness Bonus",
      select(
        "npc-tb",
        [
          ["printed", "Retain printed TB"],
          ["calculate", "Recalculate from Toughness"],
          ["manual", "GM value"],
        ],
        s.tbMode,
        'data-state="tbMode"',
      ),
    )}${s.tbMode === "manual" ? field("Manual TB", `<input id="npc-tb-value" data-state="tbOverride" type="number" min="0" value="${s.tbOverride ?? ""}">`) : `<p>TB ${value(d.tb)}</p>`}</div>`;
  }
  return { templateView, statsView };
}
