import {
  test,
  expect,
  openPC,
  pcStep,
  openGM,
  gmDraft,
  gmStep,
  fileUpload,
  noOverflow,
  pcDraft,
} from "./helpers.mjs";

async function read(page, button, term, text) {
  await button.scrollIntoViewIfNeeded();
  if (page.viewportSize().width <= 760) {
    const bounds = await button.boundingBox();
    expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.height).toBeGreaterThanOrEqual(44);
  }
  await button.click();
  const reader = page.getByRole("dialog", {
    name: "Search the books",
    exact: true,
  });
  await expect(
    reader.getByRole("heading", { name: term, exact: true }),
  ).toBeVisible();
  if (text) await expect(reader).toContainText(text);
  await noOverflow(page);
  await reader
    .getByRole("button", { name: "Close search", exact: true })
    .click();
  await expect(button).toBeFocused();
}

test("Bestiary rule help replaces Trait Talent and spell description arrows @gm @mobile", async ({
  page,
}, info) => {
  await openGM(page);
  const draft = await gmDraft();
  draft.traits.push({
    key: "gm-vision",
    name: "Night Vision",
    value: "",
    ranks: 1,
    origin: "GM",
  });
  draft.talents.push({
    key: "gm-petty",
    name: "Petty Magic",
    ranks: 1,
    origin: "GM",
  });
  draft.spells = ["core:spells:animal-friend"];
  draft.books.push("night-parade");
  draft.traits.push({
    key: "gm-vigor",
    name: "Vigor Mortis",
    value: "",
    ranks: 1,
    origin: "GM",
  });
  draft.traits.push({
    key: "gm-brazier",
    name: "Balefire Brazier",
    value: "",
    ranks: 1,
    origin: "GM",
  });
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load draft", exact: true }),
    draft,
    "rule-help.json",
  );
  await page
    .getByRole("dialog", { name: "Load this GM draft?", exact: true })
    .getByRole("button", { name: "Load draft", exact: true })
    .click();
  await gmStep(page, "Customise");
  await page.getByRole("tab", { name: "Traits", exact: true }).click();
  const toggle = page.getByRole("switch", {
    name: "Night Vision description",
    exact: true,
  });
  await toggle.uncheck();
  await read(
    page,
    page.getByRole("button", { name: "Read Night Vision", exact: true }),
    "Night Vision",
    "20 yards",
  );
  await expect(toggle).not.toBeChecked();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(toggle).toBeChecked();
  await read(
    page,
    page.getByRole("button", { name: "Read Vigor Mortis", exact: true }),
    "Vigor Mortis",
    "replaces its Necromancy casting benefit",
  );
  await expect(page.locator(".gm-ability-content details")).toHaveCount(0);
  await expect(page.locator(".gm-ability-content > p")).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("trait-rule-help.png") });
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  await read(
    page,
    page.getByRole("button", { name: "Read Petty Magic", exact: true }),
    "Petty Magic",
  );
  await expect(page.locator(".gm-ability-content details")).toHaveCount(0);
  await expect(page.locator(".gm-ability-content > p")).toHaveCount(0);
  await page.getByRole("button", { name: "Add Talent", exact: true }).click();
  const picker = page.getByRole("dialog", { name: "Add Talent", exact: true });
  await picker.getByLabel("Search talent", { exact: true }).fill("Youngblood");
  await picker
    .getByRole("checkbox", { name: "Select Youngblood", exact: true })
    .check();
  await read(
    page,
    picker.getByRole("button", {
      name: "Read Youngblood adaptation",
      exact: true,
    }),
    "Youngblood · Legacy",
    "per-rank",
  );
  await expect(
    picker.getByRole("checkbox", { name: "Select Youngblood", exact: true }),
  ).toBeChecked();
  await picker
    .getByRole("button", { name: "Add 1 Talent", exact: true })
    .click();
  await expect(
    page.getByRole("spinbutton", { name: "Youngblood ranks", exact: true }),
  ).toHaveValue("1");
  await gmStep(page, "Equipment & magic");
  await read(
    page,
    page.getByRole("button", { name: "Read Animal Friend", exact: true }),
    "Animal Friend",
  );
  await page
    .getByRole("button", { name: "Add equipment", exact: true })
    .click();
  const equipment = page.getByRole("dialog", {
    name: "Add equipment",
    exact: true,
  });
  await equipment
    .getByLabel("Search equipment", { exact: true })
    .fill("Leather Jack");
  await equipment
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Leather Jack", { exact: true }) })
    .first()
    .getByRole("button", { name: "Add", exact: true })
    .click();
  const gear = page.locator('[id^="gear-gm-"]').filter({
    has: page.getByRole("button", { name: "Read Leather Jack", exact: true }),
  });
  await expect(gear.locator("p")).toHaveCount(0);
  await read(
    page,
    gear.getByRole("button", { name: "Read Leather Jack", exact: true }),
    "Leather Jack",
  );
  await expect(
    page.getByRole("switch", {
      name: "Animal Friend (Petty) description",
      exact: true,
    }),
  ).toBeChecked();
  await expect(page.locator(".gm-ability-content details")).toHaveCount(0);
  await expect(page.locator(".gm-ability-content > p")).toHaveCount(0);
});

