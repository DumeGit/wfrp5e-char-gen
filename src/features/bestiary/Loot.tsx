"use client";
import { useState } from "react";
import {
  LOOT_TABLES,
  LOOT_TIERS,
  MAX_LOOT_QUANTITY,
  lootName,
} from "../../engine/gm/loot.mjs";
import { equipmentConditions } from "../../engine/gm/equipment-conditions.mjs";
import {
  Button,
  ConditionReferences,
  Details,
  Input,
  Metadata,
  SectionHeading,
  Select,
  useBestiary,
} from "./controls";

export function LootSection() {
  const { draft, result, rules, edit, store, notify, remove } = useBestiary();
  const [tier, setTier] = useState("brass");
  const [error, setError] = useState("");
  const roll = () => {
    setError("");
    try {
      store.rollLoot(tier);
      notify("Loot added.");
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem));
    }
  };
  return (
    <section id="gm-loot" aria-labelledby="gm-loot-title">
      <SectionHeading>
        <span id="gm-loot-title">Loot</span>
      </SectionHeading>
      <div className="gm-loot-roll">
        <Select
          label="Loot category"
          id="gm-loot-tier"
          value={tier}
          options={Object.entries(LOOT_TIERS)}
          onChange={(value) => {
            setTier(value);
            setError("");
          }}
        />
        <Button onClick={roll}>Roll loot</Button>
      </div>
      <p className="gm-small">
        Roll to add loot straight to Gear. A result of 00 rolls twice more in
        the selected category. Loot stays unequipped.
      </p>
      {error && <p role="alert">{error}</p>}
      {!draft.loot.length && <p className="gm-small">No additional loot.</p>}
      {result.loot.map((row: any) => (
        <div
          className="gm-entry gm-loot-entry"
          id={`loot-${row.key}`}
          key={row.key}
        >
          <div>
            {row.entry ? (
              <Details
                id={`loot:${row.key}`}
                title={<strong>{lootName(row)}</strong>}
              >
                <Metadata entry={row.entry} />
              </Details>
            ) : (
              <strong>{lootName(row)}</strong>
            )}
            <ConditionReferences
              entries={equipmentConditions(rules, row.entry)}
            />
          </div>
          <div className="gm-loot-controls">
            <Input
              className="gm-rank"
              type="number"
              min="1"
              max={MAX_LOOT_QUANTITY}
              step="1"
              value={row.quantity}
              aria-label={`${lootName(row)} loot quantity`}
              onChange={(event) =>
                edit((d: any) => {
                  d.loot.find((x: any) => x.key === row.key).quantity =
                    Math.max(
                      1,
                      Math.min(
                        MAX_LOOT_QUANTITY,
                        Math.trunc(Number(event.target.value)) || 1,
                      ),
                    );
                }, `loot-quantity:${row.key}`)
              }
            />
            <Button
              aria-label={`Remove ${lootName(row)} loot`}
              onClick={() => remove(row.key)}
            >
              {"\u00d7"}
            </Button>
          </div>
        </div>
      ))}
      <Details
        id="loot:table"
        title={`View ${LOOT_TIERS[tier as keyof typeof LOOT_TIERS]} d100 loot table`}
      >
        <p className="gm-small">
          An original app table. Jewellery variants use the existing Jewellery
          entry.
        </p>
        <table className="gm-loot-table">
          <thead>
            <tr>
              <th scope="col">d100</th>
              <th scope="col">Loot</th>
            </tr>
          </thead>
          <tbody>
            {LOOT_TABLES[tier as keyof typeof LOOT_TABLES].map((row: any) => {
              const number = (n: number) =>
                n === 100 ? "00" : String(n).padStart(2, "0");
              return (
                <tr key={row.min}>
                  <td>
                    {number(row.min)}
                    {row.max !== row.min ? `–${number(row.max)}` : ""}
                  </td>
                  <td>{row.label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Details>
    </section>
  );
}
