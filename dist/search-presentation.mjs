export const SEARCH_CATEGORIES = {
  all: "All categories",
  rule: "Rules",
  condition: "Conditions",
  psychology: "Psychology",
  property: "Qualities & Flaws",
  trait: "Creature Traits",
  species: "Species & Origins",
  career: "Careers",
  skill: "Skills",
  talent: "Talents",
  magic: "Magic",
  equipment: "Equipment",
  profile: "Creatures",
  template: "Templates",
  mutation: "Corruption",
};
export const searchLabel = (row) =>
  row.kind === "rule" || row.kind === "property"
    ? `${row.kind === "rule" ? "Rule" : "Property"} · ${row.entry.topic}`
    : row.label ||
      {
        species: "Species / Origin",
        condition: "Condition",
        psychology: "Psychology",
        trait: "Creature Trait",
        profile: "Creature",
        template: "Template",
        mutation: "Corruption",
      }[row.kind] ||
      SEARCH_CATEGORIES[row.kind]?.replace(/s$/, "") ||
      row.kind;

const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
// The source catalogue uses paragraphs, headings, bullet lists and simple tables.
// No HTML, scripts, arbitrary links or Markdown plug-ins are executed.
export function ruleTextHTML(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n");
      if (
        lines.length > 2 &&
        lines[0].startsWith("|") &&
        /^\|[\s:|-]+\|$/.test(lines[1])
      ) {
        const cells = (line) =>
          line
            .split("|")
            .slice(1, -1)
            .map((x) => x.trim());
        return `<div class="search-table-wrap"><table><thead><tr>${cells(
          lines[0],
        )
          .map((x) => `<th>${escape(x)}</th>`)
          .join("")}</tr></thead><tbody>${lines
          .slice(2)
          .map(
            (line) =>
              `<tr>${cells(line)
                .map((x) => `<td>${escape(x)}</td>`)
                .join("")}</tr>`,
          )
          .join("")}</tbody></table></div>`;
      }
      if (block.startsWith("### ")) return `<h3>${escape(block.slice(4))}</h3>`;
      if (block.startsWith("• "))
        return `<ul><li>${escape(block.slice(2))}</li></ul>`;
      return `<p>${escape(block).replaceAll("\n", "<br>")}</p>`;
    })
    .join("");
}

export function speciesReferenceHTML(entry) {
  const offsets = entry.offsets || {},
    languages = entry.languages || [];
  return `${entry.text ? ruleTextHTML(entry.text) : ""}<dl class="search-profile-fields">${[
    [
      "Characteristic modifiers",
      Object.entries(offsets)
        .map(([k, v]) => `${k} ${v}`)
        .join(" · "),
    ],
    ["Movement", entry.movement],
    ["Fate", entry.fate],
    ["Fortune", entry.fortune],
    ["Species", entry.species],
    ["Native languages", languages.join(", ")],
    ["Random starting Talents", entry.randomTalents],
  ]
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([label, value]) =>
        `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`,
    )
    .join(
      "",
    )}</dl>${["skills", "talents", "grantedTalents"].map((k) => (Array.isArray(entry[k]) ? `<p><strong>${k === "skills" ? "Skills" : k === "grantedTalents" ? "Additional Talents" : "Talents"}:</strong> ${escape(entry[k].map((choice) => (Array.isArray(choice) ? choice.join(" or ") : choice)).join("; "))}</p>` : "")).join("")}`;
}

export function linkReferenceNodes(root, linker, current, attribute) {
  const walker = document.createTreeWalker(root, window.NodeFilter.SHOW_TEXT),
    nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement.closest("button,a,h2,h3,dt,.gm-dialog-actions"))
      nodes.push(node);
  }
  for (const node of nodes) {
    const segments = linker(node.textContent, current);
    if (!segments.some((x) => x.keys)) continue;
    const fragment = document.createDocumentFragment();
    for (const segment of segments) {
      if (!segment.keys) fragment.append(document.createTextNode(segment.text));
      else {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "search-term-link";
        button.textContent = segment.text;
        button.dataset[attribute] = JSON.stringify(segment.keys);
        button.setAttribute("aria-label", `View ${segment.text} reference`);
        fragment.append(button);
      }
    }
    node.replaceWith(fragment);
  }
}
