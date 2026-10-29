"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { calculateGM } from "../../engine/gm/model.mjs";
import {
  WEAPON_EFFECTS,
  WEAPON_PROPERTIES,
  CREATURE_TARGETS,
  REACHES,
  newCustomWeapon,
  customWeaponIssues,
  validateCustomWeapons,
  customWeaponName,
  propertyDefinition,
  weaponPropertyName,
  availableWeaponRunes,
  weaponRune,
  effectDefinition,
  resolveCustomWeapon,
  rollWeaponEnchantment,
  isArtilleryBase,
} from "../../engine/gm/custom-weapons.mjs";
import { sourceLabel } from "../../engine/sources.mjs";
import { die } from "../../engine/rules.mjs";
import { requestReference } from "../../services/content";
import {
  Button,
  Check,
  Details,
  Field as BaseField,
  Input,
  Select as BaseSelect,
  Modal,
  useBestiary,
} from "./controls";

export function WeaponWorkbench({
  initial,
  close,
}: {
  initial: any;
  close: () => void;
}) {
  const { rules: R, data, draft, edit, notify, result, store } = useBestiary();
  const documentId = useRef(store.getDocumentId());
  const [weapon, setWeapon] = useState<any>(() =>
    initial ? structuredClone(initial) : null,
  );
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [group, setGroup] = useState("");
  const [pendingBase, setPendingBase] = useState("");
  const [pendingPower, setPendingPower] = useState("");
  const [property, setProperty] = useState("");
  const [effect, setEffect] = useState("");
  const [rune, setRune] = useState("");
  const [error, setError] = useState("");
  const [reviewValidation, setReviewValidation] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const hasWeapon = !!weapon;
  useEffect(() => {
    if (documentId.current !== store.getDocumentId()) close();
  }, [draft, store, close]);
  useEffect(() => {
    root.current
      ?.querySelector<HTMLInputElement>(
        hasWeapon ? "#weapon-name" : "#weapon-base-search",
      )
      ?.focus({ preventScroll: true });
  }, [hasWeapon, initial]);
  const change = (patch: any) => {
    setWeapon((w: any) => ({ ...w, ...patch }));
    setError("");
  };
  const groups = [
    ...new Set<string>(
      R.weapons
        .filter((w: any) => !kind || w.kind === kind)
        .map((w: any) => w.group),
    ),
  ].sort();
  const bases = R.weapons
    .filter(
      (w: any) =>
        (!kind || w.kind === kind) &&
        (!group || w.group === group) &&
        `${w.name} ${sourceLabel(R, w)}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
  const problems = weapon
    ? customWeaponIssues(R, weapon, { structured: true })
    : [];
  const derived = useMemo(
    () =>
      weapon
        ? resolveCustomWeapon(R, weapon, result.stats, result.skills)
        : null,
    [R, weapon, result.stats, result.skills],
  );
  const preview = useMemo(
    () =>
      weapon
        ? calculateGM(data, R, {
            ...draft,
            customWeapons: [
              ...(draft.customWeapons || []).filter(
                (w: any) => w.key !== weapon.key,
              ),
              weapon,
            ],
          }).attacks.find((a: any) => a.key === weapon.key)
        : null,
    [data, R, draft, weapon],
  );
  const chooseBase = (id: string) => {
    if (!id) return;
    if (weapon) setPendingBase(id);
    else setWeapon(newCustomWeapon(R, id));
  };
  const replaceBase = () => {
    const next = newCustomWeapon(R, pendingBase, weapon.key);
    next.name = weapon.name;
    next.notes = weapon.notes;
    next.quantity = weapon.quantity;
    next.rolls = weapon.rolls;
    setWeapon(next);
    setPendingBase("");
    setError("");
  };
  const switchPower = (power: string) => {
    change({
      power,
      effects: [],
      runes: [],
      customEffect: { name: "", text: "" },
      legendary: false,
      ammunition: 0,
    });
    setPendingPower("");
    setEffect("");
    setRune("");
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!weapon) return;
    try {
      if (documentId.current !== store.getDocumentId())
        throw Error("The NPC changed. Reopen the weapon editor.");
      if (
        initial &&
        JSON.stringify(
          draft.customWeapons.find((w: any) => w.key === initial.key),
        ) !== JSON.stringify(initial)
      )
        throw Error(
          "This weapon changed outside the editor. Cancel and reopen it before saving.",
        );
      validateCustomWeapons(R, [weapon]);
      edit((d: any) => {
        const index = d.customWeapons.findIndex(
          (w: any) => w.key === weapon.key,
        );
        if (index < 0) d.customWeapons.push(structuredClone(weapon));
        else d.customWeapons[index] = structuredClone(weapon);
      });
      notify(`${weapon.name} ${initial ? "updated" : "added"}.`);
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const rollEnchantment = () => {
    const rolled = rollWeaponEnchantment(weapon.kind);
    const rolls = [...weapon.rolls, ...rolled.rolls];
    if (rolls.length > 1200) {
      setError(
        "This design’s dice history is full. Save it or start a new design.",
      );
      return;
    }
    if (rolled.error) {
      change({ rolls });
      setError(rolled.error);
      return;
    }
    change({
      effects: rolled.effects,
      legendary: rolled.legendary,
      ammunition: rolled.ammunition,
      rolls,
      customEffect: { name: "", text: "" },
    });
  };
  const addEffect = () => {
    if (!effect || weapon.effects.some((e: any) => e.id === effect)) return;
    const definition = effectDefinition(effect)!;
    change({
      effects: [...weapon.effects, { id: effect, target: "" }],
      legendary: weapon.legendary || weapon.effects.length > 0,
      ammunition:
        definition.min === 99 && weapon.kind === "ranged"
          ? 1
          : weapon.ammunition,
    });
    setEffect("");
  };
  const addProperty = () => {
    const definition = WEAPON_PROPERTIES.find((p: any) => p.id === property);
    if (!definition) return;
    const name = definition.name.replace(/\s*\(.*/, "");
    if (
      weapon.properties.some(
        (p: string) =>
          weaponPropertyName(p) === weaponPropertyName(definition.name),
      )
    )
      return;
    const token = /\(Rating\)|^(Fine|Durable|Salvo|Crewed)$/.test(
      definition.name,
    )
      ? `${name} 1`
      : name === "Inflict"
        ? "Inflict ()"
        : name;
    change({
      properties: [...weapon.properties, token],
      propertySources: {
        ...weapon.propertySources,
        [weaponPropertyName(token)]: definition.id,
      },
    });
    setProperty("");
  };
  const addRune = () => {
    if (!rune) return;
    const existing = weapon.runes.find((r: any) => r.id === rune);
    change({
      runes: existing
        ? weapon.runes.map((r: any) =>
            r.id === rune ? { ...r, count: r.count + 1 } : r,
          )
        : [...weapon.runes, { id: rune, count: 1, target: "" }],
    });
    setRune("");
  };
  const count =
    weapon?.runes.reduce((n: number, r: any) => n + r.count, 0) || 0;
  const masters = weapon?.runes.some((r: any) => weaponRune(R, r.id)?.master);
  const matchingRunes =
    weapon?.power === "runic" &&
    draft.customWeapons.some(
      (w: any) =>
        w.key !== weapon.key &&
        w.power === "runic" &&
        (weapon.runes.some(
          (r: any) =>
            weaponRune(R, r.id)?.master &&
            w.runes.some((other: any) => other.id === r.id),
        ) ||
          JSON.stringify(
            w.runes
              .map(({ id, count }: any) => ({ id, count }))
              .sort((a: any, b: any) => a.id.localeCompare(b.id)),
          ) ===
            JSON.stringify(
              weapon.runes
                .map(({ id, count }: any) => ({ id, count }))
                .sort((a: any, b: any) => a.id.localeCompare(b.id)),
            )),
    );
  const focusIssue = (issue: WeaponIssue) => {
    setReviewValidation(true);
    const target = root.current?.querySelector<HTMLElement>(issue.target);
    if (!target) return;
    let ancestor: HTMLElement | null = target;
    while (ancestor && ancestor !== root.current) {
      if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
      ancestor = ancestor.parentElement;
    }
    requestAnimationFrame(() => {
      const control = target.matches("input, select, textarea, button, summary")
        ? target
        : target.querySelector<HTMLElement>(
            "summary, input, select, textarea, button",
          );
      control?.scrollIntoView({ block: "center", behavior: "instant" });
      control?.focus({ preventScroll: true });
    });
  };
  return (
    <Modal
      title={initial ? "Edit weapon" : "Create weapon"}
      close={close}
      className="weapon-dialog"
      trapFocus
    >
      <WeaponIssueContext.Provider
        value={{ issues: problems, reviewValidation }}
      >
        <form className="weapon-workbench" onSubmit={save}>
          <div className="weapon-dialog-body" ref={root}>
            {!weapon && (
              <p className="weapon-intro">
                Start with a published weapon, then change only what you need.
                Your changes belong to this NPC.
              </p>
            )}
            <details
              className="weapon-base-picker"
              open={!weapon || !!pendingBase}
            >
              <summary>
                {weapon
                  ? `Base: ${weapon.base.name} · Change base`
                  : "Choose a base weapon"}
                {weapon && (
                  <small>
                    {sourceLabel(R, { source: weapon.base.source })}
                  </small>
                )}
              </summary>
              <div className="weapon-fields">
                <Field
                  label="Search base weapons"
                  id="weapon-base-search"
                  value={query}
                  onChange={setQuery}
                />
                <Select
                  label="Base weapon type"
                  id="weapon-base-kind"
                  value={kind}
                  options={[
                    ["", "All types"],
                    ["melee", "Melee"],
                    ["ranged", "Ranged"],
                  ]}
                  onChange={(v: string) => {
                    setKind(v);
                    setGroup("");
                  }}
                />
                <Select
                  label="Base weapon group"
                  id="weapon-base-group"
                  value={group}
                  options={[["", "All groups"], ...groups.map((g) => [g, g])]}
                  onChange={setGroup}
                />
              </div>
              <Select
                label="Published weapon"
                id="weapon-base"
                value={pendingBase || ""}
                options={[
                  ["", "Choose a weapon…"],
                  ...bases.map((w: any) => [
                    w.contentId,
                    `${w.name} · ${w.kind} (${w.group}) · ${sourceLabel(R, w)}`,
                  ]),
                ]}
                onChange={chooseBase}
              />
              {!bases.length && (
                <p>No matching weapons. Clear the search or change a filter.</p>
              )}
              {pendingBase && (
                <div
                  className="weapon-confirm"
                  role="group"
                  aria-label="Replace base profile"
                >
                  <p>
                    Replace statistics, properties and powers with this base?
                    Your name and notes stay.
                  </p>
                  <div className="weapon-actions">
                    <Button onClick={replaceBase}>Replace profile</Button>
                    <Button onClick={() => setPendingBase("")}>
                      Keep editing
                    </Button>
                  </div>
                </div>
              )}
            </details>

            {weapon && (
              <>
                <div className="weapon-identity">
                  <Field
                    label="Weapon name"
                    id="weapon-name"
                    value={weapon.name}
                    maxLength={1000}
                    onChange={(name: string) => change({ name })}
                  />

                  <Field
                    label="Quantity"
                    id="weapon-quantity"
                    type="number"
                    min="1"
                    max="9999"
                    step="1"
                    value={weapon.quantity}
                    onChange={(value: string) =>
                      change({ quantity: Number(value) })
                    }
                  />
                </div>
                <fieldset className="weapon-power" id="weapon-power">
                  <legend>Weapon power</legend>
                  {["ordinary", "magical", "runic"].map((power) => (
                    <label key={power}>
                      <input
                        type="radio"
                        name="weapon-power"
                        value={power}
                        checked={weapon.power === power}
                        onChange={() => {
                          if (
                            weapon.effects.length ||
                            weapon.runes.length ||
                            weapon.customEffect.text
                          )
                            setPendingPower(power);
                          else switchPower(power);
                        }}
                      />
                      <span>{power[0].toUpperCase() + power.slice(1)}</span>
                    </label>
                  ))}
                </fieldset>
                <WeaponMessages target="#weapon-power" />
                {pendingPower && (
                  <div className="weapon-confirm">
                    <p>
                      Replace the current powers with {pendingPower}{" "}
                      customisation?
                    </p>
                    <div className="weapon-actions">
                      <Button onClick={() => switchPower(pendingPower)}>
                        Change power
                      </Button>
                      <Button onClick={() => setPendingPower("")}>
                        Keep editing
                      </Button>
                    </div>
                  </div>
                )}

                <div className="weapon-layout">
                  <aside className="weapon-preview" aria-label="Weapon preview">
                    <h3>{customWeaponName(weapon) || "Unnamed weapon"}</h3>
                    <p>
                      {weapon.kind === "melee" ? "Melee" : "Ranged"} (
                      {weapon.group}) · {weapon.hands} hand
                      {weapon.hands === 2 ? "s" : ""}
                    </p>
                    <dl>
                      <div>
                        <dt>Attack</dt>
                        <dd>{preview?.skill ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Damage</dt>
                        <dd>
                          {preview?.damage == null ? "—" : `+${preview.damage}`}
                        </dd>
                      </div>
                      <div>
                        <dt>{weapon.kind === "melee" ? "Reach" : "Range"}</dt>
                        <dd>{weapon.reach || "—"}</dd>
                      </div>
                      <div>
                        <dt>
                          <abbr title="Encumbrance">Enc.</abbr>
                        </dt>
                        <dd>{derived?.enc ?? "Unknown"}</dd>
                      </div>
                    </dl>
                    <details className="weapon-preview-details">
                      <summary>Properties, effects & source</summary>
                      <p>{derived?.properties.join(", ") || "No properties"}</p>
                      <small>
                        Based on {weapon.base.name} ·{" "}
                        {sourceLabel(R, { source: weapon.base.source })}
                      </small>
                      {derived && derived.calculated.length > 0 && (
                        <>
                          <h5>Included in calculation</h5>
                          <ul>
                            {derived.calculated.map((line: string) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      {derived && derived.details.length > 0 && (
                        <details>
                          <summary>Special effects & sources</summary>
                          {derived.details.map((line: string) => (
                            <p key={line}>{line}</p>
                          ))}
                        </details>
                      )}
                      {derived?.ammunition && (
                        <p>
                          {derived.ammunition.quantity} × Hoarfrost ammunition.
                          The launcher keeps its ordinary profile.
                        </p>
                      )}
                      {weapon.notes && <p>{weapon.notes}</p>}
                      <p className="gm-small">
                        Quantity: {weapon.quantity}. Conditional effects are
                        resolved during play.
                      </p>
                    </details>
                  </aside>
                  <div className="weapon-form">
                    {weapon.power === "magical" && (
                      <WeaponSection
                        id="weapon-enchantments"
                        title="Magical abilities"
                        initial
                        summary={`${weapon.effects.length + Number(!!weapon.customEffect.text.trim())} / 5 abilities`}
                      >
                        <div className="weapon-actions">
                          <strong>
                            {weapon.legendary ||
                            weapon.effects.length +
                              Number(!!weapon.customEffect.text.trim()) >
                              1
                              ? "Legendary weapon"
                              : "Enchantment"}{" "}
                            ·{" "}
                            {weapon.effects.length +
                              Number(!!weapon.customEffect.text.trim())}
                            /5 abilities
                          </strong>
                          <Button onClick={rollEnchantment}>
                            {weapon.effects.length
                              ? "Reroll enchantment"
                              : "Roll enchantment"}
                          </Button>
                        </div>
                        <p className="gm-small">
                          Choose or roll. Reroll replaces these abilities; 00
                          automatically rolls twice more, up to five distinct
                          abilities.
                        </p>
                        {weapon.legendary && weapon.effects.length <= 1 && (
                          <Button onClick={() => change({ legendary: false })}>
                            Remove Legendary status
                          </Button>
                        )}
                        {weapon.effects.map((selection: any) => {
                          const e = effectDefinition(selection.id)!;
                          return (
                            <div className="weapon-property" key={selection.id}>
                              <div>
                                <details>
                                  <summary>{e.name}</summary>
                                  <p>{e.text}</p>
                                  <small>
                                    Archives II · p. {e.page}
                                    {e.adaptation ? ` · ${e.adaptation}` : ""}
                                  </small>
                                </details>
                                {e.target && (
                                  <>
                                    <Field
                                      label="Bane creature target"
                                      id="weapon-bane"
                                      value={selection.target}
                                      list="weapon-targets"
                                      onChange={(target: string) =>
                                        change({
                                          effects: weapon.effects.map(
                                            (x: any) =>
                                              x.id === e.id
                                                ? { ...x, target }
                                                : x,
                                          ),
                                        })
                                      }
                                    />
                                    <Button
                                      onClick={() => {
                                        const face = die(100),
                                          target = CREATURE_TARGETS.find(
                                            (c: any) =>
                                              face >= c.min && face <= c.max,
                                          )!.name;
                                        change({
                                          effects: weapon.effects.map(
                                            (x: any) =>
                                              x.id === e.id
                                                ? { ...x, target }
                                                : x,
                                          ),
                                          rolls: [
                                            ...weapon.rolls,
                                            {
                                              label: "Of Bane creature target",
                                              face,
                                              sides: 100,
                                              at: new Date().toISOString(),
                                              source: {
                                                book: "archives-ii",
                                                page: 55,
                                                table: "random-creatures",
                                              },
                                            },
                                          ],
                                        });
                                      }}
                                    >
                                      Roll target
                                    </Button>
                                  </>
                                )}
                                {e.min === 99 && weapon.kind === "ranged" && (
                                  <Field
                                    label="Hoarfrost ammunition quantity"
                                    id="weapon-ammo"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={weapon.ammunition}
                                    onChange={(v: string) =>
                                      change({ ammunition: Number(v) })
                                    }
                                  />
                                )}
                              </div>
                              <Button
                                aria-label={`Remove ${e.name} enchantment`}
                                onClick={() =>
                                  change({
                                    effects: weapon.effects.filter(
                                      (x: any) => x.id !== e.id,
                                    ),
                                    ammunition:
                                      e.min === 99 ? 0 : weapon.ammunition,
                                  })
                                }
                              >
                                ×
                              </Button>
                            </div>
                          );
                        })}
                        <div className="weapon-add-row">
                          <Select
                            label="Magical ability"
                            id="weapon-effect-select"
                            value={effect}
                            options={[
                              ["", "Choose an ability…"],
                              ...WEAPON_EFFECTS.filter(
                                (e: any) =>
                                  e.min !== 100 &&
                                  !weapon.effects.some(
                                    (x: any) => x.id === e.id,
                                  ) &&
                                  !(
                                    e.min === 99 &&
                                    weapon.kind === "ranged" &&
                                    (weapon.legendary || weapon.effects.length)
                                  ),
                              ).map((e: any) => [e.id, e.name]),
                            ]}
                            onChange={setEffect}
                          />
                          <Button
                            onClick={addEffect}
                            disabled={
                              !effect ||
                              weapon.effects.length +
                                Number(!!weapon.customEffect.text.trim()) >=
                                5
                            }
                          >
                            Add ability
                          </Button>
                        </div>
                        <Details
                          id="weapon-custom-magic"
                          title="Custom magical effect"
                        >
                          <Field
                            label="Custom effect name"
                            id="weapon-custom-name"
                            value={weapon.customEffect.name}
                            onChange={(name: string) =>
                              change({
                                customEffect: { ...weapon.customEffect, name },
                              })
                            }
                          />
                          <label htmlFor="weapon-custom-text">
                            Custom magical rules
                          </label>
                          <textarea
                            id="weapon-custom-text"
                            aria-invalid={
                              (reviewValidation &&
                                problems.some(
                                  (issue: WeaponIssue) =>
                                    issue.target === "#weapon-custom-text",
                                )) ||
                              undefined
                            }
                            aria-describedby={
                              problems.some(
                                (issue: WeaponIssue) =>
                                  issue.target === "#weapon-custom-text",
                              )
                                ? "weapon-custom-text-validation"
                                : undefined
                            }
                            rows={3}
                            maxLength={10000}
                            value={weapon.customEffect.text}
                            onChange={(e) =>
                              change({
                                customEffect: {
                                  ...weapon.customEffect,
                                  text: e.target.value,
                                },
                              })
                            }
                          />
                          <WeaponMessages target="#weapon-custom-text" />
                          <p className="gm-small">
                            GM-defined rules are printed as written. No numbers
                            are inferred from this text.
                          </p>
                        </Details>
                        <datalist id="weapon-targets">
                          {CREATURE_TARGETS.map((c: any) => (
                            <option key={c.min} value={c.name} />
                          ))}
                        </datalist>
                      </WeaponSection>
                    )}

                    {weapon.power === "runic" && (
                      <WeaponSection
                        id="weapon-runes"
                        title="Rune inscriptions"
                        initial
                        summary={`${count} / 3 inscriptions`}
                      >
                        <p className="weapon-rune-count" role="status">
                          {count} / 3 inscriptions · at most one Master Rune
                        </p>
                        <div className="weapon-fields">
                          <Select
                            label="Rune form"
                            id="weapon-rune-form"
                            value={weapon.surface}
                            options={[
                              ["weapon", "Weapon Runes"],
                              ["artillery", "Engineering Runes"],
                            ]}
                            onChange={(surface: string) => change({ surface })}
                          />
                          <Select
                            label="Inscription material"
                            id="weapon-material"
                            value={weapon.material}
                            options={[
                              ["Metal", "Metal"],
                              ["Stone", "Stone"],
                              [
                                "Other suitable material",
                                "Other suitable material",
                              ],
                            ]}
                            onChange={(material: string) =>
                              change({ material })
                            }
                          />
                        </div>
                        {weapon.surface === "weapon" ? (
                          <>
                            <Select
                              label="Melee weapon form"
                              id="weapon-form"
                              value={weapon.weaponForm}
                              options={["Axe", "Hammer", "Sword", "Other"].map(
                                (v) => [v, v],
                              )}
                              onChange={(weaponForm: string) =>
                                change({ weaponForm })
                              }
                            />
                            {weapon.weaponForm === "Other" && (
                              <Field
                                label="GM form exception"
                                id="weapon-form-exception"
                                value={weapon.formException}
                                placeholder="Why this surface can take Weapon Runes"
                                onChange={(formException: string) =>
                                  change({ formException })
                                }
                              />
                            )}
                          </>
                        ) : (
                          <>
                            <Check
                              checked={weapon.dwarfArtillery}
                              onChange={(dwarfArtillery: boolean) =>
                                change({ dwarfArtillery })
                              }
                            >
                              Dwarf-built artillery
                            </Check>
                            <p className="gm-small">
                              Engineering Runes require Dwarf artillery.{" "}
                              {isArtilleryBase(weapon)
                                ? "This cannon base is supported; confirm its Dwarf construction."
                                : "Choose a cannon base. Engineering pistols and mortars are not eligible."}
                            </p>
                          </>
                        )}
                        {weapon.runes.map((selection: any) => {
                          const r = weaponRune(R, selection.id)!;
                          return (
                            <div className="weapon-property" key={selection.id}>
                              <div>
                                <details>
                                  <summary>
                                    {r.name}
                                    {r.master ? " · Master Rune" : ""}
                                  </summary>
                                  <p>{r.text}</p>
                                  <small>
                                    {sourceLabel(R, r)} · Fourth Edition
                                    reference · {r.sl} forging SL
                                  </small>
                                </details>
                                <Field
                                  label={`${r.name} inscriptions`}
                                  id={`weapon-rune-${runeKeyForId(selection.id)}`}
                                  type="number"
                                  min="1"
                                  max={r.master ? "1" : "3"}
                                  value={selection.count}
                                  onChange={(v: string) =>
                                    change({
                                      runes: weapon.runes.map((x: any) =>
                                        x.id === r.contentId
                                          ? { ...x, count: Number(v) }
                                          : x,
                                      ),
                                    })
                                  }
                                />
                                {[
                                  "Grudge Rune",
                                  "Master Rune of the Slayer",
                                ].includes(r.name) && (
                                  <Field
                                    label={`${r.name} target`}
                                    id={`weapon-rune-target-${runeKeyForId(selection.id)}`}
                                    value={selection.target}
                                    onChange={(target: string) =>
                                      change({
                                        runes: weapon.runes.map((x: any) =>
                                          x.id === selection.id
                                            ? { ...x, target }
                                            : x,
                                        ),
                                      })
                                    }
                                  />
                                )}
                              </div>
                              <Button
                                aria-label={`Remove ${r.name}`}
                                onClick={() =>
                                  change({
                                    runes: weapon.runes.filter(
                                      (x: any) => x.id !== selection.id,
                                    ),
                                  })
                                }
                              >
                                ×
                              </Button>
                            </div>
                          );
                        })}
                        <div className="weapon-add-row">
                          <Select
                            label="Add rune"
                            id="weapon-rune-select"
                            value={rune}
                            options={[
                              ["", "Choose a rune…"],
                              ...availableWeaponRunes(R, weapon)
                                .filter((r: any) => !r.master || !masters)
                                .map((r: any) => [
                                  r.contentId || r.id,
                                  `${r.name} · ${r.sl} SL`,
                                ]),
                            ]}
                            onChange={setRune}
                          />
                          <Button
                            onClick={addRune}
                            disabled={!rune || count >= 3}
                          >
                            Inscribe rune
                          </Button>
                        </div>
                        <p className="gm-small">
                          Runic items are magical. Pride and Jealousy can
                          suppress matching items within 100 yards; resolve
                          their age and circumstances during play. Owning this
                          weapon does not teach its runes.
                        </p>
                        {matchingRunes && (
                          <p className="weapon-confirm">
                            This NPC carries a matching rune combination or
                            Master Rune. Check Pride and Jealousy before using
                            both.
                          </p>
                        )}
                      </WeaponSection>
                    )}

                    <WeaponSection
                      id="weapon-profile"
                      title="Weapon profile"
                      initial
                      summary={`${weapon.kind === "melee" ? "Melee" : "Ranged"} · ${weapon.group}`}
                    >
                      <div className="weapon-fields">
                        <Select
                          label="Weapon type"
                          id="weapon-kind"
                          value={weapon.kind}
                          options={[
                            ["melee", "Melee"],
                            ["ranged", "Ranged"],
                          ]}
                          onChange={(v: string) =>
                            change({
                              kind: v,
                              group: R.weapons.find((b: any) => b.kind === v)
                                .group,
                              reach: v === "melee" ? "Average" : "",
                            })
                          }
                        />
                        <Select
                          label="Weapon group"
                          id="weapon-group"
                          value={weapon.group}
                          options={[
                            ...new Set<string>(
                              R.weapons
                                .filter((b: any) => b.kind === weapon.kind)
                                .map((b: any) => b.group),
                            ),
                          ]
                            .sort()
                            .map((g) => [g, g])}
                          onChange={(v: string) => change({ group: v })}
                        />
                        <Select
                          label="Hands"
                          id="weapon-hands"
                          value={String(weapon.hands)}
                          options={[
                            ["1", "One-handed"],
                            ["2", "Two-handed"],
                          ]}
                          onChange={(v: string) => change({ hands: Number(v) })}
                        />
                        <Field
                          label="Damage formula"
                          id="weapon-damage"
                          value={weapon.damage}
                          onChange={(damage: string) => change({ damage })}
                          aria-describedby="weapon-damage-help"
                        />
                        {weapon.kind === "melee" ? (
                          <Select
                            label="Reach"
                            id="weapon-reach"
                            value={weapon.reach}
                            options={REACHES.map((v) => [v, v])}
                            onChange={(reach: string) => change({ reach })}
                          />
                        ) : (
                          <Field
                            label="Range"
                            id="weapon-reach"
                            value={weapon.reach}
                            placeholder="40 yards or SB × 3 yards"
                            onChange={(reach: string) => change({ reach })}
                          />
                        )}
                        <Field
                          label="Base Encumbrance"
                          id="weapon-enc"
                          type="number"
                          min="0"
                          step="1"
                          value={weapon.enc ?? ""}
                          placeholder="Unknown"
                          onChange={(v: string) =>
                            change({ enc: v === "" ? null : Number(v) })
                          }
                        />
                      </div>
                      <p className="gm-small" id="weapon-damage-help">
                        Damage: SB+4, TB+2, a fixed number, or — for no Damage.
                        Existing attack overrides remain explicit; clear them to
                        restore calculation.
                      </p>
                    </WeaponSection>
                    <WeaponSection
                      id="weapon-properties"
                      title="Properties & craftsmanship"
                      summary={
                        weapon.properties.length
                          ? `${weapon.properties.length} selected`
                          : "Optional"
                      }
                    >
                      {weapon.properties.map((token: string, index: number) => {
                        const definition = propertyDefinition(
                          token,
                          weapon.propertySources[weaponPropertyName(token)],
                        );
                        return (
                          <div className="weapon-property" key={index}>
                            <div>
                              <strong>{token || "Property"}</strong>
                              {definition && (
                                <details>
                                  <summary>Effect</summary>
                                  <p>{definition.text}</p>
                                  <small>{sourceLabel(R, definition)}</small>
                                </details>
                              )}
                              {/\(Rating\)|^(Fine|Durable|Salvo|Crewed)$/.test(
                                definition?.name || "",
                              ) && (
                                <Field
                                  label={`${definition!.name.replace(/\s*\(.*/, "")} rating`}
                                  id={`weapon-property-${index}`}
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={token.match(/\d+$/)?.[0] || ""}
                                  onChange={(v: string) =>
                                    change({
                                      properties: weapon.properties.map(
                                        (p: string, i: number) =>
                                          i === index
                                            ? `${definition!.name.replace(/\s*\(.*/, "")} ${v}`
                                            : p,
                                      ),
                                    })
                                  }
                                />
                              )}
                              {definition?.name.startsWith("Inflict") && (
                                <Field
                                  label="Inflict parameter"
                                  id={`weapon-property-${index}`}
                                  value={token.slice(
                                    token.indexOf("(") + 1,
                                    -1,
                                  )}
                                  onChange={(v: string) =>
                                    change({
                                      properties: weapon.properties.map(
                                        (p: string, i: number) =>
                                          i === index ? `Inflict (${v})` : p,
                                      ),
                                    })
                                  }
                                />
                              )}
                            </div>
                            <Button
                              aria-label={`Remove ${token} property`}
                              onClick={() =>
                                change({
                                  properties: weapon.properties.filter(
                                    (_: string, i: number) => i !== index,
                                  ),
                                })
                              }
                            >
                              ×
                            </Button>
                          </div>
                        );
                      })}
                      <div className="weapon-add-row">
                        <label htmlFor="weapon-property-select">
                          Add property
                        </label>
                        <select
                          id="weapon-property-select"
                          value={property}
                          onChange={(e) => setProperty(e.target.value)}
                        >
                          <option value="">Choose a property…</option>
                          {["Weapon", "Item"].map((family) => (
                            <optgroup
                              key={family}
                              label={
                                family === "Item"
                                  ? "Craftsmanship"
                                  : "Weapon properties"
                              }
                            >
                              {WEAPON_PROPERTIES.filter(
                                (p: any) =>
                                  p.family.startsWith(family) &&
                                  p.name !== "Magical",
                              ).map((p: any) => (
                                <option
                                  key={p.id}
                                  value={p.id}
                                  disabled={weapon.properties.some(
                                    (token: string) =>
                                      weaponPropertyName(token) ===
                                      weaponPropertyName(p.name),
                                  )}
                                >
                                  {p.name} · {sourceLabel(R, p)}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <Button onClick={addProperty} disabled={!property}>
                          Add property
                        </Button>
                      </div>

                      <WeaponMessages target="#weapon-properties" />
                    </WeaponSection>
                    <WeaponSection
                      id="weapon-notes-section"
                      title="Notes & references"
                      summary={
                        [
                          weapon.notes && "Notes added",
                          weapon.rolls.length > 0 &&
                            `${weapon.rolls.length} rolls recorded`,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Optional"
                      }
                    >
                      <label htmlFor="weapon-notes">Printed weapon notes</label>
                      <textarea
                        id="weapon-notes"
                        rows={3}
                        maxLength={10000}
                        value={weapon.notes}
                        onChange={(e) => change({ notes: e.target.value })}
                      />
                      <Details id="weapon-rules" title="Rules & crafting">
                        <div className="weapon-actions">
                          {["Crafting", "Commission", "Invent!"].map((name) => (
                            <Button
                              key={name}
                              onClick={() =>
                                requestReference({
                                  kind: "endeavour",
                                  book: "core",
                                  name,
                                })
                              }
                            >
                              Read {name}
                            </Button>
                          ))}
                        </div>
                        <p>
                          Core pp. 197–199: Commission, Crafting and Invent!
                          guide making an item. Crafting uses an Extended Trade
                          Test, one roll per Endeavour; Availability guides
                          Difficulty and listed price guides required SL. Each
                          Flaw halves required SL, then each Quality adds +5 SL.
                          These rules do not assign balanced statistics to a new
                          weapon.
                        </p>
                        <p>
                          Core pp. 298–304 cover craftsmanship and weapons.
                          Dwarf Guide pp. 125–128 and 131–132 restrict rune
                          forms, materials, three inscriptions and one Master
                          Rune. Archives II pp. 55 and 58–59 supply magical
                          abilities and creature targets. The approved table
                          correction uses Alight with Flame 25–28 and Dolorous
                          29–31.
                        </p>
                        <p>
                          NPC equipment has no shopping budget. Forging
                          progress, activation resources, curses and temporary
                          enchantment duration remain manual.
                        </p>
                      </Details>
                      {weapon.rolls.length > 0 && (
                        <Details
                          id="weapon-dice"
                          title={`Enchantment dice (${weapon.rolls.length})`}
                        >
                          <p className="gm-small">
                            All rolls and rerolls stay with the design. Manual
                            edits do not become verified random outcomes;
                            imported history is not independently verified.
                          </p>
                          <ol>
                            {weapon.rolls.map((roll: any, i: number) => (
                              <li key={i}>
                                {roll.label}: d{roll.sides} →{" "}
                                {roll.face === 100 ? "00" : roll.face} ·
                                Archives II p. {roll.source.page}
                              </li>
                            ))}
                          </ol>
                        </Details>
                      )}
                    </WeaponSection>
                  </div>
                </div>
              </>
            )}
            {error && (
              <p role="alert" className="weapon-section-issues">
                {error}
              </p>
            )}
          </div>
          <div className="weapon-dialog-footer">
            <div
              className="weapon-save-status"
              role="status"
              aria-live="polite"
            >
              {!weapon ? (
                "Choose a base weapon to get started."
              ) : pendingBase ? (
                "Confirm or cancel the base change."
              ) : pendingPower ? (
                "Confirm or cancel the power change."
              ) : problems.length ? (
                <Button
                  className="text-button"
                  onClick={() => focusIssue(problems[0])}
                >
                  {problems.length}{" "}
                  {problems.length === 1 ? "choice" : "choices"} to finish
                </Button>
              ) : initial ? (
                "Changes apply when you save."
              ) : (
                "Adds an attack and a Gear item."
              )}
            </div>
            <div className="weapon-actions">
              <Button onClick={close}>Cancel</Button>
              <Button
                type="submit"
                className="primary"
                disabled={
                  !weapon ||
                  !!problems.length ||
                  !!pendingPower ||
                  !!pendingBase
                }
              >
                {initial ? "Save changes" : "Add weapon"}
              </Button>
            </div>
          </div>
        </form>
      </WeaponIssueContext.Provider>
    </Modal>
  );
}
const runeKeyForId = (id: string) => id.replace(/[^a-z0-9-]/gi, "-");

type WeaponIssue = { message: string; target: string; section: string };
const WeaponIssueContext = createContext<{
  issues: WeaponIssue[];
  reviewValidation: boolean;
}>({ issues: [], reviewValidation: false });
function WeaponMessages({
  target,
  invalid,
}: {
  target: string;
  invalid?: boolean;
}) {
  const context = useContext(WeaponIssueContext);
  const issues = context.issues.filter((issue) => issue.target === target);
  return issues.length ? (
    <p
      id={`${target.slice(1)}-validation`}
      className={
        (invalid ?? context.reviewValidation)
          ? "ui-field-issue"
          : "ui-field-hint"
      }
    >
      {issues.map((issue) => issue.message).join(" ")}
    </p>
  ) : null;
}
function Field(props: ComponentProps<typeof BaseField>) {
  const [touched, setTouched] = useState(false);
  const context = useContext(WeaponIssueContext);
  const issues = context.issues.filter(
    (issue) => issue.target === `#${props.id}`,
  );
  return (
    <div className="weapon-validated-field">
      <BaseField
        {...props}
        aria-invalid={
          issues.length && (touched || context.reviewValidation)
            ? true
            : undefined
        }
        onBlur={(event) => {
          setTouched(true);
          props.onBlur?.(event);
        }}
        aria-describedby={
          [props["aria-describedby"], issues.length && `${props.id}-validation`]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      <WeaponMessages
        target={`#${props.id}`}
        invalid={touched || context.reviewValidation}
      />
    </div>
  );
}
function Select(props: ComponentProps<typeof BaseSelect>) {
  const [touched, setTouched] = useState(false);
  const context = useContext(WeaponIssueContext);
  const issues = context.issues.filter(
    (issue) => issue.target === `#${props.id}`,
  );
  return (
    <div className="weapon-validated-field">
      <BaseSelect
        {...props}
        aria-invalid={
          issues.length && (touched || context.reviewValidation)
            ? true
            : undefined
        }
        onBlur={(event) => {
          setTouched(true);
          props.onBlur?.(event);
        }}
        aria-describedby={
          [props["aria-describedby"], issues.length && `${props.id}-validation`]
            .filter(Boolean)
            .join(" ") || undefined
        }
      />
      <WeaponMessages
        target={`#${props.id}`}
        invalid={touched || context.reviewValidation}
      />
    </div>
  );
}
function WeaponSection({
  id,
  title,
  summary,
  initial = false,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  initial?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(initial);
  return (
    <details
      id={id}
      className="weapon-section"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <span>{title}</span>
        <small>{summary}</small>
      </summary>
      <div className="weapon-section-body">{children}</div>
    </details>
  );
}
