import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Both authored inputs and final output matter: same-length edits, missing
// chunks and config changes must invalidate a previously prepared build.
export async function buildFingerprint(root) {
  const hash = createHash("sha256");
  const visit = async (relative) => {
    let entries;
    try {
      entries = await readdir(path.join(root, relative), {
        withFileTypes: true,
      });
    } catch (error) {
      if (error.code === "ENOENT") {
        hash.update(relative + "\0missing");
        return;
      }
      throw error;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (entry.isFile())
        hash
          .update(file.replaceAll("\\", "/") + "\0")
          .update(await readFile(path.join(root, file)));
      else throw Error(`Unsupported build input: ${file}`);
    }
  };
  for (const directory of ["out", "src", "public", "scripts", "content"])
    await visit(directory);
  for (const file of [
    "package.json",
    "package-lock.json",
    "next.config.mjs",
    "next.config.ts",
    "tsconfig.json",
    ".nvmrc",
  ]) {
    try {
      hash.update(file + "\0").update(await readFile(path.join(root, file)));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      hash.update(file + "\0missing");
    }
  }
  return hash.digest("hex");
}
