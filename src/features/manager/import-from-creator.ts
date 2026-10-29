import { CharacterDatabase } from "./database";
import { loadLibrary, loadJSON } from "../../services/content";
import { createMarijanCatalogue } from "../../engine/marijan/catalogue.mjs";
import { importCharacter } from "../../engine/manager/model.mjs";

// Loaded only by the explicit Review action. Use the normal import conversion
// and one atomic create, leaving the creator and existing manager records alone.
export async function copyPlayerToManager(
  draft: any,
  verify: boolean,
  isCurrent: () => boolean,
) {
  const [library, creatures] = await Promise.all([
    loadLibrary(),
    loadJSON("/gm/data.json"),
  ]);
  const catalogue = createMarijanCatalogue(library, creatures);
  const record = importCharacter(catalogue, library, draft);
  const db = new CharacterDatabase(verify);
  try {
    await db.open();
    if (!isCurrent())
      throw Error("The character changed. Review it and try again.");
    const saved = await db.save(record, null);
    return saved.id as string;
  } finally {
    db.close();
  }
}
