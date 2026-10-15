import { openGMBooks } from "./helpers.mjs";
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
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Use selected books", exact: true })
    .click();
  await page.getByLabel("Species", { exact: true }).selectOption("Human");
  await page.getByRole("button", { name: "Apply change", exact: true }).click();
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
  await page
    .getByRole("option", { name: /^Cloak of Mathlann/ })
    .filter({ hasText: "Mathlann prayer" })
    .click();
  const reader = page.getByRole("region", {
    name: "Cloak of Mathlann — Mathlann prayer",
    exact: true,
  });
  await expect(reader).toContainText("Elven Priests");
  await expect(reader).toContainText("Black Arks");
  await expect(reader).not.toContainText("Storm Weavers");
  await noOverflow(page);
});

test("GM reuses Lustria equipment without requiring foundation-book selection @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await openGMBooks(page);
  await expect(page.locator("label:has(#gm-book-lustria)")).toContainText(
    "55 profiles · 15 templates",
  );
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

test("Lustria Skink castes and stacking marks are usable on desktop and phone @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await openGMBooks(page);
  await page.locator("#gm-book-lustria").check();
  await page.locator("#gm-profile-book").selectOption("lustria");
  await applyProfile(page, "Skink");
  await gmStep(page, "Customise");
  await page
    .getByRole("button", { name: "Choose template", exact: true })
    .click();
  await page.locator("#gm-template-book").selectOption("lustria");
  await expect(page.locator("#gm-template-results .gm-picker-row")).toHaveCount(
    6,
  );
  await page
    .getByRole("dialog")
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Industrial caste", { exact: true }) })
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply template", exact: true })
    .click();
  await page
    .getByText("Sacred marks · optional, combine as needed", { exact: true })
    .click();
  await page.locator('[data-sacred-mark="lustria:template:quetzl"]').check();
  await page.locator('[data-sacred-mark="lustria:template:chotec"]').check();
  await expect(page.locator(".gm-template-bar")).toContainText(
    "Industrial caste · Chotec · Quetzl",
  );
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  await page.locator('[data-sacred-mark="lustria:template:quetzl"]').uncheck();
  await expect(page.locator(".gm-template-bar")).not.toContainText("Quetzl");
  await noOverflow(page);
});

test("Slann Lore choices are required early and unlock their restricted spells @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await openGMBooks(page);
  await page.locator("#gm-book-lustria").check();
  await applyProfile(page, "Slann Of The Fifth Generation");
  await expect(page.locator(".gm-issues")).toContainText(
    "Choose at least one Colour Lore",
  );
  await gmStep(page, "Customise");
  await page.locator('[data-profile-lore="Heavens"]').check();
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  await gmStep(page, "Equipment & magic");
  await page.getByRole("button", { name: "Choose magic", exact: true }).click();
  await page.locator("#gm-picker-search").fill("Earth Line");
  await expect(page.getByRole("dialog")).toContainText("Slann only");
  await noOverflow(page);
});
