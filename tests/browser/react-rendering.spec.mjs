import { test, expect, openPC } from "./helpers.mjs";

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
