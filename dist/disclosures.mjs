// Disclosure identity uses explicit sections/content, never rendered labels.
export function detailKey(section, entry = "") {
  const id =
    typeof entry === "object" && entry !== null
      ? entry.contentId ||
        entry.id ||
        entry.key ||
        entry.name ||
        JSON.stringify(entry)
      : entry;
  return section + ":" + encodeURIComponent(String(id ?? ""));
}
export function captureDisclosures(root, state) {
  for (const node of root.querySelectorAll("details[data-detail-key]"))
    state.set(node.dataset.detailKey, node.open);
}
export function restoreDisclosures(root, state) {
  for (const node of root.querySelectorAll("details[data-detail-key]"))
    if (state.has(node.dataset.detailKey))
      node.open = state.get(node.dataset.detailKey);
}
