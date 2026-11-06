import { die } from "../rules.mjs";
import { displayNumber } from "../display-number.mjs";

// App-authored treasure tables. Items reuse exact core catalogue records.
export const LOOT_SOURCE = Object.freeze({
  kind: "app",
  table: "additional-loot-v1",
  name: "Additional loot · app table v1",
});
export const MAX_LOOT_QUANTITY = 9999;
export const MAX_LOOT_DICE = 120;
export const LOOT_COINS = Object.freeze({
  brass: ["brass penny", "brass pennies"],
  silver: ["silver shilling", "silver shillings"],
  gold: ["gold crown", "gold crowns"],
});
const item = (id, count = 1, sides = 0) => ({ id, count, sides });
const jewellery = (variant) => ({ ...item("core:gear:jewellery"), variant });
const coin = (coin, count = 1, sides = 0) => ({ coin, count, sides });
const table = (rows) =>
  rows.map(([min, max, label, drops]) => ({ min, max, label, drops }));
const extra = [100, 100, "Roll twice more; reroll further results of 00", []];

// Keep the original distribution available for existing callers and provenance.
export const LOOT_TABLE = table([
  [1, 20, "1d10 brass pennies", [coin("brass", 1, 10)]],
  [21, 30, "2d10 brass pennies", [coin("brass", 2, 10)]],
  [31, 38, "1d10 silver shillings", [coin("silver", 1, 10)]],
  [39, 40, "1 gold crown", [coin("gold")]],
  [
    41,
    44,
    "Pouch containing 1d10 brass pennies",
    [item("core:gear:pouch"), coin("brass", 1, 10)],
  ],
  [45, 48, "1d3 days of rations", [item("core:gear:rations-1-day", 1, 3)]],
  [49, 52, "1d3 bandages", [item("core:gear:bandage", 1, 3)]],
  [53, 55, "Tinderbox", [item("core:gear:tinderbox")]],
  [56, 58, "Flask", [item("core:gear:flask")]],
  [59, 61, "Rope, 10 yards", [item("core:gear:rope-10-yards")]],
  [62, 64, "Deck of Cards", [item("core:gear:deck-of-cards")]],
  [65, 67, "Dice", [item("core:gear:dice")]],
  [68, 70, "Pipe and Tobacco", [item("core:gear:pipe-and-tobacco")]],
  [71, 73, "Religious Symbol", [item("core:gear:religious-symbol")]],
  [74, 76, "Key", [item("core:gear:key")]],
  [77, 79, "Hand Mirror", [item("core:gear:hand-mirror")]],
  [80, 82, "Map", [item("core:gear:map")]],
  [83, 85, "Writing Kit", [item("core:gear:writing-kit")]],
  [86, 88, "Lockpicks", [item("core:gear:lockpicks")]],
  [89, 91, "Healing Poultice", [item("core:market:110")]],
  [92, 93, "Vitality Draught", [item("core:market:116")]],
  [94, 95, "Signet Ring", [item("core:gear:signet-ring")]],
  [96, 97, "Jewellery", [item("core:gear:jewellery")]],
  [
    98,
    98,
    "Lantern and Lamp Oil",
    [item("core:gear:lantern"), item("core:gear:lamp-oil")],
  ],
  [
    99,
    99,
    "Sack containing a Blanket and 1d3 days of rations",
    [
      item("core:gear:sack"),
      item("core:gear:blanket"),
      item("core:gear:rations-1-day", 1, 3),
    ],
  ],
  extra,
]);

