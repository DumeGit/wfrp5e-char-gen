import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as PDFLib from "pdf-lib";
import { freshGM, calculateGM, validateGMDraft } from "../dist/gm/model.mjs";
import { createGMRules, gmCatalogue } from "../dist/gm/books.mjs";
import { addGMSupplement, prepareGM } from "../dist/gm/content.mjs";
import { profileResults, pickerEntries } from "../dist/gm/views.mjs";
import { sheetSections, createGMPDF } from "../dist/gm/pdf.mjs";
import { prepareGMPrint, cardSections } from "../dist/gm/print.mjs";
const json = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const [library, data, raw, core] = await Promise.all([
  json("../dist/data/book-library.json"),
  json("../dist/gm/data.json"),
  json("../dist/gm/sources/up-in-arms.json"),
  json("../dist/gm/sources/core.json"),
]);
const rulesFor = createGMRules(library, data);
const draft = (name) =>
  freshGM(data, data.profiles.find((p) => p.name === name).id);
const result = (s) => calculateGM(data, rulesFor(s), s);

test("GM books are independently opt-in, catalogue order is alphabetical and exclusions stay excluded", () => {
  assert.equal(gmCatalogue(data).profiles.length, 53);
  const enabled = gmCatalogue(data, ["core", "up-in-arms"]);
  assert.equal(enabled.profiles.length, 55);
  assert.equal(enabled.templates.length, 7);
  assert.deepEqual(
    enabled.profiles
      .filter((p) => p.source?.book === "up-in-arms")
      .map((p) => p.name)
      .sort(),
    ["Demigryph Mount", "Riding Horse"],
  );
  const html = profileResults(enabled, { profileQuery: "", category: "" });
  const names = [...html.matchAll(/<strong>(.*?)<\/strong>/g)].map((m) => m[1]);
  assert.deepEqual(
    names,
    [...names].sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" }),
    ),
  );
  assert.ok(
    !names.some((n) =>
      /Destrier|Local Scout|Seasoned Mercenary|Lawyer|Doktor|Porter|Scribe/.test(
        n,
      ),
    ),
  );
  assert.equal(rulesFor(freshGM(data)).books.length, 1);
});
test("supplement compilation validates provenance, numeric tables and core Trait identities", () => {
  const base = prepareGM(core, rulesFor(freshGM(data)));
  base.books = [data.books[0]];
  base.training = [];
  const R = rulesFor(draft("Riding Horse"));
  for (const edit of [
    (x) => (x.source.sha256 = "bad"),
    (x) => (x.profiles[0].stats.WS = -1),
    (x) => (x.profiles[0].traits[0].name = "Invented Trait"),
    (x) => (x.training[0].id = x.profiles[0].id),
  ]) {
    const bad = structuredClone(raw);
    edit(bad);
    assert.throws(() => addGMSupplement(base, bad, R));
  }
});
test("Riding Horse keeps printed stats and training, converts only Stride and primary Size Damage", () => {
  const s = draft("Riding Horse"),
    r = result(s);
  assert.deepEqual(r.stats, {
    M: 7,
    WS: 25,
    BS: null,
    S: 30,
    T: 45,
    I: 20,
    Ag: 30,
    Dex: null,
    Int: 10,
    WP: 10,
    Fel: 20,
  });
  assert.equal(r.wounds, 24);
  assert.equal(r.attacks[0].damage, 9);
  assert.equal(r.attacks[0].skill, 25);
  assert.equal(r.stats.WS, 25);
  assert.equal(r.stats.Fel, 20);
  assert.equal(s.rolls.length, 0);
  assert.equal(
    r.traits.some((t) => t.name === "Stride"),
    false,
  );
  assert.match(
    r.traits.find((t) => t.name === "Sprinter").adaptation,
    /Stride/,
  );
  assert.equal(r.issues.length, 0);
  s.size = "Average";
  const resized = result(s);
  assert.equal(resized.attacks[0].damage, 5);
});
test("Demigryph has correct Talons/Bite, limb coverage, actual training and no double barding", () => {
  const s = draft("Demigryph Mount"),
    r = result(s);
  assert.deepEqual(
    r.attacks.map((a) => [a.name, a.skill, a.damage]),
    [
      ["Talons", 55, 14],
      ["Bite", 55, 9],
    ],
  );
  assert.deepEqual(r.ap, { Head: 3, Body: 3, Forelegs: 3, "Rear Legs": 1 });
  assert.equal(r.wounds, 34);
  assert.equal(r.stats.WS, 55);
  assert.equal(r.stats.Fel, 15);
  const trained = r.traits.find((t) => t.name === "Trained");
  assert.match(trained.description, /Shock Cavalry/);
  assert.doesNotMatch(trained.description, /Fetch:|Drive:|Home:|Magic:/);
  assert.match(trained.adaptation, /SL/);
  assert.match(r.warnings.join(" "), /prose lists Trained \(Magic\)/);
  s.removed.push(r.armour.find((a) => a.name === "Barding").key);
  assert.deepEqual(result(s).ap, {
    Head: 1,
    Body: 1,
    Forelegs: 1,
    "Rear Legs": 1,
  });
  assert.equal(result(s).trappings, "");
  assert.doesNotMatch(JSON.stringify(cardSections(result(s), s)), /Barding/);
});
test("humanoid limb armour has a focused unresolved issue instead of guessed mount coverage", () => {
  const s = draft("Demigryph Mount"),
    R = rulesFor(s),
    entry = R.armour.find((a) => a.locations === "Legs");
  assert.ok(entry);
  s.gear.push({ key: "gm-leg-armour", id: entry.contentId, quantity: 1 });
  const r = result(s),
    issue = r.issues.find((x) => x.code === "armour.locations");
  assert.ok(issue);
  assert.deepEqual(issue.control, { step: 2, target: "#gear-gm-leg-armour" });
  s.gear = [];
  assert.equal(result(s).issues.length, 0);
});
test("Shock Cavalry is book-scoped and requires War; added War applies once", () => {
  const s = draft("Riding Horse");
  s.extraTraining = ["Shock Cavalry"];
  let r = result(s);
  assert.equal(r.issues[0].code, "training.prerequisite");
  assert.equal(r.issues[0].source.book, "up-in-arms");
  assert.match(r.issues[0].control.target, /trait-/);
  s.extraTraining.push("War");
  r = result(s);
  assert.equal(r.issues.length, 0);
  assert.equal(r.stats.WS, 35);
  assert.equal(result(s).stats.WS, 35);
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
  s.extraTraining.push("Mount");
  assert.throws(() => validateGMDraft(data, rulesFor(s), s), /training/);
  const coreHorse = draft("Horse");
  coreHorse.extraTraining = ["Shock Cavalry"];
  assert.throws(
    () => validateGMDraft(data, rulesFor(coreHorse), coreHorse),
    /training/,
  );
});
test("mixed-book saved drafts validate their own catalogues and reject hidden/unsupported books", () => {
  const s = draft("Demigryph Mount");
  assert.doesNotThrow(() =>
    validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s))),
  );
  const hidden = structuredClone(s);
  hidden.books = ["core"];
  assert.throws(
    () => validateGMDraft(data, rulesFor(hidden), hidden),
    /enabled GM book/,
  );
  for (const books of [["up-in-arms"], ["core", "unknown"], ["core", "core"]]) {
    assert.throws(() => rulesFor({ ...s, books }));
  }
  const R = rulesFor(s),
    crew = pickerEntries(data, R, result(s), "talent").find(
      (t) => t.name === "Crew Commander",
    );
  assert.ok(crew.disabled);
  s.talents.push({
    key: "gm-crew",
    name: "Crew Commander",
    origin: "GM",
    ranks: 1,
  });
  assert.throws(() => validateGMDraft(data, R, s), /Talent/);
});
test("both mount PDF formats show actual rules without discrepancy commentary, and fit four cards", async () => {
  const entries = ["Riding Horse", "Demigryph Mount"].map((name) => {
    const s = draft(name);
    return { s, r: result(s) };
  });
  for (const e of entries) {
    const text =
      JSON.stringify(sheetSections(e.r, e.s)) +
      JSON.stringify(cardSections(e.r, e.s));
    assert.doesNotMatch(
      text,
      /Legacy|naming|printed \+|prose lists|double-count/,
    );
    assert.match(text, /Sprinter/);
    const pdf = await PDFLib.PDFDocument.load(
      await createGMPDF(PDFLib, e.r, e.s),
    );
    assert.ok(pdf.getPageCount() >= 1);
  }
  const batch = await prepareGMPrint(PDFLib, entries, { perPage: 4 });
  assert.deepEqual(batch.overflow, []);
  assert.equal(batch.pages, 1);
});
