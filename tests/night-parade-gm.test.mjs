import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as PDFLib from "pdf-lib";
import {
  freshGM,
  calculateGM,
  applyTemplate,
  validateGMDraft,
} from "../dist/gm/model.mjs";
import { createGMRules, gmCatalogue } from "../dist/gm/books.mjs";
import { templateEligibility, templateRowKey } from "../dist/gm/templates.mjs";
import { templateOverview, workspace } from "../dist/gm/views.mjs";
import { createGMPDF, sheetSections } from "../dist/gm/pdf.mjs";
import { cardSections } from "../dist/gm/print.mjs";

const json = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const data = await json("../dist/gm/data.json"),
  library = await json("../dist/data/book-library.json");
const rulesFor = createGMRules(library, data);
const draft = (profile = "Skeleton", name = "") => {
  const s = freshGM(data, data.profiles.find((p) => p.name === profile).id, [
    "core",
    "night-parade",
  ]);
  if (name) applyTemplate(s, data.templates.find((t) => t.name === name).id);
  return s;
};
const result = (s) => calculateGM(data, rulesFor(s), s);
function complete(s, lore = "Death") {
  const t = data.templates.find((t) => t.id === s.template),
    R = rulesFor(s);
  for (const [i, slot] of t.skills.entries())
    if (slot.options.length > 1)
      s.templateSkills[i] = [
        slot.options.find((n) => n === "Channelling (Shyish)") ||
          slot.options[0],
      ];
  for (const [i, slot] of t.talents.entries())
    if (slot.options.length > 1)
      s.templateTalents[i] = `Arcane Magic (${lore})`;
  for (const [i, slot] of t.gear.entries())
    if (slot.choose)
      s.templateGear[i] =
        slot.options.find((x) =>
          /Quarterstaff|Medium Armour|Shield/.test(x.name),
        )?.id || slot.options[0].id;
  for (const group of t.magicGroups || [])
    s.spells.push(
      ...R.spells
        .filter((x) => group.categories.includes(x.category) && !x.ritual)
        .slice(0, group.count)
        .map((x) => x.contentId),
    );
  return s;
}

