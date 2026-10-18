import * as M from "./rules.mjs";
import { quoteRitual } from "./winds-of-magic.mjs";
import { quoteElfSpell, quoteTechnique, knownTechniques } from "./high-elf.mjs";
import { knownRunes } from "./dwarf-guide.mjs";
import { knownCants } from "./archives-iii.mjs";

export function magicRows(R, s) {
  const known = M.knownSpells(R, s),
    grants = M.spellGrants(R, s),
    out = [];
  for (const x of R.spells) {
    const owned = known.filter((k) => k.name === x.name),
      eligible = grants.filter(
        (g) => g.purchasable && g.choices.some((c) => c.name === x.name),
      );
    if (x.ritual) {
      const q = quoteRitual(R, s, x.name);
      out.push({
        ...x,
        type: "Ritual",
        lore: x.ritual.lores.includes("*")
          ? "Any Arcane Lore"
          : x.ritual.lores.join(", "),
        lores: x.ritual.lores,
        quote: q,
        owned: owned.length > 0,
      });
      continue;
    }
    if (["Elven Arcane", "High Magic"].includes(x.category)) {
      const q = quoteElfSpell(
        R,
        s,
        x.name,
        x.category === "High Magic" ? "High Magic" : undefined,
      );
      out.push({
        ...x,
        type: "Spell",
        lore: x.category,
        quote: q,
        owned: owned.length > 0,
      });
      continue;
    }
    if (eligible.length) {
      for (const g of eligible) {
        const q = M.quoteSpell(R, s, x.name, g.talent);
        out.push({
          ...x,
          type:
            g.category === "Old Faith"
              ? "Blessing"
              : R.config.gods.includes(g.category)
                ? "Miracle"
                : "Spell",
          lore: g.category,
          talent: g.talent,
          quote: q,
          owned: owned.some(
            (k) =>
              k.talent === g.talent ||
              (g.category === "Old Faith" && k.lore === "Old Faith"),
          ),
        });
      }
    } else if (owned.length) {
      for (const k of owned)
        out.push({
          ...x,
          ...k,
          type:
            x.category === "Blessing"
              ? "Blessing"
              : R.config.gods.includes(k.lore)
                ? "Miracle"
                : "Spell",
          owned: true,
        });
    } else
      out.push({
        ...x,
        type:
          x.category === "Blessing"
            ? "Blessing"
            : R.config.gods.includes(x.category)
              ? "Miracle"
              : "Spell",
        lore: x.category,
        quote: null,
        owned: false,
      });
  }
  const techniques = knownTechniques(R, s);
  for (const x of R.techniques || [])
    out.push({
      ...x,
      type: "Technique",
      lore: "Sword-dancing",
      quote: quoteTechnique(R, s, x.name),
      owned: techniques.some((k) => k.name === x.name),
    });
  const runes = knownRunes(R, s, M.derive(R, s).talents),
    talents = M.careerTalentOptions(R, s, M.derive(R, s).level);
  for (const x of R.runes || []) {
    const name = `${x.master ? "Master Rune Magic" : "Rune Magic"} (${x.form}: ${x.name})`,
      eligible = talents.includes(name);
    out.push({
      ...x,
      type: "Rune",
      lore: x.form,
      talent: name,
      quote: eligible ? M.quote(R, s, "talent", name) : null,
      owned: runes.some((k) => k.name === x.name),
    });
  }
  const cants = knownCants(R, s);
  for (const x of R.cants || [])
    out.push({
      ...x,
      type: "Cant",
      lore: x.lore,
      quote: null,
      owned: cants.some((k) => k.id === x.id),
    });
  return out;
}

export function filterMagic(
  rows,
  {
    query = "",
    type = "all",
    lore = "all",
    book = "all",
    status = "available",
  } = {},
) {
  const q = query.trim().toLowerCase();
  return rows
    .filter(
      (x) =>
        (type === "all" || x.type === type) &&
        (lore === "all" ||
          x.lore === lore ||
          x.lores?.includes(lore) ||
          x.lores?.includes("*")) &&
        (book === "all" || x.source.book === book) &&
        (!q || `${x.name} ${x.lore} ${x.text}`.toLowerCase().includes(q)) &&
        (status === "all" || status === "known"
          ? status === "all" || x.owned
          : !x.owned && x.quote && !x.quote.error),
    )
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name) ||
        (a.lore || "").localeCompare(b.lore || ""),
    );
}
