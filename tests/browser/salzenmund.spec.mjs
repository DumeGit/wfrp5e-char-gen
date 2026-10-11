import {
  test,
  expect,
  openPC,
  openGM,
  pcStep,
  gmStep,
  applyProfile,
  noOverflow,
  downloadBytes,
  fileUpload,
} from "./helpers.mjs";

test("Salzenmund origins and Owler reuse Player choices without replacing core Smuggler @pc @mobile", async ({
  page,
}) => {
  await openPC(page);
  await page
    .locator("#creator-main")
    .getByRole("button", { name: "Choose books", exact: true })
    .click();
  await page.locator('[data-book="salzenmund"]').check();
  await page
    .getByRole("button", { name: "Use selected books", exact: true })
    .click();
  await page
    .locator("#regional-origin")
    .selectOption("salzenmund:origin:nordlander");
  await page.getByRole("button", { name: "Apply change", exact: true }).click();
  await expect(page.locator("main")).toContainText("Nordlander");
  await expect(page.locator("main")).toContainText(
    "Native languages: Reikspiel",
  );
  await pcStep(page, "Career");
  await page.locator("#career-book").selectOption("salzenmund");
  await expect(page.locator(".career-result")).toHaveCount(1);
  await page
    .locator('.career-result[data-id="salzenmund:career:owler"]')
    .click();
  await expect(page.locator(".career-preview")).toContainText("Legacy");
  await page.getByRole("button", { name: "Choose Owler", exact: true }).click();
  await page.getByRole("button", { name: "Apply change", exact: true }).click();
  await expect(page.locator(".career-preview")).toContainText("Current Career");
  await noOverflow(page);
});

test("Spite Ward and Venom are repairable native controls before export; template replacement remains saveable @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await expect(page.locator("label:has(#gm-book-salzenmund)")).toContainText(
    "7 profiles · 4 templates",
  );
  await page.locator("#gm-book-salzenmund").check();
  await applyProfile(page, "Spite");
  await expect(page.locator(".gm-issues")).toContainText("Venom");
  await gmStep(page, "Customise");
  await page.locator("#profile-skill-0").selectOption("Stealth (Rural)");
  await page.getByRole("tab", { name: "Traits", exact: true }).click();
  await page
    .locator('select[data-trait*="spite-traits"]')
    .selectOption("Difficult");
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Choose template", exact: true })
    .click();
  await page.locator("#gm-template-book").selectOption("salzenmund");
  await page
    .getByRole("dialog")
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Despair", { exact: true }) })
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  await expect(page.locator(".gm-template-preview")).toContainText("47");
  await page
    .getByRole("button", { name: "Apply template", exact: true })
    .click();
  await expect(page.locator(".gm-issues")).toContainText("Ward");
  await page
    .locator('[data-trait="salzenmund:templates:despair:trait:2"]')
    .fill("8");
  await page
    .locator('[data-trait="salzenmund:templates:despair:trait:2"]')
    .blur();
  await expect(page.locator(".gm-issues")).not.toContainText("Ward");
  await page.getByRole("tab", { name: "Characteristics", exact: true }).click();
  await page.locator("#gm-wounds").fill("1");
  await page.locator("#gm-wounds").blur();
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  const saved = await downloadBytes(
    page,
    page.getByRole("button", { name: "Save NPC / creature", exact: true }),
  );
  await page.reload();
  await fileUpload(
    page,
    page.getByRole("button", { name: "Load draft", exact: true }),
    JSON.parse(saved.bytes),
    "salzenmund-spite.json",
  );
  await page
    .getByRole("dialog", { name: "Load this GM draft?", exact: true })
    .getByRole("button", { name: "Load draft", exact: true })
    .click();
  await gmStep(page, "Customise");
  await page.getByRole("tab", { name: "Traits", exact: true }).click();
  await expect(
    page.locator('[data-trait="salzenmund:templates:despair:trait:2"]'),
  ).toHaveValue("8");
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  await noOverflow(page);
});
