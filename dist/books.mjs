import { validateCoverage } from "./book-coverage.mjs";
import {
  CONTENT_ALIASES,
  validateAliases,
  validateAliasTargets,
} from "./content-references.mjs";
import { dwarfIssues } from "./dwarf-guide.mjs";
import { validateElfState, validateElfCreation } from "./high-elf.mjs";
import { cultIssues } from "./cults.mjs";
import { KEYS, canon, base, options, skillInfo, talentInfo } from "./rules.mjs";
import { careerSpecies, careerAvailable } from "./origins.mjs";
import { validateChartState } from "./astrology.mjs";
import { validateIIIState, oldFaith, spellChoices } from "./archives-iii.mjs";
import { validateWoMState } from "./winds-of-magic.mjs";

export const BOOK_SCHEMA = 1;
const arrays = [
  "careers",
  "skills",
  "talents",
  "spells",
  "gear",
  "weapons",
  "armour",
  "market",
  "tables",
  "origins",
  "astrology",
  "cants",
  "cults",
  "careerUpdates",
  "runes",
  "techniques",
];
const files = new Set([
  ...arrays,
  "species",
  "background",
  "career-rolls",
  "source",
  "config",
  "rules",
  "withdrawals",
  "dwarfCreation",
  "highElfCreation",
  "coverage",
]);
const settings = new Set([
  "talentEffects",
  "talentLimits",
  "talentOptions",
  "skillOptions",
  "colours",
  "gods",
  "blessings",
  "classKit",
  "containers",
  "carriers",
  "gearEnc",
]);
const plain = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const nonempty = (x) => typeof x === "string" && x.trim().length > 0;
const strings = (x) => Array.isArray(x) && x.every(nonempty);
const slug = (x) =>
  x
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const fail = (message) => {
  throw Error(`Book pack: ${message}`);
};
const pageOK = (p) =>
  (Number.isInteger(p) && p > 0) ||
  (typeof p === "string" && /^\d+(?:[–—-]\d+)?$/.test(p));
const unsafe = (x) => ["__proto__", "prototype", "constructor"].includes(x);
export function validateBackgroundTable(table, label) {
  if (
    !plain(table) ||
    Object.keys(table).some(
      (k) => !["name", "page", "dice", "rows"].includes(k),
    ) ||
    !pageOK(table.page) ||
    !Array.isArray(table.dice) ||
    table.dice.length !== 2 ||
    ![
      [1, 100],
      [2, 10],
    ].some(
      ([count, sides]) => table.dice[0] === count && table.dice[1] === sides,
    ) ||
    !Array.isArray(table.rows) ||
    !table.rows.length
  )
    fail(`${label}: unsupported background dice table.`);
  const [count, sides] = table.dice;
  for (const row of table.rows)
    if (
      !plain(row) ||
      Object.keys(row).some((k) => !["min", "max", "result"].includes(k)) ||
      !Number.isInteger(row.min) ||
      !Number.isInteger(row.max) ||
      row.min < count ||
      row.max > count * sides ||
      row.min > row.max ||
      !nonempty(row.result)
    )
      fail(`${label}: invalid background row.`);
  for (let n = count; n <= count * sides; n++)
    if (table.rows.filter((row) => n >= row.min && n <= row.max).length !== 1)
      fail(`${label}: missing or overlapping result ${n}.`);
  return table;
}
const columns = {
  techniques: ["sl", "text"],
  careerUpdates: ["careers", "characteristic", "profile", "unavailable"],
  runes: ["form", "master", "sl", "text"],
  cults: ["miracles", "text"],
  cants: ["lore", "text"],
  astrology: [
    "min",
    "max",
    "adjustments",
    "talent",
    "witchling",
    "text",
    "classical",
    "ascendant",
    "calendar",
    "god",
    "appearance",
    "profilePage",
  ],
  careers: [
    "class",
    "species",
    "advanceScheme",
    "levels",
    "runtimeId",
    "requiredOrigins",
    "randomAlternativeFor",
    "text",
    "alternativeFor",
  ],
  skills: ["char", "advanced", "grouped", "options", "text", "speciesOnly"],
  talents: ["text", "unavailable", "limit", "speciesOnly"],
  spells: [
    "category",
    "text",
    "range",
    "target",
    "duration",
    "cn",
    "specialisations",
    "ritual",
    "requiredLores",
  ],
  gear: [
    "price",
    "enc",
    "capacity",
    "availability",
    "category",
    "text",
    "ammunition",
    "wearable",
    "ogreSized",
  ],
  market: [
    "price",
    "enc",
    "availability",
    "category",
    "text",
    "ammunition",
    "wearable",
    "ogreSized",
  ],
  weapons: ["group", "enc", "reach", "damage", "qualities", "kind", "text"],
  armour: ["enc", "locations", "ap", "qualities", "quick", "layer"],
  species: [
    "offsets",
    "languages",
    "fate",
    "fortune",
    "movement",
    "age",
    "height",
    "skills",
    "talents",
    "randomTalents",
    "mechanics",
    "appearancePage",
  ],
  background: [
    "forenames",
    "surnames",
    "eyes",
    "hair",
    "clans",
    "rollTables",
    "nameElements",
    "imperialNames",
    "namePages",
  ],
  tables: ["kind", "sides", "rows", "species", "career", "origin", "origins"],
  origins: [
    "species",
    "languages",
    "skills",
    "talents",
    "randomTalents",
    "background",
    "optionalTalent",
    "careerChoices",
    "allowedPatrons",
    "careerSpecies",
    "grantedTalents",
    "sheetSpecies",
    "classNote",
    "text",
    "additionalCareers",
    "randomTalentAlternative",
    "careers",
    "careerTable",
  ],
};

export function validateManifest(p) {
  if (
    !plain(p) ||
    p.schemaVersion !== BOOK_SCHEMA ||
    !/^\w[\w-]*$/.test(p.id) ||
    !nonempty(p.title) ||
    !nonempty(p.version)
  )
    fail("invalid manifest identity or schema.");
  if (
    !["core", "supplement", "variant"].includes(p.kind) ||
    ![4, 5].includes(p.edition)
  )
    fail(`${p.id}: invalid kind or edition.`);
  if (!strings(p.dependsOn) || p.dependsOn.includes(p.id))
    fail(`${p.id}: invalid dependencies.`);
  if (
    !plain(p.source) ||
    !nonempty(p.source.file) ||
    !/^[a-f0-9]{64}$/i.test(p.source.sha256)
  )
    fail(`${p.id}: source file and SHA-256 are required.`);
  if (
    p.edition === 4 &&
    (!p.compatibility?.reviewed ||
      !strings(p.compatibility.notes) ||
      !p.compatibility.notes.length)
  )
    fail(`${p.id}: Fourth Edition conversion review is required.`);
  if (!plain(p.files) || Object.keys(p.files).some((k) => !files.has(k)))
    fail(`${p.id}: unsupported data file.`);
  if (
    p.kind !== "core" &&
    ["config", "source", "career-rolls"].some((k) => k in p.files)
  )
    fail(
      `${p.id}: use rules or explicit tables rather than replacing core configuration.`,
    );
  return p;
}

