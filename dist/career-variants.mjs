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
    adaptation: legacyFeature.adaptation,
    text: "Replaces herbalist Skills and crafting Talents with Animal Care, Animal Training, Hardy and Robust. Adds Language (Belthani) and Secret Signs (Hedgefolk), with normal free Career allocations.",
  },
  ...[
    [
      "ranald-priest",
      "priest",
      "General Ranald Priest",
      13,
      "Uses the printed Ranald Initiate Skills. Core Priest retains its Career structure and ordinary free allocations.",
    ],
    [
      "dealer",
      "priest",
      "Ranald the Dealer",
      24,
      "Adds Haggle and Evaluate to first-level choices, without extra free Advances. Ranald Miracle access uses the Dealer’s five additional prayers.",
    ],
    [
      "taal-priest",
      "priest",
      "Taal Priest",
      89,
      "Uses the printed Taal Initiate Skills, with the core Priest’s structure and ordinary free allocations.",
    ],
    [
      "white-stag",
      "nun",
      "White Stag / Hermit",
      89,
      "Uses the printed Nun first-level Skills for the Order of the White Stag or a hermit. Storyteller uses core Storytelling.",
    ],
    [
      "longshanks",
      "scout",
      "Longshanks Scout",
      89,
      "Uses the printed Guide Skills for a Longshanks ranger, with ordinary core allocations.",
    ],
    [
      "pickpocket",
      "thief",
      "Pickpocket",
      27,
      "Uses the printed pickpocket Skills. Fifth Edition Thief already has Fast Hands; the old Talent swap grants no additional Talent.",
    ],
  ].map(([suffix, career, name, page, text]) => ({
    id: `deft-steps-${suffix}`,
    parent: "deft-steps",
    career,
    name,
    source: { book: "deft-steps", page },
    text,
  })),
];
export const isCareerVariant = (id) => variants.some((x) => x.id === id);
const availableVariants = (R, s) =>
  variants.filter(
    (x) => x.career === s.career && R.selection.some((b) => b.id === x.parent),
  );
export function careerVariantPanel(R, s) {
  const choices = availableVariants(R, s);
  if (!choices.length) return "";
  const selected = choices.find((x) => R.selection.some((b) => b.id === x.id));
  const current = selected || choices[0];
  const name = R.careers.find((c) => c.id === s.career).name;
  return `<section class="notice" aria-label="Career variant"><div class="field"><label for="career-variant">${name} variant ${sourceButton(R, current)}${legacyTag(R, current)}</label><select id="career-variant" data-bind="careerVariant"><option value="" ${selected ? "" : "selected"}>Standard ${name} · core</option>${choices.map((x) => `<option value="${x.id}" ${selected?.id === x.id ? "selected" : ""}>${x.name}${x.adaptation ? " · Legacy" : ""}</option>`).join("")}</select></div><p class="small muted">${selected ? selected.text : "Choose an optional printed profile. Standard retains the core Career; variants grant no extra free Advances."}</p><p class="small muted">Changing this choice clears Career Skill allocations, the starting Career Talent, magic and equipment choices. Your identity, Species choices and dice record are kept.</p></section>`;
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
  const choices = availableVariants(R, s);
  if (!choices.length || (id && !choices.some((x) => x.id === id)))
    throw Error("This Career variant is unavailable.");
  const selected = choices.find((x) => R.selection.some((b) => b.id === x.id));
  if ((selected?.id || "") === id) return R;
  const next = assembleBooks(library, [
    ...R.selection
      .filter((b) => !choices.some((x) => b.id === x.id))
      .map((b) => b.id),
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
