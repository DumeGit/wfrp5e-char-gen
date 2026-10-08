// Test-run-owned server. Never reuse the user's preview or serve source PDFs.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".pdf": "application/pdf",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".webmanifest": "application/manifest+json",
};
const port = Number(process.env.WFRP_TEST_PORT || 8199);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw Error("Invalid test port.");
const server = http.createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (pathname === "/__test_health") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end("WFRP browser test server");
    }
    const file = path.resolve(
      root,
      "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname),
    );
    if (
      !file.startsWith(root + path.sep) &&
      file !== path.join(root, "index.html")
    ) {
      res.writeHead(403);
      return res.end();
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      return res.end();
    }
    let bytes = await readFile(file);
    // An isolated test cookie serves a second real worker version without
    // rewriting dist or touching another browser's preview/storage.
    if (
      pathname === "/sw.js" &&
      /(?:^|;\s*)wfrp-test-update=1(?:;|$)/.test(req.headers.cookie || "")
    ) {
      bytes = Buffer.from(
        bytes
          .toString("utf8")
          .replace(
            /const CACHE=CACHE_PREFIX\+"([^"]+)";/,
            'const CACHE=CACHE_PREFIX+"$1-browser-update";',
          ),
      );
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
    });
    res.end(req.method === "HEAD" ? undefined : bytes);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.listen(port, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
