import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
  downloadBytes,
  fileUpload,
} from "./helpers.mjs";

test("magical rolls resolve Legendary follow-ups and Hoarfrost ammunition before atomic addition @gm @mobile", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = crypto.getRandomValues.bind(crypto);
    window.weaponTestFaces = [];
    crypto.getRandomValues = (array) => {
      if (
        array instanceof Uint32Array &&
        array.length === 1 &&
        window.weaponTestFaces.length
      ) {
        array[0] = window.weaponTestFaces.shift() - 1;
        return array;
      }
      return original(array);
    };
  });
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Equipment & magic");
  await page
    .getByRole("button", { name: "Create weapon", exact: true })
    .click();
  const form = page.locator(".weapon-workbench");
  await page.locator("#weapon-base").selectOption("core:weapon:3");
  await page
    .getByLabel("Weapon name", { exact: true })
    .fill("Legendary test sword");
  await page.getByRole("radio", { name: "Magical", exact: true }).check();
  await page.evaluate(() => {
    window.weaponTestFaces = [100, 25, 64];
  });
  await form
    .getByRole("button", { name: "Roll enchantment", exact: true })
    .click();
  await expect(form).toContainText("Legendary weapon · 2/5 abilities");
  await expect(form).toContainText("Alight with Flame");
  await expect(form).toContainText("Of Deft and Cunning");
  await form.getByRole("button", { name: "Add weapon", exact: true }).click();
  await page
    .getByRole("button", { name: "Create weapon", exact: true })
    .click();
  await page.locator("#weapon-base").selectOption("core:weapon:28");
  await page.getByRole("radio", { name: "Magical", exact: true }).check();
  await page.evaluate(() => {
    window.weaponTestFaces = [99, 4];
  });
  await form
    .getByRole("button", { name: "Roll enchantment", exact: true })
    .click();
  await expect(
    page.getByLabel("Hoarfrost ammunition quantity", { exact: true }),
  ).toHaveValue("4");
  await form.getByRole("button", { name: "Add weapon", exact: true }).click();
  const ammo = page
    .locator(".gm-entry")
    .filter({ hasText: "Hoarfrost ammunition for Bow" });
  await expect(ammo.getByRole("spinbutton")).toHaveValue("4");
  const saved = JSON.parse(
    (
      await downloadBytes(
        page,
        page.getByRole("button", { name: "Save NPC / creature", exact: true }),
      )
    ).bytes.toString(),
  );
  expect(saved.customWeapons).toHaveLength(2);
  expect(saved.customWeapons[0].rolls.map((r) => r.face)).toEqual([
    100, 25, 64,
  ]);
  expect(saved.customWeapons[1].rolls.map((r) => r.face)).toEqual([99, 4]);
  expect(saved.customWeapons[1].ammunition).toBe(4);
  await ammo
    .getByRole("button", { name: "Remove this entry", exact: true })
    .click();
  await expect(ammo).toHaveCount(0);
  await expect(
    page
      .locator(".gm-attack-row")
      .filter({ has: page.getByText("Bow (2H)", { exact: true }) }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(ammo.getByRole("spinbutton")).toHaveValue("4");
});

