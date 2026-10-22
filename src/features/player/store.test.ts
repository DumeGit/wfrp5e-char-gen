import { test, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { readFile } from "node:fs/promises";
import { getPlayerStore, type PlayerStore } from "./store";
import { createPlayerStore } from "./controller.mjs";
import { assembleBooks, bookSelection } from "../../engine/books.mjs";
import { characterResult } from "../../engine/character-result.mjs";
import { soldier } from "../../../tests/fixture.mjs";

const STORAGE = "wfrp-fifth-character-ledger-v2",
  VERIFY = STORAGE + "-verification";
const memory = new Map<string, string>(),
  created: PlayerStore[] = [];
const library = JSON.parse(
  await readFile(
    new URL("../../../public/data/book-library.json", import.meta.url),
    "utf8",
  ),
);
const catalogue = assembleBooks(library);
const fixture = (name = "Store test soldier") => ({
  ...soldier(),
  name,
  version: 2,
  books: bookSelection(catalogue),
  step: 0,
  navigationVersion: 2,
  rollTables: {},
});
const originals = new Map<string, PropertyDescriptor | undefined>();
let originalFetch: typeof fetch;
before(() => {
  for (const key of [
    "localStorage",
    "window",
    "document",
    "location",
    "confirm",
  ])
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, String(value)),
    removeItem: (key: string) => memory.delete(key),
    clear: () => memory.clear(),
    key: (index: number) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  };
  const window = Object.assign(new EventTarget(), {
    scrollTo: () => {},
    scrollY: 0,
  });
  const document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
  };
  for (const [key, value] of Object.entries({
    localStorage: storage,
    window,
    document,
    location: { search: "?verify=1", origin: "https://ledger.test" },
    confirm: () => true,
  }))
    Object.defineProperty(globalThis, key, { configurable: true, value });
  originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    assert.equal(url, "/data/book-library.json");
    return new Response(JSON.stringify(library), {
      headers: { "Content-Type": "application/json" },
    });
  };
});
after(() => {
  globalThis.fetch = originalFetch;
  for (const [key, descriptor] of originals)
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
});
beforeEach(() => {
  memory.clear();
  memory.set(STORAGE, JSON.stringify(fixture("Personal soldier")));
  memory.set(VERIFY, JSON.stringify(fixture()));
  memory.set("wfrp-gm-v2-verification", "independent-gm");
  memory.set("wfrp-marijan-v1-verification", "independent-marijan");
});
afterEach(() => {
  for (const store of created.splice(0)) store.cancelPending();
});
async function freshStore() {
  const store = (await createPlayerStore(true)) as PlayerStore;
  created.push(store);
  return store;
}
function element(action: string, dataset: Record<string, string> = {}) {
  return {
    dataset: { action, ...dataset },
    disabled: false,
    closest(selector: string) {
      return selector === "[data-action]" ? this : null;
    },
  } as unknown as HTMLElement;
}
function travel(store: PlayerStore, direction: "undo" | "redo") {
  store.dispatch("click", {
    target: element(direction),
    preventDefault() {},
    stopPropagation() {},
  });
}
function input(
  store: PlayerStore,
  value: string,
  target: any = { dataset: { bind: "name" } },
) {
  target.value = value;
  store.dispatch("input", { target });
  return target;
}
async function flush() {
  await new Promise((resolve) => setImmediate(resolve));
}
function nodes(root: ReactNode): any[] {
  return Children.toArray(root).flatMap((child) =>
    isValidElement<any>(child)
      ? [
          child,
          ...nodes(
            (child as ReactElement<{ children?: ReactNode }>).props.children,
          ),
        ]
      : [],
  );
}
function assertTableNesting(root: ReactNode, parent = "root") {
  const allowedParents: Record<string, string[]> = {
    tr: ["thead", "tbody", "tfoot"],
    td: ["tr"],
    th: ["tr"],
    thead: ["table"],
    tbody: ["table"],
    tfoot: ["table"],
    caption: ["table"],
    colgroup: ["table"],
    col: ["colgroup"],
  };
  for (const child of Children.toArray(root)) {
    if (!isValidElement<any>(child)) continue;
    const tag = typeof child.type === "string" ? child.type : undefined;
    if (tag && allowedParents[tag])
      assert.ok(
        allowedParents[tag].includes(parent),
        `<${tag}> cannot be a child of <${parent}>`,
      );
    assertTableNesting(
      (child as ReactElement<{ children?: ReactNode }>).props.children,
      tag ?? parent,
    );
  }
}
function scoreIntent(store: PlayerStore, key: string) {
  const node = nodes(store.getSnapshot().node).find(
    (node) =>
      String(node.props.className || "")
        .split(" ")
        .includes("review-stat-button") && node.props["data-name"] === key,
  );
  assert.ok(node, key);
  return Number(Children.toArray(node.props.children).join(""));
}
function parity(store: PlayerStore) {
  const snapshot = store.getSnapshot();
  assert.deepEqual(
    snapshot.calculated,
    characterResult(snapshot.catalogue, snapshot.draft),
  );
  assert.deepEqual(JSON.parse(memory.get(VERIFY)!), snapshot.draft);
}

