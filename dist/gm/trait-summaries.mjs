// Editorial mechanical summaries, reviewed against the definitions in gm/data.json.
// Never truncate to fit a card. Full definitions and source/Legacy notes remain
// separate; a new or unreviewed Trait falls back to its complete definition.
const core = {
  Afraid:
    "Make an Extended Psychology Test against the target’s Fear. Until accumulated SL equal or exceed its rating, gain no Momentum; its melee attacks against you have Advantage (p. 183).",
  Amphibious: "Has Swim; +1 SL to Swim Tests. Full Movement in water.",
  Animosity:
    "On encountering the listed target, make a Psychology Test. Failure: attack socially or physically as appropriate; +1 SL to Fellowship-based Tests to oppose or disparage them (p. 183).",
  Belligerent: "Immune to Fear while possessing Momentum.",
  Bestial:
    "No rational thought or language; defends only with Dodge. Shies from fire; being wounded by it inflicts Broken. After losing over half its Wounds, attempts to flee; instead enters Frenzy if cornered, protecting young or Territorial.",
  Bite: "Lose Momentum for a Free Attack at Rating Damage (SB already included); uses WS/BS without spending the turn’s Action.",
  Blessed:
    "Can enact the listed deity’s Blessings; Pray at Fellowship +10 (GM may increase).",
  Bounce:
    "When Charging, Leaping or Sprinting, double Movement and leap over intervening terrain and creatures.",
  Champion:
    "Winning an Opposed Test while defending in melee deals Damage as if attacking.",
  "Chill Grasp":
    "Lose Momentum and use an Action: Opposed WS against Dodge or Melee. Win: target loses 1d10 + SL Wounds, ignoring TB and AP. Magical.",
  "Cold-blooded":
    "Advantage on Cool Tests. Surprised is not removed the first time it normally would be.",
  Constrictor:
    "Every successful hit inflicts Entangled; may then initiate a Grapple (p. 167).",
  Construct:
    "No Int, WP or Fel; never Tests them, except use T for required WP Tests. Use SB instead of WPB for Wounds. All attacks Magical. Without a controlling spellcaster, or without Territorial, wanders mindlessly.",
  "Corrosive Blood":
    "Whenever wounded, all Engaged targets take 1d10 Damage (one roll for all).",
  Corruption: "A Corrupting Influence of the listed strength (p. 187).",
  "Dark Vision": "Sees in darkness as in daylight.",
  Daemonic:
    "Needs no food, water or air; all attacks Magical. After a non-Magical blow, roll 1d10: Rating+ ignores it, including Criticals. Cannot ignore Magical blows this way. At 0 Wounds, returns to Chaos and leaves play.",
  Disease:
    "Carries the listed disease; others Test for Contraction as appropriate (p. 179). Whether the carrier suffers its effects is the GM’s choice.",
  Distracting:
    "Living targets within TB yards suffer −2 SL to all Tests. Does not stack with other Distracting creatures.",
  Ethereal:
    "Passes through solid objects. Only Magical attacks can harm it; all its attacks are Magical.",
  Fear: "Opponents make an Extended Psychology Test. Until accumulated SL exceed the Fear rating (default 1), they gain no Momentum and melee attacks against them have Advantage (p. 183).",
  Fly: "As its Move, fly up to Rating yards, ignoring intervening terrain, obstacles and creatures; may Charge. End landed or airborne; if starting a turn airborne, must Fly or fall (GM decides distance). Against it, measure horizontal range then increase one range step (Extreme becomes unreachable). While flying, −20 to its Ranged Attacks.",
  Frenzy:
    "Test WP to enter Frenzy: Free Attack each Round, +1 Damage and immune to Psychology. Cannot flee/retreat; may only attack or move to attack the nearest visible enemy. Ends with no visible enemies, Stunned or Unconscious; then gain Fatigued.",
  "Ghostly Howl":
    "Once per turn, lose Momentum for a Magical Free Attack. Living hearers within Strength yards gain 3 Deafened and lose 1d10 Wounds ignoring TB/AP; Average (+2 SL) Cool or also Broken.",
  Grim: "At the end of its turn, gains Momentum if it has none.",
  Hatred:
    "Psychology Test on encountering the listed target; failure activates Hatred. Attack by the fastest, deadliest means; +1 SL to Melee/Ranged against them. Immune to their Intimidate and Fear, but not Terror (p. 184).",
  Horns: "When Charging into combat, may make a Free Attack at SB +4 Damage.",
  Hungry:
    "After killing/incapacitating a living opponent or finding a fresh body: Average (+2 SL) Cool or feast, losing the next Move and Action.",
  "Immune to Psychology": "Ignores Psychology rules (p. 183).",
  Immunity: "Ignores all harm of the listed type, including Critical Wounds.",
  Infected:
    "On causing a living opponent to lose Wounds: Easy (+4 SL) Endurance or contract a Festering Wound (p. 180).",
  Infestation: "Opponents suffer −1 SL to hit it in melee.",
  "Many Heads":
    "Head Criticals stun, kill or render unconscious only when all heads are disabled or similarly affected. With Bite, Horns or Tongue, make as many Free Attacks as healthy heads. With 2+ healthy heads, +2 SL to Perception.",
  Magical:
    "All attacks are Magical and can harm creatures vulnerable only to Magical attacks.",
  "Magic Resistance":
    "Casting Tests for spells affecting it suffer −3 SL. Incompatible with Channelling or Arcane Magic, Bless, Chaos Magic, Invoke, Petty Magic and Witch! Talents (in either direction).",
  "Mental Corruption": "Roll on the Mental Corruption table (p. 189).",
  Miracles:
    "Can enact the listed deity’s Miracles; Pray at Fellowship +10 (GM may increase).",
  Mutation: "Roll on the Physical Corruption table (p. 189).",
  "Night Vision":
    "See clearly in natural darkness for 20 yards; extend the illumination distance of light sources by 20 yards.",
  Painless:
    "Ignores non-amputation Critical Wound penalties; Conditions still apply.",
  "Petrifying Gaze":
    "Lose Momentum and an Action against one visible living target: Opposed BS/Initiative (spellcasters may defend with Language (Magick)). Win: 1 Stunned, +1 per SL after the first. Win by 6+ SL: permanently turn target to stone.",
  Regeneration:
    "At each Round’s start: above 0 Wounds, heal 1d10; at 0, heal 1 Wound on 1d10 of 8+. A regeneration roll of 10 also fully heals one Critical Wound and its penalties/Conditions. Cannot regenerate fire-caused Wounds or Criticals.",
  Skittish:
    "Spectacular visible magic, thunderclaps or explosions inflict 3 Broken Conditions.",
  Spellcaster:
    "Casts the listed Lore(s). Add Spellcaster/Spellcaster Lord template, or grant Channelling (chosen Wind) at WP +10 and Language (Magick) at Int +10 as Basic Skills (GM may increase).",
  Sprinter: "Run Movement ×1.5 when Running.",
  Stealthy: "Stealth (Rural) at Agility +10 (GM may increase).",
  "Striding Gait":
    "No movement penalties in the listed terrain; +1 SL to Athletics and Stealth there.",
  Stupid:
    "If no nearby ally lacks Stupid, make Easy (+4 SL) Intelligence at each Round’s start. Failure: lose that turn’s Move and Action. Nearby non-Stupid allies prevent this.",
  Swarm:
    "Acts as one creature; ignores Psychology, Engaged restrictions on moving and all Size rules. Each Engaged opponent loses 1 Wound at Round end. Has ×5 normal Wounds and +10 WS; shooting at it gains +40 to hit.",
  Tail: "Lose Momentum for a Free Attack at SB +2 Damage; smaller targets losing any Wounds also become Prone.",
  Tentacles:
    "One Free Attack per tentacle at SB +0 Damage. Causing Damage may inflict Entangled and initiate a Grapple with that tentacle. Resolve its Grapple with the tentacle’s Free Attack, not the creature’s Action (p. 167).",
  Territorial:
    "Fights to the death defending its area; normally does not pursue enemies beyond it.",
  Terror:
    "On first encounter, opponents make a Psychology Test. Failure: Broken equal to Rating +1 per negative SL. Also causes Fear of the same rating regardless of result (p. 183).",
  Tongue:
    "Lose Momentum for a ranged Free Attack at SB +0 Damage. GM sets range (default 3 yards at Small–Large; 12 for larger). Hit: 1 Entangled; smaller targets dragged into melee. Then release, make a Weapon-Trait Free Attack, or keep wrapped and initiate a Grapple (p. 167).",
  Tracker: "Track at Intelligence +10 (GM may increase).",
  Undead:
    "Needs no air, food, water or other necessities of life. Counts as Undead for spells, Miracles and abilities.",
  Unstable:
    "At Round end, if Engaged with any opponent who has Momentum while it has none, driven back and loses 2 Wounds. At 0 Wounds, destroyed or banished.",
  Vampiric:
    "A successful Bite against suitable prey heals Wounds equal to those the target loses. Drinking blood is its only healing method.",
  Venom:
    "Causing Wounds inflicts Poisoned. The listed Difficulty applies to Tests to recover from Poisoned, not to avoid it (p. 186).",
  Vomit:
    "If starting the turn Engaged, spend Move and Action: one BS roll opposed by each target’s Dodge within 2 yards. Attacker Easy (+4 SL), defenders Challenging (+0 SL). Losing targets take TB +4 Damage and Stunned; all their carried weapons/armour take 1 Damage. Once per 12 hours.",
  Ward: "After any blow, roll 1d10: Rating+ ignores the blow, including Criticals.",
  Wallcrawler:
    "Full Movement on suitable vertical surfaces and ceilings; automatically passes Climb Tests.",
  Web: "Each successful hit inflicts 1 Entangled, with Strength equal to Rating (p. 186).",
};

