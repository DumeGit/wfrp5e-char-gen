import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const types = {
  ".html": "text/html",
  ".mjs": "text/javascript",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".json": "application/json",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      const name = decodeURIComponent(url.pathname);
      const file = path.resolve(root, "." + name);
      if (
        !["/design-previews/", "/design-assets/", "/dist/"].some((x) =>
          name.startsWith(x),
        ) ||
        !file.startsWith(root + path.sep) ||
        path.extname(file) === ".pdf"
      ) {
        res.writeHead(403);
        res.end();
        return;
      }
      const bytes = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(8110, "127.0.0.1", () =>
    console.log(
      "Design previews: http://127.0.0.1:8110/design-previews/marijan-colours.html",
    ),
  );
