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
    new Set(["career", "skill", "talent", "magic", "equipment", "creature", "template", "trait", "mutation"]),
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
  assert.equal(searchBooks(all, "Bawd").rows[0].name, "Bawd");
  assert.ok(searchBooks(all, "Bawd").rows.some(x=>x.kind==='career'&&x.name==='Knave'));
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
