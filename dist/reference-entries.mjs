// Printed source references are deliberately not creator profiles. A Fourth
// Edition Career or creature can be read without satisfying the 5e rule schema.
export const REFERENCE_CATEGORIES = [
  "rule",
  "table",
  "endeavour",
  "condition",
  "psychology",
  "property",
  "trait",
  "species",
  "career",
  "skill",
  "talent",
  "magic",
  "equipment",
  "profile",
  "template",
  "mutation",
];
// Keep reviewed NPC sources for a future search extension. The current shared
// reader excludes stat blocks and templates; GM creation uses its own catalogue.
export const isSearchCategoryEnabled = (category) =>
  category !== "profile" && category !== "template";

export function validateReferenceEntry(entry, book) {
  const nonempty = (value) => typeof value === "string" && !!value.trim();
  const page = String(entry?.page || "")
    .split(/[–-]/)
    .map(Number);
  if (
    !entry ||
    !nonempty(entry.id) ||
    !entry.id.startsWith(`${book}:reference:`) ||
    !/^[a-z0-9][a-z0-9-]*$/.test(entry.id.slice(`${book}:reference:`.length)) ||
    !nonempty(entry.name) ||
    !nonempty(entry.topic) ||
    !nonempty(entry.text) ||
    !REFERENCE_CATEGORIES.includes(entry.category) ||
    !(
      (Number.isInteger(entry.page) && entry.page > 0) ||
      (typeof entry.page === "string" && /^\d+[–-]\d+$/.test(entry.page))
    ) ||
    page.some((n) => !Number.isInteger(n) || n <= 0) ||
    (page.length === 2 && page[0] > page[1]) ||
    (entry.aliases !== undefined &&
      (!Array.isArray(entry.aliases) ||
        entry.aliases.some((x) => !nonempty(x)))) ||
    (entry.notes !== undefined && !nonempty(entry.notes)) ||
    Object.keys(entry).some(
      (key) =>
        ![
          "id",
          "name",
          "category",
          "topic",
          "page",
          "text",
          "aliases",
          "notes",
        ].includes(key),
    )
  )
    throw Error(`Invalid printed reference: ${entry?.id || book}`);
  return entry;
}
