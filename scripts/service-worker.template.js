const CACHE_PREFIX='wfrp-ledger-offline-';
const CACHE=CACHE_PREFIX+__VERSION__;
const ASSETS=__ASSETS__;
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
