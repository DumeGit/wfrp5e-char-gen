import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../styles/styles.css";
import "../styles/workspace.css";
import "../styles/book-search.css";
import "../styles/design-tokens.css";
import "../styles/design-system.css";
import "../styles/gm/style.css";
import "../styles/marijan/style.css";
import "../styles/mobile-shell.css";
import "../styles/interface.css";
import "../styles/review-sheet.css";
import "../styles/site-notices.css";
import "../styles/react-shell.css";
import { PwaControls } from "../components/PwaControls";

export const metadata: Metadata = {
  title: "The Character Ledger · Unofficial WFRP companion",
  description:
    "An independent, unofficial Fifth Edition character creator with recorded dice and complete creation records.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/assets/ledger-emblem.svg", apple: "/assets/icon-180.png" },
  appleWebApp: {
    capable: true,
    title: "Character Ledger",
    statusBarStyle: "default",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#251c17",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Extensions can add body attributes before React hydrates. */}
      <body suppressHydrationWarning>
        {children}
        <PwaControls />
      </body>
    </html>
  );
}
