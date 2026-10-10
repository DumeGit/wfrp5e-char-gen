// Shared phone chrome. Controls remain inside #app so the existing delegated
// actions still work; install controls keep their original node and listeners.
import {
  historyControls,
  refreshHistoryControls,
} from "./history-controls.mjs";
import { enhanceInterface } from "./interface-kit.mjs";
export function createMobileShell() {
  const mobile = matchMedia("(max-width: 760px)"),
    launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "mobile-menu-launcher quiet";
  launcher.setAttribute("aria-label", "Open creator menu");
  launcher.setAttribute("aria-haspopup", "dialog");
  launcher.innerHTML =
    '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  document.querySelector(".masthead-actions").append(launcher);
  let root,
    menu,
    moves = [],
    expanded = false,
    returnPosition = 0;
  launcher.addEventListener("click", () => menu?.showModal());
  function restore() {
    menu?.close();
    for (const { node, marker } of moves) {
      marker.replaceWith(node);
    }
    moves = [];
    menu?.remove();
    menu = null;
  }
  function move(node, target) {
    if (!node) return;
    const marker = document.createComment("mobile menu control");
    node.before(marker);
    moves.push({ node, marker });
    target.append(node);
  }
  function place() {
    if (!root) return;
    restore();
    if (!mobile.matches) return;
    move(
      root.querySelector(".history-controls"),
      root.querySelector(".mobile-workspace-bar"),
    );
    root
      .querySelector(".mobile-workspace-bar")
      ?.prepend(root.querySelector(".history-controls"));
    menu = document.createElement("dialog");
    menu.className = "creator-dialog mobile-creator-menu";
    menu.setAttribute("aria-labelledby", "mobile-menu-title");
    menu.innerHTML =
      '<div class="dialog-heading"><h2 id="mobile-menu-title">Creator menu</h2><button type="button" class="quiet" data-menu-close aria-label="Close creator menu">Close</button></div><div class="mobile-menu-actions"></div><div class="mobile-menu-extra"></div><h3>Switch creator</h3><div class="mobile-menu-modes"></div>';
    root.append(menu);
    const actions = menu.querySelector(".mobile-menu-actions"),
      extra = menu.querySelector(".mobile-menu-extra"),
      rail = root.querySelector(".rail");
    move(rail.querySelector(".header-actions"), actions);
    // Move Marijan file tools and export as live nodes, retaining their handlers.
    for (const node of rail.querySelectorAll(
      ".mm-rail-tools [data-action],#mm-install,#mm-save-status",
    ))
      move(node, actions);
    move(rail.querySelector(".save-status"), actions);
    for (const node of rail.querySelectorAll(":scope > .text-button"))
      move(node, extra);
    move(
      rail.querySelector(".creator-switch"),
      menu.querySelector(".mobile-menu-modes"),
    );
    menu.addEventListener(
      "click",
      (event) => {
        if (
          event.target.closest("[data-menu-close],[data-action],a,#pwa-install")
        ) {
          menu.close();
          launcher.focus({ preventScroll: true });
        }
      },
      { capture: true },
    );
    menu.addEventListener("click", (event) => {
      if (event.target !== menu) return;
      const box = menu.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      )
        menu.close();
    });
  }
  function refresh() {
    const folio = root?.querySelector(".mobile-fold-folio");
    if (!folio) return;
    const name =
      folio.querySelector(".mobile-folio-content h2")?.textContent ||
      "Your character";
    folio.querySelector(".mobile-folio-heading strong").textContent = name;
    const barName = root.querySelector(".mobile-marijan-bar strong");
    if (barName) barName.textContent = name;
  }
  function setExpanded(value) {
    expanded = value;
    const folio = root?.querySelector(".mobile-fold-folio");
    if (!folio) return;
    folio.classList.toggle("mobile-folio-open", expanded);
    const toggle = folio.querySelector("[data-mobile-folio-toggle]");
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.textContent = expanded
      ? "Hide details"
      : root.querySelector(".gm-workspace")
        ? "View creature"
        : "View character";
    const barToggle = root.querySelector(
      ".mobile-marijan-bar [data-mobile-view]",
    );
    if (barToggle) {
      barToggle.textContent = expanded ? "Back to editor" : "View character";
      barToggle.setAttribute("aria-expanded", String(expanded));
    }
  }
  function mount(nextRoot, history) {
    restore();
    root = nextRoot;
    enhanceInterface(root);
    const folio = root.querySelector(".gm-folio,.mm-folio");
    if (folio) {
      folio.classList.add("mobile-fold-folio");
      const content = document.createElement("div");
      content.className = "mobile-folio-content";
      content.id = "mobile-folio-content";
      content.append(...folio.childNodes);
      const heading = document.createElement("div");
      heading.className = "mobile-folio-heading";
      heading.innerHTML =
        '<strong></strong><button type="button" class="quiet" data-mobile-folio-toggle aria-controls="mobile-folio-content"></button>';
      folio.append(heading, content);
      heading
        .querySelector("button")
        .addEventListener("click", () => setExpanded(!expanded));
      setExpanded(expanded);
      refresh();
      if (root.querySelector(".mm-workspace")) {
        const bar = document.createElement("div");
        bar.className = "mobile-workspace-bar mobile-marijan-bar";
        bar.innerHTML =
          '<strong></strong><button type="button" class="quiet" data-mobile-view aria-controls="mobile-folio-content">View character</button>';
        root.append(bar);
        bar.querySelector("button").addEventListener("click", () => {
          if (expanded) {
            setExpanded(false);
            window.scrollTo({ top: returnPosition, behavior: "instant" });
          } else {
            returnPosition = window.scrollY;
            setExpanded(true);
            folio.scrollIntoView({ block: "start", behavior: "instant" });
          }
        });
        setExpanded(expanded);
        refresh();
      }
    }
    const rail = root.querySelector(".rail"),
      controls = document.createElement("div");
    controls.innerHTML = historyControls();
    const anchor = rail.querySelector(".header-actions,.mm-rail-tools");
    if (anchor) anchor.before(controls.firstElementChild);
    else rail.append(controls.firstElementChild);
    refreshHistoryControls(root, history);
    place();
  }
  mobile.addEventListener("change", place);
  return {
    mount,
    refresh,
    refreshHistory: (history) => refreshHistoryControls(root, history),
    expand: () => setExpanded(true),
  };
}
