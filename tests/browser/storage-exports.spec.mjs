import {
  test,
  expect,
  openPC,
  openGM,
  applyProfile,
  pcStep,
  gmStep,
  gmDraft,
  fileUpload,
  downloadBytes,
  PC_STORAGE,
} from "./helpers.mjs";
import { PDFDocument } from "pdf-lib";

test("PC save/load and reload retain actual purchases but exclude search state @storage", async ({
  page,
}) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Experience");
  await page
    .locator(".xp-characteristic-row")
    .filter({ has: page.getByText("Weapon Skill", { exact: true }) })
    .getByRole("button", { name: "125 XP", exact: true })
    .click();
  const saved = await downloadBytes(
    page,
    page.getByRole("button", { name: "Save character", exact: true }),
  );
  const object = JSON.parse(saved.bytes);
  expect(object.ledger).toHaveLength(1);
  expect(object.books.packs).toEqual([
    expect.objectContaining({ id: "core", version: expect.any(String) }),
  ]);
  expect(object).not.toHaveProperty("searchQuery");
  object.name = "Reloaded Test Soldier";
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load character", exact: true }),
    object,
    "test-soldier.json",
  );
  await expect(page.locator(".xp-balance .remaining strong")).toHaveText("875");
  await page.reload();
  await expect(page.locator(".xp-balance .remaining strong")).toHaveText("875");
  const restored = JSON.parse(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  );
  expect(restored.name).toBe("Reloaded Test Soldier");
  expect(restored.ledger).toEqual(object.ledger);
});
test("GM file loading preserves edits and rejects player files @storage @gm", async ({
  page,
}) => {
  await openGM(page);
  const draft = await gmDraft();
  draft.description = "Imported test guard";
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load draft", exact: true }),
    draft,
    "test-npc.json",
  );
  await page
    .getByRole("dialog", { name: "Load this GM draft?", exact: true })
    .getByRole("button", { name: "Load draft", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toHaveValue(draft.name);
  const saved = await downloadBytes(
    page,
    page.getByRole("button", { name: "Save NPC / creature", exact: true }),
  );
  expect(JSON.parse(saved.bytes)).toEqual(draft);
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load draft", exact: true }),
    { version: 2, species: "Human" },
    "wrong-type.json",
  );
  await expect(
    page.getByText(
      "Choose a current NPC & creature save file for this core version.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toHaveValue(draft.name);
});
test("PC browser downloads an editable sheet and complete record @exports", async ({
  page,
}) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Review & export");
  const sheet = await downloadBytes(
    page,
    page.getByRole("button", { name: "Download character sheet", exact: true }),
  );
  expect(sheet.name).toMatch(/\.pdf$/);
  const doc = await PDFDocument.load(sheet.bytes);
  expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
  expect(doc.getForm().getFields().length).toBeGreaterThan(20);
  expect(
    doc
      .getForm()
      .getFields()
      .some(
        (f) =>
          typeof f.getText === "function" &&
          f.getText() === "Browser Test Soldier",
      ),
  ).toBe(true);
  const record = await downloadBytes(
    page,
    page.getByRole("button", {
      name: "Download creation & XP record",
      exact: true,
    }),
  );
  expect((await PDFDocument.load(record.bytes)).getPageCount()).toBeGreaterThan(
    0,
  );
});
test("GM browser downloads compact PDF and six-card A4 sheet @exports @gm", async ({
  page,
}) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Review & export");
  const sheet = await downloadBytes(
    page,
    page.getByRole("button", { name: "Export PDF", exact: true }),
  );
  expect((await PDFDocument.load(sheet.bytes)).getPageCount()).toBe(1);
  await page
    .getByRole("button", { name: "Print A4 table cards", exact: true })
    .click();
  const print = page.getByRole("dialog", {
    name: "Print table cards",
    exact: true,
  });
  await expect(
    print.getByLabel("Cards per A4 page", { exact: true }),
  ).toHaveValue("6");
  const other = await gmDraft("Halfling");
  await fileUpload(
    page,
    print.getByRole("button", { name: "Add saved drafts…", exact: true }),
    other,
    "halfling.json",
  );
  await expect(print.locator(".gm-print-list > li")).toHaveCount(2);
  const cards = await downloadBytes(
    page,
    print.getByRole("button", { name: "Download A4 PDF", exact: true }),
  );
  const doc = await PDFDocument.load(cards.bytes);
  expect(doc.getPageCount()).toBe(1);
  const { width, height } = doc.getPages()[0].getSize();
  expect(width).toBeCloseTo(595.28, 1);
  expect(height).toBeCloseTo(841.89, 1);
});
