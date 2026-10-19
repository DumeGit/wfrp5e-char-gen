import {
  test,
  expect,
  openPC,
  openGM,
  pcStep,
  gmStep,
  applyProfile,
  noOverflow,
  revealCreatorTool,
} from "./helpers.mjs";

test("Player phone balances remain visible and update after purchase and undo @interface @mobile", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "mobile", "Persistent phone controls");
  await openPC(page, { complete: true });
  await page.setViewportSize({ width: 320, height: 844 });
  await pcStep(page, "Experience");
  const bar = page.getByRole("region", {
    name: "Character actions",
    exact: true,
  });
  const balance = bar.locator(".mobile-balance");
  await expect(balance).toBeVisible();
  await expect(balance).toContainText("1,000 XP");
  await page
    .locator(".xp-characteristic-row")
    .first()
    .getByRole("button", { name: "125 XP", exact: true })
    .click();
  await expect(balance).toContainText("875 XP");
  await bar.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(balance).toContainText("1,000 XP");
  const visible = await balance.evaluate((e) => {
    const r = e.getBoundingClientRect();
    return (
      r.top >= 0 &&
      r.bottom <= innerHeight &&
      [...e.children].every((x) => x.scrollWidth <= x.clientWidth)
    );
  });
  expect(visible).toBe(true);
  await noOverflow(page);
});

test("Source disclosures have separate keyboard actions and Review names stay intact @interface @pc", async ({
  page,
}) => {
  await openPC(page, { complete: true });
  for (const step of ["Origins", "Talents", "Review"]) {
    await pcStep(page, step);
    await expect(
      page.locator(
        "main summary button, main summary a, main summary input, main summary select",
      ),
    ).toHaveCount(0);
  }
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  await pcStep(page, "Talents");
  const description = page.locator(".talent-description").first();
  await description.locator("summary").click();
  const source = description.locator(".source-button").first();
  await source.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#creator-dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(description).toHaveAttribute("open", "");
  await pcStep(page, "Review");
  await expect(page.locator(".review-character-name")).toHaveText(
    "Browser Test Soldier",
  );
  await expect(
    page.locator(".review-character-name .chapter-initial"),
  ).toHaveCount(0);
});

test("Bestiary numbers fit enlarged text including three-digit edits @interface @gm", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "desktop", "Desktop text-resize regression");
  await openGM(page);
  await applyProfile(page, "Griffon");
  await gmStep(page, "Customise");
  await page.locator("html").evaluate((e) => (e.style.fontSize = "200%"));
  const fields = page.locator(".gm-char-row input");
  await fields.nth(1).fill("120");
  await fields.nth(1).blur();
  for (const field of await fields.all())
    expect(await field.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(
      true,
    );
  await fields.nth(1).scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("bestiary-enlarged-number.png"),
  });
  await noOverflow(page);
});

test("Player chooser distinguishes Bestiary-only packs without disabling creation-rule packs @interface @pc", async ({
  page,
}) => {
  await openPC(page, { complete: true });
  const chooseBooks = page
    .getByRole("button", { name: "Choose books", exact: true })
    .first();
  await revealCreatorTool(page, chooseBooks);
  await chooseBooks.click();
  const bestiaryOnly = page
    .locator(".book-card")
    .filter({ hasText: "The Warband of Bayl of Many Eyes" });
  await expect(bestiaryOnly).toContainText("no Player additions");
  await expect(bestiaryOnly.getByRole("checkbox")).toBeDisabled();
  await expect(
    page.locator('.book-card input[data-book="night-parade"]'),
  ).toBeEnabled();
  await expect(
    page.locator('.book-card input[data-book="up-in-arms"]'),
  ).toBeEnabled();
});
