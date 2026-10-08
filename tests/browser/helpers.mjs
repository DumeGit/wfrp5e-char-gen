import { test as base, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { assembleBooks, bookSelection } from "../../dist/books.mjs";
import * as rules from "../../dist/rules.mjs";
import { freshGM } from "../../dist/gm/model.mjs";

export { expect };
export const PC_STORAGE = "wfrp-fifth-character-ledger-v2-verification";
export const test = base.extend({
  diagnostics: [
    async ({ page }, use, info) => {
      const errors = [],
        logs = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (["error", "warning"].includes(m.type()))
          logs.push(`${m.type()}: ${m.text()}`);
      });
      page.on("requestfailed", (r) =>
        logs.push(`Request failed: ${r.url()} ${r.failure()?.errorText}`),
      );
      await use();
      if (info.status !== info.expectedStatus || errors.length)
        await info.attach("browser-diagnostics", {
          body: JSON.stringify({ errors, logs }, null, 2),
          contentType: "application/json",
        });
      expect(errors, "No uncaught browser JavaScript errors").toEqual([]);
    },
    { auto: true },
  ],
});
let content;
async function fixtures() {
  content ||= Promise.all([
    readFile(
      new URL("../../dist/data/book-library.json", import.meta.url),
      "utf8",
    ).then(JSON.parse),
    readFile(new URL("../../dist/gm/data.json", import.meta.url), "utf8").then(
      JSON.parse,
    ),
  ]).then(([library, gm]) => ({ library, gm, R: assembleBooks(library) }));
  return content;
}
export async function pcDraft({ complete = false } = {}) {
  const { R } = await fixtures();
  const s = {
    ...rules.fresh(),
    version: 2,
    books: bookSelection(R),
    rollTables: {},
  };
  if (complete)
    Object.assign(s, {
      name: "Browser Test Soldier",
      appearance: "Test fixture",
      points: [16, 6, 15, 15, 9, 12, 5, 6, 12, 4],
      randomTalents: [
        "Read/Write",
        "Super Numerate",
        "Cardsharp",
        "Attractive",
      ],
      freeTalent: "Warrior Born",
      speciesSkills: ["s-10", "s-2", "s-4", "s-8", "s-9"],
      skillChoices: { "c1-7": "Melee (Polearm)", "c1-9": "Ranged (Bow)" },
      careerSkills: {
        "c1-7": 2,
        "c1-4": 1,
        "c1-3": 1,
        "c1-0": 1,
        "c1-1": 1,
        "c1-5": 1,
        "c1-9": 1,
      },
      gearChoices: { "career-2": "Halberd (2H)" },
      wealth: { amount: 71, currency: "brass pennies" },
    });
  if (complete)
    expect(
      rules.validation(R, s),
      "Complete fixture uses current real creation rules",
    ).toEqual([]);
  return s;
}
export async function gmDraft(name = "Human") {
  const { gm } = await fixtures();
  return {
    ...freshGM(gm, gm.profiles.find((p) => p.name === name).id),
    name: "Browser Test NPC",
  };
}
export async function openPC(page, options = {}) {
  const draft = await pcDraft(options);
  await page.addInitScript(
    ({ key, draft }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(draft));
    },
    { key: PC_STORAGE, draft },
  );
  await page.goto("/?verify=1");
  await expect(
    page.getByRole("heading", { name: "Origins & identity", exact: true }),
  ).toBeVisible();
}
export async function openGM(page) {
  await page.goto("/gm.html?verify=1");
  await expect(
    page.getByRole("heading", { name: "Starting profile", exact: true }),
  ).toBeVisible();
}
export async function pcStep(page, name) {
  const select = page.getByRole("combobox", {
    name: "Creation step",
    exact: true,
  });
  if (await select.isVisible())
    await select.selectOption(
      await select
        .getByRole("option")
        .filter({ hasText: name })
        .getAttribute("value"),
    );
  else
    await page
      .getByRole("navigation", { name: "Character creation steps" })
      .getByRole("button", { name: new RegExp(name) })
      .click();
}
export async function gmStep(page, name) {
  const select = page.getByRole("combobox", {
    name: "Workshop page",
    exact: true,
  });
  if (await select.isVisible()) await select.selectOption({ label: name });
  else
    await page
      .getByRole("navigation", { name: "Workshop pages" })
      .getByRole("button", { name: new RegExp(name) })
      .click();
}
export async function search(page, text = "") {
  const launch = page.getByRole("button", {
    name: /^Search (rules and book references|books:)/,
  });
  if (await launch.isVisible()) await launch.click();
  const input = page.getByRole("combobox", {
    name: "Search the books",
    exact: true,
  });
  await expect(input).toBeEnabled();
  await input.fill(text);
  if (!text) await input.click();
  await expect(
    page
      .getByRole("combobox", { name: "Search category", exact: true })
      .getByRole("option", { name: "Rules", exact: true }),
  ).toBeAttached();
  return input;
}
export async function applyProfile(page, name) {
  await page
    .getByRole("textbox", { name: "Find a profile", exact: true })
    .fill(name);
  await page
    .locator(".gm-profile-card")
    .filter({ has: page.getByText(name, { exact: true }) })
    .click();
  await page
    .getByRole("dialog", { name, exact: true })
    .getByRole("button", { name: "Use this profile", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toBeVisible();
}
export async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const dialogs = page.locator("dialog[open]");
  for (const dialog of await dialogs.all()) {
    expect(
      await dialog.evaluate((e) => {
        const r = e.getBoundingClientRect();
        return r.left >= -1 && r.right <= innerWidth + 1;
      }),
    ).toBe(true);
  }
}
export async function fileUpload(page, trigger, object, filename) {
  const choosing = page.waitForEvent("filechooser");
  await trigger.click();
  await (
    await choosing
  ).setFiles({
    name: filename,
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(object)),
  });
}
export async function downloadBytes(page, trigger) {
  const pending = page.waitForEvent("download");
  await trigger.click();
  const download = await pending;
  expect(await download.failure()).toBeNull();
  return {
    name: download.suggestedFilename(),
    bytes: await readFile(await download.path()),
  };
}
