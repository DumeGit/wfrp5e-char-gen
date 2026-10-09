import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import {
  createMarijanCatalogue,
  findEntries,
} from "../dist/marijan/catalogue.mjs";
import {
  freshMarijan,
  validateMarijan,
  calculateMarijan,
  addEntry,
  applySpeciesDefaults,
  rollCharacteristics,
  fromPlayer,
} from "../dist/marijan/model.mjs";
import {
  marijanFieldValues,
  exportMarijanSheet,
} from "../dist/marijan/pdf.mjs";
import { assembleBooks, bookSelection } from "../dist/books.mjs";
import { fresh } from "../dist/rules.mjs";
import { characterResult } from "../dist/character-result.mjs";
const [library, gm] = await Promise.all([
  readFile(
    new URL("../dist/data/book-library.json", import.meta.url),
    "utf8",
  ).then(JSON.parse),
  readFile(new URL("../dist/gm/data.json", import.meta.url), "utf8").then(
    JSON.parse,
  ),
]);
const c = createMarijanCatalogue(library, gm),
  row = (group, name) =>
    c.rows.find((x) => x.collection === group && x.name === name);
test("catalogue reuses all installed options and explicit Career variants", () => {
  assert(row("talents", "Strong Back"));
  assert(row("skills", "Lore (Alchemy)"));
  assert(row("magic", "Face of the Wild"));
  assert(row("extras", "Trained"));
  assert(c.careers.some((x) => x.source.book === "archives-iii-hedge"));
  assert.equal(findEntries(c, "skills", "alchemy")[0].name, "Lore (Alchemy)");
  assert(findEntries(c, "magic", "", "blood-bramble").length >= 24);
});
test("manual creation has no Career, XP, prerequisites or rank gate", () => {
  const s = freshMarijan();
  s.characteristics.WS.initial = 250;
  s.characteristics.WS.advances = 13;
  s.xpSpent = 700;
  s.xpUnspent = -20;
  s.level = 9;
  const e = addEntry(s, "talents", row("talents", "Strong Back"));
  s.entries.talents.find((x) => x.key === e).amount = 20;
  addEntry(s, "magic", row("magic", "Blessing of Battle"));
  assert.deepEqual(validateMarijan(s), s);
  const r = calculateMarijan(c, s);
  assert.equal(r.stats.WS, 263);
  assert.equal(r.xpTotal, 680);
  assert.equal(r.career, undefined);
  assert.equal(s.entries.magic.length, 1);
});
test("manual overrides remain fixed as Characteristic and Skill totals change", () => {
  const s = freshMarijan();
  applySpeciesDefaults(c, s);
  s.overrides.wounds = 123;
  const key = addEntry(s, "skills", row("skills", "Climb"));
  const skill = s.entries.skills.find((x) => x.key === key);
  skill.amount = 7;
  let r = calculateMarijan(c, s);
  assert.equal(r.skills[0].total, 27);
  s.characteristics.S.advances = 11;
  skill.total = 80;
  r = calculateMarijan(c, s);
  assert.equal(r.values.wounds, 123);
  assert.equal(r.skills[0].total, 80);
  s.overrides.wounds = null;
  skill.total = null;
  r = calculateMarijan(c, s);
  assert.equal(r.values.wounds, r.auto.wounds);
  assert.equal(r.skills[0].total, 38);
});
test("Tiny and unknown equipment weight remain unknown instead of invented zero", () => {
  const s = freshMarijan();
  s.size = "Tiny";
  addEntry(s, "gear", { name: "Mystery", custom: true });
  let r = calculateMarijan(c, s);
  assert.equal(r.values.wounds, null);
  assert.equal(r.values.enc, null);
  s.entries.gear[0].state = "stored";
  assert.equal(calculateMarijan(c, s).values.enc, 0);
});
test("Species defaults are explicit and preserve Advances, entries and overrides", () => {
  const s = freshMarijan();
  s.species = "Ogre";
  s.characteristics.T.advances = 3;
  s.overrides.wounds = 77;
  addEntry(s, "talents", row("talents", "Hardy"));
  applySpeciesDefaults(c, s);
  assert.equal(s.fate, 1);
  assert.equal(s.fortune, 2);
  assert.equal(s.size, "Large");
  assert.equal(s.characteristics.T.advances, 3);
  assert.equal(s.entries.talents.length, 1);
  assert.equal(s.overrides.wounds, 77);
});
test("actual rolls include Species modifiers and replace prior starting values", () => {
  const s = freshMarijan(),
    random = {
      getRandomValues(a) {
        a.fill(0);
        return a;
      },
    };
  rollCharacteristics(s, c, random);
  assert.equal(s.characteristics.S.initial, 22);
  rollCharacteristics(s, c, random);
  assert.equal(s.characteristics.S.initial, 22);
  assert.equal(s.rolls.length, 20);
  assert.equal(validateMarijan(s).rolls.length, 20);
});
test("invalid files and markup keys are rejected without applying creation rules", () => {
  assert.throws(() => validateMarijan(fresh()));
  const s = freshMarijan();
  addEntry(s, "skills", row("skills", "Climb"));
  s.entries.skills[0].key = '" onclick="evil';
  assert.throws(() => validateMarijan(s));
  s.entries.skills[0].key = "valid";
  s.entries.skills[0].amount = Infinity;
  assert.throws(() => validateMarijan(s));
});
test("copying a Player snapshot includes existing bonuses only once and preserves original", () => {
  const R = assembleBooks(library),
    pc = { ...fresh(), version: 2, books: bookSelection(R), rollTables: {} };
  const before = JSON.stringify(pc),
    r = characterResult(R, pc),
    s = fromPlayer(c, pc, r, R),
    copy = calculateMarijan(c, validateMarijan(s));
  assert.equal(JSON.stringify(pc), before);
  assert.deepEqual(copy.stats, r.derived.stats);
  assert.equal(copy.values.wounds, r.derived.wounds);
  assert.equal(copy.values.enc, r.equipment.total);
  assert.equal(s.talentEffects, false);
});
test("editable PDF and complete record retain values, ranks, overrides and overflow", async () => {
  const require = createRequire(import.meta.url),
    PDFLib = require("pdf-lib"),
    s = freshMarijan();
  s.name = "Marijan PDF";
  s.fate = 7;
  s.fortune = 2;
  s.overrides.wounds = 133;
  s.notes = "A very long note ".repeat(500);
  s.characteristics.S.initial = 40;
  for (let i = 0; i < 30; i++)
    addEntry(s, "talents", {
      name: `Custom talent ${i}`,
      custom: true,
      text: "Custom effect " + i,
    });
  s.entries.talents[0].amount = 12;
  const r = calculateMarijan(c, s),
    values = marijanFieldValues(c, s, r);
  assert.equal(values.Fate, 7);
  assert.equal(values.Fortune_Max, 2);
  assert.equal(values.Talent_01_Name, "Custom talent 0 x12");
  const templateBytes = await readFile(
      new URL("../dist/assets/character-sheet.pdf", import.meta.url),
    ),
    fieldMeta = JSON.parse(
      await readFile(
        new URL("../dist/data/sheet-fields.json", import.meta.url),
        "utf8",
      ),
    );
  const bytes = await exportMarijanSheet(c, s, r, {
      PDFLib,
      templateBytes,
      fieldMeta,
    }),
    pdf = await PDFLib.PDFDocument.load(bytes);
  assert(pdf.getPageCount() > 2);
  assert.equal(pdf.getForm().getTextField("Name").getText(), "Marijan PDF");
  assert.equal(pdf.getForm().getTextField("Wounds_Total").getText(), "133");
  assert.equal(
    pdf.getForm().getTextField("Talent_01_Name").getText(),
    "Custom talent 0 x12",
  );
  assert.equal(
    pdf.getForm().getTextField("Notes").getText(),
    "See attached record.",
  );
});

test("custom prototype-like Species names never pick inherited defaults", () => {
  const s = freshMarijan();
  s.species = "constructor";
  applySpeciesDefaults(c, s);
  assert.equal(calculateMarijan(c, s).values.capacity, 0);
  assert.equal(s.characteristics.S.initial, 0);
});
