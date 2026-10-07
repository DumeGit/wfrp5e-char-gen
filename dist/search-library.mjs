import { assembleBooks } from "./books.mjs";
import { buildSearchIndex, normalizeSearch } from "./book-search.mjs";
import { legacySources } from "./legacy.mjs";

// Build time only: each pack is read in its own dependency context. Character
// selections and cross-book withdrawals must not hide a source from the reader.
export function buildReferenceLibrary(library, gm) {
  const found = new Map();
  for (const pack of library.packs) {
    const R = assembleBooks(library, [pack.manifest.id]);
    for (const row of buildSearchIndex(R)) {
      const previous = found.get(row.key);
      if (previous) {
        previous.aliases = [...new Set([...previous.aliases, ...row.aliases])];
        continue;
      }
      found.set(row.key, { ...row, legacy: legacySources(R, row.entry) });
    }
  }
  for (const [collection, kind] of [
    ["profiles", "profile"],
    ["templates", "template"],
    ["mutations", "mutation"],
  ])
    for (const x of gm[collection]) {
      const { notes, ...entry } = x;
      const fields = [x.text || "", x.category || ""];
      found.set(x.id, {
        key: x.id,
        kind,
        name: x.name,
        entry: {
          ...entry,
          contentId: x.id,
          source: { book: "core", page: x.page },
        },
        aliases: [],
        textFields: fields,
        legacy: [],
        normalizedName: normalizeSearch(x.name),
        searchable: normalizeSearch([x.name, ...fields].join(" ")),
      });
    }
  return {
    schemaVersion: 1,
    books: library.packs.map((p) => p.manifest),
    rows: [...found.values()].map((row) => {
      const { shop, keywords, normalizedAliases, ...rest } = row;
      return {
        ...rest,
        normalizedAliases: row.aliases.map(normalizeSearch),
        searchable: normalizeSearch(
          [row.name, ...row.aliases, ...row.textFields].join(" "),
        ),
      };
    }),
  };
}

let pending;
// Grouped Skills and Talents share their profile. Ship it once and derive
// normalised matching strings on first search instead of transmitting copies.
export function compactReferenceLibrary(payload) {
  const entries = [],
    identities = new Map();
  return {
    schemaVersion: payload.schemaVersion,
    books: payload.books,
    entries,
    rows: payload.rows.map(
      ({ entry, searchable, normalizedName, normalizedAliases, ...row }) => {
        const identity = JSON.stringify(entry);
        if (!identities.has(identity)) {
          identities.set(identity, entries.length);
          entries.push(entry);
        }
        return { ...row, entryRef: identities.get(identity) };
      },
    ),
  };
}
export async function loadReferenceLibrary(library, readJSON) {
  const read = async () => {
    const response = await fetch(
      new URL("./data/search-library.json", import.meta.url),
    );
    if (!response.ok) throw Error("Could not load book references. Try again.");
    return response.json();
  };
  const payload = readJSON
    ? await readJSON()
    : await (pending ??= read().catch((error) => {
        pending = null;
        throw error;
      }));
  if (
    payload?.schemaVersion !== 1 ||
    !Array.isArray(payload.books) ||
    !Array.isArray(payload.rows)
  )
    throw Error("Unsupported book reference library.");
  if (
    payload.books.length !== library.packs.length ||
    library.packs.some(
      (pack) =>
        payload.books.find((b) => b.id === pack.manifest.id)?.version !==
        pack.manifest.version,
    )
  )
    throw Error("Book references are out of date. Reload the app to update.");
  if (!Array.isArray(payload.entries))
    throw Error("Invalid book reference profiles.");
  const keys = new Set();
  const rows = payload.rows.map((wire) => {
    const row = { ...wire, entry: payload.entries[wire?.entryRef] };
    if (
      !row?.key ||
      keys.has(row.key) ||
      !row.name ||
      !row.entry?.source ||
      !payload.books.some((b) => b.id === row.entry.source.book) ||
      !Array.isArray(row.textFields) ||
      row.textFields.some((x) => typeof x !== "string") ||
      !Array.isArray(row.aliases) ||
      row.aliases.some((x) => typeof x !== "string") ||
      !Array.isArray(row.legacy)
    )
      throw Error("Invalid book reference record.");
    keys.add(row.key);
    return {
      ...row,
      normalizedName: normalizeSearch(row.name),
      normalizedAliases: row.aliases.map(normalizeSearch),
      searchable: normalizeSearch(
        [row.name, ...row.aliases, ...row.textFields].join(" "),
      ),
    };
  });
  return { schemaVersion: payload.schemaVersion, books: payload.books, rows };
}
