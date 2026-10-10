const quote = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Read only the profile's actual Traits heading. Suggested optional Traits never
// become sheet content. Full definitions stay available for play/reference.
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
      baseline && (trait.value === baseline.value || trait.name === "Size")
        ? descriptions.get(trait.name)
        : "";
    // The approved complete Venom rule supersedes conflicting creature blurbs.
    // Likewise use the definition when a blurb still says old "Advantage".
    const oldWording =
      /\bAdvantage\b/.test(brief) && /\bMomentum\b/.test(trait.text);
    const useBrief = brief && trait.name !== "Venom" && !oldWording;
    let description = useBrief ? brief : trait.text;
    // A marked creature prints its own god's effects, not every unused Mark.
    if (!useBrief && trait.name === "Mark of Chaos" && trait.value) {
      const headings = [
        ...trait.text.matchAll(/(?:^|\s)(Khorne|Nurgle|Slaanesh|Tzeentch):/g),
      ];
      const index = headings.findIndex((m) => m[1] === trait.value);
      if (index >= 0)
        description = trait.text
          .slice(
            headings[index].index + headings[index][0].length,
            headings[index + 1]?.index ?? trait.text.length,
          )
          .trim();
    }
    // A supplement stat block lists training names without short descriptions.
    // Retain the complete definition of each actual training, not unused options.
    if (
      profile.source?.book &&
      profile.source.book !== "core" &&
      trait.name === "Trained"
    ) {
      const headings = [
        ...trait.text.matchAll(
          /(?:^|\s)(Broken|Drive|Entertain|Fetch|Guard|Home|Magic|Mount|War|Shock Cavalry):/g,
        ),
      ];
      const chosen = trait.value.split(",").map((n) => n.trim());
      description = headings
        .filter((m) => chosen.includes(m[1]))
        .map((m) => {
          const i = headings.indexOf(m);
          return trait.text
            .slice(m.index, headings[i + 1]?.index ?? trait.text.length)
            .trim();
        })
        .join(" ");
    }
    return {
      ...trait,
      description,
      ...(oldWording
        ? {
            descriptionNote: `${trait.name}: the profile summary (p. ${profile.page}) uses Advantage; the sheet follows the full core Trait definition (p. ${trait.page}), which uses Momentum.`,
          }
        : {}),
    };
  });
}
