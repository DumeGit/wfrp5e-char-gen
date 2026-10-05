import test from "node:test";
import assert from "node:assert/strict";
import { chapterHeading } from "../dist/design-system.mjs";

test("Decorated character headings preserve the accessible name without interpreting user markup", () => {
  const html = chapterHeading('"<img src=x onerror=alert(1)> & Walther');
  assert.ok(!html.includes("<img"));
  assert.match(
    html,
    /aria-label="&quot;&lt;img src=x onerror=alert\(1\)&gt; &amp; Walther"/,
  );
});

test("Decorative initials keep combining accents and emoji as complete characters", () => {
  assert.match(chapterHeading("E\u0301mil"), /<span>E\u0301<\/span>/);
  assert.match(chapterHeading("👩‍🚀 Celestial"), /<span>👩‍🚀<\/span>/);
});
