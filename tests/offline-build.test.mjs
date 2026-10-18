import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildOffline, exportedRoutes } from "../scripts/build-pwa.mjs";

async function fixture(t) {
  const parent = path.resolve(tmpdir());
  const root = await mkdtemp(path.join(parent, "wfrp-offline-build-"));
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(parent + path.sep));
    assert.ok(path.basename(root).startsWith("wfrp-offline-build-"));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, "bestiary"));
  await mkdir(path.join(root, "_next", "static"), { recursive: true });
  for (const [file, body] of Object.entries({
    "index.html": "<html>Player</html>",
    "index.txt": "player-flight-payload",
    "bestiary/index.html": "<html>Bestiary</html>",
    "bestiary/index.txt": "bestiary-flight-payload",
    "gm.html": "<html>compatibility</html>",
    "_next/static/fingerprint.js": "export{}",
  }))
    await writeFile(path.join(root, file), body);
  return { root, url: pathToFileURL(root + path.sep) };
}
test("offline inventory maps exported documents and payloads without inventing compatibility payloads", async (t) => {
  const { root, url } = await fixture(t);
  const first = await buildOffline(url);
  const routes = exportedRoutes(first.assets);
  assert.deepEqual(routes[""], {
    document: "index.html",
    payload: "index.txt",
  });
  assert.deepEqual(routes["bestiary/"], {
    document: "bestiary/index.html",
    payload: "bestiary/index.txt",
  });
  assert.deepEqual(routes["gm.html"], { document: "gm.html" });
  assert.ok(first.assets.includes("_next/static/fingerprint.js"));
  assert.ok(!first.assets.includes("sw.js"));
  assert.equal((await buildOffline(url)).version, first.version);
  await writeFile(path.join(root, "_next/static/fingerprint.js"), "export{a}");
  assert.notEqual((await buildOffline(url)).version, first.version);
  assert.match(
    await readFile(path.join(root, "sw.js"), "utf8"),
    /bestiary-flight-payload|bestiary\/index\.txt/,
  );
});
test("private authored inputs cannot enter the offline output", async (t) => {
  const { root, url } = await fixture(t);
  await mkdir(path.join(root, "content"));
  await writeFile(path.join(root, "content/private.json"), "private");
  await assert.rejects(buildOffline(url), /Private build sources/);
});
