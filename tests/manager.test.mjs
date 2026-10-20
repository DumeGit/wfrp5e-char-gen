import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { R, library, soldier, advancedSoldier } from "./fixture.mjs";
import * as rules from "../src/engine/rules.mjs";
import { bookSelection } from "../src/engine/books.mjs";
import { characterResult } from "../src/engine/character-result.mjs";
import { createMarijanCatalogue } from "../src/engine/marijan/catalogue.mjs";
import {
  freshMarijan,
  addEntry,
  calculateMarijan,
  fromPlayer,
} from "../src/engine/marijan/model.mjs";
import {
  freshManager,
  importCharacter,
  calculateManager,
  validateManager,
  backup,
  readImport,
  awardXP,
  changeResource,
  changeFate,
  saveAffliction,
  quoteManager,
  purchaseAdvance,
  creditTrapping,
  changeCareer,
  acquire,
  addCondition,
  addJournal,
} from "../src/engine/manager/model.mjs";
import { exportManagerPDF } from "../src/features/manager/export.ts";
import * as PDFLib from "pdf-lib";
import { criticalChoices } from "../src/engine/manager/afflictions.mjs";
const catalogue = createMarijanCatalogue(
  library,
  JSON.parse(
    fs.readFileSync(new URL("../public/gm/data.json", import.meta.url)),
  ),
);
const player = (advanced = false) => ({
  ...(advanced ? advancedSoldier() : soldier()),
  version: 2,
  books: bookSelection(R),
  rollTables: {},
});
const entry = (group, name) =>
  catalogue.rows.find((x) => x.collection === group && x.name === name);

test("status records survive legacy saves and backups without applying effects; Fate stays separate", () => {
  const old = importCharacter(catalogue, library, player());
  delete old.afflictions;
  const record = validateManager(old);
  assert.deepEqual(record.afflictions, []);
  const before = calculateManager(catalogue, record);
  const current = structuredClone(record.current);
  saveAffliction(record, {
    kind: "critical",
    name: "Recorded injury",
    text: "Manual effect",
    location: "Left arm",
    note: "Recovery note",
  });
  saveAffliction(record, {
    kind: "mutation",
    name: "Recorded mutation",
    text: "+5 Strength",
  });
  assert.deepEqual(calculateManager(catalogue, record).stats, before.stats);
  assert.deepEqual(calculateManager(catalogue, record).values, before.values);
  assert.deepEqual(record.current, current);
  const id = record.afflictions[0].id;
  saveAffliction(record, {
    ...record.afflictions[0],
    note: "Updated recovery",
  });
  assert.equal(record.afflictions.length, 2);
  record.afflictions[0].resolved = true;
  const restored = readImport(catalogue, library, backup([record]))[0];
  assert.deepEqual(restored.afflictions, record.afflictions);
  assert.equal(restored.afflictions[0].id, id);
  const original = JSON.stringify(record);
  assert.throws(() => saveAffliction(record, { kind: "critical", name: "" }));
  assert.equal(JSON.stringify(record), original);
  assert.throws(() =>
    validateManager({
      ...record,
      afflictions: [record.afflictions[0], record.afflictions[0]],
    }),
  );
  assert.throws(() =>
    validateManager({
      ...record,
      afflictions: [{ ...record.afflictions[0], resolved: "yes" }],
    }),
  );
  changeFate(record, 0);
  changeFate(record, 3);
  assert.equal(record.sheet.fate, 3);
  assert.deepEqual(record.current, current);
  assert.throws(() => changeFate(record, -1));
});

test("Critical Wound choices project all four reviewed core tables and preserve source effects", () => {
  const payload = JSON.parse(
    fs.readFileSync(
      new URL("../public/data/search-library.json", import.meta.url),
    ),
  );
  const rows = payload.rows.map((row) => ({
    ...row,
    entry: payload.entries[row.entryRef],
  }));
  const choices = criticalChoices(rows);
  assert.deepEqual([...new Set(choices.map((row) => row.location))].sort(), [
    "Arm",
    "Body",
    "Head",
    "Leg",
  ]);
  assert(choices.length >= 70);
  assert(
    choices.every(
      (row) =>
        row.source.book === "core" &&
        row.referenceId.startsWith("core:reference:"),
    ),
  );
  for (const row of choices) {
    const original = rows.find((x) => x.entry.id === row.referenceId).entry;
    assert(original.text.includes(row.name));
    assert(original.text.includes(row.text.replace(/^Wounds: .*?\. /, "")));
  }
  assert.equal(
    choices.find((row) => row.location === "Head" && row.name === "Ear Bash")
      .source.page,
    173,
  );
});

