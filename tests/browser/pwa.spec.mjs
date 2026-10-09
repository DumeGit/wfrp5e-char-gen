import {
  test,
  expect,
  openPC,
  search,
  pcStep,
  PC_STORAGE,
} from "./helpers.mjs";

test.use({ serviceWorkers: "allow" });
test("all three tools and previously unopened references work offline @pwa", async ({
  page,
  context,
}) => {
  test.setTimeout(90000);
  await openPC(page);
  await expect(page.locator("#pwa-status")).toHaveText(
    "Available offline · PDF exports included",
    { timeout: 60000 },
  );
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Origins & identity", exact: true }),
  ).toBeVisible();
  await search(page, "Fortune");
  await page.getByRole("option", { name: /^Fortune Rule/ }).click();
  await expect(
    page.getByRole("region", { name: "Fortune", exact: true }),
  ).toBeVisible();
  await page.goto("/gm.html?verify=1");
  await expect(
    page.getByRole("heading", { name: "Starting profile", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".gm-profile-card")).toHaveCount(49);
  await page.goto("/marijan.html?verify=1");
  await expect(
    page.getByRole("heading", { name: "Marijan Mode", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Name", { exact: true }).fill("Offline Marijan");
  await page.reload();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "Offline Marijan",
  );
});

test("a waiting offline update applies without losing purchases @pwa", async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(90000);
  await openPC(page, { complete: true });
  await expect(page.locator("#pwa-status")).toHaveText(
    "Available offline · PDF exports included",
    { timeout: 60000 },
  );
  await pcStep(page, "Experience");
  await page
    .locator(".xp-characteristic-row")
    .filter({ has: page.getByText("Weapon Skill", { exact: true }) })
    .getByRole("button", { name: "125 XP", exact: true })
    .click();
  const before = await page.evaluate(
    (key) => localStorage.getItem(key),
    PC_STORAGE,
  );
  await context.addCookies([
    { name: "wfrp-test-update", value: "1", url: baseURL },
  ]);
  await page.evaluate(async () =>
    (await navigator.serviceWorker.getRegistration()).update(),
  );
  await expect(page.locator("#pwa-update")).toBeVisible({ timeout: 60000 });
  await page.getByRole("button", { name: "Update now", exact: true }).click();
  await expect(page.locator("#pwa-update")).toBeHidden();
  await expect(page.locator(".xp-balance .remaining strong")).toHaveText("875");
  expect(
    await page.evaluate((key) => localStorage.getItem(key), PC_STORAGE),
  ).toBe(before);
  await expect
    .poll(() =>
      page.evaluate(async () =>
        (await caches.keys()).filter((key) =>
          key.startsWith("wfrp-ledger-offline-"),
        ),
      ),
    )
    .toEqual([expect.stringMatching(/-browser-update$/)]);
});
