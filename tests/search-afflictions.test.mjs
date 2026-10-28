import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library } from "./fixture.mjs";
import { loadReferenceLibrary } from "../src/engine/search-library.mjs";
import { searchBooks } from "../src/engine/search-ranking.mjs";
import { criticalChoices } from "../src/engine/critical-wounds.mjs";
import { referenceBodyHTML } from "./reference-render.mjs";
import { searchLabel } from "../src/engine/search-presentation.mjs";

const wire = JSON.parse(
  await readFile(
    new URL("../public/data/search-library.json", import.meta.url),
    "utf8",
  ),
);
const { rows } = await loadReferenceLibrary(library, () => wire);
const search = (query, category = "all", filters = {}) =>
  searchBooks(rows, query, Infinity, { category, filters }).rows;

test("all 80 core Critical Wounds are individual results with the exact reviewed table effects", () => {
  const wounds = rows.filter((row) => row.kind === "critical");
  const choices = criticalChoices(rows);
  assert.equal(wounds.length, 80);
  assert.equal(
    choices.length,
    80,
    "projected results must not duplicate manager choices",
  );
  for (const choice of choices) {
    const row = wounds.find((row) => row.key === choice.id);
    assert.equal(row.name, choice.name);
    assert.equal(row.entry.text, choice.text);
    assert.equal(row.entry.roll, choice.roll);
    assert.equal(row.entry.referenceId, choice.referenceId);
    assert.equal(row.entry.location, choice.location);
    assert.deepEqual(row.entry.source, choice.source);
    assert.match(
      searchLabel(row),
      new RegExp(`Critical Wound · ${choice.location}`),
    );
  }
  for (const [location, page] of [
    ["Head", 173],
    ["Arm", 174],
    ["Body", 175],
    ["Leg", 176],
  ]) {
    const found = search("critical wounds", "critical", {
      location,
      book: "core",
    });
    assert.equal(found.length, 20);
    assert.ok(found.every((row) => row.entry.source.page === page));
  }
  assert.equal(search("", "critical", { book: "up-in-arms" }).length, 0);
  assert.equal(
    search("", "table").filter((row) =>
      /^(Head|Arm|Body|Leg) Critical Wounds$/.test(row.name),
    ).length,
    8,
  );
});

test("named wounds rank before whole tables and same-name locations stay distinct", () => {
  const cuts = search("Minor Cut");
  assert.deepEqual(
    cuts.slice(0, 3).map((row) => row.kind),
    ["critical", "critical", "critical"],
  );
  assert.deepEqual(
    cuts
      .slice(0, 3)
      .map((row) => row.entry.location)
      .sort(),
    ["Arm", "Head", "Leg"],
  );
  const arm = search("Minor Cut", "critical", { location: "Arm" });
  assert.equal(arm[0].name, "Minor Cut");
  assert.ok(
    arm.some((row) => row.name === "Deep Cut"),
    "effects still participate in matching",
  );
  assert.match(arm[0].entry.text, /Wounds: 1\. Gain 1 Bleeding/);
  const death = search("Shattered Skull", "critical")[0];
  assert.equal(death.entry.roll, "00 or more");
  assert.match(death.entry.text, /^Wounds: Death\./);
  assert.equal(
    search("Brutal Dismemberment", "critical")[0].entry.roll,
    "136 or more",
  );
  const html = referenceBodyHTML(death);
  assert.match(html, /Hit location<\/dt><dd>Head/);
  assert.match(html, /Roll \(d100\)<\/dt><dd>00 or more/);
  assert.match(html, /Mechanical summary/);
});

test("all 40 core mutations match generic queries, type filters and their printed source tables", () => {
  const mutations = search("mutations", "mutation", { book: "core" });
  assert.equal(mutations.length, 40);
  for (const type of ["Physical", "Mental"]) {
    const found = search(`${type} mutation`, "mutation", { type });
    assert.equal(found.length, 20);
    for (const row of found) {
      assert.deepEqual(row.entry.source, { book: "core", page: 189 });
      const table = rows.find((table) => table.key === row.entry.referenceId);
      assert.equal(table.name, `${type} Corruption Table`);
      assert.ok(table.entry.text.includes(row.name));
    }
  }
  assert.equal(search("Animalistic Legs")[0].kind, "mutation");
  assert.equal(
    search("Animalistic Legs", "mutation", { type: "Mental" }).length,
    0,
  );
  const last = search("Worried Jitters", "mutation")[0];
  assert.equal(last.entry.roll, "96–00");
  const html = referenceBodyHTML(last);
  assert.match(html, /Type<\/dt><dd>Mental/);
  assert.match(html, /Roll \(d100\)<\/dt><dd>96–00/);
});

test("loading rejects a mismatched wound location or a broken full-table reference", async () => {
  for (const change of [
    (payload, row) => {
      row.filterValues.location = ["Tail"];
    },
    (payload, row) => {
      payload.entries[row.entryRef].referenceId = "core:missing-table";
    },
    (payload, row) => {
      payload.entries[row.entryRef].referenceId =
        "core:reference:189-physical-corruption-table";
    },
  ]) {
    const payload = structuredClone(wire);
    const row = payload.rows.find((row) => row.kind === "critical");
    change(payload, row);
    await assert.rejects(
      loadReferenceLibrary(library, () => payload),
      /filters|source table/,
    );
  }
});
