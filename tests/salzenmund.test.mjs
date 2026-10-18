import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library, R as core } from "./fixture.mjs";
import { assembleBooks } from "../src/engine/books.mjs";
import { creationSpecies } from "../src/engine/origins.mjs";
import * as M from "../src/engine/rules.mjs";
import { createGMRules } from "../src/engine/gm/books.mjs";
import { addGMSupplement } from "../src/engine/gm/content.mjs";
import { templateEligibility } from "../src/engine/gm/templates.mjs";
import { freshGM, calculateGM, validateGMDraft, applyTemplate } from "../src/engine/gm/model.mjs";

const B = "salzenmund";
const R = assembleBooks(library, [B]);
const load = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const data = await load("../public/gm/data.json");
const gmRules = createGMRules(library, data);
const refs = await load("../content/sources/data/books/salzenmund/reference-entries.json");
const raw = await load("../content/sources/gm/books/salzenmund.json");
const draft = (name) => freshGM(data, data.profiles.find((p) => p.source?.book === B && p.name === name).id);
const gm = (s) => calculateGM(data, gmRules(s), s);
const talent = (s, name) => gm(s).talents.find((x) => x.name === name);

test("regional origins retain native languages and five Talent slots; Nordlander Doomed/random is exclusive", () => {
  assert.equal(R.origins.filter((x) => x.source.book === B).length, 4);
  for (const o of R.origins.filter((x) => x.source.book === B)) {
    const s = Object.assign(M.fresh(), { origin: o.id, species: o.species });
    const sp = creationSpecies(R, s);
    assert.equal(sp.talents.length + sp.randomTalents, 5, o.name);
    assert.deepEqual(sp.languages, o.species === "Human" ? ["Reikspiel"] : ["Khazalid", "Reikspiel"]);
    assert.ok(o.adaptation);
  }
  const s = Object.assign(M.fresh(), { origin: "salzenmund:origin:nordlander", species: "Human" });
  assert.equal(creationSpecies(R, s).randomTalents, 2);
  assert.ok(creationSpecies(R, s).talents.flat().includes("Doomed"));
  s.originTalentMode = "random";
  assert.equal(creationSpecies(R, s).randomTalents, 3);
  assert.ok(!creationSpecies(R, s).talents.flat().includes("Doomed"));
  assert.ok(R.config.skillOptions.Trade.includes("Silversmith"));
  assert.ok(R.config.skillOptions.Lore.includes("Nordland"));
});

test("Owler is an explicit Riverfolk choice with its visually verified scheme; core Smuggler and Career rolls remain intact", () => {
  const c = R.careers.find((x) => x.id === "salzenmund:career:owler");
  assert.equal(c.class, "Riverfolk");
  assert.deepEqual(c.species, ["Dwarf", "Halfling", "High Elf", "Human"]);
  assert.deepEqual(c.advanceScheme, { WS: 2, BS: null, S: null, T: 1, I: 3, Ag: 1, Dex: null, Int: 4, WP: 1, Fel: null });
  assert.deepEqual(c.levels.map((x) => x.skills.length), [10, 6, 4, 2]);
  assert.ok(c.levels[2].talents.includes("Seasoned Traveller"));
  assert.ok(c.levels[0].talents.includes("Striding Gait (Forests)"));
  assert.ok(c.levels[3].talents.includes("Striding Gait (Mountains)"));
  assert.deepEqual(R.careers.find((x) => x.id === "smuggler"), core.careers.find((x) => x.id === "smuggler"));
  assert.deepEqual(R["career-rolls"], core["career-rolls"]);
  const s = Object.assign(M.fresh(), {
    species: "Human", points: Array(10).fill(10),
    career: c.id, name: "Salzenmund verification", origin: "salzenmund:origin:nordlander",
    randomTalents: ["Read/Write", "Super Numerate"], freeTalent: "Strong Back",
    wealth: { amount: 10, currency: "brass pennies" },
  });
  const sp = creationSpecies(R, s);
  sp.talents.forEach((slot, i) => { s.talentChoices[`species-${i}`] = slot[0]; });
  const names = new Set();
  for (const slot of M.speciesSkillSlots(R, s)) {
    if (names.has(slot.name) || sp.languages.some((n) => slot.name === `Language (${n})`)) continue;
    s.speciesSkills.push(slot.key); names.add(slot.name);
    if (names.size === 5) break;
  }
  let left = 8;
  for (const slot of M.careerSkillSlots(R, s, 1)) {
    const amount = Math.min(left, Math.max(0, 3 - (M.freeSkills(R, s)[slot.name] || 0)));
    s.careerSkills[slot.key] = amount; left -= amount;
    if (!left) break;
  }
  s.gearChoices["career-2"] = "Mask";
  assert.deepEqual(M.validation(R, s), []);
  for (const ids of [[B, "archives-ii"], ["archives-ii", B]]) {
    const combined = assembleBooks(library, ids);
    assert.equal(combined.config.talentOptions["Striding Gait"].filter((x) => x === "Mountains").length, 1);
    assert.ok(combined.config.talentOptions["Striding Gait"].includes("Forests"));
  }
});

