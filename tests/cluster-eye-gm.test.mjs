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
import { addGMSupplement } from "../dist/gm/content.mjs";
import { workspace } from "../dist/gm/views.mjs";
import { cardSections } from "../dist/gm/print.mjs";
const json = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const data = await json("../dist/gm/data.json");
const library = await json("../dist/data/book-library.json");
const raw = await json("../dist/gm/sources/cluster-eye-tribe.json");
const rulesFor = createGMRules(library, data);
const profile = data.profiles.find(
  (p) => p.id === "cluster-eye-tribe:creatures:forest-goblin",
);
const template = data.templates.find(
  (t) => t.id === "cluster-eye-tribe:template:skirmisher",
);
const draft = () => freshGM(data, profile.id);
const result = (s) => calculateGM(data, rulesFor(s), s);
function setTarget(s) {
  s.traitParameters[profile.traits.find((t) => t.name === "Animosity").key] =
    "Rival Goblin tribe";
  return s;
}
function complete(s, weapon = "Bow (2H)", ammunition = "Arrow (12)") {
  applyTemplate(s, template.id);
  s.templateSkills[2] = [
    weapon === "Sling" ? "Ranged (Sling)" : "Ranged (Bow)",
  ];
  s.templateSkills[3] = ["Stealth (Rural)"];
  s.templateGear[1] = template.gear[1].options.find(
    (x) => x.name === weapon,
  ).id;
  s.templateGear[2] = template.gear[2].options.find(
    (x) => x.name === ammunition,
  ).id;
  return s;
}
test("Cluster-Eye book gates its foundation/template, excludes named NPCs and leaves core variants distinct", () => {
  const off = gmCatalogue(data),
    on = gmCatalogue(data, ["core", "cluster-eye-tribe"]);
  assert.equal(on.profiles.length - off.profiles.length, 2);
  assert.equal(on.templates.length - off.templates.length, 7);
  assert.ok(
    on.templates.some(
      (t) =>
        t.id === "core:template:skirmisher" ||
        (t.name === "Skirmisher" && (t.source?.book || "core") === "core"),
    ),
  );
  assert.ok(
    !data.profiles.some((p) =>
      /Vish Venombarb|Bograt|Blackhearted Nurd|Bugshot/.test(p.name),
    ),
  );
  assert.equal(
    data.books.find((b) => b.id === "cluster-eye-tribe").source.sha256,
    raw.source.sha256,
  );
});
test("Forest Goblin preserves printed values and exposes its unresolved target before export", () => {
  const s = draft();
  const first = result(s);
  assert.equal(first.stats.BS, 35);
  assert.equal(first.stats.Ag, 35);
  assert.equal(first.stats.Int, 30);
  assert.equal(first.wounds, 11);
  assert.equal(first.armour[0].ap, 1);
  assert.equal(first.attacks[0].damage, 7);
  assert.ok(first.issues.some((i) => /target.*Animosity/i.test(i.message)));
  const ui = { tab: 1 };
  s.step = 1;
  const html = workspace(data, rulesFor(s), s, first, ui);
  assert.match(html, /data-trait="cluster-eye-tribe-forest-goblin-traits-0"/);
  setTarget(s);
  const r = result(s);
  assert.equal(r.traits.filter((t) => t.name === "Animosity").length, 1);
  assert.equal(r.stats.T, 30);
  assert.deepEqual(r.issues, []);
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
  const invalid = structuredClone(s);
  invalid.traitParameters[profile.traits.find((t) => t.name === "Afraid").key] =
    "An invented replacement";
  assert.throws(
    () => validateGMDraft(data, rulesFor(s), invalid),
    /printed Trait parameter/,
  );
  assert.ok(r.traits.find((t) => t.name === "Afraid").adaptation);
  assert.ok(!r.traits.find((t) => t.name === "Arboreal").adaptation);
  const print = JSON.stringify(cardSections(r, s));
  assert.match(print, /woodlands/);
  assert.ok(!print.includes("Legacy:"));
});
test("Skirmisher applies table and Marksman separately, requires matching 12-shot ammunition and removes cleanly", () => {
  const s = complete(setTarget(draft()));
  const r = result(s);
  assert.equal(r.stats.BS, 45);
  assert.equal(r.stats.I, 30);
  assert.equal(r.stats.Ag, 45);
  assert.equal(r.stats.WP, 25);
  assert.equal(r.skills.find((x) => x.name === "Ranged (Bow)").total, 55);
  assert.equal(r.skills.find((x) => x.name === "Stealth (Rural)").total, 55);
  assert.equal(r.gear.find((x) => x.entry.name === "Arrow (12)").quantity, 1);
  assert.deepEqual(r.issues, []);
  s.templateGear[2] = template.gear[2].options.find(
    (x) => x.name === "Stone Bullet (12)",
  ).id;
  assert.ok(
    result(s).issues.some(
      (i) =>
        i.code === "template.ammunition" &&
        i.control.target === "#template-gear-2",
    ),
  );
  complete(s, "Sling", "Stone Bullet (12)");
  assert.deepEqual(result(s).issues, []);
  applyTemplate(s, "");
  assert.equal(result(s).stats.BS, 35);
  assert.equal(result(s).gear.length, 0);
});
test("optional mount choices use source-owned bonuses and apply to the correct foundation without requiring its book selection", () => {
  const goblin = result(setTarget(draft()));
  assert.deepEqual(
    goblin.ridingOptions.map((x) => x.name),
    ["Ride (Spider)", "Ride (Wolf)"],
  );
  assert.ok(
    goblin.ridingOptions.every(
      (x) => x.bonus === 20 && x.source.book === "cluster-eye-tribe",
    ),
  );
  const orc = freshGM(data, "core:creatures:orc");
  assert.deepEqual(
    result(orc).ridingOptions.map((x) => x.name),
    ["Ride (Boar)"],
  );
  const human = freshGM(data, "core:creatures:human");
  assert.deepEqual(result(human).ridingOptions, []);
});
test("ammunition links reject invalid template slot references", () => {
  const invalid = structuredClone(raw);
  invalid.templates[0].gear[2].forWeapon = 99;
  const prior = {
    ...data,
    profiles: data.profiles.filter((x) => x.source?.book !== raw.id),
    templates: data.templates.filter((x) => x.source?.book !== raw.id),
    traits: data.traits.filter((x) => x.source?.book !== raw.id),
    books: data.books.filter((x) => x.id !== raw.id),
  };
  assert.throws(
    () => addGMSupplement(prior, invalid, rulesFor(draft())),
    /ammunition link/,
  );
});

