"use client";
import { COMPACT_SHELL_QUERY } from "../../engine/responsive.mjs";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ModeNavigation } from "../../components/ModeNavigation";
import { CreatorMenu } from "../../components/CreatorMenu";
import { KEYS } from "../../engine/rules.mjs";
import { characteristicNames } from "../../engine/ui.mjs";
import { score } from "../../engine/controls.mjs";
import {
  GROUPS,
  findEntries,
  entryDescription,
  entrySource,
  careerLabel,
  speciesEntry,
} from "../../engine/marijan/catalogue.mjs";
import {
  freshMarijan,
  validateMarijan,
  calculateMarijan,
  addEntry,
  applySpeciesDefaults,
  rollCharacteristics,
  fromPlayer,
  SIZES,
} from "../../engine/marijan/model.mjs";
import { getMarijanStore } from "./store";
import { Action, Disclosure, Field, Select, numericSize } from "./fields";
import { LABELS as RESOURCE_LABELS } from "../../engine/marijan/labels.mjs";

const SECTIONS = [
  ["identity", "Identity"],
  ["characteristics", "Characteristics"],
  ["resources", "Resources"],
  ["skills", "Skills"],
  ["talents", "Talents"],
  ["magic", "Magic"],
  ["gear", "Equipment"],
  ["extras", "Extras"],
  ["notes", "Notes"],
];
const LABELS: Record<string, string> = RESOURCE_LABELS;
const TITLES: Record<string, string> = {
  skills: "Skills",
  talents: "Talents",
  magic: "Magic & prayers",
  gear: "Equipment",
  extras: "Traits, mutations & runes",
};
const STARTERS: Record<string, string> = {
  skills: "Add Species Skills",
  talents: "Add Species Talents",
  gear: "Add starting equipment",
};
const CUSTOM_KINDS: Record<string, string[][]> = {
  extras: [
    ["trait", "Creature Trait"],
    ["mutation", "Mutation"],
    ["rune", "Rune"],
    ["technique", "Technique"],
  ],
  gear: [
    ["gear", "Trapping"],
    ["weapon", "Weapon"],
    ["armour", "Armour"],
  ],
  magic: [
    ["spell", "Spell / prayer"],
    ["cant", "Cant"],
  ],
};
type Session = {
  disclosures: Record<string, boolean>;
  searches: Record<string, { query: string; book: string; count: number }>;
  careerQuery: string;
  expanded: boolean;
};
const sessions = new Map<boolean, Session>();
function getSession(verify: boolean) {
  if (!sessions.has(verify))
    sessions.set(verify, {
      disclosures: {},
      searches: Object.fromEntries(
        GROUPS.map((g: string) => [g, { query: "", book: "", count: 8 }]),
      ),
      careerQuery: "",
      expanded: false,
    });
  return sessions.get(verify)!;
}
function download(bytes: any, type: string, name: string) {
  const blob = new Blob([bytes], { type }),
    url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MarijanCreator({
  onReference,
}: {
  onReference?: (reference: {
    kind: string;
    name: string;
    book?: string;
  }) => void;
}) {
  // SSR never creates a draft or reads browser storage. The first effect chooses
  // the verification namespace, then the session-owned store loads once.
  const [verify, setVerify] = useState<boolean | null>(null);
  useEffect(() => {
    setVerify(new URLSearchParams(location.search).has("verify"));
  }, []);
  if (verify === null)
    return (
      <main className="panel">
        <h1>Opening Marijan Mode…</h1>
      </main>
    );
  return (
    <MarijanSession
      key={String(verify)}
      verify={verify}
      onReference={onReference}
    />
  );
}

function MarijanSession({
  verify,
  onReference,
}: {
  verify: boolean;
  onReference?: (reference: {
    kind: string;
    name: string;
    book?: string;
  }) => void;
}) {
  const store = getMarijanStore(verify);
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  const session = getSession(verify);
  const [disclosures, setDisclosures] = useState(session.disclosures);
  const [searches, setSearches] = useState(session.searches);
  const [careerQuery, setCareerQuery] = useState(session.careerQuery);
  const [activeSearch, setActiveSearch] = useState("");
  const [compact, setCompact] = useState(false);
  const [expanded, setExpanded] = useState(session.expanded);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTarget, setMenuTarget] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<any>(null);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState("");
  const [failure, setFailure] = useState("");
  const [customName, setCustomName] = useState("");
  const [customKind, setCustomKind] = useState("");
  const [generation, setGeneration] = useState({
    origin: "",
    career: "",
    target: 1,
  });
  const [generationModule, setGenerationModule] = useState<any>(null);
  const [generated, setGenerated] = useState<any>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const filePlayer = useRef(false);
  const active = useRef(true);
  const task = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const returnPosition = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const { draft: s, result: r, catalogue, library } = snapshot;

  useEffect(() => {
    active.current = true;
    void store.initialize();
    const persist = () => store.persist();
    window.addEventListener("pagehide", persist);
    window.addEventListener("wfrp-before-update", persist);
    const media = matchMedia(COMPACT_SHELL_QUERY);
    const change = () => {
      setCompact(media.matches);
      if (!media.matches) setMenuOpen(false);
    };
    change();
    media.addEventListener("change", change);
    setMenuTarget(document.getElementById("compact-tools"));
    return () => {
      active.current = false;
      task.current++;
      clearTimeout(toastTimer.current);
      store.breakGroup();
      store.persist();
      window.removeEventListener("pagehide", persist);
      window.removeEventListener("wfrp-before-update", persist);
      media.removeEventListener("change", change);
    };
  }, [store]);
  useEffect(() => {
    const node = dialogRef.current;
    if (dialog && node && !node.open) {
      node.showModal();
      if (dialog.type === "custom")
        node.querySelector<HTMLInputElement>("#mm-custom-name")?.focus();
    }
    if (!dialog && node?.open) node.close();
    return () => {
      if (node?.open) node.close();
    };
  }, [dialog]);

  function notify(message: string) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      if (active.current) setToast("");
    }, 4500);
  }
  function openDialog(value: any) {
    task.current++;
    setBusy("");
    setFailure("");
    setGenerated(null);
    setDialog(value);
  }
  function closeDialog() {
    task.current++;
    setBusy("");
    setFailure("");
    setDialog(null);
  }
  async function run(
    label: string,
    operation: (valid: () => boolean) => Promise<void>,
  ) {
    if (busy) return;
    const request = ++task.current;
    setBusy(label);
    setFailure("");
    const valid = () => active.current && task.current === request;
    try {
      await operation(valid);
    } catch (error) {
      if (valid())
        setFailure(error instanceof Error ? error.message : String(error));
    } finally {
      if (valid()) setBusy("");
    }
  }
  const detail = (id: string, initial = false) => ({
    id,
    open: disclosures[id] ?? initial,
    onToggle: (open: boolean) =>
      setDisclosures((previous) => {
        const next = { ...previous, [id]: open };
        session.disclosures = next;
        return next;
      }),
  });
  function setSearch(group: string, updates: any) {
    setSearches((previous) => {
      const next = { ...previous, [group]: { ...previous[group], ...updates } };
      session.searches = next;
      return next;
    });
  }
  function setPath(path: string, value: any) {
    store.edit((draft) => {
      const parts = path.split(".");
      const target = parts
        .slice(0, -1)
        .reduce((o: any, key: string) => o[key], draft);
      target[parts.at(-1)!] = value;
    }, path);
  }
  function entryValue(group: string, key: string, field: string, value: any) {
    store.edit((draft) => {
      const entry = draft.entries[group].find((x: any) => x.key === key);
      if (!entry) return;
      entry[field] = value;
      if (field === "text") entry.descriptionOverride = !!value.trim();
    }, `${group}:${key}:${field}`);
  }
  function field(
    label: string,
    path: string,
    numeric = false,
    area = false,
    ariaLabel?: string,
  ) {
    const value = path.split(".").reduce((o: any, key) => o[key], s);
    return (
      <Field
        key={path}
        id={`mm-${path.replaceAll(".", "-")}`}
        label={label}
        value={value}
        onValue={(value) => setPath(path, value)}
        numeric={numeric}
        area={area}
        ariaLabel={ariaLabel}
        onBlur={() => store.breakGroup()}
        attributes={{ "data-path": path }}
      />
    );
  }
  function option(label: string, path: string, options: any[]) {
    return (
      <Select
        id={`mm-${path}`}
        label={label}
        value={s[path]}
        options={options}
        onValue={(value) => setPath(path, value)}
        attributes={{ "data-path": path }}
      />
    );
  }
  function reference(kind: string, name: string, book?: string) {
    closeDialog();
    const value = { kind, name, book };
    if (onReference) onReference(value);
    else
      window.dispatchEvent(
        new CustomEvent("wfrp-reference", { detail: value }),
      );
  }
  function section(id: string, title: string, children: ReactNode) {
    const heading = <h2 id={`mm-heading-${id}`}>{title}</h2>;
    return (
      <section
        className="mm-section"
        id={`mm-section-${id}`}
        aria-labelledby={`mm-heading-${id}`}
      >
        {["skills", "talents", "magic", "gear", "extras", "notes"].includes(
          id,
        ) ? (
          <Disclosure
            {...detail(`marijan:section:${id}`, true)}
            className="mm-section-disclosure"
            summary={heading}
          >
            <div>{children}</div>
          </Disclosure>
        ) : (
          <>
            {heading}
            {children}
          </>
        )}
      </section>
    );
  }
  function jump(id: string) {
    const node = rootRef.current?.querySelector<HTMLElement>(
      `#mm-section-${id}`,
    );
    if (!node) return;
    const key = `marijan:section:${id}`;
    session.disclosures = { ...session.disclosures, [key]: true };
    setDisclosures(session.disclosures);
    requestAnimationFrame(() => {
      if (!active.current) return;
      node.scrollIntoView({ block: "start", behavior: "instant" });
      const heading = node.querySelector<HTMLElement>("summary,h2");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    });
  }
  function setFolioView(next: boolean) {
    setExpanded(next);
    session.expanded = next;
    if (next) {
      returnPosition.current = window.scrollY;
      requestAnimationFrame(() => {
        if (active.current && session.expanded)
          rootRef.current
            ?.querySelector(".mm-folio")
            ?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    } else {
      // Restore after React removes the folio, so native scroll anchoring does
      // not move the editor again when its preceding panel disappears.
      requestAnimationFrame(() => {
        if (active.current && !session.expanded)
          window.scrollTo({ top: returnPosition.current, behavior: "instant" });
      });
    }
  }
  function derived(keys: string[]) {
    return (
      <div className="mm-derived-grid">
        {keys.map((key) => (
          <div key={key} className="mm-derived">
            <div className="mm-derived-heading">
              <label htmlFor={`mm-override-${key}`}>
                {LABELS[key].replace(/ AP$/, "")}
              </label>
              <Action
                action="mode"
                className="quiet mm-mode"
                label={`${LABELS[key]}: ${s.overrides[key] === null ? "switch to manual" : "return to automatic"}`}
                attributes={{
                  "data-field": key,
                  "aria-pressed": String(s.overrides[key] !== null),
                }}
                onClick={() =>
                  store.edit((draft) => {
                    draft.overrides[key] =
                      draft.overrides[key] === null ? (r.auto[key] ?? 0) : null;
                  })
                }
              >
                {s.overrides[key] === null ? "Auto" : "Manual"}
              </Action>
            </div>
            <Field
              id={`mm-override-${key}`}
              label={LABELS[key]}
              ariaLabel={LABELS[key]}
              value={r.values[key]}
              numeric
              nullable
              bare
              hideLabel
              readOnly={s.overrides[key] === null}
              onValue={(value) =>
                store.edit((draft) => {
                  draft.overrides[key] = value;
                }, `override:${key}`)
              }
              onBlur={() => store.breakGroup()}
              attributes={{ "data-override": key }}
            />
            <small data-auto-label={key} hidden={s.overrides[key] === null}>
              Calculated {score(r.auto[key])}
            </small>
          </div>
        ))}
      </div>
    );
  }
  function resources(title: string, children: ReactNode, wide = false) {
    return (
      <fieldset
        className={`mm-resource-group${wide ? " mm-resource-wide" : ""}`}
      >
        <legend>{title}</legend>
        {children}
      </fieldset>
    );
  }

  async function copyPlayer(pc: any, valid: () => boolean) {
    if (!pc || pc.type || pc.version !== 2)
      throw Error("Choose a current Player creator JSON save.");
    const [{ catalogForCharacter }, { characterResult }] = await Promise.all([
      import("../../engine/books.mjs"),
      import("../../engine/character-result.mjs"),
    ]);
    if (!valid()) return;
    const rules = catalogForCharacter(library, pc);
    const next = fromPlayer(catalogue, pc, characterResult(rules, pc), rules);
    validateMarijan(next);
    store.replace(next);
    closeDialog();
    notify(
      "Copied player values. The original is unchanged; existing bonuses are already included.",
    );
  }
  function chooseFile(player = false) {
    filePlayer.current = player;
    if (fileRef.current) {
      fileRef.current.value = "";
      fileRef.current.click();
    }
  }
  async function importFile(file?: File) {
    if (!file) return;
    const player = filePlayer.current;
    await run("Reading character…", async (valid) => {
      const parsed = JSON.parse(await file.text());
      if (!valid()) return;
      if (player) await copyPlayer(parsed, valid);
      else {
        store.replace(parsed);
        closeDialog();
        notify("Marijan character loaded.");
      }
    });
  }
  const fileName = () =>
    (s.name || "character").replace(/[^\p{L}\p{N} _-]/gu, "_").slice(0, 80);
  function backup() {
    download(
      JSON.stringify(s, null, 2),
      "application/json",
      fileName() + "-marijan.json",
    );
  }
  function save() {
    const stored = store.save();
    backup();
    notify(
      stored
        ? "Character saved to the local Marijan library."
        : "Device storage unavailable. Downloading your backup instead.",
    );
  }
  async function exportPDF() {
    const draft = structuredClone(s),
      result = r;
    await run("Preparing…", async (valid) => {
      const [{ exportMarijanSheet }, { loadPDFLibrary }] = await Promise.all([
        import("../../engine/marijan/pdf.mjs"),
        import("../../engine/pdf-runtime.mjs"),
      ]);
      await loadPDFLibrary();
      if (!valid()) return;
      const bytes = await exportMarijanSheet(catalogue, draft, result);
      if (!valid()) return;
      download(
        bytes,
        "application/pdf",
        (draft.name || "character")
          .replace(/[^\p{L}\p{N} _-]/gu, "_")
          .slice(0, 80) + "-marijan.pdf",
      );
      notify("Editable sheet and complete unrestricted record exported.");
    });
  }
  async function startGeneration() {
    openDialog({ type: "generate", title: "Generate Fifth Edition character" });
    setGeneration({
      origin: s.generationOrigin || "",
      career: r.career?.contentId || s.career,
      target: Math.min(4, Math.max(1, s.level)),
    });
    await run("Loading generation…", async (valid) => {
      const module = await import("../../engine/marijan/generation.mjs");
      if (valid()) setGenerationModule(module);
    });
  }
  async function startingChoices(group: string) {
    const revision = snapshot.revision;
    await run("Adding random choices…", async (valid) => {
      const { rollStartingChoices, addStartingChoices } = await import(
        "../../engine/marijan/generation.mjs"
      );
      if (!valid() || store.getSnapshot().revision !== revision) return;
      const rolled = rollStartingChoices(catalogue, s, group);
      store.edit((draft) => addStartingChoices(catalogue, draft, rolled));
      notify(
        "Random starting choices added. Existing entries kept; duplicate values were not stacked.",
      );
    });
  }
  function generationRecord(draft: any) {
    if (!draft.generation) return null;
    return (
      <Disclosure
        {...detail("marijan:generation")}
        className="mm-generation-report"
        summary={
          <>
            Original generation · level {draft.generation.target} ·{" "}
            {draft.generation.purchases.reduce(
              (n: number, q: any) => n + q.cost,
              0,
            )}{" "}
            XP spent
          </>
        }
      >
        <p>
          Records the generated baseline. Later freehand edits do not rewrite
          these purchases.
        </p>
        {draft.generation.notes.map((note: string, index: number) => (
          <p key={index}>{note}</p>
        ))}
        <ol>
          {draft.generation.purchases.map((purchase: any, index: number) => (
            <li key={index}>
              {purchase.name} · {purchase.type}
              {["char", "skill"].includes(purchase.type) ? " +5" : ""} ·{" "}
              {purchase.cost} XP
            </li>
          ))}
        </ol>
      </Disclosure>
    );
  }

  function entryRow(group: string, x: any) {
    const attributes = { "data-key": x.key, "data-group": group };
    const entryField = (
      label: string,
      name: string,
      numeric = false,
      nullable = false,
      readonly = false,
      value = x[name],
      ariaLabel?: string,
    ) => (
      <Field
        id={`mm-${name === "text" ? "description" : name}-${x.key}`}
        label={label}
        value={value}
        numeric={numeric}
        nullable={nullable}
        readOnly={readonly}
        bare={name === "total"}
        ariaLabel={ariaLabel}
        area={name === "text"}
        onValue={(value) => entryValue(group, x.key, name, value)}
        onBlur={() => store.breakGroup()}
        attributes={{ ...attributes, "data-entry-field": name }}
      />
    );
    const selectField = (
      label: string,
      name: string,
      options: any[],
      ariaLabel?: string,
    ) => (
      <Select
        id={`mm-${name === "char" ? "char" : name}-${x.key}`}
        label={label}
        value={x[name]}
        options={options}
        ariaLabel={ariaLabel}
        onValue={(value) => entryValue(group, x.key, name, value)}
        attributes={{ ...attributes, "data-entry-field": name }}
      />
    );
    const amountLabel =
      group === "skills"
        ? "advances"
        : group === "talents"
          ? "ranks"
          : group === "gear"
            ? "quantity"
            : "count";
    const total = r.skills.find((row: any) => row.key === x.key)?.total;
    const customSkill = x.custom && group === "skills";
    return (
      <article
        className={`mm-entry mm-entry-${group}`}
        id={`mm-entry-${x.key}`}
        key={x.key}
      >
        <div className="mm-entry-line">
          <div className="mm-entry-name">
            {customSkill ? (
              <span className="mm-custom-skill-name">{x.name}</span>
            ) : x.custom ? (
              entryField("Custom name", "name")
            ) : (
              <Action
                action="inspect"
                className="mm-name-button"
                attributes={attributes}
                onClick={() =>
                  openDialog({
                    type: "inspect",
                    title: x.name,
                    group,
                    key: x.key,
                  })
                }
              >
                {x.name}
              </Action>
            )}
            {x.adaptation && (
              <Action
                action="inspect"
                className="legacy-tag"
                attributes={attributes}
                onClick={() =>
                  openDialog({
                    type: "inspect",
                    title: x.name,
                    group,
                    key: x.key,
                  })
                }
              >
                Legacy
              </Action>
            )}
          </div>
          <div className="mm-entry-controls">
            <div className="mm-entry-number" style={numericSize(x.amount)}>
              {entryField(
                group === "skills"
                  ? "Adv"
                  : group === "gear"
                    ? "Qty"
                    : amountLabel[0].toUpperCase() + amountLabel.slice(1),
                "amount",
                true,
                false,
                false,
                x.amount,
                `${x.name} ${amountLabel}`,
              )}
            </div>
            {group === "skills" && (
              <div className="mm-skill-total" style={numericSize(total)}>
                {entryField(
                  "Total",
                  "total",
                  true,
                  true,
                  x.total === null,
                  total,
                  `${x.name} total`,
                )}
              </div>
            )}
            {group === "extras" &&
              entryField(`${x.name} rating or target`, "rating")}
            <Action
              action="remove"
              className="quiet mm-remove"
              attributes={attributes}
              label={`Remove ${x.name}`}
              onClick={() =>
                store.edit((draft) => {
                  draft.entries[group] = draft.entries[group].filter(
                    (entry: any) => entry.key !== x.key,
                  );
                })
              }
            >
              ×
            </Action>
          </div>
        </div>
        <details
          className="mm-entry-disclosure"
          data-detail-key={`marijan-entry:${x.key}`}
          open={disclosures[`marijan-entry:${x.key}`] ?? false}
          onToggle={(event) =>
            detail(`marijan-entry:${x.key}`).onToggle(event.currentTarget.open)
          }
        >
          <summary
            aria-label={`Edit ${x.name} details`}
            title="Details & overrides"
          >
            <svg
              className="mm-entry-chevron"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="mm-entry-detail">
            {customSkill && (
              <>
                <h3 className="mm-custom-skill-title">{x.name}</h3>
                {entryField("Rename Skill", "name")}
              </>
            )}
            <small>
              {entrySource(catalogue, x)}
              {x.category ? ` · ${x.category}` : ""}
            </small>
            <div className="mm-fields">
              {group === "skills" && (
                <>
                  {selectField(
                    "Char",
                    "char",
                    KEYS,
                    `${x.name} Characteristic`,
                  )}
                  <div className="field">
                    <span className="label">Total calculation</span>
                    <Action
                      action="skill-mode"
                      className="quiet mm-mode"
                      attributes={attributes}
                      label={`${x.name} total: ${x.total === null ? "switch to manual" : "return to automatic"}`}
                      onClick={() =>
                        store.edit((draft) => {
                          draft.entries[group].find(
                            (entry: any) => entry.key === x.key,
                          ).total = x.total === null ? total : null;
                        })
                      }
                    >
                      {x.total === null ? "Auto" : "Manual"}
                    </Action>
                  </div>
                </>
              )}
              {group === "gear" && (
                <>
                  {selectField(`${x.name} location`, "state", [
                    ["equipped", "Equipped"],
                    ["worn", "Worn"],
                    ["carried", "Carried"],
                    ["stored", "Stored"],
                  ])}
                  {entryField("Unit Enc", "enc", true, true)}
                  {entryField("AP", "ap", true, true)}
                  {entryField("Damage", "damage")}
                  {entryField("Locations", "locations")}
                  {entryField("Qualities / flaws", "qualities")}
                </>
              )}
              {group === "magic" && (
                <>
                  {entryField("Lore / patron", "lore")}
                  {entryField("Type", "category")}
                </>
              )}
            </div>
            {group === "magic" && (
              <div className="mm-fields">
                {["cn", "range", "target", "duration"].map((key) => (
                  <span key={key}>
                    {entryField(
                      key === "cn"
                        ? "Casting Number"
                        : key[0].toUpperCase() + key.slice(1),
                      key,
                    )}
                  </span>
                ))}
              </div>
            )}
            {!x.custom && (
              <p className="small">
                {entryDescription(catalogue, {
                  ...x,
                  descriptionOverride: false,
                })}
              </p>
            )}
            {entryField(
              x.custom ? "Description" : "Personal description (optional)",
              "text",
            )}
            <small>
              {x.custom
                ? "User-defined; no printed source or automatic effects."
                : "Profile edits apply only to this character. The book reference stays unchanged."}
            </small>
          </div>
        </details>
      </article>
    );
  }
  function collection(group: string) {
    const state = searches[group];
    const rows =
      activeSearch === group
        ? findEntries(catalogue, group, state.query, state.book)
        : [];
    return section(
      group,
      TITLES[group],
      <>
        {STARTERS[group] && (
          <div className="mm-starter-actions">
            <Action
              action="starting-choices"
              attributes={{ "data-group": group }}
              disabled={!!busy}
              onClick={() => void startingChoices(group)}
            >
              {STARTERS[group]}
            </Action>
            <small>Random choices; existing entries kept.</small>
          </div>
        )}
        <div className="mm-add-bar">
          <div className="field">
            <label htmlFor={`mm-find-${group}`}>
              Add {TITLES[group].toLowerCase()}
            </label>
            <input
              id={`mm-find-${group}`}
              type="search"
              autoComplete="off"
              data-find={group}
              placeholder="Find by name…"
              aria-controls={`mm-results-${group}`}
              value={state.query}
              onFocus={() => setActiveSearch(group)}
              onChange={(event) => {
                setSearch(group, { query: event.target.value, count: 8 });
                setActiveSearch(group);
              }}
            />
          </div>
          <Select
            label="Book"
            id={`mm-book-${group}`}
            value={state.book}
            options={[
              ["", "All books"],
              ...catalogue.books
                .filter((book: any) =>
                  catalogue.rows.some(
                    (row: any) =>
                      row.collection === group && row.source?.book === book.id,
                  ),
                )
                .map((book: any) => [book.id, book.shortTitle || book.title]),
            ]}
            attributes={{ "data-book-filter": group }}
            onValue={(value) => {
              setSearch(group, { book: value, count: 8 });
              setActiveSearch(group);
            }}
          />
          <Action
            action="custom"
            attributes={{ "data-group": group }}
            onClick={() => {
              setCustomName("");
              setCustomKind(CUSTOM_KINDS[group]?.[0]?.[0] || "");
              openDialog({ type: "custom", title: "Add custom entry", group });
            }}
          >
            + Custom
          </Action>
        </div>
        <div
          id={`mm-results-${group}`}
          className="mm-search-results"
          hidden={activeSearch !== group}
        >
          {rows.slice(0, state.count).map((row: any) => (
            <div className="mm-search-choice" key={row.id}>
              <div>
                <strong>{row.name}</strong>
                <small>
                  {entrySource(catalogue, row)}
                  {row.adaptation ? " · Legacy" : ""}
                  {row.kind !== group ? ` · ${row.kind}` : ""}
                </small>
              </div>
              <Action
                action="add"
                label={`Add ${row.name}`}
                attributes={{ "data-id": row.id, "data-group": group }}
                onClick={() => {
                  store.edit((draft) => addEntry(draft, group, row));
                  notify(`${row.name} added.`);
                }}
              >
                + Add
              </Action>
            </div>
          ))}
          {rows.length > state.count && (
            <Action
              action="more"
              attributes={{ "data-group": group }}
              onClick={() => setSearch(group, { count: state.count + 8 })}
            >
              More ({rows.length - state.count})
            </Action>
          )}
          {!rows.length && (
            <p className="mm-empty">
              No matches. Try another name or add a custom entry.
            </p>
          )}
        </div>
        {["skills", "talents"].includes(group) && (
          <div
            className={`mm-list-heading mm-list-heading-${group}`}
            aria-hidden="true"
          >
            <span>{group === "skills" ? "Skill" : "Talent"}</span>
            <span>{group === "skills" ? "Adv" : "Ranks"}</span>
            {group === "skills" && <span>Total</span>}
            <span />
          </div>
        )}
        <div className="mm-entries" id={`mm-list-${group}`}>
          {s.entries[group].length ? (
            s.entries[group].map((x: any) => entryRow(group, x))
          ) : (
            <p className="mm-empty">
              No {TITLES[group].toLowerCase()} added. Search above or add your
              own.
            </p>
          )}
        </div>
      </>,
    );
  }

  if (snapshot.status !== "ready")
    return (
      <main className="panel">
        <h1>
          {snapshot.status === "error"
            ? "Marijan Mode could not open"
            : "Opening Marijan Mode…"}
        </h1>
        {snapshot.error && (
          <>
            <p className="error">{snapshot.error}</p>
            <Action action="reload" onClick={() => void store.initialize()}>
              Retry
            </Action>
          </>
        )}
      </main>
    );

  const species = speciesEntry(catalogue, s.species);
  const historyControls = (
    <div className="history-controls" role="group" aria-label="Edit history">
      {(["undo", "redo"] as const).map((direction) => (
        <Action
          key={direction}
          action={direction}
          className="quiet history-button"
          label={direction === "undo" ? "Undo" : "Redo"}
          disabled={
            direction === "undo" ? !snapshot.canUndo : !snapshot.canRedo
          }
          onClick={() => store.travel(direction)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={direction === "redo" ? "history-redo-icon" : undefined}
          >
            <path d="M9 5 4 10l5 5M4 10h9a6 6 0 0 1 6 6v3" />
          </svg>
        </Action>
      ))}
    </div>
  );
  const tools = (
    <>
      <div className={compact ? "mobile-menu-actions" : "mm-rail-tools"}>
        <Action action="save" onClick={save}>
          Save character
        </Action>
        <Action
          action="load"
          onClick={() =>
            openDialog({ type: "load", title: "Load Marijan character" })
          }
        >
          Load character
        </Action>
        <Action
          action="copy-player"
          onClick={() =>
            openDialog({ type: "copy", title: "Copy player character" })
          }
        >
          Copy player character
        </Action>
        <Action
          action="new"
          onClick={() => {
            store.replace(freshMarijan());
            notify("New blank character. Undo restores the previous draft.");
          }}
        >
          New character
        </Action>
        <Action
          action="export"
          className="primary"
          disabled={!!busy}
          onClick={() => void exportPDF()}
        >
          Export PDF
        </Action>
      </div>
      <div id="mm-install">
        <span data-install-slot />
      </div>
    </>
  );
  const menuButton = compact && (
    <button
      type="button"
      className="quiet mobile-menu-launcher"
      aria-label="Open creator menu"
      aria-controls="creator-menu"
      aria-haspopup="dialog"
      onClick={() => setMenuOpen(true)}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path
          d="M4 6h16M4 12h16M4 18h16"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
  const inspected =
    dialog?.type === "inspect"
      ? s.entries[dialog.group].find((x: any) => x.key === dialog.key)
      : null;
  const generationCareers = generationModule
    ? generationModule.availableGenerationCareers(catalogue, {
        ...s,
        generationOrigin: generation.origin,
      })
    : [];
  const changeGeneration = (update: any) => {
    setGeneration((previous) => ({ ...previous, ...update }));
    setGenerated(null);
  };

  return (
    <div
      ref={rootRef}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".mm-add-bar,.mm-search-results"))
          setActiveSearch("");
      }}
      onBlur={(event) => {
        if (
          !event.relatedTarget ||
          !event.currentTarget.contains(event.relatedTarget as Node)
        )
          setActiveSearch("");
      }}
    >
      <div className="mm-workspace">
        <aside className="rail mm-rail">
          {!compact && <ModeNavigation mode="marijan" verify={verify} />}
          <div className="rail-heading">
            <span className="eyebrow">Marijan Mode</span>
            <strong>Freehand character</strong>
            <p className="mm-rail-intro">One page. Your values.</p>
          </div>
          <nav className="mm-section-nav" aria-label="Editor sections">
            {SECTIONS.map(([id, title]) => (
              <a
                href={`#mm-section-${id}`}
                key={id}
                onClick={(event) => {
                  event.preventDefault();
                  jump(id);
                }}
              >
                {title}
              </a>
            ))}
          </nav>
          <div className="field mm-mobile-section">
            <label htmlFor="mm-section-jump">Jump to section</label>
            <select
              id="mm-section-jump"
              value=""
              onChange={(event) => {
                const id = event.currentTarget.value;
                event.currentTarget.value = "";
                jump(id);
              }}
            >
              <option value="">Jump to section…</option>
              {SECTIONS.map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </div>
          {!compact && historyControls}
          {!compact && tools}
          {!compact && (
            <small id="mm-save-status" role="status">
              {snapshot.message}
            </small>
          )}
        </aside>
        <main id="creator-main" className="panel mm-page" tabIndex={-1}>
          <h1 className="chapter-title" aria-label="Marijan Mode">
            <span className="chapter-initial" aria-hidden="true">
              <span>M</span>
            </span>
            <span aria-hidden="true">arijan Mode</span>
          </h1>
          <p className="mm-intro">
            Unrestricted character creation. Values and choices are yours; XP
            and money are never deducted.
          </p>
          <div className="mm-generation">
            <p>
              Start from a random Fifth Edition character, then edit freely.
            </p>
            <Action
              action="generate"
              className="primary"
              disabled={!!busy}
              onClick={() => void startGeneration()}
            >
              Generate character
            </Action>
          </div>
          <div id="mm-generation-record">{generationRecord(s)}</div>
          {section(
            "identity",
            "Identity",
            <>
              <div className="mm-fields">
                {field("Name", "name")}
                {option("Species", "species", Object.keys(catalogue.species))}
                {field("Origin / background", "origin")}
                {field("Career level", "level", true)}
              </div>
              <div className="mm-career-tools">
                <div className="field">
                  <label htmlFor="mm-career-search">Find a Career</label>
                  <input
                    id="mm-career-search"
                    type="search"
                    placeholder="Filter Careers by name…"
                    value={careerQuery}
                    onChange={(event) => {
                      setCareerQuery(event.target.value);
                      session.careerQuery = event.target.value;
                    }}
                  />
                </div>
                <Select
                  id="mm-career"
                  label="Career"
                  value={r.career?.contentId || s.career}
                  options={[
                    ["", "No Career"],
                    ...catalogue.careers
                      .filter(
                        (career: any) =>
                          career.name
                            .toLowerCase()
                            .includes(careerQuery.toLowerCase()) ||
                          career.contentId === s.career,
                      )
                      .map((career: any) => [
                        career.contentId,
                        careerLabel(catalogue, career),
                      ]),
                  ]}
                  attributes={{ "data-path": "career" }}
                  onValue={(value) => setPath("career", value)}
                />
                <Action
                  action="defaults"
                  onClick={() => {
                    if (species)
                      openDialog({
                        type: "defaults",
                        title: "Apply Species defaults",
                      });
                    else
                      notify("No book defaults exist for this custom Species.");
                  }}
                >
                  Species defaults
                </Action>
              </div>
              <small id="mm-career-summary">
                {r.career ? (
                  <>
                    {r.career.class} ·{" "}
                    {r.career.levels.find(
                      (level: any) => level.level === s.level,
                    )?.name || "Custom level"}{" "}
                    · {entrySource(catalogue, r.career)}{" "}
                    {r.career.adaptation && (
                      <Action
                        action="career-reference"
                        className="legacy-tag"
                        onClick={() => reference("career", r.career.name)}
                      >
                        Legacy
                      </Action>
                    )}{" "}
                    <Action
                      action="career-reference"
                      className="source-button"
                      onClick={() => reference("career", r.career.name)}
                    >
                      Read Career
                    </Action>
                  </>
                ) : (
                  "A Career is a label here; it does not limit your choices."
                )}
              </small>
              <p id="mm-species-source" className="small">
                {species ? (
                  <>
                    {entrySource(catalogue, species)}{" "}
                    {species.adaptation && (
                      <Action
                        action="species-reference"
                        className="legacy-tag"
                        onClick={() =>
                          openDialog({ type: "species", title: species.name })
                        }
                      >
                        Legacy
                      </Action>
                    )}{" "}
                    <Action
                      action="species-reference"
                      className="source-button"
                      onClick={() =>
                        openDialog({ type: "species", title: species.name })
                      }
                    >
                      Species reference
                    </Action>
                  </>
                ) : (
                  "Custom Species; no printed defaults."
                )}
              </p>
              <Disclosure
                {...detail("marijan:custom-species")}
                summary="Custom Species or Career"
              >
                <div className="mm-fields">
                  <Field
                    id="mm-species-name"
                    label="Species name"
                    value={s.species}
                    onValue={(value) => setPath("species", value)}
                    attributes={{ "data-path": "species" }}
                    onBlur={() => store.breakGroup()}
                  />
                  <Field
                    id="mm-career-name"
                    label="Career name"
                    value={s.career}
                    onValue={(value) => setPath("career", value)}
                    attributes={{ "data-path": "career" }}
                    onBlur={() => store.breakGroup()}
                  />
                </div>
                <p className="small">
                  Custom names carry no automatic defaults.
                </p>
              </Disclosure>
            </>,
          )}
          {section(
            "characteristics",
            "Characteristics",
            <>
              <div className="mm-inline-tools">
                <Action
                  action="roll"
                  className="secondary"
                  onClick={() => {
                    try {
                      store.edit((draft) =>
                        rollCharacteristics(draft, catalogue),
                      );
                      notify(
                        "Ten real 2d10 rolls recorded. Starting values replaced.",
                      );
                    } catch (error) {
                      notify(
                        error instanceof Error ? error.message : String(error),
                      );
                    }
                  }}
                >
                  Roll starting values
                </Action>
                <label className="mm-check">
                  <input
                    type="checkbox"
                    data-path="talentEffects"
                    checked={s.talentEffects}
                    onChange={(event) =>
                      setPath("talentEffects", event.target.checked)
                    }
                  />{" "}
                  Apply Characteristic &amp; Movement Talent bonuses
                </label>
              </div>
              <p className="mm-char-help">
                Starting → Total · includes Advances, Other and enabled Talent
                bonuses
              </p>
              <div className="mm-char-overview">
                {KEYS.map((key: string) => (
                  <div className="mm-char-cell" key={key}>
                    <abbr
                      title={
                        (characteristicNames as Record<string, string>)[key]
                      }
                    >
                      {key}
                    </abbr>
                    {field(
                      `${(characteristicNames as Record<string, string>)[key]} initial`,
                      `characteristics.${key}.initial`,
                      true,
                    )}
                    <output
                      data-result={`stat:${key}`}
                      aria-label={`${(characteristicNames as Record<string, string>)[key]} total`}
                    >
                      {r.stats[key]}
                    </output>
                  </div>
                ))}
              </div>
              <Disclosure
                {...detail("marijan:characteristic-adjustments")}
                className="mm-char-adjustments"
                summary="Advances & other modifiers"
              >
                <div className="mm-char-adjustment-grid">
                  {KEYS.map((key: string) => (
                    <div key={key}>
                      <strong
                        title={
                          (characteristicNames as Record<string, string>)[key]
                        }
                      >
                        {key}
                      </strong>
                      {field(
                        "Adv",
                        `characteristics.${key}.advances`,
                        true,
                        false,
                        `${(characteristicNames as Record<string, string>)[key]} advances`,
                      )}
                      {field(
                        "Other",
                        `characteristics.${key}.modifier`,
                        true,
                        false,
                        `${(characteristicNames as Record<string, string>)[key]} modifier`,
                      )}
                    </div>
                  ))}
                </div>
              </Disclosure>
              <Disclosure
                {...detail("marijan:calculations")}
                summary="How totals work"
              >
                <p>
                  Starting + Advances + Other, plus the printed +5
                  Characteristic Talents when enabled. Roll replaces Starting
                  with your Species modifier + 2d10; Advances and Other stay
                  intact. No XP is spent. Situational effects, Traits and
                  mutations remain references.
                </p>
                {option("Sturdy formula", "sturdyRule", [
                  ["creation", "Creation: double capacity"],
                  ["talent", "Talent: add Strength Bonus"],
                ])}
              </Disclosure>
            </>,
          )}
          {section(
            "resources",
            "Resources",
            <>
              <div className="mm-resource-groups">
                {resources(
                  "Fate & Fortune",
                  <div className="mm-fields mm-resource-inputs">
                    {field("Fate", "fate", true)}
                    {field("Fortune", "fortune", true)}
                  </div>,
                )}
                {resources(
                  "Experience",
                  <div className="mm-fields mm-resource-inputs">
                    {field("XP spent", "xpSpent", true)}
                    {field("XP unspent", "xpUnspent", true)}
                    {field("Tracker boxes", "tracker", true)}
                  </div>,
                )}
                {resources(
                  "Social status",
                  <div className="mm-fields mm-resource-inputs">
                    {field("Status", "status")}
                    {field("Standing", "standing", true)}
                  </div>,
                )}
                {resources(
                  "Money",
                  <div className="mm-fields mm-resource-inputs">
                    {field("Gold crowns", "coins.gc", true)}
                    {field("Silver shillings", "coins.ss", true)}
                    {field("Brass pennies", "coins.d", true)}
                  </div>,
                )}
                {resources(
                  "Corruption & Sin",
                  <div className="mm-fields mm-resource-inputs">
                    {field("Corruption", "corruption", true)}
                    {field("Sin", "sin", true)}
                  </div>,
                )}
                {resources(
                  "Size & movement",
                  <>
                    <div className="mm-fields mm-resource-inputs">
                      {option("Size", "size", SIZES)}
                      {field("Base Movement", "baseMovement", true)}
                    </div>
                    {derived(["movement"])}
                  </>,
                )}
                {resources(
                  "Wounds & carrying",
                  derived(["wounds", "capacity", "enc"]),
                  true,
                )}
                {resources(
                  "Armour protection",
                  derived(["head", "arms", "body", "legs", "shield"]),
                  true,
                )}
              </div>
              <Disclosure
                {...detail("marijan:resource-help")}
                className="mm-resource-help"
                summary="Automatic values & overrides"
              >
                <p>
                  Auto follows the calculated value. Choose Manual to enter any
                  number; a blank manual field returns to Auto. Resource values
                  are entered directly. Luck does not change Fortune.
                </p>
              </Disclosure>
            </>,
          )}
          {GROUPS.map((group: string) => (
            <div key={group}>{collection(group)}</div>
          ))}
          {section(
            "notes",
            "Notes & appearance",
            <>
              {field("Appearance", "appearance", false, true)}
              <div className="mm-fields">
                {field("Personal ambition", "ambition")}
                {field("Party ambition", "partyAmbition")}
              </div>
              {field("Notes", "notes", false, true)}
              <Disclosure {...detail("marijan:rolls")} summary="Recorded rolls">
                <div id="mm-rolls">
                  {s.rolls.length
                    ? s.rolls.map((roll: any, index: number) => (
                        <p className="small" key={index}>
                          {roll.label}: {roll.faces.join(" + ")} ={" "}
                          {roll.faces.reduce(
                            (a: number, b: number) => a + b,
                            0,
                          )}
                        </p>
                      ))
                    : "No rolls yet."}
                </div>
              </Disclosure>
            </>,
          )}
          <div className="mm-page-footer">
            <Action
              action="export"
              className="primary"
              disabled={!!busy}
              onClick={() => void exportPDF()}
            >
              Export character sheet PDF
            </Action>
            <Action action="backup" onClick={backup}>
              Download JSON backup
            </Action>
          </div>
        </main>
        <aside
          className={`sheet mm-folio${compact ? " mobile-fold-folio" : ""}${expanded ? " mobile-folio-open" : ""}`}
          aria-label="Character summary"
          hidden={compact && !expanded}
          data-mobile-expanded={expanded ? "true" : "false"}
        >
          <div className="mobile-folio-heading">
            <strong>{s.name || "Your character"}</strong>
            <button
              type="button"
              className="quiet"
              data-mobile-folio-toggle
              aria-controls="mobile-folio-content"
              aria-expanded={expanded}
              onClick={() => setFolioView(!expanded)}
            >
              {expanded ? "Hide details" : "View character"}
            </button>
          </div>
          <div className="mobile-folio-content" id="mobile-folio-content">
            <div className="mm-folio-emblem">
              <img
                className="ledger-emblem"
                src="/assets/ledger-emblem.svg"
                alt=""
                width="128"
                height="144"
              />
            </div>
            <h2 id="mm-folio-name">{s.name || "Your character"}</h2>
            <p id="mm-folio-identity">
              {s.species}
              {r.career
                ? ` · ${r.career.name}`
                : s.career
                  ? ` · ${s.career}`
                  : ""}
            </p>
            <div className="mm-folio-stats">
              {KEYS.map((key: string) => (
                <div key={key}>
                  <span>{key}</span>
                  <strong data-result={`stat:${key}`}>{r.stats[key]}</strong>
                </div>
              ))}
            </div>
            <dl className="mm-folio-resources">
              {["wounds", "movement", "capacity", "enc"].map((key) => (
                <div key={key}>
                  <dt>{LABELS[key]}</dt>
                  <dd data-result={`derived:${key}`}>{score(r.values[key])}</dd>
                </div>
              ))}
              <div>
                <dt>Total XP</dt>
                <dd data-result="xp">{score(r.xpTotal)}</dd>
              </div>
            </dl>
            <div id="mm-counts">
              <dl className="mm-entry-counts">
                {GROUPS.map((group: string) => (
                  <Fragment key={group}>
                    <dt>
                      {group === "gear"
                        ? "Equipment"
                        : group[0].toUpperCase() + group.slice(1)}
                    </dt>
                    <dd>{s.entries[group].length}</dd>
                  </Fragment>
                ))}
              </dl>
            </div>
            <div id="mm-warnings" className="mm-warnings">
              {r.warnings.map((warning: string, index: number) => (
                <p key={index}>{warning}</p>
              ))}
            </div>
            <Action
              action="export"
              className="primary"
              disabled={!!busy}
              onClick={() => void exportPDF()}
            >
              Export PDF
            </Action>
            <small>Marijan Mode · unrestricted</small>
          </div>
        </aside>
      </div>
      {compact && (
        <div
          className="mobile-workspace-bar mobile-marijan-bar"
          role="region"
          aria-label="Character actions"
        >
          {historyControls}
          <strong>{s.name || "Your character"}</strong>
          <button
            type="button"
            className="quiet"
            data-mobile-view
            aria-controls="mobile-folio-content"
            aria-expanded={expanded}
            onClick={() => setFolioView(!expanded)}
          >
            {expanded ? "Back to editor" : "View character"}
          </button>
        </div>
      )}
      {menuTarget ? createPortal(menuButton, menuTarget) : menuButton}
      <CreatorMenu
        mode="marijan"
        verify={verify}
        open={compact && menuOpen}
        onClose={() => setMenuOpen(false)}
        status={snapshot.message}
      >
        {compact && tools}
      </CreatorMenu>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(event) => void importFile(event.target.files?.[0])}
      />
      <dialog
        ref={dialogRef}
        id="creator-dialog"
        className="creator-dialog"
        aria-labelledby="creator-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
      >
        <div className="dialog-heading">
          <h2 id="creator-dialog-title">{dialog?.title}</h2>
          <Action
            action="close-dialog"
            className="quiet"
            label="Close dialog"
            onClick={closeDialog}
          >
            Close
          </Action>
        </div>
        <div
          id="creator-dialog-body"
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              (event.target as HTMLElement).id === "mm-custom-name"
            ) {
              event.preventDefault();
              dialogRef.current
                ?.querySelector<HTMLButtonElement>('[data-action="add-custom"]')
                ?.click();
            }
          }}
        >
          {dialog?.type === "custom" && (
            <>
              <Field
                id="mm-custom-name"
                label="Name"
                value={customName}
                placeholder="Your entry name"
                onValue={setCustomName}
              />
              {CUSTOM_KINDS[dialog.group] && (
                <Select
                  id="mm-custom-kind"
                  label="Type"
                  value={customKind}
                  options={CUSTOM_KINDS[dialog.group]}
                  onValue={setCustomKind}
                />
              )}
              <p className="small">
                User-defined values and descriptions; no printed source or
                automatic effects.
              </p>
              <div className="mm-modal-actions">
                <Action
                  action="add-custom"
                  className="primary"
                  attributes={{ "data-group": dialog.group }}
                  onClick={() => {
                    if (!customName.trim()) {
                      document.getElementById("mm-custom-name")?.focus();
                      return;
                    }
                    store.edit((draft) =>
                      addEntry(draft, dialog.group, {
                        name: customName.trim(),
                        custom: true,
                        kind: customKind || undefined,
                      }),
                    );
                    closeDialog();
                  }}
                >
                  Add entry
                </Action>
              </div>
            </>
          )}
          {dialog?.type === "inspect" && inspected && (
            <>
              <p className="small">{entrySource(catalogue, inspected)}</p>
              {inspected.adaptation && (
                <p className="notice">
                  <strong>Legacy</strong> · {inspected.adaptation}
                </p>
              )}
              {inspected.unavailable && (
                <p className="notice">{inspected.unavailable}</p>
              )}
              <p className="mm-reference-text">
                {inspected.text ||
                  "Open the shared book search for the complete reference."}
              </p>
              {!inspected.custom && (
                <Action
                  action="reference"
                  onClick={() =>
                    reference(
                      (
                        {
                          skills: "skill",
                          talents: "talent",
                          magic: inspected.kind === "cant" ? "cant" : "spell",
                          gear: "gear",
                          extras: inspected.kind,
                        } as Record<string, string>
                      )[dialog.group],
                      inspected.name,
                    )
                  }
                >
                  Read book reference
                </Action>
              )}
              <p className="small">
                Marijan Mode records this choice without prerequisites or
                automatic situational effects.
              </p>
            </>
          )}
          {dialog?.type === "species" && species && (
            <>
              <p>{entrySource(catalogue, species)}</p>
              {species.adaptation && (
                <p className="notice">
                  <strong>Legacy</strong> · {species.adaptation}
                </p>
              )}
              <p className="mm-reference-text">
                {species.conversion ||
                  "Printed Species modifiers and resources are available through Species defaults. Skills and Talents are added separately in this unrestricted editor."}
              </p>
              <p className="small">
                Selecting this Species does not grant starting Skills or
                Talents. Automatic capacity uses its implemented carrying rule.
              </p>
            </>
          )}
          {dialog?.type === "defaults" && species && (
            <>
              <p>
                Replace starting Characteristic values with {species.name}{" "}
                modifiers, and set Fate {species.fate}, Fortune{" "}
                {species.fortune}, base Movement {species.movement} and Size{" "}
                {species.mechanics?.size || "Average"}.
              </p>
              <p>
                Advances, Other, manual overrides and all added entries stay as
                entered. Skills and Talents are not granted.
              </p>
              {species.adaptation && (
                <p className="notice">Legacy · {species.adaptation}</p>
              )}
              <Action
                action="apply-defaults"
                className="primary"
                onClick={() => {
                  store.edit((draft) => applySpeciesDefaults(catalogue, draft));
                  closeDialog();
                }}
              >
                Apply defaults
              </Action>
            </>
          )}
          {dialog?.type === "load" && (
            <>
              <Action action="import" onClick={() => chooseFile()}>
                Import JSON file
              </Action>
              {snapshot.saved.length ? (
                snapshot.saved.map((record: any, index: number) => (
                  <div className="mm-saved-row" key={record.draft.id}>
                    <div>
                      <strong>
                        {record.draft.name || "Unnamed character"}
                      </strong>
                      <small> · {record.draft.species}</small>
                    </div>
                    <Action
                      action="load-saved"
                      attributes={{ "data-index": String(index) }}
                      onClick={() => {
                        store.replace(record.draft);
                        closeDialog();
                      }}
                    >
                      Load
                    </Action>
                  </div>
                ))
              ) : (
                <p className="small">
                  No named saves yet. Save character creates a local entry and a
                  JSON backup.
                </p>
              )}
            </>
          )}
          {dialog?.type === "copy" && (
            <>
              <p>
                Copy its current scores and owned entries into Marijan Mode.
                Existing bonuses are included and calculated values become
                manual overrides. Its original save and XP history stay
                untouched.
              </p>
              <div className="mm-modal-actions">
                <Action
                  action="copy-current"
                  className="primary"
                  disabled={!!busy}
                  onClick={() =>
                    void run("Copying…", async (valid) => {
                      const raw = localStorage.getItem(
                        "wfrp-fifth-character-ledger-v2" +
                          (verify ? "-verification" : ""),
                      );
                      if (!raw)
                        throw Error(
                          "No player draft on this device. Choose its JSON file instead.",
                        );
                      await copyPlayer(JSON.parse(raw), valid);
                    })
                  }
                >
                  Copy this device’s player draft
                </Action>
                <Action action="import-player" onClick={() => chooseFile(true)}>
                  Choose player JSON file
                </Action>
              </div>
            </>
          )}
          {dialog?.type === "generate" && (
            <>
              <p>
                Choose Species in Identity first. Generation replaces all values
                and entries, keeping the name and selected Species/Career.
                Review the random result before applying it; Undo restores your
                draft.
              </p>
              <div className="mm-fields">
                <Select
                  label="Origin rules"
                  id="mm-generate-origin"
                  value={generation.origin}
                  options={[
                    ["", "Base Species profile"],
                    ...catalogue.origins
                      .filter((origin: any) => origin.species === s.species)
                      .map((origin: any) => [origin.id, origin.name]),
                  ]}
                  onValue={(value) => changeGeneration({ origin: value })}
                />
                <Select
                  label="Target Career level"
                  id="mm-generate-level"
                  value={generation.target}
                  options={[1, 2, 3, 4]}
                  onValue={(value) =>
                    changeGeneration({ target: Number(value) })
                  }
                />
                <Select
                  label="Starting Career"
                  id="mm-generate-career"
                  value={generation.career}
                  options={[
                    ["", "Choose a Career"],
                    ...generationCareers.map((career: any) => [
                      career.contentId,
                      careerLabel(catalogue, career),
                    ]),
                  ]}
                  onValue={(value) => changeGeneration({ career: value })}
                />
              </div>
              <p className="small">
                Core creation: five Species Skills, native languages, eight
                Career Skill Advances, Species Talents, one Career Talent,
                first-level and Class equipment. Levels 2–4 use the approved
                10/12/14 tracker method with core XP prices. Higher-level
                Trappings are not awarded.
              </p>
              <Action
                action="generate-preview"
                className="primary"
                disabled={!!busy || !generationModule}
                onClick={() =>
                  void run("Generating…", async (valid) => {
                    const module =
                      generationModule ||
                      (await import("../../engine/marijan/generation.mjs"));
                    if (!valid()) return;
                    const next = module.generateCharacter(
                      catalogue,
                      {
                        ...s,
                        career: generation.career,
                        generationOrigin: generation.origin,
                      },
                      generation.target,
                    );
                    if (valid()) setGenerated(next);
                  })
                }
              >
                Preview random character
              </Action>
              <div id="mm-generation-preview">
                {generated && (
                  <div className="notice">
                    <strong>
                      Random result ·{" "}
                      {calculateMarijanResult(generated).career.name}, level{" "}
                      {generated.level}
                    </strong>
                    <p>
                      {generated.xpSpent} XP spent · {generated.tracker} tracker
                      boxes · {generated.entries.skills.length} Skills ·{" "}
                      {generated.entries.talents.length} Talents ·{" "}
                      {generated.entries.gear.length} equipment entries.
                    </p>
                    <p>
                      {Object.entries(calculateMarijanResult(generated).stats)
                        .map(([key, value]) => `${key} ${value}`)
                        .join(" · ")}
                    </p>
                    {generated.generation.notes.map(
                      (note: string, index: number) => (
                        <p className="small" key={index}>
                          {note}
                        </p>
                      ),
                    )}
                    <Action
                      action="generate-apply"
                      className="primary"
                      onClick={() => {
                        store.replace(generated);
                        closeDialog();
                        notify(
                          "Random Fifth Edition character applied. Undo restores the previous draft.",
                        );
                      }}
                    >
                      Use generated character
                    </Action>
                  </div>
                )}
              </div>
            </>
          )}
          {busy && <p role="status">{busy}</p>}
          {failure && (
            <p className="error" role="alert">
              {failure}
            </p>
          )}
        </div>
      </dialog>
      {busy && !dialog && (
        <p className="notice" role="status">
          {busy}
        </p>
      )}
      {failure && !dialog && (
        <p className="error" role="alert">
          {failure}
        </p>
      )}
      <div id="toast" role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );

  function calculateMarijanResult(draft: any) {
    return calculateMarijan(catalogue, draft);
  }
}
