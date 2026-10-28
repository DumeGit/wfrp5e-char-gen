import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library } from "./fixture.mjs";
import { loadReferenceLibrary } from "../src/engine/search-library.mjs";
import { searchBooks } from "../src/engine/search-ranking.mjs";
import {
  RUNE_LABELS,
  filterOptions,
  searchFilterFields,
  changeSearchFilter,
} from "../src/engine/search-filters.mjs";
import { createReferenceLinker } from "../src/engine/book-search-links.mjs";
import { createSearchEngine } from "../src/engine/search-engine.mjs";
import { createWorkerHandler } from "../src/engine/search-worker.mjs";
const wire = JSON.parse(
  await readFile(
    new URL("../public/data/search-library.json", import.meta.url),
    "utf8",
  ),
);
const { rows } = await loadReferenceLibrary(library, () => wire);
const browse = (category, filters = {}, query = "") =>
  searchBooks(rows, query, Infinity, { category, filters }).rows;
test("category filters combine with the book and text query; browsing stays alphabetical", () => {
  const soldiers = browse(
    "career",
    { class: "Warrior", species: "Human", book: "core" },
    "Soldier",
  );
  assert.equal(soldiers[0].name, "Soldier");
  assert.equal(
    browse(
      "career",
      { class: "Academic", species: "Human", book: "core" },
      "Soldier",
    ).length,
    0,
  );
  const ogres = browse("career", { species: "Ogre" });
  assert.ok(ogres.some((row) => row.name === "Soldier"));
  assert.ok(!ogres.some((row) => row.name === "Wizard"));
  const skills = browse("skill", {
    type: "Advanced",
    characteristic: "Int",
    book: "core",
  });
  assert.ok(skills.length > 10);
  assert.ok(
    skills.every((row) => row.entry.advanced && row.entry.char === "Int"),
  );
  assert.deepEqual(
    skills.map((row) => row.name),
    skills.map((row) => row.name).sort((a, b) => a.localeCompare(b)),
  );
  assert.ok(
    browse("mutation", { type: "Mental" }).every(
      (row) => row.entry.category === "Mental",
    ),
  );
  assert.equal(
    browse("all", { book: "blood-bramble" }, "Godspakt")[0].name,
    "Godspakt",
  );
  assert.equal(browse("all", { book: "core" }, "Godspakt").length, 0);
  assert.ok(browse("all", { book: "blood-bramble" }).length > 10);
  assert.ok(
    browse("career", { book: "archives-iii" }).some(
      (row) => row.entry.source.book === "archives-iii-hedge",
    ),
  );
  assert.deepEqual(
    [...new Set(rows.map((row) => row.filterValues.book[0]))].sort(),
    library.packs
      .filter(
        (p) =>
          p.manifest.kind !== "variant" &&
          !["bayl-many-eyes", "night-parade"].includes(p.manifest.id),
      )
      .map((p) => p.manifest.id)
      .sort(),
  );
  for (const book of ["bayl-many-eyes", "night-parade"]) {
    assert.ok(wire.books.some((entry) => entry.id === book));
    assert.equal(
      browse("all", { book }).length,
      0,
      "books with only excluded Rules/profiles have no available filter results",
    );
  }
  assert.equal(
    browse("all", { class: "Warrior" }, "Soldier").length,
    0,
    "stale unsupported filters cannot silently apply",
  );
});
test("Rune labels, applicability and Techniques remain distinct from Spells, Prayers and Cants", () => {
  assert.deepEqual(filterOptions(rows, "rune", "label"), RUNE_LABELS);
  const masters = browse("rune", {
    label: "Master Rune",
    applicable: "Armour",
  });
  assert.equal(masters.length, 3);
  assert.ok(
    masters.every((row) => row.entry.form === "Armour" && row.entry.master),
  );
  assert.ok(browse("rune", { label: "Armour Rune" }).length > masters.length);
  assert.equal(
    browse("rune", { label: "Weapon Rune", applicable: "Armour" }).length,
    0,
  );
  assert.equal(browse("rune", { label: "No label" }).length, 0);
  assert.ok(browse("technique").length);
  assert.ok(
    browse("magic").every((row) => !["Rune", "Technique"].includes(row.label)),
  );
  const cants = browse("magic", { type: "Cant", lore: "Fire" });
  assert.equal(cants.length, 3);
  assert.ok(
    cants.every((row) => row.label === "Cant" && row.entry.lore === "Fire"),
  );
  assert.ok(
    browse("magic", { type: "Miracle", lore: "Ranald" }).some(
      (row) => row.name === "Cheat the Odds",
    ),
  );
  assert.ok(
    browse("magic", { type: "Blessing", lore: "Old Faith" }).length >= 19,
  );
  assert.ok(
    browse("magic", {
      type: "Lore spell",
      lore: "Light",
      book: "winds-of-magic",
    }).some((row) => row.printedReference),
  );
  assert.ok(
    browse("property", {
      type: "Flaw",
      applicable: "Weapons",
      book: "up-in-arms",
    }).some((row) => row.name === "Crewed"),
  );
  assert.ok(
    browse("equipment", { type: "Containers & carrying" }).some(
      (row) => row.name === "Backpack",
    ),
  );
  assert.ok(
    browse("equipment", { type: "Food & drink" }).some(
      (row) => row.name === "Food, groceries/day",
    ),
  );
  assert.ok(
    browse("equipment", { type: "Books & documents" }).some(
      (row) => row.name === "Map",
    ),
  );
  assert.ok(
    browse("equipment", { type: "Weapons" }).some(
      (row) => row.name === "Dagger",
    ),
  );
  assert.ok(
    !browse("equipment", { type: "Not specified" }).some(
      (row) => row.name === "Dagger",
    ),
  );
});

