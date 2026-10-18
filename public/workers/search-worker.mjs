import { normalizeSearch, searchBooks } from "./search-ranking.mjs";

export function prepareSearchRows(rows) {
  return rows.map((row) => ({
    ...row,
    normalizedName: normalizeSearch(row.name),
    normalizedAliases: row.aliases.map(normalizeSearch),
    searchable: normalizeSearch(
      [row.name, ...row.aliases, ...row.textFields].join(" "),
    ),
  }));
}
export function createWorkerHandler(send) {
  let index;
  return ({ id, type, rows, query, category, filters }) => {
    try {
      if (type === "init") index = prepareSearchRows(rows);
      else if (type !== "search" || !index)
        throw Error("Search worker is not ready.");
      const matches =
        type === "init"
          ? null
          : searchBooks(index, query, Infinity, { category, filters });
      send({
        id,
        result:
          type === "init"
            ? true
            : {
                total: matches.total,
                rows: matches.rows.map(({ key, rank, excerpt }) => ({
                  key,
                  rank,
                  excerpt,
                })),
              },
      });
    } catch (error) {
      send({ id, error: error.message });
    }
  };
}
if (typeof globalThis.postMessage === "function" && !globalThis.document) {
  const handle = createWorkerHandler((reply) => globalThis.postMessage(reply));
  globalThis.addEventListener("message", (event) => handle(event.data));
}
