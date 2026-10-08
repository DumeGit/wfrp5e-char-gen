import { esc } from "./workspace.mjs";
import { characteristicNames } from "./ui.mjs";
import { searchBookText } from "./book-search-text.mjs";
import { ruleTextHTML, speciesReferenceHTML } from "./search-presentation.mjs";

const valueText = (value) =>
  Array.isArray(value)
    ? value.map(valueText).join(", ")
    : value === null
      ? "Unresolved"
      : typeof value === "object"
        ? Object.entries(value)
            .map(([k, v]) => `${k}: ${valueText(v)}`)
            .join(" · ")
        : String(value);
function fieldsHTML(entry, fields) {
  return `<dl class="search-profile-fields">${fields
    .filter(([key]) => entry[key] !== undefined && entry[key] !== "")
    .map(
      ([key, label]) =>
        `<div><dt>${esc(label)}</dt><dd>${esc(valueText(entry[key]))}</dd></div>`,
    )
    .join("")}</dl>`;
}
export function referenceBodyHTML(row) {
  const x = { ...row.entry, text: searchBookText(row.entry).text };
  if (row.printedReference) {
    let html = ruleTextHTML(row.entry.text);
    if (row.kind === "profile")
      html = html.replace(
        /<p>(Skills|Talents|Traits|Optional Traits|Trappings|Attacks|Armour|Weapons):/g,
        "<p><strong>$1:</strong>",
      );
    return `${html}${x.notes ? `<aside class="notice"><strong>Source note</strong><p>${esc(x.notes)}</p></aside>` : ""}`;
  }
  if (
    ["rule", "condition", "psychology", "property", "trait"].includes(row.kind)
  )
    return `${fieldsHTML(x, [["parameter", "Parameter"]])}${ruleTextHTML(x.text)}`;
  if (row.kind === "species") return speciesReferenceHTML(x);
  if (row.kind === "career")
    return `<p>${esc(x.class)} · ${esc(x.species?.join(", ") || "See Career availability")}</p>${ruleTextHTML(x.text)}<p><strong>Characteristics:</strong> ${Object.entries(
      x.advanceScheme,
    )
      .filter(([, level]) => level)
      .map(([key, level]) => `${esc(characteristicNames[key])} (L${level})`)
      .join(
        ", ",
      )}</p>${x.levels.map((l, i) => `<section class="search-career-level"><h3>${i + 1}. ${esc(l.name)} <small>${esc(l.status)} ${esc(l.standing)}</small></h3><p><strong>Skills:</strong> ${esc(l.skills.join(", "))}</p><p><strong>Talents:</strong> ${esc(l.talents.join(", "))}</p><p><strong>Trappings:</strong> ${esc(l.trappings.join(", "))}</p></section>`).join("")}`;
  if (row.kind === "skill")
    return `<p><strong>${x.advanced ? "Advanced" : "Basic"} Skill</strong> · ${esc(characteristicNames[x.char])}${x.grouped ? " · Grouped" : ""}</p>${x.text ? ruleTextHTML(x.text) : '<p class="small muted">The full description is not imported. Consult the book/page above.</p>'}${x.options?.length ? `<p><strong>Printed specialisations:</strong> ${esc(x.options.join(", "))}</p>` : ""}`;
  if (row.kind === "talent")
    return `${ruleTextHTML(x.text)}${x.limit ? `<p class="small muted">Purchase limit: ${esc(Array.isArray(x.limit) ? x.limit.map((k) => characteristicNames[k] + " Bonus").join(" + ") : x.limit)}.</p>` : ""}`;
  if (row.kind === "magic") {
    const fields = [
      ["cn", "CN"],
      ["range", "Range"],
      ["target", "Target"],
      ["duration", "Duration"],
    ];
    const prefix = fields
      .filter(([k]) => x[k] != null && x[k] !== "")
      .map(([k, label]) => `${label}: ${x[k]}`)
      .join(" ");
    const text =
      prefix && x.text.startsWith(prefix)
        ? x.text.slice(prefix.length).trim()
        : x.text;
    return `${fieldsHTML(x, fields)}${ruleTextHTML(text)}${fieldsHTML(x, [
      ["lore", "Lore"],
      ["form", "Form"],
      ["category", "Type"],
      ["tier", "Tier"],
      ["xp", "XP"],
    ])}`;
  }
  if (row.kind === "profile") {
    const keys = Object.keys(x.stats);
    return `<div class="search-table-wrap"><table><thead><tr>${keys.map((k) => `<th>${esc(k)}</th>`).join("")}</tr></thead><tbody><tr>${keys.map((k) => `<td>${esc(x.stats[k] ?? "—")}</td>`).join("")}</tr></tbody></table></div>${fieldsHTML(
      x,
      [
        ["size", "Size"],
        ["toughnessBonus", "Toughness Bonus"],
      ],
    )}${Object.entries(x.sections)
      .map(
        ([heading, text]) =>
          `<p><strong>${esc(heading)}:</strong> ${esc(text)}</p>`,
      )
      .join("")}`;
  }
  if (row.kind === "equipment")
    return row.facets
      .map(
        (f) =>
          `<section class="search-equipment-profile">${fieldsHTML(f, [
            ["category", "Category"],
            ["price", "Price"],
            ["availability", "Availability"],
            ["enc", "Encumbrance"],
            ["group", "Group"],
            ["reach", "Reach"],
            ["range", "Range"],
            ["damage", "Damage"],
            ["ap", "AP"],
            ["locations", "Locations"],
            ["qualities", "Qualities"],
            ["flaws", "Flaws"],
            ["properties", "Properties"],
          ])}${ruleTextHTML(searchBookText(f).text)}</section>`,
      )
      .join("");
  return `${fieldsHTML(x, [
    ["category", "Type"],
    ["stats", "Characteristics"],
    ["adjustments", "Adjustments"],
  ])}${ruleTextHTML(x.text)}`;
}
