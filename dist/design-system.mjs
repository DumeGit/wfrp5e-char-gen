// Presentation only. No character rules, catalogue entries or saved draft fields.
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export function chapterHeading(title) {
  const letters = Intl.Segmenter
    ? [
        ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
          String(title),
        ),
      ].map((x) => x.segment)
    : Array.from(String(title));
  const [initial, ...rest] = letters;
  return `<h1 class="chapter-title" aria-label="${escape(title)}"><span class="chapter-initial" aria-hidden="true"><span>${escape(initial || "")}</span></span><span aria-hidden="true">${escape(rest.join(""))}</span></h1>`;
}

export function ledgerEmblem() {
  return '<img class="ledger-emblem" src="assets/black-banner/w.svg" alt="" width="108" height="100">';
}

export function initDesignMotion() {
  const control = document.querySelector("#design-motion"),
    preference = matchMedia("(prefers-reduced-motion: reduce)"),
    key = "wfrp-ledger-design-motion";
  let paused = false;
  try {
    paused = localStorage.getItem(key) === "paused";
  } catch {
    /* Motion still works when browser storage is unavailable. */
  }
  function update() {
    const stopped = paused || preference.matches;
    document.body.classList.toggle("motion-paused", stopped);
    control.disabled = preference.matches;
    control.setAttribute("aria-pressed", String(!stopped));
    control.textContent = preference.matches
      ? "Motion reduced"
      : paused
        ? "Enable motion"
        : "Pause motion";
    control.title = preference.matches
      ? "Your device requests reduced motion."
      : "Toggle decorative ash, mist and candlelight";
  }
  control.addEventListener("click", () => {
    paused = !paused;
    try {
      localStorage.setItem(key, paused ? "paused" : "enabled");
    } catch {}
    update();
  });
  preference.addEventListener("change", update);
  update();
}
