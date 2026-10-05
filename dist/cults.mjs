import { issue, finishIssues } from "./issues.mjs";
// A supplied cult can reuse core Miracles without duplicating or rewriting them.
export function miracleChoices(R, god) {
  const cult = (R.cults || []).find((x) => x.name === god);
  return cult
    ? cult.miracles
        .map((name) => R.spells.find((x) => x.name === name))
        .filter(Boolean)
    : R.spells.filter((x) => x.category === god && !x.ritual);
}
export function cultReferences(R, talents) {
  return (R.cults || [])
    .filter((c) =>
      talents.some(
        (t) => t === `Bless (${c.name})` || t === `Invoke (${c.name})`,
      ),
    )
    .map((c) => ({ source: c.source, adaptation: c.adaptation, text: c.text }));
}
export function cultIssues(R, s, structured = false) {
  const out = s.ledger
    .filter((x) => x.type === "spell")
    .flatMap((x) => {
      const god = x.talent?.match(/^Invoke \((.*)\)$/)?.[1],
        cult = (R.cults || []).find((c) => c.name === god);
      return cult && !cult.miracles.includes(x.name)
        ? [
            issue(
              "cult.miracle",
              `${x.name} is not a listed Miracle of ${god} (${cult.source.book} p. ${cult.page}).`,
              6,
              ".ledger-section",
              cult.source,
            ),
          ]
        : [];
    });
  return finishIssues(out, structured);
}
