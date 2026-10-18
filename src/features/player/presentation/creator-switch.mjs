import { createElement } from "react";
import { ModeNavigation } from "../../../components/ModeNavigation";
export function creatorSwitch(active, verification = false) {
  return createElement(ModeNavigation, { mode: active, verify: verification });
}
