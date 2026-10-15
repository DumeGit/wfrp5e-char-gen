import test from "node:test";
import assert from "node:assert/strict";
import { referenceSnippetText } from "../dist/search-presentation.mjs";
import { field, select, tab, score } from "../dist/controls.mjs";
import { displayNumber } from "../dist/display-number.mjs";
import { formatMoney, priceInPennies } from "../dist/market.mjs";

test("display numbers group totals without changing input values or money parsing", () => {
  assert.equal(displayNumber(2000000), "2,000,000");
  assert.equal(score(-1250.5), "-1,250.5");
  assert.equal(score(0), "0");
  assert.equal(score(null), "—");
  assert.equal(score("SB + 3"), "SB + 3");
  assert.match(field("XP", "xp", 1000000, "", "number"), /value="1000000"/);
  const coins = 1000000 * 240 + 19 * 12 + 11;
  assert.equal(formatMoney(coins), "1,000,000 GC 19/11");
  assert.equal(priceInPennies(formatMoney(coins)), coins);
});

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
