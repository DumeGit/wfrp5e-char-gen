import { score } from "../../engine/controls.mjs";
import { changeFate, changeResource } from "../../engine/manager/model.mjs";
import type { Edit } from "./ui";

type Props = { record: any; result: any; edit: Edit; disabled: boolean };
export function ResourceBand({ record, edit, disabled }: Props) {
  return (
    <fieldset
      className="manager-resource-band"
      disabled={disabled}
      aria-label="Fate and Fortune"
    >
      <legend className="manager-visually-hidden">Fate and Fortune</legend>
      <div className="manager-luck-pair">
        <ResourceStepper
          label="Fate"
          value={record.sheet.fate}
          decrease="Decrease Fate"
          increase="Increase Fate"
          change={(value) => edit("Fate changed", (r) => changeFate(r, value))}
        />
        <ResourceStepper
          label="Fortune"
          value={record.current.fortune}
          max={record.sheet.fortune}
          decrease="Spend Fortune"
          increase="Restore Fortune"
          change={(value) =>
            edit("Fortune changed", (r) => changeResource(r, "fortune", value))
          }
        />
      </div>
    </fieldset>
  );
}
function ResourceStepper({
  label,
  value,
  max,
  change,
  decrease,
  increase,
}: {
  label: string;
  value: number | null;
  max?: number | null;
  change: (value: number) => void;
  decrease: string;
  increase: string;
}) {
  return (
    <div className="manager-resource-stepper" role="group" aria-label={label}>
      <span className="manager-resource-label">{label}</span>
      <div className="manager-resource-controls">
        <button
          className="manager-step"
          type="button"
          aria-label={decrease}
          title={decrease}
          disabled={value === null || value <= 0}
          onClick={() => change(Math.max(0, (value ?? 0) - 1))}
        >
          −
        </button>
        <strong className="manager-resource-number">
          {score(value)}
          {max !== undefined && <small> / {score(max)}</small>}
        </strong>
        <button
          className="manager-step"
          type="button"
          aria-label={increase}
          title={increase}
          disabled={
            max === null ||
            (max !== undefined && (value ?? 0) >= max) ||
            (value ?? 0) >= 1e9
          }
          onClick={() => change(Math.min(max ?? 1e9, (value ?? 0) + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
export function WoundsControl({ record, result, edit, disabled }: Props) {
  return (
    <fieldset
      className="manager-combat-wounds"
      disabled={disabled}
      aria-label="Current Wounds"
    >
      <legend className="manager-visually-hidden">Current Wounds</legend>
      <ResourceStepper
        label="Wounds"
        value={record.current.wounds}
        max={result.values.wounds}
        decrease="Lose one Wound"
        increase="Recover one Wound"
        change={(value) =>
          edit("Wounds changed", (r) => changeResource(r, "wounds", value))
        }
      />
    </fieldset>
  );
}
