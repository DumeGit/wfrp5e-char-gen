import { readFile } from "node:fs/promises";
import { assembleGMOptions } from "../../src/engine/gm/books.mjs";
import { calculateGM } from "../../src/engine/gm/model.mjs";
import { abilityPresentation } from "../../src/engine/gm/ability-presentation.mjs";
import {
  test,
  expect,
  openGM,
  gmDraft,
  gmStep,
  fileUpload,
  downloadBytes,
  noOverflow,
} from "./helpers.mjs";

test("spell and Miracle descriptions toggle independently and survive JSON with Undo and Redo @gm @mobile @storage", async ({
  page,
}, info) => {
  const rules = assembleGMOptions(
    JSON.parse(
      await readFile(
        new URL("../../public/data/book-library.json", import.meta.url),
      ),
    ),
  );
  const data = JSON.parse(
    await readFile(new URL("../../public/gm/data.json", import.meta.url)),
  );
  const draft = await gmDraft();
  draft.talents.push({
    key: "gm-petty",
    name: "Petty Magic",
    ranks: 1,
    origin: "GM",
  });
  draft.traits.push({
    key: "gm-miracles",
    name: "Miracles",
    value: "Sigmar",
    ranks: 1,
    origin: "GM",
  });
  draft.spells = [
    "core:spells:animal-friend",
    "core:spells:beacon-of-righteous-virtue",
  ];
  delete draft.hiddenDescriptions;
  const result = calculateGM(data, rules, { ...draft, hiddenDescriptions: [] });
  const spell = result.spells.find((x) => x.name === "Animal Friend");
  const miracle = result.spells.find(
    (x) => x.name === "Beacon of Righteous Virtue",
  );
  const body = (x) => abilityPresentation("magic", x).description;
  await openGM(page);
  async function load(value) {
    await fileUpload(
      page,
      page.getByRole("button", { name: "Load draft", exact: true }),
      value,
      "magic-descriptions.json",
    );
    await page
      .getByRole("dialog", { name: "Load this GM draft?", exact: true })
      .getByRole("button", { name: "Load draft", exact: true })
      .click();
    await gmStep(page, "Equipment & magic");
  }
  await load(draft);
  const spellToggle = page.getByRole("switch", {
    name: "Animal Friend (Petty) description",
    exact: true,
  });
  const miracleToggle = page.getByRole("switch", {
    name: "Beacon of Righteous Virtue (Sigmar) description",
    exact: true,
  });
  await expect(spellToggle).toBeChecked();
  await expect(miracleToggle).toBeChecked();
  await spellToggle.uncheck();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(spellToggle).toBeChecked();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(spellToggle).not.toBeChecked();
  const row = page.locator(".gm-ability-entry").filter({ has: spellToggle });
  await row
    .getByRole("button", { name: "Read Animal Friend", exact: true })
    .click();
  const reader = page.getByRole("dialog", {
    name: "Search the books",
    exact: true,
  });
  await expect(reader).toContainText(body(spell));
  await reader
    .getByRole("button", { name: "Close search", exact: true })
    .click();
  await noOverflow(page);
  await row.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: info.outputPath("magic-description-controls.png"),
  });
  const saved = JSON.parse(
    (
      await downloadBytes(
        page,
        page.getByRole("button", { name: "Save NPC / creature", exact: true }),
      )
    ).bytes,
  );
  expect(saved.hiddenDescriptions).toEqual(["magic:core:spells:animal-friend"]);
  await gmStep(page, "Review & export");
  const output = page
    .locator(".gm-stat-section")
    .filter({ has: page.getByRole("heading", { name: /^Magic ·/ }) });
  await expect(output).toContainText("Animal Friend (Petty)");
  await expect(output).not.toContainText(body(spell));
  await expect(output).toContainText(body(miracle));
  await load(saved);
  await expect(spellToggle).not.toBeChecked();
  await expect(miracleToggle).toBeChecked();
  await miracleToggle.uncheck();
  await gmStep(page, "Review & export");
  await expect(output).toContainText("Beacon of Righteous Virtue (Sigmar)");
  await expect(output).not.toContainText(body(miracle));
  await expect(output).toContainText("Range");
});
