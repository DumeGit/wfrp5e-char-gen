"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { getManagerStore } from "./store";
import { CreatorMenu } from "../../components/CreatorMenu";
import { ModeNavigation } from "../../components/ModeNavigation";
import { Field, Select } from "../marijan/fields";
import { requestReference } from "../../services/content";
import {
  KEYS,
  careerTalentOptions,
  careerSkillSlots,
  options as ruleOptions,
} from "../../engine/rules.mjs";
import { score } from "../../engine/controls.mjs";
import { formatMoney } from "../../engine/market.mjs";
import {
  makeEntry,
  addEntry,
  AUTO_FIELDS,
} from "../../engine/marijan/model.mjs";
import {
  entryDescription,
  entrySource,
} from "../../engine/marijan/catalogue.mjs";
import { LABELS } from "../../engine/marijan/labels.mjs";
import {
  freshManager,
  calculateManager,
  readImport,
  backup,
  changeResource,
  awardXP,
  quoteManager,
  purchaseAdvance,
  creditTrapping,
  changeCareer,
  acquire,
  listedPrice,
  addCondition,
  addJournal,
  event as addEvent,
} from "../../engine/manager/model.mjs";

const SECTIONS = [
  ["overview", "Overview"],
  ["skills", "Skills & Talents"],
  ["gear", "Combat & Gear"],
  ["magic", "Magic & Faith"],
  ["advancement", "Advancement"],
  ["journal", "Journal & history"],
  ["session", "Session view"],
];
const GROUP_NAMES: Record<string, string> = {
  skills: "Skills",
  talents: "Talents",
  gear: "Equipment",
  magic: "Magic & prayers",
  extras: "Traits, runes & techniques",
};
type Store = ReturnType<typeof getManagerStore>;
const date = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
function Dialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    return () => {
      dialog.current?.close();
      if (opener?.isConnected) opener.focus();
    };
  }, []);
  return (
    <dialog
      className="manager-dialog"
      ref={dialog}
      aria-labelledby="manager-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          close();
      }}
    >
      <div className="dialog-heading">
        <h2 id="manager-dialog-title">{title}</h2>
        <button className="quiet" type="button" onClick={close}>
          Close
        </button>
      </div>
      {children}
    </dialog>
  );
}
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
  const [section, setSection] = useState("overview"),
    [menu, setMenu] = useState(false);
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const [modal, setModal] = useState(""),
    [error, setError] = useState("");
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("active"),
    [sort, setSort] = useState("recent");
  const [preview, setPreview] = useState<any[]>([]),
    [restorePolicy, setRestorePolicy] = useState("copy");
  const previewRevisions = useRef(new Map<string, number>());
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const [form, setForm] = useState<Record<string, any>>({});
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
    setError("");
    setNotice("");
    setForm(values);
    setModal(kind);
  }
  function navigate(id: string | null, nextSection = "overview", push = true) {
    navigatedCharacter.current = id;
    store.select(id);
    setSection(nextSection);
    setQuery("");
    if (push) {
      const url = new URL(location.href);
      if (id) {
        url.searchParams.set("character", id);
        url.searchParams.set("section", nextSection);
      } else {
        url.searchParams.delete("character");
        url.searchParams.delete("section");
      }
      window.history.pushState(null, "", url);
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
        SECTIONS.some(([id]) => id === next) ? next! : "overview",
        false,
      );
    });
    setPortal(document.getElementById("compact-tools"));
    const pop = () => {
      const p = new URLSearchParams(location.search);
      const next = p.get("section");
      navigate(
        p.get("character"),
        SECTIONS.some(([id]) => id === next) ? next! : "overview",
        false,
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
        setSection("overview");
        url.searchParams.set("section", "overview");
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
      const next = readImport(state.catalogue, state.library, JSON.parse(text));
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
      setNotice("Choose a PNG, JPEG, or WebP portrait smaller than 512 KB.");
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
      edit("Changed portrait", (r) => {
        r.portrait = reader.result;
      });
    };
    reader.onerror = () =>
      setNotice("Could not read this portrait. Try another image.");
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
        onClick={() => {
          setPreview([]);
          open("import");
        }}
      >
        Import character
      </button>
      <button
        className="quiet"
        type="button"
        onClick={() =>
          download(backup(store.allRecords()), "character-library-backup.json")
        }
        disabled={state.saving}
      >
        Back up library
      </button>
      {record && (
        <>
          <button
            className="quiet"
            type="button"
            onClick={() => download(record, `${filename(sheet.name)}.json`)}
            disabled={state.saving}
          >
            Export character JSON
          </button>
          <button
            className="quiet"
            type="button"
            disabled={busy || state.saving}
            onClick={() => void exportPDF()}
          >
            Export PDF sheet
          </button>
          <button
            className="quiet"
            type="button"
            onClick={() => void store.duplicate()}
            disabled={state.saving}
          >
            Duplicate character
          </button>
          <button
            className="quiet"
            type="button"
            onClick={() =>
              edit(
                record.archived ? "Restored character" : "Archived character",
                (r) => {
                  r.archived = !r.archived;
                },
              )
            }
          >
            {record.archived ? "Restore character" : "Archive character"}
          </button>
        </>
      )}
      <span data-install-slot />
    </>
  );
  const historyControls = (
    <>
      <button
        className="quiet"
        type="button"
        disabled={!state.canUndo || state.saving || state.dirty}
        onClick={() => void store.undo()}
      >
        Undo
      </button>
      <button
        className="quiet"
        type="button"
        disabled={!state.canRedo || state.saving || state.dirty}
        onClick={() => void store.undo(true)}
      >
        Redo
      </button>
    </>
  );
  function resources() {
    return (
      <>
        <div className="manager-resource">
          <span>Wounds</span>
          <strong>
            {score(record.current.wounds)} / {score(result.values.wounds)}
          </strong>
          <div className="manager-inline">
            <button
              type="button"
              className="quiet"
              aria-label="Lose one Wound"
              disabled={
                record.current.wounds === null || record.current.wounds <= 0
              }
              onClick={() =>
                edit("Wounds changed", (r) =>
                  changeResource(
                    r,
                    "wounds",
                    Math.max(0, r.current.wounds - 1),
                  ),
                )
              }
            >
              −
            </button>
            <button
              type="button"
              className="quiet"
              aria-label="Recover one Wound"
              disabled={
                result.values.wounds === null ||
                record.current.wounds >= result.values.wounds
              }
              onClick={() =>
                edit("Wounds changed", (r) =>
                  changeResource(
                    r,
                    "wounds",
                    Math.min(result.values.wounds, (r.current.wounds ?? 0) + 1),
                  ),
                )
              }
            >
              +
            </button>
            <button
              type="button"
              className="quiet"
              onClick={() =>
                open("resource", {
                  key: "wounds",
                  value: record.current.wounds ?? 0,
                })
              }
            >
              Set Wounds
            </button>
          </div>
        </div>
        <div className="manager-resource">
          <span>Fortune</span>
          <strong>
            {score(record.current.fortune)} / {score(sheet.fortune)}
          </strong>
          <div className="manager-inline">
            <button
              type="button"
              className="quiet"
              disabled={record.current.fortune <= 0}
              onClick={() =>
                edit("Fortune spent", (r) =>
                  changeResource(
                    r,
                    "fortune",
                    Math.max(0, r.current.fortune - 1),
                  ),
                )
              }
            >
              Spend Fortune
            </button>
            <button
              type="button"
              className="quiet"
              disabled={record.current.fortune >= sheet.fortune}
              onClick={() =>
                edit("Fortune restored", (r) =>
                  changeResource(
                    r,
                    "fortune",
                    Math.min(r.sheet.fortune, r.current.fortune + 1),
                  ),
                )
              }
            >
              Restore Fortune
            </button>
          </div>
        </div>
        <div className="manager-resource">
          <span>Fate</span>
          <strong>{score(sheet.fate)}</strong>
          <button
            className="quiet"
            type="button"
            onClick={() => open("fate", { value: sheet.fate })}
          >
            Change Fate
          </button>
        </div>
        <p>
          {score(sheet.xpUnspent)} XP available
          <br />
          {formatMoney(
            sheet.coins.gc * 240 + sheet.coins.ss * 12 + sheet.coins.d,
          )}
        </p>
      </>
    );
  }
  function entryList(group: string, rows?: any[]) {
    const entries =
      rows || (group === "skills" ? result.skills : result.entries[group]);
    return (
      <section>
        <div className="manager-inline">
          <h2>{GROUP_NAMES[group]}</h2>
          {!rows && (
            <button
              className="quiet"
              type="button"
              onClick={() =>
                open(group === "gear" ? "acquire" : "entry", {
                  group,
                  amount: 1,
                  name: "",
                  id: "",
                  note: "",
                  custom: false,
                  char: "Int",
                })
              }
            >
              {group === "gear"
                ? "Acquire equipment"
                : `Add ${group === "extras" ? "reference" : group === "magic" ? "spell / prayer" : group.slice(0, -1)}`}
            </button>
          )}
        </div>
        {!entries.length && (
          <p>
            {rows
              ? "Pin entries from the full sheet to keep them here."
              : "No entries recorded."}
          </p>
        )}
        {entries
          .filter(
            (x: any) =>
              !query ||
              `${x.name} ${x.text || ""}`
                .toLowerCase()
                .includes(query.toLowerCase()),
          )
          .map((x: any) => (
            <details className="manager-entry" key={x.key}>
              <summary>
                <strong>{x.name}</strong>
                <span>
                  {group === "skills"
                    ? score(x.total)
                    : ["talents", "gear"].includes(group)
                      ? `×${score(x.amount)}`
                      : x.kind}
                </span>
              </summary>
              <p>
                {entryDescription(state.catalogue, x) ||
                  "No description recorded."}
              </p>
              {x.source && (
                <button
                  className="quiet"
                  type="button"
                  onClick={() =>
                    requestReference({ name: x.name, book: x.source.book })
                  }
                >
                  {entrySource(state.catalogue, x)}
                </button>
              )}
              {x.adaptation && (
                <p className="manager-notice">
                  Legacy:{" "}
                  {typeof x.adaptation === "string"
                    ? x.adaptation
                    : x.adaptation.text ||
                      "Reviewed adaptation; open the source reference for details."}
                </p>
              )}
              {group === "skills" && (
                <p className="manager-meta">
                  {x.char} {score(result.stats[x.char])} + {score(x.amount)}{" "}
                  Advances
                  {x.total !== result.stats[x.char] + x.amount
                    ? " · adjusted total"
                    : ""}
                </p>
              )}
              {group === "gear" && (
                <>
                  <p className="manager-meta">
                    Enc {score(x.enc)} per item ·{" "}
                    {x.kind === "weapon"
                      ? `Damage ${x.damage || "—"} · ${x.qualities}`
                      : x.kind === "armour"
                        ? `AP ${score(x.ap)} · ${x.locations}`
                        : ""}
                  </p>
                  <Select
                    id={`state-${x.key}`}
                    label="Equipment placement"
                    value={x.state}
                    options={["equipped", "worn", "carried", "stored"]}
                    onValue={(value) =>
                      edit(`Moved ${x.name}: ${value}`, (r) => {
                        r.sheet.entries.gear.find(
                          (e: any) => e.key === x.key,
                        ).state = value;
                      })
                    }
                  />
                </>
              )}
              {group === "magic" && x.kind === "spell" && (
                <Select
                  id={`learned-with-${x.key}`}
                  label="Learning Talent / Lore"
                  value={x.learnedWith || ""}
                  options={[
                    ["", "Not recorded"],
                    ...result.derived.talents.filter((name: string) =>
                      /^(Arcane Magic|Invoke|Bless|Petty Magic|Witch!|High Magic)/.test(
                        name,
                      ),
                    ),
                  ]}
                  onValue={(value) =>
                    edit(`Recorded learning Lore for ${x.name}`, (r) => {
                      r.sheet.entries.magic.find(
                        (row: any) => row.key === x.key,
                      ).learnedWith = value;
                    })
                  }
                />
              )}
              {["skills", "talents", "gear"].includes(group) && (
                <Field
                  id={`amount-${x.key}`}
                  label={
                    group === "skills"
                      ? "Advances (GM adjustment; no XP charge)"
                      : group === "talents"
                        ? "Ranks (GM adjustment; no XP charge)"
                        : "Quantity"
                  }
                  numeric
                  value={x.amount}
                  onValue={(value) =>
                    edit(
                      `Adjusted ${x.name}`,
                      (r) => {
                        if (!Number.isSafeInteger(value) || value < 0)
                          throw Error("Enter a non-negative whole number.");
                        let row = r.sheet.entries[group].find(
                          (e: any) => e.key === x.key,
                        );
                        if (!row && x.reference) {
                          const key = addEntry(
                            r.sheet,
                            group,
                            state.catalogue.rows.find(
                              (e: any) => e.id === x.id,
                            ),
                          );
                          row = r.sheet.entries[group].find(
                            (e: any) => e.key === key,
                          );
                        }
                        if (row.total !== null && group === "skills")
                          row.total += value - row.amount;
                        row.amount = value;
                      },
                      "Recorded manual adjustment; no XP charged.",
                    )
                  }
                />
              )}
              {group === "skills" && (
                <Field
                  id={`total-${x.key}`}
                  label="Manual Skill total (blank uses calculation)"
                  numeric
                  nullable
                  value={
                    sheet.entries.skills.find((e: any) => e.key === x.key)
                      ?.total ?? null
                  }
                  onValue={(value) =>
                    edit(`Adjusted ${x.name} total`, (r) => {
                      let row = r.sheet.entries.skills.find(
                        (e: any) => e.key === x.key,
                      );
                      if (!row && x.reference) {
                        const key = addEntry(
                          r.sheet,
                          "skills",
                          state.catalogue.rows.find((e: any) => e.id === x.id),
                        );
                        row = r.sheet.entries.skills.find(
                          (e: any) => e.key === key,
                        );
                      }
                      row.total = value;
                    })
                  }
                />
              )}
              {
                <div className="manager-inline">
                  <button
                    className="quiet"
                    type="button"
                    onClick={() =>
                      edit(
                        `${x.favourite ? "Unpinned" : "Pinned"} ${x.name}`,
                        (r) => {
                          let row = r.sheet.entries[group].find(
                            (e: any) => e.key === x.key,
                          );
                          if (!row && x.reference) {
                            const key = addEntry(
                              r.sheet,
                              group,
                              state.catalogue.rows.find(
                                (e: any) => e.id === x.id,
                              ),
                            );
                            row = r.sheet.entries[group].find(
                              (e: any) => e.key === key,
                            );
                          }
                          row.favourite = !row.favourite;
                        },
                      )
                    }
                  >
                    {x.favourite
                      ? "Unpin from Session view"
                      : "Pin to Session view"}
                  </button>
                  {!x.reference && (
                    <button
                      className="quiet"
                      type="button"
                      onClick={() =>
                        edit(
                          `Removed ${x.name}`,
                          (r) => {
                            r.sheet.entries[group] = r.sheet.entries[
                              group
                            ].filter((e: any) => e.key !== x.key);
                          },
                          "Removed entry without an XP refund. Use Undo to restore it.",
                        )
                      }
                    >
                      Remove entry
                    </button>
                  )}
                </div>
              }
            </details>
          ))}
      </section>
    );
  }
  function adjustments() {
    return (
      <details className="manager-entry">
        <summary>
          <strong>GM adjustments</strong>
        </summary>
        <p>
          Direct adjustments are available to every character and recorded
          separately from XP purchases. Existing current resources are retained
          when maximums change.
        </p>
        <div className="manager-grid manager-form">
          <Field
            id="manager-species"
            label="Species"
            value={sheet.species}
            onValue={(value) =>
              edit("Adjusted Species", (r) => {
                r.sheet.species = value;
              })
            }
          />
          <Select
            id="manager-career-adjust"
            label="Career (GM adjustment)"
            value={sheet.career}
            options={[
              ["", "No Career"],
              ...state.catalogue.careers.map((c: any) => [
                c.contentId || c.id,
                `${c.name} · ${c.source.book}`,
              ]),
            ]}
            onValue={(value) =>
              edit("Adjusted Career", (r) => {
                r.sheet.career = value;
              })
            }
          />
          <Field
            id="manager-level"
            label="Career level"
            numeric
            value={sheet.level}
            onValue={(value) =>
              edit("Adjusted Career level", (r) => {
                if (!Number.isInteger(value) || value < 1)
                  throw Error("Enter a positive Career level.");
                r.sheet.level = value;
              })
            }
          />
          <Field
            id="manager-tracker"
            label="Career tracker boxes"
            numeric
            value={sheet.tracker}
            onValue={(value) =>
              edit("Adjusted tracker", (r) => {
                if (!Number.isInteger(value) || value < 0 || value > 36)
                  throw Error("Enter 0–36 tracker boxes.");
                r.sheet.tracker = value;
              })
            }
          />
        </div>
        <h3>Characteristics</h3>
        <div className="manager-grid manager-form">
          {KEYS.map((key: string) => (
            <div key={key}>
              <Field
                id={`initial-${key}`}
                label={`${key} initial`}
                numeric
                value={sheet.characteristics[key].initial}
                onValue={(value) =>
                  edit(`Adjusted ${key} initial`, (r) => {
                    r.sheet.characteristics[key].initial = value;
                  })
                }
              />
              <Field
                id={`advances-${key}`}
                label={`${key} Advances`}
                numeric
                value={sheet.characteristics[key].advances}
                onValue={(value) =>
                  edit(`Adjusted ${key} Advances`, (r) => {
                    if (!Number.isInteger(value) || value < 0)
                      throw Error(
                        "Advances must be a non-negative whole number.",
                      );
                    r.sheet.characteristics[key].advances = value;
                  })
                }
              />
              <Field
                id={`modifier-${key}`}
                label={`${key} modifier`}
                numeric
                value={sheet.characteristics[key].modifier}
                onValue={(value) =>
                  edit(`Adjusted ${key} modifier`, (r) => {
                    r.sheet.characteristics[key].modifier = value;
                  })
                }
              />
            </div>
          ))}
        </div>
        <h3>Resource maximums and calculations</h3>
        <div className="manager-grid manager-form">
          <Field
            id="max-fortune"
            label="Maximum Fortune"
            numeric
            value={sheet.fortune}
            onValue={(value) =>
              edit("Adjusted maximum Fortune", (r) => {
                if (value < 0) throw Error("Fortune cannot be negative.");
                r.sheet.fortune = value;
              })
            }
          />
          <Select
            id="manager-size"
            label="Size"
            value={sheet.size}
            options={[
              "Tiny",
              "Small",
              "Average",
              "Large",
              "Enormous",
              "Monstrous",
            ]}
            onValue={(value) =>
              edit("Adjusted Size", (r) => {
                r.sheet.size = value;
              })
            }
          />
          {AUTO_FIELDS.map((key: string) => (
            <Field
              key={key}
              id={`override-${key}`}
              label={`${(LABELS as any)[key]} override (blank = ${score(result.auto[key])}${record.adjustments[key] ? ` + ${record.adjustments[key]} adjustment` : ""})`}
              numeric
              nullable
              value={sheet.overrides[key]}
              onValue={(value) =>
                edit(`Adjusted ${(LABELS as any)[key]}`, (r) => {
                  r.sheet.overrides[key] = value;
                })
              }
            />
          ))}
        </div>
        <h3>Money and XP balances</h3>
        <div className="manager-grid manager-form">
          {[
            ["gc", "Gold crowns"],
            ["ss", "Silver shillings"],
            ["d", "Brass pennies"],
          ].map(([key, label]) => (
            <Field
              key={key}
              id={`coins-${key}`}
              label={label}
              numeric
              value={sheet.coins[key]}
              onValue={(value) =>
                edit(`Adjusted ${label}`, (r) => {
                  if (!Number.isInteger(value) || value < 0)
                    throw Error("Enter non-negative whole coins.");
                  r.sheet.coins[key] = value;
                })
              }
            />
          ))}
          <Field
            id="xp-unspent"
            label="Available XP (adjustment)"
            numeric
            value={sheet.xpUnspent}
            onValue={(value) =>
              edit("Adjusted available XP", (r) => {
                r.sheet.xpUnspent = value;
              })
            }
          />
          <Field
            id="xp-spent"
            label="Spent XP (adjustment)"
            numeric
            value={sheet.xpSpent}
            onValue={(value) =>
              edit("Adjusted spent XP", (r) => {
                r.sheet.xpSpent = value;
              })
            }
          />
          <Field
            id="corruption"
            label="Corruption"
            numeric
            value={sheet.corruption}
            onValue={(value) =>
              edit("Adjusted Corruption", (r) => {
                r.sheet.corruption = value;
              })
            }
          />
          <Field
            id="sin"
            label="Sin"
            numeric
            value={sheet.sin}
            onValue={(value) =>
              edit("Adjusted Sin", (r) => {
                r.sheet.sin = value;
              })
            }
          />
        </div>
      </details>
    );
  }
  const recordActions = (
    <div className="manager-inline">
      <button
        className="quiet"
        type="button"
        onClick={() =>
          edit(
            record.favourite
              ? "Unfavourited character"
              : "Favourited character",
            (r) => {
              r.favourite = !r.favourite;
            },
          )
        }
      >
        {record?.favourite ? "Remove favourite" : "Favourite character"}
      </button>
      <button
        className="quiet"
        type="button"
        onClick={() => open("condition", { amount: 1, name: "", note: "" })}
      >
        Record Condition
      </button>
    </div>
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
            aria-controls="creator-menu"
            aria-expanded={menu}
            onClick={() => setMenu(true)}
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
      >
        {menuActions}
      </CreatorMenu>
      <div className={`manager-workspace ${record ? "" : "manager-library"}`}>
        <aside className="manager-rail">
          <div className="manager-rail-inner">
            <button
              className="quiet"
              type="button"
              aria-current={!record ? "page" : undefined}
              onClick={() => navigate(null)}
            >
              Character library
            </button>
            {record && (
              <nav aria-label="Character sections">
                {SECTIONS.map(([id, label]) => (
                  <button
                    className="quiet"
                    type="button"
                    key={id}
                    aria-current={section === id ? "page" : undefined}
                    onClick={() => navigate(record.id, id)}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            )}
            <div className="manager-form">{menuActions}</div>
            <p className="save-status" role="status">
              {state.saving ? "Saving…" : state.message}
            </p>
            {record && (
              <div
                className="manager-inline"
                role="group"
                aria-label="Edit history"
              >
                {historyControls}
              </div>
            )}
            <ModeNavigation mode="manager" verify={verify} />
          </div>
        </aside>
        <div className="manager-mobile-selector">
          {record ? (
            <>
              <label htmlFor="manager-section">Character section</label>
              <select
                id="manager-section"
                value={section}
                onChange={(e) =>
                  e.target.value === "library"
                    ? navigate(null)
                    : navigate(record.id, e.target.value)
                }
              >
                <option value="library">Character library</option>
                {SECTIONS.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <span>Character library</span>
          )}
        </div>
        <main id="creator-main" className="manager-main">
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
                {state.unsavedCount === 1 ? " has" : "s have"} unsaved changes
                in this tab. Back up the library before closing.
              </p>
              <button
                type="button"
                onClick={() => navigate(store.firstUnsaved())}
              >
                Open unsaved character
              </button>
            </div>
          )}
          {notice && (
            <p className="manager-notice" role="status">
              {notice}
            </p>
          )}
          {!record ? (
            <>
              <h1>Your characters</h1>
              <p className="manager-intro">
                A field register for your adventures. Characters stay in this
                browser; keep a backup for travel between devices.
              </p>
              <div className="manager-toolbar">
                <button
                  type="button"
                  onClick={() => {
                    setPreview([]);
                    open("import");
                  }}
                >
                  Import character
                </button>
                <button
                  className="quiet"
                  type="button"
                  onClick={() => void store.add([freshManager()])}
                >
                  New blank character
                </button>
              </div>
              <div className="manager-toolbar">
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
              {(() => {
                const rows = state.records
                  .filter(
                    (x) =>
                      (filter === "all" || filter === "archived"
                        ? filter === "all" || x.archived
                        : !x.archived &&
                          (filter !== "favourites" || x.favourite)) &&
                      `${x.sheet.name} ${x.sheet.species} ${state.catalogue.careers.find((c: any) => (c.contentId || c.id) === x.sheet.career)?.name || x.sheet.career}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                  )
                  .sort((a, b) =>
                    sort === "recent"
                      ? b.updatedAt.localeCompare(a.updatedAt)
                      : String(
                          sort === "career" ? a.sheet.career : a.sheet.name,
                        ).localeCompare(
                          String(
                            sort === "career" ? b.sheet.career : b.sheet.name,
                          ),
                        ),
                  );
                return rows.length ? (
                  rows.map((x) => (
                    <article className="manager-row" key={x.id}>
                      <div>
                        <h2>{x.sheet.name || "Unnamed character"}</h2>
                        <div className="manager-meta">
                          {x.sheet.species || "Species not entered"} ·{" "}
                          {state.catalogue.careers.find(
                            (c: any) =>
                              (c.contentId || c.id) === x.sheet.career,
                          )?.name || "Career not entered"}{" "}
                          · level {score(x.sheet.level)}
                          {x.favourite ? " · Favourite" : ""}
                          {x.archived ? " · Archived" : ""}
                          <br />
                          Edited {date(x.updatedAt)}
                        </div>
                      </div>
                      <button
                        className="quiet"
                        type="button"
                        onClick={() => navigate(x.id)}
                      >
                        Open sheet
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="manager-empty">
                    <h2>
                      {state.records.length
                        ? "No matching characters"
                        : "Your register is ready"}
                    </h2>
                    <p>
                      {state.records.length
                        ? "Try another search or filter."
                        : "Import a Player or Marijan save, or create a blank character. Every character uses the same sheet and tools."}
                    </p>
                  </div>
                );
              })()}
            </>
          ) : (
            <>
              <h1>{sheet.name || "Unnamed character"}</h1>
              <p className="manager-intro">
                {sheet.species || "Species not entered"} ·{" "}
                {result.career?.name || "Career not entered"} · level{" "}
                {score(sheet.level)}
                {record.archived ? " · Archived" : ""}
              </p>
              <div className="manager-compact-resources">
                <span>
                  Wounds {score(record.current.wounds)}/
                  {score(result.values.wounds)}
                </span>
                <span>
                  Fortune {score(record.current.fortune)}/{score(sheet.fortune)}
                </span>
                <span>Fate {score(sheet.fate)}</span>
                <span>XP {score(sheet.xpUnspent)}</span>
              </div>
              {section === "overview" && (
                <>
                  <h2>Overview</h2>
                  {record.portrait && (
                    <img
                      className="manager-portrait"
                      src={record.portrait}
                      alt={`Portrait of ${sheet.name || "this character"}`}
                    />
                  )}
                  <div className="manager-inline">
                    <button
                      className="quiet"
                      type="button"
                      onClick={() => portrait.current?.click()}
                    >
                      {record.portrait ? "Change portrait" : "Add portrait"}
                    </button>
                    {record.portrait && (
                      <button
                        className="quiet"
                        type="button"
                        onClick={() =>
                          edit("Removed portrait", (r) => {
                            delete r.portrait;
                          })
                        }
                      >
                        Remove portrait
                      </button>
                    )}
                  </div>
                  <Field
                    id="manager-name"
                    label="Character name"
                    value={sheet.name}
                    onValue={(value) =>
                      edit("Renamed character", (r) => {
                        r.sheet.name = value;
                      })
                    }
                  />
                  {recordActions}
                  <dl className="manager-stats">
                    {KEYS.map((key: string) => (
                      <div className="manager-stat" key={key}>
                        <dt>{key}</dt>
                        <dd>
                          {score(result.stats[key])}
                          <small>
                            {score(sheet.characteristics[key].advances)}{" "}
                            Advances
                          </small>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="manager-grid">
                    <p>
                      Movement <strong>{score(result.values.movement)}</strong>
                      <br />
                      Enc{" "}
                      <strong>
                        {score(result.values.enc)} /{" "}
                        {score(result.values.capacity)}
                      </strong>
                    </p>
                    <p>
                      Corruption <strong>{score(sheet.corruption)}</strong>
                      <br />
                      Sin <strong>{score(sheet.sin)}</strong>
                    </p>
                  </div>
                  <Field
                    id="manager-appearance"
                    label="Appearance"
                    area
                    value={sheet.appearance}
                    onValue={(value) =>
                      edit("Updated appearance", (r) => {
                        r.sheet.appearance = value;
                      })
                    }
                  />
                  <Conditions
                    record={record}
                    onRemove={(id) =>
                      edit("Removed Condition", (r) => {
                        r.conditions = r.conditions.filter(
                          (c: any) => c.id !== id,
                        );
                      })
                    }
                  />
                  {adjustments()}
                  {result.warnings.length > 0 && (
                    <details className="manager-entry">
                      <summary>
                        <strong>
                          Calculation notes ({result.warnings.length})
                        </strong>
                      </summary>
                      {result.warnings.map((warning: string, i: number) => (
                        <p key={i}>{warning}</p>
                      ))}
                    </details>
                  )}
                </>
              )}
              {section === "skills" && (
                <>
                  <Field
                    id="skill-find"
                    label="Find Skill or Talent"
                    value={query}
                    onValue={setQuery}
                  />
                  {entryList("skills")}
                  {entryList("talents")}
                </>
              )}
              {section === "gear" && (
                <>
                  <h2>Combat &amp; Gear</h2>
                  <h3>Soak by location</h3>
                  <p className="manager-meta">
                    Toughness Bonus plus active armour. Shield-inclusive totals
                    apply only while opposing with Dodge/Melee.
                  </p>
                  <table className="manager-table">
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>AP</th>
                        <th>Soak</th>
                        <th>With shield</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["head", "Head"],
                        ["arms", "Arms"],
                        ["body", "Body"],
                        ["legs", "Legs"],
                      ].map(([key, label]) => (
                        <tr key={key}>
                          <th scope="row">{label}</th>
                          <td>{score(result.values[key])}</td>
                          <td>
                            {result.values[key] === null
                              ? "—"
                              : score(result.tb + result.values[key])}
                          </td>
                          <td>
                            {result.values[key] === null ||
                            result.values.shield === null
                              ? "—"
                              : score(
                                  result.tb +
                                    result.values[key] +
                                    result.values.shield,
                                )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h3>Attacks</h3>
                  {result.equipment.weapons.length ? (
                    result.equipment.weapons.map((x: any) => (
                      <div className="manager-row" key={x.key}>
                        <div>
                          <strong>{x.label}</strong>
                          <p className="manager-meta">
                            {x.attackSkill}:{" "}
                            {x.attackScore === null
                              ? "Untrained"
                              : score(x.attackScore)}{" "}
                            · Damage {x.damage} ·{" "}
                            {x.qualities || "No listed properties"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No active weapons.</p>
                  )}
                  <p>
                    Money:{" "}
                    <strong>
                      {formatMoney(
                        sheet.coins.gc * 240 +
                          sheet.coins.ss * 12 +
                          sheet.coins.d,
                      )}
                    </strong>
                  </p>
                  <button
                    className="quiet"
                    type="button"
                    onClick={() => open("money", { value: 0, note: "" })}
                  >
                    Record money transaction
                  </button>
                  <p>
                    Enc {score(result.values.enc)} /{" "}
                    {score(result.values.capacity)}. Items are packed
                    automatically; stored belongings and coin weight are
                    excluded.
                  </p>
                  <p className="manager-meta">
                    {result.equipment.penalties.complete
                      ? `Load-adjusted Movement ${score(result.equipment.penalties.movement)}; Agility ${score(result.equipment.penalties.agility)}. Armour modifiers: Stealth ${score(result.equipment.penalties.stealth)} SL; Perception ${score(result.equipment.penalties.perception)} SL.`
                      : "Load effects remain unresolved while carried weights are unknown."}
                  </p>
                  {entryList("gear")}
                </>
              )}
              {section === "magic" && (
                <>
                  {entryList("magic")}
                  {entryList("extras")}
                  <p className="manager-meta">
                    Casting and situational effects remain recorded references.
                    Adding knowledge is an explicit GM adjustment; it grants no
                    automatic equipment or spell effects.
                  </p>
                </>
              )}
              {section === "advancement" && (
                <Advancement
                  catalogue={state.catalogue}
                  record={record}
                  result={result}
                  edit={edit}
                  award={() => open("award", { amount: 0, note: "" })}
                  career={() => open("career", { id: "", confirmed: false })}
                />
              )}
              {section === "journal" && (
                <>
                  <h2>Journal &amp; history</h2>
                  <div className="manager-inline">
                    <button
                      type="button"
                      onClick={() =>
                        open("journal", {
                          title: "",
                          text: "",
                          kind: "Session",
                        })
                      }
                    >
                      Add journal entry
                    </button>
                  </div>
                  <Field
                    id="manager-ambition"
                    label="Personal ambition"
                    value={sheet.ambition}
                    area
                    onValue={(value) =>
                      edit("Updated personal ambition", (r) => {
                        r.sheet.ambition = value;
                      })
                    }
                  />
                  <Field
                    id="manager-party-ambition"
                    label="Party ambition"
                    value={sheet.partyAmbition}
                    area
                    onValue={(value) =>
                      edit("Updated party ambition", (r) => {
                        r.sheet.partyAmbition = value;
                      })
                    }
                  />
                  <Field
                    id="manager-notes"
                    label="Background & notes"
                    value={sheet.notes}
                    area
                    onValue={(value) =>
                      edit("Updated background & notes", (r) => {
                        r.sheet.notes = value;
                      })
                    }
                  />
                  {[...record.journal].reverse().map((x: any) => (
                    <details className="manager-entry" key={x.id}>
                      <summary>
                        <strong>{x.title}</strong>
                        <span>{x.kind}</span>
                      </summary>
                      <p className="manager-meta">{date(x.at)}</p>
                      <pre>{x.text}</pre>
                    </details>
                  ))}
                  <h2>Change history</h2>
                  <ul className="manager-history">
                    {[...record.history]
                      .reverse()
                      .slice(0, 100)
                      .map((x: any) => (
                        <li key={x.id}>
                          <strong>{x.label}</strong>
                          <div className="manager-meta">{date(x.at)}</div>
                          <p>{x.detail}</p>
                        </li>
                      ))}
                  </ul>
                  {record.history.length > 100 && (
                    <p>
                      Showing the latest 100 changes. JSON and PDF records
                      retain the complete history.
                    </p>
                  )}
                  <h2>Historical attachments</h2>
                  {record.attachments.length ? (
                    record.attachments.map((x: any, i: number) => (
                      <p key={i}>
                        <button
                          className="quiet"
                          type="button"
                          onClick={() =>
                            download(x.data, `historical-record-${i + 1}.json`)
                          }
                        >
                          {x.name}
                        </button>
                      </p>
                    ))
                  ) : (
                    <p>No historical attachments.</p>
                  )}
                  <div className="manager-inline">
                    <button
                      className="quiet"
                      type="button"
                      onClick={() => open("delete")}
                    >
                      Permanently delete character
                    </button>
                  </div>
                </>
              )}
              {section === "session" && (
                <>
                  <h2>Session view</h2>
                  <div className="manager-grid">{resources()}</div>
                  <div className="manager-inline">
                    <button
                      type="button"
                      onClick={() =>
                        open("condition", { name: "", amount: 1, note: "" })
                      }
                    >
                      Record Condition
                    </button>
                    <button
                      className="quiet"
                      type="button"
                      onClick={() =>
                        open("journal", {
                          title: "",
                          text: "",
                          kind: "Session",
                        })
                      }
                    >
                      Add session note
                    </button>
                  </div>
                  <Conditions
                    record={record}
                    onRemove={(id) =>
                      edit("Removed Condition", (r) => {
                        r.conditions = r.conditions.filter(
                          (x: any) => x.id !== id,
                        );
                      })
                    }
                  />
                  <h2>Ready attacks</h2>
                  {result.equipment.weapons
                    .filter((x: any) => x.placement === "equipped")
                    .map((x: any) => (
                      <p key={x.key}>
                        <strong>{x.label}</strong> · {x.attackSkill}:{" "}
                        {x.attackScore === null
                          ? "Untrained"
                          : score(x.attackScore)}{" "}
                        · Damage {x.damage}
                        <br />
                        {x.qualities}
                      </p>
                    ))}
                  {["skills", "talents", "magic"].map((group) => (
                    <div key={group}>
                      {entryList(
                        group,
                        (group === "skills"
                          ? result.skills
                          : result.entries[group]
                        ).filter((x: any) => x.favourite),
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
          <p className="manager-meta" role="status">
            {state.saving ? "Saving…" : state.message}
          </p>
        </main>
        {record && (
          <aside className="manager-folio" aria-label="Current resources">
            <div className="manager-folio-inner">
              <h2>In the field</h2>
              {resources()}
              <button
                className="quiet"
                type="button"
                onClick={() =>
                  open("condition", { name: "", amount: 1, note: "" })
                }
              >
                Record Condition
              </button>
              <p>{record.conditions.length} active Condition entries</p>
            </div>
          </aside>
        )}
      </div>
      {record && (
        <nav className="manager-bottom" aria-label="Character actions">
          <div role="group" aria-label="Edit history">
            {historyControls}
          </div>
          <button
            className="quiet"
            type="button"
            onClick={() => open("resources")}
          >
            Resources
          </button>
          <button
            className="quiet"
            type="button"
            onClick={() => navigate(null)}
          >
            Library
          </button>
        </nav>
      )}
      {modal && (
        <Dialog
          title={
            (
              {
                import: "Import characters",
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
                resources: "Current resources",
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
          {modal === "resources" && resources()}
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
                    {preview.map((r, i) => (
                      <li key={i}>
                        <strong>{r.sheet.name || "Unnamed character"}</strong>
                        <br />
                        {r.sheet.species} · {score(r.sheet.xpUnspent)} XP
                        available ·{" "}
                        {KEYS.map(
                          (key: string) =>
                            `${key} ${score(calculateManager(state.catalogue, r).stats[key])}`,
                        ).join(" / ")}
                        {state.records.some((x) => x.id === r.id) ? (
                          <strong> · Existing character ID</strong>
                        ) : (
                          ""
                        )}
                      </li>
                    ))}
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
                    await store.edit("Journal entry added", (r) =>
                      addJournal(
                        r,
                        form.title || "",
                        form.text || "",
                        form.kind || "Session",
                      ),
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
                      const amount = Number(form.value);
                      if (!Number.isSafeInteger(amount))
                        throw Error("Enter whole pennies (negative to spend).");
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
                    await store.edit("Equipment acquired", (r) =>
                      acquire(
                        state.catalogue,
                        r,
                        form.id,
                        Number(form.amount || 1),
                        Number(form.price || 0),
                        form.note || "",
                      ),
                    );
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
                <>
                  <Field
                    id="condition-name"
                    label="Condition name"
                    value={form.name}
                    onValue={(value) => updateForm("name", value)}
                  />
                  <Field
                    id="condition-amount"
                    label="Count"
                    numeric
                    value={form.amount}
                    onValue={(value) => updateForm("amount", value)}
                  />
                  <Field
                    id="condition-note"
                    label="Effect / notes"
                    area
                    value={form.note}
                    onValue={(value) => updateForm("note", value)}
                  />
                  <p className="manager-meta">
                    Recorded for play; numerical effects and recovery are
                    applied manually.
                  </p>
                </>
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
                  <Field
                    id="money-value"
                    label="Pennies received (negative to spend)"
                    numeric
                    value={form.value}
                    onValue={(value) => updateForm("value", value)}
                  />
                  <Field
                    id="money-note"
                    label="Reason"
                    value={form.note}
                    onValue={(value) => updateForm("note", value)}
                  />
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
                        price: listedPrice(row) ?? 0,
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
                    onValue={(value) => updateForm("amount", value)}
                  />
                  {modal === "acquire" && (
                    <>
                      <Field
                        id="entry-price"
                        label="Total price paid (pennies; 0 for loot or gifts)"
                        numeric
                        value={form.price || 0}
                        onValue={(value) => updateForm("price", value)}
                      />
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

function Conditions({
  record,
  onRemove,
}: {
  record: any;
  onRemove: (id: string) => void;
}) {
  return (
    <section>
      <h2>Active Conditions</h2>
      {record.conditions.length ? (
        record.conditions.map((x: any) => (
          <div className="manager-row" key={x.id}>
            <div>
              <strong>
                {x.name} ×{x.amount}
              </strong>
              <p>{x.note}</p>
              <button
                className="quiet"
                type="button"
                onClick={() =>
                  requestReference({ kind: "condition", name: x.name })
                }
              >
                Find Condition rule
              </button>
            </div>
            <button
              className="quiet"
              type="button"
              onClick={() => onRemove(x.id)}
            >
              Remove Condition
            </button>
          </div>
        ))
      ) : (
        <p>No Conditions recorded.</p>
      )}
    </section>
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
      {rows.length > 150 && (
        <p className="manager-meta">
          Showing 150 of {rows.length} matches. Narrow the search to find
          another entry.
        </p>
      )}
    </>
  );
}
function Advancement({
  catalogue,
  record,
  result,
  edit,
  award,
  career,
}: {
  catalogue: any;
  record: any;
  result: any;
  edit: (label: string, change: (r: any) => void, detail?: string) => void;
  award: () => void;
  career: () => void;
}) {
  const [type, setType] = useState("char"),
    [name, setName] = useState("WS"),
    [amount, setAmount] = useState(5),
    [endeavour, setEndeavour] = useState(false),
    [query, setQuery] = useState("");
  const [trapping, setTrapping] = useState(""),
    [trappingReason, setTrappingReason] = useState("");
  const q: any = quoteManager(catalogue, record, type, name, amount);
  let names: string[] =
    type === "char"
      ? KEYS
      : type === "skill"
        ? catalogue.rows
            .filter((x: any) => x.collection === "skills")
            .map((x: any) => x.name)
        : type === "talent"
          ? careerTalentOptions(
              result.R,
              result.context,
              Math.min(4, record.sheet.level),
            )
          : [];
  names = [...new Set(names)];
  const matches = names.filter((x) =>
    x.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section>
      <h2>Advancement</h2>
      <p>
        <strong>{score(record.sheet.xpUnspent)} XP available</strong> ·{" "}
        {score(record.sheet.xpSpent)} spent · {score(result.xpTotal)} total
      </p>
      <div className="manager-inline">
        <button type="button" onClick={award}>
          Award XP
        </button>
        <button className="quiet" type="button" onClick={career}>
          Change Career
        </button>
      </div>
      <p>
        Career tracker: {score(record.sheet.tracker)} / 36 total boxes. Current
        level: {score(result.derived.ticks)} /{" "}
        {[10, 12, 14, 0][record.sheet.level - 1] ?? "—"} boxes.
      </p>
      <details className="manager-entry">
        <summary>
          <strong>Career Skill specialisations</strong>
        </summary>
        <p>
          Choose the specialisations used for Career advancement eligibility.
        </p>
        {careerSkillSlots(
          result.R,
          result.context,
          Math.min(4, record.sheet.level),
        )
          .filter(
            (slot: any) =>
              ruleOptions(result.R, slot.raw, "skill", result.context).length >
              1,
          )
          .map((slot: any) => (
            <Select
              key={slot.key}
              id={`manager-slot-${slot.key}`}
              label={`Level ${slot.level}: ${slot.raw}`}
              value={slot.name}
              options={ruleOptions(result.R, slot.raw, "skill", result.context)}
              onValue={(value) =>
                edit("Updated Career specialisation", (r) => {
                  r.context.skillChoices = {
                    ...r.context.skillChoices,
                    [slot.key]: value,
                  };
                })
              }
            />
          ))}
      </details>
      <div className="manager-form">
        <Select
          id="advance-type"
          label="Purchase type"
          value={type}
          options={[
            ["char", "Characteristic"],
            ["skill", "Skill"],
            ["talent", "Talent"],
            ["promotion", "Career promotion"],
          ]}
          onValue={(value) => {
            setType(value);
            setName(value === "char" ? "WS" : "");
            setQuery("");
          }}
        />
        {type !== "promotion" && (
          <>
            {type !== "char" && (
              <Field
                id="advance-find"
                label="Find advancement"
                value={query}
                onValue={setQuery}
              />
            )}
            <Select
              id="advance-name"
              label="Advance"
              value={name}
              options={[["", "Choose an advance"], ...matches.slice(0, 200)]}
              onValue={setName}
            />
            {matches.length > 200 && (
              <p>Narrow your search to see more options.</p>
            )}
          </>
        )}
        {["char", "skill"].includes(type) && (
          <Select
            id="advance-amount"
            label="Advance amount"
            value={amount}
            options={[
              [5, "+5"],
              [1, "+1 (Appendix II)"],
            ]}
            onValue={(value) => setAmount(Number(value))}
          />
        )}
        {type === "promotion" && (
          <label className="manager-check">
            <input
              type="checkbox"
              checked={endeavour}
              onChange={(e) => setEndeavour(e.target.checked)}
            />
            Advance Career Endeavour completed (core p. 196)
          </label>
        )}
        <p aria-live="polite">
          {q.cost === null
            ? ""
            : `${score(q.cost)} XP${q.inCareer ? " · Career advance" : ""}${q.tick ? " · earns a tracker box" : ""}`}
          {q.error ? ` · ${q.error}` : ""}
        </p>
        <button
          type="button"
          disabled={!!q.error || (type === "promotion" && !endeavour)}
          onClick={() =>
            edit("Purchased advancement", (r) =>
              purchaseAdvance(catalogue, r, type, name, amount, endeavour),
            )
          }
        >
          Purchase{" "}
          {type === "promotion"
            ? "Career promotion"
            : `${name}${["char", "skill"].includes(type) ? ` +${amount}` : ""}`}
        </button>
      </div>
      <p className="manager-meta">
        Prices, limits, and tracker grouping use the shared Fifth Edition
        engine. Other GM-approved changes belong in the sheet’s adjustments.
        Existing paid purchases are retained in the history; use Undo for
        immediate corrections.
      </p>
      <details className="manager-entry">
        <summary>
          <strong>Record a next-level Career Trapping</strong>
        </summary>
        <p>
          Record how it was acquired to earn a tracker box. This records
          acquisition without adding equipment or charging money again.
        </p>
        <Select
          id="manager-trapping"
          label="Next-level Trapping"
          value={trapping}
          options={[
            ["", "Choose a Trapping"],
            ...(result.career?.levels[record.sheet.level]?.trappings || []).map(
              (name: string, index: number) => [String(index), name],
            ),
          ]}
          onValue={setTrapping}
        />
        <Field
          id="manager-trapping-reason"
          label="How it was obtained"
          value={trappingReason}
          onValue={setTrappingReason}
        />
        <button
          className="quiet"
          type="button"
          disabled={trapping === "" || !trappingReason.trim()}
          onClick={() =>
            edit("Career Trapping recorded", (r) =>
              creditTrapping(catalogue, r, Number(trapping), trappingReason),
            )
          }
        >
          Record Trapping acquisition
        </button>
      </details>
      <h3>Manager purchases</h3>
      {record.purchases.length ? (
        <ul className="manager-history">
          {[...record.purchases].reverse().map((p: any) => (
            <li key={p.id}>
              {p.name}
              {p.amount ? ` +${p.amount}` : ""} · {score(p.cost)} XP ·{" "}
              {date(p.at)}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No purchases recorded in the manager. Earlier creation records remain
          historical attachments.
        </p>
      )}
    </section>
  );
}
