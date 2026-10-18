import * as source from "../src/features/player/presentation/features/experience-view.mjs";
import { presentation } from "./react-presentation.mjs";
export const createFeature =
  typeof source.createFeature === "function"
    ? presentation(source.createFeature)
    : source.createFeature;
