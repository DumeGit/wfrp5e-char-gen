import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadBookLibrary } from "./book-source-library.mjs";
import { assembleBooks } from "../src/engine/books.mjs";
import {
  prepareGM,
  addGMSupplement,
  gmInventory,
} from "../src/engine/gm/content.mjs";
import { BOOK_BUNDLE_FORMAT } from "../src/engine/book-bundle.mjs";
import {
  checkDescriptions,
  loadDescriptionCatalogue,
} from "./descriptions.mjs";
import { hydrateDescriptions } from "../src/engine/description-data.mjs";
import { publicGMData } from "./public-gm-data.mjs";
import { assembleGMOptions } from "../src/engine/gm/books.mjs";
import {
  searchCoverage,
  searchCoverageMarkdown,
  referenceContentHash,
} from "./search-coverage.mjs";
import {
  buildReferenceLibrary,
  compactReferenceLibrary,
} from "../src/engine/search-library.mjs";
import {
  buildBookReport,
  inclusionMarkdown,
  countSummary,
} from "../src/engine/book-report.mjs";
const descriptions = await loadDescriptionCatalogue();
const descriptionReport = await checkDescriptions(descriptions);
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
const gmRules = assembleGMOptions(library);
let gm = prepareGM(
  hydrateDescriptions(
    JSON.parse(
      await readFile(
        new URL("../content/sources/gm/books/core.json", import.meta.url),
        "utf8",
      ),
    ),
    descriptions,
    "gm/books/core.json",
  ),
  gmRules,
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
for (const pack of library.packs.filter(
  (p) => p.manifest.kind !== "variant" && p.manifest.id !== "core",
)) {
  let raw;
  try {
    raw = JSON.parse(
      await readFile(
        new URL(
          `../content/sources/gm/books/${pack.manifest.id}.json`,
          import.meta.url,
        ),
        "utf8",
      ),
    );
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }
  gm = addGMSupplement(
    gm,
    hydrateDescriptions(raw, descriptions, `gm/books/${pack.manifest.id}.json`),
    gmRules,
  );
}

gm.optionBooks = gmRules.books.map(
  ({ id, title, shortTitle, version, source }) => ({
    id,
    title,
    shortTitle,
    version,
    source,
  }),
);
gm.books = gm.books.filter((book) =>
  [...gm.profiles, ...gm.templates].some(
    (entry) => (entry.source?.book || entry.id.split(":")[0]) === book.id,
  ),
);
gm = publicGMData(gm);
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
        `../content/sources/data/books/${pack.manifest.id}/reference-entries.json`,
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
    "../src/engine/description-rules.mjs",
    "// Generated from content/descriptions/trait-rules.mjs. Edit the authoring source.\n" +
      (
        await readFile(
          new URL("../content/descriptions/trait-rules.mjs", import.meta.url),
          "utf8",
        )
      ).replaceAll("\r\n", "\n"),
  ],
  [
    "../docs/DESCRIPTION-COVERAGE.md",
    `# Description coverage\n\nGenerated from the canonical description catalogue.\n\n- ${descriptionReport.records} canonical descriptions; ${descriptionReport.bindings} source bindings.\n- ${descriptionReport.reviewed} explicitly reviewed entries: ${descriptionReport.reviewed - descriptionReport.structured} prose summaries and ${descriptionReport.structured} structured-data exceptions.\n- ${descriptionReport.records - descriptionReport.reviewed} imported descriptions awaiting editorial review.\n- ${descriptionReport.excludedReferences} explicit editorial reference exclusions, in addition to all standalone Rules and private NPC/template references.\n\nPure names, statistical labels and numerical lookup cells retain their printed values; their review does not claim those values were reworded. Conditional Trait presentation is authored in the same description directory. Book/page and Legacy notes remain separate. See [DESCRIPTIONS.md](DESCRIPTIONS.md) and [DESCRIPTION-REVIEW.md](DESCRIPTION-REVIEW.md).\n\n## Structured-data exceptions\n\n${Object.entries(
      descriptions.records,
    )
      .filter(([, record]) => record.reviewType === "structured-data")
      .map(
        ([id, record]) =>
          `- ${id}: ${record.name} (${record.source.book}${record.source.page ? ` p. ${record.source.page}` : ""}).`,
      )
      .join("\n")}\n\n## Explicit reference exclusions\n\n${Object.entries(
      descriptions.excludedReferences || {},
    )
      .map(([id, record]) => `- ${id}: ${record.reason}`)
      .join("\n")}\n`,
  ],
  [
    "../public/data/search-library.json",
    JSON.stringify(compactReferenceLibrary(corpus)) + "\n",
  ],
  [
    "../public/data/search-coverage.json",
    JSON.stringify(searchReport, null, 2) + "\n",
  ],
  ["../docs/SEARCH-COVERAGE.md", searchCoverageMarkdown(searchReport)],
  [
    "../public/data/rule-reference-library.json",
    JSON.stringify({
      schemaVersion: 1,
      books: library.packs
        .filter((p) => p.data.ruleReferences?.length)
        .map((p) => ({
          id: p.manifest.id,
          version: p.manifest.version,
          records: p.data.ruleReferences.filter(
            (entry) => entry.category !== "rule",
          ),
        })),
    }) + "\n",
  ],
  ["../public/gm/data.json", JSON.stringify(gm) + "\n"],
  ["../docs/GM-CONTENT.md", gmInventory(gm)],
  [
    "../public/data/book-library.json",
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
                ruleReferences: p.data.ruleReferences
                  .filter((entry) => entry.category !== "rule")
                  .map(({ text, ...entry }) => ({ ...entry, textRef: true })),
              }
            : {}),
        },
      })),
    }) + "\n",
  ],
  [
    "../public/data/content-report.json",
    JSON.stringify(report, null, 2) + "\n",
  ],
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
