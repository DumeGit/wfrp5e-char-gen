// Browsing labels only: these never grant profiles, prices or game mechanics.
// Core gear has no category field. Its reviewed table sections supply the groups.
const coreContainers = new Set([
  "backpack",
  "barrel",
  "cask",
  "flask",
  "jug",
  "pewter-stein",
  "pouch",
  "sack",
  "sack-large",
  "saddlebags",
  "sling-bag",
  "scroll-case",
  "waterskin",
]);
const coreLighting = new Set([
  "candle-dozen",
  "feinkopf-lamp",
  "lamp-oil",
  "lantern",
  "storm-lantern",
  "match",
  "tinderbox",
  "torch-stick-and-rags",
]);
const coreLeisure = new Set([
  "ball",
  "deck-of-cards",
  "dice",
  "doll",
  "instrument",
  "pipe-and-tobacco",
]);
const coreCamp = new Set([
  "bedroll",
  "blanket",
  "canvas-tarp",
  "cutlery",
  "cooking-pot",
  "cup",
  "pan",
  "plate",
  "bowl",
  "rope-10-yards",
  "tent",
  "grappling-hook",
]);
const overrides = {
  "Small Instrument": ["Miscellaneous", "Music & leisure"],
  "Large Instrument": ["Miscellaneous", "Music & leisure"],
  "Small Tent": ["Travel & camping", "Camping equipment"],
  "Large Tent": ["Travel & camping", "Camping equipment"],
  Theodolite: ["Tools & kits", "Measuring & navigation"],
  Compass: ["Tools & kits", "Measuring & navigation"],
  "Ostrich Feather": ["Clothing & accessories", "Accessories"],
  "Slow Match (1 yard)": ["Tools & kits", "Weapon supplies"],
  "Fuse (1 yard)": ["Tools & kits", "Weapon supplies"],
  "Bow String": ["Tools & kits", "Weapon supplies"],
  Whetstone: ["Tools & kits", "Weapon supplies"],
  "Captain Braun’s Multi-Stove": ["Travel & camping", "Cooking equipment"],
  "Captain Braun’s Insta-Boiler": ["Travel & camping", "Cooking equipment"],
  Bandoleer: ["Containers & carrying", "Wearable carriers"],
  Sealskin: ["Clothing & accessories", "Clothing"],
  "Silk Underwear": ["Clothing & accessories", "Clothing"],
  "Dog Collar": ["Animals & transport", "Tack & animal supplies"],
  "Saddle and Harness": ["Animals & transport", "Tack & animal supplies"],
  "Worms (6)": ["Animals & transport", "Bait"],
  Cart: ["Animals & transport", "Land vehicles"],
  Coach: ["Animals & transport", "Land vehicles"],
  Wagon: ["Animals & transport", "Land vehicles"],
  Coracle: ["Animals & transport", "Boats"],
  "River Barge": ["Animals & transport", "Boats"],
  "Row Boat": ["Animals & transport", "Boats"],
  "Battle Standard": ["Magical & ceremonial items", "Ceremonial items"],
  "Metal Foil Sheets": ["Tools & kits", "Trade supplies"],
  "Reckoner’s Log": ["Books & documents", "Books"],
  "Stone Tablet": ["Books & documents", "Writing materials"],
  "Ithiltaen Helm": ["Armour & shields", "Armour references"],
  "Candelabra (with a dozen candles)": ["Miscellaneous", "Lighting & fire"],
};

function ammunitionGroup(name) {
  if (/Arrow|Shaft/.test(name)) return "Arrows";
  if (/Cannon|Catapult|Ballista|Swivel|Helstorm|Mortar|War Machine/.test(name))
    return "Artillery ammunition";
  if (/Bolt/.test(name)) return "Bolts";
  if (/Dart/.test(name)) return "Darts";
  if (/Drakefire|Torpedo/.test(name)) return "Drakefire ammunition";
  if (/Harpoon/.test(name)) return "Harpoons";
  if (/Grapple/.test(name)) return "Grapples";
  if (/Powder|Cartridge|Shot|Bullets|Leadbelcher/.test(name))
    return "Shot & powder";
  return "Sling bullets";
}

