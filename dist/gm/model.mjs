import {
  templateRowKey,
  templateTraits,
  templateStats,
  templateIssues,
  supplementAbilityText,
} from "./templates.mjs";
import { KEYS, base, canon, skillInfo, talentInfo, die } from "../rules.mjs";
import { spellChoices, divineReferencesForTalents } from "../archives-iii.mjs";
import { calculateGMCants, validateGMCants } from "./cants.mjs";
import { knownRunes } from "../dwarf-guide.mjs";
import { equipmentSize } from "../equipment-sizing.mjs";
import { describeTraits } from "./trait-descriptions.mjs";
import { bookId, validateGMBooks } from "./books.mjs";
import {
  skillCharacteristic,
  speciesLoreIssue,
} from "../species-mechanics.mjs";

export const GM_SCHEMA = 2;
export const SIZES = [
  "Tiny",
  "Small",
  "Average",
  "Large",
  "Enormous",
  "Monstrous",
];
export const TRAINING = [
  "Broken",
  "Drive",
  "Entertain",
  "Fetch",
  "Guard",
  "Home",
  "Magic",
  "Mount",
  "War",
];
export const BREATH = [
  "Acid",
  "Cold",
  "Electricity",
  "Fire",
  "Poison",
  "Smoke",
];
export const PARAMETER = {
  Bite: "Damage",
  Breath: "Type",
  Horns: "",
  Tail: "",
  Tongue: "",
  Tentacles: "Number",
};
const own = (o, k) => Object.hasOwn(o, k);
const number = (n) => Number.isInteger(n) && n >= 0;
const bonus = (n) => (n === null ? null : Math.floor(n / 10));
const rowName = (row) => row.name + (row.value ? ` (${row.value})` : "");
export { rowName };

