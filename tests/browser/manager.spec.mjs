import { test, expect, pcDraft, noOverflow } from "./helpers.mjs";
import { freshMarijan, makeEntry } from "../../src/engine/marijan/model.mjs";
import { readFile } from "node:fs/promises";

test("core Conditions are selectable with source summaries, non-stacking counts and custom notes @manager", async ({
  page,
}) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  const before = (await rawRecords(page))[0].current;
  await page
    .getByRole("button", { name: "Add status entry", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  const select = dialog.getByLabel("Condition", { exact: true });
  const names = await select.locator("option").allTextContents();
  expect(names.slice(1, -1)).toEqual([
    "Ablaze",
    "Besmirched",
    "Bleeding",
    "Blinded",
    "Broken",
    "Deafened",
    "Entangled",
    "Fatigued",
    "Poisoned",
    "Prone",
    "Stunned",
    "Surprised",
    "Unconscious",
  ]);
  await select.selectOption("Unconscious");
  await dialog
    .getByText("Condition rules · Unconscious", { exact: true })
    .click();
  await expect(dialog.getByText(/Helpless, unaware/)).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Core Rulebook, p. 187", exact: true }),
  ).toBeVisible();
  await expect(dialog.getByLabel("Count", { exact: true })).toHaveCount(0);
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await saved(page);
  expect((await rawRecords(page))[0].conditions[0]).toMatchObject({
    name: "Unconscious",
    amount: 1,
    note: "",
  });
  expect((await rawRecords(page))[0].current).toEqual(before);
  await page
    .getByRole("button", { name: "Add status entry", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Condition", { exact: true }).selectOption("custom");
  await dialog
    .getByLabel("Condition name", { exact: true })
    .fill("Campaign effect");
  await dialog.getByLabel("Count", { exact: true }).fill("2");
  await dialog
    .getByLabel("Effect / notes", { exact: true })
    .fill("Agreed at the table");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await saved(page);
  expect((await rawRecords(page))[0].conditions[1]).toMatchObject({
    name: "Campaign effect",
    amount: 2,
    note: "Agreed at the table",
  });
});

test("Condition entry exposes recording before rules and recovers failed summaries at short phone sizes @manager @interface @mobile", async ({
  page,
}, info) => {
  let fail = true;
  await page.route("**/data/rule-reference-library.json", (route) =>
    fail
      ? route.fulfill({ status: 503, body: "Unavailable" })
      : route.continue(),
  );
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  const before = (await rawRecords(page))[0];
  await page.setViewportSize({ width: 320, height: 480 });
  await page
    .getByRole("button", { name: "Add status entry", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("alert")).toContainText(
    "Could not load Condition rules.",
  );
  await expect(
    dialog.getByRole("button", { name: "Retry summary", exact: true }),
  ).toBeVisible();
  fail = false;
  await dialog
    .getByRole("button", { name: "Retry summary", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  await dialog
    .getByLabel("Condition", { exact: true })
    .selectOption("Bleeding");
  const count = dialog.getByLabel("Count", { exact: true });
  const summary = dialog.getByText("Condition rules · Bleeding", {
    exact: true,
  });
  await expect(count).toHaveValue("1");
  await expect(summary.locator("..")).not.toHaveAttribute("open", "");
  expect((await count.boundingBox()).y).toBeLessThan(
    (await summary.boundingBox()).y,
  );
  await expect(
    dialog.getByText(
      "Recorded for play; numerical effects and recovery are applied manually.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath("condition-entry-320-short.png"),
  });
  await summary.press("Enter");
  await expect(summary.locator("..")).toHaveAttribute("open", "");
  await expect(
    dialog.getByRole("button", { name: "Core Rulebook, p. 185", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 640 });
  await page.screenshot({ path: info.outputPath("condition-rules-390.png") });
  await noOverflow(page);
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  expect((await rawRecords(page))[0].conditions).toEqual(before.conditions);
});

test("status card records sourced Critical Wounds and mutations, recovery and custom notes without applying effects @manager", async ({
  page,
}) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  const before = (await rawRecords(page))[0];
  await page
    .getByRole("button", { name: "Add status entry", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Entry type", { exact: true })
    .selectOption("critical");
  const critical = dialog.getByLabel("Critical wound", { exact: true });
  await expect(critical.locator("option")).not.toHaveCount(2);
  const id = await critical.evaluate(
    (el) =>
      [...el.options].find((x) => x.text.includes("Head · Ear Bash")).value,
  );
  await critical.selectOption(id);
  await expect(
    dialog.getByText("Wounds: 1. Gain 1 Deafened.", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Core Rulebook, p. 173", exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Core Rulebook, p. 173", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Ear Bash", exact: true }),
  ).toContainText("Critical Wound · Head");
  await page
    .getByRole("dialog", { name: "Search the books", exact: true })
    .getByRole("button", { name: "Close search", exact: true })
    .click();
  await dialog
    .getByLabel("Recovery / notes", { exact: true })
    .fill("Healer reviewed this injury");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await saved(page);
  const status = page.locator("#manager-status");
  await status
    .locator(".manager-status-entry summary")
    .filter({ hasText: "Ear Bash" })
    .click();
  await expect(
    status.getByText("Healer reviewed this injury", { exact: true }),
  ).toBeVisible();
  await status
    .getByRole("button", { name: /^Core(?: Rulebook)?, p\. 173$/ })
    .click();
  await expect(
    page.getByRole("region", { name: "Ear Bash", exact: true }),
  ).toContainText("Wounds: 1. Gain 1 Deafened.");
  await page
    .getByRole("dialog", { name: "Search the books", exact: true })
    .getByRole("button", { name: "Close search", exact: true })
    .click();
  await status
    .getByRole("button", { name: "Mark healed", exact: true })
    .click();
  await saved(page);
  await expect(
    status.locator(".manager-status-history summary").first(),
  ).toContainText("Healed / inactive (1)");
  await page
    .getByRole("button", { name: "Add status entry", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Entry type", { exact: true })
    .selectOption("mutation");
  const mutation = dialog.getByLabel("Mutation", { exact: true });
  const mutationId = await mutation.evaluate(
    (el) => [...el.options].find((x) => x.text === "Animalistic Legs").value,
  );
  await mutation.selectOption(mutationId);
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await saved(page);
  const after = (await rawRecords(page))[0];
  expect(after.afflictions).toHaveLength(2);
  expect(after.afflictions[0]).toMatchObject({
    kind: "critical",
    name: "Ear Bash",
    resolved: true,
    source: { book: "core", page: 173 },
  });
  expect(after.current).toEqual(before.current);
  expect(after.sheet).toEqual(before.sheet);
  await page.reload();
  await expect(
    status.getByText("Animalistic Legs", { exact: true }),
  ).toBeVisible();
  await status
    .locator(".manager-status-entry summary")
    .filter({ hasText: "Animalistic Legs" })
    .click();
  await status
    .getByRole("button", { name: "Edit Animalistic Legs", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Notes", { exact: true }).fill("Agreed at the table");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await saved(page);
  expect((await rawRecords(page))[0].afflictions[1].note).toBe(
    "Agreed at the table",
  );
  await page
    .getByRole("button", { name: "Add status entry", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Entry type", { exact: true })
    .selectOption("critical");
  await dialog
    .getByLabel("Critical wound", { exact: true })
    .selectOption("custom");
  await dialog
    .getByLabel("Critical wound name", { exact: true })
    .fill("Campaign injury");
  await dialog
    .getByLabel("Effects", { exact: true })
    .fill("Recorded manual effect");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await saved(page);
  expect((await rawRecords(page))[0].afflictions[2]).toMatchObject({
    name: "Campaign injury",
    source: null,
  });
});

test("Fate and Fortune use adjacent plain values and compact steppers, with the pen beside the name @manager", async ({
  page,
}) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  const before = (await rawRecords(page))[0];
  const band = page.getByRole("group", {
    name: "Fate and Fortune",
    exact: true,
  });
  await expect(band.locator("button")).toHaveCount(4);
  await expect(band.locator(".manager-resource-number")).toHaveCount(2);
  await expect(
    page
      .getByRole("navigation", { name: "Character sections" })
      .getByRole("button"),
  ).toHaveText(["Play", "Advance", "Journal"]);
  await expect(
    page.getByLabel("Jump to Play section", { exact: true }),
  ).toHaveCount(0);
  await band
    .getByRole("button", { name: "Decrease Fate", exact: true })
    .click();
  await saved(page);
  expect((await rawRecords(page))[0].sheet.fate).toBe(before.sheet.fate - 1);
  expect((await rawRecords(page))[0].current).toEqual(before.current);
  await band
    .getByRole("button", { name: "Increase Fate", exact: true })
    .click();
  await saved(page);
  await band
    .getByRole("button", { name: "Spend Fortune", exact: true })
    .click();
  await saved(page);
  await band
    .getByRole("button", { name: "Restore Fortune", exact: true })
    .click();
  await saved(page);
  expect((await rawRecords(page))[0].current).toEqual(before.current);
  const heading = await page.locator("#manager-character-name").boundingBox();
  const pen = await page
    .getByRole("button", { name: "Edit profile", exact: true })
    .boundingBox();
  expect(pen.x - (heading.x + heading.width)).toBeLessThan(8);
  const sizes = await band.locator("button").evaluateAll((els) =>
    els.map((el) => ({
      width: el.getBoundingClientRect().width,
      height: el.getBoundingClientRect().height,
      inset: getComputedStyle(el, "::before").top,
    })),
  );
  if (page.viewportSize().width < 720)
    for (const size of sizes) {
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
      expect(Number.parseFloat(size.inset)).toBeGreaterThanOrEqual(8);
    }
  await section(page, "Abilities");
  const skills = page.getByRole("region", { name: "Skills", exact: true });
  await expect(
    skills.getByRole("heading", { name: "Basic Skills", exact: true }),
  ).toBeVisible();
  await expect(
    skills.getByRole("heading", { name: "Advanced Skills", exact: true }),
  ).toBeVisible();
  expect(
    await skills
      .locator(".manager-skill-divider")
      .first()
      .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize)),
  ).toBeLessThanOrEqual(12);
  const order = await skills
    .locator(".manager-skill-divider, .manager-entry-name")
    .allTextContents();
  expect(order.indexOf("Dodge")).toBeLessThan(order.indexOf("Advanced Skills"));
  expect(order.indexOf("Language (Reikspiel)")).toBeGreaterThan(
    order.indexOf("Advanced Skills"),
  );
  const charHeader = await skills
    .locator(".manager-skill-headings > div")
    .first()
    .locator("span")
    .nth(1)
    .boundingBox();
  const firstChar = await skills
    .locator(".manager-skill-characteristic")
    .first()
    .boundingBox();
  expect(Math.abs(charHeader.x - firstChar.x)).toBeLessThanOrEqual(2);
});

test("imported mutations appear once in Status and retain their original data when notes change @manager", async ({
  page,
}) => {
  const creatures = JSON.parse(
    await readFile(
      new URL("../../public/gm/data.json", import.meta.url),
      "utf8",
    ),
  );
  const mutation = creatures.mutations.find(
    (row) => row.name === "Animalistic Legs",
  );
  const draft = freshMarijan();
  draft.name = "Mutation import";
  draft.entries.extras.push(
    makeEntry(
      {
        ...mutation,
        id: `mutation:${mutation.id}:${encodeURIComponent(mutation.name)}`,
        kind: "mutation",
        source: { book: "core", page: mutation.page },
      },
      "extras",
    ),
  );
  await open(page);
  await importData(page, draft);
  const status = page.locator("#manager-status");
  await expect(
    status.getByText("Animalistic Legs", { exact: true }),
  ).toHaveCount(1);
  await status
    .locator("summary")
    .filter({ hasText: "Animalistic Legs" })
    .click();
  await status
    .getByRole("button", { name: "Edit Animalistic Legs", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Notes", { exact: true })
    .fill("Old mutation, new note");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await saved(page);
  const record = (await rawRecords(page))[0];
  expect(record.sheet.entries.extras).toHaveLength(1);
  expect(record.sheet.entries.extras[0].key).toBe(draft.entries.extras[0].key);
  expect(record.sheet.entries.extras[0].descriptionNote).toBe(
    "Old mutation, new note",
  );
  expect(record.afflictions).toHaveLength(0);
  await section(page, "Abilities");
  await expect(
    page
      .locator(".manager-ability-sections")
      .getByText("Animalistic Legs", { exact: true }),
  ).toHaveCount(0);
});

test("abilities share a compact sheet, Skills show Characteristics, gear forms a grid and mobile library lives in the menu @manager", async ({
  page,
}) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  await expect(
    page
      .locator("main")
      .getByRole("button", { name: "Character library", exact: true }),
  ).toHaveCount(0);
  expect(
    await page
      .locator(".manager-main")
      .evaluate((el) => getComputedStyle(el, "::before").backgroundImage),
  ).toContain("radial-gradient");
  expect(
    await page
      .locator(".manager-main")
      .evaluate((el) => getComputedStyle(el, "::after").backgroundImage),
  ).toContain("ledger-emblem.svg");
  await section(page, "Abilities");
  const sheet = page.locator(".manager-ability-sections");
  await expect(
    page.getByRole("button", { name: "Abilities", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Find an owned ability", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Learn or improve with XP", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Improve with XP", exact: true }),
  ).toHaveCount(0);
  for (const name of ["Skills", "Talents", "Magic & Faith", "Other abilities"])
    expect(
      await sheet
        .getByRole("button", { name, exact: true })
        .evaluate((el) => el.closest("h2") !== null),
    ).toBe(true);

  for (const name of ["Skills", "Talents", "Magic & Faith"])
    await expect(
      sheet.getByRole("region", { name, exact: true }),
    ).toBeVisible();
  const dodge = sheet.locator(".manager-entry-row").filter({
    has: page
      .locator(".manager-entry-name")
      .getByText("Dodge", { exact: true }),
  });
  await expect(dodge.locator(".manager-skill-characteristic")).toHaveText("Ag");
  if (page.viewportSize().width > 1100) {
    const columns = await sheet
      .locator('[data-group="skills"] .manager-skill-items')
      .first()
      .evaluate((el) => Number(getComputedStyle(el).columnCount));
    expect(columns).toBeGreaterThan(1);
  }
  await section(page, "Gear");
  const gear = page.locator(".manager-gear-screen");
  if (page.viewportSize().width > 1100) {
    const columns = await gear
      .locator(".manager-entry-items")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
    expect(columns).toBeGreaterThan(1);
    expect(
      (await gear.getByLabel("Find equipment", { exact: true }).boundingBox())
        .width,
    ).toBeLessThan(320);
  }
  await library(page);
});

test("odd Skill groups balance down desktop columns and retain alphabetical phone order @manager", async ({
  page,
}, info) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  const record = (await rawRecords(page))[0];
  record.sheet.entries.skills.push(
    makeEntry(
      {
        id: "balanced-test-skill",
        name: "Zoological Study",
        custom: true,
        advanced: false,
        char: "Int",
      },
      "skills",
    ),
  );
  await importData(page, record);
  await section(page, "Abilities");
  const skills = page.getByRole("region", { name: "Skills", exact: true });
  const basics = skills.getByRole("group", {
    name: "Basic Skills",
    exact: true,
  });
  expect((await basics.locator(".manager-skill-row").count()) % 2).toBe(1);
  for (const width of [1440, 2560, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const toggle = skills.getByRole("button", { name: "Skills", exact: true });
    if ((await toggle.getAttribute("aria-expanded")) === "false")
      await toggle.click();
    const rows = await basics.locator(".manager-entry-row").evaluateAll((els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          name: el.querySelector(".manager-entry-name").textContent,
          x: Math.round(rect.x),
          y: rect.y,
        };
      }),
    );
    const columns = [...new Set(rows.map((row) => row.x))];
    expect(columns).toHaveLength(width < 720 ? 1 : width >= 1800 ? 3 : 2);
    const lengths = columns.map(
      (x) => rows.filter((row) => row.x === x).length,
    );
    expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(1);
    const names = rows.map((row) => row.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(new Set(names).size).toBe(names.length);
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].x === rows[i - 1].x)
        expect(rows[i].y).toBeGreaterThan(rows[i - 1].y);
      else {
        expect(rows[i].x).toBeGreaterThan(rows[i - 1].x);
        expect(Math.abs(rows[i].y - rows[0].y)).toBeLessThan(2);
      }
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await skills.screenshot({ path: info.outputPath(`balanced-${width}.png`) });
  }
});

test("grouped sidebar dialogs retain actions, shared history icons and focus across nested editors @manager", async ({
  page,
}) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  const main = page.locator("main");
  await expect(
    main.getByRole("button", { name: "Undo", exact: true }),
  ).toHaveCount(0);
  await expect(
    main.getByRole("button", { name: "Redo", exact: true }),
  ).toHaveCount(0);
  await expect(
    main.getByRole("button", { name: "More", exact: true }),
  ).toHaveCount(0);
  if (page.viewportSize().width > 1100) {
    await expect(
      page.locator(".workspace-rail .workspace-group-launcher"),
    ).toHaveCount(3);
    await expect(
      page.locator(".workspace-rail .history-controls svg"),
    ).toHaveCount(2);
  }
  await applicationMenu(page, "More");
  await expect(
    page.getByRole("dialog", { name: "Character actions", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Adjust sheet", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Adjust sheet", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const opener = page.getByRole("button", {
    name: page.viewportSize().width > 1100 ? "More" : "Open manager menu",
    exact: true,
  });
  await expect(opener).toBeFocused();
  await applicationMenu(page, "More");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Permanently delete character", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", {
      name: "Permanently delete character",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Keep character", exact: true })
    .click();
  expect(await rawRecords(page)).toHaveLength(1);
  await expect(opener).toBeFocused();
  await applicationMenu(page, "More");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Favourite character", exact: true })
    .click();
  await saved(page);
  expect((await rawRecords(page))[0].favourite).toBe(true);
  await (await historyButton(page, "Undo")).click();
  await saved(page);
  expect((await rawRecords(page))[0].favourite).toBe(false);
  await (await historyButton(page, "Redo")).click();
  await saved(page);
  expect((await rawRecords(page))[0].favourite).toBe(true);
});

async function open(page) {
  await page.goto("/manager/?verify=1");
  await expect(
    page.getByRole("heading", { name: "Your characters", exact: true }),
  ).toBeVisible();
}
async function section(page, name) {
  if (["Abilities", "Gear"].includes(name)) {
    await page
      .getByRole("navigation", { name: "Character sections" })
      .getByRole("button", { name: "Play", exact: true })
      .click();
    for (const title of name === "Abilities"
      ? ["Skills", "Talents", "Magic & Faith", "Other abilities"]
      : [name]) {
      const toggle = page.getByRole("button", { name: title, exact: true });
      if ((await toggle.getAttribute("aria-expanded")) === "false")
        await toggle.click();
    }
    return;
  }
  await page
    .getByRole("navigation", { name: "Character sections" })
    .getByRole("button", { name, exact: true })
    .click();
}
async function library(page) {
  const menu = page.getByRole("button", {
    name: "Open manager menu",
    exact: true,
  });
  if (
    (await menu.isVisible()) &&
    !(await page
      .getByRole("dialog", { name: "Manager menu", exact: true })
      .isVisible())
  )
    await menu.click();
  await page
    .getByRole("button", { name: "Character library", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your characters", exact: true }),
  ).toBeVisible();
}
async function profile(page, name) {
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page.locator("#manager-name").fill(name);
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await saved(page);
}
async function applicationMenu(page, group = "Save & export") {
  const compact = page.getByRole("button", {
    name: "Open manager menu",
    exact: true,
  });
  if (await compact.isVisible()) {
    if (
      !(await page
        .getByRole("dialog", { name: "Manager menu", exact: true })
        .isVisible())
    )
      await compact.click();
  } else
    await expect(
      page.getByRole("complementary", { name: "Application menu" }),
    ).toBeVisible();
  await page.getByRole("button", { name: group, exact: true }).click();
  await expect(
    page.getByRole("dialog", {
      name: group === "More" ? "Character actions" : group,
      exact: true,
    }),
  ).toBeVisible();
}
async function historyButton(page, name) {
  const button = page
    .getByRole("button", { name, exact: true })
    .filter({ visible: true });
  if (!(await button.count()))
    await page
      .getByRole("button", { name: "Open manager menu", exact: true })
      .click();
  return page
    .getByRole("button", { name, exact: true })
    .filter({ visible: true });
}
async function importData(page, data) {
  await page
    .getByLabel("Import character JSON", { exact: true })
    .setInputFiles({
      name: "character.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(data)),
    });
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: /Import 1 character/ }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: /Import 1 character/ }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#manager-character-name")).toBeVisible();
  await expect(
    page.locator(".workspace-menu-footer .save-status"),
  ).toContainText(/Saved/);
}
async function saved(page) {
  await expect(
    page.locator(".workspace-menu-footer .save-status"),
  ).toContainText(/Saved/);
}
async function rawRecords(page) {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open("wfrp-character-manager-v1-verification");
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const read = db
            .transaction("characters")
            .objectStore("characters")
            .getAll();
          read.onsuccess = () => {
            db.close();
            resolve(read.result);
          };
          read.onerror = () => reject(read.error);
        };
      }),
  );
}

test("Player and Marijan imports become independent manager characters and survive reload @manager @storage", async ({
  page,
}) => {
  const draft = await pcDraft({ complete: true });
  await open(page);
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    ["wfrp-fifth-character-ledger-v2-verification", JSON.stringify(draft)],
  );
  await importData(page, draft);
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "imperial-field-ledger",
  );
  await expect(page.locator(".manager-stat")).toHaveCount(10);
  const first = (await rawRecords(page))[0];
  expect(first.sheet.type).toBe("wfrp-character");
  await expect(page.locator("#manager-character-name")).toHaveText(draft.name);
  await page.reload();
  await expect(page.locator("#manager-character-name")).toHaveText(draft.name);
  await library(page);
  const manual = freshMarijan();
  manual.name = "Manual adventurer";
  manual.characteristics.WS.initial = 61;
  await importData(page, manual);
  const records = await rawRecords(page);
  expect(records).toHaveLength(2);
  expect(records.every((x) => x.type === "wfrp-manager")).toBe(true);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("wfrp-fifth-character-ledger-v2-verification"),
    ),
  ).toBe(JSON.stringify(draft));
});
test("resources, Conditions, journal, Undo and advancement persist together @manager", async ({
  page,
}) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  await section(page, "Play");
  const main = page.locator("main");
  const before = (await rawRecords(page))[0].current.wounds;
  await main
    .getByRole("button", { name: "Lose one Wound", exact: true })
    .click();
  await saved(page);
  expect((await rawRecords(page))[0].current.wounds).toBe(before - 1);
  const undo = await historyButton(page, "Undo");
  await undo.click();
  await saved(page);
  expect((await rawRecords(page))[0].current.wounds).toBe(before);
  if (await page.locator("#creator-menu[open]").count())
    await page.keyboard.press("Escape");
  await main
    .getByRole("button", { name: "Add status entry", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Condition", { exact: true })
    .selectOption("Bleeding");
  await dialog.getByLabel("Count", { exact: true }).fill("2");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(main.getByText("Bleeding ×2")).toBeVisible();
  await section(page, "Journal");
  await main
    .getByRole("button", { name: "Add journal entry", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title", { exact: true }).fill("At the watchtower");
  await dialog
    .getByLabel("Notes", { exact: true })
    .fill("An uneventful night.");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await section(page, "Advance");
  await main.getByRole("button", { name: "Award XP", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("XP to award").fill("500");
  await dialog.getByLabel("Session / reason").fill("Session reward");
  await dialog
    .getByRole("button", { name: "Record change", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const prior = (await rawRecords(page))[0];
  await main
    .getByRole("button", { name: "Purchase WS +5", exact: true })
    .click();
  await saved(page);
  const after = (await rawRecords(page))[0];
  expect(after.sheet.characteristics.WS.advances).toBe(
    prior.sheet.characteristics.WS.advances + 5,
  );
  expect(after.sheet.xpUnspent).toBeLessThan(prior.sheet.xpUnspent);
  await page.reload();
  await expect(
    main.getByRole("heading", { name: "Advancement", exact: true }),
  ).toBeVisible();
  expect((await rawRecords(page))[0].journal[0].title).toBe(
    "At the watchtower",
  );
});
test("library backup restores safely, malformed batches write nothing, and downloads are real @manager @storage", async ({
  page,
}) => {
  await open(page);
  const a = freshMarijan();
  a.name = "Library original";
  await importData(page, a);
  const download = page.waitForEvent("download");
  await applicationMenu(page);
  await page
    .getByRole("button", { name: "Back up library", exact: true })
    .filter({ visible: true })
    .click();
  const file = await download;
  const backup = JSON.parse(await readFile(await file.path(), "utf8"));
  expect(backup.characters).toHaveLength(1);
  await importData(page, backup);
  expect(await rawRecords(page)).toHaveLength(2);
  const bad = structuredClone(backup);
  bad.characters.push({ ...bad.characters[0], id: "bad", sheet: {} });
  await page
    .getByLabel("Import character JSON", { exact: true })
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(bad)),
    });
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
  expect(await rawRecords(page)).toHaveLength(2);
});
test("conflicting tabs preserve the stored character and expose an unsaved copy @manager @storage", async ({
  page,
  context,
}) => {
  await open(page);
  const s = freshMarijan();
  s.name = "Conflict original";
  await importData(page, s);
  const second = await context.newPage();
  await second.goto(page.url());
  await expect(second.locator("#manager-character-name")).toHaveText(s.name);
  await profile(page, "First tab");
  await second
    .getByRole("button", { name: "Edit profile", exact: true })
    .click();
  await second.locator("#manager-name").fill("Second tab");
  await second
    .getByRole("button", { name: "Save profile", exact: true })
    .click();
  await expect(second.getByRole("dialog").getByRole("alert")).toContainText(
    "another tab",
  );
  await second
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await second
    .getByRole("button", { name: "Discard changes", exact: true })
    .click();
  await expect(second.locator("main").getByRole("alert")).toContainText(
    "another tab",
  );
  expect((await rawRecords(page))[0].sheet.name).toBe("First tab");
  await expect(
    second.getByRole("button", { name: "Download unsaved copy", exact: true }),
  ).toBeVisible();
  await second.close();
});
test("green shell, joined edges, menus and long names fit phone, tablet and wide desktop @manager @interface", async ({
  page,
}) => {
  await open(page);
  const s = freshMarijan();
  s.name =
    "An exceptionally long character name with a distant ancestral title ".repeat(
      3,
    );
  await importData(page, s);
  for (const width of [320, 768, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".manager-folio")).toHaveCount(0);
    await expect(page.locator(".manager-resource-band")).toHaveCount(1);
    await expect(
      page
        .getByRole("navigation", { name: "Character sections" })
        .getByRole("button"),
    ).toHaveCount(3);
    const fits = await page
      .locator(".manager-resource-controls")
      .evaluateAll((els) =>
        els.every(
          (el) =>
            el.getBoundingClientRect().right <=
            el.parentElement.getBoundingClientRect().right + 1,
        ),
      );
    expect(fits).toBe(true);
    if (width > 1100) {
      const rail = page.getByRole("complementary", {
        name: "Application menu",
      });
      await expect(rail).toBeVisible();
      await rail.locator(".workspace-switcher > summary").click();
      await expect(rail.getByRole("link")).toHaveCount(4);
      await rail.locator(".workspace-switcher > summary").click();
      await expect(
        rail.getByRole("button", { name: "Character library", exact: true }),
      ).toBeVisible();
      await expect(
        rail.getByRole("button", { name: "New & import", exact: true }),
      ).toBeVisible();
      await rail.getByRole("button", { name: "More", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Install app", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      const joined = await page
        .locator(".workspace-rail")
        .evaluate(
          (el) =>
            Math.abs(
              el.getBoundingClientRect().right -
                document.querySelector(".manager-main").getBoundingClientRect()
                  .left,
            ) < 1,
        );
      expect(joined).toBe(true);
      await rail
        .getByRole("button", { name: "Save & export", exact: true })
        .click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Restore library backup", exact: true })
        .click();
      await expect(
        page.getByRole("dialog", {
          name: "Restore library backup",
          exact: true,
        }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(
        rail.getByRole("button", {
          name: "Save & export",
          exact: true,
        }),
      ).toBeFocused();
    } else {
      await expect(page.locator(".workspace-rail")).not.toBeVisible();
      await page.getByRole("button", { name: "Open manager menu" }).click();
      await expect(
        page.getByRole("dialog", { name: "Manager menu", exact: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: "More", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Install app", exact: true }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Open manager menu" }),
      ).toBeFocused();
    }
  }
});
test("archiving retains the character and exports do not carry creator mode branding @manager @exports", async ({
  page,
}) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  await applicationMenu(page);
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export PDF sheet", exact: true })
    .filter({ visible: true })
    .click();
  const pdf = await download;
  expect(pdf.suggestedFilename()).toMatch(/sheet\.pdf$/);
  expect((await readFile(await pdf.path())).slice(0, 4).toString()).toBe(
    "%PDF",
  );
  await applicationMenu(page, "More");
  await page
    .getByRole("button", { name: "Archive character", exact: true })
    .filter({ visible: true })
    .click();
  await saved(page);
  await library(page);
  await page.locator("#manager-filter").selectOption("archived");
  await expect(page.locator("main article")).toHaveCount(1);
  expect((await rawRecords(page))[0].archived).toBe(true);
});

test("backup skip/replace respects IDs, and portraits remain in the local record @manager @storage", async ({
  page,
}) => {
  await open(page);
  const draft = freshMarijan();
  draft.name = "Restore target";
  await importData(page, draft);
  const original = (await rawRecords(page))[0];
  const backup = {
    type: "wfrp-manager-library",
    schemaVersion: 1,
    characters: [original],
  };
  async function restore(policy) {
    await page
      .getByLabel("Import character JSON", { exact: true })
      .setInputFiles({
        name: "backup.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(backup)),
      });
    await page
      .getByRole("dialog")
      .getByLabel("When importing")
      .selectOption(policy);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Import 1 character", exact: true })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  await restore("skip");
  expect(await rawRecords(page)).toHaveLength(1);
  backup.characters[0].sheet.name = "Restored from backup";
  await restore("replace");
  await expect(page.locator("#manager-character-name")).toHaveText(
    "Restored from backup",
  );
  expect((await rawRecords(page))[0].id).toBe(original.id);
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page
    .getByLabel("Import character portrait", { exact: true })
    .setInputFiles({
      name: "portrait.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQ0AAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect(page.locator(".manager-profile-portrait")).toBeVisible();
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".manager-portrait")).toBeVisible();
  await saved(page);
  expect((await rawRecords(page))[0].portrait).toMatch(
    /^data:image\/png;base64,/,
  );
  await page.reload();
  await expect(page.locator(".manager-portrait")).toBeVisible();
});

test("Undo histories stay with their characters when switching the library @manager", async ({
  page,
}) => {
  await open(page);
  const a = freshMarijan();
  a.name = "First character";
  await importData(page, a);
  await profile(page, "First character edited");
  await library(page);
  const b = freshMarijan();
  b.name = "Second character";
  await importData(page, b);
  await expect(await historyButton(page, "Undo")).toBeDisabled();
  await library(page);
  await page
    .locator("main article")
    .filter({
      has: page.getByRole("heading", {
        name: "First character edited",
        exact: true,
      }),
    })
    .getByRole("button", { name: "First character edited", exact: true })
    .click();
  await (await historyButton(page, "Undo")).click();
  await saved(page);
  await expect(page.locator("#manager-character-name")).toHaveText(
    "First character",
  );
  expect(
    (await rawRecords(page)).find((x) => x.sheet.name === "Second character"),
  ).toBeTruthy();
});

test("profile drafts require Save, closing protects changes, and abilities live on Play without favourites @manager", async ({
  page,
}) => {
  await open(page);
  const draft = await pcDraft({ complete: true });
  await importData(page, draft);
  await expect(page.locator("#manager-name")).toHaveCount(0);
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Edit profile", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page.locator("#manager-name").fill("A deliberate profile change");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Discard",
  );
  expect((await rawRecords(page))[0].sheet.name).toBe(draft.name);
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#manager-character-name")).toHaveText(
    "A deliberate profile change",
  );
  await section(page, "Abilities");
  await expect(page.locator(".manager-ability-sections")).toBeVisible();
  await expect(
    page.locator(".manager-ability-sections .manager-favourite"),
  ).toHaveCount(0);
  await expect(page.locator(".manager-play-favourites")).toHaveCount(0);
  await expect(page.locator(".manager-resource-band")).toHaveCount(1);
  await expect(
    page
      .locator(
        ".workspace-manager-sections [aria-current='page'], .manager-navigation [aria-current='page']",
      )
      .filter({ visible: true }),
  ).toHaveText("Play");
});

test("money uses explicit denominations and equipment quantity updates its price before a gift acquisition @manager", async ({
  page,
}) => {
  await open(page);
  const draft = freshMarijan();
  draft.name = "Equipment keeper";
  draft.coins = { gc: 2, ss: 0, d: 0 };
  await importData(page, draft);
  const money = (r) =>
    r.sheet.coins.gc * 240 + r.sheet.coins.ss * 12 + r.sheet.coins.d;
  await section(page, "Gear");
  await page
    .getByRole("button", { name: "Receive money", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Silver shillings", { exact: true })
    .fill("2");
  await page
    .getByRole("dialog")
    .getByLabel("Brass pennies", { exact: true })
    .fill("3");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Receive money", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(money((await rawRecords(page))[0])).toBe(507);
  await page.getByRole("button", { name: "Spend money", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Silver shillings", { exact: true })
    .fill("1");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Spend money", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(money((await rawRecords(page))[0])).toBe(495);
  await page
    .getByRole("button", { name: "Acquire equipment", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Find catalogue entry", { exact: true })
    .fill("Dagger");
  const option = await dialog
    .getByLabel("Catalogue entry", { exact: true })
    .evaluate(
      (el) => [...el.options].find((x) => x.text.startsWith("Dagger ·")).value,
    );
  await dialog
    .getByLabel("Catalogue entry", { exact: true })
    .selectOption(option);
  await expect
    .poll(async () =>
      Number(
        await dialog
          .getByLabel("Total price paid (pennies)", { exact: true })
          .inputValue(),
      ),
    )
    .toBeGreaterThan(0);
  const unit = Number(
    await dialog
      .getByLabel("Total price paid (pennies)", { exact: true })
      .inputValue(),
  );
  await dialog.getByLabel("Quantity", { exact: true }).fill("2");
  await expect(
    dialog.getByLabel("Total price paid (pennies)", { exact: true }),
  ).toHaveValue(String(unit * 2));
  await dialog.getByLabel("Gift / loot (no payment)", { exact: true }).check();
  await dialog
    .getByRole("button", { name: "Acquire equipment", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const after = (await rawRecords(page))[0];
  expect(money(after)).toBe(495);
  expect(
    after.sheet.entries.gear
      .filter((x) => x.name === "Dagger")
      .reduce((sum, x) => sum + x.amount, 0),
  ).toBe(2);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Gear", exact: true }),
  ).toBeVisible();
});

test("ability details survive navigation while search and XP actions stay in Advance @manager", async ({
  page,
}) => {
  await open(page);
  await importData(page, await pcDraft({ complete: true }));
  await section(page, "Abilities");
  const row = page.locator(".manager-entry-row").filter({
    has: page.locator("summary strong").getByText("Doomed", { exact: true }),
  });
  await row.locator("summary").first().click();
  await section(page, "Advance");
  await page
    .getByRole("group", { name: "Advancement categories" })
    .getByRole("button", { name: "Skills", exact: true })
    .click();
  await page.getByLabel("Find advancement", { exact: true }).fill("Dodge");
  await expect(
    page.getByLabel("Find advancement", { exact: true }),
  ).toHaveValue("Dodge");
  await expect(
    page
      .getByRole("group", { name: "Advancement categories" })
      .getByRole("button", { name: "Skills", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goBack();
  await expect(
    page.getByLabel("Find an owned ability", { exact: true }),
  ).toHaveCount(0);
  await expect(row.locator("details").first()).toHaveAttribute("open", "");
  await section(page, "Advance");
  await page.locator(".manager-purchases summary").click();
  await page
    .getByRole("button", { name: "View complete history", exact: true })
    .click();
  await expect(
    page
      .getByRole("group", { name: "Journal views" })
      .getByRole("button", { name: "History", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await library(page);
  await page
    .getByLabel("Find a character", { exact: true })
    .fill("no such character");
  await expect(
    page.getByRole("heading", { name: "No matching characters", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear search and filters", exact: true })
    .click();
});

test("every mode retains the shared header and a stable menu-before-search order @manager @interface", async ({
  page,
}) => {
  let headerHeight;
  for (const route of [
    "/?verify=1",
    "/bestiary/?verify=1",
    "/marijan/?verify=1",
    "/manager/?verify=1",
  ]) {
    await page.goto(route);
    await expect(page.locator("#creator-main")).toBeVisible();
    if (page.viewportSize().width <= 1100)
      await page
        .locator("#compact-menu .mobile-menu-launcher")
        .waitFor({ state: "attached" });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".masthead")).toHaveCount(1);
    await expect(page.locator(".masthead .ledger-emblem")).toBeVisible();
    const height = (await page.locator(".masthead").boundingBox()).height;
    if (headerHeight === undefined) headerHeight = height;
    else expect(Math.abs(headerHeight - height)).toBeLessThanOrEqual(2);
    if (await page.locator("#compact-menu .mobile-menu-launcher").isVisible()) {
      await expect(
        page.locator("#compact-search .book-search-launcher"),
      ).toBeVisible();
      const menu = await page.locator("#compact-menu button").boundingBox();
      const search = await page.locator("#compact-search button").boundingBox();
      expect(menu.x + menu.width).toBeLessThanOrEqual(search.x);
      const order = await page
        .locator("#compact-tools")
        .evaluate((el) =>
          [...el.querySelectorAll("button")].map((x) => x.className),
        );
      expect(order[0]).toContain("mobile-menu-launcher");
      expect(order[1]).toContain("book-search-launcher");
    }
  }
});

test("large manual scores remain readable on one line without page overflow @manager", async ({
  page,
}) => {
  await open(page);
  const draft = freshMarijan();
  draft.name = "Long numerical values";
  draft.characteristics.WS.initial = 123456;
  await importData(page, draft);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const characteristics = page.getByRole("button", {
      name: "Characteristics",
      exact: true,
    });
    if ((await characteristics.getAttribute("aria-expanded")) === "false")
      await characteristics.click();
    const measurement = await page
      .locator(".manager-stat-button")
      .first()
      .evaluate((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return {
          lines: range.getClientRects().length,
          scroll: el.scrollWidth,
          width: el.clientWidth,
          page: document.documentElement.scrollWidth,
          viewport: innerWidth,
        };
      });
    expect(measurement.lines).toBe(1);
    expect(measurement.scroll).toBeLessThanOrEqual(measurement.width + 1);
    expect(measurement.page).toBeLessThanOrEqual(measurement.viewport);
  }
});

test("compact identity, combat cards and collapsible abilities keep long names and panels contained @manager", async ({
  page,
}) => {
  await open(page);
  const draft = await pcDraft({ complete: true });
  draft.name = "AlexandervonUnbrokenName".repeat(12);
  await importData(page, draft);
  await page.evaluate(() => document.fonts.ready);
  const combat = page.getByRole("region", { name: "Combat", exact: true });
  for (const name of ["Ready attacks", "Protection"])
    await expect(
      combat.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  await expect(
    combat.getByRole("group", { name: "Current Wounds", exact: true }),
  ).toBeVisible();
  await expect(combat.getByText("Movement", { exact: true })).toBeVisible();
  for (const width of [1440, 2560, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator("#manager-character-name")).toHaveAttribute(
      "title",
      draft.name,
    );
    const layout = await page.locator(".manager-main").evaluate((main) => {
      const heading = main.querySelector("#manager-character-name");
      const range = document.createRange();
      range.selectNodeContents(heading);
      const cards = [
        ...main.querySelectorAll(".manager-play .manager-card"),
      ].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          title: el.getAttribute("aria-label"),
          x: r.x,
          y: r.y,
          right: r.right,
          bottom: r.bottom,
        };
      });
      const pair = [...main.querySelectorAll(".manager-luck-pair > *")].map(
        (el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, right: r.right };
        },
      );
      return {
        headerHeight: main
          .querySelector(".manager-character-header")
          .getBoundingClientRect().height,
        ellipsis: getComputedStyle(heading).textOverflow,
        whiteSpace: getComputedStyle(heading).whiteSpace,
        pageWidth: document.documentElement.scrollWidth,
        pair,
        cards,
      };
    });
    expect(layout.ellipsis).toBe("ellipsis");
    expect(layout.whiteSpace).toBe("nowrap");
    expect(layout.headerHeight).toBeLessThan(width < 720 ? 115 : 85);
    expect(layout.pageWidth).toBeLessThanOrEqual(width);
    expect(layout.pair).toHaveLength(2);
    expect(Math.abs(layout.pair[0].y - layout.pair[1].y)).toBeLessThan(2);
    expect(layout.pair[0].right).toBeLessThanOrEqual(layout.pair[1].x);
    for (let i = 0; i < layout.cards.length; i++)
      for (let j = i + 1; j < layout.cards.length; j++) {
        const a = layout.cards[i],
          b = layout.cards[j];
        const overlap =
          Math.min(a.right, b.right) - Math.max(a.x, b.x) > 1 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 1;
        expect(
          overlap,
          `${width}px: ${a.title} must not overlap ${b.title}`,
        ).toBe(false);
      }
    if (width < 720) {
      expect(
        [...layout.cards]
          .sort((a, b) => a.y - b.y)
          .slice(0, 2)
          .map((x) => x.title),
      ).toEqual(["Combat", "Status & afflictions"]);
      for (const title of [
        "Combat",
        "Status & afflictions",
        "Skills",
        "Talents",
        "Magic & Faith",
        "Other abilities",
        "Gear",
        "Characteristics",
      ]) {
        const toggle = page.getByRole("button", { name: title, exact: true });
        const wasOpen = await toggle.getAttribute("aria-expanded");
        await toggle.click();
        await expect(toggle).toHaveAttribute(
          "aria-expanded",
          String(wasOpen !== "true"),
        );
        const body = page.locator(
          `[id="${await toggle.getAttribute("aria-controls")}"]`,
        );
        if (wasOpen === "true") await expect(body).toBeHidden();
        else await expect(body).toBeVisible();
        await toggle.click();
      }
      await expect(
        page.getByRole("button", { name: "Characteristics", exact: true }),
      ).toHaveAttribute("aria-expanded", "false");
      await expect(
        page.getByRole("button", { name: "Status & afflictions", exact: true }),
      ).toHaveAttribute("aria-expanded", "false");
    }
  }
  await section(page, "Abilities");
  const skills = page.getByRole("region", { name: "Skills", exact: true });
  await expect(
    skills.locator(
      "details, summary, .manager-skill-row button, .manager-skill-row a, .manager-skill-row [tabindex]",
    ),
  ).toHaveCount(0);
  expect(
    await skills
      .locator(".manager-skill-row")
      .first()
      .evaluate((el) => getComputedStyle(el).cursor),
  ).toBe("default");
  for (const title of [
    "Skills",
    "Talents",
    "Magic & Faith",
    "Other abilities",
  ]) {
    const toggle = page.getByRole("button", { name: title, exact: true });
    if ((await toggle.getAttribute("aria-expanded")) === "false")
      await toggle.click();
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  }
  await section(page, "Advance");
  await section(page, "Play");
  await expect(
    page.getByRole("button", { name: "Skills", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  expect((await rawRecords(page))[0].sheet.name).toBe(draft.name);
});
