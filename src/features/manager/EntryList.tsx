import { Field, Select } from "../marijan/fields";
import { requestReference } from "../../services/content";
import { score } from "../../engine/controls.mjs";
import { addEntry } from "../../engine/marijan/model.mjs";
import {
  entryDescription,
  entrySource,
} from "../../engine/marijan/catalogue.mjs";
import type { Edit } from "./ui";

export const GROUP_NAMES: Record<string, string> = {
  skills: "Skills",
  talents: "Talents",
  gear: "Equipment",
  magic: "Magic & Faith",
  extras: "Other abilities",
};

export function EntryList({
  catalogue,
  record,
  result,
  group,
  query = "",
  rows,
  edit,
  open,
  compact = false,
  advance,
}: {
  catalogue: any;
  record: any;
  result: any;
  group: string;
  query?: string;
  rows?: any[];
  edit: Edit;
  open: (kind: string, values?: Record<string, any>) => void;
  compact?: boolean;
  advance?: (group?: string, name?: string) => void;
}) {
  const sheet = record.sheet;
  const entries = (
    rows || (group === "skills" ? result.skills : result.entries[group])
  ).filter((x: any) =>
    `${x.name} ${x.text || ""}`.toLowerCase().includes(query.toLowerCase()),
  );
  function withRow(r: any, x: any, change: (row: any) => void) {
    let row = r.sheet.entries[group].find((e: any) => e.key === x.key);
    if (!row && x.reference) {
      const key = addEntry(
        r.sheet,
        group,
        catalogue.rows.find((e: any) => e.id === x.id),
      );
      row = r.sheet.entries[group].find((e: any) => e.key === key);
    }
    if (row) change(row);
  }
  return (
    <section
      className="manager-entry-list"
      data-group={group}
      aria-label={GROUP_NAMES[group]}
    >
      {!compact && (
        <div className="manager-section-heading">
          <h3>
            {GROUP_NAMES[group]}{" "}
            <span className="manager-entry-count">{entries.length}</span>
          </h3>
          <button
            className={group === "gear" ? "manager-primary" : "quiet"}
            type="button"
            onClick={() =>
              open(group === "gear" ? "acquire" : "entry", {
                group,
                amount: 1,
                name: "",
                id: "",
                note: "",
                custom: false,
                char: "Int",
              })
            }
          >
            {group === "gear"
              ? "Acquire equipment"
              : `Add ${group === "extras" ? "reference" : group === "magic" ? "spell / prayer" : group.slice(0, -1)}${group === "gear" ? "" : " (adjustment)"}`}
          </button>
        </div>
      )}
      {!entries.length && (
        <p className="manager-empty-line">
          {query
            ? "No matching entries. Try another search."
            : "No entries recorded."}
        </p>
      )}
      <div className="manager-entry-items">
        {entries.map((x: any) => (
          <div className="manager-entry-row" key={x.key}>
            <details className="manager-entry">
              <summary>
                <strong>
                  <span className="manager-entry-name">{x.name}</span>
                  {group === "skills" && (
                    <small
                      className="manager-skill-characteristic"
                      title={`Linked Characteristic: ${x.char}`}
                    >
                      {" "}
                      {x.char}
                    </small>
                  )}
                  {group === "gear" && (
                    <span className="manager-entry-subtitle">
                      {x.state || "carried"} · Enc{" "}
                      {x.enc === null || x.enc === undefined
                        ? "Unknown"
                        : score(x.enc)}{" "}
                      each
                    </span>
                  )}
                </strong>
                <span className="manager-entry-total">
                  {group === "skills"
                    ? score(x.total)
                    : ["talents", "gear"].includes(group)
                      ? `×${score(x.amount)}`
                      : x.kind}
                </span>
              </summary>
              <div className="manager-entry-content">
                <p>
                  {entryDescription(catalogue, x) || "No description recorded."}
                </p>
                {x.source && (
                  <button
                    className="manager-text"
                    type="button"
                    onClick={() =>
                      requestReference({ name: x.name, book: x.source.book })
                    }
                  >
                    {entrySource(catalogue, x)}
                  </button>
                )}
                {x.adaptation && (
                  <p className="manager-notice">
                    Legacy:{" "}
                    {typeof x.adaptation === "string"
                      ? x.adaptation
                      : x.adaptation.text ||
                        "Reviewed adaptation; open the source reference for details."}
                  </p>
                )}
                {group === "skills" && (
                  <p className="manager-meta">
                    {x.char} {score(result.stats[x.char])} + {score(x.amount)}{" "}
                    Advances
                    {x.total !== result.stats[x.char] + x.amount
                      ? " · adjusted total"
                      : ""}
                  </p>
                )}
                {!compact && group === "gear" && (
                  <div className="manager-form manager-gear-editor">
                    <p className="manager-meta">
                      Enc{" "}
                      {x.enc === null || x.enc === undefined
                        ? "Unknown"
                        : score(x.enc)}{" "}
                      per item
                      {x.kind === "weapon"
                        ? ` · Damage ${x.damage || "—"} · ${x.qualities || "No listed properties"}`
                        : x.kind === "armour"
                          ? ` · AP ${score(x.ap)} · ${x.locations}`
                          : ""}
                    </p>
                    <Select
                      id={`state-${x.key}`}
                      label="Equipment placement"
                      value={x.state}
                      options={["equipped", "worn", "carried", "stored"]}
                      onValue={(value) =>
                        edit(`Moved ${x.name}: ${value}`, (r) =>
                          withRow(r, x, (row) => {
                            row.state = value;
                          }),
                        )
                      }
                    />
                    <Field
                      id={`amount-${x.key}`}
                      label="Quantity"
                      numeric
                      value={x.amount}
                      onValue={(value) =>
                        edit(`Adjusted ${x.name}`, (r) => {
                          if (!Number.isSafeInteger(value) || value < 0)
                            throw Error("Enter a non-negative whole number.");
                          withRow(r, x, (row) => {
                            row.amount = value;
                          });
                        })
                      }
                    />
                    <p className="manager-meta">
                      Packing is automatic. Stored belongings and coin weight
                      are excluded from load.
                    </p>
                  </div>
                )}
                {!compact && group !== "gear" && (
                  <>
                    {advance && ["skills", "talents"].includes(group) && (
                      <button
                        type="button"
                        className="quiet"
                        onClick={() => advance(group, x.name)}
                      >
                        Improve with XP
                      </button>
                    )}
                    <details className="manager-adjust-entry">
                      <summary>Adjust this entry</summary>
                      <p className="manager-meta">
                        Manual changes are recorded without an XP charge.
                      </p>
                      {["skills", "talents"].includes(group) && (
                        <Field
                          id={`amount-${x.key}`}
                          label={
                            group === "skills"
                              ? "Advances (GM adjustment; no XP charge)"
                              : "Ranks (GM adjustment; no XP charge)"
                          }
                          numeric
                          value={x.amount}
                          onValue={(value) =>
                            edit(
                              `Adjusted ${x.name}`,
                              (r) => {
                                if (!Number.isSafeInteger(value) || value < 0)
                                  throw Error(
                                    "Enter a non-negative whole number.",
                                  );
                                withRow(r, x, (row) => {
                                  if (row.total !== null && group === "skills")
                                    row.total += value - row.amount;
                                  row.amount = value;
                                });
                              },
                              "Recorded manual adjustment; no XP charged.",
                            )
                          }
                        />
                      )}
                      {group === "skills" && (
                        <Field
                          id={`total-${x.key}`}
                          label="Manual Skill total (blank uses calculation)"
                          numeric
                          nullable
                          value={
                            sheet.entries.skills.find(
                              (e: any) => e.key === x.key,
                            )?.total ?? null
                          }
                          onValue={(value) =>
                            edit(`Adjusted ${x.name} total`, (r) =>
                              withRow(r, x, (row) => {
                                row.total = value;
                              }),
                            )
                          }
                        />
                      )}
                      {group === "magic" && x.kind === "spell" && (
                        <Select
                          id={`learned-with-${x.key}`}
                          label="Learning Talent / Lore"
                          value={x.learnedWith || ""}
                          options={[
                            ["", "Not recorded"],
                            ...result.derived.talents.filter((name: string) =>
                              /^(Arcane Magic|Invoke|Bless|Petty Magic|Witch!|High Magic)/.test(
                                name,
                              ),
                            ),
                          ]}
                          onValue={(value) =>
                            edit(`Recorded learning Lore for ${x.name}`, (r) =>
                              withRow(r, x, (row) => {
                                row.learnedWith = value;
                              }),
                            )
                          }
                        />
                      )}
                      {!x.reference && (
                        <button
                          className="manager-danger-text"
                          type="button"
                          onClick={() =>
                            edit(
                              `Removed ${x.name}`,
                              (r) => {
                                r.sheet.entries[group] = r.sheet.entries[
                                  group
                                ].filter((e: any) => e.key !== x.key);
                              },
                              "Removed entry without an XP refund. Use Undo to restore it.",
                            )
                          }
                        >
                          Remove entry
                        </button>
                      )}
                    </details>
                  </>
                )}
                {!compact && group === "gear" && (
                  <button
                    className="manager-danger-text"
                    type="button"
                    onClick={() =>
                      edit(
                        `Removed ${x.name}`,
                        (r) => {
                          r.sheet.entries.gear = r.sheet.entries.gear.filter(
                            (e: any) => e.key !== x.key,
                          );
                        },
                        "No money refunded. Use Undo to restore it.",
                      )
                    }
                  >
                    Remove item
                  </button>
                )}
              </div>
            </details>
            {group !== "gear" && (
              <button
                className="manager-favourite"
                type="button"
                aria-label={`${x.favourite ? "Remove" : "Add"} ${x.name} ${x.favourite ? "from" : "to"} favourites`}
                aria-pressed={!!x.favourite}
                onClick={() =>
                  edit(
                    `${x.favourite ? "Unpinned" : "Pinned"} ${x.name}`,
                    (r) =>
                      withRow(r, x, (row) => {
                        row.favourite = !row.favourite;
                      }),
                  )
                }
              >
                {x.favourite ? "★" : "☆"}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
