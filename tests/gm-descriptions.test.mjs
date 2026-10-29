import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as PDFLib from "pdf-lib";
import { assembleGMOptions } from "../src/engine/gm/books.mjs";
import {
  freshGM,
  calculateGM,
  validateGMDraft,
  applyTemplate,
} from "../src/engine/gm/model.mjs";
import {
  abilityPresentation,
  descriptionKey,
  showsDescription,
} from "../src/engine/gm/ability-presentation.mjs";
import { sheetSections, createGMPDF } from "../src/engine/gm/pdf.mjs";
import { cardSections, prepareGMPrint } from "../src/engine/gm/print.mjs";
import { planRecordCard } from "../src/engine/gm/card-layout.mjs";
import { printGeometry } from "../src/engine/gm/card-packing.mjs";
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
function draft(name = "Human") {
  return freshGM(data, data.profiles.find((p) => p.name === name).id);
}
function withAbilities() {
  const s = draft();
  s.traits.push({
    key: "gm-fear",
    name: "Fear",
    value: "2",
    ranks: 1,
    origin: "GM",
  });
  s.talents.push({
    key: "gm-strong-back",
    name: "Strong Back",
    ranks: 2,
    origin: "GM",
  });
  return s;
}
function withMagic() {
  const s = draft();
  s.talents.push({
    key: "gm-petty",
    name: "Petty Magic",
    ranks: 1,
    origin: "GM",
  });
  s.traits.push({
    key: "gm-miracles",
    name: "Miracles",
    value: "Sigmar",
    ranks: 1,
    origin: "GM",
  });
  s.spells = [
    "core:spells:animal-friend",
    "core:spells:beacon-of-righteous-virtue",
  ];
  return s;
}

test("spell and Miracle descriptions share output preferences without changing magic or parameters", () => {
  const s = withMagic();
  const r = calculateGM(data, R, s);
  assert.deepEqual(r.issues, []);
  const spell = r.spells[0],
    miracle = r.spells[1];
  const shown = abilityPresentation("magic", spell, s);
  assert.ok(shown.description.length > 20);
  assert.ok(shown.parameters.includes("Range"));
  s.hiddenDescriptions = [descriptionKey("magic", spell, s)];
  assert.doesNotThrow(() =>
    validateGMDraft(data, R, JSON.parse(JSON.stringify(s))),
  );
  assert.deepEqual(calculateGM(data, R, s), r);
  const hidden = abilityPresentation("magic", spell, s);
  assert.equal(hidden.description, "");
  assert.equal(hidden.name, shown.name);
  assert.equal(hidden.parameters, shown.parameters);
  assert.ok(!hidden.text.includes(shown.description));
  assert.ok(abilityPresentation("magic", miracle, s).description.length);
  const sheet = Object.fromEntries(sheetSections(r, s))["Magic & prayers"];
  const card = Object.fromEntries(cardSections(r, s)).Magic;
  assert.equal(sheet[0], hidden.text);
  assert.ok(card.includes(hidden.text));
  assert.ok(!card.includes(shown.description));
  assert.ok(statBlock(r, s).includes(hidden.name));
  const legacy = { ...s };
  delete legacy.hiddenDescriptions;
  const restored = validateGMDraft(data, R, legacy);
  assert.equal(showsDescription("magic", spell, restored), true);
});

test("magic description switches affect measured and drawn cards and full PDF exports", async () => {
  const shown = withMagic(),
    r = calculateGM(data, R, shown);
  const hidden = {
    ...shown,
    hiddenDescriptions: r.spells.map((x) => descriptionKey("magic", x, shown)),
  };
  const doc = await PDFLib.PDFDocument.create();
  const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
  const bold = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
  const geometry = printGeometry("flexible");
  const plan = (s) =>
    planRecordCard(
      font,
      bold,
      { s, r, sections: cardSections(r, s) },
      geometry.width,
      geometry.height,
      9.25,
    );
  const on = plan(shown),
    off = plan(hidden);
  assert.ok(on.heightNeeded > off.heightNeeded);
  const text = off.commands
    .filter((c) => c.kind === "text")
    .flatMap((c) => c.lines.map((line) => line.map((run) => run.text).join("")))
    .join(" ");
  for (const spell of r.spells)
    assert.ok(
      !text.includes(abilityPresentation("magic", spell, shown).description),
    );
  const batch = await prepareGMPrint(PDFLib, [
    { s: shown, r },
    { s: hidden, r },
  ]);
  assert.deepEqual(batch.overflow, []);
  assert.ok(
    (await PDFLib.PDFDocument.load(await batch.bytes())).getPageCount(),
  );
  assert.ok(
    (
      await PDFLib.PDFDocument.load(await createGMPDF(PDFLib, r, shown))
    ).getPageCount(),
  );
  assert.ok(
    (
      await PDFLib.PDFDocument.load(await createGMPDF(PDFLib, r, hidden))
    ).getPageCount(),
  );
});

test("legacy current-version drafts default descriptions to shown without changing the input", () => {
  const legacy = withAbilities();
  delete legacy.hiddenDescriptions;
  const restored = validateGMDraft(data, R, legacy);
  assert.deepEqual(restored.hiddenDescriptions, []);
  assert.ok(!Object.hasOwn(legacy, "hiddenDescriptions"));
  const r = calculateGM(data, R, restored);
  assert.ok(showsDescription("trait", r.traits[0], restored));
  assert.ok(showsDescription("talent", r.talents[0], restored));
  for (const hiddenDescriptions of [
    null,
    {},
    [true],
    ["unknown"],
    ["trait:x", "trait:x"],
    ["talent:"],
    ["trait:" + "x".repeat(2000)],
  ])
    assert.throws(
      () => validateGMDraft(data, R, { ...restored, hiddenDescriptions }),
      /description/i,
    );
});

