const names = {
  moonlit: "A — Moonlit Vellum",
  midnight: "B — Midnight Grimoire",
  crypt: "C — The Verdigris Crypt",
};
const url = new URL(location.href);
const choice = document.getElementById("palette");
function setPalette(value) {
  const palette = Object.hasOwn(names, value) ? value : "moonlit";
  document.documentElement.dataset.palette = palette;
  document.getElementById("preview-title").textContent = names[palette];
  choice.value = palette;
  url.searchParams.set("palette", palette);
  history.replaceState(null, "", url);
}
setPalette(url.searchParams.get("palette"));
choice.addEventListener("change", () => setPalette(choice.value));
if (url.searchParams.has("thumbnail")) {
  document.querySelector(".preview-tools").hidden = true;
}
// Snapshot controls have no creator listeners or storage access. Disclosures work.
for (const field of document.querySelectorAll("#app input, #app textarea"))
  field.readOnly = true;
for (const link of document.querySelectorAll("#app a"))
  link.removeAttribute("href");
document.getElementById("book-search").readOnly = true;
for (const button of document.querySelectorAll(
  "#app button, .masthead button",
)) {
  button.addEventListener("click", (event) => event.preventDefault());
}
