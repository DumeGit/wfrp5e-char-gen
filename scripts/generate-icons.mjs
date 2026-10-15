// Local artwork generation only. Playwright/Chromium already serve the local
// test workflow; rendering the canonical SVG retains its curves and gradients.
import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";

const assets = new URL("../dist/assets/", import.meta.url);
const svg = await readFile(new URL("ledger-emblem.svg", assets), "utf8");
const bounds = svg
  .match(/viewBox="([^"]+)"/)?.[1]
  .split(/\s+/)
  .map(Number);
if (!bounds || bounds.length !== 4 || !bounds.every(Number.isFinite))
  throw Error("The canonical emblem needs a valid viewBox.");
const [x, y, width, height] = bounds;
const scale = 720 / Math.max(width, height);
const left = (1024 - width * scale) / 2;
const top = (1024 - height * scale) / 2;
const content = svg.replace(/<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;overflow:hidden}svg{display:block;width:100%;height:100%}</style>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
      <rect width="1024" height="1024" fill="#251c17"/>
      <g transform="translate(${left} ${top}) scale(${scale}) translate(${-x} ${-y})">${content}</g>
    </svg>`);
  for (const size of [180, 192, 512]) {
    await page.setViewportSize({ width: size, height: size });
    const png = await page.screenshot({ type: "png" });
    await writeFile(new URL(`icon-${size}.png`, assets), png);
    if (size === 512)
      await writeFile(new URL("icon-maskable-512.png", assets), png);
  }
  console.log("Rendered Carrion Standard icons: 180, 192, 512 and maskable.");
} finally {
  await browser.close();
}
