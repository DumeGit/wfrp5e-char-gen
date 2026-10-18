import * as source from "../src/features/player/presentation/high-elf-ui.mjs";
import { presentation } from "./react-presentation.mjs";
export const elfOriginPanel =
  typeof source.elfOriginPanel === "function"
    ? presentation(source.elfOriginPanel)
    : source.elfOriginPanel;
export const elfSkillsPanel =
  typeof source.elfSkillsPanel === "function"
    ? presentation(source.elfSkillsPanel)
    : source.elfSkillsPanel;
export const elfMagicShop =
  typeof source.elfMagicShop === "function"
    ? presentation(source.elfMagicShop)
    : source.elfMagicShop;
export const elfCareerPanel =
  typeof source.elfCareerPanel === "function"
    ? presentation(source.elfCareerPanel)
    : source.elfCareerPanel;
