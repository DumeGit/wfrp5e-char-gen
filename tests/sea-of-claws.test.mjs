import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library, R as core } from "./fixture.mjs";
import { assembleBooks, randomTable, tableResult } from "../dist/books.mjs";
import * as M from "../dist/rules.mjs";
import {
  creationSpecies,
  creationBackground,
  careerAvailable,
} from "../dist/origins.mjs";
import { freshGM, calculateGM, validateGMDraft } from "../dist/gm/model.mjs";
import { createGMRules, gmCatalogue } from "../dist/gm/books.mjs";
import { cardSections } from "../dist/gm/print.mjs";

const B = "sea-of-claws";
const R = assembleBooks(library, [B]);
const data = JSON.parse(
  await readFile(new URL("../dist/gm/data.json", import.meta.url), "utf8"),
);
const rulesFor = createGMRules(library, data);
const gm = (name) => freshGM(data, `${B}:creatures:${name}`);
const calc = (s) => calculateGM(data, rulesFor(s), s);
function character(career, origin = "", species = "Human") {
  const s = M.fresh();
  Object.assign(s, {
    career,
    origin,
    species,
    name: "Sea verification",
    xp: 30000,
    wealth: { amount: 100, currency: "gold crowns" },
  });
  const sp = creationSpecies(R, s);
  for (let i = 0; i < sp.talents.length; i++)
    s.talentChoices[`species-${i}`] = M.speciesTalentOptions(R, s, i)[0];
  s.randomTalents = ["Read/Write", "Super Numerate", "Cardsharp", "Attractive"]
    .filter((x) => !Object.values(s.talentChoices).includes(x))
    .slice(0, sp.randomTalents);
  const names = new Set();
  for (const slot of M.speciesSkillSlots(R, s)) {
    if (
      names.has(slot.name) ||
      sp.languages.some((x) => slot.name === `Language (${x})`)
    )
      continue;
    s.speciesSkills.push(slot.key);
    names.add(slot.name);
    if (names.size === 5) break;
  }
  let left = 8;
  for (const slot of M.careerSkillSlots(R, s, 1)) {
    const amount = Math.min(
      left,
      Math.max(0, 3 - (M.freeSkills(R, s)[slot.name] || 0)),
    );
    s.careerSkills[slot.key] = amount;
    left -= amount;
    if (!left) break;
  }
  s.freeTalent = M.careerTalentOptions(R, s).find(
    (t) => !M.freeTalents(R, s).includes(t) && !M.invalidTalent(R, s, t),
  );
  return s;
}

test("Sea is opt-in: nine source paths complete creation and source alternatives preserve core Careers", () => {
  assert.equal(R.careers.filter((c) => c.source.book === B).length, 9);
  for (const c of R.careers.filter((c) => c.source.book === B)) {
    assert.deepEqual(
      Object.values(c.advanceScheme).filter(Boolean).sort(),
      [1, 1, 1, 2, 3, 4],
      c.name,
    );
    assert.deepEqual(M.validation(R, character(c.id)), [], c.name);
  }
  for (const id of ["pilot", "sailor", "wrecker"]) {
    assert.deepEqual(
      R.careers.find((c) => c.id === id),
      core.careers.find((c) => c.id === id),
    );
    assert.ok(
      R.careers.some((c) => c.alternativeFor === id && c.source.book === B),
    );
  }
  assert.equal(R.config.classKit.Seafarer.length, 5);
  assert.ok(!M.talentInfo(R, "Crew Commander").unavailable);
  assert.deepEqual(M.talentInfo(R, "Crew Commander").limit, ["I"]);
});

