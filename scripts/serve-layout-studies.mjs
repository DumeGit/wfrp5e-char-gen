// Read-only, loopback-only preview. No source books or personal drafts are served.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(
  process.argv.find((arg) => arg.startsWith("--port="))?.slice(7) || 8208,
);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw Error("Invalid preview port.");
const types = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".webp": "image/webp",
};
http
  .createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (pathname === "/") {
        res.writeHead(302, {
          Location: "/design-previews/unified-layout.html",
        });
        return res.end();
      }
      if (
        !/^\/design-previews\/unified-(?:layout\.(?:html|css|mjs)|rustic\.css|(?:parchment|ornament)\.svg)$/.test(
          pathname,
        ) &&
        !pathname.startsWith("/public/assets/")
      ) {
        res.writeHead(404);
        return res.end();
      }
      const target = path.resolve(root, "." + pathname);
      if (
        !target.startsWith(path.resolve(root) + path.sep) ||
        !types[path.extname(target)]
      ) {
        res.writeHead(404);
        return res.end();
      }
      const bytes = await readFile(target);
      res.writeHead(200, {
        "Content-Type": types[path.extname(target)],
        "X-Content-Type-Options": "nosniff",
      });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end();
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(
      `Layout studies: http://127.0.0.1:${port}/design-previews/unified-layout.html`,
    ),
  );
