import {rawGearSlots,rolledName,coinValue} from './inventory.mjs';
import {equipmentSize} from './equipment-sizing.mjs';
// Listed prices and Availability from the supplied Consumer Guide, pp. 301, 303, 307, 312–315.
// Other portable goods are taken from the extracted gear table, pp. 308–311, 316.
const PAGE_CATEGORIES={308:'Packs and clothing',309:'Food and drink',310:'Tools and kits',311:'Books and documents',316:'Miscellaneous'};
const CACHE=new WeakMap();
export function priceInPennies(price){if(typeof price!=='string'||/^(Varies|n\/a)$/i.test(price.trim()))return null;const s=price.replace(/[–—−]/g,'-').trim(),gc=s.match(/(\d+)\s*GC/),sh=s.match(/(\d+|-)\/(\d+|-)/),d=s.match(/(\d+)d\b/);if(!gc&&!sh&&!d)return null;const sum=Number(gc?.[1]||0)*240+Number(sh?.[1]==='-'?0:sh?.[1]||0)*12+Number(sh?.[2]==='-'?0:sh?.[2]||0)+Number(d?.[1]||0);return Number.isInteger(sum)&&sum>=0?sum:null;}
export function formatMoney(pennies){if(!Number.isInteger(pennies)||pennies<0)return '—';const gc=Math.floor(pennies/240),ss=Math.floor(pennies%240/12),d=pennies%12;return [gc?`${gc} GC`:'',ss?`${ss}/${d||'–'}`:d&&gc?`–/${d}`:'',!gc&&!ss?`${d}d`:''].filter(Boolean).join(' ')||'0d';}
export function marketCatalog(R,s){
 let listed=CACHE.get(R);if(!listed){listed=[...(R.gear||[]).map(x=>({...x,category:x.category||(x.source?.book==='core'?PAGE_CATEGORIES[x.page]:null)||'Trappings'})),...(R.market||[])].filter(x=>priceInPennies(x.price)!==null).map(x=>({...x,id:x.source?.book!=='core'&&x.id?x.id:`${x.page}:${x.name}`,pennies:priceInPennies(x.price)}));CACHE.set(R,listed);}
 if(!s)return listed;
 return listed.map(x=>{const size=equipmentSize(R,s,x.name,x),pennies=x.pennies*size.multiplier;return {...x,pennies,price:size.multiplier===1?x.price:formatMoney(pennies),enc:size.unresolved?null:x.enc===null?null:x.enc*size.multiplier,sizeNote:size.note,sizeUnresolved:!!size.unresolved,useUnresolved:!!size.useUnresolved};});
}
export function purchaseItem(R,p){const legacy=p.id?.startsWith('313:')?`312:${p.id.slice(4)}`:p.id;return marketCatalog(R).find(x=>x.id===p.id)||marketCatalog(R).find(x=>x.id===legacy&&x.category==='Animals and vehicles');}
export function purse(R,s){const rolled=s.wealth?Number(s.wealth.amount)*(s.wealth.currency==='gold crowns'?240:s.wealth.currency==='silver shillings'?12:1):0,grants=rawGearSlots(R,s).reduce((n,x)=>n+coinValue(rolledName(s,x)),0),start=rolled+grants,spent=(s.purchases||[]).reduce((n,x)=>n+(x.pennies??purchaseItem(R,x)?.pennies??0),0),remaining=start-spent;return {rolled,grants,start,spent,remaining,coins:{gc:Math.floor(Math.max(0,remaining)/240),ss:Math.floor(Math.max(0,remaining)%240/12),d:Math.max(0,remaining)%12}};}
export function buyTrapping(R,s,id){const item=marketCatalog(R,s).find(x=>x.id===id);if(!item)throw Error('Choose a Trapping with a listed book price.');if(item.sizeUnresolved||item.useUnresolved)throw Error(item.sizeNote);if(!s.wealth)throw Error('Roll starting wealth first.');if(item.pennies>purse(R,s).remaining)throw Error(`Not enough money: ${item.name} costs ${item.price}.`);(s.purchases??=[]).push({id,uid:globalThis.crypto.randomUUID(),pennies:item.pennies});return item;}
