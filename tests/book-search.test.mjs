import test from "node:test";
import assert from "node:assert/strict";
import { R, library, soldier } from "./fixture.mjs";
import { assembleBooks } from "../dist/books.mjs";
import { characterResult } from "../dist/character-result.mjs";
import {
  buildSearchIndex,
  searchBooks,
  searchContext,
} from "../dist/book-search.mjs";
import * as M from "../dist/rules.mjs";
import { searchBookText } from "../dist/book-search-text.mjs";
import { createReferenceLinker } from "../dist/book-search-links.mjs";
const B = assembleBooks(
  library,
  library.packs
    .filter((x) => x.manifest.kind !== "variant")
    .map((x) => x.manifest.id),
);
const core = buildSearchIndex(R),
  all = buildSearchIndex(B);
const find = (ix, name, kind) =>
  ix.find((x) => x.name === name && (!kind || x.kind === kind));

test("Related references preserve exact text, choose longest names and stay within selected content", () => {
  const link = createReferenceLinker(core),
    row = find(core, "Soldier", "career"),
    text =
      "Soldier: Strong Back, Melee (Basic), swordplay and unimported-blorp.",
    segments = link(text, row);
  assert.equal(segments.map((x) => x.text).join(""), text);
  assert.deepEqual(
    segments.filter((x) => x.keys).map((x) => x.text),
    ["Strong Back", "Melee (Basic)"],
  );
  assert.ok(
    segments
      .filter((x) => x.keys)
      .every((x) => x.keys.every((key) => core.some((r) => r.key === key))),
  );
  assert.ok(!link("Bludgeoner and Godspakt", row).some((x) => x.keys));
  const leather = link("Leather Breastplate", row);
  assert.equal(leather.length, 1);
  assert.equal(leather[0].text, "Leather Breastplate");
  assert.deepEqual(leather[0].keys, [
    find(core, "Leather Jerkin", "equipment").key,
  ]);
  assert.ok(
    createReferenceLinker(all)("Bludgeoner and Godspakt", row).every(
      (x) => x.keys || x.text === " and ",
    ),
  );
});

test("Related references prefer the current book and expose ambiguous alternatives without inventing precedence", () => {
  const rows = [
    { key: "core-ward", name: "Ward", entry: { source: { book: "core" } } },
    { key: "guide-ward", name: "Ward", entry: { source: { book: "guide" } } },
    { key: "other-ward", name: "Ward", entry: { source: { book: "other" } } },
  ];
  const link = createReferenceLinker(rows);
  assert.deepEqual(
    link("Ward", { name: "Shield", entry: { source: { book: "guide" } } })[0]
      .keys,
    ["guide-ward"],
  );
  assert.deepEqual(
    link("Ward", {
      name: "Shield",
      entry: { source: { book: "elsewhere" } },
    })[0].keys,
    rows.map((x) => x.key),
  );
  assert.equal(
    link("rewarded warding", { name: "Shield" }).some((x) => x.keys),
    false,
  );
});

test("Matching excludes adaptation/creator annotations but preserves actual book prose", () => {
  const bludgeoner = find(all, "Bludgeoner", "talent"),
    godspakt = find(all, "Godspakt", "magic"),
    staff = find(all, "Enchanted Staff", "equipment");
  assert.ok(
    !searchBooks(all, "per-rank Test SL bonus", all.length).rows.some(
      (x) => x.key === bludgeoner.key,
    ),
  );
  assert.ok(
    !searchBooks(all, "user selected", all.length).rows.some(
      (x) => x.key === godspakt.key,
    ),
  );
  assert.ok(
    !searchBooks(all, "deferred by user choice", all.length).rows.some(
      (x) => x.key === staff.key,
    ),
  );
  assert.match(searchBookText(bludgeoner.entry).text, /hammer swings/);
  const shield = find(all, "Shield Platform", "equipment");
  assert.ok(
    !searchBooks(
      all,
      "bearer activation effects deferred",
      all.length,
    ).rows.some((x) => x.key === shield.key),
  );
  assert.match(searchBookText(shield.entry).text, /not sold by Dwarf clans/);
  assert.match(searchBookText(shield.entry).text, /15 GC/);
  assert.ok(
    searchBookText(shield.entry).notes.some((n) =>
      n.includes("activation effects"),
    ),
  );
  assert.ok(searchBookText(bludgeoner.entry).notes.length);
  assert.match(
    godspakt.entry.text,
    /user selected/i,
    "Stored interpretations are retained for the dialog",
  );
  const actual = searchBooks(all, "item’s creator", all.length).rows;
  assert.ok(
    actual.some((x) => x.name === "Arcane Insight"),
    "Book prose using 'creator' remains searchable",
  );
  const modified = structuredClone(R);
  modified.market[0].adaptation = "unsearchable-internal-decision-needle";
  modified.careers[0].levels[0].conversion =
    "unsearchable-internal-decision-needle";
  assert.equal(
    searchBooks(
      buildSearchIndex(modified),
      "unsearchable internal decision needle",
    ).total,
    0,
  );
});

