import { randomTable } from "./books.mjs";
import { sourceLabel } from "./sources.mjs";
import { LEGACY_EXPLANATION } from "./legacy.mjs";
import { careerSpecies } from "./origins.mjs";
import { isCareerVariant } from "./career-variants.mjs";
import { bookSummary, esc } from "./workspace.mjs";

export function bookPanel(library, R) {
  return `<div class="selected-books"><span><strong>${R.books.filter((b) => !isCareerVariant(b.id)).length} selected books</strong><small>${R.books
    .filter((b) => !isCareerVariant(b.id))
    .map((b) => esc(b.shortTitle || b.title))
    .join(
      " · ",
    )}</small></span><button type="button" class="quiet" data-action="books">Choose books</button></div>`;
}

export function bookSetup(library, R) {
  const enabled = new Set(R.selection.map((x) => x.id));
  return `<span class="eyebrow">Before you begin</span><h1>Choose your books</h1>
<p class="muted">Select the supplied books you want to use for this character. Fifth Edition core rules remain the foundation.</p>
<div class="notice">Changing books starts a new character. Career variants are chosen later in Career; selecting a supplement does not enable every optional rule.</div>
<div class="book-grid">${library.packs
    .filter((x) => !isCareerVariant(x.manifest.id))
    .map((pack) => {
      const b = pack.manifest;
      return `<label class="book-card"><input type="checkbox" data-book="${esc(b.id)}" ${enabled.has(b.id) ? "checked" : ""} ${b.kind === "core" ? "disabled" : ""}><span><strong>${esc(b.title)}</strong><small>${b.kind === "core" ? "Required core rules" : "Additional character options"}</small><p>${esc(bookSummary(pack))}</p>
</span></label>`;
    })
    .join("")}</div>
<p class="small muted">${esc(LEGACY_EXPLANATION)} Each character option keeps its own book and page reference.</p>
<div class="actions"><button type="button" class="primary" data-action="apply-books">Use selected books</button><button type="button" class="quiet" data-action="books-cancel">Return to character</button></div>`;
}

export function tablePicker(R, s, kind) {
  const available = R.tables.filter(
      (x) =>
        x.kind === kind &&
        (kind !== "career" || x.species === careerSpecies(R, s)) &&
        (!x.origin || x.origin === s.origin) &&
        (!x.origins || x.origins.includes(s.origin)),
    ),
    active = randomTable(R, s, kind);
  const reference = active
    ? `<button type="button" class="source-button" data-action="source-info" data-book="${esc(active.source.book)}" data-page="${esc(active.source.page)}">${esc(sourceLabel(R, active))}</button>`
    : "";
  if (available.length < 2 && active)
    return `<p class="small muted roll-source">Rolls use ${esc(active.name)} · ${reference}.</p>`;
  if (!available.length)
    return '<p class="small muted">No implemented printed roll table for this selection; choose directly.</p>';
  return `<div class="field table-picker"><label for="table-${kind}">Roll using</label><select id="table-${kind}" data-bind="rollTable" data-key="${kind}">${!active ? '<option value="">Choose a printed table…</option>' : ""}${available.map((x) => `<option value="${esc(x.id)}" ${x.id === active?.id ? "selected" : ""}>${esc(x.name + " · " + sourceLabel(R, x))}</option>`).join("")}</select><small class="muted">Printed probabilities are retained. This changes the table for future rolls. ${reference}</small></div>`;
}
