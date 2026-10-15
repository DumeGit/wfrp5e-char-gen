import { traitSummary } from "./trait-summaries.mjs";

const quote = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Read only the profile's actual Traits heading. Suggested optional Traits never
// become sheet content. Briefs can stay on compact sheets when shorter and current. Reviewed
// summaries replace full-definition fallbacks; full definitions stay available.
export function describeTraits(profile, traits) {
  const names = [...new Set(profile.traits.map((t) => t.name))].sort(
    (a, b) => b.length - a.length,
  );
  const text = (profile.sections.Traits || "").replaceAll(
    "T erritorial",
    "Territorial",
  );
  const matches = names.length
    ? [
        ...text.matchAll(
          new RegExp(
            `(?:^|[ ,])(${names.map(quote).join("|")})(?: \\(([^)]*)\\)| (\\d+)(?:\\+)?)*:`,
            "g",
          ),
        ),
      ]
    : [];
  const starts = matches.filter(
    (m, i) => matches.findIndex((x) => x[1] === m[1]) === i,
  );
  const descriptions = new Map(
    starts.map((m, i) => [
      m[1],
      text
        .slice(m.index + m[0].length, starts[i + 1]?.index ?? text.length)
        .trim(),
    ]),
  );
  return traits.map((trait) => {
    const baseline = profile.traits.find((t) => t.key === trait.key);
    const brief =
      baseline && trait.value === baseline.value
        ? descriptions.get(trait.name)
        : "";
    // The approved complete Venom rule supersedes conflicting creature blurbs.
    // Likewise use the definition when a blurb still says old "Advantage".
    const oldWording =
      /\bAdvantage\b/.test(brief) && /\bMomentum\b/.test(trait.text);
    const summary = traitSummary(trait, {
      swarm: traits.some((t) => t.name === "Swarm"),
    });
    // Already-compact printed profile blurbs need not grow on a table card.
    // Changed ratings and known conflicts always use the reviewed mechanics.
    const useBrief =
      brief &&
      trait.name !== "Venom" &&
      !oldWording &&
      !(trait.name === "Size" && traits.some((t) => t.name === "Swarm")) &&
      brief.length < summary.length;
    const description = useBrief ? brief : summary;
    return {
      ...trait,
      summary,
      description,
      ...(oldWording
        ? {
            descriptionNote: `${trait.name}: the profile summary (p. ${profile.page}) uses Advantage; the sheet follows the full core Trait definition (p. ${trait.page}), which uses Momentum.`,
          }
        : {}),
    };
  });
}
