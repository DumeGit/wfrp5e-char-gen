// Derived export presentation only; ability wording comes from the shared result.
import { abilityName } from "./ability-presentation.mjs";
import { lootLines } from "./loot.mjs";
export const talentLabel = (talent) => abilityName("talent", talent);

// Printed weapon attacks are belongings too. Use only explicitly physical names
// from the supplied profiles; body parts and Trait attacks are not inventory.
const printedWeapon =
  /^(?:Hand Weapon|Dagger|Knife|Knuckledusters|Scythe|Hellblade|Halberd|Weapon|Choppa|Stone Axe|Spear|Sword|Blowpipe|Pick|Shortbow|Rocks|Sharp rocks|Weapon \(Stone Axe\)|(?:Bow|Shortbow|Longbow|Crossbow|Sling) and (?:Elf )?(?:Arrows|Bolts|Bullets))$/;
export function gearLines(r) {
  const gear = r.gear || [];
  const keys = new Set(gear.map((g) => g.key));
  const names = new Set(gear.filter((g) => !g.custom).map((g) => g.entry.name));
  return [
    r.trappings ?? r.profile.sections.Trappings,
    ...gear.map((g) => `${g.quantity} × ${g.entry.name}`),
    ...lootLines(r.loot),
    ...(r.armour || [])
      .filter(
        (a) =>
          !keys.has(a.key) &&
          !names.has(a.name) &&
          !/Hide|Scales|Bark|Natural armour|protection/i.test(a.name),
      )
      .map((a) => a.name),
    ...(r.attacks || [])
      .filter(
        (a) =>
          a.origin === "Printed" &&
          printedWeapon.test(a.name) &&
          !keys.has(a.key) &&
          !names.has(a.name),
      )
      .map((a) => a.name),
  ].filter(Boolean);
}

export function soakLines(r) {
  const locations = Object.entries(r.ap).map(
    ([location, ap]) =>
      `${location} ${r.tb + ap}${r.shield ? `/${r.tb + ap + r.shield}` : ""}`,
  );
  return [locations.join(" · ")];
}
