import * as source from "../src/features/player/presentation/archives-ui.mjs";
import { presentation } from "./react-presentation.mjs";
export const speciesRulePanel =
  typeof source.speciesRulePanel === "function"
    ? presentation(source.speciesRulePanel)
    : source.speciesRulePanel;
