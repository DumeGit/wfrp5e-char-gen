import {
  test,
  expect,
  pcDraft,
  pcStep,
  PC_STORAGE,
  noOverflow,
} from "./helpers.mjs";

test("Player unlisted weights show resolved Gear and Review totals @pc @mobile", async ({
  page,
}, info) => {
  const draft = await pcDraft();
  draft.career = "hunter";
  await page.addInitScript(
    ({ key, draft }) => localStorage.setItem(key, JSON.stringify(draft)),
    { key: PC_STORAGE, draft },
  );
  await page.goto("/?verify=1");
  await expect(
    page.getByRole("heading", { name: "Origins & identity", exact: true }),
  ).toBeVisible();
  if (info.project.name === "mobile")
    await expect(
      page.getByRole("combobox", { name: "Creation step", exact: true }),
    ).toBeVisible();
  await pcStep(page, "Gear & money");
  const summary = page.getByRole("region", {
    name: "Starting equipment effects",
    exact: true,
  });
  await expect(summary).toContainText("Carried Enc");
  await expect(summary).toContainText(
    "Unlisted weights count as 0 Enc: Selection of Animal Traps; Sturdy Boots.",
  );
  await expect(summary).not.toContainText("Unresolved");
  await expect(summary).not.toContainText("Known Enc subtotal");
  await summary.scrollIntoViewIfNeeded();
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("unlisted-weight-totals.png"),
  });
  await pcStep(page, "Review");
  await expect(page.locator(".review-resources")).not.toContainText(
    "Known weight only",
  );
  await expect(page.locator(".review-weight-warning")).toHaveCount(0);
  await expect(
    page.locator(".review-caption").filter({
      hasText: "Unlisted weights count as 0 Enc: Selection of Animal Traps",
    }),
  ).toBeAttached();
});
