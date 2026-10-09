import {
  test,
  expect,
  downloadBytes,
  noOverflow,
  pcDraft,
  revealCreatorTool,
} from "./helpers.mjs";
import { PDFDocument } from "pdf-lib";
const open = async (page) => {
  await page.goto("/marijan.html?verify=1");
  await expect(
    page.getByRole("heading", { name: "Marijan Mode", exact: true }),
  ).toBeVisible();
};
async function add(page, group, name) {
  const find = page.locator(`#mm-find-${group}`);
  await find.fill(name);
  await page
    .locator(`#mm-results-${group}`)
    .getByRole("button", { name: `Add ${name}`, exact: true })
    .click();
}
test("one-page unrestricted editing and stable inline additions @marijan @mobile", async ({
  page,
}, info) => {
  await open(page);
  await page.getByLabel("Name", { exact: true }).fill("Marijan Test");
  await page.getByLabel("Strength initial", { exact: true }).fill("45");
  await page.getByText("Advances & other modifiers", { exact: true }).click();
  await page.getByLabel("Strength advances", { exact: true }).fill("17");
  await page.getByLabel("XP unspent", { exact: true }).fill("-99");
  await page.getByLabel("Career level", { exact: true }).fill("8");
  await add(page, "skills", "Climb");
  await page.getByLabel("Climb advances", { exact: true }).fill("3");
  await expect(page.getByLabel("Climb total", { exact: true })).toHaveValue(
    "65",
  );
  await add(page, "talents", "Strong Back");
  await page.getByLabel("Strong Back ranks", { exact: true }).fill("7");
  await add(page, "magic", "Blessing of Battle");
  await page.getByLabel("Edit Climb details", { exact: true }).click();
  await page
    .getByLabel("Climb total: switch to manual", { exact: true })
    .click();
  await page.getByLabel("Climb total", { exact: true }).fill("90");
  await page.getByLabel("Strength initial", { exact: true }).fill("50");
  await expect(page.getByLabel("Climb total", { exact: true })).toHaveValue(
    "90",
  );
  await expect(page.locator("#mm-find-talents")).toHaveValue("Strong Back");
  await noOverflow(page);
  await page.locator("#mm-section-skills").scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath("marijan-editor.png") });
});
test("manual resource override and undo survive saving and reloading @marijan @storage @mobile", async ({
  page,
}) => {
  await open(page);
  await page.getByLabel("Wounds: switch to manual", { exact: true }).click();
  await page.getByLabel("Wounds", { exact: true }).fill("77");
  await page.getByLabel("Toughness initial", { exact: true }).fill("60");
  await expect(page.getByLabel("Wounds", { exact: true })).toHaveValue("77");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Toughness initial", { exact: true }),
  ).toHaveValue("0");
  await expect(page.getByLabel("Wounds", { exact: true })).toHaveValue("77");
  await page.reload();
  await expect(page.getByLabel("Wounds", { exact: true })).toHaveValue("77");
  const save = await downloadBytes(
    page,
    page.getByRole("button", { name: "Save character", exact: true }),
  );
  const draft = JSON.parse(save.bytes.toString());
  expect(draft.type).toBe("wfrp-marijan");
  expect(draft.overrides.wounds).toBe(77);
  await revealCreatorTool(
    page,
    page.getByRole("button", { name: "New character", exact: true }),
  );
  await page
    .getByRole("button", { name: "New character", exact: true })
    .click();
  await expect(page.getByLabel("Wounds", { exact: true })).toHaveValue("0");
  await revealCreatorTool(
    page,
    page.getByRole("button", { name: "Load character", exact: true }),
  );
  await page
    .getByRole("button", { name: "Load character", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Load Marijan character" })
    .getByRole("button", { name: "Load", exact: true })
    .click();
  await expect(page.getByLabel("Wounds", { exact: true })).toHaveValue("77");
});
test("custom entries and real editable PDF export need no legal character @marijan @exports", async ({
  page,
}) => {
  await open(page);
  await page.getByLabel("Name", { exact: true }).fill("Freeform Hero");
  await page
    .locator("#mm-section-talents")
    .getByRole("button", { name: "+ Custom", exact: true })
    .click();
  await page.getByLabel("Name", { exact: true }).last().fill("Custom power");
  await page.getByRole("button", { name: "Add entry", exact: true }).click();
  await page.getByLabel("Custom power ranks", { exact: true }).fill("12");
  const download = await downloadBytes(
    page,
    page.getByRole("button", {
      name: "Export character sheet PDF",
      exact: true,
    }),
  );
  const pdf = await PDFDocument.load(download.bytes);
  expect(pdf.getForm().getTextField("Name").getText()).toBe("Freeform Hero");
  expect(pdf.getForm().getTextField("Talent_01_Name").getText()).toBe(
    "Custom power x12",
  );
  expect(pdf.getPageCount()).toBeGreaterThan(2);
});
test("copy Player character does not alter its original draft @marijan @storage", async ({
  page,
}) => {
  const pc = await pcDraft({ complete: true }),
    key = "wfrp-fifth-character-ledger-v2-verification";
  await page.addInitScript(
    ({ pc, key }) => localStorage.setItem(key, JSON.stringify(pc)),
    { pc, key },
  );
  await open(page);
  await revealCreatorTool(
    page,
    page.getByRole("button", { name: "Copy player character", exact: true }),
  );
  await page
    .getByRole("button", { name: "Copy player character", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Copy this device’s player draft",
      exact: true,
    })
    .click();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(pc.name);
  expect(
    JSON.parse(await page.evaluate((key) => localStorage.getItem(key), key)),
  ).toEqual(pc);
  await expect(
    page.getByLabel("Apply Characteristic & Movement Talent bonuses"),
  ).not.toBeChecked();
});

test("custom identity stays visible and every input has a unique id @marijan @mobile", async ({
  page,
}) => {
  await open(page);
  await page.getByText("Custom Species or Career", { exact: true }).click();
  await page.getByLabel("Species name", { exact: true }).fill("Orc");
  await page.getByLabel("Career name", { exact: true }).fill("Freebooter");
  await expect(page.getByLabel("Species", { exact: true })).toHaveValue("Orc");
  await expect(page.getByLabel("Career", { exact: true })).toHaveValue(
    "Freebooter",
  );
  const duplicates = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(duplicates).toEqual([]);
});

test("creator switch uses shared bordered rail and compact desktop fields @marijan @mobile", async ({
  page,
}, info) => {
  await open(page);
  const rail = page.locator(".rail.mm-rail");
  if (info.project.name === "mobile") {
    await page
      .getByRole("button", { name: "Open creator menu", exact: true })
      .click();
    await expect(
      page
        .getByRole("dialog", { name: "Creator menu", exact: true })
        .getByRole("navigation", { name: "Creator", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Close creator menu", exact: true })
      .click();
  } else
    await expect(
      rail.getByRole("navigation", { name: "Creator", exact: true }),
    ).toBeVisible();
  await expect(page.locator("#app > .creator-switch")).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("marijan-compact.png") });
});

test("random 5e generation previews, records promotions, exports and undoes replacement @marijan @mobile @exports", async ({
  page,
}, info) => {
  await open(page);
  await page.getByLabel("Name", { exact: true }).fill("Random tester");
  await page
    .getByLabel("Career", { exact: true })
    .selectOption("core:careers:soldier");
  await page.getByLabel("XP unspent", { exact: true }).fill("321");
  await page
    .getByRole("button", { name: "Generate character", exact: true })
    .click();
  await page
    .getByLabel("Target Career level", { exact: true })
    .selectOption("2");
  await page
    .getByRole("button", { name: "Preview random character", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Use generated character", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("XP unspent", { exact: true })).toHaveValue(
    "321",
  );
  await page
    .getByRole("button", { name: "Use generated character", exact: true })
    .click();
  await expect(page.getByLabel("Career level", { exact: true })).toHaveValue(
    "2",
  );
  await expect(page.getByLabel("Tracker boxes", { exact: true })).toHaveValue(
    "10",
  );
  await expect(page.getByLabel("XP unspent", { exact: true })).toHaveValue("0");
  const record = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("wfrp-marijan-v1-verification")),
  );
  expect(
    record.generation.purchases.filter((x) => x.type === "promotion"),
  ).toHaveLength(1);
  expect(record.xpSpent).toBe(
    record.generation.purchases.reduce((n, x) => n + x.cost, 0),
  );
  const downloaded = await downloadBytes(
    page,
    page.getByRole("button", {
      name: "Export character sheet PDF",
      exact: true,
    }),
  );
  const pdf = await PDFDocument.load(downloaded.bytes);
  expect(pdf.getForm().getTextField("XP_Spent").getText()).toBe(
    String(record.xpSpent),
  );
  await info.attach("marijan-generated.pdf", {
    body: downloaded.bytes,
    contentType: "application/pdf",
  });
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Career level", { exact: true })).toHaveValue(
    "1",
  );
  await expect(page.getByLabel("XP unspent", { exact: true })).toHaveValue(
    "321",
  );
  await page
    .getByRole("button", { name: "Add Species Skills", exact: true })
    .click();
  await expect(
    page.getByLabel("Language (Reikspiel) advances", { exact: true }),
  ).toHaveValue("30");
  await expect(page.getByLabel("XP unspent", { exact: true })).toHaveValue(
    "321",
  );
  await noOverflow(page);
});

