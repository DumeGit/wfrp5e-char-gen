import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { assembleBooks } from "../src/engine/books.mjs";
import { loadBookBundle } from "../src/engine/book-bundle.mjs";
import { offlineVersion, exportedRoutes } from "../scripts/build-pwa.mjs";

const output = new URL("../out/", import.meta.url),
  worker = await readFile(new URL("sw.js", output), "utf8");
const assets = JSON.parse(
  worker.match(/const ASSETS\s*=\s*(\[[\s\S]*?\]);/)[1],
);
const cacheName =
  "wfrp-ledger-offline-" +
  JSON.parse(
    worker.match(/const CACHE\s*=\s*CACHE_PREFIX\s*\+\s*("[^"]+");/)[1],
  );
const base = "https://ledger.example/";
async function harness({ failPath } = {}) {
  const events = {},
    stores = new Map();
  let online = true,
    claims = 0,
    skips = 0;
  const key = (x) => (typeof x === "string" ? x : x.url);
  async function fetchAsset(request) {
    const url = new URL(key(request));
    if (!online || url.pathname === failPath) throw Error("Offline");
    const file = url.pathname.slice(1);
    return new Response(await readFile(new URL(file, output)), {
      headers: {
        "Content-Type": file.endsWith(".pdf")
          ? "application/pdf"
          : file.endsWith(".txt") || file.endsWith(".rsc")
            ? "text/x-component"
            : file.endsWith(".html")
              ? "text/html"
              : "application/octet-stream",
      },
    });
  }
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        addAll: async (requests) => {
          for (const request of requests)
            store.set(key(request), await fetchAsset(request));
        },
        match: async (request) => store.get(key(request))?.clone(),
      };
    },
  };
  const self = {
    registration: { scope: base },
    clients: {
      claim: async () => {
        claims++;
      },
    },
    skipWaiting: async () => {
      skips++;
    },
    addEventListener: (name, handler) => {
      events[name] = handler;
    },
  };
  vm.runInNewContext(worker, { self, caches, Request, URL, fetch: fetchAsset });
  async function lifecycle(name, data) {
    let promise;
    events[name]({
      data,
      waitUntil: (p) => {
        promise = p;
      },
    });
    await promise;
  }
  async function request(
    file,
    { method = "GET", mode = "cors", headers = {} } = {},
  ) {
    let promise;
    events.fetch({
      request: {
        url: new URL(file, base).href,
        method,
        mode,
        headers: new Headers(headers),
      },
      respondWith: (p) => {
        promise = p;
      },
    });
    return promise && (await promise);
  }
  return {
    stores,
    lifecycle,
    request,
    offline: () => {
      online = false;
    },
    get claims() {
      return claims;
    },
    get skips() {
      return skips;
    },
  };
}

