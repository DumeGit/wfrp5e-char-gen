import { prepareSearchRows } from "./search-worker.mjs";
import { searchBooks } from "./search-ranking.mjs";

// Constructed only after the lazy library has loaded. Worker messages contain
// searchable projections, not complete profiles or any character state.
export function createSearchEngine(
  rows,
  makeWorker = () =>
    new window.Worker(new URL("./search-worker.mjs", import.meta.url), {
      type: "module",
    }),
) {
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const projection = rows.map(
    ({ key, name, kind, label, filterValues, aliases, textFields }) => ({
      key,
      name,
      kind,
      label,
      filterValues,
      aliases,
      textFields,
    }),
  );
  let worker,
    fallback,
    serial = 0;
  const pending = new Map();
  function fail(error) {
    worker?.terminate();
    worker = undefined;
    for (const task of pending.values()) {
      clearTimeout(task.timer);
      task.reject(error);
    }
    pending.clear();
  }
  function request(payload) {
    return new Promise((resolve, reject) => {
      const id = ++serial;
      const timer = setTimeout(
        () => fail(Error("Search worker timed out.")),
        10000,
      );
      pending.set(id, { resolve, reject, timer });
      try {
        worker.postMessage({ ...payload, id });
      } catch (error) {
        fail(error);
      }
    });
  }
  let ready;
  try {
    worker = makeWorker();
    worker.addEventListener("message", ({ data }) => {
      const task = pending.get(data.id);
      if (!task) return;
      pending.delete(data.id);
      clearTimeout(task.timer);
      if (data.error) task.reject(Error(data.error));
      else task.resolve(data.result);
    });
    worker.addEventListener("error", () =>
      fail(Error("Search worker failed.")),
    );
    ready = request({ type: "init", rows: projection }).catch(() => {
      fail(Error("Search worker unavailable."));
    });
  } catch {
    ready = Promise.resolve();
  }
  return {
    async search(query, category = "all", filters = {}) {
      await ready;
      let result;
      if (worker) {
        try {
          result = await request({ type: "search", query, category, filters });
        } catch {
          fail(Error("Search worker unavailable."));
        }
      }
      if (!result) {
        fallback ??= prepareSearchRows(projection);
        result = searchBooks(fallback, query, Infinity, { category, filters });
      }
      return {
        total: result.total,
        rows: result.rows.map((hit) => ({
          ...byKey.get(hit.key),
          excerpt: hit.excerpt,
          rank: hit.rank,
        })),
      };
    },
    dispose() {
      fail(Error("Search engine closed."));
    },
  };
}
