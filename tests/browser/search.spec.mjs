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
    const reader = page.getByRole("dialog", { name: "Godspakt", exact: true });
    await expect(reader).toBeVisible();
    await expect(
      reader.getByRole("button", { name: /Use in the creator/ }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(reader).toBeHidden();
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
