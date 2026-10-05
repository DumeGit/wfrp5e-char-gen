import { readFile, readdir } from "node:fs/promises";
const root = new URL("../dist/", import.meta.url),
  worker = await readFile(new URL("sw.js", root), "utf8");
async function inspect(dir, prefix = "") {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = prefix + item.name;
    if (item.isDirectory())
      await inspect(new URL(item.name + "/", dir), path + "/");
    else if (
      !["sw.js", "vercel.json"].includes(path) &&
      !worker.includes(JSON.stringify(path))
    )
      throw Error(`Offline asset missing: ${path}`);
  }
}
await inspect(root);
console.log(
  "All published book data, feature modules, exports and PDF assets are included in the offline worker.",
);
