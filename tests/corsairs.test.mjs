import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library, soldier } from "./fixture.mjs";
import { equipment } from "../src/engine/equipment.mjs";
import { assembleBooks } from "../src/engine/books.mjs";
import { createGMRules, gmCatalogue } from "../src/engine/gm/books.mjs";
import {
  freshGM,
  calculateGM,
  applyTemplate,
  armourLabel,
  validateGMDraft,
  magicChoices,
} from "../src/engine/gm/model.mjs";
import { sheetSections } from "../src/engine/gm/pdf.mjs";
import { cardSections } from "../src/engine/gm/print.mjs";
import { loadReferenceLibrary } from "../src/engine/search-library.mjs";

const book = "corsairs-flariel";
const json = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const data = await json("../public/gm/data.json");
const raw = await json("../content/sources/gm/books/corsairs-flariel.json");
const rulesFor = createGMRules(library, data);
const draft = () => freshGM(data, `${book}:creatures:dark-elf`);
const result = (s) => calculateGM(data, rulesFor(s), s);
const template = (name) =>
  data.templates.find((t) => t.source?.book === book && t.name === name);
const choose = (s, t) => {
  for (const [i, slot] of t.skills.entries())
    if (!slot.optional && slot.options.length > 1)
      s.templateSkills[i] = slot.options.slice(0, slot.count);
  for (const [i, slot] of t.gear.entries())
    if (slot.choose) s.templateGear[i] = slot.options[0].id;
};

test("Corsairs foundations/templates are opt-in; the usable Dark Elf retains its printed baseline", () => {
  assert.equal(raw.profiles.length, 2);
  assert.equal(raw.templates.length, 8);
  assert.equal(
    gmCatalogue(data, ["core"]).profiles.some((p) => p.source?.book === book),
    false,
  );
  assert.equal(
    gmCatalogue(data, ["core", book]).templates.filter(
      (t) => t.source?.book === book,
    ).length,
    8,
  );
  const s = draft(),
    r = result(s);
  validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
  assert.deepEqual(r.issues, []);
  assert.equal(r.wounds, 13);
  assert.equal(r.stats.I, 50);
  assert.equal(r.attacks.length, 1);
  assert.equal(r.attacks[0].damage, 7);
  assert.equal(r.ap.Body, 0);
  assert.ok(r.traits.find((t) => t.name === "Night Vision").adaptation);
  s.optionalAttacks = [r.profile.attacks.find((a) => a.optional).key];
  const attack = result(s).attacks.find((a) => a.name === "Ranged attack");
  assert.equal(attack.damage, 9);
  assert.equal(attack.ranged, true);
  assert.match(attack.text, /60 yards/);
  assert.doesNotMatch(
    JSON.stringify(cardSections(r, s)),
    /Legacy:|Printed Weapon/,
  );
});

test("Sparse Characteristic columns and explicit alternative choices survive calculation and reload", () => {
  const expected = {
    Corsair: { Dex: 45, Int: 40 },
    Oarsman: { Fel: 35, WP: 40, S: 40 },
    Lookout: { Dex: 45, Int: 40, I: 60 },
  };
  for (const name of ["Corsair", "Oarsman", "Lookout", "Reaver Captain"]) {
    const s = draft(),
      t = template(name);
    applyTemplate(s, t.id);
    choose(s, t);
    const r = result(s);
    assert.deepEqual(r.issues, [], name);
    for (const [key, score] of Object.entries(expected[name] || {}))
      assert.equal(r.stats[key], score, `${name} ${key}`);
    validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
    if (name === "Lookout")
      assert.equal(r.skills.find((x) => x.name === "Perception").total, 75);
    if (name === "Reaver Captain") {
      const i = t.skills.findIndex((x) => x.count === 2);
      assert.equal(
        r.gear
          .filter((g) => g.entry.name === "Hand Weapon")
          .reduce((n, g) => n + g.quantity, 0),
        2,
      );
      s.templateSkills[i] = [t.skills[i].options[0], t.skills[i].options[0]];
      assert.ok(result(s).issues.some((x) => x.code === "template.skill"));
    }
  }
});

