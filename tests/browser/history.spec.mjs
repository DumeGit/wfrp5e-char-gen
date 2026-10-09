import {
  test,
  expect,
  openPC,
  openGM,
  applyProfile,
  pcStep,
  gmStep,
  noOverflow,
  PC_STORAGE,
} from "./helpers.mjs";

for (const mode of ["Player", "GM", "Marijan"]) {
  test(`${mode} shares undo/redo, grouped typing and branch behaviour @history @mobile`, async ({
    page,
  }, info) => {
    if (mode === "Player") await openPC(page);
    else if (mode === "GM") {
      await openGM(page);
      await applyProfile(page, "Human");
    } else {
      await page.goto("/marijan.html?verify=1");
      await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    }
    const name = page.getByLabel(mode === "Player" ? "First name" : "Name", {
      exact: true,
    });
    const original = await name.inputValue();
    const undo = page.getByRole("button", { name: "Undo", exact: true });
    const redo = page.getByRole("button", { name: "Redo", exact: true });
    await expect(page.getByRole("group", { name: "Edit history" })).toHaveCount(
      1,
    );
    await name.fill("Al");
    await name.pressSequentially("brecht");
    await undo.click();
    await expect(name).toHaveValue(original);
    // Disabled after exhausting history; otherwise keep keyboard focus on it.
    if (await undo.isEnabled()) await expect(undo).toBeFocused();
    await expect(redo).toBeEnabled();
    // Browsing/navigation is not an edit and does not discard redo.
    if (mode === "Player") {
      await pcStep(page, "Career");
      await pcStep(page, "Origins");
    } else if (mode === "GM") {
      await gmStep(page, "Customise");
      await gmStep(page, "Starting profile");
    } else {
      await page.getByLabel("Find a Career", { exact: true }).fill("Soldier");
    }
    await redo.click();
    await expect(name).toHaveValue("Albrecht");
    await undo.click();
    await name.fill("New branch");
    await expect(redo).toBeDisabled();
    await name.blur();
    await undo.click();
    await expect(name).toHaveValue(original);
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(
        page.getByRole("group", { name: "Edit history" }),
      ).toHaveCount(1);
      await expect(
        page.locator(
          width <= 760
            ? ".mobile-workspace-bar .history-controls"
            : ".rail .history-controls",
        ),
      ).toBeVisible();
      await noOverflow(page);
      const bounds = await redo.boundingBox();
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
    await page.setViewportSize(
      info.project.name === "mobile"
        ? { width: 320, height: 844 }
        : { width: 1440, height: 900 },
    );
    await page.screenshot({
      path: info.outputPath(`${mode.toLowerCase()}-history.png`),
    });
  });
}

test("player undo preserves dice and first-roll eligibility; redo reuses the result @history @pc", async ({
  page,
}) => {
  await openPC(page);
  await pcStep(page, "Career");
  const roll = page.getByRole("button", {
    name: "Roll Career · d100",
    exact: true,
  });
  await roll.click();
  const state = () =>
    page.evaluate((key) => JSON.parse(localStorage.getItem(key)), PC_STORAGE);
  const rolled = await state();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  const undone = await state();
  expect(undone.careerAttempts).toBe(1);
  expect(undone.rolls).toEqual(rolled.rolls);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  const redone = await state();
  expect(redone.career).toBe(rolled.career);
  expect(redone.careerMode).toBe("first");
  expect(redone.rolls).toEqual(rolled.rolls);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page
    .getByRole("button", { name: "Roll another Career", exact: true })
    .click();
  const rerolled = await state();
  expect(rerolled.careerAttempts).toBe(2);
  expect(rerolled.careerMode).toBe("later");
  expect(rerolled.rolls.length).toBe(2);
});
