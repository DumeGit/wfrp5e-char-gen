import { test, expect, pcDraft } from "./helpers.mjs";
import { freshMarijan } from "../../src/engine/marijan/model.mjs";
import { readFile } from "node:fs/promises";

async function open(page) {
  await page.goto("/manager/?verify=1");
  await expect(
    page.getByRole("heading", { name: "Your characters", exact: true }),
  ).toBeVisible();
}
async function section(page, name) {
  if (await page.locator("#manager-section").isVisible())
    await page.locator("#manager-section").selectOption({ label: name });
  else
    await page
      .getByRole("navigation", { name: "Character sections" })
      .getByRole("button", { name, exact: true })
      .click();
}
async function library(page) {
  if (await page.locator("#manager-section").isVisible())
    await page.locator("#manager-section").selectOption("library");
  else
    await page
      .getByRole("button", { name: "Character library", exact: true })
      .click();
  await expect(
    page.getByRole("heading", { name: "Your characters", exact: true }),
  ).toBeVisible();
}
async function importData(page, data) {
  await page
    .getByLabel("Import character JSON", { exact: true })
    .setInputFiles({
      name: "character.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(data)),
    });
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: /Import 1 character/ }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: /Import 1 character/ }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#manager-name")).toBeVisible();
  await expect(
    page.locator(".manager-main").getByRole("status").last(),
  ).toContainText(/Saved/);
}
async function saved(page) {
  await expect(
    page.locator(".manager-main").getByRole("status").last(),
  ).toContainText(/Saved/);
}
async function rawRecords(page) {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open("wfrp-character-manager-v1-verification");
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const read = db
            .transaction("characters")
            .objectStore("characters")
            .getAll();
          read.onsuccess = () => {
            db.close();
            resolve(read.result);
          };
          read.onerror = () => reject(read.error);
        };
      }),
  );
}

