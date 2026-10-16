import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library, R as core } from "./fixture.mjs";
import { assembleBooks } from "../dist/books.mjs";
import * as M from "../dist/rules.mjs";
import { creationSpecies } from "../dist/origins.mjs";
import { canonicalName } from "../dist/content-references.mjs";
import { createGMRules } from "../dist/gm/books.mjs";
import {
  freshGM,
  calculateGM,
  validateGMDraft,
  applyTemplate,
  magicChoices,
} from "../dist/gm/model.mjs";
import { templateEligibility } from "../dist/gm/templates.mjs";
import { lustriaSpellIssue } from "../dist/lustria.mjs";

const B = "lustria";
const R = assembleBooks(library, [B]);
const refs = JSON.parse(
  await readFile(
    new URL(
      "../content/sources/data/books/lustria/reference-entries.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

function character(career) {
  const s = M.fresh();
  Object.assign(s, {
    career,
    species: "Human",
    points: Array(10).fill(10),
    name: "Lustria verification",
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

test("four Lustria Careers complete Fifth Edition creation without replacing core Careers or probabilities", () => {
  const careers = R.careers.filter((c) => c.source.book === B);
  assert.equal(careers.length, 4);
  for (const c of careers) {
    assert.deepEqual(
      Object.values(c.advanceScheme).filter(Boolean).sort(),
      [1, 1, 1, 2, 3, 4],
      c.name,
    );
    assert.deepEqual(
      c.levels.map((l) => l.skills.length),
      [10, 6, 4, 2],
      c.name,
    );
    assert.deepEqual(M.validation(R, character(c.id)), [], c.name);
  }
  for (const id of ["lawyer", "mystic"])
    assert.deepEqual(
      R.careers.find((c) => c.id === id),
      core.careers.find((c) => c.id === id),
    );
  assert.deepEqual(R.tables, core.tables);
  assert.deepEqual(R.species, core.species);
  const oracle = careers.find((c) => c.name === "Oracle");
  assert.equal(
    oracle.levels[3].skills.filter((s) => s.startsWith("Channelling")).length,
    1,
  );
  assert.equal(
    oracle.levels[2].talents.filter((t) => t.startsWith("Arcane Magic")).length,
    1,
  );
  assert.equal(canonicalName("talents", "Fleet Footed", B), "Fleet-footed");
});

test("Lustrian weapons retain printed prices and ammunition without supplying poison", () => {
  assert.equal(R.weapons.filter((w) => w.source.book === B).length, 5);
  assert.equal(R.market.filter((w) => w.source.book === B).length, 6);
  const blowpipe = R.weapons.find((w) => w.name === "Blowpipe");
  assert.equal(blowpipe.group, "Blowpipe");
  assert.equal(blowpipe.damage, "0");
  assert.ok(R.config.skillOptions.Ranged.includes("Blowpipe"));
  const darts = R.market.find((w) => w.name === "Blowpipe Dart (12)");
  assert.equal(darts.price, "10/–");
  assert.deepEqual(darts.ammunition, {
    range: "As weapon",
    damage: "+1",
    qualities: "—",
  });
  assert.match(darts.text, /Poison must be obtained separately/);
  assert.match(
    R.weapons.find((w) => w.name === "Eagle Claw").text,
    /Volley fire subtracts 4 Damage.*separate roll for each shot/,
  );
  const fog = R.spells.find((w) => w.name === "Shroud of Fog");
  assert.equal(fog.category, "Shadows");
  assert.equal(fog.target, "AoE (Willpower Bonus Miles)");
  assert.equal(fog.duration, "Willpower minutes");
});

test("shared GM catalogues receive Lustria choices independently of foundation selection", async () => {
  const data = JSON.parse(
    await readFile(new URL("../dist/gm/data.json", import.meta.url), "utf8"),
  );
  const G = createGMRules(library, data)(freshGM(data, data.profiles[0].id));
  assert.ok(
    G.weapons.some((w) => w.name === "Blowpipe" && w.source.book === B),
  );
  assert.ok(
    G.spells.some((w) => w.name === "Shroud of Fog" && w.source.book === B),
  );
  assert.equal(data.profiles.filter((p) => p.source?.book === B).length, 55);
  const all = assembleBooks(
    library,
    library.packs
      .filter((p) => p.manifest.kind !== "variant")
      .map((p) => p.manifest.id),
  );
  assert.equal(all.spells.filter((s) => s.name === "Waterlungs").length, 1);
  assert.notEqual(
    all.spells.find((s) => s.name === "Waterlungs").source.book,
    B,
  );
});

test("mechanical references retain source rules with clean section boundaries", () => {
  assert.equal(refs.length, 54);
  const artillery = refs.filter((r) => r.topic === "Lizardman artillery");
  assert.equal(artillery.length, 5);
  assert.ok(
    artillery.every(
      (r) =>
        r.category === "equipment" && /no Ranged Skill group/.test(r.notes),
    ),
  );
  assert.ok(!R.weapons.some((w) => w.name === "Giant Bow"));
  const find = (name) => refs.find((r) => r.name === name);
  assert.doesNotMatch(
    find("Cloak of Mathlann — Mathlann prayer").text,
    /Arcane Spell|Storm Weavers/,
  );
  assert.match(
    find("Waterlungs — Mathlann prayer").text,
    /only available to Elven Priests/,
  );
  assert.doesNotMatch(find("Tropical Storm").text, /Travel Endeavours/);
  assert.doesNotMatch(
    find("Yellow-Skull Fever").text,
    /New Symptoms|Disorientation/,
  );
  assert.match(find("Organ Failure").text, /1d10 hours/);
  assert.match(find("Stifling Humidity").text, /Endurance Test/);
  assert.match(
    find("Lustrian Weather").text,
    /beginning of each expedition Stage/,
  );
  assert.match(find("Stationary Attacker").text, /\| Monstrous \| Massive \|/);
  assert.equal(refs.filter((r) => r.category === "table").length, 2);
  assert.ok(refs.every((r) => !["profile", "template"].includes(r.category)));
});

const data = JSON.parse(
  await readFile(new URL("../dist/gm/data.json", import.meta.url), "utf8"),
);
const gmRules = createGMRules(library, data);
const draft = (name) =>
  freshGM(
    data,
    data.profiles.find((p) => p.source?.book === B && p.name === name).id,
  );
const gm = (s) => calculateGM(data, gmRules(s), s);

test("generic Lustria foundations preserve sources, core Size conversions and valid named Skills/Talents", () => {
  const profiles = data.profiles.filter((p) => p.source?.book === B);
  assert.equal(profiles.length, 55);
  assert.equal(data.templates.filter((t) => t.source?.book === B).length, 15);
  assert.ok(
    !profiles.some((p) =>
      /Anomoq|Skrolk|Finrian|Fellheart|Crotaz|Tlat.l|Tzku/.test(p.name),
    ),
  );
  const G = gmRules(draft("Skink"));
  for (const p of profiles) {
    for (const row of p.skills)
      assert.ok(M.skillInfo(G, row.name), `${p.name}: ${row.name}`);
    for (const row of [...p.talents, ...(p.optionalTalents || [])])
      assert.ok(M.talentInfo(G, row.name), `${p.name}: ${row.name}`);
    assert.doesNotThrow(
      () => validateGMDraft(data, G, freshGM(data, p.id)),
      p.name,
    );
    for (const a of p.attacks.filter(
      (a) => a.primary && a.printedDamage !== undefined,
    )) {
      const sizeBonus =
        (Math.floor(p.stats.S / 10) || 0) *
        ({ Large: 1, Enormous: 1, Monstrous: 2 }[p.size] || 0);
      assert.equal(a.damage, a.printedDamage + sizeBonus, p.name);
      assert.ok(a.adaptation);
    }
  }
  assert.equal(gm(draft("Skink")).wounds, 4);
  assert.equal(
    gm(draft("Serpents Of Sotek")).wounds,
    45,
    "Swarm retains the core five-times normal formula",
  );
  assert.equal(
    gm(draft("Dread Saurian")).attacks.find((a) => a.name.includes("Weapon"))
      .damage,
    28,
  );
  const tiny = draft("Borer Snake");
  assert.equal(gm(tiny).wounds, 2);
  tiny.stats.T = 30;
  assert.ok(gm(tiny).issues.some((x) => x.control.target === "#gm-wounds"));
});

test("castes and multiple sacred marks stack, with reversible natural armour and distinct Talent choices", () => {
  const s = draft("Skink");
  applyTemplate(s, "lustria:template:martial-caste");
  s.templateSkills = { 1: ["Melee (Basic)"], 3: ["Ranged (Blowpipe)"] };
  s.lustriaMarks = ["lustria:template:chotec", "lustria:template:quetzl"];
  let r = gm(s);
  assert.deepEqual(r.issues, []);
  assert.equal(r.stats.Ag, 60);
  assert.equal(r.stats.I, 60);
  assert.equal(r.stats.BS, 45, "Caste +5 and Marksman +5 each apply once");
  assert.equal(r.stats.T, 30);
  assert.equal(r.wounds, 9);
  assert.equal(r.ap.Body, 3);
  assert.equal(r.skills.find((x) => x.name === "Ranged (Blowpipe)").total, 55);
  assert.equal(r.talents.find((x) => x.name === "Hardy").ranks, 1);
  assert.doesNotThrow(() => validateGMDraft(data, gmRules(s), s));
  s.lustriaMarks = [];
  r = gm(s);
  assert.equal(r.ap.Body, 2);
  assert.equal(r.stats.Ag, 50);
  assert.ok(!r.talents.some((x) => x.name === "Hardy"));
  const krox = draft("Kroxigor");
  const tepok = data.templates.find((t) => t.name === "Tepok");
  assert.ok(templateEligibility(tepok, gm(krox).profile));
  krox.lustriaMarks = [tepok.id];
  assert.throws(
    () => validateGMDraft(data, gmRules(krox), krox),
    /sacred marks/,
  );
});

test("Slann need explicit Lores and retain printed Channelling, without invented spell grants", () => {
  const s = draft("Slann Of The Fifth Generation");
  assert.ok(gm(s).issues.some((x) => x.code === "profile.slann-lores"));
  s.profileLores = ["Beasts", "Heavens"];
  const r = gm(s);
  assert.deepEqual(r.issues, []);
  assert.equal(
    r.skills.find((x) => x.name === "Channelling (Ghur)").total,
    105,
  );
  assert.equal(
    r.skills.find((x) => x.name === "Channelling (Azyr)").total,
    105,
  );
  assert.ok(r.talents.some((x) => x.name === "High Magic"));
  assert.ok(!r.talents.some((x) => x.name === "Blessed by Isha"));
  assert.equal(
    r.talents.find((x) => x.name === "Instinctive Diction").ranks,
    1,
  );
  assert.equal(r.spells.length, 0);
  assert.ok(magicChoices(gmRules(s), r).some((x) => x.name === "Earth Line"));
  assert.doesNotThrow(() => validateGMDraft(data, gmRules(s), s));
  s.stats.WP = 95;
  assert.equal(
    gm(s).skills.find((x) => x.name === "Channelling (Ghur)").total,
    115,
  );
  const relic = draft("Slann Of The First Generation");
  relic.profileLores = ["Death"];
  assert.equal(
    gm(relic).attacks.length,
    0,
    "Relic Priest cannot inflict melee Damage",
  );
});

test("Skink Priest selects one printed Lore and receives core Spellcaster Skills", () => {
  const s = draft("Skink");
  applyTemplate(s, "lustria:template:priest-caste");
  assert.ok(gm(s).issues.some((x) => x.code === "template.skink-lore"));
  s.templateLore = "Heavens";
  const r = gm(s);
  assert.deepEqual(r.issues, []);
  assert.equal(r.skills.find((x) => x.name === "Channelling (Azyr)").total, 50);
  assert.equal(r.skills.find((x) => x.name === "Language (Magick)").total, 55);
  assert.doesNotThrow(() => validateGMDraft(data, gmRules(s), s));
});

test("new magic has explicit access and preserves existing High Elf spell definitions", () => {
  const G = gmRules(draft("Skink"));
  const highElf = assembleBooks(library, ["high-elf"]);
  for (const name of [
    "Apotheosis",
    "Arcane Unforging",
    "Drain Magic",
    "Walk Between Worlds",
    "Waterlungs",
    "Cloak of Mathlann",
  ])
    assert.deepEqual(
      G.spells.find((x) => x.name === name),
      highElf.spells.find((x) => x.name === name),
      name,
    );
  const water = G.spells.find((x) => x.name === "Waterlungs (Mathlann)");
  assert.equal(water.category, "Mathlann");
  assert.equal(lustriaSpellIssue(water, "High Elf"), "");
  assert.ok(lustriaSpellIssue(water, "Human"));
  assert.ok(
    lustriaSpellIssue(
      G.spells.find((x) => x.name === "Earth Line"),
      "High Elf",
    ),
  );
  assert.equal(
    lustriaSpellIssue(
      G.spells.find((x) => x.name === "Earth Line"),
      "Slann",
    ),
    "",
  );
  assert.ok(M.invalidTalent(R, character("priest"), "Bless (Mathlann)"));
  assert.equal(
    G.market.filter((x) => x.source.book === B).length,
    6,
    "Acquired artillery has no invented price",
  );
  assert.match(
    G.spells.find((x) => x.name === "Ruination of Cities").text,
    /20 body Damage/,
  );
});

test("undefined Aquatic stays visible and blocks export until explicitly removed", () => {
  const s = draft("Brainfluke");
  assert.ok(gm(s).issues.some((x) => x.code === "profile.undefined-trait"));
  s.removed.push("unavailable:0");
  assert.deepEqual(gm(s).issues, []);
  assert.doesNotThrow(() => validateGMDraft(data, gmRules(s), s));
  assert.ok(!gm(s).traits.some((x) => x.name === "Aquatic"));
});
