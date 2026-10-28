import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library } from "./fixture.mjs";
import { loadReferenceLibrary } from "../src/engine/search-library.mjs";
import { searchBooks } from "../src/engine/search-ranking.mjs";
import { criticalChoices } from "../src/engine/critical-wounds.mjs";
import { referenceBodyHTML } from "./reference-render.mjs";
import { searchLabel } from "../src/engine/search-presentation.mjs";
import { createReferenceLinker } from "../src/engine/book-search-links.mjs";

const wire = JSON.parse(
  await readFile(
    new URL("../public/data/search-library.json", import.meta.url),
    "utf8",
  ),
);
const { rows } = await loadReferenceLibrary(library, () => wire);
const search = (query, category = "all", filters = {}) =>
  searchBooks(rows, query, Infinity, { category, filters }).rows;

test("the Injuries category includes all 18 reviewed core injury references and both severities", () => {
  const injuries = search("", "injury", { book: "core" });
  assert.equal(injuries.length, 18);
  assert.equal(search("injuries", "injury").length, 18);
  assert.equal(search("injury", "injury").length, 18);
  for (const name of [
    "Broken Bone (Minor)",
    "Broken Bone (Major)",
    "Torn Muscle (Minor)",
    "Torn Muscle (Major)",
  ]) {
    const row = injuries.find((row) => row.name === name);
    assert.deepEqual(row.entry.source, { book: "core", page: 177 });
    assert.equal(row.entry.descriptionStatus, "reviewed");
    assert.equal(searchLabel(row), "Injury");
  }
  assert.equal(search("", "injury", { book: "up-in-arms" }).length, 0);
  for (const query of [
    "Torn Muscle",
    "Torn Muscles",
    "Broken Bone",
    "Broken Bones",
  ]) {
    assert.equal(search(query, "injury").length, 2);
  }
  assert.ok(
    search("Torn Muscle")
      .slice(0, 2)
      .every((row) => row.kind === "injury"),
  );
});

test("Torn Muscle entries preserve penalties, leg Movement, healing phases and Heal limits", () => {
  const minor = search("Torn Muscle (Minor)", "injury")[0];
  const major = search("Torn Muscle (Major)", "injury")[0];
  assert.match(minor.entry.text, /injured location suffer -1 SL/);
  assert.match(minor.entry.text, /leg injury also halves Movement/);
  assert.match(minor.entry.text, /30 - Toughness Bonus days/);
  assert.match(
    minor.entry.text,
    /reduces this time once by 1 day, plus 1 further day per SL after the first/,
  );
  assert.match(major.entry.text, /-2 SL to all Tests/);
  assert.match(major.entry.text, /penalty for using the limb falls to -1 SL/);
  assert.match(major.entry.text, /another 30 - Toughness Bonus days/);
  assert.match(
    major.entry.text,
    /Heal can diagnose the damage but does not shorten recovery/,
  );
  const html = referenceBodyHTML(minor);
  assert.match(html, /<h3>Effects<\/h3>/);
  assert.match(html, /<h3>Healing<\/h3>/);
  assert.match(html, /Mechanical summary/);
});

test("injury references retain lasting damage and all eleven amputation locations", () => {
  const bone = search("Broken Bone (Minor)", "injury")[0];
  assert.match(bone.entry.text, /30 \+ 1d10 days/);
  assert.match(bone.entry.text, /within one week/);
  assert.match(bone.entry.text, /binding comes undone/);
  assert.match(
    search("Broken Bone (Major)", "injury")[0].entry.text,
    /permanent -2 Movement and -20 Agility/,
  );
  const parts = search("Amputated Parts", "injury")[0];
  assert.deepEqual(parts.entry.source, { book: "core", page: "177–178" });
  assert.match(parts.entry.text, /-1 SL or worse also gives Stunned/);
  assert.match(parts.entry.text, /-4 SL or worse, gain Unconscious/);
  assert.match(parts.entry.text, /All amputations need Surgery/);
  assert.equal(
    rows.filter((row) => row.kind === "injury" && row.name.startsWith("Lost "))
      .length,
    11,
  );
  assert.equal(search("Lost Teeth", "injury")[0].entry.source.page, "178–179");
  assert.equal(search("Lost Tongue", "injury")[0].entry.source.page, 179);
  assert.match(
    search("Lost Foot", "injury")[0].entry.text,
    /toes previously lost from that foot/,
  );
  assert.match(
    search("Impressive Scars", "injury")[0].entry.text,
    /GM’s agreement/,
  );
});

test("critical wounds chain to exact injury severity without restoring unrelated Rules", () => {
  const wound = search("Sprain", "critical")[0];
  const segments = createReferenceLinker(rows)(wound.entry.text, wound);
  assert.ok(
    segments.some(
      (part) =>
        part.text === "Torn Muscle (Minor)" &&
        part.keys?.includes("core:reference:177-torn-muscle-minor"),
    ),
  );
  assert.ok(rows.every((row) => row.kind !== "rule"));
  assert.equal(search("Replenishing Fate").length, 0);
});

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
