import {
  buildSearchIndex,
  searchBooks,
  searchContext,
  normalizeSearch,
} from "../book-search.mjs";
import { esc } from "../workspace.mjs";
import { legacyTag } from "../legacy.mjs";
import { legacyOption, legacyGear, legacyMagic } from "../legacy-character.mjs";
import { characteristicNames } from "../ui.mjs";
import { searchBookText } from "../book-search-text.mjs";
import { createReferenceLinker } from "../book-search-links.mjs";

const labels = {
  career: "Career",
  skill: "Skill",
  talent: "Talent",
  magic: "Magic",
  equipment: "Equipment",
  creature: "Creature / NPC",
  template: "NPC template",
  trait: "Creature Trait",
  mutation: "Mutation",
};
export function createBookSearch(getContext, setContext) {
  const input = document.querySelector("#book-search"),
    popup = document.querySelector("#book-search-dropdown"),
    list = document.querySelector("#book-search-results"),
    status = document.querySelector("#book-search-status"),
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
  hover.className = "search-term-preview";
  hover.id = "search-term-preview";
  hover.setAttribute("role", "tooltip");
  hover.hidden = true;
  box.append(hover);
  let catalogue,
    index = [],
    matches = [],
    active = -1,
    limit = 8,
    selected,
    currentActions = [],
    linkText,
    currentView,
    history = [],
    previewTarget;
  function refresh() {
    const { R } = getContext();
    if (catalogue !== R) {
      catalogue = R;
      index = buildSearchIndex(R);
      linkText = createReferenceLinker(index);
      selected = null;
      currentView = null;
      history = [];
      if (box.open) box.close();
      limit = 8;
    }
    if (document.activeElement === input || !popup.hidden) showResults();
  }
  function closeResults() {
    popup.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    active = -1;
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
    const text =
      row.excerpt ||
      searchBookText(row.entry).text ||
      row.entry.class ||
      row.entry.category ||
      (row.kind === "skill"
        ? `${row.entry.advanced ? "Advanced" : "Basic"} · ${characteristicNames[row.entry.char]}`
        : "");
    const query = normalizeSearch(input.value).split(" ")[0];
    const at = text.toLowerCase().indexOf(query),
      start = at > 70 ? at - 35 : 0;
    return `${start ? "…" : ""}${text.slice(start, start + 130)}${text.length > start + 130 ? "…" : ""}`;
  }
  function showResults() {
    const { R } = getContext(),
      found = searchBooks(index, input.value, limit);
    matches = found.rows;
    active = -1;
    input.removeAttribute("aria-activedescendant");
    popup.hidden = false;
    input.setAttribute("aria-expanded", "true");
    status.textContent = input.value.trim()
      ? `${found.total} match${found.total === 1 ? "" : "es"} in selected books`
      : "Search your selected books. Opening a rule keeps your character unchanged.";
    list.innerHTML = matches
      .map(
        (r, i) =>
          `<div role="option" id="book-search-option-${i}" aria-selected="false" data-search-key="${esc(r.key)}" tabindex="-1"><span class="book-search-result-name"><strong>${highlight(r.name)}</strong><span class="search-kind">${esc(r.label || labels[r.kind])}</span></span><span class="book-search-result-source">${esc(sourceText(R, r))}${legacyTag(R, r.entry) ? " · Legacy" : ""}</span>${r.aliases.some((a) => normalizeSearch(a).includes(normalizeSearch(input.value))) ? `<span class="book-search-excerpt">Also indexed as ${highlight(r.aliases.join(", "))}</span>` : `<span class="book-search-excerpt">${highlight(snippet(r))}</span>`}</div>`,
      )
      .join("");
    document.querySelector("#book-search-more").hidden = found.total <= limit;
    document.querySelector("#book-search-empty").hidden = !(
      input.value.trim() && !found.total
    );
  }
  function sourceText(R, r) {
    const b = R.books.find((b) => b.id === r.entry.source.book);
    return `${b?.shortTitle || b?.title || "Core"} · p. ${r.entry.source.page}`;
  }
  function selectActive(n) {
    if (!matches.length) return;
    active = Math.max(0, Math.min(n, matches.length - 1));
    list
      .querySelectorAll('[role="option"]')
      .forEach((el, i) =>
        el.setAttribute("aria-selected", String(i === active)),
      );
    input.setAttribute("aria-activedescendant", `book-search-option-${active}`);
    document
      .getElementById(`book-search-option-${active}`)
      .scrollIntoView({ block: "nearest" });
  }
  function referenceBody(row) {
    const { ref, spellDetailsBody, talentDetailsBody } = getContext(),
      x = { ...row.entry, text: searchBookText(row.entry).text };
    if (row.kind === "career") {
      const c = x;
      return `<p>${esc(c.class)} · ${esc(c.species?.join(", ") || "See Career availability")}</p>${c.text ? `<p>${esc(c.text)}</p>` : ""}<p><strong>Characteristics:</strong> ${Object.entries(
        c.advanceScheme,
      )
        .filter(([, v]) => v)
        .map(([k, v]) => `${esc(characteristicNames[k])} (L${v})`)
        .join(
          ", ",
        )}</p>${c.levels.map((l, i) => `<section class="search-career-level"><h3>${i + 1}. ${esc(l.name)} <small>${esc(l.status)} ${esc(l.standing)}</small></h3><p><strong>Skills:</strong> ${esc(l.skills.join(", "))}</p><p><strong>Talents:</strong> ${esc(l.talents.join(", "))}</p><p><strong>Trappings:</strong> ${esc(l.trappings.join(", "))}</p></section>`).join("")}`;
    }
    if (row.kind === "talent")
      return talentDetailsBody(row.name, { text: x.text, includeNotes: false });
    if (row.kind === "skill")
      return `<p><strong>${x.advanced ? "Advanced" : "Basic"} Skill</strong> · ${esc(characteristicNames[x.char])}${x.grouped ? " · Grouped" : ""}</p>${x.text ? `<p>${esc(x.text)}</p>` : '<p class="small muted">The full Skill description is not included in the imported catalogue. Consult the book/page above for its complete rule.</p>'}${x.options?.length ? `<p><strong>Printed specialisations:</strong> ${esc(x.options.join(", "))}</p>` : ""}`;
    if (row.kind === "magic")
      return `${spellDetailsBody({ ...x, text: x.text || "See the supplied book for the full profile." }, { includeCreatorNote: false })}${x.lore || x.form || x.category ? `<p><strong>Tradition / type:</strong> ${esc(x.lore || x.form || x.category)}</p>` : ""}`;
    if (row.kind === "creature")
      return `<p>${esc(x.category)} · ${esc(x.size)}</p><table><thead><tr>${Object.keys(
        x.stats,
      )
        .map((k) => `<th>${esc(k)}</th>`)
        .join("")}</tr></thead><tbody><tr>${Object.values(x.stats)
        .map((v) => `<td>${v ?? "—"}</td>`)
        .join("")}</tr></tbody></table>${Object.entries(x.sections)
        .map(
          ([name, text]) =>
            `<section><h3>${esc(name)}</h3><p>${esc(text)}</p></section>`,
        )
        .join("")}`;
    if (["template", "trait", "mutation"].includes(row.kind))
      return `<p>${esc(x.text)}</p>`;
    return row.facets
      .map((f) => ({ ...f, text: searchBookText(f).text }))
      .map(
        (f) =>
          `<section class="search-equipment-profile">${ref(f)}<dl class="search-profile-fields">${[
            "category",
            "price",
            "availability",
            "enc",
            "group",
            "reach",
            "range",
            "damage",
            "ap",
            "locations",
            "qualities",
            "flaws",
            "properties",
          ]
            .filter((k) => f[k] !== undefined)
            .map(
              (k) =>
                `<div><dt>${esc({ enc: "Encumbrance", ap: "AP" }[k] || k)}</dt><dd>${esc(Array.isArray(f[k]) ? f[k].join(", ") : f[k] === null ? "Unresolved" : f[k])}</dd></div>`,
            )
            .join("")}</dl>${f.text ? `<p>${esc(f.text)}</p>` : ""}</section>`,
      )
      .join("");
  }
  function renderRule(key) {
    const { R, s, result, ref } = getContext(),
      row = index.find((x) => x.key === key);
    if (!row) return;
    selected = row;
    closeResults();
    const referenceOnly = getContext().referenceOnly;
    const context = referenceOnly
      ? { actions: [] }
      : searchContext(R, s, row, result());
    currentActions = context.actions;
    let entry = row.entry;
    if (!referenceOnly && ["talent", "skill"].includes(row.kind))
      entry = {
        ...entry,
        legacySources: legacyOption(R, s, row.kind, row.name).legacySources,
      };
    if (!referenceOnly && row.kind === "equipment")
      entry = {
        ...entry,
        legacySources: legacyGear(R, s, { key: "search" }, row.name)
          .legacySources,
      };
    if (!referenceOnly && row.kind === "magic")
      entry = legacyMagic(R, s, entry);
    document.querySelector("#book-search-title").textContent = row.name;
    body.innerHTML = `<p class="search-rule-source"><span class="search-kind">${esc(row.label || labels[row.kind])}</span> ${ref(entry)}</p><div class="search-book-reference">${referenceBody(row)}</div><div class="search-rule-actions">${currentActions.map((a, i) => `<button type="button" class="quiet" data-search-route="${i}">${esc(a.label)} →</button>`).join("")}<button type="button" class="text-button" data-search-back>Back to search</button></div>`;
    linkReferences(row);
    if (!box.open) box.showModal();
  }
  function linkReferences(row) {
    const root = body.querySelector(".search-book-reference"),
      walker = document.createTreeWalker(root, window.NodeFilter.SHOW_TEXT),
      nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement.closest("button, a, h2, h3, dt"))
        nodes.push(node);
    }
    for (const node of nodes) {
      const segments = linkText(node.textContent, row);
      if (!segments.some((x) => x.keys)) continue;
      const fragment = document.createDocumentFragment();
      for (const segment of segments) {
        if (!segment.keys)
          fragment.append(document.createTextNode(segment.text));
        else {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "search-term-link";
          button.textContent = segment.text;
          button.dataset.referenceKeys = JSON.stringify(segment.keys);
          button.setAttribute("aria-label", `View ${segment.text} reference`);
          fragment.append(button);
        }
      }
      node.replaceWith(fragment);
    }
  }
  function showView(view, { push = false, reset = false } = {}) {
    hidePreview();
    if (reset) history = [];
    if (push && currentView) history.push(currentView);
    currentView = view;
    previous.hidden = !history.length;
    if (view.key) renderRule(view.key);
    else {
      const { R, ref } = getContext();
      selected = null;
      currentActions = [];
      document.querySelector("#book-search-title").textContent = view.name;
      body.innerHTML = `<p>Several references in your selected books share this name. Choose which to read.</p><div class="search-reference-choices">${view.keys
        .map((key) => {
          const row = index.find((x) => x.key === key);
          return `<div><button type="button" class="quiet" data-reference-choice="${esc(key)}">${esc(row.name)} · ${esc(row.label || labels[row.kind])}</button> ${ref(row.entry)}</div>`;
        })
        .join("")}</div>`;
    }
    box.scrollTop = 0;
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
      rows = keys.map((key) => index.find((x) => x.key === key)),
      { R } = getContext();
    hover.innerHTML = `<strong>${esc(button.textContent)}${rows.length === 1 && rows[0].name !== button.textContent ? ` → ${esc(rows[0].name)}` : ""}</strong><p>${rows.map((row) => `${esc(row.label || labels[row.kind])} · ${esc(sourceText(R, row))}${legacyTag(R, row.entry) ? " · Legacy" : ""}`).join("<br>")}</p>${rows.length === 1 ? `<p>${esc(searchBookText(rows[0].entry).text.slice(0, 240) || "Open to view its profile and source.")}</p>` : ""}<small>Click to read the full reference</small>`;
    previewTarget = button;
    button.setAttribute("aria-describedby", hover.id);
    hover.hidden = false;
    const rect = button.getBoundingClientRect(),
      bounds = hover.getBoundingClientRect();
    hover.style.left = `${Math.max(10, Math.min(rect.left, window.innerWidth - bounds.width - 10))}px`;
    hover.style.top = `${rect.bottom + bounds.height + 12 < window.innerHeight ? rect.bottom + 8 : Math.max(10, rect.top - bounds.height - 8)}px`;
  }
  function navigate(route) {
    const ctx = getContext();
    if (!selected || catalogue !== ctx.R) {
      refresh();
      return;
    }
    // Re-evaluate the route against the live character; never trust an old quote.
    const fresh = searchContext(
      ctx.R,
      ctx.s,
      selected,
      ctx.result(),
    ).actions.find((a) => JSON.stringify(a) === JSON.stringify(route));
    if (!fresh) {
      openRule(selected.key);
      return;
    }
    if (route.career) {
      setContext("careerPreview", route.career);
      setContext("careerSearch", "");
      setContext("careerFilter", "All classes");
      setContext("careerBook", "all");
    }
    if (route.tab) {
      setContext("xpTab", route.tab);
      setContext("xpAffordable", false);
      setContext("xpCareerOnly", false);
    }
    if (route.kind === "skill" && route.tab)
      setContext("skillSearch", route.name);
    if (route.kind === "magic") {
      Object.assign(ctx.magicFilters, {
        query: route.name,
        type: "all",
        lore: "all",
        book: "all",
        status: "all",
      });
    }
    if (route.kind === "equipment") {
      setContext("marketSearch", route.name);
      setContext("shopBook", "all");
      setContext("shopGroup", "all");
      setContext("shopAffordable", false);
    }
    box.close();
    ctx.jumpToIssue(
      route.step,
      route.target ||
        (route.career
          ? ".career-preview"
          : route.kind === "equipment"
            ? ".shop-disclosure"
            : route.slot
              ? "[data-bind='speciesSkills']"
              : "#xp-tab-" + route.tab),
    );
    let node;
    if (route.marketId)
      node = [...document.querySelectorAll('[data-action="buy-trapping"]')]
        .find((n) => n.dataset.id === route.marketId)
        ?.closest(".market-item");
    else if (route.tab)
      node = [...document.querySelectorAll("[data-name]")]
        .find((n) => n.dataset.name === route.name)
        ?.closest(".xp-row");
    else if (route.slot)
      node = [
        ...document.querySelectorAll('[data-key], [data-bind="speciesSkills"]'),
      ]
        .find((n) => n.dataset.key === route.slot || n.value === route.slot)
        ?.closest(".skill-row, .species-skill-option");
    if (!node && route.tab)
      node = [...document.querySelectorAll("[data-detail-key]")]
        .find(
          (n) =>
            n.dataset.detailKey === `talent:${route.name}` ||
            (route.kind === "magic" &&
              n.dataset.detailKey.includes(selected.entry.contentId)),
        )
        ?.closest(".xp-row, .known-talent, details");
    if (node) {
      if (node.tagName === "DETAILS") node.open = true;
      for (let p = node.parentElement; p; p = p.parentElement)
        if (p.tagName === "DETAILS") p.open = true;
      node.scrollIntoView({ block: "center" });
      node.tabIndex = -1;
      node.focus({ preventScroll: true });
      node.classList.add("choice-highlight");
      setTimeout(() => node.classList.remove("choice-highlight"), 2400);
    }
  }
  input.addEventListener("input", () => {
    limit = 8;
    refresh();
  });
  input.addEventListener("focus", () => {
    refresh();
    if (popup.hidden) showResults();
  });
  input.addEventListener("click", () => {
    if (popup.hidden) showResults();
  });
  document
    .querySelector(".banner-search-field")
    .addEventListener("click", (e) => {
      if (!e.target.closest("input, button")) input.focus();
    });
  input.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      if (popup.hidden) showResults();
      selectActive(
        e.key === "ArrowDown"
          ? active + 1
          : active < 0
            ? matches.length - 1
            : active - 1,
      );
    }
    if (e.key === "Enter" && !popup.hidden && matches.length) {
      e.preventDefault();
      openRule(matches[Math.max(0, active)].key);
    }
    if (e.key === "Escape" && !popup.hidden) {
      e.preventDefault();
      e.stopPropagation();
      closeResults();
    }
  });
  popup.addEventListener("click", (e) => {
    const option = e.target.closest("[data-search-key]");
    if (option) openRule(option.dataset.searchKey);
  });
  // Combobox options retain input focus until selection. Otherwise pointer focus
  // can dismiss or replace the dropdown before its click is delivered.
  popup.addEventListener("mousedown", (e) => {
    if (
      e.button === 0 &&
      e.target.closest("[data-search-key], #book-search-more")
    )
      e.preventDefault();
  });
  document.querySelector("#book-search-more").addEventListener("click", () => {
    const scroll = list.scrollTop;
    limit += 8;
    showResults();
    input.focus({ preventScroll: true });
    list.scrollTop = scroll;
  });
  document.querySelector("#book-search-clear").addEventListener("click", () => {
    input.value = "";
    limit = 8;
    input.focus({ preventScroll: true });
    showResults();
  });
  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".banner-search")) closeResults();
  });
  document.querySelector(".banner-search").addEventListener("focusout", (e) => {
    if (!e.relatedTarget?.closest(".banner-search")) closeResults();
  });
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
      box.close();
      input.focus({ preventScroll: true });
      showResults();
      return;
    }
    const route = e.target.closest("[data-search-route]");
    if (route) {
      navigate(currentActions[Number(route.dataset.searchRoute)]);
      return;
    }
    const el = e.target.closest("[data-action]");
    if (el) {
      e.preventDefault();
      getContext()
        .action(el)
        .catch((err) => getContext().toast(err.message));
    }
  });
  box.addEventListener("cancel", () => {
    hidePreview();
    closeResults();
  });
  previous.addEventListener("click", () => {
    if (history.length) showView(history.pop());
    if (history.length) previous.focus({ preventScroll: true });
    else
      box.querySelector("[data-search-close]").focus({ preventScroll: true });
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
    openEntry(id) {
      refresh();
      const row = index.find((x) => x.entry.contentId === id);
      if (row) showView({ key: row.key }, { reset: true });
    },
  };
}
