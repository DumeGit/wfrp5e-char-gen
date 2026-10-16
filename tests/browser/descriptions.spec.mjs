import { test, expect, openPC, search } from "./helpers.mjs";

test("canonical reference descriptions identify summaries @descriptions", async ({
  page,
}) => {
  await openPC(page);
  await search(page, "Belligerent");
  await page
    .getByRole("option", { name: /^Belligerent Creature Trait/ })
    .click();
  const reader = page.locator("#book-search-dialog");
  await expect(reader).toContainText(
    "Immune to Fear while possessing Momentum.",
  );
  await expect(reader).toContainText(
    "Mechanical summary — consult the cited book for the full rule.",
  );
});

test("Marijan shared descriptions and personal overrides survive reload independently @descriptions", async ({
  page,
}) => {
  await page.goto("/marijan.html?verify=1");
  await page.locator("#mm-find-extras").fill("Belligerent");
  await page
    .locator("#mm-results-extras")
    .getByRole("button", { name: "Add Belligerent", exact: true })
    .click();
  const details = page.getByLabel("Edit Belligerent details", { exact: true });
  await details.click();
  await expect(page.locator(".mm-entry-detail p.small")).toHaveText(
    "Immune to Fear while possessing Momentum.",
  );
  const personal = page.getByLabel("Personal description (optional)", {
    exact: true,
  });
  await expect(personal).toHaveValue("");
  await personal.fill("My personal reminder");
  await personal.blur();
  await page.reload();
  await details.click();
  await expect(personal).toHaveValue("My personal reminder");
  await expect(page.locator(".mm-entry-detail p.small")).toHaveText(
    "Immune to Fear while possessing Momentum.",
  );
  await personal.fill("");
  await personal.blur();
  await page.reload();
  await details.click();
  await expect(personal).toHaveValue("");
});

test("source conflicts remain visible beside a summary but do not match search @descriptions", async ({
  page,
}) => {
  await openPC(page);
  await search(page, "Godspakt");
  await page.getByRole("option", { name: /^Godspakt / }).click();
  const reader = page.locator("#book-search-dialog");
  await expect(reader).toContainText("Source discrepancy:");
  await expect(reader).toContainText("Range Touch and Target 1");
  await reader
    .getByRole("button", { name: "Back to search", exact: true })
    .click();
  await page.locator("#book-search").fill("user selected");
  await expect(page.getByRole("option", { name: /^Godspakt / })).toHaveCount(0);
});
