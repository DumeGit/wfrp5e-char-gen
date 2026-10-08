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
