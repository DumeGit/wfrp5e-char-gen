import { issue, finishIssues } from "./issues.mjs";
import { legacyMechanic } from "./legacy.mjs";
// Explicit creator handlers for the supplied Dwarf Guide; no campaign automation.
const base = (name) => name.replace(/ \(.*/, "");
export const dwarfGuide = (R) => R.books.some((b) => b.id === "dwarf-guide");
export const dwarfSwaps = (R, s) =>
  dwarfGuide(R) && s.species === "Dwarf" && s.dwarfTrappingSwaps === true;
export function dwarfSkillRaw(R, s, raw) {
  if (!dwarfSwaps(R, s)) return raw;
  const spec = raw.match(/^(Melee|Ranged) \((.+)\)$/),
    groups = spec?.[2].split(/,\s*| or /) || [];
  if (spec?.[1] === "Ranged" && groups.includes("Bow"))
    return `Ranged (${[...new Set([...groups, "Crossbow", "Blackpowder"])].join(" or ")})`;
  if (
    spec?.[1] === "Melee" &&
    groups.some((x) => ["Cavalry", "Fencing", "Parry"].includes(x))
  )
    return `${raw} or Melee (Basic) or Ranged (Blackpowder)`;
  return raw;
}
export function dwarfGearSlots(R, s, slots) {
  if (!dwarfSwaps(R, s)) return slots;
  const careerSlots = slots.filter((x) =>
      /^(career|bonus|acquired)-/.test(x.key),
    ),
    bowSwapped = new Set();
  const mapped = slots.map((slot) => {
    if (!careerSlots.includes(slot)) return slot;
    const name = slot.name,
      weapon = R.weapons.find(
        (w) =>
          w.name === name ||
          w.name.replace(" (2H)", "") === name.replace(/ (with|and) .+$/, ""),
      );
    let extra = [];
    if (/^Hand Weapon(?: \(.+\))?$/.test(name))
      extra = ["Dwarf Axe", "Dwarf Warhammer"];
    else if (weapon?.group === "Bow") {
      extra = [
        "Dwarf Crossbow (2H) and Ammunition",
        "Dwarf Handgun (2H) and Ammunition",
      ];
      if (extra.includes(s.gearChoices[slot.key]))
        bowSwapped.add(
          slot.key.startsWith("career-")
            ? "career"
            : slot.key.startsWith("bonus-")
              ? "bonus"
              : slot.key,
        );
    } else if (["Cavalry", "Fencing", "Parry"].includes(weapon?.group))
      extra = ["Shield", "Pistol and Ammunition"];
    else if (/^(Riding Horse|Warhorse)$/.test(name))
      extra = ["Full Plate Armour and Helm"];
    return extra.length
      ? {
          ...slot,
          name: [name, ...extra].join(" or "),
          swapSource: { book: "dwarf-guide", page: 55 },
        }
      : slot;
  });
  // The printed replacement includes the bow's ammunition; never grant both sets.
  return mapped.filter(
    (slot) =>
      !(
        bowSwapped.has(
          slot.key.startsWith("career-")
            ? "career"
            : slot.key.startsWith("bonus-")
              ? "bonus"
              : slot.key,
        ) && /^(?:\d+ |\{?\d+d10\}? )?Arrows$/.test(slot.name)
      ),
  );
}
export function effectiveCareer(R, s) {
  const original = R.careers.find((c) => c.id === s.career);
  if (!original) return original;
  const c = structuredClone(original);
  for (const [level, id] of Object.entries(s.dwarfCareerUpdates || {})) {
    const update = R.careerUpdates?.find(
      (x) => x.id === id && x.careers.includes(c.id),
    );
    if (!update || update.unavailable || s.species !== "Dwarf") continue;
    c.levels[Number(level) - 1] = {
      ...structuredClone(update.profile),
      source: update.source,
      adaptation: update.adaptation,
    };
    if (update.characteristic) {
      for (const key of Object.keys(c.advanceScheme))
        if (c.advanceScheme[key] === Number(level)) c.advanceScheme[key] = null;
      const previous = c.advanceScheme[update.characteristic];
      c.advanceScheme[update.characteristic] = previous
        ? Math.min(previous, Number(level))
        : Number(level);
    }
  }
  return c;
}
export function defaultCareerResult(R, id) {
  const c = R.careers.find((x) => x.id === id);
  return c?.alternativeFor && R.careers.some((x) => x.id === c.alternativeFor)
    ? c.alternativeFor
    : id;
}
export function dwarfBackground(R, s, b) {
  if (!dwarfGuide(R) || s.species !== "Dwarf") return b;
  const names = R.dwarfCreation.names.rows,
    style = s.dwarfNameStyle === "Female" ? "female" : "male",
    parent = s.dwarfParentStyle === "Female" ? "female" : "male";
  return {
    ...b,
    forenames: names.map((x) => x[style]),
    surnames: names.map(
      (x) => x[parent] + (style === "female" ? "sdottir" : "sson"),
    ),
    source: { book: "dwarf-guide", page: 39 },
    dwarfNames: true,
  };
}
export function dwarfNameRoll(R, s, kind, roll) {
  const table = R.dwarfCreation.names,
    n = roll(1000, 39, kind, { book: "dwarf-guide", page: 39 }, 1),
    row = table.rows.find((x) => n >= x.min && n <= x.max),
    style =
      (kind === "surnames" ? s.dwarfParentStyle : s.dwarfNameStyle) === "Female"
        ? "female"
        : "male";
  if (!row) throw Error("Invalid Dwarf name roll.");
  return (
    row[style] +
    (kind === "surnames"
      ? s.dwarfNameStyle === "Female"
        ? "sdottir"
        : "sson"
      : "")
  );
}
export function runeTalentOptions(R, raw) {
  const kind = base(raw);
  if (!["Rune Magic", "Master Rune Magic"].includes(kind)) return null;
  const spec = (raw.match(/\((.*)\)/)?.[1] || "All Forms").replace(
    "Talismanic Runes",
    "Talisman Runes",
  );
  return (R.runes || [])
    .filter(
      (r) =>
        r.form !== "Doom" &&
        r.master === (kind === "Master Rune Magic") &&
        (spec === "All Forms" ||
          spec.includes(r.form + " Runes") ||
          spec === r.name ||
          spec === `${r.form}: ${r.name}`),
    )
    .map((r) => `${kind} (${r.form}: ${r.name})`);
}
export function knownRunes(R, s, talents) {
  const out = (R.runes || []).filter((r) =>
    talents.some(
      (t) =>
        t ===
        `${r.master ? "Master Rune Magic" : "Rune Magic"} (${r.form}: ${r.name})`,
    ),
  );
  return talents.some((t) => base(t) === "Master Rune Magic")
    ? [...out, ...(R.runes || []).filter((r) => r.form === "Doom")]
    : out;
}
export function dwarfTalentIssue(R, s, name, d) {
  const definition = R.talents.find((t) => base(t.name) === base(name));
  if (definition?.speciesOnly && !definition.speciesOnly.includes(s.species))
    return "This Dwarf Guide Talent requires a Dwarf; exceptions need GM agreement (p. 80).";
  if (definition?.limit) {
    const cap = Array.isArray(definition.limit)
        ? definition.limit.reduce((n, k) => n + Math.floor(d.stats[k] / 10), 0)
        : definition.limit,
      ranks = d.talents.filter((t) => base(t) === base(name)).length;
    if (ranks >= cap)
      return `Printed purchase limit reached: ${ranks}/${cap} (${base(name)}, ${R.books.find((b) => b.id === definition.source?.book)?.shortTitle || "supplied book"} p. ${definition.page}).`;
  }
  if (["Rune Magic", "Master Rune Magic"].includes(base(name))) {
    const r = R.runes.find(
      (r) =>
        name ===
        `${r.master ? "Master Rune Magic" : "Rune Magic"} (${r.form}: ${r.name})`,
    );
    if (!r) return "Choose a printed rune within the Career’s permitted forms.";
    if (d.talents.includes(name))
      return "This rune is already learned; choose a different rune.";
  }
  return "";
}
export function grudgeSlots(s, talents) {
  return talents
    .map((name, i) => ({ name, i }))
    .filter((x) => base(x.name) === "Ancestral Grudge");
}
export function dwarfReferences(R, s) {
  if (!dwarfGuide(R) || s.species !== "Dwarf") return [];
  return [
    {
      source: { book: "dwarf-guide", page: 42 },
      text: "The supplied appearance section refers to a table absent from this PDF. Core eye/hair choices are retained; its regional roll modifiers are not applied to a different table.",
    },
    ...(dwarfSwaps(R, s)
      ? [
          {
            source: { book: "dwarf-guide", page: 55 },
            text: "Optional Career weapon/horse replacements and matching weapon Skill choices enabled. Original options remain selectable. Unspecified ammunition quantities and Full Plate Armour composition remain unresolved.",
          },
        ]
      : []),
    ...(s.longbeard
      ? [
          {
            ...legacyMechanic("longbeard"),
            text: R.dwarfCreation.longbeard.text,
          },
        ]
      : []),
    ...Object.values(s.dwarfCareerUpdates || {})
      .map((id) => R.careerUpdates.find((x) => x.id === id))
      .filter(Boolean)
      .map((u) => ({
        source: u.source,
        adaptation: u.adaptation,
        text: `Career variant: ${u.profile.name}. ${u.conversion}`,
      })),
  ];
}
export function dwarfIssues(R, s, d, structured = false) {
  const issues = [];
  if (s.longbeard !== undefined && typeof s.longbeard !== "boolean")
    issues.push(
      issue(
        "dwarf.longbeard-state",
        "Invalid Longbeard selection.",
        0,
        "#longbeard-age",
        { book: "dwarf-guide", page: 50 },
      ),
    );
  if (
    ["dwarfNameStyle", "dwarfParentStyle"].some(
      (k) => s[k] !== undefined && !["Male", "Female"].includes(s[k]),
    )
  )
    issues.push(
      issue(
        "dwarf.name-column",
        "Choose a printed Dwarf name column.",
        0,
        '[data-bind="dwarfNameStyle"]',
        { book: "dwarf-guide", page: 39 },
      ),
    );
  if (
    s.grudgeTargets !== undefined &&
    (!Array.isArray(s.grudgeTargets) ||
      s.grudgeTargets.some((x) => typeof x !== "string"))
  )
    issues.push(
      issue(
        "dwarf.grudge-state",
        "Invalid Ancestral Grudge choices.",
        4,
        '[data-bind="grudgeTarget"]',
        { book: "dwarf-guide", page: 80 },
      ),
    );
  if (s.longbeard) {
    if (!dwarfGuide(R) || s.species !== "Dwarf")
      issues.push(
        issue(
          "dwarf.longbeard-species",
          "Longbeard requires Dwarf and the Dwarf Guide.",
          0,
          "#longbeard-age",
          { book: "dwarf-guide", page: 50 },
        ),
      );
    if (!Number.isInteger(s.longbeardAge) || s.longbeardAge < 120)
      issues.push(
        issue(
          "dwarf.longbeard-age",
          "Longbeard: enter an age of at least 120.",
          0,
          "#longbeard-age",
          { book: "dwarf-guide", page: 50 },
        ),
      );
  }
  if (
    s.dwarfTrappingSwaps !== undefined &&
    (typeof s.dwarfTrappingSwaps !== "boolean" ||
      (s.dwarfTrappingSwaps && (!dwarfGuide(R) || s.species !== "Dwarf")))
  )
    issues.push(
      issue(
        "dwarf.equipment-swaps",
        "Dwarf equipment swaps require Dwarf and the Dwarf Guide.",
        1,
        '[data-bind="dwarfTrappingSwaps"]',
        { book: "dwarf-guide", page: 55 },
      ),
    );
  for (const [level, id] of Object.entries(s.dwarfCareerUpdates || {}))
    if (
      s.species !== "Dwarf" ||
      !R.careerUpdates.some(
        (u) =>
          u.id === id &&
          u.careers.includes(s.career) &&
          u.profile.level === Number(level) &&
          !u.unavailable,
      )
    )
      issues.push(
        issue(
          "dwarf.career-variant",
          "Choose an available Dwarf Career level variant.",
          1,
          '[data-bind="dwarfCareerUpdate"]',
          { book: "dwarf-guide", page: "59–61" },
        ),
      );
  const slots = grudgeSlots(s, d.talents),
    targets = slots.map((_, i) =>
      typeof s.grudgeTargets?.[i] === "string" ? s.grudgeTargets[i].trim() : "",
    );
  if (
    targets.some((x) => !x) ||
    new Set(targets.map((x) => x.toLowerCase())).size !== targets.length
  )
    issues.push(
      issue(
        "dwarf.grudge-targets",
        "Ancestral Grudge: name a different culture or faction for each purchase.",
        4,
        '[data-bind="grudgeTarget"]',
        { book: "dwarf-guide", page: 80 },
      ),
    );
  return finishIssues(issues, structured);
}

export function dwarfGearIssue(R, s, item) {
  return dwarfGuide(R) &&
    s.career === "slayer" &&
    (R.armour.some((a) => a.name === item.name) ||
      /Shield|Buckler/.test(item.name))
    ? "Slayers cannot wear or carry armour or shields (Dwarf Guide p. 59)."
    : "";
}
