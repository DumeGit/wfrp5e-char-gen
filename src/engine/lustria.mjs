// Explicit Lustria access rules. No playable Skink Species is introduced.
const slannSpells = new Set([
  "lustria:spell:earth-line",
  "lustria:spell:ruination-of-cities",
  "lustria:spell:mental-blast",
]);
const elven = (species) =>
  ["High Elf", "Wood Elf", "Dark Elf", "High Elf or Wood Elf"].includes(
    species,
  );
export function lustriaSpellIssue(spell, species) {
  if (slannSpells.has(spell?.contentId) && species !== "Slann")
    return "This geomantic spell is Slann-only (Lustria p. 129).";
  if (
    spell?.source?.book === "lustria" &&
    spell.category === "Mathlann" &&
    !elven(species)
  )
    return "Only Elven Priests of Mathlann may learn this Miracle (Lustria p. 81).";
  return "";
}
export function lustriaTalentIssue(name, species) {
  if (name === "Bless (Mathlann)")
    return "Lustria supplies Mathlann Miracles, but no Blessing list. No Blessings are invented (p. 81).";
  if (name === "Invoke (Mathlann)" && !elven(species))
    return "Mathlann's printed Miracles are restricted to Elven Priests (Lustria p. 81).";
  return "";
}
