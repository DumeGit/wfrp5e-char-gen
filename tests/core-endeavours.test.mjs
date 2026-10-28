import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library } from "./fixture.mjs";
import { loadReferenceLibrary } from "../src/engine/search-library.mjs";
import { searchBooks } from "../src/engine/search-ranking.mjs";
import { referenceBodyHTML } from "./reference-render.mjs";

const wire = JSON.parse(
  await readFile(
    new URL("../public/data/search-library.json", import.meta.url),
    "utf8",
  ),
);
const { rows } = await loadReferenceLibrary(library, () => wire);
const sources = JSON.parse(
  await readFile(
    new URL(
      "../content/sources/data/books/core/reference-entries.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const search = (query = "", category = "endeavour", book = "core") =>
  searchBooks(rows, query, Infinity, { category, filters: { book } }).rows;
const get = (name) => search().find((row) => row.name === name);

test("all 17 printed core Endeavours appear once with their correct source pages", () => {
  const actions = [
    ["Advance Career", 196],
    ["Animal Training", 196],
    ["Banking", 197],
    ["Change Career", 197],
    ["Combat Training", 197],
    ["Commission", "197–198"],
    ["Consult an Expert", "197–198"],
    ["Crafting", 198],
    ["Foment Dissent", 198],
    ["Income", 199],
    ["Invent!", 199],
    ["The Latest News", 200],
    ["Raise Reputation", 200],
    ["Research Lore", 200],
    ["Study a Mark", 201],
    ["Training", 201],
    ["Unusual Learning", 201],
  ];
  assert.deepEqual(
    search()
      .map((row) => row.name)
      .sort(),
    [...actions.map(([name]) => name), "Endeavours"].sort(),
  );
  for (const [name, page] of actions) {
    const row = get(name);
    assert.deepEqual(row.entry.source, { book: "core", page });
    assert.equal(row.entry.descriptionStatus, "reviewed");
    assert.equal(row.printedReference, true);
    assert.deepEqual(row.legacy, []);
  }
});

test("the consolidated overview retains its alias, weekly limits and obligations", () => {
  assert.equal(search("Common Endeavours")[0].name, "Endeavours");
  assert.ok(
    !rows.some((row) => row.key === "core:reference:196-common-endeavours"),
  );
  const text = get("Endeavours").entry.text;
  for (const phrase of [
    "one Endeavour per week",
    "up to three",
    "GM decides availability",
    "An elf spends one Endeavour",
    "does not apply when using",
    "Standing by 1",
    "restores 1 Standing",
    "Standing to 0",
    "level four to level three",
    "Keep all acquired Advances",
    "XP cost again",
  ])
    assert.ok(text.includes(phrase), phrase);
});

test("Animal Training remains a separate Skill and Endeavour rather than a name-based duplicate", () => {
  const results = search("Animal Training", "all").filter(
    (row) => row.name === "Animal Training",
  );
  assert.deepEqual(results.map((row) => row.kind).sort(), [
    "endeavour",
    "skill",
  ]);
  const text = get("Animal Training").entry.text;
  assert.match(text, /one of your animals/);
  assert.match(text, /Average \(\+2 SL\) Animal Training Test/);
  assert.match(text, /On success, add one skill/);
  assert.match(text, /Trained Creature Trait \(page 363\)/);
});

test("Crafting includes both lookup tables and the continuation formerly misplaced in Custom Gear", () => {
  const row = get("Crafting"),
    text = row.entry.text;
  for (const phrase of [
    "one quarter",
    "Extended Trade Test",
    "Common | Average (+2 SL)",
    "Scarce | Challenging (+0 SL)",
    "Rare | Difficult (-1 SL)",
    "Exotic | Very Hard (-3 SL)",
    "Brass | 5",
    "Silver | 10",
    "Gold | 15+",
    "Each Flaw halves",
    "Then add +5 SL for each Quality",
    "one roll",
    "unfinished work",
  ])
    assert.ok(text.includes(phrase), phrase);
  const html = referenceBodyHTML(row);
  assert.equal((html.match(/<table/g) || []).length, 2);
  assert.doesNotMatch(
    text,
    /CUSTOM GEAR|personal commissions from the Engineering Guild/,
  );
  assert.doesNotMatch(
    sources.find((entry) => entry.name === "Custom Gear").text,
    /The number of SL|Each Flaw/,
  );
});

test("Income embeds earnings, failed-Test rounding, event timing and the no-Income fallback", () => {
  const row = get("Income"),
    text = row.entry.text;
  for (const phrase of [
    "Average (+2 SL)",
    "first level",
    "current Career level",
    "2d10 brass pennies per Standing Level",
    "1d10 silver shillings per Standing Level",
    "1 gold crown per Standing Level",
    "halve the result, rounding down",
    "Character Events",
    "previous adventure’s unspent money is lost",
    "1 brass penny, 1 silver shilling or 1 gold crown",
    "Burdens of Power",
  ])
    assert.ok(text.includes(phrase), phrase);
  assert.match(referenceBodyHTML(row), /<table/);
});

test("Invent retains both stages, distinct costs, Skill requirements and GM authority", () => {
  assert.equal(search("Invent")[0].name, "Invent!");
  assert.equal(search("Invention")[0].name, "Invent!");
  const text = get("Invent!").entry.text;
  for (const phrase of [
    "two or more",
    "GM decides",
    "one Endeavour",
    "Trade (Engineer)",
    "each SL provides +1 SL",
    "Skills required for every component",
    "Very Hard (-3 SL)",
    "twice",
    "rarest component",
    "six times",
    "Consult an Expert",
  ])
    assert.ok(text.includes(phrase), phrase);
});

test("Raise Reputation uses maximum earnings and temporary Standing rather than a Status Tier increase", () => {
  const text = get("Raise Reputation").entry.text;
  for (const phrase of [
    "maximum Earnings",
    "4d10",
    "40 brass pennies",
    "Standing by +1",
    "until the next downtime",
    "unless your reputation is damaged",
  ])
    assert.ok(text.includes(phrase), phrase);
  assert.doesNotMatch(text, /Status Tier by/);
});

test("Banking and tutor Endeavours retain their distinct costs, risks and restrictions", () => {
  const banking = get("Banking").entry.text;
  for (const phrase of [
    "Silver or Gold Status only",
    "1–10",
    "percentage interest",
    "another Banking Endeavour",
    "at or below",
    "on 10 or less",
    "without spending an Endeavour",
  ])
    assert.ok(banking.includes(phrase), phrase);
  const commission = get("Commission").entry.text;
  assert.match(commission, /after the next adventure/);
  assert.match(commission, /two or more consecutive Commission Endeavours/);
  assert.match(commission, /GM permission/);
  assert.match(get("Training").entry.text, /normal XP plus a tutor fee/);
  assert.match(get("Training").entry.text, /Advanced Skills cost twice/);
  assert.match(
    get("Unusual Learning").entry.text,
    /cannot increase an existing Talent/,
  );
  assert.match(get("Unusual Learning").entry.text, /4d10 silver shillings/);
  assert.match(
    get("Consult an Expert").entry.text,
    /rather than supporting another Endeavour/,
  );
  assert.match(get("Foment Dissent").entry.text, /two Endeavours/);
});

test("supplement Endeavours remain separate and retain their original identities", () => {
  const other = rows.filter(
    (row) => row.kind === "endeavour" && row.entry.source.book !== "core",
  );
  assert.ok(other.length > 0);
  assert.equal(new Set(other.map((row) => row.key)).size, other.length);
  assert.ok(
    search("Alcatini Method", "endeavour", "up-in-arms").some(
      (row) => row.name === "Alcatini Method",
    ),
  );
  assert.equal(search("Alcatini Method").length, 0);
});
