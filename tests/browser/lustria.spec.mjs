import {
  test,
  expect,
  openPC,
  openGM,
  applyProfile,
  pcStep,
  gmStep,
  search,
  noOverflow,
} from "./helpers.mjs";

test("Lustria manual Careers and complete source references work on desktop and phone @pc @search @mobile", async ({
  page,
}) => {
  await openPC(page);
  await page
    .locator("#creator-main")
    .getByRole("button", { name: "Choose books", exact: true })
    .click();
  await page.locator('[data-book="lustria"]').check();
  await page
    .getByRole("button", { name: "Use selected books", exact: true })
    .click();
  await pcStep(page, "Career");
  await page.locator("#career-book").selectOption("lustria");
  await expect(page.locator(".career-result")).toHaveCount(4);
  await page
    .locator('.career-result[data-id="lustria:career:trailblazer"]')
    .click();
  await expect(page.locator(".career-preview")).toContainText("Legacy");
  await page
    .getByRole("button", { name: "Choose Trailblazer", exact: true })
    .click();
  await page.getByRole("button", { name: "Apply change", exact: true }).click();
  await expect(page.locator(".career-preview")).toContainText("Current Career");
  await search(page, "Cloak of Mathlann");
  await page.locator("#book-search-book").selectOption("lustria");
  await page.getByRole("option", { name: /^Cloak of Mathlann/ }).click();
  const reader = page.getByRole("region", {
    name: "Cloak of Mathlann — Mathlann prayer",
    exact: true,
  });
  await expect(reader).toContainText("Elven Priests");
  await expect(reader).toContainText("Black Arks");
  await expect(reader).not.toContainText("Storm Weavers");
  await noOverflow(page);
});

test("GM reuses Lustria equipment without an unfinished foundation-book switch @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await expect(page.locator("#gm-book-lustria")).toHaveCount(0);
  await applyProfile(page, "Human");
  await gmStep(page, "Equipment & magic");
  await page
    .getByRole("button", { name: "Add equipment", exact: true })
    .click();
  await page.locator("#gm-picker-search").fill("Blowpipe");
  await expect(page.getByRole("dialog")).toContainText("Blowpipe");
  await expect(page.getByRole("dialog")).toContainText("Lustria");
  await noOverflow(page);
});
