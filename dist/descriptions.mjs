// The wording is resolved during the build, alongside its profile. This module
// owns the shared presentation contract, not a second bank of descriptions.
export const descriptionNotice = (entry) =>
  entry.descriptionStatus === "reviewed"
    ? "Mechanical summary — consult the cited book for the full rule."
    : "Consult the cited book for full details and context.";
