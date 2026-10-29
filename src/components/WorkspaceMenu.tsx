"use client";
import {
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ActionExecutor } from "./AsyncActionButton";
import { createPortal } from "react-dom";
import { COMPACT_SHELL_QUERY } from "../engine/responsive.mjs";
import { CreatorMenu } from "./CreatorMenu";
import { ModeNavigation, type CreatorMode } from "./ModeNavigation";

export type WorkspaceCommand = {
  id: string;
  label: string;
  effect: "stay" | "close" | "dialog" | "file" | "navigate";
  run?: (button: HTMLButtonElement) => unknown;
  disabled?: boolean;
  reason?: string;
  data?: Record<string, string | number>;
};
export type WorkspaceActionGroup = {
  id: string;
  label: string;
  commands?: WorkspaceCommand[];
  run?: (button: HTMLButtonElement) => void;
};

/** One capability-driven menu. Feature adapters retain their commands and stores. */
export function WorkspaceMenu({
  mode,
  verify = false,
  heading,
  navigation,
  selector,
  groups,
  history,
  status,
  documentState,
  children,
}: {
  mode: CreatorMode;
  verify?: boolean;
  heading?: ReactNode;
  navigation: ReactNode;
  selector?: ReactNode;
  groups: WorkspaceActionGroup[];
  history?: ReactNode;
  status?: ReactNode;
  documentState?: unknown;
  children?: ReactNode;
}) {
  const [compact, setCompact] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [group, setGroup] = useState("");
  const groupDialog = useRef<HTMLDialogElement>(null);
  const rail = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const restoreDrawerFocus = useRef(true);
  const child = useRef<{ group: string; command: string } | null>(null);
  const title = useId();
  const execute = useContext(ActionExecutor);
  const [busy, setBusy] = useState("");
  const [failure, setFailure] = useState("");
  const pending = useRef(false);
  const childFocus = useRef("");
  const currentDocument = useRef(documentState);
  currentDocument.current = documentState;
  const childObserver = useRef<MutationObserver | null>(null);
  const childIntent = useRef<AbortController | null>(null);
  function focusEditor() {
    const main = document.querySelector<HTMLElement>("#creator-main");
    const visible = (nodes: NodeListOf<HTMLElement>) =>
      [...nodes].find((node) => node.getClientRects().length > 0);
    const target =
      main &&
      (visible(main.querySelectorAll<HTMLElement>("[data-workspace-focus]")) ||
        visible(main.querySelectorAll<HTMLElement>("h1")) ||
        main);
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
  function watchChild(group: string, command: string) {
    childObserver.current?.disconnect();
    childIntent.current?.abort();
    childIntent.current = new AbortController();
    child.current = { group, command };
    const startedDocument = currentDocument.current;
    let opened: HTMLDialogElement | null = null;
    // A new user interaction supersedes a picker that produced no feature
    // dialog (for example, a malformed file). It must not capture later search.
    const supersede = () => {
      if (!document.querySelector("dialog[open]")) {
        child.current = null;
        childObserver.current?.disconnect();
        childIntent.current?.abort();
      }
    };
    for (const type of ["pointerdown", "keydown"])
      document.addEventListener(type, supersede, {
        capture: true,
        once: true,
        signal: childIntent.current.signal,
      });
    childObserver.current = new MutationObserver(() => {
      const active = [
        ...document.querySelectorAll<HTMLDialogElement>("dialog[open]"),
      ].find(
        (node) => node !== groupDialog.current && node.id !== "creator-menu",
      );
      if (active) opened = active;
      else if (!opened && startedDocument !== currentDocument.current) {
        child.current = null;
        childObserver.current?.disconnect();
        childIntent.current?.abort();
        focusEditor();
      } else if (
        opened &&
        (!opened.isConnected || !opened.open) &&
        child.current
      ) {
        const pending = child.current;
        child.current = null;
        childObserver.current?.disconnect();
        childIntent.current?.abort();
        if (startedDocument === currentDocument.current) {
          childFocus.current = pending.command;
          setGroup(pending.group);
        } else {
          focusEditor();
        }
      }
    });
    childObserver.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
  }
  const selected = groups.find((item) => item.id === group);
  const closeDrawer = (restore = true) => {
    restoreDrawerFocus.current = restore;
    document.querySelector<HTMLDialogElement>("#creator-menu[open]")?.close();
    setDrawer(false);
  };
  useEffect(() => {
    const media = matchMedia(COMPACT_SHELL_QUERY);
    const resize = () => {
      setCompact(media.matches);
      if (!media.matches) {
        setDrawer(false);
        document
          .querySelector<HTMLDialogElement>("#creator-menu[open]")
          ?.close();
      }
    };
    resize();
    setSlot(document.getElementById("compact-menu"));
    media.addEventListener("change", resize);
    const cancelFile = (event: Event) => {
      if (
        !(event.target instanceof HTMLInputElement) ||
        event.target.type !== "file" ||
        !child.current
      )
        return;
      const pending = child.current;
      child.current = null;
      childObserver.current?.disconnect();
      childIntent.current?.abort();
      childFocus.current = pending.command;
      setGroup(pending.group);
    };
    document.addEventListener("cancel", cancelFile, true);
    const fits = () => {
      if (rail.current)
        rail.current.dataset.fits = String(
          rail.current.getBoundingClientRect().height <= innerHeight - 32,
        );
    };
    const observer = new ResizeObserver(fits);
    if (rail.current) observer.observe(rail.current);
    window.addEventListener("resize", fits);
    return () => {
      media.removeEventListener("change", resize);
      childObserver.current?.disconnect();
      childIntent.current?.abort();
      document.removeEventListener("cancel", cancelFile, true);
      observer.disconnect();
      window.removeEventListener("resize", fits);
    };
  }, []);
  useEffect(() => {
    const node = groupDialog.current;
    if (selected && node && !node.open) {
      node.showModal();
      if (childFocus.current) {
        node
          .querySelector<HTMLButtonElement>(
            `[data-command="${childFocus.current}"]`,
          )
          ?.focus();
        childFocus.current = "";
      }
    }
    if (!selected && node?.open) node.close();
  }, [selected?.id]);
  function closeGroup(back = false) {
    groupDialog.current?.close();
    setGroup("");
    child.current = null;
    childObserver.current?.disconnect();
    childIntent.current?.abort();
    if (back && compact) {
      restoreDrawerFocus.current = true;
      setDrawer(true);
    } else {
      const target =
        !compact &&
        origin.current?.isConnected &&
        origin.current.getClientRects().length
          ? origin.current
          : launcher.current ||
            document.querySelector<HTMLElement>(
              `.workspace-rail [data-workspace-group="${group}"]`,
            );
      target?.focus({ preventScroll: true });
    }
  }
  const contents = (
    <div className="workspace-menu-content">
      <ModeNavigation mode={mode} verify={verify} />
      {heading && <div className="workspace-menu-heading">{heading}</div>}
      <div
        className="workspace-local-navigation"
        onClickCapture={(event) => {
          const target = (event.target as Element).closest(
            "button:not(:disabled),a",
          );
          if (!target) return;
          if (target.hasAttribute("aria-current")) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          closeDrawer(false);
          if (mode !== "marijan") requestAnimationFrame(focusEditor);
        }}
      >
        {navigation}
      </div>
      <div className="workspace-action-groups" aria-label="Workspace actions">
        {groups.map((item) => (
          <button
            key={item.id}
            type="button"
            data-workspace-group={item.id}
            className="workspace-group-launcher"
            aria-haspopup="dialog"
            onClick={(event) => {
              origin.current = event.currentTarget;
              closeDrawer(false);
              if (item.run) item.run(event.currentTarget);
              else setGroup(item.id);
            }}
          >
            <span>{item.label}</span>
            <span aria-hidden="true">›</span>
          </button>
        ))}
      </div>
      {children}
      <div className="workspace-menu-footer">
        {(!compact || mode === "manager") && history}
        {status && (
          <div className="save-status" role="status">
            {status}
          </div>
        )}
      </div>
    </div>
  );
  return (
    <>
      <aside
        ref={rail}
        className="rail workspace-rail"
        aria-label="Application menu"
      >
        {!compact && contents}
        {selector && (
          <div
            className="workspace-compact-selector"
            onChange={() => {
              if (mode !== "marijan") requestAnimationFrame(focusEditor);
            }}
          >
            {selector}
          </div>
        )}
      </aside>
      {compact &&
        slot &&
        createPortal(
          <button
            ref={launcher}
            type="button"
            className="mobile-menu-launcher quiet"
            aria-label={
              mode === "manager" ? "Open manager menu" : "Open creator menu"
            }
            aria-haspopup="dialog"
            aria-controls="creator-menu"
            aria-expanded={drawer}
            onClick={() => {
              restoreDrawerFocus.current = true;
              setDrawer(true);
            }}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>,
          slot,
        )}
      <CreatorMenu
        mode={mode}
        open={compact && drawer}
        onClose={() => closeDrawer(true)}
        restoreFocus={restoreDrawerFocus.current}
        trigger={launcher.current}
      >
        {compact && contents}
      </CreatorMenu>
      <dialog
        ref={groupDialog}
        className="creator-dialog workspace-action-dialog"
        aria-labelledby={title}
        onCancel={(event) => {
          event.preventDefault();
          closeGroup();
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            closeGroup();
        }}
      >
        <div className="dialog-heading">
          <h2 id={title}>{selected?.label}</h2>
          <button
            type="button"
            className="quiet"
            aria-label="Close actions"
            onClick={() => closeGroup()}
          >
            Close
          </button>
        </div>
        <div className="workspace-command-list">
          {selected?.commands?.map((command) => (
            <div key={command.id}>
              <button
                type="button"
                data-command={command.id}
                disabled={command.disabled || !!busy}
                title={command.reason}
                {...command.data}
                aria-busy={busy === command.id || undefined}
                onClick={async (event) => {
                  event.stopPropagation();
                  if (pending.current) return;
                  pending.current = true;
                  const button = event.currentTarget;
                  setFailure("");
                  setBusy(command.id);
                  if (!["stay", "close"].includes(command.effect)) {
                    groupDialog.current?.close();
                    setGroup("");
                    if (
                      command.effect === "dialog" ||
                      command.effect === "file"
                    )
                      watchChild(group, command.id);
                  }
                  // File commands execute in this trusted click, before any asynchronous work.
                  try {
                    if (command.run) await command.run(button);
                    else if (execute) await execute(button);
                    if (command.effect === "close") closeGroup();
                  } catch (error) {
                    setFailure(
                      error instanceof Error ? error.message : String(error),
                    );
                    setGroup(group);
                  } finally {
                    pending.current = false;
                    setBusy("");
                  }
                }}
              >
                {command.label}
              </button>
              {command.disabled && command.reason && (
                <p className="workspace-command-reason">{command.reason}</p>
              )}
            </div>
          ))}
        </div>
        {failure && (
          <p role="alert" className="ui-operation-error">
            {failure} Try the action again.
          </p>
        )}
        {selected?.id === "more" && <div data-install-slot="" />}
        {compact && (
          <button
            type="button"
            className="text-button"
            onClick={() => closeGroup(true)}
          >
            Back to menu
          </button>
        )}
      </dialog>
    </>
  );
}
