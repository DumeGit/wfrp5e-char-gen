type Props = {
  group: string;
  record: any;
  disabled: boolean;
  act: (action: string) => void;
};

export function ActionGroups({ group, record, disabled, act }: Props) {
  const choice = (
    action: string,
    label: string,
    description: string,
    danger = false,
  ) => (
    <button
      key={action}
      type="button"
      className={`manager-action-choice${danger ? " manager-action-choice-danger" : ""}`}
      aria-label={label}
      disabled={disabled}
      onClick={() => act(action)}
    >
      <strong>{label}</strong>
      <span>{description}</span>
    </button>
  );
  return (
    <div className="manager-action-groups">
      {group === "new-actions" && (
        <div className="manager-action-grid">
          {choice(
            "import",
            "Import character",
            "Open a Player, Marijan or manager JSON save.",
          )}
          {choice(
            "new",
            "New blank character",
            "Start an empty sheet in your character library.",
          )}
        </div>
      )}
      {group === "file-actions" && (
        <>
          {record && (
            <section>
              <h3>This character</h3>
              <div className="manager-action-grid">
                {choice(
                  "json",
                  "Export character JSON",
                  "Save an editable copy of this character.",
                )}
                {choice(
                  "pdf",
                  "Export PDF sheet",
                  "Download the character sheet and complete record.",
                )}
              </div>
            </section>
          )}
          <section>
            <h3>Character library</h3>
            <div className="manager-action-grid">
              {choice(
                "backup",
                "Back up library",
                "Download every character in one backup.",
              )}
              {choice(
                "restore",
                "Restore library backup",
                "Preview a backup and choose how to restore it.",
              )}
            </div>
          </section>
        </>
      )}
      {group === "character-actions" && record && (
        <div className="manager-action-grid">
          {choice(
            "profile",
            "Edit profile",
            "Change the name, portrait and background.",
          )}
          {choice(
            "adjustments",
            "Adjust sheet",
            "Make manual corrections to the character sheet.",
          )}
          {choice(
            "duplicate",
            "Duplicate character",
            "Create an independent copy in your library.",
          )}
          {choice(
            "favourite",
            record.favourite ? "Remove favourite" : "Favourite character",
            "Change whether this character appears in Favourites.",
          )}
          {choice(
            "archive",
            record.archived ? "Restore character" : "Archive character",
            record.archived
              ? "Return this character to the active library."
              : "Keep this character in the archived library.",
          )}
          {choice(
            "delete",
            "Permanently delete character",
            "Review the confirmation before deleting this character.",
            true,
          )}
        </div>
      )}
    </div>
  );
}
