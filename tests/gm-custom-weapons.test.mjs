import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library } from "./fixture.mjs";
import { assembleGMOptions } from "../src/engine/gm/books.mjs";
import {
  freshGM,
  calculateGM,
  validateGMDraft,
} from "../src/engine/gm/model.mjs";
import {
  newCustomWeapon,
  validateCustomWeapons,
  customWeaponIssues,
  resolveCustomWeapon,
  WEAPON_EFFECTS,
  CREATURE_TARGETS,
  rollWeaponEnchantment,
  MAX_WEAPON_ROLLS,
  damageFormula,
  splitWeaponProperties,
  propertyDefinition,
} from "../src/engine/gm/custom-weapons.mjs";
import { gearLines } from "../src/engine/gm/export-sections.mjs";
import { cardSections } from "../src/engine/gm/print.mjs";
import { sheetSections } from "../src/engine/gm/pdf.mjs";

const R = assembleGMOptions(library);
const data = JSON.parse(
  await readFile(new URL("../public/gm/data.json", import.meta.url), "utf8"),
);
const draft = () => freshGM(data, "core:creatures:human");
const weapon = (name = "Sword") =>
  newCustomWeapon(
    R,
    R.weapons.find((w) => w.name === name).contentId,
    "gm-test-weapon",
  );
const rune = (name, count = 1, target = "") => ({
  id: R.runes.find((r) => r.name === name).contentId,
  count,
  target,
});
const effect = (name) => ({
  id: WEAPON_EFFECTS.find((e) => e.name === name).id,
  target: "",
});

test("weapon editor validation provides stable control destinations without changing its messages", () => {
  const w = weapon();
  w.name = "";
  w.damage = "SB+cats";
  w.quantity = 0;
  const issues = customWeaponIssues(R, w, { structured: true });
  assert.deepEqual(issues.map((issue) => issue.message), customWeaponIssues(R, w));
  assert.deepEqual(issues.map((issue) => issue.target), ["#weapon-name", "#weapon-quantity", "#weapon-damage"]);
  w.name = "Named sword";
  w.damage = "SB+4";
  w.quantity = 1;
  w.power = "magical";
  w.effects = [effect("Of Bane")];
  assert.equal(customWeaponIssues(R, w, { structured: true })[0].target, "#weapon-bane");
});
const calc = (w) => {
  const s = draft();
  s.customWeapons = [w];
  return { s, r: calculateGM(data, R, s) };
};

test("same-name supplement properties preserve their distinct source definitions", () => {
  const w = weapon("Cannon (small)");
  w.properties = ["Salvo 3"];
  w.propertySources.Salvo = "dwarf-guide:reference:92-salvo-rating";
  validateCustomWeapons(R, [w]);
  assert.match(
    propertyDefinition("Salvo 3", w.propertySources.Salvo).text,
    /restore 1 Salvo/,
  );
  w.propertySources.Salvo = "up-in-arms:reference:126-salvo";
  assert.match(
    propertyDefinition("Salvo 3", w.propertySources.Salvo).text,
    /Reload is unnecessary until Salvo reaches 0/,
  );
  const { s } = calc(w);
  assert.deepEqual(
    validateGMDraft(data, R, JSON.parse(JSON.stringify(s))).customWeapons[0]
      .propertySources,
    w.propertySources,
  );
  w.propertySources.Salvo = "unknown";
  assert.throws(() => validateCustomWeapons(R, [w]), /property provenance/);
});

