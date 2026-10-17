import base from "./playwright.config.mjs";

// These are CSS viewport/scaling scenarios, not a claim about Android defaults.
// Allow for browser controls and the GM's enlarged display setting.
export default {
  ...base,
  testMatch: "**/tablet.spec.mjs",
  testIgnore: [],
  outputDir: "test-results/tablet",
  reporter: [
    ["dot"],
    ["html", { outputFolder: "test-results/tablet-report", open: "never" }],
  ],
  use: { ...base.use, isMobile: true, hasTouch: true },
  projects: [
    {
      name: "portrait",
      use: { viewport: { width: 800, height: 1180 }, deviceScaleFactor: 2 },
    },
    {
      name: "landscape",
      use: { viewport: { width: 1280, height: 700 }, deviceScaleFactor: 2 },
    },
    {
      name: "portrait-large-ui",
      use: { viewport: { width: 667, height: 970 }, deviceScaleFactor: 2.4 },
    },
    {
      name: "landscape-large-ui",
      use: { viewport: { width: 1067, height: 570 }, deviceScaleFactor: 2.4 },
    },
    {
      name: "short-landscape",
      use: { viewport: { width: 1280, height: 480 }, deviceScaleFactor: 2 },
    },
  ],
};