export const LOOT_TIERS = Object.freeze({
  brass: "Brass",
  silver: "Silver",
  gold: "Gold",
});
export const LOOT_TABLES = {
  brass: table([
    [1, 20, "1d10 brass pennies", [coin("brass", 1, 10)]],
    [
      21,
      30,
      "Pouch with 2d10 brass pennies",
      [item("core:gear:pouch"), coin("brass", 2, 10)],
    ],
    [31, 39, "1d3 torches", [item("core:gear:torch-stick-and-rags", 1, 3)]],
    [40, 47, "1d3 pints of ale", [item("core:gear:ale-pint", 1, 3)]],
    [48, 54, "1d3 days of rations", [item("core:gear:rations-1-day", 1, 3)]],
    [55, 61, "1d3 bandages", [item("core:gear:bandage", 1, 3)]],
    [62, 66, "Tinderbox", [item("core:gear:tinderbox")]],
    [67, 71, "Dice", [item("core:gear:dice")]],
    [72, 76, "Rope, 10 yards", [item("core:gear:rope-10-yards")]],
    [77, 81, "Pipe and Tobacco", [item("core:gear:pipe-and-tobacco")]],
    [82, 86, "Adder root", [item("core:market:98")]],
    [87, 91, "Deck of Cards", [item("core:gear:deck-of-cards")]],
    [92, 95, "Key", [item("core:gear:key")]],
    [
      96,
      99,
      "Sack containing a Blanket and 1d3 days of rations",
      [
        item("core:gear:sack"),
        item("core:gear:blanket"),
        item("core:gear:rations-1-day", 1, 3),
      ],
    ],
    extra,
  ]),
  silver: table([
    [1, 20, "1d10 silver shillings", [coin("silver", 1, 10)]],
    [21, 30, "2d10 silver shillings", [coin("silver", 2, 10)]],
    [
      31,
      38,
      "Lantern and Lamp Oil",
      [item("core:gear:lantern"), item("core:gear:lamp-oil")],
    ],
    [39, 46, "1d3 pints of spirits", [item("core:gear:spirits-pint", 1, 3)]],
    [
      47,
      53,
      "1d3 pints of Dwarf Ale",
      [item("core:gear:dwarf-ale-pint", 1, 3)],
    ],
    [54, 60, "Weirdroot", [item("core:market:107")]],
    [61, 66, "Schlafenkraut", [item("core:market:105")]],
    [67, 72, "Healing Poultice", [item("core:market:110")]],
    [73, 77, "Lockpicks", [item("core:gear:lockpicks")]],
    [78, 82, "Map", [item("core:gear:map")]],
    [83, 87, "Writing Kit", [item("core:gear:writing-kit")]],
    [88, 92, "Hand Mirror", [item("core:gear:hand-mirror")]],
    [93, 96, "Silver brooch", [jewellery("Silver brooch")]],
    [97, 99, "Silver earrings", [jewellery("Silver earrings")]],
    extra,
  ]),
  gold: table([
    [1, 20, "1 gold crown", [coin("gold")]],
    [21, 33, "1d3 gold crowns", [coin("gold", 1, 3)]],
    [34, 43, "Signet Ring", [item("core:gear:signet-ring")]],
    [44, 52, "Gold necklace", [jewellery("Gold necklace")]],
    [53, 60, "Gold bracelet", [jewellery("Gold bracelet")]],
    [61, 67, "Gem-set ring", [jewellery("Gem-set ring")]],
    [68, 74, "Perfume", [item("core:gear:perfume")]],
    [75, 81, "1d3 bottles of wine", [item("core:gear:wine-bottle", 1, 3)]],
    [82, 88, "Vitality Draught", [item("core:market:116")]],
    [89, 94, "Black lotus (sap)", [item("core:market:100")]],
    [
      95,
      99,
      "Jewelled pendant and 1 gold crown",
      [jewellery("Jewelled pendant"), coin("gold")],
    ],
    extra,
  ]),
};

const catalogue = (R) => [...R.weapons, ...R.armour, ...R.gear, ...R.market];
const lootDrops = [LOOT_TABLE, ...Object.values(LOOT_TABLES)].flatMap((rows) =>
  rows.flatMap((row) => row.drops),
);
export const lootName = (row) =>
  row.coin
    ? LOOT_COINS[row.coin][row.quantity === 1 ? 0 : 1]
    : row.variant || row.entry.name;
export const lootText = (row) =>
  row.coin
    ? `${displayNumber(row.quantity)} ${lootName(row)}`
    : `${displayNumber(row.quantity)} × ${lootName(row)}`;
export const lootLines = (rows = []) =>
  rows.map((row) => `Loot: ${lootText(row)}`);
export const resolveGMLoot = (R, rows = []) =>
  rows.map((row) => ({
    ...row,
    ...(row.id
      ? { entry: catalogue(R).find((e) => e.contentId === row.id) }
      : {}),
  }));

