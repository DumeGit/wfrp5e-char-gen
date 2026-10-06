import { bookSelection } from "./books.mjs";
import { NPC_KEYS } from "./bestiary-content.mjs";
import { NPC_SECTIONS } from "./npc-flow.mjs";
import * as M from "./rules.mjs";
import {
  printedArmour,
  armourOptions,
  profileFeatures,
} from "./npc-profile.mjs";
export function freshNPC(R, profile = R.creatures[0].contentId) {
  const p = R.creatures.find((x) => x.contentId === profile);
  if (!p) throw Error("Choose an available creature profile.");
  return {
    kind: "npc",
    version: 1,
    books: bookSelection(R),
    profile,
    name: p.name,
    notes: "",
    anatomy: "Standard",
    step: 0,
    template: "",
    templateSkills: {},
    templateTalents: {},
    overrides: {},
    characteristicRolls: {},
    size: p.size,
    traits: [],
    removedTraits: [],
    skills: [],
    removedSkills: [],
    talents: [],
    removedTalents: [],
    optionalAttacks: [],
    removedAttacks: [],
    attackOverrides: {},
    optionalArmour: [],
    removedArmour: [],
    gear: [],
    spells: [],
    removedSpells: [],
    mutations: [],
    trainingRoll: null,
    markRoll: null,
    tbMode:
      p.toughnessBonus !== null &&
      p.toughnessBonus !== Math.floor(p.stats.T / 10)
        ? "printed"
        : "calculate",
    tbOverride: null,
    advanceCounts: { char: {}, skill: {} },
    career: "",
    careerLevel: 1,
    xpBudget: 1000,
    ledger: [],
    rolls: [],
    changes: [],
  };
}
const obj = (x) => x && typeof x === "object" && !Array.isArray(x);
const safeNum = (x) => Number.isInteger(x) && x >= 0 && x <= 1000000;
export function validateNPCState(R, s) {
  const fresh = freshNPC(R);
  if (
    !obj(s) ||
    s.kind !== "npc" ||
    s.version !== 1 ||
    Object.keys(s).some((k) => !(k in fresh))
  )
    throw Error("This is not a supported NPC creation file.");
  if (
    Object.keys(fresh).some((k) => !(k in s)) ||
    JSON.stringify(s.books) !== JSON.stringify(bookSelection(R))
  )
    throw Error("The NPC file needs the current selected book versions.");
  if (
    !R.creatures.some((x) => x.contentId === s.profile) ||
    typeof s.name !== "string" ||
    typeof s.notes !== "string" ||
    !safeNum(s.xpBudget) ||
    !Number.isInteger(s.step) ||
    s.step < 0 ||
    s.step >= NPC_SECTIONS.length ||
    ![1, 2, 3, 4].includes(s.careerLevel)
  )
    throw Error("Invalid NPC profile or creation settings.");
  if (
    (s.template && !R.templates.some((x) => x.contentId === s.template)) ||
    (s.career && !R.careers.some((x) => x.id === s.career))
  )
    throw Error("The saved template or Career is unavailable.");
  if (
    !obj(s.overrides) ||
    Object.entries(s.overrides).some(
      ([k, v]) => !NPC_KEYS.includes(k) || (v !== null && !safeNum(v)),
    ) ||
    !["Small", "Average", "Large", "Enormous", "Monstrous", "Tiny"].includes(
      s.size,
    ) ||
    !["printed", "calculate", "manual"].includes(s.tbMode) ||
    (s.tbOverride !== null && !safeNum(s.tbOverride))
  )
    throw Error("Invalid NPC score adjustment.");
  for (const k of [
    "traits",
    "removedTraits",
    "skills",
    "removedSkills",
    "talents",
    "removedTalents",
    "optionalAttacks",
    "removedAttacks",
    "optionalArmour",
    "removedArmour",
    "gear",
    "spells",
    "removedSpells",
    "mutations",
    "ledger",
    "rolls",
    "changes",
  ])
    if (!Array.isArray(s[k]) || s[k].length > 5000)
      throw Error(`Invalid NPC ${k}.`);
  if (
    !obj(s.advanceCounts) ||
    !obj(s.advanceCounts.char) ||
    !obj(s.advanceCounts.skill) ||
    Object.values(s.advanceCounts).some((group) =>
      Object.values(group).some((x) => !safeNum(x)),
    )
  )
    throw Error("Invalid starting Advance counts.");
  for (const k of ["templateSkills", "templateTalents", "attackOverrides"])
    if (
      !obj(s[k]) ||
      Object.keys(s[k]).some((x) =>
        ["__proto__", "constructor", "prototype"].includes(x),
      )
    )
      throw Error(`Invalid NPC ${k}.`);
  for (const t of s.traits)
    if (
      !obj(t) ||
      !R.traits.some((x) => x.contentId === t.id) ||
      typeof t.value !== "string"
    )
      throw Error("An NPC Trait is unavailable or malformed.");
  for (const m of s.mutations)
    if (!R.mutations.some((x) => x.contentId === m.id))
      throw Error("An NPC Mutation is unavailable.");
  for (const g of s.gear)
    if (
      ![...R.weapons, ...R.armour, ...R.gear, ...R.market].some(
        (x) => x.contentId === g.id,
      ) ||
      !safeNum(g.quantity) ||
      g.quantity < 1
    )
      throw Error("Invalid NPC equipment.");
  for (const x of s.skills)
    if (
      typeof x.name !== "string" ||
      !safeNum(x.bonus) ||
      !R.skills.some((y) => y.name === x.name.split(" (")[0])
    )
      throw Error("Invalid NPC Skill.");
  for (const x of s.talents)
    if (
      typeof x.name !== "string" ||
      !M.talentInfo(R, x.name) ||
      !safeNum(x.ranks) ||
      x.ranks < 1
    )
      throw Error("Invalid NPC Talent.");
  for (const x of s.spells)
    if (
      !R.spells.some((y) => y.contentId === x.id) ||
      typeof x.lore !== "string"
    )
      throw Error("Invalid NPC magic.");
  for (const x of s.ledger)
    if (
      !["char", "skill", "talent", "spell"].includes(x.type) ||
      typeof x.name !== "string" ||
      !safeNum(x.cost) ||
      ![1, 5].includes(x.amount)
    )
      throw Error("Invalid NPC XP entry.");
  for (const k of ["trainingRoll", "markRoll"])
    if (
      s[k] !== null &&
      (!obj(s[k]) ||
        !Array.isArray(s[k].faces) ||
        s[k].faces.length !== (k === "trainingRoll" ? 2 : 1) ||
        s[k].faces.some((x) => !Number.isInteger(x) || x < 1 || x > 10) ||
        (k === "markRoll" && !["Mental", "Physical"].includes(s[k].start)))
    )
      throw Error("Invalid NPC recorded roll.");
  const p = R.creatures.find((x) => x.contentId === s.profile);
  for (const k of [
    "removedTraits",
    "removedTalents",
    "removedSkills",
    "optionalAttacks",
    "removedAttacks",
    "optionalArmour",
    "removedArmour",
    "removedSpells",
  ])
    if (
      s[k].some((x) => typeof x !== "string") ||
      new Set(s[k]).size !== s[k].length
    )
      throw Error(`Invalid NPC ${k} references.`);
  if (
    s.removedSkills.some((n) => !p.skills.some((x) => x.name === n)) ||
    s.removedTraits.some((id) => !R.traits.some((t) => t.contentId === id)) ||
    s.removedSpells.some((id) => !R.spells.some((x) => x.contentId === id))
  )
    throw Error("Unknown removed NPC content.");
  const attacks = p.attacks.map((a, i) => `printed-attack-${i}`);
  const optional = p.attacks.flatMap((a, i) =>
    a.optional ? [`printed-attack-${i}`] : [],
  );
  const addedWeapons = s.gear
    .filter((g) => R.weapons.some((w) => w.contentId === g.id))
    .map((g) => g.id);
  if (
    s.optionalAttacks.some((id) => !optional.includes(id)) ||
    s.removedAttacks.some((id) => !attacks.includes(id)) ||
    s.optionalArmour.some((id) => !armourOptions(p).some((a) => a.id === id)) ||
    s.removedArmour.some((id) => !printedArmour(p).some((a) => a.id === id)) ||
    s.removedTalents.some(
      (name) => !profileFeatures(R, p, "talent").some((t) => t.name === name),
    ) ||
    Object.keys(s.advanceCounts.char).some((k) => !M.KEYS.includes(k)) ||
    Object.keys(s.advanceCounts.skill).some((n) => !M.skillInfo(R, n))
  )
    throw Error("Unknown NPC adjustment reference.");
  // Calculated Trait attacks use stable trait-attack-<id> identifiers.
  if (
    Object.keys(s.attackOverrides).some(
      (id) =>
        !attacks.includes(id) &&
        !addedWeapons.includes(id) &&
        !R.traits.some((t) => id === `trait-attack-${t.contentId}`),
    )
  )
    throw Error("Unknown NPC attack override.");
  for (const [key, slots] of Object.entries(s.templateSkills))
    if (
      !Array.isArray(slots) ||
      slots.some((x) => typeof x !== "string") ||
      slots.length > 10 ||
      (key !== "trait-wind" && !/^\d+$/.test(key))
    )
      throw Error("Invalid NPC template Skill choices.");
  if (Object.values(s.templateTalents).some((x) => typeof x !== "string"))
    throw Error("Invalid NPC template Talent choices.");
  for (const values of Object.values(s.attackOverrides))
    if (
      !obj(values) ||
      Object.entries(values).some(
        ([k, v]) =>
          !["skill", "damage"].includes(k) || (v !== null && !safeNum(v)),
      )
    )
      throw Error("Invalid NPC attack override.");
  for (const x of s.mutations)
    if (!["GM", "mark"].includes(x.origin) || typeof x.location !== "string")
      throw Error("Invalid NPC Mutation choice.");
  for (const x of s.rolls)
    if (
      !obj(x) ||
      typeof x.at !== "string" ||
      typeof x.label !== "string" ||
      typeof x.dice !== "string" ||
      !Array.isArray(x.values) ||
      x.values.some((n) => !Number.isInteger(n) || n < 1 || n > 100) ||
      x.values.length > 20 ||
      x.total !== x.values.reduce((a, b) => a + b, 0)
    )
      throw Error("Invalid NPC recorded dice history.");
  if (
    s.changes.some(
      (x) => !obj(x) || typeof x.label !== "string" || typeof x.at !== "string",
    )
  )
    throw Error("Invalid NPC edit history.");
  for (const x of s.ledger)
    if (
      !obj(x.source) ||
      x.source.book !== "core" ||
      !Number.isInteger(x.source.page) ||
      typeof x.at !== "string" ||
      (x.type === "char" && !M.KEYS.includes(x.name)) ||
      (x.type === "skill" && !M.skillInfo(R, x.name)) ||
      (x.type === "talent" && !M.talentInfo(R, x.name)) ||
      (x.type === "spell" &&
        (!R.spells.some((e) => e.contentId === x.contentId) ||
          typeof x.lore !== "string")) ||
      (["talent", "spell"].includes(x.type) && x.amount !== 1)
    )
      throw Error("Invalid NPC paid development reference.");
  if (
    !["Standard", "Quadruped", "Bird", "Snake", "Spider", "Other"].includes(
      s.anatomy,
    )
  )
    throw Error("Invalid creature anatomy.");
  const paid = {};
  if (
    !obj(s.characteristicRolls) ||
    Object.entries(s.characteristicRolls).some(
      ([k, v]) =>
        !M.KEYS.includes(k) ||
        !Array.isArray(v) ||
        v.length !== 2 ||
        v.some((n) => !Number.isInteger(n) || n < 1 || n > 10),
    )
  )
    throw Error("Invalid NPC individualisation rolls.");
  for (const x of s.ledger) {
    if (!safeNum(x.startingAdvances))
      throw Error("An NPC purchase needs its recorded pricing count.");
    let expected;
    if (["char", "skill"].includes(x.type)) {
      const key = `${x.type}:${x.name}`,
        start = s.advanceCounts[x.type][x.name];
      if (
        !safeNum(start) ||
        x.startingAdvances !== start + (paid[key] || 0) ||
        (x.amount === 5 && x.startingAdvances % 5)
      )
        throw Error(
          "NPC XP history conflicts with its starting Advance counts.",
        );
      expected = (
        x.type === "char"
          ? x.amount === 1
            ? M.IND_CHAR_COST
            : M.CHAR_COST
          : x.amount === 1
            ? M.IND_SKILL_COST
            : M.SKILL_COST
      )[Math.floor(x.startingAdvances / 5)];
      paid[key] = (paid[key] || 0) + x.amount;
    } else if (x.type === "talent") expected = 100;
    else {
      const spell = R.spells.find((e) => e.contentId === x.contentId);
      expected =
        spell.category === "Petty"
          ? 50 * (Math.floor(x.startingAdvances / 5) + 1)
          : R.config.gods.includes(spell.category)
            ? 100 * (x.startingAdvances + 1)
            : 100 * (Math.floor(x.startingAdvances / 5) + 1);
    }
    if (x.cost !== expected)
      throw Error("An NPC XP entry disagrees with the printed price table.");
  }
  return s;
}
