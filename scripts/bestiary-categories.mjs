import { bookId } from "../src/engine/gm/books.mjs";

const CIVILIANS = "Peoples & Civilians";
const SOLDIERS = "Soldiers & Watch";
const CRIMINALS = "Criminals & Outlaws";
const CREW = "Crew & Travellers";
const WORKING = "Mounts & Working Animals";
const AQUATIC = "Aquatic Beasts";
const GREAT_BEASTS = "Great Beasts";
const MONSTERS = "Monsters & Giants";
const CULTS = "Chaos Cults & Warriors";
const MUTANTS = "Mutants & Chaos Beasts";
const CONSTRUCTS = "Constructs & Elementals";
const NATURE = "Plants & Nature Spirits";
const ZOO = "The Imperial Zoo";

// These source headings describe a consistent family. Mixed headings are
// resolved by source ID below so a new profile cannot silently inherit one.
const sourceGroups = {
  [CIVILIANS]: [
    "Elves",
    "Humanoids",
    "Imperial civilians",
    "Imperial spies",
    "Merchants",
    "NPC",
    "Nobles",
    "Ogres",
    "Peoples of the Reikland",
    "Tavern staff",
    "Townsfolk",
    "human",
  ],
  [SOLDIERS]: [
    "Bounty hunters",
    "Guards",
    "Humanoid NPC",
    "Imperial soldiers",
    "Knights",
    "Soldiers",
  ],
  [CRIMINALS]: ["Criminals"],
  [CREW]: ["Passengers", "Riverfolk", "dwarf"],
  Wildlife: [
    "Animals",
    "Beasts",
    "Beasts of the Reikland",
    "Lustrian beasts",
    "animal",
  ],
  [WORKING]: ["Mounts", "mount"],
  [AQUATIC]: ["River creatures", "Sea creatures"],
  [GREAT_BEASTS]: ["Monstrous Beasts"],
  [MONSTERS]: ["Monsters", "Trolls"],
  Greenskins: ["Greenskins", "Orcs and Goblins"],
  Skaven: [
    "Skaven",
    "Skaven creatures",
    "skaven elite infantry",
    "skaven guard",
    "skaven handler",
    "skaven infantry",
    "skaven infiltrator",
    "skaven ranged infantry",
  ],
  Beastmen: ["Beastmen"],
  Lizardmen: ["Lizardmen"],
  [CULTS]: ["Chaos cultists"],
  [MUTANTS]: [
    "Chaos beasts",
    "Cultists and Mutants",
    "Mutant beasts",
    "Mutants",
  ],
  Daemons: ["Daemons", "daemon"],
  Undead: ["Restless Dead", "Undead", "undead"],
  [CONSTRUCTS]: ["Constructs"],
  [NATURE]: ["Forest spirits", "Plants"],
};

