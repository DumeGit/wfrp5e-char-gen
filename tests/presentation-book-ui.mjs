import * as source from "../src/features/player/presentation/book-ui.mjs";
import { presentation } from "./react-presentation.mjs";
export const bookPanel =
  typeof source.bookPanel === "function"
    ? presentation(source.bookPanel)
    : source.bookPanel;
export const tablePicker =
  typeof source.tablePicker === "function"
    ? presentation(source.tablePicker)
    : source.tablePicker;
export const bookSetup =
  typeof source.bookSetup === "function"
    ? presentation(source.bookSetup)
    : source.bookSetup;
