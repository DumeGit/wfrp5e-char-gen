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
  await mkdir(path.join(root, "out"));
  await mkdir(path.join(root, "scripts"));
  await mkdir(path.join(root, "content"));
  for (const file of [
    "package.json",
    "package-lock.json",
    "out/app.js",
    "scripts/build.mjs",
    "content/descriptions.json",
  ])
    await writeFile(path.join(root, file), "original");
  const original = await buildFingerprint(root);
  assert.equal(await buildFingerprint(root), original);
  await writeFile(path.join(root, "out/app.js"), "modified");
  assert.notEqual(await buildFingerprint(root), original);
  await writeFile(path.join(root, "out/app.js"), "original");
  assert.equal(await buildFingerprint(root), original);
  await writeFile(path.join(root, "scripts/build.mjs"), "modified");
  assert.notEqual(await buildFingerprint(root), original);
  await writeFile(path.join(root, "scripts/build.mjs"), "original");
  await rm(path.join(root, "out/app.js"));
  assert.notEqual(await buildFingerprint(root), original);
});

test("browser preparation includes typed source, public assets and framework configuration", async (t) => {
  const base = path.resolve(tmpdir());
  const root = await mkdtemp(path.join(base, "wfrp-browser-build-"));
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(base + path.sep));
    assert.ok(path.basename(root).startsWith("wfrp-browser-build-"));
    await rm(root, { recursive: true, force: true });
  });
  const absent = await buildFingerprint(root);
  await mkdir(path.join(root, "src"));
  await writeFile(path.join(root, "src", "page.tsx"), "original");
  const source = await buildFingerprint(root);
  assert.notEqual(source, absent);
  await writeFile(path.join(root, "src", "page.tsx"), "modified");
  assert.notEqual(await buildFingerprint(root), source);
  await writeFile(path.join(root, "next.config.mjs"), "config");
  const configured = await buildFingerprint(root);
  await writeFile(path.join(root, "next.config.mjs"), "change");
  assert.notEqual(await buildFingerprint(root), configured);
  await mkdir(path.join(root, "public"));
  await writeFile(path.join(root, "public", "image.svg"), "original");
  const assets = await buildFingerprint(root);
  await rm(path.join(root, "public", "image.svg"));
  assert.notEqual(await buildFingerprint(root), assets);
});
