"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export const ActionExecutor = createContext<
  ((element: HTMLElement) => Promise<void>) | null
>(null);
export function AsyncActionButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode },
) {
  const execute = useContext(ActionExecutor),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const active = useRef(true),
    pending = useRef(false),
    width = useRef(0);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  return (
    <>
      <button
        {...props}
        disabled={props.disabled || busy}
        style={{ ...props.style, ...(busy ? { minWidth: width.current } : {}) }}
        aria-busy={busy || undefined}
        onClick={async (event) => {
          if (!execute) return;
          event.stopPropagation();
          if (pending.current) return;
          const button = event.currentTarget;
          width.current = button.getBoundingClientRect().width;
          pending.current = true;
          setBusy(true);
          setError("");
          try {
            await execute(button);
          } catch (problem: any) {
            if (active.current) setError(problem.message);
          } finally {
            pending.current = false;
            if (active.current) setBusy(false);
          }
        }}
      >
        {busy ? "Preparing…" : props.children}
      </button>
      {error && (
        <p className="ui-operation-error" role="alert">
          Could not complete this action. Try again using the same button.{" "}
          <span>{error}</span>
        </p>
      )}
    </>
  );
}
