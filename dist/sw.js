const CACHE_PREFIX='wfrp-ledger-offline-';
const CACHE=CACHE_PREFIX+"002caaf7f7a4efb54a68";
const ASSETS=[
 "app.js",
 "assets/LICENSE-pdf-lib.md",
 "assets/character-sheet.pdf",
 "assets/icon-180.png",
 "assets/icon-192.png",
 "assets/icon-512.png",
 "assets/icon-maskable-512.png",
 "assets/pdf-lib.min.js",
 "background.mjs",
 "creator-ui.mjs",
 "data/background.json",
 "data/career-rolls.json",
 "data/careers.json",
 "data/gear.json",
 "data/sheet-fields.json",
 "data/skills.json",
 "data/source.json",
 "data/species.json",
 "data/spells.json",
 "data/talents.json",
 "equipment.mjs",
 "export.mjs",
 "folio.mjs",
 "index.html",
 "inventory.mjs",
 "manifest.webmanifest",
 "market.mjs",
 "pwa.mjs",
 "rules.mjs",
 "styles.css",
 "ui.mjs"
];
const ROOT=self.registration.scope;
const paths=new Set(ASSETS.map(path=>new URL(path,ROOT).pathname));

self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  try{
   const cache=await caches.open(CACHE);
   await cache.addAll(ASSETS.map(path=>new Request(new URL(path,ROOT),{cache:'reload'})));
  }catch(error){await caches.delete(CACHE);throw error;}
 })());
});

self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith(CACHE_PREFIX)&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
 })());
});

self.addEventListener('message',event=>{
 if(event.data?.type==='APPLY_UPDATE')event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url),root=new URL(ROOT);
 if(request.method!=='GET'||url.origin!==root.origin)return;
 const isHome=request.mode==='navigate'&&(url.pathname===root.pathname||url.pathname===new URL('index.html',ROOT).pathname);
 if(!isHome&&!paths.has(url.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const cached=await cache.match(isHome?new URL('index.html',ROOT).href:request,{ignoreSearch:true});
  return cached||fetch(request);
 })());
});
