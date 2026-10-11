import {
  test,
  expect,
  openPC,
  pcStep,
  PC_STORAGE,
  noOverflow,
} from "./helpers.mjs";

test("Origins starts without a Species, saves that state and supports choice and rolls @pc", async ({
  page,
}) => {
  await openPC(page, { species: "" });
  const species = page.getByLabel("Species", { exact: true });
  const expectAlignedSpeciesRoll = async () => {
    const selectBox = await species.boundingBox();
    const rollBox = await page
      .getByRole("button", { name: "Roll Species · d100", exact: true })
      .boundingBox();
    expect(Math.abs(selectBox.y - rollBox.y)).toBeLessThanOrEqual(1);
    expect(
      Math.abs(selectBox.y + selectBox.height - rollBox.y - rollBox.height),
    ).toBeLessThanOrEqual(1);
  };
  await expect(species).toHaveValue("");
  await expectAlignedSpeciesRoll();
  await expect(page.locator(".origin-resources")).toHaveCount(0);
  await expect(page.locator(".sheet .stat-grid")).toHaveCount(0);
  await page.reload();
  await expect(species).toHaveValue("");
  for (const step of [
    "Career",
    "Characteristics",
    "Skills",
    "Talents",
    "Gear & money",
    "Experience",
    "Review",
  ]) {
    await pcStep(page, step);
    await expect(
      page.getByRole("heading", {
        name: "Choose a Species first",
        exact: true,
      }),
    ).toBeVisible();
  }
  await pcStep(page, "Origins");
  await species.selectOption("Human");
  await page.getByRole("button", { name: "Apply change", exact: true }).click();
  await expect(species).toHaveValue("Human");
  await expectAlignedSpeciesRoll();
  await expect(page.locator(".origin-resources")).toContainText(
    "Starting Fate",
  );
  await pcStep(page, "Career");
  await expect(
    page.getByRole("heading", { name: "No Career selected", exact: true }),
  ).toBeVisible();
  await pcStep(page, "Origins");
  await species.selectOption("");
  await page.getByRole("button", { name: "Apply change", exact: true }).click();
  await expect(species).toHaveValue("");
  await page
    .getByRole("button", { name: "Roll Species · d100", exact: true })
    .click();
  await expect(species).not.toHaveValue("");
  await expect(
    page.getByText("+1 Fortune · first roll accepted", { exact: true }),
  ).toBeVisible();
  const saved = JSON.parse(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  );
  expect(saved.species).not.toBe("");
  expect(saved.speciesMode).toBe("first");
  expect(saved.rolls.at(-1).label).toBe("Species");
  await page.reload();
  await expect(species).toHaveValue(saved.species);
  await noOverflow(page);
});

