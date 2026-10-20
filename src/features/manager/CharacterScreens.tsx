import { useState } from "react";
import { Field, Select } from "../marijan/fields";
import { EntryList } from "./EntryList";
import { score } from "../../engine/controls.mjs";
import { formatMoney } from "../../engine/market.mjs";
import type { Edit } from "./ui";
import { SheetCard } from "./SheetCard";

type Props = {
  record: any;
  result: any;
  catalogue: any;
  edit: Edit;
  open: (kind: string, values?: Record<string, any>) => void;
  reveal?: number;
};
export function AbilitySections(props: Props) {
  return (
    <div id="manager-abilities" className="manager-ability-sections">
      <div className="manager-abilities-grid">
        <EntryList {...props} group="skills" />
        <div className="manager-abilities-side">
          <EntryList {...props} reveal={0} group="talents" />
          <EntryList {...props} reveal={0} group="magic" />
          <EntryList
            {...props}
            reveal={0}
            group="extras"
            rows={props.result.entries.extras.filter(
              (row: any) => row.kind !== "mutation",
            )}
          />
        </div>
      </div>
    </div>
  );
}
export function GearScreen(props: Props) {
  const [place, setPlace] = useState("active"),
    [query, setQuery] = useState("");
  const money = props.record.sheet.coins;
  const rows = props.result.entries.gear.filter(
    (x: any) =>
      place === "all" ||
      (place === "active" ? x.state !== "stored" : x.state === place),
  );
  return (
    <SheetCard
      title="Gear"
      id="manager-gear"
      className="manager-gear-screen"
      reveal={props.reveal}
      count={rows.length}
    >
      <div className="manager-page-heading">
        <div>
          <p className="manager-meta">
            Enc {score(props.result.values.enc)} /{" "}
            {score(props.result.values.capacity)}
          </p>
        </div>
        <div className="manager-money">
          <strong>
            {score(money.gc)} gc <span>{score(money.ss)} ss</span>{" "}
            <span>{score(money.d)} d</span>
          </strong>
          <div className="manager-inline">
            <button
              type="button"
              className="quiet"
              onClick={() =>
                props.open("money", {
                  value: 0,
                  note: "",
                  direction: "receive",
                })
              }
            >
              Receive money
            </button>
            <button
              type="button"
              className="quiet"
              onClick={() =>
                props.open("money", { value: 0, note: "", direction: "spend" })
              }
            >
              Spend money
            </button>
          </div>
        </div>
      </div>
      <div className="manager-gear-filters">
        <Field
          id="gear-find"
          label="Find equipment"
          value={query}
          onValue={setQuery}
        />
        <Select
          id="gear-place"
          label="Location"
          value={place}
          options={[
            ["active", "With me"],
            ["equipped", "Equipped"],
            ["worn", "Worn"],
            ["stored", "Stored"],
            ["all", "All locations"],
          ]}
          onValue={setPlace}
        />
      </div>
      <EntryList {...props} group="gear" rows={rows} query={query} />
      <details className="manager-entry">
        <summary>
          <strong>Load and armour effects</strong>
        </summary>
        <p>
          {props.result.equipment.penalties.complete
            ? `Load-adjusted Movement ${score(props.result.equipment.penalties.movement)}; Agility ${score(props.result.equipment.penalties.agility)}. Armour modifiers: Stealth ${score(props.result.equipment.penalties.stealth)} SL; Perception ${score(props.result.equipment.penalties.perception)} SL.`
            : "Load effects remain unresolved while carried weights are unknown."}
        </p>
        <p className="manager-meta">
          Items are packed automatically. Stored belongings and coin weight are
          excluded. Removing an item does not refund its price.
        </p>
      </details>
    </SheetCard>
  );
}
