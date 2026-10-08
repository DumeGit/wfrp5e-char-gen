// Archives III p. 86: optional free Cants for an owned Colour Lore Talent.
// This module selects references; it never applies live casting or power effects.
export const gmCantBook = (R) => R.books.some((b) => b.id === "archives-iii");
const chosen = (s, lore) =>
  Array.isArray(s.cants?.choices?.[lore]) ? s.cants.choices[lore] : [];
export function calculateGMCants(R, s, r) {
  const issues = [],
    grants = [];
  const add = (code, message, target) =>
    issues.push({
      code,
      message,
      severity: "error",
      source: { book: "archives-iii", page: 86 },
      control: { step: code === "cants.book" ? 0 : 2, target },
    });
  if (!s.cants?.enabled) return { grants, cants: [], issues };
  if (!gmCantBook(R)) {
    add(
      "cants.book",
      "Enable Archives III to use optional Cants.",
      "#gm-book-archives-iii",
    );
    return { grants, cants: [], issues };
  }
  r.spells.forEach((spell, i) => {
    if (
      spell.category === "Arcane" &&
      !r.magicLores.includes(s.spellLores?.[spell.contentId])
    )
      add(
        "cants.spell-lore",
        `Choose a Lore for ${spell.name} before counting its Cant grants.`,
        `#gm-spell-lore-${i}`,
      );
  });
  for (const lore of new Set((R.cants || []).map((x) => x.lore))) {
    if (
      !r.talents.some((t) => t.name === `Arcane Magic (${lore})`) ||
      !r.magicLores.includes(lore)
    )
      continue;
    const spells = r.spells.filter(
      (x) =>
        !x.ritual &&
        (x.category === lore ||
          (x.category === "Arcane" && s.spellLores?.[x.contentId] === lore)),
    ).length;
    if (!spells) continue;
    const count = spells >= 6 ? 3 : spells >= 3 ? 2 : 1,
      choices = R.cants.filter((x) => x.lore === lore),
      ids = chosen(s, lore);
    grants.push({ lore, spells, count, choices });
    if (
      ids.length !== count ||
      new Set(ids).size !== count ||
      ids.some((id) => !choices.some((x) => x.id === id))
    )
      add(
        "cants.choices",
        `Choose ${count} distinct ${lore} Cant${count === 1 ? "" : "s"} (${spells} known Lore spells).`,
        `#gm-cant-${lore}-${Math.max(
          0,
          Array.from({ length: count }, (_, i) => i).findIndex(
            (i) =>
              !choices.some((x) => x.id === ids[i]) ||
              ids.indexOf(ids[i]) !== i,
          ),
        )}`,
      );
  }
  return {
    grants,
    issues,
    cants: grants.flatMap((g) =>
      chosen(s, g.lore)
        .slice(0, g.count)
        .map((id) => g.choices.find((x) => x.id === id))
        .filter(Boolean),
    ),
  };
}
export function syncGMCants(R, s, r) {
  s.spellLores = gmCantBook(R)
    ? Object.fromEntries(
        Object.entries(s.spellLores).filter(
          ([id, lore]) =>
            r.spells.some(
              (x) => x.contentId === id && x.category === "Arcane",
            ) && r.magicLores.includes(lore),
        ),
      )
    : {};
  if (!gmCantBook(R)) s.cants.enabled = false;
  s.cants.choices = s.cants.enabled
    ? Object.fromEntries(
        calculateGMCants(R, s, r).grants.map((g) => [
          g.lore,
          chosen(s, g.lore)
            .slice(0, g.count)
            .map((id) => (g.choices.some((x) => x.id === id) ? id : "")),
        ]),
      )
    : {};
}
export function validateGMCants(R, s, r) {
  const plain = (x) => x && typeof x === "object" && !Array.isArray(x);
  if (
    !plain(s.spellLores) ||
    !plain(s.cants) ||
    typeof s.cants.enabled !== "boolean" ||
    !plain(s.cants.choices) ||
    Object.keys(s.cants).length !== 2 ||
    Object.keys(s.cants).some((k) => !["enabled", "choices"].includes(k))
  )
    throw Error("Invalid GM Cant controls.");
  if (
    !gmCantBook(R) &&
    (s.cants.enabled ||
      Object.keys(s.cants.choices).length ||
      Object.keys(s.spellLores).length)
  )
    throw Error("GM Cants and Lore assignments require Archives III.");
  for (const [id, lore] of Object.entries(s.spellLores))
    if (
      typeof lore !== "string" ||
      !r.magicLores.includes(lore) ||
      !r.spells.some((x) => x.contentId === id && x.category === "Arcane")
    )
      throw Error("Invalid GM Arcane spell Lore.");
  const grants = calculateGMCants(R, s, r).grants;
  for (const [lore, ids] of Object.entries(s.cants.choices)) {
    const grant = grants.find((g) => g.lore === lore);
    if (
      !grant ||
      !Array.isArray(ids) ||
      ids.length > grant.count ||
      ids.some(
        (id) =>
          typeof id !== "string" ||
          (id && !grant.choices.some((x) => x.id === id)),
      ) ||
      new Set(ids.filter(Boolean)).size !== ids.filter(Boolean).length
    )
      throw Error("Invalid GM Cant choices.");
  }
}
