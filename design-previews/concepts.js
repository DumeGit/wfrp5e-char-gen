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
const ornament = `<svg class="scrollwork" viewBox="0 0 600 60" aria-hidden="true"><path d="M18 30h564M35 30C0 0 65 0 65 24S25 47 65 43C90 40 95 11 113 19S89 43 129 30M565 30c35-30-30-30-30-6s40 23 0 19c-25-3-30-32-48-24s24 24-16 11M255 30l25-14 20 14 20-14 25 14-25 14-20-14-20 14z"/></svg>`;
function emblem(type) {
  const paths = {
    hammer: `<path d="M37 29l9-9 26 26-9 9zM32 65l8 8 28-30-8-8zM31 28l8-8 44 45-8 8zM24 28l11-11 15 15-11 11zM66 68l8-8 12 12-8 8z"/><path d="M28 17l-5-7M16 30l-8-2M77 17l5-7M89 30l8-2"/>`,
    shield: `<path d="M24 20h56v32c0 20-28 36-28 36S24 72 24 52z"/><path d="M30 27h44v24c0 15-22 27-22 27S30 66 30 51zM52 27v51M30 49h44M36 35l12 8M59 59l10 8"/>`,
    skull: `<path d="M27 51C14 25 31 12 51 12s39 14 24 39l-7 9v15H34V60zM33 76v10h36V76M41 76v10M51 76v10M61 76v10"/><path class="hollow" d="M31 40l16 4-4 12-12-6zM70 40l-16 4 4 12 12-6zM51 54l-6 12h12z"/><path d="M17 82l68-55M17 27l68 55"/>`,
    star: `<circle cx="52" cy="49" r="34"/><circle cx="52" cy="49" r="23"/><path d="M52 7v84M10 49h84M23 20l58 58M23 78l58-58M52 20l8 21 21 8-21 8-8 21-8-21-21-8 21-8z"/><circle cx="52" cy="49" r="4"/>`,
  };
  return `<svg class="emblem" viewBox="0 0 104 100" aria-hidden="true">${paths[type]}</svg>`;
}
const steps = [
  "Origins",
  "Career",
  "Characteristics",
  "Skills",
  "Talents",
  "Gear & money",
  "Experience",
  "Review & export",
];
function screen(c) {
  return `<div class="study ${c.id}"><div class="grain"></div><div class="atmosphere"><i></i><i></i><i></i><i></i><i></i></div>
  <header class="study-header"><div class="header-emblem">${emblem(c.mark)}</div><div><span class="mini-overline">WARHAMMER FANTASY ROLEPLAY</span><h3>The Character Ledger</h3><span class="chapter">FIFTH EDITION · A NEW CHAPTER</span></div><div class="header-crest">${emblem(c.mark)}</div></header>
  <div class="study-workspace"><aside class="study-nav"><span class="nav-caption">YOUR CHRONICLE</span><nav>${steps.map((x, i) => `<button class="${i === 6 ? "selected" : ""}" data-demo="${x}"><span>${i < 6 ? "✓" : i + 1}</span>${x}</button>`).join("")}</nav><div class="mini-actions"><button data-demo="Save">Save</button><button data-demo="Load">Load</button></div><div class="nav-seal">${emblem(c.mark)}</div><span class="nav-foot">Sigmar preserve us.</span></aside>
  <section class="study-page"><div class="page-corners"></div><div class="page-heading"><span>VII. THE PATH AHEAD</span><span>CREATION COMPLETE</span></div><h4>Spend experience</h4><p class="page-sub">A deed remembered. A skill honed.</p>${ornament}<div class="mini-budget"><div><small>Remaining</small><strong>1,000 <em>XP</em></strong></div><div><small>Current Career</small><strong>Recruit <em>Brass 5</em></strong></div></div>
  <div class="mini-tabs" role="tablist" aria-label="${c.name} purchases"><button role="tab" aria-selected="true" data-tab="Characteristics">Characteristics</button><button role="tab" aria-selected="false" data-tab="Skills">Skills</button><button role="tab" aria-selected="false" data-tab="Talents">Talents</button></div>
  <div class="mini-advance"><span>Advance by <b>+5</b></span><span class="career-key"><i></i>Career Characteristic</span></div>
  <div class="demo-rows">${rows("Characteristics")}</div><div class="mini-tracker"><span>CAREER TRACKER</span><div>${"<i></i>".repeat(10)}</div><small>0 / 10</small></div><div class="folio-footer">${ornament}<span>Every experience point accounted for.</span></div></section>
  <aside class="study-folio"><span class="folio-caption">CHARACTER FOLIO</span><div class="portrait">${emblem(c.mark)}<span>WS</span></div><h4>Walther<br>Schmidt</h4><p>Human · Soldier</p><div class="rank">RECRUIT / BRASS 5</div><div class="mini-stats">${[
    ["WS", 41],
    ["BS", 26],
    ["S", 35],
    ["T", 35],
    ["I", 29],
    ["Ag", 32],
  ]
    .map(([k, v]) => `<div><small>${k}</small><strong>${v}</strong></div>`)
    .join(
      "",
    )}</div><div class="resources"><span>Fate <b>4</b></span><span>Fortune <b>3</b></span></div><details><summary>Skills <span>13</span></summary><p>Cool <b>37</b><br>Melee (Basic) <b>46</b></p></details><details><summary>Talents <span>6</span></summary><p>Six owned ranks</p></details><details><summary>Gear <span>7</span></summary><p>Seven starting items</p></details><button class="mini-export" data-demo="Export">Review & export</button></aside></div></div>`;
}
function rows(tab) {
  if (tab === "Talents")
    return `<div class="mini-row"><div><strong>Warrior Born</strong><small>Included in your totals</small></div><span>1 rank</span><button class="mini-help" data-demo="Talent rules" aria-label="Read Warrior Born rules">?</button><button class="xp-price" disabled>Known</button></div><p class="demo-note">Style study: open the full creator for its complete Talent options.</p>`;
  const items =
    tab === "Skills"
      ? [
          ["Athletics", "Career · +1 box", 37, 42, 75],
          ["Cool", "Career · +1 box", 37, 42, 75],
          ["Dodge", "Career · +1 box", 37, 42, 75],
        ]
      : [
          ["Weapon Skill", "L1 · Career · +1 box", 41, 46, 125],
          ["Ballistic Skill", "L1 · Career · +1 box", 26, 31, 125],
          ["Strength", "L1 · Career · +1 box", 35, 40, 125],
        ];
  return items
    .map(
      ([name, meta, from, to, xp]) =>
        `<div class="mini-row career-row"><div><strong>${name}</strong><small>${meta}</small></div><span class="score">${from} <em>→</em> ${to}<small>+5</small></span><button class="mini-help" data-demo="Calculation" aria-label="How is ${name} calculated?">?</button><button class="xp-price" data-demo="Purchase">${xp} XP</button></div>`,
    )
    .join("");
}
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
