"use client";
import { COMPACT_SHELL_QUERY } from "../../engine/responsive.mjs";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { getPlayerStore } from "./store";
import { CreatorMenu } from "../../components/CreatorMenu";
import { HistoryControls } from "../../components/HistoryControls";
import { ActionExecutor } from "../../components/AsyncActionButton";

type PlayerStore = Awaited<ReturnType<typeof getPlayerStore>>;
export default function PlayerCreator() {
  const [store, setStore] = useState<PlayerStore | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    getPlayerStore(new URLSearchParams(location.search).has("verify")).then(
      (value: PlayerStore) => {
        if (alive) setStore(value);
      },
      (reason: Error) => {
        if (alive) setError(reason.message);
      },
    );
    return () => {
      alive = false;
    };
  }, []);
  if (error)
    return (
      <main id="creator-main" className="panel">
        <h1>Cannot open the creator</h1>
        <p role="alert">{error}</p>
        <button
          onClick={() => {
            setError("");
            void getPlayerStore(
              new URLSearchParams(location.search).has("verify"),
            ).then(setStore, (reason: Error) => setError(reason.message));
          }}
        >
          Try again
        </button>
      </main>
    );
  return store ? (
    <PlayerSession store={store} />
  ) : (
    <main id="creator-main" className="panel" aria-busy="true">
      <h1>Opening the Character Ledger…</h1>
      <p role="status">Loading the creator and reviewed books.</p>
    </main>
  );
}
function PlayerSession({ store }: { store: PlayerStore }) {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false),
    [slot, setSlot] = useState<Element | null>(null);
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const [historySlot, setHistorySlot] = useState<Element | null>(null);
  useLayoutEffect(() => {
    setHistorySlot(
      root.current?.querySelector(
        compact ? ".mobile-workspace-bar" : "[data-player-history-slot]",
      ) ?? null,
    );
  }, [compact, state.revision]);
  useEffect(() => {
    const media = matchMedia(COMPACT_SHELL_QUERY);
    const update = () => {
      setCompact(media.matches);
      if (!media.matches) setMenuOpen(false);
    };
    update();
    media.addEventListener("change", update);
    setSlot(document.getElementById("compact-menu"));
    const persist = () => store.persist();
    window.addEventListener("wfrp-before-update", persist);
    const toggle = (event: Event) => store.toggle(event);
    const ownedRoot = root.current;
    ownedRoot?.addEventListener("toggle", toggle, true);
    const change = (event: Event) => {
      const type = (event.target as HTMLInputElement).type;
      if (type !== "checkbox" && type !== "radio")
        store.dispatch("change", event);
    };
    ownedRoot?.addEventListener("change", change);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("wfrp-before-update", persist);
      ownedRoot?.removeEventListener("toggle", toggle, true);
      ownedRoot?.removeEventListener("change", change);
      store.cancelPending();
    };
  }, [store]);
  useEffect(() => {
    if (state.modal && !dialog.current?.open) dialog.current?.showModal();
    if (!state.modal && dialog.current?.open) dialog.current.close();
  }, [state.modal]);
  const click = (event: React.MouseEvent) => {
    if ((event.target as Element).closest("[data-action]"))
      store.dispatch("click", event);
  };
  async function modalAction(event: React.MouseEvent) {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      "[data-action]",
    );
    if (!button || busy) return;
    if (button.dataset.action === "close-dialog") {
      dialog.current?.close();
      return;
    }
    setBusy(true);
    setFailure("");
    try {
      await store.action(button);
    } catch (reason: any) {
      setFailure(reason.message);
    } finally {
      setBusy(false);
    }
  }
  function filteredBody(node: ReactNode): ReactNode {
    if (!isValidElement(node)) return node;
    const element = node as ReactElement<any>,
      props = element.props;
    const query = state.modal?.query || "";
    return cloneElement(
      element,
      {
        ...(props["data-dialog-row"] !== undefined
          ? {
              hidden:
                !!query && !String(props["data-dialog-row"]).includes(query),
            }
          : {}),
      },
      ...Children.toArray(props.children).map(filteredBody),
    );
  }
  return (
    <div
      ref={root}
      onClick={click}
      onInput={(event) => store.dispatch("input", event)}
      onChange={(event) => {
        const type = (event.target as HTMLInputElement).type;
        if (type === "checkbox" || type === "radio")
          store.dispatch("change", event);
      }}
      onKeyDown={(event) => store.dispatch("keydown", event)}
      onBlur={() => store.breakGroup()}
    >
      <ActionExecutor value={store.action}>{state.node}</ActionExecutor>
      {historySlot &&
        createPortal(
          <HistoryControls
            canUndo={state.history.canUndo}
            canRedo={state.history.canRedo}
          />,
          historySlot,
        )}
      {compact &&
        slot &&
        createPortal(
          <button
            className="mobile-menu-launcher quiet"
            aria-label="Open creator menu"
            aria-haspopup="dialog"
            aria-controls="creator-menu"
            onClick={() => setMenuOpen(true)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>,
          slot,
        )}
      {compact && (
        <CreatorMenu
          mode="player"
          verify={new URLSearchParams(location.search).has("verify")}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          status="Saved automatically on this device"
        >
          <button className="quiet" data-action="save-file">
            Save character
          </button>
          <button className="quiet" data-action="load-file">
            Load character
          </button>
          <button className="quiet" data-action="new">
            New character
          </button>
          <span data-install-slot="" />
          <button className="quiet" data-action="sources">
            Sources &amp; decisions
          </button>
          <button className="quiet" data-action="books">
            Choose books
          </button>
        </CreatorMenu>
      )}
      <dialog
        id="creator-dialog"
        ref={dialog}
        className="creator-dialog react-dialog"
        aria-labelledby="creator-dialog-title"
        onClose={() => store.closeDialog()}
        onClick={(event) => {
          event.stopPropagation();
          void modalAction(event);
        }}
        onInput={(event) => store.dialogInput(event)}
      >
        <div className="dialog-heading">
          <h2 id="creator-dialog-title">{state.modal?.title}</h2>
          <button
            type="button"
            className="quiet"
            data-action="close-dialog"
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>
        <div id="creator-dialog-body" aria-busy={busy}>
          {filteredBody(state.modal?.body)}
        </div>
        {failure && (
          <p role="alert" className="ui-operation-error">
            Could not complete this action. Try again using the same button.{" "}
            {failure}
          </p>
        )}
      </dialog>
      <div id="toast" className="toast" role="status" aria-live="polite">
        {state.notice}
      </div>
    </div>
  );
}
