// Output preferences never alter canonical rules or the calculated abilities.
export const abilityName = (kind, entry) =>
  entry.name +
  (kind === "talent"
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
      : entry.key;
  return `${kind}:${identity}`;
}

export const showsDescription = (kind, entry, draft = {}) =>
  !(draft.hiddenDescriptions || []).includes(
    descriptionKey(kind, entry, draft),
  );

export function abilityPresentation(kind, entry, draft = {}) {
  const name = abilityName(kind, entry);
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
