import { speciesEntry } from "./catalogue.mjs";
import { KEYS, die } from "../rules.mjs";
import {
  characteristicBonus,
  woundFormula,
} from "../creature-calculations.mjs";
import { GROUPS } from "./catalogue.mjs";

export const TYPE = "wfrp-marijan",
  SCHEMA = 1;
export const SIZES = [
  "Tiny",
  "Small",
  "Average",
  "Large",
  "Enormous",
  "Monstrous",
];
export const AUTO_FIELDS = [
  "wounds",
  "movement",
  "capacity",
  "enc",
  "head",
  "arms",
  "body",
  "legs",
  "shield",
];
export const uid = () => crypto.randomUUID();
export function freshMarijan() {
  return {
    type: TYPE,
    schemaVersion: SCHEMA,
    id: uid(),
    name: "",
    species: "Human",
    origin: "",
    career: "",
    level: 1,
    appearance: "",
    ambition: "",
    partyAmbition: "",
    notes: "",
    status: "",
    standing: 0,
    fate: 0,
    fortune: 0,
    sin: 0,
    corruption: 0,
    xpSpent: 0,
    xpUnspent: 0,
    tracker: 0,
    coins: { gc: 0, ss: 0, d: 0 },
    size: "Average",
    baseMovement: 4,
    talentEffects: true,
    sturdyRule: "creation",
    characteristics: Object.fromEntries(
      KEYS.map((k) => [k, { initial: 0, advances: 0, modifier: 0 }]),
    ),
    overrides: Object.fromEntries(AUTO_FIELDS.map((k) => [k, null])),
    entries: Object.fromEntries(GROUPS.map((k) => [k, []])),
    rolls: [],
    copiedFrom: "",
  };
}
const text = (x) => typeof x === "string";
const number = (x) => typeof x === "number" && Number.isFinite(x);
const nullable = (x) => x === null || number(x);
export function validateMarijan(s) {
  const fail = () => {
    throw Error(
      "Choose a valid Marijan Mode save. Player saves can be copied with Copy player character.",
    );
  };
  if (!s || s.type !== TYPE || s.schemaVersion !== SCHEMA || !text(s.id))
    fail();
  for (const k of [
    "name",
    "species",
    "origin",
    "career",
    "appearance",
    "ambition",
    "partyAmbition",
    "notes",
    "status",
    "copiedFrom",
  ])
    if (!text(s[k])) fail();
  for (const k of [
    "level",
    "standing",
    "fate",
    "fortune",
    "sin",
    "corruption",
    "xpSpent",
    "xpUnspent",
    "tracker",
    "baseMovement",
  ])
    if (!number(s[k])) fail();
  if (
    !SIZES.includes(s.size) ||
    typeof s.talentEffects !== "boolean" ||
    !["creation", "talent"].includes(s.sturdyRule)
  )
    fail();
  for (const k of KEYS)
    for (const f of ["initial", "advances", "modifier"])
      if (!number(s.characteristics?.[k]?.[f])) fail();
  for (const k of ["gc", "ss", "d"]) if (!number(s.coins?.[k])) fail();
  for (const k of AUTO_FIELDS) if (!nullable(s.overrides?.[k])) fail();
  const keys = new Set();
  for (const group of GROUPS) {
    if (!Array.isArray(s.entries?.[group])) fail();
    for (const x of s.entries[group]) {
      if (
        !x ||
        !text(x.key) ||
        !/^[a-zA-Z0-9-]+$/.test(x.key) ||
        keys.has(x.key) ||
        !text(x.name) ||
        !text(x.kind) ||
        !text(x.text) ||
        !text(x.id) ||
        typeof x.custom !== "boolean"
      )
        fail();
      keys.add(x.key);
      for (const k of ["amount"]) if (!number(x[k])) fail();
      for (const k of ["total", "enc", "ap"]) if (!nullable(x[k])) fail();
      for (const k of [
        "char",
        "state",
        "rating",
        "damage",
        "locations",
        "qualities",
        "category",
        "lore",
        "cn",
        "range",
        "target",
        "duration",
      ])
        if (!text(x[k])) fail();
      if (group === "skills" && !KEYS.includes(x.char)) fail();
      if (
        group === "gear" &&
        !["equipped", "worn", "carried", "stored"].includes(x.state)
      )
        fail();
      if (
        x.source &&
        (!text(x.source.book) ||
          !["string", "number"].includes(typeof x.source.page))
      )
        fail();
    }
  }
  if (
    !Array.isArray(s.rolls) ||
    s.rolls.some(
      (r) =>
        !r ||
        !text(r.label) ||
        !text(r.at) ||
        !Array.isArray(r.faces) ||
        r.faces.some((n) => !Number.isInteger(n) || n < 1 || n > 10),
    )
  )
    fail();
  return structuredClone(s);
}
export function makeEntry(row, group) {
  return {
    ...row,
    id: row.id || uid(),
    key: uid(),
    name: row.name || "Custom entry",
    kind:
      row.kind ||
      {
        skills: "skill",
        talents: "talent",
        magic: "spell",
        gear: "gear",
        extras: "trait",
      }[group],
    custom: !!row.custom,
    text: row.text || "",
    amount: group === "skills" ? 0 : 1,
    char: row.char || "Int",
    total: null,
    enc: Number.isFinite(row.enc) ? row.enc : null,
    ap: Number.isFinite(row.ap) ? row.ap : null,
    damage: String(row.damage ?? ""),
    locations: String(row.locations || ""),
    qualities: Array.isArray(row.qualities)
      ? row.qualities.join(", ")
      : String(row.qualities || ""),
    category: row.category || "",
    lore: row.lore || "",
    cn: String(row.cn ?? ""),
    range: String(row.range ?? ""),
    target: String(row.target ?? ""),
    duration: String(row.duration ?? ""),
    rating: "",
    state:
      row.kind === "armour"
        ? "worn"
        : row.kind === "weapon"
          ? "equipped"
          : "carried",
  };
}
export function addEntry(s, group, row) {
  const old = s.entries[group].find((x) => x.id === row.id && !x.custom);
  if (old) {
    if (["talents", "gear"].includes(group)) old.amount++;
    return old.key;
  }
  const entry = makeEntry(row, group);
  s.entries[group].push(entry);
  return entry.key;
}
export function calculateMarijan(catalogue, s) {
  const talents = s.entries.talents.filter((x) => !x.custom && x.amount > 0),
    has = (name) => talents.some((x) => x.name === name),
    effects = catalogue.R.config.talentEffects,
    stats = Object.fromEntries(
      KEYS.map((k) => [
        k,
        s.characteristics[k].initial +
          s.characteristics[k].advances +
          s.characteristics[k].modifier +
          (s.talentEffects && talents.some((x) => effects[x.name] === k)
            ? 5
            : 0),
      ]),
    ),
    sb = characteristicBonus(stats.S),
    tb = characteristicBonus(stats.T),
    wpb = characteristicBonus(stats.WP),
    sturdy =
      s.sturdyRule === "creation"
        ? s.species === "Dwarf" || has("Sturdy")
        : has("Sturdy"),
    back = talents.find((x) => x.name === "Strong Back")?.amount || 0;
  let capacity = sb + tb;
  if (sturdy)
    capacity = s.sturdyRule === "creation" ? capacity * 2 : capacity + sb;
  capacity += back >= 2 ? 3 : back >= 1 ? 1 : 0;
  capacity *=
    speciesEntry(catalogue, s.species)?.mechanics?.capacityMultiplier || 1;
  const active = s.entries.gear.filter(
      (x) => x.state !== "stored" && x.amount !== 0,
    ),
    unknown = active.filter((x) => x.enc === null),
    enc = unknown.length
      ? null
      : active.reduce((n, x) => n + x.enc * x.amount, 0),
    auto = {
      wounds: woundFormula(stats, s.size, false, false, has("Hardy") ? 1 : 0),
      movement:
        s.baseMovement + (s.talentEffects && has("Fleet-footed") ? 1 : 0),
      capacity,
      enc,
      head: 0,
      arms: 0,
      body: 0,
      legs: 0,
      shield: 0,
    };
  for (const x of active.filter(
    (x) => x.kind === "armour" && ["worn", "equipped"].includes(x.state),
  )) {
    for (const [key, label] of [
      ["head", "Head"],
      ["arms", "Arm"],
      ["body", "Body"],
      ["legs", "Leg"],
      ["shield", "Shield"],
    ])
      if (x.locations.includes(label))
        auto[key] =
          auto[key] === null || x.ap === null ? null : auto[key] + x.ap;
  }
  const values = Object.fromEntries(
      AUTO_FIELDS.map((k) => [k, s.overrides[k] ?? auto[k]]),
    ),
    skills = s.entries.skills.map((x) => ({
      ...x,
      total: x.total ?? stats[x.char] + x.amount,
    })),
    career = catalogue.careers.find(
      (c) => c.contentId === s.career || c.id === s.career,
    ),
    warnings = [];
  if (s.size === "Tiny" && s.overrides.wounds === null)
    warnings.push(
      "Tiny has no printed Wounds formula. Set manual Wounds or leave the field blank.",
    );
  if (unknown.length && s.overrides.enc === null)
    warnings.push(
      `Unknown listed Enc: ${unknown.map((x) => x.name).join(", ")}. The total remains blank.`,
    );
  if (s.entries.gear.length)
    warnings.push(
      "Listed Enc totals exclude stored items and coin weight; packing reductions, armour layering and load penalties are not automated here.",
    );
  if (s.entries.extras.length)
    warnings.push(
      "Traits, mutations, runes and techniques are recorded references. Their effects are not applied automatically.",
    );
  for (const x of talents.filter((x) => x.amount > 1 && effects[x.name]))
    warnings.push(
      `${x.name}: its printed +5 Characteristic benefit is applied once; extra unrestricted ranks have no invented effect.`,
    );
  return {
    stats,
    sb,
    tb,
    wpb,
    skills,
    auto,
    values,
    career,
    xpTotal: s.xpSpent + s.xpUnspent,
    warnings,
  };
}
export function applySpeciesDefaults(catalogue, s) {
  const sp = speciesEntry(catalogue, s.species);
  if (!sp) return;
  for (const k of KEYS) s.characteristics[k].initial = sp.offsets[k];
  s.fate = sp.fate;
  s.fortune = sp.fortune;
  s.baseMovement = sp.movement;
  s.size = sp.mechanics?.size || "Average";
}
export function rollCharacteristics(s, catalogue, source = globalThis.crypto) {
  for (const k of KEYS) {
    const faces = [die(10, source), die(10, source)];
    s.characteristics[k].initial =
      (speciesEntry(catalogue, s.species)?.offsets[k] || 0) +
      faces.reduce((a, b) => a + b, 0);
    s.rolls.push({
      label: `${k} starting roll (2d10 + Species modifier)`,
      faces,
      at: new Date().toISOString(),
    });
  }
}
export function fromPlayer(catalogue, pc, result, pcRules) {
  const s = freshMarijan(),
    d = result.derived;
  Object.assign(s, {
    name: pc.name || "",
    species: pc.species,
    origin: pc.origin || "",
    appearance: pc.appearance || "",
    ambition: pc.ambition || "",
    partyAmbition: pc.partyAmbition || "",
    notes: pc.notes || "",
    career: result.career.contentId,
    level: d.level,
    status: result.career.levels[d.level - 1].status,
    standing: result.career.levels[d.level - 1].standing,
    fate: d.fate,
    fortune: d.fortune,
    size: d.size,
    baseMovement: d.movement,
    xpSpent: d.spent,
    xpUnspent: d.remaining,
    tracker: d.trackers.reduce((a, b) => a + b, 0),
    coins: { ...result.wallet.coins },
    talentEffects: false,
    copiedFrom:
      "Player creator snapshot; original character and XP history unchanged.",
  });
  for (const k of KEYS)
    s.characteristics[k] = {
      initial: d.stats[k] - d.charAdv[k],
      advances: d.charAdv[k],
      modifier: 0,
    };
  const add = (group, x) => {
    const row = catalogue.rows.find(
      (r) =>
        r.collection === group &&
        (r.name === x.name || r.name === x.alias) &&
        (!x.source?.book || r.source?.book === x.source.book),
    );
    const entry = makeEntry(
      row || { ...x, id: x.contentId || uid(), custom: true },
      group,
    );
    s.entries[group].push(entry);
    return entry;
  };
  for (const x of result.skills.filter((x) => x.adv)) {
    const e = add("skills", x);
    e.amount = x.adv;
    e.char = x.char;
    e.total = Number.isFinite(x.total) ? x.total : null;
  }
  for (const name of new Set(d.talents)) {
    const e = add("talents", {
      name,
      ...pcRules.talents.find((t) => t.name === name),
    });
    e.name = name;
    e.amount = d.talents.filter((t) => t === name).length;
  }
  for (const x of result.spells) add("magic", x);
  for (const x of result.cants) {
    const e = add("magic", x);
    e.kind = "cant";
  }
  for (const x of [...result.runes, ...result.techniques]) add("extras", x);
  for (const x of result.equipment.entries) {
    const e = add("gear", x);
    e.name = x.name;
    e.amount = x.quantity ?? 1;
    e.enc = Number.isFinite(x.enc) ? x.enc : null;
    if (x.armour) {
      e.kind = "armour";
      e.ap = x.armour.ap;
      e.locations = x.armour.locations;
      e.qualities = x.armour.qualities || "";
    }
    if (x.weapon) {
      e.kind = "weapon";
      e.damage = String(x.weapon.damage);
      e.group = x.weapon.group;
      e.qualities = x.weapon.qualities || "";
    }
    if (x.quantity === null)
      e.text +=
        "\nThe copied printed quantity is unresolved; one reference entry is recorded, not a verified item quantity.";
    e.state = x.worn ? "worn" : x.weapon ? "equipped" : "carried";
  }
  for (const k of AUTO_FIELDS)
    s.overrides[k] =
      {
        wounds: d.wounds,
        movement: d.movement,
        capacity: d.capacity,
        enc: result.equipment.total,
        head: result.equipment.ap.Head,
        arms: result.equipment.ap.Arms,
        body: result.equipment.ap.Body,
        legs: result.equipment.ap.Legs,
        shield: result.equipment.ap.Shield,
      }[k] ?? null;
  return s;
}
