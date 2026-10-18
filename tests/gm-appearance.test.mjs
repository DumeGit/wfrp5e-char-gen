import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assembleGMOptions } from "../src/engine/gm/books.mjs";
import { freshGM, validateGMDraft } from "../src/engine/gm/model.mjs";
import { appearanceSpecies, rollGMAppearance } from "../src/engine/gm/appearance.mjs";

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
    assert.equal(s.rolls.length, 3);
    const [height, eyes, hair] = s.rolls;
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
      `${Math.floor(inches / 12)} ft ${inches % 12} in; ${lookup("eyes", eyes).toLowerCase()} eyes; ${lookup("hair", hair).toLowerCase()} hair.`,
    );
    for (const record of s.rolls) {
      assert.equal(
        record.total,
        record.faces.reduce((sum, face) => sum + face, 0),
      );
      assert.ok(record.source.book);
      assert.equal(record.source.page, record.page);
    }
    assert.deepEqual(
      { ...s, description: before.description, rolls: before.rolls },
      before,
    );
    assert.doesNotMatch(s.description, /weight|beard|scar|male|female/i);
  }
});

test("rerolls replace the description and retain a valid editable save with recorded history", () => {
  const s = freshGM(data, "core:creatures:human"),
    p = profile(s.profile);
  s.description = "Previous manual description with a scar.";
  rollGMAppearance(R, s, p);
  rollGMAppearance(R, s, p);
  assert.equal(s.rolls.length, 6);
  assert.equal((s.description.match(/ft /g) || []).length, 1);
  assert.doesNotMatch(s.description, /Previous|scar/);
  assert.deepEqual(validateGMDraft(data, R, structuredClone(s)), s);
});
