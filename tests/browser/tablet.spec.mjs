import {
  test,
  expect,
  openPC,
  openGM,
  applyProfile,
  pcStep,
  gmStep,
  search,
  noOverflow,
  downloadBytes,
} from "./helpers.mjs";

async function capture(page, info, name) {
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath(`${name}.png`), scale: "css" });
}

for (const mode of ["Player", "GM", "Marijan"]) {
  test(`${mode} tablet editing, touch controls, tools and references @tablet`, async ({
    page,
  }, info) => {
    const initial = page.viewportSize(),
      compact = initial.width <= 1100;
    if (mode === "Player") await openPC(page, { complete: true });
    else if (mode === "GM") {
      await openGM(page);
      await capture(page, info, "profile-browser");
      if (compact) {
        // Navigation must not push the entire first profile below the fold.
        const first = await page
          .locator(".gm-profile-card")
          .first()
          .boundingBox();
        const historyTop = (
          await page.locator(".mobile-workspace-bar").boundingBox()
        ).y;
        expect(first.y + 44).toBeLessThan(historyTop);
      }
      await applyProfile(page, "Human");
    } else {
      await page.goto("/marijan.html?verify=1");
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    }
    const menu = page.getByRole("button", {
      name: "Open creator menu",
      exact: true,
    });
    const rail = page.locator(".rail");
    await expect(page.locator(".sheet")).toHaveCount(0);
    const history = page.getByRole("group", { name: "Edit history" });
    await expect(history).toHaveCount(1);
    if (compact) {
      await expect(menu).toBeVisible();
      expect((await rail.boundingBox()).height).toBeLessThan(110);
      await expect(
        page.locator(".mobile-workspace-bar .history-controls"),
      ).toBeVisible();
      await menu.tap();
      const saved = await downloadBytes(
        page,
        page.getByRole("button", {
          name: mode === "GM" ? "Save NPC / creature" : "Save character",
          exact: true,
        }),
      );
      expect(JSON.parse(saved.bytes).name).toBeDefined();
    } else {
      await expect(menu).toBeHidden();
      await expect(rail.locator(".workspace-switcher > summary")).toBeVisible();
    }

    if (await page.locator(".workspace-action-dialog[open]").count())
      await page.keyboard.press("Escape");

    if (mode === "Player") {
      for (const select of await page.locator(".panel select:visible").all())
        expect((await select.boundingBox()).height).toBeGreaterThanOrEqual(44);
      await pcStep(page, "Skills");
      const increase = page.getByRole("button", {
        name: "Increase Athletics",
        exact: true,
      });
      expect((await increase.boundingBox()).width).toBeGreaterThanOrEqual(44);
      await capture(page, info, "starting-skills");
      await pcStep(page, "Experience");
      await page
        .getByRole("tab", { name: "Characteristics", exact: true })
        .tap();
      await capture(page, info, "experience");
      await pcStep(page, "Review");
    } else if (mode === "GM") {
      await gmStep(page, "Customise");
      await page
        .getByRole("button", { name: "Choose template", exact: true })
        .tap();
      await capture(page, info, "templates");
      await page.keyboard.press("Escape");
      await gmStep(page, "Review & export");
      await page
        .getByRole("button", { name: "Print A4 table cards", exact: true })
        .tap();
      await expect(
        page.getByLabel("Cards per A4 page", { exact: true }),
      ).toHaveValue("flexible");
      const download = page.getByRole("button", {
        name: "Download A4 PDF",
        exact: true,
      });
      await expect(download).toBeEnabled();
      await download.scrollIntoViewIfNeeded();
      const box = await download.boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(initial.height);
      await capture(page, info, "print-dialog");
      await page.getByRole("button", { name: "Close", exact: true }).tap();
    } else {
      const input = page.getByLabel("Strength initial", { exact: true });
      await input.fill("123");
      await expect(input).toHaveValue("123");
      const dimensions = await input.evaluate((e) => {
        const style = getComputedStyle(e),
          canvas = document.createElement("canvas"),
          context = canvas.getContext("2d");
        context.font = `${style.fontSize} ${style.fontFamily}`;
        return {
          width: e.getBoundingClientRect().width,
          available:
            e.clientWidth -
            parseFloat(style.paddingLeft) -
            parseFloat(style.paddingRight),
          text: context.measureText(e.value).width,
        };
      });
      expect(dimensions.width).toBeGreaterThanOrEqual(64);
      expect(dimensions.available).toBeGreaterThan(dimensions.text + 12);
      await capture(page, info, "characteristics");
      for (const button of await page.locator(".mm-mode:visible").all())
        expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }

    await search(page, "Trained");
    const category = page.getByRole("combobox", {
      name: "Search category",
      exact: true,
    });
    await category.selectOption({ label: "Creature Traits" });
    expect((await category.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await page.getByRole("option", { name: /^Trained Creature Trait/ }).tap();
    await expect(
      page.getByRole("region", { name: "Trained", exact: true }),
    ).toBeVisible();
    await capture(page, info, "reference-reader");
    await page.getByRole("button", { name: "Close search", exact: true }).tap();

    if (info.project.name === "portrait") {
      // Cross the exact boundary both ways: move live controls, never copy them.
      for (const width of [1101, 1100, 1099, 1280, 800]) {
        await page.setViewportSize({ width, height: 800 });
        await expect(menu).toBeVisible({ visible: width <= 1100 });
        await expect(history).toHaveCount(1);
        await expect(
          page.locator(
            width <= 1100
              ? ".mobile-workspace-bar .history-controls"
              : ".rail .history-controls",
          ),
        ).toBeVisible();
        await expect(
          page.locator(
            width <= 1100
              ? ".masthead-actions .book-search-launcher"
              : ".banner-search .book-search-launcher",
          ),
        ).toBeVisible();
        await noOverflow(page);
      }
    }
  });
}
