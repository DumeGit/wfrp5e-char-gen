import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library, R as core } from "./fixture.mjs";
import { assembleBooks } from "../src/engine/books.mjs";
import { createGMRules, gmCatalogue } from "../src/engine/gm/books.mjs";
import { freshGM, calculateGM, validateGMDraft } from "../src/engine/gm/model.mjs";
import { cardSections } from "../src/engine/gm/print.mjs";
import { loadReferenceLibrary } from "../src/engine/search-library.mjs";

const book = "taverns-old-world";
const json = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const data = await json("../public/gm/data.json");
const raw = await json("../content/sources/gm/books/taverns-old-world.json");
const rulesFor = createGMRules(library, data);
const draft = (name) =>
  freshGM(data, raw.profiles.find((p) => p.name === name).id);
const result = (s) => calculateGM(data, rulesFor(s), s);

test("Taverns foundations are opt-in, alphabetic generic staff; all twelve retain valid printed baselines", () => {
  assert.equal(raw.profiles.length, 12);
  assert.deepEqual(
    raw.profiles.map((p) => p.name),
    [...raw.profiles.map((p) => p.name)].sort(),
  );
  assert.equal(
    gmCatalogue(data, ["core"]).profiles.filter((p) => p.source?.book === book)
      .length,
    0,
  );
  assert.equal(
    gmCatalogue(data, ["core", book]).profiles.filter(
      (p) => p.source?.book === book,
    ).length,
    12,
  );
  for (const p of raw.profiles) {
    const s = draft(p.name),
      r = result(s);
    validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
    assert.deepEqual(r.issues, [], p.name);
    const { W, ...printedStats } = p.stats;
    assert.deepEqual(r.stats, printedStats, p.name);
    assert.equal(r.wounds, W, p.name);
    assert.ok(!r.profile.adaptation);
    assert.ok(r.talents.every((t) => !t.adaptation));
    assert.deepEqual(
      r.attacks.map((a) => a.damage),
      p.attacks.map((a) => a.damage),
    );
    assert.match(r.trappings, /Pouch/);
  }
});

test("Grouped totals, printed attacks and body-only leather remain correct after editing and export", () => {
  const s = draft("Excellent Landlord");
  let r = result(s);
  assert.equal(r.skills.find((x) => x.name === "Lore (Law)").total, 55);
  assert.equal(r.skills.find((x) => x.name === "Lore (Local)").total, 55);
  assert.equal(r.skills.find((x) => x.name === "Melee (Basic)").total, 35);
  assert.equal(r.skills.find((x) => x.name === "Melee (Brawling)").total, 40);
  s.stats.Int = 50;
  r = result(s);
  assert.equal(r.skills.find((x) => x.name === "Lore (Law)").total, 60);
  const door = draft("Quality Doorman"),
    d = result(door);
  assert.equal(d.ap.Body, 1);
  assert.equal(d.ap.Head, 0);
  assert.equal(d.tb, 4);
  assert.equal(d.attacks.find((a) => a.name === "Sword").skill, 60);
  assert.equal(d.attacks.find((a) => a.name === "Sword").damage, 8);
  const text = JSON.stringify(cardSections(d, door));
  assert.match(text, /Sword 60 \/ \+8/);
  assert.doesNotMatch(text, /Printed Status|grouped Skill|naming correction/);
  assert.ok(
    result(draft("Quality Chef")).talents.some(
      (t) => t.name === "Nimble-fingered",
    ),
  );
});

test("Only distinct fair-price consumables enter the shared shop; unknown weights stay unknown", () => {
  const R = assembleBooks(library, [book]);
  const rows = R.market.filter((x) => x.source.book === book);
  assert.equal(rows.length, 8);
  assert.ok(rows.every((x) => x.enc === null && x.availability === "Unlisted"));
  assert.equal(rows.find((x) => x.name === "Fine Wine, bottle").price, "2/8");
  for (const name of [
    "Ale, pint",
    "Dwarf Ale, pint",
    "Spirits, pint",
    "Wine, bottle",
    "Meal, inn",
  ])
    assert.deepEqual(
      R.gear.find((x) => x.name === name),
      core.gear.find((x) => x.name === name),
    );
  assert.ok(!rows.some((x) => /Legendary|Room|lodging/i.test(x.name)));
  const s = freshGM(data, "core:creatures:human");
  assert.equal(
    rulesFor(s).market.filter((x) => x.source.book === book).length,
    8,
  );
  assert.equal(R.careers.length, core.careers.length);
});

test("source rules remain auditable while Search retains only genuine tables and supported options", async () => {
  const refs = await json(
    "../content/sources/data/books/taverns-old-world/reference-entries.json",
  );
  assert.equal(refs.length, 49);
  assert.equal(refs.filter((x) => x.category === "table").length, 7);
  assert.ok(
    refs.every(
      (x) => !["profile", "template"].includes(x.category) && !x.adaptation,
    ),
  );
  assert.match(
    refs.find((x) => x.name === "Tavern booths and privacy").text,
    /–1 SL/,
  );
  assert.match(
    refs.find((x) => x.name === "Tavern hazard: Yellow Mould").text,
    /1 Wound for every Round/,
  );
  assert.match(
    refs.find((x) => x.name === "Gold Tavern Venue Vital Statistics Table")
      .text,
    /10: Staff: Excellent Staff/,
  );
  const search = await loadReferenceLibrary(library, () =>
    json("../public/data/search-library.json"),
  );
  const rows = search.rows.filter((x) => x.entry.source.book === book);
  assert.ok(!rows.some((x) => x.kind === "rule"));
  assert.ok(!rows.some((x) => x.name === "Tavern game: Cerevis"));
  const tables = rows.filter((x) => x.kind === "table");
  assert.equal(tables.length, 7);
  const gold = tables.find(
    (x) => x.name === "Gold Tavern Venue Vital Statistics Table",
  );
  assert.ok(gold);
  assert.equal(gold.entry.descriptionStatus, "reviewed");
  assert.match(gold.entry.text, /10: Staff: Excellent Staff/);
  assert.match(gold.entry.text, /Legendary Wine/);
  assert.ok(
    !rows.some((x) =>
      /Landlord|Doorman|Chef|Coach and Horses|Crossed Pikes/.test(x.name),
    ),
  );
});
