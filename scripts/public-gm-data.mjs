import { describeTraits } from "../src/engine/gm/trait-descriptions.mjs";

// Compile source conflicts before discarding unused full-text stat blocks.
// Actual attacks, Skills, Traits, armour and choices are already structured.
export function publicGMData(source) {
  const data = structuredClone(source);
  const definitions = new Map(data.traits.map((entry) => [entry.name, entry]));
  for (const profile of data.profiles) {
    const traits = profile.traits.map((trait) => ({
      ...definitions.get(trait.name),
      ...trait,
    }));
    const described = describeTraits(profile, traits);
    profile.traitDescriptionNotes = Object.fromEntries(
      described
        .filter((entry) => entry.descriptionNote)
        .map((entry) => [entry.name, entry.descriptionNote]),
    );
    profile.venomSourceConflict =
      profile.venomSourceConflict ||
      /avoid|pass.*Endurance/.test(profile.sections?.Traits || "");
    profile.sections = {
      ...(profile.sections.Trappings
        ? { Trappings: profile.sections.Trappings }
        : {}),
    };
    delete profile.text;
    delete profile.descriptionId;
    delete profile.descriptionStatus;
  }
  for (const template of data.templates) {
    delete template.text;
    delete template.descriptionId;
    delete template.descriptionStatus;
  }
  return data;
}
