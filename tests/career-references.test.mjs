import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library, R } from "./fixture.mjs";
import { buildSearchIndex } from "../dist/book-search.mjs";
import { loadReferenceLibrary } from "../dist/search-library.mjs";
import {
  createCareerReferenceIndex,
  careerReferencesHTML,
  validateCareerOptions,
} from "../dist/career-references.mjs";

const wire = JSON.parse(
  await readFile(
    new URL("../dist/data/search-library.json", import.meta.url),
    "utf8",
  ),
);
const payload = await loadReferenceLibrary(library, () => wire);
const lookup = createCareerReferenceIndex(payload.rows);
const reference = (kind, name) =>
  payload.rows.find(
    (row) =>
      row.kind === kind &&
      row.name === name &&
      row.entry.source.book === "core",
  );

test("Skills and Talents list actual Career levels from the shared all-book library", () => {
  const before = JSON.stringify(payload);
  const animal = lookup(reference("skill", "Animal Care"));
  assert.deepEqual(
    animal.find((match) => match.career.entry.id === "wizard").levels,
    [3],
  );
  assert.deepEqual(
    lookup(reference("talent", "Strong Back")).find(
      (match) => match.career.entry.id === "soldier",
    ).levels,
    [1],
  );
  assert.ok(
    animal.some((match) => match.career.entry.source.book === "up-in-arms"),
  );
  assert.deepEqual(
    lookup(reference("skill", "Lore (Alchemy)")).find(
      (match) => match.career.entry.id === "wizard",
    ).levels,
    [1, 4],
  );
  assert.ok(
    !lookup(reference("skill", "Channelling (Magick)")).some(
      (match) => match.career.entry.id === "wizard",
    ),
    "Any Colour does not include Magick",
  );
  assert.equal(JSON.stringify(payload), before);
});

test("repeated listings and explicit Career variants keep distinct source keys without context duplicates", () => {
  const matches = lookup(reference("skill", "Animal Care"));
  const hedge = matches.filter((match) => match.career.name === "Hedge Witch");
  assert.equal(hedge.length, 2);
  assert.deepEqual(
    hedge.find((match) => match.career.entry.source.book === "core").levels,
    [3],
  );
  assert.deepEqual(
    hedge.find(
      (match) => match.career.entry.source.book === "archives-iii-hedge",
    ).levels,
    [1, 3],
  );
  assert.equal(
    new Set(matches.map((match) => match.career.key)).size,
    matches.length,
  );
  assert.deepEqual(
    matches.map((match) => match.career.name),
    matches
      .map((match) => match.career.name)
      .sort((a, b) => a.localeCompare(b)),
  );
});

test("group references aggregate specialisations while exact references never use substring matching", () => {
  const matches = lookup(reference("skill", "Melee"));
  assert.ok(
    matches.length > lookup(reference("skill", "Melee (Cavalry)")).length,
  );
  const skill = (name) => ({ kind: "skill", name, entry: { name: "Melee" } });
  assert.deepEqual(
    lookup(skill("Melee (Two-handed)")),
    lookup(skill("Melee (Two-Handed)")),
  );
  assert.deepEqual(
    lookup({
      kind: "skill",
      name: "Melee (Basic)",
      entry: { name: "Melee (Basic)" },
    }),
    lookup(reference("skill", "Melee (Basic)")),
    "A specialised profile name still uses exact membership",
  );
  assert.deepEqual(lookup(skill("Melee (Basic Extra)")), []);
  assert.deepEqual(
    lookup({ kind: "equipment", name: "Animal Care", entry: {} }),
    [],
  );
});

test("as Trade Talent choices use the Career's available Trade training at the listed level", () => {
  const copy = structuredClone(R),
    career = copy.careers[0];
  copy.careers = [career];
  career.levels.forEach((level) => {
    level.skills = [];
    level.talents = [];
  });
  career.levels[0].skills = ["Trade (Tailor)"];
  career.levels[1].talents = ["Craftsman (as Trade)"];
  career.levels[2].skills = ["Trade (Smith)"];
  const row = buildSearchIndex(copy).find((row) => row.kind === "career");
  assert.deepEqual(row.careerOptions[1].talents, ["Craftsman (Tailor)"]);
});

test("Career table is escaped, links exact source variants and explains empty lists", () => {
  const row = reference("skill", "Animal Care");
  const html = careerReferencesHTML(row, lookup(row), payload.books);
  assert.match(html, /<table>/);
  assert.match(html, /scope="row"/);
  assert.match(html, /Careers with this skill/);
  assert.match(html, /Other prerequisites still apply/);
  assert.match(html, /L3<\/b> Master Wizard/);
  assert.match(
    html,
    /data-reference-keys="\[&quot;career:core:careers:hedge-witch:Hedge Witch/,
  );
  assert.match(html, /archives-iii-hedge/);
  const evil = structuredClone(lookup(row).slice(0, 1));
  evil[0].career.name = '<img onerror="x">';
  assert.ok(!careerReferencesHTML(row, evil, payload.books).includes("<img"));
  assert.match(
    careerReferencesHTML(row, [], payload.books),
    /No listed Career offers this skill/,
  );
  assert.equal(
    careerReferencesHTML({ kind: "equipment" }, [], payload.books),
    "",
  );
});

test("lazy reference loading rejects missing, mismatched and malformed Career options", async () => {
  for (const mutate of [
    (row) => delete row.careerOptions,
    (row) => row.careerOptions.pop(),
    (row) => row.careerOptions[0].skills.push(null),
    (row) => row.careerOptions[0].skills.push(row.careerOptions[0].skills[0]),
    (row) => (row.careerOptions[0].invented = []),
  ]) {
    const copy = structuredClone(wire);
    mutate(
      copy.rows.find((row) => row.kind === "career" && !row.printedReference),
    );
    await assert.rejects(
      loadReferenceLibrary(library, () => copy),
      /Career references/,
    );
  }
  assert.throws(
    () => validateCareerOptions({ kind: "skill", careerOptions: [] }),
    /Invalid Career/,
  );
});
