import test from "node:test";
import assert from "node:assert/strict";
import {
  steps,
  creationStepCount,
  issueStep,
  restoreNavigation,
  hasCharacterChanges,
} from "../dist/ui.mjs";
import { soldier, R } from "./fixture.mjs";
import { characterResult } from "../dist/character-result.mjs";
import { fresh } from "../dist/rules.mjs";

test("book changes skip reset confirmation only for an untouched character", () => {
  const empty = restoreNavigation(fresh());
  assert.equal(hasCharacterChanges({ ...empty, step: 7 }, empty), false);
  for (const changes of [
    { name: "Custom name" },
    { species: "Ogre" },
    { xp: 1025 },
    { notes: "GM decision" },
    { chart: { enabled: false } },
    { rolls: [{ total: 1 }] },
    { purchases: [{ id: "item" }] },
  ])
    assert.equal(hasCharacterChanges({ ...empty, ...changes }, empty), true);
});

test("old saved Experience and Review locations migrate once without changing character choices", () => {
  for (const [before, after] of [
    [4, 4],
    [5, 6],
    [6, 7],
  ]) {
    const original = { ...soldier(), step: before };
    const migrated = restoreNavigation(original);
    assert.equal(migrated.step, after);
    assert.equal(migrated.navigationVersion, 2);
    assert.deepEqual(
      { ...migrated, step: before, navigationVersion: undefined },
      { ...original, navigationVersion: undefined },
    );
    assert.deepEqual(restoreNavigation(migrated), migrated);
  }
  assert.equal(restoreNavigation({ step: 5, navigationVersion: 2 }).step, 5);
});

test("unfinished abilities and belongings route by code rather than wording", () => {
  assert.equal(steps.length, 8);
  assert.equal(creationStepCount, 6);
  const s = soldier();
  s.freeTalent = "";
  s.randomTalents = [];
  s.wealth = null;
  s.careerMode = "first";
  const records = characterResult(R, s).issues;
  for (const [code, step] of [
    ["talents.random", "Talents"],
    ["talents.career", "Talents"],
    ["gear.wealth", "Gear & money"],
    ["gear.bonus", "Career"],
  ]) {
    const record = records.find((x) => x.code === code);
    assert.ok(record, code);
    assert.equal(steps[issueStep(record)], step);
    assert.equal(
      issueStep({
        ...record,
        message: "Completely different translated text.",
      }),
      issueStep(record),
    );
  }
  assert.throws(() => issueStep("Roll starting wealth."), /structured/);
});
