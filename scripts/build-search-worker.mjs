import { mkdir, readFile, writeFile } from "node:fs/promises";
const directory = new URL("../public/workers/", import.meta.url);
await mkdir(directory, { recursive: true });
for (const name of [
  "search-worker.mjs",
  "search-ranking.mjs",
  "search-filters.mjs",
])
  await writeFile(
    new URL(name, directory),
    await readFile(new URL(`../src/engine/${name}`, import.meta.url)),
  );