const profileGroups = {
  [CIVILIANS]: ["empire-in-ruins:minor-noble"],
  [SOLDIERS]: [
    "core:human-watchman",
    "deft-steps:watchman",
    "deft-steps:watch-sergeant",
    "enemy-in-shadows:warriors",
    "death-on-the-reik:river-patrol-captain",
    "death-on-the-reik:river-patrol-crew",
    "death-on-the-reik:watch-sergeant",
    "death-on-the-reik:watch-recruit",
    "death-on-the-reik:wittgenstein-guard-sergeant",
    "death-on-the-reik:wittgenstein-guard",
    "empire-in-ruins-companion:imperial-ostlander-soldier",
    "empire-in-ruins-companion:vanguard-soldier",
    "empire-in-ruins-companion:kenselheim-guard",
    "empire-in-ruins-companion:kenselheim-guard-sergeant",
    "ubersreik-adventures-iii:jungfreud-manor-guard",
    "ubersreik-adventures-i:jungfreud-loyalists-watchmen-silver-1",
    "ubersreik-adventures-i:ubersreik-watchman-silver-1",
    "the-horned-rat:red-shield-mercenary",
    "the-horned-rat:scourge-rider",
  ],
  [CRIMINALS]: [
    "core:human-thug",
    "core:halfling-thief",
    "deft-steps:outlaw",
    "deft-steps:outlaw-chief",
    "enemy-in-shadows:rogues",
    "death-on-the-reik:kidnapper",
    "death-on-the-reik:wittgendorf-outlaw",
    "ubersreik-adventures-iii:bandit",
    "ubersreik-adventures-i:thug",
    "the-horned-rat:thug",
  ],
  [CREW]: ["corsairs-flariel:dark-elf-ship-s-crew"],
  Wildlife: [
    "enemy-in-shadows-companion:great-cats",
    "the-horned-rat-companion:great-eagle",
    "the-horned-rat-companion:mountain-cat",
    "the-horned-rat-companion:cliff-spider",
    "tribes-tribulations:purple-skullback-spider",
  ],
  [WORKING]: [
    "core:horse",
    "deft-steps:hochland-lockhund",
    "deft-steps:nordlander-bamse",
    "deft-steps:grootscher-marsh-hound",
    "deft-steps:dove-hawk",
    "deft-steps:arabyan-redhawk",
    "enemy-in-shadows:cow-stimmigen-dairy-cattle",
    "enemy-in-shadows:goat-booted-rottgeist",
    "enemy-in-shadows:sheep-hugeltal-longwool",
    "ubersreik-adventures-i:giant-wolf",
  ],
  [AQUATIC]: [
    "death-on-the-reik-companion:reik-eels",
    "death-on-the-reik-companion:giant-leeches",
    "death-on-the-reik-companion:stirpikes",
    "death-on-the-reik:monstrous-leech",
    "skeleton-crew:grey-barbed-shark",
  ],
  [GREAT_BEASTS]: [
    "up-in-arms:demigryph-mount",
    "archives-ii:rhinox",
    "tribes-tribulations:mournfang",
    "tribes-tribulations:hopping-squig",
    "tribes-tribulations:giant-squig",
    "empire-in-ruins-companion:colossal-squig",
    "the-horned-rat:young-wyvern",
    "sea-of-claws:gargantuan",
    "sea-of-claws:kharibdyss",
    "sea-of-claws:merwyrm",
    "sea-of-claws:leech-wyrm",
    "sea-of-claws:orb-leviathan",
    "sea-of-claws:black-leviathan",
    "lustria:swiftfeather-roc",
    "lustria:pallid-blindwyrm",
    "lustria:cold-one",
    "lustria:horned-one",
    "lustria:razordon",
    "lustria:salamander",
    "lustria:ripperdactyl",
    "lustria:terradon",
    "lustria:stegadon",
    "lustria:arcanadon",
    "lustria:bastiladon",
    "lustria:pliodon",
    "lustria:carnosaur",
    "lustria:troglodon",
    "lustria:dread-saurian",
  ],
  [MONSTERS]: [
    "core:giant",
    "core:troll",
    "enemy-in-shadows:amoeba",
    "death-on-the-reik-companion:amoebae",
    "death-on-the-reik-companion:river-trolls",
  ],
  Greenskins: [
    "ubersreik-adventures-iii:forest-goblin",
    "ubersreik-adventures-iii:snotling",
    "ubersreik-adventures-i:twisted-maw-goblin",
  ],
  Skaven: [
    "the-horned-rat:skavenslave",
    "the-horned-rat:clanrat",
    "the-horned-rat:stormvermin",
    "the-horned-rat:stormvermin-fangleader",
    "the-horned-rat:chieftain",
    "the-horned-rat:warlock-engineer",
    "the-horned-rat:clan-skryre-weapon-crew",
    "the-horned-rat:clan-mange-slave-master",
    "the-horned-rat:starved-clanrat",
    "the-horned-rat-companion:great-pox-rat",
    "the-horned-rat-companion:plague-rat",
    "the-horned-rat-companion:brood-horror",
    "the-horned-rat-companion:rat-ogre-bonebreaker",
    "the-horned-rat-companion:wolf-rat",
  ],
  Beastmen: [
    "power-behind-the-throne:minotaur-pit-fighter",
    "ubersreik-adventures-iii:pestigor",
    "ubersreik-adventures-i:ungor-raiders",
  ],
  [CULTS]: [
    "core:cultist",
    "core:chaos-warrior",
    "bayl-many-eyes:chaos-warrior-of-nurgle",
    "death-on-the-reik:purple-hand-cultist",
    "ubersreik-adventures-i:unmarred-flesh-cultists-pugilists",
    "the-horned-rat:purple-hand-cultist",
    "the-horned-rat:yellow-fang-cultist",
    "the-horned-rat:acolyte",
    "the-horned-rat-companion:blightking",
  ],
  [MUTANTS]: [
    "bayl-many-eyes:chaos-steed",
    "death-on-the-reik:corrosive-giant-rat",
    "death-on-the-reik:warpstone-giant-bat",
    "death-on-the-reik:mutant-bee-swarm",
    "death-on-the-reik:mutant-cat-swarm",
    "the-horned-rat:mutated-griffon",
    "the-horned-rat:daemonic-wolf",
    "hell-rides-to-hallt:chaos-spawn",
  ],
  Daemons: [
    "winds-of-magic:library-disc-of-tzeentch",
    "enemy-in-shadows-companion:chaos-fury",
    "enemy-in-shadows-companion:pink-horror",
    "enemy-in-shadows-companion:blue-horror",
  ],
  Undead: [
    "empire-in-ruins-companion:mourngul",
    "sea-of-claws:bone-hydra",
    "death-on-the-reik-companion:carrion",
    "the-horned-rat-companion:carrion",
  ],
  [CONSTRUCTS]: [
    "core:fenbeast",
    "winds-of-magic:fenbeast",
    "sea-of-claws:sea-elemental",
    "winds-of-magic:incarnate-elemental-of-fire",
    "winds-of-magic:incarnate-elemental-of-death",
    "winds-of-magic:incarnate-elemental-of-beasts",
    "the-horned-rat:animated-flame",
  ],
  [NATURE]: ["death-on-the-reik-companion:naiads", "sea-of-claws:syreen"],
};

