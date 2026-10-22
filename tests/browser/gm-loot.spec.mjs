import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
  downloadBytes,
  fileUpload,
} from "./helpers.mjs";

async function dice(page) {
  await page.addInitScript(() => {
    const original = crypto.getRandomValues.bind(crypto);
    window.lootTestFaces = [];
    crypto.getRandomValues = (array) => {
      if (
        array instanceof Uint32Array &&
        array.length === 1 &&
        window.lootTestFaces.length
      ) {
        array[0] = window.lootTestFaces.shift() - 1;
        return array;
      }
      return original(array);
    };
  });
}
const seed = (page, faces) =>
  page.evaluate((values) => {
    window.lootTestFaces = values;
  }, faces);
const lootDialog = (page) =>
  page.getByRole("dialog", { name: "Roll loot", exact: true });

test("loot previews 00 rerolls, adds unequipped possessions, survives history and saved drafts @gm @mobile @storage", async ({
  page,
}, info) => {
  await dice(page);
  await openGM(page);
  await applyProfile(page, "Wolf");
  await gmStep(page, "Equipment & magic");
  const attacks = await page.locator(".gm-attack-row").allTextContents();
  const defence = await page.locator(".gm-defence-summary").textContent();
  await page.getByRole("button", { name: "Roll loot", exact: true }).click();
  const dialog = lootDialog(page);
  await expect(dialog.getByLabel("Loot location", { exact: true })).toHaveValue(
    "lair",
  );
  await expect(
    dialog.getByRole("button", { name: "Add loot", exact: true }),
  ).toBeDisabled();
  await seed(page, [100, 100, 39, 49, 2]);
  await dialog.getByRole("button", { name: "Roll loot", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("1 gold crown");
  await expect(dialog.getByRole("status")).toContainText("2 × Bandage");
  await expect(page.locator(".gm-loot-entry")).toHaveCount(0);
  await dialog.getByText("Roll details · 5", { exact: true }).click();
  await expect(dialog.locator(".gm-roll-list li")).toHaveCount(5);
  await noOverflow(page);
  await dialog.screenshot({ path: info.outputPath("loot-preview.png") });
  await dialog.getByRole("button", { name: "Add loot", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".gm-loot-entry")).toHaveCount(2);
  expect(await page.locator(".gm-attack-row").allTextContents()).toEqual(
    attacks,
  );
  expect(await page.locator(".gm-defence-summary").textContent()).toBe(defence);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".gm-loot-entry")).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.locator(".gm-loot-entry")).toHaveCount(2);
  const bandage = page.locator(".gm-loot-entry").filter({ hasText: "Bandage" });
  await bandage.getByRole("spinbutton").fill("4");
  await bandage.locator("summary").click();
  await bandage
    .getByLabel("Bandage loot location", { exact: true })
    .selectOption("carried");
  await expect(bandage.locator("summary")).toContainText("Carried loot");
  const download = await downloadBytes(
    page,
    page.getByRole("button", { name: "Save NPC / creature", exact: true }),
  );
  const saved = JSON.parse(download.bytes);
  expect(saved.gear).toEqual([]);
  expect(saved.loot.map((r) => [r.location, r.quantity])).toEqual([
    ["lair", 1],
    ["carried", 4],
  ]);
  expect(
    saved.rolls.filter((r) => r.source?.kind === "app").map((r) => r.faces),
  ).toEqual([[100], [100], [39], [49], [2]]);
  await bandage
    .getByRole("button", { name: "Remove Bandage loot", exact: true })
    .click();
  await expect(page.locator(".gm-loot-entry")).toHaveCount(1);
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load draft", exact: true }),
    saved,
    "loot.json",
  );
  await page
    .getByRole("dialog", { name: "Load this GM draft?", exact: true })
    .getByRole("button", { name: "Load draft", exact: true })
    .click();
  await gmStep(page, "Equipment & magic");
  await expect(page.locator(".gm-loot-entry")).toHaveCount(2);
  await expect(bandage.getByRole("spinbutton")).toHaveValue("4");
  await page.locator("#gm-loot").scrollIntoViewIfNeeded();
  await noOverflow(page);
  await page
    .locator("#gm-loot")
    .screenshot({ path: info.outputPath("loot-added.png") });
  await gmStep(page, "Review & export");
  const block = page.locator(".gm-stat-block").first();
  await expect(block).toContainText("Lair loot: 1 gold crown");
  await expect(block).toContainText("Carried loot: 4 × Bandage");
});

test("three loot rolls preview bundles; cancel keeps dice without items and the table fits narrow screens @gm @mobile", async ({
  page,
}, info) => {
  await dice(page);
  await openGM(page);
  if (page.viewportSize().width < 540)
    await page.setViewportSize({ width: 320, height: 844 });
  await applyProfile(page, "Human");
  await gmStep(page, "Equipment & magic");
  const opener = page.getByRole("button", { name: "Roll loot", exact: true });
  await opener.click();
  const dialog = lootDialog(page);
  await expect(dialog.getByLabel("Loot location", { exact: true })).toHaveValue(
    "carried",
  );
  await dialog.getByLabel("Number of rolls", { exact: true }).selectOption("3");
  await seed(page, [41, 7, 98, 99, 3]);
  await dialog.getByRole("button", { name: "Roll loot", exact: true }).click();
  await expect(dialog.locator(".gm-loot-preview li")).toHaveCount(7);
  await expect(dialog.getByRole("status")).toContainText("7 brass pennies");
  await expect(dialog.getByRole("status")).toContainText("3 × Rations, 1 day");
  await expect(page.locator(".gm-loot-entry")).toHaveCount(0);
  await dialog.getByText("View d100 loot table", { exact: true }).click();
  await expect(dialog.locator("tbody tr")).toHaveCount(26);
  await noOverflow(page);
  await dialog.screenshot({ path: info.outputPath("loot-table.png") });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.locator(".gm-loot-entry")).toHaveCount(0);
  const saved = JSON.parse(
    (
      await downloadBytes(
        page,
        page.getByRole("button", { name: "Save NPC / creature", exact: true }),
      )
    ).bytes,
  );
  expect(saved.loot).toEqual([]);
  expect(saved.rolls.filter((r) => r.source?.kind === "app")).toHaveLength(5);
  await opener.click();
  await seed(page, [94]);
  await dialog.getByRole("button", { name: "Roll loot", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Signet Ring");
  await seed(page, [96]);
  await dialog.getByRole("button", { name: "Reroll", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("Jewellery");
  await expect(dialog.getByRole("status")).not.toContainText("Signet Ring");
  await dialog.getByRole("button", { name: "Add loot", exact: true }).click();
  await expect(page.locator(".gm-loot-entry")).toHaveCount(1);
  await expect(page.locator(".gm-loot-entry")).toContainText("Jewellery");
  await noOverflow(page);
});
