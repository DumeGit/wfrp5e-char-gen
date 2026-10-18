import * as source from "../src/features/player/presentation/controls.mjs";
import { presentation } from "./react-presentation.mjs";
export const field =
  typeof source.field === "function"
    ? presentation(source.field)
    : source.field;
export const select =
  typeof source.select === "function"
    ? presentation(source.select)
    : source.select;
export const tab =
  typeof source.tab === "function" ? presentation(source.tab) : source.tab;
export const score =
  typeof source.score === "function"
    ? presentation(source.score)
    : source.score;
export const esc =
  typeof source.esc === "function" ? presentation(source.esc) : source.esc;
