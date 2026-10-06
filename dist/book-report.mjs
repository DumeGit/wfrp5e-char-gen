import { registeredEntries, assembleBooks } from "./books.mjs";
import { INCLUSION_STATUSES } from "./book-coverage.mjs";
import { isLegacy } from "./legacy.mjs";
import { marketCatalog } from "./market.mjs";
const emptyCounts = () =>
  Object.fromEntries(INCLUSION_STATUSES.map((s) => [s, 0]));
const count = (rows) =>
  rows.reduce((out, x) => (out[x.status]++, out), emptyCounts());
export function buildBookReport(library) {
  const books = library.packs.map((pack) => {
    const R = assembleBooks(library, [pack.manifest.id]);
    const records = registeredEntries(pack)
      .map((entry) => {
        const override = pack.data.coverage.records.find(
          (x) => x.contentId === entry.contentId,
        );
        const status = entry.unavailable
          ? "unavailable"
          : override?.status ||
            (isLegacy(R, entry) ? "adapted" : "implemented");
        return {
          contentId: entry.contentId,
          kind: entry.contentKind,
          name: entry.name,
          status,
          source: entry.source,
          reason:
            entry.unavailable ||
            override?.reason ||
            entry.adaptation ||
            "Creator profile/choice is supported; situational play effects remain reference text.",
        };
      })
      .sort(
        (a, b) =>
          a.kind.localeCompare(b.kind) ||
          a.contentId.localeCompare(b.contentId),
      );
    const features = [...pack.data.coverage.features].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    const kinds = Object.fromEntries(
      [...new Set(records.map((x) => x.kind))]
        .sort()
        .map((kind) => [kind, count(records.filter((x) => x.kind === kind))]),
    );
    return {
      id: pack.manifest.id,
      title: pack.manifest.title,
      version: pack.manifest.version,
      kind: pack.manifest.kind,
      recordCounts: count(records),
      featureCounts: count(features),
      kinds,
      records,
      features,
    };
  });
  // The Career-specific Hedge Witch replacement is a selectable alternative,
  // not an additional simultaneous Career in the default all-book catalogue.
  const active = assembleBooks(
    library,
    library.packs
      .filter((p) => p.manifest.kind !== "variant")
      .map((p) => p.manifest.id),
  );
  const activeCounts = {
    books: active.books.length,
    creatureProfiles: active.creatures.length,
    npcTemplates: active.templates.length,
    creatureTraits: active.traits.length,
    mutations: active.mutations.length,
    careers: active.careers.length,
    magicProfiles: active.spells.length,
    rituals: active.spells.filter((x) => x.ritual).length,
    cants: active.cants.length,
    techniques: active.techniques.length,
    runes: active.runes.length,
    pricedShopEntries: marketCatalog(active).length,
  };
  return {
    schemaVersion: 1,
    statuses: INCLUSION_STATUSES,
    activeCounts,
    books,
    aliases: library.aliases,
  };
}
const cell = (x) =>
  String(x ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
const source = (x) =>
  x.page === undefined ? "Book-wide scope decision" : `p. ${x.page}`;
export function inclusionMarkdown(report) {
  const lines = [
    "# Book inclusion matrix",
    "",
    "Generated from the validated registry and its reviewed coverage inventories. Run `npm run generate:books`; do not hand-edit this file.",
    "",
    "**Implemented** means a creator choice/profile is supported, not that live play effects are automated. **Adapted** identifies a concrete changed rule, using reviewed adaptation metadata; Fourth Edition origin alone never qualifies. **Reference-only** retains supplied information without the corresponding ordinary purchase/play action. **Unavailable** is deliberately blocked or unresolved. **Deferred** is future scope. Counts describe source records, not unique gameplay choices: gear/shop/weapon records may describe the same item. Features are counted separately to avoid pretending chapters are individual profiles.",
    "",
    "Each source inventory remains visible even when another selected book supersedes it. Active totals account for current precedence; the separately selectable Hedge Witch variant is not an extra simultaneous Career. Book-wide decisions omit a page rather than invent a chapter reference.",
    "",
    "| Active catalogue | Count |",
    "|---|---:|",
    ...Object.entries(report.activeCounts).map(
      ([key, value]) => `| ${key} | ${value} |`,
    ),
    "",
    "| Source pack | Implemented | Adapted | Reference-only | Unavailable | Deferred |",
    "|---|---:|---:|---:|---:|---:|",
    ...report.books.map(
      (b) =>
        `| ${cell(b.title)}${b.kind === "variant" ? " (variant)" : ""} | ${report.statuses.map((s) => b.recordCounts[s]).join(" | ")} |`,
    ),
    "",
    "The table above counts catalog records. The feature matrix below includes systems, embedded unavailable Career entries and deliberate exclusions that have no catalog record.",
    "",
  ];
  for (const b of report.books) {
    lines.push(
      `## ${b.title}`,
      "",
      `Pack \`${b.id}\` · version ${b.version}`.replaceAll("\`", "`"),
      "",
      "| Kind | Implemented | Adapted | Reference-only | Unavailable | Deferred |",
      "|---|---:|---:|---:|---:|---:|",
      ...Object.entries(b.kinds).map(
        ([k, counts]) =>
          `| ${k} | ${report.statuses.map((s) => counts[s]).join(" | ")} |`,
      ),
      "",
      "| Feature / scope | Status | Source | Decision |",
      "|---|---|---|---|",
      ...b.features.map(
        (x) =>
          `| ${cell(x.name)} | ${x.status} | ${source(x.source)} | ${cell(x.reason)} |`,
      ),
      "",
    );
    const exceptions = b.records.filter((x) => x.status !== "implemented");
    if (exceptions.length)
      lines.push(
        "<details>",
        "<summary>Profile exceptions and adaptations</summary>",
        "",
        "| Content ID / name | Kind | Status | Source | Decision |",
        "|---|---|---|---|---|",
        ...exceptions.map((x) =>
          `| \`${x.contentId}\` — ${cell(x.name)} | ${x.kind} | ${x.status} | ${source(x.source)} | ${cell(x.reason)} |`.replaceAll(
            "\`",
            "`",
          ),
        ),
        "",
        "</details>",
        "",
      );
  }
  lines.push(
    "## Reviewed aliases",
    "",
    "Aliases are exact and scoped; they are not fuzzy substitutions. The active `contentId` is required to distinguish same-name Career alternatives. No mapping is invented for the withdrawn Archives I Dwarf weapons.",
    "",
    "| Kind / scope | Printed name | Canonical name | Source | Decision |",
    "|---|---|---|---|---|",
    ...report.aliases.map(
      (x) =>
        `| ${x.kind} / ${x.scope || "shared"} | ${cell(x.from)} | ${cell(x.to)} | ${x.source.book} ${source(x.source)} | ${cell(x.reason)} |`,
    ),
    "",
  );
  return lines.join("\n");
}
export function countSummary(report) {
  const c = report.activeCounts;
  return `With all ${c.books} books enabled: **${c.careers} Career profiles**, **${c.magicProfiles} magic profiles** (including **${c.rituals} rituals**), **${c.cants} Cants**, **${c.techniques} Sword-dancing techniques**, **${c.runes} rune entries**, and **${c.pricedShopEntries} fixed-price shop entries**. Career alternatives remain explicit choices. Source counts, adaptations and exclusions: [inclusion matrix](docs/INCLUSION-MATRIX.md).`;
}
