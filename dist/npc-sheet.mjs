import { NPC_KEYS } from "./bestiary-content.mjs";
import { npcSourceLabel } from "./npc-books.mjs";
import { esc } from "./workspace.mjs";
const score = (x) => (x === null || x === undefined ? "—" : String(x));
// A play-facing sheet: no validation messages, provenance commentary or edit history.
export function npcSheet(R, s, d) {
  const sections = [
    ["Skills", d.skills.map((x) => `${x.name} ${score(x.total)}`).join(", ")],
    [
      "Talents",
      d.talents
        .map((x) => `${x.name}${x.ranks > 1 ? ` ×${x.ranks}` : ""}`)
        .join(", "),
    ],
    [
      "Traits",
      d.traits
        .map((x) => `${x.name}${x.value ? ` (${x.value})` : ""}`)
        .join(", "),
    ],
    [
      "Equipment",
      [
        d.profile.sections.Trappings,
        ...d.gear.map((x) => `${x.name} ×${x.quantity}`),
      ]
        .filter(Boolean)
        .join("; "),
    ],
    [
      "Magic",
      d.magic
        .map(
          (x) =>
            `${x.name} (${x.lore}${x.cn !== undefined ? `, CN ${x.cn}` : ""})`,
        )
        .join(", "),
    ],
    [
      "Mutations",
      d.mutations
        .map((x) => `${x.name}${x.location ? ` (${x.location})` : ""}`)
        .join(", "),
    ],
    ["GM notes", s.notes.trim()],
  ].filter(([, text]) => text);
  return {
    name: d.name,
    subtitle: `${d.profile.name} · ${d.size}${d.template ? ` · ${d.template.name}` : ""}`,
    source: npcSourceLabel(R, d.profile),
    scores: NPC_KEYS.map((key) => ({ key, value: score(d.stats[key]) })),
    derived: `SB ${score(d.sb)} · TB ${score(d.tb)} · Walk ${score(d.walk)} · Run ${score(d.run)} · Initiative ${score(d.combatInitiative)}`,
    protection:
      Object.entries(d.protection)
        .filter(([, n]) => n)
        .map(([k, n]) => `${k} ${n} AP`)
        .join(" · ") || "No armour",
    attacks: d.attacks.map((x) => ({
      name: x.name,
      test: score(x.skill),
      damage: x.damage === null ? "—" : `+${x.damage}`,
      detail: x.text,
    })),
    anatomy: s.anatomy !== "Standard" ? `${d.anatomy}: ${d.hitLocations}` : "",
    sections,
  };
}
export function npcSheetHTML(R, s, d) {
  const sheet = npcSheet(R, s, d);
  return `<article class="npc-sheet-preview" aria-label="Compact stat sheet">
    <header><span class="eyebrow">NPC & monster · Fifth Edition</span><h2>${esc(sheet.name)}</h2><p>${esc(sheet.subtitle)}</p><small>${esc(sheet.source)}</small></header>
    <div class="npc-sheet-scores">${sheet.scores.map((x) => `<div><span>${esc(x.key)}</span><strong>${esc(x.value)}</strong></div>`).join("")}</div>
    <p class="npc-sheet-derived">${esc(sheet.derived)}</p>
    ${sheet.attacks.length ? `<section><h3>Attacks</h3><div class="npc-attack-head"><span>Weapon / attack</span><span>Test</span><span>Damage</span></div>${sheet.attacks.map((x) => `<div class="npc-sheet-attack"><strong>${esc(x.name)}</strong><span>${esc(x.test)}</span><span>${esc(x.damage)}</span><small>${esc(x.detail)}</small></div>`).join("")}</section>` : ""}
    <section><h3>Protection</h3><p>${esc(sheet.protection)}</p>${sheet.anatomy ? `<p class="small">${esc(sheet.anatomy)}</p>` : ""}</section>
    ${sheet.sections.map(([name, text]) => `<section><h3>${esc(name)}</h3><p>${esc(text)}</p></section>`).join("")}
  </article>`;
}
