import { speciesMechanics } from "./species-mechanics.mjs";
const clothing = new Set([
  "Boots",
  "Cloak",
  "Clothing",
  "Fine Clothing",
  "Coat",
  "Costume",
  "Courtly Garb",
  "Gloves",
  "Velvet Cloak",
  "Hat",
  "Hood or Mask",
  "Hood",
  "Mask",
  "Robes",
  "Tattered Robes",
  "Shoes",
  "Uniform",
  "Local Clothing",
]);
export function equipmentSize(R, s, name, item) {
  if (!s) return { multiplier: 1 };
  const native =
    R.weapons.some((w) => w.name === name && w.source.book === "archives-ii") ||
    R.armour.some((a) => a.name === name && a.source.book === "archives-ii");
  if (speciesMechanics(R, s).equipmentSizing !== "ogre")
    return native
      ? {
          multiplier: 1,
          useUnresolved: true,
          source: {
            book: "archives-ii",
            page: name === "Ogre Gutplate" ? 29 : 28,
          },
          note:
            name === "Ogre Gutplate"
              ? "The Gutplate gives incomplete protection to other Species; no reduced AP profile is printed. GM review is required (Archives II p. 29)."
              : "Ogre weapons are described as all but useless to Average creatures. A usable profile for this Species requires GM review (Archives II p. 28).",
        }
      : { multiplier: 1 };
  if (
    item?.ogreSized ||
    R.weapons.some((w) => w.name === name && w.source.book === "archives-ii") ||
    R.armour.some((a) => a.name === name && a.source.book === "archives-ii")
  )
    return {
      multiplier: 1,
      source: { book: "archives-ii", page: 29 },
      note: "Already Ogre-sized; printed price and Encumbrance retained (Archives II p. 29).",
    };
  if (
    ["Food and drink", "Ammunition", "Animals and vehicles"].includes(
      item?.category,
    )
  )
    return {
      multiplier: 1,
      source: { book: "archives-ii", page: 31 },
      note: "Listed unit price and weight retained under the agreed Ogre equipment adaptation.",
    };
  if (
    R.weapons.some((w) => w.name === name) ||
    R.armour.some((a) => a.name === name) ||
    clothing.has(name) ||
    Object.hasOwn(R.config.containers, name) ||
    (Number.isFinite(item?.capacity) && !Object.hasOwn(R.config.carriers, name))
  )
    return {
      multiplier: 2,
      source: { book: "archives-ii", page: 31 },
      note: "Ogre-sized: double listed price and Encumbrance (Archives II p. 31; user-approved categories).",
    };
  return {
    multiplier: 1,
    unresolved: true,
    source: { book: "archives-ii", page: 31 },
    note: "Ogre sizing is unclear for this item: GM review is required before assigning its price/weight (Archives II p. 31).",
  };
}
