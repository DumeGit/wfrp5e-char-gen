import { KEYS } from "../../engine/rules.mjs";
import { score } from "../../engine/controls.mjs";
import { requestReference } from "../../services/content";
import { EntryList } from "./EntryList";
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
  navigate: (section: string) => void;
  disabled: boolean;
};
export function PlaySheet({
  record,
  result,
  catalogue,
  edit,
  open,
  navigate,
  disabled,
}: Props) {
  const scoreLength = Math.max(
    ...KEYS.map((key: string) => score(result.stats[key]).length),
  );
  const groups = ["skills", "talents", "magic", "extras"].map((group) => ({
    group,
    rows: (group === "skills" ? result.skills : result.entries[group]).filter(
      (entry: any) => entry.favourite,
    ),
  }));
  const weapons = result.equipment.weapons.filter(
    (entry: any) => entry.placement === "equipped",
  );
  const shield = result.values.shield !== null && result.values.shield > 0;
  return (
    <div className="manager-play">
      <SheetCard
        title="Combat"
        className="manager-play-combat"
        mobileOpen
        actions={
          <button
            className="quiet"
            type="button"
            onClick={() => navigate("gear")}
          >
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
      <div className="manager-play-context">
        <SheetCard
          title="Favourites"
          className="manager-play-favourites"
          mobileOpen
          count={groups.reduce((sum, group) => sum + group.rows.length, 0)}
          actions={
            <button
              className="quiet"
              type="button"
              onClick={() => navigate("abilities")}
            >
              Browse abilities
            </button>
          }
        >
          {groups.some((group) => group.rows.length) ? (
            groups
              .filter((group) => group.rows.length)
              .map(({ group, rows }) => (
                <EntryList
                  key={group}
                  {...{ catalogue, record, result, edit, open, group, rows }}
                  compact
                />
              ))
          ) : (
            <p className="manager-empty-line">
              Use the star beside an ability to keep it here.
            </p>
          )}
        </SheetCard>

        <SheetCard
          title="Conditions"
          className="manager-play-conditions"
          count={record.conditions.length}
          mobileOpen={record.conditions.length > 0}
          actions={
            <button
              className="quiet"
              type="button"
              onClick={() =>
                open("condition", { amount: 1, name: "", note: "" })
              }
            >
              Record Condition
            </button>
          }
        >
          {record.conditions.length ? (
            record.conditions.map((entry: any) => (
              <div className="manager-condition" key={entry.id}>
                <div>
                  <strong>
                    {entry.name} ×{score(entry.amount)}
                  </strong>
                  {entry.note && <p>{entry.note}</p>}
                </div>
                <div className="manager-inline">
                  <button
                    className="manager-text"
                    type="button"
                    onClick={() =>
                      requestReference({ kind: "condition", name: entry.name })
                    }
                  >
                    Rule
                  </button>
                  <button
                    className="manager-text"
                    type="button"
                    aria-label={`Remove ${entry.name} Condition`}
                    onClick={() =>
                      edit("Removed Condition", (r) => {
                        r.conditions = r.conditions.filter(
                          (condition: any) => condition.id !== entry.id,
                        );
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="manager-empty-line">No active Conditions.</p>
          )}
        </SheetCard>
        <SheetCard
          title="In the field"
          className="manager-play-facts"
          actions={
            <button
              className="quiet"
              type="button"
              onClick={() =>
                open("journal", { title: "", text: "", kind: "Session" })
              }
            >
              Add session note
            </button>
          }
        >
          <dl className="manager-facts">
            {[
              [
                "Enc / capacity",
                `${score(result.values.enc)} / ${score(result.values.capacity)}`,
              ],
              ["Corruption", record.sheet.corruption],
              ["Sin", record.sheet.sin],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt>{label}</dt>
                <dd>{typeof value === "number" ? score(value) : value}</dd>
              </div>
            ))}
          </dl>
        </SheetCard>
      </div>
      <SheetCard title="Characteristics" className="manager-play-stats">
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
