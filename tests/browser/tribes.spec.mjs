import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
} from "./helpers.mjs";

async function chooseTemplate(page, name) {
  await page
    .getByRole("button", { name: /^(Choose|Change) template$/ })
    .click();
  await page.locator("#gm-template-book").selectOption("tribes-tribulations");
  await page
    .locator("#gm-template-results .gm-picker-row")
    .filter({ has: page.getByText(name, { exact: true }) })
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Apply template", exact: true })
    .click();
}

test("Troll type, modifiers and printed Hag magic share desktop/mobile controls @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await expect(
    page.locator("label:has(#gm-book-tribes-tribulations)"),
  ).toContainText("19 profiles · 16 templates");
  await page.locator("#gm-book-tribes-tribulations").check();
  await applyProfile(page, "Basic Common Troll");
  await gmStep(page, "Customise");
  await chooseTemplate(page, "River Troll");
  await page.locator('[data-troll-modifier$="river-troll-hag"]').check();
  await expect(page.locator(".gm-template-bar")).toContainText(
    "River Troll Hag",
  );
  await page.locator("#gm-troll-modifiers").screenshot({
    path: test.info().outputPath("troll-modifiers.png"),
  });
  await page.locator('[data-troll-modifier$="hungry-troll"]').check();
  await noOverflow(page);
  await gmStep(page, "Equipment & magic");
  await expect(page.locator("#gm-magic")).toContainText("Caress of Laniph");
  await expect(page.locator("#gm-magic")).toContainText("Careful Step");
  await expect(page.locator("#gm-magic .gm-entry")).toHaveCount(9);
  await gmStep(page, "Customise");
  await chooseTemplate(page, "Stone Troll");
  await expect(
    page.locator('[data-troll-modifier$="river-troll-hag"]'),
  ).toBeDisabled();
  await expect(
    page.locator('[data-troll-modifier$="hungry-troll"]'),
  ).not.toBeChecked();
  await noOverflow(page);
});

test("Orc Shaman grants one Big Waaagh Lore and permits zero chosen spells @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await page.locator("#gm-book-tribes-tribulations").check();
  await applyProfile(page, "Basic Orc");
  await gmStep(page, "Customise");
  await chooseTemplate(page, "Shaman");
  await expect(page.locator(".gm-template-choices")).not.toContainText(
    "Choose up to",
  );
  await gmStep(page, "Equipment & magic");
  await expect(page.locator("#gm-magic")).toContainText("Up to 3 Big Waaagh!");
  await expect(page.locator("#gm-magic")).not.toContainText("Little Waaagh!");
  await page.getByRole("button", { name: "Choose magic", exact: true }).click();
  await noOverflow(page);
  await page.locator("#gm-picker-search").fill("Brainbursta");
  await expect(page.getByRole("dialog")).toContainText("Brainbursta");
});
