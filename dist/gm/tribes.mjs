// Source-specific operations from Tribes and Tribulations pp. 11–17, 88–95.
const BOOK = "tribes-tribulations";
export const isTribesTemplate = (t) => t?.source?.book === BOOK;
export const trollModifiers = (data) =>
  data.templates.filter(
    (t) => isTribesTemplate(t) && t.trollRole === "modifier",
  );

export function composeTroll(template, data, selected = []) {
  if (!isTribesTemplate(template) || template.trollRole !== "type")
    return template;
  const parts = [
    template,
    ...trollModifiers(data).filter((t) => selected.includes(t.id)),
  ];
  const merged = {
    ...template,
    components: parts,
    name: parts.map((t) => t.name).join(" · "),
  };
  merged.adjustments = {};
  for (const part of parts)
    for (const [key, value] of Object.entries(part.adjustments))
      merged.adjustments[key] = (merged.adjustments[key] || 0) + value;
  for (const field of [
    "skills",
    "talents",
    "traits",
    "optionalTraits",
    "gear",
    "notes",
    "fixedSpells",
    "removeTraits",
  ])
    merged[field] = parts.flatMap((t) => t[field] || []);
  merged.adaptation = parts
    .map((t) => t.adaptation)
    .filter(Boolean)
    .join(" ");
  if (selected.some((id) => id.endsWith(":river-troll-hag")))
    merged.castingLore = "Death";
  return merged;
}

export function warbandLoreChoices(profile) {
  if (profile?.species === "Ogre") return ["The Great Maw", "Fire"];
  if (profile?.id?.endsWith(":basic-hobgoblin"))
    return ["Little Waaagh!", "Big Waaagh!"];
  if (/:(?:basic-)?(?:savage-)?orc$/.test(profile?.id || ""))
    return ["Big Waaagh!"];
  if (/:(?:basic-)?(?:forest-|night-)?goblin$/.test(profile?.id || ""))
    return ["Little Waaagh!"];
  return [];
}

export function resolveWarband(template, profile, selectedLore) {
  if (!template?.warbandShaman) return template;
  const choices = warbandLoreChoices(profile);
  const both =
    profile?.id?.endsWith(":basic-hobgoblin") &&
    template.name === "Shaman Lord" &&
    selectedLore === "Both";
  const lore =
    choices.length === 1
      ? choices[0]
      : choices.includes(selectedLore)
        ? selectedLore
        : both
          ? "Little Waaagh!"
          : "";
  const lores = both ? choices : lore ? [lore] : [];
  return {
    ...template,
    castingLore: lore,
    loreChoices: choices,
    bothLores: both,
    talents: [
      ...template.talents,
      ...lores.map((name) => ({
        options: [`Arcane Magic (${name})`],
        ranks: 1,
      })),
    ],
    skills: template.skills.map((slot, i) =>
      i === 0 && lore
        ? {
            ...slot,
            options: [`Channelling (${lore === "Fire" ? "Aqshy" : "Magick"})`],
          }
        : slot,
    ),
    magicGroups: template.magicGroups.map((g) =>
      g.categories.includes("Petty") ? g : { ...g, categories: lores },
    ),
  };
}

export function tribesIssues(t, p, s, result, add) {
  if (p.id.endsWith(":basic-black-orc") && result.attacks.some((a) => a.ranged))
    add(
      "Black Orcs do not use missile weapons (p. 11). Remove the ranged attack or weapon.",
      2,
      "#gm-equipment",
      "template.black-orc-missiles",
      p.source,
    );
  if (
    p.id.endsWith(":basic-savage-orc") &&
    result.armour.some((a) => a.origin !== "Printed" && !a.shield)
  )
    add(
      "Savage Orcs normally wear only a Shield, retaining enchanted warpaint and Ward 10 (p. 17).",
      2,
      "#gm-equipment",
      "equipment.savage-armour",
      p.source,
    );
  if (
    p.id.endsWith(":basic-snotling") &&
    result.gear.some(
      (g) =>
        (g.entry.kind &&
          (g.entry.group !== "Throwing" ||
            !["Throwing Knife", "Rock", "Javelin"].includes(g.entry.name))) ||
        g.entry.locations,
    )
  )
    add(
      "Snotlings benefit only from throwing weapons such as knives, rocks and Javelins (p. 13). Remove unsuitable weapons or armour.",
      2,
      "#gm-equipment",
      "equipment.snotling",
      p.source,
    );
  if (!isTribesTemplate(t)) return;
  if (t.warbandShaman && !t.castingLore)
    add(
      "Choose the Shaman’s suitable magical Lore.",
      1,
      "#template-lore",
      "template.lore",
      t.source,
    );
  if (
    t.bothLores &&
    Math.min(
      ...["Little Waaagh!", "Big Waaagh!"].map(
        (lore) => result.spells.filter((x) => x.category === lore).length,
      ),
    ) > 2
  )
    add(
      "A Hobgoblin Shaman Lord can know both Waaagh! Lores, but one must contain no more than two spells (p. 95).",
      2,
      "#gm-magic",
      "template.hobgoblin-spells",
      t.source,
    );
  for (const part of t.components || [t])
    if (part.requiresTemplate && part.requiresTemplate !== t.id)
      add(
        "River Troll Hag requires the River Troll type.",
        1,
        "#gm-troll-modifiers",
        "template.hag-type",
        part.source,
      );
  if (
    t.physicalMutations &&
    result.mutations.filter((x) => x.category === "Physical").length <
      t.physicalMutations
  )
    add(
      "Chaos Troll: roll twice on the Physical Corruption table (p. 88).",
      1,
      "#gm-mutations",
      "template.chaos-mutations",
      t.source,
    );
}

