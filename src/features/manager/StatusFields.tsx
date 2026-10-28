import { useEffect, useState } from "react";
import { Field, Select } from "../marijan/fields";
import { loadLibrary, requestReference } from "../../services/content";
import { loadReferenceLibrary } from "../../engine/search-library.mjs";
import { criticalChoices } from "../../engine/manager/afflictions.mjs";
import { entryDescription } from "../../engine/marijan/catalogue.mjs";
import { ConditionFields } from "./ConditionFields";

export function StatusFields({
  catalogue,
  value,
  change,
}: {
  catalogue: any;
  value: Record<string, any>;
  change: (patch: Record<string, any>) => void;
}) {
  const [criticals, setCriticals] = useState<any[]>([]);
  const [failure, setFailure] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (value.kind !== "critical") return;
    let active = true;
    setFailure("");
    loadLibrary()
      .then((library) =>
        loadReferenceLibrary(library, undefined, { normalize: false }),
      )
      .then((data) => {
        if (active) setCriticals(criticalChoices(data.rows));
      })
      .catch((error) => {
        if (active) setFailure(error.message);
      });
    return () => {
      active = false;
    };
  }, [value.kind, attempt]);
  const kind = value.kind || "condition";
  const choices =
    kind === "critical"
      ? criticals
      : catalogue.rows
          .filter(
            (row: any) => row.kind === "mutation" && row.source.book === "core",
          )
          .map((row: any) => ({
            ...row,
            catalogueId: row.id,
            text: entryDescription(catalogue, row),
          }));
  const selected = choices.find((row: any) =>
    kind === "mutation"
      ? row.id === value.catalogueId
      : row.referenceId === value.referenceId && row.name === value.name,
  );
  const custom =
    value.custom === true ||
    (!!value.name && !value.referenceId && !value.catalogueId);
  const label = kind === "critical" ? "Critical wound" : "Mutation";
  return (
    <>
      {!value.id && !value.legacy && (
        <Select
          id="status-kind"
          label="Entry type"
          value={kind}
          options={[
            ["condition", "Condition"],
            ["critical", "Critical wound"],
            ["mutation", "Mutation"],
          ]}
          onValue={(next) =>
            change({
              kind: next,
              name: "",
              text: "",
              note: "",
              location: "",
              referenceId: "",
              catalogueId: "",
              source: null,
              custom: false,
              amount: 1,
            })
          }
        />
      )}
      {kind === "condition" ? (
        <ConditionFields catalogue={catalogue} value={value} change={change} />
      ) : (
        <>
          {kind === "critical" && !criticals.length && !failure && (
            <p role="status">Loading core Critical Wounds…</p>
          )}
          {failure && (
            <div role="alert">
              <p>{failure}</p>
              <button
                type="button"
                className="quiet"
                onClick={() => setAttempt((old) => old + 1)}
              >
                Retry list
              </button>
            </div>
          )}
          <Select
            id="status-choice"
            label={label}
            value={custom ? "custom" : selected?.id || ""}
            options={[
              ["", `Choose a ${label.toLowerCase()}`],
              ...choices.map((row: any) => [
                row.id,
                kind === "critical"
                  ? `${row.location} · ${row.name} (${row.roll})`
                  : row.name,
              ]),
              ["custom", `Custom ${label.toLowerCase()}`],
            ]}
            onValue={(id) => {
              const row = choices.find((entry: any) => entry.id === id);
              change({
                custom: id === "custom",
                name: row?.name || "",
                text: row?.text || "",
                location: row?.location || "",
                source: row?.source || null,
                referenceId: row?.referenceId || "",
                catalogueId: row?.catalogueId || "",
              });
            }}
          />
          {custom && (
            <>
              <Field
                id="status-name"
                label={`${label} name`}
                value={value.name || ""}
                onValue={(name) => change({ name })}
              />
              <Field
                id="status-text"
                label="Effects"
                area
                value={value.text || ""}
                onValue={(text) => change({ text })}
              />
            </>
          )}
          {(selected || (!custom && value.text)) && (
            <div className="manager-catalogue-preview">
              <p>{selected?.text || value.text}</p>
              {(selected?.source || value.source) && (
                <button
                  className="quiet"
                  type="button"
                  onClick={() =>
                    requestReference({
                      id:
                        (kind === "critical"
                          ? selected?.id
                          : selected?.referenceId) ||
                        value.referenceId ||
                        value.catalogueId,
                      name: selected?.name || value.name,
                      book: "core",
                      kind: kind === "critical" ? "critical" : "mutation",
                    })
                  }
                >
                  Core Rulebook, p. {(selected?.source || value.source).page}
                </button>
              )}
            </div>
          )}
          {kind === "critical" && (
            <Field
              id="status-location"
              label="Location / side"
              value={value.location || ""}
              onValue={(location) => change({ location })}
            />
          )}
          <Field
            id="status-note"
            label={kind === "critical" ? "Recovery / notes" : "Notes"}
            area
            value={value.note || ""}
            onValue={(note) => change({ note })}
          />
          <p className="manager-meta">
            Recorded effects are applied manually. Adding this entry does not
            change Wounds, Conditions or Characteristics.
          </p>
        </>
      )}
    </>
  );
}