test("Player import preserves all derived totals and original history without mutating the creator", () => {
  for (const pc of [player(), player(true)]) {
    const original = JSON.stringify(pc),
      expected = characterResult(R, pc);
    const record = importCharacter(catalogue, library, pc),
      result = calculateManager(catalogue, record);
    assert.equal(JSON.stringify(pc), original);
    assert.equal(record.type, "wfrp-manager");
    assert.equal(record.sheet.type, "wfrp-character");
    assert.deepEqual(result.stats, expected.derived.stats);
    assert.equal(result.values.wounds, expected.derived.wounds);
    assert.equal(result.values.enc, expected.equipment.total);
    assert.equal(result.values.capacity, expected.derived.capacity);
    for (const [key, label] of Object.entries({
      head: "Head",
      arms: "Arms",
      body: "Body",
      legs: "Legs",
      shield: "Shield",
    }))
      assert.equal(result.values[key], expected.equipment.ap[label]);
    for (const skill of expected.skills.filter((x) => x.adv))
      assert.equal(
        result.skills.find((x) => x.name === skill.name).total,
        skill.total,
      );
    assert.equal(record.sheet.xpUnspent, expected.derived.remaining);
    assert.deepEqual(
      record.attachments[0].data.ledger,
      JSON.parse(JSON.stringify(pc.ledger)),
    );
    assert.equal(record.purchases.length, 0);
  }
});
test("Marijan and Player copies use the same model, calculations and advancement tools", () => {
  const pc = player(),
    calculated = characterResult(R, pc);
  const marijan = fromPlayer(catalogue, pc, calculated, R);
  const a = importCharacter(catalogue, library, pc),
    b = importCharacter(catalogue, library, marijan);
  assert.deepEqual(
    calculateManager(catalogue, a).stats,
    calculateManager(catalogue, b).stats,
  );
  assert.equal(a.sheet.copiedFrom, "");
  assert.equal(b.sheet.copiedFrom, "");
  assert.equal(
    quoteManager(catalogue, a, "char", "WS").cost,
    quoteManager(catalogue, b, "char", "WS").cost,
  );
  purchaseAdvance(catalogue, a, "char", "WS", 5);
  purchaseAdvance(catalogue, b, "char", "WS", 5);
  assert.deepEqual(
    calculateManager(catalogue, a).stats,
    calculateManager(catalogue, b).stats,
  );
});
test("direct Marijan values, custom entries and fixed manual overrides survive import", () => {
  const s = freshMarijan();
  s.name = "Custom";
  s.characteristics.T.initial = 40;
  s.characteristics.WP.initial = 30;
  s.overrides.wounds = 123;
  s.fortune = 3;
  addEntry(s, "skills", {
    name: "Custom skill",
    custom: true,
    char: "WP",
    text: "Custom text",
  });
  s.entries.skills[0].amount = 5;
  s.entries.skills[0].total = 81;
  addEntry(s, "gear", entry("gear", "Backpack"));
  addEntry(s, "gear", entry("gear", "Clothing"));
  const before = calculateMarijan(catalogue, s),
    record = importCharacter(catalogue, library, s),
    after = calculateManager(catalogue, record);
  assert.equal(after.skills.find((x) => x.name === "Custom skill").total, 81);
  for (const k of Object.keys(before.values))
    assert.equal(after.values[k], before.values[k], k);
  record.sheet.characteristics.T.advances += 5;
  assert.equal(calculateManager(catalogue, record).values.wounds, 123);
});
test("resources remain distinct from maximums and future Characteristics recalculate", () => {
  const record = importCharacter(catalogue, library, player());
  const initial = calculateManager(catalogue, record);
  changeResource(record, "wounds", 2);
  changeResource(record, "fortune", 0);
  record.sheet.characteristics.T.advances += 10;
  assert.equal(record.current.wounds, 2);
  assert.equal(record.current.fortune, 0);
  assert(
    calculateManager(catalogue, record).values.wounds > initial.values.wounds,
  );
  assert.throws(() => changeResource(record, "wounds", -1));
});
test("XP quotes match the shared creator engine and advances are atomic on failure", () => {
  const pc = player();
  const record = importCharacter(catalogue, library, pc);
  for (const [type, name] of [
    ["char", "WS"],
    ["char", "Fel"],
    ["skill", "Melee (Polearm)"],
    ["talent", "Drilled"],
  ]) {
    const creator = rules.quote(R, pc, type, name, 5),
      manager = quoteManager(catalogue, record, type, name, 5);
    assert.equal(manager.cost, creator.cost, name);
    assert.equal(manager.inCareer, creator.inCareer, name);
    assert.equal(manager.error, creator.error, name);
  }
  record.sheet.xpUnspent = 0;
  const before = JSON.stringify(record);
  assert.throws(
    () => purchaseAdvance(catalogue, record, "char", "WS", 5),
    /Requires/,
  );
  assert.equal(JSON.stringify(record), before);
  assert.throws(() => awardXP(record, -10));
});
test("individual Advances earn one box per eligible five points and band limits remain", () => {
  const record = importCharacter(catalogue, library, player());
  awardXP(record, 5000);
  const tracker = record.sheet.tracker;
  for (let i = 0; i < 4; i++)
    purchaseAdvance(catalogue, record, "char", "WS", 1);
  assert.equal(record.sheet.tracker, tracker);
  assert.match(
    quoteManager(catalogue, record, "char", "WS", 5).error,
    /five-point band/,
  );
  purchaseAdvance(catalogue, record, "char", "WS", 1);
  assert.equal(record.sheet.tracker, tracker + 1);
});
test("promotion requires tracker and Endeavour and Career changes retain learned values", () => {
  const record = importCharacter(catalogue, library, player());
  awardXP(record, 5000);
  assert.throws(
    () => purchaseAdvance(catalogue, record, "promotion", "", 5, true),
    /tracker/,
  );
  record.sheet.tracker = 10;
  assert.throws(
    () => purchaseAdvance(catalogue, record, "promotion", "", 5, false),
    /Endeavour/,
  );
  purchaseAdvance(catalogue, record, "promotion", "", 5, true);
  assert.equal(record.sheet.level, 2);
  const next = catalogue.careers.find((x) => x.id === "sailor");
  const before = structuredClone(record.sheet.characteristics),
    xp = record.sheet.xpUnspent;
  assert.throws(
    () => changeCareer(catalogue, record, next.contentId || next.id, false),
    /agreement/,
  );
  changeCareer(catalogue, record, next.contentId || next.id, true);
  assert.deepEqual(record.sheet.characteristics, before);
  assert.equal(record.sheet.level, 1);
  assert.equal(record.sheet.tracker, 0);
  assert([100, 200].includes(xp - record.sheet.xpUnspent));
});
test("unknown weight stays unknown, stored gear leaves the load, and purchases debit money once", () => {
  const record = freshManager();
  record.sheet.coins = { gc: 1, ss: 0, d: 0 };
  const item = entry("gear", "Dagger");
  acquire(catalogue, record, item.id, 2, 12, "Purchased");
  assert.equal(
    record.sheet.coins.gc * 240 +
      record.sheet.coins.ss * 12 +
      record.sheet.coins.d,
    228,
  );
  assert.equal(record.sheet.entries.gear[0].amount, 2);
  const custom = makeCustom();
  record.sheet.entries.gear.push(custom);
  assert.equal(calculateManager(catalogue, record).values.enc, null);
  custom.state = "stored";
  assert.notEqual(calculateManager(catalogue, record).values.enc, null);
  const before = JSON.stringify(record);
  assert.throws(() => acquire(catalogue, record, item.id, 1, 99999));
  assert.equal(JSON.stringify(record), before);
});
function makeCustom() {
  const s = freshMarijan();
  addEntry(s, "gear", { name: "Unknown weight", custom: true });
  return s.entries.gear[0];
}
test("library backup validation preserves IDs, rejects a malformed batch, and manager import is independent", () => {
  const record = importCharacter(catalogue, library, player());
  addCondition(record, "Bleeding", 2, "Manual recovery");
  addJournal(record, "Session 1", "Notes");
  const restored = readImport(
    catalogue,
    library,
    JSON.parse(JSON.stringify(backup([record]))),
  );
  assert.deepEqual(restored, [record]);
  const copy = importCharacter(catalogue, library, record);
  assert.notEqual(copy.id, record.id);
  assert.equal(copy.sheet.name, record.sheet.name);
  const bad = backup([record]);
  bad.characters[0].sheet.characteristics.WS.initial = "bad";
  assert.throws(() => readImport(catalogue, library, bad));
  const infinite = structuredClone(record);
  infinite.sheet.xpUnspent = Infinity;
  assert.throws(() => validateManager(infinite));
  assert.throws(() =>
    readImport(catalogue, library, {
      type: "wfrp-manager-library",
      schemaVersion: 999,
      characters: [record],
    }),
  );
});
test("manager PDF uses common sheet with current resources and complete history", async () => {
  const record = importCharacter(catalogue, library, player());
  changeResource(record, "wounds", 2);
  changeResource(record, "fortune", 0);
  addCondition(record, "Bleeding", 1, "Recorded effect");
  addJournal(record, "Long note", "Long note ".repeat(3000));
  saveAffliction(record, {
    kind: "critical",
    name: "Recorded critical",
    text: "Manual effects",
    location: "Left arm",
    note: "Recovery note",
  });
  saveAffliction(record, {
    kind: "mutation",
    name: "Recorded mutation",
    text: "Reference effect",
  });
  const mutation = entry("extras", "Animalistic Legs");
  const mutationKey = addEntry(record.sheet, "extras", mutation);
  record.sheet.entries.extras.find((row) => row.key === mutationKey).inactive =
    true;
  const bytes = await exportManagerPDF(catalogue, record, {
    PDFLib,
    templateBytes: fs.readFileSync(
      new URL("../public/assets/character-sheet.pdf", import.meta.url),
    ),
    fieldMeta: JSON.parse(
      fs.readFileSync(
        new URL("../public/data/sheet-fields.json", import.meta.url),
      ),
    ),
  });
  const doc = await PDFLib.PDFDocument.load(bytes);
  assert.match(doc.getTitle(), /Field Ledger/);
  assert(!doc.getTitle().includes("Marijan"));
  const form = doc.getForm();
  assert.equal(form.getTextField("Current_Wounds").getText(), "2");
  assert.equal(form.getTextField("Fortune_Current").getText(), "0");
  assert(doc.getPageCount() > 3);
});

