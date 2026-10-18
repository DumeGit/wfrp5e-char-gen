import { issue, finishIssues } from "./issues.mjs";
export const freshChart = () => ({
  enabled: false,
  sign: "",
  rolledSign: "",
  witchling: 0,
  talent: "",
  ascendant: "",
  mansions: [],
});
export const chartState = (s) => ({ ...freshChart(), ...s.chart });
export function validateChartState(R, s) {
  if (s.chart === undefined) return;
  const chart = s.chart,
    validId = (id) =>
      typeof id === "string" && (!id || R.astrology.some((x) => x.id === id));
  if (
    !chart ||
    typeof chart !== "object" ||
    Array.isArray(chart) ||
    Object.keys(chart).some(
      (key) => !Object.keys(freshChart()).includes(key),
    ) ||
    typeof chart.enabled !== "boolean" ||
    !["sign", "rolledSign", "ascendant"].every((key) => validId(chart[key])) ||
    !Number.isInteger(chart.witchling) ||
    chart.witchling < 0 ||
    chart.witchling > 10 ||
    typeof chart.talent !== "string" ||
    !Array.isArray(chart.mansions) ||
    chart.mansions.length > 5 ||
    !chart.mansions.every(validId) ||
    (chart.enabled && !R.astrology.length)
  )
    throw Error(
      "Saved character contains an invalid star chart or unavailable astrology book.",
    );
}
export const starSign = (R, s) =>
  chartState(s).enabled
    ? (R.astrology || []).find((x) => x.id === chartState(s).sign)
    : null;
export function starEffect(R, s) {
  const sign = starSign(R, s);
  if (!sign) return { adjustments: {}, talent: "" };
  if (!sign.witchling)
    return {
      adjustments: sign.adjustments || {},
      talent:
        sign.talent === "Craftsman (Any)"
          ? chartState(s).talent
          : sign.talent || "",
    };
  return (
    sign.witchling.find(
      (x) =>
        chartState(s).witchling >= x.min && chartState(s).witchling <= x.max,
    ) || { adjustments: {}, talent: "" }
  );
}
export function chartTalentChoices(R, s, options) {
  return starSign(R, s)?.talent === "Craftsman (Any)"
    ? options(R, "Craftsman (Any)", "talent")
    : [];
}
export function chartGrants(R, s, already) {
  const talent = starEffect(R, s).talent;
  if (!talent) return [];
  const group = talent.replace(/ \(.*/, "");
  const limit =
    R.config.talentLimits[group] === null
      ? Infinity
      : (R.config.talentLimits[group] ?? 1);
  return already.filter((x) => x === talent).length < limit ? [talent] : [];
}
export function chartXP(R, s) {
  const chart = chartState(s);
  return starSign(R, s) && chart.sign === chart.rolledSign ? 25 : 0;
}
export function chartIssues(R, s, options, invalidTalent, structured = false) {
  const chart = chartState(s);
  if (!chart.enabled) return finishIssues([], structured);
  const issues = [],
    sign = starSign(R, s);
  if (!sign || !(R.astrology || []).some((x) => x.id === chart.rolledSign))
    return finishIssues(
      [
        issue(
          "chart.sign",
          "Roll a star sign and choose whether to retain it (Archives II p. 39).",
          0,
          '[data-bind="chartEnabled"]',
          { book: "archives-ii", page: 39 },
        ),
      ],
      structured,
    );
  if (
    sign.witchling &&
    (!Number.isInteger(chart.witchling) ||
      chart.witchling < 1 ||
      chart.witchling > 10)
  )
    issues.push(
      issue(
        "chart.witchling",
        "Roll the Witchling Star d10 effect (Archives II p. 39).",
        0,
        '[data-action="witchling-roll"]',
        { book: "archives-ii", page: 39 },
      ),
    );
  const choices = chartTalentChoices(R, s, options);
  if (choices.length && !choices.includes(chart.talent))
    issues.push(
      issue(
        "chart.talent",
        "Choose the star sign’s Craftsman specialisation (Archives II p. 39).",
        0,
        '[data-bind="starTalent"]',
        { book: "archives-ii", page: 39 },
      ),
    );
  const talent = starEffect(R, s).talent;
  if (talent) {
    const problem = invalidTalent(
      R,
      { ...s, chart: { ...chart, enabled: false }, ledger: [] },
      talent,
    );
    if (problem && !problem.startsWith("Already known"))
      issues.push(
        issue(
          "chart.talent-prerequisite",
          `Star sign Talent ${talent}: ${problem}`,
          0,
          '[data-bind="starSign"]',
          { book: "archives-ii", page: 39 },
        ),
      );
  }
  if (
    (chart.ascendant &&
      !(R.astrology || []).some((x) => x.id === chart.ascendant)) ||
    !Array.isArray(chart.mansions) ||
    chart.mansions.length > 5 ||
    chart.mansions.some(
      (id) => id && !(R.astrology || []).some((x) => x.id === id),
    )
  )
    issues.push(
      issue(
        "chart.background",
        "Choose valid optional astrology background signs (Archives II p. 50).",
        0,
        '[data-bind="starSign"]',
        { book: "archives-ii", page: 50 },
      ),
    );
  return finishIssues(issues, structured);
}
export function rollStar(R, s, roll) {
  const chart = chartState(s);
  if (chart.rolledSign)
    throw Error(
      "The initial star-sign roll is already recorded; choose another sign without the bonus, or start a new character.",
    );
  const n = roll("Star sign", 1, 100, 39),
    sign = R.astrology.find((x) => n >= x.min && n <= x.max);
  if (!sign) throw Error("No printed star-sign result.");
  s.chart = { ...chart, enabled: true, sign: sign.id, rolledSign: sign.id };
  return sign;
}
export function rollWitchling(R, s, roll) {
  const chart = chartState(s);
  if (!starSign(R, s)?.witchling || chart.witchling)
    throw Error("The Witchling effect cannot be rolled here.");
  s.chart = { ...chart, witchling: roll("Witchling Star effect", 1, 10, 39) };
}
export function chartRecord(R, s) {
  const sign = starSign(R, s);
  if (!sign) return [];
  const chart = chartState(s),
    effect = starEffect(R, s),
    lookup = (id) =>
      R.astrology.find((x) => x.id === id)?.name || "Not selected";
  return [
    `Star sign: ${sign.name} (Archives II p. 39); ${chart.sign === chart.rolledSign ? "initial roll retained, +25 XP" : "changed from " + lookup(chart.rolledSign) + ", no XP reward"}.`,
    `Starting Characteristic adjustments: ${
      Object.entries(effect.adjustments || {})
        .map(([key, value]) => `${key} ${value >= 0 ? "+" : ""}${value}`)
        .join(", ") || "none"
    }. These are not purchased Advances.`,
    ...(effect.talent
      ? [
          `Star-sign Talent: ${effect.talent}. Core learning limits apply; an already-owned nonrepeatable Talent is counted once.`,
        ]
      : []),
    ...(sign.witchling
      ? [
          `Witchling d10: ${chart.witchling}; detailed p. 39 result applies instead of the general −3 Strength on p. 47, as agreed.`,
        ]
      : []),
    ...(chart.ascendant
      ? [
          `Ascendant: ${lookup(chart.ascendant)} (Archives II p. 50); background only.`,
        ]
      : []),
    ...chart.mansions.map(
      (id, i) =>
        `${["Sense", "Trials", "Thought", "Love", "Coin"][i]} mansion: ${lookup(id)} (Archives II p. 50); background only.`,
    ),
  ];
}