export function resolveWarbandEquipment(template, profile, R) {
  if (!template?.warband || !R) return template;
  const savage = profile.id.endsWith(":basic-savage-orc");
  const ogre = profile.species === "Ogre";
  const snotling = profile.id.endsWith(":basic-snotling");
  const skirmisher = template.name === "Skirmisher";
  return {
    ...template,
    ...(ogre && template.warbandShaman
      ? {
          adjustments: {
            ...template.adjustments,
            T: template.adjustments.Int || 0,
            Int: template.adjustments.T || 0,
          },
        }
      : {}),
    skills: template.skills.map((slot, i) =>
      (ogre || snotling) && skirmisher && i === 2
        ? { ...slot, options: ["Ranged (Throwing)"] }
        : slot,
    ),
    gear: template.gear.map((slot, i) => {
      if (snotling) {
        if (!skirmisher || i !== 1) return { ...slot, disabled: true };
        return {
          ...slot,
          label: "Snotling throwing weapon",
          options: slot.options.filter((x) =>
            ["Throwing Knife", "Rock", "Javelin"].includes(x.name),
          ),
        };
      }
      if (savage && slot.kind === "armour" && !slot.names?.includes("Shield"))
        return { ...slot, disabled: true };
      if (ogre && slot.names?.includes("Shield")) {
        const item = R.armour.find(
          (x) => x.contentId === "archives-ii:armour:ironfist-shield",
        );
        return {
          ...slot,
          label: "Ironfist",
          names: ["Ironfist"],
          options: [{ id: item.contentId, name: item.name }],
        };
      }
      if (ogre && skirmisher && i === 1) {
        const item = R.weapons.find(
          (x) => x.source.book === "core" && x.name === "Javelin",
        );
        return {
          ...slot,
          label: "Three Javelins (Ogre Hunter, p. 73)",
          choose: false,
          quantity: 3,
          options: [{ id: item.contentId, name: item.name, group: item.group }],
        };
      }
      return slot;
    }),
  };
}

export function tribesEligibility(t, p) {
  if (!isTribesTemplate(t)) return "";
  if (t.trollRole === "modifier")
    return "Choose a Troll type first, then add this modifier in its choices (pp. 88–89).";
  if (t.trollRole)
    return p?.id === "core:creatures:troll" ||
      p?.id === `${BOOK}:creatures:basic-common-troll`
      ? ""
      : "Choose a Common Troll foundation for a Troll template (pp. 88–89).";
  if (
    p?.id === `${BOOK}:creatures:basic-black-orc` &&
    !["Soldier", "Elite", "Chief", "Warlord"].includes(t.name)
  )
    return "Black Orcs can use Soldier, Elite, Chief or Warlord; no missile weapons (p. 11).";
  if (
    p?.id === `${BOOK}:creatures:basic-snotling` &&
    !["Soldier", "Skirmisher"].includes(t.name)
  )
    return "Snotlings can use only Soldier or Skirmisher (p. 13).";
  if (t.warband && /troll/.test(p?.id || ""))
    return "Trolls use their own type and character templates (p. 88).";
  if (t.warbandShaman && !warbandLoreChoices(p).length)
    return "This Shaman needs a Goblin, Orc, Hobgoblin or Ogre foundation with a printed suitable Lore (pp. 73, 95).";
  return "";
}
