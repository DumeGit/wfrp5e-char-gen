import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
} from "./helpers.mjs";

test("Skill and Talent pickers browse the complete list with explicit specialisations @gm", async ({
  page,
}, info) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  await page.getByRole("button", { name: "Add Skill", exact: true }).click();
  let dialog = page.getByRole("dialog", { name: "Add Skill", exact: true });
  await expect(
    dialog.locator(".gm-picker-row strong", { hasText: /^Art$/ }),
  ).toHaveCount(1);
  await expect(dialog.getByText("Art (Painting)", { exact: true })).toHaveCount(
    0,
  );
  await dialog
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Art", { exact: true }) })
    .getByRole("button", { name: "Choose…" })
    .click();
  dialog = page.getByRole("dialog", { name: "Choose Art", exact: true });
  await expect(
    dialog.getByRole("button", { name: "Add", exact: true }),
  ).toBeDisabled();
  await dialog
    .getByLabel("Specialisation", { exact: true })
    .selectOption({ label: "Art (Painting)" });
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("skill-specialisation.png") });
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Art (Painting) total", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add Talent", exact: true }).click();
  dialog = page.getByRole("dialog", { name: "Add Talent", exact: true });
  expect(await dialog.locator(".gm-picker-row").count()).toBeGreaterThan(60);
  await expect(
    dialog.getByText("Type a more specific search to narrow this list."),
  ).toHaveCount(0);
  const talent = dialog
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Very Strong", { exact: true }) });
  await talent.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Very Strong ranks", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add Talent", exact: true }).click();
  await page.locator("#gm-picker-search").fill("Arcane Magic");
  await page
    .getByRole("dialog")
    .locator('.gm-picker-row:has([data-id="group:Arcane Magic"])')
    .getByRole("button", { name: "Choose…", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Specialisation", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to list", exact: true }).click();
  await expect(page.locator("#gm-picker-search")).toHaveValue("Arcane Magic");
  await noOverflow(page);
});
