import base from "./playwright.config.mjs";

// Own a separate dev server/cache so the user's preview remains independent.
// Production/PWA acceptance continues to use the exported static server.
const external = process.env.WFRP_DEV_URL;
const url = new URL(external || "http://127.0.0.1:8204");
if (
  url.protocol !== "http:" ||
  !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)
)
  throw Error("WFRP_DEV_URL must use a local HTTP development server.");
export default {
  ...base,
  testMatch: ["**/react-rendering.spec.mjs", "**/review.spec.mjs"],
  outputDir: "test-results/dev-rendering",
  reporter: [["dot"]],
  timeout: 90000,
  expect: { timeout: 30000 },
  workers: 1,
  use: { ...base.use, baseURL: url.href },
  webServer: external
    ? undefined
    : {
        command:
          "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 8204",
        env: { WFRP_DEV_CHECK: "1" },
        url: url.href,
        reuseExistingServer: false,
        timeout: 60000,
        stdout: "ignore",
      },
};
