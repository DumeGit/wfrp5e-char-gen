import { test, expect, noOverflow, PC_STORAGE, gmStep } from "./helpers.mjs";
import { reviewFixtures } from "../ui-review-fixtures.mjs";
const fixtures = reviewFixtures();
async function openFixture(page, mode) {
  const key = {
    player: PC_STORAGE,
    gm: "wfrp-gm-workshop-v1",
    marijan: "wfrp-marijan-v1-verification",
  }[mode];
  await page.addInitScript(
    ({ key, draft }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(draft));
    },
    { key, draft: fixtures[mode].worst },
  );
  await page.goto(
    mode === "player"
      ? "/?verify=1"
      : mode === "gm"
        ? "/gm.html"
        : "/marijan.html?verify=1",
  );
  await expect(page.locator(".workspace,.mm-workspace")).toBeVisible();
}
for (const mode of ["player", "gm", "marijan"]) {
  test(`${mode} gates hover, retains focus and has immediate press feedback @interface @mobile`, async ({
    page,
  }, info) => {
    await openFixture(page, mode);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      "content",
      /viewport-fit=cover/,
    );
    const unguarded = await page.evaluate(() => {
      const found = [];
      function visit(rules, hover = false) {
        for (const r of rules) {
          const guarded =
            hover ||
            (r.conditionText?.includes("hover: hover") &&
              r.conditionText?.includes("pointer: fine"));
          if (r.selectorText?.includes(":hover") && !guarded)
            found.push(r.selectorText);
          if (r.cssRules) visit(r.cssRules, guarded);
        }
      }
      for (const s of document.styleSheets) visit(s.cssRules);
      return found;
    });
    expect(unguarded).toEqual([]);
    const button =
      info.project.name === "mobile"
        ? page.getByRole("button", { name: "Open creator menu", exact: true })
        : page.locator(".rail button").filter({ hasText: /Save/ }).first();
    await button.focus();
    await expect(button).toBeFocused();
    expect(
      await button.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).not.toBe("none");
    if (info.project.name === "mobile") {
      const before = await button.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      await button.hover();
      await expect(button).toHaveCSS("background-color", before);
    }
    const box = await button.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(button).toHaveCSS("filter", "brightness(0.88)");
    await page.mouse.up();
    await noOverflow(page);
  });
}
test("Marijan digits and expanded custom names remain readable and editable @interface @marijan @mobile", async ({
  page,
}, info) => {
  await openFixture(page, "marijan");
  const name = "Lore (The Heraldry of Bretonnia and the Border Princes)";
  const amount = page.getByLabel(`${name} advances`, { exact: true });
  const total = page.getByLabel(`${name} total`, { exact: true });
  await expect(amount).toHaveValue("125");
  await expect(total).toHaveValue("160");
  for (const input of [amount, total])
    expect(
      await input.evaluate((el) => {
        const s = getComputedStyle(el),
          c = document.createElement("canvas").getContext("2d");
        c.font = s.font;
        return (
          el.clientWidth -
          parseFloat(s.paddingLeft) -
          parseFloat(s.paddingRight) -
          c.measureText(el.value).width
        );
      }),
    ).toBeGreaterThan(3);
  await amount.fill("12345");
  await expect(total).toHaveValue("12380");
  await page.getByLabel(`Edit ${name} details`, { exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page
    .locator(".mm-entry-disclosure[open]")
    .getByLabel("Rename Skill", { exact: true })
    .fill("Trade (Old World Heraldry)");
  await expect(
    page.getByRole("heading", {
      name: "Trade (Old World Heraldry)",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Trade (Old World Heraldry) advances", { exact: true }),
  ).toHaveValue("12345");
  await page.reload();
  await expect(
    page.getByLabel("Trade (Old World Heraldry) advances", { exact: true }),
  ).toHaveValue("12345");
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 844 });
  await page.locator("#mm-section-skills").scrollIntoViewIfNeeded();
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("marijan-readable-rows.png") });
});
test("GM keeps selected identity above collapsed books and full Review @interface @gm @mobile", async ({
  page,
}, info) => {
  await openFixture(page, "gm");
  const picker = page.locator(".gm-book-picker");
  await expect(picker).not.toHaveAttribute("open", "");
  expect(
    (await page.getByLabel("Name", { exact: true }).boundingBox()).y,
  ).toBeLessThan((await picker.boundingBox()).y);
  await picker.locator(":scope > summary").click();
  await expect(page.locator("#gm-book-up-in-arms")).toBeVisible();
  await picker.locator(":scope > summary").click();
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 844 });
  await gmStep(page, "Review & export");
  await expect(page.locator(".gm-stat-block .gm-stat-name")).toBeVisible();
  await expect(page.locator(".sheet")).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({ path: info.outputPath("gm-full-review.png") });
});