// readJSON is injected so the exact browser loader is also used by build/tests.
export async function loadBookLibrary(
  readJSON,
  registryURL = new URL("./data/books/index.json", import.meta.url),
) {
  const index = await readJSON(registryURL);
  if (
    index.schemaVersion !== BOOK_SCHEMA ||
    index.core !== "core" ||
    !Array.isArray(index.packs)
  )
    fail("invalid registry; the Fifth Edition base pack must be core.");
  const seen = new Set();
  for (const item of index.packs) {
    if (!nonempty(item.id) || seen.has(item.id) || !nonempty(item.path))
      fail("duplicate or invalid registered book.");
    seen.add(item.id);
  }
  const packs = await Promise.all(
    index.packs.map(async (item) => {
      const url = new URL(item.path, registryURL);
      if (
        url.origin !== registryURL.origin ||
        !url.href.startsWith(new URL("./", registryURL).href)
      )
        fail("manifest must be inside the books directory.");
      const manifest = validateManifest(await readJSON(url));
      if (manifest.id !== item.id) fail("registry and manifest IDs differ.");
      const entries = await Promise.all(
        Object.entries(manifest.files).map(async ([key, path]) => {
          if (!nonempty(path)) fail(`${item.id}: missing file path.`);
          const file = new URL(path, url),
            dataRoot = new URL("../", registryURL);
          if (
            file.origin !== url.origin ||
            !file.href.startsWith(dataRoot.href)
          )
            fail(`${item.id}: data must stay inside the data directory.`);
          return [key, await readJSON(file)];
        }),
      );
      return { manifest, data: Object.fromEntries(entries) };
    }),
  );
  const core = packs.find((p) => p.manifest.id === index.core);
  if (
    !core ||
    core.manifest.kind !== "core" ||
    packs.filter((p) => p.manifest.kind === "core").length !== 1
  )
    fail("exactly one registered core book is required.");
  for (const p of packs)
    for (const id of p.manifest.dependsOn)
      if (!seen.has(id)) fail(`${p.manifest.id}: missing dependency ${id}.`);
  // Validate every pack, including disabled ones, in its dependency context.
  const library = {
    schemaVersion: BOOK_SCHEMA,
    core: index.core,
    packs,
    aliases: validateAliases(CONTENT_ALIASES, [...seen]),
  };
  for (const p of packs) validateCoverage(p, registeredEntries(p));
  validateAliasTargets(
    library.aliases,
    packs.flatMap(registeredEntries),
    core.data.config,
  );
  for (const p of packs)
    for (const c of p.data.careers || [])
      if (
        c.alternativeFor &&
        !packs.some((q) =>
          (q.data.careers || []).some(
            (t) => t.id === c.alternativeFor && t.name === c.name,
          ),
        )
      )
        fail(`${c.id}: alternate profile needs an installed same-name Career.`);
  for (const p of packs)
    for (const u of p.data.careerUpdates || [])
      if (
        !strings(u.careers) ||
        u.careers.some(
          (id) =>
            !packs.some((q) => (q.data.careers || []).some((c) => c.id === id)),
        )
      )
        fail(`${u.id}: Career update needs installed target Careers.`);
  for (const p of packs) {
    if (p.data.withdrawals !== undefined) {
      if (!Array.isArray(p.data.withdrawals))
        fail(`${p.manifest.id}: withdrawals must be an array.`);
      for (const w of p.data.withdrawals) {
        const target = packs.find((q) => q.manifest.id === w.book);
        if (
          !plain(w) ||
          Object.keys(w).some(
            (k) =>
              !["id", "book", "kind", "target", "page", "reason"].includes(k),
          ) ||
          !nonempty(w.id) ||
          !w.id.startsWith(p.manifest.id + ":") ||
          !["weapons", "market", "gear"].includes(w.kind) ||
          w.book === p.manifest.id ||
          !pageOK(w.page) ||
          !nonempty(w.reason) ||
          !target?.data[w.kind]?.some((t) => t.id === w.target)
        )
          fail(
            `${p.manifest.id}: withdrawal needs an installed equipment target and a sourced reason.`,
          );
      }
    }
  }
  for (const p of packs)
    for (const kind of arrays)
      for (const x of p.data[kind] || [])
        if (x.supersededBy) {
          const v = x.supersededBy;
          if (
            !plain(v) ||
            Object.keys(v).some(
              (k) => !["book", "contentId", "reason"].includes(k),
            ) ||
            !nonempty(v.reason) ||
            v.book === p.manifest.id ||
            !packs
              .find((q) => q.manifest.id === v.book)
              ?.data[
                kind
              ]?.some((t) => t.id === v.contentId && t.name === x.name)
          )
            fail(
              `${x.id}: superseding content must name another installed book's same-name option and a reason.`,
            );
        }
  for (const p of packs) assembleBooks(library, [p.manifest.id]);
  return library;
}

export function selectedPacks(library, ids = [library.core]) {
  if (!strings(ids) || new Set(ids).size !== ids.length)
    fail("invalid selected books.");
  const result = [],
    done = new Set(),
    visiting = new Set();
  function visit(id) {
    if (done.has(id)) return;
    if (visiting.has(id)) fail(`dependency cycle at ${id}.`);
    const p = library.packs.find((p) => p.manifest.id === id);
    if (!p) fail(`unknown book ${id}.`);
    visiting.add(id);
    for (const dep of p.manifest.dependsOn) visit(dep);
    visiting.delete(id);
    done.add(id);
    result.push(p);
  }
  visit(library.core);
  for (const id of ids) visit(id);
  return result;
}

