import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  freshGM,
  calculateGM,
  applyTemplate,
  validateGMDraft,
  magicChoices,
} from "../dist/gm/model.mjs";
import { createGMRules, gmCatalogue } from "../dist/gm/books.mjs";
import { templateEligibility } from "../dist/gm/templates.mjs";
import { addGMSupplement } from "../dist/gm/content.mjs";
import { cardSections } from "../dist/gm/print.mjs";
const json = async (p) =>
  JSON.parse(await readFile(new URL(p, import.meta.url), "utf8"));
const data = await json("../dist/gm/data.json");
const library = await json("../dist/data/book-library.json");
const rulesFor = createGMRules(library, data);
const raw = await json("../dist/gm/sources/bayl-many-eyes.json");
const draft = (name = "Chaos Warrior of Nurgle", template = "") => {
  const p = data.profiles.find((p) => p.name === name);
  const s = freshGM(data, p.id, ["core", "bayl-many-eyes"]);
  if (template)
    applyTemplate(s, data.templates.find((t) => t.name === template).id);
  return s;
};
const result = (s) => calculateGM(data, rulesFor(s), s);
const complete = (s) => {
  const t = data.templates.find((t) => t.id === s.template);
  for (const [i, slot] of t.skills.entries())
    if (slot.options.length > 1 && !slot.optional)
      s.templateSkills[i] = slot.options.slice(0, slot.count);
  for (const [i, slot] of t.gear.entries())
    if (slot.choose || slot.options.length > 1)
      s.templateGear[i] = slot.options[0].id;
  return s;
};
test("Bayl books gate generic profiles/templates only, and named members never appear", () => {
  const off = gmCatalogue(data),
    on = gmCatalogue(data, ["core", "bayl-many-eyes"]);
  assert.equal(on.profiles.length - off.profiles.length, raw.profiles.length);
  assert.equal(
    on.templates.length - off.templates.length,
    raw.templates.length,
  );
  for (const named of [
    "Bayl of Many Eyes",
    "Dónalegur",
    "Ryðklumpur",
    "Tannpína",
  ])
    assert.ok(!data.profiles.some((p) => p.name.includes(named)));
  assert.equal(
    data.books.find((b) => b.id === "bayl-many-eyes").source.sha256,
    raw.source.sha256,
  );
});
test("Nurgle profile retains printed scores, includes Mark benefits exactly once and prints actual Traits", () => {
  const s = draft(),
    r = result(s);
  assert.equal(r.stats.T, 55);
  assert.equal(r.wounds, 19);
  assert.equal(r.stats.WS, 55);
  assert.equal(r.attacks[0].skill, 55);
  assert.equal(r.attacks[0].damage, 8);
  assert.equal(
    r.talents.filter((t) => t.name === "Etiquette (Followers of Nurgle)")
      .length,
    1,
  );
  assert.ok(
    r.traits.some((t) => t.name === "Mark of Chaos" && t.value === "Nurgle"),
  );
  assert.equal(r.armour[0].ap, 5);
  assert.ok(r.traits.find((t) => t.name === "Distracting").adaptation);
  assert.ok(r.traits.find((t) => t.name === "Animosity").adaptation);
  assert.ok(!r.traits.find((t) => t.name === "Champion").adaptation);
  assert.deepEqual(r.issues, []);
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
  const print = JSON.stringify(cardSections(r, s));
  assert.match(print, /Itching Pox/);
  assert.match(print, /Distracting/);
  assert.ok(!print.includes("Optional Traits"));
  const mark = r.traits.find((t) => t.name === "Mark of Chaos");
  assert.match(mark.description, /Toughness/);
  assert.ok(!mark.description.includes("Khorne:"));
  assert.ok(!mark.description.includes("Slaanesh:"));
});
test("Chosen applies reviewed columns, two distinct Melee choices and concrete armour/weapons", () => {
  const s = draft("Chaos Warrior of Nurgle", "Chosen");
  assert.ok(result(s).issues.some((i) => i.code === "template.skill"));
  complete(s);
  const r = result(s);
  assert.equal(r.stats.WS, 65);
  assert.equal(r.stats.S, 50);
  assert.equal(r.stats.T, 60);
  assert.equal(r.stats.I, 55);
  assert.equal(r.wounds, 22);
  assert.equal(r.armour.find((a) => a.name === "Heavy Armour").ap, 5);
  assert.deepEqual(r.issues, []);
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
  s.templateSkills[3] = [s.templateSkills[3][0], s.templateSkills[3][0]];
  assert.ok(result(s).issues.some((i) => i.code === "template.skill"));
  applyTemplate(s, "");
  const reset = result(s);
  assert.equal(reset.stats.WS, 55);
  assert.equal(reset.wounds, 19);
  assert.equal(reset.gear.length, 0);
});
test("mounted Hero grant is optional, source-owned and cleared on template removal", () => {
  const s = complete(draft("Chaos Warrior of Nurgle", "Exalted Hero"));
  const t = data.templates.find((t) => t.id === s.template),
    i = t.skills.findIndex((slot) => slot.optional);
  assert.equal(result(s).stats.WS, 80);
  assert.equal(result(s).stats.Dex, 30);
  assert.ok(!result(s).skills.some((x) => x.name.startsWith("Ride (")));
  assert.deepEqual(result(s).issues, []);
  s.templateSkills[i] = [t.skills[i].options[0]];
  const r = result(s),
    riding = r.skills.find((x) => x.name === t.skills[i].options[0]);
  assert.equal(riding.total, r.stats.Ag + 20);
  assert.deepEqual(r.issues, []);
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
  delete s.templateSkills[i];
  assert.ok(!result(s).skills.some((x) => x.name.startsWith("Ride (")));
  assert.equal(
    templateEligibility(
      t,
      data.profiles.find((p) => p.name === "Human"),
    ),
    "",
  );
});
test("Chaos Knight and Lord reuse core limits, canonical spellings and explicit weapon alternatives", () => {
  const knight = result(
    complete(draft("Chaos Warrior of Nurgle", "Chaos Knight")),
  );
  assert.equal(knight.stats.Ag, 60);
  assert.equal(knight.stats.Dex, 40);
  assert.ok(knight.talents.some((t) => t.name === "Roughrider"));
  assert.ok(knight.attacks.some((a) => a.name === "Lance"));
  assert.deepEqual(knight.issues, []);
  const lord = result(complete(draft("Chaos Warrior of Nurgle", "Chaos Lord")));
  assert.equal(lord.stats.T, 85);
  assert.equal(lord.stats.WP, 90);
  assert.ok(lord.talents.some((t) => t.name === "Unshakeable"));
  assert.ok(lord.talents.some((t) => t.name === "War Leader"));
  assert.deepEqual(lord.issues, []);
});
test("reviewed template bounds reject invalid minimums and unknown foundation rules", () => {
  const R = rulesFor(draft()),
    other = {
      ...data,
      profiles: data.profiles.filter(
        (p) => p.source?.book !== "bayl-many-eyes",
      ),
      templates: data.templates.filter(
        (t) => t.source?.book !== "bayl-many-eyes",
      ),
      books: data.books.filter((b) => b.id !== "bayl-many-eyes"),
    };
  const invalid = structuredClone(raw);
  invalid.templates[0].magicGroups = [
    { categories: ["Petty"], count: 3, minimum: 4 },
  ];
  assert.throws(
    () => addGMSupplement(other, invalid, R),
    /Invalid template spell group/,
  );
  invalid.templates[0].magicGroups = [];
  invalid.templates[0].eligibility = "invented";
  assert.throws(
    () => addGMSupplement(other, invalid, R),
    /foundation restriction/,
  );
});

