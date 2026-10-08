export const normalizeSearch = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export function searchBooks(
  index,
  query,
  limit = 8,
  { category = "all", offset = 0 } = {},
) {
  const q = normalizeSearch(query);
  if (!q && category === "all") return { total: 0, rows: [] };
  const words = q ? q.split(" ") : [];
  const matches = index
    .filter(
      (x) =>
        (category === "all" || x.kind === category) &&
        words.every((w) => x.searchable.includes(w)),
    )
    .map((x) => ({
      ...x,
      excerpt:
        x.textFields.find((t) =>
          words.every((w) => normalizeSearch(t).includes(w)),
        ) ||
        x.textFields.find((t) =>
          words.some((w) => normalizeSearch(t).includes(w)),
        ) ||
        "",
      rank:
        x.normalizedName === q
          ? 0
          : x.normalizedAliases.includes(q)
            ? 1
            : x.normalizedName.startsWith(q)
              ? 2
              : x.normalizedName.includes(q)
                ? 3
                : words.every((w) => x.normalizedName.includes(w))
                  ? 4
                  : 5,
    }))
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.name.localeCompare(b.name) ||
        a.key.localeCompare(b.key),
    );
  return { total: matches.length, rows: matches.slice(offset, offset + limit) };
}
