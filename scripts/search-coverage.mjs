// Build-only audit. Creator inclusion status and search availability are separate.
import { createHash } from "node:crypto";
import { isSearchCategoryEnabled } from "../dist/reference-entries.mjs";

// Git can convert text files to CRLF on Windows. Review the UTF-8/LF content,
// so a fresh checkout does not invalidate an unchanged source review.
export const referenceContentHash = (text) =>
  createHash("sha256")
    .update(String(text).replaceAll("\r\n", "\n"))
    .digest("hex");

// These are explicit editorial decisions, never a keyword filter at runtime.
// Keep the removed identities frozen so rebuilding packs cannot restore them.
function validateRulesAudit(pack, rows, audit, byKey) {
  if (!audit) return null;
  const book = pack.manifest.id;
  const reasons = ["introduction", "setting", "advice", "penance-example"];
  const sourceIds = new Set(
    [
      ...(pack.data.referenceEntries || []),
      ...(pack.data.ruleReferences || []),
    ].map((entry) => entry.id),
  );
  const ids = new Set(),
    keys = new Set();
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(audit.date || "") ||
    !Number.isInteger(audit.reviewedRuleResults) ||
    audit.reviewedRuleResults < 1 ||
    !Array.isArray(audit.removed) ||
    !audit.removed.length
  )
    throw Error(`Invalid Rules audit: ${book}`);
  for (const entry of audit.removed) {
    if (
      typeof entry.id !== "string" ||
      !entry.id.startsWith(`${book}:`) ||
      typeof entry.key !== "string" ||
      ![entry.id, `rule:${entry.id}:${entry.name}`].includes(entry.key) ||
      typeof entry.name !== "string" ||
      !entry.name.trim() ||
      !(
        (Number.isInteger(entry.page) && entry.page > 0) ||
        (typeof entry.page === "string" &&
          /^[1-9]\d*[–-][1-9]\d*$/.test(entry.page))
      ) ||
      !reasons.includes(entry.reason) ||
      ids.has(entry.id) ||
      keys.has(entry.key)
    )
      throw Error(`Invalid Rules exclusion: ${book}`);
    if (sourceIds.has(entry.id) || byKey.has(entry.key))
      throw Error(`Excluded non-mechanical rule was restored: ${entry.key}`);
    ids.add(entry.id);
    keys.add(entry.key);
  }
  if (
    rows.filter((r) => r.kind === "rule").length + audit.removed.length !==
    audit.reviewedRuleResults
  )
    throw Error(`Rules audit count is stale: ${book}`);
  return audit;
}

