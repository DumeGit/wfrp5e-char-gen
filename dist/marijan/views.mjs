import { esc, button, field, select, score } from "../controls.mjs";
import { chapterHeading, ledgerEmblem } from "../design-system.mjs";
import { creatorSwitch } from "../creator-switch.mjs";
import { characteristicNames } from "../ui.mjs";
import { KEYS } from "../rules.mjs";
import { detailKey } from "../disclosures.mjs";
import { AUTO_FIELDS, SIZES } from "./model.mjs";
import { entrySource, careerLabel } from "./catalogue.mjs";

export const SECTIONS = [
  ["identity", "Identity"],
  ["characteristics", "Characteristics"],
  ["resources", "Resources"],
  ["skills", "Skills"],
  ["talents", "Talents"],
  ["magic", "Magic"],
  ["gear", "Equipment"],
  ["extras", "Extras"],
  ["notes", "Notes"],
];
export const LABELS = {
  wounds: "Wounds",
  movement: "Movement",
  capacity: "Carrying capacity",
  enc: "Listed Enc",
  head: "Head AP",
  arms: "Arms AP",
  body: "Body AP",
  legs: "Legs AP",
  shield: "Shield AP",
};
const num = (label, path, value, extra = "") =>
  field(
    label,
    `mm-${path.replaceAll(".", "-")}`,
    value,
    `data-path="${esc(path)}" step="any" ${extra}`,
    "number",
  );
const input = (label, path, value) =>
  field(
    label,
    `mm-${path.replaceAll(".", "-")}`,
    value,
    `data-path="${esc(path)}"`,
  );
const textarea = (label, path, value) =>
  `<div class="field"><label for="mm-${path}">${esc(label)}</label><textarea id="mm-${path}" data-path="${path}" rows="3">${esc(value)}</textarea></div>`;
const section = (id, title, body) => {
  const collapsible = [
    "skills",
    "talents",
    "magic",
    "gear",
    "extras",
    "notes",
  ].includes(id);
  const heading = `<h2 id="mm-heading-${id}">${title}</h2>`;
  return `<section class="mm-section" id="mm-section-${id}" aria-labelledby="mm-heading-${id}">${collapsible ? `<details class="mm-section-disclosure" data-detail-key="marijan:section:${id}" open><summary>${heading}</summary><div>${body}</div></details>` : heading + body}</section>`;
};
const optionSelect = (label, path, values, value) =>
  select(
    label,
    `mm-${path.replaceAll(".", "-")}`,
    values,
    value,
    `data-path="${path}"`,
  );