export function freshGM(data, profile = "", books = ["core"]) {
  return {
    type: "wfrp-gm",
    schemaVersion: GM_SCHEMA,
    dataVersion: data.version,
    coreVersion: data.coreVersion,
    books: [
      ...new Set([
        ...books,
        ...(profile
          ? [bookId(data.profiles.find((p) => p.id === profile) || {})]
          : []),
      ]),
    ],
    profile,
    name: "",
    description: "",
    purpose: "",
    motivation: "",
    manner: "",
    notes: "",
    step: 0,
    template: "",
    templateSkills: {},
    templateTalents: {},
    templateGear: {},
    stats: {},
    size: "",
    wounds: null,
    tbMode: "",
    tb: null,
    recalculate: false,
    traits: [],
    extraTraining: [],
    skills: [],
    talents: [],
    gear: [],
    spells: [],
    spellLores: {},
    cants: { enabled: false, choices: {} },
    mutations: [],
    removed: [],
    optionalAttacks: [],
    optionalArmour: [],
    attackOverrides: {},
    rolls: [],
    brokenRoll: null,
    markRoll: null,
    includeNotes: false,
  };
}
export function validateGMDraft(data, R, s) {
  const empty = freshGM(data),
    plain = (v) => v && typeof v === "object" && !Array.isArray(v);
  if (
    !plain(s) ||
    s.type !== empty.type ||
    s.schemaVersion !== GM_SCHEMA ||
    s.dataVersion !== data.version ||
    s.coreVersion !== data.coreVersion ||
    Object.keys(s).length !== Object.keys(empty).length ||
    Object.keys(s).some((k) => !own(empty, k))
  )
    throw Error(
      "Choose a current NPC & creature save file for this core version.",
    );
  for (const k of [
    "profile",
    "name",
    "description",
    "purpose",
    "motivation",
    "manner",
    "notes",
    "template",
    "size",
    "tbMode",
  ])
    if (typeof s[k] !== "string" || s[k].length > 20000)
      throw Error(`Invalid ${k} in NPC file.`);
  validateGMBooks(data, s.books);
  if (s.profile && !data.profiles.some((p) => p.id === s.profile))
    throw Error("Unknown printed profile.");
  if (
    s.profile &&
    !s.books.includes(bookId(data.profiles.find((p) => p.id === s.profile)))
  )
    throw Error("The starting profile requires an enabled GM book.");
  if (s.template && !data.templates.some((p) => p.id === s.template))
    throw Error("Unknown creature template.");
  if (
    s.template &&
    !s.books.includes(bookId(data.templates.find((p) => p.id === s.template)))
  )
    throw Error("The template requires an enabled GM book.");
  if (s.size && !SIZES.includes(s.size)) throw Error("Unknown Size.");
  if (
    !Number.isInteger(s.step) ||
    s.step < 0 ||
    s.step > 3 ||
    typeof s.recalculate !== "boolean" ||
    typeof s.includeNotes !== "boolean" ||
    !["", "printed", "calculated", "manual"].includes(s.tbMode)
  )
    throw Error("Invalid NPC controls.");
  for (const k of ["wounds", "tb"])
    if (s[k] !== null && !number(s[k])) throw Error(`Invalid ${k}.`);
  for (const k of [
    "stats",
    "templateSkills",
    "templateTalents",
    "templateGear",
    "attackOverrides",
  ])
    if (
      !plain(s[k]) ||
      Object.keys(s[k]).some((key) =>
        ["__proto__", "constructor", "prototype"].includes(key),
      )
    )
      throw Error(`Invalid ${k}.`);
  for (const [k, v] of Object.entries(s.stats))
    if (!["M", ...KEYS].includes(k) || (v !== null && !number(v)))
      throw Error("Invalid Characteristic override.");
  for (const k of [
    "traits",
    "extraTraining",
    "skills",
    "talents",
    "gear",
    "spells",
    "mutations",
    "removed",
    "optionalAttacks",
    "optionalArmour",
    "rolls",
  ])
    if (!Array.isArray(s[k]) || s[k].length > 1000)
      throw Error(`Invalid ${k} list.`);
  const printedTraining =
    data.profiles
      .find((p) => p.id === s.profile)
      ?.traits.filter((t) => t.name === "Trained")
      .flatMap((t) => parts(t.value)) || [];
  const allowedTraining = [
    ...TRAINING,
    ...(data.training || []).map((t) => t.name),
  ];
  if (
    s.extraTraining.length &&
    (!printedTraining.length ||
      new Set(s.extraTraining).size !== s.extraTraining.length ||
      s.extraTraining.some(
        (n) => !allowedTraining.includes(n) || printedTraining.includes(n),
      ))
  )
    throw Error("Invalid additional printed-profile training.");
  for (const t of s.traits)
    if (
      !plain(t) ||
      !data.traits.some((x) => x.name === t.name) ||
      typeof t.value !== "string" ||
      typeof t.key !== "string"
    )
      throw Error("Invalid Trait choice.");
  for (const t of s.talents)
    if (
      !plain(t) ||
      !talentInfo(R, t.name) ||
      talentInfo(R, t.name).unavailable ||
      !number(t.ranks) ||
      !t.ranks ||
      typeof t.key !== "string"
    )
      throw Error("Invalid Talent choice.");
  for (const t of s.skills)
    if (
      !plain(t) ||
      !skillInfo(R, t.name) ||
      !number(t.total) ||
      typeof t.key !== "string"
    )
      throw Error("Invalid Skill choice.");
  for (const g of s.gear)
    if (
      !plain(g) ||
      ![...R.weapons, ...R.armour, ...R.gear, ...R.market].some(
        (x) => x.contentId === g.id,
      ) ||
      !number(g.quantity) ||
      g.quantity < 1 ||
      typeof g.key !== "string"
    )
      throw Error("Invalid equipment choice.");
  for (const id of s.spells)
    if (!gmSpellCatalogue(R).some((p) => p.contentId === id))
      throw Error("Unknown spell.");
  for (const id of s.mutations)
    if (!data.mutations.some((p) => p.id === id))
      throw Error("Unknown mutation.");
  if (
    s.removed.some((key) => typeof key !== "string") ||
    new Set(s.spells).size !== s.spells.length ||
    new Set(s.mutations).size !== s.mutations.length
  )
    throw Error("Duplicate or invalid selections.");
  for (const [key, value] of Object.entries(s.templateSkills))
    if (
      !/^\d+$/.test(key) ||
      !Array.isArray(value) ||
      value.some((v) => typeof v !== "string")
    )
      throw Error("Invalid template Skill choices.");
  for (const [key, value] of Object.entries(s.templateTalents))
    if (!/^\d+$/.test(key) || typeof value !== "string")
      throw Error("Invalid template Talent choices.");
  for (const [i, id] of Object.entries(s.templateGear))
    if (!/^\d+$/.test(i) || typeof id !== "string")
      throw Error("Invalid template equipment choices.");
  for (const v of Object.values(s.attackOverrides))
    if (
      !plain(v) ||
      Object.keys(v).some((k) => !["skill", "damage"].includes(k)) ||
      Object.values(v).some((n) => n !== null && !number(n))
    )
      throw Error("Invalid attack adjustment.");
  if (
    s.brokenRoll !== null &&
    (!Array.isArray(s.brokenRoll) ||
      s.brokenRoll.length !== 2 ||
      s.brokenRoll.some((n) => !number(n) || n < 1 || n > 10))
  )
    throw Error("Invalid Broken training roll.");
  if (
    s.markRoll !== null &&
    (!number(s.markRoll) || s.markRoll < 1 || s.markRoll > 10)
  )
    throw Error("Invalid Mark roll.");
  const p = data.profiles.find((p) => p.id === s.profile),
    t = data.templates.find((t) => t.id === s.template);
  for (const [i, names] of Object.entries(s.templateSkills))
    if (
      !t?.skills[i] ||
      names.length > t.skills[i].count ||
      names.some((n) => n && !t.skills[i].options.includes(n)) ||
      new Set(names.filter(Boolean)).size !== names.filter(Boolean).length
    )
      throw Error("Unknown template Skill choice.");
  for (const [i, name] of Object.entries(s.templateTalents))
    if (!t?.talents[i]?.options.includes(name))
      throw Error("Unknown template Talent choice.");
  for (const [i, id] of Object.entries(s.templateGear))
    if (!t?.gear?.[i]?.options.some((x) => x.id === id))
      throw Error("Unknown template equipment choice.");
  for (const key of s.optionalAttacks)
    if (!p?.attacks.some((a) => a.key === key && a.optional))
      throw Error("Unknown optional attack.");
  for (const key of s.optionalArmour)
    if (!p?.armour.some((a) => a.key === key && a.optional))
      throw Error("Unknown optional armour.");
  const rowKeys = [...s.traits, ...s.skills, ...s.talents, ...s.gear].map(
    (x) => x.key,
  );
  if (
    rowKeys.some((k) => !/^gm-[a-z0-9-]+$/.test(k)) ||
    new Set(rowKeys).size !== rowKeys.length
  )
    throw Error("Invalid or duplicate added row identity.");
  for (const t of [...s.traits, ...s.skills, ...s.talents])
    if (t.origin !== "GM" || t.name.length > 1000 || t.value?.length > 1000)
      throw Error("Invalid GM row provenance or text.");
  const removable = new Set([
    ...(p
      ? [...p.traits, ...p.skills, ...p.talents, ...p.attacks, ...p.armour].map(
          (x) => x.key,
        )
      : []),
    ...(t?.traits || []).map((x, i) => templateRowKey(t, "trait", i)),
    ...(t?.gear || []).map((x, i) => templateRowKey(t, "gear", i)),
    ...(t?.armour ? [templateRowKey(t, "armour", 0)] : []),
    ...gmSpellCatalogue(R).map((x) => x.contentId),
  ]);
  if (
    s.removed.some(
      (k) =>
        !removable.has(k) &&
        !(k.startsWith("skill:") && skillInfo(R, k.slice(6))),
    )
  )
    throw Error("Unknown removed entry.");
  if (
    Object.keys(s.attackOverrides).some(
      (k) =>
        !p?.attacks.some((a) => a.key === k) &&
        ![...s.gear, ...s.traits].some((x) => x.key === k) &&
        !(t?.gear || []).some((x, i) => templateRowKey(t, "gear", i) === k),
    )
  )
    throw Error("Unknown attack override.");
  for (const r of s.rolls)
    if (
      !plain(r) ||
      typeof r.label !== "string" ||
      typeof r.at !== "string" ||
      !Array.isArray(r.faces) ||
      r.count !== r.faces.length ||
      !Number.isInteger(r.sides) ||
      r.sides < 2 ||
      r.faces.some((n) => !number(n) || n < 1 || n > r.sides) ||
      r.total !== r.faces.reduce((a, b) => a + b, 0) ||
      !Number.isInteger(r.page)
    )
      throw Error("Invalid recorded dice.");
  validateGMCants(R, s, calculateGM(data, R, s));
  return s;
}
export function gmRoll(s, label, count, sides, page) {
  const faces = Array.from({ length: count }, () => die(sides)),
    total = faces.reduce((a, b) => a + b, 0);
  s.rolls.push({
    label,
    faces,
    total,
    count,
    sides,
    page,
    at: new Date().toISOString(),
  });
  return faces;
}
export function individualise(s, p, key) {
  if (p.stats[key] === null)
    throw Error("The printed Characteristic is absent.");
  const faces = gmRoll(s, `Individualise ${p.name}: ${key}`, 2, 10, 318);
  s.stats[key] = p.stats[key] - 10 + faces.reduce((a, b) => a + b, 0);
}
export function applyTemplate(s, id) {
  const previous = s.template;
  if (previous) {
    s.removed = s.removed.filter((key) => !key.startsWith(previous + ":"));
    for (const key of Object.keys(s.attackOverrides))
      if (key.startsWith(previous + ":")) delete s.attackOverrides[key];
  }
  s.template = id;
  s.templateSkills = {};
  s.templateTalents = {};
  s.templateGear = {};
  s.spells = [];
  s.spellLores = {};
  s.cants.choices = {};
}
export function woundFormula(
  stats,
  size,
  construct = false,
  swarm = false,
  hardy = 0,
  toughnessBonus = bonus(stats.T),
) {
  const tb = toughnessBonus,
    sb = bonus(stats.S),
    wp = construct ? sb : bonus(stats.WP);
  if (tb === null) return null;
  if (swarm)
    return sb === null || wp === null ? null : (sb + (2 + hardy) * tb + wp) * 5;
  if (size === "Tiny") return null;
  if (size === "Small") return (2 + hardy) * tb;
  if (sb === null || wp === null) return null;
  return (
    (sb + (2 + hardy) * tb + wp) *
    ({ Average: 1, Large: 2, Enormous: 4, Monstrous: 8 }[size] || 1)
  );
}
const sizeDamage = (size, sb) =>
  sb * ({ Large: 1, Enormous: 1, Monstrous: 2 }[size] || 0);
