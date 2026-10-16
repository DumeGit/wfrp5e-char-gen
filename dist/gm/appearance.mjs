import { suggestion } from "../background.mjs";
import { gmRoll } from "./model.mjs";

// Reviewed foundation identities, not name matching (a Rat Ogre is not an Ogre).
// Supplement foundations may already declare their Species explicitly.
const coreSpecies = {
  "core:creatures:human": ["Human"],
  "core:creatures:human-watchman": ["Human"],
  "core:creatures:human-merchant": ["Human"],
  "core:creatures:human-thug": ["Human"],
  "core:creatures:dwarf": ["Dwarf"],
  "core:creatures:halfling": ["Halfling"],
  "core:creatures:halfling-thief": ["Halfling"],
  "core:creatures:high-elf-or-wood-elf": ["High Elf", "Wood Elf"],
  "core:creatures:ogre": ["Ogre"],
  "core:creatures:gnome": ["Gnome"],
  "archives-ii:creatures:typical-sister": ["Human"],
};

export function appearanceSpecies(R, profile) {
  const candidates = profile?.species
    ? [profile.species]
    : coreSpecies[profile?.id] || [];
  return candidates.filter(
    (name) =>
      R.species[name]?.height &&
      R.background[name]?.eyes?.length &&
      R.background[name]?.hair?.length,
  );
}

export function rollGMAppearance(R, s, profile, species) {
  const choices = appearanceSpecies(R, profile);
  species ||= choices.length === 1 ? choices[0] : "";
  if (!choices.includes(species))
    throw Error("Choose a supported PC appearance Species for this profile.");
  const sp = R.species[species];
  const roll = (sides, page, kind, source, count = 1) => {
    const faces = gmRoll(
      s,
      `${species} appearance: ${kind}`,
      count,
      sides,
      page,
    );
    s.rolls.at(-1).source = source;
    return faces.reduce((sum, face) => sum + face, 0);
  };
  const height =
    sp.height[0] +
    roll(
      10,
      sp.appearancePage || sp.page,
      "height (inches)",
      { ...sp.source, page: sp.appearancePage || sp.page },
      sp.height[1],
    );
  const background = { species };
  const eyes = suggestion(R, background, "eyes", roll);
  const hair = suggestion(R, background, "hair", roll);
  // One editable value, no duplicate table or saved copy of catalogue wording.
  // Rerolls replace it; the shared Undo history restores the previous description.
  s.description = `${Math.floor(height / 12)} ft ${height % 12} in; ${eyes.toLowerCase()} eyes; ${hair.toLowerCase()} hair.`;
}
