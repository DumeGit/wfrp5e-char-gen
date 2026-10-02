import {rawGearSlots,rolledName,coinValue} from './inventory.mjs';
// Listed prices and Availability from the supplied Consumer Guide, pp. 301, 303, 307, 312–315.
// Other portable goods are taken from the extracted gear table, pp. 308–311, 316.
const EXTRA=[];
function add(category,page,rows){for(const line of rows.trim().split('\n')){const [name,price,enc,availability]=line.split('|');EXTRA.push({name,price,enc:enc==='—'?null:Number(enc),availability,page,category});}}
add('Melee weapons',301,`
Dagger|16/–|0|Common
Knife|8/–|0|Common
Hand Weapon|2 GC|1|Common
Sword|4 GC|1|Common
Net|6/–|1|Common
Knuckledusters|2/6|0|Common
Garrote (2H)|1/–|0|Rare
Cavalry Hammer (2H)|4 GC|3|Rare
Lance|1 GC|3|Rare
Buckler|1 GC|1|Common
Foil|5 GC|1|Scarce
Main Gauche|1 GC|0|Scarce
Rapier|5 GC|1|Scarce
Swordbreaker|1 GC 2/6|0|Rare
Flail|2 GC|1|Scarce
Grain Flail (2H)|5/–|2|Common
Military Flail (2H)|3 GC|3|Rare
Whip|5/–|1|Common
Halberd (2H)|2 GC|3|Common
Pike (2H)|18/–|4|Rare
Quarterstaff (2H)|3/–|2|Common
Spear (2H)|15/–|2|Common
Bastard Sword (2H)|10 GC|2|Scarce
Greataxe (2H)|4 GC|3|Scarce
Pick (2H)|2 GC|3|Common
Warhammer (2H)|4 GC|3|Scarce
Zweihänder (2H)|16 GC|3|Scarce`);
add('Ranged weapons',303,`
Blunderbuss (2H)|10 GC|2|Scarce
Handgun (2H)|16 GC|2|Scarce
Pistol|20 GC|0|Rare
Bow (2H)|4 GC|2|Common
Longbow (2H)|8 GC|3|Scarce
Shortbow (2H)|3 GC|1|Common
Crossbow (2H)|5 GC|2|Common
Crossbow Pistol|6 GC|0|Rare
Heavy Crossbow (2H)|8 GC|3|Scarce
Repeater Handgun (2H)|50 GC|3|Rare
Repeater Pistol|40 GC|1|Rare
Hochland Long Rifle (2H)|100 GC|3|Exotic
Bolas|10/–|0|Rare
Lasso (2H)|6/–|1|Common
Bomb|3 GC|0|Rare
Incendiary|1 GC|0|Scarce
Sling|1/–|0|Common
Staff Sling (2H)|4/–|2|Common
Javelin|10/6|1|Scarce
Throwing Axe|1 GC|1|Scarce
Throwing Knife|18/–|0|Scarce`);
add('Ammunition',303,`
Bullet and Powder (12)|3/3|0|Common
Improvised Shot and Powder|3d|0|Common
Small Shot and Powder (12)|3/3|0|Common
Arrow (12)|5/–|0|Common
Elf Arrow|6/–|0|Exotic
Bolt (12)|5/–|0|Common
Lead Bullet (12)|4d|0|Common
Stone Bullet (12)|1d|0|Common`);
add('Armour and shields',307,`
Shield|2 GC|2|Common
Large Shield|3 GC|3|Common
Leather Coif|2 GC|0|Common
Leather Jack|3 GC|1|Common
Leather Jerkin|2 GC 10/–|1|Common
Leather Leggings|3 GC|1|Common
Mail Chausses|10 GC|3|Scarce
Mail Coat|20 GC|3|Scarce
Mail Coif|6 GC|1|Scarce
Mail Shirt|16 GC|2|Common
Bracers|12 GC|2|Rare
Breastplate|15 GC|3|Scarce
Helm|5 GC|2|Rare
Open Helm|3 GC|1|Common
Plate Leggings|12 GC|3|Rare`);
add('Quick armour (optional)',307,`
Light Armour|8 GC|0|Common
Medium Armour|44 GC|4|Scarce
Heavy Armour|88 GC|10|Rare`);
add('Miscellaneous',316,`
Small Instrument|1 GC|0|Rare
Large Instrument|4 GC|2|Rare
Small Tent|1 GC 10/–|1|Scarce
Large Tent|6 GC|4|Scarce`);
add('Trade tools',312,`
Trade Tools|3 GC|1|Scarce
Workshop|80 GC|—|Rare`);
add('Animals and vehicles',312,`
Cart|20 GC|—|Common
Chicken|5d|1|Common
Coach|150 GC|—|Rare
Coracle|2 GC|6|Scarce
Destrier|600 GC|—|Scarce
Dog Collar|1/7|0|Common
Draught Horse|20 GC|—|Common
Homing Pigeon|1/–|1|Scarce
Hunting Dog|2 GC|—|Rare
Light Warhorse|150 GC|—|Common
Monkey|10 GC|2|Rare
Mule|10 GC|—|Common
Pony|40 GC|—|Common
Riding Horse|60 GC|—|Common
River Barge|225 GC|—|Rare
Row Boat|6 GC|—|Scarce
Saddle and Harness|6 GC|4|Common
Wagon|75 GC|—|Common
Worms (6)|1d|0|Common`);
add('Poisons',313,`
Adder root|5d|0|Scarce
Black lotus (leaves)|6/–|0|Exotic
Black lotus (sap)|20 GC|0|Exotic
Daemon’s tand|5d|0|Scarce
Dwarf bile|4/–|0|Exotic
Juck|1/–|0|Rare
Rat poison|4d|0|Common
Schlafenkraut|1/–|0|Rare
Spider spittle|3/–|0|Rare
Weirdroot|4/–|0|Rare`);
add('Herbs and remedies',314,`
Digestive Tonic|3/–|0|Common
Faxtoryll|15/–|0|Rare
Healing Poultice|12/–|0|Common
Nightshade|3 GC|0|Rare
Remedy (Malaise, Nausea, Pox, Wounded)|2/–|0|Common
Remedy (Coughs and Sneezes, Fever, Flux)|3/–|0|Common
Remedy (Blight, Buboes, Convulsions, Gangrene)|4/–|0|Common
Salwort|12/–|0|Common
Vitality Draught|18/–|0|Scarce`);
add('Prosthetics',315,`
Eyepatch|6d|0|Common
False Eye|1 GC|0|Rare
False Leg|16/–|2|Scarce
Gilded Nose|18/–|0|Scarce
Hook|3/4|1|Common
Wooden Teeth|10/–|0|Rare`);
// The prices for Magical Items on p. 315 are potential black-market *buyer*
// prices. The book says purchasing them costs more, without a fixed amount.

