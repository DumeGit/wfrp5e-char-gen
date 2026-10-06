import { characterResult } from "../dist/character-result.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as PDFLib from "pdf-lib";
import { library, R, soldier, advancedSoldier } from "./fixture.mjs";
import * as M from "../dist/rules.mjs";
import { assembleBooks, bookSelection } from "../dist/books.mjs";
import {
  careerResults,
  careerDifferences,
  shopCategory,
  purchaseReason,
  calculation,
  talentCalculation,
} from "../dist/workspace.mjs";
import { careerBrowser, comparisonHTML } from "../dist/flow-ui.mjs";
import { magicRows, filterMagic } from "../dist/magic-browser.mjs";
import { characterReferences } from "../dist/record-sources.mjs";
import { issueTarget } from "../dist/issue-targets.mjs";
import { marketCatalog, buyTrapping } from "../dist/market.mjs";
import { exportRecord, exportSheet } from "../dist/export.mjs";
const B = assembleBooks(
  library,
  library.packs
    .filter((x) => x.manifest.kind !== "variant")
    .map((x) => x.manifest.id),
);

test("Career searches combine availability, Class, source and starting training without changing the draft", () => {
  const s = soldier(),
    before = JSON.stringify(s),
    priest = careerResults(B, s, { query: "priest" });
  assert.ok(priest.some((x) => x.id === "priest"));
  assert.ok(priest.some((x) => x.source.book === "archives-iii"));
  assert.ok(
    careerResults(B, s, { className: "Warrior", book: "up-in-arms" }).every(
      (x) => x.class === "Warrior" && x.source.book === "up-in-arms",
    ),
  );
  assert.ok(
    careerResults(B, { ...s, species: "Dwarf" }).every(
      (x) => !x.species || x.species.includes("Dwarf"),
    ),
  );
  careerBrowser(B, s, { preview: "priest", limit: 12 });
  assert.equal(JSON.stringify(s), before);
});

test("Career preview shows profile differences and retains the active optional variant", () => {
  const s = soldier(),
    priest = B.careers.find((x) => x.id === "priest");
  assert.ok(
    careerDifferences(M.career(B, s), priest).some(
      (x) => x.label === "Level 1 trappings",
    ),
  );
  assert.match(
    comparisonHTML(M.career(B, s), priest),
    /Leather Breastplate[\s\S]*Religious Symbol/,
  );
  const V = assembleBooks(library, ["archives-iii", "archives-iii-hedge"]);
  s.career = "hedge-witch";
  const html = careerBrowser(V, s, { preview: "hedge-witch", limit: 12 });
  assert.ok(html.includes(M.career(V, s).levels[0].skills.join(", ")));
  assert.match(html, /Current Career/);
});

test("Shop taxonomy combines sources while preserving each printed category and restriction", () => {
  const s = soldier(),
    items = marketCatalog(B, s),
    before = JSON.stringify(items);
  assert.equal(
    shopCategory(
      B,
      items.find((x) => x.name === "Shield"),
    ),
    "Armour & shields",
  );
  assert.ok(items.some((x) => shopCategory(B, x) === "Ammunition"));
  assert.equal(JSON.stringify(items), before);
  s.wealth = null;
  assert.match(purchaseReason(B, s, items[0]), /starting wealth/);
  s.wealth = { amount: 0, currency: "brass pennies" };
  assert.match(
    purchaseReason(
      B,
      s,
      items.find((x) => x.pennies > 0 && !x.sizeUnresolved && !x.useUnresolved),
    ),
    /more brass pennies/,
  );
});

test("Shop affordability and purchase feedback follow the actual remaining purse", () => {
  const s = soldier(),
    item = marketCatalog(R, s).find(
      (x) => x.pennies > 0 && x.pennies <= s.wealth.amount,
    );
  assert.equal(purchaseReason(R, s, item), "");
  buyTrapping(R, s, item.id);
  s.wealth.amount = item.pennies;
  assert.match(purchaseReason(R, s, item), /more brass pennies/);
});

test("The non-caster magic browser offers references without learning access", () => {
  const s = soldier(),
    before = JSON.stringify(s),
    rows = magicRows(B, s);
  assert.ok(rows.length > 500);
  assert.equal(filterMagic(rows).length, 0);
  assert.ok(
    filterMagic(rows, { status: "all", book: "blood-bramble" }).length >= 24,
  );
  assert.equal(JSON.stringify(s), before);
});

test("Magic learning filters preserve quotes, owners, costs and distinct types", () => {
  const s = soldier();
  s.freeTalent = "Petty Magic";
  s.spells = ["Bearings", "Open Lock", "Shock"];
  const rows = magicRows(B, s),
    available = filterMagic(rows),
    known = filterMagic(rows, { status: "known" });
  assert.ok(known.some((x) => x.name === "Bearings"));
  assert.ok(available.length > 0);
  for (const row of available)
    assert.deepEqual(row.quote, M.quoteSpell(B, s, row.name, row.talent));
  assert.equal(filterMagic(rows, { type: "Ritual" }).length, 0);
  assert.ok(
    filterMagic(rows, { status: "all", type: "Ritual", lore: "Beasts" }).some(
      (x) => x.lores.includes("Beasts"),
    ),
  );
  assert.ok(
    filterMagic(rows, { status: "all", type: "Ritual" }).every(
      (x) => x.quote && x.ritual,
    ),
  );
  s.xp = 0;
  assert.equal(filterMagic(magicRows(B, s)).length, 0);
});

