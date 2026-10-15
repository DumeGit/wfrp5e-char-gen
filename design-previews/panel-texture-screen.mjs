const params = new URLSearchParams(location.search);
const mode = ["player", "gm", "marijan"].includes(params.get("mode"))
  ? params.get("mode")
  : "player";
const snapshots = await fetch("panel-texture-snapshots.json").then((r) =>
  r.json(),
);
const snapshot = snapshots[mode];
document.documentElement.dataset.theme = snapshot.theme;
document.documentElement.dataset.previewMode = mode;
document.getElementById("mode-style").href =
  mode === "player"
    ? "/dist/interface.css"
    : `/dist/${mode === "marijan" ? "marijan" : "gm"}/style.css`;
document.getElementById("sample").className =
  `${snapshot.workspace} texture-pair`;
document.getElementById("sample").innerHTML = snapshot.rail + snapshot.folio;
// Static snapshots have no creator runtime, dice, storage, network services or saves.
// Native disclosures remain inspectable; character-changing controls are inert.
document.getElementById("sample").addEventListener("click", (e) => {
  if (e.target.closest("button,a")) e.preventDefault();
});
document.querySelectorAll(".sheet details").forEach((el, i) => {
  el.open = i < 2;
});
if (params.has("thumbnail")) document.body.classList.add("is-thumbnail");
const strength = document.getElementById("strength");
function setStrength(value) {
  if (!["0", "0.15", "0.30"].includes(value)) return;
  strength.value = value;
  document.documentElement.style.setProperty("--texture-opacity", value);
  document.documentElement.classList.toggle("texture-off", value === "0");
}
strength.addEventListener("change", () => setStrength(strength.value));
window.addEventListener("message", (e) => {
  if (
    e.origin === location.origin &&
    e.source === parent &&
    e.data?.type === "texture-strength"
  )
    setStrength(e.data.value);
});
setStrength(params.get("strength") || "0.15");
