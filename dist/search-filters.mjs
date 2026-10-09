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
  equipment: [["type", "Trapping type"]],
};
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
  return Object.entries(filters).every(
    ([key, value]) =>
      !value || (allowed.has(key) && row.filterValues?.[key]?.includes(value)),
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
}
export function filterOptions(rows, category, key) {
  if (key === "label") return RUNE_LABELS;
  return [
    ...new Set(
      rows
        .filter((row) => category === "all" || searchCategory(row) === category)
        .flatMap((row) => row.filterValues?.[key] || []),
    ),
  ].sort((a, b) => a.localeCompare(b));
}
