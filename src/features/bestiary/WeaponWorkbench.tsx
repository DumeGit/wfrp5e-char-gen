"use client";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
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
import {
  requestReference,
  type ReferenceRequest,
} from "../../services/content";
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
  const [error, setError] = useState("");
  const [reviewValidation, setReviewValidation] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const baseOpener = useRef<HTMLButtonElement | null>(null);
  const hasWeapon = !!weapon;
  const [panel, setPanel] = useState<WeaponPanel>("details");
  const [choosingBase, setChoosingBase] = useState(!initial);
  const [profileEditing, setProfileEditing] = useState(false);
  const [baseLimit, setBaseLimit] = useState(24);
  const [propertyQuery, setPropertyQuery] = useState("");
  const [propertyFamily, setPropertyFamily] = useState("Weapon");
  const [effectQuery, setEffectQuery] = useState("");
  const [runeQuery, setRuneQuery] = useState("");
  useEffect(() => {
    if (documentId.current !== store.getDocumentId()) close();
  }, [draft, store, close]);
  useEffect(() => {
    root.current
      ?.querySelector<HTMLElement>(
        hasWeapon ? '[data-weapon-panel="details"] h3' : "#weapon-base-search",
      )
      ?.focus({ preventScroll: true });
  }, [hasWeapon, initial]);
  useLayoutEffect(() => {
    const scroll = root.current?.querySelector(".weapon-editor-scroll");
    if (scroll) scroll.scrollTop = 0;
  }, [panel, choosingBase]);
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
    if (weapon?.baseId === id) {
      setPendingBase("");
      openPanel("details", true);
      return;
    }
    if (weapon) {
      setPendingBase(id);
      requestAnimationFrame(() => {
        const confirmation = root.current?.querySelector<HTMLElement>(
          '[aria-label="Replace base profile"]',
        );
        confirmation?.scrollIntoView({ block: "nearest", behavior: "instant" });
        confirmation?.querySelector<HTMLButtonElement>("button")?.focus({
          preventScroll: true,
        });
      });
    } else {
      setWeapon(newCustomWeapon(R, id));
      setChoosingBase(false);
      setPanel("details");
    }
  };
  const replaceBase = () => {
    const next = newCustomWeapon(R, pendingBase, weapon.key);
    next.name = weapon.name;
    next.notes = weapon.notes;
    next.quantity = weapon.quantity;
    next.rolls = weapon.rolls;
    setWeapon(next);
    setPendingBase("");
    setChoosingBase(false);
    setPanel("details");
    setError("");
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLElement>('[data-weapon-panel="details"] h3')
        ?.focus({ preventScroll: true }),
    );
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
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!weapon || choosingBase) return;
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
  const addEffect = (effect: string) => {
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
  };
  const addProperty = (property: string) => {
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
  };
  const addRune = (rune: string) => {
    if (!rune) return;
    const existing = weapon.runes.find((r: any) => r.id === rune);
    change({
      runes: existing
        ? weapon.runes.map((r: any) =>
            r.id === rune ? { ...r, count: r.count + 1 } : r,
          )
        : [...weapon.runes, { id: rune, count: 1, target: "" }],
    });
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
  const openPanel = (next: WeaponPanel, focus = false) => {
    setPanel(next);
    setChoosingBase(false);
    if (focus)
      requestAnimationFrame(() =>
        root.current
          ?.querySelector<HTMLElement>(`[data-weapon-panel="${next}"] h3`)
          ?.focus(),
      );
  };
  const focusIssue = (issue: WeaponIssue) => {
    setReviewValidation(true);
    const next =
      issue.section === "properties"
        ? "properties"
        : issue.section === "profile"
          ? "details"
          : "power";
    openPanel(next);
    if (
      next === "details" &&
      !["#weapon-name", "#weapon-quantity"].includes(issue.target)
    )
      setProfileEditing(true);
    requestAnimationFrame(() => {
      const target = root.current?.querySelector<HTMLElement>(issue.target);
      if (!target) return;
      let ancestor: HTMLElement | null = target;
      while (ancestor && ancestor !== root.current) {
        if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
        ancestor = ancestor.parentElement;
      }
      const control = target.matches("input, select, textarea, button, summary")
        ? target
        : target.querySelector<HTMLElement>(
            "input, select, textarea, button, summary",
          );
      control?.scrollIntoView({ block: "center", behavior: "instant" });
      control?.focus({ preventScroll: true });
    });
  };
  const setPower = (power: string) => {
    if (power === weapon.power) return;
    if (
      weapon.effects.length ||
      weapon.runes.length ||
      weapon.customEffect.text
    )
      setPendingPower(power);
    else switchPower(power);
  };
  const matches = (name: string, query: string) =>
    name.toLowerCase().includes(query.trim().toLowerCase());
  const powerDescriptions: Record<string, string> = {
    ordinary: "Use the printed profile and any chosen properties.",
    magical: "Choose enchantments or roll a sourced magical weapon.",
    runic: "Inscribe eligible Weapon or Engineering Runes.",
  };
  const sectionIssues = (key: WeaponPanel) =>
    problems.filter((issue: WeaponIssue) =>
      key === "details"
        ? issue.section === "profile"
        : key === "properties"
          ? issue.section === "properties"
          : key === "power"
            ? ["power", "enchantments", "runes"].includes(issue.section)
            : false,
    ).length;
  const magicOptions = weapon
    ? WEAPON_EFFECTS.filter(
        (e: any) =>
          e.min !== 100 &&
          !weapon.effects.some((x: any) => x.id === e.id) &&
          !(
            e.min === 99 &&
            weapon.kind === "ranged" &&
            (weapon.legendary || weapon.effects.length)
          ) &&
          matches(e.name, effectQuery),
      )
    : [];
  const propertyOptions = WEAPON_PROPERTIES.filter(
    (entry: any) =>
      entry.family.startsWith(propertyFamily) &&
      entry.name !== "Magical" &&
      matches(`${entry.name} ${sourceLabel(R, entry)}`, propertyQuery),
  );
  const runeOptions = weapon
    ? availableWeaponRunes(R, weapon).filter(
        (r: any) => (!r.master || !masters) && matches(r.name, runeQuery),
      )
    : [];
  const changeBase = () => {
    setChoosingBase(true);
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLInputElement>("#weapon-base-search")
        ?.focus(),
    );
  };
  const renderProfile = () => (
    <>
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
              group: R.weapons.find((b: any) => b.kind === v).group,
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
          onChange={(v: string) => change({ enc: v === "" ? null : Number(v) })}
        />
      </div>
      <p className="gm-small" id="weapon-damage-help">
        Damage: SB+4, TB+2, a fixed number, or — for no Damage. Existing attack
        overrides remain explicit; clear them to restore calculation.
      </p>
    </>
  );
  const renderProperties = () => (
    <>
      {weapon.properties.map((token: string, index: number) => {
        const definition = propertyDefinition(
          token,
          weapon.propertySources[weaponPropertyName(token)],
        );
        return (
          <div className="weapon-property" key={index}>
            <div>
              {definition ? (
                <>
                  <WeaponReferenceName
                    name={token}
                    reference={propertyReference(definition)}
                  />
                  <small className="weapon-reference-source">
                    {sourceLabel(R, definition)}
                  </small>
                </>
              ) : (
                <strong>{token || "Property"}</strong>
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
                  value={token.slice(token.indexOf("(") + 1, -1)}
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
              Remove
            </Button>
          </div>
        );
      })}
    </>
  );
  const renderEnchantments = () => (
    <>
      {weapon.effects.map((selection: any) => {
        const e = effectDefinition(selection.id)!;
        return (
          <div className="weapon-property" key={selection.id}>
            <div>
              <WeaponReferenceName
                name={e.name}
                reference={enchantmentReference(e)}
              />
              <small className="weapon-reference-source">
                Archives II · p. {e.page}
                {e.adaptation ? " · Legacy" : ""}
              </small>
              {e.target && (
                <>
                  <Field
                    label="Bane creature target"
                    id="weapon-bane"
                    value={selection.target}
                    list="weapon-targets"
                    onChange={(target: string) =>
                      change({
                        effects: weapon.effects.map((x: any) =>
                          x.id === e.id ? { ...x, target } : x,
                        ),
                      })
                    }
                  />
                  <Button
                    onClick={() => {
                      const face = die(100),
                        target = CREATURE_TARGETS.find(
                          (c: any) => face >= c.min && face <= c.max,
                        )!.name;
                      change({
                        effects: weapon.effects.map((x: any) =>
                          x.id === e.id ? { ...x, target } : x,
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
                  onChange={(v: string) => change({ ammunition: Number(v) })}
                />
              )}
            </div>
            <Button
              aria-label={`Remove ${e.name} enchantment`}
              onClick={() =>
                change({
                  effects: weapon.effects.filter((x: any) => x.id !== e.id),
                  ammunition: e.min === 99 ? 0 : weapon.ammunition,
                })
              }
            >
              Remove
            </Button>
          </div>
        );
      })}

      <Details id="weapon-custom-magic" title="Custom magical effect">
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
        <label htmlFor="weapon-custom-text">Custom magical rules</label>
        <textarea
          id="weapon-custom-text"
          aria-invalid={
            (reviewValidation &&
              problems.some(
                (issue: WeaponIssue) => issue.target === "#weapon-custom-text",
              )) ||
            undefined
          }
          aria-describedby={
            problems.some(
              (issue: WeaponIssue) => issue.target === "#weapon-custom-text",
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
          GM-defined rules are printed as written. No numbers are inferred from
          this text.
        </p>
      </Details>
      <datalist id="weapon-targets">
        {CREATURE_TARGETS.map((c: any) => (
          <option key={c.min} value={c.name} />
        ))}
      </datalist>
    </>
  );
  const renderRunes = () => (
    <>
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
            ["Other suitable material", "Other suitable material"],
          ]}
          onChange={(material: string) => change({ material })}
        />
      </div>
      {weapon.surface === "weapon" ? (
        <>
          <Select
            label="Melee weapon form"
            id="weapon-form"
            value={weapon.weaponForm}
            options={["Axe", "Hammer", "Sword", "Other"].map((v) => [v, v])}
            onChange={(weaponForm: string) => change({ weaponForm })}
          />
          {weapon.weaponForm === "Other" && (
            <Field
              label="GM form exception"
              id="weapon-form-exception"
              value={weapon.formException}
              placeholder="Why this surface can take Weapon Runes"
              onChange={(formException: string) => change({ formException })}
            />
          )}
        </>
      ) : (
        <>
          <Check
            checked={weapon.dwarfArtillery}
            onChange={(dwarfArtillery: boolean) => change({ dwarfArtillery })}
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
              <WeaponReferenceName name={r.name} reference={runeReference(r)} />
              <small className="weapon-reference-source">
                {r.master ? "Master Rune · " : ""}
                {sourceLabel(R, r)} · Fourth Edition reference · {r.sl} forging
                SL
              </small>
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
                      x.id === r.contentId ? { ...x, count: Number(v) } : x,
                    ),
                  })
                }
              />
              {["Grudge Rune", "Master Rune of the Slayer"].includes(
                r.name,
              ) && (
                <Field
                  label={`${r.name} target`}
                  id={`weapon-rune-target-${runeKeyForId(selection.id)}`}
                  value={selection.target}
                  onChange={(target: string) =>
                    change({
                      runes: weapon.runes.map((x: any) =>
                        x.id === selection.id ? { ...x, target } : x,
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
                  runes: weapon.runes.filter((x: any) => x.id !== selection.id),
                })
              }
            >
              Remove
            </Button>
          </div>
        );
      })}

      <p className="gm-small">
        Runic items are magical. Pride and Jealousy can suppress matching items
        within 100 yards; resolve their age and circumstances during play.
        Owning this weapon does not teach its runes.
      </p>
      {matchingRunes && (
        <p className="weapon-confirm">
          This NPC carries a matching rune combination or Master Rune. Check
          Pride and Jealousy before using both.
        </p>
      )}
    </>
  );
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
          <div className="weapon-builder-context">
            <span>For {result.name || draft.name || "this NPC"}</span>
            <span>Changes stay in this dialog until saved</span>
          </div>
          <div
            className={`weapon-dialog-body ${choosingBase ? "is-catalogue" : ""}`}
            ref={root}
          >
            {weapon && !choosingBase && (
              <nav className="weapon-builder-nav" aria-label="Weapon sections">
                <div className="weapon-base-record">
                  <span>Based on</span>
                  <strong>{weapon.base.name}</strong>
                  <small>
                    {sourceLabel(R, { source: weapon.base.source })}
                  </small>
                  <Button onClick={changeBase}>Change base</Button>
                </div>
                {(
                  [
                    ["details", "Details", "Name & profile"],
                    ["properties", "Properties", "Qualities & craftsmanship"],
                    ["power", "Power", "Ordinary, magical or runic"],
                    ["review", "Review", "The finished weapon"],
                  ] as const
                ).map(([key, label, hint]) => (
                  <Button
                    key={key}
                    aria-current={panel === key ? "page" : undefined}
                    onClick={() => openPanel(key, true)}
                  >
                    <span>
                      <strong>{label}</strong>
                      <small>{hint}</small>
                    </span>
                    {sectionIssues(key) > 0 && (
                      <span
                        className="weapon-nav-count"
                        aria-label={`${sectionIssues(key)} choices to finish`}
                      >
                        {sectionIssues(key)}
                      </span>
                    )}
                  </Button>
                ))}
              </nav>
            )}
            <div className="weapon-editor-scroll">
              {choosingBase ? (
                <section
                  className="weapon-catalogue"
                  aria-labelledby="weapon-catalogue-title"
                >
                  <div className="weapon-panel-heading">
                    <div>
                      <h3 id="weapon-catalogue-title">
                        Choose your starting weapon
                      </h3>
                      <p>
                        Start from a published profile. Make it your own next.
                      </p>
                    </div>
                    {weapon && (
                      <Button
                        onClick={() => {
                          setPendingBase("");
                          openPanel(panel, true);
                        }}
                      >
                        Back to weapon
                      </Button>
                    )}
                  </div>
                  <div className="weapon-catalogue-tools">
                    <Field
                      label="Find a base weapon"
                      id="weapon-base-search"
                      type="search"
                      placeholder="Search names or books…"
                      value={query}
                      onChange={(value: string) => {
                        setQuery(value);
                        setBaseLimit(24);
                      }}
                    />
                    <div className="weapon-catalogue-filter-row">
                      <div
                        className="weapon-filter-buttons"
                        role="group"
                        aria-label="Base weapon type"
                      >
                        {[
                          ["", "All"],
                          ["melee", "Melee"],
                          ["ranged", "Ranged"],
                        ].map(([value, label]) => (
                          <Button
                            key={value}
                            aria-pressed={kind === value}
                            onClick={() => {
                              setKind(value);
                              setGroup("");
                              setBaseLimit(24);
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                      <Select
                        label="Weapon group"
                        id="weapon-base-group"
                        value={group}
                        options={[
                          ["", "All groups"],
                          ...groups.map((g) => [g, g]),
                        ]}
                        onChange={(value: string) => {
                          setGroup(value);
                          setBaseLimit(24);
                        }}
                      />
                    </div>
                  </div>
                  <p className="weapon-result-count" role="status">
                    {bases.length} {bases.length === 1 ? "weapon" : "weapons"}
                    {query || kind || group
                      ? " matching your filters"
                      : " available"}
                  </p>
                  <div className="weapon-base-columns" aria-hidden="true">
                    <span>Weapon / source</span>
                    <span>Group</span>
                    <span>Damage</span>
                    <span>Reach / range</span>
                  </div>
                  <div className="weapon-base-list">
                    {bases.slice(0, baseLimit).map((base: any) => (
                      <div className="weapon-base-choice" key={base.contentId}>
                        <Button
                          className="weapon-base-row"
                          aria-label={`Choose ${base.name} · ${sourceLabel(R, base)}`}
                          aria-pressed={
                            (pendingBase || weapon?.baseId) === base.contentId
                          }
                          onClick={(event) => {
                            baseOpener.current = event.currentTarget;
                            chooseBase(base.contentId);
                          }}
                        >
                          <span className="weapon-base-name">
                            <strong>{base.name}</strong>
                            <small>
                              {sourceLabel(R, base)}
                              {pendingBase === base.contentId
                                ? " · Selected"
                                : weapon?.baseId === base.contentId
                                  ? " · Current base"
                                  : ""}
                            </small>
                          </span>
                          <span className="weapon-base-group">
                            {base.group}
                          </span>
                          <span className="weapon-base-stat">
                            <small>Damage</small>
                            {base.damage || "—"}
                          </span>
                          <span className="weapon-base-stat">
                            <small>
                              {base.kind === "melee" ? "Reach" : "Range"}
                            </small>
                            {base.reach || "—"}
                          </span>
                        </Button>
                        {pendingBase === base.contentId && (
                          <div
                            className="weapon-confirm"
                            role="group"
                            aria-label="Replace base profile"
                          >
                            <strong>Use {base.name} as the base?</strong>
                            <p>
                              The profile, properties and powers will reset.
                              Your name, notes, quantity and dice history stay.
                            </p>
                            <div className="weapon-actions">
                              <Button className="primary" onClick={replaceBase}>
                                Replace base
                              </Button>
                              <Button
                                onClick={() => {
                                  setPendingBase("");
                                  requestAnimationFrame(() =>
                                    baseOpener.current?.focus({
                                      preventScroll: true,
                                    }),
                                  );
                                }}
                              >
                                Keep current base
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {!bases.length && (
                    <div className="weapon-empty">
                      <h4>No weapons match</h4>
                      <p>Try a shorter name or clear the filters.</p>
                      <Button
                        onClick={() => {
                          setQuery("");
                          setKind("");
                          setGroup("");
                        }}
                      >
                        Clear filters
                      </Button>
                    </div>
                  )}
                  {baseLimit < bases.length && (
                    <Button
                      className="weapon-load-more"
                      onClick={() => setBaseLimit((limit) => limit + 24)}
                    >
                      Show more weapons ({bases.length - baseLimit} remaining)
                    </Button>
                  )}
                </section>
              ) : (
                weapon && (
                  <>
                    <WeaponPane
                      id="details"
                      title={`Customise ${weapon.base.name}`}
                      intro={`Selected base from ${sourceLabel(R, { source: weapon.base.source })}. Give it a name, keep the printed profile or adjust it for this weapon.`}
                      hidden={panel !== "details"}
                    >
                      <div className="weapon-name-row">
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
                          value={weapon.quantity}
                          onChange={(value: string) =>
                            change({ quantity: Number(value) })
                          }
                        />
                      </div>
                      <div className="weapon-subheading">
                        <h4>Profile</h4>
                        <Button
                          onClick={() => setProfileEditing((value) => !value)}
                          aria-expanded={profileEditing}
                          aria-controls="weapon-profile"
                        >
                          {profileEditing
                            ? "Done editing profile"
                            : "Edit profile"}
                        </Button>
                      </div>
                      {!profileEditing && (
                        <dl className="weapon-profile-overview">
                          {[
                            [
                              "Type",
                              weapon.kind === "melee" ? "Melee" : "Ranged",
                            ],
                            ["Group", weapon.group],
                            ["Hands", weapon.hands],
                            ["Damage formula", weapon.damage],
                            [
                              weapon.kind === "melee" ? "Reach" : "Range",
                              weapon.reach,
                            ],
                            ["Base Encumbrance", weapon.enc ?? "Unknown"],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <dt>{label}</dt>
                              <dd>{value || "—"}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      <div id="weapon-profile" hidden={!profileEditing}>
                        {renderProfile()}
                      </div>
                      <div className="weapon-notes-field">
                        <label htmlFor="weapon-notes">
                          Printed notes <small>Optional</small>
                        </label>
                        <textarea
                          id="weapon-notes"
                          aria-label="Printed weapon notes"
                          rows={4}
                          maxLength={10000}
                          value={weapon.notes}
                          placeholder="A description or additional rules to keep with this weapon…"
                          onChange={(event) =>
                            change({ notes: event.target.value })
                          }
                        />
                      </div>
                    </WeaponPane>
                    <WeaponPane
                      id="properties"
                      title="Properties & craftsmanship"
                      intro="Keep the base weapon’s properties, remove them, or add a sourced quality."
                      hidden={panel !== "properties"}
                    >
                      <section
                        id="weapon-properties"
                        aria-label="Selected properties"
                      >
                        <div className="weapon-subheading">
                          <h4>On this weapon</h4>
                          <span>{weapon.properties.length} selected</span>
                        </div>
                        {weapon.properties.length ? (
                          renderProperties()
                        ) : (
                          <p className="weapon-empty-inline">
                            No properties on this weapon.
                          </p>
                        )}
                        <WeaponMessages target="#weapon-properties" />
                      </section>
                      <section
                        className="weapon-option-library"
                        aria-label="Property library"
                      >
                        <div className="weapon-subheading">
                          <h4>Add a property</h4>
                        </div>
                        <div
                          className="weapon-filter-buttons"
                          role="group"
                          aria-label="Property type"
                        >
                          {[
                            ["Weapon", "Weapon properties"],
                            ["Item", "Craftsmanship"],
                          ].map(([value, label]) => (
                            <Button
                              key={value}
                              aria-pressed={propertyFamily === value}
                              onClick={() => setPropertyFamily(value)}
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                        <Field
                          label="Find a property"
                          id="weapon-property-search"
                          type="search"
                          value={propertyQuery}
                          placeholder="Search properties…"
                          onChange={setPropertyQuery}
                        />
                        <div className="weapon-option-list">
                          {propertyOptions.map((entry: any) => {
                            const selected = weapon.properties.some(
                              (token: string) =>
                                weaponPropertyName(token) ===
                                weaponPropertyName(entry.name),
                            );
                            return (
                              <OptionRow
                                key={entry.id}
                                name={entry.name}
                                source={sourceLabel(R, entry)}
                                reference={propertyReference(entry)}
                                action={
                                  <Button
                                    disabled={selected}
                                    aria-label={`Add ${entry.name} property`}
                                    onClick={() => addProperty(entry.id)}
                                  >
                                    {selected ? "Added" : "Add"}
                                  </Button>
                                }
                              />
                            );
                          })}
                        </div>
                        {!propertyOptions.length && (
                          <p className="weapon-empty-inline">
                            No matching properties. Try another name.
                          </p>
                        )}
                      </section>
                    </WeaponPane>
                    <WeaponPane
                      id="power"
                      title="Weapon power"
                      intro="Choose the kind of weapon you are creating. Only the relevant options appear below."
                      hidden={panel !== "power"}
                    >
                      <fieldset
                        id="weapon-power"
                        className="weapon-power-choices"
                      >
                        <legend className="sr-only">Weapon power</legend>
                        {["ordinary", "magical", "runic"].map((value) => (
                          <label
                            key={value}
                            className={
                              weapon.power === value ? "is-selected" : ""
                            }
                          >
                            <input
                              type="radio"
                              name="weapon-power"
                              value={value}
                              aria-label={
                                value[0].toUpperCase() + value.slice(1)
                              }
                              checked={weapon.power === value}
                              onChange={() => setPower(value)}
                            />
                            <span>
                              <strong>
                                {value[0].toUpperCase() + value.slice(1)}
                              </strong>
                              <small>{powerDescriptions[value]}</small>
                            </span>
                          </label>
                        ))}
                      </fieldset>
                      <WeaponMessages target="#weapon-power" />
                      {pendingPower && (
                        <div
                          className="weapon-confirm"
                          role="group"
                          aria-label="Change weapon power"
                        >
                          <strong>Switch to {pendingPower}?</strong>
                          <p>
                            The current enchantments or runes will be removed.
                            The base profile stays.
                          </p>
                          <div className="weapon-actions">
                            <Button
                              className="primary"
                              onClick={() => switchPower(pendingPower)}
                            >
                              Change power
                            </Button>
                            <Button onClick={() => setPendingPower("")}>
                              Keep editing
                            </Button>
                          </div>
                        </div>
                      )}
                      {weapon.power === "ordinary" && (
                        <div className="weapon-ordinary-note">
                          <h4>Ready as an ordinary weapon</h4>
                          <p>
                            No extra powers are needed. Add properties in the
                            Properties section, or review the finished attack.
                          </p>
                          <Button onClick={() => openPanel("review", true)}>
                            Review weapon
                          </Button>
                        </div>
                      )}
                      {weapon.power === "magical" && (
                        <>
                          <div className="weapon-subheading">
                            <div>
                              <h4>
                                {weapon.legendary
                                  ? "Legendary enchantments"
                                  : "Enchantments"}
                              </h4>
                              <p>
                                {weapon.effects.length +
                                  Number(
                                    !!weapon.customEffect.text.trim(),
                                  )}{" "}
                                / 5 abilities
                              </p>
                            </div>
                            <Button
                              className="primary"
                              onClick={rollEnchantment}
                            >
                              {weapon.effects.length
                                ? "Reroll enchantment"
                                : "Roll enchantment"}
                            </Button>
                          </div>
                          <p className="weapon-help">
                            Choose abilities below or roll. Reroll replaces the
                            selection; 00 resolves its follow-up rolls
                            automatically.
                          </p>
                          {weapon.legendary && weapon.effects.length <= 1 && (
                            <Button
                              onClick={() => change({ legendary: false })}
                            >
                              Remove Legendary status
                            </Button>
                          )}
                          {renderEnchantments()}
                          <section
                            className="weapon-option-library"
                            aria-label="Enchantment library"
                          >
                            <Field
                              label="Find an enchantment"
                              id="weapon-effect-select"
                              type="search"
                              placeholder="Search enchantments…"
                              value={effectQuery}
                              onChange={setEffectQuery}
                            />
                            <div className="weapon-option-list">
                              {magicOptions.map((entry: any) => (
                                <OptionRow
                                  key={entry.id}
                                  name={entry.name}
                                  source={`Archives II · p. ${entry.page}`}
                                  reference={enchantmentReference(entry)}
                                  action={
                                    <Button
                                      disabled={
                                        weapon.effects.length +
                                          Number(
                                            !!weapon.customEffect.text.trim(),
                                          ) >=
                                        5
                                      }
                                      aria-label={`Add ${entry.name} enchantment`}
                                      onClick={() => addEffect(entry.id)}
                                    >
                                      Add
                                    </Button>
                                  }
                                />
                              ))}
                            </div>
                            {!magicOptions.length && (
                              <p className="weapon-empty-inline">
                                No matching enchantments available.
                              </p>
                            )}
                          </section>
                        </>
                      )}
                      {weapon.power === "runic" && (
                        <>
                          <div className="weapon-subheading">
                            <h4>Rune inscriptions</h4>
                            <span>{count} / 3 · at most one Master Rune</span>
                          </div>
                          {renderRunes()}
                          <section
                            className="weapon-option-library"
                            aria-label="Rune library"
                          >
                            <Field
                              label="Find a rune"
                              id="weapon-rune-select"
                              type="search"
                              placeholder="Search eligible runes…"
                              value={runeQuery}
                              onChange={setRuneQuery}
                            />
                            <div className="weapon-option-list">
                              {runeOptions.map((entry: any) => (
                                <OptionRow
                                  key={entry.contentId || entry.id}
                                  name={entry.name}
                                  source={`${sourceLabel(R, entry)} · ${entry.sl} forging SL`}
                                  reference={runeReference(entry)}
                                  action={
                                    <Button
                                      disabled={count >= 3}
                                      aria-label={`Inscribe ${entry.name}`}
                                      onClick={() =>
                                        addRune(entry.contentId || entry.id)
                                      }
                                    >
                                      Inscribe
                                    </Button>
                                  }
                                />
                              ))}
                            </div>
                            {!runeOptions.length && (
                              <p className="weapon-empty-inline">
                                No matching eligible runes. Check the form and
                                filters.
                              </p>
                            )}
                          </section>
                        </>
                      )}
                    </WeaponPane>
                    <WeaponPane
                      id="review"
                      title="Review weapon"
                      intro="This is the attack and equipment that will be added to the NPC."
                      hidden={panel !== "review"}
                    >
                      <article
                        className="weapon-finished-record"
                        aria-label="Weapon preview"
                      >
                        <h4>{customWeaponName(weapon) || "Unnamed weapon"}</h4>
                        <p>
                          {weapon.kind === "melee" ? "Melee" : "Ranged"} (
                          {weapon.group}) · {weapon.hands} hand
                          {weapon.hands === 2 ? "s" : ""} · Quantity{" "}
                          {weapon.quantity}
                        </p>
                        <AttackReadout
                          preview={preview}
                          derived={derived}
                          weapon={weapon}
                        />
                        <p className="weapon-finished-properties">
                          {derived?.properties.join(", ") || "No properties"}
                        </p>
                        <p className="weapon-help">
                          Based on {weapon.base.name} ·{" "}
                          {sourceLabel(R, { source: weapon.base.source })}
                        </p>
                        {derived && derived.calculated.length > 0 && (
                          <section>
                            <h5>Included in the calculation</h5>
                            <ul>
                              {derived.calculated.map((line: string) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          </section>
                        )}
                        {derived && derived.details.length > 0 && (
                          <section>
                            <h5>Special effects & sources</h5>
                            {derived.details.map((line: string) => (
                              <p key={line}>{line}</p>
                            ))}
                          </section>
                        )}
                        {derived?.ammunition && (
                          <p>
                            {derived.ammunition.quantity} × Hoarfrost
                            ammunition. The launcher keeps its ordinary profile.
                          </p>
                        )}
                        {weapon.notes && (
                          <section>
                            <h5>Printed notes</h5>
                            <p className="weapon-preserve-lines">
                              {weapon.notes}
                            </p>
                          </section>
                        )}
                        <p className="weapon-help">
                          Conditional effects and recovery are resolved during
                          play.
                        </p>
                      </article>
                      {problems.length > 0 && (
                        <section className="weapon-review-issues">
                          <h4>Choices to finish</h4>
                          {problems.map((issue: WeaponIssue, index: number) => (
                            <Button
                              key={`${issue.target}:${index}`}
                              onClick={() => focusIssue(issue)}
                            >
                              {issue.message}
                            </Button>
                          ))}
                        </section>
                      )}
                      <div className="weapon-reference-section">
                        {" "}
                        <Details id="weapon-rules" title="Rules & crafting">
                          <div className="weapon-actions">
                            {["Crafting", "Commission", "Invent!"].map(
                              (name) => (
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
                              ),
                            )}
                          </div>
                          <p>
                            Core pp. 197–199: Commission, Crafting and Invent!
                            guide making an item. Crafting uses an Extended
                            Trade Test, one roll per Endeavour; Availability
                            guides Difficulty and listed price guides required
                            SL. Each Flaw halves required SL, then each Quality
                            adds +5 SL. These rules do not assign balanced
                            statistics to a new weapon.
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
                      </div>
                    </WeaponPane>
                  </>
                )
              )}
            </div>
          </div>
          <footer className="weapon-dialog-footer">
            {weapon && !choosingBase ? (
              <AttackReadout
                preview={preview}
                derived={derived}
                weapon={weapon}
              />
            ) : (
              <p className="weapon-help">
                {weapon
                  ? "Replacing a base resets its profile and powers."
                  : "Choose a published weapon to begin."}
              </p>
            )}
            <div className="weapon-commit">
              {error ? (
                <p className="weapon-runtime-error" role="alert">
                  {error}
                </p>
              ) : (
                !choosingBase && (
                  <div className="weapon-save-status" role="status">
                    {pendingPower ? (
                      "Confirm the power change."
                    ) : problems.length ? (
                      <Button
                        className="weapon-issue-link"
                        onClick={() => focusIssue(problems[0])}
                      >
                        {problems.length}{" "}
                        {problems.length === 1 ? "choice" : "choices"} to finish
                      </Button>
                    ) : initial ? (
                      "Save to apply your changes"
                    ) : (
                      "Adds an attack and a Gear item"
                    )}
                  </div>
                )
              )}
              <div className="weapon-actions">
                <Button onClick={close}>Cancel</Button>
                {weapon && !choosingBase && (
                  <Button
                    type="submit"
                    className="primary"
                    disabled={
                      !!problems.length || !!pendingPower || !!pendingBase
                    }
                  >
                    {initial ? "Save changes" : "Add weapon"}
                  </Button>
                )}
              </div>
            </div>
          </footer>
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

type WeaponPanel = "details" | "properties" | "power" | "review";
function WeaponPane({
  id,
  title,
  intro,
  hidden,
  children,
}: {
  id: WeaponPanel;
  title: string;
  intro: string;
  hidden: boolean;
  children: ReactNode;
}) {
  return (
    <section className="weapon-panel" data-weapon-panel={id} hidden={hidden}>
      <div className="weapon-panel-heading">
        <div>
          <h3 tabIndex={-1}>{title}</h3>
          <p>{intro}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
function OptionRow({
  name,
  source,
  reference,
  action,
}: {
  name: string;
  source: string;
  reference: ReferenceRequest;
  action: ReactNode;
}) {
  return (
    <div className="weapon-option-row">
      <div>
        <WeaponReferenceName name={name} reference={reference} />
        <small>{source}</small>
      </div>
      {action}
    </div>
  );
}
function WeaponReferenceName({
  name,
  reference,
}: {
  name: string;
  reference: ReferenceRequest;
}) {
  return (
    <Button
      className="weapon-reference-name"
      aria-label={`Read ${name}`}
      aria-haspopup="dialog"
      onClick={() => requestReference(reference)}
    >
      {name}
    </Button>
  );
}
function propertyReference(entry: any): ReferenceRequest {
  return {
    kind: "property",
    name: entry.name,
    id: entry.id,
    book: entry.source.book,
  };
}
function runeReference(entry: any): ReferenceRequest {
  return {
    kind: "magic",
    name: entry.name,
    id: entry.contentId || entry.id,
    book: entry.source.book,
  };
}
function enchantmentReference(entry: any): ReferenceRequest {
  return {
    kind: "magic",
    name: entry.name,
    id: entry.id,
    book: "archives-ii",
    quote: {
      text: [entry.text, entry.adaptation].filter(Boolean).join("\n\n"),
      source: { book: "archives-ii", page: entry.page },
      label: "Weapon enchantment",
    },
  };
}
function AttackReadout({
  preview,
  derived,
  weapon,
}: {
  preview: any;
  derived: any;
  weapon: any;
}) {
  return (
    <dl className="weapon-attack-readout" aria-label="Calculated attack">
      {[
        ["Attack", preview?.skill ?? "—"],
        ["Damage", preview?.damage == null ? "—" : `+${preview.damage}`],
        [weapon.kind === "melee" ? "Reach" : "Range", weapon.reach || "—"],
        ["Enc.", derived?.enc ?? "Unknown"],
      ].map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
