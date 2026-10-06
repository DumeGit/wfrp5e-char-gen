// Contextual changes belong to the printed list, not the core Miracle definition.
const ASPECT_PAGES = {
  "deft-steps:career:thief-priest": 18,
  "deft-steps:career:gambler-priest": 19,
  "deft-steps:career:trickster-priest": 24,
  "deft-steps:career:liberator-priest": 25,
};
const ORIGINAL_MIRACLES = {
  "Cheat the Odds": "Stay Lucky",
  "Trickster’s Glamour": "Rich Man, Poor Man, Beggar Man, Thief",
  "You Saw Nothing": "You Ain’t Seen Me Right?",
};
export function deftMiracleAdaptation(R, career, name) {
  const page = ASPECT_PAGES[career],
    original = ORIGINAL_MIRACLES[name];
  const cult = (R.cults || []).find((x) => x.name === "Ranald");
  if (!page || !original || !cult?.careerMiracles?.[career]?.includes(name))
    return null;
  return {
    source: { book: "deft-steps", page },
    adaptation: `Printed ${original} uses the user-approved Fifth Edition core ${name} Miracle and its effects.`,
  };
}
