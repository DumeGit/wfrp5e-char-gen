import { KEYS } from "../../engine/rules.mjs";
import { score } from "../../engine/controls.mjs";
import { AbilitiesScreen, GearScreen } from "./CharacterScreens";
import { StatusCard } from "./StatusCard";
import { useEffect, useState } from "react";
import { SheetCard } from "./SheetCard";
import { WoundsControl } from "./ResourceBand";
import type { Edit } from "./ui";
import type { CSSProperties } from "react";

type Props = {
  record: any;
  result: any;
  catalogue: any;
  edit: Edit;
  open: (kind: string, values?: Record<string, any>) => void;
  advance: (group?: string, name?: string) => void;
  initialView?: string;
  disabled: boolean;
};
export function PlaySheet({
  record,
  result,
  catalogue,
  edit,
  open,
  advance,
  initialView,
  disabled,
}: Props) {
  const scoreLength = Math.max(
    ...KEYS.map((key: string) => score(result.stats[key]).length),
  );
  const [reveals, setReveals] = useState<Record<string, number>>({});
  const jump = (name: string) => {
    setReveals((old) => ({ ...old, [name]: (old[name] || 0) + 1 }));
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const target = document.getElementById(`manager-${name}`);
        target
          ?.querySelector<HTMLButtonElement>(".manager-card-toggle")
          ?.focus({ preventScroll: true });
        target?.scrollIntoView({ block: "start" });
      }),
    );
  };
  useEffect(() => {
    if (
      ["abilities", "gear", "characteristics", "status"].includes(
        initialView || "",
      )
    )
      jump(initialView!);
  }, [initialView]);
  const weapons = result.equipment.weapons.filter(
    (entry: any) => entry.placement === "equipped",
  );
  const shield = result.values.shield !== null && result.values.shield > 0;
  return (
    <div className="manager-play">
      <SheetCard
        title="Combat"
        id="manager-combat"
        reveal={reveals.combat}
        className="manager-play-combat"
        mobileOpen
        actions={
          <button className="quiet" type="button" onClick={() => jump("gear")}>
            Manage gear
          </button>
        }
      >
        <div className="manager-combat-vitals">
          <WoundsControl {...{ record, result, edit, open, disabled }} />
          <div className="manager-combat-movement">
            <span>Movement</span>
            <strong>
              {score(
                result.equipment.penalties.complete
                  ? result.equipment.penalties.movement
                  : result.values.movement,
              )}
            </strong>
          </div>
        </div>
        <h3>Ready attacks</h3>
        {weapons.length ? (
          <table className="manager-table manager-attacks">
            <thead>
              <tr>
                <th>Weapon</th>
                <th>Skill</th>
                <th>Damage</th>
              </tr>
            </thead>
            <tbody>
              {weapons.map((entry: any) => (
                <tr key={entry.key}>
                  <th scope="row">
                    <span className="manager-combat-name" title={entry.label}>
                      {entry.label}
                    </span>
                    {entry.qualities && (
                      <span className="manager-table-note">
                        {entry.qualities}
                      </span>
                    )}
                  </th>
                  <td>
                    <strong>
                      {entry.attackScore === null
                        ? "Untrained"
                        : score(entry.attackScore)}
                    </strong>
                    <span className="manager-table-note">
                      {entry.attackSkill}
                    </span>
                  </td>
                  <td>{entry.damage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="manager-empty-line">
            No equipped weapons. Choose equipment in Gear.
          </p>
        )}
        <h3 className="manager-protection-heading">Protection</h3>
        <dl className="manager-protection-grid">
          {[
            ["head", "Head"],
            ["arms", "Arms"],
            ["body", "Body"],
            ["legs", "Legs"],
          ].map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>
                <strong>{score(result.values[key])}</strong> AP{" "}
                <span>
                  {result.values[key] === null
                    ? "—"
                    : score(result.tb + result.values[key])}{" "}
                  soak
                </span>
              </dd>
              {shield && (
                <dd className="manager-shield-soak">
                  {result.values[key] === null
                    ? "—"
                    : score(
                        result.tb + result.values[key] + result.values.shield,
                      )}{" "}
                  with shield
                </dd>
              )}
            </div>
          ))}
        </dl>
        {shield && (
          <p className="manager-meta">
            Shield totals apply only while opposing with Dodge/Melee.
          </p>
        )}
      </SheetCard>
      <StatusCard
        {...{ record, result, catalogue, edit, open }}
        reveal={reveals.status || 0}
      />
      <AbilitiesScreen
        {...{ record, result, catalogue, edit, open, advance }}
        reveal={reveals.abilities || 0}
      />
      <GearScreen
        {...{ record, result, catalogue, edit, open, advance }}
        reveal={reveals.gear || 0}
      />
      <SheetCard
        title="Characteristics"
        id="manager-characteristics"
        reveal={reveals.characteristics}
        className="manager-play-stats"
      >
        <dl
          className="manager-stats"
          data-wide={scoreLength > 4 ? "true" : undefined}
          style={
            {
              "--manager-stat-min": `${scoreLength * 15 + 8}px`,
            } as CSSProperties
          }
        >
          {KEYS.map((key: string) => (
            <div className="manager-stat" key={key}>
              <dt>{key}</dt>
              <dd>
                <button
                  className="manager-stat-button"
                  type="button"
                  aria-label={`${key} ${score(result.stats[key])}: view calculation`}
                  onClick={() => open("stat", { key })}
                >
                  {score(result.stats[key])}
                </button>
              </dd>
            </div>
          ))}
        </dl>
      </SheetCard>
      {result.warnings.length > 0 && (
        <details className="manager-entry manager-play-notes">
          <summary>
            <strong>Calculation notes ({result.warnings.length})</strong>
          </summary>
          {result.warnings.map((warning: string, index: number) => (
            <p key={index}>{warning}</p>
          ))}
        </details>
      )}
    </div>
  );
}
