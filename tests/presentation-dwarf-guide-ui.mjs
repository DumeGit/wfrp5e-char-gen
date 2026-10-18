import * as source from "../src/features/player/presentation/dwarf-guide-ui.mjs";
import { presentation } from "./react-presentation.mjs";
export const runeShopRows =
  typeof source.runeShopRows === "function"
    ? presentation(source.runeShopRows)
    : source.runeShopRows;
export const dwarfOriginPanel =
  typeof source.dwarfOriginPanel === "function"
    ? presentation(source.dwarfOriginPanel)
    : source.dwarfOriginPanel;