export function trappingPath(entry) {
  const { name, category } = entry;
  if (entry.kind)
    return [
      "Weapons",
      entry.kind === "melee" ? "Melee" : "Ranged",
      entry.group,
    ];
  if (entry.ap !== undefined) {
    const type =
      entry.locations === "Shield"
        ? "Shields"
        : entry.quick
          ? "Quick armour"
          : entry.layer === "additional"
            ? "Additional armour"
            : /Cloak/.test(name)
              ? "Cloaks"
              : /^Leather/.test(name)
                ? "Leather"
                : /^Mail/.test(name)
                  ? "Mail"
                  : /^Gromril/.test(name)
                    ? "Gromril"
                    : /^Ithilmar/.test(name)
                      ? "Ithilmar"
                      : /^Dragon Armour/.test(name)
                        ? "Dragon armour"
                        : "Plate & other armour";
    return ["Armour & shields", type];
  }
  if (overrides[name]) return overrides[name];
  if (
    category === "Ammunition" ||
    (category === "Dwarf trappings" && /Bullets|Bolts|Shots|Torpedo/.test(name))
  )
    return ["Ammunition", ammunitionGroup(name)];
  if (category === "Animals" || category === "Animals and vehicles")
    return ["Animals & transport", "Animals"];
  if (category === "Wizard robes" || category === "Clothing")
    return [
      "Clothing & accessories",
      category === "Wizard robes" ? category : "Clothing",
    ];
  if (
    ["Magical artefacts", "Enchanted items", "Ancestral heirlooms"].includes(
      category,
    )
  )
    return ["Magical & ceremonial items", category];
  if (["Tools and kits", "Thieving tools", "Trade tools"].includes(category))
    return ["Tools & kits", category];
  if (category === "Spell ingredients")
    return ["Magical & ceremonial items", category];
  if (category === "Prosthetics")
    return ["Herbs, remedies & care", "Prosthetics"];
  if (category === "Poisons") return ["Poisons"];
  if (category === "Herbs and remedies")
    return ["Herbs, remedies & care", "Herbs & remedies"];
  if (category === "Herbs & drinks")
    return /Wine/.test(name)
      ? ["Food & drink", "Drink"]
      : ["Herbs, remedies & care", "Herbs & remedies"];
  if (category === "Food, drink and lodging")
    return [
      "Food & drink",
      /Spirits|Wine|Beer|Ale/.test(name) ? "Drink" : "Food",
    ];

  if (entry.contentId?.startsWith("core:gear:")) {
    const id = entry.contentId.slice("core:gear:".length);
    if (coreContainers.has(id))
      return [
        "Containers & carrying",
        ["flask", "jug", "pewter-stein", "waterskin"].includes(id)
          ? "Drinking vessels"
          : "Containers",
      ];
    if (entry.page === 308)
      return ["Clothing & accessories", "Clothing & personal effects"];
    if (entry.page === 309)
      return ["Food & drink", /food|meal|rations/.test(id) ? "Food" : "Drink"];
    if (entry.page === 310) return ["Tools & kits", "General tools"];
    if (entry.page === 311)
      return [
        "Books & documents",
        id.startsWith("book-") ? "Books" : "Documents & writing materials",
      ];
    if (coreLighting.has(id)) return ["Miscellaneous", "Lighting & fire"];
    if (coreLeisure.has(id)) return ["Miscellaneous", "Music & leisure"];
    if (coreCamp.has(id)) return ["Travel & camping", "Camping equipment"];
    if (id === "bandage") return ["Herbs, remedies & care", "Medical supplies"];
    if (entry.page === 316) return ["Miscellaneous", "General supplies"];
  }
  // A visible fallback keeps future source entries reachable; the audit flags it.
  return ["Other trappings", category || "Uncategorised"];
}

export function equipmentPickerEntries(R) {
  return [...R.weapons, ...R.armour, ...R.gear, ...R.market]
    .filter((x, i, all) => all.findIndex((y) => y.name === x.name) === i)
    .map((entry) => {
      const path = trappingPath(entry);
      const shield =
        entry.kind &&
        R.armour.some((a) => a.name === entry.name && a.locations === "Shield");
      return {
        ...entry,
        key: entry.contentId,
        trappingPath: path,
        trappingPaths: shield
          ? [path, ["Armour & shields", "Shields"]]
          : [path],
      };
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );
}

export function filterEquipment(entries, path = []) {
  return entries.filter((entry) =>
    entry.trappingPaths.some((candidate) =>
      path.every((value, i) => !value || candidate[i] === value),
    ),
  );
}

export function equipmentFilterOptions(entries, path = []) {
  return [
    ...new Set(
      entries
        .flatMap((entry) =>
          entry.trappingPaths
            .filter((candidate) =>
              path.every((value, i) => candidate[i] === value),
            )
            .map((candidate) => candidate[path.length]),
        )
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
}
