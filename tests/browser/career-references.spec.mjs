import {
  test,
  expect,
  openPC,
  openGM,
  search,
  noOverflow,
} from "./helpers.mjs";

for (const mode of ["Player", "GM", "Marijan"]) {
  test(`${mode} Skill/Talent Career tables share exact links and chain Back @careerReferences`, async ({
    page,
  }, info) => {
    if (mode === "Player") await openPC(page);
    else if (mode === "GM") await openGM(page);
    else await page.goto("/marijan/?verify=1");
    const before = await page.evaluate(() => JSON.stringify(localStorage));
    await search(page, "Strong Back");
    await page.getByRole("option", { name: /^Strong Back Talent/ }).click();
    const table = page.getByRole("table", {
      name: "Careers with this talent: Strong Back",
      exact: true,
    });
    await expect(table).toBeVisible();
    const soldier = table.getByRole("row").filter({
      has: page.getByRole("button", {
        name: "View Soldier Career from Core",
        exact: true,
      }),
    });
    await expect(soldier).toContainText("L1");
    await expect(soldier).toContainText("Recruit");
    await table.getByRole("row").nth(1).scrollIntoViewIfNeeded();
    await noOverflow(page);
    expect(
      await table.evaluate(
        (node) =>
          node.scrollWidth <=
          node.closest(".search-table-wrap").clientWidth + 1,
      ),
    ).toBe(true);
    if (mode === "Player")
      await page.screenshot({
        path: `test-results/career-table-${info.project.name}.png`,
      });
    await soldier.getByRole("button").click();
    const reader = page.locator("#book-search-dialog");
    await expect(
      reader.getByRole("heading", { name: "Soldier", exact: true }),
    ).toBeVisible();
    await reader
      .getByRole("button", { name: "Back to previous reference", exact: true })
      .click();
    await expect(table).toBeVisible();
    expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(
      before,
    );
  });
}

test("Skill tables keep core and alternative Career profiles distinct @careerReferences", async ({
  page,
}) => {
  await openPC(page);
  await search(page, "Animal Care");
  await page.getByRole("option", { name: /^Animal Care Skill/ }).click();
  const table = page.getByRole("table", {
    name: "Careers with this skill: Animal Care",
    exact: true,
  });
  const core = table.getByRole("row").filter({
    has: page.getByRole("button", {
      name: "View Hedge Witch Career from Core",
      exact: true,
    }),
  });
  await expect(core).toContainText("L3");
  await expect(core).not.toContainText("L1");
  const variant = table.getByRole("row").filter({
    has: page.getByRole("button", {
      name: /^View Hedge Witch Career from Archives/,
    }),
  });
  await expect(variant).toContainText("L1");
  await expect(variant).toContainText("L3");
  await variant.getByRole("button").click();
  await expect(page.locator("#book-search-dialog")).toContainText(
    "Animal Training",
  );
  await noOverflow(page);
});