test("Chaos Steed uses Sprinter and Large primary Damage without an extra Horns Free Attack", () => {
  const s = draft("Chaos Steed"),
    r = result(s);
  assert.equal(r.attacks[0].damage, 13);
  assert.ok(!r.attacks[0].free);
  assert.equal(r.stats.WS, 35);
  assert.equal(r.wounds, 24);
  assert.ok(r.traits.some((t) => t.name === "Sprinter" && t.adaptation));
  assert.ok(!r.traits.some((t) => t.name === "Stride"));
  assert.deepEqual(r.issues, []);
  s.optionalArmour.push(r.profile.armour[0].key);
  assert.deepEqual(result(s).ap, {
    Head: 3,
    Body: 3,
    Forelegs: 3,
    "Rear Legs": 3,
  });
  s.stats.S = 65;
  assert.equal(result(s).attacks[0].damage, 15);
});
test("Forsaken retains approved exceptional Fearless Everything with a Legacy explanation", () => {
  const s = complete(draft("Chaos Warrior of Nurgle", "Forsaken")),
    r = result(s);
  assert.equal(r.stats.WS, 40);
  const fearless = r.talents.find((t) => t.name === "Fearless (Everything)");
  assert.equal(fearless.ranks, 1);
  assert.ok(fearless.adaptation.includes("exceptional"));
  assert.deepEqual(r.issues, []);
});
function sorcerer(lord = false) {
  const s = complete(
    draft(
      "Chaos Warrior of Nurgle",
      lord ? "Chaos Sorcerer Lord" : "Chaos Sorcerer",
    ),
  );
  const t = data.templates.find((t) => t.id === s.template);
  s.templateTalents[
    t.talents.findIndex((x) =>
      x.options.some((n) => n.startsWith("Arcane Magic (")),
    )
  ] = "Arcane Magic (Death)";
  s.templateSkills[0] = ["Channelling (Shyish)"];
  const choices = magicChoices(rulesFor(s), result(s));
  s.spells = choices
    .filter((x) => x.category === "Petty")
    .slice(0, lord ? 6 : 3)
    .map((x) => x.contentId);
  return s;
}
test("Sorcerers enforce Colour/Wind, exact Petty and bounded Arcane counts and one Lord diction rank", () => {
  for (const lord of [false, true]) {
    const s = sorcerer(lord);
    assert.deepEqual(result(s).issues, []);
    if (lord) {
      const diction = result(s).talents.find(
        (t) => t.name === "Instinctive Diction",
      );
      assert.equal(diction.ranks, 1);
      assert.ok(diction.adaptation);
    }
    s.templateSkills[0] = ["Channelling (Aqshy)"];
    assert.ok(result(s).issues.some((i) => i.code === "template.wind"));
    s.templateSkills[0] = ["Channelling (Shyish)"];
    const arcane = magicChoices(rulesFor(s), result(s)).filter(
      (x) => x.category === "Arcane",
    );
    s.spells.push(...arcane.slice(0, lord ? 13 : 7).map((x) => x.contentId));
    assert.ok(result(s).issues.some((i) => i.code === "template.spells"));
    s.spells.pop();
    assert.deepEqual(result(s).issues, []);
    assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
  }
});
test("Sorcerer Chaos-god spells need both the matching Mark and Chaos Magic", () => {
  const s = sorcerer();
  s.talents.push({
    key: "gm-chaos-talent",
    name: "Chaos Magic (Nurgle)",
    ranks: 1,
    origin: "GM",
  });
  const spell = magicChoices(rulesFor(s), result(s)).find(
    (x) => x.category === "Nurgle",
  );
  assert.ok(spell);
  s.spells.push(spell.contentId);
  assert.deepEqual(result(s).issues, []);
  const mark = result(s).traits.find((t) => t.name === "Mark of Chaos");
  s.removed.push(mark.key);
  assert.ok(result(s).issues.some((i) => i.code === "template.chaos-lore"));
  s.removed = [];
  s.talents = [];
  assert.ok(result(s).issues.some((i) => i.code === "template.chaos-lore"));
});