test("Chief Mate's optional Talents are not silently granted or required and can be removed", () => {
  const s = draft(),
    t = template("Chief Mate");
  applyTemplate(s, t.id);
  choose(s, t);
  assert.ok(t.talents.every((x) => x.optional));
  assert.deepEqual(result(s).issues, []);
  assert.equal(result(s).talents.length, 0);
  const i = t.talents.findIndex((x) => x.options[0] === "Dual Wielder");
  s.templateTalents[i] = "Dual Wielder";
  let r = result(s);
  assert.equal(r.talents.length, 1);
  assert.ok(r.talents[0].adaptation);
  validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
  delete s.templateTalents[i];
  assert.equal(result(s).talents.length, 0);
  s.templateTalents[i] = "not a valid choice";
  assert.ok(result(s).issues.some((x) => x.code === "template.talent"));
  assert.equal(result(s).talents.length, 0);
});

test("Dark Magic and Reaper are shared options with selective conversions and no invented PC access or shop prices", async () => {
  const R = assembleBooks(library, [book]);
  const spells = R.spells.filter((x) => x.source.book === book);
  assert.equal(spells.length, 4);
  assert.equal(spells.find((x) => x.name === "Doombolt").cn, "7");
  assert.match(
    spells.find((x) => x.name === "Doombolt").text,
    /Hard \(−2 SL\)/,
  );
  assert.ok(!spells.find((x) => x.name === "Shroud of Despair").adaptation);
  assert.equal(R.config.colours.includes("Dark Magic"), false);
  assert.equal(Boolean(R.species["Dark Elf"]), false);
  const reaper = R.weapons.find((x) => x.name === "Reaper");
  assert.equal(reaper.reach, "100 yards");
  assert.equal(reaper.damage, "12");
  assert.match(reaper.qualities, /Salvo 6/);
  assert.ok(!R.market.some((x) => x.name === "Reaper"));
  assert.ok(rulesFor(freshGM(data)).spells.some((x) => x.source.book === book));
  const references = await loadReferenceLibrary(library, () =>
    json("../public/data/search-library.json"),
  );
  const rows = references.rows.filter((x) => x.entry.source.book === book);
  assert.ok(rows.some((x) => /Sea Dragon Cloak/.test(x.name)));
  assert.ok(
    !rows.some((x) =>
      /Flariel|Rakaria|Corvian|Cynwra|Ship’s Crew|Reaver Captain/.test(x.name),
    ),
  );
});

test("Ship's Crew mislabelled entries are Skills; both printed alternatives are explicit and reloadable", () => {
  const s = freshGM(data, `${book}:creatures:dark-elf-ship-s-crew`);
  let r = result(s);
  assert.equal(
    r.traits.some((x) => x.name === "Climb"),
    false,
  );
  assert.equal(r.skills.find((x) => x.name === "Sail").total, 50);
  assert.equal(r.issues.filter((x) => x.code === "profile.skill").length, 2);
  assert.equal(r.talents.length, 4);
  s.profileSkills = { 0: "Entertain (Singing)", 1: "Play (Flute)" };
  r = result(s);
  assert.deepEqual(r.issues, []);
  assert.equal(
    r.skills.find((x) => x.name === "Entertain (Singing)").total,
    35,
  );
  assert.ok(r.skills.find((x) => x.name === "Entertain (Singing)").adaptation);
  assert.equal(r.skills.find((x) => x.name === "Play (Flute)").total, 45);
  s.stats.Fel = 40;
  assert.equal(
    result(s).skills.find((x) => x.name === "Entertain (Singing)").total,
    45,
  );
  applyTemplate(s, template("Oarsman").id);
  assert.equal(
    result(s).skills.find((x) => x.name === "Entertain (Singing)").total,
    50,
  );
  validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
  s.profileSkills[1] = "Play (All instruments)";
  assert.throws(
    () => validateGMDraft(data, rulesFor(s), s),
    /printed Skill choice/,
  );
});

