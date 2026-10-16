import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import {
  loadDescriptionCatalogue,
  checkDescriptions,
} from "../scripts/descriptions.mjs";
import {
  descriptionBinding,
  hydrateDescriptions,
} from "../dist/description-data.mjs";
import { loadBookLibrary, assembleBooks } from "../dist/books.mjs";
import {
  createMarijanCatalogue,
  entryDescription,
} from "../dist/marijan/catalogue.mjs";
import {
  freshMarijan,
  addEntry,
  validateMarijan,
  calculateMarijan,
} from "../dist/marijan/model.mjs";
import { buildSearchIndex } from "../dist/book-search.mjs";
import { describeTraits } from "../dist/gm/trait-descriptions.mjs";
import { publicGMData } from "../scripts/public-gm-data.mjs";

const read = async (url) => JSON.parse(await readFile(url, "utf8"));
const registry = await loadDescriptionCatalogue();
const library = await loadBookLibrary(read),
  R = assembleBooks(library);
const gm = await read(new URL("../dist/gm/data.json", import.meta.url));

test("all registered description fields have a canonical record and honest review status", async () => {
  const result = await checkDescriptions(registry);
  assert.ok(result.bindings > 2000);
  assert.equal(result.reviewed, result.records);
  assert.equal(registry.editorialComplete, true);
  const unreviewed = structuredClone(registry);
  Object.values(unreviewed.records)[0].status = "imported";
  await assert.rejects(checkDescriptions(unreviewed), /needs editorial review/);
  const changed = structuredClone(registry);
  Object.values(changed.bindings)[0].sourceHash = "changed";
  await assert.rejects(checkDescriptions(changed), /source changed/);
});

test("rewritten attack prose cannot change free or ranged attack classification", () => {
  const file = "gm/books/example.json";
  const raw = {
    profiles: [
      {
        id: "example:profile",
        attacks: [
          { name: "Spit", text: "30 yards; a Free Attack.", damage: 4 },
        ],
      },
    ],
  };
  const key = descriptionBinding(file, [
    "profiles",
    "example:profile",
    "attacks",
    "Spit||",
  ]);
  const result = hydrateDescriptions(
    raw,
    {
      bindings: { [key]: { id: "attack" } },
      records: { attack: { text: "Rewritten reminder.", status: "reviewed" } },
    },
    file,
  );
  assert.equal(result.profiles[0].attacks[0].ranged, true);
  assert.equal(result.profiles[0].attacks[0].free, true);
  assert.equal(result.profiles[0].attacks[0].damage, 4);
  assert.equal(raw.profiles[0].attacks[0].ranged, undefined);
});

test("published payloads exclude standalone Rules and unused full stat blocks", async () => {
  const references = await read(
    new URL("../dist/data/rule-reference-library.json", import.meta.url),
  );
  assert.ok(
    references.books.every((book) =>
      book.records.every((entry) => entry.category !== "rule"),
    ),
  );
  const startup = await read(
    new URL("../dist/data/book-library.json", import.meta.url),
  );
  assert.ok(
    startup.packs.every((pack) =>
      (pack.data.ruleReferences || []).every(
        (entry) => entry.category !== "rule",
      ),
    ),
  );
  assert.ok(gm.profiles.length > 49);
  assert.ok(
    gm.profiles.every(
      (profile) =>
        !profile.text &&
        Object.keys(profile.sections).every((key) => key === "Trappings"),
    ),
  );
  assert.ok(gm.templates.every((template) => !template.text));
  assert.deepEqual(
    publicGMData(gm),
    gm,
    "Compiling public data twice preserves conflict notices",
  );
});

test("canonical hydration is immutable and unknown sources cannot silently fall back", () => {
  const raw = [
    {
      id: "core:talents:example",
      name: "Example",
      page: 1,
      text: "Original",
      limit: 1,
    },
  ];
  const key = descriptionBinding("example", [raw[0].id]);
  const catalogue = {
    bindings: { [key]: { id: "known" } },
    records: { known: { text: "Approved summary", status: "reviewed" } },
  };
  const result = hydrateDescriptions(raw, catalogue, "example");
  assert.equal(result[0].text, "Approved summary");
  assert.equal(result[0].limit, 1);
  assert.equal(raw[0].text, "Original");
  assert.throws(
    () => hydrateDescriptions(raw, catalogue, "missing"),
    /Missing canonical/,
  );
});

test("search, creator and GM share exact canonical Trait and Skill definitions", () => {
  const rows = buildSearchIndex(R);
  const trait = gm.traits.find((x) => x.name === "Belligerent");
  const found = rows.find(
    (x) => x.kind === "trait" && x.name === trait.name,
  ).entry;
  assert.equal(found.descriptionId, trait.descriptionId);
  assert.equal(found.text, trait.text);
  const skill = R.skills.find((x) => x.name === "Climb");
  const reference = rows.find(
    (x) => x.kind === "skill" && x.name === "Climb",
  ).entry;
  assert.ok(skill.text.length > 50);
  assert.equal(reference.text, skill.text);
  assert.equal(reference.descriptionId, skill.descriptionId);
});

test("GM exports cannot select a competing printed blurb as their description", () => {
  const trait = gm.traits.find((x) => x.name === "Belligerent");
  const described = describeTraits(
    {
      traits: [{ ...trait, key: "a" }],
      sections: { Traits: "Belligerent: Different short wording." },
    },
    [{ ...trait, key: "a" }],
  )[0];
  assert.equal(described.description, trait.text);
  assert.equal(described.summary, trait.text);
});

test("Marijan resolves canonical wording after save/load while preserving explicit overrides", () => {
  const catalogue = createMarijanCatalogue(library, gm),
    s = freshMarijan();
  const row = catalogue.rows.find(
    (x) => x.collection === "talents" && x.name === "Strong Back",
  );
  addEntry(s, "talents", row);
  const entry = s.entries.talents[0];
  assert.equal(entry.text, "");
  assert.equal(entryDescription(catalogue, entry), row.text);
  assert.equal(
    entryDescription(catalogue, {
      ...entry,
      descriptionId: undefined,
      text: "Saved source snapshot",
    }),
    "Saved source snapshot",
  );
  const restored = validateMarijan(JSON.parse(JSON.stringify(s)));
  assert.equal(
    calculateMarijan(catalogue, restored).entries.talents[0].text,
    row.text,
  );
  const updated = {
    ...catalogue,
    descriptions: new Map(catalogue.descriptions),
  };
  updated.descriptions.set(entry.descriptionId, {
    ...row,
    text: "Revised canonical summary",
  });
  assert.equal(entryDescription(updated, entry), "Revised canonical summary");
  entry.text = "My explicit effect";
  entry.descriptionOverride = true;
  assert.equal(
    calculateMarijan(updated, validateMarijan(s)).entries.talents[0].text,
    entry.text,
  );
  assert.equal(row.text, catalogue.descriptions.get(entry.descriptionId).text);
});

test("original extraction and the editorial catalogue are outside public assets", async () => {
  await assert.rejects(
    access(new URL("../dist/data/books/index.json", import.meta.url)),
  );
  await assert.rejects(
    access(new URL("../dist/gm/sources/core.json", import.meta.url)),
  );
  const raw = await readFile(
    new URL("../content/sources/gm/books/core.json", import.meta.url),
    "utf8",
  );
  assert.ok(raw.includes("The creature loves to win a fight."));
  const trait = gm.traits.find((x) => x.name === "Belligerent");
  assert.ok(!trait.text.includes("loves to win"));
});
