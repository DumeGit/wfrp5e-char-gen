export const PRINT_LAYOUTS = [6, 4, "flexible"];
export const CARD_PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 18,
  gap: 8,
  footer: 20,
};

export function printGeometry(layout) {
  if (!PRINT_LAYOUTS.includes(layout))
    throw Error("Choose six, four or flexible cards per A4 page.");
  const { width, height, margin, gap, footer } = CARD_PAGE;
  const pageHeight = height - 2 * margin - footer;
  const rows = layout === "flexible" ? 1 : layout / 2;
  return {
    width: (width - 2 * margin - gap) / 2,
    height: (pageHeight - gap * (rows - 1)) / rows,
    pageHeight,
  };
}

// Preserve entry identities, but let later short cards fill earlier-page gaps.
// Use the shortest eligible column on the first page with enough room.
export function packTableCards(heights, layout) {
  const geometry = printGeometry(layout),
    { margin, gap, height: pageHeight } = CARD_PAGE;
  const positions = [];
  const used = [[0, 0]];
  let page = 0;
  for (const [index, contentHeight] of heights.entries()) {
    if (
      !Number.isFinite(contentHeight) ||
      contentHeight <= 0 ||
      contentHeight > geometry.height
    )
      throw Error("Card height exceeds its measured print area.");
    let column, offset, height;
    if (layout !== "flexible") {
      page = Math.floor(index / layout);
      column = index % 2;
      offset = Math.floor((index % layout) / 2) * (geometry.height + gap);
      height = geometry.height;
    } else {
      const available = (p) =>
        [0, 1]
          .filter((c) => used[p][c] + contentHeight <= geometry.pageHeight)
          .sort((a, b) => used[p][a] - used[p][b] || a - b);
      page = 0;
      while (page < used.length && !available(page).length) page++;
      if (page === used.length) {
        used.push([0, 0]);
      }
      column = available(page)[0];
      offset = used[page][column];
      height = contentHeight;
      used[page][column] += height + gap;
    }
    positions.push({
      page,
      column,
      x: margin + column * (geometry.width + gap),
      top: pageHeight - margin - offset,
      width: geometry.width,
      height,
    });
  }
  return {
    positions,
    pages: positions.length ? Math.max(...positions.map((p) => p.page)) + 1 : 0,
  };
}
