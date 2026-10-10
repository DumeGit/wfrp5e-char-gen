// Shared presentation only. This module never mutates a draft or game rules.
import { diceIcon } from "./controls.mjs";
const enhancedRoots = new WeakSet();
function revealFocusedField() {
  const field = document.activeElement;
  if (!field?.matches("input,select,textarea") || field.closest("dialog"))
    return;
  const bar = document.querySelector(".mobile-workspace-bar");
  if (!bar || window.getComputedStyle(bar).display === "none") return;
  const keyboardBottom = window.visualViewport
    ? window.visualViewport.offsetTop + window.visualViewport.height
    : window.innerHeight;
  const bottom = Math.min(bar.getBoundingClientRect().top, keyboardBottom) - 12;
  const box = field.getBoundingClientRect();
  if (box.bottom > bottom)
    window.scrollBy({ top: box.bottom - bottom, behavior: "instant" });
}
if (typeof window !== "undefined")
  window.visualViewport?.addEventListener("resize", () =>
    requestAnimationFrame(revealFocusedField),
  );

export function enhanceInterface(root) {
  if (!enhancedRoots.has(root)) {
    enhancedRoots.add(root);
    root.addEventListener("focusin", () =>
      requestAnimationFrame(revealFocusedField),
    );
  }
  const main = root.querySelector("main");
  if (main) {
    main.id = "creator-main";
    main.tabIndex = -1;
  }
  for (const field of root.querySelectorAll("input,select,textarea")) {
    if (!field.name)
      field.name =
        field.id || field.dataset.bind || field.dataset.path || "choice";
    if (field.tagName !== "SELECT" && !field.hasAttribute("autocomplete"))
      field.autocomplete = "off";
    if (field.type === "number" && !field.inputMode) {
      field.inputMode =
        field.min && Number(field.min) >= 0 && field.step !== "any"
          ? "numeric"
          : "decimal";
    }
  }
  for (const button of root.querySelectorAll("button")) {
    if (button.textContent.trim() !== "⚄") continue;
    button.innerHTML = diceIcon;
    button.classList.add("ui-dice-button");
  }
  for (const details of root.querySelectorAll("details[data-detail-key]")) {
    details.classList.add("ui-disclosure");
  }
}

export function focusEditor(root = document) {
  const main = root.querySelector("#creator-main");
  main?.focus({ preventScroll: true });
  main?.scrollIntoView({ block: "start", behavior: "instant" });
}

export function connectIssues(root, issues, { unstarted = false } = {}) {
  for (const field of root.querySelectorAll("[data-ui-invalid]")) {
    field.removeAttribute("aria-invalid");
    const ids = (field.getAttribute("aria-describedby") || "")
      .split(" ")
      .filter((x) => x && !x.startsWith("ui-issue-"));
    if (ids.length) field.setAttribute("aria-describedby", ids.join(" "));
    else field.removeAttribute("aria-describedby");
    delete field.dataset.uiInvalid;
  }
  root.querySelectorAll("[data-ui-issue]").forEach((x) => x.remove());
  if (unstarted) return;
  const groups = new Map();
  for (const issue of issues) {
    if (!issue.control?.target || issue.severity !== "error") continue;
    let target;
    try {
      target = root.querySelector(issue.control.target);
    } catch {
      continue;
    }
    if (
      !target ||
      target.closest(".rail,.sheet,.gm-folio,.mobile-workspace-bar")
    )
      continue;
    const container =
      target.closest(".field,.gm-entry,.gm-char-row,.xp-row") ||
      target.parentElement;
    if (!container || container.closest("[hidden],dialog:not([open])"))
      continue;
    if (!groups.has(container))
      groups.set(container, { targets: [], messages: [] });
    const group = groups.get(container);
    group.targets.push(target);
    if (!group.messages.includes(issue.message))
      group.messages.push(issue.message);
  }
  let count = 0;
  for (const [container, { targets, messages }] of groups) {
    const message = document.createElement("p");
    message.id = `ui-issue-${++count}`;
    message.className = "ui-field-issue";
    message.dataset.uiIssue = "";
    message.textContent = messages.join(" ");
    container.append(message);
    for (const target of targets) {
      const fields = target.matches("input,select,textarea")
        ? [target]
        : [
            ...target.querySelectorAll(
              "input:not([type=hidden]),select,textarea",
            ),
          ];
      for (const field of fields) {
        field.dataset.uiInvalid = "";
        field.setAttribute("aria-invalid", "true");
        const ids = new Set(
          (field.getAttribute("aria-describedby") || "")
            .split(" ")
            .filter(Boolean),
        );
        ids.add(message.id);
        field.setAttribute("aria-describedby", [...ids].join(" "));
      }
    }
  }
}

const operations = new WeakMap();
export async function withBusy(button, label, operation) {
  const root = button.closest("#app") || button.ownerDocument;
  if (operations.get(root)) return;
  operations.set(root, true);
  const html = button.innerHTML,
    disabled = button.disabled,
    width = button.style.minWidth;
  const box = button.getBoundingClientRect();
  button.style.minWidth = `${box.width}px`;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = label;
  const parent =
    button.closest(
      ".mm-page-footer,.gm-review-status,.export-actions,.dialog-actions",
    ) || button.parentElement;
  parent.querySelectorAll(".ui-operation-error").forEach((x) => x.remove());
  try {
    // Allow the preparing state to paint before PDF layout or synchronous generation.
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    return await operation();
  } catch (error) {
    error.uiOperation = true;
    const message = document.createElement("p");
    message.className = "ui-operation-error";
    message.setAttribute("role", "alert");
    message.textContent = `Could not complete this action. Try again using the same button. ${error.message}`;
    parent.append(message);
    throw error;
  } finally {
    button.innerHTML = html;
    button.disabled = disabled;
    button.style.minWidth = width;
    button.removeAttribute("aria-busy");
    operations.delete(root);
    if (button.isConnected && document.activeElement === document.body)
      button.focus({ preventScroll: true });
  }
}
