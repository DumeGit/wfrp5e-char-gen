import { die } from "../rules.mjs";
import { WEAPON_DEFINITIONS } from "./weapon-definitions.mjs";

export const WEAPON_EFFECTS = WEAPON_DEFINITIONS.effects;
export const WEAPON_PROPERTIES = WEAPON_DEFINITIONS.properties;
export const CREATURE_TARGETS = WEAPON_DEFINITIONS.creatures;
export const MAX_WEAPON_ROLLS = 120;
export const REACHES = [
  "Personal",
  "Very Short",
  "Short",
  "Average",
  "Long",
  "Very Long",
  "Massive",
];
const plain = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const integer = (x, min = 0, max = 99999) =>
  Number.isSafeInteger(x) && x >= min && x <= max;
const short = (x, max = 1000) => typeof x === "string" && x.length <= max;
const fields = (x, keys) =>
  plain(x) &&
  Object.keys(x).length === keys.length &&
  keys.every((k) => Object.hasOwn(x, k));
const rootName = (name) => name.replace(/\s*(?:\([^)]*\)|\d+)\s*$/g, "").trim();
export const weaponPropertyName = rootName;
export const splitWeaponProperties = (text) =>
  String(text || "")
    .split(/,(?![^()]*\))/)
    .map((x) => x.trim())
    .filter(Boolean);
export const propertyDefinition = (token, preferredId) =>
  WEAPON_PROPERTIES.find(
    (p) => p.id === preferredId && rootName(p.name) === rootName(token),
  ) || WEAPON_PROPERTIES.find((p) => rootName(p.name) === rootName(token));
export const weaponRune = (R, id) =>
  (R.runes || []).find((r) => (r.contentId || r.id) === id);
export const effectDefinition = (id) => WEAPON_EFFECTS.find((e) => e.id === id);
export const customWeaponName = (w) =>
  w.name.trim() + (w.hands === 2 && !/\(2H\)/i.test(w.name) ? " (2H)" : "");
export const damageFormula = (text, stats) => {
  const clean = String(text).replaceAll(" ", "").replace(/^\+/, "");
  if (clean === "—" || clean === "-") return { valid: true, damage: null };
  const match = clean.match(/^(?:(SB|TB)([+-]\d+)?|(\d+))$/);
  if (!match || !integer(Math.abs(Number(match?.[2] || match?.[3] || 0))))
    return { valid: false, damage: null };
  const score = stats[match[1] === "TB" ? "T" : "S"];
  return {
    valid: true,
    damage: match[1]
      ? score == null
        ? null
        : Math.floor(score / 10) + Number(match[2] || 0)
      : Number(match[3]),
  };
};
export function newCustomWeapon(
  R,
  id,
  key = `gm-${globalThis.crypto.randomUUID()}`,
) {
  const b = R.weapons.find((w) => w.contentId === id);
  if (!b) throw Error("Choose a published base weapon.");
  return {
    key,
    baseId: id,
    base: {
      name: b.name,
      kind: b.kind,
      group: b.group,
      damage: b.damage,
      reach: b.reach,
      enc: b.enc ?? null,
      qualities: b.qualities || "",
      source: { ...b.source },
    },
    name: b.name.replace(/\s*\(2H\)/g, ""),
    kind: b.kind,
    group: b.group,
    hands: /\(2H\)/.test(b.name) ? 2 : 1,
    damage: b.damage,
    reach: b.reach,
    enc: b.enc ?? null,
    quantity: 1,
    properties: splitWeaponProperties(b.qualities),
    propertySources: Object.fromEntries(
      splitWeaponProperties(b.qualities).flatMap((token) => {
        const definition =
          WEAPON_PROPERTIES.find(
            (p) =>
              p.source.book === b.source.book &&
              rootName(p.name) === rootName(token),
          ) || propertyDefinition(token);
        return definition ? [[rootName(token), definition.id]] : [];
      }),
    ),
    notes: "",
    power: splitWeaponProperties(b.qualities).includes("Magical")
      ? "magical"
      : "ordinary",
    effects: [],
    customEffect: { name: "", text: "" },
    runes: [],
    surface: "weapon",
    weaponForm: /axe/i.test(b.name)
      ? "Axe"
      : /hammer/i.test(b.name)
        ? "Hammer"
        : /sword|rapier|zweihander/i.test(b.name)
          ? "Sword"
          : "Other",
    material: "Metal",
    formException: "",
    dwarfArtillery: false,
    ammunition: 0,
    legendary: false,
    rolls: [],
  };
}
const runeKey = (r) => r.contentId || r.id;
export const isArtilleryBase = (w) =>
  /:weapon:cannon-(small|medium|large)$/.test(w.baseId);
