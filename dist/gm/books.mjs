import { assembleBooks } from "../books.mjs";

// GM availability is separate from PC book choices and the all-book reader.
export const bookId = (entry) =>
  entry.source?.book || entry.id?.split(":")[0] || "core";
export const sourceLabel = (entry) =>
  `${{ core: "Core", "up-in-arms": "Up in Arms" }[bookId(entry)] || bookId(entry)} · p. ${entry.source?.page || entry.page}`;
export function gmCatalogue(data, books = ["core"]) {
  return {
    ...data,
    profiles: data.profiles.filter((p) => books.includes(bookId(p))),
    templates: data.templates.filter((p) => books.includes(bookId(p))),
    training: (data.training || []).filter((t) => books.includes(bookId(t))),
  };
}
export function validateGMBooks(data, books) {
  if (
    !Array.isArray(books) ||
    !books.includes("core") ||
    new Set(books).size !== books.length ||
    books.some(
      (id) => !(data.books || [{ id: "core" }]).some((b) => b.id === id),
    )
  )
    throw Error("Choose supported GM books, including the Fifth Edition core.");
  return books;
}
export function createGMRules(library, data) {
  const cache = new Map();
  return (draft) => {
    if (draft?.type !== "wfrp-gm")
      throw Error(
        "Choose a current NPC & creature save file for this core version.",
      );
    const books = validateGMBooks(data, draft.books),
      key = [...books].sort().join("|");
    if (!cache.has(key)) {
      const rules = assembleBooks(library, books);
      for (const book of data.books.filter((b) => books.includes(b.id))) {
        const pack = rules.books.find((b) => b.id === book.id);
        if (
          !pack ||
          pack.version !== book.version ||
          pack.source.sha256 !== book.source.sha256
        )
          throw Error(
            "GM source and installed book versions do not match. Reload the updated app.",
          );
      }
      cache.set(key, rules);
    }
    return cache.get(key);
  };
}
