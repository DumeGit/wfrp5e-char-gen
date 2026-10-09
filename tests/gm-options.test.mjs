import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assembleBooks } from "../dist/books.mjs";
import {
  createGMRules,
  foundationBooks,
  gmCatalogue,
} from "../dist/gm/books.mjs";
import {
  freshGM,
  calculateGM,
  validateGMDraft,
  magicChoices,
  gmTalentLimit,
} from "../dist/gm/model.mjs";
import { pickerEntries, workspace, profileResults } from "../dist/gm/views.mjs";
import { sheetSections } from "../dist/gm/pdf.mjs";
import { cardSections } from "../dist/gm/print.mjs";

const json = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const [library, data] = await Promise.all([
  json("../dist/data/book-library.json"),
  json("../dist/gm/data.json"),
]);
const rulesFor = createGMRules(library, data);
const draft = (name = "Human") =>
  freshGM(data, data.profiles.find((p) => p.name === name).id);
const result = (s) => calculateGM(data, rulesFor(s), s);
const talent = (s, name, ranks = 1) =>
  s.talents.push({
    key: `gm-option-${s.talents.length}`,
    name,
    ranks,
    origin: "GM",
  });

test("GM reuses all registered base-book options once, while books gate only foundations", () => {
  const s = draft(),
    R = rulesFor(s);
  const expected = assembleBooks(
    library,
    library.packs
      .filter((p) => p.manifest.kind !== "variant")
      .map((p) => p.manifest.id),
  );
  for (const collection of [
    "skills",
    "talents",
    "weapons",
    "armour",
    "market",
    "spells",
    "runes",
    "techniques",
    "cants",
  ])
    assert.deepEqual(R[collection], expected[collection], collection);
  assert.equal(R.books.length, 11);
  assert.deepEqual(
    foundationBooks(data).map((b) => b.id),
    ["core", "up-in-arms", "archives-ii"],
  );
  assert.equal(gmCatalogue(data, s.books).profiles.length, 49);
  s.books.push("up-in-arms", "archives-ii");
  assert.equal(gmCatalogue(data, s.books).profiles.length, 53);
  assert.equal(gmCatalogue(data, s.books).templates.length, 7);
  assert.equal(rulesFor(s), R);
  assert.deepEqual(
    gmCatalogue(data).training,
    gmCatalogue(data, s.books).training,
  );
  s.books.push("archives-i");
  assert.throws(() => rulesFor(s), /supported GM books/);
  // PC creation still has its own selected content.
  assert.equal(assembleBooks(library, ["core"]).techniques.length, 0);
});

test("source-only books never appear as selectable GM books", () => {
  const s = draft(),
    R = rulesFor(s);
  const html = workspace(gmCatalogue(data, s.books), R, s, result(s), {
    tab: 0,
    profileQuery: "",
    category: "",
    browse: false,
  });
  for (const b of R.books.filter((b) => b.id !== "core"))
    assert.equal(
      html.includes(`id="gm-book-${b.id}"`),
      foundationBooks(data).some((x) => x.id === b.id),
      b.id,
    );
  assert.match(html, /Profile &amp; template books|Profile & template books/);
});

test("book contributions remain constant while profile filters combine book, category and name", () => {
  const core = gmCatalogue(data),
    all = gmCatalogue(data, ["core", "up-in-arms", "archives-ii"]);
  assert.deepEqual(core.books, all.books);
  assert.equal(core.books.find((b) => b.id === "up-in-arms").profileCount, 2);
  assert.equal(core.books.find((b) => b.id === "archives-ii").profileCount, 2);
  const ui = { profileQuery: "", category: "", profileBook: "archives-ii" };
  let html = profileResults(all, ui);
  assert.match(html, /2 printed profiles/);
  assert.match(html, /Typical Sister/);
  assert.match(html, /Rhinox/);
  assert.doesNotMatch(html, /Demigryph Mount/);
  html = profileResults(all, { ...ui, profileQuery: "rhin" });
  assert.match(html, /1 printed profile/);
  assert.doesNotMatch(html, /Typical Sister/);
  const rhinox = data.profiles.find((p) => p.name === "Rhinox");
  assert.match(
    profileResults(all, {
      ...ui,
      category: rhinox.category,
      profileQuery: "rhin",
    }),
    /1 printed profile/,
  );
  assert.match(profileResults(core, ui), /0 printed profiles/);
});

