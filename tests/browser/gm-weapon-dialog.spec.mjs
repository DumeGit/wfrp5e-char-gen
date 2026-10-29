import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
} from "./helpers.mjs";

async function openWeapon(page) {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Equipment & magic");
  await page
    .getByRole("button", { name: "Create weapon", exact: true })
    .click();
  return page.getByRole("dialog", { name: "Create weapon", exact: true });
}
async function chooseBase(page) {
  await page.getByLabel("Find a base weapon", { exact: true }).fill("Sword");
  await page
    .getByRole("button", { name: "Choose Sword · Core · p. 301", exact: true })
    .click();
}
async function section(page, name) {
  await page
    .getByRole("navigation", { name: "Weapon sections" })
    .getByRole("button", { name: new RegExp(`^${name}`) })
    .click();
}
test("weapon names open exact references from catalogues and selected items @gm @interface @mobile", async ({
  page,
}, info) => {
  const dialog = await openWeapon(page);
  await chooseBase(page);
  await page
    .getByLabel("Weapon name", { exact: true })
    .fill("Reference-linked sword");
  const reader = page.getByRole("dialog", {
    name: "Search the books",
    exact: true,
  });
  async function readName(button, name, text, chain = false) {
    await button.click();
    await expect(
      reader.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(reader.locator("#book-search-body")).toContainText(text);
    if (chain) {
      await reader
        .getByRole("button", { name: "View Ablaze reference", exact: true })
        .click();
      await expect(
        reader.getByRole("heading", { name: "Ablaze", exact: true }),
      ).toBeVisible();
      await reader
        .getByRole("button", {
          name: "Back to previous reference",
          exact: true,
        })
        .click();
      await expect(
        reader.getByRole("heading", { name, exact: true }),
      ).toBeVisible();
    }
    await reader
      .getByRole("button", { name: "Close search", exact: true })
      .click();
    await expect(button).toBeFocused();
  }
  await section(page, "Properties");
  await page.getByLabel("Find a property", { exact: true }).fill("Fast");
  await readName(
    dialog
      .getByRole("region", { name: "Property library" })
      .getByRole("button", { name: "Read Fast", exact: true }),
    "Fast",
    "Add 20 to combat initiative",
  );
  await dialog
    .getByRole("button", { name: "Add Fast property", exact: true })
    .click();
  await readName(
    dialog
      .locator(".weapon-property")
      .getByRole("button", { name: "Read Fast", exact: true }),
    "Fast",
    "Add 20 to combat initiative",
  );
  await expect(dialog.locator(".weapon-property summary")).toHaveCount(0);
  await expect(dialog.getByText("Read rule", { exact: true })).toHaveCount(0);

  await section(page, "Power");
  await page.getByRole("radio", { name: "Magical", exact: true }).check();
  await page.getByLabel("Find an enchantment", { exact: true }).fill("Alight");
  await readName(
    dialog.getByRole("button", { name: "Read Alight with Flame", exact: true }),
    "Alight with Flame",
    "flammable target",
    true,
  );
  await dialog
    .getByRole("button", {
      name: "Add Alight with Flame enchantment",
      exact: true,
    })
    .click();
  await readName(
    dialog
      .locator(".weapon-property")
      .getByRole("button", { name: "Read Alight with Flame", exact: true }),
    "Alight with Flame",
    "flammable target",
  );
  await page.getByRole("radio", { name: "Runic", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Change power", exact: true })
    .click();
  await page.getByLabel("Find a rune", { exact: true }).fill("Cleaving");
  await readName(
    dialog.getByRole("button", { name: "Read Rune of Cleaving", exact: true }),
    "Rune of Cleaving",
    "+1 Damage",
  );
  await dialog
    .getByRole("button", { name: "Inscribe Rune of Cleaving", exact: true })
    .click();
  await readName(
    dialog
      .locator(".weapon-property")
      .getByRole("button", { name: "Read Rune of Cleaving", exact: true }),
    "Rune of Cleaving",
    "+1 Damage",
  );
  await expect(
    page.getByLabel("Rune of Cleaving inscriptions", { exact: true }),
  ).toHaveValue("1");
  await page.screenshot({
    path: info.outputPath("weapon-reference-names.png"),
  });
  await section(page, "Details");
  await expect(page.getByLabel("Weapon name", { exact: true })).toHaveValue(
    "Reference-linked sword",
  );
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".gm-attack-row")).toHaveCount(1);
});
async function chromeVisible(page, dialog) {
  const viewport = page.viewportSize();
  const bounds = await dialog.boundingBox();
  expect(bounds.y).toBeGreaterThanOrEqual(-1);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);
  for (const name of ["Close", "Cancel", "Add weapon"]) {
    const box = await dialog
      .getByRole("button", { name, exact: true })
      .boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.y).toBeGreaterThanOrEqual(bounds.y);
    expect(box.y + box.height).toBeLessThanOrEqual(
      bounds.y + bounds.height + 1,
    );
  }
  expect(
    await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
  ).toBe(true);
  await noOverflow(page);
}

