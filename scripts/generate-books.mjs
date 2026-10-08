import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadBookLibrary, assembleBooks } from "../dist/books.mjs";
import {
  prepareGM,
  addGMSupplement,
  gmInventory,
} from "../dist/gm/content.mjs";
import { BOOK_BUNDLE_FORMAT } from "../dist/book-bundle.mjs";
import {
  searchCoverage,
  searchCoverageMarkdown,
  referenceContentHash,
} from "./search-coverage.mjs";
import {
  buildReferenceLibrary,
  compactReferenceLibrary,
} from "../dist/search-library.mjs";
import {
  buildBookReport,
  inclusionMarkdown,
  countSummary,
} from "../dist/book-report.mjs";
const library = await loadBookLibrary(async (url) =>
    JSON.parse(await readFile(url, "utf8")),
  ),
  report = buildBookReport(library);
const start = "<!-- registry-counts:start -->",
  end = "<!-- registry-counts:end -->",
  readmeURL = new URL("../README.md", import.meta.url);
const readme = (await readFile(readmeURL, "utf8")).replaceAll("\r\n", "\n");
if (!readme.includes(start) || !readme.includes(end))
  throw Error("README registry count markers are required.");
const next =
  readme.slice(0, readme.indexOf(start)) +
  start +
  "\n" +
  countSummary(report) +
  "\n" +
  readme.slice(readme.indexOf(end));
let gm = prepareGM(
  JSON.parse(
    await readFile(
      new URL("../dist/gm/sources/core.json", import.meta.url),
      "utf8",
    ),
  ),
  assembleBooks(library),
);
const coreBook = assembleBooks(library).books[0];
gm.books = [
  {
    id: coreBook.id,
    title: coreBook.title,
    version: coreBook.version,
    source: coreBook.source,
  },
];
gm.training = [];
for (const id of ["up-in-arms", "archives-i"])
  gm = addGMSupplement(
    gm,
    JSON.parse(
      await readFile(
        new URL(`../dist/gm/sources/${id}.json`, import.meta.url),
        "utf8",
      ),
    ),
    assembleBooks(library, ["core", id]),
  );
gm.version = createHash("sha256")
  .update(JSON.stringify(gm))
  .digest("hex")
  .slice(0, 16);
const corpus = buildReferenceLibrary(library, gm);
const review = JSON.parse(
  await readFile(
    new URL("./search-reference-review.json", import.meta.url),
    "utf8",
  ),
);
for (const pack of library.packs.filter((p) => p.manifest.kind !== "variant")) {
  const hash = referenceContentHash(
    await readFile(
      new URL(
        `../dist/data/books/${pack.manifest.id}/reference-entries.json`,
        import.meta.url,
      ),
      "utf8",
    ),
  );
  if (hash !== review.books[pack.manifest.id]?.publishedSHA256)
    throw Error(
      `Printed references changed without source review: ${pack.manifest.id}`,
    );
}
const searchReport = searchCoverage(library, corpus, review, gm);
const outputs = [
  [
    "../dist/data/search-library.json",
    JSON.stringify(compactReferenceLibrary(corpus)) + "\n",
  ],
  [
    "../dist/data/search-coverage.json",
    JSON.stringify(searchReport, null, 2) + "\n",
  ],
  ["../docs/SEARCH-COVERAGE.md", searchCoverageMarkdown(searchReport)],
  [
    "../dist/data/rule-reference-library.json",
    JSON.stringify({
      schemaVersion: 1,
      books: library.packs
        .filter((p) => p.data.ruleReferences?.length)
        .map((p) => ({
          id: p.manifest.id,
          version: p.manifest.version,
          records: p.data.ruleReferences,
        })),
    }) + "\n",
  ],
  ["../dist/gm/data.json", JSON.stringify(gm) + "\n"],
  ["../docs/GM-CONTENT.md", gmInventory(gm)],
  [
    "../dist/data/book-library.json",
    JSON.stringify({
      format: BOOK_BUNDLE_FORMAT,
      schemaVersion: library.schemaVersion,
      core: library.core,
      packs: library.packs.map((p) => ({
        ...p,
        data: {
          ...p.data,
          ...(p.data.referenceEntries ? { referenceEntries: [] } : {}),
          ...(p.data.ruleReferences
            ? {
                ruleReferences: p.data.ruleReferences.map(
                  ({ text, ...entry }) => ({ ...entry, textRef: true }),
                ),
              }
            : {}),
        },
      })),
    }) + "\n",
  ],
  ["../dist/data/content-report.json", JSON.stringify(report, null, 2) + "\n"],
  ["../docs/INCLUSION-MATRIX.md", inclusionMarkdown(report)],
  ["../README.md", next],
];
const check = process.argv.includes("--check");
for (const [path, text] of outputs) {
  const url = new URL(path, import.meta.url);
  if (check) {
    let saved = "";
    try {
      saved = (await readFile(url, "utf8")).replaceAll("\r\n", "\n");
    } catch {}
    if (saved !== text)
      throw Error(
        `Generated registry output is stale: ${path}. Run npm run generate:books.`,
      );
  } else await writeFile(url, text);
}
console.log(
  `${check ? "Verified" : "Generated"} startup bundle, registry counts, inclusion matrix and README summary for ${report.books.length} packs.`,
);