test("Mancatcher uses approved Large Damage and requires explicit Venom recovery Difficulty", () => {
  const p = data.profiles.find(
    (p) => p.id === "cluster-eye-tribe:creatures:drakwald-mancatcher",
  );
  const s = freshGM(data, p.id);
  const r = result(s);
  assert.equal(r.wounds, 20);
  assert.equal(r.attacks[0].damage, 10);
  assert.equal(r.attacks[0].skill, 35);
  assert.ok(r.attacks[0].adaptation.includes("+10"));
  const venom = r.traits.find((t) => t.name === "Venom");
  assert.ok(r.issues.some((i) => i.control.target === `#trait-${venom.key}`));
  s.traitParameters[venom.key] = "Difficult";
  assert.deepEqual(result(s).issues, []);
  assert.equal(
    result(s).traits.find((t) => t.name === "Venom").value,
    "Difficult",
  );
  s.traitParameters[venom.key] = "invented";
  assert.ok(result(s).issues.some((i) => i.code === "trait.parameter"));
  s.traitParameters[venom.key] = "Difficult";
  s.stats.S = 45;
  assert.equal(
    result(s).attacks[0].damage,
    12,
    "SB increase affects base and Large bonus once each",
  );
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
});
function advanced(name, foundation = profile.id) {
  const s = freshGM(data, foundation, ["core", "cluster-eye-tribe"]);
  const t = data.templates.find(
    (t) => t.source?.book === "cluster-eye-tribe" && t.name === name,
  );
  applyTemplate(s, t.id);
  for (const [i, slot] of t.skills.entries())
    if (!slot.optional && slot.options.length > 1)
      s.templateSkills[i] = slot.options.slice(0, slot.count);
  for (const [i, slot] of t.gear.entries())
    if (slot.choose || slot.options.length > 1)
      s.templateGear[i] = slot.options[0].id;
  if (foundation === profile.id) setTarget(s);
  return s;
}
function fillMagic(s) {
  const r = result(s),
    choices = magicChoices(rulesFor(s), r);
  s.spells = r.template.magicGroups.flatMap((group) =>
    choices
      .filter((x) => group.categories.includes(x.category) && !x.ritual)
      .slice(0, group.count)
      .map((x) => x.contentId),
  );
}
test("armoured templates use core protection; optional Goblin bow package is conditional and reversible", () => {
  for (const [name, ap] of [
    ["Soldier", 1],
    ["Elite", 3],
    ["Chief", 3],
    ["Warlord", 3],
  ]) {
    const s = advanced(name),
      r = result(s);
    assert.ok(r.armour.some((a) => a.ap === ap && a.origin === "Template"));
    assert.deepEqual(r.issues, [], name);
    assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
  }
  const s = advanced("Warlord");
  assert.ok(!result(s).gear.some((g) => g.entry.name === "Bow (2H)"));
  s.templateSkills[8] = ["Ranged (Bow)"];
  const r = result(s);
  assert.equal(r.skills.find((x) => x.name === "Ranged (Bow)").total, 55);
  assert.equal(r.gear.find((g) => g.entry.name === "Arrow (12)").quantity, 1);
  assert.ok(r.gear.find((g) => g.entry.name === "Bow (2H)").adaptation);
  assert.ok(r.attacks.find((a) => a.name === "Bow (2H)").adaptation);
  assert.deepEqual(r.issues, []);
  delete s.templateSkills[8];
  assert.ok(!result(s).gear.some((g) => g.entry.name === "Bow (2H)"));
  assert.ok(!result(s).skills.some((g) => g.name === "Ranged (Bow)"));
  const human = advanced("Chief", "core:creatures:human");
  assert.ok(
    !workspace(data, rulesFor(human), human, result(human), {
      tab: 0,
    }).includes('id="template-skill-8"'),
  );
  human.templateSkills[8] = ["Ranged (Bow)"];
  assert.throws(
    () => validateGMDraft(data, rulesFor(human), human),
    /template Skill/,
  );
});
test("Shamans retain exact spell counts, explicit Wind, removed foundation armour and one Lord diction rank", () => {
  for (const [name, petty, arcane] of [
    ["Shaman", 3, 3],
    ["Shaman Lord", 6, 9],
  ]) {
    const s = advanced(name);
    const r = result(s);
    assert.equal(r.armour.length, 0);
    assert.ok(r.issues.some((i) => i.code === "template.spells"));
    assert.equal(
      r.skills.find((x) => x.name.startsWith("Channelling (")).total,
      r.stats.WP + (name === "Shaman" ? 5 : 20),
      "default Spellcaster bonus must not replace explicit template points",
    );
    fillMagic(s);
    const complete = result(s);
    assert.equal(
      complete.spells.filter((x) => x.category === "Petty").length,
      petty,
    );
    assert.equal(
      complete.spells.filter((x) => x.category === "Arcane").length,
      arcane,
    );
    assert.deepEqual(complete.issues, []);
    assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
    if (name === "Shaman Lord") {
      const talent = complete.talents.find(
        (x) => x.name === "Instinctive Diction",
      );
      assert.equal(talent.ranks, 1);
      assert.ok(
        talent.adaptation.includes("second") ||
          talent.adaptation.includes("one core rank"),
      );
    }
    s.spells.pop();
    assert.ok(result(s).issues.some((i) => i.code === "template.spells"));
    applyTemplate(s, "");
    assert.equal(result(s).armour[0].ap, 1);
  }
});
test("Beastmen can select one additional Shaman Lore; matching Wind and Ogre restrictions stay enforced", () => {
  const beast = data.profiles.find(
    (p) => p.category === "Beastmen" && p.name === "Gor",
  );
  const s = advanced("Shaman", beast.id);
  s.templateLore = "Death";
  assert.ok(result(s).issues.some((i) => i.code === "template.wind"));
  s.templateSkills[0] = ["Channelling (Shyish)"];
  fillMagic(s);
  assert.deepEqual(result(s).issues, []);
  assert.deepEqual(result(s).template.magicGroups[1].categories, [
    "Arcane",
    "Death",
  ]);
  assert.equal(
    result(s).traits.find((x) => x.name === "Spellcaster").value,
    "Death",
  );
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
  s.templateLore = "Fire";
  assert.throws(() => validateGMDraft(data, rulesFor(s), s), /template Lore/);
  const ogre = advanced("Shaman", "core:creatures:ogre");
  ogre.tbMode = "calculated";
  assert.ok(result(ogre).issues.some((i) => i.code === "magic.species"));
  assert.ok(result(ogre).issues.some((i) => i.code === "magic.species-wind"));
  const incompatible = result(ogre).traits.find(
    (t) => t.name === "Spellcaster",
  );
  ogre.removed.push(incompatible.key);
  ogre.traits.push({
    key: "gm-approved-lore",
    name: "Spellcaster",
    value: "Beasts",
    origin: "GM",
  });
  ogre.templateSkills[0] = ["Channelling (Ghur)"];
  fillMagic(ogre);
  assert.deepEqual(result(ogre).issues, []);
});
