// Stable section identifiers, shared by navigation and rule issue destinations.
export const NPC_SECTIONS = [
  { name: "Profile", hint: "Printed starting point" },
  { name: "Characteristics", hint: "Template, size & scores" },
  { name: "Traits & mutations", hint: "Creature abilities" },
  { name: "Skills & talents", hint: "Training & ranks" },
  { name: "Equipment", hint: "Attacks, armour & gear" },
  { name: "Magic", hint: "Spells & prayers" },
  { name: "Career development", hint: "Optional XP advances" },
  { name: "Review & export", hint: "Compact GM sheet" },
];
export const NPC_REVIEW = NPC_SECTIONS.length - 1;
export function npcIssueStep(target, fallback = 1) {
  if (target === "#npc-printed") return 0;
  if (/^#npc-(template|score-|size|tb|anatomy)/.test(target)) return 1;
  if (
    /^#npc-(traits|trait-value|mark-roll|mutations|training-roll)/.test(target)
  )
    return 2;
  if (/^#npc-(talent|add-skill)/.test(target)) return 3;
  if (/^#npc-(attack|gear|armour)/.test(target)) return 4;
  if (/^#npc-(magic|trait-wind)/.test(target)) return 5;
  if (/^#npc-xp/.test(target)) return 6;
  return fallback;
}
export function npcChecks(result) {
  const errors = result.issues.filter((x) => x.severity === "error");
  const warnings = result.issues.filter((x) => x.severity !== "error");
  const notes = [...new Set(result.profile.notes || [])];
  return { errors, warnings, notes, blocked: errors.length > 0 };
}
