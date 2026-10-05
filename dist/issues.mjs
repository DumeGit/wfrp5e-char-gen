// Issues carry navigation and provenance at the rule that detects them.
// Message wording is presentation only and never determines behavior.
export function issue(code, message, step, target, source, severity = "error") {
  if (
    !code ||
    !source?.book ||
    source.page === undefined ||
    !Number.isInteger(step) ||
    !target
  )
    throw Error("An issue requires a code, source and control destination.");
  if (!["error", "warning", "info"].includes(severity))
    throw Error("Invalid issue severity.");
  return { code, message, severity, source, control: { step, target } };
}
export const issueMessages = (issues) => issues.map((x) => x.message);
export const finishIssues = (issues, structured) =>
  structured ? issues : issueMessages(issues);
export const uniqueIssues = (issues) => [
  ...new Map(
    issues.map((x) => [JSON.stringify([x.code, x.control, x.message]), x]),
  ).values(),
];
export const skillControl = (slots, name, action = "skill-minus") => {
  const slot = slots.find((x) => x.name === name);
  return slot
    ? `[data-action="${action}"][data-key="${slot.key}"]`
    : '[data-bind="speciesSkills"]';
};
