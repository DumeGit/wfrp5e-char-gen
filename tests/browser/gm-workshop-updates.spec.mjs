import {
  test,
  expect,
  openGM,
  openGMBooks,
  openProfileFilters,
  applyProfile,
  gmStep,
  noOverflow,
} from "./helpers.mjs";

test("Zoo category, GM Notes, mutation output and attack Condition rules @gm @mobile", async ({
  page,
}, info) => {
  await openGM(page);
  await openGMBooks(page);
  await page.getByRole("checkbox", { name: /^The Imperial Zoo/ }).check();
  await openProfileFilters(page);
  await page
    .getByLabel("Category", { exact: true })
    .selectOption("The Imperial Zoo");
  await expect(page.locator(".gm-profile-card")).toHaveCount(43);
  await applyProfile(page, "Dread Maw");

  const briefing = page.getByLabel("GM Notes", { exact: true });
  await page.getByLabel("Name", { exact: true }).fill("Marsh Dread Maw");
  await briefing.fill("Ambush beneath the causeway.");
  await briefing.scrollIntoViewIfNeeded();
  await noOverflow(page);
  await page
    .locator(".gm-identity-fields")
    .screenshot({ path: info.outputPath("gm-notes.png") });

  await gmStep(page, "Customise");
  await page.getByRole("tab", { name: "Traits", exact: true }).click();
  await page
    .getByRole("button", { name: "Roll Physical", exact: true })
    .click();
  const mutation = page.locator("#gm-mutations .gm-ability-entry");
  await expect(mutation).toHaveCount(1);
  const toggle = mutation.getByRole("switch");
  await expect(toggle).toBeChecked();
  const mutationName = (await toggle.getAttribute("aria-label")).replace(
    / description$/,
    "",
  );
  await toggle.uncheck();

  await gmStep(page, "Equipment & magic");
  const attack = page
    .locator(".gm-attack-row")
    .filter({ hasText: "Breath (Slime)" });
  await attack.getByRole("button", { name: "Read Prone", exact: true }).click();
  const reader = page.getByRole("dialog", {
    name: "Search the books",
    exact: true,
  });
  await expect(reader).toContainText("standing removes Prone");
  await reader.getByRole("button", { name: "Close search" }).click();
  await expect(
    attack.getByRole("button", { name: "Read Prone", exact: true }),
  ).toBeFocused();

  await gmStep(page, "Review & export");
  const block = page.locator(".gm-stat-block");
  await expect(block.getByText(mutationName, { exact: true })).toBeVisible();
  await page.getByLabel("GM Info", { exact: true }).fill("Keep this secret.");
  await expect(block).not.toContainText("Ambush beneath the causeway.");
  await page.getByLabel("Include GM Notes").check();
  await expect(block).toContainText("Ambush beneath the causeway.");
  await expect(block).not.toContainText("Keep this secret.");
  await page.getByLabel("Include GM Info").check();
  await expect(block).toContainText("Keep this secret.");
  await page.getByLabel("Include GM Notes").uncheck();
  await expect(block).not.toContainText("Ambush beneath the causeway.");
  await expect(block).toContainText("Keep this secret.");
});
