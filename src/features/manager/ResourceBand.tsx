import { score } from "../../engine/controls.mjs";
import { changeResource } from "../../engine/manager/model.mjs";
import type { Edit } from "./ui";

type Props = {
  record: any;
  result: any;
  edit: Edit;
  open: (kind: string, values?: Record<string, any>) => void;
  disabled: boolean;
};
export function ResourceBand({ record, edit, open, disabled }: Props) {
  return (
    <fieldset
      className="manager-resource-band"
      disabled={disabled}
      aria-label="Fate and Fortune"
    >
      <legend className="manager-visually-hidden">Fate and Fortune</legend>
      <div className="manager-luck-pair">
        <button
          className="manager-luck-value"
          type="button"
          aria-label="Change Fate"
          title="Change permanent Fate"
          onClick={() => open("fate", { value: record.sheet.fate })}
        >
          <span>Fate</span>
          <strong>{score(record.sheet.fate)}</strong>
        </button>
        <button
          className="manager-luck-value"
          type="button"
          aria-label="Set current Fortune"
          title="Set current Fortune"
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
          className="manager-step"
          aria-label="Spend Fortune"
          title="Spend Fortune"
          disabled={record.current.fortune <= 0}
          onClick={() =>
            edit("Fortune spent", (r) =>
              changeResource(r, "fortune", Math.max(0, r.current.fortune - 1)),
            )
          }
        >
          −
        </button>
        <button
          type="button"
          className="manager-step"
          aria-label="Restore Fortune"
          title="Restore Fortune"
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
          +
        </button>
      </div>
    </fieldset>
  );
}
export function WoundsControl({ record, result, edit, open, disabled }: Props) {
  return (
    <fieldset
      className="manager-combat-wounds"
      disabled={disabled}
      aria-label="Current Wounds"
    >
      <legend className="manager-visually-hidden">Current Wounds</legend>
      <button
        type="button"
        className="manager-wounds-value"
        aria-label="Set Wounds"
        title="Set current Wounds"
        onClick={() =>
          open("resource", { key: "wounds", value: record.current.wounds ?? 0 })
        }
      >
        <span>Wounds</span>
        <strong>
          {score(record.current.wounds)}{" "}
          <small>/ {score(result.values.wounds)}</small>
        </strong>
      </button>
      <div className="manager-resource-actions">
        <button
          type="button"
          className="manager-step"
          aria-label="Lose one Wound"
          title="Lose one Wound"
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
          className="manager-step"
          aria-label="Recover one Wound"
          title="Recover one Wound"
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
    </fieldset>
  );
}