export function availableWeaponRunes(R, w) {
  return (R.runes || []).filter(
    (r) => r.form === (w.surface === "artillery" ? "Engineering" : "Weapon"),
  );
}
const runeTargets = (name) =>
  ["Grudge Rune", "Master Rune of the Slayer"].includes(name);
export function customWeaponIssues(R, w, { structured = false } = {}) {
  const problems = [];
  let section = "profile",
    sectionTarget = "#weapon-profile";
  const add = (message, target = sectionTarget) =>
    problems.push(structured ? { message, target, section } : message);
  if (!w.name.trim()) add("Give the weapon a name.", "#weapon-name");
  if (!integer(w.quantity, 1, 9999))
    add("Use a quantity from 1 to 9999.", "#weapon-quantity");
  if (!damageFormula(w.damage, {}).valid)
    add("Use Damage such as SB+4, TB+2, 9 or — (no Damage).", "#weapon-damage");
  if (!R.weapons.some((b) => b.kind === w.kind && b.group === w.group))
    add("Choose a weapon group for this weapon type.", "#weapon-group");
  if (!w.reach.trim())
    add(
      w.kind === "melee"
        ? "Set the weapon’s Reach."
        : "Set the weapon’s Range, including units or its formula.",
      "#weapon-reach",
    );
  if (w.kind === "melee" && !REACHES.includes(w.reach))
    add("Choose a printed melee Reach.", "#weapon-reach");
  let enc = w.enc;
  if (enc !== null) {
    if (w.properties.some((p) => rootName(p) === "Lightweight")) enc--;
    if (w.properties.some((p) => rootName(p) === "Bulky")) enc++;
    if (!integer(enc))
      add(
        "The final Encumbrance must be nonnegative; adjust base Encumbrance or craftsmanship.",
        "#weapon-enc",
      );
  }
  section = "properties";
  sectionTarget = "#weapon-properties";
  const names = w.properties.map(rootName);
  if (new Set(names).size !== names.length)
    add("Combine duplicate properties into one rated selection.");
  for (const [index, token] of w.properties.entries()) {
    const def = propertyDefinition(token, w.propertySources?.[rootName(token)]),
      name = rootName(token);
    if (!def && !splitWeaponProperties(w.base.qualities).includes(token))
      add(`Unknown property: ${token}. Use Notes for custom rules.`);
    if (def && /\(Rating\)/i.test(def.name) && !/ \d+$/.test(token))
      add(
        `${name} needs a positive whole-number rating.`,
        `#weapon-property-${index}`,
      );
    if (
      def &&
      /\(Condition\)/.test(def.name) &&
      !/^Inflict \(.+\)$/.test(token)
    )
      add(
        "Inflict needs a Condition or explicit printed parameter.",
        `#weapon-property-${index}`,
      );
    if (
      / \d+$/.test(token) &&
      !integer(Number(token.match(/(\d+)$/)[1]), 1, 100)
    )
      add(`${name} needs a rating from 1 to 100.`, `#weapon-property-${index}`);
  }
  section = "power";
  sectionTarget = "#weapon-power";
  if (
    w.power !== "magical" &&
    (w.effects.length ||
      w.customEffect.name ||
      w.customEffect.text ||
      w.legendary ||
      w.ammunition)
  )
    add("Clear magical abilities before changing Power.");
  if (w.power !== "runic" && w.runes.length)
    add("Clear runes before changing Power.");
  if (w.power === "magical") {
    section = "enchantments";
    sectionTarget = "#weapon-effect-select";
    if (
      w.ammunition &&
      !(
        w.kind === "ranged" &&
        w.effects.some((e) => effectDefinition(e.id)?.min === 99)
      )
    )
      add("Hoarfrost ammunition needs its ranged enchantment result.");
    if (
      !w.effects.length &&
      !w.legendary &&
      !w.customEffect.text.trim() &&
      !w.properties.includes("Magical")
    )
      add("Choose an enchantment or describe a custom magical effect.");
    if (w.effects.length + Number(!!w.customEffect.text.trim()) > 5)
      add("A Legendary weapon can have at most five distinct abilities.");
    if (new Set(w.effects.map((e) => e.id)).size !== w.effects.length)
      add("Duplicate enchantments are not cumulative.");
    if (!!w.customEffect.name.trim() !== !!w.customEffect.text.trim())
      add(
        "Custom magic needs both a name and its full effect.",
        !w.customEffect.name.trim()
          ? "#weapon-custom-name"
          : "#weapon-custom-text",
      );
    for (const selection of w.effects) {
      const effect = effectDefinition(selection.id);
      if (!effect || effect.min === 100)
        add(
          "Choose a concrete magical ability; Legendary resolves additional rolls.",
        );
      if (effect?.target && !selection.target.trim())
        add("Choose or roll a creature target for Of Bane.", "#weapon-bane");
      if (
        effect?.min === 99 &&
        w.kind === "ranged" &&
        (w.legendary || w.effects.length > 1 || w.customEffect.text)
      )
        add(
          "Hoarfrost ammunition cannot be combined with a Legendary ranged weapon.",
        );
      if (
        effect?.min === 99 &&
        w.kind === "ranged" &&
        !integer(w.ammunition, 1, 10)
      )
        add("Set 1–10 pieces of Hoarfrost ammunition.", "#weapon-ammo");
    }
  }
  if (w.power === "runic") {
    section = "runes";
    sectionTarget = "#weapon-rune-select";
    const count = w.runes.reduce((n, r) => n + r.count, 0);
    if (!count || count > 3) add("Use one to three rune inscriptions.");
    if (
      w.runes
        .filter((r) => weaponRune(R, r.id)?.master)
        .reduce((n, r) => n + r.count, 0) > 1
    )
      add("A runic item permits at most one Master Rune.");
    if (new Set(w.runes.map((r) => r.id)).size !== w.runes.length)
      add("Combine repeated ordinary runes using their count.");
    if (!w.material)
      add(
        "Choose a material suitable for permanent inscription.",
        "#weapon-material",
      );
    if (splitWeaponProperties(w.base.qualities).includes("Magical"))
      add("Runes cannot be added to an already enchanted non-runic base.");
    if (w.surface === "weapon") {
      if (w.kind !== "melee" || w.group === "Engineering")
        add(
          "Weapon Runes require a melee weapon outside the Engineering group.",
        );
      if (w.weaponForm === "Other" && !w.formException.trim())
        add(
          "Record the GM form exception for this non-standard melee weapon.",
          "#weapon-form-exception",
        );
    } else if (!isArtilleryBase(w) || !w.dwarfArtillery || w.kind !== "ranged")
      add(
        "Engineering Runes require an explicitly Dwarf-built Blackpowder cannon base.",
      );
    for (const row of w.runes) {
      const rune = weaponRune(R, row.id);
      if (
        !rune ||
        !availableWeaponRunes(R, w).some((r) => runeKey(r) === row.id)
      )
        add("Choose a rune of the correct form.");
      if (runeTargets(rune?.name) && !row.target.trim())
        add(
          `${rune.name} needs a target.`,
          `#weapon-rune-target-${row.id.replace(/[^a-z0-9-]/gi, "-")}`,
        );
    }
  }
  return problems;
}
export function validateCustomWeapons(R, rows) {
  if (!Array.isArray(rows) || rows.length > 1000)
    throw Error("Invalid custom weapons list.");
  const keys = new Set();
  for (const w of rows) {
    const template = newCustomWeapon(R, w?.baseId, w?.key);
    if (
      !fields(w, Object.keys(template)) ||
      !/^gm-[a-z0-9-]+$/.test(w.key) ||
      keys.has(w.key)
    )
      throw Error("Invalid custom weapon identity or fields.");
    keys.add(w.key);
    if (
      !fields(w.base, Object.keys(template.base)) ||
      !fields(w.base.source, ["book", "page"]) ||
      w.base.source.book !== template.base.source.book ||
      w.base.source.page !== template.base.source.page ||
      w.base.qualities !== template.base.qualities ||
      w.base.kind !== template.base.kind ||
      w.base.group !== template.base.group ||
      w.base.name !== template.base.name ||
      !["name", "kind", "group", "damage", "reach", "qualities"].every((k) =>
        short(w.base[k]),
      ) ||
      !(w.base.enc === null || integer(w.base.enc)) ||
      ["damage", "reach", "enc"].some((k) => w.base[k] !== template.base[k])
    )
      throw Error("Invalid custom weapon base provenance.");
    if (
      ![
        "name",
        "group",
        "damage",
        "reach",
        "weaponForm",
        "material",
        "formException",
      ].every((k) => short(w[k])) ||
      !short(w.notes, 10000) ||
      !["melee", "ranged"].includes(w.kind) ||
      ![1, 2].includes(w.hands) ||
      !["ordinary", "magical", "runic"].includes(w.power) ||
      !["weapon", "artillery"].includes(w.surface) ||
      !["Axe", "Hammer", "Sword", "Other"].includes(w.weaponForm) ||
      !["Metal", "Stone", "Other suitable material"].includes(w.material) ||
      typeof w.dwarfArtillery !== "boolean" ||
      typeof w.legendary !== "boolean" ||
      !integer(w.ammunition, 0, 10) ||
      !integer(w.quantity, 1, 9999) ||
      !(w.enc === null || integer(w.enc))
    )
      throw Error("Invalid custom weapon profile.");
    if (
      !Array.isArray(w.properties) ||
      w.properties.length > 50 ||
      w.properties.some((p) => !short(p, 300) || !p.trim()) ||
      !Array.isArray(w.effects) ||
      w.effects.length > 5 ||
      !Array.isArray(w.runes) ||
      w.runes.length > 3 ||
      !fields(w.customEffect, ["name", "text"]) ||
      !short(w.customEffect.name) ||
      !short(w.customEffect.text, 10000)
    )
      throw Error("Invalid weapon properties or effects.");
    if (
      !plain(w.propertySources) ||
      Object.keys(w.propertySources).length > 50 ||
      Object.entries(w.propertySources).some(
        ([name, id]) =>
          !short(name, 300) ||
          !short(id) ||
          !WEAPON_PROPERTIES.some(
            (p) => p.id === id && rootName(p.name) === name,
          ),
      )
    )
      throw Error("Invalid weapon property provenance.");
    if (
      w.effects.some(
        (e) => !fields(e, ["id", "target"]) || !short(e.id) || !short(e.target),
      ) ||
      w.runes.some(
        (r) =>
          !fields(r, ["id", "count", "target"]) ||
          !short(r.id) ||
          !integer(r.count, 1, 3) ||
          !short(r.target),
      )
    )
      throw Error("Invalid weapon effect selection.");
    if (
      !Array.isArray(w.rolls) ||
      w.rolls.length > 1200 ||
      w.rolls.some(
        (r) =>
          !fields(r, ["label", "face", "sides", "at", "source"]) ||
          !short(r.label) ||
          ![10, 100].includes(r.sides) ||
          !integer(r.face, 1, r.sides) ||
          !short(r.at, 100) ||
          !Number.isFinite(Date.parse(r.at)) ||
          !fields(r.source, ["book", "page", "table"]) ||
          r.source.book !== "archives-ii" ||
          ![55, 58, 59].includes(r.source.page) ||
          ![
            "magical-weapon-qualities-v1",
            "random-creatures",
            "hoarfrost-ammunition",
          ].includes(r.source.table),
      )
    )
      throw Error("Invalid custom weapon dice record.");
    const issues = customWeaponIssues(R, w);
    if (issues.length) throw Error(issues[0]);
  }
  return rows;
}
export function rollWeaponEnchantment(
  kind,
  random = die,
  now = () => new Date().toISOString(),
) {
  const result = {
    effects: [],
    legendary: false,
    ammunition: 0,
    rolls: [],
    error: "",
  };
  const roll = (sides, label, page, table) => {
    if (result.rolls.length >= MAX_WEAPON_ROLLS)
      throw Error(
        "Generation reached its dice limit. Keep editing or roll again; no substitute result was added.",
      );
    const face = random(sides);
    if (!integer(face, 1, sides)) throw Error("Invalid weapon die result.");
    result.rolls.push({
      label,
      face,
      sides,
      at: now(),
      source: { book: "archives-ii", page, table },
    });
    return face;
  };
  try {
    let pending = 1;
    while (pending > 0 && result.effects.length < 5) {
      pending--;
      const face = roll(
        100,
        "Magical weapon ability",
        58,
        "magical-weapon-qualities-v1",
      );
      const ability = WEAPON_EFFECTS.find(
        (e) => face >= e.min && face <= e.max,
      );
      if (face === 100) {
        result.legendary = true;
        pending += 2;
        continue;
      }
      if (face === 99 && kind === "ranged" && result.legendary) continue;
      if (result.effects.some((e) => e.id === ability.id)) continue;
      const targetFace = ability.target
        ? roll(100, "Of Bane creature target", 55, "random-creatures")
        : 0;
      const target = targetFace
        ? CREATURE_TARGETS.find(
            (t) => targetFace >= t.min && targetFace <= t.max,
          ).name
        : "";
      result.effects.push({ id: ability.id, target });
      if (face === 99 && kind === "ranged")
        result.ammunition = roll(
          10,
          "Hoarfrost ammunition",
          59,
          "hoarfrost-ammunition",
        );
    }
  } catch (error) {
    result.error = error.message;
  }
  return result;
}

