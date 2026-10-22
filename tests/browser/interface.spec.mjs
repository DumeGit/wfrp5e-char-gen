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
  revealCreatorTool,
} from "./helpers.mjs";

for (const mode of ["Player", "GM", "Marijan"]) {
  test(`${mode} workspace grows with the viewport instead of leaving capped margins @interface`, async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "This case checks desktop-to-phone resize in one session.",
    );
    if (mode === "Player") await openPC(page, { complete: true });
    else if (mode === "GM") await openGM(page);
    else {
      await page.goto("/marijan.html?verify=1");
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    }
    let previousEditorWidth = 0;
    for (const width of [1440, 1920, 2560, 3840]) {
      await page.setViewportSize({ width, height: 1000 });
      const shell = await page
        .locator(".workspace, .mm-workspace")
        .boundingBox();
      const editor = await page.locator("main").boundingBox();
      const rail = await page.locator(".rail").boundingBox();
      await expect(page.locator(".sheet")).toHaveCount(0);
      expect(shell.width).toBeGreaterThan(width * 0.96);
      expect(editor.width).toBeGreaterThan(previousEditorWidth);
      expect(rail.width).toBe(296);
      expect(Math.abs(rail.x + rail.width - editor.x)).toBeLessThanOrEqual(1);
      const rightGutter = await page
        .locator(".workspace, .mm-workspace")
        .evaluate((el) => parseFloat(getComputedStyle(el).paddingRight));
      expect(
        Math.abs(
          editor.x + editor.width - (shell.x + shell.width - rightGutter),
        ),
      ).toBeLessThanOrEqual(1);
      expect(rail.x).toBeGreaterThanOrEqual(16);
      expect(rail.x).toBeLessThanOrEqual(40);
      const brand = await page.locator(".brand").boundingBox();
      expect(Math.abs(brand.x - rail.x)).toBeLessThanOrEqual(1);
      previousEditorWidth = editor.width;
      await noOverflow(page);
      if (width === 2560)
        await page.screenshot({
          path: info.outputPath(`${mode.toLowerCase()}-fluid-wide.png`),
        });
    }
    if (mode === "Player") {
      await revealCreatorTool(
        page,
        page.getByRole("button", { name: "Choose books", exact: true }),
      );
      await page
        .getByRole("button", { name: "Choose books", exact: true })
        .first()
        .click();
      await expect(
        page.getByRole("heading", { name: "Choose your books", exact: true }),
      ).toBeVisible();
      expect(
        (await page.locator(".workspace, .mm-workspace").boundingBox()).width,
      ).toBeGreaterThan(3700);
    }
    for (const width of [960, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await noOverflow(page);
      if (await page.locator(".rail").isVisible()) {
        const rail = await page.locator(".rail").boundingBox();
        const editor = await page.locator("main").boundingBox();
        expect(Math.abs(rail.y + rail.height - editor.y)).toBeLessThanOrEqual(
          1,
        );
      }
    }
  });
}

for (const mode of ["Player", "GM", "Marijan"]) {
  test(`${mode} shared input and keyboard contract @interface @mobile`, async ({
    page,
  }, info) => {
    if (mode === "Player") await openPC(page, { complete: true });
    else if (mode === "GM") {
      await openGM(page);
      await applyProfile(page, "Griffon");
      await gmStep(page, "Customise");
    } else {
      await page.goto("/marijan.html?verify=1");
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    }
    const skip = page.getByRole("link", {
      name: "Skip to editor",
      exact: true,
    });
    await skip.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#creator-main")).toBeFocused();
    const fields = page.locator('main input[type="number"]');
    if (mode === "Player") {
      await pcStep(page, "Characteristics");
    }
    expect(await fields.count()).toBeGreaterThan(0);
    for (const field of await fields.all()) {
      await expect(field).toHaveAttribute("name", /.+/);
      await expect(field).toHaveAttribute("autocomplete", "off");
      await expect(field).toHaveAttribute("inputmode", /^(numeric|decimal)$/);
      if (info.project.name === "mobile" && (await field.isVisible())) {
        expect((await field.boundingBox()).height).toBeGreaterThanOrEqual(44);
        expect(
          await field.evaluate((el) =>
            parseFloat(getComputedStyle(el).fontSize),
          ),
        ).toBeGreaterThanOrEqual(16);
      }
    }
    if (mode === "GM" && info.project.name === "mobile") {
      for (const selector of [".gm-char-row button", '[role="tab"]']) {
        for (const item of await page.locator(selector).all()) {
          expect((await item.boundingBox()).height).toBeGreaterThanOrEqual(44);
        }
      }
    }
    await noOverflow(page);
    await page.screenshot({
      path: info.outputPath(`${mode.toLowerCase()}-interface.png`),
    });
  });
}

