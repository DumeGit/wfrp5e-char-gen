import { KEYS } from "../rules.mjs";
import { sourceLabel } from "./books.mjs";
import { rowName } from "./model.mjs";
import { talentLabel } from "./export-sections.mjs";
import { wrapPDFRuns, drawPDFRuns } from "./pdf-text.mjs";

export const MIN_CARD_FONT = 7.5;
const PAD = 4,
  GUTTER = 33,
  COLUMN_GAP = 4;

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

// The drawing consumes these exact measured text boxes; no parallel height math.
function measure(font, bold, { r, sections }, width, size) {
  const commands = [],
    inner = width - PAD * 2,
    lineHeight = size + 0.75;
  let top = PAD;
  const lines = (runs, textSize, available) =>
    wrapPDFRuns(
      runs.map((run) => ({ ...run, text: printable(font, run.text) })),
      font,
      bold,
      textSize,
      available,
    );
  const text = (
    runs,
    x,
    y,
    available,
    textSize = size,
    leading = lineHeight,
    align = "left",
  ) => {
    const wrapped = lines(runs, textSize, available);
    commands.push({
      kind: "text",
      x,
      top: y,
      width: available,
      size: textSize,
      leading,
      align,
      lines: wrapped,
    });
    return wrapped.length * leading;
  };
  const plain = (value, strong = false) => [
    { text: String(value ?? ""), bold: strong },
  ];
  const source = sourceLabel(r.profile),
    sourceWidth = Math.min(
      inner / 3,
      font.widthOfTextAtSize(printable(font, source), 6.5) + 1,
    );
  const nameHeight = text(
    plain(r.name, true),
    PAD,
    top,
    inner - sourceWidth - 4,
    12,
    14,
  );
  const sourceHeight = text(
    plain(source),
    width - PAD - sourceWidth,
    top + 1,
    sourceWidth,
    6.5,
    7.25,
    "right",
  );
  top += Math.max(nameHeight, sourceHeight);
  const meta = [
    r.name !== r.profile.name && r.profile.name,
    r.template?.name,
    r.size + (r.swarm ? " (Size ignored)" : ""),
    `TB ${r.tb}`,
  ]
    .filter(Boolean)
    .join(" · ");
  top += text(plain(meta), PAD, top, inner, 7, 8) + 2;

  const keys = ["M", ...KEYS, "W"],
    cell = inner / keys.length;
  const statsTop = top;
  let valuesHeight = 0;
  commands.push({ kind: "rule", x: PAD, top, width: inner });
  for (const [i, key] of keys.entries()) {
    const x = PAD + i * cell;
    text(plain(key), x + 1, top + 2, cell - 2, 6, 7, "center");
    valuesHeight = Math.max(
      valuesHeight,
      text(
        plain(key === "W" ? r.wounds : (r.stats[key] ?? "—"), true),
        x + 1,
        top + 9,
        cell - 2,
        8.5,
        9.25,
        "center",
      ),
    );
  }
  top += 10 + valuesHeight + 2;
  commands.push({
    kind: "shade",
    x: PAD,
    top: statsTop,
    width: inner,
    height: top - statsTop,
  });

  const contentX = PAD + GUTTER + COLUMN_GAP,
    contentWidth = width - PAD - contentX;
  for (const [label, value] of sections) {
    commands.push({ kind: "rule", x: PAD, top, width: inner });
    const start = top + 2;
    const labelHeight = text(
      plain(label === "Trappings" ? "Gear" : label, true),
      PAD,
      start,
      GUTTER,
      6.5,
      7.25,
    );
    let y = start;
    if (label === "Attacks") {
      const scoreWidth = Math.min(
        contentWidth * 0.4,
        Math.max(
          ...r.attacks.map((a) =>
            bold.widthOfTextAtSize(
              printable(
                font,
                `${a.skill ?? "—"} / ${a.damage === null ? "—" : "+" + a.damage}`,
              ),
              size,
            ),
          ),
        ) + 1,
      );
      for (const attack of r.attacks) {
        const left = text(
          [
            { text: attack.name, bold: true },
            { text: attack.text ? ` · ${attack.text}` : "" },
          ],
          contentX,
          y,
          contentWidth - scoreWidth - 4,
        );
        const right = text(
          plain(
            `${attack.skill ?? "—"} / ${attack.damage === null ? "—" : "+" + attack.damage}`,
            true,
          ),
          contentX + contentWidth - scoreWidth,
          y,
          scoreWidth,
          size,
          lineHeight,
          "right",
        );
        y += Math.max(left, right);
      }
    } else if (label === "Soak") {
      const locations = Object.entries(r.ap),
        tile = contentWidth / locations.length;
      let namesHeight = 0,
        totalsHeight = 0;
      for (const [i, [location]] of locations.entries())
        namesHeight = Math.max(
          namesHeight,
          text(
            plain(location),
            contentX + i * tile + 1,
            y,
            tile - 2,
            6.5,
            7.25,
            "center",
          ),
        );
      for (const [i, [, ap]] of locations.entries())
        totalsHeight = Math.max(
          totalsHeight,
          text(
            plain(
              `${r.tb + ap}${r.shield ? `/${r.tb + ap + r.shield}` : ""}`,
              true,
            ),
            contentX + i * tile + 1,
            y + namesHeight,
            tile - 2,
            size,
            lineHeight,
            "center",
          ),
        );
      y += namesHeight + totalsHeight;
    } else if (label === "Skills") {
      const cellWidth = (contentWidth - 6) / 2;
      for (let i = 0; i < r.skills.length; i += 2) {
        let rowHeight = 0;
        for (const [column, skill] of r.skills.slice(i, i + 2).entries()) {
          const x = contentX + column * (cellWidth + 6);
          const valueWidth = Math.min(
            cellWidth * 0.45,
            bold.widthOfTextAtSize(String(skill.total), size) + 1,
          );
          const name = text(
            plain(skill.name),
            x,
            y,
            cellWidth - valueWidth - 3,
          );
          const total = text(
            plain(skill.total, true),
            x + cellWidth - valueWidth,
            y,
            valueWidth,
            size,
            lineHeight,
            "right",
          );
          rowHeight = Math.max(rowHeight, name, total);
        }
        y += rowHeight;
      }
    } else if (label === "Talents" || label === "Traits") {
      for (const ability of label === "Talents" ? r.talents : r.traits)
        y += text(
          [
            {
              text: `${label === "Talents" ? talentLabel(ability) : rowName(ability)}: `,
              bold: true,
            },
            { text: ability.description },
          ],
          contentX,
          y,
          contentWidth,
        );
    } else {
      y += text(plain(value), contentX, y, contentWidth);
    }
    top = Math.max(start + labelHeight, y) + 2;
  }
  return { commands, size, width, heightNeeded: Math.ceil(top + PAD) };
}

