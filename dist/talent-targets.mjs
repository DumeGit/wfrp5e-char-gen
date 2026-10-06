// A Cause is chosen by the player/GM, not inferred from a Career or cult.
export const CAUSE_KEY = "impassioned-zeal-cause";
export const CAUSE_PLACEHOLDER = "Impassioned Zeal (Any Cause)";
export function causeTalent(raw) {
  return (
    raw === "Impassioned Zeal" ||
    /^Impassioned Zeal \((Any(?: Cause)?|Cause)\)$/.test(raw)
  );
}
export function namedCause(value) {
  const cause = String(value || "").trim();
  if (!cause || /[()]/.test(cause) || /^(Any(?: Cause)?|Cause)$/i.test(cause))
    return "";
  return `Impassioned Zeal (${cause})`;
}
export function causeIssue(name) {
  if (
    name.startsWith("Impassioned Zeal") &&
    !namedCause(name.match(/^Impassioned Zeal \((.+)\)$/)?.[1])
  )
    return "Specify the political, religious or philosophical Cause for Impassioned Zeal (core p. 121).";
  return "";
}
export function targetAllowed(choices, name) {
  return (
    choices.includes(name) ||
    (choices.some(causeTalent) &&
      name.startsWith("Impassioned Zeal (") &&
      !causeIssue(name))
  );
}