test("weapon workbench creates and edits an independent weapon with history and JSON round-trip @gm @mobile @storage", async ({
  page,
}, info) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Equipment & magic");
  const before = await page.locator(".gm-attack-row").count();
  await page
    .getByRole("button", { name: "Create weapon", exact: true })
    .click();
  const form = page.locator(".weapon-workbench");
  await page.locator("#weapon-base").selectOption("core:weapon:3");
  await page
    .getByLabel("Weapon name", { exact: true })
    .fill("Watch Captain’s blade");
  await page.getByLabel("Damage formula", { exact: true }).fill("SB+5");
  await form.getByText("Notes & references", { exact: true }).click();
  await page
    .getByLabel("Printed weapon notes", { exact: true })
    .fill("Etched with the captain’s seal.");
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("ordinary-workbench.png") });
  await form.getByRole("button", { name: "Add weapon", exact: true }).click();
  await expect(form).toHaveCount(0);
  await expect(page.locator(".gm-attack-row")).toHaveCount(before + 1);
  const row = page
    .locator(".gm-attack-row")
    .filter({ hasText: "Watch Captain’s blade" });
  await expect(row).toContainText("Custom · Based on Sword");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".gm-attack-row")).toHaveCount(before);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await row.getByRole("button", { name: /Edit .* weapon/ }).click();
  await page.getByLabel("Damage formula", { exact: true }).fill("SB+6");
  await form.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(row).toContainText("Etched with the captain’s seal.");
  const editWeapon = row.getByRole("button", { name: /Edit .* weapon/ });
  await expect(editWeapon).toBeFocused();
  await editWeapon.click();
  await page.getByLabel("Damage formula", { exact: true }).fill("SB+99");
  await page
    .getByRole("dialog", { name: "Edit weapon", exact: true })
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(editWeapon).toBeFocused();
  const saved = await downloadBytes(
    page,
    page.getByRole("button", { name: "Save NPC / creature", exact: true }),
  );
  const json = JSON.parse(saved.bytes.toString());
  expect(json.customWeapons).toHaveLength(1);
  expect(json.customWeapons[0].damage).toBe("SB+6");
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load draft", exact: true }),
    json,
    "custom-weapon.json",
  );
  await page
    .getByRole("dialog", { name: "Load this GM draft?", exact: true })
    .getByRole("button", { name: "Load draft", exact: true })
    .click();
  await gmStep(page, "Equipment & magic");
  await expect(
    page.locator(".gm-attack-row").filter({ hasText: "Watch Captain’s blade" }),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "Create weapon", exact: true })
    .click();
  await page.locator("#weapon-base").selectOption("core:weapon:3");
  await page
    .getByLabel("Weapon name", { exact: true })
    .fill("Cancelled weapon");
  await form
    .getByRole("button", { name: "Cancel", exact: true })
    .last()
    .click();
  await expect(
    page.locator(".gm-attack-row").filter({ hasText: "Cancelled weapon" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Create weapon", exact: true })
    .click();
  await expect(
    page.getByLabel("Search base weapons", { exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(form).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Create weapon", exact: true }),
  ).toBeFocused();
});

test("magical effects and rune restrictions integrate with the weapon dialog preview @gm @mobile", async ({
  page,
}, info) => {
  if (page.viewportSize().width < 540)
    await page.setViewportSize({ width: 320, height: 844 });
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Equipment & magic");
  await page
    .getByRole("button", { name: "Create weapon", exact: true })
    .click();
  const form = page.locator(".weapon-workbench");
  await page.locator("#weapon-base").selectOption("core:weapon:3");
  await page.getByLabel("Weapon name", { exact: true }).fill("Runebound sword");
  await page.getByRole("radio", { name: "Runic", exact: true }).check();
  await expect(
    form.getByRole("button", { name: "Add weapon", exact: true }),
  ).toBeDisabled();
  await page
    .locator("#weapon-rune-select")
    .selectOption("dwarf-guide:rune:weapon-rune-of-cleaving");
  await form
    .getByRole("button", { name: "Inscribe rune", exact: true })
    .click();
  await page
    .getByLabel("Rune of Cleaving inscriptions", { exact: true })
    .fill("2");
  await expect(form.locator(".weapon-rune-count")).toContainText("2 / 3");
  await expect(
    form.getByRole("complementary", { name: "Weapon preview" }),
  ).toContainText("+2 Damage");
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("runic-workbench.png") });
  await form.getByRole("button", { name: "Add weapon", exact: true }).click();
  await expect(
    page.locator(".gm-attack-row").filter({ hasText: "Runebound sword" }),
  ).toContainText("Rune of Cleaving ×2");
  await page
    .getByRole("button", { name: "Create weapon", exact: true })
    .click();
  await page.locator("#weapon-base").selectOption("core:weapon:3");
  await page.getByLabel("Weapon name", { exact: true }).fill("Silver dawn");
  await page.getByRole("radio", { name: "Magical", exact: true }).check();
  await page
    .locator("#weapon-effect-select")
    .selectOption("archives-ii:weapon-effect:of-leaping-gold");
  await form.getByRole("button", { name: "Add ability", exact: true }).click();
  await expect(
    form.getByRole("complementary", { name: "Weapon preview" }),
  ).toContainText("Fast, Penetrating, Precise");
  await page.getByRole("radio", { name: "Ordinary", exact: true }).click();
  await expect(form).toContainText("Replace the current powers");
  await form.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Magical", exact: true }),
  ).toBeChecked();
  await page.screenshot({ path: info.outputPath("magical-workbench.png") });
  await form.getByRole("button", { name: "Add weapon", exact: true }).click();
  await expect(
    page.locator(".gm-attack-row").filter({ hasText: "Silver dawn" }),
  ).toContainText("Of Leaping Gold");
  await noOverflow(page);
});
