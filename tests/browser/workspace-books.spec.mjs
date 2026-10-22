import {
  test,
  expect,
  openGM,
  openPC,
  gmStep,
  revealCreatorTool,
  fileUpload,
  search,
  PC_STORAGE,
} from "./helpers.mjs";

test("Bestiary menu opens its real profile-book disclosure and restores keyboard focus @interface @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await gmStep(page, "Customise");
  const command = page.getByRole("button", {
    name: "Choose profile books",
    exact: true,
  });
  await revealCreatorTool(page, command);
  await command.click();
  await expect(
    page.getByRole("heading", { name: "Starting profile", exact: true }),
  ).toBeVisible();
  const books = page.locator('[data-detail-key="gm:profile-books"]');
  await expect(books).toHaveAttribute("open", "");
  await expect(books.locator(":scope > summary")).toBeFocused();
  await expect(books.getByRole("checkbox").first()).toBeVisible();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});

test("a rejected menu import cannot capture a later reference dialog @interface @storage @mobile", async ({
  page,
}) => {
  await openPC(page, { complete: true });
  const before = await page.evaluate(
    (key) => localStorage.getItem(key),
    PC_STORAGE,
  );
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load character", exact: true }),
    { type: "wrong-workspace" },
    "invalid.json",
  );
  await expect(page.locator("#toast")).not.toBeEmpty();
  await search(page, "Trained");
  await page.getByRole("button", { name: "Close search", exact: true }).click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  ).toBe(before);
});

test("drawer page navigation focuses its real heading and preserves the editing surface @interface @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Open creator menu", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Creator menu", exact: true })
    .getByRole("button", { name: /Customise/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Customise", exact: true }),
  ).toBeFocused();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Workshop page", exact: true })
    .selectOption({ label: "Starting profile" });
  await expect(
    page.getByRole("heading", { name: "Starting profile", exact: true }),
  ).toBeFocused();
});
