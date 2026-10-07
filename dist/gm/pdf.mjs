import { KEYS } from "../rules.mjs";
import { rowName } from "./model.mjs";
import { wrapPDFRuns, drawPDFRuns } from "./pdf-text.mjs";

// The sheet consumes exactly the same result as review and the folio.
// Source conflicts, imported history and calculation commentary stay in the app.
export function sheetSections(r, s) {
  return [
    [
      "Attacks",
      r.attacks.map(
        (a) =>
          `${a.name}  ${a.skill ?? "—"} / ${a.damage === null ? "—" : "+" + a.damage}${a.text ? ` · ${a.text}` : ""}`,
      ),
    ],
    [
      "Defence",
      [
        Object.entries(r.ap)
          .map(([k, v]) => `${k} ${v} AP`)
          .join(" · ") +
          (r.shield ? ` · Shield +${r.shield} AP when applicable` : ""),
        ...(r.armour.length ? [r.armour.map((a) => a.name).join(", ")] : []),
      ],
    ],
    [
      "Skills",
      r.skills.length
        ? [r.skills.map((x) => `${x.name} ${x.total}`).join("; ")]
        : [],
    ],
    [
      "Talents",
      r.talents.length
        ? [
            r.talents
              .map((x) => x.name + (x.ranks > 1 ? ` ×${x.ranks}` : ""))
              .join("; "),
          ]
        : [],
    ],
    ["Creature Traits", r.traits.map((t) => `${rowName(t)}: ${t.description}`)],
    [
      "Magic & prayers",
      r.spells.map(
        (x) =>
          `${x.name} (${x.category})${x.cn !== undefined ? ` · CN ${x.cn}` : ""} · ${x.range || "—"} · ${x.target || "—"} · ${x.duration || "—"}`,
      ),
    ],
    [
      "Trappings",
      [
        r.profile.sections.Trappings,
        ...r.gear.map((g) => `${g.quantity} × ${g.entry.name}`),
      ].filter(Boolean),
    ],
    ["Corruption", r.mutations.map((m) => `${m.name}: ${m.text}`)],
    [
      "Personality",
      [
        s.purpose ? `Purpose: ${s.purpose}` : "",
        s.motivation ? `Motivation: ${s.motivation}` : "",
        s.manner ? `Manner: ${s.manner}` : "",
      ].filter(Boolean),
    ],
    ["GM notes", s.includeNotes && s.notes ? [s.notes] : []],
  ].filter(([, lines]) => lines.length);
}
export async function createGMPDF(PDFLib, r, s) {
  if (!r.profile || r.issues.length)
    throw Error("Resolve the highlighted choices before exporting.");
  const { PDFDocument, StandardFonts, rgb } = PDFLib,
    doc = await PDFDocument.create(),
    font = await doc.embedFont(StandardFonts.Helvetica),
    bold = await doc.embedFont(StandardFonts.HelveticaBold),
    heading = await doc.embedFont(StandardFonts.TimesRomanBold);
  doc.setTitle(r.name);
  doc.setSubject("WFRP Fifth Edition NPC / creature stat block");
  doc.setCreator("The Bestiary Workshop");
  const ink = rgb(0.18, 0.14, 0.11),
    muted = rgb(0.4, 0.34, 0.27),
    crimson = rgb(0.42, 0.13, 0.16),
    rule = rgb(0.72, 0.65, 0.5),
    paper = rgb(0.97, 0.95, 0.9),
    width = 511;
  let page,
    y,
    number = 0;
  const safe = (text) =>
    [
      ...String(text ?? "")
        .replace(/×/g, "x")
        .replace(/−/g, "-")
        .replace(/→/g, "->")
        .replace(/ﬂ/g, "fl")
        .replace(/ﬁ/g, "fi"),
    ]
      .map((c) => {
        if (c === "\n") return c;
        try {
          font.encodeText(c);
          return c;
        } catch {
          return c
            .normalize("NFKD")
            .replace(/\p{M}/gu, "")
            .replace(/[^\x20-\x7E]/g, "?");
        }
      })
      .join("");
  const newPage = () => {
    page = doc.addPage([595, 842]);
    number++;
    y = 768;
    page.drawText("WARHAMMER FANTASY ROLEPLAY · FIFTH EDITION", {
      x: 42,
      y: 812,
      size: 8,
      font: bold,
      color: muted,
    });
    page.drawLine({
      start: { x: 42, y: 802 },
      end: { x: 553, y: 802 },
      thickness: 0.7,
      color: rule,
    });
    page.drawText(`THE BESTIARY · ${number}`, {
      x: 42,
      y: 27,
      size: 8,
      font: bold,
      color: muted,
    });
    page.drawText("Game Master's reference", {
      x: 441,
      y: 27,
      size: 8,
      font,
      color: muted,
    });
  };
  const reserve = (height) => {
    if (y - height < 52) {
      newPage();
      page.drawText(safe(r.name) + " · continued", {
        x: 42,
        y,
        size: 18,
        font: heading,
        color: ink,
      });
      y -= 30;
    }
  };
  const wrap = (text, f = font, size = 10) => {
    const lines = [];
    for (const paragraph of safe(text).split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        if (
          f.widthOfTextAtSize((line ? line + " " : "") + word, size) > width &&
          line
        ) {
          lines.push(line);
          line = "";
        }
        if (f.widthOfTextAtSize(word, size) > width) {
          for (const c of word) {
            if (f.widthOfTextAtSize(line + c, size) > width) {
              lines.push(line);
              line = "";
            }
            line += c;
          }
        } else line += (line ? " " : "") + word;
      }
      lines.push(line);
    }
    return lines;
  };
  const text = (value, size = 10, f = font, color = ink) => {
    for (const line of wrap(value, f, size)) {
      reserve(size + 5);
      page.drawText(line, { x: 42, y, size, font: f, color });
      y -= size + 5;
    }
  };
  newPage();
  text(r.name, 26, heading);
  text(
    [r.profile.name, r.template?.name, r.size, `Core p. ${r.profile.page}`]
      .filter(Boolean)
      .join(" · "),
    9,
    font,
    muted,
  );
  if (s.description) text(s.description, 10);
  y -= 9;
  reserve(67);
  const keys = ["M", ...KEYS],
    cell = width / keys.length;
  page.drawRectangle({
    x: 42,
    y: y - 46,
    width,
    height: 46,
    color: paper,
    borderColor: rule,
    borderWidth: 0.7,
  });
  for (const [i, k] of keys.entries()) {
    const x = 42 + cell * i;
    page.drawText(k, {
      x: x + (cell - bold.widthOfTextAtSize(k, 8)) / 2,
      y: y - 13,
      size: 8,
      font: bold,
      color: muted,
    });
    const v = String(r.stats[k] ?? "—");
    page.drawText(v, {
      x: x + (cell - bold.widthOfTextAtSize(v, 13)) / 2,
      y: y - 35,
      size: 13,
      font: bold,
      color: ink,
    });
  }
  y -= 63;
  text(
    `Wounds ${r.wounds} · Toughness Bonus ${r.tb} · Size ${r.size}`,
    11,
    bold,
  );
  y -= 5;
  for (const [title, lines] of sheetSections(r, s)) {
    const richLines = lines.map((line, i) => {
      const label =
        title === "Attacks"
          ? r.attacks[i].name
          : title === "Magic & prayers"
            ? r.spells[i].name
            : title === "Corruption"
              ? r.mutations[i].name + ":"
              : title === "Creature Traits"
                ? rowName(r.traits[i]) + ":"
                : title === "Personality"
                  ? line.slice(0, line.indexOf(":") + 1)
                  : "";
      return wrapPDFRuns(
        [
          { text: safe(label), bold: true },
          { text: safe(line.slice(label.length)) },
        ],
        font,
        bold,
        10,
        width,
      );
    });
    const initial = richLines[0].length;
    reserve(Math.min(initial, 3) * 15 + 31);
    y -= 5;
    page.drawText(title, { x: 42, y, size: 14, font: heading, color: crimson });
    y -= 8;
    page.drawLine({
      start: { x: 42, y },
      end: { x: 553, y },
      thickness: 0.5,
      color: rule,
    });
    y -= 16;
    for (const paragraph of richLines) {
      for (const line of paragraph) {
        reserve(15);
        drawPDFRuns(page, line, { x: 42, y, size: 10, font, bold, color: ink });
        y -= 15;
      }
    }
    y -= 5;
  }
  return doc.save();
}
