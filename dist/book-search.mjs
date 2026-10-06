// Search is a read-only projection of the assembled, selected-book catalogue.
import * as M from "./rules.mjs";
import { CONTENT_ALIASES } from "./content-references.mjs";
import { marketCatalog, formatMoney } from "./market.mjs";
import { careerAvailable, creationSpecies } from "./origins.mjs";
import { magicRows } from "./magic-browser.mjs";
import { purchaseReason } from "./workspace.mjs";
import { sourceLabel } from "./sources.mjs";
import { searchBookText } from "./book-search-text.mjs";

export const normalizeSearch = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export function buildSearchIndex(R) {
  const rows = [],
    seen = new Set();
  const add = (kind, entry, name = entry.name, extra = {}) => {
    const key = `${kind}:${entry.contentId}:${name}`;
    if (seen.has(key)) return;
    seen.add(key);
    const aliases = CONTENT_ALIASES.filter(
      (a) =>
        a.to === name &&
        R.books.some((b) => b.id === a.source.book) &&
        (!a.scope || R.books.some((b) => b.id === a.scope)) &&
        (a.kind.startsWith(kind) ||
          (kind === "magic" && /^spells?$/.test(a.kind)) ||
          (kind === "equipment" && a.kind.startsWith("gear"))),
    ).map((a) => a.from);
    const fields = [
      searchBookText(entry).text,
      entry.category,
      entry.class,
      entry.lore,
      entry.form,
      entry.properties,
      entry.qualities,
      entry.flaws,
      entry.options,
      entry.levels?.flatMap((l) => [
        l.name,
        l.status,
        l.standing,
        ...(l.skills || []),
        ...(l.talents || []),
        ...(l.trappings || []),
      ]),
      extra.keywords,
      sourceLabel(R, entry, { legacy: false }),
    ];
    rows.push({
      key,
      kind,
      name,
      entry,
      aliases,
      textFields: fields
        .filter(Boolean)
        .map((x) => (Array.isArray(x) ? x.join(" ") : String(x))),
      ...extra,
      normalizedName: normalizeSearch(name),
      normalizedAliases: aliases.map(normalizeSearch),
      searchable: normalizeSearch(
        [
          name,
          ...aliases,
          ...fields.map((x) => (Array.isArray(x) ? x.join(" ") : x)),
        ].join(" "),
      ),
    });
  };
  R.careers.forEach((x) => add("career", x));
  for (const [collection, kind, label] of [
    ["creatures", "creature", "Creature / NPC"],
    ["templates", "template", "NPC template"],
    ["traits", "trait", "Creature Trait"],
    ["mutations", "mutation", "Mutation"],
  ])
    for (const x of R[collection] || []) add(kind, x, x.name, { label });
  for (const kind of ["skill", "talent"]) {
    const entries = R[kind + "s"];
    const names = new Set(
      entries.flatMap((x) => {
        const grouped =
          kind === "skill"
            ? x.grouped
            : !!x.options?.length ||
              !!R.config.talentOptions?.[x.name] ||
              [
                "Bless",
                "Invoke",
                "Arcane Magic",
                "Savant",
                "Craftsman",
                "Master Tradesman",
                "Artistic",
                "Rune Magic",
                "Master Rune Magic",
              ].includes(x.name);
        return [
          x.name,
          ...(grouped ? M.options(R, `${x.name} (Any)`, kind) : []),
        ];
      }),
    );
    for (const c of R.careers)
      for (const l of c.levels)
        for (const raw of l[kind + "s"] || [])
          M.options(R, raw, kind).forEach((n) => names.add(n));
    for (const n of names) {
      const entry = kind === "skill" ? M.skillInfo(R, n) : M.talentInfo(R, n);
      if (entry) add(kind, entry, n);
    }
  }
  for (const [collection, label] of [
    ["spells", "Magic"],
    ["runes", "Rune"],
    ["techniques", "Technique"],
    ["cants", "Cant"],
  ])
    for (const x of R[collection] || []) add("magic", x, x.name, { label });
  // Exact names within one book join profile/shop facets; never infer cross-book equivalence.
  const equipment = new Map();
  for (const x of [...R.weapons, ...R.armour, ...R.gear, ...R.market]) {
    const key = `${x.source.book}:${x.name}`;
    const row = equipment.get(key) || { entry: x, facets: [], shop: [] };
    row.facets.push(x);
    equipment.set(key, row);
  }
  for (const x of marketCatalog(R))
    equipment.get(`${x.source.book}:${x.name}`)?.shop.push(x);
  for (const x of equipment.values())
    add("equipment", x.entry, x.entry.name, {
      facets: x.facets,
      shop: x.shop,
      keywords: x.facets
        .flatMap((f) => [
          f.category,
          f.group,
          f.reach,
          f.range,
          f.damage,
          f.ap,
          f.locations,
          f.qualities,
          f.flaws,
          f.properties,
          f.price,
          f.availability,
        ])
        .join(" "),
    });
  return rows;
}

export function searchBooks(index, query, limit = 8) {
  const q = normalizeSearch(query);
  if (!q) return { total: 0, rows: [] };
  const words = q.split(" ");
  const matches = index
    .filter((x) => words.every((w) => x.searchable.includes(w)))
    .map((x) => ({
      ...x,
      excerpt:
        x.textFields.find((t) =>
          words.every((w) => normalizeSearch(t).includes(w)),
        ) ||
        x.textFields.find((t) =>
          words.some((w) => normalizeSearch(t).includes(w)),
        ) ||
        "",
      rank:
        x.normalizedName === q
          ? 0
          : x.normalizedAliases.includes(q)
            ? 1
            : x.normalizedName.startsWith(q)
              ? 2
              : x.normalizedName.includes(q)
                ? 3
                : words.every((w) => x.normalizedName.includes(w))
                  ? 4
                  : 5,
    }))
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.name.localeCompare(b.name) ||
        a.key.localeCompare(b.key),
    );
  return { total: matches.length, rows: matches.slice(0, limit) };
}

