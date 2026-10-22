import { rowName } from "./model.mjs";
import { soakLines, talentLabel, gearLines } from "./export-sections.mjs";
import { planRecordCard, drawRecordCard } from "./card-layout.mjs";
import { CARD_PAGE, printGeometry, packTableCards } from "./card-packing.mjs";
export { PRINT_LAYOUTS } from "./card-packing.mjs";

// All actual fields remain; the record-grid planner owns only their presentation.
export function cardSections(r, s) {
  return [
    ["Desc", s.description?.trim() || ""],
    [
      "Attacks",
      r.attacks
        .map(
          (a) =>
            `${a.name} ${a.skill ?? "—"} / ${a.damage === null ? "—" : "+" + a.damage}${a.text ? " (" + a.text + ")" : ""}`,
        )
        .join("\n"),
    ],
    ["Soak", soakLines(r).join("\n")],
    ["Skills", r.skills.map((x) => `${x.name} ${x.total}`).join("; ")],
    [
      "Talents",
      r.talents.map((x) => `${talentLabel(x)}: ${x.description}`).join("\n"),
    ],
    [
      "Traits",
      r.traits.map((t) => `${rowName(t)}: ${t.description}`).join("\n"),
    ],
    [
      "Magic",
      r.spells
        .map(
          (x) =>
            x.name +
            (x.category === "Arcane" && x.lore ? ` (${x.lore})` : "") +
            (x.cn !== undefined
              ? ` (CN ${x.cn})`
              : x.sl !== undefined
                ? ` (SL ${x.sl})`
                : ""),
        )
        .join("; "),
    ],
    [
      "Rune knowledge",
      (r.runes || []).map((x) => `${x.name} (${x.form})`).join("; "),
    ],
    ["Cants", (r.cants || []).map((x) => `${x.name} (${x.lore})`).join("; ")],
    ["Gear", gearLines(r).join("; ")],
    ["Corruption", r.mutations.map((x) => x.name).join("; ")],
    [
      "Personality",
      [
        s.purpose && `Purpose: ${s.purpose}`,
        s.motivation && `Motivation: ${s.motivation}`,
        s.manner && `Manner: ${s.manner}`,
      ]
        .filter(Boolean)
        .join(" · "),
    ],
    ["GM notes", s.includeNotes ? s.notes : ""],
  ].filter(([, value]) => value);
}

export async function prepareGMPrint(
  PDFLib,
  entries,
  { perPage = "flexible" } = {},
) {
  const geometry = printGeometry(perPage);
  if (!Array.isArray(entries) || !entries.length || entries.length > 48)
    throw Error("Add between 1 and 48 creatures to the print sheet.");
  for (const { r } of entries)
    if (!r?.profile || r.issues.length)
      throw Error(
        "Resolve highlighted choices in every creature before printing.",
      );
  const { PDFDocument, StandardFonts, rgb } = PDFLib,
    doc = await PDFDocument.create(),
    font = await doc.embedFont(StandardFonts.Helvetica),
    bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const cards = entries.map((entry) => ({
    ...entry,
    plan: planRecordCard(
      font,
      bold,
      { ...entry, sections: cardSections(entry.r, entry.s) },
      geometry.width,
      geometry.height,
      perPage === 4 ? 11 : 9.25,
    ),
  }));
  const overflow = cards
    .filter((card) => !card.plan.fits)
    .map((card) => card.r.name);
  // Oversized entries occupy a placeholder only; bytes() remains blocked.
  const packing = packTableCards(
    cards.map((card) => Math.min(card.plan.heightNeeded, geometry.height)),
    perPage,
  );
  return {
    cards: cards.map((card, i) => ({
      name: card.r.name,
      fontSize: card.plan.size,
      fits: card.plan.fits,
      contentHeight: card.plan.heightNeeded,
      ...packing.positions[i],
    })),
    overflow,
    pages: packing.pages,
    perPage,
    async bytes() {
      if (overflow.length)
        throw Error(
          `These creatures do not fit ${perPage === "flexible" ? "a full A4 column" : perPage + " cards per page"}: ${overflow.join(", ")}. ${perPage === "flexible" ? "Use the full sheet." : "Choose flexible packing, a larger layout or the full sheet."}`,
        );
      doc.setTitle("Bestiary table cards");
      doc.setCreator("The Bestiary Workshop");
      doc.setSubject("WFRP Fifth Edition · Record grid A4 table cards");
      const ink = rgb(0.12, 0.12, 0.12),
        rule = rgb(0.65, 0.65, 0.65),
        paper = rgb(0.95, 0.95, 0.95);
      for (let index = 0; index < packing.pages; index++) {
        const page = doc.addPage([CARD_PAGE.width, CARD_PAGE.height]);
        page.drawText(
          `WARHAMMER FANTASY ROLEPLAY · TABLE CARDS · ${index + 1} / ${packing.pages}`,
          { x: CARD_PAGE.margin, y: 10, size: 6.5, font, color: ink },
        );
        for (const [i, card] of cards.entries()) {
          const position = packing.positions[i];
          if (position.page !== index) continue;
          page.drawRectangle({
            x: position.x,
            y: position.top - position.height,
            width: position.width,
            height: position.height,
            borderColor: rule,
            borderWidth: 0.5,
          });
          drawRecordCard(page, card.plan, {
            x: position.x,
            top: position.top,
            font,
            bold,
            ink,
            rule,
            paper,
          });
        }
      }
      return doc.save();
    },
  };
}
