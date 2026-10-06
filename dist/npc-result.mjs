import * as M from "./rules.mjs";
import { miracleChoices } from "./cults.mjs";
import { NPC_KEYS, NPC_SIZES } from "./bestiary-content.mjs";
import {
  bonus,
  profileFeatures,
  grantChoices,
  printedArmour,
  armourOptions,
  armourLocations,
  attackCharacteristic,
  attackSkill,
  attackWeapon,
  magicLores,
} from "./npc-profile.mjs";

const numeric = (x) => Number.isFinite(x);
const sizeMultiplier = {
  Small: 1,
  Average: 1,
  Large: 2,
  Enormous: 4,
  Monstrous: 8,
};
const damageMultiplier = {
  Small: 1,
  Average: 1,
  Large: 2,
  Enormous: 2,
  Monstrous: 3,
};
function issue(
  code,
  message,
  severity = "warning",
  step = 1,
  target = "",
  page = 318,
) {
  return {
    code,
    message,
    severity,
    source: typeof page === "object" ? page : { book: "core", page },
    control: { step, target },
  };
}
function sumLedger(s, type, name) {
  return s.ledger
    .filter((x) => x.type === type && x.name === name)
    .reduce((n, x) => n + x.amount, 0);
}
function talentPurchaseIssue(R, d, name) {
  const base = M.base(name),
    owned = d.talents.map((t) => M.base(t.name)),
    magic = ["Arcane Magic", "Chaos Magic", "Petty Magic", "Witch!"],
    divine = ["Bless", "Invoke"],
    channel = d.skills.some(
      (x) => x.name.startsWith("Channelling") && x.advance + x.paid > 0,
    );
  if (
    base === "Savant" &&
    !d.skills.some(
      (x) =>
        x.name === `Lore (${name.match(/\((.+)\)/)?.[1]})` &&
        x.advance + x.paid > 0,
    )
  )
    return "Savant requires an Advance in its chosen Lore (p. 125).";
  if (
    (base === "Magic Resistance" &&
      (channel ||
        owned.some((n) => magic.includes(n) || divine.includes(n)))) ||
    (magic.includes(base) &&
      owned.some((n) => divine.includes(n) || n === "Magic Resistance")) ||
    (divine.includes(base) &&
      (channel ||
        owned.some((n) => magic.includes(n) || n === "Magic Resistance")))
  )
    return "Incompatible magical or divine training (pp. 115, 121–123).";
  if (divine.includes(base)) {
    const patron = name.match(/\((.+)\)/)?.[1],
      other = d.talents.find(
        (t) =>
          divine.includes(M.base(t.name)) &&
          t.name.match(/\((.+)\)/)?.[1] !== patron,
      );
    if (other)
      return `Choose ${base} (${other.name.match(/\((.+)\)/)?.[1]}) to match the existing patron.`;
  }
  if (
    base === "Arcane Magic" &&
    owned.includes(base) &&
    !d.talents.some((t) => t.name === name)
  ) {
    if (!/Elf/.test(d.profile.name))
      return "Normally only one Arcane Lore; GM alternatives can be recorded through the Spellcaster Creature Trait (pp. 115, 237, 361).";
    const lores = d.talents.filter((t) => M.base(t.name) === "Arcane Magic");
    if (lores.length >= bonus(d.stats.WP))
      return "Elf Arcane Lores are limited to Willpower Bonus (p. 237).";
    const previous = lores.at(-1).name.match(/\((.+)\)/)?.[1];
    if (d.magic.filter((x) => x.lore === previous).length < 8)
      return `Learn eight spells from ${previous} before buying another Lore (p. 237).`;
  }
  return "";
}
export function npcResult(R, s) {
  const p = R.creatures.find((x) => x.contentId === s.profile);
  if (!p) throw Error("The NPC's printed profile is unavailable.");
  const template = R.templates.find((x) => x.contentId === s.template),
    stats = { ...p.stats },
    steps = Object.fromEntries(
      NPC_KEYS.map((k) => [
        k,
        [{ label: "Printed profile", value: p.stats[k], source: p.source }],
      ]),
    ),
    issues = [];
  const addStat = (key, value, label, source) => {
    if (value && stats[key] !== null) {
      stats[key] += value;
      steps[key].push({ label, value, source });
    }
  };
  for (const note of p.notes)
    if (!note.startsWith("The printed Toughness Bonus"))
      issues.push(
        issue(
          "printed.profile-note",
          note,
          "warning",
          0,
          "#npc-printed",
          p.source,
        ),
      );
  if (s.removedTraits.length)
    issues.push(
      issue(
        "traits.printed-removal",
        "Removing a printed Trait leaves the printed Characteristic baseline intact. Use explicit GM score overrides for changes to effects already included in that profile.",
        "info",
        1,
        "#npc-traits",
      ),
    );
  const printedTraits = profileFeatures(R, p, "trait").filter(
    (x) => !s.removedTraits.includes(x.id),
  );
  const traits = [
    ...printedTraits,
    ...s.traits.map((x) => ({
      ...x,
      name: R.traits.find((t) => t.contentId === x.id)?.name,
      source: R.traits.find((t) => t.contentId === x.id)?.source,
      printed: false,
    })),
  ];
  const has = (name) => traits.some((x) => x.name === name);
  const added = (name) => traits.filter((x) => x.name === name && !x.printed);
  if (!traits.some((x) => x.name === "Size"))
    traits.push({
      id: R.traits.find((x) => x.name === "Size").contentId,
      name: "Size",
      value: s.size,
      source: { book: "core", page: 360 },
      printed: true,
    });
  else traits.find((x) => x.name === "Size").value = s.size;
  if (template) {
    for (const [key, value] of Object.entries(template.adjustments)) {
      if (stats[key] === null)
        issues.push(
          issue(
            "template.absent-characteristic",
            `${template.name} adds ${key}, which this profile lacks. Enter a GM score if appropriate.`,
            "warning",
            1,
            `#npc-score-${key}`,
            template.source,
          ),
        );
      addStat(key, value, template.name, template.source);
    }
  }
  for (const [k, faces] of Object.entries(s.characteristicRolls))
    addStat(
      k,
      faces.reduce((n, x) => n + x, 0) - 10,
      `Individualise: ${faces.join(" + ")} − 10`,
      { book: "core", page: 318 },
    );
  if (s.size !== p.size && !has("Swarm")) {
    if (NPC_SIZES.includes(s.size) && NPC_SIZES.includes(p.size)) {
      const diff = NPC_SIZES.indexOf(s.size) - NPC_SIZES.indexOf(p.size);
      for (const [k, v] of [
        ["S", 10 * diff],
        ["T", 10 * diff],
        ["Ag", -5 * diff],
      ])
        addStat(k, v, `Resize ${p.size} → ${s.size}`, {
          book: "core",
          page: 361,
        });
    } else
      issues.push(
        issue(
          "size.tiny",
          "Tiny has no printed Wounds formula or resolved resizing step. Set its Characteristics and Wounds explicitly.",
          "warning",
          1,
          "#npc-score-W",
          361,
        ),
      );
  }
  const baseTalents = profileFeatures(R, p, "talent").filter(
    (x) => !s.removedTalents.includes(x.name),
  );
  const talentMap = new Map();
  const addTalent = (name, ranks, source, origin) => {
    name = M.canon(name);
    const item = talentMap.get(name) || { name, ranks: 0, source, origins: [] };
    // Sources granting the same rank do not silently multiply purchases.
    if (origin === "GM" || origin === "XP") item.ranks += ranks;
    else item.ranks = Math.max(item.ranks, ranks);
    item.origins.push(origin);
    talentMap.set(name, item);
  };
  baseTalents.forEach((x) => addTalent(x.name, x.ranks, p.source, "Printed"));
  if (template)
    template.talents.forEach((g, i) => {
      const options = grantChoices(R, g, "talent"),
        selected = options.length === 1 ? options[0] : s.templateTalents[i];
      if (selected && options.includes(selected))
        addTalent(selected, g.ranks, template.source, "Template");
      else
        issues.push(
          issue(
            "template.talent-choice",
            `Choose ${g.options.join(" or ")} for ${template.name}.`,
            "error",
            1,
            `#npc-template-talent-${i}`,
            template.source,
          ),
        );
    });
  for (const t of s.talents)
    addTalent(
      t.name,
      t.ranks,
      M.talentInfo(R, t.name)?.source || { book: "core", page: 114 },
      "GM",
    );
  for (const t of s.ledger.filter((x) => x.type === "talent"))
    addTalent(t.name, 1, t.source, "XP");
  const mark = traits.find((x) => x.name === "Mark of Chaos");
  if (mark) {
    if (["Khorne", "Nurgle", "Slaanesh", "Tzeentch"].includes(mark.value)) {
      addTalent(
        `Etiquette (Followers of ${mark.value})`,
        1,
        { book: "core", page: 359 },
        "Mark of Chaos",
      );
      const rival = {
        Khorne: "overt followers of Slaanesh",
        Nurgle: "followers of Tzeentch",
        Slaanesh: "followers of Khorne",
        Tzeentch: "followers of Nurgle",
      }[mark.value];
      const animosity = R.traits.find((t) => t.name === "Animosity");
      if (
        animosity &&
        !traits.some((t) => t.name === "Animosity" && t.value === rival)
      )
        traits.push({
          ...animosity,
          id: animosity.contentId,
          value: rival,
          origin: "Mark of Chaos",
        });
      if (mark.value === "Nurgle" && !mark.printed)
        addStat("T", 10, "Mark of Nurgle", { book: "core", page: 359 });
      if (mark.value === "Khorne")
        addTalent("Frenzy", 1, { book: "core", page: 359 }, "Mark of Chaos");
      if (mark.value === "Slaanesh")
        addTalent(
          "Fearless (Everything)",
          1,
          { book: "core", page: 359 },
          "Mark of Chaos",
        );
      if (mark.value === "Tzeentch" && !mark.printed && !s.markRoll)
        issues.push(
          issue(
            "mark.mutation-roll",
            "Roll the number of Tzeentch Mutations and choose the first table.",
            "error",
            1,
            "#npc-mark-roll",
            359,
          ),
        );
    } else
      issues.push(
        issue(
          "mark.god",
          "Choose a Chaos God for the Mark.",
          "error",
          1,
          "#npc-trait-value",
          359,
        ),
      );
  }
  const mutations = s.mutations
    .filter((x) => x.origin !== "mark" || mark?.value === "Tzeentch")
    .map((x) => ({
      ...R.mutations.find((m) => m.contentId === x.id),
      location: x.location,
      origin: x.origin,
    }));
  for (const m of mutations) {
    for (const [k, v] of Object.entries(m.adjustments))
      addStat(k, v, m.name, m.source);
    if (m.name === "Enormous Eye")
      addTalent("Acute Sense (Sight)", 1, m.source, "Mutation");
    if (m.name === "Whiskered Snout")
      addTalent("Acute Sense (Smell)", 1, m.source, "Mutation");
    if (m.name === "Webbed Feet")
      addTalent("Striding Gait (Wetland)", 1, m.source, "Mutation");
    if (m.name === "Fleshy Tentacle")
      traits.push({
        id: R.traits.find((x) => x.name === "Tentacles").contentId,
        name: "Tentacles",
        value: "1",
        source: m.source,
        printed: false,
      });
    if (m.name === "Uneven Horns")
      traits.push({
        id: R.traits.find((x) => x.name === "Horns").contentId,
        name: "Horns",
        value: "",
        source: m.source,
        printed: false,
      });
    if (m.name === "Hateful Impulses")
      traits.push({
        id: R.traits.find((x) => x.name === "Animosity").contentId,
        name: "Animosity",
        value: "All not of this Species",
        source: m.source,
        printed: false,
      });
    if (m.name === "Unholy Rage")
      traits.push({
        id: R.traits.find((x) => x.name === "Frenzy").contentId,
        name: "Frenzy",
        value: "",
        source: m.source,
        printed: false,
      });
    if (
      ["Extra Mouth", "Patchy Feathers", "Spiny Protrusions"].includes(
        m.name,
      ) &&
      !m.location
    )
      issues.push(
        issue(
          "mutation.location",
          `Choose or roll the location for ${m.name}.`,
          "error",
          1,
          "#npc-mutations",
          189,
        ),
      );
  }
  if (mark?.value === "Tzeentch" && !mark.printed && s.markRoll) {
    const count = Math.ceil(s.markRoll.faces[0] / 3),
      chosen = mutations.filter((m) => m.origin === "mark");
    if (
      chosen.length !== count ||
      chosen.some(
        (m, i) =>
          m.category !==
          (i % 2
            ? s.markRoll.start === "Mental"
              ? "Physical"
              : "Mental"
            : s.markRoll.start),
      )
    )
      issues.push(
        issue(
          "mark.mutation-sequence",
          `Tzeentch grants ${count} alternating Mutations, beginning with your chosen ${s.markRoll.start} table.`,
          "error",
          1,
          "#npc-mark-roll",
          359,
        ),
      );
  }
  const trained = traits.filter((x) => x.name === "Trained");
  const training = new Set(
    trained.flatMap((t) => t.value.split(",").map((x) => x.trim())),
  );
  const baseTraining = new Set(
    printedTraits
      .filter((x) => x.name === "Trained")
      .flatMap((t) => t.value.split(",").map((x) => x.trim())),
  );
  if (training.has("War") && !baseTraining.has("War"))
    addStat("WS", 10, "Trained (War)", { book: "core", page: 363 });
  if (training.has("Broken") && !baseTraining.has("Broken")) {
    if (!s.trainingRoll)
      issues.push(
        issue(
          "training.fellowship-roll",
          "Roll the 2d10 Fellowship gained from Trained (Broken).",
          "error",
          1,
          "#npc-training-roll",
          363,
        ),
      );
    else {
      const value = s.trainingRoll.faces.reduce((n, x) => n + x, 0);
      if (stats.Fel === null) {
        stats.Fel = value;
        steps.Fel.push({
          label: "Trained (Broken): previously absent",
          value,
          source: { book: "core", page: 363 },
        });
      } else
        addStat("Fel", value, "Trained (Broken)", { book: "core", page: 363 });
    }
  }
  for (const [name, category] of [
    ["Mutation", "Physical"],
    ["Mental Corruption", "Mental"],
  ]) {
    if (
      added(name).length &&
      !mutations.some((m) => m.category === category && m.origin !== "mark")
    )
      issues.push(
        issue(
          "trait.mutation-required",
          `${name} requires a roll on the ${category} Corruption table (p. 189). Add the corresponding Mutation.`,
          "error",
          1,
          "#npc-mutations",
          name === "Mutation" ? 359 : 359,
        ),
      );
  }
  if (training.has("Guard") && !has("Territorial"))
    traits.push({
      id: R.traits.find((x) => x.name === "Territorial").contentId,
      name: "Territorial",
      value: "",
      source: { book: "core", page: 363 },
      printed: false,
    });
  if (has("Swarm") && !printedTraits.some((x) => x.name === "Swarm"))
    addStat("WS", 10, "Swarm", { book: "core", page: 362 });
  const talents = [...talentMap.values()];
  for (const t of talents) {
    const info = M.talentInfo(R, t.name),
      configured = R.config.talentLimits[M.base(t.name)],
      limit = configured === null || info?.limit ? Infinity : (configured ?? 1);
    const printed = baseTalents.find((x) => x.name === t.name)?.ranks || 0;
    const templateGrant =
      template?.talents
        .filter((g) => grantChoices(R, g, "talent").includes(t.name))
        .reduce((n, g) => Math.max(n, g.ranks), 0) || 0;
    if (info && t.ranks > Math.max(limit, printed, templateGrant))
      issues.push(
        issue(
          "talent.rank-limit",
          `${t.name} exceeds its printed purchase limit. Reduce its GM ranks.`,
          "error",
          1,
          "#npc-talent",
          info.source,
        ),
      );
  }
  for (const t of talents)
    if (!M.talentInfo(R, t.name))
      issues.push(
        issue(
          "talent.printed-reference",
          `${t.name} appears in the core NPC template but has no core Talent definition. Its printed Lore choice is retained; no purchase limit or extra Talent effects are invented.`,
          "warning",
          1,
          "#npc-template",
          354,
        ),
      );
  for (const t of talents) {
    const key = R.config.talentEffects[M.base(t.name)];
    const old = baseTalents.find((x) => x.name === t.name)?.ranks || 0;
    if (key && t.ranks > old)
      addStat(
        key,
        5,
        `${t.name} (already-included printed ranks excluded)`,
        t.source,
      );
  }
  for (const k of M.KEYS)
    addStat(k, sumLedger(s, "char", k), "Paid Advances", {
      book: "core",
      page: 191,
    });
  for (const [k, v] of Object.entries(s.overrides))
    if (k !== "W") {
      stats[k] = v;
      steps[k].push({
        label: "GM final score",
        value: v,
        source: { book: "core", page: 318 },
      });
    }
  if (added("Construct").length)
    for (const k of ["Int", "WP", "Fel"]) {
      stats[k] = null;
      if (p.stats[k] !== null)
        steps[k].push({
          label: "Construct: absent",
          value: null,
          source: { book: "core", page: 357 },
        });
    }
  for (const k of NPC_KEYS.filter((k) => k !== "W"))
    if (stats[k] !== null && stats[k] < 0)
      issues.push(
        issue(
          "score.negative",
          `${k} is below zero; set a valid GM score.`,
          "error",
          1,
          `#npc-score-${k}`,
        ),
      );
  let tb =
    s.tbMode === "calculate" || p.toughnessBonus === null
      ? bonus(stats.T)
      : s.tbMode === "manual"
        ? s.tbOverride
        : p.toughnessBonus;
  if (tb === null)
    issues.push(
      issue(
        "toughness.unresolved",
        "Set a Toughness Bonus.",
        "error",
        1,
        "#npc-tb",
      ),
    );
  if (p.toughnessBonus !== null && p.toughnessBonus !== bonus(p.stats.T))
    issues.push(
      issue(
        "printed.toughness-conflict",
        `Printed Toughness ${p.stats.T} and Toughness Bonus ${p.toughnessBonus} disagree. Current choice: ${s.tbMode}.`,
        "warning",
        1,
        "#npc-tb",
        p.source,
      ),
    );
  if (s.tbMode === "printed" && stats.T !== p.stats.T)
    issues.push(
      issue(
        "toughness.retained",
        "Toughness changed; its printed Toughness Bonus is retained until you choose Recalculate or a manual value.",
        "warning",
        1,
        "#npc-tb",
      ),
    );
  const sb = bonus(stats.S),
    wpb = has("Construct") ? sb : bonus(stats.WP);
  const baselineHardy = baseTalents.some((x) => x.name === "Hardy"),
    hardy = talents.some((x) => x.name === "Hardy");
  const dirty =
    s.size !== p.size ||
    ["S", "T", "WP"].some((k) => stats[k] !== p.stats[k]) ||
    tb !== (p.toughnessBonus ?? bonus(p.stats.T)) ||
    added("Construct").length ||
    added("Swarm").length ||
    hardy !== baselineHardy;
  let wounds = p.stats.W;
  if (dirty) {
    const woundSize = has("Swarm") ? "Average" : s.size;
    wounds =
      woundSize === "Tiny"
        ? null
        : woundSize === "Small"
          ? tb === null
            ? null
            : 2 * tb + (hardy ? tb : 0)
          : [sb, tb, wpb].every(numeric)
            ? (sb + 2 * tb + wpb + (hardy ? tb : 0)) * sizeMultiplier[woundSize]
            : null;
    if (has("Swarm")) {
      const changed =
        ["S", "T", "WP"].some((k) => stats[k] !== p.stats[k]) ||
        hardy !== baselineHardy ||
        added("Construct").length;
      wounds = changed
        ? null
        : p.stats.W * (printedTraits.some((t) => t.name === "Swarm") ? 1 : 5);
      if (changed)
        issues.push(
          issue(
            "swarm.wounds-manual",
            "Swarm uses five times a normal example’s Wounds and ignores Size. Set Wounds explicitly after changing its baseline.",
            "warning",
            1,
            "#npc-score-W",
            362,
          ),
        );
    }
    steps.W.push({
      label: "Recalculated Size/Traits/Characteristics",
      value: wounds,
      source: { book: "core", page: 361 },
    });
  }
  if ("W" in s.overrides) {
    wounds = s.overrides.W;
    steps.W.push({
      label: "GM final Wounds",
      value: wounds,
      source: { book: "core", page: 318 },
    });
  }
  if (wounds === null)
    issues.push(
      issue(
        "wounds.unresolved",
        "Wounds need an explicit GM value for this profile.",
        "error",
        1,
        "#npc-score-W",
        361,
      ),
    );
  stats.W = wounds;
  const skillMap = new Map();
  function addSkill(name, advance, source, origin) {
    const char = M.skillInfo(R, name)?.char;
    const old = skillMap.get(name);
    const row = {
      name,
      char: char || null,
      advance:
        old?.advance === null || old?.advance === undefined
          ? advance
          : Math.max(old.advance, advance),
      source,
      origins: [...(old?.origins || []), origin],
    };
    skillMap.set(name, row);
  }
  p.skills
    .filter((x) => !s.removedSkills.includes(x.name))
    .forEach((x) => {
      const char = M.skillInfo(R, x.name)?.char;
      if (char && p.stats[char] !== null)
        addSkill(x.name, x.total - p.stats[char], p.source, "Printed");
      else {
        skillMap.set(x.name, {
          name: x.name,
          char: null,
          advance: null,
          total: x.total,
          source: p.source,
          origins: ["Printed: Characteristic unresolved"],
        });
        issues.push(
          issue(
            "skill.printed-name",
            `${x.name} is retained at its printed total; its governing core Skill is unresolved. Remove it and add a reviewed core Skill if the GM wishes.`,
            "warning",
            1,
            "#npc-add-skill",
            p.source,
          ),
        );
      }
    });
  if (template)
    template.skills.forEach((g, i) => {
      const options = grantChoices(R, g, "skill"),
        choices =
          options.length === 1 && g.count === 1
            ? options
            : s.templateSkills[i] || [];
      if (
        choices.length !== g.count ||
        new Set(choices).size !== choices.length ||
        choices.some((n) => !options.includes(n))
      )
        issues.push(
          issue(
            "template.skill-choice",
            `Choose ${g.count} distinct ${g.options.join(" or ")} Skill${g.count > 1 ? "s" : ""} for ${template.name}.`,
            "error",
            1,
            `#npc-template-skill-${i}`,
            template.source,
          ),
        );
      else
        choices.forEach((n) =>
          addSkill(n, g.bonus, template.source, "Template (higher bonus)"),
        );
    });
  for (const x of s.skills)
    addSkill(
      x.name,
      x.bonus,
      M.skillInfo(R, x.name)?.source || { book: "core", page: 111 },
      "GM Skill bonus",
    );
  if (
    added("Tracker").length ||
    (traits.some((t) => t.name === "Tracker") && !skillMap.has("Track"))
  )
    addSkill("Track", 10, { book: "core", page: 363 }, "Tracker");
  if (
    added("Stealthy").length ||
    (traits.some((t) => t.name === "Stealthy") &&
      !skillMap.has("Stealth (Rural)"))
  )
    addSkill("Stealth (Rural)", 10, { book: "core", page: 361 }, "Stealthy");
  if (added("Amphibious").length && !skillMap.has("Swim")) {
    skillMap.set("Swim", {
      name: "Swim",
      char: "S",
      advance: null,
      source: { book: "core", page: 356 },
      origins: ["Amphibious: bonus unspecified"],
    });
    issues.push(
      issue(
        "amphibious.swim-bonus",
        "Amphibious grants Swim but prints no Skill bonus. Enter a GM Swim bonus to resolve its total.",
        "error",
        1,
        "#npc-add-skill",
        356,
      ),
    );
  }
  for (const t of traits.filter((x) =>
    ["Blessed", "Miracles"].includes(x.name),
  ))
    addSkill("Pray", 10, t.source, t.name);
  for (const t of added("Spellcaster")) {
    if (!template?.magic) {
      const wind = s.templateSkills["trait-wind"]?.[0];
      if (
        !wind ||
        !grantChoices(R, { options: ["Channelling (Any)"] }, "skill").includes(
          wind,
        )
      )
        issues.push(
          issue(
            "spellcaster.wind",
            "Choose the Channelling Wind for the Spellcaster Trait.",
            "error",
            2,
            "#npc-trait-wind",
            361,
          ),
        );
      else addSkill(wind, 10, { book: "core", page: 361 }, "Spellcaster");
      addSkill(
        "Language (Magick)",
        10,
        { book: "core", page: 361 },
        "Spellcaster",
      );
    }
  }
  for (const x of s.ledger.filter((x) => x.type === "skill"))
    if (!skillMap.has(x.name)) addSkill(x.name, 0, x.source, "Paid Skill");
  const skills = [...skillMap.values()]
    .map((x) => ({
      ...x,
      paid: sumLedger(s, "skill", x.name),
      total:
        x.char && stats[x.char] !== null && x.advance !== null
          ? stats[x.char] + x.advance + sumLedger(s, "skill", x.name)
          : (x.total ?? null),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const getSkill = (name, char) =>
    skills.find((x) => x.name === name)?.total ?? stats[char];
  const attacks = [];
  for (let i = 0; i < p.attacks.length; i++) {
    const a = p.attacks[i],
      id = `printed-attack-${i}`;
    if (
      s.removedAttacks.includes(id) ||
      (a.optional && !s.optionalAttacks.includes(id))
    )
      continue;
    const char = attackCharacteristic(a),
      name = attackSkill(R, a),
      base = p.skills.find((x) => x.name === name);
    const skill =
      a.skill === null
        ? null
        : base && name && numeric(getSkill(name, char))
          ? a.skill + getSkill(name, char) - base.total
          : numeric(stats[char]) && numeric(p.stats[char])
            ? a.skill + stats[char] - p.stats[char]
            : null;
    const extra = /Bite|Horns|Tail|Tentacles|Chill Grasp|Ghostly Howl/.test(
        a.name,
      ),
      ranged = char === "BS";
    const strengthFactor = ranged
      ? /SB/.test(attackWeapon(R, a)?.damage || "") || /Rocks/.test(a.name)
        ? 1
        : 0
      : extra || has("Swarm")
        ? 1
        : damageMultiplier[s.size];
    const baseFactor = ranged
      ? /SB/.test(attackWeapon(R, a)?.damage || "") || /Rocks/.test(a.name)
        ? 1
        : 0
      : extra || has("Swarm")
        ? 1
        : damageMultiplier[p.size];
    let damage = a.damage;
    if (
      damage !== null &&
      numeric(sb) &&
      numeric(bonus(p.stats.S)) &&
      numeric(strengthFactor) &&
      numeric(baseFactor)
    )
      damage += strengthFactor * sb - baseFactor * bonus(p.stats.S);
    if (
      damage !== null &&
      !ranged &&
      talents.some((t) => t.name === "Strike Mighty Blow") &&
      !baseTalents.some((t) => t.name === "Strike Mighty Blow")
    )
      damage += 1;
    if (damage !== null && s.size === "Tiny" && !ranged) damage = null;
    if (/Vomit/.test(a.name) && numeric(tb) && numeric(p.toughnessBonus))
      damage = a.damage + tb - p.toughnessBonus;
    attacks.push({
      ...a,
      id,
      skill,
      damage,
      source: p.source,
      origin: "Printed",
      ...(s.attackOverrides[id] || {}),
    });
  }
  const gear = s.gear.map((g) => ({
    ...[...R.weapons, ...R.armour, ...R.gear, ...R.market].find(
      (x) => x.contentId === g.id,
    ),
    quantity: g.quantity,
  }));
  for (const w of gear.filter((x) => x.group)) {
    const name = `${w.kind === "ranged" ? "Ranged" : "Melee"} (${w.group})`;
    const formula = w.damage.match(/^(?:(SB|TB)\s*\+\s*)?(\d+)$/),
      points = formula
        ? Number(formula[2]) +
          (formula[1] === "SB" ? sb : formula[1] === "TB" ? tb : 0) +
          (w.kind === "melee" && formula[1] === "SB"
            ? ((damageMultiplier[s.size] || 1) - 1) * (sb || 0)
            : 0)
        : null;
    const owned = skills.find((x) => x.name === name);
    attacks.push({
      id: w.contentId,
      ranged: w.kind === "ranged",
      name: w.name,
      skill: owned?.total ?? stats[w.kind === "ranged" ? "BS" : "WS"],
      damage: points,
      source: w.source,
      origin: "Equipment",
      text: [w.kind === "ranged" ? w.reach : `Reach: ${w.reach}`, w.qualities]
        .filter(Boolean)
        .join(" · "),
      quantity: w.quantity,
    });
    if (!owned && M.skillInfo(R, name)?.advanced)
      issues.push(
        issue(
          "equipment.skill",
          `${w.name} needs ${name}. Add a suitable Skill bonus; the book permits suitable equipped creatures to possess the necessary Skills (p. 318).`,
          "warning",
          1,
          "#npc-add-skill",
        ),
      );
  }
  const extraAttacks = new Set(
    attacks.map((a) => a.name.replace(/^\d+ /, "").split(" (")[0]),
  );
  for (const t of traits.filter((x) => !x.printed)) {
    if (
      extraAttacks.has(t.name) ||
      ![
        "Bite",
        "Horns",
        "Tail",
        "Tongue",
        "Tentacles",
        "Breath",
        "Chill Grasp",
        "Ghostly Howl",
        "Vomit",
      ].includes(t.name)
    )
      continue;
    let damage = null,
      skill = stats.WS,
      text = R.traits.find((x) => x.name === t.name).text;
    if (t.name === "Bite") damage = Number(t.value) || null;
    if (t.name === "Horns") damage = sb === null ? null : sb + 4;
    if (t.name === "Tail") damage = sb === null ? null : sb + 2;
    if (["Tentacles", "Tongue"].includes(t.name)) damage = sb;
    if (t.name === "Tentacles") text = `${t.value} Free Attacks. ` + text;
    if (t.name === "Breath") {
      skill = stats.BS ?? 30;
      const f = {
        Acid: [tb, 4],
        Cold: [sb, 2],
        Electricity: [sb, 2],
        Fire: [sb, 3],
        Poison: [tb, 2],
      };
      const v = f[t.value];
      damage = v && v[0] !== null ? v[0] + v[1] : null;
      text =
        `${t.value}. Range ${(tb || 0) + 20} yards; area SB yards. ` + text;
    }
    if (t.name === "Vomit") {
      skill = stats.BS;
      damage = tb === null ? null : tb + 4;
    }
    attacks.push({
      id: `trait-attack-${t.id}`,
      name: t.name,
      skill,
      damage,
      text,
      source: t.source,
      origin: "Trait",
    });
  }
  if (["Construct", "Daemonic", "Ethereal", "Magical"].some(has))
    for (const a of attacks)
      if (!/Magical/.test(a.text))
        a.text = (a.text ? a.text + " · " : "") + "Magical";
  for (const a of attacks) {
    if (attackCharacteristic(a) === "BS" && a.damage !== null)
      for (const name of ["Accurate Shot", "Sure Shot"])
        if (
          talents.some((t) => t.name === name) &&
          (a.origin !== "Printed" || !baseTalents.some((t) => t.name === name))
        )
          a.damage++;
    if (
      a.origin !== "Printed" &&
      attackCharacteristic(a) === "WS" &&
      a.damage !== null &&
      talents.some((t) => t.name === "Strike Mighty Blow")
    )
      a.damage++;
    if (s.attackOverrides[a.id]) Object.assign(a, s.attackOverrides[a.id]);
  }
  if (p.name === "Giant Spider" && s.size === "Large")
    issues.push(
      issue(
        "size.spider-example",
        "The general Size rule (p. 360) gives Fangs +8 and Bite +6. The p. 361 example prints Fangs +5, omitting the primary attack’s extra SB; the user chose the general rule.",
        "warning",
        1,
        "#npc-size",
        361,
      ),
    );
  const protection = { Head: 0, Arms: 0, Body: 0, Legs: 0, Shield: 0 };
  const armour = [
    ...printedArmour(p).filter((x) => !s.removedArmour.includes(x.id)),
    ...armourOptions(p).filter((x) => s.optionalArmour.includes(x.id)),
    ...gear.filter((x) => x.ap !== undefined),
  ];
  const layers = new Map();
  for (const a of armour) {
    const shield = /Shield|Ironfist|Buckler/.test(a.name),
      locations = armourLocations(
        a.locations || a.text,
        shield ? "Shield" : "All",
      );
    const layer = shield
      ? "shield"
      : /Leather/i.test(a.name)
        ? "leather"
        : /Mail/i.test(a.name)
          ? "mail"
          : /Natural|Skin|Hide|Scales/i.test(a.name)
            ? "natural"
            : /^(?:Basic|Good|Best|Light|Medium|Heavy) Armour$/.test(a.name)
              ? "quick"
              : "plate";
    for (const l of locations) {
      const key = `${layer}:${l}`;
      layers.set(key, Math.max(layers.get(key) || 0, a.ap));
    }
  }
  const quick = [...layers.keys()].some((k) => k.startsWith("quick:"));
  for (const [key, ap] of layers) {
    const [layer, location] = key.split(":");
    if (!quick || ["quick", "shield", "natural"].includes(layer))
      protection[location] += ap;
  }
  for (const m of mutations) {
    if (m.name === "Iron Skin")
      for (const l of ["Head", "Arms", "Body", "Legs"]) protection[l] += 2;
    if (m.name === "Thorny Scales")
      for (const l of ["Head", "Arms", "Body", "Legs"]) protection[l]++;
    if (m.name === "Uneven Horns") protection.Head++;
  }
  const lores = magicLores(R, talents, traits),
    hasPetty = talents.some((x) => x.name === "Petty Magic"),
    patrons = traits
      .filter((x) => ["Blessed", "Miracles"].includes(x.name))
      .map((x) => x.value);
  for (const t of talents)
    if (/^(Bless|Invoke) \(/.test(t.name))
      patrons.push(t.name.match(/\((.+)\)/)[1]);
  const magic = [];
  const addSpell = (entry, lore, origin) => {
    if (
      entry &&
      !magic.some((x) => x.contentId === entry.contentId && x.lore === lore)
    )
      magic.push({ ...entry, lore, origin });
  };
  const spellText = p.sections.Spells || "";
  for (const grant of p.magicGrants || []) {
    const entry = R.spells.find((x) => x.name === grant.name);
    if (!s.removedSpells.includes(entry.contentId))
      addSpell(entry, grant.lore, "Printed");
  }
  for (const entry of R.spells)
    if (
      spellText.includes(entry.name) &&
      new RegExp(
        `(?:^|[ ,:])${entry.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:[ ,]|$)`,
      ).test(spellText) &&
      !s.removedSpells.includes(entry.contentId)
    )
      addSpell(
        entry,
        entry.category === "Arcane" ? lores[0] || "" : entry.category,
        "Printed",
      );
  for (const patron of [...new Set(patrons)]) {
    if (!R.config.gods.includes(patron))
      issues.push(
        issue(
          "magic.patron",
          `Choose a supported patron for ${patron || "the divine Trait"}.`,
          "error",
          1,
          "#npc-trait-value",
          359,
        ),
      );
    if (
      traits.some((x) => x.name === "Blessed" && x.value === patron) ||
      talents.some((x) => x.name === `Bless (${patron})`)
    )
      for (const name of R.config.blessings[patron] || [])
        addSpell(
          R.spells.find((x) => x.name === name),
          patron,
          "Blessings",
        );
  }
  const permitted = (entry, lore) =>
    entry.category === "Petty"
      ? hasPetty
      : entry.category === "Arcane"
        ? lores.includes(lore)
        : entry.category === "Blessing"
          ? magic.some((x) => x.contentId === entry.contentId)
          : R.config.gods.includes(entry.category)
            ? patrons.includes(entry.category) &&
              miracleChoices(R, entry.category, s.career).some(
                (x) => x.contentId === entry.contentId,
              ) &&
              (traits.some(
                (x) => x.name === "Miracles" && x.value === entry.category,
              ) ||
                talents.some((x) => x.name === `Invoke (${entry.category})`))
            : lores.includes(entry.category);
  for (const selected of [
    ...s.spells,
    ...s.ledger
      .filter((x) => x.type === "spell")
      .map((x) => ({ id: x.contentId, lore: x.lore })),
  ]) {
    const entry = R.spells.find((x) => x.contentId === selected.id);
    if (!entry || !permitted(entry, selected.lore))
      issues.push(
        issue(
          "magic.access",
          `The selected spell ${entry?.name || selected.id} requires its matching Talent, Lore or divine Trait.`,
          "error",
          2,
          "#npc-magic",
          entry?.source || { book: "core", page: 354 },
        ),
      );
    else addSpell(entry, selected.lore, "GM selection / XP");
  }
  if (template?.magic)
    for (const [category, max] of [
      ["Petty", template.magic.petty],
      ["Lore", template.magic.lore],
    ]) {
      const count = magic.filter(
        (x) =>
          x.category !== "Blessing" &&
          (category === "Petty"
            ? x.category === "Petty"
            : x.category !== "Petty" && !R.config.gods.includes(x.category)),
      ).length;
      const paidCount = s.ledger.filter(
        (x) =>
          x.type === "spell" &&
          (category === "Petty"
            ? R.spells.find((e) => e.contentId === x.contentId)?.category ===
              "Petty"
            : !["Petty", "Blessing", ...R.config.gods].includes(
                R.spells.find((e) => e.contentId === x.contentId)?.category,
              )),
      ).length;
      if (count - paidCount > max)
        issues.push(
          issue(
            "template.spell-limit",
            `${template.name} grants up to ${max} ${category} spells; ${count} are selected. Use paid development for additional spells.`,
            "error",
            2,
            "#npc-magic",
            354,
          ),
        );
    }
  if (
    has("Magic Resistance") &&
    (skills.some((x) => x.name.startsWith("Channelling") && x.advance > 0) ||
      talents.some((x) =>
        [
          "Arcane Magic",
          "Chaos Magic",
          "Bless",
          "Invoke",
          "Petty Magic",
          "Witch!",
        ].includes(M.base(x.name)),
      ) ||
      traits.some((x) =>
        ["Spellcaster", "Blessed", "Miracles"].includes(x.name),
      ))
  )
    issues.push(
      issue(
        "magic.resistance-conflict",
        "Magic Resistance conflicts with Channelling and the listed magical Talents. Remove one side of this combination.",
        "error",
        1,
        "#npc-traits",
        359,
      ),
    );
  if (mark?.value === "Khorne" && lores.length)
    issues.push(
      issue(
        "mark.khorne-casting",
        "Mark of Khorne permits Language (Magick) and Channelling only for dispelling; this NPC also has casting access.",
        "warning",
        2,
        "#npc-magic",
        359,
      ),
    );
  for (const t of traits) {
    const definition = R.traits.find((x) => x.contentId === t.id);
    if (!t.printed && definition?.parameter && !t.value.trim())
      issues.push(
        issue(
          "trait.parameter",
          `Set the ${definition.parameter} for ${t.name}.`,
          "error",
          1,
          "#npc-traits",
          definition.page,
        ),
      );
    if (
      !t.printed &&
      [
        "Bite",
        "Fear",
        "Terror",
        "Fly",
        "Web",
        "Ward",
        "Tentacles",
        "Many Heads",
        "Daemonic",
      ].includes(t.name) &&
      (!/^\d+\+?$/.test(t.value) || Number.parseInt(t.value, 10) < 1)
    )
      issues.push(
        issue(
          "trait.rating",
          `Enter a positive rating for ${t.name}.`,
          "error",
          1,
          "#npc-traits",
          definition.page,
        ),
      );
    if (t.name === "Venom")
      issues.push(
        issue(
          "venom.summary-conflict",
          "Venom follows the full p. 363 rule: Wounds inflict Poisoned; the difficulty affects recovery. Some printed creature summaries instead describe avoidance Tests.",
          "info",
          1,
          "#npc-traits",
          363,
        ),
      );
  }
  const spent = s.ledger.reduce((n, x) => n + x.cost, 0);
  if (spent > s.xpBudget)
    issues.push(
      issue(
        "xp.overspent",
        "The NPC's paid development exceeds its XP budget.",
        "error",
        1,
        "#npc-xp",
      ),
    );
  return {
    profile: p,
    career: s.career,
    template,
    name: s.name || p.name,
    stats,
    steps,
    size: s.size,
    tb,
    sb,
    traits,
    talents,
    skills,
    attacks,
    armour,
    protection,
    gear,
    magic,
    lores,
    hasPetty,
    patrons: [...new Set(patrons)],
    mutations,
    training,
    issues,
    spent,
    remaining: s.xpBudget - spent,
    notes: s.notes,
    anatomy: s.anatomy,
    hitLocations: {
      Standard: "Use the normal Hit Locations table (p. 163).",
      Quadruped: "Arm results hit forelegs; leg results hit rear legs.",
      Bird: "Arm results hit wings.",
      Snake: "01–19 Head; 20–00 Body.",
      Spider: "01–09 Head; 10–79 Legs; 80–00 Body.",
      Other:
        "GM selects appropriate locations. Tentacle, tail or wing Criticals use the Arm table with an appropriate description.",
    }[s.anatomy],
    walk: stats.M === null ? null : stats.M * 2,
    run: stats.M === null ? null : stats.M * 4 * (has("Sprinter") ? 1.5 : 1),
    combatInitiative:
      stats.I === null
        ? null
        : stats.I +
          (talents.some((x) => x.name === "Combat Reflexes") ? 20 : 0),
  };
}

export function npcMagicChoices(R, d) {
  return R.spells
    .flatMap((x) => {
      if (x.category === "Petty")
        return d.hasPetty ? [{ entry: x, lore: "Petty" }] : [];
      if (x.category === "Arcane")
        return d.lores.map((lore) => ({ entry: x, lore }));
      if (d.lores.includes(x.category)) return [{ entry: x, lore: x.category }];
      if (
        d.patrons.includes(x.category) &&
        miracleChoices(R, x.category, d.career).some(
          (entry) => entry.contentId === x.contentId,
        ) &&
        (d.traits.some(
          (t) => t.name === "Miracles" && t.value === x.category,
        ) ||
          d.talents.some((t) => t.name === `Invoke (${x.category})`))
      )
        return [{ entry: x, lore: x.category }];
      return [];
    })
    .filter(
      (x) =>
        !d.magic.some(
          (m) => m.contentId === x.entry.contentId && m.lore === x.lore,
        ),
    );
}

export function npcQuote(R, s, type, name, amount = 5, extra = {}) {
  const d = npcResult(R, s),
    career = R.careers.find((x) => x.id === s.career);
  if (!career) return { error: "Choose a Career for paid development." };
  if (
    ![1, 5].includes(amount) ||
    (type === "talent" && amount !== 1) ||
    (type === "spell" && amount !== 1)
  )
    return { error: "Choose a valid advancement amount." };
  const level = s.careerLevel,
    levels = career.levels.slice(0, level);
  let cost = 0,
    advances = 0;
  if (type === "char") {
    if (
      !M.KEYS.includes(name) ||
      !career.advanceScheme[name] ||
      career.advanceScheme[name] > level ||
      d.stats[name] === null
    )
      return {
        error:
          "This Characteristic is unavailable at the selected Career level.",
      };
    if (Object.hasOwn(s.overrides, name))
      return {
        error:
          "Clear the final GM score override before buying a Characteristic Advance, so the purchase can change its displayed score.",
      };
    if (!Number.isInteger(s.advanceCounts.char[name]))
      return {
        error:
          "Enter the existing Characteristic Advance count. The printed profile does not state it.",
      };
    advances = s.advanceCounts.char[name] + sumLedger(s, "char", name);
  } else if (type === "skill") {
    const eligible = levels.flatMap((l) =>
      l.skills.flatMap((n) => M.options(R, n, "skill")),
    );
    if (!eligible.includes(name))
      return { error: "This Skill is outside the selected Career levels." };
    const governing = M.skillInfo(R, name)?.char;
    if (
      !governing ||
      d.stats[governing] === null ||
      d.skills.some((x) => x.name === name && x.advance === null)
    )
      return {
        error:
          "Resolve the governing Characteristic and Skill bonus before buying Advances.",
      };
    if (!Number.isInteger(s.advanceCounts.skill[name]))
      return {
        error: "Enter the existing Skill Advance count used for pricing.",
      };
    advances = s.advanceCounts.skill[name] + sumLedger(s, "skill", name);
  } else if (type === "talent") {
    if (!npcCareerTalents(R, s, d).includes(name))
      return { error: "This Talent is outside the selected Career level." };
    const info = M.talentInfo(R, name);
    if (!info)
      return {
        error:
          "This printed Talent has no standalone core definition or purchase limit; retain it as a reference grant.",
      };
    const count = d.talents
      .filter((x) => x.name === name)
      .reduce((n, x) => n + x.ranks, 0);
    const configured = R.config.talentLimits[M.base(name)];
    const limit =
      configured === null ? null : (configured ?? (info?.limit ? null : 1));
    if (limit !== null && count >= limit)
      return { error: "This Talent has reached its core purchase limit." };
    const problem = talentPurchaseIssue(R, d, name);
    if (problem) return { error: problem };
    cost = 100;
  } else if (type === "spell") {
    const entry = R.spells.find((x) => x.contentId === extra.contentId),
      option = npcMagicChoices(R, d).find(
        (x) => x.entry.contentId === extra.contentId && x.lore === extra.lore,
      );
    if (!entry || !option)
      return {
        error:
          "This NPC cannot learn that spell with its current magic access.",
      };
    const count = d.magic.filter((x) =>
      ["Petty", ...R.config.gods].includes(entry.category)
        ? x.category === entry.category
        : x.lore === extra.lore &&
          !["Petty", "Blessing", ...R.config.gods].includes(x.category),
    ).length;
    advances = count;
    cost =
      entry.category === "Petty"
        ? 50 * (Math.floor(count / 5) + 1)
        : R.config.gods.includes(entry.category)
          ? 100 * (count + 1)
          : 100 * (Math.floor(count / 5) + 1);
  } else return { error: "Unknown NPC advancement." };
  if (type === "char" || type === "skill") {
    if (amount === 5 && advances % 5)
      return {
        error: "Complete the partial five-point band before buying +5.",
      };
    const costs =
      type === "char"
        ? amount === 1
          ? M.IND_CHAR_COST
          : M.CHAR_COST
        : amount === 1
          ? M.IND_SKILL_COST
          : M.SKILL_COST;
    cost = costs[Math.floor(advances / 5)];
    if (!numeric(cost))
      return {
        error: "The printed XP table has no price for this advancement band.",
      };
  }
  if (cost > d.remaining)
    return { error: `Needs ${cost - d.remaining} more XP.`, cost };
  return {
    cost,
    advances,
    source: {
      book: "core",
      page:
        type === "spell"
          ? M.talentInfo(
              R,
              type === "spell" && extra.lore === "Petty"
                ? "Petty Magic"
                : "Arcane Magic",
            )?.page || 191
          : amount === 1
            ? 364
            : 191,
    },
  };
}
function npcOptionsForQuote(R, n) {
  return grantChoices(R, { options: [n] }, "talent");
}

const MARK_TALENTS = {
  Khorne: [
    "Berserk Charge",
    "Combat Aware",
    "Combat Reflexes",
    "Furious Assault",
    "Implacable",
    "Magic Resistance",
    "Resistance (Magic)",
    "Resolute",
    "Strike Mighty Blow",
    "Warrior Born",
  ],
  Nurgle: [
    "Frightening",
    "Hardy",
    "Implacable",
    "Iron Jaw",
    "Menacing",
    "Resistance (Poison)",
    "Resistance (Disease)",
    "Robust",
    "Tenacious",
    "Very Resilient",
  ],
  Slaanesh: [
    "Attractive",
    "Blather",
    "Careful Strike",
    "Combat Master",
    "Gregarious",
    "Inspiring",
    "Lightning Reflexes",
    "Nimblefingered",
    "Resistant (Poison)",
    "Sharp",
  ],
  Tzeentch: [
    "Aethyric Attunement",
    "Arcane Magic (Any)",
    "Chaos Magic (Tzeentch)",
    "Fast Hands",
    "Instinctive Diction",
    "Magical Sense",
    "Petty Magic",
    "Second Sight",
    "War Wizard",
    "Witch!",
  ],
};
export function npcCareerTalents(R, s, d = npcResult(R, s)) {
  const career = R.careers.find((x) => x.id === s.career);
  const extra = d.traits
    .filter((x) => x.name === "Mark of Chaos")
    .flatMap((x) => MARK_TALENTS[x.value] || []);
  return [
    ...new Set(
      [...(career?.levels[s.careerLevel - 1].talents || []), ...extra].flatMap(
        (n) => npcOptionsForQuote(R, M.canon(n)),
      ),
    ),
  ].sort();
}
