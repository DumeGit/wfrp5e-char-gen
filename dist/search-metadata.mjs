// Build-time classifications. Only explicit profile fields and reviewed source
// identities are used; prose keyword guesses and draft-dependent access are excluded.
import {
  CATEGORY_FILTERS,
  searchCategory,
  searchBookId,
  validateSearchFilters,
} from "./search-filters.mjs";
const unknown = "Not specified";
const colourLores = [
  "Beasts",
  "Death",
  "Fire",
  "Heavens",
  "Life",
  "Light",
  "Metal",
  "Shadows",
];
const propertyOverrides = {
  "up-in-arms:reference:89-slash-xa": ["Quality", "Weapons"],
  "up-in-arms:reference:89-spread-rating": ["Quality", "Weapons"],
  "up-in-arms:reference:89-trip": ["Quality", "Weapons"],
  "up-in-arms:reference:89-unbalanced": ["Flaw", "Weapons"],
  "up-in-arms:reference:90-the-shield-quality": ["Quality", "Weapons"],
  "up-in-arms:reference:125-crewed": ["Flaw", "Weapons"],
  "up-in-arms:reference:126-salvo": ["Quality", "Weapons"],
  "archives-iii:reference:36-impenetrable": ["Quality", "Armour"],
  "archives-iii:reference:36-overcoat": ["Quality", "Armour"],
  "archives-iii:reference:36-partial": ["Flaw", "Armour"],
  "archives-iii:reference:36-reinforced": ["Quality", "Armour"],
  "archives-iii:reference:36-requires-kit": ["Flaw", "Armour"],
  "archives-iii:reference:36-visor": ["Quality", "Armour"],
  "archives-iii:reference:36-weakpoints": ["Flaw", "Armour"],
  "winds-of-magic:reference:170-the-cursed-quality": ["Quality", "Items"],
  "dwarf-guide:reference:92-crewed-rating": ["Flaw", "Weapons"],
  "dwarf-guide:reference:92-salvo-rating": ["Quality", "Weapons"],
  "dwarf-guide:reference:92-spread-rating": ["Quality", "Weapons"],
};
const propertyTopics = {
  "Item Quality": ["Quality", "Items"],
  "Item Flaw": ["Flaw", "Items"],
  "Weapon Quality": ["Quality", "Weapons"],
  "Weapon Flaw": ["Flaw", "Weapons"],
  "Armour Quality": ["Quality", "Armour"],
  "Armour Flaw": ["Flaw", "Armour"],
};
const runeForms = {
  Weapon: ["Weapons", "Weapon Rune"],
  Armour: ["Armour", "Armour Rune"],
  Talisman: ["Talismans", "Runic Talisman"],
  Protection: ["Protection items", "Protection Rune"],
  Engineering: ["Engineering weapons", "Engineering Rune"],
  Doom: ["Anvil of Doom", "Doom Rune"],
};
const equipmentCategories = {
  "Melee weapons": "Weapons",
  "Ranged weapons": "Weapons",
  Ammunition: "Ammunition",
  Armour: "Armour",
  "Packs and clothing": "Packs & clothing",
  "Wizard robes": "Clothing",
  Clothing: "Clothing",
  "Trade tools": "Tools & kits",
  "Tools and kits": "Tools & kits",
  "Thieving tools": "Tools & kits",
  "Animals and vehicles": "Animals & vehicles",
  Animals: "Animals & vehicles",
  "Food and drink": "Food & drink",
  "Books and documents": "Books & documents",
  Poisons: "Poisons",
  "Herbs and remedies": "Herbs & remedies",
  "Herbs & drinks": "Herbs & drinks",
  Prosthetics: "Prosthetics",
  "Spell ingredients": "Spell ingredients",
  "Magical artefacts": "Magical items",
  "Enchanted items": "Magical items",
  "Ancestral heirlooms": "Ancestral heirlooms",
  "Dwarf trappings": "Other trappings",
  Trappings: "Other trappings",
  Miscellaneous: "Other trappings",
};
export function addSearchMetadata(rows, contexts, books) {
  const memberships = new Map(),
    patrons = new Map();
  const grant = (map, key, value) => {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(value);
  };
  for (const R of contexts) {
    for (const [species, profile] of Object.entries(R.species))
      for (const career of profile.mechanics?.careers || [])
        grant(memberships, career, species);
    for (const origin of R.origins || []) {
      for (const career of [
        ...(origin.careers || []),
        ...(origin.additionalCareers || []),
        ...(origin.careerTable?.rows || []).map((row) => row.career),
      ])
        grant(memberships, career, origin.species);
    }
    for (const [patron, prayers] of Object.entries(R.config.blessings || {}))
      for (const name of prayers) grant(patrons, `Blessing of ${name}`, patron);
    for (const cult of R.cults || [])
      for (const name of [
        ...(cult.miracles || []),
        ...Object.values(cult.careerMiracles || {}).flat(),
      ])
        grant(patrons, name, cult.name);
  }
  return rows.map((row) => {
    const x = row.entry,
      category = searchCategory(row),
      f = { book: [searchBookId(x.source.book, books)] };
    if (category === "career") {
      f.class = [x.class || unknown];
      f.species = [
        ...new Set([
          ...(x.species || []),
          ...(memberships.get(x.id) || []),
          ...(memberships.get(x.name) || []),
        ]),
      ];
      if (row.printedReference && x.source.book === "high-elf")
        f.species = ["High Elf"];
    } else if (category === "skill") {
      f.type = [x.advanced ? "Advanced" : "Basic"];
      f.characteristic = [x.char];
    } else if (category === "mutation") f.type = [x.category];
    else if (category === "property") {
      const pair = propertyTopics[x.topic] || propertyOverrides[row.key];
      if (!pair) throw Error(`Unreviewed property filters: ${row.key}`);
      f.type = [pair[0]];
      f.applicable =
        pair[1] === "Items" ? ["Items", "Weapons", "Armour"] : [pair[1]];
    } else if (category === "rune") {
      const pair = runeForms[x.form];
      if (!pair) throw Error(`Unreviewed Rune form: ${row.key}`);
      f.applicable = [pair[0]];
      f.label = [pair[1], ...(x.master ? ["Master Rune"] : [])];
    } else if (category === "equipment") {
      f.type = [
        ...new Set(
          [...(row.facets || [x]), ...(row.shop || [])].map((profile) =>
            ["melee", "ranged"].includes(profile.kind)
              ? "Weapons"
              : profile.ap !== undefined && profile.locations
                ? "Armour"
                : equipmentCategories[profile.category] || unknown,
          ),
        ),
      ];
      if (f.type.length > 1) f.type = f.type.filter((type) => type !== unknown);
      if (row.printedReference) f.type = ["Magical items"];
    } else if (category === "magic") {
      if (row.label === "Cant") {
        f.type = ["Cant"];
        f.lore = [x.lore];
      } else if (x.category === "Blessing") {
        f.type = ["Blessing"];
        f.lore = [...(patrons.get(row.name) || [])];
      } else if (x.category === "Ritual") {
        f.type = ["Ritual"];
        f.lore = (x.ritual?.lores || []).flatMap((lore) =>
          lore === "*" ? colourLores : [lore],
        );
      } else if (["Petty", "Arcane", "Elven Arcane"].includes(x.category)) {
        f.type = [x.category === "Petty" ? "Petty spell" : "Arcane spell"];
        f.lore = [x.category];
      } else if (x.category && x.category !== "magic") {
        const prayer = x.cn === undefined;
        f.type = [prayer ? "Miracle" : "Lore spell"];
        f.lore = [x.category, ...(prayer ? patrons.get(row.name) || [] : [])];
      } else if (row.printedReference) {
        // Explicit source chapter labels and individually reviewed non-Lore spells.
        const lore = /^Lore of (.+)$/.exec(x.topic)?.[1];
        if (lore) {
          f.type = ["Lore spell"];
          f.lore = [lore];
        } else if (x.source.book === "archives-iii" && x.page <= 64) {
          f.type = ["Lore spell"];
          f.lore = ["Hedgecraft"];
        } else if (
          [
            "archives-iii:reference:80-spirit-bonding-ritual",
            "winds-of-magic:reference:29-the-bloody-hidesman",
            "winds-of-magic:reference:31-create-familiar",
          ].includes(row.key)
        )
          f.type = ["Ritual"];
        else if (row.key === "winds-of-magic:reference:27-silence") {
          f.type = ["Petty spell"];
          f.lore = ["Petty"];
        } else f.type = ["Spell"];
      }
    }
    for (const [key] of CATEGORY_FILTERS[category] || []) {
      f[key] = [...new Set((f[key] || []).filter(Boolean))];
      if (!f[key].length) f[key] = [unknown];
    }
    const result = { ...row, filterValues: f };
    validateSearchFilters(result, books);
    return result;
  });
}
