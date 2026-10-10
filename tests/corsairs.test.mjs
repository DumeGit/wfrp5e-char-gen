import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library } from "./fixture.mjs";
import { assembleBooks } from "../dist/books.mjs";
import { createGMRules, gmCatalogue } from "../dist/gm/books.mjs";
import {
  freshGM,
  calculateGM,
  applyTemplate,
  validateGMDraft,
} from "../dist/gm/model.mjs";
import { cardSections } from "../dist/gm/print.mjs";
import { loadReferenceLibrary } from "../dist/search-library.mjs";

const book = "corsairs-flariel";
const json = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const data = await json("../dist/gm/data.json");
const raw = await json("../dist/gm/sources/corsairs-flariel.json");
const rulesFor = createGMRules(library, data);
const draft = () => freshGM(data, `${book}:creatures:dark-elf`);
const result = (s) => calculateGM(data, rulesFor(s), s);
const template = (name) =>
  data.templates.find((t) => t.source?.book === book && t.name === name);
const choose = (s, t) => {
  for (const [i, slot] of t.skills.entries())
    if (!slot.optional && slot.options.length > 1)
      s.templateSkills[i] = slot.options.slice(0, slot.count);
  for (const [i, slot] of t.gear.entries())
    if (slot.choose) s.templateGear[i] = slot.options[0].id;
};

test("Corsairs foundations/templates are opt-in; the usable Dark Elf retains its printed baseline", () => {
  assert.equal(raw.profiles.length, 1);
  assert.equal(raw.templates.length, 5);
  assert.equal(
    gmCatalogue(data, ["core"]).profiles.some((p) => p.source?.book === book),
    false,
  );
  assert.equal(
    gmCatalogue(data, ["core", book]).templates.filter(
      (t) => t.source?.book === book,
    ).length,
    5,
  );
  const s = draft(),
    r = result(s);
  validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
  assert.deepEqual(r.issues, []);
  assert.equal(r.wounds, 13);
  assert.equal(r.stats.I, 50);
  assert.equal(r.attacks.length, 1);
  assert.equal(r.attacks[0].damage, 7);
  assert.equal(r.ap.Body, 0);
  assert.ok(r.traits.find((t) => t.name === "Night Vision").adaptation);
  s.optionalAttacks = [r.profile.attacks.find((a) => a.optional).key];
  const attack = result(s).attacks.find((a) => a.name === "Ranged attack");
  assert.equal(attack.damage, 9);
  assert.equal(attack.ranged, true);
  assert.match(attack.text, /60 yards/);
  assert.doesNotMatch(
    JSON.stringify(cardSections(r, s)),
    /Legacy:|Printed Weapon/,
  );
});

test("Sparse Characteristic columns and explicit alternative choices survive calculation and reload", () => {
  const expected = {
    Corsair: { Dex: 45, Int: 40 },
    Oarsman: { Fel: 35, WP: 40, S: 40 },
    Lookout: { Dex: 45, Int: 40, I: 60 },
  };
  for (const name of [
    "Corsair",
    "Oarsman",
    "Lookout",
    "Reaver Captain",
  ]) {
    const s = draft(),
      t = template(name);
    applyTemplate(s, t.id);
    choose(s, t);
    const r = result(s);
    assert.deepEqual(r.issues, [], name);
    for (const [key, score] of Object.entries(expected[name] || {}))
      assert.equal(r.stats[key], score, `${name} ${key}`);
    validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
    if (name === "Lookout")
      assert.equal(r.skills.find((x) => x.name === "Perception").total, 75);
    if (name === "Reaver Captain") {
      const i = t.skills.findIndex((x) => x.count === 2);
      assert.equal(
        r.gear
          .filter((g) => g.entry.name === "Hand Weapon")
          .reduce((n, g) => n + g.quantity, 0),
        2,
      );
      s.templateSkills[i] = [t.skills[i].options[0], t.skills[i].options[0]];
      assert.ok(result(s).issues.some((x) => x.code === "template.skill"));
    }
  }
});

test("Chief Mate's optional Talents are not silently granted or required and can be removed", () => {
  const s = draft(),
    t = template("Chief Mate");
  applyTemplate(s, t.id);
  choose(s, t);
  assert.ok(t.talents.every((x) => x.optional));
  assert.deepEqual(result(s).issues, []);
  assert.equal(result(s).talents.length, 0);
  const i = t.talents.findIndex((x) => x.options[0] === "Dual Wielder");
  s.templateTalents[i] = "Dual Wielder";
  let r = result(s);
  assert.equal(r.talents.length, 1);
  assert.ok(r.talents[0].adaptation);
  validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
  delete s.templateTalents[i];
  assert.equal(result(s).talents.length, 0);
  s.templateTalents[i] = "not a valid choice";
  assert.ok(result(s).issues.some((x) => x.code === "template.talent"));
  assert.equal(result(s).talents.length, 0);
});

test("Dark Magic and Reaper are shared options with selective conversions and no invented PC access or shop prices", async () => {
  const R = assembleBooks(library, [book]);
  const spells = R.spells.filter((x) => x.source.book === book);
  assert.equal(spells.length, 4);
  assert.equal(spells.find((x) => x.name === "Doombolt").cn, "7");
  assert.match(
    spells.find((x) => x.name === "Doombolt").text,
    /Hard \(−2 SL\)/,
  );
  assert.ok(!spells.find((x) => x.name === "Shroud of Despair").adaptation);
  assert.equal(R.config.colours.includes("Dark Magic"), false);
  assert.equal(Boolean(R.species["Dark Elf"]), false);
  const reaper = R.weapons.find((x) => x.name === "Reaper");
  assert.equal(reaper.reach, "100 yards");
  assert.equal(reaper.damage, "12");
  assert.match(reaper.qualities, /Salvo 6/);
  assert.ok(!R.market.some((x) => x.name === "Reaper"));
  assert.ok(rulesFor(freshGM(data)).spells.some((x) => x.source.book === book));
  const references = await loadReferenceLibrary(library, () =>
    json("../dist/data/search-library.json"),
  );
  const rows = references.rows.filter((x) => x.entry.source.book === book);
  assert.ok(rows.some((x) => /Sea Dragon Cloak/.test(x.name)));
  assert.ok(
    !rows.some((x) =>
      /Flariel|Rakaria|Corvian|Cynwra|Ship’s Crew|Reaver Captain/.test(x.name),
    ),
  );
});
