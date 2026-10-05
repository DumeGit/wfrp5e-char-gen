import { dwarfNameRoll } from "./dwarf-guide.mjs";
import { creationBackground } from "./origins.mjs";
export function appearanceSummary(s) {
  const age =
    s.highElf?.era && Number.isInteger(s.highElf.elderAge)
      ? s.highElf.elderAge
      : null;
  const appearance =
    age === null
      ? s.appearance
      : [`${age} years`, (s.appearance || "").replace(/^\d+ years;\s*/, "")]
          .filter(Boolean)
          .join("; ");
  return [
    appearance,
    s.background?.eyes ? `Eyes: ${s.background.eyes}` : "",
    s.background?.hair ? `Hair: ${s.background.hair}` : "",
    s.background?.birthplace ? `Birthplace: ${s.background.birthplace}` : "",
    s.longbeard ? `Longbeard: ${s.longbeardAge || "?"} years` : "",
    s.background?.clan ? `Clan: ${s.background.clan}` : "",
  ]
    .filter(Boolean)
    .join("; ");
}
export function setAgeHeight(s, age, height) {
  // Replace generated prefixes, including duplicates left by older versions.
  const background = (s.appearance || "").replace(
    /^(?:\d+ years;\s*\d+ ft \d+ in(?:;\s*|$))+/,
    "",
  );
  s.appearance =
    `${age} years; ${Math.floor(height / 12)} ft ${height % 12} in` +
    (background ? `; ${background}` : "");
}
export function bookName(value) {
  return value.replace(/ \([^)]*\)/g, "");
}
export function nameParts(s) {
  if (
    s.identity &&
    typeof s.identity.forename === "string" &&
    typeof s.identity.surname === "string"
  )
    return { ...s.identity };
  // Old saves keep the full name; only split for display until a part is edited.
  const [forename = "", ...rest] = (s.name || "").trim().split(/\s+/);
  return { forename, surname: rest.join(" ") };
}
export function setNamePart(s, key, value) {
  if (!["forename", "surname"].includes(key))
    throw Error("Unknown name field.");
  s.identity = { ...nameParts(s), [key]: value };
  s.name = [s.identity.forename.trim(), s.identity.surname.trim()]
    .filter(Boolean)
    .join(" ");
}
export function suggestion(R, s, kind, roll) {
  const b = creationBackground(R, s),
    source = ["forenames", "surnames"].includes(kind)
      ? { ...b.source, page: b.namePages?.[kind] || b.source.page }
      : R.background[s.species].source;
  if (b.dwarfNames && ["forenames", "surnames"].includes(kind))
    return dwarfNameRoll(R, s, kind, roll);
  const table = b?.rollTables?.[kind];
  if (table) {
    const n = roll(
      table.dice[1],
      table.page,
      kind,
      { book: source.book, page: table.page },
      table.dice[0],
    );
    const result = table.rows.find((x) => n >= x.min && n <= x.max);
    if (!result)
      throw Error("Dice result outside the printed background table.");
    return result.result;
  }
  const choices = b?.[kind] || [];
  if (!choices.length) throw Error("No book suggestions for this choice.");
  const n = roll(choices.length, source.page, kind, source, 1);
  return choices[n - 1];
}
export function traditionalName(R, s, roll) {
  const b = creationBackground(R, s);
  if (!b?.nameElements)
    throw Error("No traditional name tables for this Species.");
  return b.nameElements
    .map((table, i) => {
      const n = roll(
        table.dice[1],
        table.page,
        `Name element ${i + 1}`,
        { book: b.source.book, page: table.page },
        table.dice[0],
      );
      const row = table.rows.find((x) => n >= x.min && n <= x.max);
      if (!row) throw Error("Dice result outside the printed name table.");
      return row.result;
    })
    .join("");
}
export function selectedTraditionalName(R, s) {
  const tables = creationBackground(R, s)?.nameElements;
  if (!tables) return "";
  const elements = tables.map(
    (table, i) =>
      table.rows.find((row) => row.min === s.nameElements?.[i])?.result,
  );
  return elements.every(Boolean) ? elements.join("") : "";
}
export function suggestedName(R, s, roll) {
  return [
    suggestion(R, s, "forenames", roll),
    suggestion(R, s, "surnames", roll),
  ]
    .map(bookName)
    .join(" ");
}
export function doomingResult(R, n) {
  return R.background.doomings.find((x) => n >= x.min && n <= x.max);
}
