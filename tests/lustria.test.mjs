import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { library, R as core } from "./fixture.mjs";
import { assembleBooks } from "../dist/books.mjs";
import * as M from "../dist/rules.mjs";
import { creationSpecies } from "../dist/origins.mjs";
import { canonicalName } from "../dist/content-references.mjs";
import { createGMRules } from "../dist/gm/books.mjs";
import { freshGM } from "../dist/gm/model.mjs";

const B = "lustria";
const R = assembleBooks(library, [B]);
const refs = JSON.parse(
  await readFile(
    new URL(
      "../dist/data/books/lustria/reference-entries.json",
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
  assert.match(darts.text, /not automatically supplied/);
  assert.match(
    R.weapons.find((w) => w.name === "Eagle Claw").text,
    /Damage by 4/,
  );
  const fog = R.spells.find((w) => w.name === "Shroud of Fog");
  assert.equal(fog.category, "Shadows");
  assert.equal(fog.target, "AoE (Willpower Bonus Miles)");
  assert.equal(fog.duration, "Willpower minutes");
});

test("shared GM catalogues receive compatible options without exposing unfinished Lustria foundations", async () => {
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
  assert.ok(!data.profiles.some((p) => p.source?.book === B));
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
  assert.equal(refs.length, 45);
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
