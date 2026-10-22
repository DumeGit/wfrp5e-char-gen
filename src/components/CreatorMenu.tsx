"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { type CreatorMode } from "./ModeNavigation";

export function CreatorMenu({
  mode,
  open,
  onClose,
  children,
  trigger,
  restoreFocus = true,
}: {
  mode: CreatorMode;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  trigger?: HTMLElement | null;
  restoreFocus?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const title = useId();
  const wasOpen = useRef(false);
  useEffect(() => {
    const node = dialog.current;
    let restoreFrame = 0;
    if (open && node && !node.open) {
      wasOpen.current = true;
      opener.current =
        trigger ||
        document.querySelector<HTMLElement>(
          '.mobile-menu-launcher[aria-controls="creator-menu"]',
        );
      node.showModal();
    }
    if (!open && wasOpen.current) {
      wasOpen.current = false;
      if (node?.open) node.close();
      if (!restoreFocus) return;
      restoreFrame = requestAnimationFrame(() => {
        if (document.querySelector("dialog[open]")) return;
        const target =
          opener.current?.isConnected && opener.current.getClientRects().length
            ? opener.current
            : document.querySelector<HTMLElement>(
                ".workspace-rail .workspace-switcher > summary",
              );
        target?.focus({ preventScroll: true });
      });
    }
    return () => cancelAnimationFrame(restoreFrame);
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
    </dialog>
  );
}
