// Pure build-time hydration. Browser entry points consume the already resolved
// text in their existing bundles; they never fetch the editorial catalogue.
export function visitDescriptionFields(value, visit, path = []) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    const anchors = value.map((x, i) =>
      x && typeof x === "object" && (x.id || x.contentId || x.name)
        ? String(
            x.id ||
              x.contentId ||
              [
                x.name,
                x.category || x.group || x.form || "",
                x.page || "",
              ].join("|"),
          )
        : String(i),
    );
    const seen = new Set();
    value.forEach((x, i) => {
      if (seen.has(anchors[i])) {
        if (x?.id || x?.contentId)
          throw Error(
            `Ambiguous description identity: ${path.join("/")}/${anchors[i]}`,
          );
        anchors[i] += `|occurrence:${i}`;
      }
      seen.add(anchors[i]);
      visitDescriptionFields(x, visit, [...path, anchors[i]]);
    });
    return;
  }
  if (typeof value.text === "string" && value.text.trim()) visit(value, path);
  for (const [key, child] of Object.entries(value))
    if (key !== "text") visitDescriptionFields(child, visit, [...path, key]);
}

export const descriptionBinding = (file, path) =>
  `${file}#/${path.map(encodeURIComponent).join("/")}`;

// Original excluded references remain private audit material. They have no
// editorial/public description and must never acquire a generated copy.
export const requiresDescription = (file, entry, path = [], catalogue) =>
  !catalogue?.excludedReferences?.[entry.id] &&
  !(
    (/(?:reference-entries|rule-references)\.json$/.test(file) &&
      ["rule", "profile", "template"].includes(entry.category)) ||
    (file.startsWith("gm/books/") &&
      path.length === 2 &&
      ["profiles", "creatures", "templates"].includes(path[0]))
  );

export function hydrateDescriptions(value, catalogue, file) {
  const result = structuredClone(value);
  visitDescriptionFields(result, (entry, path) => {
    if (!requiresDescription(file, entry, path, catalogue)) return;
    // Preserve mechanical classification before editorial wording changes.
    // Runtime calculations must not reinterpret a rewritten attack sentence.
    if (file.startsWith("gm/books/") && path.includes("attacks")) {
      entry.ranged ??=
        /Bow|Sling|Crossbow|Rocks|Breath|Vomit/.test(entry.name) ||
        /yards/.test(entry.text);
      entry.free ??=
        /Bite|Horns|Tail|Tentacle|Breath|Vomit|Grasp|Howl/.test(entry.name) ||
        /Free Attack/.test(entry.text);
    }
    const key = descriptionBinding(file, path),
      binding = catalogue.bindings[key],
      record = catalogue.records[binding?.id];
    if (!record || !record.text?.trim())
      throw Error(`Missing canonical description: ${key}`);
    entry.text = record.text;
    // Description metadata travels with named content, never with arbitrary
    // source tables/configuration objects that have stricter schemas.
    if (
      entry.name &&
      (entry.id || entry.page) &&
      (path.length <= 1 || (file.startsWith("gm/books/") && path.length === 2))
    ) {
      entry.descriptionId = binding.id;
      entry.descriptionStatus = record.status;
    }
  });
  return result;
}
