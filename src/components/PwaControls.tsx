"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./PwaControls.module.css";
import { connectPwa, type PwaController, type PwaState } from "../services/pwa";
const initial: PwaState = {
  installed: false,
  ready: false,
  online: true,
  updateAvailable: false,
  applying: false,
  failed: false,
  development: process.env.NODE_ENV !== "production",
};
export function PwaControls() {
  const [state, setState] = useState(initial);
  const [dismissed, setDismissed] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [installSlot, setInstallSlot] = useState<Element | null>(null);
  const controller = useRef<PwaController | null>(null);
  const dialog = useRef<HTMLDialogElement | null>(null);
  const installParent = useRef<HTMLDialogElement | null>(null);
  const installTrigger = useRef<HTMLElement | null>(null);
  async function install() {
    if (await controller.current?.install()) return;
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setInstructions(
      ios
        ? "Open this page in Safari. Tap Share, then Add to Home Screen. Enable Open as Web App if shown, then tap Add."
        : /Android/.test(navigator.userAgent)
          ? "Open your browser menu and choose Install app or Add to Home screen, then confirm."
          : "Use your browser’s install option in the address bar or menu. Chrome and Edge support installing this app; Safari on Mac offers Add to Dock.",
    );
    installTrigger.current = document.activeElement as HTMLElement;
    installParent.current =
      installTrigger.current?.closest("dialog[open]") || null;
    installParent.current?.close();
    dialog.current?.showModal();
  }
  useEffect(() => {
    const service = connectPwa(setState);
    controller.current = service;
    const requestInstall = () => {
      void install();
    };
    window.addEventListener("wfrp-install", requestInstall);
    const findSlot = () =>
      setInstallSlot(
        [...document.querySelectorAll("[data-install-slot]")].find(
          (slot) =>
            slot.getClientRects().length > 0 && !slot.closest("[hidden]"),
        ) ?? null,
      );
    const observer = new MutationObserver(findSlot);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open", "hidden", "class"],
    });
    window.addEventListener("resize", findSlot);
    findSlot();
    return () => {
      window.removeEventListener("wfrp-install", requestInstall);
      observer.disconnect();
      window.removeEventListener("resize", findSlot);
      controller.current = null;
      service.dispose();
    };
  }, []);
  const status = state.development
    ? null
    : state.failed
      ? "Offline access could not be prepared. Reopen the app online to retry."
      : state.ready
        ? state.online
          ? "Available offline · PDF exports included"
          : "Offline · character creation and PDF exports available"
        : "Preparing offline access, including PDF exports…";
  const installButton = (
    <button
      type="button"
      id="pwa-install"
      className="quiet install-app"
      hidden={state.installed}
      onClick={() => void install()}
    >
      Install app
    </button>
  );
  return (
    <>
      {installSlot ? (
        createPortal(installButton, installSlot)
      ) : (
        <span hidden>{installButton}</span>
      )}
      {status && (
        <p id="pwa-status" className="pwa-status" role="status">
          {status}
        </p>
      )}
      <section
        id="pwa-update"
        className={`pwa-update ${styles.update}`}
        hidden={!state.updateAvailable || dismissed}
        aria-label="App update"
      >
        <p>
          {state.updateError ||
            "An update is ready. Your character will be saved before reloading."}
        </p>
        <button
          type="button"
          id="pwa-update-now"
          className="primary"
          disabled={state.applying}
          onClick={() => controller.current?.update()}
        >
          {state.applying ? "Updating…" : "Update now"}
        </button>
        <button
          type="button"
          id="pwa-update-later"
          className="quiet"
          onClick={() => setDismissed(true)}
        >
          Later
        </button>
      </section>
      <dialog
        id="pwa-install-dialog"
        className="pwa-dialog"
        ref={dialog}
        aria-labelledby="pwa-install-title"
        onClose={() => {
          const parent = installParent.current;
          if (parent?.isConnected && !document.querySelector("dialog[open]"))
            parent.showModal();
          if (installTrigger.current?.isConnected)
            installTrigger.current.focus({ preventScroll: true });
          installParent.current = null;
        }}
      >
        <h2 id="pwa-install-title">Install Character Ledger</h2>
        <p id="pwa-install-instructions">{instructions}</p>
        <button
          type="button"
          id="pwa-install-close"
          className="quiet"
          onClick={() => dialog.current?.close()}
        >
          Close
        </button>
      </dialog>
    </>
  );
}
