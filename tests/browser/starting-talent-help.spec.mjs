import {
  test,
  expect,
  pcDraft,
  pcStep,
  noOverflow,
  PC_STORAGE,
} from "./helpers.mjs";

test("starting Talents have direct help for each real roll and chosen specialisation @pc @mobile", async ({
  page,
}, info) => {
  const draft = await pcDraft({ complete: true });
  draft.randomTalents = [];
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
  await pcStep(page, "Talents");
  const read = async (button, name) => {
    await button.scrollIntoViewIfNeeded();
    if (info.project.name === "mobile") {
      const box = await button.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await button.focus();
    await page.keyboard.press("Enter");
    const reader = page.getByRole("dialog", {
      name: "Search the books",
      exact: true,
    });
    await expect(reader.locator("#book-search-title")).toContainText(
      name.split(" (")[0],
    );
    await expect(reader.locator(".search-book-reference")).toBeVisible();
    await reader
      .getByRole("button", { name: "Close search", exact: true })
      .click();
    await expect(button).toBeFocused();
  };
  const equalTiles = async (group) => {
    const boxes = await group.locator(":scope > *").evaluateAll((nodes) =>
      nodes.map((node) => {
        const { width, height } = node.getBoundingClientRect();
        return { width, height };
      }),
    );
    expect(boxes).toHaveLength(4);
    for (const box of boxes) {
      expect(Math.abs(box.width - boxes[0].width)).toBeLessThanOrEqual(1);
      expect(Math.abs(box.height - boxes[0].height)).toBeLessThanOrEqual(1);
    }
  };
  await read(
    page
      .getByRole("group", { name: "Species Talents", exact: true })
      .getByRole("button", { name: "Read Doomed", exact: true }),
    "Doomed",
  );
  await page
    .getByRole("button", { name: "Roll 4 random Talents", exact: true })
    .click();
  const rolled = page.getByRole("group", {
    name: "Rolled Talents",
    exact: true,
  });
  await expect(rolled.locator(".rule-reference")).toHaveCount(4);
  await equalTiles(rolled);
  const career = page.getByRole("group", {
    name: "Free Career Talent",
    exact: true,
  });
  await read(
    career.getByRole("button", { name: "Read Warrior Born", exact: true }),
    "Warrior Born",
  );
  const careerBox = await career.locator(".starting-talent-chip").boundingBox();
  const speciesBox = await page
    .getByRole("group", { name: "Species Talents", exact: true })
    .locator(".starting-talent-chip")
    .first()
    .boundingBox();
  expect(Math.abs(careerBox.width - speciesBox.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(careerBox.height - speciesBox.height)).toBeLessThanOrEqual(1);
  await expect(page.locator(".talent-description")).toHaveCount(0);
  const before = await page.evaluate(
    (key) => localStorage.getItem(key),
    PC_STORAGE,
  );
  const state = JSON.parse(before);
  expect(state.randomTalents).toHaveLength(4);
  expect(state.rolls.some((row) => row.label === "Random Species Talent")).toBe(
    true,
  );
  for (const button of await rolled.locator(".rule-reference").all()) {
    const name = (await button.getAttribute("aria-label")).slice(5);
    await read(button, name);
  }
  expect(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  ).toBe(before);
  await expect(
    page.getByText("Read all your Talent rules", { exact: true }),
  ).toHaveCount(0);
  await expect(rolled.locator("p, details")).toHaveCount(0);
  await noOverflow(page);
  await rolled.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath("rolled-talent-help.png") });

  const artistic = await pcDraft({ complete: true });
  artistic.randomTalents = [
    "Artistic",
    "Read/Write",
    "Super Numerate",
    "Cardsharp",
  ];
  artistic.step = 4;
  await page.evaluate(
    ({ key, draft }) => localStorage.setItem(key, JSON.stringify(draft)),
    { key: PC_STORAGE, draft: artistic },
  );
  await page.reload();
  await expect(page.locator("main h1")).toBeVisible();
  await pcStep(page, "Talents");
  const specialisation = page.getByRole("combobox", {
    name: "Artistic specialisation",
    exact: true,
  });
  const choice = await specialisation
    .locator("option")
    .last()
    .getAttribute("value");
  await specialisation.selectOption(choice);
  await read(
    rolled.getByRole("button", { name: `Read ${choice}`, exact: true }),
    choice,
  );
  await expect(specialisation).toHaveValue(choice);
  await equalTiles(rolled);
  await expect(
    page.getByRole("group", { name: "Additional Talents", exact: true }),
  ).toHaveCount(0);
  await noOverflow(page);
  await rolled.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath("artistic-talent-help.png") });
});
