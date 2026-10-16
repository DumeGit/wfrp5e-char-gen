import { esc } from "./workspace.mjs";
import { searchBookId } from "./search-filters.mjs";

const collections = ["skills", "talents"];
const family = (name) => name.replace(/ \(.+\)$/, "");
const identity = (name) => name.toLocaleLowerCase();

// A core Career can be projected in several book contexts. Union only the
// resolved specialisation choices; each source/variant keeps its own row key.
export function mergeCareerOptions(left, right) {
  return left.map((level, i) =>
    Object.fromEntries(
      collections.map((kind) => [
        kind,
        [...new Set([...level[kind], ...right[i][kind]])],
      ]),
    ),
  );
}

export function validateCareerOptions(row) {
  if (row.kind !== "career" || row.printedReference) {
    if (row.careerOptions !== undefined)
      throw Error("Invalid Career reference options.");
    return;
  }
  if (
    !Array.isArray(row.careerOptions) ||
    row.careerOptions.length !== row.entry.levels?.length ||
    row.careerOptions.some(
      (level) =>
        !level ||
        Object.keys(level).length !== 2 ||
        collections.some(
          (kind) =>
            !Array.isArray(level[kind]) ||
            level[kind].some(
              (name) => typeof name !== "string" || !name.trim(),
            ) ||
            new Set(level[kind]).size !== level[kind].length,
        ),
    )
  ) {
    throw Error(
      "Career references are invalid or out of date. Reload the app to update.",
    );
  }
}

// Construct once after the shared reference payload loads, not on every search
// keystroke. No selected character, Species or enabled-book state is consulted.
export function createCareerReferenceIndex(rows) {
  const exact = new Map(),
    families = new Map();
  function add(index, key, career, level) {
    if (!index.has(key)) index.set(key, new Map());
    const matches = index.get(key);
    if (!matches.has(career.key))
      matches.set(career.key, { career, levels: new Set() });
    matches.get(career.key).levels.add(level);
  }
  for (const career of rows.filter(
    (row) => row.kind === "career" && !row.printedReference,
  )) {
    validateCareerOptions(career);
    career.careerOptions.forEach((level, i) => {
      for (const kind of ["skill", "talent"])
        for (const name of level[kind + "s"]) {
          add(exact, `${kind}:${identity(name)}`, career, i + 1);
          add(families, `${kind}:${identity(family(name))}`, career, i + 1);
        }
    });
  }
  return (row) => {
    if (!["skill", "talent"].includes(row.kind)) return [];
    const index = family(row.name) === row.name ? families : exact;
    const key = `${row.kind}:${identity(row.name)}`;
    return [...(index.get(key)?.values() || [])]
      .map(({ career, levels }) => ({
        career,
        levels: [...levels].sort((a, b) => a - b),
      }))
      .sort(
        (a, b) =>
          a.career.name.localeCompare(b.career.name) ||
          a.career.entry.source.book.localeCompare(
            b.career.entry.source.book,
          ) ||
          a.career.key.localeCompare(b.career.key),
      );
  };
}

export function careerReferencesHTML(row, matches, books) {
  if (!["skill", "talent"].includes(row.kind)) return "";
  const title = `Careers with this ${row.kind}`;
  if (!matches.length)
    return `<section class="search-career-references"><h3>${title}</h3><p class="small muted">No listed Career offers this ${row.kind} in the imported Career profiles.</p></section>`;
  return `<section class="search-career-references"><h3>${title} <small>${matches.length}</small></h3><p class="small muted">Levels show where it is listed, including alternatives. Other prerequisites still apply.</p><div class="search-table-wrap"><table><caption class="screen-reader">${esc(title)}: ${esc(row.name)}</caption><thead><tr><th scope="col">Career</th><th scope="col" class="search-career-class">Class</th><th scope="col">Level</th></tr></thead><tbody>${matches
    .map(({ career, levels }) => {
      const source = career.entry.source;
      const book = books.find((book) => book.id === source.book);
      const parent = books.find(
        (book) => book.id === searchBookId(source.book, books),
      );
      const label = `${parent && parent !== book ? `${parent.shortTitle || parent.title} — ` : ""}${book?.shortTitle || book?.title || source.book}`;
      return `<tr><th scope="row"><button type="button" class="search-term-link search-career-link" data-reference-keys="${esc(JSON.stringify([career.key]))}" aria-label="View ${esc(career.name)} Career from ${esc(label)}">${esc(career.name)}</button><span class="search-career-source">${esc(label)} · p. ${esc(source.page)}</span><span class="search-career-mobile-class">${esc(career.entry.class)}</span></th><td class="search-career-class">${esc(career.entry.class)}</td><td>${levels.map((level) => `<span class="search-career-rank"><b>L${level}</b> ${esc(career.entry.levels[level - 1].name)}</span>`).join("")}</td></tr>`;
    })
    .join("")}</tbody></table></div></section>`;
}
