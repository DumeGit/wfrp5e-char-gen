import test from "node:test";
import assert from "node:assert/strict";
import { referenceSnippetText } from "../dist/search-presentation.mjs";
import { field, select, tab } from "../dist/controls.mjs";

test("reader excerpts remove layout syntax while preserving printed mechanics", () => {
  assert.equal(
    referenceSnippetText("##\u00a0Spend Fortune\n\n**+1 SL**; −5 S; 2 × TB"),
    "Spend Fortune +1 SL; −5 S; 2 × TB",
  );
  assert.equal(
    referenceSnippetText(
      "| Roll | Result |\n| :--- | ---: |\n| 05–06 | Rat Catcher* |",
    ),
    "Roll · Result · 05–06 · Rat Catcher*",
  );
  assert.equal(
    referenceSnippetText("A # symbol in prose stays."),
    "A # symbol in prose stays.",
  );
});
test("shared controls carry escaped identities and native input intent", () => {
  assert.match(
    field("Wounds", "wounds", 3, 'min="0"', "number"),
    /inputmode="decimal"/,
  );
  assert.match(field("Name", "name", "<test>"), /value="&lt;test&gt;"/);
  const custom = select(
    "Lore",
    "lore",
    ["Fire"],
    "Fire",
    'name="selectedLore"',
  );
  assert.equal((custom.match(/ name=/g) || []).length, 1);
  const stats = tab("Characteristics", {
    id: "stats",
    panel: "content",
    action: "tab",
    value: 0,
    selected: true,
    short: "Stats",
  });
  assert.match(stats, /aria-label="Characteristics"/);
  assert.match(stats, /aria-selected="true" tabindex="0"/);
});
