import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildFingerprint } from "./browser-build.mjs";
const scope = process.argv[2] || "smoke";
const scopes = [
  "smoke",
  "search",
  "pc",
  "gm",
  "storage",
  "exports",
  "mobile",
  "pwa",
  "all",
  "cross-browser",
];
if (!scopes.includes(scope)) throw Error(`Unknown browser suite: ${scope}`);
const start = Date.now();
const environment = { ...process.env };
delete environment.FORCE_COLOR;
delete environment.NO_COLOR;
const run = (args, { env = environment, quiet = false } = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      env,
      stdio: quiet ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let output = "";
    if (quiet) {
      child.stdout.on("data", (s) => (output += s));
      child.stderr.on("data", (s) => (output += s));
    }
    child.on("error", reject);
    child.on("exit", (code) => resolve({ code: code ?? 1, output }));
  });
await mkdir("test-results", { recursive: true });
const root = fileURLToPath(new URL("../", import.meta.url));
const stateFile = "test-results/browser-build-state.json";
let previous = {};
try {
  previous = JSON.parse(await readFile(stateFile, "utf8"));
} catch {}
const fingerprint = await buildFingerprint(root);
if (!process.argv.includes("--built") && previous.fingerprint !== fingerprint) {
  // npm passes its actual CLI path on Windows too: no shell quoting or cmd shim.
  if (!process.env.npm_execpath)
    throw Error("Run through npm run test:ui:<suite>.");
  console.log("Preparing current app assets once…");
  const build = await run([process.env.npm_execpath, "run", "build"], {
    quiet: true,
  });
  await writeFile("test-results/browser-build.log", build.output);
  if (build.code) {
    console.error(build.output);
    process.exit(build.code);
  }
  await writeFile(
    stateFile,
    JSON.stringify({ fingerprint: await buildFingerprint(root) }),
  );
} else if (!process.argv.includes("--built")) {
  console.log(
    "App sources/assets unchanged · reusing verified browser-test build.",
  );
}
const args = [
  fileURLToPath(
    new URL("../node_modules/@playwright/test/cli.js", import.meta.url),
  ),
  "test",
];
if (scope === "mobile") args.push("--project=mobile");
else if (scope !== "all")
  args.push("--grep", scope === "cross-browser" ? "@smoke" : `@${scope}\\b`);
if (process.argv.includes("--last-failed")) args.push("--last-failed");
const result = await run(args, {
  env: {
    ...environment,
    WFRP_CROSS_BROWSER: scope === "cross-browser" ? "1" : "0",
  },
});
console.log(
  `Browser ${scope}: ${result.code ? "FAILED" : "passed"} · ${((Date.now() - start) / 1000).toFixed(1)}s including preparation.`,
);
process.exitCode = result.code;
