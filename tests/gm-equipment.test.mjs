import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assembleGMOptions } from "../src/engine/gm/books.mjs";
import { freshGM, calculateGM } from "../src/engine/gm/model.mjs";
import {
  pickerEntries,
  searchPickerEntries,
} from "../src/engine/gm/pickers.mjs";
import {
  filterEquipment,
  equipmentFilterOptions,
} from "../src/engine/trapping-groups.mjs";
import { sheetSections } from "../src/engine/gm/pdf.mjs";
import { cardSections } from "../src/engine/gm/print.mjs";

const R = assembleGMOptions(
  JSON.parse(
    await readFile(
      new URL("../public/data/book-library.json", import.meta.url),
    ),
  ),
);
const data = JSON.parse(
  await readFile(new URL("../public/gm/data.json", import.meta.url)),
);
const rows = pickerEntries(data, R, null, "equipment");

test("every integrated trapping is reviewed and reachable without changing catalogue identities", () => {
  const expected = [...R.weapons, ...R.armour, ...R.gear, ...R.market].filter(
    (x, i, all) => all.findIndex((y) => y.name === x.name) === i,
  );
  assert.deepEqual(
    new Set(rows.map((x) => x.key)),
    new Set(expected.map((x) => x.contentId)),
  );
  assert.deepEqual(
    rows.filter((x) => x.trappingPath[0] === "Other trappings"),
    [],
  );
  assert.equal(equipmentFilterOptions(rows).length, 14);
  assert.ok(rows.length > 400);
  for (const entry of rows)
    for (const path of entry.trappingPaths) {
      for (let depth = 0; depth < path.length; depth++)
        assert.ok(
          equipmentFilterOptions(rows, path.slice(0, depth)).includes(
            path[depth],
          ),
          entry.name,
        );
      assert.ok(filterEquipment(rows, path).some((x) => x.key === entry.key));
    }
});

test("dependent weapon groups, shields, references and ammunition keep meaningful groups", () => {
  const engineering = filterEquipment(rows, [
    "Weapons",
    "Ranged",
    "Engineering",
  ]);
  assert.ok(engineering.length >= 3);
  assert.ok(
    engineering.every((x) => x.kind === "ranged" && x.group === "Engineering"),
  );
  assert.ok(
    equipmentFilterOptions(rows, ["Weapons", "Ranged"]).includes("Engineering"),
  );
  assert.ok(
    !equipmentFilterOptions(rows, ["Weapons", "Melee"]).includes("Bow"),
  );
  const shields = filterEquipment(rows, ["Armour & shields", "Shields"]);
  for (const name of ["Buckler", "Shield", "Ironfist"])
    assert.ok(
      shields.some((x) => x.name === name),
      name,
    );
  assert.ok(
    filterEquipment(rows, ["Ammunition", "Artillery ammunition"]).some(
      (x) => x.name === "Bolt (Ballista)",
    ),
  );
  assert.ok(
    filterEquipment(rows, ["Ammunition", "Shot & powder"]).some(
      (x) => x.name === "Leadbelcher Ball (1)",
    ),
  );
  assert.ok(
    filterEquipment(rows, ["Armour & shields", "Armour references"]).some(
      (x) => x.name === "Ithiltaen Helm" && x.ap === undefined,
    ),
  );
  assert.ok(searchPickerEntries(engineering, "pistol").length);
  assert.ok(
    searchPickerEntries(rows, "engineering").some(
      (x) => x.group === "Engineering",
    ),
  );
  assert.deepEqual(searchPickerEntries(shields, "totally absent item"), []);
});

test("both PDF layouts include actual armour, shields, weapons and quantities under Gear once", () => {
  const p = data.profiles.find((x) => x.name === "Human");
  const s = freshGM(data, p.id);
  s.optionalArmour = p.armour.map((a) => a.key);
  s.optionalAttacks = p.attacks.filter((a) => a.optional).map((a) => a.key);
  for (const [name, quantity] of [
    ["Leather Jack", 2],
    ["Backpack", 3],
    ["Shield", 1],
  ]) {
    const entry = rows.find((x) => x.name === name);
    s.gear.push({ key: `gm-test-${name}`, id: entry.key, quantity });
  }
  const result = calculateGM(data, R, s);
  for (const sections of [sheetSections(result, s), cardSections(result, s)]) {
    const gear = Object.fromEntries(sections).Gear;
    const text = Array.isArray(gear) ? gear.join("; ") : gear;
    for (const item of [
      "Light Armour",
      "Medium Armour",
      "Shield",
      "Hand Weapon",
      "Bow and Arrows",
      "2 × Leather Jack",
      "3 × Backpack",
    ])
      assert.ok(text.includes(item), item);
    assert.equal(text.match(/Shield/g).length, 1);
    assert.equal(text.match(/Leather Jack/g).length, 1);
    assert.doesNotMatch(
      JSON.stringify(Object.fromEntries(sections).Soak),
      /Armour|Shield|Leather/,
    );
  }
  s.optionalArmour = [];
  s.optionalAttacks = [];
  s.gear = [];
  const removed = calculateGM(data, R, s);
  assert.doesNotMatch(
    JSON.stringify(Object.fromEntries(cardSections(removed, s)).Gear),
    /Armour|Shield|Bow/,
  );
});

test("natural protection and body attacks do not become possessions", () => {
  const s = freshGM(data, data.profiles.find((x) => x.name === "Griffon").id);
  const r = calculateGM(data, R, s);
  for (const sections of [sheetSections(r, s), cardSections(r, s)])
    assert.doesNotMatch(
      JSON.stringify(Object.fromEntries(sections).Gear) || "",
      /Hide|Claws|Talons|Bite/,
    );
});