test("weapon builder searches, edits and discards with keyboard and responsive actions @gm @interface @mobile", async ({
  page,
}, info) => {
  const dialog = await openWeapon(page);
  const search = page.getByLabel("Find a base weapon", { exact: true });
  await expect(search).toBeFocused();
  await search.fill("zzzz-no-weapon");
  await expect(
    dialog.getByRole("heading", { name: "No weapons match", exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.screenshot({ path: info.outputPath("weapon-catalogue.png") });
  await chooseBase(page);
  const name = page.getByLabel("Weapon name", { exact: true });
  await expect(name).toBeFocused();
  await expect(dialog.locator("#weapon-profile")).toBeHidden();
  await name.fill("Watch captain’s blade");
  await page
    .getByLabel("Printed weapon notes", { exact: true })
    .fill("A blade carried on the night watch.");
  await dialog
    .getByRole("button", { name: "Change base", exact: true })
    .click();
  await search.fill("Bow");
  await dialog
    .getByRole("button", {
      name: "Choose Bow (2H) · Core · p. 303",
      exact: true,
    })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Replace base", exact: true }),
  ).toBeFocused();
  await dialog
    .getByRole("button", { name: "Keep current base", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Back to weapon", exact: true })
    .click();
  await expect(name).toHaveValue("Watch captain’s blade");
  await section(page, "Properties");
  await expect(
    page.getByLabel("Find a property", { exact: true }),
  ).toBeVisible();
  await section(page, "Details");
  await expect(name).toHaveValue("Watch captain’s blade");
  for (const [width, height] of info.project.name === "mobile"
    ? [
        [320, 844],
        [390, 844],
        [720, 480],
      ]
    : [
        [1440, 900],
        [1280, 720],
        [1100, 650],
        [1440, 480],
      ]) {
    await page.setViewportSize({ width, height });
    await chromeVisible(page, dialog);
    if (width === 320 || width === 1280)
      await page.screenshot({ path: info.outputPath(`weapon-${width}.png`) });
  }
  await page.setViewportSize(
    info.project.name === "mobile"
      ? { width: 390, height: 844 }
      : { width: 1440, height: 900 },
  );
  await page.screenshot({ path: info.outputPath("weapon-builder.png") });
  const add = dialog.getByRole("button", { name: "Add weapon", exact: true });
  await add.focus();
  await add.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(add).toBeFocused();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Create weapon", exact: true }),
  ).toBeFocused();
  for (const method of ["Cancel", "Escape"]) {
    await page
      .getByRole("button", { name: "Create weapon", exact: true })
      .click();
    await chooseBase(page);
    await expect(name).toHaveValue("Sword");
    if (method === "Escape") await page.keyboard.press("Escape");
    else
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toHaveCount(0);
  }
  await expect(page.locator(".gm-attack-row")).toHaveCount(1);
});

test("weapon builder returns to invalid fields and preserves work through source reading @gm @interface @mobile", async ({
  page,
}, info) => {
  const dialog = await openWeapon(page);
  await chooseBase(page);
  await page
    .getByLabel("Weapon name", { exact: true })
    .fill("Source review sword");
  await dialog
    .getByRole("button", { name: "Edit profile", exact: true })
    .click();
  const damage = page.getByLabel("Damage formula", { exact: true });
  await damage.fill("SB+cats");
  await damage.press("Tab");
  await expect(damage).toHaveAttribute("aria-invalid", "true");
  await section(page, "Review");
  await dialog
    .getByRole("button", { name: "1 choice to finish", exact: true })
    .click();
  await expect(damage).toBeFocused();
  await damage.fill("SB+4");
  await section(page, "Properties");
  await dialog
    .getByRole("button", { name: "Craftsmanship", exact: true })
    .click();
  await page.getByLabel("Find a property", { exact: true }).fill("Fine");
  await dialog
    .getByRole("button", { name: /^Add Fine/ })
    .first()
    .click();
  const rating = page.getByLabel("Fine rating", { exact: true });
  await rating.fill("0");
  await section(page, "Review");
  await dialog
    .getByRole("button", { name: "1 choice to finish", exact: true })
    .click();
  await expect(rating).toBeFocused();
  await rating.fill("2");
  await section(page, "Power");
  await page.getByRole("radio", { name: "Magical", exact: true }).check();
  await page.getByLabel("Find an enchantment", { exact: true }).fill("Of Bane");
  await dialog
    .getByRole("button", { name: "Add Of Bane enchantment", exact: true })
    .click();
  await section(page, "Review");
  await dialog
    .getByRole("button", { name: "1 choice to finish", exact: true })
    .click();
  await expect(
    page.getByLabel("Bane creature target", { exact: true }),
  ).toBeFocused();
  await page.getByLabel("Bane creature target", { exact: true }).fill("Humans");
  await section(page, "Details");
  await page
    .getByLabel("Printed weapon notes", { exact: true })
    .fill("Still an unsaved draft.");
  await section(page, "Review");
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
  await expect(
    dialog.getByRole("article", { name: "Weapon preview" }),
  ).toContainText("Still an unsaved draft.");
  await page.screenshot({ path: info.outputPath("weapon-review.png") });
  await expect(
    dialog.getByRole("button", { name: "Add weapon", exact: true }),
  ).toBeEnabled();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".gm-attack-row")).toHaveCount(1);
});
