import * as M from "./rules.mjs";
import { deftMiracleAdaptation } from "./deft-steps.mjs";
import { creationSpecies, originProfile } from "./origins.mjs";
import {
  elderSkills,
  highElfReferences,
  knownTechniques,
} from "./high-elf.mjs";
import { dwarfReferences, knownRunes } from "./dwarf-guide.mjs";
import { starEffect } from "./astrology.mjs";
import { divineReference, knownCants } from "./archives-iii.mjs";
import { womReferences, psychometrySacrifice } from "./winds-of-magic.mjs";
import { equipmentSize } from "./equipment-sizing.mjs";
import {
  legacySources,
  isLegacy,
  legacyMechanic,
  legacyCareerSkill,
} from "./legacy.mjs";

const convertedTalents = new Set([
  "Dicer",
  "Striding Gait",
  "Tunnel Fighter",
  "Public Speaker",
  "Trick Rider",
]);
export function legacyOption(R, s, kind, name) {
  const sources = [],
    add = (entry) => sources.push(...legacySources(R, entry));
  const definition =
    kind === "skill"
      ? M.skillInfo(R, name, s)
      : kind === "talent"
        ? M.talentInfo(R, name)
        : null;
  add(definition);
  const c = M.career(R, s),
    sp = creationSpecies(R, s),
    d = M.derive(R, s);
  if (kind === "skill") {
    if (d.currentSkills.includes(name)) add(legacyCareerSkill(c, name));
    // Changed allocations do not change the rules for unchanged core native languages.
    if (
      M.speciesSkillSlots(R, s).some(
        (x) => x.name === name && s.speciesSkills.includes(x.key),
      )
    )
      add(sp);
    if (elderSkills(R, s)[name]) add(legacyMechanic("elder"));
    if (name === "Psychometry" && psychometrySacrifice(R, s))
      add(legacyMechanic("psychometry"));
    if (
      c.legacySailor &&
      ["Athletics", "Melee (Basic)", "Intuition"].includes(name)
    )
      add(legacyMechanic("sailor"));
  }
  if (kind === "talent") {
    if (
      c.source.book === "deft-steps" &&
      M.careerTalentOptions(R, s, d.level).includes(name) &&
      (name === "Invoke (Ranald)" || M.base(name) === "Impassioned Zeal")
    )
      add({
        source: c.source,
        adaptation:
          name === "Invoke (Ranald)"
            ? "Printed aspect-specific Invoke uses Invoke (Ranald), retaining this Career’s printed Miracle list."
            : "Printed Impassioned Zeal omits its Cause; an explicit Cause is required, with normal purchase limits.",
      });
    // Regional omission/reallocation does not change every core Talent's own rule.
    if (
      convertedTalents.has(M.base(name)) &&
      c.adaptation &&
      M.careerTalentOptions(R, s, d.level).includes(name)
    )
      add({
        source: c.source,
        adaptation: `Printed older Talent option replaced with core ${M.base(name)}.`,
      });
    if (
      c.name === "Fieldwarden" &&
      M.careerTalentOptions(R, s, d.level).includes(name) &&
      (/^Fearless \(/.test(name) || name === "Savant (Moot)")
    )
      add({ source: c.source, adaptation: c.adaptation });
    if (starEffect(R, s).talent === name) add(legacyMechanic("astrology"));
    if (name === "Invoke (Old Faith)") add(legacyMechanic("oldFaith"));
    if (
      name === "Petty Magic" &&
      s.career === "winds-of-magic:career:mundane-alchemist"
    )
      add(legacyMechanic("alchemist"));
  }
  for (const x of s.ledger || [])
    if (x.name === name && x.type === kind) add(x);
  return { ...definition, legacySources: sources };
}
export function legacyGear(R, s, slot, name = slot.name) {
  const sources = legacySources(R, slot);
  let profile;
  for (const group of ["weapons", "armour", "gear", "market"])
    for (const item of R[group] || [])
      if (item.name === name || item.id === slot.marketId) {
        sources.push(...legacySources(R, item));
        profile ??= item;
      }
  const sizing = equipmentSize(R, s, name, profile);
  // Native Ogre profiles keep printed values; only the agreed general sizing interpretation is tagged.
  if (s.species === "Ogre" && sizing.multiplier === 2)
    sources.push(...legacySources(R, legacyMechanic("ogreSizing")));
  return { legacySources: sources };
}
export function legacyMagic(R, s, entry) {
  const sources = legacySources(R, entry);
  sources.push(
    ...legacySources(R, deftMiracleAdaptation(R, s.career, entry.name)),
  );
  if (
    s.career === "winds-of-magic:career:mundane-alchemist" &&
    entry.category === "Petty" &&
    !s.ledger.some((x) => x.type === "spell" && x.name === entry.name)
  )
    sources.push(...legacySources(R, legacyMechanic("alchemist")));
  if (entry.category === "Elven Arcane")
    sources.push(...legacySources(R, legacyMechanic("elvenArcane")));
  const patron = entry.lore || entry.talent?.match(/^Invoke \((.*)\)$/)?.[1];
  if (
    (patron === "Evawn" && entry.name === "Trickster’s Glamour") ||
    (patron === "Mabyn" && entry.name === "You Saw Nothing")
  )
    sources.push(
      ...legacySources(
        R,
        R.cults.find((x) => x.name === patron),
      ),
    );
  for (const x of s.ledger || [])
    if (x.type === "spell" && x.name === entry.name)
      sources.push(...legacySources(R, x));
  return { ...entry, legacySources: sources };
}
export function legacyContext(R, s) {
  const d = M.derive(R, s),
    entries = [
      creationSpecies(R, s),
      originProfile(R, s),
      M.career(R, s),
      ...highElfReferences(R, s),
      ...dwarfReferences(R, s),
      ...womReferences(R, s),
      ...divineReference(R, s),
      ...M.knownSpells(R, s).map((x) => legacyMagic(R, s, x)),
      ...knownRunes(R, s, d.talents),
      ...knownTechniques(R, s),
      ...knownCants(R, s),
      ...s.ledger,
    ];
  if (s.longbeard) entries.push(legacyMechanic("longbeard"));
  if (s.species === "Ogre") entries.push(legacyMechanic("ogreCapacity"));
  if (s.chart?.enabled) entries.push(legacyMechanic("astrology"));
  for (const name of d.talents)
    entries.push(legacyOption(R, s, "talent", name));
  for (const name of Object.keys(d.skills))
    if (d.skills[name] > 0) entries.push(legacyOption(R, s, "skill", name));
  return { legacySources: entries.flatMap((x) => legacySources(R, x)) };
}
export function legacySummary(R, s) {
  const context = legacyContext(R, s);
  return isLegacy(R, context)
    ? `Legacy adaptations: ${[...new Set(context.legacySources.map((x) => R.books.find((b) => b.id === x.book)?.shortTitle || x.book))].join("; ")}. Specific changed rules are identified in the complete record.`
    : "";
}
