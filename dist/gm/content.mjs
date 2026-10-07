// Compile reviewed PDF extraction into explicit, source-owned GM records.
import { canon, base, options } from "../rules.mjs";

const quote = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function entries(text, definitions, descriptions = true) {
  const names = definitions
    .map((x) => base(x.name))
    .sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `(?:^|[ ,])(${names.map(quote).join("|")})(?: \\(([^)]*)\\)| (\\d+)(?:\\+)?)*(?:${descriptions ? ":" : "(?=,|$)"})`,
    "g",
  );
  return [...text.replaceAll("T erritorial", "Territorial").matchAll(pattern)]
    .map((m) => ({
      name: canon(m[1]),
      value: m[2] || m[3] || "",
      ranks: Number(m[3]) || 1,
    }))
    .filter(
      (x, i, a) =>
        a.findIndex((y) => y.name === x.name && y.value === x.value) === i,
    );
}
export function prepareGM(raw, R) {
  if (raw.schemaVersion !== 1 || raw.source.sha256 !== R.books[0].source.sha256)
    throw Error("GM source does not match the supplied core book.");
  const ids = new Set();
  for (const list of [
    raw.creatures,
    raw.templates,
    raw.traits,
    raw.mutations,
  ]) {
    if (!Array.isArray(list) || !list.length)
      throw Error("Missing GM source inventory.");
    for (const x of list) {
      if (
        !x.id?.startsWith("core:") ||
        ids.has(x.id) ||
        !x.name ||
        !Number.isInteger(x.page)
      )
        throw Error("Invalid or duplicate GM content identity.");
      ids.add(x.id);
    }
  }
  const profiles = raw.creatures.map((p) => {
    const identity = p.id.split(":").at(-1);
    for (const k of [
      "M",
      "WS",
      "BS",
      "S",
      "T",
      "I",
      "Ag",
      "Dex",
      "Int",
      "WP",
      "Fel",
      "W",
    ])
      if (
        p.stats[k] !== null &&
        (!Number.isInteger(p.stats[k]) || p.stats[k] < 0)
      )
        throw Error(`${p.name}: invalid ${k}.`);
    const traits = entries(p.sections.Traits || "", raw.traits).map((t, i) => ({
      ...t,
      value: t.name === "Fear" && !t.value ? "1" : t.value,
      key: `${identity}-trait-${i}`,
      origin: "Printed",
    }));
    const notes = [...p.notes];
    if (p.skills.some((x) => x.name === "Tracking"))
      notes.push(
        "Tracking in the Dragon profile (p. 330) is linked to the core Track Skill for recalculation, by user-approved naming correction.",
      );
    const talents = entries(p.sections.Talents || "", R.talents).map(
      (t, i) => ({
        ...t,
        name: t.name + (t.value ? ` (${t.value})` : ""),
        key: `${identity}-talent-${i}`,
        origin: "Printed",
      }),
    );
    const armourText = (p.sections.Armour || "").replace(
      /^Toughness Bonus:\s*\d+\s*/,
      "",
    );
    const armour = [
      ...armourText.matchAll(
        /(?:^|(?<=AP)\s+|(?<=Body)\s+|(?<=Head)\s+|(?<=Legs)\s+|(?<=Arms)\s+|(?<=Melee)\s+)(Optional )?([^:]+): \+(\d+) AP(?: to (Head|Arms and Body|Body|Legs))?/g,
      ),
    ].map((m, i) => ({
      key: `${identity}-armour-${i}`,
      name: m[2].trim(),
      ap: Number(m[3]),
      locations: (m[4] || "Head, Arms, Body, Legs").replace(" and ", ", "),
      optional: !!m[1],
      quick: R.armour.some((a) => a.name === m[2].trim() && a.quick),
      shield: /Shield|Ironfist/.test(m[2]),
      origin: "Printed",
      page: p.page,
    }));
    const spells = R.spells
      .filter((spell) => (p.sections.Spells || "").includes(spell.name))
      .map((x) => x.contentId);
    return {
      ...p,
      notes,
      traits,
      talents,
      armour,
      spells,
      optionalTraits: entries(
        p.sections["Optional Traits"] || "",
        raw.traits,
        false,
      ),
      skills: p.skills.map((x, i) => ({
        ...x,
        name: x.name === "Tracking" ? "Track" : x.name,
        key: `${identity}-skill-${i}`,
        origin: "Printed",
      })),
      attacks: p.attacks.map((x, i) => ({
        ...x,
        name: x.name.replace("T eeth", "Teeth"),
        key: `${identity}-attack-${i}`,
        origin: "Printed",
      })),
    };
  });
  const templates = raw.templates.map((t) => ({
    ...t,
    skills: t.skills.map((x) => ({
      ...x,
      options: [
        ...new Set(x.options.flatMap((name) => options(R, name, "skill"))),
      ],
    })),
    talents: t.talents.map((x) => ({
      ...x,
      options: [
        ...new Set(
          x.options.flatMap((name) =>
            name === "Chaos Magic (Any)"
              ? [
                  "Chaos Magic (Nurgle)",
                  "Chaos Magic (Slaanesh)",
                  "Chaos Magic (Tzeentch)",
                ]
              : options(R, name, "talent"),
          ),
        ),
      ],
    })),
  }));
  return {
    schemaVersion: 1,
    version: "1.0.0",
    coreVersion: R.books[0].version,
    source: raw.source,
    profiles,
    templates,
    traits: raw.traits,
    mutations: raw.mutations,
  };
}
export function gmInventory(data) {
  return `# Core GM content inventory\n\nGenerated from the reviewed core extraction. Do not edit by hand.\n\n${data.profiles.length} printed profiles, ${data.templates.length} templates, ${data.traits.length} Creature Traits and ${data.mutations.length} Physical/Mental Corruption table entries. Career development and live play are deferred.\n\n| Profile | Core page | Category |\n| --- | --- | --- |\n${data.profiles.map((p) => `| ${p.name} | ${p.page} | ${p.category} |`).join("\n")}\n`;
}
