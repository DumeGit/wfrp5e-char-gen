export function historyControls() {
  return `<div class="history-controls" role="group" aria-label="Edit history">${["undo", "redo"].map((action) => `<button type="button" class="quiet history-button" data-action="${action}" aria-label="${action === "undo" ? "Undo" : "Redo"}" title="${action === "undo" ? "Undo last change" : "Redo last change"}" disabled><svg aria-hidden="true" viewBox="0 0 24 24" ${action === "redo" ? 'class="history-redo-icon"' : ""}><path d="M9 5 4 10l5 5M4 10h9a6 6 0 0 1 6 6v3"/></svg></button>`).join("")}</div>`;
}
export function refreshHistoryControls(root, history) {
  for (const action of ["undo", "redo"])
    for (const button of root.querySelectorAll(
      `.history-controls [data-action="${action}"]`,
    ))
      button.disabled = !history?.[action === "undo" ? "canUndo" : "canRedo"];
}
