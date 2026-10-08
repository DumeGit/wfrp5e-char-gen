import {
  test,
  expect,
  openGM,
  applyProfile,
  gmStep,
  noOverflow,
} from "./helpers.mjs";

test("Trait picker prioritises names while typing and keeps description search @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page.getByRole("tab", { name: "Traits", exact: true }).click();
  await page.getByRole("button", { name: "Add Trait", exact: true }).click();
  const search = page.locator("#gm-picker-search"),
    names = page.locator("#gm-picker-results .gm-picker-row strong");
  await search.pressSequentially("tra");
  await expect(names).toContainText(["Trained"]);
  expect((await names.allTextContents()).indexOf("Trained")).toBeLessThan(3);
  await search.pressSequentially("i");
  await expect(names.first()).toHaveText("Trained");
  await expect(search).toBeFocused();
  await expect(search).toHaveValue("trai");
  await expect.poll(() => search.evaluate((e) => e.selectionStart)).toBe(4);
  await search.fill("trained");
  await expect(names.first()).toHaveText("Trained");
  await search.fill("Fetch");
  await expect(names).toContainText(["Trained"]);
  await search.fill("trai");
  await page
    .locator("#gm-picker-results .gm-picker-row")
    .first()
    .getByRole("button", { name: "Add", exact: true })
    .click();
  await expect(page.locator(".gm-entry-list")).toContainText("Trained");
});

test("Archives I reuses equipment and Youngblood with selective Legacy and independent books @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await page.locator("#gm-book-archives-i").check();
  await expect(page.locator(".gm-profile-card")).toHaveCount(49);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  await page.getByRole("button", { name: "Add Talent", exact: true }).click();
  await page.locator("#gm-picker-search").fill("Youngblood");
  const row = page.locator("#gm-picker-results .gm-picker-row").first();
  await expect(row).toContainText("Archives I · p. 78");
  await row
    .getByRole("button", { name: "Read Youngblood adaptation", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Youngblood · Legacy", exact: true }),
  ).toContainText("per-rank");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.getByRole("button", { name: "Add Talent", exact: true }).click();
  await page.locator("#gm-picker-search").fill("Youngblood");
  await row.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByLabel("Youngblood ranks", { exact: true }),
  ).toHaveAttribute("max", "1");
  await expect(
    page
      .locator(".gm-entry")
      .filter({ has: page.getByLabel("Youngblood ranks", { exact: true }) })
      .getByRole("button", { name: "Read Youngblood adaptation", exact: true }),
  ).toBeVisible();
  await gmStep(page, "Equipment & magic");
  await page
    .getByRole("button", { name: "Add equipment", exact: true })
    .click();
  await page.locator("#gm-picker-search").fill("Eonir War Blade");
  await expect(row).toContainText("Archives I · p. 92");
  await expect(row.getByRole("button", { name: /adaptation/ })).toHaveCount(0);
  await row.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.locator(".gm-attack-row").filter({ hasText: "Eonir War Blade" }),
  ).toBeVisible();
  await noOverflow(page);
  await gmStep(page, "Starting profile");
  await page.locator("#gm-book-archives-i").uncheck();
  await gmStep(page, "Equipment & magic");
  await expect(
    page.locator(".gm-attack-row").filter({ hasText: "Eonir War Blade" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "↶ Undo last change", exact: true })
    .click();
  await gmStep(page, "Equipment & magic");
  await expect(
    page.locator(".gm-attack-row").filter({ hasText: "Eonir War Blade" }),
  ).toBeVisible();
});

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
  await expect(page.locator(".gm-profile-card")).toHaveCount(49);
  await page.locator("#gm-book-up-in-arms").check();
  await expect(page.locator(".gm-profile-card")).toHaveCount(51);
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
  await expect(page.locator(".gm-profile-card")).toHaveCount(49);
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
test("Archives II foundations and Legacy work on desktop and mobile @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await page.locator("#gm-book-archives-ii").check();
  await expect(page.locator(".gm-profile-card")).toHaveCount(51);
  await applyProfile(page, "Rhinox");
  await expect(page.locator("#gm-folio")).toContainText("50");
  await page
    .locator(".gm-foundation")
    .getByRole("button", { name: "Read Rhinox adaptation" })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Proposed Fifth Edition adaptation",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await gmStep(page, "Equipment & magic");
  await expect(page.getByLabel("Weapon Damage", { exact: true })).toHaveValue(
    "15",
  );
  await expect(
    page.getByLabel("Horns (10) Damage", { exact: true }),
  ).toHaveValue("10");
  await gmStep(page, "Review & export");
  await expect(
    page.getByRole("button", { name: "Export PDF", exact: true }),
  ).toBeEnabled();
  await noOverflow(page);
  await gmStep(page, "Starting profile");
  await page
    .getByRole("button", { name: "Browse profiles", exact: true })
    .click();
  await applyProfile(page, "Typical Sister");
  await expect(page.locator(".gm-foundation")).toContainText("Archives II");
  await gmStep(page, "Review & export");
  await expect(
    page.getByRole("button", { name: "Export PDF", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".gm-stat-block").first()).toContainText(
    "Field Dressing",
  );
  await noOverflow(page);
});

