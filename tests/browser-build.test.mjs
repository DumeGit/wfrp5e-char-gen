import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildFingerprint } from "../scripts/browser-build.mjs";

test("browser preparation cache rejects same-length edits and removed assets", async (t) => {
  const base = path.resolve(tmpdir());
  const root = await mkdtemp(path.join(base, "wfrp-browser-build-"));
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(base + path.sep));
    assert.ok(path.basename(root).startsWith("wfrp-browser-build-"));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, "dist"));
  await mkdir(path.join(root, "scripts"));
  for (const file of [
    "package.json",
    "package-lock.json",
    "dist/app.js",
    "scripts/build.mjs",
  ])
    await writeFile(path.join(root, file), "original");
  const original = await buildFingerprint(root);
  assert.equal(await buildFingerprint(root), original);
  await writeFile(path.join(root, "dist/app.js"), "modified");
  assert.notEqual(await buildFingerprint(root), original);
  await writeFile(path.join(root, "dist/app.js"), "original");
  assert.equal(await buildFingerprint(root), original);
  await writeFile(path.join(root, "scripts/build.mjs"), "modified");
  assert.notEqual(await buildFingerprint(root), original);
  await writeFile(path.join(root, "scripts/build.mjs"), "original");
  await rm(path.join(root, "dist/app.js"));
  assert.notEqual(await buildFingerprint(root), original);
});
