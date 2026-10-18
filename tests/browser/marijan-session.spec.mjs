import { test, expect, noOverflow, pcDraft, gmDraft } from "./helpers.mjs";

async function open(page) {
  await page.goto("/marijan/?verify=1");
  await expect(
    page.getByRole("heading", { name: "Marijan Mode", exact: true }),
  ).toBeVisible();
}
async function switchMode(page, name) {
  const link = page.getByRole("link", { name, exact: true });
  if (!(await link.isVisible()))
    await page
      .getByRole("button", { name: "Open creator menu", exact: true })
      .click();
  await link.click();
}

test("Marijan restores independent edits, redo and browsing across client navigation @marijan @migration @mobile", async ({
  page,
}, info) => {
  await open(page);
  await page.getByLabel("Name", { exact: true }).fill("Session character");
  await page.getByLabel("Strength initial", { exact: true }).fill("45");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Strength initial", { exact: true }),
  ).toHaveValue("0");
  await page.locator("#mm-section-skills > details > summary").click();
  await page.locator("#mm-career-search").fill("Rat");
  await page.locator("#mm-find-talents").fill("Strong Back");

  // Every round trip must use the same mode store, rather than recreating an
  // autosaved character with an empty edit history.
  for (let index = 0; index < 3; index++) {
    await switchMode(page, "NPC & creature");
    await expect(page.locator(".gm-workspace")).toBeVisible();
    await switchMode(page, "Marijan Mode");
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
      "Session character",
    );
    await expect(
      page.getByLabel("Strength initial", { exact: true }),
    ).toHaveValue("0");
    await expect(
      page.getByRole("button", { name: "Redo", exact: true }),
    ).toBeEnabled();
    await expect(page.locator("#mm-career-search")).toHaveValue("Rat");
    await expect(page.locator("#mm-find-talents")).toHaveValue("Strong Back");
    await expect(
      page.locator("#mm-section-skills > details"),
    ).not.toHaveAttribute("open", "");
  }
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(
    page.getByLabel("Strength initial", { exact: true }),
  ).toHaveValue("45");
  const fetches = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => new URL(entry.name).pathname),
  );
  expect(
    fetches.filter((url) => url === "/data/book-library.json"),
  ).toHaveLength(1);
  expect(fetches.filter((url) => url === "/gm/data.json")).toHaveLength(1);
  await page.goBack({ waitUntil: "commit" });
  await expect(page.locator(".gm-workspace")).toBeVisible();
  await page.goForward({ waitUntil: "commit" });
  await expect(
    page.getByLabel("Strength initial", { exact: true }),
  ).toHaveValue("45");
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: info.outputPath("next-marijan-session.png") });
});

test("Marijan keeps caret, blank numeric intent and automatic/manual totals stable @marijan @migration @mobile", async ({
  page,
}) => {
  await open(page);
  const name = page.getByLabel("Name", { exact: true });
  await name.fill("Stable typing");
  await name.press("Home");
  await name.press("ArrowRight");
  await name.pressSequentially("XYZ");
  await expect(name).toHaveValue("SXYZtable typing");
  expect(await name.evaluate((node) => node.selectionStart)).toBe(4);
  const strength = page.getByLabel("Strength initial", { exact: true });
  await strength.fill("");
  await expect(strength).toHaveValue("");
  await page.getByLabel("XP unspent", { exact: true }).fill("-99");
  await expect(strength).toHaveValue("0");
  await page
    .getByRole("button", { name: "Wounds: switch to manual", exact: true })
    .click();
  const wounds = page.getByLabel("Wounds", { exact: true });
  await wounds.fill("");
  await page.getByLabel("Fate", { exact: true }).click();
  await expect(wounds).toHaveAttribute("readonly", "");
  await expect(wounds).toHaveValue("0");
});

