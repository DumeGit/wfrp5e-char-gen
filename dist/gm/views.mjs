import { templateSummary } from "./templates.mjs";
import { spellLoreControl, cantControls } from "./cant-controls.mjs";
import { KEYS, skillInfo, talentInfo, options, base } from "../rules.mjs";
import { creatorSwitch } from "../creator-switch.mjs";
import { chapterHeading, ledgerEmblem } from "../design-system.mjs";
import {
  esc,
  score,
  button,
  field,
  select,
  detail,
  reference,
  remove,
  empty,
  legacyBadge,
} from "./controls.mjs";
import { sourceLabel, bookId } from "./books.mjs";
import {
  SIZES,
  TRAINING,
  BREATH,
  PARAMETER,
  rowName,
  magicChoices,
  gmLoreIssue,
  gmSkillCharacteristic,
  gmTalentLimit,
  gmCastableLores,
} from "./model.mjs";
import { statBlock } from "./sheet.mjs";
export const STEPS = [
  "Starting profile",
  "Customise",
  "Equipment & magic",
  "Review & export",
];
export const TABS = ["Characteristics", "Traits", "Skills & Talents"];
// Preview the compiled grants, keeping every alternative available to inspect.
export function templateOverview(t) {
  const rows = (slots, kind) =>
    `<ul class="gm-template-grants">${slots
      .map((slot, index) => {
        const choices = slot.options.length > 1,
          label = slot.options.map(esc).join(" or "),
          amount = kind === "Skill" ? `+${slot.bonus}` : `×${slot.ranks}`,
          choice = choices
            ? `<small class="gm-template-choice">Choose ${slot.count || 1}${slot.count > 1 ? " different" : ""}</small>`
            : "",
          names =
            slot.options.length > 3
              ? detail(
                  `template:${t.id}:${kind}:${index}`,
                  `${[...new Set(slot.options.map(base))].map(esc).join(" or ")} <small>${slot.options.length} options</small>`,
                  `<ul>${slot.options.map((name) => `<li>${esc(name)}</li>`).join("")}</ul>`,
                )
              : `<span>${label}</span>`;
        return `<li><div>${names}${choice}</div><strong>${amount}</strong></li>`;
      })
      .join("")}</ul>`;
  return `<div class="gm-template-preview"><p class="gm-template-source">${esc(sourceLabel(t))} · One template at a time ${legacyBadge(t)}</p>
    <section><h3>Characteristics</h3><dl class="gm-template-adjustments">${Object.entries(
      t.adjustments,
    )
      .map(
        ([key, amount]) =>
          `<div><dt>${esc(key)}</dt><dd>${amount >= 0 ? "+" : ""}${amount}</dd></div>`,
      )
      .join(
        "",
      )}</dl><p class="gm-small">${esc(templateSummary(t))}. Wounds are recalculated after applying the template.</p></section>
    <div class="gm-template-columns"><section><h3>Skills</h3>${rows(t.skills, "Skill")}<p class="gm-small">Uses the higher of the existing Skill bonus and the template bonus.</p></section><section><h3>Talents</h3>${t.talents.length ? rows(t.talents, "Talent") : '<p class="gm-small">No Talents granted.</p>'}${t.magic ? `<h3>Magic</h3><ul class="gm-template-grants"><li><span>Petty spells</span><strong>Up to ${t.magic.petty}</strong></li><li><span>Spells from a suitable Lore</span><strong>Up to ${t.magic.lore}</strong></li></ul><p class="gm-small">Choose compatible spells in Equipment &amp; magic.</p>` : ""}</section></div>
    ${t.traits?.length || t.removeTraits?.length ? `<section><h3>Creature Traits</h3><p>${t.traits.map((x) => esc(rowName(x))).join(", ") || "No added Traits"}</p>${t.removeTraits?.length ? `<p>Remove: ${t.removeTraits.map(esc).join(", ")}</p>` : ""}</section>` : ""}
    ${t.armour ? `<section><h3>Armour</h3><p>Additional protection: +${t.armour} AP</p></section>` : ""}
    ${t.gear?.length ? `<section><h3>Trappings</h3><ul class="gm-template-grants">${t.gear.map((x) => `<li>${esc(x.label)}${x.choose ? " · explicit choice" : ""}</li>`).join("")}</ul>${t.trappings ? `<p>${esc(t.trappings)}</p>` : ""}</section>` : ""}
    ${t.magicGroups ? `<section><h3>Magic</h3><ul class="gm-template-grants">${t.magicGroups.map((g) => `<li><span>${g.categories.map(esc).join(" / ")}</span><strong>Choose ${g.count}</strong></li>`).join("")}</ul></section>` : ""}
    <p class="gm-template-footnote">Replacing a template clears its previous choices and chosen magic. Explicit GM scores, equipment and Traits remain. Undo restores the previous build.</p></div>`;
}
const paragraph = (text) => `<p>${esc(text)}</p>`;
const origin = (x) => `<span class="gm-origin">${esc(x.origin || "GM")}</span>`;
const textArea = (label, key, value) =>
  `<div class="field"><label for="gm-${key}">${label}</label><textarea id="gm-${key}" data-bind="${key}" rows="3">${esc(value)}</textarea></div>`;
