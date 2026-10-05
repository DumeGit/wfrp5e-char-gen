import { screen, rows } from "./study-screen.mjs";

const variations = [
  {
    id: "battle-standard",
    number: "A",
    name: "The Battle Standard",
    strap: "CRIMSON · PAINTED GOLD · IVORY",
    text: "The closest to the box art: a crimson title cartouche, gilded lettering, painted banners and an ivory character ledger.",
    detail: "Boldest identity · parchment stays quiet",
    mark: "comet",
  },
  {
    id: "regimental-ledger",
    number: "B",
    name: "The Regimental Ledger",
    strap: "VELLUM · WAX · REGIMENTAL COLOURS",
    text: "A field ledger bound in oxblood leather. A narrower painted masthead, paper chapter markers and an illuminated initial keep the fantasy feel close to the everyday controls.",
    detail: "Lightest workspace · best for long creation sessions",
    mark: "comet",
  },
  {
    id: "black-banner",
    number: "C",
    name: "The Black Banner",
    strap: "DARK LEATHER · OLD GOLD · CRIMSON",
    text: "A darker, theatrical campaign standard: near-black leather, warm gold, red cloth and a framed parchment page. The drama comes from heraldry and painting.",
    detail:
      "Your preferred direction · aged gold, candlelight and drifting ash",
    mark: "comet",
  },
];

function preview(c) {
  const node = document.createElement("div");
  node.innerHTML = screen(c);
  const study = node.firstElementChild;
  study.classList.add("fantasy-muster");
  study.querySelector(".atmosphere").remove();
  const crest =
    '<img class="emblem muster-w" src="assets/muster-w.svg" alt="" />';
  study.querySelectorAll(".emblem").forEach((mark) => (mark.outerHTML = crest));
  study.querySelector(".study-header").outerHTML = `
    <header class="muster-masthead">
      <div class="painted-banner" aria-hidden="true"></div>
      ${c.id === "black-banner" ? `<div class="muster-embers" aria-hidden="true">${Array.from({ length: 8 }, (_, i) => `<i style="--particle:${i}"></i>`).join("")}</div>` : ""}
      <div class="muster-brand"><div class="heraldic-crest">${crest}</div><div class="title-cartouche"><span class="mini-overline">WARHAMMER FANTASY ROLEPLAY</span><h3>The Character Ledger</h3><span class="chapter">FIFTH EDITION · THE MUSTER ROLL</span></div></div>
      <div class="search-ribbon"><span>A NEW CHAPTER</span><button class="preview-search" data-demo="Search"><span aria-hidden="true">⌕</span> Search Careers, Skills, Talents, magic and equipment…</button><span>THE OLD WORLD</span></div>
    </header>`;
  if (c.id === "black-banner") {
    const glow = document.createElement("div");
    glow.className = "muster-candlelight";
    glow.setAttribute("aria-hidden", "true");
    study.append(glow);
  }
  study.querySelector(".nav-caption").textContent = "THE MUSTER ROLL";
  study.querySelector(".nav-foot").textContent = "By ink and oath.";
  study.querySelector(".portrait > span").textContent = "WS";
  study.querySelector(".study-page h4").innerHTML =
    `<span class="illuminated-initial">S</span>pend experience`;
  study.querySelector(".page-sub").textContent = "The next deed awaits.";
  study.querySelector(".folio-footer > span").textContent =
    "A record of deeds. A promise of more.";
  return study.outerHTML;
}

document.querySelector(".gallery").innerHTML = variations
  .map(
    (c) => `
  <article class="concept"><div class="concept-heading"><span>${c.number}</span><div><h2>${c.name}</h2><p>${c.strap}</p></div><button data-open="${c.id}" aria-label="Enlarge ${c.name}">Open ↗</button></div>${preview(c)}<div class="concept-notes"><p>${c.text}</p><small>${c.detail}</small></div></article>`,
  )
  .join("");

const dialog = document.querySelector("#expanded");
const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
  motionButtons = document.querySelectorAll("[data-motion]");
let paused = reduced.matches;
function updateMotion() {
  document.body.classList.toggle("paused", paused);
  motionButtons.forEach((motionButton) => {
    motionButton.disabled = reduced.matches;
    motionButton.textContent = reduced.matches
      ? "Motion reduced"
      : paused
        ? "Enable motion"
        : "Pause motion";
    motionButton.setAttribute("aria-pressed", String(!paused));
    motionButton.title = reduced.matches
      ? "Your device requests reduced motion."
      : "Toggle animation in The Black Banner preview";
  });
}
updateMotion();
reduced.addEventListener("change", () => {
  paused = reduced.matches;
  updateMotion();
});
function openPreview(c) {
  document.querySelector("#expanded-title").textContent =
    `${c.number} / ${c.name}`;
  document.querySelector("#expanded-body").innerHTML = preview(c);
  dialog.showModal();
}
const requested = variations.find((c) => location.hash === `#${c.id}`);
if (requested) openPreview(requested);
let toastTimer;
document.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  if (button.hasAttribute("data-motion")) {
    paused = !paused;
    updateMotion();
  }
  if (button.dataset.open) {
    const c = variations.find((c) => c.id === button.dataset.open);
    openPreview(c);
  }
  if (button.id === "close") dialog.close();
  if (button.dataset.tab) {
    const page = button.closest(".study-page");
    page
      .querySelectorAll('[role="tab"]')
      .forEach((tab) =>
        tab.setAttribute("aria-selected", String(tab === button)),
      );
    page.querySelector(".demo-rows").innerHTML = rows(button.dataset.tab);
  }
  if (button.dataset.demo) {
    document.querySelector("#toast").textContent =
      "Visual preview only — your character is unchanged.";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => (document.querySelector("#toast").textContent = ""),
      2300,
    );
  }
});
