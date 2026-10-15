import { test, expect, openPC, pcStep, noOverflow } from "./helpers.mjs";

test("Player review is a compact character sheet with working details @pc @mobile", async ({
  page,
}, info) => {
  await openPC(page, { complete: true });
  await pcStep(page, "Review & export");
  const sheet = page.locator(".review-sheet");
  await expect(
    sheet.getByRole("heading", { name: "Browser Test Soldier", exact: true }),
  ).toBeVisible();
  await expect(sheet.locator(".review-identity-grid")).toContainText("Soldier");
  await expect(sheet.locator(".review-stats > div")).toHaveCount(10);
  await expect(sheet.locator(".review-resources")).toContainText("Fortune");
  await expect(sheet.locator(".review-resources")).toContainText("Wounds");
  await expect(sheet.locator(".review-skills").first()).toContainText(
    "Language (Reikspiel)",
  );
  await expect(sheet.locator("#review-equipment")).toBeVisible();
  await expect(sheet.locator(".review-weapons")).toContainText("Halberd");
  await expect(sheet.locator(".review-armour")).toContainText("Body");
  await expect(
    sheet.getByRole("button", {
      name: "Download character sheet",
      exact: true,
    }),
  ).toBeEnabled();
  await expect(
    sheet.locator('[data-detail-key="review-sheet:pdf-options"]'),
  ).not.toHaveAttribute("open", "");
  await sheet.getByText("PDF options", { exact: true }).click();
  expect(
    await sheet
      .locator('[data-detail-key="review-sheet:pdf-options"] > summary')
      .evaluate((node) => getComputedStyle(node, "::before").position),
  ).toBe("static");
  await sheet
    .getByRole("checkbox", {
      name: "Include the complete enabled-book compatibility appendix",
    })
    .check();
  await expect(sheet.getByRole("checkbox")).toBeChecked();
  await sheet.getByText("PDF options", { exact: true }).click();
  await sheet.locator(".talent-description").first().locator("summary").click();
  await expect(sheet.locator(".talent-description").first()).toHaveAttribute(
    "open",
    "",
  );
  await sheet.locator(".talent-description").first().locator("summary").click();
  await sheet
    .getByText("Background & character notes", { exact: true })
    .click();
  await sheet
    .getByLabel("Character notes / GM decisions")
    .fill("A short character note.");
  await sheet.getByLabel("Character notes / GM decisions").blur();
  await expect(sheet.getByLabel("Character notes / GM decisions")).toHaveValue(
    "A short character note.",
  );
  await sheet
    .getByText("Background & character notes", { exact: true })
    .click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("review-sheet.png"),
    fullPage: true,
  });
  if (info.project.name === "mobile") {
    await page.setViewportSize({ width: 320, height: 740 });
    await noOverflow(page);
    const targets = await sheet
      .locator(".review-stat-button")
      .evaluateAll((nodes) =>
        nodes.map((n) => n.getBoundingClientRect().height),
      );
    expect(targets.every((height) => height >= 44)).toBe(true);
  }
  await sheet
    .getByRole("button", { name: "Edit Characteristics", exact: true })
    .click();
  await expect(page.locator(".review-sheet")).toHaveCount(0);
});

test("Player review shows actionable export blockers without losing the overview @pc @mobile", async ({
  page,
}) => {
  await openPC(page);
  await pcStep(page, "Review & export");
  const sheet = page.locator(".review-sheet");
  await expect(sheet.locator(".review-identity-grid")).toContainText(
    "Not chosen",
  );
  await expect(sheet.locator(".review-incomplete")).toBeVisible();
  await expect(
    sheet.getByRole("button", {
      name: "Download character sheet",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    sheet.locator('[data-detail-key="review-sheet:issues"]'),
  ).toHaveAttribute("open", "");
  await sheet
    .locator('[data-detail-key="review-sheet:issues"] > summary')
    .click();
  await expect(sheet.locator(".review-stats > div")).toHaveCount(10);
  await noOverflow(page);
  await sheet
    .locator('[data-detail-key="review-sheet:issues"] > summary')
    .click();
  await sheet.locator('.issue-panel [data-action="issue"]').first().click();
  await expect(page.locator(".review-sheet")).toHaveCount(0);
});
