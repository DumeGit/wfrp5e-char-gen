import {
  buildSearchIndex,
  searchBooks,
  normalizeSearch,
} from "../book-search.mjs";
import { createReferenceLinker } from "../book-search-links.mjs";
import { base } from "../rules.mjs";
import { esc } from "./controls.mjs";
import { statBlock } from "./sheet.mjs";
import { freshGM, calculateGM } from "./model.mjs";
export function createGMReferences(data, R) {
  const input = document.querySelector("#book-search"),
    popup = document.querySelector("#book-search-dropdown"),
    list = document.querySelector("#book-search-results"),
    status = document.querySelector("#book-search-status"),
    dialog = document.querySelector("#book-search-dialog"),
    body = document.querySelector("#book-search-body"),
    title = document.querySelector("#book-search-title");
  const index = buildSearchIndex(R),
    extra = (kind, x) => ({
      kind,
      key: x.id,
      name: x.name,
      entry: { ...x, source: { book: "core", page: x.page } },
      normalizedName: normalizeSearch(x.name),
      normalizedAliases: [],
      searchable: normalizeSearch(
        `${x.name} ${x.text || ""} ${x.category || ""}`,
      ),
      textFields: [x.text || x.category || ""],
    });
  index.push(
    ...data.profiles.map((x) => extra("profile", x)),
    ...data.templates.map((x) => extra("template", x)),
    ...data.traits.map((x) => extra("trait", x)),
    ...data.mutations.map((x) => extra("mutation", x)),
  );
  const linker = createReferenceLinker(index),
    history = [];
  const preview = document.createElement("aside");
  preview.id = "gm-search-term-preview";
  preview.className = "search-term-preview";
  preview.setAttribute("role", "tooltip");
  preview.hidden = true;
  dialog.append(preview);
  let current = null,
    matches = [],
    active = -1,
    limit = 8;
  let previewTarget;
  function hidePreview() {
    previewTarget?.removeAttribute("aria-describedby");
    previewTarget = null;
    preview.hidden = true;
  }
  function showPreview(target) {
    if (!target || target === previewTarget) return;
    hidePreview();
    const rows = JSON.parse(target.dataset.related)
      .map((key) => index.find((row) => row.key === key))
      .filter(Boolean);
    preview.innerHTML = `<strong>${esc(target.textContent)}</strong><p>${rows.map((row) => `${esc(row.kind)} · Core p. ${row.entry.source.page}`).join("<br>")}</p>${rows.length === 1 ? `<p>${esc(rows[0].entry.text?.slice(0, 240) || "Open to view its profile and source.")}</p>` : ""}<small>Click or tap for the full reference</small>`;
    previewTarget = target;
    target.setAttribute("aria-describedby", preview.id);
    preview.hidden = false;
    const rect = target.getBoundingClientRect(),
      bounds = preview.getBoundingClientRect();
    preview.style.left = `${Math.max(10, Math.min(rect.left, window.innerWidth - bounds.width - 10))}px`;
    preview.style.top = `${rect.bottom + bounds.height + 12 < window.innerHeight ? rect.bottom + 8 : Math.max(10, rect.top - bounds.height - 8)}px`;
  }
  const hide = () => {
    popup.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    active = -1;
  };
  const show = () => {
    const found = searchBooks(index, input.value, limit);
    matches = found.rows;
    status.textContent = `${found.total} core references`;
    list.innerHTML = matches
      .map(
        (x, i) =>
          `<button type="button" role="option" id="gm-search-result-${i}" aria-selected="false" data-rule="${esc(x.key)}"><strong>${esc(x.name)}</strong><span class="search-kind">${esc(x.kind)}</span><small>Core · p. ${x.entry.source.page}</small></button>`,
      )
      .join("");
    popup.hidden = !input.value.trim();
    input.setAttribute("aria-expanded", String(!popup.hidden));
    document.querySelector("#book-search-empty").hidden = !!matches.length;
    document.querySelector("#book-search-more").hidden =
      found.total <= matches.length;
    active = -1;
  };
  function link(text, row) {
    return linker(text, row)
      .map((s) =>
        s.keys
          ? `<button class="search-term-link" type="button" data-related="${esc(JSON.stringify(s.keys))}">${esc(s.text)}</button>`
          : esc(s.text),
      )
      .join("");
  }
  function openKey(key, push = false, keepHistory = false) {
    const row = index.find((x) => x.key === key);
    if (!row) return;
    hidePreview();
    if (push && current) history.push(current);
    else if (!push && !keepHistory) history.length = 0;
    current = key;
    hide();
    title.textContent = row.name;
    const x = row.entry;
    let content = "";
    if (row.kind === "profile") {
      const s = freshGM(data, x.id);
      content = statBlock(calculateGM(data, R, s), s);
    } else if (row.kind === "career")
      content = x.levels
        .map(
          (l, i) =>
            `<h3>${i + 1}. ${esc(l.name)}</h3><p>Skills: ${link(l.skills.join(", "), row)}</p><p>Talents: ${link(l.talents.join(", "), row)}</p><p>Trappings: ${link(l.trappings.join(", "), row)}</p>`,
        )
        .join("");
    else {
      const fields = [
        "char",
        "advanced",
        "category",
        "cn",
        "range",
        "target",
        "duration",
        "damage",
        "reach",
        "group",
        "ap",
        "locations",
        "qualities",
        "enc",
        "parameter",
      ].filter((k) => x[k] !== undefined && x[k] !== null);
      content = `<p class="gm-reference-metadata">${fields.map((k) => `${esc(k.toUpperCase())}: ${esc(x[k])}`).join(" · ")}</p><p>${link(x.text || "The full description is not imported. Consult this page of the supplied core book.", row)}</p>`;
    }
    body.innerHTML = `<p class="search-rule-source"><span class="search-kind">${esc(row.kind)}</span> Core · p. ${x.source.page}</p>${content}<div class="gm-dialog-actions">${history.length ? '<button class="quiet" type="button" data-rule-back>← Previous reference</button>' : ""}<button class="quiet" type="button" data-search-back>Back to search</button></div>`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  const activate = (n) => {
    if (!matches.length) return;
    active = (n + matches.length) % matches.length;
    list
      .querySelectorAll("[role=option]")
      .forEach((node, i) =>
        node.setAttribute("aria-selected", String(i === active)),
      );
    input.setAttribute("aria-activedescendant", `gm-search-result-${active}`);
    document
      .getElementById(`gm-search-result-${active}`)
      .scrollIntoView({ block: "nearest" });
  };
  input.addEventListener("input", () => {
    limit = 8;
    show();
  });
  input.addEventListener("focus", show);
  input.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      if (popup.hidden) show();
      activate(active + (e.key === "ArrowDown" ? 1 : -1));
    }
    if (e.key === "Enter" && matches.length && !popup.hidden) {
      e.preventDefault();
      openKey(matches[Math.max(0, active)].key);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      hide();
    }
  });
  document
    .querySelector(".banner-search-field")
    .addEventListener("click", (e) => {
      if (!e.target.closest("button")) input.focus();
    });
  list.addEventListener("mousedown", (e) => e.preventDefault());
  list.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rule]");
    if (b) openKey(b.dataset.rule);
  });
  document.querySelector("#book-search-clear").addEventListener("click", () => {
    input.value = "";
    input.focus();
    show();
  });
  document.querySelector("#book-search-more").addEventListener("click", () => {
    limit += 8;
    show();
    input.focus({ preventScroll: true });
  });
  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".banner-search")) hide();
  });
  document.querySelector(".banner-search").addEventListener("focusout", (e) => {
    if (!e.relatedTarget?.closest(".banner-search")) hide();
  });
  dialog.addEventListener("click", (e) => {
    hidePreview();
    const related = e.target.closest("[data-related]"),
      choice = e.target.closest("[data-rule]");
    if (related) {
      const keys = JSON.parse(related.dataset.related);
      if (keys.length === 1) openKey(keys[0], true);
      else {
        body.innerHTML = `<p>Choose a core reference:</p>${keys
          .map((k) => {
            const row = index.find((x) => x.key === k);
            return `<p><button type="button" class="quiet" data-rule="${esc(k)}">${esc(row.name)} · ${row.kind} · p. ${row.entry.source.page}</button></p>`;
          })
          .join("")}`;
      }
      return;
    }
    if (choice) {
      openKey(choice.dataset.rule, true);
      return;
    }
    if (e.target.closest("[data-rule-back]")) {
      openKey(history.pop(), false, true);
      return;
    }
    if (e.target.closest("[data-search-close],[data-search-back]")) {
      dialog.close();
      input.focus({ preventScroll: true });
      if (e.target.closest("[data-search-back]")) show();
    }
  });
  body.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "touch")
      showPreview(e.target.closest("[data-related]"));
  });
  body.addEventListener("pointerout", (e) => {
    if (previewTarget && !previewTarget.contains(e.relatedTarget))
      hidePreview();
  });
  body.addEventListener("focusin", (e) =>
    showPreview(e.target.closest("[data-related]")),
  );
  body.addEventListener("focusout", hidePreview);
  dialog.addEventListener("scroll", hidePreview);
  dialog.addEventListener("close", hidePreview);
  return {
    open: (kind, name) => {
      const row =
        index.find((x) => x.kind === kind && x.name === name) ||
        index.find((x) => x.kind === kind && base(x.name) === base(name));
      if (row) openKey(row.key);
    },
    index,
  };
}