test("compact scores and entry rows keep quick edits and detailed overrides accessible @marijan @mobile", async ({
  page,
}, info) => {
  await open(page);
  await page.getByLabel("Strength initial", { exact: true }).fill("42");
  const overview = page.locator(".mm-char-overview");
  expect((await overview.boundingBox()).height).toBeLessThan(
    info.project.name === "mobile" ? 280 : 120,
  );
  await expect(
    page.getByLabel("Strength advances", { exact: true }),
  ).toBeHidden();
  await page.getByText("Advances & other modifiers", { exact: true }).click();
  await page.getByLabel("Strength advances", { exact: true }).fill("7");
  await expect(overview.locator('[data-result="stat:S"]')).toHaveText("49");
  await page.getByText("Advances & other modifiers", { exact: true }).click();
  await page.locator("#mm-section-characteristics").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("compact-characteristics.png"),
  });
  for (const name of ["Climb", "Dodge", "Perception"])
    await add(page, "skills", name);
  await add(page, "talents", "Strong Back");
  await add(page, "talents", "Hardy");
  await add(page, "gear", "Leather Jerkin");
  for (const group of ["skills", "talents", "gear"]) {
    for (const row of await page.locator(`#mm-list-${group} .mm-entry`).all()) {
      expect((await row.boundingBox()).height).toBeLessThan(
        info.project.name === "mobile" ? 95 : 75,
      );
    }
    await page.locator(`#mm-section-${group}`).scrollIntoViewIfNeeded();
    await noOverflow(page);
    await page.screenshot({ path: info.outputPath(`compact-${group}.png`) });
  }
  await page.getByLabel("Edit Climb details", { exact: true }).click();
  await page
    .getByLabel("Climb Characteristic", { exact: true })
    .selectOption("Ag");
  await page
    .getByLabel("Climb total: switch to manual", { exact: true })
    .click();
  await page.getByLabel("Climb total", { exact: true }).fill("88");
  await expect(page.getByLabel("Climb total", { exact: true })).toHaveValue(
    "88",
  );
  await page.getByLabel("Strong Back ranks", { exact: true }).fill("3");
  await page.getByLabel("Leather Jerkin quantity", { exact: true }).fill("2");
  await page.getByLabel("Edit Leather Jerkin details", { exact: true }).click();
  await page
    .getByLabel("Leather Jerkin location", { exact: true })
    .selectOption("worn");
  await noOverflow(page);
  await page.reload();
  await expect(page.getByLabel("Climb total", { exact: true })).toHaveValue(
    "88",
  );
  await expect(
    page.getByLabel("Strong Back ranks", { exact: true }),
  ).toHaveValue("3");
  await expect(
    page.getByLabel("Leather Jerkin quantity", { exact: true }),
  ).toHaveValue("2");
  if (info.project.name === "mobile") {
    await page.setViewportSize({ width: 320, height: 844 });
    await noOverflow(page);
  }
});
