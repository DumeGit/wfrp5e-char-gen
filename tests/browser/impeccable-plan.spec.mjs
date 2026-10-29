import {
  test,
  expect,
  noOverflow,
  openPC,
  pcStep,
  gmStep,
  downloadBytes,
  fileUpload,
  PC_STORAGE,
} from "./helpers.mjs";

test("manager menu navigation focuses visible destination content @interface @manager @mobile", async ({
  page,
}) => {
  await page.goto("/manager/?verify=1");
  await page
    .locator(".manager-empty")
    .getByRole("button", { name: "New blank character", exact: true })
    .click();
  await expect(page.locator("#manager-character-name")).toBeVisible();
  for (const [destination, heading, nextAction] of [
    ["Advance", "Advancement", "Award XP"],
    ["Journal", "Journal", "Add journal entry"],
    ["Play", "Unnamed character", "Edit profile"],
  ]) {
    const launcher = page.getByRole("button", {
      name: "Open manager menu",
      exact: true,
    });
    if (await launcher.isVisible()) await launcher.click();
    const action = page
      .locator(".workspace-manager-sections")
      .getByRole("button", { name: destination, exact: true });
    await action.focus();
    await action.press("Enter");
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: nextAction, exact: true }),
    ).toBeFocused();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await noOverflow(page);
});

test("Player supporting note is readable on paper @interface @mobile", async ({
  page,
}) => {
  await page.goto("/?verify=1");
  const note = page.locator(".panel .footer-note");
  await expect(note).toBeVisible();
  const contrast = await note.evaluate((node) => {
    const linear = (value) => {
      const n = value / 255;
      return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (css) => {
      const rgb = css
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
        .map(linear);
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const foreground = luminance(getComputedStyle(node).color);
    const background = luminance(
      getComputedStyle(node.closest(".panel")).backgroundColor,
    );
    return (
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05)
    );
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test("book setup has accurate context and matching top/bottom actions @interface @pc @mobile", async ({
  page,
}, info) => {
  await page.goto("/?verify=1");
  await expect(
    page.getByRole("heading", { name: "Choose your books", exact: true }),
  ).toBeVisible();
  if (info.project.name === "mobile") {
    await expect(page.locator(".workspace-setup-context")).toBeVisible();
    await expect(page.locator(".workspace-setup-context")).toHaveText(
      "Character setupChoose books",
    );
    await expect(
      page.getByRole("combobox", { name: "Creation step", exact: true }),
    ).toHaveCount(0);
  }
  const top = page.getByRole("group", {
    name: "Book selection actions",
    exact: true,
  });
  const apply = top.getByRole("button", {
    name: "Use selected books",
    exact: true,
  });
  expect((await apply.boundingBox()).y).toBeLessThan(
    (await page.locator(".book-grid").boundingBox()).y,
  );
  await page.screenshot({ path: info.outputPath("book-setup.png") });
  await apply.click();
  await expect(
    page.getByRole("heading", { name: "Origins & identity", exact: true }),
  ).toBeVisible();
  const before = await page.evaluate(
    (key) => localStorage.getItem(key),
    PC_STORAGE,
  );
  await page.getByRole("button", { name: "Choose books", exact: true }).click();
  await page
    .getByRole("button", { name: "Use selected books", exact: true })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "Origins & identity", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  ).toBe(before);
});

test("Career and Gear offer continuation before optional browsing @interface @pc @mobile", async ({
  page,
}, info) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Career");
  await expect(
    page.getByText("Training choices before Skills", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.locator('[data-bind="freeTalent"], [data-bind="gearChoices"]'),
  ).toHaveCount(0);
  const next = page
    .locator(".contextual-continue")
    .getByRole("button", { name: "Continue to Characteristics", exact: true });
  const alternatives = page.locator(".career-browse-disclosure");
  await expect(alternatives).not.toHaveAttribute("open", "");
  expect((await next.boundingBox()).y).toBeLessThan(
    (await alternatives.boundingBox()).y,
  );
  await page.screenshot({
    path: info.outputPath("career-without-training-choices.png"),
  });
  const before = await page.evaluate(
    (key) => localStorage.getItem(key),
    PC_STORAGE,
  );
  await alternatives.locator(":scope > summary").click();
  await page.getByLabel("Find a Career", { exact: true }).fill("Rat Catcher");
  await expect(page.locator(".career-result")).toHaveCount(1);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  ).toBe(before);
  await page.getByText("Read the full Career path", { exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The Career path", exact: true }),
  ).toBeVisible();
  await next.click();
  await expect(
    page.getByRole("heading", { name: "Characteristics", exact: true }),
  ).toBeVisible();
  await pcStep(page, "Talents");
  await expect(
    page.getByLabel("One free Career Talent", { exact: true }),
  ).toBeVisible();
  await pcStep(page, "Gear & money");
  await expect(
    page.getByRole("heading", { name: "Your starting kit", exact: true }),
  ).toBeVisible();
  await page
    .locator(".contextual-continue")
    .getByRole("button", { name: "Continue to Experience", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Spend experience", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Spend experience", exact: true }),
  ).toBeVisible();
});

test("Review JSON saves a complete editable character for independent manager import @interface @pc @manager @storage @mobile", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await openPC(page, { complete: true });
  await pcStep(page, "Review");
  const saved = await downloadBytes(
    page,
    page.getByRole("button", {
      name: "Save editable character (.json)",
      exact: true,
    }),
  );
  const draft = JSON.parse(saved.bytes.toString());
  expect(draft.name).toBe("Browser Test Soldier");
  expect(draft.points).toEqual([16, 6, 15, 15, 9, 12, 5, 6, 12, 4]);
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load character", exact: true }),
    draft,
    saved.name,
  );
  await expect
    .poll(async () =>
      JSON.parse(
        await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
      ),
    )
    .toMatchObject(draft);
  await page.reload();
  await pcStep(page, "Review");
  await expect(
    page.getByRole("button", {
      name: "Save editable character (.json)",
      exact: true,
    }),
  ).toBeEnabled();
  expect(requests.some((url) => /pdf-runtime|pdf-lib/.test(url))).toBe(false);
  const before = await page.evaluate(
    (key) => localStorage.getItem(key),
    PC_STORAGE,
  );
  await page
    .getByRole("link", { name: "Character manager", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your characters", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#manager-character-name")).toHaveCount(0);
  await page
    .getByLabel("Import character JSON", { exact: true })
    .setInputFiles({
      name: saved.name,
      mimeType: "application/json",
      buffer: saved.bytes,
    });
  await page.getByRole("button", { name: /Import 1 character/ }).click();
  await expect(page.locator("#manager-character-name")).toHaveText(draft.name);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  ).toBe(before);
  await page.reload();
  await expect(page.locator("#manager-character-name")).toHaveText(draft.name);
});

