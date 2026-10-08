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

test("core Fate and Fortune references include all spending and replenishment rules", () => {
  const fate = named("Fate", "rule")[0],
    fortune = named("Fortune", "rule")[0],
    combined = named("Fate and Fortune", "rule")[0];
  for (const row of [fate, fortune, combined]) {
    assert.equal(row.entry.page, 133);
    assert.equal(row.entry.source.book, "core");
    assert.equal(row.legacy.length, 0);
  }
  for (const heading of [
    "Cheating Death",
    "Achieving the Impossible",
    "Replenishing Fate",
  ])
    assert.ok(referenceBodyHTML(fate).includes(`<h3>${heading}</h3>`));
  assert.match(fate.entry.text, /How Did That Miss\?/);
  assert.match(fate.entry.text, /Not Today!/);
  assert.match(fate.entry.text, /I Will Not Fail!/);
  assert.match(fate.entry.text, /win by at least \+1 SL/);
  assert.match(fate.entry.text, /pick the Hit Location/);
  assert.match(fate.entry.text, /Fate is not automatically replenished/);
  assert.match(fortune.entry.text, /Gain Advantage on a Test before rolling/);
  assert.match(fortune.entry.text, /Reroll a Test, keeping the new result/);
  assert.match(fortune.entry.text, /another Fortune to reroll again/);
  assert.match(fortune.entry.text, /Remove one Condition \(page 184\)/);
  assert.match(referenceBodyHTML(fortune), /<h3>Replenishing Fortune<\/h3>/);
  assert.match(
    fortune.entry.text,
    /regain all Fortune Points at the start of each gaming session/,
  );
  assert.ok(combined.entry.text.includes(fate.entry.text));
  assert.ok(combined.entry.text.includes(fortune.entry.text));
  for (const title of [
    "Achieving the Impossible",
    "Replenishing Fate",
    "Replenishing Fortune",
  ])
    assert.equal(named(title, "rule").length, 1);
  for (const [query, row] of [
    ["Fate Points", fate],
    ["Fortune Points", fortune],
  ])
    assert.equal(searchBooks(full.rows, query, 20).rows[0].key, row.key);
  assert.ok(
    named("Blessing of Fortune", "magic").length,
    "Fortune Blessing remains a separate reference",
  );
});

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
  assert.ok(!full.rows.some((r) => ["profile", "template"].includes(r.kind)));
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
  for (const kind of ["profile", "template"]) {
    const hidden = structuredClone(wire);
    hidden.rows[0].kind = kind;
    await assert.rejects(
      loadReferenceLibrary(library, () => hidden),
      /Invalid/,
    );
  }
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
