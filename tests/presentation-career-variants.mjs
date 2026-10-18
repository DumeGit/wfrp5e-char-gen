import * as source from "../src/features/player/presentation/career-variants.mjs";
import { presentation } from "./react-presentation.mjs";
export const careerVariantPanel =
  typeof source.careerVariantPanel === "function"
    ? presentation(source.careerVariantPanel)
    : source.careerVariantPanel;
export const switchCareerVariant =
  typeof source.switchCareerVariant === "function"
    ? presentation(source.switchCareerVariant)
    : source.switchCareerVariant;