test("unfinished Review can save JSON while PDFs remain blocked @interface @pc @storage @mobile", async ({
  page,
}) => {
  await openPC(page);
  await pcStep(page, "Review");
  await expect(
    page.getByRole("button", { name: "Download character sheet", exact: true }),
  ).toBeDisabled();
  const saved = await downloadBytes(
    page,
    page.getByRole("button", {
      name: "Save editable character (.json)",
      exact: true,
    }),
  );
  expect(JSON.parse(saved.bytes.toString()).career).toBe("");
});

test("Bestiary compact filters disclose active choices and retain the missing-profile gate @interface @gm @mobile", async ({
  page,
}, info) => {
  await page.goto("/bestiary/?verify=1");
  const field = page.getByRole("textbox", {
    name: "Find a profile",
    exact: true,
  });
  await expect(field).toBeVisible();
  await expect(field).not.toHaveAttribute("aria-invalid", "true");
  const filters = page.locator(".gm-profile-filter-disclosure");
  if (info.project.name === "mobile") {
    await expect(filters).not.toHaveAttribute("open", "");
    await filters.locator(":scope > summary").click();
  }
  for (const width of info.project.name === "mobile"
    ? [320, 390, 430, 599]
    : [600, 768, 952, 1067, 1100, 1101, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (width <= 1100) {
      const summary = filters.locator(":scope > summary");
      await expect(summary).toBeVisible();
      if ((await filters.getAttribute("open")) !== null) await summary.click();
      await expect(filters).not.toHaveAttribute("open", "");
      const first = await page
        .locator(".gm-profile-card")
        .first()
        .boundingBox();
      const history = await page.locator(".mobile-workspace-bar").boundingBox();
      expect(first.y + 44).toBeLessThan(history.y);
      await summary.click();
    }
    await expect(filters).toHaveAttribute("open", "");
    const boxes = await page
      .locator("#gm-profile-search, #gm-category, #gm-profile-book")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
            bottom: box.bottom,
            right: box.right,
          };
        }),
      );
    const [searchBox, categoryBox, bookBox] = boxes;
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(150);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.right).toBeLessThanOrEqual(width);
    }
    if (width < 600) {
      expect(Math.abs(categoryBox.x - searchBox.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(categoryBox.width - searchBox.width)).toBeLessThanOrEqual(
        1,
      );
      expect(Math.abs(categoryBox.x - bookBox.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(categoryBox.width - bookBox.width)).toBeLessThanOrEqual(
        1,
      );
      expect(bookBox.y).toBeGreaterThan(categoryBox.bottom);
    } else if (width <= 1100) {
      expect(Math.abs(categoryBox.x - searchBox.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(bookBox.right - searchBox.right)).toBeLessThanOrEqual(1);
      expect(Math.abs(categoryBox.y - bookBox.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(categoryBox.width - bookBox.width)).toBeLessThanOrEqual(
        1,
      );
      expect(categoryBox.y).toBeGreaterThan(searchBox.bottom);
      expect(bookBox.x).toBeGreaterThan(categoryBox.right);
    } else expect(Math.abs(categoryBox.y - bookBox.y)).toBeLessThanOrEqual(1);
    await noOverflow(page);
    if ([390, 768, 952, 1067, 1440].includes(width)) {
      if ([952, 1067].includes(width)) {
        await page.setViewportSize({
          width,
          height: width === 952 ? 600 : 570,
        });
      }
      await filters.scrollIntoViewIfNeeded();
      await expect(page.locator("#gm-category")).toBeInViewport();
      await expect(page.locator("#gm-profile-book")).toBeInViewport();
      await noOverflow(page);
      await page.screenshot({
        path: info.outputPath(`profile-filters-${width}.png`),
      });
    }
  }
  await page.setViewportSize(
    info.project.name === "mobile"
      ? { width: 390, height: 844 }
      : { width: 1440, height: 900 },
  );
  const category = page.getByLabel("Category", { exact: true });
  const value = await category.locator("option").nth(1).getAttribute("value");
  await category.selectOption(value);
  const book = filters.getByLabel("Book", { exact: true });
  await book.selectOption("core");
  const count = await page.locator(".gm-profile-card").count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(49);
  if (info.project.name === "mobile") {
    await filters.locator(":scope > summary").click();
    await expect(filters.locator(":scope > summary")).toContainText(value);
    await filters.locator(":scope > summary").click();
  }
  await page
    .getByRole("button", { name: "Clear profile filters", exact: true })
    .click();
  await expect(page.locator(".gm-profile-card")).toHaveCount(49);
  await expect(category).toHaveValue("");
  await expect(book).toHaveValue("");
  await gmStep(page, "Review & export");
  await page
    .getByRole("button", {
      name: "Choose a printed starting profile.",
      exact: true,
    })
    .click();
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await noOverflow(page);
});

test("Marijan characteristic cells keep initials and totals distinct at narrow widths @interface @marijan @mobile", async ({
  page,
}) => {
  await page.goto("/marijan/?verify=1");
  const initial = page.getByLabel("Weapon Skill initial", { exact: true });
  await initial.fill("12345");
  await initial.press("Tab");
  const output = page.getByLabel("Weapon Skill total", { exact: true });
  await expect(output).toHaveText("12345");
  for (const width of [320, 390, 768, 1101, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    const cells = page.locator(".mm-char-cell");
    await expect(cells).toHaveCount(10);
    const bounds = await cells.evaluateAll((nodes) =>
      nodes.map((node) => {
        const cell = node.getBoundingClientRect(),
          input = node.querySelector("input").getBoundingClientRect(),
          output = node.querySelector("output").getBoundingClientRect();
        return {
          cell: {
            x: cell.x,
            right: cell.right,
            y: cell.y,
            bottom: cell.bottom,
          },
          input: { x: input.x, right: input.right, width: input.width },
          output: { x: output.x, right: output.right },
        };
      }),
    );
    for (const { cell, input, output } of bounds) {
      expect(input.width).toBeGreaterThanOrEqual(64);
      expect(input.right).toBeLessThanOrEqual(cell.right + 1);
      expect(output.right).toBeLessThanOrEqual(cell.right + 1);
      expect(input.x).toBeGreaterThanOrEqual(cell.x);
    }
    for (let i = 0; i < bounds.length; i++)
      for (let j = i + 1; j < bounds.length; j++) {
        const a = bounds[i].cell,
          b = bounds[j].cell;
        expect(
          Math.min(a.right, b.right) - Math.max(a.x, b.x) > 1 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 1,
        ).toBe(false);
      }
    await noOverflow(page);
  }
});
