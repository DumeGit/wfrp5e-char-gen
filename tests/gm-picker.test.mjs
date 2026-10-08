import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { searchPickerEntries } from "../dist/gm/views.mjs";

const { traits } = JSON.parse(
  await readFile(new URL("../dist/gm/data.json", import.meta.url), "utf8"),
);

test("partial Trained names precede description-only Trait matches", () => {
  for (const query of ["tr", "tra", "trai", "train", " TRAINED "]) {
    const results = searchPickerEntries(traits, query);
    const trainedIndex = results.findIndex((t) => t.name === "Trained");
    assert.ok(trainedIndex >= 0 && trainedIndex < 3);
    assert.ok(
      results
        .slice(0, trainedIndex)
        .every((t) =>
          t.name.toLowerCase().includes(query.toLowerCase().trim()),
        ),
    );
    if (query.trim().toLowerCase().startsWith("trai"))
      assert.equal(results[0].name, "Trained");
  }
});

test("name matches win without losing description/category matches or changing the catalogue", () => {
  const entries = [
    { name: "Belligerent", text: "A trained creature." },
    { name: "Untrained beast", category: "Animal" },
    { name: "Trained", text: "Training choices." },
    { name: "Trained (War)", text: "Military training." },
  ];
  const original = structuredClone(entries);
  assert.deepEqual(
    searchPickerEntries(entries, "trained").map((t) => t.name),
    ["Trained", "Trained (War)", "Untrained beast", "Belligerent"],
  );
  assert.deepEqual(
    searchPickerEntries(entries, "military").map((t) => t.name),
    ["Trained (War)"],
  );
  assert.deepEqual(
    searchPickerEntries(entries, "animal").map((t) => t.name),
    ["Untrained beast"],
  );
  assert.deepEqual(searchPickerEntries(entries, "absent"), []);
  assert.deepEqual(searchPickerEntries(entries, "  "), original);
  assert.deepEqual(entries, original);
});
