import * as M from "../rules.mjs";
import { esc } from "../workspace.mjs";
import { chapterHeading, ledgerEmblem } from "../design-system.mjs";
import { NPC_KEYS, NPC_SIZES } from "../bestiary-content.mjs";
import {
  profileFeatures,
  suggestedTraits,
  grantChoices,
  traitParameter,
  armourOptions,
  printedArmour,
} from "../npc-profile.mjs";
import { npcMagicChoices, npcQuote, npcCareerTalents } from "../npc-result.mjs";
import { npcText } from "../npc-export.mjs";

export const npcSteps = [
  "Base profile",
  "Customise",
  "Equipment & magic",
  "Review & export",
];
export const value = (v) => (v === null || v === undefined ? "—" : v);
export const btn = (action, label, attrs = "", skin = "quiet") =>
  `<button type="button" class="${skin}" data-npc-action="${action}" ${attrs}>${esc(label)}</button>`;
export const select = (id, options, current, attrs = "") =>
  `<select id="${id}" ${attrs}>${options
    .map((x) => {
      const [v, n] = Array.isArray(x) ? x : [x, x];
      return `<option value="${esc(v)}" ${String(v) === String(current) ? "selected" : ""}>${esc(n)}</option>`;
    })
    .join("")}</select>`;
export const field = (label, control) =>
  `<div class="field"><label>${label}${control}</label></div>`;
