import { loadJSON, loadLibrary } from "../../services/content";
import { createDraftHistory } from "../../engine/draft-history.mjs";
import { createMarijanCatalogue } from "../../engine/marijan/catalogue.mjs";
import {
  freshMarijan,
  validateMarijan,
  calculateMarijan,
} from "../../engine/marijan/model.mjs";

// Existing JavaScript models remain the authority for the saved shape and rules.
export type MarijanSnapshot = {
  status: "idle" | "loading" | "ready" | "error";
  revision: number;
  draft: any;
  result: any;
  catalogue: any;
  library: any;
  saved: any[];
  message: string;
  error: string;
  canUndo: boolean;
  canRedo: boolean;
};

export function createMarijanStore(verify = false) {
  const storage = "wfrp-marijan-v1" + (verify ? "-verification" : "");
  let snapshot: MarijanSnapshot = {
    status: "idle",
    revision: 0,
    draft: null,
    result: null,
    catalogue: null,
    library: null,
    saved: [],
    message: "",
    error: "",
    canUndo: false,
    canRedo: false,
  };
  const listeners = new Set<() => void>();
  let history: any;
  let documentId = "";
  let pending: Promise<void> | undefined;
  const historySnapshot = () => ({
    draft: snapshot.draft,
    document: documentId,
  });
  const emit = (updates: Partial<MarijanSnapshot>) => {
    snapshot = { ...snapshot, ...updates, revision: snapshot.revision + 1 };
    listeners.forEach((listener) => listener());
  };
  function persist() {
    if (!snapshot.draft) return snapshot.message;
    try {
      localStorage.setItem(storage, JSON.stringify(snapshot.draft));
      return verify ? "Isolated test draft" : "Autosaved on this device";
    } catch {
      return "Device storage unavailable; download a JSON backup.";
    }
  }
  function publishDraft() {
    const message = persist();
    emit({
      result: calculateMarijan(snapshot.catalogue, snapshot.draft),
      message,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    });
  }
  return {
    storage,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    initialize() {
      if (snapshot.status === "ready") return Promise.resolve();
      if (pending) return pending;
      emit({ status: "loading", error: "" });
      pending = (async () => {
        try {
          const [library, creatures] = await Promise.all([
            loadLibrary(),
            loadJSON("/gm/data.json"),
          ]);
          const catalogue = createMarijanCatalogue(library, creatures);
          let draft = freshMarijan();
          let saved: any[] = [];
          let message = verify
            ? "Isolated test draft"
            : "Autosaved on this device";
          try {
            const raw = localStorage.getItem(storage);
            if (raw) draft = validateMarijan(JSON.parse(raw));
            const records = JSON.parse(
              localStorage.getItem(storage + "-saves") || "[]",
            );
            if (Array.isArray(records))
              saved = records.map((x) => ({
                at: x.at,
                draft: validateMarijan(x.draft),
              }));
          } catch (error) {
            message = error instanceof Error ? error.message : String(error);
          }
          snapshot = { ...snapshot, draft, catalogue, library, saved, message };
          documentId = crypto.randomUUID();
          history = createDraftHistory(historySnapshot());
          emit({ status: "ready", result: calculateMarijan(catalogue, draft) });
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
    edit(change: (draft: any) => void, group: string | null = null) {
      const previous = JSON.stringify(snapshot.draft);
      // Commands clone so every published React snapshot stays immutable.
      const next = structuredClone(snapshot.draft);
      change(next);
      if (JSON.stringify(next) === previous) return false;
      snapshot = { ...snapshot, draft: next };
      history.record(historySnapshot(), { group });
      publishDraft();
      return true;
    },
    replace(draft: any) {
      snapshot = { ...snapshot, draft: validateMarijan(draft) };
      documentId = crypto.randomUUID();
      history.record(historySnapshot());
      publishDraft();
    },
    breakGroup() {
      history?.breakGroup();
    },
    travel(direction: "undo" | "redo") {
      const next = history?.travel(direction);
      if (!next) return;
      snapshot = { ...snapshot, draft: next.draft };
      documentId = next.document;
      publishDraft();
    },
    save() {
      const saved = [...snapshot.saved];
      const existing = saved.findIndex((x) => x.draft.id === snapshot.draft.id);
      const record = {
        at: new Date().toISOString(),
        draft: structuredClone(snapshot.draft),
      };
      if (existing >= 0) saved[existing] = record;
      else saved.push(record);
      let stored = true;
      try {
        localStorage.setItem(storage + "-saves", JSON.stringify(saved));
      } catch {
        stored = false;
      }
      emit({ saved });
      return stored;
    },
    persist,
  };
}

const stores = new Map<boolean, ReturnType<typeof createMarijanStore>>();
export function getMarijanStore(verify: boolean) {
  let store = stores.get(verify);
  if (!store) {
    store = createMarijanStore(verify);
    stores.set(verify, store);
  }
  return store;
}
