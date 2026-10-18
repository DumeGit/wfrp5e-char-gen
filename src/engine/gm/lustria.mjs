export const LORE_WINDS = {
  Beasts: "Ghur",
  Death: "Shyish",
  Fire: "Aqshy",
  Heavens: "Azyr",
  Life: "Ghyran",
  Light: "Hysh",
  Metal: "Chamon",
  Shadows: "Ulgu",
};
export const sacredMarks = (data, profile) =>
  data.templates.filter(
    (t) => t.lustriaRole === "mark" && t.profileIds.includes(profile?.id),
  );
export function composeLustria(
  template,
  profile,
  data,
  selected = [],
  lore = "",
) {
  const marks = sacredMarks(data, profile).filter((t) =>
    selected.includes(t.id),
  );
  if (template?.lustriaPriest)
    template = {
      ...template,
      traits: [
        ...template.traits,
        {
          name: "Spellcaster",
          value: ["Beasts", "Heavens"].includes(lore) ? lore : "",
        },
      ],
    };
  if (!marks.length) return template;
  const parts = [...(template ? [template] : []), ...marks];
  const merged = {
    ...(template || marks[0]),
    id: template?.id || "lustria:marks",
    name: parts.map((t) => t.name).join(" · "),
    components: parts,
    adjustments: {},
    naturalArmour: parts.reduce((n, t) => n + (t.naturalArmour || 0), 0),
  };
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
  ])
    merged[field] = parts.flatMap((t) =>
      (t[field] || []).map((x) =>
        typeof x === "object" ? { ...x, source: x.source || t.source } : x,
      ),
    );
  merged.adaptation = parts
    .map((t) => t.adaptation)
    .filter(Boolean)
    .join(" ");
  return merged;
}
export function slannTalents(profile, lores = []) {
  return profile?.lustriaMagic === "slann"
    ? lores
        .filter((l) => LORE_WINDS[l])
        .map((lore) => ({
          name: `Arcane Magic (${lore})`,
          ranks: 1,
          origin: "Printed",
          key: `slann-lore-${lore}`,
          source: profile.source,
          adaptation:
            "The printed unqualified Arcane Magic requires an explicit Colour Lore choice. No spells are automatically granted.",
        }))
    : [];
}
export function slannSkills(profile, stats, lores = []) {
  return profile?.lustriaMagic === "slann"
    ? lores
        .filter((l) => LORE_WINDS[l])
        .map((lore) => ({
          name: `Channelling (${LORE_WINDS[lore]})`,
          total: profile.channellingTotal + stats.WP - profile.stats.WP,
          source: profile.source,
        }))
    : [];
}
export function lustriaIssues(s, result, add) {
  const p = result.profile;
  if (p.lustriaMagic === "slann" && !s.profileLores.length)
    add(
      "Choose at least one Colour Lore for this Slann; its matching Channelling Wind retains the printed total (Lustria pp. 123–127).",
      1,
      "#gm-profile-lores",
      "profile.slann-lores",
      p.source,
    );
  if (
    result.template?.lustriaPriest &&
    !["Beasts", "Heavens"].includes(s.templateLore)
  )
    add(
      "Choose Beasts or Heavens for this Priest caste (Lustria p. 139).",
      1,
      "#template-lore",
      "template.skink-lore",
      result.template.source,
    );
  if (p.species === "Skink") {
    const lores = new Set(
      result.talents.flatMap(
        (t) => t.name.match(/^Arcane Magic \((.*)\)$/)?.[1] || [],
      ),
    );
    result.traits
      .filter((t) => t.name === "Spellcaster")
      .forEach((t) =>
        t.value
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
          .forEach((l) => lores.add(l)),
      );
    if (lores.size > 1)
      add(
        "A Skink Priest can master only one Wind: Beasts, Heavens, or rare Life (Lustria p. 139).",
        1,
        "#gm-tab-2",
        "magic.skink-winds",
        p.source,
      );
  }
  for (const [i, entry] of (p.unavailableTraits || []).entries())
    if (!entry.optional && !s.removed.includes(`unavailable:${i}`))
      add(
        `${entry.name} is undefined in the supplied rules. Remove this unresolved entry before export; no effect is invented.`,
        1,
        `#gm-unavailable-${i}`,
        "profile.undefined-trait",
        p.source,
      );
}
