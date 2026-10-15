import { openGMBooks } from "./helpers.mjs";
import {
  test,
  expect,
  openGM,
  gmStep,
  applyProfile,
  noOverflow,
} from "./helpers.mjs";

test("Corsairs book filters and Chief Mate optional Talents work on desktop and phone @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await openGMBooks(page);
  await expect(
    page.locator("label:has(#gm-book-corsairs-flariel)"),
  ).toContainText("2 profiles · 8 templates");
  await page.locator("#gm-book-corsairs-flariel").check();
  await page.locator("#gm-profile-book").selectOption("corsairs-flariel");
  await applyProfile(page, "Dark Elf");
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  await gmStep(page, "Customise");
  await page
    .getByRole("button", { name: "Choose template", exact: true })
    .click();
  await page.locator("#gm-template-book").selectOption("corsairs-flariel");
  await page
    .getByRole("dialog")
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Chief Mate", { exact: true }) })
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  const preview = page.getByRole("dialog", { name: "Chief Mate", exact: true });
  await expect(preview).toContainText("Optional");
  await preview
    .getByRole("button", { name: "Apply template", exact: true })
    .click();
  const choice = page.locator("#template-talent-0");
  await expect(choice).toHaveValue("");
  const cloak = page.getByRole("combobox", {
    name: "Optional Sea Dragon Cloak",
    exact: true,
  });
  await expect(cloak).toHaveValue("");
  await cloak.selectOption({ label: "Sea Dragon Cloak" });
  await expect(cloak).not.toHaveValue("");
  await expect(page.locator(".gm-stat-block")).toContainText(
    "Sea Dragon Cloak (Body +2 AP; Partial)",
  );
  await choice.selectOption("Dual Wielder");
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  await expect(
    page.locator("#creator-main .gm-entry").filter({ hasText: "Dual Wielder" }),
  ).toHaveCount(1);
  await choice.selectOption("");
  await expect(
    page.locator("#creator-main .gm-entry").filter({ hasText: "Dual Wielder" }),
  ).toHaveCount(0);
  await noOverflow(page);
});

test("Sorceress offers exactly core Colour Lores/Winds and explains its remaining spell choices @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await openGMBooks(page);
  await page.locator("#gm-book-corsairs-flariel").check();
  await applyProfile(page, "Dark Elf");
  await gmStep(page, "Customise");
  await page
    .getByRole("button", { name: "Choose template", exact: true })
    .click();
  await page.locator("#gm-template-book").selectOption("corsairs-flariel");
  await page
    .getByRole("dialog")
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Druchii Sorceress", { exact: true }) })
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("5 Petty");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Apply template", exact: true })
    .click();
  const lore = page.locator("#template-talent-1"),
    wind = page.locator("#template-skill-0");
  await expect(lore.locator("option")).toHaveCount(9);
  await expect(wind.locator("option")).toHaveCount(9);
  await lore.selectOption("Arcane Magic (Fire)");
  await wind.selectOption("Channelling (Ulgu)");
  await expect(page.locator(".gm-issues")).toContainText("choose Aqshy");
  await wind.selectOption("Channelling (Aqshy)");
  await expect(page.locator(".gm-issues")).not.toContainText("choose Aqshy");
  await expect(page.locator(".gm-issues")).toContainText(
    "choose 5 Petty spells",
  );
  await noOverflow(page);
});

test("Ship's Crew choices route early, retain one performance/instrument and survive reload @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await openGMBooks(page);
  await page.goto("/gm.html");
  await page.locator("#gm-book-corsairs-flariel").check();
  await applyProfile(page, "Dark Elf Ship's Crew");
  await page
    .locator(".gm-issues button")
    .filter({ hasText: "Singing or Storytelling" })
    .click();
  const performance = page.locator("#profile-skill-0");
  await expect(performance).toBeFocused();
  await performance.selectOption("Entertain (Storytelling)");
  await page.locator("#profile-skill-1").selectOption("Play (Flute)");
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  await page
    .getByRole("tab", { name: "Skills & Talents", exact: true })
    .click();
  await expect(
    page.getByRole("spinbutton", {
      name: "Entertain (Storytelling) total",
      exact: true,
    }),
  ).toHaveValue("35");
  await expect(
    page.getByRole("spinbutton", { name: "Play (Flute) total", exact: true }),
  ).toHaveValue("45");
  await page
    .locator("#creator-main")
    .getByRole("button", {
      name: "Read Entertain (Storytelling) adaptation",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Fellowship");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.reload();
  await expect(performance).toHaveValue("Entertain (Storytelling)");
  await expect(page.locator("#profile-skill-1")).toHaveValue("Play (Flute)");
  await noOverflow(page);
});

test("Warhound's Broken roll issue opens the real recorded roll control @gm @mobile", async ({
  page,
}) => {
  await openGM(page);
  await openGMBooks(page);
  await page.goto("/gm.html");
  await page.locator("#gm-book-corsairs-flariel").check();
  await applyProfile(page, "Dog");
  await gmStep(page, "Customise");
  await page
    .getByRole("button", { name: "Choose template", exact: true })
    .click();
  await page.locator("#gm-template-book").selectOption("corsairs-flariel");
  await page
    .getByRole("dialog")
    .locator(".gm-picker-row")
    .filter({ has: page.getByText("Warhound", { exact: true }) })
    .getByRole("button", { name: "Preview", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Warhound", exact: true })
    .getByRole("button", { name: "Apply template", exact: true })
    .click();
  await page
    .locator(".gm-issues button")
    .filter({ hasText: "2d10 Fellowship" })
    .click();
  const roll = page.locator("#gm-broken-roll");
  await expect(roll).toBeFocused();
  await roll.click();
  await expect(roll).toContainText("Roll again");
  await expect(page.locator(".gm-issues")).toHaveCount(0);
  await page.reload();
  await page.getByRole("tab", { name: "Traits", exact: true }).click();
  await expect(roll).toContainText("Roll again");
  await noOverflow(page);
});
