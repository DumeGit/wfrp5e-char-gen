import { test, expect } from "./helpers.mjs";

for (const path of ["/", "/gm.html", "/marijan.html"]) {
  test(`Vercel Analytics initialises once on the deployed ${path} page @analytics`, async ({
    page,
    baseURL,
  }) => {
    await page.route("https://ledger.example.test/**", async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === "/_vercel/insights/script.js")
        return route.fulfill({
          contentType: "text/javascript",
          body: "window.analyticsLoaded = true;",
        });
      const response = await route.fetch({
        url: new URL(url.pathname + url.search, baseURL).href,
      });
      await route.fulfill({ response });
    });
    await page.goto(`https://ledger.example.test${path}`);
    await expect(
      page.locator('script[src="/_vercel/insights/script.js"]'),
    ).toHaveCount(1);
    await expect
      .poll(() => page.evaluate(() => window.analyticsLoaded))
      .toBe(true);
    await expect(page.locator("#creator-main")).toBeVisible();
    const result = await page.evaluate(() => {
      const filter = window.vaq.find(([name]) => name === "beforeSend")[1];
      return filter({
        type: "pageview",
        url: location.href + "?private=value#name",
      });
    });
    expect(result.url).toBe(`https://ledger.example.test${path}`);
  });
}

test("local creator pages never request Analytics endpoints @analytics", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => {
    if (request.url().includes("/_vercel/insights/"))
      requests.push(request.url());
  });
  for (const path of ["/", "/gm.html", "/marijan.html"]) {
    await page.goto(path);
    await expect(page.locator("#creator-main")).toBeVisible();
    await expect(page.locator('script[src*="/_vercel/insights/"]')).toHaveCount(
      0,
    );
  }
  expect(requests).toEqual([]);
});
