// Pure catalogue projections shared by the React interface and rule tests.
import { base, options } from "../rules.mjs";
import { magicChoices, gmSkillCharacteristic, gmLoreIssue } from "./model.mjs";
export function searchPickerEntries(entries, query) {
  const q = query.toLowerCase().trim();
  if (!q) return entries;
  return entries
    .map((entry) => {
      const name = entry.name.toLowerCase(),
        rank =
          name === q
            ? 0
            : name.startsWith(q)
              ? 1
              : name.includes(q)
                ? 2
                : `${entry.text || ""} ${entry.category || ""}`
                      .toLowerCase()
                      .includes(q)
                  ? 3
                  : -1;
      return { entry, rank };
    })
    .filter(({ rank }) => rank >= 0)
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.entry.name.localeCompare(b.entry.name, "en", { sensitivity: "base" }),
    )
    .map(({ entry }) => entry);
}
// Group only the presentation: saved selections retain their exact catalogue key.
export function groupPickerEntries(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const name = entry.name.includes("(") ? base(entry.name) : entry.name;
    const key = entry.name.includes("(") ? `group:${name}` : entry.key;
    if (!groups.has(key))
      groups.set(
        key,
        entry.name.includes("(") ? { ...entry, name, key, choices: [] } : entry,
      );
    const group = groups.get(key);
    if (group.choices && !group.choices.some((x) => x.key === entry.key))
      group.choices.push(entry);
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}
export function pickerEntries(data, R, r, kind) {
  if (kind === "trait")
    return data.traits
      .filter((x) => x.name !== "Size")
      .map((x) => ({ ...x, key: x.id }));
  if (kind === "mutation")
    return data.mutations.map((x) => ({ ...x, key: x.id }));
  if (kind === "magic")
    return magicChoices(R, r).map((x) => ({ ...x, key: x.contentId }));
  if (kind === "equipment")
    return [...R.weapons, ...R.armour, ...R.gear, ...R.market]
      .filter((x, i, a) => a.findIndex((y) => y.name === x.name) === i)
      .map((x) => ({
        ...x,
        key: x.contentId,
        category: x.kind
          ? "Weapon"
          : x.ap !== undefined
            ? "Armour"
            : x.category || "Trappings",
      }));
  if (kind === "skill")
    return R.skills.flatMap((x) =>
      x.grouped
        ? options(R, `${base(x.name)} (Any)`, "skill").map((name) => ({
            ...x,
            name,
            key: name,
            char: gmSkillCharacteristic(R, r.profile, name),
          }))
        : [
            {
              ...x,
              key: x.name,
              char: gmSkillCharacteristic(R, r.profile, x.name),
            },
          ],
    );
  return R.talents.flatMap((x) => {
    let names = options(
      R,
      x.name.includes("(") ? `${base(x.name)} (Any)` : x.name,
      "talent",
    );
    // Fixed Lore Talents printed in Careers (such as Hedgecraft) remain
    // explicit GM choices alongside the core Colour options.
    if (base(x.name) === "Arcane Magic")
      names = [
        ...new Set([
          ...names,
          ...R.careers
            .flatMap((c) => c.levels.flatMap((l) => l.talents))
            .filter(
              (name) =>
                /^Arcane Magic \([^)]+\)$/.test(name) &&
                !/Any|All| or |,/.test(name),
            ),
        ]),
      ];
    if (base(x.name) === "Chaos Magic")
      names = ["Nurgle", "Slaanesh", "Tzeentch"].map(
        (n) => `Chaos Magic (${n})`,
      );
    if (base(x.name) === "Impassioned Zeal") names = ["Impassioned Zeal ()"];
    return names.map((name) => ({
      ...x,
      name,
      key: name,
      disabled:
        x.unavailable ||
        (/^(Arcane|Chaos) Magic \(/.test(name)
          ? gmLoreIssue(R, r.profile, name.match(/\((.*?)\)/)?.[1])
          : ""),
    }));
  });
}
