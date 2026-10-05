export { folioGear } from "./folio-gear.mjs";
import { characterResult } from "./character-result.mjs";

import { isLegacy, legacyTitle } from "./legacy.mjs";
import { legacyOption, legacyMagic } from "./legacy-character.mjs";

export function folioData(R, s, result = characterResult(R, s)) {
  const d = result.derived,
    counts = new Map();
  for (const name of d.talents) counts.set(name, (counts.get(name) || 0) + 1);
  const tag = (row, entry) => ({
    ...row,
    ...(isLegacy(R, entry)
      ? { legacy: true, legacyTitle: legacyTitle(R, entry) }
      : {}),
  });
  return {
    skills: result.skills
      .filter((row) => row.adv > 0)
      .map((row) =>
        tag(
          { name: row.name, value: row.total },
          legacyOption(R, s, "skill", row.name),
        ),
      ),
    talents: [...counts]
      .map(([name, value]) =>
        tag({ name, value }, legacyOption(R, s, "talent", name)),
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
    magic: [
      ...result.techniques.map((x) =>
        tag({ name: `${x.name} · technique` }, x),
      ),
      ...result.runes.map((x) =>
        tag({ name: `${x.name} · ${x.form} Rune` }, x),
      ),
      ...result.spells.map((x) =>
        tag({ name: x.displayName || x.name }, legacyMagic(R, s, x)),
      ),
      ...result.cants.map((x) =>
        tag({ name: `${x.name} · ${x.lore} Cant` }, x),
      ),
    ].sort((a, b) => a.name.localeCompare(b.name)),
    gear: result.gearSummary.map(({ name, quantity, legacy, legacyTitle }) => ({
      name,
      value: quantity,
      ...(legacy ? { legacy: true, legacyTitle } : {}),
    })),
  };
}