const parts = (text) =>
  text
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
const magicLore = (name) =>
  name.match(/^(?:Arcane Magic|Chaos Magic) \((.*)\)$/)?.[1];
export const gmSpecies = (profile) =>
  profile?.species || (profile?.id === "core:creatures:ogre" ? "Ogre" : "");
export const gmSkillCharacteristic = (R, profile, name) =>
  skillCharacteristic(
    R,
    { species: gmSpecies(profile) },
    name,
    skillInfo(R, name)?.char,
  );
export const gmLoreIssue = (R, profile, lore) =>
  speciesLoreIssue(R, { species: gmSpecies(profile) }, lore);
// A printed targeted spell is a distinct GM selection, sharing its canonical
// profile and source. Never grant an unspecified Fellstave or invent targets.
export function gmTalentLimit(R, stats, name) {
  const limit = talentInfo(R, name)?.limit;
  if (Array.isArray(limit))
    return limit.reduce((total, char) => total + (bonus(stats[char]) || 0), 0);
  if (Number.isInteger(limit)) return limit;
  const configured = R.config.talentLimits[base(name)];
  return configured === null ? Infinity : (configured ?? 1);
}
export function gmSpellCatalogue(R) {
  return [
    ...spellChoices(R),
    ...R.techniques.map((x) => ({ ...x, category: "Technique" })),
  ].map((x) =>
    x.specialisation
      ? {
          ...x,
          contentId: `${x.contentId}:target:${encodeURIComponent(x.specialisation)}`,
        }
      : x,
  );
}

