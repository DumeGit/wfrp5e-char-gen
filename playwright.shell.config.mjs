import base from "./playwright.config.mjs";

// Optional native-dialog contract checks in WebKit; Chromium runs these in all.
export default {
  ...base,
  testMatch: [
    "**/mobile-shell.spec.mjs",
    "**/unified-desk.spec.mjs",
    "**/workspace-books.spec.mjs",
  ],
  outputDir: "test-results/webkit-shell",
  reporter: [["dot"]],
  workers: 1,
  projects: [
    {
      name: "webkit-shell",
      use: {
        browserName: "webkit",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
};
