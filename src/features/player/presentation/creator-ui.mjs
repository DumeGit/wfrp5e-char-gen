import {
  element,
  fragment,
  attributes,
  joinNodes,
  combine,
  interpolate,
} from "../../../components/react-elements";
import {
  equipment,
  gearSlots,
  resolvedGearName,
} from "../../../engine/equipment.mjs";
import { derive } from "../../../engine/rules.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const fmt = (n) =>
  Number.isFinite(n) ? Number(n.toFixed(3)).toLocaleString() : "?";
export function penaltySummary(R, s, snapshot = null) {
  const e = snapshot?.equipment || equipment(R, s),
    d = snapshot?.derived || derive(R, s),
    p = e.penalties,
    modifiers = [
      ...(p.stealth ? [interpolate(["Stealth ", " SL"], [p.stealth])] : []),
      ...(p.perception
        ? [interpolate(["Perception ", " SL"], [p.perception])]
        : []),
      ...Object.entries(
        d.talents.some((t) =>
          /^(Arcane Magic|Chaos Magic|Petty Magic|Witch!)/.test(t),
        )
          ? p.casting
          : {},
      )
        .filter(([, v]) => v)
        .map(([l, v]) =>
          interpolate(["Casting / Channelling ", " SL · ", ""], [v, l]),
        ),
    ];
  return element(
    "section",
    { class: "load-summary", "aria-label": "Starting equipment effects" },
    element("h3", {}, "Equipment totals"),
    "\n",
    element(
      "div",
      { class: "load-totals" },
      element(
        "div",
        {},
        element("span", {}, p.complete ? "Carried Enc" : "Known Enc subtotal"),
        element("strong", {}, fmt(e.total), " / ", d.capacity),
      ),
      "\n",
      element(
        "div",
        {},
        element("span", {}, "Movement with load"),
        element(
          "strong",
          {},
          p.complete ? (p.immobile ? "Cannot move" : p.movement) : "Unresolved",
        ),
      ),
      "\n",
      element(
        "div",
        {},
        element("span", {}, "Agility with load"),
        element("strong", {}, p.complete ? p.agility : "Unresolved"),
      ),
      "\n",
    ),
    "\n",
    element(
      "p",
      { class: "small muted" },
      "Armour and carrying bags are worn, weapons equipped, and other belongings packed automatically. Overflow is carried separately. Coin weight is ignored.",
    ),
    p.complete && p.band
      ? element(
          "p",
          { class: "packing-warning" },
          p.immobile
            ? "Unable to move under this load"
            : interpolate(
                [
                  "Overburdened · +",
                  " Travel Fatigue after a day’s travel; Endurance Tests to resist fatigue have Disadvantage",
                ],
                [p.travelFatigue],
              ),
          " (p. 299).",
        )
      : "",
    modifiers.length
      ? element(
          "div",
          { class: "equipment-modifiers" },
          joinNodes(
            modifiers.map((x) => element("span", {}, esc(x))),
            "",
          ),
        )
      : "",
    joinNodes(
      e.warnings.map((w) => element("p", { class: "packing-warning" }, esc(w))),
      "",
    ),
    e.assumedZero.length
      ? element(
          "p",
          { class: "small muted" },
          "Unlisted weights count as 0 Enc: ",
          esc(joinNodes(e.assumedZero, "; ")),
          ".",
        )
      : "",
    e.unresolved.length
      ? element(
          "p",
          { class: "packing-warning" },
          "Roll unresolved equipment quantities in Gear to calculate final Encumbrance.",
        )
      : "",
  );
}
export function acquisitionChoices(R, s) {
  return gearSlots(R, s).map((x) => [
    x.key,
    interpolate(["", " · ", ""], [resolvedGearName(s, x, R), x.origin]),
  ]);
}
