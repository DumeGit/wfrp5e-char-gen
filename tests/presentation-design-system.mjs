import * as source from "../src/features/player/presentation/design-system.mjs";
import { presentation } from "./react-presentation.mjs";
export const chapterHeading =
  typeof source.chapterHeading === "function"
    ? presentation(source.chapterHeading)
    : source.chapterHeading;