test("actual cached Player sessions isolate personal/verification drafts and other creators", async () => {
  const personal = await getPlayerStore(false),
    verification = await getPlayerStore(true);
  created.push(personal, verification);
  assert.equal(await getPlayerStore(true), verification);
  assert.notEqual(personal, verification);
  assert.equal(personal.getSnapshot().draft.name, "Personal soldier");
  assert.equal(verification.getSnapshot().draft.name, "Store test soldier");
  const beforePersonal = memory.get(STORAGE);
  input(verification, "Verification changed");
  assert.equal(memory.get(STORAGE), beforePersonal);
  assert.equal(personal.getSnapshot().draft.name, "Personal soldier");
  assert.equal(memory.get("wfrp-gm-v2-verification"), "independent-gm");
  assert.equal(
    memory.get("wfrp-marijan-v1-verification"),
    "independent-marijan",
  );
  parity(verification);
});
test("published Player draft/calculated snapshots remain immutable through typing and grouped undo", async () => {
  const store = await freshStore();
  const previous = store.getSnapshot(),
    before = structuredClone(previous.draft),
    calculated = structuredClone(previous.calculated);
  const field = input(store, "First");
  input(store, "Second", field);
  store.breakGroup();
  input(store, "Third");
  assert.deepEqual(previous.draft, before);
  assert.deepEqual(previous.calculated, calculated);
  assert.equal(store.getSnapshot().draft.name, "Third");
  travel(store, "undo");
  assert.equal(store.getSnapshot().draft.name, "Second");
  travel(store, "undo");
  assert.equal(store.getSnapshot().draft.name, "Store test soldier");
  travel(store, "redo");
  assert.equal(store.getSnapshot().draft.name, "Second");
  parity(store);
});
test("no-op edits, browsing and persistence retain Redo without creating character changes", async () => {
  const store = await freshStore();
  input(store, "An edit");
  store.breakGroup();
  travel(store, "undo");
  assert.equal(store.getSnapshot().history.canRedo, true);
  const before = structuredClone(store.getSnapshot().draft);
  input(store, before.name);
  await store.action(element("step", { step: "1" }));
  store.persist();
  assert.equal(store.getSnapshot().history.canRedo, true);
  const { step, ...values } = store.getSnapshot().draft;
  const { step: oldStep, ...oldValues } = before;
  assert.deepEqual(values, oldValues);
  assert.equal(step, 1);
  travel(store, "redo");
  assert.equal(store.getSnapshot().draft.name, "An edit");
  assert.equal(store.getSnapshot().draft.step, 1);
  parity(store);
});
test("real recorded Characteristic rolls/attempt counters survive undo and cannot regain first-roll eligibility", async () => {
  const store = await freshStore();
  await store.action(element("char-roll"));
  const first = store.getSnapshot();
  assert.equal(first.draft.charAttempts, 1);
  assert.equal(first.draft.rolls.length, 10);
  const log = structuredClone(first.draft.rolls);
  travel(store, "undo");
  assert.equal(store.getSnapshot().draft.charAttempts, 1);
  assert.deepEqual(store.getSnapshot().draft.rolls, log);
  travel(store, "redo");
  assert.deepEqual(store.getSnapshot().draft.rolls, log);
  await store.action(element("char-roll"));
  assert.equal(store.getSnapshot().draft.charAttempts, 2);
  assert.equal(store.getSnapshot().draft.charMode, "reroll");
  assert.equal(store.getSnapshot().draft.rolls.length, 20);
  parity(store);
});
test("Player purchase results and rendered score intent share canonical calculations through undo/redo", async () => {
  const store = await freshStore();
  const before = store.getSnapshot();
  await store.action(element("buy", { type: "char", name: "WS", amount: "5" }));
  const after = store.getSnapshot();
  assert.equal(
    after.calculated.derived.spent - before.calculated.derived.spent,
    125,
  );
  assert.equal(
    after.calculated.derived.stats.WS - before.calculated.derived.stats.WS,
    5,
  );
  assert.deepEqual(before.draft.ledger, []);
  await store.action(element("step", { step: "7" }));
  assert.equal(scoreIntent(store, "WS"), after.calculated.derived.stats.WS);
  parity(store);
  const reloaded = (await createPlayerStore(true)) as PlayerStore;
  created.push(reloaded);
  assert.deepEqual(reloaded.getSnapshot().calculated, after.calculated);
  assert.deepEqual(reloaded.getSnapshot().history, {
    canUndo: false,
    canRedo: false,
  });
  travel(store, "undo");
  assert.deepEqual(store.getSnapshot().calculated, before.calculated);
  travel(store, "redo");
  assert.deepEqual(store.getSnapshot().calculated, after.calculated);
  parity(store);
});
test("late file reads are cancelled after route departure, a newer import or intervening edit", async () => {
  for (const cancellation of [
    "departure",
    "newer-import",
    "new-character",
    "edit",
  ]) {
    const store = await freshStore();
    let finish!: (value: string) => void;
    const delayed = new Promise<string>((resolve) => {
      finish = resolve;
    });
    const incoming = fixture("Stale delayed import");
    store.dispatch("change", {
      target: {
        id: "import-file",
        dataset: {},
        files: [{ size: 100, text: () => delayed }],
      },
    });
    if (cancellation === "departure") store.cancelPending();
    else if (cancellation === "newer-import") {
      store.dispatch("change", {
        target: {
          id: "import-file",
          dataset: {},
          files: [
            {
              size: 100,
              text: async () => JSON.stringify(fixture("Newest import")),
            },
          ],
        },
      });
      await flush();
    } else if (cancellation === "new-character")
      await store.action(element("new"));
    else input(store, "Edit while file is reading");
    const before = structuredClone(store.getSnapshot().draft);
    finish(JSON.stringify(incoming));
    await flush();
    assert.deepEqual(store.getSnapshot().draft, before, cancellation);
    assert.notEqual(store.getSnapshot().draft.name, incoming.name);
    parity(store);
  }
});

