import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as PDFLib from "pdf-lib";
import { R, soldier } from "./fixture.mjs";
import { characterResult } from "../src/engine/character-result.mjs";
import { exportSheet } from "../src/engine/export.mjs";

test("Hunter unlisted weights count as zero in load effects and filled PDF totals", async () => {
  const s = { ...soldier(), career: "hunter" };
  const result = characterResult(R, s);
  const eq = result.equipment;
  assert.deepEqual(eq.assumedZero, [
    "Selection of Animal Traps",
    "Sturdy Boots",
  ]);
  assert.deepEqual(eq.unresolved, []);
  assert.equal(eq.penalties.complete, true);
  assert.equal(eq.total, 1);
  for (const name of eq.assumedZero) {
    const entry = eq.entries.find((x) => x.name === name);
    assert.equal(entry.enc, null);
    assert.equal(entry.carriedEnc, 0);
  }
  assert.equal(eq.penalties.movement, result.derived.movement);
  assert.ok(
    result.notices
      .filter((x) => x.code === "gear.assumed-weight")
      .every((x) => x.severity === "info"),
  );
  globalThis.PDFLib = PDFLib;
  const pdf = await PDFLib.PDFDocument.load(
    await exportSheet(
      R,
      s,
      fs.readFileSync(
        new URL("../public/assets/character-sheet.pdf", import.meta.url),
      ),
      JSON.parse(
        fs.readFileSync(
          new URL("../public/data/sheet-fields.json", import.meta.url),
        ),
      ),
      { result },
    ),
  );
  const form = pdf.getForm();
  assert.equal(form.getTextField("Enc_Total").getText(), String(eq.total));
  assert.equal(
    form.getTextField("Enc_Trappings").getText(),
    String(eq.gearEnc),
  );
  assert.match(
    form.getTextField("Notes").getText(),
    /Unlisted weights count as 0 Enc/,
  );
});

test("Player still requires an actual equipment quantity roll", () => {
  const result = characterResult(R, { ...soldier(), career: "priest" });
  assert.ok(result.issues.some((x) => x.code === "gear.quantity"));
  assert.ok(result.equipment.unresolved.includes("Parchment"));
  assert.equal(result.equipment.penalties.complete, false);
});
