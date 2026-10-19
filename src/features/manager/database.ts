import Dexie, { type Table } from "dexie";
import { validateManager } from "../../engine/manager/model.mjs";

export class CharacterDatabase extends Dexie {
  characters!: Table<any, string>;
  constructor(verify = false) {
    super("wfrp-character-manager-v1" + (verify ? "-verification" : ""));
    this.version(1).stores({
      characters: "id, updatedAt, archived, favourite",
    });
  }
  async save(record: any, expected: number | null) {
    const next = validateManager(record);
    return this.transaction("rw", this.characters, async () => {
      const stored = await this.characters.get(next.id);
      if (
        (expected === null && stored) ||
        (expected !== null && (!stored || stored.revision !== expected))
      )
        throw Error(
          "This character changed in another tab. Download your unsaved copy, then reload the saved character or keep your copy as a duplicate.",
        );
      next.revision = (stored?.revision || 0) + 1;
      next.updatedAt = new Date().toISOString();
      await this.characters.put(next);
      return next;
    });
  }
  async restore(
    records: any[],
    policy: "copy" | "replace" | "skip",
    expected: Map<string, number>,
  ) {
    const checked = records.map(validateManager);
    if (new Set(checked.map((x) => x.id)).size !== checked.length)
      throw Error("The backup contains duplicate character IDs.");
    return this.transaction("rw", this.characters, async () => {
      const saved = [];
      for (const record of checked) {
        let old = await this.characters.get(record.id);
        if (old && policy === "skip") continue;
        if (policy === "copy") {
          record.id = crypto.randomUUID();
          old = undefined;
        } else if (old && old.revision !== expected.get(record.id))
          throw Error(
            "The library changed in another tab. Review the restore preview again.",
          );
        else if (!old && expected.has(record.id))
          throw Error(
            "The library changed in another tab. Review the restore preview again.",
          );
        record.revision = (old?.revision || 0) + 1;
        record.updatedAt = new Date().toISOString();
        await this.characters.put(record);
        saved.push(record);
      }
      return saved;
    });
  }
}
