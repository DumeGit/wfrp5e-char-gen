import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as PDFLib from "pdf-lib";
import { assembleGMOptions } from "../src/engine/gm/books.mjs";
import {
  freshGM,
  calculateGM,
  validateGMDraft,
} from "../src/engine/gm/model.mjs";
import {
  LOOT_TABLE,
  MAX_LOOT_DICE,
  rollGMLoot,
  addGMLoot,
  defaultLootLocation,
  lootLines,
} from "../src/engine/gm/loot.mjs";
import { sheetSections, createGMPDF } from "../src/engine/gm/pdf.mjs";
import { cardSections, prepareGMPrint } from "../src/engine/gm/print.mjs";
import { gearLines } from "../src/engine/gm/export-sections.mjs";
import { statBlock } from "./bestiary-presentation.mjs";

const R = assembleGMOptions(
  JSON.parse(
    await readFile(
      new URL("../public/data/book-library.json", import.meta.url),
    ),
  ),
);
const data = JSON.parse(
  await readFile(new URL("../public/gm/data.json", import.meta.url)),
);
const draft = (name = "Human") =>
  freshGM(data, data.profiles.find((p) => p.name === name).id);
const sequence = (faces) => {
  const queue = [...faces];
  return (sides) => {
    assert.ok(queue.length, `unexpected d${sides}`);
    const face = queue.shift();
    assert.ok(face >= 1 && face <= sides);
    return face;
  };
};
const roll = (faces, options = {}) =>
  rollGMLoot(R, { location: "carried", count: 1, ...options }, sequence(faces));

test("the approved original loot table covers d100 exactly once and resolves every item to its existing core record", () => {
  assert.equal(LOOT_TABLE.length, 26);
  assert.deepEqual(
    LOOT_TABLE.flatMap((r) =>
      Array.from({ length: r.max - r.min + 1 }, (_, i) => r.min + i),
    ),
    Array.from({ length: 100 }, (_, i) => i + 1),
  );
  const originals = structuredClone(R);
  for (let face = 1; face <= 100; face++) {
    const preview = rollGMLoot(R, { location: "lair", count: 1 }, (sides) =>
      sides === 100 ? (face === 100 ? 39 : face) : sides,
    );
    assert.equal(preview.error, "");
    assert.ok(preview.entries.length);
    const s = draft();
    addGMLoot(R, s, preview.entries);
    validateGMDraft(data, R, s);
    for (const row of calculateGM(data, R, s).loot) {
      assert.equal(row.location, "lair");
      if (row.id) {
        assert.ok(row.entry.source.book === "core");
        assert.equal(row.entry.contentId, row.id);
      }
    }
  }
  assert.deepEqual(R, originals);
  assert.equal(
    defaultLootLocation(data.profiles.find((p) => p.name === "Human")),
    "carried",
  );
  for (const name of ["Wolf", "Griffon", "Blood Hungry Spore Cloud"])
    assert.equal(
      defaultLootLocation(data.profiles.find((p) => p.name === name)),
      "lair",
    );
});

test("loot dice record exact quantities, bundles and app provenance without adding previewed possessions", () => {
  const s = draft();
  const before = structuredClone(s);
  const preview = roll([41, 7, 98, 99, 3], { count: 3 });
  assert.equal(preview.error, "");
  assert.equal(preview.entries.length, 7);
  assert.deepEqual(
    preview.entries.map((x) => x.quantity),
    [1, 7, 1, 1, 1, 1, 3],
  );
  assert.deepEqual(s, before);
  assert.deepEqual(
    preview.rolls.map((x) => x.faces),
    [[41], [7], [98], [99], [3]],
  );
  for (const record of preview.rolls) {
    assert.equal(record.source.kind, "app");
    assert.equal(record.source.table, "additional-loot-v1");
    assert.equal(record.source.book, undefined);
    assert.ok(Date.parse(record.at));
    assert.equal(
      record.total,
      record.faces.reduce((a, b) => a + b, 0),
    );
  }
  const pennies = roll([21, 3, 8]);
  assert.equal(pennies.entries[0].quantity, 11);
  assert.deepEqual(pennies.rolls[1].faces, [3, 8]);
  s.rolls.push(...preview.rolls);
  assert.equal(s.loot.length, 0);
  validateGMDraft(data, R, s);
});

