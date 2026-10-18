import { readdir, readFile } from "node:fs/promises";
import { parse } from "acorn";
import { analyze } from "eslint-scope";
const allowed = new Set(
  "Array ArrayBuffer Blob Boolean Date Error Infinity Intl JSON Map Math Number Object Promise RegExp Set String TextDecoder Uint32Array Uint8Array URL URLSearchParams WeakMap WeakSet console crypto document fetch globalThis localStorage location navigator performance requestAnimationFrame setTimeout clearTimeout window confirm undefined structuredClone CustomEvent CSS FileReader matchMedia Event encodeURIComponent decodeURIComponent".split(
    " ",
  ),
);
let count = 0;
async function check(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (["vendor", "assets", "data", "icons"].includes(item.name)) continue;
    const url = new URL(item.name + (item.isDirectory() ? "/" : ""), dir);
    if (item.isDirectory()) await check(url);
    else if (/\.(mjs|js)$/.test(item.name) && item.name !== "sw.js") {
      const text = await readFile(url, "utf8"),
        ast = parse(text, {
          ecmaVersion: "latest",
          sourceType: "module",
          ranges: true,
        });
      const scope = analyze(ast, { ecmaVersion: 2022, sourceType: "module" });
      const unknown = [
        ...new Set(scope.globalScope.through.map((x) => x.identifier.name)),
      ].filter((x) => !allowed.has(x));
      if (unknown.length)
        throw Error(
          `${url.pathname}: undeclared identifiers: ${unknown.join(", ")}`,
        );
      for (const node of ast.body.filter((x) => x.type === "ImportDeclaration"))
        if (node.source.value.startsWith(".")) {
          const target = new URL(node.source.value.split("?")[0], url);
          let resolved = false;
          for (const extension of ["", ".ts", ".tsx", ".mjs", ".js"]) {
            try {
              await readFile(new URL(target.href + extension));
              resolved = true;
              break;
            } catch {}
          }
          if (!resolved)
            throw Error(`${url.pathname}: missing import ${node.source.value}`);
        }
      count++;
    }
  }
}
await check(new URL("../src/", import.meta.url));
console.log(
  `Checked syntax, imported files and undeclared identifiers in ${count} application modules.`,
);