test("Source collection includes owned content and excludes unused supplement profiles", () => {
  const s = soldier(),
    refs = characterReferences(B, s);
  assert.ok(refs.some((x) => x.name === "Soldier"));
  assert.ok(refs.some((x) => x.name === "Warrior Born"));
  assert.ok(!refs.some((x) => x.name === "Godspakt"));
  assert.ok(!refs.some((x) => x.name === "Rhinox Herder"));
  assert.equal(
    new Set(
      refs.map(
        (x) =>
          x.contentId ||
          x.id ||
          `${x.source?.book}:${x.source?.page}:${x.name || x.level}`,
      ),
    ).size,
    refs.length,
  );
});

test("Calculation explanations reconcile with live Characteristic, Skill and derived totals", () => {
  const s = advancedSoldier(),
    d = M.derive(R, s);
  for (const key of M.KEYS)
    assert.equal(
      calculation(R, s, "char", key).rows.find(
        (x) => x[0] === "Intrinsic total",
      )[1],
      d.stats[key],
    );
  for (const name of Object.keys(d.skills).filter((n) => d.skills[n] > 0)) {
    const model = calculation(R, s, "skill", name),
      total = d.stats[M.skillInfo(R, name, s).char] + d.skills[name] * 5;
    assert.equal(model.rows.at(-1)[1], total, name);
  }
  assert.equal(calculation(R, s, "derived", "Wounds").rows.at(-1)[1], d.wounds);
  assert.equal(
    calculation(R, s, "derived", "Capacity").rows.find(
      (x) => x[0] === "Final capacity",
    )[1],
    d.capacity,
  );
  for (const resource of ["Fate", "Fortune"])
    assert.equal(
      calculation(R, s, "derived", resource)
        .rows.slice(0, -1)
        .reduce((n, x) => n + x[1], 0),
      d[resource.toLowerCase()],
    );
  assert.match(talentCalculation(R, "Warrior Born"), /Included in your totals/);
  assert.match(talentCalculation(R, "Drilled"), /Reference for play/);
});

test("Issue destinations distinguish prerequisite choices, magic allocation and wealth controls", () => {
  const s = soldier();
  s.career = "wizard";
  s.wealth = null;
  const records = () => characterResult(B, s).issues;
  assert.deepEqual(
    issueTarget(records().find((x) => x.code === "wom.college")),
    { step: 1, target: "#college-lore" },
  );
  assert.deepEqual(
    issueTarget(records().find((x) => x.code === "gear.wealth")),
    { step: 5, target: '[data-action="wealth"]' },
  );
  s.career = "soldier";
  s.careerSkills["c1-7"] = 4;
  assert.deepEqual(
    issueTarget(records().find((x) => x.code === "skills.creation-cap")),
    { step: 3, target: '[data-action="skill-minus"][data-key="c1-7"]' },
  );
  s.freeTalent = "Petty Magic";
  assert.deepEqual(
    issueTarget(records().find((x) => x.code === "magic.free-choice")),
    { step: 4, target: '[data-action="free-magic-picker"][data-index="0"]' },
  );
  s.spells = ["Bearings"];
  assert.equal(
    issueTarget(records().find((x) => x.code === "magic.free-choice")).target,
    '[data-action="free-magic-picker"][data-index="1"]',
  );
});

test("Compact and full exports preserve the filled sheet and complete character ledger", async () => {
  globalThis.PDFLib = PDFLib;
  const s = advancedSoldier();
  s.version = 2;
  s.books = bookSelection(B);
  const compact = await PDFLib.PDFDocument.load(await exportRecord(B, s)),
    full = await PDFLib.PDFDocument.load(
      await exportRecord(B, s, { fullAppendix: true }),
    );
  assert.ok(full.getPageCount() > compact.getPageCount() + 5);
  const sheet = await PDFLib.PDFDocument.load(
      await exportSheet(
        B,
        s,
        fs.readFileSync(
          new URL("../dist/assets/character-sheet.pdf", import.meta.url),
        ),
        JSON.parse(
          fs.readFileSync(
            new URL("../dist/data/sheet-fields.json", import.meta.url),
          ),
        ),
      ),
    ),
    form = sheet.getForm();
  assert.equal(form.getTextField("XP_Spent").getText(), "1000");
  assert.equal(form.getTextField("Fate").getText(), "4");
  assert.equal(form.getTextField("Fortune_Max").getText(), "3");
  assert.ok(sheet.getPageCount() > compact.getPageCount());
});
