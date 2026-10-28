// Manual asset authoring: preserve SVG stitchTiles with Chromium, then encode
// a static WebP. The server-side SVG rasterizer does not preserve these seams.
import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const size = 1024;
const source = new URL(
  "../public/assets/imperial-desk/parchment.svg",
  import.meta.url,
);
const output = new URL(
  "../public/assets/imperial-desk/parchment.webp",
  import.meta.url,
);
const svg = await readFile(source, "utf8");
const browser = await chromium.launch({ headless: true });
let raster;
try {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden}svg{display:block}</style>${svg}`,
  );
  raster = await page.screenshot({ type: "png" });
} finally {
  await browser.close();
}
const encoded = await sharp(raster).webp({ quality: 90 }).toBuffer();
const { data, info } = await sharp(encoded)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
if (info.width !== size || info.height !== size || info.channels !== 3)
  throw Error("Unexpected parchment dimensions or colour channels.");

// Reject a border jump larger than the tile's ordinary neighbouring variation.
// Check the compressed production file, not just the uncompressed SVG render.
let edgeX = 0,
  edgeY = 0,
  insideX = 0,
  insideY = 0;
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    for (let c = 0; c < 3; c++) {
      const i = (y * size + x) * 3 + c;
      if (x) insideX += Math.abs(data[i] - data[i - 3]);
      else edgeX += Math.abs(data[i] - data[i + (size - 1) * 3]);
      if (y) insideY += Math.abs(data[i] - data[i - size * 3]);
      else edgeY += Math.abs(data[i] - data[i + (size - 1) * size * 3]);
    }
  }
}
const seams = [edgeX, edgeY].map((value) => value / (size * 3));
const neighbours = [insideX, insideY].map(
  (value) => value / (size * (size - 1) * 3),
);
if (seams.some((value, axis) => value > Math.max(1.5, neighbours[axis] * 2)))
  throw Error(`Parchment has a visible tile boundary: ${seams.join(", ")}.`);
await writeFile(output, encoded);
console.log(
  `Parchment: ${encoded.length} bytes; edge differences X/Y ${seams.map((value) => value.toFixed(3)).join(" / ")}.`,
);
