import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
} from "./helpers.mjs";

test("profile notification clears and editing keeps focus @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await applyProfile(page, "Human");
  const name = page.getByRole("textbox", { name: "Name", exact: true });
  await name.fill("Test Guard");
  await name.press("Home");
  await name.pressSequentially("A ");
  await expect(name).toHaveValue("A Test Guard");
  await expect(name).toBeFocused();
  await expect.poll(() => name.evaluate((e) => e.selectionStart)).toBe(2);
  await expect(
    page.getByText(
      "Printed profile applied. You can use it immediately or customise it.",
      { exact: true },
    ),
  ).toHaveCount(0);
  await noOverflow(page);
});
test("template preview applies and can be removed and undone @gm", async ({
  page,
}) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page
    .getByRole("button", { name: "Choose template", exact: true })
    .click();
  const picker = page.getByRole("dialog", {
    name: "Choose a core template",
    exact: true,
  });
  await picker
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Soldier", { exact: true }) })
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  const preview = page.getByRole("dialog", { name: "Soldier", exact: true });
  await expect(
    preview.getByRole("heading", { name: "Characteristics", exact: true }),
  ).toBeVisible();
  await expect(
    preview.getByRole("heading", { name: "Skills", exact: true }),
  ).toBeVisible();
  await preview
    .getByRole("button", { name: "Apply template", exact: true })
    .click();
  await expect(page.locator(".gm-template-bar")).toContainText("Soldier");
  await page
    .getByRole("button", { name: "Remove template", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Choose template", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "↶ Undo last change", exact: true })
    .click();
  await expect(page.locator(".gm-template-bar")).toContainText("Soldier");
});
test("Tiny warns before export, routes to Wounds and resolves after a manual value @gm", async ({
  page,
}) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page
    .getByLabel("Size", { exact: true })
    .selectOption({ label: "Tiny" });
  const issues = page.getByRole("region", {
    name: "Choices to finish",
    exact: true,
  });
  await expect(issues).toContainText("Tiny");
  await gmStep(page, "Review & export");
  await expect(
    page.getByRole("button", { name: "Export PDF", exact: true }),
  ).toBeDisabled();
  await issues.getByRole("button", { name: /Tiny/ }).click();
  const wounds = page.getByLabel("Wounds override", { exact: true });
  await expect(wounds).toBeFocused();
  await wounds.fill("3");
  await wounds.press("Tab");
  await gmStep(page, "Review & export");
  await expect(
    page.getByRole("button", { name: "Export PDF", exact: true }),
  ).toBeEnabled();
});

test("Up in Arms mounts are opt-in and alphabetically sorted; Legacy and training work on mobile @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await expect(page.locator(".gm-profile-card")).toHaveCount(53);
  await page.locator("#gm-book-up-in-arms").check();
  await expect(page.locator(".gm-profile-card")).toHaveCount(55);
  const names = await page
    .locator(".gm-profile-card > strong")
    .allTextContents();
  expect(names).toEqual(
    [...names].sort((a, b) =>
      a.localeCompare(b, "en", { sensitivity: "base" }),
    ),
  );
  expect(names).not.toContain("Destrier — Heavy Warhorse");
  await applyProfile(page, "Riding Horse");
  await page
    .locator(".gm-foundation")
    .getByRole("button", { name: "Read Riding Horse adaptation" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("printed +6 becomes +9");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await gmStep(page, "Customise");
  await page.getByRole("tab", { name: "Traits", exact: true }).click();
  const training = page.locator(".gm-training");
  await training
    .getByRole("checkbox", { name: "Shock Cavalry", exact: true })
    .check();
  const issues = page.getByRole("region", { name: "Choices to finish" });
  await expect(issues).toContainText("requires Trained (War)");
  await issues.getByRole("button").click();
  await expect(training).toBeFocused();
  await training.getByRole("checkbox", { name: "War", exact: true }).check();
  await expect(issues).toHaveCount(0);
  await gmStep(page, "Review & export");
  await expect(
    page.getByRole("button", { name: "Export PDF", exact: true }),
  ).toBeEnabled();
  await noOverflow(page);
});

test("removing a mount book requires explicit reset and undo restores its selection @gm", async ({
  page,
}) => {
  await openGM(page);
  await page.locator("#gm-book-up-in-arms").check();
  await applyProfile(page, "Demigryph Mount");
  await expect(page.locator("#gm-folio")).toContainText("Forelegs");
  await page.locator("#gm-book-up-in-arms").click();
  const confirm = page.getByRole("dialog", { name: "Remove Up in Arms?" });
  await confirm.getByRole("button", { name: "Keep book", exact: true }).click();
  await expect(page.locator("#gm-book-up-in-arms")).toBeChecked();
  await page.locator("#gm-book-up-in-arms").click();
  await confirm
    .getByRole("button", { name: "Remove book & start new", exact: true })
    .click();
  await expect(page.locator(".gm-profile-card")).toHaveCount(53);
  await page
    .getByRole("button", { name: "↶ Undo last change", exact: true })
    .click();
  await expect(page.locator(".gm-foundation")).toContainText("Demigryph Mount");
  await expect(page.locator("#gm-book-up-in-arms")).toBeChecked();
  await gmStep(page, "Equipment & magic");
  await page
    .getByRole("button", { name: "Add equipment", exact: true })
    .click();
  await page.locator("#gm-picker-search").fill("Leather Leggings");
  await page
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Leather Leggings", { exact: true }) })
    .getByRole("button", { name: "Add", exact: true })
    .click();
  const issue = page
    .getByRole("region", { name: "Choices to finish" })
    .getByRole("button", { name: /humanoid limb/ });
  await issue.click();
  await expect(page.locator('[id^="gear-gm-"]')).toBeFocused();
  await page
    .locator('[id^="gear-gm-"]')
    .getByRole("button", { name: "Remove this entry", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Choices to finish" }),
  ).toHaveCount(0);
  await noOverflow(page);
});
