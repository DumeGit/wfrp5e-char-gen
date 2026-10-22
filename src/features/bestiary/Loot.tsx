"use client";
import { useState } from "react";
import {
  LOOT_TABLE,
  MAX_LOOT_QUANTITY,
  defaultLootLocation,
  lootLocation,
  lootName,
  lootText,
  resolveGMLoot,
} from "../../engine/gm/loot.mjs";
import {
  Button,
  Details,
  Input,
  Metadata,
  Modal,
  SectionHeading,
  Select,
  useBestiary,
} from "./controls";

export function LootSection() {
  const { draft, result, edit, setModal, remove } = useBestiary();
  return (
    <section id="gm-loot" aria-labelledby="gm-loot-title">
      <SectionHeading
        action={() => setModal({ kind: "loot" })}
        label="Roll loot"
      >
        <span id="gm-loot-title">Loot</span>
      </SectionHeading>
      <p className="gm-small">
        Extra possessions or a lair cache. Preview a roll before adding it; loot
        appears under Gear and stays separate from equipped items.
      </p>
      {!draft.loot.length && <p className="gm-small">No additional loot.</p>}
      {result.loot.map((row: any) => (
        <div
          className="gm-entry gm-loot-entry"
          id={`loot-${row.key}`}
          key={row.key}
        >
          <div>
            <Details
              id={`loot:${row.key}`}
              title={
                <>
                  <strong>{lootName(row)}</strong>
                  <small className="gm-small">
                    {lootLocation(row.location)}
                  </small>
                </>
              }
            >
              <Select
                label="Location"
                aria-label={`${lootName(row)} loot location`}
                id={`loot-location-${row.key}`}
                value={row.location}
                options={[
                  ["carried", "Carried loot"],
                  ["lair", "Lair loot"],
                ]}
                onChange={(value) =>
                  edit((d: any) => {
                    d.loot.find((x: any) => x.key === row.key).location = value;
                  })
                }
              />
              {row.entry && <Metadata entry={row.entry} />}
              <p className="gm-small">
                Not equipped. Attacks and protection are unchanged.
              </p>
            </Details>
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
              ×
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
}

export function LootDialog() {
  const { store, rules, draft, result, setModal, notify } = useBestiary();
  const [location, setLocation] = useState(defaultLootLocation(result.profile));
  const [count, setCount] = useState(1);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState("");
  const close = () => {
    setModal(null);
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLButtonElement>("#gm-loot .gm-section-heading button")
        ?.focus(),
    );
  };
  const current = preview && preview.draft === draft;
  const rows = preview ? resolveGMLoot(rules, preview.entries) : [];
  const roll = () => {
    setError("");
    try {
      const next = store.rollLoot({ location, count });
      setPreview(next);
      setError(next.error);
    } catch (problem) {
      setPreview(null);
      setError(problem instanceof Error ? problem.message : String(problem));
    }
  };
  return (
    <Modal title="Roll loot" close={close} className="gm-loot-dialog">
      <p className="gm-small">
        Choose where the loot is found, then roll. Nothing is added until you
        choose Add loot.
      </p>
      <div className="gm-loot-options">
        <Select
          label="Loot location"
          id="gm-loot-location"
          options={[
            ["carried", "Carried loot"],
            ["lair", "Lair loot"],
          ]}
          value={location}
          onChange={(value) => {
            setLocation(value);
            setPreview(null);
            setError("");
          }}
        />
        <Select
          label="Number of rolls"
          id="gm-loot-count"
          options={[
            [1, "1 roll"],
            [2, "2 rolls"],
            [3, "3 rolls"],
          ]}
          value={count}
          onChange={(value) => {
            setCount(Number(value));
            setPreview(null);
            setError("");
          }}
        />
      </div>
      <div
        className="gm-loot-preview"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {preview ? (
          <>
            <h3>{lootLocation(location)} preview</h3>
            {rows.length > 0 && (
              <ul>
                {rows.map((row: any, index: number) => (
                  <li key={index}>{lootText(row)}</li>
                ))}
              </ul>
            )}
            {!current && (
              <p>
                The creature changed. Roll a fresh preview before adding loot.
              </p>
            )}
          </>
        ) : (
          <p>Your rolled loot will appear here.</p>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="gm-dialog-actions">
        <Button onClick={roll}>{preview ? "Reroll" : "Roll loot"}</Button>
        <Button
          className="primary"
          disabled={!current || !!error || !rows.length}
          onClick={() => {
            try {
              store.addLoot(preview);
              notify("Loot added.");
              close();
            } catch (problem) {
              setError(
                problem instanceof Error ? problem.message : String(problem),
              );
            }
          }}
        >
          Add loot
        </Button>
      </div>
      {preview && (
        <Details
          id="loot:preview-dice"
          title={`Roll details · ${preview.rolls.length}`}
        >
          <ol className="gm-roll-list">
            {preview.rolls.map((record: any, index: number) => (
              <li key={index}>
                <strong>{record.label}</strong> {record.faces.join(" + ")} ={" "}
                {record.total === 100 && record.sides === 100
                  ? "00"
                  : record.total}
              </li>
            ))}
          </ol>
          <p className="gm-small">
            Dice remain in Recorded dice, including rerolls and previews you do
            not add.
          </p>
        </Details>
      )}
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
    </Modal>
  );
}
