import test from "node:test";
import assert from "node:assert/strict";
import { library } from "./fixture.mjs";
import { assembleBooks } from "../src/engine/books.mjs";
import { buildReferenceLibrary } from "../src/engine/search-library.mjs";
import { buildBookReport } from "../src/engine/book-report.mjs";
import {
  validateReferenceEntry,
  isSearchCategoryVisible,
} from "../src/engine/reference-entries.mjs";
import { referenceBodyHTML, ruleTextHTML } from "./reference-render.mjs";
import {
  createWorkerHandler,
  prepareSearchRows,
} from "../src/engine/search-worker.mjs";
import { createSearchEngine } from "../src/engine/search-engine.mjs";
import { searchBooks } from "../src/engine/search-ranking.mjs";
import { readFile } from "node:fs/promises";
import { loadReferenceLibrary } from "../src/engine/search-library.mjs";
import { createReferenceLinker } from "../src/engine/book-search-links.mjs";
import {
  searchCoverage,
  referenceContentHash,
} from "../scripts/search-coverage.mjs";
import { referenceSnippetText } from "../src/engine/search-presentation.mjs";

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

test("explicit reference exclusions suppress individual tables without suppressing retained categories", () => {
  const copy = structuredClone(library);
  const pack = copy.packs.find((p) => p.manifest.id === "up-in-arms");
  pack.data.referenceEntries = [
    source,
    {
      ...source,
      id: "up-in-arms:reference:retained-fixture",
      name: "Retained fixture",
    },
  ];
  copy.referenceExclusions[source.id] = { reason: "Explicit test exclusion" };
  const corpus = buildReferenceLibrary(copy, {
    profiles: [],
    templates: [],
    mutations: [],
  });
  assert.ok(!corpus.rows.some((r) => r.key === source.id));
  assert.ok(
    corpus.rows.some((r) => r.key === "up-in-arms:reference:retained-fixture"),
  );
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
    new URL("../public/data/search-library.json", import.meta.url),
    "utf8",
  ),
);
const full = await loadReferenceLibrary(library, () => wire);
const workshop = JSON.parse(
  await readFile(new URL("../public/gm/data.json", import.meta.url), "utf8"),
);
const raw = full.rows.filter((row) => row.printedReference);
const get = (book, name) =>
  raw.find(
    (r) =>
      r.entry.source.book === book &&
      r.name.toLowerCase() === name.toLowerCase(),
  );
