import { normalizeSearch } from "./book-search.mjs";
import { esc } from "./workspace.mjs";
import { characteristicNames } from "./ui.mjs";
import { searchBookText } from "./book-search-text.mjs";
import { createReferenceLinker } from "./book-search-links.mjs";
import { createSearchController } from "./search-controller.mjs";
import { loadReferenceLibrary } from "./search-library.mjs";
import { referenceBodyHTML } from "./reference-body.mjs";
import {
  searchLabel,
  linkReferenceNodes,
  referenceSnippetText,
} from "./search-presentation.mjs";
import { createSearchEngine } from "./search-engine.mjs";

export function createReferenceSearch(library) {
  const input = document.querySelector("#book-search"),
    box = document.querySelector("#book-search-dialog"),
    body = document.querySelector("#book-search-body");
  const previous = document.createElement("button"),
    hover = document.createElement("aside");
  previous.type = "button";
  previous.className = "quiet search-chain-back";
  previous.hidden = true;
  previous.textContent = "← Back";
  previous.setAttribute("aria-label", "Back to previous reference");
  box.querySelector(".dialog-heading").prepend(previous);
  const resultsBack = document.createElement("button");
  resultsBack.type = "button";
  resultsBack.className = "quiet search-return-to-results";
  resultsBack.dataset.searchBack = "";
  resultsBack.textContent = "← Results";
  resultsBack.setAttribute("aria-label", "Back to search results");
  box.querySelector(".dialog-heading").prepend(resultsBack);
  hover.className = "search-term-preview";
  hover.id = "search-term-preview";
  hover.setAttribute("role", "tooltip");
  hover.hidden = true;
  box.append(hover);
  let index = [],
    books = [],
    linkText,
    currentView,
    history = [],
    previewTarget,
    engine;
  const controller = createSearchController({
    async getIndex() {
      const payload = await loadReferenceLibrary(library, undefined, {
        normalize: false,
      });
      index = payload.rows;
      books = payload.books;
      linkText = createReferenceLinker(index);
      engine?.dispose();
      engine = createSearchEngine(index);
      return index;
    },
    searchIndex: (query, category, filters) =>
      engine.search(query, category, filters),
    getBooks: () => books,
    reader: box,
    getScope: () => "all supplied books",
    onOpen: (key) => openRule(key),
    renderResult(row) {
      return `<span class="book-search-result-name"><strong>${highlight(row.name)}</strong><span class="search-kind">${esc(searchLabel(row))}</span></span><span class="book-search-result-source">${esc(sourceText(row))}${legacyTag(row) ? " · Legacy" : ""}</span><span class="book-search-excerpt">${highlight(snippet(row))}</span>`;
    },
  });
  function refresh() {
    controller.refresh();
  }
  function legacyTag(row) {
    if (!row.legacy.length) return "";
    const explanation = row.legacy
      .map(
        (s) =>
          `${books.find((b) => b.id === s.book)?.shortTitle || s.book}${s.page ? ` p. ${s.page}` : ""}: ${s.adaptation}`,
      )
      .join("\n\n");
    return `<button type="button" class="legacy-tag" data-reference-info="${esc(explanation)}" aria-label="Explain Legacy adaptation">Legacy</button>`;
  }
  function ref(row) {
    return `<button type="button" class="source source-button book-reference" data-reference-source="${esc(row.entry.source.book)}" data-reference-page="${esc(row.entry.source.page)}">${esc(sourceText(row))}</button>${legacyTag(row)}`;
  }
  const info = document.createElement("dialog");
  info.className = "book-search-dialog";
  info.setAttribute("aria-label", "Reference information");
  document.body.append(info);
  info.addEventListener("click", (e) => {
    if (e.target.closest("[data-info-close]")) info.close();
  });
  function showInfo(title, text) {
    info.innerHTML = `<div class="dialog-heading"><h2>${esc(title)}</h2><button type="button" class="quiet" data-info-close>Close</button></div><p>${esc(text).replaceAll("\n", "<br>")}</p>`;
    info.showModal();
  }
  function highlight(text) {
    const words = input.value.trim().split(/\s+/).filter(Boolean);
    const pattern = words
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    if (!pattern) return esc(text);
    return String(text)
      .split(new RegExp(`(${pattern})`, "ig"))
      .map((p, i) => (i % 2 ? `<mark>${esc(p)}</mark>` : esc(p)))
      .join("");
  }
  function snippet(row) {
    let text =
      row.excerpt ||
      (row.printedReference ? row.entry.text : "") ||
      searchBookText(row.entry).text ||
      row.entry.class ||
      row.entry.category ||
      (row.kind === "skill"
        ? `${row.entry.advanced ? "Advanced" : "Basic"} · ${characteristicNames[row.entry.char]}`
        : "");
    if (row.printedReference) text = referenceSnippetText(text);
    const query = normalizeSearch(input.value).split(" ")[0];
    const at = text.toLowerCase().indexOf(query),
      start = at > 70 ? at - 35 : 0;
    return `${start ? "…" : ""}${text.slice(start, start + 130)}${text.length > start + 130 ? "…" : ""}`;
  }
  function sourceText(row) {
    const b = books.find((b) => b.id === row.entry.source.book);
    return `${b?.shortTitle || b?.title || "Core"} · p. ${row.entry.source.page}${row.printedReference && b.edition === 4 ? " · Fourth Edition" : ""}`;
  }
  function renderRule(key) {
    const row = index.find((x) => x.key === key);
    if (!row) return;
    document.querySelector("#book-search-title").textContent = row.name;
    const printedWarning =
      row.printedReference &&
      books.find((b) => b.id === row.entry.source.book)?.edition === 4
        ? '<p class="notice"><strong>Fourth Edition source.</strong> This reference preserves its printed mechanics; no Fifth Edition conversion is implied. References to its core rulebook pages refer to Fourth Edition.</p>'
        : "";
    body.innerHTML = `<p class="search-rule-source"><span class="search-kind">${esc(searchLabel(row))}</span> ${ref(row)}</p>${printedWarning}<div class="search-book-reference">${referenceBodyHTML(row)}</div><div class="search-rule-actions"><button type="button" class="text-button" data-search-back>Back to search</button></div>`;
    linkReferences(row);
  }
  function linkReferences(row) {
    linkReferenceNodes(
      body.querySelector(".search-book-reference"),
      linkText,
      row,
      "referenceKeys",
    );
  }
  function showView(view, { push = false, reset = false } = {}) {
    hidePreview();
    if (reset) history = [];
    if (push && currentView)
      history.push({ view: currentView, scroll: box.scrollTop });
    currentView = view;
    previous.hidden = !history.length;
    if (view.key) renderRule(view.key);
    else {
      document.querySelector("#book-search-title").textContent = view.name;
      body.innerHTML = `<p>Several book references share this name. Choose which to read.</p><div class="search-reference-choices">${view.keys
        .map((key) => {
          const row = index.find((x) => x.key === key);
          return `<div><button type="button" class="quiet" data-reference-choice="${esc(key)}">${esc(row.name)} · ${esc(searchLabel(row))}</button> ${ref(row)}</div>`;
        })
        .join("")}</div>`;
    }

    controller.showReader();
    if (push) previous.focus({ preventScroll: true });
  }
  function openRule(key) {
    showView({ key }, { reset: true });
  }
  function hidePreview() {
    previewTarget?.removeAttribute("aria-describedby");
    previewTarget = null;
    hover.hidden = true;
  }
  function showPreview(button) {
    if (button === previewTarget) return;
    hidePreview();
    const keys = JSON.parse(button.dataset.referenceKeys),
      rows = keys.map((key) => index.find((x) => x.key === key));
    hover.innerHTML = `<strong>${esc(button.textContent)}${rows.length === 1 && rows[0].name !== button.textContent ? ` → ${esc(rows[0].name)}` : ""}</strong><p>${rows.map((row) => `${esc(searchLabel(row))} · ${esc(sourceText(row))}${legacyTag(row) ? " · Legacy" : ""}`).join("<br>")}</p>${rows.length === 1 ? `<p>${esc(searchBookText(rows[0].entry).text.slice(0, 240) || "Open to view its profile and source.")}</p>` : ""}<small>Click to read the full reference</small>`;
    previewTarget = button;
    button.setAttribute("aria-describedby", hover.id);
    hover.hidden = false;
    const rect = button.getBoundingClientRect(),
      bounds = hover.getBoundingClientRect();
    hover.style.left = `${Math.max(10, Math.min(rect.left, window.innerWidth - bounds.width - 10))}px`;
    hover.style.top = `${rect.bottom + bounds.height + 12 < window.innerHeight ? rect.bottom + 8 : Math.max(10, rect.top - bounds.height - 8)}px`;
  }
  box.addEventListener("click", (e) => {
    const term = e.target.closest("[data-reference-keys]");
    if (term) {
      const keys = JSON.parse(term.dataset.referenceKeys);
      showView(
        keys.length === 1 ? { key: keys[0] } : { keys, name: term.textContent },
        { push: true },
      );
      return;
    }
    const choice = e.target.closest("[data-reference-choice]");
    if (choice) {
      showView({ key: choice.dataset.referenceChoice }, { push: true });
      return;
    }
    if (e.target.closest("[data-search-close], [data-search-back]")) {
      hidePreview();
      if (e.target.closest("[data-search-back]")) controller.restore();
      else controller.dismiss();
      return;
    }
    const explanation = e.target.closest("[data-reference-info]");
    if (explanation)
      showInfo("Legacy adaptation", explanation.dataset.referenceInfo);
    const source = e.target.closest("[data-reference-source]");
    if (source) {
      const book = books.find((b) => b.id === source.dataset.referenceSource);
      showInfo(
        book.title,
        `Printed page ${source.dataset.referencePage}\n${book.edition}th Edition · content pack ${book.version}\nReading this reference does not enable the book's rules for character creation.`,
      );
    }
  });
  box.closest("dialog").addEventListener("close", hidePreview);
  previous.addEventListener("click", () => {
    if (history.length) {
      const { view, scroll } = history.pop();
      showView(view);
      box.scrollTop = scroll;
    }
    if (history.length) previous.focus({ preventScroll: true });
    else box.querySelector("#book-search-title").focus({ preventScroll: true });
  });
  body.addEventListener("pointerover", (e) => {
    const button = e.target.closest("[data-reference-keys]");
    if (button && e.pointerType !== "touch") showPreview(button);
  });
  body.addEventListener("pointerout", (e) => {
    if (previewTarget && !previewTarget.contains(e.relatedTarget))
      hidePreview();
  });
  body.addEventListener("focusin", (e) => {
    const button = e.target.closest("[data-reference-keys]");
    if (button) showPreview(button);
  });
  body.addEventListener("focusout", hidePreview);
  box.addEventListener("scroll", hidePreview);
  return {
    refresh,
    openEntry: (id) => controller.openEntry(id),
    async open(kind, name) {
      if (!index.length && !(await controller.loadIndex())) return;
      const exact = index.filter(
        (row) =>
          row.kind === kind &&
          normalizeSearch(row.name) === normalizeSearch(name),
      );
      const matches = exact.length
        ? exact
        : index.filter(
            (row) =>
              row.kind === kind &&
              normalizeSearch(row.name.split(" (")[0]) ===
                normalizeSearch(name.split(" (")[0]),
          );
      if (matches.length === 1) openRule(matches[0].key);
      else if (matches.length)
        showView(
          { keys: matches.map((row) => row.key), name },
          { reset: true },
        );
    },
    get index() {
      return index;
    },
  };
}
