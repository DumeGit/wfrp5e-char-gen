import { searchBooks, normalizeSearch } from "./book-search.mjs";
import { SEARCH_CATEGORIES, searchLabel } from "./search-presentation.mjs";

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
// replaced; on phones it moves into a native modal rather than cloning a field.
export function createSearchController({
  getIndex,
  getScope,
  onOpen,
  renderResult,
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
    mobile = window.matchMedia("(max-width: 760px)");
  panel.className = "creator-dialog book-search-panel";
  panel.setAttribute("aria-labelledby", "search-panel-title");
  panel.innerHTML =
    '<div class="dialog-heading"><h2 id="search-panel-title">Search the books</h2><button type="button" class="quiet" data-close-search aria-label="Close search">Close</button></div><div class="search-panel-content"></div>';
  document.body.append(panel);
  launch.type = "button";
  launch.className = "quiet book-search-launcher";
  launch.setAttribute("aria-haspopup", "dialog");
  banner.prepend(launch);
  select.id = "book-search-category";
  select.setAttribute("aria-label", "Search category");
  select.innerHTML = '<option value="all">All categories</option>';
  tools.className = "search-result-tools";
  tools.append(select, status);
  popup.prepend(tools);
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
    ranked = [],
    visible = 0,
    active = -1,
    cacheKey,
    returnPosition,
    observer,
    sentinel,
    restoringFocus = false;
  const updateLaunch = () => {
    launch.textContent = `⌕  ${input.value.trim() || "Search rules and book references…"}`;
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
      .filter(([key]) => key === "all" || index.some((row) => row.kind === key))
      .map(([key, label]) => `<option value="${key}">${esc(label)}</option>`)
      .join("");
    if (![...select.options].some((option) => option.value === category))
      category = "all";
    select.value = category;
  }
  function syncStatus() {
    status.textContent =
      input.value.trim() || category !== "all"
        ? `${ranked.length} match${ranked.length === 1 ? "" : "es"} · ${getScope()}`
        : `Search ${getScope()}, or choose a category to browse.`;
    more.hidden = Boolean(observer) || visible >= ranked.length;
    empty.hidden = !(input.value.trim() && ranked.length === 0);
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
  function showResults({ restore = false } = {}) {
    if (!index || !open) return;
    const key = normalizeSearch(input.value) + "\0" + category;
    if (key !== cacheKey) {
      ranked = searchBooks(index, input.value, Infinity, { category }).rows;
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
    if (!mobile.matches || panel.open) return;
    panel.querySelector(".search-panel-content").append(field, popup);
    panel.showModal();
  }
  function unmountPanel() {
    if (panel.open) panel.close();
    if (field.parentElement !== banner) banner.append(field, popup);
  }
  async function show({ restore = false, focus = true } = {}) {
    open = true;
    mountPanel();
    popup.hidden = false;
    input.setAttribute("aria-expanded", "true");
    if (focus && document.activeElement !== input)
      input.focus({ preventScroll: true });
    if (!index) status.textContent = "Loading book references…";
    await ensure();
    if (!open) return;
    showResults({ restore });
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
  function hide({ remember = false, focus = false } = {}) {
    if (remember)
      returnPosition = {
        key: cacheKey,
        visible,
        active,
        scroll: list.scrollTop,
      };
    open = false;
    observer?.disconnect();
    popup.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    restoringFocus = true;
    unmountPanel();
    restoringFocus = false;
    updateLaunch();
    if (focus) {
      restoringFocus = true;
      (mobile.matches ? launch : input).focus({ preventScroll: true });
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
    hide({ remember: true });
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
    showResults();
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
  document.addEventListener("pointerdown", (event) => {
    if (open && !mobile.matches && !banner.contains(event.target)) hide();
  });
  banner.addEventListener("focusout", (event) => {
    if (
      !mobile.matches &&
      open &&
      event.relatedTarget &&
      !banner.contains(event.relatedTarget)
    )
      hide();
  });
  mobile.addEventListener("change", () => {
    if (open) {
      if (mobile.matches) mountPanel();
      else unmountPanel();
    }
  });
  const fitViewport = () => {
    const viewport = window.visualViewport;
    if (viewport && panel.open) {
      panel.style.height = `${viewport.height}px`;
      panel.style.top = `${viewport.offsetTop}px`;
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
      hide();
      list.replaceChildren();
    },
    restore: () => show({ restore: true }),
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