const headingTags = {
  "Bounty hunters": ["Bounty hunter"],
  "Chaos beasts": ["Chaos beast"],
  "Chaos cultists": ["Cultist"],
  Criminals: ["Criminal"],
  Guards: ["Guard", "Watch"],
  "Imperial soldiers": ["Imperial", "Soldier"],
  "Imperial spies": ["Spy"],
  Knights: ["Knight"],
  "Lustrian beasts": ["Lustria", "Lustrian beasts"],
  Merchants: ["Merchant"],
  Mounts: ["Mount"],
  Nobles: ["Noble"],
  Passengers: ["Passenger"],
  "River creatures": ["River", "Aquatic"],
  Riverfolk: ["Riverfolk", "Crew"],
  "Sea creatures": ["Sea creatures", "Aquatic", "Marine"],
  Soldiers: ["Soldier"],
  "Tavern staff": ["Tavern staff"],
  Townsfolk: ["Townsfolk"],
  mount: ["Mount"],
};

const profileTags = {
  "death-on-the-reik:river-patrol-captain": ["Riverfolk", "River Patrol"],
  "death-on-the-reik:river-patrol-crew": ["Riverfolk", "River Patrol"],
  "corsairs-flariel:dark-elf-ship-s-crew": ["Crew", "Sailor"],
  "death-on-the-reik:monstrous-leech": ["Aquatic"],
  "death-on-the-reik-companion:reik-eels": ["River", "Aquatic"],
  "death-on-the-reik-companion:giant-leeches": ["River", "Aquatic"],
  "death-on-the-reik-companion:naiads": ["River", "Aquatic"],
  "death-on-the-reik-companion:stirpikes": ["River", "Aquatic"],
  "skeleton-crew:grey-barbed-shark": ["Sea creatures", "Aquatic", "Marine"],
  "deft-steps:hochland-lockhund": ["Hunting animal", "Hound"],
  "deft-steps:nordlander-bamse": ["Hunting animal", "Hound"],
  "deft-steps:grootscher-marsh-hound": ["Hunting animal", "Hound"],
  "deft-steps:dove-hawk": ["Hunting animal", "Hawk"],
  "deft-steps:arabyan-redhawk": ["Hunting animal", "Hawk"],
  "ubersreik-adventures-i:unmarred-flesh-cultists-pugilists": [
    "Cultist",
    "Unmarred Flesh",
  ],
  "ubersreik-adventures-iii:bandit": ["Criminal", "Bandit"],
  "ubersreik-adventures-iii:jungfreud-manor-guard": ["Guard", "Jungfreud"],
  "deft-steps:watchman": ["Guard", "Watch"],
  "deft-steps:watch-sergeant": ["Guard", "Watch"],
  "deft-steps:outlaw": ["Criminal", "Outlaw"],
  "deft-steps:outlaw-chief": ["Criminal", "Outlaw"],
  "empire-in-ruins:loyal-cultist": ["Cultist", "Purple Hand"],
  "empire-in-ruins:knight-of-the-white-wolf": ["Knight", "White Wolf"],
  "empire-in-ruins:minor-noble": ["Noble"],
  "ubersreik-adventures-i:undead-orc": ["Orc", "Greenskins"],
};

const lookup = (groups) =>
  new Map(
    Object.entries(groups).flatMap(([category, keys]) =>
      keys.map((key) => [key, category]),
    ),
  );
const byHeading = lookup(sourceGroups);
const byProfile = lookup(profileGroups);

export function profileBrowseMetadata(profile) {
  const key = profile.id.replace(":creatures:", ":");
  const browseCategory =
    bookId(profile) === "imperial-zoo"
      ? ZOO
      : (byProfile.get(key) ?? byHeading.get(profile.category));
  if (!browseCategory)
    throw Error(
      `Review the Bestiary category for ${profile.id} (${profile.category}).`,
    );

  const tags = new Set([
    ...(headingTags[profile.category] || []),
    ...(profileTags[key] || []),
  ]);
  if (profile.species && profile.species !== profile.name)
    tags.add(profile.species);
  if (
    [...profile.traits, ...profile.optionalTraits].some(
      (trait) => trait.name === "Trained" && /\bMount\b/.test(trait.value),
    )
  )
    tags.add("Mount");

  return { browseCategory, ...(tags.size ? { tags: [...tags] } : {}) };
}
