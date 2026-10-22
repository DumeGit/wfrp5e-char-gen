import {
  test,
  expect,
  openPC,
  openGM,
  applyProfile,
  noOverflow,
  downloadBytes,
} from "./helpers.mjs";

for (const mode of ["Player", "GM", "Marijan"]) {
  test(`${mode} shares the oak menu, grouped actions and exact compact boundary @mobile-shell @mobile`, async ({
    page,
  }, info) => {
    if (mode === "Player") await openPC(page, { complete: true });
    else if (mode === "GM") {
      await openGM(page);
      await applyProfile(page, "Human");
    } else {
      await page.goto("/marijan/?verify=1");
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    }
    const launcher = page.getByRole("button", {
      name: "Open creator menu",
      exact: true,
    });
    const save = page.getByRole("button", {
      name: mode === "GM" ? "Save NPC / creature" : "Save character",
      exact: true,
    });
    for (const width of [1101, 1100, 1099, 320, 390, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await expect(launcher).toBeVisible({ visible: width <= 1100 });
      await expect(page.locator(".workspace-menu-content")).toHaveCount(1);
      await expect(
        page.getByRole("group", { name: "Edit history" }),
      ).toHaveCount(1);
      await expect(page.locator(".sheet")).toHaveCount(0);
      await noOverflow(page);
      if (width > 1100) {
        expect(
          (await page.locator(".workspace-rail").boundingBox()).width,
        ).toBe(296);
        await expect(page.locator(".workspace-rail")).toHaveCSS(
          "overflow-y",
          "visible",
        );
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await launcher.click();
    const menu = page.getByRole("dialog", {
      name: "Creator menu",
      exact: true,
    });
    const summary = menu.locator(".workspace-switcher > summary");
    await summary.click();
    for (const [name, href] of [
      ["Player character", "/"],
      ["NPC & creature", "/bestiary/"],
      ["Marijan Mode", "/marijan/"],
      ["Character manager", "/manager/"],
    ])
      await expect(
        menu.getByRole("link", { name, exact: true }),
      ).toHaveAttribute("href", href + "?verify=1");
    await page.keyboard.press("Escape");
    await expect(menu).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(menu.locator(".creator-switch")).toBeHidden();
    for (const button of await menu.locator(".workspace-group-launcher").all())
      expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: info.outputPath(`${mode}-oak-menu.png`) });
    const downloaded = await downloadBytes(page, save);
    expect(JSON.parse(downloaded.bytes).name).toBeDefined();
    await expect(menu).not.toBeVisible();
    await expect(
      page.getByRole("dialog", { name: "Save & export", exact: true }),
    ).not.toBeVisible();
    await expect(launcher).toBeFocused();
    await launcher.click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(menu).not.toBeVisible();
    await expect(
      page.locator(".workspace-rail .workspace-switcher > summary"),
    ).toBeFocused();
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  });
}
