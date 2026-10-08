import { defineConfig } from "@playwright/test";

const port = Number(process.env.WFRP_TEST_PORT || 8199);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw Error("WFRP_TEST_PORT must be an unprivileged TCP port.");
const chromium = [
  {
    name: "desktop",
    use: { browserName: "chromium", viewport: { width: 1440, height: 900 } },
  },
  {
    name: "mobile",
    use: {
      browserName: "chromium",
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    },
  },
];
export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "**/*.spec.mjs",
  fullyParallel: true,
  workers: 2,
  timeout: 45000,
  expect: { timeout: 8000 },
  retries: 0,
  forbidOnly: true,
  outputDir: "test-results/browser",
  reporter: [
    ["dot"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    headless: true,
    serviceWorkers: "block",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  projects:
    process.env.WFRP_CROSS_BROWSER === "1"
      ? [
          ...chromium,
          {
            name: "firefox",
            grep: /@smoke/,
            use: {
              browserName: "firefox",
              viewport: { width: 1440, height: 900 },
            },
          },
          {
            name: "webkit",
            grep: /@smoke/,
            use: {
              browserName: "webkit",
              viewport: { width: 390, height: 844 },
              isMobile: true,
              hasTouch: true,
            },
          },
        ]
      : chromium,
  webServer: {
    command: "node scripts/browser-test-server.mjs",
    url: `http://127.0.0.1:${port}/__test_health`,
    reuseExistingServer: false,
    timeout: 10000,
    stdout: "ignore",
  },
});
