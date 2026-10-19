import { liveQuery } from "dexie";
import { CharacterDatabase } from "./database";
import { loadLibrary, loadJSON } from "../../services/content";
import { createMarijanCatalogue } from "../../engine/marijan/catalogue.mjs";
import {
  calculateManager,
  validateManager,
  event,
} from "../../engine/manager/model.mjs";

type Session = { record: any; undo: any[]; redo: any[]; dirty: boolean };
type Snapshot = {
  status: "idle" | "loading" | "ready" | "error";
  records: any[];
  selected: string | null;
  record: any;
  result: any;
  catalogue: any;
  library: any;
  error: string;
  message: string;
  saving: boolean;
  dirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  unsavedCount: number;
};
export function createManagerStore(verify = false) {
  const db = new CharacterDatabase(verify);
  let state: Snapshot = {
    status: "idle",
    records: [],
    selected: null,
    record: null,
    result: null,
    catalogue: null,
    library: null,
    error: "",
    message: "",
    saving: false,
    dirty: false,
    canUndo: false,
    canRedo: false,
    unsavedCount: 0,
  };
  const listeners = new Set<() => void>();
  const sessions = new Map<string, Session>();
  let pending: Promise<void> | undefined;
  let queue = Promise.resolve();
  let queued = 0;
  let subscription: { unsubscribe: () => void } | undefined;
  let guardsAttached = false;
  const hasUnsaved = () =>
    [...sessions.values()].some((session) => session.dirty);
  function emit(updates: Partial<Snapshot> = {}) {
    state = { ...state, ...updates };
    const current = state.selected ? sessions.get(state.selected) : undefined;
    state = {
      ...state,
      record: current?.record || null,
      result: current
        ? calculateManager(state.catalogue, current.record)
        : null,
      dirty: !!current?.dirty,
      canUndo: !!current?.undo.length,
      canRedo: !!current?.redo.length,
      unsavedCount: [...sessions.values()].filter((s) => s.dirty).length,
    };
    listeners.forEach((fn) => fn());
  }
  function enqueue(task: () => Promise<void>) {
    queued++;
    emit({ saving: true });
    const result = queue.then(task).catch((error) => {
      emit({
        error: error instanceof Error ? error.message : String(error),
        message: "Unsaved changes — download a backup before reloading.",
      });
    });
    queue = result.finally(() => {
      queued--;
      emit({ saving: queued > 0 });
    });
    return queue;
  }
  async function saveSession(id: string, next: any) {
    const session = sessions.get(id)!;
    const expected = session.record.revision;
    session.record = validateManager(next);
    session.dirty = true;
    emit({ error: "", message: "Saving…" });
    const saved = await db.save(session.record, expected);
    session.record = saved;
    session.dirty = false;
    state.records = [...state.records.filter((x) => x.id !== id), saved];
    emit({ message: "Saved on this device", error: "" });
  }
  const store = {
    db,
    getSnapshot: () => state,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    initialize() {
      if (state.status === "ready") return Promise.resolve();
      if (pending) return pending;
      emit({ status: "loading", error: "" });
      pending = (async () => {
        try {
          const [library, creatures] = await Promise.all([
            loadLibrary(),
            loadJSON("/gm/data.json"),
          ]);
          const catalogue = createMarijanCatalogue(library, creatures);
          await db.open();
          const records = (await db.characters.toArray()).map(validateManager);
          if (!guardsAttached && typeof window !== "undefined") {
            guardsAttached = true;
            window.addEventListener("beforeunload", (event) => {
              if (queued || hasUnsaved()) event.preventDefault();
            });
            window.addEventListener("wfrp-before-update", (event) => {
              (event as CustomEvent).detail?.waitUntil?.(
                queue.then(() => {
                  if (hasUnsaved())
                    throw Error(
                      "Save or export unsaved manager characters before updating.",
                    );
                }),
              );
            });
          }
          emit({
            status: "ready",
            records,
            catalogue,
            library,
            message:
              "Saved locally in this browser. Export backups to move devices.",
          });
        } catch (error) {
          emit({
            status: "error",
            error: error instanceof Error ? error.message : String(error),
          });
        } finally {
          pending = undefined;
        }
      })();
      return pending;
    },
    observe() {
      subscription?.unsubscribe();
      subscription = liveQuery(() => db.characters.toArray()).subscribe({
        next: (values) => {
          try {
            emit({ records: values.map(validateManager) });
          } catch {
            emit({
              error:
                "A saved character needs recovery. Export your library before making changes.",
            });
          }
        },
        error: () =>
          emit({
            error: "Cannot read device storage. Download a backup and retry.",
          }),
      });
      return () => subscription?.unsubscribe();
    },
    select(id: string | null) {
      if (id && !sessions.has(id)) {
        const record = state.records.find((x) => x.id === id);
        if (!record) {
          emit({
            error:
              "This character is not available in this browser. Import its JSON backup first.",
          });
          return;
        }
        sessions.set(id, {
          record: validateManager(record),
          undo: [],
          redo: [],
          dirty: false,
        });
      }
      emit({
        selected: id,
        error:
          id && sessions.get(id)?.dirty
            ? "This character has unsaved changes. Retry saving, save a duplicate, or reload the saved character."
            : "",
      });
    },
    edit(label: string, change: (record: any) => void, detail = "") {
      const id = state.selected;
      if (!id) return Promise.resolve();
      return enqueue(async () => {
        const session = sessions.get(id)!;
        if (session.dirty)
          throw Error(
            "Resolve the unsaved changes before editing further. Retry saving, reload the saved character, or save a duplicate.",
          );
        const next = structuredClone(session.record);
        change(next);
        if (JSON.stringify(next) === JSON.stringify(session.record)) return;
        if (next.history.length === session.record.history.length)
          event(next, label, detail);
        validateManager(next);
        session.undo.push(structuredClone(session.record));
        if (session.undo.length > 60) session.undo.shift();
        session.redo = [];
        await saveSession(id, next);
      });
    },
    undo(redo = false) {
      const id = state.selected;
      if (!id) return Promise.resolve();
      return enqueue(async () => {
        const session = sessions.get(id)!;
        if (session.dirty)
          throw Error("Resolve unsaved changes before using history.");
        const source = redo ? session.redo : session.undo,
          destination = redo ? session.undo : session.redo;
        if (!source.length) return;
        const next = structuredClone(source.pop());
        destination.push(structuredClone(session.record));
        next.revision = session.record.revision;
        next.history = [...session.record.history];
        event(
          next,
          redo ? "Redid previous change" : "Undid previous change",
          "Restored the complete character state; audit history retained.",
          "history",
        );
        await saveSession(id, next);
      });
    },
    add(
      records: any[],
      policy: "copy" | "replace" | "skip" = "copy",
      expected = new Map(state.records.map((x) => [x.id, x.revision])),
    ) {
      return enqueue(async () => {
        const saved = await db.restore(records, policy, expected);
        for (const record of saved) {
          sessions.set(record.id, { record, undo: [], redo: [], dirty: false });
          state.records = [
            ...state.records.filter((x) => x.id !== record.id),
            record,
          ];
        }
        emit({
          selected: saved.length === 1 ? saved[0].id : null,
          message: `Saved ${saved.length} character${saved.length === 1 ? "" : "s"} on this device`,
          error: "",
        });
      });
    },
    duplicate() {
      const record = structuredClone(state.record);
      if (!record) return Promise.resolve();
      record.id = crypto.randomUUID();
      record.revision = 0;
      record.sheet.name = `${record.sheet.name || "Character"} (copy)`;
      event(
        record,
        "Character duplicated",
        "Independent character with its own history.",
      );
      return store.add([record]);
    },
    retry() {
      const id = state.selected;
      return id
        ? enqueue(async () => {
            await saveSession(id, sessions.get(id)!.record);
          })
        : Promise.resolve();
    },
    reload() {
      const id = state.selected;
      if (!id) return Promise.resolve();
      return enqueue(async () => {
        const record = await db.characters.get(id);
        if (!record)
          throw Error("The saved character was removed in another tab.");
        sessions.set(id, {
          record: validateManager(record),
          undo: [],
          redo: [],
          dirty: false,
        });
        emit({ error: "", message: "Reloaded saved character" });
      });
    },
    remove(id: string, expected: number) {
      return enqueue(async () => {
        await db.transaction("rw", db.characters, async () => {
          const record = await db.characters.get(id);
          if (!record || record.revision !== expected)
            throw Error(
              "The character changed in another tab. Reload before deleting.",
            );
          await db.characters.delete(id);
        });
        sessions.delete(id);
        emit({
          selected: null,
          records: state.records.filter((x) => x.id !== id),
          message: "Character permanently deleted",
          error: "",
        });
      });
    },
    flush: () => queue,
    hasUnsaved,
    firstUnsaved: () =>
      [...sessions.entries()].find(([, session]) => session.dirty)?.[0] || null,
    allRecords() {
      const records = new Map(state.records.map((x) => [x.id, x]));
      for (const [id, session] of sessions)
        if (session.dirty) records.set(id, session.record);
      return [...records.values()];
    },
  };
  return store;
}
const stores = new Map<boolean, ReturnType<typeof createManagerStore>>();
export function getManagerStore(verify: boolean) {
  if (!stores.has(verify)) stores.set(verify, createManagerStore(verify));
  return stores.get(verify)!;
}
