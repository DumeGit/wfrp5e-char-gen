import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const read = (name) => readFile(new URL(`../${name}`, import.meta.url), "utf8");
test("all creators identify the independent project and expose the same static notices", async () => {
  for (const page of ["index.html", "gm.html", "marijan.html"]) {
    const html = await read(`dist/${page}`);
    assert.match(html, /UNOFFICIAL · WFRP FIFTH EDITION/);
    assert.match(
      html,
      /Not affiliated with or endorsed by Games Workshop or Cubicle 7/,
    );
    for (const section of ["credits", "privacy", "contact"])
      assert.match(html, new RegExp(`href="legal.html#${section}"`));
    assert.match(html, /assets\/ledger-emblem.svg/);
    assert.doesNotMatch(html, /analytics\.mjs|black-banner\/w\.svg/);
  }
  const legal = await read("dist/legal.html");
  for (const name of ["pdf-lib", "cinzel", "fell", "gothic"])
    assert.ok(legal.includes(name));
  for (const [, path] of legal.matchAll(/href="(assets\/[^"]+)"/g))
    await access(new URL(`../dist/${path}`, import.meta.url));
  assert.match(
    legal,
    /not a statement of rights-holder approval or permission/,
  );
  assert.match(legal, /does not upload those character files/);
  assert.match(legal, /does not remove hosting logs/);
  assert.doesNotMatch(legal, /mailto:/);
});

test("analytics is absent from dependencies, the build and the offline package", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.equal(pkg.dependencies["@vercel/analytics"], undefined);
  assert.doesNotMatch(pkg.scripts.build, /analytics/);
  assert.doesNotMatch(await read("package-lock.json"), /@vercel\/analytics/);
  assert.doesNotMatch(
    await read("dist/sw.js"),
    /analytics\.mjs|vercel-analytics|black-banner\/w\.svg/,
  );
  assert.match(await read("dist/sw.js"), /legal\.html/);
  for (const name of [
    "dist/analytics.mjs",
    "dist/assets/vercel-analytics.mjs",
    "scripts/build-analytics.mjs",
    "dist/assets/black-banner/w.svg",
  ])
    await assert.rejects(access(new URL(`../${name}`, import.meta.url)));
});
