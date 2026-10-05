import { sourceButton } from "./source-controls.mjs";
import { legacyTag } from "./legacy.mjs";
const legacyFeature = {
  source: { book: "archives-iii-hedge", page: 62 },
  adaptation:
    "Compatible swaps applied to core Fifth Edition Hedge Witch; obsolete Trade (Charms) swap is unavailable and extra options grant no extra Advances.",
};
import { assembleBooks, bookSelection } from "./books.mjs";

const variants = [
  {
    id: "archives-iii-hedge",
    parent: "archives-iii",
    career: "hedge-witch",
    name: "Animal-doctor Hedge Witch",
    source: { book: "archives-iii", page: 62 },
  },
];
export const isCareerVariant = (id) => variants.some((x) => x.id === id);
export function careerVariantPanel(R, s) {
  const variant = variants.find(
    (x) => x.career === s.career && R.selection.some((b) => b.id === x.parent),
  );
  if (!variant) return "";
  const enabled = R.selection.some((b) => b.id === variant.id);
  return `<section class="notice" aria-label="Career variant"><div class="field"><label for="career-variant">Hedge Witch variant ${sourceButton(R, variant)}${legacyTag(R, legacyFeature)}</label><select id="career-variant" data-bind="careerVariant"><option value="" ${enabled ? "" : "selected"}>Standard Hedge Witch · core</option><option value="${variant.id}" ${enabled ? "selected" : ""}>${variant.name} · Legacy</option></select></div><p class="small muted">The animal-doctor variant replaces herbalist Skills and crafting Talents with Animal Care, Animal Training, Hardy and Robust. It adds Language (Belthani) and Secret Signs (Hedgefolk) choices, with the normal eight free Career Advances.</p><p class="small muted">Changing this choice clears Career Skill allocations, the starting Career Talent, magic and equipment choices. Your identity, Species choices and dice record are kept.</p></section>`;
}
export function clearCareerSelections(s) {
  s.skillChoices = {};
  s.careerSkills = {};
  s.freeTalent = "";
  s.bonusGear = [];
  s.gearChoices = {};
  s.gearRolls = {};
  s.wealth = null;
  s.purchases = [];
  s.gearState = {};
  s.coinStorage = "carried";
  s.localRegion = "";
  s.boost = {};
  s.spells = [];
  s.spellLores = {};
  if (s.cants) s.cants.choices = {};
}
export function switchCareerVariant(library, R, s, id) {
  if (s.ledger.length)
    throw Error(
      "Undo or clear advancement before changing your Career variant.",
    );
  const variant = variants.find(
    (x) => x.career === s.career && R.selection.some((b) => b.id === x.parent),
  );
  if (!variant || (id && id !== variant.id))
    throw Error("This Career variant is unavailable.");
  if (R.selection.some((b) => b.id === variant.id) === !!id) return R;
  const next = assembleBooks(library, [
    ...R.selection.filter((b) => b.id !== variant.id).map((b) => b.id),
    ...(id ? [id] : []),
  ]);
  const speciesChoices = Object.fromEntries(
      Object.entries(s.skillChoices).filter(([key]) => key.startsWith("s-")),
    ),
    boost = s.boost;
  clearCareerSelections(s);
  s.skillChoices = speciesChoices;
  s.boost = boost;
  s.books = bookSelection(next);
  return next;
}
