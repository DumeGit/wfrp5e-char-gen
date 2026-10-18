import { test, expect, search } from "./helpers.mjs";
const MAR_STORAGE = "wfrp-marijan-v1-verification";
async function navigate(page, label, path) {
  const link = page
    .getByRole("navigation", { name: "Creator", exact: true })
    .getByRole("link", { name: label, exact: true });
  if (!(await link.isVisible()))
    await page
      .getByRole("button", { name: "Open creator menu", exact: true })
      .click();
  await link.click();
  await expect(page).toHaveURL(
    new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\?verify=1$"),
  );
}
test("production export serves distinct route documents and router payloads @migrationPlatform", async ({
  page,
  request,
}) => {
  for (const route of ["", "bestiary/", "marijan/", "legal/"]) {
    const html = await request.get("/" + route + "?verify=1");
    expect(html.status()).toBe(200);
    expect(html.headers()["content-type"]).toContain("text/html");
    expect(await html.text()).toMatch(/manifest.webmanifest/);
    const payload = await request.get("/" + route + "index.txt?_rsc=one");
    expect(payload.status()).toBe(200);
    expect(payload.headers()["content-type"]).toContain("text/x-component");
    expect(await payload.text()).not.toMatch(/<!doctype html/i);
  }
  for (const source of [
    "/content/descriptions/catalogue.json",
    "/scripts/build-pwa.mjs",
    "/src/engine/rules.mjs",
  ])
    expect((await request.get(source)).status()).toBe(404);
  await page.goto("/gm.html?verify=1#kept");
  await expect(page).toHaveURL(/\/bestiary\/\?verify=1#kept$/);
  await page.goto("/marijan.html?verify=1#identity");
  await expect(page).toHaveURL(/\/marijan\/\?verify=1#identity$/);
  await page.goto("/legal.html?verify=1#privacy");
  await expect(page).toHaveURL(/\/legal\/\?verify=1#privacy$/);
});
test("production search ranks inside a real worker with no missing imports @migrationPlatform @search", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    const Original = window.Worker;
    const state = { started: 0, ready: 0, queries: 0, errors: [] };
    window.__searchWorkerProbe = state;
    window.Worker = class extends Original {
      constructor(...args) {
        super(...args);
        state.started++;
        this.addEventListener("message", (event) => {
          if (event.data?.result === true) state.ready++;
          else if (Array.isArray(event.data?.result?.rows)) state.queries++;
        });
        this.addEventListener("error", (event) =>
          state.errors.push(event.message || "Worker failed"),
        );
      }
    };
  });
  const missing = [];
  context.on("response", (response) => {
    if (response.status() >= 400) missing.push(response.url());
  });
  await page.goto("/marijan/?verify=1");
  await search(page, "Trained");
  await expect(
    page.getByRole("option", { name: /^Trained Creature Trait/ }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__searchWorkerProbe.ready))
    .toBe(1);
  await expect
    .poll(() => page.evaluate(() => window.__searchWorkerProbe.queries))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__searchWorkerProbe.errors)).toEqual(
    [],
  );
  expect(missing).toEqual([]);
});
test.describe("production offline routes", () => {
  test.use({ serviceWorkers: "allow" });
  test("unopened routes and references navigate softly and reload offline without lost drafts @migrationPlatform @pwa", async ({
    page,
    context,
  }) => {
    test.setTimeout(90000);
    await page.goto("/marijan/?verify=1");
    const name = page.getByLabel("Name", { exact: true });
    await name.fill("Offline migration draft");
    await expect(page.locator("#pwa-status")).toHaveText(
      "Available offline · PDF exports included",
      { timeout: 60000 },
    );
    const original = await page.evaluate(
      (key) => localStorage.getItem(key),
      MAR_STORAGE,
    );
    await context.setOffline(true);
    await page.reload();
    await expect(name).toHaveValue("Offline migration draft");
    await page.evaluate(() => {
      window.__migrationNavigation = "soft";
    });
    await navigate(page, "NPC & creature", "/bestiary/");
    await expect(
      page.getByRole("heading", { name: "Starting profile", exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => window.__migrationNavigation)).toBe(
      "soft",
    );
    expect(
      await page.evaluate(() => document.documentElement.dataset.theme),
    ).toBe("moonlit-vellum");
    await search(page, "Trained");
    await page.getByRole("option", { name: /^Trained Creature Trait/ }).click();
    await expect(
      page.getByRole("region", { name: "Trained", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Close search", exact: true })
      .click();
    await navigate(page, "Player character", "/");
    await page
      .getByRole("button", { name: "Use selected books", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Origins & identity", exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => window.__migrationNavigation)).toBe(
      "soft",
    );
    await page.goBack();
    await expect(page).toHaveURL(/\/bestiary\/\?verify=1$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/\?verify=1$/);
    await navigate(page, "Marijan Mode", "/marijan/");
    await expect(name).toHaveValue("Offline migration draft");
    expect(
      await page.evaluate((key) => localStorage.getItem(key), MAR_STORAGE),
    ).toBe(original);
    await page.goto("/gm.html?verify=1");
    await expect(
      page.getByRole("heading", { name: "Starting profile", exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Starting profile", exact: true }),
    ).toBeVisible();
    const payload = await page.evaluate(async () => {
      const response = await fetch("/marijan/?_rsc=offline", {
        headers: { RSC: "1" },
      });
      return {
        type: response.headers.get("Content-Type"),
        body: (await response.text()).slice(0, 60),
      };
    });
    expect(payload.type).toContain("text/x-component");
    expect(payload.body).not.toMatch(/<!doctype/i);
  });
  test("successive waiting updates preserve edits and retain only one previous build @migrationPlatform @pwa", async ({
    page,
    context,
    baseURL,
  }) => {
    test.setTimeout(90000);
    await page.goto("/marijan/?verify=1");
    const name = page.getByLabel("Name", { exact: true });
    await name.fill("Persisted through two updates");
    await expect(page.locator("#pwa-status")).toHaveText(
      "Available offline · PDF exports included",
      { timeout: 60000 },
    );
    const before = await page.evaluate(
      (key) => localStorage.getItem(key),
      MAR_STORAGE,
    );
    for (const version of [1, 2]) {
      await context.addCookies([
        { name: "wfrp-test-update", value: String(version), url: baseURL },
      ]);
      await page.evaluate(async () => {
        await (await navigator.serviceWorker.getRegistration()).update();
      });
      await expect(page.locator("#pwa-update")).toBeVisible({ timeout: 60000 });
      await page
        .getByRole("button", { name: "Update now", exact: true })
        .click();
      await expect(page.locator("#pwa-update")).toBeHidden();
      await expect(name).toHaveValue("Persisted through two updates");
      expect(
        await page.evaluate((key) => localStorage.getItem(key), MAR_STORAGE),
      ).toBe(before);
      await expect
        .poll(() =>
          page.evaluate(
            async () =>
              (await caches.keys()).filter((key) =>
                key.startsWith("wfrp-ledger-offline-"),
              ).length,
          ),
        )
        .toBe(2);
    }
    const keys = await page.evaluate(async () => await caches.keys());
    expect(keys.some((key) => /-browser-update-2$/.test(key))).toBe(true);
    expect(keys.some((key) => /-browser-update$/.test(key))).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(name).toHaveValue("Persisted through two updates");
  });
});
test("one install control survives route switches and compact resize without duplicate handlers @migrationPlatform @pwa", async ({
  page,
}) => {
  await page.goto("/marijan/?verify=1");
  const names = [
    ["NPC & creature", "/bestiary/"],
    ["Player character", "/"],
    ["Marijan Mode", "/marijan/"],
  ];
  let prompts = 0;
  for (const [index, [label, path]] of names.entries()) {
    await page.setViewportSize({
      width: index === 0 ? 390 : index === 1 ? 1440 : 800,
      height: 900,
    });
    await expect(page.locator("#pwa-install")).toHaveCount(1);
    const install = page.locator("#pwa-install");
    if (!(await install.isVisible()))
      await page
        .getByRole("button", { name: "Open creator menu", exact: true })
        .click();
    await page.evaluate(() => {
      window.__installPromptCalls ??= 0;
      const event = new Event("beforeinstallprompt", { cancelable: true });
      event.prompt = async () => {
        window.__installPromptCalls++;
      };
      window.dispatchEvent(event);
    });
    await install.click();
    prompts++;
    expect(await page.evaluate(() => window.__installPromptCalls)).toBe(
      prompts,
    );
    if (!(await install.isVisible()))
      await page
        .getByRole("button", { name: "Open creator menu", exact: true })
        .click();
    await install.click();
    const instructions = page.locator("#pwa-install-dialog");
    await expect(instructions).toBeVisible();
    await expect(page.locator("#pwa-install-dialog")).toHaveCount(1);
    await instructions
      .getByRole("button", { name: "Close", exact: true })
      .click();
    await navigate(page, label, path);
    await expect(page.locator("#pwa-install")).toHaveCount(1);
  }
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(page.locator("#pwa-install")).toBeHidden();
});
