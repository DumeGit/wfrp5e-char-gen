import {createElement, Fragment} from "react";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assembleBooks } from "../src/engine/books.mjs";
import { fresh } from "../src/engine/rules.mjs";
import { characterResult } from "../src/engine/character-result.mjs";
import { reviewSheet } from "./presentation-review-sheet.mjs";
import { esc } from "./presentation-controls.mjs";

const R = assembleBooks(
  JSON.parse(
    readFileSync(new URL("../public/data/book-library.json", import.meta.url)),
  ),
);
const ui = {
  issues: [],
  issueHTML: "",
  recordsHTML: "",
  fullAppendix: false,
  talentDescription: (name, { metadata }) => createElement(Fragment, null, name, metadata),
  spellDescription: (spell) => esc(spell.name),
};

test("Review displays the shared current totals, distinct Fate/Fortune and counted Talent ranks", () => {
  const s = {
    ...fresh(),
    species: "Human",
    career: "soldier",
    name: '<img src=x onerror="bad()">',
    wealth: { amount: 71, currency: "brass pennies" },
  };
  const result = characterResult(R, s);
  result.derived.talents = ["Strong Back", "Strong Back"];
  result.equipment.penalties = {
    ...result.equipment.penalties,
    complete: true,
    agility: 17,
    movement: 2,
  };
  result.derived.fate = 4;
  result.derived.fortune = 3;
  const html = reviewSheet(R, s, result, ui);
  assert.ok(!html.includes("<img src=x"));
  assert.match(html, /&lt;img/);
  assert.match(html, /Agility 17; calculation/);
  assert.match(html, /<dt>Fate<\/dt><dd>4<\/dd>/);
  assert.match(html, /<dt>Fortune<\/dt><dd>3<\/dd>/);
  assert.match(html, /<dt>Movement<\/dt><dd>2<\/dd>/);
  assert.match(
    html,
    /Strong Back<span class="review-rank" aria-label="2 ranks">×2/,
  );
});

test("Review retains unresolved quantities and magic collections", () => {
  const s = { ...fresh(), species: "Human" };
  const result = characterResult(R, s);
  result.equipment.unknown = ["Unknown <parcel>"];
  result.equipment.unresolved = ["Unknown <parcel>"];
  result.equipment.penalties.complete = false;
  result.spells = [{ name: "Test prayer" }];
  result.runes = [{ name: "Test rune" }];
  result.techniques = [{ name: "Test technique" }];
  result.cants = [{ name: "Test cant" }];
  const html = reviewSheet(R, s, result, {
    ...ui,
    issues: [{}],
    issueHTML: "blocking choice",
  });
  assert.match(html, /Load effects are unresolved/);
  assert.match(html, /Known weight only/);
  assert.match(html, /Unknown &lt;parcel&gt;/);
  assert.match(html, /<strong>Not rolled<\/strong>/);
  for (const name of [
    "Test prayer",
    "Test rune",
    "Test technique",
    "Test cant",
    "blocking choice",
  ])
    assert.ok(html.includes(name));
  assert.match(html, /data-action="sheet" disabled/);
  assert.match(html, /Career<\/dt><dd>Not chosen/);
});
