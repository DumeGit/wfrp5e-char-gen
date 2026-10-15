const training = {
  Broken: "Ignores Bestial; +2d10 Fellowship.",
  Drive: "Pulls carts, coaches, ploughs and similar loads.",
  Entertain: "+10 to appropriate Entertain, Perform or Play Tests.",
  Fetch: "Fetches objects (normally dogs or similar).",
  Guard: "Guards a place; gains Territorial.",
  Home: "Returns home when released or lost.",
  Magic:
    "Ignores Skittish triggered by magic; required for most spellcasters’ mounts.",
  Mount: "Accepts a rider; appropriate Ride specialisation may be required.",
  War: "+10 WS; ignores Skittish triggered by loud noises.",
  "Shock Cavalry":
    "Requires War. Charging rider may move through smaller creatures: each makes Challenging (+0 SL) Dodge or takes 4 + mount’s SB Damage. Each damaged creature reduces remaining Movement by 2 yards; same-size/larger creatures stop the charge. End-of-charge melee-range enemies are Engaged; resolve Charge as if one were its target. A smaller creature that has not acted may forgo Dodge for one held-weapon attack on mount/rider; only killing/disabling the mount stops it.",
};

function sizeSummary(value, swarm) {
  if (swarm) return "Size rules are ignored while Swarm applies (p. 362).";
  const wounds = {
    Small: "2 × TB",
    Average: "SB + 2 × TB + WPB",
    Large: "(SB + 2 × TB + WPB) ×2",
    Enormous: "(SB + 2 × TB + WPB) ×4",
    Monstrous: "(SB + 2 × TB + WPB) ×8",
  };
  if (!value)
    return "Choose Size to show its combat and Wounds rules (pp. 360–361).";
  const count = { Small: 1, Average: 1, Large: 2, Enormous: 3, Monstrous: 4 }[
    value
  ];
  return [
    value === "Tiny"
      ? "Tiny has no printed Wounds formula; retain the baseline or set Wounds manually."
      : `Wounds: ${wounds[value]}.`,
    ["Large", "Enormous", "Monstrous"].includes(value)
      ? `Primary melee Damage adds ${value === "Monstrous" ? "2 × SB" : "SB"} (included; not ranged/extra attacks).`
      : value === "Tiny"
        ? "Tiny’s melee Damage modifier is not supplied."
        : "No extra melee Damage from Size.",
    "Melee defence vs larger: −2 SL. Aggressive: Fear to smaller; leave smaller foes without Disengaging.",
    "Opposed Strength/similar: 2+ steps larger wins automatically; 1 step unless smaller rolls a Critical (compare SL).",
    count
      ? `Counts as ${count} when outnumbered; only 1 for its own outnumbering bonuses.`
      : "Tiny’s outnumbering count is not supplied.",
    "Vs smaller: lose Momentum for Free Stomp (Melee (Brawling), SB Damage). Resize: +10 S/T, −5 Ag per step up; reverse down (pp. 360–361).",
  ].join(" ");
}

export function traitSummary(trait, { swarm = false } = {}) {
  const book = trait.source?.book || "core";
  if (book !== "core") return trait.text;
  if (trait.name === "Size") return sizeSummary(trait.value, swarm);
  if (trait.name === "Trained") {
    const chosen = (trait.value || "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    if (chosen.some((n) => !training[n])) return trait.text;
    return chosen.length
      ? chosen.map((n) => `${n}: ${training[n]}`).join(" ")
      : "Choose training to show its effects.";
  }
  if (trait.name === "Mark of Chaos") {
    // Keep the god-specific Talent-access lists intact; remove only flavour and
    // unrelated gods. No NPC Career development is inferred by this summary.
    const headings = [
      ...trait.text.matchAll(/(?:^|\s)(Khorne|Nurgle|Slaanesh|Tzeentch):/g),
    ];
    const i = headings.findIndex((m) => m[1] === trait.value);
    return i < 0
      ? "Choose a Chaos god to show its Mark’s effects."
      : trait.text
          .slice(
            headings[i].index + headings[i][0].length,
            headings[i + 1]?.index ?? trait.text.length,
          )
          .trim();
  }
  if (trait.name === "Breath") {
    const types = {
      Acid: "TB +4 Damage; all targets’ carried weapons/armour take 1 Damage.",
      Cold: "SB +2 Damage; Fatigued, with Slow on weapons until it ends.",
      Electricity: "SB +2 Damage ignoring metal armour; Stunned.",
      Fire: "SB +3 Damage; Ablaze.",
      Poison: "TB +2 Damage; Poisoned.",
      Smoke: "Blocks line of sight and causes Suffocation for TB Rounds.",
    };
    const selected = Object.keys(types).filter((t) =>
      new RegExp(`\\b${t}\\b`, "i").test(trait.value || ""),
    );
    return `Magical ranged Free Attack: one BS roll (30 if absent), opposed by every target’s Dodge. Target a visible creature within 20 + TB yards and all creatures within SB yards of it. Losing targets take Rating Damage${
      selected.length
        ? "; apply the selected type: " +
          selected
            .map((t) => `${t}: ${types[t]}`)
            .join(" ")
            .replace(/\.$/, "")
        : ". Choose a type if applicable"
    }. Immune to own Breath.`;
  }
  const text = trait.text;
  return trait.name === "Fly" && trait.value
    ? text.replace("Rating", trait.value)
    : text;
}
