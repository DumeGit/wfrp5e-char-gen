// Exact catalogue names only: related references never infer rule equivalents.
export function createReferenceLinker(index) {
  const names = new Map();
  for (const row of index) {
    for (const name of [row.name, ...(row.aliases || [])]) {
      if (name.length < 3) continue;
      const key = name.toLocaleLowerCase();
      if (!names.has(key)) names.set(key, []);
      if (!names.get(key).some((x) => x.key === row.key))
        names.get(key).push(row);
    }
  }
  const pattern = [...names.keys()]
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const matcher = pattern
    ? new RegExp(
        `(?<![\\p{L}\\p{N}’'‐‑-])(${pattern})(?![\\p{L}\\p{N}’'‐‑-])`,
        "giu",
      )
    : null;
  return (text, current) => {
    const segments = [];
    if (!matcher) return [{ text }];
    matcher.lastIndex = 0;
    let start = 0;
    for (const match of text.matchAll(matcher)) {
      const name = match[0].toLocaleLowerCase();
      if (name === current?.name.toLocaleLowerCase()) continue;
      const candidates = names.get(name).filter((x) => x.key !== current?.key);
      const sameBook = candidates.filter(
        (x) => x.entry.source.book === current?.entry?.source?.book,
      );
      const targets = sameBook.length ? sameBook : candidates;
      if (!targets.length) continue;
      if (match.index > start)
        segments.push({ text: text.slice(start, match.index) });
      segments.push({ text: match[0], keys: targets.map((x) => x.key) });
      start = match.index + match[0].length;
    }
    if (start < text.length) segments.push({ text: text.slice(start) });
    return segments;
  };
}
