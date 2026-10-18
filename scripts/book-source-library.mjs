import {
  BOOK_SCHEMA,
  assembleBooks,
  validateManifest,
  registeredEntries,
  sourceValidation,
} from "../src/engine/books.mjs";
import { validateCoverage } from "../src/engine/book-coverage.mjs";
import {
  CONTENT_ALIASES,
  validateAliases,
  validateAliasTargets,
} from "../src/engine/content-references.mjs";
import { validateRuleReference } from "../src/engine/rule-references.mjs";
import { validateReferenceEntry } from "../src/engine/reference-entries.mjs";
import { hydrateDescriptions } from "../src/engine/description-data.mjs";
const { arrays, plain, nonempty, strings, fail, pageOK, entryFor } =
  sourceValidation;
// Full source validation for builds/tests; browser startup uses book-bundle.mjs.
export async function loadBookLibrary(
  readJSON,
  registryURL = new URL(
    "../content/sources/data/books/index.json",
    import.meta.url,
  ),
) {
  const canonicalRoot = new URL("../content/sources/", import.meta.url);
  const descriptions = registryURL.href.startsWith(canonicalRoot.href)
    ? await readJSON(
        new URL("../content/descriptions/catalogue.json", import.meta.url),
      )
    : null;
  const index = await readJSON(registryURL);
  if (
    index.schemaVersion !== BOOK_SCHEMA ||
    index.core !== "core" ||
    !Array.isArray(index.packs)
  )
    fail("invalid registry; the Fifth Edition base pack must be core.");
  const seen = new Set();
  for (const item of index.packs) {
    if (!nonempty(item.id) || seen.has(item.id) || !nonempty(item.path))
      fail("duplicate or invalid registered book.");
    seen.add(item.id);
  }
  const packs = await Promise.all(
    index.packs.map(async (item) => {
      const url = new URL(item.path, registryURL);
      if (
        url.origin !== registryURL.origin ||
        !url.href.startsWith(new URL("./", registryURL).href)
      )
        fail("manifest must be inside the books directory.");
      const manifest = validateManifest(await readJSON(url));
      if (manifest.id !== item.id) fail("registry and manifest IDs differ.");
      const entries = await Promise.all(
        Object.entries(manifest.files).map(async ([key, path]) => {
          if (!nonempty(path)) fail(`${item.id}: missing file path.`);
          const file = new URL(path, url),
            dataRoot = new URL("../", registryURL);
          if (
            file.origin !== url.origin ||
            !file.href.startsWith(dataRoot.href)
          )
            fail(`${item.id}: data must stay inside the data directory.`);
          const value = await readJSON(file);
          return [
            key,
            descriptions
              ? hydrateDescriptions(
                  value,
                  descriptions,
                  decodeURIComponent(
                    file.href.slice(canonicalRoot.href.length),
                  ),
                )
              : value,
          ];
        }),
      );
      const data = Object.fromEntries(entries);
      for (const reference of data.ruleReferences || [])
        validateRuleReference(reference, { source: true });
      if (
        data.referenceEntries !== undefined &&
        !Array.isArray(data.referenceEntries)
      )
        fail(`${item.id}: printed references must be an array.`);
      const referenceIds = new Set();
      for (const reference of data.referenceEntries || []) {
        validateReferenceEntry(reference, item.id);
        if (referenceIds.has(reference.id))
          fail(`duplicate printed reference ${reference.id}.`);
        referenceIds.add(reference.id);
      }
      return { manifest, data };
    }),
  );
  const core = packs.find((p) => p.manifest.id === index.core);
  // Explicit Skill targets already identify the canonical definition. Hydrate
  // creator profiles as well as search, without a runtime lookup/download.
  for (const pack of packs) {
    for (const reference of pack.data.ruleReferences || []) {
      if (reference.category !== "skill") continue;
      const skill = (pack.data.skills || []).find(
        (x) =>
          entryFor(pack.manifest, "skills", x).contentId === reference.target,
      );
      if (skill && !skill.text)
        Object.assign(skill, {
          text: reference.text,
          descriptionId: reference.descriptionId,
          descriptionStatus: reference.descriptionStatus,
        });
    }
  }
  if (
    !core ||
    core.manifest.kind !== "core" ||
    packs.filter((p) => p.manifest.kind === "core").length !== 1
  )
    fail("exactly one registered core book is required.");
  for (const p of packs)
    for (const id of p.manifest.dependsOn)
      if (!seen.has(id)) fail(`${p.manifest.id}: missing dependency ${id}.`);
  // Validate every pack, including disabled ones, in its dependency context.
  const library = {
    schemaVersion: BOOK_SCHEMA,
    core: index.core,
    packs,
    referenceExclusions: descriptions?.excludedReferences || {},
    aliases: validateAliases(CONTENT_ALIASES, [...seen]),
  };
  for (const p of packs) validateCoverage(p, registeredEntries(p));
  validateAliasTargets(
    library.aliases,
    packs.flatMap(registeredEntries),
    core.data.config,
  );
  for (const p of packs)
    for (const c of p.data.careers || [])
      if (
        c.alternativeFor &&
        !packs.some((q) =>
          (q.data.careers || []).some(
            (t) => t.id === c.alternativeFor && t.name === c.name,
          ),
        )
      )
        fail(`${c.id}: alternate profile needs an installed same-name Career.`);
  for (const p of packs)
    for (const u of p.data.careerUpdates || [])
      if (
        !strings(u.careers) ||
        u.careers.some(
          (id) =>
            !packs.some((q) => (q.data.careers || []).some((c) => c.id === id)),
        )
      )
        fail(`${u.id}: Career update needs installed target Careers.`);
  for (const p of packs) {
    if (p.data.withdrawals !== undefined) {
      if (!Array.isArray(p.data.withdrawals))
        fail(`${p.manifest.id}: withdrawals must be an array.`);
      for (const w of p.data.withdrawals) {
        const target = packs.find((q) => q.manifest.id === w.book);
        if (
          !plain(w) ||
          Object.keys(w).some(
            (k) =>
              !["id", "book", "kind", "target", "page", "reason"].includes(k),
          ) ||
          !nonempty(w.id) ||
          !w.id.startsWith(p.manifest.id + ":") ||
          !["weapons", "market", "gear"].includes(w.kind) ||
          w.book === p.manifest.id ||
          !pageOK(w.page) ||
          !nonempty(w.reason) ||
          !target?.data[w.kind]?.some((t) => t.id === w.target)
        )
          fail(
            `${p.manifest.id}: withdrawal needs an installed equipment target and a sourced reason.`,
          );
      }
    }
  }
  for (const p of packs)
    for (const kind of arrays)
      for (const x of p.data[kind] || [])
        if (x.supersededBy) {
          const v = x.supersededBy;
          if (
            !plain(v) ||
            Object.keys(v).some(
              (k) => !["book", "contentId", "reason"].includes(k),
            ) ||
            !nonempty(v.reason) ||
            v.book === p.manifest.id ||
            !packs
              .find((q) => q.manifest.id === v.book)
              ?.data[
                kind
              ]?.some((t) => t.id === v.contentId && t.name === x.name)
          )
            fail(
              `${x.id}: superseding content must name another installed book's same-name option and a reason.`,
            );
        }
  for (const p of packs) assembleBooks(library, [p.manifest.id]);
  return library;
}
