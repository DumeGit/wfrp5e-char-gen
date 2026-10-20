import { score } from "../../engine/controls.mjs";
import { changeResource } from "../../engine/manager/model.mjs";
import type { Edit } from "./ui";

export function ResourceBand({
  record,
  result,
  edit,
  open,
  disabled,
}: {
  record: any;
  result: any;
  edit: Edit;
  open: (kind: string, values?: Record<string, any>) => void;
  disabled: boolean;
}) {
  return (
    <fieldset
      className="manager-resource-band"
      disabled={disabled}
      aria-label="Current resources"
    >
      <legend className="manager-visually-hidden">Current resources</legend>
      <div className="manager-resource">
        <div className="manager-resource-value">
          <span>Wounds</span>
          <strong>
            {score(record.current.wounds)}{" "}
            <small>/ {score(result.values.wounds)}</small>
          </strong>
        </div>
        <div className="manager-resource-actions">
          <button
            type="button"
            className="quiet manager-step"
            aria-label="Lose one Wound"
            disabled={
              record.current.wounds === null || record.current.wounds <= 0
            }
            onClick={() =>
              edit("Wounds changed", (r) =>
                changeResource(r, "wounds", Math.max(0, r.current.wounds - 1)),
              )
            }
          >
            −
          </button>
          <button
            type="button"
            className="quiet"
            aria-label="Set Wounds"
            onClick={() =>
              open("resource", {
                key: "wounds",
                value: record.current.wounds ?? 0,
              })
            }
          >
            Set
          </button>
          <button
            type="button"
            className="quiet manager-step"
            aria-label="Recover one Wound"
            disabled={
              result.values.wounds === null ||
              record.current.wounds >= result.values.wounds
            }
            onClick={() =>
              edit("Wounds changed", (r) =>
                changeResource(
                  r,
                  "wounds",
                  Math.min(result.values.wounds, (r.current.wounds ?? 0) + 1),
                ),
              )
            }
          >
            +
          </button>
        </div>
      </div>
      <div className="manager-resource">
        <div className="manager-resource-value">
          <button
            type="button"
            className="manager-resource-value-button"
            aria-label="Set current Fortune"
            onClick={() =>
              open("resource", {
                key: "fortune",
                value: record.current.fortune ?? 0,
              })
            }
          >
            <span>Fortune</span>
            <strong>
              {score(record.current.fortune)}{" "}
              <small>/ {score(record.sheet.fortune)}</small>
            </strong>
          </button>
        </div>
        <div className="manager-resource-actions">
          <button
            type="button"
            className="manager-primary"
            aria-label="Spend Fortune"
            disabled={record.current.fortune <= 0}
            onClick={() =>
              edit("Fortune spent", (r) =>
                changeResource(
                  r,
                  "fortune",
                  Math.max(0, r.current.fortune - 1),
                ),
              )
            }
          >
            Spend
          </button>
          <button
            type="button"
            className="quiet"
            aria-label="Restore Fortune"
            disabled={record.current.fortune >= record.sheet.fortune}
            onClick={() =>
              edit("Fortune restored", (r) =>
                changeResource(
                  r,
                  "fortune",
                  Math.min(r.sheet.fortune, r.current.fortune + 1),
                ),
              )
            }
          >
            Restore
          </button>
        </div>
      </div>
    </fieldset>
  );
}
