import { readFile } from "node:fs/promises";
import { publishedFiles, offlineVersion, outputRoot } from "./build-pwa.mjs";
const worker = await readFile(new URL("sw.js", outputRoot), "utf8");
const assets = await publishedFiles(outputRoot);
const listed = JSON.parse(
  worker.match(/const ASSETS\s*=\s*(\[[\s\S]*?\]);/)[1],
);
if (JSON.stringify(assets) !== JSON.stringify(listed))
  throw Error(
    "Offline inventory differs from final Next.js export. Rebuild offline assets.",
  );
const template = await readFile(
  new URL("service-worker.template.js", import.meta.url),
  "utf8",
);
const version = await offlineVersion(outputRoot, assets, template);
if (
  JSON.parse(
    worker.match(/const CACHE\s*=\s*CACHE_PREFIX\s*\+\s*("[^"]+");/)[1],
  ) !== version
)
  throw Error(
    "Offline version does not match published bytes. Rebuild offline assets.",
  );
if (assets.some((file) => /^(?:src|content|scripts)\//.test(file)))
  throw Error("Private build sources found in published output.");
console.log(
  `All ${assets.length} final route documents, router payloads, framework chunks, book data and PDF assets are versioned offline.`,
);