test("Unified search respects selected books, withdrawals and stable profile identities", () => {
  assert.equal(find(core, "Godspakt"), undefined);
  assert.ok(find(all, "Godspakt", "magic"));
  assert.ok(find(all, "Lore (Alchemy)", "skill"));
  assert.ok(find(all, "Dwarf Axe", "equipment"));
  assert.equal(find(all, "Bearded Axe", "equipment"), undefined);
  assert.equal(new Set(all.map((x) => x.key)).size, all.length);
  assert.deepEqual(
    new Set(all.map((x) => x.kind)),
    new Set([
      "career",
      "skill",
      "talent",
      "magic",
      "equipment",
      "rule",
      "condition",
      "psychology",
      "property",
      "trait",
      "species",
    ]),
  );
  const dagger = all.filter(
    (x) =>
      x.kind === "equipment" &&
      x.name === "Dagger" &&
      x.entry.source.book === "core",
  );
  assert.equal(dagger.length, 1);
  assert.ok(dagger[0].facets.some((x) => x.damage));
  assert.ok(dagger[0].shop.length);
});
test("Search ranks names over descriptions, handles punctuation and indexes scoped aliases", () => {
  assert.equal(searchBooks(all, "STRONG   BACK").rows[0].name, "Strong Back");
  assert.equal(searchBooks(all, "lore alchemy").rows[0].name, "Lore (Alchemy)");
  assert.equal(searchBooks(all, "Diceman").rows[0].name, "Dicer");
  assert.equal(searchBooks(core, "Diceman").total, 0);
  assert.equal(searchBooks(all, "Bawd").rows[0].name, "Knave");
  assert.ok(
    searchBooks(all, "Bawd").rows.some(
      (x) => x.kind === "career" && x.name === "Knave",
    ),
  );
  assert.equal(searchBooks(all, " ").rows.length, 0);
  assert.equal(searchBooks(all, "no-such-thing-zxy").total, 0);
  const broad = searchBooks(all, "magic", 8);
  assert.ok(broad.total > 8);
  assert.equal(broad.rows.length, 8);
  assert.deepEqual(
    searchBooks(all, "magic", 16)
      .rows.slice(0, 8)
      .map((x) => x.key),
    broad.rows.map((x) => x.key),
  );
  const spell = all.find(
    (x) => x.kind === "magic" && x.entry.text?.length > 50,
  );
  const word = spell.entry.text.match(/[a-zA-Z]{7,}/)?.[0];
  if (word)
    assert.ok(
      searchBooks(all, word, all.length).rows.some((x) => x.key === spell.key),
    );
});
test("Rule references quote existing handlers without altering choices, money, XP or rolls", () => {
  const s = soldier(),
    before = JSON.stringify(s),
    result = characterResult(B, s);
  for (const [name, kind] of [
    ["Soldier", "career"],
    ["Strong Back", "talent"],
    ["Melee (Basic)", "skill"],
    ["Godspakt", "magic"],
    ["Dagger", "equipment"],
    ["Enchanted Staff", "equipment"],
  ]) {
    const row = find(all, name, kind);
    assert.ok(row, name);
    const state = searchContext(B, s, row, result);
    assert.ok(typeof state.status === "string");
    if (name === "Strong Back")
      assert.ok(state.actions.some((x) => x.tab === "Talents"));
    if (name === "Dagger") assert.ok(state.actions.some((x) => x.marketId));
    if (name === "Enchanted Staff") {
      assert.equal(state.actions.length, 0);
      assert.match(state.reason, /Reference only/);
    }
  }
  assert.equal(JSON.stringify(s), before);
  const later = searchContext(
    R,
    s,
    find(core, "Lore (Heraldry)", "skill"),
    characterResult(R, s),
  );
  assert.ok(
    later.actions.every((x) => x.step !== 3),
    "Later Career Skills are not starting allocations",
  );
});
test("Unavailable references stay visible and live routes reflect Career locks and ownership", () => {
  const s = soldier();
  const d = characterResult(B, { ...s, species: "Dwarf" });
  const career = all.find(
    (x) =>
      x.kind === "career" &&
      !x.entry.species?.includes("Dwarf") &&
      x.entry.species?.length,
  );
  const unavailable = searchContext(B, { ...s, species: "Dwarf" }, career, d);
  assert.equal(unavailable.actions.length, 0);
  assert.match(unavailable.reason, /unavailable/);
  const strong = find(core, "Strong Back", "talent"),
    first = searchContext(R, s, strong, characterResult(R, s));
  assert.equal(first.status, "0 ranks owned · 100 XP");
  M.purchase(R, s, "talent", "Strong Back");
  const next = searchContext(R, s, strong, characterResult(R, s));
  assert.match(next.status, /1 rank owned/);
  assert.ok(next.actions.every((x) => x.step === 6));
  assert.match(
    searchContext(R, s, find(core, "Soldier", "career"), characterResult(R, s))
      .reason,
    /locked/,
  );
  s.xp = 100;
  const broke = searchContext(R, s, strong, characterResult(R, s));
  assert.match(broke.reason, /XP/);
  assert.ok(broke.actions.some((x) => x.step === 6));
});
import {
  loadRuleReferences,
  validateRuleReference,
} from "../dist/rule-references.mjs";
import { ruleTextHTML, searchLabel } from "../dist/search-presentation.mjs";

