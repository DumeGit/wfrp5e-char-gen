import {
  test,
  expect,
  openPC,
  openGM,
  pcStep,
  gmStep,
  applyProfile,
  search,
  noOverflow,
  downloadBytes,
} from "./helpers.mjs";

for (const mode of ["Player", "GM", "Marijan"]) {
  test(`${mode} shares compact header, tools menu without a folio @mobile-shell @mobile`, async ({
    page,
  }, info) => {
    if (mode === "Player") await openPC(page, { complete: true });
    else if (mode === "GM") {
      await openGM(page);
      await applyProfile(page, "Human");
    } else {
      await page.goto("/marijan.html?verify=1");
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    }
    const menuButton = page.getByRole("button", {
        name: "Open creator menu",
        exact: true,
      }),
      saveName = mode === "GM" ? "Save NPC / creature" : "Save character",
      save = page.getByRole("button", { name: saveName, exact: true });
    if (info.project.name === "desktop") {
      await expect(menuButton).toBeHidden();
      await expect(page.locator(".rail .creator-switch")).toBeVisible();
      await expect(save).toBeVisible();
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.evaluate(() => document.fonts.ready);
      expect(
        (await page.locator(".masthead").boundingBox()).height,
      ).toBeLessThan(96);
      const rail = page.locator(".rail");
      const bounds = await rail.boundingBox();
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(720);
      for (const nav of await rail.locator("nav").all()) {
        expect(
          await nav.evaluate((el) => ({
            overflow: getComputedStyle(el).overflowY,
            clipped: el.scrollHeight > el.clientHeight + 1,
          })),
        ).toEqual({ overflow: "visible", clipped: false });
      }
      await page.setViewportSize({ width: 900, height: 600 });
      await expect(rail).toHaveCSS("position", "static");
      await noOverflow(page);
      return;
    }
    await expect(menuButton).toBeVisible();
    await expect(save).toBeHidden();
    await expect(page.locator(".sheet")).toHaveCount(0);
    await expect(
      page.locator(".mobile-workspace-bar").getByRole("button", {
        name: /View character|Back to editor|Stat block/,
      }),
    ).toHaveCount(0);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await noOverflow(page);
      const header = await page.locator(".masthead").boundingBox(),
        searchButton = await page
          .locator(".masthead .book-search-launcher")
          .boundingBox();
      expect(header.height).toBeLessThan(90);
      expect(searchButton.y).toBeGreaterThanOrEqual(header.y);
      expect(searchButton.y + searchButton.height).toBeLessThanOrEqual(
        header.y + header.height,
      );
    }
    await page.screenshot({
      path: info.outputPath(`${mode.toLowerCase()}-compact-header.png`),
    });
    await menuButton.click();
    const menu = page.getByRole("dialog", {
      name: "Creator menu",
      exact: true,
    });
    await expect(
      menu.getByRole("link", { name: "Player character" }),
    ).toHaveAttribute("href", "/?verify=1");
    await expect(
      menu.getByRole("link", { name: "NPC & creature" }),
    ).toHaveAttribute("href", "/bestiary/?verify=1");
    await expect(
      menu.getByRole("link", { name: "Marijan Mode" }),
    ).toHaveAttribute("href", "/marijan/?verify=1");
    await expect(save).toBeVisible();
    const switchHeading = menu.getByRole("heading", {
      name: "Switch creator",
      exact: true,
    });
    const actions = menu.locator(".mobile-menu-actions button");
    const closeBounds = await menu
      .getByRole("button", { name: "Close creator menu", exact: true })
      .boundingBox();
    expect(closeBounds.height).toBeGreaterThanOrEqual(44);
    expect(closeBounds.width).toBeLessThan(100);
    const actionBounds = await menu
      .locator(":scope > .mobile-menu-actions")
      .boundingBox();
    const switchBounds = await switchHeading.boundingBox();
    for (const action of await actions.all()) {
      const bounds = await action.boundingBox();
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(Math.abs(bounds.width - actionBounds.width)).toBeLessThanOrEqual(
        1,
      );
      expect(bounds.y + bounds.height).toBeLessThan(switchBounds.y);
    }
    await noOverflow(page);
    await page.screenshot({
      path: info.outputPath(`${mode.toLowerCase()}-creator-menu.png`),
    });
    const bytes = await downloadBytes(page, save);
    expect(JSON.parse(bytes.bytes).name).toBeDefined();
    await expect(menu).not.toBeVisible();
    await search(page, "Trained");
    await expect(
      page.getByRole("dialog", { name: "Search the books", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Close search", exact: true })
      .click();
    if (mode === "Player") await pcStep(page, "Career");
    if (mode === "GM") await gmStep(page, "Equipment & magic");
    await menuButton.click();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Creator menu", exact: true }),
    ).not.toBeVisible();
    await expect(menuButton).toBeFocused();
    // Resizing restores the original nodes, without duplicate mode links or
    // losing save/install listeners; returning to phone recreates one menu.
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator(".rail .creator-switch")).toBeVisible();
    await expect(save).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await menuButton.click();
    await expect(
      page.locator(".mobile-creator-menu .creator-switch"),
    ).toHaveCount(1);
  });
}
