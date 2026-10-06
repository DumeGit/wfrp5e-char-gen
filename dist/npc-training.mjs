// Core p. 363 plus explicitly reviewed, profile-specific training references.
export const CORE_TRAINING = [
  "Broken",
  "Drive",
  "Entertain",
  "Fetch",
  "Guard",
  "Home",
  "Magic",
  "Mount",
  "War",
];
export function trainingChoices(profile) {
  return [
    ...new Set([
      ...CORE_TRAINING,
      ...(profile.trainingOptions || []).map((o) => o.name),
    ]),
  ];
}
export function trainingReferences(profile, selected) {
  return (profile.trainingOptions || [])
    .filter((o) => selected.has(o.name))
    .map((o) => ({
      ...o,
      source: { book: profile.source.book, page: o.page },
    }));
}
