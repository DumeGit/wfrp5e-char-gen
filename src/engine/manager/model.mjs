import * as M from "../rules.mjs";
import { catalogForCharacter } from "../books.mjs";
import { characterResult } from "../character-result.mjs";
import { equipment, itemWeight, recordAcquisition } from "../equipment.mjs";
import { equipmentSize } from "../equipment-sizing.mjs";
import { priceInPennies } from "../market.mjs";
import { careerAvailable } from "../origins.mjs";
import { elderCorruption } from "../high-elf.mjs";
import {
  calculateMarijan,
  freshMarijan,
  validateMarijan,
  fromPlayer,
  makeEntry,
  addEntry,
  AUTO_FIELDS,
} from "../marijan/model.mjs";

export const TYPE = "wfrp-manager";
export const SCHEMA = 1;
export const GROUPS = ["skills", "talents", "magic", "gear", "extras"];
const clone = (x) => structuredClone(x);
const uid = () => crypto.randomUUID();
const at = () => new Date().toISOString();
const numeric = (n) =>
  typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= 1e9;
function requireValue(ok, message = "This character contains invalid values.") {
  if (!ok) throw Error(message);
}
export function event(record, label, detail = "", kind = "change") {
  record.history.push({ id: uid(), at: at(), label, detail, kind });
}
export function freshManager() {
  const sheet = freshMarijan();
  sheet.type = "wfrp-character";
  sheet.copiedFrom = "";
  return {
    type: TYPE,
    schemaVersion: SCHEMA,
    id: uid(),
    revision: 0,
    createdAt: at(),
    updatedAt: at(),
    archived: false,
    favourite: false,
    sheet,
    context: {},
    adjustments: Object.fromEntries(AUTO_FIELDS.map((k) => [k, 0])),
    current: { wounds: null, fortune: 0 },
    conditions: [],
    afflictions: [],
    journal: [],
    history: [],
    purchases: [],
    trackerProgress: {},
    attachments: [],
  };
}
function workingSheet(record) {
  return { ...record.sheet, type: "wfrp-marijan" };
}
export function validateManager(input) {
  requireValue(
    input && input.type === TYPE && input.schemaVersion === SCHEMA,
    "Choose a supported manager character or library backup.",
  );
  const s = clone(input);
  // Schema-1 saves predating the status card have no affliction records.
  if (s.afflictions === undefined) s.afflictions = [];
  requireValue(Array.isArray(s.afflictions) && s.afflictions.length <= 500);
  const afflictionIds = new Set();
  for (const row of s.afflictions) {
    validateAffliction(row);
    requireValue(!afflictionIds.has(row.id));
    afflictionIds.add(row.id);
  }
  requireValue(typeof s.id === "string" && /^[a-zA-Z0-9-]{1,100}$/.test(s.id));
  requireValue(Number.isSafeInteger(s.revision) && s.revision >= 0);
  requireValue(
    typeof s.createdAt === "string" &&
      typeof s.updatedAt === "string" &&
      Number.isFinite(Date.parse(s.createdAt)) &&
      Number.isFinite(Date.parse(s.updatedAt)),
  );
  requireValue(
    typeof s.archived === "boolean" && typeof s.favourite === "boolean",
  );
  requireValue(s.sheet?.type === "wfrp-character");
  validateMarijan(workingSheet(s));
  requireValue(
    s.context && typeof s.context === "object" && !Array.isArray(s.context),
  );
  for (const k of AUTO_FIELDS) requireValue(numeric(s.adjustments?.[k]));
  for (const value of Object.values(s.current || {}))
    requireValue(value === null || (numeric(value) && value >= 0));
  requireValue(
    Object.hasOwn(s.current || {}, "wounds") && numeric(s.current.fortune),
  );
  for (const group of [
    "conditions",
    "journal",
    "history",
    "purchases",
    "attachments",
  ])
    requireValue(Array.isArray(s[group]));
  requireValue(
    s.history.length <= 50000 &&
      s.journal.length <= 10000 &&
      s.conditions.length <= 500,
  );
  for (const group of ["conditions", "journal", "history"]) {
    const seen = new Set();
    for (const row of s[group]) {
      requireValue(typeof row.id === "string" && !seen.has(row.id));
      seen.add(row.id);
      requireValue(
        typeof row.at === "string" && Number.isFinite(Date.parse(row.at)),
      );
      if (group === "conditions")
        requireValue(
          typeof row.name === "string" &&
            typeof row.note === "string" &&
            Number.isSafeInteger(row.amount) &&
            row.amount > 0,
        );
      if (group === "journal")
        requireValue(
          typeof row.title === "string" &&
            typeof row.text === "string" &&
            typeof row.kind === "string",
        );
      if (group === "history")
        requireValue(
          typeof row.label === "string" &&
            typeof row.detail === "string" &&
            typeof row.kind === "string",
        );
    }
  }
  requireValue(
    s.trackerProgress &&
      typeof s.trackerProgress === "object" &&
      Object.values(s.trackerProgress).every(
        (n) => Number.isSafeInteger(n) && n >= 0,
      ),
  );
  for (const p of s.purchases)
    requireValue(
      typeof p.id === "string" &&
        numeric(p.cost) &&
        p.cost >= 0 &&
        typeof p.name === "string" &&
        typeof p.type === "string" &&
        typeof p.at === "string" &&
        Number.isFinite(Date.parse(p.at)),
    );
  for (const attachment of s.attachments)
    requireValue(
      attachment &&
        typeof attachment.name === "string" &&
        attachment.data &&
        typeof attachment.data === "object",
    );
  if (s.portrait !== undefined)
    requireValue(
      typeof s.portrait === "string" &&
        /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(
          s.portrait,
        ) &&
        s.portrait.length <= 900000,
      "Choose a PNG, JPEG or WebP portrait smaller than 512 KB.",
    );
  // JSON-only values, finite bounded numbers and reasonable strings protect calculations
  // and storage without imposing creator allocation/rank restrictions on a character.
  const inspect = (value, depth = 0) => {
    requireValue(depth < 50);
    if (typeof value === "number") requireValue(numeric(value));
    if (typeof value === "string") requireValue(value.length <= 1000000);
    if (value && typeof value === "object")
      for (const [key, child] of Object.entries(value)) {
        requireValue(!["__proto__", "constructor", "prototype"].includes(key));
        inspect(child, depth + 1);
      }
  };
  inspect(s);
  return JSON.parse(JSON.stringify(s));
}
function ruleContext(catalogue, record) {
  const sheet = record.sheet;
  const selected = catalogue.careers.find(
    (c) => c.contentId === sheet.career || c.id === sheet.career,
  );
  // Put the exact source variant first so contextual Career helpers retain identity.
  const R = {
    ...catalogue.R,
    careers: selected
      ? [selected, ...catalogue.careers.filter((c) => c !== selected)]
      : catalogue.careers,
  };
  const s = {
    ...M.fresh(),
    ...record.context,
    species: sheet.species,
    origin: sheet.origin,
    career: selected?.id || "",
    sturdyRule: sheet.sturdyRule,
  };
  // Known magic is a quote context, never fabricated saved XP purchases.
  s.spells = sheet.entries.magic
    .filter((x) => x.kind === "spell")
    .map((x) => x.name);
  return { R, s, selected };
}
function inventory(catalogue, record, R, s) {
  return record.sheet.entries.gear
    .filter((x) => x.amount > 0 && x.state !== "stored")
    .map((x) => {
      const row = catalogue.rows.find((r) => r.id === x.id);
      const profile = x.profile || {};
      const name = profile.alias || x.name;
      const weaponProfile =
        R.weapons.find((w) => w.contentId === row?.contentId) ||
        R.weapons.find(
          (w) =>
            w.name === name &&
            (!x.source?.book || w.source?.book === x.source.book),
        );
      const weapon =
        x.kind === "weapon"
          ? {
              ...(profile.weapon || weaponProfile || row || {}),
              name: x.name,
              damage: x.damage,
              qualities: x.qualities || "",
            }
          : undefined;
      const armour =
        x.kind === "armour"
          ? {
              ...(profile.armour || row || {}),
              name: x.name,
              ap: x.ap,
              locations: x.locations,
              qualities: x.qualities || "",
            }
          : undefined;
      const capacity =
        profile.capacity ??
        R.config.containers[name] ??
        R.config.carriers[name] ??
        row?.capacity;
      const canWear =
        profile.canWear ??
        (row?.wearable ||
          x.kind === "armour" ||
          capacity !== undefined ||
          /Clothing|Uniform|Cloak|Boots|Hat|Robes/.test(name));
      return {
        ...profile,
        key: x.key,
        name: x.name,
        alias: name,
        quantity: x.amount,
        weapon,
        armour,
        enc: x.enc,
        canWear,
        capacity,
        carrier: profile.carrier ?? Object.hasOwn(R.config.carriers, name),
        placement: x.state,
        qualities: profile.qualities || [],
        flaws: profile.flaws || [],
        quick: armour?.quick,
        netMode: profile.netMode || "melee",
      };
    });
}
export function calculateManager(catalogue, record) {
  const sheet = record.sheet;
  const r = calculateMarijan(catalogue, workingSheet(record));
  const { R, s, selected } = ruleContext(catalogue, record);
  for (const k of ["wounds", "movement", "capacity"])
    if (sheet.overrides[k] === null && r.values[k] !== null)
      r.values[k] += record.adjustments[k];
  const talents = sheet.entries.talents.flatMap((x) =>
    Array.from(
      { length: Math.min(100, Math.max(0, Math.floor(x.amount))) },
      () => x.name,
    ),
  );
  const d = {
    stats: r.stats,
    talents,
    knownMagic: sheet.entries.magic
      .filter((x) => x.kind === "spell")
      .map((x) => ({
        ...catalogue.rows.find((row) => row.id === x.id),
        ...x,
        talent: x.learnedWith || "",
      })),
    sb: r.sb,
    tb: r.tb,
    wpb: r.wpb,
    capacity: r.values.capacity,
    movement: r.values.movement,
    level: sheet.level,
    size: sheet.size,
    charAdv: Object.fromEntries(
      M.KEYS.map((k) => [k, sheet.characteristics[k].advances]),
    ),
    skills: Object.fromEntries(
      sheet.entries.skills.map((x) => [x.name, x.amount / 5]),
    ),
    remaining: sheet.xpUnspent,
    earnedBoxes: sheet.tracker,
    trackerProgress: record.trackerProgress,
    ticks: Math.min(
      [10, 12, 14, 0][sheet.level - 1] || 0,
      Math.max(0, sheet.tracker - ([0, 10, 22, 36][sheet.level - 1] || 0)),
    ),
  };
  const slots = M.careerSkillSlots(R, s, Math.min(4, Math.max(1, sheet.level)));
  d.currentSkills = [...new Set(slots.map((x) => x.name))];
  const eq = equipment(R, s, {
    assumeUnlistedWeight: false,
    derived: d,
    entries: inventory(catalogue, record, R, s),
  });
  const apKeys = {
    head: "Head",
    arms: "Arms",
    body: "Body",
    legs: "Legs",
    shield: "Shield",
  };
  r.auto.enc = eq.penalties.complete ? eq.total : null;
  for (const [key, label] of Object.entries(apKeys))
    r.auto[key] = sheet.entries.gear.some(
      (x) =>
        x.kind === "armour" &&
        x.amount > 0 &&
        ["worn", "equipped"].includes(x.state) &&
        x.ap === null &&
        x.locations.includes(label),
    )
      ? null
      : eq.ap[label];
  for (const k of ["enc", ...Object.keys(apKeys)])
    r.values[k] =
      sheet.overrides[k] ??
      (r.auto[k] === null ? null : r.auto[k] + record.adjustments[k]);
  const skills = [...r.skills];
  for (const row of catalogue.rows.filter(
    (x) =>
      x.collection === "skills" &&
      !x.advanced &&
      (!x.grouped ||
        [
          "Melee (Basic)",
          "Stealth (Rural)",
          "Stealth (Urban)",
          "Stealth (Underground)",
        ].includes(x.name)) &&
      !skills.some((y) => y.name === x.name),
  ))
    skills.push({
      ...makeEntry(row, "skills"),
      key: row.id,
      total: r.stats[row.char],
      reference: true,
    });
  for (const x of skills) {
    if (x.total === null) x.total = r.stats[x.char] + x.amount;
    if (
      record.sheet.entries.skills.find((row) => row.key === x.key)?.total ==
      null
    )
      x.total +=
        (x.adjustment || 0) +
        (x.char === "Ag" && eq.penalties.complete
          ? eq.penalties.agility - r.stats.Ag
          : 0);
  }
  for (const weapon of eq.weapons) {
    const characteristic = weapon.kind === "ranged" ? "BS" : "WS";
    weapon.attackSkill = `${weapon.kind === "ranged" ? "Ranged" : "Melee"} (${weapon.group})`;
    const skill = skills.find((x) => x.name === weapon.attackSkill);
    const info = M.skillInfo(R, weapon.attackSkill, s);
    weapon.attackScore =
      info?.advanced && !skill?.amount
        ? null
        : (skill?.total ?? r.stats[characteristic]);
  }
  return {
    ...r,
    skills: skills.sort((a, b) => a.name.localeCompare(b.name)),
    equipment: eq,
    R,
    context: s,
    derived: d,
    career: selected,
    warnings: [
      ...r.warnings.filter((x) => !x.startsWith("Listed Enc")),
      ...eq.warnings,
      ...(record.current.wounds !== null &&
      r.values.wounds !== null &&
      record.current.wounds > r.values.wounds
        ? [
            "Current Wounds exceed the new maximum; review the current value. It was not silently changed.",
          ]
        : []),
      ...(record.current.fortune > sheet.fortune
        ? ["Current Fortune exceeds its maximum; review the current value."]
        : []),
    ],
  };
}
function normalise(sheet, target, catalogue, fromCreation) {
  const record = freshManager();
  record.sheet = clone(sheet);
  record.sheet.type = "wfrp-character";
  record.sheet.copiedFrom = "";
  if (!sheet.talentEffects) {
    for (const k of M.KEYS)
      if (
        sheet.entries.talents.some(
          (x) => catalogue.R.config.talentEffects[x.name] === k && x.amount > 0,
        )
      )
        record.sheet.characteristics[k].initial -= 5;
    if (
      sheet.entries.talents.some(
        (x) => x.name === "Fleet-footed" && x.amount > 0,
      )
    )
      record.sheet.baseMovement -= 1;
    record.sheet.talentEffects = true;
  }
  if (fromCreation) {
    record.sheet.overrides = Object.fromEntries(
      AUTO_FIELDS.map((k) => [k, null]),
    );
  }
  const now = calculateManager(catalogue, record);
  for (const row of record.sheet.entries.skills) {
    if (row.total !== null && !fromCreation) continue;
    const wanted = target.skills.find((x) => x.key === row.key)?.total;
    row.total = null;
    const penalty =
      row.char === "Ag" && now.equipment.penalties.complete
        ? now.equipment.penalties.agility - now.stats.Ag
        : 0;
    if (Number.isFinite(wanted))
      row.adjustment = wanted - now.stats[row.char] - row.amount - penalty;
  }
  for (const k of AUTO_FIELDS) {
    if (record.sheet.overrides[k] !== null) continue;
    if (target.values[k] !== null && now.values[k] !== null)
      record.adjustments[k] = target.values[k] - now.values[k];
    else if (target.values[k] !== null)
      record.sheet.overrides[k] = target.values[k];
  }
  record.current = { wounds: target.values.wounds, fortune: sheet.fortune };
  event(
    record,
    "Character imported",
    "Starting totals preserved. Prior purchases are historical attachments, not new manager purchases.",
    "import",
  );
  return record;
}
export function importCharacter(catalogue, library, incoming) {
  if (incoming?.type === TYPE) {
    const record = validateManager(incoming);
    record.id = uid();
    record.revision = 0;
    event(
      record,
      "Character imported",
      "Independent copy of a manager character.",
      "import",
    );
    return record;
  }
  if (incoming?.type === "wfrp-marijan") {
    const sheet = validateMarijan(incoming);
    const record = normalise(
      sheet,
      calculateMarijan(catalogue, sheet),
      catalogue,
      false,
    );
    record.attachments.push({
      name: "Original character record",
      data: clone(incoming),
    });
    return validateManager(record);
  }
  requireValue(
    incoming?.version === 2 &&
      Array.isArray(incoming.ledger) &&
      Array.isArray(incoming.rolls),
    "Choose a Player, Marijan, or manager character JSON file.",
  );
  const pc = { ...M.fresh(), ...clone(incoming) };
  const rules = catalogForCharacter(library, pc);
  requireValue(
    rules.species[pc.species] && rules.careers.some((c) => c.id === pc.career),
    "Choose a Species and Career in the creator before importing.",
  );
  const result = characterResult(rules, pc);
  const sheet = fromPlayer(catalogue, pc, result, rules);
  sheet.corruption = elderCorruption(rules, pc);
  if (!result.equipment.penalties.complete) sheet.overrides.enc = null;
  result.spells.forEach((spell, index) => {
    sheet.entries.magic[index].learnedWith = spell.talent || "";
    sheet.entries.magic[index].lore =
      spell.lore || sheet.entries.magic[index].lore;
  });
  sheet.entries.gear.forEach((e, i) => {
    e.profile = clone(result.equipment.entries[i]);
  });
  const record = normalise(
    sheet,
    calculateMarijan(catalogue, sheet),
    catalogue,
    true,
  );
  for (const key of [
    "highElf",
    "elf",
    "dwarf",
    "longbeard",
    "localRegion",
    "talentChoices",
    "skillChoices",
    "originTalentSlot",
    "regionalCareerBase",
    "careerVariant",
    "careerAlternatives",
  ])
    if (pc[key] !== undefined) record.context[key] = clone(pc[key]);
  record.attachments.push({
    name: "Original character record",
    data: clone(incoming),
  });
  // Retain incomplete individual tracker bands without claiming a purchase history.
  record.trackerProgress = clone(result.derived.trackerProgress || {});
  record.context.trappingCredits = [
    ...new Set([
      ...pc.ledger.filter((x) => x.type === "trapping").map((x) => x.name),
      ...pc.bonusGear
        .map((i) => result.career.levels[1]?.trappings[i])
        .filter(Boolean),
    ]),
  ];
  return validateManager(record);
}
export function readImport(catalogue, library, input) {
  const values =
    input?.type === "wfrp-manager-library" ? input.characters : [input];
  requireValue(
    Array.isArray(values) && values.length > 0 && values.length <= 1000,
    "A backup must contain between 1 and 1,000 characters.",
  );
  if (input?.type === "wfrp-manager-library") {
    requireValue(input.schemaVersion === SCHEMA);
    const records = values.map(validateManager);
    for (const record of records) {
      try {
        calculateManager(catalogue, record);
      } catch {
        throw Error(
          "A character in this backup contains invalid calculation context. No characters were imported.",
        );
      }
    }
    return records;
  }
  return values.map((value) => importCharacter(catalogue, library, value));
}
export function backup(records) {
  return {
    type: "wfrp-manager-library",
    schemaVersion: SCHEMA,
    exportedAt: at(),
    characters: records.map(validateManager),
  };
}
export function changeResource(record, key, value) {
  requireValue(
    ["wounds", "fortune"].includes(key) && numeric(value) && value >= 0,
    "Enter a non-negative resource value.",
  );
  const old = record.current[key];
  if (old === value) return;
  record.current[key] = value;
  event(
    record,
    `${key === "wounds" ? "Wounds" : "Fortune"}: ${old ?? "—"} → ${value}`,
    "Current value changed; maximum unchanged.",
    "resource",
  );
}
export function changeFate(record, value) {
  requireValue(
    Number.isSafeInteger(value) && value >= 0 && value <= 1e9,
    "Enter non-negative whole Fate.",
  );
  const old = record.sheet.fate;
  if (old === value) return;
  record.sheet.fate = value;
  event(
    record,
    `Fate: ${old} → ${value}`,
    "Permanent resource value changed; Fortune unchanged.",
    "resource",
  );
}

