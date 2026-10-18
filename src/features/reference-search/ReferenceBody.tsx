import { Fragment, type ReactNode } from "react";
import { searchBookText } from "../../engine/book-search-text.mjs";
import { descriptionNotice } from "../../engine/descriptions.mjs";
import { characteristicNames } from "../../engine/ui.mjs";
import { searchBookId } from "../../engine/search-filters.mjs";
import type { ReferenceRow, ReferenceData } from "./library";

type TextRenderer = (text: string) => ReactNode;
export function valueText(value: any): string {
  return Array.isArray(value)
    ? value.map(valueText).join(", ")
    : value === null
      ? "Unresolved"
      : typeof value === "object"
        ? Object.entries(value)
            .map(([key, v]) => `${key}: ${valueText(v)}`)
            .join(" · ")
        : String(value);
}
export function RuleText({
  text,
  renderText,
}: {
  text: string;
  renderText: TextRenderer;
}) {
  return (
    <>
      {String(text || "")
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((block, index) => {
          const lines = block.split("\n");
          const cells = (line: string) =>
            line
              .split("|")
              .slice(1, -1)
              .map((value) => value.trim());
          if (
            lines.length > 2 &&
            lines[0].startsWith("|") &&
            /^\|[\s:|-]+\|$/.test(lines[1])
          ) {
            const headers = cells(lines[0]);
            return (
              <div key={index} className="search-table-wrap">
                <table>
                  {headers.some(Boolean) && (
                    <thead>
                      <tr>
                        {headers.map((cell, i) => (
                          <th key={i}>{renderText(cell)}</th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {lines.slice(2).map((line, i) => (
                      <tr key={i}>
                        {cells(line).map((cell, j) => (
                          <td key={j}>{renderText(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          if (block.startsWith("### "))
            return <h3 key={index}>{block.slice(4)}</h3>;
          if (block.startsWith("• "))
            return (
              <ul key={index}>
                <li>{renderText(block.slice(2))}</li>
              </ul>
            );
          return (
            <p key={index}>
              {lines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {renderText(line)}
                </Fragment>
              ))}
            </p>
          );
        })}
    </>
  );
}
function Fields({
  entry,
  fields,
  renderText,
}: {
  entry: any;
  fields: string[][];
  renderText: TextRenderer;
}) {
  return (
    <dl className="search-profile-fields">
      {fields
        .filter(([key]) => entry[key] !== undefined && entry[key] !== "")
        .map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{renderText(valueText(entry[key]))}</dd>
          </div>
        ))}
    </dl>
  );
}
export function ReferenceBody({
  row,
  renderText,
}: {
  row: ReferenceRow;
  renderText: TextRenderer;
}) {
  const x = { ...row.entry, text: searchBookText(row.entry).text };
  const rule = (text: string) => (
    <RuleText text={text} renderText={renderText} />
  );
  let content: ReactNode;
  if (row.printedReference)
    content = (
      <>
        {rule(row.entry.text)}
        {x.notes && (
          <aside className="notice">
            <strong>Source note</strong>
            <p>{renderText(valueText(x.notes))}</p>
          </aside>
        )}
      </>
    );
  else if (
    ["rule", "condition", "psychology", "property", "trait"].includes(row.kind)
  )
    content = (
      <>
        <Fields
          entry={x}
          fields={[["parameter", "Parameter"]]}
          renderText={renderText}
        />
        {rule(x.text)}
      </>
    );
  else if (row.kind === "species")
    content = (
      <>
        {rule(x.text)}
        <Fields
          entry={{
            ...x,
            modifiers: Object.entries(x.offsets || {})
              .map(([k, v]) => `${k} ${v}`)
              .join(" · "),
            native: (x.languages || []).join(", "),
          }}
          fields={[
            ["modifiers", "Characteristic modifiers"],
            ["movement", "Movement"],
            ["fate", "Fate"],
            ["fortune", "Fortune"],
            ["species", "Species"],
            ["native", "Native languages"],
            ["randomTalents", "Random starting Talents"],
          ]}
          renderText={renderText}
        />
        {["skills", "talents", "grantedTalents"]
          .filter((key) => Array.isArray(x[key]))
          .map((key) => (
            <p key={key}>
              <strong>
                {key === "skills"
                  ? "Skills"
                  : key === "grantedTalents"
                    ? "Additional Talents"
                    : "Talents"}
                :
              </strong>{" "}
              {renderText(
                x[key]
                  .map((choice: any) =>
                    Array.isArray(choice) ? choice.join(" or ") : choice,
                  )
                  .join("; "),
              )}
            </p>
          ))}
      </>
    );
  else if (row.kind === "career")
    content = (
      <>
        <p>
          {x.class} · {x.species?.join(", ") || "See Career availability"}
        </p>
        {rule(x.text)}
        <p>
          <strong>Characteristics:</strong>{" "}
          {Object.entries(x.advanceScheme)
            .filter(([, level]) => level)
            .map(
              ([key, level]) =>
                `${(characteristicNames as any)[key]} (L${level})`,
            )
            .join(", ")}
        </p>
        {x.levels.map((level: any, i: number) => (
          <section key={i} className="search-career-level">
            <h3>
              {i + 1}. {level.name}{" "}
              <small>
                {level.status} {level.standing}
              </small>
            </h3>
            {["skills", "talents", "trappings"].map((key) => (
              <p key={key}>
                <strong>{key[0].toUpperCase() + key.slice(1)}:</strong>{" "}
                {renderText(level[key].join(", "))}
              </p>
            ))}
          </section>
        ))}
      </>
    );
  else if (row.kind === "skill")
    content = (
      <>
        <p>
          <strong>{x.advanced ? "Advanced" : "Basic"} Skill</strong> ·{" "}
          {(characteristicNames as any)[x.char]}
          {x.grouped ? " · Grouped" : ""}
        </p>
        {x.text ? (
          rule(x.text)
        ) : (
          <p className="small muted">
            The full description is not imported. Consult the book/page above.
          </p>
        )}
        {x.options?.length > 0 && (
          <p>
            <strong>Printed specialisations:</strong>{" "}
            {renderText(x.options.join(", "))}
          </p>
        )}
      </>
    );
  else if (row.kind === "talent")
    content = (
      <>
        {rule(x.text)}
        {x.limit && (
          <p className="small muted">
            Purchase limit:{" "}
            {Array.isArray(x.limit)
              ? x.limit
                  .map(
                    (key: string) =>
                      (characteristicNames as any)[key] + " Bonus",
                  )
                  .join(" + ")
              : x.limit}
            .
          </p>
        )}
      </>
    );
  else if (row.kind === "magic") {
    const fields = [
      ["cn", "CN"],
      ["range", "Range"],
      ["target", "Target"],
      ["duration", "Duration"],
    ];
    const prefix = fields
      .filter(([key]) => x[key] != null && x[key] !== "")
      .map(([key, label]) => `${label}: ${x[key]}`)
      .join(" ");
    const text =
      prefix && x.text.startsWith(prefix)
        ? x.text.slice(prefix.length).trim()
        : x.text;
    content = (
      <>
        <Fields entry={x} fields={fields} renderText={renderText} />
        {rule(text)}
        <Fields
          entry={x}
          fields={[
            ["lore", "Lore"],
            ["form", "Form"],
            ["category", "Type"],
            ["tier", "Tier"],
            ["xp", "XP"],
          ]}
          renderText={renderText}
        />
      </>
    );
  } else if (row.kind === "equipment")
    content = (
      <>
        {(row.facets || [x]).map((facet: any, i: number) => (
          <section key={i} className="search-equipment-profile">
            <Fields
              entry={facet}
              fields={[
                ["category", "Category"],
                ["price", "Price"],
                ["availability", "Availability"],
                ["enc", "Encumbrance"],
                ["group", "Group"],
                ["reach", "Reach"],
                ["range", "Range"],
                ["damage", "Damage"],
                ["ap", "AP"],
                ["locations", "Locations"],
                ["qualities", "Qualities"],
                ["flaws", "Flaws"],
                ["properties", "Properties"],
              ]}
              renderText={renderText}
            />
            {rule(searchBookText(facet).text)}
          </section>
        ))}
      </>
    );
  else
    content = (
      <>
        <Fields
          entry={x}
          fields={[
            ["category", "Type"],
            ["stats", "Characteristics"],
            ["adjustments", "Adjustments"],
          ]}
          renderText={renderText}
        />
        {rule(x.text)}
      </>
    );
  const notes = searchBookText(row.entry).notes.filter((note: string) =>
    /^(Source discrepancy|Printed ambiguity):/.test(note),
  );
  return (
    <>
      {content}
      {notes.map((note: string, i: number) => (
        <aside className="notice" key={i}>
          <p>{note}</p>
        </aside>
      ))}
      {row.entry.text && (
        <p className="small muted">{descriptionNotice(row.entry)}</p>
      )}
    </>
  );
}
export function CareerReferences({
  row,
  data,
  onOpen,
}: {
  row: ReferenceRow;
  data: ReferenceData;
  onOpen: (keys: string[], name: string) => void;
}) {
  if (!["skill", "talent"].includes(row.kind)) return null;
  const matches = data.careerReferences(row);
  const title = `Careers with this ${row.kind}`;
  return (
    <section className="search-career-references">
      <h3>
        {title} {matches.length > 0 && <small>{matches.length}</small>}
      </h3>
      {matches.length === 0 ? (
        <p className="small muted">
          No listed Career offers this {row.kind} in the imported Career
          profiles.
        </p>
      ) : (
        <>
          <p className="small muted">
            Levels show where it is listed, including alternatives. Other
            prerequisites still apply.
          </p>
          <div className="search-table-wrap">
            <table>
              <caption className="screen-reader">
                {title}: {row.name}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Career</th>
                  <th scope="col" className="search-career-class">
                    Class
                  </th>
                  <th scope="col">Level</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(({ career, levels }: any) => {
                  const source = career.entry.source;
                  const book = data.books.find(
                    (book) => book.id === source.book,
                  );
                  const parent = data.books.find(
                    (book) => book.id === searchBookId(source.book, data.books),
                  );
                  const label = `${parent && parent !== book ? `${parent.shortTitle || parent.title} — ` : ""}${book?.shortTitle || book?.title || source.book}`;
                  return (
                    <tr key={career.key}>
                      <th scope="row">
                        <button
                          type="button"
                          className="search-term-link search-career-link"
                          data-reference-keys={JSON.stringify([career.key])}
                          aria-label={`View ${career.name} Career from ${label}`}
                          onClick={() => onOpen([career.key], career.name)}
                        >
                          {career.name}
                        </button>
                        <span className="search-career-source">
                          {label} · p. {source.page}
                        </span>
                        <span className="search-career-mobile-class">
                          {career.entry.class}
                        </span>
                      </th>
                      <td className="search-career-class">
                        {career.entry.class}
                      </td>
                      <td>
                        {levels.map((level: number) => (
                          <span className="search-career-rank" key={level}>
                            <b>L{level}</b>{" "}
                            {career.entry.levels[level - 1].name}
                          </span>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
