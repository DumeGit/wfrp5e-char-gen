// Isolated design studies: no creator imports, storage, files or live commands.
const paths = {
  player:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
  gm: '<path d="M6 15c-2-2-2-6 0-8 3-3 9-3 12 0 2 2 2 6 0 8l-2 1v4H8v-4z"/><path d="m8 10 2 1m6-1-2 1m-3 5 1-2 1 2m-1 1v3"/>',
  marijan: '<path d="m5 18 1-5L17 2l5 5-11 11-5 1zM14 5l5 5M3 22h17"/>',
  manager: '<path d="M5 3h13v18H5zM5 7H3m2 5H3m2 5H3M9 7h5m-5 5h5m-5 5h3"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m7 10 5 5 5-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  undo: '<path d="m8 5-5 5 5 5m-5-5h11a6 6 0 0 1 0 12"/>',
  redo: '<path d="m16 5 5 5-5 5m5-5H10a6 6 0 0 0 0 12"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  new: '<path d="M14 3H5v18h14V8zM14 3v5h5M8 14h8m-4-4v8"/>',
  export: '<path d="M12 3v12m-4-4 4 4 4-4M4 15v6h16v-6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  library: '<path d="M3 4h5v16H3zM10 4h4v16h-4zM17 4l4 15-4 1-4-15"/>',
  play: '<path d="m9 5 10 7-10 7zM4 4v16"/>',
  advance: '<path d="M4 20V6m0 14h16M8 15l4-5 4 2 5-8"/>',
  journal:
    '<path d="M4 4c4-1 6 0 8 2 2-2 4-3 8-2v15c-4-1-6 0-8 2-2-2-4-3-8-2zM12 6v15"/>',
  identity:
    '<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
  stats: '<path d="M5 20V9m7 11V4m7 16v-8M3 20h18"/>',
  skills: '<path d="m4 17 6-6m4-4 6-3-3 6-3-3zM5 3l16 16-2 2L3 5z"/>',
  talents: '<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  gear: '<path d="M7 8V6a5 5 0 0 1 10 0v2M4 8h16v13H4zM4 13h16m-8-2v5"/>',
  magic: '<path d="m12 2 2 7 7 3-7 2-2 8-3-8-7-2 7-3zM19 2v4m-2-2h4"/>',
  notes: '<path d="M5 3h14v18H5zM8 8h8m-8 4h8m-8 4h5"/>',
  source: '<path d="M9 4H4v16h5m6-16h5v16h-5M12 5v14"/>',
  warning: '<path d="m12 3 10 18H2zM12 9v5m0 3v1"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.notes}</svg>`;
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const modes = {
  player: {
    name: "Player character",
    purpose: "Guided character creation",
    caption: "Create your character",
    page: 6,
    identity: "Walther Schmidt",
    source: "Core",
    pages: [
      ["Origins", "identity"],
      ["Career", "player"],
      ["Characteristics", "stats"],
      ["Skills", "skills"],
      ["Talents", "talents"],
      ["Gear & money", "gear"],
      ["Experience", "advance"],
      ["Review & export", "export"],
    ],
  },
  gm: {
    name: "NPC & creature",
    purpose: "Build a creature or NPC",
    caption: "Build your creature",
    page: 1,
    identity: "Griffon",
    source: "Core · p. 332",
    pages: [
      ["Starting profile", "gm"],
      ["Customise", "stats"],
      ["Equipment & magic", "gear"],
      ["Review & export", "export"],
    ],
  },
  marijan: {
    name: "Marijan Mode",
    purpose: "Unrestricted character editing",
    caption: "Character sections",
    page: 1,
    identity: "Albrecht",
    source: "Unrestricted",
    pages: [
      ["Identity", "identity"],
      ["Characteristics", "stats"],
      ["Resources", "advance"],
      ["Skills", "skills"],
      ["Talents", "talents"],
      ["Magic & Faith", "magic"],
      ["Equipment", "gear"],
      ["Extras", "plus"],
      ["Notes", "notes"],
    ],
  },
  manager: {
    name: "Character manager",
    purpose: "Your character library and play sheet",
    caption: "Elise Falkenrath",
    page: 0,
    identity: "Elise Falkenrath",
    source: "Human · Soldier",
    pages: [
      ["Play", "play"],
      ["Advance", "advance"],
      ["Journal", "journal"],
    ],
  },
};
const studies = {
  a: "A well-used campaign ledger: aged parchment, worn oak panelling and tarnished brass. The clean 296px menu and readable controls stay intact.",
  b: "A 312px parchment menu with larger serif navigation and a framed working page. A gentler, more book-like direction.",
  c: "A 280px slate menu, a shorter masthead and a tighter toolbar. The most compact, practical direction for frequent use.",
};
const state = {
  study: "a",
  mode: "gm",
  page: 1,
  size: "desktop",
  traitTab: "Traits",
  xpTab: "Characteristics",
  wounds: 11,
  fortune: 2,
  finish: "weathered",
};
const params = new URLSearchParams(location.search);
if (Object.hasOwn(studies, params.get("study")))
  state.study = params.get("study");
if (Object.hasOwn(modes, params.get("mode"))) {
  state.mode = params.get("mode");
  state.page = modes[state.mode].page;
}
if (params.get("size") === "phone") state.size = "phone";
if (params.get("finish") === "clean") state.finish = "clean";
const example = document.getElementById("example");
const main = document.getElementById("example-main");
const drawer = document.getElementById("mobile-menu");
const dialog = document.getElementById("sample-dialog");
let dialogReturn = null,
  toastTimer;
// Keep the simulated phone's native top-layer dialogs visually inside its frame.
// Real compact viewports use the ordinary viewport-aligned drawer.
function positionModal(modal, drawerMode = false) {
  if (state.size !== "phone" || window.innerWidth <= 700) {
    for (const property of ["left", "top", "width", "margin", "max-height"])
      modal.style.removeProperty(property);
    return;
  }
  const bounds = example.getBoundingClientRect();
  const width = Math.min(drawerMode ? 340 : 480, bounds.width - 24);
  const top = Math.max(12, Math.min(bounds.top + 12, 100));
  modal.style.width = `${width}px`;
  modal.style.margin = "0";
  modal.style.left = `${bounds.left + (drawerMode ? 12 : (bounds.width - width) / 2)}px`;
  modal.style.top = `${top}px`;
  modal.style.maxHeight = `calc(100dvh - ${top + 12}px)`;
}
const button = (text, command, style = "quiet", glyph = "") =>
  `<button type="button" class="${style}" data-command="${command}">${glyph ? icon(glyph) : ""}${text}</button>`;
function history() {
  return `<div class="history-buttons" role="group" aria-label="Edit history"><button type="button" class="icon-button" data-command="undo" aria-label="Undo">${icon("undo")}</button><button type="button" class="icon-button" data-command="redo" aria-label="Redo" disabled>${icon("redo")}</button></div>`;
}
function sidebar() {
  const mode = modes[state.mode];
  return `<details class="workspace-switch"><summary aria-label="Switch workspace: ${mode.name}"><span class="mode-symbol">${icon(state.mode)}</span><span class="mode-copy"><small>Workspace</small><strong>${mode.name}</strong></span>${icon("down")}</summary><div class="workspace-options">${Object.entries(
    modes,
  )
    .map(
      ([key, m]) =>
        `<button type="button" data-mode="${key}" ${key === state.mode ? 'aria-current="true"' : ""}>${icon(key)}<span><strong>${m.name}</strong><small>${m.purpose}</small></span>${key === state.mode ? icon("check") : ""}</button>`,
    )
    .join("")}</div></details>
  ${state.mode === "manager" ? `<button type="button" class="nav-row library-button" data-page="library">${icon("library")}<span class="nav-label">Character library</span><small>3</small></button>` : ""}
  <p class="nav-caption">${mode.caption}</p>
  <nav class="local-nav" aria-label="${state.mode === "manager" ? "Character destinations" : "Workspace pages"}">${mode.pages.map(([name, glyph], i) => `<button type="button" class="nav-row" data-page="${i}" ${i === state.page ? 'aria-current="page"' : ""}><span class="nav-icon">${state.mode === "player" || state.mode === "gm" ? String(i + 1).padStart(2, "0") : icon(glyph)}</span><span class="nav-label">${name}</span>${state.mode === "player" && i < 6 ? `<span class="row-marker">${icon("check")}</span>` : ""}</button>`).join("")}</nav>
  ${state.mode === "player" ? '<div class="progress-copy"><span>Required choices complete</span><span>6 / 6</span></div><div class="progress-track" role="img" aria-label="6 of 6 required stages complete"><span style="width:100%"></span></div>' : ""}
  <div style="min-height:28px"></div><div class="menu-tools">${[
    ["New & import", "new", "new"],
    ["Save & export", "export", "export"],
    ["More", "more", "more"],
  ]
    .map(
      ([name, glyph, command]) =>
        `<button type="button" class="nav-row" data-command="${command}" aria-haspopup="dialog"><span class="nav-icon">${icon(glyph)}</span><span class="nav-label">${name}</span>${icon("chevron")}</button>`,
    )
    .join("")}</div>
  <div class="nav-bottom">${history()}<span class="save-state"><i></i>Saved on this device</span></div>`;
}
function heading(title, subtitle, action = "") {
  return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}
function tabs(labels, active, kind) {
  return `<div class="page-tabs" role="group" aria-label="${kind === "xp" ? "Advancement type" : "Customisation type"}">${labels.map((x) => `<button type="button" data-${kind}-tab="${x}" aria-pressed="${x === active}">${x}</button>`).join("")}</div>`;
}
function footer(next) {
  return `<div class="page-actions"><span>${state.mode === "gm" ? "All choices resolved" : "Your draft stays on this device"}</span>${button(next, "next", "primary", "chevron")}</div>`;
}
function traits() {
  const rows = [
    [
      "Fly (80)",
      "As its Move, fly up to Rating yards, ignoring intervening terrain, obstacles and creatures; may Charge. End landed or airborne; if starting a turn airborne, must Fly or fall (GM decides distance). Against it, measure horizontal range then increase one range step (Extreme becomes unreachable). While flying, −20 to its Ranged Attacks.",
      358,
    ],
    [
      "Night Vision",
      "See clearly in natural darkness for 20 yards; extend the illumination distance of light sources by 20 yards.",
      360,
    ],
    [
      "Size (Enormous)",
      "Size determines Wounds, primary melee Damage and combat interactions.",
      360,
    ],
  ];
  return rows
    .map(
      ([name, text, page], i) =>
        `<div class="ability-row"><details class="ability-copy" ${i === 1 ? "open" : ""}><summary>${icon("chevron")}${name}</summary><p>${text}</p><button type="button" class="source-link" data-command="source">Core · p. ${page}</button></details><div class="ability-controls"><label class="description-switch">Description<input type="checkbox" role="switch" aria-label="${name} description" checked /></label><button type="button" class="remove-button" data-command="remove" aria-label="Remove ${name}">${icon("close")}</button></div></div>`,
    )
    .join("");
}
function bestiary() {
  return (
    heading(
      "Customise",
      "Keep the printed profile, or make this creature your own.",
    ) +
    `<div class="template-strip">${icon("gm")}<div><strong>Griffon</strong><p>Printed foundation · no template applied</p></div>${button("Choose template", "template")}</div>` +
    tabs(
      ["Characteristics", "Traits", "Skills & Talents"],
      state.traitTab,
      "trait",
    ) +
    (state.traitTab === "Traits"
      ? `<div class="section-heading"><h2>Traits <small>3 selected</small></h2>${button("Add Trait", "add-trait", "quiet", "plus")}</div><p class="section-note">Choose which descriptions appear in Review and printed sheets.</p>${traits()}`
      : state.traitTab === "Characteristics"
        ? manualStats()
        : `<div class="section-heading"><h2>Skills & Talents</h2>${button("Add Skill", "add-skill", "quiet", "plus")}</div>${skillRows(
            [
              ["Athletics", "Ag", "65"],
              ["Melee (Brawling)", "WS", "60"],
              ["Perception", "I", "60"],
            ],
          )}`) +
    footer("Equipment & magic")
  );
}
function skillRows(rows) {
  return rows
    .map(
      ([name, char, value]) =>
        `<div class="skill-row"><span>${name}</span><small>${char}</small><b>${value}</b></div>`,
    )
    .join("");
}
function experience() {
  const items =
    state.xpTab === "Characteristics"
      ? [
          ["Weapon Skill", 41, 46, 125],
          ["Ballistic Skill", 26, 31, 125],
          ["Strength", 35, 40, 125],
          ["Toughness", 35, 40, 125],
        ]
      : state.xpTab === "Skills"
        ? [
            ["Athletics", 37, 42, 75],
            ["Cool", 37, 42, 75],
            ["Dodge", 37, 42, 75],
          ]
        : [
            ["Strong Back", 1, 2, 100],
            ["Warrior Born", 0, 1, 100],
          ];
  return (
    heading(
      state.mode === "manager" ? "Advance" : "Spend experience",
      "See the improvement and its cost before you purchase.",
    ) +
    `<div class="budget"><div><small>Available experience</small><strong>1,000 <em>XP</em></strong></div><div><small>Spent</small><strong>0 <em>XP</em></strong></div><div class="budget-career"><small>Current Career</small><strong>Recruit <em>Brass 5</em></strong></div></div>` +
    tabs(["Characteristics", "Skills", "Talents"], state.xpTab, "xp") +
    `<div class="advance-controls"><label>Advance by <select aria-label="Advance amount"><option>+5 points</option><option>+1 point</option></select></label><span>Showing Career advances</span></div>` +
    items
      .map(
        ([name, from, to, cost]) =>
          `<div class="advance-row"><div><strong>${name}</strong><small>Career · Level 1</small></div><div class="score-change"><span>${from}</span>${icon("chevron")}<b>${to}</b></div><button type="button" class="help-button" data-command="calculation" aria-label="How ${name} is calculated">?</button>${button(`${cost} XP`, "purchase", "primary")}</div>`,
      )
      .join("") +
    `<div class="tracker"><span>Career tracker · 0 / 10 boxes</span><div aria-hidden="true">${"<i></i>".repeat(10)}</div></div>` +
    footer("Review & export")
  );
}
function manualStats() {
  const values = [
    ["WS", 35],
    ["BS", 30],
    ["S", 35],
    ["T", 35],
    ["I", 30],
    ["Ag", 35],
    ["Dex", 30],
    ["Int", 35],
    ["WP", 35],
    ["Fel", 30],
  ];
  return `<div class="manual-stats">${values.map(([name, value]) => `<div class="manual-stat"><label for="sample-stat-${name}">${name}</label><div><input id="sample-stat-${name}" type="number" inputmode="numeric" value="${value}" aria-label="${name} starting score" /><output aria-label="${name} total">${value}</output></div></div>`).join("")}</div>`;
}
function freehand() {
  return (
    heading(
      "Characteristics",
      "Set starting values freely. Calculated totals stay beside each field.",
      button("Roll starting values", "roll", "quiet", "stats"),
    ) +
    `<div class="template-strip">${icon("marijan")}<div><strong>Albrecht · Human</strong><p>Manual creation · no XP or purchase restrictions</p></div>${button("Edit identity", "identity")}</div>` +
    `<div class="advance-controls"><span>Starting score / current total</span><label class="description-switch"><input type="checkbox" role="switch" aria-label="Apply Characteristic Talent bonuses" checked />Talent bonuses</label></div>` +
    manualStats() +
    `<details class="subtle-disclosure"><summary>Advances & other adjustments</summary><p>Keep deliberate adjustments alongside the starting scores.</p><div class="fields-grid"><label class="field">Weapon Skill Advances<input type="number" value="0" /></label><label class="field">Other adjustment<input type="number" value="0" /></label></div></details>` +
    `<div class="section-heading" style="margin-top:28px"><h2>Resources</h2></div><p class="section-note">Automatic values can be replaced with your own.</p><div class="fields-grid"><label class="field">Wounds<input type="number" value="12" /></label><label class="field">Movement<input type="number" value="4" /></label></div>`
  );
}
function play() {
  return `<div class="page-heading"><div><div class="identity-heading"><h1>Elise Falkenrath</h1><button type="button" class="icon-button" data-command="identity" aria-label="Edit profile">${icon("marijan")}</button></div><p>Human · Soldier · Recruit</p><div class="person-resources"><span>Fate <b>3</b><button type="button" data-command="resource" aria-label="Decrease Fate">−</button><button type="button" data-command="resource" aria-label="Increase Fate">+</button></span><span>Fortune <b>${state.fortune} / 3</b><button type="button" data-command="fortune-minus" aria-label="Decrease Fortune">−</button><button type="button" data-command="fortune-plus" aria-label="Increase Fortune">+</button></span></div></div>${button("Manage gear", "gear", "quiet", "gear")}</div>
  <div class="play-grid"><section class="sheet-section"><header><h2>Combat</h2></header><div class="sheet-body"><div class="combat-resources"><div><small>Wounds</small><div class="wounds"><button type="button" data-command="wounds-minus" aria-label="Decrease Wounds">−</button><strong>${state.wounds} <small>/ 13</small></strong><button type="button" data-command="wounds-plus" aria-label="Increase Wounds">+</button></div></div><div class="movement"><small>Movement</small><strong>4</strong></div></div><table class="attack-table"><thead><tr><th>Attack</th><th>Skill</th><th>Damage</th></tr></thead><tbody><tr><td>Hand Weapon</td><td>46</td><td>+7</td></tr><tr><td>Dagger</td><td>46</td><td>+5</td></tr></tbody></table><div class="soak"><span>Head<b>3</b></span><span>Arms<b>3</b></span><span>Body<b>4</b></span><span>Legs<b>3</b></span></div></div></section><section class="sheet-section"><header><h2>Status & afflictions</h2>${button("Add", "condition", "quiet", "plus")}</header><div class="sheet-body"><div class="facts"><span>Carried Enc<b>3 / 6</b></span><span>Corruption<b>0</b></span><span>Sin<b>0</b></span></div><div class="condition">${icon("warning")}<div><strong>Fatigued · 1</strong><small>After the journey from Altdorf.</small></div><button type="button" class="remove-button" data-command="condition" aria-label="Edit Fatigued">${icon("marijan")}</button></div></div></section></div>
  <section class="sheet-section skills-section"><header><h2>Skills</h2>${button("Add", "add-skill", "quiet", "plus")}</header><div class="sheet-body"><p class="small-divider">Basic Skills</p><div class="skills-table"><div>${skillRows(
    [
      ["Athletics", "Ag", "37"],
      ["Climb", "S", "35"],
      ["Cool", "WP", "37"],
      ["Dodge", "Ag", "42"],
    ],
  )}</div><div>${skillRows([
    ["Endurance", "T", "35"],
    ["Intuition", "I", "34"],
    ["Melee (Basic)", "WS", "46"],
    ["Perception", "I", "39"],
  ])}</div></div></div></section>`;
}
function library() {
  return (
    heading(
      "Character library",
      "Continue a character, or bring a new one into the ledger.",
      button("New & import", "new", "primary", "plus"),
    ) +
    `<label class="field">Find a character<input type="search" placeholder="Search name, Species or Career…" aria-label="Find a character" /></label><div class="section-heading" style="margin-top:24px"><h2>Recent characters</h2></div>` +
    [
      ["Elise Falkenrath", "Human · Soldier · Recruit"],
      ["Lotte Neumann", "Human · Apothecary"],
      ["Albrecht", "Human · Wizard"],
    ]
      .map(
        ([name, meta]) =>
          `<div class="ability-row"><div><strong>${name}</strong><p class="section-note" style="margin:5px 0 0">${meta}</p></div>${button("Open", "open-character")}</div>`,
      )
      .join("")
  );
}
function alternate() {
  const mode = modes[state.mode],
    [name] = mode.pages[state.page] || ["Character library"];
  if (state.mode === "manager" && state.page === "library") return library();
  if (state.mode === "manager" && state.page === 1) return experience();
  if (
    (state.mode === "player" && state.page === 7) ||
    (state.mode === "gm" && state.page === 3)
  )
    return (
      heading(
        "Review & export",
        `${mode.identity} · ready for a final look.`,
        button("Save & export", "export", "primary", "export"),
      ) +
      `<div class="template-strip">${icon(state.mode)}<div><strong>${mode.identity}</strong><p>${mode.source} · all required choices resolved</p></div></div><div class="section-heading"><h2>Character sheet</h2></div><p class="section-note">The complete character, equipment and recorded choices stay together in Review and exports.</p>${manualStats()}${footer("Save & export")}`
    );
  if (state.mode === "manager" && state.page === 2)
    return (
      heading(
        "Journal",
        "Background, notes and the record of your character.",
        button("Add entry", "journal", "primary", "plus"),
      ) +
      `<div class="section-heading"><h2>22 October · The road to Altdorf</h2></div><p class="section-note">Arrived at dusk. Find a room, mend the cloak and ask about the missing caravan.</p><details class="subtle-disclosure"><summary>Character history</summary><p>Recorded changes and original character attachments appear here.</p></details>`
    );
  return (
    heading(name, `${mode.identity} · ${mode.purpose.toLowerCase()}`) +
    `<div class="template-strip">${icon(state.mode)}<div><strong>${mode.identity}</strong><p>${mode.source}</p></div>${button("Edit identity", "identity")}</div><div class="fields-grid"><label class="field">Name<input value="${mode.identity}" /></label><label class="field">${state.mode === "gm" ? "Short description" : "Origin / background"}<input placeholder="Add your own details…" /></label></div><p class="section-note" style="margin-top:22px">This page shows the shared editor layout. Use the menu to compare its navigation and file tools.</p>${footer(state.mode === "manager" ? "Play" : "Continue")}`
  );
}
function renderMain() {
  const mode = modes[state.mode],
    name =
      state.page === "library"
        ? "Character library"
        : mode.pages[state.page][0];
  const content =
    state.mode === "gm" && state.page === 1
      ? bestiary()
      : state.mode === "player" && state.page === 6
        ? experience()
        : state.mode === "marijan" && state.page === 1
          ? freehand()
          : state.mode === "manager" && state.page === 0
            ? play()
            : alternate();
  main.innerHTML = `<div class="page-context"><span>${icon(state.mode)}${state.mode === "manager" ? name : mode.identity}</span><span class="context-tag">${state.mode === "player" ? "6 / 6 stages ready" : state.mode === "gm" ? mode.source : state.mode === "marijan" ? "Unrestricted" : "Play sheet"}</span></div><div class="editor-content">${content}</div>`;
}
function renderBar() {
  document.getElementById("compact-bar").innerHTML =
    state.mode === "manager"
      ? modes.manager.pages
          .map(
            ([name, glyph], i) =>
              `<button type="button" class="bottom-destination" data-page="${i}" ${state.page === i ? 'aria-current="page"' : ""}>${icon(glyph)}${name}</button>`,
          )
          .join("")
      : history() +
        `<span><strong>${state.mode === "player" ? "1,000 XP · 2 GC 8 SS" : modes[state.mode].identity}</strong>${state.mode === "gm" ? "All choices resolved" : state.mode === "player" ? "Available to spend" : "Unrestricted creation"}</span>`;
}
function render() {
  const address = new URL(location.href);
  address.searchParams.set("study", state.study);
  address.searchParams.set("mode", state.mode);
  if (state.finish === "clean") address.searchParams.set("finish", "clean");
  else address.searchParams.delete("finish");
  if (state.size === "phone") address.searchParams.set("size", "phone");
  else address.searchParams.delete("size");
  window.history.replaceState(null, "", address);
  example.dataset.study = state.study;
  example.dataset.mode = state.mode;
  example.dataset.finish = state.finish;
  document.querySelector(".finish-control").hidden = state.study !== "a";
  document.getElementById("preview-finish").value = state.finish;
  document.getElementById("preview-frame").dataset.size = state.size;
  document
    .querySelectorAll("button[data-size]")
    .forEach((el) =>
      el.setAttribute("aria-pressed", String(el.dataset.size === state.size)),
    );
  document.querySelectorAll("[data-study]").forEach((el) => {
    if (el.tagName === "BUTTON")
      el.setAttribute("aria-pressed", String(el.dataset.study === state.study));
  });
  document.getElementById("study-description").textContent =
    studies[state.study];
  document.getElementById("preview-mode").value = state.mode;
  document.getElementById("desktop-sidebar").innerHTML = sidebar();
  document.getElementById("mobile-sidebar").innerHTML = sidebar();
  renderMain();
  renderBar();
}
function setMode(mode) {
  state.mode = mode;
  state.page = modes[mode].page;
  if (drawer.open) drawer.close();
  render();
}
function setPage(page) {
  state.page = page === "library" ? "library" : Number(page);
  if (drawer.open) drawer.close();
  render();
}
function showToast(message) {
  const status = document.getElementById("preview-status");
  clearTimeout(toastTimer);
  status.textContent = message;
  toastTimer = setTimeout(() => {
    status.textContent = "";
  }, 3500);
}
const actionRow = (title, subtitle, glyph = "export") =>
  `<button type="button" class="dialog-action" data-command="illustration">${icon(glyph)}<span>${title}<small>${subtitle}</small></span></button>`;
function showDialog(command, trigger) {
  const mode = modes[state.mode];
  dialogReturn = drawer.open ? document.querySelector(".menu-launch") : trigger;
  if (drawer.open) drawer.close();
  let title, body;
  if (command === "export") {
    title = "Save & export";
    body =
      actionRow(
        "Download character JSON",
        "An editable backup of the current character.",
      ) +
      actionRow(
        state.mode === "gm" ? "Full creature sheet PDF" : "Character sheet PDF",
        "A readable sheet with the complete recorded content.",
      );
    if (state.mode === "gm")
      body += actionRow(
        "A4 table cards",
        "Flexible, four-card and six-card layouts.",
        "gm",
      );
    if (state.mode === "player")
      body += actionRow(
        "Creation & XP record",
        "Choices, purchases and recorded dice.",
        "notes",
      );
    if (state.mode === "manager")
      body +=
        actionRow(
          "Back up the library",
          "All characters in one local backup.",
          "library",
        ) +
        actionRow(
          "Restore library backup",
          "Review the characters before importing.",
          "new",
        );
  } else if (command === "new") {
    title = "New & import";
    body =
      actionRow(
        state.mode === "manager"
          ? "New blank character"
          : state.mode === "gm"
            ? "New NPC / creature"
            : "New character",
        "Start a separate draft.",
        "new",
      ) +
      actionRow(
        "Load JSON file",
        "Review the file before replacing the current draft.",
        "export",
      );
    if (state.mode === "manager")
      body += actionRow(
        "Import creator character",
        "Player, Marijan or manager character.",
        "player",
      );
    if (state.mode === "marijan")
      body +=
        actionRow(
          "Copy player character",
          "Create an independent editable copy.",
          "player",
        ) +
        actionRow(
          "Generate character",
          "Preview a random Fifth Edition character.",
          "stats",
        );
  } else if (command === "more") {
    title = "More";
    body =
      actionRow(
        "Sources & decisions",
        "Books, references and reviewed adaptations.",
        "source",
      ) +
      actionRow(
        "Install app",
        "Keep the companion available on this device.",
        "export",
      );
    if (state.mode === "manager")
      body =
        actionRow("Edit profile", "Name, identity and portrait.", "identity") +
        actionRow("Adjust sheet", "Deliberate manual changes.", "stats") +
        actionRow(
          "Character actions",
          "Duplicate, favourite, archive or delete.",
          "more",
        ) +
        body;
    else
      body =
        actionRow(
          "Choose books",
          "Keep this workspace’s current book choices.",
          "library",
        ) + body;
  } else if (command === "search") {
    title = "Search the books";
    body =
      '<label class="field">Search<input type="search" placeholder="Skills, Talents, trappings…" autofocus /></label><div class="fields-grid"><label class="field">Category<select><option>All categories</option><option>Trappings</option><option>Talents</option><option>Skills</option></select></label><label class="field">Book<select><option>All books</option><option>Core</option></select></label></div><p class="dialog-note">The shared search opens from the same position in every workspace. The real app retains its complete reference reader and dependent filters.</p>';
  } else if (command === "identity") {
    title = state.mode === "manager" ? "Edit profile" : "Edit identity";
    body = `<label class="field">Name<input value="${mode.identity}" /></label><label class="field">Background<input placeholder="Origin or background…" /></label>${button("Save profile", "illustration", "primary")}`;
  } else if (command === "source") {
    title = "Sourced reference";
    body =
      '<p class="dialog-note">The production app’s existing reference reader, source citations and selective Legacy explanations remain available from the editor. The preview uses existing Core Trait summaries.</p>';
  } else {
    title =
      {
        template: "Choose template",
        "add-trait": "Add Trait",
        "add-skill": "Add Skill",
        condition: "Status & afflictions",
        gear: "Manage gear",
        calculation: "Calculation",
        journal: "New journal entry",
      }[command] || "Preview action";
    body =
      '<label class="field">Find an entry<input type="search" placeholder="Search the catalogue…" /></label>' +
      actionRow(
        "Existing tools, shared dialog",
        "The final implementation keeps the current workflow and rules.",
        "source",
      );
  }
  document.getElementById("sample-dialog-title").textContent = title;
  document.getElementById("sample-dialog-body").innerHTML =
    body +
    '<p class="dialog-note">Design example only. No character files or personal data are changed.</p>';
  positionModal(dialog);
  dialog.showModal();
}
document.querySelector(".menu-launch").innerHTML = icon("menu");
document.querySelector(".search-symbol").innerHTML = icon("search");
document.querySelector(".close-drawer").innerHTML = icon("close");
document.querySelector(".close-dialog").innerHTML = icon("close");
document.querySelector(".menu-launch").addEventListener("click", () => {
  positionModal(drawer, true);
  drawer.showModal();
});
document
  .querySelector(".close-drawer")
  .addEventListener("click", () => drawer.close());
document
  .querySelector(".close-dialog")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  if (dialogReturn?.isConnected) dialogReturn.focus({ preventScroll: true });
});
for (const modal of [drawer, dialog])
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      modal.close();
  });
