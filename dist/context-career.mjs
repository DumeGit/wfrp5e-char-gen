import { effectiveCareer as dwarfCareer } from "./dwarf-guide.mjs";
import { highElfCareer } from "./high-elf.mjs";
// Species/origin context is shared by advancement, inventory, UI and exports.
export const effectiveCareer = (R, s) => highElfCareer(R, s, dwarfCareer(R, s));
