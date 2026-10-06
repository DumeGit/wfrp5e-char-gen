import * as M from "../rules.mjs";
import { esc } from "../workspace.mjs";
import { chapterHeading } from "../design-system.mjs";
import { armourOptions, printedArmour } from "../npc-profile.mjs";
import { npcMagicChoices } from "../npc-result.mjs";
import { btn, select, field, value } from "./npc-controls.mjs";
export function createNPCEquipment(getContext, ref) {
  function gearView() {
    const { R, s, d, ui } = getContext(),
      items = [...R.weapons, ...R.armour, ...R.gear, ...R.market]
        .filter((x, i, a) => a.findIndex((y) => y.name === x.name) === i)
        .filter(
          (x) =>
            !ui.gearFilter ||
            x.name.toLowerCase().includes(ui.gearFilter.toLowerCase()),
        )
        .sort((a, b) => a.name.localeCompare(b.name));
    return `${chapterHeading("Equipment")}<h2>Printed weapons & armour</h2>${d.profile.attacks.map((a, i) => `<label class="npc-checkbox"><input type="checkbox" data-attack-toggle="printed-attack-${i}" data-optional="${a.optional}" ${a.optional ? (s.optionalAttacks.includes(`printed-attack-${i}`) ? "checked" : "") : !s.removedAttacks.includes(`printed-attack-${i}`) ? "checked" : ""}>${esc(a.name)} ${a.optional ? "(optional)" : ""}</label>`).join("")}${printedArmour(
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
      )}<p class="small">${esc(d.profile.sections.Armour || "No printed armour")}</p><details data-detail-key="npc:attack-overrides"><summary>GM attack values</summary><p class="small muted">These are explicit final values, replacing the calculation. Blank restores the calculated attack.</p>${d.attacks.map((a) => `<div class="npc-toolbar"><strong>${esc(a.name)}</strong>${field("Skill", `<input id="npc-attack-skill-${esc(a.id)}" type="number" min="0" data-attack-id="${esc(a.id)}" data-attack-field="skill" value="${s.attackOverrides[a.id]?.skill ?? ""}" placeholder="${value(a.skill)}">`)}${field("Damage", `<input id="npc-attack-damage-${esc(a.id)}" type="number" min="0" data-attack-id="${esc(a.id)}" data-attack-field="damage" value="${s.attackOverrides[a.id]?.damage ?? ""}" placeholder="${value(a.damage)}">`)}</div>`).join("")}</details><h2>Additional equipment</h2>${field("Find equipment", `<input id="npc-gear-search" type="search" data-ui="gearFilter" value="${esc(ui.gearFilter)}" placeholder="Search equipment by name…">`)}<p class="small muted">Assign equipment as the GM. This does not make a purchase or invent a purse. Printed weapons and armour remain included separately.</p><p>${esc(d.profile.sections.Trappings || "")}</p>${d.gear.map((x) => `<div class="npc-inline"><strong>${esc(x.name)}</strong><span>×${x.quantity}</span>${btn("remove-gear", "Remove", `data-id="${esc(x.contentId)}"`)}</div>`).join("")}<div class="npc-toolbar">${field(
      "Equipment",
      select(
        "npc-gear",
        [["", "Choose…"], ...items.map((x) => [x.contentId, x.name])],
        ui.gear,
        'data-ui="gear"',
      ),
    )}${field("Quantity", `<input id="npc-gear-quantity" type="number" min="1" value="${ui.quantity}" data-ui="quantity">`)}${btn("add-gear", "Assign equipment", ui.gear ? "" : "disabled", "primary")}</div>`;
  }
  function magicView() {
    const { R, s, d, ui } = getContext(),
      available = npcMagicChoices(R, d),
      magic = available.filter(
        (x) =>
          !ui.magicFilter ||
          `${x.entry.name} ${x.lore}`
            .toLowerCase()
            .includes(ui.magicFilter.toLowerCase()),
      );
    return `${chapterHeading("Magic")}<p class="small">${d.template?.magic ? `${d.template.name}: up to ${d.template.magic.petty} Petty spells and ${d.template.magic.lore} Lore spells (p. 354).` : "Magic requires a matching Talent or Creature Trait. GM selections and printed spells are recorded without live casting or resource tracking."}</p>${d.traits.some((x) => x.name === "Spellcaster" && !x.printed) && !d.template?.magic ? field("Channelling for Spellcaster", select("npc-trait-wind", [["", "Choose…"], ...M.options(R, "Channelling (Any)", "skill")], s.templateSkills["trait-wind"]?.[0] || "", 'data-template-skill="trait-wind" data-slot="0"')) : ""}${!available.length ? `<div class="notice small">This NPC has no magic access yet. ${btn("step", "Choose a casting Trait", 'data-step="2"', "text-button")} · ${btn("step", "Choose a magic Talent", 'data-step="3" data-tab="talents"', "text-button")}</div>` : ""}<div id="npc-magic">${d.magic.map((x) => `<div class="npc-item"><details data-detail-key="npc:magic:${esc(x.contentId)}:${esc(x.lore)}"><summary>${esc(x.name)} <small>${esc(x.lore)}</small></summary><p>${esc(x.text)}</p>${ref(x)}</details>${x.origin === "Blessings" ? "" : btn("remove-spell", "Remove", `data-id="${esc(x.contentId)}" data-lore="${esc(x.lore)}"`)}</div>`).join("")}</div>${field("Find spells & prayers", `<input id="npc-magic-search" type="search" data-ui="magicFilter" value="${esc(ui.magicFilter)}" placeholder="Search available magic…">`)}<p class="small muted">${magic.length} available profiles. GM selections cost no XP; paid learning belongs in Career development.</p><div class="npc-toolbar">${field("Spell", select("npc-spell", [["", "Choose…"], ...magic.map((x) => [`${x.entry.contentId}|${x.lore}`, `${x.entry.name} (${x.lore})`])], ui.spell, 'data-ui="spell"'))}${btn("add-spell", "Select GM spell", ui.spell ? "" : "disabled", "primary")}</div>${ui.spell ? `<details data-detail-key="npc:spell-preview:${esc(ui.spell)}"><summary>Selected spell · rule description</summary><p class="small">${esc(R.spells.find((x) => x.contentId === ui.spell.split("|")[0])?.text || "")}</p></details>` : ""}`;
  }
  return { gearView, magicView };
}