const supplements = {
  "tribes-tribulations": {
    "Bileful Vomit":
      "Vomit uses Stream of Corruption (CN 9; special Range/Target; instant): Unopposed Acid- and Poison-type Breath attack, a magic missile at TB Damage ignoring AP. Targets losing more than their TB in Wounds: Challenging (+0 SL) Endurance or Blood Rot (core pp. 179, 357).",
    "Purple Skullback Bite":
      "If wounded and Poisoned by the bite: Average (+2 SL) Cool or gain 1 Corruption. Forest Goblin Shamans still take damage/poison; for 2d10 hours gain printed +2d10 to Channelling/Language (Magick) and may reroll Waaagh! Miscasts. Bonuses are temporary.",
  },
  "sea-of-claws": {
    "Lure of the Lurkerfish":
      "Hard (−2 SL) Lore (Riverways) identifies the lure. On failure, Easy (+4 SL) Cool or become beguiled: may only move towards the light, effectively Unconscious.",
    Slimy:
      "When Grappled, pass a Toughness Test for +4 SL to subsequent escape Tests. Opponent makes Challenging (+0 SL) Athletics; failure: release the Latch-eel or suffer Suffocation.",
    "Love the Light":
      "Attracted to light; fire encourages rather than deters it. Despite Bestial, does not shy from fire or gain Broken from flaming attacks.",
    Immersion:
      "Grapple; inflicting Entangled draws the victim inside, causing Suffocation. Escape Entangled as a Grapple with Opposed Strength against 59. The Elemental need not maintain the Grapple, may act freely and does not count as Engaged by the immersed victim.",
    "Boat Crusher":
      "Constrict vessels of Size Large or smaller: spend 1 turn wrapping per 10 vessel Size. Then Extended Opposed Strength/vessel Toughness; accumulated SL equal to vessel Wounds shatters it. Crew may attack or lever it off: a hit causing over 7 Wounds forces Average (+2 SL) Cool or release. Levering uses Opposed Strength: 0–4 SL stops squeezing that turn; 5+ forces release.",
    "Electrical Discharge":
      "After Grappling, spend 1 Momentum at the start of a subsequent turn: 10 Damage ignoring non-magical metal armour; if wounded, Difficult (−1 SL) Endurance or Stunned. Each use requires Average (+2 SL) Endurance or gain Fatigued; while Fatigued, shock Damage drops to 6. Against a Grappled boat, damages no hull but hits every crew member for 6 Damage (3 if Fatigued).",
    "Syreen’s Call":
      "Action: sing. Characters within Initiative yards: Difficult (−1 SL) Cool or beguiled, effectively Unconscious and able only to move towards the Syreen.",
    "Resistant to Cold":
      "May make an Endurance Test to ignore ill effects of cold/ice weapons, spells or other effects.",
    "Lure of the Leviathan":
      "Hard (−2 SL) Lore (Oceans) identifies the lure and allows looking away. Failure: Easy (+4 SL) Cool or Stunned.",
    "On a Different Scale":
      "Bestial, but only fire at least as large/intense as a large bonfire frightens it. GM judges Fear/Terror sources by whether their size merits its respect; smaller ordinary threats do not concern it.",
    "Marine Creature":
      "Full Movement in water; printed profile assumes aquatic conditions. On land: Movement 1 and −2 SL to all Tests. Must be regularly doused or begin Suffocating.",
  },
  lustria: {
    Telepathy:
      "Transmit/read thoughts without speech. To resist thought-reading: Average (+2 SL) Cool.",
    Chameleon:
      "Perception to spot it: −4 SL (−2 while moving). Ranged Tests to shoot it: −2 SL.",
    Flammable:
      "Tests to avoid Ablaze suffer the printed −20 penalty. Ablaze causes twice the normal Wounds.",
    "Stationary Attacker":
      "Immune to Psychology; cannot pursue, manoeuvre, Charge, Flee, Leap, Run or Climb. May only take attack/Trait actions. Unsuspecting prey entering reach becomes Engaged; its sprung attack inflicts Surprised. Detect with Challenging (+0 SL) Perception, then suitable Lore; either failure leaves the threat unrecognised. Reach: Tiny/Little Very Short; Small Short; Average Medium; Large Long; Enormous Very Long; Monstrous Massive.",
    "Auger and Scryer":
      "May use the supplied Psychometry/Augury rules; Psychometry counts as Basic. Ignores the prohibition against being both magician and Scryer.",
    Contemplation:
      "When unattended and surroundings change, Difficult (−1 SL) Perception. +2 SL or more: alert; 0 to +1: Stupid for the encounter, then alert or meditating as circumstances dictate; −0 to −3: 2 Fatigued, only Move or Action each turn; −4 or less: unresponsive. If unresponsive, stimuli allow a new Challenging (+0 SL) Perception Test; weapons/magic attacks make it Easy (+4 SL). Telepathic warning from a Slann or Skink magic-user makes it alert.",
    "Knack for Total Power":
      "Successful Casting Tests are Criticals on doubles or a units die of 0. In Lustria, may reroll Tests to perceive the Winds of Magic.",
    "Master of Magical Mishaps":
      "Major Miscasts become Minor, except when casting through another spellcaster via Telepathy.",
    "Emergency Teleportation":
      "At 10 Wounds or fewer, or a Critical causing broken bones/torn muscles or worse, may immediately cast Teleport as a free action. Success sends the Slann to the nearest temple-city’s star chamber (a neighbouring one if unsafe). Only Slann are known to survive these Geomantic Web amulets.",
    "Relic Priest":
      "Spirit stays within WPB yards of its body; both have equal Wounds. Destroying the body destroys the spirit; damage to either may trigger Emergency Teleportation. Spirit may possess the body to direct a palanquin; otherwise body cannot move/act and is always Prone. Spirit may cast with Move and Action (up to 2 spells/turn); melee ability is defence only and deals no damage.",
    "Slann Telepathy":
      "Network: Slann and Skink Priests within Willpower yards; if within Willpower yards of a Geomantic Web flow, also Slann within that distance of another flow. Spend Action or Move and pass Challenging (+0 SL) Intelligence: exchange up to 5 minutes’ conversation in one turn, or cast through a networked Skink Priest using the Slann’s Characteristics/Skills/Talents. Miscasts affect the Skink.",
    Palanquin:
      "Grants Fly (16) and Ward (8+); hard cover against missiles from rear/sides, soft cover from the front.",
    "Blood Hungry Spore Cloud":
      "Movement by Human-sized or larger warm-blooded creatures within 1 yard triggers a spore cloud: 5-yard radius, 3 yards high, lasting 2d10 Rounds. Warm-blooded creatures caught inside: Difficult (−1 SL) Endurance or 1 Bleeding.",
    "Impale Attack":
      "Always strikes legs without the usual −20 called-shot penalty. Ignores leather armour; has Impale.",
    "Entangled Attack":
      "Only attacks warm-blooded prey. Cannot use Weapon until the target is Entangled; then strikes once per turn until it escapes or dies.",
    "Magical Snack":
      "Eating an Itxi Grub grants a spellcaster +1 SL to Casting and Channelling for 3d10 Rounds. Does not stack.",
    "Posterior Flame":
      "Rough handling or sudden disturbance by warm-blooded creatures triggers flames for 1d10 Rounds. Any character or flammable item touching it gains Ablaze.",
    "Use as Ammunition":
      "Handle with Animal Care: Very Easy (+6 SL) for cold-blooded, Hard (−2 SL) for warm-blooded. Damp leather pouch holds up to 6 Fireleeches docile for 24 hours if not badly jostled. A second Animal Care Test readies one to throw or sling; failure inflicts Ablaze on the handler.",
    "Brain Rot":
      "A head Critical against warm-blooded prey burrows into its skull and inflicts Brain Rot in addition to Damage (p. 186).",
    "Excruciating Sting":
      "While Poisoned by the sting, test Difficult (−1 SL) Cool at each turn’s start; failure adds Stunned.",
    "Odour Attack":
      "When harassed, odour spreads 1d10 yards. Cold-blooded targets: Challenging (+0 SL) Endurance or Nausea for 1d10 hours. Warm-blooded creatures suffer no symptom.",
    "Scalemane Reptilion Venomous Bite":
      "Venom inflicts 2 Poisoned instead of 1.",
    "Blue-Ringed Asp Venomous Bite":
      "Venom also inflicts Bleeding, lasting until Poisoned is resolved.",
    "Boring Attack": "Attacks have Damaging and Impale.",
    "Shooting Spine Attack":
      "May fire spines singly or en masse; they regenerate in 1 day.",
    "Ramming Attack":
      "Healthy Pliodons have Collision Rating 14 when ramming vessels.",
    "Blood Frenzy":
      "On causing a combat Wound, immediately becomes Frenzied until all foes within its senses are slain.",
    "Toxic Bile":
      "Projects bile up to 15 yards; any character hit gains Ablaze.",
    "Fearsome Roar":
      "Enormous/Monstrous predators: Difficult (−1 SL) Cool or suffer Fear and leave immediately. Prey and smaller creatures: Hard (−2 SL) Cool or flee in Fear.",
  },
  salzenmund: {
    Dooming:
      "Innate Blessed (Morr)-like access to the Dooming Miracle. Uses Willpower, not Invoke; owes no allegiance to a Human god.",
  },
};

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
      ? `Primary melee Damage adds ${value === "Monstrous" ? "2 × SB" : "SB"} (already included; not ranged/extra attacks).`
      : value === "Tiny"
        ? "Tiny’s melee Damage modifier is not supplied."
        : "No extra melee Damage from Size.",
    "Against larger foes: −2 SL to Melee defence. Aggressive creatures cause Fear in smaller foes; may leave melee with smaller foes without Disengaging.",
    "Opposed Strength (and similar Tests): 2+ steps larger wins automatically; 1 step larger wins unless the smaller rolls a Critical (then compare SL).",
    count
      ? `Counts as ${count} when determining whether outnumbered, but only 1 when gaining outnumbering bonuses.`
      : "Tiny’s outnumbering count is not supplied.",
    "Against smaller foes, lose Momentum for a Free Stomp (Melee (Brawling), SB Damage). Resizing: each step up gives +10 S/T, −5 Ag; reverse when shrinking (pp. 360–361).",
  ].join(" ");
}

export function traitSummary(trait, { swarm = false } = {}) {
  const book = trait.source?.book || "core";
  if (book !== "core") return supplements[book]?.[trait.name] || trait.text;
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
  const text = core[trait.name] || trait.text;
  return trait.name === "Fly" && trait.value
    ? text.replace("Rating", trait.value)
    : text;
}