test("Norse origins use five current Skill grants, printed slots, native languages and sourced naming", () => {
  for (const o of R.origins.filter((x) => x.source.book === B)) {
    const s = character("soldier", o.id, o.species),
      sp = creationSpecies(R, s);
    assert.deepEqual(M.validation(R, s), [], o.name);
    assert.equal(s.speciesSkills.length, 5);
    assert.deepEqual(sp.offsets, core.species[o.species].offsets);
    assert.deepEqual(
      sp.languages,
      o.species === "Human" ? ["Norse"] : ["Khazalid", "Reikspiel"],
    );
    assert.equal(M.freeSkills(R, s)[`Language (${sp.languages[0]})`], 6);
    if (o.species === "Human") {
      assert.equal(sp.randomTalents, 2);
      assert.equal(creationBackground(R, s).forenames[0], "Aeson");
      assert.equal(creationBackground(R, s).surnames[0], "Aesonsson");
    }
  }
});

test("source Career tables cover every face; optional Seafarer rolls do not change default rolls", () => {
  const s = character("soldier");
  assert.deepEqual(
    randomTable(R, s, "career"),
    randomTable(core, M.fresh(), "career"),
  );
  for (const table of R.tables.filter((t) => t.source.book === B)) {
    s.species = table.species;
    s.origin = table.origins?.[0] || "";
    for (let n = 1; n <= 100; n++) {
      const c = R.careers.find((c) => c.id === tableResult(table, n));
      assert.ok(careerAvailable(R, s, c), `${table.name}: ${n}`);
    }
  }
  const norse = R.tables.find((t) => t.id.endsWith("norse-careers"));
  assert.equal(tableResult(norse, 7), "artisan");
  const human = R.tables.find(
    (t) => t.name.includes("Seafarer") && t.species === "Human",
  );
  assert.equal(tableResult(human, 68), `${B}:career:sailor`);
});

test("distinct Chanties share the Intelligence limit, cost normal XP, and cannot repeat a song", () => {
  const s = character(`${B}:career:chantyman`);
  const songs = R.config.talentOptions.Chanty.map((n) => `Chanty (${n})`);
  assert.match(
    M.talentInfo(R, songs[0]).text,
    /individual Tests of every crew member/,
  );
  s.ledger = [{ type: "promotion", name: "Chantyman", cost: 100 }];
  M.purchase(R, s, "talent", songs[0]);
  assert.match(M.invalidTalent(R, s, songs[0]), /already learned/);
  const cap = Math.floor(M.derive(R, s).stats.Int / 10);
  for (const song of songs.slice(1, cap)) {
    assert.equal(M.quote(R, s, "talent", song).cost, 100);
    M.purchase(R, s, "talent", song);
  }
  assert.match(M.invalidTalent(R, s, songs[cap]), /purchase limit/);
  assert.equal(M.derive(R, s).spent, (cap + 1) * 100);
  s.ledger.pop();
  assert.equal(M.invalidTalent(R, s, songs[cap]), "");
  assert.equal(R.spells.filter((x) => x.source.book === B).length, 21);
  assert.equal(
    R.spells.find((x) => x.name === "Seasickness").duration,
    "Strength Bonus hours",
  );
});

test("naval artillery is an explicit PC variant and simultaneously available as named GM alternatives", () => {
  const V = assembleBooks(library, [B, `${B}-artillery`]);
  assert.equal(
    R.weapons.find((w) => w.name === "Cannon (medium)").reach,
    "125 yards",
  );
  assert.equal(
    V.weapons.find((w) => w.name === "Cannon (medium)").reach,
    "75 yards",
  );
  const G = rulesFor(gm("gymmcrab"));
  assert.equal(
    G.weapons.find((w) => w.name === "Cannon (medium)").reach,
    "125 yards",
  );
  assert.equal(
    G.weapons.find((w) => w.name === "Cannon (medium) (Naval artillery)").reach,
    "75 yards",
  );
  assert.equal(
    G.market.find(
      (w) => w.name === "Grapeshot and Powder (Cannon) (Naval artillery)",
    ).ammunition.damage,
    "\u22125",
  );
  const s = gm("gymmcrab"),
    gun = G.weapons.find((w) => w.name === "Cannon (medium) (Naval artillery)");
  s.gear.push({ key: "gm-naval-cannon", id: gun.contentId, quantity: 1 });
  assert.equal(calc(s).gear[0].entry.source.book, `${B}-artillery`);
  assert.doesNotThrow(() =>
    validateGMDraft(data, G, JSON.parse(JSON.stringify(s))),
  );
});