// Routes only navigate. Existing choice and quote handlers remain authoritative.
export function searchContext(R, s, row, result) {
  const actions = [],
    d = result.derived,
    locked = s.ledger.length > 0;
  let status = "Reference",
    reason = "";
  const route = (label, step, extra = {}) =>
    actions.push({ label, step, ...extra });
  if (row.kind === "career") {
    if (!careerAvailable(R, s, row.entry))
      reason = "This Career is unavailable for your current Species or origin.";
    else {
      status = row.entry.id === s.career ? "Current Career" : "Career option";
      route("Open Career preview", 1, { career: row.entry.id });
    }
    if (locked && !reason)
      reason =
        "Career selection is locked while XP is spent. You can still view its profile.";
  }
  if (["skill", "talent"].includes(row.kind)) {
    const q = M.quote(
      R,
      s,
      row.kind,
      row.name,
      row.kind === "skill" ? s.advanceSize : 5,
    );
    const count =
      row.kind === "skill"
        ? (d.skills[row.name] || 0) * 5
        : d.talents.filter((n) => n === row.name).length;
    status =
      row.kind === "skill"
        ? `${count} Advances`
        : `${count} rank${count === 1 ? "" : "s"} owned`;
    reason =
      q.error ||
      (result.issues.some((x) => x.severity === "error")
        ? "Finish creation before spending XP."
        : "");
    const present =
      row.kind === "talent"
        ? M.careerTalentOptions(R, s, d.level).includes(row.name)
        : d.currentSkills.includes(row.name) ||
          !!d.skills[row.name] ||
          M.talentSkillUnlocks(R, s).includes(row.name) ||
          (!row.entry.advanced &&
            (!row.entry.grouped || row.name.includes("(")));
    if (present) {
      if (!q.error && Number.isFinite(q.cost)) status += ` · ${q.cost} XP`;
      route("Open in Experience", 6, {
        tab: row.kind === "skill" ? "Skills" : "Talents",
        name: row.name,
        kind: row.kind,
      });
    }
    if (!locked) {
      if (row.kind === "skill") {
        const slot = [
          ...M.speciesSkillSlots(R, s),
          ...M.careerSkillSlots(R, s, 1),
        ].find((x) => M.options(R, x.raw, "skill", s).includes(row.name));
        if (slot)
          route("Open starting Skill choices", 3, {
            slot: slot.key,
            kind: "skill",
          });
      } else {
        const speciesSlot = creationSpecies(R, s).talents.findIndex((_, i) =>
          M.speciesTalentOptions(R, s, i).includes(row.name),
        );
        if (M.careerTalentOptions(R, s).includes(row.name))
          route("Open starting Talent choices", 4, { target: "#freeTalent" });
        else if (speciesSlot >= 0)
          route("Open starting Talent choices", 4, {
            target: `#talent-${speciesSlot}`,
          });
      }
    }
    if (!q.error && q.cost > d.remaining)
      reason = `${reason ? reason + " " : ""}You need ${q.cost - d.remaining} more XP.`;
  }
  if (row.kind === "magic") {
    const rows = magicRows(R, s).filter(
      (x) => x.contentId === row.entry.contentId,
    );
    const owned = rows.some((x) => x.owned),
      quote = rows.find((x) => x.quote && !x.quote.error)?.quote;
    status = owned ? "Known" : quote ? `${quote.cost} XP` : "Reference";
    reason =
      rows.find((x) => x.quote?.error)?.quote.error ||
      (!owned && !quote
        ? "Learning requires the appropriate Talent, Lore and prerequisites."
        : "");
    route("Open magic & knowledge", 6, {
      tab: "Magic",
      name: row.name,
      kind: "magic",
    });
    let freeIndex = 0;
    const grant = M.spellGrants(R, s).find((g) => {
      if (g.count > 0 && g.choices.some((x) => x.name === row.name))
        return true;
      freeIndex += g.count;
      return false;
    });
    if (!locked && grant)
      route("Open starting magic choices", 4, {
        target: `[data-action="free-magic-picker"][data-index="${freeIndex}"]`,
      });
    if (quote)
      reason = result.issues.some((x) => x.severity === "error")
        ? "Finish creation before spending XP."
        : quote.cost > d.remaining
          ? `You need ${quote.cost - d.remaining} more XP.`
          : "";
  }
  if (row.kind === "equipment") {
    const item = marketCatalog(R, s).find((x) =>
      row.shop.some((shop) => shop.id === x.id),
    );
    if (item) {
      status = item.price;
      reason = purchaseReason(R, s, item);
      route("Open in shop", 5, {
        kind: "equipment",
        name: row.name,
        marketId: item.id,
      });
    } else
      reason =
        "Reference only: no ordinary shop purchase is available for this profile.";
    const count = s.purchases.filter((x) =>
      row.shop.some((shop) => shop.id === x.id),
    ).length;
    if (count) status += ` · ${count} bought`;
    if (item && !reason)
      status += ` · ${formatMoney(result.wallet.remaining)} available`;
  }
  return { status, reason, actions };
}
