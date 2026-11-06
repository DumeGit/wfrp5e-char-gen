import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assembleGMOptions, gmCatalogue } from "../src/engine/gm/books.mjs";
import {
  freshGM,
  calculateGM,
  validateGMDraft,
} from "../src/engine/gm/model.mjs";
import { descriptionKey } from "../src/engine/gm/ability-presentation.mjs";
import { equipmentConditions } from "../src/engine/gm/equipment-conditions.mjs";
import { cardSections } from "../src/engine/gm/print.mjs";
import { sheetSections } from "../src/engine/gm/pdf.mjs";
import { statBlock } from "./bestiary-presentation.mjs";

const json = async (name) =>
  JSON.parse(await readFile(new URL(name, import.meta.url)));
const data = await json("../public/gm/data.json");
const R = assembleGMOptions(await json("../public/data/book-library.json"));
const book = "imperial-zoo";

test("Imperial Zoo profiles have a separate category and valid printed baselines", () => {
  const zoo = gmCatalogue(data, ["core", book]).profiles.filter(
    (p) => p.category === "The Imperial Zoo",
  );
  assert.ok(zoo.length > 40);
  assert.ok(!gmCatalogue(data).profiles.some((p) => p.source?.book === book));
  assert.ok(zoo.every((p) => p.source.book === book));
  for (const profile of zoo) {
    const s = freshGM(data, profile.id);
    const r = calculateGM(data, R, validateGMDraft(data, R, s));
    assert.deepEqual(r.issues, [], profile.name);
    assert.equal(r.wounds, profile.stats.W, profile.name);
  }
  const griffon = zoo.find((p) => p.name === "Griffon");
  assert.deepEqual(
    [griffon.source.page, griffon.stats.W, griffon.attacks[0].damage],
    [21, 76, 9],
  );
});

test("mutation descriptions and GM Notes and GM Info have independent output choices", () => {
  const s = freshGM(data, data.profiles.find((p) => p.name === "Human").id);
  s.notes = "The old notes.";
  s.dataVersion = "051f38d3891a3ddb";
  delete s.briefing;
  delete s.includeBriefing;
  const restored = validateGMDraft(data, R, s);
  assert.equal(restored.notes, s.notes);
  assert.equal(restored.briefing, "");
  assert.equal(restored.includeBriefing, false);
  assert.equal(restored.dataVersion, data.version);
  const mutation = data.mutations[0];
  restored.mutations.push(mutation.id);
  restored.briefing = "The new briefing.";
  const r = calculateGM(data, R, restored);
  assert.ok(statBlock(r, restored).includes(mutation.name));
  assert.equal(
    Object.fromEntries(sheetSections(r, restored)).Corruption[0],
    `${mutation.name}: ${mutation.text}`,
  );
  restored.hiddenDescriptions = [descriptionKey("mutation", mutation)];
  restored.includeBriefing = true;
  const card = Object.fromEntries(cardSections(r, restored));
  assert.equal(card.Corruption, mutation.name);
  assert.equal(card["GM Notes"], restored.briefing);
  assert.equal(card["GM Info"], undefined);
  assert.deepEqual(Object.fromEntries(sheetSections(r, restored)).Corruption, [
    mutation.name,
  ]);
  assert.ok(statBlock(r, restored).includes(restored.briefing));
  assert.ok(!statBlock(r, restored).includes(restored.notes));
  restored.includeNotes = true;
  const both = Object.fromEntries(cardSections(r, restored));
  assert.equal(both["GM Notes"], restored.briefing);
  assert.equal(both["GM Info"], restored.notes);
  assert.deepEqual(Object.fromEntries(sheetSections(r, restored))["GM Info"], [
    restored.notes,
  ]);
});

test("equipment help identifies explicit conditions and relevant weapon qualities", () => {
  const names = (entry) =>
    equipmentConditions(R, entry).map((condition) => condition.name);
  assert.deepEqual(names(R.weapons.find((w) => w.name === "Bolas")), [
    "Entangled",
    "Prone",
  ]);
  assert.deepEqual(names({ qualities: "Pummel, Damaging" }), ["Stunned"]);
  assert.deepEqual(names(R.market.find((item) => item.name === "Weirdroot")), [
    "Blinded",
    "Deafened",
  ]);
  assert.deepEqual(
    names({ text: "Prevents Ablaze and removes one Fatigued Condition." }),
    [],
  );
  assert.deepEqual(
    names({ text: "On a hit the target gains one Surprised Condition." }),
    ["Surprised"],
  );
});
