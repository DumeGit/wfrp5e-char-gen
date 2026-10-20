import { calculateManager } from "../../engine/manager/model.mjs";
import { loadPDFLibrary } from "../../engine/pdf-runtime.mjs";
import { exportMarijanSheet } from "../../engine/marijan/pdf.mjs";
import { entryDescription } from "../../engine/marijan/catalogue.mjs";

export async function exportManagerPDF(
  catalogue: any,
  record: any,
  supplied?: any,
) {
  const PDFLib = supplied?.PDFLib || (await loadPDFLibrary());
  const result = calculateManager(catalogue, record);
  const sheet = { ...record.sheet, type: "wfrp-marijan", copiedFrom: "" };
  const bytes = await exportMarijanSheet(catalogue, sheet, result, {
    ...supplied,
    PDFLib,
    recordHeading: "FIELD LEDGER / CHARACTER RECORD",
    documentTitle: `${sheet.name || "Character"} - Field Ledger sheet and record`,
    fieldOverrides: {
      Current_Wounds: record.current.wounds ?? "",
      Fortune_Current: record.current.fortune,
      Notes: `Character manager. Current resources and the complete change history follow in the attached record.\n${sheet.notes}`,
    },
  });
  const doc = await PDFLib.PDFDocument.load(bytes);
  const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
  const bold = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
  let page: any,
    y = 0;
  function addPage() {
    page = doc.addPage([595.28, 841.89]);
    y = 780;
    page.drawText("FIELD LEDGER / SESSION & CHANGE HISTORY", {
      x: 42,
      y: 810,
      font: bold,
      size: 10,
    });
  }
  function safe(value: unknown) {
    return Array.from(
      String(value ?? "")
        .replaceAll("→", " to ")
        .replaceAll("−", "-"),
    )
      .map((c) => {
        try {
          font.encodeText(c);
          return c;
        } catch {
          return "?";
        }
      })
      .join("");
  }
  function text(value: unknown) {
    const paragraphs = safe(value).split("\n");
    for (const paragraph of paragraphs) {
      let line = "";
      for (const char of paragraph) {
        if (font.widthOfTextAtSize(line + char, 9) > 505) {
          draw(line);
          line = "";
        }
        line += char;
      }
      draw(line);
    }
  }
  function draw(value: string) {
    if (!page || y < 48) addPage();
    page.drawText(value, { x: 42, y, font, size: 9 });
    y -= 13;
  }
  text(`${sheet.name || "Unnamed character"}`);
  text(
    `Current Wounds: ${record.current.wounds ?? "Unknown"} / ${result.values.wounds ?? "Unknown"}; Fortune: ${record.current.fortune} / ${sheet.fortune}; Fate: ${sheet.fate}`,
  );
  text("Active Conditions (manual effects)");
  for (const condition of record.conditions)
    text(`${condition.name} x${condition.amount}: ${condition.note}`);
  text("Critical wounds and mutations (manual effects)");
  const legacyMutations = record.sheet.entries.extras
    .filter((entry: any) => entry.kind === "mutation")
    .map((entry: any) => ({
      ...entry,
      resolved: !!entry.inactive,
      text: entryDescription(catalogue, { ...entry, descriptionNote: "" }),
      note: entry.descriptionNote || "",
    }));
  for (const entry of [...(record.afflictions || []), ...legacyMutations]) {
    text(
      `${entry.kind === "critical" ? "Critical wound" : "Mutation"}: ${entry.name}${entry.location ? ` / ${entry.location}` : ""}${entry.resolved ? " / healed or inactive" : ""}`,
    );
    text(entry.text);
    text(entry.note);
    if (entry.source) text(`${entry.source.book}, p. ${entry.source.page}`);
  }
  text("Journal");
  for (const entry of record.journal) {
    text(`${entry.at} / ${entry.kind} / ${entry.title}`);
    text(entry.text);
    text("");
  }
  text("Persistent change history");
  for (const entry of record.history) {
    text(`${entry.at} / ${entry.label}`);
    text(entry.detail);
  }
  text("Historical attachments (complete original data retained in JSON)");
  for (const attachment of record.attachments) {
    text(attachment.name);
    const original = attachment.data;
    for (const purchase of original.ledger ||
      original.generation?.purchases ||
      [])
      text(
        `${purchase.type}: ${purchase.name} ${purchase.amount ? `+${purchase.amount}` : ""} / ${purchase.cost} XP`,
      );
    for (const roll of original.rolls || [])
      text(
        `${roll.at} / ${roll.label}: ${(roll.values || roll.faces || []).join(", ")} / historical roll`,
      );
  }
  return doc.save();
}
