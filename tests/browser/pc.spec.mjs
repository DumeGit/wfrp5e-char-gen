import {
  test,
  expect,
  openPC,
  pcStep,
  PC_STORAGE,
  noOverflow,
} from "./helpers.mjs";

test("Career typing retains its caret and a roll populates the chosen Career @pc", async ({
  page,
}) => {
  await openPC(page);
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
  await page
    .getByRole("button", { name: "Undo last: WS +1", exact: true })
    .click();
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
  await page
    .getByRole("button", { name: "Undo last: Strong Back", exact: true })
    .click();
  await expect(row).toContainText("1 ranks owned");
  await expect(page.locator(".xp-balance .remaining strong")).toHaveText("900");
});
