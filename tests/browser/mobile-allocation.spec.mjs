import {
  test,
  expect,
  openPC,
  pcDraft,
  pcStep,
  PC_STORAGE,
  noOverflow,
} from "./helpers.mjs";

async function incompleteAllocations(page) {
  const draft = await pcDraft({ complete: true });
  draft.points = Array(10).fill(null);
  draft.charMode = "points";
  draft.careerSkills = {};
  draft.speciesSkills.pop();
  draft.xp = 0;
  await page.addInitScript(
    ({ key, draft }) => {
      localStorage.setItem(key, JSON.stringify(draft));
    },
    { key: PC_STORAGE, draft },
  );
  await openPC(page);
}

test("allocation errors stay below Characteristic cells and whole Skill selections @interface @mobile", async ({
  page,
}, info) => {
  await incompleteAllocations(page);
  for (const width of [1440, 1024, 320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await pcStep(page, "Characteristics");
    const grid = page.locator(".points-grid");
    const message = grid.locator(":scope > .ui-field-issue");
    await expect(message).toContainText("Allocate exactly 100");
    await expect(
      grid.locator(".characteristic-cell .ui-field-issue"),
    ).toHaveCount(0);
    const bounds = await grid.boundingBox();
    const error = await message.boundingBox();
    const cells = await grid
      .locator(".characteristic-cell")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return { bottom: box.bottom, width: box.width };
        }),
      );
    expect(
      await message.evaluate((node) => getComputedStyle(node).gridColumn),
    ).toBe("1 / -1");
    // Wide screens retain the shared readable-prose cap; narrow screens use
    // the available group width rather than one Characteristic column.
    expect(error.width).toBeGreaterThan(Math.min(bounds.width * 0.95, 400));
    expect(error.y).toBeGreaterThanOrEqual(
      Math.max(...cells.map((cell) => cell.bottom)),
    );
    expect(cells.every((cell) => cell.width >= 72)).toBe(true);
    const describedBy = await page
      .locator("#point-0")
      .getAttribute("aria-describedby");
    expect(describedBy.split(" ")).toContain(await message.getAttribute("id"));
    await noOverflow(page);
    await grid.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`points-${width}.png`) });

    await pcStep(page, "Skills");
    for (const [selector, text, rows] of [
      [
        ".species-skill-section",
        "Select five different Species Skills.",
        ".species-skill-option",
      ],
      [
        ".career-skill-section",
        "Allocate eight free Career Skill Advances.",
        ".skill-row",
      ],
    ]) {
      const section = page.locator(selector);
      const message = section.locator(":scope > .ui-field-issue");
      await expect(message).toHaveText(text);
      await expect(section.locator(`${rows} .ui-field-issue`)).toHaveCount(0);
      const messageBounds = await message.boundingBox();
      const rowBottoms = await section
        .locator(rows)
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getBoundingClientRect().bottom),
        );
      expect(messageBounds.y).toBeGreaterThanOrEqual(Math.max(...rowBottoms));
      const sectionBounds = await section.boundingBox();
      expect(messageBounds.width).toBeGreaterThan(
        Math.min(sectionBounds.width * 0.95, 400),
      );
      await message.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: info.outputPath(`${selector.slice(1)}-${width}.png`),
      });
    }
    await expect(page.locator(".stepper .ui-field-issue")).toHaveCount(0);
    const speciesMessage = page.locator(
      ".species-skill-section > .ui-field-issue",
    );
    expect(
      await page
        .locator('[data-bind="speciesSkills"]')
        .first()
        .getAttribute("aria-describedby"),
    ).toContain(await speciesMessage.getAttribute("id"));
    await noOverflow(page);
  }
});

test("Characteristic and Skill XP help targets have their own space beside purchase buttons @interface @mobile", async ({
  page,
}, info) => {
  await incompleteAllocations(page);
  for (const width of [320, 390, 790, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await pcStep(page, "Experience");
    for (const tab of ["Characteristics", "Skills"]) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      const rows = page.locator(".xp-advance-row:visible");
      await expect(rows.first()).toBeVisible();
      for (const row of await rows.all()) {
        const help = await row
          .locator(".advance-calculation-help")
          .boundingBox();
        const purchase = await row
          .locator(".xp-advance-purchase")
          .boundingBox();
        expect(purchase.x - (help.x + help.width)).toBeGreaterThanOrEqual(7);
        if (width <= 760 || info.project.name === "mobile") {
          expect(help.width).toBeGreaterThanOrEqual(44);
          expect(help.height).toBeGreaterThanOrEqual(44);
        }
      }
      await rows.first().scrollIntoViewIfNeeded();
      await noOverflow(page);
      if (width <= 390)
        await page.screenshot({
          path: info.outputPath(`xp-${tab}-${width}.png`),
        });
    }
  }
});
