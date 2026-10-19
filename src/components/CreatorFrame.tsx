"use client";
import { useLayoutEffect, type ReactNode } from "react";
import Link from "next/link";
import type { CreatorMode } from "./ModeNavigation";
import { ReferenceSearch } from "../features/reference-search/ReferenceSearch";

const modes = {
  player: {
    theme: "black-banner",
    color: "#251c17",
    name: "The Character Ledger",
    caption: "FIFTH EDITION · THE MUSTER ROLL",
    oath: "BY INK AND OATH",
  },
  gm: {
    theme: "moonlit-vellum",
    color: "#122136",
    name: "The Bestiary Workshop",
    caption: "FIFTH EDITION · THE MUSTER ROLL",
    oath: "BY INK AND OATH",
  },
  marijan: {
    theme: "ash-vellum",
    color: "#18181b",
    name: "Marijan Mode",
    caption: "FIFTH EDITION · UNRESTRICTED CREATION",
    oath: "YOUR WILL. YOUR WORLD.",
  },
};
export function CreatorFrame({
  mode,
  children,
}: {
  mode: CreatorMode;
  children: ReactNode;
}) {
  const config = modes[mode];
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = config.theme;
    document.documentElement.dataset.mode = mode;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", config.color);
  }, [config, mode]);
  return (
    <div data-mode={mode} data-theme={config.theme}>
      <a className="skip-link" href="#creator-main">
        Skip to editor
      </a>
      <header className="masthead">
        <div className="masthead-art" aria-hidden="true" />
        <div className="banner-atmosphere" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <i key={n} style={{ "--particle": n } as React.CSSProperties} />
          ))}
        </div>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <img
              className="ledger-emblem"
              src="/assets/ledger-emblem.svg"
              alt=""
              width="128"
              height="144"
            />
          </span>
          <div className="brand-title">
            <span className="brand-world">UNOFFICIAL · WFRP FIFTH EDITION</span>
            <strong>{config.name}</strong>
            <small>{config.caption}</small>
          </div>
        </div>
        <div className="masthead-actions">
          <span className="edition">{config.oath}</span>
          <div id="compact-tools" />
        </div>
        <ReferenceSearch />
      </header>
      <div id="app">{children}</div>
      <footer className="site-notice" aria-label="Project information">
        <p>
          <strong>Unofficial companion.</strong> Not affiliated with or endorsed
          by Games Workshop or Cubicle 7.
        </p>
        <nav aria-label="About this project">
          <Link href="/legal/#credits" prefetch={false}>
            Credits &amp; rights
          </Link>
          <Link href="/legal/#privacy" prefetch={false}>
            Privacy
          </Link>
          <Link href="/legal/#contact" prefetch={false}>
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
}
