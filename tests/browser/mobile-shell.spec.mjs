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
  test(`${mode} shares compact header, tools menu and folio @mobile-shell @mobile`, async ({
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
      return;
    }
    await expect(menuButton).toBeVisible();
    await expect(save).toBeHidden();
    const folio = page.locator(
      mode === "GM" ? ".gm-folio" : mode === "Marijan" ? ".mm-folio" : ".sheet",
    );
    await expect(folio).toBeHidden();
    const view = page.locator(".mobile-workspace-bar").getByRole("button", {
      name: mode === "GM" ? "Stat block" : "View character",
      exact: true,
    });
    await view.click();
    await expect(folio).toBeVisible();
    await expect(
      folio.getByRole("button", { name: "Hide details", exact: true }),
    ).toHaveAttribute("aria-expanded", "true");
    await folio
      .getByRole("button", { name: "Hide details", exact: true })
      .click();
    await page.evaluate(() => scrollTo(0, 0));
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
    ).toHaveAttribute("href", "./?verify=1");
    await expect(
      menu.getByRole("link", { name: "NPC & creature" }),
    ).toHaveAttribute("href", "gm.html?verify=1");
    await expect(
      menu.getByRole("link", { name: "Marijan Mode" }),
    ).toHaveAttribute("href", "marijan.html?verify=1");
    await expect(save).toBeVisible();
    await noOverflow(page);
    await page.screenshot({
      path: info.outputPath(`${mode.toLowerCase()}-creator-menu.png`),
    });
    const bytes = await downloadBytes(page, save);
    expect(JSON.parse(bytes.bytes).name).toBeDefined();
    await expect(menu).not.toBeVisible();
    await search(page, "Fortune");
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
