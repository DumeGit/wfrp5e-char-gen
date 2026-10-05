import { equipment, gearSlots, resolvedGearName } from "./equipment.mjs";
import { derive } from "./rules.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const fmt = (n) =>
  Number.isFinite(n) ? Number(n.toFixed(3)).toLocaleString() : "?";
export function penaltySummary(R, s) {
  const e = equipment(R, s),
    d = derive(R, s),
    p = e.penalties,
    modifiers = [
      ...(p.stealth ? [`Stealth ${p.stealth} SL`] : []),
      ...(p.perception ? [`Perception ${p.perception} SL`] : []),
      ...Object.entries(
        d.talents.some((t) =>
          /^(Arcane Magic|Chaos Magic|Petty Magic|Witch!)/.test(t),
        )
          ? p.casting
          : {},
      )
        .filter(([, v]) => v)
        .map(([l, v]) => `Casting / Channelling ${v} SL · ${l}`),
    ];
  return `<section class="load-summary" aria-label="Starting equipment effects"><h3>Equipment totals</h3>
<div class="load-totals"><div><span>${p.complete ? "Carried Enc" : "Known Enc subtotal"}</span><strong>${fmt(e.total)} / ${d.capacity}</strong></div>
<div><span>Movement with load</span><strong>${p.complete ? (p.immobile ? "Cannot move" : p.movement) : "Unresolved"}</strong></div>
<div><span>Agility with load</span><strong>${p.complete ? p.agility : "Unresolved"}</strong></div>
</div>
<p class="small muted">Armour and carrying bags are worn, weapons equipped, and other belongings packed automatically. Overflow is carried separately. Coin weight is ignored.</p>${p.complete && p.band ? `<p class="packing-warning">${p.immobile ? "Unable to move under this load" : `Overburdened · +${p.travelFatigue} Travel Fatigue after a day’s travel; Endurance Tests to resist fatigue have Disadvantage`} (p. 299).</p>` : ""}${modifiers.length ? `<div class="equipment-modifiers">${modifiers.map((x) => `<span>${esc(x)}</span>`).join("")}</div>` : ""}${e.warnings.map((w) => `<p class="packing-warning">${esc(w)}</p>`).join("")}${e.unknown.length ? `<p class="packing-warning">No published weight for: ${esc(e.unknown.join("; "))}. The export leaves total Enc blank instead of assuming zero.</p>` : ""}</section>`;
}
export function acquisitionChoices(R, s) {
  return gearSlots(R, s).map((x) => [
    x.key,
    `${resolvedGearName(s, x, R)} · ${x.origin}`,
  ]);
}
