import { npcSheet } from "./npc-sheet.mjs";
// Table-facing layout. The optional audit record is a separate export path.
export async function compactNPCPDF(R, s, result, pdfLib) {
  const { PDFDocument, StandardFonts, rgb } = pdfLib;
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const sheet = npcSheet(R, s, result),
    ink = rgb(0.16, 0.12, 0.09),
    red = rgb(0.43, 0.12, 0.15),
    line = rgb(0.76, 0.69, 0.58),
    paper = rgb(0.97, 0.95, 0.9);
  const left = 36,
    width = 523,
    bottom = 42;
  let page, y;
  pdf.setTitle(`${sheet.name} — WFRP NPC`);
  pdf.setSubject("Compact Fifth Edition GM stat sheet");
  const clean = (value) =>
    [
      ...String(value)
        .replace(/→/g, " -> ")
        .replace(/−/g, "-")
        .replace(/×/g, "x")
        .replace(/—/g, "-"),
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
  function wrap(text, size = 9.5, f = font, max = width) {
    const output = [];
    for (const paragraph of clean(text).split("\n")) {
      let row = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (f.widthOfTextAtSize(row ? `${row} ${word}` : word, size) <= max) {
          row += (row ? " " : "") + word;
          continue;
        }
        if (row) {
          output.push(row);
          row = "";
        }
        for (const c of word) {
          if (row && f.widthOfTextAtSize(row + c, size) > max) {
            output.push(row);
            row = "";
          }
          row += c;
        }
      }
      if (row) output.push(row);
    }
    return output;
  }
  function newPage() {
    page = pdf.addPage([595, 842]);
    y = 775;
    page.drawRectangle({ x: left, y: 818, width, height: 3, color: red });
    page.drawText("WARHAMMER FANTASY ROLEPLAY · FIFTH EDITION", {
      x: left,
      y: 805,
      size: 8,
      font: bold,
      color: red,
    });
    if (pdf.getPageCount() > 1) {
      page.drawText(`${wrap(sheet.name, 9, bold, width - 70)[0]} (continued)`, {
        x: left,
        y: 780,
        size: 10,
        font: bold,
        color: ink,
        maxWidth: width,
      });
      y = 760;
    }
  }
  function ensure(height) {
    if (y - height < bottom) newPage();
  }
  function paragraph(
    text,
    { size = 9.5, f = font, color = ink, gap = 4, max = width, x = left } = {},
  ) {
    for (const row of wrap(text, size, f, max)) {
      ensure(size + 4);
      page.drawText(row, { x, y, size, font: f, color });
      y -= size + 3;
    }
    y -= gap;
  }
  function heading(title) {
    ensure(42);
    y -= 5;
    page.drawText(clean(title.toUpperCase()), {
      x: left,
      y,
      size: 9,
      font: bold,
      color: red,
    });
    page.drawLine({
      start: { x: left, y: y - 5 },
      end: { x: left + width, y: y - 5 },
      thickness: 0.5,
      color: line,
    });
    y -= 19;
  }
  newPage();
  paragraph(sheet.name, { size: 20, f: bold, gap: 5 });
  paragraph(sheet.subtitle, { size: 10, gap: 2 });
  paragraph(sheet.source, { size: 8, color: rgb(0.4, 0.35, 0.28), gap: 10 });
  ensure(49);
  const cell = width / sheet.scores.length;
  page.drawRectangle({
    x: left,
    y: y - 36,
    width,
    height: 45,
    color: paper,
    borderColor: line,
    borderWidth: 0.5,
  });
  sheet.scores.forEach((score, i) => {
    const x = left + cell * i;
    if (i)
      page.drawLine({
        start: { x, y: y + 9 },
        end: { x, y: y - 36 },
        thickness: 0.5,
        color: line,
      });
    const label = clean(score.key),
      value = clean(score.value);
    page.drawText(label, {
      x: x + (cell - bold.widthOfTextAtSize(label, 8)) / 2,
      y: y - 3,
      size: 8,
      font: bold,
      color: ink,
    });
    const size = Math.min(
      15,
      (cell - 8) / Math.max(1, bold.widthOfTextAtSize(value, 1)),
    );
    page.drawText(value, {
      x: x + (cell - bold.widthOfTextAtSize(value, size)) / 2,
      y: y - 25,
      size,
      font: bold,
      color: ink,
    });
  });
  y -= 52;
  paragraph(sheet.derived, { size: 9, gap: 2 });
  if (sheet.attacks.length) {
    heading("Attacks");
    const testX = left + width - 110,
      damageX = left + width - 48;
    page.drawText("Weapon / attack", {
      x: left,
      y,
      size: 8,
      font: bold,
      color: ink,
    });
    page.drawText("Test", { x: testX, y, size: 8, font: bold, color: ink });
    page.drawText("Damage", { x: damageX, y, size: 8, font: bold, color: ink });
    y -= 16;
    for (const a of sheet.attacks) {
      const names = wrap(a.name, 9.5, bold, width - 125),
        details = wrap(a.detail, 8, font);
      ensure(Math.min(100, names.length * 12 + details.length * 11 + 8));
      page.drawText(clean(a.test), {
        x: testX,
        y,
        size: 9.5,
        font,
        color: ink,
      });
      page.drawText(clean(a.damage), {
        x: damageX,
        y,
        size: 9.5,
        font,
        color: ink,
      });
      paragraph(a.name, { f: bold, max: width - 125, gap: 0 });
      if (a.detail)
        paragraph(a.detail, { size: 8, color: rgb(0.4, 0.35, 0.28), gap: 3 });
      page.drawLine({
        start: { x: left, y: y + 2 },
        end: { x: left + width, y: y + 2 },
        thickness: 0.3,
        color: line,
      });
      y -= 14;
    }
  }
  heading("Protection");
  paragraph(sheet.protection);
  if (sheet.anatomy) paragraph(sheet.anatomy, { size: 8 });
  for (const [name, text] of sheet.sections) {
    heading(name);
    paragraph(text);
  }
  pdf.getPages().forEach((p, i) => {
    p.drawText("GM BESTIARY · COMPACT STAT SHEET", {
      x: left,
      y: 24,
      size: 7,
      font,
      color: red,
    });
    p.drawText(`${i + 1} / ${pdf.getPageCount()}`, {
      x: width,
      y: 24,
      size: 7,
      font,
      color: ink,
    });
  });
  return pdf.save();
}
