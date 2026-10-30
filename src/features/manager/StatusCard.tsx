import { RuleName } from "../../components/RuleReference";
import { entryReference } from "../../engine/entry-reference.mjs";
import { score } from "../../engine/controls.mjs";
import { entryDescription } from "../../engine/marijan/catalogue.mjs";
import { SheetCard } from "./SheetCard";
import type { Edit } from "./ui";
import { useState } from "react";

export function StatusCard({
  record,
  result,
  catalogue,
  edit,
  open,
  reveal,
}: {
  record: any;
  result: any;
  catalogue: any;
  edit: Edit;
  reveal: number;
  open: (kind: string, values?: Record<string, any>) => void;
}) {
  const [addReveal, setAddReveal] = useState(0);
  const legacy = record.sheet.entries.extras
    .filter((row: any) => row.kind === "mutation")
    .map((row: any) => ({
      ...row,
      id: row.key,
      legacy: row.key,
      kind: "mutation",
      catalogueId: row.id,
      note: row.descriptionNote || "",
      text: entryDescription(catalogue, { ...row, descriptionNote: "" }),
      resolved: !!row.inactive,
    }));
  const afflictions = [...(record.afflictions || []), ...legacy];
  const active = afflictions.filter((row) => !row.resolved);
  const inactive = afflictions.filter((row) => row.resolved);
  const rowView = (row: any) => {
    const reference =
      row.source ||
      row.referenceId ||
      row.catalogueId ||
      (row.kind === "condition" &&
        catalogue.R.ruleReferences.some(
          (entry: any) =>
            entry.category === "condition" && entry.name === row.name,
        ))
        ? entryReference(row.kind, {
            ...row,
            id: row.referenceId || row.catalogueId,
            source:
              row.source ||
              (row.kind === "condition" ? { book: "core" } : undefined),
          })
        : null;
    return (
      <div className="manager-status-entry" key={row.id}>
        <RuleName reference={reference}>
          <strong>
            {row.name}
            {row.kind === "condition" && row.amount > 1
              ? ` ×${score(row.amount)}`
              : ""}
          </strong>
          {row.location && <small title={row.location}>{row.location}</small>}
        </RuleName>
        {!reference && row.text && <p>{row.text}</p>}
        {row.note && <p>{row.note}</p>}
        <div className="manager-inline">
          {row.source && (
            <small className="manager-meta">{`${catalogue.books.find((book: any) => book.id === row.source.book)?.shortTitle || catalogue.books.find((book: any) => book.id === row.source.book)?.title || row.source.book}, p. ${row.source.page}`}</small>
          )}
          <button
            className="text-button"
            type="button"
            aria-label={`Edit ${row.name}`}
            onClick={() =>
              open("status", { ...row, id: row.legacy ? undefined : row.id })
            }
          >
            Edit
          </button>
          {row.kind !== "condition" && (
            <button
              className="text-button"
              type="button"
              onClick={() =>
                edit(
                  `${row.name}: ${row.resolved ? "active" : row.kind === "critical" ? "healed" : "inactive"}`,
                  (r) => {
                    if (row.legacy)
                      r.sheet.entries.extras.find(
                        (entry: any) => entry.key === row.legacy,
                      ).inactive = !row.resolved;
                    else
                      r.afflictions.find(
                        (entry: any) => entry.id === row.id,
                      ).resolved = !row.resolved;
                  },
                )
              }
            >
              {row.resolved
                ? "Restore"
                : row.kind === "critical"
                  ? "Mark healed"
                  : "Mark inactive"}
            </button>
          )}
          <button
            className="danger-text"
            type="button"
            aria-label={`Remove ${row.name}${row.kind === "condition" ? " Condition" : ""}`}
            onClick={() =>
              edit(`Removed ${row.name}`, (r) => {
                if (row.kind === "condition")
                  r.conditions = r.conditions.filter(
                    (entry: any) => entry.id !== row.id,
                  );
                else if (row.legacy)
                  r.sheet.entries.extras = r.sheet.entries.extras.filter(
                    (entry: any) => entry.key !== row.legacy,
                  );
                else
                  r.afflictions = r.afflictions.filter(
                    (entry: any) => entry.id !== row.id,
                  );
              })
            }
          >
            Remove
          </button>
        </div>
      </div>
    );
  };
  return (
    <SheetCard
      title="Status & afflictions"
      id="manager-status"
      className="manager-play-status"
      count={record.conditions.length + active.length}
      mobileOpen={record.conditions.length + active.length > 0}
      reveal={`${reveal}:${addReveal}` === "0:0" ? 0 : `${reveal}:${addReveal}`}
      summary={
        inactive.length ? `${inactive.length} healed / inactive` : undefined
      }
      actions={
        <button
          type="button"
          className="quiet"
          aria-label="Add status entry"
          onClick={() => {
            setAddReveal((old) => old + 1);
            open("status", {
              kind: "condition",
              amount: 1,
              name: "",
              note: "",
            });
          }}
        >
          Add
        </button>
      }
    >
      <dl className="manager-status-facts">
        {[
          [
            "Enc / capacity",
            `${score(result.values.enc)} / ${score(result.values.capacity)}`,
          ],
          ["Corruption", score(record.sheet.corruption)],
          ["Sin", score(record.sheet.sin)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {[
        {
          kind: "condition",
          title: "Conditions",
          rows: record.conditions.map((row: any) => ({
            ...row,
            kind: "condition",
          })),
        },
        {
          kind: "critical",
          title: "Critical wounds",
          rows: active.filter((row) => row.kind === "critical"),
        },
        {
          kind: "mutation",
          title: "Mutations",
          rows: active.filter((row) => row.kind === "mutation"),
        },
      ].map((group) => (
        <div className="manager-status-group" key={group.kind}>
          <h3>
            {group.title}
            <small>{group.rows.length || "None"}</small>
          </h3>
          {group.rows.map(rowView)}
        </div>
      ))}
      {inactive.length > 0 && (
        <details className="manager-status-history">
          <summary>Healed / inactive ({inactive.length})</summary>
          {inactive.map(rowView)}
        </details>
      )}
    </SheetCard>
  );
}
