import { esc } from "../workspace.mjs";
import { chapterHeading } from "../design-system.mjs";
import { NPC_KEYS } from "../bestiary-content.mjs";
import { npcSourceLabel } from "../npc-books.mjs";
import { profileFeatures } from "../npc-profile.mjs";
import { isLegacy } from "../legacy.mjs";
import { btn, field, select, value, section } from "./npc-controls.mjs";
export function createNPCProfile(getContext, ref) {
  function booksView() {
    const { R, books } = getContext();
    return `<details id="npc-books" class="npc-section" data-detail-key="npc:books"><summary>Selected books <small>${R.selection.length} enabled</small></summary><p class="small muted">Only reviewed GM content appears here. Changing books starts a new NPC; your player-character draft is separate.</p><div class="npc-books-grid">${books.map((b) => `<label class="npc-book-choice"><input type="checkbox" data-npc-book="${esc(b.id)}" ${R.selection.some((x) => x.id === b.id) ? "checked" : ""} ${b.kind === "core" ? "disabled" : ""}><span><strong>${esc(b.shortTitle || b.title)}</strong><small>${b.kind === "core" ? "Required core rules" : b.kind === "variant" ? "Optional Career profile" : "Supplement profiles & options"}</small></span></label>`).join("")}</div></details>`;
  }
  function profileView() {
    const { R, s, d, ui } = getContext();
    const rows = R.creatures.filter(
      (x) =>
        (!ui.category || x.category === ui.category) &&
        (!ui.profileSource || x.source.book === ui.profileSource) &&
        (!ui.filter ||
          `${x.name} ${x.category}`
            .toLowerCase()
            .includes(ui.filter.toLowerCase())),
    );
    const preview =
      R.creatures.find((x) => x.contentId === ui.previewProfile) || d.profile;
    const sources = [...new Set(R.creatures.map((x) => x.source.book))];
    return `${chapterHeading("Choose a starting profile")}<p>Choose a printed creature or NPC. Preview its profile before replacing your draft.</p>${booksView()}
    <div class="npc-browser-filters">${field("Find a profile", `<input type="search" id="npc-profile-search" data-ui="filter" value="${esc(ui.filter)}" placeholder="Orc, merchant, dragon…">`)}${field("Category", select("npc-category", [["", "All categories"], ...[...new Set(R.creatures.map((x) => x.category))]], ui.category, 'data-ui="category"'))}${field("Source", select("npc-profile-source", [["", "All selected books"], ...sources.map((id) => [id, R.books.find((b) => b.id === id)?.shortTitle || id])], ui.profileSource, 'data-ui="profileSource"'))}</div>
    <p class="small muted" role="status">${rows.length} matching profiles · Previewing keeps your draft unchanged.</p>
    <div class="npc-profile-grid">${
      rows
        .slice(0, ui.profileLimit)
        .map(
          (x) =>
            `<button type="button" class="npc-profile-card career-result ${x.contentId === preview.contentId ? "selected" : ""}" data-npc-action="preview-profile" data-id="${esc(x.contentId)}" aria-pressed="${x.contentId === preview.contentId}"><strong>${esc(x.name)}</strong><span>${esc(x.category)} · ${esc(x.size)}</span><small>${esc(npcSourceLabel(R, x))}${x.contentId === s.profile ? " · Current" : ""}${x.example ? " · Example" : ""}${isLegacy(R, x) ? " · Legacy" : ""}</small></button>`,
        )
        .join("") ||
      '<p class="npc-empty">No profiles match. Try another name or clear the filters.</p>'
    }</div>
    ${rows.length > ui.profileLimit ? btn("more-profiles", `Show more profiles (${rows.length - ui.profileLimit} remaining)`) : ""}
    <article class="npc-profile-preview"><div class="npc-section-heading"><h2>${esc(preview.name)}</h2>${ref(preview)}</div><p class="small muted">${esc(preview.category)} · ${esc(preview.size)}${preview.example ? " · Worked example" : ""}</p><div class="npc-sheet-scores">${NPC_KEYS.map((k) => `<div><span>${k}</span><strong>${value(preview.stats[k])}</strong></div>`).join("")}</div><p class="small">${esc(
      profileFeatures(R, preview, "trait")
        .map((x) => `${x.name}${x.value ? ` (${x.value})` : ""}`)
        .join(", ") || "No printed Traits",
    )}</p>${btn("profile", preview.contentId === s.profile ? "Current profile" : "Use this profile", `data-id="${esc(preview.contentId)}" ${preview.contentId === s.profile ? "disabled" : ""}`, "primary")}</article>
    ${section("Identity", `<div class="npc-toolbar">${field("Name", `<input id="npc-name" type="text" data-state="name" value="${esc(s.name)}">`)}${field("GM notes / role", `<textarea id="npc-notes" data-state="notes" rows="2">${esc(s.notes)}</textarea>`)}</div>`)}
    <details id="npc-printed" class="npc-section" data-detail-key="npc:printed"><summary>Original printed profile · ${esc(d.profile.name)}</summary><pre class="npc-rule-text">${esc(d.profile.text)}</pre></details>`;
  }
  return { profileView, booksView };
}