test("name-only output preserves ratings/ranks, canonical rules and all calculations across preview and PDFs", async () => {
  const s = withAbilities();
  const r = calculateGM(data, R, s);
  assert.ok(
    Object.fromEntries(sheetSections(r, s)).Talents[0].includes(
      r.talents[0].description,
    ),
  );
  s.hiddenDescriptions = [
    descriptionKey("trait", r.traits[0], s),
    descriptionKey("talent", r.talents[0], s),
  ];
  assert.deepEqual(calculateGM(data, R, s), r);
  validateGMDraft(data, R, s);
  const full = Object.fromEntries(sheetSections(r, s));
  const card = Object.fromEntries(cardSections(r, s));
  assert.deepEqual(full.Talents, ["Strong Back ×2"]);
  assert.deepEqual(full["Creature Traits"], ["Fear (2)"]);
  assert.equal(card.Talents, "Strong Back ×2");
  assert.equal(card.Traits, "Fear (2)");
  const html = statBlock(r, s);
  assert.ok(html.includes("Strong Back ×2") && html.includes("Fear (2)"));
  assert.ok(!html.includes(r.talents[0].description));
  assert.ok(!html.includes(r.traits[0].description));
  const output = abilityPresentation("talent", r.talents[0], s);
  assert.deepEqual(output.runs, [{ text: "Strong Back ×2", bold: true }]);
  assert.ok(r.traits[0].summary.length && r.talents[0].description.length);
  assert.ok(
    (
      await PDFLib.PDFDocument.load(await createGMPDF(PDFLib, r, s))
    ).getPageCount(),
  );
  s.traits[0].value = "3";
  s.talents[0].ranks = 1;
  const changed = calculateGM(data, R, s);
  assert.equal(
    abilityPresentation("trait", changed.traits[0], s).text,
    "Fear (3)",
  );
  assert.equal(
    abilityPresentation("talent", changed.talents[0], s).text,
    "Strong Back",
  );
});

test("card measurement and drawing omit hidden text and mixed batches retain independent preferences", async () => {
  const full = draft("Griffon");
  const r = calculateGM(data, R, full);
  const hidden = {
    ...structuredClone(full),
    hiddenDescriptions: r.traits.map((t) => descriptionKey("trait", t, full)),
  };
  const doc = await PDFLib.PDFDocument.create();
  const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
  const bold = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
  const geometry = printGeometry("flexible");
  const plan = (s) =>
    planRecordCard(
      font,
      bold,
      { s, r, sections: cardSections(r, s) },
      geometry.width,
      geometry.height,
      9.25,
    );
  const on = plan(full),
    off = plan(hidden);
  assert.ok(off.heightNeeded < on.heightNeeded);
  assert.equal(off.size, on.size);
  const text = off.commands
    .filter((c) => c.kind === "text")
    .flatMap((c) => c.lines.map((line) => line.map((run) => run.text).join("")))
    .join(" ");
  for (const t of r.traits) assert.ok(!text.includes(t.description));
  const batch = await prepareGMPrint(PDFLib, [
    { s: full, r },
    { s: hidden, r },
  ]);
  assert.deepEqual(batch.overflow, []);
  assert.ok(batch.cards[0].contentHeight > batch.cards[1].contentHeight);
  assert.ok(
    (await PDFLib.PDFDocument.load(await batch.bytes())).getPageCount(),
  );
});

test("template Talent choices have independent identities and replacement clears only the old template preferences", () => {
  const s = draft();
  const elite = data.templates.find((t) => t.name === "Elite");
  applyTemplate(s, elite.id);
  const talent = {
    key: "template-talent-0",
    name: "Hardy",
    ranks: 1,
    origin: "Template",
  };
  s.hiddenDescriptions = [descriptionKey("talent", talent, s), "trait:gm-fear"];
  assert.equal(showsDescription("talent", talent, s), false);
  assert.equal(
    showsDescription("talent", { ...talent, name: "Very Strong" }, s),
    true,
  );
  applyTemplate(s, data.templates.find((t) => t.name === "Soldier").id);
  assert.deepEqual(s.hiddenDescriptions, ["trait:gm-fear"]);
  assert.equal(showsDescription("talent", talent, s), true);
});

test("printed and training-derived abilities expose the same presentation preference", () => {
  const s = draft("Griffon"),
    r = calculateGM(data, R, s);
  const t = r.traits.find((t) => t.origin === "Printed");
  s.hiddenDescriptions = [descriptionKey("trait", t, s)];
  assert.equal(abilityPresentation("trait", t, s).description, "");
  const training = draft();
  training.traits.push({
    key: "gm-training",
    name: "Trained",
    value: "Guard",
    origin: "GM",
    ranks: 1,
  });
  const result = calculateGM(data, R, training);
  const territorial = result.traits.find((t) => t.origin === "Training");
  assert.ok(territorial);
  training.hiddenDescriptions = [
    descriptionKey("trait", territorial, training),
  ];
  assert.equal(
    abilityPresentation("trait", territorial, training).text,
    territorial.name,
  );
});
