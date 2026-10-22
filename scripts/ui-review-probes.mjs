import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 320, height: 900 },
  isMobile: true,
  hasTouch: true,
  serviceWorkers: "block",
});
await page.goto("http://127.0.0.1:8211/__ui-review?mode=gm&data=worst");
let frame = page.frameLocator("iframe");
await frame.locator(".gm-workspace").waitFor();
await frame.locator("#gm-step").selectOption("3");
await page.screenshot({ path: "test-results/emil-review/gm-320-review.png" });
const probes = [];
for (const mode of ["player", "gm", "marijan"]) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`http://127.0.0.1:8211/__ui-review?mode=${mode}&data=worst`);
  frame = page.frameLocator("iframe");
  await frame.locator(".workspace,.mm-workspace").waitFor();
  await frame.locator("html").evaluate((el) => (el.style.fontSize = "200%"));
  probes.push({
    mode,
    rootFont: "200%",
    ...(await frame
      .locator("body")
      .evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }))),
  });
}
await page.goto(
  "http://127.0.0.1:8211/__ui-review?mode=marijan&data=catalogue",
);
frame = page.frameLocator("iframe");
await frame.locator(".mm-workspace").waitFor();
probes.push({
  mode: "marijan",
  coreSkills: await frame.locator(".mm-entry-skills").count(),
});
await fs.writeFile(
  "test-results/emil-review/probes.json",
  JSON.stringify(probes, null, 2),
);
console.log(JSON.stringify(probes));
await browser.close();
