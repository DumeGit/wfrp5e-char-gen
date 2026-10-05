import { issue, uniqueIssues } from "./issues.mjs";
import { canonicalName } from "./content-references.mjs";
import { career, derive } from "./rules.mjs";
import { marketCatalog, purchaseItem } from "./market.mjs";
import {
  rawGearSlots,
  rolledName,
  coinValue,
  itemParts,
  itemModifiers,
  modifierNames,
} from "./inventory.mjs";
import { equipmentSize } from "./equipment-sizing.mjs";
export function itemWeight(R, name) {
  // The ammunition table gives Enc 0 for these units/packs (p. 303).
  if (
    ["Arrow", "Bolt", "Shot", "Bullet", "Lead Bullet", "Stone Bullet"].includes(
      name,
    )
  )
    return 0;
  if (name === "Small Tent") return 1;
  if (name === "Coach Horn") return 1;
  if (name === "Lute") return 2;
  const qty = name.match(
    /^(\d+) (Rags|Bandages|Matches|Candles|Sets of Clothing)$/,
  );
  if (qty) return Number(qty[1]) * (qty[2] === "Sets of Clothing" ? 1 : 0);
  name = canonicalName("gear-weight", name)
    .replace(/^Book \(([^)]+)\)$/, "Book, $1")
    .replace(/^Trade Tools \([^)]+\)$/i, "Trade Tools");
  return (
    R.config.gearEnc[name] ??
    R.gear.find((x) => x.name.toLowerCase() === name.toLowerCase())?.enc ??
    marketCatalog(R).find((x) => x.name.toLowerCase() === name.toLowerCase())
      ?.enc ??
    null
  );
}

