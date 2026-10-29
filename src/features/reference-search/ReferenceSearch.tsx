"use client";
import { COMPACT_SHELL_QUERY } from "../../engine/responsive.mjs";
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { createSearchEngine } from "../../engine/search-engine.mjs";
import {
  SEARCH_CATEGORIES,
  searchLabel,
  referenceSnippetText,
} from "../../engine/search-presentation.mjs";
import { normalizeSearch } from "../../engine/search-ranking.mjs";
import {
  CHARACTERISTICS,
  filterOptionGroups,
  searchFilterFields,
  changeSearchFilter,
  searchCategory,
} from "../../engine/search-filters.mjs";
import { searchBookText } from "../../engine/book-search-text.mjs";
import type { ReferenceRequest } from "../../services/content";
import {
  loadSearchData,
  type ReferenceData,
  type ReferenceRow,
} from "./library";
import { ReferenceBody, CareerReferences } from "./ReferenceBody";

type View = { keys: string[]; name: string; quote?: ReferenceRow };
type Preview = { keys: string[]; name: string; left: number; top: number };
type Filters = Record<string, string>;
export function ReferenceSearch() {
  const [open, setOpen] = useState(false),
    [data, setData] = useState<ReferenceData | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [book, setBook] = useState(""),
    [categoryValues, setCategoryValues] = useState<Record<string, Filters>>({});
  const [ranked, setRanked] = useState<ReferenceRow[]>([]),
    [visible, setVisible] = useState(20),
    [active, setActive] = useState(-1),
    [searching, setSearching] = useState(false);
  const [view, setView] = useState<View | null>(null),
    [history, setHistory] = useState<{ view: View; scroll: number }[]>([]),
    [info, setInfo] = useState<{ title: string; text: string } | null>(null),
    [preview, setPreview] = useState<Preview | null>(null);
  const [compactTarget, setCompactTarget] = useState<Element | null>(null),
    [mobile, setMobile] = useState(false),
    [automatic, setAutomatic] = useState(true);
  const dialog = useRef<HTMLDialogElement>(null),
    infoDialog = useRef<HTMLDialogElement>(null),
    input = useRef<HTMLInputElement>(null),
    launcher = useRef<HTMLButtonElement>(null),
    opener = useRef<HTMLElement | null>(null),
    list = useRef<HTMLDivElement>(null),
    reader = useRef<HTMLElement>(null),
    sentinel = useRef<HTMLDivElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const engine = useRef<ReturnType<typeof createSearchEngine> | null>(null),
    pending = useRef<Promise<ReferenceData> | null>(null),
    alive = useRef(false),
    rankingId = useRef(0),
    restoredScroll = useRef<number | null>(null),
    resultsScroll = useRef(0);
  const filters = useMemo<Filters>(
    () => ({ book, ...(categoryValues[category] || {}) }),
    [book, categoryValues, category],
  );
  async function ensure() {
    if (data) return data;
    if (pending.current) return pending.current;
    setLoading(true);
    setError("");
    const request = loadSearchData()
      .then((payload) => {
        if (alive.current) {
          engine.current ??= createSearchEngine(
            payload.rows,
            () => new Worker("/workers/search-worker.mjs", { type: "module" }),
          );
          setData(payload);
          setLoading(false);
        }
        return payload;
      })
      .catch((cause) => {
        if (alive.current) {
          setError(cause instanceof Error ? cause.message : String(cause));
          setLoading(false);
        }
        throw cause;
      })
      .finally(() => {
        pending.current = null;
      });
    pending.current = request;
    return request;
  }
  function show() {
    opener.current = launcher.current;
    setOpen(true);
    void ensure().catch(() => {});
  }
  function close() {
    rankingId.current++;
    setOpen(false);
    setQuery("");
    setCategory("all");
    setBook("");
    setCategoryValues({});
    setRanked([]);
    setVisible(20);
    setActive(-1);
    setView(null);
    setHistory([]);
    setPreview(null);
    setInfo(null);
    resultsScroll.current = 0;
    dialog.current?.close();
    const target =
      opener.current?.isConnected && opener.current.getClientRects().length
        ? opener.current
        : launcher.current;
    target?.focus({ preventScroll: true });
  }
  function choose(keys: string[], name: string, push = true) {
    setPreview(null);
    if (push && view)
      setHistory((previous) => [
        ...previous,
        { view, scroll: reader.current?.scrollTop || 0 },
      ]);
    else if (!push) setHistory([]);
    resultsScroll.current = list.current?.scrollTop || resultsScroll.current;
    restoredScroll.current = 0;
    setView({ keys, name });
  }
  function backResults() {
    setPreview(null);
    setView(null);
    setHistory([]);
  }
  function previous() {
    const last = history.at(-1);
    if (!last) return;
    setHistory(history.slice(0, -1));
    restoredScroll.current = last.scroll;
    setView(last.view);
    setPreview(null);
  }
  useEffect(() => {
    alive.current = true;
    const compact = window.matchMedia(COMPACT_SHELL_QUERY),
      phone = window.matchMedia("(max-width: 760px)");
    const resize = () => {
      setCompactTarget(
        compact.matches ? document.querySelector("#compact-search") : null,
      );
      setMobile(phone.matches);
    };
    resize();
    setAutomatic("IntersectionObserver" in window);
    compact.addEventListener("change", resize);
    phone.addEventListener("change", resize);
    const external = (event: Event) => {
      const request = (event as CustomEvent<ReferenceRequest>).detail;
      if (!request) return;
      if (!dialog.current?.open)
        opener.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : launcher.current;
      setOpen(true);
      void ensure()
        .then((payload) => {
          if (!alive.current) return;
          const allowed = payload.rows.filter(
            (row) =>
              (!request.kind || row.kind === request.kind) &&
              (!request.book || row.entry.source.book === request.book),
          );
          let matches = request.id
            ? allowed.filter(
                (row) =>
                  row.key === request.id ||
                  row.entry.contentId === request.id ||
                  (request.kind === "critical" &&
                    row.entry.referenceId === request.id &&
                    normalizeSearch(row.name) ===
                      normalizeSearch(request.name || "")),
              )
            : allowed.filter(
                (row) =>
                  normalizeSearch(row.name) ===
                  normalizeSearch(request.name || ""),
              );
          if (!matches.length && request.name)
            matches = allowed.filter(
              (row) =>
                normalizeSearch(row.name.split(" (")[0]) ===
                normalizeSearch(request.name!.split(" (")[0]),
            );
          if (matches.length)
            choose(
              matches.map((row) => row.key),
              request.name || matches[0].name,
              false,
            );
          else if (request.quote) {
            const name = request.name || "Book reference";
            setPreview(null);
            setHistory([]);
            restoredScroll.current = 0;
            setView({
              keys: [],
              name,
              quote: {
                key: request.id || name,
                name,
                kind: request.kind || "magic",
                label: request.quote.label,
                entry: {
                  name,
                  text: request.quote.text,
                  source: request.quote.source,
                  descriptionStatus: "reviewed",
                },
                aliases: [],
                legacy: [],
                filterValues: {},
              },
            });
          } else setQuery(request.name || "");
        })
        .catch(() => {});
    };
    window.addEventListener("wfrp-reference", external);
    return () => {
      alive.current = false;
      rankingId.current++;
      engine.current?.dispose();
      engine.current = null;
      window.removeEventListener("wfrp-reference", external);
      compact.removeEventListener("change", resize);
      phone.removeEventListener("change", resize);
    };
  }, []);
  useLayoutEffect(() => {
    if (open && !dialog.current?.open) {
      dialog.current?.showModal();
      input.current?.focus();
    } else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  useEffect(() => {
    if (open && !loading && !view) input.current?.focus();
  }, [open, loading]);
  useLayoutEffect(() => {
    if (info && !infoDialog.current?.open) infoDialog.current?.showModal();
    else if (!info && infoDialog.current?.open) infoDialog.current.close();
  }, [info]);
  useEffect(() => {
    if (!open) return;
    const viewport = window.visualViewport;
    const fit = () => {
      if (dialog.current) {
        if (mobile && viewport) {
          dialog.current.style.height = `${viewport.height}px`;
          dialog.current.style.top = `${viewport.offsetTop}px`;
        } else {
          dialog.current.style.removeProperty("height");
          dialog.current.style.removeProperty("top");
        }
      }
    };
    fit();
    viewport?.addEventListener("resize", fit);
    viewport?.addEventListener("scroll", fit);
    return () => {
      viewport?.removeEventListener("resize", fit);
      viewport?.removeEventListener("scroll", fit);
    };
  }, [open, mobile]);
  useEffect(() => {
    if (!open || !data || !engine.current) return;
    const id = ++rankingId.current;
    setVisible(20);
    setActive(-1);
    setRanked([]);
    setSearching(true);
    if (list.current) list.current.scrollTop = 0;
    resultsScroll.current = 0;
    if (!query.trim() && category === "all" && !book) {
      setSearching(false);
      return;
    }
    void engine.current
      .search(query, category, filters)
      .then((result) => {
        if (alive.current && rankingId.current === id) {
          setRanked(result.rows as ReferenceRow[]);
          setSearching(false);
        }
      })
      .catch((cause) => {
        if (alive.current && rankingId.current === id) {
          setError(String(cause));
          setSearching(false);
        }
      });
  }, [query, category, filters, data, open]);
  useEffect(() => {
    if (
      !open ||
      !automatic ||
      visible >= ranked.length ||
      !sentinel.current ||
      !list.current
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting))
          setVisible((count) => Math.min(count + 20, ranked.length));
      },
      { root: list.current, rootMargin: "0px 0px 120px 0px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [open, automatic, ranked.length, visible]);
  useLayoutEffect(() => {
    if (view) {
      if (reader.current)
        reader.current.scrollTop = restoredScroll.current ?? 0;
      restoredScroll.current = null;
      heading.current?.focus({ preventScroll: true });
    } else if (list.current) list.current.scrollTop = resultsScroll.current;
  }, [view]);
  useLayoutEffect(() => {
    if (active >= 0)
      document
        .getElementById(`book-search-option-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, visible]);
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.max(
        0,
        Math.min(
          ranked.length - 1,
          event.key === "ArrowDown"
            ? active + 1
            : active < 0
              ? Math.min(visible, ranked.length) - 1
              : active - 1,
        ),
      );
      setActive(next);
      setVisible((count) => Math.max(count, Math.ceil((next + 1) / 20) * 20));
    } else if (event.key === "Enter" && ranked.length) {
      event.preventDefault();
      const row = ranked[Math.max(0, active)];
      choose([row.key], row.name, false);
      input.current?.blur();
    }
  }
  const categories = Object.entries(SEARCH_CATEGORIES)
    .filter(
      ([key]) =>
        key === "all" || data?.rows.some((row) => searchCategory(row) === key),
    )
    .sort(([a, labelA], [b, labelB]) =>
      a === "all" ? -1 : b === "all" ? 1 : labelA.localeCompare(labelB),
    );
  const fields: string[][] = searchFilterFields(
    data?.rows || [],
    category,
    filters,
  );
  const sourceText = (row: ReferenceRow) => {
    const source = data?.books.find(
      (book) => book.id === row.entry.source.book,
    );
    return `${source?.shortTitle || source?.title || "Core"} · p. ${row.entry.source.page}${row.printedReference && source?.edition === 4 ? " · Fourth Edition" : ""}`;
  };
  const sourceButton = (row: ReferenceRow) => (
    <>
      <button
        type="button"
        className="source source-button book-reference"
        onClick={() => {
          const book = data?.books.find(
            (book) => book.id === row.entry.source.book,
          );
          setInfo({
            title: book?.title || row.entry.source.book,
            text: `Printed page ${row.entry.source.page}\n${book?.edition}th Edition · content pack ${book?.version}\nReading this reference does not enable the book's rules for character creation.`,
          });
        }}
      >
        {sourceText(row)}
      </button>
      {row.legacy.length > 0 && (
        <button
          type="button"
          className="legacy-tag"
          aria-label="Explain Legacy adaptation"
          onClick={() =>
            setInfo({
              title: "Legacy adaptation",
              text: row.legacy
                .map(
                  (source) =>
                    `${data?.books.find((book) => book.id === source.book)?.shortTitle || source.book}${source.page ? ` p. ${source.page}` : ""}: ${source.adaptation}`,
                )
                .join("\n\n"),
            })
          }
        >
          Legacy
        </button>
      )}
    </>
  );
  function highlight(text: string): ReactNode {
    const pattern = query
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    return pattern
      ? String(text)
          .split(new RegExp(`(${pattern})`, "ig"))
          .map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))
      : text;
  }
  function snippet(row: ReferenceRow) {
    let text = referenceSnippetText(
      row.excerpt ||
        (row.printedReference ? row.entry.text : "") ||
        searchBookText(row.entry).text ||
        row.entry.class ||
        row.entry.category ||
        "",
    );
    const at = text.toLowerCase().indexOf(normalizeSearch(query).split(" ")[0]),
      start = at > 70 ? at - 35 : 0;
    return `${start ? "…" : ""}${text.slice(start, start + 130)}${text.length > start + 130 ? "…" : ""}`;
  }
  const current =
    view?.quote ??
    (view?.keys.length === 1
      ? data?.rows.find((row) => row.key === view.keys[0])
      : undefined);
  function showPreview(keys: string[], name: string, target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    setPreview({
      keys,
      name,
      left: Math.max(10, Math.min(rect.left, window.innerWidth - 350)),
      top:
        rect.bottom + 230 < window.innerHeight
          ? rect.bottom + 8
          : Math.max(10, rect.top - 230),
    });
  }
  function renderText(text: string): ReactNode {
    return String(text)
      .split(/(\*\*[^*]+\*\*)/g)
      .map((part, i) => {
        const bold = part.startsWith("**") && part.endsWith("**");
        const plain = bold ? part.slice(2, -2) : part;
        const segments = data?.linkText(plain, current) || [{ text: plain }];
        const content = segments.map((segment: any, j: number) =>
          segment.keys ? (
            <button
              key={j}
              type="button"
              className="search-term-link"
              aria-label={`View ${segment.text} reference`}
              onClick={() => choose(segment.keys, segment.text)}
              onPointerEnter={(event) => {
                if (
                  event.pointerType !== "touch" &&
                  window.matchMedia("(hover: hover) and (pointer: fine)")
                    .matches
                )
                  showPreview(segment.keys, segment.text, event.currentTarget);
              }}
              onPointerLeave={() => setPreview(null)}
              onFocus={(event) =>
                showPreview(segment.keys, segment.text, event.currentTarget)
              }
              onBlur={() => setPreview(null)}
            >
              {segment.text}
            </button>
          ) : (
            <Fragment key={j}>{segment.text}</Fragment>
          ),
        );
        return bold ? (
          <strong key={i}>{content}</strong>
        ) : (
          <Fragment key={i}>{content}</Fragment>
        );
      });
  }
  const activeFields = [["book", "Book"], ...fields].filter(
    ([key]) => filters[key],
  );
  function removeFilter(key: string) {
    if (key === "book") setBook("");
    else
      setCategoryValues((previous) => ({
        ...previous,
        [category]: changeSearchFilter(
          category,
          previous[category] || {},
          key,
          "",
        ),
      }));
  }
  const launch = (
    <button
      ref={launcher}
      type="button"
      className="quiet book-search-launcher"
      aria-haspopup="dialog"
      aria-label={
        query.trim()
          ? `Search books: ${query}`
          : "Search rules and book references"
      }
      onClick={show}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </svg>
      <span className="search-launch-label">
        {query.trim() || "Search rules and book references…"}
      </span>
    </button>
  );
  return (
    <>
      <div className="banner-search banner-search-ribbon">
        {compactTarget ? createPortal(launch, compactTarget) : launch}
      </div>
      <dialog
        ref={dialog}
        className="creator-dialog book-search-panel"
        aria-labelledby="search-panel-title"
        data-view={view ? "reference" : "results"}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <div className="dialog-heading search-panel-heading">
          <h2 id="search-panel-title">Search the books</h2>
          <button
            type="button"
            className="quiet"
            aria-label="Close search"
            onClick={close}
          >
            Close
          </button>
        </div>
        <div className="search-panel-controls">
          <div
            className="banner-search-field"
            onClick={(event) => {
              if (!(event.target as HTMLElement).closest("input,button"))
                input.current?.focus();
            }}
          >
            <span className="banner-search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              ref={input}
              id="book-search"
              type="search"
              role="combobox"
              aria-label="Search the books"
              aria-expanded={open}
              aria-controls="book-search-results"
              aria-autocomplete="list"
              aria-activedescendant={
                active >= 0 ? `book-search-option-${active}` : undefined
              }
              placeholder="Search rules and book references…"
              value={query}
              disabled={loading}
              onChange={(event) => {
                setQuery(event.target.value);
                setView(null);
                setHistory([]);
              }}
              onKeyDown={keyDown}
            />
            <button
              type="button"
              id="book-search-clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setView(null);
                input.current?.focus();
              }}
            >
              ×
            </button>
          </div>
          <div className="search-result-tools">
            <label>
              Category
              <select
                id="book-search-category"
                aria-label="Search category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setView(null);
                }}
              >
                {categories.map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Book
              <select
                id="book-search-book"
                aria-label="Book"
                value={book}
                onChange={(event) => {
                  setBook(event.target.value);
                  setView(null);
                }}
              >
                <option value="">All books</option>
                {data?.books
                  .filter(
                    (book) =>
                      book.kind !== "variant" &&
                      data.rows.some((row) =>
                        row.filterValues.book.includes(book.id),
                      ),
                  )
                  .map((book) => (
                    <option value={book.id} key={book.id}>
                      {book.shortTitle || book.title}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <details
            className="search-category-filters"
            hidden={!fields.length}
            open={!mobile}
            key={mobile ? "mobile" : "desktop"}
          >
            <summary>
              More filters
              {fields.some(([key]) => filters[key])
                ? ` · ${fields.filter(([key]) => filters[key]).length} active`
                : ""}
            </summary>
            <div className="search-filter-fields">
              {fields.map(([key, label]) => (
                <label key={key}>
                  {label}
                  <select
                    aria-label={label}
                    data-search-filter={key}
                    value={filters[key] || ""}
                    onChange={(event) => {
                      setCategoryValues((previous) => ({
                        ...previous,
                        [category]: changeSearchFilter(
                          category,
                          previous[category] || {},
                          key,
                          event.target.value,
                        ),
                      }));
                      setView(null);
                    }}
                  >
                    <option value="">All</option>
                    {filterOptionGroups(
                      data?.rows || [],
                      category,
                      key,
                      filters,
                    ).map(
                      ({ label: groupLabel, values }: any, index: number) =>
                        groupLabel ? (
                          <optgroup label={groupLabel} key={index}>
                            {values.map((value: string) => (
                              <option key={value} value={value}>
                                {(CHARACTERISTICS as any)[value] || value}
                              </option>
                            ))}
                          </optgroup>
                        ) : (
                          <Fragment key={index}>
                            {values.map((value: string) => (
                              <option value={value} key={value}>
                                {(CHARACTERISTICS as any)[value] || value}
                              </option>
                            ))}
                          </Fragment>
                        ),
                    )}
                  </select>
                </label>
              ))}
            </div>
          </details>
          <div
            className="search-filter-chips"
            aria-label="Active search filters"
            hidden={!activeFields.length}
          >
            {activeFields.map(([key, label]) => {
              const value =
                key === "book"
                  ? data?.books.find((book) => book.id === filters[key])
                      ?.shortTitle || filters[key]
                  : (CHARACTERISTICS as any)[filters[key]] || filters[key];
              return (
                <button
                  key={key}
                  type="button"
                  className="quiet search-filter-chip"
                  aria-label={`Remove ${label} filter: ${value}`}
                  onClick={() => removeFilter(key)}
                >
                  {label}: {value}
                  <span aria-hidden="true">×</span>
                </button>
              );
            })}
            {activeFields.length > 0 && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setBook("");
                  setCategoryValues((previous) => ({
                    ...previous,
                    [category]: {},
                  }));
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
        <div className="search-panel-content">
          <div className="search-results-pane">
            <div id="book-search-dropdown" className="book-search-dropdown">
              <p id="book-search-status" role="status">
                {loading
                  ? "Loading book references…"
                  : error || searching
                    ? "Searching book references…"
                    : query.trim() || category !== "all" || book
                      ? `${ranked.length} match${ranked.length === 1 ? "" : "es"} · all supplied books`
                      : "Search all supplied books, or choose a category to browse."}
              </p>
              {error && (
                <>
                  <p className="notice" role="alert">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => void ensure().catch(() => {})}
                    aria-label="Retry loading book references"
                  >
                    Retry loading book references
                  </button>
                </>
              )}
              <div
                ref={list}
                id="book-search-results"
                role="listbox"
                aria-label="Matching rules"
                onScroll={() => {
                  if (!view)
                    resultsScroll.current = list.current?.scrollTop || 0;
                }}
              >
                {ranked.slice(0, visible).map((row, index) => (
                  <div
                    role="option"
                    id={`book-search-option-${index}`}
                    aria-selected={active === index}
                    tabIndex={-1}
                    key={row.key}
                    data-search-key={row.key}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setActive(index);
                      choose([row.key], row.name, false);
                    }}
                  >
                    <span className="book-search-result-name">
                      <strong>{highlight(row.name)}</strong>
                      <span className="search-kind">{searchLabel(row)}</span>
                    </span>
                    <span className="book-search-result-source">
                      {sourceText(row)}
                      {row.legacy.length ? " · Legacy" : ""}
                    </span>
                    <span className="book-search-excerpt">
                      {highlight(snippet(row))}
                    </span>
                  </div>
                ))}
                <div
                  ref={sentinel}
                  className="search-scroll-sentinel"
                  aria-hidden="true"
                />
              </div>
              <p
                id="book-search-empty"
                hidden={
                  loading ||
                  searching ||
                  !data ||
                  (!query.trim() && category === "all" && !book) ||
                  ranked.length > 0
                }
              >
                No matching references.
              </p>
              <button
                type="button"
                id="book-search-more"
                hidden={automatic || visible >= ranked.length}
                onClick={() =>
                  setVisible((count) => Math.min(count + 20, ranked.length))
                }
              >
                Load more results
              </button>
              <p
                className="search-results-end"
                hidden={!ranked.length || visible < ranked.length}
              >
                All matching references shown.
              </p>
            </div>
          </div>
          {!view && (
            <div className="search-reader-placeholder">
              <span className="eyebrow">Book reference</span>
              <h3>Choose a result to read</h3>
              <p>Explore the supplied books without changing your character.</p>
            </div>
          )}
          <section
            ref={reader}
            id="book-search-dialog"
            className="search-reader"
            role="region"
            aria-labelledby="book-search-title"
            hidden={!view}
            onScroll={() => setPreview(null)}
          >
            <div className="dialog-heading">
              <button
                type="button"
                className="quiet search-return-to-results"
                aria-label="Back to search results"
                onClick={backResults}
              >
                ← Results
              </button>
              {history.length > 0 && (
                <button
                  type="button"
                  className="quiet search-chain-back"
                  aria-label="Back to previous reference"
                  onClick={previous}
                >
                  ← Back
                </button>
              )}
              <h2 id="book-search-title" ref={heading} tabIndex={-1}>
                {current?.name || view?.name}
              </h2>
            </div>
            <div id="book-search-body">
              {current ? (
                <>
                  <p className="search-rule-source">
                    <span className="search-kind">{searchLabel(current)}</span>
                    {sourceButton(current)}
                  </p>
                  {current.printedReference &&
                    data?.books.find(
                      (book) => book.id === current.entry.source.book,
                    )?.edition === 4 && (
                      <p className="notice">
                        <strong>Fourth Edition source.</strong> This reference
                        preserves its printed mechanics; no Fifth Edition
                        conversion is implied. References to its core rulebook
                        pages refer to Fourth Edition.
                      </p>
                    )}
                  <div className="search-book-reference">
                    <ReferenceBody row={current} renderText={renderText} />
                    {data && (
                      <CareerReferences
                        row={current}
                        data={data}
                        onOpen={choose}
                      />
                    )}
                  </div>
                </>
              ) : (
                view && (
                  <>
                    <p>
                      Several book references share this name. Choose which to
                      read.
                    </p>
                    <div className="search-reference-choices">
                      {view.keys.map((key) => {
                        const row = data?.rows.find((row) => row.key === key);
                        return (
                          row && (
                            <div key={key}>
                              <button
                                type="button"
                                className="quiet"
                                onClick={() => choose([key], row.name)}
                              >
                                {row.name} · {searchLabel(row)}
                              </button>{" "}
                              {sourceButton(row)}
                            </div>
                          )
                        );
                      })}
                    </div>
                  </>
                )
              )}
              <div className="search-rule-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={backResults}
                >
                  Back to search
                </button>
              </div>
            </div>
          </section>
        </div>
        {preview && (
          <aside
            id="search-term-preview"
            className="search-term-preview"
            role="tooltip"
            style={{ left: preview.left, top: preview.top }}
          >
            <strong>{preview.name}</strong>
            {preview.keys.map((key) => {
              const row = data?.rows.find((row) => row.key === key);
              return (
                row && (
                  <p key={key}>
                    {searchLabel(row)} · {sourceText(row)}
                    {row.legacy.length ? " · Legacy" : ""}
                    {preview.keys.length === 1 && (
                      <>
                        <br />
                        {searchBookText(row.entry).text.slice(0, 240) ||
                          "Open to view its profile and source."}
                      </>
                    )}
                  </p>
                )
              );
            })}
            <small>Click to read the full reference</small>
          </aside>
        )}
      </dialog>
      <dialog
        ref={infoDialog}
        className="book-search-dialog"
        aria-label="Reference information"
        onCancel={(event) => {
          event.preventDefault();
          setInfo(null);
        }}
      >
        <div className="dialog-heading">
          <h2>{info?.title}</h2>
          <button type="button" className="quiet" onClick={() => setInfo(null)}>
            Close
          </button>
        </div>
        <p>
          {info?.text.split("\n").map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      </dialog>
    </>
  );
}