test("Warhound requires the Dog foundation and recorded Broken roll; Size and training apply once", () => {
  const s = freshGM(data, "core:creatures:dog", ["core", book]);
  const t = template("Warhound");
  applyTemplate(s, t.id);
  assert.ok(
    result(s).issues.some((x) => x.control.target === "#gm-broken-roll"),
  );
  s.brokenRoll = [6, 7];
  let r = result(s);
  assert.deepEqual(r.issues, []);
  assert.equal(r.size, "Average");
  assert.equal(r.stats.S, 30);
  assert.equal(r.stats.T, 30);
  assert.equal(r.stats.Ag, 25);
  assert.equal(r.stats.WS, 35);
  assert.equal(r.stats.Fel, 28);
  assert.equal(r.wounds, 10);
  assert.equal(r.attacks.find((x) => x.name === "Claws").damage, 6);
  assert.equal(r.traits.filter((x) => x.name === "Tracker").length, 1);
  assert.equal(r.skills.find((x) => x.name === "Track").total, 45);
  assert.ok(r.traits.some((x) => x.name === "Territorial"));
  validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
  s.size = "Large";
  r = result(s);
  assert.equal(r.stats.S, 40);
  assert.equal(r.stats.T, 40);
  assert.equal(r.stats.Fel, 28);
  assert.equal(r.attacks.find((x) => x.name === "Claws").damage, 11);
  const wrong = draft();
  applyTemplate(wrong, t.id);
  assert.ok(result(wrong).issues.some((x) => x.code === "template.foundation"));
  applyTemplate(s, "");
  s.size = "";
  assert.equal(result(s).stats.Fel, 15);
});

test("Beastmaster grants only the approved Whip and requires a distinct melee/ranged Net choice", () => {
  const s = draft(),
    t = template("Beastmaster");
  applyTemplate(s, t.id);
  choose(s, t);
  const netSlot = t.gear.findIndex((x) => x.label === "Net type");
  assert.equal(t.gear[netSlot].options.length, 2);
  delete s.templateGear[netSlot];
  assert.ok(result(s).issues.some((x) => x.code === "template.equipment"));
  for (const net of t.gear[netSlot].options) {
    s.templateGear[netSlot] = net.id;
    const r = result(s);
    assert.deepEqual(r.issues, []);
    assert.equal(
      r.skills.find((x) => x.name === "Ranged (Entangling)").total,
      60,
    );
    const whip = r.gear.find((x) => x.entry.name === "Whip");
    assert.equal(whip.entry.group, "Flail");
    assert.ok(whip.entry.adaptation);
    assert.equal(
      r.gear.some((x) => x.entry.name === "Crop"),
      false,
    );
    assert.equal(r.gear.filter((x) => x.entry.name === "Net").length, 1);
    validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
  }
});

test("Sorceress preserves exact mixed magic counts and validates the chosen Lore/Wind", () => {
  const s = draft(),
    t = template("Druchii Sorceress");
  applyTemplate(s, t.id);
  choose(s, t);
  const channel = t.skills.findIndex((x) =>
    x.options.some((n) => n.startsWith("Channelling")),
  );
  const lore = t.talents.findIndex((x) =>
    x.options.some((n) => n.startsWith("Arcane Magic")),
  );
  assert.equal(t.talents[lore].options.length, 8);
  assert.equal(t.skills[channel].options.length, 8);
  s.templateSkills[channel] = ["Channelling (Aqshy)"];
  s.templateTalents[lore] = "Arcane Magic (Fire)";
  let r = result(s);
  assert.ok(
    r.skills.some((x) => x.name === "Lore (Dark Magic)" && x.total === 80),
  );
  assert.ok(
    r.talents.some((x) => x.name === "Aethyric Attunement" && x.adaptation),
  );
  assert.ok(r.issues.some((x) => x.code === "template.spells"));
  const available = magicChoices(rulesFor(s), r);
  const petty = available
    .filter((x) => x.category === "Petty" && !x.ritual)
    .slice(0, 5);
  const dark = available.filter((x) => x.category === "Dark Magic");
  const witch = available.find((x) => x.category === "Witchcraft" && !x.ritual);
  const colours = available
    .filter((x) => x.category === "Fire" && !x.ritual)
    .slice(0, 2);
  s.spells = [...petty, ...dark, witch, ...colours].map((x) => x.contentId);
  assert.deepEqual(result(s).issues, []);
  validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
  s.templateSkills[channel] = ["Channelling (Ulgu)"];
  assert.ok(result(s).issues.some((x) => x.code === "template.wind"));
  s.templateSkills[channel] = ["Channelling (Aqshy)"];
  s.spells.pop();
  assert.ok(result(s).issues.some((x) => x.code === "template.spells"));
});

