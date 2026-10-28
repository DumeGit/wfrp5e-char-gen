"use client";
import { COMPACT_SHELL_QUERY } from "../../engine/responsive.mjs";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HistoryControls } from "../../components/HistoryControls";
import { WorkspaceMenu } from "../../components/WorkspaceMenu";
import { KEYS, skillInfo } from "../../engine/rules.mjs";
import { pickerEntries } from "../../engine/gm/pickers.mjs";
import {
  appearanceSpecies,
  rollGMAppearance,
} from "../../engine/gm/appearance.mjs";
import { loadPDFLibrary } from "../../engine/pdf-runtime.mjs";
import { getBestiaryStore } from "./store";
import {
  BestiaryContext,
  Button,
  Details,
  Select,
  Check,
  useBestiary,
} from "./controls";
import { BestiaryDialogs, download } from "./Dialogs";
import {
  Starting,
  Customise,
  EquipmentMagic,
  StatBlock,
  STEPS,
} from "./Sections";

type Session = {
  ui: {
    tab: number;
    query: string;
    category: string;
    profileBook: string;
    browse: boolean;
  };
  disclosures: Map<string, boolean>;
  printEntries: any[];
};
const sessions = new Map<boolean, Session>();
function getSession(verify: boolean) {
  let session = sessions.get(verify);
  if (!session) {
    session = {
      ui: { tab: 0, query: "", category: "", profileBook: "", browse: false },
      disclosures: new Map(),
      printEntries: [],
    };
    sessions.set(verify, session);
  }
  return session;
}

export default function BestiaryCreator({
  verify: supplied,
}: { verify?: boolean } = {}) {
  const [verify, setVerify] = useState<boolean | undefined>(supplied);
  useEffect(() => {
    if (supplied === undefined)
      setVerify(new URLSearchParams(window.location.search).has("verify"));
    else setVerify(supplied);
  }, [supplied]);
  return verify === undefined ? (
    <p role="status">Opening the Bestiary…</p>
  ) : (
    <Workshop key={String(verify)} verify={verify} />
  );
}
export { BestiaryCreator };

