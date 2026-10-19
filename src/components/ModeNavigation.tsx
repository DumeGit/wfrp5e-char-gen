"use client";
import Link from "next/link";

export type CreatorMode = "player" | "gm" | "marijan" | "manager";
export function ModeNavigation({
  mode,
  verify = false,
}: {
  mode: CreatorMode;
  verify?: boolean;
}) {
  const query = verify ? "?verify=1" : "";
  return (
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
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