export function planRecordCard(font, bold, entry, width, maxHeight, maxSize) {
  let plan;
  for (let size = maxSize; size >= MIN_CARD_FONT; size -= 0.25) {
    plan = measure(font, bold, entry, width, size);
    if (plan.heightNeeded <= maxHeight) return { ...plan, fits: true };
  }
  return { ...plan, fits: false };
}

export function drawRecordCard(
  page,
  plan,
  { x, top, font, bold, ink, rule, paper },
) {
  // Backgrounds must precede the measured text commands.
  for (const c of plan.commands.filter((c) => c.kind === "shade"))
    page.drawRectangle({
      x: x + c.x,
      y: top - c.top - c.height,
      width: c.width,
      height: c.height,
      color: paper,
    });
  for (const c of plan.commands) {
    if (c.kind === "rule")
      page.drawLine({
        start: { x: x + c.x, y: top - c.top },
        end: { x: x + c.x + c.width, y: top - c.top },
        thickness: 0.3,
        color: rule,
      });
    if (c.kind !== "text") continue;
    for (const [index, runs] of c.lines.entries()) {
      const length = runs.reduce(
        (sum, run) =>
          sum + (run.bold ? bold : font).widthOfTextAtSize(run.text, c.size),
        0,
      );
      const offset =
        c.align === "right"
          ? c.width - length
          : c.align === "center"
            ? (c.width - length) / 2
            : 0;
      drawPDFRuns(page, runs, {
        x: x + c.x + offset,
        y: top - c.top - c.size * 0.82 - index * c.leading,
        size: c.size,
        font,
        bold,
        color: ink,
      });
    }
  }
}
