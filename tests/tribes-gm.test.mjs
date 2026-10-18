import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  freshGM,
  calculateGM,
  applyTemplate,
  validateGMDraft,
  magicChoices,
} from "../src/engine/gm/model.mjs";
import { createGMRules, gmCatalogue } from "../src/engine/gm/books.mjs";
import { assembleBooks } from "../src/engine/books.mjs";
import {
  templateEligibility,
  templateGearEnabled,
} from "../src/engine/gm/templates.mjs";
import { workspace } from "./bestiary-presentation.mjs";
import { cardSections } from "../src/engine/gm/print.mjs";
const json = async (p) =>
  JSON.parse(await readFile(new URL(p, import.meta.url), "utf8"));
const data = await json("../public/gm/data.json"),
  library = await json("../public/data/book-library.json");
const rulesFor = createGMRules(library, data),
  B = "tribes-tribulations";
const id = (kind, name) => `${B}:${kind}:${name}`;
const make = (name = "basic-common-troll") =>
  freshGM(data, id("creatures", name));
const calc = (s) => calculateGM(data, rulesFor(s), s);
const set = (s, name) => {
  applyTemplate(s, id("template", name));
  return s;
};
test("book gates only its 19 generic profiles and 16 templates; no named imports", () => {
  const off = gmCatalogue(data),
    on = gmCatalogue(data, ["core", B]);
  assert.equal(on.profiles.length - off.profiles.length, 19);
  assert.equal(on.templates.length - off.templates.length, 16);
  assert.ok(
    !on.profiles.some((p) => /Gobbla|Skarsnik|Grua|Matthogg/.test(p.name)),
  );
  const s = freshGM(data, "core:creatures:human");
  assert.equal(
    rulesFor(s).spells.filter((x) => x.source.book === B).length,
    28,
  );
  const pc = assembleBooks(library, ["core", B]);
  assert.ok(!pc.config.colours.includes("Big Waaagh!"));
  assert.ok(pc.config.skillOptions.Ranged.includes("Catapult"));
  const together = assembleBooks(library, [
    "core",
    "up-in-arms",
    "cluster-eye-tribe",
    B,
  ]);
  assert.equal(
    together.config.skillOptions.Ranged.filter((x) => x === "Catapult").length,
    1,
  );
  assert.equal(
    together.config.skillOptions.Ride.filter((x) => x === "Spider").length,
    1,
  );
});
test("approved profile conversions retain absent scores, training and printed free attacks", () => {
  assert.equal(calc(make("basic-snotling")).wounds, 4);
  assert.equal(calc(make("mournfang")).attacks[0].damage, 14);
  const spider = calc(make("giant-spider"));
  assert.equal(spider.stats.BS, null);
  assert.equal(spider.attacks[0].damage, 10);
  assert.equal(spider.stats.Fel, 10);
  assert.equal(spider.stats.WS, 35);
  const tiny = make("purple-skullback-spider");
  assert.equal(calc(tiny).wounds, 1);
  tiny.stats.T = 15;
  assert.ok(calc(tiny).issues.some((x) => x.control.target === "#gm-wounds"));
  const troll = calc(make());
  assert.equal(troll.attacks.find((x) => x.name === "Bite").damage, 8);
  assert.equal(troll.attacks.find((x) => x.name === "Vomit").damage, 8);
  assert.ok(troll.traits.find((x) => x.name === "Die Hard").adaptation);
  assert.ok(
    !JSON.stringify(cardSections(troll, make())).includes("user-supplied"),
  );
});
test("Stone replaces armour and compatible Troll modifiers combine once", () => {
  const s = set(make(), "stone-troll");
  assert.equal(calc(s).ap.Body, 3);
  s.templateModifiers = [
    id("template", "old-troll"),
    id("template", "hulking-troll"),
  ];
  s.templateTalents[2] = "Striding Gait (Woodland)";
  const r = calc(s);
  assert.equal(r.stats.S, 70);
  assert.equal(r.stats.T, 65);
  assert.equal(r.stats.I, 2);
  assert.equal(r.stats.Ag, 10);
  assert.equal(r.stats.M, 4);
  assert.equal(r.size, "Enormous");
  assert.equal(r.ap.Body, 3);
  assert.equal(r.traits.filter((t) => t.name === "Painless").length, 1);
  assert.equal(r.traits.filter((t) => t.name === "Size").length, 1);
  validateGMDraft(data, rulesFor(s), s);
  s.templateModifiers.push(s.templateModifiers[0]);
  assert.throws(() => validateGMDraft(data, rulesFor(s), s), /modifier/);
});
test("Hag requires River, grants its nine printed spells and uses current Poison Breath", () => {
  const s = set(make(), "river-troll");
  s.templateModifiers = [id("template", "river-troll-hag")];
  const r = calc(s);
  assert.equal(r.spells.length, 9);
  assert.ok(!r.talents.some((x) => x.name === "Petty Magic"));
  assert.equal(r.attacks.find((a) => a.name === "Breath (Poison)").damage, 8);
  assert.ok(r.traits.some((t) => t.name === "Stupid"));
  assert.ok(r.traits.some((t) => t.name === "Water Wise"));
  assert.equal(r.issues.length, 0);
  validateGMDraft(data, rulesFor(s), s);
  s.template = "tribes-tribulations:template:stone-troll";
  assert.ok(calc(s).issues.some((x) => x.code === "template.hag-type"));
});
test("Chaos requires two Physical results and Bile replaces its abilities", () => {
  const s = set(make(), "chaos-troll");
  assert.ok(calc(s).issues.some((x) => x.code === "template.chaos-mutations"));
  s.mutations = data.mutations
    .filter((m) => m.category === "Physical")
    .slice(0, 2)
    .map((x) => x.id);
  assert.ok(!calc(s).issues.some((x) => x.code === "template.chaos-mutations"));
  set(s, "bile-troll");
  const names = calc(s).traits.map((x) => x.name);
  assert.ok(
    names.includes("Rotten Regeneration") && names.includes("Bileful Vomit"),
  );
  assert.ok(!names.includes("Regeneration") && !names.includes("Vomit"));
});
test("Waaagh shaman respects race, maxima and Hobgoblin two-spell secondary limit", () => {
  const s = set(make("basic-orc"), "shaman");
  let r = calc(s);
  assert.ok(r.talents.some((x) => x.name === "Arcane Magic (Big Waaagh!)"));
  assert.equal(
    r.skills.find((x) => x.name === "Channelling (Magick)").total,
    55,
  );
  const eligible = magicChoices(rulesFor(s), r);
  assert.ok(eligible.some((x) => x.category === "Big Waaagh!"));
  assert.ok(!eligible.some((x) => x.category === "Little Waaagh!"));
  assert.equal(r.spells.length, 0);
  assert.equal(
    rulesFor(s).spells.find((x) => x.name.endsWith("Eadbutt")).target,
    "1",
  );
  const h = set(make("basic-hobgoblin"), "shaman-lord");
  h.templateLore = "Both";
  const R = rulesFor(h);
  h.spells = ["Little Waaagh!", "Big Waaagh!"].flatMap((c) =>
    R.spells
      .filter((x) => x.category === c)
      .slice(0, 3)
      .map((x) => x.contentId),
  );
  assert.ok(calc(h).issues.some((x) => x.code === "template.hobgoblin-spells"));
  h.spells.pop();
  assert.ok(
    !calc(h).issues.some((x) => x.code === "template.hobgoblin-spells"),
  );
  validateGMDraft(data, R, h);
  const black = data.profiles.find(
    (x) => x.id === id("creatures", "basic-black-orc"),
  );
  assert.match(
    templateEligibility(
      data.templates.find((x) => x.id === s.template),
      black,
    ),
    /Black Orc/,
  );
});
test("Ogre template swaps Int/T bonuses, uses Ironfist and Hunter throws three Javelins", () => {
  const s = set(make("basic-ogre"), "shaman");
  s.templateLore = "Fire";
  let r = calc(s);
  assert.equal(r.stats.T, 55);
  assert.equal(r.stats.Int, 20);
  assert.ok(r.skills.some((x) => x.name === "Channelling (Aqshy)"));
  assert.equal(r.skills.find((x) => x.name === "Language (Magick)").total, 65);
  assert.ok(!r.issues.some((x) => x.code === "magic.species"));
  set(s, "soldier");
  r = calc(s);
  assert.ok(r.gear.some((x) => x.entry.name === "Ironfist"));
  assert.ok(!r.gear.some((x) => x.entry.name === "Shield"));
  set(s, "skirmisher");
  r = calc(s);
  assert.equal(r.gear.find((x) => x.entry.name === "Javelin").quantity, 3);
  assert.ok(
    !r.gear.some(
      (x) => x.entry.ammunition || /Arrow|Shot|Bullet/.test(x.entry.name),
    ),
  );
  const ammo = r.template.gear.find((x) => x.forWeapon !== undefined);
  assert.equal(
    templateGearEnabled(ammo, {}, s.templateGear, r.template),
    false,
  );
  assert.ok(
    !r.issues.some(
      (x) =>
        x.code === "template.equipment" || x.code === "template.ammunition",
    ),
  );
});
test("Troll controls expose only compatible modifiers and Chaos mutation actions", () => {
  const s = set(make(), "river-troll");
  s.step = 1;
  const ui = { tab: 0, expanded: [], profileQuery: "", category: "" };
  let html = workspace(gmCatalogue(data, s.books), rulesFor(s), s, calc(s), ui);
  assert.match(html, /gm-troll-modifiers/);
  assert.match(html, /data-troll-modifier="[^"]+river-troll-hag"/);
  assert.ok(
    !html.match(/data-troll-modifier="[^"]+river-troll-hag"[^>]+disabled/),
  );
  set(s, "chaos-troll");
  ui.tab = 1;
  html = workspace(gmCatalogue(data, s.books), rulesFor(s), s, calc(s), ui);
  assert.match(html, /Roll Physical/);
});
