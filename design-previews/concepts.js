import { screen, rows } from "./study-screen.mjs";
const concepts = [
  {
    id: "chronicle",
    number: "01",
    name: "The Imperial Chronicle",
    strap: "INK · PARCHMENT · WAX",
    text: "An illuminated manuscript: worn vellum, crimson chapter tabs, gilded marginalia and a wax seal.",
    motion: "Candlelight & a stamped seal",
    sound: "A soft page turn",
    mark: "hammer",
  },
  {
    id: "armoury",
    number: "02",
    name: "The Muster Roll",
    strap: "IRON · HERALDRY · EMBERS",
    text: "A regimental field desk: riveted steel, torn banners, burnished brass and ash drifting over the interface.",
    motion: "Drifting embers & forged controls",
    sound: "A muted metal strike",
    mark: "shield",
  },
  {
    id: "dossier",
    number: "03",
    name: "The Witch Hunter’s Dossier",
    strap: "WOODCUT · BLOOD RED · ASH",
    text: "A severe, gothic dossier: carved skulls, scorched paper, black ink and red seals. Dense and theatrical.",
    motion: "Lantern glow & an ink stamp",
    sound: "A dry quill scratch",
    mark: "skull",
  },
  {
    id: "grimoire",
    number: "04",
    name: "The Celestial Grimoire",
    strap: "MIDNIGHT · VERDIGRIS · GOLD",
    text: "An astrologer’s workbench: engraved instruments, constellations, blue vellum and antique golden borders.",
    motion: "A turning astrolabe & starlight",
    sound: "A short glass chime",
    mark: "star",
  },
];
const gallery = document.querySelector(".gallery");
gallery.innerHTML = concepts
  .map(
    (c) =>
      `<article class="concept"><div class="concept-heading"><span>${c.number}</span><div><h2>${c.name}</h2><p>${c.strap}</p></div><button data-open="${c.id}" aria-label="Enlarge ${c.name}">Open ↗</button></div>${screen(c)}<div class="concept-notes"><p>${c.text}</p><div><span>✦ ${c.motion}</span><button data-sound="${c.id}">♫ ${c.sound}</button></div></div></article>`,
  )
  .join("");
const dialog = document.querySelector("#expanded");
let audio, timer;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reduced.matches;
function applyMotion() {
  document.body.classList.toggle("paused", paused);
  const b = document.querySelector("#motion");
  b.textContent = paused ? "Enable motion" : "Pause motion";
  b.setAttribute("aria-pressed", String(paused));
}
applyMotion();
reduced.addEventListener("change", (e) => {
  paused = e.matches;
  applyMotion();
});
function toast(text) {
  const box = document.querySelector("#toast");
  box.textContent = text;
  clearTimeout(timer);
  timer = setTimeout(() => (box.textContent = ""), 2600);
}
async function sound(id) {
  try {
    audio ??= new AudioContext();
    await audio.resume();
    const t = audio.currentTime;
    const gain = audio.createGain();
    gain.connect(audio.destination);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.065, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    if (["chronicle", "dossier"].includes(id)) {
      const buffer = audio.createBuffer(
          1,
          audio.sampleRate * 0.32,
          audio.sampleRate,
        ),
        data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const n = audio.createBufferSource();
      n.buffer = buffer;
      const f = audio.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = id === "chronicle" ? 900 : 2800;
      f.Q.value = 0.6;
      n.connect(f);
      f.connect(gain);
      n.start(t);
      n.stop(t + 0.34);
    } else {
      for (const [i, freq] of (id === "armoury"
        ? [145, 371, 829]
        : [659, 988, 1318]
      ).entries()) {
        const o = audio.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(freq, t);
        if (id === "armoury")
          o.frequency.exponentialRampToValueAtTime(freq * 0.78, t + 0.2);
        o.connect(gain);
        o.start(t + i * 0.025);
        o.stop(t + 0.42);
      }
    }
    toast(
      "Sound sample: " + concepts.find((c) => c.id === id).sound.toLowerCase(),
    );
  } catch {
    toast("Sound is unavailable in this browser.");
  }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.id === "motion") {
    paused = !paused;
    applyMotion();
  }
  if (b.dataset.open) {
    const c = concepts.find((c) => c.id === b.dataset.open);
    document.querySelector("#expanded-title").textContent =
      c.number + " / " + c.name;
    document.querySelector("#expanded-body").innerHTML = screen(c);
    document.querySelector(".sound-status").innerHTML =
      `<button data-sound="${c.id}">♫ Hear ${c.sound.toLowerCase()}</button><span> Sound is off until you tap.</span>`;
    dialog.showModal();
  }
  if (b.id === "close") dialog.close();
  if (b.dataset.sound) sound(b.dataset.sound);
  if (b.dataset.tab) {
    const page = b.closest(".study-page");
    page
      .querySelectorAll('[role="tab"]')
      .forEach((n) => n.setAttribute("aria-selected", String(n === b)));
    page.querySelector(".demo-rows").innerHTML = rows(b.dataset.tab);
  }
  if (b.dataset.demo) {
    const study = b.closest(".study");
    study.classList.remove("stamp");
    void study.offsetWidth;
    study.classList.add("stamp");
    toast(
      b.dataset.demo === "Purchase"
        ? "Preview only — your draft and XP are unchanged."
        : "Style preview · " + b.dataset.demo,
    );
  }
});