test("shared Skill, Talent and equipment choices survive save and profile-book changes with provenance", () => {
  const s = draft(),
    R = rulesFor(s),
    rows = pickerEntries(data, R, result(s), "equipment");
  for (const book of [
    "winds-of-magic",
    "dwarf-guide",
    "high-elf",
    "deft-steps",
    "blood-bramble",
  ])
    assert.ok(
      rows.some((x) => x.source?.book === book),
      book,
    );
  assert.ok(
    pickerEntries(data, R, result(s), "skill").some(
      (x) => x.name === "Psychometry",
    ),
  );
  talent(s, "Suffuse with Ulgu");
  const blade = R.weapons.find((x) => x.name === "Eonir War Blade");
  s.gear.push({ key: "gm-shared-blade", id: blade.contentId, quantity: 1 });
  const before = result(s);
  assert.deepEqual(before.issues, []);
  assert.equal(before.gear[0].entry.source.book, "archives-i");
  assert.ok(
    before.talents.find((x) => x.name === "Suffuse with Ulgu").adaptation,
  );
  s.books.push("up-in-arms");
  assert.deepEqual(result(s), before);
  assert.deepEqual(
    result(validateGMDraft(data, R, JSON.parse(JSON.stringify(s)))),
    before,
  );
  for (const sections of [sheetSections(before, s), cardSections(before, s)]) {
    assert.match(JSON.stringify(sections), /Suffuse with Ulgu|Eonir War Blade/);
    assert.doesNotMatch(JSON.stringify(sections), /Legacy|proposed adaptation/);
  }
});

test("all-book magic respects ritual, High Magic, Witch and technique access", () => {
  const s = draft(),
    R = rulesFor(s),
    choices = () => magicChoices(R, result(s));
  assert.deepEqual(choices(), []);
  talent(s, "Petty Magic");
  assert.ok(!choices().some((x) => x.ritual || x.category === "Technique"));
  talent(s, "Arcane Magic (Beasts)");
  assert.ok(
    choices().some((x) => x.ritual && x.name === "Bind Monstrous Beast"),
  );
  assert.ok(
    !choices().some(
      (x) =>
        x.ritual && x.ritual.lores.length === 1 && x.ritual.lores[0] === "Fire",
    ),
  );
  assert.ok(choices().some((x) => x.category === "Elven Arcane"));
  const high = draft("High Elf or Wood Elf");
  talent(high, "High Magic");
  assert.ok(
    magicChoices(R, result(high)).some((x) => x.category === "High Magic"),
  );
  assert.ok(
    !magicChoices(R, result(high)).some((x) => x.category === "Elven Arcane"),
  );
  const witch = draft();
  talent(witch, "Witch!");
  assert.ok(magicChoices(R, result(witch)).some((x) => x.category === "Fire"));
  assert.ok(
    magicChoices(R, result(witch)).some((x) => x.category === "Witchcraft"),
  );
  assert.ok(!magicChoices(R, result(witch)).some((x) => x.ritual));
  talent(high, "Sword-dancing");
  const dance = magicChoices(R, result(high)).find(
    (x) => x.category === "Technique" && x.name !== "Ritual of Cleansing",
  );
  high.spells.push(dance.contentId);
  const r = result(high);
  assert.ok(r.spells.some((x) => x.name === "Ritual of Cleansing"));
  assert.ok(r.spells.some((x) => x.name === dance.name));
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.cants, []);
  assert.doesNotThrow(() => validateGMDraft(data, R, high));
  assert.match(JSON.stringify(sheetSections(r, high)), /SL 1/);
});

test("rune knowledge uses PC definitions and printed shared Talent caps", () => {
  const s = draft("Dwarf"),
    R = rulesFor(s);
  const names = pickerEntries(data, R, result(s), "talent").map((x) => x.name);
  const rune = R.runes.find((x) => !x.master && x.form !== "Doom");
  const name = `Rune Magic (${rune.form}: ${rune.name})`;
  assert.ok(names.includes(name));
  talent(s, name);
  assert.deepEqual(
    result(s).runes.map((x) => x.contentId),
    [rune.contentId],
  );
  const master = R.runes.find((x) => x.master);
  talent(s, `Master Rune Magic (${master.form}: ${master.name})`);
  const r = result(s);
  assert.equal(r.runes.filter((x) => x.form === "Doom").length, 3);
  assert.deepEqual(r.issues, []);
  assert.doesNotThrow(() => validateGMDraft(data, R, s));
  assert.match(JSON.stringify(cardSections(r, s)), /Rune knowledge/);
  assert.equal(
    gmTalentLimit(R, r.stats, name),
    Math.floor(r.stats.Int / 10) + Math.floor(r.stats.WP / 10),
  );
  s.talents[0].ranks = gmTalentLimit(R, r.stats, name) + 1;
  assert.ok(result(s).issues.some((x) => x.code === "talent.limit"));
});

test("GM options reject stale or incomplete installed-book inventories", () => {
  const stale = structuredClone(data);
  stale.optionBooks[1].version = "stale";
  assert.throws(() => createGMRules(library, stale), /versions do not match/);
  const missing = structuredClone(data);
  missing.optionBooks.pop();
  assert.throws(
    () => createGMRules(library, missing),
    /inventory does not match/,
  );
});