test("Archives II Ogre Spellcaster offers Great Maw and explains unavailable Lores @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await page.locator("#gm-book-archives-ii").check();
  await applyProfile(page, "Ogre");
  await gmStep(page, "Customise");
  await page.getByRole("tab", { name: "Traits", exact: true }).click();
  await page.getByRole("button", { name: "Add Trait", exact: true }).click();
  await page.locator("#gm-picker-search").fill("Spellcaster");
  await page
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Spellcaster", { exact: true }) })
    .getByRole("button", { name: "Add", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "The Great Maw", exact: true })
    .check();
  await expect(page.locator('input[data-lore][value="Fire"]')).toBeDisabled();
  await gmStep(page, "Equipment & magic");
  await page.getByRole("button", { name: "Choose magic", exact: true }).click();
  await page.locator("#gm-picker-search").fill("Bullgorger");
  await page
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Bullgorger", { exact: true }) })
    .getByRole("button", { name: "Add", exact: true })
    .click();
  await expect(page.locator("#gm-magic")).toContainText("Bullgorger");
  await expect(
    page
      .locator("#gm-magic")
      .getByRole("button", { name: "Read Bullgorger adaptation" }),
  ).toBeVisible();
  await gmStep(page, "Review & export");
  await expect(
    page.getByRole("button", { name: "Export PDF", exact: true }),
  ).toBeEnabled();
  await noOverflow(page);
});
test("named Worked Examples are absent while generic template choices remain @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await expect(page.locator(".gm-profile-card")).toHaveCount(49);
  const names = await page
    .locator(".gm-profile-card > strong")
    .allTextContents();
  expect(names.some((n) => /Skrakk|Ungrakk|Swilegrakk|Guzgog/.test(n))).toBe(
    false,
  );
  expect(
    await page.locator("#gm-category option").allTextContents(),
  ).not.toContain("Worked Examples");
  await applyProfile(page, "Gor");
  await gmStep(page, "Customise");
  await page
    .getByRole("button", { name: "Choose template", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Elite");
  await expect(page.getByRole("dialog")).toContainText("Commander");
  await expect(page.getByRole("dialog")).toContainText("Spellcaster");
  await noOverflow(page);
});

test("Archives III shares prayers and targeted Hedgecraft without adding excluded foundations @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await page.locator("#gm-book-archives-iii").check();
  await expect(page.locator(".gm-profile-card")).toHaveCount(49);
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page.getByRole("tab", { name: "Traits", exact: true }).click();
  const add = async (kind, name) => {
    await page.getByRole("button", { name: kind, exact: true }).click();
    await page.locator("#gm-picker-search").fill(name);
    await page
      .locator(".gm-picker-row")
      .filter({ has: page.getByText(name, { exact: true }) })
      .getByRole("button", { name: "Add", exact: true })
      .click();
  };
  await add("Add Trait", "Miracles");
  await page
    .locator("select[data-trait]")
    .filter({ has: page.locator('option[value="Old Faith"]') })
    .selectOption("Old Faith");
  await add("Add Trait", "Spellcaster");
  await page.getByRole("checkbox", { name: "Hedgecraft", exact: true }).check();
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  await add("Add Skill", "Channelling (Ulgu)");
  await gmStep(page, "Equipment & magic");
  await add("Choose magic", "Blessing of Healing");
  await add("Choose magic", "Fellstave (Beastmen)");
  await add("Choose magic", "Fellstave (Daemons)");
  await expect(page.locator("#gm-magic")).toContainText("Fellstave (Beastmen)");
  await expect(page.locator("#gm-magic")).toContainText("Fellstave (Daemons)");
  await noOverflow(page);
  await gmStep(page, "Review & export");
  await expect(
    page.getByRole("button", { name: "Export PDF", exact: true }),
  ).toBeEnabled();
  await gmStep(page, "Starting profile");
  await page.locator("#gm-book-archives-iii").uncheck();
  await gmStep(page, "Equipment & magic");
  await expect(page.locator("#gm-magic")).not.toContainText("Fellstave");
  await page
    .getByRole("button", { name: "\u21b6 Undo last change", exact: true })
    .click();
  await gmStep(page, "Equipment & magic");
  await expect(page.locator("#gm-magic")).toContainText("Fellstave (Daemons)");
});