test("all 100 magical faces resolve exactly once with the approved Dolorous correction", () => {
  assert.equal(WEAPON_EFFECTS.length, 28);
  for (let face = 1; face <= 100; face++) {
    assert.equal(
      WEAPON_EFFECTS.filter((e) => face >= e.min && face <= e.max).length,
      1,
      String(face),
    );
    let first = true;
    const rolled = rollWeaponEnchantment("melee", (sides) => {
      if (first) {
        first = false;
        return face;
      }
      return sides === 100 ? 1 : 3;
    });
    assert.equal(rolled.error, "");
    assert.ok(rolled.effects.length > 0);
  }
  assert.equal(WEAPON_EFFECTS.find((e) => e.name === "Dolorous").min, 29);
  assert.equal(
    WEAPON_EFFECTS.find((e) => e.name === "Alight with Flame").max,
    28,
  );
  assert.deepEqual(
    CREATURE_TARGETS.flatMap((t) =>
      Array.from({ length: t.max - t.min + 1 }, (_, i) => t.min + i),
    ),
    Array.from({ length: 100 }, (_, i) => i + 1),
  );
});
test("Legendary recursion is bounded, capped at five unique abilities, and duplicate draws do not stack", () => {
  const faces = [100, 100, 100, 100, 1, 21, 25, 29, 32];
  const rolled = rollWeaponEnchantment("melee", () => faces.shift());
  assert.equal(rolled.legendary, true);
  assert.equal(rolled.effects.length, 5);
  assert.equal(rolled.rolls.length, 9);
  const duplicate = [100, 1, 1];
  assert.equal(
    rollWeaponEnchantment("melee", () => duplicate.shift()).effects.length,
    1,
  );
  const limit = rollWeaponEnchantment("melee", () => 100);
  assert.match(limit.error, /dice limit/);
  assert.equal(limit.rolls.length, MAX_WEAPON_ROLLS);
  assert.match(rollWeaponEnchantment("melee", () => 0).error, /Invalid/);
});
test("Bane target and ranged Hoarfrost ammunition use their own actual dice and citations", () => {
  const faces = [88, 100];
  const bane = rollWeaponEnchantment("ranged", () => faces.shift());
  assert.equal(bane.effects[0].target, "Jabberslythes");
  assert.deepEqual(
    bane.rolls.map((r) => r.source.page),
    [58, 55],
  );
  const frost = [99, 7];
  const rolled = rollWeaponEnchantment("ranged", () => frost.shift());
  assert.equal(rolled.ammunition, 7);
  const ignored = [100, 99, 1];
  const legend = rollWeaponEnchantment("ranged", () => ignored.shift());
  assert.equal(legend.ammunition, 0);
  assert.equal(legend.effects.length, 1);
  assert.equal(legend.rolls.length, 3);
});
test("independent weapons add one attack and Gear entry without changing the catalogue or printed attacks", () => {
  const original = structuredClone(R.weapons),
    before = calculateGM(data, R, draft());
  const w = weapon();
  w.name = "Captain’s blade";
  w.damage = "SB+5";
  w.quantity = 2;
  const { s, r } = calc(w),
    a = r.attacks.find((a) => a.key === w.key);
  assert.deepEqual(
    r.attacks.filter((a) => a.key !== w.key),
    before.attacks,
  );
  assert.equal(a.damage, Math.floor(r.stats.S / 10) + 5);
  assert.equal(r.gear.filter((g) => g.key === w.key).length, 1);
  assert.equal(gearLines(r).filter((l) => l.includes(w.name)).length, 1);
  assert.ok(gearLines(r).includes(`2 × ${w.name}`));
  assert.deepEqual(validateGMDraft(data, R, JSON.parse(JSON.stringify(s))), s);
  assert.deepEqual(R.weapons, original);
});
test("ordinary damage notation, No Damage and parenthesised properties retain their meaning", () => {
  for (const [formula, damage] of [
    ["SB+4", 8],
    ["+SB+6", 10],
    ["TB+2", 5],
    ["9", 9],
    ["+10", 10],
    ["SB-1", 3],
    ["—", null],
    ["-", null],
  ])
    assert.deepEqual(damageFormula(formula, { S: 40, T: 30 }), {
      valid: true,
      damage,
    });
  for (const text of [
    "2d10",
    "SB+2*3",
    "Infinity",
    "alert(1)",
    "9999999999999999",
  ])
    assert.equal(damageFormula(text, {}).valid, false);
  assert.deepEqual(
    splitWeaponProperties("Inflict (Entangled, Strength), Undamaging"),
    ["Inflict (Entangled, Strength)", "Undamaging"],
  );
  const w = weapon("Net");
  assert.equal(calc(w).r.attacks.find((a) => a.key === w.key).damage, null);
});
test("rune Damage and attack bonuses are local, stack by inscription, and disappear on removal", () => {
  const w = weapon();
  w.power = "runic";
  w.runes = [rune("Rune of Cleaving", 2), rune("Rune of Striking")];
  validateCustomWeapons(R, [w]);
  const before = resolveCustomWeapon(
    R,
    weapon(),
    { S: 40, T: 30, WS: 45, BS: 30 },
    [],
  );
  const runic = resolveCustomWeapon(R, w, { S: 40, T: 30, WS: 45, BS: 30 }, []);
  assert.equal(runic.attack.damage, before.attack.damage + 2);
  assert.equal(runic.attack.skill, before.attack.skill + 10);
  assert.ok(runic.properties.includes("Magical"));
  const { s, r } = calc(w);
  assert.deepEqual(r.stats, calculateGM(data, R, draft()).stats);
  assert.equal(
    r.runes.length,
    0,
    "Owning runic equipment teaches no rune knowledge",
  );
  s.customWeapons = [];
  assert.deepEqual(
    calculateGM(data, R, s).attacks,
    calculateGM(data, R, draft()).attacks,
  );
});
test("forms, Master Runes, material, repeat counts and parameters enforce the printed restrictions", () => {
  const w = weapon();
  w.power = "runic";
  w.runes = [rune("Rune of Cleaving", 3), rune("Rune of Striking")];
  assert.throws(() => validateCustomWeapons(R, [w]), /three/);
  w.runes = [rune("Master Rune of Haste"), rune("Master Rune of Breaking")];
  assert.throws(() => validateCustomWeapons(R, [w]), /one Master/);
  w.runes = [rune("Grudge Rune")];
  assert.throws(() => validateCustomWeapons(R, [w]), /target/);
  w.runes[0].target = "Blood Grudge: Clan Skryre";
  validateCustomWeapons(R, [w]);
  w.runes = [rune("Rune of Cleaving")];
  w.kind = "ranged";
  w.group = "Bow";
  w.reach = "40 yards";
  assert.throws(() => validateCustomWeapons(R, [w]), /melee/);
  const spear = weapon("Spear (2H)");
  spear.power = "runic";
  spear.runes = [rune("Rune of Cleaving")];
  assert.throws(() => validateCustomWeapons(R, [spear]), /form exception/);
  spear.formException = "GM permits a permanently inscribed steel spearhead.";
  validateCustomWeapons(R, [spear]);
  const wrong = weapon();
  wrong.power = "runic";
  wrong.runes = [
    {
      id: R.runes.find((r) => r.form === "Armour").contentId,
      count: 1,
      target: "",
    },
  ];
  assert.throws(() => validateCustomWeapons(R, [wrong]), /correct form/);
});
test("Engineering runes need explicitly Dwarf-built cannon bases and obey the Salvo Reload exception", () => {
  const w = weapon("Cannon (small)");
  w.power = "runic";
  w.surface = "artillery";
  w.runes = [rune("Rune of Reloading", 3)];
  w.properties = ["Reload 4", "Salvo 3"];
  assert.throws(() => validateCustomWeapons(R, [w]), /Dwarf-built/);
  w.dwarfArtillery = true;
  validateCustomWeapons(R, [w]);
  assert.ok(
    resolveCustomWeapon(R, w, { S: 30, WS: 30, BS: 40 }).properties.includes(
      "Reload 1",
    ),
  );
  w.properties = ["Reload 4"];
  assert.ok(
    !resolveCustomWeapon(R, w, { S: 30, WS: 30, BS: 40 }).properties.some((p) =>
      /^Reload/.test(p),
    ),
  );
  const pistol = weapon("Repeater Pistol");
  pistol.power = "runic";
  pistol.surface = "artillery";
  pistol.dwarfArtillery = true;
  pistol.runes = [rune("Rune of Accuracy")];
  assert.throws(() => validateCustomWeapons(R, [pistol]), /cannon base/);
});
test("granted properties deduplicate while conditional Wounds and bearer effects do not change Damage or NPC statistics", () => {
  const w = weapon();
  w.power = "magical";
  w.properties = ["Fast"];
  w.effects = [
    effect("Of Leaping Gold"),
    effect("Of Ceaseless Cleaving"),
    effect("Of Deft and Cunning"),
  ];
  w.legendary = true;
  validateCustomWeapons(R, [w]);
  const plain = resolveCustomWeapon(R, weapon(), { S: 40, WS: 45, BS: 30 });
  const enchanted = resolveCustomWeapon(R, w, { S: 40, WS: 45, BS: 30 });
  assert.equal(enchanted.properties.filter((p) => p === "Fast").length, 1);
  assert.equal(enchanted.attack.damage, plain.attack.damage);
  assert.equal(enchanted.attack.skill, plain.attack.skill);
  assert.match(enchanted.attack.text, /2 additional Wounds/);
  assert.match(enchanted.attack.text, /\+20 WS or BS/);
});
test("ranged Hoarfrost creates separate ammunition without changing the launcher's properties or Damage", () => {
  const w = weapon("Bow (2H)");
  w.power = "magical";
  w.effects = [effect("Hoarfrost Blade")];
  w.ammunition = 7;
  const { s, r } = calc(w);
  validateGMDraft(data, R, s);
  const a = r.attacks.find((a) => a.key === w.key);
  assert.ok(!a.text.split(" · ")[1].includes("Magical"));
  assert.equal(r.gear.find((g) => g.ammunition).quantity, 7);
  assert.ok(gearLines(r).some((l) => l.startsWith("7 × Hoarfrost ammunition")));
  w.legendary = true;
  assert.throws(() => validateCustomWeapons(R, [w]), /Legendary ranged/);
});
test("craftsmanship arithmetic preserves unknown Encumbrance and rejects impossible negative results", () => {
  const w = weapon();
  w.properties = ["Lightweight"];
  assert.equal(resolveCustomWeapon(R, w, {}).enc, 0);
  w.enc = 0;
  assert.match(customWeaponIssues(R, w).join(" "), /Encumbrance/);
  w.enc = null;
  validateCustomWeapons(R, [w]);
  assert.equal(resolveCustomWeapon(R, w, {}).enc, null);
  w.enc = 1;
  w.properties = ["Bulky"];
  assert.equal(resolveCustomWeapon(R, w, {}).enc, 2);
});
test("legacy drafts default custom weapons only when missing, and malformed imports remain rejected", () => {
  const old = draft();
  delete old.customWeapons;
  assert.deepEqual(validateGMDraft(data, R, old).customWeapons, []);
  assert.ok(!Object.hasOwn(old, "customWeapons"));
  for (const customWeapons of [null, {}, false])
    assert.throws(
      () => validateGMDraft(data, R, { ...draft(), customWeapons }),
      /custom weapon/i,
    );
  const s = draft();
  s.customWeapons = [weapon()];
  for (const change of [
    (w) => (w.quantity = 0),
    (w) => (w.extra = "unexpected"),
    (w) => (w.power = "chaos"),
    (w) => (w.properties = ["Made up property"]),
    (w) => (w.base.source.book = "fake"),
    (w) => (w.base.qualities = "Magical"),
    (w) => (w.effects = [{ id: "unknown", target: "" }]),
    (w) => (w.rolls = [{ face: 0, sides: 100 }]),
    (w) => (w.material = "Sand"),
  ]) {
    const copy = structuredClone(s);
    change(copy.customWeapons[0]);
    assert.throws(() => validateGMDraft(data, R, copy));
  }
  const duplicate = structuredClone(s);
  duplicate.gear = [
    { key: s.customWeapons[0].key, id: s.customWeapons[0].baseId, quantity: 1 },
  ];
  assert.throws(
    () => validateGMDraft(data, R, duplicate),
    /duplicate added row/,
  );
});
test("custom weapons use normal Size/Talent maths and existing explicit attack overrides", () => {
  const w = weapon(),
    { s, r } = calc(w);
  s.size = "Large";
  const large = calculateGM(data, R, s).attacks.find((a) => a.key === w.key);
  assert.ok(large.damage > r.attacks.find((a) => a.key === w.key).damage);
  s.talents.push({
    key: "gm-mighty",
    name: "Strike Mighty Blow",
    ranks: 1,
    origin: "GM",
  });
  const mighty = calculateGM(data, R, s).attacks.find((a) => a.key === w.key);
  assert.equal(mighty.damage, large.damage + 1);
  s.attackOverrides[w.key] = { skill: 72, damage: 19 };
  validateGMDraft(data, R, s);
  const manual = calculateGM(data, R, s).attacks.find((a) => a.key === w.key);
  assert.equal(manual.skill, 72);
  assert.equal(manual.damage, 19);
});
test("full sheets and measured-card sections contain complete custom effects and exactly one custom Gear line", () => {
  const w = weapon();
  w.name = "Icewatch relic";
  w.power = "magical";
  w.effects = [effect("Hoarfrost Blade")];
  w.notes = "Distinctive etched blade.";
  const { s, r } = calc(w);
  const sheet = Object.fromEntries(sheetSections(r, s)),
    card = Object.fromEntries(cardSections(r, s));
  for (const text of [sheet.Attacks.join("\n"), card.Attacks]) {
    assert.match(text, /Hoarfrost Blade/);
    assert.match(text, /twice the normal Wounds, plus 4/);
    assert.match(text, /Distinctive etched blade/);
  }
  assert.equal(gearLines(r).filter((l) => l.includes(w.name)).length, 1);
});
