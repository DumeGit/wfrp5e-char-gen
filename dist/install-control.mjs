// Keep the browser's install prompt, installed state and listeners on one node.
export function createInstallControl(button) {
  return (root) => {
    const slot = root.querySelector("[data-install-slot]");
    if (slot && button) slot.append(button);
  };
}
