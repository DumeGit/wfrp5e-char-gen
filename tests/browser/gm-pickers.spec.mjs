import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
  gmDraft,
  fileUpload,
  downloadBytes,
} from "./helpers.mjs";

test("Trait descriptions have compact switches without On/Off text and retain the readable rule @gm @mobile", async ({
  page,
}, info) => {
  await openGM(page);
  await applyProfile(page, "Griffon");
  await gmStep(page, "Customise");
  await page.getByRole("tab", { name: "Traits", exact: true }).click();
  const toggle = page.getByRole("switch", {
    name: "Night Vision description",
    exact: true,
  });
  await expect(toggle).toBeChecked();
  const row = page.locator(".gm-ability-entry").filter({ has: toggle });
  await expect(row.locator(".gm-description-toggle")).toHaveText("Description");
  const bounds = await row.locator(".gm-description-toggle").boundingBox();
  expect(bounds.height).toBeGreaterThanOrEqual(44);
  expect((await toggle.boundingBox()).height).toBeLessThanOrEqual(18);
  await row.locator(".gm-description-toggle span").click();
  await expect(toggle).not.toBeChecked();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(toggle).toBeChecked();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(toggle).not.toBeChecked();
  await row.locator("summary").click();
  await expect(row.locator(".gm-detail-body")).toContainText("20 yards");
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeChecked();
  await page.keyboard.press("Space");
  await expect(toggle).not.toBeChecked();
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("trait-description-switch.png"),
  });
  await gmStep(page, "Review & export");
  const preview = page
    .locator(".gm-stat-block")
    .filter({ has: page.getByRole("heading", { name: /^Traits ·/ }) })
    .first();
  await expect(
    preview.locator("p").filter({
      has: page.locator("strong").filter({ hasText: /^Night Vision$/ }),
    }),
  ).toHaveText("Night Vision");
});

test("Talent descriptions retain ranks and survive saved draft round-trips @gm @mobile @storage", async ({
  page,
}, info) => {
  await openGM(page);
  const draft = await gmDraft();
  draft.talents = [
    {
      key: "gm-browser-strong-back",
      name: "Strong Back",
      ranks: 2,
      origin: "GM",
    },
  ];
  delete draft.hiddenDescriptions;
  const load = async (value) => {
    await fileUpload(
      page,
      page.getByRole("button", { name: "Load draft", exact: true }),
      value,
      "description-draft.json",
    );
    await page
      .getByRole("dialog", { name: "Load this GM draft?", exact: true })
      .getByRole("button", { name: "Load draft", exact: true })
      .click();
    await gmStep(page, "Customise");
    await page
      .getByRole("tab", { name: "Skills & Talents", exact: true })
      .click();
  };
  await load(draft);
  const toggle = page.getByRole("switch", {
    name: "Strong Back ×2 description",
    exact: true,
  });
  await expect(toggle).toBeChecked();
  await toggle.uncheck();
  const saved = await downloadBytes(
    page,
    page.getByRole("button", { name: "Save NPC / creature", exact: true }),
  );
  const exported = JSON.parse(saved.bytes);
  expect(exported.hiddenDescriptions).toEqual([
    "talent:gm-browser-strong-back",
  ]);
  await load(exported);
  await expect(toggle).not.toBeChecked();
  const row = page.locator(".gm-ability-entry").filter({ has: toggle });
  await expect(
    row.getByRole("spinbutton", { name: "Strong Back ranks", exact: true }),
  ).toHaveValue("2");
  await row.scrollIntoViewIfNeeded();
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("talent-description-switch.png"),
  });
  await gmStep(page, "Review & export");
  await expect(
    page
      .locator(".gm-stat-block p")
      .filter({
        has: page.locator("strong").filter({ hasText: /^Strong Back ×2$/ }),
      })
      .first(),
  ).toHaveText("Strong Back ×2");
});