export function createNPCViews(getContext) {
  const ref = (x) =>
    btn(
      "reference",
      `p. ${x.page || x.source?.page}`,
      `data-id="${esc(x.contentId)}"`,
      "source-button",
    );
  function profileView() {
    const { R, s, d, ui } = getContext();
    const rows = R.creatures.filter(
      (x) =>
        (!ui.category || x.category === ui.category) &&
        (!ui.filter ||
          `${x.name} ${x.category}`
            .toLowerCase()
            .includes(ui.filter.toLowerCase())),
    );
    return `${chapterHeading("Base profile")}<p>Start with a printed core profile, then make it your own. ${ref(d.profile)}</p>
    <div class="npc-toolbar">${field("Find a profile", `<input type="search" id="npc-profile-search" data-ui="filter" value="${esc(ui.filter)}" placeholder="Orc, merchant, dragon…">`)}${field("Category", select("npc-category", [["", "All categories"], ...[...new Set(R.creatures.map((x) => x.category))]], ui.category, 'data-ui="category"'))}</div>
    <div class="npc-profile-grid">${rows.map((x) => `<button class="npc-profile-card ${x.contentId === s.profile ? "selected" : ""}" data-npc-action="profile" data-id="${esc(x.contentId)}" aria-pressed="${x.contentId === s.profile}"><strong>${esc(x.name)}</strong><span>${esc(x.size)} · p. ${x.page}${x.example ? " · Worked example" : ""}</span></button>`).join("") || "<p>No matching profiles.</p>"}</div>
    <h2>Identity</h2><div class="npc-toolbar">${field("Name", `<input id="npc-name" data-state="name" value="${esc(s.name)}">`)}${field("GM notes / role", `<textarea id="npc-notes" data-state="notes" rows="2">${esc(s.notes)}</textarea>`)}</div>
    <details id="npc-printed" data-detail-key="npc:printed"><summary>Original printed profile ${esc(d.profile.name)}</summary><pre class="npc-rule-text">${esc(d.profile.text)}</pre></details>
    ${d.profile.notes.map((x) => `<p class="notice small">${esc(x)}</p>`).join("")}`;
  }
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
                    `data-template-skill="${i}" data-slot="${n}"`,
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
    const { s, d } = getContext();
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
  function traitsView() {
    const { R, s, d, ui } = getContext(),
      entry = R.traits.find((x) => x.contentId === ui.trait),
      parameter = entry ? traitParameter(entry.name, entry) : null;
    let choices;
    if (entry?.name === "Trained")
      choices = [
        "Broken",
        "Drive",
        "Entertain",
        "Fetch",
        "Guard",
        "Home",
        "Magic",
        "Mount",
        "War",
      ];
    if (entry?.name === "Breath")
      choices = ["Acid", "Cold", "Electricity", "Fire", "Poison", "Smoke"];
    if (entry?.name === "Mark of Chaos")
      choices = ["Khorne", "Nurgle", "Slaanesh", "Tzeentch"];
    if (["Blessed", "Miracles"].includes(entry?.name)) choices = R.config.gods;
    if (entry?.name === "Spellcaster")
      choices = [...new Set(R.spells.map((x) => x.category))].filter(
        (x) => !["Petty", "Arcane", "Blessing", ...R.config.gods].includes(x),
      );
    return `<h2>Creature Traits</h2><div id="npc-traits" class="npc-compact-list">${d.traits
      .filter((t) => t.name !== "Size")
      .map(
        (t) =>
          `<div class="npc-item"><details data-detail-key="npc:trait:${esc(t.id)}:${esc(t.value)}"><summary><strong>${esc(t.name)}${t.value ? ` (${esc(t.value)})` : ""}</strong><small>${t.printed ? "Printed" : "Added"}</small></summary><p>${esc(R.traits.find((x) => x.contentId === t.id)?.text || "")}</p>${ref(R.traits.find((x) => x.contentId === t.id))}</details>${t.printed || s.traits.some((x) => x.id === t.id && x.value === t.value) ? btn("remove-trait", "Remove", `data-id="${esc(t.id)}" data-value="${esc(t.value)}" data-printed="${t.printed}"`) : `<small class="muted">Granted by selected option</small>`}</div>`,
      )
      .join(
        "",
      )}</div><p class="small">${suggestedTraits(R, d.profile).length ? "Printed suggestions: " : ""}${suggestedTraits(
      R,
      d.profile,
    )
      .map((t) =>
        btn(
          "suggest-trait",
          t.name,
          `data-id="${esc(t.contentId)}"`,
          "text-button",
        ),
      )
      .join(" · ")}</p>
    <div class="npc-toolbar">${field("Add Trait", select("npc-trait-select", [["", "Choose…"], ...R.traits.filter((x) => x.name !== "Size").map((x) => [x.contentId, x.name])], ui.trait, 'data-ui="trait"'))}${parameter ? field(entry.parameter || "Value", choices ? select("npc-trait-value", [["", "Choose…"], ...choices], ui.traitValue, 'data-ui="traitValue"') : `<input id="npc-trait-value" data-ui="traitValue" ${parameter === "number" ? 'type="number" min="1"' : ""} value="${esc(ui.traitValue)}" placeholder="${parameter === "number" ? "Rating" : esc(entry.parameter || "Value")}">`) : ""}${btn("add-trait", "Add Trait", entry ? "" : "disabled", "primary")}</div>${entry ? `<p class="small">${esc(entry.text)} ${ref(entry)}</p>` : ""}
    ${d.training.has("Broken") && !profileFeatures(R, d.profile, "trait").some((t) => t.name === "Trained" && t.value.includes("Broken")) ? `<div id="npc-training-roll">${btn("training-roll", "Roll Broken’s 2d10 Fellowship")}${s.trainingRoll ? `<span>${s.trainingRoll.faces.join(" + ")} = ${s.trainingRoll.faces.reduce((a, b) => a + b, 0)}</span>` : ""}</div>` : ""}
    ${d.traits.some((t) => t.name === "Mark of Chaos" && t.value === "Tzeentch" && !t.printed) ? `<div id="npc-mark-roll" class="npc-toolbar">${field("First Mutation table", select("npc-mark-start", ["Mental", "Physical"], ui.markStart, 'data-ui="markStart"'))}${btn("mark-roll", "Roll Tzeentch Mutations")}${s.markRoll ? `<span>d10 ${s.markRoll.faces[0]} → ${Math.ceil(s.markRoll.faces[0] / 3)} alternating Mutations</span>` : ""}</div>` : ""}`;
  }
  function skillsTalentsView() {
    const { R, s, d, ui } = getContext(),
      skills = [
        ...new Set(
          R.skills.flatMap((x) =>
            M.options(R, `${x.name}${x.grouped ? " (Any)" : ""}`, "skill"),
          ),
        ),
      ].sort(),
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
    return `<details data-detail-key="npc:skill-talent"><summary>Skills & Talents <small>${d.skills.length} Skills · ${d.talents.length} Talents</small></summary><h3>Skills</h3><div class="npc-compact-list">${d.skills.map((x) => `<div class="npc-inline"><strong>${esc(x.name)}</strong><span>${value(x.total)} <small>(bonus ${value(x.advance)}${x.paid ? ` + ${x.paid} paid` : ""})</small></span>${s.skills.some((y) => y.name === x.name) ? btn("remove-skill", "Remove GM bonus", `data-name="${esc(x.name)}"`) : x.origins.some((y) => y.startsWith("Printed")) ? btn("remove-printed-skill", "Remove", `data-name="${esc(x.name)}"`) : ""}</div>`).join("")}</div><div class="npc-toolbar">${field("Skill", select("npc-add-skill", skills, ui.skill, 'data-ui="skill"'))}${field("GM bonus", `<input id="npc-skill-bonus" type="number" min="0" value="${ui.skillBonus}" data-ui="skillBonus">`)}${btn("add-skill", "Add / update bonus", "", "primary")}</div><h3>Talents</h3>${d.talents.map((t) => `<div class="npc-item"><details data-detail-key="npc:talent:${esc(t.name)}"><summary>${esc(t.name)}${t.ranks > 1 ? ` ×${t.ranks}` : ""}</summary><p>${esc(M.talentInfo(R, t.name)?.text || "See core source")}</p></details>${s.talents.some((x) => x.name === t.name) ? btn("remove-talent", "Remove GM ranks", `data-name="${esc(t.name)}"`) : t.origins.includes("Printed") ? btn("remove-printed-talent", "Remove", `data-name="${esc(t.name)}"`) : ""}</div>`).join("")}<div class="npc-toolbar">${field("Talent", select("npc-talent", talents, ui.talent, 'data-ui="talent"'))}${/\(Any\)$/.test(ui.talent) ? field("Specify target", `<input id="npc-talent-target" type="text" data-ui="talentTarget" value="${esc(ui.talentTarget || "")}" placeholder="Enter the printed Talent target">`) : ""}${field("Ranks", `<input id="npc-talent-ranks" data-ui="talentRanks" type="number" min="1" value="${ui.talentRanks}">`)}${btn("add-talent", "Add GM Talent", "", "primary")}</div><p class="small muted">GM additions cost no XP. Use paid development below for Career purchases. Permanent supported effects are calculated; situational effects remain in the rule description.</p></details>`;
  }
  function mutationsView() {
    const { R, s, d, ui } = getContext();
    return `<details id="npc-mutations" data-detail-key="npc:mutations"><summary>Mutations <small>${d.mutations.length} chosen</small></summary>${d.mutations.map((m, i) => `<div class="npc-item"><div><strong>${esc(m.name)}</strong><p class="small">${esc(m.text)} ${ref(m)}</p>${["Extra Mouth", "Patchy Feathers", "Spiny Protrusions"].includes(m.name) ? field("Location(s)", `<input id="npc-mutation-location-${i}" data-mutation-location="${i}" value="${esc(m.location || "")}" placeholder="Enter the location(s) rolled on p. 163">`) : ""}</div>${btn("remove-mutation", "Remove", `data-index="${i}"`)}</div>`).join("")}<div class="npc-toolbar">${field(
      "Mutation",
      select(
        "npc-mutation",
        R.mutations.map((x) => [x.contentId, `${x.category}: ${x.name}`]),
        ui.mutation,
        'data-ui="mutation"',
      ),
    )}${btn("add-mutation", "Add Mutation")}${btn("roll-mutation", "Roll mental d100", 'data-table="Mental"')}${btn("roll-mutation", "Roll physical d100", 'data-table="Physical"')}</div></details>`;
  }
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
      [id, lore] = (name || "").split("|"),
      quote = name
        ? npcQuote(
            R,
            s,
            ui.xpType,
            name,
            ui.xpType === "talent" || ui.xpType === "spell"
              ? 1
              : Number(ui.amount),
            { contentId: id, lore },
          )
        : { error: "Choose an advancement." };
    return `<details id="npc-xp" data-detail-key="npc:xp"><summary>Optional Career development <small>${d.spent} / ${s.xpBudget} XP</small></summary><p class="notice small">Core p. 318 permits Career-based NPC development. Printed profiles do not give their past XP or Advance counts. Enter existing counts for pricing (including any template contribution); these inputs do not change the scores. Career level is a GM choice, with no player-creation tracker or promotion gate.</p><div class="npc-toolbar">${field("Career", select("npc-career", [["", "None"], ...R.careers.map((x) => [x.id, x.name])], s.career, `data-state="career" ${s.ledger.length ? "disabled" : ""}`))}${field("Career level", select("npc-level", [1, 2, 3, 4], s.careerLevel, `data-state="careerLevel" ${s.ledger.length ? "disabled" : ""}`))}${field("XP budget", `<input id="npc-budget" data-state="xpBudget" type="number" min="0" value="${s.xpBudget}">`)}</div><div class="npc-toolbar">${field(
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
    )}${field("Advancement", select("npc-xp-name", [["", "Choose…"], ...options], name, 'data-ui="xpName"'))}${
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
    }</div>${name && ["char", "skill"].includes(ui.xpType) ? field("Existing Advances before paid development", `<input id="npc-advance-count" data-advance-count="${ui.xpType}" data-name="${esc(name)}" type="number" min="0" value="${s.advanceCounts[ui.xpType][name] ?? ""}" ${s.ledger.some((x) => x.type === ui.xpType && x.name === name) ? "disabled" : ""}>`) : ""}<div class="npc-toolbar">${btn("buy-xp", quote.cost !== undefined ? `${quote.cost} XP` : "Buy advancement", quote.error ? "disabled" : "", "primary")}<span class="small ${quote.error ? "error" : "muted"}">${esc(quote.error || `${d.remaining} XP available`)}</span></div><ol class="npc-xp-ledger">${s.ledger.map((x) => `<li>${esc(x.name)}${["char", "skill"].includes(x.type) ? ` +${x.amount}` : ""} — ${x.cost} XP</li>`).join("")}</ol>${s.ledger.length ? btn("undo-xp", "Undo last XP purchase") : ""}</details>`;
  }
  function customView() {
    return `${chapterHeading("Customise")}${templateView()}${statsView()}${traitsView()}${skillsTalentsView()}${mutationsView()}${xpView()}`;
  }
  function gearMagicView() {
    const { R, s, d, ui } = getContext(),
      items = [...R.weapons, ...R.armour, ...R.gear, ...R.market]
        .filter((x, i, a) => a.findIndex((y) => y.name === x.name) === i)
        .sort((a, b) => a.name.localeCompare(b.name)),
      magic = npcMagicChoices(R, d);
    return `${chapterHeading("Equipment & magic")}<h2>Printed weapons & armour</h2>${d.profile.attacks.map((a, i) => `<label class="npc-checkbox"><input type="checkbox" data-attack-toggle="printed-attack-${i}" data-optional="${a.optional}" ${a.optional ? (s.optionalAttacks.includes(`printed-attack-${i}`) ? "checked" : "") : !s.removedAttacks.includes(`printed-attack-${i}`) ? "checked" : ""}>${esc(a.name)} ${a.optional ? "(optional)" : ""}</label>`).join("")}${printedArmour(
      d.profile,
    )
      .map(
        (x) =>
          `<label class="npc-checkbox"><input type="checkbox" data-base-armour-toggle="${x.id}" ${!s.removedArmour.includes(x.id) ? "checked" : ""}>${esc(x.name)} +${x.ap} AP</label>`,
      )
      .join("")}${armourOptions(d.profile)
      .map(
        (x) =>
          `<label class="npc-checkbox"><input type="checkbox" data-armour-toggle="${x.id}" ${s.optionalArmour.includes(x.id) ? "checked" : ""}>${esc(x.name)} +${x.ap} AP</label>`,
      )
      .join(
        "",
      )}<p class="small">${esc(d.profile.sections.Armour || "No printed armour")}</p><details data-detail-key="npc:attack-overrides"><summary>GM attack values</summary><p class="small muted">These are explicit final values, replacing the calculation. Blank restores the calculated attack.</p>${d.attacks.map((a) => `<div class="npc-toolbar"><strong>${esc(a.name)}</strong>${field("Skill", `<input id="npc-attack-skill-${esc(a.id)}" type="number" min="0" data-attack-id="${esc(a.id)}" data-attack-field="skill" value="${s.attackOverrides[a.id]?.skill ?? ""}" placeholder="${value(a.skill)}">`)}${field("Damage", `<input id="npc-attack-damage-${esc(a.id)}" type="number" min="0" data-attack-id="${esc(a.id)}" data-attack-field="damage" value="${s.attackOverrides[a.id]?.damage ?? ""}" placeholder="${value(a.damage)}">`)}</div>`).join("")}</details><h2>Additional equipment</h2><p class="small muted">Assign equipment as the GM. This does not make a purchase or invent a purse. Printed weapons and armour remain included separately.</p><p>${esc(d.profile.sections.Trappings || "")}</p>${d.gear.map((x) => `<div class="npc-inline"><strong>${esc(x.name)}</strong><span>×${x.quantity}</span>${btn("remove-gear", "Remove", `data-id="${esc(x.contentId)}"`)}</div>`).join("")}<div class="npc-toolbar">${field(
      "Equipment",
      select(
        "npc-gear",
        items.map((x) => [x.contentId, x.name]),
        ui.gear,
        'data-ui="gear"',
      ),
    )}${field("Quantity", `<input id="npc-gear-quantity" type="number" min="1" value="${ui.quantity}" data-ui="quantity">`)}${btn("add-gear", "Assign equipment", "", "primary")}</div><h2>Magic</h2><p class="small">${d.template?.magic ? `${d.template.name}: up to ${d.template.magic.petty} Petty spells and ${d.template.magic.lore} Lore spells (p. 354).` : "Magic requires a matching Talent or Creature Trait. GM selections and printed spells are recorded without live casting or resource tracking."}</p>${d.traits.some((x) => x.name === "Spellcaster" && !x.printed) && !d.template?.magic ? field("Channelling for Spellcaster", select("npc-trait-wind", [["", "Choose…"], ...M.options(R, "Channelling (Any)", "skill")], s.templateSkills["trait-wind"]?.[0] || "", 'data-template-skill="trait-wind" data-slot="0"')) : ""}<div id="npc-magic">${d.magic.map((x) => `<div class="npc-item"><details data-detail-key="npc:magic:${esc(x.contentId)}:${esc(x.lore)}"><summary>${esc(x.name)} <small>${esc(x.lore)}</small></summary><p>${esc(x.text)}</p>${ref(x)}</details>${x.origin === "Blessings" ? "" : btn("remove-spell", "Remove", `data-id="${esc(x.contentId)}" data-lore="${esc(x.lore)}"`)}</div>`).join("")}</div><div class="npc-toolbar">${field("Spell", select("npc-spell", [["", "Choose…"], ...magic.map((x) => [`${x.entry.contentId}|${x.lore}`, `${x.entry.name} (${x.lore})`])], ui.spell, 'data-ui="spell"'))}${btn("add-spell", "Select GM spell", ui.spell ? "" : "disabled", "primary")}</div>${ui.spell ? `<p class="small">${esc(R.spells.find((x) => x.contentId === ui.spell.split("|")[0])?.text || "")}</p>` : ""}`;
  }
  function reviewView() {
    const { R, s, d } = getContext();
    return `${chapterHeading("Review & export")}<p>Export a dedicated GM stat block, with an optional creation and XP record.</p><div class="npc-toolbar">${btn("copy", "Copy stat block")}${btn("text", "Download text")}${btn("pdf", "Export stat block PDF", "", "primary")}${btn("pdf-record", "PDF + creation record")}${btn("save", "Save editable NPC")}</div><p class="small muted">Errors need resolving before PDF export. Warnings and printed discrepancies remain in the export. Save JSON preserves the complete editable draft.</p><pre class="npc-rule-text">${esc(npcText(R, s, { result: d }))}</pre><details data-detail-key="npc:record"><summary>Creation, dice & XP record</summary><pre class="npc-rule-text">${esc(npcText(R, s, { record: true, result: d }).split("CREATION RECORD")[1] || "")}</pre></details>`;
  }
  function folio() {
    const { s, d } = getContext();
    return `<aside class="sheet npc-sheet" aria-label="NPC stat block"><div class="sheet-heading"><span class="eyebrow">GM bestiary</span><div class="folio-crest">${ledgerEmblem()}</div><h2>${esc(d.name)}</h2><p>${esc(d.profile.name)} · ${esc(d.size)}${d.template ? ` · ${esc(d.template.name)}` : ""}</p>${btn("folio-toggle", "View stat block", 'aria-expanded="false"', "summary-toggle")}</div><div class="npc-folio-body"><div class="npc-folio-stats">${NPC_KEYS.map((k) => `<div><small>${k}</small><strong>${value(d.stats[k])}</strong></div>`).join("")}</div><p class="small">SB ${value(d.sb)} · TB ${value(d.tb)} · Walk ${value(d.walk)} · Run ${value(d.run)}</p><p class="small">Combat Initiative ${value(d.combatInitiative)}</p><h3>Attacks</h3>${d.attacks.map((a) => `<p class="npc-attack"><strong>${esc(a.name)}</strong><span>${a.skill === null ? "Rule" : a.skill}${a.damage === null ? "" : ` / +${a.damage}`}</span><small>${esc(a.text)}</small></p>`).join("")}<p class="small">${
      Object.entries(d.protection)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k} ${v} AP`)
        .join(" · ") || "No Armour Points"
    }</p>${[
      ["Skills", d.skills.map((x) => `${x.name} ${value(x.total)}`)],
      [
        "Talents",
        d.talents.map((x) => `${x.name}${x.ranks > 1 ? ` ×${x.ranks}` : ""}`),
      ],
      [
        "Traits",
        d.traits.map((x) => `${x.name}${x.value ? ` (${x.value})` : ""}`),
      ],
      ["Magic", d.magic.map((x) => x.name)],
      [
        "Equipment",
        [
          d.profile.sections.Trappings || "",
          ...d.gear.map((x) => `${x.name} ×${x.quantity}`),
        ].filter(Boolean),
      ],
    ]
      .map(
        ([name, list]) =>
          `<details class="folio-section" data-detail-key="npc:folio:${name}"><summary>${name}<small>${list.length}</small></summary><ul class="folio-list">${list.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>`,
      )
      .join(
        "",
      )}<p class="small">${d.remaining} XP remaining · ${d.spent} spent</p>${btn("step", "Review & export", 'data-step="3"', "primary")}</div></aside>`;
  }
  function render() {
    const { s, d, undoAvailable, verify } = getContext();
    return `<div class="workspace npc-workspace"><aside class="rail"><div class="rail-heading"><span class="eyebrow">NPC & monster creation</span><strong>The GM’s bestiary</strong></div><a class="npc-mode-link" href="index.html${verify ? "?verify=1" : ""}">← Player character creator</a><div class="mobile-step field"><label for="npc-mobile-step">Creation section</label>${select(
      "npc-mobile-step",
      npcSteps.map((x, i) => [i, x]),
      s.step,
      'data-state="step"',
    )}</div><nav aria-label="NPC creation sections"><ol class="steps">${npcSteps.map((name, i) => `<li>${btn("step", name, `data-step="${i}" ${i === s.step ? 'aria-current="step"' : ""}`, i === s.step ? "active" : "")}</li>`).join("")}</ol></nav><div class="header-actions">${btn("save", "Save NPC")}${btn("load", "Load NPC")}${btn("new", "New NPC")}${btn("duplicate", "Duplicate NPC")}${btn("undo", "Undo last edit", undoAvailable ? "" : "disabled")}<div data-install-slot></div></div><p class="save-status">Separate draft · saved on this device</p><p class="small">Core book only · pp. 318–363</p><input id="npc-import" type="file" accept="application/json,.json" hidden></aside><main class="panel"><div class="stage-meta"><span>Section ${s.step + 1} of 4</span><span>${d.issues.filter((x) => x.severity === "error").length} unresolved errors</span></div>${[profileView, customView, gearMagicView, reviewView][s.step]()}${d.issues.length ? `<details class="npc-issues" data-detail-key="npc:issues" ${d.issues.some((x) => x.severity === "error") ? "open" : ""}><summary>Checks & source discrepancies (${d.issues.length})</summary>${d.issues.map((x) => `<p class="${x.severity === "error" ? "error" : "small"}">${esc(x.message)} ${btn("issue", "Show control", `data-code="${esc(x.code)}"`, "text-button")}</p>`).join("")}</details>` : ""}<div class="step-footer">${s.step ? btn("step", "Back", `data-step="${s.step - 1}"`) : "<span></span>"}${s.step < 3 ? btn("step", `Continue to ${npcSteps[s.step + 1]}`, `data-step="${s.step + 1}"`, "primary") : ""}</div></main>${folio()}</div>`;
  }
  return { render };
}
