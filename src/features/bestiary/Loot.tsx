"use client";
import { useState } from "react";
import {
  LOOT_TABLE,
  MAX_LOOT_QUANTITY,
  lootName,
} from "../../engine/gm/loot.mjs";
import {
  Button,
  Details,
  Input,
  Metadata,
  SectionHeading,
  useBestiary,
} from "./controls";

export function LootSection() {
  const { draft, result, edit, store, notify, remove } = useBestiary();
  const [error, setError] = useState("");
  const roll = () => {
    setError("");
    try {
      store.rollLoot();
      notify("Loot added.");
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem));
    }
  };
  return (
    <section id="gm-loot" aria-labelledby="gm-loot-title">
      <SectionHeading action={roll} label="Roll loot">
        <span id="gm-loot-title">Loot</span>
      </SectionHeading>
      <p className="gm-small">
        Roll to add loot straight to Gear. A result of 00 automatically rolls
        two loot results. Loot stays unequipped.
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
      <Details id="loot:table" title="View d100 loot table">
        <p className="gm-small">
          An original table for this app. Item details use the existing book
          entries. No treasure values or magical properties are added.
        </p>
        <table className="gm-loot-table">
          <thead>
            <tr>
              <th scope="col">d100</th>
              <th scope="col">Loot</th>
            </tr>
          </thead>
          <tbody>
            {LOOT_TABLE.map((row: any) => {
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
