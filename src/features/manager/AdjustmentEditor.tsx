import { Field, Select } from "../marijan/fields";
import { KEYS } from "../../engine/rules.mjs";
import { score } from "../../engine/controls.mjs";
import { AUTO_FIELDS } from "../../engine/marijan/model.mjs";
import { LABELS } from "../../engine/marijan/labels.mjs";
import type { Edit } from "./ui";
export function AdjustmentEditor({
  record,
  result,
  catalogue,
  edit,
  changeFate,
}: {
  record: any;
  result: any;
  catalogue: any;
  edit: Edit;
  changeFate: () => void;
}) {
  const sheet = record.sheet;
  return (
    <section className="manager-adjustments">
      <p>
        Direct adjustments are available to every character and recorded
        separately from XP purchases. Existing current resources are retained
        when maximums change.
      </p>
      <details className="manager-entry" open>
        <summary>
          <strong>Identity and Career</strong>
        </summary>
        <div className="manager-grid manager-form">
          <Field
            id="manager-species"
            label="Species"
            value={sheet.species}
            onValue={(value) =>
              edit("Adjusted Species", (r) => {
                r.sheet.species = value;
              })
            }
          />
          <Select
            id="manager-career-adjust"
            label="Career (GM adjustment)"
            value={sheet.career}
            options={[
              ["", "No Career"],
              ...catalogue.careers.map((c: any) => [
                c.contentId || c.id,
                `${c.name} · ${c.source.book}`,
              ]),
            ]}
            onValue={(value) =>
              edit("Adjusted Career", (r) => {
                r.sheet.career = value;
              })
            }
          />
          <Field
            id="manager-level"
            label="Career level"
            numeric
            value={sheet.level}
            onValue={(value) =>
              edit("Adjusted Career level", (r) => {
                if (!Number.isInteger(value) || value < 1)
                  throw Error("Enter a positive Career level.");
                r.sheet.level = value;
              })
            }
          />
          <Field
            id="manager-tracker"
            label="Career tracker boxes"
            numeric
            value={sheet.tracker}
            onValue={(value) =>
              edit("Adjusted tracker", (r) => {
                if (!Number.isInteger(value) || value < 0 || value > 36)
                  throw Error("Enter 0–36 tracker boxes.");
                r.sheet.tracker = value;
              })
            }
          />
        </div>
      </details>
      <details className="manager-entry">
        <summary>
          <strong>Characteristics</strong>
        </summary>
        <div className="manager-grid manager-form">
          {KEYS.map((key: string) => (
            <div key={key}>
              <Field
                id={`initial-${key}`}
                label={`${key} initial`}
                numeric
                value={sheet.characteristics[key].initial}
                onValue={(value) =>
                  edit(`Adjusted ${key} initial`, (r) => {
                    r.sheet.characteristics[key].initial = value;
                  })
                }
              />
              <Field
                id={`advances-${key}`}
                label={`${key} Advances`}
                numeric
                value={sheet.characteristics[key].advances}
                onValue={(value) =>
                  edit(`Adjusted ${key} Advances`, (r) => {
                    if (!Number.isInteger(value) || value < 0)
                      throw Error(
                        "Advances must be a non-negative whole number.",
                      );
                    r.sheet.characteristics[key].advances = value;
                  })
                }
              />
              <Field
                id={`modifier-${key}`}
                label={`${key} modifier`}
                numeric
                value={sheet.characteristics[key].modifier}
                onValue={(value) =>
                  edit(`Adjusted ${key} modifier`, (r) => {
                    r.sheet.characteristics[key].modifier = value;
                  })
                }
              />
            </div>
          ))}
        </div>
      </details>
      <details className="manager-entry">
        <summary>
          <strong>Resource maximums and calculations</strong>
        </summary>
        <button className="quiet" type="button" onClick={changeFate}>
          Change Fate
        </button>
        <div className="manager-grid manager-form">
          <Field
            id="max-fortune"
            label="Maximum Fortune"
            numeric
            value={sheet.fortune}
            onValue={(value) =>
              edit("Adjusted maximum Fortune", (r) => {
                if (value < 0) throw Error("Fortune cannot be negative.");
                r.sheet.fortune = value;
              })
            }
          />
          <Select
            id="manager-size"
            label="Size"
            value={sheet.size}
            options={[
              "Tiny",
              "Small",
              "Average",
              "Large",
              "Enormous",
              "Monstrous",
            ]}
            onValue={(value) =>
              edit("Adjusted Size", (r) => {
                r.sheet.size = value;
              })
            }
          />
          {AUTO_FIELDS.map((key: string) => (
            <Field
              key={key}
              id={`override-${key}`}
              label={`${(LABELS as any)[key]} override (blank = ${score(result.auto[key])}${record.adjustments[key] ? ` + ${record.adjustments[key]} adjustment` : ""})`}
              numeric
              nullable
              value={sheet.overrides[key]}
              onValue={(value) =>
                edit(`Adjusted ${(LABELS as any)[key]}`, (r) => {
                  r.sheet.overrides[key] = value;
                })
              }
            />
          ))}
        </div>
      </details>
      <details className="manager-entry">
        <summary>
          <strong>Money, XP and other balances</strong>
        </summary>
        <div className="manager-grid manager-form">
          {[
            ["gc", "Gold crowns"],
            ["ss", "Silver shillings"],
            ["d", "Brass pennies"],
          ].map(([key, label]) => (
            <Field
              key={key}
              id={`coins-${key}`}
              label={label}
              numeric
              value={sheet.coins[key]}
              onValue={(value) =>
                edit(`Adjusted ${label}`, (r) => {
                  if (!Number.isInteger(value) || value < 0)
                    throw Error("Enter non-negative whole coins.");
                  r.sheet.coins[key] = value;
                })
              }
            />
          ))}
          <Field
            id="xp-unspent"
            label="Available XP (adjustment)"
            numeric
            value={sheet.xpUnspent}
            onValue={(value) =>
              edit("Adjusted available XP", (r) => {
                r.sheet.xpUnspent = value;
              })
            }
          />
          <Field
            id="xp-spent"
            label="Spent XP (adjustment)"
            numeric
            value={sheet.xpSpent}
            onValue={(value) =>
              edit("Adjusted spent XP", (r) => {
                r.sheet.xpSpent = value;
              })
            }
          />
          <Field
            id="corruption"
            label="Corruption"
            numeric
            value={sheet.corruption}
            onValue={(value) =>
              edit("Adjusted Corruption", (r) => {
                r.sheet.corruption = value;
              })
            }
          />
          <Field
            id="sin"
            label="Sin"
            numeric
            value={sheet.sin}
            onValue={(value) =>
              edit("Adjusted Sin", (r) => {
                r.sheet.sin = value;
              })
            }
          />
        </div>
      </details>
    </section>
  );
}
