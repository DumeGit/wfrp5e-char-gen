import {
  test,
  expect,
  openGM,
  gmStep,
  applyProfile,
  noOverflow,
} from "./helpers.mjs";

test("Corsairs book filters and Chief Mate optional Talents work on desktop and phone @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await expect(
    page.locator("label:has(#gm-book-corsairs-flariel)"),
  ).toContainText("1 profiles · 5 templates");
  await page.locator("#gm-book-corsairs-flariel").check();
  await page.locator("#gm-profile-book").selectOption("corsairs-flariel");
  await applyProfile(page, "Dark Elf");
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  await gmStep(page, "Customise");
  await page
    .getByRole("button", { name: "Choose template", exact: true })
    .click();
  await page.locator("#gm-template-book").selectOption("corsairs-flariel");
  await page
    .getByRole("dialog")
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Chief Mate", { exact: true }) })
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  const preview = page.getByRole("dialog", { name: "Chief Mate", exact: true });
  await expect(preview).toContainText("Optional");
  await preview
    .getByRole("button", { name: "Apply template", exact: true })
    .click();
  const choice = page.locator("#template-talent-0");
  await expect(choice).toHaveValue("");
  await choice.selectOption("Dual Wielder");
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  await expect(
    page.locator("#creator-main .gm-entry").filter({ hasText: "Dual Wielder" }),
  ).toHaveCount(1);
  await choice.selectOption("");
  await expect(
    page.locator("#creator-main .gm-entry").filter({ hasText: "Dual Wielder" }),
  ).toHaveCount(0);
  await noOverflow(page);
});
