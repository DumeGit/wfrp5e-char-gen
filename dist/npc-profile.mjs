import * as M from "./rules.mjs";
export const escapePattern = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const bonus = (n) =>
  n === null || n === undefined ? null : Math.floor(n / 10);
export function profileFeatures(R, p, kind) {
  const collection = kind === "trait" ? R.traits : R.talents;
  if (p[`${kind}Grants`])
    return p[`${kind}Grants`].map((grant) => {
      const entry = collection.find(
        (record) => M.base(record.name) === M.base(grant.name),
      );
      return {
        id: entry.contentId,
        name: grant.name,
        value: grant.value || "",
        printed: true,
        source: p.source,
        ranks: grant.ranks || 1,
        ...(grant.adaptation ? { adaptation: grant.adaptation } : {}),
      };
    });
  const text = p.sections[kind === "trait" ? "Traits" : "Talents"] || "";
  const names = [
    ...collection.map((x) => (kind === "talent" ? M.base(x.name) : x.name)),
    ...(kind === "talent" ? ["Resistance", "Unshakeable"] : []),
  ].sort((a, b) => b.length - a.length);
  const re = new RegExp(
    `(?:^|\\s)(${names.map(escapePattern).join("|")})(?:\\s*\\(([^)]+)\\))?(?:\\s+(\\d+\\+?))?\\s*:`,
    "g",
  );
  const out = [];
  for (const m of text.matchAll(re)) {
    const name = kind === "talent" ? M.canon(m[1]) : m[1];
    const value = m[2] || m[3] || "";
    const entry = collection.find(
      (x) => x.name === name || M.base(x.name) === name,
    );
    if (!entry) continue;
    out.push({
      id: entry.contentId,
      name: kind === "talent" && value ? `${name} (${value})` : name,
      value,
      printed: true,
      source: p.source,
      ranks: 1,
    });
  }
  return out;
}
export function suggestedTraits(R, p) {
  const raw = p.sections["Optional Traits"] || "";
  return R.traits.filter((t) =>
    new RegExp(`(?:^|[ ,])${escapePattern(t.name)}(?:[ ,(0-9]|$)`).test(raw),
  );
}
export function traitParameter(name, entry) {
  if (name === "Size") return "size";
  if (name === "Trained") return "training";
  if (name === "Breath") return "breath";
  if (
    [
      "Bite",
      "Web",
      "Ward",
      "Fear",
      "Terror",
      "Fly",
      "Tentacles",
      "Many Heads",
      "Daemonic",
    ].includes(name)
  )
    return "number";
  return entry.parameter ? "text" : null;
}
export function npcOptions(R, raw, kind) {
  if (/^Chaos Magic \(Any\)$/.test(raw))
    return ["Nurgle", "Slaanesh", "Tzeentch"]
      .filter((n) => R.spells.some((x) => x.category === n))
      .map((n) => `Chaos Magic (${n})`);
  return M.options(R, raw, kind);
}
export function grantChoices(R, g, kind) {
  return [...new Set(g.options.flatMap((n) => npcOptions(R, n, kind)))];
}
export function armourOptions(p) {
  const text = p.sections.Armour || "";
  return [
    ...text.matchAll(/Optional ([^:]+):\s*\+(\d+) AP([^]*?)(?=Optional |$)/g),
  ].map((m, i) => ({
    id: `printed-armour-${i}`,
    name: m[1].trim(),
    ap: Number(m[2]),
    text: m[3].trim(),
    source: p.source,
  }));
}
export function armourLocations(text, fallback = "All") {
  const names = ["Head", "Arms", "Body", "Legs"].filter((n) =>
    text.toLowerCase().includes(n.toLowerCase()),
  );
  return names.length
    ? names
    : fallback === "Shield"
      ? ["Shield"]
      : ["Head", "Arms", "Body", "Legs"];
}
export function printedArmour(p) {
  if (p.armourProfiles)
    return p.armourProfiles.map((a, i) => ({
      ...a,
      id: `base-armour-${i}`,
      source: p.source,
    }));
  const text = (p.sections.Armour || "").split("Optional ")[0];
  return [
    ...text.matchAll(
      /([A-Za-z -]+):\s*\+(\d+) AP([^]*?)(?=[A-Za-z -]+:\s*\+\d+ AP|$)/g,
    ),
  ].map((m, i) => ({
    id: `base-armour-${i}`,
    name: m[1].trim(),
    ap: Number(m[2]),
    text: m[3].trim(),
    source: p.source,
  }));
}
export function attackCharacteristic(attack) {
  if (attack.ranged) return "BS";
  if (/Ghostly Howl|Chill Grasp/.test(attack.name)) return "WS";
  return /yards|Rocks|Bow|Sling|Crossbow|Pistol|Handgun|Vomit|Breath|Tongue/i.test(
    attack.name + " " + attack.text,
  )
    ? "BS"
    : "WS";
}
export function attackSkill(R, attack) {
  if ("skillName" in attack) return attack.skillName;
  const char = attackCharacteristic(attack);
  if (
    /^(?:Bite|Horns|Tail|[0-9]+ Tentacles|Chill Grasp|Ghostly Howl|Vomit|Breath)/.test(
      attack.name,
    )
  )
    return null;
  const w = attackWeapon(R, attack);
  if (w) return `${w.kind === "ranged" ? "Ranged" : "Melee"} (${w.group})`;
  if (char === "BS") {
    if (/bow/i.test(attack.name)) return "Ranged (Bow)";
    if (/Sling/.test(attack.name)) return "Ranged (Sling)";
    if (/Rocks/.test(attack.name)) return "Ranged (Throwing)";
    return null;
  }
  return "Melee (Brawling)";
}
export function attackWeapon(R, attack) {
  return R.weapons.find(
    (x) =>
      attack.name === x.name ||
      attack.name === x.name.replace(/ \(2H\)$/, " ").trim() ||
      attack.name.startsWith(x.name + " and "),
  );
}
export function magicLores(R, talents, traits) {
  const names = [
    ...talents.map((x) => x.name),
    ...traits
      .filter((x) => x.name === "Spellcaster")
      .map((x) => `Arcane Magic (${x.value})`),
  ];
  return [
    ...new Set(
      names
        .filter((x) => /^(Arcane Magic|Chaos Magic) \(/.test(x))
        .map((x) => x.match(/\((.+)\)/)[1]),
    ),
  ];
}
