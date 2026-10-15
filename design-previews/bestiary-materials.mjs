// Preview-only material choices; none are production theme settings.
export const materials = {
  masonry: {
    name: "Crypt masonry",
    description:
      "Uneven old stone blocks, deep mortar joints and softly worn faces. The cool blue-grey wall of a long-forgotten crypt.",
  },
  slate: {
    name: "Crypt slate",
    description:
      "Cold mineral grain, worn strata and fine chalky pitting. A weathered crypt wall, with a cool, dry finish.",
  },
  hide: {
    name: "Basilisk hide",
    description:
      "Dense, irregular pebbled hide in storm blue. An aged bestiary binding with a fine, organic relief.",
  },
  iron: {
    name: "Blackened iron",
    description:
      "Matte hammered iron, fine pits and worn high points. Dark, weighty and softly worn.",
  },
};
export const materialKey = (value) =>
  Object.hasOwn(materials, value) ? value : "masonry";
