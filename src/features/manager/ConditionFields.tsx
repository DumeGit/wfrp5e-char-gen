import { useEffect, useState } from "react";
import { Field, Select } from "../marijan/fields";
import { requestReference } from "../../services/content";
import { loadRuleReferences } from "../../engine/rule-references.mjs";

// Core Fifth Edition pp. 185–187 explicitly mark these four as non-stacking.
const single = new Set(["Besmirched", "Prone", "Surprised", "Unconscious"]);

export function ConditionFields({
  catalogue,
  value,
  change,
}: {
  catalogue: any;
  value: Record<string, any>;
  change: (patch: Record<string, any>) => void;
}) {
  const [references, setReferences] = useState<any[]>(
    catalogue.R.ruleReferences,
  );
  const [failure, setFailure] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setFailure("");
    loadRuleReferences(catalogue.R)
      .then((rows: any[]) => {
        if (active) setReferences(rows);
      })
      .catch((error: Error) => {
        if (active) setFailure(error.message);
      });
    return () => {
      active = false;
    };
  }, [catalogue, attempt]);
  const conditions = references
    .filter(
      (entry: any) =>
        entry.category === "condition" && entry.source.book === "core",
    )
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
  const selected = conditions.find((entry: any) => entry.name === value.name);
  const custom = value.custom === true;
  return (
    <>
      <Select
        id="condition-preset"
        label="Condition"
        value={custom ? "custom" : selected?.name || ""}
        options={[
          ["", "Choose a Condition"],
          ...conditions.map((entry: any) => [entry.name, entry.name]),
          ["custom", "Custom Condition"],
        ]}
        onValue={(name) =>
          change({
            name: name === "custom" ? "" : name,
            custom: name === "custom",
            amount: 1,
          })
        }
      />
      {custom && (
        <Field
          id="condition-name"
          label="Condition name"
          value={value.name}
          onValue={(name) => change({ name })}
        />
      )}
      {selected && !custom && single.has(selected.name) ? (
        <p className="manager-meta">
          This Condition does not stack; record it once.
        </p>
      ) : (
        <Field
          id="condition-amount"
          label="Count"
          numeric
          value={value.amount}
          onValue={(amount) => change({ amount })}
        />
      )}
      <Field
        id="condition-note"
        label="Effect / notes"
        area
        value={value.note}
        onValue={(note) => change({ note })}
      />
      <p className="manager-meta">
        Recorded for play; numerical effects and recovery are applied manually.
      </p>
      {failure && !custom && (
        <div role="alert">
          <p>Could not load Condition rules. {failure}</p>
          <button
            type="button"
            className="quiet"
            onClick={() => setAttempt((old) => old + 1)}
          >
            Retry summary
          </button>
        </div>
      )}
      {selected && !custom && (
        <details className="manager-condition-rules">
          <summary>Condition rules · {selected.name}</summary>
          <div className="manager-catalogue-preview">
            {selected.text ? (
              <p>{selected.text}</p>
            ) : (
              !failure && <p role="status">Loading Condition summary…</p>
            )}
            <button
              className="quiet"
              type="button"
              onClick={() =>
                requestReference({
                  kind: "condition",
                  name: selected.name,
                  book: "core",
                  id: selected.id,
                })
              }
            >
              Core Rulebook, p. {selected.page}
            </button>
          </div>
        </details>
      )}
    </>
  );
}
