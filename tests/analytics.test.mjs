import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyticsEnabled, pageViewOnly } from "../dist/analytics.mjs";

test("analytics excludes local servers, offline files and isolated verification URLs", () => {
  for (const url of [
    "http://127.0.0.1:8104/",
    "https://127.0.0.1/",
    "https://localhost/",
    "https://test.localhost/",
    "https://[::1]/",
    "file:///character-generator/dist/index.html",
    "https://wfrp5e-char-gen-dist.vercel.app/gm.html?verify=1",
  ])
    assert.equal(analyticsEnabled(new URL(url)), false, url);
  assert.equal(analyticsEnabled(undefined), false);
  assert.equal(
    analyticsEnabled(new URL("https://wfrp5e-char-gen-dist.vercel.app/")),
    true,
  );
  assert.equal(
    analyticsEnabled(new URL("https://characters.example/marijan.html")),
    true,
  );
});

test("only page views are sent, with query strings and fragments removed", () => {
  assert.deepEqual(
    pageViewOnly({
      type: "pageview",
      url: "https://example.com/gm.html?draft=private#secret",
    }),
    {
      type: "pageview",
      url: "https://example.com/gm.html",
    },
  );
  assert.equal(
    pageViewOnly({
      type: "event",
      url: "https://example.com/",
      data: { name: "Private character" },
    }),
    null,
  );
});

test("all creator pages use one shared integration and the generated SDK matches the installed library", async () => {
  for (const page of ["index.html", "gm.html", "marijan.html"]) {
    const html = await readFile(
      new URL(`../dist/${page}`, import.meta.url),
      "utf8",
    );
    assert.equal(html.match(/src="analytics\.mjs"/g)?.length, 1, page);
  }
  assert.deepEqual(
    await readFile(
      new URL("../dist/assets/vercel-analytics.mjs", import.meta.url),
    ),
    await readFile(new URL(import.meta.resolve("@vercel/analytics"))),
  );
});
