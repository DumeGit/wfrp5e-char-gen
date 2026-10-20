import { useEffect, useRef, type ReactNode } from "react";
export type Edit = (
  label: string,
  change: (r: any) => void,
  detail?: string,
) => void;
export function ActionMenu({
  label = "More",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node))
        ref.current.open = false;
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return (
    <details
      ref={ref}
      className="manager-action-menu"
      onKeyDown={(e) => {
        if (e.key === "Escape" && ref.current) {
          ref.current.open = false;
          ref.current.querySelector("summary")?.focus();
        }
      }}
    >
      <summary aria-label={label}>
        {label.startsWith("More for ") ? "More" : label}
      </summary>
      <div
        className="manager-action-list"
        onClick={(e) => {
          if (
            (e.target as HTMLElement).closest("button:not(:disabled),a") &&
            ref.current
          ) {
            ref.current.open = false;
            ref.current.querySelector("summary")?.focus();
          }
        }}
      >
        {children}
      </div>
    </details>
  );
}
export const date = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
export function Dialog({
  title,
  close,
  children,
  trigger,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
  trigger?: HTMLElement | null;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const opener = trigger || (document.activeElement as HTMLElement);
    dialog.current?.showModal();
    return () => {
      dialog.current?.close();
      if (opener?.isConnected) {
        const parent = opener.closest("details:not([open])");
        const target = parent?.querySelector<HTMLElement>("summary") || opener;
        target.focus();
      }
    };
  }, []);
  return (
    <dialog
      className="manager-dialog"
      ref={dialog}
      aria-labelledby="manager-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          close();
      }}
    >
      <div className="dialog-heading">
        <h2 id="manager-dialog-title">{title}</h2>
        <button className="quiet" type="button" onClick={close}>
          Close
        </button>
      </div>
      {children}
    </dialog>
  );
}