function entryFor(pack, kind, value, key) {
  const entry = structuredClone(value);
  if (!plain(entry) || !pageOK(entry.page))
    fail(`${pack.id}/${kind}: a printed page is required.`);
  const allowed = new Set([
    "id",
    "contentId",
    "name",
    "page",
    "conversion",
    "adaptation",
    "replaces",
    "reason",
    "supersededBy",
    ...columns[kind],
  ]);
  if (Object.keys(entry).some((k) => !allowed.has(k)))
    fail(
      `${pack.id}/${kind}: unsupported fields need an implemented rule handler.`,
    );
  entry.name ??= key;
  if (!nonempty(entry.name)) fail(`${pack.id}/${kind}: name is required.`);
  const identity =
    entry.contentId || entry.id || `${pack.id}:${kind}:${slug(entry.name)}`;
  entry.contentId = identity.startsWith(pack.id + ":")
    ? identity
    : `${pack.id}:${kind}:${identity}`;
  if (
    pack.kind !== "core" &&
    (!nonempty(value.id) || !value.id.startsWith(pack.id + ":"))
  )
    fail(`${pack.id}/${kind}: explicit namespaced ID is required.`);
  entry.id ??= entry.contentId;
  if (entry.runtimeId) {
    if (pack.kind !== "variant" || !entry.replaces || kind !== "careers")
      fail("runtimeId is only supported on Career replacements.");
    entry.id = entry.runtimeId;
  }
  entry.source = { book: pack.id, page: entry.page };
  if (entry.adaptation !== undefined && !nonempty(entry.adaptation))
    fail(
      `${entry.contentId}: adaptation must explain an actual Fifth Edition rule change.`,
    );
  if (entry.conversion !== undefined && !nonempty(entry.conversion))
    fail(`${entry.contentId}: conversion note must be text.`);
  return entry;
}
function mergeEntry(R, pack, kind, value, key) {
  const entry = entryFor(pack, kind, value, key),
    list =
      kind === "species" || kind === "background"
        ? Object.values(R[kind]).filter(plain)
        : R[kind];
  if (entry.supersededBy) {
    const v = entry.supersededBy;
    if (
      !plain(v) ||
      !nonempty(v.book) ||
      !nonempty(v.contentId) ||
      !nonempty(v.reason)
    )
      fail(`${entry.contentId}: invalid conditional precedence.`);
    if (R.books.some((b) => b.id === v.book)) {
      R.contentDecisions.push({
        name: entry.name,
        source: entry.source,
        reason: v.reason,
      });
      return;
    }
  }
  const old = list.find((x) => x.contentId === value.replaces);
  if (value.replaces) {
    if (pack.kind !== "variant" || !old || !nonempty(value.reason))
      fail(
        `${entry.contentId}: replacement needs a selected variant, existing target and reason.`,
      );
    if (
      old.name !== entry.name ||
      (old.id !== entry.id && kind === "careers") ||
      (kind === "weapons" && old.kind !== entry.kind)
    )
      fail(
        `${entry.contentId}: replacement must preserve the target name, weapon kind and Career ID via runtimeId.`,
      );
    entry.replaces = old.contentId;
    if (kind === "species" || kind === "background") R[kind][key] = entry;
    else R[kind][R[kind].indexOf(old)] = entry;
  } else {
    const sameName = (x) =>
      kind === "talents"
        ? base(canon(x.name)).toLowerCase() ===
          base(canon(entry.name)).toLowerCase()
        : x.name.toLowerCase() === entry.name.toLowerCase() &&
          (kind !== "weapons" || x.kind === entry.kind) &&
          (kind !== "runes" || x.form === entry.form);
    if (
      list.some(
        (x) =>
          x.contentId === entry.contentId ||
          (sameName(x) &&
            !(
              kind === "careers" &&
              (entry.alternativeFor === x.id || x.alternativeFor === entry.id)
            )) ||
          x.id === entry.id,
      )
    )
      fail(
        `${entry.contentId}: duplicate option; declare an explicit variant replacement.`,
      );
    if (kind === "species" || kind === "background") R[kind][key] = entry;
    else R[kind].push(entry);
  }
}
function applyRules(R, p, rules) {
  if (!Array.isArray(rules)) fail(`${p.id}: rules must be an array.`);
  for (const rule of rules) {
    if (
      !plain(rule) ||
      !nonempty(rule.id) ||
      !rule.id.startsWith(p.id + ":") ||
      !strings(rule.path) ||
      ![1, 2].includes(rule.path.length) ||
      rule.path.some(unsafe) ||
      !settings.has(rule.path[0]) ||
      !pageOK(rule.page) ||
      !nonempty(rule.reason)
    )
      fail(`${p.id}: unsupported or unsourced rule extension.`);
    if (
      rule.path[0] === "talentOptions" &&
      [
        "Artistic",
        "Arcane Magic",
        "Bless",
        "Invoke",
        "Craftsman",
        "Master Tradesman",
        "Savant",
      ].includes(rule.path[1])
    )
      fail(
        `${rule.id}: change the relevant Skill, gods or colours instead of a derived option list.`,
      );
    const [group, key] = rule.path,
      target = key === undefined ? R.config : R.config[group],
      field = key ?? group;
    if (!plain(target)) fail(`${rule.id}: invalid setting path.`);
    const existing = Object.hasOwn(target, field);
    if (rule.operation === "add") {
      if (existing) fail(`${rule.id}: setting already exists.`);
      target[field] = structuredClone(rule.value);
    } else if (rule.operation === "append") {
      if (
        !Array.isArray(target[field]) ||
        !strings(rule.value) ||
        rule.value.some((x) => target[field].includes(x))
      )
        fail(`${rule.id}: append requires new array options.`);
      target[field].push(...rule.value);
    } else if (rule.operation === "replace") {
      if (p.kind !== "variant" || !existing)
        fail(`${rule.id}: rule replacement requires a selected variant.`);
      target[field] = structuredClone(rule.value);
    } else fail(`${rule.id}: unknown rule operation.`);
    R.ruleSources[JSON.stringify(rule.path)] = {
      book: p.id,
      page: rule.page,
      reason: rule.reason,
    };
    R.rules.push({
      ...structuredClone(rule),
      contentId: rule.id,
      source: { book: p.id, page: rule.page },
    });
  }
}

export function assembleBooks(library, ids = [library.core]) {
  const packs = selectedPacks(library, ids),
    R = {
      species: {},
      background: {},
      config: {},
      rules: [],
      ruleSources: {},
      contentDecisions: [],
      books: packs.map((p) => ({ ...p.manifest, files: undefined })),
      selection: packs.map((p) => ({
        id: p.manifest.id,
        version: p.manifest.version,
      })),
    };
  for (const key of arrays) R[key] = [];
  for (const { manifest: p, data } of packs) {
    if (p.kind === "core") {
      R.source = structuredClone(data.source);
      R.config = structuredClone(data.config);
      R["career-rolls"] = structuredClone(data["career-rolls"]);
    }
    for (const key of arrays) {
      if (data[key] === undefined) continue;
      if (!Array.isArray(data[key])) fail(`${p.id}: ${key} must be an array.`);
      for (const entry of data[key]) {
        if (
          !packs.some((q) =>
            (q.data.withdrawals || []).some(
              (w) =>
                w.kind === key &&
                w.target === entry.id &&
                R.books.some((b) => b.id === w.book),
            ),
          )
        )
          mergeEntry(R, p, key, entry);
      }
    }
    for (const key of ["species", "background"]) {
      if (data[key] === undefined) continue;
      if (!plain(data[key])) fail(`${p.id}: ${key} must be an object.`);
      for (const [name, value] of Object.entries(data[key])) {
        if (unsafe(name)) fail("unsafe content key.");
        if (key === "background" && name === "doomings") {
          if (p.kind !== "core")
            fail("alternate Dooming tables need an implemented rule handler.");
          R.background.doomings = structuredClone(value);
          continue;
        }
        mergeEntry(R, p, key, value, name);
      }
    }
    if (data.highElfCreation) {
      if (p.id !== "high-elf" || R.highElfCreation)
        fail("unsupported High Elf creation source.");
      R.highElfCreation = structuredClone(data.highElfCreation);
    }
    if (data.dwarfCreation) {
      if (p.id !== "dwarf-guide" || R.dwarfCreation)
        fail("unsupported Dwarf creation source.");
      R.dwarfCreation = structuredClone(data.dwarfCreation);
    }
    if (data.rules) applyRules(R, p, data.rules);
  }
  // Explicit cross-name withdrawals are applied after every pack, independent of selection order.
  for (const p of packs)
    for (const w of p.data.withdrawals || []) {
      if (!R.books.some((b) => b.id === w.book)) continue;
      const original = packs
        .find((q) => q.manifest.id === w.book)
        .data[w.kind].find((x) => x.id === w.target);
      R.contentDecisions.push({
        name: original.name,
        source: { book: p.manifest.id, page: w.page },
        reason: w.reason,
      });
    }
  validateCatalog(R);
  return R;
}

