export const INCLUSION_STATUSES = [
  "implemented",
  "adapted",
  "reference-only",
  "unavailable",
  "deferred",
];
export function validateCoverage(pack, entries) {
  const c = pack.data.coverage;
  if (
    !c ||
    c.schemaVersion !== 1 ||
    !Array.isArray(c.records) ||
    !Array.isArray(c.features)
  )
    throw Error(
      `Book coverage: ${pack.manifest.id} requires a reviewed coverage inventory.`,
    );
  const seen = new Set();
  for (const x of c.records) {
    const entry = entries.find(
      (e) =>
        e.contentId === x.contentId &&
        e.contentKind === x.kind &&
        e.name === x.name,
    );
    if (
      !entry ||
      !INCLUSION_STATUSES.includes(x.status) ||
      !x.reason?.trim() ||
      seen.has(x.contentId)
    )
      throw Error(`Book coverage: invalid/duplicate record ${x.contentId}.`);
    if (entry.unavailable && x.status !== "unavailable")
      throw Error(`Book coverage: cannot enable unavailable ${x.contentId}.`);
    seen.add(x.contentId);
  }
  for (const x of c.features) {
    if (
      !x.id?.startsWith(pack.manifest.id + ":feature:") ||
      !x.name?.trim() ||
      !x.reason?.trim() ||
      !INCLUSION_STATUSES.includes(x.status) ||
      x.source?.book !== pack.manifest.id ||
      seen.has(x.id) ||
      (x.source.page !== undefined &&
        !(
          (Number.isInteger(x.source.page) && x.source.page > 0) ||
          (typeof x.source.page === "string" &&
            /^\d+(?:[–—-]\d+)?$/.test(x.source.page))
        ))
    )
      throw Error(`Book coverage: invalid/duplicate feature ${x.id}.`);
    seen.add(x.id);
  }
  return c;
}