function History() {
  const { store, canUndo, canRedo } = useBestiary();
  return (
    <div
      style={{ display: "contents" }}
      onClick={(event) => {
        const action = (event.target as HTMLElement).closest<HTMLElement>(
          "[data-action]",
        )?.dataset.action;
        if (action === "undo" || action === "redo") store.travel(action);
      }}
    >
      <HistoryControls canUndo={canUndo} canRedo={canRedo} />
    </div>
  );
}
function Review() {
  const {
    draft: s,
    result: r,
    edit,
    exportPDF,
    save,
    setModal,
    working,
  } = useBestiary();
  if (!r.profile)
    return <p className="gm-empty">Choose a starting profile first.</p>;
  return (
    <>
      <div
        className={`gm-review-status ${r.issues.length ? "gm-not-ready" : "gm-ready"}`}
      >
        <div>
          <strong>
            {r.issues.length
              ? "Finish the highlighted choices"
              : "Ready for the table"}
          </strong>
          <p>
            {r.issues.length
              ? "Use the issue links above to jump to the exact control."
              : "Your compact sheet includes the complete current stat block."}
          </p>
        </div>
        <Button
          className="primary"
          disabled={r.issues.length > 0 || !!working}
          aria-describedby={r.issues.length ? "gm-export-reason" : undefined}
          onClick={exportPDF}
        >
          Export PDF
        </Button>
      </div>
      {r.issues.length > 0 && (
        <p id="gm-export-reason" className="gm-small">
          Export is unavailable until the choices above are resolved.
        </p>
      )}
      <div className="gm-export-options">
        <Check
          checked={s.includeNotes}
          onChange={(v) =>
            edit((d: any) => {
              d.includeNotes = v;
            })
          }
        >
          Include my GM notes in the PDF
        </Check>
        <Button
          disabled={r.issues.length > 0 || !!working}
          onClick={() => setModal({ kind: "print" })}
        >
          Print A4 table cards
        </Button>
        <Button onClick={save}>Save editable draft</Button>
      </div>
      <StatBlock />
      <div className="field">
        <label htmlFor="gm-notes">Private GM notes</label>
        <textarea
          id="gm-notes"
          value={s.notes}
          rows={3}
          onChange={(event) =>
            edit((d: any) => {
              d.notes = event.target.value;
            }, "field:notes")
          }
        />
      </div>
    </>
  );
}
function Workshop({ verify }: { verify: boolean }) {
  const [store] = useState(() => getBestiaryStore(verify)),
    state = useSyncExternalStore(
      store.subscribe,
      store.getSnapshot,
      store.getServerSnapshot,
    ),
    [session] = useState(() => getSession(verify));
  const [ui, setView] = useState(session.ui),
    [modal, setModal] = useState<any>(null),
    [compact, setCompact] = useState(false),
    [message, setMessage] = useState(""),
    [working, setWorking] = useState("");
  const file = useRef<HTMLInputElement>(null),
    mounted = useRef(false),
    busyRef = useRef(false),
    root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mounted.current = true;
    void store.initialize();
    const media = matchMedia(COMPACT_SHELL_QUERY),
      resize = () => {
        setCompact(media.matches);
      };
    resize();
    media.addEventListener("change", resize);
    window.addEventListener("pagehide", store.persist);
    window.addEventListener("wfrp-before-update", store.persist);
    return () => {
      mounted.current = false;
      media.removeEventListener("change", resize);
      window.removeEventListener("pagehide", store.persist);
      window.removeEventListener("wfrp-before-update", store.persist);
      store.persist();
    };
  }, [store]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(timer);
  }, [message]);
  const setUI = (patch: Partial<Session["ui"]>) =>
    setView((previous) => {
      const next = { ...previous, ...patch };
      session.ui = next;
      return next;
    });
  const busy = async (label: string, action: () => Promise<unknown>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setWorking(label);
    try {
      await action();
      return true;
    } catch (error) {
      if (mounted.current)
        setMessage(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      busyRef.current = false;
      if (mounted.current) setWorking("");
    }
  };
  const edit = (
    action: (draft: any) => unknown,
    group: string | null = null,
  ) => {
    try {
      store.edit(action, group);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };
  useEffect(() => {
    if (
      state.ready &&
      ui.profileBook &&
      !state.draft.books.includes(ui.profileBook)
    )
      setUI({ profileBook: "" });
  }, [state.ready, state.draft?.books, ui.profileBook]);
  if (!state.ready)
    return (
      <section className="panel" id="creator-main">
        <h1>The Bestiary</h1>
        {state.error ? (
          <>
            <p role="alert">{state.error}</p>
            <Button onClick={() => void store.initialize()}>Retry</Button>
          </>
        ) : (
          <p role="status">Opening the profile library…</p>
        )}
      </section>
    );
  const { data, rules: R, draft: s, result: r } = state;
  const navigate = (step: number) => {
    store.navigate(step);
    requestAnimationFrame(() =>
      document
        .getElementById("creator-main")
        ?.scrollIntoView({ block: "start" }),
    );
  };
  const save = () => {
    store.persist();
    download(
      JSON.stringify(s, null, 2),
      `${
        (r.name || "NPC-creature")
          .replace(/[^\p{L}\p{N} -]/gu, "")
          .trim()
          .replace(/\s+/g, "-") || "NPC-creature"
      }.json`,
      "application/json",
    );
    setMessage("Editable draft saved.");
  };
  const remove = (key: string) =>
    edit((d) => {
      const ammunition = d.customWeapons.find(
        (w: any) => `${w.key}-ammo` === key,
      );
      if (ammunition) {
        ammunition.effects = [];
        ammunition.ammunition = 0;
        ammunition.legendary = false;
        ammunition.power = "ordinary";
        return;
      }
      let removed = false;
      for (const list of [
        "traits",
        "skills",
        "talents",
        "gear",
        "loot",
        "customWeapons",
      ]) {
        const index = d[list].findIndex((t: any) => t.key === key);
        if (index >= 0) {
          d[list].splice(index, 1);
          delete d.attackOverrides[key];
          removed = true;
        }
      }
      for (const list of ["mutations", "spells"])
        if (d[list].includes(key)) {
          d[list] = d[list].filter((id: string) => id !== key);
          removed = true;
        }
      if (!removed && !d.removed.includes(key)) d.removed.push(key);
    });
  const addEntry = (kind: string, x: any) => {
    if (!x || x.disabled) return;
    edit((d) => {
      const key = `gm-${crypto.randomUUID()}`;
      if (kind === "trait")
        d.traits.push({
          key,
          name: x.name,
          value: x.name === "Fear" ? "1" : "",
          ranks: 1,
          origin: "GM",
        });
      if (kind === "skill")
        d.skills.push({
          key,
          name: x.name,
          total:
            r.skills.find((t: any) => t.name === x.name)?.total ??
            r.stats[x.char ?? skillInfo(R, x.name)?.char] ??
            0,
          origin: "GM",
        });
      if (kind === "talent")
        d.talents.push({ key, name: x.name, ranks: 1, origin: "GM" });
      if (kind === "equipment") {
        const existing = d.gear.find((g: any) => g.id === x.key);
        if (existing) existing.quantity++;
        else d.gear.push({ key, id: x.key, quantity: 1 });
      }
      if (kind === "magic") {
        d.removed = d.removed.filter((k: string) => k !== x.key);
        d.spells.push(x.key);
        if (
          R.cants.length &&
          x.category === "Arcane" &&
          r.magicLores.length === 1
        )
          d.spellLores[x.key] = r.magicLores[0];
      }
      if (kind === "mutation") d.mutations.push(x.key);
    });
    setModal(null);
    if (kind === "trait") {
      setUI({ tab: 1 });
      store.navigate(1);
    }
    setMessage(`${x.name} added.`);
  };
  const picker = (entryKind: string) =>
    setModal({
      kind: "picker",
      entryKind,
      rows: pickerEntries(data, R, r, entryKind),
    });
  const rollAppearance = () => {
    const options = appearanceSpecies(R, r.profile);
    if (options.length <= 1) {
      edit((d) => rollGMAppearance(R, d, r.profile));
      setMessage("Appearance rolled. Undo restores the previous description.");
    } else if (options.length > 1) setModal({ kind: "appearance" });
  };
  const exportPDF = () =>
    busy("Preparing PDF…", async () => {
      if (r.issues.length || !r.profile)
        throw Error("Resolve the highlighted choices before export.");
      const [PDFLib, { createGMPDF }] = await Promise.all([
        loadPDFLibrary(),
        import("../../engine/gm/pdf.mjs"),
      ]);
      download(
        await createGMPDF(PDFLib, r, s),
        `${r.name || "Bestiary"}.pdf`,
        "application/pdf",
      );
      if (mounted.current) setMessage("Compact stat block exported.");
    });
  const jump = (issue: any) => {
    const target = issue.control.target;
    store.navigate(issue.control.step);
    if (
      target.startsWith("#trait-") ||
      ["#gm-tab-1", "#gm-broken-roll", "#gm-mutations"].includes(target)
    )
      setUI({ tab: 1 });
    else if (target === "#gm-tab-2") setUI({ tab: 2 });
    else if (
      target.startsWith("#stat-") ||
      ["#gm-size", "#gm-wounds", "#gm-tb", "#gm-tb-mode"].includes(target)
    )
      setUI({ tab: 0 });
    requestAnimationFrame(() => {
      let node: HTMLElement | null = null;
      try {
        node = target.startsWith("#")
          ? document.getElementById(target.slice(1))
          : root.current?.querySelector<HTMLElement>(target) || null;
      } catch {}
      if (!node) node = document.getElementById("creator-main");
      for (
        let parent = node?.parentElement;
        parent;
        parent = parent.parentElement
      )
        if (parent.tagName === "DETAILS")
          (parent as HTMLDetailsElement).open = true;
      node?.scrollIntoView({ block: "center" });
      if (node && !node.matches("input,select,textarea,button")) {
        node.tabIndex = -1;
      }
      node?.focus({ preventScroll: true });
    });
  };
  const status = !r.profile
    ? "Choose a profile"
    : r.issues.length
      ? `${r.issues.length} ${r.issues.length === 1 ? "choice" : "choices"} left`
      : "Ready to export";
  const actionGroups = [
    {
      id: "new",
      label: "New & import",
      commands: [
        {
          id: "new",
          label: "New NPC / creature",
          effect: "dialog" as const,
          run: () => setModal({ kind: "new" }),
        },
        {
          id: "load",
          label: "Load draft",
          effect: "file" as const,
          run: () => file.current?.click(),
        },
      ],
    },
    {
      id: "save",
      label: "Save & export",
      commands: [
        {
          id: "save",
          label: "Save NPC / creature",
          effect: "close" as const,
          run: save,
        },
        {
          id: "pdf",
          label: "Export PDF",
          effect: "close" as const,
          run: async () => {
            if ((await exportPDF()) === false)
              throw Error(
                "The PDF could not be prepared. Try exporting again.",
              );
          },
          disabled: !r.profile || r.issues.length > 0 || !!working,
          reason:
            !r.profile || r.issues.length
              ? "Choose a profile and resolve the highlighted choices before export."
              : undefined,
        },
        {
          id: "print",
          label: "Print A4 table cards",
          effect: "dialog" as const,
          run: () => setModal({ kind: "print" }),
          disabled: !r.profile || r.issues.length > 0 || !!working,
          reason:
            !r.profile || r.issues.length
              ? "Choose a profile and resolve the highlighted choices before export."
              : undefined,
        },
      ],
    },
    {
      id: "more",
      label: "More",
      commands: [
        {
          id: "books",
          label: "Choose profile books",
          effect: "navigate" as const,
          run: () => {
            navigate(0);
            requestAnimationFrame(() => {
              const node = document.querySelector<HTMLDetailsElement>(
                '[data-detail-key="gm:profile-books"]',
              );
              if (node instanceof HTMLDetailsElement) node.open = true;
              node?.scrollIntoView({ block: "center" });
              node?.querySelector("summary")?.focus({ preventScroll: true });
            });
          },
        },
      ],
    },
  ];
  const context = {
    ...state,
    store,
    session,
    ui,
    setUI,
    modal,
    setModal,
    edit,
    remove,
    picker,
    addEntry,
    rollAppearance,
    notify: setMessage,
    save,
    exportPDF,
    busy,
    working,
    disclosures: session.disclosures,
  };
  return (
    <BestiaryContext.Provider value={context}>
      <BestiaryWorkspace
        controls={{
          root,
          file,
          compact,
          verify,
          navigate,
          jump,
          actionGroups,
          message,
          mounted,
          status,
        }}
      />
    </BestiaryContext.Provider>
  );
}

// The same native presentation is used by the live store and static parity tests.
export function BestiaryWorkspace({ controls }: { controls: any }) {
  const state = useBestiary();
  const { store, draft: s, result: r, modal, setModal, working, busy } = state;
  const {
    root,
    file,
    compact,
    verify,
    navigate,
    jump,
    actionGroups,
    message,
    mounted,
    status,
  } = controls;
  return (
    <div ref={root} onBlurCapture={() => store.breakGroup()}>
      <div className="workspace gm-workspace">
        <WorkspaceMenu
          mode="gm"
          verify={verify}
          heading={`Profile books: ${s.books.length > 1 ? `Core + ${s.books.length - 1} supplements` : "Core · Fifth Edition"}`}
          selector={
            <Select
              label="Workshop page"
              id="gm-step-select"
              options={STEPS.map((name, i) => [i, name])}
              value={s.step}
              onChange={(value) => navigate(Number(value))}
            />
          }
          navigation={
            <nav className="gm-step-nav" aria-label="Workshop pages">
              <ol className="steps">
                {STEPS.map((name, i) => (
                  <li key={name}>
                    <Button
                      type="button"
                      className={s.step === i ? "active" : ""}
                      aria-current={s.step === i ? "step" : undefined}
                      onClick={() => navigate(i)}
                    >
                      <span className="step-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        {name}
                        <small>
                          {
                            [
                              "Choose your foundation",
                              "Optional changes",
                              "Armour, attacks & spells",
                              "A compact sheet",
                            ][i]
                          }
                        </small>
                      </span>
                    </Button>
                  </li>
                ))}
              </ol>
            </nav>
          }
          groups={actionGroups || []}
          history={<History />}
          status={state.storageMessage}
          documentState={s}
        />
        <main className="panel gm-panel" id="creator-main" tabIndex={-1}>
          <div className="gm-page-heading">
            <span className="eyebrow">
              THE BESTIARY · {String(s.step + 1).padStart(2, "0")} / 04
            </span>
            <h1>{STEPS[s.step]}</h1>
          </div>
          <div id="gm-feedback">
            {state.error && <p role="alert">{state.error}</p>}
            {r.profile && r.issues.length > 0 && (
              <section className="gm-issues" aria-label="Choices to finish">
                <strong>
                  {r.issues.length}{" "}
                  {r.issues.length === 1 ? "choice" : "choices"} to finish
                  before export
                </strong>
                <ul>
                  {r.issues.map((x: any, i: number) => (
                    <li key={`${x.code}:${i}`}>
                      <Button
                        type="button"
                        className="text-button"
                        onClick={() => jump(x)}
                      >
                        {x.message}
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {r.warnings.length > 0 && (
              <Details
                id="source-notes"
                title={`Source notes · ${r.warnings.length} · review before export`}
              >
                <ul>
                  {[...new Set<string>(r.warnings)].map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
                <p className="gm-small">
                  These notes stay in the app; the PDF contains the compact stat
                  block.
                </p>
              </Details>
            )}
          </div>
          {s.step === 0 ? (
            <Starting />
          ) : s.step === 1 ? (
            <Customise />
          ) : s.step === 2 ? (
            <EquipmentMagic />
          ) : (
            <Review />
          )}
          <footer className="gm-page-footer">
            {s.removed.length > 0 && (
              <Button
                className="text-button"
                onClick={() => setModal({ kind: "restore" })}
              >
                Restore removed entries ({s.removed.length})
              </Button>
            )}
            {s.step > 0 && (
              <Button onClick={() => navigate(s.step - 1)}>← Previous</Button>
            )}
            {s.step < 3 && (
              <Button className="primary" onClick={() => navigate(s.step + 1)}>
                {STEPS[s.step + 1]} →
              </Button>
            )}
          </footer>
        </main>
      </div>
      {compact && (
        <div
          className="mobile-workspace-bar gm-mobile-bar"
          role="region"
          aria-label="Character actions"
        >
          <History />
          <span>{status}</span>
        </div>
      )}
      {modal && (
        <BestiaryDialogs
          key={modal.kind === "appearance" ? "appearance" : "dialog"}
        />
      )}
      <p id="toast" role="status" aria-live="polite">
        {working || message}
      </p>
      <input
        ref={file}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(event) => {
          const selected = event.target.files?.[0];
          event.target.value = "";
          if (!selected) return;
          void busy("Reading draft…", async () => {
            const revision = store.getSnapshot().revision;
            if (selected.size > 2000000) throw Error("This save is too large.");
            const draft = store.validate(JSON.parse(await selected.text()));
            if (mounted.current && revision === store.getSnapshot().revision)
              setModal({ kind: "load", draft });
          });
        }}
      />
    </div>
  );
}
