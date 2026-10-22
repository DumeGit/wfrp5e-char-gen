// Uses isolated temporary contexts/storage; requires a running loopback export
// server. Fixed request latency disables HTTP cache and models discovery only.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base = new URL(process.argv[2] || "http://127.0.0.1:8199/");
const delay = Number(process.argv[3] ?? 50);
if (
  !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname) ||
  !Number.isFinite(delay) ||
  delay < 0 ||
  delay > 1000
)
  throw Error("Use a loopback preview URL and a delay of 0–1000ms.");
const modes = [
  ["Player", "", "player"],
  ["Bestiary", "bestiary/", "gm"],
  ["Marijan", "marijan/", "marijan"],
  ["Manager", "manager/", "manager"],
];
const browser = await chromium.launch();
const results = [],
  warm = [];
async function waitForMode(page, mode) {
  await page
    .locator(`[data-mode="${mode}"] #app .rail`)
    .first()
    .waitFor({ state: "attached" });
  await page
    .locator(
      `[data-mode="${mode}"] #app ${mode === "manager" ? ".manager-main" : ".panel"}`,
    )
    .first()
    .waitFor();
}
async function isolate() {
  const context = await browser.newContext({ serviceWorkers: "block" });
  await context.route(`${base.origin}/**`, async (route) => {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    await route.continue();
  });
  return context;
}
try {
  for (const [mode, entry, id] of modes) {
    const context = await isolate();
    try {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(new URL(`${entry}?verify=1`, base).href, {
        waitUntil: "domcontentloaded",
      });
      await waitForMode(page, id);
      const timings = await page.evaluate(() => ({
        readyMs: Math.round(performance.now()),
        resources: performance.getEntriesByType("resource").map((row) => ({
          url: row.name,
          startMs: Math.round(row.startTime),
          durationMs: Math.round(row.duration),
          bytes: row.decodedBodySize,
        })),
      }));
      let firstSearchMs, firstSearchResultMs;
      const launcher = page.getByRole("button", {
        name: /^Search (rules and book references|books:)/,
      });
      if (await launcher.count()) {
        const start = Date.now();
        await launcher.click();
        await page
          .getByRole("combobox", { name: "Search category", exact: true })
          .getByRole("option", { name: "Talents", exact: true })
          .waitFor({ state: "attached" });
        firstSearchMs = Date.now() - start;
        await page
          .getByRole("combobox", { name: "Search the books", exact: true })
          .fill("Trained");
        await page
          .getByRole("option", { name: /^Trained Creature Trait/ })
          .waitFor();
        firstSearchResultMs = Date.now() - start;
      }
      results.push({
        mode,
        ...timings,
        firstSearchMs,
        firstSearchResultMs,
        errors,
      });
      console.log(
        `${mode}: ${timings.readyMs}ms usable; ${timings.resources.length} resources; first search ${firstSearchMs ?? "unavailable"}ms ready / ${firstSearchResultMs ?? "unavailable"}ms first result; ${errors.length} errors`,
      );
    } finally {
      await context.close();
    }
  }
  const context = await isolate();
  try {
    const page = await context.newPage();
    await page.goto(new URL("?verify=1", base).href);
    await waitForMode(page, "player");
    for (const [mode, entry, id] of [...modes.slice(1), modes[0]]) {
      await page
        .locator(".workspace-switcher > summary")
        .filter({ visible: true })
        .click();
      const href = new URL(entry, base).pathname + "?verify=1";
      const link = page
        .locator(`a[href="${href}"]`)
        .filter({ visible: true })
        .first();
      if (!(await link.count())) {
        warm.push({ mode, error: "Visible client-navigation link absent" });
        continue;
      }
      const start = Date.now();
      await link.click();
      await page.waitForURL(
        (url) => url.pathname === new URL(entry, base).pathname,
      );
      await waitForMode(page, id);
      warm.push({ mode, readyMs: Date.now() - start });
    }
  } finally {
    await context.close();
  }
  await mkdir(new URL("../test-results/", import.meta.url), {
    recursive: true,
  });
  await writeFile(
    new URL("../test-results/startup-measurement.json", import.meta.url),
    JSON.stringify(
      { base: base.href, addedRequestDelayMs: delay, results, warm },
      null,
      2,
    ),
  );
  console.log("Warm navigation:", JSON.stringify(warm));
} finally {
  await browser.close();
}
