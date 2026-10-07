import { createReferenceSearch } from "../reference-search.mjs";
export function createBookSearch(getContext) {
  return createReferenceSearch(getContext().library);
}
