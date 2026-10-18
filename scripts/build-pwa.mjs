import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

export const outputRoot = new URL("../out/", import.meta.url);
export async function publishedFiles(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory())
      result.push(
        ...(await publishedFiles(
          new URL(entry.name + "/", directory),
          relative + "/",
        )),
      );
    else if (entry.isFile() && !["sw.js", "vercel.json"].includes(relative))
      result.push(relative);
    else if (!entry.isFile())
      throw Error(`Unsupported published file: ${relative}`);
  }
  return result.sort();
}
export function exportedRoutes(assets) {
  return Object.fromEntries(
    assets
      .filter((file) => file.endsWith(".html"))
      .flatMap((file) => {
        const route =
          file === "index.html"
            ? ""
            : file.endsWith("/index.html")
              ? file.slice(0, -10)
              : file;
        const payload = [
          file.replace(/\.html$/, ".txt"),
          route.replace(/\/$/, "") + ".txt",
        ].find((candidate) => assets.includes(candidate));
        return [[route, { document: file, ...(payload ? { payload } : {}) }]];
      }),
  );
}
export async function offlineVersion(directory, assets, template) {
  const hash = createHash("sha256").update(template);
  for (const file of assets)
    hash
      .update(file)
      .update("\0")
      .update(await readFile(new URL(file, directory)));
  return hash.digest("hex").slice(0, 20);
}
export async function buildOffline(directory = outputRoot) {
  const assets = await publishedFiles(directory);
  if (!assets.includes("index.html"))
    throw Error("Build Next.js static output before preparing offline access.");
  if (assets.some((file) => /^(?:content|src|scripts)\//.test(file)))
    throw Error("Private build sources found in published output.");
  const template = await readFile(
    new URL("service-worker.template.js", import.meta.url),
    "utf8",
  );
  const version = await offlineVersion(directory, assets, template);
  const worker = template
    .replace("__VERSION__", JSON.stringify(version))
    .replace("__ASSETS__", JSON.stringify(assets, null, 1))
    .replace("__ROUTES__", JSON.stringify(exportedRoutes(assets), null, 1));
  await writeFile(new URL("sw.js", directory), worker);
  return { version, assets };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const directory = process.argv[2]
    ? pathToFileURL(path.resolve(process.argv[2]) + path.sep)
    : outputRoot;
  const { version, assets } = await buildOffline(directory);
  console.log(
    `Prepared offline version ${version}: ${assets.length} files in ${fileURLToPath(directory)}`,
  );
}