export function gmCastableLores(R) {
  const otherTypes = new Set([
    "Petty",
    "Arcane",
    "Elven Arcane",
    "Blessing",
    "Ritual",
    ...R.config.gods,
  ]);
  return [
    ...new Set([
      ...R.config.colours,
      ...R.spells
        .filter((spell) => !otherTypes.has(spell.category) && !spell.ritual)
        .map((spell) => spell.category),
    ]),
  ];
}
export function gmMagicLores(R, result) {
  const lores = new Set(
    result.talents.map((t) => magicLore(t.name)).filter(Boolean),
  );
  if (result.talents.some((t) => t.name === "High Magic"))
    lores.add("High Magic");
  for (const t of result.traits)
    if (t.name === "Spellcaster")
      parts(t.value).forEach((x) => lores.add(x.replace(/^Lore of /, "")));
  for (const lore of lores)
    if (gmLoreIssue(R, result.profile, lore)) lores.delete(lore);
  return lores;
}
export function magicChoices(R, result) {
  const lores = gmMagicLores(R, result);
  const blessingGods = result.traits
      .filter((t) => t.name === "Blessed")
      .map((t) => t.value),
    miracleGods = result.traits
      .filter((t) => t.name === "Miracles")
      .map((t) => t.value);
  result.talents.forEach((t) => {
    if (/^Bless \(/.test(t.name))
      blessingGods.push(t.name.match(/\((.*)\)/)[1]);
    if (/^Invoke \(/.test(t.name))
      miracleGods.push(t.name.match(/\((.*)\)/)[1]);
  });
  // Old Faith Invoke teaches additional Blessings rather than Miracles (p. 58).
  if (miracleGods.includes("Old Faith")) blessingGods.push("Old Faith");
  const arcane = result.talents
    .map((t) => t.name.match(/^Arcane Magic \((.*)\)$/)?.[1])
    .filter(Boolean);
  return gmSpellCatalogue(R).filter((spell) =>
    spell.ritual
      ? arcane.some(
          (lore) =>
            spell.ritual.lores.includes("*") ||
            spell.ritual.lores.includes(lore),
        )
      : spell.category === "Technique"
        ? result.talents.some((t) => t.name === "Sword-dancing")
        : (spell.category === "Petty" &&
            result.talents.some((t) => t.name === "Petty Magic")) ||
          lores.has(spell.category) ||
          (result.talents.some((t) => t.name === "Witch!") &&
            [...R.config.colours, "Witchcraft"].includes(spell.category) &&
            !gmLoreIssue(R, result.profile, spell.category)) ||
          (["Arcane", "Elven Arcane"].includes(spell.category) &&
            [...lores].some((lore) => lore !== "High Magic")) ||
          (spell.category === "Blessing" &&
            blessingGods.some((god) =>
              R.config.blessings[god]?.some(
                (name) => spell.name === `Blessing of ${name}`,
              ),
            )) ||
          (miracleGods.includes(spell.category) && !spell.ritual),
  );
}
export function calculateGM(data, R, s) {
  const issues = [],
    warnings = [],
    add = (message, step, target, code = "choice", source) =>
      issues.push({
        message,
        code,
        severity: "error",
        source: source || {
          book: "core",
          page: code.startsWith("magic") ? 354 : 318,
        },
        control: { step, target },
      });
  const p = data.profiles.find(
    (p) => p.id === s.profile && s.books.includes(bookId(p)),
  );
  if (!p) {
    add("Choose a printed starting profile.", 0, "#gm-profile-search");
    return {
      profile: null,
      issues,
      warnings,
      stats: {},
      skills: [],
      talents: [],
      traits: [],
      attacks: [],
      armour: [],
      spells: [],
      runes: [],
      magicLores: [],
      cants: [],
      cantGrants: [],
      gear: [],
      mutations: [],
      size: "",
      tb: null,
      wounds: null,
    };
  }
  const template = data.templates.find((t) => t.id === s.template);
  const live = (rows) => rows.filter((x) => !s.removed.includes(x.key));
  const traits = live(templateTraits(template, [...p.traits, ...s.traits])).map(
    (t) => ({
      ...t,
      text: data.traits.find((x) => x.name === t.name)?.text || "",
      page: data.traits.find((x) => x.name === t.name)?.page || p.page,
      source: data.traits.find((x) => x.name === t.name)?.source || {
        book: "core",
        page: data.traits.find((x) => x.name === t.name)?.page || p.page,
      },
    }),
  );
  for (const t of traits.filter(
    (t) => t.name === "Trained" && t.origin === "Printed",
  ))
    t.value = [...new Set([...parts(t.value), ...s.extraTraining])].join(", ");
  for (const t of traits.filter((t) => t.name === "Trained")) {
    const choices = parts(t.value);
    for (const extra of (data.training || []).filter((x) =>
      choices.includes(x.name),
    )) {
      t.text += `\n\n${extra.name}: ${extra.text}`;
      t.adaptation = extra.adaptation;
      t.adaptationSource = extra.source;
      if (
        extra.requires &&
        !traits.some(
          (x) =>
            x.name === "Trained" && parts(x.value).includes(extra.requires),
        )
      ) {
        issues.push({
          message: `${extra.name} requires Trained (${extra.requires}).`,
          code: "training.prerequisite",
          severity: "error",
          source: extra.source,
          control: { step: 1, target: `#trait-${t.key}` },
        });
      }
    }
  }
  const talents = live([...p.talents, ...s.talents]).map((t) => ({ ...t }));
  for (const t of traits.filter(
    (t) => t.name === "Mark of Chaos" && t.origin === "GM",
  )) {
    const grant = (name) => {
      if (!talents.some((x) => x.name === name))
        talents.push({ name, ranks: 1, key: `mark-${name}`, origin: "Trait" });
    };
    if (t.value === "Khorne") grant("Frenzy");
    if (t.value === "Slaanesh") grant("Fearless (Everything)");
    if (t.value) grant(`Etiquette (Followers of ${t.value})`);
    if (
      t.value === "Tzeentch" &&
      (s.markRoll === null ||
        s.mutations.length < Math.ceil(s.markRoll / 3) ||
        s.mutations
          .slice(0, Math.ceil(s.markRoll / 3))
          .some(
            (id, i, ids) =>
              i &&
              data.mutations.find((m) => m.id === id)?.category ===
                data.mutations.find((m) => m.id === ids[i - 1])?.category,
          ))
    )
      add(
        "Roll and choose the alternating Mental/Physical Mutations granted by the Mark of Tzeentch.",
        1,
        "#gm-mutations",
      );
  }
  const trained = traits
    .filter((t) => t.name === "Trained" && t.origin !== "Printed")
    .flatMap((t) => parts(t.value));
  if (traits.some((t) => t.name === "Trained" && t.origin === "Printed"))
    trained.push(...s.extraTraining);
  if (
    trained.includes("Guard") &&
    !traits.some((t) => t.name === "Territorial")
  )
    traits.push({
      key: "trained-guard",
      name: "Territorial",
      value: "",
      origin: "Training",
      text: data.traits.find((t) => t.name === "Territorial").text,
      page: 363,
    });
  const templateSkills = [];
  for (const [i, slot] of (template?.talents || []).entries()) {
    const name =
      slot.options.length === 1 ? slot.options[0] : s.templateTalents[i];
    if (!slot.options.includes(name)) {
      add(
        `Choose ${slot.options.length > 2 ? "a magical Lore Talent" : slot.options.join(" or ")} for ${template.name}.`,
        1,
        `#template-talent-${i}`,
        "template.talent",
        template.source,
      );
      continue;
    }
    const prior = talents.find((x) => x.name === name);
    if (prior && prior.ranks >= slot.ranks) continue;
    if (prior) talents.splice(talents.indexOf(prior), 1);
    talents.push({
      key: `template-talent-${i}`,
      name,
      ranks: slot.ranks,
      origin: "Template",
      source: template.source || { book: "core", page: template.page },
      ...(slot.adaptation
        ? { adaptation: slot.adaptation, adaptationSource: template.source }
        : {}),
    });
  }
  for (const [i, slot] of (template?.skills || []).entries()) {
    const names =
      slot.options.length === 1 ? [slot.options[0]] : s.templateSkills[i] || [];
    if (
      names.length !== slot.count ||
      new Set(names).size !== names.length ||
      names.some((n) => !slot.options.includes(n))
    ) {
      add(
        `Choose ${slot.count === 1 ? "a" : "two different"} ${base(slot.options[0])} specialisation${slot.count > 1 ? "s" : ""} for ${template.name}.`,
        1,
        `#template-skill-${i}`,
        "template.skill",
        template.source,
      );
      continue;
    }
    for (const name of names)
      templateSkills.push({ name, bonus: slot.bonus, origin: "Template" });
  }
  const stats = {};
  for (const key of ["M", ...KEYS])
    stats[key] = own(s.stats, key) ? s.stats[key] : p.stats[key];
  templateStats(template, stats);
  const adjustments = { ...(template?.adjustments || {}) };
  // A subtraction cannot restore an absent score. Mounts retain absent BS.
  for (const key of Object.keys(adjustments))
    if (template?.eligibility === "mount" && stats[key] === null)
      delete adjustments[key];
  for (const t of talents.filter((x) => x.origin !== "Printed")) {
    const key = R.config.talentEffects[base(t.name)];
    if (key) adjustments[key] = (adjustments[key] || 0) + 5 * t.ranks;
    if (t.name === "Fleet-footed") adjustments.M = (adjustments.M || 0) + 1;
  }
  for (const t of p.talents.filter((x) => s.removed.includes(x.key))) {
    const key = R.config.talentEffects[base(t.name)];
    if (key) adjustments[key] = (adjustments[key] || 0) - 5 * t.ranks;
    if (t.name === "Fleet-footed") adjustments.M = (adjustments.M || 0) - 1;
  }
  if (trained.includes("War")) adjustments.WS = (adjustments.WS || 0) + 10;
  if (trained.includes("Broken")) {
    if (s.brokenRoll === null)
      add(
        "Roll the 2d10 Fellowship increase for Broken training.",
        1,
        "#gm-broken-roll",
      );
    else {
      if (stats.Fel === null) stats.Fel = 0;
      adjustments.Fel =
        (adjustments.Fel || 0) + s.brokenRoll.reduce((a, b) => a + b, 0);
    }
  }
  const mutations = s.mutations
    .map((id) => data.mutations.find((m) => m.id === id))
    .filter(Boolean);
  for (const m of mutations)
    for (const [key, v] of Object.entries(m.adjustments || {}))
      adjustments[key] = (adjustments[key] || 0) + v;
  const newTraits = traits.filter((t) => ["GM", "Template"].includes(t.origin));
  if (newTraits.some((t) => t.name === "Swarm"))
    adjustments.WS = (adjustments.WS || 0) + 10;
  if (newTraits.some((t) => t.name === "Mark of Chaos" && t.value === "Nurgle"))
    adjustments.T = (adjustments.T || 0) + 10;
  const construct = traits.some((t) => t.name === "Construct"),
    swarm = traits.some((t) => t.name === "Swarm");
  if (newTraits.some((t) => t.name === "Construct"))
    for (const k of ["Int", "WP", "Fel"]) stats[k] = null;
  let size = s.size || p.size;
  if (!swarm && size !== p.size) {
    const steps = SIZES.indexOf(size) - SIZES.indexOf(p.size);
    adjustments.S = (adjustments.S || 0) + 10 * steps;
    adjustments.T = (adjustments.T || 0) + 10 * steps;
    adjustments.Ag = (adjustments.Ag || 0) - 5 * steps;
  }
  for (const [key, v] of Object.entries(adjustments)) {
    if (stats[key] === null)
      add(
        `${key} is absent; this change needs an explicit base score.`,
        1,
        `#stat-${key}`,
      );
    else stats[key] += v;
  }
  for (const [key, v] of Object.entries(stats))
    if (v !== null && !number(v))
      add(`${key} must be a nonnegative whole number.`, 1, `#stat-${key}`);
  const changed =
    s.recalculate ||
    Object.keys(stats).some((key) => stats[key] !== p.stats[key]) ||
    size !== p.size ||
    swarm !== p.traits.some((t) => t.name === "Swarm") ||
    construct !== p.traits.some((t) => t.name === "Construct");
  let tb = p.toughnessBonus ?? bonus(stats.T);
  const tbConflict =
    p.toughnessBonus !== null && p.toughnessBonus !== bonus(p.stats.T);
  if (changed) tb = bonus(stats.T);
  if (s.tbMode === "printed") tb = p.toughnessBonus ?? bonus(p.stats.T);
  if (s.tbMode === "calculated") tb = bonus(stats.T);
  if (s.tbMode === "manual") {
    tb = s.tb;
    if (tb === null) add("Set a manual Toughness Bonus.", 1, "#gm-tb");
  }
  if (tbConflict && changed && !s.tbMode)
    add(
      "The printed Toughness Bonus conflicts with Toughness. Choose which value to use before exporting this changed profile.",
      1,
      "#gm-tb-mode",
      "source.tb",
    );
  const hardy = talents
      .filter((t) => base(t.name) === "Hardy")
      .reduce((n, t) => n + t.ranks, 0),
    printedHardy = p.talents
      .filter((t) => base(t.name) === "Hardy")
      .reduce((n, t) => n + t.ranks, 0);
  let wounds =
    changed || hardy !== printedHardy
      ? woundFormula(stats, size, construct, swarm, hardy, tb)
      : p.stats.W;
  if (swarm) {
    const normalChanged =
        s.recalculate ||
        template ||
        hardy !== printedHardy ||
        ["S", "T", "WP"].some((k) => stats[k] !== p.stats[k]) ||
        construct !== p.traits.some((t) => t.name === "Construct"),
      normal = normalChanged
        ? woundFormula(stats, p.size, construct, false, hardy, tb)
        : p.stats.W;
    wounds = normal === null ? null : normal * 5;
  }
  if (s.wounds !== null) wounds = s.wounds;
  if (wounds === null)
    add(
      "This build needs a manual Wounds value. Tiny has no printed Wounds formula (p. 361).",
      1,
      "#gm-wounds",
    );
  const skills = new Map();
  const put = (name, total, origin) => {
    if (s.removed.includes(`skill:${name}`)) return;
    const old = skills.get(name);
    if (!old || total > old.total)
      skills.set(name, {
        name,
        total,
        origin,
        char: gmSkillCharacteristic(R, p, name),
      });
  };
  for (const x of live(p.skills)) {
    const char = gmSkillCharacteristic(R, p, x.name);
    const value =
      changed && char && stats[char] !== null && p.stats[char] !== null
        ? stats[char] + x.total - p.stats[char]
        : x.total;
    put(x.name, value, "Printed");
  }
  for (const x of templateSkills) {
    const char = gmSkillCharacteristic(R, p, x.name);
    if (!char || stats[char] === null)
      add(
        `${x.name} needs an explicit ${char || "Characteristic"} score.`,
        1,
        `#template-skill-${template.skills.findIndex((v) => v.options.includes(x.name))}`,
      );
    else put(x.name, stats[char] + x.bonus, "Template");
  }
  for (const t of newTraits) {
    const grant = {
      Tracker: ["Track", "Int"],
      Stealthy: ["Stealth (Rural)", "Ag"],
      Blessed: ["Pray", "Fel"],
      Miracles: ["Pray", "Fel"],
    }[t.name];
    if (grant) {
      if (stats[grant[1]] === null)
        add(
          `${t.name} needs ${grant[1]} for its granted Skill.`,
          1,
          `#trait-${t.key}`,
        );
      else put(grant[0], stats[grant[1]] + 10, "Trait");
    }
    if (t.name === "Amphibious" && stats.S !== null)
      put("Swim", stats.S, "Trait");
    if (t.name === "Spellcaster" && !template?.magic) {
      for (const lore of parts(t.value)) {
        const wind = {
          Beasts: "Ghur",
          Death: "Shyish",
          Fire: "Aqshy",
          Heavens: "Azyr",
          Life: "Ghyran",
          Light: "Hysh",
          Metal: "Chamon",
          Shadows: "Ulgu",
          "The Great Maw": "The Great Maw",
        }[lore];
        if (wind && stats.WP !== null)
          put(`Channelling (${wind})`, stats.WP + 10, "Trait");
        if (!wind && !s.skills.some((x) => base(x.name) === "Channelling"))
          add(
            "Choose a Channelling Wind Skill for this magical Lore.",
            1,
            "#gm-tab-2",
            "magic.wind",
          );
      }
      const castingChar = gmSkillCharacteristic(R, p, "Language (Magick)");
      if (stats[castingChar] !== null)
        put("Language (Magick)", stats[castingChar] + 10, "Trait");
    }
  }
  for (const x of live(s.skills))
    skills.set(x.name, { ...x, char: gmSkillCharacteristic(R, p, x.name) });
  for (const x of s.skills)
    if (!number(x.total))
      add(
        `${x.name} needs a nonnegative whole-number total.`,
        1,
        "#gm-tab-2",
        "skill.total",
      );
  for (const t of s.talents)
    if (talentInfo(R, t.name)?.unavailable) {
      const entry = talentInfo(R, t.name);
      issues.push({
        message: entry.unavailable,
        code: "talent.unavailable",
        severity: "error",
        source: entry.source,
        control: { step: 1, target: "#gm-tab-2" },
      });
    } else if (
      !Number.isInteger(t.ranks) ||
      t.ranks < 1 ||
      (talentInfo(R, t.name)?.limit
        ? s.talents
            .filter((x) => base(x.name) === base(t.name))
            .reduce((sum, x) => sum + x.ranks, 0)
        : t.ranks) > gmTalentLimit(R, stats, t.name)
    )
      add(
        `${t.name} exceeds its printed purchase limit.`,
        1,
        "#gm-tab-2",
        "talent.limit",
      );
  for (const t of s.talents)
    if (base(t.name) === "Impassioned Zeal" && !t.name.match(/\(([^)]+)\)/))
      add(
        "Set an explicit Cause for Impassioned Zeal.",
        1,
        "#gm-tab-2",
        "talent.cause",
      );
  const vices = talents.filter((t) => base(t.name) === "Vice");
  if (vices.length > (bonus(stats.WP) || 0))
    issues.push({
      code: "talent.vice-limit",
      message:
        "Vice permits at most Willpower Bonus different Vices (Archives II p. 20). Remove an excess choice or adjust Willpower.",
      severity: "error",
      source: { book: "archives-ii", page: 20 },
      control: { step: 1, target: "#gm-tab-2" },
    });
  for (const t of newTraits) {
    const param =
      PARAMETER[t.name] ??
      data.traits.find((x) => x.name === t.name)?.parameter;
    if (param && !t.value.trim())
      add(`Set ${param.toLowerCase()} for ${t.name}.`, 1, `#trait-${t.key}`);
    if (
      ["Rating", "Number", "Damage"].includes(param) &&
      (!/^\d+$/.test(t.value) || Number(t.value) < 1)
    )
      add(
        `${t.name} needs a positive whole-number ${param.toLowerCase()}.`,
        1,
        `#trait-${t.key}`,
      );
  }
  for (const t of newTraits) {
    const known = {
      Breath: BREATH,
      "Mark of Chaos": ["Khorne", "Nurgle", "Slaanesh", "Tzeentch"],
      Blessed: R.config.gods,
      Miracles: R.config.gods,
      Spellcaster: gmCastableLores(R),
      Corruption: ["Minor", "Moderate", "Major"],
      Trained: [...TRAINING, ...(data.training || []).map((x) => x.name)],
    }[t.name];
    if (known && parts(t.value).some((v) => !known.includes(v)))
      add(
        `Choose a printed ${t.name} parameter.`,
        1,
        `#trait-${t.key}`,
        "trait.parameter",
      );
  }
  const sb = bonus(stats.S) || 0,
    oldSB = bonus(p.stats.S) || 0;
  const attacks = live(p.attacks)
    .filter((a) => !a.optional || s.optionalAttacks.includes(a.key))
    .map((a) => {
      const ranged =
        /Bow|Sling|Crossbow|Rocks|Breath|Vomit/.test(a.name) ||
        /yards/.test(a.text);
      const free =
        /Bite|Horns|Tail|Tentacle|Breath|Vomit|Grasp|Howl/.test(a.name) ||
        /Free Attack/.test(a.text);
      const weapon = R.weapons.find((w) => a.name.startsWith(w.name));
      const char = ranged ? "BS" : "WS",
        skillName = weapon
          ? `${ranged ? "Ranged" : "Melee"} (${weapon.group})`
          : `Melee (Brawling)`;
      const trainedSkill =
        skills.get(skillName) || skills.get(ranged ? "Ranged" : "Melee");
      let score = a.skill,
        damage = a.damage;
      if (
        (changed || s.skills.length) &&
        score !== null &&
        stats[char] !== null &&
        p.stats[char] !== null
      )
        score = s.skills.some((x) => x.name === skillName)
          ? trainedSkill.total
          : Math.max(
              score + stats[char] - p.stats[char],
              trainedSkill?.total ?? 0,
            );
      if (changed && damage !== null) {
        if (a.name === "Vomit")
          damage = damage + (bonus(stats.T) || 0) - (bonus(p.stats.T) || 0);
        else
          damage =
            damage +
            sb -
            oldSB +
            (!ranged && !free
              ? sizeDamage(swarm ? "Average" : size, sb) -
                sizeDamage(p.size, oldSB)
              : 0);
      }
      const override = s.attackOverrides[a.key] || {};
      return {
        ...a,
        skill: own(override, "skill") ? override.skill : score,
        damage: own(override, "damage") ? override.damage : damage,
        ranged,
        free,
      };
    });
  const grantedGear = (template?.gear || []).flatMap((slot, i) => {
    const id =
      !slot.choose && slot.options.length === 1
        ? slot.options[0].id
        : s.templateGear[i];
    return slot.options.some((x) => x.id === id)
      ? [
          {
            id,
            quantity: 1,
            key: templateRowKey(template, "gear", i),
            origin: "Template",
          },
        ]
      : [];
  });
  const gear = live([...grantedGear, ...s.gear])
    .filter((g) => !g.id.startsWith("printed-attack-"))
    .map((g) => ({
      ...g,
      entry: [...R.weapons, ...R.armour, ...R.gear, ...R.market].find(
        (x) => x.contentId === g.id,
      ),
    }));
  for (const g of gear) {
    const sizing = equipmentSize(
      R,
      { species: gmSpecies(p) },
      g.entry.name,
      g.entry,
    );
    if (sizing.useUnresolved) {
      const weapon = R.weapons.some((w) => w.contentId === g.id);
      const override = s.attackOverrides[g.key] || {};
      if (!weapon || !own(override, "skill") || !own(override, "damage"))
        issues.push({
          code: "equipment.species",
          message:
            sizing.note +
            (weapon
              ? " Set both attack score and Damage explicitly, or remove this item."
              : " Remove this item; no reduced armour profile is available."),
          severity: "error",
          source: sizing.source,
          control: {
            step: 2,
            target: weapon ? `#attack-${g.key}` : `#gear-${g.key}`,
          },
        });
      warnings.push(sizing.note);
    }
  }
  for (const g of gear.filter((g) =>
    R.weapons.some((w) => w.contentId === g.id),
  )) {
    const w = g.entry;
    // A listed Trapping does not create another attack with a weapon already
    // present in the printed foundation. Preserve its sourced attack profile.
    if (g.origin === "Template" && attacks.some((a) => a.name === w.name))
      continue;
    const char = w.kind === "ranged" ? "BS" : "WS",
      name = `${w.kind === "ranged" ? "Ranged" : "Melee"} (${w.group})`;
    const skill = skills.get(name)?.total ?? stats[char];
    let damage = null;
    const m = w.damage.replaceAll(" ", "").match(/^(SB|TB)?\+?(\d+)?$/);
    if (m)
      damage =
        (m[1] === "SB" ? sb : m[1] === "TB" ? bonus(stats.T) || 0 : 0) +
        Number(m[2] || 0);
    if (w.kind === "melee" && damage !== null)
      damage += sizeDamage(swarm ? "Average" : size, sb);
    attacks.push({
      key: g.key,
      name: w.name,
      skill,
      damage,
      text: [w.reach, w.qualities].filter(Boolean).join(" · "),
      origin: "GM",
      ranged: w.kind === "ranged",
    });
  }
  for (const t of traits.filter((t) => t.origin === "GM" || t.deriveAttack)) {
    if (attacks.some((a) => base(a.name) === t.name)) continue;
    let damage,
      score = stats.WS,
      text = "Free Attack",
      ranged = false;
    if (t.name === "Bite") damage = Number(t.value) || null;
    if (t.name === "Horns") {
      damage = sb + 4;
      text = "Free Attack when Charging";
    }
    if (t.name === "Tail") damage = sb + 2;
    if (t.name === "Tentacles") damage = sb;
    if (t.name === "Tongue") {
      damage = sb;
      ranged = true;
      score = stats.BS;
      text = "3 yards; 12 yards above Large · Free Attack";
    }
    if (t.name === "Vomit") {
      damage = (tb || 0) + 4;
      ranged = true;
      score = stats.BS;
      text =
        "2 yards · Easy (+4 SL) · replaces Move and Action · once per 12 hours";
    }
    if (t.name === "Breath") {
      damage = {
        Acid: (bonus(stats.T) || 0) + 4,
        Cold: sb + 2,
        Electricity: sb + 2,
        Fire: sb + 3,
        Poison: (bonus(stats.T) || 0) + 2,
        Smoke: null,
      }[t.value];
      ranged = true;
      score = stats.BS ?? 30;
      text = `${20 + (bonus(stats.T) || 0)} yards · ${t.value} · Magical Free Attack`;
    }
    if (damage !== undefined || t.name === "Breath")
      attacks.push({
        key: t.key,
        name: rowName(t),
        skill: score,
        damage,
        text,
        origin: "Trait",
        ranged,
        free: true,
      });
  }
  const mighty = talents
      .filter(
        (t) => base(t.name) === "Strike Mighty Blow" && t.origin !== "Printed",
      )
      .reduce((n, t) => n + t.ranks, 0),
    accurate = talents
      .filter((t) => base(t.name) === "Accurate Shot" && t.origin !== "Printed")
      .reduce((n, t) => n + t.ranks, 0);
  for (const a of attacks) {
    const override = s.attackOverrides[a.key] || {};
    if (own(override, "skill")) a.skill = override.skill;
    if (own(override, "damage")) a.damage = override.damage;
    if (a.damage !== null && !own(override, "damage"))
      a.damage += a.ranged ? accurate : mighty;
    if (a.damage !== null && a.skill === null)
      add(`${a.name} needs an attack score.`, 2, `#attack-${a.key}`);
    if (
      (a.skill !== null && !number(a.skill)) ||
      (a.damage !== null && !number(a.damage))
    )
      add(
        `${a.name} needs nonnegative whole-number attack values.`,
        2,
        `#attack-${a.key}`,
      );
  }
  let armour = live(
    p.armour.filter((a) => !a.optional || s.optionalArmour.includes(a.key)),
  );
  for (const g of gear.filter((g) =>
    R.armour.some((a) => a.contentId === g.id),
  )) {
    const a = g.entry;
    if (
      p.hitLocations &&
      !a.quick &&
      /\bArms\b|\bLegs\b/.test(a.locations) &&
      !a.locations.includes("Forelegs")
    )
      add(
        `${a.name} uses humanoid limb locations. Remove it or use armour with supported mount coverage; the creator does not assume which legs it protects.`,
        2,
        `#gear-${g.key}`,
        "armour.locations",
      );
    armour.push({
      ...a,
      key: g.key,
      origin: "GM",
      shield: a.locations === "Shield",
    });
  }
  const ap = Object.fromEntries(
      (p.hitLocations || ["Head", "Arms", "Body", "Legs"]).map((loc) => [
        loc,
        0,
      ]),
    ),
    layers = {};
  const quick = armour.some((a) => a.quick);
  for (const a of armour.filter((a) => !a.shield)) {
    const natural = /Hide|Scales|Bark/.test(a.name);
    if (quick && !a.quick && !natural) {
      warnings.push(
        "Quick Armour replaces detailed armour; they are not stacked (p. 307).",
      );
      continue;
    }
    const layer = natural
      ? "natural"
      : a.quick
        ? "quick"
        : a.name.startsWith("Leather")
          ? "leather"
          : a.name.startsWith("Mail")
            ? "mail"
            : a.origin === "Printed"
              ? "printed"
              : "plate";
    for (const loc of Object.keys(ap))
      if (a.locations.includes(loc) || (a.quick && p.hitLocations))
        layers[`${layer}:${loc}`] = Math.max(
          layers[`${layer}:${loc}`] || 0,
          a.ap,
        );
  }
  for (const [k, v] of Object.entries(layers)) ap[k.split(":")[1]] += v;
  if (
    template?.armour &&
    !s.removed.includes(templateRowKey(template, "armour", 0))
  ) {
    for (const loc of Object.keys(ap)) ap[loc] += template.armour;
    armour.push({
      name: "Skeletal protection",
      ap: template.armour,
      locations: Object.keys(ap).join(", "),
      key: templateRowKey(template, "armour", 0),
      origin: "Template",
    });
  }
  const spells = gmSpellCatalogue(R).filter(
    (spell) =>
      ([...p.spells, ...s.spells].includes(spell.contentId) ||
        (spell.category === "Technique" &&
          spell.name === "Ritual of Cleansing" &&
          talents.some((t) => t.name === "Sword-dancing"))) &&
      !s.removed.includes(spell.contentId),
  );
  const result = {
    profile: p,
    name: s.name.trim() || p.name,
    description: s.description,
    template,
    stats,
    size: swarm ? p.size : size,
    swarm,
    tb,
    wounds,
    skills: [...skills.values()].sort((a, b) => a.name.localeCompare(b.name)),
    talents: [
      ...new Map(
        talents.map((t) => [
          t.name,
          talents
            .filter((x) => x.name === t.name)
            .reduce((a, b) => (a.ranks >= b.ranks ? a : b)),
        ]),
      ).values(),
    ].map((t) => {
      const definition = talentInfo(R, t.name);
      return definition?.adaptation
        ? {
            ...t,
            adaptation: definition.adaptation,
            source: definition.source,
            page: definition.page,
          }
        : t;
    }),
    traits: describeTraits(
      p,
      supplementAbilityText(traits).map((t) =>
        t.name === "Size" ? { ...t, value: size } : t,
      ),
    ),
    optionalTraits: [...p.optionalTraits, ...(template?.optionalTraits || [])],
    attacks: attacks.map((a) => ({
      ...a,
      text: (a.text || "").replace(/^\s*[,;]\s*/, ""),
    })),
    armour,
    trappings: p.linkedTrappings
      ? armour
          .filter((a) => a.origin === "Printed" && a.trapping)
          .map((a) => a.trapping)
          .join("; ")
      : [p.sections.Trappings, template?.trappings].filter(Boolean).join("; "),
    ap,
    shield: Math.max(0, ...armour.filter((a) => a.shield).map((a) => a.ap)),
    spells,
    gear,
    mutations,
    issues,
    warnings,
    changed,
  };
  templateIssues(
    template,
    p,
    stats,
    talents,
    templateSkills,
    spells,
    grantedGear,
    add,
  );
  result.undeadRidingOptions = [];
  if (
    ["core:creatures:zombie", "core:creatures:skeleton"].includes(p.id) &&
    traits.some((x) => x.name === "Undead")
  )
    result.undeadRidingOptions.push(
      "Ride (Rotting Mount)",
      "Ride (Skeletal Steed)",
    );
  if (talents.some((x) => x.name === "Arcane Magic (Necromancy)"))
    result.undeadRidingOptions.push("Ride (Corpse Cart)");
  result.runes = knownRunes(
    R,
    s,
    result.talents.map((t) => t.name),
  );
  result.magicLores = [...gmMagicLores(R, result)];
  result.spells = result.spells.map((x) => ({
    ...x,
    lore:
      x.category === "Arcane" ? s.spellLores?.[x.contentId] || "" : x.category,
  }));
  const cantResult = calculateGMCants(R, s, result);
  result.cants = cantResult.cants;
  result.cantGrants = cantResult.grants;
  issues.push(...cantResult.issues);
  const allowed = magicChoices(R, result);
  const loreChoices = [
    ...result.talents.map((t) => ({
      lore: magicLore(t.name),
      target: "#gm-tab-2",
    })),
    ...result.traits
      .filter((t) => t.name === "Spellcaster")
      .flatMap((t) =>
        parts(t.value).map((lore) => ({
          lore: lore.replace(/^Lore of /, ""),
          target: `#trait-${t.key}`,
        })),
      ),
  ];
  for (const { lore, target } of loreChoices) {
    const reason = lore && gmLoreIssue(R, p, lore);
    if (reason)
      issues.push({
        code: "magic.species",
        message: reason,
        severity: "error",
        source: {
          book: "archives-ii",
          page: lore === "The Great Maw" ? 32 : 31,
        },
        control: { step: 1, target },
      });
  }
  if (gmSpecies(p) === "Ogre" && R.species.Ogre?.mechanics) {
    warnings.push(R.species.Ogre.mechanics.gmApproval);
    if (loreChoices.some(({ lore }) => lore))
      warnings.push(
        ...R.species.Ogre.mechanics.magicReferences
          .filter(
            (x) => !x.lore || loreChoices.some(({ lore }) => lore === x.lore),
          )
          .map((x) => `${x.text} (Archives II p. ${x.page})`),
      );
  }
  for (const id of s.spells)
    if (!allowed.some((x) => x.contentId === id))
      add(
        "A selected spell needs a matching magical Lore or deity.",
        2,
        "#gm-magic",
        "magic.lore",
      );
  if (template?.magic) {
    const petty = spells.filter((x) => x.category === "Petty").length,
      lore = spells.filter(
        (x) =>
          x.category !== "Petty" &&
          x.category !== "Technique" &&
          !x.ritual &&
          x.category !== "Blessing" &&
          !R.config.gods.includes(x.category),
      ).length;
    if (petty > template.magic.petty || lore > template.magic.lore)
      add(
        `${template.name} allows up to ${template.magic.petty} Petty and ${template.magic.lore} Lore spells.`,
        2,
        "#gm-magic",
        "magic.count",
      );
  }
  if (s.size === "Large" && p.name === "Giant Spider")
    warnings.push(
      "The general Size rule gives Fangs +8. The p. 361 worked example gives +5, omitting the additional Size damage; the user chose the general rule.",
    );
  const patronTalents = [
    ...result.talents.map((t) => t.name),
    ...result.traits
      .filter((t) => ["Blessed", "Miracles"].includes(t.name))
      .map((t) => `${t.name === "Blessed" ? "Bless" : "Invoke"} (${t.value})`),
  ];
  warnings.push(
    ...divineReferencesForTalents(R, patronTalents).map(
      (x) => `${x.text} (${x.source.book} p. ${x.source.page})`,
    ),
  );
  warnings.push(...p.notes, ...(template?.notes || []));
  warnings.push(
    ...[
      p,
      ...(template ? [template] : []),
      ...result.traits,
      ...result.attacks,
      ...result.talents,
      ...result.spells,
    ]
      .map((x) => x.adaptation)
      .filter(Boolean),
  );
  warnings.push(...result.traits.map((t) => t.descriptionNote).filter(Boolean));
  if (
    traits.some((t) => t.name === "Venom") &&
    /avoid|pass.*Endurance/.test(p.sections.Traits || "")
  )
    warnings.push(
      "Venom uses the full p. 363 rule: Wounds inflict Poisoned; the Difficulty applies to recovery. Some profile summaries conflict.",
    );
  if (template)
    warnings.push(
      "Template Skill bonuses use the higher of the printed bonus and template bonus, following the user-approved interpretation. Printed worked examples may differ.",
    );
  result.warnings = [...new Set(warnings)];
  return result;
}
