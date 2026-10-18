import * as source from "../src/features/player/presentation/review-sheet.mjs";
import { presentation } from "./react-presentation.mjs";
export const reviewSheet =
  typeof source.reviewSheet === "function"
    ? presentation(source.reviewSheet)
    : source.reviewSheet;
