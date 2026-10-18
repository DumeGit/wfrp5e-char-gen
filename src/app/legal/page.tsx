export const metadata = { title: "About & privacy · The Character Ledger" };
export default function LegalPage() {
  return (
    <main className="legal-page" id="main">
      {"\n      "}
      <a href="/">{"Back to Player creator"}</a>
      {"\n      "}
      <div className="legal-identity">
        {"\n        "}
        <img src="/assets/ledger-emblem.svg" width="52" height="52" alt="" />
        {"\n        "}
        <div>
          <p>{"Independent, unofficial companion"}</p>
          <h1>{"The Character Ledger"}</h1>
        </div>
        {"\n      "}
      </div>
      {"\n      "}
      <p>{"Project information updated 15 October 2026."}</p>
      {"\n      "}
      <nav aria-label="Project information">
        {"\n        "}
        <a href="#credits">{"Credits & rights"}</a>
        {"\n        "}
        <a href="#privacy">{"Privacy"}</a>
        {"\n        "}
        <a href="#contact">{"Contact"}</a>
        {"\n      "}
      </nav>
      {"\n      "}
      <section id="credits" aria-labelledby="credits-title">
        {"\n        "}
        <h2 id="credits-title">{"Credits & rights"}</h2>
        {"\n        "}
        <p>
          {
            "This is an independent, unofficial companion for Warhammer Fantasy Roleplay Fifth Edition. It is not affiliated with, endorsed by or approved by Games Workshop or Cubicle 7. Game and book names identify the material the tool supports; they do not imply sponsorship."
          }
        </p>
        {"\n        "}
        <p>
          {
            "Warhammer, Warhammer Fantasy Roleplay and associated names and settings belong to their respective rights holders, including Games Workshop Limited. Referenced publications are credited to their publishers, including Cubicle 7 Entertainment Ltd, and their authors and artists. In-app source references identify the relevant book and printed page."
          }
        </p>
        {"\n        "}
        <p>
          {
            "No ownership of the underlying game material is claimed. This notice does not grant permission to reproduce or distribute that material. Project source availability does not license third-party book content, artwork or the supplied character-sheet template."
          }
        </p>
        {"\n        "}
        <p>
          {
            "The ledger emblem and panel textures are drawn specifically for this project. Decorative banner illustrations were generated with AI using supplied visual references. Their provenance is documented in the project repository; this is not a statement of rights-holder approval or permission."
          }
        </p>
        {"\n        "}
        <h3>{"Software & fonts"}</h3>
        {"\n        "}
        <ul>
          {"\n          "}
          <li>
            {"PDF exports use pdf-lib. "}
            <a href="/assets/LICENSE-pdf-lib.md">
              {"pdf-lib MIT licence and copyright notice"}
            </a>
            {"."}
          </li>
          {"\n          "}
          <li>
            {
              "Cinzel, IM Fell and UnifrakturCook fonts are distributed under the SIL Open Font License. "
            }
            <a href="/assets/fonts/cinzel-OFL.txt">{"Cinzel notice"}</a>
            {", "}
            <a href="/assets/fonts/fell-OFL.txt">{"IM Fell notice"}</a>
            {", "}
            <a href="/assets/fonts/gothic-OFL.txt">{"UnifrakturCook notice"}</a>
            {"."}
          </li>
          {"\n        "}
        </ul>
        {"\n      "}
      </section>
      {"\n      "}
      <section id="privacy" aria-labelledby="privacy-title">
        {"\n        "}
        <h2 id="privacy-title">{"Privacy"}</h2>
        {"\n        "}
        <p>
          {
            "There is no Character Ledger account system or character database on a server. Drafts and preferences are saved in this browser on this device. The app also caches files through a service worker for offline use. These are functional storage features, not advertising or analytics cookies."
          }
        </p>
        {"\n        "}
        <p>
          {
            "Character generation and PDF export run in your browser. Save and Load use files you download to or select from your device; the app does not upload those character files. Clear this site's browser storage to remove local drafts, preferences and offline files. Download any backups you want to keep first."
          }
        </p>
        {"\n        "}
        <p>
          {
            "The app does not include Vercel Web Analytics, advertising trackers or analytics events. The site is hosted on Vercel, which receives the network information needed to deliver pages, such as IP address and request details, and may retain hosting and security logs. Removing the analytics integration does not remove hosting logs. See "
          }
          <a href="https://vercel.com/legal/privacy-policy" rel="noreferrer">
            {"Vercel's privacy policy"}
          </a>
          {" for its processing information."}
        </p>
        {"\n        "}
        <p>
          {
            "External links open services with their own privacy practices. In particular, a public GitHub issue is visible to others. Do not include private character files or sensitive personal information in an issue."
          }
        </p>
        {"\n      "}
      </section>
      {"\n      "}
      <section id="contact" aria-labelledby="contact-title">
        {"\n        "}
        <h2 id="contact-title">{"Contact"}</h2>
        {"\n        "}
        <p>
          {"The project maintainer can be reached through the "}
          <a
            href="https://github.com/DumeGit/wfrp5e-char-gen/issues"
            rel="noreferrer"
          >
            {"Character Ledger issue tracker on GitHub"}
          </a>
          {
            " for bugs, source corrections and rights enquiries. This is a public contact channel. For private matters, request a private contact method without posting sensitive information."
          }
        </p>
        {"\n      "}
      </section>
      {"\n    "}
    </main>
  );
}
