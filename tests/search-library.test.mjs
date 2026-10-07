import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library, R, soldier } from "./fixture.mjs";
import { loadReferenceLibrary } from "../dist/search-library.mjs";
import { searchBooks } from "../dist/book-search.mjs";
import { referenceBodyHTML } from "../dist/reference-body.mjs";

const wire = JSON.parse(
  await readFile(
    new URL("../dist/data/search-library.json", import.meta.url),
    "utf8",
  ),
);
const full = await loadReferenceLibrary(library, () => wire);
const named = (name, kind) =>
  full.rows.filter((row) => row.name === name && (!kind || row.kind === kind));

test("one all-book reference corpus includes inactive books, explicit variants and withdrawn profiles without changing the draft", () => {
  const draft = soldier();
  const before = JSON.stringify(draft),
    coreBefore = JSON.stringify(R);
  assert.ok(!R.books.some((b) => b.id === "blood-bramble"));
  assert.equal(
    named("Godspakt", "magic")[0].entry.source.book,
    "blood-bramble",
  );
  assert.ok(
    named("Karak Ranger", "career").some(
      (r) => r.entry.source.book === "archives-i",
    ),
  );
  assert.ok(
    named("Karak Ranger", "career").some(
      (r) => r.entry.source.book === "dwarf-guide",
    ),
  );
  assert.ok(named("Bearded Axe", "equipment").length);
  assert.ok(named("Dwarf Axe", "equipment").length);
  assert.ok(named("Dragon", "profile").length);
  assert.ok(full.rows.some((r) => r.kind === "template"));
  assert.ok(full.rows.some((r) => r.kind === "mutation"));
  assert.equal(new Set(full.rows.map((r) => r.key)).size, full.rows.length);
  assert.equal(JSON.stringify(draft), before);
  assert.equal(JSON.stringify(R), coreBefore);
});

test("global references retain selective Legacy metadata, source text and safe read-only rendering", () => {
  const gnome = named("Gnome", "species")[0];
  assert.ok(gnome.legacy.length);
  const talent = named("Suffuse with Ulgu", "talent")[0];
  assert.ok(talent.legacy.length);
  const compatible = named("Strong Back", "talent")[0];
  assert.equal(compatible.legacy.length, 0);
  assert.equal(
    searchBooks(full.rows, "proposed adaptation", 100).rows.some(
      (r) => r.key === gnome.key,
    ),
    false,
  );
  assert.doesNotMatch(
    referenceBodyHTML(talent),
    /Adaptation warning|Use in the creator|data-search-route/,
  );
  const spell = named("Godspakt", "magic")[0];
  assert.match(referenceBodyHTML(spell), /Range<\/dt><dd>You/);
  assert.doesNotMatch(referenceBodyHTML(spell), /Source discrepancy/);
  const dragon = referenceBodyHTML(named("Dragon", "profile")[0]);
  assert.match(dragon, /<table>/);
  assert.doesNotMatch(dragon, /data-action|recalculation|sourceWarnings/);
  assert.match(
    referenceBodyHTML({
      ...compatible,
      entry: { ...compatible.entry, text: '<img onerror="x">' },
    }),
    /&lt;img/,
  );
});

test("both entry points are thin wrappers around the same reference search and scope", async () => {
  const pc = await readFile(
    new URL("../dist/features/book-search.mjs", import.meta.url),
    "utf8",
  );
  const gm = await readFile(
    new URL("../dist/gm/references.mjs", import.meta.url),
    "utf8",
  );
  assert.match(pc, /createReferenceSearch\(getContext\(\)\.library\)/);
  assert.match(gm, /createReferenceSearch\(library\)/);
  for (const filename of ["index.html", "gm.html"]) {
    const html = await readFile(
      new URL(`../dist/${filename}`, import.meta.url),
      "utf8",
    );
    assert.match(html, /aria-label="Search the books"/);
    assert.doesNotMatch(
      html,
      /Search selected books|Only the core book|Only selected/,
    );
  }
});

test("lazy global library rejects stale versions, invalid profile pointers and duplicate records; retry leaves its input unchanged", async () => {
  const stale = structuredClone(wire);
  stale.books[0].version = "old";
  await assert.rejects(
    loadReferenceLibrary(library, () => stale),
    /out of date/,
  );
  const bad = structuredClone(wire);
  bad.rows[0].entryRef = -1;
  await assert.rejects(
    loadReferenceLibrary(library, () => bad),
    /Invalid/,
  );
  const duplicate = structuredClone(wire);
  duplicate.rows.push(duplicate.rows[0]);
  await assert.rejects(
    loadReferenceLibrary(library, () => duplicate),
    /Invalid/,
  );
  await assert.rejects(
    loadReferenceLibrary(library, () =>
      Promise.reject(Error("temporary network failure")),
    ),
    /network failure/,
  );
  const before = JSON.stringify(wire);
  assert.equal(
    (await loadReferenceLibrary(library, () => wire)).rows.length,
    full.rows.length,
  );
  assert.equal(JSON.stringify(wire), before);
});
