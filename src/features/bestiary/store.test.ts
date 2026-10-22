import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BestiaryStore } from "./store";
import { freshGM, calculateGM } from "../../engine/gm/model.mjs";
import { rollGMAppearance } from "../../engine/gm/appearance.mjs";
import { descriptionKey } from "../../engine/gm/ability-presentation.mjs";

const memory = new Map<string, string>();
const storage: Storage = {
  get length() {
    return memory.size;
  },
  clear: () => memory.clear(),
  key: (index) => [...memory.keys()][index] ?? null,
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => {
    memory.set(key, String(value));
  },
  removeItem: (key) => {
    memory.delete(key);
  },
};
let restoreFetch: typeof fetch;
let storageDescriptor: PropertyDescriptor | undefined;
before(() => {
  restoreFetch = globalThis.fetch;
  storageDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  globalThis.fetch = async (input) =>
    new Response(
      await readFile(
        new URL(
          `../../../public/${String(input).replace(/^\//, "")}`,
          import.meta.url,
        ),
      ),
      { headers: { "content-type": "application/json" } },
    );
});
after(() => {
  globalThis.fetch = restoreFetch;
  if (storageDescriptor)
    Object.defineProperty(globalThis, "localStorage", storageDescriptor);
  else Reflect.deleteProperty(globalThis, "localStorage");
});
beforeEach(() => memory.clear());
async function human(verify = true) {
  const store = new BestiaryStore(verify);
  await store.initialize();
  const { data } = store.getSnapshot();
  assert.equal(store.getSnapshot().ready, true);
  store.replace(freshGM(data, "core:creatures:human"));
  return store;
}

test("loot persists independently of equipment; Undo keeps dice, and stale or repeated previews cannot be added", async () => {
  const store = await human(false);
  const before = store.getSnapshot();
  const preview = store.rollLoot({ location: "carried", count: 3 });
  assert.equal(store.getSnapshot().draft.loot.length, 0);
  assert.ok(store.getSnapshot().draft.rolls.length);
  store.addLoot(preview);
  assert.ok(store.getSnapshot().draft.loot.length);
  assert.throws(() => store.addLoot(preview), /changed/);
  const added = structuredClone(store.getSnapshot().draft.loot);
  const dice = structuredClone(store.getSnapshot().draft.rolls);
  assert.deepEqual(store.getSnapshot().result.attacks, before.result.attacks);
  assert.deepEqual(store.getSnapshot().result.ap, before.result.ap);
  assert.deepEqual(store.getSnapshot().draft.gear, []);
  store.travel("undo");
  assert.deepEqual(store.getSnapshot().draft.loot, []);
  assert.deepEqual(store.getSnapshot().draft.rolls, dice);
  store.travel("redo");
  assert.deepEqual(store.getSnapshot().draft.loot, added);
  const restored = new BestiaryStore(false);
  await restored.initialize();
  assert.deepEqual(restored.getSnapshot().draft.loot, added);
  assert.deepEqual(restored.getSnapshot().draft.rolls, dice);
  const stale = store.rollLoot({ location: "lair", count: 1 });
  store.edit((d) => {
    d.name = "Changed creature";
  });
  assert.throws(() => store.addLoot(stale), /changed/);
  const legacy = JSON.parse(storage.getItem(store.storageKey)!);
  delete legacy.loot;
  storage.setItem(store.storageKey, JSON.stringify(legacy));
  const old = new BestiaryStore(false);
  await old.initialize();
  assert.deepEqual(old.getSnapshot().draft.loot, []);
});

