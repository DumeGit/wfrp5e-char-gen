import { useEffect, useState, type ReactNode } from "react";
import {
  WorkspaceMenu,
  type WorkspaceActionGroup,
} from "../../components/WorkspaceMenu";
import type { Edit } from "./ui";
import { CharacterLibrary } from "./CharacterLibrary";
import { PlaySheet } from "./PlaySheet";
import { ResourceBand } from "./ResourceBand";
import { AdvancementScreen } from "./AdvancementScreen";
import { JournalScreen } from "./JournalScreen";
import { score } from "../../engine/controls.mjs";

export const SECTIONS = [
  ["play", "Play"],
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
  verify,
  actionGroups,
  importFile,
  restore,
  backup,
  create,
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
  verify: boolean;
  actionGroups: WorkspaceActionGroup[];
  importFile: () => void;
  restore: () => void;
  backup: () => void;
  create: () => void;
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
  return (
    <div className={`manager-workspace ${record ? "" : "manager-library"}`}>
      <WorkspaceMenu
        mode="manager"
        verify={verify}
        groups={actionGroups}
        history={historyControls}
        status={
          state.saving
            ? "Saving…"
            : state.dirty
              ? "Unsaved changes"
              : state.message || "Saved on this device"
        }
        navigation={
          <>
            <nav
              className="manager-library-navigation"
              aria-label="Manager library"
            >
              <button
                type="button"
                aria-current={!record ? "page" : undefined}
                onClick={() => navigate(null)}
              >
                Character library
              </button>
            </nav>
            {record && (
              <nav
                className="workspace-manager-sections"
                aria-label="Character sections"
              >
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
            )}
          </>
        }
      />
      <main id="creator-main" className="manager-main" tabIndex={-1}>
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
                <div className="manager-name-line">
                  <h1
                    id="manager-character-name"
                    data-workspace-focus={section === "play" ? "" : undefined}
                    title={record.sheet.name || "Unnamed character"}
                  >
                    {record.sheet.name || "Unnamed character"}
                  </h1>
                  <button
                    className="manager-profile-link"
                    aria-label="Edit profile"
                    title="Edit profile"
                    type="button"
                    onClick={profile}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                    >
                      <path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z" />
                    </svg>
                  </button>
                </div>
                <p className="manager-meta">
                  {record.sheet.species || "Species not entered"} ·{" "}
                  {result.career?.name || "Career not entered"} · Level{" "}
                  {score(record.sheet.level)}
                  {record.archived && (
                    <strong className="manager-archive-label"> Archived</strong>
                  )}
                </p>
              </div>
              <ResourceBand
                {...{ record, result, edit, open }}
                disabled={state.saving || state.dirty}
              />
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
            <div
              id="manager-section-content"
              className="manager-section-content"
              tabIndex={-1}
            >
              {panel(
                "play",
                <PlaySheet
                  key={record.id}
                  {...{ record, result, catalogue, edit, open }}
                  initialView={section === "play" ? view : ""}
                  disabled={state.saving || state.dirty}
                />,
              )}
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
