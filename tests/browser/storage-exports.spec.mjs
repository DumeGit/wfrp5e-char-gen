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
  noOverflow,
  PC_STORAGE,
} from "./helpers.mjs";
import { PDFArray, PDFDocument, decodePDFRawStream } from "pdf-lib";

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
  await expect
    .poll(
      async () =>
        JSON.parse(
          await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
        ).name,
    )
    .toBe("Reloaded Test Soldier");
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
test("GM browser downloads compact PDF and flexible A4 cards @exports @gm", async ({
  page,
}, info) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await page
    .getByRole("textbox", { name: "Short description", exact: true })
    .fill("Grey eyes; a scar across the left cheek.");
  await page.getByRole("textbox", { name: "GM Notes" }).fill("Watch the gate.");
  await gmStep(page, "Review & export");
  await page.getByRole("textbox", { name: "GM Info" }).fill("Ask for the key.");
  await expect(
    page.getByRole("checkbox", { name: "Include GM Notes" }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Include GM Info" }),
  ).not.toBeChecked();
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
  ).toHaveValue("flexible");
  await print
    .getByLabel("Cards per A4 page", { exact: true })
    .selectOption("6");
  const other = await gmDraft("Halfling");
  other.notes = "Wait by the bridge.";
  await fileUpload(
    page,
    print.getByRole("button", { name: "Add saved drafts…", exact: true }),
    other,
    "halfling.json",
  );
  await expect(print.locator(".gm-print-list > li")).toHaveCount(2);
  const first = print.locator(".gm-print-list > li").first();
  await expect(
    first.getByRole("checkbox", { name: "Include GM Notes" }),
  ).toBeChecked();
  const includeInfo = first.getByRole("checkbox", { name: "Include GM Info" });
  await expect(includeInfo).toBeChecked();
  await expect(
    print
      .locator(".gm-print-list > li")
      .last()
      .getByRole("checkbox", { name: "Include GM Info" }),
  ).toBeChecked();
  await print
    .locator(".gm-print-list")
    .screenshot({ path: info.outputPath("a4-note-options.png") });
  const cards = await downloadBytes(
    page,
    print.getByRole("button", { name: "Download A4 PDF", exact: true }),
  );
  expect(cards.name).toBe("Bestiary-6-per-A4.pdf");
  const doc = await PDFDocument.load(cards.bytes);
  expect(doc.getPageCount()).toBe(1);
  const streams = doc.getPage(0).node.Contents();
  const content = (streams instanceof PDFArray ? streams.asArray() : [streams])
    .map((ref) =>
      Buffer.from(
        decodePDFRawStream(doc.context.lookup(ref)).decode(),
      ).toString(),
    )
    .join("\n");
  const printedText = [...content.matchAll(/<([0-9a-f]+)> Tj/gi)]
    .map(([, hex]) => Buffer.from(hex, "hex").toString("latin1"))
    .join(" ")
    .replace(/\s+/g, " ");
  for (const value of [
    "GM Notes",
    "Watch the gate.",
    "GM Info",
    "Ask for the key.",
    "Wait by the bridge.",
  ])
    expect(printedText).toContain(value);
  const { width, height } = doc.getPages()[0].getSize();
  expect(width).toBeCloseTo(595.28, 1);
  expect(height).toBeCloseTo(841.89, 1);
  await print
    .getByLabel("Cards per A4 page", { exact: true })
    .selectOption("flexible");
  await expect(print.locator("#gm-print-status")).toContainText(
    "flexible heights",
  );
  await includeInfo.uncheck();
  await noOverflow(page);
  const flexible = await downloadBytes(
    page,
    print.getByRole("button", { name: "Download A4 PDF", exact: true }),
  );
  expect(flexible.name).toBe("Bestiary-flexible-A4.pdf");
  expect((await PDFDocument.load(flexible.bytes)).getPageCount()).toBe(1);
  await print.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Include GM Info" }),
  ).not.toBeChecked();
  await page
    .getByRole("button", { name: "Print A4 table cards", exact: true })
    .click();
  await expect(
    print.getByLabel("Cards per A4 page", { exact: true }),
  ).toHaveValue("flexible");
  await expect(includeInfo).not.toBeChecked();
});