document
  .getElementById("preview-mode")
  .addEventListener("change", (event) => setMode(event.target.value));
document
  .getElementById("preview-finish")
  .addEventListener("change", (event) => {
    state.finish = event.target.value;
    render();
  });
document.addEventListener("click", (event) => {
  const study = event.target.closest("button[data-study]");
  if (study) {
    state.study = study.dataset.study;
    render();
    return;
  }
  const size = event.target.closest("[data-size]");
  if (size?.tagName === "BUTTON") {
    state.size = size.dataset.size;
    document.getElementById("preview-frame").dataset.size = state.size;
    document
      .querySelectorAll("button[data-size]")
      .forEach((el) =>
        el.setAttribute("aria-pressed", String(el.dataset.size === state.size)),
      );
    return;
  }
  const mode = event.target.closest("button[data-mode]");
  if (mode) {
    setMode(mode.dataset.mode);
    return;
  }
  const page = event.target.closest("button[data-page]");
  if (page) {
    setPage(page.dataset.page);
    return;
  }
  const trait = event.target.closest("[data-trait-tab]");
  if (trait) {
    state.traitTab = trait.dataset.traitTab;
    renderMain();
    return;
  }
  const xp = event.target.closest("[data-xp-tab]");
  if (xp) {
    state.xpTab = xp.dataset.xpTab;
    renderMain();
    return;
  }
  const target = event.target.closest("[data-command]");
  if (!target) return;
  const command = target.dataset.command;
  if (command === "next") {
    if (state.page === "library") setPage(0);
    else if (state.page < modes[state.mode].pages.length - 1)
      setPage(state.page + 1);
    else showDialog("export", target);
    return;
  }
  if (command === "open-character") {
    setPage(0);
    return;
  }
  if (command === "wounds-minus" || command === "wounds-plus") {
    state.wounds = Math.max(
      0,
      Math.min(13, state.wounds + (command === "wounds-plus" ? 1 : -1)),
    );
    renderMain();
    return;
  }
  if (command === "fortune-minus" || command === "fortune-plus") {
    state.fortune = Math.max(
      0,
      Math.min(3, state.fortune + (command === "fortune-plus" ? 1 : -1)),
    );
    renderMain();
    return;
  }
  if (
    ["illustration", "undo", "resource", "purchase", "roll", "remove"].includes(
      command,
    )
  ) {
    showToast("Preview only · your real characters are unchanged.");
    return;
  }
  showDialog(command, target);
});
document.addEventListener("input", (event) => {
  if (event.target.matches(".manual-stat input"))
    event.target.nextElementSibling.textContent = event.target.value;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape")
    document.querySelectorAll(".workspace-switch[open]").forEach((el) => {
      el.open = false;
      el.querySelector("summary").focus();
    });
  if (
    event.key === "/" &&
    !event.target.matches("input,textarea,select") &&
    !dialog.open &&
    !drawer.open
  ) {
    event.preventDefault();
    showDialog("search", document.querySelector(".search-launch"));
  }
});
document.addEventListener("click", (event) => {
  document.querySelectorAll(".workspace-switch[open]").forEach((el) => {
    if (!el.contains(event.target)) el.open = false;
  });
});
render();
