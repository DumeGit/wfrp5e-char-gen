import { assembleBooks, bookSelection } from "./books.mjs";

// PC support is not evidence that a supplement's NPC rules were reviewed.
export function npcBooks(library) {
  return library.packs.filter((p) => p.manifest.creators?.includes("npc"));
}

export function assembleNPCBooks(library, ids = [library.core]) {
  const allowed = new Set(npcBooks(library).map((p) => p.manifest.id));
  if (!Array.isArray(ids) || ids.some((id) => !allowed.has(id)))
    throw Error("This book has not been reviewed for the NPC creator.");
  const R = assembleBooks(library, ids);
  if (R.selection.some((ref) => !allowed.has(ref.id)))
    throw Error("A required book has not been reviewed for the NPC creator.");
  return R;
}

export function catalogForNPC(library, state) {
  const refs = state.books?.packs;
  if (state.books?.schemaVersion !== 1 || !Array.isArray(refs) || !refs.length)
    throw Error("The NPC file needs a current book selection.");
  for (const ref of refs) {
    const pack = library.packs.find((p) => p.manifest.id === ref.id);
    if (!pack || pack.manifest.version !== ref.version)
      throw Error(`Missing or different NPC book version: ${ref.id}.`);
  }
  const R = assembleNPCBooks(
    library,
    refs.map((ref) => ref.id),
  );
  if (JSON.stringify(state.books) !== JSON.stringify(bookSelection(R)))
    throw Error("Saved NPC book dependencies or order do not match.");
  return R;
}

export function npcSourceLabel(R, entry) {
  const source = entry?.source || entry;
  const book = R.books.find((b) => b.id === source?.book);
  return `${book?.shortTitle || book?.title || source?.book || "Core"}${source?.page ? ` p. ${source.page}` : ""}`;
}
