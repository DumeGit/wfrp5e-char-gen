import { BOOK_SCHEMA, selectedPacks, validateManifest } from "./books.mjs";
import { CONTENT_ALIASES, validateAliases } from "./content-references.mjs";

export const BOOK_BUNDLE_FORMAT = "wfrp-book-library-v1";
const plain = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const fail = (message) => {
  throw Error(`Book bundle: ${message}`);
};

// Generated only after loadBookLibrary has validated every source pack.
// Selected catalogue assembly still validates its content in the browser.
export async function loadBookBundle(
  readJSON,
  url = new URL("./data/book-library.json", import.meta.url),
) {
  const bundle = await readJSON(url);
  if (
    !plain(bundle) ||
    bundle.format !== BOOK_BUNDLE_FORMAT ||
    bundle.schemaVersion !== BOOK_SCHEMA ||
    bundle.core !== "core" ||
    !Array.isArray(bundle.packs) ||
    !bundle.packs.length ||
    Object.keys(bundle).some(
      (key) => !["format", "schemaVersion", "core", "packs"].includes(key),
    )
  )
    fail("unsupported generated library format.");
  const ids = new Set();
  for (const pack of bundle.packs) {
    if (
      !plain(pack) ||
      !plain(pack.data) ||
      Object.keys(pack).some((key) => !["manifest", "data"].includes(key))
    )
      fail("invalid book record.");
    const manifest = validateManifest(pack.manifest);
    if (ids.has(manifest.id)) fail(`duplicate book ${manifest.id}.`);
    ids.add(manifest.id);
    const keys = Object.keys(pack.data);
    if (
      keys.length !== Object.keys(manifest.files).length ||
      keys.some((key) => !Object.hasOwn(manifest.files, key))
    )
      fail(`${manifest.id}: data must match its declared files.`);
  }
  if (
    bundle.packs.filter((pack) => pack.manifest.kind === "core").length !== 1 ||
    !bundle.packs.some(
      (pack) =>
        pack.manifest.id === bundle.core && pack.manifest.kind === "core",
    )
  )
    fail("exactly one core book is required.");
  const library = {
    schemaVersion: bundle.schemaVersion,
    core: bundle.core,
    packs: bundle.packs,
    aliases: validateAliases(CONTENT_ALIASES, [...ids]),
  };
  // Verify all dependency identities/cycles without assembling unused catalogues.
  selectedPacks(library, [...ids]);
  return library;
}
