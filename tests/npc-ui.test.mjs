import test from "node:test";
import assert from "node:assert/strict";
import * as PDFLib from "pdf-lib";
import { R } from "./fixture.mjs";
import { freshNPC, validateNPCState } from "../dist/npc-state.mjs";
import { npcResult } from "../dist/npc-result.mjs";
import { npcPDF, npcText } from "../dist/npc-export.mjs";
import { npcSheet, npcSheetHTML } from "../dist/npc-sheet.mjs";
import { NPC_SECTIONS, npcChecks } from "../dist/npc-flow.mjs";
import { createNPCViews } from "../dist/features/npc-views.mjs";
const state = (name) =>
  freshNPC(R, R.creatures.find((x) => x.name === name).contentId);
function context(s) {
  return {
    R,
    s,
    d: npcResult(R, s),
    verify: true,
    books: R.books,
    undoAvailable: false,
    ui: {
      filter: "",
      category: "",
      profileSource: "",
      profileLimit: 12,
      previewProfile: "",
      trainingTab: "skills",
      folioExpanded: false,
      gearFilter: "",
      magicFilter: "",
      trait: "",
      traitValue: "",
      skill: "",
      skillBonus: 0,
      talent: "",
      talentTarget: "",
      talentRanks: 1,
      mutation: R.mutations[0].contentId,
      markStart: "Mental",
      gear: "",
      quantity: 1,
      spell: "",
      xpType: "char",
      xpName: "",
      xpTarget: "",
      amount: 5,
    },
  };
}
test("GM sections have independent controls, keep previews read-only and save the last section", () => {
  const s = state("Human"),
    ctx = context(s),
    views = createNPCViews(() => ctx),
    original = structuredClone(s);
  ctx.ui.previewProfile = R.creatures.find((x) => x.name === "Orc").contentId;
  const preview = views.render();
  assert.match(preview, /Use this profile/);
  assert.deepEqual(s, original);
  const required = [
    "npc-profile-search",
    "npc-size",
    "npc-trait-select",
    "npc-add-skill",
    "npc-gear",
    "npc-spell",
    "npc-xp",
    "npc-export-status",
  ];
  for (let i = 0; i < NPC_SECTIONS.length; i++) {
    s.step = i;
    ctx.d = npcResult(R, s);
    assert.match(views.render(), new RegExp(`id="${required[i]}"`));
    validateNPCState(R, s);
  }
  const loaded = validateNPCState(R, JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.step, 7);
  s.step = 8;
  assert.throws(() => validateNPCState(R, s), /creation settings/);
});
test("Template errors surface before the editor and point to actual first choice controls", () => {
  const s = state("Human");
  s.template = R.templates.find((x) => x.name === "Elite").contentId;
  const ctx = context(s);
  s.step = 1;
  const html = createNPCViews(() => ctx).render(),
    errors = npcChecks(ctx.d).errors;
  assert.ok(errors.length);
  assert.ok(
    html.indexOf('aria-label="Required choices"') <
      html.indexOf('aria-label="Characteristics"'),
  );
  for (const e of errors) {
    assert.equal(e.control.step, 1);
    assert.ok(
      html.includes(`id="${e.control.target.slice(1)}"`),
      e.control.target,
    );
  }
  s.step = 7;
  const review = createNPCViews(() => ctx).render();
  assert.match(review, /disabled aria-describedby="npc-export-status"/);
  assert.match(review, /Export blocked/);
});
test("Required choices route by structured control identifiers across the separated GM sections", () => {
  const s = state("Human");
  s.size = "Tiny";
  let d = npcResult(R, s);
  assert.equal(
    d.issues.find((x) => x.code === "wounds.unresolved").control.step,
    1,
  );
  s.size = "Average";
  s.traits.push({
    id: R.traits.find((x) => x.name === "Trained").contentId,
    value: "Broken",
  });
  d = npcResult(R, s);
  assert.equal(
    d.issues.find((x) => x.code === "training.fellowship-roll").control.step,
    2,
  );
  s.traits.push({
    id: R.traits.find((x) => x.name === "Amphibious").contentId,
    value: "",
  });
  d = npcResult(R, s);
  assert.equal(
    d.issues.find((x) => x.code === "amphibious.swim-bonus").control.step,
    3,
  );
  s.traits.push({
    id: R.traits.find((x) => x.name === "Spellcaster").contentId,
    value: "Fire",
  });
  d = npcResult(R, s);
  assert.equal(
    d.issues.find((x) => x.code === "spellcaster.wind").control.step,
    5,
  );
  s.xpBudget = 0;
  s.ledger.push({
    name: "WS",
    type: "char",
    amount: 1,
    cost: 5,
    source: { book: "core", page: 191 },
  });
  d = npcResult(R, s);
  assert.equal(d.issues.find((x) => x.code === "xp.overspent").control.step, 6);
});
test("Warnings remain in the editor while the compact sheet uses final values without discrepancy commentary", async () => {
  const s = state("Orc"),
    ctx = context(s);
  s.step = 7;
  const html = createNPCViews(() => ctx).render(),
    text = npcText(R, s, { result: ctx.d }),
    sheet = npcSheet(R, s, ctx.d);
  assert.equal(npcChecks(ctx.d).blocked, false);
  assert.match(html, /Source notes &amp; checks|Source notes & checks/);
  assert.match(html, /Toughness Bonus 4 disagree/);
  assert.doesNotMatch(
    text,
    /SOURCE DISCREPANCIES|disagree|CREATION RECORD|Legacy/,
  );
  assert.match(text, /T 30/);
  assert.match(text, /TB 4/);
  assert.equal(
    sheet.scores.find((x) => x.key === "W").value,
    String(ctx.d.stats.W),
  );
  const pdf = await PDFLib.PDFDocument.load(
    await npcPDF(R, s, { result: ctx.d, pdfLib: PDFLib }),
  );
  assert.equal(pdf.getPageCount(), 1);
});
test("Compact PDF blocks missing values at its API boundary and safely paginates long notes/names", async () => {
  const s = state("Human");
  s.size = "Tiny";
  await assert.rejects(
    () => npcPDF(R, s, { pdfLib: PDFLib }),
    /required choices/,
  );
  s.overrides.W = 1;
  s.name = "A very long creature name ".repeat(12);
  s.notes = "UnbrokenWord".repeat(500);
  const pdf = await PDFLib.PDFDocument.load(
    await npcPDF(R, s, { pdfLib: PDFLib }),
  );
  assert.ok(pdf.getPageCount() > 1);
  const preview = npcSheetHTML(R, s, npcResult(R, s));
  assert.ok(preview.includes(s.notes));
  assert.match(preview, /Compact stat sheet/);
});
test("Tool links, mobile navigation, stat-block toggle and source notes are available without desktop navigation", () => {
  const ctx = context(state("Human")),
    html = createNPCViews(() => ctx).render();
  assert.match(html, /class="creator-mode-link" href="index.html\?verify=1"/);
  assert.match(html, /id="npc-mobile-step"/);
  assert.match(html, /npc-mobile-bar/);
  ctx.ui.folioExpanded = true;
  const expanded = createNPCViews(() => ctx).render();
  assert.match(expanded, /sheet npc-sheet expanded/);
  assert.match(expanded, /aria-controls="npc-folio-body"/);
});
