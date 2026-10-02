import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadBookLibrary,assembleBooks} from '../dist/books.mjs';

const dist=new URL('../dist/',import.meta.url),worker=await readFile(new URL('sw.js',dist),'utf8');
const assets=JSON.parse(worker.match(/const ASSETS=(\[[\s\S]*?\]);/)[1]);
const cacheName='wfrp-ledger-offline-'+JSON.parse(worker.match(/const CACHE=CACHE_PREFIX\+("[^"]+");/)[1]);
const base='https://ledger.example/';
async function harness({failPath}={}){
 const events={},stores=new Map();let online=true,claims=0,skips=0;
 const key=x=>typeof x==='string'?x:x.url;
 async function fetchAsset(request){
  const url=new URL(key(request));if(!online||url.pathname===failPath)throw Error('Offline');
  const path=url.pathname.slice(1);return new Response(await readFile(new URL(path,dist)),{headers:{'Content-Type':path.endsWith('.pdf')?'application/pdf':'application/octet-stream'}});
 }
 const caches={keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),open:async name=>{
  if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);
  return {addAll:async requests=>{for(const request of requests)store.set(key(request),await fetchAsset(request));},match:async(request,{ignoreSearch}={})=>{
   const url=new URL(key(request));if(ignoreSearch)url.search='';return store.get(url.href)?.clone();
  }};
 }};
 const self={registration:{scope:base},clients:{claim:async()=>{claims++;}},skipWaiting:async()=>{skips++;},addEventListener:(name,handler)=>{events[name]=handler;}};
 vm.runInNewContext(worker,{self,caches,Request,URL,fetch:fetchAsset});
 async function lifecycle(name,data){let promise;events[name]({data,waitUntil:p=>{promise=p;}});await promise;}
 async function request(path,{method='GET',mode='cors'}={}){let promise;events.fetch({request:{url:new URL(path,base).href,method,mode},respondWith:p=>{promise=p;}});return promise&&await promise;}
 return {stores,lifecycle,request,offline:()=>{online=false;},get claims(){return claims;},get skips(){return skips;}};
}

test('PWA manifest, icons and every startup dependency are included in the offline version',async()=>{
 const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',dist)));
 assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');
 for(const size of [192,512])assert.ok(manifest.icons.some(x=>x.sizes===`${size}x${size}`&&x.purpose==='any'));
 assert.ok(manifest.icons.some(x=>x.purpose==='maskable'));
 for(const icon of manifest.icons){
  assert.ok(assets.includes(icon.src));const png=await readFile(new URL(icon.src,dist));
  const size=Number(icon.sizes.split('x')[0]);assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);
 }
 for(const path of assets.filter(x=>/\.(mjs|js)$/.test(x))){
  const source=await readFile(new URL(path,dist),'utf8');
  for(const match of source.matchAll(/from ['"](\.[^'"]+)['"]/g)){
   const dependency=new URL(match[1],new URL(path,base)).pathname.slice(1);assert.ok(assets.includes(dependency),`${path} requires ${dependency}`);
  }
 }
 assert.ok(assets.includes('assets/character-sheet.pdf'));assert.ok(assets.includes('data/sheet-fields.json'));
 const hash=createHash('sha256').update(await readFile(new URL('../scripts/service-worker.template.js',import.meta.url)));
 for(const path of assets)hash.update(path).update('\0').update(await readFile(new URL(path,dist)));
 assert.equal(cacheName,'wfrp-ledger-offline-'+hash.digest('hex').slice(0,20),'Regenerate sw.js after changing assets');
});

test('a complete offline install serves navigation, versioned modules, rules and the actual PDF without a network',async()=>{
 const h=await harness();await h.lifecycle('install');h.offline();
 const home=await h.request('/?verify=1',{mode:'navigate'});assert.match(await home.text(),/manifest.webmanifest/);
 assert.match(await (await h.request('/rules.mjs?v=patron-1')).text(),/export/);
 assert.equal(JSON.parse(await (await h.request('/data/careers.json')).text()).length,64);
 assert.ok((await (await h.request('/assets/character-sheet.pdf')).arrayBuffer()).byteLength>12000000);
 assert.equal(await h.request('/unknown',{mode:'navigate'}),undefined);
 assert.equal(await h.request('https://other.example/rules.mjs'),undefined);
 assert.equal(await h.request('/data/species.json',{method:'POST'}),undefined);
});

test('updates wait for the user; activation removes only old ledger caches',async()=>{
 const h=await harness();h.stores.set('another-app',new Map());h.stores.set('wfrp-ledger-offline-old',new Map());
 await h.lifecycle('install');assert.equal(h.skips,0);
 await h.lifecycle('message',{type:'unrelated'});assert.equal(h.skips,0);
 await h.lifecycle('message',{type:'APPLY_UPDATE'});assert.equal(h.skips,1);
 await h.lifecycle('activate');assert.equal(h.claims,1);assert.ok(h.stores.has(cacheName));assert.ok(h.stores.has('another-app'));assert.ok(!h.stores.has('wfrp-ledger-offline-old'));
});

test('the real book loader can assemble installed books entirely from offline assets',async()=>{
 const h=await harness();await h.lifecycle('install');h.offline();
 const library=await loadBookLibrary(async url=>{
  const response=await h.request(url.href);assert.ok(response,`Missing cached book data ${url}`);return response.json();
 },new URL('data/books/index.json',base));
 const R=assembleBooks(library);assert.equal(R.careers.length,64);assert.equal(R.weapons.length,50);assert.equal(R.books[0].id,'core');
 for(const {manifest}of library.packs)assert.ok(assets.includes(`data/books/${manifest.id}/manifest.json`));
});

test('a failed download cannot leave a partially prepared offline version',async()=>{
 const h=await harness({failPath:'/assets/character-sheet.pdf'});h.stores.set('wfrp-ledger-offline-old',new Map());
 await assert.rejects(h.lifecycle('install'),/Offline/);assert.ok(!h.stores.has(cacheName));assert.ok(h.stores.has('wfrp-ledger-offline-old'));
});
