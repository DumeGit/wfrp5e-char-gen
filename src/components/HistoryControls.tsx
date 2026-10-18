export function HistoryControls({
  canUndo,
  canRedo,
}: {
  canUndo: boolean;
  canRedo: boolean;
}) {
  return (
    <div className="history-controls" role="group" aria-label="Edit history">
      {(["undo", "redo"] as const).map((action) => (
        <button
          key={action}
          type="button"
          className="quiet history-button"
          data-action={action}
          aria-label={action === "undo" ? "Undo" : "Redo"}
          title={action === "undo" ? "Undo last change" : "Redo last change"}
          disabled={action === "undo" ? !canUndo : !canRedo}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={action === "redo" ? "history-redo-icon" : undefined}
          >
            <path d="M9 5 4 10l5 5M4 10h9a6 6 0 0 1 6 6v3" />
          </svg>
        </button>
      ))}
    </div>
  );
}