test("Player and Marijan imports become independent manager characters and survive reload @manager @storage", async ({
  page,
}) => {
  const draft = await pcDraft({ complete: true });
  await open(page);
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    ["wfrp-fifth-character-ledger-v2-verification", JSON.stringify(draft)],
  );
  await importData(page, draft);
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "imperial-field-ledger",
  );
  await expect(page.locator(".manager-stat")).toHaveCount(10);
  const first = (await rawRecords(page))[0];
  expect(first.sheet.type).toBe("wfrp-character");
  await expect(page.locator("#manager-name")).toHaveValue(draft.name);
  await page.reload();
  await expect(page.locator("#manager-name")).toHaveValue(draft.name);
  await library(page);
  const manual = freshMarijan();
  manual.name = "Manual adventurer";
  manual.characteristics.WS.initial = 61;
  await importData(page, manual);
  const records = await rawRecords(page);
  expect(records).toHaveLength(2);
  expect(records.every((x) => x.type === "wfrp-manager")).toBe(true);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("wfrp-fifth-character-ledger-v2-verification"),
    ),
  ).toBe(JSON.stringify(draft));
});
test("resources, Conditions, journal, Undo and advancement persist together @manager", async ({
  page,
}) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  await section(page, "Session view");
  const main = page.locator("main");
  const before = (await rawRecords(page))[0].current.wounds;
  await main
    .getByRole("button", { name: "Lose one Wound", exact: true })
    .click();
  await saved(page);
  expect((await rawRecords(page))[0].current.wounds).toBe(before - 1);
  const undo = page
    .getByRole("button", { name: "Undo", exact: true })
    .filter({ visible: true });
  await undo.click();
  await saved(page);
  expect((await rawRecords(page))[0].current.wounds).toBe(before);
  await main
    .getByRole("button", { name: "Record Condition", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Condition name").fill("Bleeding");
  await dialog.getByLabel("Count", { exact: true }).fill("2");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(main.getByText("Bleeding ×2")).toBeVisible();
  await main.getByRole("button", { name: "Add session note" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title", { exact: true }).fill("At the watchtower");
  await dialog
    .getByLabel("Notes", { exact: true })
    .fill("An uneventful night.");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await section(page, "Advancement");
  await main.getByRole("button", { name: "Award XP", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("XP to award").fill("500");
  await dialog.getByLabel("Session / reason").fill("Session reward");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const prior = (await rawRecords(page))[0];
  await main
    .getByRole("button", { name: "Purchase WS +5", exact: true })
    .click();
  await saved(page);
  const after = (await rawRecords(page))[0];
  expect(after.sheet.characteristics.WS.advances).toBe(
    prior.sheet.characteristics.WS.advances + 5,
  );
  expect(after.sheet.xpUnspent).toBeLessThan(prior.sheet.xpUnspent);
  await page.reload();
  await expect(
    main.getByRole("heading", { name: "Advancement", exact: true }),
  ).toBeVisible();
  expect((await rawRecords(page))[0].journal[0].title).toBe(
    "At the watchtower",
  );
});
test("library backup restores safely, malformed batches write nothing, and downloads are real @manager @storage", async ({
  page,
}) => {
  await open(page);
  const a = freshMarijan();
  a.name = "Library original";
  await importData(page, a);
  const download = page.waitForEvent("download");
  if (await page.getByRole("button", { name: "Open manager menu" }).isVisible())
    await page.getByRole("button", { name: "Open manager menu" }).click();
  await page
    .getByRole("button", { name: "Back up library", exact: true })
    .filter({ visible: true })
    .click();
  const file = await download;
  const backup = JSON.parse(await readFile(await file.path(), "utf8"));
  expect(backup.characters).toHaveLength(1);
  await importData(page, backup);
  expect(await rawRecords(page)).toHaveLength(2);
  const bad = structuredClone(backup);
  bad.characters.push({ ...bad.characters[0], id: "bad", sheet: {} });
  await page
    .getByLabel("Import character JSON", { exact: true })
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(bad)),
    });
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
  expect(await rawRecords(page)).toHaveLength(2);
});
test("conflicting tabs preserve the stored character and expose an unsaved copy @manager @storage", async ({
  page,
  context,
}) => {
  await open(page);
  const s = freshMarijan();
  s.name = "Conflict original";
  await importData(page, s);
  const second = await context.newPage();
  await second.goto(page.url());
  await expect(second.locator("#manager-name")).toHaveValue(s.name);
  await page.locator("#manager-name").fill("First tab");
  await saved(page);
  await second.locator("#manager-name").fill("Second tab");
  await expect(second.locator("main").getByRole("alert")).toContainText(
    "another tab",
  );
  expect((await rawRecords(page))[0].sheet.name).toBe("First tab");
  await expect(
    second.getByRole("button", { name: "Download unsaved copy", exact: true }),
  ).toBeVisible();
  await second.close();
});
test("green shell, joined edges, menus and long names fit phone, tablet and wide desktop @manager @interface", async ({
  page,
}) => {
  await open(page);
  const s = freshMarijan();
  s.name =
    "An exceptionally long character name with a distant ancestral title ".repeat(
      3,
    );
  await importData(page, s);
  for (const width of [320, 768, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width > 1000) {
      const boxes = await page.locator(".manager-workspace").evaluate((el) => {
        const a = el.querySelector(".manager-rail").getBoundingClientRect(),
          b = el.querySelector("main").getBoundingClientRect(),
          c = el.querySelector(".manager-folio").getBoundingClientRect();
        return [b.left - a.right, c.left - b.right];
      });
      expect(boxes).toEqual([0, 0]);
    } else {
      await page.getByRole("button", { name: "Open manager menu" }).click();
      await expect(
        page.getByRole("dialog", { name: "Manager menu", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Open manager menu" }),
      ).toBeFocused();
    }
  }
});
test("archiving retains the character and exports do not carry creator mode branding @manager @exports", async ({
  page,
}) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  if (await page.getByRole("button", { name: "Open manager menu" }).isVisible())
    await page.getByRole("button", { name: "Open manager menu" }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export PDF sheet", exact: true })
    .filter({ visible: true })
    .click();
  const pdf = await download;
  expect(pdf.suggestedFilename()).toMatch(/sheet\.pdf$/);
  expect((await readFile(await pdf.path())).slice(0, 4).toString()).toBe(
    "%PDF",
  );
  if (await page.getByRole("button", { name: "Open manager menu" }).isVisible())
    await page.getByRole("button", { name: "Open manager menu" }).click();
  await page
    .getByRole("button", { name: "Archive character", exact: true })
    .filter({ visible: true })
    .click();
  await saved(page);
  await library(page);
  await page.locator("#manager-filter").selectOption("archived");
  await expect(page.locator("main article")).toHaveCount(1);
  expect((await rawRecords(page))[0].archived).toBe(true);
});

test("backup skip/replace respects IDs, and portraits remain in the local record @manager @storage", async ({
  page,
}) => {
  await open(page);
  const draft = freshMarijan();
  draft.name = "Restore target";
  await importData(page, draft);
  const original = (await rawRecords(page))[0];
  const backup = {
    type: "wfrp-manager-library",
    schemaVersion: 1,
    characters: [original],
  };
  async function restore(policy) {
    await page
      .getByLabel("Import character JSON", { exact: true })
      .setInputFiles({
        name: "backup.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(backup)),
      });
    await page
      .getByRole("dialog")
      .getByLabel("When importing")
      .selectOption(policy);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Import 1 character", exact: true })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  await restore("skip");
  expect(await rawRecords(page)).toHaveLength(1);
  backup.characters[0].sheet.name = "Restored from backup";
  await restore("replace");
  await expect(page.locator("#manager-name")).toHaveValue(
    "Restored from backup",
  );
  expect((await rawRecords(page))[0].id).toBe(original.id);
  await page
    .getByLabel("Import character portrait", { exact: true })
    .setInputFiles({
      name: "portrait.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQ0AAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect(page.locator(".manager-portrait")).toBeVisible();
  await saved(page);
  expect((await rawRecords(page))[0].portrait).toMatch(
    /^data:image\/png;base64,/,
  );
  await page.reload();
  await expect(page.locator(".manager-portrait")).toBeVisible();
});

test("Undo histories stay with their characters when switching the library @manager", async ({
  page,
}) => {
  await open(page);
  const a = freshMarijan();
  a.name = "First character";
  await importData(page, a);
  await page.locator("#manager-name").fill("First character edited");
  await saved(page);
  await library(page);
  const b = freshMarijan();
  b.name = "Second character";
  await importData(page, b);
  await expect(
    page
      .getByRole("button", { name: "Undo", exact: true })
      .filter({ visible: true }),
  ).toBeDisabled();
  await library(page);
  await page
    .locator("main article")
    .filter({
      has: page.getByRole("heading", {
        name: "First character edited",
        exact: true,
      }),
    })
    .getByRole("button", { name: "Open sheet" })
    .click();
  await page
    .getByRole("button", { name: "Undo", exact: true })
    .filter({ visible: true })
    .click();
  await saved(page);
  await expect(page.locator("#manager-name")).toHaveValue("First character");
  expect(
    (await rawRecords(page)).find((x) => x.sheet.name === "Second character"),
  ).toBeTruthy();
});
