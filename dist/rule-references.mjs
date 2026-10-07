export const RULE_CATEGORIES = [
  "rule",
  "condition",
  "psychology",
  "property",
  "trait",
  "skill",
];

export function validateRuleReference(entry, { source = false } = {}) {
  const nonempty = (value) => typeof value === "string" && !!value.trim();
  if (
    !entry ||
    !RULE_CATEGORIES.includes(entry.category) ||
    !nonempty(entry.id) ||
    !entry.id.includes(":rule-reference:") ||
    !nonempty(entry.name) ||
    !(
      (Number.isInteger(entry.page) && entry.page > 0) ||
      (typeof entry.page === "string" && /^\d+[–-]\d+$/.test(entry.page))
    ) ||
    !nonempty(entry.topic) ||
    (entry.aliases !== undefined &&
      (!Array.isArray(entry.aliases) ||
        entry.aliases.some((x) => typeof x !== "string" || !x.trim()))) ||
    (entry.category === "skill"
      ? !nonempty(entry.target)
      : entry.target !== undefined) ||
    (entry.textRef !== undefined && entry.textRef !== true) ||
    (source
      ? !nonempty(entry.text) || entry.textRef !== undefined
      : !nonempty(entry.text) && entry.textRef !== true)
  )
    throw Error(`Invalid rule reference: ${entry?.id || "unknown"}`);
  return entry;
}

let pending;
const read = async () => {
  const response = await fetch(
    new URL("./data/rule-reference-library.json", import.meta.url),
  );
  if (!response.ok) throw Error("Could not load rule references. Try again.");
  return response.json();
};
export async function loadRuleReferences(R, readJSON) {
  if (!(R.ruleReferences || []).some((x) => x.textRef))
    return R.ruleReferences || [];
  let payload;
  if (readJSON) payload = await readJSON();
  else {
    pending ??= read().catch((error) => {
      pending = null;
      throw error;
    });
    payload = await pending;
  }
  if (payload?.schemaVersion !== 1 || !Array.isArray(payload.books))
    throw Error("Unsupported rule reference library.");
  return R.ruleReferences.map((metadata) => {
    if (!metadata.textRef) return metadata;
    const book = payload.books.find((x) => x.id === metadata.source.book),
      record = Array.isArray(book?.records)
        ? book.records.find((x) => x.id === metadata.id)
        : undefined;
    if (
      book?.version !== R.books.find((x) => x.id === book.id)?.version ||
      !record
    )
      throw Error("Rule references are out of date. Reload the app to update.");
    validateRuleReference(record, { source: true });
    for (const key of [
      "id",
      "name",
      "category",
      "topic",
      "page",
      "target",
      "aliases",
    ])
      if (JSON.stringify(record[key]) !== JSON.stringify(metadata[key]))
        throw Error(
          "Rule reference identity does not match the selected book.",
        );
    const { textRef, ...entry } = metadata;
    return { ...entry, text: record.text };
  });
}
