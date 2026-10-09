export const characteristicBonus = (value) =>
  value === null || value === undefined ? null : Math.floor(value / 10);
export function woundFormula(
  stats,
  size,
  construct = false,
  swarm = false,
  hardy = 0,
  toughnessBonus = characteristicBonus(stats.T),
) {
  const tb = toughnessBonus,
    sb = characteristicBonus(stats.S),
    wp = construct ? sb : characteristicBonus(stats.WP);
  if (tb === null) return null;
  if (swarm)
    return sb === null || wp === null ? null : (sb + (2 + hardy) * tb + wp) * 5;
  if (size === "Tiny") return null;
  if (size === "Small") return (2 + hardy) * tb;
  if (sb === null || wp === null) return null;
  return (
    (sb + (2 + hardy) * tb + wp) *
    ({ Average: 1, Large: 2, Enormous: 4, Monstrous: 8 }[size] || 1)
  );
}