function validateAffliction(row) {
  requireValue(
    row &&
      typeof row.id === "string" &&
      row.id.length > 0 &&
      ["critical", "mutation"].includes(row.kind) &&
      typeof row.at === "string" &&
      Number.isFinite(Date.parse(row.at)) &&
      typeof row.name === "string" &&
      row.name.trim().length > 0 &&
      ["text", "note", "location", "referenceId", "catalogueId"].every(
        (key) => typeof row[key] === "string",
      ) &&
      typeof row.resolved === "boolean" &&
      (row.source === null ||
        (typeof row.source?.book === "string" &&
          ((Number.isInteger(row.source.page) && row.source.page > 0) ||
            (typeof row.source.page === "string" &&
              /^\d+[–-]\d+$/.test(row.source.page))))),
  );
}
export function saveAffliction(record, values) {
  const rows = record.afflictions || [];
  const old = values.id ? rows.find((row) => row.id === values.id) : undefined;
  requireValue(!values.id || old, "This entry is no longer available.");
  const next = {
    id: old?.id || uid(),
    at: old?.at || at(),
    kind: values.kind,
    name: typeof values.name === "string" ? values.name.trim() : "",
    text: values.text || "",
    note: values.note || "",
    location: values.location || "",
    referenceId: values.referenceId || "",
    catalogueId: values.catalogueId || "",
    source: values.source || null,
    resolved: old?.resolved || false,
  };
  validateAffliction(next);
  requireValue(
    old || rows.length < 500,
    "This character has too many affliction records.",
  );
  if (old) Object.assign(old, next);
  else record.afflictions = [...rows, next];
  event(
    record,
    `${old ? "Updated" : "Recorded"} ${next.name}`,
    next.note,
    "affliction",
  );
}
export function awardXP(record, amount, note = "") {
  requireValue(
    Number.isSafeInteger(amount) && amount > 0,
    "Enter a positive whole XP award.",
  );
  record.sheet.xpUnspent += amount;
  event(record, `Awarded ${amount} XP`, note, "xp");
}
export function quoteManager(catalogue, record, type, name, amount = 5) {
  const r = calculateManager(catalogue, record);
  if (
    !r.career ||
    !catalogue.R.species[record.sheet.species] ||
    record.sheet.level < 1 ||
    record.sheet.level > 4
  )
    return {
      error:
        "Choose a supported Species, Career, and level (1–4), or record a GM adjustment.",
      cost: null,
    };
  if (!["char", "skill", "talent", "promotion"].includes(type))
    return { error: "Choose an advancement.", cost: null };
  try {
    return M.quote(r.R, r.context, type, name, amount, r.derived);
  } catch {
    return {
      error: "This option needs GM review; use a recorded adjustment.",
      cost: null,
    };
  }
}
export function purchaseAdvance(
  catalogue,
  record,
  type,
  name,
  amount = 5,
  endeavour = false,
) {
  const q = quoteManager(catalogue, record, type, name, amount);
  if (q.error) throw Error(q.error);
  if (type === "promotion")
    requireValue(
      endeavour,
      "Confirm the Advance Career Endeavour before promotion.",
    );
  const s = record.sheet;
  if (type === "char") s.characteristics[name].advances += amount;
  if (type === "skill") {
    let row = s.entries.skills.find((x) => x.name === name);
    if (!row) {
      const option = catalogue.rows.find(
        (x) => x.collection === "skills" && x.name === name,
      );
      requireValue(option, "Choose a catalogue Skill.");
      const key = addEntry(s, "skills", option);
      row = s.entries.skills.find((x) => x.key === key);
    }
    row.amount += amount;
    if (row.total !== null) row.total += amount;
  }
  if (type === "talent") {
    const option = catalogue.rows.find(
      (x) => x.collection === "talents" && x.name === name,
    );
    requireValue(option, "Choose a catalogue Talent.");
    addEntry(s, "talents", option);
    if (name === "Luck") s.fortune++;
  }
  if (type === "promotion") s.level++;
  if (q.inCareer && ["char", "skill"].includes(type) && amount === 1)
    record.trackerProgress[`${type}:${name}`] =
      (record.trackerProgress[`${type}:${name}`] || 0) + 1;
  if (q.tick) s.tracker = Math.min(36, s.tracker + 1);
  s.xpUnspent -= q.cost;
  s.xpSpent += q.cost;
  record.purchases.push({
    ...q,
    id: uid(),
    at: at(),
    career: s.career,
    level: s.level,
    name: name || "Career promotion",
  });
  event(
    record,
    type === "promotion"
      ? `Advanced to Career level ${s.level}`
      : `Purchased ${name}${["char", "skill"].includes(type) ? ` +${amount}` : ""}`,
    `${q.cost} XP · core p. ${q.page}`,
    "advancement",
  );
}
export function changeCareer(catalogue, record, id, confirmed) {
  const before = calculateManager(catalogue, record);
  const next = catalogue.careers.find((c) => c.contentId === id || c.id === id);
  requireValue(
    next && before.career && id !== record.sheet.career,
    "Choose a different supported Career.",
  );
  requireValue(
    confirmed,
    "Confirm GM agreement and the Change Career Endeavour.",
  );
  requireValue(
    careerAvailable(before.R, { ...before.context, career: next.id }, next),
    "This Career is unavailable to this Species.",
  );
  const cost = next.class === before.career.class ? 100 : 200;
  requireValue(record.sheet.xpUnspent >= cost, `Requires ${cost} XP.`);
  record.sheet.xpUnspent -= cost;
  record.sheet.xpSpent += cost;
  record.sheet.career = next.contentId || next.id;
  record.sheet.level = 1;
  record.sheet.tracker = 0;
  record.trackerProgress = {};
  record.purchases.push({
    id: uid(),
    type: "career",
    name: next.name,
    cost,
    at: at(),
  });
  event(
    record,
    `Changed Career: ${before.career.name} → ${next.name}`,
    `${cost} XP · GM agreement and Endeavour recorded · core p. 197. Advances, Talents and equipment retained; no new creation grants.`,
    "advancement",
  );
}
export function creditTrapping(catalogue, record, index, reason) {
  const r = calculateManager(catalogue, record);
  requireValue(
    r.career && record.sheet.level >= 1 && record.sheet.level < 4,
    "Only the next Career level grants Trapping boxes.",
  );
  const s = {
    ...r.context,
    bonusGear: [],
    ledger: [
      ...record.purchases,
      ...(record.context.trappingCredits || []).map((name) => ({
        type: "trapping",
        name,
      })),
    ],
  };
  recordAcquisition(
    r.R,
    s,
    record.sheet.level + 1,
    index,
    reason,
    "",
    r.derived,
  );
  const entry = s.ledger.at(-1);
  record.purchases.push({
    ...entry,
    id: uid(),
    at: at(),
    career: record.sheet.career,
  });
  if (entry.tick) record.sheet.tracker = Math.min(36, record.sheet.tracker + 1);
  event(
    record,
    `Recorded Career Trapping: ${entry.name}`,
    `${reason} · core pp. 43–44. No equipment granted automatically.`,
    "advancement",
  );
}
export function acquire(
  catalogue,
  record,
  id,
  quantity = 1,
  cost = 0,
  note = "",
) {
  requireValue(
    Number.isSafeInteger(quantity) &&
      quantity > 0 &&
      numeric(cost) &&
      cost >= 0 &&
      Number.isSafeInteger(cost),
    "Enter a positive quantity and a whole non-negative price in pennies.",
  );
  const option = catalogue.rows.find(
    (x) => x.id === id && x.collection === "gear",
  );
  requireValue(option, "Choose an equipment entry.");
  const coins = record.sheet.coins,
    money = coins.gc * 240 + coins.ss * 12 + coins.d;
  requireValue(money >= cost, "Not enough money for this transaction.");
  const key = addEntry(record.sheet, "gear", option),
    row = record.sheet.entries.gear.find((x) => x.key === key);
  row.amount += quantity - 1;
  const size = equipmentSize(
    catalogue.R,
    { ...M.fresh(), species: record.sheet.species },
    option.name,
    option,
  );
  row.enc = size.unresolved
    ? null
    : Number.isFinite(option.enc ?? itemWeight(catalogue.R, option.name))
      ? (option.enc ?? itemWeight(catalogue.R, option.name)) * size.multiplier
      : null;
  const left = money - cost;
  record.sheet.coins = {
    gc: Math.floor(left / 240),
    ss: Math.floor((left % 240) / 12),
    d: left % 12,
  };
  event(
    record,
    `Acquired ${quantity} × ${option.name}`,
    `${cost} pennies paid${note ? ` · ${note}` : ""}`,
    "equipment",
  );
}
export const listedPrice = (row) => priceInPennies(row?.price);
export function addCondition(record, name, amount = 1, note = "") {
  requireValue(
    typeof name === "string" &&
      name.trim() &&
      Number.isSafeInteger(amount) &&
      amount > 0,
    "Enter a Condition name and positive count.",
  );
  record.conditions.push({
    id: uid(),
    at: at(),
    name: name.trim(),
    amount,
    note,
  });
  event(record, `Recorded ${name} (${amount})`, note, "condition");
}
export function addJournal(record, title, text, kind = "Session") {
  requireValue(
    typeof title === "string" && title.trim(),
    "Enter a journal title.",
  );
  record.journal.push({ id: uid(), at: at(), title: title.trim(), text, kind });
  event(record, `Journal: ${title}`, kind, "journal");
}
