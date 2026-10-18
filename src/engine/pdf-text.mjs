// Measure and draw mixed-weight text with the same embedded fonts.
// Keep emphasis in the layout plan so bold labels cannot overflow measured cards.
export function wrapPDFRuns(runs, font, bold, size, width) {
  const lines = [];
  let line = [],
    word = [],
    used = 0,
    space = false;
  const measure = (run) =>
    (run.bold ? bold : font).widthOfTextAtSize(run.text, size);
  const append = (run) => {
    const last = line.at(-1);
    if (last && last.bold === run.bold) last.text += run.text;
    else line.push({ ...run });
    used += measure(run);
  };
  const nextLine = () => {
    lines.push(line);
    line = [];
    used = 0;
    space = false;
  };
  const flush = () => {
    if (!word.length) return;
    const length = word.reduce((n, run) => n + measure(run), 0);
    const gap = space && line.length ? measure({ text: " " }) : 0;
    if (line.length && used + gap + length > width) nextLine();
    if (space && line.length) append({ text: " ", bold: false });
    for (const run of word) {
      for (const c of run.text) {
        const part = { text: c, bold: run.bold };
        if (line.length && used + measure(part) > width) nextLine();
        append(part);
      }
    }
    word = [];
    space = false;
  };
  for (const run of runs) {
    for (const c of run.text) {
      if (/\s/.test(c)) {
        flush();
        if (c === "\n") nextLine();
        else space = true;
      } else {
        const last = word.at(-1);
        if (last && last.bold === !!run.bold) last.text += c;
        else word.push({ text: c, bold: !!run.bold });
      }
    }
  }
  flush();
  lines.push(line);
  return lines;
}

export function drawPDFRuns(page, runs, { x, y, size, font, bold, color }) {
  for (const run of runs) {
    const face = run.bold ? bold : font;
    page.drawText(run.text, { x, y, size, font: face, color });
    x += face.widthOfTextAtSize(run.text, size);
  }
}
