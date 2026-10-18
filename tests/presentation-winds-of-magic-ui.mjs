import * as source from "../src/features/player/presentation/winds-of-magic-ui.mjs";
import { presentation } from "./react-presentation.mjs";
export const collegePanel =
  typeof source.collegePanel === "function"
    ? presentation(source.collegePanel)
    : source.collegePanel;
export const psychometryPanel =
  typeof source.psychometryPanel === "function"
    ? presentation(source.psychometryPanel)
    : source.psychometryPanel;
export const ritualShop =
  typeof source.ritualShop === "function"
    ? presentation(source.ritualShop)
    : source.ritualShop;
export const womGearPanel =
  typeof source.womGearPanel === "function"
    ? presentation(source.womGearPanel)
    : source.womGearPanel;
export const pettyGrantNote =
  typeof source.pettyGrantNote === "function"
    ? presentation(source.pettyGrantNote)
    : source.pettyGrantNote;
