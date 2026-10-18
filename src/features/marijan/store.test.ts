import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createMarijanStore } from "./store";
import {
  addEntry,
  freshMarijan,
  rollCharacteristics,
} from "../../engine/marijan/model.mjs";

test("Marijan session stores preserve current saves, derived totals, independent history and roll audits", async () => {
  const data = new Map<string, string>();
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    },
  });
  globalThis.fetch = (async (input: any) => {
    const path = new URL(String(input), "http://localhost").pathname.replace(
      /^\//,
      "",
    );
    return new Response(await readFile(resolve("public", path)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  try {
    const personal = createMarijanStore(false),
      verification = createMarijanStore(true);
    await Promise.all([personal.initialize(), verification.initialize()]);
    assert.equal(personal.getSnapshot().status, "ready");
    assert.equal(verification.getSnapshot().status, "ready");
    const first = verification.getSnapshot();
    verification.edit((draft) => {
      draft.name = "First";
    }, "name");
    verification.edit((draft) => {
      draft.name = "First draft";
    }, "name");
    assert.equal(first.draft.name, "", "published snapshots remain immutable");
    verification.breakGroup();
    verification.edit((draft) => {
      draft.characteristics.S.initial = 45;
    });
    const climb = verification
      .getSnapshot()
      .catalogue.rows.find(
        (row: any) => row.collection === "skills" && row.name === "Climb",
      );
    verification.edit((draft) => addEntry(draft, "skills", climb));
    verification.edit((draft) => {
      draft.entries.skills[0].amount = 3;
    });
    assert.equal(verification.getSnapshot().result.skills[0].total, 48);
    verification.travel("undo");
    assert.equal(verification.getSnapshot().result.skills[0].total, 45);
    assert.equal(verification.getSnapshot().canRedo, true);
    const revision = verification.getSnapshot().revision;
    verification.edit((draft) => {
      draft.name = "First draft";
    });
    assert.equal(verification.getSnapshot().revision, revision);
    assert.equal(
      verification.getSnapshot().canRedo,
      true,
      "no-ops preserve redo",
    );
    verification.travel("redo");
    verification.edit((draft) => {
      draft.overrides.wounds = 77;
    });
    verification.edit((draft) => {
      draft.characteristics.T.initial = 60;
    });
    assert.equal(verification.getSnapshot().result.values.wounds, 77);
    assert.equal(
      personal.getSnapshot().draft.name,
      "",
      "personal draft is separate",
    );
    assert.equal(personal.getSnapshot().canUndo, false);
    verification.edit((draft) =>
      rollCharacteristics(draft, verification.getSnapshot().catalogue),
    );
    const recorded = verification.getSnapshot().draft.rolls.length;
    assert.equal(recorded, 10);
    verification.travel("undo");
    assert.equal(
      verification.getSnapshot().draft.rolls.length,
      recorded,
      "undo never erases dice occurrences",
    );
    verification.save();
    assert.equal(
      JSON.parse(data.get("wfrp-marijan-v1-verification-saves")!)[0].draft.name,
      "First draft",
    );
    assert.equal(
      data.has("wfrp-marijan-v1"),
      false,
      "verification never writes personal storage",
    );
    const reloaded = createMarijanStore(true);
    await reloaded.initialize();
    assert.equal(reloaded.getSnapshot().draft.overrides.wounds, 77);
    assert.equal(reloaded.getSnapshot().draft.rolls.length, 10);
    assert.equal(
      reloaded.getSnapshot().canUndo,
      false,
      "history resets on fresh application session",
    );
    verification.replace(freshMarijan());
    assert.equal(
      verification.getSnapshot().draft.rolls.length,
      0,
      "replacement documents have independent audits",
    );
    verification.travel("undo");
    assert.equal(verification.getSnapshot().draft.rolls.length, 10);
    verification.travel("undo");
    assert.equal(verification.getSnapshot().draft.rolls.length, 10);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage)
      Object.defineProperty(globalThis, "localStorage", originalStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
