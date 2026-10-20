import { useEffect, useMemo, useState } from "react";
import { Field, Select } from "../marijan/fields";
import {
  KEYS,
  careerTalentOptions,
  careerSkillSlots,
  options as ruleOptions,
} from "../../engine/rules.mjs";
import { score } from "../../engine/controls.mjs";
import {
  quoteManager,
  purchaseAdvance,
  creditTrapping,
} from "../../engine/manager/model.mjs";
import { date, type Edit } from "./ui";

export function AdvancementScreen({
  catalogue,
  record,
  result,
  edit,
  award,
  career,
  history,
  disabled,
  initialView,
}: {
  catalogue: any;
  record: any;
  result: any;
  edit: Edit;
  award: () => void;
  career: () => void;
  history: () => void;
  disabled: boolean;
  initialView?: string;
}) {
  const [type, setType] = useState("char"),
    [amount, setAmount] = useState(5),
    [query, setQuery] = useState(""),
    [scope, setScope] = useState("career"),
    [limit, setLimit] = useState(25),
    [endeavour, setEndeavour] = useState(false);
  const [trapping, setTrapping] = useState(""),
    [trappingReason, setTrappingReason] = useState("");
  useEffect(() => {
    if (!initialView) return;
    const [kind, ...rest] = initialView.split(":");
    if (["char", "skill", "talent", "career"].includes(kind)) {
      setType(kind);
      setQuery(rest.join(":"));
      setLimit(25);
      if (kind === "skill") setScope("all");
    }
  }, [initialView]);
  const level = Math.min(4, record.sheet.level);
  const slots = careerSkillSlots(result.R, result.context, level);
  const names: string[] =
    type === "char"
      ? KEYS
      : type === "skill"
        ? [
            ...new Set<string>(
              scope === "career"
                ? slots.map((x: any) => x.name)
                : catalogue.rows
                    .filter((x: any) => x.collection === "skills")
                    .map((x: any) => x.name),
            ),
          ].sort((a, b) => a.localeCompare(b))
        : type === "talent"
          ? [
              ...new Set<string>(
                careerTalentOptions(result.R, result.context, level),
              ),
            ].sort((a, b) => a.localeCompare(b))
          : [];
  const matches = names.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  const signature = matches.slice(0, limit).join("\n");
  const quotes = useMemo(
    () =>
      matches.slice(0, limit).map((name) => ({
        name,
        q: quoteManager(catalogue, record, type, name, amount) as any,
      })),
    [catalogue, record, type, amount, signature, limit],
  );
  const promotion =
    type === "career"
      ? quoteManager(catalogue, record, "promotion", "", 5)
      : null;
  const target = [10, 12, 14, 0][record.sheet.level - 1] || 0;
  return (
    <section className="manager-advancement">
      <div className="manager-page-heading">
        <div>
          <h2>Advancement</h2>
          <p className="manager-meta">
            {score(record.sheet.xpSpent)} XP spent · {score(result.xpTotal)}{" "}
            total
          </p>
        </div>
        <div className="manager-xp">
          <strong>
            {score(record.sheet.xpUnspent)} <span>XP available</span>
          </strong>
          <button className="manager-primary" type="button" onClick={award}>
            Award XP
          </button>
        </div>
      </div>
      <div className="manager-career-progress">
        <div>
          <strong>
            {result.career?.name || "Career not entered"} · Level{" "}
            {score(record.sheet.level)}
          </strong>
          <p className="manager-meta">
            {score(result.derived.ticks)} / {target || "—"} boxes this level ·{" "}
            {score(record.sheet.tracker)} / 36 total
          </p>
        </div>
        {target > 0 && (
          <meter
            min="0"
            max={target}
            value={Math.min(target, result.derived.ticks)}
            aria-label="Current Career level progress"
          />
        )}
      </div>
      <div
        className="manager-local-nav"
        role="group"
        aria-label="Advancement categories"
      >
        {[
          ["char", "Characteristics"],
          ["skill", "Skills"],
          ["talent", "Talents"],
          ["career", "Career"],
        ].map(([id, label]) => (
          <button
            className="quiet"
            key={id}
            type="button"
            aria-pressed={type === id}
            onClick={() => {
              setType(id);
              setQuery("");
              setLimit(25);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {type !== "career" && (
        <>
          <div className="manager-advance-filters">
            {type !== "char" && (
              <Field
                id="advance-find"
                label="Find advancement"
                value={query}
                onValue={(value) => {
                  setQuery(value);
                  setLimit(25);
                }}
              />
            )}
            {type === "skill" && (
              <Select
                id="advance-scope"
                label="Show Skills"
                value={scope}
                options={[
                  ["career", "Career Skills"],
                  ["all", "All Skills"],
                ]}
                onValue={(value) => {
                  setScope(value);
                  setLimit(25);
                }}
              />
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
          </div>
          <div className="manager-purchase-head" aria-hidden="true">
            <span>Advance</span>
            <span>Change</span>
            <span>XP cost</span>
            <span />
          </div>
          {quotes.map(({ name, q }) => {
            const entry =
              type === "skill"
                ? result.skills.find((x: any) => x.name === name)
                : type === "talent"
                  ? result.entries.talents.find((x: any) => x.name === name)
                  : null;
            const current =
              type === "char"
                ? result.stats[name]
                : type === "skill"
                  ? (entry?.total ?? null)
                  : entry?.amount || 0;
            const increment = type === "talent" ? 1 : amount;
            return (
              <div className="manager-purchase-row" key={name}>
                <div className="manager-purchase-name">
                  <strong>{name}</strong>
                  {q.inCareer && (
                    <span className="manager-meta">Career advance</span>
                  )}
                  {q.error && (
                    <p className="manager-purchase-error">{q.error}</p>
                  )}
                </div>
                <span className="manager-purchase-change">
                  {current === null
                    ? `+${increment} Advances`
                    : `${score(current)} → ${score(current + increment)}`}
                </span>
                <details className="manager-cost">
                  <summary aria-label={`Cost details for ${name}`}>
                    {q.cost === null ? "—" : `${score(q.cost)} XP`}
                  </summary>
                  <p>
                    {q.cost === null
                      ? q.error
                      : `${score(q.cost)} XP${q.tick ? "; earns a Career tracker box" : "; no Career tracker box"}. Core p. ${q.page}.`}
                  </p>
                </details>
                <button
                  className="quiet manager-buy"
                  type="button"
                  disabled={disabled || !!q.error}
                  aria-label={`Purchase ${name}${type === "talent" ? "" : ` +${amount}`}`}
                  onClick={() =>
                    edit("Purchased advancement", (r) =>
                      purchaseAdvance(catalogue, r, type, name, amount),
                    )
                  }
                >
                  Buy {type === "talent" ? "rank" : `+${amount}`}
                </button>
              </div>
            );
          })}
          {!quotes.length && (
            <p className="manager-empty-line">
              No matching advances. Try another search or check the Career
              choices.
            </p>
          )}
          {matches.length > limit && (
            <button
              type="button"
              className="quiet"
              onClick={() => setLimit(limit + 25)}
            >
              Show 25 more advances
            </button>
          )}
        </>
      )}
      {type === "career" && (
        <div className="manager-career-tools">
          <div className="manager-section-heading">
            <h3>Career progression</h3>
            <button className="quiet" type="button" onClick={career}>
              Change Career
            </button>
          </div>
          <p>
            Advance from level {score(record.sheet.level)} to level{" "}
            {score(record.sheet.level + 1)} in your current Career.
          </p>
          {promotion && (
            <>
              <p>
                {promotion.cost === null
                  ? promotion.error
                  : `${score(promotion.cost)} XP${promotion.error ? ` · ${promotion.error}` : ""}`}
              </p>
              <label className="manager-check">
                <input
                  type="checkbox"
                  checked={endeavour}
                  onChange={(e) => setEndeavour(e.target.checked)}
                />
                Advance Career Endeavour completed (core p. 196)
              </label>
              <button
                className="manager-primary"
                type="button"
                disabled={disabled || !!promotion.error || !endeavour}
                onClick={() => {
                  edit("Purchased advancement", (r) =>
                    purchaseAdvance(
                      catalogue,
                      r,
                      "promotion",
                      "",
                      5,
                      endeavour,
                    ),
                  );
                  setEndeavour(false);
                }}
              >
                Purchase Career promotion
              </button>
            </>
          )}
          <details className="manager-entry">
            <summary>
              <strong>Career Skill specialisations</strong>
            </summary>
            <p>
              Choose the specialisations used for Career advancement
              eligibility.
            </p>
            {slots
              .filter(
                (slot: any) =>
                  ruleOptions(result.R, slot.raw, "skill", result.context)
                    .length > 1,
              )
              .map((slot: any) => (
                <Select
                  key={slot.key}
                  id={`manager-slot-${slot.key}`}
                  label={`Level ${slot.level}: ${slot.raw}`}
                  value={slot.name}
                  options={ruleOptions(
                    result.R,
                    slot.raw,
                    "skill",
                    result.context,
                  )}
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
          <details className="manager-entry">
            <summary>
              <strong>Record a next-level Career Trapping</strong>
            </summary>
            <p>
              Record how it was acquired to earn a tracker box. This does not
              add equipment or charge money again.
            </p>
            <div className="manager-form">
              <Select
                id="manager-trapping"
                label="Next-level Trapping"
                value={trapping}
                options={[
                  ["", "Choose a Trapping"],
                  ...(
                    result.career?.levels[record.sheet.level]?.trappings || []
                  ).map((name: string, index: number) => [String(index), name]),
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
                disabled={disabled || trapping === "" || !trappingReason.trim()}
                onClick={() =>
                  edit("Career Trapping recorded", (r) =>
                    creditTrapping(
                      catalogue,
                      r,
                      Number(trapping),
                      trappingReason,
                    ),
                  )
                }
              >
                Record Trapping acquisition
              </button>
            </div>
          </details>
        </div>
      )}
      <details className="manager-entry manager-purchases">
        <summary>
          <strong>Manager purchases ({record.purchases.length})</strong>
        </summary>
        {record.purchases.length ? (
          <ul className="manager-history">
            {[...record.purchases]
              .reverse()
              .slice(0, 20)
              .map((p: any) => (
                <li key={p.id}>
                  {p.name}
                  {p.amount ? ` +${p.amount}` : ""} · {score(p.cost)} XP ·{" "}
                  {date(p.at)}
                </li>
              ))}
          </ul>
        ) : (
          <p>
            No purchases recorded in the manager. Earlier creation records
            remain historical attachments.
          </p>
        )}
        <button className="manager-text" type="button" onClick={history}>
          View complete history
        </button>
      </details>
    </section>
  );
}