test("closed generation cannot reopen a dialog or apply a draft after navigation @marijan @migration @mobile", async ({
  page,
}) => {
  let release;
  let requested = false;
  let holdEnabled = false;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(
    /\/_next\/static\/chunks\/[^?]+\.js(?:\?|$)/,
    async (route) => {
      if (!holdEnabled || requested) return route.continue();
      const response = await route.fetch();
      const body = await response.text();
      // Match preserved generation wording rather than a development chunk name;
      // production uses hashed chunks and must exercise this same lifecycle gate.
      if (
        !body.includes("Random allocation is Marijan Mode policy.") &&
        !body.includes("Choose a printed Career before generation.")
      )
        return route.fulfill({ response });
      requested = true;
      await held;
      await route.fulfill({ response });
    },
  );
  await open(page);
  await page.getByLabel("Name", { exact: true }).fill("No late replacement");
  holdEnabled = true;
  await page
    .getByRole("button", { name: "Generate character", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", {
      name: "Generate Fifth Edition character",
      exact: true,
    }),
  ).toBeVisible();
  await expect.poll(() => requested).toBe(true);
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await switchMode(page, "NPC & creature");
  await expect(page.locator(".gm-workspace")).toBeVisible();
  release();
  await expect(
    page.getByRole("dialog", {
      name: "Generate Fifth Edition character",
      exact: true,
    }),
  ).not.toBeVisible();
  await switchMode(page, "Marijan Mode");
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "No late replacement",
  );
  await expect(page.locator("#mm-generation-record")).toBeEmpty();
  await expect(
    page.getByRole("dialog", {
      name: "Generate Fifth Edition character",
      exact: true,
    }),
  ).not.toBeVisible();
});

test("JSON file imports reject the wrong creator and replace only Marijan with undo @marijan @migration @mobile", async ({
  page,
}) => {
  await open(page);
  await page.getByLabel("Name", { exact: true }).fill("JSON source");
  await page.getByLabel("Strength initial", { exact: true }).fill("63");
  const saved = await page.evaluate(() =>
    localStorage.getItem("wfrp-marijan-v1-verification"),
  );
  const newButton = page.getByRole("button", {
    name: "New character",
    exact: true,
  });
  if (!(await newButton.isVisible()))
    await page
      .getByRole("button", { name: "Open creator menu", exact: true })
      .click();
  await newButton.click();
  await page.getByLabel("Name", { exact: true }).fill("Current draft");
  const loadButton = page.getByRole("button", {
    name: "Load character",
    exact: true,
  });
  if (!(await loadButton.isVisible()))
    await page
      .getByRole("button", { name: "Open creator menu", exact: true })
      .click();
  await loadButton.click();
  const modal = page.getByRole("dialog", {
    name: "Load Marijan character",
    exact: true,
  });
  for (const [name, draft] of [
    ["player.json", await pcDraft({ complete: true })],
    ["bestiary.json", await gmDraft()],
  ]) {
    const wrongFile = page.waitForEvent("filechooser");
    await modal
      .getByRole("button", { name: "Import JSON file", exact: true })
      .click();
    await (
      await wrongFile
    ).setFiles({
      name,
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(draft)),
    });
    await expect(modal.getByRole("alert")).toContainText(
      "valid Marijan Mode save",
    );
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
      "Current draft",
    );
  }
  const validFile = page.waitForEvent("filechooser");
  await modal
    .getByRole("button", { name: "Import JSON file", exact: true })
    .click();
  await (
    await validFile
  ).setFiles({
    name: "marijan.json",
    mimeType: "application/json",
    buffer: Buffer.from(saved),
  });
  await expect(modal).not.toBeVisible();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "JSON source",
  );
  await expect(
    page.getByLabel("Strength initial", { exact: true }),
  ).toHaveValue("63");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "Current draft",
  );
});

test("Marijan source and Legacy dialogs retain desktop phone and tablet geometry @marijan @mobile", async ({
  page,
}, info) => {
  await open(page);
  await page.getByLabel("Species", { exact: true }).selectOption("Gnome");
  await expect(page.getByLabel("Fate", { exact: true })).toHaveValue("0");
  const viewports =
    info.project.name === "mobile"
      ? [[390, 844]]
      : [
          [1440, 900],
          [800, 1280],
        ];
  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    await page
      .getByRole("button", { name: "Species reference", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Gnome", exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".notice")).toContainText("Legacy");
    await expect(dialog).toContainText("p.");
    await noOverflow(page);
    await page.screenshot({
      path: info.outputPath(`next-marijan-source-legacy-${width}.png`),
    });
    await dialog
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await noOverflow(page);
    await page.screenshot({
      path: info.outputPath(`next-marijan-shell-${width}.png`),
    });
  }
});