test("Player tables retain valid React ancestry across creation methods, Career changes and XP history", async () => {
  for (const career of ["", "soldier"]) {
    for (const charMode of ["points", "first", "rearrange", "reroll"]) {
      const draft = {
        ...fixture(),
        career,
        charMode,
        charRolls: Array(10).fill(10),
      };
      memory.set(VERIFY, JSON.stringify(draft));
      const store = await freshStore();
      for (let step = 0; step < 8; step++) {
        await store.action(element("step", { step: String(step) }));
        assertTableNesting(store.getSnapshot().node);
        if (step === 2 && charMode !== "points")
          assert.equal(
            nodes(store.getSnapshot().node).filter(
              (node) => node.type === "tbody",
            ).length,
            1,
          );
      }
    }
  }
  memory.set(VERIFY, JSON.stringify(fixture()));
  const store = await freshStore();
  store.dispatch("change", {
    target: { dataset: { bind: "career" }, value: "guard", checked: false },
  });
  await flush();
  const comparison = store.getSnapshot().modal;
  assert.ok(comparison, "Career changes open the comparison dialog");
  assert.ok(nodes(comparison.body).some((node) => node.type === "tr"));
  assertTableNesting(comparison.body);
  store.closeDialog();
  await store.action(element("buy", { type: "char", name: "WS", amount: "5" }));
  for (const step of [6, 7]) {
    await store.action(element("step", { step: String(step) }));
    const snapshot = store.getSnapshot();
    assert.equal(snapshot.draft.ledger.length, 1);
    assert.ok(nodes(snapshot.node).some((node) => node.type === "tbody"));
    assertTableNesting(snapshot.node);
  }
});
