// Compile reviewed PDF extraction into explicit, source-owned GM records.
import { canon, base, options } from "../rules.mjs";
import { bookId, sourceLabel } from "./books.mjs";

// Named worked examples are retained in the reviewed extraction, but are not
// selectable foundations. Keep exact source identities rather than name matching.
const excludedNamedExamples = new Set([
  "core:creatures:skrakk-bestigor-elite",
  "core:creatures:ungrakk-gor-beastlord-commander",
  "core:creatures:swilegrakk-bray-shaman-spellcaster",
  "core:creatures:guzgog-ungor-skirmisher",
]);

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
  const foundations = raw.creatures.filter(
    (p) => !excludedNamedExamples.has(p.id),
  );
  const profiles = foundations.map((p) => {
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
    excludedProfiles: raw.creatures
      .filter((p) => excludedNamedExamples.has(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        page: p.page,
        reason: "Named character in Worked Examples; excluded by user request.",
      })),
    templates,
    traits: raw.traits,
    mutations: raw.mutations,
  };
}
export function gmInventory(data) {
  return `# GM content inventory\n\nGenerated from reviewed supplied-book sources. Do not edit by hand.\n\n${data.profiles.length} printed profiles, ${data.templates.length} core templates, ${data.traits.length} core Creature Traits, ${data.training.length} supplementary training option and ${data.mutations.length} Physical/Mental Corruption table entries. Books are enabled independently of player creation. Career development, hirelings and live play are deferred.\n\n| Book | Profiles | Templates | GM options |\n| --- | --- | --- | --- |\n${data.books.map((b) => `| ${b.title} | ${data.profiles.filter((p) => bookId(p) === b.id).length} | ${data.templates.filter((p) => bookId(p) === b.id).length} | ${b.summary || "Core profiles, templates & rules"} |`).join("\n")}\n\n| Profile | Source | Category | Legacy |\n| --- | --- | --- | --- |\n${[
    ...data.profiles,
  ]
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
    .map(
      (p) =>
        `| ${p.name} | ${sourceLabel(p)} | ${p.category} | ${p.adaptation ? "Yes" : ""} |`,
    )
    .join("\n")}\n`;
}

export function addGMSupplement(data, raw, R) {
  const book = R.books.find((b) => b.id === raw.id);
  if (
    raw.schemaVersion !== 1 ||
    !book ||
    raw.source.sha256 !== book.source.sha256
  )
    throw Error("GM supplement source does not match its installed book.");
  const ids = new Set(
    [...data.profiles, ...data.templates, ...data.traits].map((x) => x.id),
  );
  for (const entry of [...raw.profiles, ...raw.training]) {
    if (
      !entry.id?.startsWith(`${book.id}:`) ||
      ids.has(entry.id) ||
      !entry.name ||
      entry.source?.book !== book.id ||
      !Number.isInteger(entry.page) ||
      entry.page !== entry.source.page
    )
      throw Error("Invalid GM supplement identity or source.");
    ids.add(entry.id);
  }
  const profiles = raw.profiles.map((p) => {
    for (const key of [
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
        p.stats[key] !== null &&
        (!Number.isInteger(p.stats[key]) || p.stats[key] < 0)
      )
        throw Error(`${p.name}: invalid ${key}.`);
    for (const t of [...p.traits, ...p.optionalTraits])
      if (!data.traits.some((x) => x.name === t.name))
        throw Error(`${p.name}: unknown core Trait ${t.name}.`);
    const rows = (kind) =>
      p[kind].map((x, i) => ({
        ...x,
        key: `${book.id}-${p.id.split(":").at(-1)}-${kind}-${i}`,
        origin: "Printed",
        source: p.source,
        ...(x.adaptation ? { adaptationSource: p.source } : {}),
        page: p.page,
      }));
    const coreProfile = data.profiles.find(
      (x) => x.id === p.descriptionProfile,
    );
    if (p.descriptionProfile && !coreProfile)
      throw Error(`${p.name}: unknown core description profile.`);
    return {
      ...p,
      sections: coreProfile
        ? { ...p.sections, Traits: coreProfile.sections.Traits }
        : p.sections,
      ...(coreProfile
        ? { traitDescriptionSource: { book: "core", page: coreProfile.page } }
        : {}),
      traits: rows("traits"),
      skills: rows("skills"),
      talents: rows("talents"),
      armour: rows("armour"),
      attacks: rows("attacks"),
    };
  });
  return {
    ...data,
    books: [
      ...data.books,
      {
        id: book.id,
        title: book.title,
        shortTitle: book.shortTitle,
        summary: raw.summary || "Mount profiles, equipment & magic",
        version: book.version,
        source: book.source,
      },
    ],
    profiles: [...data.profiles, ...profiles],
    training: [...data.training, ...raw.training],
  };
}