export function validateCatalog(R) {
  const C = R.config;
  if (R.highElfCreation) validateElfCreation(R);
  for (const x of R.techniques)
    if (
      x.source.book !== "high-elf" ||
      !Number.isInteger(x.sl) ||
      x.sl < 1 ||
      !nonempty(x.text)
    )
      fail("invalid Sword-dancing technique.");
  for (const x of R.spells)
    if (
      x.category === "Elven Arcane"
        ? !strings(x.requiredLores) ||
          x.requiredLores.length !== 2 ||
          new Set(x.requiredLores).size !== 2 ||
          x.requiredLores.some((l) => !C.colours.includes(l))
        : x.requiredLores !== undefined
    )
      fail(`${x.name}: invalid Elven Arcane requirements.`);
  if (!plain(C) || Object.keys(C).some((k) => !settings.has(k)))
    fail("unsupported core setting.");
  for (const key of settings) if (!(key in C)) fail(`missing setting ${key}.`);
  for (const key of ["gods", "colours"])
    if (
      !strings(C[key]) ||
      !C[key].length ||
      new Set(C[key]).size !== C[key].length
    )
      fail(`invalid ${key}.`);
  for (const key of ["talentOptions", "skillOptions", "blessings", "classKit"])
    if (!plain(C[key]) || Object.values(C[key]).some((x) => !strings(x)))
      fail(`invalid ${key}.`);
  for (const [name, opts] of Object.entries(C.skillOptions))
    if (
      !R.skills.some((x) => x.name === name && x.grouped) ||
      new Set(opts).size !== opts.length ||
      opts.some((x) =>
        R.skills.find((s) => s.name === name).options.includes(x),
      )
    )
      fail(`${name}: invalid additional Skill specialisations.`);
  for (const key of ["containers", "carriers", "gearEnc"])
    if (
      !plain(C[key]) ||
      Object.values(C[key]).some((x) => !Number.isFinite(x) || x < 0)
    )
      fail(`invalid ${key}.`);
  if (
    !plain(C.talentEffects) ||
    Object.values(C.talentEffects).some((x) => !KEYS.includes(x))
  )
    fail("invalid Talent Characteristic effects.");
  if (
    !plain(C.talentLimits) ||
    Object.values(C.talentLimits).some(
      (x) => x !== null && (!Number.isInteger(x) || x < 1),
    )
  )
    fail("invalid Talent repeat limits.");
  const ids = new Set();
  for (const key of arrays.concat("species", "background", "rules"))
    for (const x of (Array.isArray(R[key])
      ? R[key]
      : Object.values(R[key])
    ).filter(plain)) {
      if (ids.has(x.contentId)) fail(`duplicate content ID ${x.contentId}.`);
      ids.add(x.contentId);
    }
  for (const x of R.skills)
    if (
      !KEYS.includes(x.char) ||
      typeof x.advanced !== "boolean" ||
      typeof x.grouped !== "boolean" ||
      (x.grouped && !strings(x.options))
    )
      fail(`${x.name}: invalid Skill.`);
  for (const x of R.skills)
    if (
      x.speciesOnly !== undefined &&
      (!strings(x.speciesOnly) || x.speciesOnly.some((n) => !R.species[n]))
    )
      fail(`${x.name}: invalid Skill Species restriction.`);
  for (const x of R.skills)
    if (x.text !== undefined && !nonempty(x.text))
      fail(`${x.name}: Skill description must be text.`);
  const ritualLores = new Set(
    R.spells
      .map((x) => x.category)
      .filter(
        (x) =>
          !["Petty", "Arcane", "Blessing", "Ritual", ...C.gods].includes(x),
      ),
  );
  for (const x of R.spells)
    if (x.ritual !== undefined) {
      const v = x.ritual,
        distinct = (xs) =>
          strings(xs) && xs.length > 0 && new Set(xs).size === xs.length;
      if (
        x.category !== "Ritual" ||
        !plain(v) ||
        Object.keys(v).some(
          (k) =>
            !["lores", "learningXP", "discountLores", "discountXP"].includes(k),
        ) ||
        !distinct(v.lores) ||
        v.lores.some((l) => l !== "*" && !ritualLores.has(l)) ||
        (v.lores.includes("*") && v.lores.length !== 1) ||
        !Number.isInteger(v.learningXP) ||
        v.learningXP <= 0 ||
        (v.discountLores === undefined) !== (v.discountXP === undefined) ||
        (v.discountLores !== undefined &&
          (!distinct(v.discountLores) ||
            v.discountLores.some(
              (l) =>
                !ritualLores.has(l) ||
                (!v.lores.includes("*") && !v.lores.includes(l)),
            ) ||
            !Number.isInteger(v.discountXP) ||
            v.discountXP <= 0 ||
            v.discountXP >= v.learningXP))
      )
        fail(`${x.name}: invalid ritual learning rules.`);
    }
  for (const sign of R.astrology || []) {
    if (
      !pageOK(sign.profilePage) ||
      ![
        "text",
        "classical",
        "ascendant",
        "calendar",
        "god",
        "appearance",
      ].every((key) => nonempty(sign[key]))
    )
      fail(`${sign.name}: incomplete astrology reference.`);
    if (
      !Number.isInteger(sign.min) ||
      !Number.isInteger(sign.max) ||
      sign.min < 1 ||
      sign.max > 100 ||
      sign.min > sign.max ||
      !plain(sign.adjustments) ||
      Object.entries(sign.adjustments).some(
        ([key, value]) => !KEYS.includes(key) || !Number.isInteger(value),
      ) ||
      (sign.talent !== undefined && !talentInfo(R, sign.talent))
    )
      fail(`${sign.name}: invalid star-sign effect.`);
    if (sign.witchling !== undefined) {
      if (
        !Array.isArray(sign.witchling) ||
        sign.witchling.some(
          (row) =>
            !plain(row) ||
            Object.keys(row).some(
              (key) => !["min", "max", "adjustments", "talent"].includes(key),
            ) ||
            !Number.isInteger(row.min) ||
            !Number.isInteger(row.max) ||
            row.min < 1 ||
            row.max > 10 ||
            row.min > row.max ||
            !talentInfo(R, row.talent) ||
            !plain(row.adjustments) ||
            Object.entries(row.adjustments).some(
              ([key, value]) => !KEYS.includes(key) || !Number.isInteger(value),
            ),
        )
      )
        fail(`${sign.name}: invalid Witchling table.`);
      for (let n = 1; n <= 10; n++)
        if (
          sign.witchling.filter((row) => n >= row.min && n <= row.max)
            .length !== 1
        )
          fail(
            `${sign.name}: Witchling result ${n} is missing or overlapping.`,
          );
    }
  }
  if (R.astrology?.length)
    for (let n = 1; n <= 100; n++)
      if (
        R.astrology.filter((sign) => n >= sign.min && n <= sign.max).length !==
        1
      )
        fail(`star-sign result ${n} is missing or overlapping.`);
  for (const x of R.talents) {
    if (
      x.limit !== undefined &&
      !(
        (Number.isInteger(x.limit) && x.limit > 0) ||
        (strings(x.limit) &&
          x.limit.length &&
          x.limit.every((k) => KEYS.includes(k)))
      )
    )
      fail(`${x.name}: invalid dynamic purchase limit.`);
    if (
      x.speciesOnly !== undefined &&
      (!strings(x.speciesOnly) || x.speciesOnly.some((n) => !R.species[n]))
    )
      fail(`${x.name}: invalid Talent Species restriction.`);
  }
  for (const x of R.talents)
    if (
      !nonempty(x.text) ||
      (x.unavailable !== undefined && !nonempty(x.unavailable))
    )
      fail(
        `${x.name}: Talent description and unavailability reason must be text.`,
      );
  for (const x of R.spells) {
    if (
      !["text", "category", "range", "target", "duration"].every((k) =>
        nonempty(x[k]),
      )
    )
      fail(`${x.name}: incomplete spell.`);
    if (
      x.specialisations !== undefined &&
      (!strings(x.specialisations) ||
        !x.specialisations.length ||
        new Set(x.specialisations).size !== x.specialisations.length)
    )
      fail(`${x.name}: invalid spell specialisations.`);
  }
  const spellNames = spellChoices(R).map((x) => x.name);
  if (new Set(spellNames).size !== spellNames.length)
    fail("spell specialisations conflict with another spell name.");
  for (const cant of R.cants)
    if (!C.colours.includes(cant.lore) || !nonempty(cant.text))
      fail(`${cant.name}: invalid Cant Lore or description.`);
  for (const [name, sp] of Object.entries(R.species)) {
    if (
      !plain(sp.offsets) ||
      KEYS.some((k) => !Number.isFinite(sp.offsets[k])) ||
      !strings(sp.languages) ||
      !strings(sp.skills) ||
      !Array.isArray(sp.talents) ||
      sp.talents.some((x) => !strings(x) || !x.length) ||
      !["fate", "fortune", "movement", "randomTalents"].every(
        (k) => Number.isInteger(sp[k]) && sp[k] >= 0,
      ) ||
      !["age", "height"].every(
        (k) =>
          Array.isArray(sp[k]) &&
          sp[k].length === 2 &&
          sp[k].every((x) => Number.isInteger(x) && x >= 0),
      )
    )
      fail(`${name}: incomplete Species.`);
    if (sp.appearancePage !== undefined && !pageOK(sp.appearancePage))
      fail(`${name}: invalid appearance page.`);
    const b = R.background[name];
    if (
      !b ||
      !["forenames", "surnames", "eyes", "hair"].every(
        (k) => strings(b[k]) && b[k].length,
      )
    )
      fail(`${name}: background suggestions are required.`);
    for (const raw of sp.skills)
      if (!skillInfo(R, raw)) fail(`${name}: unknown Skill ${raw}.`);
    for (const choices of sp.talents)
      for (const raw of choices)
        if (!talentInfo(R, raw)) fail(`${name}: unknown Talent ${raw}.`);
    if (
      b.imperialNames !== undefined &&
      (!nonempty(b.imperialNames) || !R.background[b.imperialNames])
    )
      fail(`${name}: unknown Imperial name source.`);
    if (
      b.namePages !== undefined &&
      (!plain(b.namePages) ||
        Object.entries(b.namePages).some(
          ([key, page]) =>
            !["forenames", "surnames"].includes(key) || !pageOK(page),
        ))
    )
      fail(`${name}: invalid name source pages.`);
    if (b.rollTables !== undefined) {
      if (
        !plain(b.rollTables) ||
        Object.keys(b.rollTables).some((k) => !["eyes", "hair"].includes(k))
      )
        fail(`${name}: unsupported appearance table.`);
      for (const [kind, table] of Object.entries(b.rollTables)) {
        validateBackgroundTable(table, `${name} ${kind}`);
        if (
          table.dice[0] !== 2 ||
          table.dice[1] !== 10 ||
          table.rows.some((row) => !b[kind].includes(row.result))
        )
          fail(`${name}: appearance table must use listed colours and 2d10.`);
      }
    }
    if (b.nameElements !== undefined) {
      if (!Array.isArray(b.nameElements) || b.nameElements.length !== 2)
        fail(`${name}: two name-element tables are required.`);
      for (const table of b.nameElements) {
        validateBackgroundTable(table, `${name} name`);
        if (table.dice[0] !== 1 || table.dice[1] !== 100)
          fail(`${name}: name elements require 1d100.`);
      }
    }

    if (sp.mechanics !== undefined) {
      const m = sp.mechanics;
      if (
        !plain(m) ||
        Object.keys(m).some(
          (k) =>
            ![
              "size",
              "capacityMultiplier",
              "careers",
              "skillCharacteristics",
              "skillReplacements",
              "arcaneLores",
              "exclusiveLores",
              "equipmentSizing",
              "gmApproval",
              "magicReferences",
              "references",
            ].includes(k),
        )
      )
        fail(`${name}: unsupported Species mechanics.`);
      if (
        (m.equipmentSizing !== undefined && m.equipmentSizing !== "ogre") ||
        (m.gmApproval !== undefined && !nonempty(m.gmApproval))
      )
        fail(`${name}: invalid equipment sizing or GM requirement.`);
      if (
        m.references !== undefined &&
        (!Array.isArray(m.references) ||
          m.references.some(
            (x) =>
              !plain(x) ||
              Object.keys(x).some((key) => !["text", "page"].includes(key)) ||
              !nonempty(x.text) ||
              !pageOK(x.page),
          ))
      )
        fail(`${name}: invalid Species reference.`);
      if (
        m.magicReferences !== undefined &&
        (!Array.isArray(m.magicReferences) ||
          m.magicReferences.some(
            (x) =>
              !plain(x) ||
              Object.keys(x).some(
                (key) => !["text", "page", "lore"].includes(key),
              ) ||
              !nonempty(x.text) ||
              !pageOK(x.page) ||
              (x.lore !== undefined && !C.colours.includes(x.lore)),
          ))
      )
        fail(`${name}: invalid magic reference.`);
      if (
        (m.size !== undefined && !["Large", "Small"].includes(m.size)) ||
        (m.capacityMultiplier !== undefined && m.capacityMultiplier !== 2)
      )
        fail(`${name}: unsupported size or capacity multiplier.`);
      for (const key of ["careers", "arcaneLores", "exclusiveLores"])
        if (
          m[key] !== undefined &&
          (!strings(m[key]) ||
            !m[key].length ||
            new Set(m[key]).size !== m[key].length)
        )
          fail(`${name}: invalid ${key}.`);
      if (
        m.skillCharacteristics !== undefined &&
        (!plain(m.skillCharacteristics) ||
          Object.entries(m.skillCharacteristics).some(
            ([skill, char]) => !skillInfo(R, skill) || !KEYS.includes(char),
          ))
      )
        fail(`${name}: invalid Skill Characteristic override.`);
      if (
        m.skillReplacements !== undefined &&
        (!plain(m.skillReplacements) ||
          Object.entries(m.skillReplacements).some(
            ([from, to]) =>
              !nonempty(to) ||
              !skillInfo(R, from) ||
              !skillInfo(R, to) ||
              from === to ||
              options(R, to).length !== 1,
          ))
      )
        fail(`${name}: invalid Skill replacement.`);
      for (const lore of [
        ...(m.arcaneLores || []),
        ...(m.exclusiveLores || []),
      ])
        if (!C.colours.includes(lore))
          fail(`${name}: unknown Arcane Lore ${lore}.`);
      if (m.exclusiveLores?.some((lore) => !m.arcaneLores?.includes(lore)))
        fail(`${name}: exclusive Lore must also be allowed.`);
    }
  }
  for (const update of R.careerUpdates) {
    if (
      !strings(update.careers) ||
      !update.careers.length ||
      (update.characteristic !== undefined &&
        !KEYS.includes(update.characteristic)) ||
      (update.unavailable !== undefined && !nonempty(update.unavailable)) ||
      !plain(update.profile) ||
      ![2, 3, 4].includes(update.profile.level) ||
      !nonempty(update.conversion)
    )
      fail(`${update.name}: invalid Career update.`);
    const probe = {
      ...R,
      careerUpdates: [],
      careers: [
        {
          id: update.id,
          name: update.name,
          class: "Warrior",
          species: ["Dwarf"],
          page: update.page,
          advanceScheme: Object.fromEntries(KEYS.map((k) => [k, null])),
          levels: [1, 2, 3, 4].map((level) =>
            level === update.profile.level
              ? update.profile
              : {
                  level,
                  name: "Validation",
                  status: "Brass",
                  standing: 1,
                  skills: [],
                  talents: [],
                  trappings: [],
                },
          ),
        },
      ],
    };
    validateCareerProfiles(probe);
  }
  for (const rune of R.runes)
    if (
      ![
        "Weapon",
        "Armour",
        "Talisman",
        "Protection",
        "Engineering",
        "Doom",
      ].includes(rune.form) ||
      typeof rune.master !== "boolean" ||
      !nonempty(rune.text) ||
      (rune.form !== "Doom" && (!Number.isInteger(rune.sl) || rune.sl < 1))
    )
      fail(`${rune.name}: invalid rune.`);
  if (R.dwarfCreation) {
    const v = R.dwarfCreation;
    if (
      !plain(v) ||
      Object.keys(v).some(
        (k) => !["names", "birthplaces", "longbeard"].includes(k),
      ) ||
      !pageOK(v.names?.page) ||
      !pageOK(v.birthplaces?.page) ||
      !pageOK(v.longbeard?.page) ||
      !nonempty(v.longbeard.text)
    )
      fail("invalid Dwarf creation data.");
    for (const [key, max] of [
      ["names", 1000],
      ["birthplaces", 100],
    ]) {
      const table = v[key];
      if (
        !plain(table) ||
        Object.keys(table).some((k) => !["page", "rows"].includes(k)) ||
        !Array.isArray(table.rows) ||
        !table.rows.length ||
        table.rows.some(
          (row) =>
            !plain(row) ||
            Object.keys(row).some(
              (k) =>
                !(
                  key === "names"
                    ? ["min", "max", "male", "female"]
                    : ["min", "max", "result"]
                ).includes(k),
            ) ||
            !Number.isInteger(row.min) ||
            !Number.isInteger(row.max) ||
            row.min < 1 ||
            row.max > max ||
            row.min > row.max,
        )
      )
        fail("invalid Dwarf " + key + " table.");
    }
    for (let n = 1; n <= 1000; n++)
      if (
        v.names.rows.filter(
          (r) =>
            n >= r.min && n <= r.max && nonempty(r.male) && nonempty(r.female),
        ).length !== 1
      )
        fail(`Dwarf name result ${n} missing/overlapping.`);
    for (let n = 1; n <= 100; n++)
      if (
        v.birthplaces.rows.filter(
          (r) => n >= r.min && n <= r.max && nonempty(r.result),
        ).length !== 1
      )
        fail(`Dwarf birthplace result ${n} missing/overlapping.`);
  }
  validateCareerProfiles(R);
  for (const kind of ["gear", "market"])
    for (const x of R[kind]) {
      if (
        typeof x.price !== "string" ||
        (x.enc !== null && (!Number.isFinite(x.enc) || x.enc < 0)) ||
        (x.wearable !== undefined && typeof x.wearable !== "boolean") ||
        (x.text !== undefined && !nonempty(x.text))
      )
        fail(`${x.name}: invalid equipment data.`);
      if (x.ogreSized !== undefined && typeof x.ogreSized !== "boolean")
        fail(`${x.name}: invalid Ogre-sized flag.`);
      if (
        x.ammunition &&
        (!plain(x.ammunition) ||
          Object.keys(x.ammunition).some(
            (k) => !["range", "damage", "qualities"].includes(k),
          ) ||
          !["range", "damage", "qualities"].every((k) =>
            nonempty(x.ammunition[k]),
          ))
      )
        fail(`${x.name}: incomplete ammunition reference.`);
    }
  const shopNames = new Map();
  for (const x of [...R.gear, ...R.market]) {
    const name = x.name.toLowerCase(),
      previous = shopNames.get(name);
    if (
      previous &&
      !(
        previous.source.book === "core" &&
        x.source.book === "core" &&
        previous.page !== x.page &&
        previous.price === x.price &&
        previous.enc === x.enc
      )
    )
      fail(`${x.name}: duplicate shop option across gear and market.`);
    shopNames.set(name, x);
  }
  const runtimeIds = new Set();
  for (const c of R.careers) {
    if (runtimeIds.has(c.id)) fail(`duplicate Career ID ${c.id}.`);
    runtimeIds.add(c.id);
  }
  for (const [name, sp] of Object.entries(R.species))
    if (sp.mechanics?.careers?.some((id) => !runtimeIds.has(id)))
      fail(`${name}: unknown additional Career.`);
  for (const c of R.careers) {
    if (
      c.alternativeFor !== undefined &&
      (!nonempty(c.alternativeFor) ||
        c.alternativeFor === c.id ||
        R.careers.some((x) => x.id === c.alternativeFor && x.name !== c.name))
    )
      fail(`${c.name}: invalid alternate profile.`);
    if (
      (c.randomAlternativeFor !== undefined &&
        !runtimeIds.has(c.randomAlternativeFor)) ||
      (c.requiredOrigins !== undefined &&
        (!strings(c.requiredOrigins) ||
          !c.requiredOrigins.length ||
          c.requiredOrigins.some(
            (id) =>
              !R.origins.some(
                (o) => o.id === id && c.species.includes(o.species),
              ),
          ))) ||
      (c.text !== undefined && !nonempty(c.text))
    )
      fail(`${c.name}: invalid conditional Career requirement.`);
  }
  for (const w of R.weapons)
    if (
      !["melee", "ranged"].includes(w.kind) ||
      !["group", "reach", "damage"].every((k) => nonempty(w[k])) ||
      !Number.isFinite(w.enc) ||
      w.enc < 0 ||
      typeof w.qualities !== "string" ||
      (w.text !== undefined && !nonempty(w.text))
    )
      fail(`${w.name}: incomplete weapon profile.`);
  for (const a of R.armour)
    if (
      (a.layer !== undefined &&
        !["leather", "mail", "plate"].includes(a.layer)) ||
      !nonempty(a.locations) ||
      !Number.isFinite(a.enc) ||
      a.enc < 0 ||
      !Number.isInteger(a.ap) ||
      a.ap < 0 ||
      typeof a.qualities !== "string"
    )
      fail(`${a.name}: incomplete armour profile.`);
  for (const [name, char] of Object.entries(C.talentEffects))
    if (!talentInfo(R, name)) fail(`unknown effect Talent ${name}.`);
  for (const name of Object.keys(C.talentLimits))
    if (!talentInfo(R, name)) fail(`unknown repeat-limit Talent ${name}.`);
  for (const name of Object.keys(R.species))
    if (!R.careers.some((c) => careerAvailable(R, { species: name }, c)))
      fail(`${name}: no available Career.`);
  for (const o of R.origins) {
    if (
      (o.careers !== undefined &&
        (!strings(o.careers) || o.careers.some((id) => !runtimeIds.has(id)))) ||
      (o.careerTable !== undefined &&
        !R.tables.some(
          (t) =>
            t.id === o.careerTable &&
            t.kind === "career" &&
            t.origins?.includes(o.id),
        ))
    )
      fail(`${o.name}: invalid regional Career access/table.`);
    if (
      !R.species[o.species] ||
      ["languages", "skills"].some(
        (k) => o[k] !== undefined && !strings(o[k]),
      ) ||
      (o.talents !== undefined &&
        (!Array.isArray(o.talents) ||
          o.talents.some((x) => !strings(x) || !x.length))) ||
      (o.randomTalents !== undefined &&
        (!Number.isInteger(o.randomTalents) || o.randomTalents < 0))
    )
      fail(`${o.name}: invalid regional creation profile.`);
    for (const name of o.skills || [])
      for (const n of options(R, name))
        if (!skillInfo(R, n)) fail(`${o.name}: unknown Skill ${n}.`);
    for (const name of (o.talents || [])
      .flat()
      .concat(o.optionalTalent || [], o.randomTalentAlternative || []))
      if (!talentInfo(R, name)) fail(`${o.name}: unknown Talent ${name}.`);
    if (
      o.randomTalentAlternative !== undefined &&
      (!nonempty(o.randomTalentAlternative) ||
        !talentInfo(R, o.randomTalentAlternative) ||
        !o.randomTalents)
    )
      fail(`${o.name}: invalid fixed-or-random Talent slot.`);
    if (
      (o.careerSpecies !== undefined && !R.species[o.careerSpecies]) ||
      (o.grantedTalents !== undefined &&
        (!strings(o.grantedTalents) ||
          o.grantedTalents.some(
            (n) => !talentInfo(R, n) || talentInfo(R, n).unavailable,
          ))) ||
      ["sheetSpecies", "classNote", "text"].some(
        (k) => o[k] !== undefined && !nonempty(o[k]),
      )
    )
      fail(`${o.name}: invalid kindred rules.`);
    if (
      o.background &&
      (!plain(o.background) ||
        Object.keys(o.background).some(
          (k) => !["forenames", "surnames", "page"].includes(k),
        ) ||
        !pageOK(o.background.page) ||
        ["forenames", "surnames"].some(
          (k) => !strings(o.background[k]) || !o.background[k].length,
        ))
    )
      fail(`${o.name}: invalid regional name suggestions.`);
    if (
      o.allowedPatrons &&
      (!strings(o.allowedPatrons) ||
        o.allowedPatrons.some((n) => !C.gods.includes(n)))
    )
      fail(`${o.name}: unknown regional patron.`);
    if (
      o.additionalCareers !== undefined &&
      (!Array.isArray(o.additionalCareers) ||
        o.additionalCareers.some(
          (x) =>
            !plain(x) ||
            Object.keys(x).some(
              (k) => !["career", "requiredTalent", "reason"].includes(k),
            ) ||
            !runtimeIds.has(x.career) ||
            !talentInfo(R, x.requiredTalent) ||
            !nonempty(x.reason),
        ))
    )
      fail(`${o.name}: invalid additional Career grant.`);
    if (o.careerChoices) {
      if (!plain(o.careerChoices))
        fail(`${o.name}: invalid regional Career choices.`);
      for (const [from, to] of Object.entries(o.careerChoices)) {
        if (
          !runtimeIds.has(from) ||
          !strings(to) ||
          to.some(
            (id) =>
              !R.careers.some(
                (c) => c.id === id && c.species.includes(o.species),
              ),
          )
        )
          fail(`${o.name}: unavailable regional Career choice.`);
      }
    }
  }
  for (const cult of R.cults)
    if (
      !C.gods.includes(cult.name) ||
      !strings(cult.miracles) ||
      !cult.miracles.length ||
      new Set(cult.miracles).size !== cult.miracles.length ||
      cult.miracles.some(
        (n) =>
          !R.spells.some(
            (x) => x.name === n && C.gods.includes(x.category) && !x.ritual,
          ),
      ) ||
      !nonempty(cult.text)
    )
      fail(`${cult.name}: invalid cult Miracle references or description.`);
  for (const god of C.gods) {
    if (
      !C.blessings[god]?.length ||
      C.blessings[god].some(
        (n) => !R.spells.some((x) => x.name === `Blessing of ${n}`),
      )
    )
      fail(`${god}: missing Blessings.`);
    if (
      !(god === "Old Faith" && oldFaith(R)) &&
      !R.cults.some((x) => x.name === god) &&
      !R.spells.some((x) => x.category === god)
    )
      fail(`${god}: missing Miracles.`);
  }
  for (const lore of C.colours)
    if (!R.spells.some((x) => x.category === lore))
      fail(`${lore}: missing Lore spells.`);
  for (const table of R.tables) {
    if (
      table.origins !== undefined &&
      (!strings(table.origins) ||
        !table.origins.length ||
        table.origins.some(
          (id) =>
            !R.origins.some((o) => o.id === id && o.species === table.species),
        ))
    )
      fail(`${table.name}: invalid table origins.`);
    if (
      table.origin !== undefined &&
      !R.origins.some(
        (o) => o.id === table.origin && o.species === table.species,
      )
    )
      fail(`${table.name}: invalid table origin.`);
    if (
      !["species", "career", "talent", "career-refinement"].includes(
        table.kind,
      ) ||
      table.sides !== 100 ||
      !Array.isArray(table.rows) ||
      !table.rows.length ||
      (table.kind === "career" && !R.species[table.species]) ||
      (table.kind === "career-refinement" && !runtimeIds.has(table.career))
    )
      fail(`${table.id}: invalid roll table.`);
    for (let n = 1; n <= 100; n++) {
      const rows = table.rows.filter((r) => n >= r.min && n <= r.max);
      if (rows.length !== 1)
        fail(`${table.id}: result ${n} is missing or overlapping.`);
    }
    for (const row of table.rows) {
      if (
        !Number.isInteger(row.min) ||
        !Number.isInteger(row.max) ||
        row.min < 1 ||
        row.max > 100 ||
        row.min > row.max ||
        !nonempty(row.result)
      )
        fail(`${table.id}: invalid row.`);
      if (
        (table.kind === "species" && !R.species[row.result]) ||
        (table.kind === "talent" && !talentInfo(R, row.result)) ||
        (table.kind === "career" &&
          !R.careers.some(
            (c) =>
              c.id === row.result &&
              (table.origins || [table.origin]).some((origin) =>
                careerAvailable(R, { species: table.species, origin }, c),
              ),
          )) ||
        (table.kind === "career-refinement" && !runtimeIds.has(row.result))
      )
        fail(`${table.id}: unavailable result ${row.result}.`);
    }
  }
  if (!R.tables.some((x) => x.kind === "species"))
    fail("a Species roll table is required.");
  return R;
}

