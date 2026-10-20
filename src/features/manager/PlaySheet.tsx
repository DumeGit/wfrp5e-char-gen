import { KEYS } from "../../engine/rules.mjs";
import { score } from "../../engine/controls.mjs";
import { requestReference } from "../../services/content";
import { EntryList } from "./EntryList";
import type { Edit } from "./ui";
import type { CSSProperties } from "react";

export function PlaySheet({
  record,
  result,
  catalogue,
  edit,
  open,
  navigate,
}: {
  record: any;
  result: any;
  catalogue: any;
  edit: Edit;
  open: (kind: string, values?: Record<string, any>) => void;
  navigate: (section: string) => void;
}) {
  const sheet = record.sheet;
  const scoreLength = Math.max(
    ...KEYS.map((key: string) => score(result.stats[key]).length),
  );
  const groups = ["skills", "talents", "magic", "extras"].map((group) => ({
    group,
    rows: (group === "skills" ? result.skills : result.entries[group]).filter(
      (x: any) => x.favourite,
    ),
  }));
  const weapons = result.equipment.weapons.filter(
    (x: any) => x.placement === "equipped",
  );
  const shield = result.values.shield !== null && result.values.shield > 0;
  return (
    <div className="manager-play">
      <section className="manager-play-stats">
        <h2 className="manager-section-title">Characteristics</h2>
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
      </section>
      <section className="manager-play-conditions">
        <div className="manager-section-heading">
          <h2>Conditions</h2>
          <button
            className="quiet"
            type="button"
            onClick={() => open("condition", { amount: 1, name: "", note: "" })}
          >
            Record Condition
          </button>
        </div>
        {record.conditions.length ? (
          record.conditions.map((x: any) => (
            <div className="manager-condition" key={x.id}>
              <div>
                <strong>
                  {x.name} ×{score(x.amount)}
                </strong>
                {x.note && <p>{x.note}</p>}
              </div>
              <div className="manager-inline">
                <button
                  className="manager-text"
                  type="button"
                  onClick={() =>
                    requestReference({ kind: "condition", name: x.name })
                  }
                >
                  Rule
                </button>
                <button
                  className="manager-text"
                  type="button"
                  aria-label={`Remove ${x.name} Condition`}
                  onClick={() =>
                    edit("Removed Condition", (r) => {
                      r.conditions = r.conditions.filter(
                        (c: any) => c.id !== x.id,
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
      </section>
      <section className="manager-play-attacks">
        <div className="manager-section-heading">
          <h2>Ready attacks</h2>
          <button
            className="quiet"
            type="button"
            onClick={() => navigate("gear")}
          >
            Manage gear
          </button>
        </div>
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
              {weapons.map((x: any) => (
                <tr key={x.key}>
                  <th scope="row">
                    {x.label}
                    {x.qualities && (
                      <span className="manager-table-note">{x.qualities}</span>
                    )}
                  </th>
                  <td>
                    <strong>
                      {x.attackScore === null
                        ? "Untrained"
                        : score(x.attackScore)}
                    </strong>
                    <span className="manager-table-note">{x.attackSkill}</span>
                  </td>
                  <td>{x.damage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="manager-empty-line">
            No equipped weapons. Choose equipment in Gear.
          </p>
        )}
      </section>
      <section className="manager-play-favourites">
        <div className="manager-section-heading">
          <h2>Favourites</h2>
          <button
            className="quiet"
            type="button"
            onClick={() => navigate("abilities")}
          >
            Browse abilities
          </button>
        </div>
        {groups.some((x) => x.rows.length) ? (
          groups
            .filter((x) => x.rows.length)
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
      </section>
      <section className="manager-play-protection">
        <h2 className="manager-section-title">Protection</h2>
        <table className="manager-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>AP</th>
              <th>Soak</th>
              {shield && <th>With shield</th>}
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
                {shield && (
                  <td>
                    {result.values[key] === null
                      ? "—"
                      : score(
                          result.tb + result.values[key] + result.values.shield,
                        )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {shield && (
          <p className="manager-meta">
            Shield totals apply only while opposing with Dodge/Melee.
          </p>
        )}
      </section>
      <section className="manager-play-facts">
        <h2 className="manager-section-title">In the field</h2>
        <dl className="manager-facts">
          {[
            [
              "Movement",
              result.equipment.penalties.complete
                ? result.equipment.penalties.movement
                : result.values.movement,
            ],
            [
              "Enc / capacity",
              `${score(result.values.enc)} / ${score(result.values.capacity)}`,
            ],
            ["Fate", sheet.fate],
            ["Corruption", sheet.corruption],
            ["Sin", sheet.sin],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <dt>{label}</dt>
              <dd>{typeof value === "number" ? score(value) : value}</dd>
            </div>
          ))}
        </dl>
        <button
          className="quiet"
          type="button"
          onClick={() =>
            open("journal", { title: "", text: "", kind: "Session" })
          }
        >
          Add session note
        </button>
      </section>
      {result.warnings.length > 0 && (
        <details className="manager-entry manager-play-notes">
          <summary>
            <strong>Calculation notes ({result.warnings.length})</strong>
          </summary>
          {result.warnings.map((warning: string, i: number) => (
            <p key={i}>{warning}</p>
          ))}
        </details>
      )}
    </div>
  );
}
