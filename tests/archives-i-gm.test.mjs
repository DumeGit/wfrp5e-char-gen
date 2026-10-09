import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createGMRules, gmCatalogue, sourceLabel } from "../dist/gm/books.mjs";
import { freshGM, calculateGM, validateGMDraft } from "../dist/gm/model.mjs";
import { pickerEntries, workspace } from "../dist/gm/views.mjs";
import { sheetSections } from "../dist/gm/pdf.mjs";
import { cardSections } from "../dist/gm/print.mjs";

const json = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const [library, data, raw] = await Promise.all([
  json("../dist/data/book-library.json"),
  json("../dist/gm/data.json"),
  json("../dist/gm/sources/archives-i.json"),
]);
const rulesFor = createGMRules(library, data);
const draft = () =>
  freshGM(data, data.profiles.find((p) => p.name === "Human").id, ["core"]);
const result = (s) => calculateGM(data, rulesFor(s), s);

test("Archives I GM selection shares approved PC data without adding named NPCs or invented animals", () => {
  const s = draft(),
    R = rulesFor(s),
    core = rulesFor(freshGM(data));
  assert.equal(raw.review.profileCount, 13);
  assert.equal(raw.profiles.length, 0);
  assert.equal(raw.training.length, 0);
  assert.deepEqual(
    gmCatalogue(data, s.books).profiles,
    gmCatalogue(data).profiles,
  );
  assert.deepEqual(
    gmCatalogue(data, s.books).templates,
    gmCatalogue(data).templates,
  );
  assert.equal(
    R.weapons.filter((w) => w.source.book === "archives-i").length,
    6,
  );
  assert.equal(
    R.market.filter(
      (w) =>
        w.source.book === "archives-i" &&
        !R.weapons.some((x) => x.name === w.name),
    ).length,
    3,
  );
  assert.deepEqual(
    R.weapons.filter((w) => w.source.book === "core"),
    core.weapons.filter((w) => w.source.book === "core"),
  );
  const names = pickerEntries(data, R, result(s), "skill").map((x) => x.name);
  assert.ok(names.includes("Ride (Badger)"));
  assert.ok(names.includes("Lore (Moot)"));
  const html = workspace(gmCatalogue(data, s.books), R, s, result(s), {
    tab: 0,
    profileQuery: "",
    category: "",
    browse: false,
  });
  assert.doesNotMatch(html, /id="gm-book-archives-i"/);
  assert.ok(core.weapons.some((w) => w.name === "Eonir War Blade"));
});

test("selected Archives I gear and Youngblood retain calculation, provenance, Legacy and validated save behavior", () => {
  const s = draft(),
    R = rulesFor(s);
  const blade = R.weapons.find((w) => w.name === "Eonir War Blade"),
    javelin = R.weapons.find((w) => w.name === "Blackbriar Javelin");
  s.gear.push(
    { key: "gm-blade", id: blade.contentId, quantity: 1 },
    { key: "gm-javelin", id: javelin.contentId, quantity: 1 },
  );
  s.talents.push({
    key: "gm-youngblood",
    name: "Youngblood",
    ranks: 1,
    origin: "GM",
  });
  const r = result(s);
  assert.deepEqual(r.issues, []);
  assert.equal(
    r.attacks.find((a) => a.name === blade.name).damage,
    Math.floor(r.stats.S / 10) + 3,
  );
  assert.equal(r.gear[0].entry.contentId, blade.contentId);
  assert.equal(sourceLabel(blade), "Archives I · p. 92");
  assert.ok(!blade.adaptation);
  assert.ok(r.gear[1].entry.adaptation);
  assert.ok(r.talents.find((t) => t.name === "Youngblood").adaptation);
  const restored = validateGMDraft(data, R, JSON.parse(JSON.stringify(s)));
  assert.deepEqual(result(restored), r);
  const exportText =
    JSON.stringify(sheetSections(r, s)) + JSON.stringify(cardSections(r, s));
  assert.match(exportText, /Eonir War Blade/);
  assert.match(exportText, /Youngblood/);
  assert.doesNotMatch(exportText, /Legacy|per-rank|conversion/);
  const invalid = structuredClone(s);
  invalid.talents[0].ranks = 2;
  assert.ok(
    calculateGM(data, R, invalid).issues.some((i) =>
      /Youngblood/.test(i.message),
    ),
  );
  invalid.talents[0].ranks = 1;
  invalid.books = ["core"];
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(invalid), invalid));
});

test("combined GM books retain approved ammunition precedence regardless of selection order", () => {
  for (const books of [
    ["core"],
    ["core", "up-in-arms"],
    ["core", "archives-ii", "up-in-arms"],
  ]) {
    const R = rulesFor({ ...draft(), books });
    const entries = R.market.filter(
      (x) => x.name === "Precision Shot and Powder",
    );
    assert.equal(entries.length, 1);
    assert.equal(entries[0].source.book, "up-in-arms");
  }
});
