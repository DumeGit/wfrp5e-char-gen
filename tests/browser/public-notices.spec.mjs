import { test, expect, search, noOverflow } from "./helpers.mjs";

for (const path of ["/", "/gm.html", "/marijan.html"]) {
  test(`${path} has shared notices, no analytics and no Rules in live search @notices`, async ({
    page,
    baseURL,
  }, info) => {
    const analytics = [];
    page.on("request", (request) => {
      if (/\/_vercel\/(insights|speed-insights)\//.test(request.url()))
        analytics.push(request.url());
    });
    // Exercise the production HTTPS branch that used to inject Analytics.
    await page.route("https://ledger.example.test/**", async (route) => {
      const url = new URL(route.request().url());
      const response = await route.fetch({
        url: new URL(url.pathname + url.search, baseURL).href,
      });
      await route.fulfill({ response });
    });
    await page.goto(`https://ledger.example.test${path}`);
    await expect(page.locator("#creator-main")).toBeVisible();
    await expect(page.locator(".brand-world")).toContainText("UNOFFICIAL");
    await expect
      .poll(() =>
        page.locator(".brand-mark img").evaluate((img) => img.naturalWidth),
      )
      .toBeGreaterThan(0);
    const footer = page.getByRole("contentinfo", {
      name: "Project information",
    });
    await expect(footer).toContainText("Not affiliated with or endorsed");
    await search(page, "Achieving the Impossible");
    await expect(
      page.locator('#book-search-category option[value="rule"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('#book-search-results [data-search-key^="rule:"]'),
    ).toHaveCount(0);
    await expect(
      page
        .locator("#book-search-results")
        .getByRole("option", { name: /^Achieving the Impossible / }),
    ).toHaveCount(0);
    await page.locator("#book-search").fill("Trained");
    await expect(
      page.getByRole("option", { name: /^Trained Creature Trait/ }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Close search", exact: true })
      .click();
    await noOverflow(page);
    await footer.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath("notices.png") });
    await footer.getByRole("link", { name: "Privacy", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Privacy", exact: true }),
    ).toBeVisible();
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /issue tracker on GitHub/ }),
    ).toHaveAttribute(
      "href",
      "https://github.com/DumeGit/wfrp5e-char-gen/issues",
    );
    await expect(
      page.locator(
        'script[src*="analytics"],script[src*="/_vercel/insights/"]',
      ),
    ).toHaveCount(0);
    await noOverflow(page);
    expect(analytics).toEqual([]);
  });
}