test("Player phone keeps balances and history without a folio action @interface @mobile", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "mobile", "Phone resource strip");
  await openPC(page, { complete: true });
  const bar = page.locator(".mobile-workspace-bar");
  await expect(bar.getByLabel("Remaining experience and money")).toBeVisible();
  await expect(bar.getByRole("group", { name: "Edit history" })).toBeVisible();
  await expect(
    bar.getByRole("button", { name: /View character|Back to choice/ }),
  ).toHaveCount(0);
  await expect(page.locator(".sheet")).toHaveCount(0);
});

test("Experience keeps purchases near controls and remembers rule disclosures @interface @pc", async ({
  page,
}, info) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Experience");
  const rows = page.locator(".xp-characteristic-row");
  if (info.project.name === "mobile")
    expect((await rows.first().boundingBox()).y).toBeLessThan(780);
  const rules = page.locator(
    'details[data-detail-key="experience:advance-help"]',
  );
  await rules.locator("summary").click();
  await expect(rules).toContainText("An incomplete +1 band");
  await page.getByRole("button", { name: "+1", exact: true }).click();
  await expect(rules).toHaveAttribute("open", "");
  await expect(rules).toContainText("Five +1 Advances");
  await page.getByRole("tab", { name: "Characteristics", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Skills", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("tab", { name: "Skills", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});

test("GM starts neutrally and explains a blocking choice at its field @interface @gm", async ({
  page,
}) => {
  await openGM(page);
  await expect(
    page.getByRole("region", { name: "Get started", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Choices to finish", exact: true }),
  ).toHaveCount(0);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page
    .getByLabel("Size", { exact: true })
    .selectOption({ label: "Tiny" });
  await page
    .getByRole("region", { name: "Choices to finish" })
    .getByRole("button", { name: /Tiny/ })
    .click();
  const wounds = page.getByLabel("Wounds override", { exact: true });
  await expect(wounds).toHaveAttribute("aria-invalid", "true");
  const id = await wounds.getAttribute("aria-describedby");
  await expect(page.locator(`#${id}`)).toContainText("Tiny");
  await wounds.fill("3");
  await wounds.blur();
  await expect(wounds).not.toHaveAttribute("aria-invalid", "true");
});

test("Search excerpts are plain text and Back retains the selected result @interface @search", async ({
  page,
}) => {
  await openPC(page);
  const input = await search(page, "Trained");
  const result = page.getByRole("option", { name: /^Trained Creature Trait/ });
  await expect(result).toBeVisible();
  await expect(result).not.toContainText("###");
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page.locator("#book-search-title")).toHaveText("Trained");
  await page
    .getByRole("button", { name: "Back to search", exact: true })
    .click();
  await expect(result).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Close search", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /^Search rules and book references/ }),
  ).toBeFocused();
});

test("A failed operation stays retryable and excludes duplicate activation @interface", async ({
  page,
}) => {
  let attempts = 0,
    release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/pdf-lib.min.js", async (route) => {
    attempts++;
    if (attempts === 1) {
      await gate;
      await route.abort();
    } else await route.continue();
  });
  await openPC(page, { complete: true });
  await pcStep(page, "Review & export");
  const button = page.locator('[data-action="sheet"]');
  const width = (await button.boundingBox()).width;
  await button.click();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-busy", "true");
  expect((await button.boundingBox()).width).toBeGreaterThanOrEqual(width);
  await button.evaluate((el) =>
    el.dispatchEvent(new MouseEvent("click", { bubbles: true })),
  );
  await expect.poll(() => attempts).toBe(1);
  release();
  await expect(page.locator(".ui-operation-error")).toContainText(
    "Could not load PDF export tools",
  );
  await expect(button).toBeEnabled();
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  const downloaded = await downloadBytes(page, button);
  expect(downloaded.bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(attempts).toBe(2);
  await expect(page.locator(".ui-operation-error")).toHaveCount(0);
});
