import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as PDFLib from "pdf-lib";
import { createGMRules, gmCatalogue } from "../dist/gm/books.mjs";
import {
  freshGM,
  calculateGM,
  validateGMDraft,
  magicChoices,
} from "../dist/gm/model.mjs";
import { pickerEntries, traitParameter } from "../dist/gm/views.mjs";
import { sheetSections } from "../dist/gm/pdf.mjs";
import { prepareGMPrint, cardSections } from "../dist/gm/print.mjs";
const json = async (p) =>
  JSON.parse(await readFile(new URL(p, import.meta.url), "utf8"));
const [library, data, raw] = await Promise.all([
  json("../dist/data/book-library.json"),
  json("../dist/gm/data.json"),
  json("../dist/gm/sources/archives-ii.json"),
]);
const rulesFor = createGMRules(library, data);
const draft = (name) =>
  freshGM(data, data.profiles.find((p) => p.name === name).id, [
    "core",
    "archives-ii",
  ]);
const result = (s) => calculateGM(data, rulesFor(s), s);
const caster = (s) =>
  s.traits.push({
    key: "gm-maw",
    name: "Spellcaster",
    value: "The Great Maw",
    origin: "GM",
  });

test("Archives II adds only the two reviewed unnamed foundations, opt-in, using shared book data", () => {
  assert.equal(gmCatalogue(data).profiles.length, 49);
  assert.equal(gmCatalogue(data, ["core", "archives-ii"]).profiles.length, 51);
  assert.deepEqual(
    raw.profiles.map((p) => p.name),
    ["Rhinox", "Typical Sister"],
  );
  assert.equal(raw.training.length, 0);
  assert.equal(
    raw.source.sha256,
    "95944ec217df9982aac83cfa7a6020706f23eb13fda0c8498ee349fba91f132b",
  );
  const R = rulesFor(draft("Ogre")),
    core = rulesFor(freshGM(data));
  assert.deepEqual(
    R.weapons.filter((w) => w.source.book === "core"),
    core.weapons.filter((w) => w.source.book === "core"),
  );
  assert.equal(
    R.weapons.filter((w) => w.source.book === "archives-ii").length,
    8,
  );
  assert.equal(
    R.market.filter((w) => w.source.book === "archives-ii").length,
    12,
  );
  assert.ok(
    pickerEntries(data, R, result(draft("Ogre")), "skill").some(
      (x) => x.name === "Ride (Rhinox)",
    ),
  );
  assert.ok(
    pickerEntries(data, R, result(draft("Ogre")), "talent").some(
      (x) => x.name === "Vice (Food)" && x.adaptation,
    ),
  );
});
test("Rhinox preserves 50 Wounds with Hardy once, primary +15 and charging Horns +10", () => {
  const s = draft("Rhinox");
  let r = result(s);
  assert.equal(r.wounds, 50);
  assert.equal(r.tb, 5);
  assert.deepEqual(r.issues, []);
  assert.deepEqual(
    r.attacks.map((a) => [a.name, a.damage]),
    [
      ["Weapon", 15],
      ["Horns (10)", 10],
    ],
  );
  assert.match(r.attacks[1].text, /Charging/);
  assert.deepEqual(r.ap, { Head: 2, Body: 2, Forelegs: 2, "Rear Legs": 2 });
  assert.equal(r.talents.find((t) => t.name === "Hardy").ranks, 1);
  assert.match(
    r.traits.find((t) => t.name === "Frenzy").adaptation,
    /Proposed/,
  );
  assert.match(
    r.traits.find((t) => t.name === "Sprinter").adaptation,
    /Stride/,
  );
  assert.ok(
    !r.traits.some(
      (t) => t.name === "Trained" || t.name === "Tracker" || t.name === "Hardy",
    ),
  );
  s.recalculate = true;
  assert.equal(result(s).wounds, 50);
  s.removed.push(r.talents.find((t) => t.name === "Hardy").key);
  assert.equal(result(s).wounds, 40);
  s.stats.S = 70;
  r = result(s);
  assert.equal(r.attacks[1].damage, 11);
  assert.equal(r.attacks[0].damage, 17);
  s.removed.push(r.traits.find((t) => t.name === "Horns").key);
  assert.ok(!result(s).attacks.some((a) => a.name.startsWith("Horns")));
});
test("Rhinox optional training applies once and describes actual selections only", () => {
  const s = draft("Rhinox");
  s.traits.push({
    key: "gm-training",
    name: "Trained",
    value: "Broken, Mount, War",
    origin: "GM",
  });
  s.brokenRoll = [6, 6];
  const r = result(s);
  assert.equal(r.stats.WS, 65);
  assert.equal(r.stats.Fel, 32);
  assert.deepEqual(r.issues, []);
  const t = r.traits.find((t) => t.name === "Trained");
  assert.match(t.description, /Broken:|Mount:|War:/);
  assert.doesNotMatch(t.description, /Fetch:|Guard:|Drive:/);
  assert.equal(result(s).stats.WS, 65);
});
test("Typical Sister retains exact printed totals and compatible core Talents without invented attacks or magic", () => {
  const s = draft("Typical Sister"),
    r = result(s);
  assert.equal(r.wounds, 12);
  assert.equal(r.skills.find((x) => x.name === "Research").total, 30);
  assert.equal(r.skills.length, 10);
  assert.equal(r.talents.length, 5);
  assert.deepEqual(r.attacks, []);
  assert.deepEqual(r.spells, []);
  assert.deepEqual(r.armour, []);
  assert.deepEqual(r.issues, []);
  assert.ok(!r.profile.adaptation);
  assert.ok(r.talents.every((t) => !t.adaptation));
  assert.match(r.trappings, /Silver Dove/);
  s.stats.Int = 40;
  assert.equal(result(s).skills.find((x) => x.name === "Research").total, 35);
});
test("Great Maw is Ogre-only, uses Toughness for Magick, and rejects illegal Ogre Lores with routed issues", () => {
  const s = draft("Ogre"),
    R = rulesFor(s);
  caster(s);
  let r = result(s);
  assert.deepEqual(r.issues, []);
  assert.equal(r.skills.find((x) => x.name === "Language (Magick)").char, "T");
  assert.equal(
    r.skills.find((x) => x.name === "Language (Magick)").total,
    r.stats.T + 10,
  );
  assert.equal(
    magicChoices(R, r).filter((x) => x.category === "The Great Maw").length,
    7,
  );
  assert.equal(
    pickerEntries(data, R, r, "skill").find(
      (x) => x.name === "Language (Magick)",
    ).char,
    "T",
  );
  const html = traitParameter(
    data,
    R,
    r.traits.find((x) => x.name === "Spellcaster"),
    r.profile,
  );
  assert.match(html, /The Great Maw/);
  assert.match(html, /value="Fire"[^>]*disabled/);
  s.spells = [
    magicChoices(R, r).find((x) => x.name === "Bullgorger").contentId,
  ];
  r = result(s);
  assert.ok(r.spells[0].adaptation);
  assert.deepEqual(r.issues, []);
  s.traits[0].value = "Fire";
  r = result(s);
  assert.ok(
    r.issues.some(
      (x) => x.code === "magic.species" && x.control.target === "#trait-gm-maw",
    ),
  );
  assert.ok(!magicChoices(R, r).some((x) => x.category === "Fire"));
  for (const name of ["Human", "Rhinox"]) {
    const non = draft(name);
    caster(non);
    const x = result(non);
    assert.ok(x.issues.some((i) => i.code === "magic.species"));
    assert.ok(
      !magicChoices(rulesFor(non), x).some(
        (z) => z.category === "The Great Maw",
      ),
    );
    assert.ok(
      pickerEntries(data, rulesFor(non), x, "talent").find(
        (t) => t.name === "Arcane Magic (The Great Maw)",
      ).disabled,
    );
  }
  const core = freshGM(data, data.profiles.find((p) => p.name === "Ogre").id);
  assert.equal(
    pickerEntries(data, rulesFor(core), result(core), "skill").find(
      (x) => x.name === "Language (Magick)",
    ).char,
    "T",
  );
});
test("Ogre equipment preserves native profiles and flags unsupported other-Species use before export", () => {
  const s = draft("Ogre"),
    R = rulesFor(s),
    w = R.weapons.find(
      (w) => w.source.book === "archives-ii" && w.kind === "melee",
    );
  s.gear.push({ key: "gm-weapon", id: w.contentId, quantity: 1 });
  assert.deepEqual(result(s).issues, []);
  const human = draft("Human");
  human.gear = s.gear;
  let r = result(human);
  assert.ok(
    r.issues.some(
      (x) =>
        x.code === "equipment.species" &&
        x.control.target === "#attack-gm-weapon",
    ),
  );
  human.attackOverrides["gm-weapon"] = { skill: 45, damage: 7 };
  r = result(human);
  assert.deepEqual(r.issues, []);
  assert.equal(r.attacks.find((a) => a.key === "gm-weapon").damage, 7);
  const plate = R.armour.find((a) => a.name === "Ogre Gutplate");
  human.gear.push({ key: "gm-plate", id: plate.contentId, quantity: 1 });
  assert.ok(
    result(human).issues.some(
      (x) =>
        x.code === "equipment.species" && x.control.target === "#gear-gm-plate",
    ),
  );
});
test("Archives II saves validate own books; compact sheets omit conversion and optional-Trait notes", async () => {
  const entries = ["Rhinox", "Typical Sister"].map((name) => {
    const s = draft(name);
    assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
    return { s, r: result(s) };
  });
  const hidden = structuredClone(entries[0].s);
  hidden.books = ["core"];
  assert.throws(
    () => validateGMDraft(data, rulesFor(hidden), hidden),
    /enabled GM book/,
  );
  for (const { r, s } of entries) {
    const text =
      JSON.stringify(sheetSections(r, s)) + JSON.stringify(cardSections(r, s));
    assert.doesNotMatch(
      text,
      /Legacy|Proposed|printed Weapon|Fury|Optional Traits|Tracker|equivalence/,
    );
  }
  const batch = await prepareGMPrint(PDFLib, entries, { perPage: 4 });
  assert.deepEqual(batch.overflow, []);
  assert.equal(batch.pages, 1);
});

test("Vice keeps printed targets and the aggregate Willpower Bonus limit", () => {
  const s = draft("Human");
  s.stats.WP = 20;
  for (const target of ["Alcohol", "Food", "Narcotics"])
    s.talents.push({
      key: `gm-vice-${target.toLowerCase()}`,
      name: `Vice (${target})`,
      ranks: 1,
      origin: "GM",
    });
  assert.ok(result(s).issues.some((x) => x.code === "talent.vice-limit"));
  s.talents.pop();
  assert.ok(!result(s).issues.some((x) => x.code === "talent.vice-limit"));
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
});
