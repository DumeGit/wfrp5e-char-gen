"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { getManagerStore } from "./store";
import { CreatorMenu } from "../../components/CreatorMenu";
import { HistoryControls } from "../../components/HistoryControls";
import { ActionGroups } from "./ActionGroups";
import { Dialog } from "./ui";
import { ManagerWorkspace, SECTIONS } from "./ManagerWorkspace";
import { AdjustmentEditor } from "./AdjustmentEditor";
import { ConditionFields } from "./ConditionFields";
import { Field, Select } from "../marijan/fields";
import { requestReference } from "../../services/content";
import { KEYS } from "../../engine/rules.mjs";
import { score } from "../../engine/controls.mjs";
import { formatMoney } from "../../engine/market.mjs";
import { makeEntry } from "../../engine/marijan/model.mjs";
import {
  entryDescription,
  entrySource,
} from "../../engine/marijan/catalogue.mjs";
import {
  freshManager,
  calculateManager,
  readImport,
  backup,
  changeResource,
  awardXP,
  changeCareer,
  acquire,
  listedPrice,
  addCondition,
  addJournal,
  event as addEvent,
} from "../../engine/manager/model.mjs";
const normalSection = (value: string | null) =>
  SECTIONS.some(([id]) => id === value)
    ? value!
    : (
        {
          overview: "play",
          session: "play",
          skills: "abilities",
          magic: "abilities",
          advance: "advancement",
        } as Record<string, string>
      )[value || ""] || "play";
type Store = ReturnType<typeof getManagerStore>;
function download(value: any, filename: string, mime = "application/json") {
  const bytes =
    mime === "application/json" ? JSON.stringify(value, null, 2) : value;
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const filename = (name: string) =>
  (name || "character").replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 80) ||
  "character";