export function validateGMLoot(R, rows) {
  if (!Array.isArray(rows) || rows.length > 1000)
    throw Error("Invalid loot list.");
  const entries = catalogue(R);
  for (const row of rows) {
    if (
      !row ||
      typeof row !== "object" ||
      Array.isArray(row) ||
      (Object.hasOwn(row, "location") &&
        !["carried", "lair"].includes(row.location)) ||
      !Number.isInteger(row.quantity) ||
      row.quantity < 1 ||
      row.quantity > MAX_LOOT_QUANTITY ||
      typeof row.key !== "string" ||
      !/^gm-[a-z0-9-]+$/.test(row.key) ||
      Object.keys(row).length !==
        3 +
          Number(Object.hasOwn(row, "location")) +
          Number(Object.hasOwn(row, "variant")) ||
      Object.keys(row).some(
        (key) =>
          !["key", "location", "quantity", "id", "coin", "variant"].includes(
            key,
          ),
      ) ||
      (row.id
        ? !(
            lootDrops.some(
              (drop) => drop.id === row.id && drop.variant === row.variant,
            ) &&
            (!Object.hasOwn(row, "variant") ||
              typeof row.variant === "string") &&
            entries.some((e) => e.contentId === row.id)
          ) || Object.hasOwn(row, "coin")
        : !Object.hasOwn(LOOT_COINS, row.coin) ||
          Object.hasOwn(row, "id") ||
          Object.hasOwn(row, "variant"))
    )
      throw Error("Invalid loot entry.");
  }
  if (new Set(rows.map((r) => r.key)).size !== rows.length)
    throw Error("Duplicate loot identity.");
}

// Resolves one click, including automatic extra results and quantity dice.
// An injected die is used only by deterministic tests.
export function rollGMLoot(R, roller = die, tier) {
  if (tier !== undefined && !Object.hasOwn(LOOT_TABLES, tier))
    throw Error("Choose Brass, Silver or Gold loot.");
  const table = tier === undefined ? LOOT_TABLE : LOOT_TABLES[tier];
  const source =
    tier === undefined
      ? LOOT_SOURCE
      : {
          kind: "app",
          table: `additional-loot-${tier}-v1`,
          name: `${LOOT_TIERS[tier]} loot · app table v1`,
        };
  const entries = [],
    rolls = [],
    outcomes = [];
  let error = "";
  const roll = (label, count, sides) => {
    if (rolls.length >= MAX_LOOT_DICE)
      throw Error(
        "Too many consecutive extra rolls. Roll again to try fresh results.",
      );
    const faces = Array.from({ length: count }, () => roller(sides));
    if (
      faces.some((face) => !Number.isInteger(face) || face < 1 || face > sides)
    )
      throw Error("Invalid loot die result.");
    const total = faces.reduce((sum, face) => sum + face, 0);
    rolls.push({
      label: `Loot: ${label}`,
      count,
      sides,
      faces,
      total,
      at: new Date().toISOString(),
      page: 0,
      source: { ...source },
    });
    return total;
  };
  const resolve = (extra = false) => {
    let face, result;
    do {
      face = roll(extra ? "extra d100 (reroll 00)" : "d100", 1, 100);
      result = table.find((r) => face >= r.min && face <= r.max);
      outcomes.push({
        face,
        label: result.label,
        rerolled: extra && face === 100,
      });
    } while (extra && face === 100);
    if (face === 100) {
      resolve(true);
      resolve(true);
      return;
    }
    for (const drop of result.drops) {
      const entry =
        drop.id && catalogue(R).find((e) => e.contentId === drop.id);
      if (drop.id && !entry)
        throw Error("A loot item is missing from the catalogue.");
      const name = drop.coin
        ? LOOT_COINS[drop.coin][1]
        : drop.variant || entry.name;
      const quantity = drop.sides
        ? roll(`${name} quantity`, drop.count, drop.sides)
        : drop.count;
      entries.push({
        quantity,
        ...(drop.id ? { id: drop.id } : { coin: drop.coin }),
        ...(drop.variant ? { variant: drop.variant } : {}),
      });
    }
  };
  try {
    resolve();
  } catch (problem) {
    error = problem.message;
    entries.length = 0;
  }
  return { entries, rolls, outcomes, error };
}

export function addGMLoot(R, draft, entries) {
  if (!Array.isArray(entries) || !entries.length || entries.length > 18)
    throw Error("Roll some loot before adding it.");
  const next = (draft.loot || []).map(({ location, ...row }) => ({ ...row }));
  for (const entry of entries) {
    const row = { ...entry, key: `gm-${crypto.randomUUID()}` };
    validateGMLoot(R, [row]);
    const existing = next.find(
      (x) =>
        x.id === row.id && x.coin === row.coin && x.variant === row.variant,
    );
    if (existing) existing.quantity += row.quantity;
    else next.push(row);
  }
  validateGMLoot(R, next);
  draft.loot = next;
}
