// Control destinations belong to structured issues, never English messages.
export function issueTarget(R, s, value) {
  const record = value ?? R;
  if (!record?.control) throw Error("Expected a structured issue.");
  return record.control;
}
