const names = {
  ivory: "A — Ivory Ascendancy",
  teal: "B — Stormglass",
  violet: "C — The Forbidden Grimoire",
};
const url = new URL(location.href);
const select = document.querySelector("#palette");
function choose(value) {
  const palette = Object.hasOwn(names, value) ? value : "ivory";
  document.documentElement.dataset.palette = palette;
  document.querySelector("#preview-title").textContent = names[palette];
  select.value = palette;
  url.searchParams.set("palette", palette);
  history.replaceState(null, "", url);
}
choose(url.searchParams.get("palette"));
select.addEventListener("change", () => choose(select.value));
if (url.searchParams.has("thumbnail"))
  document.querySelector(".preview-tools").hidden = true;
const identity = document.querySelector("#mm-section-identity");
identity.innerHTML = "<h2>Identity</h2>";
identity.insertAdjacentHTML(
  "beforeend",
  '<div class="preview-identity"><strong>Marijan the Unbound</strong><span>High Elf · Wizard · Level 4</span></div>',
);
document
  .querySelector(".mm-page > h1")
  .insertAdjacentHTML(
    "afterend",
    '<p class="mm-preview-notice">No limits. Set any score, add any option, write your own. This example is deliberately unrestricted.</p>',
  );
for (const d of document.querySelectorAll("#app details"))
  d.removeAttribute("open");
for (const group of ["skills", "talents", "gear"])
  document
    .querySelector(`#mm-section-${group} > details`)
    ?.setAttribute("open", "");
for (const field of document.querySelectorAll("#app input, #app textarea"))
  field.readOnly = true;
for (const link of document.querySelectorAll(".creator-switch a"))
  link.removeAttribute("href");
for (const button of document.querySelectorAll(
  "#app button, .masthead button",
)) {
  button.setAttribute("aria-disabled", "true");
  button.addEventListener("click", (event) => event.preventDefault());
}
// Keep native section/detail disclosures and scrolling usable, without saving anything.
const search = document.querySelector(".banner-search");
search.innerHTML =
  '<button class="quiet book-search-launcher" type="button" aria-disabled="true">⌕ Search rules and book references…</button>';
const actions = document.querySelector(".masthead-actions");
actions.insertAdjacentHTML(
  "beforeend",
  '<span class="preview-phone-icon" aria-hidden="true">⌕</span><span class="preview-phone-icon" aria-hidden="true">☰</span>',
);
