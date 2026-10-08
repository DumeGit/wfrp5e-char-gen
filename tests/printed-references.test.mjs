import test from "node:test";
import assert from "node:assert/strict";
import { library } from "./fixture.mjs";
import { assembleBooks } from "../dist/books.mjs";
import { buildReferenceLibrary } from "../dist/search-library.mjs";
import { buildBookReport } from "../dist/book-report.mjs";
import { validateReferenceEntry } from "../dist/reference-entries.mjs";
import { referenceBodyHTML } from "../dist/reference-body.mjs";
import {
  createWorkerHandler,
  prepareSearchRows,
} from "../dist/search-worker.mjs";
import { createSearchEngine } from "../dist/search-engine.mjs";
import { searchBooks } from "../dist/search-ranking.mjs";
import { readFile } from "node:fs/promises";
import { loadReferenceLibrary } from "../dist/search-library.mjs";
import { createReferenceLinker } from "../dist/book-search-links.mjs";
import {
  searchCoverage,
  referenceContentHash,
} from "../scripts/search-coverage.mjs";
import {
  referenceSnippetText,
  ruleTextHTML,
} from "../dist/search-presentation.mjs";

const source = {
  id: "up-in-arms:reference:fixture",
  name: "Fixture rule",
  category: "table",
  topic: "Synthetic test fixture",
  page: 83,
  text: "| Roll | Effect |\n|---|---|\n| 01–03 | Printed effect |",
  notes: "Editorial explanation that must not match",
  aliases: ["Fixture alias"],
};
test("printed references validate provenance and reject creator mechanics", () => {
  assert.equal(validateReferenceEntry(source, "up-in-arms"), source);
  for (const changes of [
    { page: 0 },
    { id: "core:reference:fixture" },
    { category: "unknown" },
    { text: "" },
    { aliases: [null] },
    { grants: { talent: "Strong Back" } },
  ])
    assert.throws(() =>
      validateReferenceEntry({ ...source, ...changes }, "up-in-arms"),
    );
});
test("source-table excerpts hide layout syntax but keep values and printed footnotes", () => {
  const text = referenceSnippetText(
    "| Weapon | Price |\n| --- | --- |\n| Crossbow** | 5 GC |\n\n### Reload",
  );
  assert.match(text, /Crossbow\*\* · 5 GC/);
  assert.match(text, /Reload/);
  assert.doesNotMatch(text, /\||---|###/);
});
test("source tables without separate headers preserve their first row without an empty heading", () => {
  const html = ruleTextHTML(
    "|  |  |\n| --- | --- |\n| SL | Result |\n| +3 | Printed outcome |",
  );
  assert.doesNotMatch(html, /<thead>/);
  assert.match(html, /<tr><td>SL<\/td><td>Result<\/td><\/tr>/);
  assert.match(html, /\+3<\/td><td>Printed outcome/);
});
test("printed source material is searchable and reference-only without entering creator catalogues", () => {
  const copy = structuredClone(library);
  copy.packs.find((p) => p.manifest.id === "up-in-arms").data.referenceEntries =
    [source];
  const before = assembleBooks(library, ["up-in-arms"]);
  assert.deepEqual(assembleBooks(copy, ["up-in-arms"]), before);
  const corpus = buildReferenceLibrary(copy, {
    profiles: [],
    templates: [],
    mutations: [],
  });
  const row = corpus.rows.find((r) => r.key === source.id);
  assert.equal(row.printedReference, true);
  assert.deepEqual(row.legacy, []);
  assert.equal(
    searchBooks(corpus.rows, "Fixture alias", 20).rows[0].key,
    source.id,
  );
  assert.ok(
    !searchBooks(corpus.rows, "Editorial explanation", 100).rows.some(
      (r) => r.key === source.id,
    ),
  );
  assert.match(referenceBodyHTML(row), /<table>/);
  assert.match(referenceBodyHTML(row), /Source note/);
  assert.doesNotMatch(referenceBodyHTML(row), /data-action|data-search-route/);
  const record = buildBookReport(copy)
    .books.find((b) => b.id === "up-in-arms")
    .records.find((r) => r.contentId === source.id);
  assert.equal(record.status, "reference-only");
});
test("worker ranking agrees with synchronous matching, categories and accents", async () => {
  const rows = [
    {
      key: "one",
      name: "Élan",
      kind: "rule",
      aliases: ["elan alias"],
      textFields: ["Some printed rule"],
    },
    {
      key: "two",
      name: "Critical table",
      kind: "table",
      aliases: [],
      textFields: ["Élan effect"],
    },
  ];
  const replies = [];
  const handle = createWorkerHandler((r) => replies.push(r));
  handle({ id: 1, type: "init", rows });
  for (const [query, category] of [
    ["elan", "all"],
    ["", "table"],
    ["printed rule", "rule"],
  ]) {
    handle({ id: 2, type: "search", query, category });
    const expected = searchBooks(prepareSearchRows(rows), query, Infinity, {
      category,
    });
    assert.deepEqual(replies.at(-1).result, {
      total: expected.total,
      rows: expected.rows.map(({ key, rank, excerpt }) => ({
        key,
        rank,
        excerpt,
      })),
    });
  }
  const fallback = createSearchEngine(rows, () => {
    throw Error("Not supported");
  });
  assert.deepEqual(
    (await fallback.search("elan")).rows.map((r) => r.key),
    ["one", "two"],
  );
  fallback.dispose();
});
test("worker failure falls back and concurrent queries return their own results", async () => {
  const rows = [
    {
      key: "one",
      name: "Alpha",
      kind: "rule",
      aliases: [],
      textFields: ["First rule"],
    },
    {
      key: "two",
      name: "Beta",
      kind: "table",
      aliases: [],
      textFields: ["Second table"],
    },
  ];
  class FakeWorker {
    events = {};
    handle = createWorkerHandler((data) => this.events.message({ data }));
    addEventListener(name, fn) {
      this.events[name] = fn;
    }
    postMessage(data) {
      queueMicrotask(() => this.handle(data));
    }
    terminate() {}
  }
  const engine = createSearchEngine(rows, () => new FakeWorker());
  const [a, b] = await Promise.all([
    engine.search("alpha"),
    engine.search("beta"),
  ]);
  assert.equal(a.rows[0].key, "one");
  assert.equal(b.rows[0].key, "two");
  engine.dispose();
  class BrokenWorker extends FakeWorker {
    postMessage() {
      queueMicrotask(() => this.events.error());
    }
  }
  const broken = createSearchEngine(rows, () => new BrokenWorker());
  assert.equal((await broken.search("beta")).rows[0].key, "two");
  broken.dispose();
});

const wire = JSON.parse(
  await readFile(
    new URL("../dist/data/search-library.json", import.meta.url),
    "utf8",
  ),
);
const full = await loadReferenceLibrary(library, () => wire);
const raw = full.rows.filter((row) => row.printedReference);
const get = (book, name) =>
  raw.find(
    (r) =>
      r.entry.source.book === book &&
      r.name.toLowerCase() === name.toLowerCase(),
  );
test("all eleven supplied books publish gameplay references, without enabling creator systems", () => {
  const samples = {
    core: "Head Critical Wounds",
    "up-in-arms": "Alcatini Method",
    "archives-i": "Dwarf Melee Weapons",
    "archives-ii": "Magical Artefact Generation Table",
    "archives-iii": "Enterprise Events",
    "winds-of-magic": "Minor Miscast Table",
    "rough-nights": "Al-Zahr",
    "dwarf-guide": "Crafting Runes",
    "high-elf": "Priest Careers",
    "blood-bramble": "Morock the Bonetaker",
    "deft-steps": "Black Market",
  };
  for (const [book, name] of Object.entries(samples)) {
    const row = get(book, name);
    assert.ok(row, `${book}: ${name}`);
    assert.ok(
      searchBooks(full.rows, name, Infinity).rows.some(
        (r) => r.key === row.key,
      ),
    );
    assert.deepEqual(row.legacy, []);
    assert.doesNotMatch(
      referenceBodyHTML(row),
      /data-action|data-search-route|Use in the creator/,
    );
  }
  for (const pack of library.packs.filter(
    (p) => p.manifest.kind !== "variant",
  )) {
    assert.ok(pack.data.referenceEntries.length);
    const stripped = structuredClone(library);
    stripped.packs.find(
      (p) => p.manifest.id === pack.manifest.id,
    ).data.referenceEntries = [];
    assert.deepEqual(
      assembleBooks(stripped, [pack.manifest.id]),
      assembleBooks(library, [pack.manifest.id]),
    );
  }
});
test("complete event, corruption, artillery and injury tables preserve their source boundaries", () => {
  const events = get("archives-iii", "Enterprise Events");
  assert.equal(events.entry.page, "9–11");
  assert.match(events.entry.text, /98–100.*Offer to Buy-Out/);
  assert.equal((events.entry.text.match(/^\| \d/gm) || []).length, 33);
  assert.ok(!raw.some((r) => /^\d+.*Looming Bankruptcy/.test(r.name)));
  assert.match(
    get("core", "Character Events Table").entry.text,
    /98–00: They’re a Witch!/,
  );
  assert.doesNotMatch(
    get("core", "Money to Burn").entry.text,
    /85–90: Scandalous Rumours/,
  );
  for (const name of ["Mental Corruption Table", "Physical Corruption Table"])
    assert.equal(
      (get("core", name).entry.text.match(/^\| \d/gm) || []).length,
      20,
    );
  const artillery = get("up-in-arms", "Siege Weapons Table");
  assert.match(
    artillery.entry.text,
    /Ballista \| 30 GC \| 20 \| Scarce \| 150 \| \+12/,
  );
  assert.match(artillery.entry.text, /Helstorm Rocket Battery/);
  assert.match(artillery.entry.text, /increases the Salvo number by 1/);
  assert.match(
    get("up-in-arms", "Alcatini Method").entry.text,
    /at least two ranks of the Drilled Talent/,
  );
  assert.match(get("core", "Selection of Traps").entry.text, /If Triggered/);
  assert.match(
    get("core", "Selection of Traps").entry.text,
    /Target takes 1d10 \+ 5 to Leg Location/,
  );
  for (const book of ["core", "up-in-arms"])
    assert.equal(
      (
        get(book, "Head Critical Wounds").entry.text.match(/^\| (?:\d|00)/gm) ||
        []
      ).length,
      20,
    );
});
test("core creation references and multi-page Wrath table contain complete reviewed procedures", () => {
  const career = get("core", "Random Class and Career Table");
  assert.equal(career.entry.page, "36–37");
  assert.equal(
    (career.entry.text.match(/^\| (?!---|Class)/gm) || []).length,
    64,
  );
  assert.doesNotMatch(get("core", "Career Level").entry.text, /56 55/);
  const characteristics = get("core", "Characteristic Table");
  assert.equal(
    (characteristics.entry.text.match(/^\| (?!---|Characteristic)/gm) || [])
      .length,
    10,
  );
  assert.match(
    get("core", "Generating Characteristics").entry.text,
    /up to six in total/,
  );
  assert.match(
    get("core", "Generating Characteristics").entry.text,
    /up to three in total/,
  );
  assert.match(
    get("core", "Starting Talents and Trappings").entry.text,
    /Clothing, a Dagger, and a Pouch/,
  );
  const wrath = get("core", "Wrath of the Gods Table");
  assert.equal(wrath.entry.page, "218–219");
  assert.equal((wrath.entry.text.match(/^\| \d/gm) || []).length, 31);
  assert.match(wrath.entry.text, /151\+ \| Called to Account/);
});
test("old profiles and unconverted systems remain distinct from approved adapted creator profiles", () => {
  assert.match(
    get("archives-iii", "Combining Armour").entry.text,
    /Brigandine|Plate/,
  );
  assert.equal(
    get("archives-iii", "Animal Familiar Generation").entry.source.book,
    "archives-iii",
  );
  const priest = get("high-elf", "Smith-priest of Vaul — printed Career");
  assert.match(priest.entry.text, /Level 3: Smith-priest/);
  assert.match(priest.entry.text, /Level 5: Arch Forge-priest/);
  const mage = get("high-elf", "Mage — printed Career");
  assert.match(mage.entry.text, /Level 5:/);
  assert.ok(
    full.rows.some(
      (r) => r.name === "Mage" && !r.printedReference && r.legacy.length,
    ),
  );
  const multi = get("archives-ii", "Artur Hammerfoot, Ogre Artisan");
  assert.match(multi.entry.text, /Base \| 6 \| 29/);
  assert.match(multi.entry.text, /Total \| 6 \| 29.*\| 68 \| 61/);
  assert.match(referenceBodyHTML(multi), /<strong>Skills:<\/strong>/);
  assert.match(referenceBodyHTML(multi), /<strong>Talents:<\/strong>/);
  const source = get("rough-nights", "Reveal the Inner Beauty");
  assert.equal(source.entry.page, 52);
  assert.match(source.entry.text, /Challenging \(\+0\) Toughness/);
  assert.equal(source.legacy.length, 0);
});
test("raw lazy wire data rejects altered identity, commentary fields and invented adaptation metadata", async () => {
  const rawIndex = wire.rows.findIndex((r) => r.printedReference);
  for (const change of [
    (r) => (r.name = "Wrong identity"),
    (r) => r.textFields.push("Editorial commentary"),
    (r) => r.legacy.push({ book: "core", adaptation: "invented" }),
  ]) {
    const bad = structuredClone(wire);
    change(bad.rows[rawIndex]);
    await assert.rejects(
      loadReferenceLibrary(library, () => bad),
      /Printed reference/,
    );
  }
  const before = JSON.stringify(wire),
    unprepared = await loadReferenceLibrary(library, () => wire, {
      normalize: false,
    });
  assert.equal(unprepared.rows[rawIndex].searchable, undefined);
  assert.equal(
    unprepared.rows[rawIndex].textFields[0],
    unprepared.rows[rawIndex].entry.text,
  );
  assert.equal(JSON.stringify(wire), before);
});
test("related terms can chain to same-book new rules and original Careers", () => {
  const link = createReferenceLinker(full.rows),
    current = get("high-elf", "Priest Careers");
  const terms = link("Mage — printed Career", current).filter((s) => s.keys);
  assert.ok(
    terms.some((s) =>
      s.keys.includes(get("high-elf", "Mage — printed Career").key),
    ),
  );
  const endeavour = get("up-in-arms", "Alcatini Method");
  assert.ok(
    link("Drilled", endeavour).some((s) =>
      s.keys?.some(
        (key) =>
          full.rows.find((r) => r.key === key).entry.source.book ===
          "up-in-arms",
      ),
    ),
  );
  assert.deepEqual(
    link(
      "ill-fortune and Hand-wringing",
      get("archives-iii", "Enterprise Events"),
    ),
    [{ text: "ill-fortune and Hand-wringing" }],
  );
});
test("coverage is generated from registry and frozen review, separate from creator inclusion", async () => {
  const review = JSON.parse(
    await readFile(
      new URL("../scripts/search-reference-review.json", import.meta.url),
      "utf8",
    ),
  );
  const report = searchCoverage(library, full, review);
  assert.equal(report.books.length, 11);
  assert.equal(report.newlyImported, raw.length);
  for (const b of report.books) {
    const bytes = await readFile(
      new URL(
        `../dist/data/books/${b.id}/reference-entries.json`,
        import.meta.url,
      ),
    );
    assert.equal(
      referenceContentHash(bytes),
      review.books[b.id].publishedSHA256,
    );
    assert.equal(
      referenceContentHash(
        bytes.toString().replaceAll("\r\n", "\n").replaceAll("\n", "\r\n"),
      ),
      review.books[b.id].publishedSHA256,
    );
  }
  const broken = structuredClone(review);
  broken.books.core.sourceHash = "stale";
  assert.throws(() => searchCoverage(library, full, broken), /stale/);
  broken.books.core.sourceHash = review.books.core.sourceHash;
  broken.books.core.records.push({
    id: "bad",
    disposition: "included",
    targets: ["missing"],
  });
  assert.throws(() => searchCoverage(library, full, broken), /missing/);
});
