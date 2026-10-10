import { tab } from "../controls.mjs";
import { chapterHeading } from "../design-system.mjs";
import { detailKey } from "../disclosures.mjs";
import { grudgePanel, runeShopRows } from "../dwarf-guide-ui.mjs";
import * as M from "../rules.mjs";
import { characteristicNames } from "../ui.mjs";
import { acquisitionChoices } from "../creator-ui.mjs";
import { legacyTag, legacyName } from "../legacy.mjs";
import { legacyOption } from "../legacy-character.mjs";
import { magicRows, filterMagic } from "../magic-browser.mjs";
import { cantPanel } from "../archives-iii-ui.mjs";
import { causeControl } from "../talent-targets-ui.mjs";

// Live context keeps rendering state outside the saved character. Unusual book
// mechanics remain explicit handlers rather than generic configuration rules.
export function createFeature(getContext, setContext) {
  function xpRow(type, name) {
    let {
      s,
      R,
      result,
      xpCareerOnly,
      xpAffordable,
      errors,
      esc,
      talentDescription,
      button,
      characteristicClass,
      characteristicBadge,
    } = getContext();

    const amount =
      ["char", "skill"].includes(type) && s.advanceSize === 1 ? 1 : 5;
    const q = M.quote(R, s, type, name, amount),
      d = result().derived;
    if (
      (xpCareerOnly && !q.inCareer) ||
      (xpAffordable && (q.error || q.cost > d.remaining))
    )
      return "";
    const blocked =
      q.error || (errors().length ? "Finish creation before spending XP." : "");
    const value =
      type === "char"
        ? d.stats[name]
        : type === "skill"
          ? d.stats[M.skillInfo(R, name, s)?.char] +
            Math.round((d.skills[name] || 0) * 5)
          : 0;
    const filter =
      type === "skill" ? ` data-skill-search="${esc(name.toLowerCase())}"` : "";
    const progress = (d.trackerProgress[`${type}:${name}`] || 0) + 1;
    const trackerLabel = blocked
      ? "Not currently purchasable"
      : q.tick
        ? "Career · +1 tracker box"
        : !q.inCareer
          ? "Non-career · no tracker box"
          : d.earnedBoxes >= 36
            ? "Career · tracker full"
            : amount === 1
              ? `Career · ${progress % 5}/5 toward a tracker box`
              : "Career · no tracker box";
    if (["char", "skill"].includes(type)) {
      const label = type === "char" ? characteristicNames[name] : name;
      const tracker = blocked
        ? "Unavailable"
        : trackerLabel
            .replace("toward a tracker box", "to next box")
            .replace("tracker box", "box");
      const loadNote =
        (type === "char"
          ? name === "Ag"
          : M.skillInfo(R, name, s)?.char === "Ag") &&
        result().equipment.penalties.complete &&
        result().equipment.penalties.band;
      const careerClass =
        type === "char"
          ? ` xp-characteristic-row ${characteristicClass(name)}`
          : "";
      return `<div class="xp-row xp-advance-row${careerClass}"${filter}><div class="xp-advance-identity"><div class="xp-advance-name"><strong>${esc(label)}</strong>${type === "char" ? characteristicBadge(name) : ""}${legacyTag(R, { ...q, legacySources: legacyOption(R, s, type, name).legacySources })}</div>
<span class="xp-advance-meta" title="${esc(trackerLabel)}">${esc(tracker)}</span></div>
<div class="xp-advance-result"><span class="advance-result">${value} <span aria-hidden="true">→</span> ${value + amount} <small>+${amount}</small></span></div>${button("calculation", "?", `data-kind="${type}" data-name="${esc(name)}" aria-label="How is ${esc(label)} calculated?" title="How is ${esc(label)} calculated?"`, "advance-calculation-help")}<div class="xp-advance-purchase">${button("buy", `${q.cost || "—"} XP`, `data-type="${type}" data-name="${esc(name)}" data-amount="${amount}" ${blocked ? "disabled" : ""} title="${esc(blocked || "Purchase this improvement")}"`, "primary")}</div>${blocked ? `<p class="purchase-error xp-advance-note">${esc(blocked)}</p>` : ""}${loadNote ? '<p class="minilabel xp-advance-note">Base score shown; the folio includes load penalties (p. 299).</p>' : ""}</div>`;
    }
    if (type === "talent")
      return `<div class="xp-row xp-talent-row"><div>${talentDescription(name, { quote: q, metadata: `<span class="xp-talent-meta"><span>${d.talents.filter((t) => t === name).length} ranks owned</span><span>${esc(trackerLabel)}</span></span>` })}</div>
<div>${button("buy", `${q.cost || "—"} XP`, `data-type="talent" data-name="${esc(name)}" ${blocked ? "disabled" : ""} title="${esc(blocked || "Purchase this improvement")}"`, "primary")}${blocked ? `<p class="minilabel purchase-error">${esc(blocked)}</p>` : ""}</div>
</div>`;
    return "";
  }

  function experienceTalents() {
    let { result, R, s, talentDescription, esc, button } = getContext();

    const d = result().derived,
      available = [],
      known = [],
      unavailable = [];
    for (const name of M.careerTalentOptions(R, s, d.level)) {
      const reason = M.invalidTalent(R, s, name);
      (reason.startsWith("Already known;")
        ? known
        : reason
          ? unavailable
          : available
      ).push(name);
    }
    const cause = M.careerTalentOptions(R, s, d.level).some(
      (n) => M.base(n) === "Impassioned Zeal",
    )
      ? causeControl(s, esc, button)
      : "";
    return `${cause}<section class="talent-group"><h3>Career Talents <span class="counter">${available.length}</span></h3>
<p class="small muted">Each purchase costs 100 XP. The button shows why a purchase is unavailable.</p>${available.length ? runeShopRows(available, (n) => xpRow("talent", n), "available") : '<p class="empty">No new Career Talents can be learned at this level.</p>'}</section>${known.length ? `<details data-detail-key="${detailKey("experience-view:experienceTalents:0")}" class="talent-catalog-group" data-group="known-talents"><summary>Already learned <span class="counter">${known.length}</span></summary><p class="small muted">These Talents cannot be purchased again under their normal rules.</p>${known.map((n) => `<div class="known-talent"><span class="owned-ranks">${d.talents.filter((t) => t === n).length} ranks owned</span>${talentDescription(n)}</div>`).join("")}</details>` : ""}${unavailable.length ? `<details data-detail-key="${detailKey("experience-view:experienceTalents:1")}" class="talent-catalog-group" data-group="unavailable-talents"><summary>Unavailable alternatives <span class="counter">${unavailable.length}</span></summary><p class="small muted">These choices have a rule restriction. Expand a Talent to read its rules.</p>${runeShopRows(unavailable, (n) => xpRow("talent", n), "unavailable")}</details>` : ""}`;
  }

  function experienceSkills() {
    let { result, R, s, select, esc, skillSearch } = getContext();

    const d = result().derived,
      unlocks = M.talentSkillUnlocks(R, s);
    const all = [
      ...new Set([
        ...d.currentSkills,
        ...unlocks,
        ...Object.keys(d.skills),
        ...R.skills
          .filter((x) => !x.advanced)
          .flatMap((x) =>
            x.grouped ? M.options(R, `${x.name} (Any)`, "skill", s) : [x.name],
          ),
      ]),
    ].sort((a, b) => a.localeCompare(b));
    const career = all.filter((n) => d.currentSkills.includes(n));
    const trained = all.filter(
      (n) => !d.currentSkills.includes(n) && (d.skills[n] || 0) > 0,
    );
    const other = all.filter(
      (n) => !d.currentSkills.includes(n) && !(d.skills[n] > 0),
    );
    const groups = Object.groupBy
      ? Object.groupBy(other, M.base)
      : other.reduce((out, n) => ((out[M.base(n)] ??= []).push(n), out), {});
    return `${d.talents.includes("Seasoned Traveller") ? `<div class="field"><label for="local-region">Current region for Seasoned Traveller</label>${select('id="local-region" data-bind="localRegion"', ["Local", "Reikland", "Empire", "Bretonnia", "Estalia", "Tilea", "Kislev", "Wasteland"], s.localRegion, true)}<small class="muted">Confirm with your GM. Only the selected regional Lore is unlocked, while you remain there (p. 125); non-career XP still costs double.</small></div>` : ""}<div class="field skill-search"><label for="xp-skill-search">Find a Skill</label><input id="xp-skill-search" type="search" placeholder="Search Skills or specialisations…" value="${esc(skillSearch)}" autocomplete="off"><small class="muted">Your Career Skills come first. Browse other Basic Skills and talent-unlocked Skills below.</small></div>
<p id="xp-skill-results" class="minilabel" aria-live="polite"></p>
<section class="skill-group"><h3>Current Career Skills <span class="counter">${career.length}</span></h3>${career.map((n) => xpRow("skill", n)).join("")}</section>${trained.length ? `<section class="skill-group"><h3>Other trained Skills <span class="counter">${trained.length}</span></h3>${trained.map((n) => xpRow("skill", n)).join("")}</section>` : ""}<section class="skill-group skill-catalog"><h3>Other available Skills <span class="counter">${other.length}</span></h3>
<p class="small muted">Skills with several specialisations can be expanded. Non-career Advances cost double.</p>${Object.entries(
      groups,
    )
      .map(([base, names]) =>
        names.length === 1
          ? xpRow("skill", names[0])
          : `<details data-detail-key="${detailKey("experience:skill-group", base)}" class="skill-catalog-group" data-group="${esc(base)}"><summary>${esc(base)} <span class="minilabel">${names.length} options</span></summary>${names.map((n) => xpRow("skill", n)).join("")}</details>`,
      )
      .join("")}</section>`;
  }

  function filterSkills() {
    let { $, skillSearch, openedSkillGroups } = getContext();

    const input = $("#xp-skill-search");
    if (!input) return;
    const query = skillSearch.trim().toLocaleLowerCase(),
      rows = [...document.querySelectorAll("[data-skill-search]")];
    let count = 0;
    for (const row of rows) {
      const match = !query || row.dataset.skillSearch.includes(query);
      row.hidden = !match;
      if (match) count++;
    }
    for (const group of document.querySelectorAll(".skill-catalog-group")) {
      const match = !!group.querySelector("[data-skill-search]:not([hidden])");
      group.hidden = !match;
      group.open = query ? match : openedSkillGroups.has(group.dataset.group);
    }
    for (const group of document.querySelectorAll(".skill-group")) {
      const visible = group.querySelectorAll(
        "[data-skill-search]:not([hidden])",
      ).length;
      group.hidden = !visible;
      const label = group.querySelector("h3 .counter");
      if (label) label.textContent = visible;
    }
    const results = $("#xp-skill-results");
    if (results)
      results.textContent = query
        ? `${count} matching Skill${count === 1 ? "" : "s"}`
        : "";
  }

  function experience() {
    let {
      result,
      errors,
      R,
      s,
      xpTab,
      characteristicLegend,
      button,
      esc,
      page,
      issuePanel,
      trackerBoxes,
      xpCareerOnly,
      xpAffordable,
      select,
      ledgerTable,
    } = getContext();

    const d = result().derived,
      e = errors(),
      c = M.career(R, s),
      q = M.quote(R, s, "promotion", "");
    let rows = "";
    if (xpTab === "Characteristics")
      rows =
        characteristicLegend({ compact: true }) +
        M.KEYS.map((k) => xpRow("char", k)).join("");
    if (xpTab === "Skills") rows = experienceSkills();
    if (xpTab === "Talents") rows = grudgePanel(R, s) + experienceTalents();
    if (xpTab === "Magic") rows = spellShop();
    return `<span class="eyebrow">07 / Experience</span>${chapterHeading("Spend experience")}
<div class="xp-balance xp-sticky-balance"><div><span>XP budget</span><strong>${d.xpTotal.toLocaleString()}</strong>${d.xpBonus ? `<small>${s.xp.toLocaleString()} base + ${d.xpBonus} star-sign XP</small>` : ""}</div>
<div><span>Spent</span><strong>${d.spent.toLocaleString()}</strong></div>
<div class="remaining"><span>Available to spend</span><strong>${d.remaining.toLocaleString()}</strong></div>
</div>
<details data-detail-key="${detailKey("experience-view:experience:0")}" class="budget-edit"><summary>Edit XP budget</summary><div class="budget-form"><div class="field"><label for="xp">Base XP budget</label><input id="xp" type="number" min="${Math.max(0, d.spent - d.xpBonus)}" step="1" value="${s.xp}"></div>${button("set-xp", "Update budget", "", "secondary")}</div>
<p class="small muted">Includes spent XP. Star-sign XP is added separately. Unspent experience can be kept.</p>
</details>${e.length ? issuePanel(e, "Finish creation to spend XP") : ""}<div class="career-progress"><div class="split"><strong>${esc(c.levels[d.level - 1].name)} ${legacyTag(R, c)}</strong><span class="level-pill">Career level ${d.level}</span></div>${trackerBoxes(d)}${
      d.level < 4
        ? `<p class="promotion-action">${button("promote", "Advance Career · 100 XP", `${q.error || e.length ? "disabled" : ""} aria-describedby="promotion-reason"`, "secondary")}</p>
<details class="promotion-help" data-detail-key="experience:promotion-help"><summary>Career advancement${q.error ? " · not ready" : ""}</summary><p id="promotion-reason">${esc(e.length ? "Finish the highlighted creation choices before advancing the Career." : q.error || "Your tracker and XP allow this advancement.")}</p><p>Requires the Advance Career Endeavour (p. 196). Using this button records that requirement as met.</p></details>`
        : ""
    }</div>
<div class="xp-browser-controls"><label class="check-row"><input type="checkbox" data-bind="xpCareerOnly" ${xpCareerOnly ? "checked" : ""}>Career only</label><label class="check-row"><input type="checkbox" data-bind="xpAffordable" ${xpAffordable ? "checked" : ""}>Affordable now</label><details class="browser-help" data-detail-key="experience:filter-help"><summary aria-label="About filters"><span aria-hidden="true">?</span></summary><p>Filters hide rows; prices and eligibility stay the same. Career-only applies to Characteristics, Skills and Talents; magic uses its own access filters.</p></details></div>
<div class="page-tabs" role="tablist" aria-label="XP purchases">${["Characteristics", "Skills", "Talents", "Magic"].map((t) => tab(t, { id: `xp-tab-${t}`, panel: "xp-content", selected: t === xpTab, action: "xp-tab", value: t, short: t === "Characteristics" ? "Stats" : t })).join("")}</div>${
      ["Characteristics", "Skills"].includes(xpTab)
        ? `<div class="advance-choice"><span class="label">Advance by</span><div class="inline-choice" role="group" aria-label="Advance size">${[5, 1].map((n) => button("advance-size", `+${n}`, `data-size="${n}" aria-pressed="${s.advanceSize === n}"`, s.advanceSize === n ? "quiet active" : "quiet")).join("")}</div>
<details class="advance-help" data-detail-key="experience:advance-help"><summary>Advance rules</summary><p>Each purchase shows its price, source and tracker effect. ${page("191, 364")}</p><p>${s.advanceSize === 1 ? "Optional individual Advances: Appendix II, p. 364. Five +1 Advances in the same Career Skill or Characteristic earn one tracker box." : "+5 Advances: p. 191. An incomplete +1 band must reach five before returning to +5 on that Skill or Characteristic."}</p><p>✓ marks currently available Career Characteristics. Later levels become Career Characteristics when you reach that level; non-career purchases cost double.</p></details></div>`
        : ""
    }<div id="xp-content" role="tabpanel" aria-labelledby="xp-tab-${xpTab}" ${e.length ? 'class="unavailable"' : ""}>${rows}</div>
<details data-detail-key="${detailKey("experience-view:experience:1")}" class="section-gap"><summary>Acquire a higher-level Career Trapping ${legacyTag(R, c)}</summary><p>Only record an item from the next Career level, actually obtained with your GM. This does not create free gear or deduct coin. Each different next-level Trapping earns one box (pp. 43–44).</p>
<div class="field"><label for="new-trapping">Trapping</label>${select(
      'id="new-trapping"',
      c.levels
        .filter((l) => l.level === d.level + 1)
        .flatMap((l) =>
          l.trappings.map((t, i) => [
            `${l.level}:${i}`,
            `Level ${l.level}: ${legacyName(R, l.source ? l : c, t)}`,
          ]),
        ),
    )}</div>
<div class="field"><label for="owned-trapping">Use an existing owned item?</label>${select('id="owned-trapping"', [["", "New item obtained outside the starting shop"], ...acquisitionChoices(R, s)], "")}</div>
<div class="field"><label for="acquisition">How was it obtained?</label><input id="acquisition" placeholder="Gift, campaign reward, or purchase from other funds"></div>${button("acquire", "Record acquisition", e.length ? "disabled" : "")}</details>
<details data-detail-key="${detailKey("experience-view:experience:2")}" class="ledger-section" open><summary>XP ledger <span class="counter">${s.ledger.length} entries</span></summary>${ledgerTable()}</details>
<p class="small muted">Non-career Characteristics and Basic Skills cost double. Training and Unusual Learning Endeavours, Career changes, and GM awards are outside this creation workflow.</p>`;
  }

  function spellQuote(name, talent) {
    let { R, s } = getContext();

    return M.quoteSpell(R, s, name, talent);
  }

  function spellShop() {
    let {
      R,
      s,
      result,
      errors,
      magicFilters,
      magicSection,
      hasColourMagic,
      button,
      esc,
      xpAffordable,
      select,
      spellDescription,
    } = getContext();

    const rows = magicRows(R, s),
      d = result().derived,
      issues = errors(),
      choices = filterMagic(rows, magicFilters).filter(
        (x) =>
          !xpAffordable ||
          x.owned ||
          (x.quote && !x.quote.error && x.quote.cost <= d.remaining),
      ),
      known = rows.filter((x) => x.owned),
      legal = rows.filter((x) => !x.owned && x.quote && !x.quote.error);
    const fields = [
      [
        "type",
        "Knowledge type",
        [["all", "All types"], ...[...new Set(rows.map((x) => x.type))].sort()],
      ],
      [
        "lore",
        "Lore / tradition",
        [
          ["all", "All traditions"],
          ...[
            ...new Set(
              rows
                .flatMap((x) => x.lores?.filter((l) => l !== "*") || [x.lore])
                .filter(Boolean),
            ),
          ].sort(),
        ],
      ],
      [
        "book",
        "Source",
        [
          ["all", "All selected books"],
          ...R.books
            .filter((b) => rows.some((x) => x.source.book === b.id))
            .map((b) => [b.id, b.shortTitle || b.title]),
        ],
      ],
      [
        "status",
        "Show",
        [
          ["available", "Available to learn now"],
          ["known", "Already known"],
          ["all", "Browse all, including locked"],
        ],
      ],
    ];
    return `${magicSection()}${hasColourMagic() ? cantPanel(R, s) : ""}<section class="magic-browser"><h3>Magic & knowledge library</h3>${!legal.length ? `<div class="notice"><strong>${known.length ? "No additional purchases available now." : "No magical training yet."}</strong><p class="small">Spell learning follows your Talents, Lore and prerequisites. You can browse references without granting yourself any powers.</p>${button("browse-magic", "Browse all magic & knowledge")}</div>` : ""}<div class="field"><label for="magic-search">Find magic or knowledge</label><input id="magic-search" type="search" data-search="magic" value="${esc(magicFilters.query)}" placeholder="Name, tradition or effect"></div>
<div class="browser-filters">${fields.map(([key, label, items]) => `<div class="field"><label for="magic-${key}">${label}</label>${select(`id="magic-${key}" data-bind="magicFilter" data-key="${key}"`, items, magicFilters[key])}</div>`).join("")}</div>
<p class="small muted" aria-live="polite">${choices.length} matching profiles. Rituals, spells, prayers, techniques and rune knowledge keep their distinct learning rules.</p>${
      choices.length
        ? choices
            .map((x) => {
              const q = x.quote,
                reason = x.owned
                  ? "Already known."
                  : q?.error ||
                    (!q
                      ? x.type === "Cant"
                        ? "Choose Cants above after meeting the appropriate Lore and spell-count threshold."
                        : x.type === "Rune"
                          ? "Requires this rune Talent option in your current Career."
                          : `Requires an appropriate spell-learning Talent and access to ${x.lore || x.category}.`
                      : issues.length
                        ? "Finish creation before spending XP."
                        : ""),
                action =
                  x.type === "Technique"
                    ? "buy-technique"
                    : x.type === "Rune"
                      ? "buy"
                      : "buy-spell";
              return `<article class="xp-row magic-profile"><div>${spellDescription({ ...x, category: x.type })}<small>${esc(x.lore || "")} · ${x.cn !== undefined ? `CN ${esc(x.cn)} · ` : ""}${x.owned ? "Known" : q ? `${q.cost} XP` : "Locked"}${q?.discount ? ` · ${esc(q.discount)}` : ""}</small></div>
<div>${x.owned ? '<span class="counter">Known</span>' : button(action, q ? `${q.cost} XP` : "Unavailable", `data-type="talent" data-name="${esc(x.type === "Rune" ? x.talent : x.name)}" data-talent="${esc(q?.talent || x.talent || "")}" ${reason ? "disabled" : ""}`, "primary")}${reason && !x.owned ? `<p class="purchase-error minilabel">${esc(reason)}</p>` : ""}</div>
</article>`;
            })
            .join("")
        : '<p class="empty">No profiles match these filters. Try browsing all or changing the search.</p>'
    }</section>`;
  }
  return {
    xpRow,
    experienceTalents,
    experienceSkills,
    filterSkills,
    experience,
    spellQuote,
    spellShop,
  };
}
