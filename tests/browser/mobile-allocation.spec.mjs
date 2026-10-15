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
  draft.xp = 0;
  await page.addInitScript(
    ({ key, draft }) => {
      localStorage.setItem(key, JSON.stringify(draft));
    },
    { key: PC_STORAGE, draft },
  );
  await openPC(page);
}

test("allocation errors stay below Characteristic cells and Career Skill controls @interface @mobile", async ({
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
    const skillError = page
      .locator(".skill-row > .ui-field-issue")
      .filter({ hasText: "Allocate eight" });
    await expect(skillError).toBeVisible();
    await expect(page.locator(".stepper .ui-field-issue")).toHaveCount(0);
    const row = skillError.locator("..");
    const label = await row.locator(":scope > div").first().boundingBox();
    const controls = await row.locator(".stepper").boundingBox();
    const skillMessage = await skillError.boundingBox();
    expect(label.x + label.width).toBeLessThanOrEqual(controls.x);
    expect(skillMessage.y).toBeGreaterThanOrEqual(
      Math.max(label.y + label.height, controls.y + controls.height),
    );
    await row.scrollIntoViewIfNeeded();
    await noOverflow(page);
    await page.screenshot({ path: info.outputPath(`skills-${width}.png`) });
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
