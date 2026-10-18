import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library, R, soldier } from "./fixture.mjs";
import { loadReferenceLibrary } from "../src/engine/search-library.mjs";
import { searchBooks } from "../src/engine/book-search.mjs";
import { referenceBodyHTML } from "./reference-render.mjs";
import { isSearchCategoryVisible } from "../src/engine/reference-entries.mjs";
import { createReferenceLinker } from "../src/engine/book-search-links.mjs";

const wire = JSON.parse(
  await readFile(
    new URL("../public/data/search-library.json", import.meta.url),
    "utf8",
  ),
);
const full = await loadReferenceLibrary(library, () => wire);
const named = (name, kind) =>
  full.rows.filter((row) => row.name === name && (!kind || row.kind === kind));

test("Rules are absent from the shipped payload, all results and related-term chaining", () => {
  const visible = full.rows.filter((row) => isSearchCategoryVisible(row.kind));
  assert.ok(!wire.rows.some((row) => row.kind === "rule"));
  assert.ok(!wire.entries.some((entry) => entry.category === "rule"));
  assert.ok(!full.rows.some((row) => row.kind === "rule"));
  assert.ok(!visible.some((row) => row.kind === "rule"));
  for (const query of [
    "Fortune",
    "Achieving the Impossible",
    "Replenishing Fate",
  ])
    assert.ok(
      searchBooks(visible, query, Infinity).rows.every(
        (row) => row.kind !== "rule",
      ),
    );
  assert.ok(
    createReferenceLinker(full.rows)("Achieving the Impossible").every(
      (segment) => !segment.keys?.length,
    ),
  );
  assert.ok(
    searchBooks(visible, "Trained", 20).rows.some(
      (row) => row.kind === "trait",
    ),
  );
});

test("removed Fate and Fortune Rules leave the distinct Fortune Blessing available", () => {
  for (const title of [
    "Fate",
    "Fortune",
    "Fate and Fortune",
    "Achieving the Impossible",
    "Replenishing Fate",
    "Replenishing Fortune",
  ])
    assert.equal(named(title, "rule").length, 0, title);
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

test("global references retain selective Legacy metadata, mechanical summaries and safe read-only rendering", () => {
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
  assert.match(referenceBodyHTML(spell), /Source discrepancy/);
  assert.match(referenceBodyHTML(spell), /Range Touch and Target 1/);
  assert.match(
    referenceBodyHTML(spell),
    /selected the detailed p\. 10 profile/,
  );
  assert.match(referenceBodyHTML(spell), /Mechanical summary/);
  assert.match(
    referenceBodyHTML({
      ...compatible,
      entry: { ...compatible.entry, text: '<img onerror="x">' },
    }),
    /&lt;img/,
  );
});

test("all creator routes use one shared React reference search and scope", async () => {
  const frame = await readFile(
    new URL("../src/components/CreatorFrame.tsx", import.meta.url),
    "utf8",
  );
  assert.match(frame, /<ReferenceSearch\s*\/>/);
  for (const filename of [
    "index.html",
    "bestiary/index.html",
    "marijan/index.html",
  ]) {
    const html = await readFile(
      new URL(`../out/${filename}`, import.meta.url),
      "utf8",
    );
    assert.match(html, /aria-label="Search rules and book references"/);
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
  for (const kind of ["rule", "profile", "template"]) {
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