test("PWA preserves manifest identity, icons and every production dependency", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("manifest.webmanifest", output)),
  );
  assert.equal(manifest.id, "./");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.start_url, "./");
  for (const size of [192, 512])
    assert.ok(
      manifest.icons.some(
        (x) => x.sizes === `${size}x${size}` && x.purpose === "any",
      ),
    );
  assert.ok(manifest.icons.some((x) => x.purpose === "maskable"));
  for (const icon of manifest.icons) {
    assert.ok(assets.includes(icon.src));
    const png = await readFile(new URL(icon.src, output));
    const size = Number(icon.sizes.split("x")[0]);
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
  for (const file of [
    "index.html",
    "bestiary/index.html",
    "marijan/index.html",
    "legal/index.html",
    "assets/character-sheet.pdf",
    "data/sheet-fields.json",
  ])
    assert.ok(assets.includes(file), file);
  for (const name of [
    "search-worker.mjs",
    "search-ranking.mjs",
    "search-filters.mjs",
  ]) {
    assert.ok(
      assets.includes("workers/" + name),
      "Offline worker dependency: " + name,
    );
    assert.equal(
      await readFile(new URL("workers/" + name, output), "utf8"),
      await readFile(new URL("../src/engine/" + name, import.meta.url), "utf8"),
      "Public worker uses canonical source: " + name,
    );
  }
  assert.ok(
    assets.some(
      (file) => file.startsWith("_next/static/") && file.endsWith(".js"),
    ),
    "Actual framework chunks are precached",
  );
  const template = await readFile(
    new URL("../scripts/service-worker.template.js", import.meta.url),
    "utf8",
  );
  assert.equal(
    cacheName,
    "wfrp-ledger-offline-" + (await offlineVersion(output, assets, template)),
    "Regenerate sw.js after changing final output",
  );
  assert.ok(!assets.some((file) => /^(?:content|src|scripts)\//.test(file)));
});

test("a complete offline install serves routes, data and the actual PDF without a network", async () => {
  const h = await harness();
  await h.lifecycle("install");
  h.offline();
  for (const path of [
    "/?verify=1",
    "/bestiary/?verify=1",
    "/marijan/?verify=1",
    "/legal/",
  ])
    assert.match(
      await (await h.request(path, { mode: "navigate" })).text(),
      /manifest.webmanifest/,
    );
  const bundle = JSON.parse(
    await (await h.request("/data/book-library.json?v=cache-test")).text(),
  );
  assert.equal(
    bundle.packs.find((p) => p.manifest.id === "core").data.careers.length,
    64,
  );
  assert.ok(
    (await (await h.request("/assets/character-sheet.pdf")).arrayBuffer())
      .byteLength > 12000000,
  );
  assert.equal(await h.request("/unknown", { mode: "navigate" }), undefined);
  assert.equal(await h.request("https://other.example/index.html"), undefined);
  assert.equal(
    await h.request("/data/species.json", { method: "POST" }),
    undefined,
  );
});

test("router payloads never receive route HTML or collide with navigation queries", async () => {
  const h = await harness();
  await h.lifecycle("install");
  h.offline();
  for (const [route, { document, payload }] of Object.entries(
    exportedRoutes(assets),
  )) {
    if (!payload) continue;
    const url = "/" + route;
    const expected = await readFile(new URL(payload, output), "utf8");
    for (const [suffix, headers] of [
      ["?_rsc=one", {}],
      ["?_rsc=two&verify=1", {}],
      ["?verify=1", { RSC: "1" }],
    ]) {
      const response = await h.request(url + suffix, { headers });
      assert.equal(await response.text(), expected);
      assert.match(response.headers.get("Content-Type"), /text\/x-component/);
    }
    const html = await h.request(url + "?verify=1", { mode: "navigate" });
    assert.equal(
      await html.text(),
      await readFile(new URL(document, output), "utf8"),
    );
  }
  assert.equal(
    await h.request("/unknown?_rsc=one", { headers: { RSC: "1" } }),
    undefined,
  );
  assert.equal(
    await h.request("/gm.html?_rsc=one", { headers: { RSC: "1" } }),
    undefined,
    "Compatibility redirects are documents, not router payloads",
  );
});

test("updates wait for the user and retain only one previous build for still-open immutable chunks", async () => {
  const h = await harness();
  h.stores.set("another-app", new Map());
  h.stores.set("wfrp-ledger-offline-obsolete", new Map());
  h.stores.set(
    "wfrp-ledger-offline-previous",
    new Map([
      [
        base + "_next/static/chunks/previous-hash.js",
        new Response("previous immutable chunk"),
      ],
      [base + "index.html", new Response("stale HTML")],
    ]),
  );
  await h.lifecycle("install");
  assert.equal(h.skips, 0);
  await h.lifecycle("message", { type: "unrelated" });
  assert.equal(h.skips, 0);
  await h.lifecycle("message", { type: "APPLY_UPDATE" });
  assert.equal(h.skips, 1);
  await h.lifecycle("activate");
  assert.equal(h.claims, 1);
  assert.ok(h.stores.has(cacheName));
  assert.ok(h.stores.has("another-app"));
  assert.ok(!h.stores.has("wfrp-ledger-offline-obsolete"));
  assert.ok(h.stores.has("wfrp-ledger-offline-previous"));
  h.offline();
  assert.equal(
    await (await h.request("/_next/static/chunks/previous-hash.js")).text(),
    "previous immutable chunk",
  );
  assert.notEqual(
    await (await h.request("/", { mode: "navigate" })).text(),
    "stale HTML",
  );
});

test("the real book loader assembles installed books entirely from offline assets", async () => {
  const h = await harness();
  await h.lifecycle("install");
  h.offline();
  const library = await loadBookBundle(
    async (url) => {
      const response = await h.request(
        typeof url === "string" ? url : url.href,
      );
      assert.ok(response, `Missing cached data ${url}`);
      return response.json();
    },
    new URL("data/book-library.json", base),
  );
  const R = assembleBooks(library);
  assert.equal(R.careers.length, 64);
  assert.equal(R.weapons.length, 50);
  assert.equal(R.books[0].id, "core");
  assert.ok(assets.includes("data/book-library.json"));
});

test("a failed download cannot leave a partially prepared offline version", async () => {
  const h = await harness({ failPath: "/assets/character-sheet.pdf" });
  h.stores.set("wfrp-ledger-offline-previous", new Map());
  await assert.rejects(h.lifecycle("install"), /Offline/);
  assert.ok(!h.stores.has(cacheName));
  assert.ok(h.stores.has("wfrp-ledger-offline-previous"));
});
