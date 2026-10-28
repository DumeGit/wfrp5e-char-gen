"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export type CreatorMode = "player" | "gm" | "marijan" | "manager";
export function ModeNavigation({
  mode,
  verify = false,
}: {
  mode: CreatorMode;
  verify?: boolean;
}) {
  const query = verify ? "?verify=1" : "";
  const disclosure = useRef<HTMLDetailsElement>(null);
  const names = {
    player: "Player character",
    gm: "NPC & creature",
    marijan: "Marijan Mode",
    manager: "Character manager",
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (
        disclosure.current &&
        !disclosure.current.contains(event.target as Node)
      )
        disclosure.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <details
      className="workspace-switcher"
      ref={disclosure}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          event.currentTarget.open = false;
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && disclosure.current?.open) {
          event.preventDefault();
          event.stopPropagation();
          disclosure.current.open = false;
          disclosure.current.querySelector("summary")?.focus();
        }
      }}
    >
      <summary>
        <span className="workspace-mode-mark" aria-hidden="true">
          ✦
        </span>
        <span>
          <small>Workspace</small>
          {names[mode]}
        </span>
        <span aria-hidden="true">⌄</span>
      </summary>
      <nav className="creator-switch" aria-label="Creator">
        {(
          [
            ["player", "/", "Player character"],
            ["gm", "/bestiary/", "NPC & creature"],
            ["marijan", "/marijan/", "Marijan Mode"],
            ["manager", "/manager/", "Character manager"],
          ] as const
        ).map(([id, href, label]) => (
          <Link
            key={id}
            href={href + query}
            prefetch={false}
            aria-current={mode === id ? "page" : undefined}
            onClick={(event) => {
              if (
                mode === id &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.shiftKey &&
                !event.altKey &&
                event.button === 0
              )
                event.preventDefault();
              if (disclosure.current) disclosure.current.open = false;
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
