import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Source sites, including reusable factories; repeated catalogue rows count once.
const rows = [];
const files = [];
function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.(tsx?|mjs|js|html)$/.test(file) && !file.includes(".test."))
      files.push(file);
  }
}
scan("src");
for (const file of files.sort()) {
  const source = fs.readFileSync(file, "utf8");
  const add = (start, factory, classes, label) =>
    rows.push({
      file: file.replaceAll("\\", "/"),
      line: source.slice(0, start).split("\n").length,
      factory,
      classes: classes || "default / caller supplied",
      label: label.replace(/\s+/g, " ").slice(0, 180),
    });
  if (file.endsWith(".html")) {
    for (const match of source.matchAll(
      /<button\b([^>]*)>([\s\S]*?)<\/button>/g,
    ))
      add(
        match.index,
        "static specimen",
        match[1].match(/class="([^"]*)"/)?.[1],
        match[2].replace(/<[^>]+>/g, " "),
      );
    continue;
  }
  const root = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.JS,
  );
  const text = (node) => node?.getText(root) || "";
  function visit(node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const factory = text(opening.tagName);
      if (
        ["button", "Button", "Action", "AsyncActionButton"].includes(factory)
      ) {
        const attribute = (name) =>
          opening.attributes.properties.find((p) => text(p.name) === name)
            ?.initializer;
        add(
          node.getStart(),
          factory,
          text(attribute("className")),
          ts.isJsxElement(node)
            ? node.children.map(text).join(" ")
            : text(attribute("aria-label")),
        );
      }
    }
    if (ts.isCallExpression(node)) {
      if (text(node.expression) === "button")
        add(
          node.getStart(),
          "button()",
          text(node.arguments[3]),
          node.arguments.slice(0, 2).map(text).join(" · "),
        );
      else if (
        text(node.expression) === "element" &&
        node.arguments[0]?.text === "button"
      )
        add(
          node.getStart(),
          "element(button)",
          text(
            node.arguments[1]?.properties?.find((p) => p.name?.text === "class")
              ?.initializer,
          ),
          node.arguments.slice(2).map(text).join(" "),
        );
    }
    ts.forEachChild(node, visit);
  }
  visit(root);
}
const csv = (value) => `"${String(value).replaceAll('"', '""')}"`;
const output = [
  ["File", "Line", "Factory", "Classes", "Label / action"],
  ...rows.map(({ file, line, factory, classes, label }) => [
    file,
    line,
    factory,
    classes,
    label,
  ]),
]
  .map((row) => row.map(csv).join(","))
  .join("\n");
fs.writeFileSync("docs/BUTTON-INVENTORY.csv", `${output}\n`);
console.log(
  `${rows.length} authored button sites in ${new Set(rows.map((r) => r.file)).size} files; ${rows.filter((r) => r.factory === "static specimen").length} static specimens. Wrote docs/BUTTON-INVENTORY.csv.`,
);