test("generic foundations exclude named NPCs, preserve baselines and apply only approved conversions", () => {
  assert.equal(data.profiles.filter((p) => p.source?.book === B).length, 7);
  assert.equal(data.templates.filter((p) => p.source?.book === B).length, 4);
  for (const name of ["Shiny Moon Runts", "Shiny Moon Snotlings"]) assert.equal(gm(draft(name)).wounds, 4);
  const netSkill = gm(draft("Shiny Moon Runts")).skills.find((x) => x.name === "Ranged (Entangling)");
  assert.equal(netSkill.total, 40);
  assert.match(raw.profiles.find((x) => x.name === "Shiny Moon Runts").skills.find((x) => x.name === "Ranged (Entangling)").adaptation, /Ranged \(Net\)/);
  assert.deepEqual(R.weapons.find((x) => x.name === "Net"), core.weapons.find((x) => x.name === "Net"));
  const miner = draft("Miner");
  assert.equal(gm(miner).stats.S, 40); // Very Strong is already in the printed baseline.
  assert.equal(gm(miner).skills.find((x) => x.name === "Melee (Two-Handed)").total, 45);
  assert.equal(gm(miner).attacks[0].skill, 35); // Don't transfer Two-Handed advances to a Basic weapon.
  assert.ok(talent(miner, "Striding Gait (Rocky)").adaptation);
  assert.ok(talent(draft("Shiny Moon Skulkas"), "Tunnel Fighter").adaptation);
  assert.ok(gm(draft("Revenant Agent of the Doom Lord")).traits.some((x) => x.name === "Die Hard" && x.adaptation));
  assert.ok(!data.profiles.some((p) => p.source?.book === B && /Glitterwing|Gnistre|Herlinde|Grimik/i.test(p.name)));
});

function spite() {
  const s = draft("Spite");
  const venom = gm(s).traits.find((x) => x.name === "Venom");
  s.traitParameters[venom.key] = "Difficult";
  s.profileSkills[0] = "Stealth (Rural)";
  return s;
}

test("Spite requires Venom and Stealth choices; Sprinter does not add Movement/Agility again", () => {
  const s = draft("Spite");
  const r = gm(s);
  assert.equal(r.stats.M, 4);
  assert.equal(r.stats.Ag, 62);
  assert.equal(r.wounds, 1);
  assert.ok(r.traits.find((x) => x.name === "Sprinter").adaptation.includes("Proposed"));
  assert.ok(r.issues.some((x) => /difficulty/i.test(x.message)));
  assert.ok(r.issues.some((x) => x.code === "profile.skill"));
  const complete = spite();
  assert.deepEqual(gm(complete).issues, []);
  assert.equal(gm(complete).skills.find((x) => x.name === "Stealth (Rural)").total, 70);
  complete.stats.Ag = 67;
  assert.equal(gm(complete).skills.find((x) => x.name === "Stealth (Rural)").total, 75);
  assert.ok(gm(complete).issues.some((x) => /Tiny|manual Wounds/.test(x.message)));
});