test("Sea Dragon Cloak is optional acquired additional armour with no inferred price or weight", () => {
  const s = draft(),
    t = template("Corsair");
  applyTemplate(s, t.id);
  choose(s, t);
  let r = result(s);
  assert.equal(
    r.gear.some((x) => x.entry.name === "Sea Dragon Cloak"),
    false,
  );
  const index = t.gear.findIndex((x) => x.optional);
  s.templateGear[index] = t.gear[index].options[0].id;
  r = result(s);
  assert.deepEqual(r.issues, []);
  const cloak = r.gear.find((x) => x.entry.name === "Sea Dragon Cloak");
  assert.equal(cloak.entry.enc, null);
  assert.equal(cloak.entry.ap, 2);
  assert.equal(cloak.entry.adaptation, undefined);
  assert.equal(armourLabel(cloak.entry), "Sea Dragon Cloak (Body +2 AP; Partial)");
  const card = Object.fromEntries(cardSections(r, s)),
    sheet = Object.fromEntries(sheetSections(r, s));
  assert.ok(card.Gear.split("; ").includes("1 × Sea Dragon Cloak"));
  assert.ok(sheet.Gear.includes("1 × Sea Dragon Cloak"));
  assert.equal(card.Soak, "Head 4 · Arms 4 · Body 6 · Legs 4");
  assert.deepEqual(sheet.Soak, ["Head 4 · Arms 4 · Body 6 · Legs 4"]);
  assert.equal(r.ap.Body, 3);
  assert.equal(r.ap.Head, 1);
  assert.ok(!rulesFor(s).market.some((x) => x.name === "Sea Dragon Cloak"));
  const armourIndex = t.gear.findIndex(
    (x) => x.label === "Leather or Mail Armour",
  );
  s.templateGear[armourIndex] = t.gear[armourIndex].options.find(
    (x) => x.name === "Medium Armour",
  ).id;
  assert.equal(result(s).ap.Body, 5);
  validateGMDraft(data, rulesFor(s), JSON.parse(JSON.stringify(s)));
  const human = freshGM(data, "core:creatures:human", ["core", book]);
  applyTemplate(human, t.id);
  choose(human, t);
  human.templateGear[index] = t.gear[index].options[0].id;
  assert.equal(
    result(human).gear.some((x) => x.entry.name === "Sea Dragon Cloak"),
    false,
  );
});

test("Shared player armour calculations preserve additional protection, unknown weight and material boundaries", () => {
  const R = assembleBooks(library, [book]),
    s = soldier();
  s.ledger.push({ type: "trapping", name: "Sea Dragon Cloak", cost: 0 });
  let e = equipment(R, s);
  assert.equal(e.ap.Body, 3);
  assert.equal(e.armour.find((x) => x.name === "Sea Dragon Cloak").enc, null);
  assert.ok(e.unknown.includes("Sea Dragon Cloak"));
  assert.equal(e.penalties.stealth, 0);
  s.ledger.push({ type: "trapping", name: "Medium Armour", cost: 0 });
  e = equipment(R, s);
  assert.equal(e.ap.Body, 5);
  assert.equal(e.ap.Head, 3);
  assert.equal(
    e.notices.filter((x) => x.code === "warning.quick-armour").length,
    1,
  );
});
