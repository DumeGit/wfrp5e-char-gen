import { KEYS } from "../rules.mjs";
import { esc, score, detail, empty, legacyBadge } from "./controls.mjs";
import { sourceLabel } from "./books.mjs";
import { rowName } from "./model.mjs";

export function statBlock(r, s, { compact = false, showSource = true } = {}) {
  if (!r.profile)
    return `<div class="gm-stat-empty"><span class="eyebrow">Your stat block</span><h2>A place in the Old World</h2><p>Choose a starting profile to see its Characteristics, attacks and abilities here.</p></div>`;
  const section = (key, name, body) =>
    compact
      ? detail(`folio:${key}`, name, body, key === "attacks")
      : `<section class="gm-stat-section"><h3>${name}</h3>${body}</section>`;
  return `<article class="gm-stat-block ${compact ? "gm-stat-compact" : ""}"><header><span class="eyebrow">${esc(r.profile.category)}</span><h2>${esc(r.name)}</h2><p>${esc([r.profile.name, r.template?.name, r.size].filter(Boolean).join(" · "))}</p>${s.description ? `<p>${esc(s.description)}</p>` : ""}${showSource ? `<p class="gm-small">${esc(sourceLabel(r.profile))} ${legacyBadge(r.profile)}</p>` : ""}</header>
  <div class="gm-stat-grid">${["M", ...KEYS].map((k) => `<div><span>${k}</span><strong>${score(r.stats[k])}</strong></div>`).join("")}</div>
  <div class="gm-derived"><div><span>Wounds</span><strong>${score(r.wounds)}</strong></div><div><span>TB</span><strong>${score(r.tb)}</strong></div><div><span>Size${r.swarm ? " (ignored)" : ""}</span><strong>${esc(r.size)}</strong></div></div>
  ${section("attacks", "Attacks", r.attacks.length ? `<div class="gm-stat-attacks">${r.attacks.map((a) => `<div><strong>${esc(a.name)}</strong><span>${score(a.skill)} / ${a.damage === null ? "—" : "+" + a.damage}</span>${a.text ? `<small>${esc(a.text)}</small>` : ""}</div>`).join("")}</div>` : empty("No attacks listed."))}
  ${section(
    "defence",
    "Defence",
    `<p class="gm-ap-line">${Object.entries(r.ap)
      .map(([k, v]) => `${k} <b>${v}</b>`)
      .join(
        " · ",
      )}${r.shield ? `<br>Shield +${r.shield} AP when applicable` : ""}</p>${r.armour.length ? `<p class="gm-small">${r.armour.map((a) => esc(a.name)).join(", ")}</p>` : ""}`,
  )}
  ${r.skills.length ? section("skills", `Skills <small>${r.skills.length}</small>`, `<div class="gm-mini-list">${r.skills.map((x) => `<div><span>${esc(x.name)}</span><b>${x.total}</b></div>`).join("")}</div>`) : ""}
  ${r.talents.length ? section("talents", `Talents <small>${r.talents.length}</small>`, `<p>${r.talents.map((t) => `${esc(t.name)}${t.ranks > 1 ? ` ×${t.ranks}` : ""} ${legacyBadge(t)}`).join(", ")}</p>`) : ""}
  ${r.traits.length ? section("traits", `Traits <small>${r.traits.length}</small>`, r.traits.map((t) => `<p><strong>${esc(rowName(t))}:</strong> ${esc(t.description)}</p>`).join("")) : ""}
  ${r.spells.length ? section("magic", `Magic <small>${r.spells.length}</small>`, `<p>${r.spells.map((x) => esc(x.name)).join(", ")}</p>`) : ""}
  ${r.gear.length || (r.trappings ?? r.profile.sections.Trappings) ? section("gear", "Trappings", `${(r.trappings ?? r.profile.sections.Trappings) ? `<p>${esc(r.trappings ?? r.profile.sections.Trappings)}</p>` : ""}<div class="gm-mini-list">${r.gear.map((g) => `<div><span>${esc(g.entry.name)} ${legacyBadge(g.entry)}</span><b>×${g.quantity}</b></div>`).join("")}</div>`) : ""}
  ${r.mutations.length ? section("mutations", "Corruption", `<p>${r.mutations.map((x) => esc(x.name)).join(", ")}</p>`) : ""}
  ${!compact && s.includeNotes && s.notes ? `<section class="gm-stat-section"><h3>GM notes</h3><p class="gm-prewrap">${esc(s.notes)}</p></section>` : ""}
  </article>`;
}