test("Spite templates keep fixed spells, require a Wind/Ward and save valid parameters; switching clears stale Ward", () => {
  const s = spite();
  applyTemplate(s, "salzenmund:templates:mischief");
  s.wounds = 1;
  assert.ok(gm(s).issues.some((x) => x.code === "template.skill"));
  s.templateSkills[0] = ["Channelling (Ulgu)"];
  let r = gm(s);
  assert.deepEqual(r.issues, []);
  assert.equal(r.skills.find((x) => x.name === "Channelling (Ulgu)").total, 83);
  assert.deepEqual(r.spells.map((x) => x.name).sort(), ["Marsh Lights", "Sleep"]);
  assert.ok(r.template.adaptation.includes("56"));
  applyTemplate(s, "salzenmund:templates:despair");
  r = gm(s);
  const ward = r.traits.find((x) => x.name === "Ward");
  assert.ok(r.issues.some((x) => x.control.target === `#trait-${ward.key}`));
  s.traitParameters[ward.key] = "8";
  validateGMDraft(data, gmRules(s), s);
  r = gm(s);
  assert.deepEqual(r.issues, []);
  assert.equal(r.skills.find((x) => x.name === "Channelling (Ghyran)").total, 83);
  assert.equal(r.skills.find((x) => x.name === "Charm").total, 47);
  assert.ok(r.spells.some((x) => x.name === "Dooming"));
  assert.ok(!r.talents.some((x) => /Bless|Invoke/.test(x.name)));
  s.stats.Fel = 46;
  assert.equal(gm(s).skills.find((x) => x.name === "Charm").total, 52);
  applyTemplate(s, "salzenmund:templates:terror");
  assert.equal(s.traitParameters[ward.key], undefined);
  validateGMDraft(data, gmRules(s), s);
  assert.ok(templateEligibility(data.templates.find((x) => x.id === "salzenmund:templates:despair"), data.profiles.find((x) => x.name === "Human")));
  applyTemplate(s, "salzenmund:templates:shrike");
  assert.equal(gm(s).stats.WS, 60); // Printed +10 and the core Swarm's additional +10.
  assert.equal(gm(s).stats.Dex, 56);
  assert.ok(gm(s).traits.some((x) => x.name === "Frenzy" && x.adaptation));
});

test("Snotling Broken training requires recorded Fellowship; Goblin Melee choice drives attack skill", () => {
  const s = draft("Shiny Moon Snotlings");
  assert.ok(gm(s).issues.some((x) => /Broken/.test(x.message)));
  s.brokenRoll = [4, 7];
  assert.equal(gm(s).stats.Fel, 11);
  assert.equal(gm(s).wounds, 4);
  validateGMDraft(data, gmRules(s), s);
  const g = draft("Shiny Moon Goblins");
  assert.ok(gm(g).issues.some((x) => x.code === "profile.skill"));
  g.profileSkills[0] = "Melee (Basic)";
  assert.equal(gm(g).attacks.find((x) => x.name === "Sword").skill, 35);
  g.profileSkills[0] = "Melee (Polearm)";
  g.optionalAttacks = [gm(g).profile.attacks.find((x) => x.name === "Spear").key];
  assert.equal(gm(g).attacks.find((x) => x.name === "Spear").skill, 35);
  assert.equal(gm(g).attacks.find((x) => x.name === "Sword").skill, 30);
});

test("mechanical search references are bounded tables/procedures without templates, rumours or invented purchases", () => {
  assert.equal(refs.length, 24);
  const find = (name) => refs.find((x) => x.name === name);
  assert.match(find("Prospecting Factors").notes, /inconsistent/);
  assert.match(find("Size of Strike").notes, /both include zero/);
  assert.match(find("Night Goblin Net").notes, /reference-only/);
  assert.match(find("Enchanted Masks").text, /d10\+4 days/);
  assert.doesNotMatch(find("Morning Fury").text, /Red Child|Suth|Steinhafen Pits Each/);
  assert.ok(refs.every((x) => !["profile", "template"].includes(x.category)));
  assert.ok(!refs.some((x) => /Rumour|Hireling/.test(x.name)));
  assert.ok(!R.market.some((x) => x.source.book === B));
  assert.ok(!R.weapons.some((x) => x.source.book === B));
});

test("malformed template totals and missing-parameter declarations are rejected", () => {
  const without = { ...data, profiles: data.profiles.filter((x) => x.source?.book !== B), templates: data.templates.filter((x) => x.source?.book !== B), traits: data.traits.filter((x) => x.source?.book !== B) };
  const R = gmRules(spite());
  const broken = structuredClone(raw);
  const despair = broken.templates.find((x) => x.name === "Despair");
  despair.skills.find((x) => x.printedTotal !== undefined).printedTotal = -1;
  assert.throws(() => addGMSupplement(without, broken, R), /printed template Skill total/);
  const badTrait = structuredClone(raw);
  badTrait.templates[0].traits.push({ name: "Magical", value: "", requiresParameter: true });
  assert.throws(() => addGMSupplement(without, badTrait, R), /required template Trait parameter/);
});
