import {
  test,
  expect,
  openPC,
  openGM,
  pcStep,
  gmStep,
  applyProfile,
  noOverflow,
} from "./helpers.mjs";

test("Sea origins and optional artillery reuse Player book and origin controls @pc @mobile", async ({
  page,
}) => {
  await openPC(page);
  await page
    .locator("#creator-main")
    .getByRole("button", { name: "Choose books", exact: true })
    .click();
  await page.locator('[data-book="sea-of-claws"]').check();
  await page.locator('[data-book="sea-of-claws-artillery"]').check();
  await page
    .getByRole("button", { name: "Use selected books", exact: true })
    .click();
  await page
    .locator("#regional-origin")
    .selectOption("sea-of-claws:origin:bjornling");
  await page.getByRole("button", { name: "Apply change", exact: true }).click();
  await expect(page.locator("main")).toContainText("Native languages: Norse");
  await expect(page.locator("#book-forename")).toContainText("Aeson");
  await pcStep(page, "Career");
  await expect(page.locator("#table-career")).toContainText(
    "Norse Human Careers",
  );
  await noOverflow(page);
});

test("Sea Elemental shows Strength magic and both artillery source alternatives @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await expect(page.locator("label:has(#gm-book-sea-of-claws)")).toContainText(
    "13 profiles · 0 templates",
  );
  await page.locator("#gm-book-sea-of-claws").check();
  await applyProfile(page, "Sea Elemental");
  await gmStep(page, "Customise");
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  await expect(page.locator("#creator-main")).toContainText(
    "Language (Magick)",
  );
  await expect(
    page.getByLabel("Language (Magick) total", { exact: true }),
  ).toHaveValue("69");
  await gmStep(page, "Equipment & magic");
  await expect(page.locator("#gm-magic")).toContainText("Living Mire");
  await expect(page.locator("#gm-magic")).toContainText("Whirlpool");
  await page
    .getByRole("button", { name: "Add equipment", exact: true })
    .click();
  await page.locator("#gm-picker-search").fill("Cannon (medium)");
  await expect(page.getByRole("dialog")).toContainText(
    "Cannon (medium) (Naval artillery)",
  );
  await expect(page.getByRole("dialog").locator(".gm-picker-row")).toHaveCount(
    2,
  );
  await noOverflow(page);
});

test("Leech Wyrm warns before export and accepts a persisted manual Vomit score @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  // A fresh Playwright context isolates this real autosave/reload check.
  await page.goto("/gm.html");
  await page.locator("#gm-book-sea-of-claws").check();
  await applyProfile(page, "Leech Wyrm");
  await expect(page.locator(".gm-issues")).toContainText(
    "Vomit needs an attack score",
  );
  await gmStep(page, "Equipment & magic");
  await page.getByLabel("Vomit attack score", { exact: true }).fill("40");
  await page.getByLabel("Vomit attack score", { exact: true }).press("Tab");
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByLabel("Vomit attack score", { exact: true }),
  ).toHaveValue("40");
  await noOverflow(page);
});
