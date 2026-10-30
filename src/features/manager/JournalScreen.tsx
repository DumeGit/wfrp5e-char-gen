import { useEffect, useState } from "react";
import { date } from "./ui";

export function JournalScreen({
  record,
  open,
  profile,
  download,
  initialView,
}: {
  record: any;
  open: (kind: string, values?: Record<string, any>) => void;
  profile: () => void;
  download: (value: any, name: string) => void;
  initialView?: string;
}) {
  const [view, setView] = useState("notes"),
    [historyFilter, setHistoryFilter] = useState("all"),
    [limit, setLimit] = useState(50);
  useEffect(() => {
    if (["notes", "character", "history"].includes(initialView || ""))
      setView(initialView!);
  }, [initialView]);
  const history = [...record.history]
    .reverse()
    .filter(
      (x) =>
        historyFilter === "all" ||
        x.kind === historyFilter ||
        (historyFilter === "adjustment" &&
          x.kind === "change" &&
          /^(Adjusted|Recorded GM)/.test(x.label)),
    );
  return (
    <section>
      <div className="manager-page-heading">
        <h2 data-workspace-focus="">Journal</h2>
        <button
          type="button"
          className="quiet"
          onClick={() =>
            open("journal", { title: "", text: "", kind: "Session" })
          }
        >
          Add journal entry
        </button>
      </div>
      <div
        className="manager-local-nav"
        role="group"
        aria-label="Journal views"
      >
        {[
          ["notes", "Notes"],
          ["character", "Character"],
          ["history", "History"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="quiet"
            aria-pressed={view === id}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {view === "notes" && (
        <>
          {!record.journal.length && (
            <p className="manager-empty-line">
              No journal entries yet. Record a session, ambition or something to
              remember.
            </p>
          )}
          {[...record.journal].reverse().map((x: any) => (
            <details className="manager-entry manager-journal-entry" key={x.id}>
              <summary>
                <strong>{x.title}</strong>
                <span>{x.kind}</span>
              </summary>
              <p className="manager-meta">{date(x.at)}</p>
              <p className="manager-prose">{x.text}</p>
              <button
                type="button"
                className="text-button"
                onClick={() => open("journal", { ...x })}
              >
                Edit entry
              </button>
            </details>
          ))}
        </>
      )}
      {view === "character" && (
        <>
          <div className="manager-section-heading">
            <h3>Character profile</h3>
            <button type="button" className="quiet" onClick={profile}>
              Edit profile
            </button>
          </div>
          {[
            ["Appearance", "appearance"],
            ["Personal ambition", "ambition"],
            ["Party ambition", "partyAmbition"],
            ["Background & notes", "notes"],
          ].map(([label, key]) => (
            <section className="manager-profile-section" key={key}>
              <h3>{label}</h3>
              <p
                className={record.sheet[key] ? "manager-prose" : "manager-meta"}
              >
                {record.sheet[key] || "Not recorded."}
              </p>
            </section>
          ))}
        </>
      )}
      {view === "history" && (
        <>
          <div className="manager-search">
            <label htmlFor="manager-history-filter">Show changes</label>
            <select
              id="manager-history-filter"
              value={historyFilter}
              onChange={(e) => {
                setHistoryFilter(e.target.value);
                setLimit(50);
              }}
            >
              {[
                ["all", "All changes"],
                ["advancement", "Advancement"],
                ["xp", "XP awards"],
                ["resource", "Resources"],
                ["equipment", "Equipment"],
                ["adjustment", "Adjustments"],
                ["condition", "Conditions"],
                ["journal", "Journal"],
                ["history", "Undo / Redo"],
              ].map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <ul className="manager-history">
            {history.slice(0, limit).map((x: any) => (
              <li key={x.id}>
                <strong>{x.label}</strong>
                <div className="manager-meta">{date(x.at)}</div>
                {x.detail && <p>{x.detail}</p>}
              </li>
            ))}
          </ul>
          {!history.length && (
            <p className="manager-empty-line">No matching changes.</p>
          )}
          {history.length > limit && (
            <button
              type="button"
              className="quiet"
              onClick={() => setLimit(limit + 50)}
            >
              Show 50 more changes
            </button>
          )}
          <h3>Original records</h3>
          <p className="manager-meta">
            Imported records are historical attachments. They do not represent
            new purchases or verified rolls.
          </p>
          {record.attachments.length ? (
            record.attachments.map((x: any, i: number) => (
              <p key={i}>
                <button
                  type="button"
                  className="quiet"
                  onClick={() =>
                    download(x.data, `historical-record-${i + 1}.json`)
                  }
                >
                  {x.name}
                </button>
              </p>
            ))
          ) : (
            <p className="manager-empty-line">No historical attachments.</p>
          )}
        </>
      )}
    </section>
  );
}
