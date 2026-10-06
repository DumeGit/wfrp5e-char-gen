export const NPC_KEYS = [
  "M",
  "WS",
  "BS",
  "S",
  "T",
  "I",
  "Ag",
  "Dex",
  "Int",
  "WP",
  "Fel",
  "W",
];
export const NPC_SIZES = ["Small", "Average", "Large", "Enormous", "Monstrous"];
const object = (x) => x && typeof x === "object" && !Array.isArray(x);
const text = (x) => typeof x === "string" && !!x.trim();
const fail = (name) => {
  throw Error(`Bestiary: invalid ${name}.`);
};
export function validateBestiary(R) {
  for (const x of R.creatures || []) {
    if (
      x.magicGrants !== undefined &&
      (!Array.isArray(x.magicGrants) ||
        x.magicGrants.some(
          (grant) =>
            !object(grant) ||
            !text(grant.name) ||
            !text(grant.lore) ||
            Object.keys(grant).some((key) => !["name", "lore"].includes(key)) ||
            !R.spells.some(
              (spell) =>
                spell.name === grant.name &&
                !spell.ritual &&
                (spell.category === grant.lore ||
                  (spell.category === "Arcane" &&
                    R.config.colours.includes(grant.lore))),
            ),
        ))
    )
      fail(x.name + " printed magic");
    for (const kind of ["trait", "talent"]) {
      const grants = x[`${kind}Grants`];
      if (grants === undefined) continue;
      const catalog = R[kind === "trait" ? "traits" : "talents"];
      if (
        !Array.isArray(grants) ||
        grants.some(
          (g) =>
            !object(g) ||
            !text(g.name) ||
            Object.keys(g).some(
              (key) => !["name", "value", "ranks"].includes(key),
            ) ||
            (g.value !== undefined && typeof g.value !== "string") ||
            (g.ranks !== undefined &&
              (!Number.isInteger(g.ranks) || g.ranks < 1)) ||
            !catalog.some(
              (record) => record.name.split(" (")[0] === g.name.split(" (")[0],
            ),
        )
      )
        fail(x.name + " explicit " + kind + " grants");
    }
    if (
      x.armourProfiles !== undefined &&
      (!Array.isArray(x.armourProfiles) ||
        x.armourProfiles.some(
          (a) =>
            !object(a) ||
            !text(a.name) ||
            !Number.isInteger(a.ap) ||
            a.ap < 0 ||
            !text(a.text) ||
            (a.abstract !== undefined && typeof a.abstract !== "boolean") ||
            Object.keys(a).some(
              (key) => !["name", "ap", "text", "abstract"].includes(key),
            ),
        ))
    )
      fail(x.name + " printed armour");
    if (
      !object(x.stats) ||
      NPC_KEYS.some(
        (k) =>
          !(k in x.stats) ||
          (x.stats[k] !== null &&
            (!Number.isInteger(x.stats[k]) || x.stats[k] < 0)),
      ) ||
      Object.keys(x.stats).some((k) => !NPC_KEYS.includes(k)) ||
      !NPC_SIZES.concat("Tiny").includes(x.size) ||
      !object(x.sections) ||
      Object.values(x.sections).some((v) => !text(v)) ||
      !Array.isArray(x.skills) ||
      x.skills.some((v) => !text(v.name) || !Number.isInteger(v.total)) ||
      (x.toughnessBonus !== null &&
        (!Number.isInteger(x.toughnessBonus) || x.toughnessBonus < 0)) ||
      !Array.isArray(x.attacks) ||
      x.attacks.some(
        (a) =>
          !text(a.name) ||
          (a.skillName !== undefined &&
            (!text(a.skillName) ||
              !R.skills.some(
                (skill) =>
                  skill.name.split(" (")[0] === a.skillName.split(" (")[0],
              ))) ||
          typeof a.text !== "string" ||
          typeof a.optional !== "boolean" ||
          [a.skill, a.damage].some(
            (v) => v !== null && (!Number.isInteger(v) || v < 0),
          ),
      ) ||
      !Array.isArray(x.notes) ||
      x.notes.some((v) => !text(v))
    )
      fail(x.name);
  }
  for (const x of R.traits || [])
    if (!text(x.text) || (x.parameter !== null && !text(x.parameter)))
      fail(x.name);
  for (const x of R.templates || []) {
    if (
      !object(x.adjustments) ||
      Object.entries(x.adjustments).some(
        ([k, v]) =>
          !NPC_KEYS.includes(k) ||
          ["M", "W"].includes(k) ||
          !Number.isInteger(v),
      ) ||
      !Array.isArray(x.skills) ||
      !Array.isArray(x.talents)
    )
      fail(x.name);
    for (const s of x.skills)
      if (
        !s.options?.length ||
        s.options.some((v) => !text(v)) ||
        !Number.isInteger(s.bonus) ||
        s.bonus < 0 ||
        !Number.isInteger(s.count) ||
        s.count < 1
      )
        fail(x.name + " Skill grant");
    for (const t of x.talents)
      if (
        !t.options?.length ||
        t.options.some((v) => !text(v)) ||
        !Number.isInteger(t.ranks) ||
        t.ranks < 1
      )
        fail(x.name + " Talent grant");
    if (
      x.magic &&
      (!Number.isInteger(x.magic.petty) ||
        !Number.isInteger(x.magic.lore) ||
        x.magic.petty < 0 ||
        x.magic.lore < 0)
    )
      fail(x.name + " magic grant");
  }
  for (const category of ["Physical", "Mental"]) {
    const rows = (R.mutations || []).filter((x) => x.category === category);
    if (!rows.length) continue;
    const covered = new Set();
    for (const x of rows) {
      if (
        !text(x.text) ||
        !object(x.adjustments) ||
        Object.entries(x.adjustments).some(
          ([k, v]) =>
            !NPC_KEYS.includes(k) || k === "W" || !Number.isInteger(v),
        ) ||
        !Number.isInteger(x.min) ||
        !Number.isInteger(x.max) ||
        x.min < 1 ||
        x.max > 100 ||
        x.max < x.min
      )
        fail(x.name);
      for (let n = x.min; n <= x.max; n++) {
        if (covered.has(n)) fail(category + " Mutation overlap");
        covered.add(n);
      }
    }
    if (covered.size !== 100) fail(category + " Mutation table coverage");
  }
}
