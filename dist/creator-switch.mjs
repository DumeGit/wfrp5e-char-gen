export function creatorSwitch(active, verification = false) {
  const query = verification ? "?verify=1" : "";
  return `<nav class="creator-switch" aria-label="Creator"><a href="./${query}" ${active === "player" ? 'aria-current="page"' : ""}>Player character</a><a href="gm.html${query}" ${active === "gm" ? 'aria-current="page"' : ""}>NPC &amp; creature</a></nav>`;
}