export function characteristicGrid(s, r) {
  return `<div class="mm-table-wrap"><table class="mm-characteristics"><thead><tr><th scope="col">Characteristic</th><th scope="col">Starting</th><th scope="col">Advances</th><th scope="col">Other</th><th scope="col">Total</th></tr></thead><tbody>${KEYS.map((k) => `<tr><th scope="row"><abbr title="${characteristicNames[k]}">${k}</abbr><span>${characteristicNames[k]}</span></th>${["initial", "advances", "modifier"].map((part) => `<td>${num(`${characteristicNames[k]} ${part}`, `characteristics.${k}.${part}`, s.characteristics[k][part])}</td>`).join("")}<td><output data-result="stat:${k}">${r.stats[k]}</output></td></tr>`).join("")}</tbody></table></div>`;
}
function derivedFields(s, r) {
  return `<div class="mm-derived-grid">${AUTO_FIELDS.map((k) => `<div class="mm-derived"><div class="mm-derived-heading"><label for="mm-override-${k}">${LABELS[k]}</label>${button(s.overrides[k] === null ? "Auto" : "Manual", "mode", `data-field="${k}" aria-label="${LABELS[k]}: ${s.overrides[k] === null ? "switch to manual" : "return to automatic"}" aria-pressed="${s.overrides[k] !== null}"`, "quiet mm-mode")}</div><input id="mm-override-${k}" aria-label="${LABELS[k]}" type="number" step="any" data-override="${k}" value="${r.values[k] ?? ""}" ${s.overrides[k] === null ? "readonly" : ""}><small data-auto-label="${k}">Calculated ${score(r.auto[k])}</small></div>`).join("")}</div>`;
}
export function rowHTML(catalogue, s, r, group, x) {
  const attrs = `data-key="${x.key}" data-group="${group}"`,
    label =
      group === "skills"
        ? "Advances"
        : group === "talents"
          ? "Ranks"
          : group === "gear"
            ? "Quantity"
            : "Count",
    amount = field(
      label,
      `mm-amount-${x.key}`,
      x.amount,
      `${attrs} data-entry-field="amount" aria-label="${esc(x.name)} ${label.toLowerCase()}" step="any"`,
      "number",
    ),
    remove = button(
      "×",
      "remove",
      `${attrs} aria-label="Remove ${esc(x.name)}"`,
      "quiet mm-remove",
    ),
    legacy = x.adaptation
      ? button("Legacy", "inspect", attrs, "legacy-tag")
      : "";
  let controls = amount;
  if (group === "skills") {
    const total = r.skills.find((row) => row.key === x.key)?.total;
    controls += select(
      "Char",
      `mm-char-${x.key}`,
      KEYS,
      x.char,
      `${attrs} data-entry-field="char" aria-label="${esc(x.name)} Characteristic"`,
    );
    controls += `<div class="mm-skill-total"><label for="mm-total-${x.key}">Total</label><div><input id="mm-total-${x.key}" aria-label="${esc(x.name)} total" type="number" step="any" value="${total}" ${attrs} data-entry-field="total" ${x.total === null ? "readonly" : ""}>${button(x.total === null ? "Auto" : "Manual", "skill-mode", `${attrs} aria-label="${esc(x.name)} total: ${x.total === null ? "switch to manual" : "return to automatic"}"`, "quiet mm-mode")}</div></div>`;
  }
  if (group === "gear")
    controls += select(
      `${x.name} location`,
      `mm-state-${x.key}`,
      [
        ["equipped", "Equipped"],
        ["worn", "Worn"],
        ["carried", "Carried"],
        ["stored", "Stored"],
      ],
      x.state,
      `${attrs} data-entry-field="state"`,
    );
  if (group === "extras")
    controls += field(
      `${x.name} rating or target`,
      `mm-rating-${x.key}`,
      x.rating,
      `${attrs} data-entry-field="rating" placeholder="Rating / target"`,
    );
  const profileFields =
    group === "gear"
      ? `${field("Unit Enc", `mm-enc-${x.key}`, x.enc ?? "", `${attrs} data-entry-field="enc" step="any"`, "number")}${field("AP", `mm-ap-${x.key}`, x.ap ?? "", `${attrs} data-entry-field="ap" step="any"`, "number")}${field("Damage", `mm-damage-${x.key}`, x.damage, `${attrs} data-entry-field="damage"`)}${field("Locations", `mm-locations-${x.key}`, x.locations, `${attrs} data-entry-field="locations"`)}${field("Qualities / flaws", `mm-qualities-${x.key}`, x.qualities, `${attrs} data-entry-field="qualities"`)}`
      : group === "magic"
        ? `${field("Lore / patron", `mm-lore-${x.key}`, x.lore, `${attrs} data-entry-field="lore"`)}${field("Type", `mm-category-${x.key}`, x.category, `${attrs} data-entry-field="category"`)}`
        : "";
  const magicProfile =
    group === "magic"
      ? `<div class="mm-fields">${["cn", "range", "target", "duration"].map((k) => field(k === "cn" ? "Casting Number" : k[0].toUpperCase() + k.slice(1), `mm-${k}-${x.key}`, x[k] ?? "", `${attrs} data-entry-field="${k}"`)).join("")}</div>`
      : "";
  return `<article class="mm-entry" id="mm-entry-${x.key}"><div class="mm-entry-line"><div class="mm-entry-name">${x.custom ? field("Custom name", `mm-name-${x.key}`, x.name, `${attrs} data-entry-field="name"`) : button(esc(x.name), "inspect", attrs, "mm-name-button")}<small>${esc(entrySource(catalogue, x))}${x.category ? ` · ${esc(x.category)}` : ""}</small>${legacy}</div><div class="mm-entry-controls">${controls}${remove}</div></div><details data-detail-key="${detailKey("marijan-entry", x.key)}"><summary>${x.custom ? "Edit custom entry" : "Details & overrides"}</summary><div class="mm-entry-detail">${profileFields ? `<div class="mm-fields">${profileFields}</div>` : ""}${magicProfile}<div class="field"><label for="mm-description-${x.key}">Description / personal notes</label><textarea id="mm-description-${x.key}" rows="2" ${attrs} data-entry-field="text">${esc(x.text)}</textarea></div><small>${x.custom ? "User-defined; no printed source or automatic effects." : "Profile edits apply only to this character. The book reference stays unchanged."}</small></div></details></article>`;
}
function collection(catalogue, s, r, group, title) {
  const starters = {
    skills: "Add Species Skills",
    talents: "Add Species Talents",
    gear: "Add starting equipment",
  };
  return section(
    group,
    title,
    `${starters[group] ? `<div class="mm-starter-actions">${button(starters[group], "starting-choices", `data-group="${group}"`)}<small>Random choices; existing entries kept.</small></div>` : ""}<div class="mm-add-bar"><div class="field"><label for="mm-find-${group}">Add ${title.toLowerCase()}</label><input id="mm-find-${group}" type="search" autocomplete="off" data-find="${group}" placeholder="Find by name…" aria-controls="mm-results-${group}"></div>${select("Book", `mm-book-${group}`, [["", "All books"], ...catalogue.books.filter((b) => catalogue.rows.some((x) => x.collection === group && x.source?.book === b.id)).map((b) => [b.id, b.shortTitle || b.title])], "", `data-book-filter="${group}"`)}${button("+ Custom", "custom", `data-group="${group}"`)}</div><div id="mm-results-${group}" class="mm-search-results" hidden></div><div class="mm-entries" id="mm-list-${group}">${s.entries[group].length ? s.entries[group].map((x) => rowHTML(catalogue, s, r, group, x)).join("") : `<p class="mm-empty">No ${title.toLowerCase()} added. Search above or add your own.</p>`}</div>`,
  );
}
export function workspace(catalogue, s, r, verify) {
  const careerValue = r.career?.contentId || s.career;
  return `<div class="mm-workspace"><aside class="rail mm-rail">${creatorSwitch("marijan", verify)}<div class="rail-heading"><span class="eyebrow">Marijan Mode</span><strong>Freehand character</strong><p class="mm-rail-intro">One page. Your values.</p></div><nav class="mm-section-nav" aria-label="Editor sections">${SECTIONS.map(([id, title]) => `<a href="#mm-section-${id}">${title}</a>`).join("")}</nav><div class="mm-rail-tools">${button("Undo", "undo", "disabled")}${button("Redo", "redo", "disabled")}${button("Save character", "save")}${button("Load character", "load")}${button("Copy player character", "copy-player")}${button("New character", "new")}${button("Export PDF", "export", "", "primary")}</div><div id="mm-install"></div><small id="mm-save-status" role="status"></small></aside><main class="panel mm-page">${chapterHeading("Marijan Mode")}<p class="mm-intro">Unrestricted character creation. Values and choices are yours; XP and money are never deducted.</p>
    <div class="mm-generation"><p>Start from a random Fifth Edition character, then edit freely.</p>${button("Generate character", "generate", "", "primary")}</div><div id="mm-generation-record">${generationRecord(s)}</div>
    ${section("identity", "Identity", `<div class="mm-fields">${input("Name", "name", s.name)}${optionSelect("Species", "species", Object.keys(catalogue.species), s.species)}${input("Origin / background", "origin", s.origin)}${num("Career level", "level", s.level)}</div><div class="mm-career-tools"><div class="field"><label for="mm-career-search">Find a Career</label><input id="mm-career-search" type="search" placeholder="Filter Careers by name…"></div>${select("Career", "mm-career", [["", "No Career"], ...catalogue.careers.map((c) => [c.contentId, careerLabel(catalogue, c)])], careerValue, 'data-path="career"')}${button("Species defaults", "defaults")}</div><small id="mm-career-summary">${r.career ? `${esc(r.career.class)} · ${esc(r.career.levels.find((l) => l.level === s.level)?.name || "Custom level")} · ${esc(entrySource(catalogue, r.career))}` : "A Career is a label here; it does not limit your choices."}</small><p id="mm-species-source" class="small"></p><details data-detail-key="marijan:custom-species"><summary>Custom Species or Career</summary><div class="mm-fields">${field("Species name", "mm-species-name", s.species, 'data-path="species"')}${field("Career name", "mm-career-name", s.career, 'data-path="career"')}</div><p class="small">Custom names carry no automatic defaults.</p></details>`)}
    ${section(
      "characteristics",
      "Characteristics",
      `<div class="mm-inline-tools">${button("Roll starting values", "roll", "", "secondary")}<label class="mm-check"><input type="checkbox" data-path="talentEffects" ${s.talentEffects ? "checked" : ""}> Apply Characteristic & Movement Talent bonuses</label></div>${characteristicGrid(s, r)}<details data-detail-key="marijan:calculations"><summary>How totals work</summary><p>Starting + Advances + Other, plus the printed +5 Characteristic Talents when enabled. Roll replaces Starting with your Species modifier + 2d10; Advances and Other stay intact. No XP is spent. Situational effects, Traits and mutations remain references.</p>${optionSelect(
        "Sturdy formula",
        "sturdyRule",
        [
          ["creation", "Creation: double capacity"],
          ["talent", "Talent: add Strength Bonus"],
        ],
        s.sturdyRule,
      )}</details>`,
    )}
    ${section("resources", "Resources", `<div class="mm-fields mm-resource-fields">${num("Fate", "fate", s.fate)}${num("Fortune", "fortune", s.fortune)}${num("XP spent", "xpSpent", s.xpSpent)}${num("XP unspent", "xpUnspent", s.xpUnspent)}${input("Status", "status", s.status)}${num("Standing", "standing", s.standing)}${num("Tracker boxes", "tracker", s.tracker)}${num("Sin", "sin", s.sin)}${num("Corruption", "corruption", s.corruption)}${num("Gold crowns", "coins.gc", s.coins.gc)}${num("Silver shillings", "coins.ss", s.coins.ss)}${num("Brass pennies", "coins.d", s.coins.d)}${optionSelect("Size", "size", SIZES, s.size)}${num("Base Movement", "baseMovement", s.baseMovement)}</div>${derivedFields(s, r)}<p class="small muted">Auto follows the calculated value. Manual stays at your number. Blank manual fields return to Auto. Resource values are entered directly; Luck does not silently change Fortune.</p>`)}
    ${collection(catalogue, s, r, "skills", "Skills")}${collection(catalogue, s, r, "talents", "Talents")}${collection(catalogue, s, r, "magic", "Magic & prayers")}${collection(catalogue, s, r, "gear", "Equipment")}${collection(catalogue, s, r, "extras", "Traits, mutations & runes")}
    ${section("notes", "Notes & appearance", `${textarea("Appearance", "appearance", s.appearance)}<div class="mm-fields">${input("Personal ambition", "ambition", s.ambition)}${input("Party ambition", "partyAmbition", s.partyAmbition)}</div>${textarea("Notes", "notes", s.notes)}<details data-detail-key="marijan:rolls"><summary>Recorded rolls</summary><div id="mm-rolls">${s.rolls.length ? s.rolls.map((x) => `<p class="small">${esc(x.label)}: ${x.faces.join(" + ")} = ${x.faces.reduce((a, b) => a + b, 0)}</p>`).join("") : "No rolls yet."}</div></details>`)}
    <div class="mm-page-footer">${button("Export character sheet PDF", "export", "", "primary")}${button("Download JSON backup", "backup")}</div></main><aside class="sheet mm-folio" aria-label="Character summary"><div class="mm-folio-emblem">${ledgerEmblem()}</div><h2 id="mm-folio-name">${esc(s.name || "Your character")}</h2><p id="mm-folio-identity">${esc(s.species)}</p><div class="mm-folio-stats">${KEYS.map((k) => `<div><span>${k}</span><strong data-result="stat:${k}">${r.stats[k]}</strong></div>`).join("")}</div><dl class="mm-folio-resources">${["wounds", "movement", "capacity", "enc"].map((k) => `<div><dt>${LABELS[k]}</dt><dd data-result="derived:${k}">${score(r.values[k])}</dd></div>`).join("")}<div><dt>Total XP</dt><dd data-result="xp">${r.xpTotal}</dd></div></dl><div id="mm-counts"></div><div id="mm-warnings" class="mm-warnings"></div>${button("Export PDF", "export", "", "primary")}<small>Marijan Mode · unrestricted</small></aside></div>`;
}

export function generationRecord(s) {
  if (!s.generation) return "";
  return `<details class="mm-generation-report" data-detail-key="marijan:generation"><summary>Original generation · level ${s.generation.target} · ${s.generation.purchases.reduce((n, q) => n + q.cost, 0)} XP spent</summary><p>Records the generated baseline. Later freehand edits do not rewrite these purchases.</p>${s.generation.notes.map((n) => `<p>${esc(n)}</p>`).join("")}<ol>${s.generation.purchases.map((q) => `<li>${esc(q.name)} · ${esc(q.type)}${["char", "skill"].includes(q.type) ? " +5" : ""} · ${q.cost} XP</li>`).join("")}</ol></details>`;
}
