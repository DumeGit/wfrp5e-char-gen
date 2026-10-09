import test from "node:test";
import assert from "node:assert/strict";
import {
  createDraftHistory,
  restoreDraftSnapshot,
  mergeRollHistory,
} from "../dist/draft-history.mjs";
const snapshot = (draft = {}, document = "one") => ({
  draft: { step: 0, name: "", rolls: [], ...draft },
  document,
});

test("grouped typing is one edit; navigation and no-ops preserve redo", () => {
  const history = createDraftHistory(snapshot()),
    field = {};
  history.record(snapshot({ name: "A" }), { group: field });
  history.record(snapshot({ name: "Anna" }), { group: field });
  history.record(snapshot({ name: "Anna", step: 3 }));
  const undone = history.travel("undo");
  assert.equal(undone.draft.name, "");
  assert.equal(undone.draft.step, 3);
  assert.equal(history.canUndo, false);
  assert.equal(history.canRedo, true);
  history.record(snapshot({ step: 5 }));
  assert.equal(history.canRedo, true);
  assert.equal(history.travel("redo").draft.name, "Anna");
});

test("new edits branch history, bounded snapshots cannot mutate live values", () => {
  const history = createDraftHistory(snapshot(), { limit: 2 });
  for (const name of ["A", "B", "C"]) history.record(snapshot({ name }));
  assert.equal(history.travel("undo").draft.name, "B");
  const state = history.travel("undo");
  assert.equal(state.draft.name, "A");
  state.draft.name = "external mutation";
  assert.equal(history.canUndo, false);
  assert.equal(history.travel("redo").draft.name, "B");
  history.record(snapshot({ name: "D" }));
  assert.equal(history.canRedo, false);
});

test("undo/redo restores XP, money, choices and variants together", () => {
  const before = snapshot({
    books: ["core"],
    ledger: [],
    purchases: [],
    spells: ["one"],
  });
  const after = snapshot({
    books: ["core", "variant"],
    ledger: [{ cost: 100 }],
    purchases: [{ price: 12 }],
    spells: ["two"],
  });
  const history = createDraftHistory(before);
  history.record(after);
  assert.deepEqual(history.travel("undo"), { ...before, setupOpen: undefined });
  assert.deepEqual(history.travel("redo"), { ...after, setupOpen: undefined });
});

test("dice occurrences and first-roll counters survive repeated undo/redo", () => {
  const roll = { at: "same time", values: [5] };
  const history = createDraftHistory(snapshot({ charAttempts: 0 }), {
    restore: (target, current) =>
      restoreDraftSnapshot(target, current, { player: true }),
  });
  history.record(
    snapshot({ charAttempts: 1, charMode: "first", rolls: [roll] }),
  );
  history.record(
    snapshot({ charAttempts: 2, charMode: "reroll", rolls: [roll, roll] }),
  );
  const first = history.travel("undo");
  assert.equal(first.draft.charAttempts, 2);
  assert.equal(first.draft.charMode, "first");
  assert.equal(first.draft.rolls.length, 2);
  const empty = history.travel("undo");
  assert.equal(empty.draft.charAttempts, 2);
  assert.equal(empty.draft.rolls.length, 2);
  assert.equal(history.travel("redo").draft.rolls.length, 2);
  assert.equal(history.travel("redo").draft.rolls.length, 2);
  assert.deepEqual(mergeRollHistory([roll, roll], [roll]), [roll, roll]);
});

test("new/load replacements restore their own document and dice audit", () => {
  const previous = snapshot({ name: "Old", rolls: [{ values: [1] }] });
  const incoming = snapshot(
    { name: "Loaded", rolls: [{ values: [2] }] },
    "two",
  );
  const history = createDraftHistory(previous);
  history.record(incoming);
  assert.deepEqual(history.travel("undo"), previous);
  assert.deepEqual(history.travel("redo"), incoming);
});
