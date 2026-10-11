import { copyFile, mkdir } from "node:fs/promises";

const sdk = new URL(import.meta.resolve("@vercel/analytics"));
const assets = new URL("../dist/assets/", import.meta.url);
await mkdir(assets, { recursive: true });
await copyFile(sdk, new URL("vercel-analytics.mjs", assets));
await copyFile(
  new URL("../LICENSE", sdk),
  new URL("vercel-analytics-LICENSE.txt", assets),
);
console.log("Prepared the installed Vercel Analytics browser SDK.");
