import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as PDFLib from "pdf-lib";
import * as M from "../dist/rules.mjs";
import { R, library, soldier } from "./fixture.mjs";
import { assembleBooks, registeredEntries } from "../dist/books.mjs";
import {
  characterResult,
  createResultReader,
} from "../dist/character-result.mjs";
import { folioData } from "../dist/folio.mjs";
import { calculation, esc } from "../dist/workspace.mjs";
import { exportSheet } from "../dist/export.mjs";
import { issueTarget } from "../dist/issue-targets.mjs";
import { buildBookReport } from "../dist/book-report.mjs";
import { validateCoverage } from "../dist/book-coverage.mjs";
import {
  CONTENT_ALIASES,
  canonicalName,
  resolveContent,
  validateAliases,
} from "../dist/content-references.mjs";
import { sourceButton } from "../dist/source-controls.mjs";
import {
  detailKey,
  captureDisclosures,
  restoreDisclosures,
} from "../dist/disclosures.mjs";
import { createFeature as createActions } from "../dist/features/actions.mjs";
import { createDraftHistory } from "../dist/draft-history.mjs";
import { createFeature as createResets } from "../dist/features/creation-state.mjs";
import { createFeature as createExperience } from "../dist/features/experience-view.mjs";
import { runeShopRows } from "../dist/dwarf-guide-ui.mjs";
import { createFeature as createReview } from "../dist/features/review-view.mjs";
const B = assembleBooks(
  library,
  library.packs
    .filter((x) => x.manifest.kind !== "variant")
    .map((x) => x.manifest.id),
);

test("structured core and supplement failures preserve all messages, provenance and wording-independent routing", () => {
  const s = soldier();
  s.wealth = null;
  s.speciesSkills = [];
  s.career = "wizard";
  s.chart = {
    enabled: true,
    sign: "",
    rolledSign: "",
    witchling: 0,
    talent: "",
    ascendant: "",
    mansions: [],
  };
  const records = M.validation(B, s, true);
  assert.deepEqual(
    records.map((x) => x.message),
    M.validation(B, s),
  );
  for (const x of records) {
    assert.equal(x.severity, "error");
    assert.ok(B.books.some((b) => b.id === x.source.book));
    assert.ok(x.source.page);
    assert.deepEqual(
      issueTarget({ ...x, message: "Translated unrelated wording" }),
      issueTarget(x),
    );
  }
  const college = records.find((x) => x.code === "wom.college");
  assert.equal(college.source.book, "winds-of-magic");
  assert.equal(college.control.target, "#college-lore");
  assert.throws(() => issueTarget("Choose College"), /structured/);
});

test("result reuse invalidates for in-place purchases, undo, optional choices and catalogue identity", () => {
  let calls = 0;
  const reader = createResultReader((R, s) => {
      calls++;
      return characterResult(R, s);
    }),
    s = soldier();
  const first = reader(R, s);
  assert.strictEqual(reader(R, s), first);
  assert.equal(calls, 1);
  M.purchase(R, s, "skill", "Cool");
  const bought = reader(R, s);
  assert.notStrictEqual(bought, first);
  assert.equal(bought.derived.spent, 75);
  assert.strictEqual(reader(R, s), bought);
  s.ledger.pop();
  const undone = reader(R, s);
  assert.deepEqual(undone.derived, first.derived);
  s.notes = "A new background note";
  assert.notStrictEqual(reader(R, s), undone);
  assert.notStrictEqual(reader(B, s), reader(R, s));
});

test("folio, review, calculation and editable PDF share load-adjusted Skill/XP/resource rows", async () => {
  globalThis.PDFLib = PDFLib;
  const s = soldier();
  M.purchase(R, s, "skill", "Dodge");
  const result = characterResult(R, s),
    folio = folioData(R, s, result);
  for (const row of result.skills.filter((x) => x.adv > 0)) {
    assert.equal(
      folio.skills.find((x) => x.name === row.name).value,
      row.total,
    );
    assert.equal(
      calculation(R, s, "skill", row.name, result).rows.at(-1)[1],
      row.total,
    );
  }
  const context = {
    R,
    s,
    result: () => result,
    errors: () => result.issues,
    esc,
    ref: () => "",
    button: () => "",
    talentDescription: () => "",
    spellDescription: () => "",
  };
  const review = createReview(
    () => context,
    () => {},
  ).review();
  assert.match(
    review,
    /<td>.*Dodge.*<\/td><td>\+5<\/td><td>\+5<\/td><td>42<\/td>/,
  );
  const sheet = await PDFLib.PDFDocument.load(
    await exportSheet(
      R,
      s,
      fs.readFileSync(
        new URL("../dist/assets/character-sheet.pdf", import.meta.url),
      ),
      JSON.parse(
        fs.readFileSync(
          new URL("../dist/data/sheet-fields.json", import.meta.url),
        ),
      ),
      { result },
    ),
  );
  const form = sheet.getForm();
  for (const [field, value] of [
    ["Dodge_Skill", result.skills.find((x) => x.name === "Dodge").total],
    ["XP_Spent", result.derived.spent],
    ["Fate", result.derived.fate],
    ["Fortune_Max", result.derived.fortune],
  ])
    assert.equal(form.getTextField(field).getText(), String(value));
  assert.equal(form.getFields().length, 556);
});

