import { mkdir, readFile, writeFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
await mkdir(new URL("public/", root), { recursive: true });
await writeFile(
  new URL("public/design-system.html", root),
  await readFile(new URL("src/static/design-system.html", root)),
);
const styles = await Promise.all(
  ["styles", "workspace", "book-search", "design-tokens", "design-system"].map(
    (name) => readFile(new URL(`src/styles/${name}.css`, root), "utf8"),
  ),
);
await writeFile(new URL("public/guide.css", root), styles.join("\n"));
