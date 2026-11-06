import { bookId } from "../src/engine/gm/books.mjs";

const PEOPLE = "Peoples & Professions";
const CHAOS = "Chaos Followers & Mutants";
const CONSTRUCTS = "Constructs & Elementals";
const NATURE = "Plants & Nature Spirits";
const ZOO = "The Imperial Zoo";

// These source headings describe a consistent family. Mixed headings are
// resolved by source ID below so a new profile cannot silently inherit one.
const sourceGroups = {
  [PEOPLE]: [
    "Bounty hunters",
    "Criminals",
    "Elves",
    "Guards",
    "Humanoid NPC",
    "Humanoids",
    "Imperial civilians",
    "Imperial soldiers",
    "Imperial spies",
    "Knights",
    "Merchants",
    "NPC",
    "Nobles",
    "Ogres",
    "Passengers",
    "Peoples of the Reikland",
    "Riverfolk",
    "Soldiers",
    "Tavern staff",
    "Townsfolk",
    "dwarf",
    "human",
  ],
  Beasts: [
    "Animals",
    "Beasts",
    "Beasts of the Reikland",
    "Mounts",
    "River creatures",
    "Sea creatures",
    "Lustrian beasts",
    "animal",
    "mount",
  ],
  Monsters: ["Monsters", "Monstrous Beasts", "Trolls"],
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
  [CHAOS]: [
    "Chaos beasts",
    "Chaos cultists",
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
  [PEOPLE]: [
    "the-horned-rat:thug",
    "the-horned-rat:red-shield-mercenary",
    "the-horned-rat:scourge-rider",
  ],
  Beasts: [
    "deft-steps:hochland-lockhund",
    "deft-steps:nordlander-bamse",
    "deft-steps:grootscher-marsh-hound",
    "deft-steps:dove-hawk",
    "deft-steps:arabyan-redhawk",
    "death-on-the-reik-companion:reik-eels",
    "death-on-the-reik-companion:giant-leeches",
    "death-on-the-reik-companion:stirpikes",
    "enemy-in-shadows-companion:great-cats",
    "the-horned-rat-companion:great-eagle",
    "the-horned-rat-companion:mountain-cat",
    "the-horned-rat-companion:cliff-spider",
    "skeleton-crew:grey-barbed-shark",
    "tribes-tribulations:purple-skullback-spider",
  ],
  Monsters: [
    "up-in-arms:demigryph-mount",
    "archives-ii:rhinox",
    "tribes-tribulations:mournfang",
    "core:cave-squig",
    "tribes-tribulations:hopping-squig",
    "tribes-tribulations:giant-squig",
    "empire-in-ruins-companion:colossal-squig",
    "enemy-in-shadows:amoeba",
    "death-on-the-reik-companion:amoebae",
    "death-on-the-reik-companion:river-trolls",
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
  [CHAOS]: [
    "bayl-many-eyes:chaos-steed",
    "death-on-the-reik:corrosive-giant-rat",
    "death-on-the-reik:warpstone-giant-bat",
    "death-on-the-reik:mutant-bee-swarm",
    "death-on-the-reik:mutant-cat-swarm",
    "the-horned-rat:mutated-griffon",
    "ubersreik-adventures-i:unmarred-flesh-cultists-pugilists",
    "the-horned-rat:purple-hand-cultist",
    "the-horned-rat:yellow-fang-cultist",
    "the-horned-rat:acolyte",
    "the-horned-rat:daemonic-wolf",
    "the-horned-rat-companion:blightking",
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
