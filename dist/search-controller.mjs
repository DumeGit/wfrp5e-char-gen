import { searchBooks, normalizeSearch } from "./book-search.mjs";
import { SEARCH_CATEGORIES, searchLabel } from "./search-presentation.mjs";
import {
  CATEGORY_FILTERS,
  CHARACTERISTICS,
  filterOptionGroups,
  searchCategory,
} from "./search-filters.mjs";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const BATCH = 20;

// One transient search interaction for both creators. The input node is never
// replaced. Desktop and phone share one modal with native filter controls.
export function createSearchController({
  getIndex,
  getScope,
  onOpen,
  onClose,
  renderResult,
  searchIndex,
  getBooks,
  reader,
}) {
  const banner = document.querySelector(".banner-search"),
    field = banner.querySelector(".banner-search-field"),
    input = document.querySelector("#book-search"),
    popup = document.querySelector("#book-search-dropdown"),
    list = document.querySelector("#book-search-results"),
    status = document.querySelector("#book-search-status"),
    more = document.querySelector("#book-search-more"),
    empty = document.querySelector("#book-search-empty"),
    panel = document.createElement("dialog"),
    launch = document.createElement("button"),
    select = document.createElement("select"),
    tools = document.createElement("div"),
    end = document.createElement("p"),
    bookSelect = document.createElement("select"),
    filtersPanel = document.createElement("details"),
    chips = document.createElement("div"),
    mobile = window.matchMedia("(max-width: 760px)");
  panel.className = "creator-dialog book-search-panel";
  panel.setAttribute("aria-labelledby", "search-panel-title");
  panel.innerHTML =
    '<div class="dialog-heading search-panel-heading"><h2 id="search-panel-title">Search the books</h2><button type="button" class="quiet" data-close-search aria-label="Close search">Close</button></div><div class="search-panel-controls"></div><div class="search-panel-content"><div class="search-results-pane"></div><div class="search-reader-placeholder"><span class="eyebrow">Book reference</span><h3>Choose a result to read</h3><p>Explore the supplied books without changing your character.</p></div></div>';
  document.body.append(panel);
  launch.type = "button";
  launch.className = "quiet book-search-launcher";
  launch.setAttribute("aria-haspopup", "dialog");
  banner.prepend(launch);
  const headerActions = document.querySelector(".masthead-actions");
  const placeLauncher = () => {
    if (mobile.matches && headerActions) headerActions.prepend(launch);
    else banner.prepend(launch);
  };
  mobile.addEventListener("change", placeLauncher);
  placeLauncher();
  select.id = "book-search-category";
  select.setAttribute("aria-label", "Search category");
  select.innerHTML = '<option value="all">All categories</option>';
  tools.className = "search-result-tools";
  select.title = "Category";
  bookSelect.id = "book-search-book";
  bookSelect.setAttribute("aria-label", "Book");
  tools.append(
    controlLabel("Category", select),
    controlLabel("Book", bookSelect),
  );
  filtersPanel.className = "search-category-filters";
  filtersPanel.innerHTML =
    '<summary>More filters</summary><div class="search-filter-fields"></div>';
  filtersPanel.open = !mobile.matches;
  chips.className = "search-filter-chips";
  chips.setAttribute("aria-label", "Active search filters");
  panel
    .querySelector(".search-panel-controls")
    .append(field, tools, filtersPanel, chips);
  panel.querySelector(".search-results-pane").append(popup);
  popup.prepend(status);
  reader.className = "search-reader";
  reader.hidden = true;
  panel.querySelector(".search-panel-content").append(reader);
  function controlLabel(text, control) {
    const label = document.createElement("label");
    label.append(document.createTextNode(text), control);
    return label;
  }
  end.className = "search-results-end";
  end.hidden = true;
  popup.append(end);
  more.textContent = "Load more results";
  more.setAttribute("aria-label", "Load the next 20 search results");
  let index,
    pending,
    generation = 0,
    open = false,
    category = "all",
    book = "",
    categoryValues = new Map(),
    ranked = [],
    visible = 0,
    active = -1,
    cacheKey,
    returnPosition,
    observer,
    sentinel,
    restoringFocus = false,
    rankingRequest = 0;
  const updateLaunch = () => {
    launch.innerHTML =
      '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span class="search-launch-label"></span>';
    launch.querySelector("span").textContent =
      input.value.trim() || "Search rules and book references…";
    launch.setAttribute(
      "aria-label",
      input.value.trim()
        ? `Search books: ${input.value}`
        : "Search rules and book references",
    );
  };
  const optionId = (i) => `book-search-option-${i}`;
  function options() {
    select.innerHTML = Object.entries(SEARCH_CATEGORIES)
      .filter(
        ([key]) =>
          key === "all" || index.some((row) => searchCategory(row) === key),
      )
      .sort(([a, labelA], [b, labelB]) =>
        a === "all" ? -1 : b === "all" ? 1 : labelA.localeCompare(labelB),
      )
      .map(([key, label]) => `<option value="${key}">${esc(label)}</option>`)
      .join("");
    if (![...select.options].some((option) => option.value === category))
      category = "all";
    select.value = category;
    bookSelect.innerHTML =
      '<option value="">All books</option>' +
      getBooks()
        .filter(
          (b) =>
            b.kind !== "variant" &&
            index.some((row) => row.filterValues.book.includes(b.id)),
        )
        .map(
          (b) =>
            `<option value="${esc(b.id)}">${esc(b.shortTitle || b.title)}</option>`,
        )
        .join("");
    bookSelect.value = book;
    renderCategoryFilters();
  }
  const currentFilters = () => ({
    book,
    ...(categoryValues.get(category) || {}),
  });
  function renderCategoryFilters() {
    const fields = CATEGORY_FILTERS[category] || [];
    const values = categoryValues.get(category) || {};
    filtersPanel.hidden = !fields.length;
    filtersPanel.querySelector(".search-filter-fields").innerHTML = fields
      .map(
        ([key, label]) =>
          `<label>${esc(label)}<select aria-label="${esc(label)}" data-search-filter="${key}"><option value="">All</option>${filterOptionGroups(
            index,
            category,
            key,
          )
            .map(({ label: groupLabel, values: options }) => {
              const html = options
                .map(
                  (value) =>
                    `<option value="${esc(value)}"${values[key] === value ? " selected" : ""}>${esc(CHARACTERISTICS[value] || value)}</option>`,
                )
                .join("");
              return groupLabel
                ? `<optgroup label="${esc(groupLabel)}">${html}</optgroup>`
                : html;
            })
            .join("")}</select></label>`,
      )
      .join("");
    renderChips();
  }
  function renderChips() {
    const values = currentFilters(),
      fields = [["book", "Book"], ...(CATEGORY_FILTERS[category] || [])];
    const activeFilters = fields.filter(([key]) => values[key]);
    chips.hidden = !activeFilters.length;
    chips.innerHTML =
      activeFilters
        .map(([key, label]) => {
          const value = values[key],
            name =
              key === "book"
                ? getBooks().find((b) => b.id === value)?.shortTitle || value
                : CHARACTERISTICS[value] || value;
          return `<button type="button" class="quiet search-filter-chip" data-remove-filter="${key}" aria-label="Remove ${esc(label)} filter: ${esc(name)}">${esc(label)}: ${esc(name)} <span aria-hidden="true">×</span></button>`;
        })
        .join("") +
      (activeFilters.length
        ? '<button type="button" class="text-button" data-clear-filters>Clear filters</button>'
        : "");
    const count = activeFilters.filter(([key]) => key !== "book").length;
    filtersPanel.querySelector("summary").textContent =
      `More filters${count ? ` · ${count} active` : ""}`;
  }
  function changeFilters() {
    returnPosition = null;
    renderChips();
    showResults();
  }
  function syncStatus() {
    status.textContent =
      input.value.trim() || category !== "all" || book
        ? `${ranked.length} match${ranked.length === 1 ? "" : "es"} · ${getScope()}`
        : `Search ${getScope()}, or choose a category to browse.`;
    more.hidden = Boolean(observer) || visible >= ranked.length;
    empty.hidden = !(
      (input.value.trim() || category !== "all" || book) &&
      ranked.length === 0
    );
    end.hidden = !ranked.length || visible < ranked.length;
    end.textContent = "All matching references shown.";
  }
  function appendRows() {
    const start = visible;
    visible = Math.min(visible + BATCH, ranked.length);
    sentinel?.remove();
    list.insertAdjacentHTML(
      "beforeend",
      ranked
        .slice(start, visible)
        .map((row, offset) => {
          const i = start + offset;
          return `<div role="option" id="${optionId(i)}" aria-selected="false" tabindex="-1" data-search-key="${esc(row.key)}">${renderResult(row, input.value, searchLabel(row))}</div>`;
        })
        .join(""),
    );
    sentinel = document.createElement("div");
    sentinel.className = "search-scroll-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    list.append(sentinel);
    observer?.disconnect();
    if (visible < ranked.length) observer?.observe(sentinel);
    syncStatus();
  }
  async function showResults({ restore = false } = {}) {
    if (!index || !open) return;
    const filters = currentFilters();
    const key = JSON.stringify([
      normalizeSearch(input.value),
      category,
      filters,
    ]);
    const request = ++rankingRequest;
    if (key !== cacheKey) {
      // A new request discards the previous cache immediately. Returning to
      // its query while ranking is pending must not reuse an emptied list.
      cacheKey = undefined;
      status.textContent = "Searching book references…";
      more.hidden = true;
      empty.hidden = true;
      end.hidden = true;
      active = -1;
      ranked = [];
      visible = 0;
      input.removeAttribute("aria-activedescendant");
      list.replaceChildren();
      observer?.disconnect();
      const result = await (searchIndex
        ? searchIndex(input.value, category, filters)
        : Promise.resolve(
            searchBooks(index, input.value, Infinity, { category, filters }),
          ));
      if (request !== rankingRequest || !open) return;
      ranked = result.rows;
      cacheKey = key;
      active = -1;
      input.removeAttribute("aria-activedescendant");
      visible = 0;
      list.replaceChildren();
      list.scrollTop = 0;
      appendRows();
    } else syncStatus();
    if (restore && returnPosition?.key === key) {
      while (visible < returnPosition.visible && visible < ranked.length)
        appendRows();
      list.scrollTop = returnPosition.scroll;
      if (returnPosition.active >= 0) activate(returnPosition.active, false);
    }
    if (visible < ranked.length && sentinel) observer?.observe(sentinel);
    updateLaunch();
  }
  async function ensure() {
    if (index) return;
    const version = generation;
    pending ??= Promise.resolve().then(getIndex);
    try {
      const rows = await pending;
      if (version !== generation) return;
      index = rows;
      delete more.dataset.retry;
      more.textContent = "Load more results";
      more.setAttribute("aria-label", "Load the next 20 search results");
      cacheKey = undefined;
      options();
    } catch (error) {
      if (version !== generation) return;
      pending = null;
      status.textContent = error.message || "Could not load references.";
      more.hidden = false;
      more.textContent = "Retry loading references";
      more.setAttribute("aria-label", "Retry loading book references");
      more.dataset.retry = "true";
    }
  }
  function mountPanel() {
    if (!panel.open) panel.showModal();
  }
  function unmountPanel() {
    if (panel.open) panel.close();
  }
  async function show({ restore = false, focus = true } = {}) {
    open = true;
    mountPanel();
    panel.dataset.view = "results";
    popup.hidden = false;
    input.setAttribute("aria-expanded", "true");
    if (focus && document.activeElement !== input)
      input.focus({ preventScroll: true });
    if (!index) status.textContent = "Loading book references…";
    await ensure();
    if (!open) return;
    await showResults({ restore });
  }
  async function loadIndex() {
    await ensure();
    if (!index) {
      open = true;
      mountPanel();
      popup.hidden = false;
      input.setAttribute("aria-expanded", "true");
      input.focus({ preventScroll: true });
    }
    return index;
  }
  function hide({ focus = false } = {}) {
    open = false;
    rankingRequest++;
    observer?.disconnect();
    input.value = "";
    category = "all";
    book = "";
    categoryValues.clear();
    select.value = category;
    bookSelect.value = book;
    cacheKey = undefined;
    returnPosition = null;
    ranked = [];
    visible = 0;
    active = -1;
    list.replaceChildren();
    list.scrollTop = 0;
    sentinel = null;
    reader.hidden = true;
    panel.querySelector(".search-reader-placeholder").hidden = false;
    panel.dataset.view = "results";
    filtersPanel.open = !mobile.matches;
    renderCategoryFilters();
    syncStatus();
    onClose?.();
    popup.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    restoringFocus = true;
    unmountPanel();
    restoringFocus = false;
    updateLaunch();
    if (focus) {
      restoringFocus = true;
      launch.focus({ preventScroll: true });
      restoringFocus = false;
    }
  }
  function activate(n, scroll = true) {
    if (!ranked.length) return;
    n = Math.max(0, Math.min(n, ranked.length - 1));
    while (n >= visible) appendRows();
    active = n;
    for (const [i, node] of [
      ...list.querySelectorAll("[role=option]"),
    ].entries())
      node.setAttribute("aria-selected", String(i === active));
    input.setAttribute("aria-activedescendant", optionId(active));
    if (scroll)
      document
        .getElementById(optionId(active))
        ?.scrollIntoView({ block: "nearest" });
  }
  function choose(key) {
    returnPosition = { key: cacheKey, visible, active, scroll: list.scrollTop };
    const n = ranked.findIndex((row) => row.key === key);
    if (n >= 0) activate(n, false);
    input.blur();
    onOpen(key);
  }
  if ("IntersectionObserver" in window)
    observer = new window.IntersectionObserver(
      (entries) => {
        if (
          open &&
          entries.some((entry) => entry.isIntersecting) &&
          visible < ranked.length
        )
          appendRows();
      },
      { root: list, rootMargin: "0px 0px 120px 0px" },
    );
  input.addEventListener("input", () => {
    returnPosition = null;
    show({ focus: false });
  });
  input.addEventListener("focus", () => {
    if (!open && !restoringFocus) show({ focus: false });
  });
  input.addEventListener("click", () => {
    if (!open) show({ focus: false });
  });
  input.addEventListener("keydown", (event) => {
    if (event.isComposing) return;
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      if (!open) show({ focus: false });
      activate(
        event.key === "ArrowDown"
          ? active + 1
          : active < 0
            ? visible - 1
            : active - 1,
      );
    } else if (event.key === "Enter" && open && ranked.length) {
      event.preventDefault();
      choose(ranked[Math.max(0, active)].key);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      hide({ focus: true });
    }
  });
  select.addEventListener("change", () => {
    category = select.value;
    returnPosition = null;
    renderCategoryFilters();
    showResults();
  });
  bookSelect.addEventListener("change", () => {
    book = bookSelect.value;
    changeFilters();
  });
  filtersPanel.addEventListener("change", (event) => {
    const key = event.target.dataset.searchFilter;
    if (!key) return;
    categoryValues.set(category, {
      ...categoryValues.get(category),
      [key]: event.target.value,
    });
    changeFilters();
  });
  chips.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-filter]"),
      clear = event.target.closest("[data-clear-filters]");
    if (!remove && !clear) return;
    if (clear) {
      book = "";
      categoryValues.set(category, {});
    } else if (remove.dataset.removeFilter === "book") book = "";
    else
      categoryValues.set(category, {
        ...categoryValues.get(category),
        [remove.dataset.removeFilter]: "",
      });
    bookSelect.value = book;
    renderCategoryFilters();
    changeFilters();
    input.focus({ preventScroll: true });
  });
  field.addEventListener("click", (event) => {
    if (!event.target.closest("input,button")) input.focus();
  });
  document.querySelector("#book-search-clear").addEventListener("click", () => {
    input.value = "";
    returnPosition = null;
    show();
  });
  more.addEventListener("click", async () => {
    if (more.dataset.retry) {
      delete more.dataset.retry;
      more.textContent = "Load more results";
      await show();
    } else appendRows();
  });
  popup.addEventListener("mousedown", (event) => {
    if (event.button === 0 && event.target.closest("[data-search-key]"))
      event.preventDefault();
  });
  list.addEventListener("click", (event) => {
    const row = event.target.closest("[data-search-key]");
    if (row) choose(row.dataset.searchKey);
  });
  launch.addEventListener("click", () => show({ restore: true }));
  panel
    .querySelector("[data-close-search]")
    .addEventListener("click", () => hide({ focus: true }));
  panel.addEventListener("cancel", (event) => {
    event.preventDefault();
    hide({ focus: true });
  });
  mobile.addEventListener("change", () => {
    filtersPanel.open = !mobile.matches;
    fitViewport();
  });
  const fitViewport = () => {
    const viewport = window.visualViewport;
    if (viewport && panel.open && mobile.matches) {
      panel.style.height = `${viewport.height}px`;
      panel.style.top = `${viewport.offsetTop}px`;
    } else {
      panel.style.removeProperty("height");
      panel.style.removeProperty("top");
    }
  };
  window.visualViewport?.addEventListener("resize", fitViewport);
  window.visualViewport?.addEventListener("scroll", fitViewport);
  panel.addEventListener("focusin", fitViewport);
  updateLaunch();
  input.disabled = false;
  input.removeAttribute("aria-busy");
  return {
    invalidate() {
      generation++;
      pending = null;
      index = null;
      cacheKey = undefined;
      ranked = [];
      visible = 0;
      returnPosition = null;
      category = "all";
      book = "";
      categoryValues.clear();
      hide();
      list.replaceChildren();
    },
    restore: () => show({ restore: true }),
    showReader() {
      open = true;
      mountPanel();
      popup.hidden = false;
      reader.hidden = false;
      panel.querySelector(".search-reader-placeholder").hidden = true;
      panel.dataset.view = "reference";
      input.setAttribute("aria-expanded", "true");
      reader.scrollTop = 0;
      reader.querySelector("h2").focus({ preventScroll: true });
    },
    dismiss: () => hide({ focus: true }),
    refresh() {
      if (open) show({ focus: false });
    },
    loadIndex,
    async openEntry(id) {
      await loadIndex();
      const row = index?.find((x) => x.entry.contentId === id);
      if (row) choose(row.key);
    },
  };
}