test("next-level Trappings credit the shared tracker once without granting equipment", () => {
  const record = importCharacter(catalogue, library, player());
  const before = record.sheet.tracker,
    count = record.sheet.entries.gear.length;
  creditTrapping(catalogue, record, 0, "Acquired during the last adventure");
  assert.equal(record.sheet.tracker, before + 1);
  assert.equal(record.sheet.entries.gear.length, count);
  assert.throws(
    () => creditTrapping(catalogue, record, 0, "Again"),
    /already earned/,
  );
});
test("new weapons retain their melee/ranged identity and unknown armour stays unresolved", () => {
  const record = freshManager();
  record.sheet.characteristics.S.initial = 40;
  record.sheet.size = "Large";
  acquire(catalogue, record, entry("gear", "Dagger").id);
  const result = calculateManager(catalogue, record);
  assert.equal(result.equipment.weapons[0].kind, "melee");
  assert.equal(result.equipment.weapons[0].damage, 10);
  const s = freshMarijan();
  addEntry(s, "gear", {
    name: "Unresolved armour",
    custom: true,
    kind: "armour",
    locations: "Body",
  });
  record.sheet.entries.gear.push(s.entries.gear[0]);
  assert.equal(calculateManager(catalogue, record).values.body, null);
});
test("malformed calculation context, dates and external portrait URLs are rejected", () => {
  const record = freshManager();
  record.history.push({
    id: "bad",
    at: "invalid",
    label: "bad",
    detail: "",
    kind: "change",
  });
  assert.throws(() => validateManager(record));
  record.history = [];
  record.portrait = "https://example.com/portrait.png";
  assert.throws(() => validateManager(record));
  delete record.portrait;
  record.context.skillChoices = null;
  record.sheet.career = catalogue.careers.find(
    (x) => x.id === "soldier",
  ).contentId;
  assert.throws(
    () => readImport(catalogue, library, backup([record])),
    /context/,
  );
});