export function resolveCustomWeapon(R, w, stats, skills = [], sizeBonus = 0) {
  const source = { ...w.base.source },
    ranged = w.kind === "ranged";
  const skillName = `${ranged ? "Ranged" : "Melee"} (${w.group})`;
  let score =
    skills.find((s) => s.name === skillName)?.total ??
    stats[ranged ? "BS" : "WS"] ??
    null;
  let damage = damageFormula(w.damage, stats).damage;
  if (!ranged && damage !== null) damage += sizeBonus;
  const properties = [...w.properties],
    details = [],
    calculated = [];
  const grant = (property) => {
    if (!properties.some((p) => rootName(p) === rootName(property)))
      properties.push(property);
  };
  const magicalAmmo =
    ranged && w.effects.some((e) => effectDefinition(e.id)?.min === 99);
  if (w.power !== "ordinary" && !magicalAmmo) grant("Magical");
  for (const selection of w.effects) {
    const e = effectDefinition(selection.id);
    if (!e) continue;
    for (const prop of e.properties || [])
      if (!e.meleeOnlyProperties || !ranged) {
        grant(prop);
        calculated.push(`${e.name}: ${prop}`);
      }
    details.push(
      `${magicalAmmo && e.min === 99 ? "Hoarfrost ammunition (when used)" : e.name}${selection.target ? ` (${selection.target})` : ""}: ${e.text} (Archives II p. ${e.page})`,
    );
  }
  for (const row of w.runes) {
    const rune = weaponRune(R, row.id);
    if (!rune) continue;
    const count = row.count,
      name = rune.name;
    if (name === "Rune of Cleaving" || name === "Rune of Penetrating") {
      const extra = count * (rune.form === "Engineering" ? 2 : 1);
      if (damage !== null) damage += extra;
      calculated.push(`${name}: +${extra} Damage`);
    }
    if (["Rune of Striking", "Rune of Accuracy"].includes(name)) {
      if (score !== null) score += 10 * count;
      calculated.push(`${name}: +${10 * count} attack score`);
    }
    if (name === "Master Rune of Haste") {
      grant("Fast");
      calculated.push(`${name}: Fast`);
    }
    if (name === "Rune of Reloading") {
      const i = properties.findIndex((p) => /^Reload \d+$/.test(p));
      if (i >= 0) {
        const reload = Math.max(
          properties.some((p) => /^Salvo\b/.test(p)) ? 1 : 0,
          Number(properties[i].slice(7)) - 2 * count,
        );
        if (reload) properties[i] = `Reload ${reload}`;
        else properties.splice(i, 1);
        calculated.push(`${name}: Reload ${reload || "removed"}`);
      }
    }
    details.push(
      `${name}${count > 1 ? ` ×${count}` : ""}${row.target ? ` (${row.target})` : ""}: ${rune.text}${["Rune of Cleaving", "Rune of Penetrating", "Rune of Striking", "Rune of Accuracy"].includes(name) ? " Included in this attack’s calculated values." : ""} (Dwarf Guide p. ${rune.page}; Fourth Edition reference)`,
    );
  }
  if (w.customEffect.text)
    details.push(`${w.customEffect.name}: ${w.customEffect.text} (GM-defined)`);
  let enc = w.enc;
  if (enc !== null)
    enc +=
      Number(w.properties.some((p) => rootName(p) === "Bulky")) -
      Number(w.properties.some((p) => rootName(p) === "Lightweight"));
  const name = customWeaponName(w);
  const text = [w.reach, properties.join(", "), w.notes, ...details]
    .filter(Boolean)
    .join(" · ");
  const gear = {
    key: w.key,
    id: w.key,
    quantity: w.quantity,
    origin: "GM",
    custom: true,
    entry: {
      name,
      enc,
      qualities: properties.join(", "),
      text: w.notes,
      custom: true,
      baseSource: source,
      baseName: w.base.name,
    },
  };
  const ammunition = magicalAmmo
    ? {
        key: `${w.key}-ammo`,
        id: `${w.key}-ammo`,
        quantity: w.ammunition,
        origin: "GM",
        custom: true,
        ammunition: true,
        entry: {
          name: `Hoarfrost ammunition for ${name}`,
          enc: null,
          qualities: "Magical",
          text: effectDefinition(
            w.effects.find((e) => effectDefinition(e.id)?.min === 99).id,
          ).text,
          custom: true,
          baseSource: { book: "archives-ii", page: 59 },
          baseName: "Hoarfrost Blade",
        },
      }
    : null;
  return {
    attack: {
      key: w.key,
      name,
      skill: score,
      damage,
      ranged,
      free: false,
      text,
      origin: "GM",
      custom: true,
      baseSource: source,
      baseName: w.base.name,
    },
    gear,
    ammunition,
    properties,
    details,
    calculated,
    enc,
  };
}
