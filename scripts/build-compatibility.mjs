import { writeFile } from "node:fs/promises";
// Static hosting cannot implement Next server redirects. Keep old bookmarks,
// verification queries and section anchors through concrete exported aliases.
for (const [file, route] of [
  ["gm.html", "/bestiary/"],
  ["marijan.html", "/marijan/"],
  ["legal.html", "/legal/"],
]) {
  await writeFile(
    new URL(`../out/${file}`, import.meta.url),
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Character Ledger</title><link rel="canonical" href="${route}"><script>location.replace(${JSON.stringify(route)}+location.search+location.hash)</script><a href="${route}">Continue to Character Ledger</a></html>\n`,
  );
}
