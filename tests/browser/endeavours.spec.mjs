import { test, expect, search, noOverflow } from "./helpers.mjs";

test("Shared reader shows complete core Endeavours without duplicate overviews @search @mobile", async ({
  page,
}, info) => {
  await page.goto("/?verify=1");
  const input = await search(page);
  await page.locator("#book-search-category").selectOption("endeavour");
  const filters = page.locator(".search-category-filters");
  if (
    (await filters.isVisible()) &&
    !(await filters.evaluate((node) => node.open))
  )
    await filters.locator("summary").click();
  await page.locator("#book-search-book").selectOption("core");
  const results = page.locator("#book-search-results").getByRole("option");
  await expect(results).toHaveCount(18);
  await expect(results.filter({ hasText: "Common Endeavours" })).toHaveCount(0);

  await input.fill("Animal Training");
  await page
    .getByRole("option", { name: /^Animal Training Endeavour/ })
    .click();
  let reader = page.getByRole("region", {
    name: "Animal Training",
    exact: true,
  });
  await expect(reader).toContainText("p. 196");
  await expect(reader).toContainText("Average (+2 SL)");
  await expect(reader).toContainText("add one skill");
  await page
    .getByRole("button", { name: "Back to search", exact: true })
    .click();

  await input.fill("Invent");
  await page.getByRole("option", { name: /^Invent! Endeavour/ }).click();
  reader = page.getByRole("region", { name: "Invent!", exact: true });
  await expect(reader).toContainText("p. 199");
  await expect(reader).toContainText("twice");
  await expect(reader).toContainText("six times");
  await reader
    .getByRole("button", { name: "View Crafting reference", exact: true })
    .first()
    .click();
  reader = page.getByRole("region", { name: "Crafting", exact: true });
  await expect(reader).toBeVisible();
  await expect(reader.getByRole("table")).toHaveCount(2);
  await expect(reader).toContainText("Each Flaw halves");
  await expect(reader).toContainText("one roll towards the Extended Test");
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("core-crafting-reference.png"),
  });
  await page
    .getByRole("button", { name: "Back to search", exact: true })
    .click();

  await input.fill("Raise Reputation");
  await page
    .getByRole("option", { name: /^Raise Reputation Endeavour/ })
    .click();
  reader = page.getByRole("region", {
    name: "Raise Reputation",
    exact: true,
  });
  await expect(reader).toContainText("p. 200");
  await expect(reader).toContainText("Standing by +1");
  await page
    .getByRole("button", { name: "Back to search", exact: true })
    .click();

  await input.fill("Income");
  await page.getByRole("option", { name: /^Income Endeavour/ }).click();
  reader = page.getByRole("region", { name: "Income", exact: true });
  await expect(reader.getByRole("table")).toHaveCount(1);
  await expect(reader).toContainText("halve the result, rounding down");
  await expect(reader).toContainText(
    "1 brass penny, 1 silver shilling or 1 gold crown",
  );
  await page
    .getByRole("button", { name: "Back to search", exact: true })
    .click();

  await input.fill("Common Endeavours");
  await page.getByRole("option", { name: /^Endeavours Endeavour/ }).click();
  reader = page.getByRole("region", { name: "Endeavours", exact: true });
  await expect(reader).toContainText("one Endeavour per week");
  await expect(reader).toContainText("up to three");
  await noOverflow(page);
});