test("00 creates exactly two extra results, rerolls further 00s and bounds pathological repeat rolls", () => {
  const preview = roll([100, 100, 100, 39, 49, 2]);
  assert.equal(preview.error, "");
  assert.deepEqual(
    preview.entries.map((r) => [r.coin || r.id, r.quantity]),
    [
      ["gold", 1],
      ["core:gear:bandage", 2],
    ],
  );
  assert.equal(preview.outcomes.filter((x) => x.rerolled).length, 2);
  assert.equal(preview.rolls.length, 6);
  const capped = rollGMLoot(R, { location: "carried", count: 1 }, () => 100);
  assert.match(capped.error, /Too many/);
  assert.equal(capped.rolls.length, MAX_LOOT_DICE);
  assert.deepEqual(capped.entries, []);
  for (const options of [
    { location: "pockets", count: 1 },
    { location: "lair", count: 0 },
    { location: "carried", count: 4 },
  ])
    assert.throws(() => rollGMLoot(R, options), /Choose/);
});

test("loot adds atomically, merges only matching locations and does not change existing equipment or mechanics", () => {
  const s = draft("Griffon");
  s.gear.push({ key: "gm-own-lantern", id: "core:gear:lantern", quantity: 1 });
  const before = calculateGM(data, R, s);
  const preview = roll([98]);
  addGMLoot(R, s, preview.entries);
  addGMLoot(R, s, preview.entries);
  addGMLoot(R, s, roll([98], { location: "lair" }).entries);
  assert.equal(s.loot.length, 4);
  assert.deepEqual(
    s.loot.map((r) => r.quantity),
    [2, 2, 1, 1],
  );
  const after = calculateGM(data, R, s);
  assert.deepEqual({ ...after, loot: [] }, { ...before, loot: [] });
  validateGMDraft(data, R, s);
  const unchanged = structuredClone(s);
  assert.throws(
    () =>
      addGMLoot(R, s, [
        { location: "carried", id: "core:gear:lantern", quantity: 9999 },
      ]),
    /loot/,
  );
  assert.deepEqual(s, unchanged);
});

test("legacy saves default to no loot and malformed loot is rejected without repairing explicit values", () => {
  const legacy = draft();
  delete legacy.loot;
  delete legacy.hiddenDescriptions;
  assert.deepEqual(validateGMDraft(data, R, legacy).loot, []);
  assert.ok(!Object.hasOwn(legacy, "loot"));
  const row = {
    key: "gm-loot-test",
    location: "carried",
    coin: "brass",
    quantity: 3,
  };
  for (const loot of [
    null,
    {},
    [{ ...row, quantity: 0 }],
    [{ ...row, quantity: 1.2 }],
    [{ ...row, quantity: 10000 }],
    [{ ...row, location: "equipped" }],
    [{ ...row, coin: "platinum" }],
    [{ ...row, id: "core:gear:pouch" }],
    [{ ...row, source: "invented" }],
    [{ ...row, key: "<script>" }],
    [row, row],
    [
      {
        key: "gm-a",
        id: "core:weapon:hand-weapon",
        location: "carried",
        quantity: 1,
      },
    ],
  ])
    assert.throws(
      () => validateGMDraft(data, R, { ...draft(), loot }),
      /loot/i,
    );
  const s = draft();
  s.gear.push({ key: row.key, id: "core:gear:pouch", quantity: 1 });
  s.loot = [row];
  assert.throws(() => validateGMDraft(data, R, s), /identity/);
});

test("carried/lair loot and coin quantities appear under Gear in preview, full sheets and measured A4 cards", async () => {
  const s = draft();
  addGMLoot(R, s, roll([41, 7]).entries);
  addGMLoot(R, s, roll([99, 3], { location: "lair" }).entries);
  const r = calculateGM(data, R, s);
  assert.equal(lootLines(r.loot).length, 5);
  const full = Object.fromEntries(sheetSections(r, s));
  const card = Object.fromEntries(cardSections(r, s));
  const html = statBlock(r, s);
  for (const text of [
    "Carried loot: 7 brass pennies",
    "Lair loot: 3 × Rations, 1 day",
    "Carried loot: 1 × Pouch",
  ]) {
    assert.ok(full.Gear.includes(text));
    assert.ok(card.Gear.includes(text));
    assert.ok(html.includes(text));
  }
  assert.ok(gearLines(r).includes("Hand Weapon"));
  assert.ok(!full.Attacks.some((line) => line.includes("Pouch")));
  assert.ok(
    (
      await PDFLib.PDFDocument.load(await createGMPDF(PDFLib, r, s))
    ).getPageCount(),
  );
  const batch = await prepareGMPrint(PDFLib, [
    { s, r },
    { s: draft("Wolf"), r: calculateGM(data, R, draft("Wolf")) },
  ]);
  assert.deepEqual(batch.overflow, []);
  assert.ok(
    (await PDFLib.PDFDocument.load(await batch.bytes())).getPageCount(),
  );
});