test("core references provide complete Skill prose and distinguish rules, Conditions, Psychology and properties", () => {
  const before = JSON.stringify(R);
  assert.equal(
    R.ruleReferences.filter((x) => x.category === "skill").length,
    R.skills.length,
  );
  for (const skill of R.skills) {
    const ref = R.ruleReferences.find((x) => x.target === skill.contentId);
    assert.ok(ref?.text.length > 60, skill.name);
    assert.equal(find(core, skill.name, "skill").entry.text, ref.text);
    for (const row of core.filter(
      (x) => x.kind === "skill" && x.entry.contentId === skill.contentId,
    ))
      assert.equal(row.entry.text, ref.text, row.name);
  }
  assert.equal(core.filter((x) => x.kind === "condition").length, 13);
  assert.equal(core.filter((x) => x.kind === "psychology").length, 5);
  assert.equal(core.filter((x) => x.kind === "trait").length, 67);
  assert.equal(find(core, "Bleeding", "condition").entry.source.page, 185);
  assert.ok(
    searchBooks(core, "lose Wound", 100, { category: "condition" }).rows.some(
      (x) => x.name === "Bleeding",
    ),
  );
  const psych = find(core, "Fear (Rating)", "psychology"),
    trait = find(core, "Fear", "trait");
  assert.ok(psych && trait && psych.key !== trait.key);
  assert.equal(searchLabel(psych), "Psychology");
  assert.equal(searchLabel(trait), "Creature Trait");
  assert.ok(find(core, "Damaging", "property").entry.text);
  assert.ok(find(core, "Human", "species"));
  assert.ok(
    searchBooks(all, "Language Arabyan", 100, {
      category: "species",
    }).rows.some((x) => x.name === "Tilea"),
  );
  assert.equal(
    searchBooks(core, "Language Arabyan", 100, {
      category: "species",
    }).rows.some((x) => x.name === "Tilea"),
    false,
  );
  assert.equal(JSON.stringify(R), before);
});

test("category browsing and offsets preserve ranking without duplicates or omissions", () => {
  assert.equal(searchBooks(core, "").total, 0);
  assert.equal(searchBooks(core, "", 100, { category: "condition" }).total, 13);
  const complete = searchBooks(core, "test", Infinity, { category: "rule" });
  assert.ok(complete.total > 40);
  const keys = [];
  for (let offset = 0; offset < complete.total; offset += 20)
    keys.push(
      ...searchBooks(core, "test", 20, { category: "rule", offset }).rows.map(
        (x) => x.key,
      ),
    );
  assert.deepEqual(
    keys,
    complete.rows.map((x) => x.key),
  );
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(complete.rows.every((x) => x.kind === "rule"));
  assert.equal(
    searchBooks(core, "unimported-word-zxy", 20, { category: "condition" })
      .total,
    0,
  );
});