test("optional printed equipment has compact full-label tap targets and native keyboard selection @gm @mobile", async ({
  page,
}, info) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Equipment & magic");
  const choices = page.locator(".gm-equipment-options");
  const labels = choices.locator("label");
  await expect(labels).toHaveCount(4);
  for (const label of await labels.all()) {
    const bounds = await label.boundingBox();
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeLessThanOrEqual(48);
    expect(
      (await label.locator("input").boundingBox()).width,
    ).toBeLessThanOrEqual(18);
  }
  const bow = labels.filter({ hasText: "Bow and Arrows" });
  const checkbox = bow.getByRole("checkbox");
  const bounds = await bow.boundingBox();
  await bow.click({ position: { x: bounds.width - 6, y: bounds.height / 2 } });
  await expect(checkbox).toBeChecked();
  await expect(
    page.locator(".gm-attack-row").filter({ hasText: "Bow and Arrows" }),
  ).toBeVisible();
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).not.toBeChecked();
  await expect(
    page.locator(".gm-attack-row").filter({ hasText: "Bow and Arrows" }),
  ).toHaveCount(0);
  await labels.filter({ hasText: "Light Armour" }).click();
  await labels.filter({ hasText: "Shield" }).click();
  await expect(choices.getByRole("checkbox", { checked: true })).toHaveCount(2);
  await noOverflow(page);
  await choices.screenshot({ path: info.outputPath("optional-equipment.png") });
});

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
  if (page.viewportSize().width > 1100) {
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

test("Skill and Talent pickers add multiple exact specialisations in one history action @gm @mobile", async ({
  page,
}, info) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  await page.getByRole("button", { name: "Add Skill", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add Skill", exact: true });
  await expect(
    dialog.getByRole("button", { name: "Add selected Skills", exact: true }),
  ).toBeDisabled();
  const art = dialog
    .locator("summary")
    .filter({ has: page.getByText("Art", { exact: true }) });
  await art.click();
  await dialog
    .getByRole("checkbox", { name: "Select Art (Painting)", exact: true })
    .check();
  await dialog
    .getByRole("checkbox", { name: "Select Art (Sculpture)", exact: true })
    .check();
  await dialog.getByLabel("Search skill", { exact: true }).fill("Intimidate");
  await dialog.getByText("Intimidate", { exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Add 3 Skills", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("spinbutton", { name: "Art (Painting) total", exact: true }),
  ).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("bulk-skills.png") });
  await dialog
    .getByRole("button", { name: "Add 3 Skills", exact: true })
    .click();
  for (const name of ["Art (Painting)", "Art (Sculpture)", "Intimidate"])
    await expect(
      page.getByRole("spinbutton", { name: `${name} total`, exact: true }),
    ).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  for (const name of ["Art (Painting)", "Art (Sculpture)", "Intimidate"])
    await expect(
      page.getByRole("spinbutton", { name: `${name} total`, exact: true }),
    ).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Art (Painting) total", exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Add Talent", exact: true }).click();
  const talents = page.getByRole("dialog", { name: "Add Talent", exact: true });
  expect(
    await talents
      .locator(".gm-bulk-results > .gm-bulk-choice, .gm-bulk-group")
      .count(),
  ).toBeGreaterThan(60);
  await talents
    .getByLabel("Search talent", { exact: true })
    .fill("Very Strong");
  await talents
    .getByRole("checkbox", { name: "Select Very Strong", exact: true })
    .check();
  await talents
    .getByLabel("Search talent", { exact: true })
    .fill("Strong Back");
  await talents
    .getByRole("checkbox", { name: "Select Strong Back", exact: true })
    .check();
  await page.screenshot({ path: info.outputPath("bulk-talents.png") });
  await talents
    .getByRole("button", { name: "Add 2 Talents", exact: true })
    .click();
  await expect(
    page.getByRole("spinbutton", { name: "Very Strong ranks", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("spinbutton", { name: "Strong Back ranks", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Very Strong ranks", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("spinbutton", { name: "Strong Back ranks", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  const json = JSON.parse(
    (
      await downloadBytes(
        page,
        page.getByRole("button", { name: "Save NPC / creature", exact: true }),
      )
    ).bytes,
  );
  expect(
    json.skills.filter((x) =>
      ["Art (Painting)", "Art (Sculpture)", "Intimidate"].includes(x.name),
    ),
  ).toHaveLength(3);
  expect(
    json.talents.filter((x) => ["Very Strong", "Strong Back"].includes(x.name)),
  ).toHaveLength(2);
  await page.getByRole("button", { name: "Add Talent", exact: true }).click();
  await talents
    .getByLabel("Search talent", { exact: true })
    .fill("Very Strong");
  await expect(
    talents.getByRole("checkbox", { name: "Select Very Strong", exact: true }),
  ).toBeDisabled();
  await talents.getByLabel("Search talent", { exact: true }).fill("Hardy");
  await talents
    .getByRole("checkbox", { name: "Select Hardy", exact: true })
    .check();
  await talents.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Hardy ranks", exact: true }),
  ).toHaveCount(0);
});
