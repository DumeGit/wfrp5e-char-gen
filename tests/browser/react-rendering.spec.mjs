import {
  test,
  expect,
  openPC,
  pcDraft,
  pcStep,
  PC_STORAGE,
} from "./helpers.mjs";

test("rolled Characteristics and Career comparisons keep rows inside tables @rendering @pc", async ({
  page,
}) => {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  const draft = await pcDraft({ complete: true });
  draft.career = "";
  await page.addInitScript(
    ({ key, draft }) => {
      localStorage.setItem(key, JSON.stringify(draft));
    },
    { key: PC_STORAGE, draft },
  );
  await openPC(page);
  await pcStep(page, "Characteristics");
  await page
    .getByRole("button", { name: "Roll 10 × 2d10", exact: true })
    .click();
  await expect(page.locator("main table > tbody > tr.career-none")).toHaveCount(
    10,
  );
  await expect(page.locator("main > tr")).toHaveCount(0);

  await pcStep(page, "Career");
  await page.locator("#career-search").fill("Soldier");
  await page.locator('.career-result[data-id="soldier"]').click();
  await page
    .getByRole("button", { name: "Choose Soldier", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator("table > tbody > tr").first()).toBeVisible();
  await expect(dialog.locator(".table-wrap > tr")).toHaveCount(0);
  await dialog
    .getByRole("button", { name: "Apply change", exact: true })
    .click();
  expect(consoleErrors).toEqual([]);
});

test("XP history keeps rows inside tables @rendering @pc", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await openPC(page, { complete: true });
  await pcStep(page, "Experience");
  await page
    .locator(".xp-characteristic-row")
    .filter({ has: page.getByText("Weapon Skill", { exact: true }) })
    .getByRole("button", { name: /^[0-9]+ XP$/ })
    .click();
  await expect(page.locator(".ledger-section table > tbody > tr")).toHaveCount(
    1,
  );
  await expect(
    page.locator(".ledger-section table > tbody > tr > td"),
  ).toHaveCount(4);
  await expect(page.locator(".table-wrap > tr")).toHaveCount(0);
  await pcStep(page, "Review & export");
  await expect(
    page.locator(
      '[data-detail-key="review-sheet:stat-breakdown"] table > tbody > tr',
    ),
  ).toHaveCount(10);
  expect(consoleErrors).toEqual([]);
});

test("creator navigation updates themes without React console errors @rendering", async ({
  page,
}) => {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await openPC(page);
  for (const [name, theme, mode] of [
    ["NPC & creature", "moonlit-vellum", "gm"],
    ["Marijan Mode", "ash-vellum", "marijan"],
    ["Player character", "black-banner", "player"],
    ["NPC & creature", "moonlit-vellum", "gm"],
  ]) {
    const link = page.getByRole("link", { name, exact: true });
    if (!(await link.isVisible()))
      await page
        .getByRole("button", { name: "Open creator menu", exact: true })
        .click();
    await link.click();
    await expect(page.locator("html")).toHaveAttribute("data-mode", mode);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator(".rail")).toBeVisible();
  }
  expect(consoleErrors).toEqual([]);
});

test.describe("initial creator palette before hydration", () => {
  test.use({ javaScriptEnabled: false });
  for (const [route, theme, world] of [
    ["/", "black-banner", "#201a16"],
    ["/bestiary/", "moonlit-vellum", "#101b2c"],
    ["/marijan/", "ash-vellum", "#151517"],
  ]) {
    test(`${theme} paints without JavaScript @rendering`, async ({ page }) => {
      await page.goto(route);
      await expect(
        page.locator(`body > [data-theme="${theme}"]`),
      ).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(() =>
            getComputedStyle(document.documentElement)
              .getPropertyValue("--color-world")
              .trim(),
          ),
        )
        .toBe(world);
    });
  }
});
