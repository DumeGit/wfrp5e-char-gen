import {
  test,
  expect,
  openPC,
  openGM,
  applyProfile,
  noOverflow,
} from "./helpers.mjs";

const surfaces = {
  player: { file: "tavern-wood.svg", color: "rgb(48, 34, 27)" },
  gm: { file: "crypt-masonry.svg", color: "rgb(28, 44, 60)" },
  marijan: { file: "vellum.svg", color: "rgb(36, 35, 38)" },
};
for (const [mode, expected] of Object.entries(surfaces)) {
  test(`${mode} matching panel materials stay static, usable and print-free @interface @mobile`, async ({
    page,
  }, info) => {
    if (mode === "player") await openPC(page, { complete: true });
    else if (mode === "gm") {
      await openGM(page);
      await applyProfile(page, "Griffon");
    } else {
      await page.goto("/marijan.html?verify=1");
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
      await page.getByLabel("Name", { exact: true }).fill("Albrecht");
    }
    const readSurfaces = () =>
      page.locator(".rail, .sheet").evaluateAll((panels) =>
        panels.map((el) => {
          const s = getComputedStyle(el);
          return {
            image: s.backgroundImage,
            color: s.backgroundColor,
            size: s.backgroundSize,
            blend: s.backgroundBlendMode,
            overlay: getComputedStyle(el, "::before").content,
          };
        }),
      );
    const panels = await readSurfaces();
    expect(panels).toHaveLength(2);
    expect(panels[0]).toEqual(panels[1]);
    expect(panels[0].image).toContain(
      `/assets/panel-textures/${expected.file}`,
    );
    expect(panels[0].color).toBe(expected.color);
    expect(panels[0].blend).toBe("soft-light, normal");
    expect(panels[0].overlay).toBe("none");
    const image = await page.evaluate(async (file) => {
      const img = new Image();
      img.src = `/assets/panel-textures/${file}`;
      await img.decode();
      return { width: img.naturalWidth, height: img.naturalHeight };
    }, expected.file);
    expect(image.width).toBeGreaterThan(0);
    expect(image.height).toBeGreaterThan(0);
    if (info.project.name === "mobile") {
      await page
        .locator(".mobile-workspace-bar")
        .getByRole("button", {
          name: mode === "gm" ? "Stat block" : "View character",
          exact: true,
        })
        .click();
      await expect(page.locator(".sheet")).toBeVisible();
    }
    await noOverflow(page);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: info.outputPath(`${mode}-panel-materials.png`),
    });
    // Reduced motion is already active in the suite. The static background also
    // remains identical when ordinary motion preferences are restored.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(await readSurfaces()).toEqual(panels);
    await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
    expect(
      await page
        .locator(".sheet")
        .evaluate((el) => getComputedStyle(el).backgroundImage),
    ).toBe("none");
    expect(
      await page
        .locator(".rail")
        .evaluate((el) => getComputedStyle(el).display),
    ).toBe("none");
  });
}