test("Trappings share the reviewed dependent groups and preserve correlated shield/weapon paths", () => {
  const equipment = rows.filter((row) => row.kind === "equipment");
  assert.equal(filterOptions(rows, "equipment", "type").length, 14);
  assert.ok(
    equipment.every(
      (row) => !row.filterValues.type.includes("Other trappings"),
    ),
  );
  assert.deepEqual(
    searchFilterFields(rows, "equipment").map(([key]) => key),
    ["type"],
  );
  assert.deepEqual(searchFilterFields(rows, "equipment", { type: "Weapons" }), [
    ["type", "Trapping type"],
    ["group", "Weapon type"],
  ]);
  const selected = {
    type: "Weapons",
    group: "Ranged",
    weaponGroup: "Engineering",
  };
  assert.equal(searchFilterFields(rows, "equipment", selected).length, 3);
  assert.ok(
    filterOptions(rows, "equipment", "weaponGroup", selected).includes(
      "Engineering",
    ),
  );
  assert.ok(
    !filterOptions(rows, "equipment", "weaponGroup", {
      type: "Weapons",
      group: "Melee",
    }).includes("Bow"),
  );
  const engineering = browse(
    "equipment",
    { ...selected, book: "core" },
    "pistol",
  );
  assert.ok(engineering.length);
  assert.ok(
    engineering.every((row) =>
      row.trappingPaths.some(
        (path) => path.join("/") === "Weapons/Ranged/Engineering",
      ),
    ),
  );
  assert.ok(
    browse("equipment", {
      type: "Armour & shields",
      group: "Shields",
      book: "core",
    }).some((row) => row.name === "Buckler"),
  );
  assert.equal(
    browse("equipment", { type: "Armour & shields", group: "Melee" }, "Buckler")
      .length,
    0,
  );
  assert.deepEqual(
    changeSearchFilter("equipment", selected, "type", "Armour & shields"),
    { type: "Armour & shields" },
  );
  assert.deepEqual(changeSearchFilter("equipment", selected, "group", ""), {
    type: "Weapons",
    group: "",
  });
  assert.deepEqual(
    changeSearchFilter(
      "magic",
      { type: "Miracle", lore: "Ranald" },
      "type",
      "Blessing",
    ),
    { type: "Blessing", lore: "Ranald" },
  );
});