export function bookSelection(R) {
  return {
    schemaVersion: BOOK_SCHEMA,
    packs: R.selection.map((x) => ({ ...x })),
  };
}
export function catalogForCharacter(library, character) {
  const selection = character.books;
  if (
    selection?.schemaVersion !== BOOK_SCHEMA ||
    !Array.isArray(selection.packs) ||
    !selection.packs.length
  )
    fail(
      "this character needs a current book selection; start a new WIP character.",
    );
  for (const ref of selection.packs) {
    const p = library.packs.find((x) => x.manifest.id === ref.id);
    if (!p || p.manifest.version !== ref.version)
      fail(`missing or different book version: ${ref.id}.`);
  }
  const R = assembleBooks(
    library,
    selection.packs.map((x) => x.id),
  );
  if (
    R.selection.length !== selection.packs.length ||
    R.selection.some(
      (ref, i) =>
        ref.id !== selection.packs[i].id ||
        ref.version !== selection.packs[i].version,
    )
  )
    fail("saved book dependencies or order do not match.");
  validateElfState(R, character);
  validateChartState(R, character);
  validateIIIState(R, character);
  validateWoMState(R, character);
  const dwarfErrors = dwarfIssues(R, character, { talents: [] });
  if (dwarfErrors.length) fail(dwarfErrors.join(" "));
  const cultErrors = cultIssues(R, character);
  if (cultErrors.length) fail(cultErrors.join(" "));
  return R;
}
export function randomTable(R, s, kind) {
  const available = R.tables.filter(
    (x) =>
      x.kind === kind &&
      (kind !== "career" || x.species === careerSpecies(R, s)) &&
      (!x.origin || x.origin === s.origin) &&
      (!x.origins || x.origins.includes(s.origin)),
  );
  const selected = s.rollTables?.[kind];
  if (selected && !available.some((x) => x.id === selected))
    fail(`unavailable ${kind} random table.`);
  // User-approved default: Archives II's Species table supersedes core while enabled.
  const speciesDefault =
    kind === "species"
      ? available.find((x) => x.id === "archives-ii:table:species")
      : null;
  // Explicit choices win; a Species with only one printed Career table needs no extra choice.
  return (
    available.find((x) => x.id === selected) ||
    available.find(
      (x) => x.id === R.origins.find((o) => o.id === s.origin)?.careerTable,
    ) ||
    available.find((x) => x.origin === s.origin && x.origin) ||
    speciesDefault ||
    available.find((x) => x.source.book === "core") ||
    (kind === "career" && available.length === 1 ? available[0] : null)
  );
}
export function tableResult(table, n) {
  if (!table || !Number.isInteger(n) || n < 1 || n > table.sides)
    fail("invalid table roll.");
  return table.rows.find((x) => n >= x.min && n <= x.max).result;
}

