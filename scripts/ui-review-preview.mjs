// Development-only review server. Serves dist plus the explicit review harness;
// never serves source books or the rest of the repository.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { reviewFixtures } from "../tests/ui-review-fixtures.mjs";
const root = path.resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const fixtures = JSON.stringify(reviewFixtures());
const types = {
  ".html": "text/html",
  ".mjs": "text/javascript",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".webmanifest": "application/manifest+json",
};
const server = http.createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405);
    return res.end();
  }
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (pathname === "/__ui-review-fixtures") {
      res.setHeader("Content-Type", "application/json");
      return res.end(fixtures);
    }
    if (pathname === "/__ui-review") {
      res.setHeader("Content-Type", "text/html");
      return res.end(
        await fs.readFile(
          new URL("../tests/manual/ui-review.html", import.meta.url),
        ),
      );
    }
    const file = path.resolve(
      root,
      "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname),
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403);
      return res.end();
    }
    res.setHeader(
      "Content-Type",
      types[path.extname(file)] || "application/octet-stream",
    );
    res.end(await fs.readFile(file));
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.listen(8211, "127.0.0.1", () =>
  process.stdout.write("UI review: http://127.0.0.1:8211/__ui-review\n"),
);
