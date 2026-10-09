// Random allocation is an editor policy; quantities, grants, costs and eligibility
// come from the same Fifth Edition functions used by the guided creator.
import * as M from "../rules.mjs";
import { creationSpecies, careerAvailable } from "../origins.mjs";
import { randomTable, tableResult } from "../books.mjs";
import { gearSlots, gearOptions, inventoryEntries } from "../equipment.mjs";
import { characterResult } from "../character-result.mjs";
import { fromPlayer, makeEntry } from "./model.mjs";
import { speciesEntry } from "./catalogue.mjs";

export function generationContext(catalogue, draft, needsCareer = true) {
  if (!speciesEntry(catalogue, draft.species))
    throw Error(
      "Custom Species have no printed starting profile. Enter their starting choices manually.",
    );
  const selected = catalogue.careers.find(
      (c) => c.contentId === draft.career || c.id === draft.career,
    ),
    pc = {
      ...M.fresh(),
      version: 2,
      species: draft.species,
      origin: draft.generationOrigin || "",
      rollTables: {},
      xp: 1e9,
    };
  if (needsCareer && !selected)
    throw Error(
      "Choose a printed Career before generation. Custom Career labels have no starting Skills or equipment profile.",
    );
  const fallback = catalogue.R.careers.find((c) =>
    careerAvailable(catalogue.R, pc, c),
  );
  const c = selected || fallback;
  if (
    pc.origin &&
    !catalogue.origins.some(
      (o) => o.id === pc.origin && o.species === pc.species,
    )
  )
    throw Error("Choose an origin profile belonging to the selected Species.");
  if (!c)
    throw Error(
      "No printed starting Career is available for this Species/origin.",
    );
  // Explicit variant profiles retain their own identifiers and source records.
  const R = {
    ...catalogue.R,
    careers: [...catalogue.R.careers.filter((x) => x.id !== c.id), c],
  };
  pc.career = c.id;
  if (needsCareer && !careerAvailable(R, pc, c))
    throw Error(
      "This Career is not available for the selected Species/origin. You can still build it manually in Marijan Mode.",
    );
  return { R, pc, c };
}
export function availableGenerationCareers(catalogue, draft) {
  return catalogue.careers.filter((c) =>
    careerAvailable(
      catalogue.R,
      { species: draft.species, origin: draft.generationOrigin || "" },
      c,
    ),
  );
}
function randomPicker(pc, source) {
  const roll = (
    label,
    sides = 10,
    count = 1,
    printed = { book: "core", page: 38 },
  ) => {
    const faces = Array.from({ length: count }, () => M.die(sides, source));
    pc.rolls.push({
      label,
      faces,
      sides,
      at: new Date().toISOString(),
      source: printed,
    });
    return faces.reduce((a, b) => a + b, 0);
  };
  const pick = (items, label, printed) => {
    if (!items.length)
      throw Error(`No resolved options for ${label}. Choose manually.`);
    if (items.length === 1) return items[0];
    const index = roll(label, items.length, 1, printed) - 1,
      selected = items[index];
    pc.rolls.at(-1).label += ` → ${selected.name || selected.raw || selected}`;
    return selected;
  };
  return { roll, pick };
}
const concrete = (name) => !/Any|All\)|as Trade|\?/.test(name);
function skills(R, pc, pick, includeCareer) {
  const sp = creationSpecies(R, pc),
    pool = M.speciesSkillSlots(R, pc);
  while (pc.speciesSkills.length < 5) {
    const owned = M.speciesSkillSlots(R, pc)
        .filter((x) => pc.speciesSkills.includes(x.key))
        .map((x) => x.name),
      candidates = pool
        .filter((x) => !pc.speciesSkills.includes(x.key))
        .map((x) => ({
          ...x,
          choices: M.options(R, x.raw, "skill", pc).filter(
            (n) => concrete(n) && M.skillInfo(R, n) && !owned.includes(n),
          ),
        }))
        .filter((x) => x.choices.length),
      slot = pick(candidates, "Species Skill selection", sp.source);
    pc.skillChoices[slot.key] = pick(
      slot.choices,
      `Specialisation for ${slot.raw}`,
      sp.source,
    );
    pc.speciesSkills.push(slot.key);
  }
  if (!includeCareer) return;
  for (const slot of M.careerSkillSlots(R, pc, 1)) {
    const choices = M.options(R, slot.raw, "skill", pc).filter(
      (n) => concrete(n) && M.skillInfo(R, n),
    );
    if (!choices.length) continue; // An explicitly unavailable older-edition entry grants nothing.
    pc.skillChoices[slot.key] = pick(
      choices,
      `Career Skill ${slot.raw}`,
      slot.source,
    );
  }
  for (let i = 0; i < 8; i++) {
    const current = M.freeSkills(R, pc),
      legal = M.careerSkillSlots(R, pc, 1).filter(
        (x) =>
          M.skillInfo(R, x.name) &&
          concrete(x.name) &&
          (current[x.name] || 0) < 3,
      ),
      slot = pick(legal, "Starting Career Skill Advance (+5)", {
        book: "core",
        page: 38,
      });
    pc.careerSkills[slot.key] = (pc.careerSkills[slot.key] || 0) + 1;
  }
}
function talents(R, pc, pick, roll, includeCareer) {
  const sp = creationSpecies(R, pc),
    chosen = [];
  for (let i = 0; i < sp.talents.length; i++) {
    const testR = {
        ...R,
        species: {
          ...R.species,
          [pc.species]: { ...sp, talents: [], randomTalents: 0 },
        },
        origins: R.origins.map((o) =>
          o.id === pc.origin ? { ...o, talents: [], randomTalents: 0 } : o,
        ),
      },
      testPC = { ...pc, randomTalents: chosen, freeTalent: "" },
      opts = M.speciesTalentOptions(R, pc, i).filter(
        (n) =>
          concrete(n) &&
          M.talentInfo(R, n) &&
          !M.talentInfo(R, n).unavailable &&
          !M.invalidTalent(testR, testPC, n),
      );
    pc.talentChoices[`species-${i}`] = pick(
      opts,
      `Species Talent slot ${i + 1}`,
      sp.source,
    );
    chosen.push(pc.talentChoices[`species-${i}`]);
  }
  const table = randomTable(R, pc, "talent");
  for (
    let attempts = 0;
    pc.randomTalents.length < (sp.randomTalents || 0);
    attempts++
  ) {
    if (attempts > 1000 || !table)
      throw Error(
        "Could not resolve the printed random Talent table. Choose manually.",
      );
    const n = roll("Random Species Talent", table.sides, 1, table.source),
      raw = tableResult(table, n),
      opts = M.options(R, raw, "talent", pc).filter(
        (n) =>
          concrete(n) &&
          M.talentInfo(R, n) &&
          !M.talentInfo(R, n).unavailable &&
          !M.invalidTalent(R, pc, n),
      ),
      owned = M.freeTalents(R, pc, false);
    if (owned.some((t) => M.base(t) === M.base(raw)) || !opts.length) {
      pc.rolls.at(-1).label += ` → ${raw}; duplicate or incompatible, rerolled`;
      continue;
    }
    const chosen = pick(
      opts,
      `Random Talent specialisation (${raw})`,
      table.source,
    );
    pc.randomTalents.push(raw);
    if (raw === "Artistic")
      pc.talentChoices[`random-${pc.randomTalents.length - 1}`] = chosen;
    pc.rolls.at(-1).label += ` → ${chosen}`;
  }
  if (includeCareer)
    pc.freeTalent = pick(
      M.careerTalentOptions(R, pc, 1).filter(
        (n) => concrete(n) && !M.invalidTalent(R, pc, n),
      ),
      "Free Career Talent",
      { book: "core", page: 39 },
    );
}
function magic(R, pc, pick) {
  // Regenerate grants using the shared acquisition-time counts and cult choices.
  pc.spells = [];
  const seen = new Set();
  for (const grant of M.spellGrants(R, pc)) {
    const pool = grant.choices.filter((x) => !seen.has(x.name));
    for (let i = 0; i < grant.count; i++) {
      const spell = pick(
        pool.filter((x) => !seen.has(x.name)),
        `Free spell for ${grant.talent}`,
        { book: "core", page: 123 },
      );
      pc.spells.push(spell.name);
      seen.add(spell.name);
    }
  }
}
function startingGear(R, pc, pick, roll) {
  for (const slot of gearSlots(R, pc)) {
    const choice = pick(
      gearOptions(slot.name, R),
      `Starting Trapping (${slot.name})`,
      slot.source,
    );
    pc.gearChoices[slot.key] = choice;
    for (const match of choice.matchAll(/\{?(\d+)d10\}?/g))
      pc.gearRolls[`${slot.key}:${match[0]}`] = roll(
        `Quantity: ${choice}`,
        10,
        Number(match[1]),
        slot.source,
      );
  }
}
export function rollStartingChoices(
  catalogue,
  draft,
  group,
  source = globalThis.crypto,
) {
  const { R, pc } = generationContext(catalogue, draft, group === "gear"),
    { pick, roll } = randomPicker(pc, source);
  if (group === "skills") skills(R, pc, pick, false);
  if (group === "talents") {
    talents(R, pc, pick, roll, false);
    magic(R, pc, pick);
  }
  if (group === "gear") startingGear(R, pc, pick, roll);
  return { R, pc, group, rolls: pc.rolls };
}
export function addStartingChoices(catalogue, draft, rolled) {
  const { R, pc, group } = rolled;
  const add = (g, row, amount = 1) => {
    const old = draft.entries[g].find((x) => x.name === row.name);
    if (old) old.amount = Math.max(old.amount, amount);
    else {
      const entry = makeEntry(row, g);
      entry.amount = amount;
      draft.entries[g].push(entry);
    }
  };
  if (group === "skills")
    for (const [name, n] of Object.entries(M.freeSkills(R, pc))) {
      const row = catalogue.rows.find(
        (x) => x.collection === "skills" && x.name === name,
      ) || { ...M.skillInfo(R, name), name };
      add("skills", row, n * 5);
    }
  if (group === "talents") {
    for (const name of new Set(M.freeTalents(R, pc)))
      add("talents", { ...M.talentInfo(R, name), name });
    for (const spell of M.knownSpells(R, pc))
      add("magic", { ...spell, kind: "spell" });
  }
  if (group === "gear")
    for (const x of inventoryEntries(R, pc)) {
      const row = catalogue.rows.find(
        (r) => r.collection === "gear" && [x.name, x.alias].includes(r.name),
      ) || { name: x.name, source: x.source };
      const profile = x.armour || x.weapon;
      const entry = makeEntry(
        {
          ...row,
          ...profile,
          name: x.name,
          source: x.source,
          kind: x.armour ? "armour" : x.weapon ? "weapon" : "gear",
          enc: x.enc,
        },
        "gear",
      );
      entry.amount = x.quantity ?? 1;
      entry.state = ["worn", "equipped"].includes(x.placement)
        ? x.placement
        : "carried";
      if (x.quantity === null)
        entry.text +=
          "\nPrinted quantity unspecified; one reference entry recorded, not a verified unit quantity.";
      const old = draft.entries.gear.find(
        (r) => r.name === entry.name && r.state === entry.state,
      );
      if (old) old.amount = Math.max(old.amount, entry.amount);
      else draft.entries.gear.push(entry);
    }
  draft.rolls.push(...rolled.rolls);
}
export function generateCharacter(
  catalogue,
  draft,
  target = 1,
  source = globalThis.crypto,
) {
  if (![1, 2, 3, 4].includes(target))
    throw Error(
      "Automatic generation supports printed Career levels 1–4. Other levels remain manually editable.",
    );
  const { R, pc, c } = generationContext(catalogue, draft),
    { pick, roll } = randomPicker(pc, source);
  pc.name = draft.name;
  pc.charMode = "first";
  pc.charAttempts = 1;
  pc.charRolls = M.KEYS.map((k) =>
    roll(`${k} starting roll`, 10, 2, { book: "core", page: 38 }),
  );
  for (let i = 0; i < 6; i++) {
    const k = pick(
      M.KEYS.filter((k) => c.advanceScheme[k] === 1),
      "Starting Career Characteristic increase (+1)",
      { book: "core", page: 38 },
    );
    pc.boost[k] = (pc.boost[k] || 0) + 1;
  }
  skills(R, pc, pick, true);
  talents(R, pc, pick, roll, true);
  startingGear(R, pc, pick, roll);
  const l = c.levels[0],
    count =
      l.status === "Brass"
        ? 2 * l.standing
        : l.status === "Silver"
          ? l.standing
          : 0;
  pc.wealth = {
    amount:
      (l.status === "Brass" ? 20 : l.status === "Silver" ? 10 : 2) +
      (count
        ? roll("Starting wealth", 10, count, { book: "core", page: 39 })
        : l.standing),
    currency:
      l.status === "Brass"
        ? "brass pennies"
        : l.status === "Silver"
          ? "silver shillings"
          : "gold crowns",
  };
  while (M.derive(R, pc).level < target) {
    const d = M.derive(R, pc),
      threshold = [10, 12, 14][d.level - 1];
    if (d.ticks === threshold) {
      M.purchase(R, pc, "promotion", "");
      continue;
    }
    // Resolve newly unlocked specialisations once before choosing purchases.
    for (const slot of M.careerSkillSlots(R, pc, d.level))
      if (!pc.skillChoices[slot.key]) {
        const choices = M.options(R, slot.raw, "skill", pc).filter(
          (n) => concrete(n) && M.skillInfo(R, n),
        );
        if (!choices.length) continue;
        pc.skillChoices[slot.key] = pick(
          choices,
          `Career Skill ${slot.raw}`,
          slot.source,
        );
      }
    const groups = [
      M.KEYS.filter(
        (k) => c.advanceScheme[k] && c.advanceScheme[k] <= d.level,
      ).map((name) => M.quote(R, pc, "char", name, 5)),
      [...new Set(M.careerSkillSlots(R, pc, d.level).map((x) => x.name))].map(
        (name) => M.quote(R, pc, "skill", name, 5),
      ),
      M.careerTalentOptions(R, pc, d.level)
        .filter(concrete)
        .map((name) => M.quote(R, pc, "talent", name)),
    ]
      .map((g) => g.filter((q) => !q.error && q.tick))
      .filter((g) => g.length);
    const available = pick(
      groups.map((rows) => ({
        name:
          rows[0].type === "char"
            ? "Characteristic"
            : rows[0].type === "skill"
              ? "Skill"
              : "Talent",
        rows,
      })),
      "Advancement group",
      { book: "core", page: 191 },
    );
    const q = pick(available.rows, "Career advancement purchase", {
      book: "core",
      page: 191,
    });
    M.purchase(R, pc, q.type, q.name, 5);
  }
  magic(R, pc, pick);
  const result = characterResult(R, pc),
    next = fromPlayer(catalogue, pc, result, R),
    sp = speciesEntry(catalogue, draft.species);
  next.id = draft.id;
  next.origin = draft.origin;
  next.generationOrigin = draft.generationOrigin || "";
  next.xpUnspent = 0;
  next.baseMovement = sp.movement;
  next.talentEffects = true;
  next.copiedFrom = "";
  for (const k of M.KEYS)
    next.characteristics[k].initial -=
      new Set(
        result.derived.talents.filter((t) => R.config.talentEffects[t] === k),
      ).size * 5;
  for (const x of next.entries.skills) x.total = null;
  for (const k of Object.keys(next.overrides)) next.overrides[k] = null;
  next.rolls = pc.rolls;
  next.generation = {
    target,
    source: { book: "core", page: 196 },
    purchases: pc.ledger,
    notes: [
      "Random allocation is Marijan Mode policy. Species and Career were selected; no random-creation Species/Career rewards apply.",
      "First ordered Characteristic rolls receive the printed six-point starting Career increase. Five Species Skills, native languages, eight Career Skill Advances (cap +15) and one free Career Talent follow core creation.",
      "Higher levels fill 10 / 12 / 14 tracker boxes with equally chosen available purchase groups; each promotion costs 100 XP. No Fourth Edition completion thresholds apply.",
      "Starting wealth and first-level equipment are granted; higher-level equipment is not automatically awarded.",
      ...(creationSpecies(R, pc).adaptation
        ? [
            `Legacy Species/origin adaptation: ${creationSpecies(R, pc).adaptation}`,
          ]
        : []),
      ...result.issues.map(
        (x) =>
          `Guided creator reminder (does not block Marijan export): ${x.message}`,
      ),
      ...M.careerSkillSlots(R, pc, target)
        .filter((x) => !M.skillInfo(R, x.name))
        .map(
          (x) =>
            `${x.raw}: unavailable printed Skill entry; no Advances granted.`,
        ),
      ...result.equipment.entries
        .filter((x) => x.quantity === null)
        .map((x) => `${x.name}: printed quantity is unresolved.`),
    ],
  };
  return next;
}
