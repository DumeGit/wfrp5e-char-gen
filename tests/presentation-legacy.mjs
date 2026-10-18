import * as source from "../src/features/player/presentation/legacy.mjs";
import { presentation } from "./react-presentation.mjs";
export const legacyTitle =
  typeof source.legacyTitle === "function"
    ? presentation(source.legacyTitle)
    : source.legacyTitle;
export const isLegacy =
  typeof source.isLegacy === "function"
    ? presentation(source.isLegacy)
    : source.isLegacy;
export const legacyTag =
  typeof source.legacyTag === "function"
    ? presentation(source.legacyTag)
    : source.legacyTag;
export const legacySources =
  typeof source.legacySources === "function"
    ? presentation(source.legacySources)
    : source.legacySources;
export const legacyMechanic =
  typeof source.legacyMechanic === "function"
    ? presentation(source.legacyMechanic)
    : source.legacyMechanic;
