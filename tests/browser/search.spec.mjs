import {
  test,
  expect,
  openPC,
  openGM,
  search,
  noOverflow,
} from "./helpers.mjs";

for (const creator of ["PC", "GM"]) {
  test(`${creator} keeps caret and resolves rapid edits @search`, async ({
    page,
  }) => {
    await (creator === "PC" ? openPC(page) : openGM(page));
    const input = await search(page, "Fortune");
    await input.press("Tab");
    await page
      .locator(".banner-search-field")
      .click({ position: { x: 4, y: 20 } });
    await expect(input).toBeFocused();
    await expect(
      page.getByRole("option", { name: /^Fortune Rule/ }),
    ).toBeVisible();
    await input.press("Home");
    await input.press("ArrowRight");
    await input.pressSequentially("X");
    await expect(input).toHaveValue("FXortune");
    await expect(input).toBeFocused();
    await expect.poll(() => input.evaluate((e) => e.selectionStart)).toBe(2);
    await input.fill("Burning");
    await input.fill("Fortune");
    await expect(
      page.getByRole("option", { name: /^Fortune Rule/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("option", { name: /^Burning Condition/ }),
    ).toHaveCount(0);
  });
  test(`${creator} appends Rules automatically and preserves the list on Back @search @mobile`, async ({
    page,
  }) => {
    await (creator === "PC" ? openPC(page) : openGM(page));
    await search(page);
    await page
      .getByRole("combobox", { name: "Search category", exact: true })
      .selectOption({ label: "Rules" });
    const list = page.getByRole("listbox", {
      name: "Matching rules",
      exact: true,
    });
    await expect(list.getByRole("option")).toHaveCount(20);
    await expect(
      page.getByRole("button", { name: "Load more results", exact: true }),
    ).toBeHidden();
    await list.getByRole("option").last().scrollIntoViewIfNeeded();
    await expect
      .poll(() => list.getByRole("option").count())
      .toBeGreaterThanOrEqual(40);
    const selected = list.getByRole("option").nth(25);
    const key = await selected.getAttribute("data-search-key");
    await selected.click();
    const reader = page.locator("#book-search-dialog");
    await expect(reader).toBeVisible();
    await reader
      .getByRole("button", { name: "Back to search", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Search category", exact: true }),
    ).toHaveValue("rule");
    await expect(list.locator(`[data-search-key="${key}"]`)).toBeVisible();
    await noOverflow(page);
  });
}

for (const creator of ["PC", "GM"]) {
  test(`${creator} searches inactive books and opens a rule with keyboard controls @search @mobile`, async ({
    page,
  }) => {
    await (creator === "PC" ? openPC(page) : openGM(page));
    const input = await search(page, "Godspakt");
    const category = page.getByRole("combobox", {
      name: "Search category",
      exact: true,
    });
    await expect(
      category.getByRole("option", {
        name: /^(NPCs?|Templates?|Creatures?)(?:$|\s*\/)/i,
      }),
    ).toHaveCount(0);
    await expect(page.getByRole("option", { name: /^Godspakt / })).toHaveCount(
      1,
    );
    await input.press("ArrowDown");
    await input.press("Enter");
    const reader = page.getByRole("region", { name: "Godspakt", exact: true });
    await expect(reader).toBeVisible();
    await expect(
      reader.getByRole("button", { name: /Use in the creator/ }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Search the books", exact: true }),
    ).toBeHidden();
    const launch = page.getByRole("button", {
      name: /^Search (rules and book references|books:)/,
    });
    if (await launch.isVisible()) {
      await expect(launch).toBeFocused();
      await launch.click();
    }
    await expect(input).toHaveValue("Godspakt");
    await expect(input).toBeFocused();
    await noOverflow(page);
  });
}
test("related rule links chain and return without changing the PC draft @search", async ({
  page,
}) => {
  await openPC(page);
  const before = await page.evaluate(() =>
    localStorage.getItem("wfrp-fifth-character-ledger-v2-verification"),
  );
  await search(page, "Bleeding");
  await page.getByRole("option", { name: /^Bleeding Condition/ }).click();
  const reader = page.locator("#book-search-dialog");
  await reader
    .getByRole("button", { name: "View Unconscious reference", exact: true })
    .first()
    .click();
  await expect(
    reader.getByRole("heading", { name: "Unconscious", exact: true }),
  ).toBeVisible();
  await reader
    .getByRole("button", { name: "Back to previous reference", exact: true })
    .click();
  await expect(
    reader.getByRole("heading", { name: "Bleeding", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("wfrp-fifth-character-ledger-v2-verification"),
    ),
  ).toBe(before);
});

async function categoryFilters(page, category) {
  await page
    .getByRole("combobox", { name: "Search category", exact: true })
    .selectOption(category);
  const details = page.locator(".search-category-filters");
  if (
    (await details.isVisible()) &&
    !(await details.evaluate((node) => node.open))
  )
    await details.locator("summary").click();
}
for (const creator of ["PC", "GM"]) {
  test(`${creator} combines filters in the shared workspace and remembers each category @search @mobile`, async ({
    page,
  }) => {
    await (creator === "PC" ? openPC(page) : openGM(page));
    await search(page);
    await expect(page.locator("#book-search-book option")).toHaveCount(12);
    await categoryFilters(page, "career");
    await page
      .getByRole("combobox", { name: "Class", exact: true })
      .selectOption("Warrior");
    await page
      .locator(".book-search-panel")
      .getByRole("combobox", { name: "Species", exact: true })
      .selectOption("Human");
    await page
      .getByRole("combobox", { name: "Book", exact: true })
      .selectOption("core");
    await expect(
      page.getByRole("option", { name: /^Soldier Career/ }),
    ).toBeAttached();
    await categoryFilters(page, "skill");
    await page
      .getByRole("combobox", { name: "Skill type", exact: true })
      .selectOption("Advanced");
    await page
      .getByRole("combobox", { name: "Characteristic", exact: true })
      .selectOption("Int");
    await page.locator("#book-search").fill("Lore (Magic)");
    await expect(
      page.getByRole("option", { name: /^Lore \(Magic\) Skill/ }),
    ).toBeAttached();
    await page.locator("#book-search").fill("");
    await categoryFilters(page, "career");
    await expect(
      page.getByRole("combobox", { name: "Class", exact: true }),
    ).toHaveValue("Warrior");
    await expect(
      page
        .locator(".book-search-panel")
        .getByRole("combobox", { name: "Species", exact: true }),
    ).toHaveValue("Human");
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Book", exact: true }),
    ).toHaveValue("");
    await categoryFilters(page, "rune");
    await page
      .getByRole("combobox", { name: "Rune label", exact: true })
      .selectOption("Master Rune");
    await page
      .getByRole("combobox", { name: "Applicable to", exact: true })
      .selectOption("Armour");
    const list = page.locator("#book-search-results");
    await expect(list.getByRole("option")).toHaveCount(3);
    await list.getByRole("option").first().click();
    await expect(page.locator("#book-search-dialog")).toBeVisible();
    await page
      .getByRole("button", { name: "Back to search", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Rune label", exact: true }),
    ).toHaveValue("Master Rune");
    await expect(list.getByRole("option")).toHaveCount(3);
    await page
      .getByRole("combobox", { name: "Applicable to", exact: true })
      .selectOption("Weapons");
    await page
      .getByRole("combobox", { name: "Rune label", exact: true })
      .selectOption("Armour Rune");
    await expect(page.locator("#book-search-empty")).toBeVisible();
    await page
      .getByRole("button", { name: /Remove Rune label filter:/ })
      .click();
    await expect(list.getByRole("option").first()).toBeVisible();
    await noOverflow(page);
  });
}
test("Cants and prayers share one searchable category, and load failure can be retried @search @mobile", async ({
  page,
}) => {
  await openPC(page);
  let failed = false;
  await page.route("**/data/search-library.json", (route) => {
    if (!failed) {
      failed = true;
      return route.abort();
    }
    return route.continue();
  });
  const launch = page.getByRole("button", {
    name: /^Search rules and book references/,
  });
  await launch.click();
  await page
    .getByRole("button", { name: "Retry loading book references", exact: true })
    .click();
  await expect(
    page
      .getByRole("combobox", { name: "Search category", exact: true })
      .getByRole("option", { name: "Rules", exact: true }),
  ).toBeAttached();
  await categoryFilters(page, "magic");
  await page
    .getByRole("combobox", { name: "Spell type", exact: true })
    .selectOption("Cant");
  await page
    .getByRole("combobox", { name: "Lore / Patron", exact: true })
    .selectOption("Fire");
  await expect(
    page.locator("#book-search-results").getByRole("option"),
  ).toHaveCount(3);
  await page
    .getByRole("combobox", { name: "Spell type", exact: true })
    .selectOption("Miracle");
  await page
    .getByRole("combobox", { name: "Lore / Patron", exact: true })
    .selectOption("Ranald");
  await page
    .getByRole("combobox", { name: "Search the books", exact: true })
    .fill("Cheat the Odds");
  await expect(
    page.getByRole("option", { name: /^Cheat the Odds/ }),
  ).toBeVisible();
  await noOverflow(page);
});
