// Shared filter vocabulary. Values are build-time source metadata, never character state.
export const RUNE_LABELS = [
  "No label",
  "Weapon Rune",
  "Armour Rune",
  "Runic Talisman",
  "Protection Rune",
  "Engineering Rune",
  "Doom Rune",
  "Master Rune",
];
export const CATEGORY_FILTERS = {
  career: [
    ["class", "Class"],
    ["species", "Species"],
  ],
  mutation: [["type", "Mutation type"]],
  property: [
    ["type", "Quality or Flaw"],
    ["applicable", "Applicable to"],
  ],
  rune: [
    ["applicable", "Applicable to"],
    ["label", "Rune label"],
  ],
  skill: [
    ["type", "Skill type"],
    ["characteristic", "Characteristic"],
  ],
  magic: [
    ["type", "Spell type"],
    ["lore", "Lore / Patron"],
  ],
  equipment: [
    ["type", "Trapping type"],
    ["group", "Trapping group"],
    ["weaponGroup", "Weapon group"],
  ],
};
const trappingKeys = ["type", "group", "weaponGroup"];
export const CHARACTERISTICS = {
  WS: "Weapon Skill",
  BS: "Ballistic Skill",
  S: "Strength",
  T: "Toughness",
  I: "Initiative",
  Ag: "Agility",
  Dex: "Dexterity",
  Int: "Intelligence",
  WP: "Willpower",
  Fel: "Fellowship",
};
export function searchCategory(row) {
  if (row.kind === "magic" && row.label === "Rune") return "rune";
  if (row.kind === "magic" && row.label === "Technique") return "technique";
  return row.kind;
}
export function matchesSearchFilters(row, category = "all", filters = {}) {
  if (category !== "all" && searchCategory(row) !== category) return false;
  const allowed = new Set([
    "book",
    ...(CATEGORY_FILTERS[category] || []).map(([key]) => key),
  ]);
  return (
    Object.entries(filters).every(
      ([key, value]) =>
        !value ||
        (allowed.has(key) && row.filterValues?.[key]?.includes(value)),
    ) &&
    (category !== "equipment" ||
      !trappingKeys.some((key) => filters[key]) ||
      row.trappingPaths?.some((path) =>
        trappingKeys.every(
          (key, i) =>
            !filters[key] || (path[i] || "Not specified") === filters[key],
        ),
      ))
  );
}
export function searchBookId(id, books) {
  const pack = books.find((book) => book.id === id);
  if (pack?.kind !== "variant") return id;
  const parents = books.filter(
    (book) =>
      book.kind !== "variant" &&
      book.source?.sha256 === pack.source?.sha256 &&
      book.source?.file === pack.source?.file,
  );
  if (parents.length !== 1)
    throw Error(`Ambiguous reference variant book: ${id}`);
  return parents[0].id;
}
export function validateSearchFilters(row, books) {
  const values = row.filterValues;
  const allowed = new Set([
    "book",
    ...(CATEGORY_FILTERS[searchCategory(row)] || []).map(([key]) => key),
  ]);
  if (
    !values ||
    typeof values !== "object" ||
    Array.isArray(values) ||
    JSON.stringify(values.book) !==
      JSON.stringify([searchBookId(row.entry.source.book, books)]) ||
    Object.entries(values).some(
      ([key, list]) =>
        !allowed.has(key) ||
        !Array.isArray(list) ||
        !list.length ||
        new Set(list).size !== list.length ||
        list.some((value) => typeof value !== "string" || !value.trim()),
    ) ||
    [...allowed].some((key) => !values[key]) ||
    values.label?.some((value) => !RUNE_LABELS.includes(value)) ||
    values.characteristic?.some((value) => !CHARACTERISTICS[value])
  )
    throw Error("Invalid book reference filters.");
  if (searchCategory(row) === "equipment") {
    const paths = row.trappingPaths;
    if (
      !Array.isArray(paths) ||
      !paths.length ||
      paths.some(
        (path) =>
          !Array.isArray(path) ||
          !path.length ||
          path.length > 3 ||
          path.some((value) => typeof value !== "string" || !value.trim()),
      ) ||
      new Set(paths.map((path) => JSON.stringify(path))).size !==
        paths.length ||
      trappingKeys.some(
        (key, i) =>
          JSON.stringify(values[key]) !==
          JSON.stringify([
            ...new Set(paths.map((path) => path[i] || "Not specified")),
          ]),
      )
    )
      throw Error("Invalid trapping reference filters.");
  } else if (row.trappingPaths !== undefined)
    throw Error("Unexpected trapping reference filters.");
}
export function filterOptions(rows, category, key, filters = {}) {
  if (key === "label") return RUNE_LABELS;
  if (category === "equipment" && trappingKeys.includes(key)) {
    const depth = trappingKeys.indexOf(key);
    return [
      ...new Set(
        rows
          .filter((row) => row.kind === "equipment")
          .flatMap((row) =>
            (row.trappingPaths || [])
              .filter((path) =>
                trappingKeys
                  .slice(0, depth)
                  .every(
                    (parent, i) =>
                      !filters[parent] || path[i] === filters[parent],
                  ),
              )
              .map((path) => path[depth]),
          )
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }
  return [
    ...new Set(
      rows
        .filter((row) => category === "all" || searchCategory(row) === category)
        .flatMap((row) => row.filterValues?.[key] || []),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

// Native option groups separate magical traditions from divine patrons.
// Membership follows the generated spell/prayer type, never name guesses.
export function filterOptionGroups(rows, category, key, filters = {}) {
  const values = filterOptions(rows, category, key, filters);
  if (category !== "magic" || key !== "lore") return [{ label: "", values }];
  const groups = new Map([
    ["Lores", new Set()],
    ["Patrons", new Set()],
    ["Other", new Set()],
  ]);
  for (const row of rows.filter((row) => searchCategory(row) === "magic")) {
    const label = row.filterValues.type.some((type) =>
      ["Blessing", "Miracle"].includes(type),
    )
      ? "Patrons"
      : "Lores";
    for (const value of row.filterValues.lore)
      groups.get(value === "Not specified" ? "Other" : label).add(value);
  }
  return [...groups]
    .map(([label, members]) => ({
      label,
      values: values.filter((value) => members.has(value)),
    }))
    .filter((group) => group.values.length);
}

export function searchFilterFields(rows, category, filters = {}) {
  if (category !== "equipment") return CATEGORY_FILTERS[category] || [];
  return CATEGORY_FILTERS.equipment
    .filter(
      ([key], depth) =>
        depth === 0 ||
        (trappingKeys.slice(0, depth).every((parent) => filters[parent]) &&
          filterOptions(rows, category, key, filters).length),
    )
    .map(([key, label]) => [
      key,
      key === "group" && filters.type === "Weapons" ? "Weapon type" : label,
    ]);
}

export function changeSearchFilter(category, filters, key, value) {
  const next = { ...filters, [key]: value };
  if (category === "equipment")
    for (const child of trappingKeys.slice(trappingKeys.indexOf(key) + 1))
      delete next[child];
  return next;
}