test("point allocation starts blank, validates edits and survives reload/method changes @pc", async ({
  page,
}) => {
  await openPC(page);
  await pcStep(page, "Characteristics");
  const inputs = page.locator('[data-bind="points"]');
  const counter = page
    .locator(".counter")
    .filter({ hasText: "points allocated" });
  const ws = page.locator("#point-0");
  const bs = page.locator("#point-1");
  const commit = async (input, value) => {
    await input.fill(value);
    await input.press("Tab");
  };
  await expect(inputs).toHaveCount(10);
  for (const input of await inputs.all()) await expect(input).toHaveValue("");
  await expect(counter).toHaveText("0 / 100 points allocated");
  for (let i = 0; i < 10; i++) await commit(inputs.nth(i), "10");
  await expect(counter).toHaveText("100 / 100 points allocated");
  await expect(page.locator(".stage-meta .ready-status")).toBeVisible();
  await commit(ws, "16");
  await commit(bs, "14");
  await expect(counter).toHaveText("110 / 100 points allocated");
  await expect(page.locator(".stage-meta .pending-status")).toBeVisible();
  await commit(ws, "4");
  await commit(bs, "6");
  await expect(counter).toHaveText("90 / 100 points allocated");
  await expect(page.locator(".stage-meta .pending-status")).toBeVisible();
  await commit(bs, "16");
  for (const invalid of ["3", "17", "4.5"]) {
    await commit(ws, invalid);
    await expect(ws).toHaveValue("4");
    await expect(counter).toHaveText("100 / 100 points allocated");
  }
  await commit(ws, "");
  await expect(ws).toHaveValue("");
  await expect(counter).toHaveText("96 / 100 points allocated");
  await expect(page.locator(".stage-meta .pending-status")).toBeVisible();
  await page.reload();
  await expect(ws).toHaveValue("");
  await expect(counter).toHaveText("96 / 100 points allocated");
  await commit(ws, "4");
  await page
    .getByRole("button", { name: "Roll 10 × 2d10", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Allocate 100 points", exact: true })
    .click();
  await expect(ws).toHaveValue("4");
  await expect(bs).toHaveValue("16");
  await expect(counter).toHaveText("100 / 100 points allocated");
  await expect(page.locator(".stage-meta .ready-status")).toBeVisible();
  await noOverflow(page);
});

test("Career typing retains its caret and a roll populates the chosen Career @pc", async ({
  page,
}) => {
  await openPC(page);
  await pcStep(page, "Career");
  await expect(
    page.getByRole("heading", { name: "No Career selected", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "No Career selected", exact: true }),
  ).toBeVisible();
  for (const step of [
    "Characteristics",
    "Skills",
    "Talents",
    "Gear & money",
    "Experience",
    "Review",
  ]) {
    await pcStep(page, step);
    await noOverflow(page);
  }
  await pcStep(page, "Career");
  const input = page.getByLabel("Find a Career", { exact: true });
  await input.fill("Soldier");
  await input.press("Home");
  await input.press("ArrowRight");
  await input.pressSequentially("X");
  await expect(input).toHaveValue("SXoldier");
  await expect(input).toBeFocused();
  await expect.poll(() => input.evaluate((e) => e.selectionStart)).toBe(2);
  await page
    .getByRole("button", { name: "Roll Career · d100", exact: true })
    .click();
  const chosen = page.getByRole("region", {
    name: "Chosen Career",
    exact: true,
  });
  await expect.poll(() => input.inputValue()).not.toBe("SXoldier");
  const rolled = await input.inputValue();
  await expect(
    chosen.getByRole("heading", { name: rolled, exact: true }),
  ).toBeVisible();
  const saved = JSON.parse(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  );
  expect(saved.rolls.length).toBeGreaterThan(0);
  const roll = saved.rolls.at(-1);
  expect(roll.dice).toBe("1d100");
  expect(roll.values.every((n) => n >= 1 && n <= 100)).toBe(true);
  expect(roll.total).toBe(roll.values[0]);
});

test("buying and removing equipment adjusts the purse without awarding tracker boxes @pc", async ({
  page,
}) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Gear & money");
  await page.getByText("Shop · buy extra Trappings", { exact: true }).click();
  await page.getByLabel("Find equipment", { exact: true }).fill("Torch");
  await page.getByLabel("Sort", { exact: true }).selectOption("price-low");
  const item = page
    .locator(".market-item")
    .filter({ has: page.getByText("Torch (stick and rags)", { exact: true }) });
  const balance = page.locator(".market-balance strong");
  const before = await balance.allTextContents();
  await item.getByRole("button", { name: /Buy$/ }).click();
  await expect(
    page.locator(".market-purchase").filter({ hasText: "Torch" }),
  ).toBeVisible();
  expect(await balance.allTextContents()).not.toEqual(before);
  const saved = JSON.parse(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  );
  expect(saved.purchases).toHaveLength(1);
  expect(saved.ledger).toHaveLength(0);
  await page
    .getByRole("button", { name: "Remove Torch (stick and rags)", exact: true })
    .click();
  await expect(page.locator(".market-purchase")).toHaveCount(0);
  await expect(balance).toHaveText(before);
});
test("five individual Characteristic points earn one box; undo refunds XP and the box @pc", async ({
  page,
}) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Experience");
  await page.getByRole("button", { name: "+1", exact: true }).click();
  const row = page
    .locator(".xp-characteristic-row")
    .filter({ has: page.getByText("Weapon Skill", { exact: true }) });
  const balance = page.locator(".xp-balance .remaining strong");
  await expect(balance).toHaveText("1,000");
  for (let i = 1; i <= 5; i++) {
    await row.getByRole("button", { name: "25 XP", exact: true }).click();
    await expect(balance).toHaveText((1000 - i * 25).toLocaleString("en-US"));
    await expect(
      page.getByRole("img", {
        name: `${i < 5 ? 0 : 1} of 10 Career tracker boxes`,
        exact: true,
      }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(balance).toHaveText("900");
  await expect(
    page.getByRole("img", {
      name: "0 of 10 Career tracker boxes",
      exact: true,
    }),
  ).toBeVisible();
  const saved = JSON.parse(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  );
  expect(saved.ledger).toHaveLength(4);
  expect(saved.ledger.every((e) => e.amount === 1 && e.cost === 25)).toBe(true);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(balance).toHaveText("875");
  await expect(
    page.getByRole("img", {
      name: "1 of 10 Career tracker boxes",
      exact: true,
    }),
  ).toBeVisible();
  await noOverflow(page);
});
test("repeatable Talent purchase updates ranks and undo restores them @pc", async ({
  page,
}) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Experience");
  await page.getByRole("tab", { name: "Talents", exact: true }).click();
  const row = page.locator(".xp-talent-row").filter({ hasText: "Strong Back" });
  await row.getByRole("button", { name: "100 XP", exact: true }).click();
  await expect(row).toContainText("1 ranks owned");
  await row.getByRole("button", { name: "100 XP", exact: true }).click();
  await expect(
    page.locator(".known-talent").filter({ hasText: "Strong Back" }),
  ).toContainText("2 ranks owned");
  await expect(page.locator(".xp-balance .remaining strong")).toHaveText("800");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(row).toContainText("1 ranks owned");
  await expect(page.locator(".xp-balance .remaining strong")).toHaveText("900");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(
    page.locator(".known-talent").filter({ hasText: "Strong Back" }),
  ).toContainText("2 ranks owned");
  await expect(page.locator(".xp-balance .remaining strong")).toHaveText("800");
});