test("incomplete data is warning-only and is distinct from actionable errors", () => {
  const s = soldier();
  s.gearChoices["career-2"] = "Unspecified";
  const result = characterResult(R, s);
  assert.ok(
    result.notices.every((x) => ["warning", "info"].includes(x.severity)),
  );
  assert.equal(
    result.issues.some((x) => x.severity === "warning"),
    false,
  );
  assert.ok(result.notices.every((x) => x.source.book && x.control));
});

test("source controls use explicit metadata independent of translated display labels", () => {
  const c = structuredClone(R);
  c.books.find((x) => x.id === "core").shortTitle = "Translated title";
  const html = sourceButton(c, { source: { book: "core", page: 39 } });
  assert.match(html, /data-book="core"/);
  assert.match(html, /data-page="39"/);
  assert.throws(() => sourceButton(c, { label: "core p. 39" }), /explicit/);
});

test("exact references resolve active variants and aliases but reject ambiguous names", () => {
  assert.equal(
    resolveContent(R, { kind: "talents", name: "Acute Sight" }).name,
    "Acute Sense (Sense)",
  );
  const variants = B.careers.filter((x) => x.name === "Karak Ranger");
  assert.equal(variants.length, 2);
  assert.throws(
    () => resolveContent(B, { kind: "careers", name: "Karak Ranger" }),
    /ambiguous/,
  );
  for (const x of variants)
    assert.equal(
      resolveContent(B, { kind: "careers", contentId: x.contentId }).contentId,
      x.contentId,
    );
  assert.equal(canonicalName("gear-profile", "Dwarf Hammer"), "Dwarf Hammer");
  assert.equal(
    canonicalName("gear-profile", "Dwarf Hammer", "dwarf-guide"),
    "Dwarf Warhammer",
  );
  assert.throws(
    () => resolveContent(R, { kind: "careers", name: "Solider" }),
    /unavailable/,
  );
});

test("alias validation rejects duplicate identifiers and cycles", () => {
  const ids = library.packs.map((x) => x.manifest.id);
  assert.strictEqual(validateAliases(CONTENT_ALIASES, ids), CONTENT_ALIASES);
  assert.throws(
    () => validateAliases([...CONTENT_ALIASES, CONTENT_ALIASES[0]], ids),
    /duplicate/,
  );
  const a = {
      kind: "careers",
      from: "a",
      to: "b",
      source: { book: "core", page: 1 },
      reason: "test",
    },
    b = { ...a, from: "b", to: "a" };
  assert.throws(() => validateAliases([a, b], ids), /cycle/);
});

test("generated integration inventory includes every source record and distinguishes unchanged old material", () => {
  const report = buildBookReport(library);
  assert.equal(report.books.length, library.packs.length);
  assert.equal(report.activeCounts.careers, B.careers.length);
  assert.equal(report.activeCounts.magicProfiles, B.spells.length);
  for (const pack of library.packs) {
    const book = report.books.find((x) => x.id === pack.manifest.id);
    assert.equal(book.records.length, registeredEntries(pack).length);
    assert.equal(
      Object.values(book.recordCounts).reduce((a, b) => a + b, 0),
      book.records.length,
    );
    assert.equal(book.features.length, pack.data.coverage.features.length);
  }
  const dwarf = report.books.find((x) => x.id === "dwarf-guide");
  assert.ok(dwarf.records.some((x) => x.status === "implemented"));
  assert.ok(dwarf.records.some((x) => x.status === "adapted"));
  assert.ok(dwarf.records.some((x) => x.status === "reference-only"));
  assert.ok(dwarf.records.some((x) => x.status === "unavailable"));
  assert.ok(dwarf.features.some((x) => x.status === "deferred"));
  const staff = report.books
    .find((x) => x.id === "winds-of-magic")
    .records.find((x) => x.name === "Enchanted Staff");
  assert.equal(staff.status, "reference-only");
  const ma = report.books
    .find((x) => x.id === "archives-ii")
    .features.find((x) => x.id.endsWith(":gm-reminder"));
  assert.equal(ma.status, "reference-only");
  assert.match(ma.reason, /no acknowledgement/);
});

