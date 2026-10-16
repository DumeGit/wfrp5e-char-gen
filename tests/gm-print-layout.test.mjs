import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as PDFLib from "pdf-lib";
import { assembleBooks } from "../dist/books.mjs";
import { freshGM, calculateGM } from "../dist/gm/model.mjs";
import { prepareGMPrint, cardSections } from "../dist/gm/print.mjs";
import {
  CARD_PAGE,
  printGeometry,
  packTableCards,
} from "../dist/gm/card-packing.mjs";
import { planRecordCard } from "../dist/gm/card-layout.mjs";

const R = assembleBooks(
    JSON.parse(
      await readFile(
        new URL("../dist/data/book-library.json", import.meta.url),
      ),
    ),
  ),
  data = JSON.parse(
    await readFile(new URL("../dist/gm/data.json", import.meta.url)),
  );
function entry(name = "Human", description = "") {
  const p = data.profiles.find((p) => p.name === name),
    s = freshGM(data, p.id);
  s.description = description;
  return { s, r: calculateGM(data, R, s) };
}

function withinPage(cards) {
  for (const card of cards) {
    assert.ok(card.x >= CARD_PAGE.margin);
    assert.ok(
      card.x + card.width <= CARD_PAGE.width - CARD_PAGE.margin + 0.001,
    );
    assert.ok(card.top <= CARD_PAGE.height - CARD_PAGE.margin + 0.001);
    assert.ok(
      card.top - card.height >= CARD_PAGE.margin + CARD_PAGE.footer - 0.001,
    );
    for (const other of cards.filter(
      (x) => x !== card && x.page === card.page && x.column === card.column,
    ))
      assert.ok(
        card.top <= other.top - other.height - CARD_PAGE.gap + 0.001 ||
          other.top <= card.top - card.height - CARD_PAGE.gap + 0.001,
      );
  }
}

test("flexible packing fills unequal columns and backfills earlier gaps without overlaps or lost cards", () => {
  const heights = [600, 600, 300, 50, 600];
  const packed = packTableCards(heights, "flexible");
  assert.equal(packed.pages, 2);
  assert.deepEqual(
    packed.positions.map((p) => p.height),
    heights,
  );
  assert.deepEqual(
    packed.positions.map((p) => p.page),
    [0, 0, 1, 0, 1],
  );
  withinPage(packed.positions);
  const backfilled = packTableCards(
    [600, 600, 500, 500, 150, 150, 270, 270],
    "flexible",
  );
  assert.equal(backfilled.pages, 2);
  withinPage(backfilled.positions);
  const exact = printGeometry("flexible").height;
  const boundary = packTableCards([exact, 20, exact], "flexible");
  assert.equal(boundary.pages, 2);
  withinPage(boundary.positions);
  for (const invalid of [-1, 0, NaN, Infinity, exact + 0.01])
    assert.throws(() => packTableCards([invalid], "flexible"), /height/);
});

test("flexible PDF fits more than six short creatures without shrinking to fill gaps", async () => {
  const entries = Array.from({ length: 8 }, (_, i) =>
    entry("Human", i % 2 ? "Red hair; a scar across one cheek." : ""),
  );
  const fixed = await prepareGMPrint(PDFLib, entries);
  const flexible = await prepareGMPrint(PDFLib, entries, {
    perPage: "flexible",
  });
  assert.equal(fixed.pages, 2);
  assert.equal(flexible.pages, 1);
  assert.deepEqual(flexible.overflow, []);
  assert.equal(flexible.cards.length, 8);
  assert.ok(
    flexible.cards.every(
      (c) => c.height === c.contentHeight && c.fontSize === 9.25,
    ),
  );
  assert.ok(new Set(flexible.cards.map((c) => c.height)).size > 1);
  withinPage(flexible.cards);
  assert.equal(
    (await PDFLib.PDFDocument.load(await flexible.bytes())).getPageCount(),
    1,
  );
});

test("record-grid Desc is optional and retains complete description text in measured boxes", async () => {
  assert.ok(
    !cardSections(entry().r, entry().s).some(([label]) => label === "Desc"),
  );
  const value = entry(
    "Griffon",
    "A pale scar beneath the left eye. " + "UnbrokenDescription".repeat(10),
  );
  const doc = await PDFLib.PDFDocument.create(),
    font = await doc.embedFont(PDFLib.StandardFonts.Helvetica),
    bold = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold),
    geometry = printGeometry("flexible");
  const plan = planRecordCard(
    font,
    bold,
    { ...value, sections: cardSections(value.r, value.s) },
    geometry.width,
    geometry.height,
    9.25,
  );
  assert.equal(plan.fits, true);
  const text = plan.commands.filter((c) => c.kind === "text");
  const words = text.flatMap((c) => c.lines.flat().map((r) => r.text)).join("");
  assert.match(words, /Desc/);
  assert.ok(
    words.replace(/\s/g, "").includes(value.s.description.replace(/\s/g, "")),
  );
  for (const command of text) {
    assert.ok(command.x >= 0 && command.x + command.width <= plan.width);
    assert.ok(
      command.top + command.lines.length * command.leading <= plan.heightNeeded,
    );
    for (const line of command.lines) {
      const width = line.reduce(
        (n, run) =>
          n +
          (run.bold ? bold : font).widthOfTextAtSize(run.text, command.size),
        0,
      );
      assert.ok(width <= command.width + 0.001);
    }
  }
});

test("flexible packing paginates long profiles and blocks a card taller than a full column", async () => {
  const entries = Array.from({ length: 10 }, () => entry("Varghulf"));
  const prepared = await prepareGMPrint(PDFLib, entries, {
    perPage: "flexible",
  });
  assert.ok(prepared.pages > 1);
  assert.deepEqual(prepared.overflow, []);
  withinPage(prepared.cards);
  assert.equal(
    (await PDFLib.PDFDocument.load(await prepared.bytes())).getPageCount(),
    prepared.pages,
  );
  const huge = entry(
    "Human",
    "An exceptionally long description. ".repeat(3000),
  );
  const blocked = await prepareGMPrint(PDFLib, [huge], { perPage: "flexible" });
  assert.deepEqual(blocked.overflow, [huge.r.name]);
  assert.equal(blocked.cards[0].fontSize, 7.5);
  await assert.rejects(blocked.bytes(), /full A4 column/);
});
