import { useState } from "react";
import { Field, Select } from "../marijan/fields";
import { score } from "../../engine/controls.mjs";
import { ActionMenu, date } from "./ui";

export function CharacterLibrary({
  records,
  catalogue,
  openCharacter,
  importFile,
  create,
  backup,
  restore,
  act,
  exportRecord,
}: {
  records: any[];
  catalogue: any;
  openCharacter: (id: string) => void;
  importFile: () => void;
  create: () => void;
  backup: () => void;
  restore: () => void;
  act: (record: any, kind: string) => void;
  exportRecord: (record: any) => void;
}) {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("active"),
    [sort, setSort] = useState("recent");
  const careerName = (record: any) =>
    catalogue.careers.find(
      (c: any) => (c.contentId || c.id) === record.sheet.career,
    )?.name || "Career not entered";
  const rows = records
    .filter(
      (x) =>
        (filter === "all" ||
          (filter === "archived"
            ? x.archived
            : !x.archived && (filter !== "favourites" || x.favourite))) &&
        `${x.sheet.name} ${x.sheet.species} ${careerName(x)}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "recent"
        ? b.updatedAt.localeCompare(a.updatedAt)
        : (sort === "career" ? careerName(a) : a.sheet.name).localeCompare(
            sort === "career" ? careerName(b) : b.sheet.name,
          ),
    );
  return (
    <section className="manager-library-content">
      <div className="manager-page-heading">
        <div>
          <h1 data-workspace-focus="">Your characters</h1>
          <p className="manager-meta">
            Open a sheet and return to the adventure.
          </p>
        </div>
        <div
          className="manager-inline manager-library-actions"
          hidden={!records.length}
        >
          <button
            type="button"
            className="manager-primary"
            onClick={importFile}
          >
            Import character
          </button>
          <button type="button" className="quiet" onClick={create}>
            New blank character
          </button>
          <ActionMenu label="Library actions">
            <button type="button" onClick={backup}>
              Back up library
            </button>
            <button type="button" onClick={restore}>
              Restore library backup
            </button>
          </ActionMenu>
        </div>
      </div>
      {records.length > 0 && (
        <div className="manager-library-filters">
          <Field
            id="manager-find"
            label="Find a character"
            value={query}
            onValue={setQuery}
          />
          <Select
            id="manager-filter"
            label="Show"
            value={filter}
            options={[
              ["active", "Active"],
              ["favourites", "Favourites"],
              ["archived", "Archived"],
              ["all", "All characters"],
            ]}
            onValue={setFilter}
          />
          <Select
            id="manager-sort"
            label="Sort"
            value={sort}
            options={[
              ["recent", "Recently edited"],
              ["name", "Name"],
              ["career", "Career"],
            ]}
            onValue={setSort}
          />
        </div>
      )}
      {rows.map((x) => (
        <article className="manager-library-row" key={x.id}>
          {x.portrait && (
            <img className="manager-library-portrait" src={x.portrait} alt="" />
          )}
          <div className="manager-library-identity">
            <h2>
              <button
                type="button"
                className="manager-character-link"
                title={x.sheet.name || "Unnamed character"}
                onClick={() => openCharacter(x.id)}
              >
                <span className="manager-entry-name">
                  {x.sheet.name || "Unnamed character"}
                </span>
              </button>
            </h2>
            <p className="manager-meta">
              {x.sheet.species || "Species not entered"} · {careerName(x)} ·
              Level {score(x.sheet.level)}
              {x.archived ? " · Archived" : ""}
            </p>
            <p className="manager-meta">Edited {date(x.updatedAt)}</p>
          </div>
          <div className="manager-library-row-actions">
            <button
              type="button"
              className="manager-favourite"
              aria-pressed={!!x.favourite}
              aria-label={`${x.favourite ? "Remove" : "Add"} ${x.sheet.name || "character"} ${x.favourite ? "from" : "to"} favourites`}
              onClick={() => act(x, "favourite")}
            >
              {x.favourite ? "★" : "☆"}
            </button>
            <ActionMenu label={`More for ${x.sheet.name || "character"}`}>
              <button type="button" onClick={() => openCharacter(x.id)}>
                Open sheet
              </button>
              <button type="button" onClick={() => exportRecord(x)}>
                Export character JSON
              </button>
              <button type="button" onClick={() => act(x, "duplicate")}>
                Duplicate character
              </button>
              <button type="button" onClick={() => act(x, "archive")}>
                {x.archived ? "Restore character" : "Archive character"}
              </button>
            </ActionMenu>
          </div>
        </article>
      ))}
      {!rows.length && (
        <div className="manager-empty">
          <h2>
            {records.length
              ? "No matching characters"
              : "Your next adventure starts here"}
          </h2>
          <p>
            {records.length
              ? "Try another search or show a different group of characters."
              : "Import a Player, Marijan or manager save, or start with a blank character. Every character gets the same tools."}
          </p>
          {records.length === 0 && (
            <div className="manager-inline manager-empty-actions">
              <button
                type="button"
                className="manager-primary"
                onClick={importFile}
              >
                Import character
              </button>
              <button type="button" className="quiet" onClick={create}>
                New blank character
              </button>
            </div>
          )}
          {records.length > 0 && (
            <button
              type="button"
              className="quiet"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Clear search and filters
            </button>
          )}
        </div>
      )}
      <p className="manager-local-note">
        Saved in this browser. Download a backup to keep a separate copy or move
        characters between devices.
      </p>
    </section>
  );
}
