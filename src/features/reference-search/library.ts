import { loadLibrary, loadJSON } from "../../services/content";
import { loadReferenceLibrary } from "../../engine/search-library.mjs";
import { createReferenceLinker } from "../../engine/book-search-links.mjs";
import { createCareerReferenceIndex } from "../../engine/career-references.mjs";
import { isSearchCategoryVisible } from "../../engine/reference-entries.mjs";

export type ReferenceRow = {
  key: string;
  kind: string;
  name: string;
  entry: any;
  aliases: string[];
  legacy: any[];
  filterValues: Record<string, string[]>;
  label?: string;
  printedReference?: boolean;
  facets?: any[];
  excerpt?: string;
  [key: string]: any;
};
export type ReferenceData = {
  rows: ReferenceRow[];
  books: any[];
  linkText: ReturnType<typeof createReferenceLinker>;
  careerReferences: ReturnType<typeof createCareerReferenceIndex>;
};
let pending: Promise<ReferenceData> | undefined;
export function loadSearchData(): Promise<ReferenceData> {
  return (pending ??= (async () => {
    const library = await loadLibrary();
    const payload = await loadReferenceLibrary(
      library,
      () => loadJSON("/data/search-library.json"),
      { normalize: false },
    );
    const rows = payload.rows.filter((row: ReferenceRow) =>
      isSearchCategoryVisible(row.kind),
    );
    return {
      rows,
      books: payload.books,
      linkText: createReferenceLinker(rows),
      careerReferences: createCareerReferenceIndex(rows),
    };
  })().catch((error) => {
    pending = undefined;
    throw error;
  }));
}
