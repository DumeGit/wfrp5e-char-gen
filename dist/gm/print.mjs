import { KEYS } from "../rules.mjs";
import { rowName } from "./model.mjs";
import { wrapPDFRuns, drawPDFRuns } from "./pdf-text.mjs";

export const PRINT_LAYOUTS = [6, 4];
const A4 = [595.28, 841.89];
const MIN_FONT = 7.5;

function printable(font, value) {
  return [
    ...String(value ?? "")
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
}

function wrap(font, text, size, width) {
  const lines = [];
  for (const paragraph of printable(font, text).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (line && font.widthOfTextAtSize(line + " " + word, size) > width) {
        lines.push(line);
        line = "";
      }
      if (font.widthOfTextAtSize(word, size) > width) {
        for (const c of word) {
          if (line && font.widthOfTextAtSize(line + c, size) > width) {
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
}

// Table cards retain actual Traits and their source descriptions. Measured
// overflow blocks printing rather than truncating rules or shrinking below 7.5pt.
export function cardSections(r, s) {
  return [
    [
      "Attacks",
      r.attacks
        .map(
          (a) =>
            `${a.name} ${a.skill ?? "—"} / ${a.damage === null ? "—" : "+" + a.damage}${a.text ? " (" + a.text + ")" : ""}`,
        )
        .join("; "),
    ],
    [
      "Defence",
      Object.entries(r.ap)
        .map(([k, v]) => `${k} ${v}`)
        .join(" · ") +
        (r.shield ? ` · Shield +${r.shield} AP (conditional)` : "") +
        (r.armour.length ? " · " + r.armour.map((a) => a.name).join(", ") : ""),
    ],
    ["Skills", r.skills.map((x) => `${x.name} ${x.total}`).join("; ")],
    [
      "Talents",
      r.talents
        .map((x) => x.name + (x.ranks > 1 ? ` ×${x.ranks}` : ""))
        .join("; "),
    ],
    [
      "Traits",
      r.traits.map((t) => `${rowName(t)}: ${t.description}`).join("\n"),
    ],
    [
      "Magic",
      r.spells
        .map((x) => x.name + (x.cn !== undefined ? ` (CN ${x.cn})` : ""))
        .join("; "),
    ],
    [
      "Trappings",
      [
        r.profile.sections.Trappings,
        ...r.gear.map((g) => `${g.quantity} × ${g.entry.name}`),
      ]
        .filter(Boolean)
        .join("; "),
    ],
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

function cardPlan(font, bold, entry, width, height, maxSize) {
  const { r, s } = entry,
    inner = width - 20;
  for (let size = maxSize; size >= MIN_FONT; size -= 0.25) {
    const lineHeight = size + 1.25,
      sectionGap = 2;
    const title = wrap(bold, r.name, 12, inner),
      subtitle = wrap(
        font,
        [
          r.name === r.profile.name ? "" : r.profile.name,
          r.template?.name,
          r.size,
          `Core p. ${r.profile.page}`,
        ]
          .filter(Boolean)
          .join(" · "),
        7.5,
        inner,
      ),
      description = s.description ? wrap(font, s.description, size, inner) : [],
      sections = cardSections(r, s).map(([label, value]) => ({
        label,
        lines: wrapPDFRuns(
          label === "Traits"
            ? [
                { text: "Traits: ", bold: true },
                ...r.traits.flatMap((t, i) => [
                  {
                    text: printable(font, `${i ? "\n" : ""}${rowName(t)}: `),
                    bold: true,
                  },
                  { text: printable(font, t.description) },
                ]),
              ]
            : [
                { text: `${label}: `, bold: true },
                { text: printable(font, value) },
              ],
          font,
          bold,
          size,
          inner,
        ),
      })),
      heightNeeded =
        20 +
        title.length * 14 +
        subtitle.length * 9 +
        description.length * (size + 2) +
        44 +
        14 +
        sections.reduce(
          (n, x) => n + x.lines.length * lineHeight + sectionGap,
          0,
        );
    if (heightNeeded <= height - 12)
      return {
        size,
        lineHeight,
        sectionGap,
        title,
        subtitle,
        description,
        sections,
        heightNeeded,
        fits: true,
      };
    if (size === MIN_FONT)
      return {
        size,
        lineHeight,
        sectionGap,
        title,
        subtitle,
        description,
        sections,
        heightNeeded,
        fits: false,
      };
  }
}

export async function prepareGMPrint(PDFLib, entries, { perPage = 6 } = {}) {
  if (!PRINT_LAYOUTS.includes(perPage))
    throw Error("Choose six or four cards per A4 page.");
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
    bold = await doc.embedFont(StandardFonts.HelveticaBold),
    rows = perPage / 2,
    margin = 18,
    gap = 8,
    width = (A4[0] - margin * 2 - gap) / 2,
    height = (A4[1] - margin * 2 - 20 - gap * (rows - 1)) / rows,
    cards = entries.map((entry) => ({
      ...entry,
      plan: cardPlan(
        font,
        bold,
        entry,
        width,
        height,
        perPage === 4 ? 11 : 9.25,
      ),
    })),
    overflow = cards.filter((c) => !c.plan.fits).map((c) => c.r.name);
  return {
    cards: cards.map((c) => ({
      name: c.r.name,
      fontSize: c.plan.size,
      fits: c.plan.fits,
    })),
    overflow,
    pages: Math.ceil(cards.length / perPage),
    perPage,
    async bytes() {
      if (overflow.length)
        throw Error(
          `These creatures do not fit ${perPage} cards per page: ${overflow.join(", ")}. Choose a larger layout or the full sheet.`,
        );
      doc.setTitle("Bestiary table cards");
      doc.setCreator("The Bestiary Workshop");
      doc.setSubject("WFRP Fifth Edition · compact A4 table cards");
      const ink = rgb(0.12, 0.12, 0.12),
        rule = rgb(0.65, 0.65, 0.65);
      for (let start = 0; start < cards.length; start += perPage) {
        const page = doc.addPage(A4);
        page.drawText(
          `WARHAMMER FANTASY ROLEPLAY · TABLE CARDS · ${Math.floor(start / perPage) + 1} / ${Math.ceil(cards.length / perPage)}`,
          { x: margin, y: 10, size: 6.5, font, color: ink },
        );
        for (
          let slot = 0;
          slot < perPage && start + slot < cards.length;
          slot++
        ) {
          const { r, plan } = cards[start + slot],
            x = margin + (slot % 2) * (width + gap),
            top = A4[1] - margin - Math.floor(slot / 2) * (height + gap);
          page.drawRectangle({
            x,
            y: top - height,
            width,
            height,
            borderColor: rule,
            borderWidth: 0.5,
          });
          let y = top - 18;
          const draw = (lines, size, f = font) => {
            for (const line of lines) {
              page.drawText(line, { x: x + 10, y, size, font: f, color: ink });
              y -= size + 2;
            }
          };
          draw(plan.title, 12, bold);
          draw(plan.subtitle, 7.5);
          y -= 3;
          draw(plan.description, plan.size);
          if (plan.description.length) y -= 3;
          const keys = ["M", ...KEYS],
            cell = (width - 20) / keys.length;
          page.drawLine({
            start: { x: x + 10, y },
            end: { x: x + width - 10, y },
            thickness: 0.4,
            color: rule,
          });
          for (const [i, key] of keys.entries()) {
            const value = printable(font, r.stats[key] ?? "—"),
              cx = x + 10 + i * cell;
            page.drawText(key, {
              x: cx + (cell - bold.widthOfTextAtSize(key, 6.5)) / 2,
              y: y - 10,
              size: 6.5,
              font: bold,
              color: ink,
            });
            page.drawText(value, {
              x: cx + (cell - bold.widthOfTextAtSize(value, 8.5)) / 2,
              y: y - 23,
              size: 8.5,
              font: bold,
              color: ink,
            });
          }
          y -= 38;
          draw(
            wrap(
              bold,
              `W ${r.wounds} · TB ${r.tb} · ${r.size}${r.swarm ? " (Size ignored)" : ""}`,
              8,
              width - 20,
            ),
            8,
            bold,
          );
          y -= 3;
          for (const section of plan.sections) {
            for (const line of section.lines) {
              drawPDFRuns(page, line, {
                x: x + 10,
                y,
                size: plan.size,
                font,
                bold,
                color: ink,
              });
              y -= plan.lineHeight;
            }
            y -= plan.sectionGap;
          }
        }
      }
      return doc.save();
    },
  };
}
