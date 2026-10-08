import { gmCantBook } from "./cants.mjs";
import { esc, select, detail } from "./controls.mjs";
export function spellLoreControl(R, s, r, spell, index) {
  if (!gmCantBook(R) || spell.category !== "Arcane") return "";
  return select(
    `${spell.name} Lore`,
    `gm-spell-lore-${index}`,
    [["", "Choose a Lore"], ...r.magicLores],
    s.spellLores[spell.contentId] || "",
    `data-spell-lore="${esc(spell.contentId)}"`,
  );
}
export function cantControls(R, s, r) {
  if (!gmCantBook(R)) return "";
  return `<section id="gm-cants"><h2>Optional Cants</h2><label class="gm-check"><input type="checkbox" data-cants-enabled ${s.cants.enabled ? "checked" : ""}> Use Colour Lore Cants</label><p class="gm-small">Archives III p. 86: choose one free Cant at 1, 3 and 6 known spells of a Colour Lore. Requires its Arcane Magic Talent. Assign generic Arcane spells to one Lore; Petty spells and rituals do not count. Effects are references for play.</p>${
    s.cants.enabled
      ? r.cantGrants
          .map((g) => {
            const ids = s.cants.choices[g.lore] || [];
            return `<h3>${esc(g.lore)} <small>${g.spells} spell${g.spells === 1 ? "" : "s"} · ${g.count} Cant${g.count === 1 ? "" : "s"}</small></h3><div class="gm-fields">${Array.from({ length: g.count }, (_, i) => select(`${g.lore} Cant ${i + 1}`, `gm-cant-${g.lore}-${i}`, [["", "Choose a Cant"], ...g.choices.filter((x) => x.id === ids[i] || !ids.includes(x.id)).map((x) => [x.id, x.name])], ids[i] || "", `data-cant-lore="${esc(g.lore)}" data-cant-index="${i}"`)).join("")}</div>`;
          })
          .join("") +
        (!r.cantGrants.length
          ? '<p class="gm-empty">No eligible Colour Lore spells yet. Add its Arcane Magic Talent and choose spells in Magic &amp; prayers.</p>'
          : "") +
        r.cants
          .map((x) =>
            detail(
              `cant:${x.id}`,
              esc(x.name) + ` <small>${esc(x.lore)}</small>`,
              `<p>${esc(x.text)}</p><small>Archives III · p. ${x.source?.page || x.page}</small>`,
            ),
          )
          .join("")
      : ""
  }</section>`;
}
