import { effectiveCareer as dwarfCareer } from "./dwarf-guide.mjs";
import { highElfCareer } from "./high-elf.mjs";
// Species/origin context is shared by advancement, inventory, UI and exports.
// An unfinished draft has no Career grants, Class kit or advancement scheme.
const unselectedCareer = {
  id: "",
  name: "Choose a Career",
  class: "",
  species: [],
  advanceScheme: {},
  levels: Array.from({ length: 4 }, (_, i) => ({
    level: i + 1,
    name: "",
    status: "",
    standing: "",
    skills: [],
    talents: [],
    trappings: [],
  })),
};
export function effectiveCareer(R, s) {
  return s.career === ""
    ? unselectedCareer
    : highElfCareer(R, s, dwarfCareer(R, s));
}