test("supplied books publish retained gameplay references, without enabling creator systems", () => {
  const samples = {
    core: "Head Critical Wounds",
    "up-in-arms": "Alcatini Method",
    "archives-i": "Dwarf Melee Weapons",
    "archives-ii": "Magical Artefact Generation Table",
    "archives-iii": "Enterprise Events",
    "winds-of-magic": "Minor Miscast Table",
    "rough-nights": "Reveal the Inner Beauty",
    "dwarf-guide": "Runic Flaws Table",
    "high-elf": "Smith-priest of Vaul — printed Career",
    "blood-bramble": "Nameless Summons Table",
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
  assert.equal(get("night-parade", "Vigor Mortis"), undefined);
  assert.ok(!raw.some((r) => r.entry.source.book === "night-parade"));
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
  assert.equal(get("core", "Money to Burn"), undefined);
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
  assert.match(
    artillery.entry.text,
    /completed Reload sequence restores 1 Salvo/,
  );
  assert.match(
    artillery.entry.text,
    /Reload 6 for Salvo 1, repeated 9 times.*Salvo 9/,
  );
  const alcatini = get("up-in-arms", "Alcatini Method").entry.text;
  assert.match(alcatini, /requires at least two ranks of Drilled/);
  assert.match(alcatini, /Difficult \(–10\) Leadership Test/);
  assert.match(
    alcatini,
    /Each SL.*one Character.*rank of Drilled.*next adventure/,
  );
  assert.match(
    alcatini,
    /already possessing Drilled gain \+1 rank, up to your own Drilled rank/,
  );
  assert.match(
    alcatini,
    /\+3 SL and Inspiring 2.*\+1 Drilled rank to 30 Characters/,
  );
  assert.match(
    events.entry.text,
    /Only one investor per Enterprise.*at most one Event/,
  );
  assert.match(get("core", "Selection of Traps").entry.text, /If Triggered/);
  assert.match(
    get("core", "Selection of Traps").entry.text,
    /Target takes 1d10 \+ 5 to a Leg and 1 Entangled, Strength 55/,
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
test("core creation and Wrath tables preserve complete rows and advancement prices", () => {
  const career = get("core", "Random Class and Career Table");
  assert.equal(career.entry.page, "36–37");
  assert.equal(
    (career.entry.text.match(/^\| (?!---|Class)/gm) || []).length,
    64,
  );
  assert.equal(get("core", "Career Level"), undefined);
  const characteristics = get("core", "Characteristic Table");
  assert.equal(
    (characteristics.entry.text.match(/^\| (?!---|Characteristic)/gm) || [])
      .length,
    10,
  );
  assert.equal(get("core", "Generating Characteristics"), undefined);
  assert.equal(get("core", "Starting Talents and Trappings"), undefined);
  assert.match(
    get("core", "Class Trappings Table").entry.text,
    /Rogues \|.*2 Candles, 1d10 Matches/,
  );
  const advancement = full.rows.find(
    (r) => r.key === "core:reference:191-advancement-xp-costs",
  );
  assert.equal(advancement.kind, "table");
  assert.match(
    advancement.entry.text,
    /\| \+45 \| 1,800 \| 6,150 \| 850 \| 3,325 \|/,
  );
  const individual = full.rows.find(
    (r) => r.key === "core:reference:364-advancement-xp-costs",
  );
  assert.equal(individual.kind, "table");
  assert.match(individual.entry.text, /Cost of Advance \(\+1\)/);
  assert.match(individual.entry.text, /\| 41 to 45 \| 360 \| 170 \|/);
  const wrath = get("core", "Wrath of the Gods Table");
  assert.equal(wrath.entry.page, "218–219");
  assert.equal((wrath.entry.text.match(/^\| \d/gm) || []).length, 31);
  assert.match(wrath.entry.text, /151\+ \| Called to Account/);
});
test("old profiles and unconverted systems remain distinct from approved adapted creator profiles", () => {
  assert.equal(get("archives-iii", "Combining Armour"), undefined);
  assert.equal(get("archives-iii", "Animal Familiar Generation"), undefined);
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
  const multi = library.packs
    .find((p) => p.manifest.id === "archives-ii")
    .data.referenceEntries.find(
      (e) => e.name === "Artur Hammerfoot, Ogre Artisan",
    );
  assert.match(multi.text, /Base \| 6 \| 29/);
  assert.match(multi.text, /Total \| 6 \| 29.*\| 68 \| 61/);
  assert.ok(!full.rows.some((r) => r.key === multi.id));
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
test("related terms can chain to retained Endeavours and original Careers", () => {
  const link = createReferenceLinker(full.rows),
    current = get("high-elf", "Smith-priest of Vaul — printed Career");
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
test("lookup tables exclude standalone NPC stat blocks, Career grids and written-rule duplicates", () => {
  const tables = full.rows.filter((r) => r.kind === "table");
  for (const row of tables) {
    // An embedded example may accompany a real roll table (e.g. magical weapons).
    // A lone M/WS/BS profile is never itself a lookup table.
    if (/\| M \| WS \| BS \|/.test(row.entry.text))
      assert.match(row.entry.text, /\| D100 \|/, row.key);
  }
  for (const [book, name, kind] of [
    ["winds-of-magic", "Panacea Universalis", "equipment"],
    ["winds-of-magic", "Knuckles of Ignominy", "equipment"],
  ])
    assert.equal(get(book, name).kind, kind);
  for (const [book, name] of [
    ["up-in-arms", "Critical Wounds"],
    ["up-in-arms", "Complex Pursuits"],
    ["rough-nights", "Bull Ring"],
  ])
    assert.equal(get(book, name), undefined);
  for (const name of ["Weather Table", "Terrain Table"])
    assert.equal(
      full.rows.filter(
        (r) => r.name === name && r.entry.source.book === "deft-steps",
      ).length,
      1,
    );
  assert.match(
    get("deft-steps", "Weather Table").entry.text,
    /Roll independently for each weather column/,
  );
  const weather = get("deft-steps", "Weather Table").entry.text;
  assert.match(
    weather,
    /add 2 in spring or autumn, 4 in winter, and another 2 for colder climates or high altitude/,
  );
  assert.match(weather, /Gloves are required.*-2 SL on Dexterity/);
  assert.match(weather, /Undead and Constructs ignore temperature penalties/);
  assert.match(
    get("deft-steps", "Terrain Table").entry.text,
    /Deep forest.*-2 SL/,
  );
  assert.match(
    get("deft-steps", "Charlatan Income Endeavour Complications").entry.text,
    /Ranaldans Take Note/,
  );
  assert.equal(get("deft-steps", "Congruent With Character"), undefined);
  assert.match(
    full.rows.find((r) => r.key === "core:reference:131-difficulty-table").entry
      .text,
    /Very Easy \| \+6 SL/,
  );
  assert.match(
    get("winds-of-magic", "Construct Traits").entry.text,
    /Flight \(20\) \| \+30/,
  );
  assert.doesNotMatch(
    get("archives-ii", "War Machines").entry.text,
    /Blood-letters|Character’s camp/,
  );
  assert.doesNotMatch(
    get("archives-ii", "Battlefield Power Modifiers").entry.text,
    /Ernst Flett|cultists/,
  );
});

test("Rules, NPCs and templates stay outside published search while source records and the workshop remain intact", async () => {
  assert.ok(
    !full.rows.some((r) => ["rule", "profile", "template"].includes(r.kind)),
  );
  const retained = library.packs
    .flatMap((p) => p.data.referenceEntries || [])
    .filter((e) => ["profile", "template"].includes(e.category));
  assert.ok(retained.length > 100);
  assert.ok(retained.every((e) => !full.rows.some((r) => r.key === e.id)));
  const gm = JSON.parse(
    await readFile(new URL("../public/gm/data.json", import.meta.url), "utf8"),
  );
  assert.equal(gm.profiles.filter((p) => p.id.startsWith("core:")).length, 49);
  assert.equal(gm.templates.filter((t) => t.id.startsWith("core:")).length, 7);
  const before = JSON.stringify(gm);
  const generated = buildReferenceLibrary(library, gm);
  assert.ok(
    !generated.rows.some((r) =>
      ["rule", "profile", "template"].includes(r.kind),
    ),
  );
  assert.equal(JSON.stringify(gm), before);
  for (const name of [
    "Bright Spark",
    "Old Salt",
    "Reformed Rogue",
    "Diamond In The Rough",
    "Veteran Of Adventures",
    "Hireling Templates",
  ])
    assert.ok(
      !raw.some((r) => r.name === name && r.entry.source.book === "up-in-arms"),
      name,
    );
  // The ordinary hireling price table remains; the standalone procedure does not.
  assert.equal(get("core", "Hirelings").kind, "table");
  assert.equal(get("up-in-arms", "Hireling Profiles"), undefined);
});

test("coverage is generated from registry and frozen review, separate from creator inclusion", async () => {
  const review = JSON.parse(
    await readFile(
      new URL("../scripts/search-reference-review.json", import.meta.url),
      "utf8",
    ),
  );
  const report = searchCoverage(library, full, review, workshop);
  assert.equal(report.removedNonMechanicalRules, 112);
  assert.equal(
    report.visibleReferences,
    full.rows.filter((row) => isSearchCategoryVisible(row.kind)).length,
  );
  assert.equal(
    report.internalTables,
    full.rows.filter((row) => row.kind === "table").length,
  );
  assert.deepEqual(
    report.books.map((b) => b.id).sort(),
    library.packs
      .filter((p) => p.manifest.kind !== "variant")
      .map((p) => p.manifest.id)
      .sort(),
  );
  assert.equal(report.newlyImported, raw.length);
  assert.equal(
    report.retainedOutsideSearch,
    library.packs
      .flatMap((p) => p.data.referenceEntries || [])
      .filter(
        (e) =>
          ["rule", "profile", "template"].includes(e.category) ||
          library.referenceExclusions[e.id],
      ).length,
  );
  for (const b of report.books) {
    const bytes = await readFile(
      new URL(
        `../content/sources/data/books/${b.id}/reference-entries.json`,
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
  assert.throws(() => searchCoverage(library, full, broken, workshop), /stale/);
  broken.books.core.sourceHash = review.books.core.sourceHash;
  broken.books.core.records.push({
    id: "bad",
    disposition: "included",
    targets: ["missing"],
  });
  assert.throws(
    () => searchCoverage(library, full, broken, workshop),
    /missing/,
  );
  const restored = structuredClone(full);
  const excluded = review.books.core.rulesAudit.removed[0];
  restored.rows.push({
    key: excluded.key,
    kind: "rule",
    legacy: [],
    entry: { source: { book: "core" } },
  });
  assert.throws(
    () => searchCoverage(library, restored, review, workshop),
    /Excluded non-mechanical rule was restored/,
  );
  const stale = structuredClone(review);
  stale.books.core.rulesAudit.reviewedRuleResults++;
  assert.throws(
    () => searchCoverage(library, full, stale, workshop),
    /Rules audit count is stale/,
  );
});

test("standalone Rules and explicit reference exclusions cannot be searched or linked", async () => {
  const review = JSON.parse(
    await readFile(
      new URL("../scripts/search-reference-review.json", import.meta.url),
      "utf8",
    ),
  );
  const link = createReferenceLinker(full.rows);
  for (const pack of library.packs) {
    for (const excluded of review.books[pack.manifest.id]?.rulesAudit
      ?.removed || []) {
      assert.ok(!full.rows.some((r) => r.key === excluded.key), excluded.name);
      assert.ok(
        ![
          ...(pack.data.referenceEntries || []),
          ...(pack.data.ruleReferences || []),
        ].some((e) => e.id === excluded.id),
        `${excluded.name} must not ship as a raw reference`,
      );
      assert.ok(
        link(excluded.name).every(
          (segment) => !segment.keys?.includes(excluded.key),
        ),
      );
    }
  }
  const omitted = library.packs.flatMap((pack) => [
    ...(pack.data.referenceEntries || [])
      .filter((r) => r.category === "rule")
      .map((r) => ({ key: r.id, name: r.name })),
    ...(pack.data.ruleReferences || [])
      .filter((r) => r.category === "rule")
      .map((r) => ({ key: `rule:${r.id}:${r.name}`, name: r.name })),
  ]);
  assert.ok(omitted.length > 100);
  for (const { key, name } of omitted) {
    assert.ok(!full.rows.some((r) => r.key === key), key);
    assert.ok(
      link(name).every((segment) => !segment.keys?.includes(key)),
      key,
    );
  }
  assert.deepEqual(Object.keys(library.referenceExclusions).sort(), [
    "up-in-arms:reference:116-physical-quirks",
    "up-in-arms:reference:116-work-ethic",
    "up-in-arms:reference:117-personality-quirks",
    "up-in-arms:reference:139-location-table",
    "up-in-arms:reference:139-objective-table",
    "up-in-arms:reference:139-personality-table",
  ]);
  for (const [key, exclusion] of Object.entries(library.referenceExclusions)) {
    assert.ok(exclusion.reason && exclusion.name, key);
    assert.ok(!full.rows.some((r) => r.key === key), key);
    assert.ok(
      link(exclusion.name).every((segment) => !segment.keys?.includes(key)),
      key,
    );
    assert.ok(
      !searchBooks(full.rows, exclusion.name, Infinity).rows.some(
        (r) => r.key === key,
      ),
      key,
    );
  }
  assert.equal(get("up-in-arms", "Critical Wounds"), undefined);
  assert.equal(get("up-in-arms", "Complex Pursuits"), undefined);
  assert.equal(
    searchBooks(full.rows, "Fortune", 20, { category: "rule" }).total,
    0,
  );
  assert.equal(
    searchBooks(full.rows, "", Infinity, { category: "rule" }).total,
    0,
  );
});
