import test from "node:test";
import assert from "node:assert/strict";
import { createInstallControl } from "../dist/install-control.mjs";

test("Rail redraws preserve install listeners and the installed visibility state", () => {
  const button = new EventTarget();
  button.hidden = false;
  let prompts = 0;
  button.addEventListener("click", () => prompts++);
  const mount = createInstallControl(button);
  const firstRail = [],
    nextRail = [];
  mount({ querySelector: () => ({ append: (node) => firstRail.push(node) }) });
  firstRail[0].dispatchEvent(new Event("click"));
  button.hidden = true; // appinstalled hides the existing browser control.
  mount({ querySelector: () => ({ append: (node) => nextRail.push(node) }) });
  assert.equal(nextRail[0], firstRail[0]);
  assert.equal(nextRail[0].hidden, true);
  nextRail[0].dispatchEvent(new Event("click"));
  assert.equal(prompts, 2);
  assert.doesNotThrow(() => mount({ querySelector: () => null }));
});
