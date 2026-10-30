import {
  test,
  expect,
  openPC,
  openGM,
  pcStep,
  gmStep,
  noOverflow,
} from "./helpers.mjs";

for (const mode of ["Player", "Bestiary"]) {
  test(`${mode} top Back and Next follow each step at phone, tablet and desktop sizes @interface @mobile`, async ({
    page,
  }, info) => {
    const player = mode === "Player";
    const names = player
      ? [
          "Origins",
          "Career",
          "Characteristics",
          "Skills",
          "Talents",
          "Gear & money",
          "Experience",
          "Review & export",
        ]
      : [
          "Starting profile",
          "Customise",
          "Equipment & magic",
          "Review & export",
        ];
    await (player ? openPC(page) : openGM(page));
    const jump = (name) => (player ? pcStep(page, name) : gmStep(page, name));
    for (const width of info.project.name === "mobile"
      ? [320, 390]
      : [768, 1067, 1100, 1101, 1440]) {
      await page.setViewportSize({ width, height: width === 1067 ? 570 : 900 });
      await jump(names[0]);
      const next = page.getByRole("button", {
        name: `Next: ${names[1]}`,
        exact: true,
      });
      await expect(next).toBeVisible();
      await next.scrollIntoViewIfNeeded();
      const box = await next.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(80);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      if (width <= 1100) {
        const select = await page
          .locator(player ? "#mobile-step" : "#gm-step-select")
          .boundingBox();
        expect(box.x).toBeGreaterThan(select.x + select.width);
        expect(select.width).toBeGreaterThan(box.width);
        expect(
          Math.abs(box.y + box.height - select.y - select.height),
        ).toBeLessThanOrEqual(1);
        await expect(page.locator("main .creator-desktop-next")).toBeHidden();
      } else {
        await expect(page.locator("main .creator-desktop-next")).toBeVisible();
        expect(box.y).toBeLessThan(
          (await page.locator("main h1").boundingBox()).y + 70,
        );
      }
      await noOverflow(page);
      await next.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("main h1")).toBeFocused();
      if (width <= 1100) {
        await expect(
          page.locator(player ? "#mobile-step" : "#gm-step-select"),
        ).toHaveValue("1");
        await expect(
          page.locator(".workspace-compact-selector .creator-next"),
        ).toBeInViewport();
      } else {
        await expect(
          page
            .getByRole("navigation", {
              name: player ? "Character creation steps" : "Workshop pages",
            })
            .locator('[aria-current="step"]'),
        ).toContainText(names[1]);
      }
      const back = page.getByRole("button", {
        name: `Back: ${names[0]}`,
        exact: true,
      });
      const forward = page.getByRole("button", {
        name: `Next: ${names[2]}`,
        exact: true,
      });
      await expect(back).toBeVisible();
      const backBox = await back.boundingBox();
      expect(backBox.width).toBeGreaterThanOrEqual(64);
      expect(backBox.height).toBeGreaterThanOrEqual(44);
      expect(backBox.x).toBeLessThan((await forward.boundingBox()).x);
      if (width <= 1100) {
        const select = await page
          .locator(player ? "#mobile-step" : "#gm-step-select")
          .boundingBox();
        expect(backBox.x + backBox.width).toBeLessThan(select.x);
        expect(select.width).toBeGreaterThanOrEqual(90);
        expect(
          Math.abs(backBox.y + backBox.height - select.y - select.height),
        ).toBeLessThanOrEqual(1);
        await expect(page.locator("main .creator-desktop-back")).toBeHidden();
      }
      await noOverflow(page);
      if ([390, 768, 1067, 1440].includes(width)) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: info.outputPath(`${mode.toLowerCase()}-back-next-${width}.png`),
        });
      }
      await back.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("main h1")).toBeFocused();
      await expect(page.locator(".creator-back")).toHaveCount(0);
    }
    await jump(names[0]);
    for (const name of names.slice(1)) {
      const next = page.getByRole("button", {
        name: `Next: ${name}`,
        exact: true,
      });
      await next.click();
      await expect(page.locator("main h1")).toBeFocused();
    }
    await expect(page.locator(".creator-next")).toHaveCount(0);
    await expect(page.locator("main h1")).toContainText(
      player ? "Your character" : "Review",
    );
    await noOverflow(page);
    for (const name of names.slice(0, -1).reverse()) {
      await page
        .getByRole("button", { name: `Back: ${name}`, exact: true })
        .click();
      await expect(page.locator("main h1")).toBeFocused();
    }
    await expect(page.locator(".creator-back")).toHaveCount(0);
    await jump(names[1]);
    await expect(
      page.getByRole("button", { name: `Back: ${names[0]}`, exact: true }),
    ).toBeVisible();
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".creator-step-button:visible")).toHaveCount(0);
  });
}