test("GM Arcane Lore assignment and Cants have focused issues, compact references and undo @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await page.locator("#gm-book-archives-iii").check();
  await applyProfile(page, "Human");
  await gmStep(page, "Customise");
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  const add = async (kind, name) => {
    await page.getByRole("button", { name: kind, exact: true }).click();
    await page.locator("#gm-picker-search").fill(name);
    await page
      .locator(".gm-picker-row")
      .filter({ has: page.getByText(name, { exact: true }) })
      .getByRole("button", { name: "Add", exact: true })
      .click();
  };
  await add("Add Talent", "Arcane Magic (Fire)");
  await add("Add Talent", "Arcane Magic (Shadows)");
  await gmStep(page, "Equipment & magic");
  await add("Choose magic", "Aethyric Armour");
  await page
    .getByRole("checkbox", { name: "Use Colour Lore Cants", exact: true })
    .check();
  const issues = page.getByRole("region", {
    name: "Choices to finish",
    exact: true,
  });
  await expect(issues).toContainText("Choose a Lore for Aethyric Armour");
  await issues
    .getByRole("button", { name: /Choose a Lore for Aethyric Armour/ })
    .click();
  const lore = page.getByLabel("Aethyric Armour Lore", { exact: true });
  await expect(lore).toBeFocused();
  await lore.selectOption("Fire");
  await expect(issues).toContainText("Choose 1 distinct Fire Cant");
  await page
    .getByLabel("Fire Cant 1", { exact: true })
    .selectOption({ label: "Set Alight" });
  await expect(issues).toHaveCount(0);
  await expect(page.locator("#gm-cants")).toContainText("Set Alight");
  await noOverflow(page);
  await gmStep(page, "Review & export");
  await expect(
    page.getByRole("button", { name: "Export PDF", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".gm-stat-block").first()).toContainText(
    "Set Alight",
  );
  await gmStep(page, "Equipment & magic");
  await page
    .locator("#gm-magic .gm-entry")
    .getByRole("button", { name: "Remove this entry", exact: true })
    .click();
  await expect(page.getByLabel("Fire Cant 1", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "\u21b6 Undo last change", exact: true })
    .click();
  await expect(page.getByLabel("Fire Cant 1", { exact: true })).toHaveValue(
    "archives-iii:cant:fire-set-alight",
  );
  await expect(lore).toHaveValue("Fire");
});