function validateCareerProfiles(R) {
  for (const c of R.careers) {
    if (
      !strings(c.species) ||
      !c.species.length ||
      c.species.some((x) => !R.species[x]) ||
      !R.config.classKit[c.class] ||
      !plain(c.advanceScheme) ||
      KEYS.some((k) => ![null, 1, 2, 3, 4].includes(c.advanceScheme[k])) ||
      !Array.isArray(c.levels) ||
      c.levels.length !== 4
    )
      fail(`${c.name}: invalid Career structure.`);
    c.levels.forEach((l, i) => {
      if (
        !plain(l) ||
        Object.keys(l).some(
          (k) =>
            ![
              "level",
              "name",
              "status",
              "standing",
              "skills",
              "talents",
              "trappings",
              "unavailableSkills",
            ].includes(k),
        )
      )
        fail(
          `${c.name}: unsupported Career level fields need an implemented handler.`,
        );
      if (
        l.level !== i + 1 ||
        !nonempty(l.name) ||
        !["Brass", "Silver", "Gold"].includes(l.status) ||
        !Number.isInteger(l.standing) ||
        l.standing < 0 ||
        !["skills", "talents", "trappings"].every((k) => strings(l[k]))
      )
        fail(`${c.name}: invalid Career level ${i + 1}.`);
      if (
        l.unavailableSkills !== undefined &&
        (!Array.isArray(l.unavailableSkills) ||
          l.unavailableSkills.some(
            (x) =>
              !plain(x) ||
              Object.keys(x).some((k) => !["name", "reason"].includes(k)) ||
              !nonempty(x.name) ||
              !nonempty(x.reason),
          ))
      )
        fail(`${c.name}: unavailable Skills require a name and reason.`);
      for (const raw of l.skills)
        for (const n of options(R, raw))
          if (!skillInfo(R, n)) fail(`${c.name}: unknown Skill ${n}.`);
      for (const raw of l.talents)
        if (!talentInfo(R, raw)) fail(`${c.name}: unknown Talent ${raw}.`);
    });
  }
}

// A source inventory is separate from a combined active catalogue: variants and
// withdrawals can hide profiles without deleting their integration decisions.
export function registeredEntries(pack) {
  const out = [];
  for (const kind of arrays.concat("species", "background")) {
    const data = pack.data[kind];
    if (!data) continue;
    for (const [key, value] of Array.isArray(data)
      ? data.map((x) => [undefined, x])
      : Object.entries(data)) {
      if (!plain(value)) continue;
      out.push({
        ...entryFor(pack.manifest, kind, value, key),
        contentKind: kind,
      });
    }
  }
  return out;
}
