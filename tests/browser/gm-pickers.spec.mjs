import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
} from "./helpers.mjs";

test("equipment filters narrow by type and dependent group, reset stale choices and add the exact item @gm @mobile", async ({
  page,
}, info) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Equipment & magic");
  const open = () =>
    page.getByRole("button", { name: "Add equipment", exact: true }).click();
  await open();
  const dialog = page.getByRole("dialog", {
    name: "Add equipment",
    exact: true,
  });
  const type = dialog.getByLabel("Trapping type", { exact: true });
  expect(await dialog.locator(".gm-picker-row").count()).toBeGreaterThan(400);
  await type.selectOption("Weapons");
  await dialog
    .getByLabel("Weapon type", { exact: true })
    .selectOption("Ranged");
  await dialog
    .getByLabel("Weapon group", { exact: true })
    .selectOption("Engineering");
  await expect(dialog.locator(".gm-picker-row").first()).toContainText(
    "Engineering",
  );
  await dialog.locator("#gm-picker-search").fill("absent trapping");
  await expect(
    dialog.getByText("No trappings match these filters.", { exact: false }),
  ).toBeVisible();
  await dialog.locator("#gm-picker-search").fill("");
  if (page.viewportSize().width > 1000) {
    const clear = await dialog
      .getByRole("button", { name: "Clear filters", exact: true })
      .boundingBox();
    const selects = await dialog.locator(".gm-equipment-filters select").all();
    for (const select of selects) {
      const bounds = await select.boundingBox();
      expect(
        Math.abs(bounds.y + bounds.height - clear.y - clear.height),
      ).toBeLessThanOrEqual(1);
    }
  }
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("equipment-engineering.png") });
  await dialog.getByLabel("Weapon type", { exact: true }).selectOption("Melee");
  await expect(dialog.getByLabel("Weapon group", { exact: true })).toHaveValue(
    "",
  );
  await expect(
    dialog
      .getByLabel("Weapon group", { exact: true })
      .locator("option", { hasText: /^Bow$/ }),
  ).toHaveCount(0);
  await type.selectOption("Armour & shields");
  await expect(dialog.getByLabel("Weapon group", { exact: true })).toHaveCount(
    0,
  );
  await dialog
    .getByLabel("Trapping group", { exact: true })
    .selectOption("Shields");
  await expect(dialog.getByText("Buckler", { exact: true })).toBeVisible();
  await dialog
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(type).toHaveValue("");
  expect(await dialog.locator(".gm-picker-row").count()).toBeGreaterThan(400);
  await type.selectOption("Armour & shields");
  await dialog
    .getByLabel("Trapping group", { exact: true })
    .selectOption("Leather");
  await dialog
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Leather Jack", { exact: true }) })
    .getByRole("button", { name: "Add", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('[id^="gear-gm-"]')).toContainText("Leather Jack");
  await open();
  await expect(type).toHaveValue("");
  await type.selectOption("Animals & transport");
  if (page.viewportSize().width <= 540)
    expect((await type.boundingBox()).width).toBeGreaterThan(280);
  await dialog
    .getByLabel("Trapping group", { exact: true })
    .selectOption("Boats");
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("equipment-boats.png") });
});

test("Skill and Talent pickers browse the complete list with explicit specialisations @gm", async ({
  page,
}, info) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  await page.getByRole("button", { name: "Add Skill", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "Add Skill", exact: true });
  await expect(
    dialog.locator(".gm-picker-row strong", { hasText: /^Art$/ }),
  ).toHaveCount(1);
  await expect(dialog.getByText("Art (Painting)", { exact: true })).toHaveCount(
    0,
  );
  await dialog
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Art", { exact: true }) })
    .getByRole("button", { name: "Choose…" })
    .click();
  dialog = page.getByRole("dialog", { name: "Choose Art", exact: true });
  await expect(
    dialog.getByRole("button", { name: "Add", exact: true }),
  ).toBeDisabled();
  await dialog
    .getByLabel("Specialisation", { exact: true })
    .selectOption({ label: "Art (Painting)" });
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("skill-specialisation.png") });
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Art (Painting) total", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add Talent", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "Add Talent", exact: true });
  expect(await dialog.locator(".gm-picker-row").count()).toBeGreaterThan(60);
  await expect(
    dialog.getByText("Type a more specific search to narrow this list."),
  ).toHaveCount(0);
  const talent = dialog
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Very Strong", { exact: true }) });
  await talent.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Very Strong ranks", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add Talent", exact: true }).click();
  await page.locator("#gm-picker-search").fill("Arcane Magic");
  await page
    .getByRole("dialog")
    .locator('.gm-picker-row:has([data-id="group:Arcane Magic"])')
    .getByRole("button", { name: "Choose…", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Specialisation", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to list", exact: true }).click();
  await expect(page.locator("#gm-picker-search")).toHaveValue("Arcane Magic");
  await noOverflow(page);
});
