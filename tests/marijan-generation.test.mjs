import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMarijanCatalogue } from "../dist/marijan/catalogue.mjs";
import {
  freshMarijan,
  validateMarijan,
  calculateMarijan,
} from "../dist/marijan/model.mjs";
import {
  generateCharacter,
  rollStartingChoices,
  addStartingChoices,
  availableGenerationCareers,
} from "../dist/marijan/generation.mjs";
const c = createMarijanCatalogue(
  JSON.parse(readFileSync("dist/data/book-library.json")),
  JSON.parse(readFileSync("dist/gm/data.json")),
);
function seeded(seed = 1234567) {
  return {
    getRandomValues(a) {
      for (let i = 0; i < a.length; i++) {
        seed ^= seed << 13;
        seed ^= seed >>> 17;
        seed ^= seed << 5;
        a[i] = seed >>> 0;
      }
      return a;
    },
  };
}
const soldier = () => ({
  ...freshMarijan(),
  name: "Generated hero",
  career: "core:careers:soldier",
});
test("5e starter grants five +5 Species Skills, 30 native language points and eight +5 Career Advances", () => {
  const original = soldier(),
    before = JSON.stringify(original),
    s = validateMarijan(generateCharacter(c, original, 1, seeded()));
  assert.equal(JSON.stringify(original), before);
  assert.equal(s.name, original.name);
  assert.equal(s.level, 1);
  assert.equal(s.xpSpent, 0);
  assert.equal(s.tracker, 0);
  assert.equal(
    s.entries.skills.reduce((n, x) => n + x.amount, 0),
    25 + 30 + 40,
  );
  assert(
    s.entries.skills
      .filter((x) => x.name !== "Language (Reikspiel)")
      .every((x) => x.amount <= 15),
  );
  assert.equal(
    s.entries.skills.find((x) => x.name === "Language (Reikspiel)").amount,
    30,
  );
  assert.equal(
    s.entries.talents.reduce((n, x) => n + x.amount, 0),
    6,
  );
  assert(s.entries.gear.some((x) => x.name === "Dagger"));
  assert(s.entries.gear.some((x) => x.name === "Hand Weapon"));
  assert(s.entries.gear.some((x) => x.name === "Leather Breastplate"));
  assert(s.entries.gear.some((x) => x.name === "Uniform"));
  const rolls = s.rolls.filter((x) => x.label.endsWith("starting roll"));
  assert.equal(rolls.length, 10);
  assert.equal(
    Object.values(s.characteristics).reduce((n, x) => n + x.initial, 0),
    200 + rolls.reduce((n, x) => n + x.faces.reduce((a, b) => a + b, 0), 0) + 6,
  );
  assert.equal(
    s.rolls.filter((x) => x.label.startsWith("Starting Career Skill Advance"))
      .length,
    8,
  );
  assert(s.rolls.every((x) => x.faces.every((n) => n >= 1 && n <= x.sides)));
  assert(s.entries.skills.every((x) => x.total === null));
});
test("higher levels use 10/12/14 tracker boxes and the recorded core XP purchases", () => {
  for (const [target, boxes] of [
    [2, 10],
    [3, 22],
    [4, 36],
  ]) {
    const s = validateMarijan(
      generateCharacter(c, soldier(), target, seeded(target * 192)),
    );
    assert.equal(s.level, target);
    assert.equal(s.tracker, boxes);
    const ledger = s.generation.purchases;
    assert.equal(
      ledger.filter((x) => x.type === "promotion").length,
      target - 1,
    );
    assert.equal(ledger.filter((x) => x.type !== "promotion").length, boxes);
    assert(
      ledger.filter((x) => x.type === "promotion").every((x) => x.cost === 100),
    );
    assert(
      ledger.filter((x) => x.type === "talent").every((x) => x.cost === 100),
    );
    assert.equal(
      s.xpSpent,
      ledger.reduce((n, x) => n + x.cost, 0),
    );
    assert.equal(s.xpUnspent, 0);
    assert(s.generation.notes.some((x) => x.includes("Random allocation")));
    assert(
      s.entries.talents
        .filter((x) => x.name === "Warrior Born")
        .every((x) => x.amount === 1),
    );
    assert.equal(
      calculateMarijan(c, s).stats.S,
      s.characteristics.S.initial +
        s.characteristics.S.advances +
        (s.entries.talents.some((x) => x.name === "Very Strong") ? 5 : 0),
    );
  }
});
test("starting additions retain custom entries and do not stack duplicate grants", () => {
  const s = soldier();
  s.entries.skills.push({ name: "My own Skill", amount: 42 });
  const rolled = rollStartingChoices(c, s, "skills", seeded(12));
  addStartingChoices(c, s, rolled);
  const before = structuredClone(s.entries.skills);
  addStartingChoices(c, s, rolled);
  assert.deepEqual(s.entries.skills, before);
  assert.equal(s.entries.skills[0].amount, 42);
  const t = rollStartingChoices(c, s, "talents", seeded(10));
  addStartingChoices(c, s, t);
  const talents = structuredClone(s.entries.talents);
  addStartingChoices(c, s, t);
  assert.deepEqual(s.entries.talents, talents);
});
test("all supported Species use existing Fifth Edition profiles including approved Legacy resources", () => {
  for (const species of Object.keys(c.species)) {
    const s = { ...freshMarijan(), species };
    s.career = availableGenerationCareers(c, s)[0].contentId;
    const next = validateMarijan(
      generateCharacter(c, s, 1, seeded(species.length * 7919)),
    );
    assert.equal(next.species, species);
    assert.equal(next.fate, c.species[species].fate);
    assert.equal(next.size, c.species[species].mechanics?.size || "Average");
    assert.equal(
      next.entries.skills.reduce((n, x) => n + x.amount, 0),
      25 + 40 + c.species[species].languages.length * 30,
    );
  }
});
test("auto-generation enforces known legal profiles without restricting the freehand draft", () => {
  const s = soldier();
  s.species = "Dwarf";
  s.career = "core:careers:wizard";
  assert.throws(() => generateCharacter(c, s), /not available/);
  s.career = "My Career";
  assert.throws(() => generateCharacter(c, s), /Custom Career/);
  assert.equal(validateMarijan(s).career, "My Career");
  s.species = "My Species";
  assert.throws(() => rollStartingChoices(c, s, "skills"), /Custom Species/);
});
