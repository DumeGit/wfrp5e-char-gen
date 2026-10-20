import { useEffect, useState, type ReactNode, type MouseEvent } from "react";
import { ActionMenu, type Edit } from "./ui";
import { CharacterLibrary } from "./CharacterLibrary";
import { PlaySheet } from "./PlaySheet";
import { ResourceBand } from "./ResourceBand";
import { AbilitiesScreen, GearScreen } from "./CharacterScreens";
import { AdvancementScreen } from "./AdvancementScreen";
import { JournalScreen } from "./JournalScreen";
import { score } from "../../engine/controls.mjs";

export const SECTIONS = [
  ["play", "Play"],
  ["abilities", "Abilities"],
  ["gear", "Gear"],
  ["advancement", "Advance"],
  ["journal", "Journal"],
];

export function ManagerWorkspace({
  state,
  section,
  view,
  edit,
  open,
  navigate,
  profile,
  applicationMenu,
  importFile,
  restore,
  backup,
  create,
  duplicate,
  exportPDF,
  exportRecord,
  libraryAction,
  download,
  historyControls,
  alerts,
}: {
  state: any;
  section: string;
  view: string;
  edit: Edit;
  open: (kind: string, values?: Record<string, any>) => void;
  navigate: (id: string | null, section?: string, view?: string) => void;
  profile: () => void;
  applicationMenu: (event: MouseEvent<HTMLButtonElement>) => void;
  importFile: () => void;
  restore: () => void;
  backup: () => void;
  create: () => void;
  duplicate: () => void;
  exportPDF: () => void;
  exportRecord: (record: any) => void;
  libraryAction: (record: any, kind: string) => void;
  download: (value: any, name: string) => void;
  historyControls: ReactNode;
  alerts: ReactNode;
}) {
  const { record, result, catalogue } = state;
  const [visited, setVisited] = useState(() => new Set([section]));
  useEffect(() => {
    setVisited((old) => (old.has(section) ? old : new Set([...old, section])));
  }, [section]);
  const navigateSection = (id: string, view?: string) =>
    navigate(record.id, id, view);
  const panel = (id: string, content: ReactNode) => (
    <div hidden={section !== id}>
      {(section === id || visited.has(id)) && content}
    </div>
  );
  const screenProps = {
    record,
    result,
    catalogue,
    edit,
    open,
    advance: (group?: string, name?: string) =>
      navigateSection(
        "advancement",
        group
          ? `${group === "talents" ? "talent" : group === "skills" ? "skill" : "char"}:${name || ""}`
          : undefined,
      ),
  };
  return (
    <div className={`manager-workspace ${record ? "" : "manager-library"}`}>
      <main id="creator-main" className="manager-main">
        <div className="manager-workspace-tools">
          <div className="manager-inline">
            <button
              className="manager-text"
              type="button"
              onClick={() => navigate(null)}
              aria-current={!record ? "page" : undefined}
            >
              Character library
            </button>
            <button
              className="manager-text manager-desktop-menu"
              type="button"
              onClick={applicationMenu}
            >
              Application menu
            </button>
          </div>
          <p className="manager-save-status" role="status">
            {state.saving
              ? "Saving…"
              : state.dirty
                ? "Unsaved changes"
                : "Saved on this device"}
          </p>
        </div>
        {alerts}
        <div hidden={!!record}>
          <CharacterLibrary
            records={state.records}
            catalogue={catalogue}
            openCharacter={(id) => navigate(id)}
            {...{ importFile, create, backup, restore }}
            act={libraryAction}
            exportRecord={exportRecord}
          />
        </div>
        {record && (
          <>
            <div className="manager-character-header">
              {record.portrait && (
                <img
                  className="manager-portrait"
                  src={record.portrait}
                  alt={`Portrait of ${record.sheet.name || "this character"}`}
                />
              )}
              <div className="manager-character-identity">
                <h1 id="manager-character-name">
                  {record.sheet.name || "Unnamed character"}
                </h1>
                <p className="manager-meta">
                  {record.sheet.species || "Species not entered"} ·{" "}
                  {result.career?.name || "Career not entered"} · Level{" "}
                  {score(record.sheet.level)}
                  {record.archived && (
                    <strong className="manager-archive-label"> Archived</strong>
                  )}
                </p>
                <button
                  className="manager-text manager-profile-link"
                  type="button"
                  onClick={profile}
                >
                  Edit profile
                </button>
              </div>
              <div className="manager-character-actions">
                <div
                  className="manager-history-controls"
                  role="group"
                  aria-label="Edit history"
                >
                  {historyControls}
                </div>
                <ActionMenu>
                  <button
                    type="button"
                    onClick={() => exportRecord(record)}
                    disabled={state.saving}
                  >
                    Export character JSON
                  </button>
                  <button
                    type="button"
                    onClick={exportPDF}
                    disabled={state.saving}
                  >
                    Export PDF sheet
                  </button>
                  <button
                    type="button"
                    onClick={duplicate}
                    disabled={state.saving}
                  >
                    Duplicate character
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      edit(
                        record.archived
                          ? "Restored character"
                          : "Archived character",
                        (r) => {
                          r.archived = !r.archived;
                        },
                      )
                    }
                  >
                    {record.archived
                      ? "Restore character"
                      : "Archive character"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      edit("Changed character favourite", (r) => {
                        r.favourite = !r.favourite;
                      })
                    }
                  >
                    {record.favourite
                      ? "Remove favourite"
                      : "Favourite character"}
                  </button>
                  <button type="button" onClick={() => open("adjustments")}>
                    Adjust sheet
                  </button>
                  <button
                    type="button"
                    className="manager-danger-text"
                    onClick={() => open("delete")}
                  >
                    Permanently delete character
                  </button>
                </ActionMenu>
              </div>
            </div>
            <nav className="manager-navigation" aria-label="Character sections">
              {SECTIONS.map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  aria-current={section === id ? "page" : undefined}
                  onClick={() => navigateSection(id)}
                >
                  {label}
                </button>
              ))}
            </nav>
            <ResourceBand
              {...{ record, result, edit, open }}
              disabled={state.saving || state.dirty}
            />
            <div
              id="manager-section-content"
              className="manager-section-content"
              tabIndex={-1}
            >
              {panel(
                "play",
                <PlaySheet
                  {...{ record, result, catalogue, edit, open }}
                  navigate={navigateSection}
                />,
              )}
              {panel(
                "abilities",
                <AbilitiesScreen
                  key={record.id}
                  {...screenProps}
                  initialCategory={section === "abilities" ? view : ""}
                />,
              )}
              {panel("gear", <GearScreen key={record.id} {...screenProps} />)}
              {panel(
                "advancement",
                <AdvancementScreen
                  key={record.id}
                  {...{ catalogue, record, result, edit }}
                  disabled={state.saving || state.dirty}
                  initialView={section === "advancement" ? view : ""}
                  award={() => open("award", { amount: 0, note: "" })}
                  career={() => open("career", { id: "", confirmed: false })}
                  history={() => navigateSection("journal", "history")}
                />,
              )}
              {panel(
                "journal",
                <JournalScreen
                  key={record.id}
                  {...{ record, open, profile, download }}
                  initialView={section === "journal" ? view : ""}
                />,
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
