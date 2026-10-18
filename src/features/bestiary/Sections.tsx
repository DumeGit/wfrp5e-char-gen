"use client";
import { KEYS, base, talentInfo } from "../../engine/rules.mjs";
import {
  SIZES,
  TRAINING,
  BREATH,
  VENOM_DIFFICULTIES,
  PARAMETER,
  individualise,
  applyTemplate,
  gmRoll,
  gmCastableLores,
  gmLoreIssue,
  gmTalentLimit,
  rowName,
  armourLabel,
  magicChoices,
} from "../../engine/gm/model.mjs";
import {
  templateSlotEnabled,
  templateGearEnabled,
  templateSummary,
  templateMagicLabel,
} from "../../engine/gm/templates.mjs";
import { sacredMarks, LORE_WINDS } from "../../engine/gm/lustria.mjs";
import { trollModifiers } from "../../engine/gm/tribes.mjs";
import { appearanceSpecies } from "../../engine/gm/appearance.mjs";
import { gmCantBook } from "../../engine/gm/cants.mjs";
import { sourceLabel } from "../../engine/sources.mjs";
import { requestReference } from "../../services/content";
import {
  Check,
  Input,
  Button,
  DiceIcon,
  Details,
  Field,
  Metadata,
  Legacy,
  Remove,
  Rule,
  SectionHeading,
  Select,
  numberValue,
  useBestiary,
} from "./controls";
export const STEPS = [
  "Starting profile",
  "Customise",
  "Equipment & magic",
  "Review & export",
];
export const TABS = ["Characteristics", "Traits", "Skills & Talents"];
const label = (R: any, entry: any) => sourceLabel(R, entry);
export function StatBlock({
  result: given,
  draft: givenDraft,
  compact = false,
}: {
  result?: any;
  draft?: any;
  compact?: boolean;
}) {
  const context = useBestiary(),
    r = given || context.result,
    s = givenDraft || context.draft;
  if (!r.profile)
    return (
      <div className="gm-stat-empty">
        <span className="eyebrow">Your stat block</span>
        <h2>A place in the Old World</h2>
        <p>
          Choose a starting profile to see its Characteristics, attacks and
          abilities here.
        </p>
      </div>
    );
  const section = (key: string, title: string, children: React.ReactNode) =>
    compact ? (
      <Details
        key={key}
        id={`folio:${key}`}
        title={title}
        initial={key === "attacks"}
      >
        {children}
      </Details>
    ) : (
      <section key={key} className="gm-stat-section">
        <h3>{title}</h3>
        {children}
      </section>
    );
  return (
    <article className={`gm-stat-block ${compact ? "gm-stat-compact" : ""}`}>
      <header>
        <span className="eyebrow">{r.profile.category}</span>
        <h2 className="gm-stat-name">{r.name}</h2>
        <p>
          {[r.profile.name, r.template?.name, r.size]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {s.description && !compact && <p>{s.description}</p>}
        <Metadata entry={r.profile} />
      </header>
      <div className="gm-stat-grid">
        {["M", ...KEYS].map((k) => (
          <div key={k}>
            <span>{k}</span>
            <strong>{r.stats[k] ?? "—"}</strong>
          </div>
        ))}
      </div>
      <div className="gm-derived">
        <div>
          <span>Wounds</span>
          <strong>{r.wounds ?? "—"}</strong>
        </div>
        <div>
          <span>TB</span>
          <strong>{r.tb ?? "—"}</strong>
        </div>
        <div>
          <span>Size{r.swarm ? " (ignored)" : ""}</span>
          <strong>{r.size}</strong>
        </div>
      </div>
      {s.description &&
        compact &&
        section("description", "Description", <p>{s.description}</p>)}
      {section(
        "attacks",
        "Attacks",
        <div className="gm-stat-attacks">
          {r.attacks.map((a: any) => (
            <div key={a.key}>
              <strong>{a.name}</strong>
              <span>
                {a.skill ?? "—"} / {a.damage === null ? "—" : `+${a.damage}`}
              </span>
              {a.text && <small>{a.text}</small>}
            </div>
          ))}
        </div>,
      )}
      {section(
        "defence",
        "Defence",
        <>
          <p className="gm-ap-line">
            {Object.entries(r.ap)
              .map(([k, v]) => `${k} ${v}`)
              .join(" · ")}
            {r.shield ? (
              <>
                <br />
                Shield +{r.shield} AP when applicable
              </>
            ) : null}
          </p>
          <p className="gm-small">{r.armour.map(armourLabel).join(", ")}</p>
        </>,
      )}
      {!!r.skills.length &&
        section(
          "skills",
          `Skills · ${r.skills.length}`,
          <div className="gm-mini-list">
            {r.skills.map((x: any) => (
              <div key={x.key || x.name}>
                <span>{x.name}</span>
                <b>{x.total}</b>
              </div>
            ))}
          </div>,
        )}
      {!!r.talents.length &&
        section(
          "talents",
          `Talents · ${r.talents.length}`,
          <p>
            {r.talents
              .map((x: any) => `${x.name}${x.ranks > 1 ? ` ×${x.ranks}` : ""}`)
              .join(", ")}
          </p>,
        )}
      {!!r.traits.length &&
        section(
          "traits",
          `Traits · ${r.traits.length}`,
          r.traits.map((t: any) => (
            <p key={t.key}>
              <strong>{rowName(t)}:</strong> {t.description || t.summary}
            </p>
          )),
        )}
      {!!r.spells.length &&
        section(
          "magic",
          `Magic · ${r.spells.length}`,
          <p>
            {r.spells
              .map(
                (x: any) =>
                  `${x.name}${x.category === "Arcane" && x.lore ? ` (${x.lore})` : ""}`,
              )
              .join(", ")}
          </p>,
        )}
      {!!r.runes?.length &&
        section(
          "runes",
          "Rune knowledge",
          <p>{r.runes.map((x: any) => `${x.name} (${x.form})`).join(", ")}</p>,
        )}
      {!!r.cants?.length &&
        section(
          "cants",
          "Cants",
          r.cants.map((x: any) => (
            <p key={x.id}>
              <strong>
                {x.name} ({x.lore})
              </strong>
              {!compact && `: ${x.text}`}
            </p>
          )),
        )}
      {(r.gear.length > 0 || (r.trappings ?? r.profile.sections.Trappings)) &&
        section(
          "gear",
          "Trappings",
          <>
            <p>{r.trappings ?? r.profile.sections.Trappings}</p>
            <div className="gm-mini-list">
              {r.gear.map((x: any) => (
                <div key={x.key}>
                  <span>{x.entry.name}</span>
                  <b>×{x.quantity}</b>
                </div>
              ))}
            </div>
          </>,
        )}
      {!!r.mutations.length &&
        section(
          "mutations",
          "Corruption",
          <p>{r.mutations.map((x: any) => x.name).join(", ")}</p>,
        )}
      {!compact &&
        s.includeNotes &&
        s.notes &&
        section("notes", "GM notes", <p className="gm-prewrap">{s.notes}</p>)}
    </article>
  );
}
export function Starting() {
  const {
    data,
    rules: R,
    draft: s,
    result: r,
    ui,
    setUI,
    edit,
    setModal,
    rollAppearance,
  } = useBestiary();
  const selected = data.profiles.filter((p: any) =>
    s.books.includes(p.source?.book || p.id.split(":")[0]),
  );
  const rows = selected
    .filter(
      (p: any) =>
        (!ui.category || p.category === ui.category) &&
        (!ui.profileBook || (p.source?.book || "core") === ui.profileBook) &&
        (!ui.query.trim() ||
          `${p.name} ${p.category}`
            .toLowerCase()
            .includes(ui.query.toLowerCase().trim())),
    )
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
  const bind = (key: string, value: string) =>
    edit((d: any) => {
      d[key] = value;
    }, `field:${key}`);
  return (
    <>
      <p className="lede">
        Start with a complete printed profile. Keep it as written or make it
        your own.
      </p>
      {r.profile && (
        <>
          <div className="gm-foundation">
            <div>
              <span className="eyebrow">Starting profile</span>
              <strong>{r.profile.name}</strong>
              <Metadata entry={r.profile} />
            </div>
            <Button onClick={() => setUI({ browse: !ui.browse })}>
              {ui.browse ? "Close library" : "Browse profiles"}
            </Button>
          </div>
          <div className="gm-fields">
            <Field
              label="Name"
              id="gm-name"
              value={s.name}
              placeholder={r.profile.name}
              onChange={(value) => bind("name", value)}
            />
            <div className="field gm-appearance-field">
              <label htmlFor="gm-description">Short description</label>
              <div className="gm-description-controls">
                <Input
                  id="gm-description"
                  value={s.description}
                  onChange={(e) => bind("description", e.target.value)}
                  aria-describedby="gm-appearance-help"
                />
                <Button
                  aria-label="Roll appearance"
                  title="Roll appearance; replaces the description"
                  disabled={!appearanceSpecies(R, r.profile).length}
                  onClick={rollAppearance}
                >
                  <DiceIcon />
                </Button>
              </div>
              <small id="gm-appearance-help" className="gm-small">
                {appearanceSpecies(R, r.profile).length
                  ? "Roll height, eyes and hair from PC tables. Weight, sex, beard and distinguishing features: enter manually."
                  : "No matching PC appearance tables for this profile. Enter appearance details manually."}
              </small>
            </div>
          </div>
          <Details id="gm:personality" title="Personality & purpose · Optional">
            <p className="gm-small">
              Give the NPC a purpose, motivation and manner. No mechanical
              bonuses.
            </p>
            <div className="gm-fields">
              {["purpose", "motivation", "manner"].map((key) => (
                <Field
                  key={key}
                  label={
                    key === "purpose"
                      ? "Purpose / role"
                      : key === "motivation"
                        ? "Motivation"
                        : "Manner"
                  }
                  id={`gm-${key}`}
                  value={s[key]}
                  onChange={(value) => bind(key, value)}
                />
              ))}
            </div>
          </Details>
        </>
      )}
      <Details
        id="gm:profile-books"
        className="gm-book-picker"
        title={
          <>
            Profile & template books{" "}
            <small>
              Core
              {s.books.length > 1
                ? ` + ${s.books.length - 1} supplements`
                : " only"}
            </small>
          </>
        }
      >
        <fieldset className="gm-books">
          <legend>Profile & template books</legend>
          <span className="gm-small">Fifth Edition core · always included</span>
          {data.books
            .filter((b: any) => b.id !== "core")
            .map((b: any) => (
              <Check
                key={b.id}
                id={`gm-book-${b.id}`}
                data-book={b.id}
                checked={s.books.includes(b.id)}
                onChange={(enabled) => {
                  if (!enabled && r.profile?.source?.book === b.id) {
                    setModal({ kind: "remove-book", book: b });
                    return;
                  }
                  edit((d: any) => {
                    d.books = enabled
                      ? [...d.books, b.id]
                      : d.books.filter((id: string) => id !== b.id);
                    if (
                      !enabled &&
                      data.templates.some(
                        (t: any) =>
                          t.id === d.template && t.source?.book === b.id,
                      )
                    )
                      applyTemplate(d, "");
                  });
                }}
              >
                {b.title}
                <small>
                  {
                    data.profiles.filter(
                      (p: any) => (p.source?.book || "core") === b.id,
                    ).length
                  }{" "}
                  profiles ·{" "}
                  {
                    data.templates.filter(
                      (t: any) => (t.source?.book || "core") === b.id,
                    ).length
                  }{" "}
                  templates
                </small>
              </Check>
            ))}
          <p className="gm-small">
            All integrated books’ Skills, Talents, equipment and magic are
            always available. These selections only change starting profiles and
            templates.
          </p>
        </fieldset>
      </Details>
      {(!r.profile || ui.browse) && (
        <div className="gm-library">
          <div className="gm-browser-filters">
            <Field
              label="Find a profile"
              id="gm-profile-search"
              type="text"
              inputMode="search"
              value={ui.query}
              onChange={(query) => setUI({ query })}
              placeholder="Human, Goblin, Dragon…"
            />
            <Select
              label="Category"
              id="gm-category"
              value={ui.category}
              options={[
                ["", "All categories"],
                ...new Set(selected.map((p: any) => p.category)),
              ]}
              onChange={(category) => setUI({ category })}
            />
            <Select
              label="Book"
              id="gm-profile-book"
              value={ui.profileBook}
              options={[
                ["", "All enabled books"],
                ...data.books
                  .filter((b: any) => s.books.includes(b.id))
                  .map((b: any) => [b.id, b.shortTitle || b.title]),
              ]}
              onChange={(profileBook) => setUI({ profileBook })}
            />
          </div>
          <div id="gm-profile-results">
            <p className="gm-results-count" role="status">
              {rows.length} printed profiles
            </p>
            <div className="gm-profile-grid">
              {rows.map((p: any) => (
                <Button
                  type="button"
                  className="gm-profile-card"
                  key={p.id}
                  onClick={() => setModal({ kind: "profile", entry: p })}
                >
                  <span className="gm-card-category">
                    {p.category}
                    {p.example ? " · Worked example" : ""}
                  </span>
                  <strong>{p.name}</strong>
                  <span className="gm-card-stats">
                    <b>{p.size}</b>
                    <span>
                      M {p.stats.M} · WS {p.stats.WS} · W {p.stats.W}
                    </span>
                  </span>
                  <small>
                    {label(R, p)}{" "}
                    {p.adaptation && <span className="legacy-tag">Legacy</span>}
                    <span>Preview →</span>
                  </small>
                </Button>
              ))}
            </div>
            {!rows.length && (
              <p className="gm-empty">
                No matching profiles. Try another name, category or book.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
function ProfileChoices() {
  const { data, draft: s, result: r, edit } = useBestiary(),
    p = r.profile,
    marks = sacredMarks(data, p);
  const toggle = (key: string, value: string, enabled: boolean) =>
    edit((d: any) => {
      d[key] = enabled
        ? [...d[key], value]
        : d[key].filter((x: string) => x !== value);
      if (key === "lustriaMarks") {
        d.templateSkills = {};
        d.templateTalents = {};
        const prefix = d.template || "lustria:marks";
        d.removed = d.removed.filter(
          (x: string) => !x.startsWith(prefix + ":"),
        );
      }
    });
  return (
    <>
      {p.lustriaMagic === "slann" && (
        <fieldset className="gm-training" id="gm-profile-lores">
          <legend>Slann Colour Lores · choose explicitly</legend>
          {Object.entries(LORE_WINDS).map(([lore, wind]) => (
            <Check
              key={lore}
              data-profile-lore={lore}
              checked={s.profileLores.includes(lore)}
              onChange={(v) => toggle("profileLores", lore, v)}
            >
              {lore}
              <small>
                Channelling ({wind}) {p.channellingTotal}
              </small>
            </Check>
          ))}
          <p className="gm-small">
            Printed Channelling {p.channellingTotal}. Choose spells in Equipment
            & magic. Slann retain High Magic without Blessed by Isha.
          </p>
        </fieldset>
      )}
      {!!p.skillSlots?.length && (
        <section className="gm-template-choices">
          <h2>{p.name} Skill choices</h2>
          <div className="gm-fields">
            {p.skillSlots.map((slot: any, i: number) => (
              <Select
                key={i}
                label={`${slot.label || base(slot.options[0])} · +${slot.bonus}`}
                id={`profile-skill-${i}`}
                options={[["", "Choose…"], ...slot.options]}
                value={s.profileSkills[i] || ""}
                onChange={(value) =>
                  edit((d: any) => {
                    if (value) d.profileSkills[i] = value;
                    else delete d.profileSkills[i];
                  })
                }
              />
            ))}
          </div>
        </section>
      )}
      {!!marks.length && (
        <Details
          id="lustria-marks"
          title="Sacred marks · optional, combine as needed"
        >
          <fieldset className="gm-training" id="gm-sacred-marks">
            <legend>Marks of the Old Ones · Lustria p. 151</legend>
            {marks.map((mark: any) => (
              <Check
                key={mark.id}
                data-sacred-mark={mark.id}
                checked={s.lustriaMarks.includes(mark.id)}
                onChange={(v) => toggle("lustriaMarks", mark.id, v)}
              >
                {mark.name}
                <small>
                  {templateSummary(mark)}
                  {mark.naturalArmour ? " · Natural armour +1 AP" : ""}
                </small>
              </Check>
            ))}
          </fieldset>
          <p className="gm-small">
            Marks stack with a Skink caste. Repeated nonrepeatable Talents count
            once. Undefined Leader is unavailable.
          </p>
        </Details>
      )}
      {(p.unavailableTraits || []).map((entry: any, i: number) => (
        <div className="gm-entry" id={`gm-unavailable-${i}`} key={i}>
          <div>
            <strong>{entry.name} · unavailable</strong>
            <p className="gm-small">
              {entry.reason}
              {entry.optional
                ? " Optional suggestion, not granted."
                : s.removed.includes(`unavailable:${i}`)
                  ? " Removed from this build."
                  : " Resolve before export by removing this entry."}
            </p>
          </div>
          {!entry.optional && !s.removed.includes(`unavailable:${i}`) && (
            <Remove entryKey={`unavailable:${i}`} />
          )}
        </div>
      ))}
    </>
  );
}
function TemplateChoices() {
  const { data, draft: s, result: r, edit } = useBestiary(),
    t = r.template;
  if (!t) return null;
  let lores: any[] = t.lustriaPriest
    ? ["Beasts", "Heavens"]
    : t.warbandShaman && t.loreChoices.length > 1
      ? [
          ...t.loreChoices,
          ...(r.profile.id.endsWith(":basic-hobgoblin") &&
          t.name === "Shaman Lord"
            ? [["Both", "Both · one Lore limited to two spells"]]
            : []),
        ]
      : t.shaman && r.profile.category === "Beastmen"
        ? [
            ["Arcane", "Arcane only"],
            ["Beasts", "Arcane + Beasts"],
            ["Death", "Arcane + Death"],
            ["Shadows", "Arcane + Shadows"],
          ]
        : [];
  return (
    <section className="gm-template-choices">
      <h2>{t.name} choices</h2>
      {t.removeArmour && (
        <p className="gm-small">
          This template removes the foundation’s printed armour. Add armour
          explicitly only when using an applicable GM exception.
        </p>
      )}
      <div className="gm-fields">
        {!!lores.length && (
          <Select
            label={t.lustriaPriest ? "Priest Lore" : "Shaman Lore"}
            id="template-lore"
            options={[["", "Choose…"], ...lores]}
            value={
              s.templateLore ||
              (t.shaman && r.profile.category === "Beastmen" ? "Arcane" : "")
            }
            onChange={(value) =>
              edit((d: any) => {
                d.templateLore = value;
                d.templateSkills = {};
                d.templateTalents = {};
              })
            }
          />
        )}
        {t.skills.flatMap((slot: any, i: number) =>
          templateSlotEnabled(slot, r.profile) &&
          (slot.options.length > 1 || slot.optional)
            ? Array.from({ length: slot.count }, (_, j) => (
                <Select
                  key={`skill:${i}:${j}`}
                  label={`${slot.label || base(slot.options[0])}${slot.count > 1 ? ` ${j + 1} of ${slot.count}` : ""} · ${slot.printedTotal !== undefined ? slot.printedTotal : `+${slot.bonus}`}`}
                  id={`template-skill-${i}${j ? `-${j}` : ""}`}
                  data-template-skill={i}
                  data-choice={j}
                  options={[
                    [
                      "",
                      slot.optional
                        ? slot.emptyLabel || "Skip optional Skill"
                        : "Choose…",
                    ],
                    ...slot.options,
                  ]}
                  value={s.templateSkills[i]?.[j] || ""}
                  onChange={(value) =>
                    edit((d: any) => {
                      const choices = d.templateSkills[i] || [];
                      choices[j] = value;
                      d.templateSkills[i] = Array.from(
                        choices,
                        (x: any) => x || "",
                      );
                      if (!value && slot.optional) delete d.templateSkills[i];
                    })
                  }
                />
              ))
            : [],
        )}
        {t.talents.map((slot: any, i: number) =>
          templateSlotEnabled(slot, r.profile) &&
          (slot.options.length > 1 || slot.optional) ? (
            <Select
              key={`talent:${i}`}
              label={
                slot.label ||
                (slot.optional
                  ? `Optional · ${slot.options[0]}`
                  : slot.options.length > 2
                    ? "Magical Lore"
                    : "Casting Talent")
              }
              id={`template-talent-${i}`}
              data-template-talent={i}
              options={[
                ["", slot.optional ? "Skip optional Talent" : "Choose…"],
                ...slot.options,
              ]}
              value={s.templateTalents[i] || ""}
              onChange={(value) =>
                edit((d: any) => {
                  if (value) d.templateTalents[i] = value;
                  else delete d.templateTalents[i];
                })
              }
            />
          ) : null,
        )}
        {(t.gear || []).map((slot: any, i: number) =>
          templateGearEnabled(
            slot,
            s.templateSkills,
            s.templateGear,
            t,
            r.profile,
          ) &&
          (slot.choose || slot.options.length > 1 || slot.optional) ? (
            <Select
              key={`gear:${i}`}
              label={slot.label}
              id={`template-gear-${i}`}
              data-template-gear={i}
              value={s.templateGear[i] || ""}
              options={[
                ["", slot.optional ? "Skip optional equipment" : "Choose…"],
                ...slot.options.map((x: any) => [
                  x.id,
                  slot.options.filter((y: any) => y.name === x.name).length > 1
                    ? `${x.name} · ${x.kind || "weapon"} (${x.group})`
                    : x.name,
                ]),
              ]}
              onChange={(value) =>
                edit((d: any) => {
                  if (value) d.templateGear[i] = value;
                  else delete d.templateGear[i];
                })
              }
            />
          ) : null,
        )}
      </div>
      {t.trollRole === "type" && (
        <fieldset className="gm-training" id="gm-troll-modifiers">
          <legend>Troll modifiers · combine as needed</legend>
          {trollModifiers(data).map((x: any) => (
            <Check
              key={x.id}
              data-troll-modifier={x.id}
              checked={s.templateModifiers.includes(x.id)}
              disabled={
                !!x.requiresTemplate &&
                x.requiresTemplate !== t.id &&
                !s.templateModifiers.includes(x.id)
              }
              onChange={(v) =>
                edit((d: any) => {
                  for (const key of Object.keys(d.attackOverrides))
                    if (key.startsWith(d.template + ":"))
                      delete d.attackOverrides[key];
                  d.templateModifiers = v
                    ? [...d.templateModifiers, x.id]
                    : d.templateModifiers.filter((id: string) => id !== x.id);
                  d.templateSkills = {};
                  d.templateTalents = {};
                  d.removed = d.removed.filter(
                    (key: string) => !key.startsWith(d.template + ":"),
                  );
                })
              }
            >
              {x.name}
              <small>
                {templateSummary(x)}
                {x.requiresTemplate ? " · River Troll only" : ""}
              </small>
            </Check>
          ))}
        </fieldset>
      )}
    </section>
  );
}
function Characteristics() {
  const { draft: s, result: r, edit, setModal } = useBestiary();
  return (
    <>
      <SectionHeading
        action={() => setModal({ kind: "roll-all" })}
        label="Roll individual variation"
      >
        Characteristics
      </SectionHeading>
      <p className="gm-small">
        Edit the starting score; template, Talent and Size changes are added
        once. Individual variation uses printed score −10 + 2d10 (p. 318).
      </p>
      <div className="gm-characteristics">
        {["M", ...KEYS].map((k) => (
          <div className="gm-char-row" key={k}>
            <label htmlFor={`stat-${k}`}>
              <b>{k}</b>
              <small>Printed {r.profile.stats[k] ?? "—"}</small>
            </label>
            <Input
              id={`stat-${k}`}
              aria-label={`${k} starting score`}
              type="number"
              min="0"
              step="1"
              value={
                Object.hasOwn(s.stats, k)
                  ? (s.stats[k] ?? "")
                  : (r.profile.stats[k] ?? "")
              }
              onChange={(e) =>
                edit((d: any) => {
                  d.stats[k] = numberValue(e.target.value);
                }, `stat:${k}`)
              }
            />
            <span className="gm-char-final">
              → <b>{r.stats[k] ?? "—"}</b>
            </span>
            {k !== "M" && r.profile.stats[k] !== null && (
              <Button
                aria-label={`Roll individual variation for ${k}`}
                onClick={() => edit((d: any) => individualise(d, r.profile, k))}
              >
                <DiceIcon />
              </Button>
            )}
            {Object.hasOwn(s.stats, k) && (
              <Button
                aria-label={`Restore printed ${k}`}
                onClick={() =>
                  edit((d: any) => {
                    delete d.stats[k];
                  })
                }
              >
                ↶
              </Button>
            )}
          </div>
        ))}
      </div>
      <h2>Size & derived values</h2>
      <div className="gm-fields">
        <Select
          label="Size"
          id="gm-size"
          options={SIZES}
          value={s.size || r.size}
          disabled={r.swarm}
          onChange={(v) =>
            edit((d: any) => {
              d.size = v;
            })
          }
        />
        <Field
          label="Wounds override"
          id="gm-wounds"
          type="number"
          min="0"
          value={s.wounds ?? ""}
          placeholder="Calculated / printed"
          onChange={(v) =>
            edit((d: any) => {
              d.wounds = numberValue(v);
            }, "wounds")
          }
        />
        <Select
          label="Toughness Bonus"
          id="gm-tb-mode"
          options={[
            ["", "Printed until changed"],
            ["printed", "Keep printed bonus"],
            ["calculated", "Calculate from Toughness"],
            ["manual", "Set manually"],
          ]}
          value={s.tbMode}
          onChange={(v) =>
            edit((d: any) => {
              d.tbMode = v;
            })
          }
        />
        {s.tbMode === "manual" && (
          <Field
            label="Manual Toughness Bonus"
            id="gm-tb"
            type="number"
            min="0"
            value={s.tb ?? ""}
            onChange={(v) =>
              edit((d: any) => {
                d.tb = numberValue(v);
              }, "tb")
            }
          />
        )}
      </div>
      <Check
        checked={s.recalculate}
        onChange={(v) =>
          edit((d: any) => {
            d.recalculate = v;
          })
        }
      >
        Recalculate derived values from this build
      </Check>
      <Details id="gm:calculations" title="How totals are calculated">
        <p>
          Printed scores are the baseline. Template and Size changes, explicit
          Talent benefits and selected Corruption effects are added once.
          Printed Skills retain their difference from the associated
          Characteristic; a template uses the higher Skill bonus. GM Skill
          totals override that result.
        </p>
        <p>
          Untouched profiles retain printed Wounds, attacks and Toughness Bonus.
          Changed profiles use the core Size formula (pp. 360–361). Tiny
          requires manual Wounds. Situational effects remain references for
          play.
        </p>
      </Details>
      {s.rolls.length > 0 && (
        <Details id="gm:rolls" title={`Recorded dice · ${s.rolls.length}`}>
          <ol className="gm-roll-list">
            {s.rolls.map((x: any, i: number) => (
              <li key={i}>
                <strong>{x.label}</strong> {x.faces.join(" + ")} = {x.total}
                <small>
                  {x.at} · {x.source?.book || "Core"} p.{" "}
                  {x.source?.page || x.page}
                </small>
              </li>
            ))}
          </ol>
        </Details>
      )}
    </>
  );
}
export function TraitParameter({ trait: t }: { trait: any }) {
  const { data, rules: R, draft: s, result: r, edit } = useBestiary();
  const parameter =
    (PARAMETER as Record<string, string>)[t.name] ??
    data.traits.find((x: any) => x.name === t.name)?.parameter;
  if (t.name === "Size")
    return <span className="gm-small">Change Size in Characteristics.</span>;
  if (!parameter) return null;
  const change = (value: string) =>
    edit((d: any) => {
      const own = d.traits.find((x: any) => x.key === t.key);
      if (own) own.value = value;
      else if (t.requiresParameter) d.traitParameters[t.key] = value;
    }, `trait:${t.key}`);
  const printedTraining = t.name === "Trained" && t.origin === "Printed";
  const choices =
    t.name === "Breath"
      ? BREATH
      : t.name === "Mark of Chaos"
        ? ["Khorne", "Nurgle", "Slaanesh", "Tzeentch"]
        : ["Blessed", "Miracles"].includes(t.name)
          ? R.config.gods
          : t.name === "Spellcaster"
            ? gmCastableLores(R)
            : t.name === "Corruption"
              ? ["Minor", "Moderate", "Major"]
              : t.name === "Venom"
                ? VENOM_DIFFICULTIES
                : null;
  if (["Trained", "Spellcaster"].includes(t.name)) {
    const list =
      t.name === "Trained"
        ? [...TRAINING, ...(data.training || []).map((x: any) => x.name)]
        : choices;
    return (
      <fieldset className="gm-training" id={`trait-${t.key}`}>
        <legend>
          {t.name === "Trained"
            ? printedTraining
              ? "Training · add to printed profile"
              : "Training"
            : "Magical Lores"}
        </legend>
        {list.map((name: string) => {
          const selected = (
              printedTraining
                ? r.profile.traits.find((x: any) => x.key === t.key)?.value ||
                  ""
                : t.value
            )
              .split(",")
              .map((v: string) => v.trim())
              .includes(name),
            reason =
              t.name === "Spellcaster" ? gmLoreIssue(R, r.profile, name) : "";
          return (
            <Check
              key={name}
              value={name}
              data-lore={t.name === "Spellcaster" ? t.key : undefined}
              data-training={t.name === "Trained" ? t.key : undefined}
              checked={
                selected || (printedTraining && s.extraTraining.includes(name))
              }
              disabled={
                (printedTraining && selected) || (!!reason && !selected)
              }
              onChange={(enabled) => {
                if (printedTraining)
                  edit((d: any) => {
                    d.extraTraining = enabled
                      ? [...d.extraTraining, name]
                      : d.extraTraining.filter((n: string) => n !== name);
                  });
                else
                  change(
                    (enabled
                      ? [
                          ...new Set([
                            ...t.value
                              .split(",")
                              .map((x: string) => x.trim())
                              .filter(Boolean),
                            name,
                          ]),
                        ]
                      : t.value
                          .split(",")
                          .map((x: string) => x.trim())
                          .filter((x: string) => x !== name)
                    ).join(", "),
                  );
              }}
            >
              {name}
              {reason && <small>{reason}</small>}
              {printedTraining && selected && <small>Printed</small>}
            </Check>
          );
        })}
      </fieldset>
    );
  }
  return choices ? (
    <Select
      label={parameter}
      id={`trait-${t.key}`}
      data-trait={t.key}
      value={t.value}
      options={[
        ["", "Choose…"],
        ...new Set([...choices, ...(t.value ? [t.value] : [])]),
      ]}
      onChange={change}
    />
  ) : (
    <Field
      label={parameter}
      id={`trait-${t.key}`}
      data-trait={t.key}
      value={t.value}
      type={
        ["Rating", "Number", "Damage"].includes(parameter) ? "number" : "text"
      }
      min="1"
      step="1"
      onChange={change}
    />
  );
}
function Traits() {
  const {
    data,
    rules: R,
    draft: s,
    result: r,
    edit,
    setModal,
    picker,
  } = useBestiary();
  const addOptional = (t: any) => {
    if (t.name === "Size")
      return setModal({
        kind: "message",
        title: "Size",
        message: "Change Size on the Characteristics tab.",
      });
    if (r.traits.some((x: any) => x.name === t.name)) return;
    edit((d: any) => {
      d.traits.push({
        ...t,
        key: `gm-${crypto.randomUUID()}`,
        value: /Any|Various/.test(t.value) ? "" : t.value,
        origin: "GM",
      });
    });
  };
  return (
    <>
      <SectionHeading action={() => picker("trait")} label="Add Trait">
        Creature Traits
      </SectionHeading>
      <p className="gm-small">
        Mechanical summaries for the creature’s actual Traits. Consult the cited
        book for full rules; situational effects remain references for play.
      </p>
      <div className="gm-entry-list">
        {r.traits.map((t: any) => (
          <div className="gm-entry" key={t.key}>
            <div>
              <Details
                id={t.key}
                title={
                  <>
                    {t.name} {t.value && <small>({t.value})</small>}{" "}
                    <span className="gm-origin">{t.origin}</span>
                  </>
                }
              >
                <Rule entry={{ ...t, text: t.summary }} />
              </Details>
              <Legacy entry={t} />
              {(t.origin === "GM" ||
                t.requiresParameter ||
                (t.name === "Trained" && t.origin === "Printed")) && (
                <TraitParameter trait={t} />
              )}
            </div>
            {t.name !== "Size" && t.origin !== "Training" && (
              <Remove entryKey={t.key} />
            )}
          </div>
        ))}
      </div>
      {!!r.optionalTraits.length && (
        <Details id="optional-traits" title="Suggested optional Traits">
          <div className="gm-chips">
            {r.optionalTraits.map((t: any, i: number) => (
              <Button key={i} onClick={() => addOptional(t)}>
                {rowName(t)}
              </Button>
            ))}
          </div>
          <p className="gm-small">
            Suggestions from the profile, not automatic grants.
          </p>
        </Details>
      )}
      {r.traits.some(
        (t: any) =>
          (t.origin !== "Printed" ||
            t.deriveTraining ||
            s.extraTraining.includes("Broken")) &&
          t.name === "Trained" &&
          t.value.includes("Broken"),
      ) && (
        <div className="gm-callout">
          <p>
            Broken training adds 2d10 Fellowship; an absent score starts at 0
            (p. 363).
          </p>
          <Button
            id="gm-broken-roll"
            onClick={() =>
              edit((d: any) => {
                d.brokenRoll = gmRoll(
                  d,
                  "Broken training Fellowship",
                  2,
                  10,
                  363,
                );
              })
            }
          >
            {s.brokenRoll
              ? `Roll again · ${s.brokenRoll.join(" + ")}`
              : "Roll 2d10 Fellowship"}
          </Button>
        </div>
      )}
      {(r.template?.physicalMutations ||
        r.traits.some((t: any) =>
          ["Mutation", "Mental Corruption", "Mark of Chaos"].includes(t.name),
        )) && (
        <section id="gm-mutations">
          <SectionHeading
            action={() => picker("mutation")}
            label="Choose mutation"
          >
            Corruption choices
          </SectionHeading>
          {r.traits.some(
            (t: any) =>
              t.name === "Mark of Chaos" &&
              t.value === "Tzeentch" &&
              t.origin === "GM",
          ) && (
            <>
              <p className="gm-small">
                Tzeentch grants ceil(1d10 ÷ 3) alternating Mental/Physical
                mutations (p. 359).
              </p>
              <Button
                onClick={() =>
                  edit((d: any) => {
                    d.markRoll = gmRoll(
                      d,
                      "Tzeentch mutation count",
                      1,
                      10,
                      359,
                    )[0];
                  })
                }
              >
                {s.markRoll
                  ? `Roll again · ${s.markRoll} → ${Math.ceil(s.markRoll / 3)} mutations`
                  : "Roll Tzeentch mutations"}
              </Button>
            </>
          )}
          <div className="gm-chips">
            {["Physical", "Mental"].map((category) => (
              <Button
                key={category}
                onClick={() =>
                  edit((d: any) => {
                    const roll = gmRoll(
                        d,
                        `${category} Corruption`,
                        1,
                        100,
                        category === "Physical" ? 189 : 190,
                      )[0],
                      m = data.mutations.find(
                        (m: any) =>
                          m.category === category &&
                          roll >= m.min &&
                          roll <= m.max,
                      );
                    if (!m) throw Error("No printed result for this roll.");
                    if (!d.mutations.includes(m.id)) d.mutations.push(m.id);
                  })
                }
              >
                Roll {category}
              </Button>
            ))}
          </div>
          {r.mutations.map((m: any) => (
            <div className="gm-entry" key={m.id}>
              <Details id={m.id} title={m.name}>
                <Rule entry={m} />
              </Details>
              <Remove entryKey={m.id} />
            </div>
          ))}
        </section>
      )}
    </>
  );
}
function SkillsTalents() {
  const { rules: R, draft: s, result: r, edit, picker } = useBestiary();
  return (
    <>
      {!!r.profile.optionalTalents?.length && (
        <Details id="optional-talents" title="Suggested optional Talents">
          <div className="gm-chips">
            {r.profile.optionalTalents.map((t: any, i: number) => (
              <Button
                key={i}
                disabled={r.talents.some((x: any) => x.name === t.name)}
                onClick={() =>
                  edit((d: any) => {
                    d.talents.push({
                      ...t,
                      key: `gm-${crypto.randomUUID()}`,
                      origin: "GM",
                      source: r.profile.source,
                    });
                  })
                }
              >
                {t.name}
              </Button>
            ))}
          </div>
          <p className="gm-small">
            Converted printed suggestions; grant only when selected.
          </p>
        </Details>
      )}
      <SectionHeading action={() => picker("skill")} label="Add Skill">
        Skills
      </SectionHeading>
      <p className="gm-small">
        Scores below are final totals. Edit a total to make an explicit GM
        adjustment.
      </p>
      <div className="gm-entry-list">
        {r.skills.map((t: any) => (
          <div className="gm-skill-row" key={t.key || t.name}>
            <div>
              <strong>{t.name}</strong>
              <Legacy entry={t} />
              <small>
                {t.origin} · {t.char || "Printed total"}
              </small>
            </div>
            <Input
              type="number"
              min="0"
              step="1"
              value={t.total}
              aria-label={`${t.name} total`}
              onChange={(e) =>
                edit((d: any) => {
                  let row = d.skills.find((x: any) => x.name === t.name);
                  if (!row) {
                    row = {
                      key: `gm-${crypto.randomUUID()}`,
                      name: t.name,
                      total: 0,
                      origin: "GM",
                    };
                    d.skills.push(row);
                  }
                  row.total = numberValue(e.target.value) ?? 0;
                }, `skill:${t.name}`)
              }
            />
            <Button
              aria-label={`Read ${t.name}`}
              onClick={() => requestReference({ kind: "skill", name: t.name })}
            >
              ?
            </Button>
            <Remove entryKey={t.key || `skill:${t.name}`} />
          </div>
        ))}
      </div>
      {!!r.ridingOptions?.length && (
        <Details
          id={
            r.ridingOptions.some(
              (x: any) => x.source.book === "cluster-eye-tribe",
            )
              ? "greenskin-riding"
              : "undead-riding"
          }
          title={
            r.ridingOptions.some(
              (x: any) => x.source.book === "cluster-eye-tribe",
            )
              ? "Optional Greenskin mount Skills"
              : "Optional undead mount Skills"
          }
        >
          <p className="gm-small">
            Choose explicitly; use the higher existing bonus. No mount is added.
          </p>
          <div className="gm-chips">
            {r.ridingOptions.map((x: any) => (
              <Button
                key={x.name}
                disabled={r.stats.Ag === null}
                onClick={() =>
                  edit((d: any) => {
                    const total = Math.max(
                      r.stats.Ag + x.bonus,
                      r.skills.find((t: any) => t.name === x.name)?.total || 0,
                    );
                    d.removed = d.removed.filter(
                      (k: string) => k !== `skill:${x.name}`,
                    );
                    const previous = d.skills.find(
                      (t: any) => t.name === x.name,
                    );
                    if (previous) previous.total = total;
                    else
                      d.skills.push({
                        key: `gm-${crypto.randomUUID()}`,
                        name: x.name,
                        total,
                        origin: "GM",
                        source: x.source,
                      });
                  })
                }
              >
                {x.name} +{x.bonus}
              </Button>
            ))}
          </div>
        </Details>
      )}
      <SectionHeading action={() => picker("talent")} label="Add Talent">
        Talents
      </SectionHeading>
      {r.talents.map((t: any) => (
        <div className="gm-entry" key={t.key}>
          <div>
            <Details
              id={t.key}
              title={
                <>
                  {t.name}
                  {t.ranks > 1 ? ` ×${t.ranks}` : ""}{" "}
                  <span className="gm-origin">{t.origin}</span>
                </>
              }
            >
              <Rule
                entry={
                  talentInfo(R, t.name) || {
                    name: t.name,
                    text: "Printed Talent; see source.",
                    source: r.profile.source,
                  }
                }
                kind="talent"
              />
            </Details>
            <Legacy entry={{ ...talentInfo(R, t.name), ...t }} />
            {t.origin === "GM" && base(t.name) === "Impassioned Zeal" && (
              <Field
                label="Cause"
                id={`cause-${t.key}`}
                value={t.name.match(/\((.*?)\)/)?.[1] || ""}
                onChange={(value) =>
                  edit((d: any) => {
                    d.talents.find((x: any) => x.key === t.key).name =
                      `Impassioned Zeal (${value})`;
                  }, `cause:${t.key}`)
                }
              />
            )}
          </div>
          {t.origin === "GM" && (
            <Input
              className="gm-rank"
              type="number"
              min="1"
              max={
                Number.isFinite(gmTalentLimit(R, r.stats, t.name))
                  ? gmTalentLimit(R, r.stats, t.name)
                  : undefined
              }
              value={t.ranks}
              aria-label={`${t.name} ranks`}
              onChange={(e) =>
                edit((d: any) => {
                  const row = d.talents.find((x: any) => x.key === t.key),
                    limit =
                      R.config.talentLimits[base(row.name)] === null
                        ? Infinity
                        : (R.config.talentLimits[base(row.name)] ?? 1);
                  row.ranks = Math.max(
                    1,
                    Math.min(limit, Number(e.target.value) || 1),
                  );
                }, `rank:${t.key}`)
              }
            />
          )}{" "}
          {t.origin !== "Template" && t.origin !== "Trait" && (
            <Remove entryKey={t.key} />
          )}
        </div>
      ))}
    </>
  );
}
export function Customise() {
  const { draft: s, result: r, ui, setUI, edit, setModal } = useBestiary();
  if (!r.profile)
    return <p className="gm-empty">Choose a starting profile first.</p>;
  return (
    <>
      <div className="gm-template-bar">
        <div>
          <span className="eyebrow">Creature template</span>
          <strong>{r.template?.name || "Develop this profile"}</strong>
          <small>
            {r.template
              ? "Complete its source-reviewed choices below"
              : "Optional · develop the profile with a source-reviewed template"}
          </small>
        </div>
        <div className="gm-template-actions">
          <Button
            className="primary"
            data-action="template-picker"
            onClick={() => setModal({ kind: "templates" })}
          >
            {s.template ? "Change template" : "Choose template"}
          </Button>
          {s.template && (
            <Button onClick={() => edit((d: any) => applyTemplate(d, ""))}>
              Remove template
            </Button>
          )}
        </div>
      </div>
      {r.template && <Metadata entry={r.template} />}
      <ProfileChoices />
      <TemplateChoices />
      <div className="page-tabs" role="tablist" aria-label="Customisation">
        {TABS.map((name, i) => (
          <Button
            key={name}
            id={`gm-tab-${i}`}
            role="tab"
            className={`quiet${ui.tab === i ? " active" : ""}`}
            aria-controls="gm-custom-content"
            aria-selected={ui.tab === i}
            tabIndex={ui.tab === i ? 0 : -1}
            onClick={() => setUI({ tab: i })}
            onKeyDown={(e) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
                return;
              e.preventDefault();
              const tab =
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? 2
                    : (ui.tab + (e.key === "ArrowRight" ? 1 : -1) + 3) % 3;
              setUI({ tab });
              requestAnimationFrame(() =>
                document.getElementById(`gm-tab-${tab}`)?.focus(),
              );
            }}
          >
            {name}
          </Button>
        ))}
      </div>
      <div
        id="gm-custom-content"
        role="tabpanel"
        aria-labelledby={`gm-tab-${ui.tab}`}
      >
        {ui.tab === 0 ? (
          <Characteristics />
        ) : ui.tab === 1 ? (
          <Traits />
        ) : (
          <SkillsTalents />
        )}
      </div>
    </>
  );
}
export function EquipmentMagic() {
  const { rules: R, draft: s, result: r, edit, picker } = useBestiary();
  if (!r.profile)
    return <p className="gm-empty">Choose a starting profile first.</p>;
  const optional = r.profile.attacks.filter((x: any) => x.optional),
    armour = r.profile.armour.filter((x: any) => x.optional),
    eligible = magicChoices(R, r);
  return (
    <>
      <div id="gm-equipment" />
      <SectionHeading action={() => picker("equipment")} label="Add equipment">
        Attacks & equipment
      </SectionHeading>
      <p className="gm-small">
        The printed attack and armour profiles are included. GM equipment has no
        shopping budget. Clear an attack override to restore the calculation.
      </p>
      {(optional.length > 0 || armour.length > 0) && (
        <Details
          id="optional-equipment"
          title="Optional printed equipment"
          initial
        >
          {[
            [optional, "optionalAttacks"],
            [armour, "optionalArmour"],
          ].map(([rows, key]: any) =>
            rows.map((x: any) => (
              <Check
                key={x.key}
                checked={s[key].includes(x.key)}
                onChange={(v) =>
                  edit((d: any) => {
                    d[key] = v
                      ? [...new Set([...d[key], x.key])]
                      : d[key].filter((k: string) => k !== x.key);
                  })
                }
              >
                {x.name} ·{" "}
                {x.ap === undefined
                  ? `${x.skill ?? "—"} / +${x.damage}`
                  : `+${x.ap} AP`}
              </Check>
            )),
          )}
        </Details>
      )}
      <div className="gm-attack-labels">
        <span>Attack</span>
        <span>Score</span>
        <span>Damage</span>
        <span />
      </div>
      {r.attacks.map((a: any) => (
        <div className="gm-attack-row" id={`attack-${a.key}`} key={a.key}>
          <div>
            <strong>{a.name}</strong>
            <small>{a.text || "Primary attack"}</small>
            <Metadata entry={a} />
          </div>
          {["skill", "damage"].map((property) => (
            <Input
              key={property}
              type="number"
              min="0"
              value={a[property] ?? ""}
              aria-label={`${a.name} ${property === "skill" ? "attack score" : "Damage"}`}
              onChange={(e) =>
                edit((d: any) => {
                  const values = d.attackOverrides[a.key] || {},
                    num = numberValue(e.target.value);
                  if (num === null) delete values[property];
                  else values[property] = num;
                  if (Object.keys(values).length)
                    d.attackOverrides[a.key] = values;
                  else delete d.attackOverrides[a.key];
                }, `attack:${a.key}:${property}`)
              }
            />
          ))}
          <Remove entryKey={a.key} />
        </div>
      ))}
      <h2>Defence</h2>
      <div className="gm-defence-summary">
        <strong>TB {r.tb ?? "—"}</strong>
        {Object.entries(r.ap).map(([loc, ap]) => (
          <span key={loc}>
            {loc} <b>{String(ap)} AP</b>
          </span>
        ))}
      </div>
      {r.shield > 0 && (
        <p>Shield adds +{r.shield} AP when Opposing with Dodge/Melee.</p>
      )}
      {r.armour.map((a: any) => (
        <div className="gm-entry" key={a.key}>
          <div>
            <strong>{armourLabel(a)}</strong>
            <small className="gm-small">
              {a.origin} · +{a.ap} AP · {a.shield ? "Shield" : a.locations}
            </small>
          </div>
          <Remove entryKey={a.key} />
        </div>
      ))}
      <h2>Trappings</h2>
      <p>{r.trappings ?? r.profile.sections.Trappings}</p>
      {r.gear.map((g: any) => (
        <div className="gm-entry" id={`gear-${g.key}`} key={g.key}>
          <div>
            <strong>{g.entry.name}</strong>
            <Metadata entry={g.entry} />
            <small className="gm-small">
              {g.entry.enc === null ? "Encumbrance unknown" : ""}{" "}
              {g.entry.qualities}
            </small>
            {g.entry.text && <p>{g.entry.text}</p>}
          </div>
          {g.origin === "Template" ? (
            <small>Template · ×1</small>
          ) : (
            <Input
              className="gm-rank"
              type="number"
              min="1"
              value={g.quantity}
              aria-label={`${g.entry.name} quantity`}
              onChange={(e) =>
                edit((d: any) => {
                  d.gear.find((x: any) => x.key === g.key).quantity = Math.max(
                    1,
                    Number(e.target.value) || 1,
                  );
                }, `quantity:${g.key}`)
              }
            />
          )}
          <Remove entryKey={g.key} />
        </div>
      ))}
      <section id="gm-magic">
        <SectionHeading
          action={eligible.length ? () => picker("magic") : undefined}
          label="Choose magic"
        >
          Magic & knowledge
        </SectionHeading>
        <p className="gm-small">
          {eligible.length
            ? "All integrated book choices follow the selected Lore, patron, magical template or knowledge Talent. No PC starting grants or XP are added."
            : "Add an appropriate magical template or Talent, Spellcaster Trait or Bless/Invoke to unlock spells, rituals and techniques."}
          {r.template?.magicGroups
            ? ` ${r.template.name}: ${r.template.magicGroups.map(templateMagicLabel).join(", ")} spells.`
            : ""}
          {r.template?.magic
            ? ` Up to ${r.template.magic.petty} Petty and ${r.template.magic.lore} Lore spells.`
            : ""}
        </p>
        {r.runes?.map((x: any) => (
          <Details
            key={x.contentId}
            id={`rune:${x.contentId}`}
            title={`${x.name} (${x.form})`}
          >
            <Rule entry={x} />
          </Details>
        ))}
        {r.spells.map((x: any, i: number) => (
          <div className="gm-entry" key={x.contentId}>
            <div>
              <Details
                id={x.contentId}
                title={
                  <>
                    {x.name} <small>{x.category}</small>
                  </>
                }
              >
                <p className="gm-small">
                  {x.category === "Technique"
                    ? `SL ${x.sl}`
                    : x.ritual
                      ? "Ritual"
                      : `CN ${x.cn ?? "—"}`}{" "}
                  · Range {x.range || "—"} · Target {x.target || "—"} · Duration{" "}
                  {x.duration || "—"}
                </p>
                <Rule entry={x} />
              </Details>
              <Legacy entry={x} />
              {gmCantBook(R) && x.category === "Arcane" && (
                <Select
                  label={`${x.name} Lore`}
                  id={`gm-spell-lore-${i}`}
                  options={[["", "Choose a Lore"], ...r.magicLores]}
                  value={s.spellLores[x.contentId] || ""}
                  onChange={(v) =>
                    edit((d: any) => {
                      if (v) d.spellLores[x.contentId] = v;
                      else delete d.spellLores[x.contentId];
                    })
                  }
                />
              )}
            </div>
            <Remove entryKey={x.contentId} />
          </div>
        ))}
      </section>
      {gmCantBook(R) && (
        <section id="gm-cants">
          <h2>Optional Cants</h2>
          <Check
            checked={s.cants.enabled}
            onChange={(v) =>
              edit((d: any) => {
                d.cants.enabled = v;
              })
            }
          >
            Use Colour Lore Cants
          </Check>
          <p className="gm-small">
            Archives III p. 86: one free Cant at 1, 3 and 6 known spells of an
            owned Colour Lore. Effects are references for play.
          </p>
          {s.cants.enabled && (
            <>
              {r.cantGrants.map((g: any) => (
                <section key={g.lore}>
                  <h3>
                    {g.lore}{" "}
                    <small>
                      {g.spells} spells · {g.count} Cants
                    </small>
                  </h3>
                  <div className="gm-fields">
                    {Array.from({ length: g.count }, (_, i) => {
                      const ids = s.cants.choices[g.lore] || [];
                      return (
                        <Select
                          key={i}
                          label={`${g.lore} Cant ${i + 1}`}
                          id={`gm-cant-${g.lore}-${i}`}
                          value={ids[i] || ""}
                          options={[
                            ["", "Choose a Cant"],
                            ...g.choices
                              .filter(
                                (x: any) =>
                                  x.id === ids[i] || !ids.includes(x.id),
                              )
                              .map((x: any) => [x.id, x.name]),
                          ]}
                          onChange={(v) =>
                            edit((d: any) => {
                              const choices = d.cants.choices[g.lore] || [];
                              choices[i] = v;
                              d.cants.choices[g.lore] = Array.from(
                                choices,
                                (x: any) => x || "",
                              );
                            })
                          }
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
              {!r.cantGrants.length && (
                <p className="gm-empty">
                  No eligible Colour Lore spells yet. Add its Arcane Magic
                  Talent and choose spells.
                </p>
              )}
              {r.cants.map((x: any) => (
                <Details
                  key={x.id}
                  id={`cant:${x.id}`}
                  title={`${x.name} (${x.lore})`}
                >
                  <Rule entry={x} />
                </Details>
              ))}
            </>
          )}
        </section>
      )}
    </>
  );
}
