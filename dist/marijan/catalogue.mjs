import { assembleBooks } from "../books.mjs";
import { options, skillInfo, talentInfo, base } from "../rules.mjs";
import { spellChoices } from "../archives-iii.mjs";
import { sourceLabel } from "../sources.mjs";

export const GROUPS = ["skills", "talents", "magic", "gear", "extras"];
const identity = (entry) => entry.contentId || entry.id;
export function createMarijanCatalogue(library, creatureOptions) {
  const ids = library.packs
    .filter((p) => p.manifest.kind !== "variant")
    .map((p) => p.manifest.id);
  const R = assembleBooks(library, ids);
  const rows = [],
    seen = new Set();
  const add = (group, kind, entry, name = entry.name) => {
    const id = `${kind}:${identity(entry) || entry.source?.book + ":" + entry.name}:${encodeURIComponent(name)}`;
    if (seen.has(id)) return;
    seen.add(id);
    rows.push({ ...entry, name, id, collection: group, kind });
  };
  for (const x of R.skills) {
    for (const name of x.grouped ? options(R, `${x.name} (Any One)`) : [x.name])
      add("skills", "skill", x, name);
  }
  for (const career of R.careers)
    for (const level of career.levels) {
      for (const raw of level.skills)
        for (const name of options(R, raw)) {
          const x = skillInfo(R, name);
          if (x && !/Any|All| or /.test(name)) add("skills", "skill", x, name);
        }
      for (const raw of level.talents)
        for (const name of options(R, raw, "talent")) {
          const x = talentInfo(R, name);
          if (x && !/Any|All| or /.test(name))
            add("talents", "talent", x, name);
        }
    }
  for (const x of R.talents) {
    const names = options(R, `${base(x.name)} (Any One)`, "talent");
    for (const name of names.length === 1 && /Any One/.test(names[0])
      ? [x.name]
      : names)
      add("talents", "talent", x, name);
  }
  for (const x of spellChoices(R))
    add(
      "magic",
      "spell",
      x,
      x.specialisation ? `${x.name} (${x.specialisation})` : x.name,
    );
  for (const x of R.cants) add("magic", "cant", x);
  for (const x of R.techniques) add("extras", "technique", x);
  for (const x of R.runes) add("extras", "rune", x);
  const goods = new Map();
  for (const [kind, entries] of [
    ["gear", R.gear],
    ["gear", R.market],
    ["weapon", R.weapons],
    ["armour", R.armour],
  ]) {
    for (const x of entries) {
      const key = `${x.source?.book}:${x.name}`;
      const old = goods.get(key);
      goods.set(key, {
        kind: kind === "gear" && old ? old.kind : kind,
        entry: { ...old?.entry, ...x },
      });
    }
  }
  for (const { kind, entry } of goods.values()) add("gear", kind, entry);
  // Reuse reviewed creature options, never profiles/templates or new extraction.
  for (const x of creatureOptions.traits)
    add("extras", "trait", {
      ...x,
      source: x.source || { book: "core", page: x.page },
    });
  for (const x of creatureOptions.mutations)
    add("extras", "mutation", {
      ...x,
      source: x.source || { book: "core", page: x.page },
    });
  const careers = [...R.careers];
  for (const pack of library.packs.filter(
    (p) => p.manifest.kind === "variant",
  )) {
    careers.push(
      ...(pack.data.careers || []).map((c) => ({
        ...c,
        contentId: c.contentId || c.id,
        source: { book: pack.manifest.id, page: c.page },
      })),
    );
  }
  rows.sort(
    (a, b) =>
      a.name.localeCompare(b.name) ||
      a.source.book.localeCompare(b.source.book),
  );
  return {
    R,
    rows,
    careers: careers.sort(
      (a, b) =>
        a.name.localeCompare(b.name) ||
        a.source.book.localeCompare(b.source.book),
    ),
    byId: new Map(rows.map((x) => [x.id, x])),
    books: library.packs.map((p) => p.manifest),
    species: R.species,
    origins: R.origins,
  };
}
export function findEntries(catalogue, group, query = "", book = "") {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return catalogue.rows
    .filter(
      (x) =>
        x.collection === group &&
        (!book || x.source.book === book) &&
        words.every((w) => x.name.toLowerCase().includes(w)),
    )
    .sort(
      (a, b) =>
        Number(b.name.toLowerCase().startsWith(query.toLowerCase())) -
          Number(a.name.toLowerCase().startsWith(query.toLowerCase())) ||
        a.name.localeCompare(b.name),
    );
}
export const entrySource = (catalogue, entry) =>
  entry.custom
    ? "Custom entry"
    : sourceLabel({ books: catalogue.books }, entry, { legacy: false });

export const speciesEntry = (catalogue, name) =>
  Object.hasOwn(catalogue.species, name) ? catalogue.species[name] : null;

export const careerLabel = (catalogue, entry) =>
  `${entry.name} · ${catalogue.books.find((b) => b.id === entry.source.book)?.shortTitle || entry.source.book}`;
