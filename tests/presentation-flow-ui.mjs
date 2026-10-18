import * as source from "../src/features/player/presentation/flow-ui.mjs";
import { presentation } from "./react-presentation.mjs";
export const careerBrowser =
  typeof source.careerBrowser === "function"
    ? presentation(source.careerBrowser)
    : source.careerBrowser;
export const comparisonHTML =
  typeof source.comparisonHTML === "function"
    ? presentation(source.comparisonHTML)
    : source.comparisonHTML;
