import { test, expect, openPC, pcStep, noOverflow } from "./helpers.mjs";

test("Species Skill names and row space toggle once while specialisations stay independent @pc @interface @mobile", async ({
  page,
}, info) => {
  await openPC(page, { species: "Dwarf" });
  await pcStep(page, "Skills");
  const row = page.locator(".species-skill-option").first();
  const checkbox = row.getByRole("checkbox");
  await expect(checkbox).not.toBeChecked();
  await row.click({ position: { x: 18, y: 27 } });
  await expect(checkbox).toBeChecked();
  const box = await row.boundingBox();
  await row.click({ position: { x: box.width - 72, y: 8 } });
  await expect(checkbox).not.toBeChecked();
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await checkbox.press("Space");
  await expect(checkbox).not.toBeChecked();

  const specialisation = page.locator(".species-skill-info select");
  const choiceRow = page
    .locator(".species-skill-option")
    .filter({ has: specialisation });
  await specialisation.click();
  await page.keyboard.press("Escape");
  await expect(choiceRow.getByRole("checkbox")).not.toBeChecked();
  await specialisation.selectOption({ label: "Trade (Brewer)" });
  await expect(specialisation).toHaveValue("Trade (Brewer)");
  await expect(choiceRow.getByRole("checkbox")).not.toBeChecked();
  await noOverflow(page);
  await row.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath("species-skills.png") });
});
