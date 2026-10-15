import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const output = new URL("../test-results/emil-review/", import.meta.url);
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
const findings = [];
for (const width of [320, 1440, 2560]) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    isMobile: width === 320,
    hasTouch: width === 320,
    serviceWorkers: "block",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => findings.push({ width, error: e.stack }));
  for (const mode of ["player", "gm", "marijan"]) {
    for (const state of width === 320
      ? ["demo", "worst", "empty", "one"]
      : ["demo", "worst"]) {
      await page.goto(
        `http://127.0.0.1:8211/__ui-review?mode=${mode}&data=${state}`,
      );
      const frame = page.frameLocator("iframe");
      await frame.locator(".workspace, .mm-workspace").waitFor();
      await frame
        .locator(
          ".masthead .banner-search-ribbon, .masthead [data-mobile-menu]",
        )
        .first()
        .waitFor({ state: "attached" });
      const body = await frame.locator("body").evaluate((el) => {
        const width = innerWidth;
        const outside = [...document.querySelectorAll("#app *")]
          .filter((x) => {
            const r = x.getBoundingClientRect();
            return (
              r.width &&
              r.height &&
              (r.right > width + 2 || r.left < -2) &&
              !x.closest(".skip-link")
            );
          })
          .slice(0, 10)
          .map((x) => ({
            tag: x.tagName,
            class: x.className,
            text: x.textContent.trim().slice(0, 90),
          }));
        return {
          viewport: width,
          scroll: document.documentElement.scrollWidth,
          outside,
        };
      });
      findings.push({ mode, width, state, ...body });
      if (state === "worst") {
        if (width === 320) {
          const button = frame.getByRole("button", {
            name: "View character",
            exact: true,
          });
          if ((await button.count()) && (await button.first().isVisible()))
            await button.first().click();
        }
        await page.screenshot({
          path: new URL(`${mode}-${width}-worst.png`, output).pathname.replace(
            /^\/(\w:)/,
            "$1",
          ),
        });
        if (mode === "marijan") {
          if (width === 320) {
            const back = frame.getByRole("button", {
              name: /Back to (choice|editor)/,
              exact: true,
            });
            if (await back.count()) await back.click();
          }
          const skills = frame.locator("#mm-section-skills");
          await skills.scrollIntoViewIfNeeded();
          await page.screenshot({
            path: new URL(`marijan-${width}-rows.png`, output).pathname.replace(
              /^\/(\w:)/,
              "$1",
            ),
          });
        }
      }
    }
  }
  await context.close();
}
await browser.close();
await fs.writeFile(
  new URL("measurements.json", output),
  JSON.stringify(findings, null, 2),
);
for (const f of findings)
  if (f.error || f.scroll > f.viewport + 1 || f.outside?.length)
    console.log(JSON.stringify(f));
console.log(`Saved ${findings.length} review measurements.`);