export default function ManagerEntry() {
  const [store, setStore] = useState<Store | null>(null);
  useEffect(() => {
    setStore(
      getManagerStore(new URLSearchParams(location.search).has("verify")),
    );
  }, []);
  return store ? (
    <Manager store={store} />
  ) : (
    <main id="creator-main" className="manager-main">
      <h1>Character manager</h1>
      <p role="status">Opening your field ledger…</p>
    </main>
  );
}
function Manager({ store }: { store: Store }) {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  const [section, setSection] = useState("play"),
    [menu, setMenu] = useState(false);
  const [view, setView] = useState("");
  const scrollPositions = useRef(new Map<string, number>());
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const [modal, setModal] = useState(""),
    [error, setError] = useState("");
  const [preview, setPreview] = useState<any[]>([]),
    [restorePolicy, setRestorePolicy] = useState("copy");
  const previewRevisions = useRef(new Map<string, number>());
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const [form, setForm] = useState<Record<string, any>>({});
  const [discard, setDiscard] = useState(false);
  const profileStart = useRef("");
  const menuTrigger = useRef<HTMLElement | null>(null),
    dialogTrigger = useRef<HTMLElement | null>(null),
    lastAction = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const remember = (event: Event) => {
      const node =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("button,summary,a")
          : null;
      if (node) lastAction.current = node;
    };
    document.addEventListener("click", remember, true);
    return () => document.removeEventListener("click", remember, true);
  }, []);
  const file = useRef<HTMLInputElement>(null);
  const portrait = useRef<HTMLInputElement>(null);
  const importEpoch = useRef(0),
    portraitEpoch = useRef(0);
  const navigatedCharacter = useRef<string | null>(null);
  const record = state.record,
    sheet = record?.sheet,
    result = state.result;
  const verify = store.db.name.endsWith("-verification");
  const updateForm = (key: string, value: any) =>
    setForm((old) => ({ ...old, [key]: value }));
  function open(kind: string, values: Record<string, any> = {}) {
    if (!modal)
      dialogTrigger.current = lastAction.current?.closest("#creator-menu")
        ? menuTrigger.current
        : lastAction.current;
    setError("");
    setNotice("");
    setForm(values);
    setDiscard(false);
    if (["profile", "journal"].includes(kind))
      profileStart.current = JSON.stringify(values);
    setModal(kind);
  }
  function navigate(
    id: string | null,
    nextSection = "play",
    push = true,
    nextView = "",
  ) {
    navigatedCharacter.current = id;
    store.select(id);
    setSection(nextSection);
    setView(nextView);
    if (push) {
      scrollPositions.current.set(location.href, window.scrollY);
      const url = new URL(location.href);
      if (nextView) url.searchParams.set("view", nextView);
      else url.searchParams.delete("view");
      if (id) {
        url.searchParams.set("character", id);
        url.searchParams.set("section", nextSection);
      } else {
        url.searchParams.delete("character");
        url.searchParams.delete("section");
      }
      window.history.pushState(null, "", url);
      requestAnimationFrame(() =>
        window.scrollTo({
          top: scrollPositions.current.get(url.href) ?? 0,
          behavior: "instant",
        }),
      );
    }
  }
  useEffect(() => {
    let active = true;
    let stop: (() => void) | undefined;
    void store.initialize().then(() => {
      if (!active || store.getSnapshot().status !== "ready") return;
      stop = store.observe();
      const p = new URLSearchParams(location.search);
      const next = p.get("section");
      navigate(
        p.get("character"),
        normalSection(next),
        false,
        p.get("view") || (next === "magic" ? "magic" : ""),
      );
    });
    setPortal(document.getElementById("compact-menu"));
    const pop = () => {
      const p = new URLSearchParams(location.search);
      const next = p.get("section");
      navigate(
        p.get("character"),
        normalSection(next),
        false,
        p.get("view") || (next === "magic" ? "magic" : ""),
      );
    };
    window.addEventListener("popstate", pop);
    return () => {
      active = false;
      importEpoch.current++;
      portraitEpoch.current++;
      stop?.();
      window.removeEventListener("popstate", pop);
    };
  }, [store]);
  useEffect(() => {
    if (state.record) {
      const url = new URL(location.href);
      url.searchParams.set("character", state.record.id);
      if (navigatedCharacter.current !== state.record.id) {
        setSection("play");
        setView("");
        url.searchParams.delete("view");
        url.searchParams.set("section", "play");
        navigatedCharacter.current = state.record.id;
      }
      if (!url.searchParams.has("section"))
        url.searchParams.set("section", section);
      window.history.replaceState(null, "", url);
    } else if (navigatedCharacter.current !== null && !state.selected) {
      const url = new URL(location.href);
      url.searchParams.delete("character");
      url.searchParams.delete("section");
      window.history.replaceState(null, "", url);
      navigatedCharacter.current = null;
    }
  }, [state.record?.id]);
  const edit = (label: string, change: (r: any) => void, detail = "") =>
    void store.edit(label, change, detail);
  async function submit(action: () => void | Promise<void>) {
    setError("");
    setBusy(true);
    try {
      await action();
      if (!store.getSnapshot().error) setModal("");
      else setError(store.getSnapshot().error);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  async function loadFile(selected?: File) {
    if (!selected) return;
    const epoch = ++importEpoch.current;
    setBusy(true);
    setError("");
    setPreview([]);
    setModal("import");
    try {
      if (selected.size > 30_000_000)
        throw Error("Choose a JSON file smaller than 30 MB.");
      const text = await selected.text();
      if (epoch !== importEpoch.current) return;
      const input = JSON.parse(text);
      setForm({ restore: input?.type === "wfrp-manager-library" });
      const next = readImport(state.catalogue, state.library, input);
      previewRevisions.current = new Map(
        store.getSnapshot().records.map((x) => [x.id, x.revision]),
      );
      setPreview(next);
      setRestorePolicy("copy");
    } catch (e) {
      if (epoch === importEpoch.current)
        setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (epoch === importEpoch.current) setBusy(false);
      if (file.current) file.current.value = "";
    }
  }
  async function exportPDF() {
    const captured = structuredClone(record);
    setBusy(true);
    setNotice("");
    try {
      const { exportManagerPDF } = await import("./export");
      const bytes = await exportManagerPDF(state.catalogue, captured);
      download(
        bytes,
        `${filename(captured.sheet.name)}-sheet.pdf`,
        "application/pdf",
      );
      setNotice("Sheet and complete manager record downloaded.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  async function loadPortrait(selected?: File) {
    if (!selected || !record) return;
    const epoch = ++portraitEpoch.current;
    const characterId = record.id;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(selected.type) ||
      selected.size > 512 * 1024
    ) {
      setError("Choose a PNG, JPEG, or WebP portrait smaller than 512 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (epoch !== portraitEpoch.current) return;
      if (store.getSnapshot().selected !== characterId) {
        setNotice(
          "Portrait import cancelled because the selected character changed.",
        );
        return;
      }
      if (modal === "profile")
        setForm((old) => ({ ...old, portrait: reader.result }));
      else
        edit("Changed portrait", (r) => {
          r.portrait = reader.result;
        });
    };
    reader.onerror = () =>
      setError("Could not read this portrait. Try another image.");
    reader.readAsDataURL(selected);
    if (portrait.current) portrait.current.value = "";
  }
  if (state.status !== "ready")
    return (
      <main id="creator-main" className="manager-main">
        <h1>Character manager</h1>
        {state.status === "error" ? (
          <>
            <p role="alert">{state.error}</p>
            <button
              className="quiet"
              type="button"
              onClick={() =>
                void store.db.characters.toArray().then((characters) =>
                  download(
                    {
                      type: "wfrp-manager-library",
                      schemaVersion: 1,
                      characters,
                    },
                    "manager-recovery-backup.json",
                  ),
                )
              }
            >
              Download library for recovery
            </button>
            <button type="button" onClick={() => void store.initialize()}>
              Retry opening manager
            </button>
          </>
        ) : (
          <p role="status">Opening your field ledger…</p>
        )}
      </main>
    );
  const close = () => {
    if (busy && modal !== "import") return;
    if (
      ["profile", "journal"].includes(modal) &&
      JSON.stringify(form) !== profileStart.current
    ) {
      setDiscard(true);
      return;
    }
    portraitEpoch.current++;
    if (modal === "import") {
      importEpoch.current++;
      setBusy(false);
    }
    setModal("");
    setError("");
  };
  const menuActions = (
    <>
      <button
        className="quiet"
        type="button"
        aria-haspopup="dialog"
        onClick={() => open("new-actions")}
      >
        New &amp; import
      </button>
      <button
        className="quiet"
        type="button"
        aria-haspopup="dialog"
        onClick={() => open("file-actions")}
      >
        Save &amp; export
      </button>
      {record && (
        <button
          className="quiet"
          type="button"
          aria-haspopup="dialog"
          onClick={() => open("character-actions")}
        >
          More
        </button>
      )}
    </>
  );
  const historyControls = (
    <div
      className="manager-history"
      onClick={(event) => {
        const action = (event.target as Element).closest<HTMLButtonElement>(
          "button[data-action]",
        )?.dataset.action;
        if (action === "undo" || action === "redo")
          void store.undo(action === "redo");
      }}
    >
      <HistoryControls
        canUndo={!!record && state.canUndo && !state.saving && !state.dirty}
        canRedo={!!record && state.canRedo && !state.saving && !state.dirty}
      />
    </div>
  );
  const profile = () =>
    open(
      "profile",
      Object.fromEntries(
        ["name", "appearance", "ambition", "partyAmbition", "notes"]
          .map((key) => [key, sheet[key] || ""])
          .concat([["portrait", record.portrait || ""]]),
      ),
    );
  const importFile = () => {
    setPreview([]);
    open("import");
  };
  const restore = () => {
    setPreview([]);
    open("import", { restore: true });
  };
  const backupLibrary = () =>
    download(backup(store.allRecords()), "character-library-backup.json");
  const exportRecord = (r: any) =>
    download(r, `${filename(r.sheet.name)}.json`);
  const libraryAction = (r: any, kind: string) => {
    store.select(r.id);
    if (kind === "duplicate") {
      void store.duplicate();
      return;
    }
    void store.edit(
      kind === "favourite"
        ? "Changed character favourite"
        : r.archived
          ? "Restored character"
          : "Archived character",
      (next) => {
        if (kind === "favourite") next.favourite = !next.favourite;
        else next.archived = !next.archived;
      },
    );
    store.select(null);
  };
  const runMenuAction = (action: string) => {
    if (action === "import") return importFile();
    if (action === "restore") return restore();
    if (action === "profile") return profile();
    if (action === "adjustments" || action === "delete") return open(action);
    if (action === "new") return void submit(() => store.add([freshManager()]));
    if (action === "duplicate") return void submit(() => store.duplicate());
    if (action === "pdf") return void exportPDF().then(() => setModal(""));
    if (action === "json") {
      exportRecord(record);
      setModal("");
      return;
    }
    if (action === "backup") {
      backupLibrary();
      setModal("");
      return;
    }
    if (action === "archive" || action === "favourite") {
      const label =
        action === "favourite"
          ? "Changed character favourite"
          : record.archived
            ? "Restored character"
            : "Archived character";
      return void submit(() =>
        store.edit(label, (next) => {
          if (action === "favourite") next.favourite = !next.favourite;
          else next.archived = !next.archived;
        }),
      );
    }
  };
  const alerts = (
    <>
      {state.error && (
        <div className="manager-notice manager-error" role="alert">
          <p>{state.error}</p>
          {state.dirty && (
            <div className="manager-inline">
              <button
                type="button"
                onClick={() =>
                  download(record, `${filename(sheet.name)}-unsaved.json`)
                }
              >
                Download unsaved copy
              </button>
              <button type="button" onClick={() => void store.retry()}>
                Retry saving
              </button>
              <button type="button" onClick={() => void store.duplicate()}>
                Save as duplicate
              </button>
              <button
                className="quiet"
                type="button"
                onClick={() => open("reload")}
              >
                Reload saved character
              </button>
            </div>
          )}
        </div>
      )}
      {state.unsavedCount > 0 && !state.dirty && (
        <div className="manager-notice" role="alert">
          <p>
            {state.unsavedCount} character
            {state.unsavedCount === 1 ? " has" : "s have"} unsaved changes in
            this tab. Back up the library before closing.
          </p>
          <button type="button" onClick={() => navigate(store.firstUnsaved())}>
            Open unsaved character
          </button>
        </div>
      )}
      {notice && (
        <p className="manager-notice" role="status">
          {notice}
        </p>
      )}
    </>
  );
  return (
    <>
      <input
        ref={file}
        type="file"
        accept=".json,application/json"
        hidden
        aria-label="Import character JSON"
        onChange={(e) => void loadFile(e.target.files?.[0])}
      />
      <input
        ref={portrait}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        aria-label="Import character portrait"
        onChange={(e) => void loadPortrait(e.target.files?.[0])}
      />
      {portal &&
        createPortal(
          <button
            className="mobile-menu-launcher quiet"
            type="button"
            aria-label="Open manager menu"
            aria-haspopup="dialog"
            aria-controls="creator-menu"
            aria-expanded={menu}
            onClick={(event) => {
              menuTrigger.current = event.currentTarget;
              setMenu(true);
            }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>,
          portal,
        )}
      <CreatorMenu
        mode="manager"
        verify={verify}
        open={menu}
        onClose={() => setMenu(false)}
        status={state.message}
        trigger={menuTrigger.current}
      >
        <button className="quiet" type="button" onClick={() => navigate(null)}>
          Character library
        </button>
        {menuActions}
        {historyControls}
        <span data-install-slot />
      </CreatorMenu>
      <ManagerWorkspace
        state={state}
        section={section}
        view={view}
        edit={edit}
        open={open}
        navigate={(id, section, view) => navigate(id, section, true, view)}
        profile={profile}
        verify={verify}
        menuActions={menuActions}
        importFile={importFile}
        restore={restore}
        backup={backupLibrary}
        create={() => void store.add([freshManager()])}
        exportRecord={exportRecord}
        libraryAction={libraryAction}
        download={download}
        historyControls={historyControls}
        alerts={alerts}
      />
      {modal && (
        <Dialog
          key={modal}
          trigger={dialogTrigger.current}
          title={
            (
              {
                import: form.restore
                  ? "Restore library backup"
                  : "Import characters",
                "new-actions": "New & import",
                "file-actions": "Save & export",
                "character-actions": "Character actions",
                award: "Award XP",
                resource: "Set current resource",
                fate: "Change Fate",
                condition: "Record Condition",
                journal: "Add journal entry",
                acquire: "Acquire equipment",
                entry: "Add character entry",
                career: "Change Career",
                money: "Money transaction",
                delete: "Permanently delete character",
                reload: "Reload saved character",
                profile: "Edit profile",
                adjustments: "Adjust sheet",
                stat: "Characteristic calculation",
              } as Record<string, string>
            )[modal] || "Character manager"
          }
          close={close}
        >
          {error && (
            <p className="manager-notice manager-error" role="alert">
              {error}
            </p>
          )}
          {["new-actions", "file-actions", "character-actions"].includes(
            modal,
          ) && (
            <ActionGroups
              group={modal}
              record={record}
              disabled={busy || state.saving}
              act={runMenuAction}
            />
          )}
          {discard && (
            <div className="manager-notice" role="alert">
              <p>
                Discard your unsaved{" "}
                {modal === "journal" ? "journal" : "profile"} changes?
              </p>
              <div className="manager-inline">
                <button
                  type="button"
                  className="quiet"
                  onClick={() => setDiscard(false)}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  className="manager-danger-text"
                  onClick={() => {
                    portraitEpoch.current++;
                    setDiscard(false);
                    setModal("");
                  }}
                >
                  Discard changes
                </button>
              </div>
            </div>
          )}
          {modal === "adjustments" && (
            <AdjustmentEditor
              record={record}
              result={result}
              catalogue={state.catalogue}
              edit={edit}
              changeFate={() => open("fate", { value: sheet.fate })}
            />
          )}
          {modal === "stat" && (
            <>
              <p>
                {form.key}: <strong>{score(result.stats[form.key])}</strong>
              </p>
              <p>
                Initial {score(sheet.characteristics[form.key].initial)} +{" "}
                {score(sheet.characteristics[form.key].advances)} Advances +{" "}
                {score(sheet.characteristics[form.key].modifier)} modifier.
                Talent and equipment effects use the character's current
                calculations.
              </p>
              <div className="manager-inline">
                <button
                  type="button"
                  className="quiet"
                  onClick={() => {
                    close();
                    navigate(record.id, "advancement");
                  }}
                >
                  Improve with XP
                </button>
                <button
                  type="button"
                  className="quiet"
                  onClick={() => open("adjustments")}
                >
                  Adjust sheet
                </button>
              </div>
            </>
          )}
          {modal === "profile" && (
            <form
              className="manager-form"
              onSubmit={(e) => {
                e.preventDefault();
                void submit(() =>
                  store.edit("Updated profile", (r) => {
                    for (const key of [
                      "name",
                      "appearance",
                      "ambition",
                      "partyAmbition",
                      "notes",
                    ])
                      r.sheet[key] = form[key] || "";
                    if (form.portrait) r.portrait = form.portrait;
                    else delete r.portrait;
                  }),
                );
              }}
            >
              {form.portrait && (
                <img
                  className="manager-profile-portrait"
                  src={form.portrait}
                  alt="Portrait preview"
                />
              )}
              <div className="manager-inline">
                <button
                  type="button"
                  className="quiet"
                  onClick={() => portrait.current?.click()}
                >
                  {form.portrait ? "Change portrait" : "Add portrait"}
                </button>
                {form.portrait && (
                  <button
                    type="button"
                    className="quiet"
                    onClick={() => updateForm("portrait", "")}
                  >
                    Remove portrait
                  </button>
                )}
              </div>
              <Field
                id="manager-name"
                label="Character name"
                value={form.name || ""}
                onValue={(value) => updateForm("name", value)}
              />
              {[
                ["appearance", "Appearance"],
                ["ambition", "Personal ambition"],
                ["partyAmbition", "Party ambition"],
                ["notes", "Background & notes"],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  id={`manager-${key}`}
                  label={label}
                  area
                  value={form[key] || ""}
                  onValue={(value) => updateForm(key, value)}
                />
              ))}
              <button
                type="submit"
                className="manager-primary"
                disabled={busy || state.saving}
              >
                Save profile
              </button>
            </form>
          )}
          {modal === "import" && (
            <>
              <p>
                Import a Player, Marijan, manager character, or complete library
                backup. Every imported character gets the same tools.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => file.current?.click()}
              >
                Choose JSON file
              </button>
              {busy && <p role="status">Reading character data…</p>}
              {preview.length > 0 && (
                <>
                  <ul className="manager-preview">
                    {preview.map((r, i) => {
                      const projected = calculateManager(state.catalogue, r);
                      return (
                        <li key={i}>
                          <strong>{r.sheet.name || "Unnamed character"}</strong>
                          <br />
                          {r.sheet.species || "Species not entered"} ·{" "}
                          {projected.career?.name || "Career not entered"} ·{" "}
                          {score(r.sheet.xpUnspent)} XP available
                          {state.records.some((x) => x.id === r.id) ? (
                            <strong> · Existing character ID</strong>
                          ) : (
                            ""
                          )}
                          <details>
                            <summary>Review Characteristic totals</summary>
                            <dl className="manager-preview-stats">
                              {KEYS.map((key: string) => (
                                <div key={key}>
                                  <dt>{key}</dt>
                                  <dd>{score(projected.stats[key])}</dd>
                                </div>
                              ))}
                            </dl>
                          </details>
                        </li>
                      );
                    })}
                  </ul>
                  <Select
                    id="restore-policy"
                    label="When importing"
                    value={restorePolicy}
                    options={[
                      ["copy", "Create independent copies"],
                      ["skip", "Skip existing character IDs"],
                      ["replace", "Replace matching character IDs"],
                    ]}
                    onValue={setRestorePolicy}
                  />
                  <p>
                    Creator drafts stay unchanged. Imported rolls remain
                    historical records.{" "}
                    {restorePolicy === "replace" &&
                      "Matching manager characters will be replaced by this backup."}
                  </p>
                  <button
                    type="button"
                    disabled={state.saving}
                    onClick={() =>
                      void submit(() =>
                        store.add(
                          preview,
                          restorePolicy as any,
                          previewRevisions.current,
                        ),
                      )
                    }
                  >
                    Import {preview.length} character
                    {preview.length === 1 ? "" : "s"}
                  </button>
                </>
              )}
            </>
          )}
          {[
            "award",
            "condition",
            "journal",
            "resource",
            "fate",
            "money",
            "career",
            "acquire",
            "entry",
          ].includes(modal) && (
            <form
              className="manager-form"
              onSubmit={(e) => {
                e.preventDefault();
                void submit(async () => {
                  if (modal === "award")
                    await store.edit("Awarded XP", (r) =>
                      awardXP(r, Number(form.amount), form.note || ""),
                    );
                  if (modal === "resource")
                    await store.edit("Resource changed", (r) =>
                      changeResource(r, form.key, Number(form.value)),
                    );
                  if (modal === "fate")
                    await store.edit("Fate changed", (r) => {
                      if (
                        !Number.isSafeInteger(Number(form.value)) ||
                        Number(form.value) < 0
                      )
                        throw Error("Enter non-negative whole Fate.");
                      const old = r.sheet.fate;
                      r.sheet.fate = Number(form.value);
                      addEvent(
                        r,
                        `Fate: ${old} → ${r.sheet.fate}`,
                        "Permanent resource value changed; Fortune unchanged.",
                        "resource",
                      );
                    });
                  if (modal === "condition")
                    await store.edit("Condition recorded", (r) =>
                      addCondition(
                        r,
                        form.name || "",
                        Number(form.amount),
                        form.note || "",
                      ),
                    );
                  if (modal === "journal")
                    await store.edit(
                      form.id ? "Journal entry updated" : "Journal entry added",
                      (r) => {
                        if (!form.title?.trim())
                          throw Error("Enter a journal title.");
                        if (form.id) {
                          const entry = r.journal.find(
                            (x: any) => x.id === form.id,
                          );
                          if (!entry)
                            throw Error("This entry is no longer available.");
                          Object.assign(entry, {
                            title: form.title.trim(),
                            text: form.text || "",
                            kind: form.kind || "Session",
                          });
                          addEvent(
                            r,
                            `Updated journal: ${form.title.trim()}`,
                            form.kind || "Session",
                            "journal",
                          );
                        } else
                          addJournal(
                            r,
                            form.title,
                            form.text || "",
                            form.kind || "Session",
                          );
                      },
                    );
                  if (modal === "career")
                    await store.edit("Career changed", (r) =>
                      changeCareer(
                        state.catalogue,
                        r,
                        form.id,
                        !!form.confirmed,
                      ),
                    );
                  if (modal === "money")
                    await store.edit("Money transaction", (r) => {
                      const coins = [
                        Number(form.gc || 0),
                        Number(form.ss || 0),
                        Number(form.d || 0),
                      ];
                      if (
                        coins.some(
                          (value) => !Number.isSafeInteger(value) || value < 0,
                        )
                      )
                        throw Error("Enter non-negative whole coins.");
                      const entered = coins[0] * 240 + coins[1] * 12 + coins[2];
                      if (!Number.isSafeInteger(entered) || entered <= 0)
                        throw Error("Enter a positive amount of money.");
                      const amount =
                        form.direction === "spend" ? -entered : entered;
                      const total =
                        r.sheet.coins.gc * 240 +
                        r.sheet.coins.ss * 12 +
                        r.sheet.coins.d +
                        amount;
                      if (total < 0) throw Error("Not enough money.");
                      r.sheet.coins = {
                        gc: Math.floor(total / 240),
                        ss: Math.floor((total % 240) / 12),
                        d: total % 12,
                      };
                      addEvent(
                        r,
                        `Money ${amount >= 0 ? "+" : ""}${amount} pennies`,
                        form.note || "",
                        "equipment",
                      );
                    });
                  if (modal === "acquire")
                    await store.edit("Equipment acquired", (r) => {
                      if (
                        form.price === null ||
                        form.price === undefined ||
                        form.price === ""
                      )
                        throw Error(
                          "Enter the total price paid, or choose Gift / loot.",
                        );
                      acquire(
                        state.catalogue,
                        r,
                        form.id,
                        Number(form.amount || 1),
                        Number(form.price || 0),
                        form.note || "",
                      );
                    });
                  if (modal === "entry")
                    await store.edit("Recorded GM adjustment", (r) => {
                      if (!form.note?.trim())
                        throw Error("Record a reason for this GM adjustment.");
                      const row = form.custom
                        ? {
                            name: form.name,
                            custom: true,
                            text: form.text || "",
                            char: form.char || "Int",
                          }
                        : state.catalogue.rows.find(
                            (x: any) => x.id === form.id,
                          );
                      if (!row || !row.name?.trim())
                        throw Error("Choose an entry or enter a custom name.");
                      if (
                        !Number.isSafeInteger(Number(form.amount)) ||
                        Number(form.amount) < 0
                      )
                        throw Error("Enter a non-negative whole amount.");
                      const entry = makeEntry(row, form.group);
                      entry.amount = Number(form.amount);
                      r.sheet.entries[form.group].push(entry);
                      addEvent(
                        r,
                        `Added ${entry.name}`,
                        `${form.note} · GM adjustment, no XP charged.`,
                        "adjustment",
                      );
                    });
                });
              }}
            >
              {modal === "award" && (
                <>
                  <Field
                    id="award-amount"
                    label="XP to award"
                    numeric
                    value={form.amount}
                    onValue={(value) => updateForm("amount", value)}
                  />
                  <Field
                    id="award-note"
                    label="Session / reason"
                    value={form.note}
                    onValue={(value) => updateForm("note", value)}
                  />
                </>
              )}
              {modal === "resource" && (
                <>
                  <p>
                    Set current {form.key === "wounds" ? "Wounds" : "Fortune"}.
                    The calculated maximum stays unchanged.
                  </p>
                  <Field
                    id="resource-value"
                    label="Current value"
                    numeric
                    value={form.value}
                    onValue={(value) => updateForm("value", value)}
                  />
                </>
              )}
              {modal === "fate" && (
                <>
                  <p>
                    This changes your permanent Fate value. It does not spend or
                    restore Fortune.
                  </p>
                  <Field
                    id="fate-value"
                    label="New Fate value"
                    numeric
                    value={form.value}
                    onValue={(value) => updateForm("value", value)}
                  />
                </>
              )}
              {modal === "condition" && (
                <ConditionFields
                  catalogue={state.catalogue}
                  value={form}
                  change={(patch) => setForm((old) => ({ ...old, ...patch }))}
                />
              )}
              {modal === "journal" && (
                <>
                  <Select
                    id="journal-kind"
                    label="Entry type"
                    value={form.kind}
                    options={[
                      "Session",
                      "Background",
                      "Ambition",
                      "Downtime",
                      "Familiar",
                      "Hireling",
                      "Enterprise",
                      "Injury",
                      "Other",
                    ]}
                    onValue={(value) => updateForm("kind", value)}
                  />
                  <Field
                    id="journal-title"
                    label="Title"
                    value={form.title}
                    onValue={(value) => updateForm("title", value)}
                  />
                  <Field
                    id="journal-text"
                    label="Notes"
                    area
                    value={form.text}
                    onValue={(value) => updateForm("text", value)}
                  />
                </>
              )}
              {modal === "money" && (
                <>
                  <Select
                    id="money-direction"
                    label="Transaction"
                    value={form.direction || "receive"}
                    options={[
                      ["receive", "Receive money"],
                      ["spend", "Spend money"],
                    ]}
                    onValue={(value) => updateForm("direction", value)}
                  />
                  <div className="manager-grid">
                    {[
                      ["gc", "Gold crowns"],
                      ["ss", "Silver shillings"],
                      ["d", "Brass pennies"],
                    ].map(([key, label]) => (
                      <Field
                        key={key}
                        id={`money-${key}`}
                        label={label}
                        numeric
                        value={form[key] || 0}
                        onValue={(value) => updateForm(key, value)}
                      />
                    ))}
                  </div>
                  <Field
                    id="money-note"
                    label="Reason"
                    value={form.note || ""}
                    onValue={(value) => updateForm("note", value)}
                  />
                  <p className="manager-transaction-preview">
                    Balance after transaction:{" "}
                    {formatMoney(
                      sheet.coins.gc * 240 +
                        sheet.coins.ss * 12 +
                        sheet.coins.d +
                        (form.direction === "spend" ? -1 : 1) *
                          (Number(form.gc || 0) * 240 +
                            Number(form.ss || 0) * 12 +
                            Number(form.d || 0)),
                    )}
                  </p>
                </>
              )}
              {modal === "career" && (
                <>
                  <Select
                    id="new-career"
                    label="New Career"
                    value={form.id}
                    options={[
                      ["", "Choose a Career"],
                      ...state.catalogue.careers
                        .filter(
                          (c: any) => (c.contentId || c.id) !== sheet.career,
                        )
                        .map((c: any) => [
                          c.contentId || c.id,
                          `${c.name} · ${c.source.book} · ${c.class === result.career?.class ? 100 : 200} XP`,
                        ]),
                    ]}
                    onValue={(value) => updateForm("id", value)}
                  />
                  <p>
                    Core p. 197: 100 XP within your current Class, or 200 XP for
                    another Class. Existing Advances, Talents, and possessions
                    are retained. The new Career starts at level 1 with a fresh
                    tracker and no creation grants.
                  </p>
                  <label className="manager-check">
                    <input
                      type="checkbox"
                      checked={!!form.confirmed}
                      onChange={(e) =>
                        updateForm("confirmed", e.target.checked)
                      }
                    />
                    GM agreement and the Change Career Endeavour are complete.
                  </label>
                </>
              )}
              {(modal === "acquire" || modal === "entry") && (
                <>
                  <CataloguePicker
                    catalogue={state.catalogue}
                    group={modal === "acquire" ? "gear" : form.group}
                    value={form.id || ""}
                    onValue={(id) => {
                      const row = state.catalogue.rows.find(
                        (x: any) => x.id === id,
                      );
                      setForm((old) => ({
                        ...old,
                        id,
                        price: old.gift
                          ? 0
                          : listedPrice(row) === null
                            ? null
                            : Number(listedPrice(row)) * (old.amount ?? 1),
                        priceEdited: false,
                        amount: old.amount ?? 1,
                      }));
                    }}
                  />
                  {modal === "entry" && (
                    <>
                      <label className="manager-check">
                        <input
                          type="checkbox"
                          checked={!!form.custom}
                          onChange={(e) =>
                            updateForm("custom", e.target.checked)
                          }
                        />
                        Use a custom entry
                      </label>
                      {form.custom && (
                        <>
                          <Field
                            id="custom-entry-name"
                            label="Custom name"
                            value={form.name || ""}
                            onValue={(value) => updateForm("name", value)}
                          />
                          <Field
                            id="custom-entry-text"
                            label="Description"
                            area
                            value={form.text || ""}
                            onValue={(value) => updateForm("text", value)}
                          />
                          {form.group === "skills" && (
                            <Select
                              id="custom-entry-char"
                              label="Characteristic"
                              value={form.char || "Int"}
                              options={KEYS}
                              onValue={(value) => updateForm("char", value)}
                            />
                          )}
                        </>
                      )}
                    </>
                  )}
                  <Field
                    id="entry-amount"
                    label={
                      modal === "acquire"
                        ? "Quantity"
                        : form.group === "skills"
                          ? "Advances"
                          : "Ranks / count"
                    }
                    numeric
                    value={form.amount ?? 1}
                    onValue={(value) =>
                      setForm((old) => ({
                        ...old,
                        amount: value,
                        price:
                          modal !== "acquire" || old.priceEdited || old.gift
                            ? old.price
                            : old.id &&
                                listedPrice(
                                  state.catalogue.rows.find(
                                    (x: any) => x.id === old.id,
                                  ),
                                ) !== null
                              ? Number(
                                  listedPrice(
                                    state.catalogue.rows.find(
                                      (x: any) => x.id === old.id,
                                    ),
                                  ),
                                ) * Number(value)
                              : null,
                      }))
                    }
                  />
                  {modal === "acquire" && (
                    <>
                      <label className="manager-check">
                        <input
                          type="checkbox"
                          checked={!!form.gift}
                          onChange={(e) =>
                            setForm((old) => ({
                              ...old,
                              gift: e.target.checked,
                              price: e.target.checked ? 0 : null,
                              priceEdited: false,
                            }))
                          }
                        />
                        Gift / loot (no payment)
                      </label>
                      {!form.gift && (
                        <Field
                          id="entry-price"
                          label="Total price paid (pennies)"
                          numeric
                          nullable
                          value={form.price ?? null}
                          onValue={(value) =>
                            setForm((old) => ({
                              ...old,
                              price: value,
                              priceEdited: true,
                            }))
                          }
                        />
                      )}
                      <p className="manager-transaction-preview">
                        Balance after acquisition:{" "}
                        {form.price === null || form.price === undefined
                          ? "Enter the transaction price"
                          : formatMoney(
                              sheet.coins.gc * 240 +
                                sheet.coins.ss * 12 +
                                sheet.coins.d -
                                Number(form.price),
                            )}
                      </p>
                      <p className="manager-meta">
                        Listed unit price:{" "}
                        {form.id
                          ? listedPrice(
                              state.catalogue.rows.find(
                                (x: any) => x.id === form.id,
                              ),
                            ) === null
                            ? "Unknown — enter an agreed transaction price."
                            : formatMoney(
                                listedPrice(
                                  state.catalogue.rows.find(
                                    (x: any) => x.id === form.id,
                                  ),
                                ),
                              )
                          : "Choose an item"}
                        . The entered total is the actual transaction price.
                      </p>
                    </>
                  )}
                  <Field
                    id="entry-note"
                    label={
                      modal === "entry"
                        ? "GM adjustment reason (required)"
                        : "Acquisition note"
                    }
                    value={form.note || ""}
                    onValue={(value) => updateForm("note", value)}
                  />
                </>
              )}
              <button type="submit" disabled={busy || state.saving}>
                {busy || state.saving
                  ? "Saving…"
                  : modal === "career"
                    ? "Change Career"
                    : modal === "acquire"
                      ? "Acquire equipment"
                      : modal === "money"
                        ? form.direction === "spend"
                          ? "Spend money"
                          : "Receive money"
                        : modal === "journal" && form.id
                          ? "Save entry"
                          : "Record change"}
              </button>
            </form>
          )}
          {modal === "reload" && (
            <>
              <p>
                Download your unsaved copy first if you want to keep it.
                Reloading discards this tab’s unsaved edits and session Undo
                history.
              </p>
              <button
                type="button"
                onClick={() => void submit(() => store.reload())}
              >
                Reload saved character
              </button>
            </>
          )}
          {modal === "delete" && (
            <>
              <p>
                Permanently delete {sheet.name || "this character"} and its
                stored history from this browser. Export a backup first if you
                may need it again.
              </p>
              <button
                type="button"
                disabled={state.saving || state.dirty}
                onClick={() =>
                  void submit(() => store.remove(record.id, record.revision))
                }
              >
                Permanently delete character
              </button>
              <button className="quiet" type="button" onClick={close}>
                Keep character
              </button>
            </>
          )}
        </Dialog>
      )}
    </>
  );
}

function CataloguePicker({
  catalogue,
  group,
  value,
  onValue,
}: {
  catalogue: any;
  group: string;
  value: string;
  onValue: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const rows = catalogue.rows.filter(
    (x: any) =>
      x.collection === group &&
      x.name.toLowerCase().includes(query.toLowerCase()),
  );
  const selected = catalogue.rows.find((x: any) => x.id === value);
  const options = rows.slice(0, 150);
  if (selected && !options.some((x: any) => x.id === value))
    options.unshift(selected);
  return (
    <>
      <Field
        id="catalogue-find"
        label="Find catalogue entry"
        value={query}
        onValue={setQuery}
      />
      <Select
        id="catalogue-entry"
        label="Catalogue entry"
        value={value}
        options={[
          ["", "Choose an entry"],
          ...options.map((x: any) => [
            x.id,
            `${x.name} · ${x.source?.book || "custom"}`,
          ]),
        ]}
        onValue={onValue}
      />
      {selected && (
        <div className="manager-catalogue-preview">
          <strong>{selected.name}</strong>
          <p>
            {entryDescription(catalogue, selected) ||
              "No description recorded."}
          </p>
          {selected.source && (
            <button
              type="button"
              className="manager-text"
              onClick={() =>
                requestReference({
                  name: selected.name,
                  book: selected.source.book,
                })
              }
            >
              {entrySource(catalogue, selected)}
            </button>
          )}
        </div>
      )}
      {rows.length > 150 && (
        <p className="manager-meta">
          Showing 150 of {rows.length} matches. Narrow the search to find
          another entry.
        </p>
      )}
    </>
  );
}