test("Master and Commander and GM Chanties enforce shared printed limits", () => {
  const s = character(`${B}:career:officer`);
  s.ledger = [{ type: "promotion", name: "Officer", cost: 100 }];
  const cap = Math.floor(M.derive(R, s).stats.Fel / 10);
  for (let i = 0; i < cap; i++)
    M.purchase(R, s, "talent", "Master and Commander");
  assert.match(
    M.quote(R, s, "talent", "Master and Commander").error,
    /purchase limit/,
  );
  const g = gm("gymmcrab"),
    songs = R.config.talentOptions.Chanty;
  g.talents.push({
    key: "gm-chanty-one",
    name: `Chanty (${songs[0]})`,
    ranks: 2,
    origin: "GM",
  });
  assert.ok(calc(g).issues.some((x) => x.code === "talent.chanty-song"));
  g.talents[0].ranks = 1;
  const gcap = Math.floor(calc(g).stats.Int / 10);
  for (let i = 1; i <= gcap; i++)
    g.talents.push({
      key: `gm-chanty-${i}`,
      name: `Chanty (${songs[i]})`,
      ranks: 1,
      origin: "GM",
    });
  assert.ok(calc(g).issues.some((x) => x.code === "talent.limit"));
});

test("13 generic foundations are gated, converted explicitly, and use complete actual Trait descriptions", () => {
  assert.equal(
    gmCatalogue(data, ["core", B]).profiles.length -
      gmCatalogue(data).profiles.length,
    13,
  );
  for (const name of ["lurkerfish", "daggerfish"]) {
    const s = gm(name);
    assert.equal(calc(s).wounds, 3);
    s.stats.T = 46;
    assert.ok(calc(s).issues.some((x) => x.control.target === "#gm-wounds"));
    s.wounds = 8;
    assert.equal(calc(s).wounds, 8);
  }
  assert.equal(calc(gm("gymmcrab")).wounds, 4);
  assert.equal(calc(gm("latch-eel")).wounds, 6);
  assert.ok(calc(gm("syreen")).traits.some((t) => t.name === "Frenzy"));
  assert.ok(calc(gm("lurkerfish")).talents.every((t) => t.ranks === 1));
  const elemental = gm("sea-elemental"),
    d = calc(elemental);
  assert.equal(d.stats.Int, null);
  assert.equal(d.stats.WP, null);
  for (const name of ["Language (Magick)", "Channelling (Ghyran)"]) {
    assert.equal(d.skills.find((x) => x.name === name).total, 69);
    assert.equal(d.skills.find((x) => x.name === name).char, "S");
  }
  assert.match(
    d.traits.find((t) => t.name === "Immersion").description,
    /Suffocation/,
  );
  assert.equal(d.spells.length, 2);
  assert.ok(!JSON.stringify(cardSections(d, elemental)).includes("Legacy"));
  elemental.stats.S = 65;
  assert.equal(
    calc(elemental).skills.find((x) => x.name === "Language (Magick)").total,
    75,
  );
  elemental.removed.push(
    data.profiles
      .find((p) => p.id === elemental.profile)
      .traits.find((t) => t.name === "Mindless Spellcaster").key,
  );
  assert.ok(!calc(elemental).skills.some((x) => x.char === "S"));
});

test("Leech Wyrm missing Vomit score is an early export issue resolved only by a manual choice", () => {
  const s = gm("leech-wyrm"),
    d = calc(s);
  assert.equal(d.stats.BS, null);
  const attack = d.attacks.find((a) => a.name === "Vomit");
  assert.ok(
    d.issues.some((x) => /Vomit needs an attack score/.test(x.message)),
  );
  s.attackOverrides[attack.key] = { skill: 40 };
  assert.ok(!calc(s).issues.some((x) => /Vomit needs/.test(x.message)));
  assert.equal(calc(s).attacks.find((a) => a.name === "Vomit").skill, 40);
  assert.doesNotThrow(() => validateGMDraft(data, rulesFor(s), s));
});
