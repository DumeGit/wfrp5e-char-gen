import {
  test,
  expect,
  openGM,
  openGMBooks,
  openProfileFilters,
  noOverflow,
} from "./helpers.mjs";

test("profile cards show compact identifying details and keep the full preview @gm @mobile", async ({
  page,
}, info) => {
  await openGM(page);
  const cards = page.locator(".gm-profile-card");
  await expect(cards).toHaveCount(49);
  const human = cards.filter({
    has: page.locator("strong").filter({ hasText: /^Human$/ }),
  });
  await expect(human.locator(":scope > strong")).toHaveText("Human");
  await expect(human.locator(".gm-card-size")).toHaveText("Average");
  await expect(human.locator(".gm-card-category")).toHaveText(
    "Peoples & Professions",
  );
  await expect(human.locator("small")).toHaveText("Core · p. 319");
  await expect(human.locator(".gm-card-stats, .legacy-tag")).toHaveCount(0);
  await expect(human).not.toContainText("Preview →");
  for (const width of info.project.name === "mobile"
    ? [320, 390, 600, 768]
    : [1100, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const box = await human.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeLessThanOrEqual(96);
    const columns = await page
      .locator(".gm-profile-grid")
      .evaluate(
        (node) => getComputedStyle(node).gridTemplateColumns.split(" ").length,
      );
    if (width < 600) expect(columns).toBe(1);
    else if (width < 1100) expect(columns).toBe(2);
    else expect(columns).toBeGreaterThanOrEqual(3);
    for (const label of await human
      .locator(":scope > strong, .gm-card-size, .gm-card-meta > *")
      .all()) {
      expect(
        await label.evaluate(
          (node) => node.scrollWidth <= node.clientWidth + 1,
        ),
      ).toBe(true);
    }
    await noOverflow(page);
    if ([390, 768, 1440].includes(width)) {
      await cards.first().scrollIntoViewIfNeeded();
      await page.screenshot({
        path: info.outputPath(`compact-profiles-${width}.png`),
      });
    }
  }
  await page.setViewportSize(
    info.project.name === "mobile"
      ? { width: 390, height: 844 }
      : { width: 1440, height: 900 },
  );
  await page
    .getByRole("textbox", { name: "Find a profile", exact: true })
    .fill("Human");
  await human.focus();
  await page.keyboard.press("Enter");
  const preview = page.getByRole("dialog", { name: "Human", exact: true });
  await expect(preview.locator(".gm-stat-grid")).toContainText("WS");
  await expect(preview.locator(".gm-derived")).toContainText("Wounds");
  await expect(preview).toContainText("Core · p. 319");
  await preview.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(human).toBeFocused();
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toHaveCount(0);
  await human.locator(".gm-card-meta").click();
  await preview
    .getByRole("button", { name: "Use this profile", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toHaveAttribute("placeholder", "Human");
  await expect(page.locator(".gm-foundation")).toContainText("Human");
});

test("Imperial Zoo is a source-specific category and Mount is searchable @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await openProfileFilters(page);
  const category = page.locator("#gm-category");
  await expect(
    category.getByRole("option", { name: "The Imperial Zoo", exact: true }),
  ).toHaveCount(0);
  await openGMBooks(page);
  const zoo = page.locator("#gm-book-imperial-zoo");
  await zoo.check();
  await page.locator("#gm-book-up-in-arms").check();
  await openProfileFilters(page);
  const cards = page.locator(".gm-profile-card");
  await category.selectOption({ label: "The Imperial Zoo" });
  await expect(cards).toHaveCount(43);
  await expect(
    cards
      .locator(".gm-card-category")
      .filter({ hasText: /^The Imperial Zoo$/ }),
  ).toHaveCount(43);
  await category.selectOption({ label: "Beasts" });
  await page
    .getByRole("textbox", { name: "Find a profile", exact: true })
    .fill("Mount");
  await expect(cards.filter({ hasText: "Riding Horse" })).toHaveCount(1);
  await expect(cards.filter({ hasText: "Demigryph Mount" })).toHaveCount(0);
  await category.selectOption({ label: "The Imperial Zoo" });
  await zoo.uncheck();
  await expect(category).toHaveValue("");
  await expect(
    category.getByRole("option", { name: "The Imperial Zoo", exact: true }),
  ).toHaveCount(0);
  await noOverflow(page);
});
