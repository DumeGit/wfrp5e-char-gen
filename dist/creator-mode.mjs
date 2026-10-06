// Header navigation remains available during book setup and at every viewport.
if (new URL(location.href).searchParams.has("verify")) {
  for (const link of document.querySelectorAll(".creator-tool-switch a")) {
    const url = new URL(link.href);
    url.searchParams.set("verify", "1");
    link.href = url.href;
  }
}
