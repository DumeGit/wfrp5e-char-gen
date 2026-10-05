import { defaultCareerResult } from "../dwarf-guide.mjs";
import * as M from "../rules.mjs";
import { randomTable, tableResult } from "../books.mjs";
import { clearCareerSelections } from "../career-variants.mjs";
import { startingScryer } from "../winds-of-magic.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function resetDependent() {
    let { s } = getContext();

    if (s.species !== "High Elf") delete s.highElf;
    else if (s.highElf) {
      s.highElf.history = [];
      s.highElf.era = "";
      delete s.highElf.careerVariant;
    }
    delete s.dwarfCareerUpdates;
    delete s.dwarfTrappingSwaps;
    delete s.grudgeTargets;
    if (s.species !== "Dwarf") {
      delete s.longbeard;
      delete s.longbeardAge;
    }
    delete s.college;
    delete s.psychometrySlot;
    delete s.careerRefinement;
    delete s.careerRefinements;
    delete s.regionalCareerBase;
    delete s.originTalentSlot;
    delete s.originTalentMode;
    delete s.cants;
    s.skillChoices = {};
    s.speciesSkills = [];
    s.careerSkills = {};
    s.talentChoices = {};
    s.randomTalents = [];
    s.freeTalent = "";
    s.dooming = "";
    s.bonusGear = [];
    s.gearChoices = {};
    s.gearRolls = {};
    s.wealth = null;
    s.purchases = [];
    s.gearState = {};
    s.coinStorage = "carried";
    s.localRegion = "";
    s.boost = {};
    s.ledger = [];
    s.spells = [];
  }

  function changeCareer(id, mode = "choose") {
    let { s, careerFilter } = getContext();

    if (s.highElf) delete s.highElf.careerVariant;
    delete s.college;
    if (startingScryer({ career: id })) delete s.psychometrySlot;
    delete s.careerRefinement;
    delete s.regionalCareerBase;
    s.career = id;
    s.careerMode = mode;
    clearCareerSelections(s);
    delete s.dwarfCareerUpdates;
    delete s.grudgeTargets;
    setContext("careerFilter", (careerFilter = "All classes"));
  }

  function rolledCareer() {
    let { R, s } = getContext();

    const table = randomTable(R, s, "career");
    if (!table)
      throw Error(
        "No printed Career roll table for this Species; choose a Career.",
      );
    const n = M.roll(s, "Career", 1, table.sides, table.page)[0];
    s.rolls.at(-1).source = table.source;
    s.careerAttempts++;
    return defaultCareerResult(R, tableResult(table, n));
  }
  return { resetDependent, changeCareer, rolledCareer };
}
