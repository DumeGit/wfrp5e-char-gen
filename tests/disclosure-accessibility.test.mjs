import test from "node:test";
import assert from "node:assert/strict";
import { parseFragment } from "parse5";
import { serialize } from "./react-presentation.mjs";
import { library, soldier } from "./fixture.mjs";
import { assembleBooks, bookSelection } from "../src/engine/books.mjs";
import { fresh } from "../src/engine/rules.mjs";
import {
  elfOriginPanel,
  elfMagicShop,
} from "../src/features/player/presentation/high-elf-ui.mjs";
import {
  psychometryPanel,
  ritualShop,
} from "../src/features/player/presentation/winds-of-magic-ui.mjs";
import { createFeature } from "../src/features/player/presentation/features/controls.mjs";
import { esc } from "../src/engine/workspace.mjs";

function inspect(node, insideSummary = false, violations = []) {
  if (
    insideSummary &&
    ["a", "button", "input", "select", "textarea"].includes(node.tagName)
  )
    violations.push(node.tagName);
  for (const child of node.childNodes || [])
    inspect(child, insideSummary || node.tagName === "summary", violations);
  return violations;
}

test("actual magical and optional supplement disclosures retain references outside their toggles", () => {
  const R = assembleBooks(library, ["high-elf", "winds-of-magic"]);
  const elf = {
    ...fresh(),
    version: 2,
    books: bookSelection(R),
    species: "High Elf",
    origin: "high-elf:origin:eataine",
    career: "high-elf:career:mage",
    xp: 100000,
  };
  const human = { ...soldier(), books: bookSelection(R) };
  const controls = createFeature(
    () => ({ R, s: human, esc }),
    () => {},
  );
  const cases = [
    ["Elder/Blood choices", elfOriginPanel(R, elf)],
    ["High Elf magic", elfMagicShop(R, elf)],
    ["Psychometry", psychometryPanel(R, human)],
    ["Ritual catalogue", ritualShop(R, human)],
    ["Spell rules", controls.spellDescription(R.spells[0])],
  ];
  for (const [name, node] of cases) {
    const html = serialize(node);
    assert.match(html, /<summary/, name + " renders actual choices");
    assert.deepEqual(
      inspect(parseFragment(html)),
      [],
      name + " has no nested interactive controls",
    );
  }
  const origin = serialize(cases[0][1]);
  assert.match(origin, /Explain Legacy adaptation/);
  assert.match(serialize(cases[3][1]), /data-action="source-info"/);
});
