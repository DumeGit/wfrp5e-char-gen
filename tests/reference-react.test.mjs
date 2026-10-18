import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseFragment } from "parse5";
import { tsImport } from "tsx/esm/api";
import { createHash } from "node:crypto";
import { loadReferenceLibrary } from "../src/engine/search-library.mjs";
import { loadBookBundle } from "../src/engine/book-bundle.mjs";
const { ReferenceBody, RuleText } = await tsImport(
  "../src/features/reference-search/ReferenceBody.tsx",
  import.meta.url,
);
const read = async (file) =>
  JSON.parse(await readFile(new URL(file, import.meta.url), "utf8"));
const library = await loadBookBundle(() =>
  read("../public/data/book-library.json"),
);
const data = await loadReferenceLibrary(
  library,
  () => read("../public/data/search-library.json"),
  { normalize: false },
);
function text(html) {
  const visit = (node) =>
    node.nodeName === "#text"
      ? node.value
      : (node.childNodes || []).map(visit).join(" ");
  return visit(parseFragment(html))
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
test("React references retain all existing fields and canonical wording for representative categories", async () => {
  const baseline = JSON.parse(
    await readFile(
      new URL("./fixtures/reference-render-parity.json", import.meta.url),
      "utf8",
    ),
  );
  for (const sample of baseline.samples) {
    const row = data.rows.find((row) => row.key === sample.key);
    assert.ok(row, sample.key);
    const actual = renderToStaticMarkup(
      createElement(ReferenceBody, { row, renderText: (value) => value }),
    );
    assert.equal(
      createHash("sha256").update(text(actual)).digest("hex"),
      sample.textSHA256,
      sample.kind + ": " + row.name,
    );
  }
  assert.ok(
    baseline.samples.length >= 12,
    "Covers every retained reference category",
  );
});
test("React reference tables preserve all cell values and escape authored markup", () => {
  const html = renderToStaticMarkup(
    createElement(RuleText, {
      text: "| Roll | Outcome |\n| --- | --- |\n| 01–10 | <script>unsafe</script> |\n| 11–00 | 25 brass pennies |",
      renderText: (value) => value,
    }),
  );
  assert.equal(parseFragment(html).childNodes[0].nodeName, "div");
  assert.ok(html.includes("&lt;script&gt;unsafe&lt;/script&gt;"));
  assert.ok(html.includes("01–10"));
  assert.ok(html.includes("25 brass pennies"));
  assert.ok(!html.includes("<script>"));
});
