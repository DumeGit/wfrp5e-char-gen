import { test, expect, openPC, pcStep, downloadBytes } from "./helpers.mjs";
import { PDFDocument } from "pdf-lib";

for (const [mode, path] of [
  ["Player", "/"],
  ["Bestiary", "/gm.html"],
  ["Marijan", "/marijan.html"],
]) {
  test(`${mode} loads shared data once and defers PDF tools @startup`, async ({
    page,
  }) => {
    const requests = [];
    page.on("request", (request) =>
      requests.push(new URL(request.url()).pathname),
    );
    await page.goto(`${path}?verify=1`);
    await expect(page.locator("#app .rail")).toBeAttached();
    await expect(page.locator("#app .panel")).toBeVisible();
    expect(
      requests.filter((path) => path.endsWith("/data/book-library.json")),
    ).toHaveLength(1);
    expect(
      requests.filter((path) => path.endsWith("/gm/data.json")),
    ).toHaveLength(mode === "Player" ? 0 : 1);
    expect(
      requests.some((path) =>
        /pdf-lib\.min\.js$|\/export\.mjs$|\/gm\/(pdf|print|printing)\.mjs$|\/marijan\/pdf\.mjs$/.test(
          path,
        ),
      ),
    ).toBe(false);
  });
}

test("failed on-demand PDF loading can retry, with one shared runtime for both downloads @startup @exports", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("**/assets/pdf-lib.min.js", async (route) => {
    attempts++;
    if (attempts === 1) await route.abort();
    else await route.continue();
  });
  await openPC(page, { complete: true });
  await pcStep(page, "Review & export");
  const sheet = page.getByRole("button", {
    name: "Download character sheet",
    exact: true,
  });
  await sheet.click();
  await expect(
    page
      .getByText(
        "Could not load PDF export tools. Check your connection and try again.",
        { exact: true },
      )
      .first(),
  ).toBeVisible();
  await expect(sheet).toBeEnabled();
  const download = await downloadBytes(page, sheet);
  const doc = await PDFDocument.load(download.bytes);
  expect(doc.getForm().getFields().length).toBeGreaterThan(20);
  await downloadBytes(
    page,
    page.getByRole("button", {
      name: "Download creation & XP record",
      exact: true,
    }),
  );
  expect(attempts).toBe(2);
});

test.describe("First PDF export offline", () => {
  test.use({ serviceWorkers: "allow" });
  test("deferred PDF runtime and export modules remain available offline @startup @pwa @exports", async ({
    page,
    context,
  }) => {
    await openPC(page, { complete: true });
    await expect(page.locator("#pwa-status")).toHaveText(
      "Available offline · PDF exports included",
      { timeout: 60000 },
    );
    await context.setOffline(true);
    await pcStep(page, "Review & export");
    const downloaded = await downloadBytes(
      page,
      page.getByRole("button", {
        name: "Download character sheet",
        exact: true,
      }),
    );
    expect(
      (await PDFDocument.load(downloaded.bytes)).getForm().getFields().length,
    ).toBeGreaterThan(20);
  });
});
