import { canonicalRuleName } from "./content-references.mjs";
import { issue, finishIssues, uniqueIssues, skillControl } from "./issues.mjs";
import { legacySources, legacyMechanic } from "./legacy.mjs";
import { effectiveCareer } from "./context-career.mjs";
import {
  bloodGrants,
  bloodAdjustments,
  elderSkills,
  startingElfResources,
  elfDiscount,
  mage,
  mageLoreCount,
  mageNextLoreIssue,
  highElfTalentIssue,
  highElfAdvanceIssue,
  highElfIssues,
  quoteElfSpell,
  quoteTechnique,
} from "./high-elf.mjs";
import {
  runeTalentOptions,
  dwarfTalentIssue,
  dwarfIssues,
  dwarfReferences,
  dwarfGuide,
  dwarfSkillRaw,
} from "./dwarf-guide.mjs";
import { miracleChoices, cultIssues } from "./cults.mjs";
// Game data comes from supplied books; Fifth Edition core governs creation and advancement.
import { marketCatalog } from "./market.mjs";
import {
  creationSpecies,
  startingTalentReplacement,
  originProfile,
  careerAvailable,
  careerCreationIssue,
} from "./origins.mjs";
import {
  speciesMechanics,
  speciesSkillName,
  skillCharacteristic,
  speciesSize,
  speciesLoreIssue,
} from "./species-mechanics.mjs";
import { chartGrants, starEffect, chartXP, chartIssues } from "./astrology.mjs";
import {
  archivesIII,
  oldFaith,
  spellChoices,
  spellDefinition,
} from "./archives-iii.mjs";
import {
  windsOfMagic,
  extraCareerSkills,
  psychometrySacrifice,
  psychicSkillIssue,
  womTalentIssue,
  womSpellAllowed,
  womIssues,
  collegeLores,
  affiliatedCareer,
  quoteRitual,
  pettySpellGrant,
} from "./winds-of-magic.mjs";
export const KEYS = [
  "WS",
  "BS",
  "S",
  "T",
  "I",
  "Ag",
  "Dex",
  "Int",
  "WP",
  "Fel",
];
export const CHAR_COST = [
  125, 175, 250, 350, 500, 700, 950, 1300, 1800, 2550, 3600, 5025, 6950, 9000,
  11250,
];
export const SKILL_COST = [
  50, 75, 100, 150, 250, 400, 600, 850, 850, 1700, 2500, 3500, 4750, 6500, 8500,
];
// Appendix II, p. 364: prices for one point, grouped in bands of five Advances.
export const IND_CHAR_COST = [
  25, 35, 50, 70, 100, 140, 190, 260, 360, 510, 720, 1005, 1390, 1800, 2250,
];
export const IND_SKILL_COST = [
  10, 15, 20, 30, 50, 80, 120, 170, 170, 340, 500, 700, 950, 1300, 1700,
];
export const base = (n) => n.replace(/ \(.*/, "");
export const canon = canonicalRuleName;
export function die(sides = 100, source = globalThis.crypto) {
  if (!Number.isInteger(sides) || sides < 2 || sides > 1000)
    throw Error("Invalid die");
  const arr = new Uint32Array(1),
    ceiling = Math.floor(4294967296 / sides) * sides;
  let n;
  do {
    source.getRandomValues(arr);
    n = arr[0];
  } while (n >= ceiling);
  return (n % sides) + 1;
}
export function roll(s, label, count, sides, page) {
  const values = Array.from({ length: count }, () => die(sides));
  s.rolls.push({
    at: new Date().toISOString(),
    label,
    dice: `${count}d${sides}`,
    values,
    total: values.reduce((a, b) => a + b, 0),
    page,
  });
  return values;
}
export function fresh() {
  return {
    version: 1,
    name: "",
    appearance: "",
    ambition: "",
    partyAmbition: "",
    notes: "",
    species: "Human",
    speciesMode: "choose",
    speciesAttempts: 0,
    career: "soldier",
    careerMode: "choose",
    careerAttempts: 0,
    careerOffers: [],
    bonusGear: [],
    charMode: "points",
    charRolls: [],
    charAttempts: 0,
    assignment: KEYS.map((_, i) => i),
    points: KEYS.map(() => 10),
    boost: {},
    speciesSkills: [],
    skillChoices: {},
    careerSkills: {},
    talentChoices: {},
    randomTalents: [],
    freeTalent: "",
    gearChoices: {},
    gearRolls: {},
    wealth: null,
    purchases: [],
    spells: [],
    spellLores: {},
    localRegion: "",
    gearState: {},
    coinStorage: "carried",
    background: {},
    dooming: "",
    xp: 1000,
    advanceSize: 5,
    ledger: [],
    rolls: [],
    sturdyRule: "creation",
    step: 0,
  };
}
export function skillInfo(R, name, s) {
  const info =
    R.skills.find((x) => x.name === name) ||
    R.skills.find((x) => x.name === base(name));
  return info && s
    ? { ...info, char: skillCharacteristic(R, s, name, info.char) }
    : info;
}
export function talentInfo(R, name) {
  return R.talents.find(
    (x) => base(x.name).toLowerCase() === base(canon(name)).toLowerCase(),
  );
}
export function options(R, raw, type = "skill", s) {
  if (s && type === "skill") raw = speciesSkillName(R, s, raw);
  raw = canon(raw);
  if (type === "talent") {
    const runes = runeTalentOptions(R, raw);
    if (runes !== null) return runes;
  }
  if (type === "talent" && raw === "Artistic") raw = "Artistic (Any One)";
  // Alternatives between distinct groups must be split before the inner specialisations.
  if (/^[^(]+ or [^(]+\(/.test(raw)) {
    const at = raw.indexOf(" or ");
    return [
      ...options(R, raw.slice(0, at), type, s),
      ...options(R, raw.slice(at + 4), type, s),
    ];
  }
  if (!raw.includes("(") && raw.includes(" or "))
    return raw.split(" or ").flatMap((x) => options(R, x, type, s));
  if (/\) or /.test(raw))
    return raw
      .split(/\) or /)
      .flatMap((v, i, a) =>
        options(R, v + (i < a.length - 1 ? ")" : ""), type, s),
      );
  const m = raw.match(/^(.+?) \((.+)\)$/);
  if (!m) return [raw];
  const [_, b, spec] = m;
  let opts;
  if (
    /Any|All|as Trade/.test(spec) ||
    (type === "talent" && b === "Craftsman" && spec === "Trade")
  ) {
    if (type === "skill") {
      opts = [
        ...(skillInfo(R, raw)?.options || []),
        ...(R.config.skillOptions?.[b] || []),
      ];
      if (spec === "Any Colour")
        opts = [
          "Aqshy",
          "Azyr",
          "Chamon",
          "Ghur",
          "Ghyran",
          "Hysh",
          "Shyish",
          "Ulgu",
        ];
      if (spec.includes("Domesticated")) opts = ["Dog", "Horse", "Pigeon"];
    } else {
      const expanded = (group) => [
        ...R.skills.find((x) => x.name === group).options,
        ...(R.config.skillOptions?.[group] || []),
      ];
      const dynamic = {
        Artistic: expanded("Art"),
        "Arcane Magic": R.config.colours,
        Bless: R.config.gods,
        Invoke: R.config.gods,
        Craftsman: expanded("Trade"),
        "Master Tradesman": expanded("Trade"),
        Savant: expanded("Lore"),
      };
      opts = dynamic[b] ||
        R.config.talentOptions[b] || [
          ...new Set(
            R.careers
              .flatMap((c) => c.levels.flatMap((l) => l.talents))
              .filter((t) => base(t) === b)
              .map((t) => t.match(/\((.+)\)/)?.[1])
              .filter((t) => t && !/Any|All| or |,/.test(t)),
          ),
        ];
    }
  } else opts = spec.split(/,\s*(?:or )?| or /);
  const result = opts.length ? opts.map((x) => `${b} (${x})`) : [raw];
  return s && type === "skill"
    ? [...new Set(result.map((x) => speciesSkillName(R, s, x)))]
    : result;
}
export function resolved(R, s, raw, key, type = "skill") {
  const opts = options(R, raw, type, s);
  const chosen = (type === "skill" ? s.skillChoices : s.talentChoices)[key];
  return opts.includes(chosen) ? chosen : opts[0];
}
export const career = effectiveCareer;
export function bonusTrappingSlots(R, s) {
  const seen = new Set();
  return career(R, s).levels[1].trappings.flatMap((name, i) => {
    if (name === "None" || seen.has(name)) return [];
    seen.add(name);
    return [{ name, i }];
  });
}
export function bonusTrappingLimit(R, s) {
  return Math.min(
    s.careerMode === "first" ? 2 : s.careerMode === "three" ? 1 : 0,
    bonusTrappingSlots(R, s).length,
  );
}
export function careerSkillSlots(R, s, level = 4) {
  const c = career(R, s);
  return [
    ...c.levels.slice(0, level).flatMap((l) =>
      l.skills.map((original, i) => {
        const speciesRaw = speciesSkillName(R, s, original),
          raw = dwarfSkillRaw(R, s, speciesRaw);
        return {
          key: `c${l.level}-${i}`,
          raw,
          level: l.level,
          source:
            raw !== speciesRaw
              ? { book: "dwarf-guide", page: 55 }
              : l.source || c.source,
          name: resolved(R, s, raw, `c${l.level}-${i}`),
        };
      }),
    ),
    ...extraCareerSkills(R, s),
  ];
}
export function speciesSkillSlots(R, s) {
  return creationSpecies(R, s).skills.map((raw, i) => ({
    key: `s-${i}`,
    raw,
    name: resolved(R, s, raw, `s-${i}`),
  }));
}
export function careerTalentOptions(R, s, level = 1) {
  return [
    ...new Set(
      career(R, s)
        .levels.slice(0, level)
        .flatMap((l) =>
          l.talents.flatMap((t) =>
            t.includes("(as Trade)")
              ? careerSkillSlots(R, s, level)
                  .filter((x) => base(x.name) === "Trade")
                  .map((x) => t.replace("(as Trade)", x.name.slice(6)))
              : options(R, t, "talent"),
          ),
        ),
    ),
  ].filter(
    (t) =>
      !windsOfMagic(R) ||
      !affiliatedCareer(s) ||
      base(t) !== "Arcane Magic" ||
      collegeLores.includes(t.match(/\((.*)\)/)?.[1]),
  );
}
export function speciesTalentOptions(R, s, index) {
  return [
    ...new Set(
      creationSpecies(R, s).talents[index].flatMap((raw) =>
        options(R, raw, "talent"),
      ),
    ),
  ];
}
export function freeTalents(R, s, includeChart = true) {
  const sp = creationSpecies(R, s),
    replacement = startingTalentReplacement(R, s),
    replace = (key, t) => (replacement?.slot === key ? replacement.talent : t);
  const grants = [
    ...sp.talents.map((_, i) => {
      const opts = speciesTalentOptions(R, s, i);
      return replace(
        `species-${i}`,
        opts.includes(s.talentChoices[`species-${i}`])
          ? s.talentChoices[`species-${i}`]
          : opts[0],
      );
    }),
    ...s.randomTalents.flatMap((t, i) =>
      psychometrySacrifice(R, s) && s.psychometrySlot === i
        ? []
        : [
            replace(
              `random-${i}`,
              t === "Artistic"
                ? s.talentChoices[`random-${i}`] || "Artistic (Drawing)"
                : t,
            ),
          ],
    ),
    ...(originProfile(R, s)?.grantedTalents || []),
    ...bloodGrants(R, s),
    ...(s.freeTalent ? [s.freeTalent] : []),
  ].map(canon);
  return includeChart ? [...grants, ...chartGrants(R, s, grants)] : grants;
}
export function initial(R, s) {
  const sp = R.species[s.species],
    ts = freeTalents(R, s);
  return Object.fromEntries(
    KEYS.map((k, i) => [
      k,
      sp.offsets[k] +
        (bloodAdjustments(R, s)[k] || 0) +
        (starEffect(R, s).adjustments[k] || 0) +
        (s.charMode === "points"
          ? s.points[i]
          : (s.charRolls[s.assignment[i]] ?? 10)) +
        (Number(s.boost[k]) || 0) +
        ts.filter((t) => R.config.talentEffects[t] === k).length * 5,
    ]),
  );
}
export function freeSkills(R, s) {
  const out = {};
  for (const l of creationSpecies(R, s).languages) out[`Language (${l})`] = 6;
  for (const slot of speciesSkillSlots(R, s))
    if (s.speciesSkills.includes(slot.key))
      out[slot.name] = (out[slot.name] || 0) + 1;
  for (const slot of careerSkillSlots(R, s, 1))
    out[slot.name] = (out[slot.name] || 0) + (s.careerSkills[slot.key] || 0);
  for (const [name, n] of Object.entries(elderSkills(R, s)))
    out[name] = (out[name] || 0) + n;
  return out;
}
export function derive(R, s) {
  const sp = R.species[s.species],
    c = career(R, s),
    stats = initial(R, s),
    charAdv = Object.fromEntries(KEYS.map((k) => [k, 0])),
    skills = freeSkills(R, s),
    talents = freeTalents(R, s),
    paidSkills = {};
  let level = 1,
    spent = 0,
    earnedBoxes = s.bonusGear.length;
  const trackerProgress = {},
    trackerCredits = [],
    trackerProgressAt = [];
  for (const x of s.ledger) {
    const amount = x.amount === 1 ? 1 : 5;
    spent += x.cost;
    if (x.type === "char") {
      stats[x.name] += amount;
      charAdv[x.name] += amount;
    }
    if (x.type === "skill") {
      skills[x.name] = (skills[x.name] || 0) + amount / 5;
      paidSkills[x.name] = (paidSkills[x.name] || 0) + amount / 5;
    }
    if (x.type === "talent") {
      talents.push(x.name);
      const effect = R.config.talentEffects[x.name];
      if (effect) stats[effect] += 5;
    }
    if (x.type === "promotion") level++;
    const eligible = x.inCareer ?? x.tick,
      pointAdvance = (x.type === "char" || x.type === "skill") && amount === 1;
    let credit = false,
      progress = 0;
    if (pointAdvance && eligible) {
      const key = `${x.type}:${x.name}`;
      trackerProgress[key] = (trackerProgress[key] || 0) + 1;
      progress = trackerProgress[key] % 5;
      credit = progress === 0 && earnedBoxes < 36;
    } else if (x.type === "char" || x.type === "skill" || x.type === "talent")
      credit = !!eligible && earnedBoxes < 36;
    else if (x.type === "trapping") credit = !!x.tick && earnedBoxes < 36;
    if (credit) earnedBoxes++;
    trackerCredits.push(credit);
    trackerProgressAt.push(progress);
  }
  // The sheet's 10, 12, and 14 boxes form one continuous track. Purchases
  // beyond a promotion threshold already fill boxes in the next segment.
  const trackers = [10, 12, 14]
    .map((width, i) =>
      Math.min(width, Math.max(0, earnedBoxes - [0, 10, 22][i])),
    )
    .concat(0);
  const ticks = trackers[level - 1];
  const sb = Math.floor(stats.S / 10),
    tb = Math.floor(stats.T / 10),
    wpb = Math.floor(stats.WP / 10),
    has = (t) => talents.includes(t),
    count = (t) => talents.filter((x) => x === t).length;
  const longbeard =
    dwarfGuide(R) && s.species === "Dwarf" && s.longbeard ? 1 : 0;
  const resources = startingElfResources(
      R,
      s,
      sp.fate -
        longbeard +
        (s.speciesMode === "first" &&
        s.careerMode === "first" &&
        s.charMode === "first"
          ? 1
          : 0),
      sp.fortune -
        longbeard +
        (s.speciesMode === "first" ? 1 : 0) +
        count("Luck"),
    ),
    { fate, fortune } = resources,
    movement = sp.movement + (has("Fleet-footed") ? 1 : 0);
  let capacity = sb + tb;
  if (s.sturdyRule === "creation" && (s.species === "Dwarf" || has("Sturdy")))
    capacity *= 2;
  else if (s.sturdyRule === "talent" && has("Sturdy")) capacity += sb;
  capacity +=
    count("Strong Back") === 1 ? 1 : count("Strong Back") >= 2 ? 3 : 0;
  capacity *= speciesMechanics(R, s).capacityMultiplier || 1;
  const size = speciesSize(R, s),
    wounds =
      size === "Small"
        ? 2 * tb + (has("Hardy") ? tb : 0)
        : (sb + 2 * tb + wpb + (has("Hardy") ? tb : 0)) *
          (size === "Large" ? 2 : 1);
  const currentSkills = [
    ...new Set(
      careerSkillSlots(R, s, level).flatMap((x) =>
        x.raw.includes("(All)") ||
        (mage(s) && x.raw === "Channelling (Any Colour)")
          ? options(R, x.raw, "skill", s)
          : [x.name],
      ),
    ),
  ];
  const ownedHigher = [
    ...s.bonusGear.map((x) => ({ level: 2 })),
    ...s.ledger.filter((x) => x.type === "trapping"),
  ];
  const purchaseNames = new Map(marketCatalog(R).map((x) => [x.id, x.name]));
  const ownedNames = [
    "Clothing",
    "Dagger",
    "Pouch",
    ...(R.config.classKit[c.class] || []),
    ...c.levels[0].trappings,
    ...Object.values(s.gearChoices),
    ...s.bonusGear.map((i) => c.levels[1].trappings[i]),
    ...s.ledger.filter((x) => x.type === "trapping").map((x) => x.name),
    ...(s.purchases || []).map((x) => purchaseNames.get(x.id)).filter(Boolean),
  ];
  let statusLevel = 1;
  for (let l = 2; l <= level; l++)
    if (
      c.levels[l - 1].trappings.some(
        (t) => ownedNames.includes(t) || /^(Weapon|Melee Weapon) \(Any/.test(t),
      )
    )
      statusLevel = l;
  const status = c.levels[statusLevel - 1];
  const warnings = [];
  if (
    speciesMechanics(R, s).skillCharacteristics?.["Language (Magick)"] === "T"
  )
    warnings.push(
      issue(
        "reference.ogre-casting",
        "Ogre casting: Language (Magick) uses Toughness instead of Intelligence (Archives II p. 31).",
        7,
        "main h1",
        { book: "archives-ii", page: 31 },
        "info",
      ),
    );
  if (speciesMechanics(R, s).gmApproval)
    warnings.push(
      issue(
        "reference.ogre-permission",
        speciesMechanics(R, s).gmApproval,
        7,
        "main h1",
        { book: "archives-ii", page: 21 },
        "info",
      ),
    );
  if (has("Doomed"))
    warnings.push(
      issue(
        "reference.dooming",
        "Agree a Dooming with the GM and record it in your notes (p. 118).",
        7,
        "main h1",
        { book: "core", page: 118 },
        "info",
      ),
    );
  if (has("Sturdy") || s.species === "Dwarf")
    warnings.push(
      issue(
        "reference.sturdy",
        `Encumbrance uses ${s.sturdyRule === "creation" ? "the creation rule on p. 40 (double SB + TB)" : "the Sturdy description on p. 127 (2 × SB + TB)"}. These passages disagree.`,
        7,
        "main h1",
        { book: "core", page: s.sturdyRule === "creation" ? 40 : 127 },
        "info",
      ),
    );
  if (s.species === "Halfling")
    warnings.push(
      issue(
        "reference.halfling-naming",
        "Species “Resistance (Chaos)” is recorded as Resistant (Chaos), matching the Talent heading (pp. 31, 124).",
        7,
        "main h1",
        { book: "core", page: 31 },
        "info",
      ),
    );
  if (s.species.endsWith("Elf"))
    warnings.push(
      issue(
        "reference.elf-naming",
        "Species “Entertain (Sing)” is recorded as Entertain (Singing); Acute Sight uses Acute Sense (Sight) (pp. 32–35, 111, 114).",
        7,
        "main h1",
        { book: "core", page: "32–35" },
        "info",
      ),
    );
  if (
    talents.some((t) => base(t) === "Bless" || base(t) === "Invoke") &&
    !skills.Pray
  )
    warnings.push(
      issue(
        "reference.pray",
        "Pray is untrained. Divine powers need a Pray Advance (p. 40).",
        7,
        "main h1",
        { book: "core", page: 40 },
        "info",
      ),
    );
  if (
    has("Petty Magic") ||
    talents.some((t) => base(t) === "Arcane Magic") ||
    has("Witch!")
  ) {
    if (!has("Second Sight"))
      warnings.push(
        issue(
          "reference.sight",
          "Second Sight is absent; review magical perception (p. 40).",
          7,
          "main h1",
          { book: "core", page: 40 },
          "info",
        ),
      );
    if (!skills["Language (Magick)"])
      warnings.push(
        issue(
          "reference.magick",
          "Language (Magick) is untrained (p. 40).",
          7,
          "main h1",
          { book: "core", page: 40 },
          "info",
        ),
      );
    if (
      !Object.keys(skills).some(
        (k) => k.startsWith("Channelling (") && skills[k],
      )
    )
      warnings.push(
        issue(
          "reference.channelling",
          "Channelling is untrained; review casting requirements (p. 40).",
          7,
          "main h1",
          { book: "core", page: 40 },
          "info",
        ),
      );
  }
  if (skills.Research && !has("Read/Write"))
    warnings.push(
      issue(
        "reference.literacy",
        "Research cannot be used without Read/Write (p. 113).",
        7,
        "main h1",
        { book: "core", page: 113 },
        "info",
      ),
    );
  if (level > statusLevel)
    warnings.push(
      issue(
        "reference.status",
        "Status remains at the highest level with an owned Trapping; promotion does not give equipment (p. 44).",
        7,
        "main h1",
        { book: "core", page: 44 },
        "info",
      ),
    );
  warnings.push(
    ...dwarfReferences(R, s).map((x) =>
      issue(
        "reference.dwarf",
        `Dwarf Guide p. ${x.source.page}: ${x.text}`,
        7,
        "main h1",
        x.source,
        "info",
      ),
    ),
  );
  return {
    stats,
    charAdv,
    skills,
    paidSkills,
    talents,
    level,
    ticks,
    trackers,
    earnedBoxes,
    trackerProgress,
    trackerCredits,
    trackerProgressAt,
    spent,
    remaining: s.xp + chartXP(R, s) - spent,
    xpBonus: chartXP(R, s),
    xpTotal: s.xp + chartXP(R, s),
    fate,
    fortune,
    movement,
    capacity,
    wounds,
    size,
    sb,
    tb,
    wpb,
    currentSkills,
    status: `${status.status} ${status.standing}`,
    notices: uniqueIssues(warnings),
    warnings: warnings.map((x) => x.message),
  };
}
export function invalidTalent(R, s, name) {
  const d = derive(R, s),
    b = base(name),
    magical = ["Arcane Magic", "Chaos Magic", "Petty Magic", "Witch!"],
    divine = ["Bless", "Invoke"],
    owned = d.talents.map(base),
    hasChannel = Object.keys(d.skills).some(
      (x) => base(x) === "Channelling" && d.skills[x],
    );
  const elf = highElfTalentIssue(R, s, name, d);
  if (elf) return elf;
  const dwarf = dwarfTalentIssue(R, s, name, d);
  if (dwarf) return dwarf;
  const wom = womTalentIssue(R, s, name, d.talents);
  if (wom) return wom;
  if (
    archivesIII(R) &&
    divine.includes(b) &&
    name.endsWith("(Rhya)") &&
    ["warrior-priest", "witch-hunter"].includes(s.career)
  )
    return "Rhya has no Warrior Priests or Witch Hunters (Archives III p. 73).";
  if (talentInfo(R, name)?.unavailable) return talentInfo(R, name).unavailable;
  if (b === "Arcane Magic") {
    const issue = speciesLoreIssue(R, s, name.match(/\((.*)\)/)?.[1]);
    if (issue) return issue;
  }
  const region = originProfile(R, s);
  if (
    divine.includes(b) &&
    s.regionalCareerBase === "flagellant" &&
    region?.allowedPatrons &&
    !region.allowedPatrons.includes(name.match(/\((.*)\)/)?.[1])
  )
    return `The Tilean Flagellant alternative must serve ${region.allowedPatrons.join(", ")} (Up in Arms p. 56).`;
  if (
    (b === "Magic Resistance" &&
      (hasChannel ||
        owned.some((x) => magical.includes(x) || divine.includes(x)))) ||
    (magical.includes(b) &&
      owned.some((x) => divine.includes(x) || x === "Magic Resistance")) ||
    (divine.includes(b) &&
      (hasChannel ||
        owned.some((x) => magical.includes(x) || x === "Magic Resistance")))
  )
    return "Incompatible magical or divine training (pp. 115, 121–123).";
  if (b === "Savant" && !d.skills[`Lore (${name.match(/\((.*)\)/)?.[1]})`])
    return "Savant requires an Advance in the chosen Lore (p. 125).";
  if (b === "Arcane Magic" && owned.includes(b) && !d.talents.includes(name)) {
    if (!s.species.endsWith("Elf"))
      return "Normally only one Arcane Lore; an additional Dark Lore is outside this creator (pp. 115, 237).";
    const lores = [
      ...new Set(d.talents.filter((t) => base(t) === "Arcane Magic")),
    ];
    if (lores.length >= d.wpb)
      return "Elves may learn Arcane Lores up to their Willpower Bonus (p. 237).";
    const previous = lores.at(-1),
      category = previous.match(/\((.*)\)/)[1];
    const count = R.highElfCreation
      ? mageLoreCount(R, s, category, d.talents)
      : knownSpells(R, s).filter(
          (x) =>
            !x.ritual &&
            (x.category === category ||
              (x.category === "Arcane" && x.talent === previous)),
        ).length;
    if (mage(s)) {
      const problem = mageNextLoreIssue(R, s, d);
      if (problem) return problem;
    } else if (count < 8)
      return `Learn at least 8 spells from ${previous} before another Lore (${count}/8; p. 237).`;
  }
  const otherDivine =
    divine.includes(b) && d.talents.find((t) => base(t) === b && t !== name);
  if (otherDivine)
    return `Already have ${otherDivine}; normally only one ${b} Talent (p. ${b === "Bless" ? 116 : 121}).`;
  const patronTalent =
    divine.includes(b) &&
    d.talents.find(
      (t) =>
        divine.includes(base(t)) &&
        t.match(/\((.*)\)/)?.[1] !== name.match(/\((.*)\)/)?.[1],
    );
  if (patronTalent) {
    const patron = patronTalent.match(/\((.*)\)/)?.[1];
    return `Requires ${b} (${patron}) to match your patron from ${patronTalent} (pp. 40, 116, 121).`;
  }
  const repeats = d.talents.filter((t) => t === name).length;
  if (!repeats) return "";
  // Explicit learning limits, not words in the effect such as "roll twice".
  const configured = R.config.talentLimits[b],
    limit =
      configured === null
        ? Infinity
        : (configured ?? (talentInfo(R, name)?.limit ? Infinity : 1));
  if (repeats >= limit)
    return "Already known; this purchase is not repeatable.";
  return "";
}
export function talentSkillUnlocks(R, s) {
  const d = derive(R, s);
  return [
    ...new Set([
      ...(psychometrySacrifice(R, s) ? ["Psychometry"] : []),
      ...d.talents
        .filter((t) => base(t) === "Craftsman")
        .map((t) => `Trade ${t.slice(t.indexOf("("))}`),
      ...(d.talents.includes("Seasoned Traveller") && s.localRegion
        ? [`Lore (${s.localRegion})`]
        : []),
    ]),
  ];
}
export function quote(R, s, type, name, amount = 5) {
  if (type === "technique") return quoteTechnique(R, s, name);
  const d = derive(R, s),
    c = career(R, s);
  let cost,
    tick = false,
    inCareer = false,
    error = "";
  if (type === "char") {
    const points = d.charAdv[name];
    inCareer = !!c.advanceScheme[name] && c.advanceScheme[name] <= d.level;
    tick =
      inCareer &&
      d.earnedBoxes < 36 &&
      (amount === 5 ||
        ((d.trackerProgress[`char:${name}`] || 0) + 1) % 5 === 0);
    if (!KEYS.includes(name)) error = "Unknown Characteristic";
    else if (![1, 5].includes(amount)) error = "Advance must be +1 or +5";
    else if (amount === 5 && points % 5)
      error =
        "Finish this Characteristic’s current five-point band with +1 Advances before buying +5 (p. 364).";
    cost =
      (amount === 1 ? IND_CHAR_COST : CHAR_COST)[
        amount === 1
          ? Math.min(Math.floor(points / 5), 14)
          : Math.floor(points / 5)
      ] * (inCareer ? 1 : 2);
  }
  if (type === "skill") {
    const info = skillInfo(R, name),
      points = Math.round((d.skills[name] || 0) * 5);
    inCareer = d.currentSkills.includes(name);
    tick =
      inCareer &&
      d.earnedBoxes < 36 &&
      (amount === 5 ||
        ((d.trackerProgress[`skill:${name}`] || 0) + 1) % 5 === 0);
    if (![1, 5].includes(amount)) error = "Advance must be +1 or +5";
    else if (amount === 5 && points % 5)
      error =
        "Finish this Skill’s current five-point band with +1 Advances before buying +5 (p. 364).";
    cost =
      (amount === 1 ? IND_SKILL_COST : SKILL_COST)[
        Math.min(Math.floor(points / 5), 14)
      ] * (inCareer ? 1 : 2);
    if (!info) error = "Unknown Skill";
    else if (info.speciesOnly && !info.speciesOnly.includes(s.species))
      error =
        "This Skill requires a Dwarf; exceptions need GM agreement (Dwarf Guide p. 80).";
    else if (
      !inCareer &&
      info.advanced &&
      !talentSkillUnlocks(R, s).includes(name)
    )
      error =
        "Non-career Advanced Skills require a Training Endeavour (p. 44).";
    if (
      base(name) === "Language" &&
      name !== "Language (Magick)" &&
      d.talents.includes("Linguistics")
    )
      cost = 50;
    if (
      base(name) === "Channelling" &&
      d.talents.some((t) =>
        ["Bless", "Invoke", "Magic Resistance"].includes(base(t)),
      )
    )
      error = "Incompatible with divine training or Magic Resistance.";
    if (speciesSkillName(R, s, name) !== name)
      error = `${s.species} learns ${speciesSkillName(R, s, name)} instead (${R.species[s.species].source.book} p. 34).`;
    if (base(name) === "Channelling") {
      const issue = speciesLoreIssue(R, s, name.match(/\((.*)\)/)?.[1]);
      if (issue) error = issue;
    }
  }
  if (type === "talent") {
    cost = 100;
    inCareer = careerTalentOptions(R, s, d.level).includes(name);
    tick = inCareer && d.earnedBoxes < 36;
    error = !inCareer
      ? "Not available in this Career level."
      : invalidTalent(R, s, name);
  }
  if (type === "promotion") {
    cost = 100;
    if (d.level === 4) error = "Already at the final Career level.";
    else if (d.ticks < [10, 12, 14][d.level - 1])
      error = `Requires ${[10, 12, 14][d.level - 1]} tracker boxes and the Advance Career Endeavour (p. 196).`;
  }
  if (type === "skill") {
    const issue = psychicSkillIssue(R, s, name, d.skills);
    if (issue) error = issue;
  }
  const elfIssue = highElfAdvanceIssue(R, s, type, name, amount, d);
  if (elfIssue) error = elfIssue;
  const fullCost = cost;
  cost = elfDiscount(R, s, type, name, cost);
  if (!Number.isFinite(cost))
    error = "This advance is beyond the published XP table (p. 191).";
  if (cost > d.remaining && !error)
    error = `Requires ${cost} XP; ${d.remaining} remain.`;
  const page = type === "promotion" ? 196 : amount === 1 ? 364 : 191,
    definition =
      type === "talent"
        ? talentInfo(R, name)?.source
        : type === "skill"
          ? skillInfo(R, name)?.source
          : undefined;
  return {
    type,
    name,
    cost,
    tick,
    inCareer,
    error,
    ...(type === "skill" &&
    c.legacySailor &&
    ["Athletics", "Melee (Basic)", "Intuition"].includes(name)
      ? { legacySources: legacySources(R, legacyMechanic("sailor")) }
      : {}),
    ...(cost !== fullCost
      ? {
          discount: "Blood of Aenarion · Martial Prodigy; High Elf Guide p. 51",
        }
      : {}),
    amount: ["char", "skill"].includes(type) ? amount : undefined,
    page,
    source: { book: "core", page },
    ...(definition ? { definition } : {}),
    ...(inCareer
      ? {
          eligibility:
            type === "skill"
              ? careerSkillSlots(R, s).find(
                  (x) => x.name === name && x.level <= d.level,
                )?.source || c.source
              : c.source,
        }
      : {}),
  };
}
export function purchase(R, s, type, name, amount = 5) {
  const q = quote(R, s, type, name, amount);
  if (q.error) throw Error(q.error);
  delete q.error;
  const d = derive(R, s);
  if (type === "talent" && name === "Petty Magic") q.freeSpells = d.wpb;
  if (type === "promotion")
    q.name = `${career(R, s).levels[d.level - 1].name} → ${career(R, s).levels[d.level].name}`;
  s.ledger.push(q);
}
export function validation(R, s, structured = false) {
  const e = [],
    sp = creationSpecies(R, s),
    c = career(R, s);
  if (s.origin && !originProfile(R, s))
    e.push(
      issue(
        "origin.unavailable",
        "Choose an origin available to your Species and enabled books.",
        0,
        "#regional-origin",
        { book: "core", page: 27 },
      ),
    );
  const repl = startingTalentReplacement(R, s);
  if (
    s.originTalentSlot &&
    (!repl ||
      ![
        ...sp.talents.map((_, i) => `species-${i}`),
        ...s.randomTalents.map((_, i) => `random-${i}`),
      ].includes(repl.slot))
  )
    e.push(
      issue(
        "origin.talent-slot",
        "Choose a valid regional starting Talent to replace.",
        0,
        '[data-bind="originTalentSlot"]',
        { book: "core", page: 27 },
      ),
    );
  if (!careerAvailable(R, s, c))
    e.push(
      issue(
        "career.unavailable",
        "Choose a Career available to your Species.",
        1,
        "#career-search",
        { book: "core", page: 36 },
      ),
    );
  const careerIssue = careerCreationIssue(R, s, derive(R, s).talents);
  if (careerIssue)
    e.push(
      issue(
        "career.prerequisite",
        careerIssue,
        1,
        "#prereq-freeTalent",
        c.source,
      ),
    );
  if (
    s.charMode === "points" &&
    (s.points.reduce((a, b) => a + b, 0) !== 100 ||
      s.points.some((x) => x < 4 || x > 16))
  )
    e.push(
      issue(
        "characteristics.points",
        "Allocate exactly 100 Characteristic points, 4–16 in each.",
        2,
        "#point-0",
        { book: "core", page: 38 },
      ),
    );
  if (
    s.charMode !== "points" &&
    (s.charRolls.length !== 10 || new Set(s.assignment).size !== 10)
  )
    e.push(
      issue(
        "characteristics.assignment",
        "Assign each of the ten rolled Characteristic results once.",
        2,
        '[data-bind="assignment"]',
        { book: "core", page: 38 },
      ),
    );
  const boost = Object.values(s.boost).reduce((a, b) => a + Number(b), 0),
    allowed = s.charMode === "first" ? 6 : s.charMode === "rearrange" ? 3 : 0;
  if (
    boost > allowed ||
    KEYS.some(
      (k) =>
        (s.boost[k] || 0) < 0 ||
        ((s.boost[k] || 0) > 0 && c.advanceScheme[k] !== 1),
    )
  )
    e.push(
      issue(
        "characteristics.boost",
        "Starting Characteristic increases must fit the selected method and first Career level.",
        2,
        '[data-bind="boost"]',
        { book: "core", page: 38 },
      ),
    );
  if (
    s.speciesSkills.length !== 5 ||
    new Set(
      speciesSkillSlots(R, s)
        .filter((x) => s.speciesSkills.includes(x.key))
        .map((x) => x.name),
    ).size !== 5
  )
    e.push(
      issue(
        "skills.species",
        "Select five different Species Skills.",
        3,
        '[data-bind="speciesSkills"]',
        { book: "core", page: 39 },
      ),
    );
  if (Object.values(s.careerSkills).reduce((a, b) => a + b, 0) !== 8)
    e.push(
      issue(
        "skills.career",
        "Allocate eight free Career Skill Advances.",
        3,
        '[data-action="skill-plus"]',
        { book: "core", page: 39 },
      ),
    );
  const elder = elderSkills(R, s),
    free = freeSkills(R, s);
  for (const [name, n] of Object.entries(free))
    if (
      n - (elder[name] || 0) > 3 &&
      !sp.languages.some((l) => name === `Language (${l})`)
    )
      e.push(
        issue(
          "skills.creation-cap",
          `${name} exceeds the three-Advance creation limit.`,
          3,
          skillControl(careerSkillSlots(R, s, 1), name),
          { book: "core", page: 39 },
        ),
      );
  if (s.randomTalents.length !== sp.randomTalents)
    e.push(
      issue(
        "talents.random",
        `Roll ${sp.randomTalents} random Species Talents.`,
        4,
        '[data-action="random-talents"]',
        { book: "core", page: 39 },
      ),
    );
  if (!careerTalentOptions(R, s).includes(s.freeTalent))
    e.push(
      issue(
        "talents.career",
        "Choose one free first-level Career Talent.",
        4,
        "#freeTalent",
        { book: "core", page: 39 },
      ),
    );
  if (
    new Set(freeTalents(R, s, false)).size !== freeTalents(R, s, false).length
  )
    e.push(
      issue(
        "talents.distinct",
        "Starting Talents must be distinct; change the free Career choice.",
        4,
        "#freeTalent",
        { book: "core", page: 39 },
      ),
    );
  if (s.freeTalent) {
    const problem = invalidTalent(
      R,
      {
        ...s,
        chart: { ...s.chart, enabled: false },
        freeTalent: "",
        ledger: [],
      },
      s.freeTalent,
    );
    if (problem)
      e.push(
        issue(
          "talents.career-prerequisite",
          "Free Career Talent: " + problem,
          4,
          "#freeTalent",
          { book: "core", page: 39 },
        ),
      );
  }
  if (!s.wealth)
    e.push(
      issue(
        "gear.wealth",
        "Roll starting wealth.",
        5,
        '[data-action="wealth"]',
        { book: "core", page: 41 },
      ),
    );
  if (
    s.bonusGear.length !== bonusTrappingLimit(R, s) ||
    new Set(s.bonusGear).size !== s.bonusGear.length ||
    s.bonusGear.some((i) => !bonusTrappingSlots(R, s).some((x) => x.i === i))
  )
    e.push(
      issue(
        "gear.bonus",
        "Select the bonus level-two Trappings earned by the Career roll.",
        1,
        '[data-bind="bonusGear"]',
        { book: "core", page: 36 },
      ),
    );
  for (const name of Object.keys(derive(R, s).skills)) {
    const info = skillInfo(R, name);
    if (
      info?.speciesOnly &&
      !info.speciesOnly.includes(s.species) &&
      derive(R, s).skills[name] > 0
    )
      e.push(
        issue(
          "skills.species-restriction",
          `${name} requires a Dwarf (Dwarf Guide p. 80).`,
          6,
          ".ledger-section",
          { book: "dwarf-guide", page: 80 },
        ),
      );
  }
  e.push(
    ...highElfIssues(R, s, true),
    ...chartIssues(R, s, options, invalidTalent, true),
    ...womIssues(R, s, true),
    ...cultIssues(R, s, true),
    ...dwarfIssues(R, s, derive(R, s), true),
  );
  return finishIssues(e, structured);
}
export function spellGrants(R, s) {
  const d = derive(R, s),
    out = [],
    spells = spellChoices(R);
  for (const name of [...new Set(d.talents)]) {
    let category,
      count = 1;
    const b = base(name);
    if (name === "Petty Magic") {
      category = "Petty";
      count = freeTalents(R, s).includes(name)
        ? Math.floor(initial(R, s).WP / 10)
        : s.ledger.find((x) => x.type === "talent" && x.name === name)
            ?.freeSpells || 0;
      count = pettySpellGrant(R, s, count);
    } else if (name === "Bless (Old Faith)" && oldFaith(R)) {
      category = "Old Faith";
      count = 6;
    } else if (b === "Arcane Magic" || b === "Invoke")
      category = name.match(/\((.*)\)/)[1];
    else if (name === "Witch!") category = "Witch!";
    else continue;
    const cult = b === "Invoke" && R.cults.find((x) => x.name === category);
    const choices = (cult ? miracleChoices(R, category, s.career) : spells)
      .filter((x) => !x.ritual && womSpellAllowed(R, s, x))
      .filter((x) =>
        category === "Old Faith"
          ? x.category === "Blessing"
          : category === "Witch!"
            ? !speciesLoreIssue(R, s, x.category) &&
              [...R.config.colours, "Witchcraft"].includes(x.category)
            : cult ||
              x.category === category ||
              (b === "Arcane Magic" && x.category === "Arcane"),
      );
    out.push({
      talent: name,
      category,
      count,
      purchasable: b !== "Bless",
      choices: cult
        ? choices.map((x) => ({
            ...x,
            category,
            lore: category,
            grantSource: cult.source,
          }))
        : choices,
    });
  }
  return out;
}
export function knownSpells(R, s) {
  const d = derive(R, s),
    names = [];
  let offset = 0;
  for (const g of spellGrants(R, s)) {
    for (const name of s.spells.slice(offset, offset + g.count))
      if (name) names.push({ name, talent: g.talent, lore: g.category });
    offset += g.count;
  }
  for (const x of s.ledger.filter((x) => x.type === "spell"))
    names.push({
      name: x.name,
      talent: x.talent,
      lore:
        x.talent === "High Magic"
          ? "High Magic"
          : x.talent?.match(/\((.*)\)/)?.[1],
    });
  for (const t of d.talents)
    if (base(t) === "Bless" && t !== "Bless (Old Faith)") {
      const god = t.match(/\((.*)\)/)[1];
      for (const n of R.config.blessings[god] || [])
        names.push({ name: `Blessing of ${n}`, talent: t, lore: god });
    }
  const unique = new Map();
  for (const ref of names) {
    const spell = spellDefinition(R, ref.name);
    if (spell) {
      const cult = R.cults.find((x) => x.name === ref.lore);
      unique.set(`${ref.talent || ""}:${ref.name}`, {
        ...spell,
        ...ref,
        ...(cult ? { category: ref.lore, grantSource: cult.source } : {}),
        displayName:
          spell.category === "Arcane" || cult
            ? `${spell.name} (${ref.lore})`
            : spell.name,
      });
    }
  }
  return [...unique.values()];
}
export function quoteSpell(R, s, name, talent) {
  const elf = quoteElfSpell(R, s, name, talent);
  if (elf) return elf;
  const ritual = quoteRitual(R, s, name, talent);
  if (ritual) return ritual;
  const g = spellGrants(R, s).find((x) => x.talent === talent),
    known = knownSpells(R, s);
  if (!g?.purchasable || !g.choices.some((x) => x.name === name)) return null;
  const count = known.filter(
    (x) =>
      x.talent === talent &&
      !x.ritual &&
      (x.category === "Elven Arcane" ||
        g.choices.some((y) => y.name === x.name)),
  ).length;
  const normal =
    g.category === "Witch!"
      ? 150 +
        50 *
          s.ledger.filter((x) => x.type === "spell" && x.talent === talent)
            .length
      : (g.category === "Petty" ? 50 : 100) *
        (Math.min(4, Math.floor(Math.max(0, count - 1) / 5)) + 1);
  const cost = elfDiscount(R, s, "spell", name, normal);
  const page =
    g.category === "Petty"
      ? 123
      : g.category === "Witch!"
        ? 128
        : R.config.gods.includes(g.category)
          ? 121
          : 115;
  const owned = known.some(
      (x) =>
        x.name === name &&
        (x.talent === talent ||
          (g.category === "Old Faith" && x.lore === "Old Faith")),
    ),
    cult = R.cults.find((x) => x.name === g.category);
  return {
    type: "spell",
    name,
    talent,
    cost,
    tick: false,
    ...(cost !== normal
      ? {
          discount: "Blood of Aenarion · Magical Prodigy; High Elf Guide p. 51",
        }
      : {}),
    page,
    source: { book: "core", page },
    definition: spellDefinition(R, name)?.source,
    ...(g.category === "Old Faith"
      ? { eligibility: { book: "archives-iii", page: 58 } }
      : cult
        ? { eligibility: cult.source }
        : {}),
    error: owned
      ? "Already known."
      : cost > derive(R, s).remaining
        ? "Not enough XP."
        : "",
  };
}
export function purchaseSpell(R, s, name, talent) {
  const q = quoteSpell(R, s, name, talent);
  if (!q) throw Error("No matching spell-learning Talent.");
  if (q.error) throw Error(q.error);
  delete q.error;
  s.ledger.push(q);
}
