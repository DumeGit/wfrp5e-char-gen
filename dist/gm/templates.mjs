// Explicit reviewed supplement operations. Core templates remain additive.

export const templateRowKey = (t, kind, i) => `${t.id}:${kind}:${i}`;
export const templateSlotEnabled = (slot, profile) =>
  !slot.forProfiles || slot.forProfiles.includes(profile?.id);
export const templateGearEnabled = (slot, selectedSkills) =>
  slot.whenSkill === undefined ||
  Boolean(selectedSkills[slot.whenSkill]?.length);

export function resolveTemplate(template, profile, selectedLore) {
  if (!template?.shaman) return template;
  const lore =
    profile.category === "Beastmen" ? selectedLore || "Arcane" : "Arcane";
  return {
    ...template,
    castingLore: lore,
    traits: template.traits.map((trait) =>
      trait.name === "Spellcaster" ? { ...trait, value: lore } : trait,
    ),
    magicGroups: template.magicGroups.map((group) =>
      group.categories.includes("Arcane") && lore !== "Arcane"
        ? { ...group, categories: ["Arcane", lore] }
        : group,
    ),
  };
}
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
  if (t.eligibility === "any") return "";
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

export function templateTraits(t, original, removed = []) {
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
    // An explicitly removed grant must not overwrite a GM replacement of the
    // same Trait when the draft is recalculated.
    if (removed.includes(templateRowKey(t, "trait", i))) continue;
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
  const rows =
    slot.kind === "ammunition" ? R.market : [...R.weapons, ...R.armour];
  return rows.filter((x) => {
    if (x.source.book !== "core") return false;
    if (slot.names || slot.groups)
      return (
        slot.names?.includes(x.name) ||
        slot.groups?.some(
          (group) => x.group?.toLowerCase() === group.toLowerCase(),
        )
      );
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
  traits = [],
  selectedTalents = {},
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
    const index = t.talents.findIndex((slot) =>
      slot.options.some(
        (name) =>
          /^Arcane Magic \(/.test(name) && name !== "Arcane Magic (Necromancy)",
      ),
    );
    const slot = t.talents[index];
    const name =
      slot?.options.length === 1 ? slot.options[0] : selectedTalents[index];
    const lore = t.castingLore || name?.match(/\((.*)\)/)?.[1];
    const channel = templateSkills.find((x) => /^Channelling \(/.test(x.name));
    if (
      windByLore[lore] &&
      channel &&
      channel.name !== `Channelling (${windByLore[lore]})`
    )
      issue(
        `Channelling must match the selected ${lore} Lore: choose ${windByLore[lore]}.`,
        "#template-skill-0",
        "template.wind",
      );
  }
  for (const [i, slot] of (t.gear || []).entries()) {
    if (
      slot.whenSkill !== undefined &&
      !templateSkills.some((skill) => skill.slot === slot.whenSkill)
    )
      continue;
    if (!gear.some((x) => x.key === templateRowKey(t, "gear", i)))
      issue(
        `Choose ${slot.label} for ${t.name}.`,
        `#template-gear-${i}`,
        "template.equipment",
      );
    if (slot.forWeapon !== undefined) {
      const weapon = gear.find(
        (x) => x.key === templateRowKey(t, "gear", slot.forWeapon),
      );
      const item = gear.find((x) => x.key === templateRowKey(t, "gear", i));
      const weaponName = t.gear[slot.forWeapon].options.find(
        (x) => x.id === weapon?.id,
      )?.name;
      const ammoName = slot.options.find((x) => x.id === item?.id)?.name;
      if (
        weaponName &&
        ammoName &&
        !slot.ammunitionFor[weaponName]?.includes(ammoName)
      )
        issue(
          "Choose ammunition for the selected weapon.",
          `#template-gear-${i}`,
          "template.ammunition",
        );
    }
  }
  for (const group of t.magicGroups || []) {
    const count = spells.filter(
      (x) => !x.ritual && group.categories.includes(x.category),
    ).length;
    const minimum = group.minimum ?? group.count;
    if (count < minimum || count > group.count)
      issue(
        `${t.name}: choose ${minimum === group.count ? group.count : `${minimum}–${group.count}`} ${group.categories.join(" / ")} spells (${count} selected).`,
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
  if (t.chaosLores) {
    for (const spell of spells) {
      if (!["Tzeentch", "Slaanesh", "Nurgle"].includes(spell.category))
        continue;
      if (
        !traits.some(
          (trait) =>
            trait.name === "Mark of Chaos" && trait.value === spell.category,
        ) ||
        !talents.some(
          (talent) => talent.name === `Chaos Magic (${spell.category})`,
        )
      )
        issue(
          `${spell.category} spells require its matching Mark of Chaos and Chaos Magic Talent for this template.`,
          "#gm-magic",
          "template.chaos-lore",
          2,
        );
    }
    for (const spell of spells) {
      if (
        spell.category === "Petty" ||
        ["Tzeentch", "Slaanesh", "Nurgle"].includes(spell.category)
      )
        continue;
      if (
        spell.category !== "Arcane" &&
        !talents.some(
          (talent) =>
            talent.name === `Arcane Magic (${spell.category})` &&
            t.chaosLores.includes(spell.category),
        )
      )
        issue(
          "Choose spells from the selected Chaos Sorcerer Colour Lore or its permitted Chaos Lore.",
          "#gm-magic",
          "template.colour-lore",
          2,
        );
    }
  }
}

export function templateMagicLabel(group) {
  return `${group.minimum === undefined || group.minimum === group.count ? group.count : `Up to ${group.count}`} ${group.categories.join(" / ")}`;
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
