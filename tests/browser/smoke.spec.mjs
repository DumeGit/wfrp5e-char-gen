import {
  test,
  expect,
  openPC,
  openGM,
  applyProfile,
  pcStep,
  gmStep,
  search,
  noOverflow,
} from "./helpers.mjs";

for (const creator of ["PC", "GM"]) {
  test(`${creator} opens, navigates and reads rules @smoke @mobile`, async ({
    page,
  }) => {
    if (creator === "PC") {
      await openPC(page);
      await pcStep(page, "Career");
      await expect(
        page.getByLabel("Find a Career", { exact: true }),
      ).toBeVisible();
    } else {
      await openGM(page);
      await applyProfile(page, "Human");
      await gmStep(page, "Customise");
      await expect(
        page.getByRole("button", { name: "Choose template", exact: true }),
      ).toBeVisible();
    }
    const input = await search(page, "Trained");
    await page
      .getByRole("combobox", { name: "Search category", exact: true })
      .selectOption({ label: "Creature Traits" });
    await page.getByRole("option", { name: /^Trained Creature Trait/ }).click();
    const reader = page.getByRole("region", { name: "Trained", exact: true });
    await expect(reader).toContainText("Trained");
    await noOverflow(page);
    await reader
      .getByRole("button", { name: "Back to search", exact: true })
      .click();
    await expect(input).toHaveValue("Trained");
    await noOverflow(page);
  });
}