test("source-only Trappings use reviewed groups without inventing weapon Skills", () => {
  const artillery = browse("equipment", {
    type: "Weapons",
    group: "Artillery references",
    book: "lustria",
  });
  assert.equal(artillery.length, 5);
  assert.ok(
    artillery.every((row) =>
      row.filterValues.weaponGroup.includes("Not specified"),
    ),
  );
  assert.ok(
    browse("equipment", { type: "Food & drink", group: "Drink" }).some(
      (row) => row.name === "Tavern drink: Legendary Wine",
    ),
  );
  assert.ok(
    browse("equipment", { type: "Travel & camping", group: "Lodging" }).some(
      (row) => row.name === "Tavern board: Room",
    ),
  );
  assert.ok(
    browse("equipment", {
      type: "Armour & shields",
      group: "Additional armour",
    }).some((row) => row.printedReference && row.name === "Sea Dragon Cloak"),
  );
});
test("library rejects malformed or missing filter metadata without mutating source entries", async () => {
  for (const change of [
    (row) => delete row.filterValues,
    (row) => (row.filterValues.book = ["wrong-book"]),
    (row) => (row.filterValues.injected = ["x"]),
  ]) {
    const bad = structuredClone(wire);
    change(bad.rows[0]);
    await assert.rejects(
      loadReferenceLibrary(library, () => bad),
      /filters/,
    );
  }
  const bad = structuredClone(wire),
    rune = bad.rows.find((row) => row.label === "Rune");
  rune.filterValues.label = ["Ordinary"];
  await assert.rejects(
    loadReferenceLibrary(library, () => bad),
    /filters/,
  );
  assert.ok(rows.every((row) => !row.entry.filterValues));
  for (const change of [
    (row) => delete row.trappingPaths,
    (row) => row.trappingPaths.push(["Wrong type"]),
    (row) => row.trappingPaths.push(["Weapons", "", "Engineering"]),
  ]) {
    const bad = structuredClone(wire);
    change(bad.rows.find((row) => row.kind === "equipment"));
    await assert.rejects(
      loadReferenceLibrary(library, () => bad),
      /filters/,
    );
  }
});
test("worker and fallback return identical filtered results under concurrent searches", async () => {
  class Worker {
    callbacks = {};
    handle = createWorkerHandler((data) => this.callbacks.message({ data }));
    addEventListener(name, callback) {
      this.callbacks[name] = callback;
    }
    postMessage(data) {
      setTimeout(() => this.handle(data), data.query === "Soldier" ? 5 : 0);
    }
    terminate() {}
  }
  const worker = createSearchEngine(rows, () => new Worker());
  const fallback = createSearchEngine(rows, () => {
    throw Error("disabled");
  });
  for (const [query, category, filters] of [
    ["Soldier", "career", { species: "Ogre" }],
    ["", "rune", { label: "Master Rune", applicable: "Armour" }],
    ["", "magic", { type: "Cant", lore: "Fire" }],
    ["Godspakt", "all", { book: "blood-bramble" }],
    ["critical wounds", "critical", { location: "Arm", book: "core" }],
    ["mutations", "mutation", { type: "Mental", book: "core" }],
    ["Torn Muscle", "injury", { book: "core" }],
    [
      "",
      "equipment",
      {
        type: "Weapons",
        group: "Ranged",
        weaponGroup: "Engineering",
        book: "core",
      },
    ],
    ["Buckler", "equipment", { type: "Armour & shields", group: "Shields" }],
  ]) {
    const [a, b] = await Promise.all([
      worker.search(query, category, filters),
      fallback.search(query, category, filters),
    ]);
    assert.deepEqual(a, b);
    assert.ok(a.rows.length);
  }
  const results = await Promise.all([
    worker.search("Soldier", "career", { class: "Warrior" }),
    worker.search("", "skill", { characteristic: "Dex" }),
  ]);
  assert.equal(results[0].rows[0].name, "Soldier");
  assert.ok(results[1].rows.every((row) => row.entry.char === "Dex"));
  worker.dispose();
  fallback.dispose();
});

test("printed High Elf Careers are Academic and Spell Familiar stays outside search and chaining", () => {
  const academic = browse("career", { class: "Academic", book: "high-elf" });
  for (const name of [
    "Mage",
    "Smith-priest of Vaul",
    "Storm Weaver",
    "Loremaster of Hoeth",
  ])
    assert.ok(
      academic.some((row) => row.name === `${name} — printed Career`),
      name,
    );
  assert.ok(!filterOptions(rows, "career", "class").includes("Not specified"));
  const key = "winds-of-magic:reference:188-spell-familiar";
  assert.ok(!rows.some((row) => row.key === key));
  assert.ok(
    !browse("all", {}, "Spell Familiar").some((row) => row.key === key),
  );
  assert.ok(
    !createReferenceLinker(rows)("Spell Familiar").some((part) =>
      part.keys?.includes(key),
    ),
  );
  assert.ok(
    browse("magic", { book: "winds-of-magic" }, "Create Familiar").length > 0,
    "removing the introduction must retain the familiar ritual",
  );
});