export function searchCoverage(library, corpus, review, gm) {
  if (review?.schemaVersion !== 1 || !review.books || !review.scope)
    throw Error("Missing reviewed search inventory.");
  const byKey = new Map(corpus.rows.map((row) => [row.key, row]));
  const retainedOutsideSearch = new Set(
    library.packs.flatMap((p) =>
      (p.data.referenceEntries || [])
        .filter((e) => !isSearchCategoryEnabled(e.category))
        .map((e) => e.id),
    ),
  );
  const retainedReviewTargets = new Set([
    ...retainedOutsideSearch,
    ...(gm?.profiles || []).map((e) => e.id),
    ...(gm?.templates || []).map((e) => e.id),
  ]);
  const books = library.packs
    .filter((p) => p.manifest.kind !== "variant")
    .map((pack) => {
      const id = pack.manifest.id,
        audit = review.books[id];
      if (!audit || audit.sourceHash !== pack.manifest.source.sha256)
        throw Error(`Search source review is stale: ${id}`);
      const rows = corpus.rows.filter((row) => row.entry.source.book === id);
      const imported = rows.filter((row) => row.printedReference);
      const retained = pack.data.referenceEntries || [];
      if (
        audit.entries !== retained.length ||
        retained.some((e) =>
          isSearchCategoryEnabled(e.category)
            ? !byKey.get(e.id)?.printedReference
            : byKey.has(e.id),
        )
      )
        throw Error(`Search import count differs from its review: ${id}`);
      const dispositions = {};
      for (const record of audit.records) {
        if (
          ![
            "included",
            "existing",
            "excluded",
            "consolidated",
            "unresolved",
          ].includes(record.disposition)
        )
          throw Error(`Unknown search review disposition: ${record.id}`);
        dispositions[record.disposition] =
          (dispositions[record.disposition] || 0) + 1;
        for (const target of record.targets ||
          (record.disposition === "included" ? [record.id] : []))
          if (!byKey.has(target) && !retainedReviewTargets.has(target))
            throw Error(`Search review target is missing: ${target}`);
      }
      const categories = {};
      for (const row of rows)
        categories[row.kind] = (categories[row.kind] || 0) + 1;
      return {
        id,
        title: pack.manifest.title,
        version: pack.manifest.version,
        edition: pack.manifest.edition,
        sourceHash: audit.sourceHash,
        references: rows.length,
        newlyImported: imported.length,
        retainedOutsideSearch: retained.filter(
          (e) => !isSearchCategoryEnabled(e.category),
        ).length,
        existingReferences: rows.length - imported.length,
        adaptedReferences: rows.filter((row) => row.legacy.length).length,
        categories,
        dispositions,
        rulesAudit: validateRulesAudit(pack, rows, audit.rulesAudit, byKey),
        areas: audit.areas,
        unresolved: audit.unresolvedProfiles || [],
      };
    });
  return {
    schemaVersion: 1,
    scope: review.scope,
    references: corpus.rows.length,
    newlyImported: books.reduce((sum, b) => sum + b.newlyImported, 0),
    retainedOutsideSearch: retainedOutsideSearch.size,
    removedNonMechanicalRules: books.reduce(
      (sum, b) => sum + (b.rulesAudit?.removed.length || 0),
      0,
    ),
    books,
  };
}
export function searchCoverageMarkdown(report) {
  const lines = [
    "# Search coverage",
    "",
    "Generated by `npm run generate:books` from the installed registry and the frozen source review. Do not edit counts by hand.",
    "",
    report.scope,
    "",
    "Search availability does not enable creation or play automation. Fourth Edition references preserve printed mechanics and carry an edition warning. Legacy remains reserved for actual approved adaptations. Excluded extraction text is not shipped. Reviewed NPC/creature source records are retained in their book files for possible future use but excluded from the shared search, its reader and chaining. Core GM profiles/templates remain available in the workshop. The audit counts extraction sections, which can be consolidated into one reference; they are not page-completeness percentages.",
    "",
    `The common PC/GM catalogue contains **${report.references} results**, including **${report.newlyImported} new printed references**. Existing profiles include grouped specialisations and reference variants.`,
    `A further **${report.retainedOutsideSearch} reviewed NPC/creature records** are retained outside search. NPCs & Creatures and Templates are not active search categories.`,
    `The Rules audit explicitly removed **${report.removedNonMechanicalRules} non-mechanical entries**; **${report.books.reduce((sum, b) => sum + (b.categories.rule || 0), 0)} Rules results** remain. Qualitative requirements and worked mechanical examples remain eligible; numbers are not required.`,
    "",
    "| Book | Version | Existing results | New printed references | Total | Results with actual adaptations |",
    "|---|---|---:|---:|---:|---:|",
  ];
  for (const b of report.books)
    lines.push(
      `| ${b.title} | ${b.version} | ${b.existingReferences} | ${b.newlyImported} | ${b.references} | ${b.adaptedReferences} |`,
    );
  lines.push(
    "",
    "## Source review",
    "",
    "The following ranges are gameplay extraction/review areas, supplemented by isolated printed profiles elsewhere in each PDF. Existing named options stay in their approved catalogue form; this release does not reconstruct every older version of those options. Setting-only prose, adventure scenes/plots and secrets are excluded. Source boundary or layout problems must be resolved before publishing a section, or recorded as unresolved.",
    "",
  );
  for (const b of report.books) {
    lines.push(
      `### ${b.title}`,
      "",
      `Source SHA-256: \`${b.sourceHash}\`.`,
      "",
      ...b.areas.map(
        (a) =>
          `- pp. ${a.first}${a.last === a.first ? "" : `–${a.last}`}: ${a.topic}.`,
      ),
      "",
      `Candidate sections: ${Object.entries(b.dispositions)
        .map(([k, v]) => `${k} ${v}`)
        .join("; ")}.`,
      "",
      `Categories: ${Object.entries(b.categories)
        .map(([k, v]) => `${k} ${v}`)
        .join("; ")}.`,
      `Reviewed printed records retained outside search: ${b.retainedOutsideSearch}.`,
      "",
    );
    if (b.rulesAudit)
      lines.push(
        `Rules audit (${b.rulesAudit.date}): ${b.rulesAudit.reviewedRuleResults} prior results; ${b.rulesAudit.removed.length} excluded. The following standalone entries were removed from published reference sources.`,
        "",
        "| Page | Excluded entry | Reason |",
        "|---:|---|---|",
        ...b.rulesAudit.removed.map(
          (e) =>
            `| ${e.page} | ${e.name.replaceAll("|", "\\|")} | ${e.reason} |`,
        ),
        "",
      );
    if (b.unresolved.length)
      lines.push(
        "Unresolved extraction checks:",
        "",
        ...b.unresolved.map((x) => `- p. ${x.page}: ${x.reason}.`),
        "",
      );
    else
      lines.push(
        "No outstanding stat-block extraction checks in this inventory. This does not assert that every gameplay sentence in the PDF is indexed.",
        "",
      );
  }
  lines.push(
    "## Maintenance",
    "",
    "Keep creator exclusions in INCLUSION-MATRIX.md and book docs distinct from reference-search coverage here. Rules must contain a concrete game procedure, calculation, definition, restriction or effect; introductions, history/flavour, empty cross-references and general storytelling advice are excluded. This is source review, not runtime keyword filtering. The build rejects restored Rules-audit identities and stale per-book counts. Review new Rules and update their frozen audit baseline when adding them. The build checks source and published-content hashes against scripts/search-reference-review.json. Published text hashes use UTF-8/LF content so Git's Windows newline conversion does not invalidate an unchanged review; source PDF hashes remain byte-exact. Review new pages and update that inventory when changing printed references; do not repair a hash mismatch by dropping the check. Raw staging and original PDFs remain outside dist. Extraction tools only stage candidates; they never register or publish them.",
    "",
  );
  return lines.join("\n");
}