test("coverage validation rejects stale targets, invented statuses and invalid sources", () => {
  const original = library.packs.find(
    (x) => x.manifest.id === "winds-of-magic",
  );
  for (const mutate of [
    (p) => (p.data.coverage.records[0].contentId = "missing"),
    (p) => (p.data.coverage.features[0].status = "supported-ish"),
    (p) => (p.data.coverage.features[0].source.book = "core"),
  ]) {
    const pack = structuredClone(original);
    mutate(pack);
    assert.throws(
      () => validateCoverage(pack, registeredEntries(pack)),
      /Book coverage/,
    );
  }
});

test("disclosure identity survives translated labels and repeated profile names", () => {
  assert.notEqual(
    detailKey(
      "career",
      B.careers.find((x) => x.source.book === "archives-i"),
    ),
    detailKey(
      "career",
      B.careers.find((x) => x.source.book === "dwarf-guide"),
    ),
  );
  const state = new Map(),
    nodes = [{ dataset: { detailKey: "profile:stable" }, open: true }],
    root = { querySelectorAll: () => nodes };
  captureDisclosures(root, state);
  nodes[0].open = false;
  restoreDisclosures(root, state);
  assert.equal(nodes[0].open, true);
});

test("extracted purchases publish state to shared history before undo/redo recalculation", async () => {
  let s = soldier(),
    Rcurrent = R,
    setupOpen = false,
    renders = [];
  const history = createDraftHistory({ draft: s, document: "player" });
  const render = () => {
    renders.push(characterResult(Rcurrent, s));
    history.record({ draft: s, document: "player" });
  };
  const context = () => ({
    s,
    R: Rcurrent,
    setupOpen,
    render,
    result: () => characterResult(Rcurrent, s),
    errors: () => characterResult(Rcurrent, s).issues,
    toast: () => {},
    newCharacter: () => M.fresh(),
    library,
    detailsState: new Map(),
  });
  const setter = (key, value) => {
    if (key === "s") s = value;
    if (key === "R") Rcurrent = value;
    if (key === "setupOpen") setupOpen = value;
    return value;
  };
  const actions = createActions(context, setter);
  await actions.action({
    dataset: { action: "buy", type: "skill", name: "Cool" },
  });
  assert.equal(renders.at(-1).derived.spent, 75);
  s = history.travel("undo").draft;
  render();
  assert.equal(renders.at(-1).derived.spent, 0);
  s = history.travel("redo").draft;
  render();
  assert.equal(renders.at(-1).derived.spent, 75);
  const resets = createResets(context, setter);
  resets.changeCareer("wizard");
  assert.equal(s.career, "wizard");
  assert.equal(s.freeTalent, "");
  assert.equal(s.wealth, null);
});

test("rolled Career selection clears stale browser filters without storing search state in the character", () => {
  const s = soldier(),
    browsing = {
      careerSearch: "unrelated",
      careerPreview: "soldier",
      careerBook: "up-in-arms",
      careerFilter: "Warriors",
      careerLimit: 48,
    },
    resets = createResets(
      () => ({ R, s, ...browsing }),
      (key, value) => {
        browsing[key] = value;
      },
    );
  resets.changeCareer("wizard", "first");
  assert.equal(browsing.careerSearch, "Wizard");
  assert.equal(browsing.careerPreview, "wizard");
  assert.equal(browsing.careerBook, "all");
  assert.equal(browsing.careerFilter, "All classes");
  assert.equal(browsing.careerLimit, 12);
  assert.equal(s.careerSearch, undefined);
  resets.changeCareer("soldier", "three");
  assert.equal(browsing.careerSearch, "Soldier");
  assert.equal(browsing.careerPreview, "soldier");
  browsing.careerSearch = "spell";
  browsing.careerBook = "core";
  resets.changeCareer("wizard");
  assert.equal(browsing.careerSearch, "spell");
  assert.equal(browsing.careerBook, "core");
});

test("rendered Skill and rune groups retain distinct disclosure identities", () => {
  const s = soldier(),
    result = characterResult(B, s);
  const experience = createExperience(
    () => ({
      R: B,
      s,
      result: () => result,
      esc,
      skillSearch: "",
      errors: () => [],
      button: () => "",
      select: () => "",
      xpCareerOnly: false,
      xpAffordable: false,
    }),
    () => {},
  );
  const html = experience.experienceSkills();
  const keys = [...html.matchAll(/data-detail-key="([^"]+)"/g)].map(
    (x) => x[1],
  );
  assert.ok(keys.length > 1);
  assert.equal(new Set(keys).size, keys.length);
  const runes = runeShopRows(
    [
      "Rune Magic (Weapon: a)",
      "Rune Magic (Weapon: b)",
      "Rune Magic (Armour: a)",
      "Rune Magic (Armour: b)",
    ],
    () => "",
    "available",
  );
  const runeKeys = [...runes.matchAll(/data-detail-key="([^"]+)"/g)].map(
    (x) => x[1],
  );
  assert.equal(runeKeys.length, 2);
  assert.equal(new Set(runeKeys).size, 2);
});