const PAGE_CATEGORIES={308:'Packs and clothing',309:'Food and drink',310:'Tools and kits',311:'Books and documents',316:'Miscellaneous'};
const CACHE=new WeakMap();
export function priceInPennies(price){if(typeof price!=='string'||/^(Varies|n\/a)$/i.test(price.trim()))return null;const s=price.replace(/[–—−]/g,'-').trim(),gc=s.match(/(\d+)\s*GC/),sh=s.match(/(\d+|-)\/(\d+|-)/),d=s.match(/(\d+)d\b/);if(!gc&&!sh&&!d)return null;const sum=Number(gc?.[1]||0)*240+Number(sh?.[1]==='-'?0:sh?.[1]||0)*12+Number(sh?.[2]==='-'?0:sh?.[2]||0)+Number(d?.[1]||0);return Number.isInteger(sum)&&sum>=0?sum:null;}
export function formatMoney(pennies){if(!Number.isInteger(pennies)||pennies<0)return '—';const gc=Math.floor(pennies/240),ss=Math.floor(pennies%240/12),d=pennies%12;return [gc?`${gc} GC`:'',ss?`${ss}/${d||'–'}`:d&&gc?`–/${d}`:'',!gc&&!ss?`${d}d`:''].filter(Boolean).join(' ')||'0d';}
export function marketCatalog(R){if(CACHE.has(R))return CACHE.get(R);const listed=[...(R.gear||[]).map(x=>({...x,category:PAGE_CATEGORIES[x.page]||'Trappings'})),...EXTRA].filter(x=>priceInPennies(x.price)!==null).map(x=>({...x,id:`${x.page}:${x.name}`,pennies:priceInPennies(x.price)}));CACHE.set(R,listed);return listed;}
export function purchaseItem(R,p){const legacy=p.id?.startsWith('313:')?`312:${p.id.slice(4)}`:p.id;return marketCatalog(R).find(x=>x.id===p.id)||marketCatalog(R).find(x=>x.id===legacy&&x.category==='Animals and vehicles');}
export function purse(R,s){const rolled=s.wealth?Number(s.wealth.amount)*(s.wealth.currency==='gold crowns'?240:s.wealth.currency==='silver shillings'?12:1):0,grants=rawGearSlots(R,s).reduce((n,x)=>n+coinValue(rolledName(s,x)),0),start=rolled+grants,spent=(s.purchases||[]).reduce((n,x)=>n+(x.pennies??purchaseItem(R,x)?.pennies??0),0),remaining=start-spent;return {rolled,grants,start,spent,remaining,coins:{gc:Math.floor(Math.max(0,remaining)/240),ss:Math.floor(Math.max(0,remaining)%240/12),d:Math.max(0,remaining)%12}};}
export function buyTrapping(R,s,id){const item=marketCatalog(R).find(x=>x.id===id);if(!item)throw Error('Choose a Trapping with a listed book price.');if(!s.wealth)throw Error('Roll starting wealth first.');if(item.pennies>purse(R,s).remaining)throw Error(`Not enough money: ${item.name} costs ${item.price}.`);(s.purchases??=[]).push({id,uid:globalThis.crypto.randomUUID(),pennies:item.pennies});return item;}
