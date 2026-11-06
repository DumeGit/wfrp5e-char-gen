// Core p. 183 poison table. Only explicit Condition effects are indexed here.
const poisonConditions = {
  "core:market:98": ["Stunned"],
  "core:market:99": ["Stunned"],
  "core:market:100": ["Poisoned"],
  "core:market:104": ["Besmirched", "Poisoned"],
  "core:market:105": ["Fatigued"],
  "core:market:106": ["Poisoned"],
  "core:market:107": ["Blinded", "Deafened"],
};

export function equipmentConditions(R, ...entries) {
  const coreConditions = (R.ruleReferences || []).filter(
    (entry) => entry.category === "condition" && entry.source.book === "core",
  );
  const names = new Set();
  for (const entry of entries.filter(Boolean)) {
    const text = [entry.qualities, entry.text].filter(Boolean).join(" · ");
    for (const name of poisonConditions[entry.contentId] || []) names.add(name);
    if (/\bPummel\b/i.test(text)) names.add("Stunned");
    if (/\bEntangle\b/i.test(text)) names.add("Entangled");
    for (const { name } of coreConditions) {
      if (
        new RegExp(
          `\\b(?:inflict\\s*\\(\\s*|(?:inflicts?|caus(?:e|es|ing)|gains?|suffers?|takes?|acquires?|receives?)\\s+(?:(?:the|an?|one|two|[0-9]+|\\+|SL)\\s+)*)${name}\\b`,
          "i",
        ).test(text)
      )
        names.add(name);
    }
  }
  return coreConditions.filter((entry) => names.has(entry.name));
}
