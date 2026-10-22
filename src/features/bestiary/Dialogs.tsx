"use client";
import { useEffect, useRef, useState } from "react";
import { KEYS } from "../../engine/rules.mjs";
import {
  freshGM,
  individualise,
  applyTemplate,
} from "../../engine/gm/model.mjs";
import {
  selectableTemplates,
  templateSummary,
  templateEligibility,
  templateMagicLabel,
} from "../../engine/gm/templates.mjs";
import {
  groupPickerEntries,
  searchPickerEntries,
} from "../../engine/gm/pickers.mjs";
import { traitSummary } from "../../engine/gm/trait-summaries.mjs";
import {
  filterEquipment,
  equipmentFilterOptions,
} from "../../engine/trapping-groups.mjs";
import {
  appearanceSpecies,
  rollGMAppearance,
} from "../../engine/gm/appearance.mjs";
import { loadPDFLibrary } from "../../engine/pdf-runtime.mjs";
import {
  Button,
  Details,
  Field,
  Metadata,
  Modal,
  Rule,
  Select,
  useBestiary,
} from "./controls";
import { StatBlock } from "./Sections";

export function download(bytes: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function TemplatePreview({ template: t }: { template: any }) {
  return (
    <div className="gm-template-preview">
      <Metadata entry={t} />
      <section>
        <h3>Characteristics</h3>
        <dl className="gm-template-adjustments">
          {Object.entries(t.adjustments || {}).map(([key, value]: any) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>
                {value >= 0 ? "+" : ""}
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="gm-small">
          {templateSummary(t)}. Wounds are recalculated after applying the
          template.
        </p>
      </section>
      <div className="gm-template-columns">
        {["skills", "talents"].map((kind) => (
          <section key={kind}>
            <h3>{kind === "skills" ? "Skills" : "Talents"}</h3>
            <ul className="gm-template-grants">
              {t[kind].map((slot: any, i: number) => (
                <li key={i}>
                  <div>
                    {slot.options.length > 3 ? (
                      <Details
                        id={`preview:${t.id}:${kind}:${i}`}
                        title={`${slot.label || slot.options[0]} · ${slot.options.length} options`}
                      >
                        <ul>
                          {slot.options.map((name: string) => (
                            <li key={name}>{name}</li>
                          ))}
                        </ul>
                      </Details>
                    ) : (
                      <span>{slot.options.join(" or ")}</span>
                    )}
                    {(slot.optional || slot.options.length > 1) && (
                      <small className="gm-template-choice">
                        {slot.optional ? "Optional · " : ""}Choose{" "}
                        {slot.count || 1}
                        {slot.count > 1 ? " different" : ""}
                      </small>
                    )}
                  </div>
                  <strong>
                    {kind === "skills"
                      ? slot.printedTotal !== undefined
                        ? slot.printedTotal
                        : `+${slot.bonus}`
                      : `×${slot.ranks}`}
                  </strong>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {t.traits?.length > 0 && (
        <section>
          <h3>Creature Traits</h3>
          <p>
            {t.traits
              .map((x: any) => `${x.name}${x.value ? ` (${x.value})` : ""}`)
              .join(", ")}
          </p>
        </section>
      )}
      {t.removeTraits?.length > 0 && <p>Remove: {t.removeTraits.join(", ")}</p>}
      {t.armour > 0 && (
        <p>
          {t.replaceArmour
            ? "Replaces printed protection"
            : "Additional protection"}
          : {t.armour} AP
        </p>
      )}
      {t.gear?.length > 0 && (
        <section>
          <h3>Trappings</h3>
          <ul>
            {t.gear.map((x: any, i: number) => (
              <li key={i}>
                {x.label}
                {x.optional ? " · optional" : ""}
                {x.choose ? " · explicit choice" : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
      {t.magic && (
        <p>
          Choose up to {t.magic.petty} Petty and {t.magic.lore} Lore spells.
        </p>
      )}
      {t.magicGroups?.length > 0 && (
        <p>
          {t.magicGroups.map(templateMagicLabel).join("; ")} spells; complete
          these exact choices in Equipment & magic.
        </p>
      )}
      <p className="gm-template-footnote">
        Replacing a template clears its previous choices and chosen magic.
        Explicit GM scores, equipment and Traits remain. Undo restores the
        previous build.
      </p>
    </div>
  );
}
function PickerDialog() {
  const {
    modal,
    rules: R,
    result: r,
    draft: s,
    addEntry,
    setModal,
  } = useBestiary();
  const [query, setQuery] = useState(""),
    [equipmentPath, setEquipmentPath] = useState<string[]>([]),
    [group, setGroup] = useState<any>(null),
    [choice, setChoice] = useState("");
  const kind = modal.entryKind,
    grouped = ["skill", "talent"].includes(kind),
    equipment = kind === "equipment",
    completeList = grouped || equipment,
    filtered = equipment
      ? filterEquipment(modal.rows, equipmentPath)
      : modal.rows,
    matches = searchPickerEntries(filtered, query),
    rows = grouped ? groupPickerEntries(matches) : matches;
  const owned = (x: any) =>
    kind === "talent"
      ? r.talents.some((t: any) => t.name === x.name)
      : kind === "skill"
        ? r.skills.some((t: any) => t.name === x.name)
        : kind === "magic"
          ? r.spells.some((t: any) => t.contentId === x.key)
          : kind === "trait"
            ? r.traits.some((t: any) => t.name === x.name)
            : kind === "mutation"
              ? s.mutations.includes(x.key)
              : false;
  const close = () => setModal(null),
    entry = group?.choices.find((x: any) => x.key === choice);
  return (
    <Modal
      title={
        group
          ? `Choose ${group.name}`
          : (
              {
                trait: "Add Creature Trait",
                skill: "Add Skill",
                talent: "Add Talent",
                equipment: "Add equipment",
                magic: "Choose magic",
                mutation: "Choose Corruption",
              } as Record<string, string>
            )[kind]
      }
      close={close}
    >
      {group ? (
        <>
          <Select
            label="Specialisation"
            id="gm-picker-specialisation"
            options={[
              ["", "Choose a specialisation…"],
              ...group.choices.map((x: any) => [x.key, x.name]),
            ]}
            value={choice}
            onChange={setChoice}
          />
          {entry && (
            <>
              <Rule entry={entry} />
              {(owned(entry) || entry.disabled) && (
                <p className="gm-small">
                  {owned(entry)
                    ? "Already added. Edit its existing entry."
                    : entry.disabled}
                </p>
              )}
            </>
          )}
          <div className="gm-dialog-actions">
            <Button
              onClick={() => {
                setGroup(null);
                setChoice("");
              }}
            >
              Back to list
            </Button>
            <Button
              className="primary"
              disabled={!entry || owned(entry) || !!entry.disabled}
              onClick={() => addEntry(kind, entry)}
            >
              Add
            </Button>
          </div>
        </>
      ) : (
        <>
          <Field
            label={`Search ${kind}`}
            id="gm-picker-search"
            type="search"
            value={query}
            onChange={setQuery}
            autoFocus
            placeholder="Name or rule text…"
          />
          {equipment && (
            <div className="gm-equipment-filters">
              {Array.from({ length: equipmentPath.length + 1 }, (_, depth) => {
                const options = equipmentFilterOptions(
                  modal.rows,
                  equipmentPath.slice(0, depth),
                );
                if (!options.length) return null;
                const label =
                  depth === 0
                    ? "Trapping type"
                    : equipmentPath[0] === "Weapons"
                      ? depth === 1
                        ? "Weapon type"
                        : "Weapon group"
                      : "Trapping group";
                return (
                  <Select
                    key={depth}
                    id={`gm-equipment-filter-${depth}`}
                    label={label}
                    value={equipmentPath[depth] || ""}
                    options={[
                      ["", depth === 0 ? "All trappings" : "All groups"],
                      ...options.map((value: string) => [value, value]),
                    ]}
                    onChange={(value) =>
                      setEquipmentPath([
                        ...equipmentPath.slice(0, depth),
                        ...(value ? [value] : []),
                      ])
                    }
                  />
                );
              })}
              {(equipmentPath.length > 0 || query) && (
                <Button
                  onClick={() => {
                    setEquipmentPath([]);
                    setQuery("");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
          <div id="gm-picker-results" className="gm-picker-results">
            <p className="gm-results-count" role="status">
              {rows.length} available entries
            </p>
            {equipment && !rows.length && (
              <p className="gm-small">
                No trappings match these filters. Clear the filters or change
                your search.
              </p>
            )}
            {rows.slice(0, completeList ? rows.length : 60).map((x: any) => (
              <div
                className={`gm-picker-row ${grouped ? "gm-picker-compact" : ""}`}
                key={x.key}
              >
                <div>
                  <strong>{x.name}</strong>
                  {x.choices ? (
                    <small>{x.choices.length} specialisations</small>
                  ) : (
                    <>
                      <Metadata entry={x} />
                      {equipment && <small>{x.trappingPath.join(" · ")}</small>}
                      {!grouped && (
                        <p>
                          {x.damage !== undefined
                            ? `${x.group} · Damage ${x.damage} · ${x.reach} · ${x.qualities || ""}`
                            : x.ap !== undefined
                              ? `${x.ap} AP · ${x.locations}`
                              : equipment
                                ? [
                                    x.price,
                                    x.enc === null
                                      ? "Encumbrance unknown"
                                      : x.enc !== undefined
                                        ? `Enc ${x.enc}`
                                        : "",
                                    x.text?.slice(0, 180),
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")
                                : kind === "trait"
                                  ? traitSummary(x)
                                  : x.text?.slice(0, 180) ||
                                    `${x.advanced ? "Advanced" : "Basic"} Skill · ${x.char || "Core option"}`}
                        </p>
                      )}
                      {x.disabled && <small>{x.disabled}</small>}
                    </>
                  )}
                </div>
                <Button
                  className="primary"
                  data-action={x.choices ? "picker-group" : "picker-add"}
                  data-id={x.key}
                  disabled={!x.choices && (owned(x) || !!x.disabled)}
                  onClick={() => {
                    if (x.choices) {
                      const exact = groupPickerEntries(modal.rows).find(
                        (row: any) => row.key === x.key,
                      );
                      setGroup(exact);
                      setChoice("");
                    } else addEntry(kind, x);
                  }}
                >
                  {x.choices
                    ? "Choose…"
                    : owned(x)
                      ? "Added"
                      : x.disabled
                        ? "Unavailable"
                        : "Add"}
                </Button>
              </div>
            ))}
            {!completeList && rows.length > 60 && (
              <p className="gm-small">
                Type a more specific search to narrow this list.
              </p>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
function PrintDialog() {
  const { store, draft: s, setModal, session, busy: perform } = useBestiary();
  const [entries, setEntries] = useState<any[]>(() => {
      if (!session.printEntries.length)
        session.printEntries = [
          { s: structuredClone(s), r: store.calculate(s) },
        ];
      return session.printEntries;
    }),
    [layout, setLayout] = useState<string>("flexible"),
    [status, setStatus] = useState("Checking card sizes…"),
    [prepared, setPrepared] = useState<any>(null),
    [errors, setErrors] = useState<string[]>([]),
    [revision, setRevision] = useState(0);
  const files = useRef<HTMLInputElement>(null);
  const update = (value: any[]) => {
    session.printEntries = value;
    setEntries(value);
  };
  useEffect(() => {
    let active = true;
    setPrepared(null);
    setStatus("Checking card sizes…");
    if (!entries.length) {
      setStatus("Add a creature or saved draft to begin.");
      return;
    }
    if (entries.some((x) => !x.r.profile || x.r.issues.length)) {
      setStatus(
        "Resolve the choices listed above in the workshop, then add the corrected draft.",
      );
      return;
    }
    void Promise.all([loadPDFLibrary(), import("../../engine/gm/print.mjs")])
      .then(async ([PDFLib, { prepareGMPrint }]) => {
        const result = await (prepareGMPrint as any)(PDFLib, entries, {
          perPage: layout === "flexible" ? layout : Number(layout),
        });
        if (!active) return;
        setPrepared(result);
        setStatus(
          result.overflow.length
            ? `${result.overflow.join(", ")} do not fit this layout at readable text size. Try flexible packing or use the full sheet.`
            : `${entries.length} card${entries.length === 1 ? "" : "s"} · ${result.pages} A4 page${result.pages === 1 ? "" : "s"} · text ${Math.min(...result.cards.map((c: any) => c.fontSize))}–${Math.max(...result.cards.map((c: any) => c.fontSize))} pt · ${layout === "flexible" ? "flexible heights · " : ""}cut along the borders`,
        );
      })
      .catch((error) => {
        if (active) setStatus(error.message);
      });
    return () => {
      active = false;
    };
  }, [entries, layout, revision]);
  const snapshot = (draft: any) => ({
    s: structuredClone(draft),
    r: store.calculate(draft),
  });
  return (
    <Modal
      title="Print table cards"
      className="gm-print-dialog"
      close={() => setModal(null)}
    >
      <p>
        Compact Record grid cards with actual Talent and Trait descriptions.
        Flexible packing uses content-sized heights by default; six or four
        equal cards provide fixed cut lines. Descriptions print in a Desc row
        when present.
      </p>
      <div className="gm-print-toolbar">
        <Select
          label="Cards per A4 page"
          id="gm-print-layout"
          options={[
            ["6", "6 cards · 2 columns × 3 rows"],
            ["4", "4 cards · 2 columns × 2 rows"],
            ["flexible", "Flexible packing · variable card heights"],
          ]}
          value={layout}
          onChange={setLayout}
        />
        <Button
          disabled={entries.length >= 48}
          onClick={() => update([...entries, snapshot(s)])}
        >
          Add current creature
        </Button>
        <Button onClick={() => files.current?.click()}>
          Add saved drafts…
        </Button>
      </div>
      <p className="gm-small">
        Use Copy for duplicates. Saved drafts are read locally and do not
        replace your character. This session’s batch holds up to 48 cards. Later
        short cards may fill earlier gaps, so printed order can differ.
      </p>
      <ol className="gm-print-list">
        {entries.map((entry: any, i: number) => (
          <li key={i}>
            <div>
              <strong>{entry.r.name}</strong>
              <small>
                {entry.r.profile?.name || "No starting profile"} ·{" "}
                {entry.r.size}
              </small>
              {entry.r.issues.length > 0 && (
                <ul className="gm-print-errors">
                  {entry.r.issues.map((x: any, j: number) => (
                    <li key={j}>{x.message}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="gm-print-actions">
              <Button
                disabled={entries.length >= 48}
                onClick={() => {
                  const next = [...entries];
                  next.splice(i + 1, 0, snapshot(entry.s));
                  update(next);
                }}
              >
                Copy
              </Button>
              <Button onClick={() => update(entries.filter((_, j) => i !== j))}>
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ol>
      {errors.length > 0 && (
        <div role="alert" className="gm-print-errors">
          <strong>Drafts not added</strong>
          <ul>
            {errors.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      <div id="gm-print-status" role="status">
        {status}
      </div>
      <div className="gm-dialog-actions">
        <Button onClick={() => setRevision((value) => value + 1)}>
          Check again
        </Button>
        <Button onClick={() => setModal(null)}>Back to workshop</Button>
        <Button
          className="primary"
          disabled={!prepared || prepared.overflow.length > 0}
          onClick={() =>
            perform("Preparing…", async () =>
              download(
                await prepared.bytes(),
                layout === "flexible"
                  ? "Bestiary-flexible-A4.pdf"
                  : `Bestiary-${layout}-per-A4.pdf`,
                "application/pdf",
              ),
            )
          }
        >
          Download A4 PDF
        </Button>
      </div>
      <input
        ref={files}
        id="gm-print-files"
        type="file"
        multiple
        accept=".json,application/json"
        hidden
        onChange={async (e) => {
          const selected = Array.from(e.target.files || []);
          e.target.value = "";
          const next = [...entries],
            failures: string[] = [];
          for (const file of selected)
            try {
              if (next.length >= 48)
                throw Error("The print batch already has 48 cards.");
              if (file.size > 2000000) throw Error("This draft is too large.");
              next.push(
                snapshot(store.validate(JSON.parse(await file.text()))),
              );
            } catch (error) {
              failures.push(
                `${file.name}: ${error instanceof Error ? error.message : error}`,
              );
            }
          setErrors(failures);
          update(next);
        }}
      />
    </Modal>
  );
}
export function BestiaryDialogs() {
  const {
    modal,
    setModal,
    data,
    rules: R,
    draft: s,
    result: r,
    store,
    edit,
    setUI,
  } = useBestiary();
  const [templateBook, setTemplateBook] = useState(""),
    [appearance, setAppearance] = useState("");
  if (!modal) return null;
  const close = () => setModal(null),
    kind = modal.kind;
  if (kind === "picker")
    return <PickerDialog key={`${kind}:${modal.entryKind}`} />;
  if (kind === "print") return <PrintDialog />;
  if (kind === "profile") {
    const draft = freshGM(data, modal.entry.id, s.books),
      result = store.calculate(draft);
    return (
      <Modal title={modal.entry.name} close={close}>
        <StatBlock result={result} draft={draft} />
        {result.warnings.length > 0 && (
          <div className="gm-callout">
            <strong>Source notes</strong>
            <ul>
              {result.warnings.map((x: string, i: number) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        )}
        {s.profile && s.profile !== modal.entry.id && (
          <p className="gm-small">
            Applying a new foundation replaces this NPC’s customisation. Undo
            restores this draft.
          </p>
        )}
        <div className="gm-dialog-actions">
          <Button onClick={close}>Cancel</Button>
          <Button
            className="primary"
            onClick={() => {
              store.replace(draft);
              setUI({ browse: false });
              close();
            }}
          >
            Use this profile
          </Button>
        </div>
      </Modal>
    );
  }
  if (kind === "templates") {
    const templates = selectableTemplates(
        data.templates.filter((x: any) =>
          s.books.includes(x.source?.book || "core"),
        ),
        r.profile,
      ),
      rows = templates.filter(
        (t: any) =>
          !templateBook || (t.source?.book || "core") === templateBook,
      );
    return (
      <Modal title="Choose a creature template" close={close}>
        <p className="gm-small">
          Showing compatible templates from enabled books. Preview their changes
          and required choices.
        </p>
        <Select
          label="Book"
          id="gm-template-book"
          value={templateBook}
          options={[
            ["", "All enabled books"],
            ...data.books
              .filter((b: any) =>
                templates.some((t: any) => (t.source?.book || "core") === b.id),
              )
              .map((b: any) => [b.id, b.shortTitle || b.title]),
          ]}
          onChange={setTemplateBook}
        />
        <div id="gm-template-results">
          {rows.map((t: any) => (
            <div className="gm-picker-row" key={t.id}>
              <div>
                <strong>{t.name}</strong>
                <p>{templateSummary(t)}</p>
                <Metadata entry={t} />
              </div>
              <Button onClick={() => setModal({ kind: "template", entry: t })}>
                Preview
              </Button>
            </div>
          ))}
          {!rows.length && (
            <p className="gm-empty">
              No templates are available for this foundation in the selected
              books.
            </p>
          )}
        </div>
      </Modal>
    );
  }
  if (kind === "template") {
    const t = modal.entry,
      reason = templateEligibility(t, r.profile);
    return (
      <Modal title={t.name} close={close}>
        <TemplatePreview template={t} />
        {reason && <p className="gm-callout">{reason}</p>}
        <div className="gm-dialog-actions">
          <Button onClick={() => setModal({ kind: "templates" })}>
            Back to templates
          </Button>
          <Button
            className="primary"
            disabled={!!reason}
            onClick={() => {
              if (
                !s.books.includes(t.source?.book || "core") ||
                templateEligibility(t, r.profile)
              )
                return;
              edit((d: any) => applyTemplate(d, t.id));
              close();
            }}
          >
            Apply template
          </Button>
        </div>
      </Modal>
    );
  }
  if (kind === "appearance")
    return (
      <Modal title="Choose appearance tables" close={close}>
        <Select
          label="Appearance Species"
          id="gm-appearance-species"
          options={[
            ["", "Choose a Species…"],
            ...appearanceSpecies(R, r.profile),
          ]}
          value={appearance}
          onChange={setAppearance}
        />
        <p className="gm-small">
          Choose a supported Species explicitly. This changes only the short
          description.
        </p>
        <Button
          className="primary"
          disabled={!appearanceSpecies(R, r.profile).includes(appearance)}
          onClick={() => {
            edit((d: any) => rollGMAppearance(R, d, r.profile, appearance));
            close();
          }}
        >
          Roll appearance
        </Button>
      </Modal>
    );
  if (kind === "roll-all")
    return (
      <Modal title="Roll individual variation?" close={close}>
        <p>
          Roll 2d10 for each available Characteristic and replace its starting
          score with printed score −10 plus the roll (p. 318). Movement is
          unchanged. Template and Size effects are added afterwards.
        </p>
        <div className="gm-dialog-actions">
          <Button onClick={close}>Cancel</Button>
          <Button
            className="primary"
            onClick={() => {
              edit((d: any) => {
                for (const k of KEYS)
                  if (r.profile.stats[k] !== null)
                    individualise(d, r.profile, k);
              });
              close();
            }}
          >
            Roll all Characteristics
          </Button>
        </div>
      </Modal>
    );
  if (kind === "restore")
    return (
      <Modal title="Restore removed entries" close={close}>
        {s.removed.map((key: string) => (
          <div className="gm-picker-row" key={key}>
            <strong>
              {[
                ...(r.profile?.traits || []),
                ...(r.profile?.skills || []),
                ...(r.profile?.talents || []),
                ...(r.profile?.attacks || []),
                ...(r.profile?.armour || []),
                ...R.spells,
              ].find((x: any) => (x.key || x.contentId) === key)?.name || key}
            </strong>
            <Button
              onClick={() => {
                edit((d: any) => {
                  d.removed = d.removed.filter((id: string) => id !== key);
                });
                close();
              }}
            >
              Restore
            </Button>
          </div>
        ))}
      </Modal>
    );
  if (kind === "new" || kind === "remove-book" || kind === "load")
    return (
      <Modal
        title={
          kind === "new"
            ? "Start a new NPC or creature?"
            : kind === "load"
              ? "Load this GM draft?"
              : `Remove ${modal.book.shortTitle || modal.book.title}?`
        }
        close={close}
      >
        <p>
          {kind === "new"
            ? "Start a fresh draft. Save first if needed; Undo can restore this creature."
            : kind === "load"
              ? `Replace this draft with ${modal.draft.name || "the imported creature"}? Saved dice are imported records, not independently verified randomness.`
              : `This starting profile requires ${modal.book.title}. Removing the book starts a fresh GM draft. Undo restores it.`}
        </p>
        <div className="gm-dialog-actions">
          <Button onClick={close}>
            {kind === "remove-book" ? "Keep book" : "Cancel"}
          </Button>
          <Button
            className="primary"
            onClick={() => {
              store.replace(kind === "load" ? modal.draft : freshGM(data));
              setUI({
                query: "",
                category: "",
                profileBook: "",
                browse: false,
              });
              close();
            }}
          >
            {kind === "new"
              ? "Start new"
              : kind === "load"
                ? "Load draft"
                : "Remove book & start new"}
          </Button>
        </div>
      </Modal>
    );
  return (
    <Modal title={modal.title || "Workshop"} close={close}>
      <p>{modal.message}</p>
    </Modal>
  );
}
