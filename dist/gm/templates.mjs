// Explicit reviewed supplement operations. Core templates remain additive.

export const templateRowKey = (t, kind, i) => `${t.id}:${kind}:${i}`;
const windByLore = {
  Beasts: "Ghur",
  Death: "Shyish",
  Fire: "Aqshy",
  Heavens: "Azyr",
  Life: "Ghyran",
  Light: "Hysh",
  Metal: "Chamon",
  Shadows: "Ulgu",
};

export function templateEligibility(t, p) {
  if (!t?.eligibility) return "";
  if (t.eligibility === "zombie")
    return p?.id === "core:creatures:zombie"
      ? ""
      : "This template needs the core Zombie foundation.";
  if (t.eligibility === "undead")
    return ["core:creatures:skeleton", "core:creatures:zombie"].includes(p?.id)
      ? ""
      : "This template needs a core Skeleton or Zombie foundation (Night Parade p. 9).";
  const mount = [...(p?.traits || []), ...(p?.optionalTraits || [])].some(
    (t) =>
      t.name === "Trained" &&
      t.value
        .split(",")
        .map((x) => x.trim())
        .includes("Mount"),
  );
  return mount && ["Tiny", "Small", "Average", "Large"].includes(p?.size)
    ? ""
    : "Choose a creature with printed or optional Trained (Mount), of Large Size or smaller (Night Parade p. 10).";
}

export function templateTraits(t, original) {
  if (!t) return original;
  let rows = original
    .filter((x) => !(t.removeTraits || []).includes(x.name))
    .map((x) => ({ ...x }));
  for (const name of t.halveTraits || [])
    rows = rows.map((x) =>
      x.name === name
        ? { ...x, value: String(Math.floor(Number(x.value) / 2)) }
        : x,
    );
  for (const [i, trait] of (t.traits || []).entries()) {
    const previous = rows.findIndex((x) => x.name === trait.name);
    // Replacing a printed rating does not apply a permanent Trait benefit twice.
    if (previous >= 0) rows[previous] = { ...rows[previous], ...trait };
    else
      rows.push({
        ...trait,
        key: templateRowKey(t, "trait", i),
        origin: "Template",
        source: t.source,
      });
  }
  return rows;
}

export function templateStats(t, stats) {
  if (!t) return;
  for (const key of t.restoreStats || [])
    if (stats[key] === null) stats[key] = 0;
  Object.assign(stats, t.setStats || {});
  for (const key of t.halveStats || [])
    if (stats[key] !== null) stats[key] = Math.floor(stats[key] / 2);
}

export function templateEquipment(R, slot) {
  const rows = [...R.weapons, ...R.armour];
  return rows.filter((x) => {
    if (x.source.book !== "core") return false;
    if (slot.names) return slot.names.includes(x.name);
    if (slot.quick) return x.quick;
    if (slot.group) return x.group?.toLowerCase() === slot.group.toLowerCase();
    return (
      slot.kind === "weapon-or-shield" &&
      (x.name === "Shield" || x.group?.toLowerCase() === "two-handed")
    );
  });
}

export function templateIssues(
  t,
  p,
  stats,
  talents,
  templateSkills,
  spells,
  gear,
  add,
) {
  if (!t) return;
  const issue = (message, target, code, step = 1) =>
    add(message, step, target, code, t.source);
  const eligibility = templateEligibility(t, p);
  if (eligibility)
    issue(
      eligibility,
      '[data-action="template-picker"]',
      "template.foundation",
    );
  if (t.matchWind) {
    const lore = talents
      .find(
        (x) =>
          x.origin === "Template" &&
          /^Arcane Magic \(/.test(x.name) &&
          x.name !== "Arcane Magic (Necromancy)",
      )
      ?.name.match(/\((.*)\)/)?.[1];
    const channel = templateSkills.find((x) => /^Channelling \(/.test(x.name));
    if (lore && channel && channel.name !== `Channelling (${windByLore[lore]})`)
      issue(
        `Channelling must match the selected ${lore} Lore: choose ${windByLore[lore]}.`,
        "#template-skill-0",
        "template.wind",
      );
  }
  for (const [i, slot] of (t.gear || []).entries()) {
    if (!gear.some((x) => x.key === templateRowKey(t, "gear", i)))
      issue(
        `Choose ${slot.label} for ${t.name}.`,
        `#template-gear-${i}`,
        "template.equipment",
      );
  }
  for (const group of t.magicGroups || []) {
    const count = spells.filter(
      (x) => !x.ritual && group.categories.includes(x.category),
    ).length;
    if (count !== group.count)
      issue(
        `${t.name}: choose ${group.count} ${group.categories.join(" / ")} spells (${count} selected).`,
        "#gm-magic",
        "template.spells",
        2,
      );
  }
  if (
    t.magicGroups &&
    spells.some(
      (x) =>
        !t.magicGroups.some((g) => g.categories.includes(x.category)) ||
        x.ritual,
    )
  )
    issue(
      "The selected magic falls outside this template's printed spell lists.",
      "#gm-magic",
      "template.spell-list",
      2,
    );
}

export function templateSummary(t) {
  return [
    ...Object.entries(t.adjustments).map(
      ([k, v]) => `${k} ${v >= 0 ? "+" : ""}${v}`,
    ),
    ...Object.entries(t.setStats || {}).map(([k, v]) => `${k} = ${v}`),
    ...(t.halveStats || []).map((k) => `${k} ÷ 2 (round down)`),
  ].join(" · ");
}

// These are printed abilities, not new live-play systems. A brazier replaces
// the casting benefit; it never removes the Cart's own Unstable Trait.
export function supplementAbilityText(traits) {
  const brazier = traits.some((x) => x.name === "Balefire Brazier");
  return traits.map((x) =>
    x.name === "Vigor Mortis" && brazier
      ? {
          ...x,
          text: "Any Undead within 8 of the Corpse Cart are no longer subject to Unstable; the Cart itself remains subject to it. This ends when the Cart is destroyed. Balefire Brazier replaces its Necromancy casting benefit.",
        }
      : x,
  );
}