test("Player rule help opens the shared reader from Talents and Review @pc @mobile", async ({
  page,
}, info) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Talents");
  await read(
    page,
    page.getByRole("button", { name: "Read Warrior Born", exact: true }),
    "Warrior Born",
  );
  await expect(page.locator("details.talent-description")).toHaveCount(0);
  await expect(
    page.locator(
      ".talent-description .calculation-status, .talent-description > p:not(.talent-reference)",
    ),
  ).toHaveCount(0);
  await page.screenshot({ path: info.outputPath("player-rule-help.png") });
  await pcStep(page, "Review");
  await read(
    page,
    page.getByRole("button", { name: "Read Warrior Born", exact: true }),
    "Warrior Born",
  );
  await expect(page.locator("details.talent-description")).toHaveCount(0);
  await expect(
    page.locator(
      ".talent-description .calculation-status, .talent-description > p:not(.talent-reference)",
    ),
  ).toHaveCount(0);
});

test("Marijan rule help opens directly while personal editing stays separate @marijan @mobile", async ({
  page,
}, info) => {
  await page.goto("/marijan/?verify=1");
  await page.locator("#mm-find-talents").fill("Strong Back");
  await page
    .locator("#mm-results-talents")
    .getByRole("button", { name: "Add Strong Back", exact: true })
    .click();
  await read(
    page,
    page.getByRole("button", { name: "Read Strong Back", exact: true }),
    "Strong Back",
  );
  const edit = page.getByLabel("Edit Strong Back details", { exact: true });
  await expect(edit).toHaveText("Edit");
  await expect(edit.locator("svg")).toHaveCount(0);
  await edit.click();
  const notes = page.getByLabel("Personal description (optional)", {
    exact: true,
  });
  await notes.fill("A personal reminder");
  await notes.blur();
  await read(
    page,
    page.getByRole("button", { name: "Read Strong Back", exact: true }),
    "Strong Back",
  );
  await expect(notes).toHaveValue("A personal reminder");
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("marijan-rule-help.png") });
});

test("Manager rule help replaces ability and Condition description expanders @manager @mobile", async ({
  page,
}, info) => {
  await page.goto("/manager/?verify=1");
  await page
    .getByLabel("Import character JSON", { exact: true })
    .setInputFiles({
      name: "character.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(await pcDraft({ complete: true }))),
    });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Import 1 character/ })
    .click();
  const talents = page.getByRole("button", { name: "Talents", exact: true });
  if ((await talents.getAttribute("aria-expanded")) === "false")
    await talents.click();
  await read(
    page,
    page.getByRole("button", { name: "Read Doomed", exact: true }),
    "Doomed",
  );
  await expect(
    page.locator(".manager-entry-heading").filter({ hasText: "Doomed" }),
  ).toBeVisible();
  await expect(
    page
      .locator(".manager-entry-row")
      .filter({
        has: page.getByRole("button", { name: "Read Doomed", exact: true }),
      })
      .locator(".manager-entry-content > p"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Add talent", exact: true }).click();
  const addTalent = page
    .getByRole("dialog")
    .filter({ has: page.getByLabel("Find catalogue entry", { exact: true }) });
  await addTalent
    .getByLabel("Find catalogue entry", { exact: true })
    .fill("Youngblood");
  await addTalent
    .getByLabel("Catalogue entry", { exact: true })
    .selectOption({ label: "Youngblood · archives-i" });
  await addTalent
    .getByLabel("GM adjustment reason (required)")
    .fill("Verify compact rule help");
  await addTalent
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await expect(addTalent).toBeHidden();
  const youngblood = page.locator(".manager-entry-row").filter({
    has: page.getByRole("button", { name: "Read Youngblood", exact: true }),
  });
  await expect(youngblood.locator(".manager-entry-content > p")).toHaveCount(0);
  await read(
    page,
    youngblood.getByRole("button", {
      name: "Read Legacy · Youngblood",
      exact: true,
    }),
    "Legacy · Youngblood",
    "per-rank",
  );
  await page
    .getByRole("button", { name: "Add status entry", exact: true })
    .click();
  const dialog = page
    .getByRole("dialog")
    .filter({ has: page.getByLabel("Condition", { exact: true }) });
  await dialog
    .getByLabel("Condition", { exact: true })
    .selectOption("Bleeding");
  await dialog
    .getByLabel("Effect / notes", { exact: true })
    .fill("A personal reminder");
  await read(
    page,
    dialog.getByRole("button", { name: "Read Bleeding", exact: true }),
    "Bleeding",
  );
  await expect(
    dialog.getByLabel("Effect / notes", { exact: true }),
  ).toHaveValue("A personal reminder");
  await expect(dialog.locator("details.manager-condition-rules")).toHaveCount(
    0,
  );
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  const entry = page
    .locator(".manager-status-entry")
    .filter({ hasText: "A personal reminder" });
  await expect(entry).toBeVisible();
  await expect(entry.locator("summary")).toHaveCount(0);
  await expect(entry.locator(":scope > p")).toHaveText("A personal reminder");
  await read(
    page,
    entry.getByRole("button", { name: "Read Bleeding", exact: true }),
    "Bleeding",
  );
  await page.screenshot({ path: info.outputPath("manager-rule-help.png") });
});
