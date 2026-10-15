// Local cold-load diagnostic. Requires an already-running preview server;
// never attaches to the user's browser or reads their saved drafts.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const base = new URL(process.argv[2] || "http://127.0.0.1:8110/dist/");
const delay = Number(process.argv[3] ?? 50);
if (
  !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname) ||
  !Number.isFinite(delay) ||
  delay < 0 ||
  delay > 1000
)
  throw Error("Use a loopback preview URL and a delay of 0–1000ms.");
const browser = await chromium.launch();
const results = [];
try {
  for (const [mode, entry] of [
    ["Player", "index.html"],
    ["Bestiary", "gm.html"],
    ["Marijan", "marijan.html"],
  ]) {
    const context = await browser.newContext({ serviceWorkers: "block" });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      // Request routing deliberately disables HTTP cache. The fixed added
      // latency models discovery waterfalls, not bandwidth or a real phone.
      await page.route(`${base.origin}/**`, async (route) => {
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
        await route.continue();
      });
      await page.goto(new URL(`${entry}?verify=1`, base).href, {
        waitUntil: "domcontentloaded",
      });
      await page.locator("#app .rail").waitFor();
      const timings = await page.evaluate(() => ({
        readyMs: Math.round(performance.now()),
        resources: performance.getEntriesByType("resource").map((row) => ({
          url: row.name,
          startMs: Math.round(row.startTime),
          durationMs: Math.round(row.duration),
          bytes: row.decodedBodySize,
        })),
      }));
      results.push({ mode, ...timings, errors });
      console.log(
        `${mode}: ${timings.readyMs}ms to usable editor; ${timings.resources.length} resources; ${errors.length} page errors`,
      );
    } finally {
      await context.close();
    }
  }
  await mkdir(new URL("../test-results/", import.meta.url), {
    recursive: true,
  });
  await writeFile(
    new URL("../test-results/startup-measurement.json", import.meta.url),
    JSON.stringify(
      { base: base.href, addedRequestDelayMs: delay, results },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
