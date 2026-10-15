import { esc, score, button } from "./controls.mjs";
import { characteristicNames } from "./ui.mjs";
import { chapterHeading } from "./design-system.mjs";
import { formatMoney } from "./market.mjs";
import { sheetSpecies } from "./origins.mjs";
import { legacyTag } from "./legacy.mjs";
import { legacyOption, legacyGear } from "./legacy-character.mjs";

// Presentation only. All scores, ranks, load effects and inventory come from
// the same calculated result used by the folio and PDF exports.
export function reviewSheet(R, s, snapshot, ui) {
  const { derived: d, equipment: eq, career: c, wallet } = snapshot;
  const {
    issues,
    issueHTML,
    talentDescription,
    spellDescription,
    recordsHTML,
    fullAppendix,
  } = ui;
  const edit = (step, label) =>
    button(
      "Edit",
      "step",
      `data-step="${step}" aria-label="Edit ${esc(label)}"`,
      "quiet review-edit",
    );
  const section = (id, title, content, step, count = "") =>
    `<section class="review-block" aria-labelledby="review-${id}"><div class="review-block-heading"><h3 id="review-${id}">${title}${count !== "" ? ` <span class="review-count">${count}</span>` : ""}</h3>${edit(step, title)}</div>${content}</section>`;
  const disclosure = (key, title, body, attrs = "") =>
    `<details class="review-detail" data-detail-key="review-sheet:${key}" ${attrs}><summary>${title}</summary><div class="review-detail-body">${body}</div></details>`;
  const empty = (text) => `<p class="review-empty">${text}</p>`;
  const metric = (label, value, note = "") =>
    `<div><dt>${label}</dt><dd>${esc(score(value))}</dd>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
  const current = (key) =>
    key === "Ag" && eq.penalties.complete ? eq.penalties.agility : d.stats[key];
  const skillList = (rows) =>
    rows.length
      ? `<div class="review-skill-heading" aria-hidden="true"><span>Skill</span><span>Adv.</span><span>Total</span></div><ul class="review-skills">${rows.map((row) => `<li><span>${button(esc(row.name), "calculation", `data-kind="skill" data-name="${esc(row.name)}"`, "review-skill-name")}${legacyTag(R, legacyOption(R, s, "skill", row.name))}<small>${esc(row.char)}${row.career ? " · Career" : ""}</small></span><span>+${esc(score(row.adv))}</span><strong>${esc(score(row.total))}</strong></li>`).join("")}</ul>`
      : empty("No trained Skills yet.");
  const trained = snapshot.skills.filter((row) => row.adv > 0);
  const basic = snapshot.skills.filter((row) => !row.advanced && !row.adv);
  const ranks = [...new Set(d.talents)].sort().map((name) => ({
    name,
    count: d.talents.filter((t) => t === name).length,
  }));
  const gearTag = (x) => legacyTag(R, legacyGear(R, s, x, x.name));
  const weapons = eq.weapons.length
    ? `<ul class="review-weapons">${eq.weapons.map((x) => `<li><div><strong>${esc(x.label)}</strong>${gearTag(x)}<small>${esc([x.group, x.range ? `Range ${x.range}` : x.reach].filter(Boolean).join(" · "))}</small>${x.qualities?.length ? `<small>${esc(Array.isArray(x.qualities) ? x.qualities.join(", ") : x.qualities)}</small>` : ""}</div><span class="review-damage"><small>Damage</small><strong>${esc(Number.isFinite(x.damage) ? `+${score(x.damage)}` : x.damage)}</strong></span></li>`).join("")}</ul>`
    : empty("No weapons.");
  const armour = `<dl class="review-armour">${["Head", "Arms", "Body", "Legs", "Shield"].map((k) => metric(k, eq.ap[k])).join("")}</dl><p class="review-caption">Armour Points · Toughness Bonus ${esc(score(d.tb))}</p>${eq.armour.length ? `<ul class="review-belongings">${eq.armour.map((x) => `<li><span>${esc(x.label)}${gearTag(x)}</span><small>${esc(x.locations)} · ${esc(score(x.ap))} AP${x.active === false ? " · not active" : ""}</small></li>`).join("")}</ul>` : empty("No armour.")}`;
  const belongings = eq.other.length
    ? `<ul class="review-belongings">${eq.other.map((x) => `<li><span>${esc(x.name)}${gearTag(x)}</span></li>`).join("")}</ul>`
    : empty("No other belongings.");
  const extraMagic = [
    ["Techniques", snapshot.techniques],
    ["Runes", snapshot.runes],
    ["Cants", snapshot.cants],
  ].filter(([, rows]) => rows?.length);
  const magic =
    snapshot.spells.map((x) => spellDescription(x)).join("") +
    extraMagic
      .map(
        ([label, rows]) =>
          `<h4>${label}</h4><ul class="review-belongings">${rows.map((x) => `<li>${esc(x.displayName || x.name)}${legacyTag(R, x)}</li>`).join("")}</ul>`,
      )
      .join("");
  const level = c.levels?.[d.level - 1];
  return `<div class="review-sheet">
    <header class="review-identity"><span class="eyebrow">08 / Review & export</span>${chapterHeading(s.name || "Your character")}
      <dl class="review-identity-grid"><div><dt>Species</dt><dd>${esc(sheetSpecies(R, s))}</dd></div><div><dt>Class</dt><dd>${esc(c.class || "Not chosen")}</dd></div><div><dt>Career</dt><dd>${esc(c.id ? c.name : "Not chosen")}</dd></div><div><dt>Rank</dt><dd>${esc(c.id ? `${level?.name || c.name} · Level ${d.level}` : "—")}</dd></div><div><dt>Status</dt><dd>${esc(d.status || "—")}</dd></div></dl>
    </header>
    <div class="review-export"><div class="review-export-status ${issues.length ? "review-incomplete" : "review-ready"}"><strong>${issues.length ? `${issues.length} unfinished ${issues.length === 1 ? "choice" : "choices"}` : "Ready to export"}</strong><span>${issues.length ? "Resolve the choices below to enable PDF downloads." : "Editable character sheet and complete creation record."}</span></div><div class="review-export-actions">${button("Download character sheet", "sheet", issues.length ? "disabled" : "", "primary")}${button("Download creation & XP record", "record", issues.length ? "disabled" : "", "quiet")}</div>
    ${disclosure("pdf-options", "PDF options", `<label class="check-row"><input type="checkbox" data-bind="fullAppendix" ${fullAppendix ? "checked" : ""}>Include the complete enabled-book compatibility appendix</label><p class="small muted">Both downloads always include every actual choice, roll, XP purchase, overflow and relevant adaptation. The appendix adds unused catalogue conversions. The character sheet uses your supplied fillable PDF with the creation record appended.</p>`)}</div>
    ${issues.length ? disclosure("issues", "Finish choices to export", issueHTML, "open") : ""}
    ${section(
      "characteristics",
      "Characteristics",
      `<dl class="review-stats">${Object.keys(characteristicNames)
        .map(
          (k) =>
            `<div><dt><abbr title="${characteristicNames[k]}">${k}</abbr></dt><dd>${button(esc(score(current(k))), "calculation", `data-kind="char" data-name="${k}" aria-label="${characteristicNames[k]} ${esc(score(current(k)))}; calculation"`, "review-stat-button")}</dd></div>`,
        )
        .join(
          "",
        )}</dl><p class="review-caption">${eq.penalties.complete ? "Current scores include known load penalties." : "Intrinsic scores shown. Load effects are unresolved."}</p>${disclosure(
        "stat-breakdown",
        "Starting scores & Advances",
        `<div class="table-wrap"><table><thead><tr><th>Characteristic</th><th>Initial*</th><th>XP added</th><th>Intrinsic</th><th>Current</th></tr></thead><tbody>${Object.entries(
          characteristicNames,
        )
          .map(
            ([k, name]) =>
              `<tr><th scope="row">${name}</th><td>${score(d.stats[k] - d.charAdv[k])}</td><td>+${score(d.charAdv[k])}</td><td>${score(d.stats[k])}</td><td>${score(current(k))}</td></tr>`,
          )
          .join(
            "",
          )}</tbody></table></div><p class="review-caption">*Includes Talent bonuses, which do not count as Advances.</p>`,
      )}`,
      2,
    )}
    <dl class="review-resources" aria-label="Character resources">${metric("Wounds", d.wounds)}${metric("Fate", d.fate)}${metric("Fortune", d.fortune)}${metric("Movement", eq.penalties.complete ? eq.penalties.movement : d.movement)}${metric("Size", d.size)}${metric("Enc. / capacity", `${score(eq.total)} / ${score(d.capacity)}`, eq.unknown.length ? "Known weight only" : "")}</dl>
    <div class="review-balance"><span>XP <strong>${score(d.remaining)}</strong> available <small>· ${score(d.spent)} spent / ${score(d.xpTotal)} total</small></span><span>Money <strong>${s.wealth ? esc(formatMoney(wallet.remaining)) : "Not rolled"}</strong> <small>· ${esc(formatMoney(wallet.spent))} spent</small></span></div>
    <div class="review-columns"><div>${section("skills", "Skills", skillList(trained) + (basic.length ? disclosure("basic-skills", `Untrained Basic Skills · ${basic.length}`, skillList(basic)) : ""), 3, trained.length)}</div><div>${section("talents", "Talents", ranks.length ? ranks.map(({ name, count }) => talentDescription(name, { metadata: `<span class="review-rank" aria-label="${count} ${count === 1 ? "rank" : "ranks"}">×${count}</span>` })).join("") : empty("No Talents yet."), 4, ranks.length)}${section("magic", "Magic & special abilities", magic || empty("No spells, prayers, Runes, Techniques or Cants."), 4)}</div></div>
    ${section("equipment", "Equipment", `<div class="review-equipment-grid"><div><h4>Weapons</h4>${weapons}</div><div><h4>Armour</h4>${armour}<h4>Other belongings</h4>${belongings}</div></div>${eq.unknown.length ? `<p class="review-weight-warning">Unlisted weights: ${eq.unknown.map(esc).join(", ")}. Encumbrance shows the known subtotal.</p>` : ""}`, 5)}
    <div class="review-records">${disclosure(
      "background",
      "Background & character notes",
      `<dl class="review-background">${[
        ["Appearance & background", s.appearance],
        ["Eyes", s.background?.eyes],
        ["Hair", s.background?.hair],
        ["Clan", s.background?.clan],
        ["Personal ambition", s.ambition],
        ["Party ambition", s.partyAmbition],
        ["Dooming", d.talents.includes("Doomed") ? s.dooming : ""],
      ]
        .filter(([, value]) => value)
        .map(
          ([label, value]) =>
            `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`,
        )
        .join(
          "",
        )}</dl><div class="field"><label for="notes">Character notes / GM decisions</label><textarea id="notes" data-bind="notes">${esc(s.notes)}</textarea></div>`,
    )}${recordsHTML}</div>
  </div>`;
}