test("source tables retain Fifth Edition numbers and optional individual advances without creator conventions", () => {
  const enc = find(core, "Encumbrance", "rule");
  assert.match(enc.entry.text, /200 coins/);
  assert.doesNotMatch(enc.searchable, /ignore coin|automatically pack/);
  assert.match(
    find(core, "Advancement XP Costs", "rule").entry.text,
    /\| \+45 \| 1800 \| 6150 \| 850 \| 3325 \|/,
  );
  const optional = searchBooks(core, "Individual Skill Advances").rows[0];
  assert.equal(optional.entry.source.page, 364);
  assert.match(optional.entry.text, /multiple of 5/);
  assert.match(optional.entry.text, /\| 41 to 45 \| 360 \| 170 \|/);
  assert.match(
    ruleTextHTML(find(core, "Combat Modifiers", "rule").entry.text),
    /<table>/,
  );
  assert.match(
    find(core, "Weapon Range", "rule").entry.text,
    /Extreme \| Range × 3/,
  );
  assert.equal(
    searchBooks(core, "Trained GM permission", 100).rows.some(
      (x) => x.kind === "trait",
    ),
    false,
  );
});

test("reference rendering escapes source text and table cells", () => {
  const text =
    "### <script>alert(1)</script>\n\n| Name | Rule |\n| --- | --- |\n| <img onerror=x> | & value |\n\n• <b>text</b>";
  const html = ruleTextHTML(text);
  assert.ok(
    html.includes("<table>") && html.includes("<h3>") && html.includes("<ul>"),
  );
  assert.doesNotMatch(html, /<script>|<img|<b>/);
  assert.match(html, /&lt;img onerror=x&gt;/);
});

test("lazy references hydrate only selected identities and reject stale or malformed content", async () => {
  const metadata = structuredClone(R);
  const records = metadata.ruleReferences.map(
    ({ source, contentId, bookVersion, ...entry }) => entry,
  );
  metadata.ruleReferences = metadata.ruleReferences.map(
    ({ text, ...entry }) => ({ ...entry, textRef: true }),
  );
  const payload = {
    schemaVersion: 1,
    books: [
      {
        id: "core",
        version: R.books.find((x) => x.id === "core").version,
        records,
      },
      { id: "inactive", version: "1.0", records: [] },
    ],
  };
  const before = JSON.stringify(metadata);
  assert.deepEqual(
    await loadRuleReferences(metadata, () => payload),
    R.ruleReferences,
  );
  assert.equal(JSON.stringify(metadata), before);
  const stale = structuredClone(payload);
  stale.books[0].version = "old";
  await assert.rejects(
    loadRuleReferences(metadata, () => stale),
    /out of date/,
  );
  const missing = structuredClone(payload);
  missing.books[0].records = [];
  await assert.rejects(
    loadRuleReferences(metadata, () => missing),
    /out of date/,
  );
  const malformed = structuredClone(payload);
  malformed.books[0].records = null;
  await assert.rejects(
    loadRuleReferences(metadata, () => malformed),
    /out of date/,
  );
  const changed = structuredClone(payload);
  changed.books[0].records[0].page = 99;
  await assert.rejects(
    loadRuleReferences(metadata, () => changed),
    /identity/,
  );
  await assert.rejects(
    loadRuleReferences(metadata, () => ({ schemaVersion: 99, books: [] })),
    /Unsupported/,
  );
  await assert.rejects(
    loadRuleReferences(metadata, () =>
      Promise.reject(Error("temporary network failure")),
    ),
    /network failure/,
  );
  assert.deepEqual(
    await loadRuleReferences(metadata, () => payload),
    R.ruleReferences,
  );
  assert.throws(
    () => validateRuleReference({ ...records[0], text: "" }, { source: true }),
    /Invalid/,
  );
  assert.throws(
    () => validateRuleReference({ ...records[0], name: 1 }, { source: true }),
    /Invalid/,
  );
  assert.throws(
    () =>
      validateRuleReference(
        { ...records.find((x) => x.category === "skill"), target: undefined },
        { source: true },
      ),
    /Invalid/,
  );
});
