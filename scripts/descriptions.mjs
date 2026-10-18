import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  visitDescriptionFields,
  descriptionBinding,
  requiresDescription,
} from "../src/engine/description-data.mjs";

export const sourceRoot = new URL("../content/sources/", import.meta.url);
export const catalogueURL = new URL(
  "../content/descriptions/catalogue.json",
  import.meta.url,
);
const hash = (text) =>
  createHash("sha256").update(text.replaceAll("\r\n", "\n")).digest("hex");

export async function descriptionSources() {
  const files = [];
  async function walk(url, path = "") {
    for (const x of await readdir(url, { withFileTypes: true })) {
      const file = path + x.name;
      if (x.isDirectory()) await walk(new URL(x.name + "/", url), file + "/");
      else if (x.name.endsWith(".json")) {
        const data = JSON.parse(await readFile(new URL(x.name, url), "utf8"));
        files.push({ file, data });
      }
    }
  }
  await walk(sourceRoot);
  return files.sort((a, b) => a.file.localeCompare(b.file));
}

export async function loadDescriptionCatalogue() {
  return JSON.parse(await readFile(catalogueURL, "utf8"));
}

export async function checkDescriptions(catalogue) {
  catalogue ??= await loadDescriptionCatalogue();
  if (
    catalogue.schemaVersion !== 1 ||
    !catalogue.bindings ||
    !catalogue.records
  )
    throw Error("Invalid canonical description catalogue.");
  const used = new Set(),
    bindings = new Set();
  const seenExclusions = new Set();
  for (const { file, data } of await descriptionSources()) {
    visitDescriptionFields(data, (entry, path) => {
      const exclusion = catalogue.excludedReferences?.[entry.id];
      if (exclusion) {
        if (
          exclusion.name !== entry.name ||
          !exclusion.reason?.trim() ||
          !exclusion.descriptionId
        )
          throw Error(`Invalid editorial reference exclusion: ${entry.id}`);
        seenExclusions.add(entry.id);
      }
      if (!requiresDescription(file, entry, path, catalogue)) return;
      const key = descriptionBinding(file, path),
        binding = catalogue.bindings[key],
        record = catalogue.records[binding?.id];
      if (!record || !record.text?.trim())
        throw Error(`Register/review description: ${key}`);
      if (binding.sourceHash !== hash(entry.text))
        throw Error(
          `Description source changed; review it before updating its binding: ${key}`,
        );
      if (!["imported", "reviewed"].includes(record.status))
        throw Error(`Invalid description review status: ${binding.id}`);
      if (catalogue.editorialComplete && record.status !== "reviewed")
        throw Error(
          `Description needs editorial review before publication: ${binding.id}`,
        );
      if (!record.source?.book)
        throw Error(`Description needs a book source: ${binding.id}`);
      const book = file.startsWith("data/books/")
        ? file.split("/")[2]
        : file.startsWith("gm/books/")
          ? file.split("/").at(-1).replace(".json", "")
          : "core";
      if (record.source.book !== book)
        throw Error(
          `Cross-book description binding needs a separate explicit definition: ${key}`,
        );
      used.add(binding.id);
      bindings.add(key);
    });
  }
  for (const key of Object.keys(catalogue.bindings))
    if (!bindings.has(key)) throw Error(`Orphan description binding: ${key}`);
  for (const id of Object.keys(catalogue.records))
    if (!used.has(id)) throw Error(`Orphan canonical description: ${id}`);
  for (const id of Object.keys(catalogue.excludedReferences || {}))
    if (!seenExclusions.has(id))
      throw Error(`Unknown editorial reference exclusion: ${id}`);
  return {
    records: used.size,
    reviewed: [...used].filter(
      (id) => catalogue.records[id].status === "reviewed",
    ).length,
    bindings: bindings.size,
    structured: [...used].filter(
      (id) => catalogue.records[id].reviewType === "structured-data",
    ).length,
    excludedReferences: seenExclusions.size,
  };
}

// Explicit registration only. Never overwrite approved wording when a book
// extraction is regenerated. Changed sources must be reviewed separately.
export async function registerDescriptions() {
  let catalogue;
  try {
    catalogue = await loadDescriptionCatalogue();
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    catalogue = { schemaVersion: 1, records: {}, bindings: {} };
  }
  for (const { file, data } of await descriptionSources()) {
    const book = file.startsWith("data/books/")
      ? file.split("/")[2]
      : file.startsWith("gm/books/")
        ? file.split("/").at(-1).replace(".json", "")
        : "core";
    visitDescriptionFields(data, (entry, path) => {
      if (!requiresDescription(file, entry, path, catalogue)) return;
      const key = descriptionBinding(file, path);
      if (catalogue.bindings[key]) return;
      const id = `description:${hash(key).slice(0, 24)}`;
      if (catalogue.records[id])
        throw Error(`Description ID collision: ${key}`);
      catalogue.records[id] = {
        name: entry.name || path.at(-1) || file,
        source: { book, ...(entry.page ? { page: entry.page } : {}) },
        status: "imported",
        text: entry.text,
      };
      catalogue.bindings[key] = { id, sourceHash: hash(entry.text) };
    });
  }
  await mkdir(new URL("./", catalogueURL), { recursive: true });
  await writeFile(catalogueURL, JSON.stringify(catalogue, null, 2) + "\n");
  return checkDescriptions(catalogue);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = process.argv.includes("--register")
    ? await registerDescriptions()
    : await checkDescriptions();
  console.log(
    `Canonical descriptions: ${result.records}; reviewed summaries: ${result.reviewed}; source bindings: ${result.bindings}.`,
  );
}
