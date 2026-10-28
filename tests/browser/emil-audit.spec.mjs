import { test, expect, noOverflow } from "./helpers.mjs";

for (const route of ["/", "/bestiary/", "/marijan/", "/manager/"]) {
  test(`${route} workspace chooser closes on keyboard departure @interface @mobile`, async ({
    page,
  }, info) => {
    await page.goto(`${route}?verify=1`);
    await expect(page.locator("#creator-main h1")).toBeVisible();
    if (info.project.name === "mobile")
      await page
        .getByRole("button", { name: /Open (creator|manager) menu/ })
        .click();
    const switcher = page.locator(".workspace-switcher:visible");
    const summary = switcher.locator(":scope > summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(switcher).toHaveAttribute("open", "");
    await page.keyboard.press("Tab");
    await expect(switcher.getByRole("link").first()).toBeFocused();
    await expect(switcher).toHaveAttribute("open", "");
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    await expect(switcher).not.toHaveAttribute("open", "");
    expect(
      await switcher.evaluate((node) => node.contains(document.activeElement)),
    ).toBe(false);
    await summary.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await expect(summary).toBeFocused();
    await expect(switcher).not.toHaveAttribute("open", "");
    await noOverflow(page);
  });
}

test("empty manager offers import and creation in context @interface @manager @mobile", async ({
  page,
}, info) => {
  await page.goto("/manager/?verify=1");
  const empty = page.locator(".manager-empty");
  const importButton = empty.getByRole("button", {
    name: "Import character",
    exact: true,
  });
  await expect(importButton).toBeVisible();
  await importButton.click();
  await expect(
    page.getByRole("dialog", { name: "Import characters", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(importButton).toBeFocused();
  await page.screenshot({ path: info.outputPath("manager-empty-actions.png") });
  const createButton = empty.getByRole("button", {
    name: "New blank character",
    exact: true,
  });
  await expect(createButton).toBeVisible();
  await createButton.click();
  await expect(page.locator("#manager-character-name")).toHaveText(
    "Unnamed character",
  );
  await expect(empty).toBeHidden();
  await page.reload();
  await expect(page.locator("#manager-character-name")).toHaveText(
    "Unnamed character",
  );
  await noOverflow(page);
});

test("reference close restores its editor opener without a scroll jump @interface @search @mobile", async ({
  page,
}) => {
  await page.goto("/marijan/?verify=1");
  await page
    .getByRole("combobox", { name: "Career", exact: true })
    .selectOption({ label: "Soldier · Core" });
  const source = page.getByRole("button", {
    name: "Read Career",
    exact: true,
  });
  await source.scrollIntoViewIfNeeded();
  await source.focus();
  const scroll = await page.evaluate(() => scrollY);
  await source.press("Enter");
  await expect(page.locator(".book-search-panel")).toBeVisible();
  await expect(page.locator("#book-search-dialog")).toContainText("Soldier");
  await page.keyboard.press("Escape");
  await expect(source).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  const launcher = page.getByRole("button", {
    name: "Search rules and book references",
    exact: true,
  });
  await launcher.click();
  await page.getByRole("button", { name: "Close search", exact: true }).click();
  await expect(launcher).toBeFocused();
});

test("selected workspace destination remains distinct on hover @interface", async ({
  page,
}, info) => {
  test.skip(info.project.name === "mobile", "Desktop hover interaction");
  await page.goto("/bestiary/?verify=1");
  const selected = page.locator(
    ".workspace-local-navigation button[aria-current]",
  );
  await expect(selected).toBeVisible();
  const background = await selected.evaluate(
    (node) => getComputedStyle(node).backgroundImage,
  );
  await selected.hover();
  await expect(selected).toHaveCSS("background-image", background);
  await expect(selected).toHaveAttribute("aria-current", "step");
});
