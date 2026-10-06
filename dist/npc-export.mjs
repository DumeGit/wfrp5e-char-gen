import { npcResult } from "./npc-result.mjs";
import * as M from "./rules.mjs";
import { NPC_KEYS } from "./bestiary-content.mjs";

const score = (v) => (v === null || v === undefined ? "—" : String(v));
export function npcText(
  R,
  s,
  { record = false, result = npcResult(R, s) } = {},
) {
  const d = result,
    lines = [
      d.name,
      `${d.profile.name} · ${d.size}${d.template ? ` · ${d.template.name}` : ""} · Core p. ${d.profile.page}`,
      NPC_KEYS.map((k) => `${k} ${score(d.stats[k])}`).join(" | "),
      `SB ${score(d.sb)} · TB ${score(d.tb)} · Walk ${score(d.walk)} · Run ${score(d.run)} · Combat Initiative ${score(d.combatInitiative)}`,
      "",
      "ATTACKS",
      ...d.attacks.map(
        (a) =>
          `${a.name}: ${a.skill === null ? "See rule" : a.skill}${a.damage === null ? "" : `/+${a.damage}`} · ${a.text}`,
      ),
      "",
      "PROTECTION",
      Object.entries(d.protection)
        .map(([k, v]) => `${k} ${v} AP`)
        .join(" · "),
      "",
      "HIT LOCATIONS",
      `${d.anatomy}: ${d.hitLocations} (p. 318)`,
      "",
      "SKILLS",
      d.skills.map((x) => `${x.name} ${score(x.total)}`).join(", "),
      "",
      "TALENTS",
      d.talents
        .map((x) => `${x.name}${x.ranks > 1 ? ` ×${x.ranks}` : ""}`)
        .join(", "),
      "",
      "TRAITS",
      ...d.traits.map(
        (t) =>
          `${t.name}${t.value ? ` (${t.value})` : ""} · p. ${t.source.page}`,
      ),
      "",
      "EQUIPMENT",
      d.profile.sections.Trappings || "",
      ...d.gear.map((x) => `${x.quantity} × ${x.name}`),
      "",
      "MAGIC",
      ...d.magic.map(
        (x) =>
          `${x.name} (${x.lore}) · ${x.cn !== undefined ? `CN ${x.cn} · ` : ""}Range ${x.range || "see rule"} · Target ${x.target || "see rule"} · Duration ${x.duration || "see rule"} · p. ${x.page}`,
      ),
      "",
      "MUTATIONS",
      ...d.mutations.map(
        (x) => `${x.name}${x.location ? ` (${x.location})` : ""}: ${x.text}`,
      ),
      "",
      "GM NOTES",
      s.notes,
      "",
      "SOURCE DISCREPANCIES & CHECKS",
      ...d.profile.notes,
      ...d.issues.map(
        (x) => `${x.severity}: ${x.message} (p. ${x.source.page})`,
      ),
    ];
  if (record)
    lines.push(
      "",
      "CREATION RECORD",
      `Core book ${R.books.find((b) => b.id === "core").version}`,
      ...Object.entries(d.steps).flatMap(([key, items]) =>
        items
          .filter((x) => x.label !== "Printed profile")
          .map(
            (x) =>
              `${key}: ${x.label} = ${score(x.value)} (p. ${x.source.page})`,
          ),
      ),
      "Template Skills use the higher existing/template bonus, by the user's interpretation of the worked examples.",
      "",
      "PAID DEVELOPMENT",
      `Budget ${s.xpBudget} XP · Spent ${d.spent} XP · Remaining ${d.remaining} XP`,
      "Starting Advance counts are GM inputs; printed profiles do not provide XP histories.",
      ...Object.entries(s.advanceCounts).flatMap(([kind, group]) =>
        Object.entries(group).map(
          ([name, n]) =>
            `${kind} ${name}: ${n} existing Advances before paid development`,
        ),
      ),
      ...s.ledger.map(
        (x, i) =>
          `${i + 1}. ${x.name}${["char", "skill"].includes(x.type) ? ` +${x.amount}` : ""}: ${x.cost} XP (p. ${x.source.page})`,
      ),
      "",
      "RECORDED DICE",
      ...s.rolls.map(
        (x) =>
          `${x.at} · ${x.label}: ${x.values.join(" + ")} = ${x.total} (${x.dice}, p. ${x.page})`,
      ),
      "Recorded dice from loaded files are unverified imported history.",
      "",
      "RULE REFERENCES FOR SELECTED OPTIONS",
      ...d.traits.map(
        (t) =>
          `${t.name}${t.value ? ` (${t.value})` : ""} (p. ${R.traits.find((x) => x.contentId === t.id)?.page || t.source.page}): ${R.traits.find((x) => x.contentId === t.id)?.text || "See source"}`,
      ),
      ...d.talents.map(
        (t) =>
          `${t.name} (p. ${M.talentInfo(R, t.name)?.page || t.source.page}): ${M.talentInfo(R, t.name)?.text || "See source"}`,
      ),
      ...d.magic.map((x) => `${x.name} (p. ${x.page}): ${x.text}`),
      "",
      "EDIT HISTORY",
      ...s.changes.map((x) => `${x.at} · ${x.label}`),
    );
  return lines.filter((x) => x !== undefined).join("\n");
}

// A dedicated GM stat block, not the player character's AcroForm.
export async function npcPDF(
  R,
  s,
  { record = false, result = npcResult(R, s), pdfLib = globalThis.PDFLib } = {},
) {
  const { PDFDocument, StandardFonts, rgb } = pdfLib;
  const pdf = await PDFDocument.create(),
    font = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.setTitle(`${result.name} — WFRP NPC`);
  pdf.setSubject(
    "Core Fifth Edition NPC stat block and optional creation record",
  );
  let page, y;
  const newPage = () => {
    page = pdf.addPage([595.28, 841.89]);
    y = 796;
    page.drawText("WFRP · FIFTH EDITION · GM BESTIARY", {
      x: 42,
      y,
      size: 9,
      font: bold,
      color: rgb(0.35, 0.12, 0.12),
    });
    y -= 26;
  };
  newPage();
  const clean = (text) =>
    [
      ...String(text)
        .replace(/→/g, " -> ")
        .replace(/−/g, "-")
        .replace(/×/g, "x")
        .replace(/—/g, "-")
        .replace(/…/g, "..."),
    ]
      .map((c) => {
        try {
          font.encodeText(c);
          return c;
        } catch {
          return "?";
        }
      })
      .join("");
  for (const [i, raw] of npcText(R, s, { record, result })
    .split("\n")
    .entries()) {
    const heading = i === 0 || /^[A-Z &]+$/.test(raw),
      f = heading ? bold : font,
      size = i === 0 ? 18 : heading ? 10 : 9;
    if (heading && y < 100) newPage();
    if (!raw) {
      y -= 8;
      continue;
    }
    const words = clean(raw).split(/\s+/),
      lines = [];
    let line = "";
    for (const word of words) {
      if (
        f.widthOfTextAtSize(line ? `${line} ${word}` : word, size) > 511 &&
        line
      ) {
        lines.push(line);
        line = word;
      } else line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
    for (const text of lines) {
      if (y < 50) newPage();
      page.drawText(text, {
        x: 42,
        y,
        size,
        font: f,
        color: rgb(0.12, 0.1, 0.08),
      });
      y -= size + 4;
    }
    if (heading) y -= 3;
  }
  const pages = pdf.getPages();
  pages.forEach((p, i) =>
    p.drawText(`${i + 1} / ${pages.length}`, { x: 510, y: 25, size: 8, font }),
  );
  return pdf.save();
}
