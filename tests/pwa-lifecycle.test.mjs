import test from "node:test";
import assert from "node:assert/strict";
import { tsImport } from "tsx/esm/api";
const { connectPwa } = await tsImport(
  "../src/services/pwa.ts",
  import.meta.url,
);
class Tracked extends EventTarget {
  listeners = new Map();
  addEventListener(name, listener, options) {
    super.addEventListener(name, listener, options);
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name).add(listener);
  }
  removeEventListener(name, listener, options) {
    super.removeEventListener(name, listener, options);
    this.listeners.get(name)?.delete(listener);
  }
  get count() {
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
  }
}
function environment(t, { development = false, pending = false } = {}) {
  const originals = new Map(
    ["window", "document", "navigator"].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  const nodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = development ? "development" : "production";
  const media = Object.assign(new Tracked(), { matches: false });
  let registered = 0,
    updates = 0,
    reloads = 0,
    prompts = 0;
  const messages = [];
  const installing = Object.assign(new Tracked(), { state: "installing" });
  const waiting = { postMessage: (message) => messages.push(message) };
  const registration = Object.assign(new Tracked(), {
    active: {},
    waiting,
    installing,
    update: async () => {
      updates++;
    },
  });
  let finish;
  const registrationPromise = pending
    ? new Promise((resolve) => {
        finish = resolve;
      })
    : Promise.resolve(registration);
  const workers = Object.assign(new Tracked(), {
    ready: Promise.resolve(registration),
    register: async (url, options) => {
      registered++;
      assert.equal(url, "/sw.js");
      assert.equal(options.scope, "/");
      return registrationPromise;
    },
  });
  const window = Object.assign(new Tracked(), {
    matchMedia: () => media,
    location: {
      reload: () => {
        reloads++;
      },
    },
  });
  const document = Object.assign(new Tracked(), { visibilityState: "visible" });
  const navigator = { onLine: true, serviceWorker: workers };
  for (const [key, value] of Object.entries({ window, document, navigator }))
    Object.defineProperty(globalThis, key, { value, configurable: true });
  t.after(() => {
    for (const [key, descriptor] of originals)
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    if (nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = nodeEnv;
  });
  return {
    media,
    workers,
    window,
    document,
    registration,
    installing,
    messages,
    get registered() {
      return registered;
    },
    get updates() {
      return updates;
    },
    get reloads() {
      return reloads;
    },
    finish: () => finish?.(registration),
    assertDisposed() {
      for (const item of [
        media,
        workers,
        window,
        document,
        registration,
        installing,
      ])
        assert.equal(item.count, 0);
    },
  };
}
test("PWA lifecycle preserves explicit activation, root registration and removes all listeners on remount", async (t) => {
  const env = environment(t);
  const states = [];
  const service = connectPwa((state) => states.push(state));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(env.registered, 1);
  assert.equal(states.at(-1).ready, true);
  assert.equal(states.at(-1).updateAvailable, true);
  assert.deepEqual(env.messages, []);
  const prompt = new Event("beforeinstallprompt", { cancelable: true });
  let prompts = 0;
  prompt.prompt = async () => {
    prompts++;
  };
  env.window.dispatchEvent(prompt);
  assert.equal(prompt.defaultPrevented, true);
  assert.equal(await service.install(), true);
  assert.equal(await service.install(), false);
  assert.equal(prompts, 1);
  service.update();
  assert.deepEqual(env.messages, [{ type: "APPLY_UPDATE" }]);
  assert.equal(states.at(-1).applying, true);
  service.dispose();
  env.assertDisposed();
  const count = states.length;
  env.window.dispatchEvent(new Event("online"));
  env.workers.dispatchEvent(new Event("controllerchange"));
  assert.equal(states.length, count);
  assert.equal(env.updates, 0);
  assert.equal(env.reloads, 0);
  const second = connectPwa(() => {});
  await new Promise((resolve) => setImmediate(resolve));
  second.dispose();
  env.assertDisposed();
  assert.equal(env.registered, 2);
});
test("late registration completion cannot reconnect a disposed PWA service", async (t) => {
  const env = environment(t, { pending: true });
  const states = [];
  const service = connectPwa((state) => states.push(state));
  service.dispose();
  env.finish();
  await new Promise((resolve) => setImmediate(resolve));
  env.assertDisposed();
  assert.equal(states.length, 1);
});
test("development mode does not request a production offline worker", async (t) => {
  const env = environment(t, { development: true });
  const states = [];
  const service = connectPwa((state) => states.push(state));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(env.registered, 0);
  assert.equal(states.at(-1).development, true);
  service.dispose();
  env.assertDisposed();
});
