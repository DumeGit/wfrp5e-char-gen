"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { ModeNavigation, type CreatorMode } from "./ModeNavigation";

export function CreatorMenu({
  mode,
  verify = false,
  open,
  onClose,
  children,
  status,
  trigger,
}: {
  mode: CreatorMode;
  verify?: boolean;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  status?: string;
  trigger?: HTMLElement | null;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const title = useId();
  useEffect(() => {
    const node = dialog.current;
    if (open && node && !node.open) {
      opener.current =
        trigger ||
        document.querySelector<HTMLElement>(
          '.mobile-menu-launcher[aria-controls="creator-menu"]',
        );
      node.showModal();
    }
    if (!open && node?.open) {
      node.close();
      requestAnimationFrame(() => {
        if (
          opener.current?.isConnected &&
          !document.querySelector("dialog[open]")
        )
          opener.current.focus({ preventScroll: true });
      });
    }
  }, [open]);
  return (
    <dialog
      ref={dialog}
      id="creator-menu"
      className="creator-dialog mobile-creator-menu"
      aria-labelledby={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("button:not(:disabled),a")) onClose();
        if (target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <div className="dialog-heading">
        <h2 id={title}>
          {mode === "manager" ? "Manager menu" : "Creator menu"}
        </h2>
        <button
          type="button"
          className="quiet"
          aria-label={
            mode === "manager" ? "Close manager menu" : "Close creator menu"
          }
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="mobile-menu-actions">{children}</div>
      {status && <p className="save-status">{status}</p>}
      <h3>Switch creator</h3>
      <ModeNavigation mode={mode} verify={verify} />
    </dialog>
  );
}
