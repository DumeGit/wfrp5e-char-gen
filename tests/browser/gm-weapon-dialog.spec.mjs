import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
} from "./helpers.mjs";

const consoleErrors = new WeakMap();
test.beforeEach(({ page }) => {
  const errors = [];
  consoleErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});
test.afterEach(({ page }) => expect(consoleErrors.get(page)).toEqual([]));

async function openWeapon(page) {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Equipment & magic");
  await page
    .getByRole("button", { name: "Create weapon", exact: true })
    .click();
  return page.getByRole("dialog", { name: "Create weapon", exact: true });
}
async function chromeVisible(page, dialog) {
  const viewport = page.viewportSize();
  const bounds = await dialog.boundingBox();
  expect(bounds.y).toBeGreaterThanOrEqual(-1);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);
  for (const name of ["Close", "Cancel", "Add weapon"]) {
    const button = dialog.getByRole("button", { name, exact: true });
    const box = await button.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.y).toBeGreaterThanOrEqual(bounds.y);
    expect(box.y + box.height).toBeLessThanOrEqual(
      bounds.y + bounds.height + 1,
    );
  }
  await noOverflow(page);
}

test("weapon dialog keeps actions visible and discards unsaved changes on Close, Cancel and Escape @gm @interface @mobile", async ({
  page,
}, info) => {
  const dialog = await openWeapon(page);
  await expect(
    page.getByLabel("Search base weapons", { exact: true }),
  ).toBeFocused();
  await expect(
    dialog.getByRole("button", { name: "Add weapon", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("Search base weapons", { exact: true })
    .fill("zzzz-no-weapon");
  await expect(
    dialog.getByText(
      "No matching weapons. Clear the search or change a filter.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByLabel("Search base weapons", { exact: true }).fill("");
  await page
    .getByLabel("Published weapon", { exact: true })
    .selectOption("core:weapon:3");
  await expect(page.getByLabel("Weapon name", { exact: true })).toBeFocused();
  await expect(dialog.locator("#weapon-profile")).toHaveAttribute("open", "");
  await expect(dialog.locator("#weapon-properties")).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(dialog.locator("#weapon-notes-section")).not.toHaveAttribute(
    "open",
    "",
  );
  await page
    .getByLabel("Weapon name", { exact: true })
    .fill("Unsaved review sword");
  for (const [width, height] of info.project.name === "mobile"
    ? [
        [320, 844],
        [390, 844],
        [720, 480],
      ]
    : [
        [1440, 900],
        [1100, 650],
        [1440, 480],
      ]) {
    await page.setViewportSize({ width, height });
    await chromeVisible(page, dialog);
    await dialog.locator(".weapon-dialog-body").evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await chromeVisible(page, dialog);
    expect(
      await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    ).toBe(true);
  }
  await page.setViewportSize(
    info.project.name === "mobile"
      ? { width: 390, height: 844 }
      : { width: 1440, height: 900 },
  );
  await dialog.locator(".weapon-dialog-body").evaluate((node) => {
    node.scrollTop = 0;
  });
  await page.screenshot({ path: info.outputPath("weapon-dialog.png") });
  const add = dialog.getByRole("button", { name: "Add weapon", exact: true });
  await add.focus();
  await add.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close", exact: true }),
  ).toBeFocused();
  await dialog
    .getByRole("button", { name: "Close", exact: true })
    .press("Shift+Tab");
  await expect(add).toBeFocused();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Create weapon", exact: true }),
  ).toBeFocused();
  for (const method of ["Cancel", "Escape"]) {
    await page
      .getByRole("button", { name: "Create weapon", exact: true })
      .click();
    await expect(
      page.getByLabel("Search base weapons", { exact: true }),
    ).toBeFocused();
    await page
      .getByLabel("Published weapon", { exact: true })
      .selectOption("core:weapon:3");
    await expect(page.getByLabel("Weapon name", { exact: true })).toHaveValue(
      "Sword",
    );
    if (method === "Escape") await page.keyboard.press("Escape");
    else
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Create weapon", exact: true }),
    ).toBeFocused();
  }
  await expect(page.locator(".gm-attack-row")).toHaveCount(1);
});

test("weapon requirements reveal their controls and source reading retains the unfinished design @gm @interface @mobile", async ({
  page,
}, info) => {
  const dialog = await openWeapon(page);
  await page
    .getByLabel("Published weapon", { exact: true })
    .selectOption("core:weapon:3");
  await page
    .getByLabel("Weapon name", { exact: true })
    .fill("Source review sword");
  const damage = page.getByLabel("Damage formula", { exact: true });
  await damage.fill("SB+cats");
  await damage.press("Tab");
  await expect(damage).toHaveAttribute("aria-invalid", "true");
  await dialog.locator("#weapon-profile > summary").click();
  await dialog
    .getByRole("button", { name: "1 choice to finish", exact: true })
    .click();
  await expect(damage).toBeFocused();
  await damage.fill("SB+4");
  await dialog.locator("#weapon-properties > summary").click();
  await page
    .getByLabel("Add property", { exact: true })
    .selectOption({ label: "Fine · Core · p. 298" });
  await dialog
    .getByRole("button", { name: "Add property", exact: true })
    .click();
  const rating = page.getByLabel("Fine rating", { exact: true });
  await rating.fill("0");
  await dialog.locator("#weapon-properties > summary").click();
  await dialog
    .getByRole("button", { name: "1 choice to finish", exact: true })
    .click();
  await expect(rating).toBeFocused();
  await rating.fill("2");
  await page.getByRole("radio", { name: "Magical", exact: true }).check();
  await page
    .getByLabel("Magical ability", { exact: true })
    .selectOption("archives-ii:weapon-effect:of-bane");
  await dialog
    .getByRole("button", { name: "Add ability", exact: true })
    .click();
  await dialog.locator("#weapon-enchantments > summary").click();
  await dialog
    .getByRole("button", { name: "1 choice to finish", exact: true })
    .click();
  await expect(
    page.getByLabel("Bane creature target", { exact: true }),
  ).toBeFocused();
  await page.getByLabel("Bane creature target", { exact: true }).fill("Humans");
  await expect(
    dialog.getByRole("button", { name: "Add weapon", exact: true }),
  ).toBeEnabled();
  await dialog.locator("#weapon-notes-section > summary").click();
  await page
    .getByLabel("Printed weapon notes", { exact: true })
    .fill("Still an unsaved draft.");
  await dialog.getByText("Rules & crafting", { exact: true }).click();
  const source = dialog.getByRole("button", {
    name: "Read Crafting",
    exact: true,
  });
  await source.click();
  const reader = page.getByRole("dialog", {
    name: "Search the books",
    exact: true,
  });
  await expect(reader).toBeVisible();
  await reader
    .getByRole("button", { name: "Close search", exact: true })
    .click();
  await expect(source).toBeFocused();
  await expect(page.getByLabel("Weapon name", { exact: true })).toHaveValue(
    "Source review sword",
  );
  await expect(
    page.getByLabel("Printed weapon notes", { exact: true }),
  ).toHaveValue("Still an unsaved draft.");
  await page.screenshot({ path: info.outputPath("weapon-dialog-magical.png") });
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".gm-attack-row")).toHaveCount(1);
});
