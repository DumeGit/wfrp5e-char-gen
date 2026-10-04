const CACHE_PREFIX='wfrp-ledger-offline-';
const CACHE=CACHE_PREFIX+"3d9330c861df431e8d3a";
const ASSETS=[
 "app.js",
 "archives-iii-ui.mjs",
 "archives-iii.mjs",
 "archives-ui.mjs",
 "assets/LICENSE-pdf-lib.md",
 "assets/character-sheet.pdf",
 "assets/icon-180.png",
 "assets/icon-192.png",
 "assets/icon-512.png",
 "assets/icon-maskable-512.png",
 "assets/pdf-lib.min.js",
 "astrology.mjs",
 "background.mjs",
 "book-ui.mjs",
 "books.mjs",
 "career-variants.mjs",
 "creator-ui.mjs",
 "cults.mjs",
 "data/background.json",
 "data/books/archives-i/careers.json",
 "data/books/archives-i/manifest.json",
 "data/books/archives-i/market.json",
 "data/books/archives-i/origins.json",
 "data/books/archives-i/rules.json",
 "data/books/archives-i/talents.json",
 "data/books/archives-i/weapons.json",
 "data/books/archives-ii/armour.json",
 "data/books/archives-ii/astrology.json",
 "data/books/archives-ii/background.json",
 "data/books/archives-ii/careers.json",
 "data/books/archives-ii/manifest.json",
 "data/books/archives-ii/market.json",
 "data/books/archives-ii/rules.json",
 "data/books/archives-ii/species.json",
 "data/books/archives-ii/spells.json",
 "data/books/archives-ii/tables.json",
 "data/books/archives-ii/talents.json",
 "data/books/archives-ii/weapons.json",
 "data/books/archives-iii-hedge/careers.json",
 "data/books/archives-iii-hedge/manifest.json",
 "data/books/archives-iii/cants.json",
 "data/books/archives-iii/careers.json",
 "data/books/archives-iii/manifest.json",
 "data/books/archives-iii/origins.json",
 "data/books/archives-iii/rules.json",
 "data/books/archives-iii/spells.json",
 "data/books/core/armour.json",
 "data/books/core/config.json",
 "data/books/core/manifest.json",
 "data/books/core/market.json",
 "data/books/core/tables.json",
 "data/books/core/weapons.json",
 "data/books/index.json",
 "data/books/rough-nights/background.json",
 "data/books/rough-nights/cults.json",
 "data/books/rough-nights/manifest.json",
 "data/books/rough-nights/rules.json",
 "data/books/rough-nights/species.json",
 "data/books/rough-nights/tables.json",
 "data/books/rough-nights/talents.json",
 "data/books/up-in-arms/careers.json",
 "data/books/up-in-arms/excluded-equipment.json",
 "data/books/up-in-arms/manifest.json",
 "data/books/up-in-arms/market.json",
 "data/books/up-in-arms/origins.json",
 "data/books/up-in-arms/rules.json",
 "data/books/up-in-arms/spells.json",
 "data/books/up-in-arms/tables.json",
 "data/books/up-in-arms/talents.json",
 "data/books/up-in-arms/weapons.json",
 "data/books/winds-of-magic/careers.json",
 "data/books/winds-of-magic/duplicates.json",
 "data/books/winds-of-magic/gear.json",
 "data/books/winds-of-magic/manifest.json",
 "data/books/winds-of-magic/rules.json",
 "data/books/winds-of-magic/skills.json",
 "data/books/winds-of-magic/spells.json",
 "data/books/winds-of-magic/tables.json",
 "data/career-rolls.json",
 "data/careers.json",
 "data/gear.json",
 "data/sheet-fields.json",
 "data/skills.json",
 "data/source.json",
 "data/species.json",
 "data/spells.json",
 "data/talents.json",
 "equipment-sizing.mjs",
 "equipment.mjs",
 "export.mjs",
 "folio.mjs",
 "index.html",
 "inventory.mjs",
 "manifest.webmanifest",
 "market.mjs",
 "origins.mjs",
 "pwa.mjs",
 "regional-careers.mjs",
 "rules.mjs",
 "sources.mjs",
 "species-mechanics.mjs",
 "styles.css",
 "ui.mjs",
 "winds-of-magic-ui.mjs",
 "winds-of-magic.mjs"
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
