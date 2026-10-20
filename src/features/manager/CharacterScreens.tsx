import { useEffect, useState } from "react";
import { Field, Select } from "../marijan/fields";
import { EntryList } from "./EntryList";
import { score } from "../../engine/controls.mjs";
import { formatMoney } from "../../engine/market.mjs";
import type { Edit } from "./ui";

type Props = {
  record: any;
  result: any;
  catalogue: any;
  edit: Edit;
  open: (kind: string, values?: Record<string, any>) => void;
  advance: (group?: string, name?: string) => void;
  initialCategory?: string;
};
export function AbilitiesScreen(props: Props) {
  const [category, setCategory] = useState("skills"),
    [query, setQuery] = useState("");
  useEffect(() => {
    if (
      ["skills", "talents", "magic", "extras"].includes(
        props.initialCategory || "",
      )
    )
      setCategory(props.initialCategory!);
  }, [props.initialCategory]);
  return (
    <section>
      <div className="manager-page-heading">
        <div>
          <h2>Abilities</h2>
          <p className="manager-meta">
            Your known Skills, Talents and other abilities.
          </p>
        </div>
        <button type="button" className="quiet" onClick={() => props.advance()}>
          Learn or improve with XP
        </button>
      </div>
      <div
        className="manager-local-nav"
        role="group"
        aria-label="Ability categories"
      >
        {[
          ["skills", "Skills"],
          ["talents", "Talents"],
          ["magic", "Magic & Faith"],
          ["extras", "Other abilities"],
        ].map(([id, label]) => (
          <button
            className="quiet"
            key={id}
            type="button"
            aria-pressed={category === id}
            onClick={() => {
              setCategory(id);
              setQuery("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="manager-search">
        <Field
          id="skill-find"
          label="Find an owned ability"
          value={query}
          onValue={setQuery}
        />
      </div>
      <EntryList {...props} {...{ query, group: category }} />
      {category === "magic" && (
        <p className="manager-local-note">
          Casting and situational effects remain manual. Recording knowledge
          does not apply spell effects automatically.
        </p>
      )}
    </section>
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
    <section className="manager-gear-screen">
      <div className="manager-page-heading">
        <div>
          <h2>Gear</h2>
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
    </section>
  );
}
