import * as source from "../src/features/player/presentation/source-controls.mjs";
import { presentation } from "./react-presentation.mjs";
export const sourceButton =
  typeof source.sourceButton === "function"
    ? presentation(source.sourceButton)
    : source.sourceButton;