export function gearOptions(raw, R) {
  if (R.books.some((b) => b.id === "dwarf-guide")) {
    if (raw === "Gromril Helm (Open or Closed)")
      return ["Gromril Open Helm", "Gromril Helm"];
    if (raw === "Gromril Helm (Open)") return ["Gromril Open Helm"];
    if (raw === "Gromril Helm (Closed)") return ["Gromril Helm"];
    if (raw === "Plate Helm (Open)") return ["Open Helm"];
    if (/^Basic Weapon \(Any/.test(raw) && !raw.includes(" or "))
      return R.weapons
        .filter((w) => w.kind === "melee" && w.group === "Basic")
        .map((w) => w.name);
    if (/^Two-handed Weapon \(Any/.test(raw))
      return R.weapons
        .filter((w) => w.kind === "melee" && w.group === "Two-handed")
        .map((w) => w.name);
  }
  if (raw === "Two-handed Weapon")
    return R.weapons
      .filter((w) => w.kind === "melee" && w.group === "Two-handed")
      .map((w) => w.name);
  if (/^Hand Weapon \(.+ or .+\)$/.test(raw))
    return raw
      .slice(13, -1)
      .split(" or ")
      .map((x) => `Hand Weapon (${x})`);
  if (raw === "Entangling OR Throwing weapon")
    return [
      ...new Set(
        R.weapons
          .filter(
            (w) =>
              w.kind === "ranged" &&
              ["Entangling", "Throwing"].includes(w.group),
          )
          .map((w) => w.name),
      ),
    ];
  if (raw === "Melee Weapon (Basic OR Cavalry)")
    return [
      ...new Set(
        R.weapons
          .filter(
            (w) => w.kind === "melee" && ["Basic", "Cavalry"].includes(w.group),
          )
          .map((w) => w.name),
      ),
    ];
  if (/^(Weapon|Melee Weapon|Ranged Weapon) \(Any/.test(raw))
    return [
      ...new Set(
        R.weapons
          .filter(
            (w) =>
              (!raw.startsWith("Melee") && !raw.startsWith("Ranged")) ||
              w.kind === (raw.startsWith("Ranged") ? "ranged" : "melee"),
          )
          .map((w) => w.name),
      ),
    ];
  if (
    raw.startsWith("Great Weapon") &&
    canonicalName("gear-profile", raw) !== raw
  )
    return [canonicalName("gear-profile", raw)];
  if (raw === "Musical Instrument")
    return ["Small Instrument", "Instrument", "Large Instrument"];
  if (raw === "Helmet") return ["Helm", "Open Helm"];
  if (raw.includes(" or "))
    return raw.split(" or ").flatMap((name) => gearOptions(name, R));
  return [raw];
}
export function gearSlots(R, s) {
  return [
    ...rawGearSlots(R, s),
    ...(s.purchases || []).map((x, i) => ({
      name: purchaseItem(R, x)?.name || "Unknown purchased item",
      origin: "Bought with starting wealth",
      key: x.uid ? `purchase-${x.uid}` : `purchase-${i}`,
      marketId: purchaseItem(R, x)?.id,
      source: purchaseItem(R, x)?.source,
      purchase: x,
    })),
  ];
}
export function resolvedGearName(s, slot, R) {
  const opts = gearOptions(slot.name, R);
  return rolledName(
    s,
    slot,
    opts.includes(s.gearChoices[slot.key]) ? s.gearChoices[slot.key] : opts[0],
  );
}
export function inventoryEntries(R, s) {
  const entries = [],
    slots = gearSlots(R, s),
    hasOutfit = slots.some((x) =>
      ["Uniform", "Fine Clothing", "Courtly Garb", "Robes"].includes(
        resolvedGearName(s, x, R),
      ),
    );
  for (const slot of slots) {
    const resolved = resolvedGearName(s, slot, R);
    if (coinValue(resolved)) continue;
    itemParts(resolved).forEach((part, i) => {
      const key = i ? `${slot.key}:part-${i}` : slot.key,
        name = part.name,
        alias =
          name === "Gutplate" &&
          R.armour.some((a) => a.name === "Ogre Gutplate")
            ? "Ogre Gutplate"
            : canonicalName("gear-profile", name, slot.source?.book),
        mods = itemModifiers(slot.purchase);
      const weapon =
        R.weapons.find((w) => w.name === alias) ||
        R.weapons.find(
          (w) =>
            w.name.replace(" (2H)", "") === alias ||
            (w.name === "Hand Weapon" && alias.startsWith("Hand Weapon (")),
        ) ||
        (name === "Hook" ? R.weapons.find((w) => w.name === "Dagger") : null);
      const armour = R.armour.find((a) => a.name === alias),
        listed =
          slot.marketId && i === 0
            ? marketCatalog(R).find((x) => x.id === slot.marketId)
            : marketCatalog(R).find((x) => x.name === alias),
        capacity =
          R.config.containers[alias] ??
          R.config.carriers[alias] ??
          (Number.isFinite(listed?.capacity) ? listed.capacity : undefined),
        carrier = Object.hasOwn(R.config.carriers, alias),
        canWear =
          listed?.wearable === true ||
          (!!armour && armour.locations !== "Shield") ||
          /^(Clothing|Uniform|Fine Clothing|Courtly Garb|Boots|Coat|Velvet Cloak|Cloak|Hat|Robes|Tattered Robes|Hooded Cloak|Hood|Mask|Pouch|Backpack|Sling Bag)$/.test(
            alias,
          ) ||
          listed?.category === "Prosthetics" ||
          (capacity !== undefined &&
            !carrier &&
            !["Barrel", "Cask", "Jug", "Pewter Stein"].includes(alias));
      const placement =
        listed?.category === "Prosthetics"
          ? "worn"
          : weapon || armour?.locations === "Shield"
            ? "equipped"
            : name === "Clothing" && slot.key === "all-0" && hasOutfit
              ? "carried"
              : canWear
                ? "worn"
                : carrier || alias === "Workshop"
                  ? "external"
                  : "carried";
      let enc =
        name === "Hook"
          ? 1
          : (armour?.enc ?? weapon?.enc ?? listed?.enc ?? itemWeight(R, alias));
      const size = equipmentSize(
        R,
        s,
        weapon?.name || armour?.name || alias,
        listed,
      );
      if (size.unresolved) enc = null;
      else if (enc !== null) enc *= size.multiplier;
      if (enc !== null) {
        enc = Math.max(
          0,
          enc +
            (mods.flaws.includes("Bulky") ? 1 : 0) -
            (mods.qualities.includes("Lightweight") ? 1 : 0),
        );
      }
      entries.push({
        ...slot,
        key,
        name,
        alias,
        quantity: part.quantity,
        weapon,
        armour,
        canWear,
        capacity,
        carrier,
        placement,
        enc,
        sizeNote: size.note,
        sizeSource: size.source,
        useUnresolved: !!size.useUnresolved,
        ...mods,
        quick: armour?.quick,
        netMode: slot.name.startsWith("Ranged Weapon") ? "ranged" : "melee",
        oneHanded: false,
        inContainer: part.inContainer ? slot.key : null,
      });
    });
  }
  return entries;
}
function adjustedWeapon(entry, d, R) {
  let w = { ...entry.weapon };
  if (entry.name === "Net")
    w = {
      ...R.weapons.find((w) => w.name === "Net" && w.kind === entry.netMode),
    };
  let qualities = w.qualities.split(", ").filter(Boolean),
    damage = w.damage
      .replace("SB", d.sb)
      .split("+")
      .map(Number)
      .reduce((a, b) => a + b, 0),
    bonus = 0;
  if (w.kind === "melee" && d.size === "Large") bonus += d.sb;
  if (w.kind === "melee" && d.talents.includes("Strike Mighty Blow")) bonus++;
  if (w.kind === "ranged") {
    if (d.talents.includes("Accurate Shot")) bonus++;
    if (d.talents.includes("Sure Shot")) bonus++;
  }
  if (entry.oneHanded && w.name === "Spear (2H)") {
    damage--;
    qualities = qualities.filter((x) => x !== "Fast");
  }
  if (entry.oneHanded && w.name === "Bastard Sword (2H)") {
    w.group = "Basic";
    qualities = qualities.filter((x) => x !== "Damaging");
    qualities.push("Unbalanced");
  }
  if (d.talents.includes("Rapid Reload"))
    qualities = qualities.map((x) =>
      x.replace(
        /Reload (\d+)/,
        (_, n) => `Reload ${Math.max(0, Number(n) - 1)}`,
      ),
    );
  if (
    d.talents.includes("Gunner") &&
    ["Blackpowder", "Engineering", "Explosives"].includes(w.group)
  )
    qualities = qualities.filter((x) => x !== "Dangerous");
  return {
    ...w,
    key: entry.key,
    label:
      (entry.oneHanded
        ? entry.name.replace(" (2H)", "") + " (1H)"
        : entry.name) + (entry.quantity > 1 ? ` ×${entry.quantity}` : ""),
    quantity: entry.quantity,
    enc: entry.enc === null ? null : entry.enc * (entry.quantity || 0),
    damage: Number.isFinite(damage) ? damage + bonus : w.damage,
    qualities: [...qualities, ...modifierNames(entry)].join(", "),
    placement: entry.placement,
  };
}
function slotAliasNote(e) {
  return e.name.startsWith("Great Weapon (")
    ? `${e.name} uses the ${e.alias} profile (p. 301); no separate profile is printed.`
    : "";
}
export function equipment(R, s) {
  const d = derive(R, s),
    entries = inventoryEntries(R, s),
    notes = [],
    warnings = [],
    unknown = [],
    weapons = [],
    armour = [],
    other = [],
    ap = { Head: 0, Arms: 0, Body: 0, Legs: 0, Shield: 0 };
  // Creation defaults are derived, so saved packing preferences cannot hide gear.
  const parents = new Map(entries.map((e) => [e.key, null]));
  const bags = entries.filter(
    (e) => e.capacity !== undefined && !e.carrier && e.quantity !== null,
  );
  const loads = new Map(bags.map((e) => [e.key, 0]));
  const pack = (e, bag) => {
    parents.set(e.key, bag.key);
    e.placement = bag.key;
    loads.set(bag.key, loads.get(bag.key) + e.enc * e.quantity);
  };
  const candidates = entries.filter(
    (e) =>
      e.placement === "carried" &&
      e.capacity === undefined &&
      e.enc !== null &&
      e.quantity !== null,
  );
  // Keep the book's explicitly packed contents together when they fit.
  for (const e of candidates.filter((e) => e.inContainer)) {
    const bag = bags.find((b) => b.key === e.inContainer),
      weight = e.enc * e.quantity;
    if (bag && loads.get(bag.key) + weight <= bag.capacity * bag.quantity)
      pack(e, bag);
  }
  // Fit larger belongings first; overflow stays in the carried total.
  for (const e of candidates
    .filter((e) => !parents.get(e.key))
    .sort((a, b) => b.enc * b.quantity - a.enc * a.quantity)) {
    const weight = e.enc * e.quantity;
    const bag = bags
      .filter((b) => loads.get(b.key) + weight <= b.capacity * b.quantity)
      .sort(
        (a, b) =>
          a.capacity * a.quantity -
          loads.get(a.key) -
          (b.capacity * b.quantity - loads.get(b.key)),
      )[0];
    if (bag) pack(e, bag);
  }
  const personallyCarried = (e) => e.placement !== "external";
  const weights = new Map();
  for (const e of entries) {
    let value =
      e.enc === null || e.quantity === null ? null : e.enc * e.quantity;
    const worn = e.placement === "worn" && e.canWear && !parents.get(e.key);
    if (!e.quick && worn && value !== null)
      value = e.flaws.includes("Bulky")
        ? Math.max(e.quantity, value - e.quantity)
        : Math.max(0, value - e.quantity);
    weights.set(e.key, value);
    e.carriedEnc = !parents.get(e.key) && personallyCarried(e) ? value : 0;
    e.worn = worn;
  }
  const coinEnc = 0; // User-selected creator convention: ignore coin weight.
  for (const e of entries.filter((x) => x.capacity !== undefined)) {
    e.load = loads.get(e.key) || 0;
    e.loadUnknown = false;
  }
  for (const e of entries) {
    if (e.sizeNote)
      notes.push(
        issue(
          "reference.gear-size",
          `${e.name}: ${e.sizeNote}`,
          5,
          ".shop-disclosure",
          e.sizeSource,
          "info",
        ),
      );
    if (e.armour?.source?.book === "dwarf-guide") {
      const ref = R.gear.find((x) => x.name === e.alias);
      if (ref?.text)
        notes.push(
          issue(
            "reference.dwarf-armour",
            `${e.name}: ${ref.text} (Dwarf Guide p. ${ref.page}).`,
            5,
            ".shop-disclosure",
            ref.source,
            "info",
          ),
        );
    }
    if (e.name === "Gutplate" && e.alias === "Ogre Gutplate")
      notes.push(
        issue(
          "reference.gutplate",
          "Gutplate Career Trapping uses the Ogre Gutplate table profile and Gutplate description (Archives II pp. 29–30). Descriptive variants remain unresolved.",
          5,
          ".shop-disclosure",
          { book: "archives-ii", page: "29–30" },
          "info",
        ),
      );
    if (
      personallyCarried(e) &&
      !parents.get(e.key) &&
      weights.get(e.key) === null
    )
      unknown.push(e.name);
    if (e.name === "Hook")
      notes.push(
        issue(
          "reference.hook",
          "Hook counts as a Dagger (p. 315); its own Encumbrance is retained.",
          5,
          ".shop-disclosure",
          { book: "core", page: 315 },
          "info",
        ),
      );
    if (slotAliasNote(e))
      notes.push(
        issue(
          "reference.alias",
          slotAliasNote(e),
          5,
          ".shop-disclosure",
          e.source || { book: "dwarf-guide", page: 93 },
          "info",
        ),
      );
    if (e.name === "Grimoire")
      notes.push(
        issue(
          "reference.grimoire",
          "Grimoire uses the Book, Magic Encumbrance entry (pp. 237, 311).",
          5,
          ".shop-disclosure",
          { book: "core", page: 311 },
          "info",
        ),
      );
    if (e.name === "Lunch")
      notes.push(
        issue(
          "reference.lunch",
          "Lunch uses the printed Meal Encumbrance entry (pp. 39, 309).",
          5,
          ".shop-disclosure",
          { book: "core", page: 309 },
          "info",
        ),
      );
    if (e.name === "Leather Breastplate")
      notes.push(
        issue(
          "reference.leather-name",
          `Leather Breastplate (${career(R, s).source.book === "core" ? "core" : career(R, s).source.book} p. ${career(R, s).page}) uses core Leather Jerkin statistics (p. 307), as agreed.`,
          5,
          ".shop-disclosure",
          { book: "core", page: 307 },
          "info",
        ),
      );
    if (e.weapon)
      weapons.push({ ...adjustedWeapon(e, d, R), carriedEnc: e.carriedEnc });
    if (e.armour)
      armour.push({
        ...e.armour,
        key: e.key,
        label: e.name + (e.quantity > 1 ? ` ×${e.quantity}` : ""),
        enc: e.enc,
        carriedEnc: e.weapon ? 0 : e.carriedEnc,
        worn: e.worn,
        active:
          e.worn ||
          (e.armour.locations === "Shield" && e.placement === "equipped"),
        qualities: [e.armour.qualities, ...modifierNames(e)]
          .filter(Boolean)
          .join(", "),
        itemQualities: e.qualities,
        itemFlaws: e.flaws,
      });
    if (!e.weapon && !e.armour)
      other.push({
        key: e.key,
        name: e.name + (e.quantity > 1 ? ` ×${e.quantity}` : ""),
        origin: e.origin,
        enc: e.carriedEnc,
        worn: e.worn,
        placement: e.placement,
        qualities: e.qualities,
        flaws: e.flaws,
      });
  }
  const byLayer = {};
  for (const a of armour.filter((a) => a.active)) {
    const layer = a.quick
      ? "quick"
      : a.layer === "leather" || a.name.startsWith("Leather")
        ? "leather"
        : a.name.startsWith("Mail")
          ? "mail"
          : a.locations === "Shield"
            ? "shield"
            : "plate";
    for (const loc of Object.keys(ap))
      if (a.locations.includes(loc)) {
        const k = `${layer}-${loc}`;
        byLayer[k] = Math.max(byLayer[k] || 0, a.ap);
      }
  }
  const activeQuick = armour.some((a) => a.active && a.quick);
  if (
    activeQuick &&
    armour.some((a) => a.active && !a.quick && a.locations !== "Shield")
  )
    warnings.push(
      issue(
        "warning.quick-armour",
        "Quick Armour replaces detailed armour; its protection and penalties are not stacked (p. 307).",
        5,
        ".shop-disclosure",
        { book: "core", page: 307 },
        "warning",
      ),
    );
  for (const [key, val] of Object.entries(byLayer)) {
    const [layer, loc] = key.split("-");
    if (!activeQuick || ["quick", "shield"].includes(layer)) ap[loc] += val;
  }
  function penalty(a, value) {
    return Math.max(
      0,
      value * (a.itemFlaws.includes("Unreliable") ? 2 : 1) -
        (a.itemQualities.includes("Practical") ? 1 : 0),
    );
  }
  const wornArmour = armour.filter((a) => a.worn && (!activeQuick || a.quick)),
    stealth = -["mail", "plate"].reduce(
      (n, layer) =>
        n +
        Math.max(
          0,
          ...wornArmour
            .filter((a) =>
              layer === "mail"
                ? a.layer === "mail" ||
                  a.name.startsWith("Mail") ||
                  (a.quick && a.ap >= 3)
                : a.layer !== "leather" &&
                  !a.name.startsWith("Leather") &&
                  !a.name.startsWith("Mail") &&
                  (!a.quick || a.ap >= 5),
            )
            .map((a) => penalty(a, 1)),
        ),
      0,
    ),
    perception = -Math.max(
      0,
      ...wornArmour
        .filter(
          (a) =>
            a.name === "Helm" ||
            ["Ithilmar Helm", "Dragon Armour Helm"].includes(a.name) ||
            a.name === "Heavy Armour",
        )
        .map((a) => penalty(a, 2)),
    );
  const lores = d.talents
    .filter((t) => t.startsWith("Arcane Magic ("))
    .map((t) => t.match(/\((.*)\)/)[1]);
  const castingFor = (lore) => {
    const layers = {};
    for (const a of wornArmour) {
      const leather = a.layer === "leather" || a.name.startsWith("Leather"),
        metal =
          a.name.startsWith("Mail") || (!leather && a.locations !== "Shield");
      let value = a.ap;
      if (a.quick) {
        value =
          a.ap -
          (lore === "Metal"
            ? Math.max(0, a.ap - 1)
            : lore === "Beasts"
              ? 1
              : 0);
      } else if ((lore === "Metal" && metal) || (lore === "Beasts" && leather))
        continue;
      const layer = a.quick
        ? "quick"
        : leather
          ? "leather"
          : a.name.startsWith("Mail")
            ? "mail"
            : "plate";
      for (const loc of ["Head", "Arms", "Body", "Legs"])
        if (a.locations.includes(loc)) {
          const key = `${layer}:${loc}`;
          layers[key] = Math.max(layers[key] || 0, penalty(a, value));
        }
    }
    return -Math.max(
      0,
      ...["Head", "Arms", "Body", "Legs"].map((loc) =>
        Object.entries(layers)
          .filter(([k]) => k.endsWith(":" + loc))
          .reduce((n, [, v]) => n + v, 0),
      ),
    );
  };

  const weaponEnc = weapons.reduce((n, x) => n + (x.carriedEnc || 0), 0),
    armourEnc = armour.reduce((n, x) => n + (x.carriedEnc || 0), 0),
    gearEnc = other.reduce((n, x) => n + (x.enc || 0), 0),
    total = Number((weaponEnc + armourEnc + gearEnc).toFixed(3));
  const complete = !unknown.length;
  let band =
    total <= d.capacity
      ? 0
      : total <= d.capacity * 2
        ? 1
        : total <= d.capacity * 3
          ? 2
          : 3;
  const movement =
      band === 3
        ? 0
        : band === 2
          ? Math.max(2, d.movement - 2)
          : band === 1
            ? Math.max(3, d.movement - 1)
            : d.movement,
    agility =
      band === 2
        ? Math.max(10, d.stats.Ag - 20)
        : band === 1
          ? d.stats.Ag - 10
          : d.stats.Ag;
  if (
    entries.filter(
      (e) => personallyCarried(e) && !parents.get(e.key) && e.enc >= 4,
    ).length > 1
  )
    warnings.push(
      issue(
        "warning.oversized",
        "Normally only one oversized object can be carried; it likely needs both hands (p. 299).",
        5,
        ".shop-disclosure",
        { book: "core", page: 299 },
        "warning",
      ),
    );
  if (d.talents.includes("Sure Shot"))
    notes.push(
      issue(
        "reference.sure-shot",
        "Sure Shot: +1 ranged Damage; ignore Partial armour, and Weakpoints when using Impale (p. 127).",
        5,
        ".shop-disclosure",
        { book: "core", page: 127 },
        "info",
      ),
    );
  if (d.talents.includes("Accurate Shot"))
    notes.push(
      issue(
        "reference.accurate-shot",
        "Accurate Shot: +1 ranged Damage is included; +2 instead when aiming (p. 114).",
        5,
        ".shop-disclosure",
        { book: "core", page: 114 },
        "info",
      ),
    );
  if (d.size === "Large")
    notes.push(
      issue(
        "reference.large-damage",
        "Large size: primary melee weapon Damage includes an additional Strength Bonus (core p. 360). This extra Damage does not apply to ranged or extra attacks.",
        5,
        ".shop-disclosure",
        { book: "core", page: 360 },
        "info",
      ),
    );
  if (d.talents.includes("Strike Mighty Blow"))
    notes.push(
      issue(
        "reference.mighty-blow",
        "Strike Mighty Blow: +1 melee Damage is included; +2 instead with Advantage (p. 127).",
        5,
        ".shop-disclosure",
        { book: "core", page: 127 },
        "info",
      ),
    );
  notes.push(
    issue(
      "reference.packing",
      "Creator defaults: armour and wearable containers are worn, weapons are equipped, and other belongings fill available containers. Overflow is carried separately. Coin weight is ignored by user choice.",
      5,
      ".shop-disclosure",
      { book: "core", page: 299 },
      "info",
    ),
  );
  return {
    entries,
    weapons,
    armour,
    other,
    unknown: [...new Set(unknown)],
    ap,
    weaponEnc,
    armourEnc,
    gearEnc,
    total,
    notices: uniqueIssues([...notes, ...warnings]),
    notes: [...new Set(notes.map((x) => x.message))],
    warnings: warnings.map((x) => x.message),
    coinEnc,
    penalties: {
      complete,
      band,
      movement,
      agility,
      travelFatigue: band < 3 ? band : 0,
      immobile: band === 3,
      stealth: stealth || 0,
      perception: perception || 0,
      casting: Object.fromEntries(
        (lores.length ? lores : ["Other magic"]).map((l) => [
          l,
          castingFor(l) || 0,
        ]),
      ),
    },
  };
}
export function recordAcquisition(R, s, level, index, reason, linkedGear = "") {
  const d = derive(R, s);
  if (level !== d.level + 1 || level > 4)
    throw Error("Only the next Career level grants Trapping boxes.");
  const name = career(R, s).levels[level - 1].trappings[index];
  if (!name || name === "None") throw Error("Choose a Career Trapping.");
  if (!reason.trim()) throw Error("Record how the Trapping was obtained.");
  if (
    s.ledger.some((x) => x.type === "trapping" && x.name === name) ||
    s.bonusGear.some((i) => career(R, s).levels[1].trappings[i] === name)
  )
    throw Error("This Trapping already earned a box.");
  if (linkedGear) {
    const existing = gearSlots(R, s).find((x) => x.key === linkedGear);
    if (!existing) throw Error("Choose an owned item.");
    const actual = resolvedGearName(s, existing, R),
      choices = gearOptions(name, R);
    if (!choices.includes(actual) && name !== actual)
      throw Error("The owned item must match the required Trapping.");
    if (s.ledger.some((x) => x.linkedGear === linkedGear))
      throw Error("This owned item already earned a box.");
  }
  s.ledger.push({
    type: "trapping",
    name,
    reason,
    level,
    cost: 0,
    tick: d.earnedBoxes < 36,
    page: "43–44",
    ...(linkedGear ? { linkedGear } : {}),
  });
}
