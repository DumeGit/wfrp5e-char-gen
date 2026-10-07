import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library, soldier } from "./fixture.mjs";
import { loadBookBundle } from "../dist/book-bundle.mjs";
import {
  assembleBooks,
  bookSelection,
  catalogForCharacter,
} from "../dist/books.mjs";
import { buildSearchIndex } from "../dist/book-search.mjs";
import { characterResult } from "../dist/character-result.mjs";
import { loadRuleReferences } from "../dist/rule-references.mjs";

const bundle = JSON.parse(
  await readFile(
    new URL("../dist/data/book-library.json", import.meta.url),
    "utf8",
  ),
);
const loaded = await loadBookBundle(() => structuredClone(bundle));
const readBundle = (value) => loadBookBundle(() => value);
const referenceLibrary = JSON.parse(
  await readFile(
    new URL("../dist/data/rule-reference-library.json", import.meta.url),
    "utf8",
  ),
);
const thin = (value) => {
  const copy = structuredClone(value);
  for (const pack of copy.packs)
    if (pack.data.ruleReferences)
      pack.data.ruleReferences = pack.data.ruleReferences.map(
        ({ text, ...entry }) => ({ ...entry, textRef: true }),
      );
  return copy;
};
const hydrate = async (catalogue) => ({
  ...catalogue,
  ruleReferences: await loadRuleReferences(catalogue, () => referenceLibrary),
});

test("startup uses one request and preserves the fully validated source library", async () => {
  const requests = [];
  const result = await loadBookBundle((url) => {
    requests.push(url.pathname);
    return structuredClone(bundle);
  });
  assert.equal(requests.length, 1);
  assert.match(requests[0], /\/data\/book-library\.json$/);
  assert.deepEqual(result, thin(library));
  assert.ok(
    result.packs[0].data.ruleReferences.every(
      (x) => x.textRef === true && x.text === undefined,
    ),
  );
});

test("bundled core and combined books produce identical rules and hydrated search results", async () => {
  for (const selection of [
    [library.core],
    library.packs
      .filter((pack) => pack.manifest.kind !== "variant")
      .map((pack) => pack.manifest.id),
  ]) {
    const source = assembleBooks(library, selection);
    const runtime = await hydrate(assembleBooks(loaded, selection));
    assert.deepEqual(runtime, source);
    assert.deepEqual(buildSearchIndex(runtime), buildSearchIndex(source));
  }
});

test("bundle preserves explicit Career variants", async () => {
  for (const pack of library.packs.filter(
    (p) => p.manifest.kind === "variant",
  )) {
    assert.deepEqual(
      await hydrate(assembleBooks(loaded, [pack.manifest.id])),
      assembleBooks(library, [pack.manifest.id]),
    );
  }
});

test("saved character calculation and exact book-version validation remain intact", () => {
  const source = assembleBooks(library);
  const draft = { ...soldier(), books: bookSelection(source) };
  const restored = catalogForCharacter(loaded, draft);
  assert.deepEqual(
    characterResult(restored, draft),
    characterResult(source, draft),
  );
  draft.books.packs[0].version = "invalid-version";
  assert.throws(() => catalogForCharacter(loaded, draft), /version/i);
});

test("unsupported, incomplete and duplicate bundles fail before rendering", async () => {
  for (const value of [
    null,
    {},
    { ...bundle, format: "unknown" },
    { ...bundle, schemaVersion: 99 },
  ])
    await assert.rejects(readBundle(value), /format/);
  const duplicate = structuredClone(bundle);
  duplicate.packs.push(duplicate.packs[0]);
  await assert.rejects(readBundle(duplicate), /duplicate/);
  const missing = structuredClone(bundle);
  delete missing.packs[0].data.config;
  await assert.rejects(readBundle(missing), /declared files/);
  const extra = structuredClone(bundle);
  extra.packs[0].data.unrecognized = {};
  await assert.rejects(readBundle(extra), /declared files/);
  const noCore = structuredClone(bundle);
  noCore.packs[0].manifest.kind = "supplement";
  delete noCore.packs[0].manifest.files.config;
  delete noCore.packs[0].data.config;
  delete noCore.packs[0].manifest.files.source;
  delete noCore.packs[0].data.source;
  delete noCore.packs[0].manifest.files["career-rolls"];
  delete noCore.packs[0].data["career-rolls"];
  await assert.rejects(readBundle(noCore), /core book/);
});

test("bundle still rejects unreviewed manifests and broken dependency graphs", async () => {
  const unreviewed = structuredClone(bundle);
  unreviewed.packs.find(
    (p) => p.manifest.edition === 4,
  ).manifest.compatibility.reviewed = false;
  await assert.rejects(readBundle(unreviewed), /conversion review/);
  const missing = structuredClone(bundle);
  missing.packs[1].manifest.dependsOn = ["missing-book"];
  await assert.rejects(readBundle(missing), /unknown book/);
  const cycle = structuredClone(bundle);
  cycle.packs[0].manifest.dependsOn = [cycle.packs[1].manifest.id];
  cycle.packs[1].manifest.dependsOn = ["core"];
  await assert.rejects(readBundle(cycle), /dependency cycle/);
});

test("runtime assembly rejects invalid selected content from a damaged bundle", async () => {
  const damaged = structuredClone(bundle);
  damaged.packs[0].data.careers[0].page = 0;
  const runtime = await readBundle(damaged);
  assert.throws(() => assembleBooks(runtime), /printed page/);
});
