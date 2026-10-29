import { searchBookText } from "../book-search-text.mjs";
// Output preferences never alter canonical rules or the calculated abilities.
export const abilityName = (kind, entry) =>
  entry.name +
  (kind === "magic"
    ? entry.lore || entry.category
      ? ` (${entry.lore || entry.category})`
      : ""
    : kind === "talent"
      ? entry.ranks > 1
        ? ` ×${entry.ranks}`
        : ""
      : entry.value
        ? ` (${entry.value})`
        : "");

export function descriptionKey(kind, entry, draft = {}) {
  // Template Talent slots can select a different ability, or belong to a new
  // template. GM row keys stay stable when editable names/parameters change.
  const identity =
    kind === "talent" && entry.origin === "Template"
      ? `${draft.template}:${entry.key}:${entry.name}`
      : kind === "magic"
        ? entry.contentId
        : entry.key;
  return `${kind}:${identity}`;
}

export const showsDescription = (kind, entry, draft = {}) =>
  !(draft.hiddenDescriptions || []).includes(
    descriptionKey(kind, entry, draft),
  );

export function abilityPresentation(kind, entry, draft = {}) {
  const name = abilityName(kind, entry);
  if (kind === "magic") {
    const fields = [
      ["cn", "CN"],
      ["sl", "SL"],
      ["range", "Range"],
      ["target", "Target"],
      ["duration", "Duration"],
    ].filter(
      ([key]) =>
        entry[key] !== undefined && entry[key] !== null && entry[key] !== "",
    );
    const parameters = [
      entry.ritual ? "Ritual" : "",
      ...fields.map(([key, label]) => `${label} ${entry[key]}`),
    ]
      .filter(Boolean)
      .join(" · ");
    const prefix = fields
      .map(([key, label]) => `${label}: ${entry[key]}`)
      .join(" ");
    const canonical = searchBookText(entry).text;
    const description = showsDescription(kind, entry, draft)
      ? prefix && canonical.startsWith(prefix)
        ? canonical.slice(prefix.length).trim()
        : canonical
      : "";
    const suffix =
      (parameters ? ` · ${parameters}` : "") +
      (description ? `: ${description}` : "");
    return {
      name,
      description,
      parameters,
      text: name + suffix,
      runs: [{ text: name, bold: true }, ...(suffix ? [{ text: suffix }] : [])],
    };
  }
  const description = showsDescription(kind, entry, draft)
    ? entry.description || entry.summary || ""
    : "";
  return {
    name,
    description,
    text: name + (description ? `: ${description}` : ""),
    runs: [
      { text: name + (description ? ": " : ""), bold: true },
      ...(description ? [{ text: description }] : []),
    ],
  };
}
