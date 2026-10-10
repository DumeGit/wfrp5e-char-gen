import {
  test,
  expect,
  openGM,
  gmStep,
  applyProfile,
  noOverflow,
  search,
} from "./helpers.mjs";

test("Tavern staff use shared foundation filters and display usable printed defence and attacks @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await expect(
    page.locator("label:has(#gm-book-taverns-old-world)"),
  ).toContainText("12 profiles · 0 templates");
  await page.locator("#gm-book-taverns-old-world").check();
  await page.locator("#gm-profile-book").selectOption("taverns-old-world");
  await expect(page.locator(".gm-profile-card")).toHaveCount(12);
  await applyProfile(page, "Quality Doorman");
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  await gmStep(page, "Equipment & magic");
  await expect(page.locator("#creator-main")).toContainText("Leather Jerkin");
  await expect(page.locator("#creator-main")).toContainText("Sword");
  await noOverflow(page);
  await search(page, "Tavern booths and privacy");
  await expect(page.getByRole("dialog")).toContainText(
    "Tavern booths and privacy",
  );
  await noOverflow(page);
});
