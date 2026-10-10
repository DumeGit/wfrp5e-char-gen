import { sourceLabel as sharedSourceLabel } from "../sources.mjs";
import { assembleBooks } from "../books.mjs";

// GM availability is separate from PC book choices and the all-book reader.
export const bookId = (entry) =>
  entry.source?.book || entry.id?.split(":")[0] || "core";
let sourceBooks = [];
export const registerGMSourceBooks = (books) => {
  sourceBooks = books;
};
export const sourceLabel = (entry) =>
  sharedSourceLabel({ books: sourceBooks }, entry, { legacy: false });
export const foundationBooks = (data) =>
  data.books.filter((book) =>
    [...data.profiles, ...data.templates].some(
      (entry) => bookId(entry) === book.id,
    ),
  );
export function gmCatalogue(data, books = ["core"]) {
  return {
    ...data,
    books: data.books.map((book) => ({
      ...book,
      profileCount:
        book.profileCount ??
        data.profiles.filter((p) => bookId(p) === book.id).length,
      templateCount:
        book.templateCount ??
        data.templates.filter((t) => bookId(t) === book.id).length,
    })),
    profiles: data.profiles.filter((p) => books.includes(bookId(p))),
    templates: data.templates.filter((p) => books.includes(bookId(p))),
    training: data.training || [],
  };
}
export function validateGMBooks(data, books) {
  if (
    !Array.isArray(books) ||
    !books.includes("core") ||
    new Set(books).size !== books.length ||
    books.some((id) => !foundationBooks(data).some((b) => b.id === id))
  )
    throw Error("Choose supported GM books, including the Fifth Edition core.");
  return books;
}
// One immutable all-book options context. Draft books gate only foundations.
export function assembleGMOptions(library) {
  const ids = library.packs
    .filter((pack) => pack.manifest.kind !== "variant")
    .map((pack) => pack.manifest.id);
  const rules = assembleBooks(library, ids);
  // Equipment-only variants are explicit source alternatives in the GM picker,
  // never replacements of its baseline catalogue or foundation-book toggles.
  for (const pack of library.packs.filter(
    (p) =>
      p.manifest.kind === "variant" &&
      p.data.weapons?.length &&
      Object.keys(p.data).every((key) =>
        [
          "weapons",
          "market",
          "coverage",
          "referenceEntries",
          "ruleReferences",
        ].includes(key),
      ),
  )) {
    const alternate = assembleBooks(library, [...ids, pack.manifest.id]);
    for (const kind of ["weapons", "market"])
      for (const entry of alternate[kind].filter(
        (x) => x.source.book === pack.manifest.id,
      ))
        rules[kind].push({
          ...entry,
          name: `${entry.name} (${pack.manifest.shortTitle})`,
        });
    rules.books.push(
      alternate.books.find((book) => book.id === pack.manifest.id),
    );
  }
  // Waaagh! is a GM option, not a playable PC Colour Lore.
  if (ids.includes("tribes-tribulations"))
    rules.config.colours = [
      ...rules.config.colours,
      "Little Waaagh!",
      "Big Waaagh!",
    ];
  return rules;
}
export function createGMRules(library, data) {
  const rules = assembleGMOptions(library);
  sourceBooks = rules.books;
  for (const book of data.optionBooks || []) {
    const pack = rules.books.find((b) => b.id === book.id);
    if (
      !pack ||
      pack.version !== book.version ||
      pack.source.sha256 !== book.source.sha256
    )
      throw Error(
        "GM options and installed book versions do not match. Reload the updated app.",
      );
  }
  if (data.optionBooks?.length !== rules.books.length)
    throw Error(
      "GM options inventory does not match the installed books. Reload the updated app.",
    );
  return (draft) => {
    if (draft?.type !== "wfrp-gm")
      throw Error(
        "Choose a current NPC & creature save file for this core version.",
      );
    validateGMBooks(data, draft.books);
    return rules;
  };
}
