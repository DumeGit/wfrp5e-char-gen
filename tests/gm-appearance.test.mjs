import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assembleGMOptions } from "../src/engine/gm/books.mjs";
import {
  freshGM,
  validateGMDraft,
  calculateGM,
} from "../src/engine/gm/model.mjs";
import {
  appearanceSpecies,
  rollGMAppearance,
} from "../src/engine/gm/appearance.mjs";
import {
  DISTINGUISHING_FEATURES,
  FEATURE_SOURCE,
} from "../src/engine/gm/distinguishing-features.mjs";
import { cardSections } from "../src/engine/gm/print.mjs";
import { statBlock } from "./bestiary-presentation.mjs";

const R = assembleGMOptions(
    JSON.parse(
      await readFile(
        new URL("../public/data/book-library.json", import.meta.url),
      ),
    ),
  ),
  data = JSON.parse(
    await readFile(new URL("../public/gm/data.json", import.meta.url)),
  );
const profile = (id) => data.profiles.find((p) => p.id === id);

test("appearance resolves exact Species identities without inventing creature equivalents", () => {
  assert.deepEqual(
    appearanceSpecies(R, profile("core:creatures:human-watchman")),
    ["Human"],
  );
  assert.deepEqual(
    appearanceSpecies(R, profile("core:creatures:high-elf-or-wood-elf")),
    ["High Elf", "Wood Elf"],
  );
  assert.deepEqual(
    appearanceSpecies(R, profile("taverns-old-world:creatures:chef")),
    ["Human"],
  );
  for (const id of [
    "core:creatures:rat-ogre",
    "core:creatures:dragon",
    "corsairs-flariel:creatures:dark-elf",
  ])
    assert.deepEqual(appearanceSpecies(R, profile(id)), []);
  const s = freshGM(data, "core:creatures:high-elf-or-wood-elf");
  assert.throws(() => rollGMAppearance(R, s, profile(s.profile)), /Choose/);
  assert.equal(s.rolls.length, 0);
});

test("all supported PC appearance rolls retain printed formulas/lists, faces and sources", () => {
  for (const [id, species] of [
    ["core:creatures:human", "Human"],
    ["core:creatures:dwarf", "Dwarf"],
    ["core:creatures:halfling", "Halfling"],
    ["core:creatures:high-elf-or-wood-elf", "High Elf"],
    ["core:creatures:high-elf-or-wood-elf", "Wood Elf"],
    ["core:creatures:ogre", "Ogre"],
    ["core:creatures:gnome", "Gnome"],
  ]) {
    const p = profile(id),
      s = freshGM(data, id),
      before = structuredClone(s);
    rollGMAppearance(R, s, p, species);
    assert.equal(s.rolls.length, 4);
    const [height, eyes, hair, feature] = s.rolls;
    assert.equal(height.count, R.species[species].height[1]);
    assert.equal(height.sides, 10);
    assert.deepEqual(height.source, {
      ...R.species[species].source,
      page: R.species[species].appearancePage || R.species[species].page,
    });
    const inches = R.species[species].height[0] + height.total;
    const lookup = (kind, record) => {
      const b = R.background[species],
        table = b.rollTables?.[kind];
      return table
        ? table.rows.find(
            (row) => record.total >= row.min && record.total <= row.max,
          ).result
        : b[kind][record.total - 1];
    };
    assert.equal(
      s.description,
      `${Math.floor(inches / 12)} ft ${inches % 12} in; ${lookup("eyes", eyes).toLowerCase()} eyes; ${lookup("hair", hair).toLowerCase()} hair. ${DISTINGUISHING_FEATURES[feature.total - 1]}`,
    );
    for (const record of s.rolls) {
      assert.equal(
        record.total,
        record.faces.reduce((sum, face) => sum + face, 0),
      );
      if (record === feature) {
        assert.deepEqual(record.source, FEATURE_SOURCE);
        assert.equal(record.sides, 100);
        assert.equal(record.count, 1);
        assert.equal(record.source.book, undefined);
      } else {
        assert.ok(record.source.book);
        assert.equal(record.source.page, record.page);
      }
    }
    assert.deepEqual(
      { ...s, description: before.description, rolls: before.rolls },
      before,
    );
  }
});

test("rerolls replace the description and retain a valid editable save with recorded history", () => {
  const s = freshGM(data, "core:creatures:human"),
    p = profile(s.profile);
  s.description = "Previous manual description with a scar.";
  rollGMAppearance(R, s, p);
  rollGMAppearance(R, s, p);
  assert.equal(s.rolls.length, 8);
  assert.equal((s.description.match(/ft /g) || []).length, 1);
  assert.doesNotMatch(s.description, /Previous manual/);
  assert.deepEqual(validateGMDraft(data, R, structuredClone(s)), s);
});

test("the short plain-English d100 table is unfiltered even for creatures without body parts", (t) => {
  assert.equal(DISTINGUISHING_FEATURES.length, 100);
  assert.equal(new Set(DISTINGUISHING_FEATURES).size, 100);
  for (const text of DISTINGUISHING_FEATURES) {
    assert.ok(text.split(" ").length <= 8, text);
    assert.ok(text.length <= 45, text);
    assert.match(text, /^[A-Z][A-Za-z ,.'-]+\.$/);
  }
  let face = 1;
  t.mock.method(globalThis.crypto, "getRandomValues", (array) => {
    array[0] = face - 1;
    return array;
  });
  const p = data.profiles.find((p) => p.name === "Blood Hungry Spore Cloud");
  for (face = 1; face <= 100; face++) {
    const s = freshGM(data, p.id, ["core", p.source.book]);
    const before = structuredClone(s);
    rollGMAppearance(R, s, p);
    assert.equal(s.description, DISTINGUISHING_FEATURES[face - 1]);
    assert.equal(s.rolls.length, 1);
    assert.deepEqual(s.rolls[0].faces, [face]);
    assert.deepEqual(s.rolls[0].source, FEATURE_SOURCE);
    assert.deepEqual(
      { ...s, description: before.description, rolls: before.rolls },
      before,
    );
    validateGMDraft(data, R, s);
  }
});

test("every profile can roll a feature without borrowed appearance tables or mechanical effects", () => {
  for (const p of data.profiles) {
    const books = [...new Set(["core", p.source?.book || p.id.split(":")[0]])];
    const s = freshGM(data, p.id, books),
      choices = appearanceSpecies(R, p);
    const before = calculateGM(data, R, s);
    rollGMAppearance(R, s, p, choices[0]);
    const feature = s.rolls.at(-1);
    assert.ok(
      s.description.endsWith(DISTINGUISHING_FEATURES[feature.total - 1]),
      p.name,
    );
    assert.equal(s.rolls.length, choices.length ? 4 : 1, p.name);
    const after = calculateGM(data, R, s);
    for (const key of [
      "stats",
      "wounds",
      "tb",
      "ap",
      "attacks",
      "skills",
      "talents",
      "traits",
      "gear",
      "loot",
    ])
      assert.deepEqual(after[key], before[key], `${p.name}: ${key}`);
    assert.ok(statBlock(after, s).includes(s.description));
    assert.equal(
      Object.fromEntries(cardSections(after, s)).Desc,
      s.description,
    );
    validateGMDraft(data, R, s);
  }
});
