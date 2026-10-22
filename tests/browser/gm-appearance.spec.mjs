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

test("book-based appearance rolls replace text, undo and require an explicit Elf choice @gm", async ({
  page,
}, info) => {
  await openGM(page);
  await applyProfile(page, "Human");
  const description = page.getByRole("textbox", {
    name: "Short description",
    exact: true,
  });
  await description.fill("A scar across the cheek.");
  await page.getByRole("textbox", { name: "Name", exact: true }).click();
  await page
    .getByRole("button", { name: "Roll appearance", exact: true })
    .click();
  await expect(description).toHaveValue(
    /^\d+ ft \d+ in; .+ eyes; .+ hair\. .+\.$/,
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(description).toHaveValue("A scar across the cheek.");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await page
    .getByRole("button", { name: "Roll appearance", exact: true })
    .click();
  expect((await description.inputValue()).match(/ft /g)).toHaveLength(1);
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("appearance-field.png") });
  const rolledDescription = await description.inputValue();
  await gmStep(page, "Review & export");
  await expect(
    page.locator(".gm-stat-block").filter({ visible: true }).first(),
  ).toContainText(rolledDescription);
  await gmStep(page, "Starting profile");
  await page
    .getByRole("button", { name: "Browse profiles", exact: true })
    .click();
  await applyProfile(page, "High Elf or Wood Elf");
  await page
    .getByRole("button", { name: "Roll appearance", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Choose appearance tables",
    exact: true,
  });
  await expect(
    dialog.getByRole("button", { name: "Roll appearance", exact: true }),
  ).toBeDisabled();
  await dialog
    .getByLabel("Appearance Species", { exact: true })
    .selectOption("Wood Elf");
  await dialog
    .getByRole("button", { name: "Roll appearance", exact: true })
    .click();
  await expect(description).toHaveValue(
    /^\d+ ft \d+ in; .+ eyes; .+ hair\. .+\.$/,
  );
  await page
    .getByRole("button", { name: "Browse profiles", exact: true })
    .click();
  await applyProfile(page, "Dragon");
  await expect(
    page.getByRole("button", { name: "Roll appearance", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Roll appearance", exact: true })
    .click();
  await expect(description).not.toHaveValue("");
  await expect(description).not.toHaveValue(/^\d+ ft \d+ in;/);
  await page.getByText("View feature table", { exact: true }).click();
  await expect(page.locator(".gm-feature-table tbody tr")).toHaveCount(100);
  await expect(page.locator(".gm-feature-table tbody tr").last()).toContainText(
    "00",
  );
  await page.locator(".gm-feature-table thead").scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath("feature-table.png") });
  await noOverflow(page);
});

test("all creatures keep the rolled feature without body checks, and rerolls replace saved text @gm @mobile @storage", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = crypto.getRandomValues.bind(crypto);
    window.featureTestFaces = [];
    crypto.getRandomValues = (array) => {
      if (
        array instanceof Uint32Array &&
        array.length === 1 &&
        window.featureTestFaces.length
      ) {
        array[0] = window.featureTestFaces.shift() - 1;
        return array;
      }
      return original(array);
    };
  });
  await openGM(page);
  if (page.viewportSize().width < 540)
    await page.setViewportSize({ width: 320, height: 844 });
  await applyProfile(page, "Ghost");
  const description = page.getByRole("textbox", {
    name: "Short description",
    exact: true,
  });
  const roll = page.getByRole("button", {
    name: "Roll appearance",
    exact: true,
  });
  await description.fill("Old description.");
  await page.getByRole("textbox", { name: "Name", exact: true }).click();
  await page.evaluate(() => {
    window.featureTestFaces = [48];
  });
  await roll.click();
  await expect(description).toHaveValue("Kink in its tail.");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(description).toHaveValue("Old description.");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(description).toHaveValue("Kink in its tail.");
  await page.evaluate(() => {
    window.featureTestFaces = [100];
  });
  await roll.click();
  await expect(description).toHaveValue("Smells of old incense.");
  const saved = JSON.parse(
    (
      await downloadBytes(
        page,
        page.getByRole("button", { name: "Save NPC / creature", exact: true }),
      )
    ).bytes,
  );
  expect(saved.description).toBe("Smells of old incense.");
  const records = saved.rolls.filter(
    (record) => record.source?.table === "distinguishing-features-v1",
  );
  expect(records.map((record) => record.faces)).toEqual([[48], [100]]);
  expect(
    records.every(
      (record) => record.source.kind === "app" && !record.source.book,
    ),
  ).toBe(true);
  await description.fill("Changed text.");
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load draft", exact: true }),
    saved,
    "feature.json",
  );
  await page
    .getByRole("dialog", { name: "Load this GM draft?", exact: true })
    .getByRole("button", { name: "Load draft", exact: true })
    .click();
  await expect(description).toHaveValue("Smells of old incense.");
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("feature-short-description.png"),
  });
  await gmStep(page, "Review & export");
  await expect(page.locator(".gm-stat-block").first()).toContainText(
    "Smells of old incense.",
  );
});
