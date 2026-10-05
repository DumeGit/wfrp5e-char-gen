import { readFile, writeFile } from "node:fs/promises";
import { loadBookLibrary } from "../dist/books.mjs";
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
const outputs = [
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
  `${check ? "Verified" : "Generated"} registry counts, inclusion matrix and README summary for ${report.books.length} packs.`,
);