const entryBody = (text, page, entry = { page }) =>
  `${paragraph(text)}<small>${esc(sourceLabel(entry))} · Situational effects are references for play.</small>`;
function bookControls(data, s) {
  return `<fieldset class="gm-books"><legend>Profile &amp; template books</legend><div><span class="gm-small">Fifth Edition core · always included</span>${data.books
    .filter((b) => b.id !== "core")
    .map(
      (b) =>
        `<label class="gm-check"><input id="gm-book-${b.id}" type="checkbox" data-book="${b.id}" ${s.books.includes(b.id) ? "checked" : ""}>${esc(b.title)} <small>${b.profileCount ?? data.profiles.filter((p) => bookId(p) === b.id).length} profiles · ${b.templateCount ?? data.templates.filter((t) => bookId(t) === b.id).length} templates</small></label>`,
    )
    .join(
      "",
    )}</div><p class="gm-small">All integrated books’ Skills, Talents, equipment and magic are always available. These selections only change starting profiles and templates.</p></fieldset>`;
}
function printedTraining(data, s, t) {
  const existing =
    (s.profile &&
      data.profiles
        .find((p) => p.id === s.profile)
        ?.traits.find((x) => x.key === t.key)
        ?.value.split(",")
        .map((n) => n.trim())) ||
    [];
  const choices = [...TRAINING, ...(data.training || []).map((x) => x.name)];
  return `<fieldset class="gm-training" id="trait-${t.key}"><legend>Training · add to printed profile</legend>${choices.map((n) => `<label class="gm-check"><input type="checkbox" data-extra-training="1" value="${n}" ${existing.includes(n) || s.extraTraining.includes(n) ? "checked" : ""} ${existing.includes(n) ? "disabled" : ""}>${esc(n)}${existing.includes(n) ? " <small>Printed</small>" : ""}</label>`).join("")}</fieldset>`;
}
export function profileResults(data, ui) {
  const q = ui.profileQuery.toLowerCase().trim(),
    rows = data.profiles
      .filter(
        (p) =>
          (!ui.category || p.category === ui.category) &&
          (!ui.profileBook || bookId(p) === ui.profileBook) &&
          (!q || `${p.name} ${p.category}`.toLowerCase().includes(q)),
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
      );
  return `<p class="gm-results-count" role="status">${rows.length} printed profile${rows.length === 1 ? "" : "s"}</p><div class="gm-profile-grid">${rows.map((p) => `<button class="gm-profile-card" type="button" data-action="preview-profile" data-id="${p.id}"><span class="gm-card-category">${esc(p.category)}${p.example ? " · Worked example" : ""}</span><strong>${esc(p.name)}</strong><span class="gm-card-stats"><b>${esc(p.size)}</b><span>M ${score(p.stats.M)} · WS ${score(p.stats.WS)} · W ${p.stats.W}</span></span><small>${esc(sourceLabel(p))}${p.adaptation ? ' <span class="legacy-tag">Legacy</span>' : ""}<span>Preview →</span></small></button>`).join("")}</div>${!rows.length ? empty("No matching profiles. Try another name, category or book.") : ""}`;
}
function starting(data, s, r, ui) {
  return `<p class="lede">Start with a complete printed profile. Keep it as written or make it your own.</p>${bookControls(data, s)}${r.profile ? `<div class="gm-foundation"><div><span class="eyebrow">Starting profile</span><strong>${esc(r.profile.name)}</strong><small>${esc(r.profile.category)} · ${esc(sourceLabel(r.profile))}</small></div>${legacyBadge(r.profile)}${button(ui.browse ? "Close library" : "Browse profiles", "browse")}</div><div class="gm-fields">${field("Name", "gm-name", s.name, `data-bind="name" placeholder="${esc(r.profile.name)}"`)}${field("Short description", "gm-description", s.description, 'data-bind="description" placeholder="Appearance or identifying detail"')}</div>${detail("personality", "Personality & purpose <small>Optional</small>", `<p class="gm-small">Give the NPC a purpose, motivation and manner. Core guidance for roleplaying NPCs; no mechanical bonuses.</p><div class="gm-fields">${field("Purpose / role", "gm-purpose", s.purpose, 'data-bind="purpose"')}${field("Motivation", "gm-motivation", s.motivation, 'data-bind="motivation"')}${field("Manner", "gm-manner", s.manner, 'data-bind="manner"')}</div>`)} ` : ""}
  ${!r.profile || ui.browse ? `<div class="gm-library"><div class="gm-browser-filters">${field("Find a profile", "gm-profile-search", ui.profileQuery, 'type="search" data-ui="profileQuery" placeholder="Human, Goblin, Dragon…"')}${select("Category", "gm-category", [["", "All categories"], ...[...new Set(data.profiles.map((p) => p.category))].map((x) => [x, x])], ui.category, 'data-ui="category"')}${select("Book", "gm-profile-book", [["", "All enabled books"], ...data.books.filter((b) => data.profiles.some((p) => bookId(p) === b.id)).map((b) => [b.id, b.shortTitle || b.title])], ui.profileBook || "", 'data-ui="profileBook"')}</div><div id="gm-profile-results">${profileResults(data, ui)}</div></div>` : ""}`;
}
function templateChoices(s, r) {
  const t = r.template;
  if (!t) return "";
  const skills = t.skills.flatMap((slot, i) =>
    slot.options.length > 1
      ? Array.from({ length: slot.count }, (_, j) =>
          select(
            `${base(slot.options[0])}${slot.count > 1 ? ` ${j + 1} of ${slot.count}` : ""} · +${slot.bonus}`,
            `template-skill-${i}${j ? `-${j}` : ""}`,
            [["", "Choose…"], ...slot.options],
            s.templateSkills[i]?.[j] || "",
            `data-template-skill="${i}" data-choice="${j}"`,
          ),
        )
      : [],
  );
  const talents = t.talents.flatMap((slot, i) =>
    slot.options.length > 1
      ? [
          select(
            slot.options.length > 2 ? "Magical Lore" : "Casting Talent",
            `template-talent-${i}`,
            [["", "Choose…"], ...slot.options],
            s.templateTalents[i] || "",
            `data-template-talent="${i}"`,
          ),
        ]
      : [],
  );
  const gear = (t.gear || []).flatMap((slot, i) =>
    slot.choose || slot.options.length > 1
      ? [
          select(
            slot.label,
            `template-gear-${i}`,
            [["", "Choose…"], ...slot.options.map((x) => [x.id, x.name])],
            s.templateGear[i] || "",
            `data-template-gear="${i}"`,
          ),
        ]
      : [],
  );
  return skills.length || talents.length || gear.length
    ? `<section class="gm-template-choices"><h2>${esc(t.name)} choices</h2><div class="gm-fields">${[...talents, ...skills, ...gear].join("")}</div></section>`
    : "";
}
function characteristics(s, r) {
  return `<div class="gm-section-heading"><h2>Characteristics</h2>${button("Roll individual variation", "roll-all", `title="Printed score −10 + 2d10, core p. 318"`)}</div><p class="gm-small">Edit the starting score; template, Talent and Size changes are added once. Individual variation uses printed score −10 + 2d10 (p. 318).</p><div class="gm-characteristics">${["M", ...KEYS].map((k) => `<div class="gm-char-row"><label for="stat-${k}"><b>${k}</b><small>Printed ${score(r.profile.stats[k])}</small></label><input aria-label="${k} starting score" id="stat-${k}" type="number" min="0" step="1" placeholder="—" value="${esc(Object.hasOwn(s.stats, k) ? (s.stats[k] ?? "") : (r.profile.stats[k] ?? ""))}" data-stat="${k}"><span class="gm-char-final">→ <b>${score(r.stats[k])}</b></span>${k !== "M" && r.profile.stats[k] !== null ? button("⚄", "roll-stat", `data-key="${k}" aria-label="Roll individual variation for ${k}"`) : ""}${Object.hasOwn(s.stats, k) ? button("↶", "reset-stat", `data-key="${k}" aria-label="Restore printed ${k}"`) : ""}</div>`).join("")}</div>
  <h2>Size & derived values</h2><div class="gm-fields">${select("Size", "gm-size", SIZES, s.size || r.profile.size, `data-bind="size" ${r.swarm ? 'disabled title="Swarm ignores Size changes"' : ""}`)}${field("Wounds override", "gm-wounds", s.wounds ?? "", 'data-bind="wounds" min="0" step="1" placeholder="Calculated / printed"', "number")}${select(
    "Toughness Bonus",
    "gm-tb-mode",
    [
      ["", "Printed until changed"],
      ["printed", "Keep printed bonus"],
      ["calculated", "Calculate from Toughness"],
      ["manual", "Set manually"],
    ],
    s.tbMode,
    'data-bind="tbMode"',
  )}${s.tbMode === "manual" ? field("Manual Toughness Bonus", "gm-tb", s.tb ?? "", 'data-bind="tb" min="0"', "number") : ""}</div><label class="gm-check"><input type="checkbox" data-bind="recalculate" ${s.recalculate ? "checked" : ""}> Recalculate derived values from this build</label>
  ${detail("calculations", "How totals are calculated", `<p>Printed scores are the baseline. Template and Size changes, explicit Talent benefits and selected Corruption effects are added to that baseline. Printed Skills retain their difference from the associated Characteristic; a template uses the higher Skill bonus. GM Skill totals override that result.</p><p>Untouched profiles retain printed Wounds, attacks and Toughness Bonus. Changed profiles use the core Size formula (pp. 360–361); Hardy adds Toughness Bonus before multiplication. Construct substitutes Strength Bonus for Willpower Bonus. Swarm uses five times the normal creature’s Wounds and ignores Size changes. Tiny requires a manual Wounds value.</p><p>Primary melee Damage changes with Strength Bonus and the Size bonus. Ranged and extra attacks receive no Size bonus. Situational effects remain reference text.</p>`)}
  ${s.rolls.length ? detail("rolls", `Recorded dice <small>${s.rolls.length}</small>`, `<ol class="gm-roll-list">${s.rolls.map((x) => `<li><strong>${esc(x.label)}</strong> ${x.faces.join(" + ")} = ${x.total}<small>${esc(x.at)} · Core p. ${x.page}</small></li>`).join("")}</ol>`) : ""}`;
}
export function traitParameter(data, R, t, profile) {
  if (t.name === "Size")
    return `<span class="gm-small">Change Size in Characteristics.</span>`;
  const param =
    PARAMETER[t.name] ?? data.traits.find((x) => x.name === t.name)?.parameter;
  if (!param) return "";
  const attr = `data-trait="${t.key}"`;
  const choices =
    t.name === "Breath"
      ? BREATH
      : t.name === "Mark of Chaos"
        ? ["Khorne", "Nurgle", "Slaanesh", "Tzeentch"]
        : ["Blessed", "Miracles"].includes(t.name)
          ? R.config.gods
          : t.name === "Spellcaster"
            ? gmCastableLores(R)
            : t.name === "Corruption"
              ? ["Minor", "Moderate", "Major"]
              : t.name === "Venom"
                ? [
                    "Very Easy",
                    "Easy",
                    "Average",
                    "Challenging",
                    "Difficult",
                    "Hard",
                    "Very Hard",
                  ]
                : null;
  if (t.name === "Spellcaster")
    return `<fieldset class="gm-training" id="trait-${t.key}"><legend>Magical Lores</legend>${choices
      .map((n) => {
        const selected = t.value
          .split(",")
          .map((x) => x.trim())
          .includes(n);
        const reason = gmLoreIssue(R, profile, n);
        return `<label class="gm-check"><input type="checkbox" data-lore="${t.key}" value="${esc(n)}" ${selected ? "checked" : ""} ${reason && !selected ? "disabled" : ""}>${esc(n)}${reason ? `<small>${esc(reason)}</small>` : ""}</label>`;
      })
      .join("")}</fieldset>`;
  if (t.name === "Trained")
    return `<fieldset class="gm-training" id="trait-${t.key}"><legend>Training</legend>${[
      ...TRAINING,
      ...(data.training || []).map((x) => x.name),
    ]
      .map(
        (n) =>
          `<label class="gm-check"><input type="checkbox" data-training="${t.key}" value="${n}" ${
            t.value
              .split(",")
              .map((x) => x.trim())
              .includes(n)
              ? "checked"
              : ""
          }>${n}</label>`,
      )
      .join("")}</fieldset>`;
  return choices
    ? select(
        param,
        `trait-${t.key}`,
        [
          ["", "Choose…"],
          ...new Set([...choices, ...(t.value ? [t.value] : [])]),
        ],
        t.value,
        attr,
      )
    : field(
        param,
        `trait-${t.key}`,
        t.value,
        `${attr} ${["Rating", "Number", "Damage"].includes(param) ? 'min="1" step="1"' : ""}`,
        ["Rating", "Number", "Damage"].includes(param) ? "number" : "text",
      );
}
function traits(data, R, s, r) {
  return `<div class="gm-section-heading"><h2>Creature Traits</h2>${button("Add Trait", "picker", 'data-kind="trait"', "primary")}</div><p class="gm-small">Printed Traits are included. Their full definitions open below; effects used during play stay as references.</p><div class="gm-entry-list">${r.traits.map((t) => `<div class="gm-entry"><div>${detail(t.key, `${esc(t.name)} ${t.value ? `<small>(${esc(t.value)})</small>` : ""} ${origin(t)}`, entryBody(t.text, t.page, t))}${legacyBadge(t)}${t.origin === "GM" ? traitParameter(data, R, t, r.profile) : t.name === "Trained" ? printedTraining(data, s, t) : ""}</div>${t.name !== "Size" && t.origin !== "Training" ? remove(t.key) : ""}</div>`).join("")}</div>
  ${r.optionalTraits.length ? detail("optional-traits", "Suggested optional Traits", `<div class="gm-chips">${r.optionalTraits.map((t, i) => button(esc(rowName(t)), "optional-trait", `data-index="${i}"`)).join("")}</div><p class="gm-small">Suggestions from the profile, not automatic grants. Parameters can be changed after adding.</p>`) : ""}
  ${r.traits.some((t) => (t.origin === "GM" || s.extraTraining.includes("Broken")) && t.name === "Trained" && t.value.includes("Broken")) ? `<div class="gm-callout"><p>Broken training adds 2d10 Fellowship; an absent score starts at 0 (p. 363).</p>${button(s.brokenRoll ? `Roll again · ${s.brokenRoll.join(" + ")}` : "Roll 2d10 Fellowship", "broken-roll", 'id="gm-broken-roll"')}</div>` : ""}
  ${r.traits.some((t) => ["Mutation", "Mental Corruption", "Mark of Chaos"].includes(t.name)) ? `<section id="gm-mutations"><div class="gm-section-heading"><h2>Corruption choices</h2>${button("Choose mutation", "picker", 'data-kind="mutation"')}</div>${r.traits.some((t) => t.name === "Mark of Chaos" && t.value === "Tzeentch" && t.origin === "GM") ? `<p class="gm-small">Tzeentch grants ceil(1d10 ÷ 3) alternating Mental/Physical mutations (p. 359).</p>${button(s.markRoll ? `Roll again · ${s.markRoll} → ${Math.ceil(s.markRoll / 3)} mutations` : "Roll Tzeentch mutations", "mark-roll")}` : ""}<div class="gm-chips">${button("Roll Physical", "mutation-roll", 'data-category="Physical"')}${button("Roll Mental", "mutation-roll", 'data-category="Mental"')}</div>${r.mutations.map((m) => `<div class="gm-entry"><div>${detail(m.id, esc(m.name), entryBody(m.text, m.page))}</div>${remove(m.id)}</div>`).join("")}</section>` : ""}`;
}
function skillsTalents(R, s, r) {
  return `<div class="gm-section-heading"><h2>Skills</h2>${button("Add Skill", "picker", 'data-kind="skill"', "primary")}</div><p class="gm-small">Scores below are final totals. Edit a total to make an explicit GM adjustment.</p><div class="gm-entry-list">${r.skills.map((t) => `<div class="gm-skill-row"><div><strong>${esc(t.name)}</strong><small>${esc(t.origin)} · ${t.char || "Printed total"}</small></div><input type="number" min="0" step="1" value="${t.total}" data-skill="${esc(t.name)}" aria-label="${esc(t.name)} total">${button("?", "reference", `data-kind="skill" data-name="${esc(t.name)}" aria-label="Read ${esc(t.name)}"`)}${remove(t.key || `skill:${t.name}`)}</div>`).join("")}</div>
  ${r.undeadRidingOptions?.length ? detail("undead-riding", "Optional undead mount Skills", `<p class="gm-small">Night Parade p. 10: explicitly add a listed Ride Skill with +20, using the higher existing bonus. No automatic PC allocation.</p><div class="gm-chips">${r.undeadRidingOptions.map((name) => button(esc(name) + " +20", "undead-ride", `data-name="${esc(name)}"`)).join("")}</div>`) : ""}
  <div class="gm-section-heading"><h2>Talents</h2>${button("Add Talent", "picker", 'data-kind="talent"', "primary")}</div>${r.talents.length ? r.talents.map((t) => `<div class="gm-entry"><div>${detail(t.key, `${esc(t.name)}${t.ranks > 1 ? ` ×${t.ranks}` : ""} ${origin(t)}`, entryBody(talentInfo(R, t.name)?.text || "Printed Talent; see source.", talentInfo(R, t.name)?.page || r.profile.page, talentInfo(R, t.name) || r.profile))}${legacyBadge(t)}${t.origin === "GM" && base(t.name) === "Impassioned Zeal" ? field("Cause", `cause-${t.key}`, t.name.match(/\((.*?)\)/)?.[1] || "", `data-cause="${t.key}"`) : ""}</div>${t.origin === "GM" ? `<input class="gm-rank" type="number" min="1" ${Number.isFinite(gmTalentLimit(R, r.stats, t.name)) ? `max="${gmTalentLimit(R, r.stats, t.name)}"` : ""} value="${t.ranks}" data-rank="${t.key}" aria-label="${esc(t.name)} ranks">` : ""}${t.origin === "Template" || t.origin === "Trait" ? "" : remove(t.key)}</div>`).join("") : empty("No Talents included yet.")}`;
}
function customise(data, R, s, r, ui) {
  if (!r.profile) return empty("Choose a starting profile first.");
  return `<div class="gm-template-bar"><div><span class="eyebrow">Creature template</span><strong>${esc(r.template?.name || "Develop this profile")}</strong><small>${r.template ? `${esc(sourceLabel(r.template))} · one template at a time` : "Optional · develop the profile with a source-reviewed template"}</small></div><div class="gm-template-actions">${button(r.template ? "Change template" : "Choose template", "template-picker", "", "primary")}${r.template ? button("Remove template", "clear-template") : ""}</div></div>${r.template ? legacyBadge(r.template) : ""}${templateChoices(s, r)}<div class="page-tabs" role="tablist" aria-label="Customisation">${TABS.map((name, i) => `<button role="tab" id="gm-tab-${i}" aria-controls="gm-custom-content" aria-selected="${ui.tab === i}" tabindex="${ui.tab === i ? 0 : -1}" class="${ui.tab === i ? "active" : ""}" data-action="tab" data-tab="${i}">${name}</button>`).join("")}</div><div id="gm-custom-content" role="tabpanel" aria-labelledby="gm-tab-${ui.tab}">${ui.tab === 0 ? characteristics(s, r) : ui.tab === 1 ? traits(data, R, s, r) : skillsTalents(R, s, r)}</div>`;
}
function equipmentMagic(R, s, r) {
  if (!r.profile) return empty("Choose a starting profile first.");
  const optional = r.profile.attacks.filter((x) => x.optional),
    optArmour = r.profile.armour.filter((x) => x.optional),
    eligible = magicChoices(R, r);
  return `<div class="gm-section-heading"><h2>Attacks & equipment</h2>${button("Add equipment", "picker", 'data-kind="equipment"', "primary")}</div><p class="gm-small">The printed attack and armour profiles are included. GM equipment has no shopping budget. Attack scores and Damage can be adjusted explicitly; clearing an override restores the calculation.</p>${optional.length || optArmour.length ? detail("optional-equipment", "Optional printed equipment", `${optional.map((a) => `<label class="gm-check"><input type="checkbox" data-optional-attack="${a.key}" ${s.optionalAttacks.includes(a.key) ? "checked" : ""}>${esc(a.name)} · ${score(a.skill)} / +${a.damage}</label>`).join("")}${optArmour.map((a) => `<label class="gm-check"><input type="checkbox" data-optional-armour="${a.key}" ${s.optionalArmour.includes(a.key) ? "checked" : ""}>${esc(a.name)} · +${a.ap} AP</label>`).join("")}`, true) : ""}
  <div class="gm-attack-labels"><span>Attack</span><span>Score</span><span>Damage</span><span></span></div>${r.attacks.map((a) => `<div class="gm-attack-row" id="attack-${a.key}"><div><strong>${esc(a.name)}</strong><small>${esc(a.text || "Primary attack")}</small>${legacyBadge(a)}</div><input type="number" min="0" step="1" value="${a.skill ?? ""}" data-attack="${a.key}" data-property="skill" aria-label="${esc(a.name)} attack score"><input type="number" min="0" step="1" value="${a.damage ?? ""}" data-attack="${a.key}" data-property="damage" aria-label="${esc(a.name)} Damage">${remove(a.key)}</div>`).join("")}
  <h2>Defence</h2><div class="gm-defence-summary"><strong>TB ${score(r.tb)}</strong>${Object.entries(
    r.ap,
  )
    .map(([loc, ap]) => `<span>${loc} <b>${ap} AP</b></span>`)
    .join(
      "",
    )}</div>${r.shield ? paragraph(`Shield adds +${r.shield} AP when applicable.`) : ""}${r.armour.map((a) => `<div class="gm-entry"><div><strong>${esc(a.name)}</strong> ${origin(a)}<small class="gm-small">+${a.ap} AP · ${a.shield ? "Shield" : esc(a.locations)}</small></div>${remove(a.key)}</div>`).join("")}
  <h2>Trappings</h2>${(r.trappings ?? r.profile.sections.Trappings) ? paragraph(r.trappings ?? r.profile.sections.Trappings) : ""}${r.gear.length ? r.gear.map((g) => `<div class="gm-entry" id="gear-${g.key}"><div><strong>${esc(g.entry.name)}</strong>${legacyBadge(g.entry)}<small class="gm-small">${esc(sourceLabel(g.entry))}${g.entry.qualities ? ` · ${esc(g.entry.qualities)}` : ""}</small></div>${g.origin === "Template" ? '<small class="gm-origin">Template · ×1</small>' : `<input class="gm-rank" type="number" min="1" step="1" value="${g.quantity}" data-quantity="${g.key}" aria-label="${esc(g.entry.name)} quantity">`}${remove(g.key)}</div>`).join("") : empty("Add other belongings as needed.")}
  <section id="gm-magic"><div class="gm-section-heading"><h2>Magic &amp; knowledge</h2>${eligible.length ? button("Choose magic", "picker", 'data-kind="magic"', "primary") : ""}</div><p class="gm-small">${eligible.length ? "All integrated book choices follow the selected Lore, patron, magical template or knowledge Talent. No PC starting spell grants or XP are added." : "Add an appropriate magical template or Talent, Spellcaster Trait or Bless/Invoke to unlock spells, rituals and techniques."}${r.template?.magicGroups ? ` ${r.template.name}: ${r.template.magicGroups.map((g) => `${g.count} ${g.categories.join(" / ")}`).join(", ")} spells (${esc(sourceLabel(r.template))}).` : ""}${r.template?.magic ? ` ${r.template.name}: up to ${r.template.magic.petty} Petty and ${r.template.magic.lore} Lore spells (p. ${r.template.page}).` : ""}</p>${r.runes?.length ? `<h3>Rune knowledge</h3>${r.runes.map((x) => detail(`rune:${x.contentId}`, esc(x.name) + ` <small>${esc(x.form)}</small>`, entryBody(x.text, x.page, x))).join("")}` : ""}${r.spells.map((x, i) => `<div class="gm-entry"><div>${detail(x.contentId, `${esc(x.name)} <small>${esc(x.category)}</small>`, `<p class="gm-small">${x.category === "Technique" ? `SL ${x.sl}` : x.ritual ? "Ritual" : `CN ${x.cn ?? "—"}`} · Range ${esc(x.range || "—")} · Target ${esc(x.target || "—")} · Duration ${esc(x.duration || "—")}</p>${entryBody(x.text, x.page, x)}`)}${legacyBadge(x)}${spellLoreControl(R, s, r, x, i)}</div>${remove(x.contentId)}</div>`).join("")}</section>${cantControls(R, s, r)}`;
}
export function issuePanel(r) {
  return r.issues.length
    ? `<section class="gm-issues" aria-label="Choices to finish"><strong>${r.issues.length} ${r.issues.length === 1 ? "choice" : "choices"} to finish before export</strong><ul>${r.issues.map((x, i) => `<li>${button(esc(x.message), "issue", `data-index="${i}"`, "text-button")}</li>`).join("")}</ul></section>`
    : "";
}
export function sourceNotes(r) {
  return r.warnings.length
    ? detail(
        "source-notes",
        `Source notes <small>${r.warnings.length} · review before export</small>`,
        `<ul>${[...new Set(r.warnings)].map((w) => `<li>${esc(w)}</li>`).join("")}</ul><p class="gm-small">These notes stay in the app; the PDF contains the compact stat block.</p>`,
      )
    : "";
}
function review(s, r) {
  return `${r.profile ? `<div class="gm-review-status ${r.issues.length ? "gm-not-ready" : "gm-ready"}"><div><strong>${r.issues.length ? "Finish the highlighted choices" : "Ready for the table"}</strong><p>${r.issues.length ? "Use the issue links above to jump to the exact control." : "Your compact sheet includes the complete current stat block."}</p></div>${button("Export PDF", "pdf", `${r.issues.length ? 'disabled aria-describedby="gm-export-reason"' : ""}`, "primary")}</div>${r.issues.length ? '<p id="gm-export-reason" class="gm-small">Export is unavailable until the choices above are resolved.</p>' : ""}<div class="gm-export-options"><label class="gm-check"><input type="checkbox" data-bind="includeNotes" ${s.includeNotes ? "checked" : ""}>Include my GM notes in the PDF</label>${button("Print A4 table cards", "print-cards", r.issues.length ? 'disabled aria-describedby="gm-export-reason"' : "")}${button("Save editable draft", "save")}</div>${statBlock(r, s)}${textArea("Private GM notes", "notes", s.notes)}` : empty("Choose a starting profile first.")}`;
}
export function workspace(data, R, s, r, ui, verify, saveMessage) {
  const body = [
    () => starting(data, s, r, ui),
    () => customise(data, R, s, r, ui),
    () => equipmentMagic(R, s, r),
    () => review(s, r),
  ][s.step]();
  return `<div class="workspace gm-workspace"><aside class="rail">${creatorSwitch("gm", verify)}<div class="rail-heading"><span class="eyebrow">Game Master's workshop</span><strong>The Bestiary</strong><p>Profile books: ${s.books.length > 1 ? esc(["Core", ...data.books.filter((b) => b.id !== "core" && s.books.includes(b.id)).map((b) => b.shortTitle || b.title)].join(" + ")) : "Core · Fifth Edition"}</p></div>${select(
    "Workshop page",
    "gm-step-select",
    STEPS.map((x, i) => [i, x]),
    s.step,
    'data-bind="step" class="gm-mobile-select"',
  )}<nav class="gm-step-nav" aria-label="Workshop pages"><ol class="steps">${STEPS.map((x, i) => `<li><button data-action="step" data-step="${i}" class="${s.step === i ? "active" : ""}" ${s.step === i ? 'aria-current="step"' : ""}><span class="step-number">${String(i + 1).padStart(2, "0")}</span><span>${x}<small>${["Choose your foundation", "Optional changes", "Armour, attacks & spells", "A compact sheet"][i]}</small></span></button></li>`).join("")}</ol></nav><div class="header-actions">${button("Save NPC / creature", "save")}${button("Load draft", "load")}${button("New NPC / creature", "new")}<div data-install-slot></div></div><p class="save-status">${esc(saveMessage)}</p><p class="gm-rail-note">Independent from your player character. Career development and campaign tracking are outside this workshop.</p></aside>
  <main class="panel gm-panel"><div class="gm-page-heading"><span class="eyebrow">THE BESTIARY · ${String(s.step + 1).padStart(2, "0")} / 04</span>${chapterHeading(STEPS[s.step])}</div><div id="gm-feedback">${issuePanel(r)}${sourceNotes(r)}</div>${body}<footer class="gm-page-footer">${s.step ? button("← Previous", "step", `data-step="${s.step - 1}"`) : ""}${s.step < 3 ? button(`${STEPS[s.step + 1]} →`, "step", `data-step="${s.step + 1}"`, "primary") : ""}</footer></main>
  <aside class="sheet gm-folio" id="gm-folio" aria-label="Current stat block"><div class="sheet-title"><span class="folio-crest" aria-hidden="true">${ledgerEmblem()}</span><span class="eyebrow">The creature folio</span></div>${statBlock(r, s, { compact: true })}<div class="gm-folio-footer"><span>${r.issues.length ? `${r.issues.length} choice${r.issues.length === 1 ? "" : "s"} left` : r.profile ? "Ready to export" : "Choose a profile"}</span>${button("Review & export", "step", 'data-step="3"')}</div></aside></div><div class="mobile-workspace-bar gm-mobile-bar"><span>${r.issues.length ? `${r.issues.length} choice${r.issues.length === 1 ? "" : "s"} left` : r.profile ? "Ready for the table" : "Choose a profile"}</span>${button("Stat block", "folio")}${button("Review", "step", 'data-step="3"')}</div>`;
}
export function searchPickerEntries(entries, query) {
  const q = query.toLowerCase().trim();
  if (!q) return entries;
  return entries
    .map((entry) => {
      const name = entry.name.toLowerCase(),
        rank =
          name === q
            ? 0
            : name.startsWith(q)
              ? 1
              : name.includes(q)
                ? 2
                : `${entry.text || ""} ${entry.category || ""}`
                      .toLowerCase()
                      .includes(q)
                  ? 3
                  : -1;
      return { entry, rank };
    })
    .filter(({ rank }) => rank >= 0)
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.entry.name.localeCompare(b.entry.name, "en", { sensitivity: "base" }),
    )
    .map(({ entry }) => entry);
}
export function pickerEntries(data, R, r, kind) {
  if (kind === "trait")
    return data.traits
      .filter((x) => x.name !== "Size")
      .map((x) => ({ ...x, key: x.id }));
  if (kind === "mutation")
    return data.mutations.map((x) => ({ ...x, key: x.id }));
  if (kind === "magic")
    return magicChoices(R, r).map((x) => ({ ...x, key: x.contentId }));
  if (kind === "equipment")
    return [...R.weapons, ...R.armour, ...R.gear, ...R.market]
      .filter((x, i, a) => a.findIndex((y) => y.name === x.name) === i)
      .map((x) => ({
        ...x,
        key: x.contentId,
        category: x.kind
          ? "Weapon"
          : x.ap !== undefined
            ? "Armour"
            : x.category || "Trappings",
      }));
  if (kind === "skill")
    return R.skills.flatMap((x) =>
      x.grouped
        ? options(R, `${base(x.name)} (Any)`, "skill").map((name) => ({
            ...x,
            name,
            key: name,
            char: gmSkillCharacteristic(R, r.profile, name),
          }))
        : [
            {
              ...x,
              key: x.name,
              char: gmSkillCharacteristic(R, r.profile, x.name),
            },
          ],
    );
  return R.talents.flatMap((x) => {
    let names = options(
      R,
      x.name.includes("(") ? `${base(x.name)} (Any)` : x.name,
      "talent",
    );
    // Fixed Lore Talents printed in Careers (such as Hedgecraft) remain
    // explicit GM choices alongside the core Colour options.
    if (base(x.name) === "Arcane Magic")
      names = [
        ...new Set([
          ...names,
          ...R.careers
            .flatMap((c) => c.levels.flatMap((l) => l.talents))
            .filter(
              (name) =>
                /^Arcane Magic \([^)]+\)$/.test(name) &&
                !/Any|All| or |,/.test(name),
            ),
        ]),
      ];
    if (base(x.name) === "Chaos Magic")
      names = ["Nurgle", "Slaanesh", "Tzeentch"].map(
        (n) => `Chaos Magic (${n})`,
      );
    if (base(x.name) === "Impassioned Zeal") names = ["Impassioned Zeal ()"];
    return names.map((name) => ({
      ...x,
      name,
      key: name,
      disabled:
        x.unavailable ||
        (/^(Arcane|Chaos) Magic \(/.test(name)
          ? gmLoreIssue(R, r.profile, name.match(/\((.*?)\)/)?.[1])
          : ""),
    }));
  });
}
