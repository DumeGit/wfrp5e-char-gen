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
test("one click adds 00 loot results immediately without a dialog, with history and saved drafts @gm @mobile @storage", async ({
  page,
}, info) => {
  await dice(page);
  await openGM(page);
  if (page.viewportSize().width < 540)
    await page.setViewportSize({ width: 320, height: 844 });
  await applyProfile(page, "Wolf");
  await gmStep(page, "Equipment & magic");
  const attacks = await page.locator(".gm-attack-row").allTextContents();
  const defence = await page.locator(".gm-defence-summary").textContent();
  await seed(page, [100, 100, 39, 49, 2]);
  await page.getByRole("button", { name: "Roll loot", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".gm-loot-entry")).toHaveCount(2);
  const loot = page.locator("#gm-loot");
  await expect(loot.locator("select")).toHaveCount(0);
  await expect(loot).not.toContainText(/Carried loot|Lair loot|preview/i);
  await expect(
    page.getByRole("button", { name: "Add loot", exact: true }),
  ).toHaveCount(0);
  await expect(
    loot.getByRole("spinbutton", {
      name: "gold crown loot quantity",
      exact: true,
    }),
  ).toHaveValue("1");
  await expect(
    loot.getByRole("spinbutton", {
      name: "Bandage loot quantity",
      exact: true,
    }),
  ).toHaveValue("2");
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
  const saved = JSON.parse(
    (
      await downloadBytes(
        page,
        page.getByRole("button", { name: "Save NPC / creature", exact: true }),
      )
    ).bytes,
  );
  expect(saved.gear).toEqual([]);
  expect(saved.loot.map((row) => row.quantity)).toEqual([1, 4]);
  expect(saved.loot.every((row) => !Object.hasOwn(row, "location"))).toBe(true);
  expect(
    saved.rolls
      .filter((row) => row.source?.kind === "app")
      .map((row) => row.faces),
  ).toEqual([[100], [100], [39], [49], [2]]);
  await bandage
    .getByRole("button", { name: "Remove Bandage loot", exact: true })
    .click();
  await expect(page.locator(".gm-loot-entry")).toHaveCount(1);
  // Existing saves retain their loot when the retired location field is removed.
  saved.loot.forEach((row, index) => {
    row.location = index % 2 ? "lair" : "carried";
  });
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load draft", exact: true }),
    saved,
    "old-loot.json",
  );
  await page
    .getByRole("dialog", { name: "Load this GM draft?", exact: true })
    .getByRole("button", { name: "Load draft", exact: true })
    .click();
  await gmStep(page, "Equipment & magic");
  await expect(page.locator(".gm-loot-entry")).toHaveCount(2);
  await expect(bandage.getByRole("spinbutton")).toHaveValue("4");
  await loot.scrollIntoViewIfNeeded();
  await noOverflow(page);
  await loot.screenshot({ path: info.outputPath("loot-direct.png") });
  await gmStep(page, "Review & export");
  const block = page.locator(".gm-stat-block").first();
  await expect(block).toContainText("Loot: 1 gold crown");
  await expect(block).toContainText("Loot: 4 \u00d7 Bandage");
  await expect(block).not.toContainText(/Carried loot|Lair loot/);
});

test("successive loot clicks and keyboard activation add bundles and merge quantities inline @gm @mobile", async ({
  page,
}, info) => {
  await dice(page);
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Equipment & magic");
  const roll = page.getByRole("button", { name: "Roll loot", exact: true });
  await seed(page, [98]);
  await roll.click();
  await expect(page.locator(".gm-loot-entry")).toHaveCount(2);
  await seed(page, [99, 3]);
  await roll.click();
  await expect(page.locator(".gm-loot-entry")).toHaveCount(5);
  await expect(
    page.getByRole("spinbutton", {
      name: "Rations, 1 day loot quantity",
      exact: true,
    }),
  ).toHaveValue("3");
  await seed(page, [96]);
  await roll.focus();
  await page.keyboard.press("Space");
  await expect(page.locator(".gm-loot-entry")).toHaveCount(6);
  await seed(page, [96]);
  await roll.click();
  await expect(page.locator(".gm-loot-entry")).toHaveCount(6);
  await expect(
    page.getByRole("spinbutton", {
      name: "Jewellery loot quantity",
      exact: true,
    }),
  ).toHaveValue("2");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByText("View d100 loot table", { exact: true }).click();
  await expect(page.locator("#gm-loot tbody tr")).toHaveCount(26);
  await noOverflow(page);
  await page
    .locator("#gm-loot")
    .screenshot({ path: info.outputPath("loot-inline-table.png") });
});
