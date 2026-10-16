import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
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
  await expect(description).toHaveValue(/^\d+ ft \d+ in; .+ eyes; .+ hair\.$/);
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
  await expect(description).toHaveValue(/^\d+ ft \d+ in; .+ eyes; .+ hair\.$/);
  await page
    .getByRole("button", { name: "Browse profiles", exact: true })
    .click();
  await applyProfile(page, "Dragon");
  await expect(
    page.getByRole("button", { name: "Roll appearance", exact: true }),
  ).toBeDisabled();
  await description.fill("Scarred scales and a broken horn.");
  await noOverflow(page);
});