test("description preferences persist, undo/redo and restore old saves without changing calculated abilities", async () => {
  const store = await human(false);
  store.edit((d) => {
    d.talents.push({
      key: "gm-test-hardy",
      name: "Hardy",
      ranks: 1,
      origin: "GM",
    });
  });
  const before = store.getSnapshot();
  const key = descriptionKey("talent", before.result.talents[0], before.draft);
  store.edit((d) => {
    d.hiddenDescriptions = [key];
  });
  assert.deepEqual(store.getSnapshot().result, before.result);
  store.travel("undo");
  assert.deepEqual(store.getSnapshot().draft.hiddenDescriptions, []);
  store.travel("redo");
  assert.deepEqual(store.getSnapshot().draft.hiddenDescriptions, [key]);
  const restored = new BestiaryStore(false);
  await restored.initialize();
  assert.deepEqual(restored.getSnapshot().draft.hiddenDescriptions, [key]);
  const legacy = JSON.parse(storage.getItem(store.storageKey)!);
  delete legacy.hiddenDescriptions;
  storage.setItem(store.storageKey, JSON.stringify(legacy));
  const old = new BestiaryStore(false);
  await old.initialize();
  assert.equal(old.getSnapshot().error, "");
  assert.deepEqual(old.getSnapshot().draft.hiddenDescriptions, []);
});

test("Bestiary groups typing, keeps redo across navigation, and caches one consistent derived result", async () => {
  const store = await human();
  store.edit((d) => {
    d.name = "A";
  }, "name");
  store.edit((d) => {
    d.name = "Alrik";
  }, "name");
  store.breakGroup();
  const snapshot = store.getSnapshot();
  assert.equal(store.getSnapshot(), snapshot);
  assert.equal(snapshot.result.name, "Alrik");
  store.travel("undo");
  assert.equal(store.getSnapshot().draft.name, "");
  assert.equal(store.getSnapshot().canRedo, true);
  store.navigate(2);
  store.edit(() => {});
  assert.equal(store.getSnapshot().canRedo, true);
  store.travel("redo");
  assert.equal(store.getSnapshot().draft.name, "Alrik");
  assert.equal(store.getSnapshot().draft.step, 2);
  const current = store.getSnapshot();
  assert.deepEqual(
    current.result,
    calculateGM(current.data, current.rules, current.draft),
  );
});
test("Bestiary preserves dice occurrence records through undo and isolates replacement documents", async () => {
  const store = await human(),
    initial = store.getSnapshot();
  store.edit((d) => rollGMAppearance(initial.rules, d, initial.result.profile));
  const rolled = store.getSnapshot();
  assert.equal(rolled.draft.rolls.length, 3);
  assert.notEqual(rolled.draft.description, "");
  store.travel("undo");
  assert.equal(store.getSnapshot().draft.description, "");
  assert.deepEqual(store.getSnapshot().draft.rolls, rolled.draft.rolls);
  store.travel("redo");
  assert.equal(store.getSnapshot().draft.description, rolled.draft.description);
  assert.equal(store.getSnapshot().draft.rolls.length, 3);
  store.replace(freshGM(initial.data));
  assert.equal(store.getSnapshot().draft.rolls.length, 0);
  store.travel("undo");
  assert.deepEqual(store.getSnapshot().draft.rolls, rolled.draft.rolls);
});
test("Bestiary verification sessions never read or overwrite a personal draft; current saves restore independently", async () => {
  const personal = await human(false);
  personal.edit((d) => {
    d.name = "Personal guard";
  });
  const saved = storage.getItem(personal.storageKey);
  assert.ok(saved?.includes("Personal guard"));
  const preview = await human(true);
  preview.edit((d) => {
    d.name = "Isolated preview";
    d.stats.WS = 88;
  });
  assert.equal(storage.getItem(personal.storageKey), saved);
  assert.equal(personal.getSnapshot().draft.name, "Personal guard");
  const restored = new BestiaryStore(false);
  await restored.initialize();
  assert.equal(restored.getSnapshot().draft.name, "Personal guard");
  const imported = preview.validate(
    JSON.parse(JSON.stringify(preview.getSnapshot().draft)),
  );
  assert.equal(imported.schemaVersion, 2);
  assert.equal(imported.stats.WS, 88);
  const before = personal.getSnapshot().result.stats.WS;
  preview.travel("undo");
  assert.equal(personal.getSnapshot().result.stats.WS, before);
});
