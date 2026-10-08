import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Hash both sources and published outputs. Changed/missing assets cannot use a
// previous build, including edits with unchanged timestamps or file lengths.
export async function buildFingerprint(root) {
  const hash = createHash("sha256");
  const visit = async (relative) => {
    const absolute = path.join(root, relative);
    const entries = await readdir(absolute, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (entry.isFile()) {
        hash.update(file.replaceAll("\\", "/") + "\0");
        hash.update(await readFile(path.join(root, file)));
      } else throw Error(`Unsupported build input: ${file}`);
    }
  };
  await visit("dist");
  await visit("scripts");
  for (const file of ["package.json", "package-lock.json"]) {
    hash.update(file);
    hash.update(await readFile(path.join(root, file)));
  }
  return hash.digest("hex");
}
