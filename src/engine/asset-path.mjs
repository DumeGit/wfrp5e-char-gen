// Public files have stable application-root URLs; module URLs are bundle assets.
export function publicAsset(path) {
  if (
    typeof path !== "string" ||
    !path ||
    path.startsWith("/") ||
    path.includes("..") ||
    /[?#:\\]/.test(path)
  )
    throw Error("Expected a relative public asset path.");
  return "/" + path;
}
