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
    const input = await search(page, "Fortune");
    await page
      .getByRole("combobox", { name: "Search category", exact: true })
      .selectOption({ label: "Rules" });
    await page.getByRole("option", { name: /^Fortune Rule/ }).click();
    const reader = page.getByRole("region", { name: "Fortune", exact: true });
    await expect(
      reader.getByRole("heading", {
        name: "Replenishing Fortune",
        exact: true,
      }),
    ).toBeVisible();
    await noOverflow(page);
    await reader
      .getByRole("button", { name: "Back to search", exact: true })
      .click();
    await expect(input).toHaveValue("Fortune");
    await noOverflow(page);
  });
}
