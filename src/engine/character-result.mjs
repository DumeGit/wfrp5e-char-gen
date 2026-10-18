import { folioGear } from "./folio-gear.mjs";
import * as M from "./rules.mjs";
import { equipment, gearSlots } from "./equipment.mjs";
import { purse, purchaseItem } from "./market.mjs";
import { elfLedgerIssues, knownTechniques } from "./high-elf.mjs";
import { dwarfGearIssue, knownRunes } from "./dwarf-guide.mjs";
import { freeMagicIssues, cantIssues, knownCants } from "./archives-iii.mjs";
import { issue, uniqueIssues } from "./issues.mjs";

function calculateSkills(R, s, d, load) {
  const freeSkills = M.freeSkills(R, s);
  return [
    ...new Set([
      ...Object.keys(d.skills),
      ...d.currentSkills,
      ...R.skills.filter((x) => !x.advanced && !x.grouped).map((x) => x.name),
      ...[
        "Melee (Basic)",
        "Stealth (Rural)",
        "Stealth (Urban)",
        "Stealth (Underground)",
      ],
    ]),
  ]
    .sort()
    .map((name) => {
      const info = M.skillInfo(R, name, s),
        adv = Math.round((d.skills[name] || 0) * 5);
      return {
        name,
        char: info?.char || "Int",
        advanced: info?.advanced,
        adv,
        free: (freeSkills[name] || 0) * 5,
        paid: Math.round((d.paidSkills[name] || 0) * 5),
        total:
          info?.advanced && !adv
            ? "—"
            : (info?.char === "Ag" && load.complete
                ? load.agility
                : d.stats[info?.char]) + adv,
        career: d.currentSkills.includes(name),
      };
    });
}

export function characterResult(R, s) {
  const derived = M.derive(R, s),
    eq = equipment(R, s),
    wallet = purse(R, s),
    career = M.career(R, s);
  const issues = [
    ...M.validation(R, s, true),
    ...elfLedgerIssues(R, s, true),
    ...freeMagicIssues(R, s, M.spellGrants(R, s), true),
    ...cantIssues(R, s, true),
  ];
  for (const [i, x] of s.ledger.entries())
    if (x.type === "talent") {
      const problem = M.invalidTalent(
        R,
        { ...s, ledger: s.ledger.slice(0, i) },
        x.name,
      );
      if (problem)
        issues.push(
          issue(
            "ledger.talent",
            `Saved Talent purchase ${i + 1}: ${x.name} — ${problem} Undo or clear advancement to correct it.`,
            6,
            ".ledger-section",
            x.source || { book: "core", page: 191 },
          ),
        );
    }
  for (const x of eq.entries.filter((x) => x.useUnresolved))
    issues.push(
      issue(
        "gear.use-unresolved",
        x.name + ": " + x.sizeNote,
        5,
        ".shop-disclosure",
        x.sizeSource || { book: "archives-ii", page: 31 },
      ),
    );
  for (const slot of gearSlots(R, s))
    if (
      /\d+d10/.test(slot.name) &&
      !Object.keys(s.gearRolls).some((k) => k.startsWith(slot.key + ":"))
    )
      issues.push(
        issue(
          "gear.quantity",
          `Roll the quantity for ${slot.name}.`,
          5,
          '[data-action="gear-quantities"]',
          slot.source || career.source,
        ),
      );
  for (const p of s.purchases || []) {
    const item = purchaseItem(R, p);
    if (!item)
      issues.push(
        issue(
          "gear.import-price",
          "An imported Trapping has no listed book price.",
          5,
          ".shop-disclosure",
          p.source || { book: "core", page: 298 },
        ),
      );
    else {
      const problem = dwarfGearIssue(R, s, item);
      if (problem)
        issues.push(
          issue("gear.slayer", problem, 5, ".shop-disclosure", {
            book: "dwarf-guide",
            page: 59,
          }),
        );
    }
  }
  if (wallet.remaining < 0)
    issues.push(
      issue(
        "gear.over-budget",
        "Trapping purchases exceed starting wealth.",
        5,
        ".shop-disclosure",
        { book: "core", page: 41 },
      ),
    );
  const notices = [
    ...eq.unknown.map((name) =>
      issue(
        "gear.unknown-weight",
        `${name}: no published weight; total Encumbrance and load effects remain unresolved.`,
        5,
        ".shop-disclosure",
        eq.entries.find((x) => x.name === name)?.source || {
          book: "core",
          page: 299,
        },
        "warning",
      ),
    ),
    ...derived.notices,
    ...eq.notices,
  ];
  return {
    derived,
    equipment: eq,
    wallet,
    gearSummary: folioGear(R, s),
    career,
    skills: calculateSkills(R, s, derived, eq.penalties),
    spells: M.knownSpells(R, s),
    techniques: knownTechniques(R, s),
    runes: knownRunes(R, s, derived.talents),
    cants: knownCants(R, s),
    issues: uniqueIssues(issues),
    notices: uniqueIssues(notices),
  };
}

// One immutable-by-convention snapshot per character revision, even when actions
// mutate the draft in place. A different book catalogue always invalidates it.
export function createResultReader(calculate = characterResult) {
  let catalog, revision, result;
  return (R, s) => {
    const next = JSON.stringify(s);
    if (catalog !== R || revision !== next) {
      result = calculate(R, s);
      catalog = R;
      revision = next;
    }
    return result;
  };
}
