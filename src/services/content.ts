// Reuse immutable wire data, while each creator assembles its own rule catalogue.
import { loadBookBundle } from "../engine/book-bundle.mjs";
const requests = new Map<string, Promise<unknown>>();
export function loadJSON<T = any>(url: string): Promise<T> {
  let request = requests.get(url);
  if (!request) {
    request = fetch(url)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Cannot load ${url}: ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        requests.delete(url);
        throw error;
      });
    requests.set(url, request);
  }
  return request as Promise<T>;
}
let library: ReturnType<typeof loadBookBundle> | undefined;
export function loadLibrary() {
  return (library ??= loadBookBundle((url: string) => loadJSON(url)).catch(
    (error: unknown) => {
      library = undefined;
      throw error;
    },
  ));
}
export type ReferenceRequest = {
  kind?: string;
  name?: string;
  book?: string;
  id?: string;
  // Reviewed creator references can use the shared reader without joining search.
  quote?: {
    text: string;
    source: { book: string; page: number };
    label: string;
  };
};
export function requestReference(request: ReferenceRequest) {
  window.dispatchEvent(new CustomEvent("wfrp-reference", { detail: request }));
}
