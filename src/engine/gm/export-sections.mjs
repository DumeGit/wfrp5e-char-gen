// Derived export presentation only; ability wording comes from the shared result.
export const talentLabel = (talent) =>
  talent.name + (talent.ranks > 1 ? ` ×${talent.ranks}` : "");

export function soakLines(r) {
  const locations = Object.entries(r.ap).map(
    ([location, ap]) =>
      `${location} ${r.tb + ap}${r.shield ? `/${r.tb + ap + r.shield}` : ""}`,
  );
  return [locations.join(" · ")];
}
