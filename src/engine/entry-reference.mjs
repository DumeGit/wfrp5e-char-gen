// Exact catalogue identities take precedence; the shared reader falls back to
// the same-source name, then to supplied text for creator-only references.
export function entryReference(kind, entry) {
  const text = entry.summary || entry.description || entry.text;
  return {
    kind: kind === "gear" ? "equipment" : kind,
    name: entry.name,
    book: entry.source?.book,
    id: entry.contentId || entry.catalogueId || entry.id,
    ...(entry.source?.book && entry.source?.page && text
      ? {
          quote: {
            text,
            source: entry.source,
            label: "Book reference",
          },
        }
      : {}),
  };
}
