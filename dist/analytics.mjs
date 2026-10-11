import { inject } from "./assets/vercel-analytics.mjs";

export function analyticsEnabled(url) {
  if (!url || url.protocol !== "https:") return false;
  return (
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
    !url.hostname.endsWith(".localhost") &&
    !new URLSearchParams(url.search).has("verify")
  );
}

export function pageViewOnly(event) {
  if (event.type !== "pageview") return null;
  const url = new URL(event.url);
  url.search = "";
  url.hash = "";
  return { ...event, url: url.href };
}

if (analyticsEnabled(globalThis.location))
  inject({ mode: "production", beforeSend: pageViewOnly });
