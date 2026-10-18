import * as source from "../src/features/player/presentation/archives-iii-ui.mjs";
import { presentation } from "./react-presentation.mjs";
export const cantPanel =
  typeof source.cantPanel === "function"
    ? presentation(source.cantPanel)
    : source.cantPanel;
export const originTalentChoice =
  typeof source.originTalentChoice === "function"
    ? presentation(source.originTalentChoice)
    : source.originTalentChoice;
