import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createGMRules, gmCatalogue } from "../dist/gm/books.mjs";
import {
  freshGM,
  calculateGM,
  validateGMDraft,
  magicChoices,
  gmSpellCatalogue,
} from "../dist/gm/model.mjs";
import { pickerEntries } from "../dist/gm/views.mjs";
import { sheetSections } from "../dist/gm/pdf.mjs";
import { cardSections } from "../dist/gm/print.mjs";
const json = async (p) =>
  JSON.parse(await readFile(new URL(p, import.meta.url), "utf8"));
const [library, data, raw] = await Promise.all([
  json("../dist/data/book-library.json"),
  json("../dist/gm/data.json"),
  json("../dist/gm/sources/archives-iii.json"),
]);
const rulesFor = createGMRules(library, data),
  draft = () => freshGM(data, "core:creatures:human", ["core", "archives-iii"]),
  result = (s) => calculateGM(data, rulesFor(s), s),
  talent = (s, name) =>
    s.talents.push({
      key: `gm-test-${s.talents.length}`,
      name,
      ranks: 1,
      origin: "GM",
    });
test("Archives III adds shared options without named NPCs, familiars or alternative armour", () => {
  const s = draft(),
    R = rulesFor(s),
    core = rulesFor(freshGM(data));
  assert.deepEqual(raw.profiles, []);
  assert.deepEqual(raw.training, []);
  assert.equal(raw.review.profileCount, 12);
  assert.deepEqual(
    gmCatalogue(data, s.books).profiles,
    gmCatalogue(data).profiles,
  );
  assert.deepEqual(R.armour, core.armour);
  assert.deepEqual(R.weapons, core.weapons);
  assert.equal(R.spells.length, core.spells.length + 27);
  assert.equal(R.cants.length, 24);
  assert.ok(
    pickerEntries(data, R, result(s), "skill").some(
      (x) => x.name === "Language (Belthani)",
    ),
  );
  assert.ok(
    pickerEntries(data, R, result(s), "talent").some(
      (x) => x.name === "Fearless (Magic Users)",
    ),
  );
  assert.ok(
    pickerEntries(data, R, result(s), "talent").some(
      (x) => x.name === "Arcane Magic (Hedgecraft)",
    ),
  );
});
test("Handrich and Solkan use printed Blessings/Miracles and show their cult references without automatic grants", () => {
  for (const god of ["Handrich", "Solkan"]) {
    const s = draft();
    talent(s, `Bless (${god})`);
    talent(s, `Invoke (${god})`);
    const r = result(s),
      choices = magicChoices(rulesFor(s), r);
    assert.equal(choices.filter((x) => x.category === "Blessing").length, 6);
    assert.equal(choices.filter((x) => x.category === god).length, 6);
    assert.deepEqual(r.spells, []);
    assert.ok(r.warnings.some((x) => x.includes(god)));
    assert.deepEqual(r.issues, []);
  }
});
test("Old Faith Invoke and Miracles unlock additional Blessings without invented Miracles or XP", () => {
  for (const mode of ["talent", "trait"]) {
    const s = draft();
    if (mode === "talent") talent(s, "Invoke (Old Faith)");
    else
      s.traits.push({
        key: "gm-faith",
        name: "Miracles",
        value: "Old Faith",
        origin: "GM",
      });
    const R = rulesFor(s),
      choices = magicChoices(R, result(s));
    assert.equal(choices.length, 19);
    assert.ok(choices.every((x) => x.category === "Blessing"));
    s.spells = [choices[0].contentId, choices[1].contentId];
    assert.deepEqual(result(s).issues, []);
    assert.equal(result(s).spells.length, 2);
    assert.doesNotThrow(() => validateGMDraft(data, R, s));
  }
});
test("Fellstave exposes seven distinct printed targets with source/Legacy and validates independent selections", () => {
  const s = draft();
  talent(s, "Arcane Magic (Hedgecraft)");
  const R = rulesFor(s),
    choices = magicChoices(R, result(s)),
    fell = choices.filter((x) => x.name.startsWith("Fellstave"));
  assert.equal(fell.length, 7);
  assert.ok(!choices.some((x) => x.name === "Fellstave"));
  assert.equal(new Set(fell.map((x) => x.contentId)).size, 7);
  assert.ok(
    fell.every((x) => x.source.book === "archives-iii" && x.adaptation),
  );
  s.spells = fell.slice(0, 2).map((x) => x.contentId);
  let r = result(s);
  assert.deepEqual(r.issues, []);
  assert.equal(r.spells.length, 2);
  assert.doesNotThrow(() => validateGMDraft(data, R, s));
  for (const sections of [sheetSections(r, s), cardSections(r, s)]) {
    const text = JSON.stringify(sections);
    assert.match(text, /Fellstave \(Beastmen\)/);
    assert.match(text, /Fellstave \(Daemons\)/);
    assert.doesNotMatch(text, /Legacy|conversion|Adaptation/);
  }
  s.removed = [fell[0].contentId];
  assert.equal(result(s).spells.length, 1);
  assert.doesNotThrow(() => validateGMDraft(data, R, s));
  s.spells = [R.spells.find((x) => x.name === "Fellstave").contentId];
  assert.throws(() => validateGMDraft(data, R, s), /Unknown spell/);
});
test("Rhya and Hedgecraft additions preserve core duplicate definitions and disappear with the book", () => {
  const s = draft();
  talent(s, "Invoke (Rhya)");
  const R = rulesFor(s);
  assert.equal(
    magicChoices(R, result(s)).filter((x) => x.category === "Rhya").length,
    R.spells.filter((x) => x.category === "Rhya").length,
  );
  for (const name of [
    "Goodwill",
    "Mirkride",
    "Nepenthe",
    "Nostrum",
    "Part the Branches",
    "Protective Charm",
  ])
    assert.equal(
      gmSpellCatalogue(R).find((x) => x.name === name).source.book,
      "core",
    );
  const core = rulesFor({ ...s, books: ["core"] });
  assert.ok(
    !gmSpellCatalogue(core).some((x) => x.name.startsWith("Fellstave")),
  );
  const miracles = magicChoices(R, result(s));
  s.spells = [miracles.find((x) => x.source.book === "archives-iii").contentId];
  assert.throws(() => validateGMDraft(data, core, s), /Unknown spell/);
});
