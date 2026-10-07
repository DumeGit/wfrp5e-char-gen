import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadBookLibrary, assembleBooks } from "../dist/books.mjs";
import { prepareGM, gmInventory } from "../dist/gm/content.mjs";
import { BOOK_BUNDLE_FORMAT } from "../dist/book-bundle.mjs";
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
const gm = prepareGM(
  JSON.parse(
    await readFile(
      new URL("../dist/gm/sources/core.json", import.meta.url),
      "utf8",
    ),
  ),
  assembleBooks(library),
);
gm.version = createHash("sha256")
  .update(JSON.stringify(gm))
  .digest("hex")
  .slice(0, 16);
const outputs = [
  ["../dist/gm/data.json", JSON.stringify(gm) + "\n"],
  ["../docs/GM-CONTENT.md", gmInventory(gm)],
  [
    "../dist/data/book-library.json",
    JSON.stringify({
      format: BOOK_BUNDLE_FORMAT,
      schemaVersion: library.schemaVersion,
      core: library.core,
      packs: library.packs,
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
