import { loadLibrary, loadJSON } from "../../services/content";
import { createGMRules } from "../../engine/gm/books.mjs";
import {
  freshGM,
  validateGMDraft,
  calculateGM,
} from "../../engine/gm/model.mjs";
import { syncGMCants } from "../../engine/gm/cants.mjs";
import { createDraftHistory } from "../../engine/draft-history.mjs";
import { rollGMLoot, addGMLoot, MAX_LOOT_DICE } from "../../engine/gm/loot.mjs";

export type BestiarySnapshot = {
  ready: boolean;
  error: string;
  storageMessage: string;
  data: any;
  rules: any;
  draft: any;
  result: any;
  canUndo: boolean;
  canRedo: boolean;
  revision: number;
};
const stores = new Map<boolean, BestiaryStore>();
export const getBestiaryStore = (verify: boolean) => {
  let store = stores.get(verify);
  if (!store) {
    store = new BestiaryStore(verify);
    stores.set(verify, store);
  }
  return store;
};

// One session per mode and verification context. Wire libraries are shared;
// mutable drafts, assembled rules, result snapshots and history are not.
export class BestiaryStore {
  private listeners = new Set<() => void>();
  private loading?: Promise<void>;
  private history: any;
  private document = "";
  private rulesFor: any;
  readonly storageKey = "wfrp-gm-workshop-v1";
  private snapshot: BestiarySnapshot = {
    ready: false,
    error: "",
    storageMessage: "",
    data: null,
    rules: null,
    draft: null,
    result: null,
    canUndo: false,
    canRedo: false,
    revision: 0,
  };
  constructor(readonly verify: boolean) {}
  subscribe = (callback: () => void) => {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  };
  getSnapshot = () => this.snapshot;
  getServerSnapshot = () => initialSnapshot;
  private publish(patch: Partial<BestiarySnapshot>) {
    this.snapshot = {
      ...this.snapshot,
      ...patch,
      revision: this.snapshot.revision + 1,
    };
    for (const listener of this.listeners) listener();
  }
  initialize = () =>
    (this.loading ??= this.load().catch((error) => {
      this.loading = undefined;
      this.publish({
        error: error instanceof Error ? error.message : String(error),
      });
    }));
  private async load() {
    const [library, data] = await Promise.all([
      loadLibrary(),
      loadJSON("/gm/data.json"),
    ]);
    this.rulesFor = createGMRules(library, data);
    let draft = freshGM(data),
      error = "";
    if (!this.verify) {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const saved = JSON.parse(raw);
          draft = validateGMDraft(data, this.rulesFor(saved), saved);
        }
      } catch (problem) {
        error = `Saved draft could not be restored: ${problem instanceof Error ? problem.message : problem}. Use Load draft to inspect another save.`;
      }
    }
    this.document = crypto.randomUUID();
    this.history = createDraftHistory({ draft, document: this.document });
    const rules = this.rulesFor(draft);
    this.publish({
      ready: true,
      data,
      draft,
      rules,
      result: calculateGM(data, rules, draft),
      error,
    });
    this.persist();
  }
  persist = () => {
    if (!this.snapshot.ready) return;
    let storageMessage = "Isolated preview · personal draft unchanged";
    if (!this.verify) {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify(this.snapshot.draft),
        );
        storageMessage = "Saved on this device";
      } catch {
        storageMessage = "Device storage unavailable · use Save draft";
      }
    }
    if (storageMessage !== this.snapshot.storageMessage)
      this.publish({ storageMessage });
  };
  edit = (change: (draft: any) => unknown, group: string | null = null) => {
    if (!this.snapshot.ready) return;
    const draft = structuredClone(this.snapshot.draft);
    change(draft);
    this.install(draft, group);
  };
  replace = (draft: any) => {
    this.document = crypto.randomUUID();
    this.install(structuredClone(draft));
  };
  private install(draft: any, group: string | null = null) {
    const rules = this.rulesFor(draft);
    if (
      draft.cants.enabled ||
      Object.keys(draft.spellLores).length ||
      Object.keys(draft.cants.choices).length
    )
      syncGMCants(rules, draft, calculateGM(this.snapshot.data, rules, draft));
    this.history.record({ draft, document: this.document }, { group });
    this.publish({
      draft,
      rules,
      result: calculateGM(this.snapshot.data, rules, draft),
      canUndo: this.history.canUndo,
      canRedo: this.history.canRedo,
    });
    this.persist();
  }
  navigate = (step: number) => {
    this.edit((draft) => {
      draft.step = Math.max(0, Math.min(3, step));
    });
  };
  breakGroup = () => this.history?.breakGroup();
  rollLoot = () => {
    const { draft, rules } = this.snapshot;
    if (!draft?.profile) throw Error("Choose a starting profile first.");
    if (draft.rolls.length + MAX_LOOT_DICE > 1000)
      throw Error("This draft has reached the recorded-dice limit.");
    const result = rollGMLoot(rules);
    let error = result.error;
    this.edit((d) => {
      d.rolls.push(...result.rolls);
      if (!error) {
        try {
          addGMLoot(rules, d, result.entries);
        } catch (problem) {
          error = problem instanceof Error ? problem.message : String(problem);
        }
      }
    });
    if (error) throw Error(error);
    return result;
  };
  travel = (direction: "undo" | "redo") => {
    const next = this.history.travel(direction);
    if (!next) return;
    this.document = next.document;
    const rules = this.rulesFor(next.draft);
    this.publish({
      draft: next.draft,
      rules,
      result: calculateGM(this.snapshot.data, rules, next.draft),
      canUndo: this.history.canUndo,
      canRedo: this.history.canRedo,
    });
    this.persist();
  };
  validate = (draft: any) =>
    validateGMDraft(this.snapshot.data, this.rulesFor(draft), draft);
  calculate = (draft: any) =>
    calculateGM(this.snapshot.data, this.rulesFor(draft), draft);
}
const initialSnapshot: BestiarySnapshot = {
  ready: false,
  error: "",
  storageMessage: "",
  data: null,
  rules: null,
  draft: null,
  result: null,
  canUndo: false,
  canRedo: false,
  revision: 0,
};