test("one opt-in foundation, seven templates, shared Ride choices and no named characters", () => {
  const off = gmCatalogue(data),
    on = gmCatalogue(data, ["core", "night-parade"]);
  assert.equal(on.profiles.length - off.profiles.length, 1);
  assert.equal(on.templates.length - off.templates.length, 7);
  assert.deepEqual(
    on.profiles
      .filter((p) => p.source?.book === "night-parade")
      .map((p) => p.name),
    ["Corpse Cart"],
  );
  assert.ok(
    !data.profiles.some((p) => /Jasper|Mheava|Charnel|Herald/.test(p.name)),
  );
  const R = rulesFor(draft());
  for (const name of ["Rotting Mount", "Skeletal Steed", "Corpse Cart"])
    assert.ok(R.config.skillOptions.Ride.includes(name));
  assert.ok(
    !templateEligibility(
      data.templates.find((t) => t.name === "Wight"),
      on.profiles.find((p) => p.name === "Zombie"),
    ),
  );
  assert.match(
    templateEligibility(
      data.templates.find((t) => t.name === "Liche Lord"),
      on.profiles.find((p) => p.name === "Human"),
    ),
    /Zombie/,
  );
});
test("Mass Grave Dead sets BS, adds Swarm once and permits removal without corrupting saves", () => {
  const s = draft("Skeleton", "Mass Grave Dead"),
    r = result(s);
  assert.equal(r.stats.BS, 0);
  assert.equal(r.stats.WS, 35);
  assert.equal(r.wounds, 100);
  assert.ok(
    r.traits.some(
      (t) => t.name === "Corruption" && t.value === "Minor" && t.adaptation,
    ),
  );
  assert.deepEqual(r.issues, []);
  s.size = "Large";
  assert.equal(result(s).stats.S, 50);
  assert.equal(result(s).wounds, 100);
  s.removed.push(r.traits.find((t) => t.name === "Swarm").key);
  assert.equal(result(s).stats.WS, 25);
  assert.ok(!result(s).swarm);
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
});
test("Liches restore approved scores, match explicit Wind/Lore and validate separate spell lists", () => {
  const s = draft("Zombie", "Liche Corpsemaster");
  assert.equal(result(s).stats.Int, 40);
  assert.equal(result(s).stats.BS, 20);
  assert.ok(!result(s).traits.some((t) => t.name === "Construct"));
  assert.ok(
    result(s).issues.some(
      (x) => x.code === "template.spells" && x.source.book === "night-parade",
    ),
  );
  complete(s);
  assert.deepEqual(result(s).issues, []);
  assert.equal(result(s).wounds, 19);
  s.templateSkills[0] = ["Channelling (Aqshy)"];
  assert.ok(
    result(s).issues.some(
      (x) =>
        x.code === "template.wind" && x.control.target === "#template-skill-0",
    ),
  );
  s.templateSkills[0] = ["Channelling (Shyish)"];
  s.spells.pop();
  assert.ok(result(s).issues.some((x) => x.code === "template.spells"));
  const lord = complete(draft("Zombie", "Liche Lord")),
    r = result(lord);
  assert.deepEqual(r.issues, []);
  assert.equal(r.wounds, 25);
  assert.equal(r.talents.find((x) => x.name === "Menacing").ranks, 1);
  assert.match(
    r.talents.find((x) => x.name === "Menacing").adaptation,
    /Menacing 2/,
  );
  assert.doesNotThrow(() =>
    validateGMDraft(data, rulesFor(lord), JSON.parse(JSON.stringify(lord))),
  );
});
test("Wights have usable mental scores, actual gear and one Strike Mighty Blow rank", () => {
  for (const name of ["Wight", "Wight Champion"]) {
    const s = complete(draft("Skeleton", name)),
      r = result(s);
    assert.ok(r.stats.WP > 0);
    assert.ok(!r.traits.some((x) => x.name === "Construct"));
    assert.ok(r.skills.some((x) => x.name === "Leadership"));
    assert.equal(r.gear.length, 3);
    assert.equal(r.attacks.filter((x) => x.name === "Hand Weapon").length, 1);
    assert.deepEqual(r.issues, []);
    assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
    s.removed.push(r.gear[0].key);
    assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
    assert.equal(result(s).gear.length, 2);
    assert.deepEqual(result(s).issues, []);
    if (name.includes("Champion"))
      assert.equal(
        r.talents.find((x) => x.name === "Strike Mighty Blow").ranks,
        1,
      );
  }
});
test("mount transforms keep absent BS, halve ratings, remove Fly and require explicit negative-score correction", () => {
  const s = draft("Demigryph Mount", "Skeletal Steed"),
    r = result(s);
  assert.equal(r.stats.Int, null);
  assert.equal(r.stats.BS, null);
  assert.ok(!r.traits.some((x) => x.name === "Fly"));
  assert.ok(r.armour.some((x) => x.origin === "Template" && x.ap === 2));
  assert.ok(r.ap.Body >= 2);
  assert.deepEqual(r.issues, []);
  const rot = draft("Riding Horse", "Rotting Mount");
  assert.equal(result(rot).stats.WS, 12);
  assert.ok(result(rot).issues.some((x) => x.control.target === "#stat-I"));
  rot.stats.I = 30;
  assert.equal(result(rot).stats.I, 5);
  assert.deepEqual(result(rot).issues, []);
  assert.match(templateOverview(result(rot).template), /round down/);
  const changed = structuredClone(data);
  const horse = changed.profiles.find((p) => p.id === rot.profile);
  horse.traits.push({
    name: "Fly",
    value: "31",
    key: "test-fly",
    origin: "Printed",
  });
  assert.equal(
    calculateGM(changed, rulesFor(rot), rot).traits.find(
      (t) => t.name === "Fly",
    ).value,
    "15",
  );
});
test("Corpse Cart has five +11 attacks, no Die Hard/Rear, actual-only descriptions and brazier replacement", async () => {
  const s = draft("Corpse Cart"),
    r = result(s);
  assert.deepEqual(r.issues, []);
  assert.equal(r.wounds, 36);
  assert.equal(r.attacks.length, 5);
  assert.ok(r.attacks.every((x) => x.damage === 11));
  assert.ok(
    !r.traits.some((x) =>
      ["Die Hard", "Rear", "Balefire Brazier"].includes(x.name),
    ),
  );
  assert.ok(r.warnings.some((x) => /Die Hard is removed/.test(x)));
  assert.equal(r.traits.find((x) => x.name === "Corruption").value, "Moderate");
  assert.match(
    r.traits.find((x) => x.name === "Vigor Mortis").description,
    /\+20/,
  );
  s.traits.push({
    name: "Balefire Brazier",
    value: "",
    key: "gm-brazier",
    origin: "GM",
  });
  const b = result(s),
    text = JSON.stringify(cardSections(b, s));
  assert.doesNotMatch(
    b.traits.find((x) => x.name === "Vigor Mortis").description,
    /\+20/,
  );
  assert.match(text, /−20/);
  assert.doesNotMatch(text, /Die Hard|Legacy|discrepancy|Optional Traits/);
  assert.ok(b.traits.some((x) => x.name === "Unstable"));
  assert.match(JSON.stringify(sheetSections(b, s)), /Balefire/);
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
  const bytes = await createGMPDF(PDFLib, b, s);
  assert.ok((await PDFLib.PDFDocument.load(bytes)).getPageCount() >= 1);
  s.traits.push({
    name: "Disease",
    value: "",
    key: "gm-disease",
    origin: "GM",
  });
  assert.ok(result(s).issues.some((x) => /Disease/.test(x.message)));
  s.traits.at(-1).value = "Ratte Fever";
  assert.deepEqual(result(s).issues, []);
});
test("template dependent fields validate, reset and restore through complete snapshots", () => {
  const s = complete(draft("Skeleton", "Wight")),
    snapshot = structuredClone(s);
  applyTemplate(s, "");
  assert.deepEqual(s.templateGear, {});
  assert.deepEqual(s.templateSkills, {});
  assert.deepEqual(result(snapshot).issues, []);
  assert.doesNotThrow(() =>
    validateGMDraft(data, rulesFor(snapshot), snapshot),
  );
  snapshot.templateGear[100] = "missing";
  assert.throws(
    () => validateGMDraft(data, rulesFor(snapshot), snapshot),
    /equipment/,
  );
  const hidden = complete(draft("Skeleton", "Wight"));
  hidden.books = ["core"];
  assert.throws(
    () => validateGMDraft(data, rulesFor(hidden), hidden),
    /enabled GM book/,
  );
});
